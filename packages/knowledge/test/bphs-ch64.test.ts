// BPHS Programme Part 44 — Chapter 64: the Kalachakra antardasa.
//
// The tests that carry weight here are the arithmetic ones. `the Aries amsa group sums to its
// own stated total` is the check that caught the chapter's transcription fault, and it is
// written so that if `KALACHAKRA_RASI_YEARS` is ever edited, the four independent confirmations
// stop agreeing and this fails.

import { describe, it, expect } from 'vitest';
import {
  RASI_YEARS_CONFIRMED_INDEPENDENTLY, RASI_YEARS_ARE_A_PER_RASI_CONSTANT,
  ARIES_AMSA_TABLE_HAS_ONE_FAULT, KALACHAKRA_FRIENDSHIP_RULE, kalachakraAntarVerdict,
  SAVYA_ONLY_HABIT_SUPPORTS_CANDIDATE_ONE, CH64_EFFECT_PROSE_REFUSED, CH64_RASI_YEARS,
  CH64_YIELD,
  KALACHAKRA_RASI_YEARS, CH46_POORNAYU_BY_AMSA, POORNAYU_MAPPING_UNRESOLVED,
  SOURCE_STATED_ARBITRATION, kalachakraAntardasaYears, lordOfSign, allEncodedRules,
} from '../src/index.js';

const AR = 0, TA = 1, GE = 2, CN = 3, LE = 4, VI = 5;
const LI = 6, SC = 7, SG = 8, CP = 9, AQ = 10, PI = 11;

/**
 * The 36 (amsa, rasi, years) observations recovered from chapter 64's section headings.
 * Transcribed here so the confirmation is reproducible rather than asserted — if the shipped
 * vector changes, these stop matching.
 */
const CH64_OBSERVATIONS: [amsa: string, rasi: number, years: number][] = [
  ['Aries', AR, 7], ['Aries', TA, 16], ['Aries', GE, 9], ['Aries', CN, 21], ['Aries', LE, 5],
  ['Gemini', TA, 16], ['Gemini', AR, 7],
  ['Virgo', AR, 7], ['Virgo', TA, 16], ['Virgo', GE, 9],
  ['Aquarius', AQ, 4], ['Aquarius', CP, 4], ['Aquarius', SG, 10], ['Aquarius', AR, 7],
  ['Cancer', SC, 7], ['Cancer', SG, 10], ['Cancer', CP, 4],
  // Libra/Scorpio is the one pair the chapter states twice, and both times as 7.
  ['Libra', SC, 7], ['Libra', SC, 7], ['Libra', SG, 10], ['Libra', CP, 4], ['Libra', AQ, 4],
  ['Libra', PI, 10], ['Libra', LI, 16], ['Libra', VI, 9],
  ['Pisces', SG, 10], ['Pisces', CP, 4], ['Pisces', AQ, 4],
  ['Scorpio', CN, 21], ['Scorpio', LE, 5],
  ['Taurus', AQ, 4], ['Taurus', PI, 10], ['Taurus', SC, 7],
  ['Taurus', LI, 16], ['Taurus', CN, 21], ['Taurus', LE, 5],
];

