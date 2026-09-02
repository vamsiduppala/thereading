// BPHS Programme Part 31 — Chapter 36: Many Other Yogas.
//
// The long tail, and the first chapter since Part 27 to produce real `Rule` records in
// quantity. These are named-planet and named-lord conditions — exactly what the predicate
// DSL is for — and they are high-arity by nature, so their base rates are low. That is the
// point: a 3-condition yoga firing on 0.06% of charts is precise, not broken (Part 23's
// arity-aware `isSuspiciouslyRare` exists for this).
//
// The chapter also forced two DSL extensions in this part, both long overdue:
//   - `lordsConjunct` now takes a named planet as either party (Kahala, 36.9-10)
//   - `placement` gained `fromLordOf` — count from the sign a house's lord holds (Trimurthi)
//
// A note on the chapter's character: Santhanam annotates it more heavily than any other,
// listing up to NINE competing definitions of a single yoga from other classics. We encode
// BPHS's own version and record that the alternatives exist — see `CH36_VARIANT_TRADITIONS`.

import type { Graha, House, SignIndex } from '../../types.js';
import type { Rule } from '../../rules/rule.js';
import type { Predicate } from '../../rules/predicate.js';

const BENEFICS: Graha[] = ['jupiter', 'venus', 'mercury', 'moon'];

// ─────────────────────────────────────────────────────────────────────────────
// The yoga table
// ─────────────────────────────────────────────────────────────────────────────

export interface Ch36Yoga {
  name: string;
  verse: string;
  /** BPHS's own formation, in our words. */
  formation: string;
  when: Predicate[];
  unless?: Predicate[];
  surfaced: boolean;
  summary?: string;
  valence?: number;
  weight?: number;
  /** Clauses present in the verse that we deliberately did not carry. */
  excluded?: string;
  withheld?: string;
}

