// The aggregators that made Shadbala's remaining components computable.
//
// `shadbala-pinda.ts` has always been able to assemble six components; three of them had no
// producer. These are the producers. The assertions here are about the two places where a
// plausible implementation goes quietly wrong: the Moon's moolatrikona, and which planets land
// in which Drik bucket.

import { describe, it, expect } from 'vitest';
import {
  saptavargajaTierInSign, saptavargajaTierFor, drikPindas,
  DRIK_MALEFICS, DRIK_BENEFICS, DRIK_FULL_ASPECT, DRIK_NODES_EXCLUDED,
  SAPTAVARGAJA_COMPOUND_GAP, PERIOD_LORDS_ARE_SAURA_NOT_SAVANA, WEEKDAY_LORD_ORDER,
  saptavargajaBala, SAPTAVARGAJA_VIRUPAS, SAPTAVARGA_DIVISIONS, drikBala,
  temporaryRelationIn, temporaryFriendsOf, compoundRelationIn, saptavargajaTierForChart,
  COMPOUND_UNLOCKS_THE_EXTREMES, TEMPORARY_IS_READ_IN_THE_RASI, vargaViswaTier,
} from '../src/index.js';
import type { Graha, SignIndex } from '../src/types.js';

describe('Saptavargaja’s dignity tier (27.2-4)', () => {
  it('gets the Moon right, which is where a list-based test would fail', () => {
    // The Moon is the one planet whose moolatrikona sign is NOT a sign it owns: its
    // moolatrikona is TAURUS (Venus's) while it rules CANCER. An implementation that treated
    // "moolatrikona" and "own" as one list would score it wrongly in both signs.
    expect(saptavargajaTierInSign('moon', 1 as SignIndex)).toBe('moolatrikona'); // Taurus
    expect(saptavargajaTierInSign('moon', 3 as SignIndex)).toBe('own');          // Cancer
  });

  it('gives each other planet moolatrikona in a sign it also owns', () => {
    const mt: Array<[Graha, SignIndex]> = [
      ['sun', 4 as SignIndex], ['mars', 0 as SignIndex], ['mercury', 5 as SignIndex],
      ['jupiter', 8 as SignIndex], ['venus', 6 as SignIndex], ['saturn', 10 as SignIndex],
    ];
    for (const [g, s] of mt) expect(saptavargajaTierInSign(g, s), g).toBe('moolatrikona');
    // And their plain own signs come out as 'own', not as moolatrikona.
    expect(saptavargajaTierInSign('mars', 7 as SignIndex)).toBe('own');      // Scorpio
    expect(saptavargajaTierInSign('jupiter', 11 as SignIndex)).toBe('own');  // Pisces
    expect(saptavargajaTierInSign('saturn', 9 as SignIndex)).toBe('own');    // Capricorn
  });

  it('falls back to the natural relationship elsewhere', () => {
    // The Sun's friends are the Moon, Mars and Jupiter (3.55). Cancer is the Moon's, so the
    // Sun there is a friend's guest.
    expect(saptavargajaTierInSign('sun', 3 as SignIndex)).toBe('friend');
    // Saturn is the Sun's enemy; Capricorn is Saturn's.
    expect(saptavargajaTierInSign('sun', 9 as SignIndex)).toBe('enemy');
  });

  it('reaches only five of the seven tiers without a compound relationship', () => {
    // `great-friend` and `great-enemy` need the temporary relationship, which is chart-specific
    // and cannot come from a longitude. This is stated rather than hidden — and it is the same
    // limitation ch 7's Vimsopaka carries.
    const reached = new Set<string>();
    for (let sign = 0; sign < 12; sign++) {
      for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as Graha[]) {
        reached.add(saptavargajaTierInSign(g, sign as SignIndex));
      }
    }
    expect(reached.has('great-friend')).toBe(false);
    expect(reached.has('great-enemy')).toBe(false);
    expect(reached.size).toBe(5);
    expect(SAPTAVARGAJA_COMPOUND_GAP).toContain('great-friend');

    // A supplied compound relation does reach them.
    expect(saptavargajaTierInSign('sun', 3 as SignIndex, 'great-friend')).toBe('great-friend');
  });

  it('walks all seven divisions and stays inside the scale', () => {
    const tierFor = saptavargajaTierFor('jupiter', 123.456);
    const seen = SAPTAVARGA_DIVISIONS.map((d) => tierFor(d));
    expect(seen).toHaveLength(7);
    for (const t of seen) expect(SAPTAVARGAJA_VIRUPAS[t]).toBeGreaterThan(0);

    const total = saptavargajaBala(tierFor);
    expect(total).toBeGreaterThan(0);
    // Seven divisions, best case moolatrikona (45) in each.
    expect(total).toBeLessThanOrEqual(45 * 7);
  });

  it('varies with longitude, so it is reading the vargas and not just the rasi', () => {
    // Two longitudes in the SAME rasi sign but different navamsas must generally differ. If
    // `vargaSign` were ignored, every longitude in a sign would score identically.
    const a = saptavargajaBala(saptavargajaTierFor('venus', 5));
    const b = saptavargajaBala(saptavargajaTierFor('venus', 27));
    expect(Math.floor(5 / 30)).toBe(Math.floor(27 / 30)); // same rasi
    expect(a).not.toBe(b);
  });
});

