// BPHS Programme Part 28 — Chapter 32: Planetary Karakatwa.
//
// This chapter's value is verification and capability, not rule count. The two tests that
// matter most are the ones driven by the book's own worked examples: the karaka table of the
// standard nativity, and the three charts the sage gives for paraspara karakas.

import { describe, it, expect } from 'vitest';
import {
  CHARA_KARAKA_ORDER, CH32_WORKED_KARAKAS, workedNativityLongitudes,
  CH32_TIE_BREAK, CH32_EXACT_TIE_RULE, CH32_SEVEN_KARAKA_SCHOOL, CH32_RAHU_RULE,
  ATMAKARAKA_PRECEDENCE, SOURCE_STATED_ARBITRATION,
  BPHS_STHIRA_KARAKAS, CH32_STHIRA_DIVERGENCES, STHIRA_KARAKAS,
  KARAKA_FRAMES, karakaFrameSign,
  parasparaKarakas, PARASPARA_DIGNITIES, CH32_RULE3_DISPUTED, CH32_NOT_FROM_MOON,
  BHAVA_KARAKA_BPHS, CH32_BHAVA_KARAKA_DIVERGENCES, NAISARGIKA_HOUSE_KARAKA,
  CH32_SECONDARY_HOUSE_SENSES,
  ADVERSE_HOUSES_CH32, AUSPICIOUS_HOUSES_CH32, CH32_HOUSE_POLARITY_NOTE,
  CH32_TEXTUAL_FAULT, CH32_YIELD,
  charaKarakas, evaluate,
  type ChartFacts, type House, type SignIndex,
} from '../src/index.js';

// ── The book's own worked karaka table ───────────────────────────────────────
describe('BPHS 32.13-17 — the standard nativity’s karakas', () => {
  it('reproduces all eight rows of the book’s table, in the book’s order', () => {
    const got = charaKarakas(workedNativityLongitudes());
    expect(got.map((k) => k.graha)).toEqual(CH32_WORKED_KARAKAS.map((r) => r.graha));
  });

  it('assigns each karaka office to the planet the book names', () => {
    const got = charaKarakas(workedNativityLongitudes());
    for (let i = 0; i < CH32_WORKED_KARAKAS.length; i++) {
      const want = CH32_WORKED_KARAKAS[i]!;
      expect(got[i]!.graha, want.karaka).toBe(want.graha);
    }
    // The Moon is Atmakaraka in this nativity and Saturn takes the last office.
    expect(got[0]!.graha).toBe('moon');
    expect(got[7]!.graha).toBe('saturn');
  });

  it('ranks on the karaka degree the book prints, to the arc-second', () => {
    const got = charaKarakas(workedNativityLongitudes());
    for (let i = 0; i < CH32_WORKED_KARAKAS.length; i++) {
      const w = CH32_WORKED_KARAKAS[i]!;
      expect(got[i]!.karakaDegree, w.karaka).toBeCloseTo(w.deg + w.min / 60 + w.sec / 3600, 6);
    }
  });

  it('the Rahu reversal is load-bearing — without it two offices are misassigned', () => {
    // Rahu's true degree-in-sign is 7°37'06"; the book ranks it at 30° − that = 22°22'54".
    // Reversed, Rahu is Matrukaraka (4th) and Mercury Pitrukaraka (5th). Un-reversed, Rahu
    // sits just ABOVE the Sun at 7°12' and the two swap — so skipping 32.5 costs exactly
    // two offices here. Small, and precisely the kind of error no checksum would catch.
    const reversed = charaKarakas(workedNativityLongitudes());
    expect(reversed.findIndex((k) => k.graha === 'rahu')).toBe(3);
    expect(reversed.findIndex((k) => k.graha === 'mercury')).toBe(4);

    // Rank the same longitudes with no reversal by treating Rahu as an ordinary planet.
    const asPlain = Object.entries(workedNativityLongitudes())
      .map(([g, d]) => ({ g, d: d as number }))
      .sort((a, b) => b.d - a.d)
      .map((x) => x.g);
    expect(asPlain.indexOf('rahu')).toBe(4);
    expect(asPlain.indexOf('mercury')).toBe(3);
    // Everything else keeps its office: the damage is contained to the swapped pair.
    expect(asPlain.filter((g, i) => reversed[i]!.graha !== g)).toEqual(['mercury', 'rahu']);
  });

  it('names the eight offices in rank order', () => {
    expect(CHARA_KARAKA_ORDER).toHaveLength(8);
    expect(CHARA_KARAKA_ORDER[0]).toBe('Atmakaraka');
    expect(CHARA_KARAKA_ORDER[7]).toBe('Darakaraka');
    expect(CH32_WORKED_KARAKAS.map((r) => r.karaka)).toEqual([...CHARA_KARAKA_ORDER]);
  });
});

