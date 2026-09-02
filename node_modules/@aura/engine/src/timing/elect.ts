// Choosing a moment to act — the one place this engine is precise to the minute.
//
// **Why this is different from every other kind of timing here.** A question about your life
// ("when will I meet someone") is answered from your birth chart, so it carries your birth
// time's error — a minute of slack moves every boundary by up to five days, and no amount of
// arithmetic removes it. A question about when to ACT is computed forward from today. It does
// not touch the birth time at all except for one reference point, so it is precise to the
// minute, and saying so is not a boast — it is the reason the two are separated.
//
// The score has five terms, all classical:
//
//   tithi        the lunar day. Three of the thirty (4th, 9th, 14th) are avoided outright.
//   weekday      each day carries its ruler's character.
//   nakshatra    where the Moon stands, in 27 divisions.
//   tara         that nakshatra counted FROM your own birth Moon — the personal term, and
//                the only one that differs between two people on the same day.
//   hora         the planetary hour, ~60 minutes, which is what gives a time of day.
//
// ⚠️ The corpus encodes task-specific tables for FIVE undertakings. Anything else is scored on
// the general rules, which are themselves classical, and the answer says which of the two it
// used. Inventing a table for "buying a car" would be worse than saying it does not exist.

import { NAKSHATRA_ARC, SIGN_LORD } from '../constants.js';
import { jdFromDate, jdToJde } from '../astro/julian.js';
import { horaLord, sunriseBefore, WEEKDAY_LORDS, type HoraLord } from '../astro/sunrise.js';
import { ayanamsaFor, DEFAULT_AYANAMSA } from '../astro/ayanamsa.js';
import type { Ephemeris } from '../astro/ephemeris.js';
import type { Chart, Graha } from '../types.js';

const mod360 = (n: number): number => ((n % 360) + 360) % 360;
const mod27 = (n: number): number => ((n % 27) + 27) % 27;

// The arithmetic below mirrors @aura/knowledge's panchanga.ts and taras.ts. The engine may not
// import that package (they are deliberately independent), so the formulas are restated — they
// are four lines each, and apps/api/test asserts the two agree.

/** Tithi 1..30: the Moon–Sun elongation in 12° steps. */
export const tithiIndex = (sunLong: number, moonLong: number): number =>
  Math.floor(mod360(moonLong - sunLong) / 12) + 1;

/** Day within the fortnight, 1..15 — what the guideline tables are keyed on. */
export const tithiDay = (sunLong: number, moonLong: number): number =>
  ((tithiIndex(sunLong, moonLong) - 1) % 15) + 1;

/** Nakshatra 0..26 from a sidereal longitude. */
export const nakshatraOfLong = (long: number): number =>
  Math.floor(mod360(long) / NAKSHATRA_ARC) % 27;

/**
 * The nine taras, GRADED rather than split good/bad.
 *
 * They are not interchangeable. Parama Mitra ("best friend") and Sampat ("wealth") are both
 * favourable and not equally so; Naidhana ("loss") is markedly worse than Vipat ("danger").
 * Janma — your own birth star coming round — the source calls MIXED rather than adverse, so it
 * takes a light penalty instead of a full one.
 *
 * Grading matters practically as well as doctrinally: with a binary term the scale saturated
 * and several days in a two-month scan tied at the ceiling, which is useless for ranking.
 */
const TARA_GRADE: { delta: number; why: string }[] = [
  { delta: -7, why: 'your own monthly cycle has come back round to where it started — a mixed day, neither clear nor blocked' },
  { delta: 15, why: 'you are in the part of your own monthly cycle that classically brings gain' },
  { delta: -15, why: 'you are in one of the risky parts of your own monthly cycle' },
  { delta: 14, why: 'you are in a settled, well-supported part of your own monthly cycle' },
  { delta: -12, why: 'you are in an obstructive part of your own monthly cycle' },
  { delta: 12, why: 'you are in the part of your cycle that favours getting things finished' },
  { delta: -21, why: 'you are in the harshest of the nine phases of your own cycle' },
  { delta: 16, why: 'you are in a part of your own cycle that runs with you rather than against you' },
  { delta: 18, why: 'you are in the most favourable part of your own cycle there is' },
];

