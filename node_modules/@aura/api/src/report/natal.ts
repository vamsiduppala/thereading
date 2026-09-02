// The fixed chart: everything that was true at birth and stays true.
//
// Ordered the way the classical method actually proceeds — the sky first, then the ascendant,
// then the planets, then their strength, then the divisions, then what the combinations of all
// of it mean. A reader who stops after any section has a complete smaller reading rather than
// half of a big one.
//
// Nothing here is generated prose. Every sentence is assembled from a computed number plus
// fixed phrasing, which is the same discipline the rest of the product runs on: the machine
// chooses what to say by choosing what to compute, and never writes a word.

import {
  computeAshtakavarga, detectYogas, sunriseFacts, planetStrength, moonIllumination,
  isVargottama, functionalPolarity, buildBlueprint, natalProminence,
  GRAHAS, SIGN_NAMES, NAKSHATRAS, SIGN_LORD, NAKSHATRA_ARC,
  type Chart, type Graha, type House,
} from '@aura/engine';
import {
  SHODASAVARGA, vargaSign, charaKarakas, assessAtmakaraka, arudhaOf,
  BPHS_HOUSE_INDICATIONS, NATURAL_RELATIONS, temporaryRelationIn, compoundRelationIn,
  saptavargajaTierForChart, KENDRAS, TRIKONA_GROUPS,
  DEEP_EXALTATION_POINTS, upapadaHouse, argalaGrade, ARGALA_PAIRS,
  gradeMahapurusha, yogaKarakaFor,
} from '@aura/knowledge';
import {
  section, sub, table, facts, note, withheld, score, chip, esc,
  dms, dmy, cap, type SectionSpec,
} from './render.js';
import { ephem, type ComposedChart } from './facts.js';

const SIGN = (i: number): string => SIGN_NAMES[((i % 12) + 12) % 12] ?? '—';

/** Which planet forms each Pancha Mahapurusha yoga — the grader is asked about the planet. */
const MAHAPURUSHA_OF: Record<string, Graha | undefined> = {
  ruchaka: 'mars', bhadra: 'mercury', hamsa: 'jupiter', malavya: 'venus', sasa: 'saturn',
};
const G = (g: string): string => cap(g);

/** Ordinal for a house number, because "the 1th house" is how a reader stops trusting you. */
const ord = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] ?? ['th', 'st', 'nd', 'rd'][n % 100] ?? 'th';
  return `${n}${s}`;
};

const lordOfHouse = (chart: Chart, h: number): Graha =>
  SIGN_LORD[(chart.lagnaSign + h - 1) % 12]!;

const houseOf = (chart: Chart, sign: number): House =>
  ((((sign - chart.lagnaSign) % 12) + 12) % 12 + 1) as House;

// ─────────────────────────────────────────────────────────────────────────────

