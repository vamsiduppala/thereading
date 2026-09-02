// Grading a Pancha Mahapurusha yoga against BPHS 75.1's third condition.
//
// **The decision is settled: `balibhiḥ` is a condition, not a description.**
//
//   - **Grammar.** 75.1 reads *sva-bha-uccha-gata-kendra-sthaiḥ **balibhiḥ ca** kujādibhiḥ*.
//     All three qualifiers are instrumental plural agreeing with "Mars etc.", and **ca**
//     coordinates them. Were `balibhiḥ` a consequence of the first compound the `ca` would be
//     wrong. Three conditions.
//   - **Corroboration.** Saravali ch 35 and Brihat Jataka ch 2 both require the planet to be
//     *balin*. These are **independent root texts**, not commentary on BPHS — a stronger
//     warrant than the commentator amendments this programme has refused throughout.
//   - **Evidence.** On real ephemeris charts the placement alone occurs in **~35%** of the
//     population (see `mahapurusha-placement-rate.test.ts`). A yoga of the *mahāpuruṣa* — the
//     great person — present in more than a third of everyone is not marking greatness.
//
// **But the yoga is not deleted from charts that fail it.** BPHS 27.32-33 supplies a
// three-way verdict of its own, and using it is more faithful than a binary drop: a chart can
// be told the placement is present and the strength is not. That is the corpus's own gradation,
// not a softening of it.
//
// **And there is a fourth state the corpus does not have but we need.** A complete Shadbala
// requires inputs neither BPHS nor this engine supplies — see `SHADBALA_INPUTS_STILL_MISSING`.
// Where the total is incomplete the honest grade is **not assessed**, never "weak": a partial
// total is systematically low, so calling it weak would fail yogas that should hold, silently
// and always in the same direction.

import type { Graha } from '../types.js';
import { SHADBALA_REQUIRED } from './bphs/ch27c.js';
import {
  shadbalaVerdictOf, type ShadbalaPlanetResult,
} from './shadbala-pinda.js';

export type MahapurushaGrade = 'confirmed' | 'present-but-weak' | 'strength-not-assessed';

export interface MahapurushaGradeResult {
  graha: Graha;
  /** Did the placement itself hold — own sign or exaltation, in a kendra? */
  placement: boolean;
  grade: MahapurushaGrade;
  /** BPHS 27.32-33's own verdict, where the Shadbala could be completed. */
  shadbala: 'very-strong' | 'strong' | 'weak' | 'unknown';
  required: number | null;
  total: number | null;
  /** Which Shadbala components could not be computed, if any. */
  missing: string[];
  summary: string;
}

/**
 * Grade one Mahapurusha candidate.
 *
 * `placement` is the geometric half — own sign or exaltation **and** a kendra — which the
 * engine's `detectYogas` already determines. This adds 75.1's third condition on top, and
 * degrades gracefully when the Shadbala cannot be completed.
 */
export function gradeMahapurusha(
  graha: Graha, placement: boolean, shadbala?: ShadbalaPlanetResult,
): MahapurushaGradeResult {
  const required = SHADBALA_REQUIRED[graha] ?? null;

  if (!placement) {
    return {
      graha, placement: false, grade: 'strength-not-assessed', shadbala: 'unknown',
      required, total: null, missing: [],
      summary: 'The placement BPHS 75.1 requires is not present, so no yoga arises.',
    };
  }

  if (!shadbala || !shadbala.complete) {
    return {
      graha,
      placement: true,
      grade: 'strength-not-assessed',
      shadbala: 'unknown',
      required,
      total: shadbala?.total ?? null,
      missing: shadbala?.missing ?? ['all six components'],
      summary: 'The placement holds. BPHS 75.1 also requires the planet to be STRONG, and the '
        + 'Shadbala could not be completed from the data supplied — so the strength is not '
        + 'assessed rather than assumed either way.',
    };
  }

  const verdict = shadbalaVerdictOf(shadbala);
  const meets = verdict === 'strong' || verdict === 'very-strong';
  return {
    graha,
    placement: true,
    grade: meets ? 'confirmed' : 'present-but-weak',
    shadbala: verdict,
    required,
    total: shadbala.total,
    missing: [],
    summary: meets
      ? 'The placement holds and the planet meets the chapter-27 strength requirement — the '
        + 'yoga stands on all three of BPHS 75.1’s conditions.'
      : 'The placement holds but the planet falls short of the chapter-27 strength requirement, '
        + 'so BPHS 75.1’s third condition is unmet. The configuration is real; the force behind '
        + 'it is not.',
  };
}

