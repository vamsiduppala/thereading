// BPHS Programme Part 27 — Chapter 25: the non-luminous planets.
//
// The most heavily constrained chapter in the corpus. The tests care most about the audit
// trail: every cell accounted for, every withheld cell carrying its reason.

import { describe, it, expect } from 'vitest';
import {
  UPAGRAHAS, UPAGRAHA_ALIASES, UPAGRAHA_PLACEMENTS, upagrahaRules,
  upagrahaTableIsComplete, CH25_YIELD, CH25_EXCLUSION_THEMES,
  CH25_ASTROLOGY_NOT_ANTHROPOLOGY, CH25_WIRING, CH25_TEXTUAL_FAULT,
  UPAGRAHA_YIELD_TRACKS_NATURE,
  allEncodedRules, arity, fired,
  type ChartFacts,
} from '../src/index.js';

// ── The table ────────────────────────────────────────────────────────────────
describe('BPHS 25 — every cell is accounted for', () => {
  it('has six upagrahas and 72 cells', () => {
    expect(UPAGRAHAS).toHaveLength(6);
    expect(UPAGRAHA_PLACEMENTS).toHaveLength(72);
    expect(upagrahaTableIsComplete()).toBe(true);
  });

  it('covers every upagraha in every house exactly once', () => {
    const keys = UPAGRAHA_PLACEMENTS.map((p) => `${p.upagraha}-${p.house}`);
    expect(new Set(keys).size).toBe(72);
  });

  it('numbers the verses contiguously from 2 to 73', () => {
    const v = UPAGRAHA_PLACEMENTS.map((p) => Number(p.verse)).sort((a, b) => a - b);
    expect(v[0]).toBe(2);
    expect(v[71]).toBe(73);
    for (let i = 1; i < v.length; i++) expect(v[i]).toBe(v[i - 1]! + 1);
  });

  it('records the aliases each upagraha goes by', () => {
    for (const u of UPAGRAHAS) {
      expect(UPAGRAHA_ALIASES[u], u).toBeDefined();
      expect(UPAGRAHA_ALIASES[u].length, u).toBeGreaterThan(0);
    }
    expect(UPAGRAHA_ALIASES.dhwaja).toContain('Upaketu');
    expect(UPAGRAHA_ALIASES.paridhi).toContain('Parivesha');
  });
});

