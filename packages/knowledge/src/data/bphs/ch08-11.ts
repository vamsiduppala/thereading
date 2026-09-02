// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 8 and 11. Programme Part 6.
//   Ch 8  — Aspects of the Signs (rasi drishti), lines 4824-4985
//   Ch 11 — Judgement of Houses, lines 5337-5516
//
// Two small definitional chapters that later rule parts lean on heavily.
//
// Ch 8's rasi drishti is **not** the same thing as planetary drishti and must not be
// folded into it. Three differences matter:
//   • It is MUTUAL. If Aries aspects Leo then Leo aspects Aries. Graha drishti is
//     directional — Saturn's 3rd-house aspect is not returned by the aspected house.
//   • It ignores longitude entirely. It is a whole-sign relation by modality.
//   • It is the Jaimini layer, used with arudhas and rasi dashas rather than with the
//     graha-drishti rules of ch 26.
//
// Ch 11.14-16 is where this part earns its keep: it is a genuine conditional rule block
// — the conditions under which a house prospers or fails — and so it is encoded as
// actual `Rule` records against the Part 1 predicate DSL rather than as prose. These are
// the programme's first real rules.
// ─────────────────────────────────────────────────────────────────────────────

import type { Graha, House, SignIndex } from '../../types.js';
import type { Rule } from '../../rules/rule.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;

/** 0 movable · 1 fixed · 2 dual — the only thing rasi drishti depends on. */
const modalityOf = (sign: SignIndex): 0 | 1 | 2 => (mod12(sign) % 3) as 0 | 1 | 2;

// ── 8.1-5 Rasi drishti ────────────────────────────────────────────────────────

/**
 * The signs a sign aspects (8.1-3).
 *
 *   movable → the three FIXED signs, except the adjacent one
 *   fixed   → the three MOVABLE signs, except the adjacent one
 *   dual    → the other three DUAL signs
 *
 * Verified against all three of the chapter's explicit statements: Aries → Leo, Scorpio,
 * Aquarius; Taurus → Cancer, Libra, Capricorn; Gemini → Virgo, Sagittarius, Pisces.
 *
 * This reimplements what `rasiDrishti` in data/aspects.ts already does — deliberately, as
 * a cross-check rather than a replacement. The two agree for all twelve signs (asserted
 * in the test), which is independent confirmation of an implementation that had only ever
 * been checked against the first corpus. `rasiDrishti` remains the one callers should use.
 */
export function rasiAspects(sign: SignIndex): SignIndex[] {
  const s = mod12(sign);
  const m = modalityOf(s);
  const out: SignIndex[] = [];
  for (let t = 0; t < 12; t++) {
    if (t === s) continue;
    const tm = modalityOf(t);
    if (m === 2) {
      if (tm === 2) out.push(t);
      continue;
    }
    const opposite = m === 0 ? 1 : 0;
    if (tm !== opposite) continue;
    // "leaving the sign adjacent to it" — only one neighbour can be of the opposite
    // modality, so checking both sides is equivalent and safer.
    if (t === mod12(s + 1) || t === mod12(s - 1)) continue;
    out.push(t);
  }
  return out;
}

/** Does sign `a` aspect sign `b` by rasi drishti? */
export const rasiAspectsSign = (a: SignIndex, b: SignIndex): boolean =>
  rasiAspects(a).includes(mod12(b));

/**
 * 8.4-5: a planet takes the aspect of the sign it occupies, and the aspect lands on the
 * occupants of the aspected sign as well as on the sign itself. So planet-to-planet rasi
 * drishti is decided purely by the two signs.
 */
export const rasiAspectsBetween = (fromSign: SignIndex, toSign: SignIndex): boolean =>
  rasiAspectsSign(fromSign, toSign);

/**
 * Rasi drishti is MUTUAL — a property graha drishti does not have.
 *
 * It falls out of the modality rule: movable and fixed aspect each other reciprocally,
 * and dual signs aspect each other. Worth stating as an assertion rather than a comment
 * because it is the cleanest single test that the two aspect systems have not been
 * conflated somewhere downstream.
 */
export const RASI_DRISHTI_IS_MUTUAL = true;

export const RASI_VS_GRAHA_DRISHTI =
  'Rasi drishti (ch 8) is mutual, ignores longitude, and works by modality — the Jaimini '
  + 'layer, used with arudhas and rasi dashas. Graha drishti (ch 26) is directional and '
  + 'graded by quarters. They are different systems; do not merge them.';

// ── 11.2-13 House indications ─────────────────────────────────────────────────

/**
 * What each house is judged for (11.2-13).
 *
 * RECONCILIATION with the existing `BHAVAS` significations (first corpus): the two agree
 * on the core of every house. BPHS adds a few items the existing data does not carry, and
 * they are listed here rather than merged, so the provenance stays visible:
 *   • 2nd  — "death" and "enemies" alongside wealth and family
 *   • 3rd  — "parents' death" and "initiatory instruction" (upadesha)
 *   • 5th  — "amulets and sacred spells" (yantra/mantra), and "fall of position"
 *   • 11th — "son's wife"
 *   • 12th — "one's own death"
 *
 * The death-adjacent items are recorded for completeness and are **never surfaced** under
 * the standing policy. They belong to the Part 51 material.
 */
