// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 27b — Shadbala II: Dig, Kala, Naisargika and Cheshta bala.
// Programme Part 10. Source verses 7-18 (lines 10855-13470).
//
// A note on scope, because the chapter's verses are NOT evenly spread through its lines:
// verses 8-13 sit at lines 10873-10959, which fell inside **Part 9's** stated range.
// Part 9 extracted only verses 1-6 and its "every verse in range is classified" claim was
// therefore overstated. Those verses are covered here, where they belong by subject.
// Recorded rather than quietly absorbed — see KNOWLEDGE_PROGRESS.
//
// THE PATTERN THIS PART EXPOSES. Four different strengths in this chapter use one shape:
//
//     take an arc from some zero point, fold it into 0-180, divide by 3  →  0-60 virupas
//
// Uchcha bala measures from deep debilitation (27.1). Dig bala measures from the opposite
// cusp (27.7). Paksha bala measures from the Sun (27.10-11). Ayana bala measures from a
// declination-derived point (27.15-17). They are the same computation with different zero
// points, and `foldedArcBala` below is now that one computation. Part 9's
// `shadbalaUchchaBala` was retrofitted onto it in this part.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House } from '../../types.js';

const mod360 = (n: number): number => ((n % 360) + 360) % 360;

/**
 * The shape four of BPHS's strengths share (27.1, 27.7, 27.10-11, 27.15-17).
 *
 * Fold the arc between a longitude and its zero-strength point into 0-180, then divide by
 * three. Zero at the zero point, one full rupa at the opposite. Every caller differs only
 * in what it treats as the zero point.
 */
export function foldedArcBala(longitude: number, zeroPoint: number): number {
  let arc = Math.abs(mod360(longitude) - mod360(zeroPoint)) % 360;
  if (arc > 180) arc = 360 - arc;
  return arc / 3;
}

// ── 27.7 Dig bala ─────────────────────────────────────────────────────────────

/**
 * The house whose CUSP gives a planet zero directional strength (27.7).
 *
 * The verse is phrased as a subtraction from the weak cusp, not the strong one: deduct the
 * 4th from the Sun and Mars, the 7th from Jupiter and Mercury, the 10th from Venus and the
 * Moon, the ascendant from Saturn. Each planet is therefore strongest on the OPPOSITE
 * cusp, which is exactly Part 1's `DIG_BALA_HOUSE`.
 */
export const DIG_BALA_ZERO_HOUSE: Record<string, House> = {
  sun: 4, mars: 4,
  jupiter: 7, mercury: 7,
  venus: 10, moon: 10,
  saturn: 1,
};

/** Where each planet is strongest — the opposite cusp. Agrees with Part 1's DIG_BALA_HOUSE. */
export const DIG_BALA_STRONG_HOUSE: Record<string, House> = {
  sun: 10, mars: 10,
  jupiter: 1, mercury: 1,
  venus: 4, moon: 4,
  saturn: 7,
};

/**
 * Directional strength, 0-60 virupas (27.7).
 *
 * **Takes the CUSP longitude, not a house number.** BPHS is explicit that the strength is
 * "full on the cusp of the respective house and nil on the cusp of the opposite house" —
 * it is a continuous function of the planet's distance from that cusp, not a per-house
 * band. The codebase still has no bhava madhya (the standing thread, Part 11), so a caller
 * working whole-sign must pass the sign boundary and accept that it is exact only there.
 */
export function digBala(graha: Graha, longitude: number, zeroCuspLongitude: number): number | null {
  if (!(graha in DIG_BALA_ZERO_HOUSE)) return null; // nodes are excluded from Shadbala
  return foldedArcBala(longitude, zeroCuspLongitude);
}

// ── 27.8-9 Nathonnatha bala ───────────────────────────────────────────────────

/** Planets that gain by NIGHT — full at midnight (27.8-9). */
export const NIGHT_STRONG: Graha[] = ['moon', 'mars', 'saturn'];
/** Planets that gain by DAY — full at noon. */
export const DAY_STRONG: Graha[] = ['sun', 'jupiter', 'venus'];

/**
 * Nathonnatha bala, 0-60 virupas (27.8-9).
 *
 * Unnata is the distance from midnight; Nata is 30 ghatis minus that. Doubling Nata gives
 * the night-strong planets their bala, and the day-strong ones take 60 minus it.
 * **Mercury always gets the full rupa, day or night.**
 *
 * A ghati is 24 minutes, so 30 ghatis is twelve hours — the arc from midnight to noon.
 * At midnight the night planets hold 60 and the day planets 0; at noon it reverses.
 *
 * @param ghatisFromMidnight 0-30, the Unnata
 */