export const taraIndex = (janmaNak: number, transitNak: number): number =>
  (mod27(transitNak - janmaNak)) % 9;

/** The three "empty" lunar days, avoided for anything new. */
export const RIKTA_TITHI_DAYS = [4, 9, 14];

/**
 * Task guidelines, as encoded in the corpus. FIVE tasks, and that is all there is.
 *
 * `null` for a task means "no table exists" — the scorer then uses the general rules and says
 * so. That distinction is surfaced all the way to the answer.
 */
export const TASK_TABLES: Record<string, { tithis: number[]; weekdays: number[]; nakshatras: number[] }> = {
  'house-construction': {
    tithis: [2, 3, 5, 7, 11, 13, 15], weekdays: [1, 3, 4, 5],
    nakshatras: [0, 3, 4, 6, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26],
  },
  'house-entering': {
    tithis: [2, 3, 5, 7, 10, 11, 13, 15], weekdays: [1, 3, 4, 5],
    nakshatras: [3, 4, 11, 13, 16, 20, 22, 23, 25, 26],
  },
  'naming-child': {
    tithis: [2, 3, 5, 7, 10, 11, 13], weekdays: [0, 1, 3, 4, 6],
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26],
  },
  'first-feeding': {
    tithis: [2, 3, 5, 7, 10, 13, 15], weekdays: [0, 1, 3, 4, 5],
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26],
  },
  'teaching-alphabet': {
    tithis: [2, 3, 5, 7, 10, 11, 12], weekdays: [1, 3, 4, 5],
    nakshatras: [0, 6, 12, 13, 14, 16, 21, 26],
  },
};

/**
 * The general rules, used when no task table exists.
 *
 * These are not a watered-down substitute — they are the classical defaults that apply to any
 * new undertaking: avoid the empty lunar days, prefer a benefic weekday, prefer a favourable
 * point in the person's own 27-part cycle.
 */
const GENERAL_GOOD_WEEKDAYS = [1, 3, 4, 5]; // Moon, Mercury, Jupiter, Venus
const GENERAL_GOOD_TITHIS = [2, 3, 5, 7, 10, 11, 13, 15];

export interface MomentScore {
  when: Date;
  /** 0..100, to one decimal. Normalised across the achievable range — see `scoreMoment`. */
  score: number;
  reasons: { why: string; delta: number }[];
  /** True when a task-specific table was used rather than the general rules. */
  taskTable: boolean;
  /** Hidden from lay readers; kept for the working. */
  detail: { tithiDay: number; nakshatra: number; weekday: number; tara: number; hora: HoraLord | null };
}

/**
 * Score one instant for acting.
 *
 * Terms are additive from a neutral 50 so that a day with nothing special either way lands in
 * the middle rather than at zero — which matters, because most days are ordinary and an
 * interface that paints them all red is not telling anyone anything.
 */
