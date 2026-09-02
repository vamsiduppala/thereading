// An adverse Atmakaraka — the definition BPHS never gives, filled from Jaimini.
//
// **This closes a thread open since Part 28.** BPHS 32.9-12 states the seventh source-stated
// arbitration instruction and the first that *caps* evidence rather than ranking it: the
// Atmakaraka outranks every other karaka, as a minister cannot go against the king. An adverse
// AK caps how much benefit the other karakas may deliver; a favourable one caps how much harm.
//
// It has sat unwired for twenty-three parts because **the cap needs a definition of "adverse"
// and BPHS supplies none.** Chapters 32, 33 and 34 were each checked and each failed to give
// one — ch 34 defines adversity by *lordship*, which is a different question and would have
// been the wrong answer to reach for.
//
// ⚠️ **The definition used here is Jaimini's, not BPHS's**, and that is recorded rather than
// blurred. Jaimini's *Upadesha Sutras* is a root text of a different school, so this is neither
// commentary (which the programme refuses) nor BPHS (which is silent). It is a second tradition
// consulted where the first does not speak — the same status as Saravali and Brihat Jataka
// corroborating BPHS 75.1's `balibhiḥ`, and it is labelled so a later reader can weigh it.
//
// The rule, from Jaimini: an Atmakaraka is adverse by its condition **in the navamsa**, the sign
// it occupies there being the *karakamsa*. It is adverse if, in the D9, it is
//
//   1. in an **enemy sign or debilitated**, and
//   2. **conjoined with or aspected by a natural malefic** (Rahu, Ketu, Saturn, Mars), and
//   3. **not** rescued by conjunction or aspect from a natural benefic (Jupiter, Venus).
//
// The third clause is a cancellation, which is why it is expressed as one.

import type { Graha } from '../types.js';
import type { DignityState, Predicate } from '../rules/predicate.js';

/** Jaimini's malefics for this test. The nodes count; the Sun and Mercury do not. */
export const ADVERSE_AK_MALEFICS: Graha[] = ['rahu', 'ketu', 'saturn', 'mars'];

/** And the benefics whose touch cancels it. */
export const ADVERSE_AK_RESCUERS: Graha[] = ['jupiter', 'venus'];

/** The D9 dignities Jaimini counts as adverse. */
export const ADVERSE_AK_DIGNITIES: DignityState[] = ['enemy', 'debilitated'];

export interface AtmakarakaCondition {
  /** The Atmakaraka planet, from `charaKarakas`. */
  graha: Graha;
  /** Its dignity in the NAVAMSA — the karakamsa is a D9 position. */
  navamsaDignity: DignityState | null;
  /** Natural malefics conjoined with or aspecting it in the D9. */
  maleficsTouching: Graha[];
  /** Natural benefics conjoined with or aspecting it in the D9. */
  beneficsTouching: Graha[];
}

export type AtmakarakaVerdict = 'adverse' | 'favourable' | 'rescued' | 'unknown';

export interface AtmakarakaAssessment {
  graha: Graha;
  verdict: AtmakarakaVerdict;
  /** Which of Jaimini's three clauses held. */
  clauses: { badDignity: boolean; maleficTouch: boolean; beneficRescue: boolean };
  summary: string;
}

/**
 * Assess an Atmakaraka by Jaimini's three clauses.
 *
 * Returns `'unknown'` rather than `'favourable'` when the navamsa dignity is absent. That
 * distinction matters here more than usual: the AK's verdict *caps* every other karaka's
 * contribution (BPHS 32.9-12), so guessing "favourable" would silently lift a cap that should
 * have been applied, across the whole reading rather than in one rule.
 *
 * `'rescued'` is kept distinct from `'favourable'`. A chart where a benefic cancels an
 * otherwise-adverse AK is not the same as one that was never adverse, and collapsing the two
 * would lose exactly what Jaimini's third clause is for.
 */
