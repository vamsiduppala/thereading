// BPHS Programme Part 49 — Chapter 83: effects of curses in the previous birth.
//
// **Refused in full. No rules.** And it introduces a refusal ground the programme did not
// previously have a name for.
//
// Every earlier refusal was about a **prediction**: you will die at 70, you will be barren, you
// belong to the despicable class. Chapter 83 is about **desert**. Its whole architecture is:
//
//     [planetary combination] → you have no son
//                             → because you sinned in a previous life
//                             → specifically, you wronged your father / mother / brother /
//                               wife / maternal uncle / a Brahmin / a serpent
//                             → and here is the ritual that lifts it
//
// Telling someone their suffering is *deserved punishment for a fault they cannot remember or
// verify* is a distinct harm from telling them it is coming. It is unfalsifiable by
// construction, it names a family member as the wronged party, and it arrives attached to a
// remedy — so the person is invited to buy relief from a guilt the reading manufactured.
//
// The programme's existing grounds — doom, medical, contempt — each catch part of this and none
// catches the whole. Part 49 therefore adds **blame-for-suffering** as a named ground, which
// will matter again in Part 51.

// ─────────────────────────────────────────────────────────────────────────────
// The new ground
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The refusal ground chapter 83 required, stated so Part 51 can reuse it.
 *
 * A **doom** claim says a bad thing will happen. A **blame-for-suffering** claim says a bad
 * thing has happened *because you deserved it*. The second is worse in three specific ways,
 * and the distinction is not academic — it changes what a reader does with the reading:
 *
 *   1. **It is unfalsifiable by construction.** The fault is placed in a previous life, so no
 *      evidence can bear on it. A prediction can at least fail.
 *   2. **It assigns a wronged party.** Chapter 83's curses come from the native's father,
 *      mother, brother, wife or maternal uncle — so the reading does not merely accuse the
 *      person, it recruits their family into the accusation.
 *   3. **It arrives with a price.** Every combination is paired with a ritual remedy, so the
 *      guilt the reading manufactures is immediately monetisable.
 *
 * Nothing in this category is encoded, softened, or given a neutral paraphrase.
 */
export const BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND =
  'A DOOM claim says a bad thing will happen; a BLAME-FOR-SUFFERING claim says a bad thing has '
  + 'happened BECAUSE YOU DESERVED IT. The programme’s existing grounds (doom, medical, '
  + 'contempt) each catch part of chapter 83 and none catches the whole, so Part 49 names this '
  + 'one. It is worse than a prediction in three specific ways: (1) UNFALSIFIABLE BY '
  + 'CONSTRUCTION — the fault is placed in a previous life, so no evidence can bear on it, '
  + 'where a prediction can at least fail; (2) IT ASSIGNS A WRONGED PARTY — the curses come '
  + 'from the native’s own father, mother, brother, wife or maternal uncle, recruiting the '
  + 'family into the accusation; (3) IT ARRIVES WITH A PRICE — every combination is paired with '
  + 'a ritual remedy, so the guilt the reading manufactures is immediately monetisable. Nothing '
  + 'in this category is encoded, softened, or given a neutral paraphrase. Reusable in Part 51.';

// ─────────────────────────────────────────────────────────────────────────────
// What chapter 83 contains
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The chapter's architecture, recorded because the refusal only makes sense against it.
 *
 * Chapter 83 has **one subject**: the absence of a son. Its own heading is *"Yogas for
 * childlessness (Sonless-ness)"*, and Parvati's framing question is *"What is the **sin** which
 * causes destruction of children amongst men?"* Every subsequent block names a curse-source,
 * gives its planetary combination, and prescribes its remedy.
 */
export const CURSE_SOURCES: string[] = [
  'the father', 'the mother', 'the brother', 'the wife', 'the maternal uncle',
  'a Brahmin', 'a serpent', 'a preta (departed spirit)',
];

export const CH83_ARCHITECTURE =
  'Chapter 83 has ONE subject: the absence of a son. Its own heading is "Yogas for '
  + 'childlessness (Sonless-ness)" and Parvati’s framing question is "what is the SIN which '
  + 'causes destruction of children amongst men?". Each subsequent block names a curse-source — '
  + 'the father, mother, brother, wife, maternal uncle, a Brahmin, a serpent, a preta — gives '
  + 'its planetary combination, and prescribes its ritual remedy. 26 occurrences of "curse", 19 '
  + 'of ritual-remedy vocabulary, across 574 lines.';

