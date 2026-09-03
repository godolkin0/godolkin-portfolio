# Bombé Parma — demo preview

Static client preview for **Bombé — Pasticceria & Bistrot** (Str. Farini 19/A · Via Emilia Est 117, Parma).

Deployed as its own Vercel project (`bombe`) with **Root Directory = `demos/bombe`**.
Nothing here is part of the godolkin-portfolio site itself.

## Files

| File | What it is |
|---|---|
| `index.html` | The full site. Self-unpacking Claude Design bundle (~1.9 MB): HTML template + all images, fonts and JS inlined as base64, expanded into blob URLs on load. |
| `menu.html` / `torte.html` | Placeholder pages for "La carta" and "Torte". The original design linked to two sibling `.dc.html` pages that were never exported, so those links were dead. |
| `og.jpg` | Link-preview card, 1200×630, cropped from the storefront photo. |
| `favicon.svg`, `apple-touch-icon.png` | Icons. |
| `robots.txt`, `vercel.json` | `noindex` (this is a private preview, not the client's live site) + clean URLs. |
| `_source.Bombe_Parma_v2.dc.html` | Untouched original export from Claude Design. Keep it — every edit below is reproducible from it. |

## Changes made to the original export

1. **`<head>` metadata** — the export had an empty `<title>` and no meta tags. Added title, description,
   Open Graph + Twitter card, favicon, `theme-color`, `noindex`, and `lang="it"`.
   These go *inside* the bundle's `<helmet>` block: the runtime replaces the whole document on load,
   so anything added to the outer `<head>` is discarded.
2. **Dead links** — 5 links pointed at `Bombe Parma Menu.dc.html` (×2) and `Bombe Parma Torte.dc.html` (×3),
   including the main gold CTA. Rewritten to `/menu` and `/torte`.
3. **Image fallbacks** — the hero and "Storia" images are hotlinked from `dolcesalato.com`.
   When they fail the hero goes black and Storia shows a broken-image icon. A bundled photo now sits
   behind each one: if the remote image loads it covers the fallback, otherwise a real photo still shows.

## Editing the bundle

`index.html` is generated, not hand-edited. The template lives in the
`<script type="__bundler/template">` block as a JSON string.

Critical: when re-serializing that block, escape `</` as `</`. `JSON.stringify` alone emits a
literal `</script>` which closes the script tag early and silently destroys the page.

For anything larger, re-export from Claude Design and re-apply the three changes above.

## Known limitations

- The hero and Storia images are third-party hotlinks. Replace them with the client's own files before any real launch.
- `menu.html` / `torte.html` are placeholders, not the real menu.
- `og.jpg` is cropped from a phone photo that carries a "REDMI 13" camera watermark; the crop removes it.
