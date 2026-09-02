// BPHS Programme Part 10 — Chapter 27b: Dig, Kala, Naisargika and Cheshta bala.
// Every sub-component tested on its own; Kala bala alone has five.

import { describe, it, expect } from 'vitest';
import {
  foldedArcBala,
  DIG_BALA_ZERO_HOUSE, DIG_BALA_STRONG_HOUSE, digBala,
  NIGHT_STRONG, DAY_STRONG, nathonnathaBala,
  pakshaBala,
  TRIBHAGA_DAY, TRIBHAGA_NIGHT, tribhagaBala,
  PERIOD_LORD_VIRUPAS, varshaMasaDinaHoraBala,
  NAISARGIKA_ASCENDING, naisargikaBalaVirupas,
  AYANA_KHANDAS, ayanaKranti, bhujaFromEquinox, ayanaBala,
  AYANA_SOUTHERN, AYANA_NORTHERN,
  cheshtaBalaLuminary, CHESHTA_LUMINARY_NOTE,
  KALA_BALA_MAX, KALA_SUBCOMPONENTS, kalaBala,
  SHADBALA_PLANETS, shadbalaUchchaBala, naisargikaBala, DIG_BALA_HOUSE,
  type Graha,
} from '../src/index.js';

// ── The shared shape ─────────────────────────────────────────────────────────
describe('BPHS 27 — the fold-and-divide-by-three shape four balas share', () => {
  it('runs 0 at the zero point to one full rupa at the opposite', () => {
    expect(foldedArcBala(0, 0)).toBe(0);
    expect(foldedArcBala(180, 0)).toBe(60);
    expect(foldedArcBala(90, 0)).toBe(30);
  });

  it('folds symmetrically and wraps across 0°', () => {
    expect(foldedArcBala(270, 0)).toBe(foldedArcBala(90, 0));
    expect(foldedArcBala(10, 350)).toBeCloseTo(20 / 3, 9);
  });

  it('never leaves 0..60 for any pair of longitudes', () => {
    for (let a = 0; a < 360; a += 7) {
      for (let z = 0; z < 360; z += 11) {
        const v = foldedArcBala(a, z);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(60);
      }
    }
  });

  it('is what Uchcha bala now uses — the Part 10 retrofit', () => {
    // Sun's deep debilitation is Libra 10° = 190°.
    expect(shadbalaUchchaBala('sun', 342.25)).toBeCloseTo(foldedArcBala(342.25, 190), 9);
  });
});

// ── 27.7 Dig bala ────────────────────────────────────────────────────────────
describe('BPHS 27.7 — Dig bala', () => {
  it('measures from the weak cusp, so strong and zero houses are opposite', () => {
    for (const g of SHADBALA_PLANETS) {
      const zero = DIG_BALA_ZERO_HOUSE[g]!;
      const strong = DIG_BALA_STRONG_HOUSE[g]!;
      expect(((zero + 5) % 12) + 1, g).toBe(strong);
    }
  });

  it('agrees with Part 1’s DIG_BALA_HOUSE on where each planet is strongest', () => {
    for (const g of SHADBALA_PLANETS) {
      expect(DIG_BALA_STRONG_HOUSE[g], g).toBe(DIG_BALA_HOUSE[g]);
    }
  });

  it('gives a full rupa on the strong cusp and nothing on the weak one', () => {
    // Saturn is nil on the ascendant and full on the descendant (the chapter's example).
    expect(digBala('saturn', 100, 100)).toBe(0);
    expect(digBala('saturn', 280, 100)).toBe(60);
  });

  it('scales continuously between, not per house', () => {
    expect(digBala('sun', 145, 100)).toBe(15);
    expect(digBala('sun', 190, 100)).toBe(30);
  });

  it('declines to score the nodes', () => {
    expect(digBala('rahu', 100, 200)).toBeNull();
    expect(digBala('ketu', 100, 200)).toBeNull();
  });
});

// ── 27.8-9 Nathonnatha bala ──────────────────────────────────────────────────
describe('BPHS 27.8-9 — Nathonnatha bala', () => {
  it('gives night planets a full rupa at midnight and nothing at noon', () => {
    for (const g of NIGHT_STRONG) {
      expect(nathonnathaBala(g, 0), g).toBe(60);
      expect(nathonnathaBala(g, 30), g).toBe(0);
    }
  });

  it('reverses that for the day planets', () => {
    for (const g of DAY_STRONG) {
      expect(nathonnathaBala(g, 0), g).toBe(0);
      expect(nathonnathaBala(g, 30), g).toBe(60);
    }
  });

  it('gives Mercury the full rupa always — the verse’s stated exception', () => {
    for (const gh of [0, 7.5, 15, 22.5, 30]) expect(nathonnathaBala('mercury', gh)).toBe(60);
  });

  it('has day and night planets sum to one rupa at every moment', () => {
    for (let gh = 0; gh <= 30; gh += 2.5) {
      expect(nathonnathaBala('moon', gh)! + nathonnathaBala('sun', gh)!).toBe(60);
    }
  });

  it('splits the six non-Mercury planets three and three', () => {
    expect(NIGHT_STRONG).toHaveLength(3);
    expect(DAY_STRONG).toHaveLength(3);
    expect(new Set([...NIGHT_STRONG, ...DAY_STRONG, 'mercury']).size).toBe(7);
  });
});

