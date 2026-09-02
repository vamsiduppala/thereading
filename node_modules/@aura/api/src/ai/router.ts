// Local semantic routing — a real model, running in this process, free and offline.
//
// **Why this exists.** Keyword matching answered the wrong question too often: "give me the
// best times for buying a car" hit no keyword and inherited the previous topic; "why is my work
// so blocked" matched "blocked" and was answered as though it were about enemies. A word table
// cannot tell that "my girlfriend left" is about partnership when it contains neither
// "relationship" nor "partner".
//
// **Why an embedding model and not a chat model.** Routing a question to one of 175 pointers is
// classification, not generation. A 25 MB sentence encoder does it in ~10 ms on a CPU, needs no
// daemon, no API key and no network after the first download — and, decisively, it CANNOT
// invent a fact, because it never emits text. It only measures which of our own sentences a
// question is closest to. Every word the user reads still comes from the corpus or from a
// computed number.
//
// The model is `all-MiniLM-L6-v2`, Apache-2.0, ~25 MB quantised. It downloads once into the
// HuggingFace cache and is then entirely local.

import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers';
import { ALL_POINTERS, POINTER_TREE } from '@aura/knowledge';

// Cache beside the app so a container or a copied folder keeps the model with it.
env.cacheDir = process.env.AI_CACHE_DIR ?? './.models';
env.allowRemoteModels = true;

const MODEL = process.env.AI_MODEL ?? 'Xenova/all-MiniLM-L6-v2';

export type Kind = 'elect' | 'when' | 'why' | 'outlook' | 'what' | 'unknown';

/**
 * How much of an answer the question wants — orthogonal to `Kind`.
 *
 * "Is October good for work?" is a `when` question in `yesno` register. Answering it with four
 * sections is what makes a thing feel like a form rather than a conversation, so the register
 * is classified separately and decides the SIZE of the reply.
 */
export type Register = 'reading' | 'yesno' | 'meaning' | 'meta' | 'social' | 'unclear';

/**
 * The areas the timing engine can score, each described the way a person would say it.
 *
 * These strings are what the question is actually compared against, so they are written as
 * natural phrases rather than labels — an encoder matches "my girlfriend left me" to "romance,
 * dating, partnership, marriage, breaking up" and matches nothing to the bare word
 * "partnership".
 */
const AREA_TEXT: Record<string, string> = {
  self: 'myself, my personality, my character, my temperament, how I come across to people, '
    + 'my own state of mind, who I am, how I am feeling in myself, my confidence',
  wealth: 'money, savings, income, salary, debt, expenses, affording things, my financial '
    + 'situation, being short of money, never able to save, money going out faster than it '
    + 'comes in, struggling financially, being broke',
  gains: 'income, profit, bonus, returns on something, money coming in from outside, gains',
  courage: 'courage, confidence to act, taking initiative, my brothers and sisters, siblings',
  home: 'home, house, family, my parents, mother, father, property, buying a car or a '
    + 'vehicle, household comforts, domestic life, where I live',
  children: 'children, kids, my son, my daughter, having a baby, pregnancy, becoming a parent',
  education: 'studying, exams, my degree, college, university, learning, admission, school, '
    + 'failing exams, struggling with study',
  health: 'health, energy levels, feeling tired all the time, stamina, fitness, my body, '
    + 'recovering from something, exhaustion, feeling run down',
  obstacles: 'enemies, rivals, a dispute, a court case, litigation, a lawsuit, people '
    + 'actively working against me, opposition from others, someone out to get me',
  partnership: 'relationship, girlfriend, boyfriend, marriage, spouse, husband, wife, dating, '
    + 'romance, love life, breaking up, divorce, being single, meeting someone, my partner '
    + 'leaving, things going badly with the person I am with',
  change: 'sudden upheaval, a crisis, a turning point, everything being turned upside down',
  fortune: 'luck, good fortune, getting a break, blessings, things going my way for once',
  career: 'work, my job, career, promotion, my boss, the office, business, resigning, '
    + 'quitting, interviews, professional reputation, being stuck at work, work being '
    + 'blocked, not progressing in my career, being passed over, no recognition at work',
  travel: 'travel, going abroad, moving to another country, relocating, visa, foreign '
    + 'places, trips away',
  spirituality: 'meaning, purpose, spirituality, faith, meditation, what I am here for',
  release: 'letting go of something, endings, closure, loss, giving something up',
};

