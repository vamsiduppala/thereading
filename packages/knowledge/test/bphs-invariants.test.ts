// ─────────────────────────────────────────────────────────────────────────────
// BPHS invariant suite — Programme §8.2 (harvest).
//
// Structural truths discovered while extracting, promoted to permanent guards. Every
// future part must keep these green. They are deliberately cheap: one assertion each,
// catching whole classes of error rather than one instance.
//
// The test to add here is one a BUG would fail — not one that only a correct
// implementation passes. A check that can never fail is decoration.
//
// Each entry names the part that discovered it.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  // Part 1
  CLASSICAL_SEVEN, DIGNITY_BANDS, DEEP_EXALTATION_POINTS, MOOLATRIKONA_SIGN,
  BENEFIC_RATIO, MALEFIC_RATIO, NAISARGIKA_ORDER, naturalRelationOf,
  // Part 2
  GHATIS_PER_SIGN,
  // Parts 3-4
  SHODASAVARGA, VARGA_SCHEMES, VARGA_DESIGNATIONS,
  TRIMSAMSA_ODD, TRIMSAMSA_EVEN,
  SHASHTIAMSA_NAMES, SHASHTIAMSA_NATURE,
  vargaSign, VARGA_DIVISORS,
  lordOfSign, evaluate,
  gradeVarga, goodDivisionsFor,
  VIMSOPAKA_WEIGHTS, VIMSOPAKA_TOTAL, VARGA_VISWA, vimsopakaBala,
  rasiAspects, rasiDrishti, grahaAspectsFrom,
  // Part 12
  SUBHANKA, SUBHANKA_ORDER, subhanka, asubhanka, tierVerdict,
  ishtaKashtaOfBala, ishtaPhala, kashtaPhala, ISHTA_KASHTA_TOTAL,
  rasmiFromBala, balaFromRasmi, RASMI_MIN, RASMI_MAX,
  subhaRasmi, asubhaRasmi, RASMI_PAIR_TOTAL,
  uchchaRasmi, cheshtaRasmi, cheshtaKendraMoon, cheshtaKendraSun,
  balaShares, attributeIshta, bhavaEffect, ISHTA_KASHTA_PLANETS,
  bhavaPada, arudhaOf, padaRelation, upapadaHouse, quarterOf,
  ARGALA_PAIRS, VIRODHARGALA, argalaQuarterCancelled, resolveArgala,
  LAGNA_REFERENCE_USE, PADA_NAMES,
  AV_REFS, AV_HOUSES, AV_MARKS_PER_PLANET, avRowTotal, avPlanetTotal,
  BPHS_AV_PLANET_TOTALS, AV_GRAND_TOTAL, CH66A_TRANSCRIBED, rekhaFromKarana,
  AV_TABLE, AV_PLANETS,
  CH66B_TRANSCRIBED, CH66B_KARANA_COUNTS, karanaCounts, rekhaTotal,
  CH66_SATURN_REKHA, CH66_LAGNA_REKHA, CH66_LAGNA_KARANA_COUNTS,
  LAGNA_AV_TOTAL, lagnaAshtakavarga, ashtakavarga,
  CH68_ILLUSTRATION, CH69_WORKED_EXAMPLE, ekadhipatyaSodhana, sodhitaAshtakavarga,
  avTrigger, NAKSHATRA_COUNT, RASI_COUNT, transitVerdict, TRANSIT_MIDPOINT,
  samudayaBand, SAV_MEAN_PER_SIGN, planetRays, RAYS_AT_EXALTATION, RAYS_TOTAL_MAX,
  RAY_DIGNITY_FACTOR, sudarshanaSigns, sudarshanaAgreement,
  ashtakavargaEffectRules, AV_MATTER_HOUSE,
  sodhyaPinda, RASI_MULTIPLIER, GRAHA_MULTIPLIER,
  ASPECT_QUARTERS, aspectQuarters, drishtiValueGeneral, drishtiValueSaturn,
  drishtiValueMars, drishtiValueJupiter, drishtiQuarters, VIRUPAS_PER_RUPA,
  SPECULUM_SAMPLE, SPECULUM_OCR_FAULTS, ASPECT_RULES_RESTATED, ASPECT_ACTIVE_ARC,
  SHADBALA_PLANETS, shadbalaUchchaBala, exaltationCloseness, SAPTAVARGAJA_VIRUPAS,
  SAPTAVARGAJA_MAX, STHANA_BALA_MAX, VIRUPAS_PER_RUPA_27, drekkanaBala, kendradiBala,
  foldedArcBala, nathonnathaBala, pakshaBala, ayanaBala, naisargikaBalaVirupas,
  naisargikaBala, DIG_BALA_STRONG_HOUSE, DIG_BALA_HOUSE, KALA_BALA_MAX,
  SHADBALA_REQUIRED, shadbalaVerdict, MOTION_STRENGTHS, MOTION_ORDER,
  bhavaReferenceAngle, COMPONENT_MINIMUMS, componentGroupOf, grahaYuddha,
  type ChartFacts, type Graha, type SignIndex, type House,
} from '../src/index.js';

const SIGNS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// ── P3/P4 — every varga construction is a total function ─────────────────────
describe('invariant: varga constructions are total over the whole zodiac', () => {
  it('every supported divisor returns an integer sign 0..11 for every longitude', () => {
    for (const d of VARGA_DIVISORS) {
      for (let deg = 0; deg < 360; deg += 0.37) {
        const s = vargaSign(deg, d);
        expect(Number.isInteger(s), `D${d} @ ${deg.toFixed(2)} → ${s}`).toBe(true);
        expect(s, `D${d} @ ${deg.toFixed(2)}`).toBeGreaterThanOrEqual(0);
        expect(s, `D${d} @ ${deg.toFixed(2)}`).toBeLessThan(12);
      }
    }
  });

  it('handles the exact sign boundaries and the 360° wrap without escaping range', () => {
    for (const d of VARGA_DIVISORS) {
      for (const deg of [0, 29.999999, 30, 359.999999, 360, -0.0001]) {
        const s = vargaSign(deg, d);
        expect(s, `D${d} @ ${deg}`).toBeGreaterThanOrEqual(0);
        expect(s, `D${d} @ ${deg}`).toBeLessThan(12);
      }
    }
  });
});

