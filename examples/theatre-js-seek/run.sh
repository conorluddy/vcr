#!/bin/sh
set -eu
cd "$(dirname "$0")"
node run.mjs ${1:-}
