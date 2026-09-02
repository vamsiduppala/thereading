// BPHS Programme Part 22 — Chapters 17 and 18: the 6th and 7th houses.
//
// Two things get the most attention here: the new `lordsConjunct` predicate, and the
// marriage-age policy, which is the first place the programme has had to gate source
// material on grounds that are not astrological.

import { describe, it, expect } from 'vitest';
import {
  sixthHouseRules, seventhHouseRules, lordConjunctionRules,
  MARRIAGE_TIMING, SURFACEABLE_MARRIAGE_AGE, surfaceableAges, surfaceableTimings,
  MARRIAGE_AGE_POLICY, CH17_18_YIELD, CH17_18_EXCLUDED, CH17_18_UNSURFACED,
  CH17_18_NOT_YET_EXPRESSIBLE, LORDS_CONJUNCT_CLOSED_A_GAP,
  evaluate, arity, fired, arbitrate,
  type ChartFacts,
} from '../src/index.js';

const chart = (over: Record<string, { sign: number; house: number; dignity?: string }> = {}): ChartFacts => ({
  lagnaSign: 0,
  planets: {
    sun: { sign: 0, house: 1 }, moon: { sign: 3, house: 4 }, mars: { sign: 2, house: 3 },
    mercury: { sign: 3, house: 4 }, jupiter: { sign: 4, house: 5 }, venus: { sign: 5, house: 6 },
    saturn: { sign: 6, house: 7 }, rahu: { sign: 7, house: 8 }, ketu: { sign: 1, house: 2 },
    ...over,
  },
} as unknown as ChartFacts);

// ── The new predicate ────────────────────────────────────────────────────────
describe('BPHS Part 22 — `lordsConjunct`, the gap Part 21 named', () => {
  // Aries lagna: 4th = Cancer (Moon), 10th = Capricorn (Saturn).
  it('fires when the two lords share a sign', () => {
    const f = chart({ moon: { sign: 6, house: 7 }, saturn: { sign: 6, house: 7 } });
    expect(evaluate({ k: 'lordsConjunct', parties: [4, 10] }, f)).toBe(true);
  });

  it('does not fire when they are in different signs', () => {
    const f = chart({ moon: { sign: 6, house: 7 }, saturn: { sign: 7, house: 8 } });
    expect(evaluate({ k: 'lordsConjunct', parties: [4, 10] }, f)).toBe(false);
  });

  it('honours `inHouses` — the verses almost always say WHERE they must meet', () => {
    const inAngle = chart({ moon: { sign: 6, house: 7 }, saturn: { sign: 6, house: 7 } });
    const inDusthana = chart({ moon: { sign: 7, house: 8 }, saturn: { sign: 7, house: 8 } });
    expect(evaluate({ k: 'lordsConjunct', parties: [4, 10], inHouses: [1, 4, 7, 10] }, inAngle)).toBe(true);
    expect(evaluate({ k: 'lordsConjunct', parties: [4, 10], inHouses: [1, 4, 7, 10] }, inDusthana)).toBe(false);
  });

  it('REFUSES to fire when one planet rules both houses', () => {
    // Sagittarius lagna: the 4th is Pisces and the 12th is Scorpio... use a clearer case.
    // Taurus lagna: 6th = Libra (Venus), 12th = Aries (Mars) — distinct. But for Aries
    // lagna the 9th is Sagittarius and the 12th is Pisces, both Jupiter's. One planet
    // cannot be "conjunct itself", and treating it as such would fire on a technicality.
    const f = chart({ jupiter: { sign: 4, house: 5 } });
    expect(evaluate({ k: 'lordsConjunct', parties: [9, 12] }, f)).toBe(false);
  });

  it('is false rather than throwing when a lord is missing from the facts', () => {
    const f = { lagnaSign: 0, planets: { moon: { sign: 6, house: 7 } } } as unknown as ChartFacts;
    expect(evaluate({ k: 'lordsConjunct', parties: [4, 10] }, f)).toBe(false);
  });

  it('restores BPHS 15.4 and 13.4 to the form the verses state', () => {
    const rules = lordConjunctionRules();
    expect(rules).toHaveLength(2);
    for (const r of rules) {
      expect(r.when[0]!.k, r.id).toBe('lordsConjunct');
      expect(arity(r), r.id).toBe(1);
    }
    expect(LORDS_CONJUNCT_CLOSED_A_GAP).toContain('one planet rather than two meeting');
  });

  it('the joined form outranks Part 21’s weakened form when both fire', () => {
    // Part 21's rule needed both lords merely angular; this one needs them together.
    const f = chart({ moon: { sign: 6, house: 7 }, saturn: { sign: 6, house: 7 } });
    const res = arbitrate(lordConjunctionRules(), f);
    expect(res.findings.map((x) => x.hit.rule.id)).toContain('bphs.15.004.lords-actually-joined');
  });
});

