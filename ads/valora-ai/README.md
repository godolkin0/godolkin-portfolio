# Valora AI motion ad

A 23.5 s Italian ad for Valora built from AI-generated 3D shots (Higgsfield: GPT Image keyframes animated with Kling 3.0), with crisp text, UI cards and music laid on top.

Story, cut on a 120 BPM grid (a cut every 3 s, the drop at 6 s):

| Time | Shot | On screen |
|---|---|---|
| 0–3 | Miniature town at night, someone on the sofa with a phone | 23:47 · «Quanto vale casa mia?» |
| 3–6 | The agency is closed, the question bounces off the shutter | Nessuna risposta. |
| 6–9 | The agency lights up | Con Valora il tuo sito risponde subito. |
| 9–12 | A house scanned on a data map | Stima sui dati OMI in 30 secondi, email card |
| 12–15 | A phone on the agent's desk buzzes | Lead caldo notification, tap tap |
| 15–18 | Sunrise, espresso, phone | Ogni mattina, prima del caffè, sai chi vuole vendere. |
| 18–23.5 | Glossy house on a cream set | Trust cards, Meno lead persi. Più incarichi., logo, Richiedi una demo |

Files:

- `template.html` is the transparent text/UI layer, driven by `seek(t)`. `node build.mjs` inlines the Lucide icons into `index.html`.
- `ov.mjs` renders that layer to PNG frames with Playwright (`node ov.mjs 916 dir` or `node ov.mjs 45 dir`). The 4:5 layer is scaled to 0.86 so it fits the 1080x1350 crop.
- `music.py` synthesises the music bed and sound effects with numpy (`python3 music.py music.wav`).
- `assemble.sh` does everything: it trims each shot (`CLIP1`..`CLIP7`, local files or URLs; `IN1`..`IN7` in-points), scales to 1080x1920 at 30 fps, overlays the text layer and the music, and writes `valora-ai-9x16.mp4` and `valora-ai-4x5.mp4`. Set `PW` to the Playwright module path if Playwright is installed globally.

The shot URLs are not stored here. The names, addresses, email and price range are samples.
