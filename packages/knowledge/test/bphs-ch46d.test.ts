// BPHS Programme Part 37 — Chapter 46d, and the selection capability.
//
// `selectDashaSystem` is the programme's stated crown jewel, so the tests care about three
// things above all: that each condition fires on the chart the verse describes and not
// otherwise, that a missing fact yields silence rather than a guess, and that the ordering —
// which is ours, not the source's — is honest about being ours.

import { describe, it, expect } from 'vitest';
import {
  selectDashaSystem, systemFor, ESTIMATED_SHARE, SPECIFICITY_RANKING_IS_OURS,
  VIMSHOTTARI_IS_THE_DEFAULT_NOT_A_CANDIDATE, CH46D_HAS_NO_SELECTION_RULES,
  GATI_DEFINITIONS, gatiBetween, GATI_EFFECTS_REFUSED, GATI_DIRECTION_IS_USABLE,
  RASI_DASHA_SYSTEMS, TWO_RASI_DASHAS_ARE_LONGEVITY, DEHA_JEEVA_AFFLICTION_REFUSED,
  CH46D_YIELD, NAKSHATRA_DASHA_SYSTEMS,
  type DashaSelectionFacts,
} from '../src/index.js';

const base = (over: Partial<DashaSelectionFacts> = {}): DashaSelectionFacts => ({
  lagnaSign: 0,                       // Aries — lagna lord Mars
  planets: { sun: 4, moon: 3, mars: 2, mercury: 5, jupiter: 8, venus: 1, saturn: 6, rahu: 7 },
  ...over,
});
const names = (f: DashaSelectionFacts) => selectDashaSystem(f).map((s) => s.system);

// ── Each condition fires on its own chart, and not otherwise ─────────────────
describe('BPHS 46 — selectDashaSystem, one condition at a time', () => {
  it('Shastihayani: the Sun in the ascendant', () => {
    expect(names(base({ planets: { ...base().planets, sun: 0 } }))).toContain('Shastihayani');
    expect(names(base())).not.toContain('Shastihayani');
  });

  it('Dwisaptati sama: the ascendant lord in the 1st or the 7th', () => {
    // Aries lagna, so Mars is the lord. Aries = 1st, Libra = 7th.
    expect(names(base({ planets: { ...base().planets, mars: 0 } }))).toContain('Dwisaptati sama');
    expect(names(base({ planets: { ...base().planets, mars: 6 } }))).toContain('Dwisaptati sama');
    expect(names(base({ planets: { ...base().planets, mars: 2 } }))).not.toContain('Dwisaptati sama');
  });

  it('Chaturashiti sama: the 10th lord in the 10th', () => {
    // Aries lagna: the 10th is Capricorn, lord Saturn. Saturn in Capricorn = the 10th house.
    expect(names(base({ planets: { ...base().planets, saturn: 9 } })))
      .toContain('Chaturashiti sama');
    expect(names(base())).not.toContain('Chaturashiti sama');
  });

  it('Shatabdika: a vargottama ascendant', () => {
    expect(names(base({ navamsaLagna: 0 }))).toContain('Shatabdika');
    expect(names(base({ navamsaLagna: 5 }))).not.toContain('Shatabdika');
  });

  it('Dwadashottari: the ascendant in a navamsa of Venus', () => {
    expect(names(base({ navamsaLagna: 1 }))).toContain('Dwadashottari');   // Taurus
    expect(names(base({ navamsaLagna: 6 }))).toContain('Dwadashottari');   // Libra
    expect(names(base({ navamsaLagna: 2 }))).not.toContain('Dwadashottari');
  });

  it('Panchottari: Cancer ascendant AND Cancer dwadasamsa — both, not either', () => {
    expect(names(base({ lagnaSign: 3, dwadasamsaLagna: 3 }))).toContain('Panchottari');
    expect(names(base({ lagnaSign: 3, dwadasamsaLagna: 5 }))).not.toContain('Panchottari');
    expect(names(base({ lagnaSign: 5, dwadasamsaLagna: 3 }))).not.toContain('Panchottari');
  });

  it('Ashtottari: Rahu out of the lagna but angular/trinal FROM THE LAGNA LORD', () => {
    // Aries lagna, Mars in Gemini (sign 2). A kendra/trikona from Gemini that is not the
    // lagna: Virgo (sign 5) is the 4th from Gemini and the 6th from Aries.
    expect(names(base({ planets: { ...base().planets, mars: 2, rahu: 5 } })))
      .toContain('Ashtottari');
    // Rahu in the lagna disqualifies it however well placed from the lord.
    expect(names(base({ planets: { ...base().planets, mars: 0, rahu: 0 } })))
      .not.toContain('Ashtottari');
  });

  it('Shodasottari and Shat-trimsat: the same ingredients, paired differently', () => {
    // Moon's hora + Krishna -> Shodasottari, but NOT Shat-trimsat (which wants day+Sun).
    const a = base({ lagnaHora: 'moon', paksha: 'krishna', birth: 'day' });
    expect(names(a)).toContain('Shodasottari');
    expect(names(a)).not.toContain('Shat-trimsat sama');
    // Day + Sun's hora -> Shat-trimsat, but not Shodasottari (which needs Sun+Shukla).
    const b = base({ lagnaHora: 'sun', paksha: 'krishna', birth: 'day' });
    expect(names(b)).toContain('Shat-trimsat sama');
    expect(names(b)).not.toContain('Shodasottari');
  });
});

