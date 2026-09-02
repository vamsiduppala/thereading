// BPHS Programme Part 48 — Chapters 80, 81 and 82: female horoscopy.
//
// **The programme's own plan was wrong about this part, and that is the finding.**
//
// §9's row reads: *"Female horoscopy — filtered. Encode astrological logic, discard gendered
// judgement, exclude ch 81."* That presumes the two are separable — a neutral skeleton of
// placements underneath, with the judgement bolted on and removable.
//
// **In chapter 80 they are not separable, because the judgements ARE the outputs.** The chapter
// does not compute a placement and then editorialise; the placement's entire stated consequence
// is a verdict about a woman's sexual conduct, her fertility, her widowhood, or the hour of her
// own death. Strip the verdict and nothing remains to encode — not a weakened rule, not a
// domain tag, nothing.
//
// So chapter 80 is refused in full but for one verse, chapters 81 and 82 are excluded as the
// standing constraint already required, and this part ships **no rules at all**. That is the
// correct output, and the reasoning is recorded verse by verse so it cannot be mistaken for an
// oversight or quietly reversed.
//
// One thing worth stating precisely, because it bears on how much authority any single BPHS
// reading deserves: **the instruments here are the same ones the corpus uses everywhere else.**
// Trimsamsa, navamsa, papakartari yoga, house lords, benefic aspect. The method is continuous
// with the rest of the book. Only the subject of the prediction changes.

// ─────────────────────────────────────────────────────────────────────────────
// The one verse that survives
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 80.8 — *"The effects in respect of women would particularly depend on the rashi and
 * Trimsamsa of the Ascendant or the Moon, **whichever is stronger**."*
 *
 * This is the chapter's one neutral sentence: an **arbitration instruction** naming which of
 * two reference points governs when they disagree. It says nothing about a woman and would
 * read identically if the chapter's subject were anyone.
 *
 * It is also the same shape as two rules the programme already holds — BPHS 51.6's rasi
 * antardasa seed (*"from the dasha rasi or the 7th from it, whichever is stronger"*) and 79.6's
 * ascetic order (*"the holy order of the planet who is stronger amongst the two"*). Three
 * chapters, one device: **where the corpus offers two reference points it resolves them by
 * strength, not by precedence.** That is worth having as a general observation about how BPHS
 * arbitrates, and it is all this chapter contributes.
 *
 * ⚠️ As with 51.6, the verse names **no strength measure**, so a caller still has to choose one.
 */
export const STRONGER_OF_LAGNA_OR_MOON =
  'BPHS 80.8 — "the effects would particularly depend on the rashi and Trimsamsa of the '
  + 'Ascendant or the Moon, WHICHEVER IS STRONGER." The one neutral sentence in chapter 80: an '
  + 'arbitration instruction naming which of two reference points governs, which would read '
  + 'identically whoever the chapter were about. Same device as 51.6’s rasi antardasa seed and '
  + '79.6’s ascetic order — three chapters resolving a two-way choice BY STRENGTH rather than '
  + 'by precedence. ⚠️ Like 51.6 it names no strength MEASURE, so the caller still chooses one.';

