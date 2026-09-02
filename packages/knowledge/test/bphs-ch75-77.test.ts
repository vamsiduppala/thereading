// BPHS Programme Part 46 — Chapters 75-77. Phase V.
//
// Two tests here do work nothing else does. `the strength condition is what the engine is
// missing` recomputes the product impact from the synthetic population rather than trusting the
// recorded figure, so the flagged decision cannot go stale. And `77.5-22 stays refused` exists
// because that material is the kind a later part might try to rescue as "structural" — it is
// not, and the test says why in the assertion itself.

import { describe, it, expect } from 'vitest';
import {
  MAHAPURUSHA_YOGAS, mahapurushaRules, MAHAPURUSHA_STRENGTH_CONDITION_MISSING,
  MAHAPURUSHA_STRENGTH_IMPACT, CH75_DESCRIPTIONS_REFUSED,
  ELEMENT_OF_PLANET, ELEMENT_MAPPING_IS_STATED_FOUR_TIMES, dominantElement,
  CH76_TEMPERAMENT_DESCRIPTIONS_REFUSED, GUNA_OF_PLANET, dominantGuna,
  CH77_CLASS_HIERARCHY_REFUSED, CH75_77_YIELD,
  SHADBALA_REQUIRED, evaluateAll, syntheticCharts, allEncodedRules,
} from '../src/index.js';
import type { Graha } from '../src/index.js';

const rules = mahapurushaRules();

describe('BPHS 75.1-2 — the Pancha Mahapurusha formation', () => {
  it('names the five yogas the chapter names, one per non-luminary', () => {
    expect(MAHAPURUSHA_YOGAS).toHaveLength(5);
    expect(MAHAPURUSHA_YOGAS.map((y) => y.graha))
      .toEqual(['mars', 'mercury', 'jupiter', 'venus', 'saturn']);
    expect(MAHAPURUSHA_YOGAS.map((y) => y.name))
      .toEqual(['Ruchaka', 'Bhadra', 'Hamsa', 'Malavya', 'Sasa']);
    // Never the luminaries — 75.1 lists "Mars and the rest", starting at Mars.
    expect(MAHAPURUSHA_YOGAS.some((y) => y.graha === 'sun' || y.graha === 'moon')).toBe(false);
  });

  it('carries ALL THREE of 75.1’s conditions, not the shipped two', () => {
    for (const r of rules) {
      const kinds = r.when.map((p) => p.k);
      expect(kinds, r.id).toContain('dignity');     // own sign or exaltation
      expect(kinds, r.id).toContain('compound');    // a kendra
      expect(kinds, r.id).toContain('strength');    // balibhih
      expect(r.when, r.id).toHaveLength(3);
    }
    expect(rules).toHaveLength(5);
  });

  it('uses the CORPUS’S threshold for "strong", not a number chosen here', () => {
    for (const y of MAHAPURUSHA_YOGAS) {
      const r = rules.find((x) => x.id.endsWith(y.key))!;
      const strength = r.when.find((p) => p.k === 'strength') as { rupas: number };
      expect(strength.rupas, y.key).toBe(SHADBALA_REQUIRED[y.graha]);
    }
    // And those thresholds really do differ between planets, so this is not a constant.
    const used = new Set(MAHAPURUSHA_YOGAS.map((y) => SHADBALA_REQUIRED[y.graha]));
    expect(used.size).toBeGreaterThan(1);
  });

  it('the strength condition is what the engine is missing, and it costs a third', () => {
    // Recomputed from the population rather than trusted, so the flagged product decision
    // cannot go stale if the generator or the thresholds change.
    const charts = syntheticCharts(20000, 42);
    let full = 0;
    let loose = 0;
    for (const c of charts) {
      if (rules.some((r) => evaluateAll(r.when, c))) full++;
      if (rules.some((r) => evaluateAll(r.when.filter((p) => p.k !== 'strength'), c))) loose++;
    }
    const lost = (loose - full) / loose;
    expect(loose / charts.length * 100).toBeCloseTo(MAHAPURUSHA_STRENGTH_IMPACT.withoutStrengthPct, 0);
    expect(full / charts.length * 100).toBeCloseTo(MAHAPURUSHA_STRENGTH_IMPACT.withStrengthPct, 0);
    expect(lost).toBeCloseTo(MAHAPURUSHA_STRENGTH_IMPACT.shareOfReadingsLost, 1);
    // The condition must actually bite — a no-op would make this a pointless change.
    expect(full).toBeLessThan(loose);
  });

  it('records the divergence WITHOUT changing the product-facing detector', () => {
    expect(MAHAPURUSHA_STRENGTH_CONDITION_MISSING).toContain('balibhih');
    expect(MAHAPURUSHA_STRENGTH_CONDITION_MISSING).toContain('NOT changed unilaterally');
    expect(MAHAPURUSHA_STRENGTH_CONDITION_MISSING).toContain('bphs.04.016/017/022');
  });

  it('attaches no invented meaning to the yogas', () => {
    // Ch 75's own descriptions are refused, so a summary here would have to be made up.
    for (const r of rules) {
      expect(r.effect.summary).toContain('own dignity');
      expect(/face|complexion|chest|teeth|hair|weight|dies|death/i.test(r.effect.summary)).toBe(false);
    }
    expect(CH75_DESCRIPTIONS_REFUSED).toContain('physiognomy');
    expect(CH75_DESCRIPTIONS_REFUSED).toContain('Part 51');
  });

  it('is registered', () => {
    const ids = new Set(allEncodedRules().map((r) => r.id));
    for (const r of rules) expect(ids.has(r.id), r.id).toBe(true);
  });
});

