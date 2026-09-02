// ─────────────────────────────────────────────────────────────────────────────
// The predicate algebra — BPHS Programme Part 1, §3 of docs/BPHS_PROGRAMME.md.
//
// Every classical rule is `CONDITIONS → EFFECT`. This module makes the CONDITIONS
// machine-checkable, so a rule is data rather than prose. Everything the extraction
// programme writes for the remaining 50 parts lands in this shape.
//
// Design constraints that are load-bearing (do not "simplify" these away):
//  • A predicate must be evaluable against a plain snapshot of a chart (`ChartFacts`),
//    never against a live engine. That keeps the knowledge layer pure and testable,
//    and lets the same rule run on a natal chart, a varga, or an annual chart.
//  • `arity` is COUNTED, never authored. It is the specificity measure that lets the
//    engine rank a 6-condition rule above a 1-condition one. See rule.ts.
//  • Unknown facts return `false`, never throw. A partial chart (no birth time, no
//    strength computed yet) must degrade to "this rule does not fire", not crash.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House, LagnaReference, SignIndex } from '../types.js';
// The aspect predicate reads the two aspect systems from the knowledge data. Safe
// direction: data/aspects.ts is pure functions over numbers and imports nothing from
// rules/, so there is no cycle.
import { rasiDrishti } from '../data/aspects.js';
import { aspectQuarters } from '../data/bphs/ch26a.js';

export type { LagnaReference };

/** Dignity states a placement can hold. `moolatrikona` is degree-bounded (BPHS 3.51-54). */
/**
 * A planet, named directly OR as the lord of a house.
 *
 * RETROFIT (Part 31 sweep). Three predicates needed this in the same part. `Graha` is a
 * string and `House` is a number, so one field carries both with no wrapper and every rule
 * written before still type-checks.
 *
 * The alternative was what Part 31 first tried and threw away: hardcoding a planet where
 * the verse says "the ascendant lord" (Mars, because the example chart was Aries). That
 * fires on the wrong evidence for eleven ascendants out of twelve, and its arity is a lie.
 * Approximating a subject is worse than not encoding the rule.
 */
export type PlanetRef =
  | Graha                          // named directly
  | House                          // the lord of this house
  /**
   * The lord of the sign THAT ref occupies — a **dispositor**, and recursive.
   *
   * BPHS uses this constantly and it was the clearest gap left in the DSL, blocking rules in
   * four parts. Making it part of `PlanetRef` rather than a new predicate kind means every
   * predicate that already accepts a ref gains it at once — `dignity`, `strength`,
   * `aspect.graha`, `aspect.ontoGraha`, `lordsConjunct.parties`, `dasha.lord`. Six kinds, one
   * type change, which is the same leverage `PlanetRef` gave when it was introduced.
   *
   * It composes to any depth, so ch 36.33-34's Kalpadruma — a four-deep chain, blocked since
   * Part 31 — is literally `{ dispositorOf: { dispositorOf: { dispositorOf: 1 } } }`.
   *
   * A planet in its own sign is its own dispositor. That is not a cycle to guard against but
   * the chain's natural terminus (*swakshetra*), and it is where a dispositor walk is supposed
   * to stop.
   */
  | { dispositorOf: PlanetRef };

/** @deprecated Use `PlanetRef`. Kept so Part 22-30 rules keep reading naturally. */
export type ConjunctParty = PlanetRef;

export type DignityState =
  | 'exalted' | 'moolatrikona' | 'own' | 'friend' | 'neutral' | 'enemy' | 'debilitated';

/** The five-fold compound relationship (BPHS 3.57-58). */
export type CompoundRelationState =
  | 'great-friend' | 'friend' | 'neutral' | 'enemy' | 'great-enemy';

export type DashaLevel =
  | 'maha' | 'antar' | 'pratyantar' | 'sookshma' | 'prana';

/**
 * A snapshot of everything a predicate may ask about. Supplied by the caller
 * (apps/api composes it from @aura/engine output). Optional fields are the ones
 * later programme parts fill in — a predicate that needs a missing field returns
 * false rather than guessing.
 */
