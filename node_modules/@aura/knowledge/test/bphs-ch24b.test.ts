// BPHS Programme Part 26 — Chapter 24b: the bhava lords in houses, lords 7-12.
// Completes the 144-cell block, the largest in the corpus.

import { describe, it, expect } from 'vitest';
import {
  LORD_PLACEMENTS_7_12, LORD_MATTER_7_12, ALL_LORD_PLACEMENTS, ALL_LORD_MATTER,
  allBhavaLordRules, fullTableIsComplete,
  DEDUCE_CONSIDERING_STRENGTH, CH24B_YIELD, CH24B_EXCLUSION_THEMES,
  SEVENTH_LORD_NOTE, BHAVA_LORD_BLOCK_COMPLETE, SOURCE_STATED_ARBITRATION,
  LORD_PLACEMENTS, arity, fired, arbitrate,
  type ChartFacts,
} from '../src/index.js';

const chart = (over: Record<string, unknown> = {}): ChartFacts => ({
  lagnaSign: 0,
  planets: {
    sun: { sign: 0, house: 1 }, moon: { sign: 3, house: 4 }, mars: { sign: 2, house: 3 },
    mercury: { sign: 3, house: 4 }, jupiter: { sign: 4, house: 5 }, venus: { sign: 5, house: 6 },
    saturn: { sign: 6, house: 7 }, rahu: { sign: 7, house: 8 }, ketu: { sign: 1, house: 2 },
    ...over,
  },
} as unknown as ChartFacts);

// ── The completed table ──────────────────────────────────────────────────────
describe('BPHS 24b — the 144-cell block is complete', () => {
  it('adds the second 72 cells', () => {
    expect(LORD_PLACEMENTS_7_12).toHaveLength(72);
    expect(LORD_PLACEMENTS).toHaveLength(72);
    expect(ALL_LORD_PLACEMENTS).toHaveLength(144);
  });

  it('covers every lord in every house, with no gaps and no duplicates', () => {
    expect(fullTableIsComplete()).toBe(true);
    const keys = ALL_LORD_PLACEMENTS.map((p) => `${p.lord}-${p.house}`);
    expect(new Set(keys).size).toBe(144);
  });

  it('numbers the verses contiguously from 1 to 144', () => {
    const verses = ALL_LORD_PLACEMENTS.map((p) => Number(p.verse)).sort((a, b) => a - b);
    expect(verses[0]).toBe(1);
    expect(verses[143]).toBe(144);
    for (let i = 1; i < verses.length; i++) expect(verses[i]).toBe(verses[i - 1]! + 1);
  });

  it('the verse number still follows from the lord and house across both halves', () => {
    for (const p of ALL_LORD_PLACEMENTS) {
      expect(Number(p.verse), `lord ${p.lord} in ${p.house}`).toBe((p.lord - 1) * 12 + p.house);
    }
  });

  it('names a matter and domain for all twelve lords', () => {
    for (let l = 1; l <= 12; l++) {
      expect(ALL_LORD_MATTER[l], `lord ${l}`).toBeDefined();
      expect(ALL_LORD_MATTER[l]!.domain, `lord ${l}`).toBeTruthy();
    }
    expect(Object.keys(LORD_MATTER_7_12)).toHaveLength(6);
  });

  it('every valence is in range and non-zero, and every summary distinct', () => {
    const seen = new Set<string>();
    for (const p of ALL_LORD_PLACEMENTS) {
      expect(p.valence, `${p.lord}/${p.house}`).toBeGreaterThanOrEqual(-1);
      expect(p.valence, `${p.lord}/${p.house}`).toBeLessThanOrEqual(1);
      expect(p.valence, `${p.lord}/${p.house}`).not.toBe(0);
      expect(seen.has(p.summary), `duplicate summary at ${p.lord}/${p.house}`).toBe(false);
      seen.add(p.summary);
    }
  });
});

