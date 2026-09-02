// BPHS Programme Part 35 — Chapter 46b: the conditional nakshatra dashas.
//
// Chapter 46 named nine systems beyond Vimshottari "for special cases" (Part 34's census).
// This is where it says what those cases ARE, and the applicability conditions are the whole
// point: Part 37's crown-jewel question — *which dasha system applies to this chart* — is
// answered from exactly these clauses, and every consumer product ignores them by hardcoding
// Vimshottari for everyone.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE NAME IS THE CHECKSUM
// ─────────────────────────────────────────────────────────────────────────────
//
// Each system is named for its own total: Ashtottari = 108, Shodasottari = 116,
// Dwadashottari = 112, Panchottari = 105, Shatabdika = 100, Chaturashiti = 84,
// Dwisaptati = 72, Shastihayani = 60, Shat-trimsat = 36. So the printed year counts can be
// checked against the name — a real arithmetic invariant, not a nicety.
//
// **It caught four transcription faults in this one chapter**, including one where the verse
// and the chapter's own table contradict each other. See `CH46B_CHECKSUM_CAUGHT_FOUR_FAULTS`.

import type { Graha } from '../../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// The nine systems
// ─────────────────────────────────────────────────────────────────────────────

/**
 * How a system's applicability is decided. These are the clauses Part 37 will arbitrate
 * between, so they are structured rather than left as prose.
 */
export type ApplicabilityKind =
  | 'graha-placement'    // "the Sun in the ascendant", "the 10th lord in the 10th"
  | 'lagna-varga'        // "the ascendant in Venus's navamsa", "Cancer dwadasamsa"
  | 'hora-and-paksha'    // "lagna in the Moon's hora with a Krishna Paksha birth"
  | 'hora-and-daynight'  // "day birth with the lagna in the Sun's hora"
  | 'vargottama'
  | 'node-relation';     // Ashtottari's Rahu clause

export interface DashaApplicability {
  kind: ApplicabilityKind;
  verse: string;
  /** The condition in our words, precise enough to implement. */
  condition: string;
}

export interface NakshatraDashaSystem {
  name: string;
  /** Total years. The system's own name asserts this — see the checksum invariant. */
  total: number;
  verse: string;
  order: Graha[];
  /** Years per lord, index-aligned with `order`. */
  years: number[];
  /** Whether Abhijit participates (BPHS Note 1: only two systems use it). */
  usesAbhijit: boolean;
  /** True where the printed counts needed no correction to reach the name's total. */
  asPrinted: boolean;
  applicability: DashaApplicability[];
  note?: string;
}

