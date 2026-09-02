// Proof that sunrise actually unlocked the six capabilities it was blocking.
//
// Every function exercised here was already encoded, already tested against the book's own
// worked examples, and already marked available — and **not one of them could be called**,
// because each took a sunrise-derived argument from a caller with no way to obtain it. The
// knowledge package computes; the engine observes; neither depends on the other. So the gap
// was invisible from inside either one, and this is the only place in the repo that can see
// both (the Ashtakavarga parity guard lives here for the same reason).
//
// The assertions are therefore about REACHABILITY, not about astrology: each one shows a real
// birth moment producing a real input that a real encoded rule consumes. The correctness of
// the rules themselves is covered by their own suites against the book's examples.

import { describe, it, expect } from 'vitest';
import {
  bhavaLagnaBphs, horaLagnaBphs, ghatikaLagnaBphs,
  pranaPada, pranaPadaFromLagna, minutesToVighatis,
  selectDashaSystem,
  tribhagaBala, nathonnathaBala, varshaMasaDinaHoraBala,
} from '@aura/knowledge';
import {
  computeChart, AstronomiaEphemeris, sunriseFacts, periodLordsFromSunrise,
} from '@aura/engine';
import type { Graha } from '@aura/engine';

const ephem = new AstronomiaEphemeris();

/** Delhi, 15 May 1990, 06:30 IST — a daytime birth shortly after sunrise. */
const BIRTH = {
  date: '1990-05-15', time: '06:30', unknownTime: false,
  place: 'Delhi', lat: 28.6139, lng: 77.2090, tzOffsetMinutes: 330,
};
/** The same instant in UTC. IST is +5:30, so 06:30 local is 01:00Z. */
const AT = new Date('1990-05-15T01:00:00Z');

const chart = computeChart(BIRTH, ephem);
const facts = sunriseFacts(AT, BIRTH.lat, BIRTH.lng, ephem);

describe('the birth resolves to a real sunrise', () => {
  it('finds a Delhi mid-May sunrise a little before the birth', () => {
    expect(facts.polar).toBe(false);
    expect(facts.sunrise).not.toBeNull();
    // Delhi sunrise mid-May is ~05:28 IST = 23:58Z on the previous UTC date.
    expect(facts.birth).toBe('day');
    // Born 06:30 IST, so roughly an hour of elapsed day.
    expect(facts.minutesSinceSunrise!).toBeGreaterThan(30);
    expect(facts.minutesSinceSunrise!).toBeLessThan(90);
  });
});

describe('ch 5.2-8 — the three special lagnas are now computable', () => {
  it('produces all three, and in the order the chapter is built on', () => {
    const sun = facts.sunLongAtSunrise!;
    const mins = facts.minutesSinceSunrise!;
    const bhava = bhavaLagnaBphs(sun, mins);
    const hora = horaLagnaBphs(sun, mins);
    const ghatika = ghatikaLagnaBphs(sun, mins);

    for (const v of [bhava, hora, ghatika]) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(360);
    }

    // The rates are 5 / 2.5 / 1 ghatis per sign, so within the first sign-crossing the arcs
    // travelled must be strictly increasing. This is the ordering CONFLICT LEDGER bphs.05.002
    // turned on — the rejected rate would have made Bhava lagna the fastest of the three.
    const arc = (v: number) => (v - sun + 360) % 360;
    expect(arc(bhava)).toBeLessThan(arc(hora));
    expect(arc(hora)).toBeLessThan(arc(ghatika));
  });

  it('advances them from the SUNRISE Sun, so they differ from the natal ascendant', () => {
    // If these silently returned the ascendant, or the Sun's birth-moment longitude, the
    // three would collapse together and the chapter would be decorative.
    const sun = facts.sunLongAtSunrise!;
    const mins = facts.minutesSinceSunrise!;
    expect(bhavaLagnaBphs(sun, mins)).not.toBeCloseTo(chart.lagnaLong, 3);
    expect(bhavaLagnaBphs(sun, mins)).not.toBeCloseTo(ghatikaLagnaBphs(sun, mins), 3);
  });
});

describe('ch 3.71-74 — prana pada is now computable', () => {
  it('places it in a sign and reads its house from the ascendant', () => {
    const pp = pranaPadaFromLagna(
      pranaPada(facts.vighatisSinceSunrise!, facts.sunLongAtSunrise!),
      chart.lagnaSign as never,
    );
    expect(pp.sign).toBeGreaterThanOrEqual(0);
    expect(pp.sign).toBeLessThan(12);
    expect(pp.houseFromLagna).toBeGreaterThanOrEqual(1);
    expect(pp.houseFromLagna).toBeLessThanOrEqual(12);
    expect(typeof pp.auspicious).toBe('boolean');
  });

  it('agrees with the knowledge package’s own minutes→vighatis conversion', () => {
    // Two independent conversions of the same quantity — the engine's and the book module's.
    // They must not drift, because prana pada advances a full sign every ~6 minutes and a
    // unit slip would be a whole-sign error that still looks like a valid answer.
    expect(facts.vighatisSinceSunrise!)
      .toBeCloseTo(minutesToVighatis(facts.minutesSinceSunrise!), 9);
  });
});

