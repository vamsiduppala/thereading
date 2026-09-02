// BPHS Programme Part 41 — Chapters 57-60: the antardasa effects for Saturn, Mercury, Ketu
// and Venus. The remaining 36 of the 81 maha×antar pairs.
//
// Mechanically this is Part 40 again — same frame, same shape, same refusals — and the method
// recorded there ran unchanged. Two things make the part worth reading anyway.
//
// **The attribution held up under much harder conditions.** Chapters 52-56 kept 27 of their 45
// section headings; these four keep **five of thirty-six**. So BPHS 51.2's ordering rule is
// doing nearly all the work rather than merely filling gaps, and all three of Part 40's checks
// still pass: the surviving headings form a subsequence of the predicted order, all 14
// heading/verse disagreements have the verse name later, and the verse-named planets are
// monotonic across all 62 attributable blocks. A method that only worked when the source was
// mostly intact would have failed here.
//
// **The enmity hypothesis is refuted.** Part 40 found Mars's dasha with Saturn's antardasa
// reading adversely for the FAVOURABLE positions, and proposed that the two lords' mutual
// enmity was what governed — with Saturn's own chapters named as the test. They refute it.
// See `ENMITY_AXIS_REFUTED`, which is this part's real result.

import type { Graha, House } from '../../types.js';
import type { Predicate } from '../../rules/predicate.js';
import type { Rule } from '../../rules/rule.js';

// ─────────────────────────────────────────────────────────────────────────────
// The result: a hypothesis that did not survive its own test
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **The enmity axis proposed in Part 40 is refuted, and the refutation is clean.**
 *
 * Part 40 recorded BPHS 54.30-32 as a stated exception: in **Mars's** dasha, **Saturn's**
 * antardasa gives loss of reputation and position *when Saturn is well placed* — a kendra, the
 * 11th or the 5th from Mars. The proposed explanation was that Mars and Saturn are bitter
 * natural enemies, so what governs is the relationship between the two lords rather than
 * either one's dignity. The state file named the test: Saturn's own chapter pairs it with
 * Mars and the Sun, and if those cells inverted too, the enmity axis was a real rule.
 *
 * **They do not invert.** BPHS 57.55-57 — Saturn's dasha, Mars's antardasa — gives
 * *"enjoyments, gain of wealth, reverence from the king, gain of conveyances… attainment of
 * the position of a Commander of the Army"*, conditioned on Mars being exalted. That is a
 * favourable reading for the same pair of enemies, in the other order.
 *
 * **An enmity rule would be symmetric and this is not.** Mars-dasha/Saturn-antar is adverse;
 * Saturn-dasha/Mars-antar is favourable. Whatever governs 54.30-32, it is not "these two are
 * enemies" — that predicts both cells invert, and one of them plainly does not.
 *
 * So 54.30-32 stands as what it was recorded as: **a stated exception, kept because the
 * chapter states it**, and not the visible corner of a general rule. The thread closes as
 * refuted rather than staying open on a plausible story.
 *
 * (Saturn × Sun could not be tested either way — 57.42 conditions on the Sun's *lordship from
 * the ascendant*, not on a house from the dasha lord, so there is no comparable cell.)
 */
export const ENMITY_AXIS_REFUTED =
  'REFUTED. Part 40 found BPHS 54.30-32 reading MARS’s dasha / SATURN’s antardasa adversely for '
  + 'the FAVOURABLE positions, and proposed that the two lords’ mutual enmity governed — naming '
  + 'Saturn’s own chapters as the test. BPHS 57.55-57 refutes it: SATURN’s dasha / MARS’s '
  + 'antardasa gives enjoyments, gain of wealth, reverence and command of an army. An enmity '
  + 'rule would be SYMMETRIC and this is not — one order is adverse and the other favourable. '
  + 'So 54.30-32 remains a stated exception kept because the chapter states it, NOT the corner '
  + 'of a general rule. Saturn × Sun is untestable: 57.42 conditions on lordship from the '
  + 'ascendant, not on a house from the dasha lord. Thread closed as refuted, not left open on '
  + 'a plausible story.';

/**
 * The attribution, under a much more damaged source than Part 40's.
 *
 * Chapters 57-60 retain **5 of their 36** section headings, against 27 of 45 in 52-56. Part
 * 40's three checks were run unchanged and all three pass:
 *
 *   1. In all four chapters the surviving headings form a **subsequence** of the order BPHS
 *      51.2 predicts.
 *   2. All **14** heading/verse disagreements have the verse-named planet **later** in that
 *      order than the stale heading. None earlier.
 *   3. The verse-named planets are **monotonic** in that order across all **62** attributable
 *      blocks, chapter by chapter.
 *
 * That the same method survives a source five times more damaged is the useful part: it means
 * the repair rests on the ordering rule rather than on having enough headings left to
 * interpolate between.
 */
