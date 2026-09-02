// BPHS Programme Part 7 — Chapter 26a: graha drishti as a graded quantity.
//
// The central test is the cross-check: BPHS states the same system twice, once as houses
// with quarter-fractions (26.2-5) and once as a continuous function of longitude
// (26.6-12). They must agree exactly at the seven aspect houses.

import { describe, it, expect } from 'vitest';
import {
  VIRUPAS_PER_RUPA, ASPECT_QUARTERS, SPECIAL_FULL_ASPECTS, aspectQuarters,
  aspectAngle, drishtiValueGeneral, drishtiValueSaturn, drishtiValueMars,
  drishtiValueJupiter, drishtiValue, drishtiQuarters, drishtiRupas,
  DRISHTI_DISCONTINUITY_NOTE, GRADED_ASPECT_NOTE,
  grahaAspectsFrom, evaluate,
  type ChartFacts, type Graha,
} from '../src/index.js';

const ARC = (house: number) => (house - 1) * 30;
const GRAHAS9: Graha[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

// ── 26.2-5 the graded house scheme ───────────────────────────────────────────
describe('BPHS 26.2-5 — aspects are graded, for every planet', () => {
  it('grades 3rd/10th a quarter, 5th/9th a half, 4th/8th three-quarters, 7th full', () => {
    expect(ASPECT_QUARTERS[3]).toBe(1);
    expect(ASPECT_QUARTERS[10]).toBe(1);
    expect(ASPECT_QUARTERS[5]).toBe(2);
    expect(ASPECT_QUARTERS[9]).toBe(2);
    expect(ASPECT_QUARTERS[4]).toBe(3);
    expect(ASPECT_QUARTERS[8]).toBe(3);
    expect(ASPECT_QUARTERS[7]).toBe(4);
  });

  it('gives no aspect at all to the 1st, 2nd, 6th, 11th and 12th', () => {
    for (const h of [1, 2, 6, 11, 12]) expect(ASPECT_QUARTERS[h], `house ${h}`).toBe(0);
  });

  it('lets EVERY planet reach seven houses, not one — the upgrade this part makes', () => {
    // The Sun in house 1 previously aspected only house 7.
    const reached = [];
    for (let h = 1; h <= 12; h++) if (aspectQuarters('sun', 1, h) > 0) reached.push(h);
    expect(reached.sort((a, b) => a - b)).toEqual([3, 4, 5, 7, 8, 9, 10]);
    // The old binary view saw only this one.
    expect(grahaAspectsFrom('sun', 1).filter((x) => x != null)).toEqual([7]);
  });

  it('promotes the special houses of Mars, Jupiter and Saturn to full', () => {
    expect(aspectQuarters('saturn', 1, 3)).toBe(4);   // would be 1 for anyone else
    expect(aspectQuarters('saturn', 1, 10)).toBe(4);
    expect(aspectQuarters('jupiter', 1, 5)).toBe(4);  // would be 2
    expect(aspectQuarters('jupiter', 1, 9)).toBe(4);
    expect(aspectQuarters('mars', 1, 4)).toBe(4);     // would be 3
    expect(aspectQuarters('mars', 1, 8)).toBe(4);
    expect(SPECIAL_FULL_ASPECTS.saturn).toEqual([3, 10]);
  });

  it('leaves an ordinary planet partial where a special one is full', () => {
    expect(aspectQuarters('venus', 1, 3)).toBe(1);
    expect(aspectQuarters('venus', 1, 5)).toBe(2);
    expect(aspectQuarters('venus', 1, 4)).toBe(3);
  });

  it('gives every planet a full 7th', () => {
    for (const g of GRAHAS9) expect(aspectQuarters(g, 1, 7), g).toBe(4);
  });

  it('wraps around the houses correctly', () => {
    // From house 10, the 7th is house 4.
    expect(aspectQuarters('sun', 10, 4)).toBe(4);
    expect(aspectQuarters('saturn', 12, 2)).toBe(4);  // Saturn's 3rd from the 12th
  });
});

// ── 26.6-12 the continuous formula, and the cross-check ──────────────────────
describe('BPHS 26.6-12 — the continuous formula reproduces the house scheme', () => {
  it('returns exactly 15/45/30/0/60/45/30/15/0 at houses 3..11', () => {
    const got = [3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => drishtiValueGeneral(ARC(h)));
    expect(got).toEqual([15, 45, 30, 0, 60, 45, 30, 15, 0]);
  });

  it('agrees with the quarter scheme at every one of the twelve houses', () => {
    for (let h = 1; h <= 12; h++) {
      const fromFormula = drishtiQuarters(drishtiValueGeneral(ARC(h)));
      expect(fromFormula, `house ${h}`).toBe(ASPECT_QUARTERS[h]);
    }
  });

  it('is continuous everywhere — no step in the general curve', () => {
    let worst = 0;
    for (let x = 0.5; x < 360; x += 0.25) {
      worst = Math.max(worst, Math.abs(drishtiValueGeneral(x + 0.005) - drishtiValueGeneral(x - 0.005)));
    }
    expect(worst).toBeLessThan(0.1);
  });

  it('never leaves 0..60 virupas', () => {
    for (let x = 0; x < 360; x += 0.5) {
      const v = drishtiValueGeneral(x);
      expect(v, `angle ${x}`).toBeGreaterThanOrEqual(0);
      expect(v, `angle ${x}`).toBeLessThanOrEqual(VIRUPAS_PER_RUPA);
    }
  });

  it('measures the forward arc from aspector to aspected', () => {
    expect(aspectAngle(10, 190)).toBe(180);
    expect(aspectAngle(350, 170)).toBe(180);   // wraps
    expect(aspectAngle(190, 10)).toBe(180);
  });

  it('converts to quarters and rupas', () => {
    expect(drishtiQuarters(60)).toBe(4);
    expect(drishtiQuarters(15)).toBe(1);
    expect(drishtiRupas(60)).toBe(1);
    expect(VIRUPAS_PER_RUPA).toBe(60);
  });
});

// ── 26.9-12 the special-planet curves ────────────────────────────────────────
describe('BPHS 26.9-12 — the special curves peak on their own houses', () => {
  it('Saturn reaches a full 60 at the 3rd and the 10th', () => {
    expect(drishtiValueSaturn(ARC(3))).toBe(60);
    expect(drishtiValueSaturn(ARC(10))).toBe(60);
  });

  it('Mars reaches a full 60 at the 4th and the 8th', () => {
    expect(drishtiValueMars(ARC(4))).toBe(60);
    expect(drishtiValueMars(ARC(8))).toBe(60);
  });

  it('Jupiter reaches a full 60 at the 5th and the 9th', () => {
    expect(drishtiValueJupiter(ARC(5))).toBe(60);
    expect(drishtiValueJupiter(ARC(9))).toBe(60);
  });

  it('keeps the 7th full for all four curves', () => {
    for (const f of [drishtiValueGeneral, drishtiValueSaturn, drishtiValueMars, drishtiValueJupiter]) {
      expect(f(180)).toBe(60);
    }
  });

  it('never exceeds one rupa on any curve, at any angle', () => {
    for (const f of [drishtiValueGeneral, drishtiValueSaturn, drishtiValueMars, drishtiValueJupiter]) {
      for (let x = 0; x < 360; x += 0.5) {
        expect(f(x)).toBeLessThanOrEqual(VIRUPAS_PER_RUPA);
        expect(f(x)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('honours the two different boundary conventions the verses use', () => {
    // Saturn's verses say "above N signs" — exclusive at the bottom, so the full value
    // lands ON 60°. Mars/Jupiter say "N Rāśhis &c" — N signs and more — so theirs lands
    // ON 90°/120°. Reading Mars with Saturn's convention puts its 8th at 45, not 60.
    expect(drishtiValueSaturn(60)).toBe(60);
    expect(drishtiValueMars(90)).toBe(60);
    expect(drishtiValueJupiter(120)).toBe(60);
    expect(drishtiValueMars(210)).toBe(60);
  });

  it('routes each planet to its own curve', () => {
    expect(drishtiValue('saturn', 0, ARC(3))).toBe(60);
    expect(drishtiValue('venus', 0, ARC(3))).toBe(15);     // ordinary planet, quarter
    expect(drishtiValue('mars', 0, ARC(4))).toBe(60);
    expect(drishtiValue('venus', 0, ARC(4))).toBe(45);
  });

  it('records the discontinuities as inherited from the text', () => {
    expect(DRISHTI_DISCONTINUITY_NOTE).toContain('not smoothed');
    expect(GRADED_ASPECT_NOTE).toContain('still correctly answers');
  });
});

// ── Retrofit: minQuarter now works ───────────────────────────────────────────
describe('retrofit — the aspect predicate honours minQuarter (Part 7 sweep)', () => {
  const facts: ChartFacts = {
    lagnaSign: 10,
    planets: {
      sun: { sign: 2, house: 5, longitude: 60 },
      moon: { sign: 5, house: 8, longitude: 178 },
      mars: { sign: 5, house: 8, longitude: 154 },
      mercury: { sign: 1, house: 4, longitude: 48 },
      jupiter: { sign: 9, house: 12, longitude: 298 },
      venus: { sign: 2, house: 5, longitude: 80 },
      saturn: { sign: 11, house: 2, longitude: 354 },
      rahu: { sign: 5, house: 8, longitude: 150 },
      ketu: { sign: 11, house: 2, longitude: 330 },
    },
  };

  it('still defaults to a FULL aspect, so nothing already written changes meaning', () => {
    // Sun in h5 fully aspects h11 only.
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 11 }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 9 }, facts)).toBe(false);
  });

  it('accepts partial aspects when asked', () => {
    // Sun in h5: h9 is the 5th from it → a half aspect.
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 9, minQuarter: 2 }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 9, minQuarter: 3 }, facts)).toBe(false);
  });

  it('ranks the thresholds monotonically', () => {
    // h8 is the 4th from h5 → three-quarters. So minQuarter 1,2,3 pass and 4 fails.
    const at = (q: 1 | 2 | 3 | 4) =>
      evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 8, minQuarter: q }, facts);
    expect([at(1), at(2), at(3), at(4)]).toEqual([true, true, true, false]);
  });

  it('gives a special planet full strength where an ordinary one is partial', () => {
    // Jupiter in h12 → h4 is the 5th from it, its special aspect, so full.
    expect(evaluate({ k: 'aspect', graha: 'jupiter', ontoHouse: 4 }, facts)).toBe(true);
    // The Sun from h5 → h9 is also a 5th, but ordinary, so only half.
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 9 }, facts)).toBe(false);
  });

  it('leaves rasi drishti untouched by minQuarter — it has no quarters', () => {
    const withQ = evaluate({ k: 'aspect', graha: 'sun', ontoGraha: 'moon', kind: 'rasi', minQuarter: 4 }, facts);
    const without = evaluate({ k: 'aspect', graha: 'sun', ontoGraha: 'moon', kind: 'rasi' }, facts);
    expect(withQ).toBe(without);
  });
});
