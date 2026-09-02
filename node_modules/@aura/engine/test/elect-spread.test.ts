// Electional scores must DISCRIMINATE. A scale that pins is not a scale.
//
// This exists because of a specific failure a reader spotted before any test did: five
// different dates all reported exactly 99.0, with the same one-line reason, all at 12:00. The
// cause was saturation — the terms sum to more than the clamp, so every strong day pinned to
// the ceiling, and the hour scan died with it because no hour could beat a day already at the
// top.
//
// "Every score is inside 0-100" passed throughout. The property that actually mattered — that
// different days get different numbers — was never asserted.

import { describe, expect, it } from 'vitest';
import { scoreMoment, bestMoments } from '../src/timing/elect.js';
import { computeChart } from '../src/chart/chart.js';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';

const ephem = new AstronomiaEphemeris();
const BIRTH = {
  date: '1990-05-15', time: '06:30', unknownTime: false, place: 'Hyderabad',
  lat: 17.385, lng: 78.4867, tzOffsetMinutes: 330,
};
const chart = computeChart(BIRTH, ephem);
const FROM = new Date('2026-08-26T00:00:00Z');

/** Every day of a full lunar cycle, at noon. */
function monthOfScores(task?: string): number[] {
  const out: number[] = [];
  for (let d = 0; d < 30; d++) {
    const at = new Date(FROM.getTime() + d * 86400000);
    at.setUTCHours(12, 0, 0, 0);
    out.push(scoreMoment(at, chart, ephem, BIRTH.lat, BIRTH.lng, task).score);
  }
  return out;
}

describe('the electional scale discriminates', () => {
  it('does not pin a month of days to one number', () => {
    const scores = monthOfScores();
    const distinct = new Set(scores);
    // 30 days should produce many distinct values. Saturation produced a handful.
    expect(distinct.size, `only ${distinct.size} distinct scores in 30 days`).toBeGreaterThan(12);
  });

  it('never lets more than a few days share the top', () => {
    // The specific symptom: five separate dates all reading 99.0. Ties at the very top are
    // what a clamped scale produces and what a normalised one does not.
    const scores = monthOfScores().sort((a, b) => b - a);
    const top = scores[0]!;
    const atTop = scores.filter((s) => s === top).length;
    expect(atTop, `${atTop} days tied at ${top}`).toBeLessThanOrEqual(2);
  });

  it('uses the range rather than crowding one end', () => {
    const scores = monthOfScores();
    const spread = Math.max(...scores) - Math.min(...scores);
    expect(spread, `spread of only ${spread.toFixed(1)} points`).toBeGreaterThan(25);
  });

  it('stays inside 0-100 with and without a task table', () => {
    for (const task of [undefined, 'house-construction']) {
      for (const s of monthOfScores(task)) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(100);
      }
    }
  });

  it('separates the hours within a day, so the best hour is not always noon', () => {
    // The hour scan only means something if hours differ. When the day saturated they did
    // not, and every result came back at 12:00 — which is what gave the bug away.
    const hours: number[] = [];
    for (let h = 6; h <= 20; h++) {
      const at = new Date(FROM);
      at.setUTCHours(h, 0, 0, 0);
      hours.push(scoreMoment(at, chart, ephem, BIRTH.lat, BIRTH.lng).score);
    }
    expect(new Set(hours).size).toBeGreaterThan(2);
  });

  it('returns ranked, differing moments from a real scan', () => {
    const ms = bestMoments(chart, ephem, BIRTH.lat, BIRTH.lng,
      FROM, new Date(FROM.getTime() + 60 * 86400000), { limit: 5 });
    expect(ms.length).toBe(5);
    // Strictly ranked, and not all identical.
    for (let i = 1; i < ms.length; i++) {
      expect(ms[i]!.score).toBeLessThanOrEqual(ms[i - 1]!.score);
    }
    expect(new Set(ms.map((m) => m.score)).size).toBeGreaterThan(1);
    // And they are different DAYS, not the same day at different hours.
    expect(new Set(ms.map((m) => m.day.toISOString().slice(0, 10))).size).toBe(5);
  });
});
