// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 72, 73 and 74 — Programme Part 18.
//   Ch 72 — Aggregational (Samudaya) Ashtakavarga, lines 52032-52255
//   Ch 73 — Effects of the Rays of the Planets,    lines 52255-52515
//   Ch 74 — The Sudarshana Chakra,                 lines 52515-53309
//
// Chapter 71 (longevity through the ashtakavarga) sits between 70 and 72 and is
// deliberately skipped — Part 51 material under the standing constraint.
//
// The three chapters here are the last of Phase II, and each contributes something Part 19
// needs: chapter 72 gives the SAV its thresholds and, in 72.30-31, an explicit PRECEDENCE
// rule; chapter 73 turns out to be the fold again, in yet another disguise; chapter 74
// gives three simultaneous frames whose agreement is a genuine confidence signal.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House, SignIndex } from '../../types.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;

// ═════════════════════════════════════════════════════════════════════════════
// Chapter 72 — the aggregate ashtakavarga
// ═════════════════════════════════════════════════════════════════════════════

export type SamudayaBand = 'favourable' | 'medium' | 'adverse';

/**
 * The SAV thresholds (72.3-6½): above 30 rekhas favourable, 25 to 30 medium, below 25
 * adverse. Stated for signs and repeated for houses.
 *
 * These are the text's OWN numbers, which makes them unusual — Part 17's transit threshold
 * had to be invented because chapter 70 named none. Here BPHS is explicit, so the boundary
 * is not ours and should not be recalibrated away.
 */
export const SAMUDAYA_FAVOURABLE_ABOVE = 30;
export const SAMUDAYA_ADVERSE_BELOW = 25;

export function samudayaBand(rekhas: number): SamudayaBand {
  if (rekhas > SAMUDAYA_FAVOURABLE_ABOVE) return 'favourable';
  if (rekhas < SAMUDAYA_ADVERSE_BELOW) return 'adverse';
  return 'medium';
}

export const SAMUDAYA_THRESHOLDS_ARE_THE_TEXTS =
  'BPHS 72.3-6 names 30 and 25 explicitly, unlike ch 70 which says only "more rekhas". '
  + 'These boundaries are the text’s and should not be tuned away by a calibration run.';

/**
 * The mean SAV per sign is 337/12 ≈ 28.08, which sits inside the "medium" band — so the
 * bands are not symmetric around the average, and "favourable" is genuinely above par.
 * Worth stating because it is easy to assume 28 is the midpoint of 25 and 30 by accident.
 */
export const SAV_MEAN_PER_SIGN = 337 / 12;

/**
 * 72.7-8: a wealth configuration stated purely in comparisons — the 11th holding more
 * rekhas than the 10th, the 12th fewer than the 11th, and the ascendant the most of all.
 *
 * Notable as the first rule in the corpus whose conditions are **relations between counts**
 * rather than thresholds on one. Part 17 gave rules a quantity to read; this needs two
 * quantities compared, which no predicate expresses yet — recorded in
 * `CH72_74_NOT_YET_EXPRESSIBLE`.
 */
export function prosperityConfiguration(sav: number[], lagnaSign: SignIndex): boolean {
  const at = (house: House): number => sav[mod12(lagnaSign + house - 1)] ?? 0;
  const lagna = at(1);
  const others = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => at(h as House));
  return at(11) > at(10) && at(12) < at(11) && others.every((v) => lagna >= v);
}

/** 72.9-10: the twelve houses split into three life stages. */
export const LIFE_STAGES = {
  early: [1, 2, 3, 4] as House[],
  middle: [5, 6, 7, 8] as House[],
  later: [9, 10, 11, 12] as House[],
} as const;

export type LifeStage = keyof typeof LIFE_STAGES;

/**
 * Which stage of life a house speaks to (72.9-10).
 *
 * A crude but genuinely useful mapping: it lets a static chart feature be assigned a rough
 * *when* without a dasha, which is the same trick chapter 70's trigger formula pulls by a
 * different route. The chapter reads benefic-versus-malefic weight within each block.
 */
export function lifeStageOfHouse(house: House): LifeStage {
  if (LIFE_STAGES.early.includes(house)) return 'early';
  if (LIFE_STAGES.middle.includes(house)) return 'middle';
  return 'later';
}

