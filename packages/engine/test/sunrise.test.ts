// Sunrise, and the six capabilities that were unreachable without it.
//
// Two kinds of assertion here, deliberately:
//
//   1. **Against published almanac times** — spot values at five places chosen to exercise
//      high latitude, the equator, the southern hemisphere and both solstices. A tolerance of
//      three minutes: these are the conventional upper-limb-with-refraction times, and
//      published tables round to the minute.
//   2. **Against identities that hold with no external data at all** — the equinox is twelve
//      hours everywhere, the hemispheres invert at the solstice, and stepping 24 horas from one
//      weekday's lord lands exactly on the next weekday's. These cannot be satisfied by a
//      plausible-looking wrong implementation, which is what makes them worth more than the
//      spot checks.

import { describe, expect, it } from 'vitest';
import {
  sunTimes, isDayBirth, minutesSinceSunrise, tribhagaThird, horaLord,
  ghatisFromMidnight, sunCrossesHorizon, WEEKDAY_LORDS, CHALDEAN_ORDER,
  horaLordUnequal, sunriseBefore, sunriseAfter,
} from '../src/astro/sunrise.js';
import { sunriseFacts, periodLordsFromSunrise } from '../src/astro/sunrise-facts.js';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';

const LONDON = { lat: 51.5074, lng: -0.1278 };
const DELHI = { lat: 28.6139, lng: 77.2090 };
const QUITO = { lat: -0.1807, lng: -78.4678 };
const TROMSO = { lat: 69.6492, lng: 18.9553 };
const SYDNEY = { lat: -33.8688, lng: 151.2093 };

const utc = (iso: string) => new Date(iso);
const minutesApart = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;
const dayLengthHours = (rise: Date, set: Date) => (set.getTime() - rise.getTime()) / 3600000;

describe('sunrise against published almanac times', () => {
  // ⚠️ These places are east- AND west-of-Greenwich on purpose. astronomia measures longitude
  // positively WESTWARDS and this engine is east-positive; a missed sign flip passes at London
  // (0.13°W, worth 30 seconds) and fails by ten hours at Sydney. That is why Sydney is here.
  const cases: Array<{ name: string; at: string; place: { lat: number; lng: number };
    rise: string; set: string }> = [
    { name: 'London, midsummer', at: '2000-06-21T12:00:00Z', place: LONDON,
      rise: '2000-06-21T03:44:00Z', set: '2000-06-21T20:22:00Z' },
    { name: 'London, midwinter', at: '2000-12-21T12:00:00Z', place: LONDON,
      rise: '2000-12-21T08:05:00Z', set: '2000-12-21T15:54:00Z' },
    // Delhi is UTC+5:30, so midsummer sunrise (05:24 IST) falls on the PREVIOUS UTC date.
    // A naive same-UTC-day assumption would report a negative day length here.
    { name: 'Delhi, midsummer', at: '2000-06-21T12:00:00Z', place: DELHI,
      rise: '2000-06-20T23:54:00Z', set: '2000-06-21T13:53:00Z' },
    { name: 'Delhi, midwinter', at: '2000-12-21T12:00:00Z', place: DELHI,
      rise: '2000-12-21T01:40:00Z', set: '2000-12-21T12:00:00Z' },
    { name: 'Sydney, southern midsummer', at: '2000-12-21T02:00:00Z', place: SYDNEY,
      rise: '2000-12-20T18:41:00Z', set: '2000-12-21T09:06:00Z' },
  ];

  for (const c of cases) {
    it(`matches within three minutes — ${c.name}`, () => {
      const t = sunTimes(utc(c.at), c.place.lat, c.place.lng);
      expect(t.rise).not.toBeNull();
      expect(t.set).not.toBeNull();
      expect(minutesApart(t.rise!, utc(c.rise)), 'sunrise').toBeLessThan(3);
      expect(minutesApart(t.set!, utc(c.set)), 'sunset').toBeLessThan(3);
    });
  }
});

describe('identities that need no external data', () => {
  it('gives the equator twelve hours at the equinox', () => {
    // Slightly OVER twelve: the conventional horizon is the Sun's upper limb with refraction,
    // 50' below geometric, which lengthens the day everywhere. A result of exactly 12.00 would
    // mean refraction had been dropped.
    const t = sunTimes(utc('2000-03-20T12:00:00Z'), QUITO.lat, QUITO.lng);
    const len = dayLengthHours(t.rise!, t.set!);
    expect(len).toBeGreaterThan(12.0);
    expect(len).toBeLessThan(12.3);
  });

  it('inverts the hemispheres at the solstice', () => {
    const at = utc('2000-12-21T12:00:00Z');
    const north = sunTimes(at, LONDON.lat, LONDON.lng);
    const south = sunTimes(utc('2000-12-21T02:00:00Z'), SYDNEY.lat, SYDNEY.lng);
    // London's shortest day and Sydney's longest, on the same date.
    expect(dayLengthHours(north.rise!, north.set!)).toBeLessThan(8);
    expect(dayLengthHours(south.rise!, south.set!)).toBeGreaterThan(14);
  });

  it('lengthens the day with latitude in summer and shortens it in winter', () => {
    const summer = utc('2000-06-21T12:00:00Z');
    const winter = utc('2000-12-21T12:00:00Z');
    const len = (at: Date, p: { lat: number; lng: number }) => {
      const t = sunTimes(at, p.lat, p.lng);
      return dayLengthHours(t.rise!, t.set!);
    };
    expect(len(summer, LONDON)).toBeGreaterThan(len(summer, DELHI));
    expect(len(winter, LONDON)).toBeLessThan(len(winter, DELHI));
  });
});

