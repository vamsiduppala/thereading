// The aggregators that turn a chart into a `ShadbalaInput`.
//
// `shadbala-pinda.ts` assembles the six components; every one of them needs a quantity nothing
// computed. This supplies three of the four missing ones — the fourth (Cheshta for the five
// tara-grahas) needs mean longitudes and lives in the engine, because it is astronomy.
//
// What was NULL on a real chart before this file existed:
//
//   sthana  — needed a dignity tier in each of the seven vargas   → `saptavargajaTierFor`
//   drik    — needed the aspect pindas summed per planet          → `drikPindas`
//   kala    — computed, but SILENTLY LIGHT: `varshaMasaDinaHoraBala` was getting
//             two of its four lords. Fixed engine-side via true solar ingresses
//             (`solarIngress.ts`), which need no calendar epoch at all.

import type { Graha, SignIndex } from '../types.js';
import { vargaSign } from './varga.js';
import { lordOfSign } from '../rules/predicate.js';
import { MOOLATRIKONA_SIGN, naturalRelationOf, NODE_RELATIONS } from './bphs/ch03.js';
import { temporaryRelation, compoundRelation, type CompoundRelation } from './relationships.js';
import { SAPTAVARGA_DIVISIONS, type SaptavargajaTier } from './bphs/ch27a.js';
import { drishtiValue } from './bphs/ch26a.js';

// ─────────────────────────────────────────────────────────────────────────────
// 27.13 — the four period lords
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The weekday lords, indexed 0 = Sunday. Identical to the engine's `WEEKDAY_LORDS`; the two are
 * asserted equal in the cross-package test rather than one importing the other, because these
 * packages deliberately do not depend on each other.
 */
export const WEEKDAY_LORD_ORDER: Graha[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
];

export const PERIOD_LORDS_ARE_SAURA_NOT_SAVANA =
  'All four period lords are anchored to TRUE SOLAR (Saura) ingresses and to sunrise, NOT to a '
  + 'Savana civil-day count from an epoch. The Savana route — 360-day years, 30-day months, '
  + 'Ahargana from an epoch — is arithmetically sound and the first corpus corroborates the '
  + '360-day year for exactly this purpose, but it carries a FREE PARAMETER: the epoch. A '
  + 'different epoch rotates the varsha and masa lords, which is 45 of Kala bala’s 150 '
  + 'period-lord virupas, so the choice would have been an unforced decision worth a quarter of '
  + 'the component. The Saura route has no such parameter — the Sun’s ingress into a sidereal '
  + 'sign is an observable instant — so the engine computes it and nothing has to be chosen. '
  + 'This also removes any need for intercalation (Adhika Masa) logic, which only arises in the '
  + 'luni-solar calendar and not in the solar one.';

export const VARSHA_MASA_ARE_ENGINE_SIDE =
  'varsha and masa lords require finding the instant the Sun last crossed a sidereal boundary, '
  + 'which is root-finding on an ephemeris and therefore astronomy, not doctrine. They are '
  + 'computed in @aura/engine (`solarIngress.ts`, surfaced through `sunriseFacts`) and arrive '
  + 'here already resolved. What lives in THIS package is the rule about what to do with them.';

// ─────────────────────────────────────────────────────────────────────────────
// 27.2-4 — Saptavargaja bala's dignity tier, in each of the seven divisions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The tier a planet holds in one sign.
 *
 * **Sign-level, deliberately.** BPHS gives moolatrikona as a *degree range* in the rasi
 * (`DIGNITY_BANDS`), but Saptavargaja bala is reckoned across seven divisions, and a varga
 * assigns a sign rather than a meaningful degree within it. Applying the degree bands would
 * make D1 follow a different rule from the other six for no stated reason, so the sign is used
 * throughout and the choice is recorded here.
 *
 * Own-ness is tested as `lordOfSign(sign) === graha` rather than against a list. That matters
 * for the **Moon**, whose moolatrikona is Taurus — a sign it does not own — while the sign it
 * rules is Cancer. A list-based test that conflated the two would score the Moon wrongly in
 * both signs.
 */
