// BPHS Programme Part 29 — the chapter 33 routes.

import { describe, it, expect, beforeAll } from 'vitest';

process.env.AURA_DB_PATH = ':memory:';

const { buildServer } = await import('../src/server.js');
const app = buildServer();
beforeAll(async () => { await app.ready(); });

const longitudes = {
  sun: 5, moon: 100, mars: 75.5, mercury: 95,
  jupiter: 130.25, venus: 160, saturn: 200, rahu: 220,
};

describe('GET /bphs/33/karakamsa', () => {
  it('serves the tables with the self-contradiction attached', async () => {
    const res = await app.inject({ method: 'GET', url: '/bphs/33/karakamsa' });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.signs).toHaveLength(12);
    expect(b.planets).toHaveLength(9);
    expect(b.selfContradiction).toContain('grammarian');
    expect(b.exclusionThemes).toHaveLength(6);
  });
});

describe('POST /bphs/33/reading', () => {
  it('derives the Atmakaraka and returns the karakamsa reading', async () => {
    const res = await app.inject({ method: 'POST', url: '/bphs/33/reading', payload: { longitudes } });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.atmakaraka).toBeTruthy();
    expect(b.karakamsa).toBeGreaterThanOrEqual(0);
    expect(b.karakamsa).toBeLessThan(12);
    expect(Array.isArray(b.findings)).toBe(true);
  });

  it('every finding cites a chapter-33 verse', async () => {
    const b = (await app.inject({ method: 'POST', url: '/bphs/33/reading', payload: { longitudes } })).json();
    for (const f of b.findings) {
      expect(f.id).toMatch(/^bphs\.33\./);
      expect(f.verse).toBeTruthy();
    }
  });

  it('carries the calibration caveat rather than implying a real navamsa population', async () => {
    const b = (await app.inject({ method: 'POST', url: '/bphs/33/reading', payload: { longitudes } })).json();
    expect(b.calibrationNote).toContain('not real navamsas');
  });

  it('never surfaces longevity, medical or moral material', async () => {
    const b = (await app.inject({ method: 'POST', url: '/bphs/33/reading', payload: { longitudes } })).json();
    expect(JSON.stringify(b.findings))
      .not.toMatch(/\b(death|leprosy|consumption|thief|lifespan|longevity|100 years)\b/i);
  });

  it('400s on a missing or out-of-range longitude', async () => {
    expect((await app.inject({ method: 'POST', url: '/bphs/33/reading', payload: {} })).statusCode).toBe(400);
    const bad = await app.inject({
      method: 'POST', url: '/bphs/33/reading', payload: { longitudes: { sun: 400 } },
    });
    expect(bad.statusCode).toBe(400);
    expect(bad.json().error).toContain('sun');
  });

  it('400s when the named Atmakaraka is not on the chart', async () => {
    // Otherwise the reading would be about a planet the caller never supplied.
    const res = await app.inject({
      method: 'POST', url: '/bphs/33/reading',
      payload: { atmakaraka: 'saturn', longitudes: { sun: 5, moon: 100 } },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain('saturn');
  });
});