// ── Silence, not guessing ────────────────────────────────────────────────────
describe('BPHS 46 — a missing fact yields silence', () => {
  it('no paksha means no paksha-conditioned system', () => {
    const f = base({ lagnaHora: 'moon', birth: 'day' });   // paksha absent
    expect(names(f)).not.toContain('Shodasottari');
  });

  it('no navamsa lagna means neither vargottama nor Venus-navamsa can qualify', () => {
    const f = base();                                       // navamsaLagna absent
    expect(names(f)).not.toContain('Shatabdika');
    expect(names(f)).not.toContain('Dwadashottari');
  });

  it('a chart with nothing supplied qualifies for nothing', () => {
    expect(selectDashaSystem({ lagnaSign: 0, planets: {} })).toEqual([]);
  });
});

// ── The ordering, which is ours ──────────────────────────────────────────────
describe('BPHS 46 — the ordering is OURS and says so', () => {
  it('returns the most specific system first', () => {
    // A chart deliberately built to satisfy several at once.
    const f = base({
      lagnaSign: 3,                                     // Cancer
      dwadasamsaLagna: 3,                               // -> Panchottari (rarest)
      navamsaLagna: 3,                                  // -> Shatabdika (vargottama)
      planets: { ...base().planets, sun: 3 },           // -> Shastihayani (Sun in lagna)
      lagnaHora: 'sun', birth: 'day',                   // -> Shat-trimsat (commonest)
    });
    const got = names(f);
    expect(got.length).toBeGreaterThanOrEqual(4);
    // Panchottari's condition is the rarest of the nine by two orders of magnitude.
    expect(got[0]).toBe('Panchottari');
    // The shares ascend, whichever systems happen to qualify.
    const shares = selectDashaSystem(f).map((s) => s.estimatedShare);
    expect([...shares].sort((a, b) => a - b)).toEqual(shares);
    // And the last one out is the least specific of those that qualified.
    const last = selectDashaSystem(f).at(-1)!;
    expect(last.estimatedShare).toBe(Math.max(...shares));
  });

  it('returns EVERY applicable system, not just the winner', () => {
    // So a caller who rejects our ordering still has the full set.
    const f = base({ navamsaLagna: 0, planets: { ...base().planets, sun: 0 } });
    const got = names(f);
    expect(got).toContain('Shatabdika');
    expect(got).toContain('Shastihayani');
  });

  it('labels the ranking as ours and explains what it reuses', () => {
    expect(SPECIFICITY_RANKING_IS_OURS).toContain('The ordering');
    expect(SPECIFICITY_RANKING_IS_OURS).toContain('OURS');
    expect(SPECIFICITY_RANKING_IS_OURS).toContain('NEVER says what to do when a chart meets');
    expect(SPECIFICITY_RANKING_IS_OURS).toContain('not probabilities to quote');
  });

  it('never offers Vimshottari as a candidate — it is the default', () => {
    const f = base({ navamsaLagna: 0, lagnaHora: 'sun', birth: 'day', paksha: 'shukla' });
    expect(names(f)).not.toContain('Vimshottari');
    expect(VIMSHOTTARI_IS_THE_DEFAULT_NOT_A_CANDIDATE).toContain('default rather than one');
  });

  it('every system it can return is one Part 35 actually encoded', () => {
    const known = new Set(NAKSHATRA_DASHA_SYSTEMS.map((s) => s.name));
    for (const name of Object.keys(ESTIMATED_SHARE)) expect(known.has(name), name).toBe(true);
    expect(Object.keys(ESTIMATED_SHARE)).toHaveLength(9);
  });

  it('a selection can be joined straight back to its years and lords', () => {
    const s = systemFor('Shastihayani')!;
    expect(s.total).toBe(60);
    expect(s.order).toHaveLength(8);
  });
});

