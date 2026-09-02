// BPHS Programme Part 42 — Chapter 61: the pratyantar dasha.
//
// The largest chapter in the book (5,592 lines) and one of the smallest yields, for a reason
// worth stating precisely rather than apologising for: **87% of it is arithmetic tables that
// one formula generates, and the remaining prose is 81 flat declaratives the chapter itself
// says are defeasible.**
//
// So the part splits cleanly:
//
//   - **Verified** — the pratyantar formula, against 225 table cells and the chapter's two
//     worked examples. It is `subPeriodYears` applied a third time; nothing changed.
//   - **Kept** — 61.2's closing sentence, which is the thirteenth source-stated arbitration
//     instruction and the single most useful line in the chapter.
//   - **Refused** — the 81 effect cells, on the chapter's own terms.
//
// This is the third chapter block in a row where BPHS 51.2's ordering rule (Part 39) proved
// load-bearing, and the third sighting of the stale-heading transcription fault.

import type { Graha } from '../../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// 61.1 — the formula, verified
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 61.1: *multiply the antardasa span by the dasha years of each planet and divide by
 * 120.* The same operation as 51.1, applied one level deeper — which is exactly what
 * `subPeriodYears` already does, and why this needed no new function.
 *
 * The chapter's own two worked examples, both in the Sun's dasha and the Sun's antardasa
 * (a span of 108 days):
 *
 * | example | book | ours |
 * |---|---|---|
 * | pratyantar of the Sun | 5 days 24 ghatikas | 108 × 6/120 = 5.4 d ✓ |
 * | pratyantar of the Moon | 9 days | 108 × 10/120 = 9 d ✓ |
 *
 * And then the tables. 25 of the chapter's tables could be **attributed decisively by their
 * own arithmetic** — meaning exactly one of the nine maha lords makes at least eight of the
 * nine cells exact — covering seven of the nine lords. Across those, **215 of 225 cells match
 * the formula exactly (95.6%)**.
 *
 * Attribution by arithmetic rather than by heading is deliberate: the headings in this chapter
 * are damaged in the same way Parts 40 and 41 found, so reading the maha lord off them would
 * have imported the fault into the verification. Solving for the lord that fits makes the
 * attribution and the check the same operation.
 */
export const PRATYANTAR_FORMULA_VERIFIED =
  'BPHS 61.1 is `subPeriodYears` applied a third time — antardasa span × planet years / 120 — '
  + 'and NOTHING CHANGED. Verified against the chapter’s two worked examples (pratyantar of '
  + 'the Sun in Sun/Sun = 5d 24gh; of the Moon = 9d, both from a 108-day antardasa) and '
  + 'against 225 cells drawn from the 25 tables that could be attributed DECISIVELY by their '
  + 'own arithmetic — exactly one maha lord fitting at least 8 of 9 cells — covering seven of '
  + 'the nine lords. 215 of 225 exact, 95.6%. Attribution by arithmetic rather than by '
  + 'heading is deliberate: the headings carry the same fault Parts 40-41 found, so reading '
  + 'the lord off them would have imported it into the check.';

/**
 * The ten cells that do not match, and why they are the transcription's fault rather than
 * the formula's.
 *
 * Every one is a **digit-level corruption**: −9, +3, −30, +30, −1, −7, +10 days, and two
 * ghatika slips of +0.17 and +0.10 of a day. A rival convention produces a *consistent* offset
 * — every cell in a table shifted the same way, or every cell scaled — and these are neither.
 * They are isolated, they differ in sign, and their magnitudes are single decimal digits in
 * the day or ghatika column.
 *
 * The same argument settled chapter 51's printed antardasa table in Part 39, where the
 * checksum was the column totals. Here the checksum is the other 215 cells.
 */
export const PRATYANTAR_TABLE_FAULTS_ARE_DIGIT_LEVEL =
  'Ten of the 225 verified cells disagree with the formula, and all ten are digit-level '
  + 'corruptions: −9, +3, −30, +30, −1, −7 and +10 days, plus two ghatika slips of +0.17 and '
  + '+0.10 of a day. A rival convention gives a CONSISTENT offset — every cell in a table '
  + 'shifted or scaled the same way — and these are isolated, differ in sign, and are single '
  + 'decimal digits in the day or ghatika column. Same argument that settled chapter 51’s '
  + 'antardasa table in Part 39; there the checksum was the column totals, here it is the '
  + 'other 215 cells. NOTHING was changed on the tables’ authority.';

