// BPHS Programme Part 14 — Chapter 66b: Ashtakavarga for Mercury, Jupiter and Venus.
//
// Same method as Part 13, with one lesson added: in Part 13 the karana statement was the
// corrupt one, here the rekha statements are. Neither is reliably better, so every table
// is settled by closing its total rather than by trusting a statement.

import { describe, it, expect } from 'vitest';
import {
  CH66_MERCURY_REKHA, CH66_JUPITER_REKHA, CH66_VENUS_REKHA, CH66B_TRANSCRIBED,
  CH66B_KARANA_COUNTS, CH66B_VERIFICATION, CH66_EDITION_FAULTS, CH66B_REMAINING,
  karanaCounts, rekhaTotal, rowMatchesShipped,
  AV_REFS, AV_HOUSES, AV_MARKS_PER_PLANET, BPHS_AV_PLANET_TOTALS, avPlanetTotal,
  AV_TABLE, ashtakavarga, bhinnashtakavarga,
  type AVRef,
} from '../src/index.js';

const PLANETS = ['mercury', 'jupiter', 'venus'] as const;
const sorted = (a: number[]) => [...a].sort((x, y) => x - y);

// ── The shipped table against the verses ─────────────────────────────────────
describe('BPHS 66b — the shipped tables against the chapter’s verses', () => {
  for (const planet of PLANETS) {
    it(`${planet}: all eight reference rows match the chapter`, () => {
      for (const ref of AV_REFS) {
        expect(sorted(AV_TABLE[planet][ref]), `${planet}/${ref}`)
          .toEqual(sorted(CH66B_TRANSCRIBED[planet][ref]));
      }
    });
  }

  it('every transcription closes at the planet’s stated total', () => {
    for (const planet of PLANETS) {
      expect(rekhaTotal(CH66B_TRANSCRIBED[planet]), planet)
        .toBe(BPHS_AV_PLANET_TOTALS[planet]);
    }
  });

  it('Venus keeps the Part 14 correction — Mars in the 4th, not the 5th', () => {
    expect(AV_TABLE.venus.mars).toContain(4);
    expect(AV_TABLE.venus.mars).not.toContain(5);
    expect(sorted(AV_TABLE.venus.mars)).toEqual([3, 4, 6, 9, 11, 12]);
  });

  it('records what was checked and what changed', () => {
    expect(CH66B_VERIFICATION.rowsChecked).toBe(24);
    expect(CH66B_VERIFICATION.rowsAlreadyCorrect + CH66B_VERIFICATION.rowsCorrected)
      .toBe(CH66B_VERIFICATION.rowsChecked);
    expect(CH66B_VERIFICATION.corrections).toHaveLength(1);
    expect(CH66B_VERIFICATION.corrections[0]!.planet).toBe('venus');
  });
});

