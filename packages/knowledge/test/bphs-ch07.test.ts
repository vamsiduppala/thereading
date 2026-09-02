// BPHS Programme Part 5 — Chapter 7: Vimsopaka bala, the first arbitration instrument.

import { describe, it, expect } from 'vitest';
import {
  VIMSOPAKA_WEIGHTS, VIMSOPAKA_TOTAL, VARGA_VISWA, vargaViswaTier,
  vimsopakaBala, vimsopakaBand, VIMSOPAKA_BANDS, VIMSOPAKA_EXALTATION_NOTE,
  VIMSOPAKA_MINIMUM, VIMSOPAKA_FLOOR_NOTE,
  sunDistanceStrength, SUN_DISTANCE_NOTE,
  VARGA_USE, VARGA_LORD_RULES,
  HOUSE_CATEGORIES, categoriesOfHouse,
  VARGA_SCHEMES, SHODASAVARGA, DIVISIONALS, BHAVAS,
  CLASSICAL_SEVEN, lordOfSign,
  type VargaScheme,
} from '../src/index.js';

const SCHEMES = Object.keys(VARGA_SCHEMES) as VargaScheme[];

// ── 7.17-25 the weights ──────────────────────────────────────────────────────
describe('BPHS 7.17-25 — Vimsopaka weights', () => {
  it('every scheme sums to exactly 20 — the "vimsopaka" in the name', () => {
    for (const s of SCHEMES) {
      const sum = Object.values(VIMSOPAKA_WEIGHTS[s]).reduce((a, b) => a + b, 0);
      expect(sum, s).toBeCloseTo(VIMSOPAKA_TOTAL, 9);
    }
  });

  it('weights cover exactly the divisions of their scheme — no more, no fewer', () => {
    for (const s of SCHEMES) {
      const weighted = Object.keys(VIMSOPAKA_WEIGHTS[s]).map(Number).sort((a, b) => a - b);
      expect(weighted, s).toEqual([...VARGA_SCHEMES[s]].sort((a, b) => a - b));
    }
  });

  it('matches the verse for Shadvarga: 6, 2, 4, 5, 2, 1', () => {
    const w = VIMSOPAKA_WEIGHTS.shadvarga;
    expect([w[1], w[2], w[3], w[9], w[12], w[30]]).toEqual([6, 2, 4, 5, 2, 1]);
  });

  it('matches the verse for Saptavarga: 5, 2, 3, 2½, 4½, 2, 1', () => {
    const w = VIMSOPAKA_WEIGHTS.saptavarga;
    expect([w[1], w[2], w[3], w[7], w[9], w[12], w[30]]).toEqual([5, 2, 3, 2.5, 4.5, 2, 1]);
  });

  it('matches 7.20 for Dasavarga: 3 for Rashi, 5 for Shashtiamsa, 1½ for the other eight', () => {
    const w = VIMSOPAKA_WEIGHTS.dasavarga;
    expect(w[1]).toBe(3);
    expect(w[60]).toBe(5);
    const others = VARGA_SCHEMES.dasavarga.filter((d) => d !== 1 && d !== 60);
    expect(others).toHaveLength(8);
    for (const d of others) expect(w[d], `D${d}`).toBe(1.5);
  });

  it('matches 7.21-25 for Shodasavarga, with nine divisions at a half', () => {
    const w = VIMSOPAKA_WEIGHTS.shodasavarga;
    expect([w[2], w[30], w[3], w[16], w[9], w[1], w[60]]).toEqual([1, 1, 1, 2, 3, 3.5, 4]);
    const halves = SHODASAVARGA.filter((d) => w[d] === 0.5);
    expect(halves).toHaveLength(9);
  });

  it('shifts emphasis off the birth chart as the scheme widens', () => {
    // D1 carries 6 of 20 in Shadvarga but only 3.5 in Shodasavarga.
    expect(VIMSOPAKA_WEIGHTS.shadvarga[1]!).toBeGreaterThan(VIMSOPAKA_WEIGHTS.shodasavarga[1]!);
  });
});

