// BPHS Programme Part 12, second half — chapters 29 (Bhava Padas), 30 (Upa Pada) and
// 31 (Argala).
//
// Most of this is verification of code that already existed. The chapters supply four
// worked examples between them, and every one is asserted here by name.

import { describe, it, expect } from 'vitest';
import {
  bhavaPada, PADA_EXCEPTION_RULE, PADA_NAMES, grahaPada, GRAHA_PADA_STRENGTH_NOTE,
  padaRelation, PADA_GAIN_HOUSE, PADA_LOSS_HOUSE, padaGainMagnitude, gainMeans,
  padaWealthRules,
  upapadaHouse, upapada, UPAPADA_CONVENTION_CONFLICT, UPAPADA_DETAIL_HOUSE,
  sunIsMaleficHere, upapadaRules,
  ARGALA_PAIRS, ARGALA_COUNTED_FROM, vipareetaArgala, VIPAREETA_ARGALA_HOUSE,
  argalaGrade, resolveArgala, argalaQuarterCancelled, quarterOf, QUARTER_DEGREES,
  ARGALA_TIMING, ARGALA_HOUSE_EFFECT, ARGALA_ROYAL_HOUSES, NODE_ARGALA_REVERSED,
  CH29_31_UNSURFACED, CH29_31_NOT_YET_EXPRESSIBLE, PADA_GRAHAS,
  arudhaOf, VIRODHARGALA, argalaOn, arity,
  type SignIndex, type House,
} from '../src/index.js';

const ARIES = 0, TAURUS = 1, GEMINI = 2, CANCER = 3, LEO = 4, VIRGO = 5;
const SCORPIO = 7, SAGITTARIUS = 8, AQUARIUS = 10, PISCES = 11;

// ── Chapter 29 ───────────────────────────────────────────────────────────────
describe('BPHS 29.2-3 — the pada construction, against the book’s own nativity', () => {
  it('reproduces the standard nativity: Scorpio lagna, Mars in Cancer → Pisces', () => {
    // "Scorpio is the ascendant and its lord Mars is 9 signs away and is in Cancer.
    // Hence we count 9 signs from Cancer and get Pisces."
    expect(bhavaPada(SCORPIO, CANCER)).toBe(PISCES);
  });

  it('agrees with the first corpus’s `arudhaOf` for all 144 sign pairs', () => {
    for (let h = 0; h < 12; h++) {
      for (let l = 0; l < 12; l++) {
        expect(bhavaPada(h as SignIndex, l as SignIndex), `${h}/${l}`).toBe(arudhaOf(h, l));
      }
    }
  });
});

describe('BPHS 29.4-5 — the two exceptions, against all three worked examples', () => {
  it('lord in its own house: Jupiter in Sagittarius → Virgo, the 10th', () => {
    expect(bhavaPada(SAGITTARIUS, SAGITTARIUS)).toBe(VIRGO);
  });

  it('lord in the 4th: Leo lagna, Sun in Scorpio → Scorpio itself', () => {
    // The verse's third clause is not a third exception — it falls out of the second.
    expect(bhavaPada(LEO, SCORPIO)).toBe(SCORPIO);
  });

  it('lord in the 7th: Aquarius lagna, Saturn in Leo → Scorpio, the 10th', () => {
    // The Sanskrit of 29.5 says "when the lord stands in the seventh, know the TENTH as
    // the pada". Santhanam's English note reaches Taurus, the 4th, contradicting the verse
    // he prints above it. We follow the verse; so does the existing `arudhaOf`.
    expect(bhavaPada(AQUARIUS, LEO)).toBe(SCORPIO);
    expect(bhavaPada(AQUARIUS, LEO)).not.toBe(TAURUS);
  });

  it('never lets a pada rest on its own bhava or the 7th from it', () => {
    for (let h = 0; h < 12; h++) {
      for (let l = 0; l < 12; l++) {
        const rel = (bhavaPada(h as SignIndex, l as SignIndex) - h + 12) % 12;
        expect(rel, `${h}/${l}`).not.toBe(0);
        expect(rel, `${h}/${l}`).not.toBe(6);
      }
    }
  });

  it('records which reading of 29.5 it took', () => {
    expect(PADA_EXCEPTION_RULE).toContain('Sanskrit of 29.5');
  });
});

