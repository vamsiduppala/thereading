// BPHS Programme Part 35 — Chapter 46b: the conditional nakshatra dashas.
//
// The load-bearing test here is the checksum. Each system is named for its own year total, so
// the printed counts are checkable — and four of the nine did not reconcile as printed. That
// test is the reason those four corrections are defensible rather than convenient.

import { describe, it, expect } from 'vitest';
import {
  NAKSHATRA_DASHA_SYSTEMS, systemTotalsMatchTheirNames, SYSTEM_NAME_IS_A_CHECKSUM,
  CH46B_CHECKSUM_CAUGHT_FOUR_FAULTS, ABHIJIT_ONLY_IN_TWO_SYSTEMS,
  ASHTOTTARI_BALANCE_MODELS_DIVERGE, CH46B_YIELD,
  CH46_DASHA_SYSTEMS, CH46_SPELLING_VARIANTS,
  ASHTOTTARI_ORDER, ASHTOTTARI_YEARS, ASHTOTTARI_TOTAL, ashtottariBalanceAtBirth,
} from '../src/index.js';

// ── The checksum ─────────────────────────────────────────────────────────────
describe('BPHS 46b — the system name is the checksum', () => {
  it('every system’s years sum to the total its name asserts', () => {
    expect(systemTotalsMatchTheirNames()).toEqual([]);
  });

  it('the names really do encode those numbers', () => {
    const byName = Object.fromEntries(NAKSHATRA_DASHA_SYSTEMS.map((s) => [s.name, s.total]));
    expect(byName.Ashtottari).toBe(108);          // ashta-uttara-shata: 8 + 100
    expect(byName.Shodasottari).toBe(116);        // shodasha + 100
    expect(byName.Dwadashottari).toBe(112);       // dwadasha + 100
    expect(byName.Panchottari).toBe(105);         // pancha + 100
    expect(byName.Shatabdika).toBe(100);          // shata
    expect(byName['Chaturashiti sama']).toBe(84);
    expect(byName['Dwisaptati sama']).toBe(72);
    expect(byName.Shastihayani).toBe(60);         // shashti
    expect(byName['Shat-trimsat sama']).toBe(36);
    expect(SYSTEM_NAME_IS_A_CHECKSUM).toContain('caught four faults');
  });

  it('names the four systems whose printed counts needed correcting', () => {
    const corrected = NAKSHATRA_DASHA_SYSTEMS.filter((s) => !s.asPrinted).map((s) => s.name);
    expect(corrected.sort()).toEqual(
      ['Panchottari', 'Shastihayani', 'Shat-trimsat sama', 'Shodasottari'],
    );
    expect(CH46B_CHECKSUM_CAUGHT_FOUR_FAULTS).toContain('first');
    expect(CH46B_CHECKSUM_CAUGHT_FOUR_FAULTS).toContain('by arithmetic rather than by reading');
  });

  it('each correction also fits the surrounding run, not just the total', () => {
    // The point that makes these defensible rather than convenient: the corrected value is
    // the one the name forces AND the only one consistent with its neighbours.
    const by = (n: string) => NAKSHATRA_DASHA_SYSTEMS.find((s) => s.name === n)!;
    expect(by('Shodasottari').years).toEqual([11, 12, 13, 14, 15, 16, 17, 18]);  // unbroken run
    expect(by('Panchottari').years).toEqual([12, 13, 14, 15, 16, 17, 18]);       // unbroken run
    expect(by('Shat-trimsat sama').years).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);     // unbroken run
    expect(by('Shastihayani').years).toEqual([10, 10, 10, 6, 6, 6, 6, 6]);       // a 10 among 10s
  });

  it('every lord list is the same length as its year list', () => {
    for (const s of NAKSHATRA_DASHA_SYSTEMS) {
      expect(s.years.length, s.name).toBe(s.order.length);
      expect(new Set(s.order).size, `${s.name} repeats a lord`).toBe(s.order.length);
    }
  });

  it('the romanised name can be wrong where the Devanagari and the arithmetic agree', () => {
    // 46.2-5 romanises the 36-year system "Shatvimsa" (vimsa = 20) while its own Devanagari
    // reads trimsha (30) and its table sums to 36. Two independent signals beat one.
    expect(CH46_SPELLING_VARIANTS).toContain('Shatvimsa');
    expect(CH46_SPELLING_VARIANTS).toContain('the Devanagari and the arithmetic agree');
  });

  it('records that three systems have SEVEN lords, not eight', () => {
    const seven = NAKSHATRA_DASHA_SYSTEMS.filter((s) => s.order.length === 7).map((s) => s.name);
    expect(seven.sort()).toEqual(['Chaturashiti sama', 'Panchottari', 'Shatabdika']);
  });
});

