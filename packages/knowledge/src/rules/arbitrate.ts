// ─────────────────────────────────────────────────────────────────────────────
// The arbitration ordering. BPHS Programme Part 19.
//
// Eighteen parts produced instruments that each answer a *different* question about the
// same chart, and they disagree constantly. This is the module that decides what a reading
// actually says — which is the difference between an engine and a horoscope generator.
//
// **The ordering is mostly not ours.** Four times the corpus stated its own precedence
// instead of leaving it to be invented, and every one of those is cited below rather than
// re-derived. Where we did have to choose — the weights, the confidence curve — it says so
// in the code, not in a comment nobody reads.
//
//   27.37-38  the STRONGEST planet bearing on a bhava is the one that delivers its promise
//   28.15-20  a bhava's outcome is a signed ledger: strength, lord, occupants, aspects,
//             dignity, ashtakavarga, every term added to one column and taken off the other
//   72.30-31  the ashtakavarga OUTRANKS transit — transit is consulted only where the
//             ashtakavarga does not already favour the sign
//   74.11-13  a contested house is settled by MAJORITY, and an equal split is genuinely
//             mixed rather than quietly resolved; 74.14 falls back to the lord
//
// What we add on top is the part BPHS could not have: base rates. A rule that fires for a
// third of humanity is not a finding about a person, however emphatic the verse.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChartFacts } from './predicate.js';
import { VIMSHOTTARI_ORDER } from '../data/vimshottari.js';
import type { Rule } from './rule.js';
import { fired, arity, BASE_RATE_SUPPRESS, BASE_RATE_SUSPECT, type RuleHit } from './rule.js';

// ── The stages, in order ─────────────────────────────────────────────────────

export interface ArbitrationStage {
  id: string;
  what: string;
  /** The verse this stage comes from, or 'ours' where we had to choose. */
  source: string;
}

/**
 * The ordering. Read top to bottom: an earlier stage can remove a finding entirely, a
 * later one can only re-rank what survived.
 *
 * The separation matters. Cancellation and the base-rate floor are *gates* — they decide
 * whether something is a finding at all. Everything after is *ordering* — it decides which
 * findings lead. Collapsing the two is how systems end up ranking a suppressed rule first.
 */
export const ARBITRATION_ORDER: ArbitrationStage[] = [
  {
    id: 'cancellation',
    what: 'A rule whose `unless` clause holds is dropped outright, not down-weighted.',
    source: 'BPHS ch 10 is an entire chapter of antidotes; modelled structurally in Part 1.',
  },
  {
    id: 'base-rate',
    what: 'A rule firing for more than 35% of charts is background, not a finding. One '
      + 'firing for under 0.1% is flagged as a probable transcription bug.',
    source: 'ours — BPHS has no notion of a base rate. Programme §5.',
  },
  {
    id: 'bhava-gate',
    what: 'A finding about a house whose own strength is in the adverse band is damped: the '
      + 'house cannot deliver what it does not have.',
    source: 'BPHS 72.6 (house bands) with 28.15-20 (the bhava ledger).',
  },
  {
    id: 'strength',
    what: 'Between findings competing over one matter, the one carried by the stronger '
      + 'planet leads.',
    source: 'BPHS 27.37-38 — the strongest planet delivers the bhava’s promise.',
  },
  {
    id: 'tendency',
    what: 'Strength says how forcefully, Ishta/Kashta says in which direction. A strong '
      + 'planet with high Kashta argues AGAINST its own effect.',
    source: 'BPHS 28.6 and 28.11-12.',
  },
  {
    id: 'ashtakavarga',
    what: 'Bindu support raises a finding; a poorly-marked sign lowers it. Where the '
      + 'ashtakavarga already favours a matter, transit is not consulted at all.',
    source: 'BPHS 72.30-31 — the ashtakavarga is paramount.',
  },
  {
    id: 'majority',
    what: 'Findings sharing an effect are resolved by weight of evidence; a true tie is '
      + 'reported as mixed rather than broken arbitrarily.',
    source: 'BPHS 74.11-13.',
  },
  {
    id: 'arity',
    what: 'Among survivors, the more specific rule leads — conditions are counted, never '
      + 'authored.',
    source: 'Programme Part 1.',
  },
  {
    id: 'agreement',
    what: 'Corroboration across independent frames raises confidence; disagreement lowers it.',
    source: 'BPHS 74 (Sudarshana, three frames) and 5.9 (the four ascendants).',
  },
];

