// The engine's planetary longitudes, against NASA/JPL Horizons (DE441).
//
// **Nothing validated these before.** `vectors.json` is a dasha-boundary regression ratchet and
// says so in its own header. But every sign, house, nakshatra, varga and dasha in the system
// derives from these longitudes, so an error here is invisible and total — it would move every
// reading consistently, which is exactly the kind of error no internal test can see.
//
// The fixture is committed rather than fetched. The app is offline-first, so nothing may call
// an external service at runtime; these rows were pulled once and now check the engine forever.
//
// ⚠️ **This validates the VSOP87 chain only.** The rows are TROPICAL, and so is what the
// ephemeris returns. The **Lahiri ayanamsa is a separate axis and is not tested here** — a
// wrong ayanamsa shifts every position identically, and a tropical comparison is blind to it.

import { describe, expect, it } from 'vitest';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';
import type { Graha } from '../src/types.js';
import ref from '../../vectors/horizons-positions.json' with { type: 'json' };

interface Row { utc: string; eclipticLongitude: number; eclipticLatitude: number }
interface Body { graha: string; horizonsId: string; rows: Row[] }
const fixture = ref as unknown as { positions: Body[] };

const JD_UNIX_EPOCH = 2440587.5;
const toJd = (iso: string) => JD_UNIX_EPOCH + new Date(iso).getTime() / 86400000;

/** Signed separation in arcseconds, folded to ±180° so a wrap does not read as a huge error. */
const arcsecApart = (a: number, b: number) =>
  Math.abs((((a - b + 180) % 360) + 360) % 360 - 180) * 3600;

/**
 * Per-body tolerance, in arcseconds.
 *
 * These are set just above what the engine actually achieves, so a real regression trips them
 * while ordinary floating-point noise does not. The Moon's is an order of magnitude looser
 * because its measured error genuinely is — see `the Moon is the outlier` below.
 */
const TOLERANCE_ARCSEC: Record<string, number> = {
  sun: 10, mercury: 10, venus: 10, mars: 10, jupiter: 5, saturn: 5, moon: 90,
};

describe('engine longitudes vs NASA/JPL Horizons', () => {
  const ephem = new AstronomiaEphemeris();

  it('agrees with JPL on every body at every epoch', () => {
    let checked = 0;
    for (const body of fixture.positions) {
      const tol = TOLERANCE_ARCSEC[body.graha]!;
      for (const row of body.rows) {
        const got = ephem.tropical(toJd(row.utc))[body.graha as Graha];
        const off = arcsecApart(got.lon, row.eclipticLongitude);
        expect(off, `${body.graha} @ ${row.utc}: ${off.toFixed(1)}" off JPL`).toBeLessThan(tol);
        checked++;
      }
    }
    expect(checked).toBe(35);
  });

  it('holds the outer planets to a fraction of an arcsecond', () => {
    // Jupiter and Saturn are the least forgiving check on the VSOP87 series, because their
    // slow motion means an error stays put rather than averaging out.
    for (const body of fixture.positions.filter((b) => ['jupiter', 'saturn'].includes(b.graha))) {
      for (const row of body.rows) {
        const got = ephem.tropical(toJd(row.utc))[body.graha as Graha];
        expect(arcsecApart(got.lon, row.eclipticLongitude), `${body.graha} @ ${row.utc}`)
          .toBeLessThan(2);
      }
    }
  });

  it('the Moon is the outlier, and it is bounded where it matters', () => {
    // Measured at up to ~53" — an order of magnitude worse than any planet, and it is the one
    // longitude that sets the Vimshottari balance at birth.
    //
    // The scale that matters is not the arcsecond but the birth time. The Moon moves ~13°/day,
    // so 53" is about **1.6 minutes** of birth time — smaller than the uncertainty in almost
    // any recorded birth time, and far smaller than the ±15 minutes the app already models.
    // Against a nakshatra of 13°20' it is 0.11%, which at the top of a 20-year mahadasha is
    // roughly a week.
    //
    // So it is acceptable, and it is bounded here so that a future regression cannot quietly
    // make it worse.
    const moon = fixture.positions.find((b) => b.graha === 'moon')!;
    let worst = 0;
    for (const row of moon.rows) {
      worst = Math.max(worst, arcsecApart(ephem.tropical(toJd(row.utc)).moon.lon,
        row.eclipticLongitude));
    }
    expect(worst).toBeLessThan(90);
    // Expressed as birth-time equivalent: 13.176°/day of lunar motion.
    const minutesOfBirthTime = (worst / 3600) / 13.176 * 24 * 60;
    expect(minutesOfBirthTime).toBeLessThan(5);
  });

  it('every planet but the Moon is well inside a single arcminute', () => {
    for (const body of fixture.positions.filter((b) => b.graha !== 'moon')) {
      for (const row of body.rows) {
        const got = ephem.tropical(toJd(row.utc))[body.graha as Graha];
        expect(arcsecApart(got.lon, row.eclipticLongitude), `${body.graha} @ ${row.utc}`)
          .toBeLessThan(60);
      }
    }
  });
});
