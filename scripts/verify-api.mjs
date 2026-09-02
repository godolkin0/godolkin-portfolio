// Sanity checks for the server routes — run as part of `npm run verify`.
//
// These exist because the two routes they cover fail in ways nothing else
// catches. A dropped analytics event is invisible by design, and a webhook
// whose signature check is subtly wrong either rejects every real booking or,
// far worse, accepts forged ones. Neither shows up in a build, and neither
// shows up on the page. So they get asserted here instead.

import { createHmac } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

// Stripped BEFORE the routes are imported, and this is load-bearing rather
// than tidy. These checks call the real handlers, and the handlers do real
// work when they find real credentials: `npm run verify` runs as part of the
// Vercel build, where all of these are set. The first deploy proved it by
// writing three fixture rows into the live analytics table and sending a
// Telegram alert announcing a booking that did not exist.
//
// Unset, insert() reports "not_configured" and notify() returns false, so
// every handler still runs end to end and every assertion below still means
// what it says. What these checks actually test is routing, validation and
// the signature comparison, none of which need a database or a phone.
for (const key of [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
]) {
  delete process.env[key];
}

const { default: event } = await import("../api/event.js");
const { default: cal } = await import("../api/cal-webhook.js");
const { headersForKey, isConfigured } = await import("../api/_supabase.js");
const { default: telegramCheck } = await import("../api/telegram-check.js");
const { env } = await import("../api/_env.js");

