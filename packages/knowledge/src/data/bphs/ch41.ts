// BPHS Programme Part 33 — Chapter 41: Combinations for Wealth.
//
// This chapter does something no other has done so far: **it states its own
// generalisation.** Verses 2-8 give seven separate wealth combinations, and then the notes
// to verse 8 say outright that the formula behind all seven is "the 5th lord should be in
// the 5th while the 11th lord is in the 11th itself". The seven verses are an enumeration of
// the ascendants where that can be written with named planets — not seven different rules.
//
// So this module encodes the GENERAL rule once and records the enumeration beside it.
// Emitting seven near-duplicates would have inflated the registry, split one effect across
// seven ids, and made the chapter look less coherent than it is.
//
// It also closes a thread opened in Part 31. Chapter 36.38-39 attached effects to the
// ascendant lord's *divisional designations* (Parijatamsa, Gopuramsa, …) and was recorded as
// "a WIRING job, not an extraction one — Part 4 already computes those names". Chapter 41
// gives three more such tables (angular lord, 5th lord, 9th lord), which is the signal to
// stop deferring it. `AMSA_EFFECTS` wires all four.

import type { Graha, House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import type { Predicate } from '../../rules/predicate.js';

// ─────────────────────────────────────────────────────────────────────────────
// 41.2-8 — the chapter's own generalisation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The seven verses of the "great affluence" block, and the ascendants each names.
 *
 * Carried as data so the generalisation can be *checked* rather than asserted: the test
 * confirms that every row does in fact satisfy "5th lord in the 5th, 11th lord in the 11th",
 * which is what makes collapsing them to one rule legitimate.
 */
export interface AffluenceLagna { name: string; fifthLord: Graha; eleventhLord: Graha }

export interface AffluenceVerse {
  verse: string;
  /** The ascendants the chapter's notes name, each with ITS OWN two lords. */
  lagnas: AffluenceLagna[];
  /** Planets the verse adds beyond the two lords, if any. */
  extra?: Graha[];
}

export const AFFLUENCE_VERSES: AffluenceVerse[] = [
  { verse: '2', lagnas: [
    { name: 'Capricorn', fifthLord: 'venus', eleventhLord: 'mars' },
    { name: 'Gemini', fifthLord: 'venus', eleventhLord: 'mars' },
  ] },
  { verse: '3', lagnas: [
    { name: 'Aquarius', fifthLord: 'mercury', eleventhLord: 'jupiter' },
    { name: 'Taurus', fifthLord: 'mercury', eleventhLord: 'jupiter' },
  ], extra: ['moon', 'mars'] },
  { verse: '4', lagnas: [
    { name: 'Aries', fifthLord: 'sun', eleventhLord: 'saturn' },
  ], extra: ['moon', 'jupiter'] },
  // The odd one out — see AFFLUENCE_VERSE_5_IS_TWO_CASES.
  { verse: '5', lagnas: [
    { name: 'Virgo', fifthLord: 'saturn', eleventhLord: 'moon' },
    { name: 'Libra', fifthLord: 'saturn', eleventhLord: 'sun' },
  ] },
  { verse: '6', lagnas: [
    { name: 'Leo', fifthLord: 'jupiter', eleventhLord: 'mercury' },
    { name: 'Scorpio', fifthLord: 'jupiter', eleventhLord: 'mercury' },
  ] },
  { verse: '7', lagnas: [
    { name: 'Cancer', fifthLord: 'mars', eleventhLord: 'venus' },
    { name: 'Sagittarius', fifthLord: 'mars', eleventhLord: 'venus' },
  ] },
  { verse: '8', lagnas: [
    { name: 'Pisces', fifthLord: 'moon', eleventhLord: 'saturn' },
  ] },
];

/**
 * **Found by the test that checks the chapter's own generalisation.**
 *
 * Six of the seven verses pair two ascendants that share both lords — Capricorn and Gemini
 * both have Venus ruling the 5th and Mars the 11th, and so on. **Verse 5 does not.** Virgo
 * and Libra share Saturn as the 5th lord, but their 11th lords are the *Moon* and the *Sun*
 * respectively.
 *
 * That is why 41.5 names three planets ("the Sun and Moon in the 11th as Saturn is in the
 * 5th") where its siblings name two: it is covering **two different 11th lords in one
 * sentence**, not adding a third planet to a single combination.
 *
 * The first draft here recorded one `eleventhLord` per verse and got Libra wrong. The
 * generalisation test caught it — which is the whole reason that test exists, since the
 * collapse of seven verses into one rule stands on the claim being true.
 */
export const AFFLUENCE_VERSE_5_IS_TWO_CASES =
  'BPHS 41.5 names the Sun AND the Moon in the 11th because it covers two ascendants with '
  + 'DIFFERENT 11th lords — Virgo (Moon) and Libra (Sun) — not because it adds a third planet '
  + 'to one combination. Six of the seven verses pair ascendants that share both lords; this '
  + 'is the only one that does not. Caught by the test that verifies the chapter’s own '
  + 'generalisation, after a first draft recorded a single 11th lord for the verse.';

/**
 * The chapter's own words, at the notes to 41.8:
 *
 *   "from shlokas 2 to 8, the formula that stands for basic consideration is that the 5th
 *    lord should be in the 5th while the 11th lord is in the 11th itself."
 *
 * This is the first time in the corpus a chapter has enumerated instances and then named the
 * rule behind them. Encoding the rule rather than the instances is therefore not our
 * generalisation — it is the text's, and it covers the five ascendants the verses never got
 * round to naming.
 */
export const CH41_STATES_ITS_OWN_RULE =
  'BPHS 41.8 (notes) states the formula behind its own verses 2-8: the 5th lord in the 5th '
  + 'and the 11th lord in the 11th. The seven verses enumerate the ascendants where that can '
  + 'be written with named planets; they are not seven rules. We encode the general rule once '
  + 'and keep the enumeration as data so the collapse can be CHECKED. The only verse adding '
  + 'anything beyond the two lords is 41.3, which puts the Moon and Mars alongside Jupiter in '
  + 'the 11th — carried as a separate, stronger variant rather than folded in.';

// ─────────────────────────────────────────────────────────────────────────────
// 41.9-15 — the ascendant lord in its own sign, supported
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Seven verses, one per planet: the ascendant lord in its **own sign in the ascendant**,
 * conjunct or aspected by two named planets.
 *
 * Unlike 2-8 this block does NOT collapse — the supporting pair differs per planet and the
 * chapter never states a rule behind them. Enumerated because the source enumerates.
 */
export interface LagnaLordWealth { verse: string; graha: Graha; supporters: [Graha, Graha] }

export const LAGNA_LORD_WEALTH: LagnaLordWealth[] = [
  { verse: '9', graha: 'sun', supporters: ['mars', 'jupiter'] },
  { verse: '10', graha: 'moon', supporters: ['mercury', 'jupiter'] },
  { verse: '11', graha: 'mars', supporters: ['mercury', 'venus'] },
  { verse: '12', graha: 'mercury', supporters: ['saturn', 'jupiter'] },
  { verse: '13', graha: 'jupiter', supporters: ['mercury', 'mars'] },
  { verse: '14', graha: 'venus', supporters: ['saturn', 'mercury'] },
  { verse: '15', graha: 'saturn', supporters: ['mars', 'jupiter'] },
];

export const CH41_MARS_THIRD_SUPPORTER =
  'BPHS 41.11 names THREE supporters for Mars (Mercury, Venus and Saturn) where the other six '
  + 'verses name two. Only the first two are carried, so the block stays one shape and the '
  + 'arity stays comparable across the seven. Recorded rather than silently dropped.';

// ─────────────────────────────────────────────────────────────────────────────
// 41.16-17 — the trine lords, and the chapter's arbitration instruction
// ─────────────────────────────────────────────────────────────────────────────

export const TRINE_LORDS_GIVE_WEALTH =
  'BPHS 41.16: the 9th and 5th lords bestow wealth, and so does any planet conjunct one of '
  + 'them — "there is no doubt that these planets will give wealth during their DASHA '
  + 'periods". The dasha binding is the verse’s own and is what separates this from a '
  + 'standing claim: it names when, not just whether.';

/**
 * BPHS 41.17 — the **eleventh** place the corpus states its own precedence.
 *
 * "The yogas mentioned above should be delineated after knowing favourable/unfavourable
 * dispositions of the participant planets and their strength and weakness."
 *
 * It is 36.1-2's general caveat again, restated for a second chapter, which is itself worth
 * recording: the corpus does not state this once and assume it. It says it wherever a block
 * of flat declaratives might invite literal reading.
 */
export const CH41_DELINEATE_BY_STRENGTH =
  'BPHS 41.17: these yogas are to be delineated only after weighing the participants’ '
  + 'dispositions and their strength and weakness. The eleventh source-stated arbitration '
  + 'instruction, and the second that is explicitly GENERAL (after 36.1-2). Notable that the '
  + 'corpus repeats it rather than stating it once — it appears wherever a run of flat '
  + 'declaratives might invite a literal reading.';

// ─────────────────────────────────────────────────────────────────────────────
// 41.18-27 — the divisional designations finally get their effects
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What it means for a **named lord** to sit in a given Dasavarga designation.
 *
 * Part 4 computes the designation (`vargaDesignation`, `gradeVarga`); until now nothing
 * consumed it. Chapter 36.38-39 attached effects for the ascendant lord and Part 31 recorded
 * that as a wiring job; chapter 41 adds three more tables and this closes all four.
 *
 * Only the surfaceable half is carried. The 9th-lord table (41.23-27) is largely renunciate
 * and ritual — ascetics with cudgels, horse sacrifices, attaining the state of Indra — and
 * those rows are refused under the standing exclusion of ritual and devotional material.
 */
export interface AmsaEffect {
  designation: string;
  /** Which lord this row is about. */
  subject: 'angular' | 'fifth' | 'ninth';
  verse: string;
  surfaced: boolean;
  summary?: string;
  withheld?: string;
}

export const AMSA_EFFECTS: AmsaEffect[] = [
  // 41.18-19 — an angular lord
  { designation: 'Parijata', subject: 'angular', verse: '18', surfaced: true,
    summary: 'Open-handed with what there is.' },
  { designation: 'Uttama', subject: 'angular', verse: '18', surfaced: true,
    summary: 'Markedly generous — the chapter grades this above Parijata.' },
  { designation: 'Gopura', subject: 'angular', verse: '19', surfaced: true,
    summary: 'Means enough to be visible, and used visibly.' },
  { designation: 'Simhasana', subject: 'angular', verse: '19', surfaced: true,
    summary: 'Standing that others recognise without being told.' },
  // 41.20-22 — the 5th lord
  { designation: 'Parijata', subject: 'fifth', verse: '20', surfaced: true,
    summary: 'Learning that follows the family’s own line rather than departing from it.' },
  { designation: 'Uttama', subject: 'fifth', verse: '20', surfaced: true,
    summary: 'Excellent learning — the chapter’s own word.' },
  { designation: 'Gopura', subject: 'fifth', verse: '21', surfaced: true,
    summary: 'Recognition for what is known, reaching well past the immediate circle.' },
  { designation: 'Simhasana', subject: 'fifth', verse: '21', surfaced: true,
    summary: 'Counsel that carries weight; the verse says ministership.' },
  { designation: 'Paravata', subject: 'fifth', verse: '22', surfaced: true,
    summary: 'A turn toward the philosophical rather than the applied.' },
  { designation: 'Devaloka', subject: 'fifth', verse: '22', surfaced: true,
    summary: 'A doer rather than a contemplator — knowledge put to work.' },
  { designation: 'Brahmaloka', subject: 'fifth', verse: '22', surfaced: false,
    withheld: 'Devotional: "devoted to the Lord". Excluded under the standing ban on '
      + 'devotional and ritual material.' },
  // 41.23-27 — the 9th lord
  { designation: 'Parijata', subject: 'ninth', verse: '23', surfaced: true,
    summary: 'Drawn to travel with a purpose behind it.' },
  { designation: 'Uttama', subject: 'ninth', verse: '23', surfaced: false,
    withheld: 'The verse reads this as evidence of past births. A claim about a previous '
      + 'life is unfalsifiable in a way even this corpus’s other claims are not.' },
  { designation: 'Gopura', subject: 'ninth', verse: '24', surfaced: false,
    withheld: 'Sacrificial rites — ritual material.' },
  { designation: 'Simhasana', subject: 'ninth', verse: '24', surfaced: true,
    summary: 'Self-command, and truthfulness held as a discipline rather than a habit.' },
  { designation: 'Paravata', subject: 'ninth', verse: '25', surfaced: false,
    withheld: 'Asceticism as an outcome. Ch 79’s ascetic yogas are Part 47 and are '
      + 'handled there; a bare "greatest of ascetics" is a life verdict, not a reading.' },
  { designation: 'Devaloka', subject: 'ninth', verse: '26', surfaced: false,
    withheld: 'A specific mendicant order, with its staves. Ritual and period-specific.' },
  { designation: 'Brahmaloka', subject: 'ninth', verse: '27', surfaced: false,
    withheld: 'Horse sacrifice and attaining the state of Indra. Ritual and devotional.' },
];

export const AMSA_EFFECTS_CLOSE_A_THREAD =
  'Part 31 recorded ch 36.38-39 as "a WIRING job, not an extraction one" — Part 4 already '
  + 'computed the Dasavarga designations (Parijata, Uttama, Gopura, Simhasana, Paravata, '
  + 'Devaloka, Brahmaloka, Sakravahana, Sridhama) and nothing consumed them. Chapter 41 adds '
  + 'three more tables of the same shape, which is the signal to stop deferring. `AMSA_EFFECTS` '
  + 'now attaches effects to the designation for the angular, 5th and 9th lords. Note the '
  + 'alias: Santhanam says Sakravahana is popularly *Iravata*, which is the name ch 41 uses.';

// ─────────────────────────────────────────────────────────────────────────────
// 41.28 — and where it disagrees with chapter 34
// ─────────────────────────────────────────────────────────────────────────────

/** BPHS 41.28's five ways an angle lord and a trine lord relate. */
export const CH41_RAJA_RELATIONS = [
  'An exchange between the two lords',
  'Mutual aspect between them',
  'Conjunction of the two',
  'Mutual angular placement between them',
  'Mutual trinal placement between them',
] as const;

/**
 * Chapter 34.11-12 gave **six** relations for the same yoga; this gives **five**, and they
 * are not the same five.
 *
 * 41.28 lists **conjunction** as its own item, which 34.11-12 never does. 34.11-12 lists
 * "the trine lord in an angle" and "the angle lord in a trine" as two separate cases, which
 * 41.28 compresses into mutual placement. Neither list is a subset of the other, so the
 * usable rule is the **union**, and a reader comparing the two chapters will find a real
 * discrepancy rather than a transcription slip.
 */
export const RAJA_RELATIONS_DIVERGE =
  'BPHS 34.11-12 gives SIX ways an angle lord and a trine lord form a raja yoga; 41.28 gives '
  + 'FIVE, and neither list contains the other. 41.28 names CONJUNCTION as its own case, '
  + 'which 34.11-12 never does; 34.11-12 splits "trine lord in an angle" and "angle lord in a '
  + 'trine", which 41.28 compresses. The usable rule is the union of the two. Recorded '
  + 'because a reader checking one chapter against the other will find a real difference.';

export const VISHNU_AND_LAKSHMI_STHANAS =
  'BPHS 41.28 names the angles **Vishnu sthanas** and the trines **Lakshmi sthanas**, which '
  + 'is why their lords combining is the wealth yoga par excellence: sustenance meeting '
  + 'fortune. Carried as the chapter’s own rationale for a rule we already had, not as '
  + 'devotional material.';

// ─────────────────────────────────────────────────────────────────────────────
// Rules
// ─────────────────────────────────────────────────────────────────────────────

const R = (
  id: string, verse: string, when: Predicate[], summary: string, valence: number, weight: number,
  note?: string,
): Rule => ({
  id: `bphs.41.${verse.padStart(3, '0')}.${id}`,
  source: { text: 'bphs', chapter: 41, verse },
  when,
  effect: { id: `wealth.${id}`, domain: 'wealth', valence, summary },
  weight,
  verification: 'unverified',
  ...(note ? { note } : {}),
});

export function wealthRules(): Rule[] {
  const out: Rule[] = [];

  // 41.2-8, as the chapter's own single formula.
  out.push(R('trine-gain-lords-own-houses', '8', [
    { k: 'lordship', house: 5, occupies: 5 },
    { k: 'lordship', house: 11, occupies: 11 },
  ],
  'The house of what you make and the house of what comes back are each held by their own '
  + 'ruler — the chapter’s central wealth combination.',
  0.9, 0.9,
  'Encoded once as the formula BPHS 41.8 itself states, not as its seven enumerated cases.'));

  // 41.3's stronger variant, which adds two planets to the 11th.
  out.push(R('trine-gain-lords-reinforced', '3', [
    { k: 'lordship', house: 5, occupies: 5 },
    { k: 'lordship', house: 11, occupies: 11 },
    { k: 'placement', graha: 'moon', house: 11 },
    { k: 'placement', graha: 'mars', house: 11 },
  ],
  'The same combination with the 11th further reinforced — the chapter singles this out as '
  + 'the strongest of its wealth yogas.',
  0.95, 1,
  'BPHS 41.3 is the only verse of 2-8 adding anything beyond the two lords.'));

  // 41.9-15 — the ascendant lord in its own sign, supported by two named planets.
  for (const w of LAGNA_LORD_WEALTH) {
    out.push(R(`lagna-lord-${w.graha}`, w.verse, [
      { k: 'placement', graha: w.graha, house: 1 },
      { k: 'dignity', graha: w.graha, is: ['own', 'moolatrikona'] },
      { k: 'aspect', graha: w.supporters[0], ontoGraha: w.graha, kind: 'graha' },
      { k: 'aspect', graha: w.supporters[1], ontoGraha: w.graha, kind: 'graha' },
    ],
    'The ascendant lord strong in its own sign and supported — resources follow the person '
    + 'rather than having to be chased.',
    0.8, 0.8,
    w.graha === 'mars' ? CH41_MARS_THIRD_SUPPORTER : undefined));
  }

  // 41.16 — a planet conjunct the 5th or 9th lord becomes a wealth-giver in its own dasha.
  for (const h of [5, 9] as House[]) {
    out.push(R(`trine-lord-${h}-supported`, '16', [
      { k: 'lordsConjunct', parties: [h, 2] },
    ],
    'A trine lord joined to the house of resources — the chapter says this delivers in the '
    + 'participants’ own periods rather than at all times.',
    0.7, 0.7,
    TRINE_LORDS_GIVE_WEALTH));
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────────────

export const CH41_YIELD = {
  chapter: 41,
  verses: 28,
  note: 'The first chapter to state its OWN generalisation — 41.8’s notes name the '
    + 'formula behind verses 2-8, so seven verses become one rule plus a checked enumeration. '
    + 'It also closes Part 31’s deferred wiring: the Dasavarga designations Part 4 has '
    + 'computed since then finally have effects attached. 8 of the 19 amsa rows are refused '
    + '(ritual, devotional, and one past-life claim), almost all from the 9th-lord table.',
} as const;

export const CH41_NO_PROMISE_OF_RICHES =
  'Every verse here ends "the native will be wealthy" or "very affluent". Those are carried '
  + 'as a CAPACITY — resources following the person, means that hold — never as a promise of '
  + 'riches, which is exactly as unfalsifiable as ch 39’s promise of a throne and is '
  + 'handled the same way (see RAJA_YOGA_IS_NOT_MONARCHY). The formations are encoded '
  + 'unchanged; only the effect is restated, and the restatement is ours.';
