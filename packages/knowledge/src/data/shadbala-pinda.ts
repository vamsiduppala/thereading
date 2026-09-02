// Shadbala Pinda — the assembler.
//
// Every component of BPHS chapter 27's six-fold strength has existed as a function since Parts
// 9-11. What has never existed is the thing that runs them all and sums them, so
// `isStrongByShadbala(graha, totalVirupas)` has always demanded a total its caller had to
// produce and nobody did.
//
// **The cost of that gap was larger than it looked.** Seven rules in the registry use the
// `strength` predicate and **not one of them can fire on a real chart** — they only evaluate on
// synthetic charts, where the calibration generator injects a `shadbala` field. The engine's own
// `planetStrength` is explicitly "Shadbala-inspired… no exact Rupa/Virupa units", a different
// quantity in different units, so it cannot stand in.
//
// This module closes that. It also makes BPHS's own definition of *strong* available to every
// future rule, which is what BPHS 75.1's `balibhiḥ` requires and what Saravali ch 35 and Brihat
// Jataka ch 2 independently corroborate.
//
// **Two design rules, both from the programme's standing discipline.**
//
// 1. **Explicit input, never inference.** Shadbala genuinely needs the birth circumstances —
//    paksha, day/night, the tribhaga third, the period lords, mean longitudes for cheshta. The
//    caller supplies them or the component returns `null`. Nothing is estimated.
// 2. **An incomplete total must never be compared to a threshold.** This is the trap the module
//    is built to avoid: a total missing one component is systematically *lower* than a complete
//    one, so comparing it to chapter 27's requirement would silently report strong planets as
//    weak — and would fail every Mahapurusha yoga rather than obviously erroring. So the result
//    carries its own completeness and `shadbalaVerdictOf` refuses to judge a partial one.

import type { Graha, House, SignIndex } from '../types.js';
import {
  SHADBALA_PLANETS, shadbalaUchchaBala, saptavargajaBala, ojhayugmarasiamsaBala,
  kendradiBala, drekkanaBala, sthanaBala, type SaptavargajaTier,
} from './bphs/ch27a.js';
import {
  DIG_BALA_ZERO_HOUSE, digBala, nathonnathaBala, pakshaBala, tribhagaBala,
  varshaMasaDinaHoraBala, naisargikaBalaVirupas, ayanaBala, kalaBala,
  type PeriodLordKind,
} from './bphs/ch27b.js';
import { drikBala, cheshtaBalaTara, SHADBALA_REQUIRED } from './bphs/ch27c.js';
import { bhavaMadhya } from './bhava.js';

// ─────────────────────────────────────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────────────────────────────────────

export interface ShadbalaPlanetInput {
  /** Sidereal longitude, 0-360. */
  longitude: number;
  /** TROPICAL longitude — ayana bala measures declination from the equinox, not the ayanamsa. */
  tropicalLongitude?: number;
  /** The house the planet occupies, for Kendradi bala. */
  house: House;
  /** Its navamsa sign, for Ojhayugmarasiamsa bala. */
  navamsaSign?: SignIndex;
  /** Its dignity tier in each of the seven vargas, for Saptavargaja bala. */
  saptavargajaTier?: (divisor: number) => SaptavargajaTier;
  /** Mean longitude and seeghrocha — Cheshta bala for the five tara-grahas. */
  meanLongitude?: number;
  seeghrocha?: number;
  /** Aspect pindas received, for Drik bala (27.19). */
  drik?: { benefic: number; malefic: number; mercuryJupiter?: number };
}

