// The planner: question in, a dynamically composed answer out.
//
// This is the piece that makes the skeleton the model's own rather than a template. It:
//
//   1. embeds the question and ranks every CAPABILITY against it,
//   2. takes whichever cleared the relevance floor — a combination, not a fixed set,
//   3. leads with the one that answers the literal ask,
//   4. runs the real calculations behind each and renders them in that order.
//
// So "why is my work blocked" and "when is my best stretch for work" produce different
// sections, in different orders, from the same area. And a question that touches two things at
// once picks up both.
//
// The model decides WHICH calculations run and in WHAT ORDER. It writes nothing.

import { arbitrate, allEncodedRules } from '@aura/knowledge';
import type { Area } from '@aura/engine';
import { embedOne, initRouter, route } from './router.js';
import { CAPABILITIES, buildChart, type Ctx, type Section } from './capabilities.js';
import { readShape, readRange } from './shape.js';
import {
  yesNo, lookupGlossary, metaAnswer, socialAnswer, oneLineState, refusalAnswer,
} from './conversation.js';

export interface BirthInput {
  date: string; time?: string; unknownTime: boolean; place: string;
  lat: number; lng: number; tzOffsetMinutes: number;
}

export interface PlannedAnswer {
  headline: string;
  sections: Section[];
  limits: string[];
  plan: { id: string; score: number; lead: boolean }[];
  /** How big a reply this is. The client renders `reading` differently from the short ones. */
  register: string;
  /** The granularity, ordering and cut-off read out of the request; null where none was named. */
  shape?: { unit: string | null; ordering: string; limit: number | null; matched: string[] };
  state: {
    kind: string; area: string | null; from: string; to: string;
    subject: string | null; windowLabel: string;
  };
}

/**
 * Capabilities below this are not related enough to be worth a section.
 *
 * Set low deliberately. The cost of an extra section is a paragraph the reader skims; the cost
 * of a missing one is the answer not containing the thing they asked about. But not zero —
 * eight sections on every question is the same as no plan at all.
 */
const RELEVANCE_FLOOR = 0.14;
const MAX_SECTIONS = 5;

/** Which capability most directly answers each question shape — the guaranteed lead. */
const LEAD_FOR: Record<string, string> = {
  elect: 'elect.moments',
  when: 'timing.windows',
  why: 'block.analysis',
  outlook: 'env.state',
  what: 'chart.findings',
};

/** Sections that only make sense once the lead has been given. */
const ORDER_HINT: string[] = [
  'series.custom', 'elect.moments', 'timing.windows', 'env.state', 'mind.state', 'block.analysis',
  'timing.now', 'chart.findings', 'chart.drivers',
];

const LIMITS: Record<string, string> = {
  elect: 'A good hour improves the odds of a smooth start. It does not make a bad decision a '
    + 'good one, and nothing here claims otherwise.',
  when: 'This says WHEN your chart most supports the matter, which is not the same as when it '
    + 'will happen. Support is necessary and not sufficient — the strongest window does '
    + 'nothing if nobody acts inside it.',
  outlook: 'This measures how far your chart SUPPORTS a matter over time. It does not predict '
    + 'endings, breakups, illness or death — not because the arithmetic cannot run, but '
    + 'because those are refused outright. A low stretch means a hard stretch; it is not a '
    + 'forecast that something will end.',
  why: 'The reasons here are structural — what your chart does and does not support. They are '
    + 'not the only reasons something is hard, and they are not an account of anyone else’s '
    + 'behaviour.',
};

let capVecs: { id: string; vec: Float32Array }[] = [];

async function indexCapabilities(): Promise<void> {
  if (capVecs.length > 0) return;
  await initRouter();
  capVecs = [];
  for (const c of CAPABILITIES) {
    capVecs.push({ id: c.id, vec: await embedOne(c.asks) });
  }
}

const dot = (a: Float32Array, b: Float32Array): number => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!;
  return s;
};

export interface PlanRequest {
  question: string;
  birth: BirthInput;
  now?: string;
  /** Resolved client-side, where the date parsing lives. */
  from?: string;
  to?: string;
  windowLabel?: string;
  subject?: string | null;
}

