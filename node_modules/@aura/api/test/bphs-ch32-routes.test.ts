// BPHS Programme Part 28 — the chapter 32 routes.
//
// These exist because a route that returns a garbage 200 is worse than one that 400s, and
// the only way to know which it does is to ask it. Written as tests rather than a scratch
// smoke script so the answer stays true after the next part.

import { describe, it, expect, beforeAll } from 'vitest';

process.env.AURA_DB_PATH = ':memory:';

const { buildServer } = await import('../src/server.js');
const app = buildServer();
beforeAll(async () => { await app.ready(); });

describe('GET /bphs/32/karakas — the reconciliation view', () => {
  it('serves both books’ positions and the divergences between them', async () => {
    const res = await app.inject({ method: 'GET', url: '/bphs/32/karakas' });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.charaOrder).toHaveLength(8);
    expect(b.charaOrder[0]).toBe('Atmakaraka');
    expect(b.sthira).toHaveLength(8);
    expect(b.sthiraDivergences).toHaveLength(4);
    expect(b.bhavaKarakaDivergences).toHaveLength(5);
  });

  it('serves the house polarity with its caveat attached, not bare', () => {
    // A caller handed [2,3,6,8,11,12] with no note would reasonably think the 11th a typo.
    return app.inject({ method: 'GET', url: '/bphs/32/karakas' }).then((res) => {
      const b = res.json();
      expect(b.adverseHouses).toContain(11);
      expect(b.housePolarityNote).toContain('stricter than most later schemes');
    });
  });

  it('carries the Atmakaraka precedence rule and says it is not yet wired', async () => {
    const b = (await app.inject({ method: 'GET', url: '/bphs/32/karakas' })).json();
    expect(b.atmakarakaPrecedence).toContain('seventh source-stated');
    expect(b.atmakarakaPrecedence).toContain('Not yet wired');
  });
});

describe('POST /bphs/32/karaka-frames', () => {
  const signs = { sun: 0, moon: 3, mars: 2, mercury: 3, jupiter: 4, venus: 5, saturn: 6 };

  it('returns the six surfaced frames with their computed signs', async () => {
    const res = await app.inject({ method: 'POST', url: '/bphs/32/karaka-frames', payload: { signs } });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b).toHaveLength(6);
    const father = b.find((f: { matter: string }) => f.matter === 'the father');
    expect(father.house).toBe(9);
    expect(father.sign).toBe(8); // the 9th from Aries is Sagittarius
  });

  it('never returns the longevity frame, even though Saturn was supplied', async () => {
    const b = (await app.inject({ method: 'POST', url: '/bphs/32/karaka-frames', payload: { signs } })).json();
    expect(b.some((f: { graha: string }) => f.graha === 'saturn')).toBe(false);
    expect(JSON.stringify(b)).not.toMatch(/longevity/i);
  });

  it('400s on a missing body rather than returning an empty 200', async () => {
    const res = await app.inject({ method: 'POST', url: '/bphs/32/karaka-frames', payload: {} });
    expect(res.statusCode).toBe(400);
  });

  it('400s on an out-of-range sign and names the offending planet', async () => {
    const res = await app.inject({ method: 'POST', url: '/bphs/32/karaka-frames', payload: { signs: { sun: 44 } } });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain('sun');
  });
});

describe('POST /bphs/32/paraspara', () => {
  // The book's first worked chart: Scorpio lagna, Sun and Saturn in own signs.
  const chart1 = { lagnaSign: 7, planets: { sun: { sign: 4, dignity: 'own' }, saturn: { sign: 10, dignity: 'own' } } };

  it('finds the book’s chart-1 pair, and marks the 10th-house emphasis', async () => {
    const res = await app.inject({ method: 'POST', url: '/bphs/32/paraspara', payload: chart1 });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.pairs).toHaveLength(1);
    expect(b.pairs[0].rule).toBe(1);
    expect(b.pairs[0].viaTenth).toBe(true);
  });

  it('returns the disputed-rule and not-from-Moon caveats alongside the answer', async () => {
    const b = (await app.inject({ method: 'POST', url: '/bphs/32/paraspara', payload: chart1 })).json();
    expect(b.dignitiesAccepted).toEqual(['exalted', 'moolatrikona', 'own', 'friend']);
    expect(b.rule3).toContain('opt-in');
    expect(b.notFromMoon).toContain('not to be considered');
  });

  it('withholds rule-3 pairs unless asked, then tags them', async () => {
    // Chart 3: Gemini lagna, Jupiter and Saturn exalted, neither angular from the lagna.
    const chart3 = {
      lagnaSign: 2,
      planets: { jupiter: { sign: 3, dignity: 'exalted' }, saturn: { sign: 6, dignity: 'exalted' } },
    };
    const off = (await app.inject({ method: 'POST', url: '/bphs/32/paraspara', payload: chart3 })).json();
    expect(off.pairs).toHaveLength(0);
    const on = (await app.inject({
      method: 'POST', url: '/bphs/32/paraspara', payload: { ...chart3, includeRule3: true },
    })).json();
    expect(on.pairs).toHaveLength(1);
    expect(on.pairs[0].rule).toBe(3);
  });

  it('400s without a lagnaSign, and rejects an out-of-range one', async () => {
    const noLagna = await app.inject({ method: 'POST', url: '/bphs/32/paraspara', payload: { planets: {} } });
    expect(noLagna.statusCode).toBe(400);
    const bad = await app.inject({
      method: 'POST', url: '/bphs/32/paraspara', payload: { lagnaSign: 12, planets: { sun: { sign: 4 } } },
    });
    expect(bad.statusCode).toBe(400);
  });

  it('400s when no planets are supplied rather than reporting "no pairs"', async () => {
    // An empty planet set trivially has no co-workers; saying so would look like an answer.
    const res = await app.inject({ method: 'POST', url: '/bphs/32/paraspara', payload: { lagnaSign: 0, planets: {} } });
    expect(res.statusCode).toBe(400);
  });
});
