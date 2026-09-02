// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 26a — Evaluation of Planetary Aspects. Programme Part 7.
// Source lines 9280-10000.
//
// **Aspects stop being binary.**
//
// The codebase has treated drishti as a yes/no: `grahaAspectsFrom` returns the houses a
// planet fully aspects, and everything else is nothing. BPHS 26.2-5 grades them, and
// grades them for EVERY planet:
//
//     3rd / 10th   quarter        (1/4)
//     5th / 9th    half           (1/2)
//     4th / 8th    three-quarter  (3/4)
//     7th          full
//
// So the Sun in the 1st does not aspect only the 7th — it aspects the 7th fully, the 4th
// and 8th at three-quarters, the 5th and 9th at half, and the 3rd and 10th at a quarter.
// Mars, Jupiter and Saturn then get their special houses promoted to FULL. That is a
// sevenfold expansion of what every non-special planet reaches, and it re-weights every
// aspect-conditioned rule in the corpus.
//
// 26.6-8 gives the same thing as a continuous function of longitude, in virupas (0-60,
// where 60 virupas = 1 rupa). **The two schemes agree exactly**: the continuous formula
// returns 15/30/45/60 at precisely the seven aspect houses and 0 at the other five. Two
// independently stated systems in one chapter reproducing each other is the strongest
// verification this corpus offers, and it is asserted in the tests.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House } from '../../types.js';

const mod360 = (n: number): number => ((n % 360) + 360) % 360;

/** 60 virupas make one rupa (26.12 notes). A full aspect is exactly one rupa. */
export const VIRUPAS_PER_RUPA = 60;

// ── 26.2-5 The graded house scheme ────────────────────────────────────────────

/**
 * Aspect strength in QUARTERS, by house distance, for any planet (26.2-5).
 * Index is the house counted from the planet's own (1 = its own house).
 */
export const ASPECT_QUARTERS: Record<House, 0 | 1 | 2 | 3 | 4> = {
  1: 0, 2: 0, 3: 1, 4: 3, 5: 2, 6: 0,
  7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0,
};

/**
 * The houses each planet aspects FULLY in addition to the 7th (26.2-5).
 * These override the graded value: Saturn's 3rd is full, not a quarter.
 */
export const SPECIAL_FULL_ASPECTS: Partial<Record<Graha, House[]>> = {
  saturn: [3, 10],
  jupiter: [5, 9],
  mars: [4, 8],
};

/**
 * Aspect strength in quarters from one house to another, for a given planet.
 *
 * This is the graded answer. `grahaAspectsFrom` in data/aspects.ts answers the narrower
 * question "which houses does this planet aspect FULLY", and stays correct for that — it
 * is not superseded, only complemented. Callers wanting the classical yes/no should keep
 * using it; callers wanting strength use this.
 */
export function aspectQuarters(graha: Graha, fromHouse: House, toHouse: House): 0 | 1 | 2 | 3 | 4 {
  const distance = (((toHouse - fromHouse) % 12) + 12) % 12 + 1;
  if (distance === 7) return 4;
  if (SPECIAL_FULL_ASPECTS[graha]?.includes(distance as House)) return 4;
  return ASPECT_QUARTERS[distance as House] ?? 0;
}

// ── 26.6-8 The continuous formula ─────────────────────────────────────────────

/**
 * The aspectual angle (26.6-8 notes): the forward arc from the aspector to the aspected.
 *
 * The translation's first sentence reads "the longitude of the aspected is to be deducted
 * from that of the aspector", but its own operational instruction immediately corrects
 * this — "if the longitude of the aspected is lesser than that of the aspector, increase
 * the longitude of the aspected by 360 to facilitate deduction" — which is
 * `(aspected − aspector) mod 360`. That is the reading used, and it is the one that
 * reproduces the house scheme; the literal first sentence does not.
 */
export const aspectAngle = (aspectorLong: number, aspectedLong: number): number =>
  mod360(aspectedLong - aspectorLong);

/**
 * The general drishti value in virupas, 0..60 (26.6-8).
 *
 * Piecewise, and continuous across every boundary:
 *   0–30     0
 *   30–60    (D − 30) / 2          → 15 at the 3rd
 *   60–90    (D − 60) + 15         → 45 at the 4th
 *   90–120   (120 − D) / 2 + 30    → 30 at the 5th
 *   120–150  150 − D               → 0 at the 6th
 *   150–180  (D − 150) × 2         → 60 at the 7th
 *   180–300  (300 − D) / 2         → 45/30/15/0 at the 8th/9th/10th/11th
 *   300–360  0
 */
export function drishtiValueGeneral(angle: number): number {
  const D = mod360(angle);
  if (D > 300) return 0;
  if (D > 180) return (300 - D) / 2;
  if (D > 150) return (D - 150) * 2;
  if (D > 120) return 150 - D;
  if (D > 90) return (120 - D) / 2 + 30;
  if (D > 60) return (D - 60) + 15;
  if (D > 30) return (D - 30) / 2;
  return 0;
}

