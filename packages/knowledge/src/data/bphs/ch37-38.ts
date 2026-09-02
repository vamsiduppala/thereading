// BPHS Programme Part 32 — Chapters 37 (Lunar Yogas) and 38 (Solar Yogas).
//
// Two chapters with one shape: a luminary, and what stands beside it. Sunapha / Anapha /
// Duradhara read the 2nd and 12th from the MOON; Vesi / Vosi / Ubhayachari read the same
// two houses from the SUN. Encoding them together makes the symmetry checkable, and it is
// checkable — the tests assert the two families are mirror images.
//
// Santhanam declines to annotate either chapter, referring the reader to his Saravali and
// Hora-Sara translations. So there is no worked example here and none is implied.

import type { Graha, House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import type { Predicate } from '../../rules/predicate.js';

const BENEFICS: Graha[] = ['jupiter', 'venus', 'mercury', 'moon'];
/** Every planet that can form a Sunapha-family yoga around the Moon (the Sun is excluded). */
const AROUND_MOON: Graha[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];
/** Around the Sun the Moon is the excluded one instead (BPHS 38.1). */
const AROUND_SUN: Graha[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

// ─────────────────────────────────────────────────────────────────────────────
// The catalogue
// ─────────────────────────────────────────────────────────────────────────────

export interface LuminaryYoga {
  name: string;
  chapter: 37 | 38;
  verse: string;
  /** Which luminary the houses are counted from. */
  around: 'moon' | 'sun';
  formation: string;
  surfaced: boolean;
  summary?: string;
  valence?: number;
  excluded?: string;
  withheld?: string;
}

export const LUMINARY_YOGAS: LuminaryYoga[] = [
  // ── Chapter 37, around the Moon
  {
    name: 'Sunapha', chapter: 37, verse: '7', around: 'moon',
    formation: 'A planet other than the Sun in the 2nd from the Moon.',
    surfaced: true, valence: 0.7,
    summary: 'Means that are made rather than inherited; the chapter stresses self-earned standing.',
    excluded: 'Kingship, following the corpus-wide exclusion. The chapter’s own emphasis is '
      + 'on SELF-earned wealth, which is the part worth keeping and is not a claim about rank.',
  },
  {
    name: 'Anapha', chapter: 37, verse: '8', around: 'moon',
    formation: 'A planet other than the Sun in the 12th from the Moon.',
    surfaced: true, valence: 0.7,
    summary: 'An easy presence — well regarded, and comfortable in company.',
    excluded: 'Kingship, and "free from diseases" (a medical claim).',
  },
  {
    name: 'Duradhara', chapter: 37, verse: '9', around: 'moon',
    formation: 'Planets other than the Sun in BOTH the 2nd and the 12th from the Moon.',
    surfaced: true, valence: 0.8,
    summary: 'Support on both sides at once — the chapter names generosity and real comfort.',
    excluded: 'The verse’s "excellent serving force" is a household-of-servants image, not a '
      + 'life outcome we can carry.',
  },
  {
    name: 'Kemadruma', chapter: 37, verse: '11-13', around: 'moon',
    formation: 'No planet (excluding the Sun) with the Moon, in the 2nd or 12th from her, '
      + 'or in an angle from the ascendant.',
    surfaced: false,
    withheld: 'The effect verse is entirely reproach, incapacity and destitution. The '
      + 'formation is detectable — it is the well-known counterweight to the three above, '
      + 'and a chart that has none of them is a real fact — but the reading is refused.',
  },
  {
    name: 'Adhi', chapter: 37, verse: '5', around: 'moon',
    formation: 'Benefics occupying the 6th, 7th and 8th from the Moon.',
    surfaced: true, valence: 0.8,
    summary: 'Capability that others rely on; the chapter grades it by the participants’ strength.',
    excluded: 'The verse’s three grades are king / minister / army chief. The GRADING is '
      + 'kept as a magnitude (see ADHI_YOGA_GRADES); the three offices are not.',
  },
  {
    name: 'Dhana', chapter: 37, verse: '6', around: 'moon',
    formation: 'Benefics in the upachaya houses (3rd, 6th, 10th, 11th) from the Moon — '
      + 'graded by how many are there.',
    surfaced: true, valence: 0.7,
    summary: 'A capacity to accumulate that grows with each supporting influence behind it.',
  },
  // ── Chapter 38, around the Sun
  {
    name: 'Vesi', chapter: 38, verse: '1', around: 'sun',
    formation: 'A planet other than the Moon in the 2nd from the Sun.',
    surfaced: true, valence: 0.3,
    summary: 'Straightforwardness and an even temper, with means that stay modest.',
    excluded: '"Long-bodied" is a physiognomy claim, excluded corpus-wide; "indolent" is a '
      + 'character verdict.',
  },
  {
    name: 'Vosi', chapter: 38, verse: '1', around: 'sun',
    formation: 'A planet other than the Moon in the 12th from the Sun.',
    surfaced: true, valence: 0.7,
    summary: 'Skill that gets noticed — the chapter names learning, generosity and reputation.',
  },
  {
    name: 'Ubhayachari', chapter: 38, verse: '1', around: 'sun',
    formation: 'Planets other than the Moon in BOTH the 2nd and the 12th from the Sun.',
    surfaced: true, valence: 0.8,
    summary: 'Flanked on both sides — the strongest of the three, and the chapter says so.',
    excluded: 'Kingship.',
  },
];

/**
 * BPHS 37.5's own grading of Adhi yoga: king, minister, or army chief "according to the
 * strength of the participating planets".
 *
 * The three OFFICES are not carried — they are period-specific ranks, and the corpus-wide
 * kingship exclusion applies to the first. What IS carried is that the sage grades the
 * yoga's magnitude by participant strength, because that is a real and usable claim and it
 * is the same instruction as 39.3-5 ("full, half or a quarter according to their strengths").
 */
export const ADHI_YOGA_GRADES =
  'BPHS 37.5 grades Adhi yoga into three magnitudes by the participating planets’ strength. '
  + 'The three offices it names (king, minister, army chief) are not carried — period '
  + 'specific, and the first is excluded corpus-wide. The GRADING is: this is a yoga whose '
  + 'size the source says to read from strength, not a flat claim.';

/**
 * BPHS 38.4 — the modifier that makes chapter 38 more than a table.
 *
 * "Benefics causing these yogas will give the above-mentioned effects while malefics will
 * produce contrary effects." So Vesi formed by Jupiter and Vesi formed by Saturn are not
 * the same yoga, and a table that lists Vesi once would say they are.
 *
 * This is why every rule below names the specific planet that forms the yoga rather than
 * quantifying over "a planet" — the valence has to follow the participant.
 */
export const CH38_BENEFIC_MALEFIC_MODIFIER =
  'BPHS 38.4: a benefic forming Vesi/Vosi/Ubhayachari gives the stated effects, a malefic '
  + 'gives the contrary. So the participant decides the valence, and the rules name the '
  + 'planet rather than quantifying over "a planet" — a table listing Vesi once would claim '
  + 'that Jupiter and Saturn forming it mean the same thing.';

export const CH38_TEXTUAL_FAULT =
  'BPHS 38.2-3 prints "One born in Vesi yoga" TWICE, for two different sets of effects. The '
  + 'second is plainly Vosi — the verse is introducing all three yogas in order and Vosi is '
  + 'otherwise never given an effect. Fourth transcription fault found in this edition, '
  + 'after ch 27’s missing verses 30-31, ch 25’s missing verse, and ch 32’s Gnati Karaka.';

// ─────────────────────────────────────────────────────────────────────────────
// Rules
// ─────────────────────────────────────────────────────────────────────────────

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const rule = (
  y: LuminaryYoga, i: number, when: Predicate[], valence: number, note?: string,
): Rule => ({
  id: `bphs.${y.chapter}.${y.verse.split('-')[0]!.padStart(3, '0')}.${slug(y.name)}-${i}`,
  source: { text: 'bphs', chapter: y.chapter, verse: y.verse },
  when,
  effect: {
    id: `yoga.${slug(y.name)}`,
    domain: y.chapter === 37 ? 'wealth' : 'self',
    valence,
    summary: y.summary!,
  },
  weight: Math.min(1, Math.abs(valence) + 0.2),
  verification: 'unverified',
  ...(note ? { note } : {}),
  ...(y.excluded ? { note: `Not carried from this verse: ${y.excluded}` } : {}),
});

export function luminaryYogaRules(): Rule[] {
  const out: Rule[] = [];
  const by = (n: string) => LUMINARY_YOGAS.find((y) => y.name === n)!;

  // Sunapha / Anapha — one rule per forming planet, because 38.4's modifier (which the
  // tradition applies to the lunar family too) makes the participant decide the valence.
  for (const [name, house] of [['Sunapha', 2], ['Anapha', 12]] as [string, House][]) {
    const y = by(name);
    AROUND_MOON.forEach((g, i) => {
      const benefic = BENEFICS.includes(g);
      out.push(rule(y, i + 1, [{ k: 'placement', graha: g, house, from: 'moon' }],
        benefic ? y.valence! : y.valence! * 0.4));
    });
  }
  // Duradhara — both sides at once.
  {
    const y = by('Duradhara');
    let i = 0;
    for (const a of AROUND_MOON) {
      for (const b of AROUND_MOON) {
        if (a === b) continue;   // one planet cannot hold both the 2nd and the 12th
        i += 1;
        out.push(rule(y, i, [
          { k: 'placement', graha: a, house: 2, from: 'moon' },
          { k: 'placement', graha: b, house: 12, from: 'moon' },
        ], y.valence!));
      }
    }
  }
  // Adhi — benefics in the 6th, 7th, 8th from the Moon.
  {
    const y = by('Adhi');
    let i = 0;
    for (const g of BENEFICS.filter((x) => x !== 'moon')) {
      for (const h of [6, 7, 8] as House[]) {
        i += 1;
        out.push(rule(y, i, [{ k: 'placement', graha: g, house: h, from: 'moon' }], y.valence!));
      }
    }
  }
  // Dhana — benefics in an upachaya from the Moon.
  {
    const y = by('Dhana');
    let i = 0;
    for (const g of BENEFICS.filter((x) => x !== 'moon')) {
      for (const h of [3, 6, 10, 11] as House[]) {
        i += 1;
        out.push(rule(y, i, [{ k: 'placement', graha: g, house: h, from: 'moon' }], y.valence!));
      }
    }
  }
  // Vesi / Vosi — the solar mirror.
  for (const [name, house] of [['Vesi', 2], ['Vosi', 12]] as [string, House][]) {
    const y = by(name);
    AROUND_SUN.forEach((g, i) => {
      const benefic = BENEFICS.includes(g);
      // 38.4: a malefic forming these gives the CONTRARY effect, so the valence flips
      // rather than merely shrinking. That is the chapter's own word.
      out.push(rule(y, i + 1, [{ k: 'placement', graha: g, house, from: 'sun' }],
        benefic ? y.valence! : -y.valence!));
    });
  }
  // Ubhayachari.
  {
    const y = by('Ubhayachari');
    let i = 0;
    for (const a of AROUND_SUN) {
      for (const b of AROUND_SUN) {
        if (a === b) continue;
        i += 1;
        out.push(rule(y, i, [
          { k: 'placement', graha: a, house: 2, from: 'sun' },
          { k: 'placement', graha: b, house: 12, from: 'sun' },
        ], BENEFICS.includes(a) && BENEFICS.includes(b) ? y.valence! : -y.valence!));
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Kemadruma — an ABSENCE, so a detector rather than a rule
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kemadruma yoga (BPHS 37.11-13): the Moon stands alone.
 *
 * Computed rather than encoded as a `Rule` because it is an ABSENCE — no planet with the
 * Moon, none in the 2nd or 12th from her, and none in an angle from the ascendant.
 *
 * The DSL *can* say this: `compound` has an `op: 'not'` and it composes over `or`. But
 * writing it out means one `not(or(...))` over five planets times seven positions — 35
 * disjuncts to express "the Moon stands alone" — and the resulting rule's counted arity
 * would be 1, which says nothing about how specific it actually is. A detector states the
 * same fact legibly, and this is a case where the DSL being capable is not the same as the
 * DSL being the right tool.
 *
 * The reading is refused (reproach and destitution); this returns only whether the shape is
 * present, which is a real and well-known fact about a chart.
 */
export function hasKemadruma(
  lagnaSign: number, planets: Partial<Record<Graha, { sign: number }>>,
): boolean {
  const moon = planets.moon;
  if (!moon) return false;
  const others = (Object.entries(planets) as [Graha, { sign: number }][])
    .filter(([g]) => g !== 'moon' && g !== 'sun' && g !== 'rahu' && g !== 'ketu');
  const rel = (s: number, from: number) => (((s - from) % 12) + 12) % 12;
  for (const [, p] of others) {
    const fromMoon = rel(p.sign, moon.sign);
    if (fromMoon === 0 || fromMoon === 1 || fromMoon === 11) return false;
    if ([0, 3, 6, 9].includes(rel(p.sign, lagnaSign))) return false;
  }
  return true;
}

export const KEMADRUMA_IS_AN_ABSENCE =
  'Kemadruma is computed, not encoded as a Rule, because it is an ABSENCE. The DSL CAN '
  + 'express it — `compound` has `op: "not"` — but it would take a not(or(…)) over 35 '
  + 'disjuncts, and the rule’s counted arity would come out as 1, which misrepresents how '
  + 'specific it is. Capability is not the same as fitness. Its reading is refused '
  + '(reproach and destitution); only the shape is reported.';

export const CH37_38_YIELD = {
  chapters: [37, 38],
  verses: 17,
  note: 'Two small chapters with one shape, encoded together so the symmetry is testable: '
    + 'the lunar family reads the 2nd and 12th from the Moon and the solar family reads the '
    + 'same two houses from the Sun, each excluding the other luminary. Both were made '
    + 'expressible by Part 28’s planetary frames — before that neither could be written at '
    + 'all. Kemadruma’s reading is refused and its shape computed. Santhanam annotates '
    + 'neither chapter, so there is no worked example and none is implied.',
} as const;
