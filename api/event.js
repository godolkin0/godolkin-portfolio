// Event sink for the page's own instrumentation. A Vercel Node function, for
// the same reason as api/contact.js: the database key stays server-side.
//
// This route STORES and never alerts. That split is deliberate. Anything the
// browser can post, a stranger with curl can post a thousand times, so if a
// Telegram message hung off this endpoint the phone would be a free target.
// The two alerts that exist are attached to things a stranger cannot fake:
// a mail actually accepted by Resend (api/contact.js) and a webhook carrying a
// valid signature (api/cal-webhook.js).
//
// Environment, set in the Vercel project (never committed):
//   SUPABASE_URL                https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   service role key, bypasses RLS by design
// Both optional: with neither set the route accepts and drops, so the site runs
// exactly as before until the table exists.

// Keep in sync with EVENTS in src/lib/analytics.js.
const EVENTS = new Set([
  "page_view",
  "section_view",
  "demo_run",
  "system_opened",
  "cta_clicked",
  "language_switched",
  "booking_widget_focused",
  "contact_submitted",
  "contact_failed",
  "page_leave",
]);

const LIMITS = { name: 40, key: 40, value: 120, props: 12, path: 200, referrer: 120, session: 64 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;

  // 204 on every rejection past this point, never an error code. A beacon has
  // nobody left to read the response, and a 4xx here would only decorate the
  // function logs with noise that no one can act on.
  if (!body || !EVENTS.has(body.name)) return res.status(204).end();

  const row = {
    name: body.name,
    props: cleanProps(body.props),
    session_id: clean(body.session, LIMITS.session) || null,
    path: clean(body.path, LIMITS.path) || null,
    referrer_host: clean(body.referrer, LIMITS.referrer) || null,
    lang: clean(body.lang, 8) || null,
    viewport: clean(body.viewport, 16) || null,
  };
  // Note what is absent: req.headers["x-forwarded-for"] is never read and never
  // written. Storing it would turn an anonymous counter into personal data
  // under GDPR, and it answers no question worth asking here.

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Pre-setup, and a legitimate state to be in: the event is visible in the
    // function log and nowhere else.
    console.log("[event]", row.name, JSON.stringify(row.props));
    return res.status(204).end();
  }

  try {
    const response = await fetch(`${url}/rest/v1/site_events`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!response.ok) {
      console.error("[event] insert rejected:", response.status, await response.text());
    }
  } catch (error) {
    // A dead database must not take the page's demos down with it.
    console.error("[event] insert threw:", error);
  }
  return res.status(204).end();
}

// Flat string map, capped in both directions. Nested objects are dropped rather
// than serialised: every property this page sends is a short label, and letting
// arbitrary structure through is how an event table turns into a dumping ground.
function cleanProps(props) {
  if (!props || typeof props !== "object" || Array.isArray(props)) return {};
  const out = {};
  for (const [key, value] of Object.entries(props).slice(0, LIMITS.props)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object") continue;
    const k = clean(key, LIMITS.key);
    if (k) out[k] = clean(String(value), LIMITS.value);
  }
  return out;
}

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
