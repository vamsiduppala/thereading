// BPHS Programme Part 46 — Chapters 75, 76 and 77. Phase V begins.
//
// Three short chapters (298 lines) with one shape between them: **a planet's STRENGTH decides
// a classification of the native.** Chapter 75 makes five named yogas out of it, 76 makes an
// elemental temperament, 77 makes a guna.
//
// The structure is encodable and is encoded. Most of what is hung on it is not:
//
//   - **ch 75.3-22** is physiognomy (long face, developed chest, small teeth) ending in a
//     death prediction. Refused — the same ground that excludes chapters 81-82.
//   - **ch 76.6-14** is temperament-by-appearance (fragrance of camphor, fair complexion).
//     Refused on the same ground.
//   - **ch 77.5-22** classifies people as Uttama / Madhyama / Udaseena / **Adhama
//     ("despicable")**, sorts them into occupations by that class, makes a marriage unhappy if
//     the wife's attributes exceed the husband's, and maps the four classes onto a cosmic
//     body's head, arms, thighs and feet. Refused in full, for contempt rather than doctrine —
//     the ground Part 30 used for 13 of the 32 Nabhasa readings.
//
// The reconciliation is the other half: **the engine has shipped the five Mahapurusha yogas
// since before this programme began, and its detection is missing a condition the chapter's
// Sanskrit states.**

import type { Graha } from '../../types.js';
import type { Predicate } from '../../rules/predicate.js';
import type { Rule } from '../../rules/rule.js';
import { SHADBALA_REQUIRED } from './ch27c.js';

// ─────────────────────────────────────────────────────────────────────────────
// 75.1-2 — the Pancha Mahapurusha formation, reconciled
// ─────────────────────────────────────────────────────────────────────────────

export interface MahapurushaYoga {
  key: string;
  graha: Graha;
  /** What the yoga is called; the corpus names it, we do not. */
  name: string;
}

/**
 * BPHS 75.1-2 names five yogas, one per non-luminary, in a fixed order.
 *
 * The Sanskrit of 75.1: **स्वभोच्चगतकेन्द्रस्थैर्बलिभिश्च कुजादिभिः** —
 * *svabha-uchcha-gata-kendra-sthaih **balibhih** cha kujādibhih*: "by Mars and the rest, being
 * in own sign or exaltation, situated in a kendra, **and strong**."
 *
 * Three conditions, not two.
 */
export const MAHAPURUSHA_YOGAS: MahapurushaYoga[] = [
  { key: 'ruchaka', graha: 'mars', name: 'Ruchaka' },
  { key: 'bhadra', graha: 'mercury', name: 'Bhadra' },
  { key: 'hamsa', graha: 'jupiter', name: 'Hamsa' },
  { key: 'malavya', graha: 'venus', name: 'Malavya' },
  { key: 'sasa', graha: 'saturn', name: 'Sasa' },
];

/**
 * ⚠️ **The shipped detection is missing the strength condition, and the English translation is
 * why.**
 *
 * `packages/engine/src/chart/yogas.ts` detects a Mahapurusha yoga as *"a planet in
 * own/exaltation AND in a kendra"* — two conditions. BPHS 75.1's Sanskrit states three: own
 * sign or exaltation, **a kendra**, and **balibhih — strong**.
 *
 * The English in this edition simply stops mid-sentence: *"When Mars, Mercury, Jupiter, Venus
 * and Saturn being in their own sign or in their sign"* — losing both the kendra and the
 * strength. The shipped code has the kendra, so it was not built from this sentence; the
 * strength is the half nothing supplied.
 *
 * **The programme has a settled decision for exactly this**: `bphs.04.016/017/022` chose the
 * Sanskrit over the English translation in two cases, on the ground that a truncated or
 * garbled English line is evidence about the transcription, not about the rule. The same
 * applies here, and the truncation is visible rather than inferred — the sentence has no verb.
 *
 * **Not changed unilaterally.** `detectYogas` is product-facing: these five yogas carry
 * user-visible blurbs, and tightening the condition removes a positive reading from charts
 * that currently receive one. That is a product decision, like the Upapada convention.
 * `mahapurushaRules()` encodes the rule as the chapter states it; the engine is left alone and
 * the divergence is recorded here so a caller can see both.
 */
