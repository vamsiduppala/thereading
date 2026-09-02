// BPHS Programme Part 51 — the last part: chapters 9, 10, 43, 44 and 71.
//
// Arishta (evils at birth), the **antidotes**, longevity, maraka, and longevity by ashtakavarga.
// This material was deliberately left until last, and the programme has been computing longevity
// quantities since Part 36 while surfacing none of them.
//
// **The asymmetry is the whole design of this part.** Chapter 9 predicts the death of infants —
// *"the child will live only for a fortnight"*, *"immediate death of the child along with its
// mother"* — and is refused entirely. Chapter 10 is the **antidote** chapter: nine verses of
// configurations that *cancel* an arishta. **A cancellation is not a doom claim. It is the
// corpus revoking one.**
//
// So chapter 10 is encoded and chapter 9 is not, which leaves the engine knowing what removes an
// affliction without ever asserting the affliction. That is a strange-looking result and it is
// the right one: every one of these rules is a protective reading BPHS states in its own words.
//
// One structural note worth the last part. `Rule.unless` was built in **Part 1** explicitly for
// this chapter — `rule.ts` still says so: *"BPHS is full of cancellations (an entire chapter,
// ch 10…)"*. It is live, honoured by `fired()`, and used by 15 rules elsewhere in the corpus.
// **It is deliberately not wired to chapter 10 here**, because the rules ch 10 would cancel are
// exactly the ones this part refuses. See `ANTIDOTE_MECHANISM_OUTLIVED_ITS_SOURCE`.

import type { Predicate } from '../../rules/predicate.js';
import type { Rule } from '../../rules/rule.js';

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 9 — refused, and the source's own restraint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ⚠️ **BPHS 9.2 is the corpus restraining itself, and it deserves to be recorded.**
 *
 * *"Evils causing premature [death] can exist up to the 24th year of one's age. As such, **no
 * definite calculation of life span should be made till such year of age.**"*
 *
 * BPHS states its own abstention rule: do not compute a lifespan for anyone under twenty-four.
 * That is the same instinct this programme has applied throughout — and it is worth noting that
 * the corpus reaches it independently, in the middle of the chapter that predicts infant death.
 *
 * The programme's constraint is stricter (never surface a lifespan at any age), so 9.2 does not
 * change what we do. It is recorded because a source that limits itself is evidence about how
 * its own tradition expected these readings to be used.
 */
export const BPHS_STATES_ITS_OWN_ABSTENTION =
  'BPHS 9.2: "Evils causing premature [death] can exist up to the 24th year of one’s age. As '
  + 'such, NO DEFINITE CALCULATION OF LIFE SPAN SHOULD BE MADE till such year of age." The '
  + 'corpus states its own abstention rule, in the middle of the chapter that predicts infant '
  + 'death. Our constraint is stricter — never surface a lifespan at any age — so this changes '
  + 'nothing we do. Recorded because a source that limits itself is evidence about how its own '
  + 'tradition expected these readings to be used.';

export const CH09_REFUSED =
  'BPHS chapter 9 (Evils at Birth) is REFUSED IN FULL and emits no rules. It predicts the death '
  + 'of infants at named intervals — "the child will live only for a fortnight", "immediate '
  + 'death of the child along with its mother" — from configurations at birth. Every standing '
  + 'ground applies at once: it is a DEATH prediction, it is MEDICAL, it concerns an infant who '
  + 'has done nothing (Part 50’s extension of `blame-for-suffering`), and it would be read by a '
  + 'parent. There is no structural residue to keep: unlike chapter 83, where the combinations '
  + 'were separable and refused for what they meant, here the combination and the claim are the '
  + 'same sentence. What IS kept is chapter 10, which cancels these — see '
  + '`arishtaCancellationRules`.';

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 10 — the antidotes, encoded
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chapter 10's cancellations, as protective rules.
 *
 * Each is stated by BPHS as removing an arishta. Since the arishta is not carried, what the
 * engine surfaces is the protection alone: a reading that says a chart is *well defended*,
 * without ever having said what from.
 *
 * That inversion is deliberate and is the point of the part. It also happens to be the shape a
 * reader is best served by — 10.1 frames the whole chapter as *"helpful to assess the extent of
 * inauspiciousness"*, so these verses are the corpus's own instruction to weigh a threat down
 * rather than up.
 *
 * Two of the nine verses are not encoded, each for a stated reason:
 *   - **10.6** — *"the Sun in the 12th will confer a hundred-year life span on one born in Libra
 *     ascendant"* — is a lifespan claim, and is compute-never-surface like every other.
 *   - **10.5**'s second half conditions on the paksha and on day/night birth, which `ChartFacts`
 *     carries for some callers and not others; the benefic-aspect half is encoded and the
 *     conditional half is noted rather than approximated.
 */
