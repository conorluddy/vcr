#!/usr/bin/env bash
# Build a small C program against Homebrew libass 0.17.5, render fixture.ass at 50 times three ways
# (sequential, a repeat of sequential, and a fixed shuffled order in one process), then run the
# predeclared checks in check.mjs. Fonts come only from the bundled fonts/ directory (no system provider).
set -euo pipefail
cd "$(dirname "$0")"
readonly EXPECTED_LIBASS_VERSION="0.17.5"
readonly RECORD_FLAG="${1:-}"

libassVersion="$(pkg-config --modversion libass)"
if [[ "$libassVersion" != "$EXPECTED_LIBASS_VERSION" ]]; then
  echo "libass-burn-in: pkg-config reports libass $libassVersion, expected $EXPECTED_LIBASS_VERSION; stop and re-plan" >&2
  exit 1
fi

rm -rf output
mkdir -p output/sequential output/repeat output/shuffled

clang -std=c11 -O2 -Wall -Wextra $(pkg-config --cflags libass) render.c $(pkg-config --libs libass) -o output/render

sequentialTimes="$(node check.mjs times sequential)"
shuffledTimes="$(node check.mjs times shuffled)"

# shellcheck disable=SC2086 # the time lists are intentionally split into one argument per time
output/render fixture.ass fonts output/sequential $sequentialTimes \
  > output/sequential/measured.jsonl 2> output/libass.log
# shellcheck disable=SC2086
output/render fixture.ass fonts output/repeat $sequentialTimes \
  > output/repeat/measured.jsonl 2> output/repeat.log
# shellcheck disable=SC2086
output/render fixture.ass fonts output/shuffled $shuffledTimes \
  > output/shuffled/measured.jsonl 2> output/shuffled.log

diff -r output/sequential output/repeat
echo "reruns byte-identical"

if [[ "$RECORD_FLAG" == "--record" ]]; then
  node check.mjs verify output --record
  echo "recorded expected/hashes.json and expected/measured.json"
  exit 0
fi
node check.mjs verify output
echo "libass-burn-in: OK"