describe('BPHS 76 — the five elements, decided by strength', () => {
  it('assigns the elements the chapter assigns, across all four statements', () => {
    expect(ELEMENT_OF_PLANET['sun']).toBe('fire');
    expect(ELEMENT_OF_PLANET['mars']).toBe('fire');
    expect(ELEMENT_OF_PLANET['mercury']).toBe('earth');
    expect(ELEMENT_OF_PLANET['jupiter']).toBe('ether');
    expect(ELEMENT_OF_PLANET['moon']).toBe('water');
    expect(ELEMENT_OF_PLANET['venus']).toBe('water');
    expect(ELEMENT_OF_PLANET['saturn']).toBe('air');
    // The nodes are unassigned — the chapter never places them.
    expect(ELEMENT_OF_PLANET['rahu']).toBeNull();
    expect(ELEMENT_OF_PLANET['ketu']).toBeNull();
    expect(ELEMENT_MAPPING_IS_STATED_FOUR_TIMES).toContain('four statements');
  });

  it('picks the element whose planets carry the most strength', () => {
    // Sun + Mars heavily weighted -> fire.
    const fiery = dominantElement({ sun: 500, mars: 500, mercury: 100, jupiter: 100, moon: 100, venus: 100, saturn: 100 });
    expect(fiery!.element).toBe('fire');
    expect(fiery!.tied).toEqual(['fire']);
    // Moon + Venus -> water. Same shape, different winner.
    const watery = dominantElement({ sun: 100, mars: 100, mercury: 100, jupiter: 100, moon: 500, venus: 500, saturn: 100 });
    expect(watery!.element).toBe('water');
  });

  it('reports a tie as a tie rather than declaring a winner', () => {
    // 76.2 says effects are felt "in proportion to the intensity", so a hairline is not a verdict.
    const tied = dominantElement({ mercury: 300, jupiter: 300 });
    expect(tied!.tied.sort()).toEqual(['earth', 'ether']);
  });

  it('returns null rather than guessing when no strength is supplied', () => {
    expect(dominantElement({})).toBeNull();
    expect(dominantElement({ rahu: 400, ketu: 400 })).toBeNull();   // unassigned planets only
  });

  it('refuses the temperament-by-appearance descriptions', () => {
    expect(CH76_TEMPERAMENT_DESCRIPTIONS_REFUSED).toContain('physiognomy');
    expect(CH76_TEMPERAMENT_DESCRIPTIONS_REFUSED).toContain('decided by STRENGTH');
  });
});

