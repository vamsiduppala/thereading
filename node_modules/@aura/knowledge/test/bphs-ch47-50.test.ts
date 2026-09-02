// BPHS Programme Part 38 — Chapters 47-50: the join between the rule corpus and the timing
// layer.
//
// The tests that matter most here are the ones about the JOIN itself. Every rule encoded
// before this part described a chart; these describe a chart *during a period*. Two things
// can go wrong with that and neither shows up as a failing assertion unless it is asked for
// directly:
//
//   1. A rule that names a dasha lord and a lordship as two independent clauses fires on
//      charts where they are different planets. That was the first draft of this file, and
//      `the dasha clause and the lordship are ONE claim` exists so it cannot come back.
//   2. A rule that reads a fact the generator does not produce calibrates at zero and reads
//      as dead. That was the seventh time; `the generator feeds the dasha` pins it.

import { describe, it, expect } from 'vitest';
import {
  DASHA_EFFECT_TAXONOMY, DASHA_FAVOURABLE_SHAPE, CH47_EFFECT_PROSE_NOT_CARRIED,
  CONDITION_OUTRANKS_NATURE, HOUSE_LORD_DASHA, houseLordDashaRules,
  MARAKA_ROWS_USE_THE_CHAPTERS_OWN_ALTERNATIVE, CH48_COMMENTARY_DISAGREES_WITH_CH34,
  DASHA_START_CHART_IS_A_GAP, DASHA_LORD_IS_A_PLANETREF, CH47_48_YIELD,
  charaHouseVerdict, charaRasiVerdict, WITHIN_PERIOD_SPLIT_IS_NEW,
  CHARA_UPACHAYA_INVERSION, CHARA_COUNTS_FROM_THE_DASHA_RASI, CH49_TABLE_NOT_ENCODED,
  CH49_50_YIELD,
  SOURCE_STATED_ARBITRATION, evaluateAll, syntheticCharts, LORDSHIP_GROUPS,
} from '../src/index.js';
import type { ChartFacts } from '../src/index.js';

// A chart with an Aries ascendant, so house lords are the textbook ones: 1st Mars, 2nd Venus,
// 9th Jupiter, 10th Saturn. `dignity` is per-planet, `dasha` per level.
const chart = (over: Partial<ChartFacts> = {}): ChartFacts => ({
  lagnaSign: 0,
  planets: {
    sun: { sign: 4, house: 5, longitude: 130, dignity: 'own' },
    moon: { sign: 3, house: 4, longitude: 100, dignity: 'own' },
    mars: { sign: 0, house: 1, longitude: 10, dignity: 'own' },
    mercury: { sign: 5, house: 6, longitude: 160, dignity: 'own' },
    jupiter: { sign: 8, house: 9, longitude: 250, dignity: 'own' },
    venus: { sign: 1, house: 2, longitude: 40, dignity: 'own' },
    saturn: { sign: 9, house: 10, longitude: 280, dignity: 'own' },
    rahu: { sign: 2, house: 3, longitude: 70, dignity: 'neutral' },
    ketu: { sign: 8, house: 9, longitude: 250, dignity: 'neutral' },
  },
} as unknown as ChartFacts) as ChartFacts;

const withDasha = (lord: string, dignities: Record<string, string> = {}): ChartFacts => {
  const f = chart() as unknown as Record<string, unknown>;
  const planets = { ...(f['planets'] as Record<string, Record<string, unknown>>) };
  for (const [g, d] of Object.entries(dignities)) planets[g] = { ...planets[g]!, dignity: d };
  return { ...f, planets, dasha: { maha: lord } } as unknown as ChartFacts;
};

const ruleFor = (house: number) =>
  houseLordDashaRules().find((r) => r.effect.id === `dasha.house-lord.${house}`)!;

