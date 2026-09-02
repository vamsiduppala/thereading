// BPHS Programme Part 47 — Chapters 78-79.
//
// The test that matters most is `79.9 replaces the commentary rather than confirming it`. A
// thread closed by new evidence is easy to close wrongly — by assuming the root text agrees
// with the commentary it supersedes — and here it does not: BPHS grants Venus an exemption
// Rajan's rule has no counterpart for, so the two disagree on real charts.

import { describe, it, expect } from 'vitest';
import {
  RECTIFICATION_CASCADE, RITU_SUBSTITUTIONS, RITU_SUBSTITUTION_IS_ONE_DIRECTIONAL,
  samvatsaraCandidates, RECTIFICATION_NEEDS_AN_OUTSIDE_FACT, CH78_IS_RECTIFICATION_NOT_PRASHNA,
  YUDDHA_ORB_DEGREES, grahaYuddhaVictor, YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL,
  STELLIUM_STRENGTH_NOT_ENCODED, ASCETIC_ORDER_BY_STRONGEST,
  ASCETIC_ORDERS_ARE_DATA_NOT_A_READING, asceticYogaRules, CH79_PROXY_RULES_WITHHELD,
  CH79_VARGA_CLAUSE_GAP, CH79_REMAINING_CLAUSES_NOT_ENCODED, CH78_79_YIELD,
  YUDDHA_PLANETS, YUDDHA_WINNER_NOTE, evaluateAll, syntheticCharts, allEncodedRules,
} from '../src/index.js';
import type { ChartFacts } from '../src/index.js';

// ── 78: rectification ───────────────────────────────────────────────────────
describe('BPHS 78 — birth-time rectification, not prashna', () => {
  it('records the six-step cascade in the chapter’s own order', () => {
    expect(RECTIFICATION_CASCADE).toHaveLength(6);
    expect(RECTIFICATION_CASCADE[0]!.recovers).toContain('samvatsara');
    expect(RECTIFICATION_CASCADE.at(-1)!.recovers).toContain('ishta kala');
    // Coarse to fine, and every step cites its verse.
    for (const s of RECTIFICATION_CASCADE) expect(s.verse.length).toBeGreaterThan(0);
  });

  it('is a VARGA cascade — which is why it is mostly wiring', () => {
    const text = RECTIFICATION_CASCADE.map((s) => s.from).join(' ');
    expect(text).toContain('DWADASAMSA');
    expect(text).toContain('HORA');
    expect(text).toContain('DREKKANA');
    expect(CH78_IS_RECTIFICATION_NOT_PRASHNA).toContain('It is not');
    expect(CH78_IS_RECTIFICATION_NOT_PRASHNA).toContain('§11.6');
  });

  it('gives 78.7’s substitutions, and only in one direction', () => {
    expect(RITU_SUBSTITUTIONS['mars']).toBe('mercury');
    expect(RITU_SUBSTITUTIONS['moon']).toBe('venus');
    expect(RITU_SUBSTITUTIONS['jupiter']).toBe('saturn');
    expect(Object.keys(RITU_SUBSTITUTIONS)).toHaveLength(3);
    expect(RITU_SUBSTITUTION_IS_ONE_DIRECTIONAL).toContain('never re-reads the ayana');
  });

  it('returns a 12-year LADDER without an age, and picks from it with one', () => {
    // Jupiter at query in rasi 5, at birth in rasi 2 -> base 3, then 15, 27, 39…
    const open = samvatsaraCandidates(5, 2);
    expect(open.chosen).toBeNull();
    expect(open.years.slice(0, 3)).toEqual([3, 15, 27]);
    // 78.10-12: the querent's approximate age resolves it.
    expect(samvatsaraCandidates(5, 2, 28).chosen).toBe(27);
    expect(samvatsaraCandidates(5, 2, 14).chosen).toBe(15);
  });

  it('is explicit that the method needs an outside fact', () => {
    expect(RECTIFICATION_NEEDS_AN_OUTSIDE_FACT).toContain('APPROXIMATE AGE');
    expect(RECTIFICATION_NEEDS_AN_OUTSIDE_FACT).toContain('not recover a birth time from');
  });
});

