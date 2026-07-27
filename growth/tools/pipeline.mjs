// The tracker. Every touch goes in, and the report tells you which message is
// actually converting instead of which one you liked writing.
//
//   node growth/tools/pipeline.mjs log --id=agenzia-x --event=sent --channel=email --variant=A
//   node growth/tools/pipeline.mjs log --id=agenzia-x --event=sale --amount=397
//   node growth/tools/pipeline.mjs report
//   node growth/tools/pipeline.mjs next
//
// Log the reply against the variant that earned it — i.e. the last one you
// sent that prospect. The generated message files print the right command
// under every message, so the honest path is also the lazy one.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvObjects, toCsvLine } from "./csv.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_DATA = path.join(ROOT, "growth/data");

const EVENTS = ["sent", "reply", "positive", "call", "sale", "dead"];
const LOG_HEADER = ["ts", "id", "channel", "variant", "event", "amount", "note"];

// Week-one target: $400 ≈ €370.
const DEFAULT_TARGET = 370;

// Below this many sends a difference between variants is noise, and the report
// says so rather than crowning a winner off four data points.
const MIN_SENDS_TO_JUDGE = 15;
const SENDS_BEFORE_KILL = 25;
const REPLY_LEAD_TO_CALL_IT = 3;

// Follow-up cadence in days, indexed by how many times you've already sent.
const CADENCE = [2, 4, 7];
const DAY_MS = 86_400_000;

function parseArgs(argv) {
  const args = { _: [] };
  for (const token of argv) {
    if (token.startsWith("--")) {
      const [key, value] = token.slice(2).split("=");
      args[key] = value === undefined ? true : value;
    } else {
      args._.push(token);
    }
  }
  return args;
}

function usage() {
  console.log(`
Pipeline tracker.

  log     --id=<slug> --event=<${EVENTS.join("|")}> [--channel=] [--variant=] [--amount=] [--note=]
  report  [--target=<eur>]     funnel, conversion by variant, gap to target
  next                         who is due a follow-up today
  help

  --data=<dir>   data directory (default: growth/data)
`);
}

function logPath(dataDir) {
  return path.join(dataDir, "log.csv");
}

function readLog(dataDir) {
  const file = logPath(dataDir);
  if (!fs.existsSync(file)) return [];
  return parseCsvObjects(fs.readFileSync(file, "utf8")).records;
}

function readProspects(dataDir) {
  const real = path.join(dataDir, "prospects.csv");
  const sample = path.join(dataDir, "prospects.sample.csv");
  const file = fs.existsSync(real) ? real : sample;
  if (!fs.existsSync(file)) return new Map();
  const { records } = parseCsvObjects(fs.readFileSync(file, "utf8"));
  return new Map(records.map((r) => [r.id, r]));
}

function cmdLog(args, dataDir) {
  const { id, event } = args;
  if (!id || !event) {
    console.error("Both --id and --event are required.");
    process.exit(1);
  }
  if (!EVENTS.includes(event)) {
    console.error(`Unknown event "${event}". Use one of: ${EVENTS.join(", ")}`);
    process.exit(1);
  }
  if (event === "sale" && !args.amount) {
    console.error("A sale needs --amount= so the report can total revenue.");
    process.exit(1);
  }

  const file = logPath(dataDir);
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, `${toCsvLine(LOG_HEADER)}\n`, "utf8");

  const row = [
    new Date().toISOString(),
    id,
    args.channel ?? "",
    args.variant ?? "",
    event,
    args.amount ?? "",
    args.note ?? "",
  ];
  fs.appendFileSync(file, `${toCsvLine(row)}\n`, "utf8");

  const suffix = args.amount ? ` €${args.amount}` : "";
  console.log(`✓ ${event}${suffix} — ${id}${args.variant ? ` (variant ${args.variant})` : ""}`);
}

