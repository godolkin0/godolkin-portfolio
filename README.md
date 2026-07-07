# Godolkin — portfolio

Single-page portfolio for Godolkin with three interactive automation demos. Fully static: every demo runs client-side on real logic with bundled historical data — no backend, no API keys, nothing to abuse. Bilingual (EN/IT) via the language toggle in the header.

## Stack

Vite + React + Tailwind CSS v4. The demo logic lives in dependency-free modules under `src/lib/` (the Polymarket demo is a faithful JS port of the real bot's `weather.py`/`edge.py` math), scenario data under `src/data/`, all user-facing copy in `src/i18n.jsx`, and personal/deploy facts (domain, repo URL, Telegram, timezone…) in `src/config.js` — fill in the `TODO(blenard)` values there as they become real.

## Local dev

```bash
npm install
npm run dev        # dev server
npm run verify     # sanity-check the demo logic (scenario outcomes, triage rules, report math)
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run assets     # regenerate public/og.png + favicons (Windows-only, uses System.Drawing)
```

## Deploy (free)

No environment variables are needed anywhere. Pick one platform:

### Option A — Vercel

One-off deploy from the project root (log in when prompted):

```bash
npx vercel --prod
```

Vercel auto-detects Vite (build `npm run build`, output `dist`). For continuous deploys instead, push the project to a GitHub repo and import it at vercel.com/new — every push then deploys automatically.

**Custom domain:** Project → Settings → Domains → add your domain. The dashboard shows the exact DNS records to create at your registrar; the standard values are:

| Host | Type  | Value                  |
|------|-------|------------------------|
| `@`  | A     | `76.76.21.21`          |
| `www`| CNAME | `cname.vercel-dns.com` |

### Option B — Netlify

`netlify.toml` is already in the repo (build `npm run build`, publish `dist`). One-off deploy:

```bash
npx netlify-cli deploy --prod --build
```

Or connect the GitHub repo at app.netlify.com for continuous deploys.

**Custom domain:** Site configuration → Domain management → add your domain. Easiest is switching nameservers to Netlify DNS (the UI walks you through it); otherwise create an `A` record for `@` → `75.2.60.5` and a `CNAME` for `www` → `<your-site>.netlify.app` (the dashboard shows your exact values).

## After the first deploy (important)

1. Open `index.html` and replace every `https://godolkin.example` placeholder (canonical, `og:url`, `og:image`, `twitter:image`) with the real URL — link previews in Slack/WhatsApp/LinkedIn won't show the branded card until you do. Redeploy.
2. Test the unfurl with a validator (e.g. opengraph.xyz or the LinkedIn Post Inspector).
3. Fill in `src/config.js`: bot repo URL and/or demo video (this reveals the "See the real code" / "Watch it run" buttons), Telegram handle, booking link, confirmed timezone.

## Analytics (optional, cookieless)

Two ready-to-uncomment snippets sit in `index.html`:

- **Plausible** (paid, privacy-first): uncomment the snippet and set `data-domain` to your domain.
- **Vercel Web Analytics** (free tier): enable it for the project in the Vercel dashboard (Analytics tab), then uncomment the `/_vercel/insights/script.js` snippet.
- On Netlify, **Netlify Analytics** is a paid, server-side add-on — no code change needed, just enable it in the dashboard if you want it.
