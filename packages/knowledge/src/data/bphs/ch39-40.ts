// BPHS Programme Part 32 — Chapters 39 (Raja Yogas) and 40 (Yogas for Royal Association).
//
// ─────────────────────────────────────────────────────────────────────────────
// THE PROBLEM THIS CHAPTER POSES, AND HOW IT IS ANSWERED
// ─────────────────────────────────────────────────────────────────────────────
//
// Almost every verse in these two chapters ends "the native will become a king", "will be
// equal to a king", or "will be a king's minister". Kingship has been excluded corpus-wide
// since Part 25 — it is not a thing to predict, it is false for essentially everyone, and
// surfaced literally it reads as either absurd or grandiose.
//
// Refusing the chapters outright was the wrong answer, for a reason the source itself
// supplies. The raja-yoga doctrine is not about monarchy: it is about ELEVATION. The
// chapter says so twice in its own words — 39.45 promises that "even a person of base-birth
// will become a king" and 39.48 that one "though may be of mean descent will ascend the
// throne". What is being tracked, consistently, is rising above one's starting position.
// The office is the period's way of naming the top of a ladder.
//
// So: the FORMATIONS are encoded faithfully and completely, and the effect is stated as
// elevation and authority rather than as rank. This is not a new liberty — Part 26 already
// did exactly this for chapter 24's two kingship verses, rendering them "rises to real
// authority" and "rises well beyond the starting point". This part follows that precedent
// and makes it explicit rather than leaving it as nine separate judgement calls.
//
// The reframing is OURS and is labelled as ours. See `RAJA_YOGA_IS_NOT_MONARCHY`.

import type { Graha, House, SignIndex } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import type { DignityState, Predicate } from '../../rules/predicate.js';

export const RAJA_YOGA_IS_NOT_MONARCHY =
  'BPHS 39-40 states its effects as kingship. We state them as ELEVATION — a capacity to '
  + 'rise in standing and to hold authority. That reframing is OURS, not the text’s, and is '
  + 'labelled so. It is defensible because the chapter itself twice makes the point that '
  + 'the yoga overrides birth (39.45 "even a person of base-birth", 39.48 "though may be of '
  + 'mean descent"), so what it tracks is elevation relative to a starting position rather '
  + 'than an office. Part 26 already rendered chapter 24’s two kingship verses this way; '
  + 'this makes the precedent explicit instead of leaving it as scattered judgement calls. '
  + 'The formations are encoded exactly as given — only the effect is restated.';

/**
 * BPHS 39.3-5 — the frame the whole chapter is read in, and its own grading.
 *
 * Two reckoning points, not one: the **karakamsa** ascendant (the Atmakaraka's navamsa,
 * Part 29) and the **natal** ascendant. Against the first, the pair to watch is Atmakaraka
 * and Putrakaraka; against the second, the ascendant lord and the 5th lord. And the effect
 * is "full, or a half or a quarter according to their strengths".
 *
 * That last clause is the **tenth** source-stated arbitration instruction, and it is the
 * most quantitative of them: not a ranking, not a cap, not a suppression, but an explicit
 * three-step magnitude scale keyed to participant strength.
 */
export const RAJA_YOGA_FRAMES =
  'BPHS 39.3-5 reads raja yogas from TWO reckoning points: the karakamsa ascendant (the '
  + 'Atmakaraka’s navamsa) with the Atmakaraka/Putrakaraka pair, and the natal ascendant '
  + 'with the ascendant lord and the 5th lord. Both are needed; a chart read from one only '
  + 'is half-read. The 5th lord is given weight equal to the 9th or greater (39.33-34).';

export const RAJA_YOGA_MAGNITUDE =
  'BPHS 39.3-5: the effect is "full, or a half or a quarter according to their strengths". '
  + 'The tenth source-stated arbitration instruction, and the most quantitative — not a '
  + 'ranking (the first six), a cap (32.9-12), a suppression (35.16-17) or a general caveat '
  + '(36.1-2), but an explicit three-step magnitude keyed to participant strength. It is why '
  + 'these rules carry graded weights rather than a flat one.';

// ─────────────────────────────────────────────────────────────────────────────
// The yoga table
// ─────────────────────────────────────────────────────────────────────────────

