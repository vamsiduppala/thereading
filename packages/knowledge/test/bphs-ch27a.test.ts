// BPHS Programme Part 9 — Chapter 27a: Sthana bala, the first sixth of Shadbala.
//
// Every component is tested separately. That is deliberate: a wrong sub-component is easy
// to hide inside a total that still looks plausible.

import { describe, it, expect } from 'vitest';
import {
  VIRUPAS_PER_RUPA_27, SHADBALA_PLANETS, SHADBALA_COMPONENTS, STHANA_COMPONENTS,
  shadbalaUchchaBala,
  SAPTAVARGAJA_VIRUPAS, SAPTAVARGA_DIVISIONS, SAPTAVARGAJA_MAX, saptavargajaBala,
  OJHAYUGMA_PER_PLACEMENT, ODD_SIGN_PLANETS, EVEN_SIGN_PLANETS, ojhayugmarasiamsaBala,
  KENDRADI_VIRUPAS, kendradiBala,
  DREKKANA_VIRUPAS, PLANET_GENDER, drekkanaBala,
  sthanaBala, STHANA_BALA_MAX, VS_ENGINE_PLANET_STRENGTH,
  DEEP_EXALTATION_POINTS, exaltationCloseness, VARGA_VISWA, GRAHAS,
  type Graha, type SaptavargajaTier,
} from '../src/index.js';

// ── 27.1 Uchcha bala ─────────────────────────────────────────────────────────
describe('BPHS 27.1 — Uchcha bala', () => {
  it("reproduces the chapter's worked example: Sun at Pisces 12°15' → 50.75 virupas", () => {
    expect(shadbalaUchchaBala('sun', 342.25)).toBeCloseTo(50.75, 6);
  });

  it('is zero at deep debilitation and one full rupa at deep exaltation', () => {
    for (const g of SHADBALA_PLANETS) {
      const p = DEEP_EXALTATION_POINTS[g]!;
      expect(shadbalaUchchaBala(g, p.debilSign * 30 + p.debilDegree), g).toBeCloseTo(0, 6);
      expect(shadbalaUchchaBala(g, p.exaltSign * 30 + p.exaltDegree), g).toBeCloseTo(60, 6);
    }
  });

  it('is exactly Part 1’s exaltationCloseness × 60, for every planet at every longitude', () => {
    // The identity holds because deep exaltation and debilitation are 180° apart.
    for (const g of SHADBALA_PLANETS) {
      for (let lon = 0; lon < 360; lon += 0.25) {
        expect(shadbalaUchchaBala(g, lon)!, `${g} @ ${lon}`)
          .toBeCloseTo(exaltationCloseness(g, lon)! * 60, 9);
      }
    }
  });

  it('never leaves 0..60 virupas', () => {
    for (const g of SHADBALA_PLANETS) {
      for (let lon = 0; lon < 360; lon += 0.5) {
        const v = shadbalaUchchaBala(g, lon)!;
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(60);
      }
    }
  });

  it('declines to score the nodes — Shadbala excludes them (27.1 notes)', () => {
    expect(shadbalaUchchaBala('rahu', 100)).toBeNull();
    expect(shadbalaUchchaBala('ketu', 100)).toBeNull();
    expect(SHADBALA_PLANETS).toHaveLength(7);
    expect(SHADBALA_PLANETS).not.toContain('rahu');
  });
});