function pct(part, whole) {
  if (!whole) return "—";
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function table(rows) {
  if (rows.length === 0) return;
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
  rows.forEach((row, idx) => {
    console.log("  " + row.map((cell, i) => String(cell).padEnd(widths[i])).join("  "));
    if (idx === 0) console.log("  " + widths.map((w) => "─".repeat(w)).join("  "));
  });
}

function tally(entries) {
  const counts = Object.fromEntries(EVENTS.map((e) => [e, 0]));
  let revenue = 0;
  for (const entry of entries) {
    if (counts[entry.event] !== undefined) counts[entry.event] += 1;
    if (entry.event === "sale") revenue += Number(entry.amount || 0);
  }
  return { ...counts, revenue };
}

function groupBy(entries, keyFn) {
  const groups = new Map();
  for (const entry of entries) {
    const key = keyFn(entry);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return groups;
}

function cmdReport(args, dataDir) {
  const entries = readLog(dataDir);
  const target = Number(args.target ?? DEFAULT_TARGET);

  if (entries.length === 0) {
    console.log("\nNothing logged yet.\n");
    console.log("Generate a batch:  npm run growth:messages -- --channel=email --limit=25 --out");
    console.log("Then log each send as you go. An unlogged send is a send you can't learn from.\n");
    return;
  }

  const all = tally(entries);
  const engaged = all.reply + all.positive;

  console.log("\n═══ FUNNEL ═══\n");
  table([
    ["stage", "count", "of sends"],
    ["sent", all.sent, "100%"],
    ["replied", engaged, pct(engaged, all.sent)],
    ["calls booked", all.call, pct(all.call, all.sent)],
    ["sales", all.sale, pct(all.sale, all.sent)],
  ]);

  console.log(`\n  close rate on calls: ${pct(all.sale, all.call)}`);
  console.log(`  revenue: €${all.revenue.toFixed(0)}`);

  const gap = target - all.revenue;
  if (gap > 0) {
    // Cost-per-sale in sends, so the gap converts into tonight's workload.
    const perSale = all.sale > 0 ? all.sent / all.sale : null;
    const salesNeeded = Math.ceil(gap / 397);
    console.log(`  gap to €${target}: €${gap.toFixed(0)} — ${salesNeeded} more Pilot${salesNeeded > 1 ? "s" : ""}`);
    if (perSale) console.log(`  at your current rate that's ~${Math.ceil(perSale * salesNeeded)} more sends`);
  } else {
    console.log(`  ✓ target of €${target} cleared, by €${Math.abs(gap).toFixed(0)}`);
  }

  console.log("\n═══ BY CHANNEL ═══\n");
  const byChannel = [["channel", "sent", "replies", "reply %", "calls", "sales", "revenue"]];
  for (const [channel, group] of groupBy(entries, (e) => e.channel || "—")) {
    const t = tally(group);
    byChannel.push([
      channel,
      t.sent,
      t.reply + t.positive,
      pct(t.reply + t.positive, t.sent),
      t.call,
      t.sale,
      `€${t.revenue.toFixed(0)}`,
    ]);
  }
  table(byChannel);

  console.log("\n═══ BY VARIANT ═══\n");

  // Variants only compete inside their own channel — an email subject line and
  // an Instagram opener answer different questions, and a cross-channel
  // "winner" would just be telling you which channel you picked better.
  const perChannel = new Map();
  for (const [key, group] of groupBy(entries, (e) => `${e.channel || "—"} / ${e.variant || "—"}`)) {
    const t = tally(group);
    const channel = key.split(" / ")[0];
    const stats = { key, channel, sent: t.sent, replies: t.reply + t.positive, sales: t.sale };
    if (!perChannel.has(channel)) perChannel.set(channel, []);
    perChannel.get(channel).push(stats);
  }

  const rows = [["channel / variant", "sent", "replies", "reply %", "sales", "verdict"]];
  const notes = [];

  for (const [channel, variants] of perChannel) {
    variants.sort((a, b) => b.replies / (b.sent || 1) - a.replies / (a.sent || 1));

    // A winner is only called when two variants in the same channel have both
    // had a fair run and one is clearly ahead. Everything else stays in rotation.
    const judged = variants.filter((v) => v.sent >= MIN_SENDS_TO_JUDGE);
    const lead = judged.length >= 2 ? judged[0].replies - judged[1].replies : 0;
    const hasWinner = judged.length >= 2 && lead >= REPLY_LEAD_TO_CALL_IT;

    if (judged.length < 2) {
      notes.push(`${channel}: no winner yet — needs ≥2 variants at ${MIN_SENDS_TO_JUDGE}+ sends each.`);
    } else if (!hasWinner) {
      notes.push(`${channel}: too close to call — the leader is ${lead} repl${lead === 1 ? "y" : "ies"} ahead. Keep both running.`);
    }

    for (const v of variants) {
      let verdict;
      if (hasWinner && v === judged[0]) verdict = "WINNER — send this one";
      else if (v.sent < MIN_SENDS_TO_JUDGE) verdict = `not enough data (${MIN_SENDS_TO_JUDGE - v.sent} more)`;
      else if (v.sent >= SENDS_BEFORE_KILL && v.replies === 0) verdict = "KILL — stop sending";
      else verdict = "keep testing";
      rows.push([v.key, v.sent, v.replies, pct(v.replies, v.sent), v.sales, verdict]);
    }
  }
  table(rows);

  if (notes.length > 0) {
    console.log("");
    for (const note of notes) console.log(`  ${note}`);
  }
  console.log("\n  These are directional rules of thumb at this sample size, not statistical significance.");
  console.log("  They exist to stop you switching on a hunch after three sends.\n");
}

function cmdNext(args, dataDir) {
  const entries = readLog(dataDir);
  const prospects = readProspects(dataDir);
  const now = Date.now();

  if (entries.length === 0) {
    console.log("\nNothing logged yet — nothing to follow up.\n");
    return;
  }

  const due = [];
  const live = [];

  for (const [id, group] of groupBy(entries, (e) => e.id)) {
    const events = new Set(group.map((e) => e.event));
    if (events.has("dead") || events.has("sale")) continue;

    const sends = group.filter((e) => e.event === "sent");
    const last = group.reduce((a, b) => (new Date(a.ts) > new Date(b.ts) ? a : b));
    const daysSince = (now - new Date(last.ts).getTime()) / DAY_MS;
    const name = prospects.get(id)?.business || id;

    // Anyone who has replied is a conversation, not a cold follow-up.
    if (events.has("reply") || events.has("positive") || events.has("call")) {
      live.push({ id, name, daysSince, stage: events.has("call") ? "call booked" : "replied" });
      continue;
    }

    const touches = sends.length;
    if (touches === 0 || touches > CADENCE.length) continue;
    const wait = CADENCE[touches - 1];
    if (daysSince >= wait) {
      due.push({ id, name, touches, daysSince, channel: last.channel });
    }
  }

  if (live.length > 0) {
    console.log("\n═══ LIVE CONVERSATIONS — answer these first ═══\n");
    live.sort((a, b) => b.daysSince - a.daysSince);
    table([
      ["prospect", "stage", "silent for"],
      ...live.map((p) => [p.name, p.stage, `${p.daysSince.toFixed(1)}d`]),
    ]);
    console.log("\n  Speed of reply is the highest-leverage variable you control. Do these tonight.");
  }

  console.log("\n═══ FOLLOW-UPS DUE ═══\n");
  if (due.length === 0) {
    console.log("  Nobody is due. Send new first-touches instead.\n");
    return;
  }

  due.sort((a, b) => b.daysSince - a.daysSince);
  table([
    ["prospect", "id", "touches", "since", "channel"],
    ...due.map((p) => [p.name, p.id, p.touches, `${p.daysSince.toFixed(1)}d`, p.channel || "—"]),
  ]);

  const stages = ["followup1", "followup2", "breakup"];
  const nextStage = stages[Math.min(...due.map((p) => p.touches)) - 1] ?? "breakup";
  console.log(`\n  Generate them:  npm run growth:messages -- --channel=email --stage=${nextStage} --out`);
  console.log("  Reply inside the original thread — a fresh email restarts the conversation from zero.\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? "report";
  const dataDir = args.data ? path.resolve(args.data) : DEFAULT_DATA;

  switch (command) {
    case "log":
      return cmdLog(args, dataDir);
    case "report":
      return cmdReport(args, dataDir);
    case "next":
      return cmdNext(args, dataDir);
    default:
      return usage();
  }
}

main();
