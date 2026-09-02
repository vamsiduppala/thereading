// ─────────────────────────────────────────────────────────────────────────────
// Cross-part compositions — capabilities that belong to no single chapter.
//
// This module exists because of Programme §8.1's "composition" lens: when two parts,
// extracted separately, turn out to combine into something neither could do alone, the
// result lives here rather than being wedged into one chapter's module and pretending
// it came from that chapter.
//
// FIRST ENTRY (retrofit run at the start of Part 5, applying to Parts 1, 3 and 4):
//
//   Part 4 gave `classifyVarga()`, which grades a planet across a varga scheme — but it
//   demanded the caller supply `goodDivisions`, the list of divisors in which the planet
//   sits in a "good" division. Working that out by hand for ten divisions is exactly the
//   sort of arithmetic nobody does, so the headline feature of Part 4 was, in practice,
//   unusable.
//
//   Part 1 already encodes what "good" means: BPHS 6.52's first three criteria are
//   exaltation, moolatrikona and own sign — and Part 1 has all three, degree-bounded.
//   Parts 3 and 4 already compute every division. So the count is derivable, and
//   `classifyVarga` should never have needed to ask for it.
//
// Nothing new was extracted from the book to make this work. It was already all there,
// in three places that had not been introduced to each other.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House, SignIndex } from '../../types.js';
import type { ChartFacts, PlanetFact } from '../../rules/predicate.js';
import { lordOfSign } from '../../rules/predicate.js';
import type { DignityState } from '../../rules/predicate.js';
import { vargaSign } from '../varga.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;
import { DEEP_EXALTATION_POINTS, MOOLATRIKONA_SIGN } from './ch03.js';
import {
  VARGA_SCHEMES, classifyVarga,
  type VargaScheme, type VargaDisqualifier, type VargaClassification,
} from './ch06b.js';

/** Why a division counts as good (BPHS 6.52). */
export type GoodVargaReason = 'exalted' | 'moolatrikona' | 'own' | 'arudha-angle';

export interface DivisionStanding {
  divisor: number;
  /** The sign the planet occupies in that division. */
  sign: SignIndex;
  good: boolean;
  reason: GoodVargaReason | null;
}

export interface GoodDivisionsResult {
  graha: Graha;
  scheme: VargaScheme;
  /** False for the nodes — see `note`. */
  applicable: boolean;
  /** Named `standings`, not `divisions`: VargaClassification.divisions is the scheme's divisor list. */
  standings: DivisionStanding[];
  /** Just the divisors that qualified, ready for `classifyVarga`. */
  goodDivisors: number[];
  note?: string;
}

/**
 * Which divisions of a scheme a planet sits well in, and why (BPHS 6.52 criteria 1-3,
 * plus the opt-in fourth).
 *
 * Ownership is tested with `lordOfSign(sign) === graha`, which is exact and covers both
 * of a planet's signs without a second table — Part 1's moolatrikona band and its
 * second owned sign both fall out of it.
 *
 * THE NODES: Rahu and Ketu own no sign, and Part 1 declined to assert an exaltation for
 * them because BPHS gives none agreed. Rather than quietly scoring them zero — which
 * would read as "badly placed" — this returns `applicable: false` and says why. A
 * scheme that cannot apply is not the same as a scheme scoring nothing.
 *
 * @param opts.arudhaAngleSigns BPHS 6.52's fourth criterion, opt-in. Supply the signs
 *   owned by the lords of the angles from the Arudha Lagna. Off by default: Santhanam
 *   notes it can admit eight signs of twelve, and a test most placements pass carries
 *   little information (Programme §5).
 */
export function goodDivisionsFor(
  graha: Graha,
  longitude: number,
  scheme: VargaScheme,
  opts: { arudhaAngleSigns?: SignIndex[] } = {},
): GoodDivisionsResult {
  const exalt = DEEP_EXALTATION_POINTS[graha]?.exaltSign;
  const mt = MOOLATRIKONA_SIGN[graha];

  if (exalt == null || mt == null) {
    return {
      graha,
      scheme,
      applicable: false,
      standings: [],
      goodDivisors: [],
      note: 'The nodes own no sign and BPHS states no agreed exaltation for them, so the '
        + 'good-division criteria of 6.52 do not apply. Not scored zero — not applicable.',
    };
  }

  const arudha = opts.arudhaAngleSigns ?? [];
  const standings: DivisionStanding[] = VARGA_SCHEMES[scheme].map((divisor) => {
    const sign = vargaSign(longitude, divisor);
    const reason: GoodVargaReason | null =
      sign === exalt ? 'exalted'
        : sign === mt ? 'moolatrikona'
          : lordOfSign(sign) === graha ? 'own'
            : arudha.includes(sign) ? 'arudha-angle'
              : null;
    return { divisor, sign, good: reason != null, reason };
  });

  return {
    graha,
    scheme,
    applicable: true,
    standings,
    goodDivisors: standings.filter((d) => d.good).map((d) => d.divisor),
  };
}

