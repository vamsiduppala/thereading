// Sign ingresses and stations, checked the only way that is worth anything: against a
// completely independent path through the same sky.
//
// `computeTransit` has been in the engine since Tier 2 and derives a planet's sign directly
// from its longitude on a date. `signIngresses` derives the same fact a different way — by
// bracketing a boundary and bisecting it. If the two agree on every day of a decade, the
// bisection is finding real crossings; if they disagree anywhere, one of them is wrong and the
// disagreement says where to look.
//
// That cross-check is the backbone of this file. The rest pins the two things most likely to
// be got wrong by someone editing it later, both of which were live hazards while writing it:
//
//   1. the nodes move BACKWARDS, so the destination sign is not `fromSign + 1`, and
//   2. a planet near a cusp can cross, turn retrograde, and cross back — three real events
//      that a scan with too coarse a step reports as one, or as none.

import { describe, expect, it } from 'vitest';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';
import {
  signIngresses, stations, transitTimeline, siderealLongitude, SLOW_BODIES,
} from '../src/transit/ingress.js';
import { computeTransit } from '../src/transit/gochara.js';
import { computeChart } from '../src/chart/chart.js';

const ephem = new AstronomiaEphemeris();
const BIRTH = {
  date: '1990-05-15', time: '06:30', unknownTime: false, place: 'Hyderabad',
  lat: 17.385, lng: 78.4867, tzOffsetMinutes: 330,
};
const chart = computeChart(BIRTH, ephem);

const FROM = new Date('2021-01-01T00:00:00Z');
const TO = new Date('2031-01-01T00:00:00Z');

describe('an ingress is a real crossing', () => {
  it('shows the stated signs on either side of the stated instant', () => {
    for (const g of SLOW_BODIES) {
      for (const ing of signIngresses(ephem, g, FROM, TO)) {
        const jd = 2440587.5 + ing.at.getTime() / 86400000;
        const before = Math.floor(siderealLongitude(jd - 0.01, g, ephem) / 30);
        const after = Math.floor(siderealLongitude(jd + 0.01, g, ephem) / 30);
        const when = `${g} ${ing.at.toISOString().slice(0, 10)}`;
        expect(before, when).toBe(ing.fromSign);
        expect(after, when).toBe(ing.toSign);
      }
    }
  });

  it('never reports a crossing into the sign it just left', () => {
    for (const g of SLOW_BODIES) {
      for (const ing of signIngresses(ephem, g, FROM, TO)) {
        expect(ing.toSign, `${g} ${ing.at.toISOString()}`).not.toBe(ing.fromSign);
      }
    }
  });

  it('returns them in date order, inside the range asked for', () => {
    const t = transitTimeline(ephem, FROM, TO);
    expect(t.length).toBeGreaterThan(20);
    for (let i = 1; i < t.length; i++) {
      expect(t[i]!.at.getTime()).toBeGreaterThanOrEqual(t[i - 1]!.at.getTime());
    }
    for (const ing of t) {
      expect(ing.at.getTime()).toBeGreaterThanOrEqual(FROM.getTime());
      expect(ing.at.getTime()).toBeLessThanOrEqual(TO.getTime());
    }
  });
});

describe('the nodes move backwards', () => {
  it('sends Rahu and Ketu into the sign BELOW the one they leave', () => {
    // The hazard this pins: deriving the destination as `fromSign + 1`, which is right for
    // seven bodies and wrong for two. Mean nodal motion is retrograde throughout.
    for (const g of ['rahu', 'ketu'] as const) {
      const ings = signIngresses(ephem, g, FROM, TO);
      expect(ings.length, g).toBeGreaterThan(3);
      for (const ing of ings) {
        expect(ing.toSign, `${g} ${ing.at.toISOString().slice(0, 10)}`)
          .toBe((ing.fromSign + 11) % 12);
        expect(ing.retrograde, g).toBe(true);
      }
    }
  });

  it('keeps Rahu and Ketu exactly opposite at every crossing', () => {
    const rahu = signIngresses(ephem, 'rahu', FROM, TO);
    const ketu = signIngresses(ephem, 'ketu', FROM, TO);
    expect(rahu.length).toBe(ketu.length);
    for (let i = 0; i < rahu.length; i++) {
      expect(Math.abs(rahu[i]!.at.getTime() - ketu[i]!.at.getTime())).toBeLessThan(60_000);
      expect(ketu[i]!.toSign).toBe((rahu[i]!.toSign + 6) % 12);
    }
  });
});

describe('agrees with computeTransit — an independent path to the same fact', () => {
  it('the running sign from the ingress list matches the sky, every 15 days for a decade', () => {
    // The strongest check available: `computeTransit` derives the sign straight from the
    // longitude, `signIngresses` derives it by bracketing and bisecting a boundary. They share
    // an ephemeris and nothing else.
    for (const g of ['jupiter', 'saturn', 'rahu', 'mars'] as const) {
      const ings = signIngresses(ephem, g, FROM, TO);
      let checked = 0;
      for (let t = FROM.getTime(); t < TO.getTime(); t += 15 * 86400000) {
        const at = new Date(t);
        const expected = computeTransit(chart, at, ephem).signs[g];
        // The sign in force is the destination of the last ingress at or before `at`;
        // before the first, it is the sign that first ingress left.
        const past = ings.filter((i) => i.at.getTime() <= t);
        const running = past.length ? past[past.length - 1]!.toSign
          : (ings[0]?.fromSign ?? expected);
        expect(running, `${g} on ${at.toISOString().slice(0, 10)}`).toBe(expected);
        checked++;
      }
      expect(checked).toBeGreaterThan(200);
    }
  });
});

