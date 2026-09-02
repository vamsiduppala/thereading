// Grading a Mahapurusha yoga against BPHS 75.1's third condition.
//
// The assertion that matters is `an incomplete Shadbala is never graded weak`. A partial total
// is systematically low, so grading it "weak" would fail yogas that should hold — silently, and
// always in the same direction.

import { describe, it, expect } from 'vitest';
import {
  gradeMahapurusha, BALIBHIH_IS_A_CONDITION, YOGA_IS_GRADED_NOT_DELETED,
  REAL_RATE_JUSTIFIES_THE_CONDITION, SHADBALA_INPUTS_STILL_MISSING,
  SHADBALA_REQUIRED, type ShadbalaPlanetResult,
} from '../src/index.js';

const result = (graha: 'mars', total: number, complete: boolean): ShadbalaPlanetResult => ({
  graha,
  components: { sthana: 1, dig: 1, kala: 1, cheshta: complete ? 1 : null, naisargika: 1, drik: 1 },
  total,
  complete,
  missing: complete ? [] : ['cheshta'],
});

describe('BPHS 75.1 — the third condition', () => {
  it('confirms the yoga when the placement holds and the strength is met', () => {
    const r = gradeMahapurusha('mars', true, result('mars', SHADBALA_REQUIRED['mars']! + 40, true));
    expect(r.grade).toBe('confirmed');
    expect(r.shadbala).toBe('very-strong');
  });

  it('keeps the reading but marks it weak when the strength falls short', () => {
    // The yoga is NOT deleted — 27.32-33's own gradation is used instead.
    const r = gradeMahapurusha('mars', true, result('mars', SHADBALA_REQUIRED['mars']! - 40, true));
    expect(r.grade).toBe('present-but-weak');
    expect(r.summary).toContain('The configuration is real');
    expect(YOGA_IS_GRADED_NOT_DELETED).toContain('does NOT lose the reading');
  });

  it('an incomplete Shadbala is never graded weak', () => {
    // Below the threshold on partial data — but partial data cannot say that.
    const r = gradeMahapurusha('mars', true, result('mars', SHADBALA_REQUIRED['mars']! - 200, false));
    expect(r.grade).toBe('strength-not-assessed');
    expect(r.shadbala).toBe('unknown');
    expect(r.grade).not.toBe('present-but-weak');
    expect(r.missing).toContain('cheshta');
  });

  it('treats no Shadbala at all the same way — not assessed, not denied', () => {
    const r = gradeMahapurusha('mars', true);
    expect(r.grade).toBe('strength-not-assessed');
    expect(r.summary).toContain('not assessed rather than assumed');
  });

  it('reports no yoga when the placement itself is absent', () => {
    const r = gradeMahapurusha('mars', false, result('mars', 999, true));
    expect(r.placement).toBe(false);
    expect(r.summary).toContain('no yoga arises');
  });
});

describe('why the condition is enforced', () => {
  it('rests on grammar plus two independent root texts', () => {
    expect(BALIBHIH_IS_A_CONDITION).toContain('CA coordinates');
    expect(BALIBHIH_IS_A_CONDITION).toContain('INDEPENDENT ROOT TEXTS');
    expect(BALIBHIH_IS_A_CONDITION).toContain('Saravali');
  });

  it('discards the synthetic 21.4% in favour of the real ~35%', () => {
    expect(REAL_RATE_JUSTIFIES_THE_CONDITION).toContain('~35%');
    expect(REAL_RATE_JUSTIFIES_THE_CONDITION).toContain('wrong by 65%');
    expect(REAL_RATE_JUSTIFIES_THE_CONDITION).toContain('is NOT used');
  });

  it('costs the remaining work rather than hand-waving it', () => {
    for (const s of ['ŚĪGHROCCA', 'tribhaga', 'hora lord', 'Drik bala', '±225 virupas']) {
      expect(SHADBALA_INPUTS_STILL_MISSING, s).toContain(s);
    }
  });
});
