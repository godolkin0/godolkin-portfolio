// Cal.com webhook. This is the only thing on the site that knows a booking
// really happened: the scheduler is a third-party iframe, so from the browser's
// side of the origin boundary a completed booking is invisible. Everything the
// page can observe is intent, and intent is not a meeting in the calendar.
//
// Point Cal.com at https://godolkin.dev/api/cal-webhook
//   Cal.com -> Settings -> Developer -> Webhooks -> New
//   Triggers: Booking Created, Booking Cancelled, Booking Rescheduled
//   Secret: the same value as CAL_WEBHOOK_SECRET below
//
// Environment, set in the Vercel project (never committed):
//   CAL_WEBHOOK_SECRET   required. Without it this route rejects everything.
//   TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID   handled in api/_telegram.js
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY   optional, records the booking
//                        alongside the page events so the funnel has an end.
//                        A booking that alerted but was not logged is still a
//                        booking, so a database failure never fails the hook.

import { createHmac, timingSafeEqual } from "node:crypto";
import { esc, notify } from "./_telegram.js";
import { insert } from "./_supabase.js";
import { env } from "./_env.js";

// Anyone who finds this URL can post to it, and it is the one endpoint wired
// straight to a phone notification. The signature is the entire defence, so a
// missing secret fails the request closed rather than open. An unsigned webhook
// that still alerts is strictly worse than no webhook at all.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const secret = env("CAL_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[cal] CAL_WEBHOOK_SECRET is not set; refusing to trust this delivery");
    return res.status(503).json({ error: "not_configured" });
  }

  const raw = await readRawBody(req);
  const signature = req.headers["x-cal-signature-256"];
  if (!verify(raw, req.body, signature, secret)) {
    console.error("[cal] signature did not verify; delivery dropped");
    return res.status(401).json({ error: "bad_signature" });
  }

  const body = raw ? safeParse(raw) : req.body;
  if (!body) return res.status(400).json({ error: "bad_json" });

  const trigger = String(body.triggerEvent || "");
  const p = body.payload || {};
  const who = p.attendees?.[0] || {};

  const headline = {
    BOOKING_CREATED: "Call booked",
    BOOKING_RESCHEDULED: "Call rescheduled",
    BOOKING_CANCELLED: "Call cancelled",
  }[trigger];
  // Cal.com sends more trigger types than are subscribed to here, and new ones
  // appear over time. An unrecognised trigger is a 200 with no alert: it was a
  // valid, signed delivery, and telling Cal.com otherwise would earn a retry.
  if (!headline) return res.status(200).json({ ok: true, ignored: trigger });

  await notify(
    [
      `<b>${headline} · godolkin.dev</b>`,
      "",
      esc(who.name || "(no name)"),
      esc(who.email || ""),
      p.startTime ? esc(formatWhen(p.startTime, who.timeZone)) : null,
      p.title ? esc(p.title) : null,
    ]
      .filter((line) => line !== null && line !== "")
      .join("\n")
  );

  // Recorded with no session id, because the webhook arrives from Cal.com's
  // servers and carries nothing that ties it back to the browser that booked.
  // The join is by time, not by identity, which is the honest limit of a
  // cookie-free funnel and is good enough at this volume.
  await insert({ name: "booking", props: { trigger, when: p.startTime ?? null } });

  return res.status(200).json({ ok: true });
}

// Cal.com signs the exact bytes it sent. Vercel's Node runtime parses JSON
// bodies for convenience, and a re-serialised object is not guaranteed to be
// byte-identical to what was signed, so the raw stream is read first and the
// re-serialised form is only a fallback.
//
// Trying both candidates costs nothing in security: each is checked against an
// HMAC that requires the secret, so a forgery still has to produce a valid
// digest. What it buys is not rejecting real bookings because of a body-parsing
// detail of the platform.
function verify(raw, parsed, signature, secret) {
  if (typeof signature !== "string" || signature.length === 0) return false;
  const candidates = [];
  if (raw) candidates.push(raw);
  if (parsed && typeof parsed === "object") candidates.push(JSON.stringify(parsed));
  return candidates.some((candidate) => {
    const digest = createHmac("sha256", secret).update(candidate, "utf8").digest("hex");
    return safeEqual(digest, signature);
  });
}

// Length is compared first and separately: timingSafeEqual throws on a length
// mismatch rather than returning false, and the length of a signature is not a
// secret worth protecting.
function safeEqual(a, b) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Returns null when the platform has already drained the stream, which is the
// signal to fall back to the parsed body rather than to hang waiting for data
// that will never arrive.
function readRawBody(req) {
  if (req.readableEnded || req.readable === false) return Promise.resolve(null);
  return new Promise((resolve) => {
    let data = "";
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    // A stream that never emits would otherwise hold the function open until
    // the platform kills it, and Cal.com would see a timeout and retry.
    const timer = setTimeout(() => done(null), 2000);
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) done(null);
    });
    req.on("end", () => done(data));
    req.on("error", () => done(null));
  });
}

function formatWhen(iso, timeZone) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timeZone || "Europe/Rome",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
