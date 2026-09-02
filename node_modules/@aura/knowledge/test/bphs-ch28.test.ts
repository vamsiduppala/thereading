// BPHS Programme Part 12 — Chapter 28: Ishta and Kashta bala.
//
// The chapter's claims are mostly identities with chapters 9 and 27, so most of these
// tests are cross-checks rather than table lookups. If ch 28 and ch 27 ever drift apart,
// these fail before anything downstream notices.

import { describe, it, expect } from 'vitest';
import {
  RASMI_MIN, RASMI_MAX, rasmiFromBala, balaFromRasmi,
  uchchaRasmi, cheshtaRasmi, cheshtaKendraSun, cheshtaKendraMoon, CHESHTA_KENDRA_SOURCE,
  RASMI_PAIR_TOTAL, subhaRasmi, asubhaRasmi,
  ISHTA_KASHTA_TOTAL, ishtaPhala, kashtaPhala, ishtaKashtaOf,
  ishtaKashtaOfBala, ANY_BALA_IS_ITS_OWN_ISHTA,
  SUBHANKA, SUBHANKA_ORDER, subhanka, asubhanka,
  SUBHANKA_SAPTAVARGA_MAX, SUBHANKA_VS_SAPTAVARGAJA, tierVerdict,
  balaShares, attributeIshta, VERSE_13_CONFLICT,
  aspectIshtaKashta, bhavaEffect, twoSignBhava, CH28_NOT_ENCODED,
  ISHTA_KASHTA_PLANETS,
  foldedArcBala, pakshaBala, ayanaBala, SAPTAVARGAJA_VIRUPAS,
  type SubhankaTier,
} from '../src/index.js';

// ── 28.2 Uchcha Rasmi ────────────────────────────────────────────────────────
describe('BPHS 28.2 — exaltation rays', () => {
  it('runs 1 at the debilitation point to 7 at the exaltation point', () => {
    expect(uchchaRasmi(190, 190)).toBe(RASMI_MIN);   // Sun at its own debilitation
    expect(uchchaRasmi(10, 190)).toBe(RASMI_MAX);    // Sun at deep exaltation
  });

  it('is the seventh user of the shared fold, in different units', () => {
    for (let lon = 0; lon < 360; lon += 17) {
      expect(uchchaRasmi(lon, 190)).toBeCloseTo(1 + foldedArcBala(lon, 190) / 10, 12);
    }
  });

  it('never leaves 1..7 for any longitude', () => {
    for (let lon = 0; lon < 360; lon += 3) {
      const r = uchchaRasmi(lon, 190);
      expect(r).toBeGreaterThanOrEqual(RASMI_MIN);
      expect(r).toBeLessThanOrEqual(RASMI_MAX);
    }
  });

  it('converts between rays and virupas reversibly — which is what verse 6 relies on', () => {
    for (const v of [0, 7.5, 30, 42.25, 60]) {
      expect(balaFromRasmi(rasmiFromBala(v))).toBeCloseTo(v, 12);
    }
  });
});

// ── 28.3-4 Cheshta Kendra for the luminaries ─────────────────────────────────
describe('BPHS 28.3-4 — the luminaries finally get their Cheshta Kendra', () => {
  it('puts the Sun three signs ahead of its tropical longitude', () => {
    expect(cheshtaKendraSun(0)).toBe(90);
    expect(cheshtaKendraSun(300)).toBe(30);   // wraps
  });

  it('makes the Moon’s Cheshta Kendra the elongation', () => {
    expect(cheshtaKendraMoon(200, 50)).toBe(150);
    expect(cheshtaKendraMoon(10, 350)).toBe(20);   // wraps
  });

  it('CONFIRMS 27.18 for the Moon exactly — its Cheshta bala IS its Paksha bala', () => {
    // The identity the chapters together assert: fold the elongation, divide by three,
    // and you have written Paksha bala for a benefic without meaning to.
    for (let moon = 0; moon < 360; moon += 23) {
      for (const sun of [0, 97, 244]) {
        const cheshta = balaFromRasmi(cheshtaRasmi(cheshtaKendraMoon(moon, sun)));
        expect(cheshta).toBeCloseTo(pakshaBala(moon, sun, true), 9);
      }
    }
  });

  it('is a linear stand-in for the Sun’s Ayana bala, agreeing at equinox and solstices', () => {
    // Tropical Aries 0 → 30 virupas; Cancer 0 → 60; Capricorn 0 → 0. Ayana bala's own
    // curve passes through the same three points and bulges between them, which is the
    // difference between a linear rule and a declination one.
    const sunCheshta = (lon: number) => balaFromRasmi(cheshtaRasmi(cheshtaKendraSun(lon)));
    for (const lon of [0, 90, 180, 270]) {
      expect(sunCheshta(lon)).toBeCloseTo(ayanaBala('sun', lon)!, 6);
    }
    // and diverges in between — if this ever stopped being true one of them changed
    expect(Math.abs(sunCheshta(45) - ayanaBala('sun', 45)!)).toBeGreaterThan(1);
  });

  it('names a Cheshta Kendra source for all seven planets', () => {
    for (const g of ISHTA_KASHTA_PLANETS) {
      expect(CHESHTA_KENDRA_SOURCE[g], g).toBeTruthy();
    }
    expect(CHESHTA_KENDRA_SOURCE.sun).toContain('28.4');
    expect(CHESHTA_KENDRA_SOURCE.saturn).toContain('27.24-25');
  });
});