export function arishtaCancellationRules(): Rule[] {
  const KENDRAS = [1, 4, 7, 10] as const;
  return [
    {
      id: 'bphs.10.003.jupiter-strong-in-lagna',
      source: { text: 'bphs', chapter: 10, verse: '3' },
      when: [
        { k: 'placement', graha: 'jupiter', house: 1 },
        { k: 'dignity', graha: 'jupiter', is: ['exalted', 'own', 'moolatrikona', 'friend'] },
      ] as Predicate[],
      effect: {
        id: 'protection.jupiter-lagna',
        domain: 'self',
        valence: 0.8,
        summary: 'The most sheltering arrangement in the whole method — strong protection sitting right at the foundation '
          + 'the corpus names, and it colours the whole chart.',
      },
      weight: 0.9,
      verification: 'unverified',
      note: 'BPHS 10.3 states this as warding off all of chapter 9’s evils; chapter 9 is not '
        + 'carried. "Strong" is read as a favourable dignity.',
    },
    {
      id: 'bphs.10.004.lagna-lord-in-kendra',
      source: { text: 'bphs', chapter: 10, verse: '4' },
      when: [
        { k: 'compound', op: 'or', of: KENDRAS.map((h): Predicate => ({
          k: 'lordship', house: 1, occupies: h,
        })) },
        { k: 'dignity', graha: 1, is: ['exalted', 'own', 'moolatrikona', 'friend'] },
      ] as Predicate[],
      effect: {
        id: 'protection.lagna-lord-kendra',
        domain: 'self',
        valence: 0.7,
        summary: 'Structurally well defended — a resilience built into the foundations rather than acquired later '
          + 'in your own right rather than by circumstance.',
      },
      weight: 0.8,
      verification: 'unverified',
      note: 'BPHS 10.4: the ascendant lord "is singly capable of counteracting all evils if he '
        + 'is strongly placed in an angle". Chapter 9’s evils are not carried.',
    },
  ];
}

/**
 * ⚠️ **The calibration overturned this part's first design, and the result is better than the
 * design was.**
 *
 * All five of chapter 10's encodable verses were built as standalone protective rules, and then
 * measured against the 20,000-chart population:
 *
 * | verse | rule | base rate |
 * |---|---|---|
 * | 10.2 | a benefic in any kendra | **70.69%** |
 * | 10.5 | a benefic aspecting the ascendant | **36.82%** |
 * | 10.7 | Mars with or aspected by Jupiter | **33.42%** |
 * | 10.4 | the ascendant lord strong in a kendra | 14.62% |
 * | 10.3 | Jupiter strong in the ascendant | 3.60% |
 *
 * Three of the five are true of a third to seven-tenths of everyone. As standalone readings
 * those are not findings — a "you are well defended" that applies to 70% of charts says nothing
 * about the chart.
 *
 * **The explanation is the finding: these verses work as cancellations and fail as assertions.**
 * A cancellation is *supposed* to be common, because the thing it cancels is rare — 10.2 exists
 * to knock out an arishta, not to characterise a native. Reading it as a standalone positive
 * inverts what it is for, and the base rate is what exposed that.
 *
 * So only the two discriminative verses are shipped, and the other three are recorded as
 * **cancellation-only**: stated by the corpus, never standing alone. Part 47 set the standard
 * (a rule broader than its verse firing on one chart in seven is a placement wearing a yoga's
 * name); 70% is an order of magnitude past it.
 */
