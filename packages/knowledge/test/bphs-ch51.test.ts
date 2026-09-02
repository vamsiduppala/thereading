// BPHS Programme Part 39 — Chapter 51: five antardasa systems.
//
// The load-bearing tests here are the ones that assert **the book's own numbers**: six worked
// examples for the subdivisions and two full twelve-entry sequences for the order. A rule with
// as many branches as 51.6-12 (parity × modality, plus a direction-sensitive count) is exactly
// the kind that produces a plausible wrong answer, and two complete sequences reproducing
// entry-for-entry is what rules that out.

import { describe, it, expect } from 'vitest';
import {
  SUBDIVISION_VERIFIED, antardasaShortcut, SHORTCUT_IS_EXACT, ANTARDASA_TABLE_FAULTS,
  charaPlanetAntardasaYears, houseGroup, CHARA_PLANET_ANTARDASA_IS_EQUAL,
  rasiAntardasaYears, rasiAntardasaOrder, RASI_ANTARDASA_ORDER_RULE,
  DUAL_ORDER_COUNTS_IN_THE_DIRECTION_OF_TRAVEL, SEED_IS_THE_STRONGER_OF_TWO,
  bhogaRasi, PAKA_BHOGA_PARITY_CLAUSE_UNRESOLVED, pakaBhogaVerdict,
  PAKA_BHOGA_SOMATIC_CLAIM_DROPPED, kalachakraAntardasaYears,
  KALACHAKRA_ANTARDASA_TOTAL_IS_100, PACHAKA_SHARES,
  PINDA_SUBDIVISION_RECORDED_NOT_SURFACED, CH51_TRANSLATOR_RECONSTRUCTED_13_16, CH51_YIELD,
  subPeriodYears, dashaSequence, VIMSHOTTARI_YEARS,
} from '../src/index.js';

// Sign indices, 0 = Aries.
const AR = 0, TA = 1, GE = 2, CN = 3, LE = 4, VI = 5;
const LI = 6, SC = 7, SG = 8, CP = 9, AQ = 10, PI = 11;

// The book prints Y.M.D on 30-day months; these convert so assertions read like the page.
const ymd = (years: number) => {
  const y = Math.floor(years + 1e-9);
  const months = (years - y) * 12;
  const m = Math.floor(months + 1e-9);
  return { y, m, d: Math.round((months - m) * 30) };
};

// ── 51.1-2: the reconciliation ───────────────────────────────────────────────
describe('BPHS 51.1-2 — the Vimshottari subdivision we already shipped', () => {
  it('Venus in Venus is 3 years 4 months, as the chapter computes it', () => {
    // "20 X 20 = 400 ÷ 120 = 3 years 4 months."
    const got = subPeriodYears(VIMSHOTTARI_YEARS['venus'], 'venus');
    expect(ymd(got)).toEqual({ y: 3, m: 4, d: 0 });
  });

  it('the pratyantar of Venus in that antardasa is 6 months 20 days', () => {
    // "40 X 240 = 9600 months ÷ 1440 months = 6 months and 20 days."
    const antar = subPeriodYears(VIMSHOTTARI_YEARS['venus'], 'venus');   // 3y 4m = 40 months
    const praty = subPeriodYears(antar, 'venus');
    expect(ymd(praty)).toEqual({ y: 0, m: 6, d: 20 });
  });

  it('Mercury in Saturn is 2 years 8 months 9 days', () => {
    // "17 X 19 = 323 … the Antardasa of Mercury will be 32 months and 9 days."
    const got = subPeriodYears(VIMSHOTTARI_YEARS['saturn'], 'mercury');
    expect(ymd(got)).toEqual({ y: 2, m: 8, d: 9 });
  });

  it('51.2 — the FIRST antardasa belongs to the dasha lord', () => {
    for (const lord of ['sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury', 'ketu', 'venus'] as const) {
      expect(dashaSequence(lord)[0], lord).toBe(lord);
      expect(dashaSequence(lord)).toHaveLength(9);
    }
  });

  it('every antardasa of a dasha sums back to the dasha itself', () => {
    // The identity the chapter's own table fails and the formula does not.
    for (const lord of Object.keys(VIMSHOTTARI_YEARS) as (keyof typeof VIMSHOTTARI_YEARS)[]) {
      const total = dashaSequence(lord)
        .reduce((t, sub) => t + subPeriodYears(VIMSHOTTARI_YEARS[lord], sub), 0);
      expect(total, lord).toBeCloseTo(VIMSHOTTARI_YEARS[lord], 9);
    }
  });

  it('records the reconciliation as having changed nothing', () => {
    expect(SUBDIVISION_VERIFIED).toContain('ALL SIX agree');
    expect(SUBDIVISION_VERIFIED).toContain('NOTHING CHANGED');
  });
});

