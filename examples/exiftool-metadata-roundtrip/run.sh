#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
ffmpeg -v error -y -f lavfi -i testsrc=size=64x48:rate=1 -frames:v 1 output/input.png
ffmpeg -v error -y -i output/input.png -q:v 2 output/input.jpg
for format in png jpg; do
  cp "output/input.$format" "output/tagged.$format"
  exiftool -q -overwrite_original \
    -XMP-dc:Title="VCR metadata fixture" \
    -XMP-dc:Rights="CC0 fixture; no rights claimed" \
    -EXIF:Artist="VCR fixture" \
    "output/tagged.$format"
  cp "output/tagged.$format" "output/stripped.$format"
  exiftool -q -overwrite_original -all= "output/stripped.$format"
done
python3 check_output.py "$@"
