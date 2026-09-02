// The request shape is what makes custom formats possible without a capability per phrasing.
//
// It exists because "rate my months for getting a job from aug 2026 - aug 2027" came back as
// the generic four-section reading. The tempting fix was a `timing.monthly` capability — which
// answers that one sentence and leaves "rate each week", "best three quarters" and "day by day"
// broken in exactly the same way. A registry can only ever offer what somebody thought to write.
//
// So the shape is PARSED: granularity, ordering, cut-off. This suite is the guard on two
// opposite failures, and the second is the easy one to forget:
//
//   1. a request that names a format does not get it, and
//   2. a request that names NO format gets a table of months anyway, because a regex was
//      loose enough to fire on ordinary prose ("every time I try", "in summary to date").
//
// A parser that says yes to everything is not better than the registry it replaced.

import { describe, it, expect } from 'vitest';
import { readShape, readRange } from '../src/ai/shape.js';

describe('readShape — granularity', () => {
  it('reads the unit the person asked in', () => {
    expect(readShape('rate my months for getting a job').unit).toBe('month');
    expect(readShape('score every week for the next while').unit).toBe('week');
    expect(readShape('break it down day by day').unit).toBe('day');
    expect(readShape('rank the quarters for me').unit).toBe('quarter');
    expect(readShape('rate the years ahead').unit).toBe('year');
    expect(readShape('list the phases').unit).toBe('period');
  });

  it('leaves the unit null when none was named', () => {
    // Null, not a default. A default here is how a question about nothing in particular
    // acquires a table of months.
    expect(readShape('when will I get a job').unit).toBeNull();
    expect(readShape('why is my work blocked').unit).toBeNull();
    expect(readShape('are you there?').unit).toBeNull();
  });
});

describe('readShape — ordering and cut-off', () => {
  it('ranks best-first when the question asks for the best', () => {
    const s = readShape('which months are best for a job');
    expect(s.ordering).toBe('best-first');
  });

  it('ranks worst-first when the question asks what to avoid', () => {
    expect(readShape('which months should I avoid').ordering).toBe('worst-first');
    expect(readShape('what are the weakest months').ordering).toBe('worst-first');
  });

  it('stays chronological when the question asks for both', () => {
    // "best and worst months" wants to see the range, and date order shows a range better
    // than either ranking does.
    expect(readShape('show me the best and worst months').ordering).toBe('chronological');
  });

  it('stays chronological when neither is named', () => {
    expect(readShape('rate my months').ordering).toBe('chronological');
  });

  it('reads a cut-off in digits and in words', () => {
    expect(readShape('top 3 months for a job').limit).toBe(3);
    expect(readShape('best five weeks ahead').limit).toBe(5);
    expect(readShape('give me the worst 4 months').limit).toBe(4);
  });

  it('leaves the cut-off null when none was named', () => {
    expect(readShape('rate my months').limit).toBeNull();
  });
});

describe('readShape — wantsSeries is the guard, not a suggestion', () => {
  it('fires on a named unit or a named format', () => {
    for (const q of [
      'rate my months for getting a job from aug 2026 - aug 2027',
      'month by month please',
      'give me a table for work',
      'compare the quarters',
      'percentages for each month',
      'break it down by week',
    ]) {
      expect(readShape(q).wantsSeries, q).toBe(true);
    }
  });

  it('does NOT fire on ordinary prose that merely contains a trigger word', () => {
    // Each of these once would have produced a table of months. `every time`, in particular,
    // is why bare "each"/"every" is not a series word: the unit patterns already catch
    // "each month", where the word actually means it.
    for (const q of [
      'every time I try for a job it falls through',
      'are you there?',
      'why is my work so blocked',
      'what does dasha mean',
      'will I get married',
      'is this a good time to move',
    ]) {
      expect(readShape(q).wantsSeries, q).toBe(false);
    }
  });
});

describe('readRange — a range written into the question wins', () => {
  const now = new Date('2026-08-26T00:00:00Z');

  it('reads "aug 2026 - aug 2027" as thirteen inclusive months', () => {
    const r = readRange('rate my months for getting a job from aug 2026 - aug 2027', now)!;
    expect(r).not.toBeNull();
    expect(r.from.toISOString().slice(0, 10)).toBe('2026-08-01');
    // Through the END of August 2027, not its first day.
    expect(r.to.toISOString().slice(0, 10)).toBe('2027-08-31');
    expect(r.label).toBe('August 2026 to August 2027');
  });

  it('carries the year forward when only one is written', () => {
    const r = readRange('compare november to february', now)!;
    expect(r.from.getUTCFullYear()).toBe(2026);
    expect(r.to.getUTCFullYear()).toBe(2027);
  });

  it('reads a relative range', () => {
    const r = readRange('rate the next 8 months', now)!;
    expect(r.label).toBe('the next 8 months');
    expect(r.to.getUTCMonth()).toBe(3); // August + 8 = April
    expect(r.to.getUTCFullYear()).toBe(2027);
  });

  it('reads a bare year', () => {
    const r = readRange('how is 2027 looking', now)!;
    expect(r.from.toISOString().slice(0, 10)).toBe('2027-01-01');
    expect(r.to.toISOString().slice(0, 10)).toBe('2027-12-31');
  });

  it('returns null when no range was written, so the caller default stands', () => {
    expect(readRange('when will I get a job', now)).toBeNull();
    expect(readRange('why is my work blocked', now)).toBeNull();
  });

  it('does not read a month out of the middle of another word', () => {
    // Without a leading word boundary, "mar" matches inside "summary" and this parses as a
    // date range from March to June.
    expect(readRange('give me a summary to explain it', now)).toBeNull();
  });
});
