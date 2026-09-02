// BPHS Programme Part 38 — Chapters 47 and 48: where the rules meet the clock.
//
// This is the join the programme has been building toward since Part 20. Everything from
// Parts 20-33 says what a chart MEANS; everything from Parts 34-37 says WHEN a period runs.
// Chapter 48 keys an effect to the dasha lord's **house lordship**, so a static rule and a
// running period finally describe the same event.
//
// The DSL already had the piece needed for it — `{ k: 'dasha', level, lord }` has existed
// since Part 1 and its comment has said "binds static rules to timing" the whole time. This
// is the chapter that gives it something to bind.

import type { Graha, House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import type { Predicate } from '../../rules/predicate.js';

// ─────────────────────────────────────────────────────────────────────────────
// 47.2 — the chapter's own taxonomy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 47.2 divides dasha effects in two:
 *
 *   "There are two kinds of effects of Dasha — general and distinctive. The natural
 *    characteristics of the planets cause the general effects and the distinctive effects
 *    are realised by their placements etc."
 *
 * Worth encoding because it is the text drawing exactly the line the engine already draws:
 * the **general** half is the planet's nature (Part 1's `GRAHA_SIGNIFICATIONS`, naisargika
 * bala), and the **distinctive** half is everything the predicate DSL evaluates. A dasha
 * reading that gives only the general half is a horoscope; only the distinctive half is
 * where the chart actually speaks.
 */
export const DASHA_EFFECT_TAXONOMY =
  'BPHS 47.2: dasha effects are of two kinds — GENERAL, from the planet’s natural character, '
  + 'and DISTINCTIVE, from its placement. That is the same line the engine already draws '
  + 'between a graha’s significations and what the predicate DSL evaluates. A reading built '
  + 'only from the general half is a horoscope; the distinctive half is where a particular '
  + 'chart speaks.';

/**
 * The condition shape chapter 47 repeats for every planet, stated once rather than nine
 * times.
 *
 * For the Sun (47.7-11) the favourable list is: own sign, exaltation, a kendra, the 11th,
 * associated with the 9th or 10th lord, strong in its vargas. For the Moon (47.16-22) it is:
 * exaltation, own sign, a kendra, the 11th, 9th or 5th, aspected or joined by benefics, fully
 * powerful, associated with the 10th, 9th or 4th lord.
 *
 * The two lists differ in detail and agree in shape: **good house + good dignity +
 * association with a trine or angle lord**. That shape is encoded; the per-planet effect
 * prose is not — see `CH47_EFFECT_PROSE_NOT_CARRIED`.
 */
export const DASHA_FAVOURABLE_SHAPE =
  'Chapter 47 repeats one shape for every planet: the dasha lord in a good house, in good '
  + 'dignity, and associated with a trine or angle lord gives favourable results; the '
  + 'converse gives adverse ones. The per-planet lists differ in detail (the Sun’s adds the '
  + '9th/10th lord, the Moon’s the 10th/9th/4th) and agree in structure. The shape is '
  + 'encoded; the effect prose is not.';

export const CH47_EFFECT_PROSE_NOT_CARRIED =
  'Chapter 47’s bulk is per-planet effect prose — elephants, conveyances, agricultural '
  + 'products, exile, defamation — and most of it is either period-specific imagery or '
  + 'character verdict. What is carried is the CONDITION structure (47.2 and the repeated '
  + 'favourable/adverse shape), because that is what binds a static chart fact to a running '
  + 'period. Encoding nine lists of period furniture would have added length and no capability.';

// ─────────────────────────────────────────────────────────────────────────────
// 48.1 — condition outranks nature
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 48.1, stated as a general principle rather than about any one planet:
 *
 *   "an inauspicious planet in his sign of exaltation etc. will not produce unfavourable
 *    results if placed in an auspicious house, and a benefic being in his sign of
 *    debilitation and being posited in an inauspicious house will produce adverse effects."
 *
 * The **twelfth** place the corpus states its own precedence, and it is the sharpest of them
 * for this layer: **a planet's condition outranks its nature.** A malefic well-placed and
 * dignified does not deliver harm in its dasha; a benefic debilitated in a dusthana does.
 *
 * It is 36.1-2's caveat ("a yoga's name does not settle its effect") applied to periods
 * rather than to yogas, and it is the reason a dasha reading cannot be assembled from
 * benefic/malefic labels alone.
 */
