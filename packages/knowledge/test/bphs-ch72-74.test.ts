// BPHS Programme Part 18 — Chapters 72, 73 and 74. The last of Phase II.

import { describe, it, expect } from 'vitest';
import {
  SAMUDAYA_FAVOURABLE_ABOVE, SAMUDAYA_ADVERSE_BELOW, samudayaBand,
  SAMUDAYA_THRESHOLDS_ARE_THE_TEXTS, SAV_MEAN_PER_SIGN,
  prosperityConfiguration, LIFE_STAGES, lifeStageOfHouse, stageVerdict,
  AV_OUTRANKS_TRANSIT, CH72_UNSURFACED,
  RAYS_AT_EXALTATION, RAYS_TOTAL_MAX, RAYS_VS_CH28_RASMI, planetRays,
  RAY_DIGNITY_FACTOR, correctedRays, COMBUST_BECOMES_RAYLESS,
  COMBUSTION_EXEMPTION_NOTE, raysAfterCombustion,
  rayCapacityBand, RAYS_ABOVE_BASE_MAX, CH73_EXCLUDED,
  SUDARSHANA_FRAMES, sudarshanaSigns, sudarshanaAgreement, majorityInfluence,
  SUN_BENEFIC_IN_FIRST_ONLY, SUDARSHANA_MITIGATIONS, EMPTY_HOUSE_FALLBACK,
  CH72_74_NOT_YET_EXPRESSIBLE, CH72_74_SUMMARY,
  exaltationCloseness, rasmiFromBala, CLASSICAL_SEVEN,
  type House, type SignIndex,
} from '../src/index.js';

