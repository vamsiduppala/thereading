// ─────────────────────────────────────────────────────────────────────────────
// BPHS extraction programme routes — docs/BPHS_PROGRAMME.md.
//
// Kept out of server.ts on purpose: the programme runs to 51 parts, and folding every
// part's routes into one file would push it past the point where anyone can read it.
// Each part appends its section here (or a sibling module) and nothing else moves.
//
// Part 1 (Chapter 3) upgrades dignity from a whole-sign label to a degree-bounded,
// graded quantity, and adds the predicate engine every later part writes into.
// ─────────────────────────────────────────────────────────────────────────────

import type { FastifyInstance } from 'fastify';
import {
  GRAHAS,
  // Post-programme: the Shadbala assembler and the Mahapurusha grade it enables.
  shadbalaPinda, shadbalaVerdictOf, bhavaMadhya, bhavaSandhi, BHAVA_MADHYA_CONVENTION,
  gradeMahapurusha, BALIBHIH_IS_A_CONDITION, YOGA_IS_GRADED_NOT_DELETED,
  REAL_RATE_JUSTIFIES_THE_CONDITION, SHADBALA_INPUTS_STILL_MISSING,
  INCOMPLETE_TOTALS_ARE_NEVER_JUDGED,
  // Part 51 — the last. Ch 9 refused, ch 10's antidotes surfaced without it.
  BPHS_STATES_ITS_OWN_ABSTENTION, CH09_REFUSED, arishtaCancellationRules,
  CANCELLATIONS_FAIL_AS_ASSERTIONS, CH10_ENCODED_WITHOUT_CH09,
  ANTIDOTE_MECHANISM_OUTLIVED_ITS_SOURCE, MARAKA_DERIVATION,
  LONGEVITY_COMPUTED_NEVER_SURFACED,
  // Part 50 — chapters 84-96, the remedial block.
  REMEDIAL_VOCABULARY_COUNTS, STANDING_CONSTRAINT_EMPTIES_THIS_BLOCK, REMEDIAL_CHAPTERS,
  MAP_KEPT_RECIPE_REFUSED, CH96_INSTRUCTS_HARM, BIRTH_TREATED_AS_MISFORTUNE,
  // Part 49 — chapter 83, refused.
  BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND, CURSE_SOURCES, CH83_ARCHITECTURE,
  COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED, CH83_RITUAL_REMEDIES_REFUSED, CH83_REFUSED,
  // Part 48 — chapters 80-82, refused.
  STRONGER_OF_LAGNA_OR_MOON, STRENGTH_RESOLVES_TWO_REFERENCE_POINTS, CH80_REFUSED_VERSES,
  LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE, CH80_REFUSED, SAME_INSTRUMENTS_DIFFERENT_SUBJECT,
  CH81_82_EXCLUDED,
  // Part 47 — chapters 78-79.
  RECTIFICATION_CASCADE, RITU_SUBSTITUTIONS, RITU_SUBSTITUTION_IS_ONE_DIRECTIONAL,
  samvatsaraCandidates, RECTIFICATION_NEEDS_AN_OUTSIDE_FACT, CH78_IS_RECTIFICATION_NOT_PRASHNA,
  YUDDHA_ORB_DEGREES, grahaYuddhaVictor, YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL,
  asceticYogaRules, STELLIUM_STRENGTH_NOT_ENCODED, ASCETIC_ORDER_BY_STRONGEST,
  ASCETIC_ORDERS_ARE_DATA_NOT_A_READING, CH79_PROXY_RULES_WITHHELD, CH79_VARGA_CLAUSE_GAP,
  CH79_REMAINING_CLAUSES_NOT_ENCODED,
  // Part 46 — chapters 75-77. Phase V.
  MAHAPURUSHA_YOGAS, mahapurushaRules, MAHAPURUSHA_STRENGTH_CONDITION_MISSING,
  MAHAPURUSHA_STRENGTH_IMPACT, CH75_DESCRIPTIONS_REFUSED, ELEMENT_OF_PLANET,
  ELEMENT_MAPPING_IS_STATED_FOUR_TIMES, dominantElement,
  CH76_TEMPERAMENT_DESCRIPTIONS_REFUSED, GUNA_OF_PLANET, dominantGuna,
  CH77_CLASS_HIERARCHY_REFUSED,
  // Part 45 — chapter 65, the order that confirmed the savya wheel.
  CH65_BLOCKS, ch65BlockSequence, CH65_ORDER_CONFIRMS_SAVYA_24,
  CELLS_ARE_KEYED_BY_WHEEL_POSITION, CH65_READINGS_REFUSED, CH65_RITUAL_REMEDY_REFUSED,
  // Part 44 — chapter 64, the Kalachakra antardasa.
  RASI_YEARS_CONFIRMED_INDEPENDENTLY, RASI_YEARS_ARE_A_PER_RASI_CONSTANT,
  ARIES_AMSA_TABLE_HAS_ONE_FAULT, KALACHAKRA_FRIENDSHIP_RULE, kalachakraAntarVerdict,
  SAVYA_ONLY_HABIT_SUPPORTS_CANDIDATE_ONE, CH64_EFFECT_PROSE_REFUSED, CH64_RASI_YEARS,
  // Part 43 — chapters 62-63, the sookshma and prana levels.
  SUBDIVISION_RECURSES_AT_EVERY_LEVEL, SOOKSHMA_PRANA_SPANS,
  SPANS_ARE_BELOW_THE_BIRTH_TIME_RESOLUTION, NO_CELL_STATES_A_CONDITION,
  NO_DEFEASIBILITY_CLAUSE_HERE, CH62_63_EFFECTS_REFUSED, SOOKSHMA_PRANA_STILL_COMPUTABLE,
  // Part 42 — chapter 61, the pratyantar.
  PRATYANTAR_FORMULA_VERIFIED, PRATYANTAR_TABLE_FAULTS_ARE_DIGIT_LEVEL,
  COLUMN_ORDER_CONFIRMS_51_2, PRATYANTAR_EFFECTS_ARE_DEFEASIBLE, CH61_EFFECTS_REFUSED,
  PRATYANTAR_WHAT_WE_OFFER_INSTEAD, PRATYANTAR_ORDER,
  // Part 41 — chapters 57-60, and the hypothesis they refuted.
  ANTARDASA_CELLS_57_60, antardasaCellRules57, ENMITY_AXIS_REFUTED,
  ATTRIBUTION_HELD_ON_A_WORSE_SOURCE, SHAPE_IS_CLEANER_HERE, CELLS_57_60_COVERAGE,
  REFUSALS_57_60,
  // Part 40 — chapters 52-56, the 45 maha×antar cells.
  ANTARDASA_CELLS, antardasaCellRules, ANTARDASA_FRAME_IS_THE_DASHA_LORD,
  ANTARDASA_CONDITION_SHAPE, MARS_SATURN_BREAKS_THE_SHAPE, HEADINGS_RECOVERED_BY_CH51_ORDER,
  CELLS_WITHOUT_A_HOUSE_CONDITION, RITUAL_REMEDIES_NOT_CARRIED, MARAKA_RIDER_DROPPED,
  MEDICAL_CLAIMS_DROPPED,
  // Part 39 — chapter 51, antardasa in five systems.
  SUBDIVISION_VERIFIED, antardasaShortcut, SHORTCUT_IS_EXACT, ANTARDASA_TABLE_FAULTS,
  charaPlanetAntardasaYears, CHARA_PLANET_ANTARDASA_IS_EQUAL,
  rasiAntardasaYears, rasiAntardasaOrder, RASI_ANTARDASA_ORDER_RULE,
  DUAL_ORDER_COUNTS_IN_THE_DIRECTION_OF_TRAVEL, SEED_IS_THE_STRONGER_OF_TWO,
  bhogaRasi, PAKA_BHOGA_PARITY_CLAUSE_UNRESOLVED, pakaBhogaVerdict,
  kalachakraAntardasaYears, KALACHAKRA_ANTARDASA_TOTAL_IS_100,
  PACHAKA_SHARES, PINDA_SUBDIVISION_RECORDED_NOT_SURFACED,
  CH51_TRANSLATOR_RECONSTRUCTED_13_16,
  // Part 38 — chapters 47-50, the join between the rule corpus and the timing layer.
  HOUSE_LORD_DASHA, houseLordDashaRules, CONDITION_OUTRANKS_NATURE,
  DASHA_EFFECT_TAXONOMY, DASHA_FAVOURABLE_SHAPE, MARAKA_ROWS_USE_THE_CHAPTERS_OWN_ALTERNATIVE,
  CH48_COMMENTARY_DISAGREES_WITH_CH34, DASHA_START_CHART_IS_A_GAP, DASHA_LORD_IS_A_PLANETREF,
  charaHouseVerdict, charaRasiVerdict, WITHIN_PERIOD_SPLIT_IS_NEW,
  CHARA_UPACHAYA_INVERSION, CHARA_COUNTS_FROM_THE_DASHA_RASI, CH49_TABLE_NOT_ENCODED,
  evaluateAll, explain as explainPredicates, fired, rank,
  DEEP_EXALTATION_POINTS, exaltationCloseness, bandFor, MOOLATRIKONA_SIGN,
  naturalRelationOf, NODE_RELATIONS, effectRatio, BENEFIC_RATIO, MALEFIC_RATIO,
  PLANET_TIME_UNIT, NAISARGIKA_ORDER, naisargikaBala, DIG_BALA_HOUSE,
  DAY_NIGHT_STRENGTH, PAKSHA_AYANA_RULE, QUERY_CLASS, PLANET_ABODE,
  pranaPada, pranaPadaFromLagna, minutesToVighatis, PRANAPADA_GOOD_HOUSES,
  UPAGRAHA_FORMULA_CONFLICT, UPAGRAHA_DIGNITIES, GULIKA_LONGITUDE_RULE,
  CLASSICAL_SEVEN,
  // Part 2 — chapters 4 and 5.
  RISING_TYPE, RISING_TYPE_NOTES, isSirshodaya, isDiurnal, ambulationClass, SIGN_HUMOUR,
  KALAPURUSHA_LIMBS, limbOfSign,
  nisheka, isBelowHorizon, rectifyFromAdhana, birthHalfFromAdhana,
  MINUTES_PER_GHATI, minutesToGhatis, GHATIS_PER_SIGN,
  bhavaLagnaBphs, horaLagnaBphs, ghatikaLagnaBphs,
  LAGNA_REFERENCE_USE, bhavaAgreement, cuspStrength,
  varnadaCount, varnada, varnadaOfHouse, varnadaDashaOrder,
  // Part 3 — chapter 6a.
  SHODASAVARGA, NON_BPHS_DIVISORS, isShodasavarga, VARGA_START, vargaStartSign,
  bphsHoraLord, navamsaClass, NAVAMSA_CLASS_MEANING, NAVAMSA_CLASS_NOTE,
  dasamsaRuler, DASAMSA_DIRECTION_LORDS, drekkanaSage, vargaSign,
  // Part 4 — chapter 6b.
  TRIMSAMSA_ODD, TRIMSAMSA_EVEN, trimsamsaPart,
  shashtiamsa, SHASHTIAMSA_NOTES,
  VARGA_SCHEMES, VARGA_DESIGNATIONS, DASAVARGA_ALIASES,
  GOOD_VARGA_CRITERIA, ARUDHA_CRITERION_DEFAULT, classifyVarga,
  // Cross-part composition (Programme §8.1 retrofit).
  gradeVarga,
  // Part 5 — chapter 7.
  VIMSOPAKA_WEIGHTS, VARGA_VISWA, vimsopakaBala, VIMSOPAKA_BANDS,
  VIMSOPAKA_EXALTATION_NOTE, VIMSOPAKA_FLOOR_NOTE, VIMSOPAKA_MINIMUM,
  sunDistanceStrength, SUN_DISTANCE_NOTE, VARGA_USE, VARGA_LORD_RULES,
  HOUSE_CATEGORIES, categoriesOfHouse,
  // Part 6 — chapters 8 and 11.
  rasiAspects, RASI_VS_GRAHA_DRISHTI, BPHS_HOUSE_INDICATIONS,
  UNSURFACED_HOUSE_INDICATIONS, lordInFavourableAvastha, HOUSE_PROSPERITY_VETO,
  SPOILING_LORDSHIPS, houseProsperityRules, HOUSE_PROSPERITY_NOT_YET_EXPRESSIBLE,
  // Part 7 — chapter 26a.
  ASPECT_QUARTERS, SPECIAL_FULL_ASPECTS, aspectQuarters, aspectAngle,
  drishtiValue, drishtiQuarters, drishtiRupas, VIRUPAS_PER_RUPA,
  DRISHTI_DISCONTINUITY_NOTE, GRADED_ASPECT_NOTE,
  // Part 9 — chapter 27a (Shadbala I).
  SHADBALA_PLANETS, SHADBALA_COMPONENTS, STHANA_COMPONENTS, shadbalaUchchaBala,
  SAPTAVARGAJA_VIRUPAS, SAPTAVARGA_DIVISIONS, SAPTAVARGAJA_MAX, saptavargajaBala,
  ojhayugmarasiamsaBala, kendradiBala, drekkanaBala, sthanaBala,
  STHANA_BALA_MAX, VIRUPAS_PER_RUPA_27, VS_ENGINE_PLANET_STRENGTH,
  type SaptavargajaTier,
  // Part 10 — chapter 27b (Shadbala II).
  foldedArcBala, DIG_BALA_ZERO_HOUSE, DIG_BALA_STRONG_HOUSE, digBala,
  NIGHT_STRONG, DAY_STRONG, nathonnathaBala, pakshaBala,
  TRIBHAGA_DAY, TRIBHAGA_NIGHT, tribhagaBala,
  PERIOD_LORD_VIRUPAS, varshaMasaDinaHoraBala,
  naisargikaBalaVirupas, ayanaBala, ayanaKranti, bhujaFromEquinox,
  KALA_BALA_MAX, KALA_SUBCOMPONENTS, kalaBala,
  // Part 11 — chapter 27c (Shadbala III).
  SHADBALA_SIX, drikBala, DRIK_BALA_AMBIGUITY,
  YUDDHA_PLANETS, grahaYuddha, YUDDHA_WINNER_NOTE,
  MOTION_STRENGTHS, MOTION_ORDER,
  cheshtaKendra, cheshtaBalaTara,
  bhavaReferenceAngle, bhavaDigBala, bhavaBala,
  SHADBALA_REQUIRED, shadbalaVerdict, COMPONENT_MINIMUMS,
  componentGroupOf, meetsComponentMinimums,
  STRONGEST_PLANET_DELIVERS, CH27_NOT_ENCODED,
  type MotionKind, type ComponentCheck,
  type VargaScheme, type VargaDisqualifier,
  type Graha, type ChartFacts, type Predicate, type Rule, type DignityState,
  // Part 12 - chapter 28 (Ishta and Kashta bala).
  uchchaRasmi, cheshtaRasmi, cheshtaKendraSun, cheshtaKendraMoon, CHESHTA_KENDRA_SOURCE,
  rasmiFromBala, balaFromRasmi, subhaRasmi, asubhaRasmi,
  ishtaPhala, kashtaPhala, ishtaKashtaOf, ishtaKashtaOfBala, ANY_BALA_IS_ITS_OWN_ISHTA,
  SUBHANKA, SUBHANKA_ORDER, subhanka, asubhanka, tierVerdict,
  SUBHANKA_SAPTAVARGA_MAX, SUBHANKA_VS_SAPTAVARGAJA,
  balaShares, attributeIshta, VERSE_13_CONFLICT,
  aspectIshtaKashta, bhavaEffect, twoSignBhava, CH28_NOT_ENCODED,
  ISHTA_KASHTA_PLANETS,
  type SubhankaTier, type BhavaContributor,
  // Part 12 - chapters 29-31 (Bhava Padas, Upa Pada, Argala).
  bhavaPada, PADA_EXCEPTION_RULE, PADA_NAMES, padaRelation,
  PADA_GAIN_HOUSE, PADA_LOSS_HOUSE,
  upapada, upapadaHouse, UPAPADA_CONVENTION_CONFLICT, UPAPADA_DETAIL_HOUSE,
  ARGALA_PAIRS, ARGALA_COUNTED_FROM, ARGALA_TIMING, ARGALA_HOUSE_EFFECT,
  ARGALA_ROYAL_HOUSES, NODE_ARGALA_REVERSED,
  resolveArgala, vipareetaArgala, VIPAREETA_ARGALA_HOUSE,
  argalaQuarterCancelled, quarterOf, QUARTER_DEGREES,
  CH29_31_UNSURFACED, CH29_31_NOT_YET_EXPRESSIBLE, JAIMINI_LAYER_NOTE,
  type UpapadaConvention, type SignIndex,
  // Part 13 - chapter 66a (Ashtakavarga: Sun, Moon, Mars).
  AV_TABLE, AV_PLANETS, AV_REFS, rekhaFromKarana,
  avRowTotal, avPlanetTotal, BPHS_AV_PLANET_TOTALS, AV_GRAND_TOTAL,
  KARANA_VS_REKHA, CH66_VERIFICATION, WHY_ASHTAKAVARGA_EXISTS, CH66_REMAINING,
  type AVPlanet,
  // Part 14 - chapter 66b (Ashtakavarga: Mercury, Jupiter, Venus).
  CH66B_TRANSCRIBED, CH66B_KARANA_COUNTS, CH66B_VERIFICATION,
  CH66_EDITION_FAULTS, CH66B_REMAINING, karanaCounts, rekhaTotal,
  // Part 15 - chapter 66c (Ashtakavarga: Saturn, and the Ascendant's own).
  CH66_SATURN_REKHA, CH66_LAGNA_REKHA, CH66_LAGNA_KARANA_COUNTS,
  LAGNA_AV_TOTAL, LAGNA_AV_IS_NOT_IN_SAV, lagnaAshtakavarga,
  LAGNA_ASC_ROW_COINCIDENCE, CH66C_VERIFICATION, CH66_FAULT_RATE_NOTE,
  // Part 16 - chapters 67-69 (the ashtakavarga reductions).
  REDUCTION_ORDER, REDUCTION_ORDER_IS_STATED, TRIKONA_RULE,
  CH68_ILLUSTRATION, EKADHIPATYA_RULES, EKADHIPATYA_CORPUS_CONFLICT,
  RASI_MULTIPLIER_CONFLICT, GRAHA_MULTIPLIER_CONFLICT, CH69_WORKED_EXAMPLE,
  CH67_69_VERIFICATION, REDUCTIONS_INCLUDE_LAGNA,
  trikonaSodhana, ekadhipatyaSodhana, sodhitaAshtakavarga, sodhyaPinda,
  // Part 17 - chapter 70 (effects keyed to bindu counts).
  AV_MATTERS, AV_MATTER_HOUSE, MARS_HOUSE_UNSTATED,
  avTrigger, TRIGGER_PLANET, TRIGGER_FORMULA_NOTE,
  transitVerdict, TRANSIT_MIDPOINT, TRANSIT_THRESHOLD_IS_OURS, ELECTION_RULE,
  childrenIndication, ashtakavargaEffectRules, CH70_NOT_ENCODED,
  // Part 18 - chapters 72-74 (aggregate AV, rays, Sudarshana chakra).
  samudayaBand, SAMUDAYA_FAVOURABLE_ABOVE, SAMUDAYA_ADVERSE_BELOW,
  SAV_MEAN_PER_SIGN, prosperityConfiguration, LIFE_STAGES, lifeStageOfHouse,
  stageVerdict, AV_OUTRANKS_TRANSIT,
  RAYS_AT_EXALTATION, RAYS_TOTAL_MAX, RAYS_VS_CH28_RASMI, planetRays,
  RAY_DIGNITY_FACTOR, correctedRays, raysAfterCombustion, rayCapacityBand,
  SUDARSHANA_FRAMES, sudarshanaSigns, sudarshanaAgreement, majorityInfluence,
  SUN_BENEFIC_IN_FIRST_ONLY, EMPTY_HOUSE_FALLBACK, CH72_74_SUMMARY,
  // Part 19 - the arbitration ordering and base-rate calibration.
  ARBITRATION_ORDER, ARBITRATION_WEIGHTS, WEIGHTS_ARE_OURS,
  CONFIDENCE_CEILING, CONFIDENCE_NEVER_CERTAIN, ARBITRATION_OPEN,
  arbitrate, calibrate, syntheticCharts, withBaseRates,
  SYNTHETIC_CHARTS_ARE_UNIFORM, GENERATOR_MUST_FEED_EVERY_FRAME,
  padaWealthRules, upapadaRules, allEncodedRules,
  // Part 20 - chapters 12-13 (1st and 2nd house effects). Phase III begins.
  firstHouseRules, secondHouseRules, readFrom,
  KENDRAS, TRIKONAS, READ_FROM_THE_MOON_TOO, PHASE_III_RHYTHM,
  BACKGROUND_RULES_ARE_KEPT, CH12_13_EXCLUDED, CH12_13_UNSURFACED,
  CH12_13_NOT_YET_EXPRESSIBLE,
  // Part 21 - chapters 14-16 (3rd, 4th and 5th house effects).
  thirdHouseRules, fourthHouseRules, fifthHouseRules,
  JUDGE_BY_STRENGTH_FIRST, CHILD_TIMING_INDICATIONS, CHILD_TIMING_NOTE,
  CH14_16_YIELD, CH14_16_EXCLUDED, CH14_16_UNSURFACED,
  CH14_16_NOT_YET_EXPRESSIBLE, PHASE_III_YIELD_VARIES,
  // Part 22 - chapters 17-18 (6th and 7th houses) + the lordsConjunct retrofit.
  sixthHouseRules, seventhHouseRules, lordConjunctionRules,
  MARRIAGE_TIMING, SURFACEABLE_MARRIAGE_AGE, surfaceableTimings, surfaceableAges,
  MARRIAGE_AGE_POLICY, CH17_18_YIELD, CH17_18_EXCLUDED, CH17_18_UNSURFACED,
  CH17_18_NOT_YET_EXPRESSIBLE, LORDS_CONJUNCT_CLOSED_A_GAP,
  // Part 23 - chapters 19-21 (8th, 9th and 10th houses).
  eighthHouseRules, ninthHouseRules, tenthHouseRules,
  VIPAREETA_READING, FORTUNE_TIMING, STRENGTH_PREDICATE_NOW_USABLE,
  CH19_21_YIELD, CH19_21_EXCLUDED, CH19_21_UNSURFACED, CH19_21_NOT_YET_EXPRESSIBLE,
  expectedBaseRate, isSuspiciouslyRare, SUSPECT_THRESHOLD_SCALES_WITH_ARITY, arity,
  // Part 24 - chapters 22-23 (11th and 12th houses). All twelve encoded.
  eleventhHouseRules, twelfthHouseRules, readFromHouse,
  BHAVAT_BHAVAM, MATTER_HOUSE, GAIN_TIMING, NISHKA_AMOUNTS_NOT_SURFACED,
  VISIBLE_HALF_HOUSES, INVISIBLE_HALF_HOUSES, MANIFESTATION_NOTE,
  CH22_23_YIELD, CH22_23_EXCLUDED, CH22_23_UNSURFACED,
  CH22_23_NOT_YET_EXPRESSIBLE, HOUSE_BLOCK_COMPLETE,
} from '@aura/knowledge';

