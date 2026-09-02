// Finding a birthplace that is not in the bundled list — a village, a hamlet, a suburb.
//
// The bundled list is ~230 cities and answers instantly, offline, with no third party involved.
// It is right for almost everyone and wrong for anyone born in a village, which for this
// product's users is not a rare case. Vontimitta, in YSR Kadapa, has a well-known temple and
// several thousand people, and typing it produced nothing at all.
//
// So this is a SECOND source, not a replacement. The local list still answers first and still
// answers offline; this fills in behind it. Three things follow from that ordering:
//
//   1. **It never blocks.** The caller shows local results immediately and merges these in when
//      they arrive. A slow or unreachable geocoder costs nothing but the extra rows.
//   2. **It runs server-side.** The browser could call Nominatim directly, but then every user
//      of this app sends their birthplace straight to a third party from their own IP, with no
//      caching and no way to identify the client properly. Proxying means one User-Agent, one
//      cache, and one place where the policy is enforced.
//   3. **The time zone is derived, not guessed.** This is the part that matters. Nominatim
//      returns coordinates and an address; it does not return a time zone. `BirthData` needs
//      the IANA zone so the offset can be resolved FOR THE BIRTH DATE — and an hour of error
//      is a different ascendant, different houses, and a completely different reading that
//      looks entirely normal. Country is not enough: the United States has six zones, Australia
//      five, Brazil four. So the zone comes from a coordinate lookup against the real tz
//      boundaries.

import tzLookup from 'tz-lookup';

export interface GeoResult {
  name: string;
  country: string;
  lat: number;
  /** East-positive, matching the engine's convention everywhere. */
  lng: number;
  /** IANA zone, derived from the coordinates. */
  tz: string;
  /** The full line Nominatim returned, so a user can tell two same-named villages apart. */
  detail: string;
  /** What kind of place this is — village, town, suburb. Shown so the ranking is legible. */
  kind: string;
}

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';

/**
 * Nominatim's usage policy requires an identifying User-Agent and asks for at most one request
 * per second. Both are met here rather than hoped for: a shared free service that this project
 * does not pay for is one whose rules it should keep.
 */
const UA = 'aura-vedic-reading/0.1 (self-hosted; birthplace lookup)';
const MIN_GAP_MS = 1100;
let lastCall = 0;

/**
 * Results cached by query. Birthplace lookups repeat heavily — a person types "vontim",
 * "vontimi", "vontimitta" and the debounce still lets two or three through — and the same
 * village is looked up by every member of a family.
 */
const cache = new Map<string, { at: number; results: GeoResult[] }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 500;

interface NominatimRow {
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  addresstype?: string;
  type?: string;
  category?: string;
  place_rank?: number;
  importance?: number;
  address?: Record<string, string>;
}

/**
 * Place kinds worth offering as a BIRTHPLACE, best first.
 *
 * Nominatim will happily return a river, a school or a bus stop for a query that matches one.
 * None of those is somewhere a person was born, and offering them makes the list look broken
 * even when the village is also in it. Ordering by this list also puts the village itself above
 * the administrative district that shares its name — which is the actual answer for Vontimitta,
 * where the county and the village are both called that and the county row scores higher on
 * Nominatim's own importance.
 */
const PLACE_KINDS = [
  'city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood', 'quarter',
  'municipality', 'locality', 'isolated_dwelling', 'county', 'district',
  'state_district', 'administrative',
];

const kindRank = (k: string): number => {
  const i = PLACE_KINDS.indexOf(k);
  return i < 0 ? 99 : i;
};

export interface GeocodeOptions {
  limit?: number;
  /** Injectable for tests, so the suite never touches the network. */
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

export async function geocode(query: string, opts: GeocodeOptions = {}): Promise<GeoResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const limit = Math.max(1, Math.min(10, opts.limit ?? 6));
  const key = `${q.toLowerCase()}|${limit}`;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.results;

  const doFetch = opts.fetchImpl ?? fetch;

  // Space the calls out. Two keystrokes past the debounce should not become two simultaneous
  // requests to somebody else's free service.
  const wait = MIN_GAP_MS - (Date.now() - lastCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();

  const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&format=jsonv2`
    + `&limit=${limit * 2}&addressdetails=1`;

  const res = await doFetch(url, {
    headers: { 'user-agent': UA, accept: 'application/json' },
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`geocoder returned ${res.status}`);

  const rows = await res.json() as NominatimRow[];
  const out: GeoResult[] = [];
  const seen = new Set<string>();

  for (const r of Array.isArray(rows) ? rows : []) {
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const kind = r.addresstype ?? r.type ?? r.category ?? '';
    if (kindRank(kind) === 99) continue;   // not a place a person is born in

    // Two rows a tenth of a degree apart are the same village described twice — the boundary
    // relation and the node inside it. Keep the better-ranked one.
    const dedup = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    if (seen.has(dedup)) continue;
    seen.add(dedup);

    let tz: string;
    try {
      tz = tzLookup(lat, lng);
    } catch {
      // No zone means no honest offset, and an unusable row is worse than a missing one:
      // it would produce a chart quietly computed against the wrong hour.
      continue;
    }

    const a = r.address ?? {};
    const name = r.name
      || a.village || a.town || a.city || a.hamlet || a.suburb || a.county
      || (r.display_name ?? '').split(',')[0]?.trim()
      || q;
    const country = a.country ?? '';
    // The middle of the display name: enough to tell two same-named villages apart, without
    // repeating the name and the country that already have their own columns.
    const parts = (r.display_name ?? '').split(',').map((s) => s.trim());
    const detail = parts.slice(1, -1).filter((s) => s && !/^\d{4,}$/.test(s)).join(', ');

    out.push({ name, country, lat, lng, tz, detail, kind });
  }

  out.sort((a, b) => kindRank(a.kind) - kindRank(b.kind));
  const results = out.slice(0, limit);

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), results });
  return results;
}

/** Exposed for tests: a lookup with no network and no cache state. */
export function clearGeocodeCache(): void {
  cache.clear();
  lastCall = 0;
}

export const THE_ZONE_IS_THE_HARD_PART =
  'A geocoder returns coordinates and an address. It does not return a time zone, and the chart '
  + 'needs one — not an offset, an IANA zone, because the offset must then be resolved for the '
  + 'BIRTH DATE with whatever DST rules were in force that year. Guessing the zone from the '
  + 'country is right for India and wrong for the United States, Australia, Brazil, Russia and '
  + 'Canada. An hour of error is a different ascendant and a completely different reading that '
  + 'looks entirely normal, so the zone is looked up against real timezone boundaries and a row '
  + 'whose zone cannot be resolved is dropped rather than defaulted.';

export const A_SECOND_SOURCE_NOT_A_REPLACEMENT =
  'The bundled list still answers first and still answers with no network. This runs behind it '
  + 'and merges in. That ordering is what keeps the entry screen — the very first thing a user '
  + 'sees — from depending on somebody else\'s server being up.';
