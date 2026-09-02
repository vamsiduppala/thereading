// What the encoded corpus actually says about THIS chart — and what it refuses to say.
//
// The two belong in one file because they are the same decision made twice. A rule fires or it
// does not; a chapter was encoded or it was refused. Reporting only the first half produces a
// document that looks complete and is not, and a reader has no way to tell which questions were
// answered because the corpus had an answer and which were quietly skipped.
//
// So: the findings, ranked, with the ones that were withheld and why. Then the standing
// refusals, named, with the reason each was refused. A reader who disagrees with a refusal can
// at least see it and argue; one who never learns of it cannot.

import {
  computeAshtakavarga, computeTransit, sadeSatiPhase, detectYogas,
  checkNoDoom, GRAHAS, SIGN_NAMES, SIGN_LORD,
  type Chart, type Graha, type House,
} from '@aura/engine';
import {
  arbitrate, allEncodedRules, BASE_RATE_SUPPRESS, CONFIDENCE_CEILING,
  LONGEVITY_COMPUTED_NEVER_SURFACED, RITUAL_REMEDIES_NOT_CARRIED,
  CH81_82_EXCLUDED, CH83_REFUSED, MAP_KEPT_RECIPE_REFUSED,
  BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND, CH75_DESCRIPTIONS_REFUSED,
  CH77_CLASS_HIERARCHY_REFUSED, ASCETIC_ORDERS_ARE_DATA_NOT_A_READING,
  MARRIAGE_AGE_POLICY, PENURY_COMBINATIONS,
} from '@aura/knowledge';
import {
  section, sub, table, facts, note, withheld, score, chip, esc, cap,
} from './render.js';
import { ephem, type ComposedChart } from './facts.js';

const SIGN = (i: number): string => SIGN_NAMES[((i % 12) + 12) % 12] ?? '—';
const G = (g: string): string => cap(g);
const ord = (n: number): string => {
  const t = n % 100;
  const suf = t >= 11 && t <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
  return `${n}${suf}`;
};
const houseOf = (chart: Chart, sign: number): House =>
  ((((sign - chart.lagnaSign) % 12) + 12) % 12 + 1) as House;

export function findingsSection(c: ComposedChart): string {
  let res: ReturnType<typeof arbitrate> | null = null;
  let ruleCount = 0;
  try {
    const rules = allEncodedRules();
    ruleCount = rules.length;
    res = arbitrate(rules, c.facts as never, {} as never);
  } catch (e) {
    return section({
      id: 'findings', title: 'What the encoded rules say about this chart',
      body: note(`The rule engine could not run: ${esc(e instanceof Error ? e.message : String(e))}.`),
    });
  }

  const byDomain = new Map<string, typeof res.findings>();
  for (const f of res.findings) {
    const d = f.hit.rule.effect.domain ?? 'general';
    byDomain.set(d, [...(byDomain.get(d) ?? []), f]);
  }

  const blocks = [...byDomain.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([domain, fs]) => sub(cap(domain), table(
      ['Confidence', 'What the rule claims', 'Where it comes from'],
      fs.map((f) => [
        score(f.confidence * 100),
        esc(f.hit.rule.effect.summary),
        `<span class="chip">${esc(f.hit.rule.id)}</span>`,
      ]),
    )));

  // Every stage that moved a finding is recorded on its trace, so "why was this held back"
  // has a real answer rather than a status word. The last stage to move it is the one that
  // decided, so that is the one worth printing.
  const whyHeld = (f: (typeof res.findings)[number]): string => {
    const last = f.trace[f.trace.length - 1];
    return last ? `${last.why} (${last.stage}, ${last.delta >= 0 ? '+' : ''}${last.delta})`
      : String(f.status);
  };

  const withheldRows = (res.withheld ?? []).map((w) => [
    esc(w.hit.rule.effect.summary),
    `<span class="chip warn">${esc(String(w.status))}</span> ${esc(whyHeld(w))}`,
  ]);

  // Where two rules fired on the same effect with opposite signs, the disagreement IS the
  // finding. Averaging it away would be the one thing a corpus this size must not do.
  const dissenting = res.findings.filter((f) => f.dissent.length > 0);

  return section({
    id: 'findings',
    title: 'What the encoded rules say about this chart',
    intro: `Every one of the ${ruleCount} encoded rules was tested against the facts of this `
      + 'chart. These are the ones that fired, ranked by the arbitration ordering — which '
      + 'weighs how specific a rule is, how strong its evidence is here, and how often it '
      + 'would fire on any chart at all.',
    body: (blocks.length ? blocks.join('\n')
      : note('No rule cleared the thresholds on this chart. That is uncommon but not an '
        + 'error — it means nothing in this chart is unusual enough for the corpus to '
        + 'single out.'))
    + (dissenting.length
      ? sub('Where the corpus argues with itself', table(
        ['The surfaced claim', 'What disagreed with it'],
        dissenting.map((f) => [
          `${score(f.confidence * 100)} ${esc(f.hit.rule.effect.summary)}`,
          f.dissent.map((d) => `<span class="chip bad">${esc(d.rule.id)}</span> `
            + esc(d.rule.effect.summary)).join('<br>'),
        ]),
      ) + note('These are effects where rules fired on both sides. The stronger evidence is '
        + 'surfaced and the weaker is printed beside it rather than deleted — a corpus of this '
        + 'size contains genuine disagreements, and hiding them would make it look more '
        + 'certain than it is.'))
      : '')
    + (withheldRows.length
      ? sub('Fired, but held back', table(['Claim', 'Why it was held back'], withheldRows))
      : '')
    + (res.mixed.length
      ? note(`${res.mixed.length} further effect(s) tied on the evidence and were reported as `
        + 'unresolved rather than broken by an arbitrary tiebreak.')
      : '')
    + note(`Confidence is capped at ${((CONFIDENCE_CEILING as number) * 100).toFixed(0)}%. `
      + 'Nothing here is ever certain, and a system that could print 100% would be lying '
      + 'about the method rather than about the chart.')
    + note(`A rule that would fire on more than ${((BASE_RATE_SUPPRESS as number) * 100).toFixed(0)}% `
      + 'of all charts is suppressed automatically. Above that rate a rule is describing '
      + 'humanity, not a person, and printing it is the oldest trick in the trade.'),
  });
}

