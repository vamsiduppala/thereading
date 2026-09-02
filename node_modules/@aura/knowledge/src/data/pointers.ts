// The pointer catalogue — every question this engine can be asked, as a tree.
//
// **GENERATED from docs/PREDICTION_POINTERS.md. Do not edit by hand.**
// Regenerate when the doc changes; the doc is the source of truth and this is its index.
//
// The doc is 1,986 lines and is the living record of what the engine answers, at what
// resolution, through which route. Hand-copying 175 pointers would be stale within a week and
// the drift would be invisible — which is exactly the failure this file exists to prevent.
//
// Three levels, as the doc has them: section (11) -> group (25) -> pointer (175).
//
// `status` is the doc's own glyph:
//   ready    the engine answers this today
//   partial  answerable, but assembled from parts rather than a single route
//   planned  named and not yet built. NEVER improvise one of these.
//   refused  permanently not answered. Policy, not capability.

export type PointerStatus = 'ready' | 'partial' | 'planned' | 'refused';

export interface Pointer {
  /** '2.2.3' — stable, and the anchor back into the doc. */
  id: string;
  title: string;
  status: PointerStatus;
  /** The API routes that answer it, verbatim from the doc. */
  routes: string[];
  /** The HONEST resolution of the answer. Never state one finer than this. */
  precision: string | null;
}

export interface PointerGroup {
  id: string;
  title: string;
  status: PointerStatus;
  pointers: Pointer[];
}

export interface PointerSection {
  /** '2' */
  id: string;
  title: string;
  groups: PointerGroup[];
}

