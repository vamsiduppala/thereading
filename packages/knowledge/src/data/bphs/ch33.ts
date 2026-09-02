// BPHS Programme Part 29 — Chapter 33: Effects of Karakamsa.
//
// The karakamsa is the NAVAMSA sign occupied by the Atmakaraka (33.1). Every rule in this
// chapter reads a D-9 position counted from that sign, which is why Part 29 opened by
// building the varga projection (`vargaFacts` / `karakamsaFacts` in compose.ts) rather than
// a new predicate kind.
//
// Two things make this chapter harder than its length suggests:
//
//  1. **It repeats itself, and disagrees with itself when it does.** Verses 36-45 and 77-92
//     cover the same 4th/5th-from-karakamsa ground twice. The second pass is not a copy —
//     it adds detail, and in one place it flatly contradicts the first. See
//     `CH33_SELF_CONTRADICTION`. Naive extraction would emit duplicate and conflicting rules.
//  2. **The surfaceable material is a minority, but it is a valuable minority.** What
//     survives is largely APTITUDE — writer, poet, logician, musician, mathematician,
//     machinist, agriculturist. That is real vocation signal, and the app has little of it.

import type { Graha, House, SignIndex } from '../../types.js';
import type { Rule } from '../../rules/rule.js';

// ─────────────────────────────────────────────────────────────────────────────
// 33.2-8 — the karakamsa in each sign
// ─────────────────────────────────────────────────────────────────────────────

export interface KarakamsaCell {
  /** The 12 signs (0 = Aries) for sign cells; the graha for planet cells. */
  key: string;
  verse: string;
  surfaced: boolean;
  summary?: string;
  valence?: number;
  withheld?: string;
}

