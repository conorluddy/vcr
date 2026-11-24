#!/usr/bin/env bash
# Write a 100-splat synthetic PLY, convert it with splat-transform (translate, scale, opacity filter) to PLY,
# compressed PLY and SOG twice, read each output back, require PLY and compressed PLY reruns to be byte-identical,
# and diff output/summary.json against expected/. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf output && mkdir -p output
pnpm -s make-input > output/make-input.log 2>&1 || { cat output/make-input.log >&2; exit 1; }
pnpm -s convert > output/convert.log 2>&1 || { cat output/convert.log >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/summary.json expected/summary.json; echo "recorded expected/summary.json"; exit 0; fi
diff expected/summary.json output/summary.json || { echo "splat-transform-convert: summary differs from expected/" >&2; exit 1; }
echo "splat-transform-convert: OK (splat-transform $(jq -r .versions.splatTransform output/summary.json), node $(jq -r .versions.node output/summary.json), sog rerun byte-identical: $(jq -r .sog.rerunByteIdentical output/rerun.json), not gated)"