// ── 7.17-20 cross-check against Part 4 ───────────────────────────────────────
describe('BPHS 7.17-20 — independently confirms Part 4\'s scheme membership', () => {
  it('Shadvarga is Rashi, Hora, decanate, Navamsa, Dwadasamsa, Trimsamsa', () => {
    expect([...VARGA_SCHEMES.shadvarga].sort((a, b) => a - b)).toEqual([1, 2, 3, 9, 12, 30]);
  });

  it('Dasavarga adds Dasamsa, Shodasamsa and Shashtiamsa to the Saptavarga', () => {
    const added = VARGA_SCHEMES.dasavarga.filter((d) => !VARGA_SCHEMES.saptavarga.includes(d));
    expect(added.sort((a, b) => a - b)).toEqual([10, 16, 60]);
  });
});

// ── 7.21-25 Varga Viswa ──────────────────────────────────────────────────────
describe('BPHS 7.21-25 — Varga Viswa tiers', () => {
  it('matches the verse: 20 / 18 / 15 / 10 / 7 / 5', () => {
    expect(VARGA_VISWA.own).toBe(20);
    expect(VARGA_VISWA['great-friend']).toBe(18);
    expect(VARGA_VISWA.friend).toBe(15);
    expect(VARGA_VISWA.neutral).toBe(10);
    expect(VARGA_VISWA.enemy).toBe(7);
    expect(VARGA_VISWA['great-enemy']).toBe(5);
  });

  it('declines monotonically', () => {
    const order = ['own', 'great-friend', 'friend', 'neutral', 'enemy', 'great-enemy'] as const;
    for (let i = 1; i < order.length; i++) {
      expect(VARGA_VISWA[order[i]!]).toBeLessThan(VARGA_VISWA[order[i - 1]!]);
    }
  });

  it('gives a planet its own sign the full 20', () => {
    for (const g of CLASSICAL_SEVEN) {
      const ownSign = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].find((s) => lordOfSign(s) === g)!;
      expect(vargaViswaTier(g, ownSign)).toBe('own');
    }
  });

  it('falls back to natural relationship when no compound relation is supplied', () => {
    // Sun in Libra (Venus): Venus is the Sun's natural enemy.
    expect(vargaViswaTier('sun', 6)).toBe('enemy');
    // Sun in Cancer (Moon): friend.
    expect(vargaViswaTier('sun', 3)).toBe('friend');
  });

  it('uses a supplied compound relation to reach the extreme tiers', () => {
    expect(vargaViswaTier('sun', 6, 'great-enemy')).toBe('great-enemy');
    expect(vargaViswaTier('sun', 3, 'great-friend')).toBe('great-friend');
  });

  it('own sign always wins over any supplied relation', () => {
    expect(vargaViswaTier('sun', 4, 'great-enemy')).toBe('own'); // Sun in Leo
  });

  it('records that BPHS states no separate figure for exaltation', () => {
    expect(VIMSOPAKA_EXALTATION_NOTE).toContain('interpolation');
  });
});

