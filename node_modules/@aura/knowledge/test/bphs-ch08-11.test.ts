// BPHS Programme Part 6 — Chapter 8 (rasi drishti) and Chapter 11 (judgement of houses),
// plus the Part 6 retrofit: the `aspect` predicate kind.

import { describe, it, expect } from 'vitest';
import {
  rasiAspects, rasiAspectsSign, rasiAspectsBetween,
  RASI_DRISHTI_IS_MUTUAL, RASI_VS_GRAHA_DRISHTI,
  BPHS_HOUSE_INDICATIONS, UNSURFACED_HOUSE_INDICATIONS,
  lordInFavourableAvastha, HOUSE_PROSPERITY_VETO, SPOILING_LORDSHIPS,
  houseProsperityRules, HOUSE_PROSPERITY_NOT_YET_EXPRESSIBLE,
  rasiDrishti, grahaAspectsFrom, BHAVAS,
  evaluate, arity,
  type ChartFacts,
} from '../src/index.js';

const SIGNS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// ── 8.1-5 rasi drishti, against the chapter's explicit statements ────────────
describe('BPHS 8.1-5 — rasi drishti', () => {
  it('Aries aspects Leo, Scorpio and Aquarius', () => {
    expect(rasiAspects(0).sort((a, b) => a - b)).toEqual([4, 7, 10]);
  });

  it('Taurus aspects Cancer, Libra and Capricorn', () => {
    expect(rasiAspects(1).sort((a, b) => a - b)).toEqual([3, 6, 9]);
  });

  it('Gemini aspects Virgo, Sagittarius and Pisces', () => {
    expect(rasiAspects(2).sort((a, b) => a - b)).toEqual([5, 8, 11]);
  });

  it('every sign aspects exactly three others', () => {
    for (const s of SIGNS) expect(rasiAspects(s), `sign ${s}`).toHaveLength(3);
  });

  it('never aspects itself', () => {
    for (const s of SIGNS) expect(rasiAspects(s)).not.toContain(s);
  });

  it('is MUTUAL — the property that separates it from graha drishti', () => {
    expect(RASI_DRISHTI_IS_MUTUAL).toBe(true);
    for (const a of SIGNS) {
      for (const b of rasiAspects(a)) {
        expect(rasiAspects(b), `${a}→${b} not returned`).toContain(a);
      }
    }
  });

  it('leaves the adjacent sign of the opposite modality unaspected', () => {
    // Aries (movable) skips Taurus; Taurus (fixed) skips Aries.
    expect(rasiAspects(0)).not.toContain(1);
    expect(rasiAspects(1)).not.toContain(0);
  });

  it('pairs movable with fixed, and dual only with dual', () => {
    for (const s of SIGNS) {
      const m = s % 3;
      for (const t of rasiAspects(s)) {
        if (m === 2) expect(t % 3, `${s}→${t}`).toBe(2);
        else expect(t % 3, `${s}→${t}`).toBe(m === 0 ? 1 : 0);
      }
    }
  });

  it('agrees with the pre-existing rasiDrishti for all twelve signs', () => {
    // Independent confirmation: that implementation had only been checked against the
    // first corpus. This closes the open thread positively rather than with a fix.
    for (const s of SIGNS) {
      expect([...rasiAspects(s)].sort((a, b) => a - b), `sign ${s}`)
        .toEqual([...rasiDrishti(s)].sort((a, b) => a - b));
    }
  });

  it('carries a planet’s aspect with the sign it occupies (8.4-5)', () => {
    expect(rasiAspectsBetween(0, 4)).toBe(true);   // planet in Aries sees one in Leo
    expect(rasiAspectsBetween(0, 1)).toBe(false);
    expect(rasiAspectsSign(2, 8)).toBe(true);
  });

  it('is a different system from graha drishti, and says so', () => {
    expect(RASI_VS_GRAHA_DRISHTI).toContain('do not merge');
    // Graha drishti is directional: the Sun in house 1 sees house 7, but that is a
    // house relation, not a mutual sign relation.
    expect(grahaAspectsFrom('sun', 1)).toContain(7);
  });
});

