// Merges the prospect list with the message templates and prints paste-ready
// messages, one per prospect, each with the logging command that keeps
// attribution honest.
//
// It deliberately does NOT send anything. You send by hand, from your own
// account, one at a time — see growth/02-outreach.md for why that matters.
//
//   node growth/tools/outreach.mjs --channel=email --limit=25 --out
//   node growth/tools/outreach.mjs --channel=ig --stage=outreach
//   node growth/tools/outreach.mjs --channel=email --stage=followup1 --variant=F1

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvObjects } from "./csv.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_DATA = path.join(ROOT, "growth/data");

// Constants every template can reference, so a brand change is a one-line edit.
const DEFAULTS = {
  me: "Godolkin",
  portfolio: "https://godolkin.dev",
  demo: "https://valora-landing-10417c.netlify.app/",
};

// Prospects in these states are never contacted again.
const STOP_STATES = new Set(["dead", "won", "lost", "unsubscribed", "no"]);

// Which CSV column carries the address for each channel.
const CHANNEL_FIELD = {
  email: "email",
  "email-en": "email",
  ig: "ig",
  linkedin: "linkedin",
  phone: "phone",
};

function parseArgs(argv) {
  const args = {};
  for (const token of argv) {
    if (!token.startsWith("--")) continue;
    const [key, value] = token.slice(2).split("=");
    args[key] = value === undefined ? true : value;
  }
  return args;
}

function usage() {
  console.log(`
Generate tonight's outreach batch.

  --channel=<name>   email | email-en | ig | linkedin   (default: email)
  --stage=<name>     outreach | followup1 | followup2 | breakup   (default: outreach)
  --variant=<letter> force one variant instead of the deterministic split
  --limit=<n>        how many prospects to generate for (default: 25)
  --skip=<n>         skip the first n eligible prospects (default: 0)
  --data=<dir>       data directory (default: growth/data)
  --out              also write growth/out/<channel>-<stage>-<date>.md
  --help             this text
`);
}

// FNV-1a. Deterministic so re-running never reshuffles who got which variant —
// without that, the conversion report would be measuring noise.
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function loadTemplates(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".txt"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const [head, ...rest] = raw.split(/^---\s*$/m);
      const body = rest.join("---").replace(/^\n/, "").trimEnd();

      const meta = {};
      for (const line of head.split("\n")) {
        const match = line.match(/^#\s*([a-z]+):\s*(.*)$/i);
        if (match) meta[match[1].toLowerCase()] = match[2].trim();
      }

      return { file, body, ...meta };
    })
    .sort((a, b) => (a.variant ?? "").localeCompare(b.variant ?? ""));
}

// Returns the filled message plus any placeholder the data couldn't satisfy,
// so an empty `signal` shows up as a warning instead of shipping "{{signal}}"
// to a real prospect.
function render(text, vars) {
  const missing = new Set();
  const filled = text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars[key];
    if (value === undefined || value === "") {
      missing.add(key);
      return `{{${key}}}`;
    }
    return value;
  });
  return { filled, missing: [...missing] };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return usage();

  const channel = args.channel ?? "email";
  const stage = args.stage ?? "outreach";
  const limit = Number(args.limit ?? 25);
  const skip = Number(args.skip ?? 0);
  const dataDir = args.data ? path.resolve(args.data) : DEFAULT_DATA;

  // Real list if it exists, fictional sample otherwise — so a fresh clone can
  // run the tool and see what it produces before touching real prospects.
  const realPath = path.join(dataDir, "prospects.csv");
  const samplePath = path.join(dataDir, "prospects.sample.csv");
  const listPath = fs.existsSync(realPath) ? realPath : samplePath;

  if (!fs.existsSync(listPath)) {
    console.error(`No prospect list found at ${realPath}`);
    process.exit(1);
  }
  if (listPath === samplePath) {
    console.log("⚠️  Using prospects.sample.csv (fictional rows).");
    console.log("    cp growth/data/prospects.sample.csv growth/data/prospects.csv and put real ones in.\n");
  }

  const templates = loadTemplates(path.join(dataDir, "templates")).filter(
    (t) => t.channel === channel && t.stage === stage && (!args.variant || t.variant === args.variant)
  );

  if (templates.length === 0) {
    console.error(`No templates for channel="${channel}" stage="${stage}"${args.variant ? ` variant="${args.variant}"` : ""}.`);
    process.exit(1);
  }

  const field = CHANNEL_FIELD[channel] ?? "email";
  const { records } = parseCsvObjects(fs.readFileSync(listPath, "utf8"));

  const eligible = records.filter(
    (p) => !STOP_STATES.has((p.status ?? "").toLowerCase()) && (p[field] ?? "") !== ""
  );
  const batch = eligible.slice(skip, skip + limit);

  const skipped = records.length - eligible.length;
  const lines = [];
  const warnings = [];

  lines.push(`# ${channel} · ${stage} · ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push(`${batch.length} messages · ${templates.length} variant(s) in rotation · ${skipped} prospect(s) skipped (no ${field}, or closed out)`);
  lines.push("");

  for (const prospect of batch) {
    const template = templates[hash(prospect.id) % templates.length];
    const vars = { ...DEFAULTS, ...prospect };

    const body = render(template.body, vars);
    const subject = render(template.subject ?? "", vars);
    const missing = [...new Set([...body.missing, ...subject.missing])];
    if (missing.length > 0) warnings.push(`${prospect.id}: missing ${missing.join(", ")}`);

    lines.push("---");
    lines.push("");
    lines.push(`## ${prospect.business || prospect.id}${missing.length ? "  ⚠️" : ""}`);
    lines.push("");
    lines.push(`\`${prospect[field]}\` · variant **${template.variant}** · ${template.id}`);
    if (missing.length > 0) lines.push(`\n> ⚠️ unfilled: ${missing.join(", ")} — fix the CSV before sending.`);
    lines.push("");
    if (subject.filled && subject.filled !== "—") lines.push(`**Oggetto:** ${subject.filled}`);
    lines.push("");
    lines.push("```");
    lines.push(body.filled);
    lines.push("```");
    lines.push("");
    lines.push("After sending:");
    lines.push("");
    lines.push("```bash");
    lines.push(`npm run growth:log -- --id=${prospect.id} --event=sent --channel=${channel} --variant=${template.variant}`);
    lines.push("```");
    lines.push("");
  }

  const output = lines.join("\n");
  console.log(output);

  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} message(s) have unfilled placeholders:`);
    for (const w of warnings) console.log(`   ${w}`);
    console.log("   A message with an empty signal is a generic message. Fix the row or drop the prospect.");
  }

  if (args.out) {
    const outDir = path.join(ROOT, "growth/out");
    fs.mkdirSync(outDir, { recursive: true });
    const file = path.join(outDir, `${channel}-${stage}-${new Date().toISOString().slice(0, 10)}.md`);
    fs.writeFileSync(file, output, "utf8");
    console.log(`\n→ written to ${path.relative(ROOT, file)}`);
  }
}

main();
