// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 28 — Ishta and Kashta Bala. Programme Part 12.
//   Lines 13643-13729. Verses 1-20, all extracted.
//
// Shadbala (ch 27) answers "how strong". This chapter answers "which way does that
// strength point". A planet with 400 virupas will act forcefully; Ishta and Kashta say
// whether it acts FOR the native or AGAINST them. Nothing before this part could tell
// those apart, and `effectRatio` (Part 1) is a single scalar that cannot.
//
// The chapter's real discovery is structural, and it arrives in 28.11-12: *any* strength
// on the 0-60 virupa scale IS its own Ishta, with Kashta the remainder to 60. Ishta is
// not a separate quantity to compute — it is a way of READING the quantities Parts 9-11
// already produce. That single sentence retires a large amount of would-be new machinery.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha } from '../../types.js';
import { foldedArcBala } from './ch27b.js';

const mod360 = (x: number): number => ((x % 360) + 360) % 360;

export type TendencyVerdict = 'auspicious' | 'neutral' | 'inauspicious';

// ── 28.2-4 The rays: Uchcha Rasmi and Cheshta Rasmi ───────────────────────────

/**
 * A rasmi ("ray") runs 1 at the worst point to 7 at the best. It is the same folded arc
 * Shadbala uses, in different units.
 *
 * The verse's arithmetic, unpacked: fold the arc into 0-180, express it in rashis and
 * degrees, ADD ONE RASHI, and double the degrees. Doubling degrees (0-30) into 0-60 is
 * just writing the remainder as sixtieths of a rashi — so the whole instruction is
 *
 *     rasmi = 1 + arc/30
 *
 * and since `foldedArcBala` is arc/3, **rasmi = 1 + virupas/10**. The rays and the
 * virupas are one scale twice. Verse 6 then reverses the conversion, which is why the
 * two halves of this chapter agree exactly rather than approximately.
 */
export const RASMI_MIN = 1;
export const RASMI_MAX = 7;

/** Convert a 0-60 virupa strength to its 1-7 ray count (28.2, read against 28.6). */
export const rasmiFromBala = (virupas: number): number => 1 + virupas / 10;

/** Convert a 1-7 ray count back to 0-60 virupas (28.6, "reduce 1, multiply by 10"). */
export const balaFromRasmi = (rasmi: number): number => (rasmi - 1) * 10;

/**
 * Uchcha Rasmi — exaltation rays (28.2).
 *
 * **The seventh user of `foldedArcBala`.** The zero point is the deep debilitation point,
 * exactly as in Shadbala's Uchcha bala (27.1), so `uchchaRasmi` and `shadbalaUchchaBala`
 * are guaranteed to move together. That is asserted rather than assumed.
 */
export const uchchaRasmi = (longitude: number, deepDebilitationPoint: number): number =>
  rasmiFromBala(foldedArcBala(longitude, deepDebilitationPoint));

/**
 * The Cheshta Kendra of the Sun (28.4): tropical Sun plus three signs.
 *
 * Note SAYANA — the tropical longitude, not the sidereal one. This is the only place in
 * the strength chapters besides Ayana bala where the tropical frame is wanted, and for
 * the same reason: it is really a solstice measure wearing a longitude costume.
 */
export const cheshtaKendraSun = (sayanaSunLongitude: number): number =>
  mod360(sayanaSunLongitude + 90);

/**
 * The Cheshta Kendra of the Moon (28.4): sidereal Moon minus sidereal Sun.
 *
 * That is the elongation — the tithi arc. Which means the Moon's Cheshta Rasmi is built
 * from the same arc as Paksha bala (27.10), and 27.18's claim that the Moon's Cheshta
 * bala IS its Paksha bala is not a shorthand but an identity. Asserted in the test.
 */
export const cheshtaKendraMoon = (moonLongitude: number, sunLongitude: number): number =>
  mod360(moonLongitude - sunLongitude);

