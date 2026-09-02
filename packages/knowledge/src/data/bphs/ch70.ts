// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 70 — Effects of the Ashtakavarga. Programme Part 17.
//   Lines 51064-51841, verses 1-44.
//
// Phase II spent four parts making the numbers correct. This is the chapter that says
// what they MEAN, and it is the most structurally important one in the phase — because
// its rules read *quantities* rather than placements. "If the 5th from Jupiter holds many
// rekhas there is happiness from children" is a different kind of statement from "if
// Jupiter is in the 5th", and it is the shape every later quantitative rule should copy.
//
// Two mechanisms carry the whole chapter:
//
//   1. **More rekhas is better.** A transit through a well-marked sign delivers; through a
//      poorly-marked one it does not. Stated for every planet in turn.
//   2. **The trigger formula.** rekhas x Yoga Pinda, taken mod 27 for a nakshatra and mod
//      12 for a rasi, names the point whose transit by SATURN activates the matter. This
//      is BPHS turning a static chart quantity into a DATE, and it is repeated verbatim
//      for father, mother, siblings, family and the native.
//
// The longevity material (37-44) is computed here and never surfaced, per standing policy.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House, SignIndex } from '../../types.js';
import type { Rule } from '../../rules/rule.js';

const mod = (n: number, m: number): number => ((n % m) + m) % m;

// ── 70.1-6 What each planet's ashtakavarga is consulted for ──────────────────

/**
 * The matters each planet's ashtakavarga governs (70.1-6), in our own words.
 *
 * Venus's list in the source includes material about sexual conduct that the standing
 * policy excludes; its astrological content — partnership, pleasure, conveyances — is
 * kept and the rest is not reproduced.
 */
export const AV_MATTERS: Record<Graha | 'asc', string[]> = {
  sun: ['vitality', 'temperament', 'physical strength', 'fortunes and setbacks', 'father'],
  moon: ['mind', 'judgement', 'contentment', 'mother'],
  mars: ['siblings', 'stamina', 'personal qualities', 'land'],
  mercury: ['dealings and negotiations', 'livelihood', 'friends'],
  jupiter: ['bodily nourishment', 'learning', 'children', 'wealth and property'],
  venus: ['marriage', 'pleasures and comforts', 'conveyances'],
  saturn: ['means of maintenance', 'sorrows', 'exposure to loss'],
  rahu: [],
  ketu: [],
  asc: ['the native’s own person and circumstances'],
};

/**
 * The house, counted FROM that planet, which the chapter reads its matter in.
 *
 * Note these are reckoned from the planet, not from the lagna — which is why the `bindus`
 * predicate needed `house` + `fromGraha` in Part 17. Mars is the one the chapter leaves
 * unstated: 70.24-27 says siblings are judged "from Mars's ashtakavarga" without naming a
 * house, so it is `null` here rather than assumed to be the 3rd.
 */
export const AV_MATTER_HOUSE: Partial<Record<Graha, House | null>> = {
  sun: 9,        // father (70.7-9)
  moon: 4,       // mother, home, dwelling place (70.21-23)
  mars: null,    // siblings — the chapter names no house (70.24-27)
  mercury: 4,    // family, maternal relatives, friends (70.28-29)
  jupiter: 5,    // learning, religious inclination, children (70.30-33)
  venus: 7,      // wealth, land, marriage (70.34-36)
  saturn: 8,     // longevity — computed, never surfaced (70.37-40)
};

export const MARS_HOUSE_UNSTATED =
  'BPHS 70.24-27 judges siblings from Mars’s ashtakavarga without naming a house. The 3rd '
  + 'is the obvious guess and is NOT assumed here — `AV_MATTER_HOUSE.mars` is null.';

// ── The trigger formula (70.7-9, restated at 21-23, 24-27, 41-42) ────────────

export const NAKSHATRA_COUNT = 27;
export const RASI_COUNT = 12;

export interface AvTrigger {
  /** Nakshatra index 0..26, Ashwini = 0. */
  nakshatra: number;
  /** Sign index 0..11, Aries = 0. */
  rasi: SignIndex;
  /** The trinal nakshatras — the 5th and 9th from it, which trigger the same matter. */
  trikonaNakshatras: number[];
  /** The trinal signs, likewise. */
  trikonaRasis: SignIndex[];
  /** The product before reduction, kept so the arithmetic is auditable. */
  product: number;
}

/**
 * The chapter's own way of turning a chart quantity into a time (70.7-9).
 *
 * Multiply the rekhas in the relevant house by that ashtakavarga's Yoga Pinda; the product
 * mod 27 names a nakshatra and mod 12 names a sign. **Saturn's transit through either — or
 * through their trines — is the trigger.**
 *
 * This is the single most transferable idea in Phase II: it converts a static count into a
 * dated event without a dasha, and the chapter applies it unchanged to five different
 * matters. Where a remainder is 0 the last item is meant (the 27th nakshatra, the 12th
 * sign), which is why the indices are taken as `(x - 1) mod n` rather than `x mod n`.
 */
