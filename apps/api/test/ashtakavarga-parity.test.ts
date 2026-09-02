// Cross-package parity for Ashtakavarga — BPHS Programme Part 13 retrofit.
//
// The bindu table exists TWICE: once in `packages/engine/src/chart/ashtakavarga.ts` and
// once in `packages/knowledge/src/data/ashtakavarga.ts`. Nothing kept them in step, which
// is precisely how a table drifts — Part 13 had to correct three rows and had to remember
// to do it in both places.
//
// This is the only place in the repo that can see both packages, so the guard lives here.
// It compares BEHAVIOUR rather than the literals, which also catches a divergence in the
// counting logic and not merely in the data.

import { describe, it, expect } from 'vitest';
import { ashtakavarga, AV_PLANETS, type AVRef } from '@aura/knowledge';
import { computeAshtakavarga } from '@aura/engine';

/** Reference sign placements to test both implementations against. */
const CASES: Record<AVRef, number>[] = [
  { sun: 0, moon: 1, mars: 2, mercury: 3, jupiter: 4, venus: 5, saturn: 6, asc: 7 },
  { sun: 4, moon: 4, mars: 4, mercury: 4, jupiter: 4, venus: 4, saturn: 4, asc: 4 },
  { sun: 11, moon: 0, mars: 5, mercury: 9, jupiter: 2, venus: 7, saturn: 3, asc: 10 },
  { sun: 8, moon: 3, mars: 11, mercury: 8, jupiter: 6, venus: 1, saturn: 0, asc: 5 },
];

/** The engine takes a Chart; only these two fields are read by computeAshtakavarga. */
const asChart = (refs: Record<AVRef, number>) => ({
  lagnaSign: refs.asc,
  planets: Object.fromEntries(
    AV_PLANETS.map((p) => [p, { sign: refs[p] }]),
  ),
}) as never;

describe('Ashtakavarga parity — engine and knowledge must not drift', () => {
  it('produces identical BAV rows for every planet, on every case', () => {
    for (const [i, refs] of CASES.entries()) {
      const fromKnowledge = ashtakavarga(refs);
      const fromEngine = computeAshtakavarga(asChart(refs));
      for (const p of AV_PLANETS) {
        expect(fromEngine.bav[p], `case ${i} / ${p}`).toEqual(fromKnowledge.bav[p]);
      }
    }
  });

  it('produces identical SAV rows, and both still total 337', () => {
    for (const [i, refs] of CASES.entries()) {
      const fromKnowledge = ashtakavarga(refs);
      const fromEngine = computeAshtakavarga(asChart(refs));
      expect(fromEngine.sav, `case ${i}`).toEqual(fromKnowledge.sav);
      expect(fromKnowledge.total).toBe(337);
      expect(fromEngine.sav.reduce((a: number, b: number) => a + b, 0)).toBe(337);
    }
  });

  it('both carry the Part 13 correction to the Moon', () => {
    // Moon at sign 4 means its own 9th is sign 0. Before Part 13 neither table gave the
    // Moon a bindu there from its own reference; both must now.
    const refs = CASES[1]!;
    const ninthFromMoon = (refs.moon + 8) % 12;
    expect(ashtakavarga(refs).bav.moon[ninthFromMoon]).toBeGreaterThan(0);
    expect(computeAshtakavarga(asChart(refs)).bav.moon[ninthFromMoon]).toBeGreaterThan(0);
  });
});
