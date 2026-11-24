#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

TEXT='a -> b != c'
FONT=fonts/JetBrainsMono-Bold.ttf

hb-shape --version > output/versions.txt
hb-view --version >> output/versions.txt

hb-shape --output-format=json --no-glyph-names "$FONT" "$TEXT" > output/shape-ids.json
hb-shape --output-format=json --no-glyph-names "$FONT" "$TEXT" > output/shape-ids-repeat.json
cmp output/shape-ids.json output/shape-ids-repeat.json
hb-shape --output-format=json "$FONT" "$TEXT" > output/shape-names.json

hb-view --output-format=svg --font-size=96 "$FONT" "$TEXT" -o output/view.svg
hb-view --output-format=svg --font-size=96 "$FONT" "$TEXT" -o output/view-repeat.svg
cmp output/view.svg output/view-repeat.svg
shasum -a 256 output/view.svg | cut -d' ' -f1 > output/view.sha256

python3 check-output.py output/shape-ids.json output/shape-names.json output/view.svg output/summary.json

# Inspection only: a raster copy of the SVG for a human look, not part of the claim.
rsvg-convert -w 960 output/view.svg -o output/view.png
magick output/view.png -background '#808080' -flatten output/contact.png

if [[ "${1:-}" == "--record" ]]; then
  cp output/versions.txt expected/versions.txt
  cp output/shape-ids.json expected/shape-ids.json
  cp output/shape-names.json expected/shape-names.json
  cp output/view.sha256 expected/view.sha256
  cp output/summary.json expected/summary.json
  echo "harfbuzz-shape-text: recorded expectations"
  exit 0
fi

diff -u expected/versions.txt output/versions.txt
diff -u expected/shape-ids.json output/shape-ids.json
diff -u expected/shape-names.json output/shape-names.json
diff -u expected/view.sha256 output/view.sha256
diff -u expected/summary.json output/summary.json
echo "harfbuzz-shape-text: OK"
