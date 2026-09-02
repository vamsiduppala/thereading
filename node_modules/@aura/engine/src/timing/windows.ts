// Dated windows: when a given area of life is supported, and how strongly.
//
// **This is what lets an answer carry a date instead of a mood.** Everything here is computed
// from the chart and the clock — no rule text, no interpretation. The output is a list of
// calendar spans, each with a percentage and the reasons behind it.
//
// The method, stated plainly so it can be argued with:
//
//   1. An area of life maps to one or more HOUSES (partnership → the 7th, work → the 10th).
//   2. Time is divided by the nested periods the engine already computes, three levels deep.
//   3. A period's ruling planet is scored on how well it serves those houses — does it own
//      them, sit in them, look at them, and is it strong in itself.
//   4. The three levels are combined with the shortest weighted heaviest, because the shortest
//      is the one that decides what a given month feels like.
//
// ⚠️ **The percentage is a WEIGHT, not a probability.** 72% does not mean "72% likely to
// happen". It means this window scores 72 out of 100 on the chart's own support for that
// matter, and a 40% window is genuinely worse than a 72% one for the same person. Comparing
// two people's numbers is meaningless. `WHAT_THE_PERCENTAGE_IS` says so and the UI repeats it.

import { SIGN_LORD, GRAHAS } from '../constants.js';
import { houseFrom } from '../astro/angles.js';
import { aspectedHouses } from '../chart/aspects.js';
import { computeAshtakavarga } from '../chart/ashtakavarga.js';
import { getPeriodsAt } from '../dasha/vimshottari.js';
import { boundaryUncertaintyMs, formatUncertainty } from '../dasha/uncertainty.js';
import { STATED_TIME_ACCURACY } from '../dasha/visibility.js';
import type { Chart, DashaLevel, DashaPeriod, Graha, House } from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Areas of life → the houses that carry them
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The classical house significations, as the areas a person actually asks about.
 *
 * Several areas legitimately take more than one house — money is the 2nd (what is held) and
 * the 11th (what comes in), and they are not the same question. Where two are listed the score
 * is their mean, which is why a chart can be strong for income and weak for savings.
 */
export const AREA_HOUSES = {
  self: [1],
  wealth: [2, 11],
  courage: [3],
  home: [4],
  children: [5],
  education: [4, 5],
  health: [1, 6],
  obstacles: [6],
  partnership: [7],
  change: [8],
  fortune: [9],
  career: [10],
  gains: [11],
  travel: [3, 9, 12],
  spirituality: [9, 12],
  release: [12],
} as const;

export type Area = keyof typeof AREA_HOUSES;
export const AREAS = Object.keys(AREA_HOUSES) as Area[];

/** Natural benefics and malefics — the coarse split, used only as one term among several. */
const BENEFIC: Graha[] = ['jupiter', 'venus', 'mercury', 'moon'];
const MALEFIC: Graha[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];

// ─────────────────────────────────────────────────────────────────────────────
// Scoring one planet against one set of houses
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreReason {
  /** Plain English, for the answer. No astrology vocabulary. */
  why: string;
  /** How much this moved the score, −1..+1. */
  delta: number;
}

export interface PlanetAreaScore {
  /** 0..1. */
  score: number;
  reasons: ScoreReason[];
}

/**
 * How well one planet serves one area, 0..1.
 *
 * Six terms, each capped so no single one can carry the result. The weights are ours — the
 * source grades these factors as important without giving numbers — and they are stated here
 * rather than buried so a reader can disagree with a specific one.
 */
