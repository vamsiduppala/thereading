// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 7 — Divisional Consideration. Programme Part 5.
// Source lines 4132-4824.
//
// **Vimsopaka bala — the first genuine arbitration instrument in the codebase.**
//
// Everything before this graded a planet with labels or counts. Vimsopaka gives a
// NUMBER out of 20, built from the planet's dignity across the divisional charts, with
// each division weighted by how much it is held to matter. That is what finally answers
// "this planet looks strong in D1, but is that real?" — a planet exalted in the birth
// chart and in enemy signs across the divisions scores badly, and should.
//
// Relation to Part 4: `classifyVarga` counts good divisions and names the count.
// Vimsopaka *weights* them and scores the result. Same traversal, two instruments — one
// classical designation, one continuous number. Both now run off the same standing
// computation in compose.ts so they can never disagree about scheme membership.
//
// Also here: 7.28-29's Sun-distance strength, which is a continuous curve rather than
// the binary combustion flag the codebase has had until now.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, SignIndex } from '../../types.js';
import { lordOfSign } from '../../rules/predicate.js';
import { vargaSign } from '../varga.js';
import { naturalRelationOf, NODE_RELATIONS, type Relation } from './ch03.js';
import { VARGA_SCHEMES, type VargaScheme } from './ch06b.js';

const mod360 = (n: number): number => ((n % 360) + 360) % 360;

// ── 7.17-25 Vimsopaka weights ─────────────────────────────────────────────────

/**
 * The full strength each division carries, per scheme (7.17-25).
 *
 * **Every scheme sums to exactly 20** — that is the "vimsopaka" (twenty-fold) in the
 * name, and it is a free self-check on the transcription. The invariant suite asserts it.
 *
 * Note how the emphasis shifts as the scheme widens: in Shadvarga the birth chart carries
 * 6 of the 20, but by Shodasavarga it carries only 3.5 and the Shashtiamsa carries 4 —
 * the finer the scheme, the less the rasi chart alone decides.
 */
export const VIMSOPAKA_WEIGHTS: Record<VargaScheme, Record<number, number>> = {
  // 7.17-19: Rashi, Hora, decanate, Navamsa, Dwadasamsa, Trimsamsa
  shadvarga: { 1: 6, 2: 2, 3: 4, 9: 5, 12: 2, 30: 1 },
  // 7.17-19: the same, with Saptamsa inserted in varga order
  saptavarga: { 1: 5, 2: 2, 3: 3, 7: 2.5, 9: 4.5, 12: 2, 30: 1 },
  // 7.20: "3 for Rashi, 5 for Shashtiamsa, and for the other 8 divisions 1½ each"
  dasavarga: { 1: 3, 2: 1.5, 3: 1.5, 7: 1.5, 9: 1.5, 10: 1.5, 12: 1.5, 16: 1.5, 30: 1.5, 60: 5 },
  // 7.21-25: Hora 1, Trimsamsa 1, decanate 1, Shodasamsa 2, Navamsa 3, Rashi 3½,
  // Shashtiamsa 4, and "the rest of the nine divisions each a half"
  shodasavarga: {
    1: 3.5, 2: 1, 3: 1, 4: 0.5, 7: 0.5, 9: 3, 10: 0.5, 12: 0.5,
    16: 2, 20: 0.5, 24: 0.5, 27: 0.5, 30: 1, 40: 0.5, 45: 0.5, 60: 4,
  },
};

export const VIMSOPAKA_TOTAL = 20;

// ── 7.21-25 Varga Viswa ───────────────────────────────────────────────────────

/**
 * The five-fold relationship tiers, plus own — how much of a division's weight a planet
 * actually collects there (7.21-25). BPHS calls these figures the Varga Viswa.
 */
export type VargaViswaTier =
  | 'own' | 'great-friend' | 'friend' | 'neutral' | 'enemy' | 'great-enemy';