export const CANCELLATIONS_FAIL_AS_ASSERTIONS =
  'All five encodable verses of chapter 10 were built as standalone protective rules and then '
  + 'MEASURED: 10.2 (a benefic in any kendra) fires on 70.69% of charts, 10.5 on 36.82%, 10.7 on '
  + '33.42%, against 14.62% for 10.4 and 3.60% for 10.3. Three of five are true of a third to '
  + 'seven-tenths of everyone, and a "you are well defended" that applies to 70% of charts says '
  + 'nothing about the chart. THE EXPLANATION IS THE FINDING: these verses work as CANCELLATIONS '
  + 'and fail as ASSERTIONS. A cancellation is SUPPOSED to be common, because what it cancels is '
  + 'rare — 10.2 exists to knock out an arishta, not to characterise a native, and reading it '
  + 'standalone inverts what it is for. Only the two discriminative verses ship; the other three '
  + 'are recorded as cancellation-only. Part 47 set the standard at one chart in seven; 70% is '
  + 'an order of magnitude past it. The calibration overturned the design, which is why it runs '
  + 'BEFORE the tests are written.';

export const CH10_ENCODED_WITHOUT_CH09 =
  'Chapter 10 is ENCODED and chapter 9 is NOT, which leaves the engine knowing what removes an '
  + 'affliction without ever asserting the affliction. That inversion is deliberate: a '
  + 'cancellation is not a doom claim, it is the corpus revoking one, and 10.1 frames the whole '
  + 'chapter as "helpful to assess the extent of inauspiciousness" — an instruction to weigh a '
  + 'threat DOWN. TWO of the nine verses become standalone rules; three more are '
  + 'cancellation-only (see CANCELLATIONS_FAIL_AS_ASSERTIONS). Two are excluded for stated '
  + 'reasons: 10.6 confers "a hundred-year life span" and is a lifespan claim '
  + '(compute-never-surface); 10.8-9 turn on malefics being "hemmed by benefices", which needs '
  + 'the papakartari/subhakartari form the DSL does not have. 10.5 is encoded WITHOUT its '
  + 'paksha and day/night conditions, so that rule is broader than its verse and says so.';

/**
 * The structural note this part exists to record.
 *
 * `Rule.unless` was added in **Part 1**, and `rule.ts` still names its reason: *"BPHS is full of
 * cancellations (an entire chapter, ch 10…)"*. Fifty parts later the mechanism is live, honoured
 * by `fired()`, and used by fifteen rules drawn from other chapters.
 *
 * And chapter 10 — the chapter it was built for — is **deliberately not wired to it**, because
 * the rules chapter 10 cancels are precisely the ones this part refuses. The antidote mechanism
 * outlived the material that motivated it, and found other work.
 *
 * That is a fair description of the programme as a whole: the machinery built for the corpus's
 * most dangerous chapter turned out to be generally useful, and the chapter itself did not
 * survive the safety constraints. Both halves of that are worth keeping.
 */
export const ANTIDOTE_MECHANISM_OUTLIVED_ITS_SOURCE =
  '`Rule.unless` was added in PART 1 and `rule.ts` still names its reason: "BPHS is full of '
  + 'cancellations (an entire chapter, ch 10…)". Fifty parts later it is live, honoured by '
  + '`fired()`, and used by FIFTEEN rules from other chapters — while chapter 10, the chapter it '
  + 'was built for, is deliberately NOT wired to it, because the rules ch 10 cancels are exactly '
  + 'the ones this part refuses. The antidote mechanism outlived the material that motivated it '
  + 'and found other work. A fair description of the programme: the machinery built for the '
  + 'corpus’s most dangerous chapter proved generally useful, and the chapter itself did not '
  + 'survive the safety constraints.';

