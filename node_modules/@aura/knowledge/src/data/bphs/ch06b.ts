// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 6b — The Sixteen Divisions of a Sign, part 2. Programme Part 4.
// Source lines 3100-4132: constructions D27…D60, the shashtiamsa table, and the
// varga classification schemes.
//
// Together with Part 3 this completes the chapter: **all sixteen constructions now
// carry independent confirmation**, D60 included, and D60's was decided by the
// chapter's own worked example rather than by reading the verse alone (see below).
//
// The load-bearing deliverable here is the VARGA CLASSIFICATION (6.42-53): the four
// schemes (Shadvarga, Saptavarga, Dasavarga, Shodasavarga), which divisions belong to
// each, what counts as a "good" division, and the designation ladders. Vimsopaka bala
// in Programme Part 5 is computed over these schemes, so Part 5 cannot be correct
// without this part.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, SignIndex } from '../../types.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;

// ── 6.24-26 Bhamsa (D27) ──────────────────────────────────────────────────────

/**
 * The Nakshatramsa / Saptavimsamsa starts from Aries for fiery signs, Cancer for earthy,
 * Libra for airy and Capricorn for watery (6.24-26). Matches `vargaSign(_, 27)`.
 *
 * Santhanam notes that his own Saravali translation gives a different construction and
 * calls that source "obviously defective", preferring Parashara's. We follow BPHS.
 */
export const BHAMSA_START_BY_ELEMENT: SignIndex[] = [0, 3, 6, 9]; // fiery, earthy, airy, watery

// ── 6.27-28 Trimsamsa (D30) ───────────────────────────────────────────────────

export interface TrimsamsaPart {
  lord: Graha;
  /** Degrees of the sign this lord rules. */
  span: number;
  deity: string;
}

/**
 * Trimsamsa for an ODD sign (6.27-28): Mars 5°, Saturn 5°, Jupiter 8°, Mercury 7°,
 * Venus 5°. For an EVEN sign the whole sequence reverses — lords, spans and deities
 * together — giving Venus 5°, Mercury 7°, Jupiter 8°, Saturn 5°, Mars 5°.
 *
 * Note the spans are NOT equal, which is what makes D30 the one division that cannot be
 * computed by simple division. `vargaSign(_, 30)` implements exactly these arcs.
 */
export const TRIMSAMSA_ODD: TrimsamsaPart[] = [
  { lord: 'mars', span: 5, deity: 'Agni' },
  { lord: 'saturn', span: 5, deity: 'Vayu' },
  { lord: 'jupiter', span: 8, deity: 'Indra' },
  { lord: 'mercury', span: 7, deity: 'Kubera' },
  { lord: 'venus', span: 5, deity: 'Varuna' },
];

export const TRIMSAMSA_EVEN: TrimsamsaPart[] = [...TRIMSAMSA_ODD].reverse();

/** The trimsamsa a degree falls in. `sign` decides which sequence applies. */
export function trimsamsaPart(sign: SignIndex, degInSign: number): TrimsamsaPart {
  const isOdd = mod12(sign) % 2 === 0;
  const seq = isOdd ? TRIMSAMSA_ODD : TRIMSAMSA_EVEN;
  let acc = 0;
  for (const p of seq) {
    acc += p.span;
    if (degInSign < acc) return p;
  }
  return seq[seq.length - 1]!;
}

// ── 6.29-32 Khavedamsa (D40) and Akshavedamsa (D45) ──────────────────────────

/** D40 counts from Aries for an odd sign and from Libra for an even one (6.29-30). */
export const KHAVEDAMSA_START = { odd: 0 as SignIndex, even: 6 as SignIndex };

/** D45 starts Aries / Leo / Sagittarius for movable / fixed / dual (6.31-32). */
export const AKSHAVEDAMSA_START: SignIndex[] = [0, 4, 8];

// ── 6.33-41 Shashtiamsa (D60) ─────────────────────────────────────────────────

/**
 * The D60 construction (6.33-41), and the reading that the chapter's worked example
 * settles.
 *
 * The verse says to "ignore the sign position", take the degrees traversed in the sign,
 * multiply by 2, divide by 12, and add 1 to the remainder to get "the sign in which the
 * Shashtiamsa falls". Read alone, that sounds like counting from Aries — which would
 * have made the existing `vargaSign(_, 60)` wrong.
 *
 * The worked example decides it, and the other way: *Venus in Capricorn 13°25' →
 * 13°25' × 2 = 26°50' → 26 ÷ 12 leaves remainder 2 → +1 = 3 → **"Count 3 signs from
 * Capricorn"** → Pisces.* So "ignore the sign position" governs only the INPUT to the
 * multiplication; the result is still counted from the planet's own sign.
 *
 * `vargaSign(_, 60)` already does exactly this and is confirmed correct. Worth stating
 * plainly: reading the verse without the example would have produced a "fix" that broke
 * working code.
 */
export function shashtiamsaOffset(degInSign: number): number {
  return Math.floor(degInSign * 2) % 12;
}

