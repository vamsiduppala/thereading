// BPHS Programme Part 2 — Chapters 4 (Zodiacal Signs) and 5 (Special Ascendants).
// Every assertion cites its verse. Worked examples are the book's own numbers.

import { describe, it, expect } from 'vitest';
import {
  RISING_TYPE, isSirshodaya,
  DIURNAL_SIGNS, NOCTURNAL_SIGNS, isDiurnal,
  ambulationClass, SIGN_HUMOUR,
  KALAPURUSHA_LIMBS, limbOfSign, limbOfHouse,
  nisheka, isBelowHorizon, rectifyFromAdhana, birthHalfFromAdhana,
  gestationSide, deliveryMonthFromAdhana, natalMoonFromAdhanaMoon,
  GHATIS_PER_SIGN, minutesToGhatis,
  bhavaLagnaBphs, horaLagnaBphs, ghatikaLagnaBphs,
  bhavaAgreement, cuspStrength,
  varnadaCount, varnada, varnadaDashaOrder, varnadaAntardashas,
  bhavaLagna, horaLagna, ghatiLagna,
} from '../src/index.js';

// ── Ch 5.2-8 — the three special ascendants, against the book's worked example ──
// Birth at 12gh 30vi; the Sun stood at 4s 12° = 132° at sunrise.
describe('BPHS 5.2-8 — special ascendants (book\'s worked example)', () => {
  const SUN_AT_SUNRISE = 132;
  const MINUTES = 12.5 * 24; // 12gh30vi = 12.5 ghatis = 300 minutes

  it('converts 300 minutes to 12.5 ghatis', () => {
    expect(minutesToGhatis(MINUTES)).toBe(12.5);
  });

  it('Bhava lagna → Libra 27° (one sign per 5 ghatis)', () => {
    const bl = bhavaLagnaBphs(SUN_AT_SUNRISE, MINUTES);
    expect(bl).toBeCloseTo(207, 6);
    expect(Math.floor(bl / 30)).toBe(6);        // Libra
    expect(bl % 30).toBeCloseTo(27, 6);
  });

  it('Hora lagna → Capricorn 12° (one sign per 2.5 ghatis)', () => {
    const hl = horaLagnaBphs(SUN_AT_SUNRISE, MINUTES);
    expect(hl).toBeCloseTo(282, 6);
    expect(Math.floor(hl / 30)).toBe(9);        // Capricorn
    expect(hl % 30).toBeCloseTo(12, 6);
  });

  it('Ghatika lagna → Leo 27° (one sign per ghati)', () => {
    const gl = ghatikaLagnaBphs(SUN_AT_SUNRISE, MINUTES);
    expect(gl).toBeCloseTo(147, 6);
    expect(Math.floor(gl / 30)).toBe(4);        // Leo
    expect(gl % 30).toBeCloseTo(27, 6);
  });

  it('keeps the rates in descending order 5 > 2.5 > 1 ghatis per sign', () => {
    expect(GHATIS_PER_SIGN.bhava).toBeGreaterThan(GHATIS_PER_SIGN.hora);
    expect(GHATIS_PER_SIGN.hora).toBeGreaterThan(GHATIS_PER_SIGN.ghatika);
  });
});

// ── The corrected bhavaLagna, and the conflict behind it ─────────────────────
describe('conflict bphs.05.002 — Bhava lagna rate corrected to 0.25°/min', () => {
  it('the shared lagnas.ts helper now matches BPHS', () => {
    expect(bhavaLagna(132, 300)).toBeCloseTo(bhavaLagnaBphs(132, 300), 9);
    expect(bhavaLagna(132, 300)).toBeCloseTo(207, 6);
  });

  it('Hora and Ghati lagna were already right and are unchanged', () => {
    expect(horaLagna(132, 300)).toBeCloseTo(horaLagnaBphs(132, 300), 9);
    expect(ghatiLagna(132, 300)).toBeCloseTo(ghatikaLagnaBphs(132, 300), 9);
  });

  it('advances exactly one sign per 120 minutes', () => {
    expect(bhavaLagna(0, 120) - bhavaLagna(0, 0)).toBeCloseTo(30, 9);
  });

  it('is slower than Hora lagna, which is slower than Ghatika — the ordering the chapter assumes', () => {
    const b = bhavaLagna(0, 240), h = horaLagna(0, 240), g = ghatiLagna(0, 240);
    expect(b).toBeLessThan(h);
    expect(h).toBeLessThan(g);
  });
});

