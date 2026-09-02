// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 27c — Shadbala III: Drik bala, graha yuddha, Cheshta bala for the
// tara-grahas, Bhava bala, and the strength thresholds. Programme Part 11.
// Verses 19-40, lines 13470-13645.
//
// This part completes Shadbala and delivers the thing the whole programme has been
// building toward: **27.32-36 says how much strength is ENOUGH.** Until now every bala
// produced a number with no verdict attached. The Shadbala Pinda requirements turn
// "Jupiter has 402 virupas" into "Jupiter is strong" — which is what the hundreds of
// rules in Parts 20-33 that say "if strong" actually need.
//
// A CORRECTION TO THE PLAN, recorded because it was claimed and is false: this part does
// **NOT** supply bhava madhya. The Bhava bala verses (27.26-29) take the bhava's longitude
// and the four angles as INPUTS and never say how cusps are computed. A search of the whole
// text for a bhava-madhya definition returns nothing. So the thread that Part 2's
// `cuspStrength` and Part 8's house-aspect rule have been waiting on stays open, and it is
// not closed by BPHS at all — it will need a stated convention (Sripati, Porphyry, or
// equal-house) chosen and recorded as our own decision rather than the text's.
//
// The verse numbering also has a real gap: **30-31 do not exist in this edition.** The text
// runs 26-29 then 32-33. Recorded rather than assumed to be an extraction miss — the
// surrounding verses are continuous prose with no break.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House, SignIndex } from '../../types.js';
import { foldedArcBala } from './ch27b.js';

/** The six strengths, as 27.25 restates them. */
export const SHADBALA_SIX = [
  'sthana', 'dig', 'kala', 'drik', 'cheshta', 'naisargika',
] as const;

// ── 27.19 Drik bala ───────────────────────────────────────────────────────────

/**
 * Aspectual strength (27.19), reading the Drishti Pinda that Part 7 computes.
 *
 * "Reduce one fourth of the Drishti Pinda if a planet has malefic aspects on it and add a
 * fourth if it is aspected by a benefic. Super add the entire aspect of Mercury and
 * Jupiter to get the net strength."
 *
 * AMBIGUITY, flagged rather than resolved silently. The verse can be read two ways: the
 * quartering may apply to the net pinda, or benefic and malefic pindas may be quartered
 * separately. The settled practice — and the reading implemented — is
 * `(benefic − malefic) / 4`, with Mercury's and Jupiter's aspects added **in full** on top
 * rather than quartered, which is what "super add the entire aspect" states.
 *
 * The caller supplies the three sums separately, so a different reading remains available
 * without rewriting this function.
 *
 * @param beneficPinda  drishti virupas cast by benefics, EXCLUDING Mercury and Jupiter
 * @param maleficPinda  drishti virupas cast by malefics
 * @param mercuryJupiterPinda drishti virupas cast by Mercury and Jupiter, added in full
 */
export function drikBala(
  beneficPinda: number, maleficPinda: number, mercuryJupiterPinda = 0,
): number {
  return (beneficPinda - maleficPinda) / 4 + mercuryJupiterPinda;
}

export const DRIK_BALA_AMBIGUITY =
  '27.19 can be read as quartering the NET pinda or as quartering benefic and malefic '
  + 'pindas separately. Implemented as (benefic - malefic) / 4, with Mercury and Jupiter '
  + 'added in full per "super add the entire aspect". The caller passes the three sums '
  + 'separately so another reading stays reachable.';

// ── 27.20 Graha yuddha ────────────────────────────────────────────────────────

export interface GrahaYuddhaResult {
  victor: Graha;
  vanquished: Graha;
  /** The difference transferred: added to the victor, deducted from the loser. */
  transfer: number;
  victorShadbala: number;
  vanquishedShadbala: number;
}

