// BPHS Programme Part 24 — Chapters 22 and 23: the 11th and 12th houses.
// Completes all twelve houses. The retrofit under test is `fromHouse` — bhavat bhavam.

import { describe, it, expect } from 'vitest';
import {
  BHAVAT_BHAVAM, MATTER_HOUSE, readFromHouse,
  eleventhHouseRules, twelfthHouseRules,
  GAIN_TIMING, NISHKA_AMOUNTS_NOT_SURFACED,
  VISIBLE_HALF_HOUSES, INVISIBLE_HALF_HOUSES, MANIFESTATION_NOTE,
  CH22_23_YIELD, CH22_23_EXCLUDED, CH22_23_UNSURFACED,
  CH22_23_NOT_YET_EXPRESSIBLE, HOUSE_BLOCK_COMPLETE,
  firstHouseRules, allEncodedRules,
  evaluate, arity, fired,
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

// ── The retrofit: bhavat bhavam ──────────────────────────────────────────────
describe('BPHS 23.7 — every house is an ascendant for its own matter', () => {
  it('counts a house from another house', () => {
    // Aries lagna. The 11th from the 11th is the 9th — Sagittarius, sign 8.
    const f = chart({ jupiter: { sign: 8, house: 9 } });
    expect(evaluate({ k: 'placement', graha: 'jupiter', house: 11, fromHouse: 11 }, f)).toBe(true);
    // And it is NOT the plain 11th.
    expect(evaluate({ k: 'placement', graha: 'jupiter', house: 11 }, f)).toBe(false);
  });

  it('agrees with the plain form when `fromHouse` is the ascendant', () => {
    const f = chart({ jupiter: { sign: 10, house: 11 } });
    expect(evaluate({ k: 'placement', graha: 'jupiter', house: 11 }, f)).toBe(true);
    expect(evaluate({ k: 'placement', graha: 'jupiter', house: 11, fromHouse: 1 }, f)).toBe(true);
  });

  it('works for lordship as well as placement', () => {
    // Reframing moves BOTH ends. Aries lagna with fromHouse 3 puts the frame on Gemini,
    // so "house 3" is the 3rd from Gemini — Leo — and its lord is the SUN, not Mercury.
    // "occupies 3" then means the Sun sits in Leo.
    const f = chart({ sun: { sign: 4, house: 5 } });
    expect(evaluate({ k: 'lordship', house: 3, occupies: 3, fromHouse: 3 }, f)).toBe(true);
    // Unframed, "house 3" is Gemini and its lord is Mercury, which is elsewhere.
    expect(evaluate({ k: 'lordship', house: 3, occupies: 3 }, f)).toBe(false);
  });

  it('resolves the LORD from the reframed house, not the original', () => {
    // With fromHouse 3, "house 1" is Gemini, so `lordship house:1` means Mercury.
    const f = chart({ mercury: { sign: 2, house: 3 } });
    expect(evaluate({ k: 'lordship', house: 1, occupies: 1, fromHouse: 3 }, f)).toBe(true);
  });

  it('retargets a whole rule set, compounds and `unless` included', () => {
    const base = firstHouseRules();
    const reframed = readFromHouse(base, 3);
    expect(reframed).toHaveLength(base.length);
    for (const [i, r] of reframed.entries()) {
      expect(r.id).toBe(`${base[i]!.id}.from-h3`);
    }
    const withUnless = reframed.find((r) => r.unless && r.unless.length > 0)!;
    const un = withUnless.unless![0] as { of: { fromHouse?: number }[] };
    for (const p of un.of) expect(p.fromHouse).toBe(3);
  });

  it('is a no-op for the first house', () => {
    const base = firstHouseRules();
    expect(readFromHouse(base, 1)).toBe(base);
  });

  it('names the matter houses BPHS itself gives, and no more', () => {
    // "co-born etc." — the verse does not enumerate, so filling in twelve would be
    // inventing rather than extracting.
    expect(MATTER_HOUSE.siblings).toBe(3);
    expect(MATTER_HOUSE.father).toBe(9);
    expect(Object.keys(MATTER_HOUSE).length).toBeLessThan(12);
  });

  it('records the verse that licenses all of this', () => {
    expect(BHAVAT_BHAVAM).toContain('23.7');
    expect(BHAVAT_BHAVAM).toContain('general form of 12.11');
  });
});

// ── Chapter 22 ───────────────────────────────────────────────────────────────
describe('BPHS 22 — the eleventh house', () => {
  it('is the cleanest chapter of the house block', () => {
    expect(eleventhHouseRules()).toHaveLength(6);
    expect(CH22_23_YIELD.ch22.note).toContain('cleanest chapter');
  });

  it('writes 22.7 as the verse states it — the 11th from the 11th', () => {
    const r = eleventhHouseRules().find((x) => x.id === 'bphs.22.007.benefics-in-ninth')!;
    for (const p of r.when) expect((p as { fromHouse?: number }).fromHouse).toBe(11);
    expect(r.note).toContain('FIRST RULE TO USE `fromHouse`');
  });

  it('fires 22.7 on benefics in the 9th', () => {
    const f = chart({ jupiter: { sign: 8, house: 9 }, mercury: { sign: 8, house: 9 } });
    expect(fired(eleventhHouseRules(), f).map((h) => h.rule.id))
      .toContain('bphs.22.007.benefics-in-ninth');
  });

  it('has four lord-exchange rules, all two-condition', () => {
    const exchanges = eleventhHouseRules().filter((r) =>
      r.when.length === 2 && r.when.every((p) => p.k === 'lordship'));
    expect(exchanges.length).toBeGreaterThanOrEqual(3);
    for (const r of exchanges) expect(arity(r)).toBe(2);
  });

  it('shares an effect id with ch 13’s 2nd/11th exchange, so they corroborate', () => {
    const r = eleventhHouseRules().find((x) => x.id === 'bphs.22.009.second-eleventh-exchange')!;
    expect(r.effect.id).toBe('gains.substantial');
    expect(r.note).toContain('read from the other end');
  });

  it('lets the affliction rule argue against the gain rules', () => {
    const gains = eleventhHouseRules().filter((r) => r.effect.id === 'gains.substantial');
    expect(gains.some((r) => r.effect.valence > 0)).toBe(true);
    expect(gains.some((r) => r.effect.valence < 0)).toBe(true);
  });

  it('carries the gain ages but not the nishka amounts', () => {
    expect(GAIN_TIMING).toHaveLength(3);
    for (const g of GAIN_TIMING) {
      expect(g.age).toBeGreaterThan(18);
      expect(g.nishkas).toBeGreaterThan(0);   // recorded...
    }
    expect(NISHKA_AMOUNTS_NOT_SURFACED).toContain('never shown');   // ...but not shown
    for (const r of eleventhHouseRules()) {
      expect(r.effect.summary, r.id).not.toMatch(/\b(nishka|coin|\d{3,})\b/i);
    }
  });
});

// ── Chapter 23 ───────────────────────────────────────────────────────────────
describe('BPHS 23 — the twelfth house', () => {
  it('yields five rules from fourteen verses', () => {
    expect(twelfthHouseRules()).toHaveLength(5);
    expect(CH22_23_YIELD.ch23.verses).toBe(14);
  });

  it('makes the two travel verses argue with each other', () => {
    const travel = twelfthHouseRules().filter((r) => r.effect.id === 'travel.distant');
    expect(travel).toHaveLength(2);
    expect(Math.sign(travel[0]!.effect.valence)).not.toBe(Math.sign(travel[1]!.effect.valence));
  });

  it('does not treat distance as a misfortune', () => {
    const r = twelfthHouseRules().find((x) => x.id === 'bphs.23.011.travel-abroad')!;
    expect(r.effect.valence).toBeGreaterThan(0);
    expect(r.note).toContain('not a misfortune');
    const stay = twelfthHouseRules().find((x) => x.id === 'bphs.23.012.stays-close')!;
    expect(stay.note).toContain('not a value judgement');
  });

  it('restates emancipation as a capacity rather than an outcome', () => {
    const r = twelfthHouseRules().find((x) => x.id === 'bphs.23.010.benefic-twelfth-lord-exalted')!;
    expect(r.effect.summary).not.toMatch(/\b(moksha|emancipation|salvation)\b/i);
    expect(r.note).toContain('not something an engine should assert');
  });

  it('splits the zodiac into visible and invisible halves, covering all twelve', () => {
    expect(VISIBLE_HALF_HOUSES).toHaveLength(6);
    expect(INVISIBLE_HALF_HOUSES).toHaveLength(6);
    expect(new Set([...VISIBLE_HALF_HOUSES, ...INVISIBLE_HALF_HOUSES]).size).toBe(12);
  });

  it('records manifestation as an axis the arbitration does not have', () => {
    expect(MANIFESTATION_NOTE).toContain('does not carry');
  });

  it('excludes the two verses that judge rather than describe', () => {
    expect(CH22_23_EXCLUDED).toHaveLength(2);
    expect(CH22_23_EXCLUDED.join(' ')).toContain('go to hell');
    expect(CH22_23_EXCLUDED.join(' ')).toContain('sinful');
  });
});

// ── The house block, complete ────────────────────────────────────────────────
describe('BPHS Part 24 — all twelve houses encoded', () => {
  const all = [...eleventhHouseRules(), ...twelfthHouseRules()];

  it('adds eleven rules', () => {
    expect(all).toHaveLength(11);
  });

  it('the registry now carries every house rule set', () => {
    const ids = allEncodedRules().map((r) => r.id);
    // One id from each of the twelve chapters 12-23.
    for (const ch of ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']) {
      expect(ids.some((i) => i.startsWith(`bphs.${ch}.`)), `chapter ${ch}`).toBe(true);
    }
  });

  it('records that the block is done and what remains of Phase III', () => {
    expect(HOUSE_BLOCK_COMPLETE).toContain('all twelve houses');
    expect(HOUSE_BLOCK_COMPLETE).toContain('yoga');
  });

  it('names the small gap that has now bitten three times', () => {
    expect(CH22_23_NOT_YET_EXPRESSIBLE[0]).toContain('Second and third');
  });

  it('notes the varga gap is now five parts old', () => {
    expect(CH22_23_NOT_YET_EXPRESSIBLE.join(' ')).toContain('FIVE parts running');
  });

  it('no rule surfaces mortal, medical or judgemental language', () => {
    for (const r of all) {
      expect(r.effect.summary, r.id)
        .not.toMatch(/\b(death|dies?|hell|sinful|sin|wicked|barren)\b/i);
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
});