// ── Signals the ordering consumes ────────────────────────────────────────────

export interface ArbitrationSignals {
  /** Bhava strength per house, on any consistent scale. Higher is better. */
  bhavaBala?: Partial<Record<number, number>>;
  /** Shadbala Pinda per planet, in virupas. */
  shadbala?: Partial<Record<string, number>>;
  /** Ishta Phala per planet, 0-60. Kashta is the remainder. */
  ishta?: Partial<Record<string, number>>;
  /** Sarvashtakavarga per sign. */
  sav?: number[];
  /** How many independent frames agree, and out of how many (Sudarshana, or the lagnas). */
  agreement?: { agreeing: number; frames: number };
}

export type FindingStatus = 'surfaced' | 'background' | 'suspect' | 'cancelled' | 'damped';

export interface ArbitratedFinding {
  hit: RuleHit;
  /** Final ordering score. Higher leads. Comparable only within one arbitration run. */
  score: number;
  /** 0..1. Deliberately never reaches 1 — see `CONFIDENCE_NEVER_CERTAIN`. */
  confidence: number;
  status: FindingStatus;
  /** Every stage that moved this finding, and by how much. Auditable by construction. */
  trace: { stage: string; delta: number; why: string }[];
  /** Findings that fired for the same effect with the opposite sign. */
  dissent: RuleHit[];
}

export interface ArbitrationResult {
  findings: ArbitratedFinding[];
  /** Fired but not surfaced, with the reason. Kept, because "why not" is a real question. */
  withheld: ArbitratedFinding[];
  /** Effects where the evidence genuinely tied. Reported, never silently broken. */
  mixed: string[];
  order: ArbitrationStage[];
}

// ── The weights we chose ─────────────────────────────────────────────────────

/**
 * Every number here is OURS. BPHS orders its instruments but never weights them, so these
 * are a starting point to be calibrated, not a finding.
 *
 * They are kept in one exported object rather than scattered through the code precisely so
 * that a calibration run can replace them wholesale and the diff is one line.
 */
export const ARBITRATION_WEIGHTS = {
  /** Per condition beyond the first. Specificity is the strongest honest signal we have. */
  arity: 1.0,
  /** The text's own emphasis, 0..1, scaled. */
  weight: 0.8,
  /** Applied when the bearing planet clears its Shadbala requirement. */
  strong: 0.6,
  /** Applied when Ishta exceeds Kashta for the bearing planet. */
  ishta: 0.5,
  /** Per bindu above the SAV mean, and per bindu below. */
  bindu: 0.08,
  /** Multiplier floor when the house itself is weak. */
  weakHouseDamping: 0.5,
} as const;

export const WEIGHTS_ARE_OURS =
  'BPHS orders its instruments (27.37-38, 72.30-31, 74.11-13) but never weights them. '
  + 'Every number in ARBITRATION_WEIGHTS is ours and provisional. Calibrate, do not cite.';

/**
 * Confidence is capped below 1 on purpose.
 *
 * Every rule in the corpus is `verification: 'unverified'` unless a worked example backed
 * it, the base rates are estimates, and the weights above are guesses. A system that can
 * report certainty about a person's life from this evidence is lying about its own inputs.
 */
export const CONFIDENCE_CEILING = 0.92;

export const CONFIDENCE_NEVER_CERTAIN =
  'Confidence is capped at 0.92. The inputs are unverified rules, estimated base rates and '
  + 'provisional weights; a reading that claims certainty from those is misrepresenting '
  + 'its own evidence.';

// ── Arbitration ──────────────────────────────────────────────────────────────

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** The mean SAV per sign — 337 over twelve. Used as the bindu baseline. */
export const SAV_BASELINE = 337 / 12;

/**
 * Run the ordering over the rules that fired on a chart.
 *
 * Returns findings ranked, findings withheld with their reason, and the effects where the
 * evidence genuinely tied. Nothing is discarded silently: a caller can always ask why a
 * rule that fired did not appear.
 */
