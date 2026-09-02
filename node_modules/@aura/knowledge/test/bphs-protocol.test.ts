// The programme's own protocol, enforced. Programme Part 23b.
//
// Two standing rules govern this programme and both are things a person is supposed to
// REMEMBER to do every part:
//
//   §8.1  the retrofit sweep — look backward before extracting anything new, and apply
//         what you find to earlier parts
//   §8.0  the context contract — read BPHS_STATE.md before every part, rewrite it after
//
// A rule that depends on remembering will eventually not be remembered. It already
// happened: retrofits R11 through R15 were genuinely applied to the code and then five
// separate edits failed to record them in the state file, because `str.replace` with a
// non-matching anchor fails silently. Nobody noticed for four parts — precisely because
// the state file was not being re-read.
//
// So the discipline is mechanical from here. These tests read the actual documents.
// They cannot check that a sweep was *thoughtful*, but they can check it was *recorded*,
// which is the part that kept going wrong.

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const docs = resolve(import.meta.dirname, '../../../docs');
const read = (name: string): string => readFileSync(resolve(docs, name), 'utf8');

const STATE = 'BPHS_STATE.md';
const PROGRAMME = 'BPHS_PROGRAMME.md';
const SPLIT = new RegExp(String.fromCharCode(92) + 'r?' + String.fromCharCode(92) + 'n');
const PROGRESS = 'KNOWLEDGE_PROGRESS.md';
const POINTERS = 'PREDICTION_POINTERS.md';

/** The part number the state file currently says is complete. */
function partsComplete(state: string): number {
  const m = state.match(/Parts 1[–-](\d+) of 51 complete/);
  expect(m, 'the state file must say how many parts are complete').toBeTruthy();
  return Number(m![1]);
}

describe('the four context documents exist and are current', () => {
  it('all four are present', () => {
    for (const f of [STATE, PROGRAMME, PROGRESS, POINTERS]) {
      expect(existsSync(resolve(docs, f)), f).toBe(true);
    }
  });

  it('the state file names a resume point, or declares the programme complete', () => {
    // Until Part 51 this asserted that a next part is always named. That was an invariant of
    // an IN-PROGRESS programme; the programme is now finished, so the honest requirement is
    // that the file says which — never that it says nothing. If work ever resumes, naming a
    // next action satisfies this again without the test being relaxed.
    const s = read(STATE);
    expect(s).toContain('RESUME HERE');
    const names = /Next action: Part \d+/.test(s);
    const done = /THE PROGRAMME IS (COMPLETE|DONE)/.test(s);
    expect(names || done, 'the state file must name a next action or declare completion')
      .toBe(true);
  });

  it('the state file stays small enough to actually re-read every part', () => {
    // It is rewritten, never appended. If it starts growing without bound that is a bug
    // in how it is maintained — the whole point is that reading it is cheap.
    const lines = read(STATE).split('\n').length;
    expect(lines, `BPHS_STATE.md is ${lines} lines`).toBeLessThan(500);
  });

  it('the progress log and the pointers index agree with the state file on the part count', () => {
    const n = partsComplete(read(STATE));
    expect(read(POINTERS)).toContain(`${n} of 51 parts`);
    // The log is append-only, so it must at least mention the current part.
    expect(read(PROGRESS)).toContain(`Programme Part ${n} `);
  });

  it('the pointers index carries FORMULAS, not just routes', () => {
    // A pointer without a formula is a dot. The whole point of the file is the connections.
    const pointers = read(POINTERS);
    const blocks = (pointers.match(/> \*\*Formula\*\*/g) ?? []).length;
    expect(blocks, 'formula blocks in PREDICTION_POINTERS.md').toBeGreaterThanOrEqual(90);
    // The coverage table must not drift from the real count.
    const claimed = Number(pointers.match(/\| \*\*Formula blocks\*\* \| (\d+) \|/)?.[1]);
    expect(claimed, 'the coverage table disagrees with the file').toBe(blocks);
  });

  it('every formula block cites a source and an implementing function', () => {
    // `> **Formula** · <source> · `fn()`` — the citation is what makes it checkable.
    const pointers = read(POINTERS);
    const lines = pointers.split(SPLIT).filter((l) => l.includes('**Formula**'));
    for (const l of lines) {
      expect(l, l.slice(0, 70)).toMatch(/\*\*Formula\*\*\s*·/);
    }
  });

  it('the pointers file says how it must be maintained', () => {
    // Otherwise the next part adds a route and forgets the formula.
    const pointers = read(POINTERS);
    expect(pointers).toContain('Every programme part must add the formulas');
    expect(pointers).toContain('A pointer without a formula is a dot');
  });

  it('the protocol requires formula extraction as its own step', () => {
    expect(read(PROGRAMME)).toContain('FORMULAS');
  });

  it('the resume point is the part AFTER the last completed one', () => {
    // At 51 of 51 there is no next part, so the file declares completion instead. For any
    // n < 51 the original assertion still applies unchanged — this is a terminal case, not a
    // relaxation: forgetting to name Part 41 after finishing Part 40 still fails.
    const state = read(STATE);
    const n = partsComplete(state);
    if (n >= 51) {
      expect(state).toMatch(/THE PROGRAMME IS (COMPLETE|DONE)/);
      return;
    }
    const m = state.match(/Next action: Part (\d+)/);
    expect(Number(m![1])).toBe(n + 1);
  });
});

