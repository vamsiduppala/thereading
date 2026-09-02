// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 24b — Effects of the Bhava Lords, lords 7 to 12. Programme Part 26.
//   Lines 8000-8723, verses 73-148.
//
// The second half of the 144-cell block. Same table shape as Part 25, same rules about
// how it is encoded — see `CH24A_TABLE_RATIONALE`.
//
// **These six lords are harder than the first six.** Lords 1-6 govern the native's own
// faculties; lords 7-12 govern the spouse, death, the father, standing, gains and loss —
// so their verses reach for other people and for outcomes far more often. The seventh
// lord's twelve verses in particular are almost entirely about the wife: her health, her
// obedience, her character, how many there are. Of the five exclusion themes Part 25
// identified, this half triggers all five roughly twice as often.
//
// Verse 145 closes the chapter with the sixth source-stated instruction to arbitrate
// before asserting — see `DEDUCE_CONSIDERING_STRENGTH`.
// ─────────────────────────────────────────────────────────────────────────────

import type { House } from '../../types.js';
import type { Rule, EffectDomain } from '../../rules/rule.js';
import { LORD_PLACEMENTS, LORD_MATTER, type LordPlacement } from './ch24a.js';

/** Matters for the second six lords, continuing `LORD_MATTER`. */
export const LORD_MATTER_7_12: Record<number, { matter: string; domain: EffectDomain }> = {
  7: { matter: 'partnership and dealings with others', domain: 'partnership' },
  8: { matter: 'what is hidden, inherited or endured', domain: 'transformation' },
  9: { matter: 'fortune, conviction and the paternal line', domain: 'fortune' },
  10: { matter: 'work, action and standing', domain: 'career' },
  11: { matter: 'gains and what arrives', domain: 'gains' },
  12: { matter: 'loss, expenditure and release', domain: 'release' },
};

