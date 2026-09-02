// BPHS Programme Part 39 — Chapter 51: working out the antardasa, in five different systems.
//
// A COMPUTATION chapter, the first since Part 34, and it does two separable things.
//
// The first is a **reconciliation**: verses 1-2 give the Vimshottari-family subdivision the
// engine has shipped since before this programme began. Six of the chapter's own worked
// examples were checked against it and **nothing changed** — the same outcome as Part 34's
// six checkpoints, and for the same reason: the arithmetic is not in dispute, only whether
// we had it right.
//
// The second is a **new capability**. The chapter gives subdivision rules for four systems
// besides Vimshottari, and the engine had none of them: the equal ninth for a Chara/Kendradi
// dasha of planets (v3-4), the equal twelfth for a rasi dasha with a modality-dependent
// ORDER (v5-12), the hundredth for Kalachakra, and the Pachaka fractions for Pinda/Amsa/
// Nisarga (v13-16). Our `subPeriodYears` is a Vimshottari-family proportion and could not
// express any of them.
//
// The order rules (v6-12) are the substance here. They are a genuine 12-sign permutation
// that depends on the dasha rasi's modality AND its parity, and both of the chapter's worked
// examples reproduce exactly — which, for a rule with this many branches, is real evidence.

import type { SignIndex } from '../../types.js';
import { signModality, type Modality } from '../longevity.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;

// ─────────────────────────────────────────────────────────────────────────────
// 51.1-2 — the Vimshottari-family subdivision, reconciled
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 51.1: *multiply the dasha years of the one by the dasha years of the other and divide
 * by the total dasha years.* That is `subPeriodYears(parentYears, childLord)` exactly, and it
 * composes to any depth — 51.1 applies the same operation again for the pratyantar.
 *
 * 51.2 gives the ORDER: **the first antardasa belongs to the lord of the dasha**, and the
 * rest follow in the same cycle. That is `dashaSequence(mahaLord)`, also already shipped.
 *
 * Six of the chapter's own worked examples were checked against the shipped functions:
 *
 * | example | book | ours |
 * |---|---|---|
 * | Venus antar in Venus dasha | 3y 4m | 20×20/120 = 3.3333y ✓ |
 * | Venus pratyantar in that antar | 6m 20d | 40×240/1440 = 6.667m ✓ |
 * | Mercury antar in Saturn dasha | 2y 8m 9d | 17×19/120 = 2.6917y ✓ |
 * | Kalachakra Aries in Aries | 5m 26d 24gh | 7×7/100 = 0.49y ✓ (to the ghatika) |
 * | Kalachakra Sagittarius in Aries | 8m 12d | 7×10/100 = 0.7y ✓ |
 * | Aquarius Chara antardasa | 8m each | 8y/12 ✓ |
 *
 * **Nothing changed.** Recorded because a reconciliation that finds nothing is worth as much
 * as one that finds something, and only says so if it is written down.
 */
export const SUBDIVISION_VERIFIED =
  'BPHS 51.1-2 gives the Vimshottari-family subdivision the engine already shipped: '
  + 'antar = mahaYears × antarYears / total, composing to any depth, with the FIRST antardasa '
  + 'belonging to the dasha lord. Six of the chapter’s own worked examples were checked '
  + 'against `subPeriodYears` and `dashaSequence` — Venus-in-Venus (3y 4m), its pratyantar '
  + '(6m 20d), Mercury-in-Saturn (2y 8m 9d), two Kalachakra cells and the Aquarius Chara '
  + 'antardasa — and ALL SIX agree exactly, the Kalachakra one to the ghatika. NOTHING '
  + 'CHANGED. Same outcome as Part 34’s reconciliation of the Vimshottari construction.';

/**
 * The chapter's mental-arithmetic shortcut for a Vimshottari antardasa (51.1 Notes):
 *
 *   *multiply the two dasha years; cut off the last digit and read the rest as months;
 *   multiply the cut digit by 3 and read it as days.*
 *
 * Its example: Mercury in Saturn's dasha, 17 × 19 = 323 → 32 months and 9 days.
 *
 * **This is exact, not an approximation**, and the reason is worth stating because it looks
 * like a rule of thumb. The antardasa in years is `P/120`, so in months it is `P/10` — which
 * is precisely "P with the last digit moved past the decimal point". The remaining tenth of a
 * month is `0.1 × 30 = 3` days per unit, so the cut digit times 3 is the day count exactly.
 *
 * It holds only for a **30-day month and a 120-year total**, which is what the system uses.
 */
