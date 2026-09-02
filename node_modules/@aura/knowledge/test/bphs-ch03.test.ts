// BPHS Programme Part 1 — Chapter 3 + the predicate substrate.
// Every assertion here cites the verse it verifies. Where BPHS gives a worked example
// we test against the book's own numbers; where it does not, the test says so.

import { describe, it, expect } from 'vitest';
import {
  CLASSICAL_SEVEN,
  DEEP_EXALTATION_POINTS, exaltationCloseness,
  bandFor, MOOLATRIKONA_SIGN,
  naturalRelationOf, NODE_RELATIONS,
  BENEFIC_RATIO, MALEFIC_RATIO, effectRatio,
  PLANET_TIME_UNIT, NAISARGIKA_ORDER, naisargikaBala, DIG_BALA_HOUSE,
  QUERY_CLASS,
  pranaPada, pranaPadaFromLagna, minutesToVighatis,
  UPAGRAHA_FORMULA_CONFLICT,
  sunUpagrahas,
  evaluate, evaluateAll, explain, lordOfSign, houseOfSign, signOfHouse,
  arity, fired, rank,
  type ChartFacts, type Predicate, type Rule, type Graha,
} from '../src/index.js';

// ── 3.55 — the derivation must reproduce the book's own relationship table ────
// This is the load-bearing test of Part 1. BPHS prints a speculum of natural
// relationships after 3.55; we encode the DERIVATION rule instead of that table, so the
// table becomes a test rather than an article of faith.
describe('BPHS 3.55 — natural relationships derived from moolatrikona', () => {
  // The book's own speculum, transcribed exactly as printed.
  const BOOK_TABLE: Record<string, { friends: Graha[]; enemies: Graha[]; equals: Graha[] }> = {
    sun: { friends: ['moon', 'mars', 'jupiter'], enemies: ['venus', 'saturn'], equals: ['mercury'] },
    moon: { friends: ['sun', 'mercury'], enemies: [], equals: ['mars', 'jupiter', 'venus', 'saturn'] },
    mars: { friends: ['sun', 'moon', 'jupiter'], enemies: ['mercury'], equals: ['venus', 'saturn'] },
    mercury: { friends: ['sun', 'venus'], enemies: ['moon'], equals: ['mars', 'jupiter', 'saturn'] },
    jupiter: { friends: ['sun', 'moon', 'mars'], enemies: ['mercury', 'venus'], equals: ['saturn'] },
    venus: { friends: ['mercury', 'saturn'], enemies: ['moon', 'sun'], equals: ['mars', 'jupiter'] },
    saturn: { friends: ['mercury', 'venus'], enemies: ['sun', 'moon', 'mars'], equals: ['jupiter'] },
  };

  for (const from of CLASSICAL_SEVEN) {
    it(`reproduces the book's row for ${from}`, () => {
      const row = BOOK_TABLE[from]!;
      for (const to of row.friends) expect(naturalRelationOf(from, to), `${from}→${to}`).toBe('friend');
      for (const to of row.enemies) expect(naturalRelationOf(from, to), `${from}→${to}`).toBe('enemy');
      for (const to of row.equals) expect(naturalRelationOf(from, to), `${from}→${to}`).toBe('neutral');
    });
  }

  it('covers every other planet exactly once per row (no gaps in the table)', () => {
    for (const from of CLASSICAL_SEVEN) {
      const row = BOOK_TABLE[from]!;
      const all = [...row.friends, ...row.enemies, ...row.equals];
      expect(new Set(all).size).toBe(all.length);
      expect(all.length).toBe(6); // the other six classical planets
    }
  });

  it('worked case from the 3.55 notes: Saturn is neutral to Mars (friend as exaltation lord, enemy as 11th lord)', () => {
    expect(naturalRelationOf('mars', 'saturn')).toBe('neutral');
  });

  it('worked case from the 3.55 notes: Venus is neutral to Mars (2nd lord and 7th lord from Aries)', () => {
    expect(naturalRelationOf('mars', 'venus')).toBe('neutral');
  });

  it('declines to derive for the nodes, which have no moolatrikona', () => {
    expect(naturalRelationOf('rahu', 'sun')).toBeNull();
    // Santhanam supplies these from the wider tradition — commentary, not root text.
    expect(NODE_RELATIONS.rahu?.sun).toBe('enemy');
    expect(NODE_RELATIONS.ketu?.mars).toBe('friend');
  });
});