export const BALIBHIH_IS_A_CONDITION =
  'BPHS 75.1: sva-bha-uccha-gata-kendra-sthaiḥ BALIBHIḤ CA kujādibhiḥ. All three qualifiers are '
  + 'instrumental plural agreeing with "Mars etc.", and CA coordinates them — were balibhiḥ a '
  + 'consequence of the first compound, the ca would be wrong. THREE CONDITIONS. Corroborated '
  + 'by Saravali ch 35 and Brihat Jataka ch 2, which both require the planet to be BALIN and '
  + 'which are INDEPENDENT ROOT TEXTS rather than commentary on BPHS — a stronger warrant than '
  + 'the commentator amendments this programme has refused throughout (27.20’s yuddha winner, '
  + 'ch 26’s drishti shortcut, ch 48’s amendment to ch 34).';

export const YOGA_IS_GRADED_NOT_DELETED =
  'A chart failing 75.1’s strength condition does NOT lose the reading. BPHS 27.32-33 supplies '
  + 'its own three-way verdict, and using it is more faithful than a binary drop: the chart is '
  + 'told the placement is present and the strength is not. A fourth state is added because the '
  + 'corpus does not need it and we do — where the Shadbala cannot be COMPLETED the grade is '
  + '"strength-not-assessed", never "weak". A partial total is systematically low, so calling '
  + 'it weak would fail yogas that should hold, silently and always in one direction.';

export const REAL_RATE_JUSTIFIES_THE_CONDITION =
  'On real ephemeris charts the Mahapurusha PLACEMENT alone occurs in ~35% of the population '
  + '(2,880 charts over 60 years and four places; see engine test '
  + '`mahapurusha-placement-rate`). The synthetic calibration population predicted 21.4% and '
  + 'was wrong by 65% — it draws dignity from a flat bag and places planets independently, '
  + 'while real charts cluster. So the earlier "34% of readings would be lost" figure rests on '
  + 'a bad baseline and is NOT used. The real rate strengthens the case rather than weakening '
  + 'it: a yoga of the MAHĀPURUṢA present in more than a third of everyone is not marking '
  + 'greatness.';

/**
 * ⚠️ What a complete Shadbala still needs, stated precisely so the remaining work is costed
 * rather than guessed at.
 *
 * Four inputs are missing, and **none of them is available from BPHS itself** — they belong to
 * the Siddhantic and panchanga layers the text assumes its reader already has:
 *
 * | missing input | blocks | virupa range at stake |
 * |---|---|---|
 * | mean longitudes + **śīghrocca** per tara-graha | Cheshta bala (5 of 7 planets) | 0-60 |
 * | sunrise/sunset | Kala: tribhaga | 0 or 60 |
 * | sunrise + weekday | Kala: hora lord | 0 or 60 |
 * | Hindu calendar year and month lords | Kala: varsha, masa | 0-45 |
 * | aspect pindas received | Drik bala | roughly ±60 |
 *
 * `cheshtaKendra` already implements the formula and takes the śīghrocca as an argument — Part
 * 11 encoded the arithmetic but not the table, because BPHS does not give one.
 *
 * The combined uncertainty is on the order of **±225 virupas** against thresholds of 300-420,
 * which is why a partial total cannot be judged and why the grade is honest about it.
 */