export function birthSection(c: ComposedChart, at: Date): string {
  const { chart, birthInstant } = c;
  const b = chart.birth;
  let sunrise = '';
  try {
    const sf = sunriseFacts(birthInstant, b.lat, b.lng, ephem);
    sunrise = [
      sf.sunrise ? `Sunrise ${fmtT(sf.sunrise, b.tzOffsetMinutes)}` : 'No sunrise on this date',
      sf.sunset ? `sunset ${fmtT(sf.sunset, b.tzOffsetMinutes)}` : 'no sunset',
      sf.birth ? `a ${sf.birth.toUpperCase()} birth` : '',
      sf.horaLord ? `hora of ${G(sf.horaLord)}` : '',
      sf.dinaLord ? `weekday of ${G(sf.dinaLord)}` : '',
      sf.varshaLord ? `solar year of ${G(sf.varshaLord)}` : '',
      sf.masaLord ? `solar month of ${G(sf.masaLord)}` : '',
      sf.tribhaga
        ? `${ord(sf.tribhaga.third + 1)} third of the ${sf.tribhaga.isDay ? 'day' : 'night'}`
        : '',
    ].filter(Boolean).join(' · ');
  } catch { sunrise = 'Sunrise could not be resolved for this place and date.'; }

  return section({
    id: 'birth',
    title: 'The birth data, and what was assumed',
    intro: 'Every figure in this document descends from these seven numbers. If one of them is '
      + 'wrong, so is everything downstream — which is why they are stated before anything else.',
    pageBreak: false,
    body: facts([
      ['Date', esc(b.date)],
      ['Time', b.unknownTime
        ? '<b>Not known.</b> A solar chart was cast instead — see the caveat below.'
        : `${esc(b.time ?? '—')} local`],
      ['Place', `${esc(b.place)} — ${b.lat.toFixed(4)}°, ${b.lng.toFixed(4)}°`],
      ['Time zone', `UTC${b.tzOffsetMinutes >= 0 ? '+' : ''}${(b.tzOffsetMinutes / 60).toFixed(2)}`
        + ` (${b.tzOffsetMinutes} minutes east), as in force at that place on that date`],
      ['Universal time', `${birthInstant.toISOString().replace('T', ' ').slice(0, 19)} UTC`],
      ['Julian Day (UT)', chart.julianDayUT.toFixed(6)],
      ['Ayanamsa', `${dms(chart.ayanamsa)} — ${esc(chart.ayanamsaSystem)}`],
      ['That day', esc(sunrise)],
      ['Engine build', esc(chart.engineVersion)],
      ['Report generated', `${dmy(at)}`],
    ])
    + (b.unknownTime
      ? withheld('The birth time is unknown, and that limits this document',
        'Without a time there is no ascendant, so every house placement here is counted from '
        + 'the Sun instead. Planet positions in signs remain correct; anything that depends on '
        + 'a house — which is most of the interpretation — is a weaker claim than it looks. '
        + 'The dasha dates depend on the Moon\'s longitude and are correct to within the '
        + 'Moon\'s daily motion, roughly a fortnight of dasha boundary either way.')
      : note('The ayanamsa is stored with the chart rather than assumed. Lahiri, Raman and KP '
        + 'disagree by up to 1.2°, which against a 13°20′ nakshatra is about 9% of a '
        + 'mahadasha — years. A chart that did not record which one it used could not be '
        + 'recomputed honestly later.')),
  });
}

export function ascendantSection(c: ComposedChart): string {
  const { chart } = c;
  const degIn = chart.lagnaLong % 30;
  const nak = Math.floor(chart.lagnaLong / NAKSHATRA_ARC);
  const lord = SIGN_LORD[chart.lagnaSign]!;
  const lordPos = chart.planets[lord];

  const rows: string[][] = [];
  for (const d of [9, 10, 12, 3] as const) {
    rows.push([`D-${d}`, SIGN(vargaSign(chart.lagnaLong, d))]);
  }

  return section({
    id: 'ascendant',
    title: 'The ascendant — the frame everything else is read against',
    intro: 'The rising sign fixes which house every planet falls in, so it is the single '
      + 'assumption the whole reading rests on. It moves about one degree every four minutes '
      + 'of clock time.',
    body: facts([
      ['Rising sign', `<b>${SIGN(chart.lagnaSign)}</b> at ${dms(degIn)}`],
      ['Sidereal longitude', `${dms(chart.lagnaLong)} absolute`],
      ['Nakshatra', `${esc(NAKSHATRAS[nak]?.name ?? '—')}, `
        + `pada ${Math.floor((chart.lagnaLong % NAKSHATRA_ARC) / (NAKSHATRA_ARC / 4)) + 1}`
        + ` — lord ${G(NAKSHATRAS[nak]?.lord ?? '')}`],
      ['Ruler of the chart', `<b>${G(lord)}</b>, standing in the ${ord(lordPos.house)} house `
        + `in ${SIGN(lordPos.sign)} at ${dms(lordPos.siderealLong % 30)}`],
      ['Yogakaraka for this ascendant', yogaKaraka(chart)],
      ['Element / temperament', `${esc(elementOf(chart))}`],
    ])
    + sub('The ascendant across the divisions', table(['Division', 'Sign'], rows))
    + note('A planet that rules both a kendra and a trikona from this ascendant is a '
      + 'yogakaraka — it can only do good here, whatever its natural character. That is a '
      + 'property of the rising sign alone, not of where the planet happens to sit.'),
  });
}

