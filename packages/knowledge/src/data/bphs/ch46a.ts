// BPHS Programme Part 34 — Chapter 46a: Vimshottari, the authoritative construction.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE RESULT: NO DATE MOVES
// ─────────────────────────────────────────────────────────────────────────────
//
// This was flagged in advance as the highest-stakes reconciliation in the programme. The
// engine has had a date-accurate Vimshottari since long before the BPHS work started, the
// app has been showing dates from it, and a discrepancy here would have moved **every date
// the app has ever displayed**.
//
// It was checked and it agrees, at six independent points:
//
//   • the lord ORDER, verified by rotating ours to start at Krittika (46.12-14)
//   • the nine year-counts and their 120 total (46.15)
//   • the nakshatra→lord assignment, by the chapter's own remainder rule
//   • the chapter's worked example — Moon at Sagittarius 13° → Moola 4th pada, Ketu
//   • all four columns of the balance table's first row
//   • a second table row (0°20') in two different columns
//
// **Nothing was changed.** That is the outcome worth recording precisely because it was not
// the assumed one — four earlier parts found the shipped code wrong, and the discipline of
// checking before correcting is what makes a clean result here mean anything.

import type { Graha } from '../../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// 46.12-15 — the construction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 46.12-14 states the cycle **from Krittika**, not from Ashwini:
 * Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury, Ketu, Venus.
 *
 * Our `VIMSHOTTARI_ORDER` starts from Ashwini (Ketu first) because nakshatra indices start
 * there. The two are the same cycle at a different offset, and the test rotates ours to
 * Krittika to prove it rather than asserting it.
 */
export const CH46_ORDER_FROM_KRITTIKA: Graha[] = [
  'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury', 'ketu', 'venus',
];

/** BPHS 46.15's own year counts, in the chapter's stated order. */
export const CH46_YEARS_FROM_KRITTIKA: { graha: Graha; years: number }[] = [
  { graha: 'sun', years: 6 },
  { graha: 'moon', years: 10 },
  { graha: 'mars', years: 7 },
  { graha: 'rahu', years: 18 },
  { graha: 'jupiter', years: 16 },
  { graha: 'saturn', years: 19 },
  { graha: 'mercury', years: 17 },
  { graha: 'ketu', years: 7 },
  { graha: 'venus', years: 20 },
];

/**
 * BPHS 46.12-14's assignment rule, stated as a **remainder**:
 *
 *   "if the Nakshatras from Krittika to the Janma Nakshatra are divided by nine, the
 *    remainder will signify the lord of the commencing Dasha."
 *
 * Counting from Krittika **inclusive**. Krittika itself gives 1 → the first lord, the Sun.
 * This is the same function as `nakshatraLord(nak) = ORDER[nak % 9]` with the Ashwini-based
 * index, and the test asserts they agree for all 27 nakshatras rather than trusting the
 * arithmetic.
 */
export function lordByKrittikaRemainder(nakshatra: number): Graha {
  const fromKrittika = (((nakshatra - 2) % 27) + 27) % 27;   // Krittika is index 2
  return CH46_ORDER_FROM_KRITTIKA[fromKrittika % 9]!;
}

export const CH46_120_YEARS =
  'BPHS 46.14: "In Kaliyuga the natural life span of a human being is generally taken as 120 '
  + 'years. Therefore, Vimshottari is considered the most appropriate and the best of all '
  + 'Dasha." The 120-year total is not arbitrary — it is the chapter’s stated reason for '
  + 'preferring this system, and the nine year-counts are chosen to sum to it.';

