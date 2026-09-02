// BPHS Programme Part 34 — Chapter 46a: Vimshottari, checked against its own chapter.
//
// This part encodes almost nothing and verifies almost everything. The engine's Vimshottari
// has driven every date the app has ever shown, and until now it had only been checked
// against the OTHER corpus. These tests check it against BPHS's own construction, worked
// example and balance table.
//
// They found no discrepancy. That is worth as much as a correction would have been, and it
// only means anything because four earlier parts DID find the shipped code wrong.

import { describe, it, expect } from 'vitest';
import {
  CH46_ORDER_FROM_KRITTIKA, CH46_YEARS_FROM_KRITTIKA, lordByKrittikaRemainder,
  CH46_120_YEARS, CH46_BALANCE_IS_A_TABLE_NOT_A_FORMULA, CH46_YEAR_LENGTH_IS_OURS,
  CH46_ANTARDASHA_IS_DEFERRED, CH46_DASHA_SYSTEMS, CH46_REJECTION_IS_AMBIGUOUS,
  CH46_VERIFICATION, CH46A_YIELD,
  VIMSHOTTARI_ORDER, VIMSHOTTARI_YEARS, VIMSHOTTARI_TOTAL,
  nakshatraLord, dashaBalanceAtBirth, subPeriodYears,
} from '../src/index.js';

/** Years as the book's table prints them: Y, M, D with a 30-day month. */
const ymd = (years: number) => {
  const Y = Math.floor(years);
  const m = (years - Y) * 12;
  const M = Math.floor(m);
  return { Y, M, D: Math.round((m - M) * 30) };
};

// ── The construction ─────────────────────────────────────────────────────────
describe('BPHS 46.12-15 — the construction agrees with the shipped engine', () => {
  it('our Ashwini-based order IS the chapter’s Krittika-based one, rotated', () => {
    // BPHS states the cycle from Krittika (nakshatra 2). Ours starts at Ashwini because
    // nakshatra indices do. Rotating ours by 2 must reproduce the chapter exactly.
    const rotated = [...VIMSHOTTARI_ORDER.slice(2), ...VIMSHOTTARI_ORDER.slice(0, 2)];
    expect(rotated).toEqual(CH46_ORDER_FROM_KRITTIKA);
  });

  it('the nine year-counts match, and sum to the chapter’s 120', () => {
    for (const { graha, years } of CH46_YEARS_FROM_KRITTIKA) {
      expect(VIMSHOTTARI_YEARS[graha], graha).toBe(years);
    }
    const total = CH46_YEARS_FROM_KRITTIKA.reduce((n, x) => n + x.years, 0);
    expect(total).toBe(120);
    expect(VIMSHOTTARI_TOTAL).toBe(120);
    expect(CH46_120_YEARS).toContain('natural life span');
  });

  it('the chapter’s remainder rule gives the same lord as ours, for all 27 nakshatras', () => {
    // 46.12-14 counts from Krittika and takes the remainder mod 9. We index from Ashwini.
    // Same function, different offset — asserted rather than assumed.
    for (let nak = 0; nak < 27; nak++) {
      expect(lordByKrittikaRemainder(nak), `nakshatra ${nak}`).toBe(nakshatraLord(nak));
    }
  });

  it('Krittika itself gives the Sun, as the chapter’s rule states', () => {
    expect(lordByKrittikaRemainder(2)).toBe('sun');
    expect(lordByKrittikaRemainder(3)).toBe('moon');   // Rohini
    expect(lordByKrittikaRemainder(0)).toBe('ketu');   // Ashwini, wrapping
  });
});

// ── The chapter's worked example ─────────────────────────────────────────────
describe('BPHS 46 — the chapter’s own worked example', () => {
  // "A person was born on 23rd November 1930 at 2.15 P.M. The Longitude of the Moon is
  //  8°-13'-0" (Sagittarius 13°) ... the Janma Nakshatra will be Moola 4th Pada. The lord
  //  of Moola is Ketu."
  const moon = 8 * 30 + 13;   // 8 signs + 13° = 253°, Sagittarius 13°

  it('finds Moola as the janma nakshatra', () => {
    expect(dashaBalanceAtBirth(moon).nakshatra).toBe(18);   // 0 = Ashwini … 18 = Moola
  });

  it('finds the 4th pada, as the chapter specifies', () => {
    const NAK = 360 / 27;
    const into = (moon % NAK) / NAK;
    expect(Math.floor(into * 4) + 1).toBe(4);
  });

  it('gives Ketu as the operating dasha lord', () => {
    expect(dashaBalanceAtBirth(moon).lord).toBe('ketu');
  });

  it('leaves a balance of 2 months 3 days — the tail of Moola', () => {
    // Moola runs the whole of Sagittarius 0°–13°20', so 13° is 97.5% through it.
    const b = ymd(dashaBalanceAtBirth(moon).yearsLeft);
    expect(b).toEqual({ Y: 0, M: 2, D: 3 });
  });
});

