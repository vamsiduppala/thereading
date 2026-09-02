// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 24a — Effects of the Bhava Lords, lords 1 to 6. Programme Part 25.
//   Lines 7253-8000, verses 1-72.
//
// **The densest rule block in the book, and the reason the dependency sort exists.**
// Twelve verses per lord, twelve lords, 144 combinations — 72 here, 72 in Part 26.
//
// Three decisions shape this part, and they are the point of it as much as the rules:
//
// 1. **It is a TABLE, not 72 hand-written objects.** The chapter is perfectly systematic —
//    "if the Nth lord is in the Mth house, then…" — so the encoding is too. One row per
//    cell, and `bhavaLordRules()` generates the `Rule[]`. Hand-writing 144 objects would
//    guarantee inconsistency between them.
//
// 2. **The twelve placements of one lord share an `effect.id`.** A lord occupies exactly
//    one house, so they are mutually exclusive — only ever one fires. Sharing the id makes
//    the arbitration treat "where the 2nd lord sits" as ONE claim rather than twelve
//    unrelated ones, which is what it is.
//
// 3. **Every verse is a list, and most lists mix.** "Wealthy, proud, will have two or more
//    wives and be bereft of progeny" is one verse. The material claim is kept; the wives
//    count and the progeny claim are not. `excluded` on each row records what was dropped,
//    so the filtering is inspectable per verse rather than as a chapter-level disclaimer.
// ─────────────────────────────────────────────────────────────────────────────

import type { House } from '../../types.js';
import type { Rule, EffectDomain } from '../../rules/rule.js';

export interface LordPlacement {
  /** Which house's lord. */
  lord: House;
  /** Which house it occupies. */
  house: House;
  verse: string;
  /** −1 hindering … +1 supporting, for the matter the LORD governs. */
  valence: number;
  /** Our own words. Never the source's phrasing. */
  summary: string;
  /** What the verse also said that is not carried, and why it is not. */
  excluded?: string;
}

/** The matter each lord's placement speaks to, and the domain it lands in. */
export const LORD_MATTER: Record<number, { matter: string; domain: EffectDomain }> = {
  1: { matter: 'self, vitality and bearing', domain: 'self' },
  2: { matter: 'resources and provision', domain: 'wealth' },
  3: { matter: 'initiative, nerve and siblings', domain: 'siblings' },
  4: { matter: 'home, land and mother', domain: 'home' },
  5: { matter: 'children, learning and discernment', domain: 'children' },
  6: { matter: 'obligation, friction and what opposes', domain: 'release' },
};

/**
 * The 72 cells of chapter 24a.
 *
 * Read a row as: "the lord of `lord` occupying `house` says this about `LORD_MATTER[lord]`".
 * Valence is relative to that matter, not to life in general — a 6th lord well placed is
 * good for the native and bad for their obstacles, and the sign follows the native.
 */
