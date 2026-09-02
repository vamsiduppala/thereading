// ─────────────────────────────────────────────────────────────────────────────
// @aura/api — local Vedic-astrology knowledge service. Serves @aura/knowledge over
// HTTP so the Cosmic Mentor (or any client) can query rules + interpretations.
// Local-only, open, no auth (per the brief). CORS is wide-open for local dev.
// Run: npm --workspace @aura/api run start   (default http://localhost:8787)
// ─────────────────────────────────────────────────────────────────────────────

import Fastify from 'fastify';
import { getChatStatus, ackChat, updateChatStatus } from './chatBuffer.js';
import { runServerAIPipeline } from './deepseekPipeline.js';
import crypto from 'crypto';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// apps/api/.env holds the Mentor's API key. It is gitignored, server-side only (M17), and
// read here with Node's own loader rather than a dependency. This runs before any module
// reads process.env, which is why it sits above the rest of the imports' side effects.
const ENV_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

import { openDb, getProfile, upsertProfile, deleteUser, type ProfileRow } from './db.js';
import fastifyStatic from '@fastify/static';
import { register, login, userForToken, changePassword, AuthError } from './auth.js';
import { seedModelPolicy, modelPolicy } from './mentor/policy.js';
import { mentorConfigured, MentorUnavailable } from './mentor/gemini.js';
import { runMentorTurn, type ChatTurn } from './mentor/chat.js';
import { registerBphsRoutes } from './routes/bphs.js';
import { route, routerReady, initRouter } from './ai/router.js';
import { planAnswer } from './ai/planner.js';
import { buildFullReport } from './report/index.js';
import { geocode } from './geocode.js';
import type { MentorPlan } from './mentor/tools.js';
import {
  GRAHAS, RASIS, BHAVAS, NAKSHATRAS, YOGAS, YOGA_BY_KEY,
  DIVISIONALS, DIVISIONAL_BY_N, CHARA_KARAKAS, STHIRA_KARAKAS, sankhyaYoga, matchAakritiYogas, vajraYavaYoga,
  rajaYogas, vipareetaYoga, type PlanetSigns,
  FUNCTIONAL_NATURE, functionalNatureFor, TRANSIT_FROM_MOON, NATURAL_RELATIONS, REMEDIES,
  sodhyaPindaTiming, SODHYA_PINDA_MATTERS,
  getGraha, getRasi, getBhava, getNakshatra, search,
  interpretPlacement, interpretLagnaLord, classifyDignity, DIGNITIES,
  grahaAspectsFrom, rasiDrishti, argalaOn, ASPECT_NOTES,
  arudhaTable, ARUDHA_NAMES, grahaArudhas, OWN_SIGNS,
  vargaSign, allVargas, VARGA_DIVISORS, dwadasaVargeeyaBala,
  specialLagnas, SPECIAL_LAGNA_USE,
  sunUpagrahas, partLords, upagrahaFraction, UPAGRAHA_PART,
  ashtakavarga, bhinnashtakavarga, sodhitaAshtakavarga, sodhyaPinda, AV_PLANETS,
  type RefSigns, type AVPlanet,
  panchanga, horaLord, matterTithi, tithiPanchaka,
  dashaBalanceAtBirth, antardashas, VIMSHOTTARI_YEARS, subdivideDasha, DASHA_LEVELS,
  ashtottariBalanceAtBirth, ashtottariAntardashas,
  marakaLords, MARAKA_HOUSES, signModality, pairLongevity, combineThreePairs, LONGEVITY_RANGES,
  maheswara, rudra8thSign, rudra, trishoolaRasis, maheswaraFull, type RudraCandidate,
  type LifeSpan,
  baladiAvastha, jagradiAvastha, deeptadiAvastha,
  moodConjunctionAvasthas, lajjitadiAvasthas, LAJJITADI_NOTES,
  narayanaProgression, narayanaDasaLength, narayanaAntardashas, vargaSeedHouse,
  lagnaKendradiDasa, sudasa, drigdasa, shoolaDasa, shoolaAntardashas, niryaanaShoolaDasa,
  kalachakraPada,
  taraOf, specialNakshatra, nakshatraAspectsFrom, SPECIAL_NAKSHATRAS, lattaNakshatra, murthiOf,
  vedhaHouse, VEDHA_STHAANA,
  charaKarakas,
  muntha, MUNTHA_IN_HOUSE, harshaBala, TAJAKA_ASPECTS, DEEPTAMSA,
  DEEP_EXALTATION, uchchaBala, haddaLord, type ClassicalGraha,
  KSHETRA_BALA, HADDA_BALA, DREKKANA_BALA, NAVAMSA_BALA, panchaVargeeyaBala, type PanchaVargeeyaInput,
  saham, computeSahams, SAHAM_FORMULAS, computeBhavaSahams, BHAVA_SAHAM_FORMULAS,
  type SahamContext, type BhavaSahamContext,
  ithasala, ishkavala, induvara, TAJAKA_YOGAS,
  muddaDasa, patyayiniDasa, patyayiniAntardasas, varshaNarayanaDasa, type PatyayiniToken, sudarsanaDasa, sudarsanaAllRefs,
  muhurtaCheck, MUHURTA_GUIDELINES,
  ETHICS_PRINCIPLES, RATIONAL_PRINCIPLES, BIRTHTIME_RECTIFICATION, MUNDANE_PRINCIPLES,
  ANALYSIS_GUIDELINES, HOUSE_REFERENCES, HOUSE_REFERENCE_EXAMPLE,
  type Graha, type Placement,
  // BPHS ch 32 (Part 28)
  CHARA_KARAKA_ORDER, CH32_RAHU_RULE, CH32_TIE_BREAK, CH32_EXACT_TIE_RULE,
  CH32_SEVEN_KARAKA_SCHOOL, BPHS_STHIRA_KARAKAS, CH32_STHIRA_DIVERGENCES,
  BHAVA_KARAKA_BPHS, CH32_BHAVA_KARAKA_DIVERGENCES, CH32_SECONDARY_HOUSE_SENSES,
  ADVERSE_HOUSES_CH32, AUSPICIOUS_HOUSES_CH32, CH32_HOUSE_POLARITY_NOTE,
  ATMAKARAKA_PRECEDENCE, KARAKA_FRAMES, karakaFrameSign,
  parasparaKarakas, PARASPARA_DIGNITIES, CH32_RULE3_DISPUTED, CH32_NOT_FROM_MOON,
  // BPHS ch 33 (Part 29)
  KARAKAMSA_SIGNS, KARAKAMSA_PLANETS, KARAKAMSA_APTITUDES, KARAKAMSA_POLARITY,
  AUTHORSHIP_GRADES, karakamsaRules, karakamsaSignReading, karakamsaFacts,
  fired,
  CH33_SELF_CONTRADICTION, CH33_REPEATS_ITSELF, CH33_EXCLUSION_THEMES, CH33_CALIBRATION_NOTE,
  // BPHS ch 34-35 (Part 30)
  LORDSHIP_GROUPS, LORDSHIP_COUNTERPARTS, KENDRADHIPATYA_ORDER, KENDRADHIPATYA_NOTE,
  RAJA_YOGA_RELATIONS, RAJA_YOGA_CANCELLATION, NODES_HAVE_NO_NATURE,
  BPHS_ASCENDANT_TABLE, CH34_DIVERGENCES, CH34_MARAKA_IS_NOT_A_NATURE, yogaKarakaFor,
  NABHASA_YOGAS, NABHASA_GROUP_COUNTS, nabhasaYogas, SANKHYA_SUPPRESSION,
  NABHASA_NOT_DASHA_BOUND, CH35_NO_WORKED_EXAMPLE,
  // BPHS ch 36 (Part 31)
  CH36_YOGAS, ch36YogaRules, YOGA_NAME_IS_NOT_A_VERDICT, CH36_VARIANT_TRADITIONS,
  CH36_NOT_ENCODABLE,
  // BPHS ch 37-40 (Part 32)
  LUMINARY_YOGAS, luminaryYogaRules, hasKemadruma, KEMADRUMA_IS_AN_ABSENCE,
  ADHI_YOGA_GRADES, CH38_BENEFIC_MALEFIC_MODIFIER, CH38_TEXTUAL_FAULT,
  RAJA_YOGAS, rajaYogaRules, RAJA_YOGA_IS_NOT_MONARCHY, RAJA_YOGA_FRAMES,
  RAJA_YOGA_MAGNITUDE, exaltationLadder, CH39_NOT_ENCODABLE,
  // BPHS ch 41-42 (Part 33)
  AFFLUENCE_VERSES, AFFLUENCE_VERSE_5_IS_TWO_CASES, LAGNA_LORD_WEALTH, AMSA_EFFECTS,
  wealthRules, CH41_STATES_ITS_OWN_RULE, TRINE_LORDS_GIVE_WEALTH, CH41_DELINEATE_BY_STRENGTH,
  CH41_RAJA_RELATIONS, RAJA_RELATIONS_DIVERGE, CH41_NO_PROMISE_OF_RICHES,
  PENURY_COMBINATIONS, penuryConditionRules, CH42_MARAKA_GATE,
  CH42_IS_NOT_REFRAMED_LIKE_CH39, CH42_NOT_ENCODABLE,
  // BPHS ch 46a (Part 34)
  CH46_ORDER_FROM_KRITTIKA, CH46_YEARS_FROM_KRITTIKA, CH46_120_YEARS, CH46_VERIFICATION,
  CH46_BALANCE_IS_A_TABLE_NOT_A_FORMULA, CH46_YEAR_LENGTH_IS_OURS,
  CH46_ANTARDASHA_IS_DEFERRED, CH46_DASHA_SYSTEMS, CH46_REJECTION_IS_AMBIGUOUS,
  // BPHS ch 46b (Part 35)
  NAKSHATRA_DASHA_SYSTEMS, SYSTEM_NAME_IS_A_CHECKSUM, CH46B_CHECKSUM_CAUGHT_FOUR_FAULTS,
  ABHIJIT_ONLY_IN_TWO_SYSTEMS, ASHTOTTARI_BALANCE_MODELS_DIVERGE, CH46_SPELLING_VARIANTS,
  // BPHS ch 46c (Part 36)
  amsaFromPada, AMSA_FORMULA_IS_AN_INDEPENDENT_CHECK, CH46_POORNAYU_BY_AMSA,
  POORNAYU_MAPPING_UNRESOLVED, MRIGASIRA_PADA_4, PATTERN_LOSES_TO_WORKED_EXAMPLE,
  KALACHAKRA_PARAMAYUSH_IS_LONGEVITY,
  // BPHS ch 46d (Part 37) — the crown jewel
  selectDashaSystem, systemFor, SPECIFICITY_RANKING_IS_OURS,
  VIMSHOTTARI_IS_THE_DEFAULT_NOT_A_CANDIDATE, RASI_DASHA_SYSTEMS,
  TWO_RASI_DASHAS_ARE_LONGEVITY, GATI_DEFINITIONS, GATI_EFFECTS_REFUSED,
  GATI_DIRECTION_IS_USABLE,
} from '@aura/knowledge';

type Dignity = Parameters<typeof jagradiAvastha>[0];

// ── Full chart reading (the "blueprint kundali") ──────────────────────────────
// Composes the knowledge layer into one house-by-house reading from a set of computed positions
// (a client runs the ephemeris; this turns positions into the interpreted chart). Offline-first
// clients can still compute this on-device — this is the authoritative server-side surface.
interface KundaliPlanetInput { sign: number; house: number; longitude: number; retrograde?: boolean; combust?: boolean }
interface KundaliInput { lagnaSign: number; planets: Record<Graha, KundaliPlanetInput> }

