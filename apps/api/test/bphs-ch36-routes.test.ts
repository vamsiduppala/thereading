// BPHS Programme Part 31 — the chapter 36 routes.

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
  jupiter: { sign: 3, house: 4, longitude: 98 },
  venus: { sign: 5, house: 6, longitude: 160 },
  saturn: { sign: 6, house: 7, longitude: 200 },
};

describe('GET /bphs/36/yogas', () => {
  it('serves the catalogue with the arbitration caveat attached', async () => {
    const res = await app.inject({ method: 'GET', url: '/bphs/36/yogas' });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.yogas.length).toBeGreaterThanOrEqual(20);
    expect(b.ruleCount).toBeGreaterThan(150);
    expect(b.nameIsNotAVerdict).toContain('does not settle its effect');
    expect(b.notEncodable).toHaveLength(3);
  });

  it('does not ship raw predicates to the client', async () => {
    const b = (await app.inject({ method: 'GET', url: '/bphs/36/yogas' })).json();
    for (const y of b.yogas) {
      expect(y.when).toBeUndefined();
      expect(y.unless).toBeUndefined();
    }
  });
});

describe('POST /bphs/36/yogas', () => {
  it('reports the yogas a chart forms, each citing its verse', async () => {
    const res = await app.inject({
      method: 'POST', url: '/bphs/36/yogas', payload: { lagnaSign: 0, planets },
    });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(Array.isArray(b.yogas)).toBe(true);
    for (const y of b.yogas) {
      expect(y.verse).toBeTruthy();
      expect(y.arity).toBeGreaterThan(0);
    }
  });

  it('groups the alternative forms of one yoga instead of counting it twice', async () => {
    // Three forms of Gaja Kesari is still one Gaja Kesari.
    const b = (await app.inject({
      method: 'POST', url: '/bphs/36/yogas', payload: { lagnaSign: 0, planets },
    })).json();
    const names = b.yogas.map((y: { yoga: string }) => y.yoga);
    expect(new Set(names).size).toBe(names.length);
  });

  it('never reports the refused Ashubha reading', async () => {
    const b = (await app.inject({
      method: 'POST', url: '/bphs/36/yogas', payload: { lagnaSign: 0, planets },
    })).json();
    expect(JSON.stringify(b.yogas)).not.toContain('ashubha');
  });

  it('400s without a lagnaSign or without planets', async () => {
    expect((await app.inject({
      method: 'POST', url: '/bphs/36/yogas', payload: { planets },
    })).statusCode).toBe(400);
    expect((await app.inject({
      method: 'POST', url: '/bphs/36/yogas', payload: { lagnaSign: 0, planets: {} },
    })).statusCode).toBe(400);
  });
});
