// ─────────────────────────────────────────────────────────────────────────────
// BPHS Chapter 6a — The Sixteen Divisions of a Sign, part 1. Programme Part 3.
// Source lines 2041-3100: the varga catalogue and the constructions D1…D24.
//
// HEADLINE RESULT: every construction in this range — D1, D2, D3, D4, D7, D9, D10,
// D12, D16, D20, D24 — **already matches** `vargaSign()` in data/varga.ts exactly.
// Eleven of eleven, no correction needed. That is worth as much as a fix: those
// constructions were previously verified only against the first corpus, and they now
// carry independent confirmation from the older primary source.
//
// What this part adds:
//   • The canonical Shodasavarga — the sixteen BPHS actually names (6.2-4). The codebase
//     computes twenty. D5, D6, D8 and D11 are NOT in BPHS's list; they are legitimate
//     later additions, but a rule citing "the sixteen divisions" means these sixteen.
//   • Start rules as DATA rather than a switch statement, so the construction of every
//     varga is auditable instead of buried in control flow.
//   • Navamsa Deva / Manushya / Rakshasa classification (6.12) — a real predicate, and
//     the one classification in this chapter that carries interpretive weight.
//   • Dasamsa direction lords (6.13-14) — maps a D10 division to a compass direction,
//     which is the classical answer to "which direction should I work in".
//
// Deliberately NOT encoded:
//   • The deity names for D4, D7, D12, D16, D20, D24 (Sanaka…, Kshaara…, Ganesa…,
//     Brahma…, Kaali…, Skanda…). They are nominal — no predicate attaches, and their
//     only classical use is propitiation, which project policy excludes. The D9 and D10
//     classifications ARE kept because they carry meaning beyond a name.
// ─────────────────────────────────────────────────────────────────────────────

import type { SignIndex } from '../../types.js';

const mod12 = (n: number): number => ((n % 12) + 12) % 12;

/** 0 movable · 1 fixed · 2 dual. */
const modality = (sign: SignIndex): number => mod12(sign) % 3;
/** Odd rasi = Aries, Gemini, Leo… (0-indexed even). */
const isOddSign = (sign: SignIndex): boolean => mod12(sign) % 2 === 0;

// ── 6.2-4 The canonical sixteen ───────────────────────────────────────────────

/**
 * The Shodasavarga — the sixteen divisions BPHS names at 6.2-4, in the order given.
 *
 * `vargaSign()` supports twenty divisors. The four extras (D5 Panchamsa, D6 Shashthamsa,
 * D8 Ashtamsa, D11 Rudramsa) come from the later tradition, not from this list. They are
 * not wrong — but a rule that cites "the sixteen divisions" means precisely these, and
 * Vimsopaka bala (Programme Part 5) is computed over subsets of this list, never over
 * the twenty.
 */
export const SHODASAVARGA = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60] as const;

/** Divisors the codebase computes that are NOT in BPHS's sixteen. */
export const NON_BPHS_DIVISORS = [5, 6, 8, 11] as const;

export const isShodasavarga = (divisor: number): boolean =>
  (SHODASAVARGA as readonly number[]).includes(divisor);

// ── Start rules as data ───────────────────────────────────────────────────────

/**
 * How a division's counting begins, per BPHS. Expressed as data so the construction is
 * checkable — `vargaSign()` encodes the same thing as a switch, and the test suite
 * asserts the two agree for every division and every sign.
 *
 *  • `same`     — counting starts from the sign itself
 *  • `oddEven`  — one start for odd signs, another for even
 *  • `modality` — one start each for movable / fixed / dual
 *  • `fixed`    — always the same sign, regardless
 *
 * Offsets are relative to the sign in question; absolute values are sign indices.
 */