// ── What the scheme says about its own edges ─────────────────────────────────
describe('BPHS 32 — the edges of the karaka scheme', () => {
  it('is honest that the arc-minute tie-break is the number type, not our code', () => {
    expect(CH32_TIE_BREAK).toContain('property of the representation, not code we wrote');
  });

  it('records the exact-tie rule, including the Venus fallback for Dara', () => {
    expect(CH32_EXACT_TIE_RULE).toContain('the NEXT office');
    expect(CH32_EXACT_TIE_RULE).toContain('Venus');
  });

  it('records the seven-karaka school as a school difference, not a bug', () => {
    expect(CH32_SEVEN_KARAKA_SCHOOL).toContain('school difference');
  });

  it('records that Rahu counts from the end of its sign, and Ketu never counts', () => {
    expect(CH32_RAHU_RULE).toContain('30° − degree-in-sign');
    expect(CH32_RAHU_RULE).toContain('Ketu is never a chara karaka');
    expect(charaKarakas(workedNativityLongitudes()).some((k) => k.graha === 'ketu')).toBe(false);
  });
});

// ── 32.9-12, the seventh source-stated arbitration instruction ───────────────
describe('BPHS 32.9-12 — the Atmakaraka outranks the other karakas', () => {
  it('is recorded as the seventh source-stated arbitration instruction', () => {
    expect(ATMAKARAKA_PRECEDENCE).toContain('seventh source-stated');
    for (const v of ['27.37-38', '28.15-20', '72.30-31', '74.11-13', '14.15', '24.145']) {
      expect(ATMAKARAKA_PRECEDENCE, v).toContain(v);
    }
  });

  it('names what makes it structurally different from the earlier six', () => {
    // The six rank evidence; this one bounds it.
    expect(ATMAKARAKA_PRECEDENCE).toContain('CAPS evidence rather than ranking it');
  });

  it('says plainly why it is NOT wired into arbitrate', () => {
    expect(ATMAKARAKA_PRECEDENCE).toContain('needs a definition of an "adverse" Atmakaraka');
    // Not wired is not the same as not recorded: it must still be in the register. Asserts
    // POSITION, not length — the register is append-only and a later part will grow it.
    expect(SOURCE_STATED_ARBITRATION[6]).toContain('32.9-12');
    expect(SOURCE_STATED_ARBITRATION[6]).toContain('CAP, not a ranking');
  });
});

