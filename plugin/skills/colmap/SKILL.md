---
name: colmap
description: Extract and match image features or reconstruct camera poses and 3D geometry from image collections with COLMAP. Load when a task needs structure-from-motion or multi-view stereo through its native CLI.
---

# COLMAP

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- VCR evidence covers CPU SIFT feature extraction from three generated images, plus checking the resulting SQLite tables and repeat counts on macOS arm64 with COLMAP 4.2.1.
- It does not validate matching, camera calibration, sparse/dense reconstruction, GPU operation, or reconstruction quality. Use Blender to render an existing scene; use COLMAP only when you have suitable multi-view inputs.
- Feature quality depends on the images and capture geometry. The fixture's synthetic shapes test the CLI path, not real-world reconstruction quality.

## Capability map
- CLI commands cover feature extraction/import, feature matching, sparse mappers, dense stereo, meshing, model conversion and database utilities; start with the [command index](https://colmap.github.io/cli.html) and command-specific `-h` output.
- The [feature extraction guide](https://colmap.github.io/features.html) documents SIFT and learned extractors/matchers. The [database reference](https://colmap.github.io/database.html) describes SQLite feature and geometry tables.
- VCR tests only `feature_extractor` with CPU SIFT and checks keypoints/descriptors for three owned images. Other commands and backends are documented upstream but untested here.

## Install and doctor
Install COLMAP using the [official installation instructions](https://colmap.github.io/install.html); on macOS the validated fixture used Homebrew's `colmap` formula. Check the CLI with `colmap -h`, then run `vcr doctor` to record whether it is available. The guide does not imply it is installed.

## Smoke test
```text
./examples/colmap-feature-extraction/run.sh
# expect: COLMAP 4.2.1; 3 images; 853 CPU SIFT keypoints and 128-column descriptors per image; fixture reports its JSON measurements
```
The fixture creates its input and database under ignored `output/`; exact database camera IDs may differ.

## Troubleshooting
- Extraction selects a GPU or fails on a headless machine: set `--FeatureExtraction.use_gpu 0` as the fixture does, and confirm the build supports the selected CPU backend.
- Feature counts differ from the retained output: check the exact COLMAP build and input images before updating the fixture; a changed count is not evidence of better reconstruction.
- Sparse or dense reconstruction fails after feature extraction: that workflow is outside this fixture; inspect the corresponding official command docs and validate it separately.

## Official docs
- [Installation](https://colmap.github.io/install.html)
- [Command-line interface](https://colmap.github.io/cli.html)
- [Feature extraction and matching](https://colmap.github.io/features.html)
- [Database format](https://colmap.github.io/database.html)