/**
 * Question SHAPE, matched the same way. The shape decides which skeleton is built and, more
 * importantly, what precision the answer may claim — so it is worth getting right by meaning
 * rather than by verb-spotting.
 */
const KIND_TEXT: Record<Exclude<Kind, 'unknown'>, string> = {
  elect: 'what is the best day and hour for me to do this, when should I start it, the most auspicious moment to begin, pick a good time for me to sign or buy or launch or travel, choose a date',
  when: 'when will this happen to me, how long until it happens, which year or month will it come, how soon, when is my strongest stretch for this, which period is best for it, when is my best window, when does my good phase for this come',
  why: 'why is this happening to me, why is it going badly, what is the reason for this, how come things are like this, what is wrong, why am I stuck, why does nothing move, what is holding this back',
  outlook: 'what is going to happen next, will it work out, is it going to end, what does the future hold for this, will it last',
  what: 'what am I like, what does my chart say about me, describe my nature, tell me about this part of my life',
};

/**
 * Unambiguous words per area — the certain half of the signal.
 *
 * Only words that pin an area on their own. "promotion" can only be about work; "money" can
 * only be about money. Deliberately NOT state words like "blocked" or "stuck", which describe
 * how something feels rather than what it is, and which previously let obstacles capture every
 * frustrated question about anything.
 */
const AREA_KEYWORDS: Record<string, string[]> = {
  partnership: ['girlfriend', 'boyfriend', 'wife', 'husband', 'spouse', 'marriage', 'married',
    'marry', 'relationship', 'dating', 'divorce', 'partner', 'romance', 'breakup', 'single'],
  career: ['job', 'career', 'promotion', 'boss', 'office', 'work', 'employer', 'colleague',
    'appraisal', 'interview', 'resign', 'workplace', 'profession'],
  wealth: ['money', 'salary', 'savings', 'income', 'debt', 'loan', 'wealth', 'financially',
    'finances', 'broke', 'afford', 'expenses'],
  home: ['house', 'home', 'family', 'mother', 'father', 'parents', 'property', 'flat',
    'apartment', 'car', 'vehicle', 'household'],
  children: ['child', 'children', 'kid', 'kids', 'son', 'daughter', 'baby', 'pregnant'],
  health: ['health', 'illness', 'stamina', 'fitness', 'energy', 'exhausted', 'tired'],
  education: ['exam', 'exams', 'degree', 'college', 'university', 'study', 'studies', 'school'],
  travel: ['abroad', 'visa', 'relocate', 'relocating', 'emigrate', 'overseas', 'travel'],
  obstacles: ['enemy', 'enemies', 'rival', 'rivals', 'lawsuit', 'litigation', 'court case'],
  spirituality: ['spiritual', 'meditation', 'faith', 'religion'],
};

/**
 * How much one unambiguous word is worth against a cosine score. Capped at two words.
 *
 * Weighted to beat a strong semantic match on its own, because in a question like "upcoming
 * months job luck percentages" the SUBJECT is the concrete noun and everything around it
 * modifies it — that one routed to luck rather than work until the certain signal outweighed
 * the fuzzy one.
 */
const KEYWORD_BONUS = 0.15;

function keywordBonus(question: string): Record<string, number> {
  const t = ` ${question.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ')} `;
  const out: Record<string, number> = {};
  for (const [area, words] of Object.entries(AREA_KEYWORDS)) {
    const hits = words.filter((w) => t.includes(` ${w}`)).length;
    if (hits > 0) out[area] = Math.min(2, hits) * KEYWORD_BONUS;
  }
  return out;
}

/**
 * Register descriptions, matched the same way as areas and shapes.
 *
 * `reading` is deliberately described as an open request rather than as "everything else" —
 * a catch-all with no text of its own cannot be matched against, and every short question
 * would fall into it by default.
 */
const REGISTER_TEXT: Record<Exclude<Register, 'social' | 'unclear'>, string> = {
  reading: 'tell me about this part of my life, give me a full picture, what does my chart say '
    + 'about this, when will it happen, why is it like this, what is coming',
  yesno: 'is this a good time, is it worth doing, should I go ahead, is October any good, is '
    + 'this month better, yes or no, is it a good idea, will it be alright',
  meaning: 'what does that mean, what do you mean by that, explain that, I do not understand, '
    + 'what is a stretch, what does the number mean, define that, meaning of this',
  meta: 'how do you know that, how is this calculated, where does this come from, how accurate '
    + 'is it, can I trust this, how does this work, what can I ask you',
};

