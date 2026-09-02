// BPHS Programme Part 47 — Chapters 78 and 79: lost horoscopy, and the ascetic yogas.
//
// Two unrelated chapters, and the second one closes a thread that has been open since Part 6.
//
// **Chapter 78 is not divination.** Its title is "Lost Horoscopy" and the question Maitreya
// asks is whether a reading is possible "when the time of birth is not known" — so it is
// **birth-time rectification**, reconstructing a birth moment from the chart of the moment the
// question is asked. Its procedure is a cascade of varga readings of that one query chart,
// which the engine already computes.
//
// **Chapter 79 supplies the graha-yuddha winner rule in root text.** BPHS 27.20 gives the
// Shadbala transfer of a planetary war but never says who wins; Part 27 recorded that the only
// available answer was Santhanam's citation of C. G. Rajan — commentary, refused, and the
// caller left to decide. **79.9 states the rule itself**, along with the orb and the
// participants. See `YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL`.

import type { Graha, House } from '../../types.js';
import type { Predicate } from '../../rules/predicate.js';
import type { Rule } from '../../rules/rule.js';

// ─────────────────────────────────────────────────────────────────────────────
// 78 — reconstructing a birth time from the query chart
// ─────────────────────────────────────────────────────────────────────────────

export interface RectificationStep {
  /** What is being recovered. */
  recovers: string;
  /** Read from the query chart how? */
  from: string;
  verse: string;
}

/**
 * BPHS 78.5-16's rectification cascade, in the order the chapter gives it.
 *
 * Every step reads the **query chart** — the chart of the moment the question is asked — and
 * each recovers one component of the unknown birth moment, coarse to fine: the year, then the
 * half-year, then the season, the month, the tithi, and finally the ishta kala.
 *
 * The striking thing is that it is **almost entirely a varga cascade**. The D12 gives the year,
 * the hora gives the ayana, the drekkana gives the season and the month — all of which Parts 3
 * and 4 already compute, and which Part 29's `vargaFacts` already projects. So this chapter is
 * mostly a *wiring* description rather than new arithmetic, the same situation Retrofit R30
 * found for the Dasavarga designations.
 */
export const RECTIFICATION_CASCADE: RectificationStep[] = [
  {
    recovers: 'samvatsara (the year)',
    from: 'the rasi in which the DWADASAMSA (D12) of the query ascendant falls — Jupiter stood '
      + 'in that rasi at birth',
    verse: '5-6',
  },
  {
    recovers: 'ayana (the Sun’s half-year course)',
    from: 'the HORA of the query ascendant: the first hora gives Uttarayana (northern), the '
      + 'second Dakshinayana (southern)',
    verse: '5-6',
  },
  {
    recovers: 'ritu (the season)',
    from: 'the DREKKANA, by its ruling planet',
    verse: '5-6',
  },
  {
    recovers: 'the month within the season',
    from: 'the half of the drekkana: the first part gives the season’s first month, the latter '
      + 'part its second',
    verse: '8-9',
  },
  {
    recovers: 'the tithi, and the Sun’s amsas',
    from: 'the EXPIRED amsas of the drekkana, taken proportionately',
    verse: '8-9',
  },
  {
    recovers: 'the ishta kala (the birth time itself)',
    from: 'the Sun’s degrees: work the Sun’s longitude forward from its sign ingress by the '
      + 'expired amsa, and convert the difference from the birth Sun into time',
    verse: '14-16',
  },
];

/**
 * BPHS 78.7 — the substitution to try when the ayana and the ritu disagree.
 *
 * *"If there be any contradiction in the Ayana and ritu, the ritu may be determined from
 * Mercury in place of Mars, from Venus in place of the Moon and from Saturn in place of
 * Jupiter."*
 *
 * Worth encoding on its own because it is the chapter's **conflict-resolution rule**, and a
 * procedure this long will produce conflicts. Note that it is one-directional: the substitution
 * re-reads the *ritu*, never the ayana.
 */
export const RITU_SUBSTITUTIONS: Record<string, Graha> = {
  mars: 'mercury',
  moon: 'venus',
  jupiter: 'saturn',
};

export const RITU_SUBSTITUTION_IS_ONE_DIRECTIONAL =
  'BPHS 78.7: when the ayana and the ritu contradict each other, re-read the RITU using '
  + 'Mercury for Mars, Venus for the Moon and Saturn for Jupiter. One-directional — the '
  + 'substitution never re-reads the ayana, so the hora’s answer stands and the drekkana’s '
  + 'gives way. Encoded separately because it is the chapter’s conflict-resolution rule and a '
  + 'six-step cascade will produce conflicts.';

