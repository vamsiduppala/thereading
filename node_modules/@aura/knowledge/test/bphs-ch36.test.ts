// BPHS Programme Part 31 — Chapter 36: Many Other Yogas.
//
// The first chapter since Part 27 to produce Rule records in quantity, and the highest-arity
// set in the corpus. Three DSL extensions fell out of it, all forced by the alternative
// being an approximation — a rule that tests the wrong planet is worse than no rule.

import { describe, it, expect } from 'vitest';
import {
  CH36_YOGAS, ch36YogaRules, CH36_NO_QUANTIFIER, YOGA_NAME_IS_NOT_A_VERDICT,
  CH36_VARIANT_TRADITIONS, CH36_NOT_ENCODABLE, CH36_YIELD, CH36_AMALA_MOON_IMPOSSIBILITY,
  SOURCE_STATED_ARBITRATION,
  allEncodedRules, arity, fired, evaluate,
  type ChartFacts, type SignIndex,
} from '../src/index.js';

const chart = (over: Record<string, unknown> = {}, lagnaSign = 0): ChartFacts => ({
  lagnaSign,
  planets: {
    sun: { sign: 0, house: 1, longitude: 5 },
    moon: { sign: 3, house: 4, longitude: 100 },
    mars: { sign: 2, house: 3, longitude: 75 },
    mercury: { sign: 3, house: 4, longitude: 95 },
    jupiter: { sign: 4, house: 5, longitude: 130 },
    venus: { sign: 5, house: 6, longitude: 160 },
    saturn: { sign: 6, house: 7, longitude: 200 },
    rahu: { sign: 7, house: 8, longitude: 220 },
    ketu: { sign: 1, house: 2, longitude: 40 },
    ...over,
  },
} as unknown as ChartFacts);

// ── The three DSL extensions ─────────────────────────────────────────────────
describe('Part 31 retrofits — three extensions, all forced by the alternative being wrong', () => {
  it('lordsConjunct takes a NAMED planet as a party (Kahala, 36.9-10)', () => {
    // Aries lagna: the 4th is Cancer, so the Moon is the 4th lord. Put Jupiter with her.
    const f = chart({ jupiter: { sign: 3, house: 4, longitude: 95 } });
    expect(evaluate({ k: 'lordsConjunct', parties: ['jupiter', 4] }, f)).toBe(true);
    expect(evaluate({ k: 'lordsConjunct', parties: ['saturn', 4] }, f)).toBe(false);
  });

  it('refuses when the named planet IS the lord — one planet is not a conjunction', () => {
    // Aries lagna: the Moon rules the 4th. "The Moon with the 4th lord" is the Moon alone.
    expect(evaluate({ k: 'lordsConjunct', parties: ['moon', 4] }, chart())).toBe(false);
  });

  it('house-and-house still works exactly as before the widening', () => {
    const f = chart({ venus: { sign: 3, house: 4, longitude: 95 } });
    // Aries lagna: Moon rules the 4th, Venus the 2nd and 7th. Both now in Cancer.
    expect(evaluate({ k: 'lordsConjunct', parties: [4, 7] }, f)).toBe(true);
  });

  it('placement counts from a house LORD (Trimurthi, 36.35-36)', () => {
    // Aries lagna: the 2nd is Taurus, so Venus is the 2nd lord, sitting in sign 5. The 2nd
    // from Venus is sign 6, where Saturn is.
    expect(evaluate({ k: 'placement', graha: 'saturn', house: 2, fromLordOf: 2 }, chart())).toBe(true);
    expect(evaluate({ k: 'placement', graha: 'saturn', house: 3, fromLordOf: 2 }, chart())).toBe(false);
  });

  it('dignity and strength take a house lord, not just a named planet', () => {
    const f = chart();
    (f.planets.mars as { dignity?: string }).dignity = 'exalted';
    // Aries lagna: Mars is the ascendant lord. "The ascendant lord is exalted" must be
    // sayable — the first draft hardcoded Mars, which is right for Aries and wrong for the
    // other eleven ascendants.
    expect(evaluate({ k: 'dignity', graha: 1, is: ['exalted'] }, f)).toBe(true);
    expect(evaluate({ k: 'dignity', graha: 'mars', is: ['exalted'] }, f)).toBe(true);
    // Taurus lagna: the ascendant lord is Venus, and the same predicate must now follow it.
    const g = chart({}, 1);
    (g.planets.mars as { dignity?: string }).dignity = 'exalted';
    expect(evaluate({ k: 'dignity', graha: 1, is: ['exalted'] }, g)).toBe(false);
  });

  it('the lagna predicate states an ascendant restriction instead of smuggling it in', () => {
    // Kusuma applies only to a fixed-sign ascendant. The first draft encoded that as "the
    // Sun in sign X", which tests something else entirely.
    expect(evaluate({ k: 'lagna', signs: [1, 4, 7, 10] }, chart({}, 4))).toBe(true);
    expect(evaluate({ k: 'lagna', signs: [1, 4, 7, 10] }, chart({}, 0))).toBe(false);
  });
});