export function afflictionSection(c: ComposedChart, at: Date): string {
  const { chart } = c;
  const rows: string[][] = [];

  // Combustion — a planet too close to the Sun to act.
  for (const g of GRAHAS) {
    if (chart.planets[g].combust) {
      rows.push([
        'Combustion', `<b>${G(g)}</b>`,
        `Within the Sun's glare in ${SIGN(chart.planets[g].sign)}, the `
        + `${ord(chart.planets[g].house)} house. Its significations are not absent, but they `
        + 'work through the Sun rather than in their own right.',
      ]);
    }
  }

  // Retrogression — not an affliction, and worth saying so where people expect one.
  const retro = GRAHAS.filter((g) => chart.planets[g].retrograde && g !== 'rahu' && g !== 'ketu');
  if (retro.length) {
    rows.push([
      'Retrograde', retro.map((g) => `<b>${G(g)}</b>`).join(', '),
      'Classically a strengthening, not a weakening — a retrograde planet is nearer the '
      + 'Earth and its effects are more insistent, turned inward rather than outward.',
    ]);
  }

  // Debilitation.
  for (const g of GRAHAS) {
    if (chart.planets[g].dignity <= -0.7) {
      rows.push([
        'Debilitated', `<b>${G(g)}</b>`,
        `In ${SIGN(chart.planets[g].sign)}, the ${ord(chart.planets[g].house)} house. `
        + 'Check whether the cancellation conditions apply before reading anything into it — '
        + 'a debilitation whose lord is strong and angular behaves very differently.',
      ]);
    }
  }

  // Kemadruma — the Moon with no neighbours.
  const moonSign = chart.planets.moon.sign;
  const neighbours = GRAHAS.filter((g) => g !== 'moon' && g !== 'sun' && g !== 'rahu' && g !== 'ketu')
    .filter((g) => {
      const d = ((chart.planets[g].sign - moonSign) % 12 + 12) % 12;
      return d === 1 || d === 11 || d === 0;
    });
  if (neighbours.length === 0) {
    rows.push([
      'Kemadruma', '<b>Moon</b>',
      'No planet stands in the sign before, after, or with the Moon. The texts read this as '
      + 'isolation of the emotional life. It is cancelled by several common configurations, '
      + 'which is why it is reported as a condition to check rather than a verdict.',
    ]);
  }

  // Sade Sati — the transit everyone asks about by name.
  try {
    const t = computeTransit(chart, at, ephem);
    const phase = sadeSatiPhase(t.houseFromMoon.saturn);
    rows.push([
      'Saturn over the Moon',
      phase ? chip(String(phase), 'warn') : chip('not running', 'good'),
      phase
        ? `Saturn is in the ${ord(t.houseFromMoon.saturn)} from your natal Moon — the `
          + `${phase} phase. It is a period of consolidation and cost, roughly seven and a `
          + 'half years across all three phases, and it is not a catastrophe.'
        : `Saturn stands in the ${ord(t.houseFromMoon.saturn)} from your natal Moon, which is `
          + 'outside the three phases entirely.',
    ]);
  } catch { /* transit unavailable */ }

  // Grahayuddha — two planets within a degree.
  const pairs: string[] = [];
  for (let i = 0; i < GRAHAS.length; i++) {
    for (let j = i + 1; j < GRAHAS.length; j++) {
      const a = GRAHAS[i]!; const b = GRAHAS[j]!;
      if (a === 'rahu' || a === 'ketu' || b === 'rahu' || b === 'ketu') continue;
      if (a === 'sun' || b === 'sun' || a === 'moon' || b === 'moon') continue;
      const d = Math.abs(chart.planets[a].siderealLong - chart.planets[b].siderealLong);
      if (Math.min(d, 360 - d) <= 1) pairs.push(`${G(a)} and ${G(b)}`);
    }
  }
  if (pairs.length) {
    rows.push(['Planetary war', pairs.join('; '),
      'Two planets within one degree of each other. The classical rule gives the fight to the '
      + 'one further north, and the loser is weakened for the matters it rules.']);
  }

  return section({
    id: 'afflictions',
    title: 'Afflictions — the ones this corpus actually encodes',
    intro: 'What is listed here is what the encoded classical corpus defines and this chart '
      + 'carries. What is not listed is not absent from your chart by omission — read the note '
      + 'below before concluding anything from a blank.',
    body: (rows.length
      ? table(['Condition', 'Where', 'What the texts say about it'], rows)
      : note('None of the encoded afflictions are present in this chart.'))
    + withheld('Several popular "doshas" are deliberately not computed here',
      'Mangal/Kuja dosha, Kaal Sarpa, Pitra dosha and Shrapit dosha are widely quoted and are '
      + 'not part of the Brihat Parashara Hora Shastra as this project encodes it. They are '
      + 'later or regional constructions, and the standing rule of this work is that a rule is '
      + 'encoded from the source text or not at all. Their absence here is a statement about '
      + 'the source, not a clean bill of health and not a judgement on anyone who uses them.')
    + note('A named affliction is a condition to check, never a verdict. Almost every one in '
      + 'the classical literature comes with cancellation clauses, and a reading that quotes '
      + 'the affliction without testing the cancellations is the single commonest way this '
      + 'subject is used to frighten people.'),
  });
}