export const VARGA_VISWA: Record<VargaViswaTier, number> = {
  own: 20,
  'great-friend': 18,
  friend: 15,
  neutral: 10,
  enemy: 7,
  'great-enemy': 5,
};

/**
 * BPHS names own / adhimitra / mitra / sama / shatru / adhishatru and **does not list
 * exaltation separately**. Rather than invent a seventh tier, an exalted planet is scored
 * at the `own` tier, which is the settled practice — but it is an interpolation, not the
 * text, and is flagged here so it can be revisited.
 */
export const VIMSOPAKA_EXALTATION_NOTE =
  'BPHS 7.21-25 lists own/great-friend/friend/neutral/enemy/great-enemy and states no '
  + 'separate figure for exaltation. Exalted is scored as own (20), which is settled '
  + 'practice but an interpolation rather than the text.';

/**
 * The tier a planet holds in a given sign.
 *
 * The full five-fold scheme needs the COMPOUND relationship (natural + temporary), and
 * the temporary half is chart-specific — it cannot be derived from a longitude alone.
 * So: if the caller supplies a compound relation, all six tiers are available; if not,
 * only the natural relationship is used and the two extreme tiers (great-friend,
 * great-enemy) can never be reached. That limitation is reported rather than hidden.
 */
export function vargaViswaTier(
  graha: Graha,
  sign: SignIndex,
  compound?: VargaViswaTier,
): VargaViswaTier {
  if (lordOfSign(sign) === graha) return 'own';
  if (compound) return compound;
  const lord = lordOfSign(sign);
  const rel: Relation | null =
    naturalRelationOf(graha, lord) ?? NODE_RELATIONS[graha]?.[lord] ?? null;
  return rel === 'friend' ? 'friend' : rel === 'enemy' ? 'enemy' : 'neutral';
}

// ── 7.26-27 Proportional evaluation ───────────────────────────────────────────

export interface VimsopakaDivision {
  divisor: number;
  sign: SignIndex;
  /** The division's full weight in this scheme. */
  weight: number;
  tier: VargaViswaTier;
  viswa: number;
  /** weight × viswa / 20 — this division's actual contribution. */
  score: number;
}

/** The bands of 7.26-27. */
export type VimsopakaBand = 'ineffective' | 'some-good' | 'mediocre' | 'wholly-favourable';

/**
 * `max` is the exclusive upper bound of each band, EXCEPT the first, whose bound is
 * inclusive. See `VIMSOPAKA_FLOOR_NOTE` — read exclusively, the lowest band could never
 * fire at all.
 */
export const VIMSOPAKA_BANDS: { max: number; band: VimsopakaBand; means: string }[] = [
  { max: 5, band: 'ineffective', means: 'not capable of giving auspicious results' },
  { max: 10, band: 'some-good', means: 'yields some good effects' },
  { max: 15, band: 'mediocre', means: 'mediocre effects' },
  { max: Infinity, band: 'wholly-favourable', means: 'wholly favourable effects' },
];

/** The lowest score the scheme can produce: weights sum to 20, and the lowest viswa is 5. */
export const VIMSOPAKA_MINIMUM = 5;

/**
 * CONFLICT LEDGER `bphs.07.026` — the lowest band's boundary.
 *
 * 7.26-27 says a total "below 5" means the planet cannot give auspicious results, and
 * "above 5 but below 10" means some good. Taken strictly, **that leaves the lowest band
 * unreachable**: the weights of every scheme sum to 20 and the smallest Varga Viswa is 5,
 * so the minimum attainable total is exactly 20 × 5 ÷ 20 = 5. Nothing can score below it.
 *
 * So the lowest boundary is treated as INCLUSIVE — a planet at the floor is ineffective.
 * The alternative is a band the text defines and no chart can ever occupy, which is the
 * less likely reading of a scheme otherwise this tidy. Exactly 5 also means every single
 * division fell in a sworn enemy's sign, which is precisely the case the band describes.
 */
