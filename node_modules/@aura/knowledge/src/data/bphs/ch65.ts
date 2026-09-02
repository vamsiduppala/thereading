// BPHS Programme Part 45 — Chapter 65: the effects of a rasi's dasha within an amsa
// (Kalachakra navamsa dasha).
//
// 358 lines, no tables, 107 one-phrase readings of the form *"Cancer — increase in wealth"*.
// The readings are refused. **The order they are listed in is the find.**
//
// Chapter 65 never states a sequence, a wheel, or an offset. It just lists effects. But the
// order of that list turns out to be a contiguous cyclic window of `SAVYA_24` in **all ten**
// surviving blocks, at offsets the shipped `padaOrdinal * 9 mod 24` produces in nine of them —
// which is an independent confirmation of a structure Part 36 built from a different chapter,
// obtained from data that was never meant to state it.
//
// That is the second time in two parts that a Kalachakra chapter has confirmed shipped data
// sideways: Part 44 recovered `KALACHAKRA_RASI_YEARS` from section headings, and this recovers
// `SAVYA_24` from the order of a list of readings.

import type { SignIndex } from '../../types.js';
import { SAVYA_24 } from '../kalachakra.js';

const mod24 = (n: number): number => ((n % 24) + 24) % 24;

// ─────────────────────────────────────────────────────────────────────────────
// The find: the order confirms the wheel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chapter 65's blocks, as (amsa, cell count, offset into `SAVYA_24`).
 *
 * Ten of the twelve amsas survive transcription. Each block lists its readings in an order
 * that is a **contiguous cyclic window of `SAVYA_24`** — verified by searching all 24 possible
 * offsets and finding exactly one that reproduces the block, for every block.
 *
 * Nine of the ten offsets are in `{0, 3, 6, 9, 12, 15, 18, 21}`, which is precisely the set
 * `padaOrdinal * 9 mod 24` generates — the start rule `kalachakraPada` uses. The tenth
 * (Pisces, offset 4) is also the shortest block at eight cells rather than nine, so it has
 * evidently lost its first entry; an 8-cell window fits one place further along.
 */
export const CH65_BLOCKS: { amsa: SignIndex; cells: number; offset: number }[] = [
  { amsa: 0, cells: 18, offset: 0 },     // Aries
  { amsa: 2, cells: 18, offset: 18 },    // Gemini
  { amsa: 4, cells: 9, offset: 12 },     // Leo
  { amsa: 5, cells: 9, offset: 21 },     // Virgo
  { amsa: 6, cells: 9, offset: 6 },      // Libra
  { amsa: 7, cells: 9, offset: 15 },     // Scorpio
  { amsa: 8, cells: 9, offset: 0 },      // Sagittarius
  { amsa: 9, cells: 9, offset: 9 },      // Capricorn
  { amsa: 10, cells: 9, offset: 18 },    // Aquarius
  { amsa: 11, cells: 8, offset: 4 },     // Pisces — one cell short, see below
];

/** The window of `SAVYA_24` a block occupies, as sign indices. */
export function ch65BlockSequence(offset: number, cells: number): SignIndex[] {
  return Array.from({ length: cells }, (_, k) => SAVYA_24[mod24(offset + k)]! as SignIndex);
}

export const CH65_ORDER_CONFIRMS_SAVYA_24 =
  'Chapter 65 never states a sequence, a wheel or an offset — it just lists 107 one-phrase '
  + 'readings. But the ORDER of that list is a contiguous cyclic window of `SAVYA_24` in ALL '
  + 'TEN surviving blocks, found by searching all 24 offsets and getting exactly one hit per '
  + 'block. Nine of the ten offsets lie in {0,3,6,9,12,15,18,21}, precisely the set '
  + '`padaOrdinal * 9 mod 24` generates — the start rule `kalachakraPada` uses. So a structure '
  + 'Part 36 built from chapter 46 is confirmed by chapter 65’s LAYOUT, from data never meant '
  + 'to state it. Second sideways confirmation in two parts, after Part 44 recovered '
  + '`KALACHAKRA_RASI_YEARS` from section headings.';

/**
 * ⚠️ The collision that makes a naive `(amsa, rasi)` key **lossy**, and how it was caught.
 *
 * The Aries-amsa block has **eighteen** cells, not twelve, and several rasis appear twice with
 * different readings — Scorpio is both *"danger of death"* and *"danger from fire"*; Libra is
 * both *"ministership"* and *"honours from the king"*.
 *
 * That is not a duplication fault. `SAVYA_24` visits twelve signs and then a mirrored row, so
 * a rasi occupies **two positions** in the wheel and a block spanning more than twelve cells
 * meets it twice. The cells are keyed by **position in the wheel**, not by sign.
 *
 * Keying a table on `(amsa, rasi)` would therefore have silently overwritten one reading with
 * the other — dropping six cells from the Aries block alone and leaving no trace. Recorded
 * because the failure is invisible: the table would look complete.
 */
