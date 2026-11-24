#!/usr/bin/env bash
# Render three frames of a full-screen-triangle WGSL shader through the webgpu package (Dawn) in Node,
# read them back, and check: dimensions 64x64, frame count 3, at least two distinct hashes, every pixel
# within 1 LSB of the analytic reference, the middle frame fully alpha 255, shuffled order hashes equal
# sequential, and two runs byte-identical. Diffs against expected/render.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s render > output/run-1.log 2>&1 || { cat output/run-1.log >&2; exit 1; }
cp output/render.json output/run-1.json
pnpm -s render > output/run-2.log 2>&1 || { cat output/run-2.log >&2; exit 1; }
cmp -s output/run-1.json output/render.json || { echo "dawn-node-webgpu-readback: runs differ" >&2; exit 1; }

check() {
  local expression="$1" message="$2"
  jq -e "$expression" output/render.json > /dev/null || { echo "dawn-node-webgpu-readback: check failed: $message" >&2; exit 1; }
}
check '.width == 64 and .height == 64' "dimensions are not 64x64"
check '.frames | length == 3' "frame count is not 3"
check '[.frames[].sha256] | unique | length >= 2' "fewer than two distinct frame hashes"
check '.maxChannelDeviation <= .toleranceChannel' "a pixel is outside the channel tolerance"
check '.frames[1].transparentPixelCount == 0' "middle frame has pixels that are not alpha 255"
check '.shuffledMatchesSequential == true' "shuffled order hashes differ from sequential"
check '.adapter.architecture != ""' "no adapter architecture reported"

if [[ "${1:-}" == "--record" ]]; then cp output/render.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/render.json output/render.json && echo "dawn-node-webgpu-readback: OK (webgpu $(jq -r .versions.webgpu output/render.json), node $(jq -r .versions.node output/render.json), adapter $(jq -r .adapter.vendor output/render.json) $(jq -r .adapter.architecture output/render.json), max channel deviation $(jq -r .maxChannelDeviation output/render.json))"