// ── Ch 5.9 — cusp strength and cross-chart agreement ─────────────────────────
describe('BPHS 5.9 — bhava strength by cusp proximity', () => {
  it('gives full strength exactly on the cusp', () => {
    expect(cuspStrength(100, 100)).toBe(1);
  });

  it('falls to nothing at the bhava sandhi, 15° either side', () => {
    expect(cuspStrength(115, 100)).toBe(0);
    expect(cuspStrength(85, 100)).toBe(0);
  });

  it('scales linearly between cusp and sandhi, symmetrically', () => {
    expect(cuspStrength(107.5, 100)).toBeCloseTo(0.5, 6);
    expect(cuspStrength(92.5, 100)).toBeCloseTo(0.5, 6);
  });

  it('wraps across 0°', () => {
    expect(cuspStrength(2, 358)).toBeCloseTo(1 - 4 / 15, 6);
  });

  it('reports full delivery only when all four charts agree (5.9 notes)', () => {
    expect(bhavaAgreement([5, 5, 5, 5])).toEqual({ house: 5, agreeing: 4, full: true });
    const partial = bhavaAgreement([5, 5, 7, 9]);
    expect(partial.house).toBe(5);
    expect(partial.agreeing).toBe(2);
    expect(partial.full).toBe(false);
  });
});

// ── Ch 5.10-15 — Varnada, against the book's worked example ──────────────────
describe('BPHS 5.10-15 — Varnada (book\'s worked example)', () => {
  // Libra natal lagna, Scorpio Hora lagna → Varnada is Aries.
  it('counts Libra forward from Aries as 7', () => {
    expect(varnadaCount(6)).toBe(7);
  });

  it('counts Scorpio backward from Pisces as 5', () => {
    expect(varnadaCount(7)).toBe(5);
  });

  it('adds the two counts because both are odd, then reads 12 backward from Pisces → Aries', () => {
    expect(varnada(6, 7)).toBe(0); // Aries
  });

  it('applies the parity test to the COUNTS, not to the signs', () => {
    // Libra is an odd sign and Scorpio an even one, yet their counts (7, 5) are both
    // odd — so the rule adds rather than subtracts. This is the subtlety the worked
    // example exists to demonstrate.
    expect(varnadaCount(6) % 2).toBe(1);
    expect(varnadaCount(7) % 2).toBe(1);
  });

  it('always lands on a real sign for every lagna/hora combination', () => {
    for (let l = 0; l < 12; l++) {
      for (let h = 0; h < 12; h++) {
        const v = varnada(l, h);
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(12);
      }
    }
  });

  it('runs the dasha forward from an odd lagna and backward from an even one (5.15)', () => {
    const odd = varnadaDashaOrder(6, 0);   // Libra lagna, Varnada Aries
    expect(odd).toHaveLength(12);
    expect(odd[0]!.sign).toBe(0);
    expect(odd[1]!.sign).toBe(1);          // clockwise
    const even = varnadaDashaOrder(7, 0);  // Scorpio lagna (even)
    expect(even[1]!.sign).toBe(11);        // anticlockwise
  });

  it('splits each period into twelve equal sub-periods (5.22)', () => {
    const d = varnadaDashaOrder(6, 0)[0]!;
    const subs = varnadaAntardashas(d, 6);
    expect(subs).toHaveLength(12);
    expect(subs[0]!.years).toBeCloseTo(d.years / 12, 9);
    expect(subs.reduce((s, x) => s + x.years, 0)).toBeCloseTo(d.years, 9);
  });
});

