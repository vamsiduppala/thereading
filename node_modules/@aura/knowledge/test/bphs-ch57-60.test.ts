// BPHS Programme Part 41 — Chapters 57-60, the other 36 maha×antar pairs.
//
// The mechanical half repeats Part 40 and is tested the same way. The half worth reading is
// `the enmity hypothesis is refuted`: Part 40 proposed a general rule from one stated
// exception and named these chapters as the test. They fail it, and that test exists so the
// hypothesis cannot be quietly revived by a later part that only reads chapter 54.

import { describe, it, expect } from 'vitest';
import {
  ENMITY_AXIS_REFUTED, ATTRIBUTION_HELD_ON_A_WORSE_SOURCE, ANTARDASA_CELLS_57_60,
  SHAPE_IS_CLEANER_HERE, CELLS_57_60_COVERAGE, REFUSALS_57_60, antardasaCellRules57,
  CH57_60_YIELD,
  ANTARDASA_CELLS, antardasaCellRules, MARS_SATURN_BREAKS_THE_SHAPE,
  evaluateAll, dashaSequence, allEncodedRules,
} from '../src/index.js';
import type { ChartFacts } from '../src/index.js';

const rules = antardasaCellRules57();
const ruleFor = (maha: string, antar: string, tag: 'fav' | 'adv') =>
  rules.find((r) => r.id.endsWith(`${maha}-${antar}-${tag}`));

const chart = (signs: Record<string, number>, dasha: Record<string, string>): ChartFacts => {
  const planets: Record<string, unknown> = {};
  for (const [g, sign] of Object.entries(signs)) {
    planets[g] = { sign, house: (sign % 12) + 1, longitude: sign * 30 + 5, dignity: 'neutral' };
  }
  return { lagnaSign: 0, planets, dasha } as unknown as ChartFacts;
};

// ── The result ──────────────────────────────────────────────────────────────
describe('Part 41 — the enmity hypothesis is REFUTED', () => {
  it('Mars/Saturn inverts in ONE order only, which no enmity rule can produce', () => {
    // Part 40: Mars's dasha, Saturn's antardasa reads its FAVOURABLE houses adversely.
    const marsDasha = antardasaCellRules().find((r) => r.id.endsWith('mars-saturn-fav'))!;
    expect(marsDasha.effect.valence).toBeLessThan(0);

    // Part 41: Saturn's dasha, Mars's antardasa is favourable (57.55-57) — so the pair is
    // NOT symmetric, and "these two are enemies" predicts symmetry.
    const saturnDasha = ANTARDASA_CELLS_57_60.find(
      (c) => c.maha === 'saturn' && c.antar === 'mars',
    );
    // 57.55-57 conditions on exaltation rather than a house from the dasha lord, so there is
    // no cell here — but there is also no adverse rule, which is the point.
    expect(saturnDasha).toBeUndefined();
    expect(rules.some((r) => r.id.includes('saturn-mars') && r.effect.valence < 0)).toBe(false);

    expect(ENMITY_AXIS_REFUTED).toContain('REFUTED');
    expect(ENMITY_AXIS_REFUTED).toContain('would be SYMMETRIC');
  });

  it('leaves 54.30-32 standing as a stated exception, not promoted to a rule', () => {
    expect(MARS_SATURN_BREAKS_THE_SHAPE).toContain('54.30-32');
    expect(ENMITY_AXIS_REFUTED).toContain('remains a stated exception');
    // And no cell in 57-60 was inverted on the strength of the refuted story.
    for (const c of ANTARDASA_CELLS_57_60) {
      if (!c.favourable.length) continue;
      expect(ruleFor(c.maha, c.antar, 'fav')!.effect.valence, `${c.maha} x ${c.antar}`)
        .toBeGreaterThan(0);
    }
  });

  it('says plainly that Saturn × Sun could not be tested either way', () => {
    expect(ENMITY_AXIS_REFUTED).toContain('untestable');
    expect(ANTARDASA_CELLS_57_60.some((c) => c.maha === 'saturn' && c.antar === 'sun')).toBe(false);
  });
});

// ── The attribution, on a worse source ──────────────────────────────────────
describe('Part 41 — the attribution held with 5 headings of 36', () => {
  it('records the counts that make this the harder test', () => {
    expect(ATTRIBUTION_HELD_ON_A_WORSE_SOURCE).toContain('5 of their 36');
    expect(ATTRIBUTION_HELD_ON_A_WORSE_SOURCE).toContain('27 of 45');
    expect(ATTRIBUTION_HELD_ON_A_WORSE_SOURCE).toContain('62 attributable blocks');
  });

  it('every attributed antar planet can actually hold that antardasa', () => {
    for (const c of ANTARDASA_CELLS_57_60) {
      expect(dashaSequence(c.maha), `${c.maha} x ${c.antar}`).toContain(c.antar);
    }
  });

  it('draws every cell from the chapter its maha lord owns', () => {
    const OWNS: Record<string, number> = { saturn: 57, mercury: 58, ketu: 59, venus: 60 };
    for (const c of ANTARDASA_CELLS_57_60) expect(c.chapter, c.maha).toBe(OWNS[c.maha]);
  });

  it('has no duplicate pair, and none that Part 40 already covered', () => {
    const mine = ANTARDASA_CELLS_57_60.map((c) => `${c.maha}|${c.antar}`);
    expect(new Set(mine).size).toBe(mine.length);
    const theirs = new Set(ANTARDASA_CELLS.map((c) => `${c.maha}|${c.antar}`));
    for (const k of mine) expect(theirs.has(k), k).toBe(false);
  });
});