export type VargaStartRule =
  | { kind: 'same' }
  | { kind: 'oddEven'; oddOffset: number; evenOffset: number }
  | { kind: 'modalityAbs'; movable: SignIndex; fixed: SignIndex; dual: SignIndex }
  | { kind: 'modalityOffset'; movable: number; fixed: number; dual: number }
  | { kind: 'oddEvenAbs'; odd: SignIndex; even: SignIndex }
  | { kind: 'special'; note: string };

export const VARGA_START: Record<number, { name: string; verse: string; rule: VargaStartRule }> = {
  1: { name: 'Rasi', verse: '6.5', rule: { kind: 'same' } },
  2: {
    name: 'Hora', verse: '6.5-6',
    rule: { kind: 'special', note: 'Odd sign: first half is the Sun\'s hora (Leo), second the Moon\'s (Cancer). Reversed for an even sign.' },
  },
  3: { name: 'Drekkana', verse: '6.7-8', rule: { kind: 'modalityOffset', movable: 0, fixed: 0, dual: 0 } },
  4: { name: 'Chaturthamsa', verse: '6.9', rule: { kind: 'same' } },
  7: { name: 'Saptamsa', verse: '6.10-11', rule: { kind: 'oddEven', oddOffset: 0, evenOffset: 6 } },
  9: { name: 'Navamsa', verse: '6.12', rule: { kind: 'modalityOffset', movable: 0, fixed: 8, dual: 4 } },
  10: { name: 'Dasamsa', verse: '6.13-14', rule: { kind: 'oddEven', oddOffset: 0, evenOffset: 8 } },
  12: { name: 'Dwadasamsa', verse: '6.15', rule: { kind: 'same' } },
  16: { name: 'Shodasamsa', verse: '6.16', rule: { kind: 'modalityAbs', movable: 0, fixed: 4, dual: 8 } },
  20: { name: 'Vimsamsa', verse: '6.17-21', rule: { kind: 'modalityAbs', movable: 0, fixed: 8, dual: 4 } },
  24: { name: 'Siddhamsa', verse: '6.22-23', rule: { kind: 'oddEvenAbs', odd: 4, even: 3 } },
};

/**
 * The sign a division's counting starts from, per the rule above.
 * D2 and D3 are handled by their own functions — the Hora returns a lord's sign rather
 * than a running count, and the Drekkana steps by 4 rather than by 1.
 */
export function vargaStartSign(divisor: number, sign: SignIndex): SignIndex | null {
  const spec = VARGA_START[divisor];
  if (!spec) return null;
  const s = mod12(sign);
  switch (spec.rule.kind) {
    case 'same': return s;
    case 'oddEven': return mod12(s + (isOddSign(s) ? spec.rule.oddOffset : spec.rule.evenOffset));
    case 'oddEvenAbs': return isOddSign(s) ? spec.rule.odd : spec.rule.even;
    case 'modalityOffset': {
      const off = [spec.rule.movable, spec.rule.fixed, spec.rule.dual][modality(s)]!;
      return mod12(s + off);
    }
    case 'modalityAbs':
      return [spec.rule.movable, spec.rule.fixed, spec.rule.dual][modality(s)]!;
    default: return null;
  }
}

// ── 6.5-6 Hora, framed as a lord ──────────────────────────────────────────────

/**
 * The lord of a hora (6.5-6). `vargaSign()` returns the SIGN (Leo or Cancer); BPHS
 * frames it as a LORD, which is how the wealth reading actually uses it — a planet in
 * the Sun's hora and one in the Moon's hora are read differently regardless of sign.
 */
export function horaLord(sign: SignIndex, degInSign: number): 'sun' | 'moon' {
  const firstHalf = degInSign < 15;
  return isOddSign(sign) === firstHalf ? 'sun' : 'moon';
}

// ── 6.12 Navamsa class ────────────────────────────────────────────────────────

/** Divine, human or devilish — the character of a navamsa (6.12). */
export type NavamsaClass = 'deva' | 'manushya' | 'rakshasa';

export const NAVAMSA_CLASS_CYCLE: NavamsaClass[] = ['deva', 'manushya', 'rakshasa'];