/**
 * Questions about the METHOD rather than about the person.
 *
 * Pattern-matched ahead of the encoder for the same reason greetings are: they are formulaic,
 * and an encoder asked to place "how do you know all this?" among life areas will always find
 * something. It scored it as a question about MEANING and returned a full reading on
 * spirituality — a fluent answer to a question nobody asked.
 */
// String.raw, because `'\s'` inside an ordinary quoted string is not an escape — it
// collapses to a bare "s", so this pattern silently became "must start with the letter s"
// and matched nothing at all.
const META_RE = new RegExp(
  String.raw`^\s*(how (do|did|does|would) (you|it|this)`
  + String.raw`|where (does|did) (this|that|it) come from`
  + String.raw`|what (is|are) (this|you|these) based on`
  + String.raw`|how (is|are) (this|these) (calculated|worked out)`
  + String.raw`|how (accurate|reliable|sure)|can i trust|is (this|it) real`
  + String.raw`|what can (you|i) (do|ask)|what do you know|who are you|what are you)\b`,
  'i',
);

/** Short greetings and acknowledgements. Pattern-matched, not embedded — they are formulaic. */
/**
 * Greetings, acknowledgements, and checking the thing is alive.
 *
 * Broader than a greeting list, because "are u there?" is none of hello/thanks/ok and was
 * answered with four sections about the meaning of life. Pattern-matched ahead of the encoder
 * for the reason all of these are: an encoder asked to place "are u there" among sixteen life
 * areas will always find one, and it will always be wrong.
 */
const SOCIAL_RE = new RegExp(
  String.raw`^\s*(`
  + String.raw`(thanks|thank you|ty|cheers|ok|okay|k|got it|understood|i see|right|sure|fine)`
  + String.raw`|(hi|hello|hey|yo|hiya|sup|good (morning|afternoon|evening|night))`
  + String.raw`|(bye|goodbye|see you|later|gn|good night)`
  + String.raw`|(great|nice|cool|perfect|awesome|lovely|brilliant|amazing|wow)`
  + String.raw`|(are|r) (you|u) (there|ok|alive|working|awake|listening|here)`
  + String.raw`|(you|u) (there|ok|alive|working|awake)`
  + String.raw`|(anyone|anybody) (there|home)`
  + String.raw`|(still )?(there|here)\?`
  + String.raw`|can (you|u) hear me`
  + String.raw`|(test|testing|hello\?+|hey\?+)`
  + String.raw`|(lol|haha|hmm+|huh|oh|ah|yep|yeah|nope|no|yes)`
  + String.raw`)\b[\s.,!?]*$`,
  'i',
);

/**
 * A message with no content to route at all — punctuation, keysmash, or one bare word that
 * names nothing. Distinguished from chit-chat because the reply is different: chit-chat gets
 * a greeting back, this gets an invitation to ask something.
 */
/**
 * Asking what something MEANT, rather than asking a new question.
 *
 * Pattern-matched for the same reason greetings and method questions are: the phrasings are
 * formulaic, and the encoder put "what does out of 100 mean" at 0.294 against a 0.30 threshold
 * — close enough to be luck either way, which is not a basis for choosing how to answer.
 */
const MEANING_RE = new RegExp(
  String.raw`(what (do|does|did) (that|this|it|you) mean`
  + String.raw`|what does .{0,28} mean`
  + String.raw`|what (is|are) (a|an|the) [a-z ]{2,24}\?*$`
  + String.raw`|\bexplain (that|this|it)\b|\bwhat do you mean\b`
  + String.raw`|(i )?(do not|don't|dont) (understand|get it|follow)`
  + String.raw`|\bmeaning of\b|\bdefine\b|\bin plain english\b)`,
  'i',
);


const CONTENTLESS_RE = /^[\s\p{P}]*$|^\s*(\?+|\.+|asdf\w*|qwerty\w*|[a-z]{1,2})\s*$/iu;

let extractor: FeatureExtractionPipeline | null = null;
let ready: Promise<void> | null = null;

