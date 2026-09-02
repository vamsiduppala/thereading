// When each planet actually CHANGES something — sign ingresses and retrograde stations,
// dated to the hour, for any planet over any span.
//
// The engine could already say where the sky is on a given day (`computeTransit`) and when the
// SUN last crossed a sidereal boundary (`lastSiderealIngress`). Neither answers the question a
// ten-year narrative is made of: *on what date does Saturn leave this sign, and what does that
// touch in this chart?* Sampling `computeTransit` day by day finds the change to within a day
// and costs 3,650 full-sky evaluations to do it; it also cannot see a station at all.
//
// So: a coarse scan to bracket each crossing, then bisection to pin it. The scan step is chosen
// per planet from its own mean motion, because a step that is safe for Saturn (30° in ~2.5
// years) wastes three orders of magnitude of work on the Moon, and a step safe for the Moon
// would take a week to run over Saturn.
//
// ⚠️ The nodes move BACKWARDS. Rahu and Ketu are permanently retrograde in mean motion, so
// "the sign it is entering" is the one below, not above. Any code here that assumes increasing
// longitude is wrong for two of the nine bodies — which is why nothing below assumes it.

import type { Ephemeris } from '../astro/ephemeris.js';
import type { AyanamsaSystem, Graha } from '../types.js';
import { ayanamsaFor, DEFAULT_AYANAMSA } from '../astro/ayanamsa.js';
import { jdFromDate, dateFromJd, jdToJde } from '../astro/julian.js';

/** Degrees per day, mean. Used only to choose a scan step — never as a position. */
const MEAN_MOTION: Record<Graha, number> = {
  moon: 13.176,
  mercury: 1.383,
  venus: 1.202,
  sun: 0.9856,
  mars: 0.524,
  jupiter: 0.0831,
  saturn: 0.0335,
  rahu: 0.0529,
  ketu: 0.0529,
};

/**
 * Scan step in days: about a third of the time the body needs to cross 30°.
 *
 * A third, not a half, because a retrograde loop can carry a planet back across a boundary and
 * out again inside one step — at a half-step Mercury can cross, turn, and re-cross unseen, and
 * the timeline silently loses a pair of real events.
 */
function stepDays(g: Graha): number {
  const perSign = 30 / MEAN_MOTION[g];
  // A twelfth, capped at five days. The first cut used a third capped at forty, which for
  // Jupiter is a 40-day window — and Jupiter's retrograde re-crossings of a cusp can sit
  // barely two months apart, with the planet nearly stationary between them. A body that
  // enters a sign, backs out and re-enters inside one step is invisible to this scan, and
  // the timeline silently loses two real events. Cheap now that one sample is one series
  // evaluation rather than twenty-seven.
  return Math.max(0.25, Math.min(perSign / 12, 5));
}

export function siderealLongitude(
  jdUT: number, g: Graha, ephem: Ephemeris, ayanamsa: AyanamsaSystem = DEFAULT_AYANAMSA,
): number {
  const jde = jdToJde(jdUT);
  // One body if the ephemeris can do it, all nine if it cannot. Dating a decade of ingresses
  // takes tens of thousands of these; through `tropical` that is 27 series evaluations each,
  // and the scan takes minutes instead of seconds.
  const lon = ephem.longitudeOf ? ephem.longitudeOf(jde, g) : ephem.tropical(jde)[g].lon;
  return ((lon - ayanamsaFor(ayanamsa, jde)) % 360 + 360) % 360;
}

/** Daily motion in longitude, via the single-body path where the ephemeris offers one. */
function speed(jdUT: number, g: Graha, ephem: Ephemeris): number {
  const jde = jdToJde(jdUT);
  return ephem.speedOf ? ephem.speedOf(jde, g) : ephem.tropical(jde)[g].speedLon;
}