// ── Chapter 72 ───────────────────────────────────────────────────────────────
describe('BPHS 72 — the aggregate ashtakavarga', () => {
  it('uses the thresholds the text names', () => {
    expect(SAMUDAYA_FAVOURABLE_ABOVE).toBe(30);
    expect(SAMUDAYA_ADVERSE_BELOW).toBe(25);
    expect(samudayaBand(31)).toBe('favourable');
    expect(samudayaBand(28)).toBe('medium');
    expect(samudayaBand(24)).toBe('adverse');
  });

  it('treats the boundaries themselves as medium', () => {
    expect(samudayaBand(30)).toBe('medium');
    expect(samudayaBand(25)).toBe('medium');
  });

  it('is monotone across the whole plausible range', () => {
    const order = { adverse: 0, medium: 1, favourable: 2 };
    let last = -1;
    for (let r = 0; r <= 56; r++) {
      const v = order[samudayaBand(r)];
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
  });

  it('puts the mean of 337/12 inside the medium band, not at its centre', () => {
    expect(SAV_MEAN_PER_SIGN).toBeCloseTo(28.083, 3);
    expect(samudayaBand(Math.round(SAV_MEAN_PER_SIGN))).toBe('medium');
    // Not the midpoint of 25 and 30 — worth asserting so nobody "corrects" it.
    expect(SAV_MEAN_PER_SIGN).not.toBeCloseTo(27.5, 3);
  });

  it('marks these thresholds as the text’s, unlike ch 70’s', () => {
    expect(SAMUDAYA_THRESHOLDS_ARE_THE_TEXTS).toContain('should not be tuned away');
  });

  it('recognises 72.7-8’s prosperity configuration', () => {
    // Lagna Aries. 1st highest, 11th > 10th, 12th < 11th.
    const sav = new Array(12).fill(20) as number[];
    sav[0] = 40;   // lagna
    sav[9] = 26;   // 10th
    sav[10] = 34;  // 11th
    sav[11] = 22;  // 12th
    expect(prosperityConfiguration(sav, 0 as SignIndex)).toBe(true);
  });

  it('rejects it when the 11th does not beat the 10th', () => {
    const sav = new Array(12).fill(20) as number[];
    sav[0] = 40; sav[9] = 36; sav[10] = 30; sav[11] = 22;
    expect(prosperityConfiguration(sav, 0 as SignIndex)).toBe(false);
  });

  it('rejects it when the lagna is not the highest', () => {
    const sav = new Array(12).fill(20) as number[];
    sav[0] = 30; sav[9] = 26; sav[10] = 34; sav[11] = 22;
    expect(prosperityConfiguration(sav, 0 as SignIndex)).toBe(false);
  });

  it('splits the twelve houses into three life stages, covering all of them', () => {
    const all = [...LIFE_STAGES.early, ...LIFE_STAGES.middle, ...LIFE_STAGES.later];
    expect(new Set(all).size).toBe(12);
    expect(lifeStageOfHouse(1)).toBe('early');
    expect(lifeStageOfHouse(7)).toBe('middle');
    expect(lifeStageOfHouse(12)).toBe('later');
  });

  it('reads a stage by the weight of benefics against malefics', () => {
    expect(stageVerdict(3, 1)).toBe('supported');
    expect(stageVerdict(1, 3)).toBe('testing');
    expect(stageVerdict(2, 2)).toBe('mixed');
  });

  it('records the precedence rule Part 19 should cite', () => {
    expect(AV_OUTRANKS_TRANSIT).toContain('paramount');
    expect(AV_OUTRANKS_TRANSIT).toContain('27.37-38');
  });

  it('keeps the danger-month and its charity remedy off the surface', () => {
    expect(CH72_UNSURFACED.join(' ')).toContain('charity remedy');
  });
});

// ── Chapter 73 ───────────────────────────────────────────────────────────────
describe('BPHS 73 — the rays, which are the fold again', () => {
  it('matches the verse: 10, 9, 5, 5, 7, 8, 5', () => {
    expect(CLASSICAL_SEVEN.map((g) => RAYS_AT_EXALTATION[g]))
      .toEqual([10, 9, 5, 5, 7, 8, 5]);
    expect(RAYS_TOTAL_MAX).toBe(49);
  });

  it('is zero at deep debilitation and maximal at deep exaltation', () => {
    expect(planetRays(190, 190, 10)).toBe(0);
    expect(planetRays(10, 190, 10)).toBeCloseTo(10, 9);
  });

  it('IS exaltationCloseness scaled by the planet’s maximum', () => {
    // The seventh distinct purpose the same folded arc has been put to.
    for (let lon = 0; lon < 360; lon += 13) {
      expect(planetRays(lon, 190, 10)).toBeCloseTo(exaltationCloseness('sun', lon)! * 10, 6);
    }
  });

  it('reproduces the chapter’s Venus example — arc 143.0672° gives 6.359 rays', () => {
    const rays = planetRays(320.0672, 177, 8);
    expect(rays).toBeCloseTo(6.359, 2);
  });

  it('stays within 0 and the maximum for every longitude', () => {
    for (const [g, max] of Object.entries(RAYS_AT_EXALTATION)) {
      for (let lon = 0; lon < 360; lon += 7) {
        const r = planetRays(lon, 190, max);
        expect(r, g).toBeGreaterThanOrEqual(0);
        expect(r, g).toBeLessThanOrEqual(max + 1e-9);
      }
    }
  });

  it('is NOT chapter 28’s rasmi — they disagree at the debilitation point', () => {
    // ch 28: a planet at deep debilitation has ONE rasmi. ch 73: it has ZERO rays.
    expect(rasmiFromBala(0)).toBe(1);
    expect(planetRays(190, 190, 10)).toBe(0);
    expect(RAYS_VS_CH28_RASMI).toContain('Do not merge');
  });

  it('applies the multiplicative dignity ladder the verse gives', () => {
    expect(RAY_DIGNITY_FACTOR.exalted).toBe(3);
    expect(RAY_DIGNITY_FACTOR.moolatrikona).toBe(2);
    expect(RAY_DIGNITY_FACTOR.own).toBeCloseTo(1.5, 9);
    expect(RAY_DIGNITY_FACTOR['great-friend']).toBeCloseTo(4 / 3, 9);
    expect(RAY_DIGNITY_FACTOR.friend).toBeCloseTo(1.2, 9);
    expect(RAY_DIGNITY_FACTOR.neutral).toBe(1);
    expect(RAY_DIGNITY_FACTOR.enemy).toBe(0.5);
    expect(RAY_DIGNITY_FACTOR['great-enemy']).toBeCloseTo(0.4, 9);
  });

  it('descends strictly through the ladder', () => {
    const order = ['exalted', 'moolatrikona', 'own', 'great-friend', 'friend', 'neutral', 'enemy', 'great-enemy'];
    for (let i = 1; i < order.length; i++) {
      expect(RAY_DIGNITY_FACTOR[order[i]!]!, order[i]).toBeLessThan(RAY_DIGNITY_FACTOR[order[i - 1]!]!);
    }
  });

  it('reproduces the chapter’s worked corrections', () => {
    // Jupiter 1.5 rays in a friend's sign → 1.8, printed as 1/48 in sixtieths.
    expect(correctedRays(1.5, 'friend')).toBeCloseTo(1.8, 9);
    // Saturn 4.35 in a great enemy's sign → 1.74, printed 1/44.
    expect(correctedRays(4.35, 'great-enemy')).toBeCloseTo(1.74, 9);
    // Mercury 0.85 in a friend's sign → 1.02, printed 1/1.
    expect(correctedRays(0.85, 'friend')).toBeCloseTo(1.02, 9);
  });

  it('leaves rays untouched for an unknown dignity rather than zeroing them', () => {
    expect(correctedRays(5, 'nonsense')).toBe(5);
  });

  it('makes the tara-grahas rayless when combust, exempting Venus and Saturn', () => {
    expect(raysAfterCombustion('mars', 5, true)).toBe(0);
    expect(raysAfterCombustion('mercury', 5, true)).toBe(0);
    expect(raysAfterCombustion('jupiter', 5, true)).toBe(0);
    expect(raysAfterCombustion('venus', 5, true)).toBe(5);
    expect(raysAfterCombustion('saturn', 5, true)).toBe(5);
    expect(COMBUST_BECOMES_RAYLESS).toHaveLength(3);
    expect(COMBUSTION_EXEMPTION_NOTE).toContain('without saying why');
  });

  it('bands total rays on a rising capacity scale', () => {
    expect(rayCapacityBand(5)).toBe('minimal');
    expect(rayCapacityBand(30)).toBe('moderate');
    expect(rayCapacityBand(60)).toBe('exceptional');
  });

  it('makes the top band reachable only through the dignity multipliers', () => {
    expect(rayCapacityBand(RAYS_TOTAL_MAX)).not.toBe('exceptional');
    expect(RAYS_ABOVE_BASE_MAX).toContain('unreachable without');
  });

  it('excludes the effects table’s judgements and the caste conditioning', () => {
    expect(CH73_EXCLUDED).toHaveLength(2);
    expect(CH73_EXCLUDED.join(' ')).toContain('caste');
  });
});

// ── Chapter 74 ───────────────────────────────────────────────────────────────
describe('BPHS 74 — the Sudarshana chakra', () => {
  it('reads three frames', () => {
    expect(SUDARSHANA_FRAMES).toEqual(['lagna', 'moon', 'sun']);
  });

  it('resolves the same house in all three', () => {
    const s = sudarshanaSigns(4 as House, 0 as SignIndex, 3 as SignIndex, 8 as SignIndex);
    expect(s.lagna).toBe(3);
    expect(s.moon).toBe(6);
    expect(s.sun).toBe(11);
  });

  it('puts the 1st house on each reference itself', () => {
    const s = sudarshanaSigns(1 as House, 5 as SignIndex, 2 as SignIndex, 9 as SignIndex);
    expect([s.lagna, s.moon, s.sun]).toEqual([5, 2, 9]);
  });

  it('wraps correctly past Pisces', () => {
    const s = sudarshanaSigns(12 as House, 11 as SignIndex, 11 as SignIndex, 11 as SignIndex);
    expect([s.lagna, s.moon, s.sun]).toEqual([10, 10, 10]);
  });

  it('counts agreement across the frames — the confidence signal', () => {
    expect(sudarshanaAgreement([true, true, true])).toMatchObject({
      agreeing: 3, unanimous: true, verdict: 'supported',
    });
    expect(sudarshanaAgreement([true, true, false]).verdict).toBe('supported');
    expect(sudarshanaAgreement([true, false, false]).verdict).toBe('testing');
    expect(sudarshanaAgreement([false, false, false])).toMatchObject({
      agreeing: 0, unanimous: true, verdict: 'testing',
    });
  });

  it('calls unanimity in either direction unanimous', () => {
    // All three agreeing that a matter is NOT supported is just as strong a signal.
    expect(sudarshanaAgreement([false, false, false]).unanimous).toBe(true);
    expect(sudarshanaAgreement([true, false, true]).unanimous).toBe(false);
  });

  it('resolves a contested house by majority, as 74.11-13 does', () => {
    expect(majorityInfluence(3, 1)).toBe('auspicious');
    expect(majorityInfluence(1, 3)).toBe('inauspicious');
    expect(majorityInfluence(2, 2)).toBe('mixed');
  });

  it('keeps the Sun’s frame-local benefic rule from leaking', () => {
    expect(SUN_BENEFIC_IN_FIRST_ONLY).toContain('local to this chapter');
  });

  it('records both mitigations and the empty-house fallback', () => {
    expect(SUDARSHANA_MITIGATIONS).toHaveLength(2);
    expect(EMPTY_HOUSE_FALLBACK).toContain('no house is ever unreadable');
  });
});

describe('BPHS 72-74 — what is still inexpressible', () => {
  it('names the comparison gap 72.7-8 exposes', () => {
    expect(CH72_74_NOT_YET_EXPRESSIBLE[0]).toContain('not to another count');
  });

  it('summarises what each chapter contributes to Part 19', () => {
    expect(CH72_74_SUMMARY).toContain('OUTRANKS transit');
    expect(CH72_74_SUMMARY).toContain('confidence signal');
  });
});