/**
 * Saturn's aspect curve (26.9-10).
 *
 * Saturn's verses say "above N signs", so the branches are half-open at the TOP
 * — `(a, b]`. That convention is what puts the full value exactly on Saturn's own
 * special houses: 60 virupas at 60° (the 3rd) and at 270° (the 10th).
 */
export function drishtiValueSaturn(angle: number): number {
  const D = mod360(angle);
  if (D > 30 && D <= 60) return 2 * (D - 30);           // full at the 3rd
  if (D > 60 && D <= 90) return 60 - (D - 60) / 2;
  if (D > 240 && D <= 270) return (D - 240) + 30;       // full at the 10th
  if (D > 270 && D <= 300) return 2 * (300 - D);
  return drishtiValueGeneral(D);
}

/**
 * Mars's aspect curve (26.11).
 *
 * Mars's verses say "N Rāśhis &c" — N signs *and something* — so its branches are
 * half-open at the BOTTOM, `[a, b)`. That difference in wording is not cosmetic: it is
 * what places Mars's full value exactly on 90° (the 4th) and 210° (the 8th). Reading
 * Mars's ranges with Saturn's convention puts the 8th at 45 instead of 60.
 */
export function drishtiValueMars(angle: number): number {
  const D = mod360(angle);
  if (D > 60 && D < 90) return (D - 60) * 1.5 + 15;
  if (D >= 90 && D < 120) return 60 - (D - 90);         // full at the 4th
  if (D >= 210 && D < 240) return 60 - (D - 210);       // full at the 8th
  return drishtiValueGeneral(D);
}

/** Jupiter's aspect curve (26.12) — full at 120° (the 5th) and 240° (the 9th). */
export function drishtiValueJupiter(angle: number): number {
  const D = mod360(angle);
  if (D >= 90 && D < 120) return (D - 90) / 2 + 45;
  if (D >= 120 && D < 150) return 60 - (D - 120);       // full at the 5th
  if (D >= 210 && D < 240) return (D - 210) / 2 + 45;
  if (D >= 240 && D < 270) return 60 - (D - 240);       // full at the 9th
  return drishtiValueGeneral(D);
}

/**
 * The drishti value one planet casts on a point, in virupas (0..60).
 * Mars, Jupiter and Saturn use their own curves; everything else uses the general one.
 */
export function drishtiValue(graha: Graha, aspectorLong: number, aspectedLong: number): number {
  const D = aspectAngle(aspectorLong, aspectedLong);
  if (graha === 'saturn') return drishtiValueSaturn(D);
  if (graha === 'mars') return drishtiValueMars(D);
  if (graha === 'jupiter') return drishtiValueJupiter(D);
  return drishtiValueGeneral(D);
}

/** A drishti value expressed in quarters, 0..4 — the 26.2-5 scale. */
export const drishtiQuarters = (virupas: number): number => virupas / 15;

/** A drishti value in rupas, which is what Shadbala's drik bala will want (Part 11). */
export const drishtiRupas = (virupas: number): number => virupas / VIRUPAS_PER_RUPA;

/**
 * The special-planet curves are DISCONTINUOUS at some branch edges, and that is inherited
 * from the text rather than introduced here.
 *
 * Mars steps from 45 to 60 at 210° (its 8th aspect switching on), and Jupiter steps from
 * 30 to 0 at 150° and from 30 to 15 at 270°, because 26.12's stated ranges end there and
 * the verse says everything outside them "be treated as stated earlier" — i.e. falls back
 * to the general curve. The general curve itself is continuous everywhere.
 *
 * Recorded rather than smoothed: interpolating across those edges would be inventing a
 * rule the text does not give, and the discontinuity is small enough that it changes a
 * quarter-grade only within a degree or two of the boundary.
 */
export const DRISHTI_DISCONTINUITY_NOTE =
  'Mars and Jupiter have step changes where 26.11-12 stop stating special ranges and the '
  + 'general curve resumes (Mars at 210°, Jupiter at 150° and 270°). Inherited from the '
  + 'piecewise text, not smoothed — interpolating would invent a rule BPHS does not give. '
  + 'The general curve is continuous everywhere.';

/**
 * What this chapter changes about the codebase, stated plainly for the tracker.
 *
 * `grahaAspectsFrom` is NOT wrong and is NOT superseded — it answers "which houses does
 * this planet aspect fully", which stays a real and correct question. What was missing is
 * that every planet also aspects four further houses partially. Both live side by side,
 * and the aspect predicate's `minQuarter` chooses which one a rule means.
 */
export const GRADED_ASPECT_NOTE =
  'BPHS 26.2-5 grades aspects for ALL planets: 3rd/10th a quarter, 5th/9th a half, '
  + '4th/8th three-quarters, 7th full — with Mars, Jupiter and Saturn promoting their own '
  + 'special houses to full. grahaAspectsFrom still correctly answers the FULL-aspect '
  + 'question; this adds the partial ones it never covered.';