export const CELLS_ARE_KEYED_BY_WHEEL_POSITION =
  'The Aries-amsa block has EIGHTEEN cells, not twelve, and rasis recur with different '
  + 'readings — Scorpio is both "danger of death" and "danger from fire"; Libra both '
  + '"ministership" and "honours from the king". Not a duplication fault: `SAVYA_24` visits '
  + 'twelve signs then a MIRRORED row, so a rasi holds TWO positions and a block longer than '
  + 'twelve meets it twice. The cells are keyed by POSITION IN THE WHEEL, not by sign. A naive '
  + '(amsa, rasi) key would have silently overwritten one reading with the other — six cells '
  + 'lost from the Aries block alone, with the table still looking complete. Recorded because '
  + 'that failure leaves no trace.';

// ─────────────────────────────────────────────────────────────────────────────
// The readings — refused
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chapter 65's 107 readings are **not encoded**.
 *
 * They are closer to usable than chapters 61-64's were — **64% carry neither a medical nor a
 * doom claim**, against 31% in chapter 61, and they are single subject phrases (*"increase in
 * wealth"*, *"dawn of knowledge"*, *"progress in education"*) rather than paragraphs of period
 * furniture. That is a real difference and it deserved a real look.
 *
 * Three things decided against it.
 *
 * **1. No condition, and nothing to supply one.** Like chapters 61-64, not one cell states a
 * placement condition. Chapter 64's friendship rule (64.56-58) cannot fill the gap here: it
 * compares the antar lord with the **dasha** lord, and these are dasha readings with no second
 * party to compare. So they would ship as flat unconditional claims.
 *
 * **2. The transcription is incomplete in a way that hides itself.** Two of the twelve amsas
 * are missing entirely, the Pisces block has lost a cell, and — worse — the wheel-position
 * keying means a table indexed by sign would look full while having dropped its collisions.
 *
 * **3. Two cells in five still carry doom or medicine**, including *"danger of death"* and
 * *"distress from diseases caused by blood pollution"*.
 *
 * **What is kept instead is the order**, which is verifiable, complete for ten blocks, and
 * confirms a shipped structure. That is a better return than 68 flat phrases.
 */
export const CH65_READINGS_REFUSED =
  'Chapter 65’s 107 readings are NOT encoded, though they came closer than chapters 61-64’s: '
  + '64% carry neither a medical nor a doom claim (against 31% in ch 61) and they are single '
  + 'subject phrases rather than paragraphs of period furniture. Three things decided it. '
  + '(1) NO CONDITION and nothing to supply one — ch 64’s friendship rule compares the antar '
  + 'lord with the DASHA lord, and these are dasha readings with no second party, so they '
  + 'would ship as flat unconditional claims. (2) The transcription is INCOMPLETE IN A WAY '
  + 'THAT HIDES ITSELF: two amsas missing, Pisces a cell short, and the wheel-position keying '
  + 'means a sign-indexed table would look full while having dropped its collisions. (3) Two '
  + 'cells in five still carry doom or medicine, including "danger of death". Kept instead: '
  + 'the ORDER, which is verifiable, complete for ten blocks, and confirms a shipped structure.';

/**
 * BPHS 65.32 — *"observance of remedial measures in the form of prescribed religious rites
 * destroy the evil effects of the inauspicious Dasha and yield happiness."*
 *
 * Refused under the standing constraint: behavioural remedies only, never gemstones, fasting
 * or rituals. Recorded rather than passed over so the omission is visible against the page —
 * it is the chapter's final verse and a reader comparing our output will notice it missing.
 */
export const CH65_RITUAL_REMEDY_REFUSED =
  'BPHS 65.32 — "observance of remedial measures in the form of prescribed religious rites '
  + 'destroy the evil effects of the inauspicious Dasha and yield happiness." Refused under '
  + 'the standing constraint: behavioural remedies only, never gemstones, fasting or rituals. '
  + 'Recorded rather than passed over — it is the chapter’s final verse and its absence would '
  + 'otherwise be an unexplained gap.';

export const CH65_YIELD = {
  chapters: [65],
  note: 'A part whose find is a LAYOUT, not a rule. Chapter 65 lists 107 one-phrase readings '
    + 'and never states a sequence — yet the ORDER of the list is a contiguous cyclic window '
    + 'of `SAVYA_24` in all ten surviving blocks, at offsets `padaOrdinal * 9 mod 24` produces '
    + 'in nine of them. An independent confirmation of Part 36’s wheel from data never meant '
    + 'to state it, and the second sideways confirmation in two parts. It also exposed that '
    + 'the cells are keyed by WHEEL POSITION, not by sign — a rasi recurs with a different '
    + 'reading — so an (amsa, rasi) table would have dropped its collisions while still '
    + 'looking complete. The readings themselves are refused: no condition and nothing able to '
    + 'supply one, a transcription incomplete in a self-hiding way, and two cells in five still '
    + 'carrying doom or medicine. 65.32’s ritual remedy is refused under the standing rule.',
} as const;
