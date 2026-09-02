// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 67, 68 and 69 — the Ashtakavarga reductions. Programme Part 16.
//   Ch 67 — Trikona Shodhana,    lines 50388-50775
//   Ch 68 — Ekadhipatya Shodhana, lines 50775-50897
//   Ch 69 — Pinda Sadhana,        lines 50897-51064
//
// Parts 13-15 verified the raw bindus. These three chapters are the reductions that turn
// them into the figure transits are actually read against.
//
// All three functions already existed (`trikonaSodhana`, `ekadhipatyaSodhana`,
// `sodhyaPinda`). Checking them against the source found:
//
//   • Trikona shodhana  — correct, and the ORDER is settled by the root verse, not by us.
//   • Pinda sadhana     — multipliers correct; the verse contradicts itself and its own
//                         worked example settles it in favour of what we already had.
//   • Ekadhipatya       — **WRONG in both branches**, failing three of the chapter's own
//                         five worked cases. Corrected here.
// ─────────────────────────────────────────────────────────────────────────────

import {
  TRIKONA_GROUPS, EKADHIPATYA_PAIRS, RASI_MULTIPLIER, GRAHA_MULTIPLIER,
  type AVPlanet,
} from '../ashtakavarga.js';

// ── Chapter 67 — Trikona Shodhana ────────────────────────────────────────────

/**
 * The order of the two reductions is the ROOT VERSE's, not a convention we picked.
 *
 * 67.5 closes with *paschat vipaschita karyam ekadhipati-shodhanam* — "afterwards the wise
 * should do the ekadhipatya shodhana" — and 68.1 opens by saying it is done on the numbers
 * arrived at by trikona shodhana. 69.1 then says pinda sadhana follows both.
 *
 * Worth recording because reduction order is exactly the kind of thing that gets assumed,
 * and here it did not have to be.
 */
export const REDUCTION_ORDER = ['trikona', 'ekadhipatya', 'pinda'] as const;

export const REDUCTION_ORDER_IS_STATED =
  'BPHS 67.5, 68.1 and 69.1 each state the sequence explicitly — trikona shodhana, then '
  + 'ekadhipatya shodhana, then pinda sadhana. This is the text’s order, not our choice.';

/**
 * 67.4's Sanskrit: *trikoneshu cha yan-nyunam tat-tulyam trishu shodhayet* — "among the
 * trikona signs, whatever is least, that same amount is to be reduced from all three."
 *
 * The English gloss garbles this into deducting a sign's rekhas "from the total number of
 * rekhas of the three", which is a different and unusable operation. The Sanskrit is
 * unambiguous and matches the existing `trikonaSodhana` exactly.
 */
export const TRIKONA_RULE =
  'Subtract the least of the three trinal values from all three (67.4, Sanskrit). The '
  + 'English gloss’s "deduct from the total of the three" is a mistranslation.';

/**
 * 67.4 also says no reduction is needed when one of the three holds a zero, and 67.5 that
 * when all three are equal all become zero.
 *
 * Both are **redundant restatements of the same subtraction**: if one value is zero the
 * least is zero and subtracting it changes nothing; if all three are equal the least is
 * that value and all three fall to zero. The existing implementation keeps the zero case
 * as an explicit early-out, which is behaviourally identical — noted so nobody "fixes" one
 * into disagreement with the other.
 */
export const TRIKONA_SPECIAL_CASES_ARE_REDUNDANT =
  'BPHS 67.4-5 states two special cases — a zero present, and all three equal — that both '
  + 'fall out of "subtract the least" with no special handling. They are restatements, not '
  + 'exceptions.';

/** The four trines, as chapter 67 lists them (67.1-2). Same as `TRIKONA_GROUPS`. */
export const CH67_TRINES = TRIKONA_GROUPS;

// ── Chapter 68 — Ekadhipatya Shodhana ────────────────────────────────────────

/**
 * BPHS 68's "imaginary illustration", transcribed. Five co-owned pairs, with the trikona
 * corrected values, which signs hold planets, and the chapter's own answers.
 *
 * This is the worked example that found the bug. Reading only the chapter's prose rules is
 * not enough — they contradict each other (rule 3 says the empty sign takes the difference,
 * rule 6 says it goes to zero) and rule 1 contradicts the illustration outright.
 *
 * One reading of the prose has Taurus planet-less, which would make the illustration
 * self-contradictory (Taurus/Libra and Sagittarius/Pisces are then the same configuration
 * with different answers). Taking Taurus as OCCUPIED removes the contradiction and lets a
 * single rule set reproduce all five cases — so that is the reading adopted.
 */
