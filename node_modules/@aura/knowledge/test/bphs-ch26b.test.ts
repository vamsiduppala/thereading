// BPHS Programme Part 8 — Chapter 26b: verifying Part 7 against the chapter's own
// precomputed speculum, and recording what that verification found.

import { describe, it, expect } from 'vitest';
import {
  ASPECT_RULES_RESTATED, RULE_SIX_TYPO_NOTE, ASPECT_ACTIVE_ARC,
  HOUSE_ASPECT_USES_CUSP, HOUSE_ASPECT_CUSP_NOTE,
  ADDITIVE_SHORTCUT, ADDITIVE_SHORTCUT_REJECTED,
  SPECULUM_VERIFICATION, SPECULUM_OCR_FAULTS, SPECULUM_SAMPLE,
  drishtiValueGeneral, drishtiValueSaturn, drishtiValueMars, drishtiValueJupiter,
  VIRUPAS_PER_RUPA,
} from '../src/index.js';

// ── The speculum check — the point of this part ──────────────────────────────
describe('BPHS 26 speculum — the chapter\'s own answer key', () => {
  it('reproduces every sampled entry exactly', () => {
    for (const [angle, virupas] of SPECULUM_SAMPLE) {
      expect(drishtiValueGeneral(angle), `angle ${angle}`).toBeCloseTo(virupas, 6);
    }
  });

  it('covers every branch of the curve and both of its edges', () => {
    const angles = SPECULUM_SAMPLE.map(([a]) => a);
    for (const edge of [30, 60, 90, 120, 150, 180]) {
      expect(angles, `boundary ${edge} untested`).toContain(edge);
    }
  });

  it('records 361 of 373 entries matching', () => {
    expect(SPECULUM_VERIFICATION.entries).toBe(373);
    expect(SPECULUM_VERIFICATION.exactMatches).toBe(361);
    expect(SPECULUM_VERIFICATION.exactMatches + SPECULUM_VERIFICATION.mismatches)
      .toBe(SPECULUM_VERIFICATION.entries);
  });

  it('shows every one of the twelve mismatches to be an OCR fault, not a rule dispute', () => {
    expect(SPECULUM_OCR_FAULTS).toHaveLength(SPECULUM_VERIFICATION.mismatches);
    for (const [angle, printed, computed] of SPECULUM_OCR_FAULTS) {
      // The formula must give the COMPUTED value — that is the claim being made.
      expect(drishtiValueGeneral(angle), `angle ${angle}`).toBeCloseTo(computed, 6);
      expect(printed).not.toBeCloseTo(computed, 2);
    }
  });

  it('finds EVERY fault to be a single-digit misread, once normalised', () => {
    const singleDigit = SPECULUM_OCR_FAULTS.filter(([, printed, computed]) => {
      const a = printed.toFixed(2), b = computed.toFixed(2);
      return a.length === b.length && [...a].filter((c, i) => c !== b[i]).length === 1;
    });
    expect(singleDigit.length).toBe(SPECULUM_VERIFICATION.singleDigitDifferences);
  });

  it('puts the OCR error rate around 3%', () => {
    expect(SPECULUM_VERIFICATION.ocrErrorRate).toBeGreaterThan(0.02);
    expect(SPECULUM_VERIFICATION.ocrErrorRate).toBeLessThan(0.04);
  });
});

// ── 9340-9350 the six restated rules ─────────────────────────────────────────
describe('BPHS 26 — the six rules restated in prose', () => {
  it('lists six rules partitioning 30 to 300 degrees without gap or overlap', () => {
    expect(ASPECT_RULES_RESTATED).toHaveLength(6);
    const bounds = ASPECT_RULES_RESTATED.map((r) => r.range.split('-').map(Number));
    for (let i = 1; i < bounds.length; i++) {
      expect(bounds[i]![0], `gap before rule ${i + 1}`).toBe(bounds[i - 1]![1]);
    }
    expect(bounds[0]![0]).toBe(ASPECT_ACTIVE_ARC.from);
    expect(bounds[5]![1]).toBe(ASPECT_ACTIVE_ARC.to);
  });

  it('records the printed "160" in rule 6 as a typo for 180', () => {
    expect(ASPECT_RULES_RESTATED[5]!.range).toBe('180-300');
    expect(RULE_SIX_TYPO_NOTE).toContain('must be 180');
  });

  it('gives no aspect outside 30 to 300 degrees', () => {
    for (const a of [0, 15, 29.9, 300.1, 330, 359]) {
      expect(drishtiValueGeneral(a), `angle ${a}`).toBe(0);
    }
  });
});

// ── The additive shortcut, rejected with evidence ────────────────────────────
describe('BPHS 26 — the additive shortcut is not adopted', () => {
  const general = drishtiValueGeneral;

  it('would exceed one rupa for Saturn, which is impossible', () => {
    // A full aspect is exactly one rupa (26.11). Saturn's shortcut range is 60-90.
    const worst = Math.max(...Array.from({ length: 61 }, (_, i) =>
      general(60 + i * 0.5) + ADDITIVE_SHORTCUT.saturn.add));
    expect(worst).toBeGreaterThan(VIRUPAS_PER_RUPA);
    expect(ADDITIVE_SHORTCUT_REJECTED).toContain('90 virupas');
  });

  it('agrees with the root verses at the start of each range, where the aspect peaks', () => {
    expect(general(90) + ADDITIVE_SHORTCUT.mars.add).toBe(drishtiValueMars(90));
    expect(general(120) + ADDITIVE_SHORTCUT.jupiter.add).toBe(drishtiValueJupiter(120));
    expect(general(60) + ADDITIVE_SHORTCUT.saturn.add).toBe(drishtiValueSaturn(60));
  });

  it('drifts away from them further into the range', () => {
    // Mars at 120: root gives 30, shortcut gives 45.
    expect(drishtiValueMars(119.99)).toBeCloseTo(30, 1);
    expect(general(120) + ADDITIVE_SHORTCUT.mars.add).toBe(45);
  });

  it('keeps the root-verse curves within one rupa everywhere, unlike the shortcut', () => {
    for (const f of [drishtiValueGeneral, drishtiValueSaturn, drishtiValueMars, drishtiValueJupiter]) {
      for (let a = 0; a < 360; a += 0.5) expect(f(a)).toBeLessThanOrEqual(VIRUPAS_PER_RUPA);
    }
  });
});

// ── The house-cusp rule ──────────────────────────────────────────────────────
describe('BPHS 26 — aspects onto a house are measured to its cusp', () => {
  it('records the rule and the gap it depends on', () => {
    expect(HOUSE_ASPECT_USES_CUSP).toBe(true);
    expect(HOUSE_ASPECT_CUSP_NOTE).toContain('no bhava madhya yet');
    expect(HOUSE_ASPECT_CUSP_NOTE).toContain('Part 11');
  });
});
