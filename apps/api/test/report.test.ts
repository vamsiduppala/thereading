// The full report, tested for the things that would make it worthless rather than merely ugly.
//
// It is 240 KB of assembled HTML built from ~717 rules, sixteen divisional projections, a
// decade of bisected ingress scans and a walk of all 175 pointers. There is no assertion that
// meaningfully covers "is the reading good". There are, however, four failure modes that would
// make it actively misleading, and those are worth pinning hard:
//
//   1. **A section silently missing.** Every section is wrapped so one failure cannot blank the
//      document — which means a failure is invisible unless something counts them.
//   2. **`undefined` on the page.** The commonest symptom of a data shape guessed rather than
//      read, and this file was written against nine of those.
//   3. **The safety rails not applying to the document.** The doom filter guards generated
//      lines; a document that assembles its own sentences must pass it too.
//   4. **Escaping.** A person's own name and birthplace go on the cover, and those are exactly
//      the fields most likely to carry an apostrophe or an angle bracket.

import { describe, it, expect } from 'vitest';
import { buildFullReport } from '../src/report/index.js';
import { composeChart } from '../src/report/facts.js';
import { POINTER_COUNTS } from '@aura/knowledge';

const BIRTH = {
  date: '1990-05-15', time: '06:30', unknownTime: false, place: 'Hyderabad, India',
  lat: 17.385, lng: 78.4867, tzOffsetMinutes: 330,
};
const NOW = new Date('2026-08-26T09:00:00Z');

// Built once. It takes the better part of a minute, and every test below reads the same one.
const html = buildFullReport(BIRTH as never, { now: NOW, name: 'Test Subject' });
const text = html.replace(/<[^>]+>/g, ' ');

