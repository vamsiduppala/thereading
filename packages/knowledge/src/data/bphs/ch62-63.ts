// BPHS Programme Part 43 — Chapters 62 and 63: the sookshma and prana dashas, levels four
// and five.
//
// Part 42 predicted this part's outcome and the prediction held. Chapter 61 was the same
// construction one level up and was refused; these two are the same again, two levels deeper,
// and the case against encoding them is **stronger** at every point:
//
//   | | ch 52-60 | ch 61 | ch 62-63 |
//   |---|---|---|---|
//   | cells stating a placement condition | 38 of 81 | 1 of 81 | **0 of 162** |
//   | a defeasibility clause of its own | — | yes (61.2) | **none** |
//   | doom-laden cells | mixed | 54 of 81 | 92 of 162 |
//
// Chapter 61 at least told us its flat cells were defeasible. These do not, which leaves 162
// unconditioned, undefeased declaratives describing periods **shorter than the birth time is
// known to** — the standing reason this project computes sookshma and prana and never shows
// them.
//
// What is here: the two formulas, verified, and the refusal argued with its numbers.

import type { Graha } from '../../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// 62.1 and 63.1 — the fourth and fifth recursions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 62.1: *multiply the pratyantar period by the dasha years of each planet and divide by
 * 120.* BPHS 63.1 says the same of the sookshma to get the prana.
 *
 * That is `subPeriodYears` for the fourth and fifth time. The programme has now seen the
 * identical operation at every level of the Vimshottari tree:
 *
 *   | level | chapter | verse |
 *   |---|---|---|
 *   | antardasa | 51 | 51.1 |
 *   | pratyantar | 51, 61 | 51.1, 61.1 |
 *   | sookshma | 62 | 62.1 |
 *   | prana | 63 | 63.1 |
 *
 * **Five levels, one function, and the book restates it each time rather than varying it.**
 * That is worth recording as a positive finding: the recursion is the source's own, not an
 * extrapolation we made from the antardasa rule.
 */
export const SUBDIVISION_RECURSES_AT_EVERY_LEVEL =
  'BPHS 62.1 and 63.1 state the SAME operation as 51.1 and 61.1 — multiply the parent span by '
  + 'the child lord’s dasha years and divide by 120 — for the fourth and fifth levels. Five '
  + 'levels, ONE function (`subPeriodYears`), and the book restates it at each level rather '
  + 'than varying it. Recorded as a positive finding: the recursion is the SOURCE’S, not an '
  + 'extrapolation we made from the antardasa rule. No new arithmetic, so no new function.';

/**
 * How long these periods actually are, computed rather than asserted — because the numbers
 * are the argument.
 *
 * Over all 9⁴ and 9⁵ lord chains, on the 360-day year the corpus uses:
 *
 *   - **sookshma**: 6.5 hours to 33.3 days; the median is about 4.4 days
 *   - **prana**: **19.4 minutes** to 5.6 days
 *
 * A birth time is rarely known better than to the minute and is often uncertain by a quarter
 * hour or more; the ascendant moves a full sign in roughly two hours. A 19-minute period is
 * comfortably inside that uncertainty, and the shortest sookshma is not far outside it.
 *
 * This is not a new decision. `PREDICTION_POINTERS.md` §11.1.3 has said since Part 34 that
 * sookshma and prana are *computed, never displayed — shorter than the birth-time uncertainty.
 * Showing them is showing noise.* Chapters 62-63 are the effect readings **for exactly those
 * periods**, so encoding them would furnish a layer the product has already declined to show.
 */
export const SOOKSHMA_PRANA_SPANS = {
  sookshmaMinDays: 0.27,
  sookshmaMaxDays: 33.33,
  pranaMinDays: 0.0135,
  pranaMaxDays: 5.56,
  note: 'Computed over all 9^4 and 9^5 lord chains on the 360-day year. The shortest prana is '
    + '19.4 MINUTES and the shortest sookshma is 6.5 hours. A birth time is rarely known '
    + 'better than to the minute and the ascendant moves a full sign in about two hours, so '
    + 'these periods sit inside the birth-time uncertainty rather than outside it.',
} as const;

export const SPANS_ARE_BELOW_THE_BIRTH_TIME_RESOLUTION =
  'The shortest prana is 19.4 MINUTES and the shortest sookshma 6.5 hours (over all 9^4/9^5 '
  + 'chains, 360-day year). The ascendant moves a full sign in about two hours, so these '
  + 'periods lie inside the birth-time uncertainty. NOT a new decision: pointers §11.1.3 has '
  + 'held since Part 34 that sookshma and prana are computed, never displayed — "showing them '
  + 'is showing noise". Chapters 62-63 are the effect readings for exactly those periods.';

// ─────────────────────────────────────────────────────────────────────────────
// The 162 effect cells — refused, on four grounds
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⚠️ **Not one of the 162 cells states a placement condition.**
 *
 * A generous search — any of *if X be/is*, kendra, trikona, exalted, debilitated, own sign,
 * own house, or the phrase *from the* — returned 15 blocks, and reading them showed **all
 * fifteen to be false positives**: "reverence from the **king**", "danger from the **people**",
 * "danger from **fire**". None is a placement condition.
 *
 * The trend across the timing block is monotone and worth stating as a number, because it is
 * what turns a judgement into a measurement:
 *
 *   - chapters 52-60: **38 of 81** pairs give a house set counted from the dasha lord
 *   - chapter 61: **1 of 81**
 *   - chapters 62-63: **0 of 162**
 *
 * The deeper the level, the less the source conditions. That is a coherent thing for a text to
 * do — the finer divisions are bookkeeping, not judgement — and it is also exactly why the
 * finer divisions cannot be encoded as rules.
 */
