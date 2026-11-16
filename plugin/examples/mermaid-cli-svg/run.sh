#!/bin/sh
set -eu

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUT="$HERE/output"
mkdir -p "$OUT"
MODE=${1:-}
if [ -n "$MODE" ] && [ "$MODE" != "--record" ]; then
  echo "usage: $0 [--record]" >&2
  exit 2
fi

PLAYWRIGHT="$HOME/.vcr/runtime/node_modules/playwright"
CHROMIUM=$(node -e 'process.stdout.write(require(process.argv[1]).chromium.executablePath())' "$PLAYWRIGHT")
"$CHROMIUM" --version
node -e 'const fs=require("fs"); fs.writeFileSync(process.argv[1], JSON.stringify({executablePath:process.argv[2], headless:true, args:["--no-sandbox"]}, null, 2)+"\n")' "$OUT/puppeteer-config.json" "$CHROMIUM"

CLI="$HERE/node_modules/.bin/mmdc"
test "$("$CLI" --version)" = "12.0.0"
PUPPETEER_SKIP_DOWNLOAD=1 "$CLI" --input "$HERE/source.mmd" --output "$OUT/first.svg" --configFile "$HERE/mermaid-config.json" --puppeteerConfigFile "$OUT/puppeteer-config.json" --quiet
PUPPETEER_SKIP_DOWNLOAD=1 "$CLI" --input "$HERE/source.mmd" --output "$OUT/second.svg" --configFile "$HERE/mermaid-config.json" --puppeteerConfigFile "$OUT/puppeteer-config.json" --quiet
if [ "$MODE" = "--record" ]; then
  python3 "$HERE/check_output.py" "$OUT/first.svg" "$OUT/second.svg" --record "$HERE/expected/result.json"
else
  python3 "$HERE/check_output.py" "$OUT/first.svg" "$OUT/second.svg" --expected "$HERE/expected/result.json"
fi