export function avTrigger(rekhas: number, yogaPinda: number): AvTrigger {
  const product = rekhas * yogaPinda;
  const nakshatra = mod(product - 1, NAKSHATRA_COUNT);
  const rasi = mod(product - 1, RASI_COUNT) as SignIndex;
  return {
    product,
    nakshatra,
    rasi,
    trikonaNakshatras: [mod(nakshatra + 9, 27), mod(nakshatra + 18, 27)],
    trikonaRasis: [mod(rasi + 4, 12) as SignIndex, mod(rasi + 8, 12) as SignIndex],
  };
}

/** Saturn is the trigger for every one of the chapter's timing rules. */
export const TRIGGER_PLANET: Graha = 'saturn';

export const TRIGGER_FORMULA_NOTE =
  'BPHS 70 turns a bindu count into a date: rekhas x Yoga Pinda, mod 27 for a nakshatra '
  + 'and mod 12 for a rasi, activated by SATURN’s transit through that point or its '
  + 'trines. Applied unchanged to father, mother, siblings, family and the native — a '
  + 'general mechanism stated five times, not five separate rules.';

// ── 70.19-23, 43-44 — the quantitative transit rule ──────────────────────────

export type TransitVerdict = 'favourable' | 'neutral' | 'unfavourable';

/**
 * A transit through a sign is favourable in proportion to that sign's rekhas (70.19-23,
 * 43-44). Eight references means the midpoint is four.
 *
 * The chapter says only "more rekhas" and "more dots", so the boundary is ours: above four
 * is favourable, below four is not, exactly four is neither. Recorded as our choice rather
 * than the text's.
 */
export const TRANSIT_MIDPOINT = 4;

export function transitVerdict(rekhas: number): TransitVerdict {
  if (rekhas > TRANSIT_MIDPOINT) return 'favourable';
  if (rekhas < TRANSIT_MIDPOINT) return 'unfavourable';
  return 'neutral';
}

export const TRANSIT_THRESHOLD_IS_OURS =
  'BPHS 70 says only "more rekhas" and "more dots" without a number. Four of eight is the '
  + 'midpoint and is OUR boundary, not the text’s. Any calibration run should revisit it.';

/**
 * 70.19-23 is an ELECTIONAL rule, and the only one this corpus has produced so far:
 * undertake auspicious matters when the Sun or mean Jupiter transits a sign well marked in
 * the Sun's ashtakavarga, and avoid the poorly marked ones. The same for the Moon.
 *
 * Worth flagging because it answers "when should I do this" rather than "what will
 * happen" — a different question shape from anything in Phases I or II, and one the app
 * has no route for yet.
 */
export const ELECTION_RULE =
  'BPHS 70.19-23: undertake auspicious matters while the Sun or mean Jupiter transits a '
  + 'sign well marked in the SUN’s ashtakavarga, and avoid signs heavy with dots; likewise '
  + 'for the Moon’s transit read against the MOON’s ashtakavarga. Note it is the natal '
  + 'ashtakavarga of the transiting body that is consulted.';

// ── 70.30-33 — a count, not a quality ────────────────────────────────────────

/**
 * The number of children equals the rekhas in the 5th from Jupiter (70.30-33), unless
 * Jupiter occupies its sign of debilitation or an enemy's sign, in which case the count is
 * "very limited".
 *
 * Encoded because it is the chapter's clearest example of a rule producing a NUMBER rather
 * than a verdict — the thing Phase II exists to make possible. It is also, plainly, the
 * kind of claim that should be surfaced with heavy hedging or not at all; the standing
 * policy is not to make definite claims about children, so this returns a range and the
 * caller decides. The alternative reading the verse also offers (the navamsa number of the
 * 5th lord) is recorded but not implemented, since the text gives no way to choose.
 */
export function childrenIndication(
  rekhasIn5thFromJupiter: number, jupiterWeak: boolean,
): { indicated: number; band: 'limited' | 'moderate' | 'many'; caution: string } {
  const indicated = jupiterWeak ? Math.min(1, rekhasIn5thFromJupiter) : rekhasIn5thFromJupiter;
  const band = indicated <= 2 ? 'limited' : indicated <= 5 ? 'moderate' : 'many';
  return {
    indicated,
    band,
    caution: 'BPHS 70.30-33 states this as a count. It is an INDICATION, not a prediction, '
      + 'and the chapter offers a second incompatible method (the navamsa of the 5th lord) '
      + 'without a way to choose between them.',
  };
}

export const CHILDREN_SECOND_METHOD =
  'BPHS 70.33 also equates the number of children to the navamsa the lord of the 5th from '
  + 'Jupiter occupies. The two methods disagree in general and the text gives no rule for '
  + 'choosing. Not implemented.';

// ── Rules ────────────────────────────────────────────────────────────────────

/**
 * Chapter 70's effects, as `Rule` records — the first rules in the corpus whose conditions
 * are **thresholds on a quantity** rather than placements.
 *
 * They use the `bindus` predicate's Part 17 form: a house counted from a planet, read in
 * that planet's own ashtakavarga. That combination did not exist before this part.
 */
