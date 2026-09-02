// BPHS Programme Part 40 — Chapters 52-56: the antardasa effects for the Sun, Moon, Mars,
// Rahu and Jupiter. Forty-five maha×antar pairs.
//
// Part 38 built the join — rules that fire on a placement AND a running period. These
// chapters are that join at full width: every cell reads a planet's position **counted from
// the dasha lord**, which is `from: <graha>` — the `PlanetFrame` Retrofit R17 added in Part 28
// so a rule could count from a significator rather than the ascendant. Both halves of the
// vocabulary were already there; this is the first chapter block that needs them together.
//
// Three things are worth reading before the data.
//
// **The source is damaged and Part 39 is what repaired it.** Eighteen of the section headings
// were lost in transcription, and because a heading persists until the next one appears, the
// blocks after a gap inherit a stale one — producing 36 apparent contradictions between the
// heading and the planet the verse itself names. BPHS 51.2, extracted last part, says the
// antardasas run the Vimshottari sequence from the dasha lord. Every surviving heading sits in
// the slot that rule predicts, in all five chapters, and every one of the 36 "contradictions"
// has the verse-named planet LATER in that sequence than the stale heading — never earlier,
// not once in 36. The verse-named planets march monotonically through the predicted order
// across all 78 attributable blocks. So the headings are stale and the verse names are
// authoritative, and all 45 pairs are recoverable. See `HEADINGS_RECOVERED_BY_CH51_ORDER`.
//
// **One condition shape governs almost everything**, and it is the shape Part 38's chapter 48
// established: position decides, not the planet's nature. Favourable is a kendra, trikona or
// the 11th from the dasha lord; adverse is the 6th, 8th or 12th. Of the 22 cells stating an
// adverse branch, 21 give exactly {6,8,12} or {8,12}.
//
// **But it is a default, not a law**, and the chapter says so itself — see
// `MARS_SATURN_BREAKS_THE_SHAPE`. Encoding it as universal would have been the tidier mistake.

import type { Graha, House } from '../../types.js';
import type { Predicate } from '../../rules/predicate.js';
import type { Rule } from '../../rules/rule.js';

// ─────────────────────────────────────────────────────────────────────────────
// The structural finding
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The frame these five chapters read in, stated once rather than forty-five times.
 *
 * Almost every cell is phrased *"if X be in a kendra / the 11th / the 8th **from the lord of
 * the Dasha**"*. That is not the ascendant, and it is not the antar planet's own house — it is
 * the maha lord as the origin of counting.
 *
 * The DSL has expressed this since Part 28: `LagnaReference` was widened to include every
 * planet (Retrofit R17), splitting into `AscendantReference` — which needs a supplied fact —
 * and `PlanetFrame`, which resolves from `facts.planets` and therefore **needs no new fact at
 * all**. So these 26 rules cost nothing in wiring, which is exactly what that retrofit was for.
 */
export const ANTARDASA_FRAME_IS_THE_DASHA_LORD =
  'Chapters 52-56 read every antardasa from the MAHA LORD, not the ascendant: "if X be in a '
  + 'kendra / the 11th / the 8th from the lord of the Dasha". That is `from: <graha>`, the '
  + 'PlanetFrame added by Retrofit R17 in Part 28 so a rule could count from a significator. '
  + 'It resolves from `facts.planets` and needs no new fact, so these rules cost nothing to '
  + 'wire — which is what that retrofit was for. Combined with Part 38’s `dasha` predicate, a '
  + 'cell is expressible in three clauses: the maha lord, the antar lord, and the antar '
  + 'planet’s house counted from the maha lord.';

/**
 * The condition shape, and its measured fit.
 *
 * Favourable: a **kendra, trikona or the 11th** from the dasha lord (some cells add the 3rd).
 * Adverse: the **6th, 8th or 12th** — and of the 22 cells that state an adverse branch, 21
 * give exactly {6, 8, 12} or {8, 12}. One cell (the Moon's dasha, Mars's antardasa) adds the
 * 5th, which is the only departure in the set.
 *
 * Across the blocks where both the condition and the outcome are unambiguous, 32 of 34 follow
 * this shape. That is a default worth encoding and not a law worth asserting.
 */