function yogaKaraka(chart: Chart): string {
  try {
    const yk = yogaKarakaFor(chart.lagnaSign);
    if (!yk) return 'None — no single planet rules both a kendra and a trikona from here.';
    return `<b>${G(yk)}</b>, standing in the ${ord(chart.planets[yk].house)} house`
      + ` — ${dignityWord(chart.planets[yk].dignity)}`;
  } catch { return 'Not resolvable for this ascendant.'; }
}

function elementOf(chart: Chart): string {
  try {
    const counts: Record<string, number> = {};
    for (const g of GRAHAS) {
      const s = chart.planets[g].sign % 4;
      const el = ['Fire', 'Earth', 'Air', 'Water'][s]!;
      counts[el] = (counts[el] ?? 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return top.map(([k, v]) => `${k} ${v}`).join(' · ');
  } catch { return '—'; }
}

export function planetsSection(c: ComposedChart): string {
  const { chart } = c;
  const rows = GRAHAS.map((g) => {
    const pp = chart.planets[g];
    const nak = pp.nakshatra ?? Math.floor(pp.siderealLong / NAKSHATRA_ARC);
    const flags = [
      pp.retrograde ? chip('retrograde', 'warn') : '',
      pp.combust ? chip('combust', 'bad') : '',
      pp.vargottama ? chip('vargottama', 'good') : '',
    ].filter(Boolean).join('');
    return [
      `<b>${G(g)}</b>`,
      SIGN(pp.sign),
      dms(pp.siderealLong % 30),
      String(pp.house),
      `${esc(NAKSHATRAS[nak]?.name ?? '—')} ${pp.pada ?? ''}`,
      SIGN(pp.navamsa),
      dignityWord(pp.dignity),
      score(pp.strength * 100),
      flags || '—',
    ];
  });

  return section({
    id: 'planets',
    title: 'The nine planets, placed',
    intro: 'Sidereal positions at the birth moment, with the house counted whole-sign from the '
      + 'ascendant. Degrees within the sign matter: most classical rules read them, and the '
      + 'divisional charts are computed from them.',
    body: table(
      ['Planet', 'Sign', 'Degree', 'House', 'Nakshatra', 'D-9', 'Dignity', 'Strength', ''],
      rows,
    )
    + sub('Who aspects what', table(
      ['Planet', 'Casts its gaze on'],
      GRAHAS.map((g) => {
        // Already computed at chart time. Recomputing it here would be the same answer
        // arrived at twice, with one extra chance of passing the wrong argument.
        const hs = chart.planets[g].aspects;
        return [`<b>${G(g)}</b>`, hs.length
          ? hs.map((h) => `${ord(h)} house (${SIGN(chart.lagnaSign + h - 1)})`).join(', ')
          : '—'];
      }),
    ))
    + note('Every planet aspects the 7th from itself. Mars adds the 4th and 8th, Jupiter the '
      + '5th and 9th, Saturn the 3rd and 10th — the special aspects, which is why those three '
      + 'reach further into a chart than the others.'),
  });
}

const dignityWord = (d: number): string => {
  if (d >= 0.8) return chip('exalted', 'good');
  if (d >= 0.45) return chip('own / friendly', 'good');
  if (d > -0.2) return chip('neutral');
  if (d > -0.7) return chip('enemy', 'warn');
  return chip('debilitated', 'bad');
};

export function strengthSection(c: ComposedChart): string {
  const { chart } = c;
  const prom = natalProminence(chart);
  // The Moon's phase drives Paksha bala for every planet, so it is computed once from the
  // Sun-Moon elongation rather than per row.
  const elong = ((chart.planets.moon.siderealLong - chart.planets.sun.siderealLong) % 360 + 360) % 360;
  const moonIllum = moonIllumination(elong);
  // Waxing is the half of the cycle from new to full. The Moon's own polarity flips with it,
  // so this is not a cosmetic detail: a waning Moon is read as mildly malefic.
  const waxing = elong < 180;
  const rows = GRAHAS.map((g) => {
    const pp = chart.planets[g];
    let res: ReturnType<typeof planetStrength> | null = null;
    try {
      res = planetStrength({
        graha: g,
        sign: pp.sign,
        degInSign: pp.siderealLong % 30,
        navamsaSign: pp.navamsa,
        house: pp.house,
        retrograde: pp.retrograde,
        combust: pp.combust,
        // Functional, not natural: a malefic that rules a kendra and a trikona from THIS
        // ascendant is a benefic here, and the fortnight term is scaled by that judgement.
        isBenefic: functionalPolarity(g, chart.lagnaSign, waxing) >= 0,
        moonIllumination: moonIllum,
      });
    } catch { res = null; }
    return [
      `<b>${G(g)}</b>`,
      score(pp.strength * 100),
      res ? (res.sthana * 100).toFixed(0) : '—',
      res ? (res.dig * 100).toFixed(0) : '—',
      res ? (res.cheshta * 100).toFixed(0) : '—',
      res ? (res.naisargika * 100).toFixed(0) : '—',
      res ? (res.paksha * 100).toFixed(0) : '—',
      res && res.vargottama ? chip('yes', 'good') : '—',
      (prom[g] * 100).toFixed(0),
    ];
  });

  return section({
    id: 'strength',
    title: 'Strength — the six-fold measure, and what it is not',
    intro: 'A planet\'s promise is one thing; its capacity to deliver is another. These are the '
      + 'six classical components, each normalised to 0–100 so they can be compared with each '
      + 'other rather than read as classical rupas.',
    body: table(
      ['Planet', 'Composite', 'Position', 'Direction', 'Motion', 'Nature',
        'Fortnight', 'Vargottama', 'Prominence'],
      rows,
    )
    + note('<b>Position</b> is dignity in the rasi and the navamsa together. <b>Direction</b> '
      + 'is the house-strength each planet draws from one particular quarter of the chart — '
      + 'the Sun and Mars from the tenth, the Moon and Venus from the fourth. <b>Motion</b> '
      + 'is speed and retrogression. <b>Nature</b> is the fixed classical ordering of the '
      + 'seven. <b>Fortnight</b> is the waxing or waning Moon.')
    + withheld('These are not classical rupas',
      'The classical Shadbala is expressed in rupas against per-planet minimum thresholds, and '
      + 'the components here are normalised to a common 0–100 instead. That makes them '
      + 'comparable across planets, which the rupa figures deliberately are not. Where you see '
      + 'a strength in this document it is this scale, not the rupa total — treating one as '
      + 'the other is the commonest way to get a wrong answer that looks right.'),
  });
}

export function relationsSection(c: ComposedChart): string {
  const { chart } = c;
  // Both the temporary and the compound relation are read from where the planets ACTUALLY
  // stand in this chart, so each needs the whole rasi map rather than a pair of signs.
  const rasiSigns: Partial<Record<Graha, number>> = {};
  for (const g of GRAHAS) rasiSigns[g] = chart.planets[g].sign;

  const rows = GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((a) => {
    const cells = GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((b) => {
      if (a === b) return '—';
      try {
        const nat = (NATURAL_RELATIONS as never as Record<string, Record<string, string>>)[a]?.[b];
        const tmp = temporaryRelationIn(a, b, rasiSigns as never);
        const comp = compoundRelationIn(a, b, rasiSigns as never);
        if (comp == null) return '—';
        const short = String(comp).replace('great-', 'gt-');
        const tone = short.includes('friend') ? 'good' : short.includes('enemy') ? 'bad' : '';
        return `<span class="chip ${tone}" title="natural ${nat ?? '?'} · temporary ${tmp}">`
          + `${esc(short)}</span>`;
      } catch { return '—'; }
    });
    return [`<b>${G(a)}</b>`, ...cells];
  });

  // The Saptavargaja seven. The tier comes back as a function of divisor, so it is asked
  // once per division rather than once per planet.
  const SEVEN = [1, 2, 3, 9, 12, 30, 16];
  let tiers = '';
  try {
    const rows7 = GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
      const tierOf = saptavargajaTierForChart(g, chart.planets[g].siderealLong, rasiSigns as never);
      return [`<b>${G(g)}</b>`, ...SEVEN.map((d) => esc(String(tierOf(d))))];
    });
    tiers = table(['Planet', ...SEVEN.map((d) => `D-${d}`)], rows7, 'grid');
  } catch (e) {
    tiers = note(`The Saptavargaja tier could not be resolved: ${esc(
      e instanceof Error ? e.message : String(e))}.`);
  }

  return section({
    id: 'relations',
    title: 'How the planets regard each other in this chart',
    intro: 'Friendship is not fixed. Each pair has a permanent relation from the classical '
      + 'table, a temporary one that depends on where they actually stand in THIS chart, and a '
      + 'five-fold compound of the two — which is the one the rules read.',
    body: table(
      ['', ...GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map(G)],
      rows, 'grid',
    )
    + note('Read a row as "how this planet regards the one in the column". Hover a cell to see '
      + 'the permanent and temporary relations it was composed from. The temporary relation is '
      + 'symmetric — planets in the 2nd, 3rd, 4th, 10th, 11th or 12th from each other are '
      + 'temporary friends, and that set is closed under the swap.')
    + sub('Dignity across the seven divisions (Saptavargaja)', tiers),
  });
}

