// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 5 — Special Ascendants. Programme Part 2.
// Source lines 1892-2041.
//
// Three time-based ascendants, a bhava-strength weighting, and Varnada.
//
// The important thing this chapter establishes for the whole programme: there is no
// single "the lagna". Bhava, Hora and Ghatika lagnas are alternate reference points,
// and 5.9 instructs that a full house chart be built from each. **Every rule extracted
// in later parts must therefore declare WHICH lagna it counts from.** A rule that says
// "the 5th house" without saying "5th from what" is under-specified, and that is the
// main reason ch 5 is extracted this early.
//
// A planet holding the same bhava across all four charts delivers that bhava's results
// fully; one that shifts delivers them proportionally. That is a genuine confidence
// signal and feeds the arbitration engine in Part 19.
// ─────────────────────────────────────────────────────────────────────────────

import type { AscendantReference, LagnaReference, PlanetFrame, SignIndex } from '../../types.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;
const mod360 = (n: number): number => ((n % 360) + 360) % 360;

/** One ghati is 24 minutes; one vighati is 24 seconds. */
export const MINUTES_PER_GHATI = 24;
export const minutesToGhatis = (minutes: number): number => minutes / MINUTES_PER_GHATI;

// ── 5.2-8 The three time-based ascendants ─────────────────────────────────────

/**
 * How many ghatis each special ascendant takes to cross one whole sign (5.2-8).
 *
 *   Bhava lagna    one sign per 5   ghatis (120 min) → 0.25 °/min
 *   Hora lagna     one sign per 2.5 ghatis ( 60 min) → 0.50 °/min
 *   Ghatika lagna  one sign per 1   ghati  ( 24 min) → 1.25 °/min
 *
 * All three start from the Sun's longitude at sunrise and run forward.
 */
export const GHATIS_PER_SIGN = { bhava: 5, hora: 2.5, ghatika: 1 } as const;

/**
 * Bhava lagna (5.2-3) — one sign per 5 ghatis from the Sun's sunrise longitude.
 *
 * CONFLICT LEDGER `bphs.05.002`. The pre-existing `bhavaLagna()` in data/lagnas.ts
 * advanced at 1°/min — four times this rate — because the first corpus's worked example
 * implied it, even though that corpus's own prose said "one rasi per 2 hours" (which is
 * exactly BPHS's 5 ghatis). Evidence for the BPHS rate is 3:1:
 *
 *   1. BPHS's prose and BPHS's worked example agree with each other.
 *   2. The first corpus's PROSE also agrees with BPHS; only its example dissents, and
 *      that inconsistency was already flagged in the old code comment.
 *   3. BPHS's three rates form a coherent descending sequence 5 / 2.5 / 1 ghatis. The
 *      old rate implies 1.25 ghatis for Bhava lagna, which would make it FASTER than
 *      Hora lagna and breaks the ordering the chapter is built on.
 *
 * Decision: BPHS wins, overriding the standing "first corpus wins on computation"
 * precedence with this recorded reason. Hora and Ghatika lagna were already correct and
 * are unchanged.
 */
export function bhavaLagnaBphs(sunLongAtSunrise: number, minutesSinceSunrise: number): number {
  return mod360(sunLongAtSunrise + (minutesToGhatis(minutesSinceSunrise) / GHATIS_PER_SIGN.bhava) * 30);
}

/** Hora lagna (5.4-5) — one sign per 2.5 ghatis. Self seen through wealth. */
export function horaLagnaBphs(sunLongAtSunrise: number, minutesSinceSunrise: number): number {
  return mod360(sunLongAtSunrise + (minutesToGhatis(minutesSinceSunrise) / GHATIS_PER_SIGN.hora) * 30);
}

/** Ghatika lagna (5.6-8) — one sign per ghati. Self seen through power and rank. */
export function ghatikaLagnaBphs(sunLongAtSunrise: number, minutesSinceSunrise: number): number {
  return mod360(sunLongAtSunrise + (minutesToGhatis(minutesSinceSunrise) / GHATIS_PER_SIGN.ghatika) * 30);
}