/**
 * ⚠️ **Correction to the paragraph above: these inputs are NOT unobtainable.**
 *
 * The first pass recorded them as belonging to Siddhantic and panchanga layers this engine does
 * not have. Checking rather than assuming shows that `astronomia` — already a dependency of the
 * engine, already used for every planetary position — ships all of the astronomy:
 *
 *   - **`planetelements.mean(planet, jde)`** returns mean orbital elements including the mean
 *     longitude *L*. That is Cheshta bala's `meanLongitude` for the five tara-grahas.
 *   - **`solar`** gives the Sun's mean longitude, which **is** the śīghrocca for the superior
 *     planets (Mars, Jupiter, Saturn) in the classical model; for Mercury and Venus the
 *     śīghrocca is their own mean heliocentric longitude, which `planetelements.mean` also gives.
 *   - **`Sunrise`** gives sunrise and sunset, unblocking Kala's tribhaga and the hora lord.
 *
 * The two non-astronomical inputs are equally reachable: the varsha and masa lords are
 * calendrical (the weekday lord of the Mesha Sankranti and of the month's start), and Drik
 * bala's aspect pindas are pure computation from ch 26's `drishtiValue`, encoded in Part 7.
 *
 * **So no external service, no Swiss Ephemeris and no API key are needed** — a conclusion worth
 * recording because the opposite was nearly assumed.
 *
 * ⚠️ **One caveat that does survive.** The Siddhantic *madhyama graha* and the modern mean
 * longitude are not the same quantity — the Indian model uses its own mean motions and epoch.
 * Substituting the modern value into BPHS's Cheshta formula is a **reconstruction, not an
 * identity**, and must be labelled as one when it is built. What the formula is really
 * measuring — how far a planet stands from its synodic conjunction with the Sun, i.e. where it
 * sits in its retrograde cycle — is physically real and modern astronomy computes it exactly,
 * which is why the substitution is defensible rather than a fudge.
 */
export const SHADBALA_INPUTS_ARE_LOCALLY_OBTAINABLE =
  'CORRECTION to `SHADBALA_INPUTS_STILL_MISSING`, which recorded these as belonging to layers '
  + 'this engine lacks. `astronomia` — ALREADY a dependency, already used for every planetary '
  + 'position — ships all the astronomy: `planetelements.mean(planet, jde)` returns the mean '
  + 'longitude L (Cheshta’s `meanLongitude`); `solar` gives the Sun’s mean longitude, which IS '
  + 'the śīghrocca for Mars, Jupiter and Saturn, while Mercury’s and Venus’s own mean '
  + 'heliocentric longitudes come from the same call; `Sunrise` gives sunrise and sunset, '
  + 'unblocking tribhaga and the hora lord. The two non-astronomical inputs are equally '
  + 'reachable — varsha and masa lords are calendrical, and Drik’s aspect pindas are pure '
  + 'computation from ch 26’s `drishtiValue` (Part 7). NO external service, NO Swiss Ephemeris '
  + 'and NO API key are required. ⚠️ CAVEAT THAT SURVIVES: the Siddhantic madhyama graha and the '
  + 'modern mean longitude are NOT the same quantity — different mean motions and epoch — so '
  + 'substituting one into BPHS’s formula is a RECONSTRUCTION to be labelled, not an identity. '
  + 'It is defensible because what the formula measures — distance from synodic conjunction '
  + 'with the Sun, i.e. position in the retrograde cycle — is physically real and computed '
  + 'exactly by modern astronomy.';

export const SHADBALA_INPUTS_STILL_MISSING =
  'A COMPLETE Shadbala needs four inputs this engine does not have, and NONE comes from BPHS — '
  + 'they belong to the Siddhantic and panchanga layers the text assumes: (1) mean longitudes '
  + 'and ŚĪGHROCCA per tara-graha, blocking Cheshta bala for five of the seven planets (0-60 '
  + 'virupas) — `cheshtaKendra` implements the formula and takes śīghrocca as an argument '
  + 'because Part 11 encoded the arithmetic but not the table, BPHS giving none; (2) '
  + 'sunrise/sunset, blocking Kala’s tribhaga (0 or 60); (3) sunrise plus weekday, blocking the '
  + 'hora lord (0 or 60); (4) the Hindu calendar year and month lords (0-45); and (5) aspect '
  + 'pindas received, blocking Drik bala (roughly ±60). Combined uncertainty is on the order of '
  + '±225 virupas against thresholds of 300-420 — which is why a partial total is never judged.';