// ── The applicability conditions — the actual deliverable ────────────────────
describe('BPHS 46b — the applicability conditions', () => {
  it('every system carries at least one, with a verse', () => {
    for (const s of NAKSHATRA_DASHA_SYSTEMS) {
      expect(s.applicability.length, s.name).toBeGreaterThan(0);
      for (const a of s.applicability) {
        expect(a.verse, s.name).toBeTruthy();
        expect(a.condition.length, s.name).toBeGreaterThan(25);
      }
    }
  });

  it('covers all nine of the systems Part 34’s census called "special case"', () => {
    const census = CH46_DASHA_SYSTEMS
      .filter((d) => d.verdict === 'special-case')
      .map((d) => d.name);
    expect(census).toHaveLength(9);
    expect(NAKSHATRA_DASHA_SYSTEMS).toHaveLength(9);
    // The census and this chapter must name the SAME nine. The book spells several systems
    // more than one way, so both lists are normalised — without that this test would pass
    // vacuously while the two tables could not actually be joined.
    const norm = (n: string) => n.replace(/[- ]sama$/i, '').toLowerCase();
    expect(NAKSHATRA_DASHA_SYSTEMS.map((s) => norm(s.name)).sort())
      .toEqual(census.map(norm).sort());
  });

  it('the two paksha systems are distinguishable — they pair the ingredients differently', () => {
    // Ashtottari: day/Krishna or night/Shukla. Shodasottari: Moon's hora/Krishna or Sun's
    // hora/Shukla. Same ingredients, different pairing — which is the only reason a chart
    // can satisfy one and not the other.
    const ash = NAKSHATRA_DASHA_SYSTEMS.find((s) => s.name === 'Ashtottari')!;
    const sho = NAKSHATRA_DASHA_SYSTEMS.find((s) => s.name === 'Shodasottari')!;
    const ashCond = ash.applicability.find((a) => a.kind === 'hora-and-paksha')!.condition;
    const shoCond = sho.applicability[0]!.condition;
    expect(ashCond).not.toBe(shoCond);
    expect(ashCond).toContain('day birth in Krishna Paksha');
    expect(shoCond).toContain('MOON’s hora with a Krishna Paksha');
  });

  it('the graha-placement conditions are the three crispest, and all differ', () => {
    const placements = NAKSHATRA_DASHA_SYSTEMS
      .flatMap((s) => s.applicability.filter((a) => a.kind === 'graha-placement')
        .map((a) => `${s.name}: ${a.condition}`));
    expect(placements).toHaveLength(3);   // 10th lord in 10th · lagna lord in 1st/7th · Sun in lagna
    expect(new Set(placements).size).toBe(3);
  });

  it('Panchottari has the tightest condition of the nine', () => {
    const p = NAKSHATRA_DASHA_SYSTEMS.find((s) => s.name === 'Panchottari')!;
    expect(p.applicability[0]!.condition).toContain('Cancer');
    expect(p.applicability[0]!.condition).toContain('dwadasamsa');
    expect(p.note).toContain('at most a twelfth');
  });
});