// ── 28.5 Subha and Asubha Rasmi ──────────────────────────────────────────────
describe('BPHS 28.5 — auspicious and inauspicious rays', () => {
  it('averages the two rays and takes the remainder to 8', () => {
    expect(subhaRasmi(7, 3)).toBe(5);
    expect(asubhaRasmi(5)).toBe(3);
  });

  it('always sums to 8', () => {
    for (let u = 1; u <= 7; u += 0.5) {
      for (let c = 1; c <= 7; c += 0.5) {
        const s = subhaRasmi(u, c);
        expect(s + asubhaRasmi(s)).toBeCloseTo(RASMI_PAIR_TOTAL, 12);
      }
    }
  });
});

// ── 28.6 Ishta and Kashta Phala ──────────────────────────────────────────────
describe('BPHS 28.6 — Ishta Phala turns out to be Shadbala arithmetic', () => {
  it('is the mean of Uchcha bala and Cheshta bala, in virupas', () => {
    expect(ishtaPhala(60, 0)).toBe(30);
    expect(ishtaPhala(45, 15)).toBe(30);
    expect(ishtaPhala(60, 60)).toBe(60);
  });

  it('reproduces the verse’s own rasmi route exactly', () => {
    // "reduce 1 from each rasmi, multiply by 10, add, halve" — the long way round.
    const pairs: [number, number][] = [[12, 48], [0, 0], [60, 60], [33.3, 7.7]];
    for (const [u, c] of pairs) {
      const viaRasmi = (balaFromRasmi(rasmiFromBala(u)) + balaFromRasmi(rasmiFromBala(c))) / 2;
      expect(viaRasmi).toBeCloseTo(ishtaPhala(u, c), 9);
    }
  });

  it('agrees with the Subha Rasmi route of verse 5 — the chapter is self-consistent', () => {
    const pairs: [number, number][] = [[10, 50], [60, 0], [25, 25]];
    for (const [u, c] of pairs) {
      const s = subhaRasmi(rasmiFromBala(u), rasmiFromBala(c));
      expect(balaFromRasmi(s)).toBeCloseTo(ishtaPhala(u, c), 9);
      expect(balaFromRasmi(asubhaRasmi(s))).toBeCloseTo(kashtaPhala(ishtaPhala(u, c)), 9);
    }
  });

  it('always splits one rupa between Ishta and Kashta', () => {
    for (let u = 0; u <= 60; u += 6) {
      for (let c = 0; c <= 60; c += 6) {
        const r = ishtaKashtaOf(u, c);
        expect(r.ishta + r.kashta).toBeCloseTo(ISHTA_KASHTA_TOTAL, 12);
      }
    }
  });

  it('calls the midpoint neutral rather than guessing', () => {
    expect(ishtaKashtaOf(30, 30).verdict).toBe('neutral');
    expect(ishtaKashtaOf(60, 60).verdict).toBe('auspicious');
    expect(ishtaKashtaOf(0, 0).verdict).toBe('inauspicious');
  });
});

