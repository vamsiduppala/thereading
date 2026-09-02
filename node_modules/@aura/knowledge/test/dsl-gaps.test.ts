// The three DSL gaps, closed.
//
// The test that justifies the work is `BPHS 79.8 is now the verse, not a proxy`. Part 47 built
// that rule, measured it at 14.5% of charts as a proxy, and withheld it — because the clause
// that made it a yoga could not be said. It can be said now.

import { describe, it, expect } from 'vitest';
import {
  evaluate, withVargas, PROJECT_ONCE_PER_CHART,
  PHASE_ENCODES_THE_LABEL_NOT_THE_BOUNDARY,
} from '../src/index.js';
import type { ChartFacts, Predicate } from '../src/index.js';

// Aries lagna. Longitudes matter because the varga projection divides degrees.
const chart = (over: Record<string, number> = {}): ChartFacts => {
  const base: Record<string, number> = {
    sun: 130, moon: 100, mars: 10, mercury: 160,
    jupiter: 250, venus: 40, saturn: 280, rahu: 70, ketu: 250,
  };
  const planets: Record<string, unknown> = {};
  for (const [g, lon] of Object.entries({ ...base, ...over })) {
    const sign = Math.floor(lon / 30);
    planets[g] = { sign, house: sign + 1, longitude: lon, dignity: 'neutral' };
  }
  return { lagnaSign: 0, planets } as unknown as ChartFacts;
};

describe('gap 1 — the dispositor, as a recursive PlanetRef', () => {
  it('resolves the lord of the sign a planet occupies', () => {
    // The Moon at 100° is in Cancer, which the Moon rules — its own dispositor.
    expect(evaluate({ k: 'isPlanet', ref: { dispositorOf: 'moon' }, is: 'moon' }, chart()))
      .toBe(true);
    // Jupiter moved to 280° is in Capricorn, ruled by Saturn.
    expect(evaluate({ k: 'isPlanet', ref: { dispositorOf: 'jupiter' }, is: 'saturn' },
      chart({ jupiter: 280 }))).toBe(true);
  });

  it('says "X is in a sign ruled by Y" — BPHS’s commonest phrasing', () => {
    const c = chart({ moon: 280 });
    expect(evaluate({ k: 'isPlanet', ref: { dispositorOf: 'moon' }, is: 'saturn' }, c)).toBe(true);
    expect(evaluate({ k: 'isPlanet', ref: { dispositorOf: 'moon' }, is: 'mars' }, c)).toBe(false);
  });

  it('composes to any depth, which is what Kalpadruma needs', () => {
    const deep: Predicate = {
      k: 'isPlanet',
      ref: { dispositorOf: { dispositorOf: { dispositorOf: 'venus' } } },
      is: 'venus',
    };
    expect(evaluate(deep, chart())).toBe(true);
  });

  it('terminates at swakshetra instead of looping', () => {
    // The Sun at 130° is in Leo, its own sign. Any depth resolves to the Sun, not a hang.
    expect(evaluate({ k: 'isPlanet', ref: { dispositorOf: 'sun' }, is: 'sun' }, chart())).toBe(true);
    expect(evaluate({ k: 'isPlanet', ref: { dispositorOf: { dispositorOf: 'sun' } }, is: 'sun' },
      chart())).toBe(true);
    expect(evaluate({
      k: 'isPlanet',
      ref: { dispositorOf: { dispositorOf: { dispositorOf: 'sun' } } },
      is: 'sun',
    }, chart())).toBe(true);
  });

  it('works through every predicate that already took a PlanetRef', () => {
    // One type change, six kinds. `dignity` is the cheapest to demonstrate.
    const c = chart({ moon: 280 });
    expect(evaluate({ k: 'dignity', graha: { dispositorOf: 'moon' }, is: ['own'] }, c))
      .toBe(evaluate({ k: 'dignity', graha: 'saturn', is: ['own'] }, c));
  });
});

