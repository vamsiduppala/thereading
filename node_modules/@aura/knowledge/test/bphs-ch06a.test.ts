// BPHS Programme Part 3 — Chapter 6a, the varga catalogue and constructions D1…D24.
//
// The central test here is the cross-check: BPHS's stated start rule for each division
// must agree with what `vargaSign()` actually computes, for every division and every
// sign. That is what independently confirms eleven constructions previously verified
// only against the first corpus.

import { describe, it, expect } from 'vitest';
import {
  SHODASAVARGA, NON_BPHS_DIVISORS, isShodasavarga,
  VARGA_START, vargaStartSign,
  bphsHoraLord as horaLord, navamsaClass, NAVAMSA_CLASS_CYCLE, NAVAMSA_CLASS_MEANING,
  dasamsaRuler, DASAMSA_DIRECTION_LORDS,
  drekkanaSage, DREKKANA_SAGES,
  vargaSign,
} from '../src/index.js';

const SIGNS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// ── 6.2-4 the canonical list ─────────────────────────────────────────────────
describe('BPHS 6.2-4 — the Shodasavarga', () => {
  it('names exactly sixteen divisions', () => {
    expect(SHODASAVARGA).toHaveLength(16);
  });

  it('lists them in the verse order: 1,2,3,4,7,9,10,12,16,20,24,27,30,40,45,60', () => {
    expect([...SHODASAVARGA]).toEqual([1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60]);
  });

  it('excludes D5, D6, D8 and D11 — computed by the codebase but not in BPHS\'s sixteen', () => {
    for (const d of NON_BPHS_DIVISORS) expect(isShodasavarga(d)).toBe(false);
    expect(isShodasavarga(9)).toBe(true);
    expect(isShodasavarga(60)).toBe(true);
  });

  it('every division in the list is computable by the engine', () => {
    for (const d of SHODASAVARGA) {
      expect(() => vargaSign(123.45, d)).not.toThrow();
    }
  });
});

// ── The cross-check: BPHS's start rules vs the engine's constructions ────────
describe('BPHS 6.5-23 — stated start rules agree with vargaSign() for every sign', () => {
  // Divisions whose counting runs one-per-sign from a start point. D2 and D3 step
  // differently and are checked separately below.
  const RUNNING = [4, 7, 9, 10, 12, 16, 20, 24];

  for (const divisor of RUNNING) {
    it(`D${divisor} (${VARGA_START[divisor]!.name}, ${VARGA_START[divisor]!.verse}) starts where BPHS says, for all 12 signs`, () => {
      for (const sign of SIGNS) {
        const expected = vargaStartSign(divisor, sign);
        // The first part of the sign must land on the stated start sign.
        const actual = vargaSign(sign * 30 + 0.01, divisor);
        expect(actual, `D${divisor} sign ${sign}`).toBe(expected);
      }
    });
  }

  it('D9 counts from the sign itself (movable), the 9th (fixed), the 5th (dual) — 6.12', () => {
    expect(vargaStartSign(9, 0)).toBe(0);    // Aries movable → Aries
    expect(vargaStartSign(9, 1)).toBe(9);    // Taurus fixed → Capricorn
    expect(vargaStartSign(9, 2)).toBe(6);    // Gemini dual → Libra
  });

  it('D10 counts from the sign for odd, the 9th for even — 6.13-14', () => {
    expect(vargaStartSign(10, 0)).toBe(0);   // Aries odd → Aries
    expect(vargaStartSign(10, 1)).toBe(9);   // Taurus even → Capricorn
  });

  it('D7 counts from the sign for odd, the 7th for even — 6.10-11', () => {
    expect(vargaStartSign(7, 0)).toBe(0);    // Aries → Aries
    expect(vargaStartSign(7, 1)).toBe(7);    // Taurus → Scorpio (book's own example)
  });

  it('D16 starts Aries/Leo/Sagittarius and D20 starts Aries/Sagittarius/Leo — 6.16, 6.17-21', () => {
    expect([vargaStartSign(16, 0), vargaStartSign(16, 1), vargaStartSign(16, 2)]).toEqual([0, 4, 8]);
    expect([vargaStartSign(20, 0), vargaStartSign(20, 1), vargaStartSign(20, 2)]).toEqual([0, 8, 4]);
  });

  it('D24 starts Leo for odd signs and Cancer for even — 6.22-23', () => {
    expect(vargaStartSign(24, 0)).toBe(4);   // Leo
    expect(vargaStartSign(24, 1)).toBe(3);   // Cancer
  });

  it('D4 and D12 both start from the sign itself — 6.9, 6.15', () => {
    for (const sign of SIGNS) {
      expect(vargaStartSign(4, sign)).toBe(sign);
      expect(vargaStartSign(12, sign)).toBe(sign);
    }
  });
});

// ── 6.7-8 Drekkana ───────────────────────────────────────────────────────────
describe('BPHS 6.7-8 — Drekkana', () => {
  it('places the three decanates in the 1st, 5th and 9th from the sign', () => {
    for (const sign of SIGNS) {
      expect(vargaSign(sign * 30 + 1, 3)).toBe(sign);
      expect(vargaSign(sign * 30 + 15, 3)).toBe((sign + 4) % 12);
      expect(vargaSign(sign * 30 + 25, 3)).toBe((sign + 8) % 12);
    }
  });

  it('matches the book\'s speculum rows (Aries 1/5/9, Leo 5/9/1, Pisces 12/4/8)', () => {
    // Speculum is 1-indexed; our signs are 0-indexed.
    expect([1, 15, 25].map((d) => vargaSign(0 * 30 + d, 3) + 1)).toEqual([1, 5, 9]);
    expect([1, 15, 25].map((d) => vargaSign(4 * 30 + d, 3) + 1)).toEqual([5, 9, 1]);
    expect([1, 15, 25].map((d) => vargaSign(11 * 30 + d, 3) + 1)).toEqual([12, 4, 8]);
  });

  it('names the three decanate sages', () => {
    expect(DREKKANA_SAGES).toHaveLength(3);
    expect(drekkanaSage(5)).toBe('Narada');
    expect(drekkanaSage(15)).toBe('Agasthya');
    expect(drekkanaSage(25)).toBe('Doorvasa');
  });
});

