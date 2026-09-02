// ─────────────────────────────────────────────────────────────────────────────
// The Rule record — BPHS Programme Part 1.
//
// A rule is `when → effect`, optionally cancelled by `unless`. Three properties make
// this more than a lookup table:
//
//  1. `arity` is COUNTED from `when`, never authored. It is the honest specificity
//     measure: a 6-condition rule says something about few charts, a 1-condition rule
//     says something about everyone. Ranking by arity alone already separates a real
//     instrument from a horoscope generator.
//
//  2. `unless` is first class. BPHS is full of cancellations (an entire chapter, ch 10,
//     is nothing but antidotes). Systems that drop the cancellation clauses are exactly
//     the systems that produce doom-laden nonsense. Modelling them structurally is a
//     safety mechanism, not a nicety.
//
//  3. `baseRate` is measured, not guessed — the fraction of random charts a rule fires
//     for (Programme §5). A rule above BASE_RATE_SUPPRESS describes humanity rather than
//     a person, and is kept as background colour rather than surfaced as a finding.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChartFacts, Predicate } from './predicate.js';
import { evaluateAll, evaluate, explain } from './predicate.js';

/** Where a rule came from, so any claim can be traced back to a verse. */
export interface RuleSource {
  /** Corpus id. 'bphs' = Brihat Parashara Hora Shastra (Santhanam). */
  text: 'bphs';
  chapter: number;
  /** Verse or verse range as printed, e.g. '55' or '57-58'. */
  verse: string;
  /** Line in the source markdown, for re-checking during review. */
  line?: number;
}

/**
 * How well a rule is evidenced.
 *  • 'example'    — verified against a worked example in the source. Strongest.
 *  • 'derived'    — follows deductively from an encoded computation.
 *  • 'unverified' — stated by the text with no example to check against. Say so.
 */
export type Verification = 'example' | 'derived' | 'unverified';

/** Which area of life an effect lands in. Kept small on purpose; extended per part. */
export type EffectDomain =
  | 'self' | 'wealth' | 'siblings' | 'home' | 'children' | 'health'
  | 'partnership' | 'transformation' | 'fortune' | 'career' | 'gains' | 'release'
  | 'mind' | 'body' | 'timing' | 'strength';

export interface Effect {
  /** Stable id so co-firing rules can be de-duplicated instead of double-counted. */
  id: string;
  domain: EffectDomain;
  /** −1 hindering … +1 supporting. Magnitude is set by arbitration, not here. */
  valence: number;
  /** Our own concise phrasing. Never the source's prose. */
  summary: string;
  /**
   * Which part of a period this effect applies to — BPHS 50.4-10.
   *
   * Absent means the whole period, which is every rule but the handful that need otherwise.
   * Chapter 50 gives a rasi dasha owned by a benefic and occupied by a malefic as *"favourable
   * in the first part and adverse in the latter part"* — one period carrying two verdicts in
   * sequence, which nothing in the corpus had needed before.
   *
   * ⚠️ **The label is encoded and the BOUNDARY is refused.** BPHS says "first part" and "latter
   * part" and never says where they divide, so computing a midpoint would invent a date the
   * source does not give. A caller wanting dates chooses the split and owns it — the same
   * discipline as 51.6's unresolved seed.
   */
  phase?: 'first' | 'latter';
}

export interface Rule {
  /** 'bphs.03.055' — chapter and verse, permanently traceable. */
  id: string;
  source: RuleSource;
  /** ALL must hold. Alternatives are separate rules sharing an `effect.id`. */
  when: Predicate[];
  /** If ANY holds, the rule is cancelled entirely. */
  unless?: Predicate[];
  effect: Effect;
  /** The text's own emphasis, 0..1. Default 0.5 where the source does not grade it. */
  weight: number;
  verification: Verification;
  /** Fraction of random charts this fires for. Filled by the calibration run (§5). */
  baseRate?: number;
  /** Free-form notes — exceptions noticed but deliberately not encoded. */
  note?: string;
}

/** Above this base rate a rule describes humanity, not a person. */
export const BASE_RATE_SUPPRESS = 0.35;
/** Below this, a rule almost certainly has a transcription bug rather than being rare. */
export const BASE_RATE_SUSPECT = 0.001;

/** Specificity of a rule = how many conditions it demands. Counted, never authored. */
export function arity(r: Rule): number {
  return r.when.length;
}

/** A fired rule, with the evidence that made it fire and the evidence that did not. */
export interface RuleHit {
  rule: Rule;
  arity: number;
  met: Predicate[];
  /** Cancellation clauses that were checked and did NOT trigger. */
  survived: Predicate[];
}

/**
 * Which rules fire on a chart.
 *
 * A rule with no conditions never fires — an empty `when` is a data error, not a rule
 * that applies universally, and silently treating it as always-true would poison every
 * downstream ranking.
 */
export function fired(rules: Rule[], facts: ChartFacts): RuleHit[] {
  const out: RuleHit[] = [];
  for (const rule of rules) {
    if (rule.when.length === 0) continue;
    if (!evaluateAll(rule.when, facts)) continue;
    if (rule.unless?.some((p) => evaluate(p, facts))) continue; // cancelled
    out.push({
      rule,
      arity: arity(rule),
      met: explain(rule.when, facts).met,
      survived: rule.unless ?? [],
    });
  }
  return out;
}

/**
 * Rank fired rules: specific before generic, then by the text's own emphasis.
 * Rules whose measured base rate marks them as non-discriminative sort last.
 *
 * This is the seed of the arbitration engine. Programme Part 19 replaces it with the
 * full ordering (cancellations → bhava bala gate → arity → Shadbala → Ishta/Kashta →
 * Ashtakavarga → base rate). The signature is meant to survive that change.
 */
export function rank(hits: RuleHit[]): RuleHit[] {
  const discriminative = (h: RuleHit): number =>
    h.rule.baseRate != null && h.rule.baseRate > BASE_RATE_SUPPRESS ? 1 : 0;
  return [...hits].sort((a, b) =>
    discriminative(a) - discriminative(b)
    || b.arity - a.arity
    || b.rule.weight - a.rule.weight
    || a.rule.id.localeCompare(b.rule.id));
}

/** Rules that fire so often they describe everyone — kept, but never surfaced as findings. */
export function nonDiscriminative(rules: Rule[]): Rule[] {
  return rules.filter((r) => r.baseRate != null && r.baseRate > BASE_RATE_SUPPRESS);
}

/** Rules that never fire in a large sample — almost always an extraction bug (§5). */
export function suspectRules(rules: Rule[]): Rule[] {
  return rules.filter((r) => r.baseRate != null && r.baseRate < BASE_RATE_SUSPECT);
}

export const PHASE_ENCODES_THE_LABEL_NOT_THE_BOUNDARY =
  'BPHS 50.4-10 gives a rasi dasha "favourable in the first part and adverse in the latter '
  + 'part" — one period carrying two verdicts in sequence, the corpus’s only within-period '
  + 'split. `Effect.phase` carries the SOURCE’S OWN LABEL ("first" / "latter") and deliberately '
  + 'no boundary: BPHS never says where the parts divide, so computing a midpoint would invent '
  + 'a date it does not give. A caller wanting dates chooses the split and owns it. Absent '
  + 'phase means the whole period, which is every rule but the few that need otherwise.';
