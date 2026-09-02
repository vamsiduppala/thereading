// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 66a — Ashtakavarga: the Sun, the Moon and Mars. Programme Part 13.
//   Lines 46561-47800 (chapter 66 runs 46561-50388). Verses 1-27 and 43-50.
//
// The chapter states each planet's ashtakavarga TWICE — once as the karana (dot,
// inauspicious) places and once as the rekha (line, auspicious) places. The two must be
// exact complements over the eight references, which makes this chapter self-checking in
// a way almost nothing else in the corpus is. Part 8 had to lean on a printed speculum;
// here the text audits itself.
//
// That double statement earned its keep immediately: it found a real bug in the tables
// this codebase has been shipping. See `CH66_VERIFICATION`.
// ─────────────────────────────────────────────────────────────────────────────

import { AV_TABLE, AV_PLANETS, type AVPlanet, type AVRef } from '../ashtakavarga.js';

/** The eight reference points an ashtakavarga is reckoned from (66.13-15). */
export const AV_REFS: AVRef[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'asc',
];

export const AV_HOUSES = 12;
/** Eight references over twelve houses — every mark is either a rekha or a karana. */
export const AV_MARKS_PER_PLANET = AV_REFS.length * AV_HOUSES;

/**
 * **The terminology is inverted relative to modern practice, and BPHS says so plainly.**
 *
 * 66.15: the *inauspicious* places, called **karana**, are marked with **dots (bindus)**;
 * the *auspicious* places, called **sthana**, are marked with **vertical lines (rekhas)**.
 * So in this chapter's own vocabulary a bindu is the BAD mark and a rekha is the good one.
 *
 * Every modern implementation — including this codebase, and including BPHS 28.18's own
 * English gloss ("add Bindus (auspicious points)") — uses *bindu* for the benefic point.
 * The translation is not consistent with itself across chapters.
 *
 * **We keep the modern convention in code** (`bav` counts benefic points, 0-8) because
 * changing it would silently invert every ashtakavarga reading in the app and every
 * caller's expectation, including Part 12's `bhavaEffect`. This constant exists so the
 * inversion is impossible to rediscover by accident. Ledger `bphs.66.015`.
 */
export const KARANA_VS_REKHA =
  'BPHS 66.15 marks INAUSPICIOUS places with dots (bindus) and AUSPICIOUS places with '
  + 'lines (rekhas) — the opposite of modern usage, where a bindu is the benefic point. '
  + 'BPHS 28.18’s gloss uses the modern sense, so the translation disagrees with itself '
  + 'across chapters. Our `bav` counts BENEFIC points (rekhas in ch 66’s vocabulary). '
  + 'When reading ch 66 verses, "Karana-Prada" lists are the COMPLEMENT of our table.';

/** Turn a karana (inauspicious) house list into the rekha (benefic) list we store. */
export function rekhaFromKarana(karanaHouses: number[]): number[] {
  const bad = new Set(karanaHouses);
  const out: number[] = [];
  for (let h = 1; h <= AV_HOUSES; h++) if (!bad.has(h)) out.push(h);
  return out;
}

/** And back again — used to check a verse's two statements against each other. */
export function karanaFromRekha(rekhaHouses: number[]): number[] {
  return rekhaFromKarana(rekhaHouses);
}

/** How many benefic points one reference contributes to one planet's ashtakavarga. */
export const avRowTotal = (planet: AVPlanet, ref: AVRef): number => AV_TABLE[planet][ref].length;

/** A planet's whole Bhinnashtakavarga total, summed over all eight references. */
export const avPlanetTotal = (planet: AVPlanet): number =>
  AV_REFS.reduce((sum, r) => sum + avRowTotal(planet, r), 0);

/**
 * The per-planet totals, derived from the chapter's own verse lists.
 *
 * **This is a far stronger integrity check than the 337 grand total**, and the reason
 * matters: the bug found this part was a pair of *compensating* errors — a house moved
 * from the Moon's own row into Mars's row — which left both the Moon's row total and the
 * 337 grand total untouched. A checksum that only sums the whole cannot see a transfer
 * inside it. These seven numbers can.
 */
export const BPHS_AV_PLANET_TOTALS: Record<AVPlanet, number> = {
  sun: 48, moon: 49, mars: 39, mercury: 54, jupiter: 56, venus: 52, saturn: 39,
};

/** 48 + 49 + 39 + 54 + 56 + 52 + 39. The classical invariant, kept as a derived value. */
export const AV_GRAND_TOTAL = AV_PLANETS.reduce(
  (s, p) => s + BPHS_AV_PLANET_TOTALS[p], 0,
);

/**
 * The Sun's ashtakavarga exactly as chapter 66 gives it (66.16-19 as karana, 66.43-45 as
 * rekha), transcribed from the verses rather than from our table.
 *
 * Kept as an independent transcription so the test compares two things that were written
 * down separately. Copying `AV_TABLE` here would make the test tautological.
 */
export const CH66_SUN_REKHA: Record<AVRef, number[]> = {
  sun: [1, 2, 4, 7, 8, 9, 10, 11],
  moon: [3, 6, 10, 11],
  mars: [1, 2, 4, 7, 8, 9, 10, 11],
  mercury: [3, 5, 6, 9, 10, 11, 12],
  jupiter: [5, 6, 9, 11],
  venus: [6, 7, 12],
  saturn: [1, 2, 4, 7, 8, 9, 10, 11],
  asc: [3, 4, 6, 10, 11, 12],
};

/**
 * The Moon's ashtakavarga as chapter 66 gives it (66.20-22 karana, 66.46-48 rekha).
 *
 * **Three rows here differ from what this codebase shipped before Part 13.** Both of the
 * chapter's statements agree with each other in all twelve houses, so the text is not
 * ambiguous — the table was wrong. See `CH66_VERIFICATION`.
 */