describe('the polar case is reported, not invented', () => {
  it('returns null inside the Arctic circle at midsummer', () => {
    // Tromsø is at 69.6°N: the Sun does not set for about two months either side of the
    // solstice. The underlying library does NOT return undefined here — it returns a rise and
    // a set from non-adjacent days, which read naively is a "day" of 1,703 hours. That is the
    // exact bug this guards: every derived quantity would come out confidently wrong.
    const t = sunTimes(utc('2000-06-21T12:00:00Z'), TROMSO.lat, TROMSO.lng);
    expect(t.rise).toBeNull();
    expect(t.set).toBeNull();
    expect(sunCrossesHorizon(utc('2000-06-21T12:00:00Z'), TROMSO.lat, TROMSO.lng)).toBe(false);
  });

  it('propagates that as null rather than a default through every derived quantity', () => {
    const at = utc('2000-06-21T12:00:00Z');
    expect(isDayBirth(at, TROMSO.lat, TROMSO.lng)).toBeNull();
    expect(minutesSinceSunrise(at, TROMSO.lat, TROMSO.lng)).toBeNull();
    expect(tribhagaThird(at, TROMSO.lat, TROMSO.lng)).toBeNull();
    expect(horaLord(at, TROMSO.lat, TROMSO.lng)).toBeNull();

    const f = sunriseFacts(at, TROMSO.lat, TROMSO.lng, new AstronomiaEphemeris());
    expect(f.polar).toBe(true);
    expect(f.sunLongAtSunrise).toBeNull();
    expect(f.birth).toBeNull();
    expect(f.lagnaHora).toBeNull();
    // Not zero, not 06:00, not a guess.
    expect(f.vighatisSinceSunrise).toBeNull();
  });

  it('still works at Tromsø when the Sun does rise', () => {
    const t = sunTimes(utc('2000-09-21T12:00:00Z'), TROMSO.lat, TROMSO.lng);
    expect(t.rise).not.toBeNull();
    expect(dayLengthHours(t.rise!, t.set!)).toBeGreaterThan(11);
    expect(dayLengthHours(t.rise!, t.set!)).toBeLessThan(13);
  });
});

describe('the Vedic day begins at sunrise, not midnight', () => {
  it('counts a pre-dawn birth from the previous day’s sunrise', () => {
    // 03:00 on 1 Jan is still 31 Dec's Vedic day. Counting from the same civil date's sunrise
    // would give a NEGATIVE elapsed time and put every special lagna a full sign or more out.
    const at = utc('2000-01-01T03:00:00Z');
    const mins = minutesSinceSunrise(at, LONDON.lat, LONDON.lng)!;
    expect(mins).toBeGreaterThan(0);
    // Roughly 19 hours after the 31 December sunrise (~08:04 GMT).
    expect(mins).toBeGreaterThan(18 * 60);
    expect(mins).toBeLessThan(20 * 60);
    expect(isDayBirth(at, LONDON.lat, LONDON.lng)).toBe(false);
  });

  it('calls a noon birth a day birth and a pre-dawn one a night birth', () => {
    expect(isDayBirth(utc('2000-01-01T12:00:00Z'), LONDON.lat, LONDON.lng)).toBe(true);
    expect(isDayBirth(utc('2000-01-01T03:00:00Z'), LONDON.lat, LONDON.lng)).toBe(false);
    expect(isDayBirth(utc('2000-01-01T20:00:00Z'), LONDON.lat, LONDON.lng)).toBe(false);
  });

  it('divides day and night into three UNEQUAL thirds', () => {
    // A fixed eight-hour third would be a different rule. In midwinter London the day is 7.8
    // hours, so each daytime third is about 2.6 hours — and the night's thirds are 5.4.
    const third = (iso: string) => tribhagaThird(utc(iso), LONDON.lat, LONDON.lng)!;
    expect(third('2000-12-21T09:00:00Z')).toEqual({ third: 0, isDay: true });
    expect(third('2000-12-21T12:00:00Z')).toEqual({ third: 1, isDay: true });
    expect(third('2000-12-21T15:00:00Z')).toEqual({ third: 2, isDay: true });
    expect(third('2000-12-21T23:00:00Z').isDay).toBe(false);
  });
});