export function arbitrate(
  rules: Rule[], facts: ChartFacts, signals: ArbitrationSignals = {},
): ArbitrationResult {
  const hits = fired(rules, facts);

  // Group by effect so competing claims can see each other (74.11-13).
  const byEffect = new Map<string, RuleHit[]>();
  for (const h of hits) {
    const key = h.rule.effect.id;
    byEffect.set(key, [...(byEffect.get(key) ?? []), h]);
  }

  const scored: ArbitratedFinding[] = hits.map((hit) => {
    const trace: ArbitratedFinding['trace'] = [];
    let score = 0;
    let status: FindingStatus = 'surfaced';

    // ── base-rate gate (ours) ───────────────────────────────────────────────
    const br = hit.rule.baseRate;
    if (br != null && br > BASE_RATE_SUPPRESS) {
      status = 'background';
      trace.push({
        stage: 'base-rate', delta: 0,
        why: `fires for ${(br * 100).toFixed(1)}% of charts — describes humanity, not a person`,
      });
    } else if (br != null && br < BASE_RATE_SUSPECT && br > 0) {
      status = 'suspect';
      trace.push({
        stage: 'base-rate', delta: 0,
        why: `fires for ${(br * 100).toFixed(3)}% — more likely a transcription bug than a rare chart`,
      });
    }

    // ── arity (Part 1) ──────────────────────────────────────────────────────
    const a = arity(hit.rule);
    const arityDelta = (a - 1) * ARBITRATION_WEIGHTS.arity;
    score += arityDelta;
    trace.push({ stage: 'arity', delta: arityDelta, why: `${a} condition(s)` });

    // ── the text's own emphasis ─────────────────────────────────────────────
    const wDelta = hit.rule.weight * ARBITRATION_WEIGHTS.weight;
    score += wDelta;
    trace.push({ stage: 'weight', delta: wDelta, why: `source emphasis ${hit.rule.weight}` });

    // ── strength: 27.37-38 ──────────────────────────────────────────────────
    const bearer = bearingPlanet(hit.rule);
    if (bearer && signals.shadbala?.[bearer] != null) {
      const req = SHADBALA_REQUIRED_LOCAL[bearer];
      if (req != null) {
        const strong = signals.shadbala[bearer]! >= req;
        const d = strong ? ARBITRATION_WEIGHTS.strong : -ARBITRATION_WEIGHTS.strong;
        score += d;
        trace.push({
          stage: 'strength', delta: d,
          why: `${bearer} at ${signals.shadbala[bearer]} virupas against a requirement of ${req} (27.37-38)`,
        });
      }
    }

    // ── tendency: 28.6, 28.11-12 ────────────────────────────────────────────
    if (bearer && signals.ishta?.[bearer] != null) {
      const ishta = signals.ishta[bearer]!;
      const helping = ishta > 30;
      // A planet whose Kashta dominates argues against its own effect, whichever way the
      // effect points — so the adjustment follows the effect's sign.
      const aligned = helping === (hit.rule.effect.valence >= 0);
      const d = aligned ? ARBITRATION_WEIGHTS.ishta : -ARBITRATION_WEIGHTS.ishta;
      score += d;
      trace.push({
        stage: 'tendency', delta: d,
        why: `${bearer} Ishta ${ishta.toFixed(1)} of 60 — ${aligned ? 'supports' : 'opposes'} this effect (28.11-12)`,
      });
    }

    // ── ashtakavarga: 72.30-31 ──────────────────────────────────────────────
    if (bearer && signals.sav && facts.planets[bearer as never]) {
      const sign = (facts.planets as Record<string, { sign: number }>)[bearer]?.sign;
      if (sign != null && signals.sav[sign] != null) {
        const d = (signals.sav[sign]! - SAV_BASELINE) * ARBITRATION_WEIGHTS.bindu;
        score += d;
        trace.push({
          stage: 'ashtakavarga', delta: d,
          why: `${signals.sav[sign]} bindus against a mean of ${SAV_BASELINE.toFixed(1)} (72.30-31)`,
        });
      }
    }

    // ── bhava gate: 72.6 with 28.15-20 ──────────────────────────────────────
    const house = hit.rule.when.find((p) => 'house' in p && p.house != null) as { house?: number } | undefined;
    if (house?.house != null && signals.bhavaBala?.[house.house] != null) {
      const bala = signals.bhavaBala[house.house]!;
      if (bala < 0) {
        score *= ARBITRATION_WEIGHTS.weakHouseDamping;
        if (status === 'surfaced') status = 'damped';
        trace.push({
          stage: 'bhava-gate', delta: 0,
          why: `house ${house.house} is itself weak (${bala}); it cannot deliver what it does not have`,
        });
      }
    }

    // ── dissent: 74.11-13 ───────────────────────────────────────────────────
    const siblings = byEffect.get(hit.rule.effect.id) ?? [];
    const dissent = siblings.filter(
      (s) => s !== hit && Math.sign(s.rule.effect.valence) !== Math.sign(hit.rule.effect.valence),
    );

    // ── agreement: 74, 5.9 ──────────────────────────────────────────────────
    let confidence = clamp01(
      0.25
      + Math.min(0.35, (a - 1) * 0.12)
      + hit.rule.weight * 0.2
      + (hit.rule.verification === 'example' ? 0.15 : 0),
    );
    if (signals.agreement && signals.agreement.frames > 0) {
      const frac = signals.agreement.agreeing / signals.agreement.frames;
      const d = (frac - 0.5) * 0.3;
      confidence = clamp01(confidence + d);
      trace.push({
        stage: 'agreement', delta: d,
        why: `${signals.agreement.agreeing} of ${signals.agreement.frames} frames concur`,
      });
    }
    if (dissent.length > 0) {
      confidence = clamp01(confidence - 0.15 * dissent.length);
      trace.push({
        stage: 'majority', delta: -0.15 * dissent.length,
        why: `${dissent.length} finding(s) argue the other way (74.11-13)`,
      });
    }
    if (br != null) confidence = clamp01(confidence * (1 - br));
    confidence = Math.min(confidence, CONFIDENCE_CEILING);

    return { hit, score, confidence, status, trace, dissent };
  });

  // Effects where the evidence tied — reported, never broken arbitrarily (74.11-13).
  const mixed: string[] = [];
  for (const [effectId, group] of byEffect) {
    if (group.length < 2) continue;
    const pos = group.filter((g) => g.rule.effect.valence > 0).length;
    const neg = group.filter((g) => g.rule.effect.valence < 0).length;
    if (pos > 0 && pos === neg) mixed.push(effectId);
  }

  const sortFn = (x: ArbitratedFinding, y: ArbitratedFinding): number =>
    y.score - x.score
    || y.confidence - x.confidence
    || x.hit.rule.id.localeCompare(y.hit.rule.id);

  return {
    findings: scored.filter((f) => f.status === 'surfaced' || f.status === 'damped').sort(sortFn),
    withheld: scored.filter((f) => f.status === 'background' || f.status === 'suspect').sort(sortFn),
    mixed,
    order: ARBITRATION_ORDER,
  };
}

