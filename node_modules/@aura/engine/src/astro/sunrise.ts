// Sunrise, sunset, and the quantities Vedic astrology derives from them.
//
// **This was the largest hole in the engine and it needed no new data at all** — `astronomia`
// has shipped `Sunrise` the whole time and nothing called it. Its absence silently blocked:
//
//   - the three **special lagnas** — Bhava, Hora and Ghatika (BPHS 5.2-9), which are encoded
//     and marked available but take `sunLongAtSunrise` and `minutesSinceSunrise` from a caller
//     who had no way to obtain either;
//   - **prana pada** (BPHS 3.66), which counts vighatikas from sunrise;
//   - **`selectDashaSystem`** (BPHS 46), whose `lagnaHora` and `birth: day|night` inputs are
//     both sunrise-derived — so the programme's crown jewel was only half reachable;
//   - **Kala bala's tribhaga and hora-lord components**, worth 120 of the ~225 virupas that
//     kept a complete Shadbala out of reach.
//
// ⚠️ **Two traps in the underlying API, both silent if missed.**
//
// 1. **`astronomia` measures longitude positively WESTWARDS.** Its own doc says "New York =
//    40.7° lat, 74° lon". This engine is east-positive everywhere else, so the sign is flipped
//    exactly once, here. Getting it wrong moves sunrise by up to eight hours at 120°E and
//    nothing else in the system would notice.
// 2. **It returns `undefined` inside the polar circles**, where the Sun may not cross the
//    horizon at all. That is a real astronomical fact, not a failure, so it is surfaced as
//    `null` rather than defaulted to 06:00 — a fabricated sunrise would produce a confident
//    and wholly wrong lagna.

import { julian, sunrise as sunriseLib } from 'astronomia';

/** JD of the Unix epoch, for converting between `Date` and Julian Day. */
const JD_UNIX_EPOCH = 2440587.5;

const jdToDate = (jd: number): Date => new Date((jd - JD_UNIX_EPOCH) * 86400000);

export interface SunTimes {
  /** UTC instant of sunrise, or `null` inside a polar day or night. */
  rise: Date | null;
  set: Date | null;
  /** Local apparent noon — always defined, even when the Sun never rises. */
  noon: Date | null;
}

/**
 * Sunrise, sunset and local noon for a civil date at a place.
 *
 * `lngEast` is **east-positive**, this engine's convention throughout; the flip to
 * astronomia's west-positive frame happens inside.
 *
 * The horizon used is the conventional one — the Sun's upper limb with standard refraction,
 * 50′ below the geometric horizon. Indian practice generally agrees; a tradition wanting the
 * disc's centre or no refraction would want a different `h0`, which is why this is stated
 * rather than left implicit.
 */
export function sunTimes(date: Date, lat: number, lngEast: number): SunTimes {
  // Trap 1: astronomia is west-positive. This is the only place the sign is flipped.
  const cal = new julian.Calendar(date);
  const sr = new sunriseLib.Sunrise(cal, lat, -lngEast);

  // Trap 2: `undefined` inside the polar circles is an astronomical fact, not an error.
  const at = (fn: () => { toJDE(): number } | undefined): Date | null => {
    try {
      const c = fn();
      return c == null ? null : jdToDate(c.toJDE());
    } catch {
      return null;
    }
  };

  const rise = at(() => sr.rise());
  const set = at(() => sr.set());
  const noon = at(() => sr.noon());

  // Trap 2, the half of it that does NOT announce itself. Inside the polar circles the
  // library does not always return `undefined` — at Tromsø in midsummer it returns a rise and
  // a set that are days apart, yielding a "day" of 1,703 hours. Nothing downstream would
  // notice: the tribhaga third and the hora would both come out confidently wrong.
  //
  // So the interval is validated rather than trusted. A real solar day is bounded by
  // definition; anything outside (0, 24h) means the Sun did not actually cross the horizon.
  const span = rise && set ? set.getTime() - rise.getTime() : null;
  const plausible = span != null && span > 0 && span < 24 * 3600 * 1000;

  return {
    rise: plausible ? rise : null,
    set: plausible ? set : null,
    noon,
  };
}

