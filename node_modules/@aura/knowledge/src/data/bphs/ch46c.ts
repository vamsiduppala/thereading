// BPHS Programme Part 36 — Chapter 46c: Kalachakra.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE NEAR-MISS THAT MAKES THIS PART WORTH READING
// ─────────────────────────────────────────────────────────────────────────────
//
// This part came within one commit of "fixing" a correct implementation.
//
// BPHS 46.89 states a poornayu per amsa — Aries 100, Taurus 85, Gemini 83, Cancer 86, "the
// same for rāśhis situated in the 5th and 9th to them". Checked against the shipped
// `kalachakraPada`, that table matched the paramayush for **all 60 savya padas and none of
// the 48 apasavya ones** — and the two value SETS were identical, {83, 85, 86, 100}, so it
// was a permutation rather than different arithmetic.
//
// A single transform closed the gap completely: reversing the pada order for apasavya
// nakshatras made **48 of 48** match. That is about as clean as evidence gets, and it had a
// story — *apasavya* means reversed, so of course the pada walk should reverse too; the
// shipped code reverses the wheel but not the pada indexing. The prior verification (from the
// other corpus, Table 43/44) had only ever exercised **Ashwini**, which is savya, so the
// apasavya path had genuinely never been checked against a worked example.
//
// **It was wrong.** BPHS gives a worked example on the apasavya side — Mrigasira 4th pada —
// and states plainly that Jeeva falls in Sagittarius and Deha in Aries. The shipped code
// returns exactly that. The proposed "fix" returns Pisces and Cancer.
//
// So the error was in the PREMISE: 46.89's poornayu table does not key onto the navamsa amsa
// the way the test assumed. Nothing about the implementation was wrong.
//
// The lesson is `PATTERN_LOSES_TO_WORKED_EXAMPLE` below, and it is the reason the programme's
// standing rule is "verify before correcting" rather than "correct what looks wrong".

import type { SignIndex } from '../../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// 46.87-88 — the pada → amsa formula, verified
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 46.87-88's own arithmetic for the amsa a nakshatra pada falls in:
 *
 *   "The number of Ashwini etc. whichever may be the past Nakshatras should be divided by 3.
 *    Thereafter the remainder should be multiplied by 4. To the figure so made available the
 *    Pada of the present Nakshatra be added. The product will be the Navamsha from Aries."
 *
 * Its own worked example: Mrigasira 4th pada. Past nakshatras = 4; 4 mod 3 = 1; 1 × 4 = 4;
 * plus pada 4 = 8; the 8th sign from Aries is **Scorpio**.
 *
 * This is an entirely independent construction from `vargaSign(longitude, 9)` — it counts
 * nakshatras and padas where the other divides degrees — and **the two agree for all 108
 * padas**. That is a real cross-check on Part 3's navamsa, not a restatement of it.
 *
 * The chapter even explains why the arithmetic works: "In 3 Nakshatras there are Navamsha of
 * 12 signs" — three nakshatras of four padas tile the twelve signs exactly.
 */
export function amsaFromPada(nakshatra: number, pada: number): SignIndex {
  const past = ((nakshatra % 27) + 27) % 27;
  return (((past % 3) * 4 + pada - 1) % 12) as SignIndex;
}

export const AMSA_FORMULA_IS_AN_INDEPENDENT_CHECK =
  'BPHS 46.87-88 derives the amsa by counting nakshatras and padas; `vargaSign(L, 9)` derives '
  + 'it by dividing degrees. They are independent constructions and they agree for all 108 '
  + 'padas, which is a genuine cross-check on Part 3’s navamsa rather than a restatement. The '
  + 'chapter gives the reason too: three nakshatras of four padas tile the twelve signs.';

// ─────────────────────────────────────────────────────────────────────────────
// 46.89 — the poornayu table, and what it does NOT line up with
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 46.89's stated poornayu, by amsa sign. The trines share a value: "the number of years
 * will be the same for rāśhis situated in the 5th and 9th to them."
 */
export const CH46_POORNAYU_BY_AMSA: Record<number, number> = {
  0: 100, 4: 100, 8: 100,    // Aries · Leo · Sagittarius
  1: 85, 5: 85, 9: 85,       // Taurus · Virgo · Capricorn
  2: 83, 6: 83, 10: 83,      // Gemini · Libra · Aquarius
  3: 86, 7: 86, 11: 86,      // Cancer · Scorpio · Pisces
};

/**
 * ⚠️ **Unresolved, and deliberately not acted on.**
 *
 * The obvious reading is that a pada's paramayush — the sum of its nine rasi dasa lengths —
 * should equal 46.89's poornayu for the amsa that pada falls in. Tested against the shipped
 * implementation, that holds for **all 60 savya padas and none of the 48 apasavya ones**.
 *
 * It is not a rounding difference or a different arithmetic: the two sets of values are
 * identical, {83, 85, 86, 100}. Only the assignment differs, and only on the apasavya side.
 *
 * Three readings are open, and this chapter does not settle between them:
 *   1. 46.89's table is stated for the savya case and the apasavya mapping differs;
 *   2. "the Amsa" in 46.89 means something other than the navamsa of 46.87-88;
 *   3. the shipped apasavya wheel assigns the right totals to the wrong padas.
 *
 * **(3) was tested directly and refuted** — see `PATTERN_LOSES_TO_WORKED_EXAMPLE`. Between
 * (1) and (2) there is no evidence here, so nothing is changed and nothing is claimed.
 */