export const NAKSHATRA_DASHA_SYSTEMS: NakshatraDashaSystem[] = [
  {
    name: 'Ashtottari', total: 108, verse: '17-23', asPrinted: true,
    order: ['sun', 'moon', 'mars', 'mercury', 'saturn', 'jupiter', 'rahu', 'venus'],
    years: [6, 15, 8, 17, 10, 19, 12, 21],
    usesAbhijit: true,
    applicability: [
      {
        kind: 'node-relation', verse: '17-20',
        condition: 'Rahu is NOT in the ascendant, but stands in a kendra (1/4/7/10) or '
          + 'trikona (1/5/9) from the ASCENDANT LORD.',
      },
      {
        kind: 'hora-and-paksha', verse: '23',
        condition: 'A day birth in Krishna Paksha, or a night birth in Shukla Paksha.',
      },
    ],
    note: 'Ketu is denied a dasha here. The nakshatra blocks run 4/3/4/3/4/3/4/3 = 28, '
      + 'because Abhijit counts.',
  },
  {
    name: 'Shodasottari', total: 116, verse: '24-26', asPrinted: false,
    order: ['sun', 'mars', 'jupiter', 'saturn', 'ketu', 'moon', 'mercury', 'venus'],
    years: [11, 12, 13, 14, 15, 16, 17, 18],
    usesAbhijit: false,
    applicability: [
      {
        kind: 'hora-and-paksha', verse: '24-26',
        condition: 'The ascendant in the MOON’s hora with a Krishna Paksha birth, or in the '
          + 'SUN’s hora with a Shukla Paksha birth.',
      },
    ],
    note: 'The table prints 18 for Mercury, totalling 117; 17 gives the 116 the name asserts. '
      + 'Note the inversion against Ashtottari — the same ingredients paired the other way, '
      + 'which is what makes the two conditions distinguishable at all.',
  },
  {
    name: 'Dwadashottari', total: 112, verse: '27-28', asPrinted: true,
    order: ['sun', 'jupiter', 'ketu', 'mercury', 'rahu', 'mars', 'saturn', 'moon'],
    years: [7, 9, 11, 13, 15, 17, 19, 21],
    usesAbhijit: false,
    applicability: [
      {
        kind: 'lagna-varga', verse: '27-28',
        condition: 'The ascendant falls in a NAVAMSA of Venus.',
      },
    ],
    note: 'Venus does not rule in it — the one system whose qualifying planet is excluded '
      + 'from its own lordships. Assignment: count from the janma nakshatra to Revati, '
      + 'divide by 8, take the remainder.',
  },
  {
    name: 'Panchottari', total: 105, verse: '29-31', asPrinted: false,
    order: ['sun', 'mercury', 'saturn', 'mars', 'venus', 'moon', 'jupiter'],
    years: [12, 13, 14, 15, 16, 17, 18],
    usesAbhijit: false,
    applicability: [
      {
        kind: 'lagna-varga', verse: '29-31',
        condition: 'The ascendant is CANCER, and also falls in the Cancer dwadasamsa (D-12).',
      },
    ],
    note: 'SEVEN lords, not eight. The tightest condition of the nine — sign AND divisional '
      + 'sign must agree, so it applies to at most a twelfth of Cancer ascendants. The '
      + 'printed years are garbled (12,13,14,15,17,18,30 → 119); the run 12…18 gives 105.',
  },
  {
    name: 'Shatabdika', total: 100, verse: '32-34', asPrinted: true,
    order: ['sun', 'moon', 'venus', 'mercury', 'jupiter', 'mars', 'saturn'],
    years: [5, 5, 10, 10, 20, 20, 30],
    usesAbhijit: false,
    applicability: [
      {
        kind: 'vargottama', verse: '32-34',
        condition: 'The ascendant is VARGOTTAMA — the rasi ascendant and the navamsa '
          + 'ascendant fall in the same sign.',
      },
    ],
    note: 'Seven lords, and the only system with a doubling ladder (5,5,10,10,20,20) closed '
      + 'by a 30. Sums to exactly 100 as printed — no correction needed.',
  },
  {
    name: 'Chaturashiti sama', total: 84, verse: '35-36', asPrinted: true,
    order: ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'],
    years: [12, 12, 12, 12, 12, 12, 12],
    usesAbhijit: false,
    applicability: [
      {
        kind: 'graha-placement', verse: '35-36',
        condition: 'The lord of the 10th house is posited IN the 10th house.',
      },
    ],
    note: 'A "sama" system — equal periods. Seven lords of 12 gives the 84 the name asserts.',
  },
  {
    name: 'Dwisaptati sama', total: 72, verse: '37-39', asPrinted: true,
    order: ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'],
    years: [9, 9, 9, 9, 9, 9, 9, 9],
    usesAbhijit: false,
    applicability: [
      {
        kind: 'graha-placement', verse: '37-39',
        condition: 'The ASCENDANT LORD is in the ascendant, or in the 7th house.',
      },
    ],
    note: 'Equal periods again: eight lords of 9 is 72.',
  },
  {
    name: 'Shastihayani', total: 60, verse: '40-41', asPrinted: false,
    order: ['jupiter', 'sun', 'mars', 'moon', 'mercury', 'venus', 'saturn', 'rahu'],
    years: [10, 10, 10, 6, 6, 6, 6, 6],
    usesAbhijit: true,
    applicability: [
      {
        kind: 'graha-placement', verse: '40-41',
        condition: 'The SUN is posited in the ascendant.',
      },
    ],
    note: 'The verse gives the first three lords 13 years (totalling 69); the chapter’s own '
      + 'table says 10, which reaches the 60 the name asserts. The table wins. Its table also '
      + 'omits Rahu’s column, whose 6 years are needed for the total — a printing loss, not a '
      + 'doctrinal exclusion.',
  },
  {
    name: 'Shat-trimsat sama', total: 36, verse: '42-43', asPrinted: false,
    order: ['moon', 'sun', 'jupiter', 'mars', 'mercury', 'saturn', 'venus', 'rahu'],
    years: [1, 2, 3, 4, 5, 6, 7, 8],
    usesAbhijit: false,
    applicability: [
      {
        kind: 'hora-and-daynight', verse: '42-43',
        condition: 'A DAY birth with the ascendant in the SUN’s hora, or a NIGHT birth with '
          + 'the ascendant in the MOON’s hora.',
      },
    ],
    note: 'The cleanest arithmetic in the chapter: 1+2+…+8 = 36, exactly the name. The table '
      + 'prints 3 for the eighth lord, which would give 31. Assignment: count from Sravana to '
      + 'the janma nakshatra, divide by 8, take the remainder.',
  },
];

