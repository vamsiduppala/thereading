// BPHS Programme Part 11 — Chapter 27c: Drik bala, graha yuddha, Cheshta for the
// tara-grahas, Bhava bala, and the thresholds that finally define "strong".

import { describe, it, expect } from 'vitest';
import {
  SHADBALA_SIX,
  drikBala, DRIK_BALA_AMBIGUITY,
  YUDDHA_PLANETS, grahaYuddha, YUDDHA_WINNER_NOTE,
  MOTION_STRENGTHS, MOTION_ORDER, motionStrength,
  cheshtaKendra, cheshtaBalaTara,
  bhavaReferenceAngle, bhavaDigBala, bhavaBala,
  SHADBALA_REQUIRED, isStrongByShadbala, shadbalaVerdict,
  COMPONENT_MINIMUMS, componentGroupOf, meetsComponentMinimums,
  STRONGEST_PLANET_DELIVERS, CH27_NOT_ENCODED,
  foldedArcBala, SHADBALA_PLANETS, VIRUPAS_PER_RUPA_27,
  type Graha, type MotionKind,
} from '../src/index.js';

// ── 27.19 Drik bala ──────────────────────────────────────────────────────────
describe('BPHS 27.19 — Drik bala', () => {
  it('quarters the net of benefic and malefic pindas', () => {
    expect(drikBala(80, 40)).toBe(10);
    expect(drikBala(40, 80)).toBe(-10);
    expect(drikBala(60, 60)).toBe(0);
  });

  it('adds Mercury’s and Jupiter’s aspects in full, not quartered', () => {
    expect(drikBala(0, 0, 40)).toBe(40);
    expect(drikBala(80, 40, 20)).toBe(30);
  });

  it('can go negative — a heavily afflicted planet loses aspectual strength', () => {
    expect(drikBala(0, 120)).toBeLessThan(0);
  });

  it('records the reading it chose and why another stays reachable', () => {
    expect(DRIK_BALA_AMBIGUITY).toContain('separately');
  });
});

// ── 27.20 Graha yuddha ───────────────────────────────────────────────────────
describe('BPHS 27.20 — planetary war', () => {
  it('is fought only between the tara-grahas, Mars to Saturn', () => {
    expect(YUDDHA_PLANETS).toHaveLength(5);
    expect(YUDDHA_PLANETS).not.toContain('sun');
    expect(YUDDHA_PLANETS).not.toContain('moon');
  });

  it('transfers the difference from the loser to the victor', () => {
    const r = grahaYuddha('mars', 'saturn', 300, 260);
    expect(r.transfer).toBe(40);
    expect(r.victorShadbala).toBe(340);
    expect(r.vanquishedShadbala).toBe(220);
  });

  it('conserves the total between the two', () => {
    const before = 300 + 260;
    const r = grahaYuddha('mars', 'saturn', 300, 260);
    expect(r.victorShadbala + r.vanquishedShadbala).toBe(before);
  });

  it('works when the victor started weaker — the verse fixes only the transfer', () => {
    const r = grahaYuddha('venus', 'jupiter', 200, 260);
    expect(r.transfer).toBe(60);
    expect(r.victorShadbala).toBe(260);
    expect(r.vanquishedShadbala).toBe(200);
  });

  it('records that BPHS never says who wins', () => {
    expect(YUDDHA_WINNER_NOTE).toContain('never says who wins');
    expect(YUDDHA_WINNER_NOTE).toContain('Commentary');
  });
});