export function ashtakavargaSection(c: ComposedChart): string {
  const { chart } = c;
  let av;
  try { av = computeAshtakavarga(chart); } catch {
    return section({ id: 'ashtakavarga', title: 'Ashtakavarga',
      body: note('Could not be computed for this chart.') });
  }
  const signHeaders = Array.from({ length: 12 }, (_, i) => SIGN(i).slice(0, 3));
  const rows = Object.entries(av.bav).map(([g, row]) => [
    `<b>${G(g)}</b>`, ...row.map((n) => String(n)),
  ]);
  rows.push(['<b>Total (SAV)</b>', ...av.sav.map((n) => `<b>${n}</b>`)]);

  const total = av.sav.reduce((a, b) => a + b, 0);
  const best = av.sav.indexOf(Math.max(...av.sav));
  const worst = av.sav.indexOf(Math.min(...av.sav));

  return section({
    id: 'ashtakavarga',
    title: 'Ashtakavarga — where the chart is well supplied',
    intro: 'Each planet contributes a benefic point to certain signs counted from itself and '
      + 'from the ascendant. The totals say which parts of the zodiac this chart is stocked in, '
      + 'and they are the single best guide to whether a transit through a sign will land well.',
    body: table(['', ...signHeaders], rows, 'grid')
    + facts([
      ['Grand total', `${total} — the classical total is 337 for the seven planets, and this `
        + `chart ${total === 337 ? 'matches it exactly' : `comes to ${total}`}`],
      ['Best supplied', `<b>${SIGN(best)}</b> with ${av.sav[best]} points `
        + `— the ${ord(houseOf(chart, best))} house`],
      ['Least supplied', `<b>${SIGN(worst)}</b> with ${av.sav[worst]} points `
        + `— the ${ord(houseOf(chart, worst))} house`],
    ])
    + note('A sign with 30 or more points is well stocked; 25 is average; under 22 is thin. '
      + 'A benefic transit through a thin sign underperforms, and a difficult transit through '
      + 'a well-stocked one is survivable. This is why the transit sections below quote the '
      + 'bindu count for every sign a planet enters.'),
  });
}