// ── 6.5-6 Hora ───────────────────────────────────────────────────────────────
describe('BPHS 6.5-6 — Hora', () => {
  it('gives the Sun the first half of an odd sign and the Moon the second', () => {
    expect(horaLord(0, 5)).toBe('sun');    // Aries first half
    expect(horaLord(0, 20)).toBe('moon');  // Aries second half
  });

  it('reverses it for an even sign', () => {
    expect(horaLord(1, 5)).toBe('moon');   // Taurus first half
    expect(horaLord(1, 20)).toBe('sun');
  });

  it('reproduces the book\'s speculum for all twelve signs', () => {
    // Odd signs (Ar, Ge, Le, Li, Sg, Aq): Sun then Moon. Even: Moon then Sun.
    const first = SIGNS.map((s) => horaLord(s, 1));
    expect(first).toEqual(['sun', 'moon', 'sun', 'moon', 'sun', 'moon',
      'sun', 'moon', 'sun', 'moon', 'sun', 'moon']);
  });

  it('agrees with vargaSign, which returns the lord\'s sign rather than the lord', () => {
    for (const sign of SIGNS) {
      for (const deg of [5, 20]) {
        const expectedSign = horaLord(sign, deg) === 'sun' ? 4 : 3; // Leo : Cancer
        expect(vargaSign(sign * 30 + deg, 2)).toBe(expectedSign);
      }
    }
  });
});

// ── 6.12 Navamsa class ───────────────────────────────────────────────────────
describe('BPHS 6.12 — Deva / Manushya / Rakshasa navamsas', () => {
  it('starts movable at Deva, fixed at Manushya, dual at Rakshasa', () => {
    expect(navamsaClass(0, 1)).toBe('deva');       // Aries, movable
    expect(navamsaClass(1, 1)).toBe('manushya');   // Taurus, fixed
    expect(navamsaClass(2, 1)).toBe('rakshasa');   // Gemini, dual
  });

  it('cycles Deva → Manushya → Rakshasa across the nine navamsas', () => {
    const span = 30 / 9;
    const classes = Array.from({ length: 9 }, (_, i) => navamsaClass(0, i * span + 0.1));
    expect(classes).toEqual([
      'deva', 'manushya', 'rakshasa',
      'deva', 'manushya', 'rakshasa',
      'deva', 'manushya', 'rakshasa',
    ]);
  });

  it('matches the verse for movable and fixed signs', () => {
    const span = 30 / 9;
    const movable = Array.from({ length: 3 }, (_, i) => navamsaClass(0, i * span + 0.1));
    expect(movable).toEqual(['deva', 'manushya', 'rakshasa']);
    const fixed = Array.from({ length: 3 }, (_, i) => navamsaClass(1, i * span + 0.1));
    expect(fixed).toEqual(['manushya', 'rakshasa', 'deva']);
  });

  it('follows the rotation for dual signs, where the verse\'s stated order differs', () => {
    // Verse says Rakshasa/Manushya/Deva; the rotation gives Rakshasa/Deva/Manushya.
    // Recorded in NAVAMSA_CLASS_NOTE — two of three stated orders fit the rotation.
    const span = 30 / 9;
    const dual = Array.from({ length: 3 }, (_, i) => navamsaClass(2, i * span + 0.1));
    expect(dual).toEqual(['rakshasa', 'deva', 'manushya']);
  });

  it('describes every class', () => {
    for (const c of NAVAMSA_CLASS_CYCLE) expect(NAVAMSA_CLASS_MEANING[c]).toBeTruthy();
  });
});

// ── 6.13-14 Dasamsa directions ───────────────────────────────────────────────
describe('BPHS 6.13-14 — Dasamsa direction lords', () => {
  it('lists ten rulers covering the eight compass points plus zenith and nadir', () => {
    expect(DASAMSA_DIRECTION_LORDS).toHaveLength(10);
    const dirs = DASAMSA_DIRECTION_LORDS.map((d) => d.direction);
    expect(new Set(dirs).size).toBe(10);
    expect(dirs).toContain('east');
    expect(dirs).toContain('zenith');
    expect(dirs).toContain('nadir');
  });

  it('runs in order for an odd sign, Indra first', () => {
    expect(dasamsaRuler(0, 1)).toMatchObject({ index: 0, lord: 'Indra', direction: 'east' });
    expect(dasamsaRuler(0, 29)).toMatchObject({ index: 9, lord: 'Ananta' });
  });

  it('runs in reverse for an even sign', () => {
    expect(dasamsaRuler(1, 1)).toMatchObject({ index: 9, lord: 'Ananta' });
    expect(dasamsaRuler(1, 29)).toMatchObject({ index: 0, lord: 'Indra', direction: 'east' });
  });

  it('divides the sign into ten equal parts of 3°', () => {
    expect(dasamsaRuler(0, 2.9).index).toBe(0);
    expect(dasamsaRuler(0, 3.1).index).toBe(1);
  });
});
