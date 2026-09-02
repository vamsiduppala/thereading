// Shadbala, complete — all six components, all seven planets, from a birth alone.
//
// This is the end of a chain that ran through several parts of the programme. `shadbalaPinda`
// could always assemble six components and refuse to judge a partial total; what it could not do
// was obtain them. On a real chart, four of the six came back NULL and a fifth was quietly
// wrong:
//
//   sthana   NULL  — no dignity tier per varga        → knowledge/shadbala-inputs
//   kala     ≈     — computed, but SILENTLY LIGHT     → engine/solar-ingress
//   cheshta  NULL  — for the five tara-grahas         → engine/cheshta
//   drik     NULL  — no aspect pindas                 → knowledge/shadbala-inputs
//
// **The `kala` case is the one worth dwelling on.** It was never null, so nothing flagged it —
// it was a number, produced from two of `varshaMasaDinaHoraBala`'s four lords, and therefore up
// to 45 virupas light on every chart. That is precisely the failure `shadbalaPinda`'s
// completeness guard exists to prevent, occurring one level below where the guard could see it.
//
// This file is the only place in the repo that can import both packages, so it is where the
// halves are shown to meet.

import { describe, it, expect } from 'vitest';
import {
  shadbalaPinda, shadbalaVerdictOf, meetsShadbalaRequirement,
  saptavargajaTierForChart, drikPindas, cheshtaBalaTara, varshaMasaDinaHoraBala,
  saptavargajaTierFor, saptavargajaBala, SAPTAVARGA_DIVISIONS,
  SHADBALA_PLANETS,
} from '@aura/knowledge';
import {
  computeChart, AstronomiaEphemeris, sunriseFacts, periodLordsFromSunrise,
  navamsaSign, cheshtaInputs, jdFromDate, jdToJde, WEEKDAY_LORDS,
} from '@aura/engine';
import type { Graha } from '@aura/engine';

const ephem = new AstronomiaEphemeris();

interface Birth {
  name: string; date: string; time: string; lat: number; lng: number; tz: number; utc: string;
}

/** Four births spread over place and season, so completeness is not a property of one chart. */
const BIRTHS: Birth[] = [
  { name: 'Delhi, May', date: '1990-05-15', time: '06:30', lat: 28.6139, lng: 77.2090,
    tz: 330, utc: '1990-05-15T01:00:00Z' },
  { name: 'London, January', date: '1975-01-20', time: '14:45', lat: 51.5074, lng: -0.1278,
    tz: 0, utc: '1975-01-20T14:45:00Z' },
  { name: 'Sydney, December', date: '2003-12-08', time: '23:10', lat: -33.8688, lng: 151.2093,
    tz: 660, utc: '2003-12-08T12:10:00Z' },
  { name: 'Quito, September', date: '1988-09-30', time: '03:20', lat: -0.1807, lng: -78.4678,
    tz: -300, utc: '1988-09-30T08:20:00Z' },
];

/** Everything a full Shadbala needs, assembled the way an application would. */
function fullShadbala(b: Birth) {
  const at = new Date(b.utc);
  const chart = computeChart({
    date: b.date, time: b.time, unknownTime: false, place: b.name,
    lat: b.lat, lng: b.lng, tzOffsetMinutes: b.tz,
  }, ephem);
  const facts = sunriseFacts(at, b.lat, b.lng, ephem);
  const ci = cheshtaInputs(jdToJde(jdFromDate(at)));

  const positions: Partial<Record<Graha, number>> = {};
  const rasiSigns: Partial<Record<Graha, number>> = {};
  for (const [g, p] of Object.entries(chart.planets)) {
    positions[g as Graha] = p.siderealLong;
    rasiSigns[g as Graha] = p.sign;
  }

  // Waxing when the Moon is 0-180° ahead of the Sun.
  const moonIsBenefic = ((positions.moon! - positions.sun! + 360) % 360) < 180;
  const drik = drikPindas(positions, { moonIsBenefic });

  const planets: Record<string, unknown> = {};
  for (const [g, p] of Object.entries(chart.planets)) {
    planets[g] = {
      longitude: p.siderealLong,
      tropicalLongitude: (p.siderealLong + chart.ayanamsa) % 360,
      house: p.house,
      navamsaSign: navamsaSign(p.siderealLong),
      // The CHART-AWARE form: supplies the compound (Panchadha Maitri) relationship, so
      // all seven tiers are reachable rather than the middle five.
      saptavargajaTier: saptavargajaTierForChart(g as Graha, p.siderealLong, rasiSigns as never),
      meanLongitude: ci[g as Graha]?.meanLongitude,
      seeghrocha: ci[g as Graha]?.seeghrocha,
      drik: drik[g as Graha],
    };
  }

  return {
    chart, facts, ci, positions, rasiSigns, moonIsBenefic,
    result: shadbalaPinda({
      lagnaLongitude: chart.lagnaLong,
      sunLongitude: positions.sun!,
      moonLongitude: positions.moon!,
      ghatisFromMidnight: facts.ghatisFromMidnight,
      isDay: facts.birth === 'day',
      tribhagaThird: facts.tribhaga?.third,
      periodLords: periodLordsFromSunrise(facts),
      planets: planets as never,
    }),
  };
}

