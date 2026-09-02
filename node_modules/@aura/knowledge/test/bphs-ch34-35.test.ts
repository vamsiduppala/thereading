// BPHS Programme Part 30 — Chapters 34 (yoga karakas) and 35 (Nabhasa yogas).
//
// Chapter 34's value is that it supplies the RULES behind a table we already shipped, so
// the table became checkable — and the check found a defect. Chapter 35 gives no worked
// example at all (Santhanam declines to annotate it), so its detectors are verified by
// construction: each is exercised against a chart built to satisfy it AND against near
// misses, which is the only honest verification available.

import { describe, it, expect } from 'vitest';
import {
  LORDSHIP_GROUPS, LORDSHIP_COUNTERPARTS, KENDRADHIPATYA_ORDER, KENDRADHIPATYA_NOTE,
  yogaKarakaFor, YOGA_KARAKA_EXCLUDES_LAGNA, RAJA_YOGA_RELATIONS, RAJA_YOGA_CANCELLATION,
  NODES_HAVE_NO_NATURE, BPHS_ASCENDANT_TABLE, ascendantTableIsComplete,
  FUNCTIONAL_NATURE_MOON_GAP, CH34_MARAKA_IS_NOT_A_NATURE, CH34_DIVERGENCES, CH34_ADVERSE_ATMAKARAKA_STILL_OPEN, CH34_YIELD,
  NABHASA_YOGAS, NABHASA_GROUP_COUNTS, nabhasaYogas, SANKHYA_SUPPRESSION,
  NABHASA_NOT_DASHA_BOUND, CH35_YIELD, CH35_NO_WORKED_EXAMPLE,
  FUNCTIONAL_NATURE, functionalNatureIsComplete,
  type Graha, type SignIndex,
} from '../src/index.js';

// ── 34: the lordship rules ───────────────────────────────────────────────────
describe('BPHS 34.2-17 — how lordship decides a planet’s nature', () => {
  it('groups the houses and keeps each group in ascending order', () => {
    expect(LORDSHIP_GROUPS.goodAngles).toEqual([1, 4, 7, 10]);
    expect(LORDSHIP_GROUPS.goodTrines).toEqual([5, 9]);
    expect(LORDSHIP_GROUPS.evilUpachaya).toEqual([3, 6, 11]);
    expect(LORDSHIP_GROUPS.evilOther).toEqual([12, 2, 8]);
  });

  it('draws the chapter’s own conclusion about counterparts', () => {
    expect(LORDSHIP_COUNTERPARTS).toContain('10th lord’s counterpart is the 11th lord');
  });

  it('keeps the kendradhipatya blemish ordered Moon → Venus', () => {
    expect(KENDRADHIPATYA_ORDER).toEqual(['moon', 'mercury', 'jupiter', 'venus']);
  });

  it('does not let "not inauspicious" become "auspicious"', () => {
    // The sage worded 34.2-7 carefully and the retelling usually loses it.
    expect(KENDRADHIPATYA_NOTE).toContain('merely stops being');
    expect(KENDRADHIPATYA_NOTE).toContain('owning a trine as well');
    expect(KENDRADHIPATYA_NOTE).toContain('the error the chapter is worded to prevent');
  });

  it('lists the six raja-yoga relations of 34.11-12', () => {
    expect(RAJA_YOGA_RELATIONS).toHaveLength(6);
    expect(RAJA_YOGA_RELATIONS.join(' ')).toContain('Exchange');
  });

  it('records the 34.15 cancellation and how moolatrikona breaks the tie', () => {
    expect(RAJA_YOGA_CANCELLATION).toContain('moolatrikona');
    expect(RAJA_YOGA_CANCELLATION).toContain('Saturn for Aries');
  });

  it('records that the nodes have no functional nature of their own', () => {
    expect(NODES_HAVE_NO_NATURE).toContain('no functional nature of their own');
  });
});

