// True solar (Saura) ingresses — the instants the Sun enters a sidereal sign.
//
// **This is what removes the last free parameter from Kala bala.** BPHS 27.13 gives 150 virupas
// to the lords of the year, month, day and hora, and only 105 of them were reachable: the day
// and hora lords come from sunrise, but the year and month lords need a calendar.
//
// The obvious route is the **Savana** one — 360-day years, 30-day months, counted as an
// Ahargana from an epoch. It is arithmetically clean, and the first corpus corroborates the
// 360-day year for exactly this purpose. But it carries a free parameter: **the epoch**. A
// different epoch rotates both lords, so choosing one would have been an unforced decision
// worth 45 virupas — a quarter of the component — with nothing in the text to pin it.
//
// The **Saura** route has no such parameter. The Sun's entry into a sidereal sign is an
// observable instant, so it is computed rather than chosen:
//
//   varsha lord — the weekday of the sunrise preceding the last **Mesha Sankranti** (the Sun's
//                 crossing of sidereal 0°) before birth.
//   masa lord   — the weekday of the sunrise preceding the Sun's entry into the sign it
//                 occupies at birth.
//
// It also sidesteps intercalation entirely: **Adhika Masa is a luni-solar phenomenon**, and the
// solar month has no leap month to insert. Nothing about the Hindu calendar's epoch,
// intercalation rules or mean motions is needed.

import type { Ephemeris } from './ephemeris.js';
import { jdFromDate, dateFromJd, jdToJde } from './julian.js';
import { ayanamsaFor, DEFAULT_AYANAMSA } from './ayanamsa.js';
import type { AyanamsaSystem } from '../types.js';
import { sunriseBefore, WEEKDAY_LORDS, type HoraLord } from './sunrise.js';

const mod360 = (n: number): number => ((n % 360) + 360) % 360;

/** Signed angular distance from `target`, folded to (−180, 180]. */
const signedFrom = (lon: number, target: number): number =>
  ((((lon - target) % 360) + 540) % 360) - 180;

/** The Sun's mean daily motion, used only to seed the search. */
const SUN_DEG_PER_DAY = 0.98561;

/** Sidereal longitude of the Sun at a Julian Day (UT). */
export function siderealSunLongitude(
  jdUT: number, ephem: Ephemeris, ayanamsa: AyanamsaSystem = DEFAULT_AYANAMSA,
): number {
  const jde = jdToJde(jdUT);
  return mod360(ephem.tropical(jde).sun.lon - ayanamsaFor(ayanamsa, jde));
}

/**
 * The instant the Sun **last** crossed a given sidereal longitude, at or before `at`.
 *
 * Bisection rather than Newton. The Sun's motion is smooth and the bracket is easy to establish
 * from its mean rate, so bisection's guaranteed convergence is worth more than Newton's speed —
 * and a derivative estimated by finite difference near a 360° wrap is exactly where Newton
 * misbehaves. 40 halvings of a 6-day bracket resolve to under a millisecond — far finer than the
 * question needs, since the answer is only used to pick a weekday — and each halving costs a
 * full VSOP87 evaluation, so the count is kept to what the precision actually requires.
 *
 * @param targetDeg sidereal longitude to find the crossing of, e.g. 0 for Mesha Sankranti
 */
export function lastSiderealIngress(
  at: Date,
  targetDeg: number,
  ephem: Ephemeris,
  ayanamsa: AyanamsaSystem = DEFAULT_AYANAMSA,
): Date {
  const jdAt = jdFromDate(at);
  const f = (jd: number): number => signedFrom(siderealSunLongitude(jd, ephem, ayanamsa), targetDeg);

  // Seed: how far past the target the Sun already is, at its mean rate.
  const arcPast = mod360(siderealSunLongitude(jdAt, ephem, ayanamsa) - targetDeg);
  let hi = jdAt - arcPast / SUN_DEG_PER_DAY + 3;
  let lo = hi - 6;

  // Widen until the bracket really does straddle the crossing. The seed is good to a couple of
  // days, but the Sun's speed varies by ~3% between perihelion and aphelion, so the ±3-day pad
  // is not unconditionally trusted.
  let guard = 0;
  while (!(f(lo) < 0 && f(hi) >= 0) && guard < 40) {
    lo -= 2;
    hi += 2;
    guard++;
  }
  if (hi > jdAt) hi = jdAt;

  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid;
    else hi = mid;
  }
  return dateFromJd((lo + hi) / 2);
}

