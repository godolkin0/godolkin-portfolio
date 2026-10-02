# Valora motion ad

A 35.7 s motion-graphics ad for Valora, in the style of a fast product-explainer reel: a hook where the agency's leads get eaten, the 23:47 pain beat, the brand reveal, the owner's form and email estimate, the qualified lead landing for the agent, three trust cards, the morning ritual, and the CTA.

Everything is drawn in `template.html` (HTML/CSS, driven by `seek(t)`), so every frame is deterministic.

- `npm install`, then `node build.mjs` inlines the Lucide icons into `index.html`.
- `node render.mjs preview 1.3 8.4 ...` writes stills to `prev/` (set `PD` for another folder).
- `node render.mjs frames out.mp4 35.7` renders 1080x1920 at 30 fps. `FMT=45` renders the 4:5 cut (the camera shrinks to 0.88 and the frame is cropped to 1080x1350).
- `python3 sfx.py sfx.wav` synthesises the sound effects (numpy only), then mux with
  `ffmpeg -i v916_silent.mp4 -i sfx.wav -c:v copy -c:a aac -b:a 192k -shortest out.mp4`.
- Needs Playwright with Chromium (`PW` can point at a Playwright module path) and ffmpeg.

The funnel numbers in the hook (40, -22, -9, -6) are an illustrative example, not measured data. The names, addresses and email are samples.