// ── 28.7-9 Subhanka ──────────────────────────────────────────────────────────
describe('BPHS 28.7-9 — the nine-tier tendency ladder', () => {
  it('matches the verse: 60, 45, 30, 22, 15, 8, 4, 2, 0', () => {
    expect(SUBHANKA_ORDER.map((t) => SUBHANKA[t])).toEqual([60, 45, 30, 22, 15, 8, 4, 2, 0]);
  });

  it('descends strictly — no two tiers are worth the same', () => {
    const vals = SUBHANKA_ORDER.map((t) => SUBHANKA[t]);
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeLessThan(vals[i - 1]!);
  });

  it('is NOT the ch 27 Saptavargaja ladder — they disagree at two shared tiers', () => {
    // The whole point of keeping them apart. If someone ever "tidies" one into the other
    // this fails immediately.
    expect(SUBHANKA['great-friend']).toBe(22);
    expect(SAPTAVARGAJA_VIRUPAS['great-friend']).toBe(20);
    expect(SUBHANKA.neutral).toBe(8);
    expect(SAPTAVARGAJA_VIRUPAS.neutral).toBe(10);
    expect(SUBHANKA_VS_SAPTAVARGAJA).toContain('Do not merge');
  });

  it('adds the two tiers ch 27 leaves out', () => {
    expect(SUBHANKA.exalted).toBe(60);
    expect(SUBHANKA.debilitated).toBe(0);
    expect('exalted' in SAPTAVARGAJA_VIRUPAS).toBe(false);
    expect('debilitated' in SAPTAVARGAJA_VIRUPAS).toBe(false);
  });

  it('pairs subhanka with asubhanka to 60 in the rasi, 30 elsewhere', () => {
    for (const t of SUBHANKA_ORDER) {
      expect(subhanka(t) + asubhanka(t)).toBe(60);
      expect(subhanka(t, 9) + asubhanka(t, 9)).toBe(30);
    }
  });

  it('caps the saptavarga total at 240', () => {
    expect(SUBHANKA_SAPTAVARGA_MAX).toBe(240);
    expect(subhanka('exalted') + 6 * subhanka('exalted', 9)).toBe(SUBHANKA_SAPTAVARGA_MAX);
  });
});

// ── 28.10 The categorical verdict ────────────────────────────────────────────
describe('BPHS 28.10 — the verdict is categorical, not a threshold', () => {
  it('splits the nine tiers five / one / three', () => {
    const v = SUBHANKA_ORDER.map(tierVerdict);
    expect(v.filter((x) => x === 'auspicious')).toHaveLength(5);
    expect(v.filter((x) => x === 'neutral')).toHaveLength(1);
    expect(v.filter((x) => x === 'inauspicious')).toHaveLength(3);
  });

  it('calls a friend’s sign auspicious at only 15 of 60 — no threshold reproduces this', () => {
    expect(SUBHANKA.friend).toBe(15);
    expect(tierVerdict('friend')).toBe('auspicious');
    expect(tierVerdict('neutral')).toBe('neutral');
    // A naive "auspicious if above half" rule would call friend inauspicious.
    expect(SUBHANKA.friend).toBeLessThan(30);
  });
});

// ── 28.11-12 Any strength is its own Ishta ───────────────────────────────────
describe('BPHS 28.11-12 — the generalisation', () => {
  it('reads any 0-60 strength as its own Ishta with the remainder as Kashta', () => {
    expect(ishtaKashtaOfBala(45)).toMatchObject({ ishta: 45, kashta: 15, verdict: 'auspicious' });
    expect(ishtaKashtaOfBala(15)).toMatchObject({ ishta: 15, kashta: 45, verdict: 'inauspicious' });
    expect(ishtaKashtaOfBala(30).verdict).toBe('neutral');
  });

  it('applies unchanged to a Dig bala and a Paksha bala — the verse’s own examples', () => {
    const paksha = pakshaBala(190, 10, true);
    expect(ishtaKashtaOfBala(paksha).ishta).toBe(paksha);
    expect(ishtaKashtaOfBala(paksha).kashta).toBeCloseTo(60 - paksha, 12);
  });

  it('records the scope limit rather than pretending totals work too', () => {
    expect(ANY_BALA_IS_ITS_OWN_ISHTA).toContain('other scales');
  });
});

// ── 28.13 Proportional attribution ───────────────────────────────────────────
describe('BPHS 28.13 — attribution across the components', () => {
  it('turns component strengths into shares summing to one', () => {
    const s = balaShares({ sthana: 300, kala: 150, dig: 50 });
    expect(s.sthana! + s.kala! + s.dig!).toBeCloseTo(1, 12);
    expect(s.sthana).toBeCloseTo(0.6, 12);
  });

  it('survives an all-zero input without dividing by zero', () => {
    expect(balaShares({ a: 0, b: 0 })).toEqual({ a: 0, b: 0 });
  });

  it('splits Ishta so the parts sum back to the whole', () => {
    const parts = { sthana: 300, kala: 150, dig: 50 };
    const attr = attributeIshta(parts, 42);
    expect(Object.values(attr).reduce((a, b) => a + b, 0)).toBeCloseTo(42, 9);
  });

  it('tells two equally strong planets apart by where the strength came from', () => {
    const a = attributeIshta({ sthana: 400, kala: 100 }, 40);
    const b = attributeIshta({ sthana: 100, kala: 400 }, 40);
    expect(a.sthana).toBeGreaterThan(b.sthana!);
  });

  it('records the divide-versus-multiply conflict and which way it went', () => {
    expect(VERSE_13_CONFLICT).toContain('Sanskrit');
    expect(VERSE_13_CONFLICT).toContain('bphs.04.022');
  });
});

