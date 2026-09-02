// How each part of this life actually WORKS — the channel, not just the verdict.
//
// The rest of the report says how strong a matter is. This says how it arrives, which is the
// more useful half and the one a strength score cannot carry. The classical mechanism is
// direct and it is already encoded: **a house says what the matter is; its lord's placement
// says the route the matter takes.** The tenth lord in the seventh means standing arrives
// through other people — partners, clients, a public. The same lord in the twelfth means it
// arrives from somewhere far away, or not at all through the front door.
//
// All 144 of those cells are encoded with a valence, so "what works", "what works with effort"
// and "what will not work this way" are readable off the chart rather than composed by hand.
// That is the whole of this file: read the channel, read its capacity, and say plainly which
// of the three it is.
//
// The valences are the source's judgement of the MATTER, not of the person. A sixth lord well
// placed is good for the native and bad for their obstacles; the sign follows the native.

import {
  computeAshtakavarga, getPeriodsAt, GRAHAS, SIGN_NAMES, SIGN_LORD,
  type Chart, type Graha, type House,
} from '@aura/engine';
import {
  ALL_LORD_PLACEMENTS, ALL_LORD_MATTER, FUNCTIONAL_NATURE,
  BPHS_HOUSE_INDICATIONS, dasamsaRuler, navamsaClass, ambulationClass, RISING_TYPE,
  TRANSIT_FROM_MOON, VEDHA_STHAANA, prosperityConfiguration,
} from '@aura/knowledge';
import {
  section, sub, table, facts, note, withheld, score, chip, esc, cap, dmyShort,
} from './render.js';
import type { ComposedChart } from './facts.js';

const SIGN = (i: number): string => SIGN_NAMES[((i % 12) + 12) % 12] ?? '—';
const G = (g: string): string => cap(g);
const ord = (n: number): string => {
  const t = n % 100;
  const suf = t >= 11 && t <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suf}`;
};
const lordOfHouse = (chart: Chart, h: number): Graha =>
  SIGN_LORD[(chart.lagnaSign + h - 1) % 12]!;
const houseOf = (chart: Chart, sign: number): House =>
  ((((sign - chart.lagnaSign) % 12) + 12) % 12 + 1) as House;

/** What each house is, in the words a person would use rather than the classical list. */
const DOMAIN: Record<number, string> = {
  1: 'You yourself — vitality, bearing, how you start things',
  2: 'Money you keep, what you own, family and speech',
  3: 'Nerve, initiative, siblings, short journeys',
  4: 'Home, land, mother, and the feeling of being settled',
  5: 'Children, creativity, learning, judgement',
  6: 'Obstacles, rivals, debt, service and the daily grind',
  7: 'Partnership — marriage, business partners, the public',
  8: 'Upheaval, inheritance, other people\'s resources, the hidden',
  9: 'Luck, teachers, belief, long journeys, the father',
  10: 'Career, standing, what you are known for',
  11: 'Gains, income, networks, what you want and get',
  12: 'Letting go, foreign places, retreat, what you spend',
};

interface Channel {
  house: number;
  lord: Graha;
  lordHouse: number;
  valence: number;
  summary: string;
  excluded?: string;
  bindus: number | null;
  strength: number;
  dignity: number;
  functional: 'benefic' | 'malefic' | 'neutral' | 'unclassified';
}

function channels(c: ComposedChart): Channel[] {
  const { chart } = c;
  let sav: number[] | null = null;
  try { sav = computeAshtakavarga(chart).sav; } catch { sav = null; }
  const fn = FUNCTIONAL_NATURE.find((f) => f.lagna === chart.lagnaSign);

  const out: Channel[] = [];
  for (let h = 1; h <= 12; h++) {
    const lord = lordOfHouse(chart, h);
    const pos = chart.planets[lord];
    const cell = ALL_LORD_PLACEMENTS.find((x) => x.lord === h && x.house === pos.house);
    const sign = (chart.lagnaSign + h - 1) % 12;
    out.push({
      house: h,
      lord,
      lordHouse: pos.house,
      valence: cell?.valence ?? 0,
      summary: cell?.summary ?? '',
      excluded: cell?.excluded,
      bindus: sav ? sav[sign]! : null,
      strength: pos.strength,
      dignity: pos.dignity,
      functional: fn?.benefics.includes(lord) ? 'benefic'
        : fn?.malefics.includes(lord) ? 'malefic'
          : fn?.neutrals.includes(lord) ? 'neutral' : 'unclassified',
    });
  }
  return out;
}

/**
 * The three-way verdict the whole section exists to give.
 *
 * Deliberately three bands and not a number. "Works", "works with effort" and "does not work
 * this way" are decisions somebody can act on; 63.4 out of 100 is not. The number is printed
 * alongside so the banding can be argued with.
 */
function verdict(ch: Channel): { band: 'works' | 'effort' | 'blocked'; why: string } {
  const supply = ch.bindus ?? 25;
  let s = 0;
  s += ch.valence * 2;                       // what the source says of this exact placement
  s += (ch.strength - 0.5) * 2;              // can the lord actually deliver
  s += (supply - 26) / 8;                    // is the house stocked
  s += ch.dignity * 0.8;                     // dignity of the lord
  if (ch.functional === 'benefic') s += 0.6;
  if (ch.functional === 'malefic') s -= 0.6;

  if (s >= 1.0) {
    return { band: 'works', why: 'the route is open and the planet running it can deliver' };
  }
  if (s >= -0.6) {
    return { band: 'effort', why: 'the route exists but returns roughly what is put in' };
  }
  return { band: 'blocked', why: 'this route costs more than it returns — use another one' };
}

const BAND_CHIP = {
  works: chip('works', 'good'),
  effort: chip('works with effort', 'warn'),
  blocked: chip('not through this route', 'bad'),
};

export function howItWorksSection(c: ComposedChart, at: Date): string {
  const { chart, birthInstant } = c;
  const chs = channels(c);
  const moonLong = chart.planets.moon.siderealLong;

  const blocks = chs.map((ch) => {
    const v = verdict(ch);
    const matter = ALL_LORD_MATTER[ch.house]?.matter ?? '';
    const ind = (BPHS_HOUSE_INDICATIONS as never as Record<number, string[] | string>)[ch.lordHouse];
    const arrivesVia = Array.isArray(ind) ? ind.slice(0, 4).join(', ') : String(ind ?? '');

    // When this route is live: the periods of the lord that runs it, in the next 25 years.
    let live = '';
    try {
      const to = new Date(at.getTime() + 25 * 365.2425 * 86400000);
      const ps = getPeriodsAt(moonLong, birthInstant, 'maha', at, to)
        .filter((p) => p.lord === ch.lord);
      live = ps.length
        ? ps.map((pp) => `${dmyShort(pp.start)} – ${dmyShort(pp.end)}`).join('; ')
        : 'no major period of this planet in the next 25 years — it works through its '
          + 'sub-periods instead';
    } catch { live = '—'; }

    return `<div class="year">