describe('the hora, and the Chaldean identity that proves it', () => {
  it('steps 24 horas from one weekday’s lord onto the next weekday’s', () => {
    // The classical elegance, and a check no plausible-but-wrong ordering survives: 24 mod 7
    // is 3, and stepping three places along the Chaldean order from any weekday's lord gives
    // the next weekday's lord. If the order were wrong, this would fail for every day.
    for (let d = 0; d < 7; d++) {
      const todayLord = WEEKDAY_LORDS[d]!;
      const tomorrowLord = WEEKDAY_LORDS[(d + 1) % 7]!;
      const i = CHALDEAN_ORDER.indexOf(todayLord as never);
      expect(CHALDEAN_ORDER[(i + 24) % 7]).toBe(tomorrowLord);
    }
  });

  it('gives the first hora of a day to that weekday’s own lord', () => {
    // 1 Jan 2000 was a Saturday; sunrise in London was ~08:05 GMT.
    const t = sunTimes(utc('2000-01-01T12:00:00Z'), LONDON.lat, LONDON.lng);
    expect(t.rise!.getUTCDay()).toBe(6); // Saturday
    const justAfter = new Date(t.rise!.getTime() + 60000);
    expect(horaLord(justAfter, LONDON.lat, LONDON.lng)).toBe('saturn');
    expect(WEEKDAY_LORDS[6]).toBe('saturn');
  });

  it('separates the two hora conventions, which disagree by three places here', () => {
    // Saturday's horas run Saturn, Jupiter, Mars, Sun, Venus, Mercury… and where noon falls in
    // that sequence depends entirely on which convention is used. This one case pins both.
    //
    // EQUAL (the Indian reckoning, and the default): the sunrise-to-sunrise day is 24 parts of
    // ~60 minutes. Noon is 235 minutes after the 08:05 sunrise, so the 4th hora — the Sun's.
    //
    // UNEQUAL (Western planetary hours): the 7.83-hour daylight is twelve parts of 39.2
    // minutes, so 235 minutes in is the 6th hora — Mercury's.
    //
    // Both are asserted so that a change to either is a deliberate act rather than a surprise.
    const at = utc('2000-01-01T12:00:00Z');
    expect(horaLord(at, LONDON.lat, LONDON.lng)).toBe('sun');
    expect(horaLordUnequal(at, LONDON.lat, LONDON.lng)).toBe('mercury');
  });

  it('agrees between the conventions at sunrise, where both start', () => {
    // The two readings diverge immediately but must coincide in the first hora, which belongs
    // to the weekday lord under either. If they disagreed there, one of them would not be
    // implementing "the first hora is the day's own lord" at all.
    const t = sunTimes(utc('2000-01-01T12:00:00Z'), LONDON.lat, LONDON.lng);
    const justAfter = new Date(t.rise!.getTime() + 60000);
    expect(horaLord(justAfter, LONDON.lat, LONDON.lng)).toBe('saturn');
    expect(horaLordUnequal(justAfter, LONDON.lat, LONDON.lng)).toBe('saturn');
  });

  it('gives the equal hora a length close to but not exactly sixty minutes', () => {
    // The day length is MEASURED, not assumed to be 1440 minutes. A real sunrise-to-sunrise
    // interval differs from 24 clock hours by up to about half a minute, and dividing the
    // measured interval is what keeps the 24th hora ending exactly at the next sunrise.
    const rise = sunriseBefore(utc('2000-01-01T12:00:00Z'), LONDON.lat, LONDON.lng)!;
    const next = sunriseAfter(rise, LONDON.lat, LONDON.lng)!;
    const horaMinutes = ((next.getTime() - rise.getTime()) / 24) / 60000;
    expect(horaMinutes).toBeGreaterThan(59);
    expect(horaMinutes).toBeLessThan(61);
    expect(horaMinutes).not.toBe(60);
  });

  it('makes horas unequal — longer by day in summer than in winter', () => {
    // A hora is a twelfth of the DAY, not a twenty-fourth of the clock. In London a summer
    // daytime hora is 83 minutes and a winter one 39.
    const len = (iso: string) => {
      const t = sunTimes(utc(iso), LONDON.lat, LONDON.lng);
      return ((t.set!.getTime() - t.rise!.getTime()) / 12) / 60000;
    };
    expect(len('2000-06-21T12:00:00Z')).toBeGreaterThan(80);
    expect(len('2000-12-21T12:00:00Z')).toBeLessThan(41);
  });

  it('measures ghatis from midnight for Nathonnatha bala', () => {
    // 60 ghatis to the day, so noon is 30 and 06:00 is 15.
    expect(ghatisFromMidnight(utc('2000-01-01T12:00:00Z'))).toBeCloseTo(30, 6);
    expect(ghatisFromMidnight(utc('2000-01-01T06:00:00Z'))).toBeCloseTo(15, 6);
    expect(ghatisFromMidnight(utc('2000-01-01T00:00:00Z'))).toBeCloseTo(0, 6);
  });
});