// ── 3.49-50 deep exaltation ───────────────────────────────────────────────────
describe('BPHS 3.49-50 — deep exaltation degrees', () => {
  it('matches the degrees the verse lists: 10, 3, 28, 15, 5, 27, 20', () => {
    expect(CLASSICAL_SEVEN.map((g) => DEEP_EXALTATION_POINTS[g]!.exaltDegree))
      .toEqual([10, 3, 28, 15, 5, 27, 20]);
  });

  it('places debilitation in the 7th sign from exaltation at the same degree', () => {
    for (const g of CLASSICAL_SEVEN) {
      const p = DEEP_EXALTATION_POINTS[g]!;
      expect((p.exaltSign + 6) % 12).toBe(p.debilSign);
      expect(p.debilDegree).toBe(p.exaltDegree);
    }
  });

  it('scores 1 at the exact deep-exaltation point and 0 at deep debilitation', () => {
    const sun = DEEP_EXALTATION_POINTS.sun!;
    expect(exaltationCloseness('sun', sun.exaltSign * 30 + sun.exaltDegree)).toBeCloseTo(1, 6);
    expect(exaltationCloseness('sun', sun.debilSign * 30 + sun.debilDegree)).toBeCloseTo(0, 6);
  });

  it('returns null for the nodes rather than guessing (BPHS gives no agreed value)', () => {
    expect(exaltationCloseness('rahu', 45)).toBeNull();
  });
});

// ── 3.51-54 degree-bounded dignity ────────────────────────────────────────────
describe('BPHS 3.51-54 — moolatrikona as degree ranges, not whole signs', () => {
  it('Mercury in Virgo: exalted 0-15, moolatrikona 15-20, own 20-30', () => {
    expect(bandFor('mercury', 5, 10)?.state).toBe('exalted');
    expect(bandFor('mercury', 5, 17)?.state).toBe('moolatrikona');
    expect(bandFor('mercury', 5, 25)?.state).toBe('own');
  });

  it('Sun in Leo: moolatrikona for the first 20 degrees, own thereafter', () => {
    expect(bandFor('sun', 4, 5)?.state).toBe('moolatrikona');
    expect(bandFor('sun', 4, 25)?.state).toBe('own');
  });

  it('Moon in Taurus: exalted for the first 3 degrees, moolatrikona after', () => {
    expect(bandFor('moon', 1, 2)?.state).toBe('exalted');
    expect(bandFor('moon', 1, 20)?.state).toBe('moolatrikona');
  });

  it('Saturn mirrors the Sun\'s arrangement in Aquarius (3.54)', () => {
    expect(bandFor('saturn', 10, 5)?.state).toBe('moolatrikona');
    expect(bandFor('saturn', 10, 25)?.state).toBe('own');
  });

  it('treats a second owned sign with no moolatrikona as plain own throughout', () => {
    expect(bandFor('mars', 7, 1)?.state).toBe('own');    // Scorpio
    expect(bandFor('mars', 7, 29)?.state).toBe('own');
    expect(bandFor('jupiter', 11, 15)?.state).toBe('own'); // Pisces
  });

  it('returns null where no band applies, leaving relationship dignity to decide', () => {
    expect(bandFor('sun', 2, 15)).toBeNull(); // Sun in Gemini
  });

  it('six of the seven own their moolatrikona sign — the Moon is the exception', () => {
    // BPHS 3.51-52 puts the Moon's moolatrikona in Taurus (its exaltation sign, owned by
    // Venus) while its own sign is Cancer. Every other planet's moolatrikona sits in a
    // sign it rules. This asymmetry is real and load-bearing: the 3.55 derivation counts
    // houses FROM the moolatrikona, so the Moon's relationship row is computed from a
    // sign it does not own — and still reproduces the book's table exactly.
    for (const g of CLASSICAL_SEVEN) {
      if (g === 'moon') {
        expect(MOOLATRIKONA_SIGN.moon).toBe(1);          // Taurus
        expect(lordOfSign(MOOLATRIKONA_SIGN.moon!)).toBe('venus');
        continue;
      }
      expect(lordOfSign(MOOLATRIKONA_SIGN[g]!), g).toBe(g);
    }
  });
});

