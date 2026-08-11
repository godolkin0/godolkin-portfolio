// The practice, as a graph.
//
// This is DATA, not decoration. Every edge here is a claim: that this system
// actually uses that capability. Nothing is wired in to make the picture look
// busier, and nothing is claimed for a system that does not do it. If a system
// changes, edit this file — no render code needs to know.
//
// Three tiers:
//   system     — the six things in Act III, one node each, largest
//   stage      — the seven-step loop every Godolkin system shares, medium
//   capability — the concrete parts systems are built from, smallest
//
// Structure:
//   stage -> stage         the loop (7 edges)
//   capability -> stage    which step of the loop a capability belongs to (23)
//   system -> capability   what that system is actually built from (42)
//
// That last set is what makes hovering a system explain it instantly. The
// capability->stage set is what makes hovering a STAGE light up its capabilities,
// which is what the "How I work" section needs. Both are load-bearing, which is
// why the edge count lands near 72 rather than the ~50 first sketched: dropping
// the capability->stage edges would leave the stage loop an isolated ring and
// make stage hover meaningless.

// --- Systems -----------------------------------------------------------------
// `group` A is sector-neutral and leads the section; B is the real-estate depth.
// `badge` uses the same three-word vocabulary as the cards, no exceptions:
//   LIVE  - real, running, clickable in-browser
//   REPLAY - real logic, historical data, not live-computed
//   PRIVATE BUILD - real system, described only, never interactive here
export const SYSTEMS = [
  {
    id: "lead-triage",
    tier: "system",
    group: "A",
    badge: "LIVE",
    href: "#lead-triage",
    label: { en: "Lead Auto-Triage", it: "Auto-Triage Lead" },
  },
  {
    id: "report-gen",
    tier: "system",
    group: "A",
    badge: "LIVE",
    href: "#report-gen",
    label: { en: "Report Generator", it: "Generatore di Report" },
  },
  {
    id: "signal-bot",
    tier: "system",
    group: "A",
    badge: "REPLAY",
    href: "#signal-bot",
    label: { en: "Signal Bot", it: "Signal Bot" },
  },
  {
    id: "valora",
    tier: "system",
    group: "B",
    badge: "LIVE",
    href: "#valora",
    label: { en: "Valora", it: "Valora" },
  },
  {
    id: "buyer-match",
    tier: "system",
    group: "B",
    badge: "PRIVATE BUILD",
    href: "#buyer-match",
    label: { en: "Buyer-Matching Flow", it: "Flusso Match Acquirenti" },
  },
  {
    id: "deadline-tracker",
    tier: "system",
    group: "B",
    badge: "PRIVATE BUILD",
    href: "#deadline-tracker",
    label: { en: "Deadline Tracker", it: "Tracker Scadenze" },
  },
];

// --- Stages ------------------------------------------------------------------
// Ordered. The loop edges are generated from this order, so reordering the array
// reorders the loop. Copy matches the wording already on the site.
export const STAGES = [
  { id: "intake", tier: "stage", label: { en: "signal in", it: "segnale in" } },
  { id: "normalise", tier: "stage", label: { en: "normalise", it: "normalizza" } },
  { id: "classify", tier: "stage", label: { en: "classify", it: "classifica" } },
  { id: "decide", tier: "stage", label: { en: "decide", it: "decide" } },
  { id: "act", tier: "stage", label: { en: "act", it: "agisce" } },
  { id: "notify", tier: "stage", label: { en: "notify", it: "notifica" } },
  { id: "observe", tier: "stage", label: { en: "log", it: "logga" } },
];

// --- Capabilities ------------------------------------------------------------
// Each belongs to exactly one stage. Proper nouns (Telegram, Supabase) stay
// untranslated on purpose: that is what they are called in both languages.
export const CAPABILITIES = [
  { id: "webhook", stage: "intake", label: { en: "webhook", it: "webhook" } },
  { id: "form", stage: "intake", label: { en: "form", it: "form" } },
  { id: "inbox", stage: "intake", label: { en: "inbox", it: "casella email" } },
  { id: "scheduled-check", stage: "intake", label: { en: "scheduled check", it: "controllo pianificato" } },

  { id: "dedupe", stage: "normalise", label: { en: "dedupe", it: "deduplica" } },
  { id: "enrich", stage: "normalise", label: { en: "enrich", it: "arricchisci" } },
  { id: "geocode", stage: "normalise", label: { en: "geocode", it: "geocodifica" } },

  { id: "rules-engine", stage: "classify", label: { en: "rules engine", it: "motore a regole" } },
  { id: "llm-classify", stage: "classify", label: { en: "LLM classify", it: "classificazione LLM" } },
  { id: "scoring", stage: "classify", label: { en: "scoring", it: "scoring" } },

  { id: "thresholds", stage: "decide", label: { en: "thresholds", it: "soglie" } },
  { id: "match", stage: "decide", label: { en: "match", it: "match" } },

  { id: "draft-reply", stage: "act", label: { en: "draft reply", it: "bozza risposta" } },
  { id: "write-record", stage: "act", label: { en: "write record", it: "scrivi record" } },
  { id: "valuation", stage: "act", label: { en: "valuation", it: "valutazione" } },
  { id: "supabase", stage: "act", label: { en: "Supabase", it: "Supabase" } },

  { id: "telegram", stage: "notify", label: { en: "Telegram", it: "Telegram" } },
  { id: "gmail", stage: "notify", label: { en: "Gmail", it: "Gmail" } },
  { id: "sheets", stage: "notify", label: { en: "Sheets", it: "Sheets" } },
  { id: "deadline-alert", stage: "notify", label: { en: "deadline alert", it: "avviso scadenza" } },

  { id: "logging", stage: "observe", label: { en: "logging", it: "logging" } },
  { id: "retries", stage: "observe", label: { en: "retries", it: "ritentativi" } },
  { id: "audit-trail", stage: "observe", label: { en: "audit trail", it: "tracciato audit" } },
];