export interface Ingress {
  graha: Graha;
  /** The instant of the crossing, to within a few minutes. */
  at: Date;
  /** Sign 0..11 left behind. */
  fromSign: number;
  /** Sign 0..11 entered. */
  toSign: number;
  /** True when the crossing happens while the body is moving backwards. */
  retrograde: boolean;
}

/**
 * Every sidereal sign boundary a planet crosses in `[from, to]`, in date order.
 *
 * Includes crossings made while retrograde, and the re-crossings that follow — a planet near a
 * cusp can genuinely enter, back out and re-enter, and a report that shows only the first
 * would date a multi-month influence to a day it did not hold.
 */
export function signIngresses(
  ephem: Ephemeris, g: Graha, from: Date, to: Date,
  ayanamsa: AyanamsaSystem = DEFAULT_AYANAMSA,
): Ingress[] {
  const out: Ingress[] = [];
  const jd0 = jdFromDate(from);
  const jd1 = jdFromDate(to);
  if (!(jd1 > jd0)) return out;

  const step = stepDays(g);
  const signAt = (jd: number) => Math.floor(siderealLongitude(jd, g, ephem, ayanamsa) / 30);

  let prevJd = jd0;
  let prevSign = signAt(jd0);

  // A hard cap. The Moon crosses a boundary every ~2.25 days, so a ten-year Moon timeline is
  // ~1,600 rows — real, but it is not a thing anyone reads, and the caller should be asking
  // for a shorter span or a slower body.
  const CAP = 2000;

  for (let jd = jd0 + step; jd <= jd1 + step && out.length < CAP; jd += step) {
    const here = Math.min(jd, jd1);
    const sign = signAt(here);
    if (sign !== prevSign) {
      // The bracket the bisection ends on already straddles the crossing: `lo` is in the old
      // sign by invariant, `hi` is not. Reading the two signs off it is exact.
      //
      // The first version instead sampled the sign at `at ± 1e-4` days. That is ±8.6 seconds,
      // and the bisection only converges to a minute — so both samples could land the same
      // side of the true crossing and the event came out as "Aquarius to Aquarius". It did,
      // twice in three years of Jupiter, both times at a retrograde re-crossing where the
      // planet is barely moving. An epsilon that has to beat the tolerance of the search it
      // is reading from is not a technique; the bracket is already the answer.
      const { at, lo, hi } = bisectBoundary(ephem, g, prevJd, here, prevSign, ayanamsa);
      out.push({
        graha: g,
        at: dateFromJd(at),
        fromSign: signAt(lo),
        toSign: signAt(hi),
        // Instantaneous motion at the crossing. A longitude difference across ±half a day
        // is the wrong instrument here: these crossings cluster near stations, which is
        // exactly where a finite difference over a day averages the turn away.
        retrograde: speed(at, g, ephem) < 0,
      });
      prevSign = sign;
    }
    prevJd = here;
    if (here >= jd1) break;
  }
  return out;
}

/**
 * Pin the crossing between two JDs known to sit in different signs.
 *
 * Bisection on "is the sign still the one we started in", not on a longitude difference.
 * Longitude is discontinuous at 0° and a sign boundary sits exactly on that seam once every
 * twelve; testing sign membership has no seam at all.
 */
function bisectBoundary(
  ephem: Ephemeris, g: Graha, lo: number, hi: number, startSign: number,
  ayanamsa: AyanamsaSystem,
): { at: number; lo: number; hi: number } {
  let a = lo;
  let b = hi;
  // 40 halvings takes any starting bracket below a second. The bracket here is at most five
  // days, so this is far more than needed and still cheap.
  for (let i = 0; i < 40 && b - a > 1 / 1440; i++) {
    const mid = (a + b) / 2;
    if (Math.floor(siderealLongitude(mid, g, ephem, ayanamsa) / 30) === startSign) a = mid;
    else b = mid;
  }
  // `a` is still in the starting sign; `b` is not. The caller reads both, so the invariant
  // travels with the answer instead of being re-derived from an epsilon.
  return { at: (a + b) / 2, lo: a, hi: b };
}