export interface ShadbalaInput {
  /** Sidereal longitude of the ascendant — the 1st bhava's MIDPOINT under our convention. */
  lagnaLongitude: number;
  sunLongitude?: number;
  moonLongitude?: number;
  /** Ghatis elapsed from midnight, for Nathonnatha bala. */
  ghatisFromMidnight?: number;
  isDay?: boolean;
  /** Which third of the day or night the birth falls in, for Tribhaga bala. */
  tribhagaThird?: 0 | 1 | 2;
  /** Lords of the year, month, day and hora, for Varsha-Masa-Dina-Hora bala. */
  periodLords?: Partial<Record<PeriodLordKind, Graha>>;
  planets: Partial<Record<Graha, ShadbalaPlanetInput>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Result
// ─────────────────────────────────────────────────────────────────────────────

export interface ShadbalaComponents {
  sthana: number | null;
  dig: number | null;
  kala: number | null;
  cheshta: number | null;
  naisargika: number | null;
  drik: number | null;
}

export interface ShadbalaPlanetResult {
  graha: Graha;
  components: ShadbalaComponents;
  /** Sum of the components that could be computed, in virupas. */
  total: number;
  /** True only when all six are present. A partial total must not meet a threshold. */
  complete: boolean;
  /** Which of the six could not be computed, and therefore what the caller must supply. */
  missing: (keyof ShadbalaComponents)[];
}

// ─────────────────────────────────────────────────────────────────────────────
// The assembler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 27's six-fold strength, assembled per planet.
 *
 * The nodes are excluded throughout — chapter 27 gives them no Shadbala, and every component
 * function already returns `null` for them rather than a zero that would look like a measurement.
 *
 * **Dig bala is where the bhava madhya finally matters.** 27.6-7 measures a planet's distance
 * from the point of its *least* dig bala, and that point is a house cusp — which had no
 * definition until now. `DIG_BALA_ZERO_HOUSE` names the house per planet (Saturn's is the 1st,
 * the Sun's and Mars's the 4th, Jupiter's and Mercury's the 7th, Venus's and the Moon's the
 * 10th) and `bhavaMadhya` now supplies its longitude.
 */
export function shadbalaPinda(input: ShadbalaInput): Record<string, ShadbalaPlanetResult> {
  const out: Record<string, ShadbalaPlanetResult> = {};

  for (const graha of SHADBALA_PLANETS) {
    const p = input.planets[graha];
    if (!p) continue;

    const components: ShadbalaComponents = {
      sthana: sthanaOf(graha, p),
      dig: digOf(graha, p, input.lagnaLongitude),
      kala: kalaOf(graha, p, input),
      cheshta: cheshtaOf(graha, p, input),
      naisargika: naisargikaBalaVirupas(graha),
      drik: p.drik ? drikBala(p.drik.benefic, p.drik.malefic, p.drik.mercuryJupiter ?? 0) : null,
    };

    const missing = (Object.keys(components) as (keyof ShadbalaComponents)[])
      .filter((k) => components[k] == null);
    const total = (Object.values(components) as (number | null)[])
      .reduce((sum: number, v) => sum + (v ?? 0), 0);

    out[graha] = { graha, components, total, complete: missing.length === 0, missing };
  }
  return out;
}

/** Sthana bala (27.3-5) — five parts, and all five are needed for a figure. */
function sthanaOf(graha: Graha, p: ShadbalaPlanetInput): number | null {
  const uchcha = shadbalaUchchaBala(graha, p.longitude);
  if (uchcha == null || !p.saptavargajaTier || p.navamsaSign == null) return null;
  const sign = Math.floor(((p.longitude % 360) + 360) % 360 / 30) as SignIndex;
  return sthanaBala(graha, {
    uchcha,
    saptavargaja: saptavargajaBala(p.saptavargajaTier),
    ojhayugmarasiamsa: ojhayugmarasiamsaBala(graha, sign, p.navamsaSign),
    kendradi: kendradiBala(p.house),
    drekkana: drekkanaBala(graha, (((p.longitude % 30) + 30) % 30)),
  }).total;
}

/** Dig bala (27.6-7), measured from the cusp of the planet's weakest house. */
function digOf(graha: Graha, p: ShadbalaPlanetInput, lagnaLongitude: number): number | null {
  const zeroHouse = DIG_BALA_ZERO_HOUSE[graha];
  if (zeroHouse == null) return null;
  return digBala(graha, p.longitude, bhavaMadhya(lagnaLongitude, zeroHouse));
}

/** Kala bala (27.8-17) — five parts, each needing a birth circumstance. */
function kalaOf(graha: Graha, p: ShadbalaPlanetInput, input: ShadbalaInput): number | null {
  if (input.ghatisFromMidnight == null || input.isDay == null
    || input.tribhagaThird == null || input.sunLongitude == null
    || input.moonLongitude == null || p.tropicalLongitude == null) return null;
  const nathonnatha = nathonnathaBala(graha, input.ghatisFromMidnight);
  const ayana = ayanaBala(graha, p.tropicalLongitude);
  if (nathonnatha == null || ayana == null) return null;
  return kalaBala({
    nathonnatha,
    paksha: pakshaBala(input.moonLongitude, input.sunLongitude, isBeneficForPaksha(graha)),
    tribhaga: tribhagaBala(graha, input.isDay, input.tribhagaThird),
    varshaMasaDinaHora: varshaMasaDinaHoraBala(graha, input.periodLords ?? {}),
    ayana,
  });
}

/**
 * Cheshta bala (27.18, 27.21-23).
 *
 * ⚠️ **The luminaries do not use motion.** 27.18: the Sun's Cheshta bala IS its Ayana bala and
 * the Moon's IS its Paksha bala — neither retrogrades, so the text borrows a strength each
 * already has (`CHESHTA_LUMINARY_NOTE`). Computing a motion-based figure for them would be an
 * invention, and a plausible-looking one.
 */
function cheshtaOf(graha: Graha, p: ShadbalaPlanetInput, input: ShadbalaInput): number | null {
  if (graha === 'sun') {
    return p.tropicalLongitude == null ? null : ayanaBala('sun', p.tropicalLongitude);
  }
  if (graha === 'moon') {
    if (input.moonLongitude == null || input.sunLongitude == null) return null;
    return pakshaBala(input.moonLongitude, input.sunLongitude, true);
  }
  if (p.meanLongitude == null || p.seeghrocha == null) return null;
  return cheshtaBalaTara(p.meanLongitude, p.longitude, p.seeghrocha);
}

/** Paksha bala treats the natural benefics and malefics oppositely (27.10-11). */
function isBeneficForPaksha(graha: Graha): boolean {
  return graha === 'jupiter' || graha === 'venus' || graha === 'mercury' || graha === 'moon';
}

// ─────────────────────────────────────────────────────────────────────────────
// Judging a total — and refusing to judge a partial one
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 27.32-33's three-way verdict, guarded against incomplete input.
 *
 * **This guard is the point of the module.** A total missing one component is systematically
 * lower than a complete one, so comparing it to chapter 27's requirement reports strong planets
 * as weak — quietly, plausibly, and in the same direction every time. It would fail Mahapurusha
 * yogas that should hold and there would be nothing to see. So an incomplete result is
 * `'unknown'`, never `'weak'`.
 */
export function shadbalaVerdictOf(
  r: ShadbalaPlanetResult,
): 'very-strong' | 'strong' | 'weak' | 'unknown' {
  if (!r.complete) return 'unknown';
  const need = SHADBALA_REQUIRED[r.graha];
  if (need == null) return 'unknown';
  if (r.total > need) return 'very-strong';
  if (r.total === need) return 'strong';
  return 'weak';
}

/** Does this planet meet BPHS 27.32-36's requirement? `null` when the total is incomplete. */
export function meetsShadbalaRequirement(r: ShadbalaPlanetResult): boolean | null {
  if (!r.complete) return null;
  const need = SHADBALA_REQUIRED[r.graha];
  return need == null ? null : r.total >= need;
}

export const INCOMPLETE_TOTALS_ARE_NEVER_JUDGED =
  'A Shadbala total missing even one of the six components is systematically LOWER than a '
  + 'complete one, so comparing it to chapter 27’s requirement reports strong planets as weak — '
  + 'quietly, plausibly, and in the same direction every time. It would fail Mahapurusha yogas '
  + 'that should hold and leave nothing to see. So `ShadbalaPlanetResult` carries its own '
  + '`complete` flag and its `missing` list, `shadbalaVerdictOf` returns "unknown" rather than '
  + '"weak" for a partial total, and `meetsShadbalaRequirement` returns null. Silence, not a '
  + 'guess — the same rule the predicate DSL follows for an absent fact.';

export const SHADBALA_ASSEMBLER_CLOSES_A_GAP =
  'Every component of BPHS 27’s six-fold strength has existed as a function since Parts 9-11; '
  + 'what never existed was the assembler, so `isStrongByShadbala` demanded a total nobody '
  + 'produced. SEVEN rules use the `strength` predicate and none could fire on a real chart — '
  + 'they evaluated only on synthetic charts where the calibration generator injects a '
  + '`shadbala` field. The engine’s own `planetStrength` is "Shadbala-inspired… no exact '
  + 'Rupa/Virupa units", a different quantity in different units, so it could not stand in. '
  + '`shadbalaPinda` closes that, and makes BPHS’s own definition of STRONG available to every '
  + 'rule — which is what 75.1’s `balibhiḥ` requires.';