/** The 72 cells of chapter 24b, verses 73-144. */
export const LORD_PLACEMENTS_7_12: LordPlacement[] = [
  // ── Lord of the 7th (verses 73-84) ─────────────────────────────────────────
  { lord: 7, house: 1, verse: '73', valence: -0.3, summary: 'Partnership is entangled with identity; hard to see clearly from inside.', excluded: 'a claim about the native visiting other women' },
  { lord: 7, house: 2, verse: '74', valence: 0.3, summary: 'Partnership brings material benefit; decisions are slow to be made.', excluded: '"many wives" — a count of relationships' },
  { lord: 7, house: 3, verse: '75', valence: -0.3, summary: 'Partnership demands effort and is built rather than found.', excluded: 'loss of children' },
  { lord: 7, house: 4, verse: '76', valence: 0.2, summary: 'Truthful and comfortable; partnership is an equal footing, not a hierarchy.', excluded: 'the wife being "not under his control" — a claim about controlling a spouse' },
  { lord: 7, house: 5, verse: '77', valence: 0.7, summary: 'Well regarded and principled; partnership is a settled source of contentment.' },
  { lord: 7, house: 6, verse: '78', valence: -0.6, summary: 'Partnership is contested ground and takes sustained patience.', excluded: 'a sickly wife, enmity toward her, and anger' },
  { lord: 7, house: 7, verse: '79', valence: 0.8, summary: 'Partnership is a genuine strength — courageous and capable through it.' },
  { lord: 7, house: 8, verse: '80', valence: -0.6, summary: 'Closeness is interrupted; the relationship is repeatedly rebuilt.', excluded: 'the spouse being troubled by disease' },
  { lord: 7, house: 9, verse: '81', valence: 0.5, summary: 'Well disposed toward one’s partner; fortune and partnership rise together.', excluded: '"union with many women"' },
  { lord: 7, house: 10, verse: '82', valence: 0.4, summary: 'Principled and well provided for; partnership and work pull against each other.', excluded: 'a "disobedient wife"' },
  { lord: 7, house: 11, verse: '83', valence: 0.4, summary: 'Partnership is materially rewarding without being emotionally easy.' },
  { lord: 7, house: 12, verse: '84', valence: -0.6, summary: 'Partnership costs more than it returns; livelihood is bound up with it.', excluded: 'penury and miserliness' },

  // ── Lord of the 8th (verses 85-96) ─────────────────────────────────────────
  { lord: 8, house: 1, verse: '85', valence: -0.4, summary: 'Carries something unresolved; vitality is uneven rather than absent.', excluded: 'the verse’s bodily claims' },
  { lord: 8, house: 2, verse: '86', valence: -0.4, summary: 'Resources arrive but do not settle; vigour needs deliberate upkeep.' },
  { lord: 8, house: 3, verse: '87', valence: -0.4, summary: 'Initiative flags and sibling support is thin.', excluded: 'indolence as a character verdict' },
  { lord: 8, house: 4, verse: '88', valence: -0.6, summary: 'Domestic ground is unsteady; property is held with difficulty.', excluded: 'deprivation of the mother — a death claim about a parent' },
  { lord: 8, house: 5, verse: '89', valence: -0.3, summary: 'Learning comes slowly and creative work is repeatedly interrupted.', excluded: 'dullness, a count of children, and longevity' },
  { lord: 8, house: 6, verse: '90', valence: 0.4, summary: 'Opposition is overcome — the difficulty-lords cancel each other.', excluded: 'affliction by disease and childhood illness' },
  { lord: 8, house: 7, verse: '91', valence: -0.4, summary: 'Partnership carries an undercurrent that is not spoken about.', excluded: '"two wives"' },
  { lord: 8, house: 8, verse: '92', valence: 0.5, summary: 'Endurance is the defining strength; what is hidden stays contained.', excluded: 'longevity, in both directions' },
  { lord: 8, house: 9, verse: '93', valence: -0.5, summary: 'Inherited conviction is questioned and often set aside.', excluded: 'betraying religion, heterodoxy, and a "wicked wife"' },
  { lord: 8, house: 10, verse: '94', valence: -0.5, summary: 'The work is undercut by what is not dealt with underneath it.', excluded: 'talebearing; paternal bliss stated as a flat denial' },
  { lord: 8, house: 11, verse: '95', valence: -0.4, summary: 'Gains are eroded from a direction not being watched.' },
  { lord: 8, house: 12, verse: '96', valence: -0.4, summary: 'What is spent goes into what cannot be recovered.', excluded: '"evil deeds" and a short life' },

  // ── Lord of the 9th (verses 97-108) ────────────────────────────────────────
  { lord: 9, house: 1, verse: '97', valence: 0.7, summary: 'Fortunate in one’s own person; conviction and identity are the same thing.' },
  { lord: 9, house: 2, verse: '98', valence: 0.7, summary: 'Learned, well liked and materially fortunate.', excluded: 'sensuousness as a character note' },
  { lord: 9, house: 3, verse: '99', valence: 0.6, summary: 'Siblings are a source of fortune; effort is rewarded generously.' },
  { lord: 9, house: 4, verse: '100', valence: 0.7, summary: 'Property, comfort and good fortune arrive together and stay.' },
  { lord: 9, house: 5, verse: '101', valence: 0.7, summary: 'Bold and well taught; respects those who came before.' },
  { lord: 9, house: 6, verse: '102', valence: -0.5, summary: 'Fortune is thin and has to be worked for; maternal support is limited.' },
  { lord: 9, house: 7, verse: '103', valence: 0.6, summary: 'Fortune arrives with partnership — things open up after it, not before.' },
  { lord: 9, house: 8, verse: '104', valence: -0.5, summary: 'Fortune is interrupted; support from elders is not reliable.' },
  { lord: 9, house: 9, verse: '105', valence: 0.9, summary: 'Abundantly fortunate — the strongest placement in the chapter.' },
  { lord: 9, house: 10, verse: '106', valence: 0.8, summary: 'Fortune and standing are the same engine; rises to real authority.', excluded: 'kingship, which is not a thing to predict' },
  { lord: 9, house: 11, verse: '107', valence: 0.8, summary: 'Gains accumulate steadily; principled and respectful of elders.' },
  { lord: 9, house: 12, verse: '108', valence: -0.4, summary: 'Fortune is spent as fast as it arrives, largely on worthwhile things.' },

  // ── Lord of the 10th (verses 109-120) ──────────────────────────────────────
  { lord: 10, house: 1, verse: '109', valence: 0.7, summary: 'The work and the self are one; capable and self-directed.' },
  { lord: 10, house: 2, verse: '110', valence: 0.7, summary: 'Work converts directly into means; charitable with what it earns.' },
  { lord: 10, house: 3, verse: '111', valence: 0.6, summary: 'Effective through others; siblings and colleagues are an asset.' },
  { lord: 10, house: 4, verse: '112', valence: 0.6, summary: 'Attentive to family; the work is done from and for a settled base.' },
  { lord: 10, house: 5, verse: '113', valence: 0.7, summary: 'Broadly learned and consistently glad of the work.' },
  { lord: 10, house: 6, verse: '114', valence: -0.4, summary: 'Skilled but obstructed; the work meets resistance disproportionate to it.' },
  { lord: 10, house: 7, verse: '115', valence: 0.6, summary: 'Intelligent and principled; partnership and career reinforce each other.' },
  { lord: 10, house: 8, verse: '116', valence: -0.5, summary: 'The work stalls and blame is easier to reach for than the cause.', excluded: 'longevity' },
  { lord: 10, house: 9, verse: '117', valence: 0.8, summary: 'Rises well beyond the starting point; fortune follows the work.', excluded: 'kingship conditioned on birth' },
  { lord: 10, house: 10, verse: '118', valence: 0.8, summary: 'Skilled at whatever is undertaken; truthful and steady.' },
  { lord: 10, house: 11, verse: '119', valence: 0.8, summary: 'The work pays, and what it pays is kept.' },
  { lord: 10, house: 12, verse: '120', valence: -0.5, summary: 'The work consumes more than it returns; effort disappears into overheads.', excluded: '"fear from" authority' },

  // ── Lord of the 11th (verses 121-132) ──────────────────────────────────────
  { lord: 11, house: 1, verse: '121', valence: 0.7, summary: 'Gains come to one directly rather than through intermediaries.' },
  { lord: 11, house: 2, verse: '122', valence: 0.8, summary: 'Income and accumulation both strong; broadly accomplished.' },
  { lord: 11, house: 3, verse: '123', valence: 0.6, summary: 'Capable and well supported by siblings; gain follows initiative.' },
  { lord: 11, house: 4, verse: '124', valence: 0.5, summary: 'Gain through family and through travel to places that matter.' },
  { lord: 11, house: 5, verse: '125', valence: 0.6, summary: 'Children do well and learning pays; a generous placement.' },
  { lord: 11, house: 6, verse: '126', valence: -0.4, summary: 'Gains are contested and often made far from home.', excluded: 'affliction by disease, and "cruel" as a verdict' },
  { lord: 11, house: 7, verse: '127', valence: 0.6, summary: 'Gain arrives through partnership and through the people it brings.' },
  { lord: 11, house: 8, verse: '128', valence: -0.5, summary: 'Undertakings reverse; what looked settled has to be redone.', excluded: 'longevity' },
  { lord: 11, house: 9, verse: '129', valence: 0.8, summary: 'Fortunate, capable and straightforward; affluence follows.' },
  { lord: 11, house: 10, verse: '130', valence: 0.7, summary: 'Standing converts into gain; principled about how it is earned.' },
  { lord: 11, house: 11, verse: '131', valence: 0.8, summary: 'Gain in whatever is undertaken; learning and contentment grow with it.' },
  { lord: 11, house: 12, verse: '132', valence: -0.3, summary: 'What is gained is spent, largely on things worth spending on.', excluded: 'sensuousness and "many wives"' },

  // ── Lord of the 12th (verses 133-144) ──────────────────────────────────────
  { lord: 12, house: 1, verse: '133', valence: -0.4, summary: 'Energy leaks into things that do not return it; needs solitude.' },
  { lord: 12, house: 2, verse: '134', valence: 0.4, summary: 'Spends on what is worthwhile; speaks well and means it.' },
  { lord: 12, house: 3, verse: '135', valence: -0.5, summary: 'Sibling ties are thin and effort is directed away from others.', excluded: 'hating others — a character verdict' },
  { lord: 12, house: 4, verse: '136', valence: -0.6, summary: 'Domestic ground steadily erodes; losses accrue rather than arrive.' },
  { lord: 12, house: 5, verse: '137', valence: -0.5, summary: 'Learning and creative work are given away rather than built on.', excluded: 'being bereft of sons' },
  { lord: 12, house: 6, verse: '138', valence: -0.5, summary: 'Friction with one’s own circle; obligation compounds.', excluded: 'anger, sinfulness and miserliness' },
  { lord: 12, house: 7, verse: '139', valence: -0.5, summary: 'Partnership is expensive in every sense; closeness is hard to sustain.' },
  { lord: 12, house: 8, verse: '140', valence: 0.4, summary: 'Gains quietly and speaks well; loss and endurance cancel each other.', excluded: 'a "medium span of life"' },
  { lord: 12, house: 9, verse: '141', valence: -0.6, summary: 'At odds with what one was raised to believe, and with those who taught it.', excluded: 'dishonouring elders and enmity to friends as verdicts' },
  { lord: 12, house: 10, verse: '142', valence: -0.4, summary: 'The work drains rather than returns; standing is moderate at best.' },
  { lord: 12, house: 11, verse: '143', valence: -0.4, summary: 'Losses recur, though gain sometimes arrives from an unexpected quarter.', excluded: 'being brought up by others' },
  { lord: 12, house: 12, verse: '144', valence: -0.6, summary: 'Heavy and continuous expenditure; comfort is consistently deferred.', excluded: 'the verse’s bodily claims' },
];

