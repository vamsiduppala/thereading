// @aura/knowledge — public API. Structured Vedic-astrology rule data + interpretation.

export * from './types.js';
export { GRAHAS, GRAHA_KEYS } from './data/grahas.js';
export { RASIS, RASI_BY_INDEX } from './data/rasis.js';
export { BHAVAS, BHAVA } from './data/bhavas.js';
export { NAKSHATRAS, NAKSHATRA_BY_INDEX } from './data/nakshatras.js';
export { YOGAS, YOGA_BY_KEY } from './data/yogas.js';
export {
  SANKHYA_YOGAS, sankhyaYoga, AAKRITI_YOGAS, matchAakritiYogas,
  VAJRA_YOGA, YAVA_YOGA, vajraYavaYoga,
  type SankhyaYoga, type AakritiYoga, type BeneficMaleficYoga,
} from './data/naabhasa.js';
export {
  rajaYogas, vipareetaYoga, houseLord, houseOf, QUADRANTS, TRINES, DUSTHANAS,
  type PlanetSigns, type RajaAssociation, type RajaYogaLink, type VipareetaYoga,
} from './data/rajayoga.js';
export { DIVISIONALS, DIVISIONAL_BY_N, type DivisionalKnowledge } from './data/divisionals.js';
export {
  CHARA_KARAKAS, STHIRA_KARAKAS, NAISARGIKA_HOUSE_KARAKA, charaKarakas,
  type CharaKaraka, type SthiraKaraka, type CharaKarakaAssignment,
} from './data/karakas.js';
export {
  FUNCTIONAL_NATURE, functionalNatureFor, functionalNatureIsComplete, baadhakaHouse,
  type FunctionalNature,
} from './data/functional.js';
export {
  TRANSIT_FROM_MOON, isFavourableTransit, sadeSatiPhase,
  VEDHA_STHAANA, VEDHA_EXCEPTIONS, vedhaHouse, vedhaObstructors,
  SODHYA_PINDA_MATTERS, sodhyaPindaTiming, type TransitRule, type SodhyaTiming,
} from './data/transits.js';
export {
  NATURAL_RELATIONS, naturalRelation, temporaryRelation, compoundRelation,
  type Relation, type CompoundRelation,
} from './data/relationships.js';
export { REMEDIES, behaviouralRemedy, type Remedy } from './data/remedies.js';
export { DIGNITIES, dignityOf, type DignityDef } from './data/dignities.js';
export {
  GRAHA_DRISHTI, advanceHouse, grahaAspectsFrom, rasiDrishti,
  ARGALA_PRIMARY, ARGALA_SECONDARY, VIRODHARGALA, ARGALA_MEANING, argalaOn,
  ASPECT_NOTES, type ArgalaSource,
} from './data/aspects.js';
export {
  arudhaOf, allArudhas, arudhaTable, ARUDHA_NAMES, ARUDHA_USE, CO_LORD,
  grahaArudha, grahaArudhas, OWN_SIGNS,
  type ArudhaResult,
} from './data/arudhas.js';
export {
  vargaSign, allVargas, VARGA_DIVISORS, vargaStanding, dwadasaVargeeyaBala, DWADASA_VARGAS,
  type VargaDivisor, type DwadasaBala,
} from './data/varga.js';
export {
  bhavaLagna, horaLagna, ghatiLagna, sreeLagna, specialLagnas,
  SPECIAL_LAGNA_USE, HOUSE_REFERENCES, HOUSE_REFERENCE_EXAMPLE,
  type SpecialLagnas, type HouseReference,
} from './data/lagnas.js';
export {
  sunUpagrahas, partLords, upagrahaFraction, UPAGRAHA_PART, UPAGRAHA_NOTES,
  type SunUpagrahas,
} from './data/upagrahas.js';
export {
  ashtakavarga, bhinnashtakavarga, AV_TABLE, AV_PLANETS,
  trikonaSodhana, ekadhipatyaSodhana, sodhitaAshtakavarga, sodhyaPinda,
  TRIKONA_GROUPS, EKADHIPATYA_PAIRS, RASI_MULTIPLIER, GRAHA_MULTIPLIER,
  type AVPlanet, type AVRef, type RefSigns, type AshtakavargaResult, type SodhyaPinda,
} from './data/ashtakavarga.js';
export {
  tithiOf, nityaYoga, karanaOf, horaLord, panchanga,
  matterTithi, tithiPanchaka, KARMA_TITHI_SPEED, DHANA_TITHI_SPEED, TITHI_PANCHAKA,
  NITYA_YOGAS, WEEKDAY_LORD, type Tithi, type Panchanga,
} from './data/panchanga.js';
export {
  VIMSHOTTARI_ORDER, VIMSHOTTARI_YEARS, VIMSHOTTARI_TOTAL, nakshatraLord,
  dashaBalanceAtBirth, dashaSequence, subPeriodYears, antardashas, DASHA_VARIATION_OFFSET,
  subdivideDasha, DASHA_LEVELS,
  type DashaBalance, type DashaSpan, type DashaNode,
} from './data/vimshottari.js';
export {
  ASHTOTTARI_ORDER, ASHTOTTARI_YEARS, ASHTOTTARI_TOTAL,
  ashtottariBalanceAtBirth, ashtottariAntardashas,
  type AshtottariBalance,
} from './data/ashtottari.js';
export {
  MARAKA_HOUSES, marakaLords, RUDRA_8TH_SIGN, rudra8thSign, signModality,
  pairLongevity, LONGEVITY_RANGES, combineThreePairs, LONGEVITY_NOTES, maheswara,
  rudra, trishoolaRasis, maheswaraFull,
  type LifeSpan, type Modality, type RudraCandidate, type MaheswaraOpts,
} from './data/longevity.js';
// Post-programme. The bhava madhya convention, and the Shadbala assembler it unblocks.
export {
  BHAVA_ARC, BHAVA_SANDHI_HALF_ARC, bhavaMadhya, bhavaSandhi, bhavaOf,
  BHAVA_MADHYA_CONVENTION, BHAVA_MADHYA_IS_A_CHOICE,
} from './data/bhava.js';
export {
  shadbalaPinda, shadbalaVerdictOf, meetsShadbalaRequirement,
  INCOMPLETE_TOTALS_ARE_NEVER_JUDGED, SHADBALA_ASSEMBLER_CLOSES_A_GAP,
  type ShadbalaInput, type ShadbalaPlanetInput, type ShadbalaComponents,
  type ShadbalaPlanetResult,
} from './data/shadbala-pinda.js';
export {
  gradeMahapurusha, BALIBHIH_IS_A_CONDITION, YOGA_IS_GRADED_NOT_DELETED,
  REAL_RATE_JUSTIFIES_THE_CONDITION, SHADBALA_INPUTS_STILL_MISSING,
  SHADBALA_INPUTS_ARE_LOCALLY_OBTAINABLE,
  type MahapurushaGrade, type MahapurushaGradeResult,
} from './data/mahapurusha-grade.js';
export {
  assessAtmakaraka, adverseAtmakarakaPredicates, atmakarakaRescuePredicates,
  ADVERSE_AK_MALEFICS, ADVERSE_AK_RESCUERS, ADVERSE_AK_DIGNITIES,
  ADVERSE_AK_IS_JAIMINI_NOT_BPHS, ADVERSE_AK_NEEDED_THE_VARGA_FRAME,
  AK_UNKNOWN_IS_NOT_FAVOURABLE,
  type AtmakarakaCondition, type AtmakarakaVerdict, type AtmakarakaAssessment,
} from './data/atmakaraka-adverse.js';
export {
  baladiAvastha, jagradiAvastha, deeptadiAvastha, AVASTHA_NOTES,
  moodConjunctionAvasthas, lajjitadiAvasthas, LAJJITADI_NOTES,
  type Baladi, type Jagradi, type Deeptadi, type MoodFacts, type LajjitadiFacts, type Lajjitadi,
} from './data/avasthas.js';
export {
  narayanaProgression, narayanaDasaLength, narayanaSecondCycle, narayanaAntardashas, vargaSeedHouse,
  type RasiMotion, type DasaLengthOpts, type Antardasa,
} from './data/narayana.js';
export {
  kendradiProgression, lagnaKendradiDasa, sudasa, drigdasa,
  shoolaDasa, shoolaAntardashas, niryaanaShoolaDasa, MODALITY_YEARS,
  type Sudasa, type RasiSpan,
} from './data/rasidasha.js';
export {
  kalachakraPada, isSavya, KALACHAKRA_RASI_YEARS, MIRROR_SIGN, SAVYA_24, APASAVYA_24,
  type KalachakraPada,
} from './data/kalachakra.js';
export {
  TARAS, taraOf, SPECIAL_NAKSHATRAS, specialNakshatra,
  NAKSHATRA_ASPECTS, nakshatraAspectsFrom, LATTA_OFFSET, lattaNakshatra, murthiOf,
  type Tara, type TaraResult, type Murthi,
} from './data/taras.js';
export {
  muntha, MUNTHA_IN_HOUSE, TAJAKA_ASPECTS, DEEPTAMSA, HARSHA_HOUSE, harshaBala,
  DEEP_EXALTATION, uchchaBala, HADDA_LORDS, haddaLord,
  KSHETRA_BALA, HADDA_BALA, DREKKANA_BALA, NAVAMSA_BALA, panchaVerdict, panchaVargeeyaBala,
  type TajakaAspect, type ClassicalGraha, type TajakaTier, type PanchaVerdict, type PanchaVargeeyaInput,
} from './data/tajaka.js';
export {
  saham, computeSahams, SAHAM_FORMULAS, computeBhavaSahams, BHAVA_SAHAM_FORMULAS,
  type SahamToken, type SahamFormula, type SahamContext, type BhavaSahamContext,
} from './data/sahams.js';
export {
  TAJAKA_SPEED_ORDER, tajakaSpeedRank, fasterPlanet, ithasala, ishkavala, induvara,
  TAJAKA_YOGAS, type IthasalaKind, type IthasalaResult,
} from './data/tajakayoga.js';
export {
  MUDDA_ORDER, muddaDays, muddaDasa,
  PATYAYINI_YEAR_DAYS, patyayiniDasa, patyayiniAntardasas, varshaNarayanaDasa,
  type MuddaSpan, type MuddaResult, type PatyayiniToken, type PatyayiniSpan, type PatyayiniAntar,
  type VarshaNarayanaResult,
} from './data/annualdasha.js';
export {
  sudarsanaDasa, sudarsanaAllRefs, type SudarsanaDasa, type SudarsanaAllRefs,
} from './data/sudarsana.js';
export {
  MUHURTA_GUIDELINES, RIKTA_TITHIS, muhurtaCheck,
  type MuhurtaGuideline, type MuhurtaCheck,
} from './data/muhurta.js';
export {
  ETHICS_PRINCIPLES, RATIONAL_PRINCIPLES, BIRTHTIME_RECTIFICATION, MUNDANE_PRINCIPLES,
  ANALYSIS_GUIDELINES,
} from './data/reference.js';
export { getGraha, getRasi, getBhava, getNakshatra, search, type SearchHit } from './query.js';
export {
  interpretPlacement, interpretLagnaLord, classifyDignity,
  type Placement, type Interpretation, type Dignity,
} from './interpret.js';

