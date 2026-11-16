# COLMAP CPU feature-extraction fixture

## Intent and scope

- **Tool/version:** COLMAP 4.2.1, installed from Homebrew formula 4.2.1_5; CPU SIFT backend.
- **Claim:** extract SIFT features from three generated PPM views and verify image, keypoint and descriptor records in COLMAP's SQLite database.
- **Exclusions:** feature matching, camera pose estimation, sparse or dense reconstruction, GPU execution, real photographs, output quality, and other versions or platforms.
- **Documentation:** [COLMAP installation](https://colmap.github.io/install.html), [feature extraction CLI](https://colmap.github.io/cli.html). Checked 2026-11-16.
- **Environment:** macOS 26.6 arm64 (Darwin 25.6.0), Homebrew COLMAP 4.2.1_5, Python 3.15.2 and SQLite from the Python standard library.
- **Input and dependencies:** `generate.py` creates three original 384×288 PPM views from deterministic geometric shapes. No external images or datasets. The fixture needs COLMAP and Python 3; it uses no Python packages.
- **Side effects:** creates generated PPM files and a SQLite database under ignored `output/`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. Each run clears its ignored output, regenerates the images, invokes `colmap feature_extractor` with GPU disabled, and inspects the resulting database.
- **Checks:** exact COLMAP version; three expected images; nonempty keypoint rows with six columns; descriptor rows matching keypoints with 128 columns; repeated per-image counts match `expected/features.json`.
- **Stop conditions:** unexpected runtime version, extraction error, missing image/feature rows, unexpected descriptor dimensions, or changed counts.
- **Inspection:** inspect `view-01.ppm` with any image viewer. It is an authored geometric pattern, not a reconstruction target or quality benchmark.

## Observation, after running

- **Result:** pass. `./run.sh --record` and a separate clean-output `./run.sh` succeeded.
- **Measurements:** each of three 384×288 views produced 853 SIFT keypoints. Each database record has six keypoint columns and 853 descriptors with 128 columns. Per-image counts matched on repeat.
- **Runtime:** COLMAP 4.2.1 (Homebrew 4.2.1_5), CPU SIFT, two extraction threads, macOS 26.6 arm64, host `Conors-MacBook-Pro-2.local`.
- **Visual inspection:** inspected one generated input; it contains the intended colored geometric texture.
- **Limits:** this verifies feature extraction and database output only. It does not validate matching, camera calibration or reconstruction, dense stereo, GPU behavior, photographs or other environments.
