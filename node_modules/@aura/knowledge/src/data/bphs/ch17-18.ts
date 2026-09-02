// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 17 and 18 — the 6th and 7th Houses. Programme Part 22.
//   Ch 17 — lines 6211-6423, verses 1-28
//   Ch 18 — lines 6423-6686, verses 1-42 (plus four unnumbered notes)
//
// These two chapters sit at the extremes of Phase III.
//
// **Chapter 17 is the lowest-yielding chapter in the corpus so far.** Its own first verse
// announces the subject as "diseases, ulcers etc.", and it delivers: ulcers by body part,
// facial disease, leprosy, fever, tumours, then fear from dogs and enmity with one's own
// sons. Two rules survive. The mechanism — a stressed 6th — is worth having; almost none of
// the outcomes are.
//
// **Chapter 18 has the highest product value in the phase and the most excludable
// material in it.** Thirteen verses (18.22-34) address the AGE of marriage — twelve of them
// naming a year — which is the question the app is asked most; and interleaved with them are physical descriptions of the spouse's body,
// judgements on their character, and the timing of their death. The two have to be
// separated verse by verse, not chapter by chapter.
//
// The part also closes the DSL gap Part 21 named: `lordsConjunct` finally expresses "the
// lord of A is with the lord of B", which BPHS states constantly.
// ─────────────────────────────────────────────────────────────────────────────

import type { Rule } from '../../rules/rule.js';
import { KENDRAS, TRIKONAS, lordInKendraOrTrikona, lordInDusthana } from './ch12-13.js';

// ── Chapter 17 — the sixth house ─────────────────────────────────────────────

/**
 * The sixth house: obligations, opposition, the cost of friction (17.26 and the
 * constructive inverse of 17.2).
 *
 * Two rules. See `CH17_18_YIELD` — this is not a partial pass, it is what is left when a
 * chapter about disease has its disease removed.
 */
export function sixthHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 17, verse });
  return [
    {
      id: 'bphs.17.002.lord-contained',
      source: src('2'),
      when: [lordInDusthana(6)],
      effect: {
        id: 'obstacles.contained',
        domain: 'release',
        valence: 0.5,
        summary: 'Opposition and obligations tend to undo themselves rather than accumulate.',
      },
      weight: 0.5,
      verification: 'unverified',
      note: 'The constructive inverse of 17.2. BPHS reads the 6th lord in the 6th as ulcers '
        + 'on the body; the same placement is the classical vipareeta configuration, where a '
        + 'difficulty-house lord in a difficulty house weakens what it rules. The medical '
        + 'outcome is excluded; the structural reading is kept, and flagged as OUR reading '
        + 'of a verse whose stated outcome we do not use.',
    },
    {
      id: 'bphs.17.026.sixth-eleventh-exchange',
      source: src('26'),
      when: [
        { k: 'lordship', house: 6, occupies: 11 },
        { k: 'lordship', house: 11, occupies: 6 },
      ],
      effect: {
        id: 'wealth.accumulation',
        domain: 'wealth',
        valence: -0.5,
        summary: 'Income and obligation are entangled — what comes in is committed before it arrives.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'BPHS 17.26 states loss of wealth in the 31st year specifically. The exchange is '
        + 'encoded; the age is not surfaced. Shares `wealth.accumulation` with the ch 13 '
        + 'rules on purpose, so it argues against them rather than sitting beside them.',
    },
  ];
}

// ── Chapter 18 — the seventh house ───────────────────────────────────────────

/**
 * The seventh house: partnership (18.1, 18.4-5, 18.14-15, 18.18, and 18.2 restated).
 *
 * The app's most-asked domain, so the encoding is deliberately conservative: what the
 * chapter says about the *native's* experience of partnership is kept, and everything it
 * says about the spouse as an object of description or judgement is not. That line does a
 * lot of work here — see `CH17_18_EXCLUDED`.
 */