<h4>${ord(ch.house)} — ${esc(DOMAIN[ch.house] ?? '')} ${BAND_CHIP[v.band]}</h4>
${facts([
      ['How it reaches you', ch.lordHouse === ch.house
        ? `<b>Directly.</b> The ruler of this matter sits in its own house, so it arrives on `
          + 'its own terms rather than through anything else.'
        : `Through the <b>${ord(ch.lordHouse)}</b> — ${esc(arrivesVia)}. `
          + `The ruler of your ${ord(ch.house)} (${G(ch.lord)}) stands there, so this is the `
          + 'door this matter actually comes through.'],
      ['What the source says of that exact placement',
        ch.summary ? esc(ch.summary) : 'No encoded cell for this combination.'],
      ['Verdict', `${BAND_CHIP[v.band]} — ${esc(v.why)}`],
      ['Its ruler', `<b>${G(ch.lord)}</b> ${score(ch.strength * 100, 'strength')} `
        + `· ${ch.functional === 'benefic' ? chip('helps you specifically', 'good')
          : ch.functional === 'malefic' ? chip('costs you specifically', 'bad')
            : chip(ch.functional)}`],
      ['How well stocked', ch.bindus != null
        ? `${ch.bindus} points — ${ch.bindus >= 30 ? 'generously supplied'
          : ch.bindus >= 25 ? 'about average' : 'thin, so it needs more input for the same output'}`
        : '—'],
      ['When this route is most live', esc(live)],
    ])}
${ch.excluded
      ? withheld('Not carried from that verse', String(ch.excluded))
      : ''}
