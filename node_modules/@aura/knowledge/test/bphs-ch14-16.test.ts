// BPHS Programme Part 21 — Chapters 14, 15 and 16: the 3rd, 4th and 5th houses.
//
// Same rhythm as Part 20. The distinctive thing to check here is the POLICY: chapter 16 is
// the first where most of the source does not survive the standing constraints, and the
// tests assert that the omissions are recorded rather than silent.

import { describe, it, expect } from 'vitest';
import {
  grahaInKendraOrTrikona,
  thirdHouseRules, fourthHouseRules, fifthHouseRules,
  JUDGE_BY_STRENGTH_FIRST, CHILD_TIMING_INDICATIONS, CHILD_TIMING_NOTE,
  CH14_16_YIELD, CH14_16_EXCLUDED, CH14_16_UNSURFACED,
  CH14_16_NOT_YET_EXPRESSIBLE, PHASE_III_YIELD_VARIES,
  arity, fired, arbitrate, evaluate,
  KENDRAS, TRIKONAS,
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

const all = () => [...thirdHouseRules(), ...fourthHouseRules(), ...fifthHouseRules()];

// ── The new helper ───────────────────────────────────────────────────────────
describe('BPHS 14-16 — placement in an angle or trine', () => {
  it('covers all six sustaining houses', () => {
    expect(grahaInKendraOrTrikona('mars').of).toHaveLength(KENDRAS.length + TRIKONAS.length);
  });

  it('is true for a planet in an angle and false in a dusthana', () => {
    expect(evaluate(grahaInKendraOrTrikona('mars'), chart({ mars: { sign: 9, house: 10 } }))).toBe(true);
    expect(evaluate(grahaInKendraOrTrikona('mars'), chart({ mars: { sign: 7, house: 8 } }))).toBe(false);
  });

  it('is distinct from the lordship form Part 20 added', () => {
    // A planet can be angular while the house it rules is not, and vice versa.
    const f = chart({ mars: { sign: 9, house: 10 } });
    expect(evaluate(grahaInKendraOrTrikona('mars'), f)).toBe(true);
  });
});

// ── Chapter 14 ───────────────────────────────────────────────────────────────
describe('BPHS 14 — the third house', () => {
  it('fires when Mars and the 3rd lord are both in the 3rd', () => {
    // Aries lagna → 3rd is Gemini, ruled by Mercury. Put both there.
    const f = chart({ mercury: { sign: 2, house: 3 }, mars: { sign: 2, house: 3 } });
    expect(fired(thirdHouseRules(), f).map((h) => h.rule.id))
      .toContain('bphs.14.002.lord-with-mars-on-third');
  });

  it('treats lord-and-indicator together as the chapter’s strongest positive', () => {
    // One call to the factory, not two: identity comparison across two calls always
    // succeeds, so the rule ends up compared against a fresh copy of itself.
    const rules = thirdHouseRules();
    const r = rules.find((x) => x.id === 'bphs.14.002.lord-with-mars-on-third')!;
    expect(arity(r)).toBe(2);
    const others = rules.filter((x) => x.effect.id === 'siblings.support' && x.id !== r.id);
    expect(others.length).toBeGreaterThan(0);
    for (const o of others) expect(r.effect.valence).toBeGreaterThan(o.effect.valence);
  });

  it('encodes 14.6’s positive half and leaves 14.5’s negative half unsurfaced', () => {
    expect(fired(thirdHouseRules(), chart({ mars: { sign: 9, house: 10 } })).map((h) => h.rule.id))
      .toContain('bphs.14.006.mars-or-lord-angular');
    expect(CH14_16_UNSURFACED.join(' ')).toContain('14.3, 14.5, 14.14');
  });

  it('records 14.15 as a fifth citation for the arbitration ordering, not new machinery', () => {
    expect(JUDGE_BY_STRENGTH_FIRST).toContain('fifth');
    expect(JUDGE_BY_STRENGTH_FIRST).toContain('Part 19');
  });
});

// ── Chapter 15 ───────────────────────────────────────────────────────────────
describe('BPHS 15 — the fourth house', () => {
  it('fires the settled-home rule when the 4th lord and a benefic are both in the 4th', () => {
    // Aries lagna → 4th is Cancer, ruled by the Moon.
    const f = chart({ moon: { sign: 3, house: 4 }, jupiter: { sign: 3, house: 4 } });
    expect(fired(fourthHouseRules(), f).map((h) => h.rule.id))
      .toContain('bphs.15.002.lord-in-own-fourth');
  });

  it('reads 15.3 as the FOURTH lord, and says why in the note', () => {
    const r = fourthHouseRules().find((x) => x.id === 'bphs.15.003.lord-dignified')!;
    expect(r.note).toContain('TEXTUAL');
    expect(r.note).toContain('FIFTH');
    expect(r.effect.domain).toBe('home');
  });

  it('is honest that 15.4 encodes a weaker form than the verse states', () => {
    const r = fourthHouseRules().find((x) => x.id === 'bphs.15.004.fourth-and-tenth-lords-angular')!;
    expect(arity(r)).toBe(2);
    expect(r.note).toContain('not expressible yet');
  });

  it('makes the mother rule three conditions, so the arity stage can promote it', () => {
    const r = fourthHouseRules().find((x) => x.id === 'bphs.15.007.mother-supported')!;
    expect(arity(r)).toBe(3);
  });

  it('ranks the three-condition mother rule above the one-condition asset rule', () => {
    const f = chart({
      moon: { sign: 3, house: 4 },
      venus: { sign: 6, house: 7 },
      mercury: { sign: 5, house: 6 },
    });
    // Give the Moon a dignity so the asset rule fires too, and Mercury exaltation.
    const facts = {
      ...f,
      planets: {
        ...(f.planets as object),
        moon: { sign: 3, house: 4, dignity: 'own' },
        mercury: { sign: 5, house: 6, dignity: 'exalted' },
      },
    } as unknown as ChartFacts;
    const res = arbitrate(fourthHouseRules(), facts);
    const ids = res.findings.map((x) => x.hit.rule.id);
    expect(ids).toContain('bphs.15.007.mother-supported');
    expect(ids).toContain('bphs.15.003.lord-dignified');
    expect(ids.indexOf('bphs.15.007.mother-supported'))
      .toBeLessThan(ids.indexOf('bphs.15.003.lord-dignified'));
  });

  it('does not surface the mother’s longevity, which is the same configuration', () => {
    expect(CH14_16_UNSURFACED.join(' ')).toContain('15.6');
    for (const r of fourthHouseRules()) {
      expect(r.effect.summary, r.id).not.toMatch(/\b(long-lived|longevity|lifespan)\b/i);
    }
  });
});

// ── Chapter 16 ───────────────────────────────────────────────────────────────
describe('BPHS 16 — the fifth house, and what it costs to be honest', () => {
  it('yields four rules from thirty-two verses, and records that it is deliberate', () => {
    expect(fifthHouseRules()).toHaveLength(4);
    expect(CH14_16_YIELD.ch16.verses).toBe(32);
    expect(CH14_16_YIELD.ch16.rules).toBe(4);
    expect(CH14_16_YIELD.ch16.note).toContain('not a partial pass');
  });

  it('lets the supportive and the difficult rules contradict each other', () => {
    const wellbeing = fifthHouseRules().filter((r) => r.effect.id === 'children.wellbeing');
    expect(wellbeing.length).toBeGreaterThanOrEqual(3);
    expect(wellbeing.some((r) => r.effect.valence > 0)).toBe(true);
    expect(wellbeing.some((r) => r.effect.valence < 0)).toBe(true);
  });

  it('restates 16.8 as effort rather than as a fertility claim', () => {
    const r = fifthHouseRules().find((x) => x.id === 'bphs.16.008.lord-in-dusthana')!;
    expect(r.effect.summary).toMatch(/patience|effort/i);
    expect(r.note).toContain('does not make claims about fertility');
  });

  it('records 16.16’s explicit exception to the dusthana-ownership rule', () => {
    const r = fifthHouseRules().find((x) => x.id === 'bphs.16.016.lord-related-to-jupiter')!;
    expect(r.note).toContain('EVEN IF');
    expect(r.note).toContain('6th, 8th or 12th');
  });

  it('carries the constructive timing verses and not the loss ones', () => {
    expect(CHILD_TIMING_INDICATIONS).toHaveLength(3);
    const verses = CHILD_TIMING_INDICATIONS.map((c) => c.verse);
    expect(verses).toEqual(['18', '19', '20']);
    for (const v of ['21', '22', '23']) expect(verses).not.toContain(v);
    expect(CHILD_TIMING_NOTE).toContain('not surfaced');
  });

  it('every named age is a plausible adult age', () => {
    for (const c of CHILD_TIMING_INDICATIONS) {
      for (const a of c.ages) {
        expect(a).toBeGreaterThan(20);
        expect(a).toBeLessThan(60);
      }
    }
  });
});

// ── Policy across all three ──────────────────────────────────────────────────
describe('BPHS Part 21 — the policy is recorded, not silent', () => {
  it('excludes five things outright, each with a reason', () => {
    expect(CH14_16_EXCLUDED).toHaveLength(5);
    const joined = CH14_16_EXCLUDED.join(' ');
    expect(joined).toContain('disability claim');
    expect(joined).toContain('slur');
  });

  it('separates excluded-outright from computed-but-unsurfaced', () => {
    // 16.4 is excluded rather than merely unsurfaced, and says why.
    expect(CH14_16_EXCLUDED.join(' ')).toContain('no arbitration use');
    expect(CH14_16_UNSURFACED.length).toBeGreaterThanOrEqual(8);
  });

  it('records the yield per chapter so an omission can be told from a miss', () => {
    expect(CH14_16_YIELD.ch14.verses).toBe(15);
    expect(CH14_16_YIELD.ch15.verses).toBe(9);
    expect(PHASE_III_YIELD_VARIES).toContain('4 from 32');
  });

  it('names the predicate gap that would unlock much of Phase III', () => {
    expect(CH14_16_NOT_YET_EXPRESSIBLE[0]).toContain('lordshipConjunct');
  });

  it('no rule surfaces mortal, medical or judgemental language', () => {
    for (const r of all()) {
      expect(r.effect.summary, r.id)
        .not.toMatch(/\b(death|dies?|dying|barren|infertil|dumb|disease[ds]?|illness|bastard)\b/i);
    }
  });

  it('every rule keeps the Part 20 rhythm', () => {
    for (const r of all()) {
      expect(r.source.text, r.id).toBe('bphs');
      expect([14, 15, 16], r.id).toContain(r.source.chapter);
      expect(r.id, r.id).toMatch(/^bphs\.\d{2}\.\d{3}\./);
      expect(r.verification, r.id).toBe('unverified');
      expect(arity(r), r.id).toBeGreaterThanOrEqual(1);
      expect(r.weight, r.id).toBeGreaterThan(0);
      expect(r.weight, r.id).toBeLessThanOrEqual(1);
    }
  });

  it('adds eleven rules across the three chapters', () => {
    expect(all()).toHaveLength(11);
  });
});