export function antardasaShortcut(mahaYears: number, antarYears: number): { months: number; days: number } {
  const product = mahaYears * antarYears;
  return { months: Math.floor(product / 10), days: (product % 10) * 3 };
}

export const SHORTCUT_IS_EXACT =
  'BPHS 51.1 (notes) gives a mental shortcut: multiply the two dasha years, cut the last '
  + 'digit and read the rest as MONTHS, then multiply the cut digit by 3 for the DAYS. '
  + '17 × 19 = 323 → 32 months 9 days. It looks like a rule of thumb and is EXACT: the '
  + 'antardasa is P/120 years = P/10 months, so cutting the last digit is dividing by ten, '
  + 'and the remaining tenth of a month is 0.1 × 30 = 3 days per unit. Holds only for a '
  + '30-day month and a 120-year total — which is what the system uses.';

/**
 * ⚠️ The chapter's printed antardasa table disagrees with its own prose in eleven cells, and
 * the table is what is wrong.
 *
 * Of the 53 cells that survived transcription, 42 match the formula exactly and 11 do not.
 * The arithmetic checksum settles it: **every table whose cells all match sums to its own
 * dasha length** (Rahu 18.000 of 18, Jupiter 16.000 of 16), and **every table containing a
 * mismatch fails its own total** (Sun 6.994 of 6, Moon 15.167 of 10, Saturn 19.25 of 19).
 * A cell that breaks the total its own column states is a fault in the cell.
 *
 * The faults also fall into two clean classes rather than scattering, which is what a
 * transcription error looks like and what a different convention does not:
 *   - **Seven cells print the TOTAL MONTHS in the months column** while keeping the years
 *     digit — Moon × Rahu reads `1.18.00` where 1.5 years is 1y 6m, and 18 is the month total.
 *   - **Four cells are off by a single unit** — Sun × Mars and Sun × Ketu read 4m 5d for
 *     4m 6d; Moon × Mars and Moon × Ketu carry a spurious 30 days; Saturn × Saturn reads
 *     `3.03.03` for `3.00.03`.
 *
 * Nothing was changed on the strength of this table. It is recorded so that a later reader
 * comparing our output against the printed page finds the discrepancy already explained.
 */
export const ANTARDASA_TABLE_FAULTS =
  'Chapter 51’s printed antardasa table disagrees with the chapter’s own prose in 11 of the '
  + '53 transcribed cells, and the TABLE is what is wrong. The checksum decides it: every '
  + 'table whose cells all match sums to its own dasha length (Rahu 18.000/18, Jupiter '
  + '16.000/16), and every table containing a mismatch fails its own stated total (Sun '
  + '6.994/6, Moon 15.167/10, Saturn 19.25/19). The faults fall in two clean classes — seven '
  + 'cells print TOTAL MONTHS in the months column (Moon × Rahu as 1.18.00 for 1y 6m), and '
  + 'four are off by one unit (Sun × Mars 4m 5d for 4m 6d; Saturn × Saturn 3.03.03 for '
  + '3.00.03). Scattered errors would suggest a different convention; two classes suggest '
  + 'transcription. NOTHING was changed on the table’s authority.';

// ─────────────────────────────────────────────────────────────────────────────
// 51.3-4 — the Chara/Kendradi dasha OF PLANETS: an equal ninth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 51.3-4: in a Chara/Kendradi dasha **of planets**, the antardasa are the dasha years
 * **divided by nine** — equal, not proportional. The first belongs to the dasha lord; the
 * rest are the planets in kendras, then panapharas, then apoklimas, **each group ordered by
 * strength**.
 *
 * This is a different shape from Vimshottari: there the sub-period length depends on *which*
 * planet holds it, here every one is the same and only the ORDER carries information. A
 * subdivision function written for one cannot produce the other, which is why `subPeriodYears`
 * could not be reused.
 *
 * ⚠️ The ordering is only **partially** encodable. Kendra/panaphara/apoklima is structural and
 * given here; "according to their strength" needs a strength measure the verse does not name,
 * and the corpus offers several (Shadbala, Ishta, dignity). `charaPlanetAntardasaOrder` takes
 * the ranking as an argument rather than choosing one for the reader.
 */