export interface ChartFacts {
  /** The natal ascendant's sign. The default reference for every house claim. */
  lagnaSign: SignIndex;
  /** Sidereal longitude of the ascendant, if a birth time was known. */
  lagnaLong?: number;
  /**
   * The alternate ascendants of BPHS 5.9 — Bhava, Hora and Ghatika lagna signs.
   *
   * RETROFIT (Programme §8.1, added while starting Part 5). Part 2 established that
   * there is no single "the lagna", which made every house-based predicate written in
   * Part 1 under-specified: `{k:'placement', house: 7}` never said *seventh from what*.
   * A predicate may now name its reference, and a predicate naming a reference this
   * chart does not carry simply does not fire — the same "unknown → false" discipline
   * the rest of the engine uses.
   */
  lagnas?: Partial<Record<LagnaReference, SignIndex>>;
  planets: Record<Graha, PlanetFact>;
  /** Whole-sign house (1..12) of a sign, derived if absent. */
  houseOfSign?: (sign: SignIndex) => House;
  /** Lord of each house 1..12. Derived from lagnaSign if absent. */
  lordOfHouse?: (house: House) => Graha;
  /** Shadbala in rupas per planet — filled by Programme Parts 9-11. */
  shadbala?: Partial<Record<Graha, number>>;
  /** Ashtakavarga bindus per sign (SAV) — filled by Parts 13-15. */
  sav?: number[];
  /**
   * The six non-luminous points, by sign and house — Programme Part 28.
   *
   * The upagrahas are not members of `Graha`: BPHS treats them as points rather than
   * planets, Part 1 computes them (`sunUpagrahas`, `GULIKA_LONGITUDE_RULE`) without a home
   * on the facts, and chapter 25's 46 rules could not be registered without one.
   *
   * They live in their own field rather than being added to `Graha` because widening
   * `Graha` would silently change the meaning of every rule, table and loop that iterates
   * "the planets" — the ashtakavarga tables, the Shadbala set, the naisargika ordering.
   * A separate field is the smaller blast radius.
   */
  upagrahas?: Partial<Record<string, { sign: SignIndex; house?: House }>>;
  /**
   * Per-planet Bhinnashtakavarga rows, each 12 counts of 0-8 — Programme Part 17.
   *
   * Chapter 70's rules are almost all about a SPECIFIC planet's ashtakavarga ("the rekhas
   * in the 5th from Jupiter, in Jupiter's ashtakavarga"), not the SAV, so the `bindus`
   * predicate needed a source it could name. `'asc'` carries the ascendant's own table
   * (Part 15), which the reduction pipeline expects.
   */
  bav?: Partial<Record<string, number[]>>;
  /** Chara karaka assignment, e.g. { AK: 'rahu', DK: 'sun' } — Part 12/29. */
  karakas?: Partial<Record<string, Graha>>;
  /** Yoga keys detected on this chart. */
  yogas?: string[];
  /** The dasha lords currently in force, by level. */
  dasha?: Partial<Record<DashaLevel, Graha>>;
  /**
   * Divisional charts, keyed by divisor — the facts of the D3, D9, D12 and so on.
   *
   * Supplied by the caller rather than derived here, for the same two reasons every other
   * fact is: `predicate.ts` cannot import `vargaFacts` without a cycle, and projecting once
   * per chart beats projecting once per rule across a registry this size. `withVargas` in
   * `compose.ts` populates it.
   */
  vargas?: Partial<Record<number, ChartFacts>>;
  /**
   * The chart at the moment a dasha COMMENCES — BPHS 48's notes require it weighed against
   * the natal chart, and every other fact here is natal. Supplied, never inferred.
   */
  atDashaStart?: ChartFacts;
  /** Planets defeated in graha yuddha (BPHS 27.20). Filled by the caller. */
  defeatedInWar?: Graha[];
}

export interface PlanetFact {
  sign: SignIndex;
  house: House;
  /** Sidereal longitude 0..360. */
  longitude: number;
  /** Degrees within the sign, 0..30. Derived from `longitude` if absent. */
  degInSign?: number;
  retrograde?: boolean;
  combust?: boolean;
  /** Dignity, if already classified. Predicates fall back to `dignityOf` when absent. */
  dignity?: DignityState;
}

