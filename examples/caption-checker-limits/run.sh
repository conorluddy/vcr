#!/usr/bin/env bash
# Run caption-check (caption-checker 1.3.3 at a pinned commit, installed project-locally) with the netflix
# profile over two hand-written clean files and two files with predeclared violations. Each file runs twice:
# the two JSON reports must be byte-identical, and a per-file summary (captions, exit code, flagged cues with
# their issue kinds, advisory count) must equal expected/checks.json, which is written by hand, not recorded.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
FILES=(clean.srt clean.vtt violations.srt violations.vtt)
rm -f output/*.summary.json
for file in "${FILES[@]}"; do
  for run in 1 2; do
    set +e
    pnpm -s exec caption-check "input/$file" --standard netflix --json > "output/$file.run-$run.json" 2> "output/$file.run-$run.err"
    echo $? > "output/$file.run-$run.exit"
    set -e
  done
  cmp -s "output/$file.run-1.json" "output/$file.run-2.json" || { echo "caption-checker-limits: $file differs across reruns" >&2; exit 1; }
  jq -S --arg name "$file" --argjson exitCode "$(cat "output/$file.run-1.exit")" \
    '{($name): {captions: (.cues | length), exitCode: $exitCode, flagged, advisoryOnly, cues: [.cues[] | select(.issues | length > 0) | {n, kinds: [.issues[].kind]}]}}' \
    "output/$file.run-1.json" > "output/$file.summary.json"
done
jq -S -s 'add' output/*.summary.json > output/checks.json
diff <(jq -S . expected/checks.json) output/checks.json || { echo "caption-checker-limits: summary differs from expected/checks.json" >&2; exit 1; }
echo "caption-checker-limits: OK (caption-checker $(jq -r .version node_modules/caption-checker/package.json), node $(node --version), 4 files x 2 runs identical, $(jq -s 'length' output/*.summary.json) summaries)"