export function scorePlanetForHouses(
  chart: Chart, graha: Graha, houses: House[], sav?: number[],
): PlanetAreaScore {
  const p = chart.planets[graha];
  const reasons: ScoreReason[] = [];
  let score = 0.5; // neutral start; every term moves it from here

  const owns = houses.filter((h) => {
    const sign = (chart.lagnaSign + h - 1) % 12;
    return SIGN_LORD[sign] === graha;
  });
  if (owns.length > 0) {
    score += 0.18;
    reasons.push({ why: 'this stretch is run by what governs the matter itself', delta: 0.18 });
  }

  const sits = houses.includes(p.house);
  if (sits) {
    score += 0.15;
    reasons.push({ why: 'it sits directly in the part of the chart that carries it', delta: 0.15 });
  }

  const looks = aspectedHouses(graha, p.sign, chart.lagnaSign).filter((h) => houses.includes(h));
  if (looks.length > 0 && !sits) {
    score += 0.08;
    reasons.push({ why: 'it has a direct line of sight to the matter', delta: 0.08 });
  }

  // Dignity: how comfortable the planet is where it stands, −1..+1 from the engine.
  const d = p.dignity;
  score += d * 0.14;
  if (d > 0.3) reasons.push({ why: 'what governs the matter is comfortably placed, so it acts with its full hand', delta: d * 0.14 });
  else if (d < -0.3) reasons.push({ why: 'what governs the matter is poorly placed, so it delivers less than it promises', delta: d * 0.14 });

  if (BENEFIC.includes(graha)) {
    score += 0.06;
    reasons.push({ why: 'the tone of the stretch is broadly constructive', delta: 0.06 });
  } else if (MALEFIC.includes(graha)) {
    score -= 0.06;
    reasons.push({ why: 'the tone of the stretch is demanding rather than easy', delta: -0.06 });
  }

  // Ashtakavarga: accumulated benefic points in the sign the house occupies. The mean is
  // 337/12 ≈ 28, so this is a comparison against the chart's own average rather than a
  // universal scale.
  if (sav) {
    const mean = 337 / 12;
    const avg = houses.reduce((s, h) => s + (sav[(chart.lagnaSign + h - 1) % 12] ?? mean), 0)
      / houses.length;
    const term = Math.max(-0.12, Math.min(0.12, ((avg - mean) / mean) * 0.35));
    score += term;
    if (term > 0.03) reasons.push({ why: 'the area is well supplied in this chart to begin with', delta: term });
    else if (term < -0.03) reasons.push({ why: 'the area is thinly supplied in this chart to begin with', delta: term });
  }

  if (p.retrograde) {
    score -= 0.03;
    reasons.push({ why: 'progress here doubles back on itself before it sticks', delta: -0.03 });
  }
  if (p.combust) {
    score -= 0.05;
    reasons.push({ why: 'its effect is overshadowed and hard to see from outside', delta: -0.05 });
  }

  return { score: Math.max(0.02, Math.min(0.98, score)), reasons };
}

// ─────────────────────────────────────────────────────────────────────────────
// Windows
// ─────────────────────────────────────────────────────────────────────────────

export interface Window {
  level: DashaLevel;
  start: Date;
  end: Date;
  /** 0..100, one decimal. See `WHAT_THE_PERCENTAGE_IS`. */
  strength: number;
  /** The strongest reasons, best first. */
  reasons: ScoreReason[];
  /** '±2 days' — how far the boundaries could move. */
  uncertainty: string;
  /** Ruling planet. Never rendered to a lay reader; kept for the working. */
  lord: Graha;
  /** True when this window is live right now. */
  current: boolean;
}

const LEVEL_WEIGHT: Record<string, number> = { maha: 0.25, antar: 0.35, pratyantar: 0.40 };

/**
 * Ashtakavarga is a property of the chart, not of the window — so it is computed once per
 * chart and reused.
 *
 * `nextTurn` calls `windowsFor` twice for every period it walks, which over a five-year search
 * is hundreds of calls, and each was recomputing the full bindu table from scratch. A WeakMap
 * keyed on the chart lets the entry go when the chart does, so nothing is retained.
 */
const savCache = new WeakMap<Chart, number[]>();
const savFor = (chart: Chart): number[] => {
  const hit = savCache.get(chart);
  if (hit) return hit;
  const sav = computeAshtakavarga(chart).sav;
  savCache.set(chart, sav);
  return sav;
};

/**
 * Every window for an area between two dates, at all three levels.
 *
 * The composite for any instant is the weighted blend of the three levels covering it, with
 * the shortest weighted heaviest — a long favourable stretch does not stop a bad month inside
 * it from being a bad month, and that is the complaint people actually have about long-range
 * prediction.
 */
