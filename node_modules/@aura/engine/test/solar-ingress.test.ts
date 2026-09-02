// True solar ingresses — the instants the Sun enters a sidereal sign.
//
// These exist to remove a free parameter. BPHS 27.13's varsha and masa lords need a calendar,
// and the Savana route (360-day years counted as an Ahargana from an epoch) needs an **epoch** —
// a choice worth 45 of Kala bala's 150 period-lord virupas, with nothing in the text to pin it.
// The Sun's entry into a sidereal sign is an observable instant, so nothing has to be chosen.
//
// The root finder is therefore load-bearing, and the strongest test of it is self-referential in
// the good sense: whatever instant it returns, the Sun's sidereal longitude AT that instant must
// be the target. That cannot be satisfied by a search that lands in the wrong month.

import { describe, expect, it } from 'vitest';
import {
  siderealSunLongitude, lastSiderealIngress, lastSignIngress, periodLordSources,
} from '../src/astro/solar-ingress.js';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';
import { jdFromDate } from '../src/astro/julian.js';

const ephem = new AstronomiaEphemeris();
const DELHI = { lat: 28.6139, lng: 77.2090 };
const utc = (iso: string) => new Date(iso);

/** Distance from a target longitude, folded to ±180°, in degrees. */
const degFrom = (lon: number, target: number) =>
  Math.abs(((((lon - target) % 360) + 540) % 360) - 180);

describe('the root finder lands exactly on the boundary', () => {
  it('puts the Sun within an arcsecond of the target at every returned instant', () => {
    // 40 bisections of a 6-day bracket resolve to under a millisecond, and the Sun moves
    // ~1°/day, so the residual should be far below an arcsecond. A search that landed in the
    // wrong month would fail this by tens of degrees, not by a rounding.
    for (const iso of ['1990-05-15T01:00:00Z', '2024-11-03T18:00:00Z']) {
      for (const target of [0, 90, 270]) {
        const hit = lastSiderealIngress(utc(iso), target, ephem);
        const lon = siderealSunLongitude(jdFromDate(hit), ephem);
        expect(degFrom(lon, target) * 3600, `${iso} → ${target}°`).toBeLessThan(1);
      }
    }
  });

  it('always returns an instant in the past, within one year', () => {
    const at = utc('1990-05-15T01:00:00Z');
    for (const target of [0, 30, 150, 300]) {
      const hit = lastSiderealIngress(at, target, ephem);
      expect(hit.getTime()).toBeLessThanOrEqual(at.getTime());
      const daysBack = (at.getTime() - hit.getTime()) / 86400000;
      expect(daysBack, `${target}° was ${daysBack.toFixed(1)} days back`).toBeLessThan(366);
    }
  });

  it('finds the ingress of the sign the Sun actually occupies', () => {
    const at = utc('1990-05-15T01:00:00Z');
    const signAtBirth = Math.floor(siderealSunLongitude(jdFromDate(at), ephem) / 30);
    const ingress = lastSignIngress(at, ephem);
    const lonAtIngress = siderealSunLongitude(jdFromDate(ingress), ephem);
    expect(degFrom(lonAtIngress, signAtBirth * 30) * 3600).toBeLessThan(1);
    // And within a solar month — the Sun takes 29 to 32 days to cross a sign, the spread
    // coming from the eccentricity of Earth's orbit.
    const daysBack = (at.getTime() - ingress.getTime()) / 86400000;
    expect(daysBack).toBeGreaterThanOrEqual(0);
    expect(daysBack).toBeLessThan(32);
  });

  it('spaces consecutive ingresses 29 to 32 days apart, unequally', () => {
    // Not 30 each: the Sun moves fastest at perihelion in early January, so the signs it
    // crosses then take under 30 days and the mid-year ones take over 31. A uniform 30 would
    // be a mean-motion model, which is exactly what this avoids needing.
    // Four boundaries spread around the year, which is enough to see the eccentricity: the
    // pair near perihelion is measurably shorter than the pair near aphelion. Every extra
    // boundary costs two full bisections, so the sample is kept to what the claim needs.
    const at = utc('2001-01-01T00:00:00Z');
    const gaps: number[] = [];
    for (const s of [0, 3, 6, 9]) {
      const a = lastSiderealIngress(at, s * 30, ephem);
      const b = lastSiderealIngress(at, (s + 1) * 30, ephem);
      const gap = Math.abs(a.getTime() - b.getTime()) / 86400000;
      gaps.push(gap > 180 ? 365.25 - gap : gap);
    }
    for (const g of gaps) {
      expect(g).toBeGreaterThan(28.5);
      expect(g).toBeLessThan(32.5);
    }
    // They do differ from one another — a constant would mean the true Sun was not being used.
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeGreaterThan(1);
  });
});