/** Cheshta Rasmi from a Cheshta Kendra (28.3), folded and scaled like Uchcha Rasmi. */
export const cheshtaRasmi = (cheshtaKendra: number): number =>
  rasmiFromBala(foldedArcBala(cheshtaKendra, 0));

/**
 * 28.3-4 completes what 27.24-25 began: the Cheshta Kendra for all seven, not just the
 * tara-grahas. `cheshtaKendra` in ch27c handles Mars through Saturn; these two handle the
 * luminaries. A caller with all seven should dispatch on the planet.
 */
export const CHESHTA_KENDRA_SOURCE: Record<string, string> = {
  sun: '28.4 — tropical Sun + 90 degrees',
  moon: '28.4 — sidereal Moon minus sidereal Sun (the elongation)',
  mars: '27.24-25 — seeghrocha minus the mean of mean and true longitude',
  mercury: '27.24-25 — seeghrocha minus the mean of mean and true longitude',
  jupiter: '27.24-25 — seeghrocha minus the mean of mean and true longitude',
  venus: '27.24-25 — seeghrocha minus the mean of mean and true longitude',
  saturn: '27.24-25 — seeghrocha minus the mean of mean and true longitude',
};

// ── 28.5 Subha and Asubha Rasmi ───────────────────────────────────────────────

/** Subha Rasmi plus Asubha Rasmi is always 8 (28.5). */
export const RASMI_PAIR_TOTAL = 8;

/** Auspicious rays: the mean of the exaltation and motional rays (28.5). */
export const subhaRasmi = (uchcha: number, cheshta: number): number => (uchcha + cheshta) / 2;

/** Inauspicious rays: the remainder to 8 (28.5). */
export const asubhaRasmi = (subha: number): number => RASMI_PAIR_TOTAL - subha;

// ── 28.6 Ishta and Kashta Phala ───────────────────────────────────────────────

/** Ishta and Kashta always sum to one rupa (28.6). */
export const ISHTA_KASHTA_TOTAL = 60;

export interface IshtaKashta {
  ishta: number;
  kashta: number;
  verdict: TendencyVerdict;
}

/**
 * Split any 0-60 virupa strength into its auspicious and inauspicious halves (28.11-12).
 *
 * The verse names Dig bala and Dina bala, but states the principle generally: the strength
 * a planet has IS the good it can do, and the remainder to 60 is the harm. This is the
 * chapter's most reusable sentence — it applies unchanged to every 0-60 quantity Parts
 * 9-11 produce (Uchcha, Dig, Paksha, Ayana, Cheshta, Naisargika, Drik, the Bhava
 * positional term), so none of them needs its own Ishta rule.
 *
 * Scope, stated plainly: this holds for strengths ON the 0-60 scale. Sthana bala (max 480)
 * and Kala bala (max 390) are sums of such strengths and must be split component by
 * component, not as totals.
 */
export function ishtaKashtaOfBala(virupas: number): IshtaKashta {
  const ishta = virupas;
  const kashta = ISHTA_KASHTA_TOTAL - virupas;
  return {
    ishta,
    kashta,
    verdict: ishta > kashta ? 'auspicious' : ishta < kashta ? 'inauspicious' : 'neutral',
  };
}

export const ANY_BALA_IS_ITS_OWN_ISHTA =
  'BPHS 28.11-12: a strength on the 0-60 virupa scale is itself the measure of good the '
  + 'planet can do, and 60 minus it is the harm. Ishta needs no separate computation for '
  + 'any such strength. Totals on other scales must be split per component.';