// ─────────────────────────────────────────────────────────────────────────────
// What the chapter does NOT say
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **BPHS does not state the balance formula.** It gives a lookup table, and says outright
 * that the table is "taken from Lahiri's Ephemeris" — not from Parashara.
 *
 * So the proportional rule everyone uses (the fraction of the nakshatra still to be
 * traversed, times the lord's years) is **not derived in this text**. What can be shown is
 * that the rule reproduces the table, which the tests do at six points. That is a strong
 * result but it is a different claim from "the text states this", and the distinction is
 * exactly the sort that gets lost.
 */
export const CH46_BALANCE_IS_A_TABLE_NOT_A_FORMULA =
  'BPHS 46 gives the dasha balance as a LOOKUP TABLE and attributes it to Lahiri’s '
  + 'Ephemeris, not to Parashara. The proportional formula — fraction of the nakshatra '
  + 'remaining × the lord’s years — is therefore NOT stated by this text. Our '
  + '`dashaBalanceAtBirth` implements it and reproduces the table exactly at every point '
  + 'checked, which is strong evidence the table encodes that formula; it is not the same '
  + 'claim as the text deriving it, and the difference is recorded rather than blurred.';

/**
 * The chapter says nothing about how long a **dasha-year** is in days.
 *
 * The engine uses 365.25 (`DashaOptions.yearLengthDays`), which is the solar year and the
 * common modern choice. The savana (360-day) year is the main alternative and would shift
 * every boundary by roughly 1.4%, which over a 19-year Saturn mahadasha is about three
 * months. Since the text is silent, **this stays OUR decision** and is recorded as one.
 */
export const CH46_YEAR_LENGTH_IS_OURS =
  'BPHS 46 never says how many DAYS a dasha-year is. The engine uses 365.25, the solar year '
  + 'and the common modern choice; the 360-day savana year is the main alternative and would '
  + 'move every boundary by about 1.4% — roughly three months across a 19-year Saturn '
  + 'mahadasha. The text being silent, the choice is OURS and is recorded as such rather '
  + 'than attributed to Parashara. It is configurable (`DashaOptions.yearLengthDays`).';

export const CH46_ANTARDASHA_IS_DEFERRED =
  'Chapter 46 does not give the antardasha construction — its notes say the sub-period '
  + 'material "will be dealt with in detail in later Chapters", which is chapters 47 onward '
  + '(Programme Parts 38-43). The sub-period rule the codebase uses (parent years × child '
  + 'share of 120, composing to any depth) is therefore not verified against this chapter '
  + 'and is marked accordingly.';

// ─────────────────────────────────────────────────────────────────────────────
// 46.2-11 — the systems BPHS names, and what it thinks of them
// ─────────────────────────────────────────────────────────────────────────────

export type DashaVerdict = 'preferred' | 'special-case' | 'supreme-per-others' | 'rejected';

export interface DashaSystem { name: string; kind: 'nakshatra' | 'rasi' | 'other'; verdict: DashaVerdict }

/**
 * Every dasha system chapter 46 names, with the chapter's own verdict on it.
 *
 * This matters more than it looks. **Part 37's "which dasha system applies to THIS chart" is
 * the programme's stated crown jewel** — every consumer product hardcodes Vimshottari for
 * everyone — and this is the chapter that frames the question. It also narrows it: BPHS
 * explicitly rejects nineteen of the systems it lists.
 */
export const CH46_DASHA_SYSTEMS: DashaSystem[] = [
  { name: 'Vimshottari', kind: 'nakshatra', verdict: 'preferred' },
  // 46.2-5 — "for other Dasha followed in special cases"
  { name: 'Ashtottari', kind: 'nakshatra', verdict: 'special-case' },
  { name: 'Shodasottari', kind: 'nakshatra', verdict: 'special-case' },
  { name: 'Dwadashottari', kind: 'nakshatra', verdict: 'special-case' },
  { name: 'Panchottari', kind: 'nakshatra', verdict: 'special-case' },
  // The book spells this both ways — 'Satabdika' at 46.2-5 and 'Shatabdika' at its own
  // section header. Normalised so the census and ch46b's table can be joined on the name.
  { name: 'Shatabdika', kind: 'nakshatra', verdict: 'special-case' },
  { name: 'Chaturashiti sama', kind: 'nakshatra', verdict: 'special-case' },
  { name: 'Dwisaptati sama', kind: 'nakshatra', verdict: 'special-case' },
  { name: 'Shastihayani', kind: 'nakshatra', verdict: 'special-case' },
  { name: 'Shat-trimsat sama', kind: 'nakshatra', verdict: 'special-case' },
  // 46.6 — "some sages ... have recognised the Kalachakra Dasha as supreme"
  { name: 'Kalachakra', kind: 'other', verdict: 'supreme-per-others' },
  { name: 'Kala', kind: 'other', verdict: 'rejected' },
  { name: 'Chakra', kind: 'other', verdict: 'rejected' },
  // 46.6-11 — "in our view all these Dasha are not appropriate"
  { name: 'Chara', kind: 'rasi', verdict: 'rejected' },
  { name: 'Sthira', kind: 'rasi', verdict: 'rejected' },
  { name: 'Kendra', kind: 'rasi', verdict: 'rejected' },
  { name: 'Karaka', kind: 'rasi', verdict: 'rejected' },
  { name: 'Brahmagraha', kind: 'other', verdict: 'rejected' },
  { name: 'Mandook', kind: 'other', verdict: 'rejected' },
  { name: 'Shool', kind: 'other', verdict: 'rejected' },
  { name: 'Yogardha', kind: 'other', verdict: 'rejected' },
  { name: 'Drig', kind: 'rasi', verdict: 'rejected' },
  { name: 'Trikona', kind: 'rasi', verdict: 'rejected' },
  { name: 'Rashi', kind: 'rasi', verdict: 'rejected' },
  { name: 'Panchswara', kind: 'other', verdict: 'rejected' },
  { name: 'Yogini', kind: 'other', verdict: 'rejected' },
  { name: 'Pinda', kind: 'other', verdict: 'rejected' },
  { name: 'Naisargika', kind: 'other', verdict: 'rejected' },
  { name: 'Ashtavarga', kind: 'other', verdict: 'rejected' },
  { name: 'Sandhya', kind: 'other', verdict: 'rejected' },
  { name: 'Pachaka', kind: 'other', verdict: 'rejected' },
  { name: 'Tara', kind: 'other', verdict: 'rejected' },
];

/**
 * ⚠️ **The rejection is more ambiguous than it reads, and the codebase already ships four of
 * the rejected systems.**
 *
 * 46.6-11 ends "but in our view all these Dasha are not appropriate", and Santhanam adds the
 * parenthetical "(for the purpose for which they are meant)". That gloss changes the claim
 * materially — a flat rejection versus a narrower "not for the use they are usually put to"
 * — and the parenthetical is the translator's, not the verse's.
 *
 * Meanwhile `packages/knowledge` already implements Chara/Narayana, Kalachakra, Ashtottari
 * and the rasi dashas, and the app serves them. This chapter does not license removing them:
 * it is one chapter's opinion, later chapters of the same book construct several of these
 * systems in detail, and a translator's parenthetical is doing a lot of work.
 *
 * **Recorded as a live question for Part 37, not acted on.**
 */
export const CH46_SPELLING_VARIANTS =
  'The book spells several systems more than one way — Satabdika/Shatabdika, '
  + 'Astottari/Ashtottari, Shodsottari/Shodasottari, Dwadasottari/Dwadashottari — sometimes '
  + 'within a page of itself. The census and ch46b’s table are normalised to one spelling '
  + 'each so they can be JOINED on the name; a test asserts the two lists cover the same nine '
  + 'systems, and it FAILED twice before the spellings were aligned, which is the point. '
  + 'Sharpest case: 46.2-5 romanises the 36-year system as "Shatvimsa-sama" (vimsa = 20) '
  + 'while its own Devanagari reads षट्त्रिंश (trimsha = 30) and its table sums to 36. The '
  + 'romanisation is wrong; the Devanagari and the arithmetic agree, so the system is '
  + 'Shat-trimsat.';

export const CH46_REJECTION_IS_AMBIGUOUS =
  'BPHS 46.6-11 says "in our view all these Dasha are not appropriate", and Santhanam glosses '
  + 'it "(for the purpose for which they are meant)". A flat rejection and a narrow one are '
  + 'materially different claims, and the parenthetical is the TRANSLATOR’s, not the verse’s. '
  + 'The codebase already ships four of the systems listed as rejected (Chara/Narayana, '
  + 'Kalachakra, Ashtottari, the rasi dashas) and the app serves them. Nothing is removed on '
  + 'the strength of this: it is one chapter’s opinion, later chapters construct several of '
  + 'these systems in detail, and Part 37 is where the applicability question is actually '
  + 'decided. Recorded as a live question, not acted on.';

export const CH46_VERIFICATION = {
  chapter: 46,
  checkedAgainst: [
    'the lord order rotated to Krittika (46.12-14)',
    'the nine year-counts and their 120 total (46.15)',
    'the nakshatra→lord remainder rule, for all 27 nakshatras',
    'the chapter’s worked example: Moon at Sagittarius 13° → Moola 4th pada, lord Ketu',
    'the balance table’s first row, all four sign-group columns',
    'the balance table at 0°20′, in two columns',
  ],
  discrepancies: 0,
  note: 'The existing implementation was NOT changed. This is the fifth time a shipped '
    + 'component has been checked against its source chapter; the previous four found real '
    + 'bugs, and this one found none. The value of the check does not depend on which way it '
    + 'comes out — a verified date engine is worth as much as a corrected one, and until now '
    + 'the Vimshottari had only ever been checked against the OTHER corpus.',
} as const;

export const CH46A_YIELD = {
  chapter: 46,
  part: '46a',
  newRules: 0,
  note: 'A verification part. Chapter 46a states the Vimshottari construction and then hands '
    + 'the balance to an ephemeris table rather than deriving it, so there is little to '
    + 'encode and a great deal to check. What it does add is `CH46_DASHA_SYSTEMS` — the '
    + 'chapter’s own census of thirty-two dasha systems with its verdict on each, which is '
    + 'the frame for Part 37’s "which system applies to THIS chart".',
} as const;
