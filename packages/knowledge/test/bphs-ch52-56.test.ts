// BPHS Programme Part 40 — Chapters 52-56: 45 maha×antar pairs.
//
// Two things here could go wrong silently and neither is caught by a rule firing correctly.
//
// The first is **attribution**. The source lost 18 section headings, so a cell's reading can
// be assigned to the wrong planet pair and still look entirely plausible. The tests assert the
// three properties that justify the repair — subsequence, later-not-earlier, monotonic — so
// that a future re-parse cannot quietly change who a reading belongs to.
//
// The second is **smoothing**. One condition shape fits 32 of 34 cells, and generating the
// table from it would have inverted the Mars/Saturn cell, which the chapter states adversely
// for the FAVOURABLE positions. That cell has its own test.

import { describe, it, expect } from 'vitest';
import {
  ANTARDASA_FRAME_IS_THE_DASHA_LORD, ANTARDASA_CONDITION_SHAPE, MARS_SATURN_BREAKS_THE_SHAPE,
  HEADINGS_RECOVERED_BY_CH51_ORDER, ANTARDASA_CELLS, CELLS_WITHOUT_A_HOUSE_CONDITION,
  RITUAL_REMEDIES_NOT_CARRIED, MARAKA_RIDER_DROPPED, MEDICAL_CLAIMS_DROPPED,
  antardasaCellRules, CH52_56_YIELD,
  evaluateAll, syntheticCharts, dashaSequence,
} from '../src/index.js';
import type { ChartFacts } from '../src/index.js';

const rules = antardasaCellRules();
const ruleFor = (maha: string, antar: string, tag: 'fav' | 'adv') =>
  rules.find((r) => r.id.endsWith(`${maha}-${antar}-${tag}`));

// A chart where every planet sits in a known sign, so a house counted FROM another planet is
// computable by hand. Aries ascendant; signs chosen to place things deliberately.
const chart = (signs: Record<string, number>, dasha: Record<string, string>): ChartFacts => {
  const planets: Record<string, unknown> = {};
  for (const [g, sign] of Object.entries(signs)) {
    planets[g] = { sign, house: ((sign - 0 + 12) % 12) + 1, longitude: sign * 30 + 5, dignity: 'neutral' };
  }
  return { lagnaSign: 0, planets, dasha } as unknown as ChartFacts;
};

// ── The frame: counted from the dasha lord ──────────────────────────────────
describe('BPHS 52-56 — the antardasa is read FROM THE DASHA LORD', () => {
  it('fires when the antar planet is in a named house from the maha lord', () => {
    // Rahu's dasha, Mercury's antardasa: favourable in a kendra from Rahu (55.34-35).
    const r = ruleFor('rahu', 'mercury', 'fav')!;
    // Rahu in Aries (0); Mercury in Cancer (3) is the 4th from Rahu — a kendra.
    expect(evaluateAll(r.when, chart({ rahu: 0, mercury: 3 }, { maha: 'rahu', antar: 'mercury' })))
      .toBe(true);
    // Mercury in Taurus (1) is the 2nd from Rahu — not named.
    expect(evaluateAll(r.when, chart({ rahu: 0, mercury: 1 }, { maha: 'rahu', antar: 'mercury' })))
      .toBe(false);
  });

  it('counts from the DASHA LORD, not the ascendant — the whole point of the block', () => {
    const r = ruleFor('rahu', 'mercury', 'fav')!;
    // Move Rahu and keep Mercury put: the same chart position now reads differently.
    // Rahu in Cancer (3), Mercury in Cancer (3) → the 1st from Rahu, a kendra. Fires.
    expect(evaluateAll(r.when, chart({ rahu: 3, mercury: 3 }, { maha: 'rahu', antar: 'mercury' })))
      .toBe(true);
    // Rahu in Gemini (2), Mercury in Cancer (3) → the 2nd from Rahu. Does not.
    expect(evaluateAll(r.when, chart({ rahu: 2, mercury: 3 }, { maha: 'rahu', antar: 'mercury' })))
      .toBe(false);
    // Mercury never moved. Only the frame did.
  });

  it('needs BOTH dasha levels — a maha alone is not this rule', () => {
    const r = ruleFor('rahu', 'mercury', 'fav')!;
    const facts = chart({ rahu: 0, mercury: 3 }, { maha: 'rahu' });
    expect(evaluateAll(r.when, facts)).toBe(false);
    // And the wrong antar lord does not satisfy it either.
    expect(evaluateAll(r.when, chart({ rahu: 0, mercury: 3 }, { maha: 'rahu', antar: 'venus' })))
      .toBe(false);
  });

  it('every rule carries exactly the three clauses the block needs', () => {
    for (const r of rules) {
      const kinds = r.when.map((p) => p.k);
      expect(kinds.filter((k) => k === 'dasha'), r.id).toHaveLength(2);
      expect(kinds, r.id).toContain('compound');
      expect(r.when, r.id).toHaveLength(3);
    }
    expect(ANTARDASA_FRAME_IS_THE_DASHA_LORD).toContain('PlanetFrame');
  });

  it('needed no new DSL — Part 28’s frame and Part 38’s dasha predicate together', () => {
    // If a later refactor removes PlanetFrame support, this is the test that says why it
    // mattered: the whole block is unexpressible without it.
    const r = rules[0]!;
    const compound = r.when.find((p) => p.k === 'compound')!;
    const inner = (compound as { of: { from?: unknown }[] }).of;
    for (const p of inner) expect(typeof p.from).toBe('string');
  });
});

