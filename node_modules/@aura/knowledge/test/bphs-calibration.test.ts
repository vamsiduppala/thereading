// BPHS Programme Part 19 — the standing calibration guard.
//
// Every rule the corpus encodes, measured against a synthetic population. This is the
// test that would have caught the two problems the first calibration run found: rules
// that cannot fire because the generator does not feed their facts, and rules whose
// threshold is so loose they describe most of humanity.

import { describe, it, expect } from 'vitest';
import {
  allEncodedRules, REGISTRY_IS_THE_ONLY_LIST,
  calibrate, syntheticCharts, BAV_CONTRIBUTION_P,
  populationFor, deadRules, canJudge, GUARD_POWER_NOT_SAMPLE_SIZE,
  GENERATOR_MUST_FEED_EVERY_FRAME,
  isSuspiciouslyRare, expectedBaseRate, SUSPECT_THRESHOLD_SCALES_WITH_ARITY,
  arity, BASE_RATE_SUPPRESS,
} from '../src/index.js';

describe('BPHS Part 19 — every encoded rule is discriminative', () => {
  const rules = allEncodedRules();
  const POPULATION = 20000;
  const result = calibrate(rules, syntheticCharts(POPULATION, 99));

  it('has rules to measure, and reads them from the one registry', () => {
    expect(rules.length).toBeGreaterThanOrEqual(20);
    expect(REGISTRY_IS_THE_ONLY_LIST).toContain('single list');
  });

  it('no rule is SILENTLY non-discriminative', () => {
    // A rule may legitimately fire for most charts — "the lord in an angle or a trine"
    // covers six of twelve houses and is true of half of everyone. What it may NOT do is
    // fire that often without saying so, because then `arbitrate` surfaces it as a finding.
    //
    // So the assertion is not "stay under the line". It is: measure above the line and you
    // must DECLARE your baseRate, which makes the gate withhold you. Deleting such a rule
    // would lose real source material; inventing a tighter condition would misattribute it.
    for (const r of rules) {
      const measured = result.baseRates[r.id]!;
      if (measured > BASE_RATE_SUPPRESS) {
        expect(r.baseRate, `${r.id} measures ${(measured * 100).toFixed(1)}% and must declare it`)
          .toBeGreaterThan(BASE_RATE_SUPPRESS);
      }
    }
  });

  it('a declared base rate matches what is actually measured', () => {
    // A stale declaration is worse than none — it would withhold or surface the wrong thing.
    for (const r of rules) {
      if (r.baseRate == null) continue;
      expect(Math.abs(r.baseRate - result.baseRates[r.id]!), `${r.id}`).toBeLessThan(0.1);
    }
  });

  it('the ch 70 thresholds stay where the calibration put them', () => {
    // Raised from 5-of-8 to 6-of-8 in Part 19 because they measured 38%. If a later edit
    // loosens them again, this catches it before the base-rate gate silently buries them.
    for (const id of ['bphs.70.030.children-supported', 'bphs.70.034.venus-gains']) {
      expect(result.baseRates[id], id).toBeLessThan(0.25);
    }
  });

  it('no encoded rule is rarer than its OWN specificity predicts', () => {
    // Not a flat floor. A three-condition rule should fire near (1/12)^3 = 0.058%, and
    // Part 19's flat 0.1% called exactly that a transcription bug. The test is whether a
    // rule fires far below what its arity predicts — which still catches a broken
    // one-condition rule, and stops punishing a precise one.
    for (const r of rules) {
      // Abstain where the sample has no power. At arity 4 a 20,000-chart population expects
      // one hit, so a measured zero says nothing about the rule — see canJudge.
      if (!canJudge(arity(r), POPULATION)) continue;
      const measured = result.baseRates[r.id]!;
      expect(
        isSuspiciouslyRare(measured, arity(r)),
        `${r.id} (arity ${arity(r)}) fires at ${(measured * 100).toFixed(4)}% `
        + `against an expected ~${(expectedBaseRate(arity(r)) * 100).toFixed(4)}%`,
      ).toBe(false);
    }
  });

  it('abstains rather than accusing when it lacks the power to judge', () => {
    // The guard must not be vacuous either: it still judges everything it CAN.
    const judged = rules.filter((r) => canJudge(arity(r), POPULATION));
    expect(judged.length).toBeGreaterThan(rules.length / 2);
    expect(canJudge(1, POPULATION)).toBe(true);
    expect(canJudge(4, POPULATION)).toBe(false);
  });

  it('the suspect check still catches a broken one-condition rule', () => {
    // The check must not become vacuous. A single-condition rule firing at 0.05% is an
    // order of magnitude below the 8.3% its arity predicts, and is still flagged.
    expect(isSuspiciouslyRare(0.0005, 1)).toBe(true);
    expect(isSuspiciouslyRare(0, 5)).toBe(true);
    // ...while a three-condition rule at its expected rate is not.
    expect(isSuspiciouslyRare(0.0005, 3)).toBe(false);
    expect(SUSPECT_THRESHOLD_SCALES_WITH_ARITY).toContain('Part 23');
  });

  it('reports a rule as dead only when the sample could have judged it', () => {
    // A guard that cries wolf a third of the time is a guard that gets ignored. At arity 4
    // a 20,000-chart population expects ~1 hit, so a zero there is noise, not evidence.
    expect(populationFor(1)).toBe(120);
    expect(populationFor(4)).toBeGreaterThan(200000);
    expect(GUARD_POWER_NOT_SAMPLE_SIZE).toContain('UNJUDGED');
    const { dead, unjudged } = deadRules(['x'], [{ id: 'x', when: [1, 2, 3, 4] }], 20000);
    expect(dead).toEqual([]);
    expect(unjudged).toEqual(['x']);
  });

  it('every rule the sample can judge does actually fire', () => {
    // The first calibration run reported nine of thirteen as dead — not because they were
    // wrong, but because the generator fed no `lagnas` and no `bav`. If this list is ever
    // non-empty again, suspect the GENERATOR before suspecting the rules.
    const { dead } = deadRules(result.neverFired, rules, POPULATION);
    expect(dead, GENERATOR_MUST_FEED_EVERY_FRAME).toEqual([]);
  });

  it('the generator feeds every fact the encoded rules read', () => {
    const chart = syntheticCharts(1, 1)[0]! as unknown as Record<string, unknown>;
    expect(chart.planets).toBeDefined();
    expect(chart.sav).toBeDefined();
    expect(chart.lagnas).toBeDefined();
    expect(chart.bav).toBeDefined();
    const lagnas = chart.lagnas as Record<string, number>;
    for (const f of ['natal', 'bhava', 'hora', 'ghatika', 'arudha', 'upapada']) {
      expect(lagnas[f], f).toBeDefined();
    }
    const bav = chart.bav as Record<string, number[]>;
    for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'asc']) {
      expect(bav[g], g).toHaveLength(12);
    }
  });
});

