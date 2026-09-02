// The birthplace widening, tested without touching the network.
//
// The upstream is a shared free service. A suite that calls it is slow, is rate-limited, fails
// when a laptop is offline, and is rude besides — so every test here injects a fetch. The two
// live checks that DID matter were run by hand while building this and are recorded in the
// fixtures below: Vontimitta returns the village and the like-named county, and Springfield
// returns four American cities in two different time zones.
//
// That second one is the whole reason this file is careful. `BirthData` needs an IANA zone, and
// the offset is then resolved for the birth DATE. Guessing the zone from the country is right
// for India and wrong for the United States, Australia, Brazil, Russia and Canada — and an hour
// of error is a different ascendant, different houses, and a reading that looks entirely normal
// while being about somebody else.

import { describe, it, expect, beforeEach } from 'vitest';
import { geocode, clearGeocodeCache } from '../src/geocode.js';

/** Rows shaped exactly as Nominatim returned them, captured from real calls. */
const VONTIMITTA = [
  {
    lat: '14.3734323', lon: '79.0914067', name: 'Vontimitta',
    addresstype: 'county', type: 'administrative', category: 'boundary', place_rank: 12,
    display_name: 'Vontimitta, YSR Kadapa, Andhra Pradesh, 516213, India',
    address: { county: 'Vontimitta', state_district: 'YSR Kadapa', state: 'Andhra Pradesh', country: 'India' },
  },
  {
    lat: '14.3955933', lon: '79.0264042', name: 'Vontimitta',
    addresstype: 'village', type: 'village', category: 'place', place_rank: 19,
    display_name: 'Vontimitta, YSR Kadapa, Andhra Pradesh, India',
    address: { village: 'Vontimitta', state_district: 'YSR Kadapa', state: 'Andhra Pradesh', country: 'India' },
  },
];

const SPRINGFIELDS = [
  {
    lat: '39.7990', lon: '-89.6440', name: 'Springfield', addresstype: 'city', type: 'city',
    display_name: 'Springfield, Sangamon County, Illinois, 62701, United States',
    address: { city: 'Springfield', county: 'Sangamon County', state: 'Illinois', country: 'United States' },
  },
  {
    lat: '42.1019', lon: '-72.5887', name: 'Springfield', addresstype: 'city', type: 'city',
    display_name: 'Springfield, Hampden County, Massachusetts, 01103, United States',
    address: { city: 'Springfield', county: 'Hampden County', state: 'Massachusetts', country: 'United States' },
  },
];

/** Things Nominatim genuinely returns that are not places a person is born in. */
const NOISE = [
  { lat: '14.40', lon: '79.02', name: 'Vontimitta Bus Stand', addresstype: 'bus_stop', type: 'bus_stop', display_name: 'Vontimitta Bus Stand, India', address: { country: 'India' } },
  { lat: '14.41', lon: '79.03', name: 'Cheyyeru', addresstype: 'river', type: 'river', display_name: 'Cheyyeru, India', address: { country: 'India' } },
  { lat: '14.42', lon: '79.04', name: 'ZP High School', addresstype: 'school', type: 'school', display_name: 'ZP High School, India', address: { country: 'India' } },
];

const fake = (rows: unknown[], status = 200) => (async () => ({
  ok: status === 200,
  status,
  json: async () => rows,
})) as unknown as typeof fetch;

beforeEach(() => clearGeocodeCache());

describe('it finds the village that started this', () => {
  it('returns Vontimitta with usable coordinates and a zone', async () => {
    const r = await geocode('Vontimitta', { fetchImpl: fake(VONTIMITTA) });
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]!.name).toBe('Vontimitta');
    expect(r[0]!.country).toBe('India');
    expect(r[0]!.tz).toBe('Asia/Kolkata');
    expect(r[0]!.lat).toBeCloseTo(14.39, 1);
    expect(r[0]!.lng).toBeCloseTo(79.03, 1);
  });

  it('puts the village above the district that shares its name', async () => {
    // Nominatim ranks the administrative boundary first by its own importance score. A person
    // asked where they were born, not which county they were born in, so the ordering here is
    // by place KIND rather than by the upstream's ranking.
    const r = await geocode('Vontimitta', { fetchImpl: fake(VONTIMITTA) });
    expect(r[0]!.kind).toBe('village');
  });

  it('carries a district line, because two villages share the name', async () => {
    const r = await geocode('Vontimitta', { fetchImpl: fake(VONTIMITTA) });
    expect(r[0]!.detail).toContain('YSR Kadapa');
    // The postcode is dropped: it is noise in a disambiguation line.
    expect(r[0]!.detail).not.toMatch(/\d{5,}/);
  });
});

