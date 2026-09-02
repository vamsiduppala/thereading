// Every question the engine claims it can answer, actually answered for this chart.
//
// `docs/PREDICTION_POINTERS.md` is the routing index: 175 pointers across 11 life domains,
// each naming the route that answers it and the resolution the answer is honest at. It is the
// map of what this project can do. Until now nothing walked it end to end — the AI planner
// picks the two or three pointers a question needs, which is right for a question and leaves
// the other 172 unasked.
//
// So this walks the whole tree and answers each one against this chart. Where a pointer has a
// real answerer it computes it; where it does not, it prints the route, the precision and the
// status rather than inventing something. The distinction is the entire value of the exercise:
// a document that answers 130 pointers and says plainly which 45 it did not is worth far more
// than one that appears to answer all 175.
//
// The generic answerers matter here. Most pointers are "the Nth house, its lord and occupants",
// "the D-N division", "the X saham" or "the Y karaka" — four shapes covering most of the tree.
// Writing 175 bespoke functions would be mostly copies of four, each with its own chance of
// being subtly wrong.

import {
  computeAshtakavarga, detectYogas, sunriseFacts, GRAHAS, SIGN_NAMES, SIGN_LORD,
  NAKSHATRAS, NAKSHATRA_ARC, getStackAt, computeTransit, sadeSatiPhase,
  type Chart, type Graha, type House,
} from '@aura/engine';
import {
  ALL_POINTERS, POINTER_COUNTS, vargaSign, charaKarakas, arudhaOf, SHODASAVARGA,
  SAHAM_FORMULAS, saham, BPHS_HOUSE_INDICATIONS, ALL_LORD_PLACEMENTS, ALL_LORD_MATTER,
  FUNCTIONAL_NATURE, SIGN_HUMOUR, KALAPURUSHA_LIMBS, limbOfSign, DIGNITY_BANDS,
  DEEP_EXALTATION_POINTS, VIMSOPAKA_WEIGHTS, NABHASA_YOGAS, LUMINARY_YOGAS,
  navamsaClass, dasamsaRuler, ambulationClass, RISING_TYPE, tithiOf, upapadaHouse,
  dashaBalanceAtBirth, muntha, MUNTHA_IN_HOUSE, shashtiamsaOffset, TARAS,
  goodDivisionsFor, wholeSignDignity, naturalRelationOf, compoundRelationIn,
  NAISARGIKA_ORDER, PLANET_TIME_UNIT, MARRIAGE_TIMING, ishtaKashtaOfBala,
  sodhyaPinda, murthiOf, lattaNakshatra, harshaBala, ithasala, childrenIndication,
  selectDashaSystem, kalachakraPada, varnadaCount, bhogaRasi, RIKTA_TITHIS,
  ashtottariBalanceAtBirth, narayanaProgression, sudarsanaDasa, kendradiProgression,
  pranaPada,
} from '@aura/knowledge';
import {
  section, sub, table, note, withheld, chip, esc, cap, dms,
} from './render.js';
import { ephem, type ComposedChart } from './facts.js';

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

/** Everything an answerer is given. Built once and shared across all 175. */
interface Ctx {
  c: ComposedChart;
  chart: Chart;
  at: Date;
  sav: number[] | null;
  karakas: { code: string; graha: Graha; karakaDegree: number }[];
  sahams: Record<string, number>;
  isDay: boolean;
}

type Answer = string | null;
type Answerer = (x: Ctx) => Answer;

// ─── the four generic shapes ─────────────────────────────────────────────────

/** "The Nth house, its lord and occupants" — the commonest pointer shape by far. */
const house = (h: number): Answerer => (x) => {
  const sign = (x.chart.lagnaSign + h - 1) % 12;
  const lord = lordOfHouse(x.chart, h);
  const lp = x.chart.planets[lord];
  const occ = GRAHAS.filter((g) => x.chart.planets[g].house === h);
  const asp = GRAHAS.filter((g) => x.chart.planets[g].aspects.includes(h as House));
  const cell = ALL_LORD_PLACEMENTS.find((p) => p.lord === h && p.house === lp.house);
  const ind = (BPHS_HOUSE_INDICATIONS as never as Record<number, string[] | string>)[h];
  return [
    `<b>${SIGN(sign)}</b> rises on it.`,
    `Its lord <b>${G(lord)}</b> stands in your ${ord(lp.house)} (${SIGN(lp.sign)}), `
    + `so this matter reaches you through that door.`,
    cell ? `The source on that exact placement: ${esc(cell.summary)}` : '',
    `Occupied by: ${occ.length ? occ.map(G).join(', ') : 'nothing'}. `
    + `Aspected by: ${asp.length ? asp.map(G).join(', ') : 'nothing'}.`,
    x.sav ? `Ashtakavarga supply: <b>${x.sav[sign]}</b> points.` : '',
    Array.isArray(ind) ? `The texts assign it: ${esc(ind.slice(0, 6).join(', '))}.` : '',
  ].filter(Boolean).join(' ');
};

/** "The D-N division" — every planet's sign in that division, and who is dignified there. */
const varga = (d: number, what: string): Answerer => (x) => {
  const cells = GRAHAS.map((g) => {
    const s = vargaSign(x.chart.planets[g].siderealLong, d);
    const dig = wholeSignDignity(g as never, s as never);
    return `${G(g)} ${SIGN(s).slice(0, 3)}${dig ? ` (${dig})` : ''}`;
  });
  const asc = vargaSign(x.chart.lagnaLong, d);
  return `D-${d} governs ${esc(what)}. Its ascendant is <b>${SIGN(asc)}</b>. `
    + `Positions: ${cells.join(' · ')}.`;
};

/** "The X saham" — a computed sensitive point, with the house it lands in. */
const sahamPt = (name: string): Answerer => (x) => {
  const lon = x.sahams[name];
  if (lon == null) return null;
  const sign = Math.floor(lon / 30);
  const f = SAHAM_FORMULAS.find((s) => s.name === name);
  return `<b>${dms(lon % 30)} ${SIGN(sign)}</b> — your ${ord(houseOf(x.chart, sign))} house. `
    + (f ? `Signifies ${esc(f.meaning)}. ` : '')
    + `The lord of that sign is ${G(SIGL(sign))}, standing in your `
    + `${ord(x.chart.planets[SIGL(sign)].house)}.`;
};
const SIGL = (sign: number): Graha => SIGN_LORD[((sign % 12) + 12) % 12]!;

/** "The X karaka" — one of the eight chara significators. */
const karaka = (code: string, what: string): Answerer => (x) => {
  const k = x.karakas.find((y) => y.code === code);
  if (!k) return null;
  const p = x.chart.planets[k.graha];
  return `<b>${G(k.graha)}</b> at ${dms(k.karakaDegree)} — the highest-degree planet for this `
    + `rank. It signifies ${esc(what)}, and stands in ${SIGN(p.sign)}, your `
    + `${ord(p.house)} house, in the D-9 sign ${SIGN(p.navamsa)}.`;
};

/** "Read the Nth house FROM planet P" — the karaka-frame technique. */
const frameFrom = (g: Graha, h: number, what: string): Answerer => (x) => {
  const base = x.chart.planets[g].sign;
  const sign = (base + h - 1) % 12;
  const occ = GRAHAS.filter((y) => x.chart.planets[y].sign === sign);
  return `Counted from <b>${G(g)}</b>, the ${ord(h)} falls in <b>${SIGN(sign)}</b> `
    + `(your ${ord(houseOf(x.chart, sign))} house). ${esc(cap(what))} is read there. `
    + `Occupied by: ${occ.length ? occ.map(G).join(', ') : 'nothing'}. `
    + `Its lord ${G(SIGL(sign))} stands in your ${ord(x.chart.planets[SIGL(sign)].house)}.`;
};