describe('BPHS 29.6-7 — padas for planets', () => {
  it('uses the same construction with the roles swapped', () => {
    expect(grahaPada(CANCER, ARIES)).toBe(bhavaPada(CANCER, ARIES));
  });

  it('leaves the dual-lordship choice to the caller, and says why', () => {
    expect(GRAHA_PADA_STRENGTH_NOTE).toContain('STRONGER');
    expect(GRAHA_PADA_STRENGTH_NOTE).toContain('27.32-36');
  });

  it('reckons the nodes too — 29.7 names their co-lordships', () => {
    expect(PADA_GRAHAS).toContain('rahu');
    expect(PADA_GRAHAS).toContain('ketu');
    expect(PADA_GRAHAS).toHaveLength(9);
  });
});

describe('BPHS 29 — the twelve padas and their relations', () => {
  it('names all twelve as the chapter does', () => {
    expect(PADA_NAMES[1]).toBe('Lagna Pada');
    expect(PADA_NAMES[7]).toBe('Dara Pada');
    expect(PADA_NAMES[12]).toBe('Vyaya Pada');
    expect(Object.keys(PADA_NAMES)).toHaveLength(12);
  });

  it('classifies a pada relation the way 29.30-37 needs', () => {
    expect(padaRelation(ARIES, ARIES)).toBe('same');
    expect(padaRelation(ARIES, CANCER)).toBe('kendra');      // 4th
    expect(padaRelation(ARIES, LEO)).toBe('trikona');        // 5th
    expect(padaRelation(ARIES, VIRGO)).toBe('dusthana');     // 6th
    expect(padaRelation(ARIES, GEMINI)).toBe('upachaya');    // 3rd
  });

  it('calls the 6th a dusthana even though it is also an upachaya', () => {
    // Every rule in 29.30-37 treats the 6th as bad, so the dusthana test must win.
    expect(padaRelation(ARIES, VIRGO)).toBe('dusthana');
    expect(padaRelation(ARIES, AQUARIUS)).toBe('upachaya');  // 11th, no conflict
  });

  it('covers every one of the twelve positions', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 12; s++) seen.add(padaRelation(ARIES, s as SignIndex));
    expect(seen.has('other')).toBe(true);   // the 2nd — named by neither group
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });
});

describe('BPHS 29.8-22 — gains and outgoings from the Lagna Pada', () => {
  it('reads gains from the 11th and outgoings from the 12th', () => {
    expect(PADA_GAIN_HOUSE).toBe(11);
    expect(PADA_LOSS_HOUSE).toBe(12);
  });

  it('grades the quantum by the number of planets, as 29.13 does', () => {
    expect(padaGainMagnitude(0)).toBe('none');
    expect(padaGainMagnitude(1)).toBe('limited');
    expect(padaGainMagnitude(2)).toBe('medium');
    expect(padaGainMagnitude(4)).toBe('great');
  });

  it('distinguishes the channel wealth arrives through, as 29.8-11 does', () => {
    expect(gainMeans(true, false)).toContain('conventional');
    expect(gainMeans(false, true)).toContain('irregular');
    expect(gainMeans(true, true)).toContain('both');
    expect(gainMeans(false, false)).toContain('no clear channel');
  });

  it('models 29.12 as a cancellation, not a condition', () => {
    const r = padaWealthRules().find((x) => x.id === 'bphs.29.012.uninterrupted-gains')!;
    expect(r.unless).toBeDefined();
    expect(r.unless).toHaveLength(1);
    expect(arity(r)).toBe(1);
  });

  it('reads its pada rules from the arudha, not the natal lagna', () => {
    for (const r of padaWealthRules()) {
      for (const p of r.when) {
        if (p.k === 'placement') expect(p.from).toBe('arudha');
      }
    }
  });
});