export function windowsFor(
  chart: Chart, birth: Date, area: Area, from: Date, to: Date, at?: Date,
): Window[] {
  const houses = [...AREA_HOUSES[area]] as House[];
  const moonLong = chart.planets.moon.siderealLong;
  const sav = savFor(chart);
  // ⚠️ The clock is INJECTED, never read here. §3 rule 1: an engine that calls `new Date()`
  // cannot answer "what did this look like on 12 March 2019", and nothing built on it is
  // deterministically testable. `at` defaults to the window's own start rather than to now.
  const asOf = at ?? from;

  const uncertaintyMs = boundaryUncertaintyMs({ moonLong, accuracy: STATED_TIME_ACCURACY });
  const uncertainty = formatUncertainty(uncertaintyMs);

  const out: Window[] = [];
  for (const level of ['maha', 'antar', 'pratyantar'] as DashaLevel[]) {
    let periods: DashaPeriod[] = [];
    try {
      periods = getPeriodsAt(moonLong, birth, level, from, to);
    } catch {
      periods = [];
    }
    for (const p of periods) {
      const { score, reasons } = scorePlanetForHouses(chart, p.lord, houses, sav);
      out.push({
        level,
        start: p.start,
        end: p.end,
        strength: Math.round(score * 1000) / 10,
        reasons: reasons.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 4),
        uncertainty,
        lord: p.lord,
        current: asOf >= p.start && asOf < p.end,
      });
    }
  }
  return out;
}

export interface RankedWindow extends Window {
  /** The blended figure across all three levels — what the answer quotes. */
  composite: number;
}

/**
 * The best stretches for an area, ranked.
 *
 * Ranks the SHORTEST level (weeks to months), because that is the resolution a person can act
 * on, then blends in the two longer levels covering each one. A short strong window inside a
 * long weak stretch scores lower than the same window inside a long strong one, which is the
 * behaviour the nesting is supposed to produce.
 */
export function bestWindows(
  chart: Chart, birth: Date, area: Area, from: Date, to: Date, limit = 6,
): RankedWindow[] {
  const all = windowsFor(chart, birth, area, from, to);
  const short = all.filter((w) => w.level === 'pratyantar');
  const covering = (w: Window, level: DashaLevel) =>
    all.find((x) => x.level === level && x.start <= w.start && x.end > w.start);

  const ranked: RankedWindow[] = short.map((w) => {
    const maha = covering(w, 'maha');
    const antar = covering(w, 'antar');
    const blend =
      (maha ? maha.strength * LEVEL_WEIGHT.maha! : w.strength * LEVEL_WEIGHT.maha!)
      + (antar ? antar.strength * LEVEL_WEIGHT.antar! : w.strength * LEVEL_WEIGHT.antar!)
      + w.strength * LEVEL_WEIGHT.pratyantar!;
    return { ...w, composite: Math.round(blend * 10) / 10 };
  });

  return ranked.sort((a, b) => b.composite - a.composite).slice(0, limit);
}

/** The three periods covering an instant — the "where you are now" answer. */
export function stackAt(
  chart: Chart, birth: Date, area: Area, at: Date,
): { level: DashaLevel; window: Window }[] {
  const span = 1000; // a 1-second window returns exactly the containing period at each level
  const wins = windowsFor(chart, birth, area, at, new Date(at.getTime() + span), at);
  return (['maha', 'antar', 'pratyantar'] as DashaLevel[])
    .map((level) => ({ level, window: wins.find((w) => w.level === level)! }))
    .filter((x) => x.window != null);
}

/** The next time the composite rises above `threshold` — "when does it turn". */
export function nextTurn(
  chart: Chart, birth: Date, area: Area, from: Date, months = 60, threshold = 55,
): RankedWindow | null {
  const to = new Date(from.getTime() + months * 30.44 * 86400000);
  const all = windowsFor(chart, birth, area, from, to)
    .filter((w) => w.level === 'pratyantar')
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const covering = (w: Window, level: DashaLevel) =>
    windowsFor(chart, birth, area, w.start, new Date(w.start.getTime() + 1000))
      .find((x) => x.level === level);

  for (const w of all) {
    if (w.start < from) continue;
    const maha = covering(w, 'maha');
    const antar = covering(w, 'antar');
    const blend = (maha?.strength ?? w.strength) * LEVEL_WEIGHT.maha!
      + (antar?.strength ?? w.strength) * LEVEL_WEIGHT.antar!
      + w.strength * LEVEL_WEIGHT.pratyantar!;
    if (blend >= threshold) return { ...w, composite: Math.round(blend * 10) / 10 };
  }
  return null;
}

