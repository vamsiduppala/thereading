// BPHS Programme Part 28 — Chapter 32: Planetary Karakatwa (significators).
//
// This chapter is unusual: almost everything in it already existed in the codebase, encoded
// from the OTHER corpus (the integrated-approach book, its ch 8). So the work here is mostly
// *reconciliation* rather than extraction — and reconciliation turned up four places where
// the two books say different things. Those are recorded as divergences, not silently merged.
//
// What is genuinely new:
//   - 32.9-12  the Atmakaraka precedence rule — the SEVENTH source-stated arbitration order
//   - 32.22-24 reading a house counted FROM A PLANET, which needed a predicate-engine change
//   - 32.25-30 paraspara karakas (mutual co-workers), with three worked charts

import type { Graha, House, SignIndex } from '../../types.js';
import type { DignityState } from '../../rules/predicate.js';

// ─────────────────────────────────────────────────────────────────────────────
// 32.1-17 — the chara (variable) karakas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The eight chara karakas in rank order, highest longitude first.
 *
 * BPHS 32.13-15 names them in exactly the order `CHARA_KARAKAS` (from the other corpus)
 * already had, so the two books agree here and no divergence is recorded.
 *
 * One textual fault: the Notes table in this edition glosses Gnati Karaka as "next to
 * **Pitru** Karaka in longitude" when the running order plainly makes it next to Putra.
 * Verse 14 itself is correct (`putrān nyūnāṁśako jñātir`). See `CH32_TEXTUAL_FAULT`.
 */
export const CHARA_KARAKA_ORDER = [
  'Atmakaraka', 'Amatyakaraka', 'Bhratrukaraka', 'Matrukaraka',
  'Pitrukaraka', 'Putrakaraka', 'Gnatikaraka', 'Darakaraka',
] as const;

/**
 * BPHS 32.3-4: rank by degrees traversed in the sign; ties broken by minutes, then by
 * seconds. Our `charaKarakas()` takes a float longitude, so arc-minute and arc-second
 * tie-breaking happens for free — comparing 27.5961 against 27.2972 IS comparing degrees
 * then minutes then seconds. Recorded because "we implement it" and "the number type
 * implements it" are different claims, and only the second one is true.
 */
export const CH32_TIE_BREAK =
  'BPHS 32.3-4 breaks a degree tie by arc-minutes and then by arc-seconds. We rank on a '
  + 'float degree-in-sign, which subsumes all three comparisons exactly — the tie-break is '
  + 'a property of the representation, not code we wrote. It only becomes real code at the '
  + 'point BPHS 32.16-17 addresses: an exact tie to the arc-second.';

/**
 * BPHS 32.16-17: if two planets share a longitude to the second, BOTH hold that karakatwa,
 * and the karaka below it is dropped rather than everything shifting up. With eight bodies
 * and eight offices, that leaves the last office — Dara — vacant, and the text says to fall
 * back to the *constant* significator for marriage, Venus.
 *
 * Encoded because it is a rule about what to do when the scheme runs out, and those are
 * exactly the rules that get quietly skipped and then produce a wrong answer once in a
 * thousand charts.
 */
export const CH32_EXACT_TIE_RULE =
  'On an exact tie (to the arc-second) both planets hold that karakatwa and the NEXT office '
  + 'is dropped, rather than the list shifting up. If that leaves Dara Karaka vacant, the '
  + 'constant significator Venus stands in for marriage matters (BPHS 32.16-17).';

/**
 * BPHS 32.15-16 records a rival school that treats Matrukaraka and Putrakaraka as one
 * office, giving seven karakas rather than eight. The sage reports it without endorsing it.
 *
 * Not implemented as a switchable mode: the book's own worked table (below) uses eight, so
 * eight is what we can verify. Recorded so that a chart disagreeing with a seven-karaka
 * source is understood as a school difference rather than a bug.
 */
export const CH32_SEVEN_KARAKA_SCHOOL =
  'A rival school merges Matrukaraka and Putrakaraka into one office, giving seven karakas. '
  + 'BPHS reports it without endorsing it, and its own worked table uses eight — so we use '
  + 'eight. A seven-karaka source will disagree from Matrukaraka down; that is a school '
  + 'difference, not an error in either.';

