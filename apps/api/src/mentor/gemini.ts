// ─────────────────────────────────────────────────────────────────────────────
// The Gemini transport. One POST, typed, with no SDK.
//
// `fetch` has been global since Node 18 and the generateContent contract is a stable JSON
// shape, so a dependency here would buy nothing and cost a supply-chain surface on the one
// path that holds an API key.
//
// Two details are load-bearing and easy to get wrong:
//
// 1. **The key never leaves the server** (M17). It is read from the environment inside this
//    module and put in a header, never a query string — a URL with a key in it ends up in
//    proxy logs, browser history and crash reports.
//
// 2. **A model turn is echoed back VERBATIM.** Gemini 3's thinking models return a
//    `thoughtSignature` alongside a function call, and the next request must carry that part
//    back unmodified or the model loses the reasoning that produced the call. So the tool
//    loop appends `candidate.content` as it arrived rather than rebuilding it from the parts
//    it cared about. Anything that "tidies" a model turn breaks multi-step tool use in a way
//    that looks like the model simply got worse.
// ─────────────────────────────────────────────────────────────────────────────

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown>; id?: string };
  functionResponse?: { name: string; response: Record<string, unknown>; id?: string };
  /** Opaque reasoning token. Never read, never edited — only carried back. */
  thoughtSignature?: string;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface GenerateInput {
  model: string;
  system: string;
  contents: GeminiContent[];
  tools: FunctionDeclaration[];
  /** Low by default: this app's answers are readings of computed values, not invention. */
  temperature?: number;
  signal?: AbortSignal;
}

export interface GenerateOutput {
  /** The model turn exactly as it arrived. Append this to `contents` unchanged. */
  content: GeminiContent;
  text: string;
  functionCalls: { name: string; args: Record<string, unknown>; id?: string }[];
  finishReason: string | undefined;
  usage: { input: number; output: number; total: number };
}

/** Thrown when the Mentor cannot answer. The message is safe to show a user. */
export class MentorUnavailable extends Error {
  constructor(message: string, readonly status = 503) {
    super(message);
    this.name = 'MentorUnavailable';
  }
}

/** The configured key, or null. `mentorConfigured()` is what routes should branch on. */
export const apiKey = (): string | null =>
  process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || null;

export const mentorConfigured = (): boolean => apiKey() !== null;

export async function generate(input: GenerateInput): Promise<GenerateOutput> {
  const key = apiKey();
  if (!key) {
    throw new MentorUnavailable(
      'The Mentor needs a GEMINI_API_KEY in apps/api/.env. Everything else in the app works '
      + 'without it — your court, your timeline and your plans are all computed on your device.',
    );
  }

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/${encodeURIComponent(input.model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      signal: input.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.system }] },
        contents: input.contents,
        tools: input.tools.length > 0 ? [{ functionDeclarations: input.tools }] : undefined,
        generationConfig: { temperature: input.temperature ?? 0.4 },
      }),
    });
  } catch (e) {
    throw new MentorUnavailable(
      `Couldn't reach the Mentor service (${(e as Error).message}). Your chart and timeline `
      + 'are unaffected — they never leave your device.',
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // 429 and 5xx are worth retrying later; 4xx is a configuration problem. Both are shown
    // as themselves rather than as a generic failure, because "your key expired" and "the
    // service is busy" want completely different actions from the person reading it.
    const detail = extractError(body);
    throw new MentorUnavailable(
      res.status === 429
        ? `The Mentor is rate-limited right now. ${detail}`.trim()
        : res.status >= 500
          ? `The Mentor service is having trouble (${res.status}). ${detail}`.trim()
          : `The Mentor rejected the request (${res.status}). ${detail}`.trim(),
      res.status,
    );
  }

  const body = await res.json() as {
    candidates?: { content?: GeminiContent; finishReason?: string }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
    promptFeedback?: { blockReason?: string };
  };

  const blocked = body.promptFeedback?.blockReason;
  if (blocked) throw new MentorUnavailable(`The Mentor declined that one (${blocked}).`);

  const candidate = body.candidates?.[0];
  const content = candidate?.content ?? { role: 'model' as const, parts: [] };
  const parts = content.parts ?? [];

  return {
    content: { role: 'model', parts },
    text: parts.map((p) => p.text ?? '').join('').trim(),
    functionCalls: parts
      .filter((p) => p.functionCall)
      .map((p) => ({
        name: p.functionCall!.name,
        args: p.functionCall!.args ?? {},
        ...(p.functionCall!.id ? { id: p.functionCall!.id } : {}),
      })),
    finishReason: candidate?.finishReason,
    usage: {
      input: body.usageMetadata?.promptTokenCount ?? 0,
      output: body.usageMetadata?.candidatesTokenCount ?? 0,
      total: body.usageMetadata?.totalTokenCount ?? 0,
    },
  };
}

/** Pull the human-readable line out of a Google error envelope, if there is one. */
function extractError(body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return parsed.error?.message ?? '';
  } catch {
    return '';
  }
}
