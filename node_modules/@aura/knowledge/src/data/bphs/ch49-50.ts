// BPHS Programme Part 38 — Chapters 49 (Kalachakra effects) and 50 (Chara effects).
//
// Two chapters of dasha effects that could hardly be less alike.
//
// Chapter 49 is a 144-cell table of sign-in-navamsa readings, and most of it is medical or
// hazard: pollution of blood, attacks of fever, danger from fire, diseases of the eyes,
// danger from water. It goes the way chapter 33's medical block went.
//
// Chapter 50 is the opposite — a compact, wholly structural reading engine for rasi dashas.
// Nine clauses, every one of them about what occupies a house **counted from the dasha rasi**,
// and not a medical claim among them. It also contains the first WITHIN-PERIOD split in the
// corpus: a dasha whose first half reads differently from its second.

import type { SignIndex } from '../../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 50 — the Chara reading engine
// ─────────────────────────────────────────────────────────────────────────────

/** What a house-set holds, relative to the dasha rasi. */
export type Occupancy = 'benefic' | 'malefic' | 'both' | 'empty';

export interface CharaVerdict {
  /** Positive helps, negative hinders. */
  valence: number;
  summary: string;
  /** Set where the chapter splits the period rather than giving one verdict. */
  split?: { first: string; latter: string };
}

/**
 * BPHS 50.4-10, as a reading over houses counted **from the dasha rasi** — not from the
 * ascendant. That frame is the chapter's own and is what makes these portable across every
 * rasi dasha it covers.
 *
 * The clauses, in the chapter's order:
 *   - malefics in the **8th, 5th or 9th** from the dasha rasi → distressful
 *   - malefics in the **3rd or 6th** → victory over enemies and happiness
 *   - benefics in the **3rd or 6th** → defeat
 *   - benefics **or** malefics in the **11th** → conquests and happiness
 *   - the dasha rasi itself occupied or owned by a benefic → beneficial
 *
 * Two of these are worth pausing on. **Malefics in the 3rd and 6th are GOOD and benefics
 * there are BAD** — the upachaya inversion, stated plainly and easy to get backwards. And the
 * 11th is favourable **whichever** kind of planet sits there, which is the only clause in the
 * set that does not care about benefic status at all.
 */
export function charaHouseVerdict(house: number, occupancy: Occupancy): CharaVerdict | null {
  if ([5, 8, 9].includes(house)) {
    if (occupancy === 'malefic' || occupancy === 'both') {
      return { valence: -0.6, summary: 'A period that asks more than it gives; support is thin where it is needed.' };
    }
    return null;
  }
  if ([3, 6].includes(house)) {
    // The inversion: malefics help here and benefics do not.
    if (occupancy === 'malefic') {
      return { valence: 0.6, summary: 'Opposition gives way — a period for prevailing over what has been resisting you.' };
    }
    if (occupancy === 'benefic') {
      return { valence: -0.5, summary: 'Contests go the other way; softness here does not serve.' };
    }
    return null;
  }
  if (house === 11) {
    // The one clause indifferent to benefic status.
    if (occupancy !== 'empty') {
      return { valence: 0.6, summary: 'Gains and ground taken — the period delivers on what was attempted.' };
    }
    return null;
  }
  return null;
}

/**
 * BPHS 50.4-10's four ownership/occupancy combinations for the dasha rasi itself.
 *
 * The middle two are the interesting ones: a rasi **owned by a benefic but occupied by a
 * malefic** gives favourable results in the FIRST part of the dasha and adverse ones in the
 * LATTER — and the chapter says the malefic-owned/benefic-occupied case behaves "the same".
 */
export function charaRasiVerdict(owner: 'benefic' | 'malefic', occupant: Occupancy): CharaVerdict {
  if (owner === 'benefic' && (occupant === 'benefic' || occupant === 'empty')) {
    return { valence: 0.8, summary: 'A period working with you throughout — owner and occupant agree.' };
  }
  if (owner === 'malefic' && occupant === 'malefic') {
    return { valence: -0.7, summary: 'A period working against you throughout — owner and occupant agree the other way.' };
  }
  // The split cases.
  return {
    valence: 0,
    summary: 'A period of two halves — owner and occupant pull in different directions.',
    split: {
      first: 'The earlier part runs favourably.',
      latter: 'The later part turns and asks more of you.',
    },
  };
}