// ── The predicate union ───────────────────────────────────────────────────────

export type Predicate =
  /**
   * A planet stands in a given house and/or sign.
   * `from` names which ascendant the house is counted from (BPHS 5.9); default 'natal'.
   */
  | {
      k: 'placement'; graha: Graha; house?: House; sign?: SignIndex;
      from?: LagnaReference;
      /**
       * Count `house` from the sign occupied by the LORD of this house.
       *
       * RETROFIT (Part 31 sweep). BPHS 36.35-36's three Trimurthi yogas each count from a
       * lord rather than from a lagna — "counted from the 2nd lord, benefics in the 2nd,
       * 12th and 8th". Part 28 made any PLANET a frame; a lord is not a named planet, so
       * this is the same generalisation one step further, added as a sibling field the way
       * `fromHouse` was in Part 24 rather than by making `LagnaReference` a non-string.
       */
      fromLordOf?: House;
      /**
       * Count `house` from the Nth house of the frame, rather than from the frame itself
       * — *bhavat bhavam*, Programme Part 24.
       *
       * BPHS 23.7 authorises this explicitly: "just as these effects are derived from the
       * ascendant in regard to the native, similar deductions be made about co-born etc.
       * from the 3rd and other houses." Every house can be read as an ascendant for the
       * matter it signifies, which is the same move 12.11 makes for the Moon, generalised.
       *
       * It also supplies what Part 23 could not express for BPHS 21.19 ("the 10th lord in
       * a trine FROM the 10th").
       */
      fromHouse?: House;
    }
  /**
   * The lord of house X occupies house Y — the single commonest BPHS rule shape.
   * `from` applies to BOTH houses: a rule counting from the Hora lagna means the lord of
   * the Nth-from-Hora-lagna, sitting in the Mth-from-Hora-lagna.
   */
  | { k: 'lordship'; house: House; occupies: House; from?: LagnaReference; fromHouse?: House }
  /**
   * The lords of two houses occupy the SAME sign — Programme Part 22.
   *
   * BPHS states this constantly ("if the 4th and 10th lords join in an angle", "the 2nd and
   * 11th lords together"), and until Part 22 it was inexpressible: `lordship` names a house
   * and where its lord sits, `conjunct` names grahas, and neither can say "whichever planet
   * rules A is with whichever rules B" without resolving both lords first. Part 21 had to
   * weaken BPHS 15.4 for want of it.
   *
   * `inHouses` optionally restricts where the meeting must happen, which is how the verses
   * usually put it — "join in an angle or a trine".
   */
  /**
   * Two parties occupy the same sign, where a party is either a NAMED planet or "the lord
   * of house N".
   *
   * RETROFIT (Part 31 sweep). Part 22 introduced this as house-lord + house-lord, and
   * three separate parts (23, 24 and now 36's Kahala yoga) had to weaken a rule that says
   * "planet X with the lord of house N". A `Graha` is a string and a `House` is a number,
   * so one field carries both without a wrapper, and every rule written before this
   * still type-checks unchanged.
   *
   * Generalising the existing kind rather than adding a third: the corpus already had
   * `conjunct` (named + named) and this (lord + lord), and a third kind for (named + lord)
   * would have made one relation wear three shapes.
   */
  | {
      k: 'lordsConjunct'; parties: [ConjunctParty, ConjunctParty];
      inHouses?: House[]; from?: LagnaReference;
    }
  /** A planet holds one of the listed dignity states. */
  /**
   * The ascendant itself is one of these signs.
   *
   * RETROFIT (Part 31 sweep). BPHS 36.29-30 (Kusuma) applies only to a FIXED-sign
   * ascendant, and no predicate could say so. The first draft smuggled it in as "the Sun in
   * sign X", which tests a different thing entirely — the same class of error that
   * `PlanetRef` was added to remove. Signs rather than a modality vocabulary: it is
   * smaller, and it covers restrictions that are not modality-shaped.
   */
  | { k: 'lagna'; signs: SignIndex[] }
  | { k: 'dignity'; graha: PlanetRef; is: DignityState[] }
  /** A planet's Shadbala in rupas, compared. Needs `facts.shadbala` (Parts 9-11). */
  | { k: 'strength'; graha: PlanetRef; op: '>' | '<' | '>=' | '<='; rupas: number }
  /**
   * Ashtakavarga bindus, compared. Needs `facts.sav`, or `facts.bav` when `of` is given.
   *
   * Three ways to name the sign, in precedence order:
   *   `sign`                  — an absolute sign (the original form; unchanged)
   *   `house` + `fromGraha`   — the Nth house counted from a planet's sign (BPHS 70)
   *   `house`                 — the Nth house from the lagna
   *
   * `of` selects which ashtakavarga is read: a planet's own BAV, `'asc'` for the
   * ascendant's, or omitted for the SAV. Omitting it keeps every rule written before
   * Part 17 meaning exactly what it did.
   */
  | {
      k: 'bindus'; op: '>' | '<' | '>=' | '<='; n: number;
      sign?: SignIndex; house?: House; fromGraha?: Graha; of?: Graha | 'asc';
    }
  /**
   * One planet aspects another planet, or a house.
   *
   * RETROFIT (Programme §8.1, Part 6 sweep). The programme sketched this kind in §3 but
   * Part 1 shipped without it, which left "X aspects Y" — one of the commonest shapes in
   * the whole corpus — inexpressible.
   *
   * `kind` picks the aspect SYSTEM, and the two are genuinely different:
   *   • 'graha' (default) — planetary drishti. Directional, and graded by quarters
   *     (ch 26), which is what `minQuarter` reads.
   *   • 'rasi' — sign aspects (ch 8). Mutual, longitude-blind, decided by modality.
   * Merging them is a real error, so the predicate makes the choice explicit.
   */
  | {
    k: 'aspect';
    /** RETROFIT (Part 32 sweep): a house lord may aspect, not only a named planet. */
    graha: PlanetRef;
    /** RETROFIT (Part 33 sweep): and may be aspected. BPHS 42.6 needs "a benefic aspect
     *  on the ASCENDANT LORD", where the subject of the aspect is a role, not a name. */
    ontoGraha?: PlanetRef;
    ontoHouse?: House;
    kind?: 'graha' | 'rasi';
    /**
     * Minimum aspect strength in quarters (BPHS 26.2-5). **Defaults to 4 — full.**
     *
     * BPHS grades every planet's aspects: 3rd/10th a quarter, 5th/9th a half, 4th/8th
     * three-quarters, 7th full. Set this to 1 to accept any partial aspect. The default
     * stays full deliberately: a rule saying "Saturn aspects the 7th" means the full
     * aspect, and defaulting to any-partial would fire every aspect rule about seven
     * times more often, which is base-rate inflation of exactly the kind §5 guards.
     */
    minQuarter?: 1 | 2 | 3 | 4;
    from?: LagnaReference;
  }
  /**
   * Evaluate the inner predicates against a PROJECTED chart rather than the natal one —
   * Programme post-completion.
   *
   * Two projections, one wrapper. `{ varga: 9 }` runs them in the navamsa; `'dasha-start'`
   * runs them in the chart of the moment a period began. They are the same operation — project
   * the facts, then run the same predicates unchanged — which is why Part 29 closed the varga
   * question as a projection rather than a predicate kind, and why folding the dasha-start
   * chart in beside it costs nothing.
   *
   * Nests, so "in the D9, the Moon's dispositor is Saturn" and deeper combinations compose.
   * Returns **false when the frame was not supplied**: silence, not a guess.
   */
  | { k: 'inFrame'; frame: { varga: number } | 'dasha-start'; of: Predicate[]; op?: 'and' | 'or' }
  /**
   * Two refs resolve to the SAME graha — Programme post-completion.
   *
   * With a recursive `PlanetRef` this is what lets BPHS's commonest phrasing be said at all:
   * *"X is in a sign ruled by Y"* is `{ ref: { dispositorOf: X }, is: Y }`. Without it the
   * dispositor is resolvable but never comparable, which is half a capability.
   */
  | { k: 'isPlanet'; ref: PlanetRef; is: PlanetRef }
  /** Two or more NAMED planets share a sign. */
  | { k: 'conjunct'; grahas: Graha[] }
  /**
   * At least `count` planets share a sign, **without naming which** — Programme Part 47.
   *
   * BPHS 79.2-3 forms its ascetic yoga from "four or more planets, possessed of strength,
   * occupying a single house", and `conjunct` cannot say that: it takes a fixed list, so the
   * verse would need C(7,4)+C(7,5)+C(7,6)+C(7,7) = 64 enumerated rules, all firing on the same
   * charts and inflating the registry with no added meaning. The same shape as Retrofit R13's
   * `lordsConjunct` — a verse form the DSL could not express.
   *
   * `of` defaults to the seven grahas; `house` optionally requires the crowd to fall in a
   * particular house, counted in the given frame.
   */
  | { k: 'stellium'; count: number; of?: Graha[]; house?: House; from?: LagnaReference }
  /**
   * A planet is retrograde, combust, direct, or defeated in planetary war.
   *
   * RETROFIT (Part 11 sweep). `defeated` was added once graha yuddha existed (BPHS 27.20);
   * before that, ch 11.15-16's "lord defeated in a planetary war" clause was one of the
   * conditions listed as inexpressible.
   */
  | { k: 'state'; graha: Graha; is: 'retrograde' | 'combust' | 'direct' | 'defeated' }
  /** A named yoga is present on the chart. */
  | { k: 'yoga'; key: string }
  /** A chara karaka is a particular planet, e.g. DK = Sun. */
  | { k: 'karaka'; code: string; is: Graha }
  /** A dasha level is ruled by a given planet — binds static rules to timing. */
  | { k: 'dasha'; level: DashaLevel; lord: PlanetRef }
  /** Boolean composition. `or` fires if ANY hold; `not` inverts. */
  | { k: 'compound'; op: 'or' | 'not'; of: Predicate[] };