/**
 * A third independent confirmation of BPHS 51.2, from the table layout rather than the text.
 *
 * Every pratyantar table lists its nine columns in the Vimshottari sequence **starting from
 * the antardasa lord** — which is precisely what 51.2 says the order of sub-periods is. Of 58
 * parseable tables, **47 match the sequence for the planet their heading names**, and the
 * other **11 match it for the planet one step later** — the stale-heading fault again, now
 * seen in a third consecutive chapter block.
 *
 * So all 58 confirm the rule; 11 of them also confirm that the headings drift.
 */
export const COLUMN_ORDER_CONFIRMS_51_2 =
  'Every pratyantar table lists its nine columns in the Vimshottari sequence STARTING FROM THE '
  + 'ANTARDASA LORD — which is what BPHS 51.2 states the sub-period order to be, here '
  + 'confirmed by layout rather than by text. Of 58 parseable tables, 47 match the sequence '
  + 'for the planet their heading names and the other 11 match it for the planet ONE STEP '
  + 'LATER — the stale-heading fault, in its third consecutive chapter block after 52-56 and '
  + '57-60. All 58 confirm the rule; 11 also confirm the drift.';

// ─────────────────────────────────────────────────────────────────────────────
// 61.2 — the thirteenth arbitration instruction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **The most useful line in the chapter, and it is one sentence.**
 *
 * BPHS 61.2 gives the Sun-Sun-Sun cell as *"argument with other persons, loss of wealth,
 * distress to wife, headache"* — and then adds:
 *
 *   *"The above are general effects. Such inauspicious effects will not be produced if the Sun
 *    be in Trikona etc., be the lord of an auspicious house, be in an auspicious house and
 *    [in a] benefic Varga. **All other Pratyantar effects should be judged in this manner.**"*
 *
 * That final sentence is the whole chapter's licence. It says the 81 flat declaratives that
 * follow — none of which repeats any condition — are **defeasible by placement**, and it says
 * so once, generically, for all of them.
 *
 * It is the **thirteenth** source-stated arbitration instruction, and the broadest: 36.1-2
 * qualified yogas, 48.1 qualified a dasha lord, and this qualifies an entire chapter of
 * period readings in advance.
 *
 * It is also the reason the 81 cells are refused rather than encoded — see
 * `CH61_EFFECTS_REFUSED`. A flat cell we cannot defease is a cell the chapter has told us not
 * to state flatly.
 */
export const PRATYANTAR_EFFECTS_ARE_DEFEASIBLE =
  'BPHS 61.2, after giving the first cell’s effects: "The above are general effects. Such '
  + 'inauspicious effects will not be produced if the Sun be in Trikona etc., be the lord of '
  + 'an auspicious house, be in an auspicious house and [in a] benefic Varga. ALL OTHER '
  + 'PRATYANTAR EFFECTS SHOULD BE JUDGED IN THIS MANNER." One sentence licensing the whole '
  + 'chapter: the 81 flat declaratives that follow are DEFEASIBLE BY PLACEMENT, stated once '
  + 'and generically. The THIRTEENTH source-stated arbitration instruction and the broadest — '
  + '36.1-2 qualified yogas, 48.1 qualified a dasha lord, this qualifies an entire chapter of '
  + 'period readings in advance. It is also why the 81 cells are refused: a flat cell we '
  + 'cannot defease is one the chapter has told us not to state flatly.';

