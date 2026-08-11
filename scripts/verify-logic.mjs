// Sanity checks for the demo logic — run with `npm run verify`.
// Asserts each bundled scenario resolves to the outcome the copy promises,
// and spot-checks the triage and report math in both languages.

import { readFileSync } from "node:fs";
import { SCENARIOS } from "../src/data/scenarios.js";
import { analyzeScenario } from "../src/lib/polymarket.js";
import { classifyLead, EXAMPLE_LEADS } from "../src/lib/triage.js";
import { buildReport, SAMPLE_WEEKS } from "../src/lib/report.js";
import { CAPABILITIES, LINKS, NODES, STAGES, SYSTEMS, SYSTEM_CAPABILITIES } from "../src/data/graph.js";
import { STRINGS } from "../src/copy.js";

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  →  ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`);
}

console.log("— Polymarket scenarios —");
const expected = {
  "nyc-heat": { action: "BET_YES", confidence: 0.9 },
  "miami-rain": { action: "SKIP", confidence: 0.8 },
  "chicago-cold": { action: "BET_NO", confidence: 0.9 },
  "london-snow": { action: "BET_YES", confidence: 0.65 },
};
for (const scenario of SCENARIOS) {
  const { forecast, edge } = analyzeScenario(scenario);
  const want = expected[scenario.id];
  check(`${scenario.id} action`, edge.action, want.action);
  check(`${scenario.id} confidence`, forecast.confidence, want.confidence);
  console.log(
    `      prob=${forecast.probability} edge=${edge.edge} kelly=$${edge.kellySize.toFixed(2)} reason="${edge.reason}"`
  );
  if (edge.kellySize > 25) {
    failures += 1;
    console.log(`FAIL  ${scenario.id} kelly exceeds $25 cap`);
  }
}

console.log("\n— Lead triage examples (EN) —");
const t1 = classifyLead(EXAMPLE_LEADS.en[0].text);
check("redesign urgency", t1.urgency, "High"); // "kind of urgent"
check("redesign budget", t1.budget, "Mid"); // $8k
check("redesign category", t1.category, "Web Dev");
check("redesign priority", t1.priority, "hot");

const t2 = classifyLead(EXAMPLE_LEADS.en[1].text);
check("price-shopper urgency", t2.urgency, "Low");
check("price-shopper budget", t2.budget, "Unspecified");
check("price-shopper category", t2.category, "Marketing / Social");
check("price-shopper priority", t2.priority, "nurture");

const t3 = classifyLead(EXAMPLE_LEADS.en[2].text);
check("checkout urgency", t3.urgency, "High");
check("checkout category", t3.category, "Urgent Fix");

const t4 = classifyLead("hello, what do you do?");
check("free-text fallback category", t4.category, "General Inquiry");
check("free-text fallback priority", t4.priority, "nurture");

console.log("\n— Lead triage examples (IT) —");
const i1 = classifyLead(EXAMPLE_LEADS.it[0].text);
check("it redesign urgency", i1.urgency, "High"); // "urgente"
check("it redesign budget", i1.budget, "Mid");
check("it redesign category", i1.category, "Web Dev"); // "sito"
check("it redesign priority", i1.priority, "hot");

const i2 = classifyLead(EXAMPLE_LEADS.it[1].text);
check("it price-shopper category", i2.category, "Marketing / Social");
check("it price-shopper priority", i2.priority, "nurture");

const i3 = classifyLead(EXAMPLE_LEADS.it[2].text);
check("it checkout urgency", i3.urgency, "High"); // "urgente"/"subito"
check("it checkout category", i3.category, "Urgent Fix"); // "checkout"/"rotto"

const i4 = classifyLead("ci serve un preventivo per €12k di automazione dei flussi");
check("it euro budget", i4.budget, "Large"); // €12k
check("it automation category", i4.category, "Automation");

console.log("\n— Report math —");
const report = buildReport(SAMPLE_WEEKS);
check("headline EN", report.headline, "Conversions up 34% week-over-week"); // 61 → 82
check("best week", report.bestWeek, 3);
check("biggest mover", report.biggestMover.key, "conversions");
const reportIt = buildReport(SAMPLE_WEEKS, "it");
check("headline IT", reportIt.headline, "Conversioni in crescita del 34% settimana su settimana");
const zeros = buildReport(SAMPLE_WEEKS.map(() => ({ impressions: 0, clicks: 0, conversions: 0, spend: 0 })));
check("all-zero input survives", typeof zeros.headline, "string");

// The graph is a set of claims about what each system is built from, and it is
// meant to be edited as the practice changes. These checks are what stops an
// edit from silently producing a graph that renders but lies, or one that
// renders a node nobody can reach.
console.log("\n— Graph integrity —");
const ids = new Set(NODES.map((n) => n.id));
check("no duplicate node ids", ids.size, NODES.length);
check("six systems", SYSTEMS.length, 6);
check("seven stages", STAGES.length, 7);

const BADGES = new Set(["LIVE", "REPLAY", "PRIVATE BUILD"]);
for (const s of SYSTEMS) {
  check(`${s.id} badge is in the vocabulary`, BADGES.has(s.badge), true);
  check(`${s.id} has an in-page anchor`, /^#[a-z-]+$/.test(s.href), true);
  check(`${s.id} has EN+IT label`, !!(s.label?.en && s.label?.it), true);
  check(`${s.id} is in a group`, s.group === "A" || s.group === "B", true);
  // Every system must be built from something, or its node explains nothing.
  check(`${s.id} declares capabilities`, (SYSTEM_CAPABILITIES[s.id] ?? []).length > 0, true);
}
check("group A leads with three systems", SYSTEMS.filter((s) => s.group === "A").length, 3);
check("group B has three systems", SYSTEMS.filter((s) => s.group === "B").length, 3);

// A capability edge naming a node that does not exist would silently vanish
// from the render, quietly making a system look simpler than it is.
const capIds = new Set(CAPABILITIES.map((c) => c.id));
const stageIds = new Set(STAGES.map((s) => s.id));
for (const [systemId, caps] of Object.entries(SYSTEM_CAPABILITIES)) {
  check(`${systemId} is a real system`, ids.has(systemId), true);
  for (const cap of caps) check(`${systemId} -> ${cap} exists`, capIds.has(cap), true);
  check(`${systemId} has no duplicate capabilities`, new Set(caps).size, caps.length);
}
for (const c of CAPABILITIES) {
  check(`${c.id} belongs to a real stage`, stageIds.has(c.stage), true);
  check(`${c.id} has EN+IT label`, !!(c.label?.en && c.label?.it), true);
}
check(
  "every link resolves at both ends",
  LINKS.every((l) => ids.has(l.source) && ids.has(l.target)),
  true
);
check("no self-links", LINKS.some((l) => l.source === l.target), false);
check(
  "no orphan nodes",
  NODES.filter((n) => !LINKS.some((l) => l.source === n.id || l.target === n.id)).map((n) => n.id).join(",") || "none",
  "none"
);

// Lead Auto-Triage is sold on being a rules engine rather than a model call.
// The graph must not blur that: an llm-classify edge here would contradict the
// card's own copy.
check(
  "lead triage claims no LLM classification",
  SYSTEM_CAPABILITIES["lead-triage"].includes("llm-classify"),
  false
);

// Blenard's standing rule: no em-dashes in anything a visitor reads.
const graphText = [
  ...SYSTEMS.flatMap((s) => [s.label.en, s.label.it]),
  ...STAGES.flatMap((s) => [s.label.en, s.label.it]),
  ...CAPABILITIES.flatMap((c) => [c.label.en, c.label.it]),
];
check("graph labels free of em-dashes", graphText.some((t) => t.includes("—")), false);

// Full EN/IT parity, asserted rather than assumed. A missing Italian key does
// not throw at runtime, it renders `undefined` or silently falls back to
// English, which is exactly the kind of half-translated page the brief rules
// out. Comparing the two key trees is the only way to catch it before a
// visitor does.
console.log("\n— Copy: EN/IT parity —");
const keyTree = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) {
      // Arrays must match in length too: four principles in one language and
      // three in the other is the same bug wearing a different hat.
      return [
        `${path}[]:${v.length}`,
        ...v.flatMap((item, i) =>
          item && typeof item === "object" ? keyTree(item, `${path}[${i}]`) : []
        ),
      ];
    }
    if (v && typeof v === "object") return keyTree(v, path);
    return [`${path}:${typeof v}`];
  });

const enKeys = keyTree(STRINGS.en).sort();
const itKeys = keyTree(STRINGS.it).sort();
const missingInIt = enKeys.filter((k) => !itKeys.includes(k));
const missingInEn = itKeys.filter((k) => !enKeys.includes(k));
check("no English key missing from Italian", missingInIt.join(", ") || "none", "none");
check("no Italian key missing from English", missingInEn.join(", ") || "none", "none");

// The no-em-dash house rule, over every string in both languages.
const walkStrings = (obj) =>
  Object.values(obj).flatMap((v) =>
    typeof v === "string" ? [v] : v && typeof v === "object" ? walkStrings(v) : []
  );
const allCopy = [...walkStrings(STRINGS.en), ...walkStrings(STRINGS.it)];
const dashed = allCopy.filter((s) => s.includes("—"));
check("copy is free of em-dashes", dashed.slice(0, 3).join(" | ") || "none", "none");
check("copy has no empty strings", allCopy.filter((s) => s.trim() === "").length, 0);

// Every system in the graph needs a card, in both languages, or the Live
// systems section renders a heading with nothing under it.
for (const s of SYSTEMS) {
  check(`${s.id} has an EN card`, !!STRINGS.en.systems.cards[s.id]?.body, true);
  check(`${s.id} has an IT card`, !!STRINGS.it.systems.cards[s.id]?.body, true);
}
// And every badge in use must have a label in both languages.
for (const badge of new Set(SYSTEMS.map((s) => s.badge))) {
  check(`badge ${badge} is labelled EN+IT`, !!(STRINGS.en.systems.badges[badge] && STRINGS.it.systems.badges[badge]), true);
}

// Guards the fix for the invisible hero. Anything on screen at first paint must
// reach full opacity without waiting on an IntersectionObserver, a transition,
// or a running document timeline — a hidden or throttled tab advances none of
// them, which once left the hero stranded at opacity 0. Source-level assertions
// because the failure lives in CSS/DOM plumbing, not in a pure function.
console.log("\n— Reveal: above-the-fold legibility —");
const revealSrc = readFileSync(new URL("../src/components/Reveal.jsx", import.meta.url), "utf8");
const cssSrc = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

check("Reveal measures the viewport on mount", /getBoundingClientRect\(\)/.test(revealSrc), true);
check("Reveal routes on-screen elements to mount mode", /onScreenAtLoad[\s\S]{0,120}setState\("mount"\)/.test(revealSrc), true);

const mountBranch = revealSrc.match(/if \(state === "mount"\) \{[\s\S]*?\n  \}/)?.[0] ?? "";
check("mount branch exists", mountBranch.length > 0, true);
check("mount branch renders fully opaque", mountBranch.includes("opacity-100"), true);
check("mount branch has no transition", /transition/.test(mountBranch), false);
check("mount branch has no stagger delay", /transitionDelay|animationDelay/.test(mountBranch), false);

const keyframes = cssSrc.match(/@keyframes reveal-up \{[\s\S]*?\n\}/)?.[0] ?? "";
check("reveal-up keyframes exist", keyframes.length > 0, true);
check("reveal-up never animates opacity", /opacity/.test(keyframes), false);

// The graph obeys the same invariant, for the same reason: it pauses its
// simulation whenever the tab is hidden or it scrolls off-screen, so if the
// layout were solved lazily, that pause could land before the first tick and
// paint every node stacked at the origin.
console.log("\n— Graph: layout exists at first paint —");
const graphSrc = readFileSync(new URL("../src/components/PracticeGraph.jsx", import.meta.url), "utf8");
check(
  "layout is solved synchronously before painting",
  /sim\.stop\(\);\s*\n\s*sim\.tick\(SETTLE_TICKS\);\s*\n\s*paint\(\);/.test(graphSrc),
  true
);
check(
  "drift resumes from the settled layout, never full alpha",
  /sim\.alpha\(DRIFT_ALPHA\)\.alphaTarget\(DRIFT_ALPHA\)\.restart\(\)/.test(graphSrc),
  true
);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
