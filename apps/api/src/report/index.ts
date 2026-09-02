// The full chart reading: one chart in, one self-contained HTML document out.
//
// The order is the classical method's own — the sky, then the frame, then the bodies, then
// their strength, then the divisions, then what the combinations mean, then time. A reader who
// stops anywhere has a complete smaller reading rather than half a big one.
//
// Every section is wrapped. A section that throws prints a short note saying which one failed
// and why, and the document continues. That is not defensiveness for its own sake: this thing
// runs ~717 rules, sixteen divisional projections, a decade of ingress scans and sixteen
// life-area window searches against a chart it has never seen, and the failure mode to avoid is
// a blank page where an eighty-page document should be.

import type { BirthData } from '@aura/engine';
import { composeChart, type ComposedChart } from './facts.js';
import {
  document_, section, table, note, withheld, esc, resetCounter, resetToc, dmy,
} from './render.js';
import {
  birthSection, ascendantSection, planetsSection, strengthSection, relationsSection,
  ashtakavargaSection, vargaSection, yogaSection, karakaSection, housesSection,
  arudhaSection, blueprintSection,
} from './natal.js';
import {
  dashaSection, otherDashaSection, transitSection, yearByYearSection,
  areaWindowsSection, electionalSection, turningSection,
} from './timeline.js';
import {
  findingsSection, afflictionSection, remedySection, refusalSection, safetyAudit,
} from './findings.js';
import {
  howItWorksSection, whatWorksSection, transitRulesSection,
} from './aspects.js';
import { pointerWalkSection } from './pointers.js';

export interface ReportOptions {
  /** The moment the report is generated for. Defaults to now. */
  now?: Date;
  /** How many years of history to narrate. */
  backYears?: number;
  /** How many years ahead. */
  forwardYears?: number;
  /** A name for the cover. Never used in any calculation. */
  name?: string;
}

const YEAR = 365.2425 * 86400000;

