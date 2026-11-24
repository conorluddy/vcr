#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -rf output
mkdir -p output/frames output/versions expected

for index in 0 1 2; do
  x0=$((4 + index * 12))
  magick -size 64x64 xc:none \
    -fill 'rgba(40,220,180,0.5)' -draw "rectangle ${x0},16 $((x0 + 15)),47" \
    -fill 'rgba(255,200,40,1)' -draw "rectangle $((x0 + 4)),20 $((x0 + 11)),27" \
    -define png:color-type=6 "output/frames/frame${index}.png"
done

for index in 0 1 2; do
  cwebp -quiet -lossless "output/frames/frame${index}.png" -o "output/still${index}.webp"
  dwebp -quiet -pam "output/still${index}.webp" -o "output/still${index}.pam"
  webpmux -info "output/still${index}.webp" > "output/still-info${index}.txt"
done

img2webp -loop 0 -lossless \
  -d 100 output/frames/frame0.png \
  -d 250 output/frames/frame1.png \
  -d 400 output/frames/frame2.png \
  -o output/animation.webp
img2webp -loop 0 -lossless \
  -d 100 output/frames/frame0.png \
  -d 250 output/frames/frame1.png \
  -d 400 output/frames/frame2.png \
  -o output/animation-repeat.webp
cmp output/animation.webp output/animation-repeat.webp
webpmux -info output/animation.webp > output/webpmux-info.txt

cwebp -version > output/versions/cwebp.txt
dwebp -version > output/versions/dwebp.txt
img2webp -version > output/versions/img2webp.txt
webpmux -version > output/versions/webpmux.txt
magick -version > output/versions/magick.txt
python3 check_output.py output

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "libwebp-lossless-animation: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "libwebp-lossless-animation: OK"
