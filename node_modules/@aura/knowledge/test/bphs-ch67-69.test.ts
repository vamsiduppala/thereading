// BPHS Programme Part 16 — Chapters 67-69: the Ashtakavarga reductions.
//
// The chapter's own worked cases are the test. Three of the five ekadhipatya cases failed
// against the shipped implementation before this part.

import { describe, it, expect } from 'vitest';
import {
  REDUCTION_ORDER, REDUCTION_ORDER_IS_STATED, TRIKONA_RULE,
  TRIKONA_SPECIAL_CASES_ARE_REDUNDANT, CH67_TRINES,
  CH68_ILLUSTRATION, EKADHIPATYA_RULES, SINGLE_SIGN_OWNERS_EXEMPT, CH68_PAIRS,
  EKADHIPATYA_CORPUS_CONFLICT,
  RASI_MULTIPLIER_CONFLICT, GRAHA_MULTIPLIER_CONFLICT, CH69_WORKED_EXAMPLE,
  YOGA_PINDA_IS_SODHYA_PINDA, REDUCTIONS_INCLUDE_LAGNA,
  CH67_69_VERIFICATION, CH67_69_NOT_ENCODED,
  trikonaSodhana, ekadhipatyaSodhana, sodhitaAshtakavarga, sodhyaPinda,
  RASI_MULTIPLIER, GRAHA_MULTIPLIER, EKADHIPATYA_PAIRS,
} from '../src/index.js';

/** Build a 12-sign row from sparse {sign: value} entries. */
const rowOf = (vals: Record<number, number>): number[] => {
  const r = new Array(12).fill(0) as number[];
  for (const [s, v] of Object.entries(vals)) r[Number(s)] = v;
  return r;
};

// ── Chapter 67 ───────────────────────────────────────────────────────────────
describe('BPHS 67 — Trikona Shodhana', () => {
  it('subtracts the least of the three from all three', () => {
    // Fiery trine Aries/Leo/Sagittarius holding 7, 4, 4.
    const out = trikonaSodhana(rowOf({ 0: 7, 4: 4, 8: 4 }));
    expect([out[0], out[4], out[8]]).toEqual([3, 0, 0]);
  });

  it('leaves a trine alone when one of the three is zero', () => {
    const out = trikonaSodhana(rowOf({ 0: 5, 4: 0, 8: 3 }));
    expect([out[0], out[4], out[8]]).toEqual([5, 0, 3]);
  });

  it('zeroes a trine whose three values are equal', () => {
    const out = trikonaSodhana(rowOf({ 3: 4, 7: 4, 11: 4 }));
    expect([out[3], out[7], out[11]]).toEqual([0, 0, 0]);
  });

  it('both of the verse’s special cases fall out of the subtraction itself', () => {
    // Neither needs its own branch — asserted so nobody "fixes" one into disagreement.
    const zeroCase = rowOf({ 0: 5, 4: 0, 8: 3 });
    const min = Math.min(5, 0, 3);
    expect(min).toBe(0);
    expect(trikonaSodhana(zeroCase)[0]).toBe(5 - min);
    expect(TRIKONA_SPECIAL_CASES_ARE_REDUNDANT).toContain('restatements, not');
  });

  it('lists the four trines the chapter names', () => {
    expect(CH67_TRINES).toHaveLength(4);
    expect(CH67_TRINES[0]).toEqual([0, 4, 8]);
    expect(CH67_TRINES[3]).toEqual([3, 7, 11]);
  });

  it('takes the reduction order from the text, not from convention', () => {
    expect(REDUCTION_ORDER).toEqual(['trikona', 'ekadhipatya', 'pinda']);
    expect(REDUCTION_ORDER_IS_STATED).toContain('not our choice');
    expect(TRIKONA_RULE).toContain('mistranslation');
  });
});

