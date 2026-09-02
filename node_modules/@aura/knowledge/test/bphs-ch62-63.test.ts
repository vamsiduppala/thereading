// BPHS Programme Part 43 — Chapters 62-63: the sookshma and prana levels.
//
// Another part whose result is a refusal, so the tests guard the refusal's grounds. The two
// that would catch a real regression are the recursion check — five levels share one function,
// so an error there moves every date — and the span bounds, which are the quantitative half of
// why these levels are not displayed.

import { describe, it, expect } from 'vitest';
import {
  SUBDIVISION_RECURSES_AT_EVERY_LEVEL, SOOKSHMA_PRANA_SPANS,
  SPANS_ARE_BELOW_THE_BIRTH_TIME_RESOLUTION, NO_CELL_STATES_A_CONDITION,
  NO_DEFEASIBILITY_CLAUSE_HERE, CH62_63_EFFECTS_REFUSED, SOOKSHMA_PRANA_STILL_COMPUTABLE,
  SOOKSHMA_ORDER, CH62_63_YIELD,
  subPeriodYears, dashaSequence, VIMSHOTTARI_YEARS, VIMSHOTTARI_ORDER, allEncodedRules,
} from '../src/index.js';

const LORDS = Object.keys(VIMSHOTTARI_YEARS) as (keyof typeof VIMSHOTTARI_YEARS)[];

/** A chain's span in days on the 360-day year the corpus uses. */
const chainDays = (chain: (keyof typeof VIMSHOTTARI_YEARS)[]) => {
  let y = VIMSHOTTARI_YEARS[chain[0]!];
  for (const g of chain.slice(1)) y = subPeriodYears(y, g);
  return y * 360;
};

describe('BPHS 62.1 / 63.1 — the same operation, at levels four and five', () => {
  it('recurses identically all the way down', () => {
    // Five levels, one function. If this ever needs a special case, the model is wrong.
    for (const maha of LORDS) {
      for (const antar of ['sun', 'venus'] as const) {
        for (const praty of ['saturn'] as const) {
          const p = subPeriodYears(subPeriodYears(VIMSHOTTARI_YEARS[maha], antar), praty);
          for (const sook of ['moon', 'ketu'] as const) {
            const s = subPeriodYears(p, sook);
            expect(s, `${maha}/${antar}/${praty}/${sook}`)
              .toBeCloseTo(p * VIMSHOTTARI_YEARS[sook] / 120, 15);
            for (const prana of ['mars'] as const) {
              expect(subPeriodYears(s, prana))
                .toBeCloseTo(s * VIMSHOTTARI_YEARS[prana] / 120, 15);
            }
          }
        }
      }
    }
  });

  it('tiles its parent exactly at both new levels', () => {
    const praty = subPeriodYears(subPeriodYears(VIMSHOTTARI_YEARS['venus'], 'rahu'), 'moon');
    const sookTotal = dashaSequence('moon').reduce((t, g) => t + subPeriodYears(praty, g), 0);
    expect(sookTotal).toBeCloseTo(praty, 12);

    const sook = subPeriodYears(praty, 'moon');
    const pranaTotal = dashaSequence('moon').reduce((t, g) => t + subPeriodYears(sook, g), 0);
    expect(pranaTotal).toBeCloseTo(sook, 12);
  });

  it('reuses the 51.2 order unchanged at these levels', () => {
    expect([...SOOKSHMA_ORDER]).toEqual([...VIMSHOTTARI_ORDER]);
    for (const lord of SOOKSHMA_ORDER) expect(dashaSequence(lord)[0], lord).toBe(lord);
  });

  it('records the recursion as the SOURCE’S, not our extrapolation', () => {
    expect(SUBDIVISION_RECURSES_AT_EVERY_LEVEL).toContain('SOURCE’S');
    expect(SUBDIVISION_RECURSES_AT_EVERY_LEVEL).toContain('Five levels, ONE function');
  });
});

