// BPHS Programme Part 15 — Chapter 66c: Saturn, and the Ascendant's own ashtakavarga.
// Completes chapter 66's construction.

import { describe, it, expect } from 'vitest';
import {
  CH66_SATURN_REKHA, CH66_SATURN_KARANA_COUNTS,
  CH66_LAGNA_REKHA, CH66_LAGNA_KARANA_COUNTS,
  LAGNA_AV_TOTAL, LAGNA_AV_IS_NOT_IN_SAV, lagnaAshtakavarga,
  LAGNA_ASC_ROW_COINCIDENCE, CH66C_VERIFICATION,
  CH66_EDITION_FAULTS_FINAL, CH66_FAULT_RATE_NOTE,
  AV_REFS, AV_HOUSES, AV_MARKS_PER_PLANET, BPHS_AV_PLANET_TOTALS,
  karanaCounts, rekhaTotal,
  AV_TABLE, AV_PLANETS, ashtakavarga,
  type AVRef,
} from '../src/index.js';

const sorted = (a: number[]) => [...a].sort((x, y) => x - y);

// ── Saturn ───────────────────────────────────────────────────────────────────
describe('BPHS 66.39-42, 66.59-60 — Saturn', () => {
  it('all eight reference rows match the chapter', () => {
    for (const ref of AV_REFS) {
      expect(sorted(AV_TABLE.saturn[ref]), `saturn/${ref}`)
        .toEqual(sorted(CH66_SATURN_REKHA[ref]));
    }
  });

  it('closes at 39, the total the chapter implies', () => {
    expect(rekhaTotal(CH66_SATURN_REKHA)).toBe(BPHS_AV_PLANET_TOTALS.saturn);
    expect(rekhaTotal(CH66_SATURN_REKHA)).toBe(39);
  });

  it('its two statements agree in all twelve houses', () => {
    const derived = karanaCounts(CH66_SATURN_REKHA);
    for (let h = 1; h <= AV_HOUSES; h++) {
      expect(derived[h], `house ${h}`).toBe(CH66_SATURN_KARANA_COUNTS[h]);
    }
  });

  it('its karana total closes at 57', () => {
    const total = Object.values(CH66_SATURN_KARANA_COUNTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(57);
    expect(total).toBe(AV_MARKS_PER_PLANET - BPHS_AV_PLANET_TOTALS.saturn);
  });

  it('needed no correction — the cleanest planet in the chapter', () => {
    expect(CH66C_VERIFICATION.saturn.rowsCorrected).toBe(0);
    expect(CH66C_VERIFICATION.saturn.rowsAlreadyCorrect).toBe(8);
  });
});

// ── The Ascendant's own ashtakavarga ─────────────────────────────────────────
describe('BPHS 66.61-68 — the Ascendant’s ashtakavarga, new to this codebase', () => {
  it('has a row for all eight references', () => {
    for (const ref of AV_REFS) {
      expect(CH66_LAGNA_REKHA[ref], ref).toBeDefined();
      expect(Array.isArray(CH66_LAGNA_REKHA[ref])).toBe(true);
    }
  });

  it('closes at 49', () => {
    expect(rekhaTotal(CH66_LAGNA_REKHA)).toBe(LAGNA_AV_TOTAL);
    expect(rekhaTotal(CH66_LAGNA_REKHA)).toBe(49);
  });

  it('its two statements agree in all twelve houses', () => {
    const derived = karanaCounts(CH66_LAGNA_REKHA);
    for (let h = 1; h <= AV_HOUSES; h++) {
      expect(derived[h], `house ${h}`).toBe(CH66_LAGNA_KARANA_COUNTS[h]);
    }
  });

  it('its karana total closes at 47', () => {
    const total = Object.values(CH66_LAGNA_KARANA_COUNTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(47);
    expect(total).toBe(AV_MARKS_PER_PLANET - LAGNA_AV_TOTAL);
  });

  it('every row is a set of distinct houses in 1..12', () => {
    for (const ref of AV_REFS) {
      const row = CH66_LAGNA_REKHA[ref];
      expect(new Set(row).size, ref).toBe(row.length);
      for (const h of row) {
        expect(h, ref).toBeGreaterThanOrEqual(1);
        expect(h, ref).toBeLessThanOrEqual(12);
      }
    }
  });

  it('computes twelve bindu counts, each 0..8', () => {
    const refs: Record<AVRef, number> = {
      sun: 0, moon: 3, mars: 6, mercury: 1, jupiter: 9, venus: 4, saturn: 7, asc: 2,
    };
    const row = lagnaAshtakavarga(refs);
    expect(row).toHaveLength(12);
    for (const v of row) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(8);
    }
    expect(row.reduce((a, b) => a + b, 0)).toBe(LAGNA_AV_TOTAL);
  });

  it('totals 49 whatever the placements — the same structural guarantee the BAVs have', () => {
    for (let shift = 0; shift < 12; shift++) {
      const refs = Object.fromEntries(
        AV_REFS.map((r, i) => [r, (shift + i * 5) % 12]),
      ) as Record<AVRef, number>;
      expect(lagnaAshtakavarga(refs).reduce((a, b) => a + b, 0)).toBe(LAGNA_AV_TOTAL);
    }
  });
});

// ── The lagna must stay out of the SAV ───────────────────────────────────────
describe('BPHS 66c — the lagna’s AV is not an eighth column of the 337', () => {
  const refs: Record<AVRef, number> = {
    sun: 5, moon: 2, mars: 9, mercury: 0, jupiter: 7, venus: 11, saturn: 3, asc: 6,
  };

  it('AV_PLANETS is still seven — the lagna was not folded in', () => {
    expect(AV_PLANETS).toHaveLength(7);
    expect([...AV_PLANETS]).not.toContain('asc');
  });

  it('the SAV still totals 337, not 386', () => {
    const av = ashtakavarga(refs);
    expect(av.total).toBe(337);
    expect(av.total + LAGNA_AV_TOTAL).toBe(386);
    expect(av.total).not.toBe(386);
  });

  it('the lagna row is not present in the BAV map', () => {
    const av = ashtakavarga(refs);
    expect(Object.keys(av.bav)).toHaveLength(7);
    expect(Object.keys(av.bav)).not.toContain('asc');
  });

  it('says plainly why they are kept apart', () => {
    expect(LAGNA_AV_IS_NOT_IN_SAV).toContain('386');
    expect(LAGNA_AV_IS_NOT_IN_SAV).toContain('SEVEN');
  });
});

// ── The coincidence, recorded and not relied on ──────────────────────────────
describe('BPHS 66c — the lagna/asc row coincidence', () => {
  it('five of seven rows do coincide with that planet’s own asc row', () => {
    const same = (['sun', 'mars', 'mercury', 'jupiter', 'saturn'] as const)
      .filter((p) => JSON.stringify(sorted(CH66_LAGNA_REKHA[p]))
        === JSON.stringify(sorted(AV_TABLE[p].asc)));
    expect(same).toHaveLength(5);
  });

  it('and two do not — which is why it must not be used as a rule', () => {
    expect(sorted(CH66_LAGNA_REKHA.moon)).not.toEqual(sorted(AV_TABLE.moon.asc));
    expect(sorted(CH66_LAGNA_REKHA.venus)).not.toEqual(sorted(AV_TABLE.venus.asc));
    expect(LAGNA_ASC_ROW_COINCIDENCE).toContain('Do NOT derive');
  });
});

// ── Chapter 66, complete ─────────────────────────────────────────────────────
describe('BPHS 66 — the chapter is now fully checked', () => {
  it('all seven planets verified, plus the ascendant', () => {
    expect(CH66C_VERIFICATION.chapterComplete).toBe(true);
    expect(CH66C_VERIFICATION.planetsVerified).toBe(7);
    expect(CH66C_VERIFICATION.rowsVerifiedTotal).toBe(56);
  });

  it('four rows were wrong across the whole chapter', () => {
    expect(CH66C_VERIFICATION.rowsCorrectedTotal).toBe(4);
  });

  it('every planet still closes at its stated total', () => {
    for (const p of AV_PLANETS) {
      const total = AV_REFS.reduce((s, r) => s + AV_TABLE[p][r].length, 0);
      expect(total, p).toBe(BPHS_AV_PLANET_TOTALS[p]);
    }
  });

  it('records the chapter’s fault rate and what defends against it', () => {
    expect(CH66_EDITION_FAULTS_FINAL).toBe(5);
    expect(CH66_FAULT_RATE_NOTE).toContain('closing each total');
  });
});