export function scoreMoment(
  at: Date,
  chart: Chart,
  ephem: Ephemeris,
  lat: number,
  lngEast: number,
  task?: string,
): MomentScore {
  const jd = jdFromDate(at);
  const jde = jdToJde(jd);
  const ay = ayanamsaFor(DEFAULT_AYANAMSA, jde);
  const trop = ephem.tropical(jde);
  const sun = mod360(trop.sun.lon - ay);
  const moon = mod360(trop.moon.lon - ay);

  const tDay = tithiDay(sun, moon);
  const nak = nakshatraOfLong(moon);
  const janmaNak = nakshatraOfLong(chart.planets.moon.siderealLong);
  const tara = taraIndex(janmaNak, nak);

  // The weekday of the VEDIC day, which begins at sunrise — a 4am appointment belongs to the
  // previous day's ruler, and using the civil date would silently mis-score every early hour.
  const opening = sunriseBefore(at, lat, lngEast);
  const weekday = (opening ?? at).getUTCDay();
  const hora = horaLord(at, lat, lngEast);

  const table = task ? TASK_TABLES[task] : undefined;
  const reasons: { why: string; delta: number }[] = [];
  let score = 50;

  const add = (delta: number, why: string) => { score += delta; reasons.push({ delta, why }); };

  if (RIKTA_TITHI_DAYS.includes(tDay)) {
    add(-22, 'this falls on one of the three empty days of the lunar month — traditionally the worst days to begin anything');
  }

  const goodTithis = table?.tithis ?? GENERAL_GOOD_TITHIS;
  if (goodTithis.includes(tDay)) add(12, 'the lunar day favours starting something');
  else if (!RIKTA_TITHI_DAYS.includes(tDay)) add(-4, 'the lunar day is neutral rather than helpful');

  const goodDays = table?.weekdays ?? GENERAL_GOOD_WEEKDAYS;
  if (goodDays.includes(weekday)) add(10, 'the day of the week carries a constructive tone');
  else add(-6, 'the day of the week carries a harder tone');

  if (table) {
    if (table.nakshatras.includes(nak)) add(12, 'the sky is in one of the configurations named for this exact undertaking');
    else add(-8, 'the sky is not in one of the configurations named for this undertaking');
  }

  // The personal term, and the heaviest one. It is the only term that differs between two
  // people on the same day, which is what makes this a reading rather than a calendar.
  const grade = TARA_GRADE[tara]!;
  add(grade.delta, grade.why);

  // Hour ruler. A benefic hour lifts an ordinary day; it cannot rescue a bad one.
  if (hora && ['jupiter', 'venus', 'mercury', 'moon'].includes(hora)) {
    add(6, 'the hour itself is one of the gentler ones');
  } else if (hora && ['saturn', 'mars'].includes(hora)) {
    add(-5, 'the hour itself is one of the harsher ones');
  }

  // Where the Moon is relative to your own birth Moon — the 6th, 8th and 12th are avoided.
  const moonHouse = ((mod360(moon - chart.planets.moon.siderealLong) / 30) | 0) + 1;
  if ([6, 8, 12].includes(moonHouse)) add(-9, 'the fast cycle is crossing a part of your chart that drags');
  else if ([3, 7, 10, 11].includes(moonHouse)) add(6, 'the fast cycle is crossing somewhere that pushes things forward');
  else if ([1, 4].includes(moonHouse)) add(3, 'the fast cycle is crossing somewhere steady');

  // Fine ordering within a day. The Moon moves ~0.5°/hour, so where it sits inside its own
  // star separates two otherwise identical hours — and without it a two-month scan produces
  // ties at the ceiling that carry no information.
  const intoNak = (mod360(moon) % NAKSHATRA_ARC) / NAKSHATRA_ARC;
  score += (0.5 - Math.abs(intoNak - 0.5)) * 2;

  // ── Normalise, do not clamp ────────────────────────────────────────────────
  //
  // The terms are additive from 50 and can reach ~103 without a task table or ~115 with one.
  // Clamping at 99 made every strong day report exactly 99.0 — five different dates, one
  // number — and pinned the hour scan too, since no hour could beat a saturated day. So the
  // raw sum is mapped onto 0-100 across the range that is actually reachable in this mode.
  //
  // The bounds below are the sums of the best and worst each term can contribute. They are
  // derived from the deltas in this function and must be kept in step with them; the test
  // asserts no score ever falls outside them.
  const RAW_MAX = table ? 115 : 103;
  const RAW_MIN = table ? -21 : -13;
  const normalised = ((score - RAW_MIN) / (RAW_MAX - RAW_MIN)) * 100;

  return {
    when: at,
    score: Math.round(Math.max(1, Math.min(100, normalised)) * 10) / 10,
    reasons: reasons.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 4),
    taskTable: table != null,
    detail: { tithiDay: tDay, nakshatra: nak, weekday, tara, hora },
  };
}

export interface ElectedWindow {
  /** Day this window falls on. */
  day: Date;
  /** Best hour found within the day. */
  best: Date;
  score: number;
  reasons: { why: string; delta: number }[];
  taskTable: boolean;
}

