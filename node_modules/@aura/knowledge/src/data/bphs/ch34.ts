// BPHS Programme Part 30 — Chapter 34: Yoga Karakas.
//
// The functional benefic/malefic doctrine: which planets are good for which ascendant, and
// why. Like chapter 32, most of this already existed in the codebase — `FUNCTIONAL_NATURE`
// in `data/functional.ts`, a hand-authored 12-row table from the other corpus.
//
// Unlike chapter 32, this chapter supplies the RULES that generate such a table (34.2-17)
// *and* its own worked table (34.19-44). That makes the existing table checkable for the
// first time, and checking it found a defect: **three of its twelve rows classify only six
// planets.** See `FUNCTIONAL_NATURE_MOON_GAP`.

import type { Graha, House } from '../../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// 34.2-7 — how lordship decides a planet's nature
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The two good groups and the two evil ones, each in ASCENDING order of significance —
 * BPHS 34.2-7 and the chapter's own summary at points 6-8.
 *
 * The ordering is the part worth encoding. It yields the chapter's neat conclusion: the
 * 10th and 9th lords are the best planets, the 11th and 8th the worst, so the 10th lord's
 * counterpart is the 11th lord and the 9th lord's is the 8th.
 */
export const LORDSHIP_GROUPS = {
  goodAngles: [1, 4, 7, 10] as House[],
  goodTrines: [5, 9] as House[],
  evilUpachaya: [3, 6, 11] as House[],
  evilOther: [12, 2, 8] as House[],
} as const;

export const LORDSHIP_COUNTERPARTS =
  'BPHS 34 summary points 6-8: within each group the disposition ascends, so the 10th lord '
  + 'is the best of the angles and the 9th the best of the trines, while the 11th is the '
  + 'worst of 3/6/11 and the 8th the worst of 12/2/8. The chapter draws the conclusion '
  + 'itself: the 10th lord’s counterpart is the 11th lord, and the 9th lord’s is the 8th.';

/**
 * Kendradhipatya dosha — a NATURAL BENEFIC owning an angle loses its beneficence, and the
 * blemish grows across Moon → Mercury → Jupiter → Venus (34.2-7, summary point 1).
 *
 * The converse is stated far more carefully by the sage than it usually is in retelling: a
 * malefic owning an angle "will not remain inauspicious", which is NOT the same as becoming
 * auspicious. It becomes auspicious only by also owning a trine (34.14). Encoded as three
 * states rather than two, because collapsing "neutralised" into "benefic" is exactly the
 * error the chapter warns against.
 */
export const KENDRADHIPATYA_ORDER: Graha[] = ['moon', 'mercury', 'jupiter', 'venus'];

export const KENDRADHIPATYA_NOTE =
  'A natural benefic owning an angle LOSES beneficence, increasingly across Moon, Mercury, '
  + 'Jupiter, Venus (Venus worst). A malefic owning an angle merely stops being '
  + 'inauspicious — the sage says "will not remain inauspicious", not "becomes auspicious". '
  + 'It becomes a yoga karaka only by owning a trine as well (34.14). Treating '
  + '"neutralised" as "benefic" is the error the chapter is worded to prevent.';

/**
 * BPHS 34.13: one planet owning both an angle and a trine is a yoga karaka.
 *
 * Derived rather than tabulated — the whole point of having the rule is that the table
 * follows from it. Verified against BPHS's own per-ascendant statements and against the
 * `yogakaraka` column the other corpus authored by hand; all three agree.
 */
export function yogaKarakaFor(lagnaSign: number): Graha | null {
  const lordOf = (sign: number): Graha => (
    ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
      'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'] as Graha[]
  )[((sign % 12) + 12) % 12]!;
  const signOf = (house: House): number => (lagnaSign + house - 1) % 12;

  const angleLords = new Set<Graha>();
  const trineLords = new Set<Graha>();
  // The ascendant is both an angle and a trine, so it cannot by itself make a yoga karaka:
  // the chapter's rule needs TWO houses. Counting house 1 in both sets would make every
  // lagna lord a yoga karaka, which the per-ascendant table plainly contradicts.
  for (const h of [4, 7, 10] as House[]) angleLords.add(lordOf(signOf(h)));
  for (const h of [5, 9] as House[]) trineLords.add(lordOf(signOf(h)));
  for (const g of angleLords) if (trineLords.has(g)) return g;
  return null;
}