/**
 * Which planet a rule's claim rests on, if any — the one whose strength and tendency the
 * ordering should consult.
 *
 * Deliberately simple: the first planet named in the conditions. A rule resting on several
 * would need the text to say which one governs, and it does not.
 */
export function bearingPlanet(rule: Rule): string | null {
  for (const p of rule.when) {
    if ('graha' in p && typeof p.graha === 'string') return p.graha;
    if ('of' in p && typeof p.of === 'string' && p.of !== 'asc') return p.of;
  }
  return null;
}

/** Local copy of the ch 27 thresholds so this module does not import a data file. */
const SHADBALA_REQUIRED_LOCAL: Record<string, number> = {
  sun: 390, moon: 360, mars: 300, mercury: 420, jupiter: 390, venus: 330, saturn: 300,
};

// ── Base-rate calibration ────────────────────────────────────────────────────

/**
 * A deterministic generator, so a calibration run is reproducible and a base rate that
 * moves means the RULES changed, not the dice.
 *
 * Mulberry32 — small, fast, adequate for placement sampling. Not cryptographic and not
 * pretending to be.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SAMPLE_PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;

/**
 * The chance one reference point contributes a bindu to one sign.
 *
 * Not invented: the seven per-planet totals are 48, 49, 39, 54, 56, 52 and 39 out of a
 * possible 96, summing to 337 of 672 — which is 0.501. Rounded to 0.51 because the
 * ascendant's own table (49 of 96) pulls it very slightly up.
 */
export const BAV_CONTRIBUTION_P = 0.51;

/**
 * Dignity states at roughly their natural frequency, as a sampling bag.
 *
 * Of twelve signs a planet owns one or two, is exalted in one and debilitated in one, and
 * the rest split between friend, neutral and enemy. Twenty-four slots weighted accordingly
 * — crude, but far closer than a uniform draw over seven states, which would make
 * exaltation eight times too common.
 */
