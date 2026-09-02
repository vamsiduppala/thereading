// BPHS Programme Part 33 — Chapters 41 (wealth) and 42 (penury).
//
// Two tests here carry more weight than the rest.
//
// The first is `the chapter's own generalisation actually holds`: chapter 41 collapses seven
// verses into one rule on the strength of a claim its own notes make, and that claim has to
// be CHECKED against the seven verses rather than taken on trust. If it did not hold, the
// collapse would be our invention.
//
// The second is the chapter-42 guard. That chapter invites a quiet failure — a calm,
// plausible sentence predicting poverty — and the test exists to make that sentence
// impossible to ship.

import { describe, it, expect } from 'vitest';
import {
  AFFLUENCE_VERSES, LAGNA_LORD_WEALTH, AMSA_EFFECTS, wealthRules,
  CH41_STATES_ITS_OWN_RULE, CH41_MARS_THIRD_SUPPORTER, TRINE_LORDS_GIVE_WEALTH,
  AFFLUENCE_VERSE_5_IS_TWO_CASES,
  CH41_DELINEATE_BY_STRENGTH, AMSA_EFFECTS_CLOSE_A_THREAD, CH41_RAJA_RELATIONS,
  RAJA_RELATIONS_DIVERGE, CH41_NO_PROMISE_OF_RICHES, CH41_YIELD,
  PENURY_COMBINATIONS, penuryConditionRules, PENURY_FORBIDDEN,
  CH42_IS_NOT_REFRAMED_LIKE_CH39, CH42_MARAKA_GATE, CH42_NOT_ENCODABLE,
  CH42_GUARD_IS_STRICTER_THAN_NO_DOOM, CH42_YIELD,
  SOURCE_STATED_ARBITRATION, RAJA_YOGA_RELATIONS, VARGA_DESIGNATIONS,
  allEncodedRules, arity, fired, lordOfSign,
  type ChartFacts,
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

// ── 41.2-8: the chapter generalises itself, and the claim is checked ─────────
describe('BPHS 41.2-8 — the chapter states its own rule', () => {
  it('the generalisation actually holds for all seven verses', () => {
    // 41.8's notes claim the formula behind 2-8 is "5th lord in the 5th, 11th lord in the
    // 11th". Verify it: for each ascendant the verse names, the planet it calls the 5th lord
    // really does rule that ascendant's 5th, and likewise the 11th.
    const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    for (const v of AFFLUENCE_VERSES) {
      for (const l of v.lagnas) {
        const lagna = SIGNS.indexOf(l.name);
        expect(lagna, l.name).toBeGreaterThanOrEqual(0);
        expect(lordOfSign(((lagna + 4) % 12) as never), `${l.name} 5th lord, verse ${v.verse}`)
          .toBe(l.fifthLord);
        expect(lordOfSign(((lagna + 10) % 12) as never), `${l.name} 11th lord, verse ${v.verse}`)
          .toBe(l.eleventhLord);
      }
    }
  });

  it('covers the seven verses and the twelve ascendants they between them name', () => {
    expect(AFFLUENCE_VERSES).toHaveLength(7);
    const named = AFFLUENCE_VERSES.flatMap((v) => v.lagnas.map((l) => l.name));
    expect(new Set(named).size).toBe(named.length);   // no ascendant named twice
    expect(named.length).toBe(12);                    // and all twelve are covered
  });

  it('emits ONE rule for the block, not seven', () => {
    const block = wealthRules().filter((r) => r.effect.id.includes('trine-gain-lords'));
    // The general rule plus 41.3's reinforced variant — two, not seven.
    expect(block).toHaveLength(2);
    expect(CH41_STATES_ITS_OWN_RULE).toContain('are not seven rules');
  });

  it('only 41.3 adds anything beyond the two lords', () => {
    const withExtra = AFFLUENCE_VERSES.filter((v) => v.extra);
    expect(withExtra.map((v) => v.verse)).toContain('3');
    const reinforced = wealthRules().find((r) => r.id.includes('reinforced'))!;
    expect(arity(reinforced)).toBe(4);
  });

  it('verse 5 is the ONLY one whose two ascendants have different 11th lords', () => {
    // Which is why it names three planets where its siblings name two — it is covering two
    // different 11th lords in one sentence, not adding a third planet to one combination.
    const split = AFFLUENCE_VERSES.filter(
      (v) => new Set(v.lagnas.map((l) => l.eleventhLord)).size > 1,
    );
    expect(split.map((v) => v.verse)).toEqual(['5']);
    expect(AFFLUENCE_VERSE_5_IS_TWO_CASES).toContain('DIFFERENT 11th lords');
    expect(AFFLUENCE_VERSE_5_IS_TWO_CASES).toContain('not because it adds a third planet');
  });
});

// ── 41.9-15 ──────────────────────────────────────────────────────────────────
describe('BPHS 41.9-15 — the ascendant lord supported', () => {
  it('has one verse per classical planet, and does NOT collapse', () => {
    expect(LAGNA_LORD_WEALTH).toHaveLength(7);
    expect(new Set(LAGNA_LORD_WEALTH.map((w) => w.graha)).size).toBe(7);
    // Unlike 2-8, the chapter states no rule behind these, so they stay enumerated.
    expect(wealthRules().filter((r) => r.id.includes('lagna-lord-'))).toHaveLength(7);
  });

  it('every rule requires the lord in its OWN sign, not merely in the ascendant', () => {
    for (const r of wealthRules().filter((x) => x.id.includes('lagna-lord-'))) {
      expect(r.when.some((p) => p.k === 'dignity'), r.id).toBe(true);
      expect(arity(r), r.id).toBe(4);
    }
  });

  it('records that Mars is given three supporters where the others get two', () => {
    expect(LAGNA_LORD_WEALTH.find((w) => w.graha === 'mars')!.supporters).toHaveLength(2);
    expect(CH41_MARS_THIRD_SUPPORTER).toContain('THREE supporters');
    expect(CH41_MARS_THIRD_SUPPORTER).toContain('arity stays comparable');
  });
});

// ── 41.18-27: the deferred wiring, closed ────────────────────────────────────
describe('BPHS 41.18-27 — the divisional designations finally have effects', () => {
  it('uses the designation names Part 4 already computes', () => {
    const dasavarga = VARGA_DESIGNATIONS.dasavarga.filter(Boolean) as string[];
    for (const e of AMSA_EFFECTS) {
      expect(dasavarga, `${e.designation} (${e.subject})`).toContain(e.designation);
    }
  });

  it('covers all three subjects chapter 41 tabulates', () => {
    for (const s of ['angular', 'fifth', 'ninth']) {
      expect(AMSA_EFFECTS.filter((e) => e.subject === s), s).not.toHaveLength(0);
    }
  });

  it('refuses the ritual and devotional rows, and says which', () => {
    const refused = AMSA_EFFECTS.filter((e) => !e.surfaced);
    expect(refused.length).toBeGreaterThanOrEqual(6);
    for (const e of refused) expect(e.withheld, `${e.designation}/${e.subject}`).toBeTruthy();
    // Most of the refusals are in the 9th-lord table, which is largely renunciate.
    expect(refused.filter((e) => e.subject === 'ninth').length).toBeGreaterThan(3);
  });

  it('refuses the past-life claim specifically', () => {
    const uttama9 = AMSA_EFFECTS.find((e) => e.subject === 'ninth' && e.designation === 'Uttama')!;
    expect(uttama9.surfaced).toBe(false);
    expect(uttama9.withheld).toContain('previous life');
  });

  it('no surfaced amsa effect carries ritual, rank or devotional language', () => {
    for (const e of AMSA_EFFECTS.filter((x) => x.surfaced)) {
      expect(e.summary!, `${e.designation}/${e.subject}`)
        .not.toMatch(/\b(king|sacrifice|sacrificial|Lord|ascetic|mendicant|Indra|holy)\b/);
    }
  });

  it('records that this closes the thread Part 31 opened', () => {
    expect(AMSA_EFFECTS_CLOSE_A_THREAD).toContain('WIRING job');
    expect(AMSA_EFFECTS_CLOSE_A_THREAD).toContain('nothing consumed them');
  });
});

// ── 41.17 and 41.28 ─────────────────────────────────────────────────────────
describe('BPHS 41.17, 41.28 — precedence, and a disagreement with chapter 34', () => {
  it('records the eleventh source-stated arbitration instruction', () => {
    expect(SOURCE_STATED_ARBITRATION[10]).toContain('41.17');
    expect(new Set(SOURCE_STATED_ARBITRATION).size).toBe(SOURCE_STATED_ARBITRATION.length);
    expect(CH41_DELINEATE_BY_STRENGTH).toContain('eleventh source-stated');
  });

  it('notes that the corpus REPEATS its general caveat rather than stating it once', () => {
    expect(CH41_DELINEATE_BY_STRENGTH).toContain('36.1-2');
    expect(CH41_DELINEATE_BY_STRENGTH).toContain('repeats it');
  });

  it('41.28 gives five relations where 34.11-12 gave six, and they differ', () => {
    expect(CH41_RAJA_RELATIONS).toHaveLength(5);
    expect(RAJA_YOGA_RELATIONS).toHaveLength(6);
    // 41.28 names conjunction as its own case; 34.11-12 never does.
    expect(CH41_RAJA_RELATIONS.join(' ')).toContain('Conjunction');
    expect(RAJA_YOGA_RELATIONS.join(' ')).not.toContain('Conjunction');
    expect(RAJA_RELATIONS_DIVERGE).toContain('neither list contains the other');
  });

  it('binds 41.16 to the participants’ dasha periods, as the verse does', () => {
    expect(TRINE_LORDS_GIVE_WEALTH).toContain('DASHA');
    expect(TRINE_LORDS_GIVE_WEALTH).toContain('names when, not just whether');
  });
});

// ── 41: no promise of riches ─────────────────────────────────────────────────
describe('BPHS 41 — capacity, never a promise of riches', () => {
  it('no rule summary promises wealth as an outcome', () => {
    for (const r of wealthRules()) {
      expect(r.effect.summary, r.id)
        .not.toMatch(/\b(will be (wealthy|rich|affluent)|riches|fortune awaits|guaranteed)\b/i);
    }
  });

  it('records that this is the same move as the kingship reframing', () => {
    expect(CH41_NO_PROMISE_OF_RICHES).toContain('as unfalsifiable as ch 39');
    expect(CH41_NO_PROMISE_OF_RICHES).toContain('the restatement is ours');
  });

  it('is honest about the yield', () => {
    expect(CH41_YIELD.note).toContain('state its OWN generalisation');
  });
});

// ── 42: the maraka gate ──────────────────────────────────────────────────────
describe('BPHS 42 — refused on the EVIDENCE, not on the wording', () => {
  it('never surfaces a combination that needs a maraka', () => {
    for (const c of PENURY_COMBINATIONS.filter((x) => x.needsMaraka)) {
      expect(c.surfaced, `verse ${c.verse}`).toBe(false);
      expect(c.withheld, `verse ${c.verse}`).toContain('maraka');
    }
    expect(PENURY_COMBINATIONS.filter((c) => c.needsMaraka).length).toBe(6);
  });

  it('states that the gate is on the evidence rather than the phrasing', () => {
    expect(CH42_MARAKA_GATE).toContain('gate on the EVIDENCE, not on the phrasing');
  });

  it('does NOT reframe penury the way chapter 39 reframed kingship, and says why', () => {
    expect(CH42_IS_NOT_REFRAMED_LIKE_CH39).toContain('no such second meaning');
    expect(CH42_IS_NOT_REFRAMED_LIKE_CH39).toContain('declined outright');
  });

  it('keeps every formation on record even where the reading is refused', () => {
    for (const c of PENURY_COMBINATIONS) {
      expect(c.formation.length, `verse ${c.verse}`).toBeGreaterThan(30);
    }
    expect(PENURY_COMBINATIONS.length).toBeGreaterThanOrEqual(13);
  });

  it('drops the clause conditioning the outcome on class of birth', () => {
    const v5 = PENURY_COMBINATIONS.find((c) => c.verse === '5')!;
    expect(v5.excluded).toContain('royal scion');
    expect(v5.condition).not.toMatch(/scion|royal|caste|descent/i);
  });
});

// ── 42: the guard ────────────────────────────────────────────────────────────
describe('BPHS 42 — the guard against a quietly harmful sentence', () => {
  const surfaced = PENURY_COMBINATIONS.filter((c) => c.surfaced).map((c) => c.condition!);
  const ruleLines = penuryConditionRules().map((r) => r.effect.summary);

  it('no surfaced line uses the vocabulary of destitution', () => {
    for (const line of [...surfaced, ...ruleLines]) {
      for (const word of PENURY_FORBIDDEN) {
        expect(line.toLowerCase(), `"${word}" in: ${line.slice(0, 60)}`).not.toContain(word);
      }
    }
  });

  it('no surfaced line predicts a future at all — these are conditions, not outcomes', () => {
    for (const line of [...surfaced, ...ruleLines]) {
      expect(line, line.slice(0, 60)).not.toMatch(/\byou will\b|\bwill be\b|\bis destined\b/i);
    }
  });

  it('also passes the engine’s catastrophe patterns', () => {
    // NOTE: `checkNoDoom` lives in @aura/engine, which this package does not depend on, so
    // its patterns are applied here directly rather than imported. PENURY_FORBIDDEN is the
    // stricter guard and the one that matters for this chapter; this is the belt to its
    // braces. If the engine's list grows, this one must be updated with it.
    const DOOM = [
      /\b(you will|you'll|going to|will surely|destined to)\s+(die|fail|lose everything|be ruined|suffer)\b/i,
      /\b(death|dying|fatal|terminal illness|disease|cancer|tumou?r)\b/i,
      /\b(disaster|catastrophe|doom(ed)?|tragedy|calamity|ruin(ed)?)\b/i,
      /\bcursed\b/i,
    ];
    for (const line of [...surfaced, ...ruleLines]) {
      for (const re of DOOM) expect(line, line.slice(0, 60)).not.toMatch(re);
    }
  });

  it('explains why a stricter guard than checkNoDoom was needed', () => {
    expect(CH42_GUARD_IS_STRICTER_THAN_NO_DOOM).toContain('quieter');
    expect(CH42_GUARD_IS_STRICTER_THAN_NO_DOOM).toContain('trips no doom pattern');
  });

  it('the rules still carry a NEGATIVE valence — the safety is in the wording, not the sign', () => {
    // Softening the valence would hide a real headwind from the arbitration layer.
    for (const r of penuryConditionRules()) expect(r.effect.valence, r.id).toBeLessThan(0);
  });
});

// ── 42: what could not be encoded ────────────────────────────────────────────
describe('BPHS 42 — the dispositor gap, now blocking a fourth part', () => {
  it('names three things it could not encode', () => {
    expect(CH42_NOT_ENCODABLE).toHaveLength(3);
    const joined = CH42_NOT_ENCODABLE.join(' ');
    expect(joined).toContain('DISPOSITOR');
    expect(joined).toContain('fourth place');
  });

  it('refuses to build a maraka predicate on purpose', () => {
    const joined = CH42_NOT_ENCODABLE.join(' ');
    expect(joined).toContain('Deliberately not built');
    expect(joined).toContain('nothing surfaces it by accident');
  });

  it('is honest about how much of the chapter survived', () => {
    expect(CH42_YIELD.surfaced).toBe(5);
    expect(CH42_YIELD.note).toContain('but by the EVIDENCE');
  });
});

// ── registration ─────────────────────────────────────────────────────────────
describe('Part 33 — registration', () => {
  it('every rule from this part is registered', () => {
    const ids = new Set(allEncodedRules().map((r) => r.id));
    for (const r of [...wealthRules(), ...penuryConditionRules()]) {
      expect(ids.has(r.id), r.id).toBe(true);
    }
  });

  it('the 41.2-8 rule fires when both trine-gain lords are home', () => {
    // Aries lagna: the 5th is Leo (Sun) and the 11th Aquarius (Saturn).
    const f = chart({
      sun: { sign: 4, house: 5, longitude: 130 },
      saturn: { sign: 10, house: 11, longitude: 310 },
    });
    const hits = fired(wealthRules(), f).map((h) => h.rule.id);
    expect(hits.some((id) => id.includes('trine-gain-lords-own-houses'))).toBe(true);
  });
});