export const ANTARDASA_CONDITION_SHAPE =
  'Chapters 52-56 repeat one condition shape: FAVOURABLE is a kendra, trikona or the 11th '
  + 'from the dasha lord (a few cells add the 3rd); ADVERSE is the 6th, 8th or 12th. Of the 22 '
  + 'cells stating an adverse branch, 21 give exactly {6,8,12} or {8,12} — only the Moon/Mars '
  + 'cell adds the 5th. It is 48.1 again: POSITION decides, not the planet’s nature. Measured '
  + 'fit: 32 of the 34 blocks where condition and outcome are both unambiguous. A default, '
  + 'encoded as one, not a law.';

/**
 * ⚠️ The chapter's own counterexample to the shape above, and the reason it is encoded as a
 * per-cell table rather than as a single rule.
 *
 * BPHS 54.30-32 — Mars's dasha, Saturn's antardasa — gives loss of reputation, loss of
 * position and defeat **when Saturn is in a kendra, the 11th or the 5th from Mars**: the
 * favourable positions, with an adverse reading. Every other cell in the block would have that
 * combination give gains.
 *
 * It is not an error. Mars and Saturn are bitter natural enemies, and what governs here is the
 * **relationship between the two lords**, which 48.1's "condition outranks nature" does not
 * reach — that principle weighs one planet's dignity, not a pair's mutual hostility.
 *
 * Recorded rather than smoothed: a table that had been generated from the shape would have
 * produced the opposite reading for this cell and nothing would have caught it.
 */
export const MARS_SATURN_BREAKS_THE_SHAPE =
  'BPHS 54.30-32 is the chapter’s own counterexample: in MARS’s dasha, SATURN’s antardasa '
  + 'gives loss of reputation and of position WHEN SATURN IS WELL PLACED — a kendra, the 11th '
  + 'or the 5th from Mars. Every other cell would read that as gain. Not an error: Mars and '
  + 'Saturn are bitter natural enemies, and what governs is the RELATIONSHIP BETWEEN THE TWO '
  + 'LORDS, which 48.1 does not reach — it weighs one planet’s dignity, not a pair’s mutual '
  + 'hostility. This is why the cells are a TABLE and not a generated shape: a generated table '
  + 'would have inverted this cell and nothing would have caught it.';

/**
 * How the damaged headings were repaired, and why the repair is checkable rather than assumed.
 *
 * The transcription lost 18 of the 45 section headings. A heading persists until replaced, so
 * blocks after a gap carry a stale one, and 36 blocks disagree with the planet their own verse
 * names.
 *
 * BPHS 51.2 (Part 39) says the antardasas run the Vimshottari sequence starting from the dasha
 * lord. Three checks, all passing:
 *   1. In all five chapters the surviving headings form a **subsequence** of the predicted
 *      order — 17 headings, every one in a legal slot, no inversions.
 *   2. In all 36 disagreements the verse-named planet sits **later** in the predicted order
 *      than the stale heading. Never earlier, not once.
 *   3. Across all 78 attributable blocks the verse-named planets are **monotonic** in that
 *      order, chapter by chapter.
 *
 * A stale-heading fault predicts exactly this and nothing else does — a mis-ordered source
 * would break (1) and (3), and a mis-parse would break (2) in both directions. So the verse
 * name is authoritative and all 45 pairs are recoverable.
 */
