// The date-hallucination validator is the app's core guardrail (§4.7): every date the app
// shows is computed, and a model that invents one is worse than one that refuses ten.
//
// These tests are written against the exact shapes the Mentor actually produces — ISO
// instants in the grounding, prose dates and comma-grouped durations in the reply — because
// both bugs they pin shipped in a validator that had unit tests passing on tidy inputs.

import { describe, expect, it } from 'vitest';
import { dateTokens, durationTokens, groundedKeys, validateReply } from '../src/mentor/validate.js';

/** A tool result as `shapePeriod` actually emits it: ISO instants, not calendar dates. */
const GROUNDING = [
  JSON.stringify({
    ok: true,
    data: {
      at: '2026-08-03T12:00:00.000Z',
      offices: [
        {
          office: 'King', lordName: 'Venus',
          start: '2015-10-10T05:12:00.000Z', end: '2035-10-10T05:12:00.000Z',
          remainingDays: 3355.21,
        },
        {
          office: 'Governor', lordName: 'Saturn',
          start: '2026-04-18T02:00:00.000Z', end: '2026-09-19T14:00:00.000Z',
          remainingDays: 47.08,
        },
      ],
    },
  }),
];

describe('grounding an ISO instant', () => {
  // Regression: the pattern ended in `\b`, which cannot hold between the day's last digit
  // and the "T" of the time. Every tool result grounded exactly nothing, so every correct
  // date came back flagged — the guardrail cried wolf on 100% of good answers.
  it('reads a date out of an ISO instant, not just a bare calendar date', () => {
    expect(dateTokens('2026-08-14T09:00:00Z').map((t) => t.text)).toEqual(['2026-08-14']);
    expect(groundedKeys('start: 2026-08-14T09:00:00.000Z').has('2026-08-14')).toBe(true);
  });

  it('accepts prose dates that restate an ISO instant it was given', () => {
    const r = validateReply({
      reply: 'Your Venus King runs from October 10, 2015 until October 10, 2035, and your '
        + 'Saturn Governor holds until September 19, 2026.',
      grounding: GROUNDING,
      toolCalls: 1,
    });
    expect(r.violations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it('still catches a date that is in no tool result', () => {
    const r = validateReply({
      reply: 'Your next big shift lands on March 3, 2029.',
      grounding: GROUNDING,
      toolCalls: 1,
    });
    expect(r.ok).toBe(false);
    expect(r.violations[0]!.kind).toBe('invented_date');
    expect(r.violations[0]!.token).toBe('March 3, 2029');
  });
});

describe('durations', () => {
  // Regression: `\b` matched inside "3,355", so the token read "355 days" — a number in no
  // tool result — and a correctly quoted duration was reported as invented.
  it('reads a comma-grouped number whole', () => {
    expect(durationTokens('roughly 3,355 days remaining')).toEqual([
      { text: '3,355 days', value: 3355, unit: 'day' },
    ]);
  });

  it('accepts a duration that restates a grounded number, comma or not', () => {
    const r = validateReply({
      reply: 'That leaves about 3,355 days on the King and 47 days on the Governor.',
      grounding: GROUNDING,
      toolCalls: 1,
    });
    expect(r.violations).toEqual([]);
  });

  it('still catches an invented duration', () => {
    const r = validateReply({
      reply: 'You have about 900 days left on that.',
      grounding: GROUNDING,
      toolCalls: 1,
    });
    expect(r.ok).toBe(false);
    expect(r.violations[0]!.kind).toBe('invented_duration');
  });
});

describe('severity', () => {
  it("separates the user's own date from an invented one", () => {
    const r = validateReply({
      reply: 'Nothing in your chart changes on 15 August 2027.',
      grounding: GROUNDING,
      userText: 'what about 15 August 2027?',
      toolCalls: 1,
    });
    expect(r.violations[0]!.kind).toBe('echoed_date');
  });

  it('a date with no tool call at all is the unambiguous failure', () => {
    const r = validateReply({
      reply: 'Your Governor ends on September 19, 2026.',
      grounding: [],
      toolCalls: 0,
    });
    expect(r.ok).toBe(false);
    expect(r.violations[0]!.why).toContain('no tool calls at all');
  });
});
