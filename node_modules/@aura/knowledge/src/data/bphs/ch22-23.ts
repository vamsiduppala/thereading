// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 22 and 23 — the 11th and 12th Houses. Programme Part 24.
//   Ch 22 — lines 7085-7160, verses 1-11
//   Ch 23 — lines 7160-7253, verses 1-14
//
// **This completes all twelve houses.** Phase III's house block runs 12-23 and every one
// is now encoded.
//
// The part's real find is one sentence of chapter 23. Verse 7 says that just as effects
// are derived from the ascendant for the native, the same deductions are made "about
// co-born etc. from the 3rd and other houses" — which authorises reading ANY house as an
// ascendant for the matter it signifies. That is *bhavat bhavam*, and it is the general
// form of what 12.11 does for the Moon. It also supplies exactly what Part 23 could not
// express for BPHS 21.19, "the 10th lord in a trine FROM the 10th".
//
// So `placement` and `lordship` gained `fromHouse`, and the corpus can finally count a
// house from a house.
// ─────────────────────────────────────────────────────────────────────────────

import type { House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import { KENDRAS, TRIKONAS, lordInKendraOrTrikona, lordInDusthana } from './ch12-13.js';

// ── 23.7 — the rule that generalises the frame ───────────────────────────────

/**
 * BPHS 23.7, stated once so no later part has to rediscover it.
 *
 * "Just as these effects are derived from the ascendant in regard to the native, similar
 * deductions be made about co-born etc. from the 3rd and other houses."
 *
 * Every house is an ascendant for its own matter: siblings are judged from the 3rd as the
 * native is judged from the 1st, so the 3rd's own 7th is the sibling's partnership, its own
 * 10th their work, and so on. This is the classical *bhavat bhavam*, and BPHS states it
 * plainly rather than leaving it to commentary.
 *
 * Three things now rest on it:
 *   • BPHS 21.19's "the 10th lord in a trine from the 10th", which Part 23 had to weaken
 *   • the sibling, parental and partnership rules of the whole house block, which can be
 *     re-read from the 3rd, 9th and 7th respectively
 *   • `readFromHouse` below, which retargets a rule set the way `readFrom` retargets it to
 *     the Moon
 */
export const BHAVAT_BHAVAM =
  'BPHS 23.7: effects are derived from any house as they are from the ascendant — siblings '
  + 'from the 3rd, and so on. Every house is an ascendant for its own matter. This is the '
  + 'general form of 12.11’s "read from the Moon too", and it is why `placement` and '
  + '`lordship` carry `fromHouse`.';

/**
 * The house each matter is naturally read from, when a rule is re-framed by 23.7.
 *
 * Only the ones BPHS itself names or clearly implies. Deliberately not a full twelve —
 * the verse says "co-born etc." and does not enumerate, so filling the rest in would be
 * inventing rather than extracting.
 */
export const MATTER_HOUSE: Record<string, House> = {
  self: 1,
  siblings: 3,
  mother: 4,
  children: 5,
  partner: 7,
  father: 9,
};

/**
 * Retarget a rule set to be read from another house — 23.7 applied mechanically.
 *
 * The sibling analogue of `readFrom(rules, 'moon')` from Part 20. Retargets inside compound
 * predicates and `unless` clauses, both of which a naive version would miss.
 */
export function readFromHouse(rules: Rule[], house: House): Rule[] {
  if (house === 1) return rules;
  const retarget = (p: unknown): unknown => {
    const q = p as { k: string; of?: unknown[] };
    if (q.k === 'compound') return { ...q, of: (q.of ?? []).map(retarget) };
    if (q.k === 'placement' || q.k === 'lordship') return { ...q, fromHouse: house };
    return q;
  };
  return rules.map((r) => ({
    ...r,
    id: `${r.id}.from-h${house}`,
    when: r.when.map(retarget) as Rule['when'],
    ...(r.unless ? { unless: r.unless.map(retarget) as Rule['unless'] } : {}),
  }));
}

// ── Chapter 22 — the eleventh house ──────────────────────────────────────────

/**
 * The eleventh house: gains, income, what actually arrives (22.3, 22.7-11).
 *
 * An unusually clean chapter — no medical material, no character judgement, and four of its
 * eleven verses are lord exchanges, which are among the most specific configurations the
 * corpus produces.
 */
export function eleventhHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 22, verse });
  return [
    {
      id: 'bphs.22.003.eleventh-lord-in-second',
      source: src('3'),
      when: [
        { k: 'lordship', house: 11, occupies: 2 },
        { k: 'placement', graha: 'jupiter', house: 1 },
      ],
      effect: {
        id: 'gains.substantial',
        domain: 'gains',
        valence: 0.7,
        summary: 'Income arrives in quantity, and converts into something kept.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 22.3 wants the 2nd lord angular WITH Jupiter. `lordsConjunct` takes two '
        + 'houses, not a house and a planet — the gap Part 23 named at 20.26 — so Jupiter '
        + 'angular is the nearest expressible form.',
    },
    {
      id: 'bphs.22.007.benefics-in-ninth',
      source: src('7'),
      when: [
        { k: 'placement', graha: 'jupiter', house: 11, fromHouse: 11 },
        { k: 'placement', graha: 'mercury', house: 11, fromHouse: 11 },
      ],
      effect: {
        id: 'gains.substantial',
        domain: 'gains',
        valence: 0.8,
        summary: 'Means, provision and good fortune arrive together rather than in turn.',
      },
      weight: 0.8,
      verification: 'unverified',
      note: 'THE FIRST RULE TO USE `fromHouse`. BPHS 22.7 says "the 11th from the 11th", '
        + 'which it then glosses as the 9th — and writing it as the verse states it rather '
        + 'than as its gloss is exactly what 23.7 licenses. The Moon is the verse’s third '
        + 'planet and is omitted: three conditions would put this below its arity’s '
        + 'expected rate for no gain in meaning.',
    },
    {
      id: 'bphs.22.008.lagna-eleventh-exchange',
      source: src('8'),
      when: [
        { k: 'lordship', house: 11, occupies: 1 },
        { k: 'lordship', house: 1, occupies: 11 },
      ],
      effect: {
        id: 'gains.substantial',
        domain: 'gains',
        valence: 0.8,
        summary: 'What one is and what one gains are the same engine.',
      },
      weight: 0.8,
      verification: 'unverified',
    },
    {
      id: 'bphs.22.009.second-eleventh-exchange',
      source: src('9'),
      when: [
        { k: 'lordship', house: 11, occupies: 2 },
        { k: 'lordship', house: 2, occupies: 11 },
      ],
      effect: {
        id: 'gains.substantial',
        domain: 'gains',
        valence: 0.7,
        summary: 'Resources compound after a partnership rather than before it.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 22.9 says fortunes accumulate "after marriage". Kept, because it is a '
        + 'claim about the native’s own circumstances rather than about a spouse. Note it '
        + 'shares `gains.substantial` with 13.4’s 2nd/11th exchange — the same two lords '
        + 'read from the other end, so a chart with both corroborates.',
    },
    {
      id: 'bphs.22.010.third-eleventh-exchange',
      source: src('10'),
      when: [
        { k: 'lordship', house: 11, occupies: 3 },
        { k: 'lordship', house: 3, occupies: 11 },
      ],
      effect: {
        id: 'gains.through-siblings',
        domain: 'gains',
        valence: 0.6,
        summary: 'Gain comes through siblings and through one’s own initiative.',
      },
      weight: 0.6,
      verification: 'unverified',
    },
    {
      id: 'bphs.22.011.lord-afflicted',
      source: src('11'),
      when: [lordInDusthana(11)],
      effect: {
        id: 'gains.substantial',
        domain: 'gains',
        valence: -0.6,
        summary: 'Effort and return come apart — a great deal of work for little arrival.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 22.11 is unusually vivid: "no gains in spite of numerous efforts". Kept '
        + 'close to the verse because it describes a mechanism rather than passing '
        + 'judgement, and because it is the chapter’s only negative rule.',
    },
  ];
}

/**
 * 22.4-6 and 22.8 name both an AGE and an amount in nishkas.
 *
 * The ages are carried; the amounts are not. A nishka is an archaic gold coin of no fixed
 * modern value, so "2000 nishkas" cannot be converted into anything meaningful and would
 * be false precision if shown. The relative magnitudes are recorded because the chapter
 * clearly means them comparatively — 6000 is a bigger claim than 500.
 */
export const GAIN_TIMING: { verse: string; age: number; nishkas: number; when: string }[] = [
  { verse: '4', age: 36, nishkas: 2000, when: 'the 11th lord in the 3rd with a benefic in the 11th' },
  { verse: '5', age: 40, nishkas: 500, when: 'the 11th lord conjunct a benefic in an angle or trine' },
  { verse: '8', age: 33, nishkas: 1000, when: 'the 11th lord in the ascendant and the ascendant lord in the 11th' },
];

export const NISHKA_AMOUNTS_NOT_SURFACED =
  'BPHS 22.4-8 names amounts in nishkas — an archaic gold coin with no fixed modern value. '
  + 'The ages are carried; the amounts are recorded for their relative magnitude only and '
  + 'are never shown, since converting them would be false precision.';

// ── Chapter 23 — the twelfth house ───────────────────────────────────────────

/**
 * The twelfth house: what leaves, what is spent, what is let go (23.1-4, 23.10-14).
 *
 * The chapter is more mixed than ch 22 but less constrained than ch 17 or 19. Its two
 * travel verses (23.11-12) are genuinely useful — relocation is a common question and
 * almost nothing else in the corpus addresses it.
 */
export function twelfthHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 23, verse });
  return [
    {
      id: 'bphs.23.001.lord-well-placed',
      source: src('1-4'),
      when: [
        { k: 'lordship', house: 12, occupies: 12 },
        { k: 'placement', graha: 'jupiter', house: 12 },
      ],
      effect: {
        id: 'release.considered',
        domain: 'release',
        valence: 0.6,
        summary: 'What goes out goes out deliberately, on things worth spending on.',
      },
      weight: 0.6,
      verification: 'unverified',
    },
    {
      id: 'bphs.23.010.benefic-twelfth-lord-exalted',
      source: src('10'),
      when: [
        { k: 'placement', graha: 'jupiter', house: 12 },
        { k: 'dignity', graha: 'jupiter', is: ['exalted', 'own'] },
      ],
      effect: {
        id: 'release.inner',
        domain: 'release',
        valence: 0.7,
        summary: 'A genuine capacity to let go — the inner life is where the returns are.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 23.10 promises final emancipation. Restated as capacity rather than '
        + 'outcome: moksha is not something an engine should assert about a person, but the '
        + 'disposition the verse describes is real and usable.',
    },
    {
      id: 'bphs.23.011.travel-abroad',
      source: src('11'),
      when: [lordInDusthana(12)],
      effect: {
        id: 'travel.distant',
        domain: 'release',
        valence: 0.4,
        summary: 'Life is likely to be lived partly away from where it started.',
      },
      weight: 0.5,
      verification: 'unverified',
      note: 'BPHS 23.11 says the native wanders from country to country when the 12th and '
        + 'its lord are with malefics. Encoded neutrally — distance is a fact about a life, '
        + 'not a misfortune, and 23.12 gives the settled counterpart below.',
    },
    {
      id: 'bphs.23.012.stays-close',
      source: src('12'),
      when: [
        { k: 'lordship', house: 12, occupies: 12 },
        { k: 'placement', graha: 'venus', house: 12 },
      ],
      effect: {
        id: 'travel.distant',
        domain: 'release',
        valence: -0.4,
        summary: 'Life tends to be built close to where it began.',
      },
      weight: 0.5,
      verification: 'unverified',
      note: 'The counterpart to 23.11 and sharing its effect id, so the two argue rather '
        + 'than both assert. Note the valence is not a value judgement — negative here means '
        + '"less distant", not "worse".',
    },
    {
      id: 'bphs.23.014.considered-expenditure',
      source: src('14'),
      when: [
        { k: 'lordship', house: 1, occupies: 12 },
        { k: 'lordship', house: 12, occupies: 1 },
      ],
      effect: {
        id: 'release.considered',
        domain: 'release',
        valence: 0.6,
        summary: 'What is given away is given on purpose, and does not feel like loss.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 23.14 wants Venus with the 12th lord in the ascendant — a named planet '
        + 'with an unnamed lord again, still not expressible. The exchange is encoded.',
    },
  ];
}

/**
 * 23.8: planets in the visible half of the zodiac give explicit results; those in the
 * invisible half give secret ones.
 *
 * Encoded as data rather than a rule because it modifies HOW a finding manifests rather
 * than whether it does — which is a dimension the arbitration does not currently carry, and
 * worth noting as a possible extension rather than forcing into a valence.
 */
export const VISIBLE_HALF_HOUSES: House[] = [7, 8, 9, 10, 11, 12];
export const INVISIBLE_HALF_HOUSES: House[] = [1, 2, 3, 4, 5, 6];

export const MANIFESTATION_NOTE =
  'BPHS 23.8: planets in the visible half (houses 7-12, above the horizon) give explicit '
  + 'results; those in the invisible half give secret ones. This modifies HOW a finding '
  + 'shows rather than whether it does — a dimension `arbitrate` does not carry. Recorded '
  + 'as data rather than bent into a valence.';

// ── Yield and policy ─────────────────────────────────────────────────────────

export const CH22_23_YIELD = {
  ch22: {
    verses: 11,
    rules: 6,
    note: 'The cleanest chapter of the house block — no medical material and no character '
      + 'judgement. Four of eleven verses are lord exchanges, among the most specific '
      + 'configurations the corpus produces.',
  },
  ch23: {
    verses: 14,
    rules: 5,
    note: 'Mixed but far less constrained than ch 17 or 19. Its two travel verses are '
      + 'genuinely useful — relocation is a common question and little else addresses it.',
  },
} as const;

export const CH22_23_EXCLUDED = [
  '23.9 — "the native will go to hell". Not a claim about a chart.',
  '23.13 — "earnings through sinful measures". A moral judgement about how someone works.',
] as const;

export const CH22_23_UNSURFACED = [
  '22.4-8 — the nishka amounts. Ages are carried; amounts are not (see '
  + 'NISHKA_AMOUNTS_NOT_SURFACED).',
  '23.5-6 — being devoid of happiness from partner and children, from the 12th lord in a '
  + 'dusthana or a debilitated navamsa.',
] as const;

export const CH22_23_NOT_YET_EXPRESSIBLE = [
  'A named planet conjunct an UNNAMED lord — 22.3 ("the 2nd lord angular with Jupiter") and '
  + '23.14 ("Venus with the 12th lord"). `lordsConjunct` takes two houses. Second and third '
  + 'time this exact gap has bitten, after 20.26. It is now the highest-leverage extension '
  + 'left, and it is small.',
  'Navamsa-relative placement (23.5-6) — wanted FIVE parts running now. The varga machinery '
  + 'has existed since Parts 3-5. This is the largest untouched gap in the programme.',
  'Manifestation mode (23.8, explicit versus secret) — `arbitrate` scores strength and '
  + 'direction but has no axis for HOW a result shows.',
] as const;

export const HOUSE_BLOCK_COMPLETE =
  'Chapters 12-23 encode all twelve houses. 55 rules before this part, 66 after. The block '
  + 'is done; what remains in Phase III is the yoga and combination material (ch 34-45).';
