// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 3 — Planetary Characters and Description. Programme Part 1.
// Source lines 550-1458 of the Santhanam translation.
//
// What this chapter contributes that the existing knowledge layer did NOT have:
//   • Deep exaltation DEGREES (3.49-50) — enables graded exaltation strength, where
//     before we only knew the sign. This is the seed of uchcha bala (Part 10).
//   • Moolatrikona as degree RANGES (3.51-54), not whole signs. Under BPHS the Sun in
//     Leo 25° is in its OWN sign, not moolatrikona — a distinction the old whole-sign
//     model could not make, and one that changes the dignity of real charts.
//   • The DERIVATION behind natural relationships (3.55), rather than a hard-coded
//     table. Deriving it means we can verify the table instead of trusting it.
//   • Ratio of effects (3.59-60) — the text's own numeric dignity scalar. This is the
//     first arbitration primitive in the programme.
//   • Prana-pada (3.71-74) — a time-sensitive lagna, absent from the codebase.
//   • Planetary time-units for event maturity (3.33) — the timing primitive that turns
//     "this will happen" into "this will happen within roughly this long".
//
// Deliberately NOT encoded, with reasons:
//   • Deity propitiation (3.18 notes) and name-selection consonants — ritual remedies
//     and naming are out of scope by project policy; remedies are behavioural only.
//   • Planetary complexions/physiques (3.23-30) as personal appearance predictions —
//     physiognomy, excluded on the same grounds as ch 81-82 (Programme §7).
//   • Robes, trees, anthills (3.39-44) — no predictive predicate attaches to them.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, SignIndex } from '../../types.js';
import type { DignityState } from '../../rules/predicate.js';
import { lordOfSign } from '../../rules/predicate.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;
const mod360 = (n: number): number => ((n % 360) + 360) % 360;

/** The seven classical planets, in the order BPHS lists them. Nodes are handled apart. */
export const CLASSICAL_SEVEN: Graha[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
];

// ── 3.49-50 Deep exaltation ───────────────────────────────────────────────────

export interface DeepPoint {
  /** Sign of exaltation, 0..11. */
  exaltSign: SignIndex;
  /** Degree within that sign of DEEPEST exaltation. */
  exaltDegree: number;
  /** Debilitation is the 7th sign from exaltation, at the same degree. */
  debilSign: SignIndex;
  debilDegree: number;
}

/**
 * Deep exaltation points (3.49-50). The sign alone was already known; the DEGREE is new,
 * and it is what allows exaltation to be a gradient rather than a flag.
 */
export const DEEP_EXALTATION_POINTS: Record<string, DeepPoint> = {
  sun: { exaltSign: 0, exaltDegree: 10, debilSign: 6, debilDegree: 10 },
  moon: { exaltSign: 1, exaltDegree: 3, debilSign: 7, debilDegree: 3 },
  mars: { exaltSign: 9, exaltDegree: 28, debilSign: 3, debilDegree: 28 },
  mercury: { exaltSign: 5, exaltDegree: 15, debilSign: 11, debilDegree: 15 },
  jupiter: { exaltSign: 3, exaltDegree: 5, debilSign: 9, debilDegree: 5 },
  venus: { exaltSign: 11, exaltDegree: 27, debilSign: 5, debilDegree: 27 },
  saturn: { exaltSign: 6, exaltDegree: 20, debilSign: 0, debilDegree: 20 },
};

/**
 * How close a planet sits to its deep exaltation point, 0..1.
 * 1 = exactly on the deep exaltation degree; 0 = exactly on the deep debilitation degree.
 *
 * BPHS states the two points and that effects are strongest/worst there; it does not
 * state the interpolation between them. Linear on angular distance is the standard
 * modern reading and is marked 'derived' rather than 'example' for that reason.
 */
export function exaltationCloseness(graha: Graha, longitude: number): number | null {
  const p = DEEP_EXALTATION_POINTS[graha];
  if (!p) return null; // nodes: BPHS gives no agreed exaltation, so we decline to guess
  const peak = p.exaltSign * 30 + p.exaltDegree;
  const arc = Math.abs(((mod360(longitude - peak) + 180) % 360) - 180); // 0..180
  return 1 - arc / 180;
}

// ── 3.51-54 Moolatrikona and own-sign, as degree ranges ───────────────────────

export interface DignityBand {
  sign: SignIndex;
  /** Degrees within the sign: [from, to). */
  from: number;
  to: number;
  state: Extract<DignityState, 'exalted' | 'moolatrikona' | 'own'>;
}