</div>`;
  });

  return section({
    id: 'how-it-works',
    title: 'How each part of your life actually arrives',
    intro: 'A house says what a matter is. Its ruler\'s placement says the ROUTE that matter '
      + 'takes to reach you — which is the more useful half, and the half a strength score '
      + 'cannot carry. Career through the seventh arrives through other people; through the '
      + 'twelfth it arrives from far away, or not through the front door at all.',
    body: blocks.join('\n')
    + note('The three verdicts blend four things: what the classical source says of that exact '
      + 'lord-in-house cell, whether the ruling planet is strong enough to deliver, how well '
      + 'stocked the house is in your ashtakavarga, and whether that planet is a friend to '
      + 'your particular ascendant. Each is printed above so you can disagree with the blend.'),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function whatWorksSection(c: ComposedChart): string {
  const { chart } = c;
  const chs = channels(c);
  const fn = FUNCTIONAL_NATURE.find((f) => f.lagna === chart.lagnaSign);
  let sav: number[] | null = null;
  try { sav = computeAshtakavarga(chart).sav; } catch { sav = null; }

  const ranked = [...chs].map((ch) => ({ ch, v: verdict(ch) }));
  const works = ranked.filter((r) => r.v.band === 'works');
  const blocked = ranked.filter((r) => r.v.band === 'blocked');

  // The ninth is the house of luck outright, so its condition is its own answer.
  const ninth = chs.find((x) => x.house === 9)!;
  const eleventh = chs.find((x) => x.house === 11)!;

  // Direction to work in, from the dasamsa ruler of the tenth lord.
  let direction = '—';
  try {
    const tenthLord = lordOfHouse(chart, 10);
    const pos = chart.planets[tenthLord];
    const d = dasamsaRuler(pos.sign as never, pos.siderealLong % 30);
    direction = `<b>${esc(d.direction)}</b> — from the tenth ruler's position in the `
      + `career division, whose regent is ${G(d.lord)}`;
  } catch { direction = '—'; }

  // Prosperity configuration: an ashtakavarga shape the text names outright.
  let prosperity = '';
  try {
    prosperity = sav && prosperityConfiguration(sav, chart.lagnaSign as never)
      ? 'Your ashtakavarga carries the specific shape the text names for prosperity — the '
        + 'eleventh outscoring the tenth, the twelfth below the eleventh, and the ascendant '
        + 'at least equal to every other house. It is an uncommon pattern.'
      : 'Your ashtakavarga does not carry the specific prosperity shape the text names. That '
        + 'is the ordinary case and says nothing against the chart — the pattern requires '
        + 'four conditions at once.';
  } catch { prosperity = ''; }

  const bestHouse = sav ? sav.indexOf(Math.max(...sav)) : -1;
  const worstHouse = sav ? sav.indexOf(Math.min(...sav)) : -1;

  return section({
    id: 'what-works',
    title: 'What reliably works for you, and what never will',
    intro: 'The same chart read as a set of strategies rather than a set of departments. These '
      + 'are the routes that pay off in this chart, the ones that cost more than they return, '
      + 'and the ones that only work when timed.',
    body: sub('Routes that work', works.length
      ? table(['The matter', 'Because'], works.map((r) => [
        `<b>${esc(DOMAIN[r.ch.house]?.split('—')[0]?.trim() ?? '')}</b> `
        + `(${ord(r.ch.house)}, via the ${ord(r.ch.lordHouse)})`,
        esc(r.ch.summary || r.v.why),
      ]))
      : note('No department clears the "works" band outright in this chart. That is not a '
        + 'poor chart — it means nothing here runs on its own, and everything responds to '
        + 'timing and effort rather than to luck.'))

    + sub('Routes that cost more than they return', blocked.length
      ? table(['The matter', 'What to do instead'], blocked.map((r) => [
        `<b>${esc(DOMAIN[r.ch.house]?.split('—')[0]?.trim() ?? '')}</b> `
        + `(${ord(r.ch.house)}, via the ${ord(r.ch.lordHouse)})`,
        `${esc(r.ch.summary || '')} Approach this through a department that works rather `
        + 'than head-on, and do not launch it in its own ruler\'s sub-period.',
      ]))
      : note('No department falls into the blocked band. Everything here is workable.'))

    + sub('Which planets are on your side, specifically', facts([
      ['Always help you', fn?.benefics.length
        ? fn.benefics.map((g) => `<b>${G(g)}</b>`).join(', ')
          + ' — periods and transits of these tend to deliver, whatever their general reputation'
        : '—'],
      ['Always cost you', fn?.malefics.length
        ? fn.malefics.map((g) => `<b>${G(g)}</b>`).join(', ')
          + ' — not disasters, but their periods ask for more than they give back here'
        : '—'],
      ['Neutral', fn?.neutrals.length ? fn.neutrals.map(G).join(', ') : 'none'],
      ['The single best planet for you', fn?.yogakaraka
        ? `<b>${G(fn.yogakaraka)}</b>, standing in your ${ord(chart.planets[fn.yogakaraka].house)} `
          + 'house. It rules both a pillar and a trine from your ascendant, so it can only do '
          + 'good here — whatever its general character.'
        : 'No single planet rules both a pillar and a trine from this ascendant, so there is '
          + 'no one planet that can only help. Strength has to be assembled rather than '
          + 'inherited.'],
      ['Unclassified', fn?.unclassified?.length
        ? `${fn.unclassified.map(G).join(', ')} — the source is expressly silent for this `
          + 'ascendant, and a guess would be worse than the gap'
        : 'none'],
    ]))

    + sub('Where luck actually comes from', facts([
      ['The house of fortune', `Ruled by <b>${G(ninth.lord)}</b>, standing in your `
        + `${ord(ninth.lordHouse)}. ${esc(ninth.summary || '')} `
        + `Supply: ${ninth.bindus ?? '—'} points.`],
      ['Gains and income', `Ruled by <b>${G(eleventh.lord)}</b>, in your `
        + `${ord(eleventh.lordHouse)}. ${esc(eleventh.summary || '')}`],
      ['Your strongest ground', bestHouse >= 0
        ? `<b>${SIGN(bestHouse)}</b> — your ${ord(houseOf(chart, bestHouse))} house, with `
          + `${sav![bestHouse]} points. Anything you can route through this department runs `
          + 'more easily than it should.'
        : '—'],
      ['Your stiffest door', worstHouse >= 0
        ? `<b>${SIGN(worstHouse)}</b> — your ${ord(houseOf(chart, worstHouse))} house, with `
          + `${sav![worstHouse]} points. Expect to pay full price here every time.`
        : '—'],
      ['Direction to work in', direction],
    ]) + (prosperity ? note(prosperity) : ''))

    + sub('How things surface for you', facts([
      ['Rising type', `${esc(String(RISING_TYPE[chart.lagnaSign] ?? '—'))} — `
        + `${RISING_TYPE[chart.lagnaSign] === 'sirshodaya'
          ? 'matters tend to show their head first: you see what is coming, and results '
            + 'arrive in the first half of an undertaking'
          : RISING_TYPE[chart.lagnaSign] === 'ubhayodaya'
            ? 'matters surface at both ends — some visible early, some only at the close'
            : 'matters tend to show their back first: the shape of a thing is clear only '
              + 'later, and results gather toward the end rather than the start'}`],
      ['Ambulation class', esc(String(ambulationClass(chart.lagnaSign as never,
        chart.lagnaLong % 30))) + ' — the classical class of the rising sign, which the '
        + 'travel and undertaking rules read'],
      ['Navamsa class of the ascendant',
        esc(String(navamsaClass(chart.lagnaSign as never, chart.lagnaLong % 30)))],
    ]))

    + withheld('These are tendencies in a chart, not rules about a life',
      'A blocked route is a route that historically costs this chart more than it returns. It '
      + 'is not a prohibition, and people override their charts constantly by simply deciding '
      + 'to. Read this as where the wind is, not as where you are allowed to walk.'),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function transitRulesSection(c: ComposedChart): string {
  const { chart } = c;
  const moonSign = chart.planets.moon.sign;

  const rows = GRAHAS.map((g) => {
    const rule = (TRANSIT_FROM_MOON as Record<string, {
      favourableHouses: number[]; note: string;
    }>)[g];
    if (!rule) return null;
    const vedha = (VEDHA_STHAANA as Record<string, Record<number, number>>)[g] ?? {};
    return [
      `<b>${G(g)}</b>`,
      rule.favourableHouses.map((h) => `${ord(h)} (${SIGN(moonSign + h - 1).slice(0, 3)})`).join(', '),
      esc(rule.note),
      Object.entries(vedha).map(([a, b]) => `${a}→${b}`).join(', ') || '—',
    ];
  }).filter(Boolean) as string[][];

  return section({
    id: 'transit-rules',
    title: 'Which transits are good for you, counted from your Moon',
    intro: 'Transit favourability is read from the natal Moon, not from the ascendant — this is '
      + 'the classical Gochara rule. The houses listed are the ones each planet does well in '
      + 'for you; the signs beside them are YOUR signs for those houses.',
    body: table(
      ['Planet', 'Good in these houses from your Moon', 'What it governs in transit', 'Obstruction pairs'],
      rows,
    )
    + note('An obstruction pair means a good transit is cancelled when another planet occupies '
      + 'the paired house at the same time. "3→9" reads: a favourable transit in the 3rd is '
      + 'obstructed by an occupant of the 9th. This is why a transit that should have been '
      + 'good sometimes simply is not.'),
  });
}

export const THE_LORD_IS_THE_CHANNEL =
  'A house is the matter; the placement of its lord is the route that matter arrives by. That '
  + 'is the classical mechanism and it is what turns a strength score into advice — "career is '
  + '64 out of 100" tells nobody what to do, and "standing reaches you through other people, '
  + 'and will not arrive by applying head-on" tells them exactly what to do.';
