// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 27a — Evaluation of Strengths: Sthana Bala. Programme Part 9.
// Source lines 10749-11700.
//
// **Shadbala begins.** The first corpus explicitly placed this out of its scope; BPHS
// gives it 2,894 lines. Until it lands, the phrase "if strong" — which hundreds of rules
// waiting in Parts 20-33 depend on — has no computable meaning.
//
// Sthana bala is the first of the six, and it has five components of its own:
//
//     Uchcha              0-60 virupas   exaltation strength
//     Saptavargaja        0-315          dignity across seven divisions
//     Ojhayugmarasiamsa   0-30           odd/even sign and navamsa
//     Kendradi            15/30/60       angle, succedent or cadent
//     Drekkana            0 or 15        decanate matching the planet's gender
//                         ─────────
//     maximum             480 virupas = 8 rupas
//
// What is striking on extraction: **almost all of it is already computable from earlier
// parts.** Uchcha bala is exactly Part 1's `exaltationCloseness` × 60 — an identity
// verified across all seven planets at 1440 sample points. Saptavargaja needs Part 1's
// degree-bounded dignity and Parts 3-4's varga constructions. Ojhayugma and Drekkana need
// nothing but the planetary genders from ch 3. Kendradi needs Part 5's house categories.
// The dependency-ordered plan (§2) is what made that true.
//
// NOT a replacement for `planetStrength` in packages/engine. That function says of itself
// that it is "Shadbala-inspired… an honest subset… no exact Rupa/Virupa units,
// normalized to [0,1]". It is a different instrument answering a different question, and
// it stays. This is the classical computation in real virupas.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House, SignIndex } from '../../types.js';
import { DEEP_EXALTATION_POINTS } from './ch03.js';
import { foldedArcBala } from './ch27b.js';

/** One rupa is 60 virupas — the unit Shadbala is reported in. */
export const VIRUPAS_PER_RUPA_27 = 60;

/** Shadbala is computed for the seven classical planets only; the nodes are excluded (27.1 notes). */
export const SHADBALA_PLANETS: Graha[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
];

/** The six strengths (27.1 notes). Parts 9-11 cover them in order. */
export const SHADBALA_COMPONENTS = [
  'sthana', 'dig', 'kala', 'cheshta', 'naisargika', 'drik',
] as const;
export type ShadbalaComponent = (typeof SHADBALA_COMPONENTS)[number];

/** The five parts of Sthana bala (27.1 notes). */
export const STHANA_COMPONENTS = [
  'uchcha', 'saptavargaja', 'ojhayugmarasiamsa', 'kendradi', 'drekkana',
] as const;
export type SthanaComponent = (typeof STHANA_COMPONENTS)[number];

// ── 27.1 Uchcha bala ──────────────────────────────────────────────────────────

/**
 * Exaltation strength, 0-60 virupas (27.1).
 *
 * "Deduct from the longitude of the planet its deep debilitation point. If the sum is less
 * than 6 signs, consider it as it is; if it exceeds 6 signs, deduct the same from 12
 * signs. The sum so got be converted into degrees and divided by 3."
 *
 * So: the arc from the deep debilitation point, folded into 0-180, divided by 3. Zero at
 * exact debilitation, a full rupa at exact exaltation.
 *
 * Verified against the chapter's worked example — the Sun at Pisces 12°15' with deep
 * debilitation at Libra 10° gives 50.75 virupas.
 *
 * NAMED `shadbalaUchchaBala`, not `uchchaBala`, because that name is already taken by a
 * DIFFERENT instrument: Tajaka's uchcha bala (ch 28.4.2) scores 0-20 on the annual-chart
 * scale, while this scores 0-60 virupas within Shadbala. The classical texts give both the
 * same Sanskrit name; the codebase must not. Conflating them would silently scale one
 * strength by three.
 *
 * **This is exactly Part 1's `exaltationCloseness` × 60.** Because the deep exaltation and
 * debilitation points sit 180° apart, `arcFromDebilitation / 3` and
 * `(1 − arcFromExaltation / 180) × 60` are the same number — an identity that holds for all
 * seven planets at every longitude, and is asserted in the tests. Part 1 had already
 * computed this quantity in normalised form without knowing what it was.
 */