export function charaPlanetAntardasaYears(dashaYears: number): number {
  return dashaYears / 9;
}

/** The three house groups 51.3-4 orders by, from a given house. */
export function houseGroup(house: number): 'kendra' | 'panaphara' | 'apoklima' {
  const h = ((house - 1) % 12 + 12) % 12 + 1;
  if ([1, 4, 7, 10].includes(h)) return 'kendra';
  if ([2, 5, 8, 11].includes(h)) return 'panaphara';
  return 'apoklima';
}

export const CHARA_PLANET_ANTARDASA_IS_EQUAL =
  'BPHS 51.3-4: in a Chara/Kendradi dasha OF PLANETS the antardasa are the dasha years '
  + 'divided by NINE — equal shares, not proportional ones. Only the ORDER carries '
  + 'information: the dasha lord first, then planets in kendras, panapharas and apoklimas, '
  + 'each group by strength. `subPeriodYears` (a proportion) cannot express this, which is '
  + 'why it is a new function rather than a reuse. The strength ranking within a group is '
  + 'taken as an argument — the verse says "according to their strength" without naming a '
  + 'measure, and the corpus offers several.';

// ─────────────────────────────────────────────────────────────────────────────
// 51.5-12 — the rasi antardasa: an equal twelfth, and an order with real structure
// ─────────────────────────────────────────────────────────────────────────────

/** BPHS 51.5: a rasi dasha's antardasa is one **twelfth** of it. Equal, like 51.3-4. */
export function rasiAntardasaYears(dashaYears: number): number {
  return dashaYears / 12;
}

/**
 * BPHS 51.6-12 — the order of the twelve rasi antardasas.
 *
 * Two things decide it, and both matter:
 *
 * **Parity sets the DIRECTION.** Odd dasha rasi → onwards; even → reverse. 51.6 says this
 * plainly and 51.8-9 repeat it for all three modalities, so it is not modality-specific.
 *
 * **Modality sets the PATTERN**, per 51.7-12:
 *   - **movable** — all twelve in sequence, one step at a time
 *   - **fixed** — every sixth rasi (a five-sign step), which also visits all twelve
 *   - **dual** — three groups of four kendras: those angular to the rasi itself, then to the
 *     5th from it, then to the 9th
 *
 * The 5th and 9th for the dual case are counted **in the direction of travel** — that is the
 * one part a reader is likely to get wrong, and the chapter's own Pisces example is what
 * settles it (see `DUAL_ORDER_COUNTS_IN_THE_DIRECTION_OF_TRAVEL`).
 *
 * Both worked examples reproduce exactly:
 *   - Aquarius (fixed, odd) → Aquarius, Cancer, Sagittarius, Taurus, Libra, Pisces …
 *   - Pisces (dual, even) → Pisces, Sagittarius, Virgo, Gemini · Scorpio, Leo, Taurus,
 *     Aquarius · Cancer, Aries, Capricorn, Libra
 *
 * @param dashaRasi 0 = Aries.
 */
export function rasiAntardasaOrder(dashaRasi: SignIndex): SignIndex[] {
  const seed = mod12(dashaRasi);
  // 51.6 / 51.8-9: parity of the SIGN (Aries is the 1st, hence odd) sets the direction.
  const forward = seed % 2 === 0;
  const step = (n: number) => (forward ? n : -n);
  const modality: Modality = signModality(seed);

  if (modality === 'movable') {
    return Array.from({ length: 12 }, (_, i) => mod12(seed + step(i)) as SignIndex);
  }
  if (modality === 'fixed') {
    // "every sixth rashi" counted inclusively — a five-sign step, which is coprime with 12
    // and so still visits all twelve.
    return Array.from({ length: 12 }, (_, i) => mod12(seed + step(5 * i)) as SignIndex);
  }
  // Dual: three groups of four kendras, seeded at the rasi, its 5th and its 9th — with the
  // 5th and 9th counted in the direction of travel, not always forwards.
  const out: SignIndex[] = [];
  for (const seedOffset of [0, 4, 8]) {
    const groupSeed = mod12(seed + step(seedOffset));
    for (let k = 0; k < 4; k++) out.push(mod12(groupSeed + step(3 * k)) as SignIndex);
  }
  return out;
}

