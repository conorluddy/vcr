#!/usr/bin/env bash
# Build a perspective x lookAt view-projection with gl-matrix in Node, project five points, check them
# against closed-form NDC within 1e-6, and require byte-identical JSON across two runs; diffs against
# expected/projection.json. --record rewrites expected/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
pnpm -s project > output/run-1.log 2>&1 || { cat output/run-1.log >&2; exit 1; }
cp output/projection.json output/run-1.json
pnpm -s project > output/run-2.log 2>&1 || { cat output/run-2.log >&2; exit 1; }
cmp -s output/run-1.json output/projection.json || { echo "glmatrix-camera-projection: runs differ" >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then cp output/projection.json expected/; echo "recorded expected/"; exit 0; fi
diff expected/projection.json output/projection.json && echo "glmatrix-camera-projection: OK (gl-matrix $(jq -r .versions.glMatrix output/projection.json), node $(jq -r .versions.node output/projection.json), max NDC error $(jq -r .maxAbsErrorNdc output/projection.json))"