// ── 79.9: the thread that closes ────────────────────────────────────────────
describe('BPHS 79.9 — the graha yuddha winner, in root text', () => {
  it('confirms the participants the engine already shipped', () => {
    // 79.9 names Mars, Mercury, Jupiter, Venus and Saturn — a second chapter agreeing with
    // 27.20's list, which is what makes it a confirmation rather than a new claim.
    expect([...YUDDHA_PLANETS].sort())
      .toEqual(['jupiter', 'mars', 'mercury', 'saturn', 'venus']);
  });

  it('supplies the orb 27.20 never gave', () => {
    expect(YUDDHA_ORB_DEGREES).toBe(1);
    expect(YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL).toContain('within one degree');
  });

  it('makes Venus the conqueror on either side', () => {
    // "Venus is the conqueror whether he is in North or South."
    const north = grahaYuddhaVictor({ graha: 'venus', latitude: 1.2 }, { graha: 'saturn', latitude: 2.0 })!;
    expect(north.victor).toBe('venus');
    expect(north.basis).toBe('venus-exempt');
    const south = grahaYuddhaVictor({ graha: 'venus', latitude: -2.0 }, { graha: 'mars', latitude: 1.0 })!;
    expect(south.victor).toBe('venus');
  });

  it('gives the northern party the victory among the other four', () => {
    const r = grahaYuddhaVictor({ graha: 'mars', latitude: 1.5 }, { graha: 'saturn', latitude: -0.4 })!;
    expect(r.victor).toBe('mars');
    expect(r.vanquished).toBe('saturn');
    expect(r.basis).toBe('northern');
  });

  it('stays silent where the verse says nothing — equal latitudes', () => {
    expect(grahaYuddhaVictor({ graha: 'mars', latitude: 1 }, { graha: 'saturn', latitude: 1 }))
      .toBeNull();
  });

  it('REPLACES the commentary rather than confirming it', () => {
    // Rajan compares latitude MAGNITUDES; BPHS asks which side of the ecliptic, and exempts
    // Venus. Here is a chart where the two rules give opposite answers.
    const venusSouth = { graha: 'venus' as const, latitude: -2.5 };
    const saturnNorth = { graha: 'saturn' as const, latitude: 1.0 };
    // BPHS 79.9: Venus wins regardless.
    expect(grahaYuddhaVictor(venusSouth, saturnNorth)!.victor).toBe('venus');
    // Rajan's rule (higher latitude magnitude) would also pick Venus here, so use a case where
    // it does not: Venus with the SMALLER magnitude, still south.
    const venusSmall = { graha: 'venus' as const, latitude: -0.2 };
    const marsBig = { graha: 'mars' as const, latitude: 3.0 };
    expect(grahaYuddhaVictor(venusSmall, marsBig)!.victor).toBe('venus');   // BPHS
    expect(Math.abs(marsBig.latitude)).toBeGreaterThan(Math.abs(venusSmall.latitude)); // Rajan picks Mars
    expect(YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL).toContain('REPLACES the commentary');
  });

  it('leaves Part 27’s own note in place as the record of what was refused', () => {
    // The history matters: the note says why the commentary was not used, and 79.9 is why it
    // no longer has to be.
    expect(YUDDHA_WINNER_NOTE).toContain('Commentary rather than root text');
    expect(YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL).toContain('CLOSES a thread open since Part 6');
  });
});

