// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 4 — Zodiacal Signs Described. Programme Part 2.
// Source lines 1458-1892.
//
// The signs were already described in the first corpus, so most of this chapter is
// reconciliation rather than new ground. What IS new:
//   • Rising type — sirshodaya / prishtodaya / ubhayodaya (4.6-24). Whether a sign
//     rises head-first, back-first or both. Classical use: how a matter surfaces —
//     head-rising signs bring things out quickly and visibly, back-rising slowly and
//     obliquely. Absent from the codebase.
//   • Diurnal / nocturnal split (4.6-24 + the Nisheka notes) — a clean 6/6 division
//     used in birth-time rectification.
//   • Ambulation class — quadruped / biped / centipede / footless, including the two
//     signs that change class at their midpoint (4.17-20).
//   • Kalapurusha limbs counted FROM THE LAGNA (4.4), not from a fixed Aries. The
//     existing `bodyPart` field on RASIS is the fixed-Aries scheme; for an individual
//     BPHS counts from the rising sign, which is a different mapping for 11 of 12 charts.
//   • Nisheka / Adhana — the conception-moment computation (4.25-30), verified against
//     the chapter's own worked example, plus the rectification method that runs it
//     forward again to recover the birth time.
//
// Deliberately NOT encoded:
//   • Longevity and death of parents from the Nisheka chart (4.30) — project policy.
//   • Sign complexions, "resorts to hills/forests", robes, caste — descriptive colour
//     with no predicate attached.
// ─────────────────────────────────────────────────────────────────────────────

import type { SignIndex } from '../../types.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;
const mod360 = (n: number): number => ((n % 360) + 360) % 360;

// ── 4.6-24 Rising type ────────────────────────────────────────────────────────

/**
 * How a sign rises.
 *  • sirshodaya  — head first. Matters under it surface quickly and openly.
 *  • prishtodaya — back first. Matters surface slowly, obliquely, or from behind.
 *  • ubhayodaya  — both. Pisces alone.
 *
 * Ten of the twelve are stated unambiguously in 4.6-24. Two need care and are noted
 * in RISING_TYPE_NOTES below.
 */
export type RisingType = 'sirshodaya' | 'prishtodaya' | 'ubhayodaya';

export const RISING_TYPE: RisingType[] = [
  'prishtodaya', // 0  Aries      — "rises with its back" (4.7)
  'prishtodaya', // 1  Taurus     — "rises with its back" (4.8)
  'sirshodaya',  // 2  Gemini     — "rises with its head" (4.9)
  'prishtodaya', // 3  Cancer     — "rises with its back" (4.11)
  'sirshodaya',  // 4  Leo        — "rises with its head" (4.12)
  'sirshodaya',  // 5  Virgo      — "rises with its head" (4.13)
  'sirshodaya',  // 6  Libra      — "rising with its head" (4.15)
  'sirshodaya',  // 7  Scorpio    — not stated; see note
  'prishtodaya', // 8  Sagittarius— Sanskrit प्रष्ठोदयी; see note
  'prishtodaya', // 9  Capricorn  — "rises with back" (4.20)
  'sirshodaya',  // 10 Aquarius   — "rises with its head" (4.21)
  'ubhayodaya',  // 11 Pisces     — "rises with both head and back" (4.23)
];

export const RISING_TYPE_NOTES: Record<string, string> = {
  scorpio: 'Not stated in 4.15-16. Taken as sirshodaya, which is the settled position of '
    + 'the wider tradition and the only value that leaves a coherent 6/5/1 split.',
  sagittarius: 'CONFLICT. The English of 4.17 reads "rises with its head", but the Sanskrit '
    + 'of the same verse opens प्रष्ठोदयी (back-rising) immediately before धनुः, and the wider '
    + 'tradition places Sagittarius among the back-rising signs. Following the Sanskrit. '
    + 'Recorded rather than silently chosen.',
};

/** Sirshodaya signs rise head-first — matters under them surface quickly and openly. */
export const isSirshodaya = (sign: SignIndex): boolean => RISING_TYPE[mod12(sign)] === 'sirshodaya';

// ── Diurnal / nocturnal ───────────────────────────────────────────────────────

/**
 * Which signs are strong by day and which by night. A clean 6/6 split.
 *
 * NOTE ON A TRANSLATION ERROR: the English of 4.22 says Pisces "is night strong", but
 * the Sanskrit reads दिवाबली — day-strong — and the chapter's own Nisheka notes list
 * Pisces among the six diurnal signs. Following the Sanskrit and the notes, which agree
 * with each other and leave an even 6/6 division; the English of 4.22 stands alone.
 */