export type PredicateKind = Predicate['k'];

// ── Evaluation ────────────────────────────────────────────────────────────────

const mod12 = (n: number): number => ((n % 12) + 12) % 12;

/** Whole-sign house (1..12) of a sign, relative to the lagna. */
export function houseOfSign(sign: SignIndex, lagnaSign: SignIndex): House {
  return mod12(sign - lagnaSign) + 1;
}

/** The sign occupying house `h` for a given lagna. */
export function signOfHouse(house: House, lagnaSign: SignIndex): SignIndex {
  return mod12(lagnaSign + house - 1);
}

const SIGN_LORDS: Graha[] = [
  'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
  'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
];

/** The lord of a sign 0..11. */
export function lordOfSign(sign: SignIndex): Graha {
  return SIGN_LORDS[mod12(sign)]!;
}

const cmp = (a: number, op: '>' | '<' | '>=' | '<=', b: number): boolean =>
  op === '>' ? a > b : op === '<' ? a < b : op === '>=' ? a >= b : a <= b;

/**
 * The ascendant sign a predicate counts from, or null if this chart does not carry it.
 * Null propagates to `false` at the call site rather than silently falling back to natal —
 * answering a Hora-lagna question with the natal chart would be worse than not answering.
 */
/**
 * The sign a rule counts its houses from: the chosen frame, optionally advanced to one of
 * that frame's houses (bhavat bhavam, BPHS 23.7).
 */