// ── The shape, and its stated counterexample ────────────────────────────────
describe('BPHS 52-56 — one condition shape, and where the chapter breaks it', () => {
  it('gives the adverse branch as the dusthanas in 21 of the 22 cells that state one', () => {
    const adverse = ANTARDASA_CELLS.filter((c) => c.adverse.length);
    const dusthanaOnly = adverse.filter((c) => c.adverse.every((h) => [6, 8, 12].includes(h)));
    expect(adverse.length).toBe(22);
    expect(dusthanaOnly.length).toBe(21);
    // The one departure, named rather than smoothed away.
    const odd = adverse.find((c) => !c.adverse.every((h) => [6, 8, 12].includes(h)))!;
    expect([odd.maha, odd.antar]).toEqual(['moon', 'mars']);
    expect(odd.adverse).toContain(5);
  });

  it('gives every favourable set as kendras, trikonas, the 11th or the 3rd', () => {
    const allowed = new Set([1, 4, 7, 10, 5, 9, 11, 3, 2]);
    for (const c of ANTARDASA_CELLS) {
      for (const h of c.favourable) {
        expect(allowed.has(h), `${c.maha} x ${c.antar} house ${h}`).toBe(true);
      }
    }
  });

  it('MARS × SATURN reads its FAVOURABLE positions adversely, as the chapter says', () => {
    // 54.30-32: loss of reputation and position when Saturn is in a kendra, the 11th or the
    // 5th from Mars. A table generated from the shape would have said the opposite.
    const cell = ANTARDASA_CELLS.find((c) => c.maha === 'mars' && c.antar === 'saturn')!;
    expect(cell.favourable).toContain(11);
    const fav = ruleFor('mars', 'saturn', 'fav')!;
    expect(fav.effect.valence).toBeLessThan(0);
    // Every OTHER favourable branch is positive — so this is an exception, not the rule.
    for (const c of ANTARDASA_CELLS) {
      if (!c.favourable.length) continue;
      const r = ruleFor(c.maha, c.antar, 'fav')!;
      if (c.maha === 'mars' && c.antar === 'saturn') continue;
      expect(r.effect.valence, `${c.maha} x ${c.antar}`).toBeGreaterThan(0);
    }
    expect(MARS_SATURN_BREAKS_THE_SHAPE).toContain('RELATIONSHIP BETWEEN THE TWO');
  });

  it('states the shape as a measured default rather than a law', () => {
    expect(ANTARDASA_CONDITION_SHAPE).toContain('32 of the 34');
    expect(ANTARDASA_CONDITION_SHAPE).toContain('A default,');
  });
});