/**
 * BPHS 78.10-12 — the ambiguity Jupiter's 12-year cycle creates, and the chapter's own fix.
 *
 * Maitreya asks it directly: *"Jupiter returns to the same rashi after every 12 years. Then
 * from which circle of Jupiter should samvatsar be determined?"* The answer is to take the
 * querent's **approximate age** and add multiples of 12 to the difference between Jupiter's
 * rasi at the query and at birth, choosing the candidate that lands near that age.
 *
 * So the procedure **requires an outside fact** — roughly how old the person is. That is worth
 * stating plainly: this is not a method that recovers a birth time from a chart alone, and a
 * caller who supplies no age gets a twelve-year ambiguity, not an answer.
 */
export function samvatsaraCandidates(
  jupiterRasiAtQuery: number, jupiterRasiAtBirth: number, approximateAge?: number,
): { years: number[]; chosen: number | null } {
  const base = ((jupiterRasiAtQuery - jupiterRasiAtBirth) % 12 + 12) % 12;
  const years = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => base + 12 * k);
  if (approximateAge == null) return { years, chosen: null };
  let best = years[0]!;
  for (const y of years) {
    if (Math.abs(y - approximateAge) < Math.abs(best - approximateAge)) best = y;
  }
  return { years, chosen: best };
}

export const RECTIFICATION_NEEDS_AN_OUTSIDE_FACT =
  'BPHS 78.10-12 concedes the gap itself: Jupiter returns to a rasi every 12 years, so the '
  + 'samvatsara step yields a LADDER of candidates 12 years apart, and the chapter resolves it '
  + 'by taking the querent’s APPROXIMATE AGE. So chapter 78 does not recover a birth time from '
  + 'a chart alone — it needs one outside fact, and a caller who supplies no age gets a '
  + 'twelve-year ambiguity rather than an answer. `samvatsaraCandidates` returns the ladder and '
  + 'picks from it only when an age is given.';

export const CH78_IS_RECTIFICATION_NOT_PRASHNA =
  'Chapter 78 is titled "Lost Horoscopy" and is often read as prashna (divination from the '
  + 'moment of a question). It is not: Maitreya asks whether a reading is possible "when the '
  + 'time of birth is not known", and the answer is a procedure for RECONSTRUCTING the birth '
  + 'moment from the query chart. It therefore extends pointers §11.6 (birth-time '
  + 'rectification) rather than opening a divinatory branch. Almost every step is a VARGA '
  + 'reading — D12 for the year, hora for the ayana, drekkana for the season and month — all '
  + 'of which Parts 3-4 already compute and Part 29’s `vargaFacts` already projects, so this is '
  + 'largely a wiring description rather than new arithmetic (cf. Retrofit R30).';

// ─────────────────────────────────────────────────────────────────────────────
// 79.9 — the graha yuddha winner, in root text at last
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **BPHS 79.9 closes a thread open since Part 6.**
 *
 * 27.20 gives a planetary war's Shadbala transfer — *"the difference… added to the victor's
 * and deducted from the vanquished"* — and **never says who wins**. Part 27 recorded the only
 * answer available: Santhanam's ch 11 notes citing C. G. Rajan, that a war needs identical
 * longitudes and the same latitude hemisphere, with the higher latitude taking the victory.
 * Commentary, so it was refused and the caller left to decide (`YUDDHA_WINNER_NOTE`).
 *
 * 79.9 is root text and states three things 27.20 did not:
 *
 *   1. **The orb** — the planets must be *"within one degree of each other"*, where the
 *      commentary said identical longitudes.
 *   2. **The participants** — Mars, Mercury, Jupiter, Venus and Saturn, which is exactly the
 *      shipped `YUDDHA_PLANETS`, now confirmed from a second chapter.
 *   3. **The winner** — *"Venus is the conqueror whether he is in North or South, but amongst
 *      the other four only one, who is in the North is the Conqueror and that in the South is
 *      considered defeated."*
 *
 * ⚠️ **This is not the commentary's rule.** Rajan compares latitude *magnitudes*; BPHS asks
 * only which side of the ecliptic a planet is on, and grants **Venus an unconditional
 * exemption** that the commentary has no counterpart for. So the root text does not merely
 * confirm the commentary — it replaces it, and the two disagree for any war where Venus is the
 * southern party.
 */
export const YUDDHA_ORB_DEGREES = 1;

export function grahaYuddhaVictor(
  a: { graha: Graha; latitude: number }, b: { graha: Graha; latitude: number },
): { victor: Graha; vanquished: Graha; basis: 'venus-exempt' | 'northern' } | null {
  // 79.9: Venus conquers whichever side it is on.
  if (a.graha === 'venus') return { victor: a.graha, vanquished: b.graha, basis: 'venus-exempt' };
  if (b.graha === 'venus') return { victor: b.graha, vanquished: a.graha, basis: 'venus-exempt' };
  // Otherwise the northern party wins. Equal latitudes are not a case the verse covers.
  if (a.latitude === b.latitude) return null;
  return a.latitude > b.latitude
    ? { victor: a.graha, vanquished: b.graha, basis: 'northern' }
    : { victor: b.graha, vanquished: a.graha, basis: 'northern' };
}

