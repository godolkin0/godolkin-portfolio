// The single writer for public.site_events, shared by /api/event and
// /api/cal-webhook. Not routed: Vercel treats api/_*.js as a module.
//
// Environment, set in the Vercel project (never committed):
//   SUPABASE_URL                https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY   a secret key (sb_secret_...) or the legacy
//                               service_role JWT. Either works, see below.
// Both optional: with neither set, insert() reports "not configured" and the
// caller carries on. Nothing on the site depends on this succeeding.

export function isConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Supabase has two generations of server-side key and they are authenticated
// DIFFERENTLY, which is a trap worth spelling out because getting it wrong
// fails at runtime with a misleading "Invalid JWT" rather than at deploy.
//
//   legacy service_role  a JWT, starts with eyJ. Goes on BOTH apikey and
//                        Authorization: Bearer, which is what every Supabase
//                        client has always sent.
//   new secret key       sb_secret_..., NOT a JWT. Goes on apikey ONLY. Send it
//                        as a Bearer token as well and the platform tries to
//                        parse it as a JWT and rejects the whole request.
//
// So the Bearer header is added only for a key that actually is a JWT. New
// projects issue the new format by default, and the legacy keys work until the
// end of 2026, so both have to keep working for now.
function authHeaders(key) {
  const headers = { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

export { authHeaders as headersForKey };

// Returns a short status string rather than throwing. Every caller is inside a
// request that must succeed whatever the database does: a lost analytics row is
// not worth a failed form submission or a webhook Cal.com will keep retrying.
export async function insert(row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return "not_configured";

  try {
    const response = await fetch(`${url}/rest/v1/site_events`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify(row),
    });
    if (!response.ok) {
      console.error("[supabase] insert rejected:", response.status, await response.text());
      return "rejected";
    }
    return "ok";
  } catch (error) {
    console.error("[supabase] insert threw:", error);
    return "failed";
  }
}