// ── 27.10-11 Paksha bala ─────────────────────────────────────────────────────
describe('BPHS 27.10-11 — Paksha bala', () => {
  it('gives benefics a full rupa at the full Moon and nothing at the new', () => {
    expect(pakshaBala(180, 0, true)).toBe(60);
    expect(pakshaBala(0, 0, true)).toBe(0);
  });

  it('reverses it for malefics', () => {
    expect(pakshaBala(180, 0, false)).toBe(0);
    expect(pakshaBala(0, 0, false)).toBe(60);
  });

  it('has benefic and malefic shares always summing to one rupa', () => {
    for (let e = 0; e < 360; e += 15) {
      expect(pakshaBala(e, 0, true) + pakshaBala(e, 0, false)).toBeCloseTo(60, 9);
    }
  });

  it('uses the same fold as the other three balas, with the Sun as zero point', () => {
    expect(pakshaBala(97, 12, true)).toBeCloseTo(foldedArcBala(97, 12), 9);
  });
});

// ── 27.12 Tribhaga bala ──────────────────────────────────────────────────────
describe('BPHS 27.12 — Tribhaga bala', () => {
  it('gives Mercury, the Sun and Saturn the thirds of the day', () => {
    expect(TRIBHAGA_DAY).toEqual(['mercury', 'sun', 'saturn']);
    expect(tribhagaBala('mercury', true, 0)).toBe(60);
    expect(tribhagaBala('sun', true, 1)).toBe(60);
    expect(tribhagaBala('saturn', true, 2)).toBe(60);
    expect(tribhagaBala('sun', true, 0)).toBe(0);
  });

  it('gives the Moon, Venus and Mars the thirds of the night', () => {
    expect(TRIBHAGA_NIGHT).toEqual(['moon', 'venus', 'mars']);
    expect(tribhagaBala('moon', false, 0)).toBe(60);
    expect(tribhagaBala('mars', false, 2)).toBe(60);
    expect(tribhagaBala('moon', true, 0)).toBe(0);
  });

  it('gives Jupiter a full rupa at every hour — the one exception', () => {
    for (const isDay of [true, false]) {
      for (const t of [0, 1, 2] as const) expect(tribhagaBala('jupiter', isDay, t)).toBe(60);
    }
  });

  it('pays exactly one planet per third, aside from Jupiter', () => {
    for (const isDay of [true, false]) {
      for (const t of [0, 1, 2] as const) {
        const paid = SHADBALA_PLANETS.filter((g) => g !== 'jupiter' && tribhagaBala(g, isDay, t) > 0);
        expect(paid, `${isDay ? 'day' : 'night'} third ${t}`).toHaveLength(1);
      }
    }
  });
});

// ── 27.13 Varsha / Masa / Dina / Hora bala ───────────────────────────────────
describe('BPHS 27.13 — period-lord strength', () => {
  it('pays 15, 30, 45 and 60 virupas up the four periods', () => {
    expect(PERIOD_LORD_VIRUPAS).toEqual({ varsha: 15, masa: 30, dina: 45, hora: 60 });
  });

  it('sums every lordship a planet happens to hold', () => {
    expect(varshaMasaDinaHoraBala('sun', { varsha: 'sun', hora: 'sun' })).toBe(75);
    expect(varshaMasaDinaHoraBala('sun', { varsha: 'moon' })).toBe(0);
    expect(varshaMasaDinaHoraBala('mars', {
      varsha: 'mars', masa: 'mars', dina: 'mars', hora: 'mars',
    })).toBe(150);
  });
});

// ── 27.14 Naisargika bala ────────────────────────────────────────────────────
describe('BPHS 27.14 — Naisargika bala', () => {
  it('is exactly Part 1’s naisargikaBala × 60, for every planet', () => {
    for (const g of NAISARGIKA_ASCENDING) {
      expect(naisargikaBalaVirupas(g)!, g).toBeCloseTo(naisargikaBala(g)! * 60, 9);
    }
  });

  it('runs one seventh of a rupa up to a full rupa, Saturn to Sun', () => {
    expect(naisargikaBalaVirupas('saturn')).toBeCloseTo(60 / 7, 9);
    expect(naisargikaBalaVirupas('sun')).toBeCloseTo(60, 9);
    expect(NAISARGIKA_ASCENDING[0]).toBe('saturn');
    expect(NAISARGIKA_ASCENDING[6]).toBe('sun');
  });

  it('increases strictly down the list', () => {
    for (let i = 1; i < NAISARGIKA_ASCENDING.length; i++) {
      expect(naisargikaBalaVirupas(NAISARGIKA_ASCENDING[i]!)!)
        .toBeGreaterThan(naisargikaBalaVirupas(NAISARGIKA_ASCENDING[i - 1]!)!);
    }
  });

  it('declines to score the nodes', () => {
    expect(naisargikaBalaVirupas('rahu')).toBeNull();
  });
});