export interface Station {
  graha: Graha;
  at: Date;
  /** 'retrograde' — turning backwards; 'direct' — resuming forward motion. */
  kind: 'retrograde' | 'direct';
  /** Sidereal longitude at the turn. */
  longitude: number;
  sign: number;
}

/**
 * The dates a planet turns retrograde or direct in `[from, to]`.
 *
 * The Sun and Moon never do; the nodes are permanently retrograde in mean motion and so never
 * turn either. Asking for any of the four returns an empty list rather than an error, because
 * "this body has no stations" is a true answer to the question.
 */
export function stations(
  ephem: Ephemeris, g: Graha, from: Date, to: Date,
  ayanamsa: AyanamsaSystem = DEFAULT_AYANAMSA,
): Station[] {
  const out: Station[] = [];
  if (g === 'sun' || g === 'moon' || g === 'rahu' || g === 'ketu') return out;

  const jd0 = jdFromDate(from);
  const jd1 = jdFromDate(to);
  if (!(jd1 > jd0)) return out;

  // Two days. The tightest retrograde loop of the five is Mercury's, and that still runs
  // about three weeks — ten samples inside the shortest window there is, with no risk of
  // stepping over one. Half a day, the first choice here, was four times the work for no
  // additional event.
  const step = 2;
  const speedAt = (jd: number) => speed(jd, g, ephem);

  let prevJd = jd0;
  let prev = speedAt(jd0);
  for (let jd = jd0 + step; jd <= jd1; jd += step) {
    const s = speedAt(jd);
    if ((prev >= 0) !== (s >= 0)) {
      let a = prevJd;
      let b = jd;
      for (let i = 0; i < 30 && b - a > 1 / 1440; i++) {
        const mid = (a + b) / 2;
        if ((speedAt(mid) >= 0) === (prev >= 0)) a = mid;
        else b = mid;
      }
      const at = (a + b) / 2;
      const lon = siderealLongitude(at, g, ephem, ayanamsa);
      out.push({
        graha: g,
        at: dateFromJd(at),
        kind: prev >= 0 ? 'retrograde' : 'direct',
        longitude: lon,
        sign: Math.floor(lon / 30),
      });
    }
    prevJd = jd;
    prev = s;
  }
  return out;
}

/**
 * The slow bodies, whose sign changes are the skeleton of a multi-year narrative.
 *
 * Jupiter, Saturn, Rahu and Ketu — roughly one ingress a year, five years and eighteen months
 * respectively. Mars is borderline (six weeks a sign) and is included because its ingresses are
 * what a reader recognises as "something changed"; the inner planets are not, because at twelve
 * or more crossings a year they describe the calendar rather than the life.
 */
export const SLOW_BODIES: Graha[] = ['jupiter', 'saturn', 'rahu', 'ketu', 'mars'];

/** Every ingress of the slow bodies over a span, merged into one date-ordered timeline. */
export function transitTimeline(
  ephem: Ephemeris, from: Date, to: Date,
  bodies: Graha[] = SLOW_BODIES,
  ayanamsa: AyanamsaSystem = DEFAULT_AYANAMSA,
): Ingress[] {
  return bodies
    .flatMap((g) => signIngresses(ephem, g, from, to, ayanamsa))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

export const NODES_MOVE_BACKWARDS =
  'Rahu and Ketu are retrograde in mean motion, so the sign a node ENTERS is the one below the '
  + 'one it leaves. Nothing here derives the destination as `fromSign + 1`; it is read from the '
  + 'sky an instant after the crossing. The same read also survives a step that spans two '
  + 'boundaries, which a derived answer would not.';

export const BISECT_ON_SIGN_NOT_LONGITUDE =
  'The crossing is pinned by bisecting on "which sign is it in", not on a longitude difference. '
  + 'One sign boundary in twelve sits on the 0/360 seam, where a longitude difference flips '
  + 'sign for a reason that has nothing to do with the crossing. Sign membership has no seam.';
