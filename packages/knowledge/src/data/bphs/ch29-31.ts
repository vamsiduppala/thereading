// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 29, 30 and 31 — Programme Part 12, second half.
//   Ch 29 — Bhava Padas (arudhas), lines 13730-14134, verses 1-37
//   Ch 30 — Upa Pada, lines 14134-14337, verses 1-25
//   Ch 31 — Argala (planetary intervention), lines 14337-14496, verses 1-18
//
// This is the Jaimini layer. Santhanam's own note says chapters 29-33 are the seed
// Jaimini later grew, which is why the vocabulary changes here: padas rather than
// bhavas, rasi relationships rather than graded aspects.
//
// Two of the three chapters turned out to be VERIFICATION rather than new capability —
// `arudhaOf` and the argala tables in the first corpus reproduce every example these
// chapters give. What is genuinely new is the arbitration: BPHS says an argala PREVAILS
// or FAILS depending on strength and count, and Parts 9-11 have only just made "stronger"
// a computable claim.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, SignIndex, House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;

// ═════════════════════════════════════════════════════════════════════════════
// Chapter 29 — Bhava Padas
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The pada of a bhava (29.2-5), re-derived from the verses.
 *
 * Count from the bhava's sign to its lord's sign; count on that many again from the
 * lord. Two exceptions follow in 29.4-5, and both are the same move — take the 10th from
 * a pada that landed somewhere forbidden.
 *
 * This deliberately reimplements `arudhaOf` (first corpus) rather than calling it, for
 * the same reason Part 6 reimplemented rasi drishti: an independent construction from the
 * verses is a real cross-check, and the test asserts the two agree for all 144 sign pairs.
 * **`arudhaOf` remains the one callers should use.**
 */
export function bhavaPada(houseSign: SignIndex, lordSign: SignIndex): SignIndex {
  const hs = mod12(houseSign);
  const ls = mod12(lordSign);
  const distance = mod12(ls - hs);              // 0-based signs from bhava to lord
  let pada = mod12(ls + distance);              // the same distance again
  const fromHouse = mod12(pada - hs);
  if (fromHouse === 0 || fromHouse === 6) pada = mod12(pada + 9);
  return pada;
}

/**
 * 29.4-5 in the Sanskrit: *turya-sthite nathe turyam eva padam bhavet, saptame cha
 * sthite nathe vijneyam dasamam padam* — "when the lord stands in the fourth, the fourth
 * itself is the pada; when the lord stands in the seventh, know the tenth as the pada."
 *
 * **CONFLICT, resolved to the root verse.** Santhanam's note 2 works the seventh case to
 * the *fourth* from the bhava (Aquarius lagna, Saturn in Leo, he reaches Taurus). That
 * contradicts the Sanskrit he prints immediately above it, and it also requires the
 * provisional pada to land in the 7th when the construction puts it in the 1st. Counting
 * plainly: lord in the 7th means the pada falls on the bhava ITSELF, so the same-house
 * exception fires and the 10th is taken — Scorpio, not Taurus.
 *
 * The existing `arudhaOf` already does this. Ledger `bphs.29.005`.
 */
export const PADA_EXCEPTION_RULE =
  'A pada may not fall on its own bhava or the 7th from it. In either case take the 10th '
  + 'from where it fell. Lord in the 4th resolves to the lord’s own sign, and lord in the '
  + '7th resolves to the 10th from the bhava — the Sanskrit of 29.5, not the English note.';

/** The book's own names for the twelve padas (29, table before verse 4). */
export const PADA_NAMES: Record<House, string> = {
  1: 'Lagna Pada', 2: 'Dhana Pada', 3: 'Vikrama Pada', 4: 'Matru Pada',
  5: 'Mantra Pada', 6: 'Roga Pada', 7: 'Dara Pada', 8: 'Marana Pada',
  9: 'Pitru Pada', 10: 'Karma Pada', 11: 'Labha Pada', 12: 'Vyaya Pada',
};