// ── 27.15-17 Ayana bala ──────────────────────────────────────────────────────
describe('BPHS 27.15-17 — Ayana bala', () => {
  it('uses khandas that sum to ninety', () => {
    expect([...AYANA_KHANDAS]).toEqual([45, 33, 12]);
    expect(AYANA_KHANDAS.reduce((a, b) => a + b, 0)).toBe(90);
  });

  it('measures the Bhuja from the nearest equinox, 0-90', () => {
    expect(bhujaFromEquinox(0)).toBe(0);
    expect(bhujaFromEquinox(90)).toBe(90);
    expect(bhujaFromEquinox(180)).toBe(0);
    expect(bhujaFromEquinox(270)).toBe(90);
    expect(bhujaFromEquinox(45)).toBe(45);
  });

  it('accumulates the kranti from 0 at an equinox to 90 at a solstice', () => {
    expect(ayanaKranti(0)).toBe(0);
    expect(ayanaKranti(30)).toBe(45);
    expect(ayanaKranti(60)).toBe(78);
    expect(ayanaKranti(90)).toBe(90);
  });

  it('rises monotonically through the three khandas', () => {
    let prev = -1;
    for (let b = 0; b <= 90; b += 1) {
      const k = ayanaKranti(b);
      expect(k).toBeGreaterThanOrEqual(prev);
      prev = k;
    }
  });

  it('gives the Sun a full rupa at the summer solstice', () => {
    // Tropical 90° — the Sun is northern, so the correction is additive there.
    expect(ayanaBala('sun', 90)).toBeCloseTo(60, 9);
    expect(ayanaBala('sun', 270)).toBeCloseTo(0, 9);
  });

  it('reverses the correction for the Moon and Saturn', () => {
    for (const g of AYANA_SOUTHERN) {
      expect(ayanaBala(g, 270)!, g).toBeCloseTo(60, 9);
      expect(ayanaBala(g, 90)!, g).toBeCloseTo(0, 9);
    }
    for (const g of AYANA_NORTHERN) expect(ayanaBala(g, 90)!, g).toBeCloseTo(60, 9);
  });

  it('keeps Mercury always additive, so it never drops below half a rupa', () => {
    for (let l = 0; l < 360; l += 5) {
      const v = ayanaBala('mercury', l)!;
      expect(v).toBeGreaterThanOrEqual(30);
      expect(v).toBeLessThanOrEqual(60);
    }
  });

  it('never leaves 0..60 for any planet at any longitude', () => {
    for (const g of SHADBALA_PLANETS) {
      for (let l = 0; l < 360; l += 3) {
        const v = ayanaBala(g, l)!;
        expect(v, `${g} @ ${l}`).toBeGreaterThanOrEqual(0);
        expect(v, `${g} @ ${l}`).toBeLessThanOrEqual(60);
      }
    }
  });
});

// ── 27.18 Cheshta for the luminaries, and the Kala total ─────────────────────
describe('BPHS 27.18 — Cheshta bala for the luminaries', () => {
  it('borrows the Sun’s Ayana bala and the Moon’s Paksha bala', () => {
    const sunAyana = ayanaBala('sun', 90)!;
    expect(cheshtaBalaLuminary('sun', sunAyana)).toBe(sunAyana);
    const moonPaksha = pakshaBala(180, 0, true);
    expect(cheshtaBalaLuminary('moon', moonPaksha)).toBe(moonPaksha);
  });

  it('says why — neither luminary retrogrades', () => {
    expect(CHESHTA_LUMINARY_NOTE).toContain('retrograde');
  });
});

describe('BPHS 27.8-17 — Kala bala total', () => {
  it('names five sub-components and tops out at 390 virupas', () => {
    expect(KALA_SUBCOMPONENTS).toHaveLength(5);
    expect(KALA_BALA_MAX).toBe(390);
  });

  it('sums its parts', () => {
    expect(kalaBala({
      nathonnatha: 60, paksha: 60, tribhaga: 60, varshaMasaDinaHora: 150, ayana: 60,
    })).toBe(KALA_BALA_MAX);
    expect(kalaBala({
      nathonnatha: 30, paksha: 20, tribhaga: 0, varshaMasaDinaHora: 45, ayana: 40,
    })).toBe(135);
  });
});