export const CH68_ILLUSTRATION = [
  {
    pair: 'aries/scorpio', signs: [0, 7] as [number, number],
    before: [1, 3] as [number, number], occupied: [0],
    after: [1, 2] as [number, number],
    shows: 'one occupied — the empty sign takes the DIFFERENCE (3−1), not the other’s value',
  },
  {
    pair: 'taurus/libra', signs: [1, 6] as [number, number],
    before: [2, 1] as [number, number], occupied: [1],
    after: [2, 0] as [number, number],
    shows: 'one occupied and larger — the empty sign floors at zero (1−2 → 0)',
  },
  {
    pair: 'gemini/virgo', signs: [2, 5] as [number, number],
    before: [4, 4] as [number, number], occupied: [],
    after: [0, 0] as [number, number],
    shows: 'both empty and equal — both fall to zero',
  },
  {
    pair: 'capricorn/aquarius', signs: [9, 10] as [number, number],
    before: [2, 2] as [number, number], occupied: [9],
    after: [2, 0] as [number, number],
    shows: 'one occupied and equal — the empty sign goes to zero, not unchanged',
  },
  {
    pair: 'sagittarius/pisces', signs: [8, 11] as [number, number],
    before: [1, 2] as [number, number], occupied: [],
    after: [0, 1] as [number, number],
    shows: 'both empty and unequal — subtract the LESSER from both, the chapter’s own '
      + 'arithmetic ("deduct the difference between 2 and 1, that is 1, from both")',
  },
] as const;

/**
 * The rules that reproduce all five of the chapter's cases.
 *
 * **The shipped implementation failed three of them** — Aries/Scorpio (gave 1, should be
 * 2), Capricorn/Aquarius (gave 2, should be 0) and Sagittarius/Pisces (gave 1,1, should be
 * 0,1). Corrected in `ekadhipatyaSodhana`.
 */
export const EKADHIPATYA_RULES = [
  'Either sign holds zero → no reduction.',
  'Both signs occupied → no reduction.',
  'One occupied → the EMPTY sign becomes max(0, empty − occupied); the occupied sign never changes.',
  'Both empty → subtract the lesser from both.',
] as const;

/**
 * The Sun and Moon own one sign each (Leo, Cancer), so they never take part — which is why
 * there are five co-owned pairs and not seven. 68.6 states this explicitly.
 */
export const SINGLE_SIGN_OWNERS_EXEMPT =
  'BPHS 68.6: the Sun and Moon own one rasi each (Leo, Cancer), so their signs are never '
  + 'reduced by ekadhipatya. `EKADHIPATYA_PAIRS` therefore has five entries.';

export const CH68_PAIRS = EKADHIPATYA_PAIRS;

/**
 * A cross-corpus conflict, and the reason the old behaviour survived so long.
 *
 * The first corpus (ch 12.7.2, "Example 42") states that an empty sign takes the *other's
 * value* rather than the difference, and that two empty signs both fall to the lower value.
 * Its illustration uses 4 and 2 — where "take the other's value" and "take the difference"
 * both give 2, so the two rules are indistinguishable on those numbers.
 *
 * BPHS's illustration uses 1 and 3, where they differ (1 versus 2), and states the
 * arithmetic in words. Its table confirms it. Ledger `bphs.68.004`.
 */
export const EKADHIPATYA_CORPUS_CONFLICT =
  'The first corpus (ch 12.7.2) says an empty co-owned sign takes the other’s VALUE and '
  + 'that two empty signs both take the lower. BPHS 68’s illustration says the empty sign '
  + 'takes the DIFFERENCE and that two empty signs are each reduced by the lesser. The '
  + 'first corpus’s example uses 4 and 2, where both rules agree; BPHS’s uses 1 and 3, '
  + 'where they do not. BPHS wins — it is the corpus being encoded and it shows its work.';

// ── Chapter 69 — Pinda Sadhana ───────────────────────────────────────────────

/**
 * 69.1-4 lists the rasi multipliers, and contradicts itself on one of them.
 *
 * The verse says "6 for Capricorn and Virgo". Its own worked example then computes
 * "the Ekadhipatya Shodhana number 3 of Capricorn by its rashi measure 5 we get 15" — and
 * 3 × 5 = 15 is arithmetically self-consistent, as is the running total of 100 that
 * follows from it.
 *
 * The example wins, as it did for D60 in Part 4 (`bphs.06.033`). `RASI_MULTIPLIER` already
 * had 5 and is unchanged. Ledger `bphs.69.001`.
 */
