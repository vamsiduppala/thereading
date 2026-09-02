// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 25 — Effects of the Non-Luminous Planets. Programme Part 27.
//   Lines 8723-9280, verses 1-73. Six upagrahas × twelve houses = 72 cells.
//
// Part 1 computed the upagrahas and never interpreted them; this is the interpretation.
// The plan called them "largely absent from consumer software — a real differentiator",
// which is true, and there is a reason for it that the plan did not anticipate.
//
// **This is the most heavily constrained chapter in the entire corpus.** Not because of
// medicine (ch 17) or longevity (ch 19), but because roughly half its cells are character
// assassination, physical disparagement, or slurs. A representative sample of what it says
// about a person: "morally fallen", "devoid of a limb", "unsightly", "shameless",
// "spiteful to Brahmins", "will go to others' females", and in verse 66 a slur about
// someone's sex. None of that is a claim about a chart.
//
// So the table below carries **all 72 cells** with an explicit `surfaced` flag rather than
// listing only the survivors. Dropping a cell silently would lose the fact that it was
// read and judged — and at this exclusion rate, a reader would reasonably assume the
// chapter had been half-extracted rather than half-refused.
// ─────────────────────────────────────────────────────────────────────────────

import type { House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';

/** The six non-luminous points chapter 25 reckons, in the order it takes them. */
export const UPAGRAHAS = ['dhuma', 'vyatipata', 'paridhi', 'chapa', 'dhwaja', 'gulika'] as const;
export type Upagraha = (typeof UPAGRAHAS)[number];

export const UPAGRAHA_ALIASES: Record<Upagraha, string[]> = {
  dhuma: ['Dhuma'],
  vyatipata: ['Vyatipata', 'Pata'],
  paridhi: ['Paridhi', 'Parivesha'],
  chapa: ['Chapa', 'Indra Dhanus', 'Kodanda'],
  dhwaja: ['Dhwaja', 'Sikhi', 'Upaketu'],
  gulika: ['Gulika'],
};

export interface UpagrahaPlacement {
  upagraha: Upagraha;
  house: House;
  verse: string;
  /** False when nothing in the verse survives the standing constraints. */
  surfaced: boolean;
  /** Present only when `surfaced`. Our own words. */
  summary?: string;
  valence?: number;
  /** Why the cell was withheld, or what was cut from a cell that survived. */
  withheld?: string;
}

/**
 * All 72 cells. `surfaced: false` means the verse said nothing we will repeat — the cell
 * is kept so the audit trail is complete, not because it is pending.
 */
export const UPAGRAHA_PLACEMENTS: UpagrahaPlacement[] = [
  // ── Dhuma (verses 2-13) ────────────────────────────────────────────────────
  { upagraha: 'dhuma', house: 1, verse: '2', surfaced: true, valence: 0.5, summary: 'Carries a real force of personality; bold rather than cautious.' },
  { upagraha: 'dhuma', house: 2, verse: '3', surfaced: false, withheld: 'sickliness, "devoid of a limb", dull-wittedness and public humiliation — disability and character claims throughout' },
  { upagraha: 'dhuma', house: 3, verse: '4', surfaced: true, valence: 0.6, summary: 'Quick-witted and persuasive; capable of rallying people and means.' },
  { upagraha: 'dhuma', house: 4, verse: '5', surfaced: true, valence: 0.2, summary: 'Deeply learned, at some cost to domestic ease.', withheld: 'grief over being left by a partner' },
  { upagraha: 'dhuma', house: 5, verse: '6', surfaced: false, withheld: 'limited progeny, poverty, indiscriminate eating and friendlessness' },
  { upagraha: 'dhuma', house: 6, verse: '7', surfaced: true, valence: 0.7, summary: 'Strong in the face of opposition; outlasts what is set against one.', withheld: 'freedom from disease — a medical claim' },
  { upagraha: 'dhuma', house: 7, verse: '8', surfaced: false, withheld: 'pennilessness and repeated claims about the native pursuing other people’s partners' },
  { upagraha: 'dhuma', house: 8, verse: '9', surfaced: true, valence: -0.2, summary: 'Truthful to the point of abrasiveness; drive outlasts nerve.', withheld: '"hard hearted" and "selfish" as verdicts' },
  { upagraha: 'dhuma', house: 9, verse: '10', surfaced: true, valence: 0.7, summary: 'Fortunate, generous and well disposed toward others.' },
  { upagraha: 'dhuma', house: 10, verse: '11', surfaced: true, valence: 0.7, summary: 'Content in the work; clear-headed and straightforward about it.' },
  { upagraha: 'dhuma', house: 11, verse: '12', surfaced: true, valence: 0.7, summary: 'Gains steadily; knowledgeable about the arts and modest with it.' },
  { upagraha: 'dhuma', house: 12, verse: '13', surfaced: false, withheld: 'moral fallenness, sinfulness, pursuit of others’ partners and addiction' },

  // ── Vyatipata (verses 14-25) ───────────────────────────────────────────────
  { upagraha: 'vyatipata', house: 1, verse: '14', surfaced: true, valence: -0.2, summary: 'Restless and hard to settle; the temperament runs ahead of the judgement.' },
  { upagraha: 'vyatipata', house: 2, verse: '15', surfaced: false, withheld: 'moral crookedness, unkindness and wickedness — a verse of pure character verdict' },
  { upagraha: 'vyatipata', house: 3, verse: '16', surfaced: true, valence: 0.6, summary: 'Firm and generous; holds a position under pressure and is respected for it.' },
  { upagraha: 'vyatipata', house: 4, verse: '17', surfaced: true, valence: 0.1, summary: 'Well supported by relatives; fortune arrives more slowly than family does.' },
  { upagraha: 'vyatipata', house: 5, verse: '18', surfaced: false, withheld: 'poverty and humoral imbalance — a medical claim' },
  { upagraha: 'vyatipata', house: 6, verse: '19', surfaced: true, valence: 0.7, summary: 'Formidable against opposition; physically capable and hard to intimidate.' },
  { upagraha: 'vyatipata', house: 7, verse: '20', surfaced: false, withheld: 'deprivation of wealth, wife and sons, subjection to women, and misery' },
  { upagraha: 'vyatipata', house: 8, verse: '21', surfaced: false, withheld: 'deformity of the eyes, ugliness, and spite toward Brahmins — disability and a caste slur' },
  { upagraha: 'vyatipata', house: 9, verse: '22', surfaced: true, valence: 0.7, summary: 'Many undertakings and many friends; learned, and good to their partner.' },
  { upagraha: 'vyatipata', house: 10, verse: '23', surfaced: true, valence: 0.7, summary: 'Prosperous, even-tempered and far-sighted about the work.' },
  { upagraha: 'vyatipata', house: 11, verse: '24', surfaced: false, withheld: 'the verse is missing from this edition — 23 runs straight into 25' },
  { upagraha: 'vyatipata', house: 12, verse: '25', surfaced: false, withheld: 'anger, disability, irreligion and hatred' },

  // ── Paridhi / Parivesha (verses 26-37) ─────────────────────────────────────
  { upagraha: 'paridhi', house: 1, verse: '26', surfaced: true, valence: 0.6, summary: 'Learned and well regarded; carries authority lightly.' },
  { upagraha: 'paridhi', house: 2, verse: '27', surfaced: true, valence: 0.7, summary: 'Comfortable, charming and settled; provision is not a worry.' },
  { upagraha: 'paridhi', house: 3, verse: '28', surfaced: true, valence: 0.5, summary: 'Devoted to their partner and to their own people; serves willingly.' },
  { upagraha: 'paridhi', house: 4, verse: '29', surfaced: true, valence: 0.6, summary: 'Generous even to opponents; capable and hard to provoke.' },
  { upagraha: 'paridhi', house: 5, verse: '30', surfaced: true, valence: 0.7, summary: 'Affluent and affectionate; principled without being severe.' },
  { upagraha: 'paridhi', house: 6, verse: '31', surfaced: true, valence: 0.7, summary: 'Known and well off; helpful to others and undefeated by opposition.' },
  { upagraha: 'paridhi', house: 7, verse: '32', surfaced: true, valence: -0.4, summary: 'Contentment is intermittent; means and closeness both middling.', withheld: 'a count of children' },
  { upagraha: 'paridhi', house: 8, verse: '33', surfaced: true, valence: 0.5, summary: 'Spiritually inclined, peaceable and decisive — an unusual combination.' },
  { upagraha: 'paridhi', house: 9, verse: '34', surfaced: true, valence: 0.7, summary: 'Bright and very well provided for; free of excess.' },
  { upagraha: 'paridhi', house: 10, verse: '35', surfaced: true, valence: 0.7, summary: 'Versed in the arts, robust, and learned in the work.' },
  { upagraha: 'paridhi', house: 11, verse: '36', surfaced: true, valence: 0.6, summary: 'Principled, intelligent and dear to their own people.', withheld: '"pleasures through women"' },
  { upagraha: 'paridhi', house: 12, verse: '37', surfaced: false, withheld: 'spendthriftness, misery and dishonouring elders' },

  // ── Chapa (verses 38-49) ───────────────────────────────────────────────────
  { upagraha: 'chapa', house: 1, verse: '38', surfaced: true, valence: 0.5, summary: 'Direct and self-possessed; aims at things and reaches them.' },
  { upagraha: 'chapa', house: 2, verse: '39', surfaced: true, valence: 0.7, summary: 'Speaks well and is well off; modest and learned with it.' },
  { upagraha: 'chapa', house: 3, verse: '40', surfaced: false, withheld: 'miserliness and thieving' },
  { upagraha: 'chapa', house: 4, verse: '41', surfaced: true, valence: 0.6, summary: 'Comfortable and well provided for; honoured in one’s own place.' },
  { upagraha: 'chapa', house: 5, verse: '42', surfaced: true, valence: 0.7, summary: 'Far-sighted and agreeable; prosperity arrives and is not squandered.' },
  { upagraha: 'chapa', house: 6, verse: '43', surfaced: true, valence: 0.7, summary: 'Overcomes opposition without becoming hardened by it.' },
  { upagraha: 'chapa', house: 7, verse: '44', surfaced: true, valence: 0.7, summary: 'Well off, learned and agreeable; partnership is uncomplicated.' },
  { upagraha: 'chapa', house: 8, verse: '45', surfaced: false, withheld: 'cruelty and pursuit of others’ partners' },
  { upagraha: 'chapa', house: 9, verse: '46', surfaced: true, valence: 0.7, summary: 'Disciplined and highly learned; takes practice seriously.' },
  { upagraha: 'chapa', house: 10, verse: '47', surfaced: true, valence: 0.6, summary: 'Materially successful in the work; accumulates rather than spends.' },
  { upagraha: 'chapa', house: 11, verse: '48', surfaced: true, valence: 0.6, summary: 'Gains readily; fiery in disposition and warm to those close by.', withheld: 'freedom from disease' },
  { upagraha: 'chapa', house: 12, verse: '49', surfaced: false, withheld: 'wickedness, shamelessness and pursuit of others’ partners' },

  // ── Dhwaja / Upaketu (verses 50-61) ────────────────────────────────────────
  { upagraha: 'dhwaja', house: 1, verse: '50', surfaced: true, valence: 0.5, summary: 'Distinctive and noticed; carries a recognisable signature.' },
  { upagraha: 'dhwaja', house: 2, verse: '51', surfaced: true, valence: 0.7, summary: 'Articulate and scholarly; writes as well as speaks.' },
  { upagraha: 'dhwaja', house: 3, verse: '52', surfaced: false, withheld: 'miserliness, cruelty, thinness, poverty and severe disease' },
  { upagraha: 'dhwaja', house: 4, verse: '53', surfaced: true, valence: 0.7, summary: 'Gentle and principled; contented at home and interested in learning.' },
  { upagraha: 'dhwaja', house: 5, verse: '54', surfaced: true, valence: 0.7, summary: 'Resourceful and versed in the arts; good at finding a way through.' },
  { upagraha: 'dhwaja', house: 6, verse: '55', surfaced: true, valence: 0.4, summary: 'Prevails over opposition, though maternal relations take work.' },
  { upagraha: 'dhwaja', house: 7, verse: '56', surfaced: false, withheld: 'gambling and sensuousness as character verdicts' },
  { upagraha: 'dhwaja', house: 8, verse: '57', surfaced: false, withheld: 'base acts, sinfulness, shamelessness and blaming others' },
  { upagraha: 'dhwaja', house: 9, verse: '58', surfaced: true, valence: 0.6, summary: 'Openly committed to a practice; helpful and capable within it.' },
  { upagraha: 'dhwaja', house: 10, verse: '59', surfaced: true, valence: 0.6, summary: 'Fortunate and content in the work.', withheld: '"fond of females"' },
  { upagraha: 'dhwaja', house: 11, verse: '60', surfaced: true, valence: 0.8, summary: 'Gains consistently; principled, honoured and fortunate.' },
  { upagraha: 'dhwaja', house: 12, verse: '61', surfaced: false, withheld: 'sinfulness, untrustworthiness and unkindness' },

  // ── Gulika (verses 62-73) ──────────────────────────────────────────────────
  { upagraha: 'gulika', house: 1, verse: '62', surfaced: false, withheld: 'affliction by disease — the verse is a medical claim' },
  { upagraha: 'gulika', house: 2, verse: '63', surfaced: false, withheld: 'unsightliness, meanness, vices and shamelessness' },
  { upagraha: 'gulika', house: 3, verse: '64', surfaced: true, valence: 0.5, summary: 'Leads locally and keeps good company; well thought of nearby.' },
  { upagraha: 'gulika', house: 4, verse: '65', surfaced: false, withheld: 'sickliness, sinfulness and humoral affliction' },
  { upagraha: 'gulika', house: 5, verse: '66', surfaced: false, withheld: 'poverty, a short life, spite, meanness — and a slur about the native’s sex. The single worst verse in the corpus so far' },
  { upagraha: 'gulika', house: 6, verse: '67', surfaced: true, valence: 0.7, summary: 'Free of opposition; robust, and on good terms with their partner.' },
  { upagraha: 'gulika', house: 7, verse: '68', surfaced: false, withheld: 'sinfulness, pursuit of others’ partners and emaciation' },
  { upagraha: 'gulika', house: 8, verse: '69', surfaced: false, withheld: 'hunger, misery, cruelty and a short temper' },
  { upagraha: 'gulika', house: 9, verse: '70', surfaced: false, withheld: 'ordeals, emaciation, evil acts and unkindness' },
  { upagraha: 'gulika', house: 10, verse: '71', surfaced: true, valence: 0.6, summary: 'Content in the work and in what it provides; devotional by inclination.' },
  { upagraha: 'gulika', house: 11, verse: '72', surfaced: true, valence: 0.6, summary: 'Gains steadily and holds what is gained.' },
  { upagraha: 'gulika', house: 12, verse: '73', surfaced: false, withheld: 'the verse is a list of vices' },
];

/**
 * Rules for the cells that survived.
 *
 * The twelve placements of one upagraha share an `effect.id` for the same reason the bhava
 * lords do (Part 25): an upagraha sits in exactly one house, so they are mutually
 * exclusive and only ever one fires.
 *
 * Note these rules need `facts.planets[upagraha]` — the upagrahas are computed by Part 1's
 * `sunUpagrahas` and `GULIKA_LONGITUDE_RULE` but are not in `Graha`, so a caller must place
 * them on the facts explicitly. That is recorded in `CH25_NOT_YET_WIRED`.
 */
export function upagrahaRules(): Rule[] {
  return UPAGRAHA_PLACEMENTS.filter((p) => p.surfaced).map((p) => ({
    id: `bphs.25.${p.verse.padStart(3, '0')}.${p.upagraha}-in-${p.house}`,
    source: { text: 'bphs' as const, chapter: 25, verse: p.verse },
    when: [{ k: 'placement' as const, graha: p.upagraha as never, house: p.house }],
    effect: {
      id: `upagraha.${p.upagraha}`,
      domain: 'self' as const,
      valence: p.valence!,
      summary: p.summary!,
    },
    weight: Math.min(1, Math.abs(p.valence!) + 0.2),
    verification: 'unverified' as const,
    ...(p.withheld ? { note: `Not carried from this verse: ${p.withheld}.` } : {}),
  }));
}

/** Every upagraha-in-house cell is present exactly once. */
export function upagrahaTableIsComplete(): boolean {
  for (const u of UPAGRAHAS) {
    for (let h = 1; h <= 12; h++) {
      if (!UPAGRAHA_PLACEMENTS.some((p) => p.upagraha === u && p.house === h)) return false;
    }
  }
  return UPAGRAHA_PLACEMENTS.length === 72;
}

// ── Yield and policy ─────────────────────────────────────────────────────────

export const CH25_YIELD = {
  verses: 72,
  surfaced: UPAGRAHA_PLACEMENTS.filter((p) => p.surfaced).length,
  withheldEntirely: UPAGRAHA_PLACEMENTS.filter((p) => !p.surfaced).length,
  note: 'The most heavily constrained chapter in the corpus — not for medicine (ch 17) or '
    + 'longevity (ch 19) but because roughly a third of its cells are character '
    + 'assassination, physical disparagement or slurs. All 72 cells are kept with a '
    + '`surfaced` flag rather than listing only survivors, so a withheld cell reads as '
    + 'refused rather than as pending.',
} as const;

/**
 * Why this chapter is worse than the ones before it.
 *
 * Chapters 17 and 19 were constrained because their SUBJECT was disease and lifespan.
 * Chapter 25's subject is perfectly legitimate — six computed points and where they fall —
 * and the constraint comes entirely from how the verses characterise the person. That is a
 * different failure mode, and it is worth naming: the astrology here is usable, the
 * anthropology is not.
 */
export const CH25_EXCLUSION_THEMES = [
  'Physical disparagement — "devoid of a limb", "unsightly", "emaciated", "thin-bodied", '
  + '"deformity of the eyes", "ugly". Disability and appearance claims about a person.',
  'Moral verdicts — "morally fallen", "sinful", "wicked", "shameless", "untrustworthy", '
  + '"base acts". The chapter reaches for these more than any other.',
  'Sexual conduct — repeated claims that the native pursues other people’s partners.',
  'A caste slur — "spiteful to Brahmins" (25.21).',
  'A slur about the native’s sex (25.66) — the single worst line encountered in the corpus '
  + 'so far, and the clearest case of a verse that has nothing to do with a chart.',
] as const;

/**
 * The exclusion rate is not spread evenly, and the pattern is telling.
 *
 *   paridhi    11 of 12 surfaced
 *   chapa       9
 *   dhuma       8
 *   dhwaja      8
 *   vyatipata   6
 *   gulika      4 of 12
 *
 * Paridhi and Chapa are the benefic-natured points and their verses are largely
 * descriptive; Gulika is the most malefic and two thirds of its verses are abuse rather
 * than astrology. **The chapter's tone tracks the point's nature**, which means the
 * exclusions are not random damage — they concentrate exactly where the text is most
 * inclined to condemn the person rather than describe the placement.
 */
export const UPAGRAHA_YIELD_TRACKS_NATURE =
  'Surfaced cells per upagraha: paridhi 11, chapa 9, dhuma 8, dhwaja 8, vyatipata 6, '
  + 'gulika 4 (of 12 each). The benefic-natured points get descriptive verses; Gulika, the '
  + 'most malefic, gets abuse in two thirds of its. The exclusions concentrate where the '
  + 'text condemns the person rather than describing the placement.';

export const CH25_ASTROLOGY_NOT_ANTHROPOLOGY =
  'Ch 17 and 19 were constrained by their SUBJECT (disease, lifespan). Ch 25’s subject is '
  + 'legitimate — six computed points and where they fall — and the constraint is entirely '
  + 'in how the verses characterise the person. The astrology is usable; the anthropology '
  + 'is not. Worth distinguishing, because it means the upagrahas are worth keeping even '
  + 'though a third of the chapter is not.';

/**
 * WIRED in Part 28. Kept as a record of why it took two parts.
 *
 * Chapter 25's rules read an upagraha's placement, but the upagrahas are not members of
 * `Graha`: Part 1 computed them without a home on `ChartFacts`, and `syntheticCharts` did
 * not generate them. Registering them in Part 27 would have made 46 finished rules measure
 * zero and trip the calibration guard — a **wiring gap, not dead rules**, which is exactly
 * the distinction the guard exists to draw.
 *
 * Part 28 gave them `ChartFacts.upagrahas` (a separate field rather than widening `Graha`,
 * which would have silently changed every table and loop that iterates "the planets"),
 * taught the generator to place them, and registered the rules.
 *
 * This is the **fifth** fact the generator has been missing in turn — after `lagnas`,
 * `bav`, `dignity` and `shadbala`. Each time, good rules looked dead.
 */
export const CH25_WIRING =
  'Ch 25’s rules were written in Part 27 and registered in Part 28. They read an upagraha’s '
  + 'placement, and the upagrahas had no home on ChartFacts and no presence in the '
  + 'synthetic population — so registering early would have made 46 finished rules measure '
  + 'zero. `ChartFacts.upagrahas` is a separate field rather than a widened `Graha`, '
  + 'because widening Graha would change the meaning of every table and loop that iterates '
  + '"the planets". Fifth missing generator fact after lagnas, bav, dignity and shadbala.';

export const CH25_TEXTUAL_FAULT =
  'Verse 24 (Vyatipata in the 11th) is absent from this edition — verse 23 runs straight '
  + 'into 25. Recorded as a gap in the source rather than an extraction miss, the same way '
  + 'ch 27’s missing verses 30-31 were.';