// ── 7.26-27 the score itself ─────────────────────────────────────────────────
describe('BPHS 7.26-27 — Vimsopaka proportional evaluation', () => {
  // Rahu owns no sign, so the own-sign branch never fires for it and a forced uniform
  // tier is applied in every division. That isolates the scaling law: because the weights
  // sum to 20, a uniform tier T must total exactly VARGA_VISWA[T].
  //
  // (Using a classical planet here would be wrong, and was: own sign always wins over a
  // supplied tier — asserted separately below — so forcing `great-enemy` cannot apply in a
  // division the planet genuinely rules.)
  it('a uniform tier totals exactly that tier’s viswa', () => {
    for (const s of SCHEMES) {
      expect(vimsopakaBala('rahu', 123.4, s, () => 'own').total, s).toBeCloseTo(20, 9);
      expect(vimsopakaBala('rahu', 123.4, s, () => 'great-enemy').total, s).toBeCloseTo(5, 9);
      expect(vimsopakaBala('rahu', 123.4, s, () => 'neutral').total, s).toBeCloseTo(10, 9);
    }
  });

  it('bands the extremes as the verse does', () => {
    expect(vimsopakaBala('rahu', 123.4, 'dasavarga', () => 'own').band).toBe('wholly-favourable');
    expect(vimsopakaBala('rahu', 123.4, 'dasavarga', () => 'great-enemy').band).toBe('ineffective');
  });

  it('scores each division as weight × viswa ÷ 20', () => {
    const r = vimsopakaBala('sun', 123.4, 'shadvarga', () => 'friend');
    for (const d of r.divisions) {
      expect(d.score).toBeCloseTo((d.weight * d.viswa) / 20, 9);
    }
    expect(r.total).toBeCloseTo(r.divisions.reduce((s, d) => s + d.score, 0), 9);
  });

  it('never leaves the 5..20 range, for any planet at any longitude', () => {
    for (const g of CLASSICAL_SEVEN) {
      for (const s of SCHEMES) {
        for (const lon of [3.2, 61.7, 128.4, 199.9, 271.1, 340.5]) {
          const r = vimsopakaBala(g, lon, s);
          expect(r.total, `${g} ${s} @${lon}`).toBeGreaterThanOrEqual(5);
          expect(r.total, `${g} ${s} @${lon}`).toBeLessThanOrEqual(20);
        }
      }
    }
  });

  it('has a floor of exactly 5, which is why the lowest boundary is inclusive', () => {
    // Weights sum to 20 and the smallest viswa is 5, so 20 x 5 / 20 = 5 is the minimum.
    // Read exclusively, the verse's "below 5" band could never fire for any chart.
    expect(VIMSOPAKA_MINIMUM).toBe(5);
    expect(vimsopakaBala('rahu', 123.4, 'dasavarga', () => 'great-enemy').total).toBeCloseTo(5, 9);
    expect(vimsopakaBand(5).band).toBe('ineffective');
    expect(VIMSOPAKA_FLOOR_NOTE).toContain('unreachable');
  });

  it('bands the total per the verse: <=5, 5-10, 10-15, >15', () => {
    expect(vimsopakaBand(4).band).toBe('ineffective');
    expect(vimsopakaBand(7).band).toBe('some-good');
    expect(vimsopakaBand(12).band).toBe('mediocre');
    expect(vimsopakaBand(17).band).toBe('wholly-favourable');
    expect(VIMSOPAKA_BANDS).toHaveLength(4);
  });

  it('reports when only natural relationships were available', () => {
    expect(vimsopakaBala('sun', 123.4, 'shadvarga').naturalOnly).toBe(true);
    expect(vimsopakaBala('sun', 123.4, 'shadvarga', () => 'friend').naturalOnly).toBe(false);
    expect(vimsopakaBala('sun', 123.4, 'shadvarga').note).toContain('compound relationship');
  });

  it('cannot reach the extreme tiers without a chart — a stated limitation, not a gap', () => {
    const r = vimsopakaBala('sun', 123.4, 'dasavarga');
    for (const d of r.divisions) {
      expect(['own', 'friend', 'neutral', 'enemy']).toContain(d.tier);
    }
  });

  it('produces a division entry for every division of the scheme', () => {
    for (const s of SCHEMES) {
      expect(vimsopakaBala('mars', 88.8, s).divisions).toHaveLength(VARGA_SCHEMES[s].length);
    }
  });
});

// ── 7.28-29 Sun distance ─────────────────────────────────────────────────────
describe('BPHS 7.28-29 — strength by distance from the Sun', () => {
  it('is zero at exact conjunction and full at exact opposition', () => {
    expect(sunDistanceStrength(100, 100)).toBe(0);
    expect(sunDistanceStrength(280, 100)).toBeCloseTo(1, 9);
  });

  it('ramps linearly between — the verse\'s "rule of three"', () => {
    expect(sunDistanceStrength(190, 100)).toBeCloseTo(0.5, 9);
    expect(sunDistanceStrength(145, 100)).toBeCloseTo(0.25, 9);
  });

  it('is symmetric either side of the Sun and wraps across 0°', () => {
    expect(sunDistanceStrength(145, 100)).toBeCloseTo(sunDistanceStrength(55, 100), 9);
    expect(sunDistanceStrength(5, 355)).toBeCloseTo(10 / 180, 9);
  });

  it('grades what a binary combust flag cannot', () => {
    // Both would be flagged "combust"; they are not equally weakened.
    expect(sunDistanceStrength(111, 100)).toBeGreaterThan(sunDistanceStrength(103, 100));
  });

  it('carries Santhanam\'s caution against over-reading it', () => {
    expect(SUN_DISTANCE_NOTE).toContain('still fructify');
  });
});