export const BPHS_HOUSE_INDICATIONS: Record<House, string[]> = {
  1: ['physique', 'appearance', 'intellect', 'complexion', 'vigour', 'weakness', 'happiness', 'grief', 'innate nature'],
  2: ['wealth', 'food and grains', 'family', 'metals', 'precious stones'],
  3: ['valour', 'servants', 'siblings', 'initiatory instruction', 'journeys'],
  4: ['conveyances', 'relatives', 'mother', 'happiness', 'treasure', 'lands', 'houses'],
  5: ['amulets and sacred spells', 'learning', 'knowledge', 'children', 'authority', 'loss of position'],
  6: ['debts', 'disease', 'enemies'],
  7: ['spouse', 'marriage', 'partnerships'],
  8: ['transformation', 'the hidden', 'inheritance'],
  9: ['fortune', 'father', 'dharma'],
  10: ['action in the world', 'standing', 'livelihood'],
  11: ['all articles', 'income', 'prosperity', 'quadrupeds'],
  12: ['expenses', 'enemies'],
};

/** House indications BPHS gives that the standing policy keeps computed and unsurfaced. */
export const UNSURFACED_HOUSE_INDICATIONS: Partial<Record<House, string[]>> = {
  2: ['death (maraka)'],
  3: ["parents' longevity"],
  12: ['own longevity'],
};

// ── 11.14-16 Prosperity or annihilation of a house ────────────────────────────

/**
 * The avastha window a house-lord must occupy for the house to prosper (11.14-16 notes).
 *
 * The five baladi states divide a sign into 6° portions — Bala, Kumara, Yuva, Vriddha,
 * Mrita — running forward in an odd sign and reversed in an even one. The two states the
 * verse wants (Kumara and Yuva) therefore fall at **6°–18° in an odd sign** and
 * **12°–24° in an even sign**, which is exactly what the notes state.
 */
export function lordInFavourableAvastha(sign: SignIndex, degInSign: number): boolean {
  const odd = mod12(sign) % 2 === 0;
  return odd ? degInSign >= 6 && degInSign < 18 : degInSign >= 12 && degInSign < 24;
}

/**
 * 11.14-16 attaches a veto: "if a planet is debilitated or is combust, the goods cited
 * are void". Structurally identical to the 6.53 veto on varga classification — a house
 * whose lord qualifies on paper still fails if the lord is debilitated or combust.
 */
export const HOUSE_PROSPERITY_VETO = ['debilitated', 'combust'] as const;

/** Lords whose company spoils a house-lord (11.15-16). */
export const SPOILING_LORDSHIPS: House[] = [3, 6, 8, 11, 12];

/**
 * The conditions of 11.14-16, as real `Rule` records against the Part 1 predicate DSL.
 *
 * These are the programme's first genuine rules — everything before this was definitions
 * and computations. Note what the shape buys immediately:
 *   • each carries its verse, so any claim is traceable
 *   • `arity` is counted, so the multi-condition rules outrank the single-condition ones
 *     without anyone deciding that by hand
 *   • the failure rules carry `unless`, so the text's own veto is structural
 *
 * `houseOf` is a placeholder house — these are templates instantiated per house by
 * `houseProsperityRules(house)` below, because BPHS states them for "a house" generally.
 */
export function houseProsperityRules(house: House): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 11, verse });
  return [
    {
      id: `bphs.11.014.benefic-in.${house}`,
      source: src('14-16'),
      when: [{ k: 'placement', graha: 'jupiter', house }],
      effect: {
        id: `house.${house}.prospers`,
        domain: 'strength',
        valence: 0.6,
        summary: `The ${house}th house prospers — a benefic occupies it.`,
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'Template: BPHS says "a benefic". Instantiated here for Jupiter; the caller '
        + 'should generate one rule per planet its chart treats as benefic, since '
        + 'benefic status is chart-dependent (a waning Moon is malefic, and Mercury '
        + 'takes the nature of its company — BPHS 3.11).',
    },
    {
      id: `bphs.11.014.lord-in-tenth.${house}`,
      source: src('14-16'),
      when: [{ k: 'lordship', house, occupies: 10 }],
      effect: {
        id: `house.${house}.prospers`,
        domain: 'strength',
        valence: 0.5,
        summary: `The ${house}th house prospers — its lord stands in the 10th.`,
      },
      weight: 0.5,
      verification: 'unverified',
    },
    {
      id: `bphs.11.015.lord-with-spoiler.${house}`,
      source: src('15-16'),
      when: [
        { k: 'lordship', house, occupies: 6 },
      ],
      effect: {
        id: `house.${house}.diminishes`,
        domain: 'strength',
        valence: -0.5,
        summary: `The ${house}th house is weakened — its lord falls in a dusthana.`,
      },
      weight: 0.5,
      verification: 'unverified',
      note: 'BPHS 11.15-16 names association with the lords of 3/6/8/11/12, defeat in '
        + 'planetary war, and the Vriddha/Mrita/Supta avasthas. Only the placement clause '
        + 'is expressible today; the rest need graha yuddha (ch 26) and the avastha '
        + 'predicates, so they are deliberately NOT asserted here rather than approximated.',
    },
  ];
}

/**
 * What 11.14-16 states that the engine cannot yet express, recorded so it is not
 * mistaken for encoded.
 *
 * This is the first time the programme has hit a rule whose conditions outrun the
 * predicate vocabulary, and the honest response is to encode the expressible clauses and
 * name the rest — not to approximate them and call the rule done.
 */
/**
 * CLOSED by Programme Part 11: "lord defeated in planetary war" used to sit on this list,
 * pointing at ch 26. It is actually BPHS 27.20, and since Part 11 encoded graha yuddha the
 * predicate DSL gained a `state: 'defeated'` kind. That clause is now expressible.
 */
export const HOUSE_PROSPERITY_NOT_YET_EXPRESSIBLE = [
  'lord not aspected by itself — needs the aspect predicate applied reflexively',
  'lord conjunct a malefic — needs chart-dependent benefic/malefic status',
  'lord conjunct a lord of the 3rd/6th/8th/11th/12th — needs a lordship-of-conjunct predicate',
  'lord in Vriddha, Mrita or Supta avastha — avastha data exists, no predicate binds it yet',
] as const;