/**
 * Whether the Sun crossed the horizon at all on this date at this place.
 *
 * `false` inside a polar day or night. Every sunrise-derived quantity is unavailable then, and
 * the callers return `null` rather than substituting a nominal 06:00 — a fabricated sunrise
 * produces a confident and wholly wrong lagna, which is worse than no answer.
 */
export function sunCrossesHorizon(date: Date, lat: number, lngEast: number): boolean {
  const t = sunTimes(date, lat, lngEast);
  return t.rise != null && t.set != null;
}

/**
 * Whether a birth is a day birth — the Sun above the horizon.
 *
 * The Vedic day runs **sunrise to sunset**, so a birth at 02:00 belongs to the *previous*
 * day's night. That is why this compares against the sunrise of the birth's own civil date and
 * then looks backwards, rather than assuming the night follows the day.
 *
 * Returns `null` rather than guessing where the Sun does not rise or set.
 */
export function isDayBirth(at: Date, lat: number, lngEast: number): boolean | null {
  const t = sunTimes(at, lat, lngEast);
  if (!t.rise || !t.set) return null;
  return at.getTime() >= t.rise.getTime() && at.getTime() < t.set.getTime();
}

/**
 * Minutes elapsed since the sunrise that opens this Vedic day.
 *
 * A birth before sunrise belongs to the previous Vedic day, so the previous day's sunrise is
 * the one to count from — otherwise a 03:00 birth would come out negative, and every special
 * lagna derived from it would be a sign or more out.
 */
export function minutesSinceSunrise(at: Date, lat: number, lngEast: number): number | null {
  const today = sunTimes(at, lat, lngEast);
  if (!today.rise) return null;
  if (at.getTime() >= today.rise.getTime()) {
    return (at.getTime() - today.rise.getTime()) / 60000;
  }
  const yesterday = sunTimes(new Date(at.getTime() - 86400000), lat, lngEast);
  if (!yesterday.rise) return null;
  return (at.getTime() - yesterday.rise.getTime()) / 60000;
}

/**
 * The sunrise immediately at or before an instant — the one that opens its Vedic day.
 *
 * `null` inside a polar day or night. The walk back is capped at three days: one suffices in
 * every ordinary case, and a longer search inside the Arctic circle would eventually return a
 * sunrise weeks away and present it as "the preceding one", which is worse than no answer.
 */
export function sunriseBefore(at: Date, lat: number, lngEast: number): Date | null {
  for (let back = 0; back <= 3; back++) {
    const rise = sunTimes(new Date(at.getTime() - back * 86400000), lat, lngEast).rise;
    if (rise && rise.getTime() <= at.getTime()) return rise;
  }
  return null;
}

/** The first sunrise strictly after an instant. `null` inside a polar day or night. */
export function sunriseAfter(at: Date, lat: number, lngEast: number): Date | null {
  for (let fwd = 0; fwd <= 3; fwd++) {
    const rise = sunTimes(new Date(at.getTime() + fwd * 86400000), lat, lngEast).rise;
    if (rise && rise.getTime() > at.getTime()) return rise;
  }
  return null;
}

/** Ghatis (24 minutes each) elapsed from midnight — Kala bala's Nathonnatha input. */
export function ghatisFromMidnight(at: Date): number {
  const midnight = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate());
  return (at.getTime() - midnight) / 60000 / 24;
}

/**
 * Which third of the day or night the birth falls in — Kala bala's Tribhaga (BPHS 27.12).
 *
 * The day is divided sunrise→sunset and the night sunset→next sunrise, each into three equal
 * parts. These are *unequal* in clock time and vary with latitude and season, which is the
 * whole point: a fixed eight-hour third would be a different rule.
 */
