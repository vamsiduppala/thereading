// BPHS Programme Part 4 — Chapter 6b: D27…D60 and the varga classification schemes.

import { describe, it, expect } from 'vitest';
import {
  BHAMSA_START_BY_ELEMENT,
  TRIMSAMSA_ODD, TRIMSAMSA_EVEN, trimsamsaPart,
  KHAVEDAMSA_START, AKSHAVEDAMSA_START,
  shashtiamsaOffset, shashtiamsaSign, shashtiamsa,
  SHASHTIAMSA_NAMES, SHASHTIAMSA_NATURE, SHASHTIAMSA_NOTES,
  VARGA_SCHEMES, VARGA_DESIGNATIONS, DASAVARGA_ALIASES,
  vargaDesignation, classifyVarga, isDisqualified,
  GOOD_VARGA_CRITERIA, ARUDHA_CRITERION_DEFAULT,
  SHODASAVARGA, vargaSign,
} from '../src/index.js';

const SIGNS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// ── 6.33-41 D60, decided by the chapter's own worked example ─────────────────
describe('BPHS 6.33-41 — Shashtiamsa, and the example that settles the reading', () => {
  it("reproduces the book's example: Venus in Capricorn 13°25' → Pisces", () => {
    // 13°25' × 2 = 26°50'; 26 ÷ 12 leaves 2; +1 = 3; count 3 signs from Capricorn.
    const deg = 13 + 25 / 60;
    expect(shashtiamsaOffset(deg)).toBe(2);
    expect(shashtiamsaSign(9, deg)).toBe(11);         // Pisces
  });

  it('counts from the planet\'s own sign, not from Aries', () => {
    // Reading "ignore the sign position" as counting from Aries would give sign 2 here.
    const deg = 13 + 25 / 60;
    expect(shashtiamsaSign(9, deg)).not.toBe(shashtiamsaOffset(deg));
    expect(shashtiamsaSign(9, deg)).toBe(11);
  });

  it('agrees with vargaSign(_, 60) — the existing construction was already correct', () => {
    for (const sign of SIGNS) {
      for (const deg of [0.1, 5.4, 13 + 25 / 60, 22.75, 29.9]) {
        expect(vargaSign(sign * 30 + deg, 60), `sign ${sign} deg ${deg}`)
          .toBe(shashtiamsaSign(sign, deg));
      }
    }
  });

  it('takes the remainder on whole degrees, discarding minutes', () => {
    // 13°25' × 2 = 26°50' → the 50' is dropped before dividing.
    expect(shashtiamsaOffset(13 + 25 / 60)).toBe(shashtiamsaOffset(13));
  });

  it('names all sixty divisions', () => {
    expect(SHASHTIAMSA_NAMES).toHaveLength(60);
    expect(SHASHTIAMSA_NAMES[0]).toBe('Ghora');
    expect(SHASHTIAMSA_NAMES[59]).toBe('Chandrarekha');
  });

  it('reverses the name order for an even sign (6.41)', () => {
    const odd = shashtiamsa(0, 0.1);    // Aries, first shashtiamsa
    const even = shashtiamsa(1, 0.1);   // Taurus, first shashtiamsa
    expect(odd.index).toBe(0);
    expect(even.index).toBe(59);
    expect(even.name).toBe(SHASHTIAMSA_NAMES[59]);
  });

  it('leaves seven natures null rather than guessing them', () => {
    expect(SHASHTIAMSA_NATURE).toHaveLength(60);
    const unknown = SHASHTIAMSA_NATURE
      .map((n, i) => (n === null ? i : -1)).filter((i) => i >= 0);
    expect(unknown).toEqual([27, 50, 55, 56, 57, 58, 59]);
    expect(SHASHTIAMSA_NOTES.incomplete).toContain('null rather than guessed');
  });

  it('fills index 0 from the table\'s own cross-reference at entry 34', () => {
    // Entry 34 reads "Ghora (M) — same as S.No. 1", which states index 0 by identity.
    expect(SHASHTIAMSA_NATURE[0]).toBe('malefic');
    expect(SHASHTIAMSA_NATURE[33]).toBe('malefic');
    expect(SHASHTIAMSA_NAMES[0]).toBe(SHASHTIAMSA_NAMES[33]);
  });

  it('flags Kalinasa as contested', () => {
    expect(SHASHTIAMSA_NATURE[26]).toBe('benefic');
    expect(SHASHTIAMSA_NOTES.kalinasa).toContain('contested');
  });

  it('returns name, nature and sign together', () => {
    const r = shashtiamsa(9, 13 + 25 / 60);
    expect(r.sign).toBe(11);
    expect(r.name).toBeTruthy();
  });
});