describe('sunriseFacts assembles what the encoded rules take', () => {
  const ephem = new AstronomiaEphemeris();
  const at = utc('2000-01-01T12:00:00Z');
  const f = sunriseFacts(at, LONDON.lat, LONDON.lng, ephem);

  it('supplies every field the six blocked capabilities were waiting for', () => {
    expect(f.polar).toBe(false);
    expect(f.sunLongAtSunrise).not.toBeNull();       // ch 5.2-8
    expect(f.vighatisSinceSunrise).not.toBeNull();   // ch 3.66
    expect(f.birth).toBe('day');                     // ch 46
    expect(f.lagnaHora).toBe('sun');                 // ch 46 — the Sun IS a luminary
    expect(f.horaLord).toBe('sun');                  // ch 27.13, equal-hora convention
    expect(f.dinaLord).toBe('saturn');               // ch 27.13
    expect(f.varshaLord).not.toBeNull();             // ch 27.13, from the Mesha Sankranti
    expect(f.masaLord).not.toBeNull();               // ch 27.13, from the sign ingress
    expect(f.tribhaga).not.toBeNull();               // ch 27.12
    expect(f.ghatisFromMidnight).toBeCloseTo(30, 6); // ch 27.8-9
  });

  it('returns the SIDEREAL sun longitude, about 24° behind the tropical', () => {
    // The special lagnas are read as signs and this engine's signs are sidereal, so a tropical
    // value would put all three most of a sign out while still looking valid. Around 2000 the
    // Lahiri ayanamsa is ~23.85°, so the gap is a direct check that the right one is returned.
    const gap = (f.sunLongAtSunriseTropical! - f.sunLongAtSunrise! + 360) % 360;
    expect(gap).toBeGreaterThan(23);
    expect(gap).toBeLessThan(25);
  });

  it('takes the Sun from the OPENING sunrise, not from the birth moment', () => {
    // The Sun moves ~1°/day, and these lagnas are built on where it was at sunrise. Taking it
    // at the birth moment instead would be wrong by up to a degree — small, but wrong all day
    // and in the same direction, which is the kind of error that never announces itself.
    const atSunrise = ephem.tropical(
      2440587.5 + f.sunrise!.getTime() / 86400000,
    ).sun.lon;
    expect(Math.abs(f.sunLongAtSunriseTropical! - atSunrise)).toBeLessThan(0.01);
  });

  it('hands 27.13 all FOUR period lords — the full 150 virupas', () => {
    // This returned two of four until the solar ingresses landed. Dina and hora come from
    // sunrise; varsha and masa were blocked on a calendar, and the obvious Savana route needs
    // an EPOCH — a free parameter worth 45 virupas with nothing in the text to pin it. True
    // solar ingresses have no such parameter, so nothing has to be chosen.
    const lords = periodLordsFromSunrise(f);
    expect(lords.dina).toBe('saturn');
    expect(lords.hora).toBe('sun');
    expect(lords.varsha).toBeDefined();
    expect(lords.masa).toBeDefined();
    expect(Object.keys(lords).sort()).toEqual(['dina', 'hora', 'masa', 'varsha']);
  });

  it('puts the Mesha Sankranti in April and the sign ingress after it', () => {
    // The Sun crosses sidereal 0° in mid-April, not at the tropical equinox — the ayanamsa is
    // the whole difference, and a tropical reading would land it three weeks earlier in March.
    expect(f.meshaSankranti!.getUTCMonth()).toBe(3); // April
    // And the current sign's ingress is necessarily at or after the year's start, and before
    // the birth. Getting the search direction wrong would break one of these two.
    expect(f.signIngress!.getTime()).toBeGreaterThanOrEqual(f.meshaSankranti!.getTime());
    expect(f.signIngress!.getTime()).toBeLessThanOrEqual(at.getTime());
  });

  it('resolves a pre-dawn birth to the previous day’s sunrise', () => {
    const pre = sunriseFacts(utc('2000-01-01T03:00:00Z'), LONDON.lat, LONDON.lng, ephem);
    expect(pre.sunrise!.getUTCDate()).toBe(31);
    expect(pre.sunrise!.getUTCMonth()).toBe(11); // December
    expect(pre.birth).toBe('night');
    expect(pre.dinaLord).toBe('venus'); // 31 Dec 1999 was a Friday, and Friday is Venus's.
    expect(pre.minutesSinceSunrise!).toBeGreaterThan(0);
  });
});