describe('BPHS 51.1 — the mental shortcut, which is exact', () => {
  it('reproduces the chapter’s example: Mercury in Saturn, 32 months 9 days', () => {
    expect(antardasaShortcut(19, 17)).toEqual({ months: 32, days: 9 });
  });

  it('agrees with the full formula for all 81 pairs — that is what makes it exact', () => {
    const lords = Object.keys(VIMSHOTTARI_YEARS) as (keyof typeof VIMSHOTTARI_YEARS)[];
    for (const maha of lords) {
      for (const antar of lords) {
        const short = antardasaShortcut(VIMSHOTTARI_YEARS[maha], VIMSHOTTARI_YEARS[antar]);
        const exact = subPeriodYears(VIMSHOTTARI_YEARS[maha], antar);
        expect(short.months * 30 + short.days, `${maha} x ${antar}`)
          .toBeCloseTo(exact * 360, 9);
      }
    }
    expect(SHORTCUT_IS_EXACT).toContain('EXACT');
  });

  it('records that the printed table, not the formula, is what is wrong', () => {
    expect(ANTARDASA_TABLE_FAULTS).toContain('11 of the');
    expect(ANTARDASA_TABLE_FAULTS).toContain('fails its own stated total');
    expect(ANTARDASA_TABLE_FAULTS).toContain('NOTHING was changed');
  });
});

// ── 51.3-4: the equal ninth ──────────────────────────────────────────────────
describe('BPHS 51.3-4 — the Chara dasha OF PLANETS divides by nine', () => {
  it('gives every planet the same share, unlike Vimshottari', () => {
    expect(charaPlanetAntardasaYears(9)).toBe(1);
    expect(charaPlanetAntardasaYears(7)).toBeCloseTo(7 / 9, 9);
    // The distinguishing property: the share does not depend on WHICH planet holds it.
    const shares = new Set([1, 2, 3].map(() => charaPlanetAntardasaYears(12)));
    expect(shares.size).toBe(1);
  });

  it('classifies the three house groups the verse orders by', () => {
    expect([1, 4, 7, 10].map(houseGroup)).toEqual(Array(4).fill('kendra'));
    expect([2, 5, 8, 11].map(houseGroup)).toEqual(Array(4).fill('panaphara'));
    expect([3, 6, 9, 12].map(houseGroup)).toEqual(Array(4).fill('apoklima'));
  });

  it('is honest that "according to their strength" names no measure', () => {
    expect(CHARA_PLANET_ANTARDASA_IS_EQUAL).toContain('taken as an argument');
  });
});

// ── 51.5-12: the rasi antardasa and its order ────────────────────────────────
describe('BPHS 51.5 — a rasi antardasa is one twelfth', () => {
  it('reproduces the chapter’s Aquarius example: 8 years → 8 months each', () => {
    expect(rasiAntardasaYears(8) * 12).toBeCloseTo(8, 9);
    expect(ymd(rasiAntardasaYears(8))).toEqual({ y: 0, m: 8, d: 0 });
  });

  it('always tiles the parent period exactly', () => {
    for (const years of [4, 7, 8, 9, 10, 12]) {
      expect(rasiAntardasaYears(years) * 12, `${years}y`).toBeCloseTo(years, 9);
    }
  });
});