export const POINTER_TREE: PointerSection[] = [
  {
    "id": "1",
    "title": "Self, Body & Identity",
    "groups": [
      {
        "id": "1.1",
        "title": "Core constitution",
        "status": "ready",
        "pointers": [
          {
            "id": "1.1.1",
            "title": "Rising sign and its ruler",
            "status": "ready",
            "routes": [
              "POST /kundali"
            ],
            "precision": null
          },
          {
            "id": "1.1.2",
            "title": "Which planets help you specifically",
            "status": "ready",
            "routes": [
              "GET /functional-nature/:lagna"
            ],
            "precision": null
          },
          {
            "id": "1.1.3",
            "title": "Chart shape (Nabhasa)",
            "status": "ready",
            "routes": [
              "POST /bphs/35/nabhasa",
              "POST /kundali"
            ],
            "precision": null
          },
          {
            "id": "1.1.4",
            "title": "Soul significator (Atmakaraka)",
            "status": "ready",
            "routes": [
              "POST /karakas/chara"
            ],
            "precision": null
          },
          {
            "id": "1.1.5",
            "title": "Karakamsa — the soul's declared theme",
            "status": "ready",
            "routes": [
              "POST /bphs/33/reading"
            ],
            "precision": null
          },
          {
            "id": "1.1.6",
            "title": "Pancha Mahapurusha yogas P46 (ch 75)",
            "status": "planned",
            "routes": [
              "POST /arudhas"
            ],
            "precision": null
          },
          {
            "id": "1.1.7",
            "title": "Public image vs private self — vs lagna",
            "status": "ready",
            "routes": [
              "POST /arudhas"
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "1.2",
        "title": "How strong is each part of the chart",
        "status": "ready",
        "pointers": [
          {
            "id": "1.2.1",
            "title": "Degree-bounded dignity",
            "status": "ready",
            "routes": [
              "GET /bphs/dignity-band?graha=&sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "1.2.2",
            "title": "Closeness to deep exaltation",
            "status": "ready",
            "routes": [
              "GET /bphs/exaltation?graha=&longitude="
            ],
            "precision": null
          },
          {
            "id": "1.2.3",
            "title": "Effect ratio — how much of its good a planet delivers",
            "status": "ready",
            "routes": [
              "GET /bphs/effect-ratio?dignity=",
              "GET /bphs/relation?from=&to="
            ],
            "precision": null
          },
          {
            "id": "1.2.4",
            "title": "Natural relationship, derived not tabled",
            "status": "ready",
            "routes": [
              "GET /bphs/relation?from=&to="
            ],
            "precision": null
          },
          {
            "id": "1.2.5",
            "title": "Compound (five-fold) relationship",
            "status": "ready",
            "routes": [],
            "precision": null
          },
          {
            "id": "1.2.6",
            "title": "Strength seeds — naisargika, dig, day/night",
            "status": "ready",
            "routes": [
              "GET /bphs/strength-seeds",
              "GET /bphs/varga-schemes",
              "POST /bphs/varga-classify"
            ],
            "precision": null
          },
          {
            "id": "1.2.6a",
            "title": "Varga classification — how good is a planet across the divisions",
            "status": "ready",
            "routes": [
              "GET /bphs/varga-schemes",
              "POST /bphs/varga-classify"
            ],
            "precision": null
          },
          {
            "id": "1.2.7",
            "title": "Full six-fold Shadbala in rupas for the six formulas",
            "status": "ready",
            "routes": [
              "GET /bphs/vimsopaka"
            ],
            "precision": null
          },
          {
            "id": "1.2.8",
            "title": "Ishta / Kashta phala — benefic vs malefic capacity",
            "status": "ready",
            "routes": [
              "GET /bphs/vimsopaka"
            ],
            "precision": null
          },
          {
            "id": "1.2.9",
            "title": "Vimsopaka bala across the divisionals",
            "status": "ready",
            "routes": [
              "GET /bphs/vimsopaka"
            ],
            "precision": null
          },
          {
            "id": "1.2.10",
            "title": "Bhava bala — can a house deliver at all",
            "status": "ready",
            "routes": [
              "GET /bphs/bhava-bala",
              "GET /grahas/:key",
              "GET /bphs/limbs?lagnaSign="
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "1.3",
        "title": "Body and health",
        "status": "partial",
        "pointers": [
          {
            "id": "1.3.1",
            "title": "Which tissue each planet rules",
            "status": "ready",
            "routes": [
              "GET /grahas/:key",
              "GET /bphs/limbs?lagnaSign="
            ],
            "precision": null
          },
          {
            "id": "1.3.2",
            "title": "Which limb a house or sign governs, for THIS chart",
            "status": "ready",
            "routes": [
              "GET /bphs/limbs?lagnaSign=",
              "GET /bphs/sign-class?sign="
            ],
            "precision": null
          },
          {
            "id": "1.3.3",
            "title": "Constitutional humour by sign",
            "status": "ready",
            "routes": [
              "GET /bphs/sign-class?sign="
            ],
            "precision": null
          },
          {
            "id": "1.3.4",
            "title": "Constitutional balance P46 (ch 76, five elements)",
            "status": "planned",
            "routes": [],
            "precision": null
          },
          {
            "id": "1.3.5",
            "title": "Disease timing — ch 17's 6th-house corpus (P22); no medical claim is surfaced",
            "status": "partial",
            "routes": [],
            "precision": null
          },
          {
            "id": "1.3.6",
            "title": "Longevity, terminal illness Never surfaced. Computed for internal",
            "status": "refused",
            "routes": [],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "2",
    "title": "Love & Partnership",
    "groups": [
      {
        "id": "2.1",
        "title": "What a partner is to you",
        "status": "ready",
        "pointers": [
          {
            "id": "2.1.1",
            "title": "7th house, its lord and occupants",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "POST /karakas/chara"
            ],
            "precision": null
          },
          {
            "id": "2.1.2",
            "title": "Darakaraka — the spouse significator",
            "status": "ready",
            "routes": [
              "POST /karakas/chara",
              "POST /arudhas"
            ],
            "precision": null
          },
          {
            "id": "2.1.3",
            "title": "Upapada Lagna — the image of marriage",
            "status": "ready",
            "routes": [
              "POST /arudhas"
            ],
            "precision": null
          },
          {
            "id": "2.1.4",
            "title": "The spouse read from the 7th FROM Venus",
            "status": "ready",
            "routes": [
              "POST /bphs/32/karaka-frames"
            ],
            "precision": null
          },
          {
            "id": "2.1.5",
            "title": "2nd from UL — what sustains a marriage , count 2 from",
            "status": "ready",
            "routes": [
              "POST /arudhas",
              "POST /arudhas",
              "GET /vargas?longitude="
            ],
            "precision": null
          },
          {
            "id": "2.1.6",
            "title": "Dara pada (A7) — how the partner is perceived",
            "status": "ready",
            "routes": [
              "POST /arudhas",
              "GET /vargas?longitude=",
              "GET /bphs/navamsa-class?sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "2.1.7",
            "title": "D9 navamsa — the marriage division",
            "status": "ready",
            "routes": [
              "GET /vargas?longitude=",
              "GET /bphs/navamsa-class?sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "2.1.7a",
            "title": "Is that navamsa divine, human or devilish?",
            "status": "ready",
            "routes": [
              "GET /bphs/navamsa-class?sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "2.1.8",
            "title": "Vivaha & preeti sahams",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams"
            ],
            "precision": null
          },
          {
            "id": "2.1.9",
            "title": "7th-house strength (SAV)",
            "status": "ready",
            "routes": [
              "POST /ashtakavarga",
              "POST /bphs/rules/fire",
              "POST /bphs/37-40/yogas"
            ],
            "precision": "weeks–months"
          },
          {
            "id": "2.1.10",
            "title": "Ch 18 rule corpus — 7th house effects",
            "status": "ready",
            "routes": [
              "POST /bphs/rules/fire",
              "POST /bphs/37-40/yogas",
              "GET /dasha/vimshottari?moonLong="
            ],
            "precision": "weeks–months"
          },
          {
            "id": "2.1.11",
            "title": "Raja yogas involving the 7th",
            "status": "ready",
            "routes": [
              "POST /bphs/37-40/yogas",
              "GET /dasha/vimshottari?moonLong=",
              "GET /bphs/marriage-timing"
            ],
            "precision": "weeks–months"
          }
        ]
      },
      {
        "id": "2.2",
        "title": "When",
        "status": "partial",
        "pointers": [
          {
            "id": "2.2.1",
            "title": "Which dasha activates partnership — +",
            "status": "partial",
            "routes": [
              "GET /dasha/vimshottari?moonLong=",
              "GET /bphs/marriage-timing"
            ],
            "precision": "weeks–months"
          },
          {
            "id": "2.2.2",
            "title": "Jupiter/Saturn transit to the 7th — engine , sampled",
            "status": "partial",
            "routes": [
              "GET /bphs/marriage-timing"
            ],
            "precision": "days"
          },
          {
            "id": "2.2.3",
            "title": "Marriage-age indications",
            "status": "ready",
            "routes": [
              "GET /bphs/marriage-timing"
            ],
            "precision": "days, ±2"
          },
          {
            "id": "2.2.4",
            "title": "Antardasha effects per maha/antar pair P40–P41 (ch 52–60)",
            "status": "planned",
            "routes": [
              "GET /bphs/time-unit?graha="
            ],
            "precision": "days, ±2"
          },
          {
            "id": "2.2.5",
            "title": "Pratyantar precision P42–P43 (ch 61) · precision: days, ±2",
            "status": "planned",
            "routes": [
              "GET /bphs/time-unit?graha="
            ],
            "precision": "days, ±2"
          },
          {
            "id": "2.2.6",
            "title": "Event maturity horizon",
            "status": "ready",
            "routes": [
              "GET /bphs/time-unit?graha="
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "2.3",
        "title": "Compatibility between two people",
        "status": "planned",
        "pointers": [
          {
            "id": "2.3.1",
            "title": "Kuta / Ashtakoota matching NOT IN CORPUS YET",
            "status": "planned",
            "routes": [],
            "precision": null
          },
          {
            "id": "2.3.2",
            "title": "Chart-to-chart house overlay needs 2.3.1 first",
            "status": "planned",
            "routes": [
              "POST /bphs/33/reading"
            ],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "3",
    "title": "Career & Vocation",
    "groups": [
      {
        "id": "3.1",
        "title": "What work suits you",
        "status": "ready",
        "pointers": [
          {
            "id": "3.1.1",
            "title": "Aptitude from the karakamsa",
            "status": "ready",
            "routes": [
              "POST /bphs/33/reading"
            ],
            "precision": null
          },
          {
            "id": "3.1.2",
            "title": "10th house, lord, occupants",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "GET /varga?longitude=&divisor=10",
              "POST /karakas/chara"
            ],
            "precision": null
          },
          {
            "id": "3.1.3",
            "title": "D10 dasamsa",
            "status": "ready",
            "routes": [
              "GET /varga?longitude=&divisor=10",
              "POST /karakas/chara",
              "POST /arudhas"
            ],
            "precision": null
          },
          {
            "id": "3.1.4",
            "title": "Amatyakaraka — the career karaka",
            "status": "ready",
            "routes": [
              "POST /karakas/chara",
              "POST /arudhas",
              "POST /tajaka/sahams"
            ],
            "precision": null
          },
          {
            "id": "3.1.5",
            "title": "Karma pada (A10) — professional reputation",
            "status": "ready",
            "routes": [
              "POST /arudhas",
              "POST /tajaka/sahams",
              "GET /bphs/dig-bala"
            ],
            "precision": null
          },
          {
            "id": "3.1.6",
            "title": "Karma saham — formula shape in 2.1.8",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams",
              "GET /bphs/dig-bala",
              "GET /bphs/dasamsa-direction?sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "3.1.7",
            "title": "Dig bala — which planet is strong at the top of the chart",
            "status": "ready",
            "routes": [
              "GET /bphs/dig-bala",
              "GET /bphs/dasamsa-direction?sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "3.1.8",
            "title": "Which direction should I work in?",
            "status": "ready",
            "routes": [
              "GET /bphs/dasamsa-direction?sign=&degree=",
              "GET /bphs/34/yoga-karaka/:lagna"
            ],
            "precision": null
          },
          {
            "id": "3.1.9",
            "title": "Ch 21 rule corpus — 10th house effects",
            "status": "ready",
            "routes": [
              "GET /bphs/34/yoga-karaka/:lagna",
              "POST /kundali",
              "GET /tajaka/muntha?lagnaSign=&year="
            ],
            "precision": "days"
          },
          {
            "id": "3.1.10",
            "title": "Yoga karakas — formula in 1.1.2",
            "status": "ready",
            "routes": [
              "GET /bphs/34/yoga-karaka/:lagna",
              "POST /kundali",
              "GET /tajaka/muntha?lagnaSign=&year="
            ],
            "precision": "days"
          }
        ]
      },
      {
        "id": "3.2",
        "title": "Career timing",
        "status": "partial",
        "pointers": [
          {
            "id": "3.2.1",
            "title": "Dasha lord's relation to the 10th — engine +",
            "status": "partial",
            "routes": [
              "POST /kundali",
              "GET /tajaka/muntha?lagnaSign=&year="
            ],
            "precision": "days"
          },
          {
            "id": "3.2.2",
            "title": "Saturn transit to the 10th — engine · precision: days",
            "status": "partial",
            "routes": [
              "GET /tajaka/muntha?lagnaSign=&year=",
              "POST /bphs/37-40/yogas"
            ],
            "precision": "days"
          },
          {
            "id": "3.2.3",
            "title": "Annual chart (Varshaphal) muntha",
            "status": "ready",
            "routes": [
              "GET /tajaka/muntha?lagnaSign=&year=",
              "POST /bphs/37-40/yogas"
            ],
            "precision": null
          },
          {
            "id": "3.2.4",
            "title": "Dasha-bound career effects P38 (ch 48)",
            "status": "planned",
            "routes": [
              "POST /bphs/37-40/yogas"
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "3.3",
        "title": "Status, rank, recognition",
        "status": "ready",
        "pointers": [
          {
            "id": "3.3.1",
            "title": "Raja yogas — capacity for elevation",
            "status": "ready",
            "routes": [
              "POST /bphs/37-40/yogas"
            ],
            "precision": null
          },
          {
            "id": "3.3.2",
            "title": "The exaltation ladder — same route",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams"
            ],
            "precision": null
          },
          {
            "id": "3.3.3",
            "title": "Rajya saham",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams"
            ],
            "precision": null
          },
          {
            "id": "3.3.4",
            "title": "⚠️ The two chapters disagree on how an angle and a trine lord relate",
            "status": "ready",
            "routes": [],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "4",
    "title": "Wealth & Resources",
    "groups": [
      {
        "id": "4.1",
        "title": "Capacity to accumulate",
        "status": "partial",
        "pointers": [
          {
            "id": "4.1.1",
            "title": "2nd and 11th houses",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "GET /varga?divisor=2",
              "GET /bphs/hora-lord?sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "4.1.2",
            "title": "D2 hora",
            "status": "ready",
            "routes": [
              "GET /varga?divisor=2",
              "GET /bphs/hora-lord?sign=&degree=",
              "POST /bphs/37-40/yogas"
            ],
            "precision": null
          },
          {
            "id": "4.1.2a",
            "title": "Sun's hora or Moon's hora",
            "status": "ready",
            "routes": [
              "GET /bphs/hora-lord?sign=&degree=",
              "POST /bphs/37-40/yogas"
            ],
            "precision": null
          },
          {
            "id": "4.1.3",
            "title": "Dhana yoga from the Moon",
            "status": "ready",
            "routes": [
              "POST /bphs/37-40/yogas"
            ],
            "precision": null
          },
          {
            "id": "4.1.4",
            "title": "Adhi yoga — same route",
            "status": "ready",
            "routes": [],
            "precision": null
          },
          {
            "id": "4.1.5",
            "title": "Sunapha / Anapha / Duradhara — same route",
            "status": "ready",
            "routes": [
              "GET /bphs/41/wealth",
              "POST /bphs/41-42/reading"
            ],
            "precision": null
          },
          {
            "id": "4.1.6",
            "title": "Combinations for wealth",
            "status": "ready",
            "routes": [
              "GET /bphs/41/wealth",
              "POST /bphs/41-42/reading"
            ],
            "precision": null
          },
          {
            "id": "4.1.6a",
            "title": "What a lord's divisional designation means — same route",
            "status": "ready",
            "routes": [],
            "precision": null
          },
          {
            "id": "4.1.7",
            "title": "Resource conditions (ch 42)",
            "status": "partial",
            "routes": [
              "GET /bphs/42/resource-conditions"
            ],
            "precision": null
          },
          {
            "id": "4.1.8",
            "title": "Aggregate Ashtakavarga on wealth houses",
            "status": "ready",
            "routes": [
              "POST /ashtakavarga",
              "GET /transits/sodhya-timing?rekhas=&pinda="
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "4.2",
        "title": "Wealth timing",
        "status": "partial",
        "pointers": [
          {
            "id": "4.2.1",
            "title": "11th-lord dasha periods — engine",
            "status": "partial",
            "routes": [
              "GET /transits/sodhya-timing?rekhas=&pinda=",
              "GET /bphs/av-trigger?bindus="
            ],
            "precision": null
          },
          {
            "id": "4.2.2",
            "title": "Sodhya pinda timing",
            "status": "ready",
            "routes": [
              "GET /transits/sodhya-timing?rekhas=&pinda=",
              "GET /bphs/av-trigger?bindus="
            ],
            "precision": null
          },
          {
            "id": "4.2.3",
            "title": "Effects keyed to bindu counts",
            "status": "ready",
            "routes": [
              "GET /bphs/av-trigger?bindus="
            ],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "5",
    "title": "Children & Creativity",
    "groups": [
      {
        "id": "5.1",
        "title": "Children",
        "status": "partial",
        "pointers": [
          {
            "id": "5.1.1",
            "title": "5th house, lord, occupants",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "GET /varga?divisor=7",
              "POST /karakas/chara"
            ],
            "precision": null
          },
          {
            "id": "5.1.2",
            "title": "D7 saptamsa",
            "status": "ready",
            "routes": [
              "GET /varga?divisor=7",
              "POST /karakas/chara",
              "POST /tajaka/sahams"
            ],
            "precision": null
          },
          {
            "id": "5.1.3",
            "title": "Putrakaraka — the sixth chara rank (1.1.4)",
            "status": "ready",
            "routes": [
              "POST /karakas/chara",
              "POST /tajaka/sahams",
              "GET /bphs/child-timing"
            ],
            "precision": null
          },
          {
            "id": "5.1.4",
            "title": "Putra saham — shape in 2.1.8",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams",
              "GET /bphs/child-timing",
              "POST /arudhas"
            ],
            "precision": null
          },
          {
            "id": "5.1.5",
            "title": "Ch 16 rule corpus — 5th house effects",
            "status": "ready",
            "routes": [
              "GET /bphs/child-timing",
              "POST /arudhas",
              "POST /bphs/32/karaka-frames"
            ],
            "precision": null
          },
          {
            "id": "5.1.6",
            "title": "Child-timing indications",
            "status": "ready",
            "routes": [
              "GET /bphs/child-timing",
              "POST /arudhas",
              "POST /bphs/32/karaka-frames"
            ],
            "precision": null
          },
          {
            "id": "5.1.7",
            "title": "Mantra pada (A5)",
            "status": "ready",
            "routes": [
              "POST /arudhas",
              "POST /bphs/32/karaka-frames",
              "POST /kundali"
            ],
            "precision": null
          },
          {
            "id": "5.1.8",
            "title": "Children read from the 5th FROM Jupiter",
            "status": "ready",
            "routes": [
              "POST /bphs/32/karaka-frames",
              "POST /kundali"
            ],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "6",
    "title": "Home, Family & Property",
    "groups": [
      {
        "id": "6",
        "title": "Home, Family & Property",
        "status": "ready",
        "pointers": [
          {
            "id": "6.1",
            "title": "4th house, lord, occupants",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "GET /varga?divisor=4",
              "GET /varga?divisor=12"
            ],
            "precision": null
          },
          {
            "id": "6.2",
            "title": "D4 chaturthamsa",
            "status": "ready",
            "routes": [
              "GET /varga?divisor=4",
              "GET /varga?divisor=12",
              "POST /karakas/chara"
            ],
            "precision": null
          },
          {
            "id": "6.3",
            "title": "D12 — parents and inheritance",
            "status": "ready",
            "routes": [
              "GET /varga?divisor=12",
              "POST /karakas/chara",
              "POST /bphs/32/karaka-frames"
            ],
            "precision": null
          },
          {
            "id": "6.4",
            "title": "Matri / Pitri karakas",
            "status": "ready",
            "routes": [
              "POST /karakas/chara",
              "POST /bphs/32/karaka-frames",
              "POST /arudhas"
            ],
            "precision": null
          },
          {
            "id": "6.4a",
            "title": "The father, read from the 9th FROM the Sun",
            "status": "ready",
            "routes": [
              "POST /bphs/32/karaka-frames",
              "POST /arudhas",
              "GET /varga?divisor=16"
            ],
            "precision": null
          },
          {
            "id": "6.4b",
            "title": "The mother, read from the 4th FROM the Moon — same route (BPHS 32.22-24)",
            "status": "ready",
            "routes": [
              "POST /arudhas",
              "GET /varga?divisor=16",
              "GET /bphs/32/karakas"
            ],
            "precision": null
          },
          {
            "id": "6.4c",
            "title": "Maternal relatives — the 6th from Mercury — same route",
            "status": "ready",
            "routes": [
              "POST /arudhas",
              "GET /varga?divisor=16",
              "GET /bphs/32/karakas"
            ],
            "precision": null
          },
          {
            "id": "6.5",
            "title": "Sukha pada (A4)",
            "status": "ready",
            "routes": [
              "POST /arudhas",
              "GET /varga?divisor=16",
              "GET /bphs/32/karakas"
            ],
            "precision": null
          },
          {
            "id": "6.6",
            "title": "Vehicles and comforts — D16",
            "status": "ready",
            "routes": [
              "GET /varga?divisor=16",
              "GET /bphs/32/karakas"
            ],
            "precision": null
          },
          {
            "id": "6.7",
            "title": "Ch 15 rule corpus — 4th house effects",
            "status": "ready",
            "routes": [
              "GET /bphs/32/karakas"
            ],
            "precision": null
          },
          {
            "id": "6.8",
            "title": "Which book's significators?",
            "status": "partial",
            "routes": [
              "GET /bphs/32/karakas"
            ],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "7",
    "title": "Moving Out, Travel & Relocation",
    "groups": [
      {
        "id": "7.1",
        "title": "Leaving home / relocating",
        "status": "partial",
        "pointers": [
          {
            "id": "7.1.1",
            "title": "4th house (roots) vs 12th (foreign, distance)",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "POST /kundali",
              "POST /kundali"
            ],
            "precision": null
          },
          {
            "id": "7.1.2",
            "title": "3rd house — short journeys",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "POST /kundali",
              "POST /tajaka/sahams-bhava"
            ],
            "precision": null
          },
          {
            "id": "7.1.3",
            "title": "9th house — long journeys",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "POST /tajaka/sahams-bhava",
              "GET /bphs/strength-seeds"
            ],
            "precision": null
          },
          {
            "id": "7.1.4",
            "title": "Paradesa saham — foreign countries",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams-bhava",
              "GET /bphs/strength-seeds"
            ],
            "precision": null
          },
          {
            "id": "7.1.5",
            "title": "Direction to travel or settle",
            "status": "ready",
            "routes": [
              "GET /bphs/strength-seeds",
              "POST /tajaka/sahams-bhava"
            ],
            "precision": null
          },
          {
            "id": "7.1.6",
            "title": "Jalapatana saham — crossing an ocean",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams-bhava",
              "GET /bphs/sign-class?sign="
            ],
            "precision": null
          },
          {
            "id": "7.1.7",
            "title": "Ch 23 rule corpus — 12th house effects",
            "status": "ready",
            "routes": [
              "GET /bphs/sign-class?sign="
            ],
            "precision": null
          },
          {
            "id": "7.1.8",
            "title": "Ambulation class for the journey",
            "status": "ready",
            "routes": [
              "GET /bphs/sign-class?sign="
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "7.2",
        "title": "Travel timing",
        "status": "partial",
        "pointers": [
          {
            "id": "7.2.1",
            "title": "Dasha of the 3rd/9th/12th lord — engine",
            "status": "partial",
            "routes": [
              "GET /muhurta?task=&tithiDay=&weekday=&nakshatra=&janmaNak=",
              "GET /transit/tara?janmaNak=&transitNak="
            ],
            "precision": null
          },
          {
            "id": "7.2.2",
            "title": "Auspicious moment to depart",
            "status": "ready",
            "routes": [
              "GET /muhurta?task=&tithiDay=&weekday=&nakshatra=&janmaNak=",
              "GET /transit/tara?janmaNak=&transitNak="
            ],
            "precision": null
          },
          {
            "id": "7.2.3",
            "title": "Tara bala for the journey day",
            "status": "ready",
            "routes": [
              "GET /transit/tara?janmaNak=&transitNak=",
              "GET /transit/latta",
              "GET /transit/vedha"
            ],
            "precision": null
          },
          {
            "id": "7.2.4",
            "title": "Latta / vedha obstruction",
            "status": "ready",
            "routes": [
              "GET /transit/latta",
              "GET /transit/vedha"
            ],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "8",
    "title": "Education & Learning",
    "groups": [
      {
        "id": "8",
        "title": "Education & Learning",
        "status": "ready",
        "pointers": [
          {
            "id": "8.1",
            "title": "4th (schooling) and 5th (intellect)",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "GET /varga?divisor=24",
              "POST /tajaka/sahams"
            ],
            "precision": null
          },
          {
            "id": "8.2",
            "title": "D24 — formal learning",
            "status": "ready",
            "routes": [
              "GET /varga?divisor=24",
              "POST /tajaka/sahams",
              "POST /tajaka/sahams"
            ],
            "precision": null
          },
          {
            "id": "8.3",
            "title": "Vidya saham — shape in 2.1.8",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams",
              "POST /tajaka/sahams",
              "GET /muhurta?task=teaching-alphabet"
            ],
            "precision": null
          },
          {
            "id": "8.4",
            "title": "Sastra saham — the sciences",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams",
              "GET /muhurta?task=teaching-alphabet",
              "POST /bphs/33/reading"
            ],
            "precision": null
          },
          {
            "id": "8.5",
            "title": "Auspicious day to begin study",
            "status": "ready",
            "routes": [
              "GET /muhurta?task=teaching-alphabet",
              "POST /bphs/33/reading"
            ],
            "precision": null
          },
          {
            "id": "8.6",
            "title": "Aptitude for learning — see 3.1.1",
            "status": "ready",
            "routes": [
              "POST /bphs/33/reading"
            ],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "9",
    "title": "Obstacles, Enemies, Litigation",
    "groups": [
      {
        "id": "9",
        "title": "Obstacles, Enemies, Litigation",
        "status": "ready",
        "pointers": [
          {
            "id": "9.1",
            "title": "6th house",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "POST /karakas/chara",
              "POST /tajaka/sahams"
            ],
            "precision": null
          },
          {
            "id": "9.2",
            "title": "Gnatikaraka — rivals — the seventh chara rank",
            "status": "ready",
            "routes": [
              "POST /karakas/chara",
              "POST /tajaka/sahams",
              "POST /kundali"
            ],
            "precision": null
          },
          {
            "id": "9.3",
            "title": "Satru saham",
            "status": "ready",
            "routes": [
              "POST /tajaka/sahams",
              "POST /kundali",
              "GET /argala?house="
            ],
            "precision": null
          },
          {
            "id": "9.4",
            "title": "Vipareeta raja yoga — difficulty that inverts into gain",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "GET /argala?house="
            ],
            "precision": null
          },
          {
            "id": "9.5",
            "title": "Argala — who intervenes on a matter",
            "status": "ready",
            "routes": [
              "GET /argala?house="
            ],
            "precision": null
          },
          {
            "id": "9.6",
            "title": "Ch 17 rule corpus — 6th house effects",
            "status": "ready",
            "routes": [
              "GET /bphs/shashtiamsa?sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "9.7",
            "title": "Which shashtiamsa a planet sits in",
            "status": "ready",
            "routes": [
              "GET /bphs/shashtiamsa?sign=&degree="
            ],
            "precision": null
          },
          {
            "id": "9.8",
            "title": "Bandhana saham — imprisonment. Computed, never surfaced.",
            "status": "refused",
            "routes": [
              "POST /kundali",
              "POST /kundali"
            ],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "10",
    "title": "Spirituality & Inner Life",
    "groups": [
      {
        "id": "10",
        "title": "Spirituality & Inner Life",
        "status": "ready",
        "pointers": [
          {
            "id": "10.1",
            "title": "9th house, dharma",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "POST /kundali",
              "GET /varga?divisor=20"
            ],
            "precision": null
          },
          {
            "id": "10.2",
            "title": "12th house — release, isolation",
            "status": "ready",
            "routes": [
              "POST /kundali",
              "GET /varga?divisor=20",
              "POST /karakas/chara"
            ],
            "precision": null
          },
          {
            "id": "10.3",
            "title": "D20 — practice and discipline",
            "status": "ready",
            "routes": [
              "GET /varga?divisor=20",
              "POST /karakas/chara",
              "POST /bphs/33/reading"
            ],
            "precision": null
          },
          {
            "id": "10.4",
            "title": "Atmakaraka's condition — see 1.1.4",
            "status": "ready",
            "routes": [
              "POST /karakas/chara",
              "POST /bphs/33/reading"
            ],
            "precision": null
          },
          {
            "id": "10.5",
            "title": "Karakamsa — the soul's stated subject",
            "status": "ready",
            "routes": [
              "POST /bphs/33/reading"
            ],
            "precision": null
          },
          {
            "id": "10.6",
            "title": "Yogas leading to asceticism P47 (ch 79)",
            "status": "planned",
            "routes": [],
            "precision": null
          },
          {
            "id": "10.7",
            "title": "Curses from previous births P49 (ch 83) — structural only, no fatalism",
            "status": "planned",
            "routes": [],
            "precision": null
          }
        ]
      }
    ]
  },
  {
    "id": "11",
    "title": "Timing (Cross-Cutting — Read With Every Domain)",
    "groups": [
      {
        "id": "11.1",
        "title": "What period am I in",
        "status": "ready",
        "pointers": [
          {
            "id": "11.1.1",
            "title": "Vimshottari balance at birth",
            "status": "ready",
            "routes": [
              "GET /dasha/vimshottari?moonLong="
            ],
            "precision": null
          },
          {
            "id": "11.1.2",
            "title": "Subdivide to any depth",
            "status": "ready",
            "routes": [
              "GET /dasha/vimshottari/subdivide?lord=&years=&depth="
            ],
            "precision": null
          },
          {
            "id": "11.1.3",
            "title": "Sookshma / prana levels computed, never displayed — shorter than the birth-time",
            "status": "refused",
            "routes": [
              "GET /bphs/46/vimshottari"
            ],
            "precision": null
          },
          {
            "id": "11.1.1a",
            "title": "The construction, verified against BPHS itself (P34)",
            "status": "ready",
            "routes": [
              "GET /bphs/46/vimshottari"
            ],
            "precision": null
          },
          {
            "id": "11.1.4",
            "title": "Which dasha system applies to THIS chart the crown jewel",
            "status": "ready",
            "routes": [
              "POST /bphs/46/select-dasha"
            ],
            "precision": null
          },
          {
            "id": "11.1.4a",
            "title": "The nine conditional systems, and when each applies",
            "status": "ready",
            "routes": [
              "GET /bphs/46/conditional-dashas"
            ],
            "precision": null
          },
          {
            "id": "11.1.5",
            "title": "Ashtottari",
            "status": "ready",
            "routes": [
              "GET /dasha/ashtottari?moonLong="
            ],
            "precision": null
          },
          {
            "id": "11.1.6",
            "title": "Kalachakra",
            "status": "ready",
            "routes": [
              "GET /dasha/kalachakra?nak=&pada=",
              "GET /bphs/46/kalachakra"
            ],
            "precision": null
          },
          {
            "id": "11.1.7",
            "title": "Chara / Narayana / Sudasa / Drigdasa",
            "status": "ready",
            "routes": [
              "GET /dasha/*",
              "GET /dasha/sudarsana/all"
            ],
            "precision": null
          },
          {
            "id": "11.1.8",
            "title": "Sudarshana — three charts at once",
            "status": "ready",
            "routes": [
              "GET /dasha/sudarsana/all"
            ],
            "precision": null
          },
          {
            "id": "11.1.8a",
            "title": "Subdividing a period — ALL FIVE systems",
            "status": "ready",
            "routes": [
              "GET /bphs/51/antardasa?system=&years=&antarYears="
            ],
            "precision": null
          },
          {
            "id": "11.1.8b",
            "title": "The ORDER of rasi antardasas",
            "status": "ready",
            "routes": [
              "GET /bphs/51/rasi-antardasa-order?rasi="
            ],
            "precision": null
          },
          {
            "id": "11.1.8c",
            "title": "Paka and Bhoga rasi",
            "status": "ready",
            "routes": [
              "GET /bphs/51/paka-bhoga?first=&paka="
            ],
            "precision": null
          },
          {
            "id": "11.1.9",
            "title": "What a period actually BRINGS",
            "status": "ready",
            "routes": [
              "GET /bphs/dasha/house-lord?house=&dignity="
            ],
            "precision": null
          },
          {
            "id": "11.1.10",
            "title": "Reading a rasi dasha from the DASHA RASI",
            "status": "ready",
            "routes": [
              "POST /bphs/dasha/chara"
            ],
            "precision": null
          },
          {
            "id": "11.1.11",
            "title": "What a maha×antar PAIR brings",
            "status": "ready",
            "routes": [
              "GET /bphs/dasha/antar?maha=&antar=&house="
            ],
            "precision": null
          },
          {
            "id": "11.1.12",
            "title": "The other 36 pairs, and a refuted rule",
            "status": "ready",
            "routes": [
              "GET /bphs/dasha/antar/cells-57-60"
            ],
            "precision": null
          },
          {
            "id": "11.1.13",
            "title": "The pratyantar level",
            "status": "ready",
            "routes": [
              "GET /bphs/61/pratyantar?maha=&antar="
            ],
            "precision": null
          },
          {
            "id": "11.1.14",
            "title": "Sookshma and prana — levels four and five",
            "status": "ready",
            "routes": [
              "GET /bphs/62/span?chain="
            ],
            "precision": null
          },
          {
            "id": "11.1.15",
            "title": "A Kalachakra antardasa — span and reading",
            "status": "ready",
            "routes": [
              "GET /bphs/64/kalachakra-antar?dashaRasi=&antarRasi="
            ],
            "precision": null
          },
          {
            "id": "11.1.16",
            "title": "The Kalachakra wheel, confirmed by a layout",
            "status": "ready",
            "routes": [
              "GET /bphs/65/summary"
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "11.2",
        "title": "What the sky is doing now",
        "status": "ready",
        "pointers": [
          {
            "id": "11.2.1",
            "title": "Transits from Moon and lagna — engine",
            "status": "ready",
            "routes": [
              "GET /transits",
              "GET /transit/vedha?graha=&house=",
              "GET /transit/murthi?house="
            ],
            "precision": null
          },
          {
            "id": "11.2.2",
            "title": "Favourability from Moon",
            "status": "ready",
            "routes": [
              "GET /transits",
              "GET /transit/vedha?graha=&house=",
              "GET /transit/murthi?house="
            ],
            "precision": null
          },
          {
            "id": "11.2.3",
            "title": "Vedha — a good transit obstructed — see 7.2.4",
            "status": "ready",
            "routes": [
              "GET /transit/vedha?graha=&house=",
              "GET /transit/murthi?house=",
              "GET /transit/tara"
            ],
            "precision": null
          },
          {
            "id": "11.2.4",
            "title": "Murthi — the quality of an entry",
            "status": "ready",
            "routes": [
              "GET /transit/murthi?house=",
              "GET /transit/tara"
            ],
            "precision": null
          },
          {
            "id": "11.2.5",
            "title": "Tara bala — formula in 7.2.3",
            "status": "ready",
            "routes": [
              "GET /transit/tara",
              "GET /tajaka/muntha"
            ],
            "precision": null
          },
          {
            "id": "11.2.6",
            "title": "Sade sati — engine",
            "status": "ready",
            "routes": [
              "GET /tajaka/muntha",
              "GET /dasha/mudda"
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "11.3",
        "title": "The annual chart",
        "status": "ready",
        "pointers": [
          {
            "id": "11.3.1",
            "title": "Muntha — formula in 3.2.3",
            "status": "ready",
            "routes": [
              "GET /tajaka/muntha",
              "GET /dasha/mudda",
              "POST /dasha/patyayini"
            ],
            "precision": null
          },
          {
            "id": "11.3.2",
            "title": "Mudda dasha",
            "status": "ready",
            "routes": [
              "GET /dasha/mudda",
              "POST /dasha/patyayini",
              "GET /tajaka/harsha"
            ],
            "precision": null
          },
          {
            "id": "11.3.3",
            "title": "Patyayini",
            "status": "ready",
            "routes": [
              "POST /dasha/patyayini",
              "GET /tajaka/harsha",
              "GET /tajaka/ithasala"
            ],
            "precision": null
          },
          {
            "id": "11.3.4",
            "title": "Harsha bala",
            "status": "ready",
            "routes": [
              "GET /tajaka/harsha",
              "GET /tajaka/ithasala"
            ],
            "precision": null
          },
          {
            "id": "11.3.5",
            "title": "Ithasala — is an aspect applying or separating",
            "status": "ready",
            "routes": [
              "GET /tajaka/ithasala",
              "GET /muhurta?task="
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "11.4",
        "title": "Choosing a moment to act — precision: MINUTE",
        "status": "ready",
        "pointers": [
          {
            "id": "11.4.1",
            "title": "Muhurta check — (5 tasks encoded) — filters in 7.2.2",
            "status": "ready",
            "routes": [
              "GET /muhurta?task=",
              "GET /hora?weekday=&hora=",
              "GET /panchanga?sunLong=&moonLong="
            ],
            "precision": null
          },
          {
            "id": "11.4.2",
            "title": "Hora lord",
            "status": "ready",
            "routes": [
              "GET /hora?weekday=&hora=",
              "GET /panchanga?sunLong=&moonLong="
            ],
            "precision": null
          },
          {
            "id": "11.4.3",
            "title": "Panchanga",
            "status": "ready",
            "routes": [
              "GET /panchanga?sunLong=&moonLong=",
              "GET /muhurta/guidelines"
            ],
            "precision": null
          },
          {
            "id": "11.4.4",
            "title": "Rikta tithis to avoid",
            "status": "ready",
            "routes": [
              "GET /muhurta/guidelines",
              "GET /bphs/prana-pada?sunLong=&minutesSinceSunrise=&lagnaSign="
            ],
            "precision": null
          },
          {
            "id": "11.4.5",
            "title": "Prana-pada",
            "status": "ready",
            "routes": [
              "GET /bphs/prana-pada?sunLong=&minutesSinceSunrise=&lagnaSign="
            ],
            "precision": null
          },
          {
            "id": "11.4.6",
            "title": "How a matter surfaces — rising type",
            "status": "ready",
            "routes": [
              "GET /bphs/sign-class?sign="
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "11.5",
        "title": "Which lagna am I counting from — now actually callable",
        "status": "ready",
        "pointers": [
          {
            "id": "11.5.1",
            "title": "The three special lagnas",
            "status": "ready",
            "routes": [],
            "precision": null
          },
          {
            "id": "11.5.2",
            "title": "Do the four charts agree?",
            "status": "ready",
            "routes": [
              "POST /bphs/bhava-agreement",
              "GET /bphs/varnada?lagnaSign=&horaLagnaSign="
            ],
            "precision": null
          },
          {
            "id": "11.5.3",
            "title": "Varnada and its dasha",
            "status": "ready",
            "routes": [
              "GET /bphs/varnada?lagnaSign=&horaLagnaSign="
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "11.6",
        "title": "Birth-time rectification",
        "status": "partial",
        "pointers": [
          {
            "id": "11.6.1",
            "title": "Conception moment from the birth chart",
            "status": "ready",
            "routes": [
              "GET /bphs/nisheka?..."
            ],
            "precision": null
          },
          {
            "id": "11.6.2",
            "title": "Birth time recovered from the conception ascendant",
            "status": "ready",
            "routes": [
              "GET /bphs/rectify-adhana?..."
            ],
            "precision": null
          },
          {
            "id": "11.6.3",
            "title": "Which half of the day the birth fell in",
            "status": "ready",
            "routes": [
              "GET /reference"
            ],
            "precision": null
          },
          {
            "id": "11.6.4",
            "title": "Before or after 273 days",
            "status": "ready",
            "routes": [
              "GET /reference",
              "GET /bphs/75/mahapurusha"
            ],
            "precision": null
          },
          {
            "id": "11.6.5",
            "title": "Existing rectification principles",
            "status": "ready",
            "routes": [
              "GET /reference",
              "GET /bphs/75/mahapurusha"
            ],
            "precision": null
          }
        ]
      },
      {
        "id": "11.7",
        "title": "Strength as a classifier",
        "status": "ready",
        "pointers": [
          {
            "id": "11.7.1",
            "title": "The five Pancha Mahapurusha yogas",
            "status": "ready",
            "routes": [
              "GET /bphs/75/mahapurusha"
            ],
            "precision": null
          },
          {
            "id": "11.7.2",
            "title": "Elemental temperament and guna",
            "status": "ready",
            "routes": [
              "POST /bphs/76/temperament"
            ],
            "precision": null
          }
        ]
      }
    ]
  }
];

/** Flat list, for search and for routing a typed question. */
export const ALL_POINTERS: (Pointer & { section: string; group: string })[] =
  POINTER_TREE.flatMap((s) =>
    s.groups.flatMap((g) =>
      g.pointers.map((p) => ({ ...p, section: s.id, group: g.id }))));

export const POINTER_COUNTS = {
  sections: 11,
  groups: 25,
  pointers: 175,
  ready: ALL_POINTERS.filter((p) => p.status === 'ready').length,
  refused: ALL_POINTERS.filter((p) => p.status === 'refused').length,
} as const;

export const findPointer = (id: string): Pointer | undefined =>
  ALL_POINTERS.find((p) => p.id === id);