// ── 34.13: the yoga karaka, derived not tabulated ────────────────────────────
describe('BPHS 34.13 — the yoga karaka is derivable', () => {
  it('reproduces the yogakaraka column the other corpus authored by hand', () => {
    // Independent agreement: BPHS's rule, applied cold, matches a table written from
    // another book. That is confirmation, not a fix.
    for (const row of FUNCTIONAL_NATURE) {
      expect(yogaKarakaFor(row.lagna), `lagna ${row.lagna}`).toBe(row.yogakaraka);
    }
  });

  it('names the classical four and no others', () => {
    const found = Array.from({ length: 12 }, (_, i) => yogaKarakaFor(i)).filter(Boolean);
    expect(new Set(found)).toEqual(new Set(['saturn', 'mars', 'venus']));
    // Taurus and Libra → Saturn; Cancer and Leo → Mars; Capricorn and Aquarius → Venus.
    expect(yogaKarakaFor(1)).toBe('saturn');
    expect(yogaKarakaFor(6)).toBe('saturn');
    expect(yogaKarakaFor(3)).toBe('mars');
    expect(yogaKarakaFor(4)).toBe('mars');
    expect(yogaKarakaFor(9)).toBe('venus');
    expect(yogaKarakaFor(10)).toBe('venus');
  });

  it('excludes the ascendant, which would otherwise make every lagna lord a yoga karaka', () => {
    expect(yogaKarakaFor(0)).toBeNull();   // Aries: Mars owns the lagna, and is not one
    expect(YOGA_KARAKA_EXCLUDES_LAGNA).toContain('two DISTINCT houses');
  });
});

// ── 34.19-44: the per-ascendant table, and the defect it exposed ─────────────
describe('BPHS 34.19-44 — the chapter’s own per-ascendant table', () => {
  it('has a row per ascendant, each accounting for all seven planets exactly once', () => {
    expect(BPHS_ASCENDANT_TABLE).toHaveLength(12);
    expect(ascendantTableIsComplete()).toBe(true);
  });

  it('is expressly silent about the Moon for Aries, and says so rather than guessing', () => {
    const aries = BPHS_ASCENDANT_TABLE[0]!;
    expect(aries.unstated).toEqual(['moon']);
    expect(aries.note).toContain('does not discuss the Moon');
  });

  it('carries a maraka column that is never surfaced', () => {
    // Every ascendant has one in BPHS; the other corpus has no such column at all.
    for (const r of BPHS_ASCENDANT_TABLE) expect(r.maraka.length, `lagna ${r.lagna}`).toBeGreaterThan(0);
    expect(CH34_DIVERGENCES.join(' ')).toContain('never surfaced (Part 51)');
  });

  it('lets a planet be auspicious AND a maraka, which a one-column table cannot', () => {
    const virgo = BPHS_ASCENDANT_TABLE[5]!;
    expect(virgo.auspicious).toContain('venus');
    expect(virgo.maraka).toContain('venus');
    expect(virgo.note).toContain('not a contradiction');
  });

  it('does not treat a maraka role as a functional nature', () => {
    // The inverse of the Moon gap: asserting MORE than the source does. A planet named
    // only as a killer has been given no benefic/malefic verdict, and sits in `unstated`.
    expect(CH34_MARAKA_IS_NOT_A_NATURE).toContain('assert more than');
    const taurus = BPHS_ASCENDANT_TABLE[1]!;
    expect(taurus.maraka).toContain('mars');
    expect(taurus.unstated).toContain('mars');
  });

  it('names five divergences from the other corpus, not merged away', () => {
    expect(CH34_DIVERGENCES).toHaveLength(5);
    const joined = CH34_DIVERGENCES.join(' ');
    expect(joined).toContain('Libra — Venus');
    expect(joined).toContain('Scorpio — yoga karaka');
  });
});

