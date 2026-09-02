// BPHS Programme Part 37 — Chapter 46d: the Kalachakra gatis, the rasi dashas, and the
// selection capability the programme has been calling its crown jewel.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE PROGRAMME PLAN WAS WRONG ABOUT WHERE ITS CROWN JEWEL LIVES
// ─────────────────────────────────────────────────────────────────────────────
//
// BPHS_PROGRAMME §9 assigned Part 37 "dasha applicability rules — the crown jewel of the
// whole book", at lines 23000-24768. Those lines were read in full. **They contain no
// selection or precedence rules at all.** They contain the tail of Kalachakra (the three
// gatis, their effects, directional readings, Deha/Jeeva affliction) and then eight rasi
// dashas with their commencement rules.
//
// The applicability conditions are at **46.17-43** — inside the range Part 35 covered — and
// Part 35 extracted all nine of them into `NAKSHATRA_DASHA_SYSTEMS`. The crown jewel was
// delivered two parts early without anyone noticing, because the plan named the wrong
// chapter section for it.
//
// So this part does two things: encodes what 46d actually contains, and **builds the
// capability the plan was reaching for** — `selectDashaSystem`, which arbitrates Part 35's
// conditions. The verses for it live in 46b; the capability is what matters.

import type { Graha, House, SignIndex } from '../../types.js';
import { NAKSHATRA_DASHA_SYSTEMS } from './ch46b.js';
import type { NakshatraDashaSystem } from './ch46b.js';

export const CH46D_HAS_NO_SELECTION_RULES =
  'BPHS_PROGRAMME §9 placed the "dasha applicability rules — the crown jewel" at lines '
  + '23000-24768 (46d). Those lines contain NO selection or precedence rules: they hold the '
  + 'tail of Kalachakra and eight rasi dashas. The applicability conditions are at 46.17-43, '
  + 'which **Part 35 already extracted** into NAKSHATRA_DASHA_SYSTEMS. The plan named the '
  + 'wrong section; the capability was delivered two parts early. Recorded so the programme '
  + 'table can be corrected rather than the discrepancy being rediscovered later.';

// ─────────────────────────────────────────────────────────────────────────────
// THE SELECTION CAPABILITY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The facts a selection needs. Deliberately narrow: every field here is something a chart
 * already carries, and nothing is invented to make a condition checkable.
 */
export interface DashaSelectionFacts {
  lagnaSign: SignIndex;
  /** Sign each planet occupies. */
  planets: Partial<Record<Graha, SignIndex>>;
  /** House each planet occupies, counted from the natal ascendant. */
  houses?: Partial<Record<Graha, House>>;
  /** The navamsa sign of the ascendant — needed for vargottama and Venus-navamsa. */
  navamsaLagna?: SignIndex;
  /** The dwadasamsa (D-12) sign of the ascendant — needed for Panchottari. */
  dwadasamsaLagna?: SignIndex;
  /** Which luminary's hora the ascendant falls in. */
  lagnaHora?: 'sun' | 'moon';
  paksha?: 'shukla' | 'krishna';
  birth?: 'day' | 'night';
}

export interface DashaSelection {
  system: string;
  /** Which of the system's conditions held. */
  metVerses: string[];
  /** Our estimated share of charts satisfying it — see SPECIFICITY_RANKING_IS_OURS. */
  estimatedShare: number;
}

/**
 * **Our estimated share of charts satisfying each system's condition.**
 *
 * These are geometric estimates under a uniform-placement assumption, computed the same way
 * the calibration base rates are (Part 19) and carrying the same caveat: real charts are not
 * uniform, so these separate "one chart in a hundred" from "one in three" and are not
 * probabilities to quote.
 *
 * Worked, so the numbers can be argued with rather than trusted:
 *   Panchottari   Cancer lagna (1/12) AND Cancer dwadasamsa (1/12)          ≈ 0.007
 *   Chaturashiti  the 10th lord in the 10th (1/12)                          ≈ 0.083
 *   Shastihayani  the Sun in the ascendant (1/12)                           ≈ 0.083
 *   Shatabdika    a vargottama ascendant (1/9)                              ≈ 0.111
 *   Dwadashottari lagna in a Venus navamsa (2 of 12 signs)                   ≈ 0.167
 *   Dwisaptati    lagna lord in the 1st or 7th (2/12)                        ≈ 0.167
 *   Shodasottari  hora (1/2) × paksha (1/2), either of two pairings          ≈ 0.5
 *   Shat-trimsat  hora (1/2) × day/night (1/2), either of two pairings       ≈ 0.5
 *   Ashtottari    two alternative conditions, each roughly even             ≈ 0.6
 */
