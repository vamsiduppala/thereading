// ─────────────────────────────────────────────────────────────────────────────
// One Mentor turn: history in, grounded answer out.
//
// The loop is the whole feature. The model may only learn a fact about this chart by calling
// a tool, so a turn is: ask → run whatever it called → ask again with the results → repeat
// until it answers in words. Everything else here is a guard around that loop.
//
// Order of the guards matters and is not arbitrary:
//
//   1. Crisis check FIRST, on the user's own words, before a single token is spent. Someone
//      in trouble gets a person, not a reading, and not a network round-trip either.
//   2. The loop, with a hard step cap. A model that keeps calling tools is not thinking, it
//      is stuck, and an uncapped loop bills for the privilege.
//   3. No-doom check on the finished text. A generated line that predicts ruin does not ship,
//      full stop — the reply is replaced, not annotated.
//   4. The date validator LAST, and it never blocks. It is the prompt-regression signal
//      (§4.7): it logs, and it hands the caller the violations so the UI can flag them.
//
// Threads are NOT stored here. They live on the device (apps/vim/src/services/threads.ts),
// the same as plans and the chart, so the Mentor works for a signed-out user and no
// conversation is on a server that does not need it. The client sends the history it wants
// answered against; this module is stateless.
// ─────────────────────────────────────────────────────────────────────────────

import { detectCrisis, checkNoDoom, SUPPORT_MESSAGE, SUPPORT_RESOURCES } from '@aura/engine';
import type { BirthData } from '@aura/engine';
import { modelFor } from './policy.js';
import { generate, MentorUnavailable, type GeminiContent, type FunctionDeclaration } from './gemini.js';
import { buildPrompt } from './prompt.js';
import {
  MENTOR_TOOLS, birthInstantUTC, chartFor, runTool,
  type MentorContext, type MentorPlan,
} from './tools.js';
import { validateReply, violationLogLine, type Violation } from './validate.js';

/** A turn as the client stores it. `assistant` text is what was shown, never a tool payload. */
export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface MentorRequest {
  birth: BirthData;
  plans: MentorPlan[];
  /** The whole thread, oldest first, ending with the user's new message. */
  messages: ChatTurn[];
  now?: Date;
  signal?: AbortSignal;
}

export interface MentorReply {
  reply: string;
  /** Tool names in call order, so the UI can show what the answer was actually read from. */
  toolsUsed: string[];
  model: string;
  /** Set when the reply was produced without the model: crisis routing, or a doom rewrite. */
  intercepted?: 'crisis' | 'doom';
  /** Ungrounded dates/durations. Never blocks; the UI marks the message. */
  violations: Violation[];
  usage: { input: number; output: number; total: number };
}

/**
 * How many model calls one turn may make. Each iteration is one billed request, and the
 * observed shape is 1–3: stack, maybe a range, then the answer. Six is generous headroom
 * that still terminates.
 */
const MAX_STEPS = 6;

/** Gemini's `functionDeclarations` are Anthropic's `input_schema` under another name. */
const TOOL_DECLARATIONS: FunctionDeclaration[] = MENTOR_TOOLS.map((t) => ({
  name: t.name,
  description: t.description,
  parameters: t.input_schema as Record<string, unknown>,
}));

const CRISIS_REPLY = `${SUPPORT_MESSAGE}\n\n${SUPPORT_RESOURCES
  .map((r) => `• ${r.region} — ${r.label}: ${r.contact}`)
  .join('\n')}`;

/**
 * What replaces a reply that failed the no-doom check. It says what happened rather than
 * pretending nothing did: a silently swapped answer is its own small lie, and the user is
 * owed the chance to ask again.
 */
const DOOM_REPLY =
  "I started to answer that in a way this app doesn't allow — nothing here predicts harm, "
  + 'illness or disaster, because a daśā describes conditions and not outcomes. Ask me what '
  + 'the period supports or resists and I can be genuinely useful about it.';

export async function runMentorTurn(req: MentorRequest): Promise<MentorReply> {
  const now = req.now ?? new Date();
  const lastUser = [...req.messages].reverse().find((m) => m.role === 'user');

  if (detectCrisis(lastUser?.text)) {
    return {
      reply: CRISIS_REPLY,
      toolsUsed: [],
      model: 'none',
      intercepted: 'crisis',
      violations: [],
      usage: { input: 0, output: 0, total: 0 },
    };
  }

  const chart = chartFor(req.birth);
  const ctx: MentorContext = {
    chart,
    birth: birthInstantUTC(req.birth),
    plans: req.plans,
    now,
  };

  const { system, grounding } = buildPrompt(ctx);
  const model = modelFor('default');
  const contents: GeminiContent[] = req.messages.map((m) => ({
    role: m.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: m.text }],
  }));

  const toolsUsed: string[] = [];
  const usage = { input: 0, output: 0, total: 0 };
  let text = '';

  for (let step = 0; step < MAX_STEPS; step++) {
    const out = await generate({
      model, system, contents, tools: TOOL_DECLARATIONS, signal: req.signal,
    });
    usage.input += out.usage.input;
    usage.output += out.usage.output;
    usage.total += out.usage.total;

    if (out.functionCalls.length === 0) {
      text = out.text;
      break;
    }

    // The model turn goes back EXACTLY as it arrived — thought signatures included.
    contents.push(out.content);
    contents.push({
      role: 'user',
      parts: out.functionCalls.map((call) => {
        toolsUsed.push(call.name);
        const outcome = runTool(call.name, call.args, ctx);
        // Both success and failure are grounding: an error the model repeats is still text
        // we supplied, and repeating it is the correct behaviour.
        grounding.push(JSON.stringify(outcome));
        return {
          functionResponse: {
            name: call.name,
            ...(call.id ? { id: call.id } : {}),
            response: outcome as unknown as Record<string, unknown>,
          },
        };
      }),
    });

    // Ran out of steps with tools still pending: say so rather than answering thinly.
    if (step === MAX_STEPS - 1) {
      throw new MentorUnavailable(
        'That question took more lookups than one turn allows. Try asking it in two parts — '
        + 'the answer would have been built on incomplete readings otherwise.',
        504,
      );
    }
  }

  if (!text) {
    throw new MentorUnavailable('The Mentor came back empty. Ask again in a moment.', 502);
  }

  const doom = checkNoDoom(text);
  if (!doom.ok) {
    console.warn(`mentor.doom model=${model} matches=${JSON.stringify(doom.matches)}`);
    return {
      reply: DOOM_REPLY, toolsUsed, model, intercepted: 'doom', violations: [], usage,
    };
  }

  const validation = validateReply({
    reply: text,
    grounding,
    userText: lastUser?.text ?? '',
    toolCalls: toolsUsed.length,
  });
  if (!validation.ok) {
    console.warn(violationLogLine(validation, {
      threadId: 'client', messageId: String(now.getTime()), model,
    }));
  }

  return { reply: text, toolsUsed, model, violations: validation.violations, usage };
}