export const HEADINGS_RECOVERED_BY_CH51_ORDER =
  'The transcription lost 18 of the 45 section headings in chapters 52-56, and since a heading '
  + 'persists until replaced, 36 blocks carry a STALE one that disagrees with the planet their '
  + 'own verse names. BPHS 51.2 — extracted in Part 39 — repairs it, checkably: (1) in all '
  + 'five chapters the 17 surviving headings form a subsequence of the order 51.2 predicts, '
  + 'with no inversions; (2) in all 36 disagreements the verse-named planet sits LATER in that '
  + 'order than the stale heading, never earlier; (3) across all 78 attributable blocks the '
  + 'verse-named planets are monotonic in it. A stale-heading fault predicts exactly that and '
  + 'nothing else does. So the VERSE NAME is authoritative and all 45 pairs are recoverable. '
  + 'Part 39’s extraction is what made Part 40’s source usable.';

// ─────────────────────────────────────────────────────────────────────────────
// The cells
// ─────────────────────────────────────────────────────────────────────────────

export interface AntardasaCell {
  maha: Graha;
  antar: Graha;
  chapter: number;
  verses: string[];
  /** Houses **from the dasha lord** the chapter calls favourable. */
  favourable: House[];
  /** Houses from the dasha lord the chapter calls adverse. */
  adverse: House[];
}

/**
 * The 26 of 45 pairs whose verses state a house-set condition **counted from the dasha lord**.
 *
 * The other 19 cells exist and are read, but their conditions are phrased on the antar
 * planet's own dignity, on lordship, or on nothing structural at all — so there is no house
 * set to record and no rule to build. They are not missing; they are not house-conditioned.
 * `CELLS_WITHOUT_A_HOUSE_CONDITION` says so.
 *
 * Generated from the source text rather than transcribed by hand, so a house number cannot
 * drift between the book and the table.
 */
