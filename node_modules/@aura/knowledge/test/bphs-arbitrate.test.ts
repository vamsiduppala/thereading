// BPHS Programme Part 19 — the arbitration ordering and base-rate calibration.
//
// The ordering is mostly the corpus's own, so these tests check that it behaves the way
// the cited verses say, and that the parts we chose are visible as choices.

import { describe, it, expect } from 'vitest';
import {
  ARBITRATION_ORDER, ARBITRATION_WEIGHTS, WEIGHTS_ARE_OURS,
  CONFIDENCE_CEILING, CONFIDENCE_NEVER_CERTAIN, SAV_BASELINE,
  arbitrate, bearingPlanet,
  mulberry32, syntheticCharts, SYNTHETIC_CHARTS_ARE_UNIFORM,
  calibrate, withBaseRates, ARBITRATION_OPEN,
  BASE_RATE_SUPPRESS, BASE_RATE_SUSPECT,
  type ChartFacts, type Rule,
} from '../src/index.js';

const facts = (over: Partial<Record<string, { sign: number; house: number }>> = {}): ChartFacts => ({
  lagnaSign: 0,
  planets: {
    sun: { sign: 0, house: 1 }, moon: { sign: 1, house: 2 }, mars: { sign: 2, house: 3 },
    mercury: { sign: 3, house: 4 }, jupiter: { sign: 4, house: 5 }, venus: { sign: 5, house: 6 },
    saturn: { sign: 6, house: 7 }, rahu: { sign: 7, house: 8 }, ketu: { sign: 1, house: 2 },
    ...over,
  },
} as unknown as ChartFacts);

const rule = (over: Partial<Rule> & { id: string }): Rule => ({
  source: { text: 'bphs', chapter: 1, verse: '1' },
  when: [{ k: 'placement', graha: 'jupiter', house: 5 }],
  effect: { id: 'e', domain: 'self', valence: 0.5, summary: 'x' },
  weight: 0.5,
  verification: 'unverified',
  ...over,
} as Rule);

// ── The ordering itself ──────────────────────────────────────────────────────
describe('BPHS Part 19 — the ordering', () => {
  it('names every stage with the verse it came from', () => {
    expect(ARBITRATION_ORDER.length).toBeGreaterThanOrEqual(8);
    for (const s of ARBITRATION_ORDER) {
      expect(s.id, s.id).toBeTruthy();
      expect(s.source, s.id).toBeTruthy();
    }
  });

  it('cites the four places the corpus stated its own precedence', () => {
    const sources = ARBITRATION_ORDER.map((s) => s.source).join(' ');
    expect(sources).toContain('27.37-38');
    expect(sources).toContain('72.30-31');
    expect(sources).toContain('74.11-13');
    expect(sources).toContain('28.15-20');
  });

  it('marks the base-rate stage as ours, since BPHS has no such notion', () => {
    const br = ARBITRATION_ORDER.find((s) => s.id === 'base-rate')!;
    expect(br.source).toContain('ours');
  });

  it('puts the gates before the ordering stages', () => {
    const ids = ARBITRATION_ORDER.map((s) => s.id);
    expect(ids.indexOf('cancellation')).toBeLessThan(ids.indexOf('arity'));
    expect(ids.indexOf('base-rate')).toBeLessThan(ids.indexOf('arity'));
  });

  it('says plainly that the weights are ours and provisional', () => {
    expect(WEIGHTS_ARE_OURS).toContain('Calibrate, do not cite');
  });
});

