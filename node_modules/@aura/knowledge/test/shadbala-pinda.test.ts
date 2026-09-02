// The bhava madhya convention, and the Shadbala assembler.
//
// The test that earns its place is `a partial total is never judged`. A Shadbala total missing
// one component is systematically low, so comparing it to chapter 27's requirement would fail
// strong planets quietly and in the same direction every time. Everything else here is
// arithmetic; that one is the safety property.

import { describe, it, expect } from 'vitest';
import {
  BHAVA_ARC, BHAVA_SANDHI_HALF_ARC, bhavaMadhya, bhavaSandhi, bhavaOf,
  BHAVA_MADHYA_CONVENTION, BHAVA_MADHYA_IS_A_CHOICE,
  shadbalaPinda, shadbalaVerdictOf, meetsShadbalaRequirement,
  INCOMPLETE_TOTALS_ARE_NEVER_JUDGED, SHADBALA_ASSEMBLER_CLOSES_A_GAP,
  SHADBALA_REQUIRED, SHADBALA_PLANETS, cuspStrength,
  type ShadbalaInput,
} from '../src/index.js';

describe('bhava madhya — the equal-house convention', () => {
  it('puts the ascendant’s exact degree at the MIDPOINT of the 1st house', () => {
    // This is the whole content of the convention, and what distinguishes it from whole-sign.
    expect(bhavaMadhya(15, 1)).toBe(15);
    expect(bhavaMadhya(287.4, 1)).toBeCloseTo(287.4, 9);
  });

  it('spaces every following midpoint exactly 30° on', () => {
    for (let h = 1; h <= 12; h++) {
      expect(bhavaMadhya(15, h as 1)).toBeCloseTo((15 + 30 * (h - 1)) % 360, 9);
    }
    expect(BHAVA_ARC).toBe(30);
  });

  it('puts the sandhi 15° either side, which is where cuspStrength already fell to zero', () => {
    const s = bhavaSandhi(15, 1);
    expect(s.start).toBe(0);
    expect(s.end).toBe(30);
    expect(BHAVA_SANDHI_HALF_ARC).toBe(15);
    // Part 2 wrote cuspStrength for this convention before a source for the cusp existed.
    expect(cuspStrength(15, 15)).toBe(1);
    expect(cuspStrength(30, 15)).toBe(0);
    expect(cuspStrength(0, 15)).toBe(0);
  });

  it('wraps across 0° Aries without drifting', () => {
    expect(bhavaMadhya(350, 2)).toBeCloseTo(20, 9);
    expect(bhavaSandhi(350, 1).start).toBeCloseTo(335, 9);
    expect(bhavaSandhi(350, 1).end).toBeCloseTo(5, 9);
  });

  it('assigns a bhava by midpoint, so sign and bhava can differ', () => {
    // The point of the convention: 20° past a 15° Aries ascendant is still Aries but is the
    // 2nd bhava. Whole-sign counting cannot say that.
    expect(bhavaOf(15, 15)).toBe(1);
    expect(bhavaOf(15, 29)).toBe(1);
    expect(bhavaOf(15, 31)).toBe(2);
    // House 1 spans 0-30 around a 15° midpoint, so 5° is in it; house 12 spans 330-0.
    expect(bhavaOf(15, 5)).toBe(1);
    expect(bhavaOf(15, 340)).toBe(12);
  });

  it('is labelled equal-house and explicitly NOT Sripati', () => {
    expect(BHAVA_MADHYA_CONVENTION).toContain('EQUAL-HOUSE');
    expect(BHAVA_MADHYA_CONVENTION).toContain('NOT Sripati');
    expect(BHAVA_MADHYA_IS_A_CHOICE).toContain('OURS');
  });
});

// A complete input for one planet, so the assembler can be exercised end to end.
const full = (over: Partial<ShadbalaInput> = {}): ShadbalaInput => ({
  lagnaLongitude: 0,
  sunLongitude: 10,
  moonLongitude: 190,
  ghatisFromMidnight: 15,
  isDay: true,
  tribhagaThird: 0,
  periodLords: { varsha: 'jupiter', masa: 'venus', dina: 'mars', hora: 'saturn' },
  planets: {
    jupiter: {
      longitude: 95,
      tropicalLongitude: 119,
      house: 4,
      navamsaSign: 3,
      saptavargajaTier: () => 'own',
      meanLongitude: 94,
      seeghrocha: 100,
      drik: { benefic: 20, malefic: 5 },
    },
  },
  ...over,
});