// ── The join: a rule that fires on a placement AND a period ──────────────────
describe('BPHS 48 — the join between the rule corpus and the timing layer', () => {
  it('fires only when BOTH the period and the placement agree', () => {
    const r = ruleFor(2);                                   // Aries lagna: the 2nd lord is Venus
    // Venus's dasha, Venus well placed -> fires.
    expect(evaluateAll(r.when, withDasha('venus'))).toBe(true);
    // The same chart with no dasha running -> silent. A static reading cannot claim it.
    expect(evaluateAll(r.when, chart())).toBe(false);
    // Venus's dasha but Venus debilitated -> silent, per 48.1.
    expect(evaluateAll(r.when, withDasha('venus', { venus: 'debilitated' }))).toBe(false);
  });

  it('the dasha clause and the lordship are ONE claim, not two that happen to coincide', () => {
    // The regression this whole part turned on. The first draft emitted
    //   { dasha: mars } AND { the 2nd lord occupies the 2nd }
    // as separate conjuncts, so a MARS dasha satisfied the 2nd lord's rule whenever Venus
    // was well placed — 77 rules, none of them saying what the chapter says.
    const r = ruleFor(2);
    // Mars's dasha, Venus (the actual 2nd lord) in own sign and well placed.
    const wrongLord = withDasha('mars');
    expect((wrongLord as unknown as Record<string, Record<string, string>>)['dasha']!['maha'])
      .toBe('mars');
    expect(chart().planets['venus']!.dignity).toBe('own');
    // Under the broken encoding this was true. It must be false.
    expect(evaluateAll(r.when, wrongLord)).toBe(false);
  });

  it('resolves the lord from the ASCENDANT, so the same rule names a different planet', () => {
    const r = ruleFor(2);
    // Aries lagna -> the 2nd is Taurus -> Venus.
    expect(evaluateAll(r.when, withDasha('venus'))).toBe(true);
    // Taurus lagna -> the 2nd is Gemini -> Mercury. The rule is unchanged; the planet is not.
    const taurus = { ...(withDasha('mercury') as unknown as Record<string, unknown>), lagnaSign: 1 };
    expect(evaluateAll(r.when, taurus as unknown as ChartFacts)).toBe(true);
    const taurusVenus = { ...(withDasha('venus') as unknown as Record<string, unknown>), lagnaSign: 1 };
    expect(evaluateAll(r.when, taurusVenus as unknown as ChartFacts)).toBe(false);
  });

  it('emits one rule per surfaced house — not one per (house, graha) pair', () => {
    const rules = houseLordDashaRules();
    expect(rules).toHaveLength(HOUSE_LORD_DASHA.filter((r) => r.surfaced).length);
    expect(rules).toHaveLength(11);
    expect(new Set(rules.map((r) => r.effect.id)).size).toBe(11);
    expect(DASHA_LORD_IS_A_PLANETREF).toContain('UNSOUND');
    expect(DASHA_LORD_IS_A_PLANETREF).toContain('collapsed 77 rules to 11');
  });

  it('every rule carries a dasha predicate — that is what makes them timing rules', () => {
    for (const r of houseLordDashaRules()) {
      expect(r.when.some((p) => p.k === 'dasha'), r.id).toBe(true);
    }
  });
});

// ── The generator, seventh missing fact ──────────────────────────────────────
describe('Part 38 — the generator feeds the dasha', () => {
  it('produces a maha lord for every synthetic chart', () => {
    const charts = syntheticCharts(200, 7);
    for (const c of charts) expect(c.dasha?.maha, 'every chart carries a dasha').toBeTruthy();
  });

  it('derives it from the Moon rather than drawing it independently', () => {
    // Two charts with the same Moon nakshatra must get the same maha lord, or the population
    // contains charts that contradict themselves — the reason the karakas are derived too.
    const charts = syntheticCharts(400, 11);
    const byNak = new Map<number, string>();
    for (const c of charts) {
      const nak = Math.floor((c.planets['moon']!.longitude / (360 / 27)) % 27);
      const seen = byNak.get(nak);
      if (seen) expect(c.dasha!.maha, `nakshatra ${nak}`).toBe(seen);
      else byNak.set(nak, c.dasha!.maha!);
    }
    expect(byNak.size).toBeGreaterThan(20);
  });

  it('spreads across all nine Vimshottari lords', () => {
    const seen = new Set(syntheticCharts(600, 3).map((c) => c.dasha!.maha));
    expect(seen.size).toBe(9);
  });

  it('and so chapter 48’s rules measure a real rate instead of zero', () => {
    // Before the generator carried a dasha these calibrated at exactly 0.000% and read as
    // dead. The expected rate is ~1/9 (the lord's dasha) x ~0.43 (a good dignity) ~ 4.8%.
    const charts = syntheticCharts(3000, 5);
    const r = ruleFor(9);
    const hits = charts.filter((c) => evaluateAll(r.when, c)).length;
    expect(hits).toBeGreaterThan(0);
    expect(hits / charts.length).toBeGreaterThan(0.01);
    expect(hits / charts.length).toBeLessThan(0.12);
  });
});