export const CONDITION_OUTRANKS_NATURE =
  'BPHS 48.1: an inauspicious planet exalted and in an auspicious house will NOT give '
  + 'unfavourable results in its dasha, and a benefic debilitated in an inauspicious house '
  + 'WILL give adverse ones. The twelfth source-stated arbitration instruction, and the '
  + 'sharpest for the timing layer: **a planet’s condition outranks its nature.** It is '
  + '36.1-2’s caveat applied to periods rather than yogas, and it is why a dasha reading '
  + 'cannot be assembled from benefic/malefic labels alone.';

// ─────────────────────────────────────────────────────────────────────────────
// 48.2-8 — the twelve house lords
// ─────────────────────────────────────────────────────────────────────────────

export interface HouseLordDasha {
  house: House;
  verse: string;
  surfaced: boolean;
  summary?: string;
  valence?: number;
  /** Mortality or medical material dropped from this row. */
  excluded?: string;
  withheld?: string;
}

/**
 * What each house lord's dasha brings (48.2-8).
 *
 * Four rows carry death claims — the 2nd, 7th and 8th name it directly and the chapter's own
 * Notes call the 2nd and 7th the **maraka houses**. Those halves are dropped.
 *
 * The Notes then do something unusually helpful: they supply the alternative reading
 * themselves. "The 2nd house is called the house of wealth. There will definitely be gains of
 * wealth during the Dasha of the lord of the 2nd if he is well placed… Similarly the 7th
 * house indicates marriage amongst other things. If the lord of the 7th is well placed, there
 * will be auspicious celebrations during his Dasha."
 *
 * So the 2nd and 7th are **surfaced on the chapter's own alternative**, conditioned on the
 * lord being well placed — not softened by us, replaced by the text.
 */
export const HOUSE_LORD_DASHA: HouseLordDasha[] = [
  {
    house: 1, verse: '2-4', surfaced: true, valence: 0.7,
    summary: 'A period that agrees with you — vitality and physical wellbeing hold up.',
  },
  {
    house: 2, verse: '2-4', surfaced: true, valence: 0.5,
    summary: 'Resources come to the fore, and what governs them is well placed — so it reads as a period of gain.',
    excluded: 'The verse pairs this with "distress and possibility of death" — the 2nd is a '
      + 'maraka house. Dropped. The chapter’s own Notes supply the reading used instead.',
  },
  {
    house: 3, verse: '2-4', surfaced: true, valence: -0.3,
    summary: 'Effort outpaces return for a while; initiative costs more than it yields.',
    excluded: 'Left as a headwind rather than the verse’s flat "unfavourable" — and see '
      + 'CH48_COMMENTARY_DISAGREES_WITH_CH34, where the annotator softens this further.',
  },
  {
    house: 4, verse: '2-4', surfaced: true, valence: 0.7,
    summary: 'A period for settling — home, land and the things that root a life.',
  },
  {
    house: 5, verse: '2-4', surfaced: true, valence: 0.8,
    summary: 'Learning advances, and what you have made — children, work, ideas — gives back.',
  },
  {
    house: 6, verse: '2-4', surfaced: true, valence: -0.4,
    summary: 'Opposition becomes active rather than latent; the period asks to be defended.',
    excluded: 'The verse’s "ill health" is a medical claim and is not carried.',
  },
  {
    house: 7, verse: '5-8', surfaced: true, valence: 0.4,
    summary: 'Partnership takes the foreground, and what governs it is well placed, making it a period '
      + 'of celebration rather than strain.',
    excluded: 'The verse gives "distress to wife and the possibility of the death of the '
      + 'native" — the 7th is the other maraka house. Both halves dropped: the death claim '
      + 'outright, and the claim about the spouse as a third-party claim. The chapter’s own '
      + 'Notes supply the marriage reading used instead.',
  },
  {
    house: 8, verse: '5-8', surfaced: false,
    withheld: 'The verse gives only "possibility of death and financial losses". Unlike the '
      + '2nd and 7th, the Notes offer no alternative reading for it, so there is nothing left '
      + 'once the mortality claim is removed. The 8th is Part 51’s house.',
  },
  {
    house: 9, verse: '5-8', surfaced: true, valence: 0.9,
    summary: 'Fortune arrives unasked — study deepens and gains come from unexpected directions.',
  },
  {
    house: 10, verse: '5-8', surfaced: true, valence: 0.8,
    summary: 'The work is seen. Recognition attaches to what you have actually been doing.',
  },
  {
    house: 11, verse: '5-8', surfaced: true, valence: -0.2,
    summary: 'Gains meet friction — what should accumulate needs pushing.',
    excluded: 'The verse’s "possibility of diseases" is a medical claim and is not carried.',
  },
  {
    house: 12, verse: '5-8', surfaced: true, valence: -0.3,
    summary: 'A period that draws inward and outward at once — outgoings, distance, retreat.',
    excluded: 'The verse’s "danger from diseases" is a medical claim and is not carried.',
  },
];