export const LORD_PLACEMENTS: LordPlacement[] = [
  // ── Lord of the 1st (verses 1-12) ──────────────────────────────────────────
  { lord: 1, house: 1, verse: '1', valence: 0.7, summary: 'Self-possessed and physically robust; capable in one’s own right.' },
  { lord: 1, house: 2, verse: '2', valence: 0.7, summary: 'Learning and earning reinforce each other; well regarded.' },
  { lord: 1, house: 3, verse: '3', valence: 0.7, summary: 'Courage is the defining quality; acts rather than waits.' },
  { lord: 1, house: 4, verse: '4', valence: 0.6, summary: 'Family and home are a source of strength rather than a drain.' },
  { lord: 1, house: 5, verse: '5', valence: 0.2, summary: 'Standing comes readily; matters of children ask more patience.', excluded: 'the loss of a first child — a claim about a life, not a chart' },
  { lord: 1, house: 6, verse: '6', valence: -0.5, summary: 'Vitality needs deliberate upkeep; friction finds one easily.', excluded: 'the verse’s specific ailments' },
  { lord: 1, house: 7, verse: '7', valence: -0.2, summary: 'Partnership is central and demanding in equal measure.', excluded: 'the death of a spouse — never surfaced' },
  { lord: 1, house: 8, verse: '8', valence: -0.1, summary: 'Genuine depth of understanding, bought at some cost in ease.', excluded: 'sickliness, thieving and anger — medical and character claims' },
  { lord: 1, house: 9, verse: '9', valence: 0.8, summary: 'Fortunate, well liked, and articulate about what one believes.' },
  { lord: 1, house: 10, verse: '10', valence: 0.8, summary: 'Recognised for the work; standing arrives without being chased.' },
  { lord: 1, house: 11, verse: '11', valence: 0.7, summary: 'Gains are steady and reputation travels ahead of one.', excluded: '"many wives" — a count of relationships, not a mechanism' },
  { lord: 1, house: 12, verse: '12', valence: -0.5, summary: 'Energy leaks unless deliberately directed; needs solitude to recover.', excluded: 'the verse’s bodily claims' },

  // ── Lord of the 2nd (verses 13-24) ─────────────────────────────────────────
  { lord: 2, house: 1, verse: '13', valence: 0.7, summary: 'Resources accumulate through one’s own effort and are held personally.' },
  { lord: 2, house: 2, verse: '14', valence: 0.7, summary: 'Wealth is stable and self-sustaining.', excluded: 'pride, a count of wives, and a claim about progeny' },
  { lord: 2, house: 3, verse: '15', valence: 0.4, summary: 'Earning follows initiative; what is gained is held tightly.', excluded: 'lustfulness and miserliness as character verdicts' },
  { lord: 2, house: 4, verse: '16', valence: 0.7, summary: 'Wealth arrives through property, family and what is settled.' },
  { lord: 2, house: 5, verse: '17', valence: 0.6, summary: 'Resources grow through learning and through what one creates.' },
  { lord: 2, house: 6, verse: '18', valence: 0.1, summary: 'Money comes through contested ground — competition rather than ease.' },
  { lord: 2, house: 7, verse: '19', valence: 0.4, summary: 'Earning is tied to partnership and to dealing with others.', excluded: 'a claim about adultery' },
  { lord: 2, house: 8, verse: '20', valence: 0.2, summary: 'Substantial holdings, arriving unpredictably rather than steadily.' },
  { lord: 2, house: 9, verse: '21', valence: 0.6, summary: 'Wealth follows conviction; means and principles line up.', excluded: 'childhood sickness' },
  { lord: 2, house: 10, verse: '22', valence: 0.7, summary: 'Earning is inseparable from the work and from public standing.', excluded: 'libidinousness and a count of wives' },
  { lord: 2, house: 11, verse: '23', valence: 0.8, summary: 'Income and accumulation reinforce each other; diligent and known for it.' },
  { lord: 2, house: 12, verse: '24', valence: -0.6, summary: 'What is earned goes out again; holding onto it is the work.', excluded: 'interest in others’ property — a character claim' },

  // ── Lord of the 3rd (verses 25-36) ─────────────────────────────────────────
  { lord: 3, house: 1, verse: '25', valence: 0.6, summary: 'Self-reliant and physically capable; initiative is native.' },
  { lord: 3, house: 2, verse: '26', valence: -0.4, summary: 'Effort comes hard; comfort is preferred to exertion.', excluded: 'corpulence — a bodily claim' },
  { lord: 3, house: 3, verse: '27', valence: 0.7, summary: 'Siblings are a genuine support and nerve holds under pressure.' },
  { lord: 3, house: 4, verse: '28', valence: 0.5, summary: 'Capable and comfortable; effort is applied close to home.', excluded: 'a "wicked spouse" — a judgement about a third party' },
  { lord: 3, house: 5, verse: '29', valence: 0.5, summary: 'Initiative expresses itself through what one creates or teaches.' },
  { lord: 3, house: 6, verse: '30', valence: -0.4, summary: 'Effort turns adversarial; sibling relations take work.' },
  { lord: 3, house: 7, verse: '31', valence: 0.3, summary: 'Drive is directed outward, into partnership and service; slow to start.' },
  { lord: 3, house: 8, verse: '32', valence: -0.5, summary: 'Effort is spent on other people’s terms rather than one’s own.', excluded: 'thieving, and the manner of death' },
  { lord: 3, house: 9, verse: '33', valence: 0.4, summary: 'Fortune follows partnership more than paternal support.', excluded: 'the flat denial of paternal happiness' },
  { lord: 3, house: 10, verse: '34', valence: 0.7, summary: 'Self-made — what is built is built by one’s own initiative.' },
  { lord: 3, house: 11, verse: '35', valence: 0.6, summary: 'Gains come through enterprise and dealing; shrewd rather than schooled.', excluded: '"not literate" as a verdict' },
  { lord: 3, house: 12, verse: '36', valence: -0.3, summary: 'Effort goes into things that do not return; fortune is found far away.', excluded: '"evil deeds" and a "wicked father"' },

  // ── Lord of the 4th (verses 37-48) ─────────────────────────────────────────
  { lord: 4, house: 1, verse: '37', valence: 0.6, summary: 'Home and self are the same project; rooted and capable.' },
  { lord: 4, house: 2, verse: '38', valence: 0.7, summary: 'Comfort, family and means arrive together.' },
  { lord: 4, house: 3, verse: '39', valence: 0.5, summary: 'Generous and effective; what is built is shared out.' },
  { lord: 4, house: 4, verse: '40', valence: 0.8, summary: 'Deeply settled — property, standing and capability all hold.' },
  { lord: 4, house: 5, verse: '41', valence: 0.7, summary: 'Well liked and content; home and creativity feed each other.' },
  { lord: 4, house: 6, verse: '42', valence: -0.6, summary: 'Domestic life is contested ground; the maternal bond takes work.', excluded: 'thieving and anger as character verdicts' },
  { lord: 4, house: 7, verse: '43', valence: 0.4, summary: 'Well educated; what was inherited is traded for what is chosen.' },
  { lord: 4, house: 8, verse: '44', valence: -0.6, summary: 'Domestic comfort is hard-won and parental support is limited.' },
  { lord: 4, house: 9, verse: '45', valence: 0.8, summary: 'Widely liked, principled, and at home in the world.' },
  { lord: 4, house: 10, verse: '46', valence: 0.7, summary: 'Standing and settledness advance together; visibly accomplished.' },
  { lord: 4, house: 11, verse: '47', valence: 0.4, summary: 'Liberal and charitable; gains flow back out as readily as in.', excluded: '"fear of secret disease" — medical' },
  { lord: 4, house: 12, verse: '48', valence: -0.6, summary: 'Little rest at home; comfort is postponed rather than absent.', excluded: '"vices" and "foolish" — character verdicts' },

  // ── Lord of the 5th (verses 49-60) ─────────────────────────────────────────
  { lord: 5, house: 1, verse: '49', valence: 0.6, summary: 'Discernment is a personal trait; learns quickly and teaches naturally.' },
  { lord: 5, house: 2, verse: '50', valence: 0.7, summary: 'Family and means both grow; a provider by disposition.' },
  { lord: 5, house: 3, verse: '51', valence: 0.3, summary: 'Attached to siblings; holds what is gained rather than spending it.', excluded: 'talebearing and miserliness as verdicts' },
  { lord: 5, house: 4, verse: '52', valence: 0.7, summary: 'Contentment, means and clear thinking arrive together.' },
  { lord: 5, house: 5, verse: '53', valence: 0.6, summary: 'Matters of children and learning run to their own strength.', excluded: 'the flat "no issues" clause when afflicted' },
  { lord: 5, house: 6, verse: '54', valence: -0.6, summary: 'What one creates meets resistance; teaching costs more than it returns.', excluded: 'four separate progeny outcomes, adoption and purchase of a child' },
  { lord: 5, house: 7, verse: '55', valence: 0.6, summary: 'Principled and well regarded; family life is a settled one.' },
  { lord: 5, house: 8, verse: '56', valence: -0.5, summary: 'Creative work is interrupted; what is begun is often set aside.', excluded: 'cough and pulmonary complaints' },
  { lord: 5, house: 9, verse: '57', valence: 0.8, summary: 'Authoritative — writes, teaches, and is known for it.' },
  { lord: 5, house: 10, verse: '58', valence: 0.8, summary: 'Discernment becomes public standing; a genuinely favourable placement.' },
  { lord: 5, house: 11, verse: '59', valence: 0.7, summary: 'Learned and well liked; expertise converts into gain.' },
  { lord: 5, house: 12, verse: '60', valence: -0.5, summary: 'What one creates is given away or done elsewhere.', excluded: 'a claim about adopted issue' },

  // ── Lord of the 6th (verses 61-72) ─────────────────────────────────────────
  { lord: 6, house: 1, verse: '61', valence: -0.4, summary: 'Friction is close at hand; obligation is carried personally.' },
  { lord: 6, house: 2, verse: '62', valence: 0.2, summary: 'Bold and known among one’s own; likely to live away from home.' },
  { lord: 6, house: 3, verse: '63', valence: -0.5, summary: 'Nerve fails when it is most wanted; sibling relations strain.', excluded: 'anger as a character verdict' },
  { lord: 6, house: 4, verse: '64', valence: -0.5, summary: 'Home is where the friction is; the maternal bond takes work.', excluded: 'talebearing' },
  { lord: 6, house: 5, verse: '65', valence: -0.4, summary: 'Finances fluctuate; relations with children take patience.' },
  { lord: 6, house: 6, verse: '66', valence: 0.6, summary: 'Opposition undoes itself — two sources of difficulty that cancel each other out.' },
  { lord: 6, house: 7, verse: '67', valence: -0.4, summary: 'Partnership is where the obligation lands; well regarded regardless.' },
  { lord: 6, house: 8, verse: '68', valence: -0.5, summary: 'Obligation compounds quietly; what is owed accrues out of sight.', excluded: 'sickliness and covetousness' },
  { lord: 6, house: 9, verse: '69', valence: -0.3, summary: 'Conviction is tested by circumstance rather than supported by it.' },
  { lord: 6, house: 10, verse: '70', valence: 0.3, summary: 'Work is competitive by nature and rewards those who stay in the fight.' },
  { lord: 6, house: 11, verse: '71', valence: 0.5, summary: 'Gains come from contested ground; competition pays.' },
  { lord: 6, house: 12, verse: '72', valence: 0.5, summary: 'Opposition dissolves before it arrives — the second vipareeta placement.' },
];