export function ashtakavargaEffectRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 70, verse });
  return [
    {
      id: 'bphs.70.030.children-supported',
      source: src('30-33'),
      when: [{ k: 'bindus', of: 'jupiter', house: 5, fromGraha: 'jupiter', op: '>=', n: 6 }],
      effect: {
        id: 'children.supported',
        domain: 'children',
        valence: 0.6,
        summary: 'Matters of children and learning are well supported.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'The threshold is ours; BPHS says only "larger in number". Raised from 5 to 6 '
        + 'by the Part 19 calibration: at 5 these rules fired for 38% of charts, which is '
        + 'background rather than a finding. At 6 they sit near 18%.',
    },
    {
      id: 'bphs.70.030.children-thin',
      source: src('30-33'),
      when: [{ k: 'bindus', of: 'jupiter', house: 5, fromGraha: 'jupiter', op: '<=', n: 2 }],
      effect: {
        id: 'children.thin',
        domain: 'children',
        valence: -0.4,
        summary: 'Matters of children and learning ask more effort than they return.',
      },
      weight: 0.4,
      verification: 'unverified',
      note: 'The text’s own phrasing is about happiness being "meagre". Restated as effort '
        + 'rather than deprivation, per the standing policy.',
    },
    {
      id: 'bphs.70.034.venus-gains',
      source: src('34-36'),
      when: [{ k: 'bindus', of: 'venus', house: 7, fromGraha: 'venus', op: '>=', n: 6 }],
      effect: {
        id: 'partnership.gains',
        domain: 'partnership',
        valence: 0.6,
        summary: 'Partnership, comfort and acquisition are favoured together.',
      },
      weight: 0.6,
      verification: 'unverified',
    },
    {
      id: 'bphs.70.028.mercury-circle',
      source: src('28-29'),
      when: [{ k: 'bindus', of: 'mercury', house: 4, fromGraha: 'mercury', op: '>=', n: 6 }],
      effect: {
        id: 'home.circle-supported',
        domain: 'home',
        valence: 0.5,
        summary: 'Family, friends and everyday dealings run smoothly.',
      },
      weight: 0.5,
      verification: 'unverified',
    },
  ];
}

// ── Never surfaced ───────────────────────────────────────────────────────────

/**
 * 70.37-44 reads longevity and the timing of death from the 8th from Saturn, using the
 * same trigger formula. It is computed where arbitration needs it and **never shown**,
 * under the standing constraint. The same applies to the chapter's clauses about the death
 * of the father (70.10-14) and mother (70.21-23).
 */
export const CH70_UNSURFACED = [
  '70.10-14 — death of the father, timed by Saturn’s transit of the trigger point',
  '70.21-23 — death of the mother, same mechanism',
  '70.24-27 — the clause on short-lived siblings when Mars is weak',
  '70.37-44 — longevity and the timing of death of the native, from the 8th from Saturn',
] as const;

export const CH70_NOT_ENCODED = {
  '15': 'A rule about the native taking over the father’s responsibilities, conditioned on '
    + 'the father’s own ascendant. Needs a second chart; no support for that yet.',
  '16-18': 'Effects of the dasha of the 4th lord on the father — belongs with the dasha '
    + 'material (Phase IV), not here.',
  '33b': CHILDREN_SECOND_METHOD,
} as const;

/** What Part 17 added to the predicate vocabulary, recorded for the retrofit register. */
/**
 * The first number in this programme changed by MEASUREMENT rather than by the text.
 *
 * Part 17 set the "many rekhas" threshold at 5 of 8 because chapter 70 names none. Part
 * 19's calibration measured what that actually selects: 38% of charts — above the 0.35
 * suppression line, which means the rule was describing most of humanity rather than a
 * person. At 6 of 8 it selects roughly 18%.
 *
 * The measurement is trustworthy here because a BAV cell is structurally Binomial(8, ~0.5)
 * — a count of eight independent contributions — so the synthetic population has the right
 * SHAPE even though its placements are uniform. It would NOT be trustworthy for a rule
 * about, say, Mercury's distance from the Sun.
 */
export const THRESHOLD_RAISED_BY_CALIBRATION =
  'The ch 70 bindu thresholds were raised from 5 of 8 to 6 of 8 by the Part 19 '
  + 'calibration — at 5 they fired for 38% of charts, which BASE_RATE_SUPPRESS exists to '
  + 'catch. This is the first number in the programme set by measurement rather than by '
  + 'the source, and it is still ours, not the text’s.';

export const PREDICATE_EXTENSION_NOTE =
  'The `bindus` predicate previously read only the SAV, addressed by absolute sign. '
  + 'Chapter 70 needs a NAMED planet’s BAV, addressed by a house counted FROM a planet. '
  + '`of`, `house` and `fromGraha` were added; omitting them preserves the old meaning '
  + 'exactly, so no rule written before Part 17 changed.';
