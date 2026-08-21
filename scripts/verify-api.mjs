// Sanity checks for the server routes — run as part of `npm run verify`.
//
// These exist because the two routes they cover fail in ways nothing else
// catches. A dropped analytics event is invisible by design, and a webhook
// whose signature check is subtly wrong either rejects every real booking or,
// far worse, accepts forged ones. Neither shows up in a build, and neither
// shows up on the page. So they get asserted here instead.

import { createHmac } from "node:crypto";
import event from "../api/event.js";
import cal from "../api/cal-webhook.js";

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

console.log("— /api/event —");
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

if (secret === undefined) delete process.env.CAL_WEBHOOK_SECRET;
else process.env.CAL_WEBHOOK_SECRET = secret;

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
