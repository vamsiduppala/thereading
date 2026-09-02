// BPHS Programme Part 50 — Chapters 84-96: the remedial block.
//
// The load-bearing test is `no remedy text is stored anywhere in this module`. The refusal here
// is structural rather than a disclaimer — the claim is that there is no field to lift — and a
// test is the only thing that keeps that true as the module changes.

import { describe, it, expect } from 'vitest';
import {
  REMEDIAL_VOCABULARY_COUNTS, STANDING_CONSTRAINT_EMPTIES_THIS_BLOCK, REMEDIAL_CHAPTERS,
  MAP_KEPT_RECIPE_REFUSED, CH96_INSTRUCTS_HARM, BIRTH_TREATED_AS_MISFORTUNE, CH84_96_YIELD,
  allEncodedRules,
} from '../src/index.js';

describe('Part 50 — the measurement that decided the part', () => {
  it('shows the standing constraint empties the block rather than filtering it', () => {
    const c = REMEDIAL_VOCABULARY_COUNTS;
    const ritual = c.mantraJapaHoma + c.brahminDonationGift + c.deityTempleIdolWorship
      + c.bathGheeSesame;
    expect(ritual).toBeGreaterThan(100);
    expect(c.behavioural).toBe(1);
    // Two orders of magnitude apart: this is not a close call.
    expect(ritual / c.behavioural).toBeGreaterThan(100);
    expect(STANDING_CONSTRAINT_EMPTIES_THIS_BLOCK).toContain('EMPTIES it');
  });
});

describe('Part 50 — the map is kept, the recipe is not', () => {
  it('covers all thirteen chapters', () => {
    expect(REMEDIAL_CHAPTERS).toHaveLength(13);
    expect(REMEDIAL_CHAPTERS.map((r) => r.chapter))
      .toEqual([84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96]);
  });

  it('records that twelve of thirteen treat a BIRTH as the misfortune', () => {
    const births = REMEDIAL_CHAPTERS.filter((r) => r.birthTreatedAsMisfortune);
    expect(births).toHaveLength(12);   // chapters 85-96 inclusive
    // Chapter 84 is the exception — it treats planetary malevolence generally.
    expect(REMEDIAL_CHAPTERS.find((r) => r.chapter === 84)!.birthTreatedAsMisfortune).toBe(false);
  });

  it('no remedy text is stored anywhere in this module', () => {
    // The refusal is structural: there is no field holding a remedy, so there is nothing to
    // lift. This checks the shape of the data, not a promise about it.
    const ritual = /japa|homa|mantra|recit|propitiat|idol|temple|donate|ghee|sesame|kalasha|abandon|turn out/i;
    for (const r of REMEDIAL_CHAPTERS) {
      expect(Object.keys(r).sort()).toEqual(['birthTreatedAsMisfortune', 'chapter', 'circumstance']);
      expect(ritual.test(r.circumstance), `chapter ${r.chapter}: ${r.circumstance}`).toBe(false);
    }
    expect(MAP_KEPT_RECIPE_REFUSED).toContain('does not issue ritual instructions');
  });
});

describe('BPHS 96.4-5 — why nothing was catalogued at all', () => {
  it('names the verse and what it instructs', () => {
    expect(CH96_INSTRUCTS_HARM).toContain('DIRECTION TO EXPEL A WOMAN FROM HER HOME');
    expect(CH96_INSTRUCTS_HARM).toContain('PREFERRED measure');
  });

  it('explains why a label would not have contained it', () => {
    expect(CH96_INSTRUCTS_HARM).toContain('the entry survives the copy');
    expect(CH96_INSTRUCTS_HARM).toContain('DO NOT CATALOGUE');
    expect(CH96_INSTRUCTS_HARM).toContain('STRUCTURAL');
  });
});

describe('Part 50 — the framing, refused independently of the remedies', () => {
  it('extends Part 49’s ground back before the person has done anything', () => {
    expect(BIRTH_TREATED_AS_MISFORTUNE).toContain('BLAME-FOR-SUFFERING');
    expect(BIRTH_TREATED_AS_MISFORTUNE).toContain('EXISTENCE is the misfortune');
  });

  it('blocks a later part rescuing these chapters via a behavioural remedy', () => {
    expect(BIRTH_TREATED_AS_MISFORTUNE).toContain('WHETHER OR NOT a remedy is attached');
  });

  it('emits no rules for any chapter in the block', () => {
    for (let ch = 84; ch <= 96; ch++) {
      expect(allEncodedRules().filter((r) => r.source.chapter === ch), `chapter ${ch}`)
        .toHaveLength(0);
    }
  });

  it('and no rule anywhere prescribes a ritual', () => {
    // `fast` matches "as fast as it arrives" in an ordinary reading — fasting is the concept.
    const ritual = /japa|homa|mantra|propitiat|idol|temple|gemstone|fasting/i;
    for (const r of allEncodedRules()) {
      expect(ritual.test(r.effect.summary), `${r.id}: ${r.effect.summary}`).toBe(false);
    }
  });
});

describe('Part 50 — the yield', () => {
  it('is explicit that the plan’s "catalogue only" could not be carried out', () => {
    expect(CH84_96_YIELD.note).toContain('NO catalogue of remedies');
    expect(CH84_96_YIELD.note).toContain('96.4-5');
  });
});
