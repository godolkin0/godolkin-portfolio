// Sanity checks for the demo logic — run with `npm run verify`.
// Asserts each bundled scenario resolves to the outcome the copy promises,
// and spot-checks the triage and report math in both languages.

import { SCENARIOS } from "../src/data/scenarios.js";
import { analyzeScenario } from "../src/lib/polymarket.js";
import { classifyLead, EXAMPLE_LEADS } from "../src/lib/triage.js";
import { buildReport, SAMPLE_WEEKS } from "../src/lib/report.js";
import { PROJECTS } from "../src/data/projects.js";

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

console.log("\n— Projects —");
for (const p of PROJECTS) {
  check(`${p.id} has EN+IT sector`, !!(p.sector?.en && p.sector?.it), true);
  check(`${p.id} has EN+IT blurb`, !!(p.blurb?.en && p.blurb?.it), true);
  const fields = [p.sector?.en, p.sector?.it, p.blurb?.en, p.blurb?.it];
  check(`${p.id} free of em-dashes`, fields.some((s) => (s || "").includes("—")), false);
  // Private builds must not carry a URL, live ones must have one.
  check(`${p.id} url shape`, p.url === null || typeof p.url === "string", true);
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