export const MARAKA_ROWS_USE_THE_CHAPTERS_OWN_ALTERNATIVE =
  'Three of the twelve house-lord rows name death (2nd, 7th, 8th). For the 2nd and 7th the '
  + 'chapter’s OWN Notes supply the alternative — the 2nd is the house of wealth and a '
  + 'well-placed 2nd lord gives gains in its dasha; the 7th indicates marriage and a '
  + 'well-placed 7th lord gives auspicious celebrations. Those readings are the text’s, not a '
  + 'softening of ours. The 8th gets no such alternative, so nothing is left once the '
  + 'mortality claim is removed and the row is withheld entirely.';

// ─────────────────────────────────────────────────────────────────────────────
// The commentary that disagrees with chapter 34
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⚠️ The Notes to 48.2-8 contradict chapter 34, and say so:
 *
 *   "In Chapter 34 it is stated that the lord of 3rd, 6th and 11th will give evil effects.
 *    **Our view which is based on long experience** is that these lords will not give
 *    unfavourable effects if they are in the 3rd, 6th and 11th respectively in their own
 *    signs."
 *
 * "Our view based on long experience" is Santhanam speaking, not Parashara. It is a
 * commentator's amendment to a root-text rule, and the programme has kept that distinction
 * before — the graha-yuddha winner (27.20) and the additive drishti shortcut (ch 26) were
 * both refused on exactly this ground.
 *
 * So it is **recorded and not encoded**. Chapter 34's rule stands; a later part with a second
 * edition may find the amendment in root text somewhere, and then it would count.
 */
export const CH48_COMMENTARY_DISAGREES_WITH_CH34 =
  'The Notes to 48.2-8 amend chapter 34: the 3rd, 6th and 11th lords "will not give '
  + 'unfavourable effects if they are in the 3rd, 6th and 11th respectively in their own '
  + 'signs". The wording is "our view which is based on long experience" — Santhanam, not '
  + 'Parashara. Recorded, NOT encoded: the programme has refused commentator amendments '
  + 'before on the same ground (the graha-yuddha winner at 27.20, the additive drishti '
  + 'shortcut in ch 26). Chapter 34’s rule stands until a root-text source says otherwise.';

// ─────────────────────────────────────────────────────────────────────────────
// The capability chapter 48 asks for and the engine does not have
// ─────────────────────────────────────────────────────────────────────────────

/**
 * From the Notes to 48.2-8:
 *
 *   "A planet posited in an auspicious house … **at the commencement of the Dasha** produces
 *    favourable results in his Dasha … It is therefore essential that the placement of a
 *    planet **at the time of birth and at the commencement of the Dasha** should both be
 *    taken into account."
 *
 * That is a second, independent chart — the sky at the moment a period begins — and every
 * fact the engine holds is natal. `ChartFacts` has no notion of a planet's position at a
 * later date, and `arbitrate` has no way to weigh a natal placement against a transiting one.
 *
 * The engine CAN compute it: `computeTransit` exists and dasha boundaries are dated. What is
 * missing is the join — a `ChartFacts` for the dasha-start moment, which is structurally the
 * same move as Part 29's `vargaFacts` (project the facts, then run the same predicates).
 *
 * Recorded rather than built: it is a real capability with a clear shape, and it belongs to a
 * part that has the transit layer in scope.
 */
export const DASHA_START_CHART_IS_A_GAP =
  'BPHS 48 (notes) says the placement of a planet AT THE COMMENCEMENT OF THE DASHA must be '
  + 'weighed alongside its natal placement. Every fact the engine holds is natal; there is no '
  + '`ChartFacts` for a later moment and no way to weigh natal against transiting. The pieces '
  + 'exist — `computeTransit` computes positions and dasha boundaries are dated — and the '
  + 'shape is exactly Part 29’s `vargaFacts`: project the facts to the moment, then run the '
  + 'same predicates unchanged. Recorded as a capability with a known shape, for a part with '
  + 'the transit layer in scope.';

// ─────────────────────────────────────────────────────────────────────────────
// Rules — the join itself
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN: Record<number, Rule['effect']['domain']> = {
  1: 'self', 2: 'wealth', 3: 'siblings', 4: 'home', 5: 'children', 6: 'health',
  7: 'partnership', 8: 'transformation', 9: 'fortune', 10: 'career', 11: 'gains', 12: 'release',
};