export const STRENGTH_RESOLVES_TWO_REFERENCE_POINTS = [
  '51.6 — the rasi antardasa starts from the dasha rasi or the 7th from it, whichever is stronger',
  '79.6 — the order entered is that of the stronger of the Moon-sign lord and Saturn',
  '80.8 — the reading follows the ascendant or the Moon, whichever is stronger',
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 80 — refused, verse by verse
// ─────────────────────────────────────────────────────────────────────────────

export interface RefusedVerse {
  verse: string;
  /** What the verse predicts. Stated plainly, because a vague refusal is not auditable. */
  claims: string;
  ground: 'sexual-conduct' | 'fertility' | 'stillbirth' | 'death' | 'gendered-worth'
    | 'third-party' | 'stigma-label';
}

/**
 * Every clause of chapter 80 that is refused, and on what ground.
 *
 * Enumerated rather than summarised so that the refusal is **auditable**: a reader comparing
 * our output against the chapter can see precisely which verses were dropped and why, and a
 * later part cannot rescue one by claiming it was merely overlooked.
 */
export const CH80_REFUSED_VERSES: RefusedVerse[] = [
  {
    verse: '5-7',
    claims: 'that a woman with the ascendant and Moon in even signs is "truly feminine" with '
      + '"excellent qualities", and one with them in odd signs is "masculine in form and '
      + 'bearing" and, with malefics, "devoid of good qualities"',
    ground: 'gendered-worth',
  },
  {
    verse: '9-16',
    claims: 'a woman’s sexual conduct before and within marriage, keyed to the trimsamsa of '
      + 'the stronger of the ascendant and the Moon',
    ground: 'sexual-conduct',
  },
  {
    verse: '17-21',
    claims: 'the character of the husband she will have — "a coward and contemptible wretch"',
    ground: 'third-party',
  },
  {
    verse: '34',
    claims: 'that the woman will be barren',
    ground: 'fertility',
  },
  {
    verse: '35',
    claims: 'the condition of the woman’s genitals',
    ground: 'fertility',
  },
  {
    verse: '38-39',
    claims: 'that the woman will be barren, on two further configurations',
    ground: 'fertility',
  },
  {
    verse: '40',
    claims: 'that the woman will give birth to a child already dead',
    ground: 'stillbirth',
  },
  {
    verse: '41',
    claims: 'that the woman will be unable to conceive',
    ground: 'fertility',
  },
  {
    verse: '42',
    claims: 'that the woman "becomes a destructor of her husband’s family and her father’s family"',
    ground: 'gendered-worth',
  },
  {
    verse: '43-46',
    claims: 'that the woman is a Visha Kanya ("poison girl"), who "gives birth to a child '
      + 'already dead", "has a defective generative organ" and is "bereft of robes, ornaments"',
    ground: 'stigma-label',
  },
  {
    verse: '47',
    claims: 'that the woman becomes a widow — a prediction of her husband’s death',
    ground: 'death',
  },
  {
    verse: '54-55',
    claims: 'whether the woman dies before her husband, or with him',
    ground: 'death',
  },
];

/**
 * Why the plan's "encode the logic, discard the judgement" instruction could not be followed.
 *
 * The instruction assumes a separable structure: placements underneath, verdicts on top. Test
 * it on any verse in `CH80_REFUSED_VERSES` and it fails, because the verdict is not a gloss on
 * the placement — it is the placement's **entire stated consequence**. BPHS 80.34 does not say
 * "the Moon and Venus with Saturn or Mars affects the 5th house, and by the way this means
 * barrenness"; it says the configuration means barrenness, and nothing else.
 *
 * So there is no weakened form to ship. A "domain tag" of *children* or *partnership* would be
 * an invention of ours, not a reduction of the verse — the chapter never states a domain, only
 * an outcome. Inventing one and calling it the surviving logic would be the worst available
 * outcome: it would look like faithful extraction while carrying none of the source's actual
 * content and all of the implication that the source supports it.
 *
 * **Recorded as a correction to §9's own row**, in the same way Retrofit R34 corrected the
 * plan when it mislocated the crown jewel. The plan was written before the chapter was read.
 */
export const LOGIC_AND_JUDGEMENT_ARE_NOT_SEPARABLE_HERE =
  'The programme plan’s row for this part reads "encode astrological logic, discard gendered '
  + 'judgement" — which assumes the two are separable, with placements underneath and verdicts '
  + 'on top. In chapter 80 THEY ARE NOT: the verdict is not a gloss on the placement, it is the '
  + 'placement’s ENTIRE stated consequence. 80.34 does not say a configuration affects the 5th '
  + 'house and incidentally means barrenness; it says it means barrenness and nothing else. So '
  + 'there is no weakened form to ship, and a "domain tag" would be OUR invention rather than a '
  + 'reduction of the verse — which would be the worst outcome available, looking like faithful '
  + 'extraction while carrying none of the source’s content and all of the implication that the '
  + 'source backs it. Recorded as a CORRECTION to §9’s row, as R34 corrected the plan before.';

export const CH80_REFUSED =
  'BPHS chapter 80 (female horoscopy) is refused in full except 80.8. Twelve clause-groups are '
  + 'enumerated in `CH80_REFUSED_VERSES` with their grounds: predictions of a woman’s SEXUAL '
  + 'CONDUCT from a trimsamsa (9-16); BARRENNESS and the condition of her genitals (34, 35, '
  + '38-39, 41); STILLBIRTH (40); the VISHA KANYA stigma-label with its "defective generative '
  + 'organ" (43-46); WIDOWHOOD, i.e. her husband’s death (47); the hour of her own death '
  + 'relative to his (54-55); the character of the husband she will get (17-21); and the '
  + 'gendered-worth frame itself, in which a woman "masculine in form and bearing" is thereby '
  + 'defective (5-7). Enumerated rather than summarised so the refusal is AUDITABLE and cannot '
  + 'be mistaken for an oversight.';

/**
 * An observation about the corpus, not about this chapter.
 *
 * Chapter 80 uses **the same instruments as everywhere else** — trimsamsa, navamsa,
 * papakartari yoga, house lordship, benefic aspect, the stronger of two reference points. There
 * is no methodological seam between it and the chapters the programme has encoded. What changes
 * is only what the method is pointed at.
 *
 * That matters for how much authority any single BPHS reading should carry: the technique
 * producing a wealth yoga in chapter 41 is the technique producing a Visha Kanya verdict here.
 * A reader who treats the first as authoritative because it is "classical" owes the second the
 * same deference, which is a reason to treat all of it as a structured tradition to be weighed
 * rather than a source of facts.
 */
export const SAME_INSTRUMENTS_DIFFERENT_SUBJECT =
  'Chapter 80 uses the SAME instruments as the chapters the programme has encoded — trimsamsa, '
  + 'navamsa, papakartari yoga, house lordship, benefic aspect, "whichever is stronger". There '
  + 'is no methodological seam; only the subject of the prediction changes. Worth stating '
  + 'because it bears on how much authority any single reading deserves: the technique that '
  + 'produces a wealth yoga in ch 41 is the technique that produces a Visha Kanya verdict here. '
  + 'A reader treating the first as authoritative because it is classical owes the second the '
  + 'same deference — which is a reason to weigh the whole corpus as a structured tradition '
  + 'rather than to read any part of it as fact.';

// ─────────────────────────────────────────────────────────────────────────────
// Chapters 81 and 82 — excluded, and confirmed by reading
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chapters 81 and 82 were already excluded by standing constraint before this part began.
 * They were nonetheless **read**, because an exclusion asserted from a title is an assumption
 * and the programme's discipline is to check.
 *
 * Chapter 81 reads a woman's body part by part — the soles of her feet, her toenails, her great
 * toe, the thickness of her toes — and returns verdicts of happiness, misery, poverty and, from
 * the length of her toes, that *"she will be of loose morals"*. Chapter 82 reads moles: *"the
 * woman who has a red mark on her left breast begets only one son."*
 *
 * Both are physiognomy, which the programme excludes wherever it appears — it refused the same
 * material in chapters 75 and 76 two parts ago. Chapter 82 covers both sexes and is excluded on
 * the same ground rather than on a gendered one.
 */
export const CH81_82_EXCLUDED =
  'Chapters 81 and 82 are excluded, and were READ before being excluded rather than dismissed '
  + 'from their titles. Ch 81 reads a woman’s body part by part — soles, toenails, great toe, '
  + 'the thickness of her toes — returning happiness, misery, poverty, and from toe length that '
  + '"she will be of loose morals". Ch 82 reads moles: "the woman who has a red mark on her '
  + 'left breast begets only one son." Both are PHYSIOGNOMY, excluded wherever it appears — the '
  + 'same ground that refused chapters 75.3-22 and 76.6-14 in Part 46. Ch 82 covers both sexes '
  + 'and is excluded on that ground, not a gendered one.';

export const CH80_82_YIELD = {
  chapters: [80, 81, 82],
  note: 'A part that ships NO RULES, and that is the correct output. The programme plan said '
    + '"encode astrological logic, discard gendered judgement" — which assumes the two separate. '
    + 'They do not: in chapter 80 the judgement IS the placement’s entire stated consequence, so '
    + 'stripping it leaves nothing, and inventing a domain tag to fill the gap would look like '
    + 'faithful extraction while carrying none of the source’s content. Recorded as a correction '
    + 'to §9’s row, as R34 corrected the plan before. Twelve clause-groups are enumerated with '
    + 'their grounds — sexual conduct from a trimsamsa, barrenness, stillbirth, the Visha Kanya '
    + 'stigma-label, widowhood, the hour of her own death — so the refusal is auditable rather '
    + 'than summary. KEPT: 80.8 alone, an arbitration instruction ("whichever is stronger") that '
    + 'would read identically whoever the chapter were about, and which turns out to be the same '
    + 'device as 51.6 and 79.6 — three chapters resolving a two-way choice by STRENGTH. '
    + 'Chapters 81-82 were read, then excluded as physiognomy.',
} as const;