/**
 * The Shadbala range the synthetic population draws from, in virupas.
 *
 * BPHS 27.32-36 requires 300 (Mars, Saturn) to 420 (Mercury), so a range of 220-580 puts
 * the thresholds inside the distribution rather than at an edge. Not an empirical
 * distribution — the point is only that `strength` predicates can discriminate.
 */
export const SHADBALA_SAMPLE_MIN = 220;
export const SHADBALA_SAMPLE_SPREAD = 360;

export const DIGNITY_SAMPLE: string[] = [
  'exalted',
  'moolatrikona',
  'own', 'own',
  'friend', 'friend', 'friend', 'friend', 'friend',
  'neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral',
  'enemy', 'enemy', 'enemy', 'enemy', 'enemy',
  'debilitated',
];

/**
 * Synthetic charts for calibration.
 *
 * **These are uniform random placements, and that is a known limitation stated rather than
 * hidden.** Real charts are not uniform: Mercury and Venus stay near the Sun, the nodes are
 * always opposed, and the lagna correlates with the Sun by time of day. A base rate
 * measured here is therefore an approximation — good enough to separate "fires for a third
 * of everyone" from "fires for one in a thousand", which is what the gate needs, and not
 * good enough to quote as a probability.
 *
 * Ketu is placed opposite Rahu because that one is free and getting it wrong would corrupt
 * every node rule.
 */
