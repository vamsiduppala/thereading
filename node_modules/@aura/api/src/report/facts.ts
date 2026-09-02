// One chart, composed into the richest set of facts the rule registry can read.
//
// The registry holds ~717 encoded rules, and each reads facts by name: a rule about the
// ashtakavarga bindus in the 5th cannot fire unless somebody put `sav` on the facts, and a rule
// about the Atmakaraka's navamsa cannot fire unless somebody projected D-9. A predicate whose
// fact is missing returns FALSE — silence, not a guess — which is the right discipline and also
// means an under-composed fact object silently halves the report.
//
// The AI planner composes four fields (`lagnaSign`, `lagnaLong`, `planets`, and nothing else).
// That is right for a one-question answer, where speed matters and most rules are irrelevant.
// It is wrong for a full reading, where the whole point is to fire everything that can fire.
//
// So this is the maximal composition, done once: every divisional chart in the Shodasavarga,
// the ashtakavarga rows, the Shadbala rupas, the chara karakas, the upagrahas, the dasha lords
// in force, and the detected yogas. What is still absent is absent because the engine cannot
// compute it, not because nobody wired it — and where that is so, it is named.

import {
  computeChart, computeAshtakavarga, detectYogas, getStackAt, sunriseFacts,
  AstronomiaEphemeris, dateFromJd, GRAHAS,
  type Chart, type Graha, type BirthData,
} from '@aura/engine';
import {
  withVargas, SHODASAVARGA, charaKarakas, sunUpagrahas,
} from '@aura/knowledge';

export const ephem = new AstronomiaEphemeris();

/** Loosely typed: `ChartFacts` is @aura/knowledge's, and its optional fields grow per part. */
export type Facts = Record<string, unknown>;

export interface ComposedChart {
  chart: Chart;
  birthInstant: Date;
  facts: Facts;
  /** Which optional fact groups actually got populated, and which did not and why. */
  provenance: { field: string; present: boolean; note: string }[];
}

/**
 * Build the chart and the fullest fact object available for it.
 *
 * `at` is the moment the dasha lords are read for — "now" for a live report. It does not
 * affect any natal fact.
 */