describe('Drik bala’s aspect pindas (27.19)', () => {
  it('puts a full 7th-house aspect at 60 virupas in the right bucket', () => {
    // Venus opposite the Sun: the general curve gives 60 at 180°, and Venus is a benefic that
    // is neither Mercury nor Jupiter, so it lands in `benefic`.
    const p = drikPindas({ venus: 0, sun: 180 }, { moonIsBenefic: true });
    expect(p.sun!.benefic).toBeCloseTo(60, 6);
    expect(p.sun!.mercuryJupiter).toBe(0);
    // And the Sun is a malefic casting back onto Venus.
    expect(p.venus!.malefic).toBeCloseTo(60, 6);
    expect(p.venus!.benefic).toBe(0);
  });

  it('routes Mercury and Jupiter to their own bucket, whatever their nature', () => {
    // 27.19 says to "super add the entire aspect" of these two. That is what makes Drik bala
    // computable at all: Mercury's benefic status is otherwise chart-dependent, and the verse
    // removes the need to decide it.
    const p = drikPindas({ mercury: 0, jupiter: 90, saturn: 180 }, { moonIsBenefic: true });
    expect(p.saturn!.mercuryJupiter).toBeGreaterThan(0);
    expect(p.saturn!.benefic).toBe(0);
    expect(DRIK_FULL_ASPECT.sort()).toEqual(['jupiter', 'mercury']);
    expect(DRIK_BENEFICS).not.toContain('mercury');
    expect(DRIK_MALEFICS).not.toContain('mercury');
  });

  it('switches the Moon between buckets with the paksha', () => {
    // Waxing the Moon is a benefic and waning a malefic. It is half of all charts either way,
    // so `moonIsBenefic` is required rather than defaulted — a guess would bias every Drik
    // bala in the same direction.
    const waxing = drikPindas({ moon: 0, mars: 180 }, { moonIsBenefic: true });
    const waning = drikPindas({ moon: 0, mars: 180 }, { moonIsBenefic: false });
    expect(waxing.mars!.benefic).toBeGreaterThan(0);
    expect(waxing.mars!.malefic).toBe(0);
    expect(waning.mars!.malefic).toBeGreaterThan(0);
    expect(waning.mars!.benefic).toBe(0);
  });

  it('counts the Sun as a malefic here', () => {
    // Natural classification, not functional — and NOT the `isBeneficForPaksha` set, which
    // includes different planets for a different purpose.
    expect(DRIK_MALEFICS.sort()).toEqual(['mars', 'saturn', 'sun']);
  });

  it('excludes the nodes rather than running them through the general curve', () => {
    const withNodes = drikPindas(
      { sun: 0, rahu: 180, ketu: 0 }, { moonIsBenefic: true },
    );
    // Rahu is opposite the Sun; if it were counted, the Sun would receive a full 60.
    expect(withNodes.sun!.malefic).toBe(0);
    expect(withNodes.sun!.benefic).toBe(0);
    expect(withNodes.rahu).toBeUndefined();
    expect(withNodes.ketu).toBeUndefined();
    expect(DRIK_NODES_EXCLUDED).toContain('SEVEN grahas');
  });

  it('never lets a planet aspect itself', () => {
    // Saturn's and Mars's curves are not the general one, so relying on "0° scores 0" would be
    // relying on the wrong curve. A single planet must receive nothing at all.
    for (const g of ['saturn', 'mars', 'jupiter', 'sun'] as Graha[]) {
      const p = drikPindas({ [g]: 42 } as Partial<Record<Graha, number>>, { moonIsBenefic: true });
      expect(p[g]).toEqual({ benefic: 0, malefic: 0, mercuryJupiter: 0 });
    }
  });

  it('feeds `drikBala` a value that can go negative', () => {
    // (benefic − malefic) / 4 plus Mercury and Jupiter in full. A planet under heavy malefic
    // aspect legitimately scores BELOW zero, which is why Drik is the one component that can
    // reduce a Shadbala total rather than only adding to it.
    const p = drikPindas({ saturn: 0, mars: 180, venus: 90 }, { moonIsBenefic: true });
    const v = drikBala(p.venus!.benefic, p.venus!.malefic, p.venus!.mercuryJupiter);
    expect(v).toBeLessThan(0);
  });
});