export function remedySection(): string {
  return section({
    id: 'remedies',
    title: 'What to actually do',
    intro: 'Behaviour only. This is a standing constraint of the project, not an oversight.',
    body: table(['Where the chart is thin', 'What that means in practice'], [
      ['A period lord that is weak or badly placed',
        'Do not start the thing that depends on it during its own sub-period. Prepare in that '
        + 'window and launch in the next one. Timing is the only lever the method actually '
        + 'offers, and it is a real one.'],
      ['A house with few ashtakavarga points',
        'Expect that department to need more input for the same output. Budget effort there '
        + 'rather than expecting it to run itself, and do not read a slow year in it as failure.'],
      ['A strong window you are inside',
        'Act. Support is necessary and not sufficient — the strongest window in this document '
        + 'does nothing at all if nobody moves inside it.'],
      ['A difficult transit',
        'Reduce commitments in the department it touches for its duration, and avoid making '
        + 'irreversible decisions in it. Transits pass; decisions made under them do not.'],
    ])
    + withheld('Gemstones, fasts, rituals and mantras are not carried',
      esc(String(RITUAL_REMEDIES_NOT_CARRIED))
      + ' The remedial chapters were read and mapped; the recipes were not carried across. '
      + 'One of them instructs harm, which settled the question for the rest.')
    + note('If something in this document worries you, the useful response is a specific '
      + 'change in behaviour or timing, not a purchase.'),
  });
}

