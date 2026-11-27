#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
checkin=a7f1c35bc0448daf15e2bafa36e510c1517534e620c452ecb314ed57d974f081
mkdir -p output
if [[ ! -x output/src/pikchr ]]; then
  rm -rf output/src && mkdir -p output/src
  curl -fsSL "https://pikchr.org/home/tarball/${checkin}/p.tar.gz" | tar xz -C output/src --strip-components=1
  [[ "$(shasum -a 256 output/src/pikchr.y | cut -d' ' -f1)" == "$(cat expected/pikchr.y.sha256)" ]] || { echo "FAIL: pikchr.y differs from pinned check-in" >&2; exit 1; }
  # Official Makefile: builds lemon, generates pikchr.c from pikchr.y, compiles with -DPIKCHR_SHELL. Nothing leaves output/.
  make -C output/src pikchr CFLAGS=-O2 >/dev/null
fi
pk=output/src/pikchr
$pk --version > output/version.txt
$pk --svg-only flow.pikchr > output/flow.svg
$pk --svg-only flow.pikchr > output/flow-repeat.svg
cmp output/flow.svg output/flow-repeat.svg
sed 's/"SVG"/"A much longer final label"/' flow.pikchr > output/flow-edited.pikchr
$pk --svg-only output/flow-edited.pikchr > output/flow-edited.svg
node check.mjs
resvg --width 960 --background white output/flow.svg output/flow.png
magick identify -format '%wx%h\n' output/flow.png > output/png-size.txt
if [[ "${1:-}" == "--record" ]]; then cp output/metrics.json expected/metrics.json; cp output/png-size.txt expected/png-size.txt; fi
diff -u expected/metrics.json output/metrics.json
diff -u expected/png-size.txt output/png-size.txt
echo "OK: pikchr-flow-svg"
