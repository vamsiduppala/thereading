// BPHS Programme Part 20 — Chapters 12 and 13, the 1st and 2nd houses.
// The start of Phase III. These tests check the RHYTHM as much as the rules, because
// thirteen more parts will follow this shape.

import { describe, it, expect } from 'vitest';
import {
  KENDRAS, TRIKONAS, DUSTHANAS,
  lordInKendraOrTrikona, lordInDusthana, beneficInKendraOrTrikona,
  firstHouseRules, secondHouseRules, readFrom,
  READ_FROM_THE_MOON_TOO, PHASE_III_RHYTHM,
  CH12_13_EXCLUDED, CH12_13_UNSURFACED, CH12_13_NOT_YET_EXPRESSIBLE,
  evaluate, arity, fired, arbitrate,
  LAGNA_REFERENCE_USE,
  type ChartFacts,
} from '../src/index.js';

const chart = (over: Record<string, { sign: number; house: number }> = {}): ChartFacts => ({
  lagnaSign: 0,
  planets: {
    sun: { sign: 0, house: 1 }, moon: { sign: 3, house: 4 }, mars: { sign: 2, house: 3 },
    mercury: { sign: 3, house: 4 }, jupiter: { sign: 4, house: 5 }, venus: { sign: 5, house: 6 },
    saturn: { sign: 6, house: 7 }, rahu: { sign: 7, house: 8 }, ketu: { sign: 1, house: 2 },
    ...over,
  },
} as unknown as ChartFacts);

// ── The house-group helpers ──────────────────────────────────────────────────
describe('BPHS 12-13 — the house groups', () => {
  it('names the angles, trines and dusthanas', () => {
    expect(KENDRAS).toEqual([1, 4, 7, 10]);
    expect(TRIKONAS).toEqual([5, 9]);
    expect(DUSTHANAS).toEqual([6, 8, 12]);
  });

  it('keeps the groups disjoint — the 1st is an angle, never a trine', () => {
    for (const h of KENDRAS) expect(TRIKONAS).not.toContain(h);
    for (const h of DUSTHANAS) expect(KENDRAS).not.toContain(h);
    for (const h of DUSTHANAS) expect(TRIKONAS).not.toContain(h);
  });

  it('builds an or-compound over every sustaining house', () => {
    const p = lordInKendraOrTrikona(1);
    expect(p.k).toBe('compound');
    expect((p as { of: unknown[] }).of).toHaveLength(6);
  });

  it('builds an or-compound over the three dusthanas', () => {
    expect((lordInDusthana(2) as { of: unknown[] }).of).toHaveLength(3);
  });
});

// ── Chapter 12 ───────────────────────────────────────────────────────────────
describe('BPHS 12 — the first house', () => {
  it('fires the supportive rule when the lagna lord sits in an angle', () => {
    // Aries lagna → Mars is the lord. Put Mars in the 10th.
    const f = chart({ mars: { sign: 9, house: 10 } });
    const hits = fired(firstHouseRules(), f).map((h) => h.rule.id);
    expect(hits).toContain('bphs.12.002.lord-in-kendra-trikona');
  });

  it('fires the undermining rule when the lagna lord sits in a dusthana', () => {
    // Mars into the 8th, and Jupiter out of an angle/trine so the antidote does not apply.
    const f = chart({ mars: { sign: 7, house: 8 }, jupiter: { sign: 1, house: 2 } });
    const hits = fired(firstHouseRules(), f).map((h) => h.rule.id);
    expect(hits).toContain('bphs.12.001.lord-in-dusthana');
  });

  it('12.2’s benefic in an angle CANCELS the affliction, as the verse says', () => {
    const afflicted = chart({ mars: { sign: 7, house: 8 }, jupiter: { sign: 1, house: 2 } });
    const relieved = chart({ mars: { sign: 7, house: 8 }, jupiter: { sign: 3, house: 4 } });
    expect(fired(firstHouseRules(), afflicted).map((h) => h.rule.id))
      .toContain('bphs.12.001.lord-in-dusthana');
    expect(fired(firstHouseRules(), relieved).map((h) => h.rule.id))
      .not.toContain('bphs.12.001.lord-in-dusthana');
  });

  it('models the relief as `unless`, not as a condition', () => {
    const r = firstHouseRules().find((x) => x.id === 'bphs.12.001.lord-in-dusthana')!;
    expect(r.unless).toBeDefined();
    expect(r.unless).toHaveLength(1);
    expect(arity(r)).toBe(1);       // the antidote does not inflate specificity
  });

  it('the benefic-in-angle predicate covers angles and trines and nothing else', () => {
    expect(evaluate(beneficInKendraOrTrikona, chart({ jupiter: { sign: 3, house: 4 } }))).toBe(true);
    expect(evaluate(beneficInKendraOrTrikona, chart({ jupiter: { sign: 4, house: 5 } }))).toBe(true);
    expect(evaluate(beneficInKendraOrTrikona, chart({ jupiter: { sign: 1, house: 2 } }))).toBe(false);
    expect(evaluate(beneficInKendraOrTrikona, chart({ jupiter: { sign: 7, house: 8 } }))).toBe(false);
  });

  it('makes the two wellbeing rules compete rather than both assert', () => {
    // They share an effect.id, so a chart firing both reports dissent — 74.11-13.
    const ids = firstHouseRules()
      .filter((r) => r.effect.id === 'body.wellbeing')
      .map((r) => r.effect.valence);
    expect(ids).toHaveLength(2);
    expect(Math.sign(ids[0]!)).not.toBe(Math.sign(ids[1]!));
  });
});