/**
 * Why the plan's *"combinations only, no fault"* instruction could not be followed either —
 * for a **different reason** than chapter 80's.
 *
 * In chapter 80 there was nothing under the verdict: strip it and no rule remained. Here a
 * combination genuinely does exist and is separable in form — *"a person will be without a son
 * if Jupiter, the lord of the Ascendant and the lord of the 5th are all devoid of strength"*
 * (83.7) is a perfectly ordinary three-condition rule.
 *
 * **It is still refused, and the reason is what the combination MEANS.** Its only sourced
 * consequence is childlessness — a reproductive claim the standing constraint already excludes,
 * and one of the most harmful available. Encoding the combination with a neutral summary would
 * require inventing a meaning ("the fifth house is under-supported") that the chapter never
 * states, which is precisely the failure Part 48 identified: it looks like faithful extraction
 * while carrying none of the source's content and all of the implication that the source backs
 * it.
 *
 * And here the invention would be **worse than in chapter 80**, because a user could reverse it.
 * A children-domain flag on a chart, traced to its cited verse, resolves to "you will have no
 * son, because you sinned". Shipping the combination under a neutral label does not remove that
 * meaning; it only removes our acknowledgement of it.
 */
export const COMBINATION_IS_SEPARABLE_BUT_STILL_REFUSED =
  'Unlike chapter 80, chapter 83 DOES contain separable combinations — 83.7 ("without a son if '
  + 'Jupiter, the lord of the Ascendant and the lord of the 5th are all devoid of strength") is '
  + 'an ordinary three-condition rule. It is still refused, because of what the combination '
  + 'MEANS: its only sourced consequence is CHILDLESSNESS, a reproductive claim the standing '
  + 'constraint already excludes and among the most harmful available. Encoding it with a '
  + 'neutral summary would require inventing a meaning the chapter never states — Part 48’s '
  + 'exact failure mode. And the invention would be WORSE here, because it is reversible: a '
  + 'children-domain flag traced to its cited verse resolves to "you will have no son, because '
  + 'you sinned". Shipping it under a neutral label does not remove that meaning, only our '
  + 'acknowledgement of it.';

export const CH83_RITUAL_REMEDIES_REFUSED =
  'Chapter 83 pairs every curse with a ritual remedy — recitations, Homa, propitiation of a '
  + 'deity, gifts to Brahmins, temple observances (19 occurrences across the chapter). Refused '
  + 'under the standing constraint: behavioural remedies only, never gemstones, fasting or '
  + 'rituals. Recorded because the pairing is structural rather than incidental — the remedy is '
  + 'what the diagnosis is FOR, which is part of why the diagnosis is refused.';

export const CH83_REFUSED =
  'BPHS chapter 83 is REFUSED IN FULL and emits no rules. Its architecture is: a planetary '
  + 'combination → you have no son → because you sinned in a previous life → specifically you '
  + 'wronged your father, mother, brother, wife, maternal uncle, a Brahmin or a serpent → and '
  + 'here is the ritual that lifts it. Four grounds apply at once, each independently '
  + 'sufficient: BLAME-FOR-SUFFERING (the new one, see '
  + '`BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND`); a REPRODUCTIVE/medical prediction, as chapter '
  + '80’s barrenness verses were; GENDERED, since the chapter counts only a male issue '
  + '("sonless-ness"), so a daughter does not discharge it; and RITUAL REMEDIES. Unlike chapter '
  + '80 the combinations here are separable in form — and are refused anyway, for what they '
  + 'mean rather than for being inseparable.';

export const CH83_YIELD = {
  chapters: [83],
  note: 'Refused in full; no rules; and the part’s contribution is a REFUSAL GROUND the '
    + 'programme did not previously have a name for. Every earlier refusal concerned a '
    + 'PREDICTION — you will die at 70, you will be barren, you belong to the despicable class. '
    + 'Chapter 83 concerns DESERT: your suffering is punishment for a fault you cannot remember '
    + 'or verify, wronging a named member of your own family, liftable by a ritual. That is '
    + 'unfalsifiable by construction, it recruits the family into the accusation, and it '
    + 'arrives with a price — so BLAME-FOR-SUFFERING is named as its own ground, reusable in '
    + 'Part 51. Distinct from Part 48 in one way worth keeping: chapter 80 had nothing under '
    + 'its verdicts, while chapter 83 has perfectly ordinary combinations underneath and is '
    + 'refused for what they MEAN — a children-domain flag traced to its verse still resolves '
    + 'to "you have no son because you sinned".',
} as const;
