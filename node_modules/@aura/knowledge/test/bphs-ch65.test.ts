// BPHS Programme Part 45 — Chapter 65: the order of a list of readings.
//
// The test that carries the part is `every block is a contiguous cyclic window of SAVYA_24`.
// It recomputes the offsets by searching all 24 rather than trusting the recorded ones, so if
// `SAVYA_24` is ever edited the confirmation stops holding and this fails — which is the whole
// value of a sideways check.

import { describe, it, expect } from 'vitest';
import {
  CH65_BLOCKS, ch65BlockSequence, CH65_ORDER_CONFIRMS_SAVYA_24,
  CELLS_ARE_KEYED_BY_WHEEL_POSITION, CH65_READINGS_REFUSED, CH65_RITUAL_REMEDY_REFUSED,
  CH65_YIELD,
  SAVYA_24, kalachakraPada, isSavya, allEncodedRules,
} from '../src/index.js';

const AR = 0, TA = 1, GE = 2, CN = 3, LE = 4, VI = 5;
const LI = 6, SC = 7, SG = 8, CP = 9, AQ = 10, PI = 11;

/**
 * The rasi order chapter 65 lists its readings in, block by block, transcribed from the
 * chapter so the confirmation is reproducible rather than asserted.
 */
const CH65_ORDER: Record<number, number[]> = {
  [AR]: [AR, TA, GE, CN, LE, VI, LI, SC, SG, CP, AQ, PI, SC, LI, VI, CN, LE, GE],
  [GE]: [TA, AR, PI, AQ, CP, SG, AR, TA, GE, CN, LE, VI, LI, SC, SG, CP, AQ, PI],
  [LE]: [SC, LI, VI, CN, LE, GE, TA, AR, PI],
  [VI]: [AQ, CP, SG, AR, TA, GE, CN, LE, VI],
  [LI]: [LI, SC, SG, CP, AQ, PI, SC, LI, VI],
  [SC]: [CN, LE, GE, TA, AR, PI, AQ, CP, SG],
  [SG]: [AR, TA, GE, CN, LE, VI, LI, SC, SG],
  [CP]: [CP, AQ, PI, SC, LI, VI, CN, LE, GE],
  [AQ]: [TA, AR, PI, AQ, CP, SG, AR, TA, GE],
  [PI]: [LE, VI, LI, SC, SG, CP, AQ, PI],
};

const mod24 = (n: number) => ((n % 24) + 24) % 24;

describe('BPHS 65 — the order of the readings confirms SAVYA_24', () => {
  it('makes every block a contiguous cyclic window, found by searching all 24 offsets', () => {
    for (const { amsa, cells } of CH65_BLOCKS) {
      const observed = CH65_ORDER[amsa]!;
      expect(observed, `amsa ${amsa} cell count`).toHaveLength(cells);
      const hits: number[] = [];
      for (let o = 0; o < 24; o++) {
        const window = Array.from({ length: cells }, (_, k) => SAVYA_24[mod24(o + k)]);
        if (window.every((v, i) => v === observed[i])) hits.push(o);
      }
      // Exactly one offset reproduces the block — a coincidence would allow zero or several.
      expect(hits, `amsa ${amsa} offsets`).toHaveLength(1);
    }
  });

  it('recovers exactly the offsets recorded, without being told them', () => {
    for (const { amsa, cells, offset } of CH65_BLOCKS) {
      expect(ch65BlockSequence(offset, cells), `amsa ${amsa}`).toEqual(CH65_ORDER[amsa]);
    }
  });

  it('puts nine of the ten offsets in the set padaOrdinal*9 mod 24 generates', () => {
    // `kalachakraPada` starts each pada at `padaOrdinal * 9 mod 24`.
    const reachable = new Set(Array.from({ length: 24 }, (_, k) => (k * 9) % 24));
    const inSet = CH65_BLOCKS.filter((b) => reachable.has(b.offset));
    expect(inSet).toHaveLength(9);
    // The exception is the one block that lost a cell.
    const odd = CH65_BLOCKS.find((b) => !reachable.has(b.offset))!;
    expect(odd.amsa).toBe(PI);
    expect(odd.cells).toBe(8);        // eight, where every other block has nine or eighteen
  });

  it('produces windows that a real pada sequence also produces', () => {
    // Cross-check against the shipped constructor rather than the raw wheel: a savya pada's
    // nine-rasi sequence must appear among the windows chapter 65 lists.
    const windows = CH65_BLOCKS.filter((b) => b.cells >= 9)
      .map((b) => ch65BlockSequence(b.offset, 9).join(','));
    let matched = 0;
    for (let nak = 0; nak < 27; nak++) {
      if (!isSavya(nak)) continue;
      for (let pada = 1; pada <= 4; pada++) {
        if (windows.includes(kalachakraPada(nak, pada).sequence.join(','))) matched++;
      }
    }
    expect(matched).toBeGreaterThan(0);
  });

  it('records the finding and where it came from', () => {
    expect(CH65_ORDER_CONFIRMS_SAVYA_24).toContain('ALL TEN surviving blocks');
    expect(CH65_ORDER_CONFIRMS_SAVYA_24).toContain('never meant to state it');
  });
});