// ── What 46d actually contains ───────────────────────────────────────────────
describe('BPHS 46d — the gatis', () => {
  it('classifies the three movements the chapter names', () => {
    expect(gatiBetween(5, 3)).toBe('mandooki');        // Virgo -> Cancer
    expect(gatiBetween(4, 2)).toBe('mandooki');        // Leo -> Gemini
    expect(gatiBetween(4, 3)).toBe('markati');         // Leo -> Cancer
    expect(gatiBetween(11, 7)).toBe('simhavlokana');   // Pisces -> Scorpio
    expect(gatiBetween(8, 0)).toBe('simhavlokana');    // Sagittarius -> Aries
  });

  it('returns null for a movement that is none of the three', () => {
    expect(gatiBetween(0, 1)).toBeNull();
    expect(gatiBetween(0, 6)).toBeNull();
  });

  it('keeps the gatis but refuses their effects', () => {
    expect(Object.keys(GATI_DEFINITIONS)).toHaveLength(3);
    expect(GATI_EFFECTS_REFUSED).toContain('Refused in full');
    expect(GATI_DIRECTION_IS_USABLE).toContain('doom-free');
  });
});

describe('BPHS 46.179-203 — the rasi dashas', () => {
  it('records all eight with their commencement rule', () => {
    expect(RASI_DASHA_SYSTEMS).toHaveLength(8);
    for (const s of RASI_DASHA_SYSTEMS) {
      expect(s.commencement.length, s.name).toBeGreaterThan(25);
      if (!s.surfaced) expect(s.withheld, s.name).toBeTruthy();
    }
  });

  it('refuses the two whose stated PURPOSE is timing death', () => {
    const refused = RASI_DASHA_SYSTEMS.filter((s) => !s.surfaced).map((s) => s.name);
    expect(refused).toEqual(['Shoola', 'Pinda / Amsa / Nisarga']);
    expect(TWO_RASI_DASHAS_ARE_LONGEVITY).toContain('Neither is refused for its arithmetic');
  });

  it('refuses the Deha/Jeeva affliction block', () => {
    expect(DEHA_JEEVA_AFFLICTION_REFUSED).toContain('Refused in full');
  });
});

describe('Part 37 — the programme plan was wrong about where the crown jewel lives', () => {
  it('records that 46d holds no selection rules', () => {
    expect(CH46D_HAS_NO_SELECTION_RULES).toContain('NO selection or precedence rules');
    expect(CH46D_HAS_NO_SELECTION_RULES).toContain('Part 35 already extracted');
  });

  it('is honest that the capability, not the verses, was this part’s work', () => {
    expect(CH46D_YIELD.note).toContain('mislocated its own crown jewel');
    expect(CH46D_YIELD.newRules).toBe(0);
  });
});