// ── Chapter 13 ───────────────────────────────────────────────────────────────
describe('BPHS 13 — the second house', () => {
  it('recognises the 2nd/11th exchange as a two-condition rule', () => {
    const r = secondHouseRules().find((x) => x.id === 'bphs.13.004.second-eleventh-exchange')!;
    expect(arity(r)).toBe(2);
    expect(r.effect.valence).toBeGreaterThan(0.7);
  });

  it('ranks the exchange above the single-condition wealth rules', () => {
    // Aries lagna: 2nd = Taurus (Venus), 11th = Aquarius (Saturn).
    // Venus into the 11th and Saturn into the 2nd completes the exchange.
    const f = chart({
      venus: { sign: 10, house: 11 },
      saturn: { sign: 1, house: 2 },
      jupiter: { sign: 1, house: 2 },
    });
    const res = arbitrate(secondHouseRules(), f);
    expect(res.findings.length).toBeGreaterThan(1);
    expect(res.findings[0]!.hit.rule.id).toBe('bphs.13.004.second-eleventh-exchange');
  });

  it('lets the poverty rule contradict the wealth rules through a shared effect id', () => {
    const wealth = secondHouseRules().filter((r) => r.effect.id === 'wealth.accumulation');
    expect(wealth.length).toBeGreaterThanOrEqual(4);
    expect(wealth.some((r) => r.effect.valence < 0)).toBe(true);
    expect(wealth.some((r) => r.effect.valence > 0)).toBe(true);
  });

  it('reports dissent when both a wealth and a poverty rule fire', () => {
    // Venus (2nd lord) into the 12th and Saturn (11th lord) into the 6th → poverty rule.
    // Jupiter into the 2nd → a wealth rule. Both fire; neither is silently dropped.
    const f = chart({
      venus: { sign: 11, house: 12 },
      saturn: { sign: 5, house: 6 },
      jupiter: { sign: 1, house: 2 },
    });
    const res = arbitrate(secondHouseRules(), f);
    const ids = res.findings.map((x) => x.hit.rule.id);
    expect(ids).toContain('bphs.13.006.both-lords-in-dusthana');
    expect(ids).toContain('bphs.13.003.jupiter-in-second');
    expect(res.findings.some((x) => x.dissent.length > 0)).toBe(true);
  });
});