// ── Gates remove; ordering re-ranks ──────────────────────────────────────────
describe('BPHS Part 19 — gates', () => {
  it('drops a cancelled rule entirely rather than down-weighting it', () => {
    const r = rule({
      id: 'a',
      unless: [{ k: 'placement', graha: 'saturn', house: 7 }],
    });
    const res = arbitrate([r], facts());
    expect(res.findings).toHaveLength(0);
    expect(res.withheld).toHaveLength(0);   // cancelled rules never even fire
  });

  it('withholds a rule that fires for most of humanity, and says why', () => {
    const r = rule({ id: 'a', baseRate: 0.6 });
    const res = arbitrate([r], facts());
    expect(res.findings).toHaveLength(0);
    expect(res.withheld).toHaveLength(1);
    expect(res.withheld[0]!.status).toBe('background');
    expect(res.withheld[0]!.trace.some((t) => t.why.includes('describes humanity'))).toBe(true);
  });

  it('flags a rule that fires for almost nobody as a probable bug, not a rare gem', () => {
    const r = rule({ id: 'a', baseRate: 0.0001 });
    const res = arbitrate([r], facts());
    expect(res.withheld[0]!.status).toBe('suspect');
    expect(res.withheld[0]!.trace.some((t) => t.why.includes('transcription bug'))).toBe(true);
  });

  it('keeps a rule whose base rate sits between the two limits', () => {
    const r = rule({ id: 'a', baseRate: 0.05 });
    expect(arbitrate([r], facts()).findings).toHaveLength(1);
  });

  it('never silently discards — everything that fired appears somewhere', () => {
    const rs = [
      rule({ id: 'a', baseRate: 0.6 }),
      rule({ id: 'b', baseRate: 0.05 }),
      rule({ id: 'c', baseRate: 0.00001 }),
    ];
    const res = arbitrate(rs, facts());
    expect(res.findings.length + res.withheld.length).toBe(3);
  });
});

// ── 27.37-38 ─────────────────────────────────────────────────────────────────
describe('BPHS 27.37-38 — the stronger planet leads', () => {
  it('raises a finding whose planet clears its Shadbala requirement', () => {
    const r = rule({ id: 'a' });
    const strong = arbitrate([r], facts(), { shadbala: { jupiter: 420 } });
    const weak = arbitrate([r], facts(), { shadbala: { jupiter: 200 } });
    expect(strong.findings[0]!.score).toBeGreaterThan(weak.findings[0]!.score);
  });

  it('uses the per-planet requirement, not one global number', () => {
    // 350 clears Mars (300) but not Mercury (420).
    const mars = rule({ id: 'm', when: [{ k: 'placement', graha: 'mars', house: 3 }] });
    const merc = rule({ id: 'q', when: [{ k: 'placement', graha: 'mercury', house: 4 }] });
    const a = arbitrate([mars], facts(), { shadbala: { mars: 350 } }).findings[0]!;
    const b = arbitrate([merc], facts(), { shadbala: { mercury: 350 } }).findings[0]!;
    expect(a.score).toBeGreaterThan(b.score);
  });

  it('identifies which planet a rule rests on', () => {
    expect(bearingPlanet(rule({ id: 'a' }))).toBe('jupiter');
    expect(bearingPlanet(rule({
      id: 'b', when: [{ k: 'bindus', of: 'venus', house: 7, fromGraha: 'venus', op: '>=', n: 5 }],
    }))).toBe('venus');
  });

  it('returns null rather than guessing when no planet is named', () => {
    expect(bearingPlanet(rule({ id: 'a', when: [{ k: 'bindus', sign: 3, op: '>', n: 25 }] }))).toBeNull();
  });
});

// ── 28.11-12 ─────────────────────────────────────────────────────────────────
describe('BPHS 28.11-12 — tendency decides direction, not force', () => {
  it('supports a positive effect when Ishta dominates', () => {
    const r = rule({ id: 'a', effect: { id: 'e', domain: 'self', valence: 0.5, summary: 'x' } });
    const good = arbitrate([r], facts(), { ishta: { jupiter: 50 } }).findings[0]!;
    const bad = arbitrate([r], facts(), { ishta: { jupiter: 10 } }).findings[0]!;
    expect(good.score).toBeGreaterThan(bad.score);
  });

  it('reverses for a negative effect — high Kashta ARGUES FOR a hindering claim', () => {
    // This is the subtle half: a planet full of Kashta does not weaken every claim, it
    // weakens the helpful ones and strengthens the harmful ones.
    const neg = rule({ id: 'a', effect: { id: 'e', domain: 'self', valence: -0.5, summary: 'x' } });
    const kashta = arbitrate([neg], facts(), { ishta: { jupiter: 10 } }).findings[0]!;
    const ishta = arbitrate([neg], facts(), { ishta: { jupiter: 50 } }).findings[0]!;
    expect(kashta.score).toBeGreaterThan(ishta.score);
  });

  it('records the tendency reasoning in the trace', () => {
    const r = rule({ id: 'a' });
    const f = arbitrate([r], facts(), { ishta: { jupiter: 50 } }).findings[0]!;
    expect(f.trace.some((t) => t.stage === 'tendency' && t.why.includes('28.11-12'))).toBe(true);
  });
});

