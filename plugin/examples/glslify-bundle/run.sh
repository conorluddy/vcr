#!/usr/bin/env bash
# Bundle input/main.frag with the glslify CLI twice, then run check.ts: the module is inlined, no pragmas or
# require() calls remain, the output compiles in headless Chromium WebGL1 and the controls fail to compile.
# Diffs output/report.json against expected/report.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm exec glslify input/main.frag -o output/bundle-1.frag
pnpm exec glslify input/main.frag -o output/bundle-2.frag
pnpm -s check
if [[ "${1:-}" == "--record" ]]; then cp output/report.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/report.json output/report.json
echo "glslify-bundle: OK (glslify $(jq -r '.pins.glslify' output/report.json), glsl-easings $(jq -r '.pins["glsl-easings"]' output/report.json), chromium $(jq -r .chromium output/environment.json), bundle sha256 $(jq -r .bundle.sha256 output/report.json))"