// ── Reconciliation with the other corpus ─────────────────────────────────────
describe('BPHS 32.18-21 — sthira karakas, reconciled not merged', () => {
  it('carries BPHS’s own table including Ketu, which the other corpus omits', () => {
    expect(BPHS_STHIRA_KARAKAS).toHaveLength(8);
    const ketu = BPHS_STHIRA_KARAKAS.find((k) => k.planet === 'ketu');
    expect(ketu?.signifies).toContain('parents-in-law');
    expect(STHIRA_KARAKAS.some((k) => k.planet === 'ketu')).toBe(false);
  });

  it('records four divergences rather than averaging the two books', () => {
    expect(CH32_STHIRA_DIVERGENCES).toHaveLength(4);
    const joined = CH32_STHIRA_DIVERGENCES.join(' ');
    expect(joined).toContain('paternal grandfather');
    expect(joined).toContain('day/night qualifier');
  });

  it('the divergences describe real differences, not imagined ones', () => {
    // Jupiter: BPHS says only paternal grandfather; the other corpus says much more.
    const bphsJup = BPHS_STHIRA_KARAKAS.find((k) => k.planet === 'jupiter')!;
    expect(bphsJup.signifies).toEqual(['paternal grandfather']);
    const otherJup = STHIRA_KARAKAS.find((k) => k.planet === 'jupiter')!;
    expect(otherJup.relative).toContain('husband');
  });

  it('keeps "the stronger of the two" as a flag rather than picking a winner', () => {
    const father = BPHS_STHIRA_KARAKAS.find((k) => Array.isArray(k.planet) && k.planet.includes('sun'))!;
    expect(father.strongerOf).toBe(true);
    expect(father.planet).toEqual(['sun', 'venus']);
  });
});

// ── 32.22-24, the capability this chapter forced ─────────────────────────────
describe('BPHS 32.22-24 — a house counted from a planet', () => {
  const facts = (over: Record<string, unknown> = {}): ChartFacts => ({
    lagnaSign: 0,
    planets: {
      sun: { sign: 0, house: 1 }, moon: { sign: 3, house: 4 }, mars: { sign: 2, house: 3 },
      mercury: { sign: 3, house: 4 }, jupiter: { sign: 4, house: 5 }, venus: { sign: 5, house: 6 },
      saturn: { sign: 6, house: 7 }, rahu: { sign: 7, house: 8 }, ketu: { sign: 1, house: 2 },
      ...over,
    },
  } as unknown as ChartFacts);

  it('has a frame for each of the seven significators', () => {
    expect(KARAKA_FRAMES).toHaveLength(7);
    const f = (g: string) => KARAKA_FRAMES.find((x) => x.graha === g)!;
    expect(f('sun').house).toBe(9);
    expect(f('moon').house).toBe(4);
    expect(f('mars').house).toBe(3);
    expect(f('mercury').house).toBe(6);
    expect(f('jupiter').house).toBe(5);
    expect(f('venus').house).toBe(7);
  });

  it('withholds the 8th from Saturn, and says why', () => {
    const sat = KARAKA_FRAMES.find((x) => x.graha === 'saturn')!;
    expect(sat.house).toBe(8);
    expect(sat.surfaced).toBe(false);
    expect(sat.withheld).toContain('Part 51');
    // Every other frame is surfaced — the withholding is targeted, not blanket.
    expect(KARAKA_FRAMES.filter((x) => x.surfaced)).toHaveLength(6);
  });

  it('counts the frame house from the planet’s sign', () => {
    const planets = { sun: { sign: 0 as SignIndex } };
    // The 9th from Aries is Sagittarius (index 8).
    expect(karakaFrameSign(planets, KARAKA_FRAMES[0]!)).toBe(8);
  });

  it('the predicate engine now resolves a planetary frame with no extra fact', () => {
    // Jupiter sits in sign 4; the 5th from Jupiter is sign 8. Put Venus there and read it
    // as "Venus is in the 5th from Jupiter" — a frame no `lagnas` entry was ever supplied for.
    const f = facts({ venus: { sign: 8, house: 9 } });
    expect(evaluate({ k: 'placement', graha: 'venus', house: 5, from: 'jupiter' }, f)).toBe(true);
    expect(evaluate({ k: 'placement', graha: 'venus', house: 4, from: 'jupiter' }, f)).toBe(false);
  });

  it('an explicitly stated chandra lagna still wins over the Moon’s own sign', () => {
    // The Moon is in sign 3, so the Moon-frame would put a planet in sign 3 in the 1st.
    // A chart that states a different chandra lagna is stating something we must not override.
    const f = facts();
    (f as unknown as { lagnas: Record<string, number> }).lagnas = { moon: 6 };
    // Saturn is in sign 6: 1st from the stated frame, but 4th from the Moon's actual sign.
    expect(evaluate({ k: 'placement', graha: 'saturn', house: 1, from: 'moon' }, f)).toBe(true);
    expect(evaluate({ k: 'placement', graha: 'saturn', house: 4, from: 'moon' }, f)).toBe(false);
  });

  it('a planetary frame yields silence when the planet is absent, never a natal fallback', () => {
    const f = facts();
    delete (f.planets as Record<string, unknown>).jupiter;
    expect(evaluate({ k: 'placement', graha: 'venus', house: 5, from: 'jupiter' }, f)).toBe(false);
  });
});