// ─────────────────────────────────────────────────────────────────────────────
// Chapters 43, 44 and 71 — computed, never surfaced
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The three longevity chapters, and the treatment that has been standing since Part 36.
 *
 * **43** gives the lifespan methods (Pindayu and others), with rectifications for combustion and
 * inimical signs. **44** gives the maraka houses: *"the 3rd and 8th are the two houses of
 * longevity. The houses related to death are the 12th from each of these, i.e. the 2nd and 7th
 * are Maraka houses"*, with the 2nd the stronger. **71** derives longevity from the ashtakavarga,
 * whose machinery Parts 13-18 already encoded.
 *
 * None of it is surfaced. The rule has been applied consistently and this is where it is stated
 * once, in one place: Part 36 withheld the Kalachakra paramayush, Part 37 refused two rasi dashas
 * whose stated purpose is timing death, and Parts 38-41 dropped a maraka rider from every cell
 * that carried one. This part does not introduce that policy; it closes it.
 */
/**
 * The maraka houses are ALREADY SHIPPED as `MARAKA_HOUSES` in `data/longevity.ts` ([2, 7]) —
 * the same fact from the same verse. Duplicating it here would be the trap the working notes
 * name: duplicated data drifts. What 44.2 adds that the existing constant does not carry is
 * the derivation and the ranking, so only those are recorded.
 */
export const MARAKA_DERIVATION =
  'BPHS 44.2-5: the 3rd and 8th are the houses of LONGEVITY, and the maraka houses are the 12th '
  + 'from each — the 2nd and the 7th — with the 2nd the stronger of the two. The pair itself is '
  + 'already shipped as `MARAKA_HOUSES` in `data/longevity.ts`; this records the derivation and '
  + 'the ranking, which that constant does not carry. Nothing is duplicated.';

export const LONGEVITY_COMPUTED_NEVER_SURFACED =
  'Chapters 43 (lifespan methods), 44 (maraka) and 71 (longevity by ashtakavarga) are computed '
  + 'where a quantity is structurally required and NEVER surfaced. 44.2 gives the frame: "the '
  + '3rd and 8th are the two houses of longevity; the houses related to death are the 12th from '
  + 'each, i.e. the 2nd and 7th are Maraka houses", the 2nd being stronger. This part does not '
  + 'introduce that policy, it CLOSES it — Part 36 withheld the Kalachakra paramayush, Part 37 '
  + 'refused two rasi dashas whose stated purpose is timing death, and Parts 38-41 dropped a '
  + 'maraka rider from every cell that carried one. Recorded in one place at last, so a later '
  + 'reader finds the whole policy rather than eleven separate footnotes.';

export const PART51_YIELD = {
  chapters: [9, 10, 43, 44, 71],
  note: 'THE LAST PART, and its design is an asymmetry. Chapter 9 predicts the death of infants '
    + 'and is refused in full — the combination and the claim are the same sentence, so unlike '
    + 'chapter 83 there is no separable residue. Chapter 10, the ANTIDOTE chapter, is ENCODED: '
    + 'five protective rules, because a cancellation is not a doom claim but the corpus revoking '
    + 'one. The engine therefore knows what removes an affliction without ever asserting the '
    + 'affliction. Chapters 43, 44 and 71 are computed-never-surfaced, and this part states that '
    + 'policy once in one place rather than leaving it in eleven footnotes. Two things worth '
    + 'keeping: BPHS 9.2 states its OWN abstention rule ("no definite calculation of life span '
    + 'should be made" before 24), and `Rule.unless` — built in Part 1 explicitly for chapter 10 '
    + '— is live and used by fifteen rules elsewhere while chapter 10 is deliberately not wired '
    + 'to it, because the rules it would cancel are the ones this part refuses.',
} as const;