/** The D60 sign for a placement, per 6.33-41 and its worked example. */
export function shashtiamsaSign(sign: SignIndex, degInSign: number): SignIndex {
  return mod12(sign + shashtiamsaOffset(degInSign));
}

/**
 * The sixty shashtiamsa names (6.33-41), in order for an ODD sign.
 *
 * Taken from the running verse text, which is clean. The accompanying table in this
 * edition — which carries the benefic/malefic markings — is badly OCR-degraded, so the
 * NAMES come from the verse and the NATURES from the table only where legible. Seven
 * are `null`: this source does not state them recoverably, and inventing them would be
 * worse than leaving a gap. A clean edition should fill them.
 */
export const SHASHTIAMSA_NAMES: string[] = [
  'Ghora', 'Rakshasa', 'Deva', 'Kubera', 'Yaksha', 'Kinnara',
  'Bhrashta', 'Kulaghna', 'Garala', 'Vahni', 'Maya', 'Purishaka',
  'Apampathi', 'Marutwan', 'Kala', 'Sarpa', 'Amrita', 'Indu',
  'Mridu', 'Komala', 'Heramba', 'Brahma', 'Vishnu', 'Maheswara',
  'Deva', 'Ardra', 'Kalinasa', 'Kshiteesa', 'Kamalakara', 'Gulika',
  'Mrityu', 'Kaala', 'Davagni', 'Ghora', 'Yama', 'Kantaka',
  'Sudha', 'Amrita', 'Poornachandra', 'Vishadagdha', 'Kulanasa', 'Vamsakshaya',
  'Utpata', 'Kaala', 'Saumya', 'Komala', 'Seetala', 'Karala Damshtra',
  'Chandramukhi', 'Praveena', 'Kalapavaka', 'Dandayudha', 'Nirmala', 'Saumya',
  'Kroora', 'Atiseetala', 'Amrita', 'Payodhi', 'Bhramana', 'Chandrarekha',
];

export type ShashtiamsaNature = 'benefic' | 'malefic';

/**
 * Benefic/malefic nature per shashtiamsa index (0-based), where this edition states it.
 * `null` = not recoverable from this source.
 *
 * Index 0 (Ghora) is filled from the table's own cross-reference: entry 34 reads
 * "Ghora (M) — same as S.No. 1", which states index 0's nature by identity. That is the
 * source speaking, not an inference of ours.
 */
export const SHASHTIAMSA_NATURE: (ShashtiamsaNature | null)[] = [
  'malefic', 'malefic', 'benefic', 'benefic', 'benefic', 'benefic',
  'malefic', 'malefic', 'malefic', 'malefic', 'malefic', 'malefic',
  'benefic', 'benefic', 'malefic', 'malefic', 'benefic', 'benefic',
  'benefic', 'benefic', 'benefic', 'benefic', 'benefic', 'benefic',
  'benefic', 'benefic', 'benefic', null, 'benefic', 'malefic',
  'malefic', 'malefic', 'malefic', 'malefic', 'malefic', 'malefic',
  'benefic', 'benefic', 'benefic', 'malefic', 'malefic', 'malefic',
  'malefic', 'malefic', 'benefic', 'benefic', 'benefic', 'malefic',
  'benefic', 'benefic', null, 'malefic', 'benefic', 'benefic',
  'malefic', null, null, null, null, null,
];

export const SHASHTIAMSA_NOTES = {
  incomplete: 'Seven natures (indices 27, 50, 55-59) are not recoverable from this '
    + "edition's OCR. They are null rather than guessed.",
  kalinasa: 'Index 26 (Kalinasa) is marked benefic, but the same entry adds "according '
    + 'to some, this is a malefic Shashtiamsa". Treat as contested.',
  reversal: 'For an EVEN sign the order of the names reverses (6.41): index i takes the '
    + 'name at 59 − i.',
} as const;

export interface ShashtiamsaResult {
  index: number;
  name: string;
  nature: ShashtiamsaNature | null;
  sign: SignIndex;
}

/**
 * The shashtiamsa a placement falls in, with its name and nature (6.33-41).
 * The name order reverses for an even sign.
 */
export function shashtiamsa(sign: SignIndex, degInSign: number): ShashtiamsaResult {
  const raw = Math.min(59, Math.floor(degInSign * 2));
  const index = mod12(sign) % 2 === 0 ? raw : 59 - raw;
  return {
    index,
    name: SHASHTIAMSA_NAMES[index]!,
    nature: SHASHTIAMSA_NATURE[index] ?? null,
    sign: shashtiamsaSign(sign, degInSign),
  };
}

// ── 6.42-53 Varga classification ──────────────────────────────────────────────

export type VargaScheme = 'shadvarga' | 'saptavarga' | 'dasavarga' | 'shodasavarga';

/**
 * Which divisions each scheme counts (6.42-53 notes; the groups are restated at ch 7.17-20).
 *
 *   Shadvarga     D1, D2, D3, D9, D12, D30
 *   Saptavarga    + D7
 *   Dasavarga     + D10, D16, D60
 *   Shodasavarga  all sixteen
 *
 * This is why Part 3's distinction between BPHS's sixteen and the codebase's twenty
 * mattered: every scheme here is a subset of the sixteen, and none of them ever includes
 * D5, D6, D8 or D11.
 */
