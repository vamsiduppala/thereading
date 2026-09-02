// BPHS Programme Part 13 — Chapter 66a: Ashtakavarga for the Sun, Moon and Mars.
//
// The chapter states each table twice, as karana places and as rekha places. These tests
// check the shipped table against the transcribed verses, and check the two statements
// against each other — which is what found the Moon bug.

import { describe, it, expect } from 'vitest';
import {
  AV_REFS, AV_HOUSES, AV_MARKS_PER_PLANET,
  KARANA_VS_REKHA, rekhaFromKarana, karanaFromRekha,
  avRowTotal, avPlanetTotal, BPHS_AV_PLANET_TOTALS, AV_GRAND_TOTAL,
  CH66_SUN_REKHA, CH66_MOON_REKHA, CH66_MARS_REKHA, CH66A_TRANSCRIBED,
  CH66_VERIFICATION, WHY_ASHTAKAVARGA_EXISTS, CH66_REMAINING,
  AV_TABLE, AV_PLANETS, bhinnashtakavarga, ashtakavarga,
  type AVPlanet, type AVRef,
} from '../src/index.js';

const sorted = (a: number[]) => [...a].sort((x, y) => x - y);

// ── The shipped table against the verses ─────────────────────────────────────
describe('BPHS 66 — the shipped tables against the chapter’s own verses', () => {
  for (const planet of ['sun', 'moon', 'mars'] as AVPlanet[]) {
    it(`${planet}: all eight reference rows match the chapter`, () => {
      const fromVerse = CH66A_TRANSCRIBED[planet as 'sun' | 'moon' | 'mars'];
      for (const ref of AV_REFS) {
        expect(sorted(AV_TABLE[planet][ref]), `${planet}/${ref}`)
          .toEqual(sorted(fromVerse[ref]));
      }
    });
  }

  it('the Moon’s three corrected rows are the corrected values, not the old ones', () => {
    // Guards the Part 13 fix specifically. If anything restores the old table — a merge,
    // a copy from another source — this fails by name rather than silently.
    expect(sorted(AV_TABLE.moon.moon)).toEqual([1, 3, 6, 7, 9, 10, 11]);
    expect(sorted(AV_TABLE.moon.mars)).toEqual([2, 3, 5, 6, 10, 11]);
    expect(sorted(AV_TABLE.moon.jupiter)).toEqual([1, 2, 4, 7, 8, 10, 11]);

    expect(AV_TABLE.moon.moon).not.toEqual([1, 3, 6, 7, 10, 11]);
    expect(AV_TABLE.moon.mars).not.toEqual([2, 3, 5, 6, 9, 10, 11]);
    expect(AV_TABLE.moon.jupiter).not.toEqual([1, 4, 7, 8, 10, 11, 12]);
  });

  it('records what was checked and what was wrong', () => {
    expect(CH66_VERIFICATION.rowsChecked).toBe(24);
    expect(CH66_VERIFICATION.rowsAlreadyCorrect + CH66_VERIFICATION.rowsCorrected)
      .toBe(CH66_VERIFICATION.rowsChecked);
    expect(CH66_VERIFICATION.corrections).toHaveLength(3);
    for (const c of CH66_VERIFICATION.corrections) expect(c.planet).toBe('moon');
  });
});

// ── Why the old checksum could not see it ────────────────────────────────────
describe('BPHS 66 — why 337 never caught the Moon bug', () => {
  it('the old table passed the 337 check while being wrong', () => {
    // Reconstruct the pre-fix Moon rows and show the grand total is unmoved.
    const oldMoon: Record<AVRef, number[]> = {
      ...AV_TABLE.moon,
      moon: [1, 3, 6, 7, 10, 11],
      mars: [2, 3, 5, 6, 9, 10, 11],
      jupiter: [1, 4, 7, 8, 10, 11, 12],
    };
    const oldMoonTotal = AV_REFS.reduce((s, r) => s + oldMoon[r].length, 0);
    expect(oldMoonTotal).toBe(BPHS_AV_PLANET_TOTALS.moon);   // 49 either way
    expect(oldMoonTotal).toBe(avPlanetTotal('moon'));
  });

  it('but the per-row totals DO differ — the stronger check', () => {
    expect(avRowTotal('moon', 'moon')).toBe(7);      // was 6
    expect(avRowTotal('moon', 'mars')).toBe(6);      // was 7
  });

  it('states the lesson so it is not relearned', () => {
    expect(CH66_VERIFICATION.whyTheChecksumMissedIt).toContain('moving between rows');
  });
});

// ── Per-planet totals ────────────────────────────────────────────────────────
describe('BPHS 66 — the totals the chapter’s verse lists imply', () => {
  it('every planet hits its stated total', () => {
    for (const p of AV_PLANETS) {
      expect(avPlanetTotal(p), p).toBe(BPHS_AV_PLANET_TOTALS[p]);
    }
  });

  it('the seven totals still sum to the classical 337', () => {
    expect(AV_GRAND_TOTAL).toBe(337);
  });

  it('no reference row can exceed twelve houses, or fall below zero', () => {
    for (const p of AV_PLANETS) {
      for (const r of AV_REFS) {
        expect(avRowTotal(p, r), `${p}/${r}`).toBeGreaterThanOrEqual(0);
        expect(avRowTotal(p, r), `${p}/${r}`).toBeLessThanOrEqual(AV_HOUSES);
      }
    }
  });

  it('a planet can never exceed eight references times twelve houses', () => {
    expect(AV_MARKS_PER_PLANET).toBe(96);
    for (const p of AV_PLANETS) {
      expect(avPlanetTotal(p)).toBeLessThanOrEqual(AV_MARKS_PER_PLANET);
    }
  });
});

