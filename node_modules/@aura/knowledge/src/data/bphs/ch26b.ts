// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 26b — Evaluation of Planetary Aspects, remainder. Programme Part 8.
// Source lines 9340-10749.
//
// This part turned out to be almost entirely VERIFICATION rather than new capability,
// and that is the honest description of it. Lines 10000-10749 contain no verses at all —
// they are the chapter's precomputed "Speculum of Aspectual Values", a 373-entry table of
// angle → virupas. What looked like 749 lines of unextracted material is a printed
// ANSWER KEY for the formula Part 7 already implemented.
//
// So the work here was to use it as one: run Part 7's curve against every entry the
// chapter prints. **361 of 373 match exactly.** All twelve exceptions are OCR damage in
// this scan, not disagreements — every one differs from the computed value by a single
// digit, and six are the same substitution (`.75` printed as `.15`, a 7 read as a 1).
//
// Two things were also settled here that Part 7 could not see:
//   • the six aspect rules restated in prose (9340-9350), which confirm the piecewise
//     curve branch for branch, and expose an OCR typo in the source's own rule 6
//   • Santhanam's "simple formula" shortcut for the special planets, which DISAGREES with
//     the root verses and can produce an impossible value — recorded, not adopted
//
// Plan correction made here: **graha yuddha is not in chapter 26.** It is chapter 27,
// verse 20 (line 13480), which lands in Programme Part 11. The open thread was pointing
// at the wrong chapter.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The six aspect rules as the chapter restates them in prose (9340-9350).
 *
 * These are not new — they are the same piecewise curve as 26.6-8, written out plainly —
 * but restating them independently is exactly the kind of internal corroboration worth
 * recording, and one of them carries a visible typo.
 */
export const ASPECT_RULES_RESTATED = [
  { rule: 1, range: '30-60', formula: '(angle - 30) / 2' },
  { rule: 2, range: '60-90', formula: '(angle - 60) + 15' },
  { rule: 3, range: '90-120', formula: '(120 - angle) / 2 + 30' },
  { rule: 4, range: '120-150', formula: '150 - angle' },
  { rule: 5, range: '150-180', formula: '(angle - 150) * 2' },
  { rule: 6, range: '180-300', formula: '(300 - angle) / 2' },
] as const;

/**
 * The source prints rule 6 as "above 160 but below 300 degrees". That is a typo for 180:
 * rule 5 already covers 150-180, so a rule starting at 160 would overlap it by twenty
 * degrees and contradict it throughout. 180 is the only reading that leaves the six rules
 * a clean partition, and it is what Part 7 implements.
 */
export const RULE_SIX_TYPO_NOTE =
  'Rule 6 is printed as "above 160" in this edition. It must be 180 — rule 5 covers '
  + '150-180, so 160 would overlap and contradict it. 180 is the only reading that leaves '
  + 'the six rules a clean partition of 30-300.';

/** No aspect at all outside this arc (9350). */
export const ASPECT_ACTIVE_ARC = { from: 30, to: 300 } as const;

/**
 * 9350: "For house in aspect, consider the cusp of the house, akin to a planetary degree."
 *
 * An aspect onto a HOUSE is measured to that house's cusp, not to its sign boundary. That
 * makes the graded aspect system depend on bhava madhya — which the codebase still does
 * not compute (the same gap that leaves Part 2's `cuspStrength` without a source). Until
 * Part 11 supplies cusps, aspects onto houses are evaluated whole-sign, which is exact at
 * the cusp and drifts away from it.
 */
export const HOUSE_ASPECT_USES_CUSP = true;

export const HOUSE_ASPECT_CUSP_NOTE =
  'BPHS measures an aspect onto a house to the house CUSP, not its sign boundary. The '
  + 'codebase has no bhava madhya yet (see also cuspStrength, Part 2), so house-targeted '
  + 'aspects are currently whole-sign — exact at the cusp, drifting up to 15 degrees away '
  + 'from it. Closes with Part 11.';

// ── The additive shortcut, and why it is not adopted ─────────────────────────