export const DUAL_ORDER_COUNTS_IN_THE_DIRECTION_OF_TRAVEL =
  'BPHS 51.7-12’s dual-rasi order seeds three kendra groups at the rasi, its 5th and its 9th '
  + '— and those are counted IN THE DIRECTION OF TRAVEL, not always forwards. The chapter’s '
  + 'Pisces example settles it: Pisces is even, so the order is reverse, and it names SCORPIO '
  + 'as "the 5th from it". Counting forwards from Pisces gives Cancer; counting backwards '
  + 'gives Scorpio, which is what the text says — and it then names Cancer as the 9th, which '
  + 'is also the backward count. Getting this wrong produces a plausible-looking permutation '
  + 'that is wrong for every even dual rasi, i.e. for a quarter of all rasi dashas.';

export const RASI_ANTARDASA_ORDER_RULE =
  'BPHS 51.6-12: PARITY sets the direction (odd rasi onwards, even reverse) and MODALITY sets '
  + 'the pattern — movable takes all twelve one step at a time, fixed takes every sixth (a '
  + 'five-sign step, coprime with 12, so still all twelve), dual takes three groups of four '
  + 'kendras seeded at the rasi, its 5th and its 9th. Verified against both of the chapter’s '
  + 'worked examples: Aquarius (fixed, odd) and Pisces (dual, even), each reproducing all '
  + 'twelve entries in order.';

/**
 * BPHS 51.6 also offers a **choice of starting point** we do not resolve here: the antardasa
 * begins at the dasha rasi **or the 7th from it, whichever is stronger**.
 *
 * `rasiAntardasaOrder` takes the seed it is given. Which of the two to pass is a strength
 * judgement, and the verse does not say which measure decides — the same gap as 51.3-4's
 * "according to their strength". Passing the wrong one produces a valid sequence rotated by
 * six, so this is a real fork, not a detail.
 */
export const SEED_IS_THE_STRONGER_OF_TWO =
  'BPHS 51.6: the rasi antardasa starts from the dasha rasi OR THE 7TH FROM IT, whichever is '
  + 'stronger. `rasiAntardasaOrder` takes the seed as an argument because the verse names no '
  + 'strength measure — the same gap as 51.3-4. Not a detail: choosing the other seed yields '
  + 'the same sequence rotated by six, so a caller that guesses is wrong about every entry.';

/**
 * BPHS 51.9-11 — Paka and Bhoga rasi.
 *
 * The **Paka** is the rasi whose antardasa is running. The **Bhoga** is a second rasi read
 * alongside it: for the first dasha of a cycle the two are the same, and thereafter the Bhoga
 * sits at the same ordinal distance from the Paka as the Paka does from the cycle's first
 * dasha rasi.
 *
 * Verified on the chapter's own example: Aquarius is the first dashaprada rasi, so there Paka
 * = Bhoga = Aquarius. Pisces is the 2nd from Aquarius, so in Pisces's dasha the Bhoga is the
 * 2nd from Pisces — Aries. Both statements are the chapter's.
 *
 * ⚠️ The verse prefixes this with "if the Dasha prad rashi be even", and the worked example
 * applies it to Aquarius, which is odd. The translation is muddled at exactly that clause.
 * What is encoded is the rule the two worked examples demonstrate; the parity condition is
 * recorded as unresolved rather than guessed at.
 *
 * @param first the first dasha rasi of the cycle
 * @param paka  the rasi whose dasha is running
 */
export function bhogaRasi(first: SignIndex, paka: SignIndex): SignIndex {
  const distance = mod12(paka - first);
  return mod12(paka + distance) as SignIndex;
}

