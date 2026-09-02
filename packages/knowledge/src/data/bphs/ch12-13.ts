// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapters 12 and 13 — Effects of the 1st and 2nd Houses. Programme Part 20.
//   Ch 12 — lines 5518-5721, verses 1-15
//   Ch 13 — lines 5721-5825, verses 1-13
//
// **The start of Phase III, and the part that sets the rhythm for the next thirteen.**
// Phases I and II built instruments; from here the work is filling them. What matters as
// much as the rules themselves is the shape they are written in, so it is stated once
// here and followed everywhere after:
//
//   1. Rules are `Rule[]` factories per house, each carrying its verse in `source`.
//   2. Rules making the SAME claim share an `effect.id`, so `arbitrate` can see them as
//      corroborating or contradicting rather than as unrelated noise. This is the single
//      easiest thing to get wrong at scale.
//   3. `verification: 'unverified'` unless a worked example backs it. Nothing here has one.
//   4. New rule sets go into `allEncodedRules()` in the calibration test, or the standing
//      guard cannot see them.
//   5. Mortal, medical and judgemental material is restated or excluded, and LISTED —
//      never dropped silently.
//
// The chapter also produced the part's retrofit. 12.11 instructs that these effects be
// judged from the MOON as well as the ascendant, which is not a footnote — it doubles the
// entire house corpus. `LagnaReference` gained `'moon'`.
// ─────────────────────────────────────────────────────────────────────────────

import type { House } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import type { Predicate } from '../../rules/predicate.js';
import { DUSTHANAS } from '../rajayoga.js';

/**
 * Angles and trines — the placements BPHS treats as sustaining.
 *
 * `DUSTHANAS` is deliberately NOT redefined here: `data/rajayoga.ts` already exports the
 * same three houses with the same meaning, and a second copy is how the two drift. The
 * programme has now hit four name collisions where the same word meant DIFFERENT things
 * (`uchchaBala`, three dignity ladders, `rasmi`); this is the opposite case, where the same
 * name means the same thing and the right answer is to reuse rather than rename.
 */
export const KENDRAS: House[] = [1, 4, 7, 10];
export const TRIKONAS: House[] = [5, 9];
export { DUSTHANAS };

/** "The lord of `house` occupies an angle or a trine." */
export const lordInKendraOrTrikona = (house: House): Predicate => ({
  k: 'compound',
  op: 'or',
  of: [...KENDRAS, ...TRIKONAS].map((h) => ({ k: 'lordship', house, occupies: h })),
});

/** "The lord of `house` occupies the 6th, 8th or 12th." */
export const lordInDusthana = (house: House): Predicate => ({
  k: 'compound',
  op: 'or',
  of: DUSTHANAS.map((h) => ({ k: 'lordship', house, occupies: h })),
});

/**
 * 12.2's relief clause, reused as a cancellation.
 *
 * "With a benefic in an angle or trine, all diseases will disappear." BPHS attaches it to
 * the affliction rules rather than stating it as a rule of its own, so it belongs in
 * `unless` — which is exactly the structural point Part 1 made about ch 10's antidotes.
 *
 * Instantiated for Jupiter. Benefic status is chart-dependent (3.11), so a caller should
 * generate one per planet its chart treats as benefic — the same limitation every
 * "a benefic" rule in this corpus carries.
 */
export const beneficInKendraOrTrikona: Predicate = {
  k: 'compound',
  op: 'or',
  of: [...KENDRAS, ...TRIKONAS].map((h) => ({ k: 'placement', graha: 'jupiter', house: h })),
};

// ── Chapter 12 — the first house ─────────────────────────────────────────────

/**
 * The first house: the body, vitality and bearing (12.1-7).
 *
 * Note the `effect.id` discipline. `body.wellbeing` is shared by the rule that supports it
 * and the rule that undermines it, so a chart where both fire reports **dissent** instead
 * of asserting both — which is what 74.11-13 asks for and what Part 19 implemented.
 */