// ── The balance table ────────────────────────────────────────────────────────
describe('BPHS 46 — the balance table, reproduced from our formula', () => {
  // The chapter's table is indexed by degree within the sign, in four columns by
  // triplicity. Its first printed row reads: 7 0 0 | 4 6 0 | 3 6 0 | 4 0 0.
  it('reproduces all four columns of the table’s first row (0°00′)', () => {
    const expected: [number, { Y: number; M: number; D: number }][] = [
      [0, { Y: 7, M: 0, D: 0 }],     // Aries / Leo / Sagittarius   → Ketu
      [30, { Y: 4, M: 6, D: 0 }],    // Taurus / Virgo / Capricorn  → Sun
      [60, { Y: 3, M: 6, D: 0 }],    // Gemini / Libra / Aquarius   → Mars
      [90, { Y: 4, M: 0, D: 0 }],    // Cancer / Scorpio / Pisces   → Jupiter
    ];
    for (const [long, want] of expected) {
      expect(ymd(dashaBalanceAtBirth(long).yearsLeft), `${long}°`).toEqual(want);
    }
  });

  it('reproduces the 0°20′ row in two columns', () => {
    // Printed: 6 9 27 for column 1 and 3 7 6 for column 4.
    expect(ymd(dashaBalanceAtBirth(0 + 20 / 60).yearsLeft)).toEqual({ Y: 6, M: 9, D: 27 });
    expect(ymd(dashaBalanceAtBirth(90 + 20 / 60).yearsLeft)).toEqual({ Y: 3, M: 7, D: 6 });
  });

  it('the balance is essentially the lord’s full years at a nakshatra’s start', () => {
    // Sampled a hair INSIDE each nakshatra. Landing exactly on a boundary tests float
    // representation of 360/27 rather than the formula, and 13.333… is not exact in binary.
    const NAK = 360 / 27;
    for (let nak = 0; nak < 27; nak++) {
      const b = dashaBalanceAtBirth(nak * NAK + 1e-7);
      expect(b.nakshatra, `nakshatra ${nak}`).toBe(nak);
      expect(b.yearsLeft, `nakshatra ${nak}`).toBeCloseTo(VIMSHOTTARI_YEARS[b.lord], 5);
    }
  });

  it('and approaches zero at the nakshatra’s end', () => {
    const NAK = 360 / 27;
    for (let nak = 0; nak < 27; nak++) {
      const b = dashaBalanceAtBirth((nak + 1) * NAK - 1e-7);
      expect(b.nakshatra, `nakshatra ${nak}`).toBe(nak);
      expect(b.yearsLeft, `nakshatra ${nak}`).toBeLessThan(1e-4);
    }
  });
});

// ── What the chapter does NOT say ────────────────────────────────────────────
describe('BPHS 46 — the honest limits of this verification', () => {
  it('records that the balance is a TABLE in this text, not a derived formula', () => {
    expect(CH46_BALANCE_IS_A_TABLE_NOT_A_FORMULA).toContain('Lahiri');
    expect(CH46_BALANCE_IS_A_TABLE_NOT_A_FORMULA).toContain('not the same claim');
  });

  it('records that the DAY-length of a dasha-year is ours, not the text’s', () => {
    expect(CH46_YEAR_LENGTH_IS_OURS).toContain('never says how many DAYS');
    expect(CH46_YEAR_LENGTH_IS_OURS).toContain('365.25');
    expect(CH46_YEAR_LENGTH_IS_OURS).toContain('savana');
  });

  it('records that the antardasha construction is deferred to later chapters', () => {
    expect(CH46_ANTARDASHA_IS_DEFERRED).toContain('later Chapters');
    // The sub-period rule still composes correctly, it is simply unverified HERE.
    expect(subPeriodYears(VIMSHOTTARI_YEARS.venus, 'venus'))
      .toBeCloseTo(20 * 20 / 120, 9);
  });

  it('is explicit that nothing was changed, and why that still counts', () => {
    expect(CH46_VERIFICATION.discrepancies).toBe(0);
    expect(CH46_VERIFICATION.checkedAgainst).toHaveLength(6);
    expect(CH46_VERIFICATION.note).toContain('does not depend on which way it comes out');
  });
});

// ── 46.2-11: the census, and the frame for Part 37 ───────────────────────────
describe('BPHS 46.2-11 — the chapter’s census of dasha systems', () => {
  it('names more than thirty systems and gives each a verdict', () => {
    expect(CH46_DASHA_SYSTEMS.length).toBeGreaterThanOrEqual(30);
    for (const d of CH46_DASHA_SYSTEMS) expect(d.verdict, d.name).toBeTruthy();
    expect(new Set(CH46_DASHA_SYSTEMS.map((d) => d.name)).size)
      .toBe(CH46_DASHA_SYSTEMS.length);
  });

  it('makes Vimshottari the preferred one, and it alone', () => {
    const preferred = CH46_DASHA_SYSTEMS.filter((d) => d.verdict === 'preferred');
    expect(preferred.map((d) => d.name)).toEqual(['Vimshottari']);
  });

  it('records Kalachakra as supreme per OTHERS, not per Parashara', () => {
    // 46.6 attributes that judgement to "some sages", which is a different claim.
    const k = CH46_DASHA_SYSTEMS.find((d) => d.name === 'Kalachakra')!;
    expect(k.verdict).toBe('supreme-per-others');
  });

  it('flags that the rejection is a translator’s gloss away from being narrower', () => {
    expect(CH46_REJECTION_IS_AMBIGUOUS).toContain('TRANSLATOR');
    expect(CH46_REJECTION_IS_AMBIGUOUS).toContain('Recorded as a live question, not acted on');
  });

  it('does NOT remove the four rejected systems the codebase already ships', () => {
    // Chara/Narayana, Kalachakra, Ashtottari and the rasi dashas are all live routes. One
    // chapter's opinion — with a translator's parenthetical doing real work — is not grounds
    // for deleting working capability. Part 37 decides applicability.
    for (const name of ['Kalachakra', 'Ashtottari', 'Chara', 'Rashi']) {
      expect(CH46_DASHA_SYSTEMS.find((d) => d.name === name), name).toBeDefined();
    }
    expect(CH46_REJECTION_IS_AMBIGUOUS).toContain('already ships four');
  });

  it('is honest that this part encoded no rules', () => {
    expect(CH46A_YIELD.newRules).toBe(0);
    expect(CH46A_YIELD.note).toContain('A verification part');
  });
});
