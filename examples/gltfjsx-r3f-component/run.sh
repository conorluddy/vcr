#!/usr/bin/env bash
# gltfjsx 6.5.3 (project-local) converts a generated two-material GLB to TSX with --types, twice, and checks the result.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf output
mkdir -p output
python3 make-input.py output/crate.glb
python3 make-input.py output/crate-again.glb
cmp output/crate.glb output/crate-again.glb
# gltfjsx writes its own command line into the header, so both runs use identical arguments and output path.
pnpm exec gltfjsx output/crate.glb --types --keepnames --output output/Crate.tsx > output/gltfjsx-a.log 2>&1 || { cat output/gltfjsx-a.log >&2; exit 1; }
cp output/Crate.tsx output/Crate-run-a.tsx
pnpm exec gltfjsx output/crate.glb --types --keepnames --output output/Crate.tsx > output/gltfjsx-b.log 2>&1 || { cat output/gltfjsx-b.log >&2; exit 1; }
python3 check-output.py output/crate.glb output/Crate-run-a.tsx output/Crate.tsx output/summary.json
if [[ "${1:-}" == "--record" ]]; then
  mkdir -p expected
  cp output/summary.json expected/summary.json
  echo "gltfjsx-r3f-component: recorded expected/"
  exit 0
fi
diff -u expected/summary.json output/summary.json
echo "gltfjsx-r3f-component: OK"