export function saptavargajaTierInSign(
  graha: Graha, sign: SignIndex, compound?: SaptavargajaTier,
): SaptavargajaTier {
  if (MOOLATRIKONA_SIGN[graha] === sign) return 'moolatrikona';
  if (lordOfSign(sign) === graha) return 'own';
  if (compound) return compound;
  const lord = lordOfSign(sign);
  const rel = naturalRelationOf(graha, lord) ?? NODE_RELATIONS[graha]?.[lord] ?? null;
  return rel === 'friend' ? 'friend' : rel === 'enemy' ? 'enemy' : 'neutral';
}

/**
 * The `tierFor` callback `saptavargajaBala` expects, for a planet at a longitude.
 *
 * ⚠️ **Two of the seven tiers are unreachable without a compound relationship.**
 * `great-friend` (20) and `great-enemy` (2) need the natural relationship combined with the
 * temporary one, and the temporary half is chart-specific — it cannot come from a longitude.
 * So a caller supplying no `compound` gets five of the seven tiers, and the resulting
 * Saptavargaja bala is bounded but slightly compressed toward the middle. This is the same
 * limitation `vargaViswaTier` (ch 7) documents, and it is stated rather than hidden.
 */
export function saptavargajaTierFor(
  graha: Graha,
  longitude: number,
  compoundFor?: (divisor: number, sign: SignIndex) => SaptavargajaTier | undefined,
): (divisor: number) => SaptavargajaTier {
  return (divisor: number): SaptavargajaTier => {
    const sign = vargaSign(longitude, divisor) as SignIndex;
    return saptavargajaTierInSign(graha, sign, compoundFor?.(divisor, sign));
  };
}

// ── The compound relationship (Panchadha Maitri) — what unlocks the extreme tiers ──

/**
 * The **temporary** relationship of `graha` toward `other`, from their rasi positions.
 *
 * A planet in the 2nd, 3rd, 4th, 10th, 11th or 12th sign from another is its temporary friend;
 * everything else — including the **same sign**, which is the 1st — is a temporary enemy. There
 * is no temporary neutral: the relation is always one or the other, which is why compounding it
 * with a three-valued natural relation yields exactly five tiers rather than seven.
 *
 * ⚠️ **Read in the RASI, for every varga.** The first corpus states this outright: "temporary
 * relationships are based on the rasis occupied by planets". So one compound table applies
 * across all seven divisions rather than being recomputed inside each — recomputing would give a
 * planet different temporary friends in D-1 and D-9 on no authority.
 */
export function temporaryRelationIn(
  graha: Graha, other: Graha, rasiSigns: Partial<Record<Graha, SignIndex>>,
): 'friend' | 'enemy' | null {
  const mine = rasiSigns[graha];
  const theirs = rasiSigns[other];
  if (mine == null || theirs == null) return null;
  const houseFrom = ((((theirs - mine) % 12) + 12) % 12) + 1;
  return temporaryRelation(houseFrom) as 'friend' | 'enemy';
}

/** Every planet that is a temporary friend of `graha` in this chart. */
export function temporaryFriendsOf(
  graha: Graha, rasiSigns: Partial<Record<Graha, SignIndex>>,
): Graha[] {
  return (Object.keys(rasiSigns) as Graha[])
    .filter((g) => g !== graha && temporaryRelationIn(graha, g, rasiSigns) === 'friend');
}

/**
 * The compound (Panchadha Maitri) relationship of `graha` toward `other`.
 *
 * Natural + temporary, scored friend +1 / neutral 0 / enemy −1 and summed:
 *
 *   +2  great-friend (adhimitra)   +1  friend (mitra)   0  neutral (sama)
 *   −1  enemy (shatru)             −2  great-enemy (adhishatru)
 *
 * **This is what makes the extreme tiers reachable at all.** Natural relationships alone top out
 * at friend and enemy, so Saptavargaja bala and Vimsopaka were both compressed toward the middle
 * of their scales until the temporary half arrived.
 *
 * Verified against the first corpus's worked example (ch 3.4.2, Rāma's chart): with the Sun in
 * Aries its temporary friends are Mercury, Moon, Jupiter, Mars and Venus and its only temporary
 * enemy is Saturn; compounding gives the Moon, Mars and Jupiter as adhimitra, Mercury as mitra,
 * and Venus — a natural enemy made a temporary friend — as sama. Each is asserted in the tests
 * against the book's own words.
 */
export function compoundRelationIn(
  graha: Graha, other: Graha, rasiSigns: Partial<Record<Graha, SignIndex>>,
): CompoundRelation | null {
  const temp = temporaryRelationIn(graha, other, rasiSigns);
  if (temp == null) return null;
  const nat = naturalRelationOf(graha, other) ?? NODE_RELATIONS[graha]?.[other] ?? null;
  if (nat == null) return null;
  return compoundRelation(nat, temp);
}

