# MediaPipe image segmentation fixture

## Intent and scope

- **Tool/version:** MediaPipe Tasks 1.2.3, `ImageSegmenter` in `IMAGE` mode with the CPU delegate.
- **Claim:** load one official segmentation model, process an owned 256×256 synthetic silhouette, and return a stable binary category mask.
- **Exclusions:** natural-image segmentation quality, videos, landmark tasks, GPU execution, other models, operating systems and backends.
- **Documentation and model terms:** [MediaPipe Image Segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter), [Selfie Segmentation model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf). The official model card states Apache License 2.0. Checked 2026-11-16.
- **Environment:** macOS arm64, Python 3.15.2. The exact runtime details and package model hash are in `expected/segment.json`.
- **Input:** generated geometric silhouette, created by `segment.py`; no person photo or external image asset.
- **Dependencies:** exact Python wheels are pinned in `requirements.lock.txt`. The official 244 KB model downloads to ignored `output/` and is verified by SHA-256 before use.
- **Side effects:** creates a local venv and writes model, input and mask files only under ignored `output/`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. Both run two separate CPU inference passes.
- **Checks:** model and generated input hashes; 256×256 uint8 mask with labels 0 and 255; the zero-valued figure region's bounds and pixel count; identical raw mask hash across the two inference passes; exact environment and output comparison against `expected/segment.json`.
- **Stop conditions:** wheel installation failure, model hash mismatch, missing mask, unexpected mask dimensions or labels, nondeterministic repeats, or changed expected output.
- **Inspection:** inspect the generated input and `output/mask.png` at native size. Images are generated locally and are not retained in the repository.

## Observation, after running

- **Result:** pass. `./run.sh --record` and a separate `./run.sh` verification both passed. Each run performed two CPU inferences and compared their raw mask bytes.
- **Measurements:** 256×256 uint8 mask with 15,073 zero-valued figure pixels and 50,463 pixels labelled 255; figure bounds `[66,33,192,246]`. Raw mask SHA-256 `0a25295ef7b7d59998a7576a777e8c5d5c2ef833dc64d061fedb66e3b3de2ee0`; repeated inferences matched.
- **Runtime:** MediaPipe 1.2.3, Python 3.15.2, NumPy 2.5.5, macOS 26.6 arm64 (Darwin 25.6.0), CPU/XNNPACK backend, host `Conors-MacBook-Pro-2.local`. Model SHA-256 `191ac9529ae506ee0beefa6b2c945a172dab9d07d1e802a290a4e4038226658b`; input SHA-256 `8d1a31720fbd49bfd5878c3810b174c891aa4ec12b7c5bb2f2e59492bfd56e78`.
- **Visual inspection:** the generated mask outlines the synthetic silhouette against the background. No photo or other external image was used.
- **Limits:** this validates one model, one generated image, the Python Tasks API and CPU execution on one Mac. It does not establish natural-image quality, video, landmark tasks, GPU execution or other models/platforms.