// ── 72.30-31 ─────────────────────────────────────────────────────────────────
describe('BPHS 72.30-31 — bindu support moves a finding', () => {
  it('raises a finding whose planet sits in a well-marked sign', () => {
    const r = rule({ id: 'a' });
    const sav = new Array(12).fill(28);
    const rich = [...sav]; rich[4] = 40;    // Jupiter is in sign 4
    const poor = [...sav]; poor[4] = 15;
    const a = arbitrate([r], facts(), { sav: rich }).findings[0]!;
    const b = arbitrate([r], facts(), { sav: poor }).findings[0]!;
    expect(a.score).toBeGreaterThan(b.score);
  });

  it('uses 337/12 as the neutral point', () => {
    expect(SAV_BASELINE).toBeCloseTo(28.083, 3);
    const r = rule({ id: 'a' });
    const sav = new Array(12).fill(SAV_BASELINE);
    const f = arbitrate([r], facts(), { sav }).findings[0]!;
    const av = f.trace.find((t) => t.stage === 'ashtakavarga')!;
    expect(av.delta).toBeCloseTo(0, 9);
  });
});

// ── 74.11-13 ─────────────────────────────────────────────────────────────────
describe('BPHS 74.11-13 — contested claims', () => {
  const pro = rule({ id: 'pro', effect: { id: 'shared', domain: 'self', valence: 0.5, summary: 'yes' } });
  const con = rule({
    id: 'con',
    when: [{ k: 'placement', graha: 'saturn', house: 7 }],
    effect: { id: 'shared', domain: 'self', valence: -0.5, summary: 'no' },
  });

  it('records dissent on both sides rather than hiding the loser', () => {
    const res = arbitrate([pro, con], facts());
    expect(res.findings).toHaveLength(2);
    for (const f of res.findings) expect(f.dissent.length).toBe(1);
  });

  it('lowers confidence when something argues the other way', () => {
    const alone = arbitrate([pro], facts()).findings[0]!;
    const contested = arbitrate([pro, con], facts()).findings.find((f) => f.hit.rule.id === 'pro')!;
    expect(contested.confidence).toBeLessThan(alone.confidence);
  });

  it('reports a true tie as mixed instead of breaking it', () => {
    const res = arbitrate([pro, con], facts());
    expect(res.mixed).toContain('shared');
  });

  it('does not call it mixed when one side outnumbers the other', () => {
    const pro2 = rule({
      id: 'pro2', when: [{ k: 'placement', graha: 'moon', house: 2 }],
      effect: { id: 'shared', domain: 'self', valence: 0.5, summary: 'yes' },
    });
    expect(arbitrate([pro, pro2, con], facts()).mixed).not.toContain('shared');
  });
});

