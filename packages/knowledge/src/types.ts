// ─────────────────────────────────────────────────────────────────────────────
// @aura/knowledge — types for the Vedic-astrology knowledge base.
// The traditional RULES/FACTS are encoded as structured data (our own concise
// phrasing), organized per the source's chapters. This is the reference the Cosmic
// Mentor and the interpretation engine read from. Computation lives in @aura/engine.
// ─────────────────────────────────────────────────────────────────────────────

export type Graha =
  | 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu';

/** Sign index 0..11 (0 = Aries). */
export type SignIndex = number;
/** House 1..12. */
export type House = number;

export type Element = 'fire' | 'earth' | 'air' | 'ether' | 'water';
export type Guna = 'sattva' | 'rajas' | 'tamas';
export type Modality = 'movable' | 'fixed' | 'dual';
export type Gender = 'male' | 'female' | 'neuter';
export type Varna = 'brahmana' | 'kshatriya' | 'vaishya' | 'shudra';
export type NaturalNature = 'benefic' | 'malefic' | 'conditional';

/**
 * Which ascendant a house is counted from (BPHS 5.9, Programme Part 2).
 *
 * There is no single "the lagna": BPHS instructs that a full house chart be built from
 * the natal, Bhava, Hora and Ghatika ascendants, and a planet's house differs between
 * them. Lives in types.ts rather than in a chapter module because both the predicate
 * engine and the chapter data need it, and neither should depend on the other.
 */
/**
 * A point a rule can be read "from". Part 2 introduced this for the three special
 * ascendants of BPHS ch 5; Part 12 added the two Jaimini reference points, because every
 * rule in ch 29-30 counts houses from a PADA rather than from any ascendant; Part 20 added
 * the Moon, because BPHS 12.11 directs that the first-house effects be read from the Moon
 * as well as from the ascendant — which doubles every house rule in Phase III.
 */
/**
 * The frame a rule counts houses from.
 *
 * Two kinds share one type. The first six are genuine ascendants and must be supplied on
 * `ChartFacts.lagnas` — nothing else can derive them. The rest are **planetary frames**
 * (BPHS 32.22-24: "the 9th from the Sun denotes father, the 3rd from Mars brothers"), and
 * those resolve from `ChartFacts.planets`, which every chart already carries.
 *
 * That asymmetry is the point. A planetary frame demands no new fact, so it cannot repeat
 * the failure where a finished rule measures zero because the generator never fed the fact
 * it reads (see `CH25_WIRING` — the fifth instance). `moon` belongs to both: it is the
 * chandra lagna and it is a planet, and it now resolves either way.
 */
export type AscendantReference =
  | 'natal' | 'bhava' | 'hora' | 'ghatika'
  | 'arudha' | 'upapada'
  | 'moon'
  | 'karakamsa';

/** A planet used as the frame — resolves from `planets`, needs no new fact. */
export type PlanetFrame =
  | 'sun' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu';

export type LagnaReference = AscendantReference | PlanetFrame;

// ── Planets (Ch 3) ───────────────────────────────────────────────────────────
export interface GrahaKnowledge {
  key: Graha;
  english: string;
  sanskrit: string;
  naturalNature: NaturalNature;
  /** The one thing it primarily governs (Ch 3.2.3). */
  governs: string;
  /** Broad significations (people, themes) it stands for. */
  significations: string[];
  /** People it represents (planetary cabinet, Ch 3.2.5). */
  cabinet: string;
  deity: string;
  gender: Gender;
  element: Element | null;
  varna: Varna | null;
  guna: Guna | null;
  /** Body tissue it rules (sapta dhatu, Ch 3.2.12). */
  bodyTissue: string | null;
  taste: string | null;
  season: string | null;
  /** House (1/4/7/10) of directional strength (dig bala, Ch 3.2.15). */
  digBalaHouse: House | null;
  strongIn: 'day' | 'night' | 'always' | null;
  colour: string | null;
}

// ── Signs (Ch 2) ─────────────────────────────────────────────────────────────
export interface RasiKnowledge {
  index: SignIndex;
  english: string;
  sanskrit: string;
  lord: Graha;
  element: Element;
  modality: Modality;
  /** Odd signs are 'male', even are 'female' (Ch 2.2.2). */
  gender: Gender;
  guna: Guna | null;
  dosha: 'pitta' | 'vaata' | 'kapha' | null;
  direction: string | null;
  varna: Varna | null;
  /** Body part in Kalapurusha (the cosmic body). */
  bodyPart: string;
  indications: string[];
}

// ── Houses (Ch 7) ────────────────────────────────────────────────────────────
export type HouseCategory = 'kendra' | 'trikona' | 'dusthana' | 'upachaya' | 'maraka' | 'panapara' | 'apoklima';
export interface BhavaKnowledge {
  number: House;
  english: string;
  sanskrit: string;
  categories: HouseCategory[];
  /** Natural significator planet(s) of the house. */
  karakas: Graha[];
  bodyPart: string;
  significations: string[];
}

// ── Nakshatras (Ch 1.3.6 / Table 2) ──────────────────────────────────────────
export interface NakshatraKnowledge {
  index: number; // 0..26
  name: string;
  lord: Graha; // Vimsottari dasha lord
  deity: string;
  symbol: string;
  /** One-line nature/theme. */
  theme: string;
}

// ── Yogas (Ch 11) ────────────────────────────────────────────────────────────
export interface YogaKnowledge {
  key: string;
  name: string;
  category: string;
  /** The defining rule, in plain terms. */
  rule: string;
  /** The classical effect/result. */
  effect: string;
}

// ── A generic concept entry (for search + chapters not yet modeled richly) ──
export interface Concept {
  id: string;
  chapter: string;
  term: string;
  aka?: string[];
  summary: string;
  tags: string[];
}
