#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm ci --ignore-scripts
cd ../..
pnpm exec tsx examples/lottie-web-seek/capture.ts > examples/lottie-web-seek/output/run.json
cd examples/lottie-web-seek
if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/metrics.json
  echo "lottie-web-seek: OK"
fi