export function seventhHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 18, verse });
  return [
    {
      id: 'bphs.18.001.lord-dignified',
      source: src('1'),
      when: [{ k: 'dignity', graha: 'venus', is: ['own', 'exalted'] }],
      effect: {
        id: 'partnership.wellbeing',
        domain: 'partnership',
        valence: 0.7,
        summary: 'Partnership is a settled, sustaining part of life.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'Template for "the 7th lord in own sign or exaltation"; instantiated for Venus, '
        + 'the natural indicator of the 7th, since the lord is chart-dependent.',
    },
    {
      id: 'bphs.18.002.lord-in-dusthana',
      source: src('2'),
      when: [lordInDusthana(7)],
      unless: [{ k: 'dignity', graha: 'venus', is: ['own', 'exalted'] }],
      effect: {
        id: 'partnership.wellbeing',
        domain: 'partnership',
        valence: -0.5,
        summary: 'Partnership asks more tending than it does for most, especially early on.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'BPHS 18.2 predicts a sickly spouse. That is a medical claim about another '
        + 'person and is not made. The verse states its OWN exception — own sign or '
        + 'exaltation does not apply — so that is the `unless`, which is the chapter '
        + 'supplying its own antidote as ch 10 and ch 12 do.',
    },
    {
      id: 'bphs.18.004.lord-strong-and-aspected',
      source: src('4-5'),
      when: [
        lordInKendraOrTrikona(7),
        { k: 'aspect', graha: 'jupiter', ontoHouse: 7, kind: 'graha' },
      ],
      effect: {
        id: 'partnership.wellbeing',
        domain: 'partnership',
        valence: 0.8,
        summary: 'A partnership that adds standing and ease rather than costing them.',
      },
      weight: 0.8,
      verification: 'unverified',
    },
    {
      id: 'bphs.18.014.worthy-partner',
      source: src('14-15'),
      when: [
        lordInKendraOrTrikona(7),
        { k: 'dignity', graha: 'venus', is: ['own', 'exalted', 'moolatrikona'] },
      ],
      effect: {
        id: 'partnership.quality',
        domain: 'partnership',
        valence: 0.7,
        summary: 'The partnership is with someone of real substance, and it lasts.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 18.14-15 lists the spouse’s virtues and the expansion of the family line. '
        + 'Restated as substance and durability — the virtue list is a description of a '
        + 'third party and the dynasty clause is a claim about children.',
    },
    {
      id: 'bphs.18.018.conjugal-strain',
      source: src('18'),
      when: [
        { k: 'placement', graha: 'moon', house: 7 },
        { k: 'lordship', house: 7, occupies: 12 },
      ],
      effect: {
        id: 'partnership.wellbeing',
        domain: 'partnership',
        valence: -0.6,
        summary: 'Closeness is harder to sustain than to find; distance creeps in unnoticed.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 18.18 adds a weak Venus as a third condition. Two are encoded; adding '
        + '"bereft of strength" needs a Shadbala threshold on the ChartFacts, which the '
        + '`strength` predicate has but which no chart in the calibration population '
        + 'carries — it would make the rule untestable rather than more precise.',
    },
  ];
}

/**
 * 18.4-5 also demonstrates the new predicate, and 15.4 is the rule Part 21 had to weaken.
 * Both are now expressible. Kept as a separate factory so the retrofit is visible rather
 * than buried in a diff.
 */
export function lordConjunctionRules(): Rule[] {
  return [
    {
      id: 'bphs.15.004.lords-actually-joined',
      source: { text: 'bphs', chapter: 15, verse: '4' },
      when: [{ k: 'lordsConjunct', parties: [4, 10], inHouses: [...KENDRAS, ...TRIKONAS] }],
      effect: {
        id: 'home.comfort',
        domain: 'home',
        valence: 0.8,
        summary: 'Home and standing are built by the same effort, and rise together.',
      },
      weight: 0.8,
      verification: 'unverified',
      note: 'THE RETROFIT. Part 21 encoded 15.4 as "both lords angular" because the DSL '
        + 'could not say they JOIN. `lordsConjunct` now says it, so this is the verse as '
        + 'written. The weaker Part 21 rule is kept alongside — it is a real, broader claim '
        + 'and the arity stage will rank this one above it when both fire.',
    },
    {
      id: 'bphs.13.004.lords-joined-variant',
      source: { text: 'bphs', chapter: 13, verse: '4' },
      when: [{ k: 'lordsConjunct', parties: [2, 11], inHouses: [...KENDRAS, ...TRIKONAS] }],
      effect: {
        id: 'wealth.accumulation',
        domain: 'wealth',
        valence: 0.8,
        summary: 'Earning and keeping are driven by one and the same strength.',
      },
      weight: 0.8,
      verification: 'unverified',
      note: 'BPHS 13.4’s second clause — "alternatively, these two lords may join in an '
        + 'angle or in a trine" — which Part 20 could only encode as the mutual exchange. '
        + 'The verse offers both and now both exist.',
    },
  ];
}

// ── 18.22-34 — the marriage-timing verses ────────────────────────────────────

export interface MarriageTiming {
  verse: string;
  ages: number[];
  when: string;
}

/**
 * Twelve of the thirteen verses in 18.22-34 give an AGE of marriage from static
 * placements. (18.22 itself states a favourable configuration without naming a year, so it
 * has no entry here.)
 *
 * This is the highest-value material in Phase III for the app — "when" is the question
 * people actually ask, and almost nothing else in the corpus answers it without a dasha.
 *
 * **But read the ages.** Several fall between 7 and 12, which reflects the marriage
 * practice of the text's era and not a prediction anyone should be handed. They are carried
 * because dropping them would silently misrepresent the source, and gated behind
 * `SURFACEABLE_MARRIAGE_AGE` because surfacing them unfiltered would be worse.
 */
export const MARRIAGE_TIMING: MarriageTiming[] = [
  { verse: '23', ages: [7, 11], when: 'the Sun in the 7th with its dispositor conjunct Venus' },
  { verse: '24', ages: [10, 16], when: 'Venus in the 2nd, the 7th lord in the 11th' },
  { verse: '25', ages: [11], when: 'Venus angular from the lagna, the lagna lord in Capricorn or Aquarius' },
  { verse: '26', ages: [12, 19], when: 'Venus angular from the lagna, Saturn in the 7th from Venus' },
  { verse: '29', ages: [13], when: 'an exchange between the lords of the 2nd and the 11th' },
  { verse: '28', ages: [15], when: 'the 2nd lord in the 11th, the lagna lord in the 10th' },
  { verse: '27', ages: [18], when: 'Venus in the 7th from the Moon, Saturn in the 7th from Venus' },
  { verse: '30', ages: [22, 27], when: 'Venus in the 2nd with its dispositor conjunct Mars' },
  { verse: '31', ages: [23, 26], when: 'the 7th lord in the 12th, the lagna lord in the 7th in navamsa' },
  { verse: '32', ages: [25, 33], when: 'the 8th lord in the 7th, Venus in the navamsa ascendant' },
  { verse: '33', ages: [28], when: 'Venus in the 5th with Rahu in the 5th or 9th' },
  { verse: '34', ages: [27, 30], when: 'Venus in the ascendant, the 7th lord in the 7th' },
];

/**
 * The age below which a marriage indication is not surfaced.
 *
 * Set at 18 — the age of majority in most of the world, and the point below which a
 * marriage prediction stops being astrology and becomes something else entirely. Six of
 * the chapter's indications fall wholly or partly below it.
 *
 * This is OUR line, not the text's, and it is a policy decision rather than an
 * astrological one.
 */
export const SURFACEABLE_MARRIAGE_AGE = 18;

/** The ages from a timing verse that may actually be shown. */
export const surfaceableAges = (t: MarriageTiming): number[] =>
  t.ages.filter((a) => a >= SURFACEABLE_MARRIAGE_AGE);

/** Timing verses with at least one age that can be surfaced. */
export const surfaceableTimings = (): MarriageTiming[] =>
  MARRIAGE_TIMING.filter((t) => surfaceableAges(t).length > 0);

export const MARRIAGE_AGE_POLICY =
  'BPHS 18.22-34 gives marriage ages from static placements, several between 7 and 12. '
  + 'Those reflect the era’s practice, not a prediction to hand anyone. All thirteen verses '
  + 'are carried so the source is not misrepresented, and SURFACEABLE_MARRIAGE_AGE (18) '
  + 'gates what may be shown. The gate is ours, and it is policy rather than astrology.';

// ── Yield and policy ─────────────────────────────────────────────────────────

export const CH17_18_YIELD = {
  ch17: {
    verses: 28,
    rules: 2,
    note: 'The lowest-yielding chapter so far. Its own verse 1 announces the subject as '
      + '"diseases, ulcers etc." and delivers exactly that, plus fear from dogs and enmity '
      + 'with one’s sons. The mechanism of a stressed 6th is kept; the outcomes are not.',
  },
  ch18: {
    verses: 42,
    rules: 5,
    note: 'Highest product value in Phase III and the most excludable material in it, '
      + 'interleaved verse by verse. Thirteen timing verses are carried separately in '
      + 'MARRIAGE_TIMING rather than as rules, since they yield an age rather than a claim '
      + '(twelve of the thirteen name a year; 18.22 does not).',
  },
} as const;

export const CH17_18_EXCLUDED = [
  '17.2-19 — ulcers and bruises by body part, facial disease, leprosy, fever, tumours. The '
  + 'whole medical core of the chapter.',
  '17.27 — one’s own sons becoming enemies. A judgement about family relationships.',
  '17.28 — fear from dogs in specific years. Archaic, and a fear prediction.',
  '18.3 — "exceedingly libidinous". A judgement about the native’s sexual character.',
  '18.7-9½ — the spouse’s body described by which planet occupies the 7th, breasts '
  + 'included. Physiognomy applied to a third party; the strongest exclusion in the phase.',
  '18.notes 1-4 — the spouse "of questionable character", and two verses describing '
  + 'specific sexual acts. Excluded outright.',
  '18.6, 18.19-21, 18.40-41 — counts of marriages. Not a mechanism, and a claim about a '
  + 'life rather than a chart.',
] as const;

export const CH17_18_UNSURFACED = [
  '17.20-25 — "unfortunate years", including danger through water at specific ages.',
  '17.26 — the 31st year specifically. The exchange is encoded; the age is not.',
  '18.16-17 — evils to the spouse, and loss of the spouse.',
  '18.35-39, 18.42 — the timing of the spouse’s death. Never surfaced at any age.',
  '18.22-34 ages below 18 — carried in MARRIAGE_TIMING, gated by SURFACEABLE_MARRIAGE_AGE.',
] as const;

export const CH17_18_NOT_YET_EXPRESSIBLE = [
  '"Bereft of strength" as a condition (18.18, 18.17) — the `strength` predicate exists but '
  + 'the calibration population carries no Shadbala, so adding it would make a rule '
  + 'untestable rather than more precise. Wire real Shadbala into ChartFacts first.',
  'A planet’s DISPOSITOR (18.23, 18.30) — "the lord of the sign the Sun occupies". Needs a '
  + 'predicate that resolves a lord from a planet’s position rather than from a house.',
  'Navamsa-relative positions (18.31, 18.32) — the varga machinery exists from Parts 3-5 '
  + 'but is still not bound into a predicate. Third part in a row this has come up.',
] as const;

export const LORDS_CONJUNCT_CLOSED_A_GAP =
  'Part 21 named `lordshipConjunct` as the highest-leverage DSL addition left for Phase '
  + 'III. Part 22 added it as `lordsConjunct`, which also restored BPHS 15.4 and 13.4 to '
  + 'the form the verses actually state. It refuses to fire when one planet rules both '
  + 'houses, since that is one planet rather than two meeting.';