export function vargaSection(c: ComposedChart): string {
  const { chart } = c;
  const headers = ['Planet', ...SHODASAVARGA.map((d) => `D-${d}`)];
  const rows = GRAHAS.map((g) => {
    const lon = chart.planets[g].siderealLong;
    return [`<b>${G(g)}</b>`, ...SHODASAVARGA.map((d) => {
      const s = vargaSign(lon, d);
      const own = SIGN_LORD[s] === g;
      const ex = DEEP_EXALTATION_POINTS[g as never] as { exaltSign?: number } | undefined;
      const isEx = ex?.exaltSign === s;
      const mark = isEx ? ' class="chip good"' : own ? ' class="chip"' : '';
      return `<span${mark}>${SIGN(s).slice(0, 3)}</span>`;
    })];
  });

  const vg = GRAHAS.filter((g) => isVargottama(chart.planets[g].siderealLong));

  return section({
    id: 'vargas',
    title: 'The sixteen divisional charts',
    intro: 'Each division cuts every sign into equal parts and rules a different department of '
      + 'life. A planet strong in the rasi but scattered across the divisions promises more '
      + 'than it delivers; one that holds good signs across many divisions is the reverse.',
    body: table(headers, rows, 'grid')
    + facts([
      ['Vargottama', vg.length
        ? vg.map((g) => `<b>${G(g)}</b>`).join(', ')
          + ' — same sign in the rasi and the navamsa, which is a considerable strengthening'
        : 'None in this chart.'],
      ['D-9 (navamsa)', 'marriage, dharma, and the ripening of every promise'],
      ['D-10 (dasamsa)', 'career and standing'],
      ['D-12 (dwadasamsa)', 'parents'],
      ['D-7 (saptamsa)', 'children'],
      ['D-4 (chaturthamsa)', 'home and fixed property'],
      ['D-3 (drekkana)', 'siblings, courage'],
      ['D-30 (trimsamsa)', 'difficulty and its texture'],
      ['D-60 (shashtiamsa)', 'the finest division the classical method uses'],
    ])
    + note('A green cell is an exaltation in that division; a plain outlined cell is own sign. '
      + 'Dignity is recomputed inside each division from the divisional sign, never carried '
      + 'across from the rasi — carrying it was a real bug once, and it makes weak planets '
      + 'look strong in exactly the divisions where they are not.'),
  });
}