function referenceSign(
  facts: ChartFacts, from: LagnaReference | undefined, fromHouse: House | undefined,
  fromLordOf?: House,
): SignIndex | null {
  const lag = referenceLagna(facts, from);
  if (lag == null) return null;
  // `fromLordOf` moves the origin to the sign a house's LORD occupies, before `fromHouse`
  // counts on from there. BPHS 36.35-36 (Trimurthi) needs it: "counted from the 2nd lord".
  const base = fromLordOf == null ? lag : lordSign(facts, fromLordOf, from, lag);
  if (base == null) return null;
  return fromHouse == null ? base : signOfHouse(fromHouse, base);
}

/**
 * Resolve a `PlanetRef` to a graha: a string is already one, a number names a house whose
 * lord is wanted. Natal frame only — every current use is natal, and silently resolving a
 * lord in the wrong frame would be worse than not answering.
 */
function resolveRef(facts: ChartFacts, ref: PlanetRef, seen = new Set<Graha>()): Graha | null {
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'number') {
    return facts.lordOfHouse
      ? facts.lordOfHouse(ref)
      : lordOfSign(signOfHouse(ref, facts.lagnaSign));
  }
  // A dispositor: resolve the inner ref, then take the lord of the sign it occupies.
  const inner = resolveRef(facts, ref.dispositorOf, seen);
  if (inner == null) return null;
  const pl = facts.planets[inner];
  if (!pl) return null;
  const lord = lordOfSign(pl.sign as SignIndex);
  // Swakshetra terminates the walk: a planet in its own sign IS its own dispositor, so a
  // longer chain resolves to it rather than looping. Returning it is the correct answer.
  if (lord === inner || seen.has(lord)) return lord;
  seen.add(inner);
  return lord;
}