export const MAHAPURUSHA_STRENGTH_CONDITION_MISSING =
  'BPHS 75.1’s Sanskrit gives THREE conditions — own sign or exaltation, a KENDRA, and '
  + '**balibhih (STRONG)**. The shipped `detectYogas` in `packages/engine/src/chart/yogas.ts` '
  + 'checks only the first two. The English in this edition stops mid-sentence ("...being in '
  + 'their own sign or in their sign") with no verb, losing both the kendra and the strength; '
  + 'the code has the kendra, so it was not built from that sentence and the strength is the '
  + 'half nothing supplied. Decision `bphs.04.016/017/022` already settles Sanskrit over a '
  + 'garbled English line. NOT changed unilaterally: `detectYogas` is product-facing and these '
  + 'five carry user-visible blurbs, so tightening removes a positive reading from charts that '
  + 'currently get one — a product decision, like the Upapada convention. '
  + '`mahapurushaRules()` encodes the chapter’s rule; the engine is untouched; both are visible.';

/**
 * How much the missing condition actually costs, measured rather than guessed — because a
 * product decision needs a number, not an argument.
 *
 * Over 20,000 synthetic charts: **21.4% carry at least one Mahapurusha yoga as the engine
 * detects it, and 14.0% do under BPHS 75.1's stated rule.** So adopting the chapter's third
 * condition would remove the reading from **34% of the charts that currently receive one** —
 * about one chart in fourteen overall.
 *
 * That is far too large to change quietly, and it is the reason this is flagged rather than
 * fixed. It is also the number that makes the decision decidable: a third of a user-visible
 * positive reading is a product question, not a bug fix.
 */
export const MAHAPURUSHA_STRENGTH_IMPACT = {
  withoutStrengthPct: 21.4,
  withStrengthPct: 14.0,
  shareOfReadingsLost: 0.34,
  note: 'Measured over 20,000 synthetic charts. 21.4% carry at least one Mahapurusha yoga as '
    + '`detectYogas` finds it; 14.0% do under BPHS 75.1’s three conditions. Adopting the '
    + 'chapter’s rule removes the reading from 34% of charts that currently receive one — one '
    + 'chart in fourteen overall. Too large to change quietly; the number is what makes the '
    + 'product decision decidable.',
} as const;

/**
 * The five yogas as rules, with all three of 75.1's conditions.
 *
 * `strength` uses Part 11's `SHADBALA_REQUIRED` threshold — the corpus's own definition of
 * strong (27.32-33), rather than a number chosen here. That matters: "strong" is exactly the
 * kind of word a reader would otherwise have to guess at, and BPHS defines it.
 *
 * No effect prose is attached beyond a neutral summary. Chapter 75's own descriptions of these
 * natives are physiognomy and are refused — see `CH75_DESCRIPTIONS_REFUSED` — so a summary
 * here would have to be invented, and inventing one is how a yoga acquires a meaning the
 * source never gave it.
 */
export function mahapurushaRules(): Rule[] {
  return MAHAPURUSHA_YOGAS.map((y): Rule => {
    const when: Predicate[] = [
      { k: 'dignity', graha: y.graha, is: ['own', 'exalted'] },
      { k: 'compound', op: 'or', of: ([1, 4, 7, 10] as const).map((h): Predicate => ({
        k: 'placement', graha: y.graha, house: h,
      })) },
      // 75.1's third condition, by the corpus's own threshold (27.32-33).
      { k: 'strength', graha: y.graha, op: '>=', rupas: SHADBALA_REQUIRED[y.graha]! },
    ];
    return {
      id: `bphs.75.001.${y.key}`,
      source: { text: 'bphs', chapter: 75, verse: '1-2' },
      when,
      effect: {
        id: `yoga.mahapurusha.${y.key}`,
        domain: 'self',
        valence: 0.7,
        summary: `${y.name} yoga: this planet stands in its own dignity, in an angle, and `
          + 'strong — a durable strength of character rather than a passing advantage.',
      },
      weight: 0.9,
      verification: 'unverified',
      note: 'BPHS 75.3-22’s descriptions of these natives are physiognomy and a death '
        + 'prediction, and are not carried.',
    };
  });
}

export const CH75_DESCRIPTIONS_REFUSED =
  'BPHS 75.3-22 describes each Mahapurusha native physically — long face, developed chest, '
  + 'small teeth, complexion, height and weight in karshas — and closes several of them with a '
  + 'death prediction ("dies after attaining the age of 70 by fire or weapons"). Refused on '
  + 'two standing grounds at once: physiognomy is excluded (the same reason chapters 81-82 '
  + 'are), and manner-and-age of death is Part 51 material that is never surfaced. What is '
  + 'kept is 75.1-2, the formation rule, which is structural.';

// ─────────────────────────────────────────────────────────────────────────────
// 76 — the five elements, by whichever planet is strongest
// ─────────────────────────────────────────────────────────────────────────────

export type Element = 'fire' | 'earth' | 'ether' | 'water' | 'air';

