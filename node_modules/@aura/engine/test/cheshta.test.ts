// Cheshta bala's inputs, and the one measurement that proves them right.
//
// The śīghrocha — the apex the motional kendra is measured from — is **not the same quantity
// for both groups of planets**:
//
//   Mars, Jupiter, Saturn (superior)   śīghrocha = the SUN's mean longitude
//   Mercury, Venus (inferior)          śīghrocha = the PLANET's own mean heliocentric longitude
//
// with the madhyama taking the other role in each case. The assignment is *swapped* between the
// groups, and swapping it back inverts the result rather than merely perturbing it. That is
// exactly the kind of claim that should not rest on authority, so it does not:
//
// **A retrograde planet must score near-maximum motional strength.** Superior planets retrograde
// near opposition, where the Sun's mean longitude is ~180° away; inferior planets retrograde at
// inferior conjunction, where they lie between Earth and Sun and their heliocentric longitude is
// ~180° from the Sun's geocentric one. Both give a kendra near 180° and a bala near 60 — but
// only under the assignment above. Reverse it and retrograde planets would score near zero.
//
// So the test samples eleven years of real motion and measures it.

import { describe, expect, it } from 'vitest';
import { cheshtaInputs, cheshtaInput, meanSunLongitude, SUPERIOR, INFERIOR } from '../src/astro/cheshta.js';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';
import { jdToJde } from '../src/astro/julian.js';
import type { Graha } from '../src/types.js';