export const POORNAYU_MAPPING_UNRESOLVED =
  'BPHS 46.89’s poornayu per amsa matches the shipped paramayush for ALL 60 savya padas and '
  + 'NONE of the 48 apasavya ones — same value set {83,85,86,100}, different assignment. '
  + 'Either 46.89 is stated for the savya case only, or its "Amsa" is not 46.87-88’s navamsa. '
  + 'The third possibility — that the implementation is wrong — was tested and REFUTED by the '
  + 'chapter’s own worked example. Unresolved; nothing changed, nothing claimed.';

// ─────────────────────────────────────────────────────────────────────────────
// The worked example, and the methodological lesson
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS's worked example for Mrigasira 4th pada — an **apasavya** pada, which is exactly the
 * case the other corpus's verification never reached.
 *
 * "In the 4th Pada of Mrigasira Jeeva is in Sagittarius and Deha in Aries … the order of
 * Dasha will be Taurus, Aries, Sagittarius, Scorpio etc."
 */
export const MRIGASIRA_PADA_4 = {
  nakshatra: 4,
  pada: 4,
  group: 'apasavya' as const,
  jeeva: 8 as SignIndex,    // Sagittarius
  deha: 0 as SignIndex,     // Aries
  amsa: 7 as SignIndex,     // Scorpio, per 46.87-88's own arithmetic
  note: 'The order runs Taurus, Aries, Sagittarius, Scorpio — read cyclically from the '
    + 'birth dasha rather than from the head of the sequence.',
} as const;

/**
 * **The lesson of this part.**
 *
 * A single clean transform made 48 of 48 apasavya padas agree with 46.89. It fit a story —
 * *apasavya* means reversed, and the code reverses the wheel but not the pada walk — and it
 * closed the gap perfectly, with no residue. Every signal short of the source said "bug".
 *
 * The book's own worked example said otherwise, and the worked example wins. The shipped
 * code returns Jeeva in Sagittarius and Deha in Aries for Mrigasira 4th pada, exactly as
 * stated; the transform returns Pisces and Cancer.
 *
 * A perfect fit to a pattern is evidence about the pattern, not about the world. Four earlier
 * parts found real bugs by checking shipped code against the source; this one shows the same
 * check refusing a plausible false positive, which is the half of the discipline that never
 * gets a commit message.
 */
export const PATTERN_LOSES_TO_WORKED_EXAMPLE =
  'A single transform (reverse the pada order for apasavya) made 48 of 48 padas agree with '
  + 'BPHS 46.89, and it had a story: "apasavya" means reversed and the code reverses the wheel '
  + 'but not the pada walk. The prior verification had only ever covered Ashwini, which is '
  + 'savya, so the apasavya path had genuinely never been checked. Every signal short of the '
  + 'source said BUG. The chapter’s own worked example — Mrigasira 4th pada, Jeeva in '
  + 'Sagittarius and Deha in Aries — says the shipped code is right and the transform is '
  + 'wrong. **A perfect fit to a pattern is evidence about the pattern, not about the world.** '
  + 'Verify before correcting is not a slogan; it stopped a correct implementation being '
  + 'broken here.';

// ─────────────────────────────────────────────────────────────────────────────
// Safety
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 46.85-86 frames Kalachakra's paramayush explicitly as **lifespan**: purnayu, madhyayu,
 * alpayu, and "will face death like sufferings if the birth be at the end of the padas".
 *
 * The paramayush is structurally necessary — it is the sum of the nine rasi dasa lengths and
 * the dasha sequence cannot be built without it. But it is a longevity quantity, and this
 * corpus computes longevity and never surfaces it.
 *
 * So: compute, use for the sequence, never return as a span of life. This is the same
 * treatment as the 8th-from-Saturn karaka frame and the maraka column.
 */
export const KALACHAKRA_PARAMAYUSH_IS_LONGEVITY =
  'BPHS 46.85-86 frames the Kalachakra paramayush as a SPAN OF LIFE — purnayu, madhyayu, '
  + 'alpayu, and "death like sufferings" for a birth at the end of a pada. The number is '
  + 'structurally required (the dasha sequence is built from it) but it is a longevity claim, '
  + 'so it is computed and never surfaced as a lifespan — the same treatment as the '
  + '8th-from-Saturn frame (Part 28) and ch 34’s maraka column (Part 30). Part 51 owns '
  + 'longevity; nothing before it surfaces one.';

export const CH46C_YIELD = {
  chapter: 46,
  part: '46c',
  newRules: 0,
  note: 'A verification part whose main result is a NEGATIVE one: a clean, well-motivated '
    + 'correction was proposed, tested against the chapter’s own worked example, and refused. '
    + 'What was positively established: 46.87-88’s pada→amsa arithmetic agrees with '
    + '`vargaSign(L,9)` for all 108 padas — an independent cross-check on Part 3’s navamsa — '
    + 'and the shipped Kalachakra reproduces BPHS’s Mrigasira worked example exactly, which '
    + 'is the first time its apasavya path has been checked against any source at all.',
} as const;