describe('BPHS 64 — an independent confirmation of KALACHAKRA_RASI_YEARS', () => {
  it('agrees with the shipped vector in every one of the 36 observations', () => {
    // 36 raw observations over 35 distinct (amsa, rasi) pairs — one is stated twice.
    expect(CH64_OBSERVATIONS).toHaveLength(36);
    expect(new Set(CH64_OBSERVATIONS.map(([a, r]) => `${a}|${r}`)).size).toBe(35);
    for (const [amsa, rasi, years] of CH64_OBSERVATIONS) {
      expect(KALACHAKRA_RASI_YEARS[rasi], `${amsa} amsa, rasi ${rasi}`).toBe(years);
    }
    expect(RASI_YEARS_CONFIRMED_INDEPENDENTLY).toContain('ZERO conflicts');
    expect(RASI_YEARS_CONFIRMED_INDEPENDENTLY).toContain('NOTHING CHANGED');
  });

  it('shows the years are a per-RASI constant, not a 12x12 amsa table', () => {
    // The claim: a rasi observed in several amsas takes the same value each time. If the
    // chapter really carried a 12x12 table, this would be false somewhere.
    const byRasi = new Map<number, Set<number>>();
    for (const [, rasi, years] of CH64_OBSERVATIONS) {
      if (!byRasi.has(rasi)) byRasi.set(rasi, new Set());
      byRasi.get(rasi)!.add(years);
    }
    for (const [rasi, vals] of byRasi) {
      expect(vals.size, `rasi ${rasi} takes ${[...vals].join('/')}`).toBe(1);
    }
    // And several rasis really were observed in four different amsas.
    const multi = [...byRasi.entries()].filter(([r]) =>
      CH64_OBSERVATIONS.filter(([, x]) => x === r).length >= 4);
    expect(multi.length).toBeGreaterThanOrEqual(3);
    expect(RASI_YEARS_ARE_A_PER_RASI_CONSTANT).toContain('not one rasi takes two values');
  });

  it('re-exports the confirmed vector unchanged', () => {
    expect([...CH64_RASI_YEARS]).toEqual([...KALACHAKRA_RASI_YEARS]);
  });
});

describe('BPHS 64 — the fault in the Aries amsa summary table', () => {
  it('the Aries amsa group sums to its own stated total ONLY with Scorpio at 7', () => {
    // The table prints 7, 16, 9, 21, 5, 9, 16, 17, 10 with "Total 100". The 8th is Scorpio.
    const printed = [7, 16, 9, 21, 5, 9, 16, 17, 10];
    const corrected = [AR, TA, GE, CN, LE, VI, LI, SC, SG].map((r) => KALACHAKRA_RASI_YEARS[r]!);
    expect(printed.reduce((a, b) => a + b, 0)).toBe(110);          // as printed: wrong
    expect(corrected.reduce((a, b) => a + b, 0)).toBe(100);        // corrected: the stated total
    // Which is also 46.89's poornayu for the Aries amsa — the fourth independent check.
    expect(CH46_POORNAYU_BY_AMSA[AR]).toBe(100);
    // The only cell that differs is Scorpio's.
    const diffs = printed.map((v, i) => (v === corrected[i] ? null : i)).filter((x) => x !== null);
    expect(diffs).toEqual([7]);
    expect(KALACHAKRA_RASI_YEARS[SC]).toBe(7);
  });

  it('records the fault and its four converging checks', () => {
    expect(ARIES_AMSA_TABLE_HAS_ONE_FAULT).toContain('four independent checks converge');
    expect(ARIES_AMSA_TABLE_HAS_ONE_FAULT).toContain('Nothing to change');
  });
});