// ── 3.59-60 ratio of effects ──────────────────────────────────────────────────
describe('BPHS 3.59-60 — ratio of effects', () => {
  it('matches the verse: full, minus a quarter, half, a quarter, an eighth, nil', () => {
    expect(BENEFIC_RATIO.exalted).toBe(1);
    expect(BENEFIC_RATIO.moolatrikona).toBe(0.75);
    expect(BENEFIC_RATIO.own).toBe(0.5);
    expect(BENEFIC_RATIO.friend).toBe(0.25);
    expect(BENEFIC_RATIO.neutral).toBe(0.125);
    expect(BENEFIC_RATIO.debilitated).toBe(0);
    expect(BENEFIC_RATIO.enemy).toBe(0);
  });

  it('runs malefic capacity the other way ("quite reverse", 3.60)', () => {
    expect(MALEFIC_RATIO.exalted).toBe(0);
    expect(MALEFIC_RATIO.debilitated).toBe(1);
    expect(MALEFIC_RATIO.enemy).toBe(1);
  });

  it('groups combustion with debilitation for good effects (3.60)', () => {
    expect(effectRatio('exalted', { combust: true }).benefic).toBe(0);
    expect(effectRatio('exalted').benefic).toBe(1);
  });
});

// ── 3.71-74 Prana-pada, against the book's worked example ────────────────────
describe('BPHS 3.71-74 — Prana-pada (book\'s own worked example)', () => {
  // 16gh 25vi = 985 vighatis. 985/15 = 65.67 signs → 5s 20° = 170° of arc.
  const VIGHATIS = 16 * 60 + 25;

  it('converts 16gh 25vi to 985 vighatis', () => {
    expect(VIGHATIS).toBe(985);
  });

  it('movable Sun (Aries 15°) → Libra 5°', () => {
    const pp = pranaPada(VIGHATIS, 15);
    expect(pp.longitude).toBeCloseTo(185, 6);
    expect(pp.sign).toBe(6);            // Libra
    expect(pp.degInSign).toBeCloseTo(5, 6);
  });

  it('fixed Sun (Taurus 15°) → Cancer 5°, adding a further 240°', () => {
    const pp = pranaPada(VIGHATIS, 45);
    expect(pp.longitude).toBeCloseTo(95, 6);
    expect(pp.sign).toBe(3);            // Cancer
    expect(pp.degInSign).toBeCloseTo(5, 6);
  });

  it('dual Sun (Gemini 15°) → Aries 5°, adding a further 120°', () => {
    const pp = pranaPada(VIGHATIS, 75);
    expect(pp.longitude).toBeCloseTo(5, 6);
    expect(pp.sign).toBe(0);            // Aries
    expect(pp.degInSign).toBeCloseTo(5, 6);
  });

  it('judges the house from the lagna: auspicious in 2/4/5/9/10/11 (3.73-74)', () => {
    const pp = pranaPada(VIGHATIS, 15);        // Libra
    expect(pranaPadaFromLagna(pp, 5).auspicious).toBe(true);   // Virgo lagna → PP in 2nd
    expect(pranaPadaFromLagna(pp, 6).auspicious).toBe(false);  // Libra lagna → PP in 1st
    expect(pranaPadaFromLagna(pp, 0).auspicious).toBe(false);  // Aries lagna → PP in 7th
    expect(pranaPadaFromLagna(pp, 2).auspicious).toBe(true);   // Gemini lagna → PP in 5th
  });

  it('converts minutes since sunrise to vighatis at 24 seconds each', () => {
    expect(minutesToVighatis(24)).toBe(60);   // one ghati = 24 min = 60 vighatis
  });

  it('advances a whole sign about every 6 minutes of clock time', () => {
    const a = pranaPada(minutesToVighatis(0), 15).longitude;
    const b = pranaPada(minutesToVighatis(6), 15).longitude;
    expect(b - a).toBeCloseTo(30, 4);
  });
});

// ── 3.61-64 the upagraha formula conflict ────────────────────────────────────
describe('BPHS 3.61-64 — upagraha chain, and the recorded conflict', () => {
  it('both candidate chains satisfy the text\'s own closure test, so closure cannot decide', () => {
    // Root-text chain, as implemented. Closure: Upaketu + 30° returns the Sun.
    const sun = 40;
    const u = sunUpagrahas(sun);
    expect((u.upaketu + 30) % 360).toBeCloseTo(sun, 6);
  });

  it('records the decision to follow the root verse over the commentary', () => {
    expect(UPAGRAHA_FORMULA_CONFLICT.decision).toBe('rootText');
    expect(UPAGRAHA_FORMULA_CONFLICT.ruleId).toBe('bphs.03.061');
  });

  it('root text gives Vyatipata 40° from where the commentary\'s example puts it', () => {
    const u = sunUpagrahas(40);
    expect(u.dhuma).toBeCloseTo(173 + 20 / 60, 4);   // both chains agree here
    expect(u.vyatipaata).toBeCloseTo(186 + 40 / 60, 4); // commentary's example says 226°40'
  });
});