/**
 * The degree-bounded dignity bands of 3.51-54.
 *
 * Note the shape BPHS actually describes: a sign can be split across two or three
 * states. Virgo for Mercury is exaltation for 0-15°, moolatrikona for 15-20°, and own
 * house for 20-30°. Treating "Virgo" as uniformly exalted — as whole-sign models do —
 * overstates Mercury's dignity across two thirds of the sign.
 *
 * Signs a planet owns but which carry no moolatrikona (Cancer for the Moon, Scorpio for
 * Mars, Gemini for Mercury, Pisces for Jupiter, Taurus for Venus, Capricorn for Saturn)
 * are plain 'own' throughout and are listed in OWN_SIGNS_WHOLE below.
 */
export const DIGNITY_BANDS: Record<string, DignityBand[]> = {
  sun: [
    { sign: 4, from: 0, to: 20, state: 'moolatrikona' },
    { sign: 4, from: 20, to: 30, state: 'own' },
  ],
  moon: [
    { sign: 1, from: 0, to: 3, state: 'exalted' },
    { sign: 1, from: 3, to: 30, state: 'moolatrikona' },
  ],
  mars: [
    { sign: 0, from: 0, to: 12, state: 'moolatrikona' },
    { sign: 0, from: 12, to: 30, state: 'own' },
  ],
  mercury: [
    { sign: 5, from: 0, to: 15, state: 'exalted' },
    { sign: 5, from: 15, to: 20, state: 'moolatrikona' },
    { sign: 5, from: 20, to: 30, state: 'own' },
  ],
  jupiter: [
    { sign: 8, from: 0, to: 10, state: 'moolatrikona' },
    { sign: 8, from: 10, to: 30, state: 'own' },
  ],
  venus: [
    { sign: 6, from: 0, to: 15, state: 'moolatrikona' },
    { sign: 6, from: 15, to: 30, state: 'own' },
  ],
  saturn: [
    { sign: 10, from: 0, to: 20, state: 'moolatrikona' },
    { sign: 10, from: 20, to: 30, state: 'own' },
  ],
};

/** Signs owned outright, with no moolatrikona segment (BPHS 3.51-54 by omission). */
export const OWN_SIGNS_WHOLE: Record<string, SignIndex[]> = {
  sun: [], moon: [3], mars: [7], mercury: [2], jupiter: [11], venus: [1], saturn: [9],
};

/**
 * The dignity band a planet falls in, by sign AND degree — or null if none applies
 * (in which case relationship-based dignity decides; see `naturalRelationOf`).
 */
export function bandFor(graha: Graha, sign: SignIndex, degInSign: number): DignityBand | null {
  const bands = DIGNITY_BANDS[graha] ?? [];
  const hit = bands.find((b) => b.sign === sign && degInSign >= b.from && degInSign < b.to);
  if (hit) return hit;
  if (OWN_SIGNS_WHOLE[graha]?.includes(sign)) return { sign, from: 0, to: 30, state: 'own' };
  return null;
}

// ── 3.55 Natural relationships, DERIVED ───────────────────────────────────────

export type Relation = 'friend' | 'neutral' | 'enemy';

/** Signs counted from a planet's moolatrikona whose lords are its friends (3.55). */
export const FRIEND_HOUSES_FROM_MT = [2, 4, 5, 8, 9, 12] as const;
/** The remainder — whose lords are enemies. */
export const ENEMY_HOUSES_FROM_MT = [3, 6, 7, 10, 11] as const;

/**
 * The moolatrikona sign of each classical planet (3.51-54).
 *
 * The Moon is the odd one out and it matters: its moolatrikona is TAURUS — its
 * exaltation sign, owned by Venus — while the sign it actually rules is Cancer. Every
 * other planet's moolatrikona sits in a sign it owns. Because 3.55 counts houses FROM
 * the moolatrikona, the Moon's entire relationship row is derived from a sign it does
 * not rule. That derivation still reproduces the book's printed table exactly, which is
 * good evidence the rule is being read correctly rather than coincidentally.
 */
export const MOOLATRIKONA_SIGN: Record<string, SignIndex> = {
  sun: 4, moon: 1, mars: 0, mercury: 5, jupiter: 8, venus: 6, saturn: 10,
};

/**
 * Derive the natural relationship of `from` toward `to`, per 3.55:
 *
 *   friends  = lords of the 2nd, 4th, 5th, 8th, 9th, 12th from the moolatrikona sign,
 *              PLUS the lord of the exaltation sign (always counted friendly)
 *   enemies  = lords of the 3rd, 6th, 7th, 10th, 11th from the moolatrikona sign
 *   neutral  = a planet that qualifies as both
 *
 * Verified: this reproduces the book's own relationship table (the speculum printed
 * after 3.55) for all seven planets — see the test suite. That is why the derivation is
 * encoded rather than the table: a derivation can be checked, a table can only be trusted.
 */