/** The sign occupied by the lord of `house`, counted in the given frame. */
function lordSign(
  facts: ChartFacts, house: House, from: LagnaReference | undefined, lag: SignIndex,
): SignIndex | null {
  const lord = (from == null || from === 'natal') && facts.lordOfHouse
    ? facts.lordOfHouse(house)
    : lordOfSign(signOfHouse(house, lag));
  return facts.planets[lord]?.sign ?? null;
}

/** Frames that are a planet's own sign rather than a computed ascendant (BPHS 32.22-24). */
const PLANET_FRAMES = new Set<string>(
  ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'],
);

function referenceLagna(facts: ChartFacts, from: LagnaReference | undefined): SignIndex | null {
  if (from == null || from === 'natal') return facts.lagnaSign;
  // An explicit lagna wins: `moon` is both the chandra lagna and a planet, and a chart that
  // states its chandra lagna is stating something we should not second-guess.
  const stated = facts.lagnas?.[from];
  if (stated != null) return stated;
  if (PLANET_FRAMES.has(from)) return facts.planets[from as Graha]?.sign ?? null;
  return null;
}

/** A planet's house relative to a named ascendant. */
function houseFrom(
  facts: ChartFacts, pl: PlanetFact, from: LagnaReference | undefined,
): House | null {
  if (from == null || from === 'natal') return pl.house;
  const lag = referenceLagna(facts, from);
  return lag == null ? null : houseOfSign(pl.sign, lag);
}

/**
 * Evaluate one predicate against a chart snapshot.
 *
 * Returns `false` for anything it cannot determine — a rule needing Shadbala on a
 * chart where Shadbala has not been computed simply does not fire. This is deliberate:
 * silence is correct, a guess is not.
 */