/**
 * **The first within-period split in the corpus.**
 *
 * Every effect encoded before this one attaches to a whole period: a dasha is favourable or
 * it is not. BPHS 50.4-10 says a rasi dasha owned by a benefic and occupied by a malefic is
 * "favourable in the first part and adverse in the latter part" — one period carrying two
 * verdicts in sequence.
 *
 * The engine has no representation for that. `DashaPeriod` has a start and an end and one
 * set of findings; `arbitrate` returns a ranking for a moment, not a trajectory. Surfacing
 * this properly needs a finding that can say *when within* a period it applies.
 *
 * Recorded rather than bodged: halving the period would be inventing a boundary the text does
 * not give, and attaching both verdicts to the whole period would say the opposite of what
 * the chapter says.
 */
export const WITHIN_PERIOD_SPLIT_IS_NEW =
  'BPHS 50.4-10 gives a dasha whose FIRST part is favourable and LATTER part adverse — one '
  + 'period carrying two verdicts in sequence. Every effect encoded before this attaches to a '
  + 'whole period, and the engine has no representation for a trajectory: `DashaPeriod` has '
  + 'one set of findings and `arbitrate` ranks a moment. NOT bodged — halving the period would '
  + 'invent a boundary the text does not give, and attaching both verdicts to the whole period '
  + 'would say the opposite of what the chapter says. Recorded for a part that can extend the '
  + 'finding shape.';

export const CHARA_UPACHAYA_INVERSION =
  'BPHS 50.4-10: malefics in the 3rd or 6th from the dasha rasi give VICTORY, and benefics '
  + 'there give DEFEAT. The upachaya inversion, stated plainly and very easy to encode '
  + 'backwards. The 11th is the odd one out — favourable whichever kind of planet occupies '
  + 'it, the only clause in the set indifferent to benefic status.';

export const CHARA_COUNTS_FROM_THE_DASHA_RASI =
  'Every clause in BPHS 50.4-10 counts from the DASHA RASI, not from the ascendant. That '
  + 'frame is the chapter’s own and is what makes the reading portable across every rasi dasha '
  + 'it covers — Chara, Sthira, Trikona and the rest all reuse it unchanged.';

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 49 — Kalachakra effects
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chapter 49 gives an effect for each sign-in-navamsa Kalachakra dasha — a 144-cell table.
 *
 * Sampling the Taurus block (49.8-10) shows the distribution: of nine navamsas, two are
 * plainly usable (profits in business, success in all ventures), one is recognition, and the
 * rest are hazard or medical — danger from fire, danger from enemies, diseases of the eyes,
 * obstacles in livelihood, distress to wife. The Gemini and Cancer blocks read the same way,
 * with attacks of fever, danger from water and displeasure of the sovereign.
 *
 * **The table is not encoded.** Roughly two cells in nine survive the medical and hazard
 * filters, which would leave a 144-row structure about three-quarters empty, carrying almost
 * no signal and a great deal of implied precision. The chapter also tells the reader to
 * extrapolate — "Similar interpretation should be made of further verses on this subject" —
 * so much of the table is a pattern to continue rather than a stated reading.
 *
 * Chapter 50's structural engine covers the same ground far better: nine clauses that apply
 * to every rasi dasha, none of them medical.
 */
export const CH49_TABLE_NOT_ENCODED =
  'Chapter 49’s 144 sign-in-navamsa Kalachakra readings are NOT encoded. Sampling three '
  + 'blocks, roughly two cells in nine survive the medical and hazard filters — pollution of '
  + 'blood, attacks of fever, danger from fire, diseases of the eyes, danger from water — so '
  + 'the table would arrive three-quarters empty while implying a precision it no longer had. '
  + 'The chapter also asks the reader to extrapolate ("similar interpretation should be made '
  + 'of further verses"), so much of it is a pattern to continue rather than a stated reading. '
  + 'Chapter 50’s nine structural clauses cover the same question better and carry no medical '
  + 'claims at all. Recorded as a deliberate omission, not an oversight.';

export const CH49_50_YIELD = {
  chapters: [49, 50],
  note: 'Two dasha-effect chapters that could hardly differ more. Ch 49’s 144-cell table is '
    + 'refused almost entirely on medical and hazard grounds — about two cells in nine would '
    + 'survive, and a three-quarters-empty table implies a precision it does not have. Ch 50 '
    + 'is the opposite: nine wholly structural clauses read from the DASHA RASI, portable '
    + 'across every rasi dasha, with no medical content. It also produced the corpus’s first '
    + 'WITHIN-PERIOD split, which the engine cannot yet represent and which was recorded '
    + 'rather than bodged.',
} as const;