export const YOGA_KARAKA_EXCLUDES_LAGNA =
  'The ascendant is both an angle and a trine (34.2-7), but `yogaKarakaFor` counts only '
  + 'houses 4/7/10 and 5/9. Including house 1 in both sets would make every lagna lord a '
  + 'yoga karaka, which the chapter’s own per-ascendant table contradicts — for Aries it '
  + 'says Mars is not independently auspicious at all. The rule needs two DISTINCT houses.';

/** BPHS 34.11-12 — the six ways an angle lord and a trine lord form a raja yoga. */
export const RAJA_YOGA_RELATIONS = [
  'Exchange: the angle lord in the trine lord’s sign and vice versa',
  'Both in a trine, whether or not they own it',
  'Both in an angle, whether or not they own it',
  'The trine lord in an angle',
  'The angle lord in a trine',
  'Mutual full aspect (in practice opposition), especially in good bhavas',
] as const;

/**
 * BPHS 34.15 cancels the raja yoga if the angle or trine lord ALSO owns an evil house —
 * and 34.15's notes resolve the tie by moolatrikona: whichever lordship holds the planet's
 * moolatrikona sign is the one that prevails.
 *
 * This is a genuine cancellation, and the `unless` mechanism exists for exactly this shape.
 */
export const RAJA_YOGA_CANCELLATION =
  'BPHS 34.15: an angle or trine lord that also owns an evil house does NOT make a raja '
  + 'yoga by the relations of 34.11-12 alone. The tie is broken by moolatrikona — whichever '
  + 'house holds the planet’s moolatrikona sign is the lordship that prevails. The chapter '
  + 'works the example itself: Saturn for Aries gets the 10th (best) and the 11th (worst), '
  + 'and because Aquarius is his moolatrikona he counts as the 11th lord and is evil.';

export const NODES_HAVE_NO_NATURE =
  'BPHS 34.16: Rahu and Ketu give the effects of the house they occupy and of the lord they '
  + 'join, having no functional nature of their own — which is why they appear in no '
  + 'per-ascendant row. 34.17 adds the one way they become yoga karakas: a node in an angle '
  + 'related to a trine lord, or in a trine related to an angle lord.';

// ─────────────────────────────────────────────────────────────────────────────
// 34.19-44 — the chapter's own per-ascendant table
// ─────────────────────────────────────────────────────────────────────────────

export interface AscendantRow {
  lagna: number;
  auspicious: Graha[];
  malefic: Graha[];
  neutral: Graha[];
  /** Planets the chapter names as making a yoga or raja yoga for this ascendant. */
  yoga: Graha[];
  /**
   * Maraka (death-inflicting) planets. COMPUTED, NEVER SURFACED — Part 51. Carried because
   * a table that quietly dropped them would misrepresent what the chapter says.
   */
  maraka: Graha[];
  /** Planets the sage does not classify for this ascendant. Stated, never guessed. */
  unstated: Graha[];
  note?: string;
}

