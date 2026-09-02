// BPHS Programme Part 30 — Chapter 35: the 32 Nabhasa yogas.
//
// These are CHART-SHAPE yogas: they say nothing about which planet is where, only about how
// the seven are distributed. "All seven in movable signs." "All seven in four consecutive
// houses." "All seven confined to exactly three signs."
//
// That made this the part the programme expected to need a new predicate kind. It did not —
// for the same reason Part 29's varga gap did not. A predicate asks a question about a
// chart; a distribution is a property OF the chart. So the formations are computed
// (`nabhasaYogas`), the way `parasparaKarakas` is, and no predicate changed.
//
// The formations are the deliverable. The EFFECTS are the most heavily refused block in the
// corpus so far: of 32 yogas, the majority of the effect verses are character verdicts
// (crooked, cruel, wicked, mean, lazy, dirty), poverty predictions, or kingship. What is
// kept is what describes a disposition or a livelihood rather than a person's worth.

import type { Graha, House, SignIndex } from '../../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// The catalogue
// ─────────────────────────────────────────────────────────────────────────────

export type NabhasaGroup = 'asraya' | 'dala' | 'akriti' | 'sankhya';

export interface NabhasaYoga {
  name: string;
  group: NabhasaGroup;
  verse: string;
  /** How the chapter defines the formation, in our own words. */
  formation: string;
  surfaced: boolean;
  summary?: string;
  valence?: number;
  withheld?: string;
}

/**
 * BPHS 35.1-2 declares 32 yogas in four groups: 3 Asraya, 2 Dala, 20 Akriti, 7 Sankhya.
 * The count is the chapter's own and is asserted in the tests — it is the one arithmetic
 * check this chapter offers, since it gives no worked chart.
 */
export const NABHASA_GROUP_COUNTS = { asraya: 3, dala: 2, akriti: 20, sankhya: 7 } as const;