export function yogaSection(c: ComposedChart): string {
  const { chart } = c;
  const ys = detectYogas(chart);
  const rows = ys.map((y) => {
    // Only the Mahapurusha yogas carry a grade. Saying so beats an empty cell, which reads
    // like a value that failed to compute.
    let grade = 'not graded';
    try {
      const g = MAHAPURUSHA_OF[y.key];
      if (g) grade = esc(String(gradeMahapurusha(g, true).grade));
    } catch { grade = 'not graded'; }
    return [`<b>${esc(y.name)}</b>`, esc(y.blurb), grade];
  });

  return section({
    id: 'yogas',
    title: 'Combinations present in this chart',
    intro: 'A yoga is a named configuration whose effect the classical texts state directly. '
      + 'Only the ones this chart actually carries are listed; nothing here is a general '
      + 'description of what a yoga would do if you had it.',
    body: (rows.length
      ? table(['Combination', 'What the texts claim for it', 'Grade'], rows)
      : note('The engine\'s direct detectors found none of the named combinations in this '
        + 'chart. That is common and not a deficiency — the rule registry below reads far more '
        + 'configurations than these, and its findings are the fuller answer.'))
    + note('Presence is not magnitude. A combination formed by weak or afflicted planets is a '
      + 'promise on paper; the strength table above is what says whether it can be kept.'),
  });
}

export function karakaSection(c: ComposedChart): string {
  const { chart } = c;
  let rows: string[][] = [];
  let ak = '';
  try {
    const longs: Partial<Record<Graha, number>> = {};
    for (const g of GRAHAS) longs[g] = chart.planets[g].siderealLong;
    const ck = charaKarakas(longs);
    rows = ck.map((k) => {
      const pp = chart.planets[k.graha];
      return [
        `<b>${esc(k.code)}</b>`, esc(k.name), `<b>${G(k.graha)}</b>`,
        dms(k.karakaDegree), `${SIGN(pp.sign)}, ${ord(pp.house)} house`,
      ];
    });
    const akG = ck[0]?.graha;
    if (akG) {
      const a = assessAtmakaraka({ graha: akG } as never) as { verdict?: string } | undefined;
      ak = a?.verdict ? esc(String(a.verdict)) : '';
    }
  } catch { rows = []; }

  return section({
    id: 'karakas',
    title: 'The significators this chart appoints',
    intro: 'The chara karakas are assigned by degree within sign, highest first — so they are '
      + 'unique to a chart in a way the fixed significators are not. The Atmakaraka is the '
      + 'single most weighted planet in the Jaimini method.',
    body: (rows.length
      ? table(['Code', 'Signifies', 'Planet', 'Degree in sign', 'Standing in'], rows)
      : note('Could not be assigned for this chart.'))
    + (ak ? note(`On the Atmakaraka: ${ak}`) : '')
    + note('Rahu is counted backwards from 30°, which is why it can take a high rank on a low '
      + 'degree. This is the eight-karaka scheme; the seven-karaka variant omits Rahu entirely '
      + 'and would shift every code below it by one.'),
  });
}