// ── 27.21-23 The eight motions ───────────────────────────────────────────────
describe('BPHS 27.21-23 — the eight motions', () => {
  it('matches the verse: 60, 30, 15, 30, 15, 7.5, 45, 30', () => {
    expect(MOTION_ORDER.map((m) => MOTION_STRENGTHS[m]))
      .toEqual([60, 30, 15, 30, 15, 7.5, 45, 30]);
  });

  it('makes retrogression the strongest at a full rupa', () => {
    expect(MOTION_STRENGTHS.vakra).toBe(VIRUPAS_PER_RUPA_27);
    for (const m of MOTION_ORDER) {
      expect(MOTION_STRENGTHS[m]).toBeLessThanOrEqual(MOTION_STRENGTHS.vakra);
    }
  });

  it('makes ORDINARY motion the weakest — the counterintuitive part', () => {
    // Cheshta means effort; the scheme rewards unusual motion, not fast motion.
    expect(MOTION_STRENGTHS.sama).toBe(7.5);
    for (const m of MOTION_ORDER) {
      expect(MOTION_STRENGTHS[m], m).toBeGreaterThanOrEqual(MOTION_STRENGTHS.sama);
    }
  });

  it('names all eight and never exceeds one rupa', () => {
    expect(MOTION_ORDER).toHaveLength(8);
    for (const m of MOTION_ORDER) {
      expect(motionStrength(m)).toBeGreaterThan(0);
      expect(motionStrength(m)).toBeLessThanOrEqual(VIRUPAS_PER_RUPA_27);
    }
  });
});

// ── 27.24-25 Cheshta bala for the tara-grahas ────────────────────────────────
describe('BPHS 27.24-25 — Cheshta bala for Mars to Saturn', () => {
  it('takes the midpoint of mean and true longitude from the seeghrocha', () => {
    expect(cheshtaKendra(100, 120, 250)).toBe(140);
    expect(cheshtaKendra(10, 20, 5)).toBe(350);   // wraps
  });

  it('is the fifth user of the shared fold-and-divide-by-three', () => {
    const k = cheshtaKendra(100, 120, 250);
    expect(cheshtaBalaTara(100, 120, 250)).toBeCloseTo(foldedArcBala(k, 0), 9);
  });

  it('stays within 0..60 virupas for any inputs', () => {
    for (let m = 0; m < 360; m += 37) {
      for (let s = 0; s < 360; s += 53) {
        const v = cheshtaBalaTara(m, m + 5, s);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(VIRUPAS_PER_RUPA_27);
      }
    }
  });
});

// ── 27.26-29 Bhava bala ──────────────────────────────────────────────────────
describe('BPHS 27.26-29 — Bhava bala', () => {
  it('sends each sign to the angle the verse names', () => {
    expect(bhavaReferenceAngle(5, 10)).toBe('descendant');   // Virgo
    expect(bhavaReferenceAngle(2, 10)).toBe('descendant');   // Gemini
    expect(bhavaReferenceAngle(0, 10)).toBe('nadir');        // Aries
    expect(bhavaReferenceAngle(4, 10)).toBe('nadir');        // Leo
    expect(bhavaReferenceAngle(3, 10)).toBe('ascendant');    // Cancer
    expect(bhavaReferenceAngle(7, 10)).toBe('ascendant');    // Scorpio
    expect(bhavaReferenceAngle(11, 10)).toBe('meridian');    // Pisces
  });

  it('splits Sagittarius and Capricorn at their midpoints', () => {
    expect(bhavaReferenceAngle(8, 5)).toBe('descendant');    // Sag 1st half
    expect(bhavaReferenceAngle(8, 20)).toBe('nadir');        // Sag 2nd half
    expect(bhavaReferenceAngle(9, 5)).toBe('nadir');         // Cap 1st half
    expect(bhavaReferenceAngle(9, 20)).toBe('meridian');     // Cap 2nd half
  });

  it('assigns every sign to exactly one angle', () => {
    for (let s = 0; s < 12; s++) {
      for (const d of [5, 20]) {
        expect(['ascendant', 'nadir', 'descendant', 'meridian'])
          .toContain(bhavaReferenceAngle(s, d));
      }
    }
  });

  it('is the sixth user of the shared fold', () => {
    expect(bhavaDigBala(100, 250)).toBeCloseTo(foldedArcBala(100, 250), 9);
    expect(bhavaDigBala(100, 100)).toBe(0);
    expect(bhavaDigBala(280, 100)).toBe(60);
  });

  it('stacks the four adjustments the verse names', () => {
    const total = bhavaBala({
      positional: 40, beneficAspects: 40, maleficAspects: 20,
      mercuryJupiterAspect: 15, lordStrength: 100,
    });
    expect(total).toBe(40 + 10 - 5 + 15 + 100);
  });

  it('lets a malefic-heavy bhava lose ground', () => {
    const weak = bhavaBala({
      positional: 10, beneficAspects: 0, maleficAspects: 120,
      mercuryJupiterAspect: 0, lordStrength: 0,
    });
    expect(weak).toBeLessThan(0);
  });
});