// ── The audit trail ──────────────────────────────────────────────────────────
describe('BPHS 25 — withheld cells are refused, not pending', () => {
  it('keeps all 72 rather than listing only the survivors', () => {
    const surfaced = UPAGRAHA_PLACEMENTS.filter((p) => p.surfaced).length;
    const withheld = UPAGRAHA_PLACEMENTS.filter((p) => !p.surfaced).length;
    expect(surfaced + withheld).toBe(72);
    expect(CH25_YIELD.surfaced).toBe(surfaced);
    expect(CH25_YIELD.withheldEntirely).toBe(withheld);
  });

  it('withholds a substantial fraction — this is the point, not a shortfall', () => {
    const withheld = UPAGRAHA_PLACEMENTS.filter((p) => !p.surfaced).length;
    expect(withheld).toBeGreaterThan(20);
    expect(CH25_YIELD.note).toContain('refused rather than as pending');
  });

  it('every withheld cell says WHY', () => {
    for (const p of UPAGRAHA_PLACEMENTS.filter((x) => !x.surfaced)) {
      expect(p.withheld, `${p.upagraha}/${p.house}`).toBeTruthy();
      expect(p.withheld!.length, `${p.upagraha}/${p.house}`).toBeGreaterThan(10);
    }
  });

  it('every surfaced cell has a summary and a valence, and no withheld cell has either', () => {
    for (const p of UPAGRAHA_PLACEMENTS) {
      if (p.surfaced) {
        expect(p.summary, `${p.upagraha}/${p.house}`).toBeTruthy();
        expect(p.valence, `${p.upagraha}/${p.house}`).toBeDefined();
        expect(p.valence, `${p.upagraha}/${p.house}`).not.toBe(0);
      } else {
        expect(p.summary, `${p.upagraha}/${p.house}`).toBeUndefined();
        expect(p.valence, `${p.upagraha}/${p.house}`).toBeUndefined();
      }
    }
  });

  it('records the missing verse as a source gap, not an extraction miss', () => {
    const missing = UPAGRAHA_PLACEMENTS.find((p) => p.verse === '24')!;
    expect(missing.surfaced).toBe(false);
    expect(missing.withheld).toContain('missing from this edition');
    expect(CH25_TEXTUAL_FAULT).toContain('27’s missing verses 30-31');
  });

  it('names the five exclusion themes, including the two slurs', () => {
    expect(CH25_EXCLUSION_THEMES).toHaveLength(5);
    const joined = CH25_EXCLUSION_THEMES.join(' ');
    expect(joined).toContain('caste slur');
    expect(joined).toContain('slur about the native’s sex');
  });

  it('the exclusion rate tracks the point’s nature rather than falling randomly', () => {
    const per = (u: string) => UPAGRAHA_PLACEMENTS.filter((p) => p.upagraha === u && p.surfaced).length;
    // Paridhi is the most benefic and Gulika the most malefic; the gap is not an accident.
    expect(per('paridhi')).toBeGreaterThan(per('gulika') * 2);
    expect(UPAGRAHA_YIELD_TRACKS_NATURE).toContain('gulika 4');
  });

  it('distinguishes a constrained SUBJECT from constrained ANTHROPOLOGY', () => {
    // The distinction that says why the upagrahas are still worth having.
    expect(CH25_ASTROLOGY_NOT_ANTHROPOLOGY).toContain('astrology is usable');
    expect(CH25_ASTROLOGY_NOT_ANTHROPOLOGY).toContain('anthropology');
  });
});

// ── The rules ────────────────────────────────────────────────────────────────
describe('BPHS 25 — the surfaced rules', () => {
  const rules = upagrahaRules();

  it('generates one rule per surfaced cell and no more', () => {
    expect(rules).toHaveLength(UPAGRAHA_PLACEMENTS.filter((p) => p.surfaced).length);
  });

  it('every rule is single-condition and reads a placement', () => {
    for (const r of rules) {
      expect(arity(r), r.id).toBe(1);
      expect(r.when[0]!.k, r.id).toBe('placement');
    }
  });

  it('the twelve placements of an upagraha share one effect id', () => {
    for (const u of UPAGRAHAS) {
      const forU = rules.filter((r) => r.effect.id === `upagraha.${u}`);
      expect(forU.length, u).toBeGreaterThan(0);
      expect(forU.length, u).toBeLessThanOrEqual(12);
    }
  });

  it('fires when the upagraha is placed on the facts', () => {
    const f = {
      lagnaSign: 0,
      planets: { dhuma: { sign: 8, house: 9 } },
    } as unknown as ChartFacts;
    expect(fired(rules, f).map((h) => h.rule.id)).toContain('bphs.25.010.dhuma-in-9');
  });

  it('no summary carries disparagement, moral verdict or slur', () => {
    for (const p of UPAGRAHA_PLACEMENTS.filter((x) => x.surfaced)) {
      expect(p.summary!, `${p.upagraha}/${p.house}`)
        .not.toMatch(/\b(ugly|unsightly|emaciated|deformed?|disabled|sinful|wicked|shameless|cruel|mean|thief|thieving|eunuch|miser|miserly)\b/i);
    }
  });

  it('is registered now that Part 28 wired the upagrahas', () => {
    // Part 27 deliberately kept these out: they would have measured zero and read as dead
    // when they were merely unwired. Part 28 gave them a home and registered them.
    const ids = new Set(allEncodedRules().map((r) => r.id));
    for (const r of rules) expect(ids.has(r.id), r.id).toBe(true);
  });

  it('records why registration took two parts', () => {
    expect(CH25_WIRING).toContain('would have made 46 finished rules measure');
    expect(CH25_WIRING).toContain('Fifth missing generator fact');
  });
});
