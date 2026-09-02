// BPHS Programme Part 29 — Chapter 33: Effects of Karakamsa.
//
// NOTE ON VERIFICATION: chapter 33 gives no worked example — no chart, no numbers, not a
// single figure across 99 verses. So there is nothing here to check our arithmetic against,
// and this file does not pretend otherwise. What it CAN check is that the varga projection
// agrees with `vargaSign`, which Part 3 verified against the book's own D-9 tables, and
// that the projection's house arithmetic is self-consistent. Stated rather than glossed,
// per the standing rule about rules the book does not exemplify.

import { describe, it, expect } from 'vitest';
import {
  vargaFacts, karakamsaFacts, VARGA_PROJECTION_NOT_PREDICATE,
  KARAKAMSA_SIGNS, KARAKAMSA_PLANETS, KARAKAMSA_APTITUDES, KARAKAMSA_POLARITY,
  AUTHORSHIP_GRADES, karakamsaRules, karakamsaSignReading,
  CH33_SELF_CONTRADICTION, CH33_REPEATS_ITSELF, CH33_VENUS_LIFESPAN_DROPPED,
  CH33_EXCLUSION_THEMES, CH33_YIELD, CH33_CALIBRATION_NOTE,
  vargaSign, allEncodedRules, arity, fired, evaluate, LAGNA_REFERENCE_USE,
  type ChartFacts, type SignIndex,
} from '../src/index.js';

const facts = (over: Record<string, unknown> = {}): ChartFacts => ({
  lagnaSign: 0,
  planets: {
    sun: { sign: 0, house: 1, longitude: 5 },
    moon: { sign: 3, house: 4, longitude: 100 },
    mars: { sign: 2, house: 3, longitude: 75.5 },
    mercury: { sign: 3, house: 4, longitude: 95 },
    jupiter: { sign: 4, house: 5, longitude: 130.25 },
    venus: { sign: 5, house: 6, longitude: 160 },
    saturn: { sign: 6, house: 7, longitude: 200 },
    rahu: { sign: 7, house: 8, longitude: 220 },
    ketu: { sign: 1, house: 2, longitude: 40 },
    ...over,
  },
} as unknown as ChartFacts);

// ── The projection (the retrofit) ────────────────────────────────────────────
describe('Part 29 retrofit — projecting a chart into a varga', () => {
  it('gives every planet its divisional sign, agreeing with vargaSign', () => {
    const d9 = vargaFacts(facts(), 9);
    for (const [g, p] of Object.entries(facts().planets)) {
      expect(d9.planets[g as 'sun']!.sign, g).toBe(vargaSign((p as { longitude: number }).longitude, 9));
    }
  });

  it('keeps the longitude, so the projection can be applied again', () => {
    // D-9 of a D-9 must still be computable — the output has to be a real ChartFacts.
    const d9 = vargaFacts(facts(), 9);
    expect(d9.planets.sun!.longitude).toBe(5);
    expect(() => vargaFacts(d9, 3)).not.toThrow();
  });

  it('recounts houses from the divisional ascendant, not the natal one', () => {
    const d9 = vargaFacts(facts(), 9, { lagnaSign: 6 });
    expect(d9.lagnaSign).toBe(6);
    for (const [g, p] of Object.entries(d9.planets)) {
      const expected = ((p!.sign - 6 + 12) % 12) + 1;
      expect(p!.house, g).toBe(expected);
    }
  });

  it('derives the divisional ascendant from a lagna longitude when given one', () => {
    const d9 = vargaFacts(facts(), 9, { lagnaLongitude: 12.5 });
    expect(d9.lagnaSign).toBe(vargaSign(12.5, 9));
  });

  it('drops a planet with no longitude rather than guessing its division', () => {
    const f = facts();
    delete (f.planets.venus as { longitude?: number }).longitude;
    expect(vargaFacts(f, 9).planets.venus).toBeUndefined();
  });

  it('does NOT carry ashtakavarga, Shadbala or the special lagnas into the varga', () => {
    // These are rasi constructions. A rule reading them in D-9 must get silence, not a
    // number that means nothing there.
    const f = facts();
    (f as unknown as Record<string, unknown>).sav = new Array(12).fill(28);
    (f as unknown as Record<string, unknown>).shadbala = { sun: 400 };
    (f as unknown as Record<string, unknown>).lagnas = { arudha: 3 };
    const d9 = vargaFacts(f, 9);
    expect((d9 as unknown as Record<string, unknown>).sav).toBeUndefined();
    expect((d9 as unknown as Record<string, unknown>).shadbala).toBeUndefined();
    expect((d9 as unknown as Record<string, unknown>).lagnas).toBeUndefined();
  });

  it('records that this is a projection, not a new predicate kind', () => {
    expect(VARGA_PROJECTION_NOT_PREDICATE).toContain('PROJECTION');
    expect(VARGA_PROJECTION_NOT_PREDICATE).toContain('including kinds not yet written');
  });

  it('every existing predicate kind works in the varga without modification', () => {
    // The whole point: no predicate was changed to make this work.
    const d9 = vargaFacts(facts(), 9);
    const sunSign = d9.planets.sun!.sign;
    expect(evaluate({ k: 'placement', graha: 'sun', sign: sunSign }, d9)).toBe(true);
    expect(evaluate({ k: 'placement', graha: 'sun', house: d9.planets.sun!.house }, d9)).toBe(true);
  });
});