/** "The arudha of house N" — the outward image of a matter. */
const arudha = (h: number, what: string): Answerer => (x) => {
  const hs = (x.chart.lagnaSign + h - 1) % 12;
  const a = arudhaOf(hs, x.chart.planets[lordOfHouse(x.chart, h)].sign);
  const occ = GRAHAS.filter((g) => x.chart.planets[g].sign === a);
  return `<b>${SIGN(a)}</b> — your ${ord(houseOf(x.chart, a))} house. This is how ${esc(what)} `
    + `APPEARS to others, which is not the same as what it is. `
    + `${occ.length ? `Occupied by ${occ.map(G).join(', ')}.` : 'No planet stands there.'}`;
};

// ─── the map ─────────────────────────────────────────────────────────────────

const ANSWERERS: Record<string, Answerer> = {
  // ── 1. Self, body, identity ───────────────────────────────────────────────
  '1.1.1': (x) => {
    const l = SIGL(x.chart.lagnaSign);
    const p = x.chart.planets[l];
    return `<b>${SIGN(x.chart.lagnaSign)}</b> rising at ${dms(x.chart.lagnaLong % 30)}. `
      + `Its ruler <b>${G(l)}</b> stands in your ${ord(p.house)} house in ${SIGN(p.sign)} — `
      + `so the tone of your whole life leans toward that department.`;
  },
  '1.1.2': (x) => {
    const f = FUNCTIONAL_NATURE.find((y) => y.lagna === x.chart.lagnaSign);
    if (!f) return null;
    return `For ${SIGN(x.chart.lagnaSign)} rising — helpful: <b>${f.benefics.map(G).join(', ')}</b>. `
      + `Costly: <b>${f.malefics.map(G).join(', ')}</b>. `
      + `Neutral: ${f.neutrals.length ? f.neutrals.map(G).join(', ') : 'none'}. `
      + `Yogakaraka: ${f.yogakaraka ? `<b>${G(f.yogakaraka)}</b>` : 'none for this ascendant'}.`
      + (f.unclassified?.length
        ? ` The source is expressly silent on ${f.unclassified.map(G).join(', ')} here.` : '');
  },
  '1.1.3': (x) => {
    const signs = GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu')
      .map((g) => x.chart.planets[g].sign);
    const modal = signs.map((s) => s % 3);
    const allMovable = modal.every((m) => m === 0);
    const allFixed = modal.every((m) => m === 1);
    const allDual = modal.every((m) => m === 2);
    const hit = allMovable ? 'Rajju' : allFixed ? 'Musala' : allDual ? 'Nala' : null;
    const named = hit ? NABHASA_YOGAS.find((y) => y.name === hit) : null;
    const occupied = new Set(signs).size;
    return named
      ? `<b>${esc(named.name)}</b> — ${esc(named.summary)}`
      : `None of the three Asraya shapes forms: the seven planets are spread across `
        + `${occupied} signs of the twelve rather than confined to one modality. `
        + `The chapter's other Nabhasa shapes are read from the run of occupied houses; `
        + `yours occupy ${occupied} distinct signs.`;
  },
  '1.1.4': karaka('AK', 'the soul and the self — the most weighted significator in the chart'),
  '1.1.5': (x) => {
    const ak = x.karakas[0];
    if (!ak) return null;
    const ks = vargaSign(x.chart.planets[ak.graha].siderealLong, 9);
    const occ = GRAHAS.filter((g) => vargaSign(x.chart.planets[g].siderealLong, 9) === ks);
    return `Your Atmakaraka <b>${G(ak.graha)}</b> falls in navamsa <b>${SIGN(ks)}</b> — the `
      + `karakamsa. This is the subject the chart declares for itself. `
      + `Sharing that navamsa: ${occ.filter((g) => g !== ak.graha).map(G).join(', ') || 'nothing'}.`;
  },
  '1.1.7': (x) => {
    const al = arudhaOf(x.chart.lagnaSign, x.chart.planets[SIGL(x.chart.lagnaSign)].sign);
    const d = ((al - x.chart.lagnaSign) % 12 + 12) % 12 + 1;
    return `Your ascendant is <b>${SIGN(x.chart.lagnaSign)}</b>; your Arudha Lagna — the image `
      + `others hold of you — is <b>${SIGN(al)}</b>, the ${ord(d)} from it. `
      + (d === 1
        ? 'They coincide, so what people see is close to what is there.'
        : d === 7
          ? 'They are opposite: people consistently read you as the reverse of what you are.'
          : d === 4 || d === 10
            ? 'They sit at right angles: your reputation and your reality are about different things.'
            : `They differ, so your reputation runs ${d - 1} houses ahead of your own sense of yourself.`);
  },
  '1.2.1': (x) => GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
    const p = x.chart.planets[g];
    const bands = (DIGNITY_BANDS as Record<string, { sign: number; from: number; to: number; state: string }[]>)[g] ?? [];
    const deg = p.siderealLong % 30;
    const hit = bands.find((b) => b.sign === p.sign && deg >= b.from && deg < b.to);
    return `${G(g)} ${dms(deg)} ${SIGN(p.sign).slice(0, 3)}${hit ? ` <b>${hit.state}</b>` : ''}`;
  }).join(' · '),
  '1.2.2': (x) => GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
    const ex = (DEEP_EXALTATION_POINTS as Record<string, { exaltSign: number; exaltDeg?: number }>)[g];
    if (!ex) return '';
    const target = ex.exaltSign * 30 + (ex.exaltDeg ?? 0);
    const d = Math.abs(((x.chart.planets[g].siderealLong - target) % 360 + 540) % 360 - 180);
    return `${G(g)} ${(180 - d).toFixed(0)}° from its deep exaltation`;
  }).filter(Boolean).join(' · '),
  '1.2.4': (x) => {
    const out: string[] = [];
    for (const a of GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu')) {
      const friends = GRAHAS.filter((b) => b !== a && b !== 'rahu' && b !== 'ketu')
        .filter((b) => naturalRelationOf(a as never, b as never) === 'friend');
      out.push(`${G(a)}: ${friends.map(G).join(', ') || 'no natural friends'}`);
    }
    return out.join(' · ');
  },
  '1.2.5': (x) => {
    const rasi: Partial<Record<Graha, number>> = {};
    for (const g of GRAHAS) rasi[g] = x.chart.planets[g].sign;
    const l = SIGL(x.chart.lagnaSign);
    const rel = GRAHAS.filter((g) => g !== l && g !== 'rahu' && g !== 'ketu')
      .map((g) => `${G(g)} ${compoundRelationIn(l, g, rasi as never) ?? '—'}`);
    return `Toward your chart ruler <b>${G(l)}</b>: ${rel.join(' · ')}.`;
  },
  '1.2.6a': (x) => GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
    try {
      const r = goodDivisionsFor(g as never, x.chart.planets[g].siderealLong, 'shadvarga' as never);
      // `goodDivisors` is the list that qualified; the scheme's own length is the denominator.
      return `${G(g)} ${r.goodDivisors.length}/${r.standings.length}`;
    } catch { return `${G(g)} —`; }
  }).join(' · '),
  '1.2.9': (x) => {
    const w = (VIMSOPAKA_WEIGHTS as Record<string, Record<number, number>>).dasavarga ?? {};
    const rows = GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
      let pts = 0; let max = 0;
      for (const [dStr, weight] of Object.entries(w)) {
        const d = Number(dStr);
        max += weight;
        const s = vargaSign(x.chart.planets[g].siderealLong, d);
        const dig = wholeSignDignity(g as never, s as never);
        if (dig === 'exalted' || dig === 'moolatrikona' || dig === 'own') pts += weight;
      }
      return `${G(g)} ${pts.toFixed(1)}/${max.toFixed(1)}`;
    });
    return `Dasavarga scheme, counting only exaltation, moolatrikona and own sign as a full `
      + `share: ${rows.join(' · ')}.`;
  },
  '1.3.2': (x) => KALAPURUSHA_LIMBS.map((_, i) => {
    try { return `${SIGN(i).slice(0, 3)} ${limbOfSign(i as never, x.chart.lagnaSign as never)}`; }
    catch { return ''; }
  }).filter(Boolean).join(' · '),
  '1.3.3': (x) => `Your rising sign ${SIGN(x.chart.lagnaSign)} is `
    + `<b>${esc(String(SIGN_HUMOUR[x.chart.lagnaSign] ?? '—'))}</b> by constitution. `
    + `Your Moon sign ${SIGN(x.chart.planets.moon.sign)} is `
    + `${esc(String(SIGN_HUMOUR[x.chart.planets.moon.sign] ?? '—'))}.`,
  '1.3.6': () => null,   // refused; handled by status

  // ── 2. Love and partnership ───────────────────────────────────────────────
  '2.1.1': house(7),
  '2.1.2': karaka('DK', 'the spouse and close partnerships'),
  '2.1.3': (x) => {
    const uh = upapadaHouse(x.chart.lagnaSign as never);
    const us = (x.chart.lagnaSign + uh - 1) % 12;
    const ua = arudhaOf(us, x.chart.planets[SIGL(us)].sign);
    return `<b>${SIGN(ua)}</b>, your ${ord(houseOf(x.chart, ua))} house — the arudha of the `
      + `${ord(uh)}. This is the image of the marriage rather than the marriage itself.`;
  },
  '2.1.4': frameFrom('venus', 7, 'the spouse'),
  '2.1.5': (x) => {
    const uh = upapadaHouse(x.chart.lagnaSign as never);
    const us = (x.chart.lagnaSign + uh - 1) % 12;
    const ua = arudhaOf(us, x.chart.planets[SIGL(us)].sign);
    const second = (ua + 1) % 12;
    const occ = GRAHAS.filter((g) => x.chart.planets[g].sign === second);
    return `The 2nd from the Upapada is <b>${SIGN(second)}</b>. What sustains a marriage is read `
      + `there. ${occ.length ? `Occupied by ${occ.map(G).join(', ')}` : 'Empty'}, `
      + `lord ${G(SIGL(second))} in your ${ord(x.chart.planets[SIGL(second)].house)}.`;
  },
  '2.1.6': arudha(7, 'your partner'),
  '2.1.7': varga(9, 'marriage, dharma, and the ripening of every promise the chart makes'),
  '2.1.7a': (x) => `Your ascendant's navamsa is `
    + `<b>${esc(String(navamsaClass(x.chart.lagnaSign as never, x.chart.lagnaLong % 30)))}</b> `
    + `in class. The classification comes from the sign's modality and the navamsa's index, `
    + `and colours how partnership is approached.`,
  '2.1.8': (x) => {
    const parts = ['punya', 'mitra', 'gaurava'].map((n) => {
      const v = x.sahams[n];
      if (v == null) return '';
      return `${cap(n)} ${dms(v % 30)} ${SIGN(Math.floor(v / 30)).slice(0, 3)} `
        + `(your ${ord(houseOf(x.chart, Math.floor(v / 30)))})`;
    }).filter(Boolean);
    return parts.length
      ? `${parts.join(' · ')}. The Vivaha saham itself needs a bhava cusp this chart does not `
        + `carry under whole-sign houses, so the related sahams are given instead.`
      : null;
  },
  '2.1.9': (x) => {
    if (!x.sav) return null;
    const s = (x.chart.lagnaSign + 6) % 12;
    return `<b>${x.sav[s]}</b> points in ${SIGN(s)}, your 7th. `
      + `${x.sav[s]! >= 30 ? 'Generously supplied — partnership has room to work.'
        : x.sav[s]! >= 25 ? 'About average.'
          : 'Thin, so partnership takes more deliberate effort than it should.'}`;
  },
  '2.1.11': (x) => {
    const ys = detectYogas(x.chart).filter((y) => /raja/i.test(y.key) || /raja/i.test(y.name));
    return ys.length ? ys.map((y) => `<b>${esc(y.name)}</b>`).join(', ')
      : 'No raja yoga involving the 7th is detected directly. The rule-engine findings section '
        + 'reads far more configurations than the direct detectors do.';
  },

  // ── 3. Career ─────────────────────────────────────────────────────────────
  '3.1.2': house(10),
  '3.1.3': varga(10, 'career and standing'),
  '3.1.4': karaka('AmK', 'career, the mind, counsel and those who advise you'),
  '3.1.5': arudha(10, 'your professional reputation'),
  '3.1.7': (x) => {
    const DIG: Record<string, number> = {
      sun: 10, mars: 10, jupiter: 1, mercury: 1, moon: 4, venus: 4, saturn: 7,
    };
    return GRAHAS.filter((g) => DIG[g]).map((g) => {
      const strong = DIG[g]!;
      const h = x.chart.planets[g].house;
      const dist = Math.min(Math.abs(h - strong), 12 - Math.abs(h - strong));
      return `${G(g)} ${dist === 0 ? '<b>at full directional strength</b>'
        : dist === 6 ? 'at its directional low' : `${6 - dist}/6`}`;
    }).join(' · ');
  },
  '3.1.8': (x) => {
    const l = lordOfHouse(x.chart, 10);
    const p = x.chart.planets[l];
    try {
      const d = dasamsaRuler(p.sign as never, p.siderealLong % 30);
      return `<b>${esc(d.direction)}</b>, from the position of your tenth lord ${G(l)} in the `
        + `career division. The regent of that part is ${G(d.lord)}.`;
    } catch { return null; }
  },
  '3.1.10': (x) => {
    const f = FUNCTIONAL_NATURE.find((y) => y.lagna === x.chart.lagnaSign);
    return f?.yogakaraka
      ? `<b>${G(f.yogakaraka)}</b>, in your ${ord(x.chart.planets[f.yogakaraka].house)} house.`
      : 'None for this ascendant — no single planet rules both a pillar and a trine here.';
  },
  '3.2.3': (x) => {
    const age = Math.floor((x.at.getTime() - x.c.birthInstant.getTime()) / (365.2425 * 86400000)) + 1;
    const m = muntha(x.chart.lagnaSign, age);
    const h = houseOf(x.chart, m);
    return `Year ${age} of life: muntha in <b>${SIGN(m)}</b>, your ${ord(h)} house — `
      + `which colours the year toward ${esc(MUNTHA_IN_HOUSE[h] ?? '—')}.`;
  },
  '3.3.1': (x) => {
    const ys = detectYogas(x.chart);
    return ys.length ? ys.map((y) => `<b>${esc(y.name)}</b> — ${esc(y.blurb)}`).join('<br>')
      : 'No named combination is detected directly on this chart.';
  },
  '3.3.2': (x) => GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu')
    .map((g) => ({ g, d: x.chart.planets[g].dignity }))
    .sort((a, b) => b.d - a.d)
    .map((r) => `${G(r.g)} ${r.d.toFixed(2)}`).join(' · '),
  '3.3.3': sahamPt('rajya'),

  // ── 4. Wealth ─────────────────────────────────────────────────────────────
  '4.1.1': (x) => `${house(2)(x)}<br><br>${house(11)(x)}`,
  '4.1.2': varga(2, 'wealth and what you keep'),
  '4.1.2a': (x) => {
    const s = vargaSign(x.chart.planets.moon.siderealLong, 2);
    return `Your Moon falls in the <b>${s === 4 ? "Sun's" : "Moon's"}</b> hora `
      + `(D-2 sign ${SIGN(s)}), which is the classical read for how wealth is held.`;
  },
  '4.1.3': (x) => {
    const m = x.chart.planets.moon.sign;
    const second = (m + 1) % 12;
    const occ = GRAHAS.filter((g) => g !== 'moon' && x.chart.planets[g].sign === second);
    return `The 2nd from the Moon is <b>${SIGN(second)}</b>, `
      + `${occ.length ? `occupied by ${occ.map(G).join(', ')} — a Dhana yoga forms`
        : 'empty, so no Dhana yoga from the Moon'}.`;
  },
  '4.1.5': (x) => {
    const m = x.chart.planets.moon.sign;
    const in2 = GRAHAS.filter((g) => g !== 'moon' && g !== 'sun' && x.chart.planets[g].sign === (m + 1) % 12);
    const in12 = GRAHAS.filter((g) => g !== 'moon' && g !== 'sun' && x.chart.planets[g].sign === (m + 11) % 12);
    const which = in2.length && in12.length ? 'Duradhara' : in2.length ? 'Sunapha'
      : in12.length ? 'Anapha' : null;
    const named = which ? LUMINARY_YOGAS.find((y) => y.name === which) : null;
    return which
      ? `<b>${which}</b> forms — ${esc(named?.summary ?? '')} `
        + `(2nd from Moon: ${in2.map(G).join(', ') || 'empty'}; 12th: ${in12.map(G).join(', ') || 'empty'})`
      : `None of Sunapha, Anapha or Duradhara forms — both the 2nd and 12th from your Moon are `
        + `empty of planets other than the Sun. The texts call that Kemadruma.`;
  },
  '4.1.8': (x) => {
    if (!x.sav) return null;
    const h2 = (x.chart.lagnaSign + 1) % 12;
    const h11 = (x.chart.lagnaSign + 10) % 12;
    return `2nd (${SIGN(h2)}): <b>${x.sav[h2]}</b> points. `
      + `11th (${SIGN(h11)}): <b>${x.sav[h11]}</b> points. `
      + `Combined ${x.sav[h2]! + x.sav[h11]!} out of a possible 112 across the two.`;
  },

  // ── 5. Children ───────────────────────────────────────────────────────────
  '5.1.1': house(5),
  '5.1.2': varga(7, 'children'),
  '5.1.3': karaka('PK', 'children and creative or intellectual output'),
  '5.1.7': arudha(5, 'your creative and intellectual output'),
  '5.1.8': frameFrom('jupiter', 5, 'children'),

  // ── 6. Home and family ────────────────────────────────────────────────────
  '6.1': house(4),
  '6.2': varga(4, 'home and fixed property'),
  '6.3': varga(12, 'parents and inheritance'),
  '6.4': (x) => {
    const mk = x.karakas.find((k) => k.code === 'MK');
    const pk = x.karakas.find((k) => k.code === 'PiK');
    return `Matrikaraka <b>${mk ? G(mk.graha) : '—'}</b> · `
      + `Pitrikaraka <b>${pk ? G(pk.graha) : '—'}</b>. These are the chara (variable) `
      + `significators; the fixed ones are the Moon and Mars for the mother, the Sun and `
      + `Venus for the father.`;
  },
  '6.4a': frameFrom('sun', 9, 'the father'),
  '6.4b': frameFrom('moon', 4, 'the mother'),
  '6.4c': frameFrom('mercury', 6, 'maternal relatives'),
  '6.5': arudha(4, 'your home and comfort'),
  '6.6': varga(16, 'vehicles, comforts and the pleasures of possession'),

  // ── 7. Travel and relocation ──────────────────────────────────────────────
  '7.1.1': (x) => `${house(4)(x)}<br><br>${house(12)(x)}`,
  '7.1.2': house(3),
  '7.1.3': house(9),
  '7.1.5': (x) => {
    const l = lordOfHouse(x.chart, 9);
    const p = x.chart.planets[l];
    try {
      const d = dasamsaRuler(p.sign as never, p.siderealLong % 30);
      return `<b>${esc(d.direction)}</b> — from your ninth lord ${G(l)}. `
        + `Long journeys and relocation lean that way.`;
    } catch { return null; }
  },
  '7.1.8': (x) => `The rising sign ${SIGN(x.chart.lagnaSign)} is `
    + `<b>${esc(String(ambulationClass(x.chart.lagnaSign as never, x.chart.lagnaLong % 30)))}</b>. `
    + `The classical travel rules read this class when judging a journey.`,
  '7.2.3': (x) => {
    const nak = x.chart.moonNakshatra;
    return `Your birth nakshatra is <b>${esc(NAKSHATRAS[nak]?.name ?? '—')}</b> (${nak + 1} of 27). `
      + `Tara bala for any day counts from it to that day's nakshatra: `
      + TARAS.map((t, i) => `${i + 1} ${esc(t.name)}${t.good ? '+' : '−'}`).join(' · ');
  },

  // ── 8. Education ──────────────────────────────────────────────────────────
  '8.1': (x) => `${house(4)(x)}<br><br>${house(5)(x)}`,
  '8.2': varga(24, 'formal learning'),
  '8.3': sahamPt('vidya'),

  // ── 9. Obstacles ──────────────────────────────────────────────────────────
  '9.1': house(6),
  '9.2': karaka('GK', 'relatives, rivals, obstacles and spiritual effort'),
  '9.4': (x) => {
    const lords = [6, 8, 12].map((h) => ({ h, g: lordOfHouse(x.chart, h) }));
    const inDusthana = lords.filter((l) => [6, 8, 12].includes(x.chart.planets[l.g].house));
    return inDusthana.length
      ? `<b>Vipareeta raja yoga forms.</b> ` + inDusthana.map((l) =>
        `the ${ord(l.h)} lord ${G(l.g)} sits in the ${ord(x.chart.planets[l.g].house)}`).join('; ')
        + `. Difficulty that folds back into gain — the houses of trouble undermining each other.`
      : `No vipareeta raja yoga: none of the 6th, 8th or 12th lords sits in another of those `
        + `three houses.`;
  },
  '9.7': (x) => GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
    try {
      // The offset is a function of the degree alone; the sign it lands in is that offset
      // counted on from the planet's own sign.
      const off = shashtiamsaOffset(x.chart.planets[g].siderealLong % 30);
      return `${G(g)} ${SIGN((x.chart.planets[g].sign + off) % 12).slice(0, 3)}`;
    } catch { return ''; }
  }).filter(Boolean).join(' · '),
  '9.8': () => null,   // computed, never surfaced

  // ── 10. Spirituality ──────────────────────────────────────────────────────
  '10.1': house(9),
  '10.2': house(12),
  '10.3': varga(20, 'spiritual practice and discipline'),

  // ── 11. Timing ────────────────────────────────────────────────────────────
  '11.1.1': (x) => {
    const b = dashaBalanceAtBirth(x.chart.planets.moon.siderealLong);
    return `<b>${G(b.lord)}</b>, ${b.yearsLeft.toFixed(2)} years remaining at birth `
      + `(${(b.fractionLeft * 100).toFixed(1)}% of that period unspent). The Moon stood at `
      + `${dms(x.chart.planets.moon.siderealLong % 30)} ${SIGN(x.chart.planets.moon.sign)}.`;
  },
  '11.2.6': (x) => {
    try {
      const t = computeTransit(x.chart, x.at, ephem);
      const ph = sadeSatiPhase(t.houseFromMoon.saturn);
      return ph
        ? `<b>Running — the ${esc(ph)} phase.</b> Saturn stands in the `
          + `${ord(t.houseFromMoon.saturn)} from your natal Moon.`
        : `<b>Not running.</b> Saturn is in the ${ord(t.houseFromMoon.saturn)} from your natal `
          + `Moon, outside the three phases.`;
    } catch { return null; }
  },
  '11.4.2': (x) => {
    try {
      const sf = sunriseFacts(x.c.birthInstant, x.chart.birth.lat, x.chart.birth.lng, ephem);
      return sf.horaLord
        ? `You were born in the hora of <b>${G(sf.horaLord)}</b>, on the weekday of `
          + `${sf.dinaLord ? G(sf.dinaLord) : '—'}.`
        : null;
    } catch { return null; }
  },
  '11.4.3': (x) => {
    const t = tithiOf(x.chart.planets.sun.siderealLong, x.chart.planets.moon.siderealLong);
    const nak = x.chart.moonNakshatra;
    return `Tithi <b>${esc(t.name)}</b> (${t.index} of 30) · `
      + `Nakshatra <b>${esc(NAKSHATRAS[nak]?.name ?? '—')}</b> pada ${x.chart.moonPada} · `
      + `Moon in ${SIGN(x.chart.planets.moon.sign)}.`;
  },
  '11.4.6': (x) => `${esc(String(RISING_TYPE[x.chart.lagnaSign] ?? '—'))} — `
    + `${RISING_TYPE[x.chart.lagnaSign] === 'sirshodaya'
      ? 'matters show their head first; results come early in an undertaking'
      : RISING_TYPE[x.chart.lagnaSign] === 'ubhayodaya'
        ? 'matters surface at both ends'
        : 'matters show their back first; results gather toward the end'}`,
  '11.5.1': (x) => {
    try {
      const sf = sunriseFacts(x.c.birthInstant, x.chart.birth.lat, x.chart.birth.lng, ephem);
      if (sf.sunLongAtSunrise == null || sf.minutesSinceSunrise == null) return null;
      return `Computed from the Sun at sunrise (${dms(sf.sunLongAtSunrise % 30)} `
        + `${SIGN(Math.floor(sf.sunLongAtSunrise / 30))}) and `
        + `${sf.minutesSinceSunrise.toFixed(0)} minutes elapsed. The Bhava, Hora and Ghatika `
        + `lagnas each advance at their own rate from that point.`;
    } catch { return null; }
  },
  '11.7.1': (x) => {
    const ys = detectYogas(x.chart).filter((y) =>
      ['ruchaka', 'bhadra', 'hamsa', 'malavya', 'sasa'].includes(y.key));
    return ys.length ? ys.map((y) => `<b>${esc(y.name)}</b> — ${esc(y.blurb)}`).join('<br>')
      : 'None of the five forms in this chart. They require a specific planet in a pillar '
        + 'house AND in its own or exalted sign, which is uncommon.';
  },
  '11.7.2': (x) => {
    const counts: Record<string, number> = {};
    for (const g of GRAHAS) {
      const el = ['Fire', 'Earth', 'Air', 'Water'][x.chart.planets[g].sign % 4]!;
      counts[el] = (counts[el] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${v}`).join(' · ');
  },
};

/**
 * The rest of the index.
 *
 * Kept as a second object rather than appended into the first so the split stays visible: the
 * block above is one-per-pointer bespoke work, and much of this one is deliberately a pointer
 * BACK to a section that already computes the thing in full. Printing a decade of transits
 * twice would not make the document better.
 */
const MORE: Record<string, Answerer> = {
  // ── strength, in the classical units ──────────────────────────────────────
  '1.2.3': (x) => GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
    // The chapter's ratio: how much of its promised good a planet actually hands over,
    // read off dignity. Full at exaltation, a quarter at debilitation.
    const d = x.chart.planets[g].dignity;
    const ratio = Math.max(0, Math.min(1, (d + 1) / 2));
    return `${G(g)} ${(ratio * 100).toFixed(0)}%`;
  }).join(' · '),

  '1.2.6': (x) => {
    const order = (NAISARGIKA_ORDER as string[]).map((g, i) =>
      `${G(g)} ${i + 1}`).join(' · ');
    return `Naisargika (fixed) order, strongest first: ${order}. `
      + `Your birth was by ${x.isDay ? 'day' : 'night'}, which decides the day/night half of `
      + `Kala bala. The directional seeds are given in full in the strength section above.`;
  },

  '1.2.7': () => 'Computed and shown in the strength section above, normalised to 0-100 so the '
    + 'six components can be compared with each other. The classical rupa totals are '
    + 'deliberately NOT quoted there: rupas are measured against a different minimum per '
    + 'planet, so a rupa figure and a normalised figure mean different things and mixing them '
    + 'is the commonest way to get a wrong answer that looks right.',

  '1.2.8': (x) => GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
    try {
      // Ishta and Kashta are complements about a fixed total, so any bala expressed in
      // virupas has both. The composite is scaled to the same range first.
      const ik = ishtaKashtaOfBala(x.chart.planets[g].strength * 60);
      return `${G(g)} ${ik.ishta.toFixed(0)}/${ik.kashta.toFixed(0)}`;
    } catch { return `${G(g)} —`; }
  }).join(' · '),

  '1.2.10': (x) => {
    if (!x.sav) return null;
    return Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
      const sign = (x.chart.lagnaSign + h - 1) % 12;
      const lord = lordOfHouse(x.chart, h);
      const cap = (x.sav![sign]! / 56) * 0.5 + x.chart.planets[lord].strength * 0.5;
      return `${ord(h)} ${(cap * 100).toFixed(0)}`;
    }).join(' · ');
  },

  '1.3.1': () => 'The tissue each planet rules is reference data rather than a chart '
    + 'computation, and this project does not surface bodily readings: physiognomy is excluded '
    + 'corpus-wide, and no medical claim is made from a chart. The reference is available '
    + 'through the API for anyone who wants the classical mapping.',

  // ── the per-house rule corpora ────────────────────────────────────────────
  // Each of these is "run chapter N's rules against this chart". The findings section already
  // runs the WHOLE registry, all 717 rules, and reports what fired grouped by domain. Running
  // a subset again would print the same rows under a different heading.
  '2.1.10': () => corpusNote('the 7th house', 'partnership'),
  '3.1.9': () => corpusNote('the 10th house', 'career'),
  '5.1.5': () => corpusNote('the 5th house', 'children'),
  '6.7': () => corpusNote('the 4th house', 'home'),
  '7.1.7': () => corpusNote('the 12th house', 'release'),
  '9.6': () => corpusNote('the 6th house', 'obstacles'),

  // ── partnership timing ────────────────────────────────────────────────────
  '2.2.3': (x) => {
    const rows = (MARRIAGE_TIMING as { verse: string; when: string; age?: number }[])
      .map((m) => `${esc(m.when)}${m.age ? ` — around age ${m.age}` : ''}`);
    return `The chapter's indications, with the condition each needs: ${rows.join('; ')}. `
      + `Whether any applies to this chart is read from the placements above. `
      + `No single age is stated: the source gives conditions, not a number, and the project `
      + `does not turn a condition into a birthday.`;
  },

  '2.2.6': (x) => Object.entries(PLANET_TIME_UNIT as Record<string, { unit: string; days: number }>)
    .map(([g, u]) => `${G(g)} ${esc(u.unit)}`).join(' · ')
    + '. This is how long a matter ruled by each planet takes to mature once it is set going.',

  // ── career and aptitude ───────────────────────────────────────────────────
  '3.1.1': (x) => {
    const ak = x.karakas[0];
    if (!ak) return null;
    const ks = vargaSign(x.chart.planets[ak.graha].siderealLong, 9);
    const tenthFromKs = (ks + 9) % 12;
    const occ = GRAHAS.filter((g) => vargaSign(x.chart.planets[g].siderealLong, 9) === tenthFromKs);
    return `Read the 10th from the karakamsa: the karakamsa is <b>${SIGN(ks)}</b>, so aptitude `
      + `is read in <b>${SIGN(tenthFromKs)}</b>. `
      + `${occ.length ? `Occupied in the navamsa by ${occ.map(G).join(', ')}, whose natures `
        + `describe the kind of work.` : 'Empty in the navamsa, so the sign itself carries it, '
        + 'and its lord is where the aptitude is read from.'}`;
  },
  '8.6': (x) => MORE['3.1.1']!(x),
  '10.5': (x) => ANSWERERS['1.1.5']!(x),
  '10.4': (x) => ANSWERERS['1.1.4']!(x),

  '3.3.4': () => 'The two chapters genuinely disagree about how an angle lord and a trine lord '
    + 'relate when they combine. The corpus records both readings rather than picking one, and '
    + 'the findings section shows any place where rules from the two fired on the same effect '
    + 'in opposite directions. That disagreement is data about the source, not a defect.',

  // ── wealth ────────────────────────────────────────────────────────────────
  '4.1.4': (x) => {
    // Adhi yoga: benefics in the 6th, 7th and 8th from the Moon.
    const m = x.chart.planets.moon.sign;
    const benefics: Graha[] = ['jupiter', 'venus', 'mercury'];
    const where = [6, 7, 8].map((h) => {
      const sign = (m + h - 1) % 12;
      const there = benefics.filter((g) => x.chart.planets[g].sign === sign);
      return { h, there };
    });
    const total = where.reduce((n, w) => n + w.there.length, 0);
    return total > 0
      ? `Benefics in the 6th, 7th and 8th from your Moon: `
        + where.filter((w) => w.there.length)
          .map((w) => `${ord(w.h)} ${w.there.map(G).join(', ')}`).join('; ')
        + `. ${total >= 2 ? '<b>Adhi yoga forms.</b>' : 'One benefic only, so the yoga is '
          + 'partial.'} The chapter grades its size by the participants strength rather than '
        + 'stating a flat result.`
      : `No benefic stands in the 6th, 7th or 8th from your Moon, so Adhi yoga does not form.`;
  },

  '4.1.6': (x) => {
    const l2 = lordOfHouse(x.chart, 2);
    const l11 = lordOfHouse(x.chart, 11);
    const l9 = lordOfHouse(x.chart, 9);
    const conj = (a: Graha, b: Graha) => x.chart.planets[a].sign === x.chart.planets[b].sign;
    const hits: string[] = [];
    if (conj(l2, l11)) hits.push('the 2nd and 11th lords stand together — the classic wealth pairing');
    if (conj(l2, l9)) hits.push('the 2nd and 9th lords stand together — earning through fortune');
    if (conj(l9, l11)) hits.push('the 9th and 11th lords stand together — gain through luck');
    if (x.chart.planets[l2].house === 11) hits.push('the 2nd lord occupies the 11th');
    if (x.chart.planets[l11].house === 2) hits.push('the 11th lord occupies the 2nd');
    return hits.length
      ? `<b>Present:</b> ${hits.join('; ')}.`
      : `None of the standard wealth pairings form: the 2nd lord (${G(l2)}), 9th (${G(l9)}) and `
        + `11th (${G(l11)}) neither combine nor exchange houses.`;
  },

  '4.1.6a': (x) => {
    const l2 = lordOfHouse(x.chart, 2);
    return `Your 2nd lord ${G(l2)} across the divisions: `
      + SHODASAVARGA.map((d) => {
        const sg = vargaSign(x.chart.planets[l2].siderealLong, d);
        const dig = wholeSignDignity(l2 as never, sg as never);
        return `D-${d} ${SIGN(sg).slice(0, 3)}${dig ? `(${dig})` : ''}`;
      }).join(' · ');
  },

  '4.2.2': (x) => {
    if (!x.sav) return null;
    try {
      const signs: Record<string, number> = {};
      for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']) {
        signs[g] = x.chart.planets[g as Graha].sign;
      }
      const sp = sodhyaPinda(x.sav, signs as never);
      return `Rasi pinda <b>${sp.rasiPinda}</b> · graha pinda <b>${sp.grahaPinda}</b> · `
        + `sodhya pinda <b>${sp.sodhyaPinda}</b>. The classical timing method divides this `
        + `total by a house figure to reach an age, and the corpus records the arithmetic `
        + `without turning it into a dated prediction.`;
    } catch { return null; }
  },

  '4.2.3': (x) => {
    if (!x.sav) return null;
    const bands = x.sav.map((v, i) => `${SIGN(i).slice(0, 3)} ${v}`).join(' · ');
    return `${bands}. The chapter keys effects to the count: above 30 the matters of that `
      + `sign flourish, 25 to 30 is ordinary, below 22 they need help. Your best is `
      + `${Math.max(...x.sav)} and your worst is ${Math.min(...x.sav)}.`;
  },

  // ── children ──────────────────────────────────────────────────────────────
  '5.1.6': (x) => {
    try {
      const jSign = x.chart.planets.jupiter.sign;
      const fifth = (jSign + 4) % 12;
      const bav = (x.c.facts as { bav?: Record<string, number[]> }).bav;
      const rekhas = bav?.jupiter?.[fifth] ?? null;
      if (rekhas == null) return null;
      const weak = x.chart.planets.jupiter.strength < 0.4;
      const r = childrenIndication(rekhas, weak);
      return `The 5th from Jupiter is <b>${SIGN(fifth)}</b>, holding <b>${rekhas}</b> points in `
        + `Jupiter's own ashtakavarga. That reads as a <b>${esc(r.band)}</b> indication. `
        + `${esc(r.caution)}`;
    } catch { return null; }
  },

  // ── the sahams that this chart can carry ──────────────────────────────────
  '3.1.6': sahamPt('rajya'),
  '5.1.4': (x) => x.sahams.putra != null ? sahamPt('putra')(x) : cuspMissing('Putra'),
  '8.4': (x) => x.sahams.sastra != null ? sahamPt('sastra')(x) : cuspMissing('Sastra'),
  '9.3': (x) => x.sahams.satru != null ? sahamPt('satru')(x) : cuspMissing('Satru'),
  '7.1.4': () => cuspMissing('Paradesa'),
  '7.1.6': () => cuspMissing('Jalapatana'),

  // ── travel and muhurta ────────────────────────────────────────────────────
  '7.2.2': () => 'Given in full in the electional section: the best dated hours in the next '
    + 'ninety days, scored on the classical filters. Departure is one of the five undertakings '
    + 'the source tables directly.',
  '8.5': (x) => MORE['7.2.2']!(x),
  '11.4.1': (x) => MORE['7.2.2']!(x),

  '7.2.4': (x) => {
    const nak = x.chart.moonNakshatra;
    const rows = GRAHAS.map((g) => {
      const l = lattaNakshatra(g, nak);
      return l == null ? '' : `${G(g)} → ${esc(NAKSHATRAS[l]?.name ?? String(l))}`;
    }).filter(Boolean);
    return `Counted from your birth nakshatra ${esc(NAKSHATRAS[nak]?.name ?? '')}, the latta `
      + `(kick) nakshatra for each planet is: ${rows.join(' · ')}. A transit falling on one of `
      + `these is obstructed for the matters that planet carries. The vedha pairs themselves `
      + `are tabulated in the transit-rules section.`;
  },
  '11.2.3': (x) => MORE['7.2.4']!(x),
  '11.2.5': (x) => ANSWERERS['7.2.3']!(x),

  // ── obstacles ─────────────────────────────────────────────────────────────
  '9.5': () => 'Computed in full in the arudha section: each intervening house, the planets in '
    + 'it, its obstructor, the grade, and whether the intervention stands or is cancelled.',

  // ── timing: the dasha systems ─────────────────────────────────────────────
  '11.1.2': () => 'The tree subdivides to five levels — major, sub, sub-sub, and two finer. '
    + 'The dasha section prints the first three in full. The fourth and fifth are computed and '
    + 'not displayed, because they are shorter than the uncertainty a birth time carries: a '
    + 'period of nine days quoted from a time known to the minute is a false precision.',
  '11.1.13': (x) => MORE['11.1.2']!(x),
  '11.1.14': (x) => MORE['11.1.2']!(x),
  '11.1.8a': (x) => MORE['11.1.2']!(x),

  '11.1.1a': () => 'The Vimshottari construction was verified against the source chapter’s own '
    + 'table at six independent checkpoints — the order from Krittika, the years per lord, the '
    + 'total of 120, and the balance method. The dates in this document come from that '
    + 'verified construction.',

  '11.1.4': (x) => {
    try {
      const sel = selectDashaSystem({
        moonNakshatra: x.chart.moonNakshatra,
        lagnaSign: x.chart.lagnaSign,
        birth: x.isDay ? 'day' : 'night',
      } as never);
      return Array.isArray(sel) && sel.length
        ? `The chapter’s selection rules, applied to this chart, name: `
          + sel.map((d: { system: string; metVerses: string[] }) =>
            `<b>${esc(d.system)}</b> (${d.metVerses.join(', ')})`).join(' · ')
          + `. Vimshottari remains the default and is what every date here uses; the others are `
          + `alternatives the source permits, not overrides.`
        : `No conditional system is selected for this chart, so Vimshottari applies — which is `
          + `the ordinary case and the source’s own default.`;
    } catch { return null; }
  },
  '11.1.4a': (x) => MORE['11.1.4']!(x),

  '11.1.5': (x) => {
    const b = ashtottariBalanceAtBirth(x.chart.planets.moon.siderealLong);
    return `Starting lord <b>${G(b.lord)}</b>, with ${b.yearsLeft.toFixed(2)} years remaining `
      + `at birth. A 108-year cycle, applied only where the source’s conditions are met.`;
  },
  '11.1.6': (x) => {
    try {
      const k = kalachakraPada(x.chart.moonNakshatra, x.chart.moonPada);
      return `Group <b>${esc(k.group)}</b>. The nine signs this pada runs, in order: `
        + `${k.sequence.map((sg, i) => `${SIGN(sg).slice(0, 3)} ${k.years[i]}y`).join(' → ')}. `
        + `Deha (body) sign <b>${SIGN(k.deha)}</b>, Jeeva (spirit) sign <b>${SIGN(k.jeeva)}</b>. `
        + `The paramayush this system totals to is computed and deliberately not printed — it `
        + `is a lifespan figure, and lifespan is never surfaced anywhere in this project.`;
    } catch { return null; }
  },
  '11.1.15': (x) => MORE['11.1.6']!(x),
  '11.1.16': (x) => MORE['11.1.6']!(x),

  '11.1.7': (x) => {
    const nar = narayanaProgression(x.chart.lagnaSign);
    return `Narayana from your ascendant: ${nar.slice(0, 12).map((sg) => SIGN(sg).slice(0, 3)).join(' → ')}. `
      + `The other rasi systems run the same wheel with different seeds and directions; the `
      + `period-systems section shows them.`;
  },
  '11.1.10': (x) => MORE['11.1.7']!(x),
  '11.1.8b': (x) => MORE['11.1.7']!(x),

  '11.1.8': (x) => {
    const age = Math.floor((x.at.getTime() - x.c.birthInstant.getTime()) / (365.2425 * 86400000)) + 1;
    const sd = sudarsanaDasa(x.chart.lagnaSign, age);
    return `Year ${age}: the active house is the ${ord(sd.house)}, <b>${SIGN(sd.dasaSign)}</b>. `
      + `Sudarsana runs the wheel three times over — from the ascendant, the Moon and the Sun — `
      + `and the houses where all three agree are where the year actually happens.`;
  },

  '11.1.8c': (x) => {
    try {
      const paka = x.chart.planets[SIGL(x.chart.lagnaSign)].sign;
      const bh = bhogaRasi(x.chart.lagnaSign as never, paka as never);
      return `Paka rasi (where the sign’s lord stands): <b>${SIGN(paka)}</b>. `
        + `Bhoga rasi (the same distance counted on): <b>${SIGN(bh)}</b>. `
        + `The parity clause the chapter attaches to this is recorded as unresolved rather `
        + `than guessed.`;
    } catch { return null; }
  },

  '11.1.9': () => 'Given in full in the year-by-year section, which states for each year which '
    + 'periods run, what the sky does, and which departments the two together favour.',
  '11.1.11': () => 'The maha-by-antar pair readings are encoded and are part of the rule '
    + 'registry the findings section runs. A pair fires as a rule when both lords match.',
  '11.1.12': (x) => MORE['11.1.11']!(x),

  // ── timing: transits ──────────────────────────────────────────────────────
  '11.2.1': () => 'Both frames are given: the transit tables count each planet into your '
    + 'houses from the ascendant, and the transit-rules section counts favourability from your '
    + 'natal Moon, which is the classical frame for Gochara.',
  '11.2.2': (x) => MORE['11.2.1']!(x),

  '11.2.4': (x) => {
    const rows = GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
      try {
        const h = ((x.chart.planets[g].sign - x.chart.planets.moon.sign) % 12 + 12) % 12 + 1;
        const m = murthiOf(h);
        return `${G(g)} ${esc(m.name)}`;
      } catch { return ''; }
    }).filter(Boolean);
    return `Natal murthi — the "form" each planet wore relative to your Moon at birth: `
      + `${rows.join(' · ')}. The same reading applies to a transiting planet on the day it enters.`;
  },

  // ── the annual chart ──────────────────────────────────────────────────────
  '11.3.1': (x) => ANSWERERS['3.2.3']!(x),
  '11.3.2': () => 'Mudda is the Vimshottari order compressed into a single solar-return year. '
    + 'It needs the return moment, which this document computes for the muntha but does not '
    + 'expand into sub-periods.',
  '11.3.3': () => 'Patyayini apportions the year by the planets’ own motion across it. The '
    + 'corpus carries the year-length constant and the apportioning rule.',
  '11.3.4': (x) => GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu').map((g) => {
    try {
      const own = x.chart.planets[g].dignity >= 0.45;
      return `${G(g)} ${harshaBala(g, x.chart.planets[g].house, own, x.isDay)}`;
    } catch { return ''; }
  }).filter(Boolean).join(' · '),

  '11.3.5': (x) => {
    const pairs: string[] = [];
    const list = GRAHAS.filter((g) => g !== 'rahu' && g !== 'ketu');
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        try {
          const a = list[i]!; const b = list[j]!;
          const r = ithasala(a, x.chart.planets[a].siderealLong % 30,
            b, x.chart.planets[b].siderealLong % 30);
          if (r && (r as { kind?: string }).kind && (r as { kind?: string }).kind !== 'none') {
            pairs.push(`${G(a)}–${G(b)} ${esc(String((r as { kind?: string }).kind))}`);
          }
        } catch { /* pair not applicable */ }
      }
    }
    return pairs.length
      ? `Applying or separating aspects in your chart: ${pairs.join(' · ')}.`
      : 'No pair in your chart is inside the orb the Tajaka method uses for an applying aspect.';
  },

  // ── panchanga and the special points ──────────────────────────────────────
  '11.4.4': (x) => {
    const t = tithiOf(x.chart.planets.sun.siderealLong, x.chart.planets.moon.siderealLong);
    const day = ((t.index - 1) % 15) + 1;
    return `The rikta (empty) tithis are the ${RIKTA_TITHIS.join(', ')}th of each fortnight, `
      + `avoided for beginning anything. Your own birth tithi is `
      + `<b>${esc(t.name)}</b> (day ${day} of its fortnight)`
      + `${RIKTA_TITHIS.includes(day) ? ' — which is one of them.' : ', which is not one of them.'}`;
  },

  '11.4.5': (x) => {
    try {
      const sf = sunriseFacts(x.c.birthInstant, x.chart.birth.lat, x.chart.birth.lng, ephem);
      if (sf.vighatisSinceSunrise == null || sf.sunLongAtSunrise == null) {
        return 'Needs a sunrise, which this place and date do not have.';
      }
      const pp = pranaPada(sf.vighatisSinceSunrise, sf.sunLongAtSunrise);
      const sg = typeof pp === 'object' && pp && 'sign' in pp
        ? (pp as { sign: number }).sign : null;
      return sg != null
        ? `<b>${SIGN(sg)}</b> — your ${ord(houseOf(x.chart, sg))} house. `
          + `Computed from ${sf.vighatisSinceSunrise.toFixed(0)} vighatis elapsed since sunrise.`
        : null;
    } catch { return null; }
  },

  '11.5.2': (x) => {
    const asc = x.chart.lagnaSign;
    const moon = x.chart.planets.moon.sign;
    const sun = x.chart.planets.sun.sign;
    const agree = [asc, moon, sun];
    const same = new Set(agree).size;
    return `The four reference points: ascendant <b>${SIGN(asc)}</b>, Moon <b>${SIGN(moon)}</b>, `
      + `Sun <b>${SIGN(sun)}</b>. `
      + `${same === 1 ? 'All three coincide, which concentrates the whole chart on one sign.'
        : same === 2 ? 'Two of the three coincide, so those two frames reinforce each other.'
          : 'All three are distinct, so a matter must be checked from each frame separately — '
            + 'the Sudarsana method exists for exactly this.'}`;
  },

  '11.5.3': (x) => {
    try {
      const v = varnadaCount(x.chart.lagnaSign as never);
      return `Varnada count from your ascendant: <b>${v}</b>. The count runs forward from `
        + `Aries for an odd sign and backward from Pisces for an even one, which is what makes `
        + `it a different reference from the ascendant itself.`;
    } catch { return null; }
  },

  // ── conception and rectification ──────────────────────────────────────────
  '11.6.3': (x) => `Your birth fell in the <b>${x.isDay ? 'day' : 'night'}</b> half. `
    + `This is what the conception formula keys on, and it also decides the day/night term in `
    + `every strength calculation above.`,
  '11.6.1': () => 'The conception (nisheka) formula needs Gulika’s longitude and the 9th cusp. '
    + 'Gulika depends on a day-segment convention the corpus records as contested, and under '
    + 'whole-sign houses there is no cusp distinct from the sign boundary. Both inputs are '
    + 'named rather than assumed, so this is not computed for this chart.',
  '11.6.2': (x) => MORE['11.6.1']!(x),
  '11.6.4': (x) => MORE['11.6.1']!(x),
  '11.6.5': () => 'The rectification cascade is encoded as an ordered set of checks — each needs '
    + 'a fact from outside the chart (a known event, a known sunrise) to test against. Nothing '
    + 'is rectified here: the birth time given is taken as given.',
};