export function syntheticCharts(n: number, seed = 1): ChartFacts[] {
  const rnd = mulberry32(seed);
  const out: ChartFacts[] = [];
  for (let i = 0; i < n; i++) {
    const lagnaSign = Math.floor(rnd() * 12);
    const planets: Record<string, { sign: number; house: number; longitude: number; dignity: string }> = {};
    let rahuSign = 0;
    for (const g of SAMPLE_PLANETS) {
      let sign: number;
      if (g === 'ketu') sign = (rahuSign + 6) % 12;
      else {
        sign = Math.floor(rnd() * 12);
        if (g === 'rahu') rahuSign = sign;
      }
      planets[g] = {
        sign,
        house: ((sign - lagnaSign + 12) % 12) + 1,
        longitude: sign * 30 + rnd() * 30,
        // Dignity, drawn at roughly its real frequency. Without it every `dignity`
        // predicate evaluates false and the rule reports as dead — the same blindness the
        // missing `lagnas` and `bav` caused. A planet owns 1-2 of 12 signs, is exalted in
        // one and debilitated in one, so the tails are deliberately thin.
        dignity: DIGNITY_SAMPLE[Math.floor(rnd() * DIGNITY_SAMPLE.length)]!,
      };
    }
    // Every reference frame a rule may read FROM. Without these, every rule carrying
    // `from: 'arudha'` silently evaluates false and the calibration reports it as dead —
    // which is how a good rule gets deleted. See `GENERATOR_MUST_FEED_EVERY_FRAME`.
    const lagnas: Record<string, number> = {
      natal: lagnaSign,
      bhava: Math.floor(rnd() * 12),
      hora: Math.floor(rnd() * 12),
      ghatika: Math.floor(rnd() * 12),
      arudha: Math.floor(rnd() * 12),
      upapada: Math.floor(rnd() * 12),
      // Part 29. The karakamsa is a NAVAMSA sign and this generator builds rasi charts, so
      // this is a synthetic frame, not a real D-9 position — and that is sound for base
      // rates: "a planet in the Nth from a reference sign" is 1/12 whenever the signs are
      // uniform, whichever chart they came from. The generator's job here is to supply the
      // frame so ch 33's rules can fire at all. See `CH33_CALIBRATION_NOTE`.
      karakamsa: Math.floor(rnd() * 12),
    };
    // Part 32. The chara karakas, DERIVED from the longitudes above rather than drawn at
    // random — the offices are a ranking of those same longitudes, so generating them
    // independently would produce charts that contradict themselves. Sixth fact the
    // generator was missing, after lagnas, bav, dignity, shadbala and the upagrahas; BPHS
    // 40.4 is the first rule to read one.
    const karakas: Record<string, string> = {};
    {
      const ranked = (['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'] as const)
        .map((g) => {
          const dis = planets[g]!.longitude % 30;
          return { g, d: g === 'rahu' ? 30 - dis : dis };
        })
        .sort((a, b) => b.d - a.d);
      const CODES = ['AK', 'AmK', 'BK', 'MK', 'PiK', 'PK', 'GK', 'DK'];
      ranked.forEach((r, idx) => { karakas[CODES[idx]!] = r.g; });
    }

    // Per-planet ashtakavarga rows, plus the ascendant's. Rules that name `of:` read these.
    //
    // BINOMIAL, not uniform. A BAV cell is literally a count of how many of eight
    // reference points contribute a bindu there, so its distribution is Binomial(8, p) —
    // sharply peaked near four, not flat across 0-8. Drawing it uniformly overstates the
    // extremes badly: it puts ~44% of signs at 5 or more where the real shape gives ~36%,
    // and any threshold calibrated against the flat version is calibrated against a
    // fiction. The per-planet totals (48/49/39/54/56/52/39 out of 96) put p near 0.51.
    const bav: Record<string, number[]> = {};
    for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'asc']) {
      bav[g] = Array.from({ length: 12 }, () => {
        let k = 0;
        for (let r = 0; r < 8; r++) if (rnd() < BAV_CONTRIBUTION_P) k += 1;
        return k;
      });
    }

    // The SAV is the sum of the seven planetary rows, not an independent draw — deriving
    // it keeps the two consistent, which a rule reading both would otherwise catch us on.
    const sav = Array.from({ length: 12 }, (_, sign) =>
      ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']
        .reduce((t, g) => t + bav[g]![sign]!, 0));

    // The six upagrahas — Programme Part 28. Fifth fact the generator was missing, after
    // lagnas, bav, dignity and shadbala. Without them chapter 25's 46 rules measure zero
    // and read as dead when they are merely unwired.
    const upagrahas: Record<string, { sign: number; house: number }> = {};
    for (const u of ['dhuma', 'vyatipata', 'paridhi', 'chapa', 'dhwaja', 'gulika']) {
      const sign = Math.floor(rnd() * 12);
      upagrahas[u] = { sign, house: ((sign - lagnaSign + 12) % 12) + 1 };
    }

    // Shadbala Pinda per planet, in virupas — Programme Part 23.
    //
    // Added because the `strength` predicate was UNTESTABLE without it: Part 22 had to drop
    // a condition from BPHS 18.18 precisely because no chart in this population carried a
    // Shadbala, so adding the condition would have made the rule unmeasurable rather than
    // more precise. Fourth fact the generator was missing, after lagnas, bav and dignity.
    //
    // The range spans the ch 27 requirements (300-420) so roughly half of planets clear
    // their threshold — enough spread for a `strength` rule to be discriminative rather
    // than always-true or always-false.
    const shadbala: Record<string, number> = {};
    for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']) {
      shadbala[g] = Math.round(SHADBALA_SAMPLE_MIN + rnd() * SHADBALA_SAMPLE_SPREAD);
    }

    // The running dasha — Programme Part 38. SEVENTH fact the generator was missing, after
    // lagnas, bav, dignity, shadbala, the upagrahas and the karakas, and found the same way
    // as all six: chapter 48's 77 rules calibrated at exactly 0.000% because no synthetic
    // chart carried a `dasha`, and a rule that cannot fire reads as dead.
    //
    // DERIVED from the Moon, not drawn at random. The Vimshottari maha lord IS the lord of
    // the Moon's nakshatra, so generating one independently would produce charts that
    // contradict themselves — exactly the reason the karakas are derived from the same
    // longitudes they rank. The antar and below then walk the standard sequence from the
    // maha lord, which is where a chart sampled at a random age would sit.
    const moonNak = Math.floor((planets['moon']!.longitude / (360 / 27)) % 27);
    const mahaIdx = moonNak % 9;
    const dasha: Record<string, string> = {};
    let idx = mahaIdx;
    for (const level of ['maha', 'antar', 'pratyantar', 'sookshma', 'prana']) {
      dasha[level] = VIMSHOTTARI_ORDER[idx % 9]!;
      idx += Math.floor(rnd() * 9);        // where in the sub-sequence this moment falls
    }

    out.push({ lagnaSign, planets, sav, lagnas, bav, shadbala, upagrahas, karakas, dasha } as unknown as ChartFacts);
  }
  return out;
}