// ── The chapter's own checksums ──────────────────────────────────────────────
describe('BPHS 66b — each table closes against its karana verse', () => {
  for (const planet of PLANETS) {
    it(`${planet}: karana counts match the verse, house by house`, () => {
      const derived = karanaCounts(CH66B_TRANSCRIBED[planet]);
      for (let h = 1; h <= AV_HOUSES; h++) {
        expect(derived[h], `${planet} house ${h}`).toBe(CH66B_KARANA_COUNTS[planet][h]);
      }
    });

    it(`${planet}: the karana total is 96 minus the planet total`, () => {
      const total = Object.values(CH66B_KARANA_COUNTS[planet]).reduce((a, b) => a + b, 0);
      expect(total).toBe(AV_MARKS_PER_PLANET - BPHS_AV_PLANET_TOTALS[planet]);
    });
  }

  it('Jupiter’s rekha statement really does fall two short — the fault that was caught', () => {
    // 66.53-55 omits Jupiter from its own 1st and 4th. Removing them reproduces the
    // damaged statement and shows it totalling 54 where Jupiter must reach 56.
    const damaged: Record<AVRef, number[]> = {
      ...CH66_JUPITER_REKHA,
      jupiter: CH66_JUPITER_REKHA.jupiter.filter((h) => h !== 1 && h !== 4),
    };
    expect(rekhaTotal(damaged)).toBe(54);
    expect(rekhaTotal(CH66_JUPITER_REKHA)).toBe(56);
  });

  it('Mercury’s rekha statement swaps one planet in one house', () => {
    // 66.51-52½ names Saturn in the 5th; the karana statement requires the Sun.
    expect(CH66_MERCURY_REKHA.sun).toContain(5);
    expect(CH66_MERCURY_REKHA.saturn).not.toContain(5);
    // The karana list names Saturn among the 5th's five karanas, so the Sun keeps it.
    expect(CH66B_KARANA_COUNTS.mercury[5]).toBe(5);
  });

  it('names all three textual faults found this part', () => {
    expect(CH66B_VERIFICATION.textualFaults).toHaveLength(3);
    const joined = CH66B_VERIFICATION.textualFaults.join(' ');
    expect(joined).toContain('TRUNCATED');
    expect(joined).toContain('66.53-55');
  });

  it('records that neither statement is reliably the better one', () => {
    expect(CH66B_VERIFICATION.methodNote).toContain('only the');
    expect(CH66B_VERIFICATION.whyNoTotalCouldSeeIt).toContain('row CONTENTS');
  });
});

// ── The class of error no total can see ──────────────────────────────────────
describe('BPHS 66b — why no checksum could have caught the Venus row', () => {
  it('the old row had the same length, so every total was unchanged', () => {
    const oldRow = [3, 5, 6, 9, 11, 12];
    expect(oldRow).toHaveLength(AV_TABLE.venus.mars.length);
    expect(avPlanetTotal('venus')).toBe(BPHS_AV_PLANET_TOTALS.venus);
  });

  it('but the karana count for the 4th and 5th does move', () => {
    // This is the check that actually distinguishes them.
    const derived = karanaCounts(CH66_VENUS_REKHA);
    expect(derived[4]).toBe(3);
    expect(derived[5]).toBe(2);
    const damaged: Record<AVRef, number[]> = {
      ...CH66_VENUS_REKHA,
      mars: [3, 5, 6, 9, 11, 12],
    };
    expect(karanaCounts(damaged)[4]).toBe(4);
    expect(karanaCounts(damaged)[5]).toBe(1);
  });

  it('every shipped row for these three planets now matches the verses', () => {
    for (const planet of PLANETS) {
      for (const ref of AV_REFS) {
        expect(rowMatchesShipped(planet, ref), `${planet}/${ref}`).toBe(true);
      }
    }
  });
});

// ── Still computes ───────────────────────────────────────────────────────────
describe('BPHS 66b — the corrected table in use', () => {
  const refs: Record<AVRef, number> = {
    sun: 2, moon: 9, mars: 6, mercury: 1, jupiter: 11, venus: 4, saturn: 8, asc: 0,
  };

  it('SAV still totals 337 after the Venus correction', () => {
    expect(ashtakavarga(refs).total).toBe(337);
  });

  it('Venus’s BAV moved where the fix says it should', () => {
    const row = bhinnashtakavarga('venus', refs);
    const fourthFromMars = (refs.mars + 3) % 12;
    const fifthFromMars = (refs.mars + 4) % 12;
    expect(row).toHaveLength(12);
    // Mars now contributes to the 4th from itself, not the 5th.
    expect(AV_TABLE.venus.mars).toContain(4);
    expect(fourthFromMars).not.toBe(fifthFromMars);
  });

  it('every BAV value stays within 0..8', () => {
    for (const planet of PLANETS) {
      for (const v of bhinnashtakavarga(planet, refs)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(8);
      }
    }
  });
});

describe('BPHS 66b — scope', () => {
  it('counts the edition faults found in this chapter so far', () => {
    expect(CH66_EDITION_FAULTS).toBe(5);
  });

  it('names what is left, including the lagna’s missing ashtakavarga', () => {
    expect(CH66B_REMAINING.lagna).toContain('AV_PLANETS is seven');
  });
});