// ── 7.1-8 reconciliation ─────────────────────────────────────────────────────
describe('BPHS 7.1-8 — use of the divisions, reconciled with the first corpus', () => {
  it('names a use for all sixteen', () => {
    expect(Object.keys(VARGA_USE).map(Number).sort((a, b) => a - b))
      .toEqual([...SHODASAVARGA].sort((a, b) => a - b));
  });

  it('agrees with the existing DIVISIONALS table on what each is read for', () => {
    // Same subject in both, checked on the distinctive ones.
    const area = (d: number) => DIVISIONALS.find((x) => x.division === d)!.area.toLowerCase();
    expect(area(2)).toContain('wealth');
    expect(area(9)).toContain('marriage');       // BPHS: "the spouse"
    expect(area(10)).toContain('career');        // BPHS: "power, position and livelihood"
    expect(area(12)).toContain('parents');
    expect(area(24)).toContain('learning');      // BPHS: "academic achievement"
    expect(area(30)).toContain('misfortune');    // BPHS: "evils"
  });

  it('keeps two first-corpus attributions BPHS does not make', () => {
    // D40 "maternal legacy" and D45 "paternal legacy" are not in BPHS. Not contradictory,
    // so left in place and recorded rather than removed.
    expect(VARGA_USE[40]).not.toContain('maternal');
    expect(VARGA_USE[45]).not.toContain('paternal');
    expect(DIVISIONALS.find((x) => x.division === 40)!.area).toContain('maternal');
  });

  it('carries the two division-quality rules as attributed', () => {
    expect(VARGA_LORD_RULES).toHaveLength(2);
    expect(VARGA_LORD_RULES[0]!.attribution).toContain('Garga');
    expect(VARGA_LORD_RULES[1]!.attribution).toBe('root text');
  });
});

// ── 7.33-36 house categories ─────────────────────────────────────────────────
describe('BPHS 7.33-36 — house categories', () => {
  it('partitions all twelve houses into kendra / panaphara / apoklima', () => {
    const all = [
      ...HOUSE_CATEGORIES.kendra,
      ...HOUSE_CATEGORIES.panaphara,
      ...HOUSE_CATEGORIES.apoklima,
    ].sort((a, b) => a - b);
    expect(all).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('matches the verse for the named sets', () => {
    expect(HOUSE_CATEGORIES.kona).toEqual([5, 9]);
    expect(HOUSE_CATEGORIES.trika).toEqual([6, 8, 12]);
    expect(HOUSE_CATEGORIES.chaturasra).toEqual([4, 8]);
    expect(HOUSE_CATEGORIES.upachaya).toEqual([3, 6, 10, 11]);
  });

  it('reports every category a house belongs to', () => {
    expect(categoriesOfHouse(1)).toContain('kendra');
    expect(categoriesOfHouse(8)).toEqual(expect.arrayContaining(['panaphara', 'trika', 'chaturasra']));
    expect(categoriesOfHouse(10)).toEqual(expect.arrayContaining(['kendra', 'upachaya']));
  });

  it('agrees with the existing BHAVAS category data', () => {
    for (const h of HOUSE_CATEGORIES.kendra) {
      expect(BHAVAS.find((b) => b.number === h)!.categories).toContain('kendra');
    }
    for (const h of HOUSE_CATEGORIES.upachaya) {
      expect(BHAVAS.find((b) => b.number === h)!.categories).toContain('upachaya');
    }
  });
});
