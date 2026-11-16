#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
version=$(colmap -h | sed -n '1s/^COLMAP //p' | cut -d ' ' -f 1)
[[ "$version" == "4.2.1" ]] || { echo "Expected COLMAP 4.2.1, found $version" >&2; exit 1; }
rm -rf output
python3 generate.py output/images
colmap feature_extractor \
  --database_path output/database.db \
  --image_path output/images \
  --ImageReader.single_camera 1 \
  --FeatureExtraction.use_gpu 0 \
  --FeatureExtraction.num_threads 2 \
  --log_level 1
python3 verify.py output/database.db output/images expected/features.json "$@"
