// BPHS Programme Part 17 — Chapter 70: Effects of the Ashtakavarga.
//
// The first rules in the corpus whose conditions are thresholds on a QUANTITY. Most of
// what matters here is the shape, so the tests assert the shape as much as the numbers.

import { describe, it, expect } from 'vitest';
import {
  AV_MATTERS, AV_MATTER_HOUSE, MARS_HOUSE_UNSTATED,
  NAKSHATRA_COUNT, RASI_COUNT, avTrigger, TRIGGER_PLANET, TRIGGER_FORMULA_NOTE,
  TRANSIT_MIDPOINT, transitVerdict, TRANSIT_THRESHOLD_IS_OURS, ELECTION_RULE,
  childrenIndication, CHILDREN_SECOND_METHOD,
  ashtakavargaEffectRules, CH70_UNSURFACED, CH70_NOT_ENCODED,
  PREDICATE_EXTENSION_NOTE,
  evaluate, arity, CLASSICAL_SEVEN,
  type ChartFacts, type Graha,
} from '../src/index.js';

// ── 70.1-6 ───────────────────────────────────────────────────────────────────
describe('BPHS 70.1-6 — what each ashtakavarga is consulted for', () => {
  it('gives every classical planet a set of matters', () => {
    for (const g of CLASSICAL_SEVEN) {
      expect(AV_MATTERS[g], g).toBeDefined();
      expect(AV_MATTERS[g]!.length, g).toBeGreaterThan(0);
    }
  });

  it('gives the ascendant its own, since Part 15 gave it a table', () => {
    expect(AV_MATTERS.asc.length).toBeGreaterThan(0);
  });

  it('leaves the nodes empty — the ashtakavarga does not reckon them', () => {
    expect(AV_MATTERS.rahu).toEqual([]);
    expect(AV_MATTERS.ketu).toEqual([]);
  });

  it('reads each matter from the house the chapter names, counted from that planet', () => {
    expect(AV_MATTER_HOUSE.sun).toBe(9);        // father
    expect(AV_MATTER_HOUSE.moon).toBe(4);       // mother, home
    expect(AV_MATTER_HOUSE.mercury).toBe(4);    // family, friends
    expect(AV_MATTER_HOUSE.jupiter).toBe(5);    // children, learning
    expect(AV_MATTER_HOUSE.venus).toBe(7);      // marriage, acquisition
    expect(AV_MATTER_HOUSE.saturn).toBe(8);     // longevity — unsurfaced
  });

  it('leaves Mars null rather than guessing the 3rd', () => {
    expect(AV_MATTER_HOUSE.mars).toBeNull();
    expect(MARS_HOUSE_UNSTATED).toContain('NOT assumed');
  });
});

// ── The trigger formula ──────────────────────────────────────────────────────
describe('BPHS 70.7-9 — turning a bindu count into a date', () => {
  it('reduces the product mod 27 and mod 12', () => {
    const t = avTrigger(4, 148);          // 592
    expect(t.product).toBe(592);
    expect(t.nakshatra).toBe((592 - 1) % 27);
    expect(t.rasi).toBe((592 - 1) % 12);
  });

  it('treats an exact multiple as the LAST item, not the first', () => {
    // A remainder of 0 means the 27th nakshatra and the 12th sign, not the 1st.
    const t = avTrigger(27, 1);           // product 27
    expect(t.nakshatra).toBe(26);
    const u = avTrigger(12, 1);           // product 12
    expect(u.rasi).toBe(11);
  });

  it('always lands inside the two cycles', () => {
    for (let r = 0; r <= 8; r++) {
      for (const yp of [1, 37, 100, 148, 337, 512]) {
        const t = avTrigger(r, yp);
        expect(t.nakshatra).toBeGreaterThanOrEqual(0);
        expect(t.nakshatra).toBeLessThan(NAKSHATRA_COUNT);
        expect(t.rasi).toBeGreaterThanOrEqual(0);
        expect(t.rasi).toBeLessThan(RASI_COUNT);
      }
    }
  });

  it('gives two trinal nakshatras and two trinal signs, all distinct from the point', () => {
    const t = avTrigger(5, 148);
    expect(t.trikonaNakshatras).toHaveLength(2);
    expect(t.trikonaRasis).toHaveLength(2);
    expect(t.trikonaNakshatras).not.toContain(t.nakshatra);
    expect(t.trikonaRasis).not.toContain(t.rasi);
  });

  it('the trinal nakshatras are the 5th and 9th, evenly spaced round 27', () => {
    const t = avTrigger(3, 100);
    const gaps = [
      (t.trikonaNakshatras[0]! - t.nakshatra + 27) % 27,
      (t.trikonaNakshatras[1]! - t.trikonaNakshatras[0]! + 27) % 27,
    ];
    expect(gaps).toEqual([9, 9]);
  });

  it('the trinal signs are the 5th and 9th, evenly spaced round 12', () => {
    const t = avTrigger(3, 100);
    expect((t.trikonaRasis[0]! - t.rasi + 12) % 12).toBe(4);
    expect((t.trikonaRasis[1]! - t.trikonaRasis[0]! + 12) % 12).toBe(4);
  });

  it('names Saturn as the trigger, and says the mechanism is one rule stated five times', () => {
    expect(TRIGGER_PLANET).toBe('saturn');
    expect(TRIGGER_FORMULA_NOTE).toContain('five times');
  });
});

