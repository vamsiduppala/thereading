// ─────────────────────────────────────────────────────────────────────────────
// The depth gate: which daśā levels the app works at.
//
// Three. major (mahādaśā), sub (antardaśā), micro (pratyantardaśā). The tree
// has five, and the engine computes all five, but the two below the micro period are not shown,
// not named and not answered on.
//
// That is not caution, it is the arithmetic in `uncertainty.ts`. A birth time is stated to
// the minute, and one minute of slack moves EVERY boundary in the 120-year tree by up to
// five days — an error that never averages out and never shrinks as you go deeper, while
// the periods themselves get shorter and shorter:
//
//   major   6–20 years     ±5 days is noise
//   sub     months–years   ±5 days is noise
//   micro   weeks–months   ±5 days is a real edge, still a period you can name
//   fine    days–weeks     ±5 days is a large fraction of the whole term
//   flash   hours–days     ±5 days is longer than the term itself
//
// So the line falls under the micro period: above it a period can be stated as fact, below
// it the app would be pointing at a planet it cannot actually vouch for. Three is also
// simply enough to act on — a fourth and fifth tier is detail nobody plans around.
//
// It lives in the engine, not in a client, because there are three callers and they must
// not disagree:
//
//   - the app's rings, period list and daśā detail pages
//   - the Mentor gateway's system prompt and tools (a model asked "what's my flash period
//     doing next week" must refuse at the same depth the UI refuses)
//   - notification scheduling, which must never fire on a boundary it cannot locate
//
// It was previously a function inside apps/vim. That was fine while the UI was the only
// consumer and became a correctness risk the moment the server needed the same answer:
// two copies of a safety rule is one copy of a safety rule and one bug waiting.
// ─────────────────────────────────────────────────────────────────────────────

import type { BirthTimeAccuracy } from '../types.js';

/**
 * What the engine assumes about a birth time the user typed: right to the minute it names.
 *
 * Deliberately **not** `'exact'`. `'exact'` in `BirthTimeAccuracy` means to the second, and
 * no birth record holds seconds — claiming it would understate the ± that `uncertainty.ts`
 * reports on every boundary. `'near_minute'` is the honest reading of "06:12".
 */
export const STATED_TIME_ACCURACY: BirthTimeAccuracy = 'near_minute';

/**
 * What a level is allowed to do on screen and in prose.
 *
 * - `solid`  — state the planet and the dates as fact.
 * - `hidden` — do not render, do not mention, do not let a tool return it.
 *
 * There is deliberately no middle value. A period shown with a caveat is still a period the
 * user reads, remembers and plans around; if it cannot be stated, it is not shown.
 */
export type RingVisibility = 'solid' | 'hidden';

/** The deepest level the app works at: 3, the micro period (pratyantardaśā). */
export const DEEPEST_LEVEL = 3;

/**
 * What each level (1 = Mahādaśā … 5 = Prāṇadaśā) may claim.
 *
 * Anything outside 1–3 is `hidden`, including levels outside the tree entirely — a level
 * that does not exist cannot be rendered.
 */
export function visibilityFor(level: number): RingVisibility {
  if (!Number.isInteger(level) || level < 1 || level > DEEPEST_LEVEL) return 'hidden';
  return 'solid';
}

/**
 * The deepest level that may be stated as fact — i.e. the last `solid` one.
 *
 * Derived from `visibilityFor` rather than restated, so the two can never drift apart.
 */
export function deepestTrustworthyLevel(): 1 | 2 | 3 | 4 | 5 {
  let deepest: 1 | 2 | 3 | 4 | 5 = 1;
  for (const level of [1, 2, 3, 4, 5] as const) {
    if (visibilityFor(level) === 'solid') deepest = level;
  }
  return deepest;
}

/** Every level a caller is allowed to render or return. */
export const visibleLevels = (): (1 | 2 | 3 | 4 | 5)[] =>
  ([1, 2, 3, 4, 5] as const).filter((l) => visibilityFor(l) !== 'hidden');