export const PAKA_BHOGA_PARITY_CLAUSE_UNRESOLVED =
  'BPHS 51.9-11 introduces the Bhoga rasi with "if the Dasha prad rashi be even", then works '
  + 'the example on Aquarius, which is odd. The translation is muddled at that clause. What '
  + 'is encoded is what BOTH worked examples show — first rasi of a cycle: Paka = Bhoga; '
  + 'thereafter Bhoga sits at the same ordinal distance from the Paka as the Paka does from '
  + 'the first (Pisces is 2nd from Aquarius, so its Bhoga is the 2nd from Pisces = Aries). '
  + 'The parity condition is recorded as unresolved, not guessed at.';

/**
 * 51.12's reading of the Paka and Bhoga.
 *
 * The verse gives both directions: benefics associated with them bring enjoyment, malefics
 * bring *"pain in the body and mental agony"*. The **somatic half is a medical claim and is
 * not carried**; the adverse reading is kept as a structural headwind, which is what the
 * clause is actually doing — it is about association, not diagnosis.
 */
export function pakaBhogaVerdict(association: 'benefic' | 'malefic' | 'mixed'): { valence: number; summary: string } {
  if (association === 'benefic') {
    return { valence: 0.6, summary: 'A stretch that gives back — what you engage with tends to hold.' };
  }
  if (association === 'malefic') {
    return { valence: -0.4, summary: 'A stretch that asks for patience; things need working at twice.' };
  }
  return { valence: 0, summary: 'Pulled both ways — the stretch rewards some efforts and resists others.' };
}

export const PAKA_BHOGA_SOMATIC_CLAIM_DROPPED =
  'BPHS 51.12 reads the Paka and Bhoga by their associations: benefics give enjoyment, '
  + 'malefics give "pain in the body and mental agony". The SOMATIC half is a medical claim '
  + 'and is not carried. The adverse reading is kept as a structural headwind, which is what '
  + 'the clause does anyway — it is about association, not diagnosis.';

// ─────────────────────────────────────────────────────────────────────────────
// Kalachakra — a hundredth, not a hundred-and-twentieth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The Kalachakra antardasa: the same proportional shape as Vimshottari, over a **total of
 * 100** rather than 120, and with **rasis** rather than planets as the parties.
 *
 * Verified to the ghatika on the chapter's own example: in Aries's dasha (7 years), the
 * antardasa of Aries is 7 × 7 / 100 = 0.49 years = 5 months, 26 days and 24 ghatikas — a
 * ghatika being a 60th of a day, and 0.4 of a day being exactly 24 of them. The Sagittarius
 * cell (7 × 10 / 100 = 0.7y = 8m 12d) agrees too.
 *
 * That the check lands on the ghatika is worth more than one that lands on the day: a rounding
 * convention could hide a small error at day precision and cannot at this one.
 */
export function kalachakraAntardasaYears(dashaYears: number, antarRasiYears: number): number {
  return (dashaYears * antarRasiYears) / 100;
}

export const KALACHAKRA_ANTARDASA_TOTAL_IS_100 =
  'The Kalachakra antardasa is dashaYears × antarRasiYears / 100 — the same proportional '
  + 'shape as Vimshottari but over a total of 100, not 120, and between RASIS rather than '
  + 'planets. Verified TO THE GHATIKA on the chapter’s example: Aries in Aries = 7×7/100 = '
  + '0.49y = 5m 26d 24gh (0.4 of a day being exactly 24 sixtieths). A check landing on the '
  + 'ghatika is worth more than one landing on the day — a rounding convention can hide a '
  + 'small error at day precision and cannot at this one.';

// ─────────────────────────────────────────────────────────────────────────────
// 51.13-16 — Pinda / Amsa / Nisarga: computed shape recorded, system still refused
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 51.13-16 gives the subdivision for the Pinda, Amsa and Nisarga dashas as a set of
 * **fractional shares**: the dasha lord takes a full part, a planet conjunct it a half, one
 * in a trine a third, one in the 4th or 8th a quarter, one in the 7th a seventh, and planets
 * anywhere else none. Where a house holds more than one planet, the strongest takes the
 * share. The shares are then put over a common denominator and the numerators divide the
 * period.
 *
 * **Part 37 refused Pinda / Amsa / Nisarga as a system**, along with Shoola, because their
 * stated purpose is timing death. That decision stands and this does not reopen it: the
 * fractions are recorded as the shape of a subdivision, and no route surfaces a reading built
 * on them.
 *
 * Recorded rather than dropped because the *arithmetic* is neutral and the refusal is about
 * what the system is for. If a later part finds these dashas used for something other than
 * longevity, the construction is here and does not need re-deriving.
 */