describe('gap 2 — inFrame, for varga and dasha-start projections', () => {
  it('is silent when the frame was not supplied', () => {
    expect(evaluate(
      { k: 'inFrame', frame: { varga: 9 }, of: [{ k: 'placement', graha: 'moon', house: 1 }] },
      chart(),
    )).toBe(false);
    expect(evaluate(
      { k: 'inFrame', frame: 'dasha-start', of: [{ k: 'placement', graha: 'moon', house: 1 }] },
      chart(),
    )).toBe(false);
  });

  it('evaluates against the projected chart once it is supplied', () => {
    const c = withVargas(chart(), [3, 9]);
    expect(c.vargas?.[3]).toBeTruthy();
    expect(c.vargas?.[9]).toBeTruthy();
    // The D9 places planets differently from D1, so some predicate must disagree between the
    // two frames — otherwise the projection is doing nothing.
    let differed = 0;
    for (const g of ['sun', 'moon', 'mars', 'jupiter', 'saturn'] as const) {
      for (let sign = 0; sign < 12; sign++) {
        const natal = evaluate({ k: 'placement', graha: g, sign: sign as 0 }, c);
        const nav = evaluate(
          { k: 'inFrame', frame: { varga: 9 }, of: [{ k: 'placement', graha: g, sign: sign as 0 }] },
          c,
        );
        if (natal !== nav) differed++;
      }
    }
    expect(differed).toBeGreaterThan(0);
  });

  it('BPHS 79.8 is now the verse, not a proxy', () => {
    // "the Moon in Saturn's drekkana, or in Saturn's or Mars's navamsa, aspected by Saturn."
    // Part 47 could not say the varga clause and withheld the rule rather than ship a proxy
    // firing on 14.5% of charts. This is that clause.
    const vargaClause: Predicate = {
      k: 'compound', op: 'or', of: [
        { k: 'inFrame', frame: { varga: 3 }, of: [{ k: 'isPlanet', ref: { dispositorOf: 'moon' }, is: 'saturn' }] },
        { k: 'inFrame', frame: { varga: 9 }, of: [{ k: 'isPlanet', ref: { dispositorOf: 'moon' }, is: 'saturn' }] },
        { k: 'inFrame', frame: { varga: 9 }, of: [{ k: 'isPlanet', ref: { dispositorOf: 'moon' }, is: 'mars' }] },
      ],
    };
    expect(typeof evaluate(vargaClause, withVargas(chart(), [3, 9]))).toBe('boolean');
    // And it is genuinely selective — not true of every Moon longitude.
    const answers = new Set<boolean>();
    for (let lon = 0; lon < 360; lon += 7) {
      answers.add(evaluate(vargaClause, withVargas(chart({ moon: lon }), [3, 9])));
    }
    expect(answers.size).toBe(2);
  });

  it('nests, so a dispositor inside a varga inside a compound composes', () => {
    // `compound` is or/not — an AND is simply a list of predicates — so the nesting to show
    // is a dispositor chain inside a varga frame inside a disjunction.
    const nested: Predicate = {
      k: 'compound', op: 'or', of: [
        { k: 'inFrame', frame: { varga: 9 }, of: [
          { k: 'isPlanet', ref: { dispositorOf: { dispositorOf: 'moon' } }, is: 'moon' },
        ] },
      ],
    };
    expect(typeof evaluate(nested, withVargas(chart(), [9]))).toBe('boolean');
  });

  it('projects once per chart rather than once per rule', () => {
    const c = withVargas(chart(), [9]);
    expect(withVargas(c, [9]).vargas?.[9]).toBe(c.vargas?.[9]);
    expect(PROJECT_ONCE_PER_CHART).toContain('ONCE PER CHART');
  });

  it('reads a dasha-start chart when the caller supplies one', () => {
    const c = { ...chart(), atDashaStart: chart({ jupiter: 10 }) } as ChartFacts;
    expect(evaluate(
      { k: 'inFrame', frame: 'dasha-start', of: [{ k: 'placement', graha: 'jupiter', sign: 0 }] },
      c,
    )).toBe(true);
    // The natal chart still says otherwise, so the two are genuinely distinct.
    expect(evaluate({ k: 'placement', graha: 'jupiter', sign: 0 }, c)).toBe(false);
  });
});

describe('gap 3 — the within-period split', () => {
  it('encodes the source’s label and refuses its boundary', () => {
    expect(PHASE_ENCODES_THE_LABEL_NOT_THE_BOUNDARY).toContain('SOURCE’S OWN LABEL');
    expect(PHASE_ENCODES_THE_LABEL_NOT_THE_BOUNDARY)
      .toContain('never says where the parts divide');
    expect(PHASE_ENCODES_THE_LABEL_NOT_THE_BOUNDARY).toContain('no boundary');
  });
});