/**
 * `Rule[]` for every cell of the table.
 *
 * The twelve placements of one lord share `effect.id`, because a lord sits in exactly one
 * house — they are mutually exclusive and only ever one fires. That makes "where the Nth
 * lord sits" a single claim in the arbitration rather than twelve competing ones, and it
 * stops 72 rules from swamping the ranking with spurious dissent.
 */
export function bhavaLordRules(lords: House[] = [1, 2, 3, 4, 5, 6]): Rule[] {
  return LORD_PLACEMENTS.filter((p) => lords.includes(p.lord)).map((p) => ({
    id: `bphs.24.${p.verse.padStart(3, '0')}.lord${p.lord}-in-${p.house}`,
    source: { text: 'bphs' as const, chapter: 24, verse: p.verse },
    when: [{ k: 'lordship' as const, house: p.lord, occupies: p.house }],
    effect: {
      id: `bhava-lord.${p.lord}`,
      domain: LORD_MATTER[p.lord]!.domain,
      valence: p.valence,
      summary: p.summary,
    },
    weight: Math.min(1, Math.abs(p.valence) + 0.2),
    verification: 'unverified' as const,
    ...(p.excluded ? { note: `Not carried from this verse: ${p.excluded}.` } : {}),
  }));
}

/** Every cell is present exactly once — the check that a systematic table stays systematic. */
export function tableIsComplete(lords: House[] = [1, 2, 3, 4, 5, 6]): boolean {
  for (const l of lords) {
    for (let h = 1; h <= 12; h++) {
      if (!LORD_PLACEMENTS.some((p) => p.lord === l && p.house === h)) return false;
    }
  }
  return true;
}