export const PACHAKA_SHARES: { position: string; share: string; note?: string }[] = [
  { position: 'the dasha lord itself', share: '1/1' },
  { position: 'a planet conjunct the dasha lord', share: '1/2' },
  { position: 'a planet in a trine from it', share: '1/3' },
  { position: 'a planet in the 4th or the 8th from it', share: '1/4' },
  { position: 'a planet in the 7th from it', share: '1/7' },
  {
    position: 'anywhere else', share: '0',
    note: 'The verse is explicit that no other position is a Pachaka at all — this is a '
      + 'closed list, not a default.',
  },
];

export const PINDA_SUBDIVISION_RECORDED_NOT_SURFACED =
  'BPHS 51.13-16 gives the Pinda/Amsa/Nisarga subdivision as fractional Pachaka shares — 1/1 '
  + 'to the dasha lord, 1/2 conjunct, 1/3 in a trine, 1/4 in the 4th or 8th, 1/7 in the 7th, '
  + 'and nothing anywhere else (a closed list, not a default); strongest planet takes a '
  + 'shared house; the fractions go over a common denominator and the numerators divide the '
  + 'period. PART 37 REFUSED these systems because their stated purpose is timing death, and '
  + 'that decision stands — nothing surfaces a reading built on them. The shares are recorded '
  + 'because the arithmetic is neutral and the refusal is about what the system is FOR; if a '
  + 'later part finds them used for something else, the construction is here.';

/**
 * ⚠️ The translator's own caveat, which belongs with these verses rather than buried:
 *
 *   *"The calculations given above are not the literal translation of the text in the verses
 *    concerned; but their actual meaning and sense. This has been got confirmed by checking
 *    up with similar information given in Kalyana Verma's Saravali and Varahmihir's Brihat
 *    Jataka."*
 *
 * So 51.13-16 as we have it is **reconstruction, corroborated from two other texts** — not
 * translation. That is a weaker warrant than the rest of the chapter carries, and it is
 * another reason the Pachaka shares are recorded rather than built on.
 */
export const CH51_TRANSLATOR_RECONSTRUCTED_13_16 =
  'The translator states plainly that 51.13-16 as printed is "not the literal translation of '
  + 'the text in the verses concerned; but their actual meaning and sense", corroborated '
  + 'against Saravali and Brihat Jataka. So that block is RECONSTRUCTION, not translation — a '
  + 'weaker warrant than the rest of the chapter, and a second reason the Pachaka shares are '
  + 'recorded rather than built on. The programme has treated commentator material this way '
  + 'throughout (27.20, the ch 26 drishti shortcut, ch 48’s amendment to ch 34).';

export const CH51_YIELD = {
  chapters: [51],
  note: 'A computation chapter doing two separable things. The RECONCILIATION: 51.1-2 is the '
    + 'Vimshottari subdivision the engine already ships, checked against six of the chapter’s '
    + 'own worked examples — all six agree, one of them to the ghatika, and NOTHING CHANGED. '
    + 'The NEW CAPABILITY: four further subdivision systems the engine had none of — the equal '
    + 'ninth (Chara dasha of planets), the equal twelfth with a modality-and-parity-dependent '
    + 'ORDER (rasi dashas), the hundredth (Kalachakra), and the Pachaka fractions (Pinda/Amsa/'
    + 'Nisarga, recorded but still refused as a system). The rasi ORDER is the substance: both '
    + 'of the chapter’s worked examples reproduce exactly, including the counted-in-the-'
    + 'direction-of-travel subtlety that would be wrong for a quarter of all rasi dashas. '
    + 'Also: the printed antardasa table is wrong in 11 of 53 cells and its own totals prove it.',
} as const;