const ephem = new AstronomiaEphemeris();
const TARA: Graha[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** `cheshtaBalaTara` from the knowledge package, reproduced here — see the note below. */
const foldTo180 = (a: number) => {
  const x = ((a % 360) + 360) % 360;
  return x > 180 ? 360 - x : x;
};
// The engine may not import @aura/knowledge (the packages are deliberately independent), so
// 27.24-25's arithmetic is restated here. The cross-package agreement is asserted in
// apps/api/test/shadbala-complete.test.ts, which can see both.
const cheshtaBala = (mean: number, tru: number, seeghrocha: number) =>
  foldTo180(seeghrocha - (mean + tru) / 2) / 3;

interface Sample { retro: boolean; bala: number }

/**
 * Eleven years at eight-day steps — enough to catch several retrograde loops of every planet
 * (Saturn alone retrogrades for about four and a half months a year).
 *
 * All five planets share each date. `ephem.tropical()` computes all nine grahas per call, so
 * sampling per-planet would repeat that work five times over for no extra information. The
 * one-day companion call is kept rather than differencing consecutive samples: an eight-day
 * difference would misclassify a planet sitting at a station, and the minimum-retrograde
 * assertions below are precisely about what happens near one.
 */
function sampleAll(): Map<Graha, Sample[]> {
  const out = new Map<Graha, Sample[]>(TARA.map((g) => [g, [] as Sample[]]));
  for (let d = 0; d < 4000; d += 8) {
    const jd = 2451545.0 + d;
    const jde = jdToJde(jd);
    const now = ephem.tropical(jde);
    const next = ephem.tropical(jdToJde(jd + 1));
    const ci = cheshtaInputs(jde);
    for (const g of TARA) {
      const speed = ((next[g].lon - now[g].lon + 540) % 360) - 180;
      const c = ci[g]!;
      out.get(g)!.push({
        retro: speed < 0,
        bala: cheshtaBala(c.meanLongitude, now[g].lon, c.seeghrocha),
      });
    }
  }
  return out;
}

const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;

describe('retrogression scores high — for both groups', () => {
  const samples = sampleAll();
  const measured = new Map<Graha, { retro: number[]; direct: number[] }>();
  for (const g of TARA) {
    const s = samples.get(g)!;
    measured.set(g, {
      retro: s.filter((x) => x.retro).map((x) => x.bala),
      direct: s.filter((x) => !x.retro).map((x) => x.bala),
    });
  }

  it('gives every planet more than twice the strength when retrograde', () => {
    // Measured ratios are 2.2× to 2.6×. This is the assertion that pins the śīghrocha
    // assignment: a swap would push the ratio well below 1 for the affected group.
    for (const g of TARA) {
      const m = measured.get(g)!;
      const ratio = mean(m.retro) / mean(m.direct);
      expect(ratio, `${g}: retro ${mean(m.retro).toFixed(1)} vs direct ${mean(m.direct).toFixed(1)}`)
        .toBeGreaterThan(2);
    }
  });

  it('holds for the SUPERIOR planets, whose śīghrocha is the Sun', () => {
    for (const g of SUPERIOR) {
      const m = measured.get(g)!;
      expect(mean(m.retro), `${g}`).toBeGreaterThan(45);
      expect(mean(m.direct), `${g}`).toBeLessThan(25);
    }
  });

  it('holds for the INFERIOR planets, whose śīghrocha is their own mean longitude', () => {
    // The important half. Mercury and Venus take the OPPOSITE assignment to Mars, Jupiter and
    // Saturn, so if the two groups had been treated alike, exactly one of these two tests
    // would fail while the other passed.
    for (const g of INFERIOR) {
      const m = measured.get(g)!;
      expect(mean(m.retro), `${g}`).toBeGreaterThan(45);
      expect(mean(m.direct), `${g}`).toBeLessThan(25);
    }
  });

  it('separates Mars and Saturn almost completely', () => {
    // The slow superior planets have long, clean retrograde arcs, so their weakest retrograde
    // moment is close to their strongest direct one. Mercury's and Jupiter's minima are lower
    // because their stations are sampled — a planet at a station is retrograde by a hair.
    for (const g of ['mars', 'saturn'] as Graha[]) {
      const m = measured.get(g)!;
      expect(Math.min(...m.retro), `${g} weakest retrograde`).toBeGreaterThan(35);
    }
  });

  it('stays inside 0-60 virupas everywhere, as a folded arc must', () => {
    for (const g of TARA) {
      const m = measured.get(g)!;
      for (const v of [...m.retro, ...m.direct]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(60);
      }
    }
  });
});

describe('the inputs themselves', () => {
  it('swaps madhyama and śīghrocha between the two groups', () => {
    const jde = jdToJde(2451545.0);
    const sun = meanSunLongitude(jde);
    // A superior planet takes the Sun as its apex …
    expect(cheshtaInput('mars', jde)!.seeghrocha).toBeCloseTo(sun, 9);
    expect(cheshtaInput('mars', jde)!.meanLongitude).not.toBeCloseTo(sun, 3);
    // … an inferior planet takes the Sun as its MEAN instead.
    expect(cheshtaInput('venus', jde)!.meanLongitude).toBeCloseTo(sun, 9);
    expect(cheshtaInput('venus', jde)!.seeghrocha).not.toBeCloseTo(sun, 3);
  });

  it('returns nothing for the luminaries and the nodes', () => {
    const jde = jdToJde(2451545.0);
    // 27.18 gives the Sun's Cheshta bala as its Ayana bala and the Moon's as its Paksha bala.
    // Chapter 27 gives the nodes no Shadbala at all. A number here would be an invention.
    for (const g of ['sun', 'moon', 'rahu', 'ketu'] as Graha[]) {
      expect(cheshtaInput(g, jde), g).toBeNull();
    }
    expect(Object.keys(cheshtaInputs(jde)).sort()).toEqual(
      ['jupiter', 'mars', 'mercury', 'saturn', 'venus'],
    );
  });

  it('puts the mean Sun within a degree of the true Sun', () => {
    // They differ by the equation of centre — up to ~1.9° at the extremes, near zero at the
    // apsides. Checking they are CLOSE but NOT equal confirms the mean Sun is genuinely mean:
    // returning the apparent Sun here would collapse part of what 27.24-25 measures.
    const jde = jdToJde(2451545.0);
    const trueSun = ephem.tropical(jde).sun.lon;
    const diff = Math.abs(((meanSunLongitude(jde) - trueSun + 540) % 360) - 180);
    expect(diff).toBeLessThan(2.5);
    expect(diff).toBeGreaterThan(0.001);
  });
});
