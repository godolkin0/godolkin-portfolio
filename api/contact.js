// Contact form endpoint. A Vercel Node function, which is the reason the form
// can exist at all: the mail provider's API key lives in the environment here
// and never reaches the browser. The page itself stays static.
//
// Required environment variable, set in the Vercel project (never committed):
//   RESEND_API_KEY   an API key from resend.com, free tier is enough
// Optional:
//   CONTACT_TO       where to deliver. Defaults to the address below.
//   CONTACT_FROM     verified sender. Defaults to Resend's shared test sender,
//                    which only delivers to the account owner's own address.

const TO = process.env.CONTACT_TO || "godolkin0@gmail.com";
const FROM = process.env.CONTACT_FROM || "Godolkin site <onboarding@resend.dev>";

// Caps, not validation theatre: they stop a hand-rolled POST from mailing a
// megabyte through the endpoint.
const LIMITS = { name: 120, email: 200, company: 160, message: 5000, interests: 12 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  if (!body) return res.status(400).json({ error: "bad_json" });

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const company = clean(body.company, LIMITS.company);
  const message = clean(body.message, LIMITS.message);
  const interests = Array.isArray(body.interests)
    ? body.interests.slice(0, LIMITS.interests).map((x) => clean(x, 40)).filter(Boolean)
    : [];

  // Name and a plausible email are the only hard requirements. Anything more
  // and a real enquiry gets turned away for filling the form in the wrong order.
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Fail loudly in the log and honestly to the visitor: the form's error state
    // shows the mailto: fallback, so a missing key costs the enquiry nothing.
    console.error("[contact] RESEND_API_KEY is not set; enquiry was not delivered");
    return res.status(500).json({ error: "not_configured" });
  }

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    interests.length ? `Interested in: ${interests.join(", ")}` : null,
    "",
    message || "(no message)",
  ].filter((line) => line !== null);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `godolkin.dev enquiry from ${name}`,
        text: lines.join("\n"),
      }),
    });

    if (!response.ok) {
      console.error("[contact] resend rejected the message:", response.status, await response.text());
      return res.status(502).json({ error: "delivery_failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[contact] delivery threw:", error);
    return res.status(502).json({ error: "delivery_failed" });
  }
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
