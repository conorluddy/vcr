---
name: mediapipe
description: Use MediaPipe Tasks for documented vision pipelines when its model and runtime fit the project. VCR evidence covers one generated image segmented with the CPU ImageSegmenter route only.
---

# MediaPipe

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- MediaPipe Tasks provides task APIs for vision and other media. The VCR fixture exercises one still-image segmentation task, not landmark extraction or video.
- Evidence is limited to the pinned Python Tasks package, one Apache-2.0 selfie segmentation model, one generated 256×256 silhouette, and CPU execution on macOS arm64.
- Model files have separate licences and hashes. Check the terms for the exact model and assets selected; framework licensing does not grant model rights.

## Capability map
- **Vision tasks:** the [Image Segmenter guide](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter) documents image, video, and live-stream modes and output masks. VCR tests `IMAGE` mode and a category mask for one generated input; video, live streams, confidence masks, GPU and other models are untested.
- **Other task families:** the [MediaPipe Tasks documentation](https://ai.google.dev/edge/mediapipe/solutions) routes to face, hand, pose, text, and audio tasks. These are documented discovery routes, not tested VCR support.

## Install and doctor
The fixture creates an isolated `output/venv` and installs the exact wheels in `requirements.lock.txt`:

```sh
cd examples/mediapipe-image-segmentation
./run.sh
```

MediaPipe is a project Python package, not a machine executable. `vcr doctor` does not establish that the fixture's virtualenv imports it; check with `output/venv/bin/python -c 'import mediapipe as mp; print(mp.__version__)'`.

## Smoke test
```sh
cd examples/mediapipe-image-segmentation && ./run.sh
# expect: JSON reports status="pass", a 256×256 mask, 15,073 figure pixels, and repeatMatches=true
```
The script downloads the pinned model into ignored `output/`, verifies its SHA-256, generates the input silhouette and compares two CPU inferences to `expected/segment.json`.

## Troubleshooting
- A model hash mismatch stops the fixture; do not use the downloaded file until its source and hash are reviewed.
- Missing or changed mask labels can reflect a different model/runtime path; preserve the pinned package and model before comparing output.
- Do not infer segmentation quality on photographs from the synthetic silhouette result.

## Official docs
- [MediaPipe Image Segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter)
- [MediaPipe Tasks overview](https://ai.google.dev/edge/mediapipe/solutions)
- [Selfie Segmentation model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf) (Apache-2.0)
