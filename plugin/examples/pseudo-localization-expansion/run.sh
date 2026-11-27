#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
node render.mjs
cp output/lines.json output/lines-first.json
node render.mjs
diff -u output/lines-first.json output/lines.json   # same strings and widths across processes
node check.mjs
magick output/t0-original.png output/t0-accented.png output/t0-bidi.png output/t1-original.png output/t1-accented.png output/t1-bidi.png output/t2-original.png output/t2-accented.png output/t2-bidi.png -append output/contact.png
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; fi
diff -u expected/metrics.json output/metrics.json
echo "OK: pseudo-localization-expansion"