// ── 79: the ascetic yogas ───────────────────────────────────────────────────
describe('BPHS 79.2-3 — the stellium yoga, and what was NOT shipped with it', () => {
  const rules = asceticYogaRules();

  it('emits exactly one rule — the stellium', () => {
    expect(rules).toHaveLength(1);
    expect(rules[0]!.id).toBe('bphs.79.002.stellium');
    expect(rules[0]!.when[0]!.k).toBe('stellium');
  });

  it('fires on four or more sharing a sign, and not on three', () => {
    const chart = (signs: Record<string, number>): ChartFacts => {
      const planets: Record<string, unknown> = {};
      for (const [g, sign] of Object.entries(signs)) {
        planets[g] = { sign, house: (sign % 12) + 1, longitude: sign * 30 + 5, dignity: 'neutral' };
      }
      return { lagnaSign: 0, planets } as unknown as ChartFacts;
    };
    const four = chart({ sun: 3, moon: 3, mars: 3, mercury: 3, jupiter: 8, venus: 9, saturn: 10 });
    expect(evaluateAll(rules[0]!.when, four)).toBe(true);
    const three = chart({ sun: 3, moon: 3, mars: 3, mercury: 6, jupiter: 8, venus: 9, saturn: 10 });
    expect(evaluateAll(rules[0]!.when, three)).toBe(false);
  });

  it('measures at a rate a real yoga should have', () => {
    // 7 planets into 12 signs: P(some sign holds >=4) is a shade under 2%.
    const charts = syntheticCharts(20000, 77);
    const hits = charts.filter((c) => evaluateAll(rules[0]!.when, c)).length;
    const rate = hits / charts.length;
    expect(rate).toBeGreaterThan(0.005);
    expect(rate).toBeLessThan(0.04);
  });

  it('says that the encoded rule is BROADER than the verse', () => {
    expect(STELLIUM_STRENGTH_NOT_ENCODED).toContain('BROADER than the verse');
    expect(rules[0]!.note).toContain('possessed of strength');
  });

  it('withholds 79.8 and 79.15 rather than shipping proxies', () => {
    // Both would need a clause dropped, leaving rules that fire on 14.5% and 8.3% of charts.
    expect(rules.some((r) => r.id.includes('moon-saturn'))).toBe(false);
    expect(rules.some((r) => r.id.includes('saturn-ninth'))).toBe(false);
    expect(CH79_PROXY_RULES_WITHHELD).toContain('14.5%');
    expect(CH79_PROXY_RULES_WITHHELD).toContain('placement wearing a yoga’s name');
    expect(CH79_PROXY_RULES_WITHHELD).toContain('Part 22');
  });

  it('records the varga-frame gap as a THIRD standing DSL gap', () => {
    expect(CH79_VARGA_CLAUSE_GAP).toContain('third standing one');
    expect(CH79_VARGA_CLAUSE_GAP).toContain('dispositor');
  });

  it('accounts for every clause it did not encode', () => {
    for (const v of ['79.4-5', '79.6-7', '79.10', '79.13']) {
      expect(CH79_REMAINING_CLAUSES_NOT_ENCODED, v).toContain(v);
    }
  });

  it('is registered', () => {
    const ids = new Set(allEncodedRules().map((r) => r.id));
    for (const r of rules) expect(ids.has(r.id), r.id).toBe(true);
    expect(allEncodedRules().filter((r) => r.source.chapter === 79)).toHaveLength(1);
  });
});

describe('BPHS 79 — renunciation is a path, not a misfortune', () => {
  it('does not score the ascetic yoga as adverse', () => {
    // 79.14's highest case is "a holy illustrious founder of a system of philosophy". An
    // engine scoring "gives up their home" as bad would import a reading the source never makes.
    for (const r of asceticYogaRules()) expect(r.effect.valence).toBeGreaterThanOrEqual(0);
  });

  it('keeps the named orders as data and asserts none of them', () => {
    expect(ASCETIC_ORDER_BY_STRONGEST['saturn']).toContain('Nirgrantha');
    expect(ASCETIC_ORDER_BY_STRONGEST['rahu']).toBe('');
    for (const r of asceticYogaRules()) {
      expect(/Nirgrantha|Kapali|Tapasvi|naked/i.test(r.effect.summary)).toBe(false);
    }
    expect(ASCETIC_ORDERS_ARE_DATA_NOT_A_READING).toContain('claims far more about a life');
  });
});

describe('Part 47 — the yield', () => {
  it('leads with the closed thread', () => {
    expect(CH78_79_YIELD.note).toContain('ROOT TEXT');
    expect(CH78_79_YIELD.note).toContain('closing a thread open since Part 6');
  });
});
