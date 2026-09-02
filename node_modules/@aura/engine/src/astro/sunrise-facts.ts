// The bridge: a birth moment → every sunrise-derived input the knowledge package wanted.
//
// `sunrise.ts` computes the astronomy. This assembles it into the exact shapes the encoded
// BPHS rules take, so a caller never has to know that four unrelated chapters all secretly
// depend on the same two instants.
//
// **Why this file is the unlock.** These rules were all encoded, tested and marked available,
// and all of them were unreachable, because each took a sunrise-derived argument from a caller
// with no way to obtain it:
//
//   ch 5.2-8   bhavaLagnaBphs / horaLagnaBphs / ghatikaLagnaBphs  ← sunLongAtSunrise, minutes
//   ch 3.66    pranaPada                                          ← vighatis since sunrise
//   ch 46      selectDashaSystem                                  ← lagnaHora, birth day/night
//   ch 27.12   tribhagaBala                                       ← third of day/night
//   ch 27.8-9  nathonnathaBala                                    ← ghatis from midnight
//   ch 27.13   varshaMasaDinaHoraBala                             ← dina and hora lords
//
// ⚠️ **`sunLongAtSunrise` is SIDEREAL here.** The three special lagnas are compared against
// signs, and every sign in this engine is sidereal, so feeding them a tropical longitude would
// put all three roughly a sign out — a silent error, since the result still looks like a valid
// lagna. The tropical value is returned alongside because Ayana bala genuinely wants that one
// (27.15-17 says to add the ayanamsa before taking the Bhuja), and having both named
// explicitly is what stops the wrong one being picked.

import type { Ephemeris } from './ephemeris.js';
import { jdFromDate, jdToJde } from './julian.js';
import { ayanamsaFor, DEFAULT_AYANAMSA } from './ayanamsa.js';
import type { AyanamsaSystem } from '../types.js';
import {
  sunTimes, isDayBirth, minutesSinceSunrise, ghatisFromMidnight, tribhagaThird,
  horaLord, WEEKDAY_LORDS, type HoraLord,
} from './sunrise.js';
import { periodLordSources } from './solar-ingress.js';

const mod360 = (n: number): number => ((n % 360) + 360) % 360;

export interface SunriseFacts {
  /** UTC instant of the sunrise that opens this Vedic day. `null` inside a polar day/night. */
  sunrise: Date | null;
  sunset: Date | null;

  /** SIDEREAL longitude of the Sun at that sunrise — what the three special lagnas take. */
  sunLongAtSunrise: number | null;
  /** TROPICAL longitude of the same instant — what Ayana bala takes (27.15-17). */
  sunLongAtSunriseTropical: number | null;

  minutesSinceSunrise: number | null;
  /** The same span in vighatis (24 seconds each) — prana pada's unit (3.66). */
  vighatisSinceSunrise: number | null;

  /** `'day'` when the Sun is above the horizon. `selectDashaSystem`'s `birth`. */
  birth: 'day' | 'night' | null;
  /** Which third of the day or night — Tribhaga bala (27.12). */
  tribhaga: { third: 0 | 1 | 2; isDay: boolean } | null;
  /** Ghatis from midnight, 0-60 — Nathonnatha bala (27.8-9). */
  ghatisFromMidnight: number;

  /** Lord of the planetary hour (27.13's `hora`, and `selectDashaSystem`'s `lagnaHora`). */
  horaLord: HoraLord | null;
  /** The same, narrowed to the luminaries — `selectDashaSystem` asks only about those. */
  lagnaHora: 'sun' | 'moon' | null;
  /** Lord of the Vedic weekday, which begins at sunrise (27.13's `dina`). */
  dinaLord: HoraLord | null;
  /**
   * Lords of the solar year and month (27.13's `varsha` and `masa`), from TRUE SOLAR
   * ingresses — the weekday of the sunrise opening the Vedic day that contained the Sun's
   * crossing of sidereal 0° and of the current sign's boundary respectively.
   */
  varshaLord: HoraLord | null;
  masaLord: HoraLord | null;
  /** The ingress instants themselves, so a caller can show its working. */
  meshaSankranti: Date | null;
  signIngress: Date | null;

  /**
   * True when the Sun did not cross the horizon — inside the Arctic or Antarctic circles.
   * Every field above is `null` then, deliberately: see `POLAR_IS_NOT_AN_ERROR`.
   */
  polar: boolean;
}

export interface SunriseFactsOptions {
  ayanamsa?: AyanamsaSystem;
}

/**
 * Everything the encoded rules derive from sunrise, for one birth.
 *
 * Costs three `sunTimes` calls at worst (this day, and one neighbour when the birth is outside
 * this day's daylight). That is cheap enough to call once per chart and pass around, which is
 * the intended use — the alternative, each consumer calling `sunTimes` itself, risks two
 * consumers disagreeing about which Vedic day a 03:00 birth belongs to.
 */