export const CH66_MOON_REKHA: Record<AVRef, number[]> = {
  sun: [3, 6, 7, 8, 10, 11],
  moon: [1, 3, 6, 7, 9, 10, 11],
  mars: [2, 3, 5, 6, 10, 11],
  mercury: [1, 3, 4, 5, 7, 8, 10, 11],
  jupiter: [1, 2, 4, 7, 8, 10, 11],
  venus: [3, 4, 5, 7, 9, 10, 11],
  saturn: [3, 5, 6, 11],
  asc: [3, 6, 10, 11],
};

/** Mars's ashtakavarga as chapter 66 gives it (66.23-27 karana, 66.49-50 rekha). */
export const CH66_MARS_REKHA: Record<AVRef, number[]> = {
  sun: [3, 5, 6, 10, 11],
  moon: [3, 6, 11],
  mars: [1, 2, 4, 7, 8, 10, 11],
  mercury: [3, 5, 6, 11],
  jupiter: [6, 10, 11, 12],
  venus: [6, 8, 11, 12],
  saturn: [1, 4, 7, 8, 9, 10, 11],
  asc: [1, 3, 6, 10, 11],
};

export const CH66A_TRANSCRIBED = {
  sun: CH66_SUN_REKHA,
  moon: CH66_MOON_REKHA,
  mars: CH66_MARS_REKHA,
} as const;

/**
 * What checking the chapter against the shipped tables actually found.
 *
 * The Sun and Mars came through untouched — sixteen reference rows, verified against both
 * of the chapter's independent statements. The Moon did not.
 *
 * The three wrong rows, and what they were:
 *
 *   reference   was                        BPHS                       what happened
 *   moon        [1,3,6,7,10,11]            [1,3,6,7,9,10,11]          lost the 9th
 *   mars        [2,3,5,6,9,10,11]          [2,3,5,6,10,11]            gained a 9th
 *   jupiter     [1,4,7,8,10,11,12]         [1,2,4,7,8,10,11]          12th instead of 2nd
 *
 * The first two are a single 9 that migrated one row down. Because it moved rather than
 * vanished, the Moon's BAV total stayed 49 and the grand total stayed 337 — so the only
 * integrity check the codebase had could never have caught it. That is the lesson worth
 * keeping: **a checksum over the whole cannot see a transfer inside it.**
 *
 * The effect was real. A chart with the Moon in the 9th from itself lost a bindu it should
 * have had, and one with Mars nine signs from the Moon gained one it should not — which
 * shifts transit-strength readings for that sign, and feeds Part 12's `bhavaEffect`.
 *
 * Also caught: 66.20-22's own summary line miscounts (it says three references are karana
 * in the 11th, then its detail list says none, and only "none" makes the totals close at
 * 47). The detail list is right. Same class of fault as Part 8's OCR damage.
 */
export const CH66_VERIFICATION = {
  planetsChecked: ['sun', 'moon', 'mars'] as AVPlanet[],
  rowsChecked: 24,
  rowsAlreadyCorrect: 21,
  rowsCorrected: 3,
  corrections: [
    { planet: 'moon', ref: 'moon', was: [1, 3, 6, 7, 10, 11], now: [1, 3, 6, 7, 9, 10, 11] },
    { planet: 'moon', ref: 'mars', was: [2, 3, 5, 6, 9, 10, 11], now: [2, 3, 5, 6, 10, 11] },
    { planet: 'moon', ref: 'jupiter', was: [1, 4, 7, 8, 10, 11, 12], now: [1, 2, 4, 7, 8, 10, 11] },
  ],
  whyTheChecksumMissedIt:
    'The first two corrections are one house moving between rows. Row totals and the 337 '
    + 'grand total both stayed put, so neither existing assertion could fail.',
  textualFaults: [
    '66.20-22 summary says 3 references are karana in the 11th; its own detail list says '
    + 'none, and only "none" makes the karana total close at 47. The detail list is right.',
    '66.23-27 says "these 7 in the 2nd" and then names six. The rekha statement (66.49-50) '
    + 'is complete and was used instead.',
  ],
} as const;

/**
 * 66.7-11, which is easy to skim past and worth keeping: the chapter opens by saying the
 * general rules already given are not decidable in practice — the planets' motions are too
 * subtle for even Vashishtha to be definite — and that ashtakavarga exists to give a
 * method that works for ordinary people.
 *
 * That is the text's own statement of why a quantified instrument beats a rule list, and
 * it is the same argument this programme's Phase II rests on.
 */
export const WHY_ASHTAKAVARGA_EXISTS =
  'BPHS 66.1-12 introduces ashtakavarga because the general rules cannot be applied with '
  + 'certainty — contradictory indications from planetary motion defeat them. It is the '
  + 'text arguing for a countable instrument over an unranked rule list, which is the '
  + 'same case Phase II of this programme makes.';

/** What the rest of chapter 66 holds, so the next part knows where it is. */
export const CH66_REMAINING = {
  '28-30.5': 'Mercury — karana list (Part 14)',
  '31-34': 'Jupiter — karana list (Part 14)',
  '35-38': 'Venus — karana list (Part 14)',
  '39-42': 'Saturn — karana list (Part 15)',
  '51-52.5': 'Mercury — rekha list (Part 14)',
  '53-': 'Jupiter, Venus, Saturn — rekha lists (Parts 14-15)',
  lagna: 'BPHS gives the ascendant its own ashtakavarga; neither existing table has it. '
    + 'Part 15 per the plan.',
} as const;