export const VARGA_SCHEMES: Record<VargaScheme, number[]> = {
  shadvarga: [1, 2, 3, 9, 12, 30],
  saptavarga: [1, 2, 3, 7, 9, 12, 30],
  dasavarga: [1, 2, 3, 7, 9, 10, 12, 16, 30, 60],
  shodasavarga: [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60],
};

/**
 * The designation ladders (6.42-53), indexed by the COUNT of good divisions.
 * Index 0 and 1 are empty — the ladders begin at two good divisions.
 */
export const VARGA_DESIGNATIONS: Record<VargaScheme, (string | null)[]> = {
  shadvarga: [null, null, 'Kimsuka', 'Vyanjana', 'Chamara', 'Chatra', 'Kundala'],
  saptavarga: [null, null, 'Kimsuka', 'Vyanjana', 'Chamara', 'Chatra', 'Kundala', 'Mukuta'],
  dasavarga: [null, null, 'Parijata', 'Uttama', 'Gopura', 'Simhasana', 'Paravata',
    'Devaloka', 'Brahmaloka', 'Sakravahana', 'Sridhama'],
  shodasavarga: [null, null, 'Bhedaka', 'Kusuma', 'Nagapushpa', 'Kanduka', 'Kerala',
    'Kalpavriksha', 'Chandanavana', 'Poornachandra', 'Uchchaisrava', 'Dhanvantari',
    'Suryakanta', 'Vidruma', 'Sakrasimhasana', 'Goloka', 'Sri Vallabha'],
};

/**
 * Alternative names for the top three Dasavarga grades, from Sarvartha Chintamani.
 * Santhanam notes these are "popularly known" in preference to Parashara's own — so a
 * user or another text saying "Vaiseshikamsa" means Sridhama.
 */
export const DASAVARGA_ALIASES: Record<string, string> = {
  Brahmaloka: 'Amara',
  Sakravahana: 'Iravata',
  Sridhama: 'Vaiseshikamsa',
};

/** The designation for a count of good divisions under a scheme, or null below two. */
export function vargaDesignation(scheme: VargaScheme, goodCount: number): string | null {
  return VARGA_DESIGNATIONS[scheme][goodCount] ?? null;
}

/**
 * What makes a division "good" (6.52). The first three are uncontested; the fourth is
 * the sage's own broader criterion.
 */
export const GOOD_VARGA_CRITERIA = [
  'the division falls in the planet\'s exaltation sign',
  'the division falls in the planet\'s moolatrikona sign',
  'the division falls in a sign the planet owns',
  'the division falls in a sign owned by the lord of an angle from the Arudha Lagna',
] as const;

/**
 * The fourth criterion is opt-in, and deliberately so.
 *
 * Santhanam flags that counting the Arudha-angle lords "will bring many signs — sometimes
 * as many as 8 — in the purview of this rule", and states his own view that "the truer
 * strength of a planet lies in its Moola-Trikona, exaltation and own sign positions".
 *
 * Since a criterion that admits eight of twelve signs is close to admitting everything,
 * this defaults OFF. That is a base-rate judgement of exactly the kind Programme §5
 * exists to make: a test that most placements pass carries little information. The sage's
 * criterion is available, not silently applied.
 */
export const ARUDHA_CRITERION_DEFAULT = false;

/**
 * Conditions under which a division must NOT be counted good, however well placed
 * (6.53): a combust planet, a planet defeated in planetary war, a weak planet, or one in
 * an adverse avastha such as Sayana. The text is explicit that these "destroy the good
 * yogas" — so this is a veto, not a discount.
 */
export interface VargaDisqualifier {
  combust?: boolean;
  defeatedInWar?: boolean;
  weak?: boolean;
  adverseAvastha?: boolean;
}

export const isDisqualified = (d: VargaDisqualifier): boolean =>
  !!(d.combust || d.defeatedInWar || d.weak || d.adverseAvastha);

export interface VargaClassification {
  scheme: VargaScheme;
  divisions: number[];
  goodCount: number;
  designation: string | null;
  alias?: string;
  disqualified: boolean;
}

/**
 * Classify a planet's standing across a scheme.
 *
 * `goodDivisions` is the caller's list of divisors in which the planet sits in a good
 * division — the caller decides that using GOOD_VARGA_CRITERIA, because whether the
 * Arudha criterion applies is theirs to choose. A disqualified planet (6.53) scores zero
 * regardless of placement.
 */
export function classifyVarga(
  scheme: VargaScheme,
  goodDivisions: number[],
  disqualifier: VargaDisqualifier = {},
): VargaClassification {
  const divisions = VARGA_SCHEMES[scheme];
  const disqualified = isDisqualified(disqualifier);
  const goodCount = disqualified
    ? 0
    : goodDivisions.filter((d) => divisions.includes(d)).length;
  const designation = vargaDesignation(scheme, goodCount);
  return {
    scheme,
    divisions,
    goodCount,
    designation,
    alias: designation ? DASAVARGA_ALIASES[designation] : undefined,
    disqualified,
  };
}
