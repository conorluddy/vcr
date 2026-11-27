#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output expected
node run.mjs > output/first.json 2> output/first.err
node run.mjs > output/second.json 2> output/second.err
diff output/first.json output/second.json
cat output/first.err
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
  echo "c2pa-ts-read-manifest: OK (signerReportedUntrusted is a recorded KNOWN FAIL)"
fi
