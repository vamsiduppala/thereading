// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 19, 20 and 21 — the 8th, 9th and 10th Houses. Programme Part 23.
//   Ch 19 — lines 6686-6793, verses 1-13+
//   Ch 20 — lines 6793-6939, verses 1-32
//   Ch 21 — lines 6939-7085, verses 1-22
//
// **Chapter 19 is the first chapter of the programme with no surfaceable outcome at all.**
// Every verse is longevity: long life from the 8th lord in an angle, short life from it in
// the 8th, a span "between 20 and 32 years" from a weak ascendant lord. The standing
// constraint puts all of it in Part 51.
//
// One rule survives, and only by the reasoning Part 22 used on ch 17.2: the configurations
// of 19.4-7 are the classical *vipareeta* ones, and the structural reading — difficulties
// that undo themselves — is kept while the stated outcome is discarded. That is now the
// second time, so it is stated once as a named principle rather than argued twice.
//
// Chapters 20 and 21 are the opposite: two of the richest in the phase, and the two that
// answer the questions after partnership that people actually ask — luck and work.
// ─────────────────────────────────────────────────────────────────────────────

import type { Rule } from '../../rules/rule.js';
import { KENDRAS, TRIKONAS, lordInKendraOrTrikona, lordInDusthana } from './ch12-13.js';
import { grahaInKendraOrTrikona } from './ch14-16.js';

// ── Chapter 19 — the eighth house ────────────────────────────────────────────

/**
 * The reading that rescues one rule from an otherwise wholly deferred chapter.
 *
 * BPHS states repeatedly that a difficulty-house lord placed in a difficulty house produces
 * a GOOD outcome — ch 17.2 and ch 19.4-7 are both instances. The outcomes it names (freedom
 * from disease, long life) are ones the standing constraints will not surface. The
 * *mechanism* is a real and well-known one, and it is what the arbitration wants.
 *
 * So both chapters are read the same way: keep the structure, discard the stated outcome,
 * and flag it. Naming the principle once means the next chapter that does this does not
 * need the argument re-made.
 */
export const VIPAREETA_READING =
  'BPHS 17.2 and 19.4-7 both place a difficulty-house lord in a difficulty house and both '
  + 'name an outcome the standing constraints exclude (freedom from disease, long life). '
  + 'We keep the structural reading — difficulties that undo themselves rather than '
  + 'accumulate — and discard the stated outcome. This is OUR reading, applied twice now, '
  + 'and it is the only reason ch 19 yields any rule at all.';

/**
 * The eighth house: one rule, from 19.4-7 read structurally.
 *
 * See `CH19_21_YIELD`. Every other verse in the chapter is longevity and belongs to
 * Part 51.
 */
export function eighthHouseRules(): Rule[] {
  return [
    {
      id: 'bphs.19.004.sixth-and-twelfth-contained',
      source: { text: 'bphs', chapter: 19, verse: '4-7' },
      when: [
        { k: 'lordship', house: 6, occupies: 12 },
      ],
      effect: {
        id: 'obstacles.contained',
        domain: 'release',
        valence: 0.5,
        summary: 'Difficulties tend to cancel each other out rather than compound.',
      },
      weight: 0.5,
      verification: 'unverified',
      note: 'BPHS 19.4-7 names this configuration and reads it as long life, which is Part '
        + '51 material. The structural reading is kept and the outcome discarded — see '
        + 'VIPAREETA_READING. Shares `obstacles.contained` with bphs.17.002 deliberately: '
        + 'they are the same principle stated about two different houses, so a chart with '
        + 'both should corroborate rather than double-count.',
    },
  ];
}

// ── Chapter 20 — the ninth house ─────────────────────────────────────────────

