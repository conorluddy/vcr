# PySceneDetect known hard cuts

## Intent and scope

- Tool/version: PySceneDetect 0.7.3 (`scenedetect[opencv]`), ContentDetector.
- Claim: detect three known hard cuts in a generated 96-frame, 24 fps clip containing four one-second solid-colour shots; cut frame numbers must be within ±1 frame of the authored boundaries 24, 48, and 72.
- Excludes: semantic scene understanding, arbitrary footage, fades, camera motion, recall/precision beyond this fixture, and other detector thresholds or video backends.
- Official sources: [detector API](https://www.scenedetect.com/docs/latest/api/detectors.html), [SceneManager API](https://www.scenedetect.com/docs/latest/api/scene_manager.html); BSD-3-Clause. Checked 2026-11-16.
- Environment: macOS 26.6 arm64, Python 3.12, FFmpeg 9.0.2. Python dependencies are fixture-local and locked by uv; generated media and virtual environment stay under ignored `output/`.
- Input: synthetic clip generated from four original flat-color segments by FFmpeg at 96×64, 24 fps, 1 s per segment; no external media.

## Plan, before running

- Run `./run.sh --record`, inspect the generated clip and contact sheet, then `./run.sh` again.
- Use `ContentDetector(threshold=10.0, min_scene_len=1)` via `SceneManager`, with OpenCV backend and no frame skipping. Assert 96 frames at 24 fps and detected boundary frames [24, 48, 72] within ±1 frame.
- Retain only JSON metrics and CSV contact-sheet inputs; keep video, frames, thumbnails, and virtualenv under ignored `output/`. Stop if the synthetic clip’s frame count or known cuts differ, if detection misses/duplicates a boundary, or if repeat results differ.

## Observation

- Ran 2026-11-16 on `Conors-MacBook-Pro-2.local` (macOS 26.6 arm64, Python 3.12.13, FFmpeg 9.0.2). PySceneDetect 0.7.3 with OpenCV 5.0.0.93 processed 96 frames and returned cuts at [24, 48, 72], exactly matching the authored boundaries; the two runs matched.
- The contact sheet around all boundaries shows solid-color transitions at the expected frame pairs. Result: pass for this synthetic hard-cut fixture only; no semantic understanding or arbitrary-video accuracy established.