// ── P4 — scheme containment ──────────────────────────────────────────────────
describe('invariant: every varga scheme is a subset of BPHS\'s sixteen', () => {
  it('no scheme admits a divisor outside the Shodasavarga', () => {
    for (const [name, divisors] of Object.entries(VARGA_SCHEMES)) {
      for (const d of divisors) expect(SHODASAVARGA, `${name} admits D${d}`).toContain(d);
    }
  });

  it('the schemes nest strictly, each inside the next', () => {
    const chain = ['shadvarga', 'saptavarga', 'dasavarga', 'shodasavarga'] as const;
    for (let i = 1; i < chain.length; i++) {
      const inner = VARGA_SCHEMES[chain[i - 1]!];
      const outer = VARGA_SCHEMES[chain[i]!];
      expect(outer.length).toBeGreaterThan(inner.length);
      for (const d of inner) expect(outer, `${chain[i - 1]} ⊄ ${chain[i]}`).toContain(d);
    }
  });

  it('every scheme has a designation for every count from 2 to its size, and none beyond', () => {
    for (const [name, divisors] of Object.entries(VARGA_SCHEMES)) {
      const ladder = VARGA_DESIGNATIONS[name as keyof typeof VARGA_DESIGNATIONS];
      for (let n = 2; n <= divisors.length; n++) expect(ladder[n], `${name}@${n}`).toBeTruthy();
      expect(ladder.length).toBe(divisors.length + 1);
    }
  });
});

// ── P1 — dignity band integrity ──────────────────────────────────────────────
describe('invariant: Part 1 dignity bands are well formed', () => {
  it('no two bands for the same planet overlap', () => {
    for (const g of CLASSICAL_SEVEN) {
      const bands = [...(DIGNITY_BANDS[g] ?? [])].sort((a, b) => a.sign - b.sign || a.from - b.from);
      for (let i = 1; i < bands.length; i++) {
        const prev = bands[i - 1]!;
        const cur = bands[i]!;
        if (prev.sign !== cur.sign) continue;
        expect(cur.from, `${g} bands overlap in sign ${cur.sign}`).toBeGreaterThanOrEqual(prev.to);
      }
    }
  });

  it('every band lies inside 0..30 with from < to', () => {
    for (const g of CLASSICAL_SEVEN) {
      for (const b of DIGNITY_BANDS[g] ?? []) {
        expect(b.from, `${g}`).toBeGreaterThanOrEqual(0);
        expect(b.to, `${g}`).toBeLessThanOrEqual(30);
        expect(b.from, `${g}`).toBeLessThan(b.to);
      }
    }
  });

  it('a planet\'s exaltation band, where one exists, sits in its exaltation sign', () => {
    for (const g of CLASSICAL_SEVEN) {
      for (const b of DIGNITY_BANDS[g] ?? []) {
        if (b.state === 'exalted') expect(b.sign, g).toBe(DEEP_EXALTATION_POINTS[g]!.exaltSign);
      }
    }
  });

  it('deep exaltation and debilitation stay exactly opposite, at equal degree', () => {
    for (const g of CLASSICAL_SEVEN) {
      const p = DEEP_EXALTATION_POINTS[g]!;
      expect((p.exaltSign + 6) % 12, g).toBe(p.debilSign);
      expect(p.debilDegree, g).toBe(p.exaltDegree);
      expect(p.exaltDegree).toBeGreaterThanOrEqual(0);
      expect(p.exaltDegree).toBeLessThan(30);
    }
  });
});

