// Functional nature per lagna (Ch 13.2, Table 30) + baadhaka rule (Ch 13.3).
// Which planets are functionally benefic / neutral / malefic for each ascendant, and
// the yogakaraka (a planet owning both a kendra and a trikona). Encoded as a rule table.

import type { Graha } from '../types.js';

export interface FunctionalNature {
  lagna: number;            // 0..11 (0 = Aries)
  yogakaraka: Graha | null; // the excellent planet (kendra + trikona lord)
  benefics: Graha[];
  neutrals: Graha[];
  malefics: Graha[];
  /**
   * Planets no source classifies for this ascendant. Programme Part 30.
   *
   * Added because three rows here used to account for only SIX planets — the Moon was in
   * no column at all for Aries, Libra and Capricorn, so a caller got silence rather than
   * an answer, indistinguishable from an error. BPHS 34 filled two of the three; for the
   * third it is expressly silent, and this field says so instead of guessing.
   */
  unclassified?: Graha[];
}

export const FUNCTIONAL_NATURE: FunctionalNature[] = [
    // Part 30: the Moon was missing here too, but BPHS 34.19-22's notes say outright that
  // the sage does not discuss her for Aries. Marked unclassified rather than guessed.
  { lagna: 0, yogakaraka: null, benefics: ['sun', 'mars', 'jupiter'], neutrals: [], malefics: ['mercury', 'venus', 'saturn'], unclassified: ['moon'] },
  { lagna: 1, yogakaraka: 'saturn', benefics: ['sun', 'mercury', 'saturn'], neutrals: ['mars'], malefics: ['moon', 'jupiter', 'venus'] },
  { lagna: 2, yogakaraka: null, benefics: ['venus'], neutrals: ['moon', 'mercury', 'saturn'], malefics: ['sun', 'mars', 'jupiter'] },
  { lagna: 3, yogakaraka: 'mars', benefics: ['moon', 'mars', 'jupiter'], neutrals: ['sun', 'saturn'], malefics: ['mercury', 'venus'] },
  { lagna: 4, yogakaraka: 'mars', benefics: ['sun', 'mars', 'jupiter'], neutrals: ['moon'], malefics: ['mercury', 'venus', 'saturn'] },
  { lagna: 5, yogakaraka: null, benefics: ['mercury', 'venus'], neutrals: ['sun', 'saturn'], malefics: ['moon', 'mars', 'jupiter'] },
    // Part 30: the Moon was missing. BPHS 34.33-34 names her a raja-yoga causer for Libra.
  { lagna: 6, yogakaraka: 'saturn', benefics: ['mercury', 'venus', 'saturn', 'moon'], neutrals: [], malefics: ['sun', 'mars', 'jupiter'] },
  { lagna: 7, yogakaraka: null, benefics: ['moon', 'jupiter'], neutrals: ['sun', 'mars'], malefics: ['mercury', 'venus', 'saturn'] },
  { lagna: 8, yogakaraka: null, benefics: ['sun', 'mars'], neutrals: ['moon', 'mercury', 'jupiter'], malefics: ['venus', 'saturn'] },
    // Part 30: the Moon was missing. BPHS 34.39-40 classifies her malefic for Capricorn.
  { lagna: 9, yogakaraka: 'venus', benefics: ['venus', 'mercury', 'saturn'], neutrals: ['sun'], malefics: ['mars', 'jupiter', 'moon'] },
  { lagna: 10, yogakaraka: 'venus', benefics: ['venus', 'saturn'], neutrals: ['sun', 'mercury'], malefics: ['moon', 'mars', 'jupiter'] },
  { lagna: 11, yogakaraka: null, benefics: ['moon', 'mars'], neutrals: ['jupiter'], malefics: ['sun', 'mercury', 'venus', 'saturn'] },
];

export const functionalNatureFor = (lagna: number): FunctionalNature => FUNCTIONAL_NATURE[((lagna % 12) + 12) % 12]!;

/** Baadhaka ("troublemaker") house: for a movable/fixed/dual lagna it is the 11th/9th/
 *  7th sign from it; its lord is the baadhaka. modality 0=movable,1=fixed,2=dual. */
export function baadhakaHouse(lagnaModality: 'movable' | 'fixed' | 'dual'): number {
  return lagnaModality === 'movable' ? 11 : lagnaModality === 'fixed' ? 9 : 7;
}

/** Every row must place all seven classical planets exactly once, in some column. */
export function functionalNatureIsComplete(): boolean {
  const seven: Graha[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  return FUNCTIONAL_NATURE.every((r) => {
    const placed = [...r.benefics, ...r.neutrals, ...r.malefics, ...(r.unclassified ?? [])];
    return placed.length === 7 && seven.every((g) => placed.filter((x) => x === g).length === 1);
  });
}