export const ESTIMATED_SHARE: Record<string, number> = {
  Panchottari: 0.007,
  'Chaturashiti sama': 0.083,
  Shastihayani: 0.083,
  Shatabdika: 0.111,
  Dwadashottari: 0.167,
  'Dwisaptati sama': 0.167,
  Shodasottari: 0.5,
  'Shat-trimsat sama': 0.5,
  Ashtottari: 0.6,
};

/**
 * **BPHS gives no precedence among these systems, so the ordering here is OURS.**
 *
 * The chapter states nine conditions and never says what to do when a chart meets several —
 * and charts routinely do, since "the Sun in the ascendant" and "a vargottama ascendant" are
 * independent. Something has to break the tie, and inventing a doctrinal one would be
 * attributing a rule to Parashara that is not there.
 *
 * So the tie is broken by **specificity**, which is the principle the programme already runs
 * on: `arity` ranks a six-condition rule above a one-condition rule, and the base-rate gate
 * suppresses anything true of a third of humanity. A condition satisfied by one chart in a
 * hundred says more than one satisfied by half of them. Same idea, applied one level up.
 *
 * That is a defensible choice and it is still a choice. It is labelled, the estimates are
 * shown, and `selectDashaSystem` returns **every** applicable system rather than only the
 * winner, so a caller who disagrees with the ordering still has the full set.
 */
export const SPECIFICITY_RANKING_IS_OURS =
  'BPHS 46 states nine applicability conditions and NEVER says what to do when a chart meets '
  + 'several — and charts routinely do, since the conditions are independent. The ordering '
  + 'here is OURS: most specific first, measured by the estimated share of charts satisfying '
  + 'the condition. That reuses the programme’s own principle (arity ranks specific rules '
  + 'above general ones; the base-rate gate suppresses what is true of everyone) rather than '
  + 'inventing a doctrinal precedence Parashara does not give. The shares are geometric '
  + 'estimates under uniform placement — good for separating one-in-a-hundred from one-in-two, '
  + 'not probabilities to quote. `selectDashaSystem` returns EVERY applicable system, not just '
  + 'the winner, so a caller who rejects the ordering still has the full set.';