// ── The generated rules ──────────────────────────────────────────────────────
describe('BPHS 24b — 144 rules', () => {
  const rules = allBhavaLordRules();

  it('generates one rule per cell', () => {
    expect(rules).toHaveLength(144);
    expect(new Set(rules.map((r) => r.id)).size).toBe(144);
  });

  it('every rule is single-condition and reads a lordship', () => {
    for (const r of rules) {
      expect(arity(r), r.id).toBe(1);
      expect(r.when[0]!.k, r.id).toBe('lordship');
    }
  });

  it('each lord has twelve rules sharing one effect id', () => {
    for (let l = 1; l <= 12; l++) {
      expect(rules.filter((r) => r.effect.id === `bhava-lord.${l}`), `lord ${l}`).toHaveLength(12);
    }
  });

  it('exactly one placement per lord fires on any chart', () => {
    const f = chart({ venus: { sign: 8, house: 9 } });
    // Aries lagna: Venus rules the 2nd and the 7th. Both should report exactly one hit.
    for (const l of [2, 7]) {
      const hits = fired(rules, f).filter((x) => x.rule.effect.id === `bhava-lord.${l}`);
      expect(hits, `lord ${l}`).toHaveLength(1);
    }
  });

  it('never reports dissent within a lord', () => {
    const res = arbitrate(rules, chart());
    for (const finding of res.findings) expect(finding.dissent, finding.hit.rule.id).toHaveLength(0);
  });

  it('can be generated for a subset', () => {
    expect(allBhavaLordRules([7])).toHaveLength(12);
    expect(allBhavaLordRules([7, 8, 9])).toHaveLength(36);
  });

  it('a chart fires exactly twelve of the 144 — one per lord', () => {
    // Every house has a lord and every lord sits somewhere, so twelve fire and no more.
    const hits = fired(rules, chart());
    expect(hits).toHaveLength(12);
    expect(new Set(hits.map((h) => h.rule.effect.id)).size).toBe(12);
  });
});

// ── Policy ───────────────────────────────────────────────────────────────────
describe('BPHS 24b — the second half is harder than the first', () => {
  it('lost more clauses than the first half did', () => {
    const cutA = LORD_PLACEMENTS.filter((p) => p.excluded).length;
    const cutB = LORD_PLACEMENTS_7_12.filter((p) => p.excluded).length;
    expect(cutB).toBeGreaterThan(cutA);
    expect(CH24B_YIELD.note).toContain('40 of the 72');
  });

  it('the 7th lord is the densest concentration of third-party claims', () => {
    const seventh = LORD_PLACEMENTS_7_12.filter((p) => p.lord === 7);
    const cut = seventh.filter((p) => p.excluded).length;
    expect(cut).toBeGreaterThanOrEqual(6);
    expect(SEVENTH_LORD_NOTE).toContain('rather than the native');
  });

  it('names five recurring exclusion themes for this half', () => {
    expect(CH24B_EXCLUSION_THEMES).toHaveLength(5);
    const joined = CH24B_EXCLUSION_THEMES.join(' ');
    expect(joined).toContain('Longevity');
    expect(joined).toContain('Kingship');
  });

  it('excludes longevity wherever it appears, in both directions', () => {
    for (const p of ALL_LORD_PLACEMENTS) {
      expect(p.summary, `${p.lord}/${p.house}`)
        .not.toMatch(/\b(long-lived|longevity|short life|lifespan)\b/i);
    }
  });

  it('no summary across all 144 carries mortal, medical or judgemental language', () => {
    for (const p of ALL_LORD_PLACEMENTS) {
      expect(p.summary, `${p.lord}/${p.house}`)
        .not.toMatch(/\b(death|dies?|dying|sick|sickly|disease[ds]?|thief|thievish|fool|foolish|wicked|miser|miserly|cruel|sinful|wives|progeny|barren|king)\b/i);
    }
  });
});

// ── 24.145 ───────────────────────────────────────────────────────────────────
describe('BPHS 24.145 — the chapter tells you not to read it literally', () => {
  it('records the sixth source-stated instruction to arbitrate', () => {
    expect(DEDUCE_CONSIDERING_STRENGTH).toContain('sixth');
    expect(DEDUCE_CONSIDERING_STRENGTH).toContain('inputs to `arbitrate`, not conclusions');
  });

  it('cites all five earlier instructions alongside it', () => {
    for (const v of ['27.37-38', '28.15-20', '72.30-31', '74.11-13', '14.15']) {
      expect(DEDUCE_CONSIDERING_STRENGTH, v).toContain(v);
    }
  });

  it('lists them as queryable data, not only as prose', () => {
    // The register is append-only and grew to seven in Part 28, so this asserts position
    // and content rather than a length that any later part would have to come back and edit.
    expect(SOURCE_STATED_ARBITRATION[5]).toContain('24.145');
    expect(SOURCE_STATED_ARBITRATION.length).toBeGreaterThanOrEqual(6);
    expect(new Set(SOURCE_STATED_ARBITRATION).size).toBe(SOURCE_STATED_ARBITRATION.length);
  });

  it('records that the block is complete', () => {
    expect(BHAVA_LORD_BLOCK_COMPLETE).toContain('144 cells, 144 rules');
  });
});
