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

MMDR="$OUT/cargo/bin/mmdr"
if [ ! -x "$MMDR" ]; then
  echo "missing $MMDR; install with: cargo install --locked --root $OUT/cargo mermaid-rs-renderer@0.3.1" >&2
  exit 1
fi
test "$("$MMDR" --version)" = "mmdr 0.3.1"
if otool -L "$MMDR" | grep -qiE 'chrom|webkit|electron'; then
  echo "mmdr links a browser engine; the browser-free claim does not hold" >&2
  exit 1
fi

PLAYWRIGHT="$HOME/.vcr/runtime/node_modules/playwright"
CHROMIUM=$(node -e 'process.stdout.write(require(process.argv[1]).chromium.executablePath())' "$PLAYWRIGHT")
node -e 'const fs=require("fs"); fs.writeFileSync(process.argv[1], JSON.stringify({executablePath:process.argv[2], headless:true, args:["--no-sandbox"]}, null, 2)+"\n")' "$OUT/puppeteer-config.json" "$CHROMIUM"

CLI="$HERE/node_modules/.bin/mmdc"
test "$("$CLI" --version)" = "12.0.0"

"$MMDR" --version
"$CLI" --version
"$MMDR" -i "$HERE/source.mmd" -o "$OUT/mmdr-first.svg"
"$MMDR" -i "$HERE/source.mmd" -o "$OUT/mmdr-second.svg"
"$MMDR" -i "$HERE/source.mmd" -e png -o "$OUT/mmdr.png"
"$MMDR" --size -i "$HERE/source.mmd" > "$OUT/mmdr-size.json"
PUPPETEER_SKIP_DOWNLOAD=1 "$CLI" --input "$HERE/source.mmd" --output "$OUT/mmdc.svg" --configFile "$HERE/mermaid-config.json" --puppeteerConfigFile "$OUT/puppeteer-config.json" --quiet

CHECK_ARGS="--mmdr-svg $OUT/mmdr-first.svg --mmdr-svg-repeat $OUT/mmdr-second.svg --mmdr-png $OUT/mmdr.png --mmdr-size-json $OUT/mmdr-size.json --mmdc-svg $OUT/mmdc.svg"
if [ "$MODE" = "--record" ]; then
  python3 "$HERE/check_output.py" $CHECK_ARGS --record "$HERE/expected/result.json"
else
  python3 "$HERE/check_output.py" $CHECK_ARGS --expected "$HERE/expected/result.json"
fi
python3 "$HERE/time_renders.py" "$MMDR" "$CLI" "$HERE/source.mmd" "$HERE/mermaid-config.json" "$OUT/puppeteer-config.json" "$OUT"
