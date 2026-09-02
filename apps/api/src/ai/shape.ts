// What SHAPE of answer was asked for — read from the request itself.
//
// A registry of capabilities can only offer what somebody thought to write. "rate my months"
// got a generic reading because nothing rated months; adding a months capability would have
// fixed that one sentence and left "rate each week", "best three quarters" and "compare March
// with June" broken identically.
//
// So the shape is parsed into parameters instead — granularity, ordering, cut-off, direction —
// and one generic capability serves all of them. New phrasings work without new code, which is
// the only way to cover the requests nobody has thought of yet.
//
// Read from the request, never invented: when nothing is asked for, nothing is assumed.

export type Ordering = 'chronological' | 'best-first' | 'worst-first';

export interface RequestShape {
  /** 'month', 'week'… — null when no granularity was named. */
  unit: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'period' | null;
  ordering: Ordering;
  /** "best 3 months" → 3. Null means all of them. */
  limit: number | null;
  /** True when a list/table/ranking was explicitly asked for. */
  wantsSeries: boolean;
  /** Which words triggered it, so the choice can be shown and argued with. */
  matched: string[];
}

const UNIT_PATTERNS: [RegExp, RequestShape['unit']][] = [
  [/\b(day|days|daily|day by day|each day|every day|per day)\b/i, 'day'],
  [/\b(week|weeks|weekly|week by week|each week|every week|per week)\b/i, 'week'],
  [/\b(month|months|monthly|month by month|each month|every month|per month|month wise)\b/i, 'month'],
  [/\b(quarter|quarters|quarterly|q[1-4]\b)/i, 'quarter'],
  [/\b(year|years|yearly|annually|each year|every year|per year)\b/i, 'year'],
  [/\b(period|periods|phase|phases|stretch|stretches)\b/i, 'period'],
];

/** Words that mean "give me a list of these, not a paragraph about them". */
const SERIES_RE = new RegExp(
  String.raw`\b(rate|rating|ratings|score|scores|rank|ranking|list|table|tabulate`
  + String.raw`|breakdown|break it down|compare|comparison|percentages?|chart it`
  // No bare `each`/`every` — "every time I try" is not a request for a table. The unit
  // patterns already catch "each month" and "every week", where the word means it.
  + String.raw`|month by month|week by week|day by day|one by one)\b`,
  'i',
);

const BEST_RE = /\b(best|top|strongest|highest|most favourable|favourable|good|better)\b/i;
const WORST_RE = /\b(worst|weakest|lowest|hardest|avoid|bad|difficult|toughest)\b/i;

/** "top 3", "best five months", "3 best" — a cut-off the person named. */
const LIMIT_RE = /\b(?:top|best|worst|first|strongest|weakest)\s+(\d{1,2}|three|four|five|six|ten)\b|\b(\d{1,2})\s+(?:best|worst|strongest|weakest)\b/i;

const WORD_NUMBERS: Record<string, number> = {
  three: 3, four: 4, five: 5, six: 6, ten: 10,
};

export function readShape(question: string): RequestShape {
  const matched: string[] = [];

  let unit: RequestShape['unit'] = null;
  for (const [re, u] of UNIT_PATTERNS) {
    const m = question.match(re);
    if (m) { unit = u; matched.push(m[0]); break; }
  }

  const seriesM = question.match(SERIES_RE);
  if (seriesM) matched.push(seriesM[0]);

  // "worst" before "best": a question naming both ("best and worst months") is usually asking
  // to see the range, and chronological order shows that better than either ranking.
  const wantsWorst = WORST_RE.test(question);
  const wantsBest = BEST_RE.test(question);
  const ordering: Ordering = wantsWorst && !wantsBest ? 'worst-first'
    : wantsBest && !wantsWorst ? 'best-first'
      : 'chronological';

  const lm = question.match(LIMIT_RE);
  let limit: number | null = null;
  if (lm) {
    const raw = (lm[1] ?? lm[2] ?? '').toLowerCase();
    limit = WORD_NUMBERS[raw] ?? (Number.parseInt(raw, 10) || null);
    if (limit) matched.push(lm[0]);
  }

  return {
    unit,
    ordering,
    limit,
    // A named unit is itself a request for a series: "rate my months" and "month by month"
    // both want the list, whether or not the word "list" appears.
    wantsSeries: Boolean(seriesM) || unit !== null,
    matched,
  };
}

/**
 * A date range written into the question — "from aug 2026 - aug 2027", "between March and June".
 *
 * Parsed here rather than in the client because a request naming its own range should not
 * depend on which surface asked. Returns null when no explicit range is present, and the
 * caller's default stands.
 */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'];
// Leading \b matters: without it "mar" matches inside "summary", and "summary to "
// June" would be read as a date range.
const MON_RE = '\\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*';

export function readRange(question: string, now: Date): { from: Date; to: Date; label: string } | null {
  const t = question.toLowerCase();

  // "aug 2026 - aug 2027", "from august 2026 to august 2027"
  const both = t.match(new RegExp(
    `${MON_RE}\\s*(\\d{4})?\\s*(?:-|–|—|to|until|till|through)\\s*${MON_RE}\\s*(\\d{4})?`, 'i',
  ));
  if (both) {
    const m1 = monthIndex(both[1]!);
    const y1 = both[2] ? Number(both[2]) : now.getUTCFullYear();
    const m2 = monthIndex(both[3]!);
    const y2 = both[4] ? Number(both[4]) : (m2 < m1 ? y1 + 1 : y1);
    if (m1 >= 0 && m2 >= 0) {
      return {
        from: new Date(Date.UTC(y1, m1, 1)),
        to: new Date(Date.UTC(y2, m2 + 1, 0, 23, 59, 59)),
        label: `${cap(MONTHS[m1]!)} ${y1} to ${cap(MONTHS[m2]!)} ${y2}`,
      };
    }
  }

  // "next 8 months", "the next 2 years"
  const rel = t.match(/\bnext\s+(\d{1,2})\s*(day|week|month|year)s?\b/);
  if (rel) {
    const n = Number(rel[1]);
    const unit = rel[2]!;
    const to = new Date(now);
    if (unit === 'day') to.setUTCDate(to.getUTCDate() + n);
    else if (unit === 'week') to.setUTCDate(to.getUTCDate() + n * 7);
    else if (unit === 'month') to.setUTCMonth(to.getUTCMonth() + n);
    else to.setUTCFullYear(to.getUTCFullYear() + n);
    return { from: now, to, label: `the next ${n} ${unit}${n === 1 ? '' : 's'}` };
  }

  // A bare year: "in 2027", "how is 2027"
  const yr = t.match(/\b(20\d{2})\b/);
  if (yr && !both) {
    const y = Number(yr[1]);
    return {
      from: new Date(Date.UTC(y, 0, 1)),
      to: new Date(Date.UTC(y, 11, 31, 23, 59, 59)),
      label: `${y}`,
    };
  }
  return null;
}

const monthIndex = (s: string): number =>
  MONTHS.findIndex((m) => m.startsWith(s.slice(0, 3).toLowerCase()));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const SHAPE_IS_PARSED_NOT_ASSUMED =
  'The granularity, ordering and cut-off are read from the request and are null when the '
  + 'request did not name them. Nothing is assumed: a question that says nothing about months '
  + 'does not get a table of them, and one that asks for "the best three" gets three rather '
  + 'than a default that happened to be written down somewhere.';