// ── The quantitative transit rule ────────────────────────────────────────────
describe('BPHS 70.19-23, 43-44 — more rekhas is better', () => {
  it('splits at the midpoint of eight references', () => {
    expect(TRANSIT_MIDPOINT).toBe(4);
    expect(transitVerdict(6)).toBe('favourable');
    expect(transitVerdict(2)).toBe('unfavourable');
    expect(transitVerdict(4)).toBe('neutral');
  });

  it('is monotone across the whole 0..8 range', () => {
    const order = { unfavourable: 0, neutral: 1, favourable: 2 };
    let last = -1;
    for (let r = 0; r <= 8; r++) {
      const v = order[transitVerdict(r)];
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
  });

  it('admits the threshold is ours, not the text’s', () => {
    expect(TRANSIT_THRESHOLD_IS_OURS).toContain('OUR boundary');
  });

  it('records the chapter’s electional rule, which is a new question shape', () => {
    expect(ELECTION_RULE).toContain('natal');
    expect(ELECTION_RULE).toContain('transiting body');
  });
});

// ── A rule that yields a number ──────────────────────────────────────────────
describe('BPHS 70.30-33 — a count rather than a verdict', () => {
  it('reads the indication straight off the rekhas', () => {
    expect(childrenIndication(5, false).indicated).toBe(5);
    expect(childrenIndication(5, false).band).toBe('moderate');
    expect(childrenIndication(7, false).band).toBe('many');
    expect(childrenIndication(1, false).band).toBe('limited');
  });

  it('collapses the count when Jupiter is debilitated or in an enemy’s sign', () => {
    expect(childrenIndication(7, true).indicated).toBe(1);
    expect(childrenIndication(7, true).band).toBe('limited');
  });

  it('carries its own caution and records the rival method', () => {
    expect(childrenIndication(4, false).caution).toContain('INDICATION, not a prediction');
    expect(CHILDREN_SECOND_METHOD).toContain('Not implemented');
  });
});

// ── The rules, and the predicate they needed ─────────────────────────────────
describe('BPHS 70 — rules whose conditions are thresholds on a quantity', () => {
  const facts = (bav: Record<string, number[]>, signs: Partial<Record<Graha, number>>): ChartFacts => ({
    lagnaSign: 0,
    planets: Object.fromEntries(
      CLASSICAL_SEVEN.map((g) => [g, { sign: signs[g] ?? 0, house: 1 }]),
    ) as ChartFacts['planets'],
    bav,
  } as ChartFacts);

  it('reads a named planet’s BAV in a house counted from that planet', () => {
    // Jupiter in Aries(0); its 5th is Leo(4). Put 6 rekhas there in Jupiter's own BAV.
    const row = new Array(12).fill(0); row[4] = 6;
    const f = facts({ jupiter: row }, { jupiter: 0 });
    expect(evaluate(
      { k: 'bindus', of: 'jupiter', house: 5, fromGraha: 'jupiter', op: '>=', n: 5 }, f,
    )).toBe(true);
  });

  it('follows the planet — move Jupiter and the same predicate reads a different sign', () => {
    const row = new Array(12).fill(0); row[4] = 6;
    const f = facts({ jupiter: row }, { jupiter: 3 });   // 5th from Cancer is Scorpio(7)
    expect(evaluate(
      { k: 'bindus', of: 'jupiter', house: 5, fromGraha: 'jupiter', op: '>=', n: 5 }, f,
    )).toBe(false);
  });

  it('reads the SAV when `of` is omitted — the pre-Part-17 meaning is untouched', () => {
    const f = { lagnaSign: 0, planets: {}, sav: new Array(12).fill(0) } as unknown as ChartFacts;
    (f.sav as number[])[3] = 30;
    expect(evaluate({ k: 'bindus', sign: 3, op: '>', n: 25 }, f)).toBe(true);
    expect(evaluate({ k: 'bindus', sign: 3, op: '>', n: 35 }, f)).toBe(false);
  });

  it('is false rather than throwing when the named ashtakavarga is absent', () => {
    const f = facts({}, { jupiter: 0 });
    expect(evaluate(
      { k: 'bindus', of: 'jupiter', house: 5, fromGraha: 'jupiter', op: '>=', n: 1 }, f,
    )).toBe(false);
  });

  it('every chapter-70 rule is single-condition and quantitative', () => {
    const rules = ashtakavargaEffectRules();
    expect(rules.length).toBeGreaterThanOrEqual(4);
    for (const r of rules) {
      expect(arity(r), r.id).toBe(1);
      expect(r.when[0]!.k, r.id).toBe('bindus');
    }
  });

  it('records that the extension preserved every older rule’s meaning', () => {
    expect(PREDICATE_EXTENSION_NOTE).toContain('preserves the old meaning');
  });
});

// ── Policy ───────────────────────────────────────────────────────────────────
describe('BPHS 70 — what is computed and never shown', () => {
  it('lists all four unsurfaced strands', () => {
    expect(CH70_UNSURFACED).toHaveLength(4);
    expect(CH70_UNSURFACED.join(' ')).toContain('70.37-44');
  });

  it('no encoded rule carries mortal or medical vocabulary', () => {
    for (const r of ashtakavargaEffectRules()) {
      expect(r.effect.summary).not.toMatch(/death|die|dies|illness|disease|short-lived/i);
    }
  });

  it('names what needs machinery this corpus does not have yet', () => {
    expect(CH70_NOT_ENCODED['15']).toContain('second chart');
    expect(CH70_NOT_ENCODED['16-18']).toContain('Phase IV');
  });
});