export function naturalRelationOf(from: Graha, to: Graha): Relation | null {
  const mt = MOOLATRIKONA_SIGN[from];
  const ex = DEEP_EXALTATION_POINTS[from];
  if (mt == null || !ex) return null; // nodes: derived rule does not apply, see NODE_RELATIONS
  if (from === to) return null;

  let isFriend = false;
  let isEnemy = false;
  for (const h of FRIEND_HOUSES_FROM_MT) if (lordOfSign(mod12(mt + h - 1)) === to) isFriend = true;
  for (const h of ENEMY_HOUSES_FROM_MT) if (lordOfSign(mod12(mt + h - 1)) === to) isEnemy = true;
  if (lordOfSign(ex.exaltSign) === to) isFriend = true;

  if (isFriend && isEnemy) return 'neutral';
  if (isFriend) return 'friend';
  if (isEnemy) return 'enemy';
  return 'neutral';
}

/**
 * Node relationships (3.55 notes). BPHS proper derives relationships from moolatrikona,
 * which the nodes do not have; Santhanam supplies these from the wider tradition, so
 * they are marked as commentary rather than root text.
 */
export const NODE_RELATIONS: Record<string, Partial<Record<Graha, Relation>>> = {
  rahu: {
    sun: 'enemy', moon: 'enemy', mars: 'enemy',
    jupiter: 'friend', venus: 'friend', saturn: 'friend', mercury: 'neutral',
  },
  ketu: {
    sun: 'enemy', moon: 'enemy',
    mars: 'friend', venus: 'friend', saturn: 'friend',
    mercury: 'neutral', jupiter: 'neutral',
  },
};

// ── 3.59-60 Ratio of effects — the first arbitration primitive ────────────────

/**
 * The fraction of its GOOD effects a planet delivers, by dignity (3.59-60).
 * Malefic effects run the other way: the text says inauspicious results are "quite
 * reverse", i.e. a debilitated planet delivers its harm in full.
 *
 * This is BPHS supplying its own numeric weighting, and it is the reason the programme
 * treats dignity as a scalar rather than a label.
 */
export const BENEFIC_RATIO: Record<DignityState, number> = {
  exalted: 1,
  moolatrikona: 0.75,
  own: 0.5,
  friend: 0.25,
  neutral: 0.125,
  enemy: 0,
  debilitated: 0,
};

/** The reverse scale for a planet's capacity to harm (3.60). */
export const MALEFIC_RATIO: Record<DignityState, number> = {
  exalted: 0,
  moolatrikona: 0.125,
  own: 0.25,
  friend: 0.5,
  neutral: 0.75,
  enemy: 1,
  debilitated: 1,
};

/**
 * Effect ratio for a placement. `combust` collapses the benefic ratio to zero: 3.60
 * groups the combust ("asta") planet with debilitation and enemy signs.
 */
export function effectRatio(
  dignity: DignityState,
  opts: { combust?: boolean } = {},
): { benefic: number; malefic: number } {
  if (opts.combust) return { benefic: 0, malefic: MALEFIC_RATIO[dignity] };
  return { benefic: BENEFIC_RATIO[dignity], malefic: MALEFIC_RATIO[dignity] };
}

// ── 3.33 Planetary time units — the event-maturity primitive ──────────────────

/**
 * The span of time each planet governs (3.33, with the nodes from 3.46).
 *
 * Use: when a planet signifies a matter that is going to fructify, this is the order of
 * magnitude of the wait. The Moon signifying an outcome means roughly an hour; Saturn
 * signifying it means roughly a year. This is the classical answer to "how soon", and
 * it is what lets the engine attach a horizon to a prediction rather than only a window.
 */
export const PLANET_TIME_UNIT: Record<string, { unit: string; days: number }> = {
  sun: { unit: 'ayana (half-year)', days: 182.6 },
  moon: { unit: 'muhurta (48 minutes)', days: 48 / 1440 },
  mars: { unit: 'a day', days: 1 },
  mercury: { unit: 'ritu (two months)', days: 60.9 },
  jupiter: { unit: 'a month', days: 30.4 },
  venus: { unit: 'a fortnight', days: 15.2 },
  saturn: { unit: 'a year', days: 365.25 },
  rahu: { unit: 'eight months', days: 243.5 },
  ketu: { unit: 'three months', days: 91.3 },
};

