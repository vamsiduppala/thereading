// Everything the engine can actually DO, as a registry the planner can choose from.
//
// This is what makes the skeleton dynamic rather than a template. A capability is one thing the
// engine can compute and render as a section: the best dated windows for a matter, the three
// nested periods, what is blocking something, the best hour to act, the fixed features of the
// chart. Each carries a natural-language description of what question it answers, so the local
// encoder can rank all of them against what was actually asked.
//
// The planner then picks a COMBINATION — whatever cleared the relevance floor — leads with the
// one that answers the literal question, and orders the rest behind it. Two different questions
// about the same area produce different sections in a different order, which is the point.
//
// **No text is generated.** Every sentence is assembled from computed numbers and dates plus
// our own fixed phrasing. The model chooses WHICH calculations to run and in WHAT ORDER; it
// never writes a word the reader sees.

import {
  bestWindows, stackAt, nextTurn, driversFor, bestMoments, taskTableFor, rateSeries,
  computeChart, AstronomiaEphemeris, jdFromDate,
  type Area, type Chart, type SeriesUnit,
} from '@aura/engine';
import type { RequestShape } from './shape.js';

export const ephem = new AstronomiaEphemeris();

const JD_UNIX = 2440587.5;
export const jdToDate = (jd: number): Date => new Date((jd - JD_UNIX) * 86400000);