// ── The yoga table ───────────────────────────────────────────────────────────
describe('BPHS 36 — the yoga table', () => {
  it('carries every yoga with a formation, and every refusal with a reason', () => {
    expect(CH36_YOGAS.length).toBeGreaterThanOrEqual(20);
    for (const y of CH36_YOGAS) {
      expect(y.formation.length, y.name).toBeGreaterThan(20);
      if (y.surfaced) expect(y.summary, y.name).toBeTruthy();
      else expect(y.withheld!.length, y.name).toBeGreaterThan(20);
    }
  });

  it('refuses Ashubha’s reading while keeping its formation detectable', () => {
    const a = CH36_YOGAS.find((y) => y.name === 'Ashubha')!;
    expect(a.surfaced).toBe(false);
    expect(a.withheld).toContain('character verdict');
  });

  it('records that Amala’s effects do NOT include wealth, though other classics add it', () => {
    // An absent claim is as much a fact about the source as a present one.
    const amala = CH36_YOGAS.find((y) => y.name === 'Amala')!;
    expect(amala.excluded).toContain('NOT among the effects');
    expect(amala.summary).not.toMatch(/wealth|rich|money/i);
  });

  it('no surfaced summary carries kingship, longevity, medical or moral language', () => {
    for (const y of CH36_YOGAS.filter((x) => x.surfaced)) {
      expect(y.summary!, y.name)
        .not.toMatch(/\b(king|kingly|kingdom|royal|long-lived|longevity|lifespan|disease[ds]?|sinful|cunning)\b/i);
    }
  });
});

// ── The generated rules ──────────────────────────────────────────────────────
describe('BPHS 36 — the generated rules', () => {
  const rules = ch36YogaRules();

  it('generates a substantial, uniquely-identified set', () => {
    expect(rules.length).toBeGreaterThan(150);
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
    for (const r of rules) expect(r.source.chapter).toBe(36);
  });

  it('is the highest-arity set in the corpus', () => {
    const maxHere = Math.max(...rules.map((r) => arity(r)));
    const maxElsewhere = Math.max(
      ...allEncodedRules().filter((r) => !r.id.startsWith('bphs.36')).map((r) => arity(r)),
    );
    expect(maxHere).toBeGreaterThanOrEqual(maxElsewhere);
    expect(maxHere).toBeGreaterThanOrEqual(4);
  });

  it('carries Gaja Kesari’s three-part exclusion as `unless`, not as prose', () => {
    const gk = rules.filter((r) => r.id.includes('gaja-kesari'));
    expect(gk.length).toBeGreaterThan(0);
    for (const r of gk) {
      expect(r.unless, r.id).toBeDefined();
      expect(r.unless!.length, r.id).toBe(2);
    }
  });

  it('Gaja Kesari is cancelled by a debilitated Jupiter', () => {
    const gk = rules.filter((r) => r.id.includes('gaja-kesari'));
    const good = chart({ jupiter: { sign: 3, house: 4, longitude: 95, dignity: 'exalted' } });
    const bad = chart({ jupiter: { sign: 3, house: 4, longitude: 95, dignity: 'debilitated' } });
    expect(fired(gk, good).length).toBeGreaterThan(0);
    expect(fired(gk, bad)).toHaveLength(0);
  });

  it('Amala never generates the Moon in the 10th from the Moon', () => {
    // A planet is always in the 1st from itself, so that rule could never fire. The
    // calibration guard caught it; this stops it coming back.
    const amala = rules.filter((r) => r.id.includes('amala'));
    for (const r of amala) {
      const p = r.when[0] as { graha?: string; from?: string };
      expect(!(p.graha === 'moon' && p.from === 'moon'), r.id).toBe(true);
    }
    expect(CH36_AMALA_MOON_IMPOSSIBILITY).toContain('genuinely impossible');
  });

  it('Amala is cancelled by a malefic in the same house', () => {
    // "EXCLUSIVELY a benefic in the 10th" — the verse's own word.
    const amala = rules.filter((r) => r.id.includes('amala'));
    for (const r of amala) expect(r.unless, r.id).toBeDefined();
    const clean = chart({ jupiter: { sign: 9, house: 10, longitude: 280 } });
    const spoiled = chart({
      jupiter: { sign: 9, house: 10, longitude: 280 },
      saturn: { sign: 9, house: 10, longitude: 285 },
    });
    expect(fired(amala, clean).length).toBeGreaterThan(0);
    expect(fired(amala, spoiled)).toHaveLength(0);
  });

  it('Kusuma carries its fixed-ascendant precondition', () => {
    const kusuma = rules.filter((r) => r.id.includes('kusuma'));
    for (const r of kusuma) {
      expect(r.when.some((p) => p.k === 'lagna'), r.id).toBe(true);
    }
  });

  it('every alternative form of a yoga shares one effect id', () => {
    // Alternatives, not independent evidence — arbitrate already knows the difference.
    for (const name of ['gaja-kesari', 'amala', 'kusuma']) {
      const ids = new Set(rules.filter((r) => r.id.includes(name)).map((r) => r.effect.id));
      expect(ids.size, name).toBe(1);
    }
  });

  it('records why a benefic expands into four rules rather than one quantified rule', () => {
    expect(CH36_NO_QUANTIFIER).toContain('no "some benefic" quantifier');
    expect(CH36_NO_QUANTIFIER).toContain('arity is counted, never authored');
  });

  it('is registered', () => {
    const ids = new Set(allEncodedRules().map((r) => r.id));
    for (const r of rules) expect(ids.has(r.id), r.id).toBe(true);
  });
});

