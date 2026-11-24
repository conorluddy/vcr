#!/usr/bin/env bash
# nerfstudio 1.1.5 passes COLMAP 3.x option names. COLMAP 4.2.1 renamed the two GPU switches
# below, and rejects the old names. This shim renames only those two options and then runs the
# real colmap 4.2.1 binary, which still performs all feature extraction and matching.
args=()
for arg in "$@"; do
  case "$arg" in
    --SiftExtraction.use_gpu*) arg="${arg/SiftExtraction/FeatureExtraction}" ;;
    --SiftMatching.use_gpu*) arg="${arg/SiftMatching/FeatureMatching}" ;;
  esac
  args+=("$arg")
done
exec colmap "${args[@]}"