let failures = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}  →  ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`
  );
}

function mockRes() {
  const r = { code: null, body: null, headers: {} };
  r.status = (c) => ((r.code = c), r);
  r.json = (b) => ((r.body = b), r);
  r.end = () => r;
  r.setHeader = (k, v) => void (r.headers[k] = v);
  return r;
}

// readableEnded: true models the request Vercel actually hands a function once
// it has parsed the body, which is the case the signature check has to survive.
// It is also the case that cannot be reproduced locally with `vite dev`, so if
// it is not asserted here it is not asserted anywhere.
function mockReq(method, body, headers = {}) {
  return { method, body, headers, readableEnded: true, on: () => {} };
}

// The guard that keeps the guard honest. If someone later removes the strip
// above, or adds a credential the loop does not know about, this fails here
// instead of quietly resuming writes to the live table on the next deploy.
console.log("— Isolation —");
check("the checks cannot reach the live database", isConfigured(), false);
check("the checks cannot reach Telegram", Boolean(process.env.TELEGRAM_BOT_TOKEN), false);

console.log("\n— /api/event —");
let res = mockRes();
await event(mockReq("GET"), res);
check("GET is rejected", res.code, 405);

res = mockRes();
await event(mockReq("POST", { name: "not_a_real_event" }), res);
check("an event outside the allowlist is dropped", res.code, 204);

res = mockRes();
await event(mockReq("POST", { name: "demo_run", props: { demo: "lead-triage" } }), res);
check("a known event is accepted", res.code, 204);

res = mockRes();
await event(mockReq("POST", '{"name":"page_view"}'), res);
check("a string body is parsed", res.code, 204);

res = mockRes();
await event(mockReq("POST", "not json at all"), res);
check("a garbage body does not throw", res.code, 204);

// Supabase's two server-side key formats authenticate differently, and sending
// the new one as a Bearer token fails at RUNTIME with a misleading "Invalid JWT"
// rather than at deploy. That is precisely the failure nobody would think to
// look for, so it gets pinned here.
// A token pasted into a dashboard with a trailing newline reads as correct on
// screen and fails at the API with an error that blames the token. That cost a
// real afternoon, so the trimming is asserted rather than assumed, and the
// second check is what stops a future edit from quietly reintroducing a raw
// process.env read that skips it.
console.log("\n— Environment reading —");
process.env.__VERIFY_PADDED__ = "  padded-value\n";
check("surrounding whitespace is stripped", env("__VERIFY_PADDED__"), "padded-value");
delete process.env.__VERIFY_PADDED__;
check("a missing variable reads as empty", env("__VERIFY_ABSENT__"), "");

const rawReaders = readdirSync(new URL("../api/", import.meta.url))
  .filter((f) => f.endsWith(".js") && f !== "_env.js")
  .filter((f) => /process\.env/.test(readFileSync(new URL(`../api/${f}`, import.meta.url), "utf8")));
check("every route reads the environment through env()", rawReaders.join(", ") || "none", "none");

console.log("\n— Supabase key formats —");
const legacy = headersForKey("eyJhbGciOiJIUzI1NiJ9.fake.signature");
check("a legacy JWT key is sent as a Bearer token", legacy.Authorization?.startsWith("Bearer eyJ"), true);
check("a legacy JWT key is also sent as apikey", legacy.apikey?.startsWith("eyJ"), true);

const modern = headersForKey("sb_secret_abc123");
check("a new secret key is sent as apikey", modern.apikey, "sb_secret_abc123");
check("a new secret key is NOT sent as a Bearer token", "Authorization" in modern, false);

console.log("\n— /api/cal-webhook —");
const secret = process.env.CAL_WEBHOOK_SECRET;
delete process.env.CAL_WEBHOOK_SECRET;
res = mockRes();
await cal(mockReq("POST", {}, {}), res);
check("an unconfigured secret fails closed", res.code, 503);

process.env.CAL_WEBHOOK_SECRET = "verify-only-secret";
const booking = {
  triggerEvent: "BOOKING_CREATED",
  payload: {
    title: "15min",
    startTime: "2026-09-01T09:00:00Z",
    attendees: [{ name: "Test", email: "t@example.com", timeZone: "Europe/Rome" }],
  },
};
const sign = (body) =>
  createHmac("sha256", "verify-only-secret").update(JSON.stringify(body), "utf8").digest("hex");

res = mockRes();
await cal(mockReq("POST", booking, { "x-cal-signature-256": sign(booking) }), res);
check("a valid signature is accepted", res.code, 200);

res = mockRes();
await cal(mockReq("POST", booking, { "x-cal-signature-256": "deadbeef" }), res);
check("a wrong signature is rejected", res.code, 401);

res = mockRes();
await cal(mockReq("POST", booking, {}), res);
check("a missing signature is rejected", res.code, 401);

// Full digest length, so this exercises the constant-time comparison itself
// rather than the length short-circuit sitting in front of it.
res = mockRes();
await cal(mockReq("POST", booking, { "x-cal-signature-256": "0".repeat(64) }), res);
check("a same-length forgery is rejected", res.code, 401);

// Cal.com sends more trigger types than this route subscribes to, and it retries
// anything that is not a 2xx. An unrecognised but correctly signed delivery has
// to be accepted quietly rather than argued with.
const ended = { ...booking, triggerEvent: "MEETING_ENDED" };
res = mockRes();
await cal(mockReq("POST", ended, { "x-cal-signature-256": sign(ended) }), res);
check("an unsubscribed trigger is a signed no-op", [res.code, res.body?.ignored], [200, "MEETING_ENDED"]);

// The diagnostic route reports on the alerting setup, so an unauthenticated one
// would hand a stranger the bot's identity and the chat ids that talk to it.
// The key is the only thing standing in front of that.
console.log("\n— /api/telegram-check —");
const diagReq = (query) => ({ method: "GET", url: "/api/telegram-check", query, headers: {} });

res = mockRes();
await telegramCheck(diagReq({}), res);
check("a missing key is rejected", res.code, 401);

res = mockRes();
await telegramCheck(diagReq({ key: "not-the-secret" }), res);
check("a wrong key is rejected", res.code, 401);

// Same length as the real secret, so this exercises the constant-time compare
// rather than the length short-circuit in front of it.
res = mockRes();
await telegramCheck(diagReq({ key: "x".repeat("verify-only-secret".length) }), res);
check("a same-length wrong key is rejected", res.code, 401);

res = mockRes();
await telegramCheck(diagReq({ key: "verify-only-secret" }), res);
check("the right key is accepted", res.code, 200);
// TELEGRAM_BOT_TOKEN was stripped at the top of this file, so the route reports
// that and stops rather than reaching for the network.
check("it reports the missing token instead of calling out", /TELEGRAM_BOT_TOKEN is not set/.test(res.body?.verdict ?? ""), true);

if (secret === undefined) delete process.env.CAL_WEBHOOK_SECRET;
else process.env.CAL_WEBHOOK_SECRET = secret;

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