/** Granularities a request can ask for. `period` follows the chart's own boundaries. */
export type SeriesUnit = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'period';

export interface SeriesPoint {
  start: Date;
  end: Date;
  /** 'October 2026', 'week of 12 Oct', 'Q2 2027' — already phrased for display. */
  label: string;
  /** 0..100, one decimal. */
  score: number;
  /** Strongest reason at that point, for a note beside the figure. */
  why: string;
  /** True where a boundary falls inside the bucket, so the figure shifts partway through. */
  changesMidway: boolean;
}

const MONTH_NAME = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

/** Bucket boundaries for a unit, over a span. Calendar-aligned, not offset from `from`. */
function buckets(unit: SeriesUnit, from: Date, to: Date): { start: Date; end: Date; label: string }[] {
  const out: { start: Date; end: Date; label: string }[] = [];
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth();
  const d = from.getUTCDate();

  // A table a person reads. Beyond this it is data, and the answer should say so rather than
  // print two hundred rows.
  const CAP = 64;

  if (unit === 'day') {
    for (let t = Date.UTC(y, m, d); t <= to.getTime() && out.length < CAP; t += 86400000) {
      const a = new Date(t);
      out.push({
        start: a,
        end: new Date(t + 86400000 - 1),
        label: `${a.getUTCDate()} ${MONTH_NAME[a.getUTCMonth()]!.slice(0, 3)} ${a.getUTCFullYear()}`,
      });
    }
    return out;
  }
  if (unit === 'week') {
    for (let t = Date.UTC(y, m, d); t <= to.getTime() && out.length < CAP; t += 7 * 86400000) {
      const a = new Date(t);
      out.push({
        start: a,
        end: new Date(t + 7 * 86400000 - 1),
        label: `week of ${a.getUTCDate()} ${MONTH_NAME[a.getUTCMonth()]!.slice(0, 3)}`,
      });
    }
    return out;
  }
  if (unit === 'quarter') {
    const q0 = Math.floor(m / 3);
    for (let i = 0; out.length < CAP; i++) {
      const qm = q0 * 3 + i * 3;
      const a = new Date(Date.UTC(y, qm, 1));
      if (a > to) break;
      out.push({
        start: a,
        end: new Date(Date.UTC(y, qm + 3, 0, 23, 59, 59)),
        label: `Q${(a.getUTCMonth() / 3 | 0) + 1} ${a.getUTCFullYear()}`,
      });
    }
    return out;
  }
  if (unit === 'year') {
    for (let yy = y; out.length < CAP; yy++) {
      const a = new Date(Date.UTC(yy, 0, 1));
      if (a > to) break;
      out.push({ start: a, end: new Date(Date.UTC(yy, 11, 31, 23, 59, 59)), label: `${yy}` });
    }
    return out;
  }
  // month (and the default)
  for (let i = 0; out.length < CAP; i++) {
    const a = new Date(Date.UTC(y, m + i, 1));
    if (a > to) break;
    out.push({
      start: a,
      end: new Date(Date.UTC(y, m + i + 1, 0, 23, 59, 59)),
      label: `${MONTH_NAME[a.getUTCMonth()]} ${a.getUTCFullYear()}`,
    });
  }
  return out;
}

/**
 * The composite score sampled over a span, at whatever granularity was asked for.
 *
 * Each bucket is scored at its MIDPOINT rather than reported as a period. The chart's own
 * periods have boundaries that fall wherever they fall — a stretch might run from the 22nd to
 * the 14th — and a question asked in months wants an answer in months. Forcing period
 * boundaries into it would report a figure for "October" that held for nine days of it.
 *
 * `changesMidway` is the honest flag for that: a boundary falls inside this bucket, so the
 * single number summarises it rather than describing it throughout.
 *
 * `unit: 'period'` returns the chart's real periods instead, for a caller that wants them.
 */