/** 72.9-10's own verdict for a stage, from how its four houses are weighted. */
export function stageVerdict(benefics: number, malefics: number): 'supported' | 'mixed' | 'testing' {
  if (benefics > malefics) return 'supported';
  if (malefics > benefics) return 'testing';
  return 'mixed';
}

/**
 * **72.30-31 states an explicit precedence rule, and Part 19 should cite it.**
 *
 * A sign auspicious in the samudaya ashtakavarga is auspicious for undertakings, full stop
 * — and transit effects need not be consulted at all. Only when the ashtakavarga does NOT
 * favour a sign does one fall back on transit. The chapter calls the ashtakavarga
 * "paramount".
 *
 * This is the second time the corpus has handed over its own arbitration order rather than
 * leaving it to be invented: 27.37-38 said the strongest planet delivers a bhava's promise.
 * Both belong in Part 19's ordering.
 */
export const AV_OUTRANKS_TRANSIT =
  'BPHS 72.30-31: a sign auspicious in the samudaya ashtakavarga is auspicious for '
  + 'undertakings and transit need not be checked. Transit is consulted only when the '
  + 'ashtakavarga does not favour the sign. The text calls the ashtakavarga paramount — '
  + 'an arbitration order stated by the source, like 27.37-38.';

export const CH72_UNSURFACED = [
  '72.11-28 — a month of danger to life read from signs holding 7 or fewer rekhas, with a '
  + 'charity remedy. Both excluded: the claim under the longevity policy, the remedy under '
  + 'the behavioural-remedies-only policy.',
] as const;

// ═════════════════════════════════════════════════════════════════════════════
// Chapter 73 — the rays of the planets
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Rays at deep exaltation (73.1-2), falling to zero at deep debilitation.
 *
 * **This is NOT the rasmi of chapter 28.** Same Sanskrit word, different instrument, and
 * the third such collision the programme has hit after `uchchaBala` (Part 9) and the
 * dignity ladders (Part 12):
 *
 *   ch 28 rasmi — runs 1 to 7, is 1 + virupas/10, and feeds Ishta/Kashta
 *   ch 73 rays  — run 0 to the values below, are closeness x maxRays, and feed this chapter
 *
 * They do not even share a zero point: a planet at deep debilitation has ONE rasmi and
 * ZERO rays. Conflating them would be silent and wrong.
 */
export const RAYS_AT_EXALTATION: Record<string, number> = {
  sun: 10, moon: 9, mars: 5, mercury: 5, jupiter: 7, venus: 8, saturn: 5,
};

/** 10+9+5+5+7+8+5. Note the effects table reaches past this — see `RAYS_ABOVE_BASE_MAX`. */
export const RAYS_TOTAL_MAX = 49;

export const RAYS_VS_CH28_RASMI =
  'BPHS 73’s "rays" and BPHS 28’s "rasmi" share a Sanskrit word and nothing else. Ch 28’s '
  + 'runs 1-7 and is 1 + virupas/10; ch 73’s runs 0 to a per-planet maximum and is '
  + 'closeness x that maximum. At deep debilitation one is 1 and the other is 0. Do not merge.';

/**
 * A planet's rays before dignity correction (73.1-2).
 *
 * Take the arc from the deep debilitation point, fold it into 0-6 signs, and scale that
 * fraction by the planet's exaltation maximum. Which is to say: **rays are
 * `exaltationCloseness` x the maximum** — the same folded arc that runs Uchcha bala, Dig
 * bala, Paksha, Ayana, Cheshta, Bhava bala and chapter 28's rasmi, appearing for the
 * seventh distinct purpose.
 *
 * Verified against the chapter's worked example: Venus at 320.0672° with its debilitation
 * at 177° gives an arc of 143.0672°, and 143.0672/180 x 8 = 6.359 — which is the 6/3 the
 * example reaches, written in sixtieths.
 */
export function planetRays(
  longitude: number, deepDebilitationPoint: number, maxRays: number,
): number {
  let arc = Math.abs(((longitude - deepDebilitationPoint) % 360 + 360) % 360);
  if (arc > 180) arc = 360 - arc;
  return (arc / 180) * maxRays;
}