// ── 5.9 Which lagna a rule counts from, and cusp-proximity strength ───────────

/**
 * The reference points a house may be counted from. Every extracted rule declares one.
 * Canonical definition lives in types.ts — the predicate engine needs it too.
 */
export type { AscendantReference, LagnaReference, PlanetFrame };

export const LAGNA_REFERENCE_USE: Record<AscendantReference, string> = {
  natal: 'The birth ascendant. The default, and the only one that depends on birth PLACE.',
  bhava: 'Bhava lagna — the slowest of the three, one sign per 5 ghatis.',
  hora: 'Hora lagna — the self seen through wealth and money matters.',
  ghatika: 'Ghatika lagna — the self seen through power, rank and authority.',
  // RETROFIT (Programme Part 12). BPHS ch 29-30 counts from a pada, not an ascendant, and
  // every rule in those chapters was inexpressible until these two existed.
  arudha: 'Arudha Lagna (ch 29) — the self as the world perceives it, rather than as it '
    + 'is. Gains are read from the 11th and outgoings from the 12th of THIS point.',
  upapada: 'Upapada (ch 30) — the partnership reference point. Note the convention '
    + 'conflict: BPHS takes the 12th for an odd ascendant and the 2nd for an even one.',
  // RETROFIT (Programme Part 20). BPHS 12.11: "the learned should base the effects on the
  // Moon also as are applicable to the ascendant." Chandra lagna is not a special
  // ascendant like the three above — it is the whole house system re-read from the Moon,
  // and it applies to every rule in Phase III, not to a chapter.
  moon: 'Chandra lagna (ch 12.11) — the houses re-read from the Moon’s sign. BPHS directs '
    + 'that first-house effects be judged from the Moon as well as the ascendant, and the '
    + 'instruction generalises to the whole house corpus.',
  // RETROFIT (Programme Part 29). The first frame that is NOT a rasi construction: it is
  // a sign in D-9, and rules counting from it read the D-9 positions of the planets. Built
  // by `karakamsaFacts`, which projects the chart into the navamsa first.
  karakamsa: 'Karakamsa (ch 33.1) — the NAVAMSA sign occupied by the Atmakaraka. Unlike '
    + 'every other reference here it lives in a divisional chart, so a rule counting from '
    + 'it must be evaluated against `vargaFacts(facts, 9)`, not the rasi chart.',
};

/**
 * How many of the four charts place a planet in the same bhava (5.9 notes).
 *
 * 4 of 4 means that bhava's results arrive in full. Fewer means they arrive
 * proportionally. This is a cheap, real agreement signal, and it is exactly the kind of
 * independent corroboration the confidence calculus in Part 19 is built to use.
 */
export function bhavaAgreement(housesAcrossCharts: number[]): { house: number; agreeing: number; full: boolean } {
  const counts = new Map<number, number>();
  for (const h of housesAcrossCharts) counts.set(h, (counts.get(h) ?? 0) + 1);
  let house = housesAcrossCharts[0] ?? 0;
  let agreeing = 0;
  for (const [h, n] of counts) if (n > agreeing) { house = h; agreeing = n; }
  return { house, agreeing, full: agreeing === housesAcrossCharts.length && housesAcrossCharts.length > 0 };
}

/**
 * Strength of a planet's claim on a bhava, by distance from that bhava's cusp
 * (5.9 notes, from the Benares edition).
 *
 *   • exactly on the cusp        → full effect (1)
 *   • within 15° BEFORE the cusp → rising toward full
 *   • within 15° AFTER the cusp  → falling away from full
 *   • at the bhava sandhi (±15°) → no effect FOR THAT BHAVA
 *
 * "No effect" means no effect on that house — not that the planet is inert. Returns
 * 0..1. This is the first cusp-based bhava weighting in the codebase; whole-sign houses
 * treat every degree of a sign alike, which overstates a planet sitting at a junction.
 */
export function cuspStrength(planetLong: number, cuspLong: number): number {
  const signed = ((mod360(planetLong - cuspLong) + 180) % 360) - 180; // −180..+180
  const distance = Math.abs(signed);
  if (distance >= 15) return 0;
  return 1 - distance / 15;
}