// ── The karakamsa frame ──────────────────────────────────────────────────────
describe('BPHS 33.1 — the karakamsa is the Atmakaraka’s navamsa', () => {
  it('sets the frame to the AK’s D-9 sign', () => {
    const k = karakamsaFacts(facts(), 'moon')!;
    expect(k.lagnas!.karakamsa).toBe(vargaSign(100, 9));
  });

  it('places every planet in its navamsa, not its rasi', () => {
    const k = karakamsaFacts(facts(), 'moon')!;
    expect(k.planets.venus!.sign).toBe(vargaSign(160, 9));
  });

  it('returns null when the Atmakaraka is not on the chart', () => {
    const f = facts();
    delete (f.planets as Record<string, unknown>).moon;
    expect(karakamsaFacts(f, 'moon')).toBeNull();
  });

  it('keeps the navamsa ascendant separate from the karakamsa', () => {
    // 33.9-11 needs both at once: "benefics in the Karakamsa AND the Navamsha of Lagna".
    const k = karakamsaFacts(facts(), 'moon', { lagnaLongitude: 12.5 })!;
    expect(k.lagnaSign).toBe(vargaSign(12.5, 9));
    expect(k.lagnas!.karakamsa).toBe(vargaSign(100, 9));
    expect(k.lagnaSign).not.toBe(k.lagnas!.karakamsa);
  });

  it('a rule counting from the karakamsa fires against these facts', () => {
    const k = karakamsaFacts(facts(), 'moon')!;
    const kSign = k.lagnas!.karakamsa!;
    // Put Jupiter in the 5th from the karakamsa and check the frame resolves.
    k.planets.jupiter!.sign = ((kSign + 4) % 12) as SignIndex;
    expect(evaluate({ k: 'placement', graha: 'jupiter', house: 5, from: 'karakamsa' }, k)).toBe(true);
  });

  it('is documented as the first frame that lives in a divisional chart', () => {
    expect(LAGNA_REFERENCE_USE.karakamsa).toContain('NAVAMSA');
    expect(LAGNA_REFERENCE_USE.karakamsa).toContain('vargaFacts');
  });
});

// ── The tables ───────────────────────────────────────────────────────────────
describe('BPHS 33.2-8 — the karakamsa in each sign', () => {
  it('covers all twelve signs in zodiacal order', () => {
    expect(KARAKAMSA_SIGNS).toHaveLength(12);
    expect(KARAKAMSA_SIGNS[0]!.key).toBe('aries');
    expect(KARAKAMSA_SIGNS[11]!.key).toBe('pisces');
  });

  it('refuses more than a third of them, each with a stated reason', () => {
    const refused = KARAKAMSA_SIGNS.filter((c) => !c.surfaced);
    expect(refused.length).toBeGreaterThanOrEqual(5);
    for (const c of refused) expect(c.withheld!.length, c.key).toBeGreaterThan(20);
  });

  it('is a lookup, not a rule — there is no condition for a predicate to test', () => {
    // Encoding these as a placement would manufacture evidence the verse does not contain.
    expect(karakamsaSignReading(1)!.summary).toContain('animals');
    expect(karakamsaSignReading(0)).toBeNull();   // Aries is refused
    expect(karakamsaRules().some((r) => r.id.includes('karakamsa-in-'))).toBe(false);
  });
});