// ── 3.35-38 Strength conditions — seeds of Shadbala (Parts 9-11) ──────────────

/** Natural strength order, weakest to strongest (3.38). Becomes naisargika bala. */
export const NAISARGIKA_ORDER: Graha[] = [
  'saturn', 'mars', 'mercury', 'jupiter', 'venus', 'moon', 'sun',
];

/** Naisargika bala in rupas — the classical scale is (index+1)/7 of a full rupa. */
export function naisargikaBala(graha: Graha): number | null {
  const i = NAISARGIKA_ORDER.indexOf(graha);
  return i < 0 ? null : (i + 1) / 7;
}

/** Which house grants directional strength (3.35-38 notes). */
export const DIG_BALA_HOUSE: Record<string, number> = {
  mercury: 1, jupiter: 1, sun: 10, mars: 10, saturn: 7, moon: 4, venus: 4,
};

/** When each planet is strong by time of day (3.36). Mercury is strong in both. */
export const DAY_NIGHT_STRENGTH: Record<string, 'day' | 'night' | 'both'> = {
  sun: 'day', jupiter: 'day', venus: 'day',
  moon: 'night', mars: 'night', saturn: 'night',
  mercury: 'both',
};

/**
 * Paksha and ayana strength (3.37): malefics gain in the dark fortnight and in
 * Dakshinayana; benefics gain in the bright fortnight and in Uttarayana.
 */
export const PAKSHA_AYANA_RULE = {
  malefic: { paksha: 'krishna', ayana: 'dakshina' },
  benefic: { paksha: 'shukla', ayana: 'uttara' },
} as const;

// ── 3.47 Dhatu / Moola / Jeeva — the prashna query classifier ─────────────────

export type QueryClass = 'dhatu' | 'moola' | 'jeeva';

/**
 * What category of thing a planet points at (3.47): mineral, vegetable, or animate.
 * Its classical use is horary — identifying what an unstated question is ABOUT from the
 * significator. Retained because Programme Part 47 (ch 78, lost horoscopy) needs it.
 */
export const QUERY_CLASS: Record<string, QueryClass> = {
  rahu: 'dhatu', mars: 'dhatu', saturn: 'dhatu', moon: 'dhatu',
  sun: 'moola', venus: 'moola',
  mercury: 'jeeva', jupiter: 'jeeva', ketu: 'jeeva',
};

/** Where a planet's matter is found (3.32) — horary, for locating a lost thing. */
export const PLANET_ABODE: Record<string, string> = {
  sun: 'a temple',
  moon: 'a watery place',
  mars: 'a place of fire',
  mercury: 'a sports ground',
  jupiter: 'a treasury',
  venus: 'a bedroom',
  saturn: 'rubbish ground',
};

// ── 3.71-74 Prana-pada ────────────────────────────────────────────────────────

export interface PranaPada {
  /** Sidereal longitude 0..360. */
  longitude: number;
  sign: SignIndex;
  degInSign: number;
  /** House 1..12 from the natal lagna. */
  houseFromLagna: number;
  /** 3.73-74: auspicious in 2, 4, 5, 9, 10, 11 from the lagna. */
  auspicious: boolean;
}

/** Houses in which Prana-pada is declared auspicious (3.73-74). */
export const PRANAPADA_GOOD_HOUSES = [2, 4, 5, 9, 10, 11] as const;

/**
 * Prana-pada (3.71-74) — a lagna-like point that moves with the exact birth moment.
 *
 * Method: convert the time elapsed since sunrise into vighatikas (1 vighati = 24s) and
 * divide by 15. The quotient is read as a count of SIGNS. Add that arc to the Sun's
 * longitude; add a further 240° if the Sun is in a fixed sign, or 120° if in a dual sign.
 *
 * Verified against the book's own worked example (3.71-74 notes): 16gh 25vi = 985
 * vighatis; 985/15 = 65.67 signs → 5s 20° = 170°; with the Sun in Aries 15° (movable),
 * Prana-pada = 185° = Libra 5°. The two other branches of that example are covered in
 * the test suite.
 *
 * Because it advances a full sign roughly every 6 minutes of clock time, Prana-pada is
 * far more birth-time sensitive than the ascendant. Treat a Prana-pada claim as void
 * unless the birth time is known to the minute.
 */
