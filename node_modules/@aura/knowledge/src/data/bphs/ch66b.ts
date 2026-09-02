// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 66b — Ashtakavarga: Mercury, Jupiter and Venus. Programme Part 14.
//   Lines 47800-49100. Karana lists at 66.28-38, rekha lists at 66.51-58.
//
// Part 13 established the method: transcribe each table from the verses independently of
// what the codebase ships, check the chapter's two statements against each other, and
// treat whichever one's totals close as the sound one.
//
// This part is where that last clause earns its place. In Part 13 the Moon's KARANA
// statement was corrupt and the rekha statement was sound. Here it is the other way round
// twice over — Mercury's and Jupiter's rekha statements are both damaged and their karana
// statements are clean. **Neither statement is reliably the better one.** Only the
// arithmetic decides, which is why every table here is checked by closing its total.
// ─────────────────────────────────────────────────────────────────────────────

import { AV_TABLE, type AVRef } from '../ashtakavarga.js';
import { AV_REFS, AV_HOUSES } from './ch66a.js';

/**
 * Mercury's ashtakavarga (66.28-30½ karana, 66.51-52½ rekha).
 *
 * The shipped table was already correct in all eight rows. The rekha statement disagreed
 * in exactly one place — it puts Saturn rather than the Sun in the 5th — and the karana
 * statement, whose summary and detail agree and whose total closes at 42 (leaving 54),
 * confirms the Sun. A one-word substitution in the translation, not a table error.
 */
export const CH66_MERCURY_REKHA: Record<AVRef, number[]> = {
  // The 5th is the disputed house: the rekha statement gives it to Saturn, the karana
  // statement to the Sun. The karana statement closes; the Sun keeps it.
  sun: [5, 6, 9, 11, 12],
  moon: [2, 4, 6, 8, 10, 11],
  mars: [1, 2, 4, 7, 8, 9, 10, 11],
  mercury: [1, 3, 5, 6, 9, 10, 11, 12],
  jupiter: [6, 8, 11, 12],
  venus: [1, 2, 3, 4, 5, 8, 9, 11],
  saturn: [1, 2, 4, 7, 8, 9, 10, 11],
  asc: [1, 2, 4, 6, 8, 10, 11],
};

/**
 * Jupiter's ashtakavarga (66.31-34½ karana, 66.53-55 rekha).
 *
 * Also already correct in all eight rows, and also contradicted by its rekha statement —
 * which omits Jupiter from its own 1st and 4th, and consequently totals 54 where Jupiter
 * must reach 56. The karana statement's summary and detail agree exactly and close at 40.
 */
export const CH66_JUPITER_REKHA: Record<AVRef, number[]> = {
  sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
  moon: [2, 5, 7, 9, 11],
  mars: [1, 2, 4, 7, 8, 10, 11],
  mercury: [1, 2, 4, 5, 6, 9, 10, 11],
  jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
  venus: [2, 5, 6, 9, 10, 11],
  saturn: [3, 5, 6, 12],
  asc: [1, 2, 4, 5, 6, 7, 9, 10, 11],
};

/**
 * Venus's ashtakavarga (66.35-38 karana, 66.56-58 rekha).
 *
 * **One row was wrong**: Mars contributed in Venus's 5th where the chapter puts it in the
 * 4th. Both of the chapter's statements agree against the shipped table — the karana list
 * places Mars among the karanas of the 5th and not of the 4th, and the surviving part of
 * the rekha list names Mars in the 4th and omits it from the 5th.
 *
 * Note what this one would have survived. It is a substitution *inside* a single row, so
 * Mars's row total stayed 6, Venus's planet total stayed 52, and the grand total stayed
 * 337. Even Part 13's new per-planet check could not have seen it. **Only comparing row
 * contents against the verses catches this class**, which is why these transcriptions
 * exist as data rather than as a one-off check.
 */
export const CH66_VENUS_REKHA: Record<AVRef, number[]> = {
  sun: [8, 11, 12],
  moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  mars: [3, 4, 6, 9, 11, 12],
  mercury: [3, 5, 6, 9, 11],
  jupiter: [5, 8, 9, 10, 11],
  venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
  saturn: [3, 4, 5, 8, 9, 10, 11],
  asc: [1, 2, 3, 4, 5, 8, 9, 11],
};

export const CH66B_TRANSCRIBED = {
  mercury: CH66_MERCURY_REKHA,
  jupiter: CH66_JUPITER_REKHA,
  venus: CH66_VENUS_REKHA,
} as const;