export const ATTRIBUTION_HELD_ON_A_WORSE_SOURCE =
  'Chapters 57-60 retain 5 of their 36 section headings, against 27 of 45 in chapters 52-56 — '
  + 'so BPHS 51.2’s ordering rule does nearly all the attribution here rather than filling '
  + 'gaps. Part 40’s three checks run unchanged and all pass: surviving headings form a '
  + 'subsequence of the predicted order in all four chapters; all 14 heading/verse '
  + 'disagreements have the verse name LATER, none earlier; verse-named planets are monotonic '
  + 'across all 62 attributable blocks. A method that only worked on a mostly-intact source '
  + 'would have failed here, and this one did not.';

// ─────────────────────────────────────────────────────────────────────────────
// The cells
// ─────────────────────────────────────────────────────────────────────────────

export interface AntardasaCell57 {
  maha: Graha;
  antar: Graha;
  chapter: number;
  verses: string[];
  favourable: House[];
  adverse: House[];
}

/**
 * The 12 of 36 pairs whose verses state a house condition **counted from the dasha lord**.
 *
 * Lower yield than Part 40's 26 of 45, and for a visible reason: these chapters lean harder on
 * dignity ("if Mars be in his sign of exaltation") and on lordship from the **ascendant** —
 * which is a different frame and a different claim — where 52-56 more often gave a house set.
 *
 * The shape is if anything cleaner. **All nine adverse branches are exactly the dusthanas**
 * ({6,8,12} or {8,12}), with no departure like 52-56's Moon/Mars cell adding the 5th.
 */
