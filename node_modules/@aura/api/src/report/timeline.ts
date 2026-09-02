// Time: the dasha tree, the transit spine, and the two halves of a decade read against them.
//
// The natal half of this report says what is true always. This half says WHEN, and it is built
// from two independent clocks that the classical method reads together:
//
//   - the dashas, which run from the Moon's position at birth and depend on nothing in the sky
//     afterwards — a schedule fixed at the first breath;
//   - the transits, which depend on nothing about the person at all, only on where the planets
//     have actually got to.
//
// Neither alone is a reading. A period that promises well while the sky is against it, and a
// benefic transit through a house whose period lord is buried, are the two commonest ways a
// single-clock forecast goes wrong. So every year below states both, and where they disagree it
// says so rather than averaging them into a number that hides the disagreement.

import {
  getPeriodsAt, getStackAt, computeTransit, sadeSatiPhase, transitTimeline, stations,
  computeAshtakavarga, bestWindows, bestMoments, rateSeries, driversFor, nextTurn,
  AREAS, AREA_HOUSES, GRAHAS, SIGN_NAMES, SIGN_LORD, VIMSHOTTARI_ORDER,
  type Chart, type Graha, type House, type Area, type Ingress,
} from '@aura/engine';
import {
  dashaBalanceAtBirth, ashtottariBalanceAtBirth, muntha, MUNTHA_IN_HOUSE,
  sudarsanaDasa, narayanaProgression, shoolaDasa, kendradiProgression,
  BPHS_HOUSE_INDICATIONS,
} from '@aura/knowledge';
import {
  section, sub, table, facts, note, withheld, score, chip, esc,
  dmy, dmyShort, my, hm, cap,
} from './render.js';
import { ephem, type ComposedChart } from './facts.js';