export function rateSeries(
  chart: Chart, birth: Date, area: Area, from: Date, to: Date, unit: SeriesUnit = 'month',
): SeriesPoint[] {
  if (unit === 'period') {
    return bestWindows(chart, birth, area, from, to, 24)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map((w) => ({
        start: w.start,
        end: w.end,
        label: `${MONTH_NAME[w.start.getUTCMonth()]} ${w.start.getUTCFullYear()}`
          + ` – ${MONTH_NAME[w.end.getUTCMonth()]} ${w.end.getUTCFullYear()}`,
        score: w.composite,
        why: w.reasons[0]?.why ?? '',
        changesMidway: false,
      }));
  }

  const out: SeriesPoint[] = [];
  for (const b of buckets(unit, from, to)) {
    const mid = new Date((b.start.getTime() + b.end.getTime()) / 2);
    const stack = stackAt(chart, birth, area, mid);
    const short = stack.find((x) => x.level === 'pratyantar')?.window;
    if (!short) continue;
    const antar = stack.find((x) => x.level === 'antar')?.window;
    const maha = stack.find((x) => x.level === 'maha')?.window;
    const blend = (maha?.strength ?? short.strength) * LEVEL_WEIGHT.maha!
      + (antar?.strength ?? short.strength) * LEVEL_WEIGHT.antar!
      + short.strength * LEVEL_WEIGHT.pratyantar!;
    out.push({
      start: b.start,
      end: b.end,
      label: b.label,
      score: Math.round(blend * 10) / 10,
      why: short.reasons[0]?.why ?? '',
      // Either edge counts. Checking only the START missed the commonest case by far: a
      // period that RUNS OUT mid-bucket. October 2026 held a boundary on the 22nd and was
      // reported as a flat figure for the whole month.
      changesMidway: short.start > b.start || short.end < b.end,
    });
  }
  return out;
}

export const THE_UNIT_IS_A_PARAMETER =
  'One function samples the score at any granularity, rather than one capability per phrasing. '
  + 'A hand-written "rate my months" answers exactly that sentence and leaves "rate each week", '
  + '"best three quarters" and "compare March with June" broken in the same way — a registry '
  + 'can only ever offer what somebody thought to write. Making the unit, the ordering and the '
  + 'cut-off into arguments is what covers the requests nobody has thought of yet.';

/** Which planets carry the most weight for an area in this chart — for the "why". */
export function driversFor(chart: Chart, area: Area): { graha: Graha; score: number }[] {
  const houses = [...AREA_HOUSES[area]] as House[];
  const sav = savFor(chart);
  return GRAHAS
    .map((g) => ({ graha: g, score: scorePlanetForHouses(chart, g, houses, sav).score }))
    .sort((a, b) => b.score - a.score);
}

export const WHAT_THE_PERCENTAGE_IS =
  'A window’s percentage is a WEIGHT, not a probability. 72% does not mean "72% likely to '
  + 'happen" — it means this stretch scores 72 out of 100 on how far this particular chart '
  + 'supports that matter, so a 40% window really is worse than a 72% one FOR THE SAME PERSON. '
  + 'Comparing two people’s numbers means nothing, because the scale is anchored to the '
  + 'chart it came from. Nobody should read it as odds.';

export const WHY_THE_SHORTEST_LEVEL_LEADS =
  'Ranking is done on the shortest of the three periods and the two longer ones are blended in '
  + 'behind it. A long favourable stretch does not stop a bad month inside it from being a bad '
  + 'month, and pretending otherwise is the specific thing that makes long-range prediction '
  + 'useless. The shortest level is also the only one at a resolution a person can act on.';

export const HOUSE_MAP_IS_CLASSICAL_THE_WEIGHTS_ARE_OURS =
  'Which houses carry which area is classical and not in dispute. The WEIGHTS combining '
  + 'ownership, occupation, aspect, dignity, natural tone and accumulated support are OURS: the '
  + 'source grades these factors as mattering without ever giving numbers. They are written out '
  + 'in `scorePlanetForHouses` rather than hidden, so a reader can disagree with one term '
  + 'instead of the whole result.';
