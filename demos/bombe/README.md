# Bombé Parma — demo preview

Static client preview for **Bombé — Pasticceria & Bistrot**
(Str. Farini 19/A · Via Emilia Est 117, Parma). Built from a Claude Design export.

Nothing here is part of the godolkin-portfolio site itself.

## Live

**https://bombe-parma-demo-godolkin.vercel.app** — Vercel project `bombe-parma-demo`.

That deployment is *not* this folder. The Vercel token could not upload 1.6 MB of assets, so
what is deployed is a ~2 KB shell per page. Each shell carries its own `<title>` and Open
Graph tags (so link previews work without JavaScript), then fetches the matching
`*.cdn.html` and writes it into the document.

| Layer | Served from | Ref |
|---|---|---|
| `index.html`, `menu.html`, `torte.html` | Vercel | the deployment |
| `*.cdn.html` — page markup | raw.githubusercontent.com | **branch**, 5 min cache |
| `assets/`, `_cdn/` — photos, fonts, runtime | jsDelivr | pinned commit |

Markup is read from the branch, so **editing copy or layout needs no redeploy** — push to
`claude/bombe-vercel-deploy-j6za9x`, regenerate the `*.cdn.html` files, and the live site
picks it up within about five minutes. Assets are pinned to a commit, so adding or changing
a photo does need the pinned SHA bumped in `*.cdn.html` and a fresh deploy.

Redeploying is awkward: the Vercel token in use can only deploy to a project **at the moment
it creates it** — it returns 403 on both production and preview deploys to any project that
already exists. That is why each redeploy so far landed on a new project name. Older,
now-stale projects: `bombe`, `bombe-parma`, `bombe-parma-preview`, `bombe-demo`.

**Do not delete this branch or make the repo private** — both hosts read from it and the live
demo goes blank. Running the self-contained deploy below removes that constraint entirely.

## How to put it online

The folder is a plain static site — no build step, no dependencies.

```bash
cd demos/bombe
npx vercel --prod          # then: Vercel dashboard -> Settings -> Deployment Protection
                           #       -> turn Vercel Authentication OFF, or the client hits a login wall
```

Or drag this folder onto https://vercel.com/new. Any static host works (Netlify, Cloudflare
Pages, S3, plain nginx); paths are relative, so serving it from a subdirectory works too.

`standalone.html` is the **home page only**, inlined into one 1.9 MB file — no server
needed, opens offline in any browser. Its "La carta" / "Torte" links only resolve if
`menu.html` and `torte.html` sit next to it.

## Files

| File | What it is |
|---|---|
| `index.html` | The site. 69 KB of markup; the Claude Design runtime renders `<x-dc>`, `<image-slot>` and `<sc-if>`. |
| `assets/` | 10 photos (webp), 11 font subsets (woff2), 4 JS files (the design runtime + React 18 UMD). |
| `menu.html` / `torte.html` | "La carta" (full price list) and "Torte" (cakes to order). |
| `og.jpg` | Link-preview card, 1200×630. |
| `favicon.svg`, `apple-touch-icon.png` | Icons. |
| `robots.txt`, `vercel.json` | `noindex` — this is a private preview, not the client's live site. |
| `standalone.html` | Single-file version of the same site. |
| `_source.Bombe_Parma_v2.dc.html` | Untouched original export. Every change below is reproducible from it. |

## Changes made to the original export

1. **Unbundled.** The export was a single 1.9 MB file with every asset base64'd inline and
   unpacked into blob URLs by JS on load. Split into real files so the browser can cache them
   and load them in parallel. Two things are easy to get wrong here: the four JS assets are
   gzipped inside the manifest (the images are not), and the bundle keeps a separate
   `ext_resources` map pointing React at unpkg.com — miss that and the runtime silently
   fails to boot, leaving a blank page below the fold.

2. **`<head>` metadata.** The export had an empty `<title>` and no meta tags: blank browser
   tab, no preview card when the link is shared. Added title, description, `theme-color`,
   icons, `lang="it"` and `noindex`. These must go *inside* the bundle's `<helmet>` block —
   the runtime replaces the whole document on load, so outer `<head>` edits are discarded.

3. **Cross-page links.** All three exports link to each other by their Claude Design
   filenames (`Bombe Parma v2.dc.html`, `Bombe Parma Menu.dc.html`,
   `Bombe Parma Torte.dc.html`). Rewritten to `index.html` / `menu.html` / `torte.html`,
   anchors included (`index.html#sedi`).

   The menu and cake pages arrived after the first deploy, which briefly shipped with
   placeholders in their place; those are gone.

4. **Shared assets.** Each export re-mints new UUIDs for byte-identical fonts and runtime,
   so the three pages together carried three copies of everything. Deduplicated by content
   hash into one `assets/` folder — about 950 KB saved. Each page's runtime is also patched
   to load React from `assets/` instead of unpkg.com, so the site has no CDN dependency.

5. **Image fallbacks.** The hero and "Storia" images on the home page, and both full-width
   bands on the menu page, are hotlinked from `dolcesalato.com`.
   When they fail the hero renders black and Storia shows a broken-image icon. A bundled
   photo now sits behind each: if the remote image loads it covers the fallback, otherwise
   a real photo still shows.

## Verified

Rendered in Chromium at 1440×900 and on iPhone 13: 12/12 local images, no console errors,
no horizontal overflow, mobile menu opens, nav and placeholder pages resolve — from the site
root, from a subdirectory, and as `standalone.html`.

Not verified: anything live. The deploy could not be completed from the session that built
this (see the notes handed over with it).

## Before this becomes the client's real site

- **Replace the hero and Storia images.** They are hotlinked from a third party's server —
  they can break at any time, and they are not the client's to serve.
- Point `og:image` at an absolute URL on the final domain — relative OG images are resolved
  inconsistently by link unfurlers.
- Drop the `noindex` in `robots.txt`, `vercel.json` and `index.html` only when it should
  actually be indexed.