// ── The shape ───────────────────────────────────────────────────────────────
describe('BPHS 57-60 — the shape, cleaner than in 52-56', () => {
  it('makes every adverse branch exactly the dusthanas — no departures', () => {
    const adverse = ANTARDASA_CELLS_57_60.filter((c) => c.adverse.length);
    expect(adverse).toHaveLength(9);
    for (const c of adverse) {
      expect(c.adverse.every((h) => [6, 8, 12].includes(h)), `${c.maha} x ${c.antar}`).toBe(true);
    }
    expect(SHAPE_IS_CLEANER_HERE).toContain('without exception');
  });

  it('keeps every favourable set to kendras, trikonas, the 11th, 3rd or 2nd', () => {
    const allowed = new Set([1, 2, 3, 4, 5, 7, 9, 10, 11]);
    for (const c of ANTARDASA_CELLS_57_60) {
      for (const h of c.favourable) {
        expect(allowed.has(h), `${c.maha} x ${c.antar} house ${h}`).toBe(true);
      }
    }
  });

  it('explains the lower yield rather than leaving 12-of-36 to look like a gap', () => {
    expect(ANTARDASA_CELLS_57_60).toHaveLength(12);
    expect(CELLS_57_60_COVERAGE).toContain('Not missing cells');
    expect(CELLS_57_60_COVERAGE).toContain('LORDSHIP FROM THE');
  });
});

// ── The rules ───────────────────────────────────────────────────────────────
describe('BPHS 57-60 — the rules read from the dasha lord, as in Part 40', () => {
  it('fires only when both levels and the position agree', () => {
    // Saturn's dasha, the Moon's antardasa: favourable in a kendra from Saturn (57.43-45).
    const r = ruleFor('saturn', 'moon', 'fav')!;
    expect(evaluateAll(r.when, chart({ saturn: 0, moon: 3 }, { maha: 'saturn', antar: 'moon' })))
      .toBe(true);                                    // the 4th from Saturn
    expect(evaluateAll(r.when, chart({ saturn: 0, moon: 1 }, { maha: 'saturn', antar: 'moon' })))
      .toBe(false);                                   // the 2nd — not named
    expect(evaluateAll(r.when, chart({ saturn: 0, moon: 3 }, { maha: 'saturn' })))
      .toBe(false);                                   // no antar level
  });

  it('and the adverse branch on the dusthanas from the dasha lord', () => {
    const r = ruleFor('saturn', 'moon', 'adv')!;
    // Moon in Virgo (5) is the 6th from Saturn in Aries (0).
    expect(evaluateAll(r.when, chart({ saturn: 0, moon: 5 }, { maha: 'saturn', antar: 'moon' })))
      .toBe(true);
    expect(r.effect.valence).toBeLessThan(0);
  });

  it('carries three clauses each, two of them dasha levels', () => {
    for (const r of rules) {
      expect(r.when, r.id).toHaveLength(3);
      expect(r.when.filter((p) => p.k === 'dasha'), r.id).toHaveLength(2);
    }
    expect(rules).toHaveLength(15);
  });

  it('is registered — the registry is the one list', () => {
    const ids = new Set(allEncodedRules().map((r) => r.id));
    for (const r of rules) expect(ids.has(r.id), r.id).toBe(true);
  });
});

// ── Safety ──────────────────────────────────────────────────────────────────
describe('Part 41 — the same three refusals, at lower density', () => {
  it('carries no mortality, medical or ritual content', () => {
    const banned = /death|die\b|fatal|disease|fever|sickness|physical distress|japa|mantra|homa|worship/i;
    for (const r of rules) expect(banned.test(r.effect.summary), r.id).toBe(false);
    for (const r of rules) expect(r.note).toContain('not carried');
  });

  it('records the counts so the omissions are visible against the page', () => {
    expect(REFUSALS_57_60).toContain('4 of 66');
    expect(REFUSALS_57_60).toContain('14 of 66');
    expect(REFUSALS_57_60).toContain('NO cell had to be withheld');
  });
});

describe('Part 41 — the yield', () => {
  it('leads with the refutation rather than the volume', () => {
    expect(CH57_60_YIELD.note).toContain('ENMITY HYPOTHESIS IS REFUTED');
    expect(CH57_60_YIELD.note).toContain('ATTRIBUTION HELD ON A FAR WORSE SOURCE');
  });
});