/**
 * BPHS 32.1-2 and 32.5: whether Rahu counts at all is itself disputed — some admit it only
 * to break a tie, some always. When counted, its degrees are measured from the END of its
 * sign (`kha-vahni`, 30), because it moves backwards.
 *
 * We always count Rahu, matching the book's own worked table.
 */
export const CH32_RAHU_RULE =
  'Rahu is counted from the END of its sign (30° − degree-in-sign) because it moves '
  + 'retrograde (BPHS 32.5). Whether to include it at all is disputed in 32.1-2; the book’s '
  + 'own worked table includes it, so we do. Ketu is never a chara karaka.';

/**
 * The book's own worked example: the karakas of the standard nativity (BPHS ch 29),
 * tabulated in the Notes to 32.13-17.
 *
 * `karakaDegree` is the value the book ranks on — for Rahu that is already the reversed
 * count, so Rahu's actual degree-in-sign is 30° − 22°22'54" = 7°37'06". That single row is
 * the reason this table is worth carrying: it is the only place the book shows the Rahu
 * reversal *and* its consequence for rank, and a naive implementation that skips the
 * reversal puts Rahu at Putra rather than Matru.
 */
export interface WorkedKaraka { karaka: string; graha: Graha; deg: number; min: number; sec: number }

export const CH32_WORKED_KARAKAS: WorkedKaraka[] = [
  { karaka: 'Atmakaraka', graha: 'moon', deg: 27, min: 35, sec: 46 },
  { karaka: 'Amatyakaraka', graha: 'venus', deg: 27, min: 17, sec: 50 },
  { karaka: 'Bhratrukaraka', graha: 'jupiter', deg: 26, min: 7, sec: 13 },
  { karaka: 'Matrukaraka', graha: 'rahu', deg: 22, min: 22, sec: 54 },
  { karaka: 'Pitrukaraka', graha: 'mercury', deg: 14, min: 54, sec: 13 },
  { karaka: 'Putrakaraka', graha: 'sun', deg: 7, min: 12, sec: 18 },
  { karaka: 'Gnatikaraka', graha: 'mars', deg: 6, min: 18, sec: 46 },
  { karaka: 'Darakaraka', graha: 'saturn', deg: 3, min: 9, sec: 41 },
];