export function shadbalaUchchaBala(graha: Graha, longitude: number): number | null {
  const point = DEEP_EXALTATION_POINTS[graha];
  if (!point) return null; // nodes are excluded from Shadbala
  // RETROFIT (Part 10 sweep): this used to inline the fold-and-divide-by-three. Ch 27
  // uses that same shape for Dig, Paksha and Ayana bala too, so it now lives in one
  // place — `foldedArcBala` — with the zero point as the only difference between them.
  return foldedArcBala(longitude, point.debilSign * 30 + point.debilDegree);
}

// ── 27.2-4 Saptavargaja bala ──────────────────────────────────────────────────

/**
 * Dignity worth in virupas, per division (27.2-4).
 *
 * **Not the same scale as Vimsopaka's Varga Viswa (ch 7).** They look similar and are
 * different instruments: Vimsopaka is a 20-point scale with no moolatrikona tier, scaled
 * by a per-division weight and summed to 20. This is a virupa scale WITH a moolatrikona
 * tier, summed flat across seven divisions to a maximum of 315. Conflating them would be
 * an easy and invisible error.
 *
 * RETROFIT (Programme Part 12). A THIRD near-identical ladder exists: `SUBHANKA` (28.7-9).
 * It has nine tiers rather than seven, adding exaltation at 60 and debilitation at 0, and
 * it disagrees with this one at two of the shared tiers — great-friend 22 against 20, and
 * neutral 8 against 10. It also weights the vargas differently (full in the rasi, halved
 * elsewhere, max 240). It is a TENDENCY, not a strength. Three ladders, three purposes,
 * kept separate on purpose.
 */
export const SAPTAVARGAJA_VIRUPAS = {
  moolatrikona: 45,
  own: 30,
  'great-friend': 20,
  friend: 15,
  neutral: 10,
  enemy: 4,
  'great-enemy': 2,
} as const;

export type SaptavargajaTier = keyof typeof SAPTAVARGAJA_VIRUPAS;

/** The seven divisions Saptavargaja bala is reckoned over (27.2-4). */
export const SAPTAVARGA_DIVISIONS = [1, 2, 3, 7, 9, 12, 30] as const;

/** Maximum Saptavargaja bala: moolatrikona in all seven divisions. */
export const SAPTAVARGAJA_MAX = SAPTAVARGAJA_VIRUPAS.moolatrikona * SAPTAVARGA_DIVISIONS.length;

/**
 * Sum the dignity worth across the seven divisions.
 *
 * `tierFor` is supplied by the caller because the full seven-tier scale needs the compound
 * relationship, whose temporary half is chart-specific — the same limitation Vimsopaka has
 * (ch 7). A caller with only natural relationships can reach five of the seven tiers.
 */
export function saptavargajaBala(tierFor: (divisor: number) => SaptavargajaTier): number {
  return SAPTAVARGA_DIVISIONS.reduce((sum, d) => sum + SAPTAVARGAJA_VIRUPAS[tierFor(d)], 0);
}

// ── 27.4 notes — Ojhayugmarasiamsa bala ───────────────────────────────────────

/**
 * Odd/even strength, 15 virupas each for the sign and the navamsa (27.4 notes).
 *
 * Male and neuter planets take it in ODD (male) signs; female planets in EVEN (female)
 * signs. The genders come straight from ch 3.19 — Mercury and Saturn neuter, Moon and
 * Venus female, Sun, Mars and Jupiter male — so this component needed no new data at all.
 */
export const OJHAYUGMA_PER_PLACEMENT = 15;

/** Planets that gain in ODD signs: the male and neuter ones (ch 3.19). */
export const ODD_SIGN_PLANETS: Graha[] = ['sun', 'mars', 'jupiter', 'mercury', 'saturn'];
/** Planets that gain in EVEN signs: the female ones. */
export const EVEN_SIGN_PLANETS: Graha[] = ['moon', 'venus'];

const isOddSign = (sign: SignIndex): boolean => (((sign % 12) + 12) % 12) % 2 === 0;

/**
 * Ojhayugmarasiamsa bala, 0-30 virupas — 15 for the rasi and 15 for the navamsa.
 * `navamsaSign` is the sign the planet occupies in D9.
 */
export function ojhayugmarasiamsaBala(
  graha: Graha, rasiSign: SignIndex, navamsaSign: SignIndex,
): number {
  if (!SHADBALA_PLANETS.includes(graha)) return 0;
  const wantsOdd = ODD_SIGN_PLANETS.includes(graha);
  let total = 0;
  if (isOddSign(rasiSign) === wantsOdd) total += OJHAYUGMA_PER_PLACEMENT;
  if (isOddSign(navamsaSign) === wantsOdd) total += OJHAYUGMA_PER_PLACEMENT;
  return total;
}