// ── 12.11 — the retrofit ─────────────────────────────────────────────────────
describe('BPHS 12.11 — the effects are read from the Moon too', () => {
  it('added the Moon as a reference frame', () => {
    expect(LAGNA_REFERENCE_USE.moon).toBeTruthy();
    expect(LAGNA_REFERENCE_USE.moon).toContain('Chandra lagna');
  });

  it('retargets a rule set to the Moon without touching the natal one', () => {
    const natal = firstHouseRules();
    const lunar = readFrom(natal, 'moon');
    expect(lunar).toHaveLength(natal.length);
    for (const [i, r] of lunar.entries()) {
      expect(r.id).toBe(`${natal[i]!.id}.from-moon`);
    }
    // The originals are untouched.
    expect(natal[0]!.id).not.toContain('from-moon');
  });

  it('retargets inside compound predicates, not just top-level ones', () => {
    const lunar = readFrom(firstHouseRules(), 'moon');
    const r = lunar.find((x) => x.id.startsWith('bphs.12.001'))!;
    const compound = r.when[0] as { of: { from?: string }[] };
    for (const p of compound.of) expect(p.from).toBe('moon');
  });

  it('retargets the cancellation clauses as well as the conditions', () => {
    const lunar = readFrom(firstHouseRules(), 'moon');
    const r = lunar.find((x) => x.id.startsWith('bphs.12.001'))!;
    const un = r.unless![0] as { of: { from?: string }[] };
    for (const p of un.of) expect(p.from).toBe('moon');
  });

  it('is a no-op for the natal frame', () => {
    const natal = firstHouseRules();
    expect(readFrom(natal, 'natal')).toBe(natal);
  });

  it('actually evaluates differently in the two frames', () => {
    // Moon in the 4th from the lagna, so the Moon's own 8th is the natal 11th.
    // A planet there afflicts the lunar first house but not the natal one.
    const f = {
      ...chart({ mars: { sign: 10, house: 11 } }),
      lagnas: { natal: 0, moon: 3 },
    } as unknown as ChartFacts;
    const natalHits = fired(firstHouseRules(), f).map((h) => h.rule.id);
    const lunarHits = fired(readFrom(firstHouseRules(), 'moon'), f).map((h) => h.rule.id);
    expect(natalHits).not.toEqual(lunarHits.map((s) => s.replace('.from-moon', '')));
  });

  it('records why this is not a footnote', () => {
    expect(READ_FROM_THE_MOON_TOO).toContain('doubles the entire house corpus');
  });
});

// ── The rhythm, and the policy ───────────────────────────────────────────────
describe('BPHS Part 20 — the Phase III rhythm', () => {
  const all = [...firstHouseRules(), ...secondHouseRules()];

  it('every rule carries its chapter and verse', () => {
    for (const r of all) {
      expect(r.source.text, r.id).toBe('bphs');
      expect([12, 13], r.id).toContain(r.source.chapter);
      expect(r.source.verse, r.id).toBeTruthy();
    }
  });

  it('every rule id begins with its chapter and verse', () => {
    for (const r of all) expect(r.id, r.id).toMatch(/^bphs\.\d{2}\.\d{3}\./);
  });

  it('nothing claims verification it does not have', () => {
    for (const r of all) expect(r.verification, r.id).toBe('unverified');
  });

  it('every rule has at least one condition — an empty `when` is a data error', () => {
    for (const r of all) expect(arity(r), r.id).toBeGreaterThanOrEqual(1);
  });

  it('weights stay inside 0..1', () => {
    for (const r of all) {
      expect(r.weight, r.id).toBeGreaterThan(0);
      expect(r.weight, r.id).toBeLessThanOrEqual(1);
    }
  });

  it('no rule surfaces mortal, medical or judgemental language', () => {
    for (const r of all) {
      // Word boundaries matter here: an unanchored /die/ matches "steadier", which is how
      // this test failed on its first run. The rule was fine; the assertion was not.
      expect(r.effect.summary, r.id)
        .not.toMatch(/(death|dies?|dying|disease[ds]?|illness|deformed?|penury|destitute|untruthful|liar)/i);
    }
  });

  it('lists what was excluded and why, rather than dropping it', () => {
    expect(CH12_13_EXCLUDED).toHaveLength(3);
    expect(CH12_13_EXCLUDED.join(' ')).toContain('Physiognomy');
    expect(CH12_13_UNSURFACED.length).toBeGreaterThanOrEqual(2);
    expect(CH12_13_NOT_YET_EXPRESSIBLE.length).toBeGreaterThanOrEqual(3);
  });

  it('names the whole-chart predicate gap that Part 30 will also need', () => {
    expect(CH12_13_NOT_YET_EXPRESSIBLE.join(' ')).toContain('Nabhasa');
  });

  it('states the rhythm the next thirteen parts follow', () => {
    expect(PHASE_III_RHYTHM).toContain('effect.id');
    expect(PHASE_III_RHYTHM).toContain('allEncodedRules');
  });
});
