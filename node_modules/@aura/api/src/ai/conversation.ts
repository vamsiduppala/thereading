// Short questions deserve short answers.
//
// Not every question wants a four-section reading. "Is October any good?" wants a yes or a no
// and the number behind it. "What does that mean?" wants one sentence. "How do you know that?"
// wants the method, not another forecast. Answering all of them with the full skeleton is what
// makes a thing feel like a form rather than a conversation.
//
// **Still no generated text.** A yes/no is decided by comparing a computed score against the
// chart's own baseline; a definition comes from a glossary of the app's own vocabulary — the
// words it actually prints, defined once. What is new is that the register of the question is
// recognised, and the reply is sized to it.

import { bestWindows, stackAt, driversFor, type Area, type Chart } from '@aura/engine';
import { AREA_LABEL, type Section } from './capabilities.js';

const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
const dmy = (d: Date) => `${d.getUTCDate()} ${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const my = (d: Date) => `${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

export type Register = 'reading' | 'yesno' | 'meaning' | 'meta' | 'social';

/**
 * What the app itself says, defined in the app's own words.
 *
 * Every entry here is a phrase this product actually prints. That is the test for belonging:
 * a glossary of terms nobody sees is documentation, and a glossary that explains vocabulary
 * the reader never encountered is noise.
 */
export const GLOSSARY: { keys: string[]; term: string; says: string }[] = [
  {
    keys: ['out of 100', 'score', 'percentage', 'number', 'points', 'rating'],
    term: 'the score out of 100',
    says: 'It is a weight, not a probability. 72 out of 100 does not mean "72% likely" — it '
      + 'means this stretch scores 72 on how far YOUR chart supports that matter, so a 40 '
      + 'really is worse than a 72 for you. Comparing your number to someone else’s means '
      + 'nothing, because the scale is anchored to the chart it came from.',
  },
  {
    keys: ['stretch', 'window', 'period', 'phase'],
    term: 'a stretch',
    says: 'A span of time the method treats as one unit. Three run at once — a long one of '
      + 'several years, a medium one of months to years, and a short one of weeks to months — '
      + 'and you are inside all three simultaneously. They frequently disagree, and that '
      + 'disagreement is usually the interesting part.',
  },
  {
    keys: ['plus or minus', '± days', 'uncertainty', 'how accurate', 'margin', 'give or take'],
    term: 'the ± on a date',
    says: 'How far that boundary could actually be. A birth time written to the minute is only '
      + 'good to about a minute, and that single minute shifts every boundary by up to five '
      + 'days. It never averages out, which is why dates come with a margin rather than '
      + 'pretending to be exact.',
  },
  {
    keys: ['your own cycle', 'monthly cycle', 'personal phase', 'my cycle'],
    term: 'your own monthly cycle',
    says: 'A roughly 27-day cycle counted from where the sky was at your birth, divided into '
      + 'nine phases. It is the one factor that differs between two people on the same day — '
      + 'which is why a day that is generally auspicious can still be a poor day for you.',
  },
  {
    keys: ['empty days', 'empty day', 'rikta'],
    term: 'the empty days',
    says: 'Three days in each lunar month traditionally avoided for starting anything new. '
      + 'They carry the heaviest single penalty in the timing score.',
  },
  {
    keys: ['to the hour', 'why so precise', 'hour precision'],
    term: 'why some answers carry an hour',
    says: 'Choosing a moment to ACT is computed forward from today, so it barely touches your '
      + 'birth time and can carry an hour. Asking when something will HAPPEN comes off your '
      + 'birth chart and inherits its error, so it can only carry a window of weeks. Two '
      + 'different questions, two different honest precisions.',
  },
  {
    keys: ['seeing it', 'my footing', 'reading it', 'mind'],
    term: 'how you are seeing it',
    says: 'Separate from what is happening. One is your own footing — whether your judgement '
      + 'is running clear right now; the other is the situation itself. They are computed '
      + 'differently and can disagree sharply, and when they do, that gap is the answer: a bad '
      + 'patch you are reading accurately needs different handling from an ordinary patch you '
      + 'are reading badly.',
  },
  {
    keys: ['blocked', 'block', 'holding back'],
    term: 'a block',
    says: 'A part of your chart scoring below the midpoint for that matter. It means the '
      + 'support is not there at the moment, not that something is forbidden — and it always '
      + 'comes with the date it changes.',
  },
];

export function lookupGlossary(question: string): { term: string; says: string } | null {
  const t = question.toLowerCase();
  let best: { term: string; says: string; len: number } | null = null;
  for (const g of GLOSSARY) {
    for (const k of g.keys) {
      if (t.includes(k) && (!best || k.length > best.len)) {
        best = { term: g.term, says: g.says, len: k.length };
      }
    }
  }
  return best ? { term: best.term, says: best.says } : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Yes / no
// ─────────────────────────────────────────────────────────────────────────────

export interface YesNoCtx {
  chart: Chart;
  birth: Date;
  now: Date;
  area: Area;
  from: Date;
  to: Date;
  windowLabel: string;
}

/**
 * A yes or a no, decided against the chart's OWN baseline rather than a fixed threshold.
 *
 * A flat 55 would call a chart that never exceeds 52 for money a permanent "no", which tells
 * the reader nothing they can use. Comparing the asked-about window to what this chart
 * typically manages for this matter answers the question actually being asked: is this a good
 * time *for me*, relative to my other times.
 */
export function yesNo(c: YesNoCtx): Section | null {
  const inWindow = bestWindows(c.chart, c.birth, c.area, c.from, c.to, 3);
  if (inWindow.length === 0) return null;

  // Baseline: what this chart manages for this matter across five years.
  const horizon = new Date(c.now.getTime() + 5 * 365.25 * 86400000);
  const all = bestWindows(c.chart, c.birth, c.area, c.now, horizon, 40);
  const scores = all.map((w) => w.composite).sort((a, b) => a - b);
  const median = scores.length
    ? scores[Math.floor(scores.length / 2)]!
    : 50;
  const ceiling = scores.length ? scores[scores.length - 1]! : 60;

  const top = inWindow[0]!;
  const delta = Math.round((top.composite - median) * 10) / 10;
  const nearBest = ceiling - top.composite <= 3;

  const verdictWord = delta >= 6 ? 'Yes'
    : delta >= 2 ? 'Yes, mildly'
      : delta > -2 ? 'Neither — it is an ordinary stretch for you'
        : delta > -6 ? 'Not really' : 'No';

  const body: string[] = [
    `**${verdictWord}.** ${spanFor(top.start, top.end)} scores ${top.composite} out of 100 for `
    + `${AREA_LABEL[c.area] ?? c.area}, against a typical ${median} for you. That is `
    + `${delta >= 0 ? `${delta} points better` : `${Math.abs(delta)} points worse`} than your own average.`,
  ];
  if (nearBest) {
    body.push(`It is also within three points of the best this chart offers in the next five `
      + `years, so waiting for something clearly better is unlikely to pay off.`);
  } else if (delta < -2) {
    const better = all.sort((a, b) => b.composite - a.composite)[0];
    if (better && better.start > c.to) {
      body.push(`If it can wait, ${spanFor(better.start, better.end)} scores `
        + `${better.composite} — ${Math.round((better.composite - top.composite) * 10) / 10} `
        + `points better.`);
    }
  }
  body.push(`Precisely: ${dmy(top.start)} to ${dmy(top.end)}, good to ${top.uncertainty}.`);

  return { id: 'answer.yesno', title: 'Short answer', body };
}

const spanFor = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()
    ? my(a) : `${my(a)} to ${my(b)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Meta — questions about the app rather than the person
// ─────────────────────────────────────────────────────────────────────────────

export const META_ANSWERS: { keys: RegExp; title: string; body: string[] }[] = [
  {
    keys: /how (do|did) you know|where does (this|that) come from|what is this based on|how is this calculated|how does (this|it) work/i,
    title: 'How this is worked out',
    body: [
      'Your chart is computed from a real ephemeris — where the sky actually was at the '
      + 'minute and place you were born, accurate to under an arcsecond. Nothing is looked up '
      + 'from a table of twelve signs.',
      'The readings come from a classical Sanskrit text encoded as about 717 machine-checkable '
      + 'rules. Anything true of more than a third of people is withheld, because a statement '
      + 'that applies to everyone tells you nothing about you.',
      'Turn on “Show the working” in the bar above and every answer grows a footer with the '
      + 'rule, the chapter and verse it came from, and each step that moved the number.',
    ],
  },
  {
    keys: /how accurate|how reliable|can I trust|is this real|how sure are you/i,
    title: 'How much to trust it',
    body: [
      'The astronomy is exact — positions agree with NASA/JPL to under an arcsecond, and the '
      + 'ascendant to under an arcminute across eight reference cities.',
      'The timing is honest rather than exact. A birth time good to the minute still moves '
      + 'every boundary by up to five days, so dates carry a ± and nothing is quoted finer '
      + 'than that. The exception is choosing a moment to act, which is computed forward from '
      + 'today and can carry an hour.',
      'The interpretation is a historical text encoded faithfully. It is not evidence about '
      + 'the world, and nothing here will tell you it is.',
    ],
  },
  {
    keys: /what can (you|i) (do|ask)|what (else )?can I ask|what do you know|help|what are you/i,
    title: 'What you can ask',
    body: [
      'Anything about work, money, relationships, home and family, children, health, study, '
      + 'travel, obstacles, luck or yourself — in your own words.',
      'Two shapes get very different precision. “When should I…” is answered to the hour, '
      + 'because it is worked forward from today. “When will…” is answered as a window of '
      + 'weeks, because it comes off your birth chart. Both are real; only one can carry a '
      + 'clock time.',
      'The “What can I ask?” tab lists all 175 things the engine covers.',
    ],
  },
  {
    keys: /will I die|when will I die|how long do I have|will I get (ill|sick|cancer)|am I going to die/i,
    title: 'That one is never answered',
    body: [
      'Not because the arithmetic cannot run — in several cases it can — but because it is '
      + 'refused outright, for everyone, always. The same goes for illness and disaster.',
      'A prediction like that is unfalsifiable, frightening, and changes how someone lives on '
      + 'the strength of a historical text. There is no version of it worth shipping.',
    ],
  },
];

/**
 * Permanently refused subjects, checked BEFORE anything else and regardless of register.
 *
 * This was a real failure: "will I die soon" was classified as an ordinary reading and given
 * a normal answer with a score and a date. The refusal existed but sat behind a register the
 * question never landed in. A safety rail that depends on correct classification is not a rail
 * — so this runs unconditionally, on every question, ahead of the model.
 */
const REFUSED: { keys: RegExp; title: string; body: string[] }[] = [
  {
    keys: /\b(when|will|am i going to|how long)\b.{0,24}\b(die|death|dying|dead|pass away)\b|\bdeath\b.{0,20}\b(date|time|when)\b|how long (do i have|have i got)|\blifespan\b|\blongevity\b|\bmy end\b/i,
    title: 'That one is never answered',
    body: [
      'Not for you, not for anyone, and not because the arithmetic cannot run — in several '
      + 'cases it can. It is refused outright.',
      'A prediction like that is unfalsifiable and frightening, and it changes how someone '
      + 'lives on the strength of a historical text. There is no version of it worth shipping, '
      + 'so the engine computes it internally where it must and never surfaces it.',
      'Ask me about work, money, relationships, home, study, travel or timing instead.',
    ],
  },
  {
    keys: /\b(will|am|do|shall|when will) i\b.{0,26}\b(ill|sick|cancer|disease|illness|diagnosed|tumour|tumor|stroke|heart attack)\b|\b(my|any) (illness|disease|diagnosis)\b|will i (fall ill|get sick)|health (problem|issue)s? (coming|ahead)/i,
    title: 'Illness is not predicted here',
    body: [
      'The engine will not forecast illness or a diagnosis, for anyone. That is a refusal by '
      + 'policy rather than a gap in the method.',
      'It will talk about energy, stamina and what your body tends to ask of you — a different '
      + 'question, and an answerable one. If something is worrying you medically, a doctor is '
      + 'the right person and this is not.',
    ],
  },
  {
    keys: /\b(disaster|catastrophe|earthquake|plane crash|terror|attack|war|famine|pandemic)\b.{0,26}\b(will|when|happen|coming)\b|\bwill there be (a |an )?(disaster|war|attack|earthquake|pandemic)\b|\b(accident|crash)\b.{0,20}\b(will i|happen to me)\b/i,
    title: 'Disasters are not predicted here',
    body: [
      'Refused by policy, the same as death and illness. The method can be made to produce '
      + 'something; what it produces would be unfalsifiable and alarming, so it is not shown.',
    ],
  },
];

/**
 * Checked first on every question, whatever the model thinks it is about.
 */
export function refusalAnswer(question: string): Section | null {
  for (const r of REFUSED) {
    if (r.keys.test(question)) {
      return { id: 'answer.refused', title: r.title, body: r.body };
    }
  }
  return null;
}

export function metaAnswer(question: string): Section | null {
  for (const m of META_ANSWERS) {
    if (m.keys.test(question)) {
      return { id: 'answer.meta', title: m.title, body: m.body };
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Social
// ─────────────────────────────────────────────────────────────────────────────

const SOCIAL: { keys: RegExp; body: string }[] = [
  // Checking the thing is alive. This one is here because "are u there?" was answered with
  // four sections about the meaning of life.
  {
    keys: /\b((are|r) (you|u) (there|ok|alive|working|awake|listening|here)|(you|u) (there|ok|alive)|anyone (there|home)|can (you|u) hear me|hello\?|hey\?|still (there|here))/i,
    body: 'Still here. Ask me anything about your chart — work, money, relationships, timing, '
      + 'or the best moment to do something.',
  },
  {
    keys: /^(test|testing)\b/i,
    body: 'Receiving you. Try a real question whenever you are ready — "why is work so hard '
      + 'right now?" or "when should I sign the contract?" are both good ones.',
  },
  {
    keys: /^(thanks|thank you|ty|cheers)\b/i,
    body: 'Any time. Ask another whenever you like.',
  },
  {
    keys: /^(great|nice|cool|perfect|awesome|lovely|brilliant|amazing|wow)\b/i,
    body: 'Glad it helped. There is more where that came from — try a follow-up.',
  },
  {
    keys: /^(ok|okay|k|got it|understood|i see|right|sure|fine|yep|yeah|yes|no|nope)\b/i,
    body: 'Ready when you are.',
  },
  {
    keys: /^(hmm+|huh|oh|ah|lol|haha)\b/i,
    body: 'Say more and I will dig into it — or ask something new.',
  },
  {
    keys: /^(hi|hello|hey|yo|hiya|sup|good (morning|afternoon|evening))\b/i,
    body: 'Hello. Ask me anything about your chart — work, money, relationships, timing, or '
      + 'the best moment to do something.',
  },
  {
    keys: /^(bye|goodbye|see you|later|gn|good night)\b/i,
    body: 'Take care.',
  },
];

export function socialAnswer(question: string): Section | null {
  const t = question.trim();
  for (const s of SOCIAL) {
    if (s.keys.test(t)) return { id: 'answer.social', title: '', body: [s.body] };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

/** A one-line summary of where things stand — used to close a short answer naturally. */
export function oneLineState(chart: Chart, birth: Date, now: Date, area: Area): string | null {
  const w = stackAt(chart, birth, area, now).find((s) => s.level === 'pratyantar')?.window;
  if (!w) return null;
  return `For context, ${AREA_LABEL[area] ?? area} sits at ${w.strength} out of 100 right now, `
    + `until ${dmy(w.end)}.`;
}

export function strongestDriverNote(chart: Chart, area: Area): string | null {
  const d = driversFor(chart, area);
  if (d.length < 2) return null;
  const best = d[0]!;
  return `The strongest single influence on this in your chart scores `
    + `${Math.round(best.score * 100)} out of 100.`;
}

export const SHORT_QUESTIONS_GET_SHORT_ANSWERS =
  'A four-section reading in reply to "is October any good?" is what makes a product feel like '
  + 'a form rather than a conversation. The register of the question is recognised — a yes/no, '
  + 'a request for a definition, a question about the method, or a greeting — and the reply is '
  + 'sized to it. Still no generated text: a yes/no is decided by comparing a computed score '
  + 'against the chart’s own baseline, and a definition comes from a glossary of the app’s own '
  + 'vocabulary.';

export const YESNO_USES_YOUR_OWN_BASELINE =
  'A yes/no is judged against what THIS chart typically manages for THIS matter, not a fixed '
  + 'threshold. A flat cutoff would call a chart that never exceeds 52 for money a permanent '
  + '"no", which is useless — the question being asked is "is this a good time for me", and '
  + 'the only meaningful comparison is against your own other times.';
