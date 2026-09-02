// BPHS Programme Part 36 — Chapter 46c: Kalachakra.
//
// The most important test in this file is `the shipped code matches the book, and the
// tempting correction does not`. This part proposed a fix that made 48 of 48 padas agree
// with BPHS 46.89, and the chapter's own worked example refused it. That test exists so the
// same plausible correction cannot be re-proposed later without tripping over the evidence.

import { describe, it, expect } from 'vitest';
import {
  amsaFromPada, AMSA_FORMULA_IS_AN_INDEPENDENT_CHECK, CH46_POORNAYU_BY_AMSA,
  POORNAYU_MAPPING_UNRESOLVED, MRIGASIRA_PADA_4, PATTERN_LOSES_TO_WORKED_EXAMPLE,
  KALACHAKRA_PARAMAYUSH_IS_LONGEVITY, CH46C_YIELD,
  kalachakraPada, isSavya, vargaSign,
} from '../src/index.js';

const NAK = 360 / 27;
const midOfPada = (nak: number, pada: number) => nak * NAK + (pada - 0.5) * (NAK / 4);

// ── 46.87-88: an independent check on the navamsa ────────────────────────────
describe('BPHS 46.87-88 — the pada→amsa arithmetic', () => {
  it('reproduces the chapter’s own worked example', () => {
    // "The birth is in the 4th Pada of Mrigasira … 4+4=8 … which falls in Scorpio."
    expect(amsaFromPada(4, 4)).toBe(7);
    expect(amsaFromPada(4, 4)).toBe(MRIGASIRA_PADA_4.amsa);
  });

  it('agrees with vargaSign for all 108 padas — two independent constructions', () => {
    // One counts nakshatras and padas; the other divides degrees. Neither is derived from
    // the other, so agreement is a real cross-check on Part 3's navamsa.
    for (let nak = 0; nak < 27; nak++) {
      for (let pada = 1; pada <= 4; pada++) {
        expect(amsaFromPada(nak, pada), `nak ${nak} pada ${pada}`)
          .toBe(vargaSign(midOfPada(nak, pada), 9));
      }
    }
    expect(AMSA_FORMULA_IS_AN_INDEPENDENT_CHECK).toContain('independent constructions');
  });

  it('tiles the twelve signs every three nakshatras, as the chapter explains', () => {
    const seen = new Set<number>();
    for (let nak = 0; nak < 3; nak++) for (let pada = 1; pada <= 4; pada++) {
      seen.add(amsaFromPada(nak, pada));
    }
    expect(seen.size).toBe(12);
  });
});

// ── The worked example, and the correction it refuses ────────────────────────
describe('BPHS 46 — the shipped Kalachakra against the book’s worked example', () => {
  it('gives Jeeva in Sagittarius and Deha in Aries for Mrigasira 4th pada', () => {
    const k = kalachakraPada(MRIGASIRA_PADA_4.nakshatra, MRIGASIRA_PADA_4.pada);
    expect(k.group).toBe('apasavya');
    expect(k.jeeva).toBe(MRIGASIRA_PADA_4.jeeva);   // Sagittarius
    expect(k.deha).toBe(MRIGASIRA_PADA_4.deha);     // Aries
  });

  it('and its sequence contains the order the chapter names', () => {
    // "the order of Dasha will be Taurus, Aries, Sagittarius, Scorpio etc." — read
    // cyclically from the birth dasha rather than from the head of the sequence.
    const seq = kalachakraPada(4, 4).sequence;
    const i = seq.indexOf(1);                        // Taurus
    expect(i).toBeGreaterThanOrEqual(0);
    const cyc = (n: number) => seq[(i + n) % seq.length]!;
    expect([cyc(0), cyc(1), cyc(2), cyc(3)]).toEqual([1, 0, 8, 7]);  // Ta, Ar, Sg, Sc
  });

  it('REFUTES the correction that fit the pattern perfectly', () => {
    // Reversing the pada for apasavya made 48/48 agree with 46.89 and had a good story.
    // The book says otherwise. This test exists so it cannot be re-proposed silently.
    const shipped = kalachakraPada(4, 4);
    const proposed = kalachakraPada(4, 1);           // the transform: pada -> 5 - pada
    expect(shipped.jeeva).toBe(MRIGASIRA_PADA_4.jeeva);
    expect(proposed.jeeva).not.toBe(MRIGASIRA_PADA_4.jeeva);
    expect(proposed.deha).not.toBe(MRIGASIRA_PADA_4.deha);
    expect(PATTERN_LOSES_TO_WORKED_EXAMPLE)
      .toContain('evidence about the pattern, not about the world');
  });
});