export const ANTARDASA_CELLS_57_60: AntardasaCell57[] = [
  { maha: 'ketu', antar: 'mars', chapter: 59, verses: ['40'], favourable: [1, 3, 4, 5, 7, 9, 10, 11], adverse: [] },
  { maha: 'ketu', antar: 'mercury', chapter: 59, verses: ['77-79'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'ketu', antar: 'moon', chapter: 59, verses: ['31-33', '34-36'], favourable: [1, 4, 5, 7, 9, 10, 11], adverse: [6, 8, 12] },
  { maha: 'ketu', antar: 'sun', chapter: 59, verses: ['22-24'], favourable: [], adverse: [8, 12] },
  { maha: 'ketu', antar: 'venus', chapter: 59, verses: ['10-11'], favourable: [1, 4, 5, 7, 9, 10], adverse: [] },
  { maha: 'mercury', antar: 'ketu', chapter: 58, verses: ['9-11'], favourable: [], adverse: [8, 12] },
  { maha: 'mercury', antar: 'moon', chapter: 58, verses: ['32-33'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'saturn', antar: 'jupiter', chapter: 57, verses: ['76-78', '79-80'], favourable: [1, 2, 4, 5, 7, 9, 10, 11], adverse: [6, 8, 12] },
  { maha: 'saturn', antar: 'moon', chapter: 57, verses: ['43-45', '51-52'], favourable: [1, 4, 5, 7, 9, 10, 11], adverse: [6, 8, 12] },
  { maha: 'saturn', antar: 'venus', chapter: 57, verses: ['32-34'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'venus', antar: 'ketu', chapter: 60, verses: ['70-72'], favourable: [], adverse: [8, 12] },
  { maha: 'venus', antar: 'mercury', chapter: 60, verses: ['60-62'], favourable: [1, 4, 5, 7, 9, 10, 11], adverse: [] },
];

export const SHAPE_IS_CLEANER_HERE =
  'All NINE adverse branches in chapters 57-60 are exactly the dusthanas — {6,8,12} or {8,12} '
  + '— with no departure like chapter 53’s Moon/Mars cell, which added the 5th. And no cell '
  + 'inverts: every favourable house set carries a favourable reading. The condition shape from '
  + 'Part 40 holds here without exception, which is itself part of why the enmity hypothesis '
  + 'fails — 54.30-32 is isolated, not the first of a family.';

export const CELLS_57_60_COVERAGE =
  '12 of the 36 pairs in chapters 57-60 state a house condition counted from the dasha lord, '
  + 'against 26 of 45 in chapters 52-56. The other 24 are read but condition on the antar '
  + 'planet’s DIGNITY ("if Mars be in his sign of exaltation") or on LORDSHIP FROM THE '
  + 'ASCENDANT — a different frame making a different claim — rather than on a house from the '
  + 'dasha lord. Not missing cells and not a transcription gap: there is no house set to record.';

// ─────────────────────────────────────────────────────────────────────────────
// Refusals — the same three, at lower density
// ─────────────────────────────────────────────────────────────────────────────

export const REFUSALS_57_60 =
  'The same three refusals as chapters 52-56, at lower density: ritual remedies (4 of 66 verse '
  + 'blocks, against 10 of 82), the 2nd/7th maraka rider (14 of 66), and medical material (19 '
  + 'of 66 — "physical distress", fever, sickness). All separable clauses again, so NO cell had '
  + 'to be withheld entirely. Recorded so the omissions are visible against the page.';

// ─────────────────────────────────────────────────────────────────────────────
// Rules
// ─────────────────────────────────────────────────────────────────────────────

const SUMMARY_FAVOURABLE =
  'The sub-period works with the larger one — effort finds support rather than friction.';
const SUMMARY_ADVERSE =
  'The sub-period pulls against the larger one; progress needs more pushing than it should.';

/**
 * The same three-clause shape as Part 40: the maha lord, the antar lord, and the antar
 * planet's house **counted from the maha lord**.
 *
 * No cell here inverts, so unlike `antardasaCellRules` this needs no exception branch — which
 * is a fact about these chapters and not a simplification of them. If a later part finds an
 * inverted cell in 57-60, it belongs in the table, not in a rule about enmity.
 */
export function antardasaCellRules57(): Rule[] {
  const out: Rule[] = [];
  for (const cell of ANTARDASA_CELLS_57_60) {
    const branches: { houses: House[]; valence: number; summary: string; tag: string }[] = [];
    if (cell.favourable.length) {
      branches.push({ houses: cell.favourable, valence: 0.6, summary: SUMMARY_FAVOURABLE, tag: 'fav' });
    }
    if (cell.adverse.length) {
      branches.push({ houses: cell.adverse, valence: -0.5, summary: SUMMARY_ADVERSE, tag: 'adv' });
    }
    for (const b of branches) {
      out.push({
        id: `bphs.${cell.chapter}.${cell.verses[0]!.split('-')[0]!.padStart(3, '0')}`
          + `.${cell.maha}-${cell.antar}-${b.tag}`,
        source: { text: 'bphs', chapter: cell.chapter, verse: cell.verses.join(', ') },
        when: [
          { k: 'dasha', level: 'maha', lord: cell.maha },
          { k: 'dasha', level: 'antar', lord: cell.antar },
          { k: 'compound', op: 'or', of: b.houses.map((h): Predicate => ({
            k: 'placement', graha: cell.antar, house: h, from: cell.maha,
          })) },
        ] as Predicate[],
        effect: {
          id: `dasha.antar.${cell.maha}-${cell.antar}`,
          domain: 'self',
          valence: b.valence,
          summary: b.summary,
        },
        weight: Math.min(1, Math.abs(b.valence) + 0.2),
        verification: 'unverified',
        note: 'Medical claims, ritual remedies and the 2nd/7th maraka rider are not carried '
          + 'from these verses.',
      });
    }
  }
  return out;
}

export const CH57_60_YIELD = {
  chapters: [57, 58, 59, 60],
  note: 'Mechanically Part 40 again — same frame, same shape, same refusals, method reused '
    + 'unchanged. Two results make it worth reading. (1) THE ENMITY HYPOTHESIS IS REFUTED: '
    + 'Part 40 proposed that Mars/Saturn inverted because the two lords are enemies and named '
    + 'these chapters as the test; 57.55-57 gives Saturn’s dasha with Mars’s antardasa a '
    + 'FAVOURABLE reading, and an enmity rule would be symmetric. 54.30-32 stays a stated '
    + 'exception rather than becoming a rule. (2) THE ATTRIBUTION HELD ON A FAR WORSE SOURCE: '
    + 'these chapters retain 5 of 36 headings against 52-56’s 27 of 45, and all three of Part '
    + '40’s checks still pass across 62 blocks — so the repair rests on 51.2’s ordering rule, '
    + 'not on having enough headings to interpolate between. 12 of 36 pairs state a house '
    + 'condition; all nine adverse branches are exactly the dusthanas, with no departures and '
    + 'no inversions.',
} as const;