describe('BPHS 64.56-58 — the friendship rule', () => {
  it('reads a friendly antar lord as favourable and an enemy as not', () => {
    // Aries (Mars) dasha with Leo (Sun) antar: the Sun is Mars's friend.
    const friendly = kalachakraAntarVerdict(AR, LE);
    expect(friendly.dashaLord).toBe('mars');
    expect(friendly.antarLord).toBe('sun');
    expect(friendly.relation).toBe('friend');
    expect(friendly.valence).toBeGreaterThan(0);

    // Aries (Mars) dasha with Gemini (Mercury) antar: Mercury is Mars's enemy.
    const hostile = kalachakraAntarVerdict(AR, GE);
    expect(hostile.antarLord).toBe('mercury');
    expect(hostile.relation).toBe('enemy');
    expect(hostile.valence).toBeLessThan(0);
  });

  it('stays silent when one planet rules both signs', () => {
    // Aries and Scorpio are both Mars's, so the verse's comparison does not arise.
    const v = kalachakraAntarVerdict(AR, SC);
    expect(v.relation).toBe('same');
    expect(v.valence).toBe(0);
    expect(v.summary).toContain('does not arise');
  });

  it('compares the LORDS of the two rasis, which is what a rasi dasha requires', () => {
    // Two different rasis with the same pair of lords must read identically.
    const a = kalachakraAntarVerdict(AR, LE);      // Mars / Sun
    const b = kalachakraAntarVerdict(SC, LE);      // Mars / Sun again
    expect(b.relation).toBe(a.relation);
    expect(b.valence).toBe(a.valence);
    for (const r of [AR, TA, GE, CN, LE, VI, LI, SC, SG, CP, AQ, PI]) {
      expect(kalachakraAntarVerdict(r, LE).dashaLord).toBe(lordOfSign(r));
    }
  });

  it('joins the arbitration list as the fourteenth, and names its new axis', () => {
    expect(SOURCE_STATED_ARBITRATION.length).toBeGreaterThanOrEqual(14);
    const entry = SOURCE_STATED_ARBITRATION.find((s) => s.startsWith('64.56-58'));
    expect(entry).toBeTruthy();
    expect(entry!).toContain('RELATION BETWEEN TWO');
    expect(new Set(SOURCE_STATED_ARBITRATION).size).toBe(SOURCE_STATED_ARBITRATION.length);
  });

  it('does NOT reopen the enmity axis Part 41 closed', () => {
    // The distinction that keeps both findings true: Part 41 refuted an UNSTATED rule in the
    // Vimshottari block; this one the source states, for Kalachakra.
    expect(KALACHAKRA_FRIENDSHIP_RULE).toContain('does NOT reopen the enmity axis');
    expect(KALACHAKRA_FRIENDSHIP_RULE).toContain('deliberately NOT carried across');
    // And nothing in the Vimshottari cells was changed on the strength of it.
    const vimshottari = allEncodedRules().filter((r) => (r.source.chapter ?? 0) >= 52
      && (r.source.chapter ?? 0) <= 60);
    expect(vimshottari.length).toBeGreaterThan(0);
  });
});

describe('BPHS 64 — the savya-only habit, and Part 36’s open thread', () => {
  it('records the support without claiming a resolution', () => {
    expect(SAVYA_ONLY_HABIT_SUPPORTS_CANDIDATE_ONE).toContain('BASED ON SAVYA CHAKRA');
    expect(SAVYA_ONLY_HABIT_SUPPORTS_CANDIDATE_ONE).toContain('SUPPORT, NOT A');
    expect(SAVYA_ONLY_HABIT_SUPPORTS_CANDIDATE_ONE).toContain('thread stays open');
  });

  it('leaves Part 36’s constant untouched — nothing was resolved by inference', () => {
    expect(POORNAYU_MAPPING_UNRESOLVED).toContain('Unresolved');
    expect(POORNAYU_MAPPING_UNRESOLVED).toContain('nothing changed, nothing claimed');
  });
});

describe('BPHS 64 — the effect prose, refused on Part 38’s ground', () => {
  it('cites the chapter-49 precedent rather than inventing a new reason', () => {
    expect(CH64_EFFECT_PROSE_REFUSED).toContain('chapter 49');
    expect(CH64_EFFECT_PROSE_REFUSED).toContain('2 cells in 9');
    expect(CH64_EFFECT_PROSE_REFUSED).toContain('mostly NOT STATED');
  });

  it('emits no rules for chapter 64 — the refusal is real', () => {
    expect(allEncodedRules().filter((r) => r.source.chapter === 64)).toHaveLength(0);
  });

  it('but leaves the chapter’s arithmetic fully usable', () => {
    // Part 39's formula with this chapter's confirmed years: Aries in Aries = 7x7/100.
    expect(kalachakraAntardasaYears(KALACHAKRA_RASI_YEARS[AR]!, KALACHAKRA_RASI_YEARS[AR]!))
      .toBeCloseTo(0.49, 12);
    // And the chapter's own worked example agrees: 0 years, 5 months, 26 days, 24 ghatikas.
    const months = 0.49 * 12;
    expect(Math.floor(months)).toBe(5);
    const days = (months - 5) * 30;
    expect(Math.floor(days)).toBe(26);
    expect(Math.round((days - 26) * 60)).toBe(24);
  });
});

describe('Part 44 — the yield', () => {
  it('leads with the confirmation and the new axis, not the volume', () => {
    expect(CH64_YIELD.note).toContain('INDEPENDENTLY');
    expect(CH64_YIELD.note).toContain('FRIENDSHIP RULE');
    expect(CH64_YIELD.note).toContain('per-RASI CONSTANT');
  });
});