/**
 * The dignity corrections (73.3-7) — a FOURTH dignity ladder, and the only multiplicative
 * one.
 *
 * The others are additive scores: `SAPTAVARGAJA_VIRUPAS` (ch 27), `SUBHANKA` (ch 28) and
 * `VARGA_VISWA` (ch 7). This one scales a quantity instead, so it cannot be substituted for
 * any of them even where the tiers line up.
 *
 * Verified against five of the chapter's seven worked corrections: friend x6/5 (Mars,
 * Mercury, Jupiter), great friend x4/3 (Venus), great enemy x2/5 (Saturn). The prose
 * garbles three of the multipliers into the wrong digits; the verse list and the arithmetic
 * agree with each other against it.
 */
export const RAY_DIGNITY_FACTOR: Record<string, number> = {
  exalted: 3,
  moolatrikona: 2,
  own: 3 / 2,
  'great-friend': 4 / 3,
  friend: 6 / 5,
  neutral: 1,
  enemy: 1 / 2,
  'great-enemy': 2 / 5,
};

export function correctedRays(baseRays: number, dignity: string): number {
  const f = RAY_DIGNITY_FACTOR[dignity];
  return f == null ? baseRays : baseRays * f;
}

/**
 * 73.6: the tara-grahas lose their rays entirely when combust — **except Venus and
 * Saturn**, which are exempt.
 *
 * The exemption is the interesting half. It is not the usual "Venus and Saturn are weak"
 * story; the verse simply excludes them from the rule, and no reason is given.
 */
export const COMBUST_BECOMES_RAYLESS: Graha[] = ['mars', 'mercury', 'jupiter'];

export const COMBUSTION_EXEMPTION_NOTE =
  'BPHS 73.6 makes the tara-grahas rayless when combust but names Venus and Saturn as '
  + 'exceptions, without saying why. Encoded as stated rather than rationalised.';

export function raysAfterCombustion(graha: Graha, rays: number, combust: boolean): number {
  return combust && COMBUST_BECOMES_RAYLESS.includes(graha) ? 0 : rays;
}

/**
 * The effect bands of 73.8-20, re-expressed.
 *
 * The source's table is a list of social and personal judgements — poverty, stupidity,
 * wickedness, childlessness — stated flatly and tied to caste in verse 20. None of that is
 * reproduced. What survives is the only astrologically load-bearing claim in it: **total
 * rays measure how much a chart's capacity actually reaches expression**, on a rising
 * scale.
 *
 * Verse 20's caste conditioning is excluded outright under the standing constraint on
 * gendered and status judgements, the same call made for chapter 80.
 */
export function rayCapacityBand(totalRays: number): 'minimal' | 'modest' | 'moderate' | 'strong' | 'exceptional' {
  if (totalRays <= 10) return 'minimal';
  if (totalRays <= 20) return 'modest';
  if (totalRays <= 35) return 'moderate';
  if (totalRays <= 50) return 'strong';
  return 'exceptional';
}

/**
 * The base maximum is 49, so the chapter's top band (above 50) is reachable **only through
 * the dignity multipliers**. That is almost certainly the point: the corrections are what
 * separate an ordinary chart from an extraordinary one, not the raw positions.
 */
export const RAYS_ABOVE_BASE_MAX =
  'The seven maxima sum to 49, so 73.20’s "more than 50 rays" is unreachable without the '
  + 'dignity corrections of 73.3-7. The multipliers are what create the top band.';

export const CH73_EXCLUDED = [
  '73.8-18 — the effects table’s social and personal judgements are not reproduced; only '
  + 'the rising capacity scale is kept.',
  '73.20 — outcomes conditioned on the native’s caste. Excluded, as ch 80’s value '
  + 'judgements were.',
] as const;

// ═════════════════════════════════════════════════════════════════════════════
// Chapter 74 — the Sudarshana Chakra
// ═════════════════════════════════════════════════════════════════════════════

/** The three frames a Sudarshana reading is taken from (74.5-9). */
export const SUDARSHANA_FRAMES = ['lagna', 'moon', 'sun'] as const;
export type SudarshanaFrame = (typeof SUDARSHANA_FRAMES)[number];

/**
 * The same house number, resolved in all three frames (74.5-9).
 *
 * The chapter's claim is that the 2nd from the Moon and the 2nd from the Sun mean the same
 * thing the 2nd from the lagna does. That makes the three frames genuinely comparable
 * rather than three unrelated readings, which is what turns their agreement into evidence.
 */
