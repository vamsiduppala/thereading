// BPHS Programme Part 25 — Chapter 24a: the bhava lords in houses, lords 1-6.
//
// The densest block in the book. What matters most here is that a 72-cell table stays
// systematic — a missing cell or an inconsistent shape would be invisible by inspection.

import { describe, it, expect } from 'vitest';
import {
  LORD_PLACEMENTS, LORD_MATTER, bhavaLordRules, tableIsComplete,
  CH24A_YIELD, CH24A_EXCLUSION_THEMES, CH24A_TABLE_RATIONALE, CH24A_EFFECT_ID_RATIONALE,
  arity, fired, arbitrate,
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

// ── The table ────────────────────────────────────────────────────────────────
describe('BPHS 24a — the table is systematic', () => {
  it('has exactly 72 cells', () => {
    expect(LORD_PLACEMENTS).toHaveLength(72);
  });

  it('covers every lord-in-house combination for lords 1-6, with no gaps', () => {
    expect(tableIsComplete()).toBe(true);
  });

  it('has no duplicate cells', () => {
    const keys = LORD_PLACEMENTS.map((p) => `${p.lord}-${p.house}`);
    expect(new Set(keys).size).toBe(72);
  });

  it('numbers the verses contiguously from 1 to 72', () => {
    const verses = LORD_PLACEMENTS.map((p) => Number(p.verse)).sort((a, b) => a - b);
    expect(verses[0]).toBe(1);
    expect(verses[71]).toBe(72);
    for (let i = 1; i < verses.length; i++) expect(verses[i]).toBe(verses[i - 1]! + 1);
  });

  it('the verse number follows from the lord and house — 12 per lord, in order', () => {
    // Lord L house H is verse (L-1)*12 + H. If a row drifts, this catches it.
    for (const p of LORD_PLACEMENTS) {
      expect(Number(p.verse), `lord ${p.lord} in ${p.house}`).toBe((p.lord - 1) * 12 + p.house);
    }
  });

  it('every valence is in range and non-zero', () => {
    for (const p of LORD_PLACEMENTS) {
      expect(p.valence, `${p.lord}/${p.house}`).toBeGreaterThanOrEqual(-1);
      expect(p.valence, `${p.lord}/${p.house}`).toBeLessThanOrEqual(1);
      expect(p.valence, `${p.lord}/${p.house}`).not.toBe(0);
    }
  });

  it('every summary is written, distinct and short', () => {
    const seen = new Set<string>();
    for (const p of LORD_PLACEMENTS) {
      expect(p.summary.length, `${p.lord}/${p.house}`).toBeGreaterThan(20);
      expect(p.summary.length, `${p.lord}/${p.house}`).toBeLessThan(110);
      expect(seen.has(p.summary), `duplicate summary at ${p.lord}/${p.house}`).toBe(false);
      seen.add(p.summary);
    }
  });

  it('names a matter and a domain for each of the six lords', () => {
    for (let l = 1; l <= 6; l++) {
      expect(LORD_MATTER[l], `lord ${l}`).toBeDefined();
      expect(LORD_MATTER[l]!.domain, `lord ${l}`).toBeTruthy();
    }
  });
});

// ── The generated rules ──────────────────────────────────────────────────────
describe('BPHS 24a — the rules generated from it', () => {
  const rules = bhavaLordRules();

  it('generates one rule per cell', () => {
    expect(rules).toHaveLength(72);
  });

  it('every rule is single-condition and reads a lordship', () => {
    for (const r of rules) {
      expect(arity(r), r.id).toBe(1);
      expect(r.when[0]!.k, r.id).toBe('lordship');
    }
  });

  it('ids are unique and carry chapter, verse and the placement', () => {
    expect(new Set(rules.map((r) => r.id)).size).toBe(72);
    for (const r of rules) expect(r.id).toMatch(/^bphs\.24\.\d{3}\.lord\d-in-\d+$/);
  });

  it('the twelve placements of one lord share an effect id', () => {
    for (let l = 1; l <= 6; l++) {
      const forLord = rules.filter((r) => r.effect.id === `bhava-lord.${l}`);
      expect(forLord, `lord ${l}`).toHaveLength(12);
    }
  });

  it('only ONE placement of a lord can fire — they are mutually exclusive', () => {
    // Aries lagna: the lagna lord is Mars. Wherever Mars sits, exactly one of the twelve
    // lagna-lord rules is true. Sharing an effect id is therefore correct, not a collision.
    for (const h of [1, 5, 9, 12]) {
      const f = chart({ mars: { sign: (h - 1) % 12, house: h } });
      const lagnaLordHits = fired(rules, f).filter((x) => x.rule.effect.id === 'bhava-lord.1');
      expect(lagnaLordHits, `Mars in house ${h}`).toHaveLength(1);
      expect(lagnaLordHits[0]!.rule.id).toContain(`lord1-in-${h}`);
    }
  });

  it('never reports dissent within a lord, since two can never both fire', () => {
    const f = chart({ mars: { sign: 8, house: 9 } });
    const res = arbitrate(rules, f);
    for (const finding of res.findings) expect(finding.dissent, finding.hit.rule.id).toHaveLength(0);
  });

  it('can be generated for a subset of lords', () => {
    expect(bhavaLordRules([1])).toHaveLength(12);
    expect(bhavaLordRules([1, 2])).toHaveLength(24);
  });

  it('weight tracks the strength of the claim', () => {
    for (const r of rules) {
      expect(r.weight, r.id).toBeGreaterThan(0);
      expect(r.weight, r.id).toBeLessThanOrEqual(1);
    }
    // A strong claim outweighs a hedged one.
    const strong = rules.find((r) => r.id.includes('lord5-in-10'))!;
    const weak = rules.find((r) => r.id.includes('lord1-in-5'))!;
    expect(strong.weight).toBeGreaterThan(weak.weight);
  });
});

// ── Policy ───────────────────────────────────────────────────────────────────
describe('BPHS 24a — what was cut, and where it is recorded', () => {
  const rules = bhavaLordRules();

  it('records exclusions per verse rather than as a chapter disclaimer', () => {
    const withExclusions = LORD_PLACEMENTS.filter((p) => p.excluded);
    expect(withExclusions.length).toBeGreaterThan(25);
    for (const p of withExclusions) {
      expect(p.excluded!.length, `${p.lord}/${p.house}`).toBeGreaterThan(10);
    }
  });

  it('carries each exclusion onto the generated rule', () => {
    const cut = LORD_PLACEMENTS.find((p) => p.excluded)!;
    const r = rules.find((x) => x.id.includes(`lord${cut.lord}-in-${cut.house}`))!;
    expect(r.note).toContain('Not carried from this verse');
  });

  it('names the five themes that recur across the chapter', () => {
    expect(CH24A_EXCLUSION_THEMES).toHaveLength(5);
    const joined = CH24A_EXCLUSION_THEMES.join(' ');
    expect(joined).toContain('Character verdicts');
    expect(joined).toContain('Counts of relationships');
    expect(joined).toContain('Medical claims');
  });

  it('no summary carries mortal, medical or judgemental language', () => {
    for (const p of LORD_PLACEMENTS) {
      expect(p.summary, `${p.lord}/${p.house}`)
        .not.toMatch(/\b(death|dies?|dying|sick|sickly|disease[ds]?|thief|thievish|fool|foolish|wicked|miser|miserly|libidinous|wives|barren|progeny)\b/i);
    }
  });

  it('records why this chapter is a table and not 72 objects', () => {
    expect(CH24A_TABLE_RATIONALE).toContain('enforced by construction');
    expect(CH24A_EFFECT_ID_RATIONALE).toContain('mutually exclusive');
  });

  it('is honest that a 1:1 verse-to-rule yield still lost material', () => {
    expect(CH24A_YIELD.rules).toBe(72);
    expect(CH24A_YIELD.verses).toBe(72);
    expect(CH24A_YIELD.note).toContain('a clause almost always is');
  });
});