// ── 28.14 Aspects carry the tendency ─────────────────────────────────────────
describe('BPHS 28.14 — an aspect inherits its sender’s tendency', () => {
  it('gives a full aspect from an exalted planet all-auspicious weight', () => {
    expect(aspectIshtaKashta(60, 'exalted')).toEqual({ auspicious: 60, inauspicious: 0 });
  });

  it('makes the same full aspect from a debilitated planet a pure liability', () => {
    expect(aspectIshtaKashta(60, 'debilitated')).toEqual({ auspicious: 0, inauspicious: 60 });
  });

  it('scales with the strength of the aspect, not just its existence', () => {
    const full = aspectIshtaKashta(60, 'own');
    const quarter = aspectIshtaKashta(15, 'own');
    expect(quarter.auspicious).toBeCloseTo(full.auspicious / 4, 12);
  });
});

// ── 28.15-20 Bhava effects ───────────────────────────────────────────────────
describe('BPHS 28.15-20 — the text’s own arbitration procedure', () => {
  it('combines the bhava’s strength with its lord’s', () => {
    const r = bhavaEffect({ bhavaIshta: 40, lordIshta: 50 });
    expect(r.auspicious).toBe(90);
    expect(r.inauspicious).toBe(20 + 10);
    expect(r.verdict).toBe('auspicious');
  });

  it('moves a benefic occupant into one column and out of the other', () => {
    const base = bhavaEffect({ bhavaIshta: 30, lordIshta: 30 });
    const withBenefic = bhavaEffect({
      bhavaIshta: 30, lordIshta: 30,
      contributors: [{ what: 'Jupiter in the bhava', favourable: true, amount: 12 }],
    });
    expect(withBenefic.auspicious).toBe(base.auspicious + 12);
    expect(withBenefic.inauspicious).toBe(base.inauspicious - 12);
  });

  it('reverses the motion exactly for a malefic', () => {
    const good = bhavaEffect({
      bhavaIshta: 30, lordIshta: 30,
      contributors: [{ what: 'x', favourable: true, amount: 12 }],
    });
    const bad = bhavaEffect({
      bhavaIshta: 30, lordIshta: 30,
      contributors: [{ what: 'x', favourable: false, amount: 12 }],
    });
    expect(good.net).toBe(-bad.net);
  });

  it('lets Ashtakavarga bindus and rekhas enter as ordinary signed terms', () => {
    const r = bhavaEffect({
      bhavaIshta: 30, lordIshta: 30, ashtakavarga: { bindus: 6, rekhas: 2 },
    });
    expect(r.net).toBe(2 * (6 - 2));
    expect(r.ledger.map((c) => c.what)).toContain('ashtakavarga bindus');
  });

  it('lets a well-placed lord be outvoted by enough malefic weight', () => {
    const r = bhavaEffect({
      bhavaIshta: 55, lordIshta: 55,
      contributors: [
        { what: 'Saturn in the bhava', favourable: false, amount: 40 },
        { what: 'Mars aspecting', favourable: false, amount: 30 },
      ],
    });
    expect(r.verdict).toBe('inauspicious');
  });

  it('picks the richer of two rasis for a split bhava, and averages a tie', () => {
    expect(twoSignBhava(6, 3)).toBe('first');
    expect(twoSignBhava(3, 6)).toBe('second');
    expect(twoSignBhava(4, 4)).toBe('average');
  });

  it('records what it consumes rather than computes', () => {
    expect(CH28_NOT_ENCODED['18']).toContain('chapter 66');
    expect(CH28_NOT_ENCODED['19-20']).toContain('bhava madhya');
  });
});

// ── The chapter's own scope ──────────────────────────────────────────────────
describe('BPHS 28 — scope', () => {
  it('reckons the same seven planets as Shadbala and excludes the nodes', () => {
    expect(ISHTA_KASHTA_PLANETS).toHaveLength(7);
    expect(ISHTA_KASHTA_PLANETS).not.toContain('rahu');
    expect(ISHTA_KASHTA_PLANETS).not.toContain('ketu');
  });

  it('keeps every tier of the ladder addressable by name', () => {
    const tiers: SubhankaTier[] = [...SUBHANKA_ORDER];
    expect(new Set(tiers).size).toBe(9);
  });
});