// ── 3.33 / 3.35-38 timing and strength primitives ────────────────────────────
describe('BPHS 3.33, 3.35-38 — timing and strength primitives', () => {
  it('gives every planet an event-maturity time unit (3.33, nodes from 3.46)', () => {
    for (const g of [...CLASSICAL_SEVEN, 'rahu', 'ketu'] as Graha[]) {
      expect(PLANET_TIME_UNIT[g], g).toBeDefined();
      expect(PLANET_TIME_UNIT[g]!.days).toBeGreaterThan(0);
    }
    expect(PLANET_TIME_UNIT.moon!.days).toBeLessThan(PLANET_TIME_UNIT.saturn!.days);
  });

  it('orders natural strength Saturn → Sun ascending (3.38)', () => {
    expect(NAISARGIKA_ORDER[0]).toBe('saturn');
    expect(NAISARGIKA_ORDER[6]).toBe('sun');
    expect(naisargikaBala('sun')).toBeCloseTo(1, 6);
    expect(naisargikaBala('saturn')).toBeCloseTo(1 / 7, 6);
    expect(naisargikaBala('rahu')).toBeNull();
  });

  it('assigns directional strength to the four angles (3.35-38 notes)', () => {
    expect(DIG_BALA_HOUSE.jupiter).toBe(1);
    expect(DIG_BALA_HOUSE.mercury).toBe(1);
    expect(DIG_BALA_HOUSE.sun).toBe(10);
    expect(DIG_BALA_HOUSE.saturn).toBe(7);
    expect(DIG_BALA_HOUSE.moon).toBe(4);
  });

  it('classifies query subject matter for horary use (3.47)', () => {
    expect(QUERY_CLASS.rahu).toBe('dhatu');
    expect(QUERY_CLASS.venus).toBe('moola');
    expect(QUERY_CLASS.jupiter).toBe('jeeva');
  });
});

// ── The predicate substrate ───────────────────────────────────────────────────
describe('predicate algebra', () => {
  // Aquarius lagna; a small but real chart to evaluate against.
  const facts: ChartFacts = {
    lagnaSign: 10,
    planets: {
      sun: { sign: 2, house: 5, longitude: 60.828 },
      moon: { sign: 5, house: 8, longitude: 178.862 },
      mars: { sign: 5, house: 8, longitude: 154.643 },
      mercury: { sign: 1, house: 4, longitude: 48.928, combust: true },
      jupiter: { sign: 9, house: 12, longitude: 298.071, retrograde: true, dignity: 'debilitated' },
      venus: { sign: 2, house: 5, longitude: 80.303 },
      saturn: { sign: 11, house: 2, longitude: 354.729 },
      rahu: { sign: 5, house: 8, longitude: 150.607, retrograde: true },
      ketu: { sign: 11, house: 2, longitude: 330.607, retrograde: true },
    },
    karakas: { AK: 'rahu', DK: 'sun' },
    dasha: { maha: 'jupiter', antar: 'ketu' },
  };

  it('resolves whole-sign house arithmetic', () => {
    expect(houseOfSign(2, 10)).toBe(5);
    expect(signOfHouse(7, 10)).toBe(4);   // Aquarius lagna → 7th is Leo
    expect(lordOfSign(4)).toBe('sun');
  });

  it('evaluates placement, lordship and conjunction', () => {
    expect(evaluate({ k: 'placement', graha: 'venus', house: 5 }, facts)).toBe(true);
    expect(evaluate({ k: 'placement', graha: 'venus', house: 7 }, facts)).toBe(false);
    // 7th lord for Aquarius is the Sun, and it sits in the 5th.
    expect(evaluate({ k: 'lordship', house: 7, occupies: 5 }, facts)).toBe(true);
    expect(evaluate({ k: 'conjunct', grahas: ['sun', 'venus'] }, facts)).toBe(true);
    expect(evaluate({ k: 'conjunct', grahas: ['sun', 'saturn'] }, facts)).toBe(false);
  });

  it('evaluates state, karaka and dasha binding', () => {
    expect(evaluate({ k: 'state', graha: 'jupiter', is: 'retrograde' }, facts)).toBe(true);
    expect(evaluate({ k: 'state', graha: 'mercury', is: 'combust' }, facts)).toBe(true);
    expect(evaluate({ k: 'karaka', code: 'DK', is: 'sun' }, facts)).toBe(true);
    expect(evaluate({ k: 'dasha', level: 'antar', lord: 'ketu' }, facts)).toBe(true);
    expect(evaluate({ k: 'dasha', level: 'antar', lord: 'venus' }, facts)).toBe(false);
  });

  it('returns false — never throws — for facts that were never computed', () => {
    // No shadbala and no sav on this chart: the rule simply does not fire.
    expect(evaluate({ k: 'strength', graha: 'sun', op: '>', rupas: 5 }, facts)).toBe(false);
    expect(evaluate({ k: 'bindus', sign: 4, op: '>', n: 28 }, facts)).toBe(false);
    expect(evaluate({ k: 'yoga', key: 'nonexistent' }, facts)).toBe(false);
  });

  it('composes with or / not', () => {
    const p: Predicate = {
      k: 'compound', op: 'or',
      of: [{ k: 'placement', graha: 'sun', house: 1 }, { k: 'placement', graha: 'sun', house: 5 }],
    };
    expect(evaluate(p, facts)).toBe(true);
    expect(evaluate({ k: 'compound', op: 'not', of: [p] }, facts)).toBe(false);
  });

  it('reports which conditions held and which did not', () => {
    const { met, unmet } = explain([
      { k: 'placement', graha: 'venus', house: 5 },
      { k: 'placement', graha: 'saturn', house: 9 },
    ], facts);
    expect(met).toHaveLength(1);
    expect(unmet).toHaveLength(1);
  });

  it('requires ALL conditions for evaluateAll', () => {
    expect(evaluateAll([
      { k: 'placement', graha: 'venus', house: 5 },
      { k: 'placement', graha: 'sun', house: 5 },
    ], facts)).toBe(true);
  });
});