// ── Ch 4.25-30 — Nisheka, against the chapter's worked example ───────────────
describe('BPHS 4.25-30 — Nisheka (book\'s worked example, to the second of arc)', () => {
  // 17 Feb 1984, 22:35 IST, New Delhi.
  const SATURN = 202 + 45 / 60 + 38 / 3600;
  const GULIKA = 208 + 32 / 60 + 6 / 3600;
  const LAGNA_CUSP = 182 + 23 / 60 + 6 / 3600;
  const NINTH_CUSP = 64 + 3 / 60 + 13 / 3600;
  const MOON = 134 + 17 / 60;

  const r = nisheka(SATURN, GULIKA, LAGNA_CUSP, NINTH_CUSP, MOON, true);

  it('component A — Saturn to Gulika — is 5°46\'28"', () => {
    expect(r.a).toBeCloseTo(5 + 46 / 60 + 28 / 3600, 3);
  });

  it('component B — lagna cusp forward to the 9th cusp — is 241°40\'07"', () => {
    expect(r.b).toBeCloseTo(241 + 40 / 60 + 7 / 3600, 3);
  });

  it('component C — the Moon\'s degrees in her sign — is 14°17\'', () => {
    expect(r.c).toBeCloseTo(14 + 17 / 60, 3);
  });

  it('sums to 261°43\'35", read as 261 saura days 43 ghatis', () => {
    expect(r.degrees).toBeCloseTo(261 + 43 / 60 + 35 / 3600, 3);
    expect(Math.floor(r.sauraDays)).toBe(261);
    expect(r.ghatis).toBe(43);
  });

  it('omits component C when the lagna lord is above the horizon (4.28)', () => {
    const withoutC = nisheka(SATURN, GULIKA, LAGNA_CUSP, NINTH_CUSP, MOON, false);
    expect(withoutC.c).toBe(0);
    expect(withoutC.degrees).toBeCloseTo(r.degrees - r.c, 9);
  });

  it('places the lagna lord below the horizon only in houses 1-6', () => {
    expect(isBelowHorizon(1)).toBe(true);
    expect(isBelowHorizon(6)).toBe(true);
    expect(isBelowHorizon(7)).toBe(false);
    expect(isBelowHorizon(12)).toBe(false);
  });
});

// ── Ch 4 notes — rectification from the Adhana chart ─────────────────────────
describe('BPHS 4.25-30 notes — recovering the birth moment from Adhana', () => {
  it('reproduces the book\'s rectification: Capricorn 10°20\'37" → 22:34:55', () => {
    // Night length 12h50m48s = 46248s; sunset 18:09:10. Recorded birth: 22:35:00.
    const degIn = 10 + 20 / 60 + 37 / 3600;
    const elapsed = rectifyFromAdhana(degIn, 46248);
    expect(elapsed).toBeCloseTo(15945.7, 0);
    const birth = 18 * 3600 + 9 * 60 + 10 + elapsed;
    const h = Math.floor(birth / 3600);
    const m = Math.floor((birth % 3600) / 60);
    expect(h).toBe(22);
    expect(m).toBe(34);                       // 22:34:55 against a recorded 22:35
    expect(Math.abs(birth - (22 * 3600 + 35 * 60))).toBeLessThan(10); // within 10 seconds
  });

  it('alternates day and night between conception and birth (Stage 4)', () => {
    expect(birthHalfFromAdhana(9)).toBe('day');    // Capricorn is nocturnal → day birth
    expect(birthHalfFromAdhana(6)).toBe('night');  // Libra is diurnal → night birth
  });

  it('puts birth before 273 days when Moon waning in the invisible half (Stage 1)', () => {
    expect(gestationSide(false, false)).toBe('before-273');
    expect(gestationSide(true, true)).toBe('before-273');
    expect(gestationSide(true, false)).toBe('after-273');
    expect(gestationSide(false, true)).toBe('after-273');
  });

  it('reads the delivery month from the Adhana lagna\'s modality (commentary)', () => {
    expect(deliveryMonthFromAdhana(9)).toBe(9);   // Capricorn, movable → 9th month
    expect(deliveryMonthFromAdhana(1)).toBe(10);  // Taurus, fixed
    expect(deliveryMonthFromAdhana(2)).toBe(11);  // Gemini, dual
  });

  it('puts the natal Moon in the 7th or 10th from the Adhana Moon (commentary)', () => {
    // Book's example: Adhana Moon in Aquarius (10) → natal Moon in Leo or Scorpio.
    expect(natalMoonFromAdhanaMoon(10)).toEqual([4, 7]);
  });
});

