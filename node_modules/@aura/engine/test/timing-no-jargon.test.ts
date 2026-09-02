// The timing engine's reason strings are shown to readers, so they are linted too.
//
// `no-jargon.test.ts` guards the synthesis template bank and has since early on. It does not
// reach `src/timing/`, which did not exist when it was written — and the very first sweep of a
// rendered answer found "the Moon is in a settled, well-being phase for you" on screen. Every
// other layer had a lint; this one had none, and it leaked on its first outing.
//
// The strings here are the `why` fields on `ScoreReason` and `MomentScore.reasons`. They are
// not labels or keys: they are dropped verbatim into sentences a person reads.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { scorePlanetForHouses, AREA_HOUSES } from '../src/timing/windows.js';
import { scoreMoment } from '../src/timing/elect.js';
import { computeChart } from '../src/chart/chart.js';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';
import { GRAHAS } from '../src/constants.js';
import type { Graha, House } from '../src/types.js';

const FORBIDDEN = new RegExp(
  String.raw`\b(`
  + 'mars|mercury|jupiter|venus|saturn|rahu|ketu|the moon|the sun'
  + '|aries|taurus|gemini|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces'
  + '|graha|dasha|dasa|nakshatra|pada|lagna|rashi|rasi|bhava|gochara|vimshottari|ayanamsa'
  + '|drishti|kendra|trikona|dusthana|ascendant|retrograde|combust|exalted|debilitated'
  + '|zodiac|horoscope|benefic|malefic|varga|navamsa|yoga|karaka|trine|tithi|tara|hora'
  + String.raw`)\b`,
  'i',
);

const ephem = new AstronomiaEphemeris();
const BIRTH = {
  date: '1990-05-15', time: '06:30', unknownTime: false, place: 'Delhi',
  lat: 28.6139, lng: 77.209, tzOffsetMinutes: 330,
};
const chart = computeChart(BIRTH, ephem);

describe('timing reasons stay in plain English', () => {
  it('produces no astrology vocabulary from any planet against any area', () => {
    const offenders: string[] = [];
    for (const area of Object.keys(AREA_HOUSES) as (keyof typeof AREA_HOUSES)[]) {
      const houses = [...AREA_HOUSES[area]] as House[];
      for (const g of GRAHAS as Graha[]) {
        for (const r of scorePlanetForHouses(chart, g, houses).reasons) {
          if (FORBIDDEN.test(r.why)) offenders.push(`${area}/${g}: ${r.why}`);
        }
      }
    }
    expect(offenders, `${offenders.length} window reasons leak jargon`).toEqual([]);
  });

  it('produces none from the electional scorer either, over a full lunar cycle', () => {
    // A full 30 days, so every lunar day and every one of the nine personal phases is hit —
    // a one-day sample would exercise a fraction of the strings.
    const offenders: string[] = [];
    const base = Date.UTC(2026, 8, 1, 12, 0, 0);
    for (let d = 0; d < 30; d++) {
      for (const task of [undefined, 'house-construction']) {
        const m = scoreMoment(new Date(base + d * 86400000), chart, ephem,
          BIRTH.lat, BIRTH.lng, task);
        for (const r of m.reasons) {
          if (FORBIDDEN.test(r.why)) offenders.push(`day ${d} (${task ?? 'general'}): ${r.why}`);
        }
      }
    }
    expect(offenders, `${offenders.length} electional reasons leak jargon`).toEqual([]);
  });

  it('actually produced reasons, so a silent empty pass is impossible', () => {
    // A lint that matches nothing reports success forever. This is the guard on the guard.
    const seen = new Set<string>();
    const base = Date.UTC(2026, 8, 1, 12, 0, 0);
    for (let d = 0; d < 30; d++) {
      for (const r of scoreMoment(new Date(base + d * 86400000), chart, ephem,
        BIRTH.lat, BIRTH.lng).reasons) seen.add(r.why);
    }
    for (const g of GRAHAS as Graha[]) {
      for (const r of scorePlanetForHouses(chart, g, [7] as House[]).reasons) seen.add(r.why);
    }
    expect(seen.size).toBeGreaterThan(10);
  });

  it('leaves the module prose and comments alone — the guard stays narrow', () => {
    // The files explain themselves in the source vocabulary and must keep doing so; only the
    // strings a reader sees are constrained.
    const src = readFileSync(join(import.meta.dirname, '..', 'src', 'timing', 'elect.ts'), 'utf8');
    expect(/\btithi\b/i.test(src), 'elect.ts prose should still say "tithi"').toBe(true);
    expect(/\btara\b/i.test(src), 'elect.ts prose should still say "tara"').toBe(true);
  });
});