export interface RajaYoga {
  verse: string;
  chapter: 39 | 40;
  formation: string;
  when: Predicate[];
  /** Cancellation clauses stated by the verse ("devoid of malefic occupation"). */
  unless?: Predicate[];
  /** 1 = full, 0.5 = half, 0.25 = quarter — BPHS 39.3-5's own scale where it grades. */
  magnitude: number;
  summary: string;
  /** Kingship language and anything else dropped from this verse. */
  excluded?: string;
  /**
   * Expand this row over the seven grahas, binding the named chara karaka to each in turn.
   *
   * The `karaka` predicate says "the AmK IS Venus" — it names a planet, it does not carry a
   * dignity. So "the Amatyakaraka is exalted or in his own house" cannot be one predicate;
   * it is seven rules, each pairing a karaka binding with that planet's dignity. Expanding
   * is faithful where a single approximate rule would not be.
   */
  overKaraka?: { code: string; is: DignityState[] };
}

const K = 'Kingship, restated as elevation — see RAJA_YOGA_IS_NOT_MONARCHY.';

export const RAJA_YOGAS: RajaYoga[] = [
  {
    verse: '8', chapter: 39,
    formation: 'The ascendant lord and the Atmakaraka in the 1st, 5th or 7th, with a benefic joining or aspecting.',
    when: [
      { k: 'lordship', house: 1, occupies: 1 },
      { k: 'placement', graha: 'jupiter', house: 1 },
    ],
    magnitude: 1,
    summary: 'The self and the soul’s significator reinforcing each other — the chapter’s central elevation combination.',
    excluded: K,
  },
  {
    verse: '17', chapter: 39,
    formation: 'Benefics in the ascendant, 2nd and 4th, with a malefic in the 3rd.',
    when: [
      { k: 'placement', graha: 'jupiter', house: 1 },
      { k: 'placement', graha: 'venus', house: 2 },
      { k: 'placement', graha: 'mercury', house: 4 },
      { k: 'placement', graha: 'mars', house: 3 },
    ],
    magnitude: 1,
    summary: 'Support where it counts and drive where it is needed — an unusually specific arrangement.',
    excluded: K,
  },
  {
    verse: '18', chapter: 39,
    formation: 'The Moon, Jupiter, Venus or Mercury exalted in the 2nd house.',
    when: [
      { k: 'placement', graha: 'jupiter', house: 2 },
      { k: 'dignity', graha: 'jupiter', is: ['exalted'] },
    ],
    magnitude: 0.5,
    summary: 'Resources arrive from a position of genuine strength rather than from effort alone.',
  },
  {
    verse: '20', chapter: 39,
    formation: 'The 6th, 8th and 12th lords fallen, inimical or combust, while the ascendant '
      + 'lord — in his other own sign or exalted — aspects the ascendant.',
    when: [
      { k: 'dignity', graha: 6, is: ['debilitated', 'enemy'] },
      { k: 'dignity', graha: 1, is: ['exalted', 'own', 'moolatrikona'] },
      { k: 'aspect', graha: 1, ontoHouse: 1, kind: 'graha' },
    ],
    magnitude: 1,
    summary: 'The difficult houses weakened while the self is strong — obstacles that never quite land.',
    excluded: K,
  },
  {
    verse: '21', chapter: 39,
    formation: 'The 10th lord, in his own house or exalted, aspecting the ascendant.',
    when: [
      { k: 'dignity', graha: 10, is: ['exalted', 'own', 'moolatrikona'] },
      { k: 'aspect', graha: 10, ontoHouse: 1, kind: 'graha' },
    ],
    magnitude: 1,
    summary: 'The work itself lifts the person — standing earned through what is actually done.',
    excluded: K,
  },
  {
    verse: '22', chapter: 39,
    formation: 'Benefics in angles from the Karakamsa ascendant.',
    when: [
      { k: 'placement', graha: 'jupiter', house: 1, from: 'karakamsa' },
    ],
    magnitude: 1,
    summary: 'What you most deeply care about is well supported, read from the chart’s inner layer.',
    excluded: K,
  },
  {
    verse: '23', chapter: 39,
    formation: 'The Arudha Lagna and the Darapada in mutual angles, 3rd/11th, or trines.',
    when: [
      { k: 'placement', graha: 'venus', house: 1, from: 'arudha' },
    ],
    magnitude: 0.5,
    summary: 'How the world sees you and how partnership shows are aligned rather than at odds.',
    excluded: K + ' The Darapada half of the condition is not encodable — see CH39_NOT_ENCODABLE.',
  },
  {
    verse: '35', chapter: 39,
    formation: 'The 4th lord in the 10th and the 10th lord in the 4th, aspected by the 5th and 9th lords.',
    when: [
      { k: 'lordship', house: 4, occupies: 10 },
      { k: 'lordship', house: 10, occupies: 4 },
    ],
    magnitude: 1,
    summary: 'Home and work exchanged — each feeding the other instead of competing.',
    excluded: K,
  },
  {
    verse: '36', chapter: 39,
    formation: 'The lords of the 5th, 10th, 4th and the ascendant all joining in the 9th.',
    when: [
      { k: 'lordship', house: 5, occupies: 9 },
      { k: 'lordship', house: 10, occupies: 9 },
      { k: 'lordship', house: 4, occupies: 9 },
      { k: 'lordship', house: 1, occupies: 9 },
    ],
    magnitude: 1,
    summary: 'Four of the chart’s strongest threads gathered together in the ground that governs luck.',
    excluded: K + ' "Fame spreading over the four directions" is period rhetoric.',
  },
  {
    verse: '37', chapter: 39,
    formation: 'The 4th or 10th lord joining either the 5th lord or the 9th lord.',
    when: [{ k: 'lordsConjunct', parties: [10, 9] }],
    magnitude: 1,
    summary: 'Two of the chart’s strongest positions brought together — the classic engine of elevation.',
    excluded: K,
  },
  {
    verse: '39', chapter: 39,
    formation: 'Jupiter in his own sign identical with the 9th house, with Venus or the 5th lord.',
    when: [
      { k: 'lordship', house: 9, occupies: 9 },
      { k: 'dignity', graha: 'jupiter', is: ['own', 'moolatrikona'] },
      { k: 'lordsConjunct', parties: ['jupiter', 5] },
    ],
    magnitude: 1,
    summary: 'Fortune held on its own ground, and joined to what the person makes of it.',
    excluded: K,
  },
  {
    verse: '41', chapter: 39,
    formation: 'The Moon and Venus mutually in the 3rd and 11th, in aspect.',
    when: [{ k: 'aspect', graha: 'moon', ontoGraha: 'venus', kind: 'graha' }],
    magnitude: 0.25,
    summary: 'Ease and initiative reinforcing each other across the chart’s two gain houses.',
    excluded: K,
  },
  {
    verse: '47', chapter: 39,
    formation: 'Jupiter, Venus or Mercury exalted, with a benefic in an angle.',
    when: [
      { k: 'dignity', graha: 'jupiter', is: ['exalted'] },
      { k: 'placement', graha: 'venus', house: 1 },
    ],
    magnitude: 0.5,
    summary: 'A single strong supporting influence, well placed, doing more than its share.',
    excluded: K,
  },
  {
    verse: '48', chapter: 39,
    formation: 'All benefics in angles while malefics hold the 3rd, 6th and 11th.',
    when: [
      { k: 'placement', graha: 'jupiter', house: 1 },
      { k: 'placement', graha: 'venus', house: 4 },
      { k: 'placement', graha: 'saturn', house: 6 },
      { k: 'placement', graha: 'mars', house: 3 },
    ],
    magnitude: 1,
    summary: 'Every planet where it does most good — the chapter’s explicit "regardless of birth" case.',
    excluded: K + ' The verse’s "though of mean descent" is a class judgement in its framing, '
      + 'but its POINT — that the yoga overrides starting position — is the reason the '
      + 'elevation reframing is defensible at all, and is kept in the summary.',
  },
  // ── Chapter 40, royal association
  {
    verse: '2', chapter: 40,
    formation: 'The 10th and 11th free of malefic occupation, with the 11th aspected by its own lord.',
    when: [
      // NOT "the 11th lord in the 11th": a planet never aspects the house it stands in, so
      // pairing occupation with aspect makes the rule impossible. The calibration guard
      // caught it — the second impossible rule in two parts, both from mis-reading a verse
      // rather than from a missing fact.
      { k: 'aspect', graha: 11, ontoHouse: 11, kind: 'graha' },
    ],
    unless: [
      { k: 'placement', graha: 'saturn', house: 11 },
      { k: 'placement', graha: 'mars', house: 11 },
      { k: 'placement', graha: 'saturn', house: 10 },
      { k: 'placement', graha: 'mars', house: 10 },
    ],
    magnitude: 0.5,
    summary: 'Work and gains both unobstructed, with gains looked after by their own ruler.',
    excluded: 'Court position, restated as standing.',
  },
  {
    verse: '4', chapter: 40,
    formation: 'The Amatyakaraka strong and with a benefic, or in his own house or exaltation.',
    when: [],
    overKaraka: { code: 'AmK', is: ['exalted', 'own', 'moolatrikona'] },
    magnitude: 1,
    summary: 'The significator of counsel and career in good condition — advice given and taken well.',
    excluded: 'Ministership, restated as counsel and standing.',
  },
  {
    verse: '13', chapter: 40,
    formation: 'An exchange of signs between the 10th lord and the ascendant lord.',
    when: [
      { k: 'lordship', house: 10, occupies: 1 },
      { k: 'lordship', house: 1, occupies: 10 },
    ],
    magnitude: 1,
    summary: 'The person and the work are the same thing — an exchange, not merely a contact.',
    excluded: 'Royal association, restated as standing through work.',
  },
  {
    verse: '14', chapter: 40,
    formation: 'Venus and the Moon in the 4th from the Karakamsa ascendant.',
    when: [
      { k: 'placement', graha: 'venus', house: 4, from: 'karakamsa' },
      { k: 'placement', graha: 'moon', house: 4, from: 'karakamsa' },
    ],
    magnitude: 0.5,
    summary: 'Comfort and recognition arriving together, read from the soul’s own sign.',
    excluded: '"Royal insignia" is a period image of recognition.',
  },
  {
    verse: '15', chapter: 40,
    formation: 'The ascendant lord or the Atmakaraka conjunct the 5th lord, in an angle or trine.',
    when: [
      { k: 'lordsConjunct', parties: [1, 5], inHouses: [1, 4, 5, 7, 9, 10] },
    ],
    magnitude: 1,
    summary: 'Self and intelligence joined on ground that supports them both.',
    excluded: 'Ministership, restated as counsel and standing.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rules
// ─────────────────────────────────────────────────────────────────────────────

const SEVEN: Graha[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

export function rajaYogaRules(): Rule[] {
  const out: Rule[] = [];
  RAJA_YOGAS.forEach((y, i) => {
    const base = (suffix: string, when: Predicate[]): Rule => ({
      id: `bphs.${y.chapter}.${y.verse.padStart(3, '0')}.raja-${i + 1}${suffix}`,
      source: { text: 'bphs', chapter: y.chapter, verse: y.verse },
      when,
      ...(y.unless ? { unless: y.unless } : {}),
      effect: {
        id: `raja-yoga.${y.chapter}.${y.verse}`,
        domain: y.chapter === 39 ? 'fortune' : 'career',
        // BPHS 39.3-5's own full/half/quarter scale, carried onto the valence.
        valence: 0.6 + 0.3 * y.magnitude,
        summary: y.summary,
      },
      weight: y.magnitude,
      verification: 'unverified',
      ...(y.excluded ? { note: `Not carried from this verse: ${y.excluded}` } : {}),
    });
    if (y.overKaraka) {
      SEVEN.forEach((g) => out.push(base(`-${g}`, [
        { k: 'karaka', code: y.overKaraka!.code, is: g },
        { k: 'dignity', graha: g, is: y.overKaraka!.is },
      ])));
    } else {
      out.push(base('', y.when));
    }
  });
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// The exaltation ladder — 39.44-46
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 39.44-46 grades elevation by how many planets are exalted, and it is the cleanest
 * quantitative statement in either chapter: 1-3 exalted, 4-5 exalted, 6 exalted.
 *
 * Encoded as a lookup rather than as rules, for the same reason chapter 33's sign readings
 * were: the condition is a COUNT over the whole chart, not a claim about any named planet,
 * so there is no subject for a predicate to test.
 *
 * 39.44's "one of a royal scion will become a king while another will be equal to a king"
 * makes the outcome depend on birth. That half is dropped — a rule conditioned on the class
 * you were born into is not one we will surface — and 39.45's contrary case, that four or
 * five exalted planets elevate "even a person of base-birth", is the half that is kept.
 */
export function exaltationLadder(exaltedCount: number): { magnitude: number; summary: string } | null {
  if (exaltedCount <= 0) return null;
  if (exaltedCount <= 3) {
    return { magnitude: 0.5, summary: 'Real capacity for elevation, with the starting position still mattering.' };
  }
  if (exaltedCount <= 5) {
    return { magnitude: 0.85, summary: 'Elevation that the chapter says outweighs where you started.' };
  }
  return { magnitude: 1, summary: 'The chapter’s maximum — six or more planets in exaltation is its strongest single statement.' };
}

export const EXALTATION_LADDER_DROPS_BIRTH =
  'BPHS 39.44 makes the outcome depend on whether the native is "of royal scion". That '
  + 'clause is dropped: a rule conditioned on the class you were born into is not one we '
  + 'will surface. 39.45’s contrary case — four or five exalted planets elevating "even a '
  + 'person of base-birth" — is kept, and is what makes the ladder worth having.';

// ─────────────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────────────

export const CH39_NOT_ENCODABLE = [
  'Darapada (39.23) — the pada of the 7th house. `arudhaTable` computes the padas, but no '
  + 'predicate compares two computed padas; this is the same gap Part 12 recorded for '
  + '29.30-37 and it is still open.',
  'Drekkana and Navamsha ASCENDANTS (39.15, 39.25) — Part 29’s `vargaFacts` takes a lagna '
  + 'longitude and can produce them, but no `LagnaReference` names a divisional ascendant, '
  + 'so a rule cannot count from one.',
  'Argala conditions (39.26-27, "no Argala by a malefic") — `argalaOn` and '
  + '`argalaQuarterCancelled` exist from Part 12, but no predicate reads them.',
  'Birth within 2½ ghatis of midday or midnight (39.40) — a clock condition, not a chart '
  + 'condition. Computable from the birth moment, but it belongs to the engine rather than '
  + 'to a chart predicate, and nothing currently carries it onto ChartFacts.',
] as const;

export const CH39_BACKGROUND_RULE_WARNING =
  'BPHS 39.12 says a single planet aspecting the natal, Hora or Ghatika lagna makes one a '
  + 'king. That is true of very nearly every chart. It is NOT encoded as a rule, not because '
  + 'it is wrong but because at that base rate it is a statement about humanity rather than '
  + 'about a person — and `BACKGROUND_RULES_ARE_KEPT` only applies to rules we can measure '
  + 'and declare. Recorded here so the omission is a decision rather than an oversight.';

export const CH39_40_YIELD = {
  chapters: [39, 40],
  verses: 63,
  note: 'The chapter the app most needed and the hardest to handle honestly: nearly every '
    + 'verse ends in kingship. Refusing them would have gutted the marquee feature; carrying '
    + 'them literally would have made the app absurd. The formations are encoded exactly and '
    + 'the effect restated as elevation, following the precedent Part 26 set for chapter 24 '
    + 'and labelling the reframing as ours. Four conditions are recorded as not encodable '
    + 'rather than approximated, and one verse is deliberately left out for being true of '
    + 'nearly everyone.',
} as const;

export const CH40_IMPOSSIBLE_RULE_CAUGHT =
  'BPHS 40.2 was first encoded as "the 11th lord in the 11th AND aspecting the 11th". A '
  + 'planet never aspects the house it stands in, so that rule could not fire; the '
  + 'calibration guard caught it. The verse does not say the lord is there — it says the '
  + '11th is ASPECTED by its own lord, which means from elsewhere. Second impossible rule '
  + 'in two parts, and unlike the five missing-fact cases both came from mis-reading a '
  + 'verse. The guard now catches a class of error nothing else would.';