/**
 * The pada of a planet (29.6-7): count from the planet to its own sign, then on again.
 *
 * Structurally identical to the bhava pada with the roles swapped, so the exceptions of
 * 29.4-5 apply here too. 29.7 adds that where a planet owns two signs, or a sign has two
 * owners, the STRONGER is used — which is a Shadbala call, and Part 11 supplies it.
 */
export const grahaPada = (planetSign: SignIndex, ownSign: SignIndex): SignIndex =>
  bhavaPada(planetSign, ownSign);

export const GRAHA_PADA_STRENGTH_NOTE =
  'BPHS 29.7: where a planet owns two signs, or a sign has two owners (Rahu co-ruling '
  + 'Aquarius, Ketu co-ruling Scorpio), take the STRONGER. That is a Shadbala comparison '
  + '(27.32-36), so the caller must supply the choice — it is chart-specific.';

/** How one pada stands to another — the relation 29.30-37 predicts from. */
export type PadaRelation = 'same' | 'kendra' | 'trikona' | 'dusthana' | 'upachaya' | 'other';

/**
 * Where one pada falls relative to another (29.30-37).
 *
 * The chapter's marital and financial rules are all of the form "if the Dara Pada is
 * angular or trinal from the Lagna Pada, then X; if it is 6th, 8th or 12th, then not-X".
 * That is a single relation worth computing once. Order matters: `dusthana` is checked
 * before `upachaya` because the 6th and 11th are both upachayas and the 6th is a dusthana,
 * and the chapter treats the 6th as bad in every one of these rules.
 */
export function padaRelation(fromSign: SignIndex, toSign: SignIndex): PadaRelation {
  const h = mod12(toSign - fromSign) + 1;
  if (h === 1) return 'same';
  if (h === 6 || h === 8 || h === 12) return 'dusthana';
  if (h === 4 || h === 7 || h === 10) return 'kendra';
  if (h === 5 || h === 9) return 'trikona';
  if (h === 3 || h === 11) return 'upachaya';
  return 'other';
}

/**
 * The two houses from the Lagna Pada that the chapter spends most of its length on
 * (29.8-22): the 11th for gains, the 12th for outgoings.
 *
 * 29.12 is the sharpest rule in the chapter and the one worth carrying: gains are
 * *uninterrupted* when the 11th from the Lagna Pada is aspected and the 12th is NOT. The
 * useful claim is about the pair, not either house alone.
 */
export const PADA_GAIN_HOUSE = 11 as const;
export const PADA_LOSS_HOUSE = 12 as const;

/** 29.13: the quantum of gain tracks the NUMBER of planets in or aspecting the 11th. */
export function padaGainMagnitude(planetsOnEleventh: number): 'none' | 'limited' | 'medium' | 'great' {
  if (planetsOnEleventh <= 0) return 'none';
  if (planetsOnEleventh === 1) return 'limited';
  if (planetsOnEleventh === 2) return 'medium';
  return 'great';
}

/**
 * 29.8-11: the MEANS by which wealth arrives, from the nature of what touches the 11th
 * from the Lagna Pada.
 *
 * Encoded because it is one of the few places BPHS distinguishes *how* something comes
 * rather than *whether*. Phrased in our own words and without moral judgement of the
 * native — the text's "questionable means" is recorded as unconventional or irregular.
 */
export function gainMeans(benefic: boolean, malefic: boolean): string {
  if (benefic && malefic) return 'both conventional and irregular channels';
  if (benefic) return 'conventional, well-regarded channels';
  if (malefic) return 'irregular or unconventional channels';
  return 'no clear channel indicated';
}

/**
 * The chapter's rules that survive as `Rule` records.
 *
 * 29.23-28 attaches bodily and financial claims to the 7th and 2nd from the Lagna Pada.
 * The financial ones are encoded; the bodily ones are catalogued in
 * `CH29_31_UNSURFACED` and never surfaced, per the standing policy.
 */