export function composeChart(birth: BirthData, at: Date): ComposedChart {
  const chart = computeChart(birth, ephem);
  const birthInstant = dateFromJd(chart.julianDayUT);
  const provenance: ComposedChart['provenance'] = [];

  // ── The base: every planet with everything the chart knows about it ────────
  const planets: Record<string, unknown> = {};
  for (const g of GRAHAS) {
    const p = chart.planets[g];
    planets[g] = {
      sign: p.sign,
      house: p.house,
      longitude: p.siderealLong,
      degInSign: p.siderealLong % 30,
      retrograde: p.retrograde,
      combust: p.combust,
    };
  }

  let facts: Facts = {
    lagnaSign: chart.lagnaSign,
    lagnaLong: chart.lagnaLong,
    planets,
  };

  // ── Ashtakavarga: SAV and every planet's own row ───────────────────────────
  try {
    const av = computeAshtakavarga(chart);
    facts.sav = av.sav;
    facts.bav = av.bav;
    provenance.push({
      field: 'sav / bav', present: true,
      note: 'Sarvashtakavarga and all seven Bhinnashtakavarga rows, from the natal rasi chart.',
    });
  } catch (e) {
    provenance.push({ field: 'sav / bav', present: false, note: reason(e) });
  }

  // ── The sixteen divisional charts ──────────────────────────────────────────
  //
  // Projected once here rather than once per rule. `inFrame` reads them from `facts.vargas`;
  // a rule naming a divisor nobody projected gets silence, so projecting all sixteen is what
  // makes the divisional rules reachable at all.
  try {
    facts = withVargas(facts as never, [...SHODASAVARGA], {
      lagnaLongitude: chart.lagnaLong,
    }) as unknown as Facts;
    provenance.push({
      field: 'vargas', present: true,
      note: `All ${SHODASAVARGA.length} divisions of the Shodasavarga projected `
        + `(D-${SHODASAVARGA.join(', D-')}).`,
    });
  } catch (e) {
    provenance.push({ field: 'vargas', present: false, note: reason(e) });
  }

  // ── Chara karakas ─────────────────────────────────────────────────────────
  try {
    const longs: Partial<Record<Graha, number>> = {};
    for (const g of GRAHAS) longs[g] = chart.planets[g].siderealLong;
    const ck = charaKarakas(longs);
    facts.karakas = Object.fromEntries(ck.map((k) => [k.code, k.graha]));
    provenance.push({
      field: 'karakas', present: true,
      note: 'Chara karakas by descending degree-within-sign, Rahu counted backwards.',
    });
  } catch (e) {
    provenance.push({ field: 'karakas', present: false, note: reason(e) });
  }

  // ── Upagrahas ─────────────────────────────────────────────────────────────
  try {
    const sf = sunriseFacts(birthInstant, birth.lat, birth.lng, ephem);
    const rise = sf.sunrise;
    const set = sf.sunset;
    if (rise && set) {
      const ups = sunUpagrahas(chart.planets.sun.siderealLong);
      const table: Record<string, { sign: number }> = {};
      for (const [name, lon] of Object.entries(ups)) {
        if (typeof lon === 'number') table[name] = { sign: Math.floor(lon / 30) };
      }
      facts.upagrahas = table;
      provenance.push({
        field: 'upagrahas', present: Object.keys(table).length > 0,
        note: 'The Sun-derived non-luminous points. Gulika and Mandi depend on the '
          + 'day-segment convention and are reported separately where computed.',
      });
    } else {
      provenance.push({
        field: 'upagrahas', present: false,
        note: 'No sunrise or sunset at this latitude on this date, so the day cannot be '
          + 'divided into segments. Not an error — a polar birth genuinely has no such day.',
      });
    }
  } catch (e) {
    provenance.push({ field: 'upagrahas', present: false, note: reason(e) });
  }

  // ── Yogas detected by the engine ──────────────────────────────────────────
  try {
    facts.yogas = detectYogas(chart).map((y) => y.key);
    provenance.push({
      field: 'yogas', present: true,
      note: 'Keys of the yogas the engine detects directly, offered to rules that '
        + 'predicate on a yoga being present.',
    });
  } catch (e) {
    provenance.push({ field: 'yogas', present: false, note: reason(e) });
  }

  // ── The dasha lords in force at `at` ──────────────────────────────────────
  try {
    const stack = getStackAt(chart.planets.moon.siderealLong, birthInstant, at);
    if (stack) {
      facts.dasha = {
        maha: stack.maha, antar: stack.antar, pratyantar: stack.pratyantar,
        sookshma: stack.sookshma, prana: stack.prana,
      };
      provenance.push({
        field: 'dasha', present: true,
        note: `Vimshottari lords in force on ${at.toISOString().slice(0, 10)}. `
          + 'Rules predicating on a dasha lord read these.',
      });
    }
  } catch (e) {
    provenance.push({ field: 'dasha', present: false, note: reason(e) });
  }

  // ── What is NOT here, and why ─────────────────────────────────────────────
  //
  // Stated rather than left as an absence, because a missing fact silently disables every
  // rule that reads it, and a reader is entitled to know which part of the corpus stayed shut.
  provenance.push({
    field: 'shadbala',
    present: false,
    note: 'Rupas are computed and reported in their own section, but are not placed on the '
      + 'facts: the registry’s strength predicate expects the classical six-fold rupa '
      + 'total, and feeding it the engine’s 0..1 composite would let rules compare two '
      + 'different scales as though they were one.',
  });
  provenance.push({
    field: 'lagnas',
    present: false,
    note: 'The special ascendants (Bhava, Hora, Ghatika) are computed and shown, but not '
      + 'placed on the facts as alternate house references — no encoded rule currently '
      + 'names one, so supplying them would change nothing while widening what a future '
      + 'rule silently reads.',
  });

  return { chart, birthInstant, facts, provenance };
}

const reason = (e: unknown) =>
  `Not composed: ${e instanceof Error ? e.message : String(e)}.`;

export const COMPOSE_ONCE_FIRE_EVERYTHING =
  'A predicate whose fact is missing returns false, so an under-composed fact object does not '
  + 'fail loudly — it just produces a shorter reading, and nothing says why. This composes '
  + 'every group the registry can read, once, and reports which ones landed. The one-question '
  + 'planner deliberately composes far less: there, most rules are irrelevant and the cost is '
  + 'latency a person is waiting on.';