// ── BPHS extraction programme (docs/BPHS_PROGRAMME.md) ───────────────────────
// Part 1 — the predicate substrate + Chapter 3.
export {
  evaluate, evaluateAll, explain, houseOfSign, signOfHouse, lordOfSign,
  type Predicate, type PredicateKind, type ChartFacts, type PlanetFact,
  type DignityState, type PlanetRef, type ConjunctParty, type CompoundRelationState, type DashaLevel,
} from './rules/predicate.js';
export {
  arity, fired, rank, nonDiscriminative, suspectRules,
  BASE_RATE_SUPPRESS, BASE_RATE_SUSPECT,
  type Rule, type RuleSource, type RuleHit, type Effect, type EffectDomain,
  type Verification,
  PHASE_ENCODES_THE_LABEL_NOT_THE_BOUNDARY,
} from './rules/rule.js';
export {
  CLASSICAL_SEVEN,
  DEEP_EXALTATION_POINTS, exaltationCloseness, type DeepPoint,
  DIGNITY_BANDS, OWN_SIGNS_WHOLE, bandFor, type DignityBand,
  MOOLATRIKONA_SIGN, FRIEND_HOUSES_FROM_MT, ENEMY_HOUSES_FROM_MT,
  naturalRelationOf, NODE_RELATIONS,
  BENEFIC_RATIO, MALEFIC_RATIO, effectRatio,
  PLANET_TIME_UNIT,
  NAISARGIKA_ORDER, naisargikaBala, DIG_BALA_HOUSE, DAY_NIGHT_STRENGTH, PAKSHA_AYANA_RULE,
  QUERY_CLASS, PLANET_ABODE, type QueryClass,
  pranaPada, pranaPadaFromLagna, minutesToVighatis,
  PRANAPADA_GOOD_HOUSES, type PranaPada,
  UPAGRAHA_FORMULA_CONFLICT, UPAGRAHA_DIGNITIES, GULIKA_LONGITUDE_RULE, UPAGRAHA_AFFLICTION,
} from './data/bphs/ch03.js';
// Part 2 — Chapters 4 and 5.
export {
  RISING_TYPE, RISING_TYPE_NOTES, isSirshodaya, type RisingType,
  DIURNAL_SIGNS, NOCTURNAL_SIGNS, isDiurnal,
  ambulationClass, type AmbulationClass,
  SIGN_HUMOUR, type Humour,
  KALAPURUSHA_LIMBS, limbOfSign, limbOfHouse,
  nisheka, isBelowHorizon, type NishekaResult,
  rectifyFromAdhana, birthHalfFromAdhana, gestationSide,
  deliveryMonthFromAdhana, natalMoonFromAdhanaMoon,
} from './data/bphs/ch04.js';
export {
  MINUTES_PER_GHATI, minutesToGhatis, GHATIS_PER_SIGN,
  bhavaLagnaBphs, horaLagnaBphs, ghatikaLagnaBphs,
  LAGNA_REFERENCE_USE, bhavaAgreement, cuspStrength, type LagnaReference,
  type AscendantReference, type PlanetFrame,
  varnadaCount, varnada, varnadaOfHouse, varnadaDashaOrder, varnadaAntardashas,
  type VarnadaDasha,
} from './data/bphs/ch05.js';
// Part 3 — Chapter 6a (varga catalogue, constructions D1…D24).
export {
  SHODASAVARGA, NON_BPHS_DIVISORS, isShodasavarga,
  VARGA_START, vargaStartSign, type VargaStartRule,
  horaLord as bphsHoraLord,
  navamsaClass, NAVAMSA_CLASS_CYCLE, NAVAMSA_CLASS_MEANING, NAVAMSA_CLASS_NOTE,
  type NavamsaClass,
  dasamsaRuler, DASAMSA_DIRECTION_LORDS, type DasamsaRuler,
  drekkanaSage, DREKKANA_SAGES,
} from './data/bphs/ch06a.js';
// Part 4 — Chapter 6b (D27…D60, varga classification schemes).
export {
  BHAMSA_START_BY_ELEMENT,
  TRIMSAMSA_ODD, TRIMSAMSA_EVEN, trimsamsaPart, type TrimsamsaPart,
  KHAVEDAMSA_START, AKSHAVEDAMSA_START,
  shashtiamsaOffset, shashtiamsaSign, shashtiamsa,
  SHASHTIAMSA_NAMES, SHASHTIAMSA_NATURE, SHASHTIAMSA_NOTES,
  type ShashtiamsaNature, type ShashtiamsaResult,
  VARGA_SCHEMES, VARGA_DESIGNATIONS, DASAVARGA_ALIASES, vargaDesignation,
  GOOD_VARGA_CRITERIA, ARUDHA_CRITERION_DEFAULT,
  isDisqualified, classifyVarga,
  type VargaScheme, type VargaDisqualifier, type VargaClassification,
} from './data/bphs/ch06b.js';
// Cross-part compositions (Programme §8.1 retrofit sweep).
export {
  goodDivisionsFor, gradeVarga,
  vargaFacts, withVargas, PROJECT_ONCE_PER_CHART, karakamsaFacts, VARGA_PROJECTION_NOT_PREDICATE,
  wholeSignDignity, VARGA_DIGNITY_IS_RECOMPUTED,
  type GoodVargaReason, type DivisionStanding, type GoodDivisionsResult, type VargaGrade,
} from './data/bphs/compose.js';
// Part 5 — Chapter 7 (Vimsopaka bala, the first arbitration instrument).
export {
  VIMSOPAKA_WEIGHTS, VIMSOPAKA_TOTAL, VARGA_VISWA, vargaViswaTier,
  VIMSOPAKA_EXALTATION_NOTE, VIMSOPAKA_MINIMUM, VIMSOPAKA_FLOOR_NOTE, vimsopakaBala, vimsopakaBand, VIMSOPAKA_BANDS,
  sunDistanceStrength, SUN_DISTANCE_NOTE,
  VARGA_USE, VARGA_LORD_RULES,
  HOUSE_CATEGORIES, categoriesOfHouse, DUAL_REFERENCE_RULE,
  type VargaViswaTier, type VimsopakaDivision, type VimsopakaBand,
  type VimsopakaResult, type HouseCategory,
} from './data/bphs/ch07.js';
// Part 6 — Chapters 8 (rasi drishti) and 11 (judgement of houses).
export {
  rasiAspects, rasiAspectsSign, rasiAspectsBetween,
  RASI_DRISHTI_IS_MUTUAL, RASI_VS_GRAHA_DRISHTI,
  BPHS_HOUSE_INDICATIONS, UNSURFACED_HOUSE_INDICATIONS,
  lordInFavourableAvastha, HOUSE_PROSPERITY_VETO, SPOILING_LORDSHIPS,
  houseProsperityRules, HOUSE_PROSPERITY_NOT_YET_EXPRESSIBLE,
} from './data/bphs/ch08-11.js';
// Part 7 — Chapter 26a (graha drishti as a graded quantity).
export {
  VIRUPAS_PER_RUPA, ASPECT_QUARTERS, SPECIAL_FULL_ASPECTS, aspectQuarters,
  aspectAngle, drishtiValueGeneral, drishtiValueSaturn, drishtiValueMars,
  drishtiValueJupiter, drishtiValue, drishtiQuarters, drishtiRupas,
  DRISHTI_DISCONTINUITY_NOTE, GRADED_ASPECT_NOTE,
} from './data/bphs/ch26a.js';
// Part 8 — Chapter 26b (speculum verification, restated rules, rejected shortcut).
export {
  ASPECT_RULES_RESTATED, RULE_SIX_TYPO_NOTE, ASPECT_ACTIVE_ARC,
  HOUSE_ASPECT_USES_CUSP, HOUSE_ASPECT_CUSP_NOTE,
  ADDITIVE_SHORTCUT, ADDITIVE_SHORTCUT_REJECTED,
  SPECULUM_VERIFICATION, SPECULUM_OCR_FAULTS, SPECULUM_SAMPLE,
} from './data/bphs/ch26b.js';
// Part 9 — Chapter 27a (Shadbala I: Sthana bala).
export {
  VIRUPAS_PER_RUPA_27, SHADBALA_PLANETS, SHADBALA_COMPONENTS, STHANA_COMPONENTS,
  shadbalaUchchaBala,
  SAPTAVARGAJA_VIRUPAS, SAPTAVARGA_DIVISIONS, SAPTAVARGAJA_MAX, saptavargajaBala,
  OJHAYUGMA_PER_PLACEMENT, ODD_SIGN_PLANETS, EVEN_SIGN_PLANETS, ojhayugmarasiamsaBala,
  KENDRADI_VIRUPAS, kendradiBala,
  DREKKANA_VIRUPAS, PLANET_GENDER, drekkanaBala,
  sthanaBala, STHANA_BALA_MAX, VS_ENGINE_PLANET_STRENGTH,
  type ShadbalaComponent, type SthanaComponent, type SaptavargajaTier,
  type SthanaBalaParts, type SthanaBalaResult,
} from './data/bphs/ch27a.js';
// Part 10 — Chapter 27b (Shadbala II: Dig, Kala, Naisargika, Cheshta).
export {
  foldedArcBala,
  DIG_BALA_ZERO_HOUSE, DIG_BALA_STRONG_HOUSE, digBala,
  NIGHT_STRONG, DAY_STRONG, nathonnathaBala,
  pakshaBala,
  TRIBHAGA_DAY, TRIBHAGA_NIGHT, tribhagaBala,
  PERIOD_LORD_VIRUPAS, varshaMasaDinaHoraBala, type PeriodLordKind,
  NAISARGIKA_ASCENDING, naisargikaBalaVirupas,
  AYANA_KHANDAS, ayanaKranti, bhujaFromEquinox, ayanaBala,
  AYANA_SOUTHERN, AYANA_NORTHERN,
  cheshtaBalaLuminary, CHESHTA_LUMINARY_NOTE,
  KALA_BALA_MAX, KALA_SUBCOMPONENTS, kalaBala, type KalaBalaParts,
} from './data/bphs/ch27b.js';
// Part 11 — Chapter 27c (Shadbala III: Drik, yuddha, Cheshta, Bhava bala, thresholds).
export {
  SHADBALA_SIX,
  drikBala, DRIK_BALA_AMBIGUITY,
  YUDDHA_PLANETS, grahaYuddha, YUDDHA_WINNER_NOTE, type GrahaYuddhaResult,
  MOTION_STRENGTHS, MOTION_ORDER, motionStrength, type MotionKind,
  cheshtaKendra, cheshtaBalaTara,
  bhavaReferenceAngle, bhavaDigBala, bhavaBala,
  type BhavaReferenceAngle, type BhavaBalaParts,
  SHADBALA_REQUIRED, isStrongByShadbala, shadbalaVerdict,
  COMPONENT_MINIMUMS, componentGroupOf, meetsComponentMinimums,
  type ComponentGroup, type ComponentCheck,
  STRONGEST_PLANET_DELIVERS, CH27_NOT_ENCODED,
} from './data/bphs/ch27c.js';
// Part 12 — Chapter 28 (Ishta and Kashta bala: which way a strength points).
export {
  RASMI_MIN, RASMI_MAX, rasmiFromBala, balaFromRasmi,
  uchchaRasmi, cheshtaRasmi, cheshtaKendraSun, cheshtaKendraMoon, CHESHTA_KENDRA_SOURCE,
  RASMI_PAIR_TOTAL, subhaRasmi, asubhaRasmi,
  ISHTA_KASHTA_TOTAL, ishtaPhala, kashtaPhala, ishtaKashtaOf,
  ishtaKashtaOfBala, ANY_BALA_IS_ITS_OWN_ISHTA,
  SUBHANKA, SUBHANKA_ORDER, subhanka, asubhanka,
  SUBHANKA_SAPTAVARGA_MAX, SUBHANKA_VS_SAPTAVARGAJA, tierVerdict,
  balaShares, attributeIshta, VERSE_13_CONFLICT,
  aspectIshtaKashta,
  bhavaEffect, twoSignBhava, CH28_NOT_ENCODED, ISHTA_KASHTA_PLANETS,
  type IshtaKashta, type TendencyVerdict, type SubhankaTier,
  type BhavaContributor, type BhavaEffectInputs, type BhavaEffect,
} from './data/bphs/ch28.js';
// Part 12 — Chapters 29-31 (Bhava Padas, Upa Pada, Argala: the Jaimini layer).
export {
  bhavaPada, PADA_EXCEPTION_RULE, PADA_NAMES, grahaPada, GRAHA_PADA_STRENGTH_NOTE,
  padaRelation, PADA_GAIN_HOUSE, PADA_LOSS_HOUSE, padaGainMagnitude, gainMeans,
  padaWealthRules,
  upapadaHouse, upapada, UPAPADA_CONVENTION_CONFLICT, UPAPADA_DETAIL_HOUSE,
  sunIsMaleficHere, upapadaRules,
  ARGALA_PAIRS, ARGALA_COUNTED_FROM,
  VIPAREETA_ARGALA_HOUSE, VIPAREETA_ARGALA_MINIMUM, vipareetaArgala,
  argalaGrade, resolveArgala,
  argalaQuarterCancelled, quarterOf, QUARTER_DEGREES,
  ARGALA_TIMING, ARGALA_HOUSE_EFFECT, ARGALA_FAME_TARGETS, ARGALA_ROYAL_HOUSES,
  NODE_ARGALA_REVERSED,
  CH29_31_UNSURFACED, CH29_31_NOT_YET_EXPRESSIBLE, CH29_31_SUMMARY,
  JAIMINI_LAYER_NOTE, PADA_GRAHAS,
  type PadaRelation, type UpapadaConvention, type Quarter, type ArgalaResolution,
} from './data/bphs/ch29-31.js';
// Part 13 — Chapter 66a (Ashtakavarga: Sun, Moon, Mars; and the table correction).
export {
  AV_REFS, AV_HOUSES, AV_MARKS_PER_PLANET,
  KARANA_VS_REKHA, rekhaFromKarana, karanaFromRekha,
  avRowTotal, avPlanetTotal, BPHS_AV_PLANET_TOTALS, AV_GRAND_TOTAL,
  CH66_SUN_REKHA, CH66_MOON_REKHA, CH66_MARS_REKHA, CH66A_TRANSCRIBED,
  CH66_VERIFICATION, WHY_ASHTAKAVARGA_EXISTS, CH66_REMAINING,
} from './data/bphs/ch66a.js';
// Part 14 — Chapter 66b (Ashtakavarga: Mercury, Jupiter, Venus).
export {
  CH66_MERCURY_REKHA, CH66_JUPITER_REKHA, CH66_VENUS_REKHA, CH66B_TRANSCRIBED,
  CH66B_KARANA_COUNTS, CH66B_VERIFICATION, CH66_EDITION_FAULTS, CH66B_REMAINING,
  karanaCounts, rekhaTotal, rowMatchesShipped,
} from './data/bphs/ch66b.js';
// Part 15 — Chapter 66c (Ashtakavarga: Saturn, and the Ascendant's own).
export {
  CH66_SATURN_REKHA, CH66_SATURN_KARANA_COUNTS,
  CH66_LAGNA_REKHA, CH66_LAGNA_KARANA_COUNTS,
  LAGNA_AV_TOTAL, LAGNA_AV_IS_NOT_IN_SAV, lagnaAshtakavarga,
  LAGNA_ASC_ROW_COINCIDENCE, CH66C_VERIFICATION,
  CH66_EDITION_FAULTS_FINAL, CH66_FAULT_RATE_NOTE,
} from './data/bphs/ch66c.js';
// Part 16 — Chapters 67-69 (the Ashtakavarga reductions).
export {
  REDUCTION_ORDER, REDUCTION_ORDER_IS_STATED, TRIKONA_RULE,
  TRIKONA_SPECIAL_CASES_ARE_REDUNDANT, CH67_TRINES,
  CH68_ILLUSTRATION, EKADHIPATYA_RULES, SINGLE_SIGN_OWNERS_EXEMPT, CH68_PAIRS,
  EKADHIPATYA_CORPUS_CONFLICT,
  RASI_MULTIPLIER_CONFLICT, GRAHA_MULTIPLIER_CONFLICT, CH69_WORKED_EXAMPLE,
  YOGA_PINDA_IS_SODHYA_PINDA, REDUCTIONS_INCLUDE_LAGNA,
  CH67_69_VERIFICATION, CH67_69_NOT_ENCODED,
} from './data/bphs/ch67-69.js';
// Part 17 — Chapter 70 (Effects of the Ashtakavarga: rules that read quantities).
export {
  AV_MATTERS, AV_MATTER_HOUSE, MARS_HOUSE_UNSTATED,
  NAKSHATRA_COUNT, RASI_COUNT, avTrigger, TRIGGER_PLANET, TRIGGER_FORMULA_NOTE,
  TRANSIT_MIDPOINT, transitVerdict, TRANSIT_THRESHOLD_IS_OURS, ELECTION_RULE,
  childrenIndication, CHILDREN_SECOND_METHOD,
  ashtakavargaEffectRules, CH70_UNSURFACED, CH70_NOT_ENCODED,
  PREDICATE_EXTENSION_NOTE, THRESHOLD_RAISED_BY_CALIBRATION,
  type AvTrigger, type TransitVerdict,
} from './data/bphs/ch70.js';
// Part 18 — Chapters 72-74 (aggregate AV, rays, Sudarshana chakra).
export {
  SAMUDAYA_FAVOURABLE_ABOVE, SAMUDAYA_ADVERSE_BELOW, samudayaBand,
  SAMUDAYA_THRESHOLDS_ARE_THE_TEXTS, SAV_MEAN_PER_SIGN,
  prosperityConfiguration, LIFE_STAGES, lifeStageOfHouse, stageVerdict,
  AV_OUTRANKS_TRANSIT, CH72_UNSURFACED,
  RAYS_AT_EXALTATION, RAYS_TOTAL_MAX, RAYS_VS_CH28_RASMI, planetRays,
  RAY_DIGNITY_FACTOR, correctedRays, COMBUST_BECOMES_RAYLESS,
  COMBUSTION_EXEMPTION_NOTE, raysAfterCombustion,
  rayCapacityBand, RAYS_ABOVE_BASE_MAX, CH73_EXCLUDED,
  SUDARSHANA_FRAMES, sudarshanaSigns, sudarshanaAgreement, majorityInfluence,
  SUN_BENEFIC_IN_FIRST_ONLY, SUDARSHANA_MITIGATIONS, EMPTY_HOUSE_FALLBACK,
  CH72_74_NOT_YET_EXPRESSIBLE, CH72_74_SUMMARY,
  type SamudayaBand, type LifeStage, type SudarshanaFrame, type SudarshanaAgreement,
} from './data/bphs/ch72-74.js';
// Part 19 — the arbitration ordering and base-rate calibration.
export {
  ARBITRATION_ORDER, ARBITRATION_WEIGHTS, WEIGHTS_ARE_OURS,
  CONFIDENCE_CEILING, CONFIDENCE_NEVER_CERTAIN, SAV_BASELINE,
  arbitrate, bearingPlanet,
  mulberry32, syntheticCharts, SYNTHETIC_CHARTS_ARE_UNIFORM,
  GENERATOR_MUST_FEED_EVERY_FRAME, BAV_CONTRIBUTION_P, DIGNITY_SAMPLE,
  SHADBALA_SAMPLE_MIN, SHADBALA_SAMPLE_SPREAD,
  calibrate, withBaseRates, ARBITRATION_OPEN,
  expectedBaseRate, populationFor, EXPECTED_HITS, deadRules, canJudge, GUARD_POWER_NOT_SAMPLE_SIZE, isSuspiciouslyRare, SUSPECT_ARITY_FACTOR,
  SUSPECT_THRESHOLD_SCALES_WITH_ARITY,
  type ArbitrationStage, type ArbitrationSignals, type ArbitratedFinding,
  type ArbitrationResult, type FindingStatus, type CalibrationResult,
} from './rules/arbitrate.js';
// Part 20 — Chapters 12-13 (1st and 2nd house effects). Phase III begins.
export {
  KENDRAS, TRIKONAS,
  lordInKendraOrTrikona, lordInDusthana, beneficInKendraOrTrikona,
  firstHouseRules, secondHouseRules, readFrom,
  READ_FROM_THE_MOON_TOO, PHASE_III_RHYTHM, BACKGROUND_RULES_ARE_KEPT,
  CH12_13_EXCLUDED, CH12_13_UNSURFACED, CH12_13_NOT_YET_EXPRESSIBLE,
} from './data/bphs/ch12-13.js';
// Part 20 — the single registry of encoded rules.
export { allEncodedRules, REGISTRY_IS_THE_ONLY_LIST } from './rules/registry.js';
// Part 21 — Chapters 14-16 (3rd, 4th and 5th house effects).
export {
  grahaInKendraOrTrikona,
  thirdHouseRules, fourthHouseRules, fifthHouseRules,
  JUDGE_BY_STRENGTH_FIRST, CHILD_TIMING_INDICATIONS, CHILD_TIMING_NOTE,
  CH14_16_YIELD, CH14_16_EXCLUDED, CH14_16_UNSURFACED,
  CH14_16_NOT_YET_EXPRESSIBLE, PHASE_III_YIELD_VARIES,
} from './data/bphs/ch14-16.js';
// Part 22 — Chapters 17-18 (6th and 7th houses) + the lordsConjunct retrofit.
export {
  sixthHouseRules, seventhHouseRules, lordConjunctionRules,
  MARRIAGE_TIMING, SURFACEABLE_MARRIAGE_AGE, surfaceableAges, surfaceableTimings,
  MARRIAGE_AGE_POLICY, CH17_18_YIELD, CH17_18_EXCLUDED, CH17_18_UNSURFACED,
  CH17_18_NOT_YET_EXPRESSIBLE, LORDS_CONJUNCT_CLOSED_A_GAP,
  type MarriageTiming,
} from './data/bphs/ch17-18.js';
// Part 23 — Chapters 19-21 (8th, 9th and 10th houses).
export {
  VIPAREETA_READING, eighthHouseRules, ninthHouseRules, tenthHouseRules,
  FORTUNE_TIMING, STRENGTH_PREDICATE_NOW_USABLE,
  CH19_21_YIELD, CH19_21_EXCLUDED, CH19_21_UNSURFACED, CH19_21_NOT_YET_EXPRESSIBLE,
} from './data/bphs/ch19-21.js';
// Part 24 — Chapters 22-23 (11th and 12th houses). All twelve houses encoded.
export {
  BHAVAT_BHAVAM, MATTER_HOUSE, readFromHouse,
  eleventhHouseRules, twelfthHouseRules,
  GAIN_TIMING, NISHKA_AMOUNTS_NOT_SURFACED,
  VISIBLE_HALF_HOUSES, INVISIBLE_HALF_HOUSES, MANIFESTATION_NOTE,
  CH22_23_YIELD, CH22_23_EXCLUDED, CH22_23_UNSURFACED,
  CH22_23_NOT_YET_EXPRESSIBLE, HOUSE_BLOCK_COMPLETE,
} from './data/bphs/ch22-23.js';
// Part 25 — Chapter 24a (bhava lords 1-6 in houses). 72 cells, table-driven.
export {
  LORD_PLACEMENTS, LORD_MATTER, bhavaLordRules, tableIsComplete,
  CH24A_YIELD, CH24A_EXCLUSION_THEMES, CH24A_TABLE_RATIONALE, CH24A_EFFECT_ID_RATIONALE,
  type LordPlacement,
} from './data/bphs/ch24a.js';
// Part 26 — Chapter 24b (bhava lords 7-12). Completes the 144-cell block.
export {
  LORD_PLACEMENTS_7_12, LORD_MATTER_7_12, ALL_LORD_PLACEMENTS, ALL_LORD_MATTER,
  allBhavaLordRules, fullTableIsComplete,
  DEDUCE_CONSIDERING_STRENGTH, SOURCE_STATED_ARBITRATION, CH24B_YIELD, CH24B_EXCLUSION_THEMES,
  SEVENTH_LORD_NOTE, BHAVA_LORD_BLOCK_COMPLETE,
} from './data/bphs/ch24b.js';
// Part 27 — Chapter 25 (the non-luminous planets). 72 cells, 46 surfaced.
export {
  UPAGRAHAS, UPAGRAHA_ALIASES, UPAGRAHA_PLACEMENTS, upagrahaRules,
  upagrahaTableIsComplete, CH25_YIELD, CH25_EXCLUSION_THEMES,
  CH25_ASTROLOGY_NOT_ANTHROPOLOGY, CH25_WIRING, CH25_TEXTUAL_FAULT,
  UPAGRAHA_YIELD_TRACKS_NATURE,
  type Upagraha, type UpagrahaPlacement,
} from './data/bphs/ch25.js';
// Part 28 — Chapter 32 (planetary karakatwa). No new rules; new capability and reconciliation.
export {
  CHARA_KARAKA_ORDER, CH32_TIE_BREAK, CH32_EXACT_TIE_RULE, CH32_SEVEN_KARAKA_SCHOOL,
  CH32_RAHU_RULE, CH32_WORKED_KARAKAS, workedNativityLongitudes,
  ATMAKARAKA_PRECEDENCE, BPHS_STHIRA_KARAKAS, CH32_STHIRA_DIVERGENCES,
  KARAKA_FRAMES, karakaFrameSign, PARASPARA_DIGNITIES, parasparaKarakas,
  CH32_RULE3_DISPUTED, CH32_NOT_FROM_MOON, BHAVA_KARAKA_BPHS,
  CH32_BHAVA_KARAKA_DIVERGENCES, CH32_SECONDARY_HOUSE_SENSES,
  ADVERSE_HOUSES_CH32, AUSPICIOUS_HOUSES_CH32, CH32_HOUSE_POLARITY_NOTE,
  CH32_TEXTUAL_FAULT, CH32_YIELD,
  type WorkedKaraka, type KarakaFrame, type ParasparaPair, type ParasparaInput,
  type SthiraKarakaBphs,
} from './data/bphs/ch32.js';
// Part 29 — Chapter 33 (Karakamsa). Aptitude in D-9, counted from the Atmakaraka's navamsa.
export {
  KARAKAMSA_SIGNS, KARAKAMSA_PLANETS, KARAKAMSA_APTITUDES, KARAKAMSA_POLARITY,
  AUTHORSHIP_GRADES, karakamsaRules, karakamsaSignReading,
  CH33_SELF_CONTRADICTION, CH33_REPEATS_ITSELF, CH33_VENUS_LIFESPAN_DROPPED,
  CH33_EXCLUSION_THEMES, CH33_YIELD, CH33_CALIBRATION_NOTE,
  type KarakamsaCell, type AptitudeCell, type PolarityCell,
} from './data/bphs/ch33.js';
// Part 30 — Chapters 34-35 (yoga karakas; the 32 Nabhasa chart-shape yogas).
export {
  LORDSHIP_GROUPS, LORDSHIP_COUNTERPARTS, KENDRADHIPATYA_ORDER, KENDRADHIPATYA_NOTE,
  yogaKarakaFor, YOGA_KARAKA_EXCLUDES_LAGNA, RAJA_YOGA_RELATIONS, RAJA_YOGA_CANCELLATION,
  NODES_HAVE_NO_NATURE, BPHS_ASCENDANT_TABLE, ascendantTableIsComplete,
  FUNCTIONAL_NATURE_MOON_GAP, CH34_MARAKA_IS_NOT_A_NATURE, CH34_DIVERGENCES,
  CH34_ADVERSE_ATMAKARAKA_STILL_OPEN, CH34_YIELD,
  type AscendantRow,
} from './data/bphs/ch34.js';
export {
  NABHASA_YOGAS, NABHASA_GROUP_COUNTS, nabhasaYogas, SANKHYA_SUPPRESSION,
  NABHASA_NOT_DASHA_BOUND, CH35_YIELD, CH35_NO_WORKED_EXAMPLE,
  type NabhasaYoga, type NabhasaGroup, type NabhasaInput,
} from './data/bphs/ch35.js';
// Part 31 — Chapter 36 (the long tail of named yogas). Real Rule records, high arity.
export {
  CH36_YOGAS, ch36YogaRules, CH36_NO_QUANTIFIER, YOGA_NAME_IS_NOT_A_VERDICT,
  CH36_VARIANT_TRADITIONS, CH36_NOT_ENCODABLE, CH36_YIELD,
  CH36_AMALA_MOON_IMPOSSIBILITY,
  type Ch36Yoga,
} from './data/bphs/ch36.js';
// Part 32 — Chapters 37-40 (lunar, solar, raja and royal-association yogas).
export {
  LUMINARY_YOGAS, luminaryYogaRules, hasKemadruma, KEMADRUMA_IS_AN_ABSENCE,
  ADHI_YOGA_GRADES, CH38_BENEFIC_MALEFIC_MODIFIER, CH38_TEXTUAL_FAULT, CH37_38_YIELD,
  type LuminaryYoga,
} from './data/bphs/ch37-38.js';
export {
  RAJA_YOGAS, rajaYogaRules, RAJA_YOGA_IS_NOT_MONARCHY, RAJA_YOGA_FRAMES,
  RAJA_YOGA_MAGNITUDE, exaltationLadder, EXALTATION_LADDER_DROPS_BIRTH,
  CH39_NOT_ENCODABLE, CH39_BACKGROUND_RULE_WARNING, CH40_IMPOSSIBLE_RULE_CAUGHT,
  CH39_40_YIELD,
  type RajaYoga,
} from './data/bphs/ch39-40.js';
// Part 33 — Chapters 41-42 (wealth combinations; penury as conditions, not verdicts).
export {
  AFFLUENCE_VERSES, LAGNA_LORD_WEALTH, AMSA_EFFECTS, wealthRules,
  CH41_STATES_ITS_OWN_RULE, CH41_MARS_THIRD_SUPPORTER, TRINE_LORDS_GIVE_WEALTH,
  CH41_DELINEATE_BY_STRENGTH, AMSA_EFFECTS_CLOSE_A_THREAD, CH41_RAJA_RELATIONS,
  RAJA_RELATIONS_DIVERGE, VISHNU_AND_LAKSHMI_STHANAS, CH41_NO_PROMISE_OF_RICHES, CH41_YIELD,
  AFFLUENCE_VERSE_5_IS_TWO_CASES,
  type AffluenceVerse, type AffluenceLagna, type LagnaLordWealth, type AmsaEffect,
} from './data/bphs/ch41.js';
export {
  PENURY_COMBINATIONS, penuryConditionRules, PENURY_FORBIDDEN,
  CH42_IS_NOT_REFRAMED_LIKE_CH39, CH42_MARAKA_GATE, CH42_NOT_ENCODABLE,
  CH42_GUARD_IS_STRICTER_THAN_NO_DOOM, CH42_YIELD,
  type PenuryCombination,
} from './data/bphs/ch42.js';
// Part 34 — Chapter 46a (Vimshottari, authoritative). A VERIFICATION part: no rules, no
// change to the shipped engine, six independent checkpoints against the chapter's own table.
export {
  CH46_ORDER_FROM_KRITTIKA, CH46_YEARS_FROM_KRITTIKA, lordByKrittikaRemainder,
  CH46_120_YEARS, CH46_BALANCE_IS_A_TABLE_NOT_A_FORMULA, CH46_YEAR_LENGTH_IS_OURS,
  CH46_ANTARDASHA_IS_DEFERRED, CH46_DASHA_SYSTEMS, CH46_REJECTION_IS_AMBIGUOUS, CH46_SPELLING_VARIANTS,
  CH46_VERIFICATION, CH46A_YIELD,
  type DashaSystem, type DashaVerdict,
} from './data/bphs/ch46a.js';
// Part 35 — Chapter 46b: the nine conditional nakshatra dashas and their applicability.
export {
  NAKSHATRA_DASHA_SYSTEMS, systemTotalsMatchTheirNames, SYSTEM_NAME_IS_A_CHECKSUM,
  CH46B_CHECKSUM_CAUGHT_FOUR_FAULTS, ABHIJIT_ONLY_IN_TWO_SYSTEMS,
  ASHTOTTARI_BALANCE_MODELS_DIVERGE, CH46B_YIELD,
  type NakshatraDashaSystem, type DashaApplicability, type ApplicabilityKind,
} from './data/bphs/ch46b.js';
// Part 36 — Chapter 46c (Kalachakra). A verification part whose main result is a NEGATIVE
// one: a clean, well-motivated correction was proposed and then refused by a worked example.
export {
  amsaFromPada, AMSA_FORMULA_IS_AN_INDEPENDENT_CHECK, CH46_POORNAYU_BY_AMSA,
  POORNAYU_MAPPING_UNRESOLVED, MRIGASIRA_PADA_4, PATTERN_LOSES_TO_WORKED_EXAMPLE,
  KALACHAKRA_PARAMAYUSH_IS_LONGEVITY, CH46C_YIELD,
} from './data/bphs/ch46c.js';
// Part 37 — Chapter 46d. The crown jewel: which dasha system applies to THIS chart.
export {
  selectDashaSystem, systemFor, ESTIMATED_SHARE, SPECIFICITY_RANKING_IS_OURS,
  VIMSHOTTARI_IS_THE_DEFAULT_NOT_A_CANDIDATE, CH46D_HAS_NO_SELECTION_RULES,
  GATI_DEFINITIONS, gatiBetween, GATI_EFFECTS_REFUSED, GATI_DIRECTION_IS_USABLE,
  RASI_DASHA_SYSTEMS, TWO_RASI_DASHAS_ARE_LONGEVITY, DEHA_JEEVA_AFFLICTION_REFUSED,
  CH46D_YIELD,
  type DashaSelectionFacts, type DashaSelection, type Gati, type RasiDashaSystem,
} from './data/bphs/ch46d.js';
// Part 38 — Chapters 47-50. THE JOIN: rules that describe a chart during a PERIOD.
export {
  DASHA_EFFECT_TAXONOMY, DASHA_FAVOURABLE_SHAPE, CH47_EFFECT_PROSE_NOT_CARRIED,
  CONDITION_OUTRANKS_NATURE, HOUSE_LORD_DASHA, houseLordDashaRules,
  MARAKA_ROWS_USE_THE_CHAPTERS_OWN_ALTERNATIVE, CH48_COMMENTARY_DISAGREES_WITH_CH34,
  DASHA_START_CHART_IS_A_GAP, DASHA_LORD_IS_A_PLANETREF, CH47_48_YIELD,
  type HouseLordDasha,
} from './data/bphs/ch47-48.js';
export {
  charaHouseVerdict, charaRasiVerdict, WITHIN_PERIOD_SPLIT_IS_NEW,
  CHARA_UPACHAYA_INVERSION, CHARA_COUNTS_FROM_THE_DASHA_RASI, CH49_TABLE_NOT_ENCODED,
  CH49_50_YIELD,
  type Occupancy, type CharaVerdict,
} from './data/bphs/ch49-50.js';
// Part 39 — Chapter 51. Antardasa in FIVE systems: one reconciled, four new.
export {
  SUBDIVISION_VERIFIED, antardasaShortcut, SHORTCUT_IS_EXACT, ANTARDASA_TABLE_FAULTS,
  charaPlanetAntardasaYears, houseGroup, CHARA_PLANET_ANTARDASA_IS_EQUAL,
  rasiAntardasaYears, rasiAntardasaOrder, RASI_ANTARDASA_ORDER_RULE,
  DUAL_ORDER_COUNTS_IN_THE_DIRECTION_OF_TRAVEL, SEED_IS_THE_STRONGER_OF_TWO,
  bhogaRasi, PAKA_BHOGA_PARITY_CLAUSE_UNRESOLVED, pakaBhogaVerdict,
  PAKA_BHOGA_SOMATIC_CLAIM_DROPPED, kalachakraAntardasaYears,
  KALACHAKRA_ANTARDASA_TOTAL_IS_100, PACHAKA_SHARES,
  PINDA_SUBDIVISION_RECORDED_NOT_SURFACED, CH51_TRANSLATOR_RECONSTRUCTED_13_16,
  CH51_YIELD,
} from './data/bphs/ch51.js';
// Part 40 — Chapters 52-56. The join at full width: 45 maha×antar pairs.
export {
  ANTARDASA_FRAME_IS_THE_DASHA_LORD, ANTARDASA_CONDITION_SHAPE, MARS_SATURN_BREAKS_THE_SHAPE,
  HEADINGS_RECOVERED_BY_CH51_ORDER, ANTARDASA_CELLS, CELLS_WITHOUT_A_HOUSE_CONDITION,
  RITUAL_REMEDIES_NOT_CARRIED, MARAKA_RIDER_DROPPED, MEDICAL_CLAIMS_DROPPED,
  antardasaCellRules, CH52_56_YIELD,
  type AntardasaCell,
} from './data/bphs/ch52-56.js';
// Part 41 — Chapters 57-60. The other 36 pairs, and a hypothesis that did not survive.
export {
  ENMITY_AXIS_REFUTED, ATTRIBUTION_HELD_ON_A_WORSE_SOURCE, ANTARDASA_CELLS_57_60,
  SHAPE_IS_CLEANER_HERE, CELLS_57_60_COVERAGE, REFUSALS_57_60, antardasaCellRules57,
  CH57_60_YIELD,
  type AntardasaCell57,
} from './data/bphs/ch57-60.js';
// Part 42 — Chapter 61. The pratyantar: formula verified, effect prose refused.
export {
  PRATYANTAR_FORMULA_VERIFIED, PRATYANTAR_TABLE_FAULTS_ARE_DIGIT_LEVEL,
  COLUMN_ORDER_CONFIRMS_51_2, PRATYANTAR_EFFECTS_ARE_DEFEASIBLE, CH61_EFFECTS_REFUSED,
  PRATYANTAR_WHAT_WE_OFFER_INSTEAD, PRATYANTAR_ORDER, CH61_YIELD,
} from './data/bphs/ch61.js';
// Part 43 — Chapters 62-63. Levels four and five: formulas verified, effect prose refused.
export {
  SUBDIVISION_RECURSES_AT_EVERY_LEVEL, SOOKSHMA_PRANA_SPANS,
  SPANS_ARE_BELOW_THE_BIRTH_TIME_RESOLUTION, NO_CELL_STATES_A_CONDITION,
  NO_DEFEASIBILITY_CLAUSE_HERE, CH62_63_EFFECTS_REFUSED, SOOKSHMA_PRANA_STILL_COMPUTABLE,
  SOOKSHMA_ORDER, CH62_63_YIELD,
} from './data/bphs/ch62-63.js';
// Part 44 — Chapter 64. Kalachakra antardasa: data confirmed, friendship rule encoded.
export {
  RASI_YEARS_CONFIRMED_INDEPENDENTLY, RASI_YEARS_ARE_A_PER_RASI_CONSTANT,
  ARIES_AMSA_TABLE_HAS_ONE_FAULT, KALACHAKRA_FRIENDSHIP_RULE, kalachakraAntarVerdict,
  SAVYA_ONLY_HABIT_SUPPORTS_CANDIDATE_ONE, CH64_EFFECT_PROSE_REFUSED, CH64_RASI_YEARS,
  CH64_YIELD,
  type KalachakraAntarVerdict,
} from './data/bphs/ch64.js';
// Part 45 — Chapter 65. The order of a list of readings confirms the savya wheel.
export {
  CH65_BLOCKS, ch65BlockSequence, CH65_ORDER_CONFIRMS_SAVYA_24,
  CELLS_ARE_KEYED_BY_WHEEL_POSITION, CH65_READINGS_REFUSED, CH65_RITUAL_REMEDY_REFUSED,
  CH65_YIELD,
} from './data/bphs/ch65.js';
// Part 46 — Chapters 75-77. Phase V: strength decides a classification.
export {
  MAHAPURUSHA_YOGAS, mahapurushaRules, MAHAPURUSHA_STRENGTH_CONDITION_MISSING,
  MAHAPURUSHA_STRENGTH_IMPACT,
  CH75_DESCRIPTIONS_REFUSED, ELEMENT_OF_PLANET, ELEMENT_MAPPING_IS_STATED_FOUR_TIMES,
  dominantElement, CH76_TEMPERAMENT_DESCRIPTIONS_REFUSED, GUNA_OF_PLANET, dominantGuna,
  CH77_CLASS_HIERARCHY_REFUSED, CH75_77_YIELD,
  type MahapurushaYoga, type Element, type Guna,
} from './data/bphs/ch75-77.js';
// Part 47 — Chapters 78-79. Rectification, ascetic yogas, and the yuddha winner in root text.
export {
  RECTIFICATION_CASCADE, RITU_SUBSTITUTIONS, RITU_SUBSTITUTION_IS_ONE_DIRECTIONAL,
  samvatsaraCandidates, RECTIFICATION_NEEDS_AN_OUTSIDE_FACT, CH78_IS_RECTIFICATION_NOT_PRASHNA,
  YUDDHA_ORB_DEGREES, grahaYuddhaVictor, YUDDHA_WINNER_IS_ROOT_TEXT_AFTER_ALL,
  STELLIUM_STRENGTH_NOT_ENCODED, ASCETIC_ORDER_BY_STRONGEST,
  ASCETIC_ORDERS_ARE_DATA_NOT_A_READING, asceticYogaRules, CH79_PROXY_RULES_WITHHELD,
  CH79_VARGA_CLAUSE_GAP,
  CH79_REMAINING_CLAUSES_NOT_ENCODED, CH78_79_YIELD,
  type RectificationStep,
} from './data/bphs/ch78-79.js';
// Part 48 — Chapters 80-82. Female horoscopy: refused, auditably, with one verse kept.
export {
  STRONGER_OF_LAGNA_OR_MOON, STRENGTH_RESOLVES_TWO_REFERENCE_POINTS, CH80_REFUSED_VERSES,
  LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE, CH80_REFUSED, SAME_INSTRUMENTS_DIFFERENT_SUBJECT,
  CH81_82_EXCLUDED, CH80_82_YIELD,
  type RefusedVerse,
} from './data/bphs/ch80-82.js';
// Part 49 — Chapter 83. Refused in full, and it named a new refusal ground.
export {
  BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND, CURSE_SOURCES, CH83_ARCHITECTURE,
  COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED, CH83_RITUAL_REMEDIES_REFUSED, CH83_REFUSED,
  CH83_YIELD,
} from './data/bphs/ch83.js';
// Part 50 — Chapters 84-96. The remedial block: the map kept, the recipes refused.
export {
  REMEDIAL_VOCABULARY_COUNTS, STANDING_CONSTRAINT_EMPTIES_THIS_BLOCK, REMEDIAL_CHAPTERS,
  MAP_KEPT_RECIPE_REFUSED, CH96_INSTRUCTS_HARM, BIRTH_TREATED_AS_MISFORTUNE, CH84_96_YIELD,
  type RemedialChapter,
} from './data/bphs/ch84-96.js';
// Part 51 — THE LAST PART. Ch 9 refused, ch 10's antidotes encoded, 43/44/71 never surfaced.
export {
  BPHS_STATES_ITS_OWN_ABSTENTION, CH09_REFUSED, arishtaCancellationRules,
  CANCELLATIONS_FAIL_AS_ASSERTIONS, CH10_ENCODED_WITHOUT_CH09, ANTIDOTE_MECHANISM_OUTLIVED_ITS_SOURCE, MARAKA_DERIVATION,
  LONGEVITY_COMPUTED_NEVER_SURFACED, PART51_YIELD,
} from './data/bphs/ch09-10-43-44-71.js';