export interface VargaGrade extends VargaClassification {
  graha: Graha;
  applicable: boolean;
  standings: DivisionStanding[];
  note?: string;
}

/**
 * Grade a planet across a varga scheme, end to end, from nothing but its longitude.
 *
 * This is what Part 4 was reaching for and could not express on its own:
 *   longitude → every division (Parts 3-4) → dignity in each (Part 1) → good count →
 *   designation (Part 4), with the 6.53 veto applied.
 */
export function gradeVarga(
  graha: Graha,
  longitude: number,
  scheme: VargaScheme,
  disqualifier: VargaDisqualifier = {},
  opts: { arudhaAngleSigns?: SignIndex[] } = {},
): VargaGrade {
  const g = goodDivisionsFor(graha, longitude, scheme, opts);
  const classification = classifyVarga(scheme, g.goodDivisors, disqualifier);
  return {
    ...classification,
    graha,
    applicable: g.applicable,
    standings: g.standings,
    note: g.note,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECOND ENTRY (retrofit run at the start of Part 29, applying to Parts 3, 4 and 20-28)
//
//   "Varga-relative placement" sat in the open-threads table for SIX parts as the largest
//   untouched gap. Every attempt to close it imagined a new predicate kind — a `varga`
//   field on `placement`, or a `divisor` on the frame — and every one of those would have
//   had to be threaded through `lordship`, `conjunct`, `aspect` and the compound kinds
//   before a single rule could use it.
//
//   It was the wrong shape, and predicate.ts had said so from Part 1:
//
//     "A predicate must be evaluable against a plain snapshot of a chart (ChartFacts) …
//      and lets the same rule run on a natal chart, A VARGA, or an annual chart."
//
//   The capability was never a new predicate. It is a **projection**: build the varga's
//   own `ChartFacts` and run the existing rules against it unchanged. Every predicate
//   kind works in a divisional chart the moment the facts describe one, including the
//   kinds that do not exist yet.
//
//   `PlanetFact.longitude` has been required since Part 1, so the projection needs no
//   new fact and no generator change — the same property that made Part 28's planetary
//   frames safe, and the opposite of the upagraha wiring gap that cost two parts.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Project a chart into its D-`divisor` divisional chart.
 *
 * Each planet keeps its longitude and dignity but takes its **divisional** sign; houses
 * are recounted from `lagnaSign`, which defaults to the divisional sign of the natal
 * ascendant when `lagnaLongitude` is supplied.
 *
 * What is deliberately DROPPED rather than carried across:
 *   - `sav` / `bav` — ashtakavarga is defined on the rasi chart. Carrying the natal
 *     bindus into D-9 would let a rule read a number that means nothing there.
 *   - `shadbala` — likewise computed from rasi positions.
 *   - `lagnas` — the special ascendants are rasi constructions. A caller that wants a
 *     divisional reference point sets it explicitly (see `karakamsaFacts`).
 * Dropping them means a rule that reads them returns `false` in a varga, which is the
 * engine's standing answer for "cannot determine" — silence, not a guess.
 */
export function vargaFacts(
  facts: ChartFacts,
  divisor: number,
  opts: { lagnaLongitude?: number; lagnaSign?: SignIndex } = {},
): ChartFacts {
  const lagnaSign = (opts.lagnaSign
    ?? (opts.lagnaLongitude != null
      ? (vargaSign(opts.lagnaLongitude, divisor) as SignIndex)
      : facts.lagnaSign)) as SignIndex;

  const planets: Record<string, PlanetFact> = {};
  for (const [g, p] of Object.entries(facts.planets) as [string, PlanetFact | undefined][]) {
    if (!p || p.longitude == null) continue;   // no longitude, no divisional position
    const sign = vargaSign(p.longitude, divisor) as SignIndex;
    const dignity = wholeSignDignity(g as Graha, sign);
    planets[g] = {
      ...p,
      sign,
      house: (((sign - lagnaSign + 12) % 12) + 1) as House,
      // Dignity is RECOMPUTED from the divisional sign, never carried across. See
      // VARGA_DIGNITY_IS_RECOMPUTED — carrying it was a real bug, found in Part 32.
      ...(dignity ? { dignity } : { dignity: undefined }),
    };
  }
  return { lagnaSign, planets } as unknown as ChartFacts;
}

/**
 * Dignity in a divisional chart, by SIGN alone.
 *
 * Vargas have no meaningful degree — a planet's position within a navamsa is not what the
 * classical rules read. So exaltation, debilitation and own-sign are whole-sign here, which
 * is the standard treatment, and the degree-banded `bandFor` is deliberately not used.
 * Friend/enemy is not computed: it depends on a dispositor relationship the projection does
 * not carry, and guessing it would be worse than returning nothing.
 */
export function wholeSignDignity(graha: Graha, sign: SignIndex): DignityState | undefined {
  const ex = DEEP_EXALTATION_POINTS[graha];
  if (ex) {
    if (mod12(ex.exaltSign) === mod12(sign)) return 'exalted';
    if (mod12(ex.debilSign) === mod12(sign)) return 'debilitated';
  }
  if (MOOLATRIKONA_SIGN[graha] === mod12(sign)) return 'moolatrikona';
  if (lordOfSign(sign) === graha) return 'own';
  return undefined;
}

/**
 * **The bug this fixed.** Part 29's `vargaFacts` spread the source `PlanetFact` and
 * overwrote only `sign` and `house` — so `dignity` came across UNCHANGED from the rasi
 * chart. A rule asking "is the Moon in her own navamsa" (BPHS 37.2-4) would have read her
 * RASI dignity and answered about a different chart entirely.
 *
 * It is the same class of error as the ashtakavarga and Shadbala fields, which that part
 * did correctly drop — the projection just failed to notice that dignity is derived from
 * the sign rather than carried with the planet. Found in Part 32, when chapter 37 became
 * the first chapter to actually ask for a dignity inside a varga.
 */
export const VARGA_DIGNITY_IS_RECOMPUTED =
  'vargaFacts RECOMPUTES dignity from the divisional sign; it never carries the rasi '
  + 'dignity across. Part 29 shipped it carrying, because nothing yet read a dignity inside '
  + 'a varga — BPHS 37.2-4 is the first rule that does, and it would have been answered from '
  + 'the wrong chart. Whole-sign, because a varga has no meaningful degree. Friend/enemy is '
  + 'left undefined rather than guessed: it needs a dispositor relationship the projection '
  + 'does not carry.';

/**
 * The navamsa chart framed on the **karakamsa** — the navamsa sign of the Atmakaraka
 * (BPHS 33.1). Chapter 33's rules are all "X in the Nth from Karakamsa", read in D-9.
 *
 * The karakamsa is exposed as a `LagnaReference` rather than baked into the returned
 * `lagnaSign`, so that a rule can still ask about the navamsa ascendant (33.9-11 needs
 * both in one breath: "benefics in the Karakamsa AND the Navamsha of Lagna").
 */
export function karakamsaFacts(
  facts: ChartFacts,
  atmakaraka: Graha,
  opts: { lagnaLongitude?: number } = {},
): ChartFacts | null {
  const ak = facts.planets[atmakaraka];
  if (!ak || ak.longitude == null) return null;
  const d9 = vargaFacts(facts, 9, opts);
  const karakamsa = vargaSign(ak.longitude, 9) as SignIndex;
  return { ...d9, lagnas: { karakamsa } } as unknown as ChartFacts;
}

export const VARGA_PROJECTION_NOT_PREDICATE =
  'The varga-relative capability is a PROJECTION (`vargaFacts`), not a predicate kind. '
  + 'Building the divisional chart’s own ChartFacts makes every existing predicate work '
  + 'there unchanged — including kinds not yet written — where a `varga` field would have '
  + 'had to be threaded through each kind separately. predicate.ts stated this design from '
  + 'Part 1; it took six parts to notice the gap was already specified. Ashtakavarga, '
  + 'Shadbala and the special lagnas are deliberately NOT carried across: they are rasi '
  + 'constructions, and a rule reading them in a varga returns false rather than a number '
  + 'that means nothing there.';

/**
 * Populate `facts.vargas` so `inFrame` can read them.
 *
 * Projection is done **once per chart**, not once per rule. Across a 717-rule registry and a
 * 20,000-chart calibration that is the difference between a cheap capability and an expensive
 * one, and it also keeps `predicate.ts` free of an import cycle — it cannot reach `vargaFacts`
 * itself.
 *
 * Only the divisors asked for are built. A rule naming a divisor nobody projected gets
 * silence, which is the same contract as every other absent fact.
 */
export function withVargas(
  facts: ChartFacts, divisors: number[],
  opts: { lagnaLongitude?: number } = {},
): ChartFacts {
  const vargas: Partial<Record<number, ChartFacts>> = { ...(facts.vargas ?? {}) };
  for (const d of divisors) {
    if (vargas[d]) continue;
    vargas[d] = vargaFacts(facts, d, opts);
  }
  return { ...facts, vargas };
}

export const PROJECT_ONCE_PER_CHART =
  'Divisional charts are projected ONCE PER CHART by `withVargas` and read from `facts.vargas` '
  + 'by the `inFrame` predicate — not rebuilt inside each rule. Across a 717-rule registry and '
  + 'a 20,000-chart calibration that is the difference between a cheap capability and an '
  + 'expensive one. It also keeps `predicate.ts` free of an import cycle, since `vargaFacts` '
  + 'lives here and this module already imports from there. A divisor nobody projected yields '
  + 'silence, the same contract as every other absent fact.';