/**
 * The lesson the first calibration run taught, immediately and expensively.
 *
 * Nine of the thirteen encoded rules reported a base rate of exactly zero — not because
 * they were wrong, but because the generator fed no `lagnas` and no `bav`, so every rule
 * reading from a pada or from a named planet's ashtakavarga evaluated false on every
 * chart. A calibration harness that cannot evaluate a rule must not report it as dead.
 *
 * **Any predicate kind a rule can use, the generator has to feed.** When a future part
 * extends the DSL — as Parts 6, 7, 11, 12 and 17 all did — this generator must grow with
 * it, or the calibration quietly goes blind to the newest half of the corpus.
 */
export const GENERATOR_MUST_FEED_EVERY_FRAME =
  'syntheticCharts must populate every fact a predicate can read — planets (with dignity), '
  + 'sav, lagnas (all six frames), bav (seven planets plus asc), shadbala and upagrahas. '
  + 'Five separate facts have now been missing in turn, each time making good rules look '
  + 'dead. The first run '
  + 'reported nine of thirteen encoded rules as never firing purely because lagnas and bav '
  + 'were missing. Extend this generator whenever the predicate DSL grows.';

export const SYNTHETIC_CHARTS_ARE_UNIFORM =
  'syntheticCharts places planets uniformly at random. Real charts are not uniform — '
  + 'Mercury and Venus stay near the Sun, the nodes are opposed, the lagna tracks the time '
  + 'of day. Base rates measured this way separate "most of humanity" from "almost nobody", '
  + 'which is what the gate needs. They are NOT probabilities and must not be quoted as such.';

/**
 * Roughly what fraction of charts a rule of this arity should fire for.
 *
 * A placement condition selects about one house in twelve, so n roughly independent
 * conditions land near (1/12)^n. Crude — real conditions are not independent, and a
 * `dignity` or `bindus` condition has a different selectivity from a `placement` one — but
 * it is right to an order of magnitude, which is all the suspect check needs.
 */
export const expectedBaseRate = (arity: number): number => Math.pow(1 / 12, Math.max(1, arity));

/**
 * How many synthetic charts a rule of this arity needs before "it never fired" means
 * anything. Sized for `EXPECTED_HITS` expected occurrences.
 */
export const EXPECTED_HITS = 10;

export function populationFor(arity: number): number {
  return Math.ceil(EXPECTED_HITS / expectedBaseRate(arity));
}

/**
 * Split a never-fired list into rules the sample could actually judge, and rules that are
 * simply rarer than the sample can resolve.
 *
 * RETROFIT (Part 31 sweep). The guard asserted a flat "nothing never-fired" against a fixed
 * 6,000 charts. That was ample while the corpus was mostly single-condition rules, but
 * chapter 36's yogas are arity 3-4 and fire near (1/12)^4 — about ONE expected hit in 6,000.
 * Roughly a third would have reported as dead on any given seed, from sampling noise alone.
 *
 * The fix is NOT a bigger sample: sizing up to 10 expected hits at arity 4 needs ~207,000
 * charts and put 80 seconds on every test run. The fix is to make the guard's CLAIM honest.
 * A rule the population cannot resolve is **unjudged, not dead** — the same distinction the
 * programme has had to draw five times over for missing facts (see `CH25_WIRING`), now
 * applied to statistical power rather than to plumbing.
 */
/**
 * Can a population of this size say anything about a rule of this arity?
 *
 * Both calibration guards need this. Without it they do not merely mis-measure — they
 * ACCUSE: the never-fired guard calls a rule dead and the suspect check calls it broken,
 * when the only thing that happened is that a 1-in-20,000 event did not occur in 20,000
 * tries. Where a guard lacks the power to judge, it must abstain.
 */
export function canJudge(arity: number, population: number): boolean {
  return population * expectedBaseRate(arity) >= EXPECTED_HITS;
}

export function deadRules(
  neverFired: string[], rules: { id: string; when: unknown[] }[], population: number,
): { dead: string[]; unjudged: string[] } {
  const byId = new Map(rules.map((r) => [r.id, r.when.length]));
  const dead: string[] = [];
  const unjudged: string[] = [];
  for (const id of neverFired) {
    const a = byId.get(id) ?? 1;
    (canJudge(a, population) ? dead : unjudged).push(id);
  }
  return { dead, unjudged };
}