/**
 * Ishta Phala (28.6) — and the chapter's quiet punchline.
 *
 * "Reduce 1 from each rasmi, multiply by 10, add, halve." Reducing 1 and multiplying by
 * 10 is `balaFromRasmi`, which undoes `rasmiFromBala`. So the whole verse reduces to
 *
 *     Ishta = (Uchcha bala + Cheshta bala) / 2
 *
 * of Shadbala's own components, in Shadbala's own virupas. **Ishta Phala is not new data
 * at all** — it is the arithmetic mean of two strengths Parts 9-11 already compute. Every
 * chart that has a Shadbala already has its Ishta, and the two can never drift apart.
 *
 * The verse states an ARITHMETIC mean. A geometric mean of the same two quantities is a
 * different number and is not what this text says; if one is ever wanted it must be
 * introduced as our choice, not attributed here.
 */
export function ishtaPhala(uchchaBala: number, cheshtaBala: number): number {
  return (uchchaBala + cheshtaBala) / 2;
}

/** Kashta Phala: the remainder to one rupa (28.6). */
export const kashtaPhala = (ishta: number): number => ISHTA_KASHTA_TOTAL - ishta;

/** Ishta, Kashta and the verdict between them, from the two Shadbala components. */
export function ishtaKashtaOf(uchchaBala: number, cheshtaBala: number): IshtaKashta {
  return ishtaKashtaOfBala(ishtaPhala(uchchaBala, cheshtaBala));
}

// ── 28.7-9 Subhanka: the nine-tier tendency ladder ────────────────────────────

/**
 * Benefic points by dignity (28.7-9). Nine tiers, exaltation to debilitation.
 *
 * **This is NOT `SAPTAVARGAJA_VIRUPAS` (27.2-4) and must never be merged with it.** The
 * two ladders are close enough to look like a transcription variant and are not:
 *
 *   tier            ch 27 (bala)   ch 28 (subhanka)
 *   exaltation           —              60
 *   moolatrikona        45              45
 *   own                 30              30
 *   great friend        20              22
 *   friend              15              15
 *   neutral             10               8
 *   enemy                4               4
 *   great enemy          2               2
 *   debilitation         —               0
 *
 * They disagree at two tiers and ch 28 adds the two extremes ch 27 leaves out. They also
 * weight the vargas differently (ch 27: flat across seven, max 315; ch 28: full in the
 * rasi and halved elsewhere, max 240) and answer different questions — a STRENGTH that
 * feeds Sthana bala versus a TENDENCY that feeds Ishta. Kept apart deliberately.
 */
export const SUBHANKA = {
  exalted: 60,
  moolatrikona: 45,
  own: 30,
  'great-friend': 22,
  friend: 15,
  neutral: 8,
  enemy: 4,
  'great-enemy': 2,
  debilitated: 0,
} as const;

export type SubhankaTier = keyof typeof SUBHANKA;

/** The nine tiers in the verse's own descending order (28.7-8). */
export const SUBHANKA_ORDER: SubhankaTier[] = [
  'exalted', 'moolatrikona', 'own', 'great-friend', 'friend',
  'neutral', 'enemy', 'great-enemy', 'debilitated',
];

/** Benefic points, halved outside the rasi chart (28.9). */
export const subhanka = (tier: SubhankaTier, divisor = 1): number =>
  divisor === 1 ? SUBHANKA[tier] : SUBHANKA[tier] / 2;

/** Malefic points: the remainder to 60, halved outside the rasi chart (28.9). */
export const asubhanka = (tier: SubhankaTier, divisor = 1): number =>
  divisor === 1
    ? ISHTA_KASHTA_TOTAL - SUBHANKA[tier]
    : (ISHTA_KASHTA_TOTAL - SUBHANKA[tier]) / 2;

/** Exalted in the rasi and in all six other vargas: 60 + 6 x 30 (28.9). */
export const SUBHANKA_SAPTAVARGA_MAX = 60 + 6 * 30;

export const SUBHANKA_VS_SAPTAVARGAJA =
  'BPHS 28.7-9 (subhanka, nine tiers, max 240 over the saptavarga) and 27.2-4 '
  + '(saptavargaja bala, seven tiers, max 315) are different instruments that disagree at '
  + 'great-friend and neutral. One is a tendency, the other a strength. Do not merge them.';