describe('every component resolves, on every chart', () => {
  for (const b of BIRTHS) {
    it(`completes all six for all seven planets — ${b.name}`, () => {
      const { result } = fullShadbala(b);
      expect(Object.keys(result)).toHaveLength(SHADBALA_PLANETS.length);

      for (const [graha, r] of Object.entries(result)) {
        expect(r.missing, `${graha} missing`).toEqual([]);
        expect(r.complete, `${graha} complete`).toBe(true);
        expect(Number.isFinite(r.total), `${graha} total is finite`).toBe(true);
        // A complete total can be judged. `'unknown'` here would mean the guard had fired.
        expect(shadbalaVerdictOf(r), `${graha} verdict`).not.toBe('unknown');
        expect(meetsShadbalaRequirement(r), `${graha} requirement`).not.toBeNull();
      }
    });
  }

  it('produces a NUMBER, not NaN, which a wrong field name would not', () => {
    // `PlanetPos` carries `siderealLong`; reading `lon` yields undefined, and undefined flows
    // through `Math.floor` and every arithmetic component as NaN while `== null` stays false —
    // so it would be reported complete. This is the guard against that exact slip.
    for (const b of BIRTHS) {
      const { result } = fullShadbala(b);
      for (const [graha, r] of Object.entries(result)) {
        expect(Number.isNaN(r.total), `${graha} total is NaN`).toBe(false);
        for (const [k, v] of Object.entries(r.components)) {
          expect(Number.isNaN(v as number), `${graha}.${k}`).toBe(false);
        }
      }
    }
  });
});