export const KARAKAMSA_SIGNS: KarakamsaCell[] = [
  {
    key: 'aries', verse: '2', surfaced: false,
    withheld: 'Vermin nuisance. Not a life outcome in any sense the app can use, and the '
      + 'verse attaches it to a maraka, which is longevity material (Part 51).',
  },
  {
    key: 'taurus', verse: '3', surfaced: true, valence: 0.5,
    summary: 'Contentment that comes through animals and the land rather than through people.',
  },
  {
    key: 'gemini', verse: '3', surfaced: false,
    withheld: 'A skin-complaint claim. Medical, and excluded wherever it appears.',
  },
  {
    key: 'cancer', verse: '4', surfaced: false,
    withheld: 'Fear from water. A hazard prediction with no action attached — the shape of '
      + 'claim that reads as a warning about how you will be harmed.',
  },
  {
    key: 'leo', verse: '4', surfaced: false,
    withheld: 'Fear from predatory animals. Same hazard shape as Cancer.',
  },
  {
    key: 'virgo', verse: '5', surfaced: false,
    withheld: 'Skin complaint, corpulence and fire. Medical, plus a body-shape verdict.',
  },
  {
    key: 'libra', verse: '5', surfaced: true, valence: 0.6,
    summary: 'Aptitude for trade, and for skilled making — the verse names clothwork.',
  },
  {
    key: 'scorpio', verse: '6', surfaced: false,
    withheld: 'Snake danger plus an anatomical affliction of the mother. Hazard prediction '
      + 'and a third-party medical claim in one verse.',
  },
  {
    key: 'sagittarius', verse: '6', surfaced: false,
    withheld: 'Falls from height and from vehicles. An injury prediction.',
  },
  {
    key: 'capricorn', verse: '7', surfaced: true, valence: 0.5,
    summary: 'Gains arriving from the water and what comes out of it — the verse names pearl and coral.',
  },
  {
    key: 'aquarius', verse: '7', surfaced: true, valence: 0.5,
    summary: 'A builder of things that hold and serve others — the verse names water tanks.',
  },
  {
    key: 'pisces', verse: '8', surfaced: true, valence: 0.8,
    summary: 'The chapter’s one unambiguous spiritual placement: the drive is toward release rather than acquisition.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 33.13-18 — the planets in the karakamsa
// ─────────────────────────────────────────────────────────────────────────────

export const KARAKAMSA_PLANETS: KarakamsaCell[] = [
  {
    key: 'sun', verse: '13', surfaced: true, valence: 0.6,
    summary: 'Work that carries official standing — the verse says royal assignments.',
  },
  {
    key: 'moon', verse: '14', surfaced: true, valence: 0.7,
    summary: 'Scholarship held alongside real enjoyment of life, stronger still where ease and pleasure support it.',
  },
  {
    key: 'mars', verse: '15', surfaced: true, valence: 0.4,
    summary: 'Aptitude for work with fire and metal, and for transformative craft.',
  },
  {
    key: 'mercury', verse: '16', surfaced: true, valence: 0.7,
    summary: 'Skill in the arts and in trade together — capable, educated, quick.',
  },
  {
    key: 'jupiter', verse: '16', surfaced: true, valence: 0.8,
    summary: 'Right action and genuine learning; the drive is toward understanding rather than gain.',
  },
  {
    key: 'venus', verse: '17', surfaced: true, valence: 0.5,
    summary: 'A sensuous nature paired with a role in public affairs.',
    withheld: undefined,
  },
  {
    key: 'saturn', verse: '17', surfaced: true, valence: 0.2,
    summary: 'Livelihood follows the family’s own line rather than a path chosen against it.',
  },
  {
    key: 'rahu', verse: '18', surfaced: true, valence: 0.4,
    summary: 'Aptitude for machinery and for the medicine of toxins — technical work at the edges.',
  },
  {
    key: 'ketu', verse: '18', surfaced: false,
    withheld: 'The verse pairs dealing in elephants with calling the native a thief. The '
      + 'usable half is too thin to carry the character verdict, so the cell is refused.',
  },
];

/**
 * 33.17 promises Venus in the karakamsa "longevity of 100 years". Dropped from the Venus
 * summary above, not softened: a lifespan number is longevity material and belongs to
 * Part 51, which computes and never surfaces it. The rest of the verse is kept.
 */
export const CH33_VENUS_LIFESPAN_DROPPED =
  'BPHS 33.17 attaches a 100-year lifespan to Venus in the karakamsa. Dropped, not '
  + 'softened — a lifespan figure is longevity material (Part 51: compute, never surface). '
  + 'The rest of the verse is carried.';

// ─────────────────────────────────────────────────────────────────────────────
// 33.36-45, 77-92 — the vocation block: karakamsa and the 5th from it
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The aptitude table — the reason this chapter earns a part.
 *
 * BPHS 33.87-92 explicitly widens the 5th-from-karakamsa rules to "the 2nd/3rd from
 * Karakamsa and to the Karakamsa itself", so each row carries every house the chapter
 * licenses rather than the 5th alone. That widening is the source's own (`houses` below),
 * not our generalisation.
 */
export interface AptitudeCell {
  graha: Graha;
  /** Houses from the karakamsa where the chapter says this reading applies. */
  houses: House[];
  verse: string;
  aptitude: string;
  valence: number;
  /** Set where the two passes of the chapter say different things. */
  conflict?: string;
  excluded?: string;
}

export const KARAKAMSA_APTITUDES: AptitudeCell[] = [
  {
    graha: 'venus', houses: [1, 2, 3, 5], verse: '40',
    aptitude: 'Poetry and eloquence — language used for its beauty as much as its argument.',
    valence: 0.7,
  },
  {
    graha: 'jupiter', houses: [1, 2, 3, 5], verse: '42',
    aptitude: 'Wide learning and authorship, strongest in philosophy and scripture.',
    valence: 0.8,
    conflict: 'Verse 42 says expressly NOT an orator or a grammarian; verses 87-92 say he '
      + 'WILL be a grammarian. See CH33_SELF_CONTRADICTION — the summary carries neither claim.',
  },
  {
    graha: 'mars', houses: [1, 5], verse: '43',
    aptitude: 'Logic and judgement — the verses name both the logician and the magistrate.',
    valence: 0.6,
  },
  {
    graha: 'mercury', houses: [1, 2, 3, 5], verse: '43',
    aptitude: 'Aptitude for systematic analysis and formal method.',
    valence: 0.6,
  },
  {
    graha: 'sun', houses: [1, 5], verse: '44',
    aptitude: 'Music, and learning of the philosophical kind.',
    valence: 0.6,
  },
  {
    graha: 'moon', houses: [1, 5], verse: '44',
    aptitude: 'Rhetoric and singing, with a turn toward systematic philosophy.',
    valence: 0.6,
  },
  {
    graha: 'ketu', houses: [5], verse: '92',
    aptitude: 'Mathematics, and skill in astrology itself — inherited if Jupiter relates to it.',
    valence: 0.6,
  },
  {
    graha: 'rahu', houses: [5], verse: '45',
    aptitude: 'Aptitude for machinery and mechanism.',
    valence: 0.5,
    excluded: 'The same verse pairs Rahu with Ketu as "an astrologer"; Ketu carries that '
      + 'reading in its own row, so it is not duplicated here.',
  },
  {
    graha: 'saturn', houses: [1, 5], verse: '44',
    aptitude: 'Works better on the page and in private than in front of an assembly.',
    valence: 0.1,
    excluded: 'Both passes call this "dull-witted" / "ineffective in an assembly". The '
      + 'observation about setting is kept; the verdict on intelligence is not.',
  },
];

/**
 * 33.41-45 and 85-86 both grade authorship, and both grade it the same way: Jupiter with
 * the Moon is the strongest, Venus lesser, Mercury lesser still.
 *
 * Worth encoding as an ordering rather than three flat rules — the chapter is unusually
 * explicit that these are degrees of one thing, and an ordering is falsifiable in a way
 * three unrelated claims are not.
 */
export const AUTHORSHIP_GRADES: { combo: Graha[]; grade: number; summary: string }[] = [
  { combo: ['jupiter', 'moon'], grade: 3, summary: 'Writing across many fields, with range as the distinguishing mark.' },
  { combo: ['venus'], grade: 2, summary: 'Writing as a real but narrower capacity.' },
  { combo: ['mercury'], grade: 1, summary: 'Writing present as an aptitude rather than a defining one.' },
];

export const CH33_SELF_CONTRADICTION =
  'The chapter covers the 5th from karakamsa TWICE (verses 36-45, then 77-92) and the two '
  + 'passes disagree about Jupiter: verse 42 says he makes one "not an oratorian or a '
  + 'grammarian", 87-92 says he "will be further a grammarian". We carry neither claim and '
  + 'record the conflict. This is not an OCR fault — both readings are fully formed '
  + 'sentences — so it is a genuine inconsistency in the source, the first found in the '
  + 'BPHS corpus that is not a transcription error.';

export const CH33_REPEATS_ITSELF =
  'Verses 36-45 and 77-92 are two passes over the same 4th/5th-from-karakamsa material, and '
  + '85-86 repeats 41-45 on authorship. The second pass ADDS detail rather than copying, so '
  + 'neither can simply be dropped. Each aptitude is encoded once, citing the verse that '
  + 'states it most completely, with the widening at 87-92 applied via `houses`. Extracting '
  + 'pass-by-pass would have produced duplicate rules with different verse ids.';

// ─────────────────────────────────────────────────────────────────────────────
// The house block — 33.32, 33.46, 33.57-62
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The houses from karakamsa whose readings turn on benefic-versus-malefic rather than on a
 * named planet. The chapter states the 3rd and 6th as a matched pair (46: "the 3rd from
 * Karakamsa be also similarly considered").
 */
export interface PolarityCell {
  house: House;
  verse: string;
  benefic: string;
  malefic: string;
  surfaced: boolean;
  withheld?: string;
}

export const KARAKAMSA_POLARITY: PolarityCell[] = [
  {
    house: 3, verse: '32', surfaced: true,
    malefic: 'Courage that shows under pressure.',
    benefic: 'A cautious temperament that avoids confrontation.',
  },
  {
    house: 6, verse: '46', surfaced: true,
    malefic: 'Aptitude for working the land and for sustained physical effort.',
    benefic: 'Effort comes harder here; the drive has to be supplied rather than assumed.',
  },
  {
    house: 9, verse: '50', surfaced: true,
    benefic: 'Truthfulness, and respect for elders and for one’s own tradition.',
    malefic: 'Early conviction that does not hold its shape with age.',
  },
  {
    house: 10, verse: '57', surfaced: true,
    benefic: 'Settled resources and sound judgement in the work itself.',
    malefic: 'The profession takes the strain, and support from the father is thinner.',
  },
  {
    house: 11, verse: '61', surfaced: true,
    benefic: 'Gains arrive across undertakings, and siblings are a source of happiness.',
    malefic: 'Gains still arrive, and the reputation that comes with them is mixed.',
  },
  {
    house: 12, verse: '63', surfaced: true,
    benefic: 'Spending goes to things worth spending on; an empty 12th reads the same way.',
    malefic: 'Outgoings tend to leak toward what returns nothing.',
  },
  {
    house: 8, verse: '49', surfaced: false,
    benefic: '', malefic: '',
    withheld: 'The 8th from karakamsa is graded entirely by lifespan — long, reduced, or '
      + 'medium. Longevity is Part 51: computed, never surfaced.',
  },
  {
    house: 7, verse: '47', surfaced: false,
    benefic: '', malefic: '',
    withheld: 'Every clause describes the SPOUSE — appearance, age, temperament, health, '
      + 'prior marriage. Third-party claims about a person who is not the native, the same '
      + 'exclusion applied across chapter 24b’s 7th-lord rows.',
  },
  {
    house: 4, verse: '33', surfaced: false,
    benefic: '', malefic: '',
    withheld: 'The building-material readings (stone, brick, wood, grass by planet) are '
      + 'vivid but unfalsifiable in any modern setting, and the same verses carry the '
      + 'chapter’s densest medical block at 77-84. Refused as a unit.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rules
// ─────────────────────────────────────────────────────────────────────────────

const R = (
  id: string, verse: string, when: Rule['when'], effect: Rule['effect'], weight: number,
  note?: string,
): Rule => ({
  id,
  source: { text: 'bphs', chapter: 33, verse },
  when,
  effect,
  weight,
  verification: 'unverified',
  ...(note ? { note } : {}),
});

/**
 * The reading for the karakamsa sign itself (33.2-8).
 *
 * A lookup rather than a `Rule`, and deliberately so: these are keyed on the FRAME, not on
 * any planet's position, so there is no condition for a predicate to test. Encoding them
 * as a placement of some arbitrary planet in the 1st would have manufactured a condition
 * the verse does not contain — the rule would fire on the wrong evidence and its arity
 * would be a lie. Returns null for the five signs the chapter's claims are refused for.
 */
export function karakamsaSignReading(
  sign: SignIndex,
): { summary: string; valence: number; verse: string } | null {
  const c = KARAKAMSA_SIGNS[sign];
  if (!c || !c.surfaced) return null;
  return { summary: c.summary!, valence: c.valence!, verse: c.verse };
}

/**
 * Every rule here counts from `karakamsa` and therefore must be evaluated against
 * `karakamsaFacts(facts, atmakaraka)` — the navamsa chart with the karakamsa as its
 * reference. Run against a rasi chart the frame is absent and every rule returns false,
 * which is silence rather than a wrong answer, but it is also not an answer.
 */
export function karakamsaRules(): Rule[] {
  const out: Rule[] = [];

  for (const c of KARAKAMSA_PLANETS) {
    if (!c.surfaced) continue;
    out.push(R(
      `bphs.33.${c.verse.padStart(3, '0')}.${c.key}-in-karakamsa`,
      c.verse,
      [{ k: 'placement', graha: c.key as Graha, house: 1, from: 'karakamsa' }],
      { id: `karakamsa.planet.${c.key}`, domain: 'self', valence: c.valence!, summary: c.summary! },
      Math.min(1, Math.abs(c.valence!) + 0.2),
    ));
  }

  for (const a of KARAKAMSA_APTITUDES) {
    for (const h of a.houses) {
      out.push(R(
        `bphs.33.${a.verse.padStart(3, '0')}.${a.graha}-in-${h}-from-karakamsa`,
        a.verse,
        [{ k: 'placement', graha: a.graha, house: h, from: 'karakamsa' }],
        { id: `karakamsa.aptitude.${a.graha}`, domain: 'career', valence: a.valence, summary: a.aptitude },
        Math.min(1, Math.abs(a.valence) + 0.2),
        [a.conflict, a.excluded].filter(Boolean).join(' ') || undefined,
      ));
    }
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────────────

export const CH33_EXCLUSION_THEMES = [
  'Medical claims — leprosy, consumption, ulcers, dysentery. The chapter’s second pass '
  + '(77-84) is almost entirely this, and none of it is carried.',
  'Hazard predictions — fear from water, tigers, snakes, falls from height. Warnings about '
  + 'how the native will be harmed, with no action attached.',
  'Sexual and moral verdicts — repeated claims about "others’ wives" at 12, 30-31 and 56.',
  'Third-party claims — the entire 7th-from-karakamsa block describes the spouse, and the '
  + '9th includes the death of a female relative.',
  'Deity and ritual material — the 12th-from-karakamsa block (63-74) assigns a deity to '
  + 'worship by planet, and 75-76 gives mantra/tantra attainment. Project policy excludes '
  + 'remedial and devotional material; "mean deity" is also a slur.',
  'Longevity — the whole 8th-from-karakamsa reading, and Venus’s 100 years at 33.17.',
] as const;

export const CH33_YIELD = {
  chapter: 33,
  verses: 99,
  note: 'The highest-exclusion chapter after ch 25, and for a different reason: ch 25 was '
    + 'constrained by ANTHROPOLOGY, this one by medicine and hazard. What survives is '
    + 'unusually valuable though — the aptitude block (poet, logician, musician, '
    + 'mathematician, machinist, author) is real vocation signal, and the app had almost '
    + 'none. Two of the twelve karakamsa signs and the 4th, 7th and 8th houses from it are '
    + 'refused entirely.',
} as const;

/**
 * Why these rules are safe to register even though `syntheticCharts` builds rasi charts.
 *
 * The generator does not compute real navamsas. It does not need to: the base rate of
 * "Venus in the 5th from the karakamsa" is the rate at which one uniformly-placed body
 * falls in a given house of a uniformly-placed frame — 1/12 — and that is identical
 * whether the signs came from D-1 or D-9. What the generator must supply is the FRAME,
 * so the rules can fire at all; a synthetic karakamsa does that exactly.
 *
 * Stated explicitly because the honest alternative — pretending the generator makes real
 * navamsas — would be a lie that a later part would build on.
 */
export const CH33_CALIBRATION_NOTE =
  'These rules are calibrated against synthetic RASI charts carrying a synthetic karakamsa '
  + 'frame, not real navamsas. That is sound for base rates: "a planet in the Nth from a '
  + 'reference sign" has the same 1/12 distribution in any chart whose signs are uniform, '
  + 'so the generator only has to supply the frame, which it now does. It would NOT be '
  + 'sound for anything that depends on real D-9 geometry (varga dignity, vargottama), and '
  + 'no rule here does.';
