# Godolkin — portfolio

Single-page portfolio for Godolkin with three interactive automation demos. Every
demo runs client-side on real logic with bundled historical data: no API keys in
the browser, nothing to abuse. Bilingual (EN/IT) via the language toggle in the
header.

Live at [godolkin.dev](https://godolkin.dev).

## What this repo is

A Vite + React + Tailwind app under `src/`, with a small set of serverless
functions under `api/`.

| Path | What it is |
|------|------------|
| `src/` | the site: components, the demo logic in `src/lib/`, the graph data in `src/data/` |
| `src/copy.js` | every user-facing string, EN and IT, in one plain module |
| `src/config.js` | the deploy facts the site renders. Anything `null` is omitted from the UI |
| `api/` | serverless routes: contact form, event sink, Cal.com webhook |
| `public/` | branded assets, regenerated with `npm run assets` |
| `scripts/verify-*.mjs` | the checks that run ahead of every build |

Two entry points: `index.html` is the site, `graph.html` renders the hero graph
on its own for tuning it in isolation. The graph page carries a noindex tag.

## Local commands

```bash
npm ci             # install
npm run dev        # vite dev server
npm run verify     # demo logic, copy parity, graph integrity, API routes
npm run build      # production build into dist/
npm run assets     # regenerate public/og.png + favicons (Windows-only)
```

`npm run verify` is not a formality. It asserts that each demo resolves to the
outcome the copy promises, that EN and IT are at full key parity, that the graph
makes no claim the code contradicts, and that the signature check on the Cal.com
webhook actually rejects forgeries. It runs ahead of `build` on every deploy, so
a failure here is a failed deploy rather than a wrong page.

## Deploy

Continuous: every push to `main` deploys via the Vercel project connected to this
repo. `vercel.json` sets the build command to `npm run verify && npm run build`.

**Custom domain:** Project → Settings → Domains. The dashboard shows the exact
DNS records; the standard values are:

| Host | Type  | Value                  |
|------|-------|------------------------|
| `@`  | A     | `76.76.21.21`          |
| `www`| CNAME | `cname.vercel-dns.com` |

## Environment variables

All of these are set in the Vercel project and never committed. Every one is
optional except `RESEND_API_KEY`, and every feature degrades to nothing rather
than to an error when its variable is missing.

| Variable | Used by | What breaks without it |
|----------|---------|------------------------|
| `RESEND_API_KEY` | `api/contact.js` | the contact form returns its error state, which shows the `mailto:` fallback |
| `CONTACT_TO` / `CONTACT_FROM` | `api/contact.js` | falls back to the address in the file |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | `api/_telegram.js` | no phone alerts. Mail still delivers |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | `api/event.js` | events are logged to the function log and dropped |
| `CAL_WEBHOOK_SECRET` | `api/cal-webhook.js` | the webhook rejects every delivery, on purpose |

## Analytics

The page instruments itself. There is no third-party analytics script, no cookie,
and no consent banner, because there is nothing to consent to: the session id
lives in `sessionStorage` and dies with the tab, no IP address is stored, and
nothing a visitor types is ever sent. See the comment block at the top of
`src/lib/analytics.js`, which is the contract this depends on staying true.

What it answers: which of the six systems a visitor looks at, which demos they
actually run, how far down the page they get, whether the floating CTA earns its
place, and how many people switch to Italian.

**Setup:**

1. Run `supabase/site-events.sql` in the Supabase SQL editor. It creates
   `public.site_events` with RLS on and no policies, which is the intended end
   state: `/api/event` uses the service role key and bypasses RLS, and every
   other key is left with no way in.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
3. Optionally set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for enquiry alerts.

The SQL file ends with the queries worth running, including the one this was
built for: of the visits that reached the booking section, which demo did they
run first.

**Alerts deliberately do not hang off `/api/event`.** Anything the browser can
post, a stranger with curl can post a thousand times, and that would make the
phone a free target. The two alerts that exist are attached to things that
cannot be faked: mail actually accepted by Resend, and a webhook carrying a
valid signature.

## Bookings

The scheduler is a Cal.com iframe, so a completed booking is invisible from the
browser's side of the origin boundary. The page records interest
(`booking_widget_focused`); the confirmed booking arrives server-side at
`/api/cal-webhook`.

To wire it up: Cal.com → Settings → Developer → Webhooks → New, pointed at
`https://godolkin.dev/api/cal-webhook`, subscribed to Booking Created, Cancelled
and Rescheduled, with a secret matching `CAL_WEBHOOK_SECRET`.

## Conventions

Both are enforced by `npm run verify`, so they fail the deploy rather than the
visitor:

- **No em-dashes in anything a visitor reads**, in either language.
- **EN and IT at full parity.** A missing Italian key renders `undefined` rather
  than throwing, which is exactly the half-translated page this rules out.

There is also a standing invariant worth knowing before touching the hero or the
graph: nothing on screen at first paint may have its opacity gated on an event
or a running timeline. A hidden or throttled tab advances neither, which is how
the hero once shipped invisible. `src/components/Reveal.jsx` explains it in full.

## History

Before v2.0 this was the same React app; v2.0 briefly replaced it with a static
Claude Design export under `public/`, and v3.0 restored the build. The Tech-Tron
client mockups were served at `/techtron` and `/techtron2` and were removed from
the live site. Recover any of it from git history if needed.