// ── 6.27-28 Trimsamsa ────────────────────────────────────────────────────────
describe('BPHS 6.27-28 — Trimsamsa', () => {
  it('gives odd signs Mars 5, Saturn 5, Jupiter 8, Mercury 7, Venus 5', () => {
    expect(TRIMSAMSA_ODD.map((p) => p.lord))
      .toEqual(['mars', 'saturn', 'jupiter', 'mercury', 'venus']);
    expect(TRIMSAMSA_ODD.map((p) => p.span)).toEqual([5, 5, 8, 7, 5]);
  });

  it('spans sum to a whole sign', () => {
    expect(TRIMSAMSA_ODD.reduce((s, p) => s + p.span, 0)).toBe(30);
    expect(TRIMSAMSA_EVEN.reduce((s, p) => s + p.span, 0)).toBe(30);
  });

  it('reverses lords, spans and deities together for an even sign', () => {
    expect(TRIMSAMSA_EVEN.map((p) => p.lord))
      .toEqual(['venus', 'mercury', 'jupiter', 'saturn', 'mars']);
    expect(TRIMSAMSA_EVEN.map((p) => p.span)).toEqual([5, 7, 8, 5, 5]);
  });

  it('names the five deities', () => {
    expect(TRIMSAMSA_ODD.map((p) => p.deity))
      .toEqual(['Agni', 'Vayu', 'Indra', 'Kubera', 'Varuna']);
  });

  it('places a degree in the right unequal arc', () => {
    expect(trimsamsaPart(0, 2).lord).toBe('mars');       // Aries 0-5
    expect(trimsamsaPart(0, 7).lord).toBe('saturn');     // 5-10
    expect(trimsamsaPart(0, 15).lord).toBe('jupiter');   // 10-18
    expect(trimsamsaPart(0, 20).lord).toBe('mercury');   // 18-25
    expect(trimsamsaPart(0, 28).lord).toBe('venus');     // 25-30
  });

  it('uses the reversed arcs for an even sign', () => {
    expect(trimsamsaPart(1, 2).lord).toBe('venus');      // Taurus 0-5
    expect(trimsamsaPart(1, 8).lord).toBe('mercury');    // 5-12
    expect(trimsamsaPart(1, 28).lord).toBe('mars');      // 25-30
  });

  it('agrees with vargaSign(_, 30) on the lord\'s own sign', () => {
    // vargaSign returns a SIGN; the lord of that sign must be the trimsamsa lord.
    const LORD_OF: Record<number, string> = {
      0: 'mars', 10: 'saturn', 8: 'jupiter', 2: 'mercury', 6: 'venus',
      1: 'venus', 5: 'mercury', 11: 'jupiter', 9: 'saturn', 7: 'mars',
    };
    for (const sign of SIGNS) {
      for (const deg of [2, 7, 15, 20, 28]) {
        const vs = vargaSign(sign * 30 + deg, 30);
        expect(LORD_OF[vs], `sign ${sign} deg ${deg}`).toBe(trimsamsaPart(sign, deg).lord);
      }
    }
  });
});

// ── 6.24-32 remaining constructions ──────────────────────────────────────────
describe('BPHS 6.24-32 — D27, D40, D45 start points', () => {
  it('D27 starts Aries/Cancer/Libra/Capricorn by element (6.24-26)', () => {
    expect(BHAMSA_START_BY_ELEMENT).toEqual([0, 3, 6, 9]);
    for (const sign of SIGNS) {
      expect(vargaSign(sign * 30 + 0.01, 27)).toBe(BHAMSA_START_BY_ELEMENT[sign % 4]);
    }
  });

  it('D40 starts Aries for odd signs and Libra for even (6.29-30)', () => {
    for (const sign of SIGNS) {
      const expected = sign % 2 === 0 ? KHAVEDAMSA_START.odd : KHAVEDAMSA_START.even;
      expect(vargaSign(sign * 30 + 0.01, 40)).toBe(expected);
    }
  });

  it('D45 starts Aries/Leo/Sagittarius by modality (6.31-32)', () => {
    for (const sign of SIGNS) {
      expect(vargaSign(sign * 30 + 0.01, 45)).toBe(AKSHAVEDAMSA_START[sign % 3]);
    }
  });
});

// ── 6.42-53 Varga classification ─────────────────────────────────────────────
describe('BPHS 6.42-53 — the four varga schemes', () => {
  it('Shadvarga is D1, D2, D3, D9, D12, D30', () => {
    expect(VARGA_SCHEMES.shadvarga).toEqual([1, 2, 3, 9, 12, 30]);
  });

  it('Saptavarga adds D7 to the Shadvarga', () => {
    expect(VARGA_SCHEMES.saptavarga).toHaveLength(7);
    for (const d of VARGA_SCHEMES.shadvarga) expect(VARGA_SCHEMES.saptavarga).toContain(d);
    expect(VARGA_SCHEMES.saptavarga).toContain(7);
  });

  it('Dasavarga adds D10, D16 and D60 to the Saptavarga', () => {
    expect(VARGA_SCHEMES.dasavarga).toHaveLength(10);
    for (const d of VARGA_SCHEMES.saptavarga) expect(VARGA_SCHEMES.dasavarga).toContain(d);
    for (const d of [10, 16, 60]) expect(VARGA_SCHEMES.dasavarga).toContain(d);
  });

  it('Shodasavarga is all sixteen, and matches Part 3\'s canonical list', () => {
    expect(VARGA_SCHEMES.shodasavarga).toEqual([...SHODASAVARGA]);
  });

  it('never includes a divisor outside BPHS\'s sixteen', () => {
    for (const scheme of Object.values(VARGA_SCHEMES)) {
      for (const d of scheme) expect(SHODASAVARGA).toContain(d);
      for (const bad of [5, 6, 8, 11]) expect(scheme).not.toContain(bad);
    }
  });

  it('every scheme is a subset of the next', () => {
    const chain: (keyof typeof VARGA_SCHEMES)[] = ['shadvarga', 'saptavarga', 'dasavarga', 'shodasavarga'];
    for (let i = 1; i < chain.length; i++) {
      for (const d of VARGA_SCHEMES[chain[i - 1]!]) {
        expect(VARGA_SCHEMES[chain[i]!], `${chain[i - 1]} ⊄ ${chain[i]}`).toContain(d);
      }
    }
  });
});