// ── 32.25-30, the three worked charts ────────────────────────────────────────
describe('BPHS 32.25-30 — paraspara karakas, against the book’s three charts', () => {
  it('chart 1: Sun and Saturn in own signs, mutually angular from a Scorpio lagna', () => {
    // Scorpio lagna (7). Sun in Leo (4) = the 10th; Saturn in Aquarius (10) = the 4th.
    // Both in own signs, mutually 7th. The book: they act as co-workers, casting away
    // mutual enmity, and the Sun in the 10th makes the effect pronounced.
    const pairs = parasparaKarakas({
      lagnaSign: 7,
      planets: { sun: { sign: 4, dignity: 'own' }, saturn: { sign: 10, dignity: 'own' } },
    });
    expect(pairs).toHaveLength(1);
    expect(pairs[0]!.rule).toBe(1);
    expect(pairs[0]!.viaTenth).toBe(true);
  });

  it('chart 2: Sun and Mars mutually angular but DEBILITATED — no co-workership', () => {
    // Aries lagna. Sun debilitated in Libra (6) = the 7th; Mars debilitated in Cancer (3)
    // = the 4th. Mutually angular, but with no dignity the book gives them nothing.
    const pairs = parasparaKarakas({
      lagnaSign: 0,
      planets: { sun: { sign: 6, dignity: 'debilitated' }, mars: { sign: 3, dignity: 'debilitated' } },
    });
    expect(pairs).toHaveLength(0);
  });

  it('chart 3: Jupiter and Saturn exalted, angular to each other but not to the lagna', () => {
    // Gemini lagna (2). Jupiter exalted in Cancer (3) = the 2nd; Saturn exalted in Libra (6)
    // = the 5th. Neither is angular from the ascendant, but they are mutually angular (4th),
    // and the book says they still represent each other — its disputed rule 3.
    const input = {
      lagnaSign: 2 as SignIndex,
      planets: { jupiter: { sign: 3 as SignIndex, dignity: 'exalted' as const },
                 saturn: { sign: 6 as SignIndex, dignity: 'exalted' as const } },
    };
    expect(parasparaKarakas(input)).toHaveLength(0);
    const withRule3 = parasparaKarakas(input, { includeRule3: true });
    expect(withRule3).toHaveLength(1);
    expect(withRule3[0]!.rule).toBe(3);
  });

  it('rule 3 is opt-in and tagged, because the book says schools reject it', () => {
    expect(CH32_RULE3_DISPUTED).toContain('opt-in');
    expect(CH32_RULE3_DISPUTED).toContain('rule: 3');
  });

  it('accepts own, exalted, moolatrikona and friendly — and nothing else', () => {
    expect(PARASPARA_DIGNITIES).toEqual(['exalted', 'moolatrikona', 'own', 'friend']);
    for (const d of ['neutral', 'enemy', 'debilitated'] as const) {
      const pairs = parasparaKarakas({
        lagnaSign: 7, planets: { sun: { sign: 4, dignity: d }, saturn: { sign: 10, dignity: d } },
      });
      expect(pairs, d).toHaveLength(0);
    }
  });

  it('a planet with no dignity on the chart never qualifies', () => {
    // Silence rather than a guess, same as everywhere else in the engine.
    const pairs = parasparaKarakas({
      lagnaSign: 7, planets: { sun: { sign: 4 }, saturn: { sign: 10 } },
    });
    expect(pairs).toHaveLength(0);
  });

  it('records that this is judged from the ascendant only, never from the Moon', () => {
    expect(CH32_NOT_FROM_MOON).toContain('not to be considered');
    expect(CH32_NOT_FROM_MOON).toContain('takes no frame parameter');
  });
});