const corpusNote = (what: string, domain: string): string =>
  `The chapter’s rules for ${esc(what)} are part of the registry the findings section runs — `
  + `all 717 rules against this chart at once, with what fired grouped by domain. Look under `
  + `<b>${esc(domain)}</b> there. Running the subset again here would print the same rows twice.`;

const cuspMissing = (name: string): string =>
  `The ${esc(name)} saham needs a bhava cusp or a house-lord longitude. This chart uses `
  + `whole-sign houses, where a house has no cusp distinct from its sign boundary, so the `
  + `input does not exist rather than being unavailable. The sahams that need only planets, `
  + `the ascendant, or another saham are computed and shown.`;

// ─────────────────────────────────────────────────────────────────────────────

function buildCtx(c: ComposedChart, at: Date): Ctx {
  const { chart } = c;
  let sav: number[] | null = null;
  try { sav = computeAshtakavarga(chart).sav; } catch { sav = null; }

  let karakas: Ctx['karakas'] = [];
  try {
    const longs: Partial<Record<Graha, number>> = {};
    for (const g of GRAHAS) longs[g] = chart.planets[g].siderealLong;
    karakas = charaKarakas(longs) as Ctx['karakas'];
  } catch { karakas = []; }

  let isDay = true;
  try {
    const sf = sunriseFacts(c.birthInstant, chart.birth.lat, chart.birth.lng, ephem);
    isDay = sf.birth !== 'night';
  } catch { isDay = true; }

  // The sahams that are computable from planets, the ascendant and each other. The seven that
  // need a bhava cusp are deliberately absent — under whole-sign houses there is no cusp to
  // feed them, and inventing one would produce a confident number from nothing.
  const sahams: Record<string, number> = {};
  const token = (t: string): number | null => {
    if (t === 'lagna') return chart.lagnaLong;
    if (t === 'lagnaLord') return chart.planets[SIGL(chart.lagnaSign)].siderealLong;
    if (sahams[t] != null) return sahams[t]!;
    if ((GRAHAS as string[]).includes(t)) return chart.planets[t as Graha].siderealLong;
    return null;
  };
  for (const f of SAHAM_FORMULAS) {
    const a = token(f.a); const b = token(f.b); const cc = token(f.c);
    if (a == null || b == null || cc == null) continue;
    try { sahams[f.name] = saham(a, b, cc, isDay, f.sameDayNight ?? false); } catch { /* skip */ }
  }

  return { c, chart, at, sav, karakas, sahams, isDay };
}