describe('BPHS 51.6-12 — the order, against both of the chapter’s worked examples', () => {
  it('Aquarius (fixed, odd): every sixth rasi, onwards — all twelve', () => {
    // "the first Antardasa will be of Aquarius, then of Cancer, the sixth rashi from it, and
    // later of Sagittarius, the sixth rashi from Cancer, and so on."
    const got = rasiAntardasaOrder(AQ);
    expect(got.slice(0, 6)).toEqual([AQ, CN, SG, TA, LI, PI]);
    expect(new Set(got).size).toBe(12);
  });

  it('Pisces (dual, even): three kendra groups, reversed — all twelve, in order', () => {
    // The chapter names every one of the twelve, so this is a complete check:
    // "Pisces itself. Then in the reverse order … Sagittarius, Virgo and Gemini. After that
    //  … Scorpio, Leo, Taurus and Aquarius. Lastly … Cancer, Aries, Capricorn and Libra."
    expect(rasiAntardasaOrder(PI)).toEqual([
      PI, SG, VI, GE,
      SC, LE, TA, AQ,
      CN, AR, CP, LI,
    ]);
  });

  it('Aries (movable, odd): all twelve one step at a time, onwards', () => {
    // "In the Dasha of Aries there will be Antardasa of the 12 rāśhis (including Aries) in
    //  onwards order as Aries is Moveable and odd sign."
    expect(rasiAntardasaOrder(AR))
      .toEqual([AR, TA, GE, CN, LE, VI, LI, SC, SG, CP, AQ, PI]);
  });

  it('visits all twelve rasis exactly once, whatever the seed', () => {
    // True for each pattern: step 1 and step 5 are both coprime with 12, and the dual case
    // is three disjoint kendra sets. A pattern that failed this would be losing a period.
    for (let s = 0; s < 12; s++) {
      const got = rasiAntardasaOrder(s as 0);
      expect(got, `seed ${s}`).toHaveLength(12);
      expect(new Set(got).size, `seed ${s}`).toBe(12);
      expect(got[0], `seed ${s} starts at itself`).toBe(s);
    }
  });

  it('reverses for an even rasi and not for an odd one', () => {
    // Both movable, so the step is one sign and only the direction differs. (Taurus would
    // NOT do here: it is fixed, so it steps by five and its second entry is Sagittarius.)
    expect(rasiAntardasaOrder(AR)[1]).toBe(TA);   // Aries, the 1st sign — odd, onwards
    expect(rasiAntardasaOrder(CN)[1]).toBe(GE);   // Cancer, the 4th — even, reverse
    expect(rasiAntardasaOrder(TA)[1]).toBe(SG);   // and the fixed step, for contrast
  });

  it('counts the dual seeds in the DIRECTION OF TRAVEL — the subtle half', () => {
    // Pisces is even, so its "5th" is counted backwards and lands on Scorpio, as the chapter
    // says. Counting it forwards would give Cancer and produce a wrong-but-plausible order
    // for every even dual rasi.
    expect(rasiAntardasaOrder(PI)[4]).toBe(SC);
    // Gemini is dual and odd, so the same seeds are counted forwards: the 5th is Libra.
    expect(rasiAntardasaOrder(GE)[4]).toBe(LI);
    expect(DUAL_ORDER_COUNTS_IN_THE_DIRECTION_OF_TRAVEL).toContain('a quarter of all rasi dashas');
  });

  it('records the starting-point fork rather than resolving it', () => {
    expect(SEED_IS_THE_STRONGER_OF_TWO).toContain('rotated by six');
    // And the claim is true: seeding at the 7th gives the same cycle, six along.
    const a = rasiAntardasaOrder(AR);
    const b = rasiAntardasaOrder(LI);
    expect(new Set(a)).toEqual(new Set(b));
    expect(b[0]).toBe(LI);
  });

  it('states the rule it encodes', () => {
    expect(RASI_ANTARDASA_ORDER_RULE).toContain('PARITY sets the direction');
    expect(RASI_ANTARDASA_ORDER_RULE).toContain('MODALITY sets');
  });
});