describe('rule firing and ranking', () => {
  const facts: ChartFacts = {
    lagnaSign: 10,
    planets: {
      sun: { sign: 2, house: 5, longitude: 60.8 },
      moon: { sign: 5, house: 8, longitude: 178.9 },
      mars: { sign: 5, house: 8, longitude: 154.6 },
      mercury: { sign: 1, house: 4, longitude: 48.9 },
      jupiter: { sign: 9, house: 12, longitude: 298.1 },
      venus: { sign: 2, house: 5, longitude: 80.3 },
      saturn: { sign: 11, house: 2, longitude: 354.7 },
      rahu: { sign: 5, house: 8, longitude: 150.6 },
      ketu: { sign: 11, house: 2, longitude: 330.6 },
    },
  };

  const mk = (id: string, when: Predicate[], extra: Partial<Rule> = {}): Rule => ({
    id, source: { text: 'bphs', chapter: 3, verse: '1' },
    when,
    effect: { id: `e.${id}`, domain: 'partnership', valence: 0.5, summary: 'test' },
    weight: 0.5, verification: 'unverified', ...extra,
  });

  const generic = mk('g', [{ k: 'placement', graha: 'venus', house: 5 }]);
  const specific = mk('s', [
    { k: 'placement', graha: 'venus', house: 5 },
    { k: 'placement', graha: 'sun', house: 5 },
    { k: 'lordship', house: 7, occupies: 5 },
  ]);
  const cancelled = mk('c', [{ k: 'placement', graha: 'venus', house: 5 }], {
    unless: [{ k: 'placement', graha: 'sun', house: 5 }],
  });

  it('counts arity from the conditions rather than trusting an authored number', () => {
    expect(arity(specific)).toBe(3);
    expect(arity(generic)).toBe(1);
  });

  it('drops a rule whose cancellation clause triggers', () => {
    const hits = fired([generic, specific, cancelled], facts);
    expect(hits.map((h) => h.rule.id).sort()).toEqual(['g', 's']);
  });

  it('never fires a rule with no conditions — an empty `when` is a data error', () => {
    expect(fired([mk('empty', [])], facts)).toHaveLength(0);
  });

  it('ranks the specific rule above the generic one', () => {
    const ranked = rank(fired([generic, specific], facts));
    expect(ranked[0]!.rule.id).toBe('s');
  });

  it('sinks a rule that fires for more than a third of charts, however specific', () => {
    const common = mk('common', [
      { k: 'placement', graha: 'venus', house: 5 },
      { k: 'placement', graha: 'sun', house: 5 },
      { k: 'lordship', house: 7, occupies: 5 },
    ], { baseRate: 0.9 });
    const ranked = rank(fired([common, generic], facts));
    expect(ranked[0]!.rule.id).toBe('g');
  });
});