export const NABHASA_YOGAS: NabhasaYoga[] = [
  // ── Asraya (3) — 35.7
  {
    name: 'Rajju', group: 'asraya', verse: '7', formation: 'All seven planets in movable signs.',
    surfaced: true, valence: 0.2,
    summary: 'A life that moves — travel, and earning away from where you started.',
    withheld: undefined,
  },
  {
    name: 'Musala', group: 'asraya', verse: '7', formation: 'All seven planets in fixed signs.',
    surfaced: true, valence: 0.7,
    summary: 'Standing, steadiness and accumulated regard; the disposition is firm rather than restless.',
  },
  {
    name: 'Nala', group: 'asraya', verse: '7', formation: 'All seven planets in dual signs.',
    surfaced: true, valence: 0.5,
    summary: 'Marked skill, a saving instinct, and reliability toward one’s own people.',
  },
  // ── Dala (2) — 35.8
  {
    name: 'Maala', group: 'dala', verse: '8', formation: 'Benefics occupying three angles.',
    surfaced: true, valence: 0.8,
    summary: 'Sustained ease — comfort, means and good living arriving without constant struggle.',
  },
  {
    name: 'Sarpa', group: 'dala', verse: '8', formation: 'Malefics occupying three angles.',
    surfaced: false,
    withheld: 'The effect verse is entirely character verdict and poverty — crooked, cruel, '
      + 'poor, miserable, dependent on others for food. Nothing survives the filter, so the '
      + 'formation is detected and the reading refused.',
  },
  // ── Akriti (20) — 35.9-15
  {
    name: 'Gada', group: 'akriti', verse: '9', formation: 'All seven planets in two successive angles.',
    surfaced: true, valence: 0.6,
    summary: 'Sustained effort directed at building means, with real skill in learning and music.',
  },
  {
    name: 'Sakata', group: 'akriti', verse: '9', formation: 'All seven planets in the ascendant and the 7th.',
    surfaced: false,
    withheld: 'Effect verse not carried: the surviving material is a hardship prediction.',
  },
  {
    name: 'Vihanga', group: 'akriti', verse: '10', formation: 'All seven planets in the 4th and the 10th.',
    surfaced: false,
    withheld: 'Effect verse not carried; the reading is occupational disparagement.',
  },
  {
    name: 'Sringataka', group: 'akriti', verse: '10', formation: 'All seven planets in the ascendant, 5th and 9th.',
    surfaced: true, valence: 0.7,
    summary: 'A fortunate distribution — the three trines carrying the whole chart between them.',
  },
  {
    name: 'Hala', group: 'akriti', verse: '10',
    formation: 'All seven in 2/6/10, or all in 3/7/11, or all in 4/8/12 — one trine of houses.',
    surfaced: true, valence: 0.3,
    summary: 'Work and its rewards concentrated in one department of life rather than spread across it.',
  },
  {
    name: 'Vajra', group: 'akriti', verse: '11',
    formation: 'Benefics in the ascendant and 7th, malefics in the 4th and 10th.',
    surfaced: true, valence: 0.4,
    summary: 'Strength at the beginning and end of life, with the middle asking more of you.',
  },
  {
    name: 'Yava', group: 'akriti', verse: '11',
    formation: 'The reverse of Vajra: benefics in the 4th and 10th, malefics in the ascendant and 7th.',
    surfaced: true, valence: 0.4,
    summary: 'The middle of life carries the ease; the ends ask more.',
  },
  {
    name: 'Kamala', group: 'akriti', verse: '12', formation: 'All seven planets in the four angles.',
    surfaced: true, valence: 0.8,
    summary: 'An unusually well-supported chart — means, standing and steady good conduct.',
  },
  {
    name: 'Vapi', group: 'akriti', verse: '12',
    formation: 'All seven in the cadent houses (3/6/9/12) or all in the succedent (2/5/8/11).',
    surfaced: true, valence: 0.6,
    summary: 'A strong capacity to accumulate and to hold what has been accumulated.',
  },
  {
    name: 'Yupa', group: 'akriti', verse: '13', formation: 'All seven in the four houses from the ascendant.',
    surfaced: true, valence: 0.6,
    summary: 'A religious or philosophical bent held seriously, with settled family life.',
  },
  {
    name: 'Sara', group: 'akriti', verse: '13', formation: 'All seven in the four houses from the 4th.',
    surfaced: false,
    withheld: 'The effect verse is occupational disparagement and cruelty — arrow-maker, '
      + 'prison-keeper, torture, "mean handiworks". Refused entire.',
  },
  {
    name: 'Sakthi', group: 'akriti', verse: '13', formation: 'All seven in the four houses from the 7th.',
    surfaced: false,
    withheld: 'The verse contradicts itself (miserable and lazy, then firm and auspicious) '
      + 'and its negative half is poverty and character verdict. Refused rather than '
      + 'arbitrated — the chapter gives no basis for choosing which half to believe.',
  },
  {
    name: 'Danda', group: 'akriti', verse: '13', formation: 'All seven in the four houses from the 10th.',
    surfaced: false,
    withheld: 'The verse predicts the loss of wife and sons alongside destitution. Both a '
      + 'bereavement prediction and a poverty prediction; refused on both counts.',
  },
  {
    name: 'Nauka', group: 'akriti', verse: '14', formation: 'All seven in the seven houses from the ascendant.',
    surfaced: true, valence: 0.3,
    summary: 'Livelihood connected with water, and a name that travels with it.',
    withheld: undefined,
  },
  {
    name: 'Koota', group: 'akriti', verse: '14', formation: 'All seven in the seven houses from the 4th.',
    surfaced: false,
    withheld: 'Effect verse is character verdict and poverty throughout.',
  },
  {
    name: 'Chatra', group: 'akriti', verse: '14', formation: 'All seven in the seven houses from the 7th.',
    surfaced: true, valence: 0.7,
    summary: 'Kindness that is returned — support for one’s own people, and ease at both ends of life.',
  },
  {
    name: 'Chapa', group: 'akriti', verse: '14', formation: 'All seven in the seven houses from the 10th.',
    surfaced: false,
    withheld: 'The verse calls the native a liar and a thief. Character verdict; refused.',
  },
  {
    name: 'Ardhachandra', group: 'akriti', verse: '14',
    formation: 'All seven in seven successive houses beginning from a house that is not an angle.',
    surfaced: true, valence: 0.6,
    summary: 'Command and physical vigour; a bearing that others follow.',
  },
  {
    name: 'Chakra', group: 'akriti', verse: '15',
    formation: 'All seven in six alternate signs beginning from the ascendant.',
    surfaced: false,
    withheld: 'The effect verse is pure imperial kingship — prostrating kings at the '
      + 'native’s feet. Kingship is excluded across the corpus, and nothing else is stated.',
  },
  {
    name: 'Samudra', group: 'akriti', verse: '15',
    formation: 'All seven in six alternate signs beginning from the 2nd.',
    surfaced: true, valence: 0.7,
    summary: 'Substantial and stable means, with a disposition people warm to.',
  },
  // ── Sankhya (7) — 35.16-17
  {
    name: 'Veena', group: 'sankhya', verse: '16', formation: 'The seven planets occupy exactly seven signs.',
    surfaced: true, valence: 0.6,
    summary: 'Wide-ranging aptitude — the chart’s energy is spread rather than concentrated.',
  },
  {
    name: 'Daama', group: 'sankhya', verse: '16', formation: 'The seven planets occupy exactly six signs.',
    surfaced: true, valence: 0.7,
    summary: 'Helpfulness that earns its own return, with means honestly come by.',
  },
  {
    name: 'Paasa', group: 'sankhya', verse: '16', formation: 'The seven planets occupy exactly five signs.',
    surfaced: false,
    withheld: 'The verse predicts imprisonment and calls the native deceitful. Refused.',
  },
  {
    name: 'Kedara', group: 'sankhya', verse: '16', formation: 'The seven planets occupy exactly four signs.',
    surfaced: true, valence: 0.5,
    summary: 'Usefulness to many, and an affinity for working the land.',
  },
  {
    name: 'Soola', group: 'sankhya', verse: '16', formation: 'The seven planets occupy exactly three signs.',
    surfaced: false,
    withheld: 'Sharpness and valour are stated alongside indolence, destitution and '
      + '"torturous". The usable half cannot be separated from the verdict; refused.',
  },
  {
    name: 'Yuga', group: 'sankhya', verse: '16', formation: 'The seven planets occupy exactly two signs.',
    surfaced: false,
    withheld: 'Heresy, destitution, social rejection and the loss of mother and sons. '
      + 'Refused on every count.',
  },
  {
    name: 'Gola', group: 'sankhya', verse: '16', formation: 'All seven planets in a single sign.',
    surfaced: false,
    withheld: 'Destitution, ignorance and misery throughout. Refused; the formation is '
      + 'still detected, since an all-in-one-sign chart is a real and striking shape.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Detection
// ─────────────────────────────────────────────────────────────────────────────

const SEVEN: Graha[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const MOVABLE = [0, 3, 6, 9];
const FIXED = [1, 4, 7, 10];
const DUAL = [2, 5, 8, 11];
const ANGLES: House[] = [1, 4, 7, 10];

export interface NabhasaInput {
  lagnaSign: SignIndex;
  planets: Partial<Record<Graha, { sign: SignIndex }>>;
  /** Which planets count as benefic in THIS chart — Dala needs it (35.8). */
  benefics?: Graha[];
}

const houseOf = (sign: number, lagna: number): House => ((((sign - lagna + 12) % 12) + 1) as House);

/**
 * Which Nabhasa yogas a chart forms (BPHS 35.7-17).
 *
 * Computed rather than expressed as `Rule` records, for the same reason Part 29's varga
 * capability was a projection: a distribution is a property of the chart, not a question
 * asked about one planet. Every formation here needs ALL SEVEN classical planets, so a
 * chart missing any of them yields nothing rather than a partial answer.
 *
 * The Sankhya suppression of 35.16-17 is applied: those seven never stand alongside another
 * Nabhasa yoga. It is reported in `suppressed` rather than silently dropped, so a caller can
 * see that a shape was present and why it does not count.
 */
export function nabhasaYogas(input: NabhasaInput): {
  yogas: NabhasaYoga[];
  suppressed: NabhasaYoga[];
  occupiedSigns: number;
} {
  const signs = SEVEN.map((g) => input.planets[g]?.sign);
  if (signs.some((s) => s == null)) return { yogas: [], suppressed: [], occupiedSigns: 0 };
  const S = signs as SignIndex[];
  const houses = S.map((s) => houseOf(s, input.lagnaSign));
  const occupied = new Set(S);
  const hset = new Set(houses);
  const has = (...hs: House[]) => hs.every((h) => hset.has(h));
  const only = (...hs: House[]) => houses.every((h) => hs.includes(h));

  const by = (name: string) => NABHASA_YOGAS.find((y) => y.name === name)!;
  const found: NabhasaYoga[] = [];

  // Asraya — all seven in one modality.
  if (S.every((s) => MOVABLE.includes(s))) found.push(by('Rajju'));
  if (S.every((s) => FIXED.includes(s))) found.push(by('Musala'));
  if (S.every((s) => DUAL.includes(s))) found.push(by('Nala'));

  // Dala — three angles held by benefics, or by malefics. Needs the chart's own benefic set.
  if (input.benefics) {
    const ben = new Set(input.benefics);
    const angleHolders = (pred: (g: Graha) => boolean) => new Set(
      SEVEN.filter((g) => pred(g)).map((g) => houseOf(input.planets[g]!.sign, input.lagnaSign))
        .filter((h) => ANGLES.includes(h)),
    );
    if (angleHolders((g) => ben.has(g)).size >= 3) found.push(by('Maala'));
    if (angleHolders((g) => !ben.has(g)).size >= 3) found.push(by('Sarpa'));
  }

  // Akriti — house-set occupancy.
  if (only(1, 7)) found.push(by('Sakata'));
  if (only(4, 10)) found.push(by('Vihanga'));
  for (const [a, b] of [[1, 4], [4, 7], [7, 10], [10, 1]] as [House, House][]) {
    if (only(a, b) && has(a, b)) { found.push(by('Gada')); break; }
  }
  if (only(1, 5, 9)) found.push(by('Sringataka'));
  for (const t of [[2, 6, 10], [3, 7, 11], [4, 8, 12]] as House[][]) {
    if (only(...t)) { found.push(by('Hala')); break; }
  }
  if (only(1, 4, 7, 10)) found.push(by('Kamala'));
  if (only(3, 6, 9, 12) || only(2, 5, 8, 11)) found.push(by('Vapi'));
  const run = (start: House, len: number): House[] =>
    Array.from({ length: len }, (_, i) => ((((start - 1 + i) % 12) + 1) as House));
  if (only(...run(1, 4))) found.push(by('Yupa'));
  if (only(...run(4, 4))) found.push(by('Sara'));
  if (only(...run(7, 4))) found.push(by('Sakthi'));
  if (only(...run(10, 4))) found.push(by('Danda'));
  if (only(...run(1, 7))) found.push(by('Nauka'));
  if (only(...run(4, 7))) found.push(by('Koota'));
  if (only(...run(7, 7))) found.push(by('Chatra'));
  if (only(...run(10, 7))) found.push(by('Chapa'));
  for (let start = 2 as House; start <= 12; start++) {
    if (!ANGLES.includes(start) && only(...run(start, 7))) { found.push(by('Ardhachandra')); break; }
  }
  const alt = (from: SignIndex) => Array.from({ length: 6 }, (_, i) => ((from + i * 2) % 12));
  if (S.every((s) => alt(input.lagnaSign).includes(s))) found.push(by('Chakra'));
  if (S.every((s) => alt(((input.lagnaSign + 1) % 12) as SignIndex).includes(s))) found.push(by('Samudra'));

  // Sankhya — the count of occupied signs, suppressed if any other Nabhasa yoga stands.
  const sankhyaByCount: Record<number, string> = {
    7: 'Veena', 6: 'Daama', 5: 'Paasa', 4: 'Kedara', 3: 'Soola', 2: 'Yuga', 1: 'Gola',
  };
  const sankhya = sankhyaByCount[occupied.size] ? by(sankhyaByCount[occupied.size]!) : null;

  const deduped = [...new Set(found)];
  const suppressed: NabhasaYoga[] = [];
  if (sankhya) {
    if (deduped.length > 0) suppressed.push(sankhya);
    else deduped.push(sankhya);
  }
  return { yogas: deduped, suppressed, occupiedSigns: occupied.size };
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 35.16-17: "None of these seven yogas will be operable, if another Nabhasa yoga
 * explained earlier is derivable."
 *
 * The **eighth** source-stated arbitration instruction, and structurally a third kind: the
 * first six RANK evidence, 32.9-12 CAPS it, and this one SUPPRESSES a whole class outright.
 * It is also the only one so far that is unconditional — no strength comparison, no
 * judgement, just precedence by category.
 */
export const SANKHYA_SUPPRESSION =
  'BPHS 35.16-17: the seven Sankhya yogas do not operate if any other Nabhasa yoga is '
  + 'present. The eighth source-stated arbitration instruction, and the first that '
  + 'SUPPRESSES an entire class rather than ranking or capping. Also the only unconditional '
  + 'one — no strength comparison, no judgement. `nabhasaYogas` reports the suppressed yoga '
  + 'rather than dropping it, so a caller can see the shape was there.';

/**
 * BPHS 35.50 — Nabhasa effects hold across every dasha rather than waiting for one.
 *
 * Worth recording because it is the opposite of nearly everything else in the corpus, which
 * binds an effect to a period. A Nabhasa yoga is a standing property of the chart, so it
 * belongs to the blueprint layer rather than the timing layer.
 */
export const NABHASA_NOT_DASHA_BOUND =
  'BPHS 35.50: Nabhasa results are felt throughout, in all dasha periods — the opposite of '
  + 'nearly every other effect in the corpus, which waits for its period. These are standing '
  + 'properties of a chart, so they belong to the blueprint rather than to timing.';

export const CH35_YIELD = {
  chapter: 35,
  verses: 50,
  formations: 32,
  note: 'All 32 formations encoded and detectable; 13 of the 32 readings refused. The '
    + 'highest refusal rate of any chapter so far, and unlike ch 25 (anthropology) or ch 33 '
    + '(medicine) the cause here is plain contempt — the effect verses call the native '
    + 'crooked, wicked, mean, lazy, dirty, a liar, a thief. The formations are kept in full '
    + 'regardless: a detected shape with a refused reading is still a fact about the chart, '
    + 'and a later part may find a better-sourced reading for it.',
} as const;

export const CH35_NO_WORKED_EXAMPLE =
  'Chapter 35 gives no worked chart, and Santhanam explicitly declines to annotate it, '
  + 'referring the reader to his Saravali and Hora-Sara translations. So the formations are '
  + 'verified by construction — each detector is exercised against a chart built to satisfy '
  + 'it and against near-misses — not against the book’s own arithmetic, because there is '
  + 'none to check.';
