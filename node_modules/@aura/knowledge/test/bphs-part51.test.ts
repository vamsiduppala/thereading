// BPHS Programme Part 51 — the last part: chapters 9, 10, 43, 44, 71.
//
// The test that matters most is `the three broad verses are NOT shipped as rules`. This part's
// first design encoded all five of chapter 10's verses, and the calibration showed three of
// them true of a third to seven-tenths of everyone. That test pins the correction so the
// original design cannot come back looking reasonable.

import { describe, it, expect } from 'vitest';
import {
  BPHS_STATES_ITS_OWN_ABSTENTION, CH09_REFUSED, arishtaCancellationRules,
  CANCELLATIONS_FAIL_AS_ASSERTIONS, CH10_ENCODED_WITHOUT_CH09,
  ANTIDOTE_MECHANISM_OUTLIVED_ITS_SOURCE, MARAKA_DERIVATION,
  LONGEVITY_COMPUTED_NEVER_SURFACED, PART51_YIELD,
  MARAKA_HOUSES, allEncodedRules, evaluateAll, syntheticCharts,
} from '../src/index.js';

const rules = arishtaCancellationRules();

describe('BPHS 9 — refused, and the corpus’s own restraint recorded', () => {
  it('emits no rules', () => {
    expect(allEncodedRules().filter((r) => r.source.chapter === 9)).toHaveLength(0);
  });

  it('says why there is no structural residue, unlike chapter 83', () => {
    expect(CH09_REFUSED).toContain('the combination and the claim are the');
    expect(CH09_REFUSED).toContain('REFUSED IN FULL');
  });

  it('records BPHS 9.2 — the source limiting itself', () => {
    expect(BPHS_STATES_ITS_OWN_ABSTENTION).toContain('NO DEFINITE CALCULATION OF LIFE SPAN');
    expect(BPHS_STATES_ITS_OWN_ABSTENTION).toContain('Our constraint is stricter');
  });

  it('no rule anywhere predicts infant death', () => {
    // `die` without a boundary matches "steadier"; the word is what matters.
    const banned = /child will|infant|fortnight|dies?|death|lifespan|life span/i;
    for (const r of allEncodedRules()) {
      expect(banned.test(r.effect.summary), `${r.id}: ${r.effect.summary}`).toBe(false);
    }
  });
});

describe('BPHS 10 — the antidotes, and the calibration that reshaped them', () => {
  it('ships exactly the two discriminative verses', () => {
    expect(rules).toHaveLength(2);
    expect(rules.map((r) => r.id).sort()).toEqual([
      'bphs.10.003.jupiter-strong-in-lagna',
      'bphs.10.004.lagna-lord-in-kendra',
    ]);
  });

  it('the three broad verses are NOT shipped as rules', () => {
    // 10.2 fires on 70.69% of charts, 10.5 on 36.82%, 10.7 on 33.42%. A "you are well
    // defended" true of seven charts in ten says nothing about the chart.
    for (const id of ['bphs.10.002', 'bphs.10.005', 'bphs.10.007']) {
      expect(rules.some((r) => r.id.startsWith(id)), id).toBe(false);
      expect(allEncodedRules().some((r) => r.id.startsWith(id)), id).toBe(false);
    }
    expect(CANCELLATIONS_FAIL_AS_ASSERTIONS).toContain('70.69%');
    expect(CANCELLATIONS_FAIL_AS_ASSERTIONS).toContain('fail as ASSERTIONS');
  });

  it('and the two that ship really are discriminative', () => {
    const charts = syntheticCharts(20000, 51);
    for (const r of rules) {
      const rate = charts.filter((c) => evaluateAll(r.when, c)).length / charts.length;
      expect(rate, `${r.id} fires on ${(rate * 100).toFixed(1)}%`).toBeLessThan(0.20);
      expect(rate, r.id).toBeGreaterThan(0);
    }
  });

  it('surfaces protection without ever naming the threat', () => {
    for (const r of rules) {
      expect(r.effect.valence).toBeGreaterThan(0);
      expect(/evil|arishta|death|danger|misfortune/i.test(r.effect.summary), r.id).toBe(false);
      // The note says what BPHS stated it against, so the omission is visible.
      expect(r.note!.toLowerCase()).toContain('chapter 9');
    }
    expect(CH10_ENCODED_WITHOUT_CH09).toContain('without ever asserting the affliction');
  });

  it('records the mechanism built in Part 1 for this chapter', () => {
    expect(ANTIDOTE_MECHANISM_OUTLIVED_ITS_SOURCE).toContain('PART 1');
    expect(ANTIDOTE_MECHANISM_OUTLIVED_ITS_SOURCE).toContain('FIFTEEN rules');
    // And it really is still in use elsewhere.
    expect(allEncodedRules().filter((r) => r.unless?.length).length).toBeGreaterThan(0);
  });
});

describe('BPHS 43, 44, 71 — computed, never surfaced', () => {
  it('does not duplicate the maraka pair that already ships', () => {
    // data/longevity.ts already holds [2, 7] from the same verse.
    expect([...MARAKA_HOUSES]).toEqual([2, 7]);
    expect(MARAKA_DERIVATION).toContain('Nothing is duplicated');
    expect(MARAKA_DERIVATION).toContain('3rd and 8th');
  });

  it('states the policy once rather than in eleven footnotes', () => {
    expect(LONGEVITY_COMPUTED_NEVER_SURFACED).toContain('CLOSES it');
    expect(LONGEVITY_COMPUTED_NEVER_SURFACED).toContain('Part 36');
    expect(LONGEVITY_COMPUTED_NEVER_SURFACED).toContain('Part 37');
  });

  it('emits no rules for any of the three chapters', () => {
    for (const ch of [43, 44, 71]) {
      expect(allEncodedRules().filter((r) => r.source.chapter === ch), `ch ${ch}`)
        .toHaveLength(0);
    }
  });
});

describe('Part 51 — the last yield', () => {
  it('leads with the asymmetry that defines the part', () => {
    expect(PART51_YIELD.note).toContain('THE LAST PART');
    expect(PART51_YIELD.note).toContain('asymmetry');
  });
});