describe('BPHS Part 19 — the synthetic population has the right shape', () => {
  it('BAV cells are binomial, not uniform — the structure ashtakavarga actually has', () => {
    // A BAV cell is a count of eight independent contributions, so it peaks near four.
    // Drawing it uniformly overstates the extremes and would mis-calibrate every threshold.
    const charts = syntheticCharts(3000, 77);
    const counts = new Array(9).fill(0) as number[];
    for (const c of charts) {
      for (const v of (c as unknown as { bav: Record<string, number[]> }).bav.jupiter!) counts[v]! += 1;
    }
    const total = counts.reduce((a, b) => a + b, 0);
    // The mode must sit at 4 or 5, and the tails must be thin.
    const mode = counts.indexOf(Math.max(...counts));
    expect(mode).toBeGreaterThanOrEqual(3);
    expect(mode).toBeLessThanOrEqual(5);
    expect(counts[0]! / total).toBeLessThan(0.02);
    expect(counts[8]! / total).toBeLessThan(0.02);
  });

  it('derives the SAV from the seven planetary rows rather than drawing it separately', () => {
    for (const c of syntheticCharts(50, 31)) {
      const f = c as unknown as { sav: number[]; bav: Record<string, number[]> };
      for (let s = 0; s < 12; s++) {
        const summed = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']
          .reduce((t, g) => t + f.bav[g]![s]!, 0);
        expect(f.sav[s]).toBe(summed);
      }
    }
  });

  it('takes its contribution probability from the corpus, not from a guess', () => {
    // 337 of 672 possible marks across the seven planets is 0.501.
    expect(BAV_CONTRIBUTION_P).toBeGreaterThan(0.49);
    expect(BAV_CONTRIBUTION_P).toBeLessThan(0.53);
    expect(337 / 672).toBeCloseTo(0.501, 3);
  });
});