export const GUARD_POWER_NOT_SAMPLE_SIZE =
  'The never-fired guard reports a rule as DEAD only when the population was large enough '
  + 'to expect it — otherwise it is UNJUDGED. Part 31 found the old flat assertion would '
  + 'have failed about a third of chapter 36’s arity-4 yogas from sampling noise, and that '
  + 'sizing the sample up instead (207,000 charts for 10 expected hits at arity 4) cost 80 '
  + 'seconds per test run. Unjudged-not-dead is the same distinction the programme draws '
  + 'for a rule whose facts the generator never fed, applied to statistical power.';

export function isSuspiciouslyRare(measured: number, arity: number): boolean {
  if (measured === 0) return true;
  return measured < expectedBaseRate(arity) / SUSPECT_ARITY_FACTOR;
}

/** How far below its arity's expectation a rule must fall before it is suspect. */
export const SUSPECT_ARITY_FACTOR = 10;

export const SUSPECT_THRESHOLD_SCALES_WITH_ARITY =
  'BASE_RATE_SUSPECT is a flat 0.1% and only works while rules have one condition. A '
  + 'three-condition rule should fire near (1/12)^3 = 0.058%, which the flat floor calls a '
  + 'transcription bug. `isSuspiciouslyRare` compares against what the rule’s own arity '
  + 'predicts instead. Found in Part 23, when the first three-condition rules were encoded.';

export interface CalibrationResult {
  /** Measured firing fraction per rule id. */
  baseRates: Record<string, number>;
  /** Rules above BASE_RATE_SUPPRESS — background, not findings. */
  nonDiscriminative: string[];
  /** Rules below BASE_RATE_SUSPECT — probable transcription bugs. */
  suspect: string[];
  /** Rules that never fired at all across the sample. */
  neverFired: string[];
  sampleSize: number;
  seed: number;
}

/**
 * Measure how often each rule fires across a synthetic population.
 *
 * The two ends are the interesting ones. A rule firing for most charts is not wrong — it is
 * simply not a *finding*, and surfacing it is how a reading turns into a horoscope. A rule
 * firing for almost none is more often a mis-transcription than a genuinely rare
 * configuration, and Part 13-16 found four wrong tables that would have shown up exactly
 * that way.
 */
export function calibrate(rules: Rule[], charts: ChartFacts[], seed = 1): CalibrationResult {
  const counts: Record<string, number> = {};
  for (const r of rules) counts[r.id] = 0;
  for (const facts of charts) {
    for (const h of fired(rules, facts)) counts[h.rule.id] = (counts[h.rule.id] ?? 0) + 1;
  }
  const baseRates: Record<string, number> = {};
  const nonDiscriminative: string[] = [];
  const suspect: string[] = [];
  const neverFired: string[] = [];
  for (const r of rules) {
    const rate = charts.length === 0 ? 0 : counts[r.id]! / charts.length;
    baseRates[r.id] = rate;
    if (rate === 0) neverFired.push(r.id);
    else if (rate > BASE_RATE_SUPPRESS) nonDiscriminative.push(r.id);
    else if (rate < BASE_RATE_SUSPECT) suspect.push(r.id);
  }
  return { baseRates, nonDiscriminative, suspect, neverFired, sampleSize: charts.length, seed };
}

/** Attach measured base rates to a rule set, ready for `arbitrate`. */
export function withBaseRates(rules: Rule[], measured: Record<string, number>): Rule[] {
  return rules.map((r) => (measured[r.id] == null ? r : { ...r, baseRate: measured[r.id]! }));
}

// ── What this part deliberately did not settle ───────────────────────────────

export const ARBITRATION_OPEN = {
  thresholds:
    'Part 17’s TRANSIT_MIDPOINT (4 of 8) and the 5-of-8 thresholds inside '
    + 'ashtakavargaEffectRules are ours, not the text’s, and were left alone here. They '
    + 'need a real chart population to calibrate against, not a uniform one.',
  realCharts:
    'The honest next step is calibrating against ephemeris-generated charts rather than '
    + 'uniform placements. The engine can produce them; wiring that up is a task of its own.',
  multiPlanet:
    '`bearingPlanet` takes the first planet a rule names. A rule resting on two would need '
    + 'the text to say which governs, and it does not.',
  dasha:
    'Part 38 ended this one. Chapter 48’s rules DO consult a dasha, and the generator now '
    + 'derives one from the Moon’s nakshatra. What remains: the dasha is a snapshot, so a '
    + 'base rate here is "how often does this rule hold at a random moment", not "how often '
    + 'in a life" — which are different questions wherever a period’s length varies.',
} as const;
