// BPHS Programme Part 33 — Chapter 42: Combinations for Penury.
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW THIS CHAPTER IS HANDLED, AND WHY
// ─────────────────────────────────────────────────────────────────────────────
//
// Every verse ends in destitution: "penniless", "utter poverty", "miserable and indigent",
// "distressed even in the matter of food". The programme flagged this chapter in advance as
// doom-adjacent, with `checkNoDoom` mandatory and the instruction to **reframe as conditions,
// not verdicts**.
//
// Two things make it harder than chapter 39's kingship problem, which had a clean answer.
//
//  1. **Most of these verses are conditioned on a MARAKA** — a death-inflicting planet. That
//     is Part 51 material: computed, never surfaced. A formation we cannot fully evaluate
//     without touching withheld data cannot be surfaced either, whatever we do to its wording.
//  2. **"You will be poor" is not reframeable the way "you will be a king" was.** Chapter 39
//     could be restated as elevation because the chapter itself said the yoga overrides birth
//     — the doctrine was about rising, and the throne was the period's word for the top. There
//     is no equivalent move here. Poverty is not a metaphor for something else in the text.
//
// So the split is by evidence, not by wording:
//
//  • **Maraka-dependent verses (2, 3, 7, 8, 10, 11)** — formation recorded, **never surfaced**.
//    Not because the wording is harsh but because the evidence is withheld.
//  • **Maraka-free verses (4, 5, 6, 9, 12)** — these describe the ascendant lord in a dusthana
//    and afflicted, with the 2nd lord weak. That is a real, checkable structural condition,
//    and it is surfaced as **a condition about effort and resources** — never as a prediction
//    of poverty. Every surfaced line passes `checkNoDoom` and a stricter local guard.
//
// The distinction is the honest one: we are not softening a prediction of destitution into a
// gentler prediction of destitution. We are reporting the structural fact the chart carries
// and declining the verdict the verse draws from it.