export function sudarshanaSigns(
  house: House, lagnaSign: SignIndex, moonSign: SignIndex, sunSign: SignIndex,
): Record<SudarshanaFrame, SignIndex> {
  return {
    lagna: mod12(lagnaSign + house - 1) as SignIndex,
    moon: mod12(moonSign + house - 1) as SignIndex,
    sun: mod12(sunSign + house - 1) as SignIndex,
  };
}

export interface SudarshanaAgreement {
  /** How many of the three frames judge the matter favourably. */
  agreeing: number;
  frames: number;
  verdict: 'supported' | 'mixed' | 'testing';
  /** True only when all three concur — the strongest signal the chapter offers. */
  unanimous: boolean;
}

/**
 * **The reason this chapter matters to Part 19.**
 *
 * Three frames judging the same house is three semi-independent readings of one question.
 * When all three concur that is corroboration of a kind nothing else in the corpus
 * provides — every other instrument is a single measurement. The confidence calculus should
 * take unanimity as a real multiplier and a 2-1 split as a real hedge.
 *
 * `bhavaAgreement` (Part 2) does the analogous thing across the four special ascendants.
 * The two are different frames on the same idea and should eventually feed one signal.
 */
export function sudarshanaAgreement(favourable: boolean[]): SudarshanaAgreement {
  const agreeing = favourable.filter(Boolean).length;
  const frames = favourable.length;
  return {
    agreeing,
    frames,
    unanimous: agreeing === frames || agreeing === 0,
    verdict: agreeing * 2 > frames ? 'supported' : agreeing * 2 < frames ? 'testing' : 'mixed',
  };
}

/**
 * 74.11-13's own resolution rule when a house carries both benefic and malefic influence:
 * the majority decides, and an equal count is genuinely mixed.
 *
 * Simple, but worth encoding because it is the text stating how to combine contradictory
 * indications — the exact problem Part 19 exists to solve, and the third place BPHS has
 * offered its own answer rather than leaving it open.
 */
export function majorityInfluence(benefics: number, malefics: number): 'auspicious' | 'mixed' | 'inauspicious' {
  if (benefics > malefics) return 'auspicious';
  if (malefics > benefics) return 'inauspicious';
  return 'mixed';
}

/**
 * 74.7-9: in the Sudarshana chakra the Sun is treated as benefic **in the first house
 * only** and malefic elsewhere — a frame-specific rule that contradicts the Sun's usual
 * treatment, and one to keep out of the general benefic/malefic machinery.
 */
export const SUN_BENEFIC_IN_FIRST_ONLY =
  'BPHS 74.7-9: within the Sudarshana chakra the Sun counts as benefic in the 1st house '
  + 'and malefic in the other eleven. This is local to this chapter — do not let it leak '
  + 'into the general benefic/malefic determination.';

/** 74.9 and 74.15-16: two clauses that soften a malefic verdict. */
export const SUDARSHANA_MITIGATIONS = [
  'A malefic in its sign of exaltation does not produce its evil effect (74.9).',
  'A natural benefic in mostly malefic vargas loses its benevolence, and a natural malefic '
  + 'in mostly benefic vargas loses its malevolence (74.15-16) — which makes benefic status '
  + 'varga-dependent, not fixed.',
] as const;

/** 74.14: with neither occupant nor aspect, the house is read from its lord alone. */
export const EMPTY_HOUSE_FALLBACK =
  'BPHS 74.14: a house neither occupied nor aspected is judged by its lord. A clean '
  + 'fallback the arbitration ordering should adopt — it means no house is ever unreadable.';

// ═════════════════════════════════════════════════════════════════════════════

export const CH72_74_NOT_YET_EXPRESSIBLE = [
  'Comparisons BETWEEN two bindu counts (72.7-8 needs "the 11th holds more than the 10th"). '
  + 'The `bindus` predicate compares a count to a constant, not to another count.',
  'Sudarshana agreement as a rule condition — needs the three frames on ChartFacts.',
  'Varga-dependent benefic status (74.15-16) — the same gap ch 11 and ch 30 hit.',
] as const;

export const CH72_74_SUMMARY =
  'Ch 72 gives the SAV its own thresholds and, in 72.30-31, states that the ashtakavarga '
  + 'OUTRANKS transit. Ch 73’s rays are the folded arc again — closeness x a per-planet '
  + 'maximum — and must not be confused with ch 28’s rasmi. Ch 74’s three frames make '
  + 'agreement countable, which is the confidence signal Part 19 needs.';