describe('the Mesha Sankranti is sidereal, not tropical', () => {
  it('falls in mid-April, not at the March equinox', () => {
    // This is the single clearest check that the ayanamsa is being applied. The TROPICAL Sun
    // reaches 0° at the March equinox; the SIDEREAL Sun reaches it about 24 days later,
    // because the ayanamsa is ~23.9°. Landing in March would mean the ayanamsa was dropped.
    for (const year of [1950, 2000, 2024]) {
      const hit = lastSiderealIngress(utc(`${year}-12-01T00:00:00Z`), 0, ephem);
      expect(hit.getUTCMonth(), `${year}`).toBe(3); // April
      expect(hit.getUTCDate()).toBeGreaterThanOrEqual(12);
      expect(hit.getUTCDate()).toBeLessThanOrEqual(16);
    }
  });

  it('drifts later through the calendar as the ayanamsa grows', () => {
    // Precession moves the sidereal year against the tropical one by ~50″/yr, so the Sankranti
    // slips about a day per 70 years. Over 74 years that is roughly one day, and the direction
    // is what matters: later, never earlier.
    const y1950 = lastSiderealIngress(utc('1950-12-01T00:00:00Z'), 0, ephem);
    const y2024 = lastSiderealIngress(utc('2024-12-01T00:00:00Z'), 0, ephem);
    const dayOfYear = (d: Date) =>
      (d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000;
    expect(dayOfYear(y2024)).toBeGreaterThan(dayOfYear(y1950));
  });
});

describe('the period lords the ingresses supply', () => {
  it('resolves a varsha and a masa lord for an ordinary birth', () => {
    const s = periodLordSources(utc('1990-05-15T01:00:00Z'), DELHI.lat, DELHI.lng, ephem);
    expect(s.varsha).not.toBeNull();
    expect(s.masa).not.toBeNull();
    // Each lord is the weekday of the sunrise that OPENED the day containing its ingress, so
    // that sunrise must precede the ingress rather than follow it.
    expect(s.varshaSunrise!.getTime()).toBeLessThanOrEqual(s.meshaSankranti.getTime());
    expect(s.masaSunrise!.getTime()).toBeLessThanOrEqual(s.signIngress.getTime());
    // And by less than a day — it is the immediately preceding sunrise, not any earlier one.
    expect(s.meshaSankranti.getTime() - s.varshaSunrise!.getTime()).toBeLessThan(86400000);
  });

  it('can give two places different varsha lords for the SAME instant', () => {
    // The ingress is one moment for the whole Earth, but the Vedic day containing it is local.
    // So this is a property of the rule, not a bug — and it is why the birthplace is an
    // argument. Delhi and Los Angeles are ~13.5 hours apart, so an ingress in that window
    // falls on different local days.
    const at = utc('1990-05-15T01:00:00Z');
    const delhi = periodLordSources(at, DELHI.lat, DELHI.lng, ephem);
    const la = periodLordSources(at, 34.0522, -118.2437, ephem);
    expect(delhi.meshaSankranti.getTime()).toBe(la.meshaSankranti.getTime());
    // The instants agree exactly; the sunrises anchoring them need not.
    expect(delhi.varshaSunrise!.getTime()).not.toBe(la.varshaSunrise!.getTime());
  });

  it('withholds a lord whose own anchoring sunrise does not exist', () => {
    // Inside the Arctic circle each lord is withheld exactly when ITS ingress falls in a polar
    // day — independently of the others, because they are anchored to different dates.
    const s = periodLordSources(utc('1990-06-21T12:00:00Z'), 69.6492, 18.9553, ephem);
    // Mid-April at Tromsø: the Sun rises, so the year lord is available.
    expect(s.varsha).not.toBeNull();
    // Mid-June at Tromsø: it does not, so the month lord is not invented.
    expect(s.masa).toBeNull();
  });
});
