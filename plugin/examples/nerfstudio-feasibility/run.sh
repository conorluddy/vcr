#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
venv_bin="output/venv/bin"
[[ -x "$venv_bin/ns-train" ]] || { echo "Missing $venv_bin/ns-train: create output/venv and pip install nerfstudio==1.1.5" >&2; exit 1; }
colmap_version=$(colmap -h | sed -n '1s/^COLMAP //p' | cut -d ' ' -f 1)
[[ "$colmap_version" == "4.2.1" ]] || { echo "Expected COLMAP 4.2.1, found $colmap_version" >&2; exit 1; }
nerfstudio_version=$("$venv_bin/pip" show nerfstudio | sed -n 's/^Version: //p')
[[ "$nerfstudio_version" == "1.1.5" ]] || { echo "Expected nerfstudio 1.1.5, found $nerfstudio_version" >&2; exit 1; }
rm -rf output/images output/data output/train output/eval
"$venv_bin/python" generate.py output/images
"$venv_bin/ns-process-data" images \
  --data output/images --output-dir output/data \
  --sfm-tool colmap --feature-type sift --matching-method exhaustive \
  --camera-type perspective --num-downscales 0 --no-gpu --colmap-cmd "$PWD/colmap-compat.sh" --verbose
"$venv_bin/python" verify.py process output/data expected
train_start=$SECONDS
"$venv_bin/ns-train" nerfacto --data output/data --max-num-iterations 300 \
  --vis tensorboard --output-dir output/train --machine.device-type mps
train_seconds=$((SECONDS - train_start))
config=$(find output/train -name config.yml | head -n 1)
TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1 "$venv_bin/ns-render" dataset --load-config "$config" --output-path output/eval \
  --split val --rendered-output-names rgb --image-format png
"$venv_bin/python" verify.py all output/data output/train output/eval expected "$train_seconds" "$@"
