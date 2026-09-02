// BPHS Programme Part 42 — Chapter 61: the pratyantar dasha.
//
// A part whose headline result is a REFUSAL, so most of these tests guard the refusal's
// reasoning rather than a computation. The one that would catch a real regression is
// `reproduces the chapter's own worked examples` — the formula is shared with the antardasa
// and maha layers, so an error there moves every date the app shows.

import { describe, it, expect } from 'vitest';
import {
  PRATYANTAR_FORMULA_VERIFIED, PRATYANTAR_TABLE_FAULTS_ARE_DIGIT_LEVEL,
  COLUMN_ORDER_CONFIRMS_51_2, PRATYANTAR_EFFECTS_ARE_DEFEASIBLE, CH61_EFFECTS_REFUSED,
  PRATYANTAR_WHAT_WE_OFFER_INSTEAD, PRATYANTAR_ORDER, CH61_YIELD,
  SOURCE_STATED_ARBITRATION, subPeriodYears, dashaSequence, VIMSHOTTARI_YEARS,
  VIMSHOTTARI_ORDER, allEncodedRules,
} from '../src/index.js';

// The chapter works in days on a 360-day year, and in ghatikas — a sixtieth of a day.
const days = (years: number) => years * 360;
const ghatikas = (d: number) => Math.round((d - Math.floor(d)) * 60);

describe('BPHS 61.1 — the pratyantar formula, against the chapter’s own examples', () => {
  it('reproduces both worked examples exactly', () => {
    // "The span of Antardasa namely 3 month 18 days converted into days comes to 108 days."
    const antar = subPeriodYears(VIMSHOTTARI_YEARS['sun'], 'sun');
    expect(days(antar)).toBeCloseTo(108, 9);

    // "108 X 6 = 648 / 120 = 5 days 24 Ghatikas"
    const praty = days(subPeriodYears(antar, 'sun'));
    expect(Math.floor(praty)).toBe(5);
    expect(ghatikas(praty)).toBe(24);

    // "108 days X 10 = 1080 / 120 = 9 days"
    expect(days(subPeriodYears(antar, 'moon'))).toBeCloseTo(9, 9);
  });

  it('is the SAME operation as the antardasa, applied one level deeper', () => {
    // 61.1 introduces no new arithmetic — which is why this part added no function.
    for (const maha of Object.keys(VIMSHOTTARI_YEARS) as (keyof typeof VIMSHOTTARI_YEARS)[]) {
      for (const antar of ['sun', 'moon', 'saturn'] as const) {
        const a = subPeriodYears(VIMSHOTTARI_YEARS[maha], antar);
        for (const praty of ['mars', 'venus'] as const) {
          expect(subPeriodYears(a, praty), `${maha}/${antar}/${praty}`)
            .toBeCloseTo(a * VIMSHOTTARI_YEARS[praty] / 120, 12);
        }
      }
    }
  });

  it('tiles its parent exactly at the third level too', () => {
    // The invariant that told chapter 51's faulty table from a rival convention.
    const antar = subPeriodYears(VIMSHOTTARI_YEARS['saturn'], 'mercury');
    const total = dashaSequence('mercury')
      .reduce((t, p) => t + subPeriodYears(antar, p), 0);
    expect(total).toBeCloseTo(antar, 9);
  });

  it('records what was checked and how much of it matched', () => {
    expect(PRATYANTAR_FORMULA_VERIFIED).toContain('225 cells');
    expect(PRATYANTAR_FORMULA_VERIFIED).toContain('95.6%');
    expect(PRATYANTAR_FORMULA_VERIFIED).toContain('NOTHING CHANGED');
    // The attribution method matters as much as the number.
    expect(PRATYANTAR_FORMULA_VERIFIED).toContain('by arithmetic rather than by');
  });

  it('argues the ten faults are the transcription’s, not the formula’s', () => {
    expect(PRATYANTAR_TABLE_FAULTS_ARE_DIGIT_LEVEL).toContain('digit-level');
    expect(PRATYANTAR_TABLE_FAULTS_ARE_DIGIT_LEVEL).toContain('CONSISTENT offset');
    expect(PRATYANTAR_TABLE_FAULTS_ARE_DIGIT_LEVEL).toContain('NOTHING was changed');
  });
});