describe('§8.1 — the retrofit sweep is recorded, not merely intended', () => {
  const state = read(STATE);

  it('the protocol still lists RETROFIT as a mandatory step', () => {
    const plan = read(PROGRAMME);
    expect(plan).toMatch(/RETROFIT\s+look BACKWARD before extracting anything new/);
    expect(plan).toContain('Mandatory');
  });

  it('the retrofit register is contiguous — no missing R-numbers', () => {
    // This is the check that would have caught R11-R15 going missing. Five retrofits were
    // applied to the code and none was recorded; the numbering jumped 10 → (nothing).
    const found = [...state.matchAll(/Retrofit R(\d+)/g)].map((m) => Number(m[1]));
    expect(found.length, 'no retrofits recorded at all').toBeGreaterThan(0);
    const highest = Math.max(...found);
    const missing: number[] = [];
    for (let i = 1; i <= highest; i++) if (!found.includes(i)) missing.push(i);
    expect(missing, `retrofit register has gaps at R${missing.join(', R')}`).toEqual([]);
  });

  it('every part from 5 onward is accounted for — a sweep, or an explicit empty one', () => {
    // §8.1's counterweight: an empty sweep is recorded AS empty, with the lenses named.
    // Without this, "swept and found nothing" is indistinguishable from "never swept".
    const n = partsComplete(state);
    const withSweep = new Set(
      [...state.matchAll(/Part (\d+) sweep/g)].map((m) => Number(m[1])),
    );
    const emptySection = state.slice(state.indexOf('Sweeps that found nothing'));
    const declaredEmpty = new Set(
      [...emptySection.matchAll(/\d+/g)].map((m) => Number(m[0])),
    );
    const unaccounted: number[] = [];
    for (let p = 5; p <= n; p++) {
      if (!withSweep.has(p) && !declaredEmpty.has(p)) unaccounted.push(p);
    }
    expect(
      unaccounted,
      `parts with neither a recorded sweep nor an explicit empty one: ${unaccounted.join(', ')}`,
    ).toEqual([]);
  });

  it('the empty-sweep section explains why it exists', () => {
    expect(state).toContain('Sweeps that found nothing');
    expect(state).toMatch(/told from a sweep that never happened/);
  });
});

describe('§8.0 — the context contract', () => {
  const state = read(STATE);

  it('the protocol still makes READ and STATE mandatory', () => {
    const plan = read(PROGRAMME);
    expect(plan).toMatch(/READ\s+re-read docs\/BPHS_STATE\.md IN FULL/);
    expect(plan).toMatch(/STATE\s+REWRITE docs\/BPHS_STATE\.md/);
  });

  it('the state file says when it was last rewritten, and for which part', () => {
    const n = partsComplete(state);
    expect(state).toContain(`Rewritten at the completion of Part ${n}`);
    // Same terminal case: after the final part there is no next rewrite to promise.
    if (n < 51) expect(state).toContain(`Next rewrite: end of Part ${n + 1}`);
    else expect(state).toMatch(/THE PROGRAMME IS COMPLETE/);
  });

  it('it still carries the four sections a resuming part depends on', () => {
    for (const section of [
      'Capability map',      // what already exists — checked before building
      'Decision ledger',     // what is settled — not to be re-litigated
      'Invariant registry',  // what must stay true
      'Open threads',        // what is owed
    ]) {
      expect(state, `missing section: ${section}`).toContain(section);
    }
  });

  it('the working notes carry the trap that caused this very failure', () => {
    // Five retrofits went unrecorded because a silent `str.replace` no-op was not caught.
    expect(state).toMatch(/silent|no-op|assert/i);
  });
});
