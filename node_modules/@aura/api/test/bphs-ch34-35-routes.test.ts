// BPHS Programme Part 30 — the chapter 34-35 routes.

import { describe, it, expect, beforeAll } from 'vitest';

process.env.AURA_DB_PATH = ':memory:';

const { buildServer } = await import('../src/server.js');
const app = buildServer();
beforeAll(async () => { await app.ready(); });

describe('GET /bphs/34/yoga-karakas', () => {
  it('serves the twelve rows and the divergences', async () => {
    const res = await app.inject({ method: 'GET', url: '/bphs/34/yoga-karakas' });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.ascendants).toHaveLength(12);
    expect(b.divergences).toHaveLength(5);
    expect(b.rajaYogaRelations).toHaveLength(6);
  });

  it('never serves the maraka column', async () => {
    // It is in the data — Part 51 material, computed and withheld — and must not leave.
    const b = (await app.inject({ method: 'GET', url: '/bphs/34/yoga-karakas' })).json();
    for (const row of b.ascendants) expect(row.maraka).toBeUndefined();
    expect(JSON.stringify(b.ascendants)).not.toContain('maraka');
  });
});

describe('GET /bphs/34/yoga-karaka/:lagna', () => {
  it('gives both corpora side by side for one ascendant', async () => {
    const res = await app.inject({ method: 'GET', url: '/bphs/34/yoga-karaka/6' });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.yogaKaraka).toBe('saturn');          // Libra
    expect(b.otherCorpus.yogakaraka).toBe('saturn');
    expect(b.maraka).toBeUndefined();
  });

  it('400s on a lagna outside 0-11', async () => {
    expect((await app.inject({ method: 'GET', url: '/bphs/34/yoga-karaka/12' })).statusCode).toBe(400);
    expect((await app.inject({ method: 'GET', url: '/bphs/34/yoga-karaka/x' })).statusCode).toBe(400);
  });
});

describe('POST /bphs/35/nabhasa', () => {
  const movable = { sun: 0, moon: 3, mars: 6, mercury: 9, jupiter: 0, venus: 3, saturn: 6 };

  it('detects the shapes and reports the suppressed Sankhya yoga', async () => {
    const res = await app.inject({
      method: 'POST', url: '/bphs/35/nabhasa', payload: { lagnaSign: 0, signs: movable },
    });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.yogas.map((y: { name: string }) => y.name)).toContain('Rajju');
    expect(b.suppressed.length).toBeGreaterThan(0);
    expect(b.suppressed[0].why).toContain('eighth source-stated');
  });

  it('returns the formation even when the reading is refused', async () => {
    // A detected shape with a withheld reading is still a fact about the chart.
    const b = (await app.inject({
      method: 'POST', url: '/bphs/35/nabhasa', payload: { lagnaSign: 0, signs: movable },
    })).json();
    for (const y of b.yogas) {
      expect(y.formation).toBeTruthy();
      if (y.reading === null) expect(y.withheld).toBeTruthy();
    }
  });

  it('400s on a partial chart rather than returning a partial answer', async () => {
    // Every Nabhasa formation is about where all seven are.
    const res = await app.inject({
      method: 'POST', url: '/bphs/35/nabhasa',
      payload: { lagnaSign: 0, signs: { sun: 0, moon: 3 } },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain('missing');
  });

  it('400s on a bad lagnaSign or a bad sign', async () => {
    expect((await app.inject({
      method: 'POST', url: '/bphs/35/nabhasa', payload: { signs: movable },
    })).statusCode).toBe(400);
    expect((await app.inject({
      method: 'POST', url: '/bphs/35/nabhasa',
      payload: { lagnaSign: 0, signs: { ...movable, saturn: 99 } },
    })).statusCode).toBe(400);
  });
});

describe('GET /bphs/35/nabhasa', () => {
  it('serves all 32 with their group counts', async () => {
    const b = (await app.inject({ method: 'GET', url: '/bphs/35/nabhasa' })).json();
    expect(b.yogas).toHaveLength(32);
    expect(b.groupCounts).toEqual({ asraya: 3, dala: 2, akriti: 20, sankhya: 7 });
    expect(b.noWorkedExample).toContain('verified by construction');
  });
});
