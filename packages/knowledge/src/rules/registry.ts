// ─────────────────────────────────────────────────────────────────────────────
// The rule registry — one list of every encoded rule. Programme Part 20.
//
// This exists because there were briefly two: the calibration test had one list and the
// API route had another, and they had already drifted by ten rules before anyone noticed.
// That is precisely how the ashtakavarga table drifted between packages in Part 13, and
// the fix is the same — have one, not two.
//
// **Every part that adds a rule set adds it here, and nowhere else.**
// ─────────────────────────────────────────────────────────────────────────────

import type { Rule } from './rule.js';
import { karakamsaRules } from '../data/bphs/ch33.js';
import { ch36YogaRules } from '../data/bphs/ch36.js';
import { luminaryYogaRules } from '../data/bphs/ch37-38.js';
import { rajaYogaRules } from '../data/bphs/ch39-40.js';
import { wealthRules } from '../data/bphs/ch41.js';
import { penuryConditionRules } from '../data/bphs/ch42.js';
import { houseLordDashaRules } from '../data/bphs/ch47-48.js';
import { antardasaCellRules } from '../data/bphs/ch52-56.js';
import { antardasaCellRules57 } from '../data/bphs/ch57-60.js';
import { mahapurushaRules } from '../data/bphs/ch75-77.js';
import { asceticYogaRules } from '../data/bphs/ch78-79.js';
import { arishtaCancellationRules } from '../data/bphs/ch09-10-43-44-71.js';
import { houseProsperityRules } from '../data/bphs/ch08-11.js';
import { padaWealthRules, upapadaRules } from '../data/bphs/ch29-31.js';
import { ashtakavargaEffectRules } from '../data/bphs/ch70.js';
import { firstHouseRules, secondHouseRules } from '../data/bphs/ch12-13.js';
import { thirdHouseRules, fourthHouseRules, fifthHouseRules } from '../data/bphs/ch14-16.js';
import { sixthHouseRules, seventhHouseRules, lordConjunctionRules } from '../data/bphs/ch17-18.js';
import { eighthHouseRules, ninthHouseRules, tenthHouseRules } from '../data/bphs/ch19-21.js';
import { eleventhHouseRules, twelfthHouseRules } from '../data/bphs/ch22-23.js';
import { allBhavaLordRules } from '../data/bphs/ch24b.js';
import { upagrahaRules } from '../data/bphs/ch25.js';

/**
 * Every rule the programme has encoded.
 *
 * `houseProsperityRules` is a template instantiated per house. Part 24 expanded it from the
 * 5th alone to all twelve, now that ch 12-23 are encoded — which means eleven twelfths of
 * that template had never been calibrated until then.
 */
export function allEncodedRules(): Rule[] {
  return [
    // All twelve now that ch 12-23 are encoded (Part 24). Previously only the 5th was
    // instantiated, which meant eleven twelfths of this template was never calibrated.
    ...Array.from({ length: 12 }, (_, i) => houseProsperityRules(i + 1)).flat(),
    ...padaWealthRules(),
    ...upapadaRules(),
    ...ashtakavargaEffectRules(),
    // Phase III — one line per part.
    ...firstHouseRules(),
    ...secondHouseRules(),
    ...thirdHouseRules(),
    ...fourthHouseRules(),
    ...fifthHouseRules(),
    ...sixthHouseRules(),
    ...seventhHouseRules(),
    ...lordConjunctionRules(),
    ...eighthHouseRules(),
    ...ninthHouseRules(),
    ...tenthHouseRules(),
    ...eleventhHouseRules(),
    ...twelfthHouseRules(),
    // Parts 25-26 — the bhava lords, all 144 cells. The largest block in the corpus.
    ...allBhavaLordRules(),
    // Part 27's chapter-25 rules, registered in Part 28 once the upagrahas had a home on
    // ChartFacts and in the synthetic population.
    ...upagrahaRules(),
    // Part 29 — chapter 33, counted from the karakamsa. Registered in the SAME part that
    // added the frame to `syntheticCharts`, rather than a part later; the two-part gap the
    // upagrahas went through is the mistake this ordering exists to avoid.
    ...karakamsaRules(),
    // Part 31 — chapter 36's named yogas. The highest-arity set in the corpus; several
    // fire on well under 1% of charts, which is the point of encoding them.
    ...ch36YogaRules(),
    // Part 32 — the luminary yogas (ch 37-38) and the raja yogas (ch 39-40).
    ...luminaryYogaRules(),
    ...rajaYogaRules(),
    // Part 33 — ch 41's wealth combinations, and ch 42's maraka-free resource CONDITIONS.
    ...wealthRules(),
    ...penuryConditionRules(),
    // Part 38 — THE JOIN. The first rules that describe a chart DURING a period, using the
    // `dasha` predicate that has existed unused since Part 1.
    ...houseLordDashaRules(),
    // Part 40 — the join at full width: a placement counted FROM THE DASHA LORD, inside a
    // maha AND an antar period.
    ...antardasaCellRules(),
    ...antardasaCellRules57(),
    // Part 46 — Phase V. The five Pancha Mahapurusha yogas, with 75.1's strength condition.
    ...mahapurushaRules(),
    ...asceticYogaRules(),
    // Part 51 — the last. Chapter 10's antidotes, surfaced without chapter 9's arishta.
    ...arishtaCancellationRules(),
  ];
}

export const REGISTRY_IS_THE_ONLY_LIST =
  'allEncodedRules() is the single list of encoded rules. The calibration guard and the '
  + 'API both read it. Adding a rule set anywhere else means the guard cannot see it, '
  + 'which is how a rule ships unmeasured.';