/**
 * The ninth house: fortune, the paternal line, the sense that things open up (20.1-2,
 * 20.8-10, 20.26-29).
 *
 * Thirteen of this chapter's thirty-two verses (20.13-25) are combinations for the
 * **father's death**, including whether he died before the native was born. None of that is
 * surfaced. What is kept is the chapter's own constructive half, which is substantial.
 *
 * Note the two timing rules. 20.10 and 20.27-28 both name a year after which fortune
 * arrives — and unlike ch 18's marriage ages, both are adult ages that need no gating.
 */
export function ninthHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 20, verse });
  return [
    {
      id: 'bphs.20.001.lord-in-own-ninth',
      source: src('1-2'),
      when: [{ k: 'lordship', house: 9, occupies: 9 }],
      effect: {
        id: 'fortune.supported',
        domain: 'fortune',
        valence: 0.7,
        summary: 'Opportunities tend to arrive rather than have to be forced.',
      },
      weight: 0.7,
      verification: 'unverified',
    },
    {
      id: 'bphs.20.008.sun-exalted-lord-in-eleventh',
      source: src('8-9'),
      when: [
        { k: 'dignity', graha: 'sun', is: ['exalted'] },
        { k: 'lordship', house: 9, occupies: 11 },
      ],
      effect: {
        id: 'self.standing',
        domain: 'self',
        valence: 0.7,
        summary: 'Principles and standing reinforce each other; well regarded by those above.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 20.8-9 says virtuous and dear to the king. Restated as standing and '
        + 'regard — "virtuous" is a character claim, and kings are in short supply.',
    },
    {
      id: 'bphs.20.011.paternal-strain',
      source: src('11'),
      when: [
        { k: 'lordship', house: 1, occupies: 9 },
        { k: 'lordsConjunct', parties: [1, 6] },
      ],
      effect: {
        id: 'fortune.paternal',
        domain: 'fortune',
        valence: -0.5,
        summary: 'The relationship with one’s father takes work, and takes time to settle.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'BPHS 20.11 says mutual enmity. Restated as a relationship that takes work — the '
        + 'mechanism is worth having and the flat verdict is not. Uses `lordsConjunct` '
        + '(Part 22) for "with the lord of the 6th", which was inexpressible before.',
    },
    {
      id: 'bphs.20.026.venus-exalted-with-ninth-lord',
      source: src('26'),
      when: [
        { k: 'dignity', graha: 'venus', is: ['exalted'] },
        { k: 'placement', graha: 'saturn', house: 3 },
      ],
      effect: {
        id: 'fortune.supported',
        domain: 'fortune',
        valence: 0.7,
        summary: 'A run of good fortune that compounds rather than arriving once.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 20.26 also wants Venus in the company of the 9th lord. That is '
        + '`lordsConjunct`-adjacent but asks for a NAMED planet with an unnamed lord, which '
        + 'the predicate does not do — it takes two houses, not a house and a planet. '
        + 'Recorded in CH19_21_NOT_YET_EXPRESSIBLE.',
    },
    {
      id: 'bphs.20.029.lagna-ninth-exchange',
      source: src('29'),
      when: [
        { k: 'lordship', house: 1, occupies: 9 },
        { k: 'lordship', house: 9, occupies: 1 },
        { k: 'placement', graha: 'jupiter', house: 7 },
      ],
      effect: {
        id: 'fortune.supported',
        domain: 'fortune',
        valence: 0.8,
        summary: 'Who one is and what one is fortunate in are the same thing.',
      },
      weight: 0.8,
      verification: 'unverified',
      note: 'A lagna/9th exchange plus Jupiter in the 7th — three conditions, which makes it '
        + 'properly rare. The exchange of the ascendant and fortune lords is the strongest '
        + 'configuration in the chapter.',
    },
  ];
}

/**
 * 20.10 and 20.27-28 name a year after which fortune arrives.
 *
 * Both are adult ages, so unlike ch 18's marriage timings they need no gate — recorded
 * here rather than as rules because, like the marriage verses, they yield a *time* rather
 * than a claim.
 */
export const FORTUNE_TIMING: { verse: string; fromAge: number; when: string }[] = [
  { verse: '10', fromAge: 32, when: 'the 9th lord in the 2nd with the 2nd lord placed well' },
  { verse: '27-28', fromAge: 20, when: 'Jupiter in the 9th with its lord angular from the ascendant' },
];

// ── Chapter 21 — the tenth house ─────────────────────────────────────────────

/**
 * The tenth house: action in the world, standing, the work itself (21.2-4, 21.8-14,
 * 21.18-21).
 *
 * The richest chapter of the part and one of the richest in the phase — but also the one
 * with the most character judgement per verse. Five verses call the native a fool, or
 * given to bad deeds, or one who defiles his own people; all are excluded. What is left is
 * genuinely about the work.
 */
export function tenthHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 21, verse });
  return [
    {
      id: 'bphs.21.002.lord-dignified',
      source: src('2'),
      when: [{ k: 'dignity', graha: 'saturn', is: ['own', 'exalted'] }],
      effect: {
        id: 'career.standing',
        domain: 'career',
        valence: 0.7,
        summary: 'Work is a source of standing rather than merely of income.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'Template for "the 10th lord strong and exalted or in own sign"; instantiated '
        + 'for Saturn, the natural indicator of work, since the lord is chart-dependent.',
    },
    {
      id: 'bphs.21.003.lord-weak',
      source: src('3'),
      when: [{ k: 'strength', graha: 'saturn', op: '<', rupas: 300 }],
      effect: {
        id: 'career.standing',
        domain: 'career',
        valence: -0.5,
        summary: 'Work meets more friction than it should; progress is stop-start.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'THE FIRST RULE IN THE CORPUS TO USE THE `strength` PREDICATE. Part 22 had to '
        + 'drop such a condition from 18.18 because the calibration population carried no '
        + 'Shadbala; Part 23 added it, so "devoid of strength" is finally expressible. The '
        + 'threshold is Saturn’s own requirement from BPHS 27.32-36, not an invented one.',
    },
    {
      id: 'bphs.21.004.lord-well-placed',
      source: src('4'),
      when: [lordInKendraOrTrikona(10)],
      effect: {
        id: 'career.gains',
        domain: 'career',
        valence: 0.5,
        summary: 'Work brings gain through patronage and through dealings with others.',
      },
      weight: 0.5,
      verification: 'unverified',
      baseRate: 0.50,
      note: 'MEASURED at ~50% and declared. Fifth rule of the "lord in an angle or trine" '
        + 'shape — six houses of twelve is always a coin flip, so this is background.',
    },
    {
      id: 'bphs.21.008.lord-exalted-with-jupiter',
      source: src('8-10'),
      when: [
        { k: 'dignity', graha: 'saturn', is: ['exalted'] },
        { k: 'lordship', house: 9, occupies: 10 },
      ],
      effect: {
        id: 'career.standing',
        domain: 'career',
        valence: 0.8,
        summary: 'Recognition and means arrive together, and are kept.',
      },
      weight: 0.8,
      verification: 'unverified',
    },
    {
      id: 'bphs.21.013.tenth-eleventh-exchange',
      source: src('13'),
      when: [
        { k: 'lordship', house: 10, occupies: 11 },
        { k: 'lordship', house: 11, occupies: 1 },
        { k: 'placement', graha: 'venus', house: 10 },
      ],
      effect: {
        id: 'career.gains',
        domain: 'career',
        valence: 0.8,
        summary: 'The work itself is what generates the gain, directly and visibly.',
      },
      weight: 0.8,
      verification: 'unverified',
    },
    {
      id: 'bphs.21.014.lord-exalted-angular-with-jupiter',
      source: src('14'),
      when: [
        { k: 'dignity', graha: 'saturn', is: ['exalted'] },
        { k: 'aspect', graha: 'jupiter', ontoHouse: 10, kind: 'graha' },
      ],
      effect: {
        id: 'career.worth',
        domain: 'career',
        valence: 0.7,
        summary: 'The work is worth doing, not only worth being paid for.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 21.14 promises "worthy deeds". One of the few places the chapter praises '
        + 'the character of the WORK rather than judging the character of the native.',
    },
    {
      id: 'bphs.21.019.fame',
      source: src('19-21'),
      when: [
        { k: 'placement', graha: 'moon', house: 10 },
        { k: 'lordsConjunct', parties: [1, 10], inHouses: [...KENDRAS, ...TRIKONAS] },
      ],
      effect: {
        id: 'career.recognition',
        domain: 'career',
        valence: 0.7,
        summary: 'What one does becomes known beyond the people one does it for.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 21.19-21 wants the Moon in the 10th, the 10th lord in a trine from the '
        + '10th, and the ascendant lord strong. The trine-from-the-10th clause needs a '
        + 'house counted from a house, which the DSL does not do; `lordsConjunct` on the '
        + 'ascendant and 10th lords is the nearest expressible form and is flagged as such.',
    },
  ];
}

// ── Yield and policy ─────────────────────────────────────────────────────────

export const CH19_21_YIELD = {
  ch19: {
    verses: 13,
    rules: 1,
    note: 'The first chapter with NO surfaceable outcome. Every verse is longevity — long '
      + 'life, short life, a span "between 20 and 32 years". The single rule exists only '
      + 'through the vipareeta reading, and is flagged as ours.',
  },
  ch20: {
    verses: 32,
    rules: 5,
    note: 'Thirteen of the thirty-two verses (20.13-25) are combinations for the father’s '
      + 'death, including whether he died before the native was born. The constructive half '
      + 'is substantial and is kept.',
  },
  ch21: {
    verses: 22,
    rules: 7,
    note: 'The richest chapter of the part, and the one with the most character judgement '
      + 'per verse — five verses call the native a fool or given to bad deeds. Excluded; '
      + 'what remains is genuinely about the work.',
  },
} as const;

export const CH19_21_EXCLUDED = [
  '19.1-3, 19.8-13 — long life, short life, and a lifespan in years. The whole chapter '
  + 'except the vipareeta configurations.',
  '20.12, 20.31 — the native reduced to begging. A destitution claim about a life.',
  '21.5 — "will indulge only in bad deeds and will defile his own men".',
  '21.6 — "will hate others, be a great fool".',
  '21.7 — "fond of carnal pleasures".',
  '21.16, 21.17 — further bad-deeds judgements.',
] as const;

export const CH19_21_UNSURFACED = [
  '19 (all) — longevity in every form. Part 51.',
  '20.4 — an indigent father. A negative claim about a third party.',
  '20.5 — a long-living father. Longevity of another person.',
  '20.13-25 — thirteen verses of combinations for the father’s death.',
  '20.30 — lack of fortunes.',
  '21.11 — cessation of duties.',
] as const;

export const CH19_21_NOT_YET_EXPRESSIBLE = [
  'A NAMED planet conjunct an UNNAMED lord (20.26 — "Venus in the company of the 9th '
  + 'lord"). `lordsConjunct` takes two houses; this needs a house and a planet. A small '
  + 'extension, and the verses want it often.',
  'A house counted FROM another house (21.19 — "the 10th lord in a trine from the 10th"). '
  + 'The `bindus` predicate got `fromGraha` in Part 17; house-relative houses are the same '
  + 'idea one level up.',
  'Navamsa-relative placement (20.5, 21.16) — wanted four parts running now. The varga '
  + 'machinery has existed since Parts 3-5 and is still not bound into a predicate.',
] as const;

export const STRENGTH_PREDICATE_NOW_USABLE =
  'BPHS 21.3 ("the 10th lord devoid of strength") is the first rule in the corpus to use '
  + 'the `strength` predicate. It was unusable until Part 23 added Shadbala to the '
  + 'synthetic population — Part 22 had to drop exactly such a condition from 18.18. The '
  + 'threshold used is Saturn’s own requirement from BPHS 27.32-36, not an invented number.';