export function housesSection(c: ComposedChart): string {
  const { chart } = c;
  const av = safeAv(chart);
  const blocks: string[] = [];

  for (let h = 1 as number; h <= 12; h++) {
    const sign = (chart.lagnaSign + h - 1) % 12;
    const lord = lordOfHouse(chart, h);
    const lordPos = chart.planets[lord];
    const occupants = GRAHAS.filter((g) => chart.planets[g].house === h);
    const aspecting = GRAHAS.filter((g) => chart.planets[g].aspects.includes(h as House));
    const ind = (BPHS_HOUSE_INDICATIONS as never as Record<number, string[] | string>)[h];
    const indication = Array.isArray(ind) ? ind.join(', ') : String(ind ?? '');
    const bindus = av ? av.sav[sign] : null;

    blocks.push(`<div class="year">
<h4>${ord(h)} house — ${SIGN(sign)}</h4>
${facts([
      ['The texts assign it', esc(indication) || '—'],
      ['Its lord', `<b>${G(lord)}</b>, in the ${ord(lordPos.house)} house in ${SIGN(lordPos.sign)}`
        + ` — ${dignityWord(lordPos.dignity)} ${score(lordPos.strength * 100)}`],
      ['Occupied by', occupants.length
        ? occupants.map((g) => `<b>${G(g)}</b> (${dms(chart.planets[g].siderealLong % 30)})`).join(', ')
        : 'no planet'],
      ['Aspected by', aspecting.length ? aspecting.map(G).join(', ') : 'nothing'],
      ['Ashtakavarga', bindus != null
        ? `${bindus} points — ${bindus >= 30 ? 'well supplied' : bindus >= 25 ? 'about average'
          : bindus >= 22 ? 'somewhat thin' : 'thin'}`
        : '—'],
      ['Classification', [
        KENDRAS.includes(h as never) ? 'kendra (a pillar)' : '',
        (TRIKONA_GROUPS as never as number[][]).some?.((t) => t.includes(h)) ? 'trikona' : '',
        [3, 6, 10, 11].includes(h) ? 'upachaya (improves with time)' : '',
        [6, 8, 12].includes(h) ? 'dusthana (a house of difficulty)' : '',
      ].filter(Boolean).join(', ') || 'ordinary'],
    ])}
</div>`);
  }

  return section({
    id: 'houses',
    title: 'The twelve houses, one at a time',
    intro: 'For each house: what the classical texts assign to it, where its lord went, who '
      + 'sits in it, who looks at it, and how well stocked it is. A house is read from all four '
      + 'at once — a strong lord in a weak house is a different story from the reverse.',
    body: blocks.join('\n'),
  });
}

export function arudhaSection(c: ComposedChart): string {
  const { chart } = c;
  const rows: string[][] = [];
  try {
    for (let h = 1; h <= 12; h++) {
      const lord = lordOfHouse(chart, h);
      const houseSign = (chart.lagnaSign + h - 1) % 12;
      const sign = arudhaOf(houseSign, chart.planets[lord].sign);
      if (sign == null) continue;
      rows.push([
        h === 1 ? '<b>Arudha Lagna</b>' : `A${h}`,
        SIGN(sign),
        `${ord(houseOf(chart, sign))} house from the ascendant`,
      ]);
    }
  } catch { /* left empty; reported below */ }

  // `upapadaHouse` names WHICH house the upapada is taken from — the 12th for an even
  // ascendant, the 2nd for an odd one under the convention this corpus encodes. The upapada
  // itself is then that house's arudha.
  let upapada = '—';
  try {
    const uh = upapadaHouse(chart.lagnaSign as never);
    const uSign = (chart.lagnaSign + uh - 1) % 12;
    const uLord = SIGN_LORD[uSign]!;
    const ua = arudhaOf(uSign, chart.planets[uLord].sign);
    upapada = `<b>${SIGN(ua)}</b> — the arudha of the ${ord(uh)} house, `
      + `falling in the ${ord(houseOf(chart, ua))} from the ascendant`;
  } catch { upapada = '—'; }

  return section({
    id: 'arudhas',
    title: 'The arudhas — how the life is seen from outside',
    intro: 'An arudha is the reflection of a house: not what a matter IS, but how it appears to '
      + 'others. The gap between a house and its arudha is often the gap between a person\'s '
      + 'situation and their reputation.',
    body: (rows.length ? table(['Arudha', 'Sign', 'Position'], rows)
      : note('Arudhas could not be computed for this chart.'))
    + facts([['Upapada (marriage)', upapada]])
    + note('The Arudha Lagna is the image of the self — how the world reads you, which is not '
      + 'the same thing as the ascendant, which is what you actually are. Where the two '
      + 'coincide, what people see is what is there.')
    + sub('Argala — which houses intervene', argalaBlock(chart)),
  });
}

