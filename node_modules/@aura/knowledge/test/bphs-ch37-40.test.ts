// BPHS Programme Part 32 — Chapters 37-40.
//
// Chapters 37 and 38 are mirror images and the tests assert the symmetry. Chapters 39-40
// are the ones that had to be handled rather than merely extracted: nearly every verse ends
// in kingship, which the corpus excludes. The tests pin down exactly what was restated and
// exactly what was left alone.

import { describe, it, expect } from 'vitest';
import {
  LUMINARY_YOGAS, luminaryYogaRules, hasKemadruma, KEMADRUMA_IS_AN_ABSENCE,
  ADHI_YOGA_GRADES, CH38_BENEFIC_MALEFIC_MODIFIER, CH38_TEXTUAL_FAULT, CH37_38_YIELD,
  RAJA_YOGAS, rajaYogaRules, RAJA_YOGA_IS_NOT_MONARCHY, RAJA_YOGA_FRAMES,
  RAJA_YOGA_MAGNITUDE, exaltationLadder, EXALTATION_LADDER_DROPS_BIRTH,
  CH39_NOT_ENCODABLE, CH39_BACKGROUND_RULE_WARNING, CH40_IMPOSSIBLE_RULE_CAUGHT,
  CH39_40_YIELD, SOURCE_STATED_ARBITRATION,
  vargaFacts, wholeSignDignity, VARGA_DIGNITY_IS_RECOMPUTED,
  syntheticCharts, allEncodedRules, arity, fired,
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

// ── The Part 32 retrofit: varga dignity ──────────────────────────────────────
describe('Part 32 retrofit — vargaFacts carried the RASI dignity into the varga', () => {
  it('recomputes dignity from the divisional sign instead of carrying it', () => {
    const f = chart();
    (f.planets.jupiter as { dignity?: string }).dignity = 'exalted';
    const d9 = vargaFacts(f, 9);
    // Jupiter is exalted in Cancer in the rasi chart. In D-9 he is wherever vargaSign puts
    // him, and his dignity must follow THAT sign, not come along for the ride.
    const j = d9.planets.jupiter!;
    expect(j.dignity).toBe(wholeSignDignity('jupiter', j.sign));
  });

  it('computes whole-sign dignity, since a varga has no meaningful degree', () => {
    expect(wholeSignDignity('jupiter', 3)).toBe('exalted');     // Cancer
    expect(wholeSignDignity('jupiter', 9)).toBe('debilitated'); // Capricorn
    expect(wholeSignDignity('mars', 7)).toBe('own');            // Scorpio
    expect(wholeSignDignity('sun', 3)).toBeUndefined();
  });

  it('leaves friend/enemy undefined rather than guessing it', () => {
    expect(VARGA_DIGNITY_IS_RECOMPUTED).toContain('left undefined rather than guessed');
    expect(VARGA_DIGNITY_IS_RECOMPUTED).toContain('Whole-sign');
  });
});

// ── 37 and 38: the mirror ────────────────────────────────────────────────────
describe('BPHS 37-38 — the lunar and solar families are mirror images', () => {
  it('reads the 2nd and 12th from the Moon, and the same two from the Sun', () => {
    const lunar = LUMINARY_YOGAS.filter((y) => y.around === 'moon');
    const solar = LUMINARY_YOGAS.filter((y) => y.around === 'sun');
    expect(lunar.length).toBeGreaterThan(0);
    expect(solar).toHaveLength(3);
    for (const y of solar) expect(y.chapter).toBe(38);
  });

  it('every rule counts from the luminary its chapter names', () => {
    for (const r of luminaryYogaRules()) {
      const wants = r.source.chapter === 37 ? 'moon' : 'sun';
      for (const p of r.when) {
        expect((p as { from?: string }).from, r.id).toBe(wants);
      }
    }
  });

  it('each family excludes the OTHER luminary from forming it', () => {
    // 37.7-10 excludes the Sun; 38.1 excludes the Moon.
    const rules = luminaryYogaRules();
    for (const r of rules.filter((x) => x.source.chapter === 37)) {
      for (const p of r.when) expect((p as { graha: string }).graha, r.id).not.toBe('sun');
    }
    for (const r of rules.filter((x) => x.source.chapter === 38)) {
      for (const p of r.when) expect((p as { graha: string }).graha, r.id).not.toBe('moon');
    }
  });

  it('a malefic forming a solar yoga flips the valence, per 38.4', () => {
    const rules = luminaryYogaRules().filter((r) => r.id.includes('vosi'));
    const byJupiter = rules.find((r) => (r.when[0] as { graha: string }).graha === 'jupiter')!;
    const bySaturn = rules.find((r) => (r.when[0] as { graha: string }).graha === 'saturn')!;
    expect(byJupiter.effect.valence).toBeGreaterThan(0);
    expect(bySaturn.effect.valence).toBeLessThan(0);
    expect(CH38_BENEFIC_MALEFIC_MODIFIER).toContain('the participant decides the valence');
  });

  it('Duradhara needs two DIFFERENT planets, one each side', () => {
    for (const r of luminaryYogaRules().filter((x) => x.id.includes('duradhara'))) {
      const [a, b] = r.when as unknown as [{ graha: string }, { graha: string }];
      expect(a.graha, r.id).not.toBe(b.graha);
      expect(arity(r)).toBe(2);
    }
  });

  it('Sunapha fires when a planet sits in the 2nd from the Moon', () => {
    // The Moon is in sign 3, so the 2nd from her is sign 4 — where Jupiter is.
    const hits = fired(luminaryYogaRules(), chart());
    expect(hits.some((h) => h.rule.id.includes('sunapha'))).toBe(true);
  });

  it('records the Vesi/Vosi transcription fault', () => {
    expect(CH38_TEXTUAL_FAULT).toContain('TWICE');
    expect(CH38_TEXTUAL_FAULT).toContain('Fourth transcription fault');
  });

  it('keeps Adhi yoga’s grading but not its three offices', () => {
    const adhi = LUMINARY_YOGAS.find((y) => y.name === 'Adhi')!;
    expect(adhi.summary).not.toMatch(/king|minister|army/i);
    expect(ADHI_YOGA_GRADES).toContain('are not carried');
  });

  it('no surfaced luminary summary claims rank or makes a medical claim', () => {
    for (const y of LUMINARY_YOGAS.filter((x) => x.surfaced)) {
      expect(y.summary!, y.name)
        .not.toMatch(/\b(king|royal|throne|disease[ds]?|long-lived|longevity)\b/i);
    }
  });
});

// ── Kemadruma ────────────────────────────────────────────────────────────────
describe('BPHS 37.11-13 — Kemadruma is detected, never read', () => {
  it('refuses the reading but keeps the shape', () => {
    const k = LUMINARY_YOGAS.find((y) => y.name === 'Kemadruma')!;
    expect(k.surfaced).toBe(false);
    expect(k.withheld).toContain('refused');
    expect(luminaryYogaRules().some((r) => r.id.includes('kemadruma'))).toBe(false);
  });

  it('a planet beside the Moon breaks it', () => {
    expect(hasKemadruma(0, {
      moon: { sign: 0 }, mars: { sign: 1 }, mercury: { sign: 5 },
      jupiter: { sign: 7 }, venus: { sign: 8 }, saturn: { sign: 10 },
    })).toBe(false);
  });

  it('a planet in an angle from the ascendant breaks it', () => {
    // Aries lagna: sign 3 is the 4th house, an angle.
    expect(hasKemadruma(0, {
      moon: { sign: 0 }, mars: { sign: 3 }, mercury: { sign: 5 },
      jupiter: { sign: 7 }, venus: { sign: 8 }, saturn: { sign: 10 },
    })).toBe(false);
  });

  it('holds when the Moon truly stands alone', () => {
    // Gemini lagna (2): angles are signs 2, 5, 8, 11. Moon in sign 0; the others sit in
    // signs that are neither beside her nor angular.
    expect(hasKemadruma(2, {
      moon: { sign: 0 }, mars: { sign: 3 }, mercury: { sign: 4 },
      jupiter: { sign: 6 }, venus: { sign: 7 }, saturn: { sign: 9 },
    })).toBe(true);
  });

  it('is honest that the DSL could express this and that it is the wrong tool', () => {
    expect(KEMADRUMA_IS_AN_ABSENCE).toContain('The DSL CAN express it');
    expect(KEMADRUMA_IS_AN_ABSENCE).toContain('Capability is not the same as fitness');
  });
});

// ── 39-40: the kingship question ─────────────────────────────────────────────
describe('BPHS 39-40 — kingship restated as elevation, and labelled as ours', () => {
  it('says plainly that the reframing is ours, not the text’s', () => {
    expect(RAJA_YOGA_IS_NOT_MONARCHY).toContain('That reframing is OURS');
    expect(RAJA_YOGA_IS_NOT_MONARCHY).toContain('only the effect is restated');
  });

  it('grounds the reframing in the chapter’s own two statements', () => {
    expect(RAJA_YOGA_IS_NOT_MONARCHY).toContain('39.45');
    expect(RAJA_YOGA_IS_NOT_MONARCHY).toContain('39.48');
  });

  it('no summary anywhere claims rank', () => {
    for (const y of RAJA_YOGAS) {
      expect(y.summary, `${y.chapter}.${y.verse}`)
        .not.toMatch(/\b(king|kingly|kingdom|royal|throne|monarch|minister|emperor)\b/i);
    }
    for (const r of rajaYogaRules()) {
      expect(r.effect.summary, r.id).not.toMatch(/\b(king|royal|throne|emperor)\b/i);
    }
  });

  it('records the kingship exclusion on the verses that carried it', () => {
    const withK = RAJA_YOGAS.filter((y) => y.excluded?.includes('Kingship'));
    expect(withK.length).toBeGreaterThanOrEqual(8);
  });

  it('carries BPHS 39.3-5’s own full/half/quarter magnitude onto the weights', () => {
    for (const r of rajaYogaRules()) {
      expect([0.25, 0.5, 1], r.id).toContain(r.weight);
    }
    expect(RAJA_YOGA_MAGNITUDE).toContain('tenth source-stated');
  });

  it('is recorded as the tenth arbitration instruction, distinct from the other nine', () => {
    expect(SOURCE_STATED_ARBITRATION[9]).toContain('39.3-5');
    expect(new Set(SOURCE_STATED_ARBITRATION).size).toBe(SOURCE_STATED_ARBITRATION.length);
  });

  it('names both reckoning points, not just the natal ascendant', () => {
    expect(RAJA_YOGA_FRAMES).toContain('karakamsa');
    expect(RAJA_YOGA_FRAMES).toContain('half-read');
    expect(
      rajaYogaRules().some((r) => r.when.some((p) => (p as { from?: string }).from === 'karakamsa')),
    ).toBe(true);
  });
});

describe('BPHS 39.44-46 — the exaltation ladder', () => {
  it('grades by count, and gives nothing for none', () => {
    expect(exaltationLadder(0)).toBeNull();
    expect(exaltationLadder(2)!.magnitude).toBeLessThan(exaltationLadder(4)!.magnitude);
    expect(exaltationLadder(4)!.magnitude).toBeLessThan(exaltationLadder(6)!.magnitude);
  });

  it('drops the clause that conditions the outcome on birth', () => {
    for (const n of [1, 3, 4, 6]) {
      expect(exaltationLadder(n)!.summary).not.toMatch(/scion|base-birth|descent|caste/i);
    }
    expect(EXALTATION_LADDER_DROPS_BIRTH).toContain('not one we will surface');
  });
});

describe('BPHS 39-40 — the audit trail', () => {
  it('names four conditions it could not encode', () => {
    expect(CH39_NOT_ENCODABLE).toHaveLength(4);
    const joined = CH39_NOT_ENCODABLE.join(' ');
    expect(joined).toContain('Darapada');
    expect(joined).toContain('Argala');
  });

  it('records the verse left out for being true of nearly everyone', () => {
    expect(CH39_BACKGROUND_RULE_WARNING).toContain('39.12');
    expect(CH39_BACKGROUND_RULE_WARNING).toContain('a decision rather than an oversight');
  });

  it('records the impossible rule the calibration guard caught', () => {
    expect(CH40_IMPOSSIBLE_RULE_CAUGHT).toContain('never aspects the house it stands in');
    expect(CH40_IMPOSSIBLE_RULE_CAUGHT).toContain('mis-reading a verse');
  });

  it('is honest about what these chapters cost to handle', () => {
    expect(CH39_40_YIELD.note).toContain('hardest to handle honestly');
    expect(CH37_38_YIELD.note).toContain('no worked example');
  });

  it('every rule from this part is registered', () => {
    const ids = new Set(allEncodedRules().map((r) => r.id));
    for (const r of [...luminaryYogaRules(), ...rajaYogaRules()]) {
      expect(ids.has(r.id), r.id).toBe(true);
    }
  });
});

// ── The generator gained a sixth fact ────────────────────────────────────────
describe('Part 32 — the generator supplies chara karakas', () => {
  it('derives them from the longitudes rather than drawing them at random', () => {
    const c = syntheticCharts(1, 5)[0]! as unknown as {
      karakas: Record<string, string>;
      planets: Record<string, { longitude: number }>;
    };
    expect(c.karakas.AK).toBeTruthy();
    // The Atmakaraka must be the body with the highest degree-in-sign, Rahu reversed.
    const scored = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu']
      .map((g) => {
        const d = c.planets[g]!.longitude % 30;
        return { g, d: g === 'rahu' ? 30 - d : d };
      })
      .sort((a, b) => b.d - a.d);
    expect(c.karakas.AK).toBe(scored[0]!.g);
    expect(c.karakas.DK).toBe(scored[7]!.g);
  });

  it('a karaka rule can therefore fire', () => {
    const rules = rajaYogaRules().filter((r) => r.when.some((p) => p.k === 'karaka'));
    expect(rules).toHaveLength(7);
    const f = chart();
    (f as unknown as { karakas: Record<string, string> }).karakas = { AmK: 'venus' };
    (f.planets.venus as { dignity?: string }).dignity = 'exalted';
    expect(fired(rules, f)).toHaveLength(1);
  });
});