describe('shadbalaPinda — the assembler', () => {
  it('computes all six components when everything is supplied', () => {
    const r = shadbalaPinda(full())['jupiter']!;
    expect(r.complete).toBe(true);
    expect(r.missing).toEqual([]);
    for (const k of ['sthana', 'dig', 'kala', 'cheshta', 'naisargika', 'drik'] as const) {
      expect(r.components[k], k).not.toBeNull();
    }
    expect(r.total).toBeGreaterThan(0);
  });

  it('sums exactly the six components and nothing else', () => {
    const r = shadbalaPinda(full())['jupiter']!;
    const sum = Object.values(r.components).reduce((a, b) => a + (b ?? 0), 0);
    expect(r.total).toBeCloseTo(sum, 9);
  });

  it('measures dig bala from the planet’s WEAKEST house cusp, not the ascendant', () => {
    // Jupiter's zero-dig house is the 7th. Moving the ascendant moves that cusp, so the same
    // planet gets a different dig bala — which is what makes the bhava madhya load-bearing.
    const a = shadbalaPinda(full())['jupiter']!.components.dig!;
    const b = shadbalaPinda(full({ lagnaLongitude: 90 }))['jupiter']!.components.dig!;
    expect(a).not.toBeCloseTo(b, 6);
  });

  it('excludes the nodes, as chapter 27 does', () => {
    expect(SHADBALA_PLANETS).not.toContain('rahu');
    expect(SHADBALA_PLANETS).not.toContain('ketu');
    const r = shadbalaPinda(full({
      planets: { ...full().planets, rahu: { longitude: 200, house: 7 } },
    }));
    expect(r['rahu']).toBeUndefined();
  });

  it('gives the luminaries their borrowed Cheshta, not a motion figure', () => {
    // 27.18: the Sun's Cheshta IS its Ayana bala, the Moon's IS its Paksha bala. Neither
    // retrogrades, so a motion-based figure for them would be an invention.
    const withLuminaries = shadbalaPinda(full({
      planets: {
        sun: { longitude: 10, tropicalLongitude: 34, house: 1, navamsaSign: 0, saptavargajaTier: () => 'own', drik: { benefic: 5, malefic: 5 } },
        moon: { longitude: 190, tropicalLongitude: 214, house: 7, navamsaSign: 6, saptavargajaTier: () => 'own', drik: { benefic: 5, malefic: 5 } },
      },
    }));
    // Both resolve without any meanLongitude/seeghrocha being supplied.
    expect(withLuminaries['sun']!.components.cheshta).not.toBeNull();
    expect(withLuminaries['moon']!.components.cheshta).not.toBeNull();
    expect(withLuminaries['sun']!.missing).not.toContain('cheshta');
  });
});

describe('the guard — a partial total is never judged', () => {
  it('reports which components are missing rather than silently zeroing them', () => {
    const r = shadbalaPinda({
      lagnaLongitude: 0,
      planets: { saturn: { longitude: 200, house: 7 } },
    })['saturn']!;
    expect(r.complete).toBe(false);
    expect(r.missing).toContain('kala');
    expect(r.missing).toContain('drik');
    expect(r.missing).toContain('sthana');
    // Naisargika needs nothing but the planet, so it is still there.
    expect(r.components.naisargika).not.toBeNull();
  });

  it('returns "unknown" for an incomplete total, NEVER "weak"', () => {
    // The trap: a partial total is systematically low, so judging it fails strong planets
    // quietly and in one direction. This is the assertion that stops that.
    const r = shadbalaPinda({
      lagnaLongitude: 0,
      planets: { saturn: { longitude: 200, house: 7 } },
    })['saturn']!;
    expect(r.total).toBeLessThan(SHADBALA_REQUIRED['saturn']!);   // it WOULD read as weak
    expect(shadbalaVerdictOf(r)).toBe('unknown');                  // but it is not judged
    expect(meetsShadbalaRequirement(r)).toBeNull();
  });

  it('judges a complete total by chapter 27’s own threshold', () => {
    const r = shadbalaPinda(full())['jupiter']!;
    expect(r.complete).toBe(true);
    const verdict = shadbalaVerdictOf(r);
    expect(['very-strong', 'strong', 'weak']).toContain(verdict);
    expect(verdict).not.toBe('unknown');
    // And the verdict agrees with the threshold rather than being independent of it.
    expect(meetsShadbalaRequirement(r)).toBe(r.total >= SHADBALA_REQUIRED['jupiter']!);
  });

  it('records why the guard exists', () => {
    expect(INCOMPLETE_TOTALS_ARE_NEVER_JUDGED).toContain('same direction every time');
    expect(INCOMPLETE_TOTALS_ARE_NEVER_JUDGED).toContain('Silence, not a');
    expect(SHADBALA_ASSEMBLER_CLOSES_A_GAP).toContain('SEVEN rules');
  });
});
