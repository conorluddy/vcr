#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -x .venv/bin/python ]]; then
  python3.14 -m venv .venv
fi
if ! .venv/bin/python -c 'import PyOpenColorIO' >/dev/null 2>&1; then
  .venv/bin/python -m pip install --disable-pip-version-check --only-binary=:all: --no-deps -r requirements.txt
fi
exec .venv/bin/python run.py "$@"