describe('BPHS 77.1-4 — the gunas, structure only', () => {
  it('groups the planets as the chapter groups them', () => {
    const byGuna = (g: string) => (Object.entries(GUNA_OF_PLANET) as [Graha, string | null][])
      .filter(([, v]) => v === g).map(([k]) => k).sort();
    expect(byGuna('sattva')).toEqual(['jupiter', 'moon', 'sun']);
    expect(byGuna('rajas')).toEqual(['mercury', 'venus']);
    expect(byGuna('tamas')).toEqual(['mars', 'saturn']);
    expect(GUNA_OF_PLANET['rahu']).toBeNull();
  });

  it('reports equal dominance as samya — the chapter’s own word', () => {
    // "when at the time of birth all the planets are of equal dominance the person has a
    // mixture of all the attributes".
    const even = dominantGuna({ sun: 200, moon: 200, jupiter: 200, mercury: 300, venus: 300, mars: 300, saturn: 300 });
    expect(even!.guna).toBe('samya');
    const clear = dominantGuna({ sun: 500, moon: 500, jupiter: 500, mercury: 100, venus: 100, mars: 100, saturn: 100 });
    expect(clear!.guna).toBe('sattva');
  });

  it('says which guna predominates and NOTHING about the person', () => {
    // 77.1-4's own outcomes are "good character", "intelligent" and "stupid". None is carried.
    const r = dominantGuna({ mars: 500, saturn: 500, sun: 100 })!;
    expect(r.guna).toBe('tamas');
    expect(Object.keys(r).sort()).toEqual(['guna', 'virupas']);
    expect(JSON.stringify(r)).not.toMatch(/stupid|character|intelligen/i);
  });

  it('returns null without strength rather than guessing', () => {
    expect(dominantGuna({})).toBeNull();
  });
});

describe('BPHS 77.5-22 — refused in full, and it stays refused', () => {
  it('names every element of what was refused, so nothing is quietly rescued later', () => {
    expect(CH77_CLASS_HIERARCHY_REFUSED).toContain('REFUSED IN FULL');
    expect(CH77_CLASS_HIERARCHY_REFUSED).toContain('despicable');
    expect(CH77_CLASS_HIERARCHY_REFUSED).toContain('77.9');    // occupational sorting
    expect(CH77_CLASS_HIERARCHY_REFUSED).toContain('77.13');   // the marriage rule
    expect(CH77_CLASS_HIERARCHY_REFUSED).toContain('77.20');   // the varna cosmology
    expect(CH77_CLASS_HIERARCHY_REFUSED).toContain('RANKING');
  });

  it('distinguishes this from Part 30’s near-misses', () => {
    // Those were logged as recoverable with a better source. This is not.
    expect(CH77_CLASS_HIERARCHY_REFUSED).toContain('THIS IS NOT A NEAR-MISS');
  });

  it('emits no rule and no class classification anywhere', () => {
    expect(allEncodedRules().filter((r) => r.source.chapter === 77)).toHaveLength(0);
    expect(allEncodedRules().filter((r) => r.source.chapter === 76)).toHaveLength(0);
    // And the only chapter-75 rules are the five formations.
    const ch75 = allEncodedRules().filter((r) => r.source.chapter === 75);
    expect(ch75).toHaveLength(5);
  });
});

describe('Part 46 — the yield', () => {
  it('leads with the reconciliation and is explicit about the refusal’s ground', () => {
    expect(CH75_77_YIELD.note).toContain('balibhih');
    expect(CH75_77_YIELD.note).toContain('contempt, not doctrine');
  });
});