describe('BPHS 6.42-53 — the designation ladders', () => {
  it('runs Kimsuka → Kundala for the Shadvarga', () => {
    expect(vargaDesignation('shadvarga', 2)).toBe('Kimsuka');
    expect(vargaDesignation('shadvarga', 6)).toBe('Kundala');
  });

  it('adds Mukuta at seven for the Saptavarga', () => {
    expect(vargaDesignation('saptavarga', 6)).toBe('Kundala');
    expect(vargaDesignation('saptavarga', 7)).toBe('Mukuta');
  });

  it('runs Parijata → Sridhama for the Dasavarga', () => {
    expect(vargaDesignation('dasavarga', 2)).toBe('Parijata');
    expect(vargaDesignation('dasavarga', 5)).toBe('Simhasana');
    expect(vargaDesignation('dasavarga', 10)).toBe('Sridhama');
  });

  it('runs Bhedaka → Sri Vallabha for the Shodasavarga', () => {
    expect(vargaDesignation('shodasavarga', 2)).toBe('Bhedaka');
    expect(vargaDesignation('shodasavarga', 16)).toBe('Sri Vallabha');
  });

  it('gives no designation below two good divisions', () => {
    for (const s of Object.keys(VARGA_SCHEMES) as (keyof typeof VARGA_SCHEMES)[]) {
      expect(vargaDesignation(s, 0)).toBeNull();
      expect(vargaDesignation(s, 1)).toBeNull();
    }
  });

  it('has a designation for every count from 2 up to the scheme size', () => {
    for (const [scheme, divisions] of Object.entries(VARGA_SCHEMES)) {
      const ladder = VARGA_DESIGNATIONS[scheme as keyof typeof VARGA_DESIGNATIONS];
      for (let n = 2; n <= divisions.length; n++) {
        expect(ladder[n], `${scheme} @ ${n}`).toBeTruthy();
      }
    }
  });

  it('carries the Sarvartha Chintamani aliases for the top three Dasavarga grades', () => {
    expect(DASAVARGA_ALIASES.Sridhama).toBe('Vaiseshikamsa');
    expect(DASAVARGA_ALIASES.Sakravahana).toBe('Iravata');
    expect(DASAVARGA_ALIASES.Brahmaloka).toBe('Amara');
  });
});

describe('BPHS 6.52-53 — what counts as good, and what vetoes it', () => {
  it('lists the four criteria, with the Arudha one last', () => {
    expect(GOOD_VARGA_CRITERIA).toHaveLength(4);
    expect(GOOD_VARGA_CRITERIA[3]).toContain('Arudha');
  });

  it('leaves the Arudha criterion off by default', () => {
    expect(ARUDHA_CRITERION_DEFAULT).toBe(false);
  });

  it('counts only divisions belonging to the scheme', () => {
    // D4 and D20 are in Shodasavarga but not in Shadvarga.
    const r = classifyVarga('shadvarga', [1, 9, 4, 20]);
    expect(r.goodCount).toBe(2);
    expect(r.designation).toBe('Kimsuka');
  });

  it('vetoes everything for a combust or defeated planet (6.53)', () => {
    const good = [1, 2, 3, 9, 12, 30];
    expect(classifyVarga('shadvarga', good).goodCount).toBe(6);
    expect(classifyVarga('shadvarga', good, { combust: true }).goodCount).toBe(0);
    expect(classifyVarga('shadvarga', good, { defeatedInWar: true }).designation).toBeNull();
    expect(classifyVarga('shadvarga', good, { weak: true }).disqualified).toBe(true);
    expect(classifyVarga('shadvarga', good, { adverseAvastha: true }).disqualified).toBe(true);
  });

  it('treats disqualification as a veto, not a discount', () => {
    expect(isDisqualified({})).toBe(false);
    expect(isDisqualified({ combust: true })).toBe(true);
  });

  it('attaches the popular alias when one exists', () => {
    const all = VARGA_SCHEMES.dasavarga;
    expect(classifyVarga('dasavarga', all).designation).toBe('Sridhama');
    expect(classifyVarga('dasavarga', all).alias).toBe('Vaiseshikamsa');
    expect(classifyVarga('shadvarga', [1, 2]).alias).toBeUndefined();
  });
});