interface Indexed { key: string; vec: Float32Array; label: string }
let areaIndex: Indexed[] = [];
let kindIndex: Indexed[] = [];
let registerIndex: Indexed[] = [];
let pointerIndex: Indexed[] = [];

const dot = (a: Float32Array, b: Float32Array): number => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!;
  return s;
};

/** The pipeline already returns unit vectors, so cosine similarity is a dot product. */
async function embed(texts: string[]): Promise<Float32Array[]> {
  if (!extractor) throw new Error('router not initialised');
  const out = await extractor(texts, { pooling: 'mean', normalize: true });
  const dims = out.dims as number[];
  const width = dims[dims.length - 1]!;
  const flat = out.data as Float32Array;
  return texts.map((_, i) => flat.slice(i * width, (i + 1) * width));
}

/**
 * Load the model and index everything we can be asked about. Idempotent and safe to await
 * concurrently — the first caller does the work and the rest wait on the same promise.
 */
export function initRouter(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    extractor = await pipeline('feature-extraction', MODEL, { dtype: 'q8' });

    const areaKeys = Object.keys(AREA_TEXT);
    const areaVecs = await embed(areaKeys.map((k) => AREA_TEXT[k]!));
    areaIndex = areaKeys.map((k, i) => ({ key: k, vec: areaVecs[i]!, label: AREA_TEXT[k]! }));

    const kindKeys = Object.keys(KIND_TEXT) as Exclude<Kind, 'unknown'>[];
    const kindVecs = await embed(kindKeys.map((k) => KIND_TEXT[k]));
    kindIndex = kindKeys.map((k, i) => ({ key: k, vec: kindVecs[i]!, label: KIND_TEXT[k] }));

    const regKeys = Object.keys(REGISTER_TEXT) as Exclude<Register, 'social' | 'unclear'>[];
    const regVecs = await embed(regKeys.map((k) => REGISTER_TEXT[k]));
    registerIndex = regKeys.map((k, i) => ({ key: k, vec: regVecs[i]!, label: REGISTER_TEXT[k] }));

    // Only pointers the engine can actually answer. Indexing a refused or unbuilt one would
    // route a question straight into a dead end.
    const usable = ALL_POINTERS.filter((p) => p.status === 'ready' || p.status === 'partial');
    // Embedded WITH the section and group they sit under. A four-word title like "Muhurta
    // check" carries almost no signal alone, and matching on titles by themselves returned
    // noise for every question. The context is what makes the comparison mean anything.
    const sectionOf = new Map(POINTER_TREE.map((x) => [x.id, x.title]));
    const groupOf = new Map(
      POINTER_TREE.flatMap((x) => x.groups.map((g) => [g.id, g.title] as const)),
    );
    const pVecs = await embed(usable.map(
      (p) => `${sectionOf.get(p.section) ?? ''}. ${groupOf.get(p.group) ?? ''}. ${p.title}`,
    ));
    pointerIndex = usable.map((p, i) => ({ key: p.id, vec: pVecs[i]!, label: p.title }));
  })();
  return ready;
}

/** One string to one unit vector. Used by the planner to index its capabilities. */
export async function embedOne(text: string): Promise<Float32Array> {
  await initRouter();
  const [v] = await embed([text]);
  return v!;
}

export const routerReady = (): boolean => extractor !== null && areaIndex.length > 0;

export interface RouteResult {
  area: string | null;
  areaScore: number;
  kind: Kind;
  kindScore: number;
  /** How big an answer this wants. See `Register`. */
  register: Register;
  registerScore: number;
  pointers: { id: string; title: string; score: number }[];
  /** False when the model could not be loaded and the caller should fall back. */
  model: boolean;
}

/**
 * Similarity below this means "the encoder found nothing it recognises".
 *
 * Returning `null` here matters more than squeezing out a match: a confidently wrong area is
 * the exact failure this replaced. Below the floor the caller says it did not understand,
 * which is a better answer than a fluent one about the wrong subject.
 */
const AREA_FLOOR = 0.19;
const KIND_FLOOR = 0.16;

/**
 * `elect` must beat the runner-up by this much before it is accepted.
 *
 * It is the only shape that changes what PRECISION the answer may claim — an election is
 * quoted to the hour, everything else to a window of weeks. So a narrow win is not enough:
 * "I keep getting passed over for promotion" is full of action verbs and scored as an
 * election on a hair, which would have produced a confident clock time for a question that
 * cannot carry one.
 */