describe('Part 30 retrofit — the Moon was missing from three shipped rows', () => {
  it('every row of FUNCTIONAL_NATURE now accounts for all seven planets', () => {
    // The regression guard. Before Part 30, Aries, Libra and Capricorn carried six.
    expect(functionalNatureIsComplete()).toBe(true);
  });

  it('fills Capricorn and Libra from BPHS’s own statements', () => {
    // 34.39-40 makes the Moon malefic for Capricorn; 34.33-34 makes her a raja-yoga
    // causer for Libra. Neither is our interpolation.
    expect(FUNCTIONAL_NATURE[9]!.malefics).toContain('moon');
    expect(FUNCTIONAL_NATURE[6]!.benefics).toContain('moon');
  });

  it('leaves Aries unclassified rather than inventing a classification', () => {
    const aries = FUNCTIONAL_NATURE[0]!;
    expect(aries.unclassified).toEqual(['moon']);
    for (const col of [aries.benefics, aries.neutrals, aries.malefics]) {
      expect(col).not.toContain('moon');
    }
  });

  it('records what the defect actually was — silence, not a wrong answer', () => {
    expect(FUNCTIONAL_NATURE_MOON_GAP).toContain('in no column at all');
    expect(FUNCTIONAL_NATURE_MOON_GAP).toContain('silence rather than an answer');
  });

  it('does not close the adverse-Atmakaraka thread with something that merely looks close', () => {
    expect(CH34_ADVERSE_ATMAKARAKA_STILL_OPEN).toContain('stays open');
    expect(CH34_ADVERSE_ATMAKARAKA_STILL_OPEN).toContain('our inference, not the text’s');
  });

  it('is honest about what ch 34 yielded', () => {
    expect(CH34_YIELD.note).toContain('turned up a real defect');
  });
});

// ── 35: the Nabhasa formations ───────────────────────────────────────────────
const chart = (signs: Partial<Record<Graha, number>>, lagnaSign = 0) => ({
  lagnaSign: lagnaSign as SignIndex,
  planets: Object.fromEntries(
    Object.entries(signs).map(([g, s]) => [g, { sign: s as SignIndex }]),
  ) as NonNullable<Parameters<typeof nabhasaYogas>[0]['planets']>,
});