// ── Retrofit: the aspect predicate ───────────────────────────────────────────
describe('retrofit — the `aspect` predicate kind (Part 6 sweep)', () => {
  // Aquarius lagna. Sun+Venus in Gemini (h5), Saturn in Pisces (h2), Jupiter Capricorn (h12).
  const facts: ChartFacts = {
    lagnaSign: 10,
    lagnas: { hora: 0 },
    planets: {
      sun: { sign: 2, house: 5, longitude: 60 },
      moon: { sign: 5, house: 8, longitude: 178 },
      mars: { sign: 5, house: 8, longitude: 154 },
      mercury: { sign: 1, house: 4, longitude: 48 },
      jupiter: { sign: 9, house: 12, longitude: 298 },
      venus: { sign: 2, house: 5, longitude: 80 },
      saturn: { sign: 11, house: 2, longitude: 354 },
      rahu: { sign: 5, house: 8, longitude: 150 },
      ketu: { sign: 11, house: 2, longitude: 330 },
    },
  };

  it('resolves a planetary aspect onto a house', () => {
    // Every planet aspects the 7th from itself: Sun in h5 sees h11.
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 11 }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 9 }, facts)).toBe(false);
  });

  it('gives Jupiter its 5th and 9th aspects, not just the 7th', () => {
    // Jupiter in h12 sees h4, h6, h8.
    expect(evaluate({ k: 'aspect', graha: 'jupiter', ontoHouse: 4 }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'jupiter', ontoHouse: 8 }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'jupiter', ontoHouse: 5 }, facts)).toBe(false);
  });

  it('resolves an aspect onto another planet', () => {
    // Saturn in h2 sees h4, h8, h11 — the Moon sits in h8.
    expect(evaluate({ k: 'aspect', graha: 'saturn', ontoGraha: 'moon' }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'saturn', ontoGraha: 'venus' }, facts)).toBe(false);
  });

  it('switches system with `kind: rasi`', () => {
    // Sun in Gemini (dual) aspects Virgo, Sagittarius, Pisces by rasi drishti.
    // The Moon is in Virgo — so rasi drishti connects them, graha drishti does not.
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoGraha: 'moon', kind: 'rasi' }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoGraha: 'moon', kind: 'graha' }, facts)).toBe(false);
  });

  it('rasi drishti through the predicate stays mutual; graha drishti does not', () => {
    const a = evaluate({ k: 'aspect', graha: 'sun', ontoGraha: 'moon', kind: 'rasi' }, facts);
    const b = evaluate({ k: 'aspect', graha: 'moon', ontoGraha: 'sun', kind: 'rasi' }, facts);
    expect(a).toBe(b);
    // Asymmetry shows only in the SPECIAL aspects — the 7th is mutual by construction,
    // since if A is 7th from B then B is 7th from A. Saturn in h2 reaches Mercury in h4
    // by its 3rd aspect; Mercury from h4 sees only h10, so it does not reach back.
    expect(evaluate({ k: 'aspect', graha: 'saturn', ontoGraha: 'mercury' }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'mercury', ontoGraha: 'saturn' }, facts)).toBe(false);
  });

  it('honours the lagna frame for house targets', () => {
    // From the Hora lagna (Aries), the Sun sits in h3 and so aspects h9.
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 9, from: 'hora' }, facts)).toBe(true);
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 11, from: 'hora' }, facts)).toBe(false);
  });

  it('does not fire for a frame the chart lacks', () => {
    expect(evaluate({ k: 'aspect', graha: 'sun', ontoHouse: 11, from: 'ghatika' }, facts)).toBe(false);
  });

  it('does not fire without a target', () => {
    expect(evaluate({ k: 'aspect', graha: 'sun' }, facts)).toBe(false);
  });
});

// ── 11.2-13 house indications ────────────────────────────────────────────────
describe('BPHS 11.2-13 — house indications', () => {
  it('covers all twelve houses', () => {
    for (let h = 1; h <= 12; h++) {
      expect(BPHS_HOUSE_INDICATIONS[h], `house ${h}`).toBeTruthy();
      expect(BPHS_HOUSE_INDICATIONS[h]!.length).toBeGreaterThan(0);
    }
  });

  it('agrees with the existing BHAVAS data on the core of each house', () => {
    const has = (h: number, word: string) =>
      BHAVAS.find((b) => b.number === h)!.significations.join(' ').toLowerCase().includes(word);
    expect(has(4, 'mother')).toBe(true);
    expect(has(7, 'spouse')).toBe(true);
    expect(has(9, 'father')).toBe(true);
    expect(has(11, 'gains') || has(11, 'income')).toBe(true);
  });

  it('keeps death-adjacent indications out of the surfaced table', () => {
    // BPHS gives the 2nd "death", the 3rd "parents' death", the 12th "one's own death".
    // Policy: computed, never surfaced. They live in a separate map.
    for (const list of Object.values(BPHS_HOUSE_INDICATIONS)) {
      expect(list.join(' ').toLowerCase()).not.toContain('death');
    }
    expect(UNSURFACED_HOUSE_INDICATIONS[2]).toBeTruthy();
    expect(UNSURFACED_HOUSE_INDICATIONS[12]).toBeTruthy();
  });
});