// ── 27.5 Kendradi bala ────────────────────────────────────────────────────────

/** Angle 60, succedent 30, cadent 15 virupas (27.5). */
export const KENDRADI_VIRUPAS = { kendra: 60, panaphara: 30, apoklima: 15 } as const;

/**
 * Kendradi bala from a house 1-12 (27.5).
 * Angles are 1/4/7/10, succedents 2/5/8/11, cadents 3/6/9/12 — Part 5's house categories.
 */
export function kendradiBala(house: House): number {
  const h = (((house - 1) % 12) + 12) % 12 + 1;
  if ([1, 4, 7, 10].includes(h)) return KENDRADI_VIRUPAS.kendra;
  if ([2, 5, 8, 11].includes(h)) return KENDRADI_VIRUPAS.panaphara;
  return KENDRADI_VIRUPAS.apoklima;
}

// ── 27.6 Drekkana bala ────────────────────────────────────────────────────────

/** 15 virupas, or nothing (27.6). */
export const DREKKANA_VIRUPAS = 15;

/**
 * Decanate strength (27.6): a male planet gains in the FIRST decanate, a female in the
 * SECOND, a neuter in the THIRD. Otherwise nothing.
 *
 * Genders again from ch 3.19 — this component is entirely a composition of Part 1's data
 * with Part 3's decanate.
 */
export const PLANET_GENDER: Record<string, 'male' | 'female' | 'neuter'> = {
  sun: 'male', mars: 'male', jupiter: 'male',
  moon: 'female', venus: 'female',
  mercury: 'neuter', saturn: 'neuter',
};

export function drekkanaBala(graha: Graha, degInSign: number): number {
  const gender = PLANET_GENDER[graha];
  if (!gender) return 0;
  const decanate = Math.min(2, Math.floor(degInSign / 10)); // 0, 1 or 2
  const wanted = gender === 'male' ? 0 : gender === 'female' ? 1 : 2;
  return decanate === wanted ? DREKKANA_VIRUPAS : 0;
}

// ── The total ─────────────────────────────────────────────────────────────────

export interface SthanaBalaParts {
  uchcha: number;
  saptavargaja: number;
  ojhayugmarasiamsa: number;
  kendradi: number;
  drekkana: number;
}

export interface SthanaBalaResult extends SthanaBalaParts {
  graha: Graha;
  /** Total in virupas. */
  total: number;
  /** The same total in rupas. */
  rupas: number;
}

/** The largest Sthana bala attainable: 60 + 315 + 30 + 60 + 15. */
export const STHANA_BALA_MAX =
  60 + SAPTAVARGAJA_MAX + 2 * OJHAYUGMA_PER_PLACEMENT + KENDRADI_VIRUPAS.kendra + DREKKANA_VIRUPAS;

/**
 * Sum the five components (27.1-6).
 *
 * Deliberately takes the parts rather than computing them, because Saptavargaja needs
 * chart-specific relationship tiers the knowledge layer cannot derive from a longitude.
 * Every component is separately testable, which matters: a wrong sub-component is easy to
 * hide inside a plausible-looking total.
 */
export function sthanaBala(graha: Graha, parts: SthanaBalaParts): SthanaBalaResult {
  const total = parts.uchcha + parts.saptavargaja + parts.ojhayugmarasiamsa
    + parts.kendradi + parts.drekkana;
  return { graha, ...parts, total, rupas: total / VIRUPAS_PER_RUPA_27 };
}

/**
 * The engine's `planetStrength` is NOT this, and neither supersedes the other.
 *
 * It describes itself as a normalised [0,1] composite of "the reliably-computable
 * classical strength sources" without exact rupa units — a deliberate simplification
 * chosen so every component is deterministic. This module is the classical computation in
 * real virupas. Both stand; a caller should know which question it is asking.
 */
export const VS_ENGINE_PLANET_STRENGTH =
  'packages/engine planetStrength is a normalised [0,1] Shadbala-INSPIRED composite, by '
  + 'its own description. This is the classical computation in virupas. Different '
  + 'instruments, both valid — do not replace one with the other.';