export const VIMSOPAKA_FLOOR_NOTE =
  'The minimum attainable Vimsopaka is exactly 5 (weights sum to 20, lowest viswa is 5), '
  + 'so 7.26-27\'s "below 5" band is unreachable if read exclusively. The lowest boundary '
  + 'is therefore treated as inclusive: a total of exactly 5 is ineffective.';

/** Which band a Vimsopaka total falls in (7.26-27). */
export function vimsopakaBand(total: number): { band: VimsopakaBand; means: string } {
  const hit = VIMSOPAKA_BANDS.find((b, i) => (i === 0 ? total <= b.max : total < b.max))
    ?? VIMSOPAKA_BANDS[VIMSOPAKA_BANDS.length - 1]!;
  return { band: hit.band, means: hit.means };
}

export interface VimsopakaResult {
  graha: Graha;
  scheme: VargaScheme;
  divisions: VimsopakaDivision[];
  /** Out of 20. */
  total: number;
  band: VimsopakaBand;
  means: string;
  /** True when only natural relationships were available, capping the tiers at 3 of 6. */
  naturalOnly: boolean;
  note?: string;
}

/**
 * Vimsopaka bala — a planet's strength out of 20, across a divisional scheme (7.17-27).
 *
 *   score(division) = full weight × varga viswa ÷ 20
 *   total           = Σ score
 *
 * A planet in its own sign in every division scores exactly 20; one in sworn-enemy signs
 * throughout scores 5. Below 5 the text says the planet cannot give auspicious results at
 * all — which makes this the first instrument in the codebase that can say a placement
 * *will not deliver*, as a number rather than an adjective.
 *
 * @param compoundBySign optional per-sign compound relationship, if the caller has the
 *   chart. Without it only natural relationships apply and the extreme tiers are
 *   unreachable — reported as `naturalOnly`.
 */
export function vimsopakaBala(
  graha: Graha,
  longitude: number,
  scheme: VargaScheme,
  compoundBySign?: (sign: SignIndex) => VargaViswaTier | undefined,
): VimsopakaResult {
  const weights = VIMSOPAKA_WEIGHTS[scheme];
  let naturalOnly = true;

  const divisions: VimsopakaDivision[] = VARGA_SCHEMES[scheme].map((divisor) => {
    const sign = vargaSign(longitude, divisor);
    const supplied = compoundBySign?.(sign);
    if (supplied) naturalOnly = false;
    const tier = vargaViswaTier(graha, sign, supplied);
    const viswa = VARGA_VISWA[tier];
    const weight = weights[divisor] ?? 0;
    return { divisor, sign, weight, tier, viswa, score: (weight * viswa) / VIMSOPAKA_TOTAL };
  });

  const total = divisions.reduce((s, d) => s + d.score, 0);
  const { band, means } = vimsopakaBand(total);
  return {
    graha,
    scheme,
    divisions,
    total,
    band,
    means,
    naturalOnly,
    note: naturalOnly
      ? 'Natural relationships only — the great-friend (18) and great-enemy (5) tiers '
        + 'need the compound relationship, which is chart-specific and cannot come from a '
        + 'longitude alone. Supply compoundBySign for the full six-tier scheme.'
      : undefined,
  };
}

// ── 7.28-29 Strength by distance from the Sun ─────────────────────────────────

/**
 * A planet's strength by angular distance from the Sun (7.28-29).
 *
 * "The planets in the 7th from the Sun will be fully effective. One with an identical
 * longitude in comparison to the Sun's will destroy the good effects. Rule of three
 * process be applied to the planet in between."
 *
 * "Rule of three" is linear proportion, so this is a continuous ramp: 0 at exact
 * conjunction, 1 at exact opposition. **This is a genuine upgrade over the binary
 * `combust` flag** the codebase has carried until now — a planet 11° from the Sun and one
 * 3° from it are both "combust" under a flag, but score 0.06 and 0.02 here.
 *
 * Santhanam adds a caution worth honouring: this is a strength ramp for computation, not
 * a claim that a planet near the Sun is inert. Yogas formed with a close Sun still
 * fructify; he notes the rule is meant for longevity work and ray-rectification.
 */