/** Degrees-in-sign for the worked nativity, with Rahu un-reversed back to its true position. */
export function workedNativityLongitudes(): Partial<Record<Graha, number>> {
  const out: Partial<Record<Graha, number>> = {};
  for (const r of CH32_WORKED_KARAKAS) {
    const d = r.deg + r.min / 60 + r.sec / 3600;
    out[r.graha] = r.graha === 'rahu' ? 30 - d : d;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// 32.9-12 — the Atmakaraka outranks the rest
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 32.9-12, via the king-and-minister image: the other karakas cannot act against the
 * Atmakaraka. If the AK is adverse the rest cannot deliver their benefic effects in full;
 * if the AK is favourable the rest cannot press their malefic ones.
 *
 * This is the **seventh** place the source states its own arbitration order, after 27.37-38,
 * 28.15-20, 72.30-31, 74.11-13, 14.15 and 24.145. It differs from all six in shape: those
 * rank *evidence*, this one **caps** it. A karaka finding is bounded by the AK's condition
 * in the direction that would contradict it, and is left alone in the other direction.
 *
 * Deliberately NOT wired into `arbitrate` yet: the cap needs a judgement of whether the
 * Atmakaraka is "adverse", and BPHS 32 does not define that here. Encoding the ordering
 * without the predicate it depends on would be inventing the missing half.
 */
export const ATMAKARAKA_PRECEDENCE =
  'BPHS 32.9-12: the Atmakaraka outranks every other karaka — as a minister cannot go '
  + 'against the king. An adverse AK caps how much benefit the other karakas may deliver; a '
  + 'favourable AK caps how much harm they may. This is the seventh source-stated '
  + 'arbitration instruction (after 27.37-38, 28.15-20, 72.30-31, 74.11-13, 14.15, 24.145) '
  + 'and the first that CAPS evidence rather than ranking it. Not yet wired into arbitrate: '
  + 'the cap needs a definition of an "adverse" Atmakaraka, which this chapter does not give.';

// ─────────────────────────────────────────────────────────────────────────────
// 32.18-21 — the sthira (constant) karakas, and where the two books disagree
// ─────────────────────────────────────────────────────────────────────────────

export interface SthiraKarakaBphs { planet: Graha | Graha[]; signifies: string[]; strongerOf?: true }

/** BPHS 32.18-21 exactly as the chapter's own Notes table gives it. */
export const BPHS_STHIRA_KARAKAS: SthiraKarakaBphs[] = [
  { planet: ['sun', 'venus'], signifies: ['father'], strongerOf: true },
  { planet: ['moon', 'mars'], signifies: ['mother'], strongerOf: true },
  { planet: 'mars', signifies: ['sister', 'brother-in-law', 'younger brother', 'mother'] },
  { planet: 'mercury', signifies: ['maternal relatives'] },
  { planet: 'jupiter', signifies: ['paternal grandfather'] },
  { planet: 'venus', signifies: ['husband'] },
  { planet: 'saturn', signifies: ['sons'] },
  { planet: 'ketu', signifies: ['wife', 'father', 'mother', 'parents-in-law', 'maternal grandfather'] },
];

/**
 * Four divergences between BPHS 32 and the sthira karakas already in `data/karakas.ts`
 * (encoded from the integrated-approach book's ch 8).
 *
 * Recorded rather than merged. Both books are in the corpus deliberately, and a table that
 * silently averaged them would be a third table belonging to neither. Where a caller must
 * pick, BPHS is the older and more specific source for this material.
 */
export const CH32_STHIRA_DIVERGENCES = [
  'Jupiter: BPHS gives ONLY paternal grandfather. The other corpus adds husband, children '
  + 'and paternal relatives — most of which BPHS assigns elsewhere (husband→Venus, sons→Saturn).',
  'Ketu: BPHS makes it a constant significator (wife, father, mother, parents-in-law, '
  + 'maternal grandfather). The other corpus omits Ketu from the sthira scheme entirely.',
  'Father / mother: BPHS says only "the stronger of the two". The other corpus adds a '
  + 'day/night qualifier (Sun by day, Venus by night) that BPHS 32.18-19 does not state.',
  'Venus: BPHS says husband. The other corpus says wife (plus maternal grandparents). These '
  + 'are not a contradiction so much as an unstated assumption about whose chart it is; BPHS '
  + 'also assigns wife to Ketu in the same passage, so the chapter is not self-consistent.',
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// 32.22-24 — a matter is read from the house counted FROM its significator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 32.22-24. Each constant significator carries its own house: the matter is judged
 * from that house counted from THAT PLANET, not from the ascendant.
 *
 * This is what forced the predicate-engine change in this part. `LagnaReference` could
 * name six ascendants and the Moon; it now names any planet, and a planetary frame resolves
 * straight from `facts.planets` rather than needing a fact the generator must remember to
 * produce. That distinction is deliberate — see the type's own comment and `CH25_WIRING`.
 */
export interface KarakaFrame {
  graha: Graha;
  house: House;
  matter: string;
  /** Withheld matters are computed-but-never-surfaced; see the standing constraint. */
  surfaced: boolean;
  withheld?: string;
}

export const KARAKA_FRAMES: KarakaFrame[] = [
  { graha: 'sun', house: 9, matter: 'the father', surfaced: true },
  { graha: 'moon', house: 4, matter: 'the mother', surfaced: true },
  { graha: 'mars', house: 3, matter: 'siblings', surfaced: true },
  { graha: 'mercury', house: 6, matter: 'maternal relatives', surfaced: true },
  { graha: 'jupiter', house: 5, matter: 'children', surfaced: true },
  { graha: 'venus', house: 7, matter: 'the spouse', surfaced: true },
  {
    graha: 'saturn', house: 8, matter: 'longevity', surfaced: false,
    withheld: 'The 8th from Saturn is the book’s death-and-longevity frame. Computed and '
      + 'carried so the frame is complete, never surfaced. Longevity is Part 51.',
  },
];

/** The sign that a karaka frame's house falls in, or null if the planet is not on the chart. */
export function karakaFrameSign(
  planets: Partial<Record<Graha, { sign: SignIndex }>>, frame: KarakaFrame,
): SignIndex | null {
  const p = planets[frame.graha];
  if (!p) return null;
  return ((p.sign + frame.house - 1) % 12) as SignIndex;
}

// ─────────────────────────────────────────────────────────────────────────────
// 32.25-30 — paraspara karakas (mutual co-workers)
// ─────────────────────────────────────────────────────────────────────────────

/** Dignities that qualify a planet as a co-worker (BPHS 32.26: own, exalted, or friendly). */
export const PARASPARA_DIGNITIES: DignityState[] = ['exalted', 'moolatrikona', 'own', 'friend'];

export interface ParasparaPair {
  a: Graha;
  b: Graha;
  /** 1 = mutually angular from the ascendant; 3 = mutually angular only to each other. */
  rule: 1 | 3;
  /** BPHS 32.26-27: one of them in the 10th makes the effect pronounced. */
  viaTenth: boolean;
}

export interface ParasparaInput {
  lagnaSign: SignIndex;
  planets: Partial<Record<Graha, { sign: SignIndex; dignity?: DignityState }>>;
}

const ANGLES = [1, 4, 7, 10];
const houseOf = (sign: SignIndex, lagna: SignIndex): House => (((sign - lagna + 12) % 12) + 1) as House;

/**
 * Planets that act on each other's behalf (BPHS 32.25-30).
 *
 * Rule 1 — both in angles from the ascendant, mutually angular, each in own / exalted /
 *          friendly sign. If one is in the 10th, the effect is pronounced.
 * Rule 2 — mutual angularity WITHOUT dignity yields nothing. That is not a third branch
 *          here; it is the dignity filter, and the book states it as its own rule only
 *          because its second worked chart exists to show the negative case.
 * Rule 3 — mutually angular to EACH OTHER while neither is angular from the ascendant,
 *          both dignified: still co-workers. The book notes some schools reject this, so
 *          it is opt-in via `includeRule3` and reported separately when included.
 *
 * "This is not to be considered from the Moon" (Notes to rule 1) — so this function takes
 * the natal ascendant only, and deliberately offers no frame parameter.
 */
export function parasparaKarakas(
  input: ParasparaInput, opts: { includeRule3?: boolean } = {},
): ParasparaPair[] {
  const entries = Object.entries(input.planets) as [Graha, { sign: SignIndex; dignity?: DignityState }][];
  const qualified = entries.filter(([, p]) => p.dignity != null && PARASPARA_DIGNITIES.includes(p.dignity));
  const out: ParasparaPair[] = [];
  for (let i = 0; i < qualified.length; i++) {
    for (let j = i + 1; j < qualified.length; j++) {
      const [ga, pa] = qualified[i]!;
      const [gb, pb] = qualified[j]!;
      // Mutually angular means one stands in an angle counted from the other.
      const mutual = ANGLES.includes(houseOf(pb.sign, pa.sign));
      if (!mutual) continue;
      const ha = houseOf(pa.sign, input.lagnaSign);
      const hb = houseOf(pb.sign, input.lagnaSign);
      const bothAngularFromLagna = ANGLES.includes(ha) && ANGLES.includes(hb);
      if (bothAngularFromLagna) {
        out.push({ a: ga, b: gb, rule: 1, viaTenth: ha === 10 || hb === 10 });
      } else if (opts.includeRule3) {
        out.push({ a: ga, b: gb, rule: 3, viaTenth: ha === 10 || hb === 10 });
      }
    }
  }
  return out;
}

export const CH32_RULE3_DISPUTED =
  'BPHS notes that some schools reject rule 3 (co-workership without angularity from the '
  + 'ascendant). It is therefore opt-in rather than default, and pairs found under it are '
  + 'tagged `rule: 3` so a caller can drop them without recomputing.';

export const CH32_NOT_FROM_MOON =
  'BPHS 32.25-30 is judged from the natal ascendant only — "this is not to be considered '
  + 'from the Moon". `parasparaKarakas` therefore takes no frame parameter, which is a case '
  + 'of the source restricting a generalisation the engine would otherwise have allowed.';

// ─────────────────────────────────────────────────────────────────────────────
// 32.31-34 — a significator per house
// ─────────────────────────────────────────────────────────────────────────────

/** BPHS 32.34 — one planet per bhava, as the chapter's Notes tabulate it. */
export const BHAVA_KARAKA_BPHS: Record<House, Graha> = {
  1: 'sun', 2: 'jupiter', 3: 'mars', 4: 'moon', 5: 'jupiter', 6: 'mars',
  7: 'venus', 8: 'saturn', 9: 'jupiter', 10: 'mercury', 11: 'jupiter', 12: 'saturn',
};

/**
 * BPHS 32.34 names exactly one planet per house; `NAISARGIKA_HOUSE_KARAKA` (other corpus)
 * names one to four. The BPHS list is a strict subset in most houses but NOT all — the
 * disagreements are real, and the 10th is the sharp one.
 */
export const CH32_BHAVA_KARAKA_DIVERGENCES = [
  '10th: BPHS gives Mercury alone (honour). The other corpus gives Sun, Mercury, Jupiter '
  + 'and Saturn — the four-karaka scheme for karma bhava. This is the widest gap of the twelve.',
  '4th: BPHS gives the Moon alone (mother). The other corpus adds Mercury (education).',
  '6th: BPHS gives Mars alone (enemies). The other corpus adds Saturn (disease, service).',
  '12th: BPHS gives Saturn alone (expenditure). The other corpus adds Ketu (release).',
  '9th: BPHS gives Jupiter alone (fortune). The other corpus adds the Sun (father) — which '
  + 'BPHS itself supports at 32.22, where the father is read from the 9th FROM the Sun. The '
  + 'two statements are about different things and only look like a contradiction.',
] as const;

/**
 * BPHS 32.31-33 gives a second, looser set of house significations alongside the standard
 * ones, and they do not line up with ch 2. The 2nd and the 7th are both called the wife's
 * house, and a planet in the 5th is said to become a karaka for the wife.
 *
 * Carried as a note rather than as rules: three houses claiming one matter is a doctrine we
 * would have to arbitrate before it could predict anything, and this chapter gives no basis
 * for that arbitration.
 */
export const CH32_SECONDARY_HOUSE_SENSES =
  'BPHS 32.31-33 adds a looser layer: 1st the self and soul, 2nd the wife, 11th the '
  + 'elder-born, 3rd the younger-born, 5th progeny, 7th the wife again — and a planet in the '
  + '5th said to become a karaka for the wife. The 2nd, 5th and 7th all claim the spouse. '
  + 'Kept as a note, not as rules: arbitrating three claimants needs a basis this chapter '
  + 'does not supply, and ch 2 already carries the standard significations.';

// ─────────────────────────────────────────────────────────────────────────────
// 32.35-37 — the six adverse and the six auspicious houses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 32.35-37 splits the twelve houses in half: 11, 3, 8, 6, 2 and 12 adverse; the
 * ascendant, 4, 5, 7, 9 and 10 auspicious. A planet owning or occupying an adverse house
 * turns functionally malefic; association with an auspicious one turns even an evil planet
 * favourable.
 *
 * Worth flagging: this list calls the **11th and the 2nd** malefic. The 11th is an upachaya
 * and the 2nd a maraka-but-benefic in most later schemes, so a reader comparing against a
 * modern text will find this list stricter than expected. That is the source's position,
 * not a transcription slip — it is stated twice, in verse and in the Notes.
 */
export const ADVERSE_HOUSES_CH32: House[] = [2, 3, 6, 8, 11, 12];
export const AUSPICIOUS_HOUSES_CH32: House[] = [1, 4, 5, 7, 9, 10];

export const CH32_HOUSE_POLARITY_NOTE =
  'BPHS 32.35-37 calls 2, 3, 6, 8, 11 and 12 adverse and 1, 4, 5, 7, 9 and 10 auspicious. '
  + 'Note that this puts the 11th (an upachaya elsewhere) and the 2nd among the adverse — '
  + 'stricter than most later schemes. Stated twice in the chapter, so it is the source’s '
  + 'position rather than a slip. The chapter points at ch 34 for more.';

// ─────────────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────────────

export const CH32_TEXTUAL_FAULT =
  'The Notes table to 32.13-17 glosses Gnati Karaka as "next to Pitru Karaka in longitude" '
  + 'when the running order makes it next to Putra; verse 14 itself is right. Third '
  + 'transcription fault found in this edition, after 27’s missing verses 30-31 and 25’s '
  + 'missing verse for Dhwaja in the 11th.';

export const CH32_YIELD = {
  chapter: 32,
  verses: 37,
  newRules: 0,
  note: 'A chapter that produced no new Rule records and was still worth a part. Most of it '
    + 'already existed from the other corpus, so the work was reconciliation — four sthira '
    + 'divergences and five bhava-karaka divergences recorded rather than merged. What it '
    + 'DID produce is capability: planetary frames in the predicate engine (32.22-24), the '
    + 'paraspara-karaka relation (32.25-30), and the seventh source-stated arbitration '
    + 'instruction (32.9-12). Counting rules alone would score this chapter at zero.',
} as const;
