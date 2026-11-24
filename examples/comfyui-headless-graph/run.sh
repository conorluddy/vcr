#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1
PORT="${COMFY_PORT:-8188}"
BASE_URL="http://127.0.0.1:$PORT"
SRC="$PWD/output/src"
PY="$PWD/output/venv/bin/python"
BASE="$PWD/output/comfy"
[[ -x "$PY" && -f "$SRC/main.py" ]] || { echo "Install ComfyUI v0.46.0 and output/venv as in README.md; no automatic install." >&2; exit 1; }
if curl -s --max-time 2 "$BASE_URL/system_stats" >/dev/null 2>&1; then
  echo "port $PORT already answers; stop that server or set COMFY_PORT" >&2
  exit 1
fi
rm -rf output/results output/comfy output/server.log output/listen.txt
mkdir -p output/comfy/input
"$PY" -m pip --disable-pip-version-check freeze > output/dependencies.txt
"$PY" generate_input.py "$BASE/input/vcr-fixture-input.png" > output/generate.log 2>&1 || { cat output/generate.log >&2; exit 1; }

# Server: CPU only, loopback only, no custom nodes, no manager, no auto-launch, no metadata, offline.
# --cache-none re-executes every node on each submission, so the resubmission is a real second run.
DO_NOT_TRACK=1 "$PY" "$SRC/main.py" --cpu --listen 127.0.0.1 --port "$PORT" --base-directory "$BASE" \
  --disable-auto-launch --disable-metadata --disable-all-custom-nodes --disable-product-tips --offline \
  --cache-none > output/server.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 240); do
  if curl -s --max-time 2 "$BASE_URL/system_stats" >/dev/null 2>&1; then break; fi
  kill -0 "$SERVER_PID" 2>/dev/null || { echo "server exited; see output/server.log" >&2; cat output/server.log >&2; exit 1; }
  sleep 1
done
curl -s --max-time 2 "$BASE_URL/system_stats" >/dev/null || { echo "server not ready after 240 s; see output/server.log" >&2; exit 1; }
lsof -nP -iTCP:"$PORT" -sTCP:LISTEN > output/listen.txt || true

"$PY" submit.py "$BASE_URL" workflow.json output/results run-a || { echo "run-a failed" >&2; exit 1; }
"$PY" submit.py "$BASE_URL" workflow.json output/results run-b || { echo "run-b failed" >&2; exit 1; }
kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true
trap - EXIT

"$PY" check.py output/results output/listen.txt "$PORT" "$BASE/input/vcr-fixture-input.png" > output/checks.json || { cat output/checks.json >&2; exit 1; }
if [[ "${1:-}" == "--record" ]]; then mkdir -p expected && cp output/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json output/checks.json && echo "comfyui-headless-graph: OK"