describe('provenance', () => {
  it('records that the period lords are Saura, not Savana, and why', () => {
    expect(PERIOD_LORDS_ARE_SAURA_NOT_SAVANA).toContain('FREE PARAMETER');
    expect(PERIOD_LORDS_ARE_SAURA_NOT_SAVANA).toContain('45 of Kala bala');
    // And notes that intercalation never enters into it.
    expect(PERIOD_LORDS_ARE_SAURA_NOT_SAVANA).toContain('Adhika Masa');
  });

  it('keeps the weekday lord order in step with the engine’s', () => {
    // The two packages deliberately do not depend on each other, so this constant exists twice.
    // Asserting the order here is what stops the copies drifting.
    expect(WEEKDAY_LORD_ORDER).toEqual([
      'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// The compound relationship, against the first corpus's own worked example
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rāma's chart, RECONSTRUCTED from the corpus's two worked examples in ch 3.4.2 rather than
 * copied from its figure — the figure is a diagram, which the programme cannot encode.
 *
 * The reconstruction is constrained by what the book states in words, and it reproduces BOTH
 * stated lists exactly (asserted below), which is what makes it usable as a verification chart.
 * Mercury is the one placement the text under-determines: the two examples together pin it to
 * Taurus or Gemini, and every relation the book asserts holds identically either way.
 */
const RAMA: Partial<Record<Graha, SignIndex>> = {
  sun: 0 as SignIndex,       // Aries   — stated: "Sun is in Ar"
  moon: 3 as SignIndex,      // Cancer  — stated: "Moon is in Cn"
  jupiter: 3 as SignIndex,   // Cancer  — stated: shares the Moon's rasi
  mars: 9 as SignIndex,      // Capricorn
  venus: 11 as SignIndex,    // Pisces
  saturn: 6 as SignIndex,    // Libra
  mercury: 1 as SignIndex,   // Taurus (or Gemini — see above)
};

describe('temporary relationships, against the book\u2019s worked example', () => {
  it('reproduces the Sun\u2019s stated temporary friends and its single enemy', () => {
    // "Planets in those rasis are Mercury, Moon, Jupiter, Mars and Venus. They are temporary
    //  friends of Sun in this chart. Saturn is the only temporary enemy."
    expect(temporaryFriendsOf('sun', RAMA).sort())
      .toEqual(['jupiter', 'mars', 'mercury', 'moon', 'venus']);
    expect(temporaryRelationIn('sun', 'saturn', RAMA)).toBe('enemy');
  });

  it('reproduces the Moon\u2019s stated temporary friends and enemies', () => {
    // "Planets in those rasis are Saturn, Sun and Mercury. They are temporary friends of Moon
    //  in this chart. Temporary enemies are Mars, Jupiter, Venus."
    expect(temporaryFriendsOf('moon', RAMA).sort()).toEqual(['mercury', 'saturn', 'sun']);
    for (const g of ['mars', 'jupiter', 'venus'] as Graha[]) {
      expect(temporaryRelationIn('moon', g, RAMA), g).toBe('enemy');
    }
  });

  it('makes a planet in the SAME sign a temporary enemy, not a friend', () => {
    // Jupiter shares Cancer with the Moon and the book lists it among the Moon's enemies. The
    // 1st sign is an enemy place, which is the detail an implementation is most likely to get
    // backwards — sharing a sign reads like closeness.
    expect(RAMA.jupiter).toBe(RAMA.moon);
    expect(temporaryRelationIn('moon', 'jupiter', RAMA)).toBe('enemy');
    expect(temporaryRelationIn('jupiter', 'moon', RAMA)).toBe('enemy');
  });

  it('gives two planets in one rasi identical temporary relations', () => {
    // The book draws attention to this: "Moon and Jupiter have the same temporary friends and
    // temporary enemies ... because they occupy the same rasi". It follows only if the relation
    // depends on the SIGN and nothing else, so it is a check on the shape of the rule.
    const moonView = temporaryFriendsOf('moon', RAMA).filter((g) => g !== 'jupiter').sort();
    const jupView = temporaryFriendsOf('jupiter', RAMA).filter((g) => g !== 'moon').sort();
    expect(moonView).toEqual(jupView);
  });

  it('is exactly symmetric, which the friend set guarantees', () => {
    // Defined directionally — "planets in the 2/3/4/10/11/12 FROM a planet" — yet the relation
    // always agrees both ways, and that is structural rather than lucky. If B is in the nth
    // from A then A is in the (14−n)th from B, and the friend set {2,3,4,10,11,12} is closed
    // under that reflection: 2↔12, 3↔11, 4↔10. The enemies pair likewise, 5↔9 and 6↔8, while
    // the 1st and the 7th map to themselves. So no pair can disagree.
    const all = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as Graha[];
    for (const a of all) {
      for (const b of all) {
        if (a === b) continue;
        expect(temporaryRelationIn(a, b, RAMA), `${a}/${b}`)
          .toBe(temporaryRelationIn(b, a, RAMA));
      }
    }
    // The closure property itself, independent of any chart.
    const FRIEND_HOUSES = [2, 3, 4, 10, 11, 12];
    for (const h of FRIEND_HOUSES) {
      const opposite = ((14 - h - 1) % 12) + 1;
      expect(FRIEND_HOUSES, `${h} reflects to ${opposite}`).toContain(opposite);
    }
  });
});

describe('compounding them (Panchadha Maitri)', () => {
  it('produces every tier the book names for the Sun', () => {
    // "Moon, Mars and Jupiter are natural friends and they become adhimitras (good friends).
    //  Mercury is a neutral planet in natural relationship and he becomes a mitra (friend).
    //  Venus is a natural enemy. Being a temporary friend, Venus becomes a sama (neutral)."
    expect(compoundRelationIn('sun', 'moon', RAMA)).toBe('great-friend');
    expect(compoundRelationIn('sun', 'mars', RAMA)).toBe('great-friend');
    expect(compoundRelationIn('sun', 'jupiter', RAMA)).toBe('great-friend');
    expect(compoundRelationIn('sun', 'mercury', RAMA)).toBe('friend');
    expect(compoundRelationIn('sun', 'venus', RAMA)).toBe('neutral');
  });

  it('reaches great-enemy where both halves are hostile', () => {
    // Saturn is the Sun's natural enemy AND its only temporary enemy, so it is adhishatru.
    // The book does not spell this one out; it follows from the table it does give.
    expect(compoundRelationIn('sun', 'saturn', RAMA)).toBe('great-enemy');
  });

  it('reaches neutral by both routes, which a five-fold scale cannot distinguish', () => {
    // −1 natural with +1 temporary, and +1 natural with −1 temporary, both land on sama. The
    // two routes are distinguishable in the inputs and not in the output; that compression is
    // what a five-fold scale IS, as against carrying the pair around.
    expect(compoundRelationIn('sun', 'venus', RAMA)).toBe('neutral');    // enemy  + friend
    expect(compoundRelationIn('jupiter', 'moon', RAMA)).toBe('neutral'); // friend + enemy
  });

  it('stays asymmetric even though the temporary half is symmetric', () => {
    // The Moon and Jupiter share Cancer, so their TEMPORARY relation is enemy both ways. But
    // the NATURAL relation is not reciprocal — Jupiter counts the Moon a friend while the Moon
    // counts Jupiter neutral — so the compound differs by direction. Anything that cached one
    // compound value per unordered pair would be wrong here.
    expect(compoundRelationIn('jupiter', 'moon', RAMA)).toBe('neutral');
    expect(compoundRelationIn('moon', 'jupiter', RAMA)).toBe('enemy');
  });
});

describe('what the compound relationship unlocks', () => {
  it('reaches all SEVEN Saptavargaja tiers, where longitude alone reached five', () => {
    // The whole point. Without the temporary half the scale tops out at friend/enemy and the
    // 20-virupa and 2-virupa tiers are unreachable, compressing every planet toward the middle.
    const reached = new Set<string>();
    for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as Graha[]) {
      for (let deg = 0; deg < 360; deg += 3) {
        const tierFor = saptavargajaTierForChart(g, deg, RAMA);
        for (const d of SAPTAVARGA_DIVISIONS) reached.add(tierFor(d));
      }
    }
    expect(reached.has('great-friend')).toBe(true);
    expect(reached.has('great-enemy')).toBe(true);
    expect(reached.size).toBe(7);
    expect(Object.keys(SAPTAVARGAJA_VIRUPAS)).toHaveLength(7);
  });

  it('raises the ceiling, and moves planets in BOTH directions', () => {
    // The ceiling must rise: great-friend is 20 virupas where friend is 15, so a planet with
    // temporary friends behind it can now score higher than the natural scale allowed.
    //
    // ⚠️ The FLOOR does not have to fall, and in this chart it does not. That looks like a
    // half-result and is not: the compound cuts both ways. A natural enemy that is a temporary
    // friend is promoted to neutral (4 → 10 virupas), so adding the temporary half can RAISE a
    // planet's worst case as easily as lower it. Asserting a lower floor would have been
    // asserting a property the rule does not have.
    const totals = (chartAware: boolean) => {
      const out: number[] = [];
      for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as Graha[]) {
        for (let deg = 0; deg < 360; deg += 3) {
          out.push(saptavargajaBala(
            chartAware ? saptavargajaTierForChart(g, deg, RAMA) : saptavargajaTierFor(g, deg),
          ));
        }
      }
      return out;
    };
    const withCompound = totals(true);
    const without = totals(false);
    expect(Math.max(...withCompound)).toBeGreaterThan(Math.max(...without));

    // Both directions of movement occur across the sweep — some totals rise, some fall.
    const rose = withCompound.some((v, i) => v > without[i]!);
    const fell = withCompound.some((v, i) => v < without[i]!);
    expect(rose).toBe(true);
    expect(fell).toBe(true);
  });

  it('unlocks the same two tiers for ch 7\u2019s Vimsopaka, which shares the limitation', () => {
    // `vargaViswaTier` takes the same compound value, so one calculation serves both scales.
    expect(vargaViswaTier('sun', 6 as SignIndex, 'great-friend')).toBe('great-friend');
    expect(vargaViswaTier('sun', 6 as SignIndex, 'great-enemy')).toBe('great-enemy');
    // And without one it still falls back rather than failing.
    expect(['friend', 'neutral', 'enemy']).toContain(vargaViswaTier('sun', 6 as SignIndex));
  });

  it('records the rasi basis, which is a design decision the source settles', () => {
    expect(TEMPORARY_IS_READ_IN_THE_RASI).toContain('rasis occupied by planets');
    expect(COMPOUND_UNLOCKS_THE_EXTREMES).toContain('no temporary neutral');
  });
});