export async function planAnswer(req: PlanRequest): Promise<PlannedAnswer> {
  // ⚠️ Refusals run FIRST, before the model is consulted and before any chart is computed.
  //
  // "will I die soon" was classified as an ordinary reading and answered with a score and a
  // date. The refusal existed, but behind a register the question never landed in — and a
  // safety rail that depends on correct classification is not a rail.
  const refused = refusalAnswer(req.question);
  if (refused) {
    const nowIso = (req.now ? new Date(req.now) : new Date()).toISOString();
    return {
      headline: refused.title,
      sections: [refused],
      limits: [],
      plan: [{ id: 'answer.refused', score: 1, lead: true }],
      register: 'refused',
      state: {
        kind: 'refused', area: null, from: nowIso, to: nowIso,
        subject: null, windowLabel: '',
      },
    };
  }

  await indexCapabilities();

  const routed = await route(req.question);
  // ⚠️ NOT `?? 'self'`. When the router declines to place a question, inventing a subject is
  // exactly how "are u there?" became four sections about the meaning of life. A null area is
  // a real answer and is handled in `shortAnswer`.
  const area = (routed.area ?? 'self') as Area;
  const areaUnknown = routed.area === null;
  const kind = routed.kind;
  const now = req.now ? new Date(req.now) : new Date();

  const from = req.from ? new Date(req.from) : now;
  const to = req.to
    ? new Date(req.to)
    : new Date(now.getTime() + (kind === 'elect' ? 60 : 5 * 365.25) * 86400000);

  // The request's own shape and range beat the caller's defaults: a question that says
  // "from aug 2026 to aug 2027" has named its range more precisely than any default can, and
  // one that says "month by month" has named its format more explicitly than any inference.
  const shape = readShape(req.question);
  const stated = readRange(req.question, now);

  const { chart, birthInstant } = buildChart(req.birth);

  // The rule corpus, once. Fixed features of a chart do not change between questions.
  let findings: Ctx['findings'] = [];
  try {
    const facts = {
      lagnaSign: chart.lagnaSign,
      lagnaLong: chart.lagnaLong,
      planets: Object.fromEntries(Object.entries(chart.planets).map(([g, p]) => [g, {
        sign: p.sign, house: p.house, longitude: p.siderealLong,
        retrograde: p.retrograde, combust: p.combust,
      }])),
    };
    const res = arbitrate(allEncodedRules(), facts as never, {} as never);
    findings = res.findings.map((f) => ({
      summary: f.hit.rule.effect.summary,
      domain: f.hit.rule.effect.domain,
      confidence: f.confidence,
    }));
  } catch {
    findings = [];
  }

  const ctx: Ctx = {
    chart, birth: birthInstant, now, lat: req.birth.lat, lng: req.birth.lng,
    area,
    from: stated?.from ?? from,
    to: stated?.to ?? to,
    windowLabel: stated?.label ?? req.windowLabel
      ?? (kind === 'elect' ? 'the next two months' : 'the next five years'),
    subject: req.subject ?? null,
    findings,
    shape,
  };

  // ── Short questions, short answers ────────────────────────────────────────
  //
  // Answered before any of the expensive machinery runs, because none of it is wanted. A
  // greeting does not need a chart computed against it, and "what does that mean" needs a
  // definition rather than a forecast.
  // ...unless the question named the format it wants. The register is the model's guess at
  // how big a reply to give; a question that says "rate my months from X to Y" has already
  // said. Explicit beats inferred — this exact question came back as "**Yes.**" because the
  // classifier called it a yes/no and nothing downstream ever saw the shape.
  const short = shape.wantsSeries
    ? null
    : shortAnswer(req.question, routed.register, ctx, areaUnknown);
  if (short) {
    return {
      headline: short.headline,
      sections: short.sections,
      limits: [],
      plan: [{ id: short.sections[0]?.id ?? 'answer.short', score: routed.registerScore, lead: true }],
      register: routed.register,
      shape: { unit: shape.unit, ordering: shape.ordering, limit: shape.limit, matched: shape.matched },
      state: {
        kind, area: routed.area, from: from.toISOString(), to: to.toISOString(),
        subject: ctx.subject, windowLabel: ctx.windowLabel,
      },
    };
  }

  // ── Rank every capability against the question ────────────────────────────
  const qv = await embedOne(req.question);
  const scored = capVecs
    .map((c) => ({ id: c.id, score: dot(qv, c.vec) }))
    .sort((a, b) => b.score - a.score);

  // A format named outright wins the lead. "rate my months for getting a job" is a work
  // question that asked for a table; classifying it as `when` and leading with the usual
  // windows section answers a question nobody asked.
  const leadId = shape.wantsSeries ? 'series.custom' : (LEAD_FOR[kind] ?? scored[0]!.id);
  const chosen = new Set<string>([leadId]);
  for (const s of scored) {
    if (chosen.size >= MAX_SECTIONS) break;
    if (s.score >= RELEVANCE_FLOOR) chosen.add(s.id);
  }

  // "Why is this blocked" should also say how you are seeing it — the two together are the
  // answer, and neither alone is. Pairings the ranking does not always find on its own.
  if (chosen.has('block.analysis')) chosen.add('mind.state');
  if (chosen.has('env.state') && kind === 'outlook') chosen.add('block.analysis');

  const order = [leadId, ...ORDER_HINT.filter((id) => id !== leadId && chosen.has(id))];
  const scoreOf = (id: string) => scored.find((s) => s.id === id)?.score ?? 0;

  const sections: Section[] = [];
  const plan: PlannedAnswer['plan'] = [];
  for (const id of order) {
    const cap = CAPABILITIES.find((c) => c.id === id);
    if (!cap) continue;
    if (cap.applies && !cap.applies(ctx)) continue;
    let s: Section | null = null;
    try {
      s = cap.run(ctx);
    } catch (e) {
      // One capability failing must not lose the whole answer — but it must not vanish
      // silently either. A bare `catch {}` here hid a stack overflow (an accidental
      // self-recursive memo) for an entire debugging round: the section simply was not
      // there, and nothing said why.
      s = null;
      // eslint-disable-next-line no-console
      console.warn(`capability ${cap.id} failed:`, e instanceof Error ? e.message : e);
    }
    if (!s) continue;
    sections.push(s);
    plan.push({ id, score: Math.round(scoreOf(id) * 1000) / 1000, lead: id === leadId });
    if (sections.length >= MAX_SECTIONS) break;
  }

  return {
    headline: headlineFor(kind, ctx, sections),
    sections,
    limits: LIMITS[kind] ? [LIMITS[kind]!] : [],
    plan,
    register: routed.register,
    shape: { unit: shape.unit, ordering: shape.ordering, limit: shape.limit, matched: shape.matched },
    state: {
      kind, area: routed.area,
      from: ctx.from.toISOString(), to: ctx.to.toISOString(),
      subject: ctx.subject, windowLabel: ctx.windowLabel,
    },
  };
}