/** A finite number from a query-string param, or null if absent/blank/non-numeric (caller 400s). */
function qNum(v: string | undefined): number | null {
  if (v == null || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const KUNDALI_SEVEN: Graha[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const KUNDALI_NINE: Graha[] = [...KUNDALI_SEVEN, 'rahu', 'ketu'];

function buildKundaliReading(input: KundaliInput) {
  const { lagnaSign, planets } = input;
  const lagnaRasi = getRasi(lagnaSign);
  const lagnaLord = lagnaRasi.lord;
  const ll = planets[lagnaLord]!;

  const houses = [];
  for (let h = 1; h <= 12; h++) {
    const sign = (lagnaSign + h - 1) % 12;
    const b = getBhava(h);
    const lord = getRasi(sign).lord;
    const occupants = KUNDALI_NINE.filter((g) => planets[g].house === h).map((g) => {
      const p = planets[g];
      const dignity = classifyDignity(g, p.sign);
      const interp = interpretPlacement({ graha: g, house: h, sign: p.sign, dignity, retrograde: p.retrograde, combust: p.combust });
      return { graha: g, sign: p.sign, signName: getRasi(p.sign).english, dignity, retrograde: !!p.retrograde, combust: !!p.combust, ...interp };
    });
    houses.push({
      house: h, name: b.english, sanskrit: b.sanskrit, categories: b.categories,
      significations: b.significations, sign, signName: getRasi(sign).english,
      lord, lordHouse: planets[lord]!.house, occupants,
    });
  }

  const ck = charaKarakas(Object.fromEntries([...KUNDALI_SEVEN, 'rahu'].map((g) => [g, planets[g as Graha]!.longitude])));
  const karaka = (code: string) => ck.find((k) => k.code === code)?.graha;
  const aakriti = matchAakritiYogas(KUNDALI_SEVEN.map((g) => planets[g].house));
  const shape = aakriti[0] ?? sankhyaYoga(KUNDALI_SEVEN.map((g) => planets[g].sign));
  const signs = Object.fromEntries(KUNDALI_NINE.map((g) => [g, planets[g].sign])) as PlanetSigns;

  return {
    lagna: { sign: lagnaSign, signName: lagnaRasi.english, traits: lagnaRasi.indications.slice(0, 4),
      lord: lagnaLord, lordHouse: ll.house, lordReading: interpretLagnaLord(lagnaLord, ll.house, ll.sign) },
    houses,
    karakas: { atmakaraka: karaka('AK'), amatyakaraka: karaka('AmK'), darakaraka: karaka('DK'), all: ck },
    shape: { name: shape.name, means: shape.means, effect: shape.effect },
    rajaYogas: rajaYogas(lagnaSign, signs),
    vipareeta: vipareetaYoga(lagnaSign, signs),
  };
}

export function buildServer() {
  const app = Fastify({ logger: false, bodyLimit: 2_000_000 });
  openDb(); // local SQLite (users, sessions, profiles)
  seedModelPolicy(); // mentor tiers -> model IDs, idempotent

  // wide-open CORS for local use
  app.addHook('onRequest', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') reply.send();
  });

  app.get('/health', async () => ({ ok: true, service: 'aura-knowledge', version: '0.1.0' }));

  // ── Mentor (§4.7) ───────────────────────────────────────────────────────────
  // Stateless on purpose: threads live on the device, so a signed-out user has a Mentor and
  // no conversation sits on a server that does not need it. The client sends the history it
  // wants answered against.

  /** Whether the Mentor can answer at all, so the client can say so before the first send. */
  app.get('/mentor/status', async () => ({
    configured: mentorConfigured(),
    models: modelPolicy(),
  }));

  app.post('/mentor/chat', async (req, reply) => {
    const b = req.body as {
      birth?: Record<string, unknown>;
      plans?: MentorPlan[];
      messages?: ChatTurn[];
    };
    const birth = b?.birth;
    if (!birth || !birth.date || birth.lat == null || birth.lng == null
      || birth.tzOffsetMinutes == null) {
      return reply.code(400).send({
        error: 'birth { date, lat, lng, tzOffsetMinutes } is required — the Mentor answers '
          + 'from a computed chart, never from the question alone.',
      });
    }
    const messages = Array.isArray(b.messages) ? b.messages : [];
    const clean = messages
      .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.text === 'string')
      .map((m) => ({ role: m.role, text: m.text.slice(0, 8000) }))
      .slice(-40); // a long thread is context, not a transcript to re-read in full
    if (clean.length === 0 || clean[clean.length - 1]!.role !== 'user') {
      return reply.code(400).send({ error: 'messages must end with a user message' });
    }
    try {
      const out = await runMentorTurn({
        birth: birth as unknown as Parameters<typeof runMentorTurn>[0]['birth'],
        plans: Array.isArray(b.plans) ? b.plans.slice(0, 25) : [],
        messages: clean,
      });
      return out;
    } catch (e) {
      if (e instanceof MentorUnavailable) {
        // 5xx from upstream is still a 503 here: from the client's side the Mentor is down,
        // and the message already says which kind of down it is.
        return reply.code(e.status >= 500 ? 503 : e.status).send({ error: e.message });
      }
      // Anything else is a bug, not an expected failure mode — and the one place this used
      // to go wrong: `(e as Error).message` was sent to the client with nothing logged here
      // first, so a genuine crash reached a user as a bare "Cannot read properties of
      // undefined (reading 'x')" with no stack trace anywhere to chase it down from. Log the
      // real thing server-side; tell the client something it can act on instead of leaking
      // an internal error shape it had no way to do anything with.
      app.log.error(e);
      return reply.code(500).send({
        error: 'The Mentor hit an unexpected error on this end. Try again in a moment.',
      });
    }
  });

  // Single-origin mode: if the app has been built, serve it from this same server so the
  // whole thing lives behind one URL. That is what a deployment looks like — one process,
  // one certificate, no CORS, and `apiBase()` resolves to the page's own origin — and it is
  // also the only shape that works on hosts that expose a single port. Skipped in local dev,
  // where Vite serves :5174 and this serves :8787.
  //
  // apps/vim is the product; apps/web is the earlier build kept for reference. Preferring
  // vim means a deploy that ships both directories still serves the current app.
  const here = dirname(fileURLToPath(import.meta.url));
  const webDist = [
    resolve(here, '../../vim/dist'),
    resolve(here, '../../web/dist'),
  ].find((d) => existsSync(d)) ?? '';
  if (webDist) {
    // `wildcard: true` — the default, and load-bearing. With it false, @fastify/static
    // enumerates the directory ONCE at boot and registers a route per file, so anything
    // built afterwards falls through to the SPA fallback below and a request for
    // /assets/index-<hash>.js is answered with index.html: HTTP 200, content-type
    // text/html, and a blank white app with nothing in the console to explain it.
    void app.register(fastifyStatic, { root: webDist, wildcard: true });
    // SPA fallback: any non-API path returns index.html so client routing works on refresh.
    // A missing *asset* must 404 honestly rather than be handed the shell — that is what
    // turns a stale cache or a bad deploy into a silent white screen.
    app.setNotFoundHandler((req, reply) => {
      if (req.method !== 'GET' || req.url.startsWith('/api') || req.url.startsWith('/assets/')) {
        return reply.code(404).send({ error: 'not found' });
      }
      return reply.sendFile('index.html');
    });
  }

  // ── Auth + profiles (Phase 2: local accounts) ───────────────────────────────
  const bearer = (req: { headers: Record<string, unknown> }): string | undefined => {
    const h = req.headers['authorization'];
    return typeof h === 'string' && h.startsWith('Bearer ') ? h.slice(7) : undefined;
  };
  const rowToProfile = (r: ProfileRow) => ({
    birth: {
      date: r.birth_date, time: r.birth_time ?? undefined, unknownTime: !!r.unknown_time,
      place: r.place, lat: r.lat, lng: r.lng, tzOffsetMinutes: r.tz_offset,
    },
    goalArea: r.goal_area, goalName: r.goal_name, displayName: r.display_name || '',
    updatedAt: r.updated_at,
  });

  app.post('/auth/register', async (req, reply) => {
    const b = req.body as { email?: string; password?: string };
    try { return register(b?.email ?? '', b?.password ?? ''); }
    catch (e) { return reply.code(e instanceof AuthError ? 400 : 500).send({ error: (e as Error).message }); }
  });
  app.post('/auth/login', async (req, reply) => {
    const b = req.body as { email?: string; password?: string };
    try { return login(b?.email ?? '', b?.password ?? ''); }
    catch (e) { return reply.code(e instanceof AuthError ? 401 : 500).send({ error: (e as Error).message }); }
  });
  app.get('/auth/me', async (req, reply) => {
    const user = userForToken(bearer(req));
    if (!user) return reply.code(401).send({ error: 'not authenticated' });
    const p = getProfile(user.id);
    return { user, profile: p ? rowToProfile(p) : null };
  });
  app.get('/profile', async (req, reply) => {
    const user = userForToken(bearer(req));
    if (!user) return reply.code(401).send({ error: 'not authenticated' });
    const p = getProfile(user.id);
    return p ? rowToProfile(p) : reply.code(404).send({ error: 'no profile yet' });
  });
  app.put('/profile', async (req, reply) => {
    const user = userForToken(bearer(req));
    if (!user) return reply.code(401).send({ error: 'not authenticated' });
    const b = req.body as {
      birth?: Record<string, unknown>; goalArea?: string; goalName?: string;
      displayName?: string;
    };
    const birth = b?.birth;
    if (!birth || !birth.date || birth.lat == null || birth.lng == null || birth.tzOffsetMinutes == null || !birth.place) {
      return reply.code(400).send({ error: 'birth { date, place, lat, lng, tzOffsetMinutes } required' });
    }
    upsertProfile({
      user_id: user.id,
      birth_date: String(birth.date), birth_time: (birth.time as string) ?? null,
      unknown_time: birth.unknownTime ? 1 : 0, place: String(birth.place),
      lat: Number(birth.lat), lng: Number(birth.lng), tz_offset: Number(birth.tzOffsetMinutes),
      goal_area: b.goalArea ?? 'career', goal_name: b.goalName ?? '',
      display_name: (b.displayName ?? '').slice(0, 60),
      updated_at: '',
    });
    return { ok: true };
  });
  // Change password (re-checks the current one, then signs other devices out).
  app.post('/auth/password', async (req, reply) => {
    const token = bearer(req);
    const user = userForToken(token);
    if (!user) return reply.code(401).send({ error: 'not authenticated' });
    const b = req.body as { currentPassword?: string; newPassword?: string };
    if (!b?.currentPassword || !b?.newPassword) return reply.code(400).send({ error: 'currentPassword and newPassword are required' });
    try {
      changePassword(user.id, b.currentPassword, b.newPassword, token!);
      return { ok: true };
    } catch (e) {
      if (e instanceof AuthError) return reply.code(400).send({ error: e.message });
      throw e;
    }
  });
  // Permanently delete the signed-in user's account and all their data (backs "Delete everything").
  app.delete('/account', async (req, reply) => {
    const user = userForToken(bearer(req));
    if (!user) return reply.code(401).send({ error: 'not authenticated' });
    deleteUser(user.id);
    return { ok: true, deleted: true };
  });

  // reference data
  app.get('/grahas', async () => Object.values(GRAHAS));
  app.get('/grahas/:key', async (req, reply) => {
    const key = (req.params as { key: string }).key as Graha;
    if (!GRAHAS[key]) return reply.code(404).send({ error: 'unknown graha' });
    return getGraha(key);
  });
  app.get('/rasis', async () => RASIS);
  app.get('/rasis/:i', async (req) => getRasi(Number((req.params as { i: string }).i)));
  app.get('/bhavas', async () => BHAVAS);
  app.get('/bhavas/:n', async (req) => getBhava(Number((req.params as { n: string }).n)));
  app.get('/nakshatras', async () => NAKSHATRAS);
  app.get('/nakshatras/:i', async (req) => getNakshatra(Number((req.params as { i: string }).i)));
  app.get('/yogas', async () => YOGAS);
  // Sankhya Naabhasa yoga (Ch 11.5.4): the yoga from the count of distinct signs the 7 planets occupy.
  app.get('/yogas/sankhya', async (req, reply) => {
    const q = req.query as { signs?: string };
    if (!q.signs) return reply.code(400).send({ error: 'signs=comma-separated signs (0-11) of the 7 planets (Sun..Saturn)' });
    return sankhyaYoga(q.signs.split(',').map(Number));
  });
  // Aakriti (shape) Naabhasa yogas (Ch 11.5.3): the yogas the 7 planets' house distribution forms.
  app.get('/yogas/aakriti', async (req, reply) => {
    const q = req.query as { houses?: string };
    if (!q.houses) return reply.code(400).send({ error: 'houses=comma-separated houses (1-12 from lagna) the 7 planets occupy' });
    return { yogas: matchAakritiYogas(q.houses.split(',').map(Number)) };
  });
  // Vajra / Yava (benefic-malefic placement in the kendras).
  app.get('/yogas/vajra-yava', async (req, reply) => {
    const q = req.query as { benefics?: string; malefics?: string };
    if (!q.benefics || !q.malefics) return reply.code(400).send({ error: 'benefics= and malefics= comma-separated houses (1-12) each group occupies' });
    return { yoga: vajraYavaYoga(q.benefics.split(',').map(Number), q.malefics.split(',').map(Number)) };
  });
  // Raaja & Vipareeta Raaja yogas (11.7): POST { lagnaSign, signs:{sun..ketu} } → the quadrant/trine
  // lord links (conjunction/aspect/exchange, incl. Dharma-Karmadhipati) + the vipareeta reading.
  app.post('/yogas/raja', async (req, reply) => {
    const b = req.body as { lagnaSign?: number; signs?: Partial<PlanetSigns> };
    const need = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
    if (b?.lagnaSign == null || !b.signs || need.some((k) => (b.signs as Record<string, number>)[k] == null)) {
      return reply.code(400).send({ error: 'lagnaSign (0-11) and signs for all 9 grahas (0-11) required' });
    }
    return {
      raja: rajaYogas(b.lagnaSign, b.signs as PlanetSigns),
      vipareeta: vipareetaYoga(b.lagnaSign, b.signs as PlanetSigns),
    };
  });
  app.get('/yogas/:key', async (req, reply) => {
    const y = YOGA_BY_KEY((req.params as { key: string }).key);
    return y ?? reply.code(404).send({ error: 'unknown yoga' });
  });
  app.get('/divisionals', async () => DIVISIONALS);
  app.get('/divisionals/:n', async (req, reply) => {
    const d = DIVISIONAL_BY_N(Number((req.params as { n: string }).n));
    return d ?? reply.code(404).send({ error: 'unknown divisional' });
  });
  app.get('/karakas', async () => ({ chara: CHARA_KARAKAS, sthira: STHIRA_KARAKAS }));
  // Chara-karaka assignment (Ch 8): POST { longitudes: { sun, moon, …, rahu } } → AK..DK.
  app.post('/karakas/chara', async (req, reply) => {
    const b = req.body as { longitudes?: Partial<Record<Graha, number>> };
    if (!b?.longitudes) return reply.code(400).send({ error: 'longitudes { graha: sidereal degrees } required (Ketu ignored)' });
    return charaKarakas(b.longitudes);
  });
  // ── BPHS ch 32 (Programme Part 28) ─────────────────────────────────────────
  // The reconciliation view: BPHS's own karaka tables alongside where they part company
  // with the other corpus. Served as data so a caller can see the disagreement rather than
  // being handed a merged table belonging to neither book.
  app.get('/bphs/32/karakas', async () => ({
    charaOrder: CHARA_KARAKA_ORDER,
    rahuRule: CH32_RAHU_RULE,
    tieBreak: CH32_TIE_BREAK,
    exactTie: CH32_EXACT_TIE_RULE,
    sevenKarakaSchool: CH32_SEVEN_KARAKA_SCHOOL,
    sthira: BPHS_STHIRA_KARAKAS,
    sthiraDivergences: CH32_STHIRA_DIVERGENCES,
    bhavaKaraka: BHAVA_KARAKA_BPHS,
    bhavaKarakaDivergences: CH32_BHAVA_KARAKA_DIVERGENCES,
    secondaryHouseSenses: CH32_SECONDARY_HOUSE_SENSES,
    adverseHouses: ADVERSE_HOUSES_CH32,
    auspiciousHouses: AUSPICIOUS_HOUSES_CH32,
    housePolarityNote: CH32_HOUSE_POLARITY_NOTE,
    atmakarakaPrecedence: ATMAKARAKA_PRECEDENCE,
  }));
  // 32.22-24: the frames a matter is judged from — the 9th from the Sun for the father, and
  // so on. POST { signs: { sun: 0..11, … } }. The 8th-from-Saturn frame is longevity and is
  // never returned; that is Part 51 and it is withheld by policy, not missing.
  app.post('/bphs/32/karaka-frames', async (req, reply) => {
    const b = req.body as { signs?: Partial<Record<Graha, number>> };
    if (!b?.signs) return reply.code(400).send({ error: 'signs { graha: 0-11 } required' });
    for (const [g, v] of Object.entries(b.signs)) {
      if (!Number.isInteger(v) || (v as number) < 0 || (v as number) > 11) {
        return reply.code(400).send({ error: `sign for ${g} must be an integer 0-11` });
      }
    }
    const asFacts = Object.fromEntries(
      Object.entries(b.signs).map(([g, sign]) => [g, { sign }]),
    ) as Parameters<typeof karakaFrameSign>[0];
    return KARAKA_FRAMES.filter((f) => f.surfaced).map((f) => ({
      matter: f.matter, graha: f.graha, house: f.house, sign: karakaFrameSign(asFacts, f),
    }));
  });
  // 32.25-30: mutual co-workers. POST { lagnaSign, planets: { graha: { sign, dignity } } }.
  // `includeRule3` opts into the co-workership some schools reject; pairs found under it are
  // tagged so the caller can drop them without recomputing.
  app.post('/bphs/32/paraspara', async (req, reply) => {
    const b = req.body as {
      lagnaSign?: number;
      planets?: Record<string, { sign: number; dignity?: string }>;
      includeRule3?: boolean;
    };
    if (b?.lagnaSign == null || !Number.isInteger(b.lagnaSign) || b.lagnaSign < 0 || b.lagnaSign > 11) {
      return reply.code(400).send({ error: 'lagnaSign (integer 0-11) is required' });
    }
    if (!b.planets || Object.keys(b.planets).length === 0) {
      return reply.code(400).send({ error: 'planets { graha: { sign, dignity } } required' });
    }
    const pairs = parasparaKarakas(
      b as unknown as Parameters<typeof parasparaKarakas>[0],
      { includeRule3: b.includeRule3 === true },
    );
    return { pairs, dignitiesAccepted: PARASPARA_DIGNITIES, rule3: CH32_RULE3_DISPUTED, notFromMoon: CH32_NOT_FROM_MOON };
  });
  // ── BPHS ch 33 (Programme Part 29) ─────────────────────────────────────────
  app.get('/bphs/33/karakamsa', async () => ({
    signs: KARAKAMSA_SIGNS,
    planets: KARAKAMSA_PLANETS,
    aptitudes: KARAKAMSA_APTITUDES,
    polarity: KARAKAMSA_POLARITY,
    authorshipGrades: AUTHORSHIP_GRADES,
    selfContradiction: CH33_SELF_CONTRADICTION,
    repeatsItself: CH33_REPEATS_ITSELF,
    exclusionThemes: CH33_EXCLUSION_THEMES,
  }));
  // The reading itself. POST { atmakaraka, longitudes: { graha: 0-360 }, lagnaLongitude? }.
  // The karakamsa is a NAVAMSA sign, so the chart is projected into D-9 first — the rules
  // would silently return nothing against a rasi chart.
  app.post('/bphs/33/reading', async (req, reply) => {
    const b = req.body as {
      atmakaraka?: Graha;
      longitudes?: Partial<Record<Graha, number>>;
      lagnaLongitude?: number;
    };
    if (!b?.longitudes || Object.keys(b.longitudes).length === 0) {
      return reply.code(400).send({ error: 'longitudes { graha: 0-360 } required' });
    }
    for (const [g, v] of Object.entries(b.longitudes)) {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v >= 360) {
        return reply.code(400).send({ error: `longitude for ${g} must be a number in [0, 360)` });
      }
    }
    // The Atmakaraka is derivable from the same longitudes, so it is optional — but if the
    // caller names one it must actually be on the chart, or the reading is about nobody.
    const ak = b.atmakaraka ?? charaKarakas(b.longitudes)[0]?.graha;
    if (!ak) return reply.code(400).send({ error: 'could not determine the Atmakaraka from these longitudes' });
    if (b.longitudes[ak] == null) {
      return reply.code(400).send({ error: `atmakaraka ${ak} has no longitude in this chart` });
    }

    const planets = Object.fromEntries(
      Object.entries(b.longitudes).map(([g, longitude]) => {
        const sign = vargaSign(longitude as number, 1);
        return [g, { sign, house: sign + 1, longitude }];
      }),
    );
    const natal = { lagnaSign: vargaSign(b.lagnaLongitude ?? 0, 1), planets } as never;
    const k = karakamsaFacts(natal, ak, { lagnaLongitude: b.lagnaLongitude });
    if (!k) return reply.code(400).send({ error: 'could not build the navamsa chart' });

    const karakamsa = (k as { lagnas?: Record<string, number> }).lagnas?.karakamsa;
    return {
      atmakaraka: ak,
      karakamsa,
      signReading: karakamsa == null ? null : karakamsaSignReading(karakamsa as never),
      findings: fired(karakamsaRules(), k).map((h) => ({
        id: h.rule.id, verse: h.rule.source.verse, effect: h.rule.effect,
      })),
      calibrationNote: CH33_CALIBRATION_NOTE,
    };
  });
  // ── BPHS ch 34-35 (Programme Part 30) ──────────────────────────────────────
  app.get('/bphs/34/yoga-karakas', async () => ({
    lordshipGroups: LORDSHIP_GROUPS,
    counterparts: LORDSHIP_COUNTERPARTS,
    kendradhipatyaOrder: KENDRADHIPATYA_ORDER,
    kendradhipatyaNote: KENDRADHIPATYA_NOTE,
    rajaYogaRelations: RAJA_YOGA_RELATIONS,
    rajaYogaCancellation: RAJA_YOGA_CANCELLATION,
    nodes: NODES_HAVE_NO_NATURE,
    // The maraka column is stripped here: it is Part 51 material and never leaves the
    // process. Everything else in each row is served as the chapter gives it.
    ascendants: BPHS_ASCENDANT_TABLE.map(({ maraka, ...rest }) => { void maraka; return rest; }),
    divergences: CH34_DIVERGENCES,
    marakaIsNotANature: CH34_MARAKA_IS_NOT_A_NATURE,
  }));
  app.get('/bphs/34/yoga-karaka/:lagna', async (req, reply) => {
    const lagna = Number((req.params as { lagna: string }).lagna);
    if (!Number.isInteger(lagna) || lagna < 0 || lagna > 11) {
      return reply.code(400).send({ error: 'lagna must be an integer 0-11 (0 = Aries)' });
    }
    const { maraka, ...row } = BPHS_ASCENDANT_TABLE[lagna]!;
    void maraka;
    return { ...row, yogaKaraka: yogaKarakaFor(lagna), otherCorpus: functionalNatureFor(lagna) };
  });
  app.get('/bphs/35/nabhasa', async () => ({
    yogas: NABHASA_YOGAS, groupCounts: NABHASA_GROUP_COUNTS,
    suppression: SANKHYA_SUPPRESSION, notDashaBound: NABHASA_NOT_DASHA_BOUND,
    noWorkedExample: CH35_NO_WORKED_EXAMPLE,
  }));
  // POST { lagnaSign, signs: { graha: 0-11 }, benefics? } → which of the 32 shapes hold.
  app.post('/bphs/35/nabhasa', async (req, reply) => {
    const b = req.body as {
      lagnaSign?: number; signs?: Record<string, number>; benefics?: string[];
    };
    if (b?.lagnaSign == null || !Number.isInteger(b.lagnaSign) || b.lagnaSign < 0 || b.lagnaSign > 11) {
      return reply.code(400).send({ error: 'lagnaSign (integer 0-11) is required' });
    }
    const seven = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    const missing = seven.filter((g) => b.signs?.[g] == null);
    if (missing.length) {
      // Every Nabhasa formation is about where ALL SEVEN are. A partial chart cannot
      // produce a partial answer, so this is a 400 rather than an empty 200.
      return reply.code(400).send({ error: `all seven planets are required; missing: ${missing.join(', ')}` });
    }
    for (const g of seven) {
      const v = b.signs![g]!;
      if (!Number.isInteger(v) || v < 0 || v > 11) {
        return reply.code(400).send({ error: `sign for ${g} must be an integer 0-11` });
      }
    }
    const input = {
      lagnaSign: b.lagnaSign,
      planets: Object.fromEntries(seven.map((g) => [g, { sign: b.signs![g]! }])),
      ...(b.benefics ? { benefics: b.benefics } : {}),
    } as Parameters<typeof nabhasaYogas>[0];
    const r = nabhasaYogas(input);
    return {
      occupiedSigns: r.occupiedSigns,
      yogas: r.yogas.map((y) => ({
        name: y.name, group: y.group, verse: y.verse, formation: y.formation,
        reading: y.surfaced ? y.summary : null,
        withheld: y.surfaced ? undefined : y.withheld,
      })),
      suppressed: r.suppressed.map((y) => ({ name: y.name, why: SANKHYA_SUPPRESSION })),
      notDashaBound: NABHASA_NOT_DASHA_BOUND,
    };
  });
  // ── BPHS ch 36 (Programme Part 31) ─────────────────────────────────────────
  app.get('/bphs/36/yogas', async () => ({
    yogas: CH36_YOGAS.map(({ when, unless, ...rest }) => { void when; void unless; return rest; }),
    ruleCount: ch36YogaRules().length,
    nameIsNotAVerdict: YOGA_NAME_IS_NOT_A_VERDICT,
    variantTraditions: CH36_VARIANT_TRADITIONS,
    notEncodable: CH36_NOT_ENCODABLE,
  }));
  // POST a chart's facts → which of chapter 36's yogas fire, with the verse behind each.
  app.post('/bphs/36/yogas', async (req, reply) => {
    const b = req.body as { lagnaSign?: number; planets?: Record<string, unknown> };
    if (b?.lagnaSign == null || !Number.isInteger(b.lagnaSign) || b.lagnaSign < 0 || b.lagnaSign > 11) {
      return reply.code(400).send({ error: 'lagnaSign (integer 0-11) is required' });
    }
    if (!b.planets || Object.keys(b.planets).length === 0) {
      return reply.code(400).send({ error: 'planets { graha: { sign, house, longitude } } required' });
    }
    const hits = fired(ch36YogaRules(), b as never);
    return {
      // Alternatives of one yoga share an effect id, so they are grouped rather than
      // counted twice — three forms of Gaja Kesari is still one Gaja Kesari.
      yogas: [...new Map(hits.map((h) => [h.rule.effect.id, {
        yoga: h.rule.effect.id.replace(/^yoga\./, ''),
        verse: h.rule.source.verse,
        arity: h.arity,
        reading: h.rule.effect.summary,
        forms: hits.filter((x) => x.rule.effect.id === h.rule.effect.id).length,
      }])).values()],
      nameIsNotAVerdict: YOGA_NAME_IS_NOT_A_VERDICT,
    };
  });
  // ── BPHS ch 37-40 (Programme Part 32) ──────────────────────────────────────
  app.get('/bphs/37-38/luminary-yogas', async () => ({
    yogas: LUMINARY_YOGAS,
    beneficMalefic: CH38_BENEFIC_MALEFIC_MODIFIER,
    adhiGrades: ADHI_YOGA_GRADES,
    kemadruma: KEMADRUMA_IS_AN_ABSENCE,
    textualFault: CH38_TEXTUAL_FAULT,
  }));
  app.get('/bphs/39-40/raja-yogas', async () => ({
    yogas: RAJA_YOGAS.map(({ when, unless, overKaraka, ...rest }) => {
      void when; void unless; void overKaraka; return rest;
    }),
    // Served on every response: the effects in these chapters are stated as kingship and we
    // restate them as elevation. A caller must be told that, not left to assume it.
    reframing: RAJA_YOGA_IS_NOT_MONARCHY,
    frames: RAJA_YOGA_FRAMES,
    magnitude: RAJA_YOGA_MAGNITUDE,
    notEncodable: CH39_NOT_ENCODABLE,
  }));
  // POST a chart → the yogas of chapters 37-40 that it forms.
  app.post('/bphs/37-40/yogas', async (req, reply) => {
    const b = req.body as { lagnaSign?: number; planets?: Record<string, { sign: number }> };
    if (b?.lagnaSign == null || !Number.isInteger(b.lagnaSign) || b.lagnaSign < 0 || b.lagnaSign > 11) {
      return reply.code(400).send({ error: 'lagnaSign (integer 0-11) is required' });
    }
    if (!b.planets || Object.keys(b.planets).length === 0) {
      return reply.code(400).send({ error: 'planets { graha: { sign, house, longitude } } required' });
    }
    const hits = fired([...luminaryYogaRules(), ...rajaYogaRules()], b as never);
    const exalted = Object.entries(b.planets)
      .filter(([, p]) => (p as { dignity?: string }).dignity === 'exalted').length;
    return {
      yogas: [...new Map(hits.map((h) => [h.rule.effect.id, {
        yoga: h.rule.effect.id,
        chapter: h.rule.source.chapter,
        verse: h.rule.source.verse,
        arity: h.arity,
        magnitude: h.rule.weight,
        reading: h.rule.effect.summary,
      }])).values()],
      // Kemadruma is reported as a SHAPE only — its reading is refused (BPHS 37.11-13 is
      // reproach and destitution), and that refusal is stated rather than silent.
      kemadruma: b.planets.moon
        ? { present: hasKemadruma(b.lagnaSign, b.planets), readingRefused: KEMADRUMA_IS_AN_ABSENCE }
        : null,
      exaltationLadder: exaltationLadder(exalted),
      reframing: RAJA_YOGA_IS_NOT_MONARCHY,
    };
  });
  // ── BPHS ch 41-42 (Programme Part 33) ──────────────────────────────────────
  app.get('/bphs/41/wealth', async () => ({
    generalRule: CH41_STATES_ITS_OWN_RULE,
    affluenceVerses: AFFLUENCE_VERSES,
    verse5IsTwoCases: AFFLUENCE_VERSE_5_IS_TWO_CASES,
    lagnaLordWealth: LAGNA_LORD_WEALTH,
    amsaEffects: AMSA_EFFECTS.filter((e) => e.surfaced),
    amsaRefused: AMSA_EFFECTS.filter((e) => !e.surfaced).length,
    trineLords: TRINE_LORDS_GIVE_WEALTH,
    delineateByStrength: CH41_DELINEATE_BY_STRENGTH,
    rajaRelations: CH41_RAJA_RELATIONS,
    rajaRelationsDiverge: RAJA_RELATIONS_DIVERGE,
    // Served on every response: these verses promise riches and we do not.
    capacityNotPromise: CH41_NO_PROMISE_OF_RICHES,
  }));
  // Chapter 42 is served as CONDITIONS only. The maraka-dependent combinations are never
  // returned — not because the wording is harsh but because the evidence is withheld.
  app.get('/bphs/42/resource-conditions', async () => ({
    conditions: PENURY_COMBINATIONS.filter((c) => c.surfaced)
      .map(({ needsMaraka, withheld, ...rest }) => { void needsMaraka; void withheld; return rest; }),
    refusedCount: PENURY_COMBINATIONS.filter((c) => !c.surfaced).length,
    marakaGate: CH42_MARAKA_GATE,
    notReframed: CH42_IS_NOT_REFRAMED_LIKE_CH39,
    notEncodable: CH42_NOT_ENCODABLE,
  }));
  app.post('/bphs/41-42/reading', async (req, reply) => {
    const b = req.body as { lagnaSign?: number; planets?: Record<string, unknown> };
    if (b?.lagnaSign == null || !Number.isInteger(b.lagnaSign) || b.lagnaSign < 0 || b.lagnaSign > 11) {
      return reply.code(400).send({ error: 'lagnaSign (integer 0-11) is required' });
    }
    if (!b.planets || Object.keys(b.planets).length === 0) {
      return reply.code(400).send({ error: 'planets { graha: { sign, house, longitude } } required' });
    }
    const hits = fired([...wealthRules(), ...penuryConditionRules()], b as never);
    return {
      findings: [...new Map(hits.map((h) => [h.rule.effect.id, {
        id: h.rule.effect.id,
        chapter: h.rule.source.chapter,
        verse: h.rule.source.verse,
        arity: h.arity,
        // Chapter 42's entries are CONDITIONS about resources and effort, never outcomes.
        kind: h.rule.source.chapter === 42 ? 'condition' : 'capacity',
        reading: h.rule.effect.summary,
      }])).values()],
      capacityNotPromise: CH41_NO_PROMISE_OF_RICHES,
      conditionsNotVerdicts: CH42_IS_NOT_REFRAMED_LIKE_CH39,
    };
  });
  // ── BPHS ch 46a (Programme Part 34) ────────────────────────────────────────
  // A verification part: the shipped Vimshottari checked against BPHS's own construction.
  app.get('/bphs/46/vimshottari', async () => ({
    orderFromKrittika: CH46_ORDER_FROM_KRITTIKA,
    years: CH46_YEARS_FROM_KRITTIKA,
    total: 120,
    whyOneTwenty: CH46_120_YEARS,
    verification: CH46_VERIFICATION,
    // The three things the chapter does NOT establish, served alongside so a caller is not
    // left assuming the whole construction is Parashara's.
    limits: {
      balanceIsATable: CH46_BALANCE_IS_A_TABLE_NOT_A_FORMULA,
      yearLengthIsOurs: CH46_YEAR_LENGTH_IS_OURS,
      antardashaDeferred: CH46_ANTARDASHA_IS_DEFERRED,
    },
  }));
  app.get('/bphs/46/dasha-systems', async () => ({
    systems: CH46_DASHA_SYSTEMS,
    counts: {
      preferred: CH46_DASHA_SYSTEMS.filter((d) => d.verdict === 'preferred').length,
      specialCase: CH46_DASHA_SYSTEMS.filter((d) => d.verdict === 'special-case').length,
      rejected: CH46_DASHA_SYSTEMS.filter((d) => d.verdict === 'rejected').length,
    },
    rejectionIsAmbiguous: CH46_REJECTION_IS_AMBIGUOUS,
  }));
  // ── BPHS ch 46b (Programme Part 35) ────────────────────────────────────────
  // The nine conditional systems. The APPLICABILITY is the payload — Part 37 arbitrates it.
  app.get('/bphs/46/conditional-dashas', async () => ({
    systems: NAKSHATRA_DASHA_SYSTEMS,
    checksum: SYSTEM_NAME_IS_A_CHECKSUM,
    faultsFound: CH46B_CHECKSUM_CAUGHT_FOUR_FAULTS,
    abhijit: ABHIJIT_ONLY_IN_TWO_SYSTEMS,
    ashtottariDivergence: ASHTOTTARI_BALANCE_MODELS_DIVERGE,
    spellingVariants: CH46_SPELLING_VARIANTS,
  }));
  // ── BPHS ch 46c (Programme Part 36) ────────────────────────────────────────
  app.get('/bphs/46/kalachakra', async () => ({
    workedExample: MRIGASIRA_PADA_4,
    amsaFormulaIsAnIndependentCheck: AMSA_FORMULA_IS_AN_INDEPENDENT_CHECK,
    poornayuByAmsa: CH46_POORNAYU_BY_AMSA,
    poornayuUnresolved: POORNAYU_MAPPING_UNRESOLVED,
    patternLosesToWorkedExample: PATTERN_LOSES_TO_WORKED_EXAMPLE,
    // The paramayush is needed to build the sequence and is a longevity quantity, so the
    // route says so rather than returning it as a span of life.
    paramayushIsLongevity: KALACHAKRA_PARAMAYUSH_IS_LONGEVITY,
  }));
  app.get('/bphs/46/amsa-from-pada', async (req, reply) => {
    const q = req.query as { nakshatra?: string; pada?: string };
    const nak = Number(q.nakshatra); const pada = Number(q.pada);
    if (!Number.isInteger(nak) || nak < 0 || nak > 26) {
      return reply.code(400).send({ error: 'nakshatra must be an integer 0-26' });
    }
    if (!Number.isInteger(pada) || pada < 1 || pada > 4) {
      return reply.code(400).send({ error: 'pada must be an integer 1-4' });
    }
    return { nakshatra: nak, pada, amsa: amsaFromPada(nak, pada) };
  });
  // ── BPHS ch 46d (Programme Part 37) — the crown jewel ──────────────────────
  // Which dasha system applies to THIS chart. Returns EVERY system whose condition holds,
  // most specific first — and says plainly that the ordering is ours, not the source's.
  app.post('/bphs/46/select-dasha', async (req, reply) => {
    const b = req.body as { lagnaSign?: number; planets?: Record<string, number> };
    if (b?.lagnaSign == null || !Number.isInteger(b.lagnaSign) || b.lagnaSign < 0 || b.lagnaSign > 11) {
      return reply.code(400).send({ error: 'lagnaSign (integer 0-11) is required' });
    }
    if (!b.planets || Object.keys(b.planets).length === 0) {
      return reply.code(400).send({ error: 'planets { graha: sign 0-11 } required' });
    }
    const applicable = selectDashaSystem(b as never);
    return {
      // Vimshottari is the DEFAULT, not a candidate — 46.2-5 makes it apply regardless.
      alwaysApplies: 'Vimshottari',
      applicable: applicable.map((a) => {
        const sys = systemFor(a.system);
        return {
          system: a.system,
          metVerses: a.metVerses,
          estimatedShare: a.estimatedShare,
          total: sys?.total,
          order: sys?.order,
          years: sys?.years,
          condition: sys?.applicability.map((x) => x.condition),
        };
      }),
      orderingIsOurs: SPECIFICITY_RANKING_IS_OURS,
      vimshottariIsDefault: VIMSHOTTARI_IS_THE_DEFAULT_NOT_A_CANDIDATE,
    };
  });
  app.get('/bphs/46/rasi-dashas', async () => ({
    systems: RASI_DASHA_SYSTEMS.filter((r) => r.surfaced),
    refused: RASI_DASHA_SYSTEMS.filter((r) => !r.surfaced).length,
    longevityRefusal: TWO_RASI_DASHAS_ARE_LONGEVITY,
    gatis: GATI_DEFINITIONS,
    gatiEffectsRefused: GATI_EFFECTS_REFUSED,
    gatiDirection: GATI_DIRECTION_IS_USABLE,
  }));
  app.get('/functional-nature', async () => FUNCTIONAL_NATURE);
  app.get('/functional-nature/:lagna', async (req) => functionalNatureFor(Number((req.params as { lagna: string }).lagna)));
  app.get('/transits', async () => TRANSIT_FROM_MOON);
  // Timing with Sodhya Pinda (25.6): rekhas (in the target house) × the planet's sodhya pinda →
  // the nakshatra/rasi where Saturn's transit troubles the matter and Jupiter's supports it.
  app.get('/transits/sodhya-timing', async (req, reply) => {
    const q = req.query as { rekhas?: string; pinda?: string };
    if (q.rekhas == null || q.pinda == null) return reply.code(400).send({ error: 'rekhas and pinda are required' });
    return { ...sodhyaPindaTiming(Number(q.rekhas), Number(q.pinda)), matters: SODHYA_PINDA_MATTERS };
  });
  app.get('/relationships', async () => NATURAL_RELATIONS);
  app.get('/dignities', async () => DIGNITIES);
  // Aspects & argalas (Ch 10). Compute what a planet/house aspects or intervenes on.
  app.get('/aspects/graha', async (req, reply) => {
    const q = req.query as { graha?: string; house?: string };
    if (!q.graha || q.house == null) return reply.code(400).send({ error: 'graha and house (1-12) are required' });
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    return { graha: q.graha, house: Number(q.house), aspects: grahaAspectsFrom(q.graha as Graha, Number(q.house)) };
  });
  app.get('/aspects/rasi', async (req, reply) => {
    const q = req.query as { sign?: string };
    if (q.sign == null) return reply.code(400).send({ error: 'sign (0-11) is required' });
    return { sign: Number(q.sign), aspects: rasiDrishti(Number(q.sign)) };
  });
  app.get('/aspects/notes', async () => ASPECT_NOTES);
  app.get('/argala', async (req, reply) => {
    const q = req.query as { house?: string };
    if (q.house == null) return reply.code(400).send({ error: 'house (1-12) is required' });
    return { house: Number(q.house), argalas: argalaOn(Number(q.house)) };
  });
  // Divisional charts (Ch 6). Map a sidereal longitude to its sign in a varga.
  app.get('/varga', async (req, reply) => {
    const q = req.query as { longitude?: string; divisor?: string };
    const lon = qNum(q.longitude), d = qNum(q.divisor);
    if (lon == null || d == null) return reply.code(400).send({ error: 'longitude (0-360) and divisor are required (numeric)' });
    if (!(VARGA_DIVISORS as readonly number[]).includes(d)) return reply.code(400).send({ error: `divisor must be one of ${VARGA_DIVISORS.join(',')}` });
    return { longitude: lon, divisor: d, sign: vargaSign(lon, d) };
  });
  app.get('/vargas', async (req, reply) => {
    const q = req.query as { longitude?: string };
    if (q.longitude == null) return reply.code(400).send({ error: 'longitude (0-360) is required' });
    return { longitude: Number(q.longitude), vargas: allVargas(Number(q.longitude)) };
  });
  // Dwaadasa Vargeeya Bala (28.5): the D-1..D-12 strong-minus-weak count for a planet.
  app.get('/varga/dwadasa-bala', async (req, reply) => {
    const q = req.query as { graha?: string; longitude?: string };
    if (!q.graha || q.longitude == null) return reply.code(400).send({ error: 'graha and longitude (0-360) are required' });
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    return { graha: q.graha, ...dwadasaVargeeyaBala(q.graha as Graha, Number(q.longitude)) };
  });

  // Narayana dasa (Ch 18) — rasi dasa progression, lengths, antardasas.
  app.get('/dasha/narayana/progression', async (req, reply) => {
    const q = req.query as { seed?: string; saturn?: string; ketu?: string };
    if (q.seed == null) return reply.code(400).send({ error: 'seed (0-11) required; optional saturn=true, ketu=true' });
    return { seed: Number(q.seed), progression: narayanaProgression(Number(q.seed), q.saturn === 'true', q.ketu === 'true') };
  });
  app.get('/dasha/narayana/length', async (req, reply) => {
    const q = req.query as { rasi?: string; lordSign?: string; exalted?: string; debilitated?: string };
    if (q.rasi == null || q.lordSign == null) return reply.code(400).send({ error: 'rasi and lordSign (0-11) required' });
    return { rasi: Number(q.rasi), years: narayanaDasaLength(Number(q.rasi), Number(q.lordSign), { exalted: q.exalted === 'true', debilitated: q.debilitated === 'true' }) };
  });
  app.get('/dasha/narayana/antardashas', async (req, reply) => {
    const q = req.query as { start?: string; years?: string };
    if (q.start == null || q.years == null) return reply.code(400).send({ error: 'start (0-11) and years required' });
    return { start: Number(q.start), antardashas: narayanaAntardashas(Number(q.start), Number(q.years)) };
  });

  // Rasi dasas (Ch 19 Kendradi, Ch 20 Sudasa, Ch 21 Drigdasa) — share Narayana lengths.
  app.get('/dasha/kendradi', async (req, reply) => {
    const q = req.query as { seed?: string; lagnaSign?: string; saturn?: string; ketu?: string };
    if (q.seed == null || q.lagnaSign == null) return reply.code(400).send({ error: 'seed and lagnaSign (0-11) required' });
    return { progression: lagnaKendradiDasa(Number(q.seed), Number(q.lagnaSign), q.saturn === 'true', q.ketu === 'true') };
  });
  app.get('/dasha/sudasa', async (req, reply) => {
    const q = req.query as { slSign?: string; slDegree?: string };
    if (q.slSign == null || q.slDegree == null) return reply.code(400).send({ error: 'slSign (0-11) and slDegree (0-30) required' });
    return sudasa(Number(q.slSign), Number(q.slDegree));
  });
  app.get('/dasha/drigdasa', async (req, reply) => {
    const q = req.query as { lagnaSign?: string };
    if (q.lagnaSign == null) return reply.code(400).send({ error: 'lagnaSign (0-11) required' });
    return { progression: drigdasa(Number(q.lagnaSign)) };
  });
  app.get('/dasha/kalachakra', async (req, reply) => {
    const q = req.query as { nak?: string; pada?: string };
    if (q.nak == null || q.pada == null) return reply.code(400).send({ error: 'nak (0-26) and pada (1-4) required' });
    return kalachakraPada(Number(q.nak), Number(q.pada));
  });
  app.get('/dasha/niryaana-shoola', async (req, reply) => {
    const q = req.query as { seed?: string };
    if (q.seed == null) return reply.code(400).send({ error: 'seed (0-11, stronger of 2nd/8th) required' });
    return { dasas: niryaanaShoolaDasa(Number(q.seed)) };
  });
  app.get('/dasha/shoola', async (req, reply) => {
    const q = req.query as { seed?: string; years?: string; antarSeed?: string };
    if (q.seed == null) return reply.code(400).send({ error: 'seed (0-11) required; optional years, antarSeed' });
    const years = q.years ? Number(q.years) : 9;
    const out: Record<string, unknown> = { dasas: shoolaDasa(Number(q.seed), years) };
    if (q.antarSeed != null) out.antardashas = shoolaAntardashas(Number(q.antarSeed), years);
    return out;
  });

  // Avasthas (Ch 15). Baladi (age) from longitude; Jagradi/Deeptadi from dignity.
  app.get('/avastha', async (req, reply) => {
    const q = req.query as { longitude?: string; dignity?: string };
    if (q.longitude == null) return reply.code(400).send({ error: 'longitude (0-360) is required; optional dignity=exalted|own|moolatrikona|friend|neutral|enemy|debilitated' });
    const out: Record<string, unknown> = { baladi: baladiAvastha(Number(q.longitude)) };
    if (q.dignity) {
      out.jagradi = jagradiAvastha(q.dignity as Dignity);
      out.deeptadi = deeptadiAvastha(q.dignity as Dignity);
    }
    return out;
  });

  // Longevity (Ch 14). Marakas (killer planets/houses) + the three-pairs range estimate.
  app.get('/longevity/marakas', async (req, reply) => {
    const q = req.query as { lagnaSign?: string };
    if (q.lagnaSign == null) return reply.code(400).send({ error: 'lagnaSign (0-11) is required' });
    return { marakaHouses: MARAKA_HOUSES, marakaLords: marakaLords(Number(q.lagnaSign)) };
  });
  // POST { pairs: [[signA,signB],[signC,signD],[signE,signF]] } → each pair's span + combined.
  app.post('/longevity/estimate', async (req, reply) => {
    const b = req.body as { pairs?: [number, number][] };
    if (!b?.pairs || b.pairs.length !== 3) return reply.code(400).send({ error: 'pairs: exactly 3 [signA,signB] pairs required' });
    const cats = b.pairs.map(([x, y]) => pairLongevity(signModality(x), signModality(y))) as [LifeSpan, LifeSpan, LifeSpan];
    const combined = combineThreePairs(cats);
    return { pairs: cats, combined, years: LONGEVITY_RANGES[combined] };
  });
  // Maheswara (14.3): lord of the special-8th from the Atmakaraka's sign. Also returns the
  // Rudra special-8th sign for the same input, so the whole "critical points" set is one call.
  app.get('/longevity/maheswara', async (req, reply) => {
    const q = req.query as { akSign?: string };
    if (q.akSign == null) return reply.code(400).send({ error: 'akSign (0-11, the sign the Atmakaraka occupies) is required' });
    const s = Number(q.akSign);
    return { akSign: s, maheswara: maheswara(s), rudra8thSign: rudra8thSign(s) };
  });

  // Tajaka annual-chart techniques (Ch 28) — muntha, harsha bala, the six aspects.
  app.get('/tajaka/muntha', async (req, reply) => {
    const q = req.query as { lagnaSign?: string; year?: string };
    if (q.lagnaSign == null || q.year == null) return reply.code(400).send({ error: 'lagnaSign (0-11) and year (year of life) required' });
    return { sign: muntha(Number(q.lagnaSign), Number(q.year)), houseMeanings: MUNTHA_IN_HOUSE };
  });
  app.get('/tajaka/harsha', async (req, reply) => {
    const q = req.query as { graha?: string; house?: string; exaltedOrOwn?: string; day?: string };
    if (!q.graha || q.house == null) return reply.code(400).send({ error: 'graha and house (1-12) required; optional exaltedOrOwn, day' });
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    return { graha: q.graha, units: harshaBala(q.graha as Graha, Number(q.house), q.exaltedOrOwn === 'true', q.day === 'true') };
  });
  app.get('/tajaka/aspects', async () => ({ aspects: TAJAKA_ASPECTS, deeptamsa: DEEPTAMSA }));
  // Uchcha bala (28.4.2): closeness to deep exaltation, 0-20, from a sidereal longitude.
  app.get('/tajaka/uchcha-bala', async (req, reply) => {
    const q = req.query as { graha?: string; longitude?: string };
    if (!q.graha || q.longitude == null) return reply.code(400).send({ error: 'graha (a luminary/tara-graha) and longitude (0-360) required' });
    if (DEEP_EXALTATION[q.graha as ClassicalGraha] == null) return reply.code(404).send({ error: 'graha must be one of sun,moon,mars,mercury,jupiter,venus,saturn' });
    return { graha: q.graha, units: uchchaBala(q.graha as ClassicalGraha, Number(q.longitude)) };
  });
  // Hadda (Egyptian term) lord (28.4.3, Table 72) of a sign+degree.
  app.get('/tajaka/hadda', async (req, reply) => {
    const q = req.query as { sign?: string; degree?: string };
    if (q.sign == null || q.degree == null) return reply.code(400).send({ error: 'sign (0-11) and degree (0-30, within the sign) required' });
    return { sign: Number(q.sign), degree: Number(q.degree), lord: haddaLord(Number(q.sign), Number(q.degree)) };
  });
  // Sahams (28.8): a raw A−B+C point, or all tabled sahams from a context of longitudes.
  app.get('/tajaka/saham', async (req, reply) => {
    const q = req.query as { a?: string; b?: string; c?: string; day?: string; same?: string };
    if (q.a == null || q.b == null || q.c == null) return reply.code(400).send({ error: 'a, b, c (longitudes 0-360) required' });
    return { point: saham(Number(q.a), Number(q.b), Number(q.c), q.day !== 'false', q.same === 'true') };
  });
  app.post('/tajaka/sahams', async (req, reply) => {
    const b = req.body as { ctx?: SahamContext; day?: boolean };
    const need = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'lagna', 'lagnaLord'];
    if (!b?.ctx || need.some((k) => (b.ctx as Record<string, number>)[k] == null)) {
      return reply.code(400).send({ error: `ctx must include longitudes for: ${need.join(', ')}`, formulas: SAHAM_FORMULAS });
    }
    return computeSahams(b.ctx, b.day !== false);
  });
  // The seven bhava-based sahams (Table 74) — need cusp + house-lord + sign-lord longitudes.
  app.post('/tajaka/sahams-bhava', async (req, reply) => {
    const b = req.body as { ctx?: BhavaSahamContext; day?: boolean };
    const need = ['lagna', 'sun', 'moon', 'mars', 'saturn', 'h6', 'h8', 'h9', 'h11', 'h9lord', 'h11lord', 'sunSignLord', 'moonSignLord'];
    if (!b?.ctx || need.some((k) => (b.ctx as unknown as Record<string, number>)[k] == null)) {
      return reply.code(400).send({ error: `ctx must include longitudes for: ${need.join(', ')}`, formulas: BHAVA_SAHAM_FORMULAS });
    }
    return computeBhavaSahams(b.ctx, b.day !== false);
  });

  // Muhurta (Ch 36) — electional quality check + the per-task guidelines.
  app.get('/muhurta/guidelines', async () => MUHURTA_GUIDELINES);
  app.get('/muhurta', async (req, reply) => {
    const q = req.query as { task?: string; tithiDay?: string; weekday?: string; nakshatra?: string; janmaNak?: string };
    if (!q.task || q.tithiDay == null || q.weekday == null || q.nakshatra == null || q.janmaNak == null) {
      return reply.code(400).send({ error: 'task, tithiDay (1-15), weekday (0-6), nakshatra (0-26), janmaNak (0-26) required', tasks: Object.keys(MUHURTA_GUIDELINES) });
    }
    if (!MUHURTA_GUIDELINES[q.task]) return reply.code(404).send({ error: 'unknown task', tasks: Object.keys(MUHURTA_GUIDELINES) });
    return muhurtaCheck(q.task, Number(q.tithiDay), Number(q.weekday), Number(q.nakshatra), Number(q.janmaNak));
  });
  // Reference principles (Ch 32/33/35/37) — ethics, rational thinking, mundane, birthtime.
  app.get('/reference', async () => ({
    ethics: ETHICS_PRINCIPLES, rational: RATIONAL_PRINCIPLES,
    birthtimeRectification: BIRTHTIME_RECTIFICATION, mundane: MUNDANE_PRINCIPLES,
    analysisGuidelines: ANALYSIS_GUIDELINES,
    houseReferences: HOUSE_REFERENCES, houseReferenceExample: HOUSE_REFERENCE_EXAMPLE,
  }));

  // ── Final book chunk (Ch 14/15/18/28) ──────────────────────────────────────
  // Deeptadi conjunction moods + the six Lajjitadi states (15.4.3). POST the boolean facts.
  app.post('/avastha/mood', async (req) => {
    const b = (req.body ?? {}) as Record<string, boolean>;
    return {
      conjunctionMoods: moodConjunctionAvasthas(b),
      lajjitadi: lajjitadiAvasthas(b),
      notes: LAJJITADI_NOTES,
    };
  });
  // Rudra (14.3): the stronger of the two special-8th lords, with the afflicted-weaker override.
  app.post('/longevity/rudra', async (req, reply) => {
    const b = req.body as { fromLagna?: RudraCandidate; fromSeventh?: RudraCandidate; rudraSign?: number };
    if (!b?.fromLagna?.graha || !b?.fromSeventh?.graha) {
      return reply.code(400).send({ error: 'fromLagna and fromSeventh candidates required ({ graha, conjunctCount, exaltedOrOwn, joinsExalted, rasiAspectCount, degreeInSign, debilitatedOrInimical?, maleficAssociation? })' });
    }
    const r = rudra(b.fromLagna, b.fromSeventh);
    return { ...r, trishoolaRasis: b.rudraSign == null ? null : trishoolaRasis(Number(b.rudraSign)) };
  });
  // Maheswara with the book's exceptions (14.3). Pass akSign + optional exception flags.
  app.post('/longevity/maheswara-full', async (req, reply) => {
    const b = req.body as { akSign?: number; rahuKetuWithAKor8th?: boolean; eighthLordInOwnOrExaltation?: boolean; eighthLordSign?: number; strongerGraha?: Graha };
    if (b?.akSign == null) return reply.code(400).send({ error: 'akSign (0-11) is required' });
    return {
      maheswara: maheswaraFull(Number(b.akSign), {
        rahuKetuWithAKor8th: b.rahuKetuWithAKor8th,
        eighthLordInOwnOrExaltation: b.eighthLordInOwnOrExaltation,
        eighthLordSign: b.eighthLordSign,
        // The caller decides which of the 8th/12th lords is stronger; we honour their pick.
        strongerOf: b.strongerGraha ? (x, y) => (b.strongerGraha === x ? x : y) : undefined,
      }),
    };
  });
  // Pancha Vargeeya Bala (28.4.6) — the five component units, /4, with the verdict band.
  app.post('/tajaka/pancha-vargeeya', async (req, reply) => {
    const b = req.body as Partial<PanchaVargeeyaInput>;
    const need: (keyof PanchaVargeeyaInput)[] = ['kshetra', 'uchcha', 'hadda', 'drekkana', 'navamsa'];
    if (!b || need.some((k) => typeof b[k] !== 'number')) {
      return reply.code(400).send({
        error: `all five component balas required: ${need.join(', ')}`,
        units: { kshetra: KSHETRA_BALA, hadda: HADDA_BALA, drekkana: DREKKANA_BALA, navamsa: NAVAMSA_BALA, uchchaMax: 20 },
      });
    }
    return panchaVargeeyaBala(b as PanchaVargeeyaInput);
  });
  app.get('/tajaka/bala-units', async () => ({
    kshetra: KSHETRA_BALA, hadda: HADDA_BALA, drekkana: DREKKANA_BALA, navamsa: NAVAMSA_BALA,
    uchchaMax: 20, note: 'Pancha Vargeeya Bala = (kshetra + uchcha + hadda + drekkana + navamsa) / 4.',
  }));
  // Narayana dasa of a varga (18.5): the seed house of D-n.
  app.get('/dasha/narayana/varga-seed', async (req, reply) => {
    const q = req.query as { divisor?: string };
    const n = qNum(q.divisor);
    if (n == null || n < 1) return reply.code(400).send({ error: 'divisor (D-n, e.g. 9) is required' });
    return {
      divisor: n, seedHouse: vargaSeedHouse(n),
      procedure: 'Take the seed house in the rasi chart, take its lord (stronger co-lord for Sc/Aq), and the rasi that lord occupies in D-n becomes the lagna for that varga’s Narayana dasa.',
    };
  });

  // Sudarsana Chakra dasa (Ch 31) — one house per solar year, from lagna/Moon/Sun.
  app.get('/dasha/sudarsana', async (req, reply) => {
    const q = req.query as { refSign?: string; year?: string };
    if (q.refSign == null || q.year == null) return reply.code(400).send({ error: 'refSign (0-11) and year (year of life) required' });
    return sudarsanaDasa(Number(q.refSign), Number(q.year));
  });
  app.get('/dasha/sudarsana/all', async (req, reply) => {
    const q = req.query as { lagna?: string; moon?: string; sun?: string; year?: string };
    if (q.lagna == null || q.moon == null || q.sun == null || q.year == null) return reply.code(400).send({ error: 'lagna, moon, sun (0-11) and year required' });
    return sudarsanaAllRefs(Number(q.lagna), Number(q.moon), Number(q.sun), Number(q.year));
  });

  // Mudda / Varsha Vimsottari dasa (Ch 30) — Vimsottari compressed to the solar-return year.
  app.get('/dasha/mudda', async (req, reply) => {
    const q = req.query as { moonLong?: string; completedYears?: string };
    if (q.moonLong == null || q.completedYears == null) return reply.code(400).send({ error: 'moonLong (0-360) and completedYears required' });
    return muddaDasa(Number(q.moonLong), Number(q.completedYears));
  });
  // Patyayini dasa (30.3): POST { longitudes:{ sun..saturn, lagna } } → the year split by patyamsa,
  // plus each dasa's antardasas. Only the seven planets + lagna take part.
  app.post('/dasha/patyayini', async (req, reply) => {
    const b = req.body as { longitudes?: Partial<Record<PatyayiniToken, number>> };
    const need: PatyayiniToken[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'lagna'];
    if (!b?.longitudes || need.some((k) => b.longitudes![k] == null)) {
      return reply.code(400).send({ error: `longitudes must include all of: ${need.join(', ')} (each 0-360)` });
    }
    const spans = patyayiniDasa(b.longitudes as Record<PatyayiniToken, number>);
    return { dasas: spans.map((s) => ({ ...s, antardasas: patyayiniAntardasas(spans, s.lord) })) };
  });
  // Varsha Narayana dasa (30.5): the annual chart's Narayana dasa — muntha as lagna, then Narayana
  // from the strength-based seed. GET ?natalLagnaSign=&yearNumber=&seedSign=&hasSaturn=&hasKetu=
  app.get('/dasha/varsha-narayana', async (req, reply) => {
    const q = req.query as { natalLagnaSign?: string; yearNumber?: string; seedSign?: string; hasSaturn?: string; hasKetu?: string };
    if (q.natalLagnaSign == null || q.yearNumber == null || q.seedSign == null) {
      return reply.code(400).send({ error: 'natalLagnaSign (0-11), yearNumber (year of life), seedSign (0-11) required; optional hasSaturn, hasKetu' });
    }
    return varshaNarayanaDasa(Number(q.natalLagnaSign), Number(q.yearNumber), Number(q.seedSign), {
      hasSaturn: q.hasSaturn === 'true', hasKetu: q.hasKetu === 'true',
    });
  });

  // Tajaka yogas (Ch 29) — ithasala/eesarpha + house-distribution yogas.
  app.get('/tajaka/ithasala', async (req, reply) => {
    const q = req.query as { pa?: string; degA?: string; pb?: string; degB?: string };
    if (!q.pa || q.degA == null || !q.pb || q.degB == null) return reply.code(400).send({ error: 'pa, degA, pb, degB required (planets aspecting)' });
    if (!GRAHAS[q.pa] || !GRAHAS[q.pb]) return reply.code(404).send({ error: 'unknown graha' });
    return ithasala(q.pa as Graha, Number(q.degA), q.pb as Graha, Number(q.degB));
  });
  app.get('/tajaka/distribution-yoga', async (req, reply) => {
    const q = req.query as { houses?: string };
    if (!q.houses) return reply.code(400).send({ error: 'houses=comma,separated occupied houses (1-12)' });
    const houses = q.houses.split(',').map(Number);
    return { ishkavala: ishkavala(houses), induvara: induvara(houses) };
  });
  app.get('/tajaka/yogas', async () => TAJAKA_YOGAS);

  // Transit taras & special nakshatras (Ch 26) — all counted from the janma nakshatra.
  app.get('/transit/tara', async (req, reply) => {
    const q = req.query as { janmaNak?: string; transitNak?: string };
    if (q.janmaNak == null || q.transitNak == null) return reply.code(400).send({ error: 'janmaNak and transitNak (0-26) required' });
    return taraOf(Number(q.janmaNak), Number(q.transitNak));
  });
  app.get('/transit/special-nakshatras', async (req, reply) => {
    const q = req.query as { janmaNak?: string };
    if (q.janmaNak == null) return reply.code(400).send({ error: 'janmaNak (0-26) required' });
    const jn = Number(q.janmaNak);
    return Object.fromEntries(Object.keys(SPECIAL_NAKSHATRAS).map((k) =>
      [k, { nakshatra: specialNakshatra(jn, k as keyof typeof SPECIAL_NAKSHATRAS), shows: SPECIAL_NAKSHATRAS[k as keyof typeof SPECIAL_NAKSHATRAS]!.shows }]));
  });
  app.get('/transit/vedha', async (req, reply) => {
    const q = req.query as { graha?: string; house?: string };
    if (!q.graha || q.house == null) return reply.code(400).send({ error: 'graha and house (favourable transit house 1-12) required', table: VEDHA_STHAANA });
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    return { graha: q.graha, favourableHouse: Number(q.house), vedhaHouse: vedhaHouse(q.graha as Graha, Number(q.house)) };
  });
  app.get('/transit/murthi', async (req, reply) => {
    const q = req.query as { house?: string };
    if (q.house == null) return reply.code(400).send({ error: 'house (1-12): transit Moon from natal Moon when the planet enters the rasi' });
    return murthiOf(Number(q.house));
  });
  app.get('/transit/latta', async (req, reply) => {
    const q = req.query as { graha?: string; nak?: string };
    if (!q.graha || q.nak == null) return reply.code(400).send({ error: 'graha and nak (0-26, transit nakshatra) required' });
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    return { graha: q.graha, transitNak: Number(q.nak), latta: lattaNakshatra(q.graha as Graha, Number(q.nak)) };
  });
  app.get('/transit/nakshatra-aspects', async (req, reply) => {
    const q = req.query as { graha?: string; nak?: string };
    if (!q.graha || q.nak == null) return reply.code(400).send({ error: 'graha and nak (0-26) required' });
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    return { graha: q.graha, nak: Number(q.nak), aspects: nakshatraAspectsFrom(q.graha as Graha, Number(q.nak)) };
  });

  // Dasa systems (Ch 16 Vimsottari, Ch 17 Ashtottari) — birth balance + antardasas.
  app.get('/dasha/vimshottari', async (req, reply) => {
    const q = req.query as { moonLong?: string };
    if (q.moonLong == null) return reply.code(400).send({ error: 'moonLong (0-360) is required' });
    const balance = dashaBalanceAtBirth(Number(q.moonLong));
    return { system: 'vimshottari', totalYears: 120, balance, mahaYears: VIMSHOTTARI_YEARS, antardashas: antardashas(balance.lord) };
  });
  // Recursive Vimsottari subdivision to any depth (antardasa=1 … pratyantardasa=2 … deha=5).
  app.get('/dasha/vimshottari/subdivide', async (req, reply) => {
    const q = req.query as { lord?: string; years?: string; depth?: string };
    if (!q.lord || q.years == null) return reply.code(400).send({ error: 'lord and years required; optional depth (1=antardasa..5=deha, default 2)' });
    if (!GRAHAS[q.lord]) return reply.code(404).send({ error: 'unknown graha' });
    const depth = Math.max(0, Math.min(5, q.depth == null ? 2 : Number(q.depth)));
    return { levels: DASHA_LEVELS, tree: subdivideDasha(q.lord as Graha, Number(q.years), depth) };
  });
  app.get('/dasha/ashtottari', async (req, reply) => {
    const q = req.query as { moonLong?: string };
    if (q.moonLong == null) return reply.code(400).send({ error: 'moonLong (0-360) is required' });
    const balance = ashtottariBalanceAtBirth(Number(q.moonLong));
    return { system: 'ashtottari', totalYears: 108, balance, antardashas: ashtottariAntardashas(balance.lord) };
  });

  // Panchanga (Ch 1). Tithi + nitya-yoga + karana from Sun/Moon longitudes; hora lord.
  app.get('/panchanga', async (req, reply) => {
    const q = req.query as { sunLong?: string; moonLong?: string };
    if (q.sunLong == null || q.moonLong == null) return reply.code(400).send({ error: 'sunLong and moonLong (0-360) are required' });
    return panchanga(Number(q.sunLong), Number(q.moonLong));
  });
  app.get('/hora', async (req, reply) => {
    const q = req.query as { weekday?: string; hora?: string };
    if (q.weekday == null || q.hora == null) return reply.code(400).send({ error: 'weekday (0=Sun..6=Sat) and hora (1-24) are required' });
    return { weekday: Number(q.weekday), hora: Number(q.hora), lord: horaLord(Number(q.weekday), Number(q.hora)) };
  });
  // Matter tithi (26.8) — a tithi advancing `speed`× as fast (karma=10, dhana=2), for Sarvatobhadra.
  app.get('/matter-tithi', async (req, reply) => {
    const q = req.query as { sunLong?: string; moonLong?: string; speed?: string };
    const sunLong = qNum(q.sunLong), moonLong = qNum(q.moonLong);
    if (sunLong == null || moonLong == null) return reply.code(400).send({ error: 'sunLong and moonLong (0-360) required (numeric); optional speed (default 1; karma 10, dhana 2)' });
    const speed = q.speed == null ? 1 : (qNum(q.speed) ?? NaN);
    if (!Number.isFinite(speed)) return reply.code(400).send({ error: 'speed must be numeric' });
    const index = matterTithi(sunLong, moonLong, speed);
    return { speed, index, panchaka: tithiPanchaka(index) };
  });

  // Ashtakavarga (Ch 12). POST the 8 reference signs → BAV per planet + SAV (+ 337 total).
  app.post('/ashtakavarga', async (req, reply) => {
    const b = req.body as { signs?: Partial<RefSigns> };
    const need = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'asc'];
    if (!b?.signs || need.some((k) => b.signs![k as keyof RefSigns] == null)) {
      return reply.code(400).send({ error: `signs must include all of: ${need.join(', ')} (each 0-11)` });
    }
    return ashtakavarga(b.signs as RefSigns);
  });
  // Sodhita Ashtakavarga + Sodhya Pinda per planet (12.7). Same 8 reference signs: BAV, then
  // trikona + ekadhipatya reduction (occupancy = the 7 planets' signs), then the pinda.
  app.post('/ashtakavarga/sodhya', async (req, reply) => {
    const b = req.body as { signs?: Partial<RefSigns> };
    const need = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'asc'];
    if (!b?.signs || need.some((k) => b.signs![k as keyof RefSigns] == null)) {
      return reply.code(400).send({ error: `signs must include all of: ${need.join(', ')} (each 0-11)` });
    }
    const refs = b.signs as RefSigns;
    const planetSigns = Object.fromEntries(AV_PLANETS.map((p) => [p, refs[p]])) as Record<AVPlanet, number>;
    const occupied = AV_PLANETS.map((p) => refs[p]);
    const out = {} as Record<AVPlanet, { soav: number[]; rasiPinda: number; grahaPinda: number; sodhyaPinda: number }>;
    for (const p of AV_PLANETS) {
      const soav = sodhitaAshtakavarga(bhinnashtakavarga(p, refs), occupied);
      out[p] = { soav, ...sodhyaPinda(soav, planetSigns) };
    }
    return out;
  });

  // Upagrahas (Ch 4). Sun-based longitudes + time-based part-lords / rising fraction.
  app.get('/upagrahas/sun', async (req, reply) => {
    const q = req.query as { sunLong?: string };
    if (q.sunLong == null) return reply.code(400).send({ error: 'sunLong (0-360) is required' });
    return sunUpagrahas(Number(q.sunLong));
  });
  app.get('/upagrahas/parts', async (req, reply) => {
    const q = req.query as { weekday?: string; day?: string };
    if (q.weekday == null) return reply.code(400).send({ error: 'weekday (0=Sun..6=Sat) is required; day=true|false' });
    return { weekday: Number(q.weekday), isDay: q.day !== 'false', parts: partLords(Number(q.weekday), q.day !== 'false') };
  });
  app.get('/upagrahas/fraction', async (req, reply) => {
    const q = req.query as { weekday?: string; day?: string; name?: string };
    if (q.weekday == null || !q.name) return reply.code(400).send({ error: `weekday and name required; name one of ${Object.keys(UPAGRAHA_PART).join(',')}` });
    return { name: q.name, fraction: upagrahaFraction(Number(q.weekday), q.day !== 'false', q.name) };
  });

  // Special lagnas (Ch 5) — Bhava/Hora/Ghati (from sunrise) + Sree (from Moon fraction).
  app.get('/lagnas/special', async (req, reply) => {
    const q = req.query as Record<string, string>;
    const need = ['sunLongSunrise', 'minutesSinceSunrise', 'moonLong', 'lagnaLong'];
    if (need.some((k) => q[k] == null)) return reply.code(400).send({ error: `required: ${need.join(', ')}`, use: SPECIAL_LAGNA_USE });
    return specialLagnas(Number(q.sunLongSunrise), Number(q.minutesSinceSunrise), Number(q.moonLong), Number(q.lagnaLong));
  });

  // Arudha padas (Ch 9). POST the lagna sign + each planet's sign; get all 12 arudhas.
  app.get('/arudhas/names', async () => ARUDHA_NAMES);
  // Graha arudhas (Ch 9.5): POST each planet's sign (+ optional stronger owned sign for duals).
  app.post('/arudhas/graha', async (req, reply) => {
    const b = req.body as { signs?: Record<string, number>; strongerOwned?: Record<string, number> };
    if (!b?.signs) return reply.code(400).send({ error: 'signs { graha: signIndex } required; optional strongerOwned { graha: signIndex } for dual-lords', ownSigns: OWN_SIGNS });
    return grahaArudhas(
      (g) => b.signs![g] ?? 0,
      (g, owned) => b.strongerOwned?.[g] ?? owned[0]!,
    );
  });
  app.post('/arudhas', async (req, reply) => {
    const b = req.body as { lagnaSign?: number; signs?: Record<string, number> };
    if (b?.lagnaSign == null || !b.signs) {
      return reply.code(400).send({ error: 'lagnaSign (0-11) and signs { graha: signIndex } are required' });
    }
    const signOf = (g: Graha) => b.signs![g] ?? 0;
    return arudhaTable(b.lagnaSign, signOf);
  });
  // Classify a planet's dignity in a sign (0=Aries): exalted/debilitated/moolatrikona/own/friend/neutral/enemy.
  app.get('/classify', async (req, reply) => {
    const q = req.query as { graha?: string; sign?: string };
    if (!q.graha || q.sign == null) return reply.code(400).send({ error: 'graha and sign (0-11) are required' });
    if (!GRAHAS[q.graha]) return reply.code(404).send({ error: 'unknown graha' });
    const sign = Number(q.sign);
    return { graha: q.graha, sign, dignity: classifyDignity(q.graha as Graha, sign) };
  });
  // Only behavioural remedies are surfaced for recommendation (SPEC §11.4);
  // gemstone/deity fields are reference-only and the mentor must never recommend them.
  app.get('/remedies', async () => REMEDIES);

  // search
  app.get('/search', async (req) => {
    const q = (req.query as { q?: string }).q ?? '';
    return { query: q, hits: search(q) };
  });

  // interpretation
  app.post('/interpret', async (req, reply) => {
    const body = req.body as Partial<Placement>;
    if (!body?.graha || body.house == null || body.sign == null) {
      return reply.code(400).send({ error: 'graha, house (1-12) and sign (0-11) are required' });
    }
    // If the client didn't supply dignity, derive it from graha+sign so the tone is accurate.
    const dignity = body.dignity ?? classifyDignity(body.graha, body.sign);
    return interpretPlacement({ ...(body as Placement), dignity });
  });
  app.post('/interpret/lagna-lord', async (req, reply) => {
    const b = req.body as { lord?: Graha; house?: number; sign?: number };
    if (!b?.lord || b.house == null || b.sign == null) {
      return reply.code(400).send({ error: 'lord, house and sign are required' });
    }
    return interpretLagnaLord(b.lord, b.house, b.sign);
  });
  // The whole "blueprint kundali" reading from computed positions. POST { lagnaSign, planets:{
  // sun:{sign,house,longitude,retrograde?,combust?}, … all 9 } } → house-by-house interpretation,
  // lagna lord, Jaimini karakas, chart shape, and raaja/vipareeta yogas.
  app.post('/kundali', async (req, reply) => {
    const b = req.body as Partial<KundaliInput>;
    const intInRange = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;
    const finiteInRange = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
    if (!intInRange(b?.lagnaSign, 0, 11) || !b.planets) return reply.code(400).send({ error: 'lagnaSign must be an integer 0-11 and planets are required' });
    const bad = KUNDALI_NINE.find((g) => {
      const p = b.planets![g];
      return !p || !intInRange(p.sign, 0, 11) || !intInRange(p.house, 1, 12) || !finiteInRange(p.longitude, 0, 360);
    });
    if (bad) return reply.code(400).send({ error: `planets.${bad} must have sign (integer 0-11), house (integer 1-12) and longitude (0-360)` });
    return buildKundaliReading(b as KundaliInput);
  });

  // ── Local semantic routing ────────────────────────────────────────────────
  //
  // A 25 MB sentence encoder, in this process, free and offline after first download. It
  // classifies a question against our OWN descriptions of the areas, question shapes and
  // pointers. It never generates text, so it cannot invent a fact — every word a reader sees
  // still comes from the corpus or from a computed number.
  app.post('/ai/route', async (req, reply) => {
    const body = req.body as { question?: unknown } | undefined;
    const q = typeof body?.question === 'string' ? body.question.trim() : '';
    if (q.length < 2) return reply.code(400).send({ error: 'question is required' });
    try {
      return await route(q);
    } catch (e) {
      // The model is an ENHANCEMENT, never a dependency. If it cannot load — no disk, no
      // network on first run, an unsupported CPU — say so plainly and let the client fall
      // back to its own matching rather than failing the request.
      req.log.warn({ err: e }, 'semantic router unavailable');
      return reply.code(503).send({
        error: 'semantic router unavailable',
        detail: e instanceof Error ? e.message : String(e),
        model: false,
      });
    }
  });

  /**
   * Birthplace lookup for anything the bundled list does not carry.
   *
   * The client shows its own offline results first and merges these in behind them, so this
   * being slow or unreachable costs the extra rows and nothing else. It returns 200 with an
   * empty list rather than an error when the upstream is down, precisely so the client does
   * not have to treat "no network" as a failure state on its first screen.
   */
  app.get('/geocode', async (req, reply) => {
    const q = (req.query as { q?: string } | undefined)?.q ?? '';
    if (typeof q !== 'string' || q.trim().length < 3) {
      return { query: q, results: [], note: 'at least three characters' };
    }
    try {
      const results = await geocode(q, { limit: 6 });
      return { query: q, results };
    } catch (e) {
      // Deliberately not a 5xx. The bundled list is the primary source and it already
      // answered; this one failing is a missing enhancement, not a broken request.
      req.log.warn({ err: e, q }, 'geocode lookup failed');
      return reply.send({
        query: q,
        results: [],
        note: 'the place lookup is unavailable — the bundled list still works, and '
          + 'coordinates can be entered directly',
      });
    }
  });

  /**
   * The full chart reading, as one self-contained HTML document.
   *
   * Returns HTML rather than JSON deliberately: the deliverable IS the document. A JSON
   * payload of it would be a structure the caller then has to render, and every caller would
   * render it differently — which for a reference document is the wrong kind of freedom.
   *
   * It takes tens of seconds. That is the ~717-rule registry, sixteen divisional projections,
   * a decade of bisected ingress scans and sixteen life-area window searches, and there is no
   * version of this that is fast. The client streams it to a file rather than waiting on a
   * spinner it cannot honestly size.
   */
  app.post('/report/full', async (req, reply) => {
    const b = req.body as Record<string, unknown> | undefined;
    const birth = b?.birth as Record<string, unknown> | undefined;
    if (!birth || typeof birth.date !== 'string' || typeof birth.lat !== 'number'
      || typeof birth.lng !== 'number' || typeof birth.tzOffsetMinutes !== 'number') {
      return reply.code(400).send({
        error: 'birth { date, time?, unknownTime, place, lat, lng, tzOffsetMinutes } is required',
      });
    }
    const clamp = (v: unknown, lo: number, hi: number, dflt: number) =>
      typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : dflt;
    try {
      const html = buildFullReport(birth as never, {
        now: typeof b?.now === 'string' ? new Date(b.now) : undefined,
        // Capped. Each extra year is another ingress scan and another set of window searches,
        // and a request for two centuries would sit on a worker for the rest of the afternoon.
        backYears: clamp(b?.backYears, 0, 30, 5),
        forwardYears: clamp(b?.forwardYears, 1, 30, 5),
        name: typeof b?.name === 'string' ? b.name.slice(0, 80) : undefined,
      });
      return reply
        .header('content-type', 'text/html; charset=utf-8')
        .header('content-disposition', 'attachment; filename="full-chart-reading.html"')
        .send(html);
    } catch (e) {
      req.log.error({ err: e }, 'report build failed');
      return reply.code(500).send({
        error: 'report could not be built',
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  });

  // The dynamic answer. Birth details in, a composed answer out — the model chooses which
  // calculations run and in what order, and writes none of the words.
  app.post('/ai/answer', async (req, reply) => {
    const b = req.body as Record<string, unknown> | undefined;
    const question = typeof b?.question === 'string' ? b.question.trim() : '';
    const birth = b?.birth as Record<string, unknown> | undefined;
    if (question.length < 2) return reply.code(400).send({ error: 'question is required' });
    if (!birth || typeof birth.date !== 'string' || typeof birth.lat !== 'number'
      || typeof birth.lng !== 'number' || typeof birth.tzOffsetMinutes !== 'number') {
      return reply.code(400).send({
        error: 'birth { date, time?, unknownTime, place, lat, lng, tzOffsetMinutes } is required',
      });
    }
    try {
      return await planAnswer({
        question,
        birth: birth as never,
        now: typeof b?.now === 'string' ? b.now : undefined,
        from: typeof b?.from === 'string' ? b.from : undefined,
        to: typeof b?.to === 'string' ? b.to : undefined,
        windowLabel: typeof b?.windowLabel === 'string' ? b.windowLabel : undefined,
        subject: typeof b?.subject === 'string' ? b.subject : null,
      });
    } catch (e) {
      req.log.warn({ err: e }, 'planner failed');
      return reply.code(503).send({
        error: 'planner unavailable',
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  });

  app.get('/ai/status', async () => ({
    ready: routerReady(),
    model: process.env.AI_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
    note: 'Downloads once (~25 MB) then runs entirely offline. Never generates text.',
  }));

  // BPHS extraction programme routes (docs/BPHS_PROGRAMME.md) live in their own module —
  // the programme runs to 51 parts and this file is long enough already.
  registerBphsRoutes(app);


  // --- DeepSeek Persistent Chat Routes ---
  app.post('/chat/start', async (req, reply) => {
    const b = req.body as any;
    if (!b || !b.question || !b.birth || !b.facts) {
      return reply.code(400).send({ error: 'question, birth, and facts are required' });
    }
    const messageId = crypto.randomUUID();
    
    // Initialize the buffer status immediately
    updateChatStatus(messageId, 'Initializing request...', null);

    // Run the pipeline asynchronously in the background so we don't block the HTTP response
    const port = Number(process.env.PORT ?? 8787);
    runServerAIPipeline(messageId, b.question, b.birth, b.facts, port).catch(e => {
        console.error('Pipeline failed:', e);
        updateChatStatus(messageId, 'Done', JSON.stringify({
            headline: 'Analysis Error',
            sections: [{ title: 'Error', body: ['The server encountered an error processing your request.'] }]
        }));
    });

    return reply.send({ messageId });
  });

  app.get('/chat/status/:messageId', async (req, reply) => {
    const { messageId } = req.params as any;
    const status = getChatStatus(messageId);
    if (!status) {
      return reply.code(404).send({ error: 'Message ID not found or already acknowledged' });
    }
    return reply.send(status);
  });

  app.post('/chat/ack/:messageId', async (req, reply) => {
    const { messageId } = req.params as any;
    ackChat(messageId);
    return reply.send({ success: true });
  });
  // ----------------------------------------

  return app;
}

// Start only when run directly (not when imported by tests).
if (process.env.AURA_NO_LISTEN !== '1' && !process.env.VITEST) {
  const port = Number(process.env.PORT ?? 8787);
  buildServer()
    .listen({ port, host: '0.0.0.0' })
    .then(() => {
      console.log(`aura knowledge API on http://localhost:${port}`);
      // Warm the encoder in the background. The first question should not be the one that
      // pays for the download.
      initRouter()
        .then(() => console.log('semantic router: ready'))
        .catch((e) => console.log(`semantic router: unavailable (${e?.message ?? e})`));
      // Say it at boot rather than at the first question. A key added to .env after the
      // server started is a key the server has not read — `tsx watch` reloads on source
      // changes, not on .env, so this line is how you know which state you are in.
      console.log(mentorConfigured()
        ? `mentor: ready (${modelPolicy().default})`
        : 'mentor: NOT configured — set GEMINI_API_KEY in apps/api/.env and restart. '
          + 'Everything else works without it.');
    })
    .catch((e) => { console.error(e); process.exit(1); });
}