// ── arity, damping, confidence ───────────────────────────────────────────────
describe('BPHS Part 19 — ranking and confidence', () => {
  it('ranks the more specific rule above the more generic one', () => {
    const generic = rule({ id: 'g' });
    const specific = rule({
      id: 's',
      when: [
        { k: 'placement', graha: 'jupiter', house: 5 },
        { k: 'placement', graha: 'saturn', house: 7 },
        { k: 'placement', graha: 'mars', house: 3 },
      ],
    });
    const res = arbitrate([generic, specific], facts());
    expect(res.findings[0]!.hit.rule.id).toBe('s');
  });

  it('damps a finding about a house that is itself weak', () => {
    const r = rule({ id: 'a' });
    const normal = arbitrate([r], facts()).findings[0]!;
    const damped = arbitrate([r], facts(), { bhavaBala: { 5: -20 } }).findings[0]!;
    expect(damped.score).toBeLessThan(normal.score);
    expect(damped.status).toBe('damped');
    expect(damped.trace.some((t) => t.why.includes('cannot deliver'))).toBe(true);
  });

  it('raises confidence when independent frames concur, and lowers it when they split', () => {
    const r = rule({ id: 'a' });
    const all = arbitrate([r], facts(), { agreement: { agreeing: 3, frames: 3 } }).findings[0]!;
    const split = arbitrate([r], facts(), { agreement: { agreeing: 1, frames: 3 } }).findings[0]!;
    expect(all.confidence).toBeGreaterThan(split.confidence);
  });

  it('credits a rule verified against a worked example', () => {
    const plain = arbitrate([rule({ id: 'a' })], facts()).findings[0]!;
    const proven = arbitrate([rule({ id: 'b', verification: 'example' })], facts()).findings[0]!;
    expect(proven.confidence).toBeGreaterThan(plain.confidence);
  });

  it('never reports certainty, whatever the evidence', () => {
    const best = rule({
      id: 'best', weight: 1, verification: 'example', baseRate: 0.001,
      when: [
        { k: 'placement', graha: 'jupiter', house: 5 },
        { k: 'placement', graha: 'saturn', house: 7 },
        { k: 'placement', graha: 'mars', house: 3 },
        { k: 'placement', graha: 'moon', house: 2 },
      ],
    });
    const f = arbitrate([best], facts(), {
      shadbala: { jupiter: 500 }, ishta: { jupiter: 60 },
      agreement: { agreeing: 3, frames: 3 },
    }).findings[0]!;
    expect(f.confidence).toBeLessThanOrEqual(CONFIDENCE_CEILING);
    expect(CONFIDENCE_CEILING).toBeLessThan(1);
    expect(CONFIDENCE_NEVER_CERTAIN).toContain('misrepresenting');
  });

  it('keeps every stage that moved a finding in its trace', () => {
    const f = arbitrate([rule({ id: 'a' })], facts(), {
      shadbala: { jupiter: 500 }, ishta: { jupiter: 55 }, sav: new Array(12).fill(35),
    }).findings[0]!;
    const stages = f.trace.map((t) => t.stage);
    expect(stages).toContain('arity');
    expect(stages).toContain('strength');
    expect(stages).toContain('tendency');
    expect(stages).toContain('ashtakavarga');
  });
});