/**
 * Argala: which houses intervene in the ascendant's affairs, and what blocks each intervention.
 *
 * `ARGALA_PAIRS` is `{ argala, obstructor }` — the house that intervenes and the house that
 * cancels it. Both are counted from the reference sign, not from the argala place; the chapter
 * explicitly rejects the alternative reading. The intervention stands only where the planets
 * intervening outnumber the planets obstructing.
 */
function argalaBlock(chart: Chart): string {
  try {
    const rows = (ARGALA_PAIRS as { argala: number; obstructor: number }[]).map((pair) => {
      const aSign = (chart.lagnaSign + pair.argala - 1) % 12;
      const oSign = (chart.lagnaSign + pair.obstructor - 1) % 12;
      const aOcc = GRAHAS.filter((g) => chart.planets[g].sign === aSign);
      const oOcc = GRAHAS.filter((g) => chart.planets[g].sign === oSign);
      const stands = aOcc.length > 0 && aOcc.length > oOcc.length;
      return [
        `${ord(pair.argala)} house — ${SIGN(aSign)}`,
        aOcc.length ? aOcc.map(G).join(', ') : 'empty',
        `${ord(pair.obstructor)} — ${oOcc.length ? oOcc.map(G).join(', ') : 'empty'}`,
        esc(argalaGrade(aOcc.length)),
        aOcc.length === 0
          ? chip('no intervention')
          : stands ? chip('stands', 'good') : chip('obstructed', 'warn'),
      ];
    });
    return table(
      ['Intervening house', 'Planets intervening', 'Its obstructor', 'Grade', 'Outcome'],
      rows,
    ) + note('An argala is an intervention in the affairs of the reference point — usually '
      + 'helpful, and cancelled when the obstructing house is at least as well populated. '
      + 'Grade rises with the number of planets doing the intervening: one is limited, two '
      + 'medium, three or more excellent.');
  } catch (e) {
    return note(`Argala could not be computed: ${esc(e instanceof Error ? e.message : String(e))}.`);
  }
}

function safeAv(chart: Chart): { sav: number[] } | null {
  try { return computeAshtakavarga(chart); } catch { return null; }
}

export function blueprintSection(c: ComposedChart): string {
  const { chart } = c;
  let rows: string[][] = [];
  try {
    rows = buildBlueprint(chart).map((r) => [
      `<b>${esc(r.role)}</b>`, esc(r.energy), esc(r.desc),
    ]);
  } catch { rows = []; }
  return section({
    id: 'blueprint',
    title: 'The shape of the person, in plain words',
    intro: 'The same chart, said without any of the vocabulary above — because a reading that '
      + 'only makes sense to someone who already knows the system is not a reading.',
    body: rows.length ? table(['Role', 'Energy', 'What it means day to day'], rows)
      : note('The blueprint could not be assembled for this chart.'),
  });
}

const fmtT = (d: Date, tzOffsetMinutes: number): string => {
  const local = new Date(d.getTime() + tzOffsetMinutes * 60000);
  return `${String(local.getUTCHours()).padStart(2, '0')}:`
    + `${String(local.getUTCMinutes()).padStart(2, '0')} local`;
};

export type { SectionSpec };
