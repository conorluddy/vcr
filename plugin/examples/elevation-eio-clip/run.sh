#!/usr/bin/env bash
# First run needs network (conda-forge env, PyPI, AWS terrain tiles); later runs use output/.
set -euo pipefail
cd "$(dirname "$0")"
export MAMBA_ROOT_PREFIX="$PWD/output/mamba" EIO_CACHE_DIR="$PWD/output/cache"
ENV="$PWD/output/env"
mkdir -p output expected
if [[ ! -x "$ENV/bin/eio" ]]; then
  command -v micromamba >/dev/null || { echo "micromamba is needed to build output/env (conda-forge gdal)" >&2; exit 1; }
  micromamba create -y -q -p "$ENV" -f environment.yml
  "$ENV/bin/pip" install -q --disable-pip-version-check -r requirements.txt
fi
export PATH="$ENV/bin:$PATH"
VERSION="$(eio --version | awk '{print $NF}')"
gdalinfo --version > output/gdal-version.txt
# Warm-up clip downloads one tile into output/cache; the checked clip reads the cache.
eio clip -o output/warmup.tif --bounds -4.12 53.04 -4.03 53.10
eio clip -o output/snowdon.tif --bounds -4.12 53.04 -4.03 53.10
python check.py output/snowdon.tif "$VERSION" > output/first.json
python check.py output/snowdon.tif "$VERSION" > output/second.json
diff output/first.json output/second.json
python check.py output/warmup.tif "$VERSION" | diff - output/first.json
if [[ "${1:-}" == "--record" ]]; then
  cp output/first.json expected/metrics.json
  echo "recorded expected/metrics.json"
else
  diff expected/metrics.json output/first.json
fi
grep -q '"all_passed": true' output/first.json || { echo "KNOWN FAIL: a predeclared check failed; see output/first.json" >&2; exit 1; }
[[ "${1:-}" == "--record" ]] || echo "elevation-eio-clip: OK"