// ── Calibration ──────────────────────────────────────────────────────────────
describe('BPHS Part 19 — base-rate calibration', () => {
  it('is deterministic for a given seed', () => {
    const a = syntheticCharts(50, 7);
    const b = syntheticCharts(50, 7);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('produces different populations for different seeds', () => {
    expect(JSON.stringify(syntheticCharts(50, 1)))
      .not.toBe(JSON.stringify(syntheticCharts(50, 2)));
  });

  it('keeps the nodes opposed, since that one is free', () => {
    for (const c of syntheticCharts(200, 3)) {
      const p = c.planets as unknown as Record<string, { sign: number }>;
      expect((p.rahu!.sign + 6) % 12).toBe(p.ketu!.sign);
    }
  });

  it('places every planet in a real sign and a real house', () => {
    for (const c of syntheticCharts(100, 5)) {
      const p = c.planets as unknown as Record<string, { sign: number; house: number }>;
      for (const [g, v] of Object.entries(p)) {
        expect(v.sign, g).toBeGreaterThanOrEqual(0);
        expect(v.sign, g).toBeLessThan(12);
        expect(v.house, g).toBeGreaterThanOrEqual(1);
        expect(v.house, g).toBeLessThanOrEqual(12);
      }
    }
  });

  it('measures a single-condition placement rule near 1 in 12', () => {
    const r = rule({ id: 'a', when: [{ k: 'placement', graha: 'jupiter', house: 5 }] });
    const res = calibrate([r], syntheticCharts(4000, 11));
    expect(res.baseRates.a).toBeGreaterThan(0.05);
    expect(res.baseRates.a).toBeLessThan(0.12);
  });

  it('measures a three-condition rule far lower than a one-condition rule', () => {
    const one = rule({ id: 'one' });
    const three = rule({
      id: 'three',
      when: [
        { k: 'placement', graha: 'jupiter', house: 5 },
        { k: 'placement', graha: 'saturn', house: 7 },
        { k: 'placement', graha: 'mars', house: 3 },
      ],
    });
    const res = calibrate([one, three], syntheticCharts(4000, 13));
    expect(res.baseRates.three!).toBeLessThan(res.baseRates.one!);
  });

  it('sorts rules into the two danger bands', () => {
    const everyone = rule({ id: 'everyone', when: [{ k: 'bindus', sign: 0, op: '>', n: 0 }] });
    const res = calibrate([everyone], syntheticCharts(500, 17));
    expect(res.baseRates.everyone).toBeGreaterThan(BASE_RATE_SUPPRESS);
    expect(res.nonDiscriminative).toContain('everyone');
  });

  it('reports a rule that never fires rather than calling it rare', () => {
    const never = rule({ id: 'never', when: [{ k: 'bindus', sign: 0, op: '>', n: 999 }] });
    const res = calibrate([never], syntheticCharts(200, 19));
    expect(res.neverFired).toContain('never');
    expect(res.suspect).not.toContain('never');
  });

  it('feeds measured rates straight back into arbitration', () => {
    const r = rule({ id: 'a', when: [{ k: 'bindus', sign: 0, op: '>', n: 0 }] });
    const measured = calibrate([r], syntheticCharts(300, 23));
    const withRates = withBaseRates([r], measured.baseRates);
    expect(withRates[0]!.baseRate).toBe(measured.baseRates.a);
    const res = arbitrate(withRates, facts());
    expect(res.findings).toHaveLength(0);       // suppressed as background
  });

  it('leaves a rule untouched when nothing was measured for it', () => {
    const r = rule({ id: 'a' });
    expect(withBaseRates([r], {})[0]).toBe(r);
  });

  it('states the limitation of a uniform population instead of hiding it', () => {
    expect(SYNTHETIC_CHARTS_ARE_UNIFORM).toContain('NOT probabilities');
    expect(ARBITRATION_OPEN.realCharts).toContain('ephemeris-generated');
  });

  it('the generator is uniform enough for the job', () => {
    const rnd = mulberry32(42);
    const buckets = new Array(12).fill(0) as number[];
    for (let i = 0; i < 12000; i++) buckets[Math.floor(rnd() * 12)]! += 1;
    for (const b of buckets) {
      expect(b).toBeGreaterThan(800);
      expect(b).toBeLessThan(1200);
    }
  });
});

describe('BPHS Part 19 — what it did not settle', () => {
  it('leaves Part 17’s invented thresholds alone, and says why', () => {
    expect(ARBITRATION_OPEN.thresholds).toContain('not the text’s');
    expect(ARBITRATION_OPEN.thresholds).toContain('uniform one');
  });

  it('records the dasha thread as CLOSED by Part 38, and what remains of it', () => {
    // This assertion used to read `toContain('Phase IV')` — arbitration explicitly did not
    // consult a dasha, because nothing did. Chapter 48 changed that: its rules fire on a
    // running period. The open thread is closed, so the test asserts the closure rather than
    // preserving a note that is no longer true.
    expect(ARBITRATION_OPEN.dasha).toContain('Part 38');
    expect(ARBITRATION_OPEN.dasha).not.toContain('Nothing here consults a dasha');
    // What is genuinely still open: a base rate over a snapshot is not a rate over a life.
    expect(ARBITRATION_OPEN.dasha).toContain('snapshot');
  });
});