// ── 46.89: recorded, unresolved, not acted on ────────────────────────────────
describe('BPHS 46.89 — the poornayu table', () => {
  it('gives one value per trine, as the chapter states', () => {
    for (const [base, want] of [[0, 100], [1, 85], [2, 83], [3, 86]] as [number, number][]) {
      for (const k of [0, 1, 2]) {
        expect(CH46_POORNAYU_BY_AMSA[(base + k * 4) % 12], `trine of ${base}`).toBe(want);
      }
    }
  });

  it('matches the shipped paramayush for every SAVYA pada', () => {
    let checked = 0;
    for (let nak = 0; nak < 27; nak++) {
      if (!isSavya(nak)) continue;
      for (let pada = 1; pada <= 4; pada++) {
        const amsa = amsaFromPada(nak, pada);
        expect(kalachakraPada(nak, pada).paramayush, `nak ${nak} pada ${pada}`)
          .toBe(CH46_POORNAYU_BY_AMSA[amsa]);
        checked++;
      }
    }
    expect(checked).toBe(60);
  });

  it('and for NO apasavya pada — the divergence is exactly the savya/apasavya split', () => {
    let differ = 0;
    for (let nak = 0; nak < 27; nak++) {
      if (isSavya(nak)) continue;
      for (let pada = 1; pada <= 4; pada++) {
        const amsa = amsaFromPada(nak, pada);
        if (kalachakraPada(nak, pada).paramayush !== CH46_POORNAYU_BY_AMSA[amsa]) differ++;
      }
    }
    expect(differ).toBe(48);
  });

  it('is a permutation, not different arithmetic — the value sets are identical', () => {
    const ours = new Set<number>();
    for (let nak = 0; nak < 27; nak++) {
      if (isSavya(nak)) continue;
      for (let pada = 1; pada <= 4; pada++) ours.add(kalachakraPada(nak, pada).paramayush);
    }
    expect([...ours].sort((a, b) => a - b)).toEqual([83, 85, 86, 100]);
    expect([...new Set(Object.values(CH46_POORNAYU_BY_AMSA))].sort((a, b) => a - b))
      .toEqual([83, 85, 86, 100]);
  });

  it('is recorded as unresolved, with the refuted reading named', () => {
    expect(POORNAYU_MAPPING_UNRESOLVED).toContain('REFUTED');
    expect(POORNAYU_MAPPING_UNRESOLVED).toContain('nothing changed, nothing claimed');
  });
});

// ── Safety ───────────────────────────────────────────────────────────────────
describe('BPHS 46.85-86 — the paramayush is a longevity quantity', () => {
  it('is recorded as compute-never-surface', () => {
    expect(KALACHAKRA_PARAMAYUSH_IS_LONGEVITY).toContain('never surfaced as a lifespan');
    expect(KALACHAKRA_PARAMAYUSH_IS_LONGEVITY).toContain('Part 51');
  });

  it('is honest that this part’s headline result is a negative one', () => {
    expect(CH46C_YIELD.newRules).toBe(0);
    expect(CH46C_YIELD.note).toContain('NEGATIVE one');
    expect(CH46C_YIELD.note).toContain('refused');
  });
});