export function pranaPada(
  vighatisSinceSunrise: number,
  sunLongitude: number,
): PranaPada {
  const sunSign = Math.floor(mod360(sunLongitude) / 30);
  const modality = sunSign % 3; // 0 movable, 1 fixed, 2 dual
  const extra = modality === 1 ? 240 : modality === 2 ? 120 : 0;
  const arc = (vighatisSinceSunrise / 15) * 30;
  const longitude = mod360(sunLongitude + arc + extra);
  return {
    longitude,
    sign: Math.floor(longitude / 30),
    degInSign: longitude % 30,
    houseFromLagna: 0, // filled by withLagna()
    auspicious: false,
  };
}

/** Place a computed Prana-pada against a lagna to get its house and verdict. */
export function pranaPadaFromLagna(pp: PranaPada, lagnaSign: SignIndex): PranaPada {
  const houseFromLagna = mod12(pp.sign - lagnaSign) + 1;
  return {
    ...pp,
    houseFromLagna,
    auspicious: (PRANAPADA_GOOD_HOUSES as readonly number[]).includes(houseFromLagna),
  };
}

/** Convenience: minutes since sunrise → vighatis (1 vighati = 24 seconds). */
export const minutesToVighatis = (minutes: number): number => (minutes * 60) / 24;

// ── 3.61-64 note: the upagraha formula discrepancy ────────────────────────────

/**
 * CONFLICT LEDGER ENTRY — bphs.03.061.
 *
 * The verse translation and the editor's worked example disagree on two of the five
 * Sun-based upagrahas.
 *
 *   Verse text (and the wider tradition):  Vyatipata = 360° − Dhooma
 *                                          Indrachapa = 360° − Parivesha
 *   Editor's notes and example:            Vyatipata = Dhooma + 53°20'
 *                                          Indrachapa = Parivesha − 53°20'
 *
 * Both chains satisfy the closure test the text uses to validate itself (Upaketu + 30°
 * returns the Sun), so closure cannot arbitrate between them. They differ by 40° at
 * Vyatipata and Parivesha and reconverge at Indrachapa.
 *
 * DECISION: follow the VERSE, which is what `sunUpagrahas()` in data/upagrahas.ts
 * already implements. Reason: it is the root text rather than commentary, and it agrees
 * with the parallel statements in the wider literature. Recorded here so the choice is
 * visible rather than silent, per Programme §6.
 */
export const UPAGRAHA_FORMULA_CONFLICT = {
  ruleId: 'bphs.03.061',
  verse: '61-64',
  positions: {
    rootText: 'vyatipata = 360 - dhooma; indrachapa = 360 - parivesha',
    commentary: 'vyatipata = dhooma + 53°20\'; indrachapa = parivesha - 53°20\'',
  },
  decision: 'rootText',
  reason: 'Root verse over editorial commentary; agrees with the parallel tradition. '
    + 'Closure (Upaketu + 30° = Sun) holds for both chains and cannot decide it.',
} as const;

/**
 * Dignities assigned to the upagrahas and kaala-velas (3.66-69 notes, quoting
 * Jatakalankaram). Marked as commentary, not root text — BPHS itself does not give
 * these, and no classical planet is exalted or debilitated in these signs, so they
 * cannot conflict with the main dignity scheme.
 */
export const UPAGRAHA_DIGNITIES: Record<string, { exalt?: SignIndex; debil?: SignIndex; own: SignIndex }> = {
  dhuma: { exalt: 4, debil: 10, own: 9 },
  vyatipaata: { exalt: 7, debil: 1, own: 2 },
  parivesha: { exalt: 2, debil: 8, own: 8 },
  indrachaapa: { exalt: 8, debil: 2, own: 3 },
  upaketu: { exalt: 10, debil: 4, own: 3 },
  gulika: { own: 10 },
  yamaghantaka: { own: 8 },
  ardhaprahara: { own: 2 },
  kaala: { own: 9 },
  mrityu: { own: 7 },
};

/**
 * 3.70 — Gulika's longitude is the ascendant rising at the START of Gulika's eighth
 * part, not the middle or the end. Santhanam notes that some authorities use the end;
 * Parashara's own position is the start, and that is what we follow.
 */
export const GULIKA_LONGITUDE_RULE = 'start-of-part' as const;

/**
 * 3.65 — what an upagraha afflicts. Stated as a condition, never as a verdict: the
 * source's phrasing around longevity is exactly the material project policy keeps
 * computed and unsurfaced.
 */
export const UPAGRAHA_AFFLICTION: Record<string, string> = {
  sun: 'pressure on lineage and continuity',
  moon: 'unsettled mind; emotional strain',
  lagna: 'strain on vitality and judgement',
};
