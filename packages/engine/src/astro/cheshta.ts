// Cheshta bala's inputs — mean longitudes and the śīghrocha (BPHS 27.24-25).
//
// This is the sixth and last Shadbala component that had no computation path. `cheshtaBalaTara`
// has always existed in the knowledge package; it takes a mean longitude and a śīghrocha, and
// nothing produced either.
//
// **The śīghrocha is not the same quantity for every planet, and getting that backwards is the
// trap.** In the classical scheme the "fast apex" is:
//
//   superior planets (Mars, Jupiter, Saturn)  śīghrocha = the SUN's mean longitude,
//                                             madhyama = the planet's own mean longitude
//   inferior planets (Mercury, Venus)         śīghrocha = the PLANET's own mean heliocentric
//                                             longitude, madhyama = the Sun's mean longitude
//
// The two are swapped between the groups. This is not an arbitrary convention to be taken on
// faith — it is checkable, and the test checks it:
//
//   A superior planet is retrograde near **opposition**, where the Sun's mean longitude is ~180°
//   from it, so the cheshta kendra is ~180° and the bala is ~60, its maximum. The same planet at
//   conjunction with the Sun — combust and moving fastest — gives a kendra near 0 and a bala
//   near 0. An inferior planet is retrograde at **inferior conjunction**, where it lies between
//   Earth and Sun, so its heliocentric longitude is ~180° from the Sun's geocentric longitude
//   and the kendra is again ~180°.
//
// So "retrograde ⇒ near-maximum motional strength" falls out of the geometry for both groups.
// If the śīghrocha assignments were swapped, that would invert, and the test would fail.
//
// The luminaries are absent on purpose: 27.18 gives the Sun's Cheshta bala as its Ayana bala and
// the Moon's as its Paksha bala, both of which `shadbalaPinda` already handles.

import { planetelements } from 'astronomia';
import type { Graha } from '../types.js';

const DEG = 180 / Math.PI;
const mod360 = (n: number): number => ((n % 360) + 360) % 360;

/** The five tara-grahas, the only planets 27.24-25 applies to. */
export const CHESHTA_TARA: Graha[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** Mars, Jupiter and Saturn orbit outside Earth: their śīghrocha is the Sun's mean longitude. */
export const SUPERIOR: Graha[] = ['mars', 'jupiter', 'saturn'];
/** Mercury and Venus orbit inside Earth: the roles of madhyama and śīghrocha are swapped. */
export const INFERIOR: Graha[] = ['mercury', 'venus'];

export interface CheshtaInput {
  /** The madhyama — the "mean planet" of the classical scheme. */
  meanLongitude: number;
  /** The śīghrocha, the apex the kendra is measured from. */
  seeghrocha: number;
}

/** Mean heliocentric longitude of a planet, degrees, from VSOP87 mean elements. */
function meanHeliocentric(name: string, jde: number): number {
  return mod360(planetelements.mean(name, jde).lon * DEG);
}

/**
 * The Sun's mean geocentric longitude — Earth's mean heliocentric longitude plus 180°.
 *
 * The MEAN Sun, not the true one. 27.24-25 is built on the mean/true distinction (the kendra is
 * measured from the midpoint of the two), so substituting the apparent Sun here would collapse
 * part of what the rule is measuring.
 */
export function meanSunLongitude(jde: number): number {
  return mod360(meanHeliocentric('earth', jde) + 180);
}

/**
 * The madhyama and śīghrocha for one tara-graha, ready for `cheshtaBalaTara`.
 *
 * Returns `null` for the luminaries and the nodes — 27.18 gives the luminaries a borrowed
 * strength instead, and chapter 27 gives the nodes no Shadbala at all.
 */
export function cheshtaInput(graha: Graha, jde: number): CheshtaInput | null {
  if (SUPERIOR.includes(graha)) {
    return {
      meanLongitude: meanHeliocentric(graha, jde),
      seeghrocha: meanSunLongitude(jde),
    };
  }
  if (INFERIOR.includes(graha)) {
    return {
      meanLongitude: meanSunLongitude(jde),
      seeghrocha: meanHeliocentric(graha, jde),
    };
  }
  return null;
}

/** All five tara-grahas at once. */
export function cheshtaInputs(jde: number): Partial<Record<Graha, CheshtaInput>> {
  const out: Partial<Record<Graha, CheshtaInput>> = {};
  for (const g of CHESHTA_TARA) {
    const v = cheshtaInput(g, jde);
    if (v) out[g] = v;
  }
  return out;
}

export const SEEGHROCHA_SWAPS_BETWEEN_GROUPS =
  'The śīghrocha is the SUN’s mean longitude for the superior planets (Mars, Jupiter, Saturn) '
  + 'and the PLANET’s own mean heliocentric longitude for the inferior ones (Mercury, Venus) — '
  + 'with the madhyama taking the other role in each case. The assignment is swapped between the '
  + 'two groups, and swapping it back would invert the result rather than merely perturb it. It '
  + 'is not asserted on authority: a retrograde planet must score near-maximum Cheshta bala, '
  + 'which follows from this assignment for BOTH groups (superior planets retrograde near '
  + 'opposition, inferior ones at inferior conjunction — both giving a kendra near 180°), and '
  + 'that is what the test measures.';

export const CHESHTA_LUMINARIES_ELSEWHERE =
  'The Sun and Moon are deliberately absent. 27.18 gives the Sun’s Cheshta bala as its Ayana '
  + 'bala and the Moon’s as its Paksha bala — neither retrogrades, so the text borrows a '
  + 'strength each already has. Computing a motion-based figure for them would be an invention, '
  + 'and a plausible-looking one.';
