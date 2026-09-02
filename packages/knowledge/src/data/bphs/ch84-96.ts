// BPHS Programme Part 50 — Chapters 84 to 96: the remedial block.
//
// Thirteen chapters, 877 lines, **no rules and no catalogue of remedies.** What is kept is the
// taxonomy — which chapter addresses which circumstance — because that is the map rather than
// the recipe, and the map is genuine evidence about what the corpus is.
//
// The plan's row read *"catalogue only, never recommended"*, and that was a reasonable position
// to hold before reading the block. Two things decided against it.
//
// **First, the measurement.** Across 877 lines: 24 occurrences of mantra/Japa/Homa/recitation,
// 40 of Brahmin/donation/gift/cow/gold, 37 of deity/temple/idol/worship, 21 of bath/ghee/
// sesame — and **one** of behavioural vocabulary. The standing constraint ("behavioural
// remedies only, never gemstones, fasting or rituals") does not filter this block. It empties
// it. There is no surviving remedy to catalogue.
//
// **Second, BPHS 96.4-5.** See `CH96_INSTRUCTS_HARM`. One verse in this block is not an
// astrological reading at all but a direction to expel a woman from her home, and no label
// placed around a catalogue keeps that safely contained.

// ─────────────────────────────────────────────────────────────────────────────
// The measurement
// ─────────────────────────────────────────────────────────────────────────────

export const REMEDIAL_VOCABULARY_COUNTS = {
  mantraJapaHoma: 24,
  brahminDonationGift: 40,
  deityTempleIdolWorship: 37,
  bathGheeSesame: 21,
  behavioural: 1,
  lines: 877,
} as const;

export const STANDING_CONSTRAINT_EMPTIES_THIS_BLOCK =
  'Across chapters 84-96 (877 lines): 24 occurrences of mantra/Japa/Homa/recitation, 40 of '
  + 'Brahmin/donation/gift/cow/gold, 37 of deity/temple/idol/worship, 21 of bath/ghee/sesame — '
  + 'and ONE of behavioural vocabulary. The standing constraint ("behavioural remedies only, '
  + 'never gemstones, fasting or rituals") does not FILTER this block, it EMPTIES it. There is '
  + 'no surviving remedy to catalogue, which is a measurement rather than a judgement and is '
  + 'why the plan’s "catalogue only" position could not be carried out as written.';

// ─────────────────────────────────────────────────────────────────────────────
// The taxonomy — the map, kept; the recipes, not
// ─────────────────────────────────────────────────────────────────────────────

export interface RemedialChapter {
  chapter: number;
  /** What circumstance the chapter treats as requiring expiation. */
  circumstance: string;
  /** Whether the circumstance is a BIRTH the corpus calls inauspicious. */
  birthTreatedAsMisfortune: boolean;
}

/**
 * What each chapter of the remedial block is *about*.
 *
 * This is kept because it answers a real question — *what does BPHS think needs fixing?* — and
 * because the answer is itself the finding. **Twelve of the thirteen chapters treat a BIRTH as
 * the misfortune**: not a planetary configuration in a life, but the circumstances of arriving
 * in the world at all.
 *
 * None of the remedies is reproduced. The distinction held here is between the map and the
 * recipe: knowing that BPHS prescribes expiation for a birth during an eclipse is information
 * about the corpus; the expiation itself is an instruction, and this project does not issue
 * ritual instructions.
 */
export const REMEDIAL_CHAPTERS: RemedialChapter[] = [
  { chapter: 84, circumstance: 'malevolence of the planets generally', birthTreatedAsMisfortune: false },
  { chapter: 85, circumstance: 'births the corpus classes as inauspicious, as a category', birthTreatedAsMisfortune: true },
  { chapter: 86, circumstance: 'birth on Amavasya (the new moon)', birthTreatedAsMisfortune: true },
  { chapter: 87, circumstance: 'birth on Krishna Chaturdashi', birthTreatedAsMisfortune: true },
  { chapter: 88, circumstance: 'birth in Bhadra and certain yogas', birthTreatedAsMisfortune: true },
  { chapter: 89, circumstance: 'birth under particular nakshatras', birthTreatedAsMisfortune: true },
  { chapter: 90, circumstance: 'birth on a Sankranti (a solar ingress)', birthTreatedAsMisfortune: true },
  { chapter: 91, circumstance: 'birth during an eclipse', birthTreatedAsMisfortune: true },
  { chapter: 92, circumstance: 'birth in Gandanta (a sign or nakshatra junction)', birthTreatedAsMisfortune: true },
  { chapter: 93, circumstance: 'birth in Abhukta Moola', birthTreatedAsMisfortune: true },
  { chapter: 94, circumstance: 'birth in Jyeshtha Gandanta', birthTreatedAsMisfortune: true },
  { chapter: 95, circumstance: 'the birth of a daughter after three sons, or a son after three daughters', birthTreatedAsMisfortune: true },
  { chapter: 96, circumstance: 'an unusual delivery', birthTreatedAsMisfortune: true },
];

export const MAP_KEPT_RECIPE_REFUSED =
  'The taxonomy of chapters 84-96 is kept and none of their remedies is reproduced. The '
  + 'distinction is between the MAP and the RECIPE: knowing that BPHS prescribes expiation for '
  + 'a birth during an eclipse is information about the corpus, and answers a real question — '
  + 'what does this text think needs fixing? The expiation itself is an INSTRUCTION, and this '
  + 'project does not issue ritual instructions. The map is also where the finding lives: '
  + 'TWELVE OF THE THIRTEEN chapters treat a BIRTH as the misfortune — not a configuration in a '
  + 'life, but the circumstances of arriving in the world at all.';

