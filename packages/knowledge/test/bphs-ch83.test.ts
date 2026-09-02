// BPHS Programme Part 49 — Chapter 83: curses in the previous birth.
//
// Refused in full, so every test here guards the refusal. The one doing real work is
// `no rule anywhere carries chapter 83's material` — as in Part 48, the failure mode worth
// preventing is a later part reintroducing this under a different chapter number.

import { describe, it, expect } from 'vitest';
import {
  BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND, CURSE_SOURCES, CH83_ARCHITECTURE,
  COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED, CH83_RITUAL_REMEDIES_REFUSED, CH83_REFUSED,
  CH83_YIELD, allEncodedRules,
} from '../src/index.js';

describe('Part 49 — blame-for-suffering, a new refusal ground', () => {
  it('distinguishes it from a doom claim, and gives all three reasons', () => {
    expect(BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND).toContain('BECAUSE YOU DESERVED IT');
    expect(BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND).toContain('UNFALSIFIABLE BY');
    expect(BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND).toContain('ASSIGNS A WRONGED PARTY');
    expect(BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND).toContain('ARRIVES WITH A PRICE');
  });

  it('is written to be reusable in Part 51', () => {
    expect(BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND).toContain('Part 51');
  });
});

describe('BPHS 83 — what the chapter is, and why all four grounds apply', () => {
  it('records the architecture the refusal is judged against', () => {
    expect(CH83_ARCHITECTURE).toContain('Sonless-ness');
    expect(CH83_ARCHITECTURE).toContain('SIN');
    expect(CURSE_SOURCES.length).toBeGreaterThanOrEqual(8);
    expect(CURSE_SOURCES).toContain('the mother');
    expect(CURSE_SOURCES).toContain('a serpent');
  });

  it('names four independently sufficient grounds', () => {
    expect(CH83_REFUSED).toContain('BLAME-FOR-SUFFERING');
    expect(CH83_REFUSED).toContain('REPRODUCTIVE');
    expect(CH83_REFUSED).toContain('GENDERED');
    expect(CH83_REFUSED).toContain('RITUAL REMEDIES');
  });

  it('is explicit that this differs from Part 48’s reason', () => {
    // Ch 80 had nothing under its verdicts; ch 83 has ordinary combinations underneath.
    expect(COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED).toContain('DOES contain separable');
    expect(COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED).toContain('what the combination');
  });

  it('explains why a neutral relabel would be worse here, not safer', () => {
    expect(COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED).toContain('reversible');
    expect(COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED)
      .toContain('only our acknowledgement of it');
  });

  it('records the ritual remedies as structural, not incidental', () => {
    expect(CH83_RITUAL_REMEDIES_REFUSED).toContain('what the diagnosis is FOR');
  });
});

describe('Part 49 — nothing was encoded, here or anywhere', () => {
  it('emits no rules for chapter 83', () => {
    expect(allEncodedRules().filter((r) => r.source.chapter === 83)).toHaveLength(0);
  });

  it('no rule anywhere carries chapter 83’s material', () => {
    const banned = /curse|previous birth|sonless|childless|no son|sin of|preta/i;
    for (const r of allEncodedRules()) {
      expect(banned.test(r.effect.summary), `${r.id}: ${r.effect.summary}`).toBe(false);
    }
  });

  it('and the yield says shipping nothing was the point', () => {
    expect(CH83_YIELD.note).toContain('Refused in full');
    expect(CH83_YIELD.note).toContain('REFUSAL GROUND');
  });
});