/**
 * The best moments to act between two dates.
 *
 * Scans each day at local noon to rank days cheaply, then re-scans the winning days hour by
 * hour to find the best hour inside them. Two passes rather than one because scoring every
 * hour of two months is 1,464 full ephemeris evaluations for an answer that only needs a
 * handful of days resolved that finely.
 */
export function bestMoments(
  chart: Chart,
  ephem: Ephemeris,
  lat: number,
  lngEast: number,
  from: Date,
  to: Date,
  opts: { task?: string; limit?: number } = {},
): ElectedWindow[] {
  const limit = opts.limit ?? 5;
  const days: MomentScore[] = [];

  for (let t = from.getTime(); t <= to.getTime(); t += 86400000) {
    const noon = new Date(t);
    noon.setUTCHours(12, 0, 0, 0);
    if (noon.getTime() < from.getTime() || noon.getTime() > to.getTime()) continue;
    days.push(scoreMoment(noon, chart, ephem, lat, lngEast, opts.task));
  }

  const top = days.sort((a, b) => b.score - a.score).slice(0, limit);

  return top.map((d) => {
    let best = d;
    // Daylight hours only: nobody is buying a car at 03:00, and the classical guidance for
    // most undertakings assumes a waking hour anyway.
    for (let h = 6; h <= 20; h++) {
      const at = new Date(d.when);
      at.setUTCHours(h, 0, 0, 0);
      const s = scoreMoment(at, chart, ephem, lat, lngEast, opts.task);
      if (s.score > best.score) best = s;
    }
    return {
      day: d.when,
      best: best.when,
      score: best.score,
      reasons: best.reasons,
      taskTable: best.taskTable,
    };
  }).sort((a, b) => b.score - a.score);
}

/** Which of the five encoded tables, if any, an arbitrary phrase maps to. */
export function taskTableFor(phrase: string): string | null {
  const p = phrase.toLowerCase();
  if (/\b(build|construct|foundation|new house|plot)\b/.test(p)) return 'house-construction';
  if (/\b(move in|moving in|shift|housewarming|griha|enter the house)\b/.test(p)) return 'house-entering';
  if (/\b(name|naming|christen)\b/.test(p)) return 'naming-child';
  if (/\b(first feed|feeding|annaprashan|solid food)\b/.test(p)) return 'first-feeding';
  if (/\b(school|study|learn|alphabet|education begin)\b/.test(p)) return 'teaching-alphabet';
  return null;
}

export const ELECTIONAL_IS_THE_PRECISE_ONE =
  'Electional timing is the ONE thing this engine resolves to the minute, and the reason is '
  + 'arithmetic rather than confidence: it is computed forward from today and barely touches '
  + 'the birth time, so the ±5-day error that blurs every life-event window does not enter. A '
  + 'question about when to ACT can carry an hour. A question about when something will HAPPEN '
  + 'cannot, and the two are kept apart on purpose.';

export const ONLY_FIVE_TASKS_ARE_TABLED =
  'The corpus gives task-specific tables for FIVE undertakings and no more. Everything else is '
  + 'scored on the general rules — avoid the three empty lunar days, prefer a constructive '
  + 'weekday, prefer a star that runs with your own birth Moon — which are classical in their '
  + 'own right rather than a fallback. The answer always says which of the two it used, because '
  + 'inventing a table for "buying a car" would be worse than admitting none exists.';

export const THE_PERSONAL_TERM =
  'The tara — the Moon’s star counted from YOUR birth Moon — is the only term that differs '
  + 'between two people on the same day. It is also the heaviest single term in the score. That '
  + 'is deliberate: it is what makes this a reading rather than a calendar, and it is why a day '
  + 'that is generally auspicious can still be a poor day for you specifically.';

export const WHY_THE_SCORE_IS_NORMALISED =
  'The five terms are additive from a neutral 50 and can reach about 103 without a task table '
  + 'or 115 with one. An earlier version clamped the total at 99, which made every strong day '
  + 'report exactly 99.0 — five different dates showing one number — and pinned the hour scan '
  + 'with it, because no hour could beat a day already at the ceiling. The raw sum is now mapped '
  + 'onto 0-100 across the range actually reachable, so the figure means "where in the possible '
  + 'range does this moment sit" and two good days can still be told apart.';