export const RASI_MULTIPLIER_CONFLICT =
  'BPHS 69.1-4 says Capricorn’s rasi multiplier is 6; its own worked example uses 5 and '
  + 'its arithmetic closes at 100 only with 5. The example wins. All other multipliers '
  + 'agree between verse and example.';

/**
 * The same fault in the planet multipliers, and the same resolution.
 *
 * The verse says "6 for Mercury, Sun, Moon and Saturn". The worked example multiplies by
 * **5** in every one of those cases, and its graha pinda closes at 48 only with 5.
 * `GRAHA_MULTIPLIER` already had 5 and is unchanged. Ledger `bphs.69.002`.
 */
export const GRAHA_MULTIPLIER_CONFLICT =
  'BPHS 69.1-4 says the Sun, Moon, Mercury and Saturn have a multiplier of 6; its own '
  + 'worked example uses 5 for all four and closes at 48 only with 5. The example wins.';

/**
 * The chapter's fully worked Pinda Sadhana for the Sun's ashtakavarga.
 *
 * Reduced (post-ekadhipatya) values by sign, the planet placements, and the three answers
 * the chapter reaches. Reproducing all three exactly is the strongest single check
 * available on the whole reduction pipeline, because it exercises both multiplier tables
 * at once.
 */
export const CH69_WORKED_EXAMPLE = {
  /** Post-ekadhipatya values, sign 0..11 (Aries…Pisces). */
  soav: [0, 1, 1, 4, 1, 0, 0, 4, 1, 3, 0, 0],
  /**
   * Planets in Capricorn, Taurus, Gemini and Scorpio, with Mercury, Jupiter and Venus in
   * Aquarius (whose reduced value is 0, so they contribute nothing). The three multiplier-5
   * planets are the Sun, Moon and Saturn; Mars, at 8, is the one in Taurus.
   */
  planetSigns: {
    sun: 9, moon: 2, mars: 1, mercury: 10, jupiter: 10, venus: 10, saturn: 7,
  } as Record<AVPlanet, number>,
  rasiPinda: 100,
  grahaPinda: 48,
  yogaPinda: 148,
  note: 'BPHS 69 calls the sum of rasi pinda and graha pinda the YOGA PINDA. The codebase '
    + 'calls it `sodhyaPinda`; same quantity, different name.',
} as const;

/** BPHS 69's name for the total, recorded because the codebase uses a different one. */
export const YOGA_PINDA_IS_SODHYA_PINDA =
  'BPHS 69 names the sum of rasi pinda and graha pinda the "Yoga Pinda". This codebase '
  + 'calls the same quantity `sodhyaPinda`. Not a discrepancy — a synonym.';

/** Chapter 69 confirms Part 15: the reductions and pinda run for the ascendant too. */
export const REDUCTIONS_INCLUDE_LAGNA =
  'BPHS 67.1 ("the Ashtaka Varga of all the planets including the Ascendant") and 69.4 '
  + '("of the other planets, including the Ascendant") both run the reductions over the '
  + 'lagna’s ashtakavarga as well — corroborating the table Part 15 added.';

export const CH67_69_VERIFICATION = {
  trikona: { verdict: 'correct', note: 'Matches 67.4’s Sanskrit exactly. Order is stated by the text.' },
  ekadhipatya: {
    verdict: 'CORRECTED',
    casesInChapter: 5,
    casesFailedBefore: 3,
    note: 'Shipped rules gave the empty sign the occupied sign’s value rather than the '
      + 'difference, and gave two empty signs the lower value rather than reducing both '
      + 'by it. Three of the chapter’s five worked cases failed.',
  },
  pinda: {
    verdict: 'correct',
    note: 'Both multiplier tables already matched the worked example. The verse disagrees '
      + 'with the example in five places (Capricorn, and four planet multipliers); the '
      + 'example is arithmetically self-consistent and the verse is not.',
  },
} as const;

/** What these chapters supply that is consumed but not computed here. */
export const CH67_69_NOT_ENCODED = {
  'ch 70': 'Effects of the ashtakavarga — interpretation rather than construction. A later part.',
  occupancy: 'Ekadhipatya needs to know which signs hold a planet. That is chart data, '
    + 'supplied by the caller; the nodes are excluded, per 69.4.',
} as const;
