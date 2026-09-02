// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 66c — Ashtakavarga: Saturn, and the Ascendant's own. Programme Part 15.
//   Lines 49100-50388. Saturn at 66.39-42 (karana) and 66.59-60 (rekha);
//   the Ascendant at 66.61-64 (karana) and 66.65-68 (rekha).
//
// This completes chapter 66's construction. Two different jobs:
//
//   • **Saturn** is verification, like Parts 13-14. It came through clean.
//   • **The Ascendant's ashtakavarga is new capability.** Neither shipped table has it at
//     all — `AV_PLANETS` is seven, and the lagna appears only as a *reference*, never as a
//     subject. BPHS gives it a full table of its own and this part adds it.
//
// The lagna's BAV is deliberately kept OUT of the Sarvashtakavarga. The classical 337 is
// the sum over the seven planets; folding the lagna's 49 in would make it 386 and silently
// break every transit reading, every test, and Part 12's `bhavaEffect`. It is a parallel
// quantity, not an eighth column of the same sum.
// ─────────────────────────────────────────────────────────────────────────────

import { AV_TABLE, type AVRef } from '../ashtakavarga.js';
import { AV_REFS, AV_HOUSES } from './ch66a.js';

/**
 * Saturn's ashtakavarga (66.39-42 karana, 66.59-60 rekha).
 *
 * Both statements agree in all twelve houses and both close at 39. The shipped table
 * matched in all eight rows — the cleanest planet in the chapter.
 */
export const CH66_SATURN_REKHA: Record<AVRef, number[]> = {
  sun: [1, 2, 4, 7, 8, 10, 11],
  moon: [3, 6, 11],
  mars: [3, 5, 6, 10, 11, 12],
  mercury: [6, 8, 9, 10, 11, 12],
  jupiter: [5, 6, 11, 12],
  venus: [6, 11, 12],
  saturn: [3, 5, 6, 11],
  asc: [1, 3, 4, 6, 10, 11],
};

/** 66.39-42's karana counts, transcribed. Summary and detail agree; total 57. */
export const CH66_SATURN_KARANA_COUNTS: Record<number, number> = {
  1: 6, 2: 7, 3: 4, 4: 6, 5: 5, 6: 1, 7: 7, 8: 6, 9: 7, 10: 4, 11: 0, 12: 4,
};

/**
 * **The Ascendant's own ashtakavarga** (66.61-64 karana, 66.65-68 rekha) — new to this
 * codebase.
 *
 * BPHS treats the lagna as a subject with a full eight-reference table, exactly like a
 * planet. Both of the chapter's statements agree in all twelve houses and both close at
 * 49, so this arrives verified rather than merely transcribed.
 *
 * What it is *for*: the seven planetary BAVs say how a transiting planet fares in a sign.
 * The lagna's says how a sign treats the native's own person and circumstances — which is
 * the quantity house-level questions actually want, and which no amount of planetary BAV
 * substitutes for.
 */
export const CH66_LAGNA_REKHA: Record<AVRef, number[]> = {
  sun: [3, 4, 6, 10, 11, 12],
  moon: [3, 6, 10, 11, 12],
  mars: [1, 3, 6, 10, 11],
  mercury: [1, 2, 4, 6, 8, 10, 11],
  jupiter: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  venus: [1, 2, 3, 4, 5, 8, 9],
  saturn: [1, 3, 4, 6, 10, 11],
  asc: [3, 6, 10, 11],
};

/** 66.61-64's karana counts, transcribed. Summary and detail agree; total 47. */
export const CH66_LAGNA_KARANA_COUNTS: Record<number, number> = {
  1: 3, 2: 5, 3: 2, 4: 3, 5: 6, 6: 1, 7: 7, 8: 6, 9: 6, 10: 1, 11: 1, 12: 6,
};

/** The lagna's bindu total. **Not** part of the 337 — see `LAGNA_AV_IS_NOT_IN_SAV`. */
export const LAGNA_AV_TOTAL = 49;

export const LAGNA_AV_IS_NOT_IN_SAV =
  'The Sarvashtakavarga total of 337 is the sum over the SEVEN planets. The ascendant’s '
  + 'own ashtakavarga (49) is a parallel quantity, not an eighth column of that sum. '
  + 'Adding it would make 386 and silently change every transit reading. Keep them apart.';

/**
 * The lagna's bindus per sign, given where the eight reference points fall.
 *
 * Same construction as `bhinnashtakavarga`, with the lagna as the subject. Kept here
 * rather than folded into `AV_PLANETS` so that nothing which iterates the seven planets
 * — the SAV sum, the 337 invariant, the transit weighting — picks it up by accident.
 *
 * `refSigns` maps each of the eight references to the sign (0-11) it occupies.
 */
export function lagnaAshtakavarga(refSigns: Record<AVRef, number>): number[] {
  const row = new Array(12).fill(0) as number[];
  for (const r of AV_REFS) {
    const base = ((refSigns[r] % 12) + 12) % 12;
    for (const house of CH66_LAGNA_REKHA[r]) {
      const sign = (base + house - 1) % 12;
      row[sign] = row[sign]! + 1;
    }
  }
  return row;
}

/**
 * A curiosity, recorded and deliberately NOT relied on.
 *
 * Five of the lagna's seven planetary rows are identical to that planet's own `asc` row
 * in the shipped table — `CH66_LAGNA_REKHA.mars` equals `AV_TABLE.mars.asc`, and the same
 * holds for the Sun, Mercury, Jupiter and Saturn. The Moon and Venus each differ by one
 * house, so it is not a symmetry of the system, and there is no reason in the construction
 * why it should be one. It is noted because the near-match is striking enough that someone
 * will eventually "simplify" the table by assuming it, which would be wrong twice.
 */
export const LAGNA_ASC_ROW_COINCIDENCE =
  'Five of the lagna’s seven planetary rows happen to equal that planet’s own `asc` row '
  + '(sun, mars, mercury, jupiter, saturn). The Moon and Venus differ by one house each, '
  + 'so this is coincidence, not a symmetry. Do NOT derive one table from the other.';

/** What checking chapter 66c against the shipped tables found. */
export const CH66C_VERIFICATION = {
  saturn: {
    rowsChecked: 8,
    rowsAlreadyCorrect: 8,
    rowsCorrected: 0,
    note: 'Both statements agree in all twelve houses and both close at 39. Clean.',
  },
  lagna: {
    rowsAdded: 8,
    total: LAGNA_AV_TOTAL,
    note: 'New capability — neither shipped table had the ascendant as a subject. Both of '
      + 'the chapter’s statements agree in all twelve houses and close at 49.',
  },
  chapterComplete: true,
  planetsVerified: 7,
  rowsVerifiedTotal: 56,
  rowsCorrectedTotal: 4,
  summary:
    'Chapter 66 is fully checked: 56 planetary reference rows across seven planets, plus '
    + 'the ascendant’s eight. Four rows were wrong — three in the Moon (Part 13), one in '
    + 'Venus (Part 14) — in two different error classes, neither visible to any total.',
} as const;

/** Every textual fault found across chapter 66, Parts 13-15. */
export const CH66_EDITION_FAULTS_FINAL = 5;

export const CH66_FAULT_RATE_NOTE =
  'Five faults across chapter 66’s fourteen verse-statements. Part 8 measured ~3.2% for '
  + 'this edition’s printed tables; chapter 66’s prose statements are worse, and the only '
  + 'reliable defence is closing each total before believing any statement.';