// ── Ch 4.4-24 — sign classifications ─────────────────────────────────────────
describe('BPHS 4.4-24 — sign classification', () => {
  it('splits rising type 6 head / 5 back / 1 both', () => {
    const counts = RISING_TYPE.reduce<Record<string, number>>((a, t) => {
      a[t] = (a[t] ?? 0) + 1; return a;
    }, {});
    expect(counts.sirshodaya).toBe(6);
    expect(counts.prishtodaya).toBe(5);
    expect(counts.ubhayodaya).toBe(1);
  });

  it('matches every rising type the verses state outright', () => {
    expect(isSirshodaya(0)).toBe(false);   // Aries, back (4.7)
    expect(isSirshodaya(1)).toBe(false);   // Taurus, back (4.8)
    expect(isSirshodaya(2)).toBe(true);    // Gemini, head (4.9)
    expect(isSirshodaya(3)).toBe(false);   // Cancer, back (4.11)
    expect(isSirshodaya(4)).toBe(true);    // Leo, head (4.12)
    expect(isSirshodaya(5)).toBe(true);    // Virgo, head (4.13)
    expect(isSirshodaya(6)).toBe(true);    // Libra, head (4.15)
    expect(isSirshodaya(9)).toBe(false);   // Capricorn, back (4.20)
    expect(isSirshodaya(10)).toBe(true);   // Aquarius, head (4.21)
    expect(RISING_TYPE[11]).toBe('ubhayodaya'); // Pisces, both (4.23)
  });

  it('splits diurnal and nocturnal evenly, six each', () => {
    expect(DIURNAL_SIGNS).toHaveLength(6);
    expect(NOCTURNAL_SIGNS).toHaveLength(6);
    expect(new Set([...DIURNAL_SIGNS, ...NOCTURNAL_SIGNS]).size).toBe(12);
  });

  it('treats Pisces as diurnal, following the Sanskrit over the English of 4.22', () => {
    expect(isDiurnal(11)).toBe(true);
  });

  it('changes ambulation class at the midpoint of Sagittarius and Capricorn (4.17-20)', () => {
    expect(ambulationClass(8, 5)).toBe('biped');       // Sagittarius first half
    expect(ambulationClass(8, 20)).toBe('quadruped');  // second half
    expect(ambulationClass(9, 5)).toBe('quadruped');   // Capricorn first half
    expect(ambulationClass(9, 20)).toBe('footless');   // second half, in water
  });

  it('classifies the fixed ten', () => {
    expect(ambulationClass(0)).toBe('quadruped');   // Aries
    expect(ambulationClass(2)).toBe('biped');       // Gemini
    expect(ambulationClass(3)).toBe('centipede');   // Cancer
    expect(ambulationClass(7)).toBe('centipede');   // Scorpio
    expect(ambulationClass(11)).toBe('footless');   // Pisces
  });

  it('assigns humours by trine, with the airy trine explicitly mixed (4.5)', () => {
    expect(SIGN_HUMOUR[0]).toBe('pitta');
    expect(SIGN_HUMOUR[1]).toBe('vata');
    expect(SIGN_HUMOUR[2]).toBe('mixed');
    expect(SIGN_HUMOUR[3]).toBe('kapha');
    for (let s = 0; s < 12; s++) expect(SIGN_HUMOUR[s]).toBe(SIGN_HUMOUR[s % 4]);
  });
});

// ── Ch 4.4 — limbs counted from the lagna ────────────────────────────────────
describe('BPHS 4.4 — Kalapurusha limbs, counted from the rising sign', () => {
  it('lists twelve limbs, head first', () => {
    expect(KALAPURUSHA_LIMBS).toHaveLength(12);
    expect(KALAPURUSHA_LIMBS[0]).toBe('head');
    expect(KALAPURUSHA_LIMBS[11]).toBe('feet');
  });

  it('makes the rising sign the head, whichever sign that is (the book\'s Scorpio diagram)', () => {
    expect(limbOfSign(7, 7)).toBe('head');        // Scorpio lagna → Scorpio is the head
    expect(limbOfSign(8, 7)).toBe('face');
    expect(limbOfSign(6, 7)).toBe('feet');        // the 12th
  });

  it('differs from the fixed-Aries scheme for eleven charts in twelve', () => {
    // Aries is the head only when Aries rises. For a Scorpio lagna it is the 6th — hip.
    expect(limbOfSign(0, 0)).toBe('head');
    expect(limbOfSign(0, 7)).toBe('hip');
  });

  it('maps houses directly, house 1 always the head', () => {
    expect(limbOfHouse(1)).toBe('head');
    expect(limbOfHouse(12)).toBe('feet');
  });
});
