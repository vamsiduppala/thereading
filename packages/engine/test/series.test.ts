// `rateSeries` samples the composite at whatever granularity was asked for.
//
// It replaced a hand-written `rateMonths` written twenty minutes earlier, for a reason worth
// keeping: a month-specific function answers "rate my months" and leaves "rate each week",
// "best three quarters" and "day by day" broken in the same way. Making the unit an argument
// is what covers the phrasings nobody has thought of yet.
//
// What must hold, then, is not "months work" but "every unit works, and the numbers move".
// A series that returns the same figure in every bucket is a table of noise; a series that
// silently truncates is worse, because the reader cannot tell.

import { describe, expect, it } from 'vitest';
import { computeChart } from '../src/chart/chart.js';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';
import { rateSeries, type SeriesUnit } from '../src/timing/windows.js';

const ephem = new AstronomiaEphemeris();
const BIRTH = {
  date: '1990-05-15', time: '06:30', unknownTime: false, place: 'Hyderabad',
  lat: 17.385, lng: 78.4867, tzOffsetMinutes: 330,
};
const chart = computeChart(BIRTH, ephem);
const birth = new Date('1990-05-15T01:00:00Z');

const FROM = new Date('2026-08-01T00:00:00Z');
const TO = new Date('2027-08-31T23:59:59Z');

describe('rateSeries covers the range it was given', () => {
  it('returns every calendar month, inclusive of both ends', () => {
    const rows = rateSeries(chart, birth, 'career', FROM, TO, 'month');
    expect(rows.length).toBe(13);
    expect(rows[0]!.label).toBe('August 2026');
    expect(rows[12]!.label).toBe('August 2027');
  });

  it('aligns buckets to the calendar, not to an offset from `from`', () => {
    // Asked from the 26th, the first month is still August — a table of months whose rows
    // run 26th-to-25th is not a table of months.
    const rows = rateSeries(chart, birth, 'career', new Date('2026-08-26T00:00:00Z'), TO, 'month');
    expect(rows[0]!.label).toBe('August 2026');
    expect(rows[0]!.start.toISOString().slice(0, 10)).toBe('2026-08-01');
  });

  it('honours every unit it advertises', () => {
    const units: SeriesUnit[] = ['day', 'week', 'month', 'quarter', 'year', 'period'];
    for (const u of units) {
      const rows = rateSeries(chart, birth, 'career', FROM, TO, u);
      expect(rows.length, u).toBeGreaterThan(0);
      for (const r of rows) {
        expect(r.score, `${u} ${r.label}`).toBeGreaterThanOrEqual(0);
        expect(r.score, `${u} ${r.label}`).toBeLessThanOrEqual(100);
        expect(r.label, u).not.toMatch(/undefined|NaN|null/);
        expect(r.end.getTime(), u).toBeGreaterThan(r.start.getTime());
      }
    }
  });

  it('gives coarser units fewer rows than finer ones', () => {
    const n = (u: SeriesUnit) => rateSeries(chart, birth, 'career', FROM, TO, u).length;
    expect(n('year')).toBeLessThan(n('quarter'));
    expect(n('quarter')).toBeLessThan(n('month'));
    expect(n('month')).toBeLessThan(n('week'));
  });

  it('caps the row count rather than printing a year of days', () => {
    // A table someone reads. 396 rows is data, not an answer.
    const rows = rateSeries(chart, birth, 'career', FROM, TO, 'day');
    expect(rows.length).toBeLessThanOrEqual(64);
  });
});

describe('rateSeries discriminates', () => {
  it('does not return one number thirteen times', () => {
    const rows = rateSeries(chart, birth, 'career', FROM, TO, 'month');
    const distinct = new Set(rows.map((r) => r.score));
    expect(distinct.size).toBeGreaterThan(3);
  });

  it('spreads far enough to be worth reading', () => {
    const s = rateSeries(chart, birth, 'career', FROM, TO, 'month').map((r) => r.score);
    expect(Math.max(...s) - Math.min(...s)).toBeGreaterThan(2);
  });

  it('separates two different areas of life', () => {
    // The whole premise is that the answer depends on the matter asked about. If work and
    // relationships score identically month for month, the area argument is decorative.
    const w = rateSeries(chart, birth, 'career', FROM, TO, 'month').map((r) => r.score);
    const r = rateSeries(chart, birth, 'partnership', FROM, TO, 'month').map((x) => x.score);
    expect(w.join()).not.toBe(r.join());
  });

  it('is deterministic — the same question twice gives the same table', () => {
    const a = rateSeries(chart, birth, 'career', FROM, TO, 'month');
    const b = rateSeries(chart, birth, 'career', FROM, TO, 'month');
    expect(a.map((x) => `${x.label}:${x.score}`)).toEqual(b.map((x) => `${x.label}:${x.score}`));
  });
});

describe('rateSeries is honest about its own buckets', () => {
  it('flags the buckets a period boundary falls inside', () => {
    // A month sampled at its midpoint gets ONE figure. Where a boundary falls inside it, that
    // figure summarises the month rather than describing it throughout, and the reader is
    // entitled to know which rows those are.
    const rows = rateSeries(chart, birth, 'career', FROM, TO, 'month');
    expect(rows.some((r) => r.changesMidway)).toBe(true);
    expect(rows.every((r) => r.changesMidway)).toBe(false);
  });

  it('gives every row a reason', () => {
    const rows = rateSeries(chart, birth, 'career', FROM, TO, 'month');
    for (const r of rows) expect(r.why.length, r.label).toBeGreaterThan(0);
  });
});