// ── 36.1-2's Notes: the ninth arbitration instruction ────────────────────────
describe('BPHS 36.1-2 — a yoga’s name is not its verdict', () => {
  it('is recorded as the ninth source-stated arbitration instruction', () => {
    // Position, not length — Part 30 added the eighth and this part the ninth, and the
    // register will keep growing. A pinned length just makes the next part edit this test.
    expect(SOURCE_STATED_ARBITRATION[7]).toContain('35.16-17');
    expect(SOURCE_STATED_ARBITRATION[8]).toContain('36.1-2');
    expect(new Set(SOURCE_STATED_ARBITRATION).size).toBe(SOURCE_STATED_ARBITRATION.length);
  });

  it('is the first that is explicitly general rather than governing one doctrine', () => {
    expect(YOGA_NAME_IS_NOT_A_VERDICT).toContain('explicitly');
    expect(YOGA_NAME_IS_NOT_A_VERDICT).toContain('GENERAL');
    expect(YOGA_NAME_IS_NOT_A_VERDICT).toContain('every yoga, good or bad');
  });

  it('is why the rules carry weights rather than verdicts', () => {
    expect(YOGA_NAME_IS_NOT_A_VERDICT).toContain('ranks rather than concludes');
    for (const r of ch36YogaRules()) {
      expect(r.weight, r.id).toBeGreaterThan(0);
      expect(r.weight, r.id).toBeLessThanOrEqual(1);
    }
  });
});

// ── Audit ────────────────────────────────────────────────────────────────────
describe('BPHS 36 — the audit trail', () => {
  it('records the competing definitions rather than silently picking one', () => {
    expect(CH36_VARIANT_TRADITIONS).toContain('NINE');
    expect(CH36_VARIANT_TRADITIONS).toContain('neither our error nor theirs');
  });

  it('names what it could not encode, and why', () => {
    expect(CH36_NOT_ENCODABLE).toHaveLength(3);
    const joined = CH36_NOT_ENCODABLE.join(' ');
    expect(joined).toContain('Kalpadruma');
    expect(joined).toContain('FOUR-DEEP dispositor chain');
    // 36.38-39 is a wiring job, not an extraction one — Part 4 already computes the names.
    expect(joined).toContain('WIRING job');
  });

  it('is honest about the yield', () => {
    expect(CH36_YIELD.chapter).toBe(36);
    expect(CH36_YIELD.note).toContain('highest-arity set');
  });
});