describe('the time zone is derived from coordinates, not from the country', () => {
  it('gives two American Springfields two different zones', async () => {
    // This is the assertion the whole module exists for. Both rows say "United States"; one is
    // Central and one is Eastern, and only the coordinates can tell them apart.
    const r = await geocode('Springfield', { fetchImpl: fake(SPRINGFIELDS) });
    expect(r).toHaveLength(2);
    const zones = r.map((x) => x.tz);
    expect(zones).toContain('America/Chicago');
    expect(zones).toContain('America/New_York');
    expect(new Set(zones).size).toBe(2);
  });

  it('returns an IANA zone name, never a fixed offset', async () => {
    // An offset cannot carry a birth date's DST rules. A zone can, and `offsetForLocalBirth`
    // in the client resolves it against the historical database.
    const r = await geocode('Springfield', { fetchImpl: fake(SPRINGFIELDS) });
    for (const x of r) {
      expect(x.tz, x.name).toMatch(/^[A-Za-z_]+\/[A-Za-z_+-]/);
      expect(x.tz).not.toMatch(/^[+-]?\d/);
    }
  });
});

describe('it offers places, not landmarks', () => {
  it('drops bus stops, rivers and schools', async () => {
    const r = await geocode('Vontimitta', { fetchImpl: fake([...NOISE, ...VONTIMITTA]) });
    for (const x of r) {
      expect(['bus_stop', 'river', 'school']).not.toContain(x.kind);
    }
    expect(r.some((x) => x.kind === 'village')).toBe(true);
  });

  it('collapses the same place described twice', async () => {
    const twice = [VONTIMITTA[1]!, { ...VONTIMITTA[1]!, lat: '14.3961', lon: '79.0269' }];
    const r = await geocode('Vontimitta', { fetchImpl: fake(twice) });
    expect(r).toHaveLength(1);
  });
});

describe('it fails in the direction that costs nothing', () => {
  it('returns nothing for a query too short to mean anything', async () => {
    let called = false;
    const spy = (async () => { called = true; return { ok: true, status: 200, json: async () => [] }; }) as unknown as typeof fetch;
    expect(await geocode('vo', { fetchImpl: spy })).toEqual([]);
    // And does not spend somebody else's rate limit finding that out.
    expect(called).toBe(false);
  });

  it('throws on an upstream error rather than inventing a result', async () => {
    // The route turns this into an empty list with a note. What must not happen is a
    // fabricated coordinate, which would produce a confident chart for nowhere.
    await expect(geocode('Vontimitta', { fetchImpl: fake([], 503) })).rejects.toThrow(/503/);
  });

  it('survives an upstream that returns something unexpected', async () => {
    const junk = fake([{ lat: 'not-a-number', lon: 'x', addresstype: 'village' }]);
    expect(await geocode('Nowhere', { fetchImpl: junk })).toEqual([]);
  });

  it('drops a row whose zone cannot be resolved rather than defaulting one', async () => {
    // Mid-ocean. A row with no zone is worse than a missing row: it would quietly produce a
    // chart computed against the wrong hour.
    const ocean = fake([{
      lat: '0.0', lon: '-140.0', name: 'Nowhere', addresstype: 'village',
      display_name: 'Nowhere', address: { country: '' },
    }]);
    const r = await geocode('Nowhere', { fetchImpl: ocean });
    for (const x of r) expect(x.tz.length).toBeGreaterThan(3);
  });
});

describe('caching', () => {
  it('asks upstream once for a repeated query', async () => {
    let calls = 0;
    const counted = (async () => {
      calls++;
      return { ok: true, status: 200, json: async () => VONTIMITTA };
    }) as unknown as typeof fetch;

    await geocode('Vontimitta', { fetchImpl: counted });
    await geocode('Vontimitta', { fetchImpl: counted });
    await geocode('VONTIMITTA', { fetchImpl: counted });
    // A family looking up the same village, and a debounce that lets two keystrokes through,
    // should not be three calls to a free service.
    expect(calls).toBe(1);
  });
});
