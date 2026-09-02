// ─────────────────────────────────────────────────────────────────────────────
// Ephemeris (Tier 0). Pluggable interface so the astronomy backend can be swapped
// (astronomia/Moshier now; Swiss Ephemeris later) without touching chart/dasha.
// Returns TROPICAL apparent ecliptic longitudes of date (degrees). The chart layer
// applies the Lahiri ayanamsa to sidereal-ize.
// ─────────────────────────────────────────────────────────────────────────────

/// <reference path="./astronomia.d.ts" />
// ^ makes the astronomia type shim ambient for any consumer (e.g. apps/web) whose
//   tsconfig `include` doesn't glob the engine's src directory.

import {
  solar, moonposition, planetposition, elliptic, coord, nutation,
} from 'astronomia';
import earthData from 'astronomia/data/vsop87Bearth';
import marsData from 'astronomia/data/vsop87Bmars';
import mercuryData from 'astronomia/data/vsop87Bmercury';
import jupiterData from 'astronomia/data/vsop87Bjupiter';
import venusData from 'astronomia/data/vsop87Bvenus';
import saturnData from 'astronomia/data/vsop87Bsaturn';
import { norm360, RAD } from './angles.js';
import type { Graha } from '../types.js';
import { GRAHAS } from '../constants.js';

export interface EphemerisSample {
  /** Tropical apparent ecliptic longitude of date, degrees [0,360). */
  lon: number;
  /** Ecliptic latitude, degrees. */
  lat: number;
  /** Daily motion in longitude, degrees/day (negative = retrograde). */
  speedLon: number;
  retrograde: boolean;
}

export interface Ephemeris {
  /** Tropical apparent positions of all 9 grahas at the given JDE (TT). */
  tropical(jde: number): Record<Graha, EphemerisSample>;
  /**
   * Tropical longitude of ONE graha (deg) — optional fast path.
   *
   * `tropical` evaluates nine bodies and, for each, a second position half a day later to get
   * a speed: 27 VSOP/ELP series per call. A scan that wants one planet's longitude at ten
   * thousand instants — which is what dating a decade of sign ingresses is — pays 27x for
   * data it discards. Implementations that can answer for a single body should; callers must
   * fall back to `tropical` when this is absent, so no implementation is obliged to have it.
   */
  longitudeOf?(jde: number, graha: Graha): number;
  /** Daily motion in longitude of ONE graha (deg/day) — optional fast path, as above. */
  speedOf?(jde: number, graha: Graha): number;
}

/** True obliquity of date (radians). */
function trueObliquity(jde: number): number {
  return nutation.meanObliquity(jde) + nutation.nutation(jde)[1];
}

export class AstronomiaEphemeris implements Ephemeris {
  private readonly earth = new planetposition.Planet(earthData);
  private readonly planets: Partial<Record<Graha, planetposition.Planet>> = {
    mars: new planetposition.Planet(marsData),
    mercury: new planetposition.Planet(mercuryData),
    jupiter: new planetposition.Planet(jupiterData),
    venus: new planetposition.Planet(venusData),
    saturn: new planetposition.Planet(saturnData),
  };

  /** Tropical geocentric ecliptic longitude of one graha (deg). */
  private lonOf(graha: Graha, jde: number): number {
    switch (graha) {
      case 'sun':
        return norm360(solar.apparentVSOP87(this.earth, jde).lon * RAD);
      case 'moon':
        return norm360(moonposition.position(jde).lon * RAD);
      case 'rahu':
        return norm360(moonposition.trueNode(jde) * RAD);
      case 'ketu':
        return norm360(moonposition.trueNode(jde) * RAD + 180);
      default: {
        const planet = this.planets[graha]!;
        const eq = elliptic.position(planet, this.earth, jde);
        const ecl = new coord.Equatorial(eq.ra, eq.dec).toEcliptic(trueObliquity(jde));
        return norm360(ecl.lon * RAD);
      }
    }
  }

  private latOf(graha: Graha, jde: number): number {
    switch (graha) {
      case 'sun': return solar.apparentVSOP87(this.earth, jde).lat * RAD;
      case 'moon': return moonposition.position(jde).lat * RAD;
      case 'rahu':
      case 'ketu': return 0;
      default: {
        const planet = this.planets[graha]!;
        const eq = elliptic.position(planet, this.earth, jde);
        return new coord.Equatorial(eq.ra, eq.dec).toEcliptic(trueObliquity(jde)).lat * RAD;
      }
    }
  }

  /** See `Ephemeris.longitudeOf` — one body, one series evaluation. */
  longitudeOf(jde: number, graha: Graha): number {
    return this.lonOf(graha, jde);
  }

  /** See `Ephemeris.speedOf`. Same half-day finite difference `tropical` uses. */
  speedOf(jde: number, graha: Graha): number {
    const h = 0.5;
    let d = this.lonOf(graha, jde + h) - this.lonOf(graha, jde);
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d / h;
  }

  tropical(jde: number): Record<Graha, EphemerisSample> {
    const h = 0.5; // half-day step for finite-difference speed
    const out = {} as Record<Graha, EphemerisSample>;
    for (const g of GRAHAS) {
      const lon = this.lonOf(g, jde);
      const lonNext = this.lonOf(g, jde + h);
      // shortest signed delta across the 0/360 seam
      let d = lonNext - lon;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      const speedLon = d / h;
      out[g] = {
        lon,
        lat: this.latOf(g, jde),
        speedLon,
        // Nodes are conventionally retrograde; otherwise use measured motion.
        retrograde: g === 'rahu' || g === 'ketu' ? true : speedLon < 0,
      };
    }
    return out;
  }
}

/**
 * Deterministic ephemeris from fixed tropical longitudes — for unit-testing the
 * chart/lattice layers independent of the astronomy backend.
 */
export class FixedEphemeris implements Ephemeris {
  constructor(private readonly lons: Record<Graha, number>) {}
  tropical(): Record<Graha, EphemerisSample> {
    const out = {} as Record<Graha, EphemerisSample>;
    for (const g of GRAHAS) {
      out[g] = {
        lon: norm360(this.lons[g]),
        lat: 0,
        speedLon: g === 'rahu' || g === 'ketu' ? -0.05 : 0.5,
        retrograde: g === 'rahu' || g === 'ketu',
      };
    }
    return out;
  }
}
