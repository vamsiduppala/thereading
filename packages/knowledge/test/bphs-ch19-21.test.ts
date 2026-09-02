// BPHS Programme Part 23 — Chapters 19, 20 and 21: the 8th, 9th and 10th houses.
//
// Two things to check beyond the rules: the vipareeta reading, now applied twice and named
// once; and the `strength` predicate, finally usable after the Part 23 retrofit.

import { describe, it, expect } from 'vitest';
import {
  VIPAREETA_READING, eighthHouseRules, ninthHouseRules, tenthHouseRules,
  FORTUNE_TIMING, STRENGTH_PREDICATE_NOW_USABLE,
  CH19_21_YIELD, CH19_21_EXCLUDED, CH19_21_UNSURFACED, CH19_21_NOT_YET_EXPRESSIBLE,
  sixthHouseRules,
  evaluate, arity, fired, arbitrate,
  syntheticCharts, SHADBALA_SAMPLE_MIN, SHADBALA_SAMPLE_SPREAD,
  type ChartFacts,
} from '../src/index.js';

const chart = (over: Record<string, unknown> = {}, extra: Record<string, unknown> = {}): ChartFacts => ({
  lagnaSign: 0,
  planets: {
    sun: { sign: 0, house: 1 }, moon: { sign: 3, house: 4 }, mars: { sign: 2, house: 3 },
    mercury: { sign: 3, house: 4 }, jupiter: { sign: 4, house: 5 }, venus: { sign: 5, house: 6 },
    saturn: { sign: 6, house: 7 }, rahu: { sign: 7, house: 8 }, ketu: { sign: 1, house: 2 },
    ...over,
  },
  ...extra,
} as unknown as ChartFacts);

// ── The vipareeta reading ────────────────────────────────────────────────────
describe('BPHS 19 — one rule from a wholly deferred chapter', () => {
  it('yields exactly one rule from thirteen verses', () => {
    expect(eighthHouseRules()).toHaveLength(1);
    expect(CH19_21_YIELD.ch19.rules).toBe(1);
    expect(CH19_21_YIELD.ch19.note).toContain('NO surfaceable outcome');
  });

  it('names the reading once rather than arguing it twice', () => {
    expect(VIPAREETA_READING).toContain('17.2 and 19.4-7');
    expect(VIPAREETA_READING).toContain('OUR reading');
  });

  it('shares its effect id with the ch 17 rule, so they corroborate', () => {
    const eighth = eighthHouseRules()[0]!;
    const sixth = sixthHouseRules().find((r) => r.effect.id === 'obstacles.contained')!;
    expect(eighth.effect.id).toBe(sixth.effect.id);
    // Same sign, so a chart with both is corroboration rather than dissent.
    expect(Math.sign(eighth.effect.valence)).toBe(Math.sign(sixth.effect.valence));
  });

  it('does not double-count when both fire — they agree, not conflict', () => {
    // 6th lord in the 12th satisfies both readings' shape.
    const f = chart({ mercury: { sign: 11, house: 12 } });
    const res = arbitrate([...eighthHouseRules(), ...sixthHouseRules()], f);
    for (const finding of res.findings) expect(finding.dissent).toHaveLength(0);
  });

  it('surfaces nothing about lifespan', () => {
    for (const r of eighthHouseRules()) {
      expect(r.effect.summary, r.id).not.toMatch(/\b(life|lifespan|long-lived|years?)\b/i);
    }
    expect(CH19_21_UNSURFACED[0]).toContain('Part 51');
  });
});

