// The real-chart placement rate for the five Pancha Mahapurusha yogas.
//
// This exists because the synthetic calibration population got it badly wrong, and the error
// pointed the wrong way. `syntheticCharts` predicted 21.4% of charts carry at least one
// Mahapurusha placement; real ephemeris charts give ~35%. The synthetic population draws
// dignity from a flat bag and places planets independently, but real charts cluster — Mercury
// and Venus stay near the Sun, and sign occupancy is not uniform.
//
// The number matters: BPHS 75.1 calls these the yogas of a MAHĀPURUṢA, a great person. A
// configuration present in more than a third of the population is not marking greatness, which
// is the practical argument for enforcing 75.1's third condition (balibhiḥ — "and strong").

import { describe, it, expect } from 'vitest';
import { computeChart } from '../src/chart/chart.js';
import { AstronomiaEphemeris } from '../src/astro/ephemeris.js';
import { detectYogas } from '../src/chart/yogas.js';

const MAHAPURUSHA = ['ruchaka', 'bhadra', 'hamsa', 'malavya', 'sasa'];

describe('Pancha Mahapurusha — the rate on real charts', () => {
  it('is far higher than the synthetic population predicted', () => {
    const ephem = new AstronomiaEphemeris();
    const places = [
      { place: 'Delhi', lat: 28.61, lng: 77.21, tz: 330 },
      { place: 'London', lat: 51.51, lng: -0.13, tz: 0 },
      { place: 'Sydney', lat: -33.87, lng: 151.21, tz: 600 },
      { place: 'Sao Paulo', lat: -23.55, lng: -46.63, tz: -180 },
    ];
    let n = 0;
    let withYoga = 0;
    for (let year = 1950; year < 2010; year++) {
      for (let m = 1; m <= 12; m++) {
        for (const p of places) {
          const day = ((year * 7 + m * 13) % 27) + 1;
          const hh = String((year * 3 + m * 5) % 24).padStart(2, '0');
          const mm = String((year * 11 + m * 7) % 60).padStart(2, '0');
          const chart = computeChart({
            date: `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            time: `${hh}:${mm}`,
            unknownTime: false,
            place: p.place, lat: p.lat, lng: p.lng, tzOffsetMinutes: p.tz,
          }, ephem);
          n++;
          if (detectYogas(chart).some((y) => MAHAPURUSHA.includes(y.key))) withYoga++;
        }
      }
    }
    const rate = withYoga / n;
    expect(n).toBeGreaterThan(2000);
    // Measured at 35.4% over 2,880 charts spanning 60 years and four hemisphereless places.
    expect(rate).toBeGreaterThan(0.30);
    expect(rate).toBeLessThan(0.42);
    // And decisively above the synthetic 21.4% — the reason that figure is not used.
    expect(rate).toBeGreaterThan(0.214 * 1.3);
  });
});