const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
const dmy = (d: Date) => `${d.getUTCDate()} ${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const my = (d: Date) => `${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const hm = (d: Date) => `${String(d.getUTCHours()).padStart(2, '0')}:00`;

function spanPhrase(a: Date, b: Date): string {
  if (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
    return `around ${my(a)}`;
  }
  return (b.getTime() - a.getTime()) / 86400000 <= 75 ? `${my(a)} into ${my(b)}` : `${my(a)} to ${my(b)}`;
}

const verdict = (p: number) => p >= 70 ? 'strongly supported'
  : p >= 60 ? 'well supported' : p >= 52 ? 'mildly supported'
    : p >= 45 ? 'flat — neither helped nor hindered'
      : p >= 35 ? 'working against you' : 'strongly against you';

export const AREA_LABEL: Record<string, string> = {
  self: 'you', wealth: 'money', courage: 'nerve and siblings', home: 'home and family',
  children: 'children', education: 'study', health: 'health and energy',
  obstacles: 'obstacles and opposition', partnership: 'relationships', change: 'upheaval',
  fortune: 'luck', career: 'work', gains: 'income', travel: 'travel and moving',
  spirituality: 'meaning', release: 'letting go',
};
const label = (a: Area) => AREA_LABEL[a] ?? a;
const PLURAL = new Set(['relationships', 'obstacles and opposition', 'children']);
const isAre = (a: Area) => (PLURAL.has(label(a)) ? 'are' : 'is');
const Cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Plural noun for a granularity, so the prose reads at any unit rather than only in months. */
const unitNoun = (u: SeriesUnit | null): string =>
  u === 'day' ? 'days' : u === 'week' ? 'weeks' : u === 'quarter' ? 'quarters'
    : u === 'year' ? 'years' : u === 'period' ? 'stretches' : 'months';

// ─────────────────────────────────────────────────────────────────────────────

export interface Section {
  id: string;
  title: string;
  body: string[];
  windows?: { label: string; sub: string; pct: number }[];
  quotes?: string[];
}

export interface Ctx {
  chart: Chart;
  birth: Date;
  now: Date;
  lat: number;
  lng: number;
  area: Area;
  from: Date;
  to: Date;
  windowLabel: string;
  subject: string | null;
  findings: { summary: string; domain: string; confidence: number }[];
  /** The granularity, ordering and cut-off asked for. See `shape.ts`. */
  shape: RequestShape;
}

export interface Capability {
  id: string;
  /** What question this answers, in the words a person would use. Embedded for ranking. */
  asks: string;
  /** Shown as the section heading. */
  title: (c: Ctx) => string;
  /** Cheap guard — skip entirely when it cannot produce anything useful. */
  applies?: (c: Ctx) => boolean;
  run: (c: Ctx) => Section | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// The registry
// ─────────────────────────────────────────────────────────────────────────────

export const CAPABILITIES: Capability[] = [
  {
    id: 'series.custom',
    asks: 'rate each month for me, month by month, a table of the months, score every week, '
      + 'list the quarters, rank the years, break it down by period, percentages for each one, '
      + 'compare the months, which months are the best, show me every month, day by day',
    // Guarded on the request actually asking for a series. Without this it would put a table in
    // front of every question, which is the opposite failure to the one it exists to fix.
    applies: (c) => c.shape.wantsSeries,
    title: (c) => `${Cap(unitNoun(c.shape.unit))} for ${label(c.area)}`,
    run: (c) => {
      const unit: SeriesUnit = c.shape.unit ?? 'month';
      const all = rateSeries(c.chart, c.birth, c.area, c.from, c.to, unit);
      if (all.length < 2) return null;

      const best = [...all].sort((a, b) => b.score - a.score)[0]!;
      const worst = [...all].sort((a, b) => a.score - b.score)[0]!;
      const mean = all.reduce((n, r) => n + r.score, 0) / all.length;
      const spread = Math.round((best.score - worst.score) * 10) / 10;

      let rows = all;
      if (c.shape.ordering === 'best-first') rows = [...all].sort((a, b) => b.score - a.score);
      else if (c.shape.ordering === 'worst-first') rows = [...all].sort((a, b) => a.score - b.score);

      // "which months are best" wants a shortlist, not sixty-one rows in rank order. A
      // chronological table keeps all of them, because there the point is the shape of the
      // whole range. Whatever is cut is stated below rather than dropped quietly.
      const cut = c.shape.limit ?? (c.shape.ordering === 'chronological' ? null : 6);
      if (cut) rows = rows.slice(0, cut);

      const noun = unitNoun(c.shape.unit);
      const body = [
        `${all.length} ${noun} scored for ${label(c.area)}. The strongest is ${best.label} at `
        + `${best.score} out of 100; the weakest is ${worst.label} at ${worst.score}. The `
        + `average across the range is ${Math.round(mean * 10) / 10}.`,
      ];
      body.push(spread >= 12
        ? `A spread of ${spread} points — wide enough to plan around, because the good ${noun} `
          + `really are different from the poor ones.`
        : `A spread of only ${spread} points, so the ${noun} are much of a muchness. Timing is `
          + `not the lever here; whatever decides this is not in the calendar.`);
      if (cut && cut < all.length) {
        body.push(`Showing the ${c.shape.ordering === 'worst-first' ? 'weakest' : 'strongest'} `
          + `${Math.min(cut, all.length)} of ${all.length}.`);
      }
      if (rows.some((r) => r.changesMidway)) {
        body.push('A dot marks one that a boundary falls inside, so its figure shifts partway '
          + 'through rather than holding throughout.');
      }

      return {
        id: 'series.custom',
        title: `${Cap(noun)} for ${label(c.area)}`,
        body,
        windows: rows.map((r) => ({
          label: `${r.label}${r.changesMidway ? ' ·' : ''}`,
          sub: r.why,
          pct: r.score,
        })),
      };
    },
  },

  {
    id: 'elect.moments',
    asks: 'what is the best day and hour for me to do this, pick an auspicious time to start, '
      + 'when should I sign or buy or launch or travel, choose a date and time for me',
    title: (c) => `Best times ${c.subject ? `to ${c.subject}` : 'to act'}`,
    run: (c) => {
      const task = c.subject ? taskTableFor(c.subject) : null;
      // ⚠️ HARD CAP on the scan window.
      //
      // The electional scan walks EVERY DAY in the range, each a full ephemeris evaluation,
      // then rescans the winning days hour by hour. On a five-year window — which is the
      // default for a life-event question, and this capability is often chosen alongside one
      // — that is ~1,800 evaluations and the request simply hangs. It happened on the first
      // real question after the planner landed.
      //
      // Capping is also the honest thing rather than merely the fast one: nobody plans a
      // specific hour three years out, and an auspicious moment that far away is not
      // actionable advice.
      const MAX_SCAN_DAYS = 92;
      const scanTo = new Date(Math.min(
        c.to.getTime(), c.from.getTime() + MAX_SCAN_DAYS * 86400000,
      ));
      const ms = bestMoments(c.chart, ephem, c.lat, c.lng, c.from, scanTo,
        { task: task ?? undefined, limit: 5 });
      if (ms.length === 0) return null;
      const top = ms[0]!;
      const lead = top.reasons[0]?.why;
      // Say the scanned range when it is narrower than the one asked about, rather than
      // implying the whole horizon was searched.
      const clamped = scanTo.getTime() < c.to.getTime();
      const scanLabel = clamped ? 'the next three months' : c.windowLabel;
      return {
        id: 'elect.moments',
        title: `Best times ${c.subject ? `to ${c.subject}` : 'to act'}`,
        body: [
          `The best time ${c.subject ? `to ${c.subject}` : 'to act'} in ${scanLabel} is `
          + `${dmy(top.day)} at about ${hm(top.best)}, scoring ${top.score} out of 100.`
          + (lead ? ` ${Cap(lead)}.` : ''),
          task
            ? 'This used the classical table for that specific undertaking, so the exact '
              + 'configuration of the sky was scored too, not just the day.'
            : 'There is no classical table for that specific undertaking — the source names '
              + 'five, and this is not one of them. It was scored on the general rules instead, '
              + 'which are classical in their own right rather than a fallback.',
          'Unlike everything else here, this is good to the hour: it is computed forward from '
          + 'today and barely touches your birth time, so the uncertainty that blurs '
          + 'life-event windows does not apply.',
        ],
        windows: ms.map((m) => ({
          label: `${dmy(m.day)}, around ${hm(m.best)}`,
          sub: m.reasons[0]?.why ?? '', pct: m.score,
        })),
      };
    },
  },

  {
    id: 'timing.windows',
    asks: 'when will this happen, which months are strongest for it, how long until it comes, '
      + 'when is my best stretch for this, which year',
    title: (c) => `Best stretches opening in ${c.windowLabel}`,
    run: (c) => {
      const best = bestWindows(c.chart, c.birth, c.area, c.from, c.to, 5);
      if (best.length === 0) return null;
      const top = best[0]!;
      const body = [
        `The strongest stretch for ${label(c.area)} opening in ${c.windowLabel} is `
        + `${spanPhrase(top.start, top.end)} — precisely ${dmy(top.start)} to ${dmy(top.end)}, `
        + `scoring ${top.composite} out of 100. Boundaries are good to ${top.uncertainty}.`
        + (top.end > c.to ? ` It begins inside ${c.windowLabel} and carries on past it.` : ''),
      ];
      if (best[1]) {
        const d = Math.round((top.composite - best[1].composite) * 10) / 10;
        body.push(d < 3
          ? `The next, ${spanPhrase(best[1].start, best[1].end)} at ${best[1].composite}, is `
            + `within ${d} points — treat them as equally good and choose on practical grounds.`
          : `The next best is ${spanPhrase(best[1].start, best[1].end)} at `
            + `${best[1].composite}, ${d} points behind.`);
      }
      return {
        id: 'timing.windows',
        title: `Best stretches opening in ${c.windowLabel}`,
        body,
        windows: best.map((w) => ({
          label: spanPhrase(w.start, w.end),
          sub: `${dmy(w.start)} → ${dmy(w.end)} · ${w.uncertainty}`,
          pct: w.composite,
        })),
      };
    },
  },

  {
    id: 'env.state',
    asks: 'what is actually happening around this right now, what is the situation like at the '
      + 'moment, how are things going with this currently',
    title: (c) => `What is actually happening around ${label(c.area)}`,
    run: (c) => {
      const w = stackAt(c.chart, c.birth, c.area, c.now)
        .find((s) => s.level === 'pratyantar')?.window;
      if (!w) return null;
      const pos = w.reasons.filter((r) => r.delta > 0).slice(0, 2).map((r) => r.why);
      const neg = w.reasons.filter((r) => r.delta < 0).slice(0, 2).map((r) => r.why);
      const body = [
        `The situation itself — separately from how you are reading it — scores ${w.strength} `
        + `out of 100 for ${label(c.area)}, which is ${verdict(w.strength)}. This runs until `
        + `${dmy(w.end)} (${w.uncertainty}).`,
      ];
      if (pos.length) body.push(`Working for you: ${pos.join('; ')}.`);
      if (neg.length) body.push(`Working against you: ${neg.join('; ')}.`);
      return { id: 'env.state', title: `What is actually happening around ${label(c.area)}`, body };
    },
  },

  {
    id: 'mind.state',
    asks: 'how am I seeing things right now, is my judgement clear at the moment, am I reading '
      + 'this accurately or is it me, what is my own state of mind',
    title: () => 'How you are seeing it right now',
    run: (c) => {
      const w = stackAt(c.chart, c.birth, 'self', c.now)
        .find((s) => s.level === 'pratyantar')?.window;
      if (!w) return null;
      const s = w.strength;
      const body = [
        s >= 60
          ? `Your own footing is solid — ${s} out of 100. You are reading things roughly as `
            + `they are, so if something feels wrong, treat it as wrong rather than assuming `
            + `you are being oversensitive.`
          : s >= 48
            ? `Your own footing is ordinary — ${s} out of 100. Not distorted, but not sharp `
              + `either. A decision made now will look about as good in a year as it does today.`
            : `Your own footing is poor — ${s} out of 100. This is the part people miss: the `
              + `situation may be no worse than usual while your reading of it is. Expect to `
              + `over-weight setbacks and under-weight what is going fine.`,
      ];
      const neg = w.reasons.filter((r) => r.delta < 0).slice(0, 2);
      if (neg.length && s < 52) {
        body.push(`Specifically: ${neg.map((r) => r.why).join('; ')}. That lifts on ${dmy(w.end)}.`);
      }
      return { id: 'mind.state', title: 'How you are seeing it right now', body };
    },
  },

  {
    id: 'block.analysis',
    asks: 'why is this blocked, what is holding it back, what is standing in the way, why does '
      + 'nothing move here, what is the obstacle and when does it clear',
    title: (c) => `What is blocking ${label(c.area)}, and when that clears`,
    run: (c) => {
      const w = stackAt(c.chart, c.birth, c.area, c.now)
        .find((s) => s.level === 'pratyantar')?.window;
      if (!w) return null;
      const turn = nextTurn(c.chart, c.birth, c.area, c.now, 60, 58);
      const drivers = driversFor(c.chart, c.area);
      const weakest = drivers[drivers.length - 1];
      const neg = w.reasons.filter((r) => r.delta < 0);
      const body: string[] = [];

      body.push(w.strength < 52
        ? (neg.length
          ? `The block is not vague. In this chart ${label(c.area)} ${isAre(c.area)} held back `
            + `because ${neg.map((r) => r.why).join(', and because ')}.`
          : `${Cap(label(c.area))} ${isAre(c.area)} running below the midpoint at ${w.strength} `
            + `out of 100 — a drag rather than a wall.`)
        : `There is no structural block on ${label(c.area)} right now — the score is `
          + `${w.strength} out of 100, which is ${verdict(w.strength)}. If it feels stuck, the `
          + `cause is more likely circumstance than the chart.`);

      if (weakest && weakest.score < 0.45) {
        body.push(`The weakest influence on this matter in your chart scores `
          + `${Math.round(weakest.score * 100)} out of 100. That is the ceiling on how easy `
          + `this area gets for you — it improves in stretches without becoming effortless.`);
      }
      body.push(turn
        ? `It changes on ${dmy(turn.start)}, when a stretch scoring ${turn.composite} out of `
          + `100 opens and runs to ${dmy(turn.end)} — `
          + `${Math.round((turn.start.getTime() - c.now.getTime()) / (30.44 * 86400000))} `
          + `months away.`
        : `Nothing in the next five years lifts this above 58 out of 100. That is a real `
          + `finding rather than a gap: this area stays effortful for you rather than waiting `
          + `on a date to unlock.`);
      return {
        id: 'block.analysis',
        title: `What is blocking ${label(c.area)}, and when that clears`,
        body,
      };
    },
  },

  {
    id: 'timing.now',
    asks: 'what period am I in, where am I right now, what phase is running, how long does this '
      + 'last, when does the current stretch end',
    title: () => 'Where you are now',
    run: (c) => {
      const stack = stackAt(c.chart, c.birth, c.area, c.now);
      const short = stack.find((s) => s.level === 'pratyantar')?.window;
      const mid = stack.find((s) => s.level === 'antar')?.window;
      const long = stack.find((s) => s.level === 'maha')?.window;
      if (!short || !mid || !long) return null;
      const body = [
        `Three stretches of time are running at once, and for ${label(c.area)} they disagree. `
        + `The long one — the backdrop to your next several years — scores ${long.strength} and `
        + `runs to ${my(long.end)}. Inside it the medium stretch scores ${mid.strength} and `
        + `ends ${dmy(mid.end)}. The short one you are living through scores ${short.strength} `
        + `and ends ${dmy(short.end)}.`,
      ];
      const gap = short.strength - long.strength;
      if (Math.abs(gap) >= 8) {
        body.push(gap > 0
          ? `The short stretch is ${Math.round(gap)} points better than the backdrop — which is `
            + `why things feel like they are moving, and also why it does not last past `
            + `${dmy(short.end)}.`
          : `The short stretch is ${Math.round(-gap)} points worse than the backdrop. The `
            + `underlying period is not the problem; this shorter one is, and it clears on `
            + `${dmy(short.end)}.`);
      }
      return {
        id: 'timing.now',
        title: 'Where you are now',
        body,
        windows: stack.map((s) => ({
          label: s.level === 'maha' ? 'the years you are in'
            : s.level === 'antar' ? 'the months you are in' : 'the weeks you are in',
          sub: `${dmy(s.window.start)} → ${dmy(s.window.end)} · ${s.window.uncertainty}`,
          pct: s.window.strength,
        })),
      };
    },
  },

  {
    id: 'chart.findings',
    asks: 'what does my chart say about me in this area, what am I like here, what are the fixed '
      + 'features of this part of my life, describe this side of me',
    title: (c) => `What your chart says about ${label(c.area)}`,
    run: (c) => {
      const domains = AREA_DOMAINS[c.area] ?? [];
      const quotes = c.findings
        .filter((f) => domains.includes(f.domain))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)
        .map((f) => f.summary);
      if (quotes.length === 0) return null;
      return {
        id: 'chart.findings',
        title: `What your chart says about ${label(c.area)}`,
        body: ['These are fixed features of your chart rather than passing phases — they hold '
          + 'whatever the current stretch is doing.'],
        quotes,
      };
    },
  },

  {
    id: 'chart.drivers',
    asks: 'what is strongest and weakest in my chart for this, what carries this area, what '
      + 'lets it down, how well equipped am I for this',
    title: (c) => `How well equipped you are for ${label(c.area)}`,
    run: (c) => {
      const d = driversFor(c.chart, c.area);
      if (d.length < 3) return null;
      const best = d[0]!;
      const worst = d[d.length - 1]!;
      const spread = Math.round((best.score - worst.score) * 100);
      return {
        id: 'chart.drivers',
        title: `How well equipped you are for ${label(c.area)}`,
        body: [
          `Across everything that bears on ${label(c.area)}, the strongest influence in your `
          + `chart scores ${Math.round(best.score * 100)} out of 100 and the weakest `
          + `${Math.round(worst.score * 100)} — a spread of ${spread} points.`,
          spread > 30
            ? 'That is a wide spread, which usually shows up as this area going very well or '
              + 'very badly rather than trundling along in the middle.'
            : 'That is a narrow spread, which usually shows up as this area being steady — '
              + 'rarely spectacular, rarely a disaster.',
        ],
      };
    },
  },
];

/** Which rule-corpus domains feed each area. */
const AREA_DOMAINS: Record<string, string[]> = {
  self: ['self', 'mind', 'body'], partnership: ['partnership'], career: ['career'],
  wealth: ['wealth', 'gains'], gains: ['gains', 'wealth'], home: ['home'],
  children: ['children'], health: ['health'], education: ['children', 'mind'],
  travel: ['release', 'fortune'], obstacles: ['transformation', 'release'],
  spirituality: ['fortune', 'release'], change: ['transformation'], release: ['release'],
  courage: ['siblings'], fortune: ['fortune'],
};

export function buildChart(birth: {
  date: string; time?: string; unknownTime: boolean; place: string;
  lat: number; lng: number; tzOffsetMinutes: number;
}): { chart: Chart; birthInstant: Date } {
  const chart = computeChart(birth, ephem);
  return { chart, birthInstant: jdToDate(chart.julianDayUT) };
}

export { jdFromDate };

export const THE_MODEL_CHOOSES_WHAT_TO_RUN_NOT_WHAT_TO_SAY =
  'The encoder ranks these capabilities against the question and the planner runs the ones that '
  + 'clear the floor, leading with whichever answers the literal ask. That is what makes the '
  + 'skeleton dynamic: two questions about the same area produce different sections in a '
  + 'different order. What the model never does is write a sentence — every word is assembled '
  + 'from a computed number, a computed date, or our own fixed phrasing, which is the one '
  + 'property this product cannot trade away.';