/** A finite number from a query param, or null if absent/blank/non-numeric. */
function qNum(v: string | undefined): number | null {
  if (v == null || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function registerBphsRoutes(app: FastifyInstance): void {
  // ── Chapter 3 — dignity, relationships, timing seeds ───────────────────────

  /** Deep exaltation/debilitation points, and closeness to them (3.49-50). */
  app.get('/bphs/exaltation', async (req, reply) => {
    const q = req.query as { graha?: string; longitude?: string };
    if (!q.graha) {
      return { points: DEEP_EXALTATION_POINTS, use: 'pass ?graha= and optional &longitude= for a 0..1 closeness' };
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const point = DEEP_EXALTATION_POINTS[q.graha] ?? null;
    const lon = qNum(q.longitude);
    return {
      graha: q.graha,
      point,
      closeness: lon == null ? null : exaltationCloseness(q.graha as Graha, lon),
      note: point ? undefined : 'BPHS gives no agreed exaltation for the nodes, so none is asserted',
    };
  });

  /** Degree-bounded dignity band (3.51-54). A sign can hold two or three states. */
  app.get('/bphs/dignity-band', async (req, reply) => {
    const q = req.query as { graha?: string; sign?: string; degree?: string };
    const sign = qNum(q.sign);
    const deg = qNum(q.degree);
    if (!q.graha || sign == null || deg == null) {
      return reply.code(400).send({ error: 'graha, sign (0-11) and degree (0-30, within the sign) are required' });
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const band = bandFor(q.graha as Graha, sign, deg);
    return {
      graha: q.graha, sign, degree: deg, band, state: band?.state ?? null,
      note: band ? undefined : 'no band applies here — dignity falls to the relationship scheme',
    };
  });

  /** Natural relationship DERIVED from moolatrikona (3.55), not read off a table. */
  app.get('/bphs/relation', async (req, reply) => {
    const q = req.query as { from?: string; to?: string };
    if (!q.from || !q.to) return reply.code(400).send({ error: 'from and to (graha keys) are required' });
    if (!GRAHAS[q.from] || !GRAHAS[q.to]) return reply.code(404).send({ error: 'unknown graha' });
    const derived = naturalRelationOf(q.from as Graha, q.to as Graha);
    return {
      from: q.from,
      to: q.to,
      relation: derived ?? NODE_RELATIONS[q.from]?.[q.to as Graha] ?? null,
      derivedFromMoolatrikona: derived != null,
      moolatrikonaSign: MOOLATRIKONA_SIGN[q.from] ?? null,
      source: derived != null
        ? 'bphs.03.055 — root text, derived from the moolatrikona rule'
        : 'bphs.03.055 notes — commentary; the nodes have no moolatrikona to derive from',
    };
  });

  /** Ratio of effects (3.59-60) — the text's own numeric dignity scalar. */
  app.get('/bphs/effect-ratio', async (req, reply) => {
    const q = req.query as { dignity?: string; combust?: string };
    if (!q.dignity) {
      return reply.code(400).send({
        error: 'dignity is required',
        allowed: Object.keys(BENEFIC_RATIO),
        scales: { benefic: BENEFIC_RATIO, malefic: MALEFIC_RATIO },
      });
    }
    if (!(q.dignity in BENEFIC_RATIO)) {
      return reply.code(400).send({ error: 'unknown dignity', allowed: Object.keys(BENEFIC_RATIO) });
    }
    const combust = q.combust === 'true';
    return { dignity: q.dignity, combust, ...effectRatio(q.dignity as DignityState, { combust }) };
  });

  /** Prana-pada (3.71-74). Advances a full sign roughly every 6 minutes of clock time. */
  app.get('/bphs/prana-pada', async (req, reply) => {
    const q = req.query as {
      vighatis?: string; minutesSinceSunrise?: string; sunLong?: string; lagnaSign?: string;
    };
    const sunLong = qNum(q.sunLong);
    const mins = qNum(q.minutesSinceSunrise);
    const vig = qNum(q.vighatis) ?? (mins == null ? null : minutesToVighatis(mins));
    if (sunLong == null || vig == null) {
      return reply.code(400).send({
        error: 'sunLong (0-360) and either vighatis or minutesSinceSunrise are required',
      });
    }
    const base = pranaPada(vig, sunLong);
    const lagna = qNum(q.lagnaSign);
    const out = lagna == null ? base : pranaPadaFromLagna(base, lagna);
    return {
      ...out,
      goodHouses: PRANAPADA_GOOD_HOUSES,
      caution: 'Prana-pada advances a full sign about every 6 minutes of clock time. '
        + 'Treat any Prana-pada claim as void unless the birth time is known to the minute.',
    };
  });

  /** Event-maturity time unit per planet (3.33; nodes 3.46) — the classical "how soon". */
  app.get('/bphs/time-unit', async (req, reply) => {
    const q = req.query as { graha?: string };
    if (!q.graha) return { units: PLANET_TIME_UNIT };
    const u = PLANET_TIME_UNIT[q.graha];
    if (!u) return reply.code(404).send({ error: 'unknown graha' });
    return { graha: q.graha, ...u };
  });

  /** Strength seeds from 3.35-38 — the inputs Shadbala (Parts 9-11) will build on. */
  app.get('/bphs/strength-seeds', async () => ({
    naisargikaOrder: NAISARGIKA_ORDER,
    naisargikaBala: Object.fromEntries(CLASSICAL_SEVEN.map((g) => [g, naisargikaBala(g)])),
    digBalaHouse: DIG_BALA_HOUSE,
    dayNight: DAY_NIGHT_STRENGTH,
    pakshaAyana: PAKSHA_AYANA_RULE,
    note: 'Seeds only. Full six-fold Shadbala arrives with Programme Parts 9-11 (ch 27).',
  }));

  /** Horary helpers: subject class (3.47) and where a matter is found (3.32). */
  app.get('/bphs/horary-class', async () => ({
    queryClass: QUERY_CLASS,
    abode: PLANET_ABODE,
    note: 'Used by Programme Part 47 (ch 78, lost horoscopy) to read an unstated question.',
  }));

  /** The recorded upagraha formula conflict + upagraha dignities (3.61-69). */
  app.get('/bphs/upagraha-notes', async () => ({
    conflict: UPAGRAHA_FORMULA_CONFLICT,
    dignities: UPAGRAHA_DIGNITIES,
    gulikaLongitude: GULIKA_LONGITUDE_RULE,
  }));

  // ── The predicate engine ───────────────────────────────────────────────────

  const badFacts = (f: unknown): boolean => {
    const facts = f as ChartFacts | undefined;
    return !facts || typeof facts.lagnaSign !== 'number' || !facts.planets;
  };

  /** Evaluate predicates against a chart snapshot. POST { facts, predicates }. */
  app.post('/rules/evaluate', async (req, reply) => {
    const b = req.body as { facts?: ChartFacts; predicates?: Predicate[] };
    if (badFacts(b?.facts)) {
      return reply.code(400).send({
        error: 'facts { lagnaSign (0-11), planets { graha: { sign, house, longitude } } } is required',
      });
    }
    if (!Array.isArray(b.predicates) || b.predicates.length === 0) {
      return reply.code(400).send({ error: 'predicates must be a non-empty array' });
    }
    const { met, unmet } = explainPredicates(b.predicates, b.facts!);
    return { all: evaluateAll(b.predicates, b.facts!), met, unmet };
  });

  /** Fire a rule set against a chart and rank the hits. POST { facts, rules }. */
  app.post('/rules/fire', async (req, reply) => {
    const b = req.body as { facts?: ChartFacts; rules?: Rule[] };
    if (badFacts(b?.facts)) {
      return reply.code(400).send({ error: 'facts { lagnaSign, planets } is required' });
    }
    if (!Array.isArray(b.rules)) return reply.code(400).send({ error: 'rules must be an array' });
    const bad = b.rules.find((r) => !r?.id || !Array.isArray(r.when));
    if (bad) return reply.code(400).send({ error: 'every rule needs an id and a `when` array' });
    const hits = rank(fired(b.rules, b.facts!));
    return {
      considered: b.rules.length,
      fired: hits.length,
      hits: hits.map((h) => ({
        id: h.rule.id,
        arity: h.arity,
        source: h.rule.source,
        effect: h.rule.effect,
        weight: h.rule.weight,
        verification: h.rule.verification,
        baseRate: h.rule.baseRate ?? null,
        met: h.met,
      })),
    };
  });

  // ── Chapters 4-5 — sign classification, special ascendants, Varnada ────────

  /** Rising type, day/night strength, ambulation class and humour for a sign (4.4-24). */
  app.get('/bphs/sign-class', async (req, reply) => {
    const q = req.query as { sign?: string; degree?: string };
    const sign = qNum(q.sign);
    if (sign == null || sign < 0 || sign > 11) {
      return reply.code(400).send({ error: 'sign (0-11) is required' });
    }
    const degree = qNum(q.degree) ?? 0;
    return {
      sign,
      degree,
      risingType: RISING_TYPE[sign],
      surfaces: isSirshodaya(sign)
        ? 'head-first — matters surface quickly and openly'
        : RISING_TYPE[sign] === 'ubhayodaya'
          ? 'both ways — matters surface either quickly or obliquely'
          : 'back-first — matters surface slowly or obliquely',
      strongBy: isDiurnal(sign) ? 'day' : 'night',
      ambulation: ambulationClass(sign, degree),
      humour: SIGN_HUMOUR[sign],
      notes: RISING_TYPE_NOTES,
    };
  });

  /** The twelve limbs, counted from the rising sign rather than a fixed Aries (4.4). */
  app.get('/bphs/limbs', async (req, reply) => {
    const q = req.query as { lagnaSign?: string };
    const lagnaSign = qNum(q.lagnaSign);
    if (lagnaSign == null || lagnaSign < 0 || lagnaSign > 11) {
      return reply.code(400).send({ error: 'lagnaSign (0-11) is required' });
    }
    return {
      lagnaSign,
      byHouse: KALAPURUSHA_LIMBS.map((limb, i) => ({ house: i + 1, limb })),
      bySign: Array.from({ length: 12 }, (_, s) => ({ sign: s, limb: limbOfSign(s, lagnaSign) })),
      note: 'Counted from the rising sign. The fixed-Aries mapping on /rasis is the '
        + 'Kalapurusha scheme and differs for eleven charts in twelve.',
    };
  });

  /** The three time-based special ascendants at BPHS rates (5.2-8). */
  app.get('/bphs/special-lagnas', async (req, reply) => {
    const q = req.query as { sunLongAtSunrise?: string; minutesSinceSunrise?: string; ghatis?: string };
    const sun = qNum(q.sunLongAtSunrise);
    const gh = qNum(q.ghatis);
    const mins = qNum(q.minutesSinceSunrise) ?? (gh == null ? null : gh * MINUTES_PER_GHATI);
    if (sun == null || mins == null) {
      return reply.code(400).send({
        error: 'sunLongAtSunrise (0-360) and either minutesSinceSunrise or ghatis are required',
      });
    }
    const bl = bhavaLagnaBphs(sun, mins);
    const hl = horaLagnaBphs(sun, mins);
    const gl = ghatikaLagnaBphs(sun, mins);
    const at = (v: number) => ({ longitude: v, sign: Math.floor(v / 30), degInSign: v % 30 });
    return {
      minutesSinceSunrise: mins,
      ghatis: minutesToGhatis(mins),
      bhava: at(bl), hora: at(hl), ghatika: at(gl),
      ghatisPerSign: GHATIS_PER_SIGN,
      use: LAGNA_REFERENCE_USE,
      note: 'Every rule counting houses must declare WHICH lagna it counts from (5.9).',
    };
  });

  /** A planet's claim on a bhava, by distance from that bhava's cusp (5.9 notes). */
  app.get('/bphs/cusp-strength', async (req, reply) => {
    const q = req.query as { planetLong?: string; cuspLong?: string };
    const p = qNum(q.planetLong);
    const c = qNum(q.cuspLong);
    if (p == null || c == null) {
      return reply.code(400).send({ error: 'planetLong and cuspLong (0-360) are required' });
    }
    const strength = cuspStrength(p, c);
    return {
      planetLong: p, cuspLong: c, strength,
      verdict: strength === 1 ? 'on the cusp — full effect for this bhava'
        : strength === 0 ? 'at the bhava sandhi — no effect for this bhava'
          : 'partial — effect scales with distance from the cusp',
    };
  });

  /** Does a planet hold the same bhava across the four charts (5.9 notes). */
  app.post('/bphs/bhava-agreement', async (req, reply) => {
    const b = req.body as { houses?: number[] };
    if (!Array.isArray(b?.houses) || b.houses.length === 0) {
      return reply.code(400).send({
        error: 'houses must be a non-empty array — the planet\'s house in each of the natal, bhava, hora and ghatika charts',
      });
    }
    const r = bhavaAgreement(b.houses);
    return {
      ...r,
      of: b.houses.length,
      reading: r.full
        ? 'same bhava in every chart — that bhava\'s results arrive in full'
        : 'shifts between charts — results arrive proportionally',
    };
  });

  /** Varnada for the lagna, or for a given house (5.10-15, 5.21). */
  app.get('/bphs/varnada', async (req, reply) => {
    const q = req.query as { lagnaSign?: string; horaLagnaSign?: string; house?: string };
    const l = qNum(q.lagnaSign);
    const h = qNum(q.horaLagnaSign);
    if (l == null || h == null) {
      return reply.code(400).send({ error: 'lagnaSign and horaLagnaSign (0-11) are required; optional house (1-12)' });
    }
    const house = qNum(q.house);
    const sign = house == null ? varnada(l, h) : varnadaOfHouse(house, l, h);
    return {
      lagnaSign: l, horaLagnaSign: h, house: house ?? 1, varnadaSign: sign,
      lagnaCount: varnadaCount(l), horaCount: varnadaCount(h),
      dasha: varnadaDashaOrder(l, sign),
      note: 'Dasha structure only. BPHS 5.16-20 reads Varnada for longevity; that is '
        + 'computed-never-surfaced under project policy and is not returned.',
    };
  });

  /** Nisheka — the conception moment, in saura days before birth (4.25-30). */
  app.get('/bphs/nisheka', async (req, reply) => {
    const q = req.query as Record<string, string | undefined>;
    const need = ['saturn', 'gulika', 'lagnaCusp', 'ninthCusp', 'moon', 'lagnaLordHouse'];
    const vals = need.map((k) => qNum(q[k]));
    if (vals.some((v) => v == null)) {
      return reply.code(400).send({
        error: `required (all numeric): ${need.join(', ')} — longitudes 0-360, lagnaLordHouse 1-12`,
      });
    }
    const [saturn, gulika, lagnaCusp, ninthCusp, moon, lordHouse] = vals as number[];
    const below = isBelowHorizon(lordHouse!);
    return {
      ...nisheka(saturn!, gulika!, lagnaCusp!, ninthCusp!, moon!, below),
      lagnaLordBelowHorizon: below,
      limitation: 'Returns SAURA days (1 degree = 1 day). Converting to a civil date needs '
        + 'the sauramana correction tables, which BPHS does not reproduce — in its own '
        + 'example the correction is about four days, so it is not optional for real use.',
    };
  });

  /** Recover the birth moment from the Adhana ascendant (4.25-30 notes). */
  app.get('/bphs/rectify-adhana', async (req, reply) => {
    const q = req.query as { degIntoAdhanaLagna?: string; periodSeconds?: string; adhanaLagnaSign?: string };
    const deg = qNum(q.degIntoAdhanaLagna);
    const period = qNum(q.periodSeconds);
    if (deg == null || period == null) {
      return reply.code(400).send({
        error: 'degIntoAdhanaLagna (0-30) and periodSeconds (length of the birth day or night) are required',
      });
    }
    const elapsed = rectifyFromAdhana(deg, period);
    const sign = qNum(q.adhanaLagnaSign);
    return {
      secondsIntoPeriod: elapsed,
      hours: Math.floor(elapsed / 3600),
      minutes: Math.floor((elapsed % 3600) / 60),
      birthHalf: sign == null ? null : birthHalfFromAdhana(sign),
      note: 'The fraction of the Adhana ascendant already traversed equals the fraction '
        + 'of the birth day or night already elapsed. Count from sunrise for a day birth, '
        + 'from sunset for a night birth.',
    };
  });

  // ── Chapter 6a — the varga catalogue and constructions D1…D24 ──────────────

  /** The canonical Shodasavarga (6.2-4), and which computed divisors fall outside it. */
  app.get('/bphs/shodasavarga', async () => ({
    shodasavarga: SHODASAVARGA,
    notInBphs: NON_BPHS_DIVISORS,
    startRules: VARGA_START,
    note: 'The engine computes twenty divisors; BPHS names these sixteen. D5, D6, D8 and '
      + 'D11 come from the later tradition. A rule citing "the sixteen divisions" means '
      + 'this list, and Vimsopaka bala is computed over subsets of it.',
  }));

  /** Where a division's counting begins for a sign, per BPHS's stated rule. */
  app.get('/bphs/varga-start', async (req, reply) => {
    const q = req.query as { divisor?: string; sign?: string };
    const divisor = qNum(q.divisor);
    const sign = qNum(q.sign);
    if (divisor == null || sign == null || sign < 0 || sign > 11) {
      return reply.code(400).send({
        error: 'divisor and sign (0-11) are required',
        divisorsWithStatedRules: Object.keys(VARGA_START).map(Number),
      });
    }
    const spec = VARGA_START[divisor];
    if (!spec) {
      return reply.code(404).send({
        error: `BPHS chapter 6a does not state a start rule for D${divisor}`,
        divisorsWithStatedRules: Object.keys(VARGA_START).map(Number),
      });
    }
    return {
      divisor, sign, name: spec.name, verse: spec.verse, rule: spec.rule,
      startSign: vargaStartSign(divisor, sign),
      isShodasavarga: isShodasavarga(divisor),
    };
  });

  /** Whether a navamsa is divine, human or devilish (6.12). */
  app.get('/bphs/navamsa-class', async (req, reply) => {
    const q = req.query as { sign?: string; degree?: string };
    const sign = qNum(q.sign);
    const degree = qNum(q.degree);
    if (sign == null || degree == null || sign < 0 || sign > 11) {
      return reply.code(400).send({ error: 'sign (0-11) and degree (0-30, within the sign) are required' });
    }
    const cls = navamsaClass(sign, degree);
    return {
      sign, degree, class: cls, means: NAVAMSA_CLASS_MEANING[cls],
      navamsaSign: vargaSign(sign * 30 + degree, 9),
      note: NAVAMSA_CLASS_NOTE,
    };
  });

  /** The direction-lord of a dasamsa (6.13-14) — which way a career points. */
  app.get('/bphs/dasamsa-direction', async (req, reply) => {
    const q = req.query as { sign?: string; degree?: string };
    const sign = qNum(q.sign);
    const degree = qNum(q.degree);
    if (sign == null || degree == null || sign < 0 || sign > 11) {
      return reply.code(400).send({ error: 'sign (0-11) and degree (0-30, within the sign) are required' });
    }
    return {
      sign, degree,
      ...dasamsaRuler(sign, degree),
      dasamsaSign: vargaSign(sign * 30 + degree, 10),
      allLords: DASAMSA_DIRECTION_LORDS,
      note: 'Read alongside dig bala from /bphs/strength-seeds — two independent methods '
        + 'for the direction a working life favours.',
    };
  });

  /** The hora lord (6.5-6) — the Sun\'s hora or the Moon\'s, which is how wealth is read. */
  app.get('/bphs/hora-lord', async (req, reply) => {
    const q = req.query as { sign?: string; degree?: string };
    const sign = qNum(q.sign);
    const degree = qNum(q.degree);
    if (sign == null || degree == null || sign < 0 || sign > 11) {
      return reply.code(400).send({ error: 'sign (0-11) and degree (0-30, within the sign) are required' });
    }
    return {
      sign, degree,
      lord: bphsHoraLord(sign, degree),
      horaSign: vargaSign(sign * 30 + degree, 2),
      decanateSage: drekkanaSage(degree),
    };
  });

  // ── Chapter 6b — D27…D60 and the varga classification schemes ──────────────

  const signDeg = (q: { sign?: string; degree?: string }) => {
    const sign = qNum(q.sign);
    const degree = qNum(q.degree);
    if (sign == null || degree == null || sign < 0 || sign > 11 || degree < 0 || degree >= 30) {
      return null;
    }
    return { sign, degree };
  };

  /** The trimsamsa a degree falls in — unequal arcs, reversed for an even sign (6.27-28). */
  app.get('/bphs/trimsamsa', async (req, reply) => {
    const sd = signDeg(req.query as { sign?: string; degree?: string });
    if (!sd) return reply.code(400).send({ error: 'sign (0-11) and degree (0-30) are required' });
    return {
      ...sd,
      ...trimsamsaPart(sd.sign, sd.degree),
      trimsamsaSign: vargaSign(sd.sign * 30 + sd.degree, 30),
      sequence: sd.sign % 2 === 0 ? TRIMSAMSA_ODD : TRIMSAMSA_EVEN,
      note: 'D30 is the one division with unequal arcs — 5/5/8/7/5 degrees, reversed for '
        + 'an even sign. It cannot be computed by simple division.',
    };
  });

  /** The shashtiamsa a degree falls in, with its name and nature (6.33-41). */
  app.get('/bphs/shashtiamsa', async (req, reply) => {
    const sd = signDeg(req.query as { sign?: string; degree?: string });
    if (!sd) return reply.code(400).send({ error: 'sign (0-11) and degree (0-30) are required' });
    const r = shashtiamsa(sd.sign, sd.degree);
    return {
      ...sd,
      ...r,
      natureKnown: r.nature != null,
      notes: SHASHTIAMSA_NOTES,
      method: 'Degrees in sign x 2, whole degrees only, mod 12, counted FROM the planet\'s '
        + 'own sign. Settled by the chapter\'s worked example (Venus in Capricorn 13°25\' '
        + '-> Pisces), not by the verse alone.',
    };
  });

  /** The four classification schemes and their designation ladders (6.42-53). */
  app.get('/bphs/varga-schemes', async () => ({
    schemes: VARGA_SCHEMES,
    designations: VARGA_DESIGNATIONS,
    aliases: DASAVARGA_ALIASES,
    goodCriteria: GOOD_VARGA_CRITERIA,
    arudhaCriterionDefault: ARUDHA_CRITERION_DEFAULT,
    disqualifiers: ['combust', 'defeatedInWar', 'weak', 'adverseAvastha'],
    note: 'Every scheme is a subset of BPHS\'s sixteen; none includes D5, D6, D8 or D11. '
      + 'The Arudha-angle criterion is off by default — it can admit eight signs of twelve, '
      + 'which makes it close to admitting everything.',
  }));

  /** Classify a planet's standing across a scheme (6.42-53). */
  app.post('/bphs/varga-classify', async (req, reply) => {
    const b = req.body as {
      scheme?: VargaScheme;
      goodDivisions?: number[];
      disqualifier?: VargaDisqualifier;
    };
    if (!b?.scheme || !(b.scheme in VARGA_SCHEMES)) {
      return reply.code(400).send({
        error: 'scheme is required', allowed: Object.keys(VARGA_SCHEMES),
      });
    }
    if (!Array.isArray(b.goodDivisions)) {
      return reply.code(400).send({
        error: 'goodDivisions must be an array of divisors in which the planet sits in a good division',
        criteria: GOOD_VARGA_CRITERIA,
      });
    }
    return {
      ...classifyVarga(b.scheme, b.goodDivisions, b.disqualifier ?? {}),
      ladder: VARGA_DESIGNATIONS[b.scheme],
    };
  });

  /**
   * Grade a planet across a varga scheme from nothing but its longitude.
   *
   * The composed form of /bphs/varga-classify: it derives the good-division count itself
   * from Part 1's dignity rather than asking the caller to work it out across ten
   * divisions by hand. Added by the Programme §8.1 retrofit sweep.
   */
  app.get('/bphs/varga-grade', async (req, reply) => {
    const q = req.query as {
      graha?: string; longitude?: string; scheme?: string;
      combust?: string; defeatedInWar?: string; weak?: string; adverseAvastha?: string;
      arudhaAngleSigns?: string;
    };
    const longitude = qNum(q.longitude);
    const scheme = (q.scheme ?? 'dasavarga') as VargaScheme;
    if (!q.graha || longitude == null) {
      return reply.code(400).send({ error: 'graha and longitude (0-360) are required; optional scheme' });
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    if (!(scheme in VARGA_SCHEMES)) {
      return reply.code(400).send({ error: 'unknown scheme', allowed: Object.keys(VARGA_SCHEMES) });
    }
    const arudhaAngleSigns = q.arudhaAngleSigns
      ? q.arudhaAngleSigns.split(',').map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < 12)
      : undefined;
    const grade = gradeVarga(
      q.graha as Graha, longitude, scheme,
      {
        combust: q.combust === 'true',
        defeatedInWar: q.defeatedInWar === 'true',
        weak: q.weak === 'true',
        adverseAvastha: q.adverseAvastha === 'true',
      },
      arudhaAngleSigns ? { arudhaAngleSigns } : {},
    );
    return {
      ...grade,
      longitude,
      ladder: VARGA_DESIGNATIONS[scheme],
      criteria: GOOD_VARGA_CRITERIA,
      arudhaCriterionApplied: !!arudhaAngleSigns,
    };
  });

  // ── Chapter 7 — Vimsopaka bala ─────────────────────────────────────────────

  /**
   * Vimsopaka bala (7.17-27) — a planet's strength out of 20 across a divisional scheme.
   * The first instrument here that can say a placement WILL NOT deliver, as a number.
   */
  app.get('/bphs/vimsopaka', async (req, reply) => {
    const q = req.query as { graha?: string; longitude?: string; scheme?: string };
    const longitude = qNum(q.longitude);
    const scheme = (q.scheme ?? 'dasavarga') as VargaScheme;
    if (!q.graha || longitude == null) {
      return reply.code(400).send({
        error: 'graha and longitude (0-360) are required; optional scheme',
        schemes: Object.keys(VIMSOPAKA_WEIGHTS),
      });
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    if (!(scheme in VIMSOPAKA_WEIGHTS)) {
      return reply.code(400).send({ error: 'unknown scheme', allowed: Object.keys(VIMSOPAKA_WEIGHTS) });
    }
    return {
      ...vimsopakaBala(q.graha as Graha, longitude, scheme),
      longitude,
      weights: VIMSOPAKA_WEIGHTS[scheme],
      viswa: VARGA_VISWA,
      bands: VIMSOPAKA_BANDS,
      minimum: VIMSOPAKA_MINIMUM,
      notes: { exaltation: VIMSOPAKA_EXALTATION_NOTE, floor: VIMSOPAKA_FLOOR_NOTE },
    };
  });

  /** Strength by angular distance from the Sun (7.28-29) — a ramp, not a combust flag. */
  app.get('/bphs/sun-distance', async (req, reply) => {
    const q = req.query as { planetLong?: string; sunLong?: string };
    const p = qNum(q.planetLong);
    const sun = qNum(q.sunLong);
    if (p == null || sun == null) {
      return reply.code(400).send({ error: 'planetLong and sunLong (0-360) are required' });
    }
    return { planetLong: p, sunLong: sun, strength: sunDistanceStrength(p, sun), note: SUN_DISTANCE_NOTE };
  });

  /** What each division is read for (7.1-8), plus the two division-quality rules. */
  app.get('/bphs/varga-use', async () => ({
    use: VARGA_USE,
    lordRules: VARGA_LORD_RULES,
    note: 'Reconciled with the existing /divisionals table — the two agree on all sixteen. '
      + 'D40 "maternal legacy" and D45 "paternal legacy" there come from the first corpus, '
      + 'not from BPHS.',
  }));

  /** House categories (7.33-36) as sets, so a predicate can ask directly. */
  app.get('/bphs/house-categories', async (req) => {
    const q = req.query as { house?: string };
    const house = qNum(q.house);
    return house == null
      ? { categories: HOUSE_CATEGORIES }
      : { house, categories: categoriesOfHouse(house), all: HOUSE_CATEGORIES };
  });

  // ── Chapters 8 and 11 ──────────────────────────────────────────────────────

  /** Rasi drishti (8.1-5) — the Jaimini sign aspects. Mutual, and NOT graha drishti. */
  app.get('/bphs/rasi-drishti', async (req, reply) => {
    const q = req.query as { sign?: string };
    const sign = qNum(q.sign);
    if (sign == null || sign < 0 || sign > 11) {
      return reply.code(400).send({ error: 'sign (0-11) is required' });
    }
    const aspects = rasiAspects(sign);
    return {
      sign,
      aspects,
      mutual: true,
      difference: RASI_VS_GRAHA_DRISHTI,
      note: 'Longitude is irrelevant here — the relation is by modality alone. Use '
        + '/aspects/graha for planetary drishti, which is directional and graded.',
    };
  });

  /** What each house is judged for (11.2-13), reconciled with /bhavas. */
  app.get('/bphs/house-indications', async (req) => {
    const q = req.query as { house?: string };
    const house = qNum(q.house);
    if (house == null) return { indications: BPHS_HOUSE_INDICATIONS };
    return {
      house,
      indications: BPHS_HOUSE_INDICATIONS[house] ?? [],
      note: UNSURFACED_HOUSE_INDICATIONS[house]
        ? 'BPHS also gives longevity-related indications for this house. They are '
          + 'computed for internal use and never surfaced, under standing policy.'
        : undefined,
    };
  });

  /** Prosperity or annihilation of a house (11.14-16), as real Rule records. */
  app.get('/bphs/house-prosperity', async (req, reply) => {
    const q = req.query as { house?: string; sign?: string; degree?: string };
    const house = qNum(q.house);
    if (house == null || house < 1 || house > 12) {
      return reply.code(400).send({ error: 'house (1-12) is required' });
    }
    const sign = qNum(q.sign);
    const degree = qNum(q.degree);
    return {
      house,
      rules: houseProsperityRules(house),
      veto: HOUSE_PROSPERITY_VETO,
      spoilingLordships: SPOILING_LORDSHIPS,
      lordInFavourableAvastha: sign != null && degree != null
        ? lordInFavourableAvastha(sign, degree)
        : null,
      avasthaWindow: '6-18 degrees of an odd sign, or 12-24 of an even one',
      notYetExpressible: HOUSE_PROSPERITY_NOT_YET_EXPRESSIBLE,
      note: 'Only the expressible clauses are encoded as rules. The rest are named rather '
        + 'than approximated — see notYetExpressible.',
    };
  });

  // ── Chapter 26a — graded graha drishti ────────────────────────────────

  /**
   * Aspect strength in quarters between two houses (26.2-5).
   * Unlike /aspects/graha, which answers only the FULL-aspect question, this grades.
   */
  app.get('/bphs/aspect-quarters', async (req, reply) => {
    const q = req.query as { graha?: string; fromHouse?: string; toHouse?: string };
    const from = qNum(q.fromHouse);
    const to = qNum(q.toHouse);
    if (!q.graha || from == null) {
      return reply.code(400).send({
        error: 'graha and fromHouse (1-12) are required; toHouse optional for the full map',
        scale: ASPECT_QUARTERS,
      });
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const g = q.graha as Graha;
    if (to != null) {
      const quarters = aspectQuarters(g, from, to);
      return { graha: g, fromHouse: from, toHouse: to, quarters, fraction: quarters / 4 };
    }
    return {
      graha: g,
      fromHouse: from,
      aspects: Array.from({ length: 12 }, (_, i) => i + 1)
        .map((h) => ({ house: h, quarters: aspectQuarters(g, from, h) }))
        .filter((x) => x.quarters > 0),
      specialFull: SPECIAL_FULL_ASPECTS[g] ?? [],
      note: GRADED_ASPECT_NOTE,
    };
  });

  /** The continuous drishti value in virupas, 0-60 (26.6-12). */
  app.get('/bphs/drishti-value', async (req, reply) => {
    const q = req.query as { graha?: string; aspectorLong?: string; aspectedLong?: string };
    const a = qNum(q.aspectorLong);
    const b = qNum(q.aspectedLong);
    if (!q.graha || a == null || b == null) {
      return reply.code(400).send({
        error: 'graha, aspectorLong and aspectedLong (0-360) are required',
      });
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const virupas = drishtiValue(q.graha as Graha, a, b);
    return {
      graha: q.graha,
      angle: aspectAngle(a, b),
      virupas,
      quarters: drishtiQuarters(virupas),
      rupas: drishtiRupas(virupas),
      virupasPerRupa: VIRUPAS_PER_RUPA,
      notes: { discontinuity: DRISHTI_DISCONTINUITY_NOTE, graded: GRADED_ASPECT_NOTE },
    };
  });

  // ── Chapter 27a — Shadbala I: Sthana bala ─────────────────────────────

  /** Uchcha bala — exaltation strength, 0-60 virupas (27.1). */
  app.get('/bphs/uchcha-bala', async (req, reply) => {
    const q = req.query as { graha?: string; longitude?: string };
    const lon = qNum(q.longitude);
    if (!q.graha || lon == null) {
      return reply.code(400).send({ error: 'graha and longitude (0-360) are required' });
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const virupas = shadbalaUchchaBala(q.graha as Graha, lon);
    if (virupas == null) {
      return reply.code(400).send({
        error: 'Shadbala is computed for the seven classical planets only; the nodes are excluded (27.1)',
        planets: SHADBALA_PLANETS,
      });
    }
    return {
      graha: q.graha, longitude: lon, virupas, rupas: virupas / VIRUPAS_PER_RUPA_27,
      note: 'Zero at deep debilitation, one full rupa at deep exaltation.',
    };
  });

  /** The Sthana bala scales and component list (27.1-6). */
  app.get('/bphs/sthana-bala', async () => ({
    shadbalaComponents: SHADBALA_COMPONENTS,
    sthanaComponents: STHANA_COMPONENTS,
    planets: SHADBALA_PLANETS,
    saptavargaja: { tiers: SAPTAVARGAJA_VIRUPAS, divisions: SAPTAVARGA_DIVISIONS, max: SAPTAVARGAJA_MAX },
    maximum: STHANA_BALA_MAX,
    maximumRupas: STHANA_BALA_MAX / VIRUPAS_PER_RUPA_27,
    vsEngine: VS_ENGINE_PLANET_STRENGTH,
  }));

  /** Sum the five Sthana components (27.1-6). POST the parts you have computed. */
  app.post('/bphs/sthana-bala', async (req, reply) => {
    const b = req.body as {
      graha?: string;
      longitude?: number;
      rasiSign?: number; navamsaSign?: number; house?: number; degInSign?: number;
      saptavargajaTiers?: Record<string, SaptavargajaTier>;
    };
    if (!b?.graha || !GRAHAS[b.graha]) {
      return reply.code(400).send({ error: 'graha is required', planets: SHADBALA_PLANETS });
    }
    const g = b.graha as Graha;
    if (!SHADBALA_PLANETS.includes(g)) {
      return reply.code(400).send({ error: 'Shadbala excludes the nodes (27.1)' });
    }
    const need = ['longitude', 'rasiSign', 'navamsaSign', 'house', 'degInSign'];
    const missing = need.filter((k) => typeof (b as Record<string, unknown>)[k] !== 'number');
    if (missing.length) {
      return reply.code(400).send({ error: `numeric fields required: ${missing.join(', ')}` });
    }
    const tiers = b.saptavargajaTiers ?? {};
    const parts = {
      uchcha: shadbalaUchchaBala(g, b.longitude!) ?? 0,
      saptavargaja: saptavargajaBala((d) => tiers[String(d)] ?? 'neutral'),
      ojhayugmarasiamsa: ojhayugmarasiamsaBala(g, b.rasiSign!, b.navamsaSign!),
      kendradi: kendradiBala(b.house!),
      drekkana: drekkanaBala(g, b.degInSign!),
    };
    return {
      ...sthanaBala(g, parts),
      maximum: STHANA_BALA_MAX,
      note: b.saptavargajaTiers
        ? undefined
        : 'No saptavargajaTiers supplied — every division defaulted to neutral (10 virupas). '
          + 'The full seven-tier scale needs chart-specific compound relationships.',
    };
  });

  // ── Chapter 27b — Shadbala II: Dig, Kala, Naisargika, Cheshta ───────────

  /** Directional strength, 0-60 virupas (27.7). Takes the ZERO cusp longitude. */
  app.get('/bphs/dig-bala', async (req, reply) => {
    const q = req.query as { graha?: string; longitude?: string; zeroCuspLongitude?: string };
    const lon = qNum(q.longitude);
    const cusp = qNum(q.zeroCuspLongitude);
    if (!q.graha || lon == null || cusp == null) {
      return reply.code(400).send({
        error: 'graha, longitude and zeroCuspLongitude (0-360) are required',
        zeroHouses: DIG_BALA_ZERO_HOUSE,
        strongHouses: DIG_BALA_STRONG_HOUSE,
      });
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const v = digBala(q.graha as Graha, lon, cusp);
    if (v == null) return reply.code(400).send({ error: 'Shadbala excludes the nodes (27.1)' });
    return {
      graha: q.graha, virupas: v, rupas: v / VIRUPAS_PER_RUPA_27,
      zeroHouse: DIG_BALA_ZERO_HOUSE[q.graha], strongHouse: DIG_BALA_STRONG_HOUSE[q.graha],
      note: 'Full on the strong cusp, nil on the opposite one, continuous between. The '
        + 'codebase has no bhava madhya yet, so a whole-sign caller should pass the sign '
        + 'boundary and treat the result as exact only there.',
    };
  });

  /** The five Kala bala sub-components (27.8-17). */
  app.get('/bphs/kala-bala', async (req, reply) => {
    const q = req.query as {
      graha?: string; ghatisFromMidnight?: string; moonLong?: string; sunLong?: string;
      isBenefic?: string; isDay?: string; third?: string; tropicalLongitude?: string;
    };
    if (!q.graha) {
      return {
        subcomponents: KALA_SUBCOMPONENTS,
        maximum: KALA_BALA_MAX,
        nightStrong: NIGHT_STRONG, dayStrong: DAY_STRONG,
        tribhagaDay: TRIBHAGA_DAY, tribhagaNight: TRIBHAGA_NIGHT,
        periodLords: PERIOD_LORD_VIRUPAS,
        note: 'Mercury takes full Nathonnatha bala day or night; Jupiter takes full '
          + 'Tribhaga bala at all times. Both exceptions are stated in the verses.',
      };
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const g = q.graha as Graha;
    const gh = qNum(q.ghatisFromMidnight);
    const moon = qNum(q.moonLong);
    const sun = qNum(q.sunLong);
    const trop = qNum(q.tropicalLongitude);
    const third = qNum(q.third);
    return {
      graha: g,
      nathonnatha: gh == null ? null : nathonnathaBala(g, gh),
      paksha: moon == null || sun == null ? null : pakshaBala(moon, sun, q.isBenefic === 'true'),
      tribhaga: third == null ? null : tribhagaBala(g, q.isDay !== 'false', Math.min(2, Math.max(0, third)) as 0 | 1 | 2),
      ayana: trop == null ? null : ayanaBala(g, trop),
      kranti: trop == null ? null : ayanaKranti(bhujaFromEquinox(trop)),
      naisargika: naisargikaBalaVirupas(g),
      maximum: KALA_BALA_MAX,
    };
  });

  /** Sum the five Kala parts (27.8-17). */
  app.post('/bphs/kala-bala', async (req, reply) => {
    const b = req.body as Partial<Record<string, number>>;
    const need = ['nathonnatha', 'paksha', 'tribhaga', 'varshaMasaDinaHora', 'ayana'];
    const missing = need.filter((k) => typeof b?.[k] !== 'number');
    if (missing.length) {
      return reply.code(400).send({ error: `numeric fields required: ${missing.join(', ')}` });
    }
    const parts = {
      nathonnatha: b.nathonnatha!, paksha: b.paksha!, tribhaga: b.tribhaga!,
      varshaMasaDinaHora: b.varshaMasaDinaHora!, ayana: b.ayana!,
    };
    const total = kalaBala(parts);
    return { ...parts, total, rupas: total / VIRUPAS_PER_RUPA_27, maximum: KALA_BALA_MAX };
  });

  /** Period-lord strength (27.13) — 15/30/45/60 for year, month, day, hora lord. */
  app.get('/bphs/period-lord-bala', async (req, reply) => {
    const q = req.query as { graha?: string; varsha?: string; masa?: string; dina?: string; hora?: string };
    if (!q.graha || !GRAHAS[q.graha]) {
      return reply.code(400).send({ error: 'graha is required', scale: PERIOD_LORD_VIRUPAS });
    }
    const lords: Record<string, Graha> = {};
    for (const k of ['varsha', 'masa', 'dina', 'hora'] as const) {
      const v = q[k];
      if (v && GRAHAS[v]) lords[k] = v as Graha;
    }
    return {
      graha: q.graha, lords, scale: PERIOD_LORD_VIRUPAS,
      virupas: varshaMasaDinaHoraBala(q.graha as Graha, lords),
    };
  });

  // ── Chapter 27c — Shadbala III: thresholds, war, Bhava bala ─────────────

  /**
   * Is a planet STRONG? (27.32-36) — the verdict the whole Shadbala chain exists to give.
   */
  app.get('/bphs/shadbala-verdict', async (req, reply) => {
    const q = req.query as {
      graha?: string; total?: string;
      sthana?: string; dig?: string; kala?: string; cheshta?: string; ayana?: string;
    };
    if (!q.graha) {
      return {
        required: SHADBALA_REQUIRED,
        componentMinimums: COMPONENT_MINIMUMS,
        six: SHADBALA_SIX,
        principle: STRONGEST_PLANET_DELIVERS,
      };
    }
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const g = q.graha as Graha;
    const total = qNum(q.total);
    const comps: Partial<ComponentCheck> = {};
    for (const k of ['sthana', 'dig', 'kala', 'cheshta', 'ayana'] as const) {
      const v = qNum(q[k]);
      if (v != null) comps[k] = v;
    }
    const haveAll = Object.keys(comps).length === 5;
    return {
      graha: g,
      required: SHADBALA_REQUIRED[g] ?? null,
      total,
      verdict: total == null ? null : shadbalaVerdict(g, total),
      group: componentGroupOf(g),
      components: haveAll ? meetsComponentMinimums(g, comps as ComponentCheck) : null,
      note: 'A planet short of the total Pinda can still be considerably favourable if it '
        + 'meets its group’s per-component minimums (27.34-36).',
    };
  });

  /** Planetary war (27.20) — the difference transfers from loser to victor. */
  app.get('/bphs/graha-yuddha', async (req, reply) => {
    const q = req.query as { victor?: string; vanquished?: string; victorShadbala?: string; vanquishedShadbala?: string };
    const a = qNum(q.victorShadbala);
    const b = qNum(q.vanquishedShadbala);
    if (!q.victor || !q.vanquished || a == null || b == null) {
      return reply.code(400).send({
        error: 'victor, vanquished, victorShadbala and vanquishedShadbala are required',
        planets: YUDDHA_PLANETS,
        note: YUDDHA_WINNER_NOTE,
      });
    }
    for (const g of [q.victor, q.vanquished]) {
      if (!YUDDHA_PLANETS.includes(g as Graha)) {
        return reply.code(400).send({ error: `${g} does not take part in planetary war`, planets: YUDDHA_PLANETS });
      }
    }
    return {
      ...grahaYuddha(q.victor as Graha, q.vanquished as Graha, a, b),
      note: YUDDHA_WINNER_NOTE,
    };
  });

  /** Drik bala (27.19) and the eight motions (27.21-23). */
  app.get('/bphs/drik-bala', async (req, reply) => {
    const q = req.query as { benefic?: string; malefic?: string; mercuryJupiter?: string; motion?: string };
    const motion = q.motion as MotionKind | undefined;
    if (motion && !(motion in MOTION_STRENGTHS)) {
      return reply.code(400).send({ error: 'unknown motion', motions: MOTION_ORDER });
    }
    const ben = qNum(q.benefic);
    const mal = qNum(q.malefic);
    if (ben == null || mal == null) {
      return {
        motions: MOTION_STRENGTHS, order: MOTION_ORDER,
        ambiguity: DRIK_BALA_AMBIGUITY,
        note: 'Pass benefic and malefic drishti pindas (virupas) to compute Drik bala.',
      };
    }
    return {
      drikBala: drikBala(ben, mal, qNum(q.mercuryJupiter) ?? 0),
      motionStrength: motion ? MOTION_STRENGTHS[motion] : null,
      ambiguity: DRIK_BALA_AMBIGUITY,
    };
  });

  /** Bhava bala (27.26-29). Takes cusps as input — BPHS never defines bhava madhya. */
  app.get('/bphs/bhava-bala', async (req, reply) => {
    const q = req.query as {
      sign?: string; degree?: string; bhavaLongitude?: string; angleLongitude?: string;
    };
    const sign = qNum(q.sign);
    const degree = qNum(q.degree);
    if (sign == null || degree == null) {
      return reply.code(400).send({
        error: 'sign (0-11) and degree (0-30) are required; add bhavaLongitude and angleLongitude for the value',
      });
    }
    const angle = bhavaReferenceAngle(sign, degree);
    const bl = qNum(q.bhavaLongitude);
    const al = qNum(q.angleLongitude);
    return {
      sign, degree, referenceAngle: angle,
      positional: bl != null && al != null ? bhavaDigBala(bl, al) : null,
      caution: 'BPHS never defines bhava madhya — it consumes cusps without saying how to '
        + 'compute them. Pass a cusp longitude you trust; whole-sign boundaries are exact '
        + 'only at the cusp itself.',
      notEncoded: CH27_NOT_ENCODED,
    };
  });

  /** Cheshta bala for the tara-grahas (27.24-25). */
  app.get('/bphs/cheshta-bala', async (req, reply) => {
    const q = req.query as { meanLongitude?: string; trueLongitude?: string; seeghrocha?: string };
    const m = qNum(q.meanLongitude);
    const t = qNum(q.trueLongitude);
    const sg = qNum(q.seeghrocha);
    if (m == null || t == null || sg == null) {
      return reply.code(400).send({
        error: 'meanLongitude, trueLongitude and seeghrocha (0-360) are required',
      });
    }
    return {
      cheshtaKendra: cheshtaKendra(m, t, sg),
      virupas: cheshtaBalaTara(m, t, sg),
      note: 'The fifth of BPHS’s strengths built on the same fold-and-divide-by-three.',
    };
  });

  // ── Part 12 — chapter 28: Ishta and Kashta bala ────────────────────────────

  /**
   * Ishta and Kashta Phala (28.6). Takes the two Shadbala components it is built from,
   * because that is literally all the verse asks for.
   */
  app.get('/bphs/ishta-kashta', async (req, reply) => {
    const q = req.query as { uchchaBala?: string; cheshtaBala?: string };
    const u = qNum(q.uchchaBala);
    const c = qNum(q.cheshtaBala);
    if (u == null || c == null) {
      return reply.code(400).send({
        error: 'uchchaBala and cheshtaBala (0-60 virupas each) are required',
      });
    }
    if (u < 0 || u > 60 || c < 0 || c > 60) {
      return reply.code(400).send({ error: 'both strengths must lie in 0-60 virupas' });
    }
    const ishta = ishtaPhala(u, c);
    const subha = subhaRasmi(rasmiFromBala(u), rasmiFromBala(c));
    return {
      ishta,
      kashta: kashtaPhala(ishta),
      verdict: ishtaKashtaOf(u, c).verdict,
      rays: {
        uchcha: rasmiFromBala(u),
        cheshta: rasmiFromBala(c),
        subha,
        asubha: asubhaRasmi(subha),
      },
      note: 'Ishta Phala is the arithmetic mean of Uchcha bala and Cheshta bala (28.6). '
        + 'It is not independent data — a chart with a Shadbala already has its Ishta.',
    };
  });

  /** The 28.11-12 generalisation: any 0-60 strength read as its own Ishta. */
  app.get('/bphs/bala-tendency', async (req, reply) => {
    const q = req.query as { virupas?: string };
    const v = qNum(q.virupas);
    if (v == null || v < 0 || v > 60) {
      return reply.code(400).send({ error: 'virupas (0-60) is required' });
    }
    return { ...ishtaKashtaOfBala(v), principle: ANY_BALA_IS_ITS_OWN_ISHTA };
  });

  /** The Cheshta Kendra of the luminaries (28.3-4) — what ch 27 left to this chapter. */
  app.get('/bphs/cheshta-kendra-luminary', async (req, reply) => {
    const q = req.query as { graha?: string; longitude?: string; sunLongitude?: string };
    const g = (q.graha ?? '').toLowerCase();
    const lon = qNum(q.longitude);
    if ((g !== 'sun' && g !== 'moon') || lon == null) {
      return reply.code(400).send({
        error: 'graha must be sun or moon, and longitude (0-360) is required; '
          + 'for the moon also pass sunLongitude',
      });
    }
    if (g === 'sun') {
      const k = cheshtaKendraSun(lon);
      return {
        graha: g, cheshtaKendra: k, rasmi: cheshtaRasmi(k),
        virupas: balaFromRasmi(cheshtaRasmi(k)),
        source: CHESHTA_KENDRA_SOURCE.sun,
        note: 'longitude must be TROPICAL (sayana) for the Sun. A linear stand-in for '
          + 'Ayana bala, agreeing with it at the equinox and both solstices.',
      };
    }
    const sun = qNum(q.sunLongitude);
    if (sun == null) {
      return reply.code(400).send({ error: 'sunLongitude (0-360) is required for the moon' });
    }
    const k = cheshtaKendraMoon(lon, sun);
    return {
      graha: g, cheshtaKendra: k, rasmi: cheshtaRasmi(k),
      virupas: balaFromRasmi(cheshtaRasmi(k)),
      source: CHESHTA_KENDRA_SOURCE.moon,
      note: 'The elongation. Reproduces Paksha bala for a benefic exactly, which is what '
        + '27.18 meant when it said the Moon’s Cheshta bala IS its Paksha bala.',
    };
  });

  /** The nine-tier tendency ladder (28.7-10). */
  app.get('/bphs/subhanka', async (req, reply) => {
    const q = req.query as { tier?: string; divisor?: string };
    const tier = q.tier as SubhankaTier | undefined;
    if (!tier || !SUBHANKA_ORDER.includes(tier)) {
      return reply.code(400).send({
        error: `tier is required, one of: ${SUBHANKA_ORDER.join(', ')}`,
      });
    }
    const divisor = qNum(q.divisor) ?? 1;
    return {
      tier, divisor,
      subhanka: subhanka(tier, divisor),
      asubhanka: asubhanka(tier, divisor),
      verdict: tierVerdict(tier),
      saptavargaMax: SUBHANKA_SAPTAVARGA_MAX,
      caution: SUBHANKA_VS_SAPTAVARGAJA,
      note: 'The verdict is categorical (28.10), not a threshold on the number — a '
        + 'friend’s sign is auspicious at 15 of 60.',
    };
  });

  /** Uchcha Rasmi and the ray/virupa bridge (28.2). */
  app.get('/bphs/rasmi', async (req, reply) => {
    const q = req.query as { longitude?: string; debilitationPoint?: string };
    const lon = qNum(q.longitude);
    const deb = qNum(q.debilitationPoint);
    if (lon == null || deb == null) {
      return reply.code(400).send({
        error: 'longitude and debilitationPoint (0-360 each) are required',
      });
    }
    const r = uchchaRasmi(lon, deb);
    return {
      uchchaRasmi: r, virupas: balaFromRasmi(r),
      note: 'A rasmi is 1 + virupas/10 — the rays and the virupas are one scale twice.',
    };
  });

  /** Attribution of a planet’s Ishta across its component strengths (28.13). */
  app.post('/bphs/ishta-attribution', async (req, reply) => {
    const body = req.body as { parts?: Record<string, number>; ishta?: number } | undefined;
    const parts = body?.parts;
    const ishta = body?.ishta;
    if (!parts || typeof parts !== 'object' || typeof ishta !== 'number') {
      return reply.code(400).send({
        error: 'body must be { parts: { name: virupas, ... }, ishta: number }',
      });
    }
    for (const v of Object.values(parts)) {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
        return reply.code(400).send({ error: 'every part must be a non-negative number' });
      }
    }
    return {
      shares: balaShares(parts),
      attributed: attributeIshta(parts, ishta),
      conflict: VERSE_13_CONFLICT,
    };
  });

  /** What a bhava will actually deliver — BPHS’s own arbitration procedure (28.15-20). */
  app.post('/bphs/bhava-effect', async (req, reply) => {
    const body = req.body as {
      bhavaIshta?: number; lordIshta?: number;
      contributors?: BhavaContributor[];
      ashtakavarga?: { bindus: number; rekhas: number };
    } | undefined;
    if (typeof body?.bhavaIshta !== 'number' || typeof body?.lordIshta !== 'number') {
      return reply.code(400).send({
        error: 'body must include numeric bhavaIshta and lordIshta (0-60 each)',
      });
    }
    const contributors = body.contributors ?? [];
    if (!Array.isArray(contributors)) {
      return reply.code(400).send({ error: 'contributors must be an array' });
    }
    for (const c of contributors) {
      if (typeof c?.amount !== 'number' || typeof c?.favourable !== 'boolean') {
        return reply.code(400).send({
          error: 'each contributor needs { what, favourable: boolean, amount: number }',
        });
      }
    }
    return {
      ...bhavaEffect({
        bhavaIshta: body.bhavaIshta,
        lordIshta: body.lordIshta,
        contributors,
        ashtakavarga: body.ashtakavarga,
      }),
      notEncoded: CH28_NOT_ENCODED,
    };
  });

  /** A bhava spanning two rasis takes the richer one (28.19-20). */
  app.get('/bphs/two-sign-bhava', async (req, reply) => {
    const q = req.query as { bindusFirst?: string; bindusSecond?: string };
    const a = qNum(q.bindusFirst);
    const b = qNum(q.bindusSecond);
    if (a == null || b == null) {
      return reply.code(400).send({ error: 'bindusFirst and bindusSecond are required' });
    }
    return {
      takes: twoSignBhava(a, b),
      caution: CH28_NOT_ENCODED['19-20'],
    };
  });

  /** An aspect inherits the tendency of the planet that sends it (28.14). */
  app.get('/bphs/aspect-tendency', async (req, reply) => {
    const q = req.query as { drishti?: string; tier?: string; divisor?: string };
    const d = qNum(q.drishti);
    const tier = q.tier as SubhankaTier | undefined;
    if (d == null || d < 0 || d > 60 || !tier || !SUBHANKA_ORDER.includes(tier)) {
      return reply.code(400).send({
        error: `drishti (0-60 virupas) and tier (one of: ${SUBHANKA_ORDER.join(', ')}) are required`,
      });
    }
    return {
      ...aspectIshtaKashta(d, tier, qNum(q.divisor) ?? 1),
      planets: ISHTA_KASHTA_PLANETS,
      ladder: SUBHANKA,
      note: 'A full aspect from a debilitated planet is a pure liability (28.14).',
    };
  });

  // ── Part 12 — chapters 29-31: the Jaimini layer ────────────────────────────

  /** The pada of a bhava (29.2-5), with the exceptions applied. */
  app.get('/bphs/bhava-pada', async (req, reply) => {
    const q = req.query as { houseSign?: string; lordSign?: string };
    const hs = qNum(q.houseSign);
    const ls = qNum(q.lordSign);
    if (hs == null || ls == null || hs < 0 || hs > 11 || ls < 0 || ls > 11) {
      return reply.code(400).send({ error: 'houseSign and lordSign (0-11 each) are required' });
    }
    const sign = bhavaPada(hs as SignIndex, ls as SignIndex);
    return {
      sign,
      rule: PADA_EXCEPTION_RULE,
      names: PADA_NAMES,
      note: 'Verified against the chapter’s standard nativity — Scorpio lagna with Mars '
        + 'in Cancer gives Pisces — and all three of its exception examples.',
    };
  });

  /** How one pada stands to another (29.30-37). */
  app.get('/bphs/pada-relation', async (req, reply) => {
    const q = req.query as { fromSign?: string; toSign?: string };
    const a = qNum(q.fromSign);
    const b = qNum(q.toSign);
    if (a == null || b == null || a < 0 || a > 11 || b < 0 || b > 11) {
      return reply.code(400).send({ error: 'fromSign and toSign (0-11 each) are required' });
    }
    return {
      relation: padaRelation(a as SignIndex, b as SignIndex),
      gainHouse: PADA_GAIN_HOUSE,
      lossHouse: PADA_LOSS_HOUSE,
      note: 'The 6th counts as a dusthana rather than an upachaya here — every rule in '
        + '29.30-37 treats it as adverse.',
    };
  });

  /** The Upapada (30.1-6), and the convention conflict it exposes. */
  app.get('/bphs/upapada', async (req, reply) => {
    const q = req.query as { lagnaSign?: string; lordSign?: string; convention?: string };
    const l = qNum(q.lagnaSign);
    const ls = qNum(q.lordSign);
    const conv = q.convention === 'twelfth' ? 'twelfth' : 'odd-even';
    if (l == null || ls == null || l < 0 || l > 11 || ls < 0 || ls > 11) {
      return reply.code(400).send({
        error: 'lagnaSign and lordSign (0-11 each) are required; lordSign is the lord of '
          + 'the house the Upapada is taken from — call /bphs/upapada-house first',
      });
    }
    return {
      ...upapada(l as SignIndex, ls as SignIndex, conv as UpapadaConvention),
      convention: conv,
      detailHouse: UPAPADA_DETAIL_HOUSE,
      conflict: UPAPADA_CONVENTION_CONFLICT,
    };
  });

  /** Which house the Upapada is taken from, under each convention (30.2). */
  app.get('/bphs/upapada-house', async (req, reply) => {
    const q = req.query as { lagnaSign?: string };
    const l = qNum(q.lagnaSign);
    if (l == null || l < 0 || l > 11) {
      return reply.code(400).send({ error: 'lagnaSign (0-11) is required' });
    }
    return {
      lagnaSign: l,
      bphs: upapadaHouse(l as SignIndex),
      twelfth: upapadaHouse(l as SignIndex, 'twelfth'),
      conflict: UPAPADA_CONVENTION_CONFLICT,
    };
  });

  /** Whether an argala actually lands (31.2-9). */
  app.get('/bphs/argala-resolve', async (req, reply) => {
    const q = req.query as {
      argalaCount?: string; obstructorCount?: string;
      argalaStrength?: string; obstructorStrength?: string;
    };
    const ac = qNum(q.argalaCount);
    const oc = qNum(q.obstructorCount);
    if (ac == null || oc == null || ac < 0 || oc < 0) {
      return reply.code(400).send({
        error: 'argalaCount and obstructorCount (non-negative) are required; '
          + 'argalaStrength and obstructorStrength (Shadbala virupas) are optional',
      });
    }
    const as_ = qNum(q.argalaStrength);
    const os_ = qNum(q.obstructorStrength);
    return {
      ...resolveArgala({
        argalaCount: ac,
        obstructorCount: oc,
        ...(as_ != null ? { argalaStrength: as_ } : {}),
        ...(os_ != null ? { obstructorStrength: os_ } : {}),
      }),
      pairs: ARGALA_PAIRS,
      countedFrom: ARGALA_COUNTED_FROM,
      timing: ARGALA_TIMING,
      nodes: NODE_ARGALA_REVERSED,
    };
  });

  /** The quarter-level cancellation rule (31.10). */
  app.get('/bphs/argala-quarter', async (req, reply) => {
    const q = req.query as { argalaDegree?: string; obstructorDegree?: string };
    const a = qNum(q.argalaDegree);
    const o = qNum(q.obstructorDegree);
    if (a == null || o == null || a < 0 || a >= 30 || o < 0 || o >= 30) {
      return reply.code(400).send({
        error: 'argalaDegree and obstructorDegree (0-30, degrees within the sign) are required',
      });
    }
    const aq = quarterOf(a);
    const oq = quarterOf(o);
    return {
      argalaQuarter: aq,
      obstructorQuarter: oq,
      cancelled: argalaQuarterCancelled(aq, oq),
      quarterDegrees: QUARTER_DEGREES,
      note: 'Only two pairings nullify — a 1st-quarter argala by a 4th-quarter obstructor, '
        + 'and a 2nd by a 3rd (31.10).',
    };
  });

  /** Vipareeta argala, and what an argala delivers per house (31.2-18). */
  app.get('/bphs/argala-effects', async (req, reply) => {
    const q = req.query as { maleficsInThird?: string };
    const m = qNum(q.maleficsInThird);
    return reply.send({
      houseEffects: ARGALA_HOUSE_EFFECT,
      royalHouses: ARGALA_ROYAL_HOUSES,
      vipareeta: m == null ? null : {
        maleficsInThird: m,
        applies: vipareetaArgala(m),
        house: VIPAREETA_ARGALA_HOUSE,
        note: 'Three or more malefics in the 3rd reverse into a favourable intervention '
          + '(31.2-9) — the one place a malefic crowd helps.',
      },
      unsurfaced: CH29_31_UNSURFACED,
      notYetExpressible: CH29_31_NOT_YET_EXPRESSIBLE,
      layer: JAIMINI_LAYER_NOTE,
    });
  });

  // ── Part 13 — chapter 66a: Ashtakavarga ────────────────────────────────────

  /** A planet's ashtakavarga table as BPHS gives it, with both mark vocabularies. */
  app.get('/bphs/ashtakavarga/table', async (req, reply) => {
    const q = req.query as { planet?: string };
    const p = (q.planet ?? '').toLowerCase() as AVPlanet;
    if (!AV_PLANETS.includes(p)) {
      return reply.code(400).send({
        error: `planet is required, one of: ${AV_PLANETS.join(', ')}`,
      });
    }
    const rekha = AV_TABLE[p];
    const karana: Record<string, number[]> = {};
    for (const r of AV_REFS) karana[r] = rekhaFromKarana(rekha[r]);
    return {
      planet: p,
      rekha,
      karana,
      rowTotals: Object.fromEntries(AV_REFS.map((r) => [r, avRowTotal(p, r)])),
      total: avPlanetTotal(p),
      statedTotal: BPHS_AV_PLANET_TOTALS[p],
      terminology: KARANA_VS_REKHA,
    };
  });

  /** What checking chapter 66 against the shipped tables found (Part 13). */
  app.get('/bphs/ashtakavarga/verification', async () => ({
    ...CH66_VERIFICATION,
    planetTotals: BPHS_AV_PLANET_TOTALS,
    grandTotal: AV_GRAND_TOTAL,
    whyItExists: WHY_ASHTAKAVARGA_EXISTS,
    remaining: CH66_REMAINING,
    terminology: KARANA_VS_REKHA,
  }));

  /** Convert between the chapter's karana lists and the benefic lists we store. */
  app.get('/bphs/ashtakavarga/complement', async (req, reply) => {
    const q = req.query as { houses?: string };
    if (!q.houses) {
      return reply.code(400).send({
        error: 'houses is required — a comma-separated list of 1-12, e.g. houses=1,2,8',
      });
    }
    const parsed = q.houses.split(',').map((x) => Number(x.trim()));
    if (parsed.some((n) => !Number.isInteger(n) || n < 1 || n > 12)) {
      return reply.code(400).send({ error: 'every house must be an integer 1-12' });
    }
    return {
      given: parsed,
      complement: rekhaFromKarana(parsed),
      note: 'BPHS 66 states each table twice, as karana places and as rekha places. The '
        + 'two must be exact complements — which is how Part 13 found three wrong rows.',
    };
  });

  /** What checking ch 66b against the shipped tables found (Part 14). */
  app.get('/bphs/ashtakavarga/verification-66b', async () => ({
    ...CH66B_VERIFICATION,
    karanaCounts: CH66B_KARANA_COUNTS,
    editionFaultsInChapter66: CH66_EDITION_FAULTS,
    remaining: CH66B_REMAINING,
  }));

  /** A ch 66b planet's transcribed table, with its own karana checksum re-derived. */
  app.get('/bphs/ashtakavarga/transcribed', async (req, reply) => {
    const q = req.query as { planet?: string };
    const p = (q.planet ?? '').toLowerCase() as 'mercury' | 'jupiter' | 'venus';
    if (p !== 'mercury' && p !== 'jupiter' && p !== 'venus') {
      return reply.code(400).send({
        error: 'planet must be one of: mercury, jupiter, venus (ch 66b). '
          + 'For sun, moon or mars see /bphs/ashtakavarga/table',
      });
    }
    return {
      planet: p,
      rekha: CH66B_TRANSCRIBED[p],
      total: rekhaTotal(CH66B_TRANSCRIBED[p]),
      karanaFromVerse: CH66B_KARANA_COUNTS[p],
      karanaDerived: karanaCounts(CH66B_TRANSCRIBED[p]),
      note: 'karanaFromVerse is transcribed from the chapter; karanaDerived is computed '
        + 'from the rekha table. They must agree — that is what settles a disputed row.',
    };
  });

  /** The ascendant's own ashtakavarga (66.61-68) — new in Part 15. */
  app.get('/bphs/ashtakavarga/lagna', async (req, reply) => {
    const q = req.query as Record<string, string | undefined>;
    const refs: Record<string, number> = {};
    const missing: string[] = [];
    for (const r of AV_REFS) {
      const v = qNum(q[r]);
      if (v == null || v < 0 || v > 11) missing.push(r);
      else refs[r] = v;
    }
    if (missing.length > 0) {
      return reply.code(400).send({
        error: `each reference sign (0-11) is required; missing or invalid: ${missing.join(', ')}`,
        example: '/bphs/ashtakavarga/lagna?sun=0&moon=3&mars=6&mercury=1&jupiter=9&venus=4&saturn=7&asc=2',
      });
    }
    const bindus = lagnaAshtakavarga(refs as never);
    return {
      bindus,
      total: bindus.reduce((a, b) => a + b, 0),
      statedTotal: LAGNA_AV_TOTAL,
      table: CH66_LAGNA_REKHA,
      caution: LAGNA_AV_IS_NOT_IN_SAV,
      note: 'The seven planetary BAVs say how a transiting planet fares in a sign. This '
        + 'says how a sign treats the native’s own person and circumstances.',
    };
  });

  /** Chapter 66, reconciled end to end (Parts 13-15). */
  app.get('/bphs/ashtakavarga/chapter-66', async () => ({
    ...CH66C_VERIFICATION,
    saturnTable: CH66_SATURN_REKHA,
    lagnaTable: CH66_LAGNA_REKHA,
    lagnaKarana: CH66_LAGNA_KARANA_COUNTS,
    lagnaTotal: LAGNA_AV_TOTAL,
    lagnaNotInSav: LAGNA_AV_IS_NOT_IN_SAV,
    coincidence: LAGNA_ASC_ROW_COINCIDENCE,
    faultRate: CH66_FAULT_RATE_NOTE,
  }));

  /** Run the ashtakavarga reductions over a BAV row (67-69). */
  app.post('/bphs/ashtakavarga/reduce', async (req, reply) => {
    const body = req.body as { bav?: number[]; occupied?: number[] } | undefined;
    const bav = body?.bav;
    if (!Array.isArray(bav) || bav.length !== 12
        || bav.some((v) => typeof v !== 'number' || v < 0 || v > 8 || !Number.isInteger(v))) {
      return reply.code(400).send({
        error: 'bav must be an array of 12 integers, each 0-8',
      });
    }
    const occupied = body?.occupied ?? [];
    if (!Array.isArray(occupied)
        || occupied.some((v) => !Number.isInteger(v) || v < 0 || v > 11)) {
      return reply.code(400).send({ error: 'occupied must be an array of signs 0-11' });
    }
    const afterTrikona = trikonaSodhana(bav);
    const afterEkadhipatya = ekadhipatyaSodhana(afterTrikona, occupied);
    return {
      raw: bav,
      afterTrikona,
      afterEkadhipatya,
      soav: sodhitaAshtakavarga(bav, occupied),
      order: REDUCTION_ORDER,
      orderIsStated: REDUCTION_ORDER_IS_STATED,
      rules: EKADHIPATYA_RULES,
    };
  });

  /** Pinda sadhana from a reduced row (69). */
  app.post('/bphs/ashtakavarga/pinda', async (req, reply) => {
    const body = req.body as {
      soav?: number[]; planetSigns?: Record<string, number>;
    } | undefined;
    const soav = body?.soav;
    const signs = body?.planetSigns;
    if (!Array.isArray(soav) || soav.length !== 12
        || soav.some((v) => typeof v !== 'number' || v < 0)) {
      return reply.code(400).send({ error: 'soav must be an array of 12 non-negative numbers' });
    }
    if (!signs || typeof signs !== 'object'
        || AV_PLANETS.some((p) => !Number.isInteger(signs[p]) || signs[p]! < 0 || signs[p]! > 11)) {
      return reply.code(400).send({
        error: `planetSigns must give a sign 0-11 for each of: ${AV_PLANETS.join(', ')}`,
      });
    }
    return {
      ...sodhyaPinda(soav, signs as never),
      naming: 'BPHS 69 calls this the Yoga Pinda; the codebase calls it sodhyaPinda.',
    };
  });

  /** What checking chapters 67-69 against the source found (Part 16). */
  app.get('/bphs/ashtakavarga/reductions', async () => ({
    ...CH67_69_VERIFICATION,
    order: REDUCTION_ORDER,
    orderIsStated: REDUCTION_ORDER_IS_STATED,
    trikonaRule: TRIKONA_RULE,
    ekadhipatyaRules: EKADHIPATYA_RULES,
    illustration: CH68_ILLUSTRATION,
    corpusConflict: EKADHIPATYA_CORPUS_CONFLICT,
    rasiMultiplierConflict: RASI_MULTIPLIER_CONFLICT,
    grahaMultiplierConflict: GRAHA_MULTIPLIER_CONFLICT,
    workedExample: CH69_WORKED_EXAMPLE,
    lagna: REDUCTIONS_INCLUDE_LAGNA,
  }));

  /** The ch 70 trigger: a bindu count and a Yoga Pinda become a nakshatra and a rasi. */
  app.get('/bphs/av-trigger', async (req, reply) => {
    const q = req.query as { rekhas?: string; yogaPinda?: string };
    const r = qNum(q.rekhas);
    const yp = qNum(q.yogaPinda);
    if (r == null || yp == null || r < 0 || r > 8 || yp < 0) {
      return reply.code(400).send({
        error: 'rekhas (0-8) and yogaPinda (non-negative) are required',
      });
    }
    return {
      ...avTrigger(r, yp),
      triggeredBy: TRIGGER_PLANET,
      note: TRIGGER_FORMULA_NOTE,
    };
  });

  /** Is a transit through this sign favourable, by its bindu count (70.19-23, 43-44)? */
  app.get('/bphs/av-transit', async (req, reply) => {
    const q = req.query as { rekhas?: string };
    const r = qNum(q.rekhas);
    if (r == null || r < 0 || r > 8) {
      return reply.code(400).send({ error: 'rekhas (0-8) is required' });
    }
    return {
      rekhas: r,
      verdict: transitVerdict(r),
      midpoint: TRANSIT_MIDPOINT,
      caution: TRANSIT_THRESHOLD_IS_OURS,
      election: ELECTION_RULE,
    };
  });

  /** What each ashtakavarga is consulted for, and in which house (70.1-6). */
  app.get('/bphs/av-matters', async () => ({
    matters: AV_MATTERS,
    house: AV_MATTER_HOUSE,
    marsCaveat: MARS_HOUSE_UNSTATED,
    rules: ashtakavargaEffectRules(),
    notEncoded: CH70_NOT_ENCODED,
    note: 'Houses are counted FROM the planet whose ashtakavarga is being read, not from '
      + 'the lagna.',
  }));

  /** The children indication of 70.30-33 — a count, heavily caveated. */
  app.get('/bphs/av-children', async (req, reply) => {
    const q = req.query as { rekhas?: string; jupiterWeak?: string };
    const r = qNum(q.rekhas);
    if (r == null || r < 0 || r > 8) {
      return reply.code(400).send({
        error: 'rekhas (0-8, in the 5th from Jupiter in Jupiter’s ashtakavarga) is required',
      });
    }
    return childrenIndication(r, q.jupiterWeak === 'true');
  });

  /** Samudaya (SAV) band for a sign, with the text's own thresholds (72.3-6). */
  app.get('/bphs/samudaya', async (req, reply) => {
    const q = req.query as { rekhas?: string };
    const r = qNum(q.rekhas);
    if (r == null || r < 0 || r > 56) {
      return reply.code(400).send({ error: 'rekhas (0-56) is required' });
    }
    return {
      rekhas: r,
      band: samudayaBand(r),
      favourableAbove: SAMUDAYA_FAVOURABLE_ABOVE,
      adverseBelow: SAMUDAYA_ADVERSE_BELOW,
      meanPerSign: SAV_MEAN_PER_SIGN,
      precedence: AV_OUTRANKS_TRANSIT,
    };
  });

  /** The life-stage split and the prosperity configuration of 72.7-10. */
  app.post('/bphs/samudaya-chart', async (req, reply) => {
    const body = req.body as { sav?: number[]; lagnaSign?: number } | undefined;
    const sav = body?.sav;
    const lagnaSign = body?.lagnaSign;
    if (!Array.isArray(sav) || sav.length !== 12 || sav.some((v) => typeof v !== 'number')
        || !Number.isInteger(lagnaSign) || lagnaSign! < 0 || lagnaSign! > 11) {
      return reply.code(400).send({
        error: 'body must be { sav: number[12], lagnaSign: 0-11 }',
      });
    }
    const bands: Record<number, string> = {};
    for (let h = 1; h <= 12; h++) bands[h] = samudayaBand(sav[(lagnaSign! + h - 1) % 12]!);
    return {
      bands,
      stages: LIFE_STAGES,
      stageOfHouse: Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => [i + 1, lifeStageOfHouse((i + 1) as never)]),
      ),
      prosperityConfiguration: prosperityConfiguration(sav, lagnaSign as never),
      precedence: AV_OUTRANKS_TRANSIT,
    };
  });

  /** The rays of a planet (73) — closeness x its exaltation maximum, then corrected. */
  app.get('/bphs/rays', async (req, reply) => {
    const q = req.query as {
      graha?: string; longitude?: string; debilitationPoint?: string;
      dignity?: string; combust?: string;
    };
    const g = (q.graha ?? '').toLowerCase();
    const max = RAYS_AT_EXALTATION[g];
    const lon = qNum(q.longitude);
    const deb = qNum(q.debilitationPoint);
    if (max == null || lon == null || deb == null) {
      return reply.code(400).send({
        error: `graha (one of ${Object.keys(RAYS_AT_EXALTATION).join(', ')}), longitude and `
          + 'debilitationPoint (0-360 each) are required',
      });
    }
    const base = planetRays(lon, deb, max);
    const corrected = q.dignity ? correctedRays(base, q.dignity) : base;
    const net = raysAfterCombustion(g as never, corrected, q.combust === 'true');
    return {
      graha: g, maxRays: max, baseRays: base, corrected, net,
      fractionOfMax: max === 0 ? 0 : net / max,
      totalMaxAcrossPlanets: RAYS_TOTAL_MAX,
      dignityFactors: RAY_DIGNITY_FACTOR,
      caution: RAYS_VS_CH28_RASMI,
      bandNote: 'The capacity band of 73.8-20 is read from the TOTAL rays across all seven '
        + 'planets, not from one planet’s. Sum the `net` values and call /bphs/ray-band.',
    };
  });

  /** The Sudarshana chakra's three frames, and their agreement (74). */
  app.get('/bphs/sudarshana', async (req, reply) => {
    const q = req.query as {
      house?: string; lagnaSign?: string; moonSign?: string; sunSign?: string;
      favourable?: string;
    };
    const h = qNum(q.house);
    const l = qNum(q.lagnaSign);
    const m = qNum(q.moonSign);
    const su = qNum(q.sunSign);
    if (h == null || h < 1 || h > 12 || l == null || m == null || su == null
        || [l, m, su].some((v) => v < 0 || v > 11)) {
      return reply.code(400).send({
        error: 'house (1-12) and lagnaSign, moonSign, sunSign (0-11 each) are required',
      });
    }
    const signs = sudarshanaSigns(h as never, l as never, m as never, su as never);
    const flags = (q.favourable ?? '').split(',').filter(Boolean).map((x) => x === 'true');
    return {
      house: h,
      frames: SUDARSHANA_FRAMES,
      signs,
      agreement: flags.length > 0 ? sudarshanaAgreement(flags) : null,
      sunRule: SUN_BENEFIC_IN_FIRST_ONLY,
      emptyHouse: EMPTY_HOUSE_FALLBACK,
      summary: CH72_74_SUMMARY,
    };
  });

  /** 74.11-13's majority rule for a contested house. */
  app.get('/bphs/majority-influence', async (req, reply) => {
    const q = req.query as { benefics?: string; malefics?: string };
    const b = qNum(q.benefics);
    const m = qNum(q.malefics);
    if (b == null || m == null || b < 0 || m < 0) {
      return reply.code(400).send({ error: 'benefics and malefics (non-negative) are required' });
    }
    return { benefics: b, malefics: m, verdict: majorityInfluence(b, m), stage: stageVerdict(b, m) };
  });

  /** The capacity band of 73.8-20 — read from the TOTAL rays across all seven planets. */
  app.get('/bphs/ray-band', async (req, reply) => {
    const q = req.query as { totalRays?: string };
    const t = qNum(q.totalRays);
    if (t == null || t < 0) {
      return reply.code(400).send({
        error: 'totalRays (non-negative, summed across all seven planets) is required',
      });
    }
    return {
      totalRays: t,
      band: rayCapacityBand(t),
      baseMaximum: RAYS_TOTAL_MAX,
      note: 'The seven maxima sum to 49, so the top band is reachable only through the '
        + 'dignity corrections of 73.3-7.',
    };
  });

  /** The arbitration ordering itself, with the verse behind each stage. */
  app.get('/bphs/arbitration', async () => ({
    order: ARBITRATION_ORDER,
    weights: ARBITRATION_WEIGHTS,
    weightsAreOurs: WEIGHTS_ARE_OURS,
    confidenceCeiling: CONFIDENCE_CEILING,
    confidenceNote: CONFIDENCE_NEVER_CERTAIN,
    open: ARBITRATION_OPEN,
  }));

  /** Run the ordering over a chart's facts and an optional signal bundle. */
  app.post('/bphs/arbitrate', async (req, reply) => {
    const body = req.body as {
      facts?: unknown;
      signals?: Record<string, unknown>;
    } | undefined;
    const facts = body?.facts as { lagnaSign?: number; planets?: unknown } | undefined;
    if (!facts || typeof facts.lagnaSign !== 'number' || typeof facts.planets !== 'object') {
      return reply.code(400).send({
        error: 'body must be { facts: ChartFacts, signals?: { shadbala?, ishta?, sav?, '
          + 'bhavaBala?, agreement? } }. facts needs at least lagnaSign and planets.',
      });
    }
    const res = arbitrate(allEncodedRules(), facts as never, (body?.signals ?? {}) as never);
    return {
      findings: res.findings.map((f) => ({
        id: f.hit.rule.id,
        summary: f.hit.rule.effect.summary,
        domain: f.hit.rule.effect.domain,
        valence: f.hit.rule.effect.valence,
        score: f.score,
        confidence: f.confidence,
        status: f.status,
        source: f.hit.rule.source,
        trace: f.trace,
        dissent: f.dissent.map((d) => d.rule.id),
      })),
      withheld: res.withheld.map((f) => ({
        id: f.hit.rule.id, status: f.status,
        why: f.trace.find((t) => t.stage === 'base-rate')?.why ?? 'withheld',
      })),
      mixed: res.mixed,
      confidenceCeiling: CONFIDENCE_CEILING,
    };
  });

  /** Measure how often each encoded rule fires across a synthetic population. */
  app.get('/bphs/calibration', async (req, reply) => {
    const q = req.query as { sample?: string; seed?: string };
    const n = qNum(q.sample) ?? 5000;
    const seed = qNum(q.seed) ?? 99;
    if (n < 100 || n > 50000) {
      return reply.code(400).send({ error: 'sample must be between 100 and 50000' });
    }
    const res = calibrate(allEncodedRules(), syntheticCharts(n, seed), seed);
    return {
      ...res,
      ranked: Object.entries(res.baseRates).sort((a, b) => b[1] - a[1])
        .map(([id, rate]) => {
          const rule = allEncodedRules().find((r) => r.id === id);
          const a = rule ? arity(rule) : 1;
          return {
            id, rate, arity: a,
            expected: expectedBaseRate(a),
            suspicious: isSuspiciouslyRare(rate, a),
          };
        }),
      suspectNote: SUSPECT_THRESHOLD_SCALES_WITH_ARITY,
      caution: SYNTHETIC_CHARTS_ARE_UNIFORM,
      generatorNote: GENERATOR_MUST_FEED_EVERY_FRAME,
    };
  });

  /** The 1st- and 2nd-house rule sets, with what was excluded and why (ch 12-13). */
  app.get('/bphs/house-rules', async (req, reply) => {
    const q = req.query as { house?: string; from?: string };
    const h = qNum(q.house);
    const byHouse: Record<number, () => ReturnType<typeof firstHouseRules>> = {
      1: firstHouseRules, 2: secondHouseRules,
      3: thirdHouseRules, 4: fourthHouseRules, 5: fifthHouseRules,
      6: sixthHouseRules, 7: seventhHouseRules,
      8: eighthHouseRules, 9: ninthHouseRules, 10: tenthHouseRules,
      11: eleventhHouseRules, 12: twelfthHouseRules,
    };
    if (h == null || byHouse[h] == null) {
      return reply.code(400).send({
        error: `house must be one of ${Object.keys(byHouse).join(', ')} — Phase III has `
          + 'encoded chapters 12 to 23 — all twelve houses',
      });
    }
    const frame = q.from === 'moon' ? 'moon' : 'natal';
    const ch1213 = h <= 2;
    return {
      house: h,
      from: frame,
      rules: readFrom(byHouse[h]!(), frame),
      kendras: KENDRAS,
      trikonas: TRIKONAS,
      readFromTheMoon: READ_FROM_THE_MOON_TOO,
      backgroundRules: BACKGROUND_RULES_ARE_KEPT,
      excluded: ch1213 ? CH12_13_EXCLUDED : h <= 5 ? CH14_16_EXCLUDED
        : h <= 7 ? CH17_18_EXCLUDED : h <= 10 ? CH19_21_EXCLUDED : CH22_23_EXCLUDED,
      unsurfaced: ch1213 ? CH12_13_UNSURFACED : h <= 5 ? CH14_16_UNSURFACED
        : h <= 7 ? CH17_18_UNSURFACED : h <= 10 ? CH19_21_UNSURFACED : CH22_23_UNSURFACED,
      notYetExpressible: ch1213 ? CH12_13_NOT_YET_EXPRESSIBLE
        : h <= 5 ? CH14_16_NOT_YET_EXPRESSIBLE
        : h <= 7 ? CH17_18_NOT_YET_EXPRESSIBLE
        : h <= 10 ? CH19_21_NOT_YET_EXPRESSIBLE : CH22_23_NOT_YET_EXPRESSIBLE,
      ...(ch1213 ? {} : h <= 5 ? {
        yield: CH14_16_YIELD,
        yieldVaries: PHASE_III_YIELD_VARIES,
        judgeByStrength: JUDGE_BY_STRENGTH_FIRST,
      } : h <= 7 ? {
        yield: CH17_18_YIELD,
        lordsConjunct: LORDS_CONJUNCT_CLOSED_A_GAP,
      } : h <= 10 ? {
        yield: CH19_21_YIELD,
        vipareeta: VIPAREETA_READING,
        strengthPredicate: STRENGTH_PREDICATE_NOW_USABLE,
        ...(h === 9 ? { fortuneTiming: FORTUNE_TIMING } : {}),
      } : {
        yield: CH22_23_YIELD,
        bhavatBhavam: BHAVAT_BHAVAM,
        blockComplete: HOUSE_BLOCK_COMPLETE,
        ...(h === 11 ? { gainTiming: GAIN_TIMING, amountsNote: NISHKA_AMOUNTS_NOT_SURFACED } : {}),
        ...(h === 12 ? {
          visibleHalf: VISIBLE_HALF_HOUSES,
          invisibleHalf: INVISIBLE_HALF_HOUSES,
          manifestation: MANIFESTATION_NOTE,
        } : {}),
      }),
      ...(h === 5 ? { childTiming: CHILD_TIMING_INDICATIONS, childTimingNote: CHILD_TIMING_NOTE } : {}),
      rhythm: PHASE_III_RHYTHM,
    };
  });

  /** Marriage timing (18.22-34), gated by SURFACEABLE_MARRIAGE_AGE. */
  app.get('/bphs/marriage-timing', async (req) => {
    const q = req.query as { all?: string };
    const showAll = q.all === 'true';
    const rows = (showAll ? MARRIAGE_TIMING : surfaceableTimings()).map((t) => ({
      verse: t.verse,
      when: t.when,
      ages: showAll ? t.ages : surfaceableAges(t),
      ...(showAll ? { gated: t.ages.filter((a) => a < SURFACEABLE_MARRIAGE_AGE) } : {}),
    }));
    return {
      timings: rows,
      surfaceableFrom: SURFACEABLE_MARRIAGE_AGE,
      totalVerses: MARRIAGE_TIMING.length,
      shown: rows.length,
      policy: MARRIAGE_AGE_POLICY,
      note: 'Pass all=true to see the ungated source, including the ages we do not surface.',
    };
  });

  /** The retrofit rules Part 22 restored to the form their verses state. */
  app.get('/bphs/lords-conjunct', async () => ({
    rules: lordConjunctionRules(),
    explanation: LORDS_CONJUNCT_CLOSED_A_GAP,
    note: 'BPHS 15.4 and 13.4 both say two house lords JOIN. Until Part 22 the DSL could '
      + 'only say they were each somewhere, so the rules were weaker than the verses.',
  }));

  /** Re-read a house's rules from another house — bhavat bhavam, BPHS 23.7. */
  app.get('/bphs/bhavat-bhavam', async (req, reply) => {
    const q = req.query as { house?: string; from?: string };
    const h = qNum(q.house);
    const from = qNum(q.from);
    const byHouse: Record<number, () => ReturnType<typeof firstHouseRules>> = {
      1: firstHouseRules, 2: secondHouseRules, 3: thirdHouseRules, 4: fourthHouseRules,
      5: fifthHouseRules, 6: sixthHouseRules, 7: seventhHouseRules, 8: eighthHouseRules,
      9: ninthHouseRules, 10: tenthHouseRules, 11: eleventhHouseRules, 12: twelfthHouseRules,
    };
    if (h == null || byHouse[h] == null || from == null || from < 1 || from > 12) {
      return reply.code(400).send({
        error: 'house (1-12) and from (1-12) are required. `from` is the house to treat as '
          + 'the ascendant — e.g. house=7&from=3 reads a sibling’s partnership.',
      });
    }
    return {
      house: h,
      readFrom: from,
      matter: Object.entries(MATTER_HOUSE).find(([, v]) => v === from)?.[0] ?? null,
      rules: readFromHouse(byHouse[h]!(), from),
      principle: BHAVAT_BHAVAM,
      matterHouses: MATTER_HOUSE,
    };
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Part 38 — chapters 47-50. The join: readings that hold DURING a period.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * What the dasha of a given house lord brings — BPHS 48.2-8.
   *
   * `house` alone returns the row and its rule. Adding `dignity` answers the question the
   * chapter actually asks, because 48.1 makes the lord's CONDITION decide, not its
   * lordship: a well-placed lord gives the effect and a badly-placed one does not.
   */
  app.get('/bphs/dasha/house-lord', async (req, reply) => {
    const q = req.query as { house?: string; dignity?: string };
    const h = qNum(q.house);
    if (h == null || h < 1 || h > 12) {
      return reply.code(400).send({ error: 'house must be an integer 1-12' });
    }
    const row = HOUSE_LORD_DASHA.find((r) => r.house === h)!;
    if (!row.surfaced) {
      return {
        house: h,
        surfaced: false,
        withheld: row.withheld,
        principle: MARAKA_ROWS_USE_THE_CHAPTERS_OWN_ALTERNATIVE,
      };
    }
    const WELL_PLACED = ['exalted', 'own', 'moolatrikona', 'friend'];
    const dignity = typeof q.dignity === 'string' ? q.dignity : null;
    const wellPlaced = dignity == null ? null : WELL_PLACED.includes(dignity);
    return {
      house: h,
      verse: `48.${row.verse}`,
      surfaced: true,
      summary: row.summary,
      valence: row.valence,
      excluded: row.excluded ?? null,
      condition: {
        wellPlaced,
        // Silence, not a guess: without a dignity we cannot say whether the effect holds.
        applies: wellPlaced,
        note: wellPlaced == null
          ? 'Pass dignity= to resolve this. 48.1 makes the lord’s condition decide, so a '
            + 'row without one is a reading of the house, not of the period.'
          : wellPlaced
            ? 'The lord is well placed, so the chapter’s effect stands.'
            : 'The lord is not well placed, so 48.1 withholds the effect rather than '
              + 'inverting it — the chapter does not say what a badly-placed lord gives here.',
      },
      rule: houseLordDashaRules().find((r) => r.effect.id === `dasha.house-lord.${h}`) ?? null,
      principle: CONDITION_OUTRANKS_NATURE,
    };
  });

  /** The whole 48.2-8 table, plus what chapter 47 contributes and what it does not. */
  app.get('/bphs/dasha/effects', async () => ({
    taxonomy: DASHA_EFFECT_TAXONOMY,
    favourableShape: DASHA_FAVOURABLE_SHAPE,
    arbitration: CONDITION_OUTRANKS_NATURE,
    houseLords: HOUSE_LORD_DASHA,
    rules: houseLordDashaRules(),
    withheld: MARAKA_ROWS_USE_THE_CHAPTERS_OWN_ALTERNATIVE,
    commentaryNotEncoded: CH48_COMMENTARY_DISAGREES_WITH_CH34,
    gaps: [DASHA_START_CHART_IS_A_GAP, DASHA_LORD_IS_A_PLANETREF],
  }));

  /**
   * A rasi dasha read by BPHS 50.4-10 — counted from the DASHA RASI, not the ascendant.
   *
   * POST { occupancy: { "3": "malefic", "8": "benefic", … }, owner?, rasiOccupant? }
   */
  app.post('/bphs/dasha/chara', async (req, reply) => {
    const b = req.body as {
      occupancy?: Record<string, string>;
      owner?: string; rasiOccupant?: string;
    };
    const OCC = ['benefic', 'malefic', 'both', 'empty'];
    if (!b?.occupancy || typeof b.occupancy !== 'object') {
      return reply.code(400).send({
        error: 'occupancy is required: an object keyed by house NUMBER counted from the '
          + 'dasha rasi, each value one of benefic | malefic | both | empty.',
      });
    }
    const findings: unknown[] = [];
    for (const [k, v] of Object.entries(b.occupancy)) {
      const house = Number(k);
      if (!Number.isInteger(house) || house < 1 || house > 12 || !OCC.includes(v)) {
        return reply.code(400).send({
          error: `occupancy["${k}"]: house must be 1-12 and the value one of ${OCC.join(' | ')}`,
        });
      }
      const verdict = charaHouseVerdict(house, v as 'benefic');
      if (verdict) findings.push({ house, occupancy: v, ...verdict });
    }
    let rasi = null;
    if (b.owner != null || b.rasiOccupant != null) {
      if (b.owner !== 'benefic' && b.owner !== 'malefic') {
        return reply.code(400).send({ error: 'owner must be benefic or malefic' });
      }
      if (!OCC.includes(b.rasiOccupant as string)) {
        return reply.code(400).send({ error: `rasiOccupant must be one of ${OCC.join(' | ')}` });
      }
      rasi = charaRasiVerdict(b.owner, b.rasiOccupant as 'benefic');
    }
    return {
      frame: CHARA_COUNTS_FROM_THE_DASHA_RASI,
      findings,
      rasi,
      inversion: CHARA_UPACHAYA_INVERSION,
      ...(rasi?.split ? { splitLimitation: WITHIN_PERIOD_SPLIT_IS_NEW } : {}),
      kalachakraTable: CH49_TABLE_NOT_ENCODED,
    };
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Part 39 — chapter 51. Antardasa in five systems: one reconciled, four new.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Subdivide a period in whichever system is asked for — BPHS 51.
   *
   * `system` picks the arithmetic, because the five are genuinely different shapes:
   * Vimshottari is proportional over 120, Kalachakra proportional over 100, the Chara dasha
   * of planets is an equal ninth, and a rasi dasha an equal twelfth.
   */
  app.get('/bphs/51/antardasa', async (req, reply) => {
    const q = req.query as { system?: string; years?: string; antarYears?: string };
    const years = qNum(q.years);
    const antarYears = qNum(q.antarYears);
    const SYSTEMS = ['vimshottari', 'kalachakra', 'chara-planets', 'rasi'];
    if (years == null || years <= 0) {
      return reply.code(400).send({ error: 'years must be a positive number' });
    }
    const system = typeof q.system === 'string' ? q.system : 'vimshottari';
    if (!SYSTEMS.includes(system)) {
      return reply.code(400).send({ error: `system must be one of ${SYSTEMS.join(' | ')}` });
    }
    if ((system === 'vimshottari' || system === 'kalachakra')
        && (antarYears == null || antarYears <= 0)) {
      return reply.code(400).send({
        error: `system=${system} is PROPORTIONAL, so antarYears is required — the sub-period `
          + 'depends on which party holds it. The equal systems (chara-planets, rasi) do not '
          + 'take it.',
      });
    }
    const asYmd = (y: number) => {
      const yr = Math.floor(y + 1e-9);
      const months = (y - yr) * 12;
      const mo = Math.floor(months + 1e-9);
      const days = (months - mo) * 30;
      const d = Math.floor(days + 1e-9);
      return { years: yr, months: mo, days: d, ghatikas: Math.round((days - d) * 60) };
    };
    let value: number;
    let basis: string;
    if (system === 'vimshottari') {
      value = (years * antarYears!) / 120;
      basis = 'BPHS 51.1 — proportional over a 120-year total.';
    } else if (system === 'kalachakra') {
      value = kalachakraAntardasaYears(years, antarYears!);
      basis = 'BPHS 51 — proportional over a 100-year total, between RASIS.';
    } else if (system === 'chara-planets') {
      value = charaPlanetAntardasaYears(years);
      basis = 'BPHS 51.3-4 — an equal NINTH; only the order carries information.';
    } else {
      value = rasiAntardasaYears(years);
      basis = 'BPHS 51.5 — an equal TWELFTH.';
    }
    return {
      system,
      antardasaYears: value,
      antardasa: asYmd(value),
      basis,
      ...(system === 'vimshottari' && Number.isInteger(years) && Number.isInteger(antarYears!)
        ? {
          shortcut: antardasaShortcut(years, antarYears!),
          shortcutNote: SHORTCUT_IS_EXACT,
        }
        : {}),
      verification: system === 'vimshottari' ? SUBDIVISION_VERIFIED
        : system === 'kalachakra' ? KALACHAKRA_ANTARDASA_TOTAL_IS_100
          : system === 'chara-planets' ? CHARA_PLANET_ANTARDASA_IS_EQUAL : null,
    };
  });

  /**
   * The ORDER of the twelve rasi antardasas — BPHS 51.6-12.
   *
   * Parity sets the direction and modality sets the pattern. `rasi` is the seed; 51.6 lets
   * it be the dasha rasi or the 7th from it, whichever is stronger, and the caller decides
   * which — passing the wrong one rotates the whole cycle by six.
   */
  app.get('/bphs/51/rasi-antardasa-order', async (req, reply) => {
    const q = req.query as { rasi?: string; years?: string };
    const rasi = qNum(q.rasi);
    if (rasi == null || rasi < 0 || rasi > 11) {
      return reply.code(400).send({ error: 'rasi must be an integer 0-11 (0 = Aries)' });
    }
    const years = qNum(q.years);
    const order = rasiAntardasaOrder(rasi as 0);
    return {
      rasi,
      order,
      ...(years != null && years > 0
        ? { eachAntardasaYears: rasiAntardasaYears(years) }
        : {}),
      rule: RASI_ANTARDASA_ORDER_RULE,
      seedChoice: SEED_IS_THE_STRONGER_OF_TWO,
      subtlety: DUAL_ORDER_COUNTS_IN_THE_DIRECTION_OF_TRAVEL,
    };
  });

  /** Paka and Bhoga rasi for a running rasi dasha — BPHS 51.9-12. */
  app.get('/bphs/51/paka-bhoga', async (req, reply) => {
    const q = req.query as { first?: string; paka?: string; association?: string };
    const first = qNum(q.first);
    const paka = qNum(q.paka);
    if (first == null || first < 0 || first > 11 || paka == null || paka < 0 || paka > 11) {
      return reply.code(400).send({
        error: 'first and paka must both be integers 0-11 (0 = Aries). `first` is the first '
          + 'dasha rasi of the cycle; `paka` is the one whose dasha is running.',
      });
    }
    const ASSOC = ['benefic', 'malefic', 'mixed'];
    const association = typeof q.association === 'string' ? q.association : null;
    if (association != null && !ASSOC.includes(association)) {
      return reply.code(400).send({ error: `association must be one of ${ASSOC.join(' | ')}` });
    }
    return {
      paka,
      bhoga: bhogaRasi(first as 0, paka as 0),
      sameRasi: first === paka,
      reading: association ? pakaBhogaVerdict(association as 'benefic') : null,
      unresolved: PAKA_BHOGA_PARITY_CLAUSE_UNRESOLVED,
    };
  });

  /** What chapter 51 gives, including what is recorded but deliberately not surfaced. */
  app.get('/bphs/51/subdivision', async () => ({
    reconciled: SUBDIVISION_VERIFIED,
    shortcut: SHORTCUT_IS_EXACT,
    tableFaults: ANTARDASA_TABLE_FAULTS,
    systems: [
      { name: 'Vimshottari family', rule: 'mahaYears × antarYears / 120', verse: '51.1-2' },
      { name: 'Chara dasha of planets', rule: 'dashaYears / 9 (equal)', verse: '51.3-4' },
      { name: 'Rasi dashas', rule: 'dashaYears / 12 (equal), with a modality-dependent order', verse: '51.5-12' },
      { name: 'Kalachakra', rule: 'dashaYears × antarRasiYears / 100', verse: '51 (unnumbered)' },
    ],
    pindaAmsaNisarga: {
      shares: PACHAKA_SHARES,
      withheld: PINDA_SUBDIVISION_RECORDED_NOT_SURFACED,
      provenance: CH51_TRANSLATOR_RECONSTRUCTED_13_16,
    },
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 40 — chapters 52-56. The join at full width.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * What a maha×antar pair brings — BPHS 52-56.
   *
   * `house` is the antar planet's position **counted from the dasha lord**, which is the frame
   * these five chapters read in. Without it the route returns the cell but no verdict, because
   * the chapters condition on position and saying otherwise would assert more than they do.
   */
  app.get('/bphs/dasha/antar', async (req, reply) => {
    const q = req.query as { maha?: string; antar?: string; house?: string };
    const maha = typeof q.maha === 'string' ? q.maha : null;
    const antar = typeof q.antar === 'string' ? q.antar : null;
    if (!maha || !antar) {
      return reply.code(400).send({
        error: 'maha and antar are both required, each a graha name. Chapters 52-56 cover the '
          + 'dashas of the Sun, Moon, Mars, Rahu and Jupiter; Saturn, Mercury, Ketu and Venus '
          + 'are chapters 57-60 and are not extracted yet.',
      });
    }
    const cell = ANTARDASA_CELLS.find((c) => c.maha === maha && c.antar === antar);
    if (!cell) {
      return reply.code(404).send({
        error: `no house-conditioned cell recorded for ${maha} x ${antar}`,
        note: CELLS_WITHOUT_A_HOUSE_CONDITION,
        frame: ANTARDASA_FRAME_IS_THE_DASHA_LORD,
      });
    }
    const house = qNum(q.house);
    if (house != null && (house < 1 || house > 12)) {
      return reply.code(400).send({ error: 'house must be an integer 1-12, counted FROM THE DASHA LORD' });
    }
    const inverted = maha === 'mars' && antar === 'saturn';
    let verdict: { valence: number; branch: string } | null = null;
    if (house != null) {
      if (cell.favourable.includes(house as 1)) {
        verdict = { valence: inverted ? -0.5 : 0.6, branch: 'favourable-position' };
      } else if (cell.adverse.includes(house as 1)) {
        verdict = { valence: -0.5, branch: 'adverse-position' };
      } else {
        verdict = { valence: 0, branch: 'unstated' };
      }
    }
    return {
      maha,
      antar,
      chapter: cell.chapter,
      verses: cell.verses,
      favourableFromDashaLord: cell.favourable,
      adverseFromDashaLord: cell.adverse,
      house,
      verdict,
      ...(verdict?.branch === 'unstated'
        ? { note: 'The chapter names no reading for this position — silence, not neutrality.' }
        : {}),
      ...(inverted ? { exception: MARS_SATURN_BREAKS_THE_SHAPE } : {}),
      frame: ANTARDASA_FRAME_IS_THE_DASHA_LORD,
      notCarried: [RITUAL_REMEDIES_NOT_CARRIED, MARAKA_RIDER_DROPPED, MEDICAL_CLAIMS_DROPPED],
    };
  });

  /** The whole 26-cell table, its shape, and how the damaged source was repaired. */
  app.get('/bphs/dasha/antar/cells', async () => ({
    cells: ANTARDASA_CELLS,
    rules: antardasaCellRules(),
    frame: ANTARDASA_FRAME_IS_THE_DASHA_LORD,
    shape: ANTARDASA_CONDITION_SHAPE,
    exception: MARS_SATURN_BREAKS_THE_SHAPE,
    attribution: HEADINGS_RECOVERED_BY_CH51_ORDER,
    absentCells: CELLS_WITHOUT_A_HOUSE_CONDITION,
    notCarried: [RITUAL_REMEDIES_NOT_CARRIED, MARAKA_RIDER_DROPPED, MEDICAL_CLAIMS_DROPPED],
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 41 — chapters 57-60. The other 36 pairs.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * The chapters 57-60 half of the antardasa table, kept beside `/bphs/dasha/antar/cells`
   * rather than merged into it — the two blocks were extracted under different conditions and
   * carry different caveats, and a caller comparing them should see which is which.
   */
  app.get('/bphs/dasha/antar/cells-57-60', async () => ({
    cells: ANTARDASA_CELLS_57_60,
    rules: antardasaCellRules57(),
    shape: SHAPE_IS_CLEANER_HERE,
    coverage: CELLS_57_60_COVERAGE,
    attribution: ATTRIBUTION_HELD_ON_A_WORSE_SOURCE,
    refuted: ENMITY_AXIS_REFUTED,
    notCarried: REFUSALS_57_60,
  }));

  /**
   * The enmity hypothesis, and why it is closed.
   *
   * Served on its own route because a refuted hypothesis is easy to revive by accident: a
   * later reader meeting BPHS 54.30-32 alone will reach for the same explanation, and this is
   * where the evidence against it lives.
   */
  app.get('/bphs/dasha/antar/enmity', async () => ({
    status: 'refuted',
    finding: ENMITY_AXIS_REFUTED,
    proposedIn: 'Part 40, from BPHS 54.30-32 (Mars dasha, Saturn antardasa)',
    refutedBy: 'BPHS 57.55-57 (Saturn dasha, Mars antardasa) — a favourable reading',
    reasoning: 'An enmity rule is symmetric in its two lords. This pair is not: one order is '
      + 'adverse and the other favourable, so whatever governs 54.30-32 is not the enmity.',
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 42 — chapter 61. The pratyantar: computable, but not read flat.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * The pratyantar level — BPHS 61.
   *
   * Returns the SPAN and the ORDER, which are computable and verified, and explains why no
   * effect reading is offered. A caller asking "what does this pratyantar mean" gets a
   * redirection to what the corpus can actually support, not an empty object.
   */
  app.get('/bphs/61/pratyantar', async (req, reply) => {
    const q = req.query as { maha?: string; antar?: string };
    const maha = typeof q.maha === 'string' ? q.maha : null;
    const antar = typeof q.antar === 'string' ? q.antar : null;
    const YEARS: Record<string, number> = {
      sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16,
      saturn: 19, mercury: 17, ketu: 7, venus: 20,
    };
    if (!maha || !antar || YEARS[maha] == null || YEARS[antar] == null) {
      return reply.code(400).send({
        error: 'maha and antar are both required and must each be one of '
          + Object.keys(YEARS).join(', '),
      });
    }
    const antarYears = (YEARS[maha]! * YEARS[antar]!) / 120;
    const start = PRATYANTAR_ORDER.indexOf(antar as 'sun');
    const order = Array.from({ length: 9 }, (_, k) => PRATYANTAR_ORDER[(start + k) % 9]!);
    const asDaysGhatikas = (years: number) => {
      const d = years * 360;
      const whole = Math.floor(d + 1e-9);
      return { days: whole, ghatikas: Math.round((d - whole) * 60) };
    };
    return {
      maha,
      antar,
      antardasaYears: antarYears,
      // 51.2 / 61: the run starts at the antardasa lord and follows the Vimshottari order.
      pratyantars: order.map((lord) => {
        const years = (antarYears * YEARS[lord]!) / 120;
        return { lord, years, ...asDaysGhatikas(years) };
      }),
      verification: PRATYANTAR_FORMULA_VERIFIED,
      orderConfirmed: COLUMN_ORDER_CONFIRMS_51_2,
      effects: {
        offered: false,
        why: CH61_EFFECTS_REFUSED,
        chaptersOwnInstruction: PRATYANTAR_EFFECTS_ARE_DEFEASIBLE,
        instead: PRATYANTAR_WHAT_WE_OFFER_INSTEAD,
      },
    };
  });

  /** What chapter 61 gave, and what it did not — including the table faults. */
  app.get('/bphs/61/summary', async () => ({
    verified: PRATYANTAR_FORMULA_VERIFIED,
    tableFaults: PRATYANTAR_TABLE_FAULTS_ARE_DIGIT_LEVEL,
    orderConfirmed: COLUMN_ORDER_CONFIRMS_51_2,
    arbitration: PRATYANTAR_EFFECTS_ARE_DEFEASIBLE,
    refused: CH61_EFFECTS_REFUSED,
    instead: PRATYANTAR_WHAT_WE_OFFER_INSTEAD,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 43 — chapters 62-63. Levels four and five.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * A sookshma or prana span — BPHS 62.1 / 63.1.
   *
   * Takes the full lord chain because that is what determines the span. Returns the period
   * and, deliberately, how long it is relative to the birth-time uncertainty: a caller asking
   * for a 19-minute period should be told what that means before being told anything else.
   */
  app.get('/bphs/62/span', async (req, reply) => {
    const q = req.query as { chain?: string };
    const YEARS: Record<string, number> = {
      sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16,
      saturn: 19, mercury: 17, ketu: 7, venus: 20,
    };
    const chain = typeof q.chain === 'string' ? q.chain.split(',').map((x) => x.trim()) : [];
    if (chain.length < 2 || chain.length > 5 || chain.some((g) => YEARS[g] == null)) {
      return reply.code(400).send({
        error: 'chain must be 2-5 comma-separated graha names, outermost first — e.g. '
          + 'chain=venus,rahu,moon,mars for a sookshma. Valid: ' + Object.keys(YEARS).join(', '),
      });
    }
    let years = YEARS[chain[0]!]!;
    for (const g of chain.slice(1)) years = (years * YEARS[g]!) / 120;
    const days = years * 360;
    const LEVELS = ['maha', 'antar', 'pratyantar', 'sookshma', 'prana'];
    const level = LEVELS[chain.length - 1]!;
    return {
      chain,
      level,
      years,
      days,
      hours: days * 24,
      formula: SUBDIVISION_RECURSES_AT_EVERY_LEVEL,
      ...(level === 'sookshma' || level === 'prana'
        ? {
          display: {
            recommended: false,
            why: SPANS_ARE_BELOW_THE_BIRTH_TIME_RESOLUTION,
            spans: SOOKSHMA_PRANA_SPANS,
          },
          effects: {
            offered: false,
            why: CH62_63_EFFECTS_REFUSED,
            instead: SOOKSHMA_PRANA_STILL_COMPUTABLE,
          },
        }
        : {}),
    };
  });

  /** What chapters 62-63 gave, and the four grounds on which their readings were refused. */
  app.get('/bphs/62/summary', async () => ({
    formula: SUBDIVISION_RECURSES_AT_EVERY_LEVEL,
    spans: SOOKSHMA_PRANA_SPANS,
    belowResolution: SPANS_ARE_BELOW_THE_BIRTH_TIME_RESOLUTION,
    noCondition: NO_CELL_STATES_A_CONDITION,
    noDefeasibilityClause: NO_DEFEASIBILITY_CLAUSE_HERE,
    refused: CH62_63_EFFECTS_REFUSED,
    stillComputable: SOOKSHMA_PRANA_STILL_COMPUTABLE,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 44 — chapter 64. Kalachakra antardasa.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * A Kalachakra antardasa: its span, and BPHS 64.56-58's friendship reading.
   *
   * The two halves come from different chapters — the span from 51/64's arithmetic and the
   * reading from 64.56-58 — and both are returned because a caller asking about a sub-period
   * wants how long and what kind.
   */
  app.get('/bphs/64/kalachakra-antar', async (req, reply) => {
    const q = req.query as { dashaRasi?: string; antarRasi?: string };
    const d = qNum(q.dashaRasi);
    const a = qNum(q.antarRasi);
    if (d == null || d < 0 || d > 11 || a == null || a < 0 || a > 11) {
      return reply.code(400).send({
        error: 'dashaRasi and antarRasi must both be integers 0-11 (0 = Aries)',
      });
    }
    const dashaYears = CH64_RASI_YEARS[d]!;
    const antarYears = CH64_RASI_YEARS[a]!;
    // BPHS 51 / 64: the Kalachakra total is 100, not 120.
    const years = (dashaYears * antarYears) / 100;
    const months = years * 12;
    const wholeMonths = Math.floor(months + 1e-9);
    const days = (months - wholeMonths) * 30;
    const wholeDays = Math.floor(days + 1e-9);
    return {
      dashaRasi: d,
      antarRasi: a,
      dashaYears,
      antarRasiYears: antarYears,
      antardasa: {
        years,
        months: wholeMonths,
        days: wholeDays,
        ghatikas: Math.round((days - wholeDays) * 60),
      },
      reading: kalachakraAntarVerdict(d as 0, a as 0),
      rule: KALACHAKRA_FRIENDSHIP_RULE,
      yearsAreConstant: RASI_YEARS_ARE_A_PER_RASI_CONSTANT,
    };
  });

  /** What chapter 64 confirmed, what it added, and what was refused. */
  app.get('/bphs/64/summary', async () => ({
    rasiYears: CH64_RASI_YEARS,
    confirmed: RASI_YEARS_CONFIRMED_INDEPENDENTLY,
    structure: RASI_YEARS_ARE_A_PER_RASI_CONSTANT,
    tableFault: ARIES_AMSA_TABLE_HAS_ONE_FAULT,
    friendshipRule: KALACHAKRA_FRIENDSHIP_RULE,
    savyaOnlyHabit: SAVYA_ONLY_HABIT_SUPPORTS_CANDIDATE_ONE,
    refused: CH64_EFFECT_PROSE_REFUSED,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 45 — chapter 65. A layout that confirms a structure.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * What chapter 65 confirmed, and why its readings are not served.
   *
   * The blocks are exposed because they are evidence, not content: each one is a window of
   * `SAVYA_24` that a caller can re-derive and check for themselves.
   */
  app.get('/bphs/65/summary', async () => ({
    blocks: CH65_BLOCKS.map((b) => ({
      ...b,
      sequence: ch65BlockSequence(b.offset, b.cells),
    })),
    confirms: CH65_ORDER_CONFIRMS_SAVYA_24,
    keying: CELLS_ARE_KEYED_BY_WHEEL_POSITION,
    readings: { offered: false, why: CH65_READINGS_REFUSED },
    remedy: { offered: false, why: CH65_RITUAL_REMEDY_REFUSED },
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 46 — chapters 75-77. Strength decides a classification.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * The five Pancha Mahapurusha yogas as BPHS 75.1 states them — three conditions, including
   * the strength the shipped detector omits.
   *
   * The divergence is served with the rules rather than hidden behind them, because a caller
   * comparing this against `detectYogas` will get different answers for about one chart in
   * fourteen and deserves to know why.
   */
  app.get('/bphs/75/mahapurusha', async () => ({
    yogas: MAHAPURUSHA_YOGAS,
    rules: mahapurushaRules(),
    divergence: MAHAPURUSHA_STRENGTH_CONDITION_MISSING,
    impact: MAHAPURUSHA_STRENGTH_IMPACT,
    descriptionsRefused: CH75_DESCRIPTIONS_REFUSED,
  }));

  /**
   * The elemental temperament and the guna, both decided by Shadbala — BPHS 76 and 77.1-4.
   *
   * POST { shadbala: { sun: 400, moon: 380, … } }. Silence rather than a guess when no
   * strength is supplied, because both readings are strength-derived and nothing else.
   */
  app.post('/bphs/76/temperament', async (req, reply) => {
    const b = req.body as { shadbala?: Record<string, number> };
    if (!b?.shadbala || typeof b.shadbala !== 'object') {
      return reply.code(400).send({
        error: 'shadbala is required: an object keyed by graha name with virupa totals. Both '
          + 'the element (ch 76) and the guna (77.1-4) are decided by strength and by nothing '
          + 'else, so there is no reading without it.',
      });
    }
    for (const [g, v] of Object.entries(b.shadbala)) {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
        return reply.code(400).send({ error: `shadbala.${g} must be a non-negative number` });
      }
    }
    const el = dominantElement(b.shadbala);
    const gu = dominantGuna(b.shadbala);
    return {
      element: el,
      guna: gu,
      elementOfPlanet: ELEMENT_OF_PLANET,
      gunaOfPlanet: GUNA_OF_PLANET,
      mappingBasis: ELEMENT_MAPPING_IS_STATED_FOUR_TIMES,
      notCarried: [CH76_TEMPERAMENT_DESCRIPTIONS_REFUSED, CH77_CLASS_HIERARCHY_REFUSED],
      ...(el?.tied && el.tied.length > 1
        ? { note: 'The leading elements are tied; 76.2 reads effects "in proportion to the '
            + 'intensity", so no winner is declared.' }
        : {}),
    };
  });

  /**
   * What chapter 77 says that this engine will not repeat.
   *
   * Served on its own route for the same reason the refuted enmity axis is: the material is
   * the kind a later reader might try to rescue as "structural", and this is where the reason
   * it was refused lives.
   */
  app.get('/bphs/77/refused', async () => ({
    status: 'refused-in-full',
    scope: 'BPHS 77.5-22',
    why: CH77_CLASS_HIERARCHY_REFUSED,
    kept: 'Only 77.1-4’s planet→guna grouping, with its character verdicts dropped. '
      + '`dominantGuna` reports which guna predominates and says nothing about the person.',
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 47 — chapters 78-79. Rectification, and the yuddha winner at last.
  // ───────────────────────────────────────────────────────────────────────────

  /** BPHS 78's birth-time rectification procedure, as a stated cascade. */
  app.get('/bphs/78/rectification', async () => ({
    cascade: RECTIFICATION_CASCADE,
    substitutions: RITU_SUBSTITUTIONS,
    substitutionRule: RITU_SUBSTITUTION_IS_ONE_DIRECTIONAL,
    limitation: RECTIFICATION_NEEDS_AN_OUTSIDE_FACT,
    whatThisChapterIs: CH78_IS_RECTIFICATION_NOT_PRASHNA,
  }));

  /**
   * BPHS 78.10-12's samvatsara ladder. Without `age` this returns candidates 12 years apart
   * and picks none — which is the honest answer, not a failure.
   */
  app.get('/bphs/78/samvatsara', async (req, reply) => {
    const q = req.query as { jupiterAtQuery?: string; jupiterAtBirth?: string; age?: string };
    const jq = qNum(q.jupiterAtQuery);
    const jb = qNum(q.jupiterAtBirth);
    if (jq == null || jq < 0 || jq > 11 || jb == null || jb < 0 || jb > 11) {
      return reply.code(400).send({
        error: 'jupiterAtQuery and jupiterAtBirth must both be integers 0-11 (0 = Aries)',
      });
    }
    const age = qNum(q.age);
    const r = samvatsaraCandidates(jq, jb, age ?? undefined);
    return {
      ...r,
      note: r.chosen == null
        ? 'Jupiter returns to a rasi every 12 years, so these candidates are equally consistent '
          + 'with the chart. Pass age= to resolve, as BPHS 78.11-12 does.'
        : null,
      limitation: RECTIFICATION_NEEDS_AN_OUTSIDE_FACT,
    };
  });

  /**
   * BPHS 79.9 — who wins a planetary war.
   *
   * Served because 27.20 could not answer it: the transfer route has taken the victor as an
   * argument since Part 27, and this is where the victor now comes from.
   */
  app.get('/bphs/79/yuddha-victor', async (req, reply) => {
    const q = req.query as { a?: string; aLat?: string; b?: string; bLat?: string };
    const a = typeof q.a === 'string' ? q.a : null;
    const b = typeof q.b === 'string' ? q.b : null;
    const aLat = qNum(q.aLat);
    const bLat = qNum(q.bLat);
    const WAR = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    if (!a || !b || !WAR.includes(a) || !WAR.includes(b) || a === b) {
      return reply.code(400).send({
        error: `a and b must be two different planets from ${WAR.join(', ')} — BPHS 79.9 `
          + 'restricts planetary war to these five.',
      });
    }
    if (aLat == null || bLat == null) {
      return reply.code(400).send({
        error: 'aLat and bLat (celestial latitudes, north positive) are required: 79.9 decides '
          + 'by which side of the ecliptic a planet is on.',
      });
    }
    const r = grahaYuddhaVictor({ graha: a as 'mars', latitude: aLat },
      { graha: b as 'mars', latitude: bLat });
    return {
      orbDegrees: YUDDHA_ORB_DEGREES,
      result: r,
      ...(r == null
        ? { note: 'Equal latitudes — BPHS 79.9 does not cover this case, so no victor is named.' }
        : {}),
      basis: YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL,
    };
  });

  /** The ascetic yogas, with an explicit account of what was withheld and why. */
  app.get('/bphs/79/ascetic', async () => ({
    rules: asceticYogaRules(),
    ordersByStrongest: ASCETIC_ORDER_BY_STRONGEST,
    ordersAreData: ASCETIC_ORDERS_ARE_DATA_NOT_A_READING,
    broaderThanTheVerse: STELLIUM_STRENGTH_NOT_ENCODED,
    withheld: CH79_PROXY_RULES_WITHHELD,
    gaps: [CH79_VARGA_CLAUSE_GAP, CH79_REMAINING_CLAUSES_NOT_ENCODED],
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 48 — chapters 80-82. A refusal, served so it can be audited.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * What BPHS chapters 80-82 contain and why none of it is encoded.
   *
   * Served rather than merely committed, because a refusal a caller cannot inspect is
   * indistinguishable from an omission. The refused verses are enumerated with what each
   * actually claims, so anyone comparing this engine against the chapter can see exactly what
   * is missing and on what ground.
   */
  app.get('/bphs/80/refused', async () => ({
    status: 'refused',
    scope: 'BPHS chapter 80 in full except 80.8; chapters 81 and 82 excluded',
    summary: CH80_REFUSED,
    verses: CH80_REFUSED_VERSES,
    whyNotFiltered: LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE,
    physiognomy: CH81_82_EXCLUDED,
    onTheCorpus: SAME_INSTRUMENTS_DIFFERENT_SUBJECT,
    kept: {
      verse: '80.8',
      rule: STRONGER_OF_LAGNA_OR_MOON,
      alsoStatedIn: STRENGTH_RESOLVES_TWO_REFERENCE_POINTS,
    },
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 49 — chapter 83. Refused, and it named a new ground.
  // ───────────────────────────────────────────────────────────────────────────

  /** What BPHS chapter 83 contains, and the four grounds on which none of it is encoded. */
  app.get('/bphs/83/refused', async () => ({
    status: 'refused-in-full',
    scope: 'BPHS chapter 83 — effects of curses in the previous birth',
    summary: CH83_REFUSED,
    architecture: CH83_ARCHITECTURE,
    curseSources: CURSE_SOURCES,
    newGround: BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND,
    whyNotJustTheCombinations: COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED,
    remedies: CH83_RITUAL_REMEDIES_REFUSED,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 50 — chapters 84-96. The map, without the recipes.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * What BPHS chapters 84-96 are about, and why none of their remedies is served.
   *
   * The taxonomy is returned; no remedy is, and there is no field in the underlying data that
   * holds one — the refusal is structural rather than a disclaimer wrapped around a list.
   */
  app.get('/bphs/84/remedial-block', async () => ({
    status: 'taxonomy-only',
    chapters: REMEDIAL_CHAPTERS,
    remedies: {
      served: false,
      why: CH96_INSTRUCTS_HARM,
      measurement: STANDING_CONSTRAINT_EMPTIES_THIS_BLOCK,
      counts: REMEDIAL_VOCABULARY_COUNTS,
    },
    mapNotRecipe: MAP_KEPT_RECIPE_REFUSED,
    framing: BIRTH_TREATED_AS_MISFORTUNE,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Part 51 — the last. Protection without the threat.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * BPHS chapter 10's antidotes, surfaced without chapter 9's arishta.
   *
   * The asymmetry is the point: a cancellation is not a doom claim but the corpus revoking
   * one, so the engine can say a chart is well defended without ever having said what from.
   */
  app.get('/bphs/10/protections', async () => ({
    rules: arishtaCancellationRules(),
    design: CH10_ENCODED_WITHOUT_CH09,
    whatWasRefused: CH09_REFUSED,
    sourcesOwnRestraint: BPHS_STATES_ITS_OWN_ABSTENTION,
    calibration: CANCELLATIONS_FAIL_AS_ASSERTIONS,
    mechanism: ANTIDOTE_MECHANISM_OUTLIVED_ITS_SOURCE,
  }));

  /** Why chapters 43, 44 and 71 are computed and never surfaced. */
  app.get('/bphs/43/longevity-policy', async () => ({
    status: 'computed-never-surfaced',
    policy: LONGEVITY_COMPUTED_NEVER_SURFACED,
    maraka: MARAKA_DERIVATION,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // Shadbala, the bhava madhya, and BPHS 75.1's third condition.
  // ───────────────────────────────────────────────────────────────────────────

  /** The equal-house bhava madhya — the convention, and the twelve midpoints. */
  app.get('/bphs/bhava-madhya', async (req, reply) => {
    const q = req.query as { lagnaLongitude?: string };
    const lagna = qNum(q.lagnaLongitude);
    if (lagna == null || lagna < 0 || lagna >= 360) {
      return reply.code(400).send({ error: 'lagnaLongitude must be a number in [0, 360)' });
    }
    return {
      convention: BHAVA_MADHYA_CONVENTION,
      houses: Array.from({ length: 12 }, (_, i) => {
        const h = (i + 1) as 1;
        return { house: h, madhya: bhavaMadhya(lagna, h), sandhi: bhavaSandhi(lagna, h) };
      }),
    };
  });

  /**
   * BPHS 27's six-fold strength, assembled.
   *
   * POST the birth circumstances; whatever cannot be computed comes back as a named missing
   * component rather than a zero, and a partial total is reported as unjudgeable.
   */
  app.post('/bphs/27/shadbala', async (req, reply) => {
    const b = req.body as { lagnaLongitude?: number; planets?: Record<string, unknown> };
    if (typeof b?.lagnaLongitude !== 'number' || !b.planets || typeof b.planets !== 'object') {
      return reply.code(400).send({
        error: 'lagnaLongitude (number) and planets (object keyed by graha) are required. '
          + 'Shadbala needs birth circumstances and infers none of them — anything absent is '
          + 'reported as a missing component, never estimated.',
      });
    }
    const results = shadbalaPinda(b as Parameters<typeof shadbalaPinda>[0]);
    return {
      planets: Object.fromEntries(Object.entries(results).map(([g, r]) => [g, {
        ...r,
        verdict: shadbalaVerdictOf(r),
      }])),
      guard: INCOMPLETE_TOTALS_ARE_NEVER_JUDGED,
      stillMissing: SHADBALA_INPUTS_STILL_MISSING,
    };
  });

  /**
   * Grade a Pancha Mahapurusha yoga against all three of BPHS 75.1's conditions.
   *
   * The placement is the caller's (the engine detects it); this adds the strength condition,
   * and returns "not assessed" rather than a verdict when the Shadbala cannot be completed.
   */
  app.post('/bphs/75/grade', async (req, reply) => {
    const b = req.body as {
      graha?: string; placement?: boolean;
      shadbala?: Parameters<typeof gradeMahapurusha>[2];
    };
    const FIVE = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    if (!b?.graha || !FIVE.includes(b.graha) || typeof b.placement !== 'boolean') {
      return reply.code(400).send({
        error: `graha must be one of ${FIVE.join(', ')} — BPHS 75.1 names no luminary — and `
          + 'placement must be a boolean (own sign or exaltation, in a kendra).',
      });
    }
    return {
      ...gradeMahapurusha(b.graha as 'mars', b.placement, b.shadbala),
      basis: BALIBHIH_IS_A_CONDITION,
      policy: YOGA_IS_GRADED_NOT_DELETED,
      evidence: REAL_RATE_JUSTIFIES_THE_CONDITION,
    };
  });
}
