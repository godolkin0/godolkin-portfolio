# Valora ad renderer

Motion edit for the Valora Meta ads, built from real screenshots (not included here).

- `render.py frames | ffmpeg ...` renders the video; `VFMT=916` (1080x1920) or `VFMT=45` (1080x1350).
- Screenshots `01`–`12` (`.jpg`/`.png`) must sit next to the script; it works from any directory and writes previews there too. Personal data is blurred at load time, and a few copy fixes are painted on (città, Italian price format, sample names).
- Runs in the Higgsfield sandbox (Montserrat ExtraBold, Liberation Sans).