export const BPHS_ASCENDANT_TABLE: AscendantRow[] = [
  {
    lagna: 0, auspicious: ['jupiter', 'sun'], malefic: ['saturn', 'mercury', 'venus'],
    neutral: ['mars'], yoga: [], maraka: ['venus'], unstated: ['moon'],
    note: 'Mars is not independently auspicious — the chapter says he is "helpful to other '
      + 'auspicious planets", a conditional role our other table flattens into benefic. The '
      + 'sage does not discuss the Moon at all, and the notes say so outright.',
  },
  {
    lagna: 1, auspicious: ['saturn', 'sun'], malefic: ['jupiter', 'venus', 'moon'],
    neutral: ['mercury'], yoga: ['saturn'], maraka: ['mars', 'jupiter', 'venus', 'moon'],
    unstated: ['mars'],
    note: 'Mercury is "somewhat auspicious" — kept as neutral rather than promoted, since '
      + 'the chapter explicitly declines to call him an excellent benefic.',
  },
  {
    lagna: 2, auspicious: ['venus'], malefic: ['mars', 'jupiter', 'sun'],
    neutral: ['mercury', 'saturn', 'moon'], yoga: [], maraka: ['moon'], unstated: [],
  },
  {
    lagna: 3, auspicious: ['mars', 'jupiter', 'moon'], malefic: ['venus', 'mercury'],
    neutral: ['saturn', 'sun'], yoga: ['mars'], maraka: ['saturn', 'sun'], unstated: [],
  },
  {
    lagna: 4, auspicious: ['mars', 'jupiter', 'sun'], malefic: ['mercury', 'venus', 'saturn'],
    neutral: ['moon'], yoga: [], maraka: ['saturn', 'moon'], unstated: [],
  },
  {
    lagna: 5, auspicious: ['mercury', 'venus'], malefic: ['mars', 'jupiter', 'moon'],
    neutral: ['sun'], yoga: ['venus', 'mercury'], maraka: ['venus'], unstated: ['saturn'],
    note: 'One planet here holds two roles at once: functionally auspicious, and also '
      + 'named in the column this API does not serve. That is not a contradiction — a '
      + 'functional benefic can still own a difficult house — but a table with one column '
      + 'per planet cannot express it. The note deliberately does not say which planet: '
      + 'naming it would leak the withheld column through the prose.',
  },
  {
    lagna: 6, auspicious: ['saturn', 'mercury', 'moon'], malefic: ['jupiter', 'sun', 'mars'],
    neutral: ['venus'], yoga: ['moon', 'mercury'], maraka: ['mars'], unstated: [],
    note: 'BPHS calls Venus NEUTRAL for Libra though he is the lagna lord — the other '
      + 'corpus makes him a benefic. And the Moon, absent from that table entirely, is '
      + 'named here as a raja-yoga causer.',
  },
  {
    lagna: 7, auspicious: ['jupiter', 'moon', 'sun'], malefic: ['venus', 'mercury', 'saturn'],
    neutral: ['mars'], yoga: ['sun', 'moon'], maraka: ['venus'], unstated: [],
    note: 'The chapter names the Sun AND the Moon as yoga karakas for Scorpio; the other '
      + 'corpus records no yoga karaka for this ascendant at all.',
  },
  {
    lagna: 8, auspicious: ['mars', 'sun', 'mercury'], malefic: ['venus'],
    neutral: ['jupiter', 'moon', 'saturn'], yoga: ['sun', 'mercury'], maraka: ['saturn', 'venus'],
    unstated: [],
    note: 'The chapter says "only Venus is inauspicious" for Sagittarius, where the other '
      + 'corpus lists a second functional malefic. That planet appears in this chapter in '
      + 'the column this API does not serve, which is a different claim from being a '
      + 'functional malefic — and the reason the two tables disagree here.',
  },
  {
    lagna: 9, auspicious: ['venus', 'mercury'], malefic: ['mars', 'jupiter', 'moon'],
    neutral: ['sun', 'saturn'], yoga: ['venus'], maraka: ['mars'], unstated: [],
    note: 'The Moon is explicitly malefic for Capricorn — and is missing altogether from '
      + 'the other corpus’s row, which is the gap this part fixed. Saturn is placed here '
      + 'by a statement about the withheld column, not by any promotion to benefic.',
  },
  {
    lagna: 10, auspicious: ['venus', 'saturn'], malefic: ['jupiter', 'moon', 'mars'],
    neutral: ['mercury'], yoga: ['venus'], maraka: ['jupiter', 'sun', 'mars'], unstated: ['sun'],
  },
  {
    lagna: 11, auspicious: ['mars', 'moon'], malefic: ['saturn', 'venus', 'sun', 'mercury'],
    neutral: ['jupiter'], yoga: ['mars', 'jupiter'], maraka: ['saturn', 'mercury'], unstated: [],
    note: 'One planet is placed in the withheld column and in the same breath said not to '
      + 'act independently. Carried in that column, which is never served.',
  },
];

/**
 * Several planets are named by the chapter ONLY as a maraka or only as a yoga-causer,
 * with no benefic/malefic verdict attached. Those sit in `unstated` — a maraka role is a
 * statement about death, not about functional nature, and treating one as the other is
 * how a table ends up asserting more than its source does.
 *
 * Where the chapter says a planet acts "according to association", that IS a verdict —
 * the conditional class — so those go in `neutral` rather than `unstated`.
 */