/** All 144 cells, both halves. */
export const ALL_LORD_PLACEMENTS: LordPlacement[] = [...LORD_PLACEMENTS, ...LORD_PLACEMENTS_7_12];

/** Matters for all twelve lords. */
export const ALL_LORD_MATTER = { ...LORD_MATTER, ...LORD_MATTER_7_12 };

/**
 * `Rule[]` for every one of the 144 cells.
 *
 * Same construction as Part 25's `bhavaLordRules`, over the combined table. The twelve
 * placements of a lord share `effect.id` because they are mutually exclusive.
 */
export function allBhavaLordRules(lords?: House[]): Rule[] {
  const wanted = lords ?? Array.from({ length: 12 }, (_, i) => i + 1);
  return ALL_LORD_PLACEMENTS.filter((p) => wanted.includes(p.lord)).map((p) => ({
    id: `bphs.24.${p.verse.padStart(3, '0')}.lord${p.lord}-in-${p.house}`,
    source: { text: 'bphs' as const, chapter: 24, verse: p.verse },
    when: [{ k: 'lordship' as const, house: p.lord, occupies: p.house }],
    effect: {
      id: `bhava-lord.${p.lord}`,
      domain: ALL_LORD_MATTER[p.lord]!.domain,
      valence: p.valence,
      summary: p.summary,
    },
    weight: Math.min(1, Math.abs(p.valence) + 0.2),
    verification: 'unverified' as const,
    ...(p.excluded ? { note: `Not carried from this verse: ${p.excluded}.` } : {}),
  }));
}