/**
 * One rule per surfaced house lord: **its dasha is running AND it is well placed**.
 *
 * The `dasha` condition is what makes these different from every rule before them — they do
 * not describe a chart, they describe a chart *during a period*. 48.1 supplies the second
 * condition: the effect follows the lord's condition, not its nature, so a bare "the 2nd
 * lord's dasha is running" would assert more than the chapter does.
 */
export function houseLordDashaRules(): Rule[] {
  const out: Rule[] = [];
  for (const row of HOUSE_LORD_DASHA) {
    if (!row.surfaced) continue;
    const when: Predicate[] = [
      // "During the dasha of the lord of the Nth" — one clause, because `dasha.lord` takes
      // a PlanetRef. The first draft of this file fanned out over all seven grahas and added
      // a `lordship` clause beside the dasha one, which was unsound: nothing in that pair
      // said the named graha WAS the lord of that house, so a Mars dasha satisfied the 2nd
      // lord's rule whenever Venus happened to sit in the 2nd. Extending the predicate was
      // the fix; see DASHA_LORD_IS_A_PLANETREF.
      { k: 'dasha', level: 'maha', lord: row.house },
      // 48.1's condition, and the condition the Notes attach to the 2nd and 7th: the lord
      // must be WELL PLACED. Dignity is that test — and note it must not be expressed as
      // "the lord occupies its own house", which is a far narrower claim and makes the
      // dignity clause redundant, since a lord in its own house is in own dignity by
      // definition.
      { k: 'dignity', graha: row.house, is: ['exalted', 'own', 'moolatrikona', 'friend'] },
    ];
    out.push({
      id: `bphs.48.${row.verse.split('-')[0]!.padStart(3, '0')}.lord${row.house}-dasha`,
      source: { text: 'bphs', chapter: 48, verse: row.verse },
      when,
      effect: {
        id: `dasha.house-lord.${row.house}`,
        domain: DOMAIN[row.house]!,
        valence: row.valence!,
        summary: row.summary!,
      },
      weight: Math.min(1, Math.abs(row.valence!) + 0.2),
      verification: 'unverified',
      ...(row.excluded ? { note: `Not carried from this verse: ${row.excluded}` } : {}),
    });
  }
  return out;
}

/**
 * The DSL change Part 38 needed, and why it counts as a correctness fix rather than a tidy-up.
 *
 * `dasha` had carried a bare `Graha` since Part 1 — reasonably, since nothing consulted it.
 * Chapter 48 keys all twelve of its effects to *the dasha of the lord of a house*, which a
 * bare Graha cannot say. The first draft worked around it by emitting one rule per (house,
 * graha) pair with a `lordship` predicate alongside, and that workaround was **wrong**: the
 * two clauses were independent, so `{ dasha: mars } AND { the 2nd lord occupies the 2nd }`
 * fired on a Mars dasha in a chart where the 2nd lord was Venus. Seventy-seven rules, none
 * of them saying what the chapter says.
 *
 * `PlanetRef` already solved exactly this for `dignity`, `strength`, both halves of `aspect`
 * and `lordsConjunct.parties`. Applying it to `dasha` costs one line in the type and four in
 * the evaluator, collapses 77 rules to 11, and makes each one true.
 */
export const DASHA_LORD_IS_A_PLANETREF =
  'BPHS 48 keys its effects to "the dasha of the lord of the Nth house". `dasha.lord` was a '
  + 'bare Graha, which cannot say that, and the first draft worked around it with a fan-out '
  + 'over seven grahas plus a separate `lordship` clause — UNSOUND, because nothing tied the '
  + 'named graha to being that lord: a Mars dasha satisfied the 2nd lord’s rule whenever the '
  + '2nd lord happened to be well placed. Widening `lord` to PlanetRef, the sixth kind to '
  + 'take one, collapsed 77 rules to 11 and made each of them true. The workaround was caught '
  + 'by reading the conjunction, not by a failing test — no test would have caught it, since '
  + 'both clauses are individually satisfiable.';

export const CH47_48_YIELD = {
  chapters: [47, 48],
  note: 'The join. Every rule before this part described a chart; these describe a chart '
    + 'DURING A PERIOD, using the `dasha` predicate that has existed unused since Part 1. '
    + 'Chapter 48’s twelve house-lord rows are the payload; chapter 47 supplies the taxonomy '
    + '(general vs distinctive) and the repeated condition shape, and its per-planet effect '
    + 'prose is deliberately not carried. Three rows name death: the 2nd and 7th are surfaced '
    + 'on the chapter’s OWN alternative reading, and the 8th is withheld because the chapter '
    + 'offers none.',
} as const;
