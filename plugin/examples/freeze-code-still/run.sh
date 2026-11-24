#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected

freeze --version > output/version.txt
FREEZE_FLAGS=(-l go -t dracula -p 20 --show-line-numbers)

# </dev/null: a freeze run with an inherited open stdin hung once during probing.
render() {
  local name=$1
  shift
  freeze source.go "${FREEZE_FLAGS[@]}" "$@" -o "output/$name.svg" </dev/null >/dev/null
  freeze source.go "${FREEZE_FLAGS[@]}" "$@" -o "output/$name.png" </dev/null >/dev/null
}

render plain
render window --window
render plain-repeat
render window-repeat --window

cmp output/plain.svg output/plain-repeat.svg
cmp output/plain.png output/plain-repeat.png
cmp output/window.svg output/window-repeat.svg
cmp output/window.png output/window-repeat.png

python3 check-output.py output output/metrics.json

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "freeze-code-still: recorded expectations"
  exit 0
fi

diff -u expected/metrics.json output/metrics.json
echo "freeze-code-still: OK"
