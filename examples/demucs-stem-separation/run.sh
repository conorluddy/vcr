#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PYTHON="$PWD/output/venv/bin/python"
[[ -x "$PYTHON" ]] || { echo "Create output/venv with uv (Python 3.12) and pip install demucs==4.1.0 as in README.md; no automatic install." >&2; exit 1; }
export HF_HOME="$PWD/output/cache" TORCH_HOME="$PWD/output/cache" XDG_CACHE_HOME="$PWD/output/cache"

# Preflight: demucs 4.1.0 imports numpy unconditionally but does not declare it on arm64.
# Stop with a blocked message rather than installing anything.
if ! "$PYTHON" -c "import numpy" 2>/dev/null; then
  echo "demucs-stem-separation: BLOCKED. numpy is not installed in output/venv." >&2
  echo "demucs 4.1.0 imports numpy in demucs/transformer.py but declares it only for darwin/x86_64." >&2
  echo "Approve numpy for output/venv, then re-run. See README.md, Observation." >&2
  exit 3
fi
echo "preflight passed; separation stages are described in README.md and not yet implemented" >&2
exit 3