/** The headline restates the literal ask, answered. It is never a topic label. */
function headlineFor(kind: string, ctx: Ctx, sections: Section[]): string {
  const first = sections[0];
  if (!first) return 'Nothing specific enough came out of that';
  const w = first.windows?.[0];
  // Only when the first row IS the answer. A series in date order leads with the earliest
  // bucket, not the best one — "Strongest window: August 2026" over a chronological table is
  // simply false, and its own opening sentence already names the real strongest.
  const ranked = first.id !== 'series.custom';
  if (kind === 'elect' && w && ranked) {
    return `${w.label} — ${w.pct} out of 100`;
  }
  if (kind === 'when' && w && ranked) {
    return `Strongest window: ${w.label} — ${w.pct} out of 100`;
  }
  // A section whose value is its quotes has a generic opening line; lead with the strongest
  // quote instead, because that is the actual answer to "what am I like".
  if (first.quotes?.length) return first.quotes[0]!;
  // For the rest, the opening sentence of the lead section already IS the answer.
  // Take sentences until there is enough to BE an answer. "The block is not vague." is a
  // true opening and a useless headline on its own.
  const lead = first.body[0] ?? '';
  const parts = lead.split(/(?<=\.)\s/);
  let out = '';
  for (const part of parts) {
    out = out ? `${out} ${part}` : part;
    if (out.length >= 60) break;
  }
  return out.length > 160 ? `${out.slice(0, 157)}…` : out;
}

