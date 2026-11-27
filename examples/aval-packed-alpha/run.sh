#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

command -v ffmpeg >/dev/null || { echo "FAIL: ffmpeg not on PATH (the AVAL compiler shells out to it)"; exit 1; }
command -v ffprobe >/dev/null || { echo "FAIL: ffprobe not on PATH"; exit 1; }
encoders="$(ffmpeg -hide_banner -encoders 2>/dev/null)"
for encoder in libx264 libx265 libvpx-vp9; do
  grep -q " $encoder " <<<"$encoders" || { echo "FAIL: ffmpeg lacks encoder $encoder"; exit 1; }
done
[[ -x node_modules/.bin/avl ]] || { echo "FAIL: run pnpm install (missing @pixel-point/aval-compiler)"; exit 1; }

rm -rf output
mkdir -p output/project
node make-frames.mjs output/project
cp motion.json output/project/
(cd output/project && ../../node_modules/.bin/avl compile motion.json --out ../first >/dev/null && ../../node_modules/.bin/avl compile motion.json --out ../second >/dev/null)

# Boundary: a project declaring opaque output must refuse transparent frames.
sed 's/"alpha": "packed"/"alpha": "opaque"/' motion.json > output/project/opaque.json
if (cd output/project && ../../node_modules/.bin/avl compile opaque.json --out ../opaque >/dev/null 2>../opaque.err); then
  echo "opaque-alpha project compiled (expected refusal)" >&2; exit 1
fi
echo "opaque refusal: $(head -c 200 output/opaque.err | tr '\n' ' ')"

node check.mjs output/first output/second > output/summary.json
montage_source="output/project/frames"
if command -v magick >/dev/null; then
  magick montage "$montage_source/frame-0000.png" "$montage_source/frame-0007.png" "$montage_source/frame-0015.png" "$montage_source/frame-0022.png" \
    -background '#445' -tile 4x1 -geometry +4+4 output/contact.png
fi

if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; fi
diff -u expected/summary.json output/summary.json
echo "OK: aval-packed-alpha"