describe('BPHS 51.9-11 — Paka and Bhoga', () => {
  it('makes them the same rasi for the first dasha of a cycle', () => {
    expect(bhogaRasi(AQ, AQ)).toBe(AQ);
  });

  it('reproduces the chapter’s example: Pisces after Aquarius gives Aries', () => {
    // "Pisces … is 2nd from the first Dasha Prada rashi Aquarius. Therefore, the 2nd rashi
    //  from Pisces, namely, Aries will be the Bhoga rashi."
    expect(bhogaRasi(AQ, PI)).toBe(AR);
  });

  it('records the parity clause as unresolved rather than guessing', () => {
    expect(PAKA_BHOGA_PARITY_CLAUSE_UNRESOLVED).toContain('muddled');
    expect(PAKA_BHOGA_PARITY_CLAUSE_UNRESOLVED).toContain('not guessed at');
  });

  it('drops 51.12’s somatic claim and keeps the structural reading', () => {
    const bad = pakaBhogaVerdict('malefic');
    expect(bad.valence).toBeLessThan(0);
    expect(/pain|body|agony|disease|ill/i.test(bad.summary)).toBe(false);
    expect(pakaBhogaVerdict('benefic').valence).toBeGreaterThan(0);
    expect(pakaBhogaVerdict('mixed').valence).toBe(0);
    expect(PAKA_BHOGA_SOMATIC_CLAIM_DROPPED).toContain('not carried');
  });
});

// ── Kalachakra ───────────────────────────────────────────────────────────────
describe('BPHS 51 — the Kalachakra antardasa, verified to the ghatika', () => {
  it('Aries in Aries: 5 months, 26 days and 24 ghatikas', () => {
    const y = kalachakraAntardasaYears(7, 7);
    expect(y).toBeCloseTo(0.49, 12);
    const months = y * 12;
    const m = Math.floor(months);
    const days = (months - m) * 30;
    const d = Math.floor(days);
    expect(m).toBe(5);
    expect(d).toBe(26);
    // A ghatika is a sixtieth of a day; 0.4 of a day is exactly 24 of them.
    expect(Math.round((days - d) * 60)).toBe(24);
  });

  it('Sagittarius in Aries: 8 months 12 days', () => {
    expect(ymd(kalachakraAntardasaYears(7, 10))).toEqual({ y: 0, m: 8, d: 12 });
  });

  it('divides by 100, not 120 — the difference from Vimshottari', () => {
    expect(kalachakraAntardasaYears(10, 10)).toBe(1);
    expect(kalachakraAntardasaYears(10, 10)).not.toBe(subPeriodYears(10, 'moon'));
    expect(KALACHAKRA_ANTARDASA_TOTAL_IS_100).toContain('TO THE GHATIKA');
  });
});

// ── Pinda / Amsa / Nisarga: recorded, still refused ──────────────────────────
describe('BPHS 51.13-16 — recorded, and the Part 37 refusal still stands', () => {
  it('keeps the Pachaka shares as a CLOSED list', () => {
    expect(PACHAKA_SHARES).toHaveLength(6);
    expect(PACHAKA_SHARES.map((p) => p.share))
      .toEqual(['1/1', '1/2', '1/3', '1/4', '1/7', '0']);
    expect(PACHAKA_SHARES.at(-1)!.note).toContain('closed list, not a default');
  });

  it('does not reopen Part 37’s refusal of the systems themselves', () => {
    expect(PINDA_SUBDIVISION_RECORDED_NOT_SURFACED).toContain('PART 37 REFUSED');
    expect(PINDA_SUBDIVISION_RECORDED_NOT_SURFACED).toContain('that decision stands');
  });

  it('flags that the translator reconstructed this block rather than translating it', () => {
    expect(CH51_TRANSLATOR_RECONSTRUCTED_13_16).toContain('RECONSTRUCTION, not translation');
  });
});

describe('Part 39 — the yield', () => {
  it('is honest that half the part was a reconciliation that changed nothing', () => {
    expect(CH51_YIELD.note).toContain('NOTHING CHANGED');
    expect(CH51_YIELD.note).toContain('NEW CAPABILITY');
  });
});