// ── Chapter 30 ───────────────────────────────────────────────────────────────
describe('BPHS 30.1-6 — the Upapada, and the convention BPHS actually uses', () => {
  it('reproduces the worked example: Scorpio lagna, Jupiter in Cancer → Aquarius', () => {
    // "The ascendant is Scorpio, an even sign. Its 2nd house is Sagittarius whose lord
    // Jupiter is 8 signs away. We count 8 signs from Jupiter (in Cancer) and reach
    // Aquarius, which is the Upa Pada."
    const r = upapada(SCORPIO, CANCER);
    expect(r.house).toBe(2);
    expect(r.sign).toBe(AQUARIUS);
  });

  it('takes the 2nd for an even ascendant and the 12th for an odd one', () => {
    expect(upapadaHouse(SCORPIO)).toBe(2);      // Scorpio is the 8th sign — even
    expect(upapadaHouse(ARIES)).toBe(12);       // Aries is the 1st — odd
    expect(upapadaHouse(TAURUS)).toBe(2);
    expect(upapadaHouse(GEMINI)).toBe(12);
  });

  it('keeps the twelfth-house convention reachable, since half of all charts differ', () => {
    expect(upapadaHouse(SCORPIO, 'twelfth')).toBe(12);
    expect(upapadaHouse(ARIES, 'twelfth')).toBe(12);
    for (let s = 0; s < 12; s++) expect(upapadaHouse(s as SignIndex, 'twelfth')).toBe(12);
  });

  it('the two conventions disagree for exactly the six even ascendants', () => {
    let differ = 0;
    for (let s = 0; s < 12; s++) {
      if (upapadaHouse(s as SignIndex) !== upapadaHouse(s as SignIndex, 'twelfth')) differ++;
    }
    expect(differ).toBe(6);
  });

  it('records the conflict and that the codebase has not been changed under it', () => {
    expect(UPAPADA_CONVENTION_CONFLICT).toContain('worked example');
    expect(UPAPADA_CONVENTION_CONFLICT).toContain('product decision');
  });
});

describe('BPHS 30.6-22 — what the chapter predicts from', () => {
  it('makes the Sun’s malefic status depend on its dignity', () => {
    expect(sunIsMaleficHere('debilitated')).toBe(true);
    expect(sunIsMaleficHere('enemy')).toBe(true);
    expect(sunIsMaleficHere('exalted')).toBe(false);
    expect(sunIsMaleficHere('friend')).toBe(false);
    expect(sunIsMaleficHere('own')).toBe(false);
  });

  it('predicts from the 2nd from the Upapada, not the Upapada alone', () => {
    expect(UPAPADA_DETAIL_HOUSE).toBe(2);
  });

  it('carries 30.5’s antidote as a structural cancellation', () => {
    const r = upapadaRules().find((x) => x.id === 'bphs.30.005.benefic-relief')!;
    expect(r.unless).toHaveLength(1);
    expect(r.effect.valence).toBeLessThan(0);
  });

  it('keeps every mortal and medical claim off the surfaced list', () => {
    const joined = CH29_31_UNSURFACED.join(' ');
    expect(joined).toContain('30.12-16');
    expect(joined).toContain('30.17-20');
    for (const r of [...upapadaRules(), ...padaWealthRules()]) {
      expect(r.effect.summary).not.toMatch(/death|die|dies|illness|disease/i);
    }
  });
});

// ── Chapter 31 ───────────────────────────────────────────────────────────────
describe('BPHS 31.2-9 — argala, verified against the first corpus', () => {
  it('matches the chapter’s table: 4/2/11/5 obstructed by 10/12/3/9', () => {
    expect(ARGALA_PAIRS.map((p) => p.argala)).toEqual([4, 2, 11, 5]);
    expect(ARGALA_PAIRS.map((p) => p.obstructor)).toEqual([10, 12, 3, 9]);
  });

  it('reproduces VIRODHARGALA exactly', () => {
    for (const { argala, obstructor } of ARGALA_PAIRS) {
      expect(VIRODHARGALA[argala], String(argala)).toBe(obstructor);
    }
  });

  it('still counts both from the original point, as `argalaOn` does', () => {
    const sources = argalaOn(1);
    for (const { argala, obstructor } of ARGALA_PAIRS) {
      const found = sources.find((s) => s.house === argala)!;
      expect(found, String(argala)).toBeDefined();
      expect(found.obstructedBy).toBe(obstructor);
    }
    expect(ARGALA_COUNTED_FROM).toContain('ORIGINAL');
  });

  it('turns three or more malefics in the 3rd into a favourable intervention', () => {
    expect(VIPAREETA_ARGALA_HOUSE).toBe(3);
    expect(vipareetaArgala(2)).toBe(false);
    expect(vipareetaArgala(3)).toBe(true);
    expect(vipareetaArgala(5)).toBe(true);
  });

  it('grades an intervention by how many planets cause it', () => {
    expect(argalaGrade(0)).toBe('none');
    expect(argalaGrade(1)).toBe('limited');
    expect(argalaGrade(2)).toBe('medium');
    expect(argalaGrade(3)).toBe('excellent');
  });
});