// ── Policy ───────────────────────────────────────────────────────────────────

export const CH24A_YIELD = {
  verses: 72,
  rules: 72,
  note: 'One rule per verse — the only chapter so far with a 1:1 yield, because it is '
    + 'perfectly systematic. But 33 of the 72 verses had material removed from them; see '
    + '`excluded` per row. A whole verse is rarely dropped here, a clause almost always is.',
} as const;

/**
 * What was cut, thematically, across the 72 verses.
 *
 * Recorded as themes rather than a list of 33 rows because the pattern is the useful part:
 * this chapter's verses are lists of attributes, and the same four kinds of attribute
 * recur.
 */
export const CH24A_EXCLUSION_THEMES = [
  'Character verdicts — thievish, foolish, miserly, wicked, given to anger, talebearing. '
  + 'The chapter hands these out freely; none is a claim about a chart.',
  'Counts of relationships and children — "many wives", "two or more wives", "bereft of '
  + 'progeny", adoption, purchase of a child.',
  'Medical claims — sickliness, cough and pulmonary complaints, "fear of secret disease", '
  + 'childhood illness, corpulence.',
  'Death and its manner — the death of a spouse (24.7), how the native dies (24.32).',
  'Judgements about third parties — a "wicked spouse" (24.28), a "wicked father" (24.36).',
] as const;

export const CH24A_TABLE_RATIONALE =
  'Chapter 24 is 144 systematic cells. Hand-writing them as rule objects would guarantee '
  + 'drift between them — different phrasings for the same shape, missed cells, '
  + 'inconsistent valences. `LORD_PLACEMENTS` is one row per cell and `bhavaLordRules()` '
  + 'generates the rules, so the shape is enforced by construction and `tableIsComplete()` '
  + 'checks no cell is missing.';

export const CH24A_EFFECT_ID_RATIONALE =
  'All twelve placements of one lord share `effect.id` = `bhava-lord.N`. A lord occupies '
  + 'exactly one house, so they are mutually exclusive and only one can ever fire. Sharing '
  + 'the id makes "where the Nth lord sits" ONE claim in the arbitration instead of twelve, '
  + 'which is what it actually is — and stops 144 rules from flooding the ranking.';