const ELECT_MARGIN = 0.08;

export async function route(question: string): Promise<RouteResult> {
  await initRouter();
  const [q] = await embed([question]);
  const best = (idx: Indexed[]) => idx
    .map((e) => ({ key: e.key, title: e.label, score: dot(q!, e.vec) }))
    .sort((a, b) => b.score - a.score);

  // Semantic score plus the keyword bonus. See AREA_KEYWORDS for why neither alone suffices.
  const bonus = keywordBonus(question);
  const areas = best(areaIndex)
    .map((a) => ({ ...a, score: a.score + (bonus[a.key] ?? 0) }))
    .sort((x, y) => y.score - x.score);
  const kinds = best(kindIndex);
  const pointers = best(pointerIndex).slice(0, 5);

  const topArea = areas[0]!;
  const topKind = kinds[0]!;

  // Register. Greetings are formulaic, so they are matched by pattern before the encoder is
  // consulted at all — an encoder asked to place "thanks" among life areas will always find
  // something, and it will always be wrong.
  const regs = best(registerIndex);
  const topReg = regs[0]!;
  // Order matters. CONTENTLESS matches any one- or two-letter word, so it must come AFTER the
  // chit-chat list or it swallows "ok", "hi" and "no". Patterns before the encoder throughout:
  // these phrasings are formulaic, and a borderline cosine score is not a basis for deciding
  // how to answer.
  const trimmed = question.trim();
  const register: Register = SOCIAL_RE.test(trimmed)
    ? 'social'
    : META_RE.test(trimmed)
      ? 'meta'
      : MEANING_RE.test(trimmed)
        ? 'meaning'
        : CONTENTLESS_RE.test(question)
          ? 'unclear'
          // Otherwise the encoder decides — but a short answer must be clearly indicated.
          // When in doubt, give the full reading: an over-long answer wastes a moment, a
          // truncated one loses the thing being asked about.
          : (topReg.key !== 'reading' && topReg.score >= 0.30)
            ? (topReg.key as Register)
            : 'reading';

  // An election has to win clearly, not narrowly — see ELECT_MARGIN.
  const runnerUp = kinds[1];
  const electNarrow = topKind.key === 'elect' && runnerUp != null
    && topKind.score - runnerUp.score < ELECT_MARGIN;
  const chosenKind = electNarrow ? runnerUp! : topKind;

  return {
    area: topArea.score >= AREA_FLOOR ? topArea.key : null,
    areaScore: Math.round(topArea.score * 1000) / 1000,
    kind: chosenKind.score >= KIND_FLOOR ? (chosenKind.key as Kind) : 'unknown',
    kindScore: Math.round(chosenKind.score * 1000) / 1000,
    register,
    registerScore: Math.round(topReg.score * 1000) / 1000,
    pointers: pointers.map((p) => ({
      id: p.key, title: p.title, score: Math.round(p.score * 1000) / 1000,
    })),
    model: true,
  };
}

export const WHY_AN_ENCODER_NOT_A_CHAT_MODEL =
  'Routing a question to one of 175 pointers is CLASSIFICATION, not generation. A 25 MB '
  + 'sentence encoder does it in about 10 ms on a CPU with no daemon, no key and no network '
  + 'after the first download — and decisively it CANNOT invent a fact, because it never emits '
  + 'text. It measures which of OUR OWN sentences a question is nearest to. Every word the '
  + 'reader sees still comes from the corpus or from a computed number, which is the property '
  + 'this whole product rests on and the one a chat model would quietly take away.';

export const A_WRONG_MATCH_IS_WORSE_THAN_NO_MATCH =
  'Below the similarity floor the router returns null rather than its best guess. A confidently '
  + 'wrong area — answering about enemies when the question was about work — is precisely the '
  + 'failure this replaced, and a fluent answer to the wrong question is worse than admitting '
  + 'the question was not understood.';

export const REGISTER_IS_ORTHOGONAL_TO_KIND =
  'Kind says WHAT is being asked; register says HOW MUCH of a reply it wants, and they vary '
  + 'independently. "Is October good for work?" is a `when` question in `yesno` register — the '
  + 'subject and shape are unchanged, and only the size of the honest answer differs. Answering '
  + 'every question with the full skeleton is what makes a product feel like a form rather than '
  + 'a conversation.';