export function sunriseFacts(
  at: Date,
  lat: number,
  lngEast: number,
  ephem: Ephemeris,
  opts: SunriseFactsOptions = {},
): SunriseFacts {
  const today = sunTimes(at, lat, lngEast);
  const day = isDayBirth(at, lat, lngEast);
  const mins = minutesSinceSunrise(at, lat, lngEast);

  // The sunrise that OPENS this Vedic day — the previous day's when the birth is before dawn.
  // Getting this wrong is what would put a 03:00 birth's special lagnas a full day out.
  let opening: Date | null = today.rise;
  if (today.rise && at.getTime() < today.rise.getTime()) {
    opening = sunTimes(new Date(at.getTime() - 86400000), lat, lngEast).rise;
  }

  const polar = today.rise == null || today.set == null;

  let sidereal: number | null = null;
  let tropical: number | null = null;
  if (opening) {
    const jde = jdToJde(jdFromDate(opening));
    tropical = ephem.tropical(jde).sun.lon;
    sidereal = mod360(tropical - ayanamsaFor(opts.ayanamsa ?? DEFAULT_AYANAMSA, jde));
  }

  const hora = horaLord(at, lat, lngEast);
  // Costs two bisections on the ephemeris. Done once per chart, not per component.
  const solar = periodLordSources(at, lat, lngEast, ephem, opts.ayanamsa ?? DEFAULT_AYANAMSA);

  return {
    sunrise: opening,
    sunset: today.set,
    sunLongAtSunrise: sidereal,
    sunLongAtSunriseTropical: tropical,
    minutesSinceSunrise: mins,
    // 1 vighati = 24 seconds, so 1 minute = 2.5 vighatis (ch03's `minutesToVighatis`).
    vighatisSinceSunrise: mins == null ? null : (mins * 60) / 24,
    birth: day == null ? null : day ? 'day' : 'night',
    tribhaga: tribhagaThird(at, lat, lngEast),
    ghatisFromMidnight: ghatisFromMidnight(at),
    horaLord: hora,
    lagnaHora: hora === 'sun' || hora === 'moon' ? hora : null,
    dinaLord: opening ? WEEKDAY_LORDS[opening.getUTCDay()]! : null,
    varshaLord: solar.varsha,
    masaLord: solar.masa,
    meshaSankranti: solar.meshaSankranti,
    signIngress: solar.signIngress,
    polar,
  };
}

/**
 * All four period lords for `varshaMasaDinaHoraBala` (27.13) — the full 150 virupas.
 *
 * **This used to return two of four.** Dina and hora come from sunrise; varsha and masa were
 * blocked on a calendar, and the obvious Savana route (360-day years counted as an Ahargana)
 * needs an EPOCH — a free parameter worth 45 virupas with nothing in the text to pin it. Anchor
 * them to true solar ingresses instead and the parameter disappears: the Sun's entry into a
 * sidereal sign is an observable instant. See `SAURA_NEEDS_NO_EPOCH`.
 *
 * Any lord that could not be resolved is still OMITTED rather than defaulted, so a polar chart
 * reports an incomplete Kala bala instead of a plausible wrong one.
 */
export function periodLordsFromSunrise(
  f: SunriseFacts,
): { varsha?: HoraLord; masa?: HoraLord; dina?: HoraLord; hora?: HoraLord } {
  const out: { varsha?: HoraLord; masa?: HoraLord; dina?: HoraLord; hora?: HoraLord } = {};
  if (f.varshaLord) out.varsha = f.varshaLord;
  if (f.masaLord) out.masa = f.masaLord;
  if (f.dinaLord) out.dina = f.dinaLord;
  if (f.horaLord) out.hora = f.horaLord;
  return out;
}

export const POLAR_IS_NOT_AN_ERROR =
  'Inside the polar circles the Sun may not cross the horizon at all, so there is no sunrise '
  + 'and every quantity here is genuinely undefined. That is an ASTRONOMICAL FACT, not a '
  + 'failure, and it is surfaced as `polar: true` with null fields rather than defaulted to a '
  + 'nominal 06:00. A fabricated sunrise would yield three confident and wholly wrong special '
  + 'lagnas, a wrong hora lord and a wrong tribhaga — none of which any downstream check could '
  + 'catch, because all of them would look like ordinary values.';

export const SIDEREAL_IS_THE_ONE_THE_LAGNAS_WANT =
  '`sunLongAtSunrise` is SIDEREAL. The three special lagnas (5.2-8) are read as signs and every '
  + 'sign in this engine is sidereal, so a tropical value would put all three about 24° — most '
  + 'of a sign — out, while still looking like a valid lagna. The tropical figure is returned '
  + 'separately as `sunLongAtSunriseTropical` because Ayana bala (27.15-17) genuinely needs '
  + 'that one; naming both is what prevents the wrong one being reached for.';

export const ALL_FOUR_PERIOD_LORDS_NOW_RESOLVE =
  'All 150 of 27.13’s period-lord virupas are now reachable. Dina and hora come from sunrise; '
  + 'varsha and masa from TRUE SOLAR ingresses rather than a Savana day count, which removes the '
  + 'epoch — a free parameter worth 45 virupas — and removes any need for intercalation logic, '
  + 'since Adhika Masa is luni-solar and the solar month has no leap month. Before this, Kala '
  + 'bala was NOT null but silently up to 45 virupas light, which is the same failure mode '
  + '`shadbalaPinda` was built to prevent, one level further down.';

export const WHAT_SUNRISE_UNLOCKED =
  'Six encoded capabilities were unreachable for want of sunrise, all of them already tested: '
  + 'the three special lagnas (5.2-8), prana pada (3.66), selectDashaSystem’s lagnaHora and '
  + 'day/night (ch 46), Tribhaga bala (27.12), Nathonnatha bala (27.8-9), and the dina and hora '
  + 'lords of 27.13. None needed new data — astronomia has shipped `Sunrise` the whole time and '
  + 'nothing called it.';