describe('Part 43 — the spans, which are the quantitative half of the refusal', () => {
  it('computes the recorded bounds from the actual lord chains', () => {
    // The constants are claims about the world; this recomputes them rather than trusting.
    let sookMin = Infinity, sookMax = 0, pranaMin = Infinity, pranaMax = 0;
    for (const a of LORDS) for (const b of LORDS) for (const c of LORDS) for (const d of LORDS) {
      const s = chainDays([a, b, c, d]);
      sookMin = Math.min(sookMin, s);
      sookMax = Math.max(sookMax, s);
      for (const e of LORDS) {
        const p = chainDays([a, b, c, d, e]);
        pranaMin = Math.min(pranaMin, p);
        pranaMax = Math.max(pranaMax, p);
      }
    }
    expect(sookMin).toBeCloseTo(SOOKSHMA_PRANA_SPANS.sookshmaMinDays, 2);
    expect(sookMax).toBeCloseTo(SOOKSHMA_PRANA_SPANS.sookshmaMaxDays, 2);
    expect(pranaMin).toBeCloseTo(SOOKSHMA_PRANA_SPANS.pranaMinDays, 4);
    expect(pranaMax).toBeCloseTo(SOOKSHMA_PRANA_SPANS.pranaMaxDays, 2);
  });

  it('puts the shortest prana at about 19 minutes and the shortest sookshma at 6.5 hours', () => {
    expect(SOOKSHMA_PRANA_SPANS.pranaMinDays * 24 * 60).toBeCloseTo(19.4, 0);
    expect(SOOKSHMA_PRANA_SPANS.sookshmaMinDays * 24).toBeCloseTo(6.5, 0);
    expect(SPANS_ARE_BELOW_THE_BIRTH_TIME_RESOLUTION).toContain('19.4 MINUTES');
    expect(SPANS_ARE_BELOW_THE_BIRTH_TIME_RESOLUTION).toContain('NOT a new decision');
  });
});

describe('Part 43 — the refusal, on four independent grounds', () => {
  it('states all four, and names the measurement behind each', () => {
    expect(CH62_63_EFFECTS_REFUSED).toContain('NO CONDITION');
    expect(CH62_63_EFFECTS_REFUSED).toContain('NO DEFEASIBILITY CLAUSE');
    expect(CH62_63_EFFECTS_REFUSED).toContain('BELOW THE RESOLUTION');
    expect(CH62_63_EFFECTS_REFUSED).toContain('CONTENT');
    expect(CH62_63_EFFECTS_REFUSED).toContain('zero of 162');
    expect(CH62_63_EFFECTS_REFUSED).toContain('92 of 162');
  });

  it('records the monotone trend that makes "no condition" a measurement', () => {
    expect(NO_CELL_STATES_A_CONDITION).toContain('38 of 81');
    expect(NO_CELL_STATES_A_CONDITION).toContain('1 of 81');
    expect(NO_CELL_STATES_A_CONDITION).toContain('0 of 162');
    // And that the 15 apparent hits were checked, not assumed away.
    expect(NO_CELL_STATES_A_CONDITION).toContain('ALL FIFTEEN were false positives');
  });

  it('is explicit that the missing clause cuts AGAINST encoding', () => {
    expect(NO_DEFEASIBILITY_CLAUSE_HERE).toContain('cuts AGAINST encoding');
    expect(NO_DEFEASIBILITY_CLAUSE_HERE).toContain('wrong direction');
  });

  it('emits no rules for either chapter — the refusal is real, not nominal', () => {
    const rules = allEncodedRules().filter((r) => r.source.chapter === 62 || r.source.chapter === 63);
    expect(rules).toHaveLength(0);
  });

  it('leaves both levels computable, so the refusal redirects', () => {
    expect(SOOKSHMA_PRANA_STILL_COMPUTABLE).toContain('fully COMPUTABLE');
    expect(SOOKSHMA_PRANA_STILL_COMPUTABLE).toContain('complete to five levels');
    // And the claim is true: a five-deep span computes.
    expect(chainDays(['venus', 'venus', 'venus', 'venus', 'venus'])).toBeGreaterThan(0);
  });
});

describe('Part 43 — the yield', () => {
  it('credits the prediction, which is the methodological result', () => {
    expect(CH62_63_YIELD.note).toContain('Part 42 predicted');
    expect(CH62_63_YIELD.note).toContain('a single measurement settled it');
  });
});