export function tribhagaThird(
  at: Date, lat: number, lngEast: number,
): { third: 0 | 1 | 2; isDay: boolean } | null {
  const day = isDayBirth(at, lat, lngEast);
  if (day == null) return null;
  const t = sunTimes(at, lat, lngEast);
  if (!t.rise || !t.set) return null;

  let start: number;
  let end: number;
  if (day) {
    start = t.rise.getTime();
    end = t.set.getTime();
  } else if (at.getTime() >= t.set.getTime()) {
    // Evening: this sunset to tomorrow's sunrise.
    const tomorrow = sunTimes(new Date(at.getTime() + 86400000), lat, lngEast);
    if (!tomorrow.rise) return null;
    start = t.set.getTime();
    end = tomorrow.rise.getTime();
  } else {
    // Small hours: yesterday's sunset to this sunrise.
    const yesterday = sunTimes(new Date(at.getTime() - 86400000), lat, lngEast);
    if (!yesterday.set) return null;
    start = yesterday.set.getTime();
    end = t.rise.getTime();
  }
  const frac = (at.getTime() - start) / (end - start);
  const third = Math.min(2, Math.max(0, Math.floor(frac * 3))) as 0 | 1 | 2;
  return { third, isDay: day };
}

/**
 * The lords of the weekdays, in the order the hora sequence walks them.
 *
 * Sunday through Saturday. The hora order is *not* this order — see `horaLord`.
 */
export const WEEKDAY_LORDS = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
] as const;

/**
 * The Chaldean order, which is what the hora sequence actually follows: each hora is ruled by
 * the next planet **outward to inward** by orbital period — Saturn, Jupiter, Mars, Sun, Venus,
 * Mercury, Moon — cycling.
 *
 * The elegant consequence, and the check that the implementation is right: stepping 24 horas
 * from the lord of one day lands exactly on the lord of the next weekday. `horaLord` is
 * asserted against that in the tests.
 */
export const CHALDEAN_ORDER = [
  'saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon',
] as const;

export type HoraLord = (typeof CHALDEAN_ORDER)[number];

/**
 * The hora lord under the **UNEQUAL** convention — one twelfth of the daylight and one twelfth
 * of the night, so horas lengthen by day in summer.
 *
 * ⚠️ **This is not the default.** See `HORA_CONVENTIONS`: the Indian reckoning divides the
 * whole sunrise-to-sunrise day into 24 EQUAL parts, and that is what `horaLord` uses. This
 * reading is the Western planetary-hours one. It is kept because it is a real tradition and
 * because the two disagree for most of the day, so a caller who wants it should be able to
 * name it rather than reimplement it.
 */
export function horaLordUnequal(at: Date, lat: number, lngEast: number): HoraLord | null {
  const t = sunTimes(at, lat, lngEast);
  if (!t.rise || !t.set) return null;
  const day = isDayBirth(at, lat, lngEast);
  if (day == null) return null;

  let start: number;
  let end: number;
  let elapsedHoras: number;
  let vedicDayStart: Date;

  if (day) {
    start = t.rise.getTime();
    end = t.set.getTime();
    elapsedHoras = Math.floor(((at.getTime() - start) / (end - start)) * 12);
    vedicDayStart = t.rise;
  } else if (at.getTime() >= t.set.getTime()) {
    const tomorrow = sunTimes(new Date(at.getTime() + 86400000), lat, lngEast);
    if (!tomorrow.rise) return null;
    start = t.set.getTime();
    end = tomorrow.rise.getTime();
    elapsedHoras = 12 + Math.floor(((at.getTime() - start) / (end - start)) * 12);
    vedicDayStart = t.rise;
  } else {
    const yesterday = sunTimes(new Date(at.getTime() - 86400000), lat, lngEast);
    if (!yesterday.set || !yesterday.rise) return null;
    start = yesterday.set.getTime();
    end = t.rise.getTime();
    elapsedHoras = 12 + Math.floor(((at.getTime() - start) / (end - start)) * 12);
    vedicDayStart = yesterday.rise;
  }

  // The Vedic day's weekday is the one its SUNRISE fell in, not the civil date of `at`.
  const weekdayLord = WEEKDAY_LORDS[vedicDayStart.getUTCDay()]!;
  const startIndex = CHALDEAN_ORDER.indexOf(weekdayLord as HoraLord);
  if (startIndex < 0) return null;
  const n = Math.min(23, Math.max(0, elapsedHoras));
  return CHALDEAN_ORDER[(startIndex + n) % 7]!;
}