export const NAVAMSA_CLASS_MEANING: Record<NavamsaClass, string> = {
  deva: 'divine — refined, benevolent, oriented upward',
  manushya: 'human — mixed, ordinary, worldly',
  rakshasa: 'devilish — forceful, appetitive, hard-edged',
};

/**
 * The class of the navamsa a longitude falls in (6.12).
 *
 * Movable signs start at Deva, fixed at Manushya, dual at Rakshasa; the cycle then runs
 * Deva → Manushya → Rakshasa.
 *
 * DISCREPANCY, recorded rather than smoothed: the verse gives movable as
 * "Deva, Manushya, Rakshasa" and fixed as "Manushya, Rakshasa, Deva" — both consistent
 * with a simple rotation — but then gives dual as "Rakshasa, Manushya, Deva", where the
 * rotation would give "Rakshasa, Deva, Manushya". Two of the three stated orders fit the
 * rotation and one does not. The rotation is implemented, because a scheme that is
 * regular in two cases out of three and irregular in the third is far more likely to be
 * a transcription slip in the odd one than a genuine rule. Flagged so a later part can
 * revisit it against a second edition.
 */
export function navamsaClass(sign: SignIndex, degInSign: number): NavamsaClass {
  const part = Math.min(8, Math.floor(degInSign / (30 / 9)));
  return NAVAMSA_CLASS_CYCLE[(modality(sign) + part) % 3]!;
}

export const NAVAMSA_CLASS_NOTE =
  'BPHS 6.12 states the dual-sign order as Rakshasa/Manushya/Deva, where a rotation '
  + 'gives Rakshasa/Deva/Manushya. The rotation is implemented; see the JSDoc for why.';

// ── 6.13-14 Dasamsa directions ────────────────────────────────────────────────

/**
 * The ten direction-rulers of the dasamsas (6.13-14), in order for an odd sign and
 * reversed for an even one.
 *
 * This is the chapter's most directly usable output: D10 is the career chart, and these
 * attach a COMPASS DIRECTION to a career division. Read alongside dig bala from ch 3
 * (Programme Part 1), it answers "which direction should I work or settle in" from two
 * independent methods.
 */
export const DASAMSA_DIRECTION_LORDS = [
  { lord: 'Indra', direction: 'east' },
  { lord: 'Agni', direction: 'south-east' },
  { lord: 'Yama', direction: 'south' },
  { lord: 'Nirriti', direction: 'south-west' },
  { lord: 'Varuna', direction: 'west' },
  { lord: 'Vayu', direction: 'north-west' },
  { lord: 'Kubera', direction: 'north' },
  { lord: 'Isana', direction: 'north-east' },
  { lord: 'Brahma', direction: 'zenith' },
  { lord: 'Ananta', direction: 'nadir' },
] as const;

export interface DasamsaRuler { index: number; lord: string; direction: string }

/** The direction-lord of the dasamsa a longitude falls in (6.13-14). */
export function dasamsaRuler(sign: SignIndex, degInSign: number): DasamsaRuler {
  const part = Math.min(9, Math.floor(degInSign / 3));
  const index = isOddSign(sign) ? part : 9 - part;
  const r = DASAMSA_DIRECTION_LORDS[index]!;
  return { index, lord: r.lord, direction: r.direction };
}

// ── 6.7-8 Drekkana rulers ─────────────────────────────────────────────────────

/**
 * The three decanate sages (6.7-8). Kept — unlike the other deity lists — because the
 * decanate a planet occupies is routinely cited by these names in later chapters, so a
 * rule referring to "the Doorvasa decanate" needs the mapping to resolve.
 */
export const DREKKANA_SAGES = ['Narada', 'Agasthya', 'Doorvasa'] as const;

export function drekkanaSage(degInSign: number): string {
  return DREKKANA_SAGES[Math.min(2, Math.floor(degInSign / 10))]!;
}