// ── Chapter 68 — every worked case ───────────────────────────────────────────
describe('BPHS 68 — Ekadhipatya Shodhana, against the chapter’s illustration', () => {
  for (const c of CH68_ILLUSTRATION) {
    it(`${c.pair}: ${c.shows}`, () => {
      const [a, b] = c.signs;
      const before = rowOf({ [a]: c.before[0], [b]: c.before[1] });
      const after = ekadhipatyaSodhana(before, c.occupied);
      expect([after[a], after[b]]).toEqual([c.after[0], c.after[1]]);
    });
  }

  it('reproduces all five cases of the illustration', () => {
    for (const c of CH68_ILLUSTRATION) {
      const [a, b] = c.signs;
      const after = ekadhipatyaSodhana(
        rowOf({ [a]: c.before[0], [b]: c.before[1] }), c.occupied,
      );
      expect([after[a], after[b]], c.pair).toEqual([c.after[0], c.after[1]]);
    }
    expect(CH68_ILLUSTRATION).toHaveLength(5);
  });

  it('the three cases that used to fail now pass — and would fail under the old rules', () => {
    // Old rule 3: empty took the occupied sign's VALUE. Aries occupied 1, Scorpio empty 3.
    const scorpio = ekadhipatyaSodhana(rowOf({ 0: 1, 7: 3 }), [0]);
    expect(scorpio[7]).toBe(2);      // old gave 1
    // Old rule 3 again, equal values: Capricorn occupied 2, Aquarius empty 2.
    const aquarius = ekadhipatyaSodhana(rowOf({ 9: 2, 10: 2 }), [9]);
    expect(aquarius[10]).toBe(0);    // old gave 2
    // Old rule 4: both empty took the lower. Sagittarius 1, Pisces 2.
    const jup = ekadhipatyaSodhana(rowOf({ 8: 1, 11: 2 }), []);
    expect([jup[8], jup[11]]).toEqual([0, 1]);   // old gave [1, 1]
  });

  it('skips a pair when either sign holds zero', () => {
    const out = ekadhipatyaSodhana(rowOf({ 0: 0, 7: 5 }), []);
    expect([out[0], out[7]]).toEqual([0, 5]);
  });

  it('skips a pair when both signs are occupied', () => {
    const out = ekadhipatyaSodhana(rowOf({ 0: 4, 7: 2 }), [0, 7]);
    expect([out[0], out[7]]).toEqual([4, 2]);
  });

  it('never produces a negative value', () => {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        for (const occ of [[], [0], [7], [0, 7]]) {
          const out = ekadhipatyaSodhana(rowOf({ 0: x, 7: y }), occ);
          expect(out[0], `${x}/${y}`).toBeGreaterThanOrEqual(0);
          expect(out[7], `${x}/${y}`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('never increases a value', () => {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        for (const occ of [[], [0], [7], [0, 7]]) {
          const out = ekadhipatyaSodhana(rowOf({ 0: x, 7: y }), occ);
          expect(out[0]!).toBeLessThanOrEqual(x);
          expect(out[7]!).toBeLessThanOrEqual(y);
        }
      }
    }
  });

  it('exempts the Sun and Moon — five co-owned pairs, not seven', () => {
    expect(CH68_PAIRS).toHaveLength(5);
    expect(EKADHIPATYA_PAIRS).toHaveLength(5);
    const covered = new Set(CH68_PAIRS.flat());
    expect(covered.has(3)).toBe(false);   // Cancer
    expect(covered.has(4)).toBe(false);   // Leo
    expect(SINGLE_SIGN_OWNERS_EXEMPT).toContain('five entries');
  });

  it('records the four rules and the cross-corpus conflict', () => {
    expect(EKADHIPATYA_RULES).toHaveLength(4);
    expect(EKADHIPATYA_CORPUS_CONFLICT).toContain('4 and 2, where both rules agree');
  });
});

// ── Chapter 69 — the full pipeline against the worked example ────────────────
describe('BPHS 69 — Pinda Sadhana, against the chapter’s worked example', () => {
  it('reaches the chapter’s rasi pinda of 100', () => {
    const sp = sodhyaPinda(
      [...CH69_WORKED_EXAMPLE.soav], CH69_WORKED_EXAMPLE.planetSigns,
    );
    expect(sp.rasiPinda).toBe(CH69_WORKED_EXAMPLE.rasiPinda);
    expect(sp.rasiPinda).toBe(100);
  });

  it('reaches the chapter’s graha pinda of 48', () => {
    const sp = sodhyaPinda(
      [...CH69_WORKED_EXAMPLE.soav], CH69_WORKED_EXAMPLE.planetSigns,
    );
    expect(sp.grahaPinda).toBe(CH69_WORKED_EXAMPLE.grahaPinda);
    expect(sp.grahaPinda).toBe(48);
  });

  it('reaches the chapter’s yoga pinda of 148', () => {
    const sp = sodhyaPinda(
      [...CH69_WORKED_EXAMPLE.soav], CH69_WORKED_EXAMPLE.planetSigns,
    );
    expect(sp.sodhyaPinda).toBe(CH69_WORKED_EXAMPLE.yogaPinda);
    expect(sp.sodhyaPinda).toBe(148);
  });

  it('uses 5 for Capricorn, as the example does — not the 6 the verse states', () => {
    expect(RASI_MULTIPLIER[9]).toBe(5);
    expect(RASI_MULTIPLIER_CONFLICT).toContain('closes at 100 only with 5');
  });

  it('uses 5 for the Sun, Moon, Mercury and Saturn — not the 6 the verse states', () => {
    for (const p of ['sun', 'moon', 'mercury', 'saturn'] as const) {
      expect(GRAHA_MULTIPLIER[p], p).toBe(5);
    }
    expect(GRAHA_MULTIPLIER.mars).toBe(8);
    expect(GRAHA_MULTIPLIER.jupiter).toBe(10);
    expect(GRAHA_MULTIPLIER.venus).toBe(7);
    expect(GRAHA_MULTIPLIER_CONFLICT).toContain('closes at 48 only with 5');
  });

  it('agrees with the verse everywhere the verse and example do not conflict', () => {
    // Verse: Taurus and Leo 10; Gemini and Scorpio 8; Aries and Libra 7; Virgo 6;
    // Cancer 4, Sagittarius 9, Aquarius 11, Pisces 12.
    expect(RASI_MULTIPLIER[1]).toBe(10);
    expect(RASI_MULTIPLIER[4]).toBe(10);
    expect(RASI_MULTIPLIER[2]).toBe(8);
    expect(RASI_MULTIPLIER[7]).toBe(8);
    expect(RASI_MULTIPLIER[0]).toBe(7);
    expect(RASI_MULTIPLIER[6]).toBe(7);
    expect(RASI_MULTIPLIER[5]).toBe(6);
    expect(RASI_MULTIPLIER[3]).toBe(4);
    expect(RASI_MULTIPLIER[8]).toBe(9);
    expect(RASI_MULTIPLIER[10]).toBe(11);
    expect(RASI_MULTIPLIER[11]).toBe(12);
  });

  it('names the total the way BPHS does', () => {
    expect(YOGA_PINDA_IS_SODHYA_PINDA).toContain('synonym');
  });
});

// ── The pipeline end to end ──────────────────────────────────────────────────
describe('BPHS 67-69 — the reductions compose', () => {
  it('sodhitaAshtakavarga applies trikona before ekadhipatya', () => {
    // Aries/Leo/Sagittarius 5,3,3 → trikona leaves 2,0,0. Then Aries(2)/Scorpio pair:
    // Scorpio is 0 after nothing, so ekadhipatya skips it.
    const out = sodhitaAshtakavarga(rowOf({ 0: 5, 4: 3, 8: 3 }), []);
    expect(out[0]).toBe(2);
    expect(out[4]).toBe(0);
    expect(out[8]).toBe(0);
  });

  it('the reductions never raise a value above the raw bindu count', () => {
    const bav = [4, 3, 5, 2, 6, 1, 3, 4, 2, 5, 3, 2];
    const out = sodhitaAshtakavarga(bav, [0, 4, 9]);
    for (let s = 0; s < 12; s++) expect(out[s]!).toBeLessThanOrEqual(bav[s]!);
  });

  it('records what was verified and what was corrected', () => {
    expect(CH67_69_VERIFICATION.trikona.verdict).toBe('correct');
    expect(CH67_69_VERIFICATION.pinda.verdict).toBe('correct');
    expect(CH67_69_VERIFICATION.ekadhipatya.verdict).toBe('CORRECTED');
    expect(CH67_69_VERIFICATION.ekadhipatya.casesFailedBefore).toBe(3);
  });

  it('corroborates Part 15 — the reductions run over the lagna’s AV too', () => {
    expect(REDUCTIONS_INCLUDE_LAGNA).toContain('Part 15');
    expect(CH67_69_NOT_ENCODED['ch 70']).toContain('later part');
  });
});