/**
 * BPHS 76's element assignment, which the chapter states four times and never contradicts.
 *
 * 76.2 gives the base: *"Fire, earth, ether, water, air are ruled by Mars, Mercury, Jupiter,
 * Venus and Saturn respectively."* Then 76.5 adds the luminaries (*"if the Sun be endowed with
 * strength… fiery temperament; if the Moon be strong… watery"*), and 76.11-14 restate both
 * halves — fire is *"the strength of Sun or Mars"*, water *"the strength of the Moon or
 * Venus"*, earth Mercury, ether Jupiter.
 *
 * Four statements, mutually consistent. Recorded because agreement across restatements is what
 * distinguishes a mapping the chapter means from one it mentions.
 */
export const ELEMENT_OF_PLANET: Record<Graha, Element | null> = {
  sun: 'fire', mars: 'fire',
  mercury: 'earth',
  jupiter: 'ether',
  moon: 'water', venus: 'water',
  saturn: 'air',
  rahu: null, ketu: null,
};

export const ELEMENT_MAPPING_IS_STATED_FOUR_TIMES =
  'BPHS 76 assigns elements to planets in 76.2, adds the luminaries in 76.5, and restates both '
  + 'halves in 76.11-14 — four statements, mutually consistent: FIRE Sun/Mars, EARTH Mercury, '
  + 'ETHER Jupiter, WATER Moon/Venus, AIR Saturn. Recorded because agreement across '
  + 'restatements is what distinguishes a mapping the chapter MEANS from one it merely '
  + 'mentions. The nodes are unassigned; the chapter never places them.';

/**
 * BPHS 76.11-14 — which element predominates, decided by strength.
 *
 * *"When the fire element is predominant — that is, the strength of Sun or Mars is
 * predominant…"* So the element is not read off a chart's sign distribution but off the
 * Shadbala: whichever element's planets carry the most strength between them.
 *
 * Returns `null` rather than a guess when no Shadbala is supplied, and reports a tie as a tie
 * — 76.2 says effects are felt *"in proportion to the intensity of the various elements"*,
 * which is a gradient, so declaring a winner on a hairline would overstate it.
 */
export function dominantElement(
  shadbala: Partial<Record<Graha, number>>,
): { element: Element; virupas: number; tied: Element[] } | null {
  const totals = new Map<Element, number>();
  let any = false;
  for (const [g, el] of Object.entries(ELEMENT_OF_PLANET) as [Graha, Element | null][]) {
    const v = shadbala[g];
    if (el == null || v == null) continue;
    any = true;
    totals.set(el, (totals.get(el) ?? 0) + v);
  }
  if (!any) return null;
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked[0]!;
  const tied = ranked.filter(([, v]) => v === top[1]).map(([e]) => e);
  return { element: top[0], virupas: top[1], tied };
}

export const CH76_TEMPERAMENT_DESCRIPTIONS_REFUSED =
  'BPHS 76.6-14 describes each elemental temperament by appearance and constitution — "emits '
  + 'fragrance of camphor and lotus", "lean and thin body", "fair complexion", "distressed '
  + 'with hunger". Refused as physiognomy, the same ground as chapters 81-82 and 75.3-22. What '
  + 'is kept is the STRUCTURE: which planets carry which element, and that the dominant one is '
  + 'decided by STRENGTH rather than by sign distribution.';

// ─────────────────────────────────────────────────────────────────────────────
// 77 — the gunas, and a hierarchy refused in full
// ─────────────────────────────────────────────────────────────────────────────

export type Guna = 'sattva' | 'rajas' | 'tamas';

/**
 * BPHS 77.1-4's guna grouping: **Sun, Moon and Jupiter** are sattvic; **Mercury and Venus**
 * rajasic; **Mars and Saturn** tamasic. As with the elements, whichever group carries the most
 * strength predominates, and equal strength gives a mixture (*samya guna*).
 *
 * The grouping itself is standard, neutral and used elsewhere in the corpus. **The readings
 * 77.1-4 attaches to it are not carried** — see `CH77_CLASS_HIERARCHY_REFUSED`. The verse's
 * own words for the three outcomes are "of good character", "intelligent", and "stupid", and
 * the last of those is a bare insult rather than a prediction.
 */
export const GUNA_OF_PLANET: Record<Graha, Guna | null> = {
  sun: 'sattva', moon: 'sattva', jupiter: 'sattva',
  mercury: 'rajas', venus: 'rajas',
  mars: 'tamas', saturn: 'tamas',
  rahu: null, ketu: null,
};

/**
 * Which guna predominates by strength — 77.1-4's structure without its verdicts.
 *
 * A tie is reported as `samya`, which is the chapter's own word for it: *"when at the time of
 * birth all the planets are of equal dominance the person has a mixture of all the
 * attributes."* That is the one outcome 77 states without attaching a character judgement.
 */