import type { Graha, House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import type { Predicate } from '../../rules/predicate.js';

export const CH42_IS_NOT_REFRAMED_LIKE_CH39 =
  'Chapter 39’s kingship was RESTATED as elevation, because the chapter itself said the yoga '
  + 'overrides birth — the doctrine was about rising and the throne was the period’s word for '
  + 'the top. Poverty has no such second meaning in this text, so chapter 42 is NOT reframed '
  + 'the same way. Its verdicts are declined outright. What is surfaced is the structural '
  + 'condition the chart actually carries (an afflicted ascendant lord in a dusthana with a '
  + 'weak 2nd lord), which is checkable, and never the outcome the verse draws from it.';

export const CH42_MARAKA_GATE =
  'Six of chapter 42’s verses condition the combination on a MARAKA — a death-inflicting '
  + 'planet, which is Part 51 material and never surfaced. A formation that cannot be fully '
  + 'evaluated without reading withheld data is not surfaced either, whatever its wording. '
  + 'That is a gate on the EVIDENCE, not on the phrasing, and it is why those six are refused '
  + 'even though the five maraka-free ones are not.';

// ─────────────────────────────────────────────────────────────────────────────
// The table
// ─────────────────────────────────────────────────────────────────────────────

export interface PenuryCombination {
  verse: string;
  formation: string;
  /** True where the verse's condition includes a maraka planet. */
  needsMaraka: boolean;
  surfaced: boolean;
  /** A CONDITION about resources — never an outcome. Only on surfaced rows. */
  condition?: string;
  withheld?: string;
  excluded?: string;
}

export const PENURY_COMBINATIONS: PenuryCombination[] = [
  {
    verse: '2',
    formation: 'The ascendant lord in the 12th and the 12th lord in the ascendant, with a '
      + 'maraka joining or aspecting.',
    needsMaraka: true, surfaced: false,
    withheld: 'Conditioned on a maraka — see CH42_MARAKA_GATE.',
  },
  {
    verse: '3',
    formation: 'The ascendant lord in the 6th and the 6th lord in the ascendant, with a '
      + 'maraka joining or aspecting.',
    needsMaraka: true, surfaced: false,
    withheld: 'Conditioned on a maraka.',
  },
  {
    verse: '4',
    formation: 'The ascendant or the Moon with Ketu, while the ascendant lord is in the 8th.',
    needsMaraka: false, surfaced: true,
    condition: 'The chart’s vitality sits where it is least supported. Resources ask more '
      + 'deliberate attention here than the same effort would need elsewhere.',
  },
  {
    verse: '5',
    formation: 'The ascendant lord with a malefic in the 6th, 8th or 12th, while the 2nd '
      + 'lord is in an enemy sign or debilitated.',
    needsMaraka: false, surfaced: true,
    condition: 'Both the person and the house of resources are working from a weak position '
      + 'at once — the chart does not carry easy accumulation, and says so structurally.',
    excluded: 'The verse’s "even a native of royal scion" conditions the outcome on the '
      + 'class of birth, which is dropped wherever it appears (as at 39.44).',
  },
  {
    verse: '6',
    formation: 'The ascendant lord conjunct a lord of the 6th, 8th or 12th — or Saturn — and '
      + 'without any benefic aspect.',
    needsMaraka: false, surfaced: true,
    condition: 'The ascendant lord is tied to a difficult house with nothing benefic '
      + 'relieving it. The absence of the benefic aspect is the operative half.',
  },
  {
    verse: '7',
    formation: 'The 5th and 9th lords in the 6th and 12th respectively, aspected by marakas.',
    needsMaraka: true, surfaced: false,
    withheld: 'Conditioned on marakas. Structurally the inverse of 41.16, where the same two '
      + 'lords are the wealth-givers.',
  },
  {
    verse: '8',
    formation: 'Malefics other than the 9th and 10th lords in the ascendant, with a maraka '
      + 'joining or aspecting.',
    needsMaraka: true, surfaced: false,
    withheld: 'Conditioned on a maraka.',
  },
  {
    verse: '9',
    formation: 'The dispositors of the 6th, 8th and 12th lords themselves in those houses, '
      + 'associated with or aspected by malefics.',
    needsMaraka: false, surfaced: true,
    condition: 'The difficult houses reinforce one another rather than staying contained — '
      + 'a compounding pattern rather than an isolated placement.',
    excluded: 'Not encoded as a rule: a dispositor CHAIN is not expressible — see '
      + 'CH42_NOT_ENCODABLE.',
  },
  {
    verse: '10',
    formation: 'The lord of the navamsa the Moon occupies joining a maraka or occupying a '
      + 'maraka house.',
    needsMaraka: true, surfaced: false,
    withheld: 'Conditioned on a maraka, and needs a navamsa dispositor besides.',
  },
  {
    verse: '11',
    formation: 'The lords of the natal and navamsa ascendants conjunct or aspected by marakas.',
    needsMaraka: true, surfaced: false,
    withheld: 'Conditioned on marakas, and needs a divisional ascendant as a frame — the gap '
      + 'Part 32 recorded at 39.15 and 39.25.',
  },
  {
    verse: '12',
    formation: 'Benefics occupying the inauspicious houses while malefics occupy the '
      + 'auspicious ones — each planet in the place it does least good.',
    needsMaraka: false, surfaced: true,
    condition: 'The chart’s helpful planets sit where they help least and its difficult ones '
      + 'where they matter most. A whole-chart arrangement rather than a single placement.',
  },
  {
    verse: '14',
    formation: 'The 8th or 12th from the Atmakaraka or from the natal ascendant aspected by '
      + 'the Atmakaraka’s navamsa lord and the ascendant lord.',
    needsMaraka: false, surfaced: false,
    withheld: 'Needs a navamsa dispositor of the Atmakaraka — the same dispositor gap as '
      + 'verse 9. Recorded as inexpressible rather than approximated.',
  },
  {
    verse: '15',
    formation: 'The 12th from the Atmakaraka aspected by the Atmakaraka’s dispositor, or the '
      + '12th from the ascendant aspected by the ascendant lord.',
    needsMaraka: false, surfaced: false,
    withheld: 'Needs a dispositor. Note this verse says "spendthrift" rather than penniless — '
      + 'a disposition rather than an outcome, and the one row here that would have been '
      + 'comfortably surfaceable had the predicate existed.',
  },
];

export const CH42_NOT_ENCODABLE = [
  'A DISPOSITOR predicate — "the lord of the sign X occupies". Verses 9, 14 and 15 all need '
  + 'it, and so did ch 36’s Kalpadruma yoga (recorded in Part 31). This is now the fourth '
  + 'place it has blocked a rule and it is the clearest remaining DSL gap.',
  'A divisional ASCENDANT as a frame (verse 11) — the gap Part 32 recorded at 39.15 and '
  + '39.25. `vargaFacts` can build the chart; no `LagnaReference` names its ascendant.',
  'MARAKA lordship as a predicate. Deliberately not built: it would make Part 51 material '
  + 'readable by any rule, and the point of deferring that material is that nothing surfaces '
  + 'it by accident.',
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Rules — only the maraka-free, expressible ones
// ─────────────────────────────────────────────────────────────────────────────

const R = (
  id: string, verse: string, when: Predicate[], summary: string, note?: string,
): Rule => ({
  id: `bphs.42.${verse.padStart(3, '0')}.${id}`,
  source: { text: 'bphs', chapter: 42, verse },
  when,
  // Negative valence: this is a real headwind and the arbitration layer should see it as one.
  // The SUMMARY is a condition, not an outcome — that is where the safety lives, not here.
  effect: { id: `resources.strain.${id}`, domain: 'wealth', valence: -0.5, summary },
  weight: 0.6,
  verification: 'unverified',
  ...(note ? { note } : {}),
});

export function penuryConditionRules(): Rule[] {
  const by = (v: string) => PENURY_COMBINATIONS.find((c) => c.verse === v)!;
  const out: Rule[] = [];

  // 42.4 — the ascendant or Moon with Ketu, ascendant lord in the 8th.
  for (const g of ['sun', 'moon'] as Graha[]) {
    out.push(R(`ketu-with-${g}`, '4', [
      { k: 'conjunct', grahas: [g, 'ketu'] },
      { k: 'lordship', house: 1, occupies: 8 },
    ], by('4').condition!));
  }

  // 42.5 — the ascendant lord with a malefic in a dusthana, 2nd lord weak.
  for (const h of [6, 8, 12] as House[]) {
    out.push(R(`lagna-lord-afflicted-${h}`, '5', [
      { k: 'lordship', house: 1, occupies: h },
      { k: 'dignity', graha: 2, is: ['enemy', 'debilitated'] },
    ], by('5').condition!, `Not carried from this verse: ${by('5').excluded}`));
  }

  // 42.6 — the ascendant lord conjunct a difficult-house lord, with no benefic relief.
  for (const h of [6, 8, 12] as House[]) {
    out.push(R(`lagna-lord-with-${h}-lord`, '6', [
      { k: 'lordsConjunct', parties: [1, h] },
    ], by('6').condition!,
    'The verse’s "devoid of benefic aspect" is the operative half and is encoded as the '
    + '`unless` below, not as a separate rule.'));
  }
  // Attach the cancellation: a benefic aspect on the ascendant lord lifts it.
  for (const r of out.filter((x) => x.id.includes('lagna-lord-with'))) {
    // "devoid of benefic aspect" — the subject is the ASCENDANT LORD, a role rather than a
    // name, which is why `ontoGraha` had to take a PlanetRef (Part 33 retrofit).
    r.unless = [
      { k: 'aspect', graha: 'jupiter', ontoGraha: 1, kind: 'graha' },
      { k: 'aspect', graha: 'venus', ontoGraha: 1, kind: 'graha' },
    ];
  }

  // 42.12 — benefics in the adverse houses while malefics hold the auspicious ones.
  for (const b of ['jupiter', 'venus'] as Graha[]) {
    for (const m of ['saturn', 'mars'] as Graha[]) {
      out.push(R(`inverted-${b}-${m}`, '12', [
        { k: 'placement', graha: b, house: 12 },
        { k: 'placement', graha: m, house: 1 },
      ], by('12').condition!));
    }
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// The guard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Words that must never appear in a surfaced chapter-42 line.
 *
 * Stricter than the engine's `checkNoDoom`, deliberately. That guard catches catastrophe
 * phrasing ("you will die", "disaster", "ruined"); this one also catches the *quieter*
 * failure this chapter invites — a calm, plausible sentence predicting poverty. "You will
 * struggle financially" trips no doom pattern and is exactly the thing not to say.
 */
export const PENURY_FORBIDDEN = [
  'penniless', 'penury', 'poverty', 'poor', 'destitute', 'destitution', 'indigent',
  'beggar', 'starve', 'starving', 'bankrupt', 'ruin', 'broke', 'impoverished',
  'never have', 'will lose', 'struggle financially', 'financial struggle',
] as const;

export const CH42_GUARD_IS_STRICTER_THAN_NO_DOOM =
  'The engine’s `checkNoDoom` catches catastrophe phrasing. Chapter 42 invites a quieter '
  + 'failure: a calm, plausible sentence predicting poverty. "You will struggle financially" '
  + 'trips no doom pattern and is precisely the thing not to say. `PENURY_FORBIDDEN` adds the '
  + 'vocabulary of destitution and of certainty about the future, and the tests apply BOTH.';

export const CH42_YIELD = {
  chapter: 42,
  verses: 15,
  surfaced: 5,
  note: 'The most constrained chapter since ch 25, and constrained differently: not by '
    + 'anthropology, medicine or contempt but by the EVIDENCE. Six of the thirteen '
    + 'combinations are conditioned on a maraka, which is Part 51 material, so they cannot be '
    + 'evaluated without reading data we do not surface. Three more need a dispositor '
    + 'predicate that still does not exist — the fourth part in which that gap has blocked a '
    + 'rule. The five that survive are surfaced as CONDITIONS about resources and effort, '
    + 'never as the outcome the verses draw. Their formations are all recorded regardless.',
} as const;