export function nathonnathaBala(graha: Graha, ghatisFromMidnight: number): number | null {
  if (graha === 'mercury') return 60;
  const unnata = Math.min(30, Math.max(0, ghatisFromMidnight));
  const nathaBala = 2 * (30 - unnata);
  if (NIGHT_STRONG.includes(graha)) return nathaBala;
  if (DAY_STRONG.includes(graha)) return 60 - nathaBala;
  return null; // nodes
}

// ── 27.10-11 Paksha bala ──────────────────────────────────────────────────────

/**
 * Lunar-phase strength, 0-60 virupas (27.10-11).
 *
 * The elongation of the Moon from the Sun, folded and divided by three — the shared shape
 * again, with the Sun as the zero point. That value goes to the BENEFICS; malefics take
 * 60 minus it. So benefics peak at the full Moon and malefics at the new.
 *
 * `isBenefic` is the caller's, because benefic status is chart-dependent: BPHS 3.11 makes
 * a waning Moon malefic and Mercury take the nature of its company.
 */
export function pakshaBala(moonLongitude: number, sunLongitude: number, isBenefic: boolean): number {
  const beneficValue = foldedArcBala(moonLongitude, sunLongitude);
  return isBenefic ? beneficValue : 60 - beneficValue;
}

// ── 27.12 Tribhaga bala ───────────────────────────────────────────────────────

/** Which planet rules each third of the day and of the night (27.12). */
export const TRIBHAGA_DAY: Graha[] = ['mercury', 'sun', 'saturn'];
export const TRIBHAGA_NIGHT: Graha[] = ['moon', 'venus', 'mars'];

/**
 * Tribhaga bala — one full rupa, or nothing (27.12).
 * **Jupiter takes it at all times**, which is the one exception the verse names.
 *
 * @param third 0, 1 or 2 — which third of the day or night the birth falls in
 */
export function tribhagaBala(graha: Graha, isDay: boolean, third: 0 | 1 | 2): number {
  if (graha === 'jupiter') return 60;
  const ruler = (isDay ? TRIBHAGA_DAY : TRIBHAGA_NIGHT)[third];
  return ruler === graha ? 60 : 0;
}

// ── 27.13 Varsha / Masa / Dina / Hora bala ────────────────────────────────────

/** 15 to the year lord, 30 to the month lord, 45 to the day lord, 60 to the hora lord (27.13). */
export const PERIOD_LORD_VIRUPAS = { varsha: 15, masa: 30, dina: 45, hora: 60 } as const;
export type PeriodLordKind = keyof typeof PERIOD_LORD_VIRUPAS;

/** Sum whichever of the four period-lordships a planet holds (27.13). */
export function varshaMasaDinaHoraBala(
  graha: Graha, lords: Partial<Record<PeriodLordKind, Graha>>,
): number {
  return (Object.keys(PERIOD_LORD_VIRUPAS) as PeriodLordKind[])
    .reduce((sum, k) => (lords[k] === graha ? sum + PERIOD_LORD_VIRUPAS[k] : sum), 0);
}

// ── 27.14 Naisargika bala ─────────────────────────────────────────────────────

/**
 * Natural strength (27.14): one rupa divided by seven, multiplied by 1 through 7 for
 * Saturn, Mars, Mercury, Jupiter, Venus, the Moon and the Sun.
 *
 * **Exactly Part 1's `naisargikaBala` × 60** — verified per planet in the tests. Part 1
 * derived the ordering from ch 3.38 without the virupa scale; this supplies the scale.
 */
export const NAISARGIKA_ASCENDING: Graha[] = [
  'saturn', 'mars', 'mercury', 'jupiter', 'venus', 'moon', 'sun',
];

export function naisargikaBalaVirupas(graha: Graha): number | null {
  const i = NAISARGIKA_ASCENDING.indexOf(graha);
  return i < 0 ? null : (60 / 7) * (i + 1);
}

// ── 27.15-17 Ayana bala ───────────────────────────────────────────────────────

/** The three khandas used to approximate declination (27.15-17). They sum to 90. */
export const AYANA_KHANDAS = [45, 33, 12] as const;

/**
 * The kranti-like quantity of 27.15-17, 0-90.
 *
 * Take the Bhuja — the tropical longitude's distance from the nearest equinox, so 0-90 —
 * then accumulate the khandas by whole signs and interpolate the remainder through the
 * next khanda. The result runs 0 at an equinox to 90 at a solstice.
 */
export function ayanaKranti(bhuja: number): number {
  const b = Math.min(90, Math.max(0, bhuja));
  const sign = Math.min(2, Math.floor(b / 30));
  const cumulative = AYANA_KHANDAS.slice(0, sign).reduce((a, k) => a + k, 0);
  return cumulative + ((b - sign * 30) * AYANA_KHANDAS[sign]!) / 30;
}