export function padaWealthRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 29, verse });
  return [
    {
      id: 'bphs.29.008.gains-from-eleventh',
      source: src('8-11'),
      when: [{ k: 'placement', graha: 'jupiter', house: PADA_GAIN_HOUSE, from: 'arudha' }],
      effect: {
        id: 'pada.gains.supported',
        domain: 'gains',
        valence: 0.6,
        summary: 'Income is supported and arrives through conventional channels.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'Template for a benefic on the 11th from the Lagna Pada. Instantiated for '
        + 'Jupiter; the caller should generate one per planet its chart treats as benefic, '
        + 'since benefic status is chart-dependent (BPHS 3.11).',
    },
    {
      id: 'bphs.29.012.uninterrupted-gains',
      source: src('12'),
      when: [{ k: 'placement', graha: 'jupiter', house: PADA_GAIN_HOUSE, from: 'arudha' }],
      unless: [{ k: 'placement', graha: 'saturn', house: PADA_LOSS_HOUSE, from: 'arudha' }],
      effect: {
        id: 'pada.gains.uninterrupted',
        domain: 'gains',
        valence: 0.7,
        summary: 'Income continues without interruption — what comes in is not immediately spent.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'The verse’s real claim is about the PAIR: the 11th from the Lagna Pada '
        + 'engaged and the 12th left alone. Modelled with `unless` so the cancellation is '
        + 'structural rather than folded into the condition.',
    },
    {
      id: 'bphs.29.030.dara-pada-harmony',
      source: src('30-37'),
      when: [{ k: 'placement', graha: 'venus', house: 7, from: 'arudha' }],
      effect: {
        id: 'partnership.mutual-regard',
        domain: 'partnership',
        valence: 0.6,
        summary: 'The partnership is marked by mutual regard rather than friction.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'Template. The verse’s condition is a PADA RELATION — Dara Pada angular or '
        + 'trinal from the Lagna Pada — which no predicate kind expresses yet. Use '
        + '`padaRelation` directly until a pada-relation predicate exists. Listed in '
        + 'CH29_31_NOT_YET_EXPRESSIBLE.',
    },
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// Chapter 30 — Upa Pada
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Which house the Upapada is the pada OF. Two conventions, and BPHS is the reason there
 * are two.
 *
 * The root verse says the pada of the bhava *anuchara* — "following" the ascendant. That
 * one word carries the whole disagreement:
 *
 *   'twelfth'  — always the 12th house. Santhanam's own first reading, and what almost
 *                every modern implementation uses, including this codebase's `ARUDHA_NAMES`
 *                (UL = A12).
 *   'odd-even' — the 12th for an odd ascendant, the 2nd for an even one. The Chaukamba
 *                commentary's reading, which Santhanam says is "more sound" and which
 *                **his own worked example follows**: Scorpio ascendant (even) takes the
 *                pada of Sagittarius, the 2nd.
 *
 * The programme's standing rule is that a worked example beats a plain reading, and here
 * the worked example is unambiguous. But this is not a bug fix — it silently changes every
 * partnership reading for a native with an even ascendant, which is half of them. So the
 * default here follows the book, the alternative stays reachable, and the codebase's
 * existing A12 behaviour is untouched pending a product decision. Ledger `bphs.30.002`.
 */
export type UpapadaConvention = 'odd-even' | 'twelfth';

export function upapadaHouse(lagnaSign: SignIndex, convention: UpapadaConvention = 'odd-even'): House {
  if (convention === 'twelfth') return 12;
  return mod12(lagnaSign) % 2 === 0 ? 12 : 2;
}

/**
 * The Upapada sign (30.1-6). Takes the sign of the relevant house's lord, because which
 * house that is depends on the convention.
 */
export function upapada(
  lagnaSign: SignIndex, houseLordSign: SignIndex,
  convention: UpapadaConvention = 'odd-even',
): { house: House; sign: SignIndex } {
  const house = upapadaHouse(lagnaSign, convention);
  const houseSign = mod12(lagnaSign + (house - 1)) as SignIndex;
  return { house, sign: bhavaPada(houseSign, houseLordSign) };
}

export const UPAPADA_CONVENTION_CONFLICT =
  'BPHS 30.2 says the pada of the bhava "anuchara" (following) the ascendant. Santhanam '
  + 'reads that as the 12th, then endorses the Chaukamba reading — 12th for an odd '
  + 'ascendant, 2nd for an even one — and his worked example uses it (Scorpio lagna takes '
  + 'Sagittarius, the 2nd). We default to the worked example and keep both reachable. '
  + 'This codebase’s ARUDHA_NAMES still maps UL to the 12th unconditionally; changing that '
  + 'would alter half of all existing partnership readings and needs a product decision.';

/**
 * 30.6: the Sun is not counted a malefic for these rules when exalted or in a friendly or
 * own sign — only when debilitated or in an enemy's sign.
 *
 * A small verse with a large consequence: it makes malefic status DIGNITY-DEPENDENT rather
 * than fixed, which the `effectRatio` scalar (Part 1) does not model. Worth carrying into
 * every rule in this chapter that says "malefic".
 */
export function sunIsMaleficHere(dignity: string): boolean {
  return dignity === 'debilitated' || dignity === 'enemy' || dignity === 'great-enemy';
}

/**
 * The house the chapter actually predicts partnership from: the 2nd from the Upapada
 * (30.7-22). The Upapada itself sets the tone; the 2nd from it carries the detail.
 *
 * Recorded as a constant because it is easy to misread the chapter as being about the
 * Upapada alone — sixteen of its verses are about the house after it.
 */
export const UPAPADA_DETAIL_HOUSE = 2 as const;

export function upapadaRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 30, verse });
  return [
    {
      id: 'bphs.30.003.benefic-upapada',
      source: src('3-4'),
      when: [{ k: 'placement', graha: 'jupiter', house: 12, from: 'arudha' }],
      effect: {
        id: 'partnership.supported',
        domain: 'partnership',
        valence: 0.7,
        summary: 'Partnership and family life are well supported.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'Template for "a benefic conjunct or aspecting the Upapada". The house index '
        + 'assumes the twelfth convention; with `upapadaHouse` returning 2 for an even '
        + 'ascendant the caller must instantiate accordingly.',
    },
    {
      id: 'bphs.30.005.benefic-relief',
      source: src('5'),
      when: [{ k: 'placement', graha: 'saturn', house: 12, from: 'arudha' }],
      unless: [{ k: 'placement', graha: 'jupiter', house: 12, from: 'arudha' }],
      effect: {
        id: 'partnership.strained',
        domain: 'partnership',
        valence: -0.4,
        summary: 'Partnership takes longer to settle and asks more patience.',
      },
      weight: 0.4,
      verification: 'unverified',
      note: 'BPHS 30.5 states the antidote explicitly — a benefic aspect or conjunction '
        + 'means the deprivation "will not come to pass" — so the cancellation is `unless`, '
        + 'not a caveat in prose. The text’s own outcome here is severe; it is restated as '
        + 'a difficulty of timing and effort, per the standing policy on never predicting '
        + 'loss of a person.',
    },
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// Chapter 31 — Argala
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Argala houses and their obstructors (31.2-9), re-derived.
 *
 * 4th, 2nd and 11th intervene; 10th, 12th and 3rd obstruct, pairwise in that order. The
 * 5th is a further argala place obstructed by the 9th.
 *
 * **Both counted from the ORIGINAL house or planet**, never from the argala place —
 * 31's notes reject the alternative explicitly and cite gochara vedha as the parallel.
 * This reproduces `VIRODHARGALA` in the first corpus exactly, which the test asserts.
 */
export const ARGALA_PAIRS: { argala: number; obstructor: number }[] = [
  { argala: 4, obstructor: 10 },
  { argala: 2, obstructor: 12 },
  { argala: 11, obstructor: 3 },
  { argala: 5, obstructor: 9 },
];

export const ARGALA_COUNTED_FROM =
  'Both the argala house and its obstructor are counted from the ORIGINAL sign or planet, '
  + 'not from the argala place (BPHS 31 notes, which reject the alternative reading).';

/**
 * Vipareeta argala (31.2-9): three or more malefics in the 3rd — the house that would
 * normally OBSTRUCT the 11th's argala — reverse into an intervention that is itself
 * favourable and harmless.
 *
 * The one place in the argala material where a malefic crowd is good news, and exactly
 * the kind of clause a system that drops cancellations gets backwards.
 */
export const VIPAREETA_ARGALA_HOUSE = 3 as const;
export const VIPAREETA_ARGALA_MINIMUM = 3 as const;

export const vipareetaArgala = (maleficsInThird: number): boolean =>
  maleficsInThird >= VIPAREETA_ARGALA_MINIMUM;

/** 31.8: one intervening planet gives limited effect, two medium, more than two full. */
export function argalaGrade(count: number): 'none' | 'limited' | 'medium' | 'excellent' {
  if (count <= 0) return 'none';
  if (count === 1) return 'limited';
  if (count === 2) return 'medium';
  return 'excellent';
}

export interface ArgalaResolution {
  prevails: boolean;
  reason: string;
  grade: 'none' | 'limited' | 'medium' | 'excellent';
}

/**
 * Does an argala actually land (31.2-9)?
 *
 * BPHS gives two independent grounds and this is the part the first corpus never had:
 *   • the intervening planet is STRONGER than the obstructing one, or
 *   • the intervening planets OUTNUMBER the obstructing ones.
 *
 * "Stronger" only became computable in Part 11 (Shadbala Pinda and its thresholds), which
 * is why this arrives now rather than with the argala tables. Strengths are optional so a
 * caller without Shadbala still gets the count rule rather than nothing.
 */
export function resolveArgala(input: {
  argalaCount: number;
  obstructorCount: number;
  argalaStrength?: number;
  obstructorStrength?: number;
}): ArgalaResolution {
  const { argalaCount, obstructorCount, argalaStrength, obstructorStrength } = input;
  const grade = argalaGrade(argalaCount);
  if (argalaCount <= 0) {
    return { prevails: false, reason: 'no intervening planet', grade };
  }
  if (obstructorCount <= 0) {
    return { prevails: true, reason: 'unobstructed', grade };
  }
  if (argalaStrength != null && obstructorStrength != null && argalaStrength !== obstructorStrength) {
    return argalaStrength > obstructorStrength
      ? { prevails: true, reason: 'the intervening planet is stronger', grade }
      : { prevails: false, reason: 'the obstructing planet is stronger', grade };
  }
  if (argalaCount > obstructorCount) {
    return { prevails: true, reason: 'the intervening planets outnumber the obstructors', grade };
  }
  return { prevails: false, reason: 'obstructed', grade };
}

/**
 * 31.10: the quarter rule, which narrows obstruction sharply.
 *
 * An argala from the 1st quarter of its sign is cancelled only by an obstructor in the
 * 4th quarter of the obstructing sign, and a 2nd-quarter argala only by a 3rd-quarter
 * obstructor. Nothing else nullifies. The pairs sum to 5 — the quarters mirror each other
 * across the sign, which is the same reflective shape as the folded arcs in ch 27.
 */
export type Quarter = 1 | 2 | 3 | 4;

export const argalaQuarterCancelled = (argalaQuarter: Quarter, obstructorQuarter: Quarter): boolean =>
  argalaQuarter + obstructorQuarter === 5 && argalaQuarter <= 2;

export const QUARTER_DEGREES = 7.5;

export const quarterOf = (degreeInSign: number): Quarter =>
  (Math.min(3, Math.floor(degreeInSign / QUARTER_DEGREES)) + 1) as Quarter;

/**
 * 31.9: argala effects arrive in the dasha of the sign or planet concerned — the chapter
 * ties a structural claim to a time, which most of the corpus does not.
 */
export const ARGALA_TIMING =
  'BPHS 31.9: an argala’s effects are felt during the dasha of the rasi or planet it is '
  + 'reckoned from. The intervention is structural; the dasha is when it shows.';

/**
 * 31.11-17: what an unobstructed argala aspecting each house delivers. Our own phrasing,
 * and the two houses whose entries are about loss or difficulty are recorded rather than
 * surfaced.
 */
export const ARGALA_HOUSE_EFFECT: Record<House, string> = {
  1: 'recognition and standing',
  2: 'accumulation of wealth and provisions',
  3: 'support and good relations with siblings',
  4: 'home, land and vehicles',
  5: 'children, and clarity of mind',
  6: 'pressure from rivals and obligations',
  7: 'partnership and material comfort together',
  8: 'friction and delay',
  9: 'fortune and support from elders',
  10: 'advancement and public honour',
  11: 'gains',
  12: 'outgoings and detachment',
};

/** 31.11 and 31.18 — the two configurations the chapter singles out. */
export const ARGALA_FAME_TARGETS = ['arudha-lagna', 'lagna', '7th-from-each'] as const;
export const ARGALA_ROYAL_HOUSES: House[] = [1, 5, 9];

/**
 * 31.2-9: the nodes move retrograde, so their argala and obstruction are counted the
 * other way round.
 *
 * Recorded as a flag rather than implemented, because the verse does not say whether the
 * reversal applies to the node as the SOURCE, as the intervening planet, or both, and
 * inventing an answer would be worse than naming the gap.
 */
export const NODE_ARGALA_REVERSED =
  'BPHS 31 states that Rahu and Ketu, being retrograde, have their argala and obstruction '
  + 'counted in reverse. It does not say whether the reversal applies when a node is the '
  + 'reference point, when it is the intervening planet, or both. Not implemented — the '
  + 'gap is named rather than guessed.';

// ═════════════════════════════════════════════════════════════════════════════
// What these chapters state that is deliberately not surfaced or not expressible
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Computed where useful for arbitration, never shown. Chapters 29 and 30 carry a long run
 * of verses attaching bodily and mortal outcomes to the padas; the standing policy keeps
 * every one of them off the page.
 */
export const CH29_31_UNSURFACED = [
  '29.23-24 — bodily and health claims from the 7th from the Lagna Pada',
  '30.8, 30.12-16 — loss of a spouse from the 2nd from the Upapada',
  '30.17-20 — specific ailments attributed to planet pairs in the 2nd from the Upapada',
  '29.8 (Marana Pada) — the 8th-house pada is computed and named, never interpreted',
] as const;

/** Conditions these chapters state that the predicate vocabulary cannot yet express. */
export const CH29_31_NOT_YET_EXPRESSIBLE = [
  'pada-to-pada relations (29.30-37) — needs a predicate over two computed padas, not a house',
  'argala strength arbitration inside a rule — needs Shadbala on the ChartFacts',
  'quarter-level argala cancellation (31.10) — needs longitudes on the argala predicate',
  'node argala reversal (31.2-9) — the text does not say which direction reverses',
] as const;

/** The three chapters, and which part of each turned out to be verification. */
export const CH29_31_SUMMARY =
  'Ch 29 and 31 verified existing code rather than replacing it: `arudhaOf` reproduces all '
  + 'four of ch 29’s examples, and `VIRODHARGALA` matches ch 31’s table exactly. The new '
  + 'capability is ch 31’s arbitration (strength and count decide whether an argala lands) '
  + 'and ch 30’s Upapada convention, which BPHS resolves differently from this codebase.';

export const JAIMINI_LAYER_NOTE =
  'Chapters 29-33 are the Jaimini layer. They reason in rasi relationships and padas '
  + 'rather than graded aspects, and must not be mixed with the ch 26-28 machinery — the '
  + 'same caution rasi drishti carries (ch 8).';

/** Convenience: every graha this layer reckons for, including the nodes (29.7). */
export const PADA_GRAHAS: Graha[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu',
];