// ── 28.10 The categorical verdict ─────────────────────────────────────────────

/**
 * Where a tier falls (28.10): auspicious in the first five, neutral in the sixth,
 * inauspicious in the last three.
 *
 * **The verdict is categorical and cannot be recovered from the number.** A planet in a
 * friend's sign scores 15 out of 60 — a quarter — and is still auspicious, while neutral
 * at 8 is the pivot. Anyone who reimplements this as a threshold on the subhanka will get
 * `friend` and `neutral` wrong in opposite directions. Asserted in the test for exactly
 * that reason.
 */
export function tierVerdict(tier: SubhankaTier): TendencyVerdict {
  const i = SUBHANKA_ORDER.indexOf(tier);
  if (i < 5) return 'auspicious';
  if (i === 5) return 'neutral';
  return 'inauspicious';
}

// ── 28.13 Proportional attribution ────────────────────────────────────────────

/**
 * Each strength's share of the planet's total (28.13).
 *
 * TRANSLATION CONFLICT, resolved toward the Sanskrit. The English gloss says the strengths
 * are "multiplied by the respective planet's Shad-bala pinda"; the verse says
 * `balaikyena bhajet prithak` — divide, separately, by the SUM of the strengths. Dividing
 * is also the only reading that produces a usable quantity: multiplying two virupa figures
 * gives a number on no scale at all, whereas dividing gives each component's share of the
 * whole, which is what "the effects due to that strength" needs.
 *
 * Precedent: `bphs.04.022` took the Sanskrit over the English for the same reason.
 */
export function balaShares(parts: Record<string, number>): Record<string, number> {
  const total = Object.values(parts).reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(parts)) out[k] = total === 0 ? 0 : v / total;
  return out;
}

/**
 * Attribute a planet's Ishta and Kashta across its component strengths (28.13).
 *
 * Each component contributes in proportion to its share of the total, so the shares sum
 * back to the planet's own Ishta. A planet that is strong only through Naisargika bala
 * and a planet equally strong through Dig bala both reach the same Shadbala, and this is
 * what tells them apart.
 */
export function attributeIshta(
  parts: Record<string, number>, ishta: number,
): Record<string, number> {
  const shares = balaShares(parts);
  const out: Record<string, number> = {};
  for (const [k, s] of Object.entries(shares)) out[k] = s * ishta;
  return out;
}

export const VERSE_13_CONFLICT =
  'The English gloss of 28.13 says multiply by the Shadbala pinda; the Sanskrit says '
  + 'divide by the sum of the strengths. We follow the Sanskrit — it is the only reading '
  + 'that yields a quantity on a defined scale. Same precedent as bphs.04.022.';

// ── 28.14 Aspects carry the tendency too ──────────────────────────────────────

/**
 * An aspect's auspicious and inauspicious weight (28.14): the graded drishti of Part 7,
 * scaled by the aspecting planet's subhanka and asubhanka.
 *
 * So a full aspect from an exalted planet lands at full auspicious weight, and the same
 * full aspect from a debilitated one lands entirely on the other side of the ledger. This
 * is the first rule in the corpus that makes a strong aspect from a bad placement a
 * liability rather than a benefit.
 */
export function aspectIshtaKashta(
  drishtiVirupas: number, tier: SubhankaTier, divisor = 1,
): { auspicious: number; inauspicious: number } {
  const scale = drishtiVirupas / ISHTA_KASHTA_TOTAL;
  return {
    auspicious: scale * subhanka(tier, divisor),
    inauspicious: scale * asubhanka(tier, divisor),
  };
}

// ── 28.15-20 The effects of a bhava ───────────────────────────────────────────

/**
 * A contributor to a bhava's ledger. `favourable` decides which column it lands in;
 * every contributor adds to one column and subtracts from the other, which is exactly the
 * symmetry 28.15-17 states three times over ("add the same to the auspicious effects and
 * deduct from inauspicious effects... if a malefic, reverse the process").
 */
