#!/usr/bin/env bash
# Cuts the seven AI shots to the beat grid, lays the text/UI layer and the music on top,
# and writes valora-ai-9x16.mp4 and valora-ai-4x5.mp4.
# Needs: ffmpeg, node with Playwright (set PW to its module path if it is global), python3 + numpy.
# Shots come from env vars CLIP1..CLIP7 (local paths or URLs), in story order.
set -euo pipefail
cd "$(dirname "$0")"
DUR=23.5
[ -d node_modules/@fontsource/montserrat ] || npm i --silent --no-audit --no-fund \
  @fontsource/montserrat@5 @fontsource/instrument-serif@5 @fontsource/inter@5 lucide-static@1 >/dev/null
node build.mjs
python3 music.py music.wav

# shot: in-point (s), seconds on screen, speed
SEG=("1 ${IN1:-0.4} 3.0 1" "2 ${IN2:-0.5} 3.0 1" "3 ${IN3:-0.6} 3.0 1" "4 ${IN4:-0.5} 3.0 1" \
     "5 ${IN5:-0.5} 3.0 1" "6 ${IN6:-0.5} 3.0 1" "7 ${IN7:-0.0} 5.5 ${SP7:-0.909}")
: > list.txt
for s in "${SEG[@]}"; do
  set -- $s; i=$1; ss=$2; d=$3; sp=$4
  var="CLIP$i"; src="${!var}"
  if [ -f "$src" ]; then cp "$src" "c$i.mp4"; else [ -f "c$i.mp4" ] || curl -sfL -o "c$i.mp4" "$src"; fi
  n=$(python3 -c "print(round($d*30))")
  ffmpeg -v error -y -ss "$ss" -i "c$i.mp4" -an -frames:v "$n" \
    -vf "setpts=(PTS-STARTPTS)/$sp,fps=30,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,setsar=1,tpad=stop_mode=clone:stop_duration=2,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 14 "seg$i.mp4"
  echo "file 'seg$i.mp4'" >> list.txt
done
ffmpeg -v error -y -f concat -i list.txt -c copy base.mp4

mix() { # $1 overlay dir, $2 extra crop filter or empty, $3 output
  local crop=${2:+,$2}
  ffmpeg -v error -y -i base.mp4 -framerate 30 -i "$1/%05d.png" -i music.wav -filter_complex \
    "[0:v]null${crop}[b];[1:v]null${crop}[o];[b][o]overlay=0:0:format=auto,format=yuv420p[v]" \
    -map "[v]" -map 2:a -t $DUR -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -movflags +faststart "$3"
}
node ov.mjs 916 ov916 $DUR && mix ov916 "" valora-ai-9x16.mp4
node ov.mjs 45 ov45 $DUR && mix ov45 "crop=1080:1350:0:285" valora-ai-4x5.mp4
ls -la valora-ai-*.mp4
