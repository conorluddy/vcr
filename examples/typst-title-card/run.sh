#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
rm -rf output
mkdir -p output/variant

FONT_ARGS=(--font-path "$PWD/fonts" --ignore-system-fonts)

typst --version > output/version.txt
typst fonts "${FONT_ARGS[@]}" > output/fonts.txt
typst compile "${FONT_ARGS[@]}" title.typ output/title.svg
typst compile "${FONT_ARGS[@]}" title.typ output/title-repeat.svg
typst compile "${FONT_ARGS[@]}" --ppi 144 title.typ output/title.png
typst compile "${FONT_ARGS[@]}" --ppi 144 title.typ output/title-repeat.png
typst query "${FONT_ARGS[@]}" title.typ heading > output/query-heading.json

cp title.typ output/variant/title.typ
printf '{\n  "value": "KS-0001",\n  "label": "variant data for the data-driven check"\n}\n' > output/variant/data.json
typst compile "${FONT_ARGS[@]}" output/variant/title.typ output/variant/title.svg

set +e
python3 check-output.py output output/metrics.json
status=$?
set -e

if [[ "${1:-}" == "--record" ]]; then
  # Baseline is the observed metrics, including any false check, so reruns reproduce the same verdict.
  cp output/metrics.json expected/metrics.json
  echo "typst-title-card: recorded expectations (predeclared checks status: exit $status)"
  exit $status
fi

diff -u expected/metrics.json output/metrics.json
if [[ $status -ne 0 ]]; then
  echo "typst-title-card: predeclared checks failed"
  exit $status
fi
echo "typst-title-card: OK"