const KENDRA_TRIKONA: House[] = [1, 4, 5, 7, 9, 10];
const LORD_OF: Graha[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
  'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
const lordOf = (sign: number): Graha => LORD_OF[((sign % 12) + 12) % 12]!;
const houseOf = (sign: number, lagna: number): House => ((((sign - lagna + 12) % 12) + 1) as House);

/** Venus's two signs — Taurus and Libra. */
const VENUS_SIGNS = [1, 6];

/**
 * Which of BPHS's nine conditional dasha systems a chart qualifies for.
 *
 * Returns every system whose condition holds, most specific first. Vimshottari is **not**
 * included: 46.2-5 makes it the default for everyone rather than a conditional system, so it
 * applies whether or not anything else does.
 *
 * A condition whose facts are absent is **not** treated as satisfied. A chart with no
 * `paksha` simply does not qualify under a paksha rule — silence, not a guess, the same rule
 * the predicate engine follows.
 */
export function selectDashaSystem(f: DashaSelectionFacts): DashaSelection[] {
  const out: DashaSelection[] = [];
  const add = (system: string, verse: string) => {
    const found = out.find((x) => x.system === system);
    if (found) found.metVerses.push(verse);
    else out.push({ system, metVerses: [verse], estimatedShare: ESTIMATED_SHARE[system] ?? 1 });
  };

  const lagnaLord = lordOf(f.lagnaSign);
  const houseOfGraha = (g: Graha): House | undefined => {
    if (f.houses?.[g] != null) return f.houses[g];
    const s = f.planets[g];
    return s == null ? undefined : houseOf(s, f.lagnaSign);
  };

  // Ashtottari (46.17-20): Rahu NOT in the lagna, but in a kendra/trikona from the lagna lord.
  const rahuSign = f.planets.rahu;
  const lordSign = f.planets[lagnaLord];
  if (rahuSign != null && lordSign != null) {
    const rahuHouse = houseOf(rahuSign, f.lagnaSign);
    const fromLord = houseOf(rahuSign, lordSign);
    if (rahuHouse !== 1 && KENDRA_TRIKONA.includes(fromLord)) add('Ashtottari', '17-20');
  }
  // Ashtottari (46.23): day birth in Krishna Paksha, or night birth in Shukla Paksha.
  if (f.birth && f.paksha
    && ((f.birth === 'day' && f.paksha === 'krishna') || (f.birth === 'night' && f.paksha === 'shukla'))) {
    add('Ashtottari', '23');
  }

  // Shodasottari (46.24-26): Moon's hora + Krishna, or Sun's hora + Shukla.
  if (f.lagnaHora && f.paksha
    && ((f.lagnaHora === 'moon' && f.paksha === 'krishna') || (f.lagnaHora === 'sun' && f.paksha === 'shukla'))) {
    add('Shodasottari', '24-26');
  }

  // Dwadashottari (46.27-28): the ascendant in a navamsa of Venus.
  if (f.navamsaLagna != null && VENUS_SIGNS.includes(f.navamsaLagna)) add('Dwadashottari', '27-28');

  // Panchottari (46.29-31): Cancer ascendant AND Cancer dwadasamsa.
  if (f.lagnaSign === 3 && f.dwadasamsaLagna === 3) add('Panchottari', '29-31');

  // Shatabdika (46.32-34): a vargottama ascendant.
  if (f.navamsaLagna != null && f.navamsaLagna === f.lagnaSign) add('Shatabdika', '32-34');

  // Chaturashiti sama (46.35-36): the 10th lord in the 10th.
  const tenthLord = lordOf(f.lagnaSign + 9);
  if (houseOfGraha(tenthLord) === 10) add('Chaturashiti sama', '35-36');

  // Dwisaptati sama (46.37-39): the ascendant lord in the 1st or the 7th.
  const lh = houseOfGraha(lagnaLord);
  if (lh === 1 || lh === 7) add('Dwisaptati sama', '37-39');

  // Shastihayani (46.40-41): the Sun in the ascendant.
  if (houseOfGraha('sun') === 1) add('Shastihayani', '40-41');

  // Shat-trimsat sama (46.42-43): day + Sun's hora, or night + Moon's hora.
  if (f.birth && f.lagnaHora
    && ((f.birth === 'day' && f.lagnaHora === 'sun') || (f.birth === 'night' && f.lagnaHora === 'moon'))) {
    add('Shat-trimsat sama', '42-43');
  }

  return out.sort((a, b) => a.estimatedShare - b.estimatedShare);
}

/** The system record for a selection, so a caller gets years and lords without a second call. */
export function systemFor(name: string): NakshatraDashaSystem | undefined {
  return NAKSHATRA_DASHA_SYSTEMS.find((s) => s.name === name);
}

export const VIMSHOTTARI_IS_THE_DEFAULT_NOT_A_CANDIDATE =
  'BPHS 46.2-5 makes Vimshottari "the most appropriate for the general populace" — the '
  + 'default rather than one conditional option among ten. `selectDashaSystem` therefore '
  + 'never returns it: it applies whether or not anything else does, and listing it as a '
  + 'candidate would imply a chart could fail to qualify for it.';

// ─────────────────────────────────────────────────────────────────────────────
// 46.96-100 — the three gatis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The three kinds of movement between consecutive Kalachakra signs (46.96-100). Structural,
 * and the only part of the gati material that survives — their *effects* (46.101-111) are
 * almost entirely doom.
 */
export type Gati = 'mandooki' | 'markati' | 'simhavlokana';

export const GATI_DEFINITIONS: Record<Gati, string> = {
  mandooki: 'A frog’s leap — moving to a sign by jumping over one. The chapter’s examples: '
    + 'Virgo to Cancer, Leo to Gemini.',
  markati: 'A monkey’s step — moving backward to the previous sign. Its example: Leo to Cancer.',
  simhavlokana: 'A lion’s glance — moving to the 5th or 9th. Its examples: Pisces to Scorpio, '
    + 'Sagittarius to Aries.',
};

/** Classify the movement between two consecutive signs of a Kalachakra sequence. */
export function gatiBetween(from: SignIndex, to: SignIndex): Gati | null {
  const fwd = ((to - from) % 12 + 12) % 12;
  if (fwd === 10) return 'mandooki';       // back two = jumping over one
  if (fwd === 11) return 'markati';        // back one
  if (fwd === 4 || fwd === 8) return 'simhavlokana';
  return null;
}

export const GATI_EFFECTS_REFUSED =
  'BPHS 46.101-111 gives each gati an effect, and they are almost entirely doom: "death of '
  + 'the mother or self", "brain fever", "drowning in a well", "loss of children", "premature '
  + 'death". Refused in full. The gatis themselves are kept because they are a structural '
  + 'property of the Kalachakra sequence — a real fact about how a chart’s dasha moves — and '
  + 'a later part or a cleaner source may find a reading worth surfacing.';

/**
 * 46.112-119 — the one part of the gati material that IS usable: direction.
 *
 * "If the movement be from Virgo to Cancer, good results are realised in places located in
 * the East and at that time journeys to the places in the North prove fruitful. Unfavourable
 * effects will be felt in places located in the West and the South."
 *
 * A directional reading tied to a dasha period is genuinely actionable and carries no doom,
 * so it is kept where the chapter states it plainly.
 */
export const GATI_DIRECTION_IS_USABLE =
  'BPHS 46.112-119 attaches DIRECTIONS to the gatis — favourable and unfavourable places and '
  + 'journey directions during those signs’ dashas. That is actionable and doom-free, and it '
  + 'is the one part of 46.101-119 kept. It also pairs with the dig-bala direction reading '
  + '(ch 3.35-38), giving two independent methods on "where should I go".';

// ─────────────────────────────────────────────────────────────────────────────
// The rasi dashas of 46.179-203
// ─────────────────────────────────────────────────────────────────────────────

export interface RasiDashaSystem {
  name: string;
  verse: string;
  /** Where the sequence begins. */
  commencement: string;
  surfaced: boolean;
  withheld?: string;
}

export const RASI_DASHA_SYSTEMS: RasiDashaSystem[] = [
  {
    name: 'Mandooka', verse: '179-180', surfaced: true,
    commencement: 'From the ascendant or the 7th, whichever is STRONGER. From an odd sign the '
      + 'run takes three movable, then three fixed signs; reversed from an even one.',
  },
  {
    name: 'Shoola', verse: '181-182', surfaced: false,
    commencement: 'From the 2nd or the 8th, whichever is stronger.',
    withheld: 'The chapter states its purpose outright — "designed for determining the time '
      + 'of death". A dasha system whose stated function is timing death is Part 51 material '
      + 'and is not surfaced, however its arithmetic behaves.',
  },
  {
    name: 'Trikona', verse: '183-184', surfaced: true,
    commencement: 'From the STRONGEST of the trines to the ascendant (1st, 5th, 9th).',
  },
  {
    name: 'Dirga', verse: '185-187', surfaced: true,
    commencement: 'A stated sign order rather than a strength test.',
  },
  {
    name: 'Lagnadi Rashi', verse: '188-189', surfaced: true,
    commencement: 'All twelve signs run within every nakshatra — the Bhayat is multiplied by '
      + '12 and divided down, so the whole zodiac cycles inside one nakshatra’s span.',
  },
  {
    name: 'Panchswara', verse: '191-194', surfaced: true,
    commencement: 'Built from the five swaras and the varnas — a SOUND-based system keyed to '
      + 'letters rather than to a planet or sign.',
  },
  {
    name: 'Yogini', verse: '195-199', surfaced: true,
    commencement: 'Eight yoginis, attributed in the chapter to Lord Mahadeva rather than to '
      + 'Parashara’s own reckoning.',
  },
  {
    name: 'Pinda / Amsa / Nisarga', verse: '200-203', surfaced: false,
    commencement: 'Identical to Pindayu, Amsayu and Nisargayu.',
    withheld: 'These three ARE the longevity computations under another name — the chapter '
      + 'says so directly. Part 51 owns them; nothing before it surfaces a lifespan.',
  },
];

export const TWO_RASI_DASHAS_ARE_LONGEVITY =
  'Two of the eight rasi dashas in 46.179-203 are longevity systems and are not surfaced. '
  + 'Shoola is stated to be "designed for determining the time of death"; Pinda, Amsa and '
  + 'Nisarga are said outright to be Pindayu, Amsayu and Nisargayu under other names. Neither '
  + 'is refused for its arithmetic — both are refused because their stated PURPOSE is the one '
  + 'thing this corpus computes and never surfaces.';

export const DEHA_JEEVA_AFFLICTION_REFUSED =
  'BPHS 46.123-128 reads malefics on the Deha and Jeeva signs and returns almost nothing but '
  + 'death: "the native will die", "premature death", "definite death", plus a table of which '
  + 'planet kills by which means. Refused in full. It is the densest block of mortality claims '
  + 'in the corpus outside the chapters Part 51 owns.';

export const CH46D_YIELD = {
  chapter: 46,
  part: '46d',
  newRules: 0,
  note: 'The part that found the programme plan had mislocated its own crown jewel: 46d holds '
    + 'no selection rules, and the applicability conditions Part 35 extracted from 46.17-43 '
    + 'were always the answer. So this part built the capability instead — `selectDashaSystem` '
    + 'over Part 35’s structured conditions, ranked by a specificity measure that is OURS and '
    + 'labelled as such. Of 46d’s own content, the gatis and their directional readings are '
    + 'kept; the gati effects, the Deha/Jeeva block and two of the eight rasi dashas are '
    + 'refused, the last two because their stated purpose is timing death.',
} as const;