/** The Bhuja: distance from the nearest equinox, 0-90 (27.15-17). */
export function bhujaFromEquinox(tropicalLongitude: number): number {
  const l = mod360(tropicalLongitude);
  const fromAries = l > 180 ? 360 - l : l;      // 0..180
  return fromAries > 90 ? 180 - fromAries : fromAries;
}

/** Planets whose Ayana bala rises in the SOUTHERN half — Moon and Saturn (27.15-17). */
export const AYANA_SOUTHERN: Graha[] = ['moon', 'saturn'];
/** Planets whose Ayana bala rises in the NORTHERN half. */
export const AYANA_NORTHERN: Graha[] = ['sun', 'mars', 'venus', 'jupiter'];

/**
 * Ayana bala, 0-60 virupas (27.15-17).
 *
 * Three signs (90°) plus or minus the kranti, divided by three. The sign of the correction
 * flips by planet: the Moon and Saturn gain from Libra onward and lose from Aries to Virgo;
 * the Sun, Mars, Venus and Jupiter are the reverse; **Mercury is always additive**, so its
 * Ayana bala never drops below 30.
 *
 * Takes a TROPICAL longitude — the verse says to add the ayanamsa before finding the Bhuja.
 */
export function ayanaBala(graha: Graha, tropicalLongitude: number): number | null {
  const kranti = ayanaKranti(bhujaFromEquinox(tropicalLongitude));
  const inSouthernHalf = mod360(tropicalLongitude) >= 180; // Libra onward
  let additive: boolean;
  if (graha === 'mercury') additive = true;
  else if (AYANA_SOUTHERN.includes(graha)) additive = inSouthernHalf;
  else if (AYANA_NORTHERN.includes(graha)) additive = !inSouthernHalf;
  else return null; // nodes
  return (90 + (additive ? kranti : -kranti)) / 3;
}

// ── 27.18 Cheshta bala for the luminaries ─────────────────────────────────────

/**
 * The Sun's Cheshta bala is its Ayana bala; the Moon's is its Paksha bala (27.18).
 *
 * A neat economy in the text: neither luminary retrogrades, so its "motional" strength is
 * borrowed from a strength it already has.
 *
 * RETROFIT (Programme Part 12). Ch 28.3-4 gives the luminaries their OWN Cheshta Kendras
 * — the Sun's is the tropical Sun plus 90 degrees, the Moon's is the elongation — which
 * looked at first like a contradiction of this verse. It is not. The Moon's is an exact
 * identity: the elongation folded and divided by three IS Paksha bala for a benefic. The
 * Sun's is a linear stand-in for Ayana bala that agrees with it at the equinox and both
 * solstices and differs in between. So 27.18 is a shorthand that 28.3-4 makes precise,
 * and both are now encoded (`cheshtaKendraSun`, `cheshtaKendraMoon` in ch28.ts).
 */
export function cheshtaBalaLuminary(
  graha: 'sun' | 'moon', ayanaOrPaksha: number,
): number {
  return ayanaOrPaksha;
}

export const CHESHTA_LUMINARY_NOTE =
  'The Sun\'s Cheshta bala IS its Ayana bala, and the Moon\'s IS its Paksha bala (27.18). '
  + 'Neither luminary retrogrades, so the text borrows a strength each already has. '
  + 'Ch 28.3-4 supplies the underlying Cheshta Kendras: the Moon’s reproduces Paksha bala '
  + 'exactly, the Sun’s is a linear stand-in for Ayana bala agreeing at the equinox and '
  + 'both solstices.';

// ── Kala bala total ───────────────────────────────────────────────────────────

export interface KalaBalaParts {
  nathonnatha: number;
  paksha: number;
  tribhaga: number;
  varshaMasaDinaHora: number;
  ayana: number;
}

/** Kala bala sums its five parts (27.8-17). Maximum 60+60+60+150+60 = 390 virupas. */
export const KALA_BALA_MAX = 60 + 60 + 60
  + (PERIOD_LORD_VIRUPAS.varsha + PERIOD_LORD_VIRUPAS.masa + PERIOD_LORD_VIRUPAS.dina + PERIOD_LORD_VIRUPAS.hora)
  + 60;

export function kalaBala(parts: KalaBalaParts): number {
  return parts.nathonnatha + parts.paksha + parts.tribhaga
    + parts.varshaMasaDinaHora + parts.ayana;
}

export const KALA_SUBCOMPONENTS = [
  'nathonnatha', 'paksha', 'tribhaga', 'varshaMasaDinaHora', 'ayana',
] as const;