// ── Abhijit ──────────────────────────────────────────────────────────────────
describe('BPHS Note 1 to 46.23 — Abhijit counts in exactly two systems', () => {
  it('and the data agrees with the note', () => {
    const withAbhijit = NAKSHATRA_DASHA_SYSTEMS.filter((s) => s.usesAbhijit).map((s) => s.name);
    expect(withAbhijit.sort()).toEqual(['Ashtottari', 'Shastihayani']);
  });

  it('explains why Ashtottari’s blocks total 28 rather than 27', () => {
    expect(ABHIJIT_ONLY_IN_TWO_SYSTEMS).toContain('4/3/4/3/4/3/4/3 = 28');
    expect(ABHIJIT_ONLY_IN_TWO_SYSTEMS).toContain('NOT a 28th equal division');
  });
});

// ── The Ashtottari reconciliation ────────────────────────────────────────────
describe('BPHS 46b — Ashtottari against the shipped implementation', () => {
  it('the lord order and years match the shipped constants exactly', () => {
    const bphs = NAKSHATRA_DASHA_SYSTEMS.find((s) => s.name === 'Ashtottari')!;
    expect(bphs.order).toEqual(ASHTOTTARI_ORDER);
    for (let i = 0; i < bphs.order.length; i++) {
      expect(ASHTOTTARI_YEARS[bphs.order[i]!], bphs.order[i]).toBe(bphs.years[i]);
    }
    expect(ASHTOTTARI_TOTAL).toBe(108);
  });

  it('the LORD is identical for all 27 nakshatras', () => {
    // The part that matters most: whichever balance model is used, the same chart gets the
    // same dasha lord. Assignment per BPHS 46.17-20, with Abhijit inside Saturn's block.
    const NAK = 360 / 27;
    const expected: [number, string][] = [
      [5, 'sun'], [6, 'sun'], [7, 'sun'], [8, 'sun'],
      [9, 'moon'], [10, 'moon'], [11, 'moon'],
      [12, 'mars'], [13, 'mars'], [14, 'mars'], [15, 'mars'],
      [16, 'mercury'], [17, 'mercury'], [18, 'mercury'],
      [19, 'saturn'], [20, 'saturn'], [21, 'saturn'],
      [22, 'jupiter'], [23, 'jupiter'], [24, 'jupiter'],
      [25, 'rahu'], [26, 'rahu'], [0, 'rahu'], [1, 'rahu'],
      [2, 'venus'], [3, 'venus'], [4, 'venus'],
    ];
    expect(expected).toHaveLength(27);
    for (const [nak, lord] of expected) {
      expect(ashtottariBalanceAtBirth(nak * NAK + NAK / 2).lord, `nakshatra ${nak}`).toBe(lord);
    }
  });

  it('records that the BALANCE models diverge, and that nothing was changed', () => {
    expect(ASHTOTTARI_BALANCE_MODELS_DIVERGE).toContain('LORD is identical');
    expect(ASHTOTTARI_BALANCE_MODELS_DIVERGE).toContain('Nothing was changed');
    expect(ASHTOTTARI_BALANCE_MODELS_DIVERGE).toContain('product decision');
  });

  it('the shipped model is still internally consistent across Saturn’s span', () => {
    // Not a claim that it matches BPHS — it does not, inside this span. Only that it behaves.
    const a = ashtottariBalanceAtBirth(255).yearsLeft;
    const b = ashtottariBalanceAtBirth(270).yearsLeft;
    const c = ashtottariBalanceAtBirth(285).yearsLeft;
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(a).toBeLessThanOrEqual(ASHTOTTARI_YEARS.saturn);
  });
});

describe('BPHS 46b — the audit trail', () => {
  it('is honest that the conditions, not the year counts, are the deliverable', () => {
    expect(CH46B_YIELD.systems).toBe(9);
    expect(CH46B_YIELD.faultsFound).toBe(4);
    expect(CH46B_YIELD.newRules).toBe(0);
    expect(CH46B_YIELD.note).toContain('applicability conditions are the deliverable');
  });
});