// The aggregators that make Shadbala's remaining components computable (post-programme).
export {
  WEEKDAY_LORD_ORDER, PERIOD_LORDS_ARE_SAURA_NOT_SAVANA, VARSHA_MASA_ARE_ENGINE_SIDE,
  saptavargajaTierInSign, saptavargajaTierFor, SAPTAVARGAJA_COMPOUND_GAP,
  temporaryRelationIn, temporaryFriendsOf, compoundRelationIn, compoundTierFor,
  saptavargajaTierForChart, COMPOUND_UNLOCKS_THE_EXTREMES, TEMPORARY_IS_READ_IN_THE_RASI,
  DRIK_MALEFICS, DRIK_BENEFICS, DRIK_FULL_ASPECT, drikPindas,
  DRIK_NODES_EXCLUDED, DRIK_SIDESTEPS_MERCURY, WHAT_STILL_LIMITS_SHADBALA,
  type DrikPinda, type DrikPindaOptions,
} from './data/shadbala-inputs.js';

// The pointer catalogue — every question the engine can be asked, as a 3-level tree.
export {
  POINTER_TREE, ALL_POINTERS, POINTER_COUNTS, findPointer,
  type Pointer, type PointerGroup, type PointerSection, type PointerStatus,
} from './data/pointers.js';