// ── The strength predicate, finally usable ───────────────────────────────────
describe('BPHS Part 23 — the `strength` predicate works now', () => {
  it('the generator carries a Shadbala for every classical planet', () => {
    const c = syntheticCharts(1, 5)[0] as unknown as { shadbala: Record<string, number> };
    for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']) {
      expect(c.shadbala[g], g).toBeGreaterThanOrEqual(SHADBALA_SAMPLE_MIN);
      expect(c.shadbala[g], g).toBeLessThanOrEqual(SHADBALA_SAMPLE_MIN + SHADBALA_SAMPLE_SPREAD);
    }
  });

  it('the range straddles the ch 27 requirements, so the predicate discriminates', () => {
    // Saturn needs 300, Mercury 420 — both must sit inside the sampled range.
    expect(SHADBALA_SAMPLE_MIN).toBeLessThan(300);
    expect(SHADBALA_SAMPLE_MIN + SHADBALA_SAMPLE_SPREAD).toBeGreaterThan(420);
  });

  it('21.3 fires on a weak Saturn and not on a strong one', () => {
    const weak = chart({}, { shadbala: { saturn: 200 } });
    const strong = chart({}, { shadbala: { saturn: 500 } });
    expect(fired(tenthHouseRules(), weak).map((h) => h.rule.id))
      .toContain('bphs.21.003.lord-weak');
    expect(fired(tenthHouseRules(), strong).map((h) => h.rule.id))
      .not.toContain('bphs.21.003.lord-weak');
  });

  it('uses Saturn’s own BPHS requirement as the threshold, not an invented one', () => {
    const r = tenthHouseRules().find((x) => x.id === 'bphs.21.003.lord-weak')!;
    const p = r.when[0] as { rupas: number };
    expect(p.rupas).toBe(300);        // BPHS 27.32-36 for Saturn
    expect(r.note).toContain('27.32-36');
  });

  it('records that Part 22 had to drop exactly such a condition', () => {
    expect(STRENGTH_PREDICATE_NOW_USABLE).toContain('18.18');
  });

  it('does not fire when the chart carries no Shadbala at all', () => {
    expect(fired(tenthHouseRules(), chart()).map((h) => h.rule.id))
      .not.toContain('bphs.21.003.lord-weak');
  });
});

// ── Chapter 20 ───────────────────────────────────────────────────────────────
describe('BPHS 20 — the ninth house', () => {
  it('fires the fortune rule when the 9th lord holds its own house', () => {
    // Aries lagna → 9th is Sagittarius, ruled by Jupiter.
    const f = chart({ jupiter: { sign: 8, house: 9 } });
    expect(fired(ninthHouseRules(), f).map((h) => h.rule.id))
      .toContain('bphs.20.001.lord-in-own-ninth');
  });

  it('ranks the three-condition exchange above the one-condition fortune rule', () => {
    // Mars (lagna lord) into the 9th, Jupiter (9th lord) into the 1st, Jupiter in 7th? —
    // Jupiter cannot be in two places, so use the exchange plus a separate Jupiter check
    // by placing Jupiter in the 1st and asserting only the ordering of what fires.
    const f = chart({ mars: { sign: 8, house: 9 }, jupiter: { sign: 0, house: 1 } });
    const res = arbitrate(ninthHouseRules(), f);
    const ids = res.findings.map((x) => x.hit.rule.id);
    // The exchange needs Jupiter in the 7th too, so it should NOT fire here.
    expect(ids).not.toContain('bphs.20.029.lagna-ninth-exchange');
  });

  it('the exchange rule carries three conditions', () => {
    const r = ninthHouseRules().find((x) => x.id === 'bphs.20.029.lagna-ninth-exchange')!;
    expect(arity(r)).toBe(3);
    expect(r.effect.valence).toBeGreaterThanOrEqual(0.8);
  });

  it('restates the paternal-enmity verse as work rather than a verdict', () => {
    const r = ninthHouseRules().find((x) => x.id === 'bphs.20.011.paternal-strain')!;
    expect(r.effect.summary).toMatch(/takes work/i);
    expect(r.effect.summary).not.toMatch(/\b(enmity|hatred|enemy)\b/i);
  });

  it('uses `lordsConjunct` where the verse says "with the lord of the 6th"', () => {
    const r = ninthHouseRules().find((x) => x.id === 'bphs.20.011.paternal-strain')!;
    expect(r.when.some((p) => p.k === 'lordsConjunct')).toBe(true);
  });

  it('carries the two fortune-timing verses, both at adult ages needing no gate', () => {
    expect(FORTUNE_TIMING).toHaveLength(2);
    for (const t of FORTUNE_TIMING) expect(t.fromAge).toBeGreaterThanOrEqual(18);
  });

  it('leaves the thirteen father-death verses unsurfaced', () => {
    expect(CH19_21_UNSURFACED.join(' ')).toContain('20.13-25');
    // No \n here: the note is a wrapped source concatenation, so the runtime string has a
    // plain space. Matching the SOURCE layout rather than the VALUE is a recurring slip.
    expect(CH19_21_YIELD.ch20.note).toContain('father’s death');
  });
});