/** Run one section, or turn its failure into a visible note rather than a blank page. */
function safe(label: string, fn: () => string): string {
  try {
    return fn();
  } catch (e) {
    return section({
      id: `failed-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: `${label} — could not be computed`,
      body: note(`This section failed for this chart: `
        + `${esc(e instanceof Error ? e.message : String(e))}. `
        + 'The rest of the document is unaffected. This is printed rather than skipped '
        + 'because a silently missing section is indistinguishable from a section with '
        + 'nothing to say.'),
    });
  }
}

export function buildFullReport(birth: BirthData, opts: ReportOptions = {}): string {
  const at = opts.now ?? new Date();
  const back = opts.backYears ?? 5;
  const fwd = opts.forwardYears ?? 5;

  resetCounter();
  resetToc();

  let c: ComposedChart;
  try {
    c = composeChart(birth, at);
  } catch (e) {
    return document_('Full chart reading', esc(birth.place),
      section({
        id: 'error', title: 'The chart could not be computed',
        body: note(esc(e instanceof Error ? e.message : String(e))),
      }));
  }

  const parts: string[] = [];

  // ── How to read this ──────────────────────────────────────────────────────
  parts.push(section({
    id: 'how',
    title: 'How to read this document',
    pageBreak: false,
    intro: 'It is long on purpose. Nothing in it is generated prose — every sentence is '
      + 'assembled from a computed number and fixed wording, so the same chart produces the '
      + 'same document every time, and any figure here can be traced back to the calculation '
      + 'that produced it.',
    body: table(['What you are looking at', 'How to take it'], [
      ['A score out of 100',
        'A comparison, not a probability. It compares one department against another in this '
        + 'chart, or one stretch of time against another. It is not a percentage chance of '
        + 'anything happening.'],
      ['A date',
        'The centre of a window, not its edge. Every dasha boundary carries an uncertainty '
        + 'that follows directly from how precisely the birth time is known.'],
      ['A withheld box',
        'Something the source text says that this project deliberately does not carry. The '
        + 'reason is always given, so you can disagree with the decision.'],
      ['A rule id in a small box',
        'The identifier of the encoded rule that produced the claim beside it. Nothing here '
        + 'is asserted without one.'],
      ['An empty section',
        'The chart genuinely has nothing of that kind. Where a calculation failed instead, it '
        + 'says so in those words.'],
    ])
    + note('This is a description of a chart computed from an ephemeris and a body of '
      + 'classical rules. It is not medical, legal, or financial advice, and nothing in it '
      + 'should be used in place of any of those.'),
  }));

  // ── The natal half ────────────────────────────────────────────────────────
  parts.push(safe('Birth data', () => birthSection(c, at)));
  parts.push(safe('The ascendant', () => ascendantSection(c)));
  parts.push(safe('The planets', () => planetsSection(c)));
  parts.push(safe('Strength', () => strengthSection(c)));
  parts.push(safe('Relations', () => relationsSection(c)));
  parts.push(safe('Ashtakavarga', () => ashtakavargaSection(c)));
  parts.push(safe('Divisional charts', () => vargaSection(c)));
  parts.push(safe('Combinations', () => yogaSection(c)));
  parts.push(safe('Significators', () => karakaSection(c)));
  parts.push(safe('The houses', () => housesSection(c)));
  parts.push(safe('Arudhas', () => arudhaSection(c)));
  parts.push(safe('How each part of life arrives', () => howItWorksSection(c, at)));
  parts.push(safe('What works and what does not', () => whatWorksSection(c)));
  parts.push(safe('Findings', () => findingsSection(c)));
  parts.push(safe('Afflictions', () => afflictionSection(c, at)));
  parts.push(safe('The person in plain words', () => blueprintSection(c)));

  // ── Time ──────────────────────────────────────────────────────────────────
  parts.push(safe('Dashas', () => dashaSection(c, at)));
  parts.push(safe('Other period systems', () => otherDashaSection(c, at)));

  const backFrom = new Date(at.getTime() - back * YEAR);
  const fwdTo = new Date(at.getTime() + fwd * YEAR);

  parts.push(safe('Past transits', () => transitSection(
    c, backFrom, at, 'transits-past',
    `Every slow-planet move of the last ${back} years, against your chart`,
    'The point of printing the past is that you can check it. These are the dates the slow '
    + 'planets changed sign, which house of YOUR chart each entered, and how well supplied '
    + 'that house is. Compare them against what actually happened to you — that is the only '
    + 'honest test of anything further down.',
  )));

  parts.push(safe('Coming transits', () => transitSection(
    c, at, fwdTo, 'transits-future',
    `Every slow-planet move of the next ${fwd} years, against your chart`,
    'The same table, forward. These dates are astronomy and are as certain as anything in '
    + 'this document; what they will mean for you is the interpretation, and that is not.',
  )));

  parts.push(safe('Transit rules', () => transitRulesSection(c)));
  parts.push(safe('Year by year', () => yearByYearSection(c, at, back, fwd)));
  parts.push(safe('Department windows', () => areaWindowsSection(c, at, fwd)));
  parts.push(safe('Turning points', () => turningSection(c, at)));
  parts.push(safe('Electional moments', () => electionalSection(c, at)));

  parts.push(safe('Every question, answered', () => pointerWalkSection(c, at)));

  // ── The boundaries ────────────────────────────────────────────────────────
  parts.push(safe('What to do', () => remedySection()));
  parts.push(safe('Refusals', () => refusalSection()));
  parts.push(safe('Method', () => methodSection(c)));

  const body = parts.join('\n');

  // The doom rail runs on the finished document, not just on the generated lines. Every
  // sentence here is ours, so a hit is a bug in our wording rather than a user's input — but
  // a rail that is only applied where you remember to apply it is not a rail.
  const audit = safetyAudit(body);
  const auditBlock = audit.clean ? '' : section({
    id: 'audit',
    title: 'Automatic safety check',
    body: withheld('Some wording in this document tripped the doom filter',
      `${audit.hits.length} sentence(s) matched language this project refuses to use. `
      + 'They are left in place rather than silently cut so the wording can be corrected at '
      + 'the source.') + table(['Flagged'], audit.hits.map((h) => [esc(h)])),
  });

  const who = opts.name?.trim()
    ? `${opts.name.trim()} — born ${birth.date}${birth.time ? ` at ${birth.time}` : ''}, ${birth.place}`
    : `Born ${birth.date}${birth.time ? ` at ${birth.time}` : ''}, ${birth.place}`;

  return document_('Full chart reading', who, body + auditBlock);
}

function methodSection(c: ComposedChart): string {
  return section({
    id: 'method',
    title: 'Method, and what was and was not composed',
    intro: 'What produced the numbers above, and which parts of the rule corpus were reachable '
      + 'for this chart. A fact the engine cannot supply silently disables every rule that '
      + 'reads it, so the list matters.',
    body: table(['Fact group', 'Composed', 'Note'],
      c.provenance.map((pv) => [
        esc(pv.field),
        pv.present ? '<span class="chip good">yes</span>' : '<span class="chip">no</span>',
        esc(pv.note),
      ]))
    + note('Positions come from VSOP87 and ELP-2000 series evaluated for the birth instant, '
      + 'converted to sidereal with the Lahiri ayanamsa. Houses are whole-sign. Dasha '
      + 'boundaries are computed in integer microseconds and only then converted to dates, so '
      + 'a boundary never drifts through repeated rounding.')
    + note('Ingress and station dates are found by scanning to bracket each crossing and then '
      + 'bisecting it to the minute, and are cross-checked against an independent path through '
      + 'the same ephemeris.'),
  });
}

export const A_SECTION_THAT_FAILS_SAYS_SO =
  'Every section is wrapped, and a failure prints which one failed and why rather than '
  + 'vanishing. A missing section and a section with nothing to say look identical on the '
  + 'page, and the difference is the whole question of whether the document can be trusted.';
