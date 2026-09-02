// The ascendant and the ayanamsa, against an external reference.
//
// **These are the two axes the Horizons fixture cannot see.** Those rows validate planetary
// longitudes and are TROPICAL, which leaves two things unchecked:
//
//   - **the ascendant**, which comes from sidereal time and obliquity and does not touch the
//     ephemeris at all — a planet-position test can be perfect while every house is wrong;
//   - **the ayanamsa**, which shifts every position identically and is therefore invisible to
//     any tropical comparison, and to every internal consistency check.
//
// The eight ascendant vectors are locked to a single epoch (J2000.0) on purpose: with the
// Julian Day, GMST and obliquity all frozen, they differ only in latitude and longitude, so
// they isolate the geometry from any date-handling error.

import { describe, expect, it } from 'vitest';
import { ascendantTropical } from '../src/astro/ascendant.js';
import { lahiriAyanamsa, LAHIRI_J2000 } from '../src/astro/ayanamsa.js';
import { jdToJde } from '../src/astro/julian.js';
import ref from '../../vectors/reference-ascendants.json' with { type: 'json' };

const fixture = ref as unknown as {
  epoch: { julianDay: number; gmstDeg: number; trueObliquityDeg: number };
  ascendants: { rows: Array<{ place: string; lat: number; lngEast: number;
    tropical: number; sidereal: number }> };
  lahiriAyanamsa: { rows: Array<{ utc: string; julianDay: number; ayanamsa: number }> };
};

/** Signed separation in arcminutes, folded to ±180° so a wrap does not read as a huge error. */
const arcminApart = (a: number, b: number) =>
  Math.abs(((((a - b + 180) % 360) + 360) % 360) - 180) * 60;

describe('the ascendant, against eight reference vectors', () => {
  const { julianDay } = fixture.epoch;
  const jde = jdToJde(julianDay);

  it('agrees at every one of the eight places, within an arcminute', () => {
    // The supplied values are rounded to two decimals (0.01° = 0.6′), so the tolerance cannot
    // usefully be tighter than that rounding. Measured worst case is 0.75′ at Reykjavik —
    // high latitude, where the ascendant moves fastest and rounding hurts most.
    for (const r of fixture.ascendants.rows) {
      const got = ascendantTropical(julianDay, jde, r.lat, r.lngEast);
      expect(arcminApart(got, r.tropical), `${r.place}: tropical ascendant`).toBeLessThan(1);
    }
    expect(fixture.ascendants.rows).toHaveLength(8);
  });

  it('holds in the southern hemisphere, which is where a latitude sign error would show', () => {
    // Sydney, Cape Town and Ushuaia are all south. A sign slip on latitude leaves northern
    // results untouched and moves these by tens of degrees.
    for (const r of fixture.ascendants.rows.filter((x) => x.lat < 0)) {
      const got = ascendantTropical(julianDay, jde, r.lat, r.lngEast);
      expect(arcminApart(got, r.tropical), `${r.place}`).toBeLessThan(1);
    }
  });

  it('holds at the equator and at high latitude, the two degenerate ends', () => {
    // Quito is within 0.2° of the equator, where tan(φ) → 0; Reykjavik is at 64°N, where
    // tan(φ) is large and the ascendant's rate of change is extreme. Both terms appear in the
    // same denominator, so a formula that is subtly wrong tends to fail at one end or the other.
    const byPlace = (s: string) => fixture.ascendants.rows.find((r) => r.place.startsWith(s))!;
    for (const r of [byPlace('Quito'), byPlace('Reykjavik'), byPlace('Ushuaia')]) {
      const got = ascendantTropical(julianDay, jde, r.lat, r.lngEast);
      expect(arcminApart(got, r.tropical), `${r.place}`).toBeLessThan(1);
    }
  });

  it('spans east and west of Greenwich, so a longitude sign error cannot hide', () => {
    const east = fixture.ascendants.rows.filter((r) => r.lngEast > 0);
    const west = fixture.ascendants.rows.filter((r) => r.lngEast < 0);
    expect(east.length).toBeGreaterThanOrEqual(3);
    expect(west.length).toBeGreaterThanOrEqual(3);
    // A flipped longitude sign moves the ascendant by twice the longitude in sidereal time —
    // at Tokyo (139.65°E) that is most of the zodiac, so this cannot pass by luck.
    for (const r of [...east, ...west]) {
      const flipped = ascendantTropical(julianDay, jde, r.lat, -r.lngEast);
      if (Math.abs(r.lngEast) > 10) {
        expect(arcminApart(flipped, r.tropical), `${r.place} with longitude flipped`)
          .toBeGreaterThan(60);
      }
    }
  });
});