// ── 5.10-15 Varnada ───────────────────────────────────────────────────────────

/** A sign's ordinal, 1..12. Odd/even parity drives the whole Varnada computation. */
const ordinal = (sign: SignIndex): number => mod12(sign) + 1;
const isOddSign = (sign: SignIndex): boolean => ordinal(sign) % 2 === 1;

/**
 * Count to a sign, in the direction its parity dictates (5.11-12).
 * Odd sign  → count forward from Aries.
 * Even sign → count backward from Pisces.
 * Both counts are inclusive, so the result is 1..12.
 */
export function varnadaCount(sign: SignIndex): number {
  const s = mod12(sign);
  return isOddSign(s) ? s + 1 : mod12(11 - s) + 1;
}

/**
 * Varnada for a reference point (5.11-13).
 *
 *   count the natal lagna, and count the Hora lagna, each per its own parity
 *   same parity of the two COUNTS → add them; different parity → take the difference
 *   result odd  → count that many forward from Aries
 *   result even → count that many backward from Pisces
 *
 * Verified against the chapter's worked example: Libra lagna (count 7) with Scorpio
 * Hora lagna (count 5); both counts odd so they add to 12; 12 is even so count 12 back
 * from Pisces, giving Aries.
 *
 * Note the subtlety the example turns on: the parity test is applied to the two COUNTS,
 * not to the two signs. Libra is an odd sign and Scorpio an even one, yet their counts
 * are 7 and 5 — both odd — so they are added rather than subtracted.
 */
export function varnada(lagnaSign: SignIndex, horaLagnaSign: SignIndex): SignIndex {
  const cl = varnadaCount(lagnaSign);
  const ch = varnadaCount(horaLagnaSign);
  const sameParity = (cl % 2) === (ch % 2);
  const total = sameParity ? cl + ch : Math.abs(cl - ch);
  const n = total === 0 ? 12 : total;
  return n % 2 === 1 ? mod12(n - 1) : mod12(11 - (n - 1));
}

/** Varnada for any bhava — 5.21 extends the same rule to each house in turn. */
export function varnadaOfHouse(
  house: number, lagnaSign: SignIndex, horaLagnaSign: SignIndex,
): SignIndex {
  return varnada(mod12(lagnaSign + house - 1), mod12(horaLagnaSign + house - 1));
}

export interface VarnadaDasha { sign: SignIndex; years: number }

/**
 * The Varnada dasha sequence (5.14-15, 5.22).
 *
 * Years for a sign equal the count of signs between the lagna and its Varnada; the
 * sequence runs clockwise when the natal lagna is odd and anticlockwise when even.
 * Sub-periods are one twelfth of each period (5.22).
 *
 * WHAT IS NOT ENCODED: 5.16-20 reads Varnada for longevity — of the native, the spouse,
 * the parents and the siblings. That is precisely the material this project computes and
 * never surfaces. The dasha structure is encoded here because later parts need the
 * timeline; the longevity readings attached to it are not, and belong to Part 51 if
 * anywhere.
 */
export function varnadaDashaOrder(
  lagnaSign: SignIndex, varnadaSign: SignIndex,
): VarnadaDasha[] {
  const forward = isOddSign(lagnaSign);
  const span = forward
    ? mod12(varnadaSign - lagnaSign) + 1
    : mod12(lagnaSign - varnadaSign) + 1;
  const out: VarnadaDasha[] = [];
  for (let i = 0; i < 12; i++) {
    const sign = forward ? mod12(varnadaSign + i) : mod12(varnadaSign - i);
    out.push({ sign, years: span });
  }
  return out;
}

/** Sub-periods of a Varnada dasha — one twelfth each, in the same direction (5.22). */
export function varnadaAntardashas(d: VarnadaDasha, lagnaSign: SignIndex): VarnadaDasha[] {
  const forward = isOddSign(lagnaSign);
  return Array.from({ length: 12 }, (_, i) => ({
    sign: forward ? mod12(d.sign + i) : mod12(d.sign - i),
    years: d.years / 12,
  }));
}