export const WHY_THE_PLAN_IS_RETURNED =
  'The chosen capabilities and their scores come back with the answer. That is not debug '
  + 'output: a dynamically composed answer whose composition is invisible is impossible to '
  + 'argue with, and the whole product rests on being able to see why it said what it said.';

/**
 * A reply sized to the question, or null when the full reading is what is wanted.
 *
 * Not consulted at all when the request named a granularity or a format — see the call site.
 * A named format is an explicit statement of how big the answer should be, and it outranks
 * this function's classification of the same sentence.
 *
 * Order matters: social first (a greeting embedded against life areas always matches
 * something, and it is always wrong), then the method questions, then definitions, then
 * yes/no — which is the only one that needs the chart.
 */
function shortAnswer(
  question: string,
  register: string,
  ctx: Ctx,
  areaUnknown = false,
): { headline: string; sections: Section[] } | null {
  if (register === 'unclear') {
    return {
      headline: 'I did not catch a question there',
      sections: [{
        id: 'answer.unclear',
        title: '',
        body: ['Ask me anything about work, money, relationships, home, children, health, '
          + 'study, travel, luck or yourself — in your own words.'],
      }],
    };
  }
  if (register === 'social') {
    const s = socialAnswer(question);
    if (s) return { headline: s.body[0] ?? '', sections: [] };
  }

  if (register === 'meta') {
    const s = metaAnswer(question);
    if (s) return { headline: s.title, sections: [s] };
  }

  if (register === 'meaning') {
    const g = lookupGlossary(question);
    if (g) {
      return {
        headline: g.term,
        sections: [{ id: 'answer.meaning', title: '', body: [g.says] }],
      };
    }
    // Asked for a meaning but nothing in the vocabulary matched. Say so rather than
    // answering a different question — a definition of the wrong term is worse than none.
    return {
      headline: 'Not sure which part you mean',
      sections: [{
        id: 'answer.meaning.miss',
        title: '',
        body: ['Point at the word and I will define it — the score out of 100, a stretch, the '
          + '± on a date, your own monthly cycle, or how you are seeing something. Or ask the '
          + 'question again in full and I will answer it properly.'],
      }],
    };
  }

  if (register === 'yesno') {
    const s = yesNo({
      chart: ctx.chart, birth: ctx.birth, now: ctx.now, area: ctx.area,
      from: ctx.from, to: ctx.to, windowLabel: ctx.windowLabel,
    });
    if (s) {
      const context = oneLineState(ctx.chart, ctx.birth, ctx.now, ctx.area);
      if (context) s.body.push(context);
      // The verdict word is the headline; the rest is the working behind it.
      const first = s.body[0] ?? '';
      const head = first.replace(/\*\*/g, '').split('.')[0] ?? first;
      return { headline: head, sections: [s] };
    }
  }

  // The router looked at this and could not say what it is about. Saying so is the answer —
  // the alternative is picking a subject and being fluent about the wrong one, which is
  // precisely what a reader cannot detect.
  if (areaUnknown && register === 'reading') {
    return {
      headline: 'I am not sure which part of your life that is about',
      sections: [{
        id: 'answer.noarea',
        title: '',
        body: ['Name the area and I will answer properly — work, money, relationships, home, '
          + 'children, health, study, travel, obstacles, luck, or you yourself.',
          'Or ask it another way. I would rather say I did not follow than give you a '
          + 'confident answer to a question you did not ask.'],
      }],
    };
  }

  return null;
}

export const NEVER_INVENT_A_SUBJECT =
  'When the router declines to place a question, the answer says so. It used to fall back to '
  + '"self" and produce a full reading regardless, which is how "are u there?" became four '
  + 'sections about the meaning of life. A fluent answer to a question nobody asked is the one '
  + 'failure a reader has no way of detecting.';

export const SHORT_CIRCUIT_BEFORE_THE_MACHINERY =
  'Short answers are resolved BEFORE the capabilities are ranked or any calculation runs. A '
  + 'greeting does not need a chart computed against it, and "what does that mean" wants a '
  + 'definition rather than a forecast. Doing the work first and then discarding it would be '
  + 'slower and would still get the register wrong.';