export function sunDistanceStrength(planetLong: number, sunLong: number): number {
  const sep = Math.abs(((mod360(planetLong - sunLong) + 180) % 360) - 180); // 0..180
  return sep / 180;
}

export const SUN_DISTANCE_NOTE =
  'A continuous ramp, 0 at conjunction to 1 at opposition (7.28-29, "rule of three"). '
  + 'Santhanam cautions this is a computational strength scale, not a claim that a planet '
  + 'near the Sun is inert — yogas involving a close Sun still fructify.';

// ── 7.1-8 What each division is read for ──────────────────────────────────────

/**
 * The use of each of the sixteen divisions (7.1-8).
 *
 * RECONCILIATION with the existing `DIVISIONALS` table (first corpus): the two agree on
 * all sixteen. Two additions in the existing data are NOT in BPHS and are noted rather
 * than removed — D40 as "maternal legacy" and D45 as "paternal legacy" come from the
 * first corpus. BPHS says only "auspicious and inauspicious effects" and "all general
 * indications" respectively. Not contradictory, just additional; left in place.
 */
export const VARGA_USE: Record<number, string> = {
  1: 'the physique and general wellbeing',
  2: 'wealth',
  3: 'happiness through co-born',
  4: 'fortunes',
  7: 'progeny and dynasty',
  9: 'the spouse',
  10: 'power, position and livelihood',
  12: 'parents',
  16: 'conveyances and the comfort they bring',
  20: 'worship, spiritual progress, religious activity',
  24: 'academic achievement',
  27: 'strength and weakness',
  30: 'evils',
  40: 'auspicious and inauspicious effects',
  45: 'all general indications',
  60: 'all general indications',
};

/**
 * Two extra rules attached to the division list (7.1-8), which are ordinary conditional
 * rules rather than definitions — the first predicates the programme has met that key off
 * a *division's* quality rather than a placement.
 */
export const VARGA_LORD_RULES = [
  {
    id: 'bphs.07.008a',
    text: 'A bhava whose lord occupies a malefic shashtiamsa diminishes.',
    attribution: 'attributed by BPHS to Garga and others',
  },
  {
    id: 'bphs.07.008b',
    text: 'A bhava whose lord occupies a benefic shodasamsa flourishes.',
    attribution: 'root text',
  },
] as const;

// ── 7.33-36 House categories ──────────────────────────────────────────────────

/**
 * The house categories (7.33-36). Cross-checked against the existing `BHAVAS.categories`
 * data and in agreement; encoded here as the sets themselves so a predicate can ask
 * "is this an upachaya house" without a table lookup per house.
 */
export const HOUSE_CATEGORIES = {
  kendra: [1, 4, 7, 10],
  panaphara: [2, 5, 8, 11],
  apoklima: [3, 6, 9, 12],
  kona: [5, 9],
  trika: [6, 8, 12],
  chaturasra: [4, 8],
  upachaya: [3, 6, 10, 11],
} as const;

export type HouseCategory = keyof typeof HOUSE_CATEGORIES;

/** Every category a house belongs to (7.33-36). */
export function categoriesOfHouse(house: number): HouseCategory[] {
  return (Object.keys(HOUSE_CATEGORIES) as HouseCategory[])
    .filter((k) => (HOUSE_CATEGORIES[k] as readonly number[]).includes(house));
}

/**
 * 7.39-43: the father is read from the 9th from the ascendant AND the 9th from the Sun.
 *
 * The general principle — read a matter from its house counted from BOTH the lagna and
 * the relevant karaka — is the same "declare your reference" discipline Part 2 established
 * for the special ascendants, arriving here from a different direction.
 */
export const DUAL_REFERENCE_RULE =
  'Read a matter from its house counted from the lagna AND from its natural significator '
  + '(7.39-43 gives the father from the 9th from the lagna and the 9th from the Sun). '
  + 'Agreement between the two strengthens the reading.';