export const ANTARDASA_CELLS: AntardasaCell[] = [
  { maha: 'jupiter', antar: 'ketu', chapter: 56, verses: ['33-34'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'jupiter', antar: 'mars', chapter: 56, verses: ['69-71'], favourable: [], adverse: [8, 12] },
  { maha: 'jupiter', antar: 'mercury', chapter: 56, verses: ['23-24'], favourable: [1, 4, 5, 7, 9, 10], adverse: [] },
  { maha: 'jupiter', antar: 'rahu', chapter: 56, verses: ['76-78'], favourable: [], adverse: [8, 12] },
  { maha: 'jupiter', antar: 'saturn', chapter: 56, verses: ['16-17'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'mars', antar: 'ketu', chapter: 54, verses: ['52-54'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'mars', antar: 'saturn', chapter: 54, verses: ['30-32', '33-35'], favourable: [1, 4, 5, 7, 10, 11], adverse: [8, 12] },
  { maha: 'mars', antar: 'venus', chapter: 54, verses: ['57-60', '61-62'], favourable: [2, 5, 9, 11], adverse: [6, 8, 12] },
  { maha: 'moon', antar: 'mars', chapter: 53, verses: ['9-12'], favourable: [], adverse: [5, 6, 8, 12] },
  { maha: 'moon', antar: 'mercury', chapter: 53, verses: ['44-46'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'moon', antar: 'rahu', chapter: 53, verses: ['17-18', '19-21'], favourable: [1, 3, 4, 5, 7, 9, 10, 11], adverse: [8, 12] },
  { maha: 'moon', antar: 'saturn', chapter: 53, verses: ['36-38'], favourable: [1, 4, 5, 7, 9, 10], adverse: [] },
  { maha: 'moon', antar: 'venus', chapter: 53, verses: ['61', '62'], favourable: [1, 4, 5, 7, 9, 10], adverse: [6, 8, 12] },
  { maha: 'rahu', antar: 'jupiter', chapter: 55, verses: ['18-20'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'rahu', antar: 'mars', chapter: 55, verses: ['80-82'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'rahu', antar: 'mercury', chapter: 55, verses: ['34-35'], favourable: [1, 4, 7, 10], adverse: [] },
  { maha: 'rahu', antar: 'moon', chapter: 55, verses: ['71-72'], favourable: [1, 4, 5, 7, 9, 10, 11], adverse: [] },
  { maha: 'rahu', antar: 'sun', chapter: 55, verses: ['64-65', '66'], favourable: [1, 3, 4, 5, 7, 9, 10, 11], adverse: [6, 8, 12] },
  { maha: 'rahu', antar: 'venus', chapter: 55, verses: ['56-59'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'sun', antar: 'ketu', chapter: 52, verses: ['60-61'], favourable: [], adverse: [8, 12] },
  { maha: 'sun', antar: 'mars', chapter: 52, verses: ['19-20'], favourable: [], adverse: [8, 12] },
  { maha: 'sun', antar: 'mercury', chapter: 52, verses: ['54-57'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'sun', antar: 'moon', chapter: 52, verses: ['13-14'], favourable: [], adverse: [6, 8, 12] },
  { maha: 'sun', antar: 'rahu', chapter: 52, verses: ['27-29'], favourable: [], adverse: [8, 12] },
  { maha: 'sun', antar: 'saturn', chapter: 52, verses: ['43-44'], favourable: [], adverse: [8, 12] },
  { maha: 'sun', antar: 'venus', chapter: 52, verses: ['69-73'], favourable: [], adverse: [6, 8, 12] },
];

export const CELLS_WITHOUT_A_HOUSE_CONDITION =
  '19 of the 45 pairs are read by these chapters but state no house condition counted from the '
  + 'dasha lord — their verses turn on the antar planet’s own dignity, on lordship, or on '
  + 'nothing structural. They are NOT missing cells and NOT a transcription gap: there is '
  + 'simply no house set to record, so no rule is built for them. Recorded explicitly so a '
  + 'later reader counting 26 rules against 45 pairs does not read it as an omission.';

// ─────────────────────────────────────────────────────────────────────────────
// What is refused
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ten of the 82 verse blocks prescribe a **ritual remedy** — Mrityunjaya Japa, recitation of
 * mantras, worship of a planet, charity of a specific object, Homa.
 *
 * The standing constraint is behavioural remedies only, never gemstones, fasting or rituals,
 * and it holds here without argument. Recorded so the omission is visible: a reader comparing
 * our cells against the page will find a clause in each that we do not carry, and this is it.
 */
export const RITUAL_REMEDIES_NOT_CARRIED =
  'Ten of the 82 verse blocks in chapters 52-56 prescribe a RITUAL remedy — Mrityunjaya Japa, '
  + 'mantra recitation, worship of a planet, charity of a named object, Homa. Not carried: the '
  + 'programme surfaces behavioural remedies only, never gemstones, fasting or rituals. '
  + 'Recorded so the omission is VISIBLE — a reader comparing our cells against the page will '
  + 'find a clause in each that we do not carry, and this is it.';

/**
 * Sixteen blocks attach a rider: *if the antar planet is the lord of the 2nd or the 7th, there
 * will be danger of premature death.*
 *
 * That is the maraka rule again, and it is refused on the same ground as everywhere else in
 * the programme. What is worth noting is that it appears as a **separable clause** rather than
 * as the cell's reading — so dropping it leaves the cell intact, exactly as in chapter 48's
 * 6th, 11th and 12th rows. No cell in these five chapters had to be withheld entirely.
 */
export const MARAKA_RIDER_DROPPED =
  'Sixteen blocks in chapters 52-56 attach the rider "if the antar planet be lord of the 2nd '
  + 'or the 7th there will be danger of premature death". Refused, as maraka material is '
  + 'throughout. It appears as a SEPARABLE clause rather than as the cell’s reading, so '
  + 'dropping it leaves each cell intact — the same as chapter 48’s 6th, 11th and 12th rows, '
  + 'and unlike its 8th, which had nothing left. NO cell in these five chapters had to be '
  + 'withheld entirely.';

export const MEDICAL_CLAIMS_DROPPED =
  'Chapters 52-56 carry dense medical material — rheumatism, fever, dysentery, urinary '
  + 'troubles, "body troubles (physical afflictions)". None of it is carried. As with the '
  + 'maraka rider it is separable from the structural reading, so the cells survive it.';

// ─────────────────────────────────────────────────────────────────────────────
// Rules — the join at full width
// ─────────────────────────────────────────────────────────────────────────────

const SUMMARY_FAVOURABLE =
  'The sub-period works with the larger one — effort finds support rather than friction.';
const SUMMARY_ADVERSE =
  'The sub-period pulls against the larger one; progress needs more pushing than it should.';

/**
 * One rule per stated branch: **the maha lord is running, the antar lord is running, and the
 * antar planet sits in one of the houses the verse names, counted from the maha lord.**
 *
 * Three clauses, and all three were already expressible — `dasha` at two levels (Part 1, first
 * used in Part 38) and a `PlanetFrame` (Retrofit R17). Nothing new was needed, which is the
 * point: the DSL work of Parts 28 and 38 is what makes a 45-cell block cost 26 rules and no
 * new vocabulary.
 *
 * The Mars/Saturn cell is **not** generated from the shape — see `MARS_SATURN_BREAKS_THE_SHAPE`
 * — its favourable house set carries the chapter's adverse reading, and the table records that
 * rather than the shape's prediction.
 */
export function antardasaCellRules(): Rule[] {
  const out: Rule[] = [];
  for (const cell of ANTARDASA_CELLS) {
    const branches: { houses: House[]; valence: number; summary: string; tag: string }[] = [];
    if (cell.favourable.length) {
      // 54.30-32: this pairing reads its favourable positions adversely. The table, not the
      // shape, decides — a generated rule set would have inverted exactly this cell.
      const inverted = cell.maha === 'mars' && cell.antar === 'saturn';
      branches.push({
        houses: cell.favourable,
        valence: inverted ? -0.5 : 0.6,
        summary: inverted ? SUMMARY_ADVERSE : SUMMARY_FAVOURABLE,
        tag: 'fav',
      });
    }
    if (cell.adverse.length) {
      branches.push({ houses: cell.adverse, valence: -0.5, summary: SUMMARY_ADVERSE, tag: 'adv' });
    }
    for (const b of branches) {
      const when: Predicate[] = [
        { k: 'dasha', level: 'maha', lord: cell.maha },
        { k: 'dasha', level: 'antar', lord: cell.antar },
        // The frame that defines this whole block: counted FROM THE DASHA LORD.
        { k: 'compound', op: 'or', of: b.houses.map((h): Predicate => ({
          k: 'placement', graha: cell.antar, house: h, from: cell.maha,
        })) },
      ];
      out.push({
        id: `bphs.${cell.chapter}.${cell.verses[0]!.split('-')[0]!.padStart(3, '0')}`
          + `.${cell.maha}-${cell.antar}-${b.tag}`,
        source: { text: 'bphs', chapter: cell.chapter, verse: cell.verses.join(', ') },
        when,
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

export const CH52_56_YIELD = {
  chapters: [52, 53, 54, 55, 56],
  note: 'The join at full width: 45 maha×antar pairs, read from the DASHA LORD as the origin '
    + 'of counting. Needed no new DSL — Part 28’s PlanetFrame and Part 38’s `dasha` predicate '
    + 'together express a cell in three clauses. The source was damaged (18 headings lost, 36 '
    + 'blocks carrying stale ones) and PART 39 REPAIRED IT: 51.2’s ordering rule attributes '
    + 'every block, with three independent checks passing and no counterexample in 78 blocks. '
    + 'One condition shape governs 32 of 34 unambiguous cells — and the chapter states its own '
    + 'counterexample (Mars/Saturn), which is why the cells are a table rather than a '
    + 'generated shape. Refused throughout: ritual remedies (10 blocks), the 2nd/7th maraka '
    + 'rider (16), and the dense medical material. All separable, so NO cell was withheld '
    + 'entirely.',
} as const;