describe('BPHS 33.13-18 — the planets in the karakamsa', () => {
  it('covers all nine grahas', () => {
    expect(KARAKAMSA_PLANETS).toHaveLength(9);
  });

  it('drops Venus’s 100-year lifespan rather than softening it', () => {
    const venus = KARAKAMSA_PLANETS.find((c) => c.key === 'venus')!;
    expect(venus.summary).not.toMatch(/100|year|longevity|life/i);
    expect(CH33_VENUS_LIFESPAN_DROPPED).toContain('Part 51');
  });

  it('refuses Ketu, because the usable half cannot carry the verdict attached to it', () => {
    const ketu = KARAKAMSA_PLANETS.find((c) => c.key === 'ketu')!;
    expect(ketu.surfaced).toBe(false);
    expect(ketu.withheld).toContain('thief');
  });
});

// ── The aptitude block ───────────────────────────────────────────────────────
describe('BPHS 33.36-92 — the aptitude block', () => {
  it('applies each aptitude to every house the chapter licenses, not just the 5th', () => {
    // 33.87-92 widens the 5th-from-karakamsa readings to the 2nd, 3rd and karakamsa itself.
    const venus = KARAKAMSA_APTITUDES.find((a) => a.graha === 'venus')!;
    expect(venus.houses).toEqual([1, 2, 3, 5]);
    // Ketu's mathematics reading is stated for the 5th alone and is not widened.
    expect(KARAKAMSA_APTITUDES.find((a) => a.graha === 'ketu')!.houses).toEqual([5]);
  });

  it('records the chapter contradicting itself about Jupiter, and carries neither claim', () => {
    const jup = KARAKAMSA_APTITUDES.find((a) => a.graha === 'jupiter')!;
    expect(jup.conflict).toBeTruthy();
    expect(jup.aptitude).not.toMatch(/grammarian|orator/i);
    expect(CH33_SELF_CONTRADICTION).toContain('not an OCR fault');
    expect(CH33_SELF_CONTRADICTION).toContain('first found in the');
  });

  it('records that the chapter repeats itself, and why neither pass can be dropped', () => {
    expect(CH33_REPEATS_ITSELF).toContain('ADDS detail rather than copying');
    expect(CH33_REPEATS_ITSELF).toContain('duplicate rules');
  });

  it('keeps Saturn’s observation about setting and drops the verdict on intelligence', () => {
    const sat = KARAKAMSA_APTITUDES.find((a) => a.graha === 'saturn')!;
    expect(sat.aptitude).not.toMatch(/dull|stupid|witted|ineffective/i);
    expect(sat.excluded).toContain('dull-witted');
  });

  it('grades authorship as one ordering rather than three unrelated claims', () => {
    expect(AUTHORSHIP_GRADES).toHaveLength(3);
    const grades = AUTHORSHIP_GRADES.map((g) => g.grade);
    expect(grades).toEqual([...grades].sort((a, b) => b - a));
    expect(AUTHORSHIP_GRADES[0]!.combo).toEqual(['jupiter', 'moon']);
    expect(AUTHORSHIP_GRADES[2]!.combo).toEqual(['mercury']);
  });
});

