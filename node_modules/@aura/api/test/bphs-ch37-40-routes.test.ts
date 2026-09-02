// BPHS Programme Part 32 — the chapter 37-40 routes.
//
// The assertion that matters most here is the last one in each block: these chapters state
// their effects as kingship, and no response may leave that unstated or state it literally.

import { describe, it, expect, beforeAll } from 'vitest';

process.env.AURA_DB_PATH = ':memory:';

const { buildServer } = await import('../src/server.js');
const app = buildServer();
beforeAll(async () => { await app.ready(); });

const planets = {
  sun: { sign: 0, house: 1, longitude: 5 },
  moon: { sign: 3, house: 4, longitude: 100 },
  mars: { sign: 2, house: 3, longitude: 75 },
  mercury: { sign: 3, house: 4, longitude: 95 },
  jupiter: { sign: 4, house: 5, longitude: 130 },
  venus: { sign: 5, house: 6, longitude: 160 },
  saturn: { sign: 6, house: 7, longitude: 200 },
};

describe('GET /bphs/37-38/luminary-yogas', () => {
  it('serves the catalogue with its modifiers attached', async () => {
    const res = await app.inject({ method: 'GET', url: '/bphs/37-38/luminary-yogas' });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.yogas.length).toBeGreaterThanOrEqual(9);
    expect(b.beneficMalefic).toContain('the participant decides the valence');
    expect(b.textualFault).toContain('TWICE');
  });
});

describe('GET /bphs/39-40/raja-yogas', () => {
  it('states the reframing on every response, not in a footnote', async () => {
    const res = await app.inject({ method: 'GET', url: '/bphs/39-40/raja-yogas' });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.reframing).toContain('That reframing is OURS');
    expect(b.frames).toContain('karakamsa');
    expect(b.notEncodable).toHaveLength(4);
  });

  it('never claims rank in a summary it serves', async () => {
    const b = (await app.inject({ method: 'GET', url: '/bphs/39-40/raja-yogas' })).json();
    for (const y of b.yogas) {
      expect(y.summary, `${y.chapter}.${y.verse}`)
        .not.toMatch(/\b(king|royal|throne|emperor|minister)\b/i);
    }
  });

  it('does not ship raw predicates to the client', async () => {
    const b = (await app.inject({ method: 'GET', url: '/bphs/39-40/raja-yogas' })).json();
    for (const y of b.yogas) {
      expect(y.when).toBeUndefined();
      expect(y.unless).toBeUndefined();
    }
  });
});

describe('POST /bphs/37-40/yogas', () => {
  it('reports the yogas a chart forms, each citing chapter and verse', async () => {
    const res = await app.inject({
      method: 'POST', url: '/bphs/37-40/yogas', payload: { lagnaSign: 0, planets },
    });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(Array.isArray(b.yogas)).toBe(true);
    expect(b.yogas.length).toBeGreaterThan(0);
    for (const y of b.yogas) {
      expect([37, 38, 39, 40]).toContain(y.chapter);
      expect(y.verse).toBeTruthy();
      // Only chapters 39-40 use BPHS 39.3-5's full/half/quarter scale; the luminary yogas
      // of 37-38 carry their own weights, and the response mixes both sets.
      if (y.chapter >= 39) expect([0.25, 0.5, 1], `${y.chapter}.${y.verse}`).toContain(y.magnitude);
      else expect(y.magnitude).toBeGreaterThan(0);
    }
  });

  it('carries the reframing on the reading response too', async () => {
    const b = (await app.inject({
      method: 'POST', url: '/bphs/37-40/yogas', payload: { lagnaSign: 0, planets },
    })).json();
    expect(b.reframing).toContain('ELEVATION');
    expect(JSON.stringify(b.yogas)).not.toMatch(/\b(king|royal|throne|emperor)\b/i);
  });

  it('reports Kemadruma as a shape and states that its reading is refused', async () => {
    const b = (await app.inject({
      method: 'POST', url: '/bphs/37-40/yogas', payload: { lagnaSign: 0, planets },
    })).json();
    expect(b.kemadruma).not.toBeNull();
    expect(typeof b.kemadruma.present).toBe('boolean');
    expect(b.kemadruma.readingRefused).toContain('refused');
  });

  it('grades the exaltation ladder without mentioning birth', async () => {
    const exalted = {
      ...planets,
      jupiter: { sign: 3, house: 4, longitude: 100, dignity: 'exalted' },
      venus: { sign: 11, house: 12, longitude: 340, dignity: 'exalted' },
    };
    const b = (await app.inject({
      method: 'POST', url: '/bphs/37-40/yogas', payload: { lagnaSign: 0, planets: exalted },
    })).json();
    expect(b.exaltationLadder).not.toBeNull();
    expect(b.exaltationLadder.summary).not.toMatch(/scion|descent|base-birth|caste/i);
  });

  it('400s without a lagnaSign or without planets', async () => {
    expect((await app.inject({
      method: 'POST', url: '/bphs/37-40/yogas', payload: { planets },
    })).statusCode).toBe(400);
    expect((await app.inject({
      method: 'POST', url: '/bphs/37-40/yogas', payload: { lagnaSign: 0, planets: {} },
    })).statusCode).toBe(400);
  });
});