export function evaluate(p: Predicate, facts: ChartFacts): boolean {
  switch (p.k) {
    case 'placement': {
      // An upagraha is looked up in its own field, since it is not a `Graha`. Falling back
      // rather than branching on a name list keeps the predicate shape identical for both.
      const pl = facts.planets[p.graha]
        ?? (facts.upagrahas?.[p.graha as string] as PlanetFact | undefined);
      if (!pl) return false;
      if (p.house != null) {
        // bhavat bhavam: with `fromHouse` the count starts at that house of the frame;
        // `fromLordOf` starts it at the sign a named house's lord occupies.
        const base = referenceSign(facts, p.from, p.fromHouse, p.fromLordOf);
        if (base == null) return false;
        const house = p.fromHouse == null && p.fromLordOf == null
          ? houseFrom(facts, pl, p.from)
          : mod12(pl.sign - base) + 1;
        if (house == null || house !== p.house) return false;
      }
      if (p.sign != null && pl.sign !== p.sign) return false;
      return p.house != null || p.sign != null;
    }
    case 'lordship': {
      const lag = referenceSign(facts, p.from, p.fromHouse);
      if (lag == null) return false;
      // The custom lordOfHouse resolver only knows the natal frame, so it is used only there.
      const lord = (p.from == null || p.from === 'natal') && facts.lordOfHouse
        ? facts.lordOfHouse(p.house)
        : lordOfSign(signOfHouse(p.house, lag));
      const pl = facts.planets[lord];
      if (!pl) return false;
      const house = p.fromHouse == null
        ? houseFrom(facts, pl, p.from)
        : mod12(pl.sign - lag) + 1;
      return house != null && house === p.occupies;
    }
    case 'lordsConjunct': {
      const lag = referenceLagna(facts, p.from);
      if (lag == null) return false;
      const resolve = (house: House): Graha =>
        ((p.from == null || p.from === 'natal') && facts.lordOfHouse
          ? facts.lordOfHouse(house)
          : lordOfSign(signOfHouse(house, lag)));
      const [a, b] = p.parties;
      // A number names a house and resolves to its lord IN THIS FRAME; a string IS the
      // planet; a `dispositorOf` is resolved by `resolveRef`, which is natal-only — so a
      // dispositor party inside a non-natal frame resolves in the natal chart. Stated rather
      // than silently mixed frames: no rule uses that combination today, and one that wanted
      // to would need `resolveRef` to take a frame first.
      const asGraha = (x: PlanetRef): Graha | null =>
        (typeof x === 'number' ? resolve(x) : typeof x === 'string' ? x : resolveRef(facts, x));
      const lordA = asGraha(a);
      const lordB = asGraha(b);
      if (lordA == null || lordB == null) return false;
      // One planet standing in for both parties is not two planets meeting, and calling
      // that a conjunction would fire the rule on a technicality. This now also covers the
      // case the retrofit introduced: "Jupiter with the 2nd lord" on a chart where Jupiter
      // IS the 2nd lord.
      if (lordA === lordB) return false;
      const pa = facts.planets[lordA];
      const pb = facts.planets[lordB];
      if (!pa || !pb) return false;
      if (mod12(pa.sign) !== mod12(pb.sign)) return false;
      if (p.inHouses == null) return true;
      const house = houseFrom(facts, pa, p.from);
      return house != null && p.inHouses.includes(house);
    }
    case 'lagna':
      return p.signs.includes(mod12(facts.lagnaSign) as SignIndex);
    case 'dignity': {
      const g = resolveRef(facts, p.graha);
      if (g == null) return false;
      const d = facts.planets[g]?.dignity;
      return d != null && p.is.includes(d);
    }
    case 'strength': {
      const g = resolveRef(facts, p.graha);
      if (g == null) return false;
      const r = facts.shadbala?.[g];
      return r != null && cmp(r, p.op, p.rupas);
    }
    case 'bindus': {
      // Resolve which sign is being asked about.
      let sign: SignIndex | null = null;
      if (p.sign != null) sign = mod12(p.sign);
      else if (p.house != null) {
        const base = p.fromGraha != null
          ? facts.planets[p.fromGraha]?.sign
          : facts.lagnaSign;
        if (base == null) return false;
        sign = mod12(base + p.house - 1);
      }
      if (sign == null) return false;
      // Resolve which ashtakavarga is being read.
      const row = p.of != null ? facts.bav?.[p.of] : facts.sav;
      const b = row?.[sign];
      return b != null && cmp(b, p.op, p.n);
    }
    case 'aspect': {
      const srcGraha = resolveRef(facts, p.graha);
      if (srcGraha == null) return false;
      const src = facts.planets[srcGraha];
      if (!src) return false;
      if (p.ontoGraha == null && p.ontoHouse == null) return false;

      // Resolve the target's sign and house in the requested frame.
      let targetSign: SignIndex | null = null;
      let targetHouse: House | null = null;
      if (p.ontoGraha != null) {
        const tg = resolveRef(facts, p.ontoGraha);
        if (tg == null) return false;
        const t = facts.planets[tg];
        if (!t) return false;
        targetSign = t.sign;
        targetHouse = houseFrom(facts, t, p.from);
      } else {
        const lag = referenceLagna(facts, p.from);
        if (lag == null) return false;
        targetHouse = p.ontoHouse!;
        targetSign = signOfHouse(p.ontoHouse!, lag);
      }

      if ((p.kind ?? 'graha') === 'rasi') {
        // Sign aspects: modality-based, longitude-blind, and mutual.
        return targetSign != null && rasiDrishti(src.sign).includes(targetSign);
      }

      // Planetary drishti: which houses this planet sees, from its own house.
      const srcHouse = houseFrom(facts, src, p.from);
      if (srcHouse == null || targetHouse == null) return false;

      // RETROFIT (Part 7 sweep): `minQuarter` arrived in Part 6 and was ignored, because
      // nothing graded aspects yet. Ch 26 grades them, so it is now honoured.
      //
      // Default stays FULL. A rule that says "Saturn aspects the 7th" means the full
      // aspect unless it says otherwise, and defaulting to any-partial would silently
      // fire every aspect rule roughly seven times more often — precisely the kind of
      // base-rate inflation §5 exists to prevent.
      const need = p.minQuarter ?? 4;
      return aspectQuarters(srcGraha, srcHouse, targetHouse) >= need;
    }
    case 'conjunct': {
      if (p.grahas.length < 2) return false;
      const first = facts.planets[p.grahas[0]!];
      if (!first) return false;
      return p.grahas.every((g) => facts.planets[g]?.sign === first.sign);
    }
    case 'inFrame': {
      const projected = p.frame === 'dasha-start'
        ? facts.atDashaStart
        : facts.vargas?.[p.frame.varga];
      // The frame was not supplied, so the question cannot be answered — not answered false
      // on the merits. Same rule as every absent fact.
      if (!projected) return false;
      if (p.of.length === 0) return false;
      return p.op === 'or'
        ? p.of.some((q) => evaluate(q, projected))
        : p.of.every((q) => evaluate(q, projected));
    }
    case 'isPlanet': {
      const a = resolveRef(facts, p.ref);
      const b = resolveRef(facts, p.is);
      return a != null && b != null && a === b;
    }
    case 'stellium': {
      const pool = p.of ?? (['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as Graha[]);
      const bySign = new Map<number, number>();
      for (const g of pool) {
        const pl = facts.planets[g];
        if (!pl) continue;
        bySign.set(pl.sign, (bySign.get(pl.sign) ?? 0) + 1);
      }
      for (const [sign, n] of bySign) {
        if (n < p.count) continue;
        if (p.house == null) return true;
        const lag = referenceSign(facts, p.from, undefined);
        if (lag == null) continue;
        if (mod12(sign - lag) + 1 === p.house) return true;
      }
      return false;
    }
    case 'state': {
      const pl = facts.planets[p.graha];
      if (!pl) return false;
      if (p.is === 'retrograde') return !!pl.retrograde;
      if (p.is === 'combust') return !!pl.combust;
      if (p.is === 'defeated') return !!facts.defeatedInWar?.includes(p.graha);
      return !pl.retrograde;
    }
    case 'yoga':
      return !!facts.yogas?.includes(p.key);
    case 'karaka':
      return facts.karakas?.[p.code] === p.is;
    case 'dasha': {
      // `lord` is a PlanetRef — Programme Part 38. Chapter 48 keys every one of its effects
      // to "the dasha of the lord of the Nth house", which before this took a fan-out over
      // all seven grahas AND a second predicate to pin the lordship — a conjunction that did
      // not actually tie the two together, because nothing said the named graha WAS that
      // lord. `{ lord: 2 }` says it in one clause and says it correctly. Sixth predicate
      // kind to take a PlanetRef, after dignity, strength, aspect.graha, aspect.ontoGraha
      // and lordsConjunct.parties.
      const want = resolveRef(facts, p.lord);
      return want != null && facts.dasha?.[p.level] === want;
    }
    case 'compound': {
      if (p.op === 'not') return !p.of.some((q) => evaluate(q, facts));
      return p.of.some((q) => evaluate(q, facts));
    }
    default: {
      // Exhaustiveness: a new predicate kind must be handled here, not silently ignored.
      const _never: never = p;
      void _never;
      return false;
    }
  }
}

/** True when EVERY predicate holds. An empty list is vacuously true — callers guard. */
export function evaluateAll(ps: Predicate[], facts: ChartFacts): boolean {
  return ps.every((p) => evaluate(p, facts));
}

/**
 * Which predicates held and which did not. The engine shows dissenting evidence
 * rather than hiding it (Programme §4 step 8), so it needs the failures too.
 */
export function explain(ps: Predicate[], facts: ChartFacts): { met: Predicate[]; unmet: Predicate[] } {
  const met: Predicate[] = [];
  const unmet: Predicate[] = [];
  for (const p of ps) (evaluate(p, facts) ? met : unmet).push(p);
  return { met, unmet };
}