// --- What each system is actually built from ---------------------------------
// Sourced from the systems themselves, not from what would make a fuller graph.
// Lead Auto-Triage deliberately has NO llm-classify edge: it is a rules engine,
// and that is the differentiator, so the graph must not blur it.
// The two private builds carry only what has been specified for them; their
// sparseness is honest and is not padded out.
export const SYSTEM_CAPABILITIES = {
  "lead-triage": ["form", "inbox", "rules-engine", "scoring", "draft-reply", "gmail", "logging"],
  "report-gen": ["sheets", "scheduled-check", "rules-engine", "write-record", "gmail", "logging"],
  "signal-bot": [
    "scheduled-check",
    "enrich",
    "rules-engine",
    "thresholds",
    "scoring",
    "telegram",
    "logging",
    "retries",
    "audit-trail",
  ],
  valora: ["form", "geocode", "supabase", "valuation", "scoring", "telegram", "sheets", "logging", "audit-trail"],
  "buyer-match": ["form", "match", "gmail", "logging"],
  "deadline-tracker": [
    "form",
    "supabase",
    "scheduled-check",
    "deadline-alert",
    "gmail",
    "telegram",
    "logging",
  ],
};

// --- Assembly ----------------------------------------------------------------

export const NODES = [
  ...SYSTEMS,
  ...STAGES,
  ...CAPABILITIES.map((c) => ({ ...c, tier: "capability" })),
];

export const LINKS = [
  // The loop. Wraps: observe feeds the next intake.
  ...STAGES.map((s, i) => ({
    source: s.id,
    target: STAGES[(i + 1) % STAGES.length].id,
    kind: "loop",
  })),
  // Each capability hangs off the step of the loop it belongs to.
  ...CAPABILITIES.map((c) => ({ source: c.id, target: c.stage, kind: "stage" })),
  // Each system, wired to what it is made of.
  ...Object.entries(SYSTEM_CAPABILITIES).flatMap(([systemId, caps]) =>
    caps.map((capId) => ({ source: systemId, target: capId, kind: "uses" }))
  ),
];

// Adjacency, built once. The hover interaction has to resolve a node's direct
// neighbourhood in well under a frame, so it must never scan the link list.
export const NEIGHBOURS = (() => {
  const map = new Map(NODES.map((n) => [n.id, new Set()]));
  for (const l of LINKS) {
    map.get(l.source)?.add(l.target);
    map.get(l.target)?.add(l.source);
  }
  return map;
})();

export const DEGREE = new Map([...NEIGHBOURS].map(([id, set]) => [id, set.size]));

// Node radius. Tier sets the band, degree modulates inside it. Pure degree
// sizing would collapse the tiers into each other (a busy stage out-ranks a
// small system), and the tier hierarchy is the thing a visitor must read first.
const TIER_RADIUS = { system: 9, stage: 6, capability: 3.2 };
const TIER_DEGREE_STEP = { system: 0.45, stage: 0.3, capability: 0.55 };

export function radiusOf(node) {
  const base = TIER_RADIUS[node.tier];
  const degree = DEGREE.get(node.id) ?? 0;
  return base + Math.min(degree, 6) * TIER_DEGREE_STEP[node.tier];
}

// Mobile drops the capability tier entirely: systems and stages only, which
// keeps the graph legible at 360px and cuts the node count by two thirds.
// Systems then attach to the stages their capabilities belonged to, so the
// mobile graph stays connected and still says something true.
export function mobileGraph() {
  const nodes = [...SYSTEMS, ...STAGES];
  const stageOf = new Map(CAPABILITIES.map((c) => [c.id, c.stage]));
  const links = STAGES.map((s, i) => ({
    source: s.id,
    target: STAGES[(i + 1) % STAGES.length].id,
    kind: "loop",
  }));
  for (const [systemId, caps] of Object.entries(SYSTEM_CAPABILITIES)) {
    const stages = new Set(caps.map((c) => stageOf.get(c)).filter(Boolean));
    for (const stage of stages) links.push({ source: systemId, target: stage, kind: "uses" });
  }
  return { nodes, links };
}