// ── 27.32-36 The thresholds ──────────────────────────────────────────────────
describe('BPHS 27.32-36 — what "strong" finally means', () => {
  it('matches the verse: 390, 360, 300, 420, 390, 330, 300 for Sun to Saturn', () => {
    expect(SHADBALA_PLANETS.map((g) => SHADBALA_REQUIRED[g]))
      .toEqual([390, 360, 300, 420, 390, 330, 300]);
  });

  it('asks the most of Mercury and the least of Mars and Saturn', () => {
    expect(SHADBALA_REQUIRED.mercury).toBe(420);
    expect(Math.min(...Object.values(SHADBALA_REQUIRED))).toBe(300);
  });

  it('turns a number into a verdict', () => {
    expect(isStrongByShadbala('sun', 400)).toBe(true);
    expect(isStrongByShadbala('sun', 380)).toBe(false);
    expect(shadbalaVerdict('sun', 400)).toBe('very-strong');
    expect(shadbalaVerdict('sun', 390)).toBe('strong');
    expect(shadbalaVerdict('sun', 380)).toBe('weak');
  });

  it('declines to judge the nodes', () => {
    expect(isStrongByShadbala('rahu', 500)).toBeNull();
    expect(shadbalaVerdict('ketu', 500)).toBeNull();
  });

  it('groups the planets A/B/C for the per-component minimums', () => {
    expect(componentGroupOf('jupiter')).toBe('A');
    expect(componentGroupOf('moon')).toBe('B');
    expect(componentGroupOf('saturn')).toBe('C');
    const all = ([...COMPONENT_MINIMUMS.A.planets, ...COMPONENT_MINIMUMS.B.planets,
      ...COMPONENT_MINIMUMS.C.planets]);
    expect(new Set(all).size).toBe(7);
  });

  it('matches the verse’s per-component minimums for each group', () => {
    expect(COMPONENT_MINIMUMS.A).toMatchObject({ sthana: 165, dig: 35, kala: 50, cheshta: 112, ayana: 30 });
    expect(COMPONENT_MINIMUMS.B).toMatchObject({ sthana: 133, dig: 50, kala: 30, cheshta: 100, ayana: 40 });
    expect(COMPONENT_MINIMUMS.C).toMatchObject({ sthana: 96, dig: 30, kala: 40, cheshta: 67, ayana: 20 });
  });

  it('reports which minimums a planet meets and which it misses', () => {
    const r = meetsComponentMinimums('jupiter', {
      sthana: 200, dig: 20, kala: 60, cheshta: 120, ayana: 10,
    });
    expect(r.group).toBe('A');
    expect(r.met).toEqual(['sthana', 'kala', 'cheshta']);
    expect(r.short).toEqual(['dig', 'ayana']);
  });
});

// ── 27.37-40 and the gaps ────────────────────────────────────────────────────
describe('BPHS 27.37-40 — the arbitration principle, and what is not encoded', () => {
  it('states the text’s own arbitration rule', () => {
    expect(STRONGEST_PLANET_DELIVERS).toContain('STRONGEST');
  });

  it('names the six strengths as 27.25 restates them', () => {
    expect(SHADBALA_SIX).toHaveLength(6);
    expect([...SHADBALA_SIX].sort()).toEqual(
      ['cheshta', 'dig', 'drik', 'kala', 'naisargika', 'sthana'],
    );
  });

  it('records 39-40 as counsel rather than a chart rule', () => {
    expect(CH27_NOT_ENCODED['39-40']).toContain('No predicate');
  });

  it('records that verses 30-31 are absent from this edition', () => {
    expect(CH27_NOT_ENCODED['30-31']).toContain('Absent');
  });
});