export function dominantGuna(
  shadbala: Partial<Record<Graha, number>>,
): { guna: Guna | 'samya'; virupas: number } | null {
  const totals = new Map<Guna, number>();
  let any = false;
  for (const [g, gu] of Object.entries(GUNA_OF_PLANET) as [Graha, Guna | null][]) {
    const v = shadbala[g];
    if (gu == null || v == null) continue;
    any = true;
    totals.set(gu, (totals.get(gu) ?? 0) + v);
  }
  if (!any) return null;
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked[0]!;
  const tiedCount = ranked.filter(([, v]) => v === top[1]).length;
  return { guna: tiedCount > 1 ? 'samya' : top[0], virupas: top[1] };
}

/**
 * 🚫 **BPHS 77.5-22 is refused in full, and this is the most emphatic refusal in the
 * programme outside the doom chapters.**
 *
 * What the passage does:
 *
 *   - **77.5-8** sorts people into four classes — Uttama (most excellent), Madhyama, Udaseena
 *     (neutral) and **Adhama, which the text glosses "despicable"** — and gives the last one
 *     the attributes *"greed, falsehood, idiocy, laziness, and doing service of others."*
 *   - **77.9** instructs that *"a person should be considered appropriate for a job according
 *     to his attributes"* — occupational sorting by that class.
 *   - **77.13** states that a marriage or an employment prospers when the husband or master
 *     has the better attributes, and suffers *"if the bride or the servant possesses better
 *     attributes."*
 *   - **77.20** maps the four classes onto a cosmic body's **head, arms, thighs and feet** —
 *     the varna hierarchy, made cosmological.
 *
 * None of this is encoded, and none of it is softened into something encodable. It is not a
 * prediction about a life; it is a ranking of persons, tied to work and to marital
 * subordination. The programme has refused material for contempt before — Part 30 withheld 13
 * of the 32 Nabhasa readings on that ground, and it is recorded as an open thread precisely
 * because those were *near-misses* that a better source might rescue. This is not a near-miss.
 *
 * **What is kept is 77.1-4's grouping only** — which planets carry which guna — because that
 * mapping is neutral, standard, and used elsewhere in the corpus. Even there the verse's own
 * outcomes ("of good character", "intelligent", "stupid") are dropped: `dominantGuna` returns
 * which guna predominates and says nothing about the person.
 */
export const CH77_CLASS_HIERARCHY_REFUSED =
  'BPHS 77.5-22 is REFUSED IN FULL. It sorts people into four classes — Uttama, Madhyama, '
  + 'Udaseena and ADHAMA, which the text glosses "despicable" and gives the attributes "greed, '
  + 'falsehood, idiocy, laziness, and doing service of others"; instructs (77.9) that a person '
  + 'be matched to a JOB by that class; states (77.13) that a marriage or employment prospers '
  + 'when the husband or master has the better attributes and suffers "if the bride or the '
  + 'servant possesses better attributes"; and maps (77.20) the four classes onto a cosmic '
  + 'body’s head, arms, thighs and feet. This is not a prediction about a life but a RANKING '
  + 'OF PERSONS tied to work and marital subordination. Not encoded and not softened into '
  + 'something encodable. Part 30 refused 13 of 32 Nabhasa readings for contempt and logged '
  + 'them as near-misses a better source might rescue; THIS IS NOT A NEAR-MISS. Kept: only '
  + '77.1-4’s planet→guna grouping, with its own verdicts ("good character", "intelligent", '
  + '"stupid") dropped — `dominantGuna` says which guna predominates and nothing about the person.';

export const CH75_77_YIELD = {
  chapters: [75, 76, 77],
  note: 'Phase V opens with three short chapters sharing one shape: a planet’s STRENGTH decides '
    + 'a classification. **Reconciliation:** the engine has shipped the five Pancha Mahapurusha '
    + 'yogas since before the programme, and its detection is missing 75.1’s third condition — '
    + '**balibhih, strong** — because the English translation stops mid-sentence with no verb. '
    + 'Encoded correctly here with the corpus’s own strength threshold (27.32-33); the '
    + 'product-facing `detectYogas` is left alone and the divergence recorded, as with the '
    + 'Upapada convention. **Kept:** the element and guna groupings, each stated consistently '
    + 'across several verses, with `dominantElement` and `dominantGuna` deciding by strength. '
    + '**Refused:** 75.3-22 and 76.6-14 as physiognomy plus a death prediction; and 77.5-22 IN '
    + 'FULL — a four-class ranking of persons with a "despicable" tier, occupational sorting by '
    + 'class, a marriage rule penalising a wife whose attributes exceed her husband’s, and the '
    + 'varna hierarchy as cosmology. Refused for contempt, not doctrine, and not a near-miss.',
} as const;