describe('stations', () => {
  it('finds none for the four bodies that never turn', () => {
    for (const g of ['sun', 'moon', 'rahu', 'ketu'] as const) {
      expect(stations(ephem, g, FROM, TO), g).toEqual([]);
    }
  });

  it('alternates retrograde and direct, never twice the same', () => {
    for (const g of ['mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const) {
      const st = stations(ephem, g, FROM, TO);
      expect(st.length, g).toBeGreaterThan(1);
      for (let i = 1; i < st.length; i++) {
        expect(st[i]!.kind, `${g} ${st[i]!.at.toISOString().slice(0, 10)}`)
          .not.toBe(st[i - 1]!.kind);
      }
    }
  });

  it('actually turns the motion at each station', () => {
    for (const g of ['mercury', 'mars', 'saturn'] as const) {
      for (const s of stations(ephem, g, FROM, TO)) {
        const jd = 2440587.5 + s.at.getTime() / 86400000;
        const before = siderealLongitude(jd, g, ephem) - siderealLongitude(jd - 1, g, ephem);
        const after = siderealLongitude(jd + 1, g, ephem) - siderealLongitude(jd, g, ephem);
        const norm = (d: number) => (d > 180 ? d - 360 : d < -180 ? d + 360 : d);
        const when = `${g} ${s.at.toISOString().slice(0, 10)} ${s.kind}`;
        if (s.kind === 'retrograde') {
          expect(norm(before), when).toBeGreaterThan(0);
          expect(norm(after), when).toBeLessThan(0);
        } else {
          expect(norm(before), when).toBeLessThan(0);
          expect(norm(after), when).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gives Mercury roughly three retrograde turns a year', () => {
    // The one rate here that is common knowledge rather than an artefact of our own code,
    // so it is worth asserting as an outside check: Mercury retrogrades 3-4 times a year.
    const retro = stations(ephem, 'mercury', FROM, TO).filter((s) => s.kind === 'retrograde');
    expect(retro.length).toBeGreaterThanOrEqual(28);
    expect(retro.length).toBeLessThanOrEqual(42);
  });
});

describe('rates match the bodies', () => {
  it('matches the sidereal periods once re-crossings are counted properly', () => {
    // The outside fact is the sidereal period: Jupiter ~11.86 years, Saturn ~29.4. Over a
    // decade that is ~10 and ~4 signs of NET travel.
    //
    // The raw ingress count is higher, and correctly so. Every sign change that falls near a
    // retrograde loop happens three times — in, back out, in again — and Jupiter, retrograde
    // about four months a year, catches a lot of them. Counting the raw crossings and
    // expecting ~10 is what this test did at first; the run said 22, and checking three years
    // by hand against a 5-day sample of the sky showed all of them were real.
    //
    // So the assertion is on NET travel, which is what the period actually predicts, with a
    // loose bound on the raw count to catch a scan that has started inventing events.
    const net = (g: 'jupiter' | 'saturn') => {
      const ings = signIngresses(ephem, g, FROM, TO);
      const first = ings[0]!.fromSign;
      const last = ings[ings.length - 1]!.toSign;
      return { count: ings.length, net: ((last - first) % 12 + 12) % 12 };
    };

    const jup = net('jupiter');
    expect(jup.net).toBeGreaterThanOrEqual(9);
    expect(jup.net).toBeLessThanOrEqual(11);
    expect(jup.count).toBeGreaterThanOrEqual(jup.net);
    expect(jup.count).toBeLessThanOrEqual(3 * jup.net);

    const sat = net('saturn');
    expect(sat.net).toBeGreaterThanOrEqual(3);
    expect(sat.net).toBeLessThanOrEqual(5);
    expect(sat.count).toBeGreaterThanOrEqual(sat.net);
    expect(sat.count).toBeLessThanOrEqual(3 * sat.net);
  });

  it('reports every crossing with two different signs', () => {
    // The bug this pins cost a real debugging round. The crossing instant was found by
    // bisection to within a minute, then the signs on either side were read at ±8.6 seconds
    // around it — so both samples could land the same side, and the event came out as
    // "Aquarius to Aquarius". Jupiter did it twice in three years, both times at a retrograde
    // re-crossing where the planet is nearly stationary. The bracket the bisection already
    // holds is the answer; an epsilon that must beat the search's own tolerance is not.
    for (const g of SLOW_BODIES) {
      for (const ing of signIngresses(ephem, g, FROM, TO)) {
        expect(ing.fromSign, `${g} ${ing.at.toISOString().slice(0, 10)}`).not.toBe(ing.toSign);
      }
    }
  });

  it('is deterministic', () => {
    const a = transitTimeline(ephem, FROM, TO);
    const b = transitTimeline(ephem, FROM, TO);
    expect(a.map((x) => `${x.graha}:${x.at.toISOString()}`))
      .toEqual(b.map((x) => `${x.graha}:${x.at.toISOString()}`));
  });
});
