// An adverse Atmakaraka — Jaimini's definition, filling a gap BPHS leaves.
//
// The assertion that earns its place is `an unsupplied dignity is unknown, not favourable`.
// The AK's verdict caps every other karaka's contribution, so guessing favourable would lift a
// cap across the whole reading rather than mis-fire a single rule.

import { describe, it, expect } from 'vitest';
import {
  assessAtmakaraka, adverseAtmakarakaPredicates, atmakarakaRescuePredicates,
  ADVERSE_AK_MALEFICS, ADVERSE_AK_RESCUERS, ADVERSE_AK_DIGNITIES,
  ADVERSE_AK_IS_JAIMINI_NOT_BPHS, ADVERSE_AK_NEEDED_THE_VARGA_FRAME,
  AK_UNKNOWN_IS_NOT_FAVOURABLE, ATMAKARAKA_PRECEDENCE,
} from '../src/index.js';

describe('Jaimini’s three clauses', () => {
  it('reads a debilitated AK touched by a malefic as adverse', () => {
    const r = assessAtmakaraka({
      graha: 'venus',
      navamsaDignity: 'debilitated',
      maleficsTouching: ['saturn'],
      beneficsTouching: [],
    });
    expect(r.verdict).toBe('adverse');
    expect(r.clauses).toEqual({ badDignity: true, maleficTouch: true, beneficRescue: false });
  });

  it('needs BOTH the bad dignity and the malefic touch', () => {
    // Bad dignity alone is not adverse.
    expect(assessAtmakaraka({
      graha: 'venus', navamsaDignity: 'enemy', maleficsTouching: [], beneficsTouching: [],
    }).verdict).toBe('favourable');
    // A malefic touch alone is not adverse either.
    expect(assessAtmakaraka({
      graha: 'venus', navamsaDignity: 'own', maleficsTouching: ['mars'], beneficsTouching: [],
    }).verdict).toBe('favourable');
  });

  it('keeps "rescued" distinct from "favourable"', () => {
    // A benefic cancelling an otherwise-adverse AK is not the same as one never adverse, and
    // collapsing the two would discard what the third clause is for.
    const r = assessAtmakaraka({
      graha: 'venus',
      navamsaDignity: 'debilitated',
      maleficsTouching: ['rahu'],
      beneficsTouching: ['jupiter'],
    });
    expect(r.verdict).toBe('rescued');
    expect(r.verdict).not.toBe('favourable');
    expect(r.clauses.beneficRescue).toBe(true);
  });

  it('an unsupplied dignity is unknown, not favourable', () => {
    const r = assessAtmakaraka({
      graha: 'venus', navamsaDignity: null, maleficsTouching: ['saturn'], beneficsTouching: [],
    });
    expect(r.verdict).toBe('unknown');
    expect(r.verdict).not.toBe('favourable');
    expect(r.summary).toContain('lifts a cap on every other karaka');
    expect(AK_UNKNOWN_IS_NOT_FAVOURABLE).toContain('CAPS every other');
  });

  it('uses Jaimini’s planet sets, not a general benefic/malefic split', () => {
    // The nodes count as malefics here; the Sun and Mercury do not appear at all.
    expect(ADVERSE_AK_MALEFICS.sort()).toEqual(['ketu', 'mars', 'rahu', 'saturn']);
    expect(ADVERSE_AK_MALEFICS).not.toContain('sun');
    expect(ADVERSE_AK_RESCUERS.sort()).toEqual(['jupiter', 'venus']);
    expect(ADVERSE_AK_DIGNITIES.sort()).toEqual(['debilitated', 'enemy']);
  });
});

describe('as predicates, read in the navamsa', () => {
  it('places every clause inside the D9 frame', () => {
    // The karakamsa is a D9 position; testing it in the rasi chart would be a different claim.
    for (const p of adverseAtmakarakaPredicates('venus')) {
      expect(p.k).toBe('inFrame');
      expect((p as { frame: { varga: number } }).frame).toEqual({ varga: 9 });
    }
    for (const p of atmakarakaRescuePredicates('venus')) {
      expect(p.k).toBe('inFrame');
    }
  });

  it('expresses the rescue as a cancellation, because that is what it is', () => {
    // Jaimini's third clause removes the adversity rather than weighing against it, so it
    // belongs in `unless` — which is what these predicates are shaped for.
    const rescue = atmakarakaRescuePredicates('venus');
    expect(rescue).toHaveLength(1);
    expect((rescue[0] as { op?: string }).op).toBe('or');
  });

  it('could not have been written before the varga frame existed', () => {
    expect(ADVERSE_AK_NEEDED_THE_VARGA_FRAME).toContain('inFrame');
    expect(ADVERSE_AK_NEEDED_THE_VARGA_FRAME).toContain('Part 29');
  });
});

describe('provenance', () => {
  it('labels the definition as Jaimini’s, not BPHS’s', () => {
    expect(ADVERSE_AK_IS_JAIMINI_NOT_BPHS).toContain('JAIMINI’S, not BPHS’s');
    expect(ADVERSE_AK_IS_JAIMINI_NOT_BPHS).toContain('ROOT TEXT OF A DIFFERENT SCHOOL');
    // And says why the obvious BPHS answer was the wrong one to reach for.
    expect(ADVERSE_AK_IS_JAIMINI_NOT_BPHS).toContain('ch 34 defines adversity by LORDSHIP');
  });

  it('is the cap BPHS 32.9-12 asked for and left undefined', () => {
    expect(ATMAKARAKA_PRECEDENCE).toContain('needs a definition of an "adverse" Atmakaraka');
    expect(ATMAKARAKA_PRECEDENCE).toContain('CAPS evidence rather than ranking it');
  });
});
