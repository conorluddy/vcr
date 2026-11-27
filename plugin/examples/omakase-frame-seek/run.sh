#!/usr/bin/env bash
# Generate a 120-frame MP4 with a 20-bit frame-number barcode, seek it by frame in Omakase Player,
# screenshot each seek, decode the barcode and compare against expected/summary.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
# Bit k of N is a 32px block (white=1) across the top 32px of testsrc2; the colour bars below are a visual check.
ffmpeg -v error -y -f lavfi -i "testsrc2=size=640x360:rate=24:duration=5" \
  -vf "geq=lum='if(lt(Y,32),255*mod(floor(N/pow(2,floor(X/32))),2),lum(X,Y))':cb='if(lt(Y,32),128,cb(X,Y))':cr='if(lt(Y,32),128,cr(X,Y))'" \
  -c:v libx264 -preset veryfast -crf 14 -pix_fmt yuv420p -g 12 -movflags +faststart output/clip.mp4
pnpm -s check > output/check.log 2>&1 || { cat output/check.log >&2; exit 1; }
cat output/check.log
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected; cp output/summary.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/summary.json output/summary.json && echo "omakase-frame-seek: OK"