export const NO_CELL_STATES_A_CONDITION =
  'ZERO of the 162 cells in chapters 62-63 state a placement condition. A deliberately '
  + 'generous search (if X be/is, kendra, trikona, exalted, debilitated, own sign/house, "from '
  + 'the") returned 15 blocks and ALL FIFTEEN were false positives — "reverence from the '
  + 'king", "danger from the people", "danger from fire". The trend across the timing block is '
  + 'monotone: 38 of 81 pairs conditioned in ch 52-60, 1 of 81 in ch 61, 0 of 162 here. The '
  + 'deeper the level, the less the source conditions — coherent for a text whose finer '
  + 'divisions are bookkeeping rather than judgement, and exactly why they cannot be rules.';

/**
 * ⚠️ And unlike chapter 61, these chapters supply **no defeasibility clause of their own**.
 *
 * 61.2 closed with *"All other Pratyantar effects should be judged in this manner"* — the
 * thirteenth source-stated arbitration instruction, which told a reader that the chapter's
 * flat cells were qualified by placement. Chapters 62-63 contain no such sentence: searching
 * for "general effects", "judged in this manner", "should be judged" and "similar" across
 * 1,043 lines returns nothing.
 *
 * That cuts against encoding, not for it. Chapter 61's cells were flat *and* explicitly
 * bracketed; these are flat and unbracketed. The most defensible reading is that 61.2's
 * instruction was meant to carry forward — it says "all other Pratyantar effects", and these
 * are its subdivisions — but that is an inference, and inferring a qualification in order to
 * ship an unqualified claim is the wrong direction to reason in.
 */
export const NO_DEFEASIBILITY_CLAUSE_HERE =
  'Chapters 62-63 supply NO defeasibility clause of their own. Chapter 61 closed its first '
  + 'cell with "all other Pratyantar effects should be judged in this manner" — the 13th '
  + 'source-stated arbitration instruction — telling the reader its flat cells were qualified '
  + 'by placement. Searching 1,043 lines here for "general effects", "judged in this manner", '
  + '"should be judged" and "similar" returns NOTHING. That cuts AGAINST encoding: ch 61’s '
  + 'cells were flat and explicitly bracketed, these are flat and unbracketed. 61.2 most '
  + 'likely carries forward — it says "all other Pratyantar effects" and these are its '
  + 'subdivisions — but that is an inference, and inferring a qualification in order to ship '
  + 'an unqualified claim reasons in the wrong direction.';

/**
 * The refusal, with all four grounds together.
 *
 * Each is independently sufficient; the point of stating all four is that a later part
 * revisiting this decision should have to answer all of them, not just the easiest.
 */
export const CH62_63_EFFECTS_REFUSED =
  'Chapters 62-63’s 162 sookshma and prana effect cells are NOT encoded, on four independent '
  + 'grounds. (1) NO CONDITION: zero of 162 cells state one, against 1 of 81 in ch 61 and 38 '
  + 'of 81 pairs in ch 52-60. (2) NO DEFEASIBILITY CLAUSE: unlike 61.2, these chapters never '
  + 'say their flat readings are qualified — so they are flat AND unbracketed. (3) BELOW THE '
  + 'RESOLUTION: the shortest prana is 19.4 minutes and the shortest sookshma 6.5 hours, '
  + 'inside the birth-time uncertainty, and pointers §11.1.3 has declined to display these '
  + 'levels since Part 34 — encoding their readings would furnish a layer the product does '
  + 'not show. (4) CONTENT: 92 of 162 cells are doom-laden and 39 carry medical claims. Each '
  + 'ground is sufficient alone; all four are stated so a later part revisiting this has to '
  + 'answer all of them, not the easiest.';

/**
 * What the levels still provide, so the refusal is a redirection rather than a hole.
 *
 * The spans and the order are computable and verified; the timing tree is complete to five
 * levels. It is only the flat effect prose at levels four and five that is refused.
 */
export const SOOKSHMA_PRANA_STILL_COMPUTABLE =
  'Both levels remain fully COMPUTABLE and are unaffected by the refusal: `subPeriodYears` '
  + 'gives every sookshma and prana span (verified here and in Parts 39 and 42), and BPHS '
  + '51.2 gives the order at every level — each run starting from its own parent lord. The '
  + 'Vimshottari tree is complete to five levels. Only the flat effect prose at levels four '
  + 'and five is refused, and a conditioned reading is available two levels up (Parts 40-41).';

/** The nine lords in the 51.2 order, reused unchanged at levels four and five. */
export const SOOKSHMA_ORDER: Graha[] =
  ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];

export const CH62_63_YIELD = {
  chapters: [62, 63],
  note: 'Part 42 predicted this part’s outcome and the prediction held — which is itself the '
    + 'result worth recording, because the state file said what would change the verdict (a '
    + 'chapter stating a condition per cell) and a single measurement settled it. VERIFIED: '
    + '62.1 and 63.1 are `subPeriodYears` for the fourth and fifth time; five levels, one '
    + 'function, restated by the book at each level rather than extrapolated by us. REFUSED: '
    + 'the 162 effect cells, on four independent grounds — zero conditioned cells (against 1 '
    + 'of 81 in ch 61 and 38 of 81 in ch 52-60), no defeasibility clause where ch 61 had one, '
    + 'periods shorter than the birth time is known to (prana from 19.4 MINUTES), and 92 of '
    + '162 doom-laden. The levels stay computable; only the flat prose is refused.',
} as const;
