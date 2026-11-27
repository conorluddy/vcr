#!/usr/bin/env bash
# Render three frames of a TypeScript ('use gpu') shader through TypeGPU on webgpu (Dawn) in Node, read them
# back, and check: 64x64, 3 frames, >=2 distinct hashes, every pixel within 1 LSB of the analytic reference,
# alpha 255 everywhere, shuffled order equals sequential, two runs byte-identical, generated WGSL has the
# uniform struct and both entry points. Diffs against expected/. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
pnpm -s render > output/run-1.log 2>&1 || { cat output/run-1.log >&2; exit 1; }
cp output/render.json output/run-1.json
cp output/shader.wgsl output/run-1.wgsl
pnpm -s render > output/run-2.log 2>&1 || { cat output/run-2.log >&2; exit 1; }
cmp -s output/run-1.json output/render.json && cmp -s output/run-1.wgsl output/shader.wgsl || { echo "typegpu-typed-wgsl: runs differ" >&2; exit 1; }

check() {
  jq -e "$1" output/render.json > /dev/null || { echo "typegpu-typed-wgsl: check failed: $2" >&2; exit 1; }
}
check '.width == 64 and .height == 64' "dimensions are not 64x64"
check '.frames | length == 3' "frame count is not 3"
check '[.frames[].sha256] | unique | length >= 2' "fewer than two distinct frame hashes"
check '.maxChannelDeviation <= .toleranceChannel' "a pixel is outside the channel tolerance"
check '[.frames[].transparentPixelCount] | all(. == 0)' "a pixel is not alpha 255"
check '.shuffledMatchesSequential == true' "shuffled order hashes differ"
check '.wgslHasExpectedStages == true' "generated WGSL lacks uniform struct or entry points"

if [[ "${1:-}" == "--record" ]]; then cp output/render.json output/shader.wgsl expected/; echo "recorded expected/"; exit 0; fi
diff expected/render.json output/render.json
diff expected/shader.wgsl output/shader.wgsl
echo "typegpu-typed-wgsl: OK (typegpu $(jq -r .versions.typegpu output/render.json), node $(jq -r .versions.node output/render.json), adapter $(jq -r .adapter.vendor output/render.json) $(jq -r .adapter.architecture output/render.json), max channel deviation $(jq -r .maxChannelDeviation output/render.json))"
