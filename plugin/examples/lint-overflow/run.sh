#!/usr/bin/env bash
# Lint the deliberately broken 9:16 frame and assert vcr lint reports exactly the rail crossing
# and the clipped box, with exit 1. No media is produced.
set -euo pipefail
cd "$(dirname "$0")"
# pnpm runs the vcr script from the repository root, so pass the scene by absolute path.
mkdir -p output
status=0
pnpm -s vcr lint "$PWD/scene.html" --safe-zone tiktok --json > output/lint.json 2> output/lint.log || status=$?
[[ "$status" == 1 ]] || { cat output/lint.log >&2; echo "lint-overflow: expected exit 1, got $status" >&2; exit 1; }
found=$(jq -c '[.findings[] | [.rule, .selector]] | sort' output/lint.json)
expected='[["TYPO-SAFE","#rail-title"],["overflow","#overflow-box"]]'
[[ "$found" == "$expected" ]] || { echo "lint-overflow: expected $expected, got $found" >&2; exit 1; }
echo "lint-overflow: OK (2 findings, exit 1)"