/**
 * The `compoundFor` callback `saptavargajaTierFor` takes, built from a chart's rasi positions.
 *
 * The relationship that matters in each division is between the planet and the **lord of the
 * sign it occupies there** — so the varga supplies the sign, and the rasi supplies the positions
 * the temporary relation is read from.
 */
export function compoundTierFor(
  graha: Graha, rasiSigns: Partial<Record<Graha, SignIndex>>,
): (divisor: number, sign: SignIndex) => SaptavargajaTier | undefined {
  return (_divisor: number, sign: SignIndex): SaptavargajaTier | undefined => {
    const lord = lordOfSign(sign);
    if (lord === graha) return undefined; // 'own' is decided before the compound is consulted
    return compoundRelationIn(graha, lord, rasiSigns) ?? undefined;
  };
}

/**
 * Saptavargaja's tier callback with the compound relationship applied — the full seven tiers.
 *
 * Prefer this over `saptavargajaTierFor` whenever the chart's rasi positions are to hand, which
 * in practice is always. The two-argument form remains for a caller that genuinely holds only a
 * longitude, and it is honest about reaching five tiers rather than seven.
 */
export function saptavargajaTierForChart(
  graha: Graha, longitude: number, rasiSigns: Partial<Record<Graha, SignIndex>>,
): (divisor: number) => SaptavargajaTier {
  return saptavargajaTierFor(graha, longitude, compoundTierFor(graha, rasiSigns));
}

export const COMPOUND_UNLOCKS_THE_EXTREMES =
  'The compound (Panchadha Maitri) relationship is natural + temporary, and it is what makes '
  + '`great-friend` and `great-enemy` reachable at all — natural relationships alone top out at '
  + 'friend and enemy, so both Saptavargaja bala (27.2-4) and Vimsopaka (ch 7) were compressed '
  + 'toward the middle of their scales without it. The temporary half is a pure sign-distance '
  + 'check: 2/3/4/10/11/12 from a planet are its temporary friends, and everything else — '
  + 'INCLUDING its own sign, the 1st — is a temporary enemy. There is no temporary neutral, '
  + 'which is exactly why a three-valued natural relation compounds to five tiers and not seven.';

export const TEMPORARY_IS_READ_IN_THE_RASI =
  'The temporary relationship is read from the RASI positions, and one compound table is applied '
  + 'across all seven divisions. The first corpus states the basis outright — "temporary '
  + 'relationships are based on the rasis occupied by planets" — so recomputing it inside each '
  + 'varga would give a planet different temporary friends in D-1 and D-9 on no authority.';

export const SAPTAVARGAJA_COMPOUND_GAP =
  'Without a compound relationship, `great-friend` (20 virupas) and `great-enemy` (2) can never '
  + 'be reached, so Saptavargaja bala computed from a longitude ALONE is compressed toward the '
  + 'middle of its range. That is a limitation of the two-argument `saptavargajaTierFor`, NOT of '
  + 'the module: `saptavargajaTierForChart` supplies the compound relationship from the chart’s '
  + 'rasi positions and reaches all seven tiers. The narrow form is kept for a caller that '
  + 'genuinely holds only a longitude. The seven divisions are '
  + SAPTAVARGA_DIVISIONS.join(', ') + '.';

// ─────────────────────────────────────────────────────────────────────────────
// 27.19 — Drik bala's aspect pindas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Natural malefics for Drik bala. The **Sun is a malefic here** — this is the natural
 * classification, not the functional one, and it is not the `isBeneficForPaksha` set.
 */
export const DRIK_MALEFICS: Graha[] = ['sun', 'mars', 'saturn'];

/**
 * Natural benefics *other than* Mercury and Jupiter, which 27.19 handles separately.
 * The Moon joins this set only when waxing — see `drikPindas`.
 */
export const DRIK_BENEFICS: Graha[] = ['venus'];

/**
 * Mercury and Jupiter, whose aspects 27.19 says to "super add … entire" rather than quarter.
 *
 * **This is what makes Drik bala computable at all.** Mercury's benefic status is otherwise
 * chart-dependent — benefic when unafflicted, malefic when joined to malefics — and that
 * dependency is one of the standing DSL gaps. Because the verse pulls Mercury out into its own
 * bucket, the question never has to be answered for this component.
 */