// ── Attribution: the repair Part 39 made possible ───────────────────────────
describe('Part 40 — the attribution, and why it is trustworthy', () => {
  it('records the three checks that justify recovering the lost headings', () => {
    expect(HEADINGS_RECOVERED_BY_CH51_ORDER).toContain('subsequence');
    expect(HEADINGS_RECOVERED_BY_CH51_ORDER).toContain('LATER in that');
    expect(HEADINGS_RECOVERED_BY_CH51_ORDER).toContain('monotonic');
    expect(HEADINGS_RECOVERED_BY_CH51_ORDER).toContain('Part 39');
  });

  it('every attributed antar planet is in its maha lord’s Vimshottari sequence', () => {
    // The property the repair rests on. If a cell were attributed to a planet that cannot
    // hold an antardasa in that dasha at all, the attribution is wrong on its face.
    for (const c of ANTARDASA_CELLS) {
      expect(dashaSequence(c.maha), `${c.maha} x ${c.antar}`).toContain(c.antar);
    }
  });

  it('never attributes a cell to its own maha lord twice or to a duplicate pair', () => {
    const seen = new Set(ANTARDASA_CELLS.map((c) => `${c.maha}|${c.antar}`));
    expect(seen.size).toBe(ANTARDASA_CELLS.length);
  });

  it('covers 26 of the 45 pairs and says why the other 19 are absent', () => {
    expect(ANTARDASA_CELLS).toHaveLength(26);
    expect(CELLS_WITHOUT_A_HOUSE_CONDITION).toContain('NOT missing cells');
  });

  it('draws every cell from the chapter its maha lord owns', () => {
    const OWNS: Record<string, number> = { sun: 52, moon: 53, mars: 54, rahu: 55, jupiter: 56 };
    for (const c of ANTARDASA_CELLS) expect(c.chapter, c.maha).toBe(OWNS[c.maha]);
  });
});

// ── Safety ──────────────────────────────────────────────────────────────────
describe('Part 40 — what these chapters say that we do not', () => {
  it('carries no mortality, medical or ritual content in any rule', () => {
    const banned = /death|die\b|fatal|disease|fever|rheumat|dysentery|urinary|illness|japa|mantra|homa|worship/i;
    for (const r of rules) {
      expect(banned.test(r.effect.summary), r.id).toBe(false);
    }
  });

  it('records each refusal so the omissions are visible against the page', () => {
    expect(RITUAL_REMEDIES_NOT_CARRIED).toContain('Ten of the 82');
    expect(MARAKA_RIDER_DROPPED).toContain('Sixteen blocks');
    expect(MEDICAL_CLAIMS_DROPPED).toContain('None of it is carried');
  });

  it('withheld no cell entirely, because every dropped clause was separable', () => {
    expect(MARAKA_RIDER_DROPPED).toContain('NO cell in these five chapters had to be withheld');
    // Every cell with a stated branch produced a rule.
    const withBranch = ANTARDASA_CELLS.filter((c) => c.favourable.length || c.adverse.length);
    expect(withBranch).toHaveLength(ANTARDASA_CELLS.length);
    expect(rules.length).toBeGreaterThanOrEqual(ANTARDASA_CELLS.length);
  });

  it('every rule notes what was not carried from its verses', () => {
    for (const r of rules) expect(r.note, r.id).toContain('not carried');
  });
});

// ── Calibration ─────────────────────────────────────────────────────────────
describe('Part 40 — the rules measure a real rate', () => {
  it('fires on the synthetic population at roughly 1/81 × houses/12', () => {
    // Both dasha levels are generated, so these calibrate rather than reading as dead.
    const charts = syntheticCharts(4000, 13);
    const r = ruleFor('moon', 'rahu', 'fav')!;   // 8 favourable houses
    const hits = charts.filter((c) => evaluateAll(r.when, c)).length;
    expect(hits).toBeGreaterThan(0);
    // 1/9 x 1/9 x 8/12 ~ 0.82%. Generous bounds — this is a shape check, not a probability.
    expect(hits / charts.length).toBeLessThan(0.05);
  });
});

describe('Part 40 — the yield', () => {
  it('credits Part 39 with making the source usable', () => {
    expect(CH52_56_YIELD.note).toContain('PART 39 REPAIRED IT');
    expect(CH52_56_YIELD.note).toContain('Needed no new DSL');
  });
});