const SIGN = (i: number): string => SIGN_NAMES[((i % 12) + 12) % 12] ?? '—';
const G = (g: string): string => cap(g);
const ord = (n: number): string => {
  const t = n % 100;
  const suf = t >= 11 && t <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suf}`;
};
const houseOf = (chart: Chart, sign: number): House =>
  ((((sign - chart.lagnaSign) % 12) + 12) % 12 + 1) as House;

const YEAR = 365.2425 * 86400000;

// ─────────────────────────────────────────────────────────────────────────────
// Dashas
// ─────────────────────────────────────────────────────────────────────────────

export function dashaSection(c: ComposedChart, at: Date): string {
  const { chart, birthInstant } = c;
  const moonLong = chart.planets.moon.siderealLong;
  const bal = dashaBalanceAtBirth(moonLong);

  const mahas = getPeriodsAt(moonLong, birthInstant, 'maha', birthInstant,
    new Date(birthInstant.getTime() + 120 * YEAR));

  const rows = mahas.map((m) => {
    const live = at >= m.start && at < m.end;
    const past = m.end <= at;
    const pp = chart.planets[m.lord];
    const yrs = (m.end.getTime() - m.start.getTime()) / YEAR;
    return [
      `${live ? '<b>' : ''}${G(m.lord)}${live ? '</b> ' + chip('running now', 'good') : ''}`,
      dmyShort(m.start), dmyShort(m.end), yrs.toFixed(1),
      `${SIGN(pp.sign)}, ${ord(pp.house)} house`,
      score(pp.strength * 100),
      past ? chip('past') : live ? chip('now', 'good') : chip('ahead'),
    ];
  });

  // The antardashas inside whichever maha is running, and the pratyantars inside the
  // antardasha running today — the level a person actually feels.
  const liveMaha = mahas.find((m) => at >= m.start && at < m.end);
  let antarBlock = '';
  let pratyBlock = '';
  if (liveMaha) {
    const antars = getPeriodsAt(moonLong, birthInstant, 'antar', liveMaha.start, liveMaha.end);
    antarBlock = table(['Sub-period', 'From', 'To', 'Months', 'Its lord stands', 'Strength', ''],
      antars.map((a) => {
        const live = at >= a.start && at < a.end;
        const pp = chart.planets[a.lord];
        const mo = (a.end.getTime() - a.start.getTime()) / (30.44 * 86400000);
        return [
          `${live ? '<b>' : ''}${G(a.lord)}${live ? '</b>' : ''}`,
          dmyShort(a.start), dmyShort(a.end), mo.toFixed(1),
          `${SIGN(pp.sign)}, ${ord(pp.house)} house`,
          score(pp.strength * 100),
          a.end <= at ? chip('past') : live ? chip('now', 'good') : chip('ahead'),
        ];
      }));

    const liveAntar = antars.find((a) => at >= a.start && at < a.end);
    if (liveAntar) {
      const pr = getPeriodsAt(moonLong, birthInstant, 'pratyantar', liveAntar.start, liveAntar.end);
      pratyBlock = table(['Lord', 'From', 'To', 'Days', ''],
        pr.map((x) => {
          const live = at >= x.start && at < x.end;
          const d = (x.end.getTime() - x.start.getTime()) / 86400000;
          return [
            `${live ? '<b>' : ''}${G(x.lord)}${live ? '</b>' : ''}`,
            dmyShort(x.start), dmyShort(x.end), d.toFixed(0),
            x.end <= at ? chip('past') : live ? chip('now', 'good') : chip('ahead'),
          ];
        }));
    }
  }

  const stack = getStackAt(moonLong, birthInstant, at);

  return section({
    id: 'dashas',
    title: 'The Vimshottari dashas — the schedule fixed at birth',
    intro: 'The whole 120-year cycle is determined by one number: the Moon\'s longitude at the '
      + 'birth moment. Nothing that happens in the sky afterwards moves a single one of these '
      + 'dates.',
    body: facts([
      ['Moon at birth', `${SIGN(chart.planets.moon.sign)} — nakshatra ${bal.nakshatra + 1}, `
        + `ruled by <b>${G(bal.lord)}</b>`],
      ['Balance at birth', `${bal.yearsLeft.toFixed(2)} years of ${G(bal.lord)} remained `
        + `(${(bal.fractionLeft * 100).toFixed(1)}% of that period unspent)`],
      ['Running today', stack
        ? `${G(stack.maha)} → ${G(stack.antar)} → ${G(stack.pratyantar)} `
          + `→ ${G(stack.sookshma)} → ${G(stack.prana)}`
        : '—'],
    ])
    + sub('The nine major periods, in order',
      table(['Period lord', 'From', 'To', 'Years', 'That lord stands', 'Strength', ''], rows))
    + (antarBlock ? sub('Sub-periods inside the major period now running', antarBlock) : '')
    + (pratyBlock ? sub('And inside the sub-period running today', pratyBlock) : '')
    + note('Read the three together. The major period sets the decade\'s subject; the '
      + 'sub-period decides which part of that subject is live; the third level is what a '
      + 'week actually feels like. Where all three lords are well placed, the period delivers '
      + 'what it promises — where they disagree, so does the year.')
    + withheld('Boundary dates carry an uncertainty this table does not show',
      'Each boundary is exact given the birth time. A birth time known only to the minute '
      + 'moves every date here by roughly two days at the major level; one known only to the '
      + 'hour moves them by months. Treat these as centres, not edges.'),
  });
}

export function otherDashaSection(c: ComposedChart, at: Date): string {
  const { chart, birthInstant } = c;
  const moonLong = chart.planets.moon.siderealLong;
  const ageYears = (at.getTime() - birthInstant.getTime()) / YEAR;
  const yearNumber = Math.floor(ageYears) + 1;

  const blocks: string[] = [];

  // Ashtottari — the 108-year conditional system.
  try {
    const ab = ashtottariBalanceAtBirth(moonLong);
    blocks.push(sub('Ashtottari (108 years)', facts([
      ['Starting lord', `<b>${G(ab.lord)}</b>`],
      ['Balance at birth', `${ab.yearsLeft.toFixed(2)} years remained`],
    ]) + note('A conditional system — the classical texts apply it only when particular '
      + 'birth conditions are met, so it is shown as an alternative reading rather than a '
      + 'competing one.')));
  } catch { /* system unavailable for this chart */ }

  // The rasi dashas — sign-based rather than planet-based.
  try {
    const sd = sudarsanaDasa(chart.lagnaSign, yearNumber);
    blocks.push(sub('Sudarsana Chakra — the year read from three reference points', facts([
      ['Year of life', String(yearNumber)],
      ['Active house', `${ord(sd.house)} from the ascendant — ${SIGN(sd.dasaSign)}`],
      ['Monthly sub-periods', sd.antardashas.map((a) => SIGN(a.sign).slice(0, 3)).join(' → ')],
    ]) + note('Sudarsana runs the same wheel three times over — from the ascendant, from the '
      + 'Moon and from the Sun. Where all three point at one house, that department of life '
      + 'is where the year happens.')));
  } catch { /* not resolvable */ }

  try {
    const nar = narayanaProgression(chart.lagnaSign);
    blocks.push(sub('Narayana Dasa — the sign sequence',
      note(`The progression from this ascendant runs `
        + `${nar.slice(0, 12).map((s) => SIGN(s).slice(0, 3)).join(' → ')}. `
        + `Direction and starting motion depend on whether the seed sign is odd- or `
        + `even-footed, and on Saturn's and Ketu's presence in it.`)));
  } catch { /* not resolvable */ }

  try {
    const sh = shoolaDasa(chart.lagnaSign);
    void sh;
    const kd = kendradiProgression(chart.lagnaSign, true);
    blocks.push(sub('Kendradi Rasi Dasa — the order',
      note(`Kendras first, then panapharas, then apoklimas: `
        + `${kd.map((s) => SIGN(s).slice(0, 3)).join(' → ')}.`)));
  } catch { /* not resolvable */ }

  // Tajaka: the solar-return year.
  try {
    const m = muntha(chart.lagnaSign, yearNumber);
    const mh = houseOf(chart, m);
    blocks.push(sub('The solar-return year (Tajaka)', facts([
      ['Year of life', `${yearNumber} — beginning at the solar return nearest ${my(at)}`],
      ['Muntha', `${SIGN(m)}, the ${ord(mh)} house`],
      ['Which colours the year toward', esc(MUNTHA_IN_HOUSE[mh] ?? '—')],
    ])));
  } catch { /* not resolvable */ }

  return section({
    id: 'other-dashas',
    title: 'The other period systems',
    intro: 'Vimshottari is the default and the one every date in this document uses. The '
      + 'classical corpus carries several others, each with its own conditions of use. They '
      + 'are shown here because they are computable for this chart — not because they '
      + 'overrule anything above.',
    body: blocks.join('\n') || note('No alternative system resolved for this chart.'),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Transits
// ─────────────────────────────────────────────────────────────────────────────

/** One ingress, read against this chart rather than reported as an astronomical event. */
function ingressRow(c: ComposedChart, ing: Ingress, sav: number[] | null): string[] {
  const { chart } = c;
  const house = houseOf(chart, ing.toSign);
  const occupants = GRAHAS.filter((g) => chart.planets[g].sign === ing.toSign);
  const bindus = sav ? sav[ing.toSign]! : null;
  const ind = (BPHS_HOUSE_INDICATIONS as never as Record<number, string[] | string>)[house];
  const matter = Array.isArray(ind) ? ind.slice(0, 3).join(', ') : String(ind ?? '');

  return [
    dmyShort(ing.at),
    `<b>${G(ing.graha)}</b>${ing.retrograde ? ' ' + chip('retro', 'warn') : ''}`,
    `${SIGN(ing.fromSign)} → <b>${SIGN(ing.toSign)}</b>`,
    `${ord(house)} — ${esc(matter)}`,
    bindus != null
      ? `${bindus} ${chip(bindus >= 30 ? 'well stocked' : bindus >= 25 ? 'average' : 'thin',
        bindus >= 30 ? 'good' : bindus >= 25 ? '' : 'warn')}`
      : '—',
    occupants.length ? occupants.map(G).join(', ') : '—',
  ];
}

export function transitSection(c: ComposedChart, from: Date, to: Date, id: string,
  title: string, intro: string): string {
  const { chart } = c;
  let sav: number[] | null = null;
  try { sav = computeAshtakavarga(chart).sav; } catch { sav = null; }

  const timeline = transitTimeline(ephem, from, to);
  const rows = timeline.map((i) => ingressRow(c, i, sav));

  // Stations of the five that turn. A planet standing still is doing its most concentrated
  // work, and the dates are the ones people actually notice.
  const st = (['mercury', 'venus', 'mars', 'jupiter', 'saturn'] as Graha[])
    .flatMap((g) => stations(ephem, g, from, to))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  return section({
    id, title, intro,
    body: table(
      ['Date', 'Planet', 'Moves', 'Into your house', 'Its supply', 'Your planets there'],
      rows,
    )
    + sub(`Stations — where a planet stops and turns (${st.length} in this span)`,
      table(['Date', 'Planet', 'Turns', 'At'],
        st.map((s) => [
          dmyShort(s.at), `<b>${G(s.graha)}</b>`,
          s.kind === 'retrograde' ? chip('retrograde', 'warn') : chip('direct', 'good'),
          `${SIGN(s.sign)} — your ${ord(houseOf(chart, s.sign))} house`,
        ])))
    + note('"Your house" is where the transiting sign falls counted from your own ascendant, '
      + 'which is what makes this yours rather than everyone\'s. "Its supply" is that sign\'s '
      + 'ashtakavarga total in your chart: the same transit lands very differently through a '
      + 'sign you have 34 points in and one you have 21 in.'),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Year by year
// ─────────────────────────────────────────────────────────────────────────────

/** The areas whose composite is strongest and weakest in a given span. */
function areaExtremes(chart: Chart, birth: Date, from: Date, to: Date, at: Date) {
  const scored = AREAS.map((a) => {
    try {
      const pts = rateSeries(chart, birth, a, from, to, 'month');
      if (!pts.length) return null;
      const mean = pts.reduce((n, r) => n + r.score, 0) / pts.length;
      return { area: a, mean, best: [...pts].sort((x, y) => y.score - x.score)[0]! };
    } catch { return null; }
  }).filter(Boolean) as { area: Area; mean: number; best: { label: string; score: number } }[];
  void at;
  scored.sort((a, b) => b.mean - a.mean);
  return scored;
}

export function yearByYearSection(c: ComposedChart, at: Date, backYears: number,
  forwardYears: number): string {
  const { chart, birthInstant } = c;
  const moonLong = chart.planets.moon.siderealLong;
  let sav: number[] | null = null;
  try { sav = computeAshtakavarga(chart).sav; } catch { sav = null; }

  const y0 = at.getUTCFullYear() - backYears;
  const y1 = at.getUTCFullYear() + forwardYears;
  const blocks: string[] = [];

  for (let y = y0; y <= y1; y++) {
    const from = new Date(Date.UTC(y, 0, 1));
    const to = new Date(Date.UTC(y, 11, 31, 23, 59, 59));
    const isPast = to < at;
    const isNow = from <= at && at <= to;

    // Which periods ran in this year.
    const antars = getPeriodsAt(moonLong, birthInstant, 'antar', from, to);
    const periodLine = antars.length
      ? antars.map((a) => `<b>${G(a.lord)}</b> to ${dmyShort(a.end)}`).join(' · ')
      : '—';
    const mahaHere = getPeriodsAt(moonLong, birthInstant, 'maha', from, to);
    const mahaLine = mahaHere.map((m) => G(m.lord)).join(' → ');

    // What the sky did.
    const ings = transitTimeline(ephem, from, to);
    const ingLine = ings.length
      ? ings.map((i) => `${dmyShort(i.at)} ${G(i.graha)} → ${SIGN(i.toSign)} `
        + `(your ${ord(houseOf(chart, i.toSign))})`).join(' · ')
      : 'no slow-planet sign change this year';

    // Saturn against the natal Moon — the one transit everyone asks about by name.
    let sadeSati = '';
    try {
      const t = computeTransit(chart, new Date(Date.UTC(y, 6, 1)), ephem);
      const phase = sadeSatiPhase(t.houseFromMoon.saturn);
      sadeSati = phase
        ? `Saturn is in its ${phase} phase over your Moon this year`
        : `Saturn stands in the ${ord(t.houseFromMoon.saturn)} from your Moon — not a Sade Sati year`;
    } catch { sadeSati = '—'; }

    const areas = areaExtremes(chart, birthInstant, from, to, at);
    const top = areas.slice(0, 4);
    const bottom = areas.slice(-3).reverse();

    const munthaSign = muntha(chart.lagnaSign,
      Math.floor((from.getTime() - birthInstant.getTime()) / YEAR) + 1);

    blocks.push(`<div class="year">