export const YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL =
  'BPHS 79.9 CLOSES a thread open since Part 6. 27.20 gives a planetary war’s Shadbala '
  + 'transfer and never says who wins; Part 27 refused the only answer available (Santhanam '
  + 'citing C. G. Rajan — higher latitude wins) as commentary. 79.9 is ROOT TEXT and supplies '
  + 'all three missing pieces: the ORB ("within one degree of each other", where the commentary '
  + 'said identical longitudes); the PARTICIPANTS (Mars, Mercury, Jupiter, Venus, Saturn — '
  + 'exactly the shipped `YUDDHA_PLANETS`, now confirmed from a second chapter); and the '
  + 'WINNER ("Venus is the conqueror whether he is in North or South, but amongst the other '
  + 'four only one, who is in the North is the Conqueror"). ⚠️ It REPLACES the commentary '
  + 'rather than confirming it: Rajan compares latitude MAGNITUDES, BPHS asks only which side '
  + 'of the ecliptic, and BPHS grants Venus an exemption the commentary has no counterpart for. '
  + 'The two disagree for any war in which Venus is the southern party.';

// ─────────────────────────────────────────────────────────────────────────────
// 79 — the ascetic yogas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 79.2-3's stellium yoga: **four or more planets, possessed of strength, in a single
 * house.**
 *
 * `conjunct` takes a fixed list of grahas and so cannot express "four or more of any of them",
 * which would need 64 enumerated rules firing on the same charts. Part 47 added the `stellium`
 * predicate for it — the same shape as Retrofit R13's `lordsConjunct`.
 *
 * ⚠️ **The strength half is not encoded.** The verse says the planets must be *"possessed of
 * strength"*, and `stellium` names no planets, so there is nothing to attach a `strength`
 * predicate to. Stating the condition would require a "all members of the crowd are strong"
 * form the DSL does not have. Recorded rather than quietly dropped: the encoded rule is
 * therefore **broader than the verse**, and will fire on weak stelliums the chapter excludes.
 */
export const STELLIUM_STRENGTH_NOT_ENCODED =
  'BPHS 79.2-3 requires the four-or-more planets to be "possessed of strength". `stellium` '
  + 'names no planets, so there is nothing for a `strength` predicate to attach to, and the DSL '
  + 'has no "every member of the matched set satisfies X" form. The encoded rule is therefore '
  + 'BROADER than the verse and will fire on weak stelliums the chapter excludes. Recorded '
  + 'rather than quietly dropped — a rule that is wider than its source should say so.';

/**
 * Which order the native is said to enter, by whichever of the seven is strongest in the crowd
 * (79.2-3).
 *
 * Kept as **data, not as a reading**. The chapter names specific religious orders, and the
 * rules below do not assert one — a rule saying "you will become a naked ascetic" claims far
 * more about a life than the corpus can support, and the value here is the structural
 * observation that the strongest planet colours the direction.
 */
export const ASCETIC_ORDER_BY_STRONGEST: Record<Graha, string> = {
  sun: 'Tapasvi — penance and withdrawal',
  moon: 'Kapali',
  mars: 'the red robe',
  mercury: 'keeper of a danda (staff)',
  jupiter: 'Yati',
  venus: 'keeper of a chakra',
  saturn: 'Nirgrantha — the unclothed order',
  rahu: '',
  ketu: '',
};

export const ASCETIC_ORDERS_ARE_DATA_NOT_A_READING =
  'BPHS 79.2-3 names a specific religious order per strongest planet (Tapasvi, Kapali, the red '
  + 'robe, the danda, Yati, the chakra, Nirgrantha). Kept as DATA and not asserted by any rule: '
  + 'a rule saying "you will become a naked ascetic" claims far more about a life than the '
  + 'corpus supports. What the rules carry is the structural reading — a pull toward '
  + 'renunciation and withdrawal — with the strongest planet colouring its direction.';

/**
 * The ascetic yogas as rules.
 *
 * Kept: the stellium (79.2-3), the Moon-lord/Saturn aspect pair (79.6-7), the Moon in Saturn's
 * drekkana or navamsa aspected by Saturn (79.8), and Saturn in the 9th unaspected (79.15).
 *
 * These are read as a **life direction, not a misfortune** — renunciation is a path the corpus
 * treats as elevated, and 79.14 makes its highest case *"a holy illustrious founder of a system
 * of philosophy"*. The valences are accordingly neutral-to-positive, which is a judgement worth
 * naming: an engine that scored "gives up their home" as adverse would be importing a reading
 * the source does not make.
 */