// ── P1 — relationship and ratio integrity ────────────────────────────────────
describe('invariant: Part 1 scales and relations stay coherent', () => {
  it('benefic and malefic ratios are complementary at the extremes', () => {
    expect(BENEFIC_RATIO.exalted).toBe(1);
    expect(MALEFIC_RATIO.exalted).toBe(0);
    expect(BENEFIC_RATIO.debilitated).toBe(0);
    expect(MALEFIC_RATIO.debilitated).toBe(1);
  });

  it('every ratio lies in 0..1', () => {
    for (const scale of [BENEFIC_RATIO, MALEFIC_RATIO]) {
      for (const v of Object.values(scale)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('benefic ratio decreases monotonically down the dignity ladder', () => {
    const ladder = ['exalted', 'moolatrikona', 'own', 'friend', 'neutral', 'enemy'] as const;
    for (let i = 1; i < ladder.length; i++) {
      expect(BENEFIC_RATIO[ladder[i]!]).toBeLessThanOrEqual(BENEFIC_RATIO[ladder[i - 1]!]);
    }
  });

  it('the derived relationship is defined for every ordered pair of the classical seven', () => {
    for (const a of CLASSICAL_SEVEN) {
      for (const b of CLASSICAL_SEVEN) {
        if (a === b) continue;
        expect(['friend', 'neutral', 'enemy'], `${a}→${b}`).toContain(naturalRelationOf(a, b));
      }
    }
  });

  it('naisargika order holds all seven classical planets exactly once', () => {
    expect(new Set(NAISARGIKA_ORDER).size).toBe(7);
    for (const g of CLASSICAL_SEVEN) expect(NAISARGIKA_ORDER).toContain(g);
  });

  it('each planet rules its own moolatrikona sign — except the Moon, the known exception', () => {
    for (const g of CLASSICAL_SEVEN) {
      const owner = lordOfSign(MOOLATRIKONA_SIGN[g]!);
      if (g === 'moon') expect(owner).toBe('venus');
      else expect(owner, g).toBe(g);
    }
  });
});

// ── P2 — special ascendant rate ordering ─────────────────────────────────────
describe('invariant: special ascendant rates keep their order', () => {
  it('Bhava is slower than Hora, which is slower than Ghatika', () => {
    // The inversion of this is precisely the bug found in Part 2 (ledger bphs.05.002).
    expect(GHATIS_PER_SIGN.bhava).toBeGreaterThan(GHATIS_PER_SIGN.hora);
    expect(GHATIS_PER_SIGN.hora).toBeGreaterThan(GHATIS_PER_SIGN.ghatika);
  });
});

// ── P4 — table completeness ──────────────────────────────────────────────────
describe('invariant: Part 4 tables are complete and self-consistent', () => {
  it('trimsamsa spans fill exactly one sign, both parities', () => {
    expect(TRIMSAMSA_ODD.reduce((s, p) => s + p.span, 0)).toBe(30);
    expect(TRIMSAMSA_EVEN.reduce((s, p) => s + p.span, 0)).toBe(30);
  });

  it('the even trimsamsa sequence is the odd one reversed', () => {
    expect(TRIMSAMSA_EVEN.map((p) => p.lord)).toEqual([...TRIMSAMSA_ODD].reverse().map((p) => p.lord));
  });

  it('shashtiamsa names and natures are both exactly sixty long', () => {
    expect(SHASHTIAMSA_NAMES).toHaveLength(60);
    expect(SHASHTIAMSA_NATURE).toHaveLength(60);
  });

  it('unknown shashtiamsa natures stay null — never silently defaulted', () => {
    for (const n of SHASHTIAMSA_NATURE) {
      expect(n === null || n === 'benefic' || n === 'malefic').toBe(true);
    }
  });
});

// ── P5 — Vimsopaka is a closed 20-point system ───────────────────────────────
describe('invariant: Vimsopaka weights close at exactly 20', () => {
  it('every scheme’s weights sum to 20 — the check the name itself provides', () => {
    for (const [name, w] of Object.entries(VIMSOPAKA_WEIGHTS)) {
      expect(Object.values(w).reduce((a, b) => a + b, 0), name).toBeCloseTo(VIMSOPAKA_TOTAL, 9);
    }
  });

  it('weights cover exactly their scheme’s divisions', () => {
    for (const [name, w] of Object.entries(VIMSOPAKA_WEIGHTS)) {
      const weighted = Object.keys(w).map(Number).sort((a, b) => a - b);
      const scheme = [...VARGA_SCHEMES[name as keyof typeof VARGA_SCHEMES]].sort((a, b) => a - b);
      expect(weighted, name).toEqual(scheme);
    }
  });

  it('any total lands within the viswa bounds, 5..20, for every planet and scheme', () => {
    for (const g of CLASSICAL_SEVEN) {
      for (const name of Object.keys(VIMSOPAKA_WEIGHTS)) {
        for (const lon of [7.7, 95.2, 188.6, 302.4]) {
          const t = vimsopakaBala(g, lon, name as keyof typeof VIMSOPAKA_WEIGHTS).total;
          expect(t, `${g} ${name}`).toBeGreaterThanOrEqual(VARGA_VISWA['great-enemy']);
          expect(t, `${g} ${name}`).toBeLessThanOrEqual(VARGA_VISWA.own);
        }
      }
    }
  });
});

// ── P6 — the two aspect systems stay distinct ────────────────────────────────
describe('invariant: rasi drishti and graha drishti do not get conflated', () => {
  it('rasi drishti is mutual for every sign pair', () => {
    for (const a of SIGNS) {
      for (const b of rasiAspects(a)) expect(rasiAspects(b), `${a}->${b}`).toContain(a);
    }
  });

  it('every sign aspects exactly three others by rasi drishti, never itself', () => {
    for (const s of SIGNS) {
      expect(rasiAspects(s), `sign ${s}`).toHaveLength(3);
      expect(rasiAspects(s)).not.toContain(s);
    }
  });

  it('the two rasi drishti implementations agree, for all twelve signs', () => {
    for (const s of SIGNS) {
      expect([...rasiAspects(s)].sort((a, b) => a - b), `sign ${s}`)
        .toEqual([...rasiDrishti(s)].sort((a, b) => a - b));
    }
  });

  it('graha drishti always includes the 7th, and only Mars/Jupiter/Saturn reach further', () => {
    const GRAHAS9 = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
    for (const g of GRAHAS9) {
      for (let h = 1; h <= 12; h++) {
        const seen = grahaAspectsFrom(g, h).filter((x) => x != null);
        expect(seen, `${g} from ${h}`).toContain(((h + 5) % 12) + 1);
        const extra = ['mars', 'jupiter', 'saturn'].includes(g);
        expect(seen.length, `${g} from ${h}`).toBe(extra ? 3 : 1);
      }
    }
  });
});

// -- P7: the two statements of graha drishti must never diverge -----------------
describe('invariant: graded aspects stay consistent', () => {
  const ARC = (h: number) => (h - 1) * 30;
  const G9 = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;

  it('the continuous formula and the quarter table agree at all twelve houses', () => {
    for (let h = 1; h <= 12; h++) {
      expect(drishtiQuarters(drishtiValueGeneral(ARC(h))), `house ${h}`).toBe(ASPECT_QUARTERS[h]);
    }
  });

  it('no curve ever exceeds one rupa, at any angle', () => {
    const curves = [drishtiValueGeneral, drishtiValueSaturn, drishtiValueMars, drishtiValueJupiter];
    for (const f of curves) {
      for (let x = 0; x < 360; x += 0.5) {
        expect(f(x)).toBeGreaterThanOrEqual(0);
        expect(f(x)).toBeLessThanOrEqual(VIRUPAS_PER_RUPA);
      }
    }
  });

  it('every planet aspects the 7th fully, on both the table and the curves', () => {
    for (const g of G9) expect(aspectQuarters(g, 1, 7), g).toBe(4);
    for (const f of [drishtiValueGeneral, drishtiValueSaturn, drishtiValueMars, drishtiValueJupiter]) {
      expect(f(180)).toBe(VIRUPAS_PER_RUPA);
    }
  });

  it('a FULL graded aspect means exactly what grahaAspectsFrom already said', () => {
    // This is what made the Part 7 retrofit safe: swapping the predicate from
    // grahaAspectsFrom to aspectQuarters could not change any existing rule meaning.
    for (const g of G9) {
      for (let from = 1; from <= 12; from++) {
        const full = grahaAspectsFrom(g, from).filter((x) => x != null);
        for (let to = 1; to <= 12; to++) {
          expect(aspectQuarters(g, from, to) === 4, `${g} ${from}->${to}`).toBe(full.includes(to));
        }
      }
    }
  });
});

// -- P8: the chapter's own printed answer key must keep agreeing ----------------
describe('invariant: the drishti curve still matches the chapter speculum', () => {
  it('reproduces every sampled speculum entry', () => {
    for (const [angle, virupas] of SPECULUM_SAMPLE) {
      expect(drishtiValueGeneral(angle), `angle ${angle}`).toBeCloseTo(virupas, 6);
    }
  });

  it('still disagrees with exactly the twelve known OCR-corrupt cells', () => {
    // If a future change made one of these agree, the change broke the formula.
    for (const [angle, printed, computed] of SPECULUM_OCR_FAULTS) {
      expect(drishtiValueGeneral(angle), `angle ${angle}`).toBeCloseTo(computed, 6);
      expect(Math.abs(drishtiValueGeneral(angle) - printed)).toBeGreaterThan(0.02);
    }
  });

  it('keeps the six restated rules a gapless partition of the active arc', () => {
    const bounds = ASPECT_RULES_RESTATED.map((r) => r.range.split('-').map(Number));
    expect(bounds[0]![0]).toBe(ASPECT_ACTIVE_ARC.from);
    expect(bounds[bounds.length - 1]![1]).toBe(ASPECT_ACTIVE_ARC.to);
    for (let i = 1; i < bounds.length; i++) expect(bounds[i]![0]).toBe(bounds[i - 1]![1]);
  });
});

// -- P9: Shadbala Sthana bala keeps its units and its identities ----------------
describe('invariant: Sthana bala components stay in their stated units', () => {
  it('Uchcha bala IS exaltationCloseness x 60, for every planet at every longitude', () => {
    // If these ever diverge, one of the two has been changed without the other.
    for (const g of SHADBALA_PLANETS) {
      for (let lon = 0; lon < 360; lon += 1) {
        expect(shadbalaUchchaBala(g, lon)!, `${g} @ ${lon}`)
          .toBeCloseTo(exaltationCloseness(g, lon)! * 60, 9);
      }
    }
  });

  it('Uchcha bala never leaves 0..60 virupas, and excludes the nodes', () => {
    for (const g of SHADBALA_PLANETS) {
      for (let lon = 0; lon < 360; lon += 2) {
        const v = shadbalaUchchaBala(g, lon)!;
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(VIRUPAS_PER_RUPA_27);
      }
    }
    expect(shadbalaUchchaBala('rahu', 0)).toBeNull();
    expect(shadbalaUchchaBala('ketu', 0)).toBeNull();
  });

  it('Saptavargaja and Vimsopaka stay DIFFERENT scales', () => {
    // Easy and invisible error: both grade dignity across vargas, with different units.
    expect(Object.keys(SAPTAVARGAJA_VIRUPAS)).toContain('moolatrikona');
    expect(Object.keys(VARGA_VISWA)).not.toContain('moolatrikona');
    expect(SAPTAVARGAJA_VIRUPAS.own).not.toBe(VARGA_VISWA.own);
  });

  it('the Sthana maximum stays 480 virupas, exactly eight rupas', () => {
    expect(STHANA_BALA_MAX).toBe(480);
    expect(STHANA_BALA_MAX % VIRUPAS_PER_RUPA_27).toBe(0);
    expect(SAPTAVARGAJA_MAX).toBe(315);
  });

  it('every planet has exactly one paying decanate, and every house pays some Kendradi', () => {
    for (const g of SHADBALA_PLANETS) {
      expect([5, 15, 25].filter((d) => drekkanaBala(g, d) > 0), g).toHaveLength(1);
    }
    for (let h = 1; h <= 12; h++) expect(kendradiBala(h)).toBeGreaterThan(0);
  });
});

// -- P10: the Shadbala virupa scales stay closed ---------------------------------
describe('invariant: Kala and Dig bala keep their units and complements', () => {
  it('the shared fold never leaves 0..60 virupas', () => {
    for (let a = 0; a < 360; a += 6) {
      for (let z = 0; z < 360; z += 13) {
        const v = foldedArcBala(a, z);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(VIRUPAS_PER_RUPA_27);
      }
    }
  });

  it('day and night Nathonnatha shares always sum to one rupa', () => {
    for (let gh = 0; gh <= 30; gh += 1) {
      expect(nathonnathaBala('moon', gh)! + nathonnathaBala('sun', gh)!)
        .toBe(VIRUPAS_PER_RUPA_27);
    }
  });

  it('benefic and malefic Paksha shares always sum to one rupa', () => {
    for (let e = 0; e < 360; e += 9) {
      expect(pakshaBala(e, 0, true) + pakshaBala(e, 0, false)).toBeCloseTo(VIRUPAS_PER_RUPA_27, 9);
    }
  });

  it('Ayana bala stays in 0..60 for every planet at every longitude', () => {
    for (const g of SHADBALA_PLANETS) {
      for (let l = 0; l < 360; l += 4) {
        const v = ayanaBala(g, l)!;
        expect(v, `${g} @ ${l}`).toBeGreaterThanOrEqual(0);
        expect(v, `${g} @ ${l}`).toBeLessThanOrEqual(VIRUPAS_PER_RUPA_27);
      }
    }
  });

  it('Naisargika virupas IS Part 1 naisargikaBala x 60', () => {
    for (const g of SHADBALA_PLANETS) {
      expect(naisargikaBalaVirupas(g)!, g).toBeCloseTo(naisargikaBala(g)! * 60, 9);
    }
  });

  it('Dig bala strong house agrees with Part 1 DIG_BALA_HOUSE', () => {
    for (const g of SHADBALA_PLANETS) {
      expect(DIG_BALA_STRONG_HOUSE[g], g).toBe(DIG_BALA_HOUSE[g]);
    }
  });

  it('the Kala maximum stays 390 virupas', () => {
    expect(KALA_BALA_MAX).toBe(390);
  });
});

// -- P11: the thresholds and war transfer stay coherent --------------------------
describe('invariant: Shadbala thresholds and graha yuddha', () => {
  it('every classical planet has a positive Shadbala requirement', () => {
    for (const g of SHADBALA_PLANETS) {
      expect(SHADBALA_REQUIRED[g], g).toBeGreaterThan(0);
    }
    expect(Object.keys(SHADBALA_REQUIRED)).toHaveLength(7);
  });

  it('the verdict is monotone in the total', () => {
    for (const g of SHADBALA_PLANETS) {
      const need = SHADBALA_REQUIRED[g]!;
      expect(shadbalaVerdict(g, need - 1)).toBe('weak');
      expect(shadbalaVerdict(g, need)).toBe('strong');
      expect(shadbalaVerdict(g, need + 1)).toBe('very-strong');
    }
  });

  it('no motion strength exceeds one rupa, and ordinary motion is the weakest', () => {
    for (const m of MOTION_ORDER) {
      expect(MOTION_STRENGTHS[m], m).toBeGreaterThan(0);
      expect(MOTION_STRENGTHS[m], m).toBeLessThanOrEqual(VIRUPAS_PER_RUPA_27);
      expect(MOTION_STRENGTHS[m], m).toBeGreaterThanOrEqual(MOTION_STRENGTHS.sama);
    }
    expect(MOTION_STRENGTHS.vakra).toBe(VIRUPAS_PER_RUPA_27);
  });

  it('every sign and half-sign maps to exactly one bhava reference angle', () => {
    const angles = ['ascendant', 'nadir', 'descendant', 'meridian'];
    for (let s = 0; s < 12; s++) {
      for (const d of [0, 14.9, 15, 29.9]) {
        expect(angles, `sign ${s} deg ${d}`).toContain(bhavaReferenceAngle(s, d));
      }
    }
  });

  it('the A/B/C component groups partition the seven planets', () => {
    const all = [
      ...COMPONENT_MINIMUMS.A.planets,
      ...COMPONENT_MINIMUMS.B.planets,
      ...COMPONENT_MINIMUMS.C.planets,
    ];
    expect(new Set(all).size).toBe(7);
    for (const g of SHADBALA_PLANETS) expect(componentGroupOf(g), g).not.toBeNull();
  });

  it('graha yuddha conserves the pair total', () => {
    for (const [a, b] of [[300, 260], [180, 420], [350, 350]] as const) {
      const r = grahaYuddha('mars', 'saturn', a, b);
      expect(r.victorShadbala + r.vanquishedShadbala).toBe(a + b);
    }
  });
});

// ── Retrofit (Part 5 sweep) — the LagnaReference dimension ───────────────────
describe('invariant: house predicates resolve against the named lagna', () => {
  const facts: ChartFacts = {
    lagnaSign: 10, // Aquarius
    lagnas: { hora: 0 }, // Hora lagna in Aries
    planets: {
      sun: { sign: 2, house: 5, longitude: 60 },
      moon: { sign: 5, house: 8, longitude: 178 },
      mars: { sign: 5, house: 8, longitude: 154 },
      mercury: { sign: 1, house: 4, longitude: 48 },
      jupiter: { sign: 9, house: 12, longitude: 298 },
      venus: { sign: 2, house: 5, longitude: 80 },
      saturn: { sign: 11, house: 2, longitude: 354 },
      rahu: { sign: 5, house: 8, longitude: 150 },
      ketu: { sign: 11, house: 2, longitude: 330 },
    },
  };

  it('defaults to the natal frame when no reference is named', () => {
    expect(evaluate({ k: 'placement', graha: 'venus', house: 5 }, facts)).toBe(true);
    expect(evaluate({ k: 'placement', graha: 'venus', house: 5, from: 'natal' }, facts)).toBe(true);
  });

  it('gives a different house in a different frame', () => {
    // Venus in Gemini: 5th from Aquarius, but 3rd from an Aries Hora lagna.
    expect(evaluate({ k: 'placement', graha: 'venus', house: 3, from: 'hora' }, facts)).toBe(true);
    expect(evaluate({ k: 'placement', graha: 'venus', house: 5, from: 'hora' }, facts)).toBe(false);
  });

  it('does NOT fall back to natal for a frame the chart lacks', () => {
    // Answering a Ghatika-lagna question from the natal chart would be worse than silence.
    expect(evaluate({ k: 'placement', graha: 'venus', house: 5, from: 'ghatika' }, facts)).toBe(false);
    expect(evaluate({ k: 'lordship', house: 7, occupies: 5, from: 'ghatika' }, facts)).toBe(false);
  });

  it('applies the frame to both halves of a lordship claim', () => {
    // Natal (Aquarius): 7th lord is the Sun, in the 5th.
    expect(evaluate({ k: 'lordship', house: 7, occupies: 5 }, facts)).toBe(true);
    // Hora frame (Aries): 7th is Libra, lord Venus, which sits in the 3rd from Aries.
    expect(evaluate({ k: 'lordship', house: 7, occupies: 3, from: 'hora' }, facts)).toBe(true);
  });
});

// ── Retrofit (Part 5 sweep) — the composition holds together ─────────────────
describe('invariant: varga grading composes end to end', () => {
  it('grades every classical planet in every scheme without throwing', () => {
    const schemes = Object.keys(VARGA_SCHEMES) as (keyof typeof VARGA_SCHEMES)[];
    for (const g of CLASSICAL_SEVEN) {
      for (const s of schemes) {
        for (const lon of [12.5, 97.3, 200.1, 318.8]) {
          const r = gradeVarga(g, lon, s);
          expect(r.applicable).toBe(true);
          expect(r.goodCount).toBeGreaterThanOrEqual(0);
          expect(r.goodCount).toBeLessThanOrEqual(VARGA_SCHEMES[s].length);
          expect(r.standings).toHaveLength(VARGA_SCHEMES[s].length);
        }
      }
    }
  });

  it('good count never exceeds the scheme size, and matches the standings', () => {
    for (const g of CLASSICAL_SEVEN) {
      const r = gradeVarga(g, 123.4, 'dasavarga');
      expect(r.goodCount).toBe(r.standings.filter((d) => d.good).length);
    }
  });

  it('reports the nodes as not applicable rather than scoring them zero', () => {
    for (const g of ['rahu', 'ketu'] as Graha[]) {
      const r = goodDivisionsFor(g, 123.4, 'dasavarga');
      expect(r.applicable).toBe(false);
      expect(r.note).toContain('not applicable');
    }
  });

  it('an exalted planet is good in D1 by construction', () => {
    // The Sun is exalted in Aries; at Aries 10° its D1 is Aries, so D1 must qualify.
    const r = goodDivisionsFor('sun', 10, 'shadvarga');
    const d1 = r.standings.find((d) => d.divisor === 1)!;
    expect(d1.good).toBe(true);
    expect(d1.reason).toBe('exalted');
  });

  it('the 6.53 veto still zeroes a fully-good planet', () => {
    const clean = gradeVarga('sun', 10, 'shadvarga');
    const vetoed = gradeVarga('sun', 10, 'shadvarga', { combust: true });
    expect(vetoed.goodCount).toBe(0);
    expect(vetoed.designation).toBeNull();
    expect(clean.goodCount).toBeGreaterThan(0);
  });
});

// ── Part 12 — Ishta and Kashta ───────────────────────────────────────────────
describe('invariant: the rays and the virupas stay one scale', () => {
  it('the two conversions are inverse for every strength', () => {
    for (let v = 0; v <= 60; v += 0.25) {
      expect(balaFromRasmi(rasmiFromBala(v))).toBeCloseTo(v, 10);
    }
  });

  it('a ray count never leaves 1..7 for any folded arc', () => {
    for (let lon = 0; lon < 360; lon += 2) {
      for (const zero of [0, 77, 190, 300]) {
        const r = uchchaRasmi(lon, zero);
        expect(r).toBeGreaterThanOrEqual(RASMI_MIN);
        expect(r).toBeLessThanOrEqual(RASMI_MAX);
      }
    }
  });

  it('Subha and Asubha rays always sum to 8', () => {
    for (let u = 1; u <= 7; u += 0.25) {
      const s = subhaRasmi(u, 8 - u);
      expect(s + asubhaRasmi(s)).toBeCloseTo(RASMI_PAIR_TOTAL, 10);
    }
  });
});

describe('invariant: Ishta and Kashta always divide one rupa', () => {
  it('holds for the two-component form', () => {
    for (let u = 0; u <= 60; u += 5) {
      for (let c = 0; c <= 60; c += 5) {
        expect(ishtaPhala(u, c) + kashtaPhala(ishtaPhala(u, c)))
          .toBeCloseTo(ISHTA_KASHTA_TOTAL, 10);
      }
    }
  });

  it('holds for the general 28.11-12 form over any 0-60 strength', () => {
    for (let v = 0; v <= 60; v += 0.5) {
      const r = ishtaKashtaOfBala(v);
      expect(r.ishta + r.kashta).toBeCloseTo(ISHTA_KASHTA_TOTAL, 10);
    }
  });

  it('the Moon’s Cheshta Rasmi still reproduces Paksha bala exactly', () => {
    // The cross-chapter identity Part 12 found. If either side is ever edited alone,
    // 27.18 and 28.4 stop agreeing and this catches it.
    for (let moon = 0; moon < 360; moon += 11) {
      const viaCh28 = balaFromRasmi(cheshtaRasmi(cheshtaKendraMoon(moon, 15)));
      expect(viaCh28).toBeCloseTo(pakshaBala(moon, 15, true), 9);
    }
  });

  it('the Sun’s Cheshta Kendra stays a quarter-circle ahead of the tropical Sun', () => {
    for (let lon = 0; lon < 360; lon += 13) {
      const d = (cheshtaKendraSun(lon) - lon + 360) % 360;
      expect(d).toBeCloseTo(90, 9);
    }
  });
});

describe('invariant: the subhanka ladder stays distinct from the bala ladder', () => {
  it('descends strictly across all nine tiers', () => {
    const vals = SUBHANKA_ORDER.map((t) => SUBHANKA[t]);
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeLessThan(vals[i - 1]!);
  });

  it('still disagrees with SAPTAVARGAJA_VIRUPAS at great-friend and neutral', () => {
    expect(SUBHANKA['great-friend']).not.toBe(SAPTAVARGAJA_VIRUPAS['great-friend']);
    expect(SUBHANKA.neutral).not.toBe(SAPTAVARGAJA_VIRUPAS.neutral);
  });

  it('pairs to 60 in the rasi and 30 in every other varga', () => {
    for (const t of SUBHANKA_ORDER) {
      expect(subhanka(t) + asubhanka(t)).toBe(60);
      expect(subhanka(t, 3) + asubhanka(t, 3)).toBe(30);
    }
  });

  it('keeps the verdict categorical — friend is auspicious below the numeric midpoint', () => {
    expect(SUBHANKA.friend).toBeLessThan(30);
    expect(tierVerdict('friend')).toBe('auspicious');
    expect(tierVerdict('neutral')).toBe('neutral');
  });
});

describe('invariant: attribution conserves what it splits', () => {
  it('shares always sum to one for any non-zero parts', () => {
    const s = balaShares({ a: 3, b: 17, c: 0.5 });
    expect(Object.values(s).reduce((x, y) => x + y, 0)).toBeCloseTo(1, 12);
  });

  it('attributed Ishta always sums back to the planet’s Ishta', () => {
    const attr = attributeIshta({ sthana: 210, kala: 133, dig: 41, drik: 8 }, 37.5);
    expect(Object.values(attr).reduce((x, y) => x + y, 0)).toBeCloseTo(37.5, 9);
  });

  it('a bhava ledger is antisymmetric — flipping every sign negates the net', () => {
    const terms = [
      { what: 'a', favourable: true, amount: 12 },
      { what: 'b', favourable: false, amount: 5 },
    ];
    const up = bhavaEffect({ bhavaIshta: 30, lordIshta: 30, contributors: terms });
    const down = bhavaEffect({
      bhavaIshta: 30, lordIshta: 30,
      contributors: terms.map((t) => ({ ...t, favourable: !t.favourable })),
    });
    expect(up.net).toBe(-down.net);
  });

  it('reckons the same seven planets Shadbala does', () => {
    expect([...ISHTA_KASHTA_PLANETS].sort()).toEqual([...CLASSICAL_SEVEN].sort());
  });
});

// ── Part 12 — the Jaimini layer (ch 29-31) ───────────────────────────────────
describe('invariant: a pada never rests where the text forbids', () => {
  it('lands on neither its own bhava nor the 7th, for all 144 pairs', () => {
    for (let h = 0; h < 12; h++) {
      for (let l = 0; l < 12; l++) {
        const rel = (bhavaPada(h as SignIndex, l as SignIndex) - h + 12) % 12;
        expect(rel, `${h}/${l}`).not.toBe(0);
        expect(rel, `${h}/${l}`).not.toBe(6);
      }
    }
  });

  it('the ch 29 re-derivation and the first corpus still agree everywhere', () => {
    // Two independent implementations of the same verses. If either is edited alone,
    // this is what notices.
    for (let h = 0; h < 12; h++) {
      for (let l = 0; l < 12; l++) {
        expect(bhavaPada(h as SignIndex, l as SignIndex)).toBe(arudhaOf(h, l));
      }
    }
  });

  it('names all twelve padas', () => {
    expect(Object.keys(PADA_NAMES)).toHaveLength(12);
  });

  it('classifies every pada relation without falling through', () => {
    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        expect(padaRelation(a as SignIndex, b as SignIndex)).toBeTruthy();
      }
    }
  });
});

describe('invariant: the argala tables stay reconciled across corpora', () => {
  it('ARGALA_PAIRS and VIRODHARGALA still describe the same scheme', () => {
    for (const { argala, obstructor } of ARGALA_PAIRS) {
      expect(VIRODHARGALA[argala], String(argala)).toBe(obstructor);
    }
    expect(ARGALA_PAIRS).toHaveLength(Object.keys(VIRODHARGALA).length);
  });

  it('only the two mirrored quarter pairs ever cancel', () => {
    let cancels = 0;
    for (const a of [1, 2, 3, 4] as const) {
      for (const o of [1, 2, 3, 4] as const) if (argalaQuarterCancelled(a, o)) cancels++;
    }
    expect(cancels).toBe(2);
  });

  it('quarterOf stays in 1..4 across a whole sign', () => {
    for (let d = 0; d < 30; d += 0.1) {
      const q = quarterOf(d);
      expect(q).toBeGreaterThanOrEqual(1);
      expect(q).toBeLessThanOrEqual(4);
    }
  });

  it('an argala with no intervening planet never prevails', () => {
    for (let o = 0; o < 4; o++) {
      expect(resolveArgala({ argalaCount: 0, obstructorCount: o }).prevails).toBe(false);
    }
  });
});

describe('invariant: every lagna reference is documented', () => {
  it('LAGNA_REFERENCE_USE covers every member of the union', () => {
    // The retrofit that added 'arudha' and 'upapada' must not leave either undescribed.
    for (const k of ['natal', 'bhava', 'hora', 'ghatika', 'arudha', 'upapada'] as const) {
      expect(LAGNA_REFERENCE_USE[k], k).toBeTruthy();
    }
  });

  it('the two Upapada conventions differ for exactly the six even ascendants', () => {
    let differ = 0;
    for (let s = 0; s < 12; s++) {
      if (upapadaHouse(s as SignIndex) !== upapadaHouse(s as SignIndex, 'twelfth')) differ++;
    }
    expect(differ).toBe(6);
  });
});

// ── Part 13 — Ashtakavarga (ch 66) ───────────────────────────────────────────
describe('invariant: the ashtakavarga tables stay what the chapter says', () => {
  it('every planet still hits its per-planet total', () => {
    // The check the codebase lacked. 337 alone cannot see a house moving between rows,
    // which is exactly the bug Part 13 found.
    for (const p of AV_PLANETS) {
      expect(avPlanetTotal(p), p).toBe(BPHS_AV_PLANET_TOTALS[p]);
    }
    expect(AV_GRAND_TOTAL).toBe(337);
  });

  it('every reference row stays a set of distinct houses in 1..12', () => {
    for (const p of AV_PLANETS) {
      for (const r of AV_REFS) {
        const row = AV_TABLE[p][r];
        expect(new Set(row).size, `${p}/${r}`).toBe(row.length);
        for (const h of row) {
          expect(h, `${p}/${r}`).toBeGreaterThanOrEqual(1);
          expect(h, `${p}/${r}`).toBeLessThanOrEqual(AV_HOUSES);
        }
      }
    }
  });

  it('no planet can exceed eight references times twelve houses', () => {
    for (const p of AV_PLANETS) {
      expect(avPlanetTotal(p)).toBeLessThanOrEqual(AV_MARKS_PER_PLANET);
    }
  });

  it('the Sun, Moon and Mars still match the verses they were transcribed from', () => {
    const sorted = (a: number[]) => [...a].sort((x, y) => x - y);
    for (const planet of ['sun', 'moon', 'mars'] as const) {
      for (const r of AV_REFS) {
        expect(sorted(AV_TABLE[planet][r]), `${planet}/${r}`)
          .toEqual(sorted(CH66A_TRANSCRIBED[planet][r]));
      }
    }
  });

  it('the Moon keeps the Part 13 correction', () => {
    expect(AV_TABLE.moon.moon).toContain(9);
    expect(AV_TABLE.moon.mars).not.toContain(9);
    expect(AV_TABLE.moon.jupiter).toContain(2);
    expect(AV_TABLE.moon.jupiter).not.toContain(12);
  });

  it('karana and rekha stay exact complements over twelve houses', () => {
    for (const p of AV_PLANETS) {
      for (const r of AV_REFS) {
        const rekha = AV_TABLE[p][r];
        const karana = rekhaFromKarana(rekha);
        expect(rekha.length + karana.length, `${p}/${r}`).toBe(AV_HOUSES);
        for (const h of rekha) expect(karana).not.toContain(h);
      }
    }
  });
});

// ── Part 14 — Ashtakavarga, Mercury / Jupiter / Venus ────────────────────────
describe('invariant: the ch 66b tables stay what the chapter says', () => {
  const sorted = (a: number[]) => [...a].sort((x, y) => x - y);

  it('Mercury, Jupiter and Venus still match the verses row by row', () => {
    // Row CONTENTS, not totals. The Venus error Part 14 found was a substitution inside
    // one row — every total in the system was blind to it.
    for (const planet of ['mercury', 'jupiter', 'venus'] as const) {
      for (const r of AV_REFS) {
        expect(sorted(AV_TABLE[planet][r]), `${planet}/${r}`)
          .toEqual(sorted(CH66B_TRANSCRIBED[planet][r]));
      }
    }
  });

  it('each of the three still closes against its karana verse', () => {
    for (const planet of ['mercury', 'jupiter', 'venus'] as const) {
      const derived = karanaCounts(CH66B_TRANSCRIBED[planet]);
      for (let h = 1; h <= AV_HOUSES; h++) {
        expect(derived[h], `${planet} house ${h}`).toBe(CH66B_KARANA_COUNTS[planet][h]);
      }
      expect(rekhaTotal(CH66B_TRANSCRIBED[planet]), planet)
        .toBe(BPHS_AV_PLANET_TOTALS[planet]);
    }
  });

  it('Venus keeps the Part 14 correction — Mars in the 4th, not the 5th', () => {
    expect(AV_TABLE.venus.mars).toContain(4);
    expect(AV_TABLE.venus.mars).not.toContain(5);
  });
});

// ── Part 15 — Saturn and the lagna's ashtakavarga ────────────────────────────
describe('invariant: chapter 66 stays fully reconciled', () => {
  const sorted = (a: number[]) => [...a].sort((x, y) => x - y);

  it('Saturn still matches the verses row by row', () => {
    for (const r of AV_REFS) {
      expect(sorted(AV_TABLE.saturn[r]), `saturn/${r}`)
        .toEqual(sorted(CH66_SATURN_REKHA[r]));
    }
  });

  it('the lagna table closes at 49 and agrees with its karana verse', () => {
    expect(rekhaTotal(CH66_LAGNA_REKHA)).toBe(LAGNA_AV_TOTAL);
    const derived = karanaCounts(CH66_LAGNA_REKHA);
    for (let h = 1; h <= AV_HOUSES; h++) {
      expect(derived[h], `house ${h}`).toBe(CH66_LAGNA_KARANA_COUNTS[h]);
    }
  });

  it('the lagna AV totals 49 for any placement of the eight references', () => {
    for (let shift = 0; shift < 12; shift++) {
      const refs = Object.fromEntries(
        AV_REFS.map((r, i) => [r, (shift + i * 7) % 12]),
      ) as Record<string, number>;
      expect(lagnaAshtakavarga(refs as never).reduce((a, b) => a + b, 0))
        .toBe(LAGNA_AV_TOTAL);
    }
  });

  it('the lagna is STILL not part of the Sarvashtakavarga', () => {
    // Folding it in would make 386 and change every transit reading in the app.
    expect(AV_PLANETS).toHaveLength(7);
    const refs = Object.fromEntries(AV_REFS.map((r, i) => [r, i])) as Record<string, number>;
    expect(ashtakavarga(refs as never).total).toBe(337);
    expect(Object.keys(ashtakavarga(refs as never).bav)).toHaveLength(7);
  });
});

// ── Part 16 — the ashtakavarga reductions ────────────────────────────────────
describe('invariant: the reductions still reproduce BPHS 67-69', () => {
  const rowOf = (vals: Record<number, number>): number[] => {
    const r = new Array(12).fill(0) as number[];
    for (const [s, v] of Object.entries(vals)) r[Number(s)] = v;
    return r;
  };

  it('ekadhipatya reproduces all five of BPHS 68’s worked cases', () => {
    // Three of these failed before Part 16. If any rule is "simplified" back, this catches it.
    for (const c of CH68_ILLUSTRATION) {
      const [a2, b2] = c.signs;
      const out = ekadhipatyaSodhana(rowOf({ [a2]: c.before[0], [b2]: c.before[1] }), c.occupied);
      expect([out[a2], out[b2]], c.pair).toEqual([c.after[0], c.after[1]]);
    }
  });

  it('no reduction ever increases a value or produces a negative', () => {
    const bav = [4, 3, 5, 2, 6, 1, 3, 4, 2, 5, 3, 2];
    for (const occ of [[], [0], [1, 6], [0, 4, 9], [0, 1, 2, 5, 6, 7, 8, 9, 10, 11]]) {
      const out = sodhitaAshtakavarga(bav, occ);
      for (let s = 0; s < 12; s++) {
        expect(out[s]!).toBeGreaterThanOrEqual(0);
        expect(out[s]!).toBeLessThanOrEqual(bav[s]!);
      }
    }
  });

  it('the pinda pipeline still reaches BPHS 69’s 100 / 48 / 148', () => {
    const sp = sodhyaPinda([...CH69_WORKED_EXAMPLE.soav], CH69_WORKED_EXAMPLE.planetSigns);
    expect(sp.rasiPinda).toBe(100);
    expect(sp.grahaPinda).toBe(48);
    expect(sp.sodhyaPinda).toBe(148);
  });

  it('the multipliers stay at the values the worked example requires', () => {
    // The VERSE says 6 for Capricorn and for Sun/Moon/Mercury/Saturn. The example says 5,
    // and only 5 makes its arithmetic close. Guarded because the verse is the tempting read.
    expect(RASI_MULTIPLIER[9]).toBe(5);
    for (const p of ['sun', 'moon', 'mercury', 'saturn'] as const) {
      expect(GRAHA_MULTIPLIER[p], p).toBe(5);
    }
  });
});

// ── Part 17 — effects keyed to bindu counts ──────────────────────────────────
describe('invariant: the ch 70 trigger formula stays inside its cycles', () => {
  it('never leaves 0..26 and 0..11, for any rekha count and any yoga pinda', () => {
    for (let r = 0; r <= 8; r++) {
      for (const yp of [0, 1, 37, 100, 148, 337, 999]) {
        const t = avTrigger(r, yp);
        expect(t.nakshatra, `${r}/${yp}`).toBeGreaterThanOrEqual(0);
        expect(t.nakshatra, `${r}/${yp}`).toBeLessThan(NAKSHATRA_COUNT);
        expect(t.rasi, `${r}/${yp}`).toBeGreaterThanOrEqual(0);
        expect(t.rasi, `${r}/${yp}`).toBeLessThan(RASI_COUNT);
      }
    }
  });

  it('the trines stay evenly spaced and distinct from the point', () => {
    for (const r of [1, 3, 5, 8]) {
      const t = avTrigger(r, 148);
      expect(t.trikonaNakshatras).not.toContain(t.nakshatra);
      expect(t.trikonaRasis).not.toContain(t.rasi);
      expect((t.trikonaRasis[0]! - t.rasi + 12) % 12).toBe(4);
    }
  });

  it('the transit verdict stays monotone in the rekha count', () => {
    const order = { unfavourable: 0, neutral: 1, favourable: 2 };
    let last = -1;
    for (let r = 0; r <= 8; r++) {
      const v = order[transitVerdict(r)];
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
    expect(transitVerdict(TRANSIT_MIDPOINT)).toBe('neutral');
  });

  it('every ch 70 rule reads a bindu count and surfaces nothing mortal', () => {
    for (const r of ashtakavargaEffectRules()) {
      expect(r.when[0]!.k, r.id).toBe('bindus');
      expect(r.effect.summary, r.id).not.toMatch(/death|die|illness|disease|short-lived/i);
    }
  });

  it('Mars still has no assumed house for siblings', () => {
    expect(AV_MATTER_HOUSE.mars).toBeNull();
  });
});

// ── Part 18 — aggregate AV, rays, Sudarshana ─────────────────────────────────
describe('invariant: chapters 72-74 stay consistent with the rest', () => {
  it('the samudaya band is monotone and keeps the text’s boundaries', () => {
    const order = { adverse: 0, medium: 1, favourable: 2 };
    let last = -1;
    for (let r = 0; r <= 56; r++) {
      const v = order[samudayaBand(r)];
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
    expect(samudayaBand(30)).toBe('medium');
    expect(samudayaBand(25)).toBe('medium');
    expect(samudayaBand(Math.round(SAV_MEAN_PER_SIGN))).toBe('medium');
  });

  it('ch 73 rays ARE exaltationCloseness times the planet maximum', () => {
    // The seventh user of the same folded arc. If either side is edited alone, this fails.
    for (let lon = 0; lon < 360; lon += 11) {
      expect(planetRays(lon, 190, 10)).toBeCloseTo(exaltationCloseness('sun', lon)! * 10, 6);
    }
  });

  it('ch 73 rays are NOT ch 28 rasmi — they disagree at the debilitation point', () => {
    expect(rasmiFromBala(0)).toBe(1);
    expect(planetRays(190, 190, 10)).toBe(0);
  });

  it('every planet’s rays stay within 0 and its stated maximum', () => {
    for (const [g, max] of Object.entries(RAYS_AT_EXALTATION)) {
      for (let lon = 0; lon < 360; lon += 9) {
        const r = planetRays(lon, 190, max);
        expect(r, g).toBeGreaterThanOrEqual(0);
        expect(r, g).toBeLessThanOrEqual(max + 1e-9);
      }
    }
    expect(Object.values(RAYS_AT_EXALTATION).reduce((a, b) => a + b, 0)).toBe(RAYS_TOTAL_MAX);
  });

  it('the ray dignity ladder descends strictly and is multiplicative', () => {
    const order = ['exalted', 'moolatrikona', 'own', 'great-friend', 'friend', 'neutral', 'enemy', 'great-enemy'];
    for (let i = 1; i < order.length; i++) {
      expect(RAY_DIGNITY_FACTOR[order[i]!]!).toBeLessThan(RAY_DIGNITY_FACTOR[order[i - 1]!]!);
    }
    expect(RAY_DIGNITY_FACTOR.neutral).toBe(1);
  });

  it('the three Sudarshana frames stay in step for every house', () => {
    for (let h = 1; h <= 12; h++) {
      const s = sudarshanaSigns(h as House, 0 as SignIndex, 4 as SignIndex, 9 as SignIndex);
      expect((s.moon - s.lagna + 12) % 12).toBe(4);
      expect((s.sun - s.lagna + 12) % 12).toBe(9);
    }
  });

  it('unanimity is reported in both directions', () => {
    expect(sudarshanaAgreement([true, true, true]).unanimous).toBe(true);
    expect(sudarshanaAgreement([false, false, false]).unanimous).toBe(true);
    expect(sudarshanaAgreement([true, true, false]).unanimous).toBe(false);
  });
});