/** Every one of the 144 cells is present exactly once. */
export function fullTableIsComplete(): boolean {
  for (let l = 1; l <= 12; l++) {
    for (let h = 1; h <= 12; h++) {
      if (!ALL_LORD_PLACEMENTS.some((p) => p.lord === l && p.house === h)) return false;
    }
  }
  return ALL_LORD_PLACEMENTS.length === 144;
}

// ── 24.145 — the sixth instruction to arbitrate ──────────────────────────────

/**
 * The chapter closes by telling you not to read it literally.
 *
 * 24.145-148: "those are the effects of house lords which are to be deduced considering
 * their strength". After 144 flat declaratives, the text says every one of them is
 * conditional on the strength of the planet involved.
 *
 * That is the **sixth** time the corpus has stated its own arbitration requirement, after
 * 27.37-38, 28.15-20, 72.30-31, 74.11-13 and 14.15. It is the most pointed of the six,
 * because it immediately follows the largest block of unconditional statements in the book
 * — and it is the strongest argument that the flat valences in this table are inputs to a
 * ranking rather than conclusions.
 */
export const DEDUCE_CONSIDERING_STRENGTH =
  'BPHS 24.145: the effects of the house lords "are to be deduced considering their '
  + 'strength". This is the sixth time the corpus has stated its own arbitration '
  + 'requirement — after 27.37-38 (the strongest planet delivers), 28.15-20 (the signed '
  + 'ledger), 72.30-31 (the ashtakavarga outranks transit), 74.11-13 (majority decides) '
  + 'and 14.15 (weigh before announcing). It is the most pointed of the six because it '
  + 'immediately follows the largest block of flat declaratives in the book. The valences '
  + 'in this table are inputs to `arbitrate`, not conclusions.';

/**
 * Every place the corpus states its own precedence, in the order we found them.
 *
 * Append-only, and the count is deliberately not baked into the prose above or the tests
 * below — this register grew from six to seven in Part 28 and will grow again. The first
 * six RANK evidence; 32.9-12 is the first that CAPS it.
 */