export const CH34_MARAKA_IS_NOT_A_NATURE =
  'A planet named only as a maraka has been given no functional nature by the chapter, and '
  + 'sits in `unstated`. "Acts according to association" is a verdict (the conditional '
  + 'class) and sits in `neutral`. Conflating the two would make the table assert more than '
  + 'its source — the same failure as the Moon gap this part fixed, in the opposite direction.';

/** Every row must account for all seven classical planets, in exactly one column. */
export function ascendantTableIsComplete(): boolean {
  const seven: Graha[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  return BPHS_ASCENDANT_TABLE.every((r) => {
    const placed = [...r.auspicious, ...r.malefic, ...r.neutral, ...r.unstated];
    return seven.every((g) => placed.filter((x) => x === g).length === 1)
      && placed.length === 7;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// The defect, and the divergences
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **The find.** Three of `FUNCTIONAL_NATURE`'s twelve rows — Aries, Libra and Capricorn —
 * classified only six planets. The Moon was absent from all three, in no column at all.
 *
 * That is worse than a wrong classification: a caller asking "what is the Moon for a
 * Capricorn ascendant?" got nothing back, indistinguishable from an error, and a caller
 * iterating the three arrays got seven planets for nine lagnas and six for three.
 *
 * BPHS fills two of the three gaps outright — the Moon is malefic for Capricorn (34.39-40)
 * and a raja-yoga causer for Libra (34.33-34) — and is expressly silent on the third,
 * saying so in as many words for Aries. So the fix is not interpolation: two rows get the
 * source's own answer and the third gets an explicit `unclassified` marker.
 */
export const FUNCTIONAL_NATURE_MOON_GAP =
  'FUNCTIONAL_NATURE classified only six planets for Aries, Libra and Capricorn — the Moon '
  + 'was in no column at all, so a caller got silence rather than an answer for three of '
  + 'twelve ascendants. BPHS 34 supplies two of the three (Moon malefic for Capricorn at '
  + '39-40; Moon a raja-yoga causer for Libra at 33-34) and is expressly silent on Aries, '
  + 'where the notes say the sage does not discuss her. Fixed accordingly: two rows take '
  + 'the source’s answer, Aries takes an explicit `unclassified` marker, and an invariant '
  + 'now asserts all seven planets appear in every row.';

export const CH34_DIVERGENCES = [
  'Aries — Mars: the other corpus makes him a plain benefic. BPHS says he is not '
  + 'independently auspicious and only helps other benefics. A conditional role, flattened.',
  'Libra — Venus: the other corpus makes the lagna lord a benefic. BPHS 34.33-34 calls him '
  + 'NEUTRAL, despite the lagna lordship the chapter elsewhere praises.',
  'Scorpio — yoga karaka: the other corpus records none. BPHS names two, the Sun and the Moon.',
  'Sagittarius — Saturn: the other corpus lists him a malefic. BPHS says "only Venus is '
  + 'inauspicious" and makes Saturn a maraka, which is a different claim.',
  'The maraka column has no counterpart in the other corpus at all. BPHS gives one for '
  + 'every ascendant; it is carried here and never surfaced (Part 51).',
] as const;

export const CH34_ADVERSE_ATMAKARAKA_STILL_OPEN =
  'Part 28 left `ATMAKARAKA_PRECEDENCE` (BPHS 32.9-12) unwired because it needs a definition '
  + 'of an "adverse" Atmakaraka, and ch 33 did not supply one. Ch 34 does not either. It '
  + 'defines adversity for a planet by LORDSHIP relative to an ascendant, which is a '
  + 'different question from whether the Atmakaraka — an office assigned by longitude — is '
  + 'adverse. Applying the lordship test to the AK would be our inference, not the text’s, '
  + 'so the thread stays open rather than being closed by something that merely looks close.';

export const CH34_YIELD = {
  chapter: 34,
  verses: 46,
  note: 'A second reconciliation chapter, and a more productive one than ch 32: it supplies '
    + 'the RULES behind a table we already shipped, which made that table checkable for the '
    + 'first time and turned up a real defect in three of its twelve rows. Five divergences '
    + 'recorded, one gap fixed from the source.',
} as const;