/** Systems whose year counts do not sum to the total their name asserts. Must be empty. */
export function systemTotalsMatchTheirNames(): { name: string; stated: number; summed: number }[] {
  return NAKSHATRA_DASHA_SYSTEMS
    .map((s) => ({ name: s.name, stated: s.total, summed: s.years.reduce((a, b) => a + b, 0) }))
    .filter((x) => x.stated !== x.summed);
}

export const SYSTEM_NAME_IS_A_CHECKSUM =
  'Each of these systems is named for its own year total — Ashtottari 108, Shodasottari 116, '
  + 'Dwadashottari 112, Panchottari 105, Shatabdika 100, Chaturashiti 84, Dwisaptati 72, '
  + 'Shastihayani 60, Shat-trimsat 36. So the printed counts are checkable against the name. '
  + 'That is a real arithmetic invariant, and it caught four faults on first use.';

/**
 * ⚠️ **The checksum caught FOUR transcription faults in one chapter.**
 *
 * | System | as printed | totals | corrected to | name asserts |
 * |---|---|---|---|---|
 * | Shodasottari | …16, **18**, 18 | 117 | …16, **17**, 18 | 116 |
 * | Panchottari | 12,13,14,15,**17,18,30** | 119 | 12…18 | 105 |
 * | Shastihayani | **13**,13,13 *(verse)* | 69 | **10**,10,10 *(its own table)* | 60 |
 * | Shat-trimsat | 1…7, **3** | 31 | 1…7, **8** | 36 |
 *
 * In every case the correction is the one the name forces **and** the only one that fits the
 * surrounding run — 17 between 16 and 18, an unbroken 12…18, a 10 among 10s, an 8 after 7.
 * No number here was chosen to make a total come out; each is the single value consistent
 * with both constraints.
 *
 * These are the **fifth through eighth** transcription faults found in this edition, and the
 * first found by ARITHMETIC rather than by reading. Shastihayani is the sharpest: the verse
 * and the chapter's own table contradict each other, and the table is right.
 */
export const CH46B_CHECKSUM_CAUGHT_FOUR_FAULTS =
  'The system name asserts the year total, so the printed counts are checkable. FOUR of the '
  + 'nine failed as printed: Shodasottari 117 (Mercury’s 18 should be 17), Panchottari 119 '
  + '(garbled; the run 12…18 gives 105), Shastihayani 69 by the verse but 60 by its own table '
  + '(13 vs 10), Shat-trimsat 31 (the eighth lord’s 3 should be 8). Each correction is the one '
  + 'the name forces AND the only one fitting the surrounding run, so no number was chosen '
  + 'merely to make a total come out. Faults five through eight in this edition, and the first '
  + 'found by arithmetic rather than by reading.';

