# Godolkin — portfolio

Single-page portfolio for Godolkin with three interactive automation demos. Fully static: every demo runs client-side on real logic with bundled historical data — no backend, no API keys, nothing to abuse. Bilingual (EN/IT) via the language toggle in the header.

Live at [godolkin.dev](https://godolkin.dev).

## What this repo is

There is **no build step**. The site is a finished Claude Design export — two files — served exactly as they are:

| Path | What it is |
|------|------------|
| `public/index.html` | the whole page: markup, inline styles, and one inline script holding the demo logic and the star field |
| `public/support.js` | the Claude Design runtime the page loads |
| `public/techtron/`, `public/techtron2/` | the two Tech-Tron client mockups, served at `/techtron` and `/techtron2` |
| `public/og.png`, `public/favicon*`, `public/apple-touch-icon.png` | branded assets, regenerated with `npm run assets` |

`vercel.json` turns the build off entirely (`framework: null`, echo-only install and build commands) and points Vercel at `public/` as the output directory. Push to `main` and Vercel publishes that folder as-is.

Before v2.0 this was a Vite + React + Tailwind app under `src/`. It was removed on 2026-08-10 when the export replaced it — recover it from git history if you ever need it.

## Updating the site

When a new export comes out of Claude Design:

1. Copy its `index.html` and `support.js` into `public/`, overwriting.
2. In `index.html`, change `src="./support.js"` to `src="/support.js"`.
3. Check the page for the personal name — exports keep reintroducing it. The site carries the Godolkin brand only.
4. Commit and push to `main`.

**Edits made directly to `public/index.html` are lost on the next export.** Make lasting changes in the Claude Design source, then re-export.

## Local commands

```bash
npm run dev        # serve public/ at http://localhost:5173
npm run assets     # regenerate public/og.png + favicons (Windows-only, uses System.Drawing)
```

There is nothing to install and nothing to build — `npm run dev` is a dependency-free Node static server (`scripts/dev-server.mjs`). Opening `public/index.html` as a file will not work, because the page loads `/support.js` from the site root.

## Deploy

Continuous: every push to `main` deploys via the Vercel project connected to this repo. No environment variables are needed.

**Custom domain:** Project → Settings → Domains. The dashboard shows the exact DNS records; the standard values are:

| Host | Type  | Value                  |
|------|-------|------------------------|
| `@`  | A     | `76.76.21.21`          |
| `www`| CNAME | `cname.vercel-dns.com` |

## Analytics

The page currently ships **no analytics** — the React app's `@vercel/analytics` went with it. To add Vercel Web Analytics, enable it for the project in the dashboard and add `<script defer src="/_vercel/insights/script.js"></script>` before `</body>` in `public/index.html` (and re-add it after every export).
