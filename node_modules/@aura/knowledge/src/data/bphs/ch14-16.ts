// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 14, 15 and 16 — the 3rd, 4th and 5th Houses. Programme Part 21.
//   Ch 14 — lines 5825-5934, verses 1-15
//   Ch 15 — lines 5934-6017, verses 1-9
//   Ch 16 — lines 6017-6211, verses 1-32
//
// Part 20 set the rhythm; this part follows it. What it adds is a finding about Phase III
// itself: **the proportion of a chapter that survives the standing constraints varies
// enormously, and chapter 16 is the first where most of it does not.**
//
// Of ch 16's thirty-two verses, the great majority are about infertility, the number and
// sex of children, the age at which a child is lost, or the legitimacy of the native's
// birth. Four rules come out of it. That is not a failure of extraction — it is what
// honest extraction looks like when a chapter is mostly claims we will not make. The
// counts are stated in `CH14_16_YIELD` so nobody later reads four rules from thirty-two
// verses as a job half done.
// ─────────────────────────────────────────────────────────────────────────────

import type { House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import { KENDRAS, TRIKONAS, lordInKendraOrTrikona, lordInDusthana } from './ch12-13.js';

/** "`graha` occupies an angle or a trine." Part 20 had the lordship form; this is placement. */
export const grahaInKendraOrTrikona = (graha: string) => ({
  k: 'compound' as const,
  op: 'or' as const,
  of: [...KENDRAS, ...TRIKONAS].map((h) => ({ k: 'placement' as const, graha: graha as never, house: h })),
});

// ── Chapter 14 — the third house ─────────────────────────────────────────────

/**
 * The third house: siblings, initiative, nerve (14.1-2, 14.5-6).
 *
 * Most of this chapter is about siblings dying — verses 3, 5, 14 and much of 7-13 — and
 * none of that is surfaced. What remains is the constructive half, plus 14.6's own
 * counterweight to the affliction verses.
 */
export function thirdHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 14, verse });
  return [
    {
      id: 'bphs.14.001.benefic-on-third',
      source: src('1'),
      when: [{ k: 'placement', graha: 'jupiter', house: 3 }],
      effect: {
        id: 'siblings.support',
        domain: 'siblings',
        valence: 0.6,
        summary: 'Siblings are a source of support, and nerve comes easily.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'BPHS 14.1 says "conjunct or aspected by a benefic". The aspect half needs a '
        + 'chart-dependent benefic list; the placement half is encoded.',
    },
    {
      id: 'bphs.14.002.lord-with-mars-on-third',
      source: src('2'),
      when: [
        { k: 'lordship', house: 3, occupies: 3 },
        { k: 'placement', graha: 'mars', house: 3 },
      ],
      effect: {
        id: 'siblings.support',
        domain: 'siblings',
        valence: 0.7,
        summary: 'Initiative and ties with brothers and sisters both hold up well.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'Mars is the natural indicator of the 3rd, so lord-and-indicator together in '
        + 'the house is the chapter’s strongest positive configuration.',
    },
    {
      id: 'bphs.14.006.mars-or-lord-angular',
      source: src('5-6'),
      when: [grahaInKendraOrTrikona('mars')],
      effect: {
        id: 'siblings.wellbeing',
        domain: 'siblings',
        valence: 0.5,
        summary: 'Sibling relationships stay steady over time.',
      },
      weight: 0.5,
      verification: 'unverified',
      baseRate: 0.50,
      note: 'BPHS 14.6 is the chapter’s own counterweight to 14.5 — the same placement that '
        + 'harms in the 8th supports in an angle or trine. Encoded as the positive half; '
        + 'the negative half is in CH14_16_UNSURFACED. MEASURED at 50% and declared: '
        + '"Mars in an angle or a trine" is six houses of twelve, so this is background '
        + 'rather than a finding. Third rule of this shape, after the two in Part 20 — '
        + '"X in a kendra or trikona" is ALWAYS a coin flip and should be expected to be.',
    },
  ];
}

/**
 * 14.15 is a meta-rule and belongs in the arbitration ordering, not in a rule set:
 * "after estimating the strength and weakness of such yogas, the effects related to
 * brothers and sisters are announced."
 *
 * That is the **fifth** time the corpus has told us to weigh before asserting, after
 * 27.37-38, 28.15-20, 72.30-31 and 74.11-13. Part 19 built the ordering; this is another
 * citation for it rather than new machinery.
 */
export const JUDGE_BY_STRENGTH_FIRST =
  'BPHS 14.15 directs that sibling effects be announced only after estimating the strength '
  + 'and weakness of the yogas involved. A fifth source-stated instruction to arbitrate '
  + 'before asserting — cite it in Part 19’s ordering rather than treating it as new.';

// ── Chapter 15 — the fourth house ────────────────────────────────────────────

/**
 * The fourth house: home, land, conveyances, mother (15.2-8).
 *
 * A clean chapter by comparison — only verse 9 has to be excluded outright, and the rest
 * is unusually high-arity, which makes it well behaved under the base-rate gate.
 */
export function fourthHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 15, verse });
  return [
    {
      id: 'bphs.15.002.lord-in-own-fourth',
      source: src('2'),
      when: [
        { k: 'lordship', house: 4, occupies: 4 },
        { k: 'placement', graha: 'jupiter', house: 4 },
      ],
      effect: {
        id: 'home.comfort',
        domain: 'home',
        valence: 0.7,
        summary: 'A settled home, held comfortably rather than struggled for.',
      },
      weight: 0.8,
      verification: 'unverified',
      note: 'BPHS 15.2 wants the 4th occupied by its own lord OR the ascendant lord, AND '
        + 'aspected by a benefic. The benefic aspect is approximated by a benefic in the '
        + 'house; the ascendant-lord alternative needs the lord resolved per chart.',
    },
    {
      id: 'bphs.15.003.lord-dignified',
      source: src('3'),
      when: [{ k: 'dignity', graha: 'moon', is: ['own', 'exalted'] }],
      effect: {
        id: 'home.assets',
        domain: 'home',
        valence: 0.6,
        summary: 'Land, vehicles and a place of one’s own come without undue difficulty.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'TEXTUAL: the verse as printed says the FIFTH lord, in a chapter about the '
        + 'fourth, and lists lands, conveyances and houses — all fourth-house matters. Read '
        + 'as the 4th lord; see the ledger entry `bphs.15.003`. Instantiated for the Moon, '
        + 'the natural indicator of the 4th, since the lord is chart-dependent.',
    },
    {
      id: 'bphs.15.004.fourth-and-tenth-lords-angular',
      source: src('4'),
      when: [lordInKendraOrTrikona(4), lordInKendraOrTrikona(10)],
      effect: {
        id: 'home.comfort',
        domain: 'home',
        valence: 0.7,
        summary: 'Standing and dwelling advance together — a home that reflects the career.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'The verse asks the two lords to JOIN in an angle or trine. Conjunction of two '
        + 'lords is not expressible yet — see CH14_16_NOT_YET_EXPRESSIBLE — so this encodes '
        + 'the weaker "both angular" form and says so.',
    },
    {
      id: 'bphs.15.007.mother-supported',
      source: src('7'),
      when: [
        lordInKendraOrTrikona(4),
        grahaInKendraOrTrikona('venus'),
        { k: 'dignity', graha: 'mercury', is: ['exalted'] },
      ],
      effect: {
        id: 'home.mother',
        domain: 'home',
        valence: 0.7,
        summary: 'The relationship with one’s mother is an easy and sustaining one.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'Three conditions, which makes it properly rare — the kind of rule the arity '
        + 'stage exists to promote. BPHS 15.6 (a long-lived mother) is the same '
        + 'configuration read as longevity and is NOT surfaced.',
    },
  ];
}

// ── Chapter 16 — the fifth house ─────────────────────────────────────────────

/**
 * The fifth house: children, learning, discernment (16.1-3, 16.12, 16.16).
 *
 * **Four rules from thirty-two verses.** See the module header and `CH14_16_YIELD`: the
 * chapter is overwhelmingly about infertility, the count and sex of children, the age at
 * which a child dies, and whether the native was legitimately born. None of that is
 * surfaced, and two verses are excluded outright as slurs on the family rather than claims
 * about a chart.
 *
 * The constructive material is real, though, and worth having: the 5th lord's dignity and
 * its relationship to Jupiter, which 16.16 states three separate ways.
 */
export function fifthHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 16, verse });
  return [
    {
      id: 'bphs.16.001.lagna-and-fifth-lords-strong',
      source: src('1-3'),
      when: [lordInKendraOrTrikona(1), lordInKendraOrTrikona(5)],
      effect: {
        id: 'children.wellbeing',
        domain: 'children',
        valence: 0.7,
        summary: 'Matters of children and of learning both run favourably.',
      },
      weight: 0.7,
      verification: 'unverified',
    },
    {
      id: 'bphs.16.008.lord-in-dusthana',
      source: src('8'),
      when: [lordInDusthana(5)],
      effect: {
        id: 'children.wellbeing',
        domain: 'children',
        valence: -0.5,
        summary: 'Matters of children ask more patience and effort than they might.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'BPHS 16.8 states this as begetting issue with difficulty. Restated as effort '
        + 'and patience: the standing policy does not make claims about fertility, and the '
        + 'underlying mechanism — a weakened 5th — is what the arbitration needs anyway.',
    },
    {
      id: 'bphs.16.012.fifth-well-aspected',
      source: src('12'),
      when: [
        lordInKendraOrTrikona(5),
        { k: 'aspect', graha: 'jupiter', ontoHouse: 5, kind: 'graha' },
      ],
      effect: {
        id: 'children.wellbeing',
        domain: 'children',
        valence: 0.8,
        summary: 'Children and teaching are among the more rewarding parts of life.',
      },
      weight: 0.8,
      verification: 'unverified',
      note: 'BPHS 16.12 wants a strong 5th lord AND Mercury, Jupiter and Venus all aspecting '
        + 'the 5th. Encoded with Jupiter alone; requiring all three would need three more '
        + 'aspect conditions and the verse treats them as a set rather than a conjunction.',
    },
    {
      id: 'bphs.16.016.lord-related-to-jupiter',
      source: src('16'),
      when: [{ k: 'aspect', graha: 'jupiter', ontoHouse: 5, kind: 'graha' }],
      effect: {
        id: 'children.indicated',
        domain: 'children',
        valence: 0.6,
        summary: 'A steadying influence over children, and over creative judgement.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 16.16 is emphatic and unusually generous: Jupiter’s connection to the 5th '
        + 'lord counts EVEN IF Jupiter owns the 6th, 8th or 12th. Worth noting because the '
        + 'general rule elsewhere is that such ownership spoils a planet — the chapter '
        + 'makes an explicit exception.',
    },
  ];
}

/**
 * 16.18-20 give an unusual thing: **ages**, read from static placements.
 *
 * Encoded because it is the same trick as chapter 70's trigger formula — a chart
 * configuration yielding a time without a dasha — and because the app has almost no way to
 * say *when*. Only the constructive verses are here. 16.21-23 give ages for the loss of a
 * child and are not surfaced at any age.
 *
 * Returns the ages the chapter names, not a prediction: the configurations are specific and
 * the caller decides whether the chart matches.
 */
export const CHILD_TIMING_INDICATIONS: { verse: string; ages: number[]; when: string }[] = [
  { verse: '18', ages: [32, 33], when: 'Jupiter in the 5th with its lord joined to Venus' },
  { verse: '19', ages: [30, 36], when: 'the 5th lord in an angle together with Jupiter' },
  { verse: '20', ages: [40], when: 'Jupiter in the 9th, Venus in the 9th from Jupiter with the lagna lord' },
];

export const CHILD_TIMING_NOTE =
  'BPHS 16.18-20 name ages (32/33, 30/36, 40) at which children are indicated, read from '
  + 'static placements — the same mechanism as ch 70’s trigger formula, a configuration '
  + 'yielding a TIME. Only the constructive verses are carried; 16.21-23 give ages for the '
  + 'loss of a child and are not surfaced.';

// ── Policy — and how much of each chapter survived ───────────────────────────

/**
 * What proportion of each chapter became a rule.
 *
 * Recorded because "four rules from thirty-two verses" looks like an incomplete extraction
 * and is not one. A later part re-reading ch 16 should know the material was seen and
 * deliberately left, not missed.
 */
export const CH14_16_YIELD = {
  ch14: { verses: 15, rules: 3, note: 'Verses 3, 5, 7-13 and 14 are sibling mortality or sibling counts.' },
  ch15: { verses: 9, rules: 4, note: 'The cleanest of the three; only verse 9 is excluded outright.' },
  ch16: {
    verses: 32,
    rules: 4,
    note: 'The most heavily constrained chapter so far. The bulk is infertility, the count '
      + 'and sex of children, ages of child death, and the legitimacy of the native’s '
      + 'birth. Four rules is the honest yield, not a partial pass.',
  },
} as const;

/** Excluded outright — not restated, not computed. */
export const CH14_16_EXCLUDED = [
  '15.9 — dumbness attributed to the 4th lord with Mars in the 6th or 8th. A disability '
  + 'claim about a person; excluded on the same ground as the physiognomy chapters.',
  '16.14 — a child "of questionable birth". A slur on the family dressed as a chart rule.',
  '16.15 — the native "born of other’s loins". The same, about the native.',
  '16.17 — children who will "indulge in mean deeds". A character judgement about a third '
  + 'party who has no say in it.',
  '16.4 — loss of a first child followed by infertility. Excluded rather than merely '
  + 'unsurfaced: there is no arbitration use for it.',
] as const;

/** Computed where arbitration wants the mechanism, never shown. */
export const CH14_16_UNSURFACED = [
  '14.3, 14.5, 14.14 — the death of siblings, elder or younger, from the Sun, Saturn or '
  + 'Mars in the 3rd. The placements matter to the 3rd house’s strength; the outcome is not '
  + 'surfaced.',
  '14.4 — the sex of siblings from the gender of the planets involved. A claim about third '
  + 'parties, with no use to the native.',
  '14.7-13 — counts of brothers and sisters from multi-planet configurations.',
  '15.6 — the mother’s longevity. Longevity of another person; Part 51 material.',
  '16.5-7, 16.9, 16.11 — the number of children, and adoption.',
  '16.13 — the sex of children.',
  '16.21-23 — the ages at which a child is lost. Never surfaced at any age.',
  '16.24-32 — counts of children from specific configurations.',
] as const;

export const CH14_16_NOT_YET_EXPRESSIBLE = [
  'Two LORDS conjunct each other (15.4 wants the 4th and 10th lords to join). The DSL has '
  + '`conjunct` over grahas and `lordship` over houses, but nothing that says "the lord of '
  + 'A is with the lord of B". A `lordshipConjunct` kind would cover a lot of Phase III.',
  '"Occupied by three or four malefics" (16.17, 15.8) — needs a counting predicate over a '
  + 'house, which the whole-chart shape predicates of Part 30 will also want.',
  '"In own navamsa" (15.3) — the varga machinery exists from Parts 3-5 but is not bound '
  + 'into a predicate.',
  'Aspect by a SET of planets treated as a group (16.12 wants Mercury, Jupiter and Venus). '
  + 'Encodable as three conditions, but that misrepresents the verse’s "and" as strict.',
] as const;

export const PHASE_III_YIELD_VARIES =
  'Chapters differ enormously in how much survives the standing constraints: ch 15 gave 4 '
  + 'rules from 9 verses, ch 16 gave 4 from 32. Record the yield per chapter so a later '
  + 'part can tell a deliberate omission from a missed one.';