/**
 * The karana counts per house, transcribed from each planet's karana verse.
 *
 * These are the chapter's own checksums and they are what arbitrates when the two
 * statements disagree. Each must equal eight minus the rekha count for that house, and
 * each planet's karana total must close at 96 minus its stated planet total.
 */
export const CH66B_KARANA_COUNTS: Record<'mercury' | 'jupiter' | 'venus', Record<number, number>> = {
  // 66.28-30½ — summary and detail agree; total 42, leaving 54.
  mercury: { 1: 3, 2: 3, 3: 6, 4: 3, 5: 5, 6: 3, 7: 6, 8: 2, 9: 3, 10: 3, 11: 0, 12: 5 },
  // 66.31-34½ — summary and detail agree; total 40, leaving 56.
  jupiter: { 1: 3, 2: 1, 3: 5, 4: 3, 5: 3, 6: 4, 7: 3, 8: 5, 9: 3, 10: 2, 11: 1, 12: 7 },
  // 66.35-38 — total 44, leaving 52.
  venus: { 1: 5, 2: 5, 3: 2, 4: 3, 5: 2, 6: 6, 7: 8, 8: 2, 9: 1, 10: 5, 11: 0, 12: 5 },
};

/**
 * What checking chapters 66.28-38 and 66.51-58 against the shipped tables found.
 *
 * Twenty-four more reference rows, twenty-three already correct. The one correction is
 * subtler than Part 13's: a substitution within a row rather than a transfer between them,
 * invisible to every total in the system.
 */
export const CH66B_VERIFICATION = {
  planetsChecked: ['mercury', 'jupiter', 'venus'] as const,
  rowsChecked: 24,
  rowsAlreadyCorrect: 23,
  rowsCorrected: 1,
  corrections: [
    { planet: 'venus', ref: 'mars', was: [3, 5, 6, 9, 11, 12], now: [3, 4, 6, 9, 11, 12] },
  ],
  whyNoTotalCouldSeeIt:
    'A house was substituted inside one row, not moved between rows. Mars’s row total, '
    + 'Venus’s planet total (52) and the grand total (337) were all unaffected — so even '
    + 'Part 13’s per-planet check would have passed. Only comparing row CONTENTS against '
    + 'the verses catches this class of error.',
  textualFaults: [
    '66.51-52½ (Mercury rekha) names Saturn where the karana statement and the closing '
    + 'total both require the Sun, in the 5th. One-word substitution.',
    '66.53-55 (Jupiter rekha) omits Jupiter from its own 1st and 4th, so it totals 54 '
    + 'where Jupiter must reach 56.',
    '66.56-58 (Venus rekha) is TRUNCATED — the sentence stops mid-clause after the 9th '
    + 'house, so houses 10-12 are simply absent from that statement.',
  ],
  methodNote:
    'Part 13 found the Moon’s karana statement corrupt and its rekha statement sound. '
    + 'Part 14 found the reverse twice. Neither statement is reliably better; only the '
    + 'arithmetic decides. Always close the total before believing either.',
} as const;

/** Every fault found in chapter 66 so far, across Parts 13 and 14. */
export const CH66_EDITION_FAULTS = 5;

/**
 * Derive a planet's karana counts from a rekha table — used to check a transcription
 * against the chapter's own checksum verse.
 */
export function karanaCounts(rekha: Record<AVRef, number[]>): Record<number, number> {
  const out: Record<number, number> = {};
  for (let h = 1; h <= AV_HOUSES; h++) {
    out[h] = AV_REFS.filter((r) => !rekha[r].includes(h)).length;
  }
  return out;
}

/** Total marks a rekha table awards — the value that must equal the planet's total. */
export const rekhaTotal = (rekha: Record<AVRef, number[]>): number =>
  AV_REFS.reduce((s, r) => s + rekha[r].length, 0);

/** What remains of chapter 66 after this part. */
export const CH66B_REMAINING = {
  saturn: '66.39-42 karana, 66.59-60 rekha — Part 15',
  lagna: 'The ascendant’s own ashtakavarga. Neither shipped table has it; AV_PLANETS is '
    + 'seven. Part 15.',
  reconciliation: 'Full speculum reconciliation and the 337 close — Part 15.',
} as const;

/** Convenience for the tests and routes: is a row identical to what we ship? */
export const rowMatchesShipped = (planet: 'mercury' | 'jupiter' | 'venus', ref: AVRef): boolean => {
  const a = [...AV_TABLE[planet][ref]].sort((x, y) => x - y);
  const b = [...CH66B_TRANSCRIBED[planet][ref]].sort((x, y) => x - y);
  return a.length === b.length && a.every((v, i) => v === b[i]);
};