/**
 * Santhanam offers a "simple formula" so a student can skip the piecewise arithmetic:
 * take the general speculum value and ADD a fixed amount inside the special planet's
 * ranges — Mars +15, Jupiter +30, Saturn +45.
 *
 * It is not adopted, and the reason is decisive rather than a matter of preference:
 * **for Saturn it produces up to 90 virupas.** A full aspect is defined as exactly one
 * rupa — 60 virupas (26.11) — so a scheme that returns one and a half rupas cannot be
 * what the text means.
 *
 * The shortcut agrees with the root verses exactly at the START of each range, which is
 * where each special aspect peaks at 60 — it is calibrated at the peak and diverges as
 * the angle moves away. Mars and Jupiter stay within bounds but still drift (up to 15
 * virupas by the far edge of a range). The root-verse curves in ch26a stand.
 */
export const ADDITIVE_SHORTCUT = {
  mars: { ranges: [[90, 120], [210, 240]] as const, add: 15 },
  jupiter: { ranges: [[120, 150], [240, 270]] as const, add: 30 },
  saturn: { ranges: [[60, 90], [270, 300]] as const, add: 45 },
} as const;

export const ADDITIVE_SHORTCUT_REJECTED =
  'Santhanam\'s additive shortcut (general value + 15/30/45 inside the special ranges) is '
  + 'NOT used. For Saturn it reaches 90 virupas, and a full aspect is exactly one rupa = '
  + '60 (26.11), so it cannot be the intended rule. It agrees with the root verses only at '
  + 'the start of each range, where the aspect peaks; it is calibrated there and drifts. '
  + 'The root-verse curves in ch26a are authoritative.';

// ── The speculum verification ─────────────────────────────────────────────────

/**
 * The result of checking Part 7's `drishtiValueGeneral` against every entry the chapter
 * prints in its Speculum of Aspectual Values.
 *
 * Recorded as data because it is a measured property of both the formula and the source,
 * and because the OCR error rate is worth knowing for every later part that reads a table
 * out of this edition.
 */
export const SPECULUM_VERIFICATION = {
  entries: 373,
  exactMatches: 361,
  mismatches: 12,
  /**
   * EVERY mismatch differs from the computed value by exactly one digit, once both are
   * normalised to two decimals. An earlier count said eleven; that excluded the 45:00
   * entry only because its raw print drops a trailing zero ("1.5" against "7.50"), which
   * is a formatting artefact rather than a second kind of error. Twelve of twelve.
   */
  singleDigitDifferences: 12,
  /** The dominant OCR fault: a printed 7 read as a 1. */
  dominantPattern: '.75 printed as .15 (7 read as 1), six occurrences',
  ocrErrorRate: 12 / 373,
  verdict: 'The formula is correct; the printed table in this scan carries about 3% OCR '
    + 'corruption. Every mismatch is a single-digit misread — none reflects a '
    + 'disagreement about the rule.',
} as const;

/**
 * The twelve corrupted cells, as `[angleDegrees, printedValue, computedValue]`.
 *
 * Kept so a later part reading this table does not have to rediscover them, and so the
 * claim "these are OCR faults, not rule disagreements" can be checked rather than trusted.
 */
export const SPECULUM_OCR_FAULTS: readonly (readonly [number, number, number])[] = [
  [31.5, 0.15, 0.75],
  [35.5, 0.75, 2.75],
  [39.5, 4.15, 4.75],
  [41.5, 5.15, 5.75],
  [45.0, 1.5, 7.5],
  [49.5, 9.15, 9.75],
  [50.5, 11.25, 10.25],
  [51.5, 10.15, 10.75],
  [53.5, 11.15, 11.75],
  [88.0, 13.0, 43.0],
  [166.0, 31.0, 32.0],
  [220.5, 39.15, 39.75],
] as const;

/**
 * A representative sample of speculum entries that DO match, one per branch of the curve
 * plus every branch boundary. The full 373-entry table is not embedded — that would be
 * copying the source's data wholesale rather than encoding a rule, and the sample proves
 * the same thing.
 */
export const SPECULUM_SAMPLE: readonly (readonly [number, number])[] = [
  [30.0, 0.0], [30.5, 0.25], [47.0, 8.5], [60.0, 15.0],      // rule 1 and its edges
  [64.0, 19.0], [75.0, 30.0], [90.0, 45.0],                   // rule 2
  [100.0, 40.0], [120.0, 30.0],                               // rule 3
  [130.0, 20.0], [150.0, 0.0],                                // rule 4
  [165.0, 30.0], [180.0, 60.0],                               // rule 5
  [210.0, 45.0], [240.0, 30.0], [250.5, 24.75],               // rule 6
] as const;