describe('BPHS 31.2-9 — whether an argala actually lands', () => {
  it('lets an unobstructed argala through', () => {
    expect(resolveArgala({ argalaCount: 1, obstructorCount: 0 }).prevails).toBe(true);
  });

  it('lets the stronger planet decide when strengths are known', () => {
    const won = resolveArgala({
      argalaCount: 1, obstructorCount: 1, argalaStrength: 420, obstructorStrength: 300,
    });
    expect(won.prevails).toBe(true);
    expect(won.reason).toContain('stronger');

    const lost = resolveArgala({
      argalaCount: 1, obstructorCount: 1, argalaStrength: 300, obstructorStrength: 420,
    });
    expect(lost.prevails).toBe(false);
  });

  it('falls back to the count rule when no Shadbala is supplied', () => {
    expect(resolveArgala({ argalaCount: 2, obstructorCount: 1 }).prevails).toBe(true);
    expect(resolveArgala({ argalaCount: 1, obstructorCount: 2 }).prevails).toBe(false);
  });

  it('uses strength in preference to count — the verse’s own order', () => {
    // Outnumbered but stronger: BPHS gives strength as its own sufficient ground.
    const r = resolveArgala({
      argalaCount: 1, obstructorCount: 3, argalaStrength: 500, obstructorStrength: 200,
    });
    expect(r.prevails).toBe(true);
  });

  it('reports nothing when nothing intervenes', () => {
    const r = resolveArgala({ argalaCount: 0, obstructorCount: 2 });
    expect(r.prevails).toBe(false);
    expect(r.grade).toBe('none');
  });
});

describe('BPHS 31.10 — the quarter rule', () => {
  it('cancels only the two mirrored pairs the verse names', () => {
    expect(argalaQuarterCancelled(1, 4)).toBe(true);
    expect(argalaQuarterCancelled(2, 3)).toBe(true);
    expect(argalaQuarterCancelled(3, 2)).toBe(false);
    expect(argalaQuarterCancelled(4, 1)).toBe(false);
    expect(argalaQuarterCancelled(1, 1)).toBe(false);
  });

  it('splits a sign into four 7.5° quarters', () => {
    expect(QUARTER_DEGREES).toBe(7.5);
    expect(quarterOf(0)).toBe(1);
    expect(quarterOf(7.4)).toBe(1);
    expect(quarterOf(7.5)).toBe(2);
    expect(quarterOf(22.5)).toBe(4);
    expect(quarterOf(29.99)).toBe(4);
  });

  it('never returns a fifth quarter, even at the sign boundary', () => {
    for (let d = 0; d < 30; d += 0.25) {
      const q = quarterOf(d);
      expect(q).toBeGreaterThanOrEqual(1);
      expect(q).toBeLessThanOrEqual(4);
    }
  });
});

describe('BPHS 31.9-18 — what an argala delivers, and when', () => {
  it('ties the effect to a dasha rather than leaving it timeless', () => {
    expect(ARGALA_TIMING).toContain('dasha');
  });

  it('names an effect for every house', () => {
    for (let h = 1; h <= 12; h++) {
      expect(ARGALA_HOUSE_EFFECT[h as House], String(h)).toBeTruthy();
    }
  });

  it('singles out the lagna, the 5th and the 9th', () => {
    expect(ARGALA_ROYAL_HOUSES).toEqual([1, 5, 9]);
  });

  it('names the node reversal as a gap rather than guessing it', () => {
    expect(NODE_ARGALA_REVERSED).toContain('Not implemented');
  });

  it('lists what the predicate vocabulary still cannot say', () => {
    expect(CH29_31_NOT_YET_EXPRESSIBLE.length).toBeGreaterThanOrEqual(4);
    expect(CH29_31_NOT_YET_EXPRESSIBLE.join(' ')).toContain('pada-to-pada');
  });
});