// ── Safety: the maraka rows ──────────────────────────────────────────────────
describe('BPHS 48.2-8 — the three rows that name death', () => {
  it('withholds the 8th entirely, because the chapter offers no alternative', () => {
    const eighth = HOUSE_LORD_DASHA.find((r) => r.house === 8)!;
    expect(eighth.surfaced).toBe(false);
    expect(eighth.summary).toBeUndefined();
    expect(eighth.withheld).toContain('Part 51');
    expect(houseLordDashaRules().some((r) => r.effect.id.endsWith('.8'))).toBe(false);
  });

  it('surfaces the 2nd and 7th on the CHAPTER’S own alternative, not a softening of ours', () => {
    for (const h of [2, 7]) {
      const row = HOUSE_LORD_DASHA.find((r) => r.house === h)!;
      expect(row.surfaced).toBe(true);
      expect(row.excluded, `house ${h}`).toContain('maraka');
      expect(row.valence!).toBeGreaterThan(0);
    }
    expect(HOUSE_LORD_DASHA.find((r) => r.house === 2)!.summary).toMatch(/gain/i);
    expect(HOUSE_LORD_DASHA.find((r) => r.house === 7)!.summary).toMatch(/celebration/i);
    expect(MARAKA_ROWS_USE_THE_CHAPTERS_OWN_ALTERNATIVE).toContain('the text’s, not a');
  });

  it('carries no mortality or medical claim in any surfaced summary', () => {
    const banned = /death|die|dying|fatal|disease|illness|ill health|fever|danger/i;
    for (const row of HOUSE_LORD_DASHA) {
      if (!row.surfaced) continue;
      expect(banned.test(row.summary!), `house ${row.house}: ${row.summary}`).toBe(false);
    }
    for (const r of houseLordDashaRules()) expect(banned.test(r.effect.summary)).toBe(false);
  });

  it('records what was dropped from every row that lost something', () => {
    // A row that silently drops half a verse is worse than one that says it did.
    for (const h of [2, 6, 7, 11, 12]) {
      expect(HOUSE_LORD_DASHA.find((r) => r.house === h)!.excluded, `house ${h}`).toBeTruthy();
    }
  });
});

// ── 48.1: the twelfth arbitration instruction ────────────────────────────────
describe('BPHS 48.1 — condition outranks nature', () => {
  it('joins the source-stated arbitration list as the twelfth', () => {
    expect(SOURCE_STATED_ARBITRATION.length).toBeGreaterThanOrEqual(12);
    expect(SOURCE_STATED_ARBITRATION.some((s) => s.startsWith('48.1'))).toBe(true);
    expect(SOURCE_STATED_ARBITRATION.find((s) => s.startsWith('48.1'))!)
      .toContain('CONDITION');
  });

  it('is the reason every house-lord rule carries a dignity clause', () => {
    for (const r of houseLordDashaRules()) {
      expect(r.when.some((p) => p.k === 'dignity'), r.id).toBe(true);
    }
    expect(CONDITION_OUTRANKS_NATURE).toContain('condition outranks its nature');
  });
});

// ── Chapter 47 ───────────────────────────────────────────────────────────────
describe('BPHS 47 — the taxonomy, and the prose that is not carried', () => {
  it('records the general/distinctive split as the line the engine already draws', () => {
    expect(DASHA_EFFECT_TAXONOMY).toContain('GENERAL');
    expect(DASHA_EFFECT_TAXONOMY).toContain('DISTINCTIVE');
    expect(DASHA_FAVOURABLE_SHAPE).toContain('good house');
  });

  it('says plainly that the per-planet effect prose was refused, and why', () => {
    expect(CH47_EFFECT_PROSE_NOT_CARRIED).toContain('length and no capability');
  });
});