// ── 27.2-4 Saptavargaja bala ─────────────────────────────────────────────────
describe('BPHS 27.2-4 — Saptavargaja bala', () => {
  it('matches the verse: 45 / 30 / 20 / 15 / 10 / 4 / 2 virupas', () => {
    expect(SAPTAVARGAJA_VIRUPAS.moolatrikona).toBe(45);
    expect(SAPTAVARGAJA_VIRUPAS.own).toBe(30);
    expect(SAPTAVARGAJA_VIRUPAS['great-friend']).toBe(20);
    expect(SAPTAVARGAJA_VIRUPAS.friend).toBe(15);
    expect(SAPTAVARGAJA_VIRUPAS.neutral).toBe(10);
    expect(SAPTAVARGAJA_VIRUPAS.enemy).toBe(4);
    expect(SAPTAVARGAJA_VIRUPAS['great-enemy']).toBe(2);
  });

  it('declines monotonically down the tiers', () => {
    const order: SaptavargajaTier[] = ['moolatrikona', 'own', 'great-friend', 'friend', 'neutral', 'enemy', 'great-enemy'];
    for (let i = 1; i < order.length; i++) {
      expect(SAPTAVARGAJA_VIRUPAS[order[i]!]).toBeLessThan(SAPTAVARGAJA_VIRUPAS[order[i - 1]!]);
    }
  });

  it('reckons over exactly the seven divisions D1, D2, D3, D7, D9, D12, D30', () => {
    expect([...SAPTAVARGA_DIVISIONS]).toEqual([1, 2, 3, 7, 9, 12, 30]);
  });

  it('tops out at 315 virupas — moolatrikona in all seven', () => {
    expect(SAPTAVARGAJA_MAX).toBe(315);
    expect(saptavargajaBala(() => 'moolatrikona')).toBe(315);
    expect(saptavargajaBala(() => 'great-enemy')).toBe(14);
  });

  it('sums per division rather than averaging', () => {
    const mixed: Record<number, SaptavargajaTier> = {
      1: 'moolatrikona', 2: 'own', 3: 'friend', 7: 'neutral', 9: 'own', 12: 'enemy', 30: 'great-enemy',
    };
    expect(saptavargajaBala((d) => mixed[d]!)).toBe(45 + 30 + 15 + 10 + 30 + 4 + 2);
  });

  it('is a DIFFERENT scale from Vimsopaka’s Varga Viswa — not the same instrument', () => {
    // Vimsopaka has no moolatrikona tier and tops out at 20; this has one and tops at 45.
    expect(Object.keys(VARGA_VISWA)).not.toContain('moolatrikona');
    expect(VARGA_VISWA.own).toBe(20);
    expect(SAPTAVARGAJA_VIRUPAS.own).toBe(30);
  });
});

// ── 27.4 notes — Ojhayugmarasiamsa bala ──────────────────────────────────────
describe('BPHS 27.4 notes — Ojhayugmarasiamsa bala', () => {
  it('gives male and neuter planets their strength in odd signs', () => {
    expect(ODD_SIGN_PLANETS.sort()).toEqual(['jupiter', 'mars', 'mercury', 'saturn', 'sun']);
    expect(ojhayugmarasiamsaBala('sun', 0, 0)).toBe(30);   // Aries rasi and navamsa
    expect(ojhayugmarasiamsaBala('sun', 1, 1)).toBe(0);    // Taurus, even
  });

  it('gives the female planets theirs in even signs', () => {
    expect(EVEN_SIGN_PLANETS.sort()).toEqual(['moon', 'venus']);
    expect(ojhayugmarasiamsaBala('moon', 1, 1)).toBe(30);
    expect(ojhayugmarasiamsaBala('venus', 0, 0)).toBe(0);
  });

  it('scores rasi and navamsa independently, 15 each', () => {
    expect(ojhayugmarasiamsaBala('sun', 0, 1)).toBe(OJHAYUGMA_PER_PLACEMENT);
    expect(ojhayugmarasiamsaBala('sun', 1, 0)).toBe(OJHAYUGMA_PER_PLACEMENT);
  });

  it('covers all seven planets between the two lists, with no overlap', () => {
    const all = [...ODD_SIGN_PLANETS, ...EVEN_SIGN_PLANETS];
    expect(new Set(all).size).toBe(7);
    for (const g of SHADBALA_PLANETS) expect(all).toContain(g);
  });

  it('takes its genders straight from ch 3.19 — no new data was needed', () => {
    for (const g of ODD_SIGN_PLANETS) {
      expect(['male', 'neuter'], g).toContain(GRAHAS[g]!.gender);
    }
    for (const g of EVEN_SIGN_PLANETS) expect(GRAHAS[g]!.gender, g).toBe('female');
  });
});