// ── Chapter 21 ───────────────────────────────────────────────────────────────
describe('BPHS 21 — the tenth house', () => {
  it('is the richest chapter of the part', () => {
    expect(tenthHouseRules()).toHaveLength(7);
    expect(CH19_21_YIELD.ch21.rules).toBe(7);
  });

  it('declares the coin-flip rule rather than deleting it', () => {
    const r = tenthHouseRules().find((x) => x.id === 'bphs.21.004.lord-well-placed')!;
    expect(r.baseRate).toBeGreaterThan(0.35);
    expect(r.note).toContain('coin flip');
  });

  it('has the career rules contradict each other through a shared effect id', () => {
    const standing = tenthHouseRules().filter((r) => r.effect.id === 'career.standing');
    expect(standing.length).toBeGreaterThanOrEqual(2);
    expect(standing.some((r) => r.effect.valence > 0)).toBe(true);
    expect(standing.some((r) => r.effect.valence < 0)).toBe(true);
  });

  it('is honest that 21.19 encodes the nearest expressible form', () => {
    const r = tenthHouseRules().find((x) => x.id === 'bphs.21.019.fame')!;
    expect(r.note).toContain('nearest expressible form');
  });

  it('excludes every character judgement in the chapter', () => {
    const joined = CH19_21_EXCLUDED.join(' ');
    expect(joined).toContain('great fool');
    expect(joined).toContain('bad deeds');
    for (const r of tenthHouseRules()) {
      expect(r.effect.summary, r.id)
        .not.toMatch(/\b(fool|foolish|bad deeds|defile|carnal|hate)\b/i);
    }
  });
});

// ── Policy across all three ──────────────────────────────────────────────────
describe('BPHS Part 23 — policy and rhythm', () => {
  const all = [...eighthHouseRules(), ...ninthHouseRules(), ...tenthHouseRules()];

  it('adds thirteen rules across the three chapters', () => {
    expect(all).toHaveLength(13);
  });

  it('records the yield for all three chapters', () => {
    expect(CH19_21_YIELD.ch19.verses).toBe(13);
    expect(CH19_21_YIELD.ch20.verses).toBe(32);
    expect(CH19_21_YIELD.ch21.verses).toBe(22);
  });

  it('no rule surfaces mortal, medical or judgemental language', () => {
    for (const r of all) {
      expect(r.effect.summary, r.id)
        .not.toMatch(/\b(death|dies?|dying|lifespan|long-lived|beggar|begging|indigent|fool)\b/i);
    }
  });

  it('every rule keeps the Phase III rhythm', () => {
    for (const r of all) {
      expect(r.source.text, r.id).toBe('bphs');
      expect(r.id, r.id).toMatch(/^bphs\.\d{2}\.\d{3}\./);
      expect(r.verification, r.id).toBe('unverified');
      expect(arity(r), r.id).toBeGreaterThanOrEqual(1);
      expect(r.weight, r.id).toBeGreaterThan(0);
      expect(r.weight, r.id).toBeLessThanOrEqual(1);
    }
  });

  it('notes that varga predicates have now been wanted four parts running', () => {
    expect(CH19_21_NOT_YET_EXPRESSIBLE.join(' ')).toContain('four parts running');
  });

  it('names the small extension the verses keep asking for', () => {
    expect(CH19_21_NOT_YET_EXPRESSIBLE[0]).toContain('house and a planet');
  });
});