export function firstHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 12, verse });
  return [
    {
      id: 'bphs.12.001.lord-in-dusthana',
      source: src('1-2'),
      when: [lordInDusthana(1)],
      unless: [beneficInKendraOrTrikona],
      effect: {
        id: 'body.wellbeing',
        domain: 'body',
        valence: -0.5,
        summary: 'Physical vigour needs more deliberate upkeep than it does for most.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'BPHS 12.1-2 states this as diminished bodily felicity and attaches its own '
        + 'antidote — a benefic in an angle or trine — which is modelled as `unless` rather '
        + 'than as prose. Restated as upkeep rather than affliction, per standing policy.',
    },
    {
      id: 'bphs.12.002.lord-in-kendra-trikona',
      source: src('1-2'),
      when: [lordInKendraOrTrikona(1)],
      effect: {
        id: 'body.wellbeing',
        domain: 'body',
        valence: 0.6,
        summary: 'Physical vigour holds up steadily, and recovers well.',
      },
      weight: 0.6,
      verification: 'unverified',
      baseRate: 0.50,
      note: 'MEASURED at 50% (Part 19 calibration) and declared here, so `arbitrate` '
        + 'withholds it as background. "The lord in an angle or a trine" covers six of '
        + 'twelve houses — it is a true statement about half of everyone, which makes it '
        + 'context rather than a finding. Kept because it is real BPHS and because the '
        + 'arbitration ordering needs the background as well as the foreground.',
    },
    {
      id: 'bphs.12.002.lord-afflicted',
      source: src('1-2'),
      when: [{ k: 'dignity', graha: 'sun', is: ['debilitated', 'enemy'] }],
      unless: [beneficInKendraOrTrikona],
      effect: {
        id: 'body.vitality-tested',
        domain: 'body',
        valence: -0.4,
        summary: 'Energy runs unevenly and asks for a steadier routine.',
      },
      weight: 0.5,
      verification: 'unverified',
      note: 'Template: the verse says "the ascendant lord", which is chart-dependent. '
        + 'Instantiated for the Sun; a caller should generate one per possible lagna lord. '
        + 'Combustion belongs here too but needs the lord resolved first.',
    },
    {
      id: 'bphs.12.004.benefic-in-lagna',
      source: src('4'),
      when: [{ k: 'placement', graha: 'jupiter', house: 1 }],
      effect: {
        id: 'self.presence',
        domain: 'self',
        valence: 0.5,
        summary: 'Carries an easy, agreeable presence that others read quickly.',
      },
      weight: 0.5,
      verification: 'unverified',
      note: 'BPHS 12.4 is about physical attractiveness. Restated as bearing and presence '
        + 'rather than appearance — the standing exclusion on physiognomy (ch 81-82) '
        + 'applies to the body, not to how someone comes across.',
    },
    {
      id: 'bphs.12.005.benefics-angular',
      source: src('5-7'),
      when: [
        { k: 'compound', op: 'or', of: [...KENDRAS, ...TRIKONAS].map((h) => ({ k: 'placement', graha: 'jupiter', house: h })) },
        { k: 'compound', op: 'or', of: [...KENDRAS, ...TRIKONAS].map((h) => ({ k: 'placement', graha: 'venus', house: h })) },
      ],
      effect: {
        id: 'self.standing',
        domain: 'self',
        valence: 0.7,
        summary: 'Capability and standing tend to be recognised rather than overlooked.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 12.5-7 names the ascendant lord, Mercury, Jupiter or Venus. Encoded as '
        + 'Jupiter AND Venus together — a two-condition form, which the calibration shows '
        + 'is properly discriminative where a one-condition version would not be.',
    },
  ];
}

// ── Chapter 13 — the second house ────────────────────────────────────────────

/**
 * The second house: resources, provision and speech (13.1-11).
 *
 * 13.4's exchange between the 2nd and 11th lords is the first genuinely two-condition rule
 * the corpus has produced from the house chapters, and it is worth noticing why: a mutual
 * exchange is a *relationship* between two placements, not a placement. The predicate DSL
 * expresses it only because `lordship` names both the house and what it occupies.
 */
export function secondHouseRules(): Rule[] {
  const src = (verse: string) => ({ text: 'bphs' as const, chapter: 13, verse });
  return [
    {
      id: 'bphs.13.001.lord-well-placed',
      source: src('1-2'),
      when: [lordInKendraOrTrikona(2)],
      effect: {
        id: 'wealth.accumulation',
        domain: 'wealth',
        valence: 0.6,
        summary: 'Resources accumulate and tend to stay accumulated.',
      },
      weight: 0.6,
      verification: 'unverified',
      baseRate: 0.50,
      note: 'MEASURED at 50% and declared, same as bphs.12.002. Half of all charts put the '
        + '2nd lord in an angle or trine, so this is background rather than a finding.',
    },
    {
      id: 'bphs.13.003.jupiter-in-second',
      source: src('3'),
      when: [{ k: 'placement', graha: 'jupiter', house: 2 }],
      effect: {
        id: 'wealth.accumulation',
        domain: 'wealth',
        valence: 0.5,
        summary: 'Provision arrives through generosity and good counsel.',
      },
      weight: 0.5,
      verification: 'unverified',
      note: 'BPHS 13.3 conditions this on Jupiter ALSO owning the 2nd, or being with Mars. '
        + 'Both refinements are chart-dependent; the plain placement is encoded and the '
        + 'refinement noted rather than silently dropped.',
    },
    {
      id: 'bphs.13.004.second-eleventh-exchange',
      source: src('4'),
      when: [
        { k: 'lordship', house: 2, occupies: 11 },
        { k: 'lordship', house: 11, occupies: 2 },
      ],
      effect: {
        id: 'wealth.accumulation',
        domain: 'wealth',
        valence: 0.8,
        summary: 'What is earned and what is kept reinforce each other.',
      },
      weight: 0.8,
      verification: 'unverified',
      note: 'A mutual exchange — the first two-condition house rule in the corpus. Its '
        + 'arity is what makes it outrank the single-condition wealth rules in `arbitrate`, '
        + 'which is the behaviour Part 1 built arity for.',
    },
    {
      id: 'bphs.13.006.both-lords-in-dusthana',
      source: src('6-7'),
      when: [lordInDusthana(2), lordInDusthana(11)],
      effect: {
        id: 'wealth.accumulation',
        domain: 'wealth',
        valence: -0.7,
        summary: 'Resources are harder to hold onto than to earn.',
      },
      weight: 0.7,
      verification: 'unverified',
      note: 'BPHS 13.6-7 states this as penury. Restated as difficulty retaining rather '
        + 'than destitution — the text’s outcome is a claim about a life, not a mechanism, '
        + 'and the standing policy is not to make it.',
    },
    {
      id: 'bphs.13.010.lord-dignified',
      source: src('10'),
      when: [{ k: 'dignity', graha: 'jupiter', is: ['own', 'exalted'] }],
      effect: {
        id: 'wealth.provider',
        domain: 'wealth',
        valence: 0.6,
        summary: 'Inclined to provide for others, and known for it.',
      },
      weight: 0.6,
      verification: 'unverified',
      note: 'Template for "the 2nd lord in own sign or exalted"; instantiated for Jupiter, '
        + 'since which planet owns the 2nd is chart-dependent.',
    },
  ];
}

// ── 12.11 — the rule that doubles the corpus ─────────────────────────────────

/**
 * **BPHS 12.11 is the most consequential sentence in either chapter.**
 *
 * "The learned in astrology should base the effects on the Moon also as are applicable to
 * the ascendant." It is not a remark about the first house — it is an instruction that the
 * whole house system be read a second time from the Moon's sign, and it therefore applies
 * to every rule Phase III will produce.
 *
 * That is why `LagnaReference` gained `'moon'` in this part rather than later. A rule
 * written without a frame is under-specified; a rule written only for the natal ascendant
 * is now *half* specified.
 */
export const READ_FROM_THE_MOON_TOO =
  'BPHS 12.11 directs that house effects be judged from the Moon as well as the ascendant. '
  + 'This is not local to ch 12 — it doubles the entire house corpus, and it is why '
  + '`LagnaReference` has `moon`. A Phase III rule should be evaluated in both frames and '
  + 'their agreement fed to the confidence calculus (Part 19), exactly as the Sudarshana '
  + 'frames are.';

/** Instantiate a rule set against a different reference frame — e.g. Chandra lagna. */
export function readFrom(rules: Rule[], frame: 'natal' | 'moon'): Rule[] {
  if (frame === 'natal') return rules;
  const retarget = (p: Predicate): Predicate => {
    if (p.k === 'compound') return { ...p, of: p.of.map(retarget) };
    if (p.k === 'placement' || p.k === 'lordship') return { ...p, from: frame };
    return p;
  };
  return rules.map((r) => ({
    ...r,
    id: `${r.id}.from-moon`,
    when: r.when.map(retarget),
    ...(r.unless ? { unless: r.unless.map(retarget) } : {}),
  }));
}

// ── Policy ───────────────────────────────────────────────────────────────────

/**
 * Excluded outright. Chapters 12 and 13 carry more of this than any chapter so far, which
 * is a warning about Phase III generally: the house chapters mix genuine astrological
 * mechanism with body-reading and character judgement, and the two have to be separated
 * rule by rule rather than chapter by chapter.
 */
export const CH12_13_EXCLUDED = [
  '12.8 — circumstances of the birth itself, read from the ascending sign. Obstetric '
  + 'detail, not a mechanism, and not something to tell anyone.',
  '12.12-15 — decanates mapped to bodily limbs, and the reading of ulcers, scars and moles '
  + 'from which planet occupies them. Physiognomy; the same exclusion as ch 81-82.',
  '13.13 — a character judgement (tale-bearing, untruthfulness) attached to malefics in '
  + 'the 2nd. Excluded as a judgement about a person rather than about a matter.',
] as const;

/** Computed where arbitration wants it, never shown. */
export const CH12_13_UNSURFACED = [
  '12.3 — bodily health denied when the lagna or Moon is afflicted without benefic relief. '
  + 'The mechanism is kept; the flat denial is not surfaced.',
  '13.12 — disease or deformity of the eyes from the 2nd lord in a dusthana. Medical.',
] as const;

/**
 * Stated but not encodable yet, with what each is waiting on. Named rather than
 * approximated — the standing discipline since Part 6.
 */
export const CH12_13_NOT_YET_EXPRESSIBLE = [
  '12.9 (twins) and 12.10 (nurture by three mothers) — both need whole-chart shape '
  + 'predicates: "all others in dual signs with strength", "Sun and Moon in one navamsa". '
  + 'The Nabhasa yogas of Part 30 need the same kind, so it is worth building once.',
  '13.5 and 13.11 — conditions on varga placement (Paravatamsa) combined with lordship. '
  + 'The varga machinery exists (Parts 3-5); binding it into a predicate does not.',
  '"A benefic" / "the 2nd lord" as conditions — both chart-dependent, so every such rule '
  + 'here is a template instantiated for one planet. The gap ch 11 and ch 30 also hit.',
] as const;

/**
 * Two of this part's rules are declared non-discriminative, and that is a design decision
 * rather than a defect.
 *
 * "The lord in an angle or a trine" covers six of twelve houses; the calibration measures
 * it at 50%. It is a true statement of BPHS and a true statement about half of everyone,
 * which makes it **context, not a finding**. Deleting it would lose real source material;
 * tightening it would invent a condition the text does not state. So it is kept, its
 * measured rate is written into the rule, and `arbitrate` withholds it automatically.
 *
 * This is what `BASE_RATE_SUPPRESS` was built for, and Phase III will produce many more —
 * the house chapters are full of broad claims. **Declare the rate; do not delete the rule.**
 */
export const BACKGROUND_RULES_ARE_KEPT =
  'Rules measuring above BASE_RATE_SUPPRESS are kept with their measured `baseRate` '
  + 'declared, not deleted and not tightened. They are true and they are background. '
  + 'Deleting loses source material; inventing a tighter condition misattributes it to '
  + 'BPHS. `arbitrate` withholds them and says why.';

export const PHASE_III_RHYTHM =
  'Rules as `Rule[]` factories per house; shared `effect.id` for claims about the same '
  + 'thing so dissent is visible; verse in `source`; `unverified` unless a worked example '
  + 'backs it; new sets added to `allEncodedRules()` in the calibration test; excluded and '
  + 'unsurfaced material listed, never dropped silently.';