describe('ch 46 — selectDashaSystem sees its two sunrise-derived conditions', () => {
  it('accepts lagnaHora and day/night that a caller could not previously supply', () => {
    // `PlanetPos` carries `sign` and `siderealLong` — NOT `lon`. Reading the wrong field
    // yields NaN, which `Math.floor` passes through silently and which every downstream
    // check here would have accepted. So the signs are asserted to be real indices first.
    const planets: Partial<Record<Graha, number>> = {};
    for (const [g, p] of Object.entries(chart.planets)) {
      expect(Number.isInteger(p.sign), `${g} sign`).toBe(true);
      expect(p.sign).toBeGreaterThanOrEqual(0);
      expect(p.sign).toBeLessThan(12);
      planets[g as Graha] = p.sign;
    }

    const selections = selectDashaSystem({
      lagnaSign: chart.lagnaSign as never,
      planets: planets as never,
      lagnaHora: facts.lagnaHora ?? undefined,
      birth: facts.birth ?? undefined,
    });

    expect(Array.isArray(selections)).toBe(true);
    // Every selection must name a real system with at least one verse behind it.
    for (const sel of selections) {
      expect(sel.system.length).toBeGreaterThan(0);
      expect(sel.metVerses.length).toBeGreaterThan(0);
    }
    // Whatever the chart yields, the two fields are real values rather than absent.
    expect(facts.birth).toBe('day');
    // lagnaHora is null unless the hora lord is a luminary — a legitimate outcome, not a gap.
    expect(facts.horaLord).not.toBeNull();
    if (facts.lagnaHora) expect(['sun', 'moon']).toContain(facts.lagnaHora);
  });
});

describe('ch 27 — three Kala bala components come off the bench', () => {
  it('scores Tribhaga bala, which needed the third of the day (27.12)', () => {
    const t = facts.tribhaga!;
    expect(t).not.toBeNull();
    const v = tribhagaBala('mercury', t.isDay, t.third);
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(60);
  });

  it('scores Nathonnatha bala, which needed ghatis from midnight (27.8-9)', () => {
    const v = nathonnathaBala('mercury', facts.ghatisFromMidnight);
    expect(v).not.toBeNull();
    expect(v!).toBeGreaterThanOrEqual(0);
    expect(v!).toBeLessThanOrEqual(60);
  });

  it('scores all 150 period-lord virupas, from true solar ingresses (27.13)', () => {
    // This was 105 of 150 until the solar ingresses landed. Dina (45) and hora (60) come from
    // sunrise. Varsha (15) and masa (30) were blocked on a calendar, and the obvious Savana
    // route — 360-day years counted as an Ahargana — needs an EPOCH, a free parameter worth a
    // quarter of the component with nothing in the text to pin it. Anchoring them to the Sun's
    // true entry into a sidereal sign removes the parameter: it is an observable instant.
    const lords = periodLordsFromSunrise(facts);
    for (const k of ['varsha', 'masa', 'dina', 'hora'] as const) {
      expect(lords[k], `${k} lord`).toBeDefined();
    }

    // A planet ruling all four would score the full 150; one ruling none scores nothing rather
    // than a consolation default.
    expect(varshaMasaDinaHoraBala(lords.dina as Graha, lords)).toBeGreaterThanOrEqual(45);
    const unrelated = (['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as Graha[])
      .find((g) => !Object.values(lords).includes(g));
    if (unrelated) expect(varshaMasaDinaHoraBala(unrelated, lords)).toBe(0);
  });

  it('takes the varsha lord from the Mesha Sankranti, not the tropical equinox', () => {
    // The Sun crosses SIDEREAL 0° in mid-April. A tropical reading would put it at the March
    // equinox, three weeks earlier — often a different weekday, and so a different lord.
    expect(facts.meshaSankranti!.getUTCMonth()).toBe(3); // April
    expect(facts.meshaSankranti!.getTime()).toBeLessThan(AT.getTime());
    // The sign ingress falls between the year's start and the birth.
    expect(facts.signIngress!.getTime()).toBeGreaterThanOrEqual(facts.meshaSankranti!.getTime());
    expect(facts.signIngress!.getTime()).toBeLessThanOrEqual(AT.getTime());
  });
});

describe('the polar case refuses to fabricate any of it', () => {
  it('leaves all six capabilities unreachable rather than answering wrongly', () => {
    // Tromsø, midsummer: the Sun never sets. Every one of these inputs is genuinely
    // undefined, and a nominal 06:00 sunrise would yield six confident wrong answers.
    const polar = sunriseFacts(
      new Date('1990-06-21T12:00:00Z'), 69.6492, 18.9553, ephem,
    );
    expect(polar.polar).toBe(true);
    expect(polar.sunLongAtSunrise).toBeNull();      // ch 5 — no special lagnas
    expect(polar.vighatisSinceSunrise).toBeNull();  // ch 3 — no prana pada
    expect(polar.birth).toBeNull();                 // ch 46
    expect(polar.lagnaHora).toBeNull();             // ch 46
    expect(polar.tribhaga).toBeNull();              // ch 27.12

    // ch 27.13 is the interesting one, and NOT empty. The dina and hora lords need the
    // BIRTH's own sunrise and are correctly withheld. But the varsha lord depends on the
    // sunrise preceding the Mesha Sankranti — mid-April, when the Sun does rise at Tromsø —
    // so it legitimately resolves. The masa lord's ingress falls inside the polar day itself
    // and so does not. Partial availability here is the correct answer, not a leak: each
    // lord is withheld exactly when ITS OWN anchoring sunrise is missing.
    const polarLords = periodLordsFromSunrise(polar);
    expect(polarLords.dina).toBeUndefined();
    expect(polarLords.hora).toBeUndefined();
    expect(polarLords.masa).toBeUndefined();
    expect(polarLords.varsha).toBeDefined();

    // Nathonnatha is the one exception and legitimately so: it counts from MIDNIGHT, which
    // exists at every latitude. Sunrise was never its dependency.
    expect(polar.ghatisFromMidnight).toBeCloseTo(30, 6);
  });
});