<h4>${y}${isNow ? ' ' + chip('this year', 'good') : isPast ? ' ' + chip('past') : ''}</h4>
${facts([
      ['Major period', mahaLine || '—'],
      ['Sub-periods running', periodLine],
      ['Sky changes', esc(ingLine)],
      ['Saturn and your Moon', esc(sadeSati)],
      ['Muntha', `${SIGN(munthaSign)} — the ${ord(houseOf(chart, munthaSign))} house, `
        + `${esc(MUNTHA_IN_HOUSE[houseOf(chart, munthaSign)] ?? '—')}`],
      ['Strongest departments', top.map((a) => `${esc(a.area)} ${score(a.mean)}`).join(' ')],
      ['Thinnest departments', bottom.map((a) => `${esc(a.area)} ${score(a.mean)}`).join(' ')],
      ['Best month', top[0] ? `${esc(top[0].best.label)} for ${esc(top[0].area)} `
        + `at ${top[0].best.score.toFixed(1)}` : '—'],
    ])}
</div>`);
  }
  void sav;

  return section({
    id: 'year-by-year',
    title: `Year by year — ${y0} to ${y1}`,
    intro: 'Each year read on both clocks at once: which periods were or will be running, what '
      + 'the slow planets did to your houses, and which departments of life the two together '
      + 'favour. Past years are included deliberately — a forecast you cannot check against '
      + 'your own memory is not worth much.',
    body: blocks.join('\n')
    + note('The department scores are the same composite used everywhere else in this '
      + 'document: 0–100, blending the three period levels. They compare departments within a '
      + 'year and years within a department; they are not a probability of anything.'),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Life-area windows and electional moments
// ─────────────────────────────────────────────────────────────────────────────

export function areaWindowsSection(c: ComposedChart, at: Date, years: number): string {
  const { chart, birthInstant } = c;
  const to = new Date(at.getTime() + years * YEAR);

  const blocks = AREAS.map((a) => {
    let ws: ReturnType<typeof bestWindows> = [];
    try { ws = bestWindows(chart, birthInstant, a, at, to, 4); } catch { ws = []; }
    if (!ws.length) return '';
    const houses = (AREA_HOUSES as Record<string, readonly number[]>)[a] ?? [];
    let drivers = '';
    try {
      drivers = driversFor(chart, a).slice(0, 3)
        .map((d) => `${G(d.graha)} ${score(d.score * 100)}`).join(' ');
    } catch { drivers = ''; }

    return sub(`${cap(a)} — houses ${houses.join(', ')}`,
      (drivers ? `<p class="note">Carried in your chart by: ${drivers}</p>` : '')
      + table(['Window', 'From', 'To', 'Strength', 'Why'],
        ws.map((w) => [
          my(w.start), dmyShort(w.start), dmyShort(w.end),
          score(w.composite ?? w.strength),
          esc(w.reasons?.[0]?.why ?? '—'),
        ])));
  }).filter(Boolean);

  return section({
    id: 'area-windows',
    title: `The strongest windows for each department, ${at.getUTCFullYear()}–${to.getUTCFullYear()}`,
    intro: 'Sixteen departments of life, each with the four stretches in the next '
      + `${years} years when this chart most supports it. These are windows of SUPPORT, which `
      + 'is necessary and not sufficient — the strongest window in the world does nothing if '
      + 'nobody acts inside it.',
    body: blocks.join('\n'),
  });
}

export function electionalSection(c: ComposedChart, at: Date): string {
  const { chart } = c;
  const to = new Date(at.getTime() + 92 * 86400000);
  let ms: ReturnType<typeof bestMoments> = [];
  try {
    ms = bestMoments(chart, ephem, chart.birth.lat, chart.birth.lng, at, to, { limit: 12 });
  } catch { ms = []; }

  return section({
    id: 'electional',
    title: 'The best moments to begin something, next ninety days',
    intro: 'Unlike everything else here, this is good to the hour. It is computed forward from '
      + 'today and barely touches the birth time, so the uncertainty that blurs the '
      + 'life-window dates does not apply to it.',
    body: (ms.length
      ? table(['Date', 'Hour', 'Score', 'Why this one'],
        ms.map((m) => [
          dmy(m.day), hm(m.best), score(m.score), esc(m.reasons?.[0]?.why ?? '—'),
        ]))
      : note('No moments could be scored in this range.'))
    + note('Ninety days is a deliberate cap, not a limitation of the method. Nobody plans a '
      + 'specific hour three years out, and an auspicious moment that far away is not '
      + 'actionable advice.'),
  });
}

export function turningSection(c: ComposedChart, at: Date): string {
  const { chart, birthInstant } = c;
  const rows = AREAS.map((a) => {
    try {
      // `nextTurn` returns the next window whose blended figure clears the threshold — so
      // the "turn" is its START, and the figure it turns TO is its composite.
      const t = nextTurn(chart, birthInstant, a, at);
      if (!t) return null;
      return [
        cap(a),
        dmyShort(t.start),
        score(t.composite),
        esc(t.reasons?.[0]?.why ?? '—'),
        `${dmyShort(t.start)} to ${dmyShort(t.end)} · ${esc(t.uncertainty)}`,
      ];
    } catch { return null; }
  }).filter(Boolean) as string[][];

  return section({
    id: 'turns',
    title: 'The next change of direction in each department',
    intro: 'The next stretch ahead, department by department, that clears the threshold worth '
      + 'naming. Where a department is missing, nothing in the next five years clears it — '
      + 'which is itself worth knowing.',
    body: rows.length
      ? table(['Department', 'Opens', 'Rising to', 'What carries it', 'The full stretch'], rows)
      : note('No upcoming stretch clears the threshold in the next five years for any '
        + 'department. That is a real answer rather than a gap: the strong periods in this '
        + 'chart are either behind it, or further out than the search window reaches.'),
  });
}

export const TWO_CLOCKS =
  'Dashas run from the Moon at birth and ignore the sky thereafter; transits run from the sky '
  + 'and ignore the person entirely. A forecast built on one alone fails in a predictable '
  + 'direction — a promising period under a hostile sky, or a benefic transit through a house '
  + 'whose period lord is buried. Every year in this document states both, and where they '
  + 'disagree it says so rather than averaging them into a number that hides it.';