/** The Sun's ingress into the sidereal sign it occupies at `at`. */
export function lastSignIngress(
  at: Date, ephem: Ephemeris, ayanamsa: AyanamsaSystem = DEFAULT_AYANAMSA,
): Date {
  const sign = Math.floor(siderealSunLongitude(jdFromDate(at), ephem, ayanamsa) / 30);
  return lastSiderealIngress(at, sign * 30, ephem, ayanamsa);
}

export interface PeriodLordSources {
  /** The Mesha Sankranti — the Sun's last crossing of sidereal 0° before birth. */
  meshaSankranti: Date;
  /** The Sun's entry into the sidereal sign it occupies at birth. */
  signIngress: Date;
  /** Sunrise opening the Vedic day that contained each ingress. */
  varshaSunrise: Date | null;
  masaSunrise: Date | null;
  varsha: HoraLord | null;
  masa: HoraLord | null;
}

/**
 * The varsha and masa lords, from true solar ingresses (27.13).
 *
 * ⚠️ **The ingress is a global instant; the sunrise is local.** The Sun enters Aries at one
 * moment for the whole Earth, but which Vedic day that moment falls in depends on where the
 * chart is cast — so two births at the same instant in Delhi and Los Angeles can legitimately
 * take different varsha lords. That is a property of the rule, not a bug, and it is why the
 * birth's own latitude and longitude are passed here rather than the ingress being resolved to
 * a weekday globally.
 */
export function periodLordSources(
  at: Date,
  lat: number,
  lngEast: number,
  ephem: Ephemeris,
  ayanamsa: AyanamsaSystem = DEFAULT_AYANAMSA,
): PeriodLordSources {
  const meshaSankranti = lastSiderealIngress(at, 0, ephem, ayanamsa);
  const signIngress = lastSignIngress(at, ephem, ayanamsa);
  const varshaSunrise = sunriseBefore(meshaSankranti, lat, lngEast);
  const masaSunrise = sunriseBefore(signIngress, lat, lngEast);
  return {
    meshaSankranti,
    signIngress,
    varshaSunrise,
    masaSunrise,
    varsha: varshaSunrise ? WEEKDAY_LORDS[varshaSunrise.getUTCDay()]! : null,
    masa: masaSunrise ? WEEKDAY_LORDS[masaSunrise.getUTCDay()]! : null,
  };
}

export const SAURA_NEEDS_NO_EPOCH =
  'The year and month lords are anchored to TRUE SOLAR ingresses, not to a Savana day count '
  + 'from an epoch. The Savana route is arithmetically sound and the first corpus corroborates '
  + 'its 360-day year for this exact purpose, but it needs an EPOCH, and a different epoch '
  + 'rotates both lords — 45 of Kala bala’s 150 period-lord virupas. The Sun’s entry into a '
  + 'sidereal sign is an observable instant, so nothing has to be chosen. It also removes any '
  + 'need for intercalation logic: Adhika Masa is a LUNI-SOLAR phenomenon and the solar month '
  + 'has no leap month.';

export const INGRESS_IS_GLOBAL_SUNRISE_IS_LOCAL =
  'The Sun enters a sidereal sign at ONE instant for the whole Earth, but the sunrise that '
  + 'opens the Vedic day containing it is local. Two charts cast for the same instant in Delhi '
  + 'and Los Angeles can therefore take different varsha lords. That follows from the rule — the '
  + 'weekday is a property of the local day — and is why the birthplace is an argument here.';