// ─────────────────────────────────────────────────────────────────────────────
// Why the catalogue was refused outright
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 🚫 **BPHS 96.4-5, and why no label around a catalogue would have been enough.**
 *
 * Chapter 96 treats "unusual deliveries" as ominous *"for the village, town and the country"*,
 * and then says:
 *
 *   *"Deliveries of these kinds by women or cows in a house are ominous for all the members of
 *    the family living there. Therefore, remedial measures are essential... **The best remedial
 *    measure will be to abandon (or turn out from the house) such women and animals.**"*
 *
 * That is not an astrological reading. It is a direction to expel a woman from her home
 * immediately after childbirth, and it is given as the *preferred* measure — the chapter's own
 * first recommendation, not a marginal variant.
 *
 * A catalogue is a list a reader can lift. Whatever wrapper it carries — "never recommended",
 * "recorded for completeness" — the entry survives the copy and the wrapper does not. That is
 * an ordinary property of lists, not a hypothetical: this project's own Artifact and API
 * surfaces would serve the entry as data.
 *
 * So the decision is not "catalogue with a warning" but **do not catalogue**. The refusal is
 * structural — there is no field anywhere in this module that holds a remedy — rather than a
 * disclaimer attached to one.
 */
export const CH96_INSTRUCTS_HARM =
  'BPHS 96.4-5 is why the remedies are not catalogued at all. Chapter 96 calls unusual '
  + 'deliveries ominous "for the village, town and the country" and then states: "The best '
  + 'remedial measure will be to abandon (or turn out from the house) such women and animals." '
  + 'That is not an astrological reading but a DIRECTION TO EXPEL A WOMAN FROM HER HOME after '
  + 'childbirth, given as the PREFERRED measure. A catalogue is a list a reader can lift, and '
  + 'the entry survives the copy while the wrapper does not — an ordinary property of lists, '
  + 'not a hypothetical, since this project’s own API would serve it as data. So the decision '
  + 'is not "catalogue with a warning" but DO NOT CATALOGUE, and the refusal is STRUCTURAL: no '
  + 'field in this module holds a remedy, so there is nothing to lift.';

/**
 * The framing beneath chapters 85-96, refused independently of the remedies.
 *
 * Twelve chapters treat a **birth** as the misfortune to be expiated. Two are worth naming
 * because they show what the framing costs:
 *
 *   - **95** — *"the birth of a daughter after the birth of three sons… is ominous for both the
 *     maternal and paternal families."* A newborn is the misfortune, and which newborn depends
 *     on her sex.
 *   - **96** — an unusual delivery is *"ominous for the village, town and the country"*, and the
 *     mother is to be turned out.
 *
 * Part 49 named `blame-for-suffering` for material that tells a person their misfortune is
 * deserved. This is the same ground reaching further back: it tells a person their **existence**
 * is the misfortune, before they have done anything at all. Part 48's gendered ground applies to
 * 95 on top of that.
 *
 * The framing is refused whether or not any remedy is attached, so a later part cannot rescue
 * these chapters by finding a behavioural remedy among them.
 */
export const BIRTH_TREATED_AS_MISFORTUNE =
  'All twelve of chapters 85-96 treat a BIRTH as the misfortune requiring expiation — Amavasya, '
  + 'Krishna Chaturdashi, Bhadra, certain nakshatras, a Sankranti, an eclipse, Gandanta, '
  + 'Abhukta Moola, Jyeshtha Gandanta, a daughter after three sons, an unusual delivery. Two '
  + 'show what the framing costs: 95 calls the birth of a daughter after three sons "ominous '
  + 'for both the maternal and paternal families" — a newborn is the misfortune, and which '
  + 'newborn depends on her sex; 96 calls an unusual delivery ominous "for the village, town '
  + 'and the country". Part 49’s BLAME-FOR-SUFFERING ground reaches further back here: it tells '
  + 'a person their EXISTENCE is the misfortune, before they have done anything. Part 48’s '
  + 'gendered ground applies to 95 on top. REFUSED WHETHER OR NOT a remedy is attached, so a '
  + 'later part cannot rescue these chapters by finding a behavioural remedy among them.';

export const CH84_96_YIELD = {
  chapters: [84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96],
  note: 'Thirteen chapters, 877 lines, NO rules and NO catalogue of remedies. The plan said '
    + '"catalogue only, never recommended", which was reasonable before reading; two things '
    + 'decided against it. **The measurement**: 24 mantra/Homa, 40 Brahmin/donation, 37 '
    + 'deity/temple, 21 bath/ghee against ONE behavioural mention — the standing constraint does '
    + 'not filter this block, it EMPTIES it, so there is no surviving remedy to catalogue. '
    + '**And BPHS 96.4-5**, which is not a reading but a direction to expel a woman from her '
    + 'home after childbirth, given as the preferred measure; a catalogue is a list a reader can '
    + 'lift, and the entry survives the copy while the wrapper does not. The refusal is '
    + 'STRUCTURAL — no field here holds a remedy. KEPT: the taxonomy, because the map is not the '
    + 'recipe and is itself the finding — ELEVEN OF THIRTEEN chapters treat a BIRTH as the '
    + 'misfortune, which extends Part 49’s blame-for-suffering ground back before the person has '
    + 'done anything at all.',
} as const;