describe('the document is complete', () => {
  it('renders every section without any of them failing', () => {
    const ids = [...html.matchAll(/<section class="sec[^"]*" id="([^"]+)"/g)].map((m) => m[1]!);
    expect(ids.length).toBeGreaterThanOrEqual(28);
    // `safe()` renames a section to `failed-*` rather than dropping it, precisely so this
    // assertion can exist. A blank space and a section with nothing to say look identical.
    expect(ids.filter((i) => i.startsWith('failed-'))).toEqual([]);
  });

  it('carries the sections a reading is not a reading without', () => {
    for (const id of [
      'birth', 'ascendant', 'planets', 'strength', 'ashtakavarga', 'vargas',
      'houses', 'how-it-works', 'what-works', 'findings', 'dashas',
      'transits-past', 'transits-future', 'year-by-year', 'pointers', 'refusals',
    ]) {
      expect(html, id).toContain(`id="${id}"`);
    }
  });

  it('gives every section a table-of-contents entry that resolves', () => {
    const ids = new Set([...html.matchAll(/<section class="sec[^"]*" id="([^"]+)"/g)]
      .map((m) => m[1]!));
    const links = [...html.matchAll(/<a href="#([^"]+)"/g)].map((m) => m[1]!);
    expect(links.length).toBe(ids.size);
    for (const l of links) expect(ids.has(l), `#${l} has no section`).toBe(true);
  });

  it('is substantial — this is a reference document, not a summary', () => {
    expect(html.length).toBeGreaterThan(120_000);
    expect((html.match(/<tbody><tr>|<\/tr><tr>/g) ?? []).length).toBeGreaterThan(300);
  });
});

describe('nothing on the page is a placeholder', () => {
  it('prints no undefined, NaN or null in the prose', () => {
    // Nine data shapes in this report were guessed before being read, and every one of them
    // surfaced here first — as `undefinedth house`, as `NaN points`. It is the cheapest
    // possible detector for the most expensive class of mistake in the file.
    const junk = text.match(/undefined|NaN|\bnull\b/g) ?? [];
    expect(junk, junk.slice(0, 6).join(', ')).toEqual([]);
  });

  it('leaves no empty table cells where a number belongs', () => {
    expect(html).not.toMatch(/<td>\s*<\/td>/);
  });
});

describe('the safety rails apply to the document itself', () => {
  it('does not print a doom claim anywhere in its own prose', () => {
    // The audit section only exists when the filter found something. Its absence is the
    // assertion; its presence names what tripped, which is how the three false-positive
    // classes in `safetyAudit` were found (the sign Cancer, classical house indications
    // including "grief", and the passages documenting the refusals themselves).
    expect(html, 'the automatic safety check flagged wording in the report')
      .not.toContain('id="audit"');
  });

  it('states the refusals rather than silently omitting them', () => {
    expect(html).toContain('id="refusals"');
    expect(text).toMatch(/Length of life/i);
    expect(text).toMatch(/Gemstones, fasts, rituals and mantras are not carried/i);
    // The popular doshas this corpus does not encode are named explicitly, because a blank
    // where a reader expects one reads as a clean bill of health.
    expect(text).toMatch(/Kaal Sarpa/i);
  });

  it('caps confidence below certainty', () => {
    expect(text).toMatch(/Confidence is capped at \d+%/);
    expect(text).not.toMatch(/\b100% confidence\b/i);
  });
});

describe('escaping', () => {
  it('escapes a name and place that contain markup', () => {
    const nasty = buildFullReport(
      { ...BIRTH, place: 'O\'Brien & Sons <script>alert(1)</script>' } as never,
      { now: NOW, name: 'Ann "The Boss" O\'Neill <b>' },
    );
    expect(nasty).not.toContain('<script>alert(1)</script>');
    expect(nasty).toContain('&lt;script&gt;');
    expect(nasty).toContain('O&#39;Brien &amp; Sons');
  });
});

describe('the pointer index is walked, not sampled', () => {
  it('accounts for every pointer in the index', () => {
    // Scoped to the pointer section. Matching `<td><b>25</b></td>` across the whole document
    // also catches the ashtakavarga grid's SAV row — twelve extra cells, and a first run that
    // read 187 where it should read 175. A count is only an assertion if you know what it
    // counted.
    const start = html.indexOf('id="pointers"');
    expect(start, 'the pointer section is missing').toBeGreaterThan(0);
    const end = html.indexOf('<section', start + 10);
    const scope = html.slice(start, end > 0 ? end : undefined);

    const ids = [...scope.matchAll(/<td><b>(\d+(?:\.\d+)+[a-z]?)<\/b><\/td>/g)].map((m) => m[1]!);
    expect(new Set(ids).size).toBe(POINTER_COUNTS.pointers);
  });

  it('answers the large majority of the ready ones in full', () => {
    const m = text.match(/(\d+) answered here in full/);
    expect(m, 'the coverage line is missing').toBeTruthy();
    const answered = Number(m![1]);
    // The point of printing the count is that it can regress visibly. 152 of 154 ready
    // pointers were answered when this landed; the floor guards against a refactor that
    // quietly turns answers back into route stubs.
    expect(answered).toBeGreaterThanOrEqual(140);
  });

  it('never claims a pointer the index marks as not built', () => {
    expect(text).toMatch(/named in the index and not yet\s+encoded/i);
  });
});

describe('the facts are composed richly enough for the corpus to fire', () => {
  it('populates every fact group the rule registry can read', () => {
    const c = composeChart(BIRTH as never, NOW);
    const present = new Set(c.provenance.filter((p) => p.present).map((p) => p.field));
    // A predicate whose fact is absent returns false, so an under-composed fact object does
    // not fail — it just produces a shorter reading with nothing saying why.
    for (const f of ['sav / bav', 'vargas', 'karakas', 'yogas', 'dasha']) {
      expect(present.has(f), `${f} not composed`).toBe(true);
    }
    const vargas = (c.facts as { vargas?: Record<string, unknown> }).vargas ?? {};
    expect(Object.keys(vargas).length).toBe(16);
  });

  it('reports the groups it did NOT compose, with a reason', () => {
    const c = composeChart(BIRTH as never, NOW);
    const absent = c.provenance.filter((p) => !p.present);
    expect(absent.length).toBeGreaterThan(0);
    for (const a of absent) expect(a.note.length, a.field).toBeGreaterThan(30);
  });

  it('gets an ashtakavarga whose grand total is the classical 337', () => {
    const c = composeChart(BIRTH as never, NOW);
    const sav = (c.facts as { sav?: number[] }).sav!;
    expect(sav).toHaveLength(12);
    // The seven planets contribute 337 bindus across the zodiac, always. It is the one
    // arithmetic invariant in the whole ashtakavarga scheme, so it is the one worth pinning.
    expect(sav.reduce((a, b) => a + b, 0)).toBe(337);
  });
});

describe('determinism', () => {
  it('produces byte-identical output for the same chart and instant', () => {
    // Every date in this document is derived; none is read from the clock. A `new Date()`
    // anywhere in the chain would show up here and nowhere else.
    const again = buildFullReport(BIRTH as never, { now: NOW, name: 'Test Subject' });
    expect(again.length).toBe(html.length);
    expect(again).toBe(html);
  });
});

describe('a birth with no known time still produces an honest document', () => {
  it('renders, and says plainly what the missing time costs', () => {
    const solar = buildFullReport(
      { ...BIRTH, time: undefined, unknownTime: true } as never, { now: NOW },
    );
    const t = solar.replace(/<[^>]+>/g, ' ');
    expect(solar).toContain('id="birth"');
    expect(t).toMatch(/birth time is unknown/i);
    expect(t.match(/undefined|NaN/g) ?? []).toEqual([]);
    expect(solar).not.toMatch(/id="failed-/);
  });
});