// ── 27.5 Kendradi bala ───────────────────────────────────────────────────────
describe('BPHS 27.5 — Kendradi bala', () => {
  it('gives 60 in an angle, 30 in a succedent, 15 in a cadent', () => {
    for (const h of [1, 4, 7, 10]) expect(kendradiBala(h), `house ${h}`).toBe(60);
    for (const h of [2, 5, 8, 11]) expect(kendradiBala(h), `house ${h}`).toBe(30);
    for (const h of [3, 6, 9, 12]) expect(kendradiBala(h), `house ${h}`).toBe(15);
  });

  it('halves and quarters a rupa, exactly as the verse says', () => {
    expect(KENDRADI_VIRUPAS.kendra).toBe(VIRUPAS_PER_RUPA_27);
    expect(KENDRADI_VIRUPAS.panaphara).toBe(VIRUPAS_PER_RUPA_27 / 2);
    expect(KENDRADI_VIRUPAS.apoklima).toBe(VIRUPAS_PER_RUPA_27 / 4);
  });

  it('is never zero — every house gives something', () => {
    for (let h = 1; h <= 12; h++) expect(kendradiBala(h)).toBeGreaterThan(0);
  });
});

// ── 27.6 Drekkana bala ───────────────────────────────────────────────────────
describe('BPHS 27.6 — Drekkana bala', () => {
  it('rewards a male planet in the first decanate', () => {
    expect(drekkanaBala('sun', 5)).toBe(DREKKANA_VIRUPAS);
    expect(drekkanaBala('sun', 15)).toBe(0);
    expect(drekkanaBala('sun', 25)).toBe(0);
  });

  it('rewards a female planet in the second and a neuter in the third', () => {
    expect(drekkanaBala('venus', 15)).toBe(DREKKANA_VIRUPAS);
    expect(drekkanaBala('venus', 5)).toBe(0);
    expect(drekkanaBala('saturn', 25)).toBe(DREKKANA_VIRUPAS);
    expect(drekkanaBala('saturn', 15)).toBe(0);
  });

  it('gives every planet exactly one decanate that pays', () => {
    for (const g of SHADBALA_PLANETS) {
      const paying = [5, 15, 25].filter((d) => drekkanaBala(g, d) > 0);
      expect(paying, g).toHaveLength(1);
    }
  });

  it('agrees with the ch 3.19 genders', () => {
    for (const g of SHADBALA_PLANETS) expect(PLANET_GENDER[g], g).toBe(GRAHAS[g]!.gender);
  });
});

// ── The total ────────────────────────────────────────────────────────────────
describe('BPHS 27.1-6 — Sthana bala total', () => {
  it('names five components, and six Shadbala strengths overall', () => {
    expect(STHANA_COMPONENTS).toHaveLength(5);
    expect(SHADBALA_COMPONENTS).toHaveLength(6);
    expect(SHADBALA_COMPONENTS[0]).toBe('sthana');
  });

  it('tops out at 480 virupas — eight rupas', () => {
    expect(STHANA_BALA_MAX).toBe(480);
    expect(STHANA_BALA_MAX / VIRUPAS_PER_RUPA_27).toBe(8);
  });

  it('sums the parts and reports rupas', () => {
    const r = sthanaBala('sun', {
      uchcha: 50.75, saptavargaja: 120, ojhayugmarasiamsa: 30, kendradi: 60, drekkana: 15,
    });
    expect(r.total).toBeCloseTo(275.75, 6);
    expect(r.rupas).toBeCloseTo(275.75 / 60, 6);
    expect(r.graha).toBe('sun');
  });

  it('reaches the stated maximum when every component is maximal', () => {
    const r = sthanaBala('sun', {
      uchcha: 60, saptavargaja: SAPTAVARGAJA_MAX, ojhayugmarasiamsa: 30, kendradi: 60, drekkana: 15,
    });
    expect(r.total).toBe(STHANA_BALA_MAX);
  });

  it('records that it does not replace the engine’s planetStrength', () => {
    expect(VS_ENGINE_PLANET_STRENGTH).toContain('do not replace');
  });
});