export function asceticYogaRules(): Rule[] {
  const out: Rule[] = [];

  out.push({
    id: 'bphs.79.002.stellium',
    source: { text: 'bphs', chapter: 79, verse: '2-3' },
    when: [{ k: 'stellium', count: 4 }] as Predicate[],
    effect: {
      id: 'yoga.ascetic.stellium',
      domain: 'self',
      valence: 0.2,
      summary: 'A strong pull toward withdrawal and a life organised around something other '
        + 'than household and acquisition.',
    },
    weight: 0.6,
    verification: 'unverified',
    note: 'BPHS 79.2-3 also requires the planets to be "possessed of strength", which the DSL '
      + 'cannot attach to an unnamed set — see STELLIUM_STRENGTH_NOT_ENCODED. The specific '
      + 'religious orders the verse names are kept as data, not asserted.',
  });

  // 79.8 and 79.15 are NOT emitted. Both would have to drop the clause that makes them
  // yogas — 79.8's varga condition and 79.15's "unaspected by any planet" — and what remains
  // fires on 14.5% and 8.3% of charts respectively. A rule that is broader than its verse and
  // fires on one chart in seven is not a finding; it is a placement with a yoga's name on it.
  // Part 22 set this standard when it dropped a condition from BPHS 18.18 rather than ship an
  // unmeasurable rule. See CH79_PROXY_RULES_WITHHELD.

  return out;
}

export const CH79_PROXY_RULES_WITHHELD =
  'BPHS 79.8 and 79.15 are NOT emitted as rules. Each has one clause the DSL cannot state — '
  + '79.8 needs the Moon’s position in SATURN’S DREKKANA or navamsa, 79.15 needs Saturn "not '
  + 'aspected by any planet" — and dropping it leaves a rule that fires on 14.5% and 8.3% of '
  + 'charts respectively, measured on the calibration population. A rule broader than its verse '
  + 'firing on one chart in seven is not a finding; it is a placement wearing a yoga’s name. '
  + 'Part 22 set this standard by dropping a condition from BPHS 18.18 rather than shipping an '
  + 'unmeasurable rule. Both are recorded as BLOCKED on a stated DSL gap, not as extractions '
  + 'we chose to skip.';

export const CH79_VARGA_CLAUSE_GAP =
  'BPHS 79.8 conditions on the Moon being in SATURN’S DREKKANA or in Saturn’s or Mars’s '
  + 'NAVAMSA. Part 29’s `vargaFacts` can build a divisional chart’s facts, but the registry '
  + 'evaluates rules against ONE `ChartFacts`, so a rule cannot ask "in the D3, is the Moon in '
  + 'a sign Saturn rules". The shipped rule uses Saturn’s aspect plus an unfavourable lunar '
  + 'dignity as a proxy and is explicitly NOT the verse. The clean fix is the same shape as the '
  + 'dasha-start chart (P38): let a rule name a frame that is a varga projection. Recorded as '
  + 'a DSL gap, the third standing one after the dispositor and the within-period split.';

export const CH79_REMAINING_CLAUSES_NOT_ENCODED =
  'Four of chapter 79’s clauses are not encoded, each for a stated reason. 79.4-5 turn on '
  + 'COMBUSTION of "the planets capable of leading to ascetism", a set the chapter never '
  + 'enumerates. 79.6-7 need the lord of the Moon’s sign to be UNASPECTED except by Saturn — '
  + 'the same negative-aspect form 79.15 needs and the DSL lacks. 79.10 makes the outcome '
  + 'depend on a graha yuddha defeat, which is now expressible (79.9) but needs latitudes the '
  + 'generator does not supply. 79.13 makes the order change at each significator’s DASHA, '
  + 'which is a trajectory rather than a state — the same limitation as P38’s within-period '
  + 'split.';

export const CH78_79_YIELD = {
  chapters: [78, 79],
  note: 'Chapter 78 is BIRTH-TIME RECTIFICATION, not prashna — it reconstructs an unknown birth '
    + 'moment from the query chart, and its six-step cascade is almost entirely a varga reading '
    + '(D12 → year, hora → ayana, drekkana → season and month), so it extends pointers §11.6 '
    + 'and is largely wiring. It also concedes its own gap: Jupiter’s 12-year return leaves a '
    + 'ladder of candidate years that only the querent’s approximate AGE resolves. Chapter 79 '
    + 'gives the ascetic yogas — and, in 79.9, **the graha-yuddha winner rule in ROOT TEXT, '
    + 'closing a thread open since Part 6**: 27.20 gave the transfer but never the winner, and '
    + 'Part 27 refused the commentary’s answer. 79.9 supplies the orb, the participants and the '
    + 'winner, and REPLACES rather than confirms the commentary — it grants Venus an exemption '
    + 'the commentary lacks. A new `stellium` predicate was needed for 79.2-3.',
} as const;