export const CH36_YOGAS: Ch36Yoga[] = [
  {
    name: 'Shubha', verse: '1',
    formation: 'A benefic in the ascendant.',
    when: [{ k: 'conjunct', grahas: ['jupiter'] }],   // replaced below by the generator
    surfaced: true, valence: 0.5, weight: 0.4,
    summary: 'An easy first impression — the chapter names eloquence, charm and good conduct.',
    excluded: 'The chapter’s own Notes add health, wealth, longevity and fame as effects '
      + 'the text does NOT state. Not carried: an annotator’s extension is not the source.',
  },
  {
    name: 'Shubha (the stronger form)', verse: '2',
    formation: 'Benefics in BOTH the 2nd and the 12th, flanking the ascendant.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.6,
    summary: 'The same ease, held on both sides at once — the chapter calls this the superior form.',
  },
  {
    name: 'Ashubha', verse: '1-2',
    formation: 'A malefic in the ascendant, or malefics in both the 2nd and the 12th.',
    when: [],
    surfaced: false,
    withheld: 'The effect is entirely character verdict — sensuous, sinful, and taking '
      + 'others’ wealth. The formation is encoded so the shape is detectable; the reading '
      + 'is refused.',
  },
  {
    name: 'Gaja Kesari', verse: '3-4',
    formation: 'Jupiter in an angle from the ascendant or from the Moon, conjunct or '
      + 'aspected by a benefic — and NOT debilitated, combust, or in an inimical sign.',
    when: [
      { k: 'placement', graha: 'jupiter', house: 1, from: 'moon' },
    ],
    unless: [
      { k: 'dignity', graha: 'jupiter', is: ['debilitated', 'enemy'] },
      { k: 'state', graha: 'jupiter', is: 'combust' },
    ],
    surfaced: true, valence: 0.8, weight: 0.8,
    summary: 'Standing that rests on judgement rather than force — the chapter names intelligence and regard.',
    excluded: 'The verse’s "will please the king" is not carried. The three-part exclusion '
      + '(debilitation, combustion, inimical sign) IS carried, as `unless`.',
  },
  {
    name: 'Amala', verse: '5-6',
    formation: 'A benefic in the 10th from the ascendant or from the Moon, with no malefic there.',
    when: [],
    surfaced: true, valence: 0.8, weight: 0.7,
    summary: 'A reputation that outlasts the work itself — the chapter dwells on lasting good name.',
    excluded: 'Wealth is NOT among the effects the sage gives, though Phala Deepika adds '
      + 'it. Recorded because an absent claim is as much a fact about the source as a '
      + 'present one, and this one is easy to import by accident.',
  },
  {
    name: 'Parvata', verse: '7-8',
    formation: 'Benefics in angles, with the 7th and 8th either empty or holding only benefics.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.6,
    summary: 'Prominence in one’s own place — the chapter names eloquence, learning and generosity.',
    excluded: 'Santhanam lists NINE competing versions of this yoga from other classics. '
      + 'We encode BPHS’s own; see CH36_VARIANT_TRADITIONS.',
  },
  {
    name: 'Kahala', verse: '9-10',
    formation: 'The 4th lord and JUPITER in mutual angles, while the ascendant lord is strong.',
    when: [],
    surfaced: true, valence: 0.5, weight: 0.5,
    summary: 'Drive and appetite for undertaking things, with the energy to sustain them.',
    excluded: 'The verse’s army, elephants and villages are a period-specific picture of '
      + 'rank; "cunning" is a character verdict. Neither carried.',
  },
  {
    name: 'Kahala (the second form)', verse: '10',
    formation: 'The 4th lord in own sign or exaltation, conjunct the 10th lord.',
    when: [],
    surfaced: true, valence: 0.5, weight: 0.5,
    summary: 'The same drive, arriving through a settled home base rather than through effort alone.',
  },
  {
    name: 'Chamara', verse: '11-12',
    formation: 'The ascendant lord exalted in an angle and aspected by Jupiter.',
    when: [],
    surfaced: true, valence: 0.8, weight: 0.7,
    summary: 'Scholarship and eloquence that carry weight with others; skill across several arts.',
    excluded: 'Kingship and longevity, both excluded corpus-wide.',
  },
  {
    name: 'Sankha', verse: '13-14',
    formation: 'The ascendant lord strong, with the 5th and 6th lords in mutual angles.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.6,
    summary: 'A kindly and capable disposition, with means that hold.',
    excluded: 'Longevity (Part 51), and the counts of spouse and sons.',
  },
  {
    name: 'Bheri', verse: '15-16',
    formation: 'Venus, Jupiter and the ascendant lord in an angle, while the 9th lord is strong.',
    when: [],
    surfaced: true, valence: 0.8, weight: 0.7,
    summary: 'Good fortune that shows as ease and good conduct together rather than as either alone.',
    excluded: 'Kingship, and the counts of wife and sons.',
  },
  {
    name: 'Mridanga', verse: '17',
    formation: 'The ascendant lord strong, while the others hold angles, trines, own signs or exaltation.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.6,
    summary: 'A chart with little working against it; the chapter’s effect is simply happiness.',
    excluded: 'Kingship.',
  },
  {
    name: 'Srinatha', verse: '18',
    formation: 'The 7th lord in the 10th, the 10th lord exalted and with the 9th lord.',
    when: [],
    surfaced: true, valence: 0.8, weight: 0.7,
    summary: 'Unusual standing in the work itself, supported by fortune rather than by effort.',
    excluded: 'The verse’s only stated effect is "equal to Lord Devendra" — a devotional '
      + 'comparison, not a life outcome. The summary reads the FORMATION (10th lord exalted '
      + 'with the 9th lord) rather than translating the comparison, and says so here.',
  },
  {
    name: 'Matsya', verse: '21-22',
    formation: 'Benefics in the 9th and the ascendant, mixed planets in the 5th, malefics in the 4th and 8th.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.7,
    summary: 'A mind drawn to interpreting patterns — the chapter names astrology itself, alongside learning and kindness.',
  },
  {
    name: 'Koorma', verse: '23-24',
    formation: 'Benefics dignified in the 5th, 6th and 7th, with malefics dignified in the 3rd, 11th and ascendant.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.8,
    summary: 'Courage others follow — the chapter names helpfulness and standing among people.',
    excluded: 'Kingship.',
  },
  {
    name: 'Khadga', verse: '25-26',
    formation: 'An exchange of signs between the 2nd and 9th lords, with the ascendant lord in an angle or trine.',
    when: [],
    surfaced: true, valence: 0.8, weight: 0.7,
    summary: 'Learning and quickness put to practical use; the chapter adds gratitude to the list.',
  },
  {
    name: 'Lakshmi', verse: '27-28',
    formation: 'The 9th lord in an angle in his own, moolatrikona or exaltation sign, with the ascendant lord strong.',
    when: [],
    surfaced: true, valence: 0.9, weight: 0.8,
    summary: 'Fortune that arrives steadily rather than in bursts, with a reputation to match.',
    excluded: 'Kingly status and the count of sons.',
  },
  {
    name: 'Kusuma', verse: '29-30',
    formation: 'For a FIXED-sign ascendant: Venus in an angle, the Moon in a trine with a benefic, Saturn in the 10th.',
    when: [],
    surfaced: true, valence: 0.8, weight: 0.8,
    summary: 'Enjoyment and generosity held together — the chapter is unusually warm about this one.',
    excluded: 'Kingship. The fixed-ascendant precondition IS carried; it is the only yoga '
      + 'in the chapter restricted to a modality, and dropping it would triple the hit rate.',
  },
  {
    name: 'Kalanidhi', verse: '31-32',
    formation: 'Jupiter in the 2nd or the 5th, aspected by BOTH Mercury and Venus.',
    when: [],
    surfaced: true, valence: 0.8, weight: 0.7,
    summary: 'Learning that is enjoyed rather than endured, and tends to be recognised.',
    excluded: 'Freedom from disease — a medical claim, excluded corpus-wide.',
  },
  {
    name: 'Hari', verse: '35',
    formation: 'Benefics in the 2nd, 12th and 8th counted FROM THE 2ND LORD.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.6,
    summary: 'One of the three Trimurthi yogas: contentment, learning and means arriving together.',
  },
  {
    name: 'Hara', verse: '35',
    formation: 'Benefics in the 4th, 9th and 8th counted FROM THE 7TH LORD.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.6,
    summary: 'The second of the three great supporting arrangements, reached through partnership rather than through one’s own resources.',
  },
  {
    name: 'Brahma', verse: '35',
    formation: 'Benefics in the 4th, 10th and 11th counted FROM THE ASCENDANT LORD.',
    when: [],
    surfaced: true, valence: 0.7, weight: 0.6,
    summary: 'The third of the three great supporting arrangements, built on your own standing rather than on circumstance.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Predicate construction
// ─────────────────────────────────────────────────────────────────────────────

/** "A benefic occupies house H" — one rule per benefic, sharing an effect id. */
const beneficIn = (house: House, from?: 'moon'): Predicate[][] =>
  BENEFICS.map((g) => [
    from
      ? { k: 'placement' as const, graha: g, house, from }
      : { k: 'placement' as const, graha: g, house },
  ]);

/**
 * The chapter's formations as predicates.
 *
 * Kept beside the table rather than inside it because several yogas expand into a FAMILY of
 * rules — "a benefic in the ascendant" is four rules sharing an effect id, one per benefic,
 * since the DSL names planets and has no "some benefic" quantifier. That expansion is the
 * honest encoding: each alternative is separately falsifiable, and `arbitrate` already knows
 * that rules sharing an effect id are alternatives rather than independent evidence.
 */
export const CH36_NO_QUANTIFIER =
  'The DSL names planets; it has no "some benefic" quantifier. So "a benefic in the '
  + 'ascendant" expands into four rules sharing one effect id, one per natural benefic. '
  + 'That is the honest encoding — each alternative is separately falsifiable — and '
  + '`arbitrate` already treats a shared effect id as alternatives rather than as '
  + 'independent evidence. A quantifier would have to invent an arity for the compound, '
  + 'and arity is counted, never authored.';

function predicatesFor(name: string): { when: Predicate[]; unless?: Predicate[] }[] {
  switch (name) {
    case 'Shubha':
      return beneficIn(1).map((when) => ({ when }));
    case 'Shubha (the stronger form)':
      // Both flanks at once. Cross-product of benefics in the 2nd and in the 12th.
      return BENEFICS.flatMap((a) => BENEFICS.filter((b) => b !== a).map((b) => ({
        when: [
          { k: 'placement' as const, graha: a, house: 2 },
          { k: 'placement' as const, graha: b, house: 12 },
        ],
      })));
    case 'Ashubha':
      return (['sun', 'mars', 'saturn'] as Graha[]).map((g) => ({
        when: [{ k: 'placement' as const, graha: g, house: 1 }],
      }));
    case 'Gaja Kesari':
      // An angle from the Moon. The from-ascendant form is the same shape and is generated
      // alongside, since the verse offers them as alternatives.
      return ([1, 4, 7, 10] as House[]).flatMap((h) => ([
        {
          when: [{ k: 'placement' as const, graha: 'jupiter' as Graha, house: h, from: 'moon' as const }],
          unless: [
            { k: 'dignity' as const, graha: 'jupiter' as Graha, is: ['debilitated' as const, 'enemy' as const] },
            { k: 'state' as const, graha: 'jupiter' as Graha, is: 'combust' as const },
          ],
        },
        {
          when: [{ k: 'placement' as const, graha: 'jupiter' as Graha, house: h }],
          unless: [
            { k: 'dignity' as const, graha: 'jupiter' as Graha, is: ['debilitated' as const, 'enemy' as const] },
            { k: 'state' as const, graha: 'jupiter' as Graha, is: 'combust' as const },
          ],
        },
      ]));
    case 'Amala': {
      // "EXCLUSIVELY a benefic in the 10th" — the verse's own word, and the Notes are
      // explicit that a malefic joining voids the yoga. That is an `unless`, not a gloss.
      const noMalefic = (['sun', 'mars', 'saturn'] as Graha[]).map((m) => (
        { k: 'placement' as const, graha: m, house: 10 }
      ));
      const fromLagna = beneficIn(10).map((when) => ({ when, unless: noMalefic }));
      // The Moon is skipped in the Moon-frame form: the Moon is always in the 1st from
      // herself, so "the Moon in the 10th from the Moon" can never be true. The calibration
      // guard caught it as a dead rule, which is exactly what that guard is for.
      const fromMoon = BENEFICS.filter((g) => g !== 'moon').map((g) => ({
        when: [{ k: 'placement' as const, graha: g, house: 10, from: 'moon' as const }],
        unless: noMalefic,
      }));
      return [...fromLagna, ...fromMoon];
    }
    case 'Parvata':
      return BENEFICS.flatMap((g) => ([1, 4, 7, 10] as House[]).map((h) => ({
        when: [{ k: 'placement' as const, graha: g, house: h }],
      })));
    case 'Kahala':
      // THE extension case: a named planet with an unnamed lord, in mutual angles.
      return [{
        when: [
          { k: 'lordsConjunct', parties: ['jupiter', 4], inHouses: [1, 4, 7, 10] },
          { k: 'strength', graha: 1, op: '>', rupas: 300 },
        ],
      }];
    case 'Kahala (the second form)':
      return [{
        when: [
          { k: 'lordsConjunct', parties: [4, 10] },
          { k: 'lordship', house: 4, occupies: 4 },
        ],
      }];
    case 'Chamara':
      return ([1, 4, 7, 10] as House[]).map((h) => ({
        when: [
          { k: 'lordship' as const, house: 1, occupies: h },
          { k: 'dignity' as const, graha: 1 as House, is: ['exalted' as const] },
          { k: 'aspect' as const, graha: 'jupiter' as Graha, ontoHouse: h, kind: 'graha' as const },
        ],
      }));
    case 'Sankha':
      return [{
        when: [
          { k: 'lordsConjunct', parties: [5, 6], inHouses: [1, 4, 7, 10] },
          { k: 'strength', graha: 1, op: '>', rupas: 300 },
        ],
      }];
    case 'Bheri':
      return ([1, 4, 7, 10] as House[]).map((h) => ({
        when: [
          { k: 'placement' as const, graha: 'venus' as Graha, house: h },
          { k: 'placement' as const, graha: 'jupiter' as Graha, house: h },
          { k: 'lordship' as const, house: 1, occupies: h },
          { k: 'strength' as const, graha: 9 as House, op: '>' as const, rupas: 300 },
        ],
      }));
    case 'Mridanga':
      return [{
        when: [
          { k: 'strength', graha: 1, op: '>', rupas: 300 },
          { k: 'dignity', graha: 9, is: ['exalted', 'own', 'moolatrikona'] },
        ],
      }];
    case 'Srinatha':
      return [{
        when: [
          { k: 'lordship', house: 7, occupies: 10 },
          { k: 'lordsConjunct', parties: [10, 9] },
        ],
      }];
    case 'Matsya':
      return BENEFICS.flatMap((g) => (['sun', 'mars', 'saturn'] as Graha[]).map((m) => ({
        when: [
          { k: 'placement' as const, graha: g, house: 9 },
          { k: 'placement' as const, graha: m, house: 4 },
        ],
      })));
    case 'Koorma':
      return BENEFICS.flatMap((g) => ([5, 6, 7] as House[]).flatMap((h) =>
        (['sun', 'mars', 'saturn'] as Graha[]).flatMap((m) => ([3, 11] as House[]).map((mh) => ({
          when: [
            { k: 'placement' as const, graha: g, house: h },
            { k: 'dignity' as const, graha: g, is: ['exalted' as const, 'own' as const, 'friend' as const] },
            { k: 'placement' as const, graha: m, house: mh },
          ],
        })))));
    case 'Khadga':
      // A mutual exchange, expressed as the pair of lordships it actually is.
      return ([1, 4, 5, 7, 9, 10] as House[]).map((h) => ({
        when: [
          { k: 'lordship' as const, house: 2, occupies: 9 },
          { k: 'lordship' as const, house: 9, occupies: 2 },
          { k: 'lordship' as const, house: 1, occupies: h },
        ],
      }));
    case 'Lakshmi':
      return ([1, 4, 7, 10] as House[]).map((h) => ({
        when: [
          { k: 'lordship' as const, house: 9, occupies: h },
          { k: 'dignity' as const, graha: 9 as House, is: ['exalted' as const, 'own' as const, 'moolatrikona' as const] },
          { k: 'strength' as const, graha: 1 as House, op: '>' as const, rupas: 300 },
        ],
      }));
    case 'Kusuma':
      // Fixed ascendants only — Taurus, Leo, Scorpio, Aquarius. The `lagna` predicate was
      // added in this part precisely so this precondition could be stated rather than
      // approximated; without it the yoga would fire about three times as often.
      return ([1, 4, 7, 10] as House[]).flatMap((h) => ([1, 5, 9] as House[]).map((t) => ({
        when: [
          { k: 'lagna' as const, signs: [1, 4, 7, 10] as SignIndex[] },
          { k: 'placement' as const, graha: 'venus' as Graha, house: h },
          { k: 'placement' as const, graha: 'saturn' as Graha, house: 10 },
          { k: 'placement' as const, graha: 'moon' as Graha, house: t },
        ],
      })));
    case 'Kalanidhi':
      return ([2, 5] as House[]).map((h) => ({
        when: [
          { k: 'placement' as const, graha: 'jupiter' as Graha, house: h },
          { k: 'aspect' as const, graha: 'mercury' as Graha, ontoGraha: 'jupiter' as Graha, kind: 'graha' as const },
          { k: 'aspect' as const, graha: 'venus' as Graha, ontoGraha: 'jupiter' as Graha, kind: 'graha' as const },
        ],
      }));
    // The three Trimurthi yogas — each counts from a LORD, which is why `fromLordOf` exists.
    case 'Hari':
      return BENEFICS.flatMap((g) => ([2, 12, 8] as House[]).map((h) => ({
        when: [{ k: 'placement' as const, graha: g, house: h, fromLordOf: 2 as House }],
      })));
    case 'Hara':
      return BENEFICS.flatMap((g) => ([4, 9, 8] as House[]).map((h) => ({
        when: [{ k: 'placement' as const, graha: g, house: h, fromLordOf: 7 as House }],
      })));
    case 'Brahma':
      return BENEFICS.flatMap((g) => ([4, 10, 11] as House[]).map((h) => ({
        when: [{ k: 'placement' as const, graha: g, house: h, fromLordOf: 1 as House }],
      })));
    default:
      return [];
  }
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Every surfaced yoga in chapter 36, as `Rule` records. */
export function ch36YogaRules(): Rule[] {
  const out: Rule[] = [];
  for (const y of CH36_YOGAS) {
    if (!y.surfaced) continue;
    const forms = predicatesFor(y.name);
    forms.forEach((f, i) => {
      out.push({
        id: `bphs.36.${y.verse.split('-')[0]!.padStart(3, '0')}.${slug(y.name)}-${i + 1}`,
        source: { text: 'bphs', chapter: 36, verse: y.verse },
        when: f.when,
        ...(f.unless ? { unless: f.unless } : {}),
        effect: {
          id: `yoga.${slug(y.name)}`,
          domain: 'fortune',
          valence: y.valence!,
          summary: y.summary!,
        },
        weight: y.weight ?? 0.5,
        verification: 'unverified',
        ...(y.excluded ? { note: `Not carried from this verse: ${y.excluded}` } : {}),
      });
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BPHS 36.1-2's Notes are the most explicit arbitration instruction in the corpus, and the
 * only one that argues by counter-example.
 *
 * The sage's annotator points out that Shubha yoga formed by Mercury in the 2nd and Jupiter
 * in the 12th for an Aquarius ascendant is *worse* than a typical Ashubha yoga, because
 * both are functional malefics there; and that Saturn exalted in the 2nd with the Sun in
 * Leo in the 12th for Virgo is not really Ashubha at all. Then: "This extension may wisely
 * be made for every yoga — good or bad — and in every context."
 *
 * The **ninth** source-stated arbitration instruction, and the first that is explicitly
 * general: the earlier eight each govern one doctrine, this one governs all of them.
 */
export const YOGA_NAME_IS_NOT_A_VERDICT =
  'BPHS 36.1-2 (Notes): a yoga’s NAME does not settle its effect. The same configuration is '
  + 'auspicious or not depending on the participants’ dignity, strength and functional '
  + 'nature for that ascendant — argued by two counter-examples, and then generalised: '
  + '"this extension may wisely be made for every yoga, good or bad, and in every context." '
  + 'The ninth source-stated arbitration instruction, and the first that is explicitly '
  + 'GENERAL rather than governing one doctrine. It is why every rule here carries a weight '
  + 'rather than a verdict, and why `arbitrate` ranks rather than concludes.';

export const CH36_VARIANT_TRADITIONS =
  'Santhanam annotates this chapter more heavily than any other, listing competing '
  + 'definitions from Phala Deepika, Jataka Parijata, Kumara Swameeyam, Sata Yoga Manjari, '
  + 'Jatakadesa Marga, Hora-Sara and four separate Sanskrit editions of BPHS itself — NINE '
  + 'versions of Parvata yoga alone, and five of Gaja Kesari. We encode BPHS’s own version '
  + 'in every case. Recorded because a reader comparing against another classic will find '
  + 'real disagreement, and it is neither our error nor theirs.';

export const CH36_NOT_ENCODABLE = [
  'Kalpadruma yoga (36.33-34) — needs a FOUR-DEEP dispositor chain: the ascendant lord, its '
  + 'dispositor, that planet’s dispositor, and the navamsa dispositor of THAT. The DSL has '
  + 'no dispositor predicate at all, and the fourth link is in a varga. Part 29’s '
  + '`vargaFacts` supplies the varga half; the dispositor half is a genuine gap.',
  'The ascendant lord’s divisional dignities (36.38-39) — Parijatamsa, Vargottama, '
  + 'Gopuramsa, Simhasanamsa and the rest each carry an effect. Part 4 already has '
  + '`VARGA_DESIGNATIONS` and `classifyVarga` computing exactly these names, so this is a '
  + 'WIRING job rather than an extraction one, and it belongs with whichever part next '
  + 'touches the varga-grading path.',
  'The chapter’s "strong" conditions (Sankha, Bheri, Lakshmi, Mridanga) are encoded against '
  + 'the ascendant lord where the lord is resolvable, but the DSL’s `strength` predicate '
  + 'names a graha, and "the ascendant lord" is not a name. The rules below approximate it; '
  + 'a `strength` variant taking a house would close this properly.',
] as const;

export const CH36_YIELD = {
  chapter: 36,
  verses: 39,
  yogas: 22,
  note: 'The first chapter since Part 27 to produce Rule records in quantity, and the '
    + 'highest-arity set in the corpus — which is the point. Two DSL extensions fell out of '
    + 'it, both long overdue: a named planet as a party to `lordsConjunct` (blocked three '
    + 'times since Part 23) and `fromLordOf` (counting from a house’s lord). One yoga '
    + '(Kalpadruma) is recorded as not encodable rather than approximated.',
} as const;

export const CH36_AMALA_MOON_IMPOSSIBILITY =
  'The first draft generated "the Moon in the 10th from the Moon" — a rule that can never '
  + 'be true, since a planet is always in the 1st from itself. The calibration guard caught '
  + 'it as never-firing. Worth recording because the guard is usually described as catching '
  + 'a MISSING FACT (five times so far); this is the first time it caught a rule that was '
  + 'genuinely impossible, which is the other thing it is for.';