export interface BhavaContributor {
  what: string;
  favourable: boolean;
  amount: number;
}

export interface BhavaEffectInputs {
  /** The bhava's own strength, read as Ishta (28.11-12). */
  bhavaIshta: number;
  /** The bhava lord's Ishta Phala (28.15: "a combination of Bhava strength and its lord's"). */
  lordIshta: number;
  /** Occupants, aspects and dignities — 28.15-17 treats all three the same way. */
  contributors?: BhavaContributor[];
  /** Ashtakavarga bindus and rekhas for the bhava (28.18). */
  ashtakavarga?: { bindus: number; rekhas: number };
}

export interface BhavaEffect {
  auspicious: number;
  inauspicious: number;
  net: number;
  verdict: TendencyVerdict;
  ledger: BhavaContributor[];
}

/**
 * BPHS's own algorithm for what a house will actually deliver (28.15-20).
 *
 * This matters out of proportion to its length: it is the text stating its OWN arbitration
 * procedure, which the programme was otherwise going to have to invent in Part 19. The
 * order is bhava strength, then lord strength, then occupants, then aspects, then dignity,
 * then Ashtakavarga — and every term is signed, so nothing is special-cased.
 *
 * The signing convention is the verse's: a favourable term adds to the auspicious column
 * AND subtracts from the inauspicious one. That double motion is not double counting — it
 * is what makes `net` scale with agreement between the terms rather than with their count.
 */
export function bhavaEffect(input: BhavaEffectInputs): BhavaEffect {
  const ledger: BhavaContributor[] = [...(input.contributors ?? [])];
  if (input.ashtakavarga) {
    ledger.push({ what: 'ashtakavarga bindus', favourable: true, amount: input.ashtakavarga.bindus });
    ledger.push({ what: 'ashtakavarga rekhas', favourable: false, amount: input.ashtakavarga.rekhas });
  }
  let auspicious = input.bhavaIshta + input.lordIshta;
  let inauspicious = kashtaPhala(input.bhavaIshta) + kashtaPhala(input.lordIshta);
  for (const c of ledger) {
    if (c.favourable) {
      auspicious += c.amount;
      inauspicious -= c.amount;
    } else {
      auspicious -= c.amount;
      inauspicious += c.amount;
    }
  }
  const net = auspicious - inauspicious;
  return {
    auspicious,
    inauspicious,
    net,
    verdict: net > 0 ? 'auspicious' : net < 0 ? 'inauspicious' : 'neutral',
    ledger,
  };
}

/**
 * A bhava spanning two rasis takes the lord of whichever rasi carries more bindus; if
 * neither dominates, average the two (28.19-20).
 *
 * This needs a bhava's extent, which needs bhava madhya — and BPHS never defines it (see
 * the ch 27 finding). The function is therefore written to take the two bindu counts
 * directly, so it is usable the moment a cusp convention is chosen, and does not force
 * one now.
 */
export function twoSignBhava(
  bindusFirst: number, bindusSecond: number,
): 'first' | 'second' | 'average' {
  if (bindusFirst > bindusSecond) return 'first';
  if (bindusSecond > bindusFirst) return 'second';
  return 'average';
}

export const CH28_NOT_ENCODED = {
  '18': 'Ashtakavarga bindus and rekhas are consumed as inputs here; their computation is '
    + 'chapter 66 and belongs to a later part.',
  '19-20': 'Deciding whether a bhava spans two rasis requires bhava madhya, which BPHS '
    + 'never defines anywhere. `twoSignBhava` takes the bindu counts directly so the rule '
    + 'is ready without forcing a cusp convention.',
};

/** The planets this chapter reckons for — the same seven as Shadbala; the nodes are out. */
export const ISHTA_KASHTA_PLANETS: Graha[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
];