// ── The polarity houses ──────────────────────────────────────────────────────
describe('BPHS 33.32-63 — the houses read by benefic vs malefic', () => {
  it('gives both polarities for every surfaced house', () => {
    for (const c of KARAKAMSA_POLARITY.filter((x) => x.surfaced)) {
      expect(c.benefic.length, `house ${c.house}`).toBeGreaterThan(10);
      expect(c.malefic.length, `house ${c.house}`).toBeGreaterThan(10);
    }
  });

  it('withholds the 8th entirely — it is graded only by lifespan', () => {
    const eighth = KARAKAMSA_POLARITY.find((c) => c.house === 8)!;
    expect(eighth.surfaced).toBe(false);
    expect(eighth.withheld).toContain('Part 51');
  });

  it('withholds the 7th, whose every clause describes the spouse', () => {
    const seventh = KARAKAMSA_POLARITY.find((c) => c.house === 7)!;
    expect(seventh.surfaced).toBe(false);
    expect(seventh.withheld).toContain('not the native');
  });

  it('no surfaced reading carries medical, mortal or moral language', () => {
    const all = [
      ...KARAKAMSA_POLARITY.filter((c) => c.surfaced).flatMap((c) => [c.benefic, c.malefic]),
      ...KARAKAMSA_APTITUDES.map((a) => a.aptitude),
      ...KARAKAMSA_SIGNS.filter((c) => c.surfaced).map((c) => c.summary!),
      ...KARAKAMSA_PLANETS.filter((c) => c.surfaced).map((c) => c.summary!),
    ];
    for (const t of all) {
      expect(t).not.toMatch(/\b(death|dies?|dying|leprosy|consumption|ulcer|dysentery|disease[ds]?|thief|wicked|sinful|slave|widow|king)\b/i);
    }
  });
});

// ── Rules and calibration ────────────────────────────────────────────────────
describe('BPHS 33 — the generated rules', () => {
  const rules = karakamsaRules();

  it('generates one rule per surfaced planet cell and per aptitude house', () => {
    const planetRules = rules.filter((r) => r.id.includes('-in-karakamsa'));
    expect(planetRules).toHaveLength(KARAKAMSA_PLANETS.filter((c) => c.surfaced).length);
    const aptitudeRules = rules.filter((r) => r.id.includes('-from-karakamsa'));
    expect(aptitudeRules).toHaveLength(
      KARAKAMSA_APTITUDES.reduce((n, a) => n + a.houses.length, 0),
    );
  });

  it('every rule is single-condition and counts from the karakamsa', () => {
    for (const r of rules) {
      expect(arity(r), r.id).toBe(1);
      expect(r.when[0]!.k, r.id).toBe('placement');
      expect((r.when[0] as { from?: string }).from, r.id).toBe('karakamsa');
    }
  });

  it('ids are unique and cite chapter 33', () => {
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
    for (const r of rules) {
      expect(r.id).toMatch(/^bphs\.33\./);
      expect(r.source.chapter).toBe(33);
    }
  });

  it('fires against karakamsaFacts and stays silent against a rasi chart', () => {
    // The rasi chart has no karakamsa frame, so the rules return false — silence, not a
    // wrong answer. This is the whole reason the frame had to reach the generator too.
    const k = karakamsaFacts(facts(), 'moon')!;
    const kSign = k.lagnas!.karakamsa!;
    k.planets.venus!.sign = ((kSign + 4) % 12) as SignIndex;
    expect(fired(rules, k).some((h) => h.rule.id.includes('venus-in-5-from-karakamsa'))).toBe(true);
    expect(fired(rules, facts())).toHaveLength(0);
  });

  it('is registered in the SAME part that taught the generator the frame', () => {
    const ids = new Set(allEncodedRules().map((r) => r.id));
    for (const r of rules) expect(ids.has(r.id), r.id).toBe(true);
  });

  it('is honest that the generator supplies a synthetic frame, not a real navamsa', () => {
    expect(CH33_CALIBRATION_NOTE).toContain('not real navamsas');
    expect(CH33_CALIBRATION_NOTE).toContain('would NOT be');
  });
});

// ── Audit ────────────────────────────────────────────────────────────────────
describe('BPHS 33 — the audit trail', () => {
  it('names six exclusion themes, including the deity block', () => {
    expect(CH33_EXCLUSION_THEMES).toHaveLength(6);
    const joined = CH33_EXCLUSION_THEMES.join(' ');
    expect(joined).toContain('Medical claims');
    expect(joined).toContain('Deity and ritual');
    expect(joined).toContain('Longevity');
  });

  it('says what survived and why it was worth the part', () => {
    expect(CH33_YIELD.verses).toBe(99);
    expect(CH33_YIELD.note).toContain('real vocation signal');
  });
});