export const SOURCE_STATED_ARBITRATION = [
  '27.37-38 — the strongest planet bearing on a bhava delivers its promise',
  '28.15-20 — a bhava’s outcome is a signed ledger of every term',
  '72.30-31 — the ashtakavarga outranks transit; transit is the fallback',
  '74.11-13 — a contested house goes to the majority; ties stay mixed',
  '14.15 — announce sibling effects only after weighing the yogas',
  '24.145 — the house-lord effects are deduced considering their strength',
  '32.9-12 — no karaka may act against the Atmakaraka; an adverse AK caps the benefit '
  + 'the others deliver, a favourable one caps the harm (a CAP, not a ranking)',
  '35.16-17 — the seven Sankhya yogas do not operate if any other Nabhasa yoga is present '
  + '(a SUPPRESSION of a whole class, and the only unconditional one)',
  '36.1-2 — a yoga’s NAME does not settle its effect; the participants’ dignity, strength '
  + 'and functional nature decide it. Argued by counter-example and then generalised to '
  + '"every yoga, good or bad, and in every context" — the first that is explicitly GENERAL',
  '39.3-5 — a raja yoga’s effect is "full, or a half or a quarter according to their '
  + 'strengths": an explicit three-step MAGNITUDE scale, the most quantitative of the ten',
  '41.17 — the wealth yogas are to be delineated only after weighing the participants’ '
  + 'dispositions and their strength and weakness. 36.1-2’s general caveat restated for a '
  + 'second chapter — the corpus repeats it wherever flat declaratives invite literal reading',
  '48.1 — a planet’s CONDITION outranks its NATURE in its dasha: a malefic exalted in an '
  + 'auspicious house gives no harm, a benefic debilitated in a dusthana does. 36.1-2 applied '
  + 'to periods rather than yogas, and the sharpest instruction for the timing layer',
  '61.2 — "the above are general effects… such inauspicious effects will not be produced if '
  + 'the [planet] be in Trikona etc., be the lord of an auspicious house, be in an auspicious '
  + 'house and [in a] benefic Varga. ALL OTHER PRATYANTAR EFFECTS SHOULD BE JUDGED IN THIS '
  + 'MANNER." The BROADEST of the thirteen: stated once, it declares an entire chapter of '
  + 'period readings defeasible by placement in advance',
  '64.56-58 — in a Kalachakra antardasa, a planet FRIENDLY to the dasha lord gives favourable '
  + 'results though malefic, and a benefic ENEMY of the dasha lord does not. A genuinely new '
  + 'axis: the other thirteen weigh a planet’s own condition against its nature, this weighs '
  + 'the RELATION BETWEEN TWO planets. Stated for Kalachakra and not carried across — Part 41 '
  + 'tested the same idea as an unstated rule in the Vimshottari block and refuted it',
] as const;

// ── Policy ───────────────────────────────────────────────────────────────────

export const CH24B_YIELD = {
  verses: 72,
  rules: 72,
  note: 'Again 1:1, and again that is not the same as intact — 40 of the 72 lost a clause, '
    + 'against 33 in the first half. These six lords govern the spouse, death, the father, '
    + 'standing, gains and loss, so their verses reach for other people and for outcomes far '
    + 'more often than lords 1-6 do.',
} as const;

/**
 * The seventh lord is the hardest twelve verses in the chapter, and worth naming.
 *
 * Eight of its twelve verses make a claim about the wife rather than about the native:
 * her health (78, 80), her obedience (76, 82), her character (93 by extension), and how
 * many there are (74, 81, 91). What survives is the native's own experience of
 * partnership, which is what the app can honestly speak to.
 */
export const SEVENTH_LORD_NOTE =
  'Eight of the 7th lord’s twelve verses describe the wife rather than the native — her '
  + 'health, her obedience, her character, her number. Only the native’s own experience of '
  + 'partnership is carried. This is the densest concentration of third-party claims in the '
  + 'corpus so far.';

export const CH24B_EXCLUSION_THEMES = [
  'Claims about the spouse as an object — health, obedience, character, and counts. '
  + 'Concentrated in the 7th lord; see SEVENTH_LORD_NOTE.',
  'Longevity, stated flatly in both directions — "long-lived" (89, 92, 116, 128) and '
  + '"short life" (96). Part 51 material wherever it appears.',
  'Kingship as an outcome (106, 117), in one case conditioned on the native’s birth. Not a '
  + 'thing to predict, and the caste conditioning is excluded as it was in ch 73.',
  'Character verdicts — cruel, sinful, miserly, indolent, talebearing, hating others.',
  'The death or deprivation of a parent (88).',
] as const;

export const BHAVA_LORD_BLOCK_COMPLETE =
  'Chapter 24 is complete: 144 cells, 144 rules, every lord in every house. It is the '
  + 'largest single block in the corpus and the registry roughly doubled for it (99 → 243). '
  + 'The chapter’s own closing verse says to read all of it through strength, which is what '
  + '`arbitrate` does.';
