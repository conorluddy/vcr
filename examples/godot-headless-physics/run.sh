#!/bin/sh
set -eu
cd "$(dirname "$0")"

GODOT=${GODOT:-/Applications/Godot.app/Contents/MacOS/Godot}
MODE=${1:-}
if [ -n "$MODE" ] && [ "$MODE" != "--record" ]; then
  echo "usage: ./run.sh [--record]" >&2
  exit 2
fi
[ -x "$GODOT" ] || { echo "Godot executable not found: $GODOT" >&2; exit 1; }
VERSION=$($GODOT --headless --version | tail -n 1)
[ "$VERSION" = "4.7.2.stable.official.ed1daf0bf" ] || { echo "Unexpected Godot version: $VERSION" >&2; exit 1; }

mkdir -p output
for run in 1 2; do
  "$GODOT" --headless --audio-driver Dummy --fixed-fps 60 --path . --script res://fixture.gd -- --output "output/state-$run.json" >"output/run-$run.log" 2>&1 || {
    cat "output/run-$run.log" >&2
    exit 1
  }
done
cmp output/state-1.json output/state-2.json || { echo "Independent Godot runs differ" >&2; exit 1; }

if [ "$MODE" = "--record" ]; then
  mkdir -p expected
  cp output/state-1.json expected/physics-state.json
else
  cmp expected/physics-state.json output/state-1.json || { echo "Observed physics state differs from expected/physics-state.json" >&2; exit 1; }
fi

cat output/state-1.json
echo "OK: two Godot headless physics runs match expected state"