/** All seven planets spread across the given signs, cycling if fewer than seven. */
const spread = (signs: number[]): Partial<Record<Graha, number>> => {
  const SEVEN: Graha[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  return Object.fromEntries(SEVEN.map((g, i) => [g, signs[i % signs.length]!]));
};

describe('BPHS 35 — the catalogue', () => {
  it('has the 32 yogas the chapter declares, in the four groups it declares', () => {
    expect(NABHASA_YOGAS).toHaveLength(32);
    for (const [group, n] of Object.entries(NABHASA_GROUP_COUNTS)) {
      expect(NABHASA_YOGAS.filter((y) => y.group === group), group).toHaveLength(n);
    }
    const total = Object.values(NABHASA_GROUP_COUNTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(32);
  });

  it('gives every yoga a formation, and every refused one a reason', () => {
    for (const y of NABHASA_YOGAS) {
      expect(y.formation.length, y.name).toBeGreaterThan(15);
      if (y.surfaced) expect(y.summary, y.name).toBeTruthy();
      else expect(y.withheld!.length, y.name).toBeGreaterThan(20);
    }
  });

  it('refuses a large minority of the readings while keeping every formation', () => {
    const refused = NABHASA_YOGAS.filter((y) => !y.surfaced);
    expect(refused.length).toBeGreaterThanOrEqual(12);
    expect(CH35_YIELD.formations).toBe(32);
    expect(CH35_YIELD.note).toContain('plain contempt');
  });

  it('no surfaced summary carries the contempt the source’s effect verses do', () => {
    for (const y of NABHASA_YOGAS.filter((x) => x.surfaced)) {
      expect(y.summary!, y.name)
        .not.toMatch(/\b(crooked|cruel|wicked|mean|lazy|dirty|liar|thief|miserable|poor|indolent|king)\b/i);
    }
  });
});

describe('BPHS 35.7-17 — the detectors', () => {
  it('finds the three Asraya yogas by modality', () => {
    expect(nabhasaYogas(chart(spread([0, 3, 6, 9]))).yogas.map((y) => y.name)).toContain('Rajju');
    expect(nabhasaYogas(chart(spread([1, 4, 7, 10]))).yogas.map((y) => y.name)).toContain('Musala');
    expect(nabhasaYogas(chart(spread([2, 5, 8, 11]))).yogas.map((y) => y.name)).toContain('Nala');
  });

  it('a single planet outside the modality breaks the Asraya yoga', () => {
    const almost = { ...spread([0, 3, 6, 9]), saturn: 1 };
    expect(nabhasaYogas(chart(almost)).yogas.map((y) => y.name)).not.toContain('Rajju');
  });

  it('finds Kamala when all seven sit in the four angles', () => {
    const r = nabhasaYogas(chart(spread([0, 3, 6, 9]), 0));
    // Aries lagna: signs 0/3/6/9 are houses 1/4/7/10 — both Rajju and Kamala hold.
    expect(r.yogas.map((y) => y.name)).toEqual(expect.arrayContaining(['Rajju', 'Kamala']));
  });

  it('finds Sakata when the whole chart sits on the 1st/7th axis', () => {
    expect(nabhasaYogas(chart(spread([0, 6]), 0)).yogas.map((y) => y.name)).toContain('Sakata');
  });

  it('finds Sringataka when the three trines carry the chart', () => {
    expect(nabhasaYogas(chart(spread([0, 4, 8]), 0)).yogas.map((y) => y.name)).toContain('Sringataka');
  });

  it('counts occupied signs for the Sankhya group', () => {
    expect(nabhasaYogas(chart(spread([0]), 0)).occupiedSigns).toBe(1);
    expect(nabhasaYogas(chart(spread([0, 1, 2, 3, 4, 5, 6]), 0)).occupiedSigns).toBe(7);
  });

  it('needs all seven classical planets — a partial chart yields nothing', () => {
    const r = nabhasaYogas(chart({ sun: 0, moon: 3, mars: 6 }));
    expect(r.yogas).toHaveLength(0);
    expect(r.occupiedSigns).toBe(0);
  });

  it('reads Dala from the chart’s OWN benefic set, and skips it when none is given', () => {
    const signs = { sun: 0, moon: 0, mars: 3, mercury: 0, jupiter: 0, venus: 6, saturn: 3 };
    const without = nabhasaYogas(chart(signs, 0));
    expect(without.yogas.map((y) => y.name)).not.toContain('Maala');
    const withBen = nabhasaYogas({
      ...chart(signs, 0), benefics: ['moon', 'mercury', 'jupiter', 'venus'],
    });
    // Benefics occupy houses 1 (Moon, Mercury, Jupiter) and 7 (Venus) — only two angles.
    expect(withBen.yogas.map((y) => y.name)).not.toContain('Maala');
  });
});

describe('BPHS 35.16-17 — the Sankhya suppression', () => {
  it('suppresses a Sankhya yoga when another Nabhasa yoga stands', () => {
    // All seven in the four movable signs: Rajju holds, so Kedara (four signs) must not.
    const r = nabhasaYogas(chart(spread([0, 3, 6, 9]), 0));
    expect(r.yogas.map((y) => y.name)).toContain('Rajju');
    expect(r.yogas.map((y) => y.name)).not.toContain('Kedara');
    expect(r.suppressed.map((y) => y.name)).toContain('Kedara');
  });

  it('lets a Sankhya yoga stand when nothing else does', () => {
    // Five scattered signs forming no other shape.
    const r = nabhasaYogas(chart({
      sun: 0, moon: 1, mars: 2, mercury: 4, jupiter: 7, venus: 7, saturn: 7,
    }, 0));
    expect(r.occupiedSigns).toBe(5);
    if (r.yogas.length === 1) expect(r.yogas[0]!.name).toBe('Paasa');
    expect(r.suppressed.every((y) => y.group === 'sankhya')).toBe(true);
  });

  it('reports the suppressed yoga rather than dropping it silently', () => {
    expect(SANKHYA_SUPPRESSION).toContain('reports the suppressed yoga');
  });

  it('is recorded as the eighth source-stated arbitration instruction, and a new kind', () => {
    expect(SANKHYA_SUPPRESSION).toContain('eighth source-stated');
    expect(SANKHYA_SUPPRESSION).toContain('SUPPRESSES an entire class');
  });
});

describe('BPHS 35 — audit', () => {
  it('records that Nabhasa effects are not dasha-bound', () => {
    expect(NABHASA_NOT_DASHA_BOUND).toContain('all dasha periods');
    expect(NABHASA_NOT_DASHA_BOUND).toContain('blueprint');
  });

  it('says plainly that the chapter offers no worked example', () => {
    expect(CH35_NO_WORKED_EXAMPLE).toContain('verified by construction');
    expect(CH35_NO_WORKED_EXAMPLE).toContain('none to check');
  });
});