// ── Chapter 17 ───────────────────────────────────────────────────────────────
describe('BPHS 17 — the sixth house, and what is left of it', () => {
  it('yields two rules from twenty-eight verses, deliberately', () => {
    expect(sixthHouseRules()).toHaveLength(2);
    expect(CH17_18_YIELD.ch17.verses).toBe(28);
    expect(CH17_18_YIELD.ch17.rules).toBe(2);
    expect(CH17_18_YIELD.ch17.note).toContain('lowest-yielding');
  });

  it('is explicit that 17.2 is read against its own stated outcome', () => {
    const r = sixthHouseRules().find((x) => x.id === 'bphs.17.002.lord-contained')!;
    expect(r.note).toContain('OUR reading');
    expect(r.effect.valence).toBeGreaterThan(0);   // the inverse, not the verse's outcome
  });

  it('makes the 6th/11th exchange argue against the wealth rules', () => {
    const r = sixthHouseRules().find((x) => x.id === 'bphs.17.026.sixth-eleventh-exchange')!;
    expect(r.effect.id).toBe('wealth.accumulation');
    expect(r.effect.valence).toBeLessThan(0);
    expect(arity(r)).toBe(2);
  });

  it('encodes the exchange and not the 31st year', () => {
    expect(CH17_18_UNSURFACED.join(' ')).toContain('31st year');
    for (const r of sixthHouseRules()) {
      expect(r.effect.summary, r.id).not.toMatch(/\b(31st|year)\b/i);
    }
  });
});

// ── Chapter 18 ───────────────────────────────────────────────────────────────
describe('BPHS 18 — the seventh house', () => {
  it('fires the strain rule when the 7th lord sits in a dusthana', () => {
    // Aries lagna → 7th is Libra, ruled by Venus. Venus already in the 6th.
    expect(fired(seventhHouseRules(), chart()).map((h) => h.rule.id))
      .toContain('bphs.18.002.lord-in-dusthana');
  });

  it('lets the verse’s OWN exception cancel it', () => {
    // 18.2 says the rule does not apply to own-house or exaltation placement.
    const f = chart({ venus: { sign: 5, house: 6, dignity: 'exalted' } });
    expect(fired(seventhHouseRules(), f).map((h) => h.rule.id))
      .not.toContain('bphs.18.002.lord-in-dusthana');
  });

  it('models that exception as `unless`, not as prose', () => {
    const r = seventhHouseRules().find((x) => x.id === 'bphs.18.002.lord-in-dusthana')!;
    expect(r.unless).toHaveLength(1);
    expect(r.note).toContain('own antidote');
  });

  it('makes no medical claim about the spouse', () => {
    const r = seventhHouseRules().find((x) => x.id === 'bphs.18.002.lord-in-dusthana')!;
    expect(r.effect.summary).not.toMatch(/\b(sick|sickly|ill|disease[ds]?)\b/i);
    expect(r.note).toContain('is not made');
  });

  it('has the supportive and the straining rules contradict each other', () => {
    const w = seventhHouseRules().filter((r) => r.effect.id === 'partnership.wellbeing');
    expect(w.length).toBeGreaterThanOrEqual(3);
    expect(w.some((r) => r.effect.valence > 0)).toBe(true);
    expect(w.some((r) => r.effect.valence < 0)).toBe(true);
  });

  it('is honest that 18.18 encodes two of its three conditions, and why', () => {
    const r = seventhHouseRules().find((x) => x.id === 'bphs.18.018.conjugal-strain')!;
    expect(arity(r)).toBe(2);
    expect(r.note).toContain('untestable rather than more precise');
  });
});