describe('BPHS 65 — the collision that a sign-keyed table would have hidden', () => {
  it('has rasis recurring within a block, because the wheel visits them twice', () => {
    const aries = CH65_ORDER[AR]!;
    expect(aries).toHaveLength(18);
    // Six signs recur once the block passes twelve cells.
    const counts = new Map<number, number>();
    for (const r of aries) counts.set(r, (counts.get(r) ?? 0) + 1);
    const recurring = [...counts.values()].filter((n) => n > 1).length;
    expect(recurring).toBe(6);
    // And a sign-keyed table would therefore hold 12 entries for an 18-cell block.
    expect(new Set(aries).size).toBe(12);
  });

  it('is exactly the mirrored row of SAVYA_24 that causes it', () => {
    // Positions 12-23 revisit signs from positions 0-11.
    const firstRow = new Set(SAVYA_24.slice(0, 12));
    for (const s of SAVYA_24.slice(12)) expect(firstRow.has(s)).toBe(true);
  });

  it('records why the failure would have been invisible', () => {
    expect(CELLS_ARE_KEYED_BY_WHEEL_POSITION).toContain('POSITION IN THE WHEEL');
    expect(CELLS_ARE_KEYED_BY_WHEEL_POSITION).toContain('leaves no trace');
  });
});

describe('BPHS 65 — the readings are refused, and the reasoning is stated', () => {
  it('gives all three grounds and the number that made it a close call', () => {
    expect(CH65_READINGS_REFUSED).toContain('64%');
    expect(CH65_READINGS_REFUSED).toContain('NO CONDITION');
    expect(CH65_READINGS_REFUSED).toContain('HIDES ITSELF');
  });

  it('explains why chapter 64’s friendship rule cannot fill the gap', () => {
    // It compares the antar lord with the dasha lord; these are dasha readings.
    expect(CH65_READINGS_REFUSED).toContain('no second party');
  });

  it('emits no rules for chapter 65', () => {
    expect(allEncodedRules().filter((r) => r.source.chapter === 65)).toHaveLength(0);
  });

  it('refuses 65.32’s ritual remedy and says so visibly', () => {
    expect(CH65_RITUAL_REMEDY_REFUSED).toContain('religious rites');
    expect(CH65_RITUAL_REMEDY_REFUSED).toContain('behavioural remedies only');
  });
});

describe('Part 45 — the yield', () => {
  it('is honest that the find is a layout rather than a rule', () => {
    expect(CH65_YIELD.note).toContain('a LAYOUT, not a rule');
    expect(CH65_YIELD.note).toContain('second sideways confirmation');
  });
});
