---
name: pyscenedetect
description: Detect visual shot boundaries or export scene lists with PySceneDetect's CLI or Python API. Load for hard-cut detection and shot segmentation; it does not infer semantic scene meaning.
---

# PySceneDetect

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use PySceneDetect to detect visual cuts, list scenes, save representative frames or split clips. Detection depends on the selected detector and thresholds.
- VCR validates PySceneDetect 0.7.3 with OpenCV 5.0.0.93 on macOS arm64 against a synthetic 96-frame, 24 fps clip with three authored hard cuts. The `ContentDetector` found frames 24, 48 and 72 exactly, and repeat runs matched.
- This does not establish semantic understanding, arbitrary-footage accuracy, fades, camera-motion behavior, broad recall/precision, or other detectors/backends. Use an FFmpeg scene-score filter for a lightweight rough score.

## Capability map
The versioned [0.7.3 documentation](https://www.scenedetect.com/docs/latest/) maps the CLI and Python API. Its [CLI reference](https://www.scenedetect.com/docs/latest/cli.html) covers detector commands and outputs such as scene lists, EDL/FCP/OTIO, images and split clips; the [detector reference](https://www.scenedetect.com/docs/latest/api/detectors.html) documents Content, Adaptive, Hash, Histogram and Threshold detectors; the [SceneManager API](https://www.scenedetect.com/docs/latest/api/scene_manager.html) covers programmatic processing. VCR exercises `ContentDetector`, `SceneManager`, OpenCV input, no frame skipping and known hard cuts only; other detectors, exports and APIs remain untested.

## Install and doctor
The fixture pins its dependencies in the example-local `uv.lock` and creates its environment under ignored `output/`:

```text
cd examples/pyscenedetect-hard-cuts
uv sync --locked --project . --python 3.12
uv run --locked --project . scenedetect version
vcr doctor
```
The CLI install route on macOS is `uv tool install scenedetect[opencv]`; the validated fixture instead uses a locked local environment with `scenedetect==0.7.3` and `opencv-python==5.0.0.93`. Python 3.10+ is required by the project; the fixture was run with Python 3.12.13.

## Smoke test
```text
vcr example create pyscenedetect-hard-cuts
cd examples/pyscenedetect-hard-cuts && ./run.sh
# expect: OK PySceneDetect 0.7.3: cuts [24, 48, 72] in 96 frames at 24/1 fps
```
FFmpeg generates the four-color clip. The detector threshold is 10.0, minimum scene length one frame, with no frame skipping; the fixture asserts each boundary within ±1 frame and repeat metrics match.

## Troubleshooting
- `uv sync --locked` fails: preserve the lockfile and inspect the Python version and platform wheel availability; do not silently upgrade packages.
- Cut frames differ: inspect the generated clip and probe, then check detector threshold, minimum scene length, backend and frame skipping before changing expected output.
- Splitting fails after detection: PySceneDetect delegates video output to FFmpeg (or mkvmerge); check the external executable separately with `vcr doctor`.

## Official docs
- [PySceneDetect 0.7.3 documentation](https://www.scenedetect.com/docs/latest/)
- [CLI reference](https://www.scenedetect.com/docs/latest/cli.html)
- [ContentDetector API](https://www.scenedetect.com/docs/latest/api/detectors.html)
- [0.7.3 release notes](https://github.com/Breakthrough/PySceneDetect/releases/tag/v0.7.3)