// ── Karana and rekha are complements ─────────────────────────────────────────
describe('BPHS 66.15 — karana and rekha, and the terminology inversion', () => {
  it('a karana list and a rekha list are exact complements', () => {
    expect(rekhaFromKarana([1, 2, 3])).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(rekhaFromKarana([])).toHaveLength(12);
    expect(rekhaFromKarana([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toEqual([]);
  });

  it('round-trips for every row of every checked planet', () => {
    for (const planet of ['sun', 'moon', 'mars'] as const) {
      for (const ref of AV_REFS) {
        const rekha = CH66A_TRANSCRIBED[planet][ref];
        expect(rekhaFromKarana(karanaFromRekha(rekha)), `${planet}/${ref}`)
          .toEqual(sorted(rekha));
      }
    }
  });

  it('reproduces 66.16’s karana counts for the Sun — the chapter’s own checksum', () => {
    // "Five planets in 1st, 2nd, 8th, 3rd and the 12th; 4 in the 7th and 4th; 3 in the
    // 6th and 9th; 6 in the 5th; 2 in the 10th; 1 in the 11th are Karana-Prada."
    const expected: Record<number, number> = {
      1: 5, 2: 5, 3: 5, 4: 4, 5: 6, 6: 3, 7: 4, 8: 5, 9: 3, 10: 2, 11: 1, 12: 5,
    };
    for (let h = 1; h <= 12; h++) {
      const rekhaCount = AV_REFS.filter((r) => CH66_SUN_REKHA[r].includes(h)).length;
      expect(AV_REFS.length - rekhaCount, `house ${h}`).toBe(expected[h]);
    }
  });

  it('reproduces the Moon’s karana counts from 66.20-22’s DETAIL list', () => {
    // The verse's own summary line miscounts the 11th; its detail list is right, and only
    // the detail list closes the karana total at 47.
    const expected: Record<number, number> = {
      1: 5, 2: 6, 3: 1, 4: 5, 5: 4, 6: 3, 7: 3, 8: 5, 9: 6, 10: 1, 11: 0, 12: 8,
    };
    let karanaTotal = 0;
    for (let h = 1; h <= 12; h++) {
      const rekhaCount = AV_REFS.filter((r) => CH66_MOON_REKHA[r].includes(h)).length;
      const karana = AV_REFS.length - rekhaCount;
      expect(karana, `house ${h}`).toBe(expected[h]);
      karanaTotal += karana;
    }
    expect(karanaTotal).toBe(AV_MARKS_PER_PLANET - BPHS_AV_PLANET_TOTALS.moon);  // 47
  });

  it('records the inversion loudly, since it is the easiest thing here to get backwards', () => {
    expect(KARANA_VS_REKHA).toContain('opposite of modern usage');
    expect(KARANA_VS_REKHA).toContain('COMPLEMENT');
  });

  it('notes both textual faults found in the chapter', () => {
    expect(CH66_VERIFICATION.textualFaults).toHaveLength(2);
    expect(CH66_VERIFICATION.textualFaults.join(' ')).toContain('66.20-22');
  });
});

// ── The corrected table actually computes ────────────────────────────────────
describe('BPHS 66 — the corrected table in use', () => {
  const refs: Record<AVRef, number> = {
    sun: 1, moon: 4, mars: 7, mercury: 2, jupiter: 10, venus: 0, saturn: 5, asc: 3,
  };

  it('a BAV row still holds twelve counts, each 0..8', () => {
    for (const p of AV_PLANETS) {
      const row = bhinnashtakavarga(p, refs);
      expect(row).toHaveLength(12);
      for (const v of row) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(8);
      }
    }
  });

  it('the SAV still totals 337 after the correction', () => {
    expect(ashtakavarga(refs).total).toBe(337);
  });

  it('the Moon’s BAV changed where the fix says it should', () => {
    // Moon at sign 4; its own 9th is sign (4+8)=0. The old table gave no bindu there
    // from the Moon reference; the corrected one does.
    const row = bhinnashtakavarga('moon', refs);
    const ninthFromMoon = (refs.moon + 9 - 1) % 12;
    expect(AV_TABLE.moon.moon).toContain(9);
    expect(row[ninthFromMoon]).toBeGreaterThan(0);
  });
});

// ── Scope ────────────────────────────────────────────────────────────────────
describe('BPHS 66a — scope', () => {
  it('reckons eight references and twelve houses', () => {
    expect(AV_REFS).toHaveLength(8);
    expect(AV_REFS).toContain('asc');
    expect(AV_REFS).not.toContain('rahu');
    expect(AV_HOUSES).toBe(12);
  });

  it('records why the chapter exists at all', () => {
    expect(WHY_ASHTAKAVARGA_EXISTS).toContain('countable instrument');
  });

  it('names what the rest of chapter 66 still holds, including the lagna’s own AV', () => {
    expect(CH66_REMAINING.lagna).toContain('neither existing table has it');
    expect(Object.keys(CH66_REMAINING).length).toBeGreaterThanOrEqual(6);
  });
});
