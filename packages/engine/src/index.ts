// @aura/engine — public API. UI/app code imports from here.
// The `Aura` facade is the recommended entry point for app code.

export {
  Aura, type DailyBundle, type AuraOptions,
  type PhaseWindow, type PhaseWindows,
} from './aura.js';
export { type AnnualChart } from './synthesis/varshaphal.js';

export * from './types.js';
export * from './constants.js';

// Astronomy / time
export * from './astro/angles.js';
export * from './astro/julian.js';
export * from './astro/ayanamsa.js';
export { type ChartOptions } from './chart/chart.js';
export * from './astro/ascendant.js';
export {
  type Ephemeris, type EphemerisSample, AstronomiaEphemeris, FixedEphemeris,
} from './astro/ephemeris.js';

// Sunrise, and the six encoded capabilities that were unreachable without it — the three
// special lagnas, prana pada, `selectDashaSystem`'s day/night and hora, and Kala bala's
// Tribhaga, Nathonnatha and period lords. `sunriseFacts` is the intended entry point.
export {
  sunTimes, sunCrossesHorizon, isDayBirth, minutesSinceSunrise, ghatisFromMidnight,
  tribhagaThird, horaLord, horaLordUnequal, luminaryHora, sunriseBefore, sunriseAfter,
  WEEKDAY_LORDS, CHALDEAN_ORDER, HORA_CONVENTIONS, CHALDEAN_NOT_REVERSE_WEEKDAY,
  type SunTimes, type HoraLord,
} from './astro/sunrise.js';
export {
  siderealSunLongitude, lastSiderealIngress, lastSignIngress, periodLordSources,
  SAURA_NEEDS_NO_EPOCH, INGRESS_IS_GLOBAL_SUNRISE_IS_LOCAL, type PeriodLordSources,
} from './astro/solar-ingress.js';
export {
  cheshtaInput, cheshtaInputs, meanSunLongitude, CHESHTA_TARA, SUPERIOR, INFERIOR,
  SEEGHROCHA_SWAPS_BETWEEN_GROUPS, CHESHTA_LUMINARIES_ELSEWHERE, type CheshtaInput,
} from './astro/cheshta.js';
export {
  sunriseFacts, periodLordsFromSunrise, ALL_FOUR_PERIOD_LORDS_NOW_RESOLVE,
  POLAR_IS_NOT_AN_ERROR, SIDEREAL_IS_THE_ONE_THE_LAGNAS_WANT, WHAT_SUNRISE_UNLOCKED,
  type SunriseFacts, type SunriseFactsOptions,
} from './astro/sunrise-facts.js';

// Chart (Tier 1)
export { computeChart } from './chart/chart.js';
export { dignityScalar, functionalPolarity } from './chart/strength.js';
export { navamsaSign, rasiSign, dasamsaSign, isVargottama } from './chart/varga.js';
export {
  planetStrength, moonIllumination, type StrengthInput, type StrengthResult,
} from './chart/shadbala.js';
export { aspectedHouses } from './chart/aspects.js';
export { detectYogas, type YogaResult } from './chart/yogas.js';
export {
  computeAshtakavarga, ashtakavargaTotal, AV_PLANETS, type Ashtakavarga,
} from './chart/ashtakavarga.js';

// Dasha (Tier 2)
export {
  nakshatraOf, padaOf, startingMahaLord, nakshatraElapsedFraction,
  getStackAt, getPeriodsAt, buildDashaTree, currentMaha,
  getCourtAt, nextPeriodAt, US_SAFE_LIMIT,
  type DashaOptions,
} from './dasha/vimshottari.js';

// Birth-time precision, surfaced rather than hidden (SPEC §3), and the M19 drift path.
export {
  ACCURACY_MINUTES, boundaryUncertaintyMs, boundaryUncertaintyDays,
  boundaryConfidence, formatUncertainty, boundaryDrift,
  type UncertaintyInput, type BoundaryDrift, type DriftReport,
} from './dasha/uncertainty.js';

// The depth gate every surface shares: which levels may be stated as fact (§3).
export {
  STATED_TIME_ACCURACY, DEEPEST_LEVEL, visibilityFor, deepestTrustworthyLevel, visibleLevels,
  type RingVisibility,
} from './dasha/visibility.js';

// Timing — dated windows and electional moments. The two halves of "when".
export {
  AREA_HOUSES, AREAS, scorePlanetForHouses, windowsFor, bestWindows, stackAt, nextTurn,
  rateSeries, THE_UNIT_IS_A_PARAMETER, type SeriesUnit, type SeriesPoint,
  driversFor, WHAT_THE_PERCENTAGE_IS, WHY_THE_SHORTEST_LEVEL_LEADS,
  HOUSE_MAP_IS_CLASSICAL_THE_WEIGHTS_ARE_OURS,
  type Area, type Window, type RankedWindow, type ScoreReason, type PlanetAreaScore,
} from './timing/windows.js';
export {
  scoreMoment, bestMoments, taskTableFor, TASK_TABLES, RIKTA_TITHI_DAYS,
  tithiIndex, tithiDay, nakshatraOfLong, taraIndex,
  ELECTIONAL_IS_THE_PRECISE_ONE, ONLY_FIVE_TASKS_ARE_TABLED, THE_PERSONAL_TERM,
  type MomentScore, type ElectedWindow,
} from './timing/elect.js';

// Transits (Tier 2)
export { computeTransit, sadeSatiPhase } from './transit/gochara.js';
export {
  signIngresses, stations, transitTimeline, siderealLongitude, SLOW_BODIES,
  NODES_MOVE_BACKWARDS, BISECT_ON_SIGN_NOT_LONGITUDE,
  type Ingress, type Station,
} from './transit/ingress.js';

// Lattice + aggregation (Tiers 3–4)
export {
  computeLattice, cellStatic, dominantAreas, pickPassingEnergy, type LatticeResult,
} from './lattice/compute.js';
export { computeReadingInput, type ReadingInputOptions } from './engine.js';

// Synthesis (Tier 5)
export {
  generateReading, generateTodayLine, generateRemedyShort, generateExpandedReading,
  type ReadingOptions,
} from './synthesis/reading.js';
export {
  buildForecast, buildCustomForecast, type ForecastResult, FORECAST_GLOSS,
} from './synthesis/forecast.js';
export { buildBlueprint, natalProminence, standingStrength, type BlueprintRow } from './synthesis/blueprint.js';
export {
  buildRetrospective, type RetroItem, type RetrospectiveOptions,
} from './synthesis/retrospective.js';

// Cosmic Mentor (Tier 7/8) — engine query + LLM guardrail prompt/tool schema
export {
  answerMentorQuery, type MentorQuery, type MentorAnswer, type Timeframe,
} from './mentor/query.js';
export { MENTOR_SYSTEM_PROMPT, MENTOR_TOOL_SCHEMA } from './mentor/prompt.js';

// Content (Tier 6)
export { CONTENT, type EnergyContent } from './content/templates.js';

// Safety / guardrails (Tier 8)
export {
  detectCrisis, checkNoDoom, SUPPORT_RESOURCES, SUPPORT_MESSAGE, DISCLAIMER,
  type SupportResource, type DoomCheck,
} from './safety/guardrails.js';

// Optional guarded LLM polish (Tier 6, off by default)
export {
  polishReading, POLISH_SYSTEM_PROMPT, NOOP_POLISH, type PolishAdapter,
} from './content/polish.js';