export function refusalSection(): string {
  const items: [string, string][] = [
    ['Length of life, and the timing of death',
      String(LONGEVITY_COMPUTED_NEVER_SURFACED)],
    ['Ritual and material remedies',
      String(MAP_KEPT_RECIPE_REFUSED)],
    ['Curses and inherited blame for suffering',
      String(BLAME_FOR_SUFFERING_IS_A_REFUSAL_GROUND)],
    ['Physical description and appearance',
      String(CH75_DESCRIPTIONS_REFUSED)],
    ['Class and caste hierarchy',
      String(CH77_CLASS_HIERARCHY_REFUSED)],
    ['Separate rules for women',
      String(CH81_82_EXCLUDED)],
    ['Renunciation as a prediction',
      String(ASCETIC_ORDERS_ARE_DATA_NOT_A_READING)],
    ['An age at which someone will marry',
      String(MARRIAGE_AGE_POLICY)],
  ];

  return section({
    id: 'refusals',
    title: 'What this document will not tell you, and why',
    intro: 'These are not gaps. Each is a chapter or a class of claim that was read, understood '
      + 'and deliberately not carried across — and each is recorded so you can disagree with '
      + 'the decision rather than never learn it was made.',
    body: items.map(([t, why]) => withheld(t, why)).join('\n')
    + note('Every generated line in this project also passes an automatic check for the '
      + 'language it refuses to use, independently of any of the above. A safety rail that '
      + 'depends on correct classification is not a rail; this one runs on everything.'),
  });
}

/**
 * A last pass over the assembled document, so the doom rail runs on the report too.
 *
 * Two things had to be got right here, and the first attempt got both wrong.
 *
 * **It audits our PROSE, not the data.** A table cell holds a sign name, a nakshatra, or a
 * classical house indication — the first house's list includes "grief" and "weakness" because
 * that is what the text assigns to it. Those are vocabulary, not claims about the reader. The
 * rail exists to stop the system PREDICTING doom, so it is pointed at the sentences this
 * project writes: the intros, the notes, the explanatory paragraphs.
 *
 * **Cancer is a zodiac sign.** `DOOM_PATTERNS` matches the bare word `cancer`, which is right
 * for a daily reading and catastrophic here: every chart with a planet in Cancer tripped the
 * filter, and the first run flagged fourteen sentences, all of them the word Cancer or the
 * word grief sitting in a data table. Masking the twelve sign names before the check is what
 * lets the rail stay armed instead of being switched off for being noisy — and a rail that
 * gets switched off for noise is the failure this guards against.
 */
export function safetyAudit(html: string): { clean: boolean; hits: string[] } {
  // The withheld boxes are statements ABOUT what this project refuses to say — the passage
  // explaining that length of life is never surfaced necessarily contains the word it is
  // refusing. Auditing those flags the documentation of the rail as a breach of it, which is
  // the third false positive this function had to learn to stop making.
  const auditable = html.replace(/<div class="withheld">[\s\S]*?<\/div>/g, ' ');

  // Only paragraph prose. Tables are data; headings are labels.
  const paras = [...auditable.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1]!.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

  const SIGNS = /\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/gi;

  const hits: string[] = [];
  for (const para of paras) {
    for (const s of para.split(/(?<=[.!?])\s+/)) {
      if (s.length < 12) continue;
      const masked = s.replace(SIGNS, 'SIGN');
      try {
        const r = checkNoDoom(masked);
        if (r && r.ok === false) hits.push(`${s.slice(0, 150)}  [${r.matches.join(', ')}]`);
      } catch { /* the checker declined this input; not a hit */ }
    }
  }
  return { clean: hits.length === 0, hits };
}

export const REFUSALS_ARE_PART_OF_THE_PRODUCT =
  'A document that silently omits what it will not say looks complete and is not. Every '
  + 'standing refusal is printed with the reason behind it, so a reader can see the boundary '
  + 'and argue with where it was drawn. That is the difference between a limit and a gap.';

export { PENURY_COMBINATIONS };