// ─────────────────────────────────────────────────────────────────────────────
// Abhijit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS Note 1 to 46.23: **"Abhijit Nakshatra is taken into consideration only in the
 * Astottari and Shastihayani Dasha."**
 *
 * That is a checkable claim rather than an aside, and it checks out: Abhijit appears in
 * exactly those two chapters' nakshatra tables and in no other. It is why Ashtottari's blocks
 * run 4/3/4/3/4/3/4/3 = **28** rather than 27.
 *
 * Abhijit is not a 28th *equal* division — 28 × 13°20′ would be 373°20′, not a zodiac. It is
 * a short nakshatra carved out around the U.Ashadha/Sravana boundary, so the DEGREE spans are
 * unchanged and only the count of named nakshatras in that block rises to four.
 */
export const ABHIJIT_ONLY_IN_TWO_SYSTEMS =
  'BPHS Note 1 to 46.23: Abhijit counts only in Ashtottari and Shastihayani. Verified — it '
  + 'appears in exactly those two nakshatra tables and no others. It is why Ashtottari’s '
  + 'blocks run 4/3/4/3/4/3/4/3 = 28. Abhijit is NOT a 28th equal division (28 × 13°20′ is '
  + '373°20′, not a zodiac); it is a short nakshatra carved around the U.Ashadha/Sravana '
  + 'boundary, so degree spans are unchanged and only the NAMED count rises.';

// ─────────────────────────────────────────────────────────────────────────────
// The Ashtottari reconciliation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **The lord assignment agrees exactly. The balance model does not.**
 *
 * The shipped `ashtottariBalanceAtBirth` came from the OTHER corpus (its ch 17) and models
 * each lord as a continuous ARC of the zodiac — 40° or 53°20′ — with the balance linear in
 * degrees across that arc. Checked against BPHS's own nakshatra table, **the lord it returns
 * is identical for all 27 nakshatras**, which is the part that matters most.
 *
 * But BPHS subdivides differently, and its worked example is explicit: Saturn's 120 months
 * are split into **four equal blocks of 30 months** — P.Ashadha, U.Ashadha, **Abhijit**,
 * Sravana — with the balance taken inside the block and the remaining whole blocks added
 * ("To this be added the periods of Abhijit and Sravan viz. 30+30 = 60 months").
 *
 * Because Abhijit's degree span is short and unequal, per-nakshatra-equal and
 * per-degree-linear are **not the same function** inside Saturn's 40°. For a Moon at 270° the
 * two differ by roughly ten months.
 *
 * **Nothing was changed.** Two books give two models; the shipped one is verified against its
 * own book's worked example and this one against BPHS's. Same shape as the Upapada convention
 * conflict — the engine should eventually expose both and let the caller choose, which is a
 * product decision rather than a bug fix.
 */
export const ASHTOTTARI_BALANCE_MODELS_DIVERGE =
  'The shipped `ashtottariBalanceAtBirth` (other corpus, ch 17) models each lord as a '
  + 'continuous ARC with the balance linear in degrees. BPHS subdivides each lord’s dasha into '
  + 'EQUAL BLOCKS PER NAKSHATRA — its worked example splits Saturn’s 120 months into four of '
  + '30, one of them Abhijit. **The LORD is identical for all 27 nakshatras**, verified. The '
  + 'BALANCE differs inside Saturn’s 253°20′–293°20′ span, by roughly ten months at 270°, '
  + 'because Abhijit’s degree span is short and unequal. **Nothing was changed** — two books, '
  + 'two models, each verified against its own worked example. Which to serve is a product '
  + 'decision, like the Upapada convention conflict.';

export const CH46B_YIELD = {
  chapter: 46,
  part: '46b',
  systems: 9,
  newRules: 0,
  faultsFound: 4,
  note: 'The applicability conditions are the deliverable, not the year counts — they are what '
    + 'Part 37 arbitrates between, and they are unusually crisp: the Sun in the ascendant, the '
    + '10th lord in the 10th, the ascendant lord in the 1st or 7th, a vargottama ascendant, a '
    + 'Cancer ascendant in the Cancer dwadasamsa, and four hora/paksha or hora/day-night '
    + 'pairings built from the same ingredients combined differently. The system name as a '
    + 'checksum caught four transcription faults on its first use.',
} as const;