describe('the Lahiri ayanamsa, against the supplied reference series', () => {
  it('agrees at all four epochs to within 20 arcseconds', () => {
    // 14.4″ is the measured worst case. At the Moon's 13.176°/day that is 0.44 minutes of
    // birth time — far inside the ±15 minutes the app already models — and against a 13°20′
    // nakshatra it is 0.03%.
    for (const r of fixture.lahiriAyanamsa.rows) {
      const ours = lahiriAyanamsa(r.julianDay);
      const arcsec = Math.abs(ours - r.ayanamsa) * 3600;
      expect(arcsec, `${r.utc}: ${arcsec.toFixed(1)}″ from the reference`).toBeLessThan(20);
    }
  });

  it('spans 125 years, so a wrong precession RATE could not pass', () => {
    // An anchor error shifts all four rows equally; a rate error grows with distance from
    // J2000. Checking 1900 and 2025 together separates the two.
    const first = fixture.lahiriAyanamsa.rows[0]!;
    const last = fixture.lahiriAyanamsa.rows[fixture.lahiriAyanamsa.rows.length - 1]!;
    expect((last.julianDay - first.julianDay) / 365.25).toBeGreaterThan(120);
    const ourSpan = lahiriAyanamsa(last.julianDay) - lahiriAyanamsa(first.julianDay);
    const theirSpan = last.ayanamsa - first.ayanamsa;
    // Agreement on the accumulated precession over 125 years, to under an arcsecond a decade.
    expect(Math.abs(ourSpan - theirSpan) * 3600).toBeLessThan(15);
  });

  it('does NOT retune the anchor to the reference, and records why', () => {
    // This is the assertion that matters. The residuals are -10.6, -3.4, -14.4 and -11.0
    // arcsec — not a constant offset, so NO anchor value can remove them. The four supplied
    // figures are not internally self-consistent: they imply precession rates of 50.13, 50.50
    // and 50.16 arcsec/yr across the three intervals, where the real value is ~50.29 and is
    // near-constant over this span. Moving LAHIRI_J2000 to 23.8570 would zero the 2000 row and
    // make 1950 worse. Under 'never invent a number to make a test pass', the anchor stands.
    expect(LAHIRI_J2000).toBe(23.853);

    const rows = fixture.lahiriAyanamsa.rows;
    const residuals = rows.map((r) => (lahiriAyanamsa(r.julianDay) - r.ayanamsa) * 3600);
    const spread = Math.max(...residuals) - Math.min(...residuals);
    // If the disagreement were a pure anchor offset the spread would be ~0. It is ~11″, which
    // is the evidence that the reference series carries its own scatter.
    expect(spread).toBeGreaterThan(5);

    // And the implied rates really do disagree with each other, which is why.
    const rateBetween = (a: typeof rows[number], b: typeof rows[number]) =>
      ((b.ayanamsa - a.ayanamsa) / ((b.julianDay - a.julianDay) / 365.25)) * 3600;
    const rates = [rateBetween(rows[0]!, rows[1]!), rateBetween(rows[1]!, rows[2]!),
      rateBetween(rows[2]!, rows[3]!)];
    expect(Math.max(...rates) - Math.min(...rates)).toBeGreaterThan(0.2);
  });
});