// ── The marriage-age policy ──────────────────────────────────────────────────
describe('BPHS 18.22-34 — marriage timing, and the line we drew', () => {
  it('carries all twelve age-bearing timing verses', () => {
    expect(MARRIAGE_TIMING).toHaveLength(12);
    for (const t of MARRIAGE_TIMING) {
      expect(t.verse, t.verse).toBeTruthy();
      expect(t.ages.length, t.verse).toBeGreaterThan(0);
      expect(t.when, t.verse).toBeTruthy();
    }
  });

  it('gates ages below eighteen rather than deleting the verses', () => {
    expect(SURFACEABLE_MARRIAGE_AGE).toBe(18);
    const belowExists = MARRIAGE_TIMING.some((t) => t.ages.some((a) => a < 18));
    expect(belowExists).toBe(true);        // the source really does say this
    for (const t of MARRIAGE_TIMING) {
      for (const a of surfaceableAges(t)) expect(a).toBeGreaterThanOrEqual(18);
    }
  });

  it('drops a verse from the surfaceable set only when ALL its ages are gated', () => {
    // 18.25 gives only age 11 — nothing to show. 18.26 gives 12 and 19 — 19 survives.
    const v25 = MARRIAGE_TIMING.find((t) => t.verse === '25')!;
    const v26 = MARRIAGE_TIMING.find((t) => t.verse === '26')!;
    expect(surfaceableAges(v25)).toEqual([]);
    expect(surfaceableAges(v26)).toEqual([19]);
    expect(surfaceableTimings().map((t) => t.verse)).not.toContain('25');
    expect(surfaceableTimings().map((t) => t.verse)).toContain('26');
  });

  it('keeps more than half the verses usable', () => {
    expect(surfaceableTimings().length).toBeGreaterThan(MARRIAGE_TIMING.length / 2);
  });

  it('says plainly that the gate is ours and is policy, not astrology', () => {
    expect(MARRIAGE_AGE_POLICY).toContain('era’s practice');
    expect(MARRIAGE_AGE_POLICY).toContain('policy rather than astrology');
  });

  it('never surfaces the spouse-death timing verses at any age', () => {
    const verses = MARRIAGE_TIMING.map((t) => t.verse);
    for (const v of ['35', '36', '37', '38', '39', '42']) expect(verses).not.toContain(v);
    expect(CH17_18_UNSURFACED.join(' ')).toContain('spouse’s death');
  });
});

// ── Policy across both ───────────────────────────────────────────────────────
describe('BPHS Part 22 — the policy is recorded', () => {
  const all = [...sixthHouseRules(), ...seventhHouseRules(), ...lordConjunctionRules()];

  it('excludes the body descriptions and the character judgements outright', () => {
    const joined = CH17_18_EXCLUDED.join(' ');
    expect(joined).toContain('Physiognomy applied to a third party');
    expect(joined).toContain('questionable character');
    expect(CH17_18_EXCLUDED.length).toBeGreaterThanOrEqual(7);
  });

  it('records the yield for both chapters', () => {
    expect(CH17_18_YIELD.ch18.verses).toBe(42);
    expect(CH17_18_YIELD.ch18.note).toContain('interleaved verse by verse');
  });

  it('notes that varga predicates have now been wanted three parts running', () => {
    expect(CH17_18_NOT_YET_EXPRESSIBLE.join(' ')).toContain('Third part in a row');
  });

  it('no rule surfaces mortal, medical, sexual or judgemental language', () => {
    for (const r of all) {
      expect(r.effect.summary, r.id)
        .not.toMatch(/\b(death|dies?|dying|sick|sickly|disease[ds]?|leprosy|ulcer|libidinous|barren)\b/i);
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

  it('adds nine rules across the two chapters plus the retrofit', () => {
    expect(all).toHaveLength(9);
  });
});