describe('BPHS 61 — the table layout confirms 51.2 a third time', () => {
  it('keeps the pratyantar order identical to the Vimshottari sequence', () => {
    expect([...PRATYANTAR_ORDER]).toEqual([...VIMSHOTTARI_ORDER]);
    expect(PRATYANTAR_ORDER).toHaveLength(9);
  });

  it('starts each sub-period run at its own parent lord, as 51.2 requires', () => {
    for (const lord of PRATYANTAR_ORDER) {
      expect(dashaSequence(lord)[0], lord).toBe(lord);
    }
  });

  it('records the count, including the 11 tables whose heading is one step stale', () => {
    expect(COLUMN_ORDER_CONFIRMS_51_2).toContain('47 match');
    expect(COLUMN_ORDER_CONFIRMS_51_2).toContain('ONE STEP');
    expect(COLUMN_ORDER_CONFIRMS_51_2).toContain('third consecutive chapter block');
  });
});

describe('BPHS 61.2 — the thirteenth arbitration instruction', () => {
  it('joins the source-stated list, and is the broadest of them', () => {
    expect(SOURCE_STATED_ARBITRATION.length).toBeGreaterThanOrEqual(13);
    const entry = SOURCE_STATED_ARBITRATION.find((s) => s.startsWith('61.2'));
    expect(entry).toBeTruthy();
    expect(entry!).toContain('BROADEST');
    expect(entry!).toContain('defeasible by placement');
  });

  it('keeps the earlier instructions in place — the list is append-only', () => {
    // Retrofit R19: assert POSITION and uniqueness, never length.
    expect(SOURCE_STATED_ARBITRATION.some((s) => s.startsWith('48.1'))).toBe(true);
    expect(SOURCE_STATED_ARBITRATION.some((s) => s.startsWith('36.1'))).toBe(true);
    expect(new Set(SOURCE_STATED_ARBITRATION).size).toBe(SOURCE_STATED_ARBITRATION.length);
  });

  it('quotes the sentence that licenses the whole chapter', () => {
    expect(PRATYANTAR_EFFECTS_ARE_DEFEASIBLE)
      .toContain('ALL OTHER PRATYANTAR EFFECTS SHOULD BE JUDGED IN THIS MANNER');
    expect(PRATYANTAR_EFFECTS_ARE_DEFEASIBLE).toContain('THIRTEENTH');
  });
});

describe('BPHS 61 — the 81 effect cells are refused, on the chapter’s own terms', () => {
  it('gives all three grounds, and they are independent of one another', () => {
    expect(CH61_EFFECTS_REFUSED).toContain('NO CONDITION');
    expect(CH61_EFFECTS_REFUSED).toContain('THE CHAPTER FORBIDS A FLAT READING');
    expect(CH61_EFFECTS_REFUSED).toContain('CONTENT');
    expect(CH61_EFFECTS_REFUSED).toContain('exactly one of 81 blocks');
  });

  it('contrasts the count with chapters 52-60, which DID condition', () => {
    // The comparison is what makes "no condition" a measurement rather than an impression.
    expect(CH61_EFFECTS_REFUSED).toContain('38 of 81 pairs');
  });

  it('emits no rules for chapter 61 — the refusal is real, not nominal', () => {
    const ch61 = allEncodedRules().filter((r) => r.source.chapter === 61);
    expect(ch61).toHaveLength(0);
  });

  it('redirects rather than dead-ends: the level is still computable', () => {
    expect(PRATYANTAR_WHAT_WE_OFFER_INSTEAD.length).toBeGreaterThanOrEqual(4);
    for (const row of PRATYANTAR_WHAT_WE_OFFER_INSTEAD) {
      expect(row.instead.length).toBeGreaterThan(10);
      expect(row.where.length).toBeGreaterThan(10);
    }
    expect(CH61_EFFECTS_REFUSED).toContain('remains fully COMPUTABLE');
  });
});

describe('Part 42 — the yield', () => {
  it('is honest that the largest chapter gave one of the smallest yields, and why', () => {
    expect(CH61_YIELD.note).toContain('largest chapter');
    expect(CH61_YIELD.note).toContain('ONE FORMULA generates');
    expect(CH61_YIELD.note).toContain('REFUSED');
  });
});