// ─────────────────────────────────────────────────────────────────────────────
// The 81 effect cells — refused
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chapter 61's 81 pratyantar effect cells are **not encoded**, on three grounds that compound.
 *
 * **1. They carry no condition.** Of 81 blocks, **one** states any placement condition — 61.2,
 * and it states it as a general licence rather than as that cell's rule. There is no house
 * set, no dignity test, no frame. Chapters 52-60 gave a position counted from the dasha lord
 * for 38 of their 81 pairs; this chapter gives one for none of them.
 *
 * **2. The chapter says they must not be read flat.** 61.2's closing sentence
 * (`PRATYANTAR_EFFECTS_ARE_DEFEASIBLE`) instructs that every cell is defeasible by placement.
 * Encoding them as unconditional rules would contradict the chapter's own instruction, and we
 * have nothing to condition them on — see (1). Encoding them *with* a condition we invented
 * would be worse.
 *
 * **3. The content is overwhelmingly doom and medicine.** 54 of 81 cells are doom-laden and 22
 * carry medical claims; 25 carry neither. A sample: *"danger from enemies, quarrels, and fear
 * of premature death on account of blood diseases"*; *"danger from weapons, pain in anus,
 * burning in stomach, indigestion"*.
 *
 * Any one of these would justify caution. Together they make encoding actively wrong: we would
 * be shipping unconditional misfortune claims that the source itself brackets.
 *
 * **What is kept instead** is 61.2's instruction, which is portable, and the formula, which is
 * verified. The pratyantar level is still fully computable — `subPeriodYears` gives every
 * span, and the maha×antar readings from Parts 40-41 remain available at the level above.
 */
export const CH61_EFFECTS_REFUSED =
  'Chapter 61’s 81 pratyantar effect cells are NOT encoded, on three compounding grounds. '
  + '(1) NO CONDITION: exactly one of 81 blocks states a placement condition, and it states it '
  + 'as a general licence rather than as that cell’s rule — no house set, no dignity test, no '
  + 'frame, where chapters 52-60 gave a position from the dasha lord for 38 of 81 pairs. '
  + '(2) THE CHAPTER FORBIDS A FLAT READING: 61.2 instructs that every cell is defeasible by '
  + 'placement, so encoding them unconditionally contradicts the source, and we have nothing '
  + 'to condition them on. (3) CONTENT: 54 of 81 are doom-laden and 22 carry medical claims; '
  + 'only 25 carry neither. Together these make encoding actively wrong — it would ship '
  + 'unconditional misfortune claims the source itself brackets. Kept instead: 61.2’s '
  + 'instruction, which is portable, and the formula, which is verified. The pratyantar level '
  + 'remains fully COMPUTABLE; it is only the flat effect prose that is refused.';

/**
 * What a caller asking for a pratyantar reading should be given instead of the refused cells.
 *
 * Not nothing — the level is computable and the level above it is encoded. This exists so the
 * refusal is a redirection rather than a dead end.
 */
export const PRATYANTAR_WHAT_WE_OFFER_INSTEAD: { instead: string; where: string }[] = [
  { instead: 'the exact span of any pratyantar', where: '`subPeriodYears`, verified here against 225 cells' },
  { instead: 'the order of pratyantars within an antardasa', where: 'BPHS 51.2 — the sequence from the antardasa lord' },
  { instead: 'a conditioned reading of the period above it', where: 'Parts 40-41, the 81 maha×antar pairs read from the dasha lord' },
  { instead: 'the rule that any such reading is defeasible', where: '61.2, the thirteenth source-stated arbitration instruction' },
];

/** The nine lords, in the Vimshottari order 51.2 gives — reused by the pratyantar layer. */
export const PRATYANTAR_ORDER: Graha[] =
  ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];

export const CH61_YIELD = {
  chapters: [61],
  note: 'The largest chapter in the book (5,592 lines) and one of the smallest yields, for a '
    + 'stateable reason: 87% of it is arithmetic tables that ONE FORMULA generates, and the '
    + 'rest is 81 flat declaratives the chapter itself says are defeasible. VERIFIED: the '
    + 'pratyantar formula against 225 table cells (215 exact) and two worked examples — '
    + 'nothing changed, and the 10 faults are digit-level. KEPT: 61.2’s closing sentence, the '
    + 'thirteenth source-stated arbitration instruction and the broadest — it declares an '
    + 'entire chapter of readings defeasible by placement, in advance. REFUSED: the 81 effect '
    + 'cells, because they carry no condition, the chapter forbids reading them flat, and 54 '
    + 'of 81 are doom-laden. Also a third independent confirmation of BPHS 51.2, from the '
    + 'table COLUMN ORDER — and a third sighting of the stale-heading fault, 11 tables of 58.',
} as const;