describe('the components behave as chapter 27 says they should', () => {
  const { result, ci, chart, positions } = fullShadbala(BIRTHS[0]!);

  it('lets Drik bala go negative, alone among the six', () => {
    // (benefic − malefic)/4. A planet under heavy malefic aspect legitimately subtracts from
    // its own total — Drik is the only component that can.
    const driks = Object.values(result).map((r) => r.components.drik!);
    expect(Math.min(...driks)).toBeLessThan(0);
    // While the others never do.
    for (const r of Object.values(result)) {
      for (const k of ['sthana', 'dig', 'kala', 'cheshta', 'naisargika'] as const) {
        expect(r.components[k]!, `${r.graha}.${k}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('gives the luminaries a BORROWED Cheshta bala, not a motional one (27.18)', () => {
    // Neither luminary retrogrades, so the text takes the Sun's Cheshta bala to be its Ayana
    // bala and the Moon's to be its Paksha bala. The engine correspondingly refuses to supply
    // motional inputs for them — computing one would be a plausible-looking invention.
    expect(ci.sun).toBeUndefined();
    expect(ci.moon).toBeUndefined();
    // And yet both still have a Cheshta figure, because 27.18 supplies it another way.
    expect(result.sun!.components.cheshta).not.toBeNull();
    expect(result.moon!.components.cheshta).not.toBeNull();
  });

  it('agrees across the package boundary on the tara-grahas’ Cheshta bala', () => {
    // The engine produces the madhyama and śīghrocha; the knowledge package turns them into
    // virupas. Neither can see the other, so this is where the two are checked to meet.
    for (const g of ['mars', 'mercury', 'jupiter', 'venus', 'saturn'] as Graha[]) {
      const c = ci[g]!;
      const direct = cheshtaBalaTara(c.meanLongitude, positions[g]!, c.seeghrocha);
      expect(result[g]!.components.cheshta!, g).toBeCloseTo(direct, 9);
      expect(direct).toBeGreaterThanOrEqual(0);
      expect(direct).toBeLessThanOrEqual(60);
    }
  });

  it('keeps every component inside the maximum chapter 27 allows it', () => {
    for (const r of Object.values(result)) {
      expect(r.components.dig!, `${r.graha} dig`).toBeLessThanOrEqual(60);
      expect(r.components.cheshta!, `${r.graha} cheshta`).toBeLessThanOrEqual(60);
      expect(r.components.naisargika!, `${r.graha} naisargika`).toBeLessThanOrEqual(60);
      expect(r.components.kala!, `${r.graha} kala`).toBeLessThanOrEqual(390);
      expect(r.components.sthana!, `${r.graha} sthana`).toBeLessThanOrEqual(60 + 45 * 7 + 30 + 60 + 40);
    }
    expect(chart.lagnaLong).toBeGreaterThanOrEqual(0);
  });
});

describe('27.13 — all four period lords, and the 45 virupas that were missing', () => {
  it('supplies varsha, masa, dina and hora on every chart', () => {
    for (const b of BIRTHS) {
      const { facts } = fullShadbala(b);
      const lords = periodLordsFromSunrise(facts);
      expect(Object.keys(lords).sort(), b.name).toEqual(['dina', 'hora', 'masa', 'varsha']);
    }
  });

  it('agrees with the sunrise-derived weekday on the dina lord', () => {
    // The dina lord has two independent derivations — the weekday of the opening sunrise, and
    // whatever the period-lord machinery produces. They must not diverge.
    for (const b of BIRTHS) {
      const { facts } = fullShadbala(b);
      const lords = periodLordsFromSunrise(facts);
      expect(lords.dina, b.name).toBe(WEEKDAY_LORDS[facts.sunrise!.getUTCDay()]);
    }
  });

  it('scores the full 150 to a planet ruling all four periods', () => {
    // The arithmetic that was silently capped at 105. A planet ruling every period takes the
    // lot; one ruling none takes nothing rather than a consolation default.
    const all: Record<string, Graha> = {
      varsha: 'jupiter', masa: 'jupiter', dina: 'jupiter', hora: 'jupiter',
    };
    expect(varshaMasaDinaHoraBala('jupiter', all)).toBe(150);
    expect(varshaMasaDinaHoraBala('saturn', all)).toBe(0);
  });

  it('was measurably light before — two lords cap the component at 105', () => {
    // Not a hypothetical. With only dina and hora supplied, the ceiling is 105, so every chart
    // ran up to 45 virupas short with nothing null to reveal it.
    const twoOnly: Record<string, Graha> = { dina: 'jupiter', hora: 'jupiter' };
    expect(varshaMasaDinaHoraBala('jupiter', twoOnly)).toBe(105);
    expect(150 - 105).toBe(45);
  });
});

describe('the compound relationship, on real charts', () => {
  it('reaches tiers on real charts that the natural scale cannot', () => {
    // `great-friend` (20 virupas) and `great-enemy` (2) need the temporary relationship, which
    // is a pure sign-distance check across the chart. Without it every planet is scored on a
    // compressed five-tier scale — bounded, plausible, and systematically pulled toward the
    // middle. This shows the extremes actually occur once the chart is consulted.
    const reached = new Set<string>();
    for (const b of BIRTHS) {
      const { chart, rasiSigns } = fullShadbala(b);
      for (const [g, p] of Object.entries(chart.planets)) {
        if (g === 'rahu' || g === 'ketu') continue;
        const tierFor = saptavargajaTierForChart(g as Graha, p.siderealLong, rasiSigns as never);
        for (const d of SAPTAVARGA_DIVISIONS) reached.add(tierFor(d));
      }
    }
    expect(reached.has('great-friend')).toBe(true);
    expect(reached.has('great-enemy')).toBe(true);
  });

  it('changes the Sthana bala it feeds, so the wiring is not decorative', () => {
    // A compound scale that never altered a total would be a no-op dressed as a feature.
    const { chart, rasiSigns } = fullShadbala(BIRTHS[0]!);
    let differing = 0;
    for (const [g, p] of Object.entries(chart.planets)) {
      if (g === 'rahu' || g === 'ketu') continue;
      const aware = saptavargajaBala(
        saptavargajaTierForChart(g as Graha, p.siderealLong, rasiSigns as never),
      );
      const blind = saptavargajaBala(saptavargajaTierFor(g as Graha, p.siderealLong));
      if (aware !== blind) differing++;
    }
    expect(differing).toBeGreaterThan(0);
  });

  it('still completes every component with the compound in place', () => {
    // The point of the exercise: richer inputs must not cost completeness.
    for (const b of BIRTHS) {
      const { result } = fullShadbala(b);
      for (const [graha, r] of Object.entries(result)) {
        expect(r.complete, `${b.name} ${graha}`).toBe(true);
        expect(Number.isNaN(r.total)).toBe(false);
      }
    }
  });
});