/**
 * The lord of the hora a moment falls in — **the Indian equal-hora reckoning**, and the default.
 *
 * The Vedic day runs sunrise to next sunrise and is divided into **24 equal parts**, each about
 * sixty minutes. The first hora belongs to that weekday's own lord, and successive horas walk
 * the Chaldean order.
 *
 * Note the day length is measured, not assumed to be 1440 minutes: a real sunrise-to-sunrise
 * interval differs from 24 clock hours by up to about half a minute, and more where the clock
 * has a DST discontinuity. Dividing the measured interval keeps the 24th hora ending exactly at
 * the next sunrise, which is what makes the Chaldean identity hold.
 */
export function horaLord(at: Date, lat: number, lngEast: number): HoraLord | null {
  const opening = sunriseBefore(at, lat, lngEast);
  if (!opening) return null;
  const next = sunriseAfter(opening, lat, lngEast);
  if (!next) return null;

  const span = next.getTime() - opening.getTime();
  if (span <= 0) return null;
  const elapsed = at.getTime() - opening.getTime();
  const index = Math.min(23, Math.max(0, Math.floor((elapsed / span) * 24)));

  const weekdayLord = WEEKDAY_LORDS[opening.getUTCDay()]!;
  const startIndex = CHALDEAN_ORDER.indexOf(weekdayLord as HoraLord);
  if (startIndex < 0) return null;
  return CHALDEAN_ORDER[(startIndex + index) % 7]!;
}

/** `selectDashaSystem` asks only whether the ascendant falls in a Sun or Moon hora. */
export function luminaryHora(
  at: Date, lat: number, lngEast: number,
): 'sun' | 'moon' | null {
  const lord = horaLord(at, lat, lngEast);
  return lord === 'sun' || lord === 'moon' ? lord : null;
}

export const HORA_CONVENTIONS =
  'Two readings of "hora" exist and they disagree for most of the day. The INDIAN reckoning — '
  + 'used by `horaLord` and the default here — divides the whole sunrise-to-sunrise day into 24 '
  + 'EQUAL parts of about sixty minutes. The WESTERN planetary-hours reading (`horaLordUnequal`) '
  + 'divides daylight into twelve and night into twelve, giving parts that stretch to 83 minutes '
  + 'in a London summer and shrink to 39 in winter. Both walk the Chaldean order and both give '
  + 'the first hora to the weekday lord, so they agree at sunrise and diverge immediately after. '
  + 'The Indian one is used because this is a Vedic corpus; the other is kept and named rather '
  + 'than deleted, because the choice is a convention and not a correctness question.';

export const CHALDEAN_NOT_REVERSE_WEEKDAY =
  'The hora sequence follows the CHALDEAN order (Saturn, Jupiter, Mars, Sun, Venus, Mercury, '
  + 'Moon) and NOT a backward walk of the weekday order. The two are sometimes offered as if '
  + 'interchangeable and they are not: stepping backward through the weekdays from Sunday gives '
  + 'Sun, Saturn, Venus, Jupiter, whereas Chaldean gives Sun, Venus, Mercury, Moon. Only the '
  + 'Chaldean order satisfies the identity the seven-day week is built on — 24 horas forward '
  + 'from one day’s lord lands on the NEXT weekday’s lord, because 24 mod 7 is 3 and three '
  + 'Chaldean steps from Saturn is the Sun. A reverse-weekday walk would make Sunday run into '
  + 'Thursday.';