export const DIURNAL_SIGNS: SignIndex[] = [4, 5, 6, 7, 10, 11]; // Leo…Scorpio, Aquarius, Pisces
export const NOCTURNAL_SIGNS: SignIndex[] = [0, 1, 2, 3, 8, 9]; // Aries…Cancer, Sag, Capricorn

export const isDiurnal = (sign: SignIndex): boolean => DIURNAL_SIGNS.includes(mod12(sign));

// ── 4.5, 4.17-20 Ambulation class ─────────────────────────────────────────────

/**
 * How a sign "moves". Its classical use is in muhurta and prashna — a quadruped sign
 * favours matters involving animals, land and travel; a footless sign favours matters
 * in or across water; biped signs favour human dealings.
 *
 * Sagittarius and Capricorn change class at their own midpoint (4.17-20), which is why
 * this is a function of degree and not just of sign.
 */
export type AmbulationClass = 'biped' | 'quadruped' | 'centipede' | 'footless';

export function ambulationClass(sign: SignIndex, degInSign = 0): AmbulationClass {
  const s = mod12(sign);
  if (s === 8) return degInSign < 15 ? 'biped' : 'quadruped';      // Sagittarius (4.18)
  if (s === 9) return degInSign < 15 ? 'quadruped' : 'footless';   // Capricorn (4.20)
  const fixed: Record<number, AmbulationClass> = {
    0: 'quadruped', 1: 'quadruped', 2: 'biped', 3: 'centipede',
    4: 'quadruped', 5: 'biped', 6: 'biped', 7: 'centipede',
    10: 'biped', 11: 'footless',
  };
  return fixed[s]!;
}

// ── 4.5 Humours by trine ──────────────────────────────────────────────────────

/**
 * Tridosha by trine (4.5). The existing RASIS table leaves the airy trine null; BPHS
 * states it explicitly as a mix of all three, which is a real value rather than an
 * absence and matters for the medical rules in ch 17.
 */
export type Humour = 'pitta' | 'vata' | 'kapha' | 'mixed';

export const SIGN_HUMOUR: Humour[] = [
  'pitta', 'vata', 'mixed', 'kapha',   // Aries, Taurus, Gemini, Cancer
  'pitta', 'vata', 'mixed', 'kapha',   // Leo, Virgo, Libra, Scorpio
  'pitta', 'vata', 'mixed', 'kapha',   // Sagittarius, Capricorn, Aquarius, Pisces
];

// ── 4.4 Kalapurusha limbs ─────────────────────────────────────────────────────

/**
 * The twelve limbs, in house order (4.4).
 *
 * The distinction that matters: for the Kalapurusha (Time personified) these run from a
 * fixed Aries, but **for an individual BPHS counts them from the rising sign**. The
 * `bodyPart` field on RASIS is the fixed-Aries mapping; use `limbOfSign()` below for a
 * person, which gives a different answer for eleven charts out of twelve.
 */
export const KALAPURUSHA_LIMBS = [
  'head', 'face', 'arms', 'heart', 'stomach', 'hip',
  'below the navel', 'privities', 'thighs', 'knees', 'ankles', 'feet',
] as const;

/** The limb a sign governs for a native with the given rising sign (4.4 notes). */
export function limbOfSign(sign: SignIndex, lagnaSign: SignIndex): string {
  return KALAPURUSHA_LIMBS[mod12(sign - lagnaSign)]!;
}

/** The limb a house governs — house 1 is always the head (4.4 notes). */
export function limbOfHouse(house: number): string {
  return KALAPURUSHA_LIMBS[mod12(house - 1)]!;
}

// ── 4.25-30 Nisheka (Adhana) — the conception moment ──────────────────────────

export interface NishekaResult {
  /** Angular distance Saturn → Gulika (component A). */
  a: number;
  /** Lagna cusp → 9th cusp, counted forward (component B). */
  b: number;
  /** Moon's degrees traversed in her sign, added only when the lagna lord is below the horizon (component C). */
  c: number;
  /** A + B + C, in degrees. */
  degrees: number;
  /**
   * The same figure read as SAURA days (1° = 1 day of 60 ghatis). This is the gap
   * between conception and birth in the solar reckoning.
   */
  sauraDays: number;
  /** Ghatis component of the fractional day, for comparison with the book's notation. */
  ghatis: number;
  vighatis: number;
}

