// BPHS Programme Part 48 — Chapters 80-82: female horoscopy.
//
// This part ships no rules, so almost every test here guards a refusal. The one that does real
// work is `no rule anywhere carries chapter 80's material` — it checks the whole registry
// rather than this module, because the failure mode worth preventing is a later part
// reintroducing a Visha Kanya or barrenness reading under a different chapter number.

import { describe, it, expect } from 'vitest';
import {
  STRONGER_OF_LAGNA_OR_MOON, STRENGTH_RESOLVES_TWO_REFERENCE_POINTS, CH80_REFUSED_VERSES,
  LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE, CH80_REFUSED, SAME_INSTRUMENTS_DIFFERENT_SUBJECT,
  CH81_82_EXCLUDED, CH80_82_YIELD,
  allEncodedRules,
} from '../src/index.js';

describe('BPHS 80 — the refusal is auditable, verse by verse', () => {
  it('enumerates every refused clause with a ground', () => {
    expect(CH80_REFUSED_VERSES.length).toBeGreaterThanOrEqual(12);
    for (const v of CH80_REFUSED_VERSES) {
      expect(v.verse.length, 'every entry cites a verse').toBeGreaterThan(0);
      // A short claim can still be fully specific — "that the woman will be barren" is 29
      // characters and leaves nothing to interpretation. The floor only catches gestures.
      expect(v.claims.length, `${v.verse} states what it claims`).toBeGreaterThan(20);
      expect(v.ground.length).toBeGreaterThan(0);
    }
  });

  it('covers each category the chapter actually contains', () => {
    const grounds = new Set(CH80_REFUSED_VERSES.map((v) => v.ground));
    for (const g of ['sexual-conduct', 'fertility', 'stillbirth', 'death', 'gendered-worth',
      'third-party', 'stigma-label'] as const) {
      expect(grounds.has(g), `ground ${g} is represented`).toBe(true);
    }
  });

  it('names the verses a reader would look for', () => {
    const verses = CH80_REFUSED_VERSES.map((v) => v.verse);
    expect(verses).toContain('43-46');   // Visha Kanya
    expect(verses).toContain('40');      // stillbirth
    expect(verses).toContain('47');      // widowhood
    expect(verses).toContain('54-55');   // her own death
    expect(verses).toContain('9-16');    // sexual conduct from a trimsamsa
  });

  it('states what each refused verse claims, rather than gesturing at it', () => {
    // A vague refusal cannot be audited. These are quoted plainly on purpose.
    const visha = CH80_REFUSED_VERSES.find((v) => v.verse === '43-46')!;
    expect(visha.claims).toContain('Visha Kanya');
    const still = CH80_REFUSED_VERSES.find((v) => v.verse === '40')!;
    expect(still.claims).toContain('already dead');
  });
});

describe('Part 48 — why the plan’s instruction could not be followed', () => {
  it('records the correction to §9’s own row', () => {
    expect(LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE).toContain('THEY ARE NOT');
    expect(LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE).toContain('CORRECTION to §9');
  });

  it('rejects the tempting middle path explicitly', () => {
    // A "domain tag" would look like extraction and carry none of the source's content.
    expect(LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE).toContain('domain tag');
    expect(LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE).toContain('OUR invention');
  });

  it('observes that the instruments are the corpus’s own', () => {
    expect(SAME_INSTRUMENTS_DIFFERENT_SUBJECT).toContain('no methodological seam');
    expect(SAME_INSTRUMENTS_DIFFERENT_SUBJECT).toContain('ch 41');
  });
});

describe('BPHS 80.8 — the one verse kept', () => {
  it('is an arbitration instruction, not a claim about anyone', () => {
    expect(STRONGER_OF_LAGNA_OR_MOON).toContain('WHICHEVER IS STRONGER');
    expect(STRONGER_OF_LAGNA_OR_MOON).toContain('whoever the chapter were about');
  });

  it('joins two earlier chapters using the same device', () => {
    expect(STRENGTH_RESOLVES_TWO_REFERENCE_POINTS).toHaveLength(3);
    const joined = STRENGTH_RESOLVES_TWO_REFERENCE_POINTS.join(' ');
    expect(joined).toContain('51.6');
    expect(joined).toContain('79.6');
    expect(joined).toContain('80.8');
  });

  it('is honest that it still names no strength measure', () => {
    expect(STRONGER_OF_LAGNA_OR_MOON).toContain('no strength MEASURE');
  });
});

describe('Part 48 — nothing was encoded, here or anywhere', () => {
  it('emits no rules for chapters 80, 81 or 82', () => {
    for (const ch of [80, 81, 82]) {
      expect(allEncodedRules().filter((r) => r.source.chapter === ch), `chapter ${ch}`)
        .toHaveLength(0);
    }
  });

  it('no rule anywhere carries chapter 80’s material', () => {
    // The failure worth preventing is a later part reintroducing this under another chapter
    // number. This checks the whole registry, not just this module.
    const banned = /visha kanya|barren|stillbirth|already dead|widow|loose morals|generative organ/i;
    for (const r of allEncodedRules()) {
      expect(banned.test(r.effect.summary), `${r.id}: ${r.effect.summary}`).toBe(false);
      if (r.note) expect(banned.test(r.note) && !/not carried|refused/i.test(r.note), r.id).toBe(false);
    }
  });

  it('excludes chapters 81-82 having actually read them', () => {
    expect(CH81_82_EXCLUDED).toContain('READ before being excluded');
    expect(CH81_82_EXCLUDED).toContain('PHYSIOGNOMY');
    // And on the same ground Part 46 used, not a gendered one.
    expect(CH81_82_EXCLUDED).toContain('not a gendered one');
  });
});

describe('Part 48 — the yield', () => {
  it('says plainly that shipping no rules is the correct output', () => {
    expect(CH80_82_YIELD.note).toContain('NO RULES');
    expect(CH80_82_YIELD.note).toContain('correct output');
  });

  it('records what was kept as well as what was refused', () => {
    expect(CH80_82_YIELD.note).toContain('80.8 alone');
    expect(CH80_REFUSED).toContain('AUDITABLE');
  });
});
