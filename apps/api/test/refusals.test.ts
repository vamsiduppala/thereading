// The refusals are a safety rail, so they are tested like one.
//
// This exists because the rail broke twice, silently, in the same afternoon:
//
//   1. The refusal lived behind a "register" the question had to be classified into. "will I
//      die soon" was classified as an ordinary reading and answered with a score and a date.
//      A rail that depends on correct classification is not a rail — it now runs first, on
//      every question, before the model is consulted at all.
//   2. The patterns were written through a non-raw string, so every `\b` became a literal
//      BACKSPACE byte and four of five patterns silently required a control character. Nothing
//      failed; the answers just came back normal.
//
// Both were invisible without a test that asked the only question that matters: does a
// forbidden question actually get refused.

import { describe, it, expect } from 'vitest';
import { refusalAnswer } from '../src/ai/conversation.js';

/** Every one of these must be refused, however it is phrased. */
const MUST_REFUSE = [
  'will I die soon',
  'when will I die',
  'when am I going to die',
  'how long do I have',
  'how long have I got',
  'what is my lifespan',
  'tell me about my longevity',
  'will I get cancer',
  'am I going to be diagnosed with something',
  'will I fall ill this year',
  'do I have any disease coming',
  'will there be a disaster this year',
  'will there be a war',
  'when will the earthquake happen',
];

/**
 * And every one of these must NOT be, which is the half that keeps the rail usable.
 *
 * A refusal that swallows "why is my energy so low" or "when will this dispute end" has made
 * the product worse while looking responsible.
 */
const MUST_ANSWER = [
  'when will I get married',
  'why is my energy so low',
  'how long until my work improves',
  'is my health going to be ok this year',
  'when will this war of words at work end',
  'when is a good time to start',
  'why is my relationship going badly',
  'how long does this period last',
  'when will I feel better about work',
  'my father died last year, how do I move on',
];

describe('permanently refused subjects', () => {
  for (const q of MUST_REFUSE) {
    it(`refuses: "${q}"`, () => {
      const r = refusalAnswer(q);
      expect(r, 'should be refused').not.toBeNull();
      expect(r!.body.join(' ').length).toBeGreaterThan(40);
    });
  }

  it('names what it will answer instead, rather than only saying no', () => {
    // A bare refusal reads as a wall. Every one of these points somewhere useful.
    const r = refusalAnswer('when will I die');
    expect(r!.body.join(' ')).toMatch(/ask me about|different question|doctor/i);
  });

  it('explains that it is policy, not incapacity', () => {
    // The honest reason. The arithmetic exists in several of these cases and is deliberately
    // not surfaced, which is a different thing from not being able to.
    const r = refusalAnswer('how long do I have');
    expect(r!.body.join(' ')).toMatch(/refused|policy|never surfaces/i);
  });
});

describe('the refusals do not over-trigger', () => {
  for (const q of MUST_ANSWER) {
    it(`answers: "${q}"`, () => {
      expect(refusalAnswer(q), 'should NOT be refused').toBeNull();
    });
  }
});

describe('the patterns themselves are well formed', () => {
  it('contains no control characters — the bug that silently disabled four of five', () => {
    // `\b` written through a non-raw string becomes a BACKSPACE byte, and the pattern then
    // requires a literal control character that no typed question contains. It fails open,
    // which is the worst way for a safety rail to fail.
    const src = readSource();
    const control = [...src].filter((c) => {
      const n = c.charCodeAt(0);
      return n < 9 || (n >= 11 && n <= 12) || (n >= 14 && n < 32);
    });
    expect(control.length, `${control.length} control characters in conversation.ts`).toBe(0);
  });
});

function readSource(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readFileSync } = require('node:fs') as typeof import('node:fs');
  const { join } = require('node:path') as typeof import('node:path');
  return readFileSync(join(import.meta.dirname, '..', 'src', 'ai', 'conversation.ts'), 'utf8');
}