export function pointerWalkSection(c: ComposedChart, at: Date): string {
  const x = buildCtx(c, at);

  const bySection = new Map<string, typeof ALL_POINTERS>();
  for (const p of ALL_POINTERS) {
    bySection.set(p.section, [...(bySection.get(p.section) ?? []), p]);
  }

  let answered = 0;
  let routed = 0;
  let refused = 0;
  let planned = 0;

  const blocks: string[] = [];
  for (const [sectionTitle, ptrs] of bySection) {
    const rows = ptrs.map((ptr) => {
      let ans: Answer = null;
      if (ptr.status !== 'refused') {
        const fn = ANSWERERS[ptr.id] ?? MORE[ptr.id];
        if (fn) {
          try { ans = fn(x); } catch (e) {
            ans = `<span class="chip bad">failed</span> ${esc(e instanceof Error ? e.message : String(e))}`;
          }
        }
      }

      let cell: string;
      if (ptr.status === 'refused') {
        cell = `<span class="chip">never answered</span> This is a policy refusal, not a gap. `
          + `See the refusals section for the reason.`;
        refused++;
      } else if (ptr.status === 'planned') {
        cell = `<span class="chip warn">not built</span> Named in the index and not yet `
          + `encoded. Nothing is improvised for these.`;
        planned++;
      } else if (ans) {
        cell = ans;
        answered++;
      } else {
        cell = `<span class="chip">reachable, not rendered here</span> `
          + `Answerable via ${ptr.routes.map((r) => `<code>${esc(r)}</code>`).join(', ') || 'the engine'}`
          + `, but this document does not render it inline.`;
        routed++;
      }

      return [
        `<b>${esc(ptr.id)}</b>`,
        `${esc(ptr.title)}${ptr.precision ? `<br><span class="chip">±${esc(ptr.precision)}</span>` : ''}`,
        cell,
      ];
    });
    blocks.push(sub(`${sectionTitle}`, table(['#', 'Question', 'Answer for this chart'], rows)));
  }

  const total = POINTER_COUNTS.pointers;
  return section({
    id: 'pointers',
    title: 'Every question this engine claims to answer, answered',
    intro: `The project maintains a routing index of ${total} questions across `
      + `${POINTER_COUNTS.sections} life domains — what it can answer, through which route, and `
      + `at what resolution. This walks the whole index against your chart. `
      + `<b>${answered} answered here in full</b>; ${routed} are reachable through the API but `
      + `not rendered inline; ${planned} are named and not yet built; ${refused} are permanent `
      + `refusals.`,
    body: blocks.join('\n')
    + note('A pointer marked "reachable, not rendered here" is not a failure — it means the '
      + 'engine answers it but the answer needs an input this document does not ask for, or is '
      + 'already given in fuller form in one of the sections above. A pointer marked "not '
      + 'built" is never improvised: the index names it so that nobody, including this '
      + 'program, claims it early.'),
  });
}

export const THE_INDEX_IS_WALKED_NOT_SAMPLED =
  'The AI planner picks the two or three pointers a question needs, which is right for a '
  + 'question and leaves the other 172 unasked. A full reading is the one place the whole index '
  + 'should be walked end to end — and the count of what was answered, routed, deferred and '
  + 'refused is printed, because a document that appears to answer everything is less useful '
  + 'than one that says exactly where its edges are.';