/** Planetary war is only between the tara-grahas, Mars to Saturn (27.20). */
export const YUDDHA_PLANETS: Graha[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/**
 * Planetary war (27.20) — the clause that has been blocking a ch 11.15-16 house-failure
 * condition since Part 6.
 *
 * "The difference between the Shad-balas of the two should be added to the victor's
 * Shad-bala and deducted from the Shad-bala of the vanquished."
 *
 * **BPHS does not say who wins.** The verse gives only the transfer. Santhanam's ch 11
 * notes cite C. G. Rajan: a war requires identical longitudes and the same hemisphere of
 * latitude, and the planet with the HIGHER latitude wins. That is commentary, not root
 * text, so the winner is the caller's to decide and this function takes it as given.
 */
export function grahaYuddha(
  victor: Graha, vanquished: Graha, victorShadbala: number, vanquishedShadbala: number,
): GrahaYuddhaResult {
  const transfer = Math.abs(victorShadbala - vanquishedShadbala);
  return {
    victor,
    vanquished,
    transfer,
    victorShadbala: victorShadbala + transfer,
    vanquishedShadbala: vanquishedShadbala - transfer,
  };
}

export const YUDDHA_WINNER_NOTE =
  'BPHS 27.20 gives the transfer but never says who wins. Santhanam\'s ch 11 notes cite '
  + 'C. G. Rajan: identical longitudes, same latitude hemisphere, and the higher latitude '
  + 'takes the victory. Commentary rather than root text, so the caller decides.';

// ── 27.21-23 The eight motions ────────────────────────────────────────────────

/**
 * The eight kinds of planetary motion and their Cheshta strengths (27.21-23).
 *
 * Note the shape of it: **retrogression is the strongest** at a full rupa, and Sama —
 * ordinary average motion — is the weakest at 7.5. Cheshta means "effort", and the scheme
 * rewards a planet doing something unusual. A reader expecting "faster is stronger" will
 * mis-encode this, so the values are asserted individually in the tests.
 */
export const MOTION_STRENGTHS = {
  vakra: 60,        // retrogression
  anuvakra: 30,     // retrograde back into the previous sign
  vikala: 15,       // stationary
  manda: 30,        // somewhat slow
  mandatara: 15,    // slower still
  sama: 7.5,        // ordinary motion — the weakest
  chara: 45,        // faster than ordinary
  atichara: 30,     // accelerated into the next sign
} as const;

export type MotionKind = keyof typeof MOTION_STRENGTHS;

export const MOTION_ORDER: MotionKind[] = [
  'vakra', 'anuvakra', 'vikala', 'manda', 'mandatara', 'sama', 'chara', 'atichara',
];

export const motionStrength = (kind: MotionKind): number => MOTION_STRENGTHS[kind];

// ── 27.24-25 Cheshta bala for Mars to Saturn ─────────────────────────────────

/**
 * Motional strength for the tara-grahas (27.24-25).
 *
 * Take the mean of the mean and true longitudes, subtract it from the seeghrocha, fold the
 * result into 0-180, divide by three.
 *
 * **The fifth user of `foldedArcBala`** — after Uchcha, Dig, Paksha and Ayana. The zero
 * point here is the seeghrocha. Five of BPHS's strengths are one computation with five
 * different origins, which is a genuine structural fact about the chapter rather than a
 * coincidence of translation.
 */
export function cheshtaKendra(meanLongitude: number, trueLongitude: number, seeghrocha: number): number {
  const midpoint = (meanLongitude + trueLongitude) / 2;
  return ((seeghrocha - midpoint) % 360 + 360) % 360;
}

export function cheshtaBalaTara(
  meanLongitude: number, trueLongitude: number, seeghrocha: number,
): number {
  return foldedArcBala(cheshtaKendra(meanLongitude, trueLongitude, seeghrocha), 0);
}

// ── 27.26-29 Bhava bala ───────────────────────────────────────────────────────

/**
 * Which angle a bhava's strength is measured FROM, by the sign it falls in (27.26-29).
 *
 * The verse groups the signs by which cusp gets deducted. Sagittarius and Capricorn are
 * split at their midpoints, which is why this takes a degree as well as a sign.
 */
export type BhavaReferenceAngle = 'ascendant' | 'nadir' | 'descendant' | 'meridian';

export function bhavaReferenceAngle(sign: SignIndex, degInSign: number): BhavaReferenceAngle {
  const s = ((sign % 12) + 12) % 12;
  // Virgo, Gemini, Libra, Aquarius, and the first half of Sagittarius.
  if ([5, 2, 6, 10].includes(s) || (s === 8 && degInSign < 15)) return 'descendant';
  // Aries, Taurus, Leo, first half of Capricorn, second half of Sagittarius.
  if ([0, 1, 4].includes(s) || (s === 9 && degInSign < 15) || (s === 8 && degInSign >= 15)) return 'nadir';
  // Cancer and Scorpio.
  if ([3, 7].includes(s)) return 'ascendant';
  // Second half of Capricorn, and Pisces.
  return 'meridian';
}

/**
 * The positional part of Bhava bala — "Bhava Dig bala" (27.26-29).
 *
 * Deduct the appropriate angle from the bhava's longitude, fold into 0-180, divide by
 * three. **The sixth user of `foldedArcBala`.**
 *
 * TAKES CUSPS AS INPUT AND DOES NOT COMPUTE THEM. BPHS never defines bhava madhya; see the
 * module header. A caller working whole-sign must pass sign boundaries and treat the
 * result as exact only there.
 */
export function bhavaDigBala(bhavaLongitude: number, referenceAngleLongitude: number): number {
  return foldedArcBala(bhavaLongitude, referenceAngleLongitude);
}

export interface BhavaBalaParts {
  /** From 27.26-29's angle deduction. */
  positional: number;
  /** A quarter added for a benefic aspect on the bhava, a quarter deducted for a malefic. */
  beneficAspects: number;
  maleficAspects: number;
  /** Mercury's or Jupiter's aspectual strength, added in full. */
  mercuryJupiterAspect: number;
  /** The strength of the bhava's lord, added on top. */
  lordStrength: number;
}

/**
 * Total Bhava bala (27.26-29).
 *
 * The verse stacks four adjustments onto the positional value: a quarter more for a
 * benefic aspect, a quarter less for a malefic one, the full aspectual strength of Mercury
 * or Jupiter if either aspects the bhava, and then the strength of the bhava's own lord.
 *
 * The same quartering ambiguity as Drik bala (27.19) applies, and is handled the same way —
 * the caller supplies the aspect sums separately.
 */
export function bhavaBala(parts: BhavaBalaParts): number {
  return parts.positional
    + parts.beneficAspects / 4
    - parts.maleficAspects / 4
    + parts.mercuryJupiterAspect
    + parts.lordStrength;
}

// ── 27.32-36 The thresholds — what "strong" finally means ────────────────────

/**
 * The Shadbala Pinda a planet needs to count as strong (27.32-33), in virupas.
 * Exceeding it makes the planet "very strong".
 *
 * **This is the number the whole programme has been building toward.** Every bala so far
 * produced a quantity with no verdict; this is what converts one into "strong", which is
 * the predicate hundreds of rules in Parts 20-33 depend on.
 */
export const SHADBALA_REQUIRED: Record<string, number> = {
  sun: 390, moon: 360, mars: 300, mercury: 420, jupiter: 390, venus: 330, saturn: 300,
};

/** Is a planet strong by its Shadbala Pinda (27.32-33)? */
export function isStrongByShadbala(graha: Graha, totalVirupas: number): boolean | null {
  const need = SHADBALA_REQUIRED[graha];
  return need == null ? null : totalVirupas >= need;
}

/** "If the strength exceeds, the planet is deemed to be very strong" (27.33). */
export function shadbalaVerdict(
  graha: Graha, totalVirupas: number,
): 'very-strong' | 'strong' | 'weak' | null {
  const need = SHADBALA_REQUIRED[graha];
  if (need == null) return null;
  if (totalVirupas > need) return 'very-strong';
  if (totalVirupas === need) return 'strong';
  return 'weak';
}

/**
 * Per-component minimums by planet group (27.34-36).
 *
 * Santhanam's notes make the grouping explicit: A is Jupiter, Mercury and the Sun; B is
 * the Moon and Venus; C is Mars and Saturn. A planet short of the total Pinda can still be
 * "considerably favourable" if it meets these.
 */
export const COMPONENT_MINIMUMS = {
  A: { planets: ['jupiter', 'mercury', 'sun'] as Graha[], sthana: 165, dig: 35, kala: 50, cheshta: 112, ayana: 30 },
  B: { planets: ['moon', 'venus'] as Graha[], sthana: 133, dig: 50, kala: 30, cheshta: 100, ayana: 40 },
  C: { planets: ['mars', 'saturn'] as Graha[], sthana: 96, dig: 30, kala: 40, cheshta: 67, ayana: 20 },
} as const;

export type ComponentGroup = keyof typeof COMPONENT_MINIMUMS;

export function componentGroupOf(graha: Graha): ComponentGroup | null {
  for (const g of ['A', 'B', 'C'] as ComponentGroup[]) {
    if ((COMPONENT_MINIMUMS[g].planets as Graha[]).includes(graha)) return g;
  }
  return null;
}

export interface ComponentCheck {
  sthana: number; dig: number; kala: number; cheshta: number; ayana: number;
}

/** Which per-component minimums a planet meets (27.34-36). */
export function meetsComponentMinimums(
  graha: Graha, have: ComponentCheck,
): { group: ComponentGroup | null; met: string[]; short: string[] } {
  const group = componentGroupOf(graha);
  if (!group) return { group: null, met: [], short: [] };
  const min = COMPONENT_MINIMUMS[group];
  const met: string[] = [];
  const short: string[] = [];
  for (const k of ['sthana', 'dig', 'kala', 'cheshta', 'ayana'] as const) {
    (have[k] >= min[k] ? met : short).push(k);
  }
  return { group, met, short };
}

// ── 27.37-38 What the strength is FOR ─────────────────────────────────────────

/**
 * 27.37-38: "Whatever yogas or effects have been stated with respect to a Bhava will come
 * to pass through the strongest planet."
 *
 * This is the arbitration principle the programme's §4 was designed around, stated by the
 * text itself: when several planets bear on a matter, the strongest is the one that
 * delivers it. Part 19's ranking function should cite this rather than invent a rule.
 */
export const STRONGEST_PLANET_DELIVERS =
  'BPHS 27.37-38: whatever a bhava promises comes to pass through the STRONGEST planet '
  + 'bearing on it. The text\'s own statement of the arbitration principle in Programme §4.';

/**
 * NOT ENCODED — 27.39-40 lists the qualities of a person fit to give predictions
 * (skill in mathematics, grammar, logic, control of the senses, and so on). It is
 * professional counsel to the astrologer, not a rule about a chart, so there is no
 * predicate to extract.
 *
 * Verses 30-31 do not exist in this edition: the text runs 26-29 straight to 32-33 with
 * continuous prose and no break. Recorded so a later reader does not hunt for them.
 */
export const CH27_NOT_ENCODED = {
  '39-40': 'Qualities of a fit astrologer — counsel, not a chart rule. No predicate.',
  '30-31': 'Absent from this edition. 26-29 runs straight into 32-33 with no break.',
} as const;
