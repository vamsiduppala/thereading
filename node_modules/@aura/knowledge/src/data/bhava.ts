// Bhava madhya — the house midpoints, and the convention this project uses.
//
// **This closes a gap open since Part 2.** BPHS as transcribed gives no definition of a bhava
// madhya, which blocked `cuspStrength` (P2), house-aspect cusps (P8) and Bhava bala (P11), and
// left Dig bala without a zero cusp to measure from. It was recorded as "needs a decision, not
// a chapter" for forty-nine parts.
//
// The decision is now taken and it is **equal-house**, supplied by the user from standard
// classical practice:
//
//   - the **Ascendant's exact degree is the midpoint of the 1st house**, not its start;
//   - each subsequent midpoint is **exactly 30° further**;
//   - the boundary (**bhava sandhi**) falls **15° either side** of a midpoint.
//
// ⚠️ **Labelled precisely as equal-house, and deliberately not as Sripati.** The two are
// sometimes named together but they are different methods: Sripati derives unequal houses by
// trisecting the MC/Ascendant quadrants, so its midpoints move with latitude and differ from
// these. The arithmetic above is equal-house exactly, and calling it anything else would
// mislead whoever revisits this.
//
// One corroboration worth recording: `cuspStrength` (Part 2) already falls to zero at **15°**
// from a cusp. It was written for this convention before there was a source for the cusp, and
// the two agree without either being adjusted to fit.

import type { House } from '../types.js';

const mod360 = (d: number): number => ((d % 360) + 360) % 360;

/** Degrees per house under the equal-house convention. */
export const BHAVA_ARC = 30;

/** Half-arc: a bhava sandhi sits this far either side of a madhya. */
export const BHAVA_SANDHI_HALF_ARC = 15;

/**
 * The midpoint of a house, under the equal-house convention.
 *
 * `house` is 1-based. The 1st house's midpoint **is** the ascendant's exact degree — that is
 * the whole content of the convention, and the reason it must not be confused with a
 * whole-sign or Sripati reading.
 */
export function bhavaMadhya(lagnaLongitude: number, house: House): number {
  const h = (((house - 1) % 12) + 12) % 12;
  return mod360(lagnaLongitude + BHAVA_ARC * h);
}

/** The two sandhis bounding a house: its midpoint ± 15°. */
export function bhavaSandhi(lagnaLongitude: number, house: House): { start: number; end: number } {
  const mid = bhavaMadhya(lagnaLongitude, house);
  return {
    start: mod360(mid - BHAVA_SANDHI_HALF_ARC),
    end: mod360(mid + BHAVA_SANDHI_HALF_ARC),
  };
}

/**
 * Which bhava a longitude falls in, by midpoint proximity rather than by sign.
 *
 * This is what makes the convention *do* something: under equal-house bhava, a planet can sit
 * in one sign and a different bhava, which whole-sign counting cannot express. A planet 20°
 * past the ascendant degree is in the 2nd bhava even when it shares the ascendant's sign.
 */
export function bhavaOf(lagnaLongitude: number, longitude: number): House {
  const offset = mod360(longitude - lagnaLongitude + BHAVA_SANDHI_HALF_ARC);
  return (Math.floor(offset / BHAVA_ARC) + 1) as House;
}

export const BHAVA_MADHYA_CONVENTION =
  'EQUAL-HOUSE, chosen deliberately and recorded as OURS because BPHS as transcribed defines '
  + 'no bhava madhya. The ascendant’s exact degree IS the midpoint of the 1st house (not its '
  + 'start); each following midpoint is exactly 30° further; a bhava sandhi falls 15° either '
  + 'side of a midpoint. ⚠️ NOT Sripati, which the two are sometimes named together but which '
  + 'trisects the MC/Ascendant quadrants into UNEQUAL houses whose midpoints move with latitude '
  + 'and differ from these. Corroboration: Part 2’s `cuspStrength` already decays to zero at '
  + '15° from a cusp — it was written for this convention before a source for the cusp existed, '
  + 'and the two agree without either being adjusted. This unblocks `cuspStrength` (P2), '
  + 'house-aspect cusps (P8), Bhava bala (P11) and Dig bala’s zero cusp.';

export const BHAVA_MADHYA_IS_A_CHOICE =
  'BPHS as transcribed states no bhava madhya, so this convention is OURS and is labelled that '
  + 'way — the same treatment as Part 37’s specificity ranking and Part 39’s rasi antardasa '
  + 'seed. A different edition carrying a bhava sphuta chapter could replace it, and every '
  + 'consumer reads the midpoint from `bhavaMadhya` rather than deriving one locally, so that '
  + 'replacement would be a single edit rather than a hunt.';