export function assessAtmakaraka(c: AtmakarakaCondition): AtmakarakaAssessment {
  const badDignity = c.navamsaDignity != null
    && ADVERSE_AK_DIGNITIES.includes(c.navamsaDignity);
  const maleficTouch = c.maleficsTouching.some((g) => ADVERSE_AK_MALEFICS.includes(g));
  const beneficRescue = c.beneficsTouching.some((g) => ADVERSE_AK_RESCUERS.includes(g));
  const clauses = { badDignity, maleficTouch, beneficRescue };

  if (c.navamsaDignity == null) {
    return {
      graha: c.graha,
      verdict: 'unknown',
      clauses,
      summary: 'The Atmakaraka’s navamsa dignity was not supplied, and the karakamsa is a D9 '
        + 'position — so the condition is not assessed. It is not assumed favourable: that '
        + 'verdict lifts a cap on every other karaka.',
    };
  }
  if (badDignity && maleficTouch && !beneficRescue) {
    return {
      graha: c.graha,
      verdict: 'adverse',
      clauses,
      summary: 'The Atmakaraka is poorly placed in the navamsa and touched by a malefic with no '
        + 'benefic to relieve it — so what the other karakas can deliver is capped.',
    };
  }
  if (badDignity && maleficTouch && beneficRescue) {
    return {
      graha: c.graha,
      verdict: 'rescued',
      clauses,
      summary: 'The Atmakaraka would read as adverse, but a benefic reaches it in the navamsa '
        + 'and cancels that — the cap does not apply.',
    };
  }
  return {
    graha: c.graha,
    verdict: 'favourable',
    clauses,
    summary: 'The Atmakaraka is not adverse by Jaimini’s test, so it caps the harm the other '
      + 'karakas may deliver rather than the benefit.',
  };
}

/**
 * The same test as predicates, for a rule that wants to name it directly.
 *
 * Written against the **navamsa frame**, which is only expressible because `inFrame` exists —
 * before it, the karakamsa could be computed but never asked about inside a rule.
 */
export function adverseAtmakarakaPredicates(ak: Graha): Predicate[] {
  return [
    {
      k: 'inFrame',
      frame: { varga: 9 },
      of: [{ k: 'dignity', graha: ak, is: ADVERSE_AK_DIGNITIES }],
    },
    {
      k: 'inFrame',
      frame: { varga: 9 },
      op: 'or',
      of: ADVERSE_AK_MALEFICS.map((m): Predicate => ({
        k: 'compound',
        op: 'or',
        of: [
          { k: 'conjunct', grahas: [ak, m] },
          { k: 'aspect', graha: m, ontoGraha: ak, kind: 'graha' },
        ],
      })),
    },
  ];
}

/** Jaimini's third clause is a cancellation, so it belongs in `unless`. */
export function atmakarakaRescuePredicates(ak: Graha): Predicate[] {
  return [{
    k: 'inFrame',
    frame: { varga: 9 },
    op: 'or',
    of: ADVERSE_AK_RESCUERS.map((b): Predicate => ({
      k: 'compound',
      op: 'or',
      of: [
        { k: 'conjunct', grahas: [ak, b] },
        { k: 'aspect', graha: b, ontoGraha: ak, kind: 'graha' },
      ],
    })),
  }];
}

export const ADVERSE_AK_IS_JAIMINI_NOT_BPHS =
  'The definition of an ADVERSE Atmakaraka is JAIMINI’S, not BPHS’s, and is labelled so. BPHS '
  + '32.9-12 states that the AK caps what every other karaka may deliver — the seventh '
  + 'source-stated arbitration instruction and the first that CAPS evidence rather than ranking '
  + 'it — but never defines "adverse". Chapters 32, 33 and 34 were each checked and each failed '
  + 'to give one; ch 34 defines adversity by LORDSHIP, a different question and the wrong answer '
  + 'to reach for. Jaimini’s Upadesha Sutras is a ROOT TEXT OF A DIFFERENT SCHOOL, so this is '
  + 'neither commentary (which this programme refuses) nor BPHS (which is silent) but a second '
  + 'tradition consulted where the first does not speak — the same status as Saravali and Brihat '
  + 'Jataka corroborating 75.1’s balibhiḥ.';

export const ADVERSE_AK_NEEDED_THE_VARGA_FRAME =
  'Jaimini’s test is read in the NAVAMSA — the karakamsa is a D9 position — so it could not be '
  + 'written as predicates until `inFrame` existed. The karakamsa has been computable since Part '
  + '29 (`karakamsaFacts`), but a RULE could not ask about it: the registry evaluates one '
  + '`ChartFacts`. Closing the varga-frame gap is what made this closable, which is why the two '
  + 'were done in that order.';

export const AK_UNKNOWN_IS_NOT_FAVOURABLE =
  'An unsupplied navamsa dignity yields "unknown", never "favourable". The distinction matters '
  + 'more here than in most silence-not-a-guess cases: the AK’s verdict CAPS every other '
  + 'karaka’s contribution (BPHS 32.9-12), so guessing favourable would silently lift a cap '
  + 'across the whole reading rather than mis-fire one rule. "Rescued" is likewise kept distinct '
  + 'from "favourable" — a chart where a benefic cancels an otherwise-adverse AK is not one that '
  + 'was never adverse, and collapsing them would discard what Jaimini’s third clause is for.';