// ── Chapter 50 — the Chara reading engine ────────────────────────────────────
describe('BPHS 50.4-10 — read from the DASHA RASI, not the ascendant', () => {
  it('gets the upachaya inversion the right way round', () => {
    // The single easiest clause in this chapter to encode backwards.
    expect(charaHouseVerdict(3, 'malefic')!.valence).toBeGreaterThan(0);
    expect(charaHouseVerdict(6, 'malefic')!.valence).toBeGreaterThan(0);
    expect(charaHouseVerdict(3, 'benefic')!.valence).toBeLessThan(0);
    expect(charaHouseVerdict(6, 'benefic')!.valence).toBeLessThan(0);
    expect(CHARA_UPACHAYA_INVERSION).toContain('very easy to encode');
  });

  it('reads malefics in the 5th, 8th and 9th as adverse', () => {
    for (const h of [5, 8, 9]) {
      expect(charaHouseVerdict(h, 'malefic')!.valence, `house ${h}`).toBeLessThan(0);
      expect(charaHouseVerdict(h, 'benefic'), `house ${h}`).toBeNull();
    }
  });

  it('treats the 11th as favourable whichever kind of planet sits there', () => {
    for (const o of ['benefic', 'malefic', 'both'] as const) {
      expect(charaHouseVerdict(11, o)!.valence, o).toBeGreaterThan(0);
    }
    expect(charaHouseVerdict(11, 'empty')).toBeNull();
  });

  it('says nothing about houses the chapter says nothing about', () => {
    for (const h of [1, 2, 4, 7, 10, 12]) {
      expect(charaHouseVerdict(h, 'malefic'), `house ${h}`).toBeNull();
      expect(charaHouseVerdict(h, 'benefic'), `house ${h}`).toBeNull();
    }
  });

  it('counts from the dasha rasi, which is what makes it portable', () => {
    expect(CHARA_COUNTS_FROM_THE_DASHA_RASI).toContain('DASHA RASI');
    expect(CHARA_COUNTS_FROM_THE_DASHA_RASI).toContain('not from the ascendant');
  });
});

describe('BPHS 50.4-10 — the first within-period split in the corpus', () => {
  it('splits when owner and occupant disagree, and does not when they agree', () => {
    expect(charaRasiVerdict('benefic', 'benefic').split).toBeUndefined();
    expect(charaRasiVerdict('benefic', 'empty').split).toBeUndefined();
    expect(charaRasiVerdict('malefic', 'malefic').split).toBeUndefined();
    // The two the chapter splits.
    expect(charaRasiVerdict('benefic', 'malefic').split).toBeDefined();
    expect(charaRasiVerdict('malefic', 'benefic').split).toBeDefined();
  });

  it('gives the agreeing cases opposite signs and the split cases neither', () => {
    expect(charaRasiVerdict('benefic', 'benefic').valence).toBeGreaterThan(0);
    expect(charaRasiVerdict('malefic', 'malefic').valence).toBeLessThan(0);
    expect(charaRasiVerdict('benefic', 'malefic').valence).toBe(0);
  });

  it('puts the favourable half FIRST, as the chapter does', () => {
    const s = charaRasiVerdict('benefic', 'malefic').split!;
    expect(s.first).toMatch(/favourab/i);
    expect(s.latter).toMatch(/turns|asks/i);
  });

  it('records that the engine cannot represent it, rather than bodging a boundary', () => {
    expect(WITHIN_PERIOD_SPLIT_IS_NEW).toContain('NOT bodged');
    expect(WITHIN_PERIOD_SPLIT_IS_NEW).toContain('invent a boundary the text does not give');
  });
});

// ── Chapter 49 — refused ─────────────────────────────────────────────────────
describe('BPHS 49 — the 144-cell Kalachakra table', () => {
  it('is recorded as a deliberate omission with the count that decided it', () => {
    expect(CH49_TABLE_NOT_ENCODED).toContain('NOT encoded');
    expect(CH49_TABLE_NOT_ENCODED).toContain('two cells in nine');
    expect(CH49_TABLE_NOT_ENCODED).toContain('deliberate omission, not an oversight');
  });
});

// ── Capability gaps, stated ──────────────────────────────────────────────────
describe('Part 38 — what chapter 48 asks for and the engine does not have', () => {
  it('records the dasha-start chart as a gap with a known shape', () => {
    expect(DASHA_START_CHART_IS_A_GAP).toContain('COMMENCEMENT OF THE DASHA');
    expect(DASHA_START_CHART_IS_A_GAP).toContain('vargaFacts');
  });

  it('keeps the commentator’s amendment out of the rules', () => {
    expect(CH48_COMMENTARY_DISAGREES_WITH_CH34).toContain('Recorded, NOT encoded');
    // Chapter 34's classification must stand unamended: the 3rd, 6th and 11th lords are
    // still in the adverse group. If a later part quietly adopts the annotator's "our view
    // based on long experience" exception, this fails.
    expect([...LORDSHIP_GROUPS.evilUpachaya]).toEqual([3, 6, 11]);
  });

  it('is honest in its yield about what the part actually was', () => {
    expect(CH47_48_YIELD.note).toContain('DURING A PERIOD');
    expect(CH49_50_YIELD.note).toContain('WITHIN-PERIOD split');
  });
});