// ── 11.14-16 prosperity of a house ───────────────────────────────────────────
describe('BPHS 11.14-16 — prosperity or annihilation of a house', () => {
  it('places the favourable avastha window at 6-18° odd, 12-24° even', () => {
    expect(lordInFavourableAvastha(0, 10)).toBe(true);    // Aries, odd
    expect(lordInFavourableAvastha(0, 3)).toBe(false);
    expect(lordInFavourableAvastha(0, 20)).toBe(false);
    expect(lordInFavourableAvastha(1, 20)).toBe(true);    // Taurus, even
    expect(lordInFavourableAvastha(1, 10)).toBe(false);
  });

  it('spans exactly 12° of every sign, whichever parity', () => {
    for (const s of SIGNS) {
      const inWindow = Array.from({ length: 300 }, (_, i) => i / 10)
        .filter((d) => lordInFavourableAvastha(s, d));
      expect(inWindow.length, `sign ${s}`).toBe(120); // 12° at 0.1° steps
    }
  });

  it('names the veto and the spoiling lordships', () => {
    expect(HOUSE_PROSPERITY_VETO).toContain('debilitated');
    expect(HOUSE_PROSPERITY_VETO).toContain('combust');
    expect(SPOILING_LORDSHIPS).toEqual([3, 6, 8, 11, 12]);
  });

  it('emits real Rule records with counted arity and traceable sources', () => {
    const rules = houseProsperityRules(7);
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) {
      expect(r.source.text).toBe('bphs');
      expect(r.source.chapter).toBe(11);
      expect(r.when.length).toBeGreaterThan(0);
      expect(arity(r)).toBe(r.when.length);
      expect(r.id).toContain('bphs.11.');
    }
  });

  it('instantiates per house, so ids and effects stay distinct', () => {
    const a = houseProsperityRules(7).map((r) => r.id);
    const b = houseProsperityRules(4).map((r) => r.id);
    expect(new Set([...a, ...b]).size).toBe(a.length + b.length);
  });

  it('names what it cannot yet express instead of approximating it', () => {
    expect(HOUSE_PROSPERITY_NOT_YET_EXPRESSIBLE.length).toBeGreaterThanOrEqual(3);
  });

  it('no longer lists graha yuddha — Part 11 closed that one', () => {
    // BPHS 27.20 turned out to hold planetary war, not ch 26. Once Part 11 encoded it the
    // predicate DSL gained `state: 'defeated'`, so the clause became expressible.
    expect(HOUSE_PROSPERITY_NOT_YET_EXPRESSIBLE.join(' ')).not.toContain('graha yuddha');
  });

  it('can now express a lord defeated in planetary war', () => {
    const facts: ChartFacts = {
      lagnaSign: 0,
      defeatedInWar: ['saturn'],
      planets: {
        sun: { sign: 0, house: 1, longitude: 5 },
        moon: { sign: 1, house: 2, longitude: 35 },
        mars: { sign: 2, house: 3, longitude: 65 },
        mercury: { sign: 3, house: 4, longitude: 95 },
        jupiter: { sign: 4, house: 5, longitude: 125 },
        venus: { sign: 5, house: 6, longitude: 155 },
        saturn: { sign: 6, house: 7, longitude: 185 },
        rahu: { sign: 7, house: 8, longitude: 215 },
        ketu: { sign: 1, house: 2, longitude: 35 },
      },
    };
    expect(evaluate({ k: 'state', graha: 'saturn', is: 'defeated' }, facts)).toBe(true);
    expect(evaluate({ k: 'state', graha: 'mars', is: 'defeated' }, facts)).toBe(false);
  });
});