/**
 * Nisheka / Adhana — how long before birth conception occurred (4.25-30).
 *
 *   A = angular distance from Saturn to Gulika
 *   B = from the lagna cusp forward to the 9th cusp (via the 4th and 7th)
 *   C = the Moon's degrees traversed in her own sign, added ONLY when the lagna lord
 *       sits in the invisible half (the ascendant-to-descendant arc through the nadir)
 *   gap = A + B + C, with one degree read as one saura day
 *
 * Verified against the chapter's own worked example to the second of arc — see the test.
 *
 * LIMITATION, stated rather than hidden: converting saura days to a Gregorian date needs
 * the sauramana correction tables, which this text does not reproduce (it refers the
 * reader to Hora-Sara). The raw saura figure is returned; the calendar conversion is not
 * implemented, and any caller wanting a civil date must supply that table itself. In the
 * book's own example the uncorrected figure is 261d 43gh and the corrected one 257d 57gh
 * — a four-day difference, so the correction is not optional for real use.
 */
export function nisheka(
  saturnLong: number,
  gulikaLong: number,
  lagnaCusp: number,
  ninthCusp: number,
  moonLong: number,
  lagnaLordBelowHorizon: boolean,
): NishekaResult {
  const a = mod360(gulikaLong - saturnLong);
  const b = mod360(ninthCusp - lagnaCusp);
  const c = lagnaLordBelowHorizon ? mod360(moonLong) % 30 : 0;
  const degrees = a + b + c;
  const whole = Math.floor(degrees);
  const fracGhatis = (degrees - whole) * 60;
  return {
    a, b, c, degrees,
    sauraDays: degrees,
    ghatis: Math.floor(fracGhatis),
    vighatis: (fracGhatis - Math.floor(fracGhatis)) * 60,
  };
}

/**
 * Whether the lagna lord sits in the invisible half — houses 1 to 6, the arc running
 * from the ascendant down through the nadir to the descendant. Component C of `nisheka`
 * applies only then (4.28).
 */
export const isBelowHorizon = (houseOfLagnaLord: number): boolean =>
  houseOfLagnaLord >= 1 && houseOfLagnaLord <= 6;

// ── Rectification from the Adhana chart ───────────────────────────────────────

/**
 * Recover the birth moment from the Adhana ascendant (4.25-30 notes, "Stage 5").
 *
 * The rule is proportional: the fraction of the Adhana ascendant already traversed
 * equals the fraction of the birth day (or night) already elapsed. So a conception
 * ascendant 10°20' into Capricorn puts the birth 34.5% of the way through the night.
 *
 * Verified against the book's example: Adhana lagna Capricorn 10°20'37", night length
 * 12h50m48s, sunset 18:09:10 → birth 22:34:55, against a recorded 22:35:00.
 *
 * @param degIntoAdhanaLagna degrees already traversed in the Adhana ascendant, 0..30
 * @param periodSeconds      length of the birth day or night, in seconds
 * @returns seconds elapsed since sunrise (day birth) or sunset (night birth)
 */
export function rectifyFromAdhana(degIntoAdhanaLagna: number, periodSeconds: number): number {
  return (periodSeconds * degIntoAdhanaLagna) / 30;
}

/**
 * Which half of the day a birth falls in, given the Adhana ascendant (4.25-30 notes,
 * "Stage 4"). The two alternate: a nocturnal sign rising at conception means a birth in
 * daytime under a diurnal sign, and the reverse.
 */
export function birthHalfFromAdhana(adhanaLagnaSign: SignIndex): 'day' | 'night' {
  return isDiurnal(adhanaLagnaSign) ? 'night' : 'day';
}

/**
 * Whether birth falls before or after 273 days from conception (4.25-30 notes, "Stage 1").
 * 273.2 days is ten lunar revolutions.
 *
 * Waning Moon in the invisible half, or waxing Moon in the visible half → before.
 * The two opposite combinations → after.
 */
export function gestationSide(moonWaxing: boolean, moonInVisibleHalf: boolean): 'before-273' | 'after-273' {
  return moonWaxing === moonInVisibleHalf ? 'before-273' : 'after-273';
}

/**
 * Likely delivery month from the modality of the Adhana ascendant.
 *
 * COMMENTARY, NOT ROOT TEXT: Santhanam attributes this to Suka Jataka by way of
 * Hora-Sara, not to Parashara. Marked so that a later part does not mistake it for BPHS
 * proper. Movable → 9th month, fixed → 10th, dual → 11th.
 */
export function deliveryMonthFromAdhana(adhanaLagnaSign: SignIndex): 9 | 10 | 11 {
  const modality = mod12(adhanaLagnaSign) % 3;
  return modality === 0 ? 9 : modality === 1 ? 10 : 11;
}

/**
 * Where the natal Moon should fall given the Adhana Moon — the 7th or the 10th sign
 * from it. COMMENTARY: Santhanam cites Kalyana Varma's Saravali 8.46-47, not BPHS.
 */
export function natalMoonFromAdhanaMoon(adhanaMoonSign: SignIndex): SignIndex[] {
  return [mod12(adhanaMoonSign + 6), mod12(adhanaMoonSign + 9)];
}
