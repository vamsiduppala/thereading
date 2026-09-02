// The rule corpus must stay readable by someone who knows no astrology.
//
// `packages/engine/test/no-jargon.test.ts` has guarded the engine's template bank since early
// on. It cannot guard THIS package — the engine does not depend on the knowledge package and
// must not start — so the corpus went unlinted, and by the time anyone measured it, 17 of 381
// rule summaries had drifted into naming planets, houses and Sanskrit terms.
//
// That matters more than it looks. `Effect.summary` is not an internal label: it is the
// sentence a reader is shown. Its own docstring says "our own concise phrasing, never the
// source's prose", and 364 summaries honoured that. The seventeen that did not were the
// difference between a corpus that can face a general audience and one that cannot.
//
// ⚠️ **This lints USER-FACING STRINGS ONLY.** Rule ids, predicate fields, JSDoc, module prose
// and the design constants are full of the vocabulary and should be — they are how the
// programme stays traceable to chapter and verse. The line is drawn exactly at what is
// rendered, and the last test here guards that the line has not crept.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(import.meta.dirname, '..', 'src', 'data', 'bphs');

/**
 * The engine's list, plus the terms this corpus is likelier to reach for.
 *
 * `house` and `lord` are the two that actually caught things, and they are here precisely
 * because they are ordinary English as well as technical: "a difficulty-lord in a difficulty
 * house" reads like prose, which is exactly how it survived review.
 */
const FORBIDDEN = new RegExp(
  String.raw`\b(`
  + 'mars|mercury|jupiter|venus|saturn|rahu|ketu|the moon|the sun'
  + '|aries|taurus|gemini|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces'
  + '|graha|dasha|dasa|nakshatra|pada|lagna|rashi|rasi|bhava|gochara|vimshottari|ayanamsa'
  + '|drishti|kendra|trikona|dusthana|ascendant|retrograde|combust|exalted|debilitated'
  + '|zodiac|horoscope|benefic|malefic|varga|navamsa|yoga|karaka|trine|angular|house|lord'
  + String.raw`)\b`,
  'i',
);

/** `summary: '…'` — the one field in a Rule that a user reads verbatim. */
const SUMMARY = /summary:\s*'([^']*)'/g;

function summaries(): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  for (const f of readdirSync(DIR).filter((n) => n.endsWith('.ts'))) {
    const src = readFileSync(join(DIR, f), 'utf8');
    for (const m of src.matchAll(SUMMARY)) {
      // Short strings in this position are ids and keys, not sentences.
      if (m[1] && m[1].length >= 20) out.push({ file: f, text: m[1] });
    }
  }
  return out;
}

describe('the rule corpus speaks plain English', () => {
  const all = summaries();

  it('finds the summaries at all, so a rename cannot silently disable this test', () => {
    // A lint that quietly matches nothing is worse than no lint: it reports success forever.
    expect(all.length).toBeGreaterThan(300);
  });

  it('contains no astrology vocabulary in any user-facing summary', () => {
    const offenders = all
      .filter((s) => FORBIDDEN.test(s.text))
      .map((s) => `${s.file}: "${s.text.match(FORBIDDEN)?.[0]}" in → ${s.text}`);
    expect(offenders, `${offenders.length} summaries leak jargon`).toEqual([]);
  });

  it('names no planet, in any casing', () => {
    // Called out separately because it is the failure a reader notices instantly: someone who
    // does not know the planets cannot read past one.
    const planets = /\b(sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)\b/i;
    const offenders = all.filter((s) => planets.test(s.text)).map((s) => s.text);
    expect(offenders).toEqual([]);
  });

  it('leaves ids, prose and JSDoc alone — the guard must stay narrow', () => {
    // Rule ids carry chapter and verse and MUST keep doing so; the module prose is where the
    // programme explains itself and is *supposed* to be full of the vocabulary. If someone
    // ever widens the lint to whole files, this is what fails.
    const src = readFileSync(join(DIR, 'ch36.ts'), 'utf8');
    expect(src).toMatch(/id:\s*`bphs\.36\./);
    expect(/\byoga/i.test(src), 'ch36 prose should still say "yoga"').toBe(true);
    expect(/\bbenefic/i.test(src), 'ch36 prose should still say "benefic"').toBe(true);
    expect(/\bJupiter\b/.test(src), 'ch36 prose should still name planets').toBe(true);
  });
});