export const DRIK_FULL_ASPECT: Graha[] = ['mercury', 'jupiter'];

export interface DrikPinda {
  /** Drishti virupas cast by benefics, EXCLUDING Mercury and Jupiter. */
  benefic: number;
  malefic: number;
  /** Cast by Mercury and Jupiter, added in full rather than quartered. */
  mercuryJupiter: number;
}

export interface DrikPindaOptions {
  /**
   * Whether the Moon counts as a benefic — true when waxing. Required rather than defaulted:
   * the Moon is a benefic for half of all charts and a malefic for the other half, and
   * guessing would bias every Drik bala in the same direction.
   */
  moonIsBenefic: boolean;
}

/**
 * The three aspect pindas each planet RECEIVES, for `drikBala` (27.19).
 *
 * Sums `drishtiValue` from every other planet onto each planet in turn. Mars, Jupiter and
 * Saturn cast on their own special curves (26.9-12); everything else uses the general one.
 *
 * ⚠️ **The nodes are excluded**, and that is a decision. Chapter 26 gives drishti curves for
 * the seven grahas; whether and how Rahu and Ketu aspect is a separate and contested question
 * which this corpus does not settle (the node-argala direction is a standing open thread). A
 * node included on the general curve would look like a measurement and would not be one.
 *
 * A planet does not aspect itself — the 0° case is excluded explicitly rather than relying on
 * `drishtiValueGeneral` returning 0 there, because Saturn's and Mars's curves are not the
 * general one and a self-aspect would be a category error regardless of the number.
 */
export function drikPindas(
  positions: Partial<Record<Graha, number>>,
  opts: DrikPindaOptions,
): Partial<Record<Graha, DrikPinda>> {
  const grahas = (Object.keys(positions) as Graha[])
    .filter((g) => g !== 'rahu' && g !== 'ketu' && positions[g] != null);

  const bucketOf = (g: Graha): keyof DrikPinda | null => {
    if (DRIK_FULL_ASPECT.includes(g)) return 'mercuryJupiter';
    if (DRIK_MALEFICS.includes(g)) return 'malefic';
    if (DRIK_BENEFICS.includes(g)) return 'benefic';
    if (g === 'moon') return opts.moonIsBenefic ? 'benefic' : 'malefic';
    return null;
  };

  const out: Partial<Record<Graha, DrikPinda>> = {};
  for (const target of grahas) {
    const pinda: DrikPinda = { benefic: 0, malefic: 0, mercuryJupiter: 0 };
    for (const aspector of grahas) {
      if (aspector === target) continue;
      const bucket = bucketOf(aspector);
      if (!bucket) continue;
      pinda[bucket] += drishtiValue(aspector, positions[aspector]!, positions[target]!);
    }
    out[target] = pinda;
  }
  return out;
}

export const DRIK_NODES_EXCLUDED =
  'Rahu and Ketu cast no drishti here. Chapter 26 gives aspect curves for the SEVEN grahas; '
  + 'whether the nodes aspect, and how, is a separate question this corpus does not settle — '
  + 'the node-argala direction is a standing open thread for the same reason. Running a node '
  + 'through the general curve would produce a number that looked like a measurement and was '
  + 'not one.';

export const DRIK_SIDESTEPS_MERCURY =
  'Mercury’s benefic status is chart-dependent — benefic unafflicted, malefic when joined to '
  + 'malefics — and that dependency is one of the standing DSL gaps. 27.19 pulls Mercury and '
  + 'Jupiter into their own bucket ("super add the entire aspect"), so for THIS component the '
  + 'question never has to be answered. The Moon’s status is not so lucky: waxing it is benefic '
  + 'and waning malefic, which is why `moonIsBenefic` is required rather than defaulted.';

export const WHAT_STILL_LIMITS_SHADBALA =
  'With these aggregators and the engine’s Cheshta inputs and solar ingresses, all six '
  + 'components compute and BOTH earlier soft limits are gone. The epoch went when the period '
  + 'lords moved to true solar ingresses; the compressed dignity scale went when the compound '
  + 'relationship landed. What remains is a convention rather than a gap: the hora has an equal '
  + '(Indian) and an unequal (Western) reading, both implemented and named, the equal one being '
  + 'the default.';