// ── 32.31-37 ─────────────────────────────────────────────────────────────────
describe('BPHS 32.31-37 — bhava karakas and house polarity', () => {
  it('names one planet per house, all twelve', () => {
    for (let h = 1 as House; h <= 12; h++) expect(BHAVA_KARAKA_BPHS[h as House], `house ${h}`).toBeTruthy();
    expect(BHAVA_KARAKA_BPHS[10]).toBe('mercury');
    expect(BHAVA_KARAKA_BPHS[8]).toBe('saturn');
  });

  it('records five divergences from the other corpus’s naisargika table', () => {
    expect(CH32_BHAVA_KARAKA_DIVERGENCES).toHaveLength(5);
    expect(CH32_BHAVA_KARAKA_DIVERGENCES.join(' ')).toContain('widest gap');
  });

  it('the 10th-house divergence is real: one planet against four', () => {
    expect(BHAVA_KARAKA_BPHS[10]).toBe('mercury');
    expect(NAISARGIKA_HOUSE_KARAKA[10]).toHaveLength(4);
  });

  it('explains away the 9th-house divergence rather than leaving it as a contradiction', () => {
    // BPHS gives Jupiter for the 9th AND reads the father from the 9th FROM the Sun. Those
    // are different claims, and the divergence note has to say so or it misleads.
    const ninth = CH32_BHAVA_KARAKA_DIVERGENCES.find((d) => d.startsWith('9th'))!;
    expect(ninth).toContain('only look like a contradiction');
  });

  it('keeps the secondary house senses as a note, since three houses claim the spouse', () => {
    expect(CH32_SECONDARY_HOUSE_SENSES).toContain('2nd, 5th and 7th all claim the spouse');
    expect(CH32_SECONDARY_HOUSE_SENSES).toContain('not as rules');
  });

  it('splits the twelve houses six and six, with no overlap and no gap', () => {
    expect(ADVERSE_HOUSES_CH32).toHaveLength(6);
    expect(AUSPICIOUS_HOUSES_CH32).toHaveLength(6);
    const all = [...ADVERSE_HOUSES_CH32, ...AUSPICIOUS_HOUSES_CH32].sort((a, b) => a - b);
    expect(all).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('flags that BPHS puts the 11th and the 2nd among the adverse houses', () => {
    expect(ADVERSE_HOUSES_CH32).toContain(11);
    expect(ADVERSE_HOUSES_CH32).toContain(2);
    expect(CH32_HOUSE_POLARITY_NOTE).toContain('stricter than most later schemes');
  });
});

// ── Audit ────────────────────────────────────────────────────────────────────
describe('BPHS 32 — the audit trail', () => {
  it('records the third transcription fault found in this edition', () => {
    expect(CH32_TEXTUAL_FAULT).toContain('Gnati Karaka');
    expect(CH32_TEXTUAL_FAULT).toContain('Third');
  });

  it('is honest that the chapter produced no new rules, and why that is not zero', () => {
    expect(CH32_YIELD.newRules).toBe(0);
    expect(CH32_YIELD.note).toContain('Counting rules alone would score this chapter at zero');
    expect(CH32_YIELD.note).toContain('capability');
  });
});
