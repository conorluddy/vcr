# Spark Gaussian splats in a seek-driven three.js scene

## Intent and scope

- Tool/version: `@sparkjsdev/spark` 2.4.0 (MIT) with `three` 0.186.1, Chromium 156 via Playwright 1.64.1 and `@vcr/capture`.
- Claim: a Gaussian-splat file renders through Spark inside an ordinary three.js scene, next to a solid mesh, on a camera that is a pure function of `t`, and frames are identical in sequential and shuffled order.
- Exclusions: PLY, SPZ, KSPLAT and SOG files, spherical harmonics, LoD and streaming, real photogrammetry captures, splat editing and animation, GPU variance, other machines.
- Official documentation: https://sparkjs.dev/ and https://github.com/sparkjsdev/spark; checked 2026-11-27.
- Environment: macOS 26.6 arm64, Node 22.19.0, headless Chromium (software or Metal-backed WebGL2 as the harness launches it).
- Input: `generate-splats.mjs` writes 3000 seeded splats (lime shell, coral helix) in the `.splat` layout to `output/scene.splat`, sha256 `3051e27196dd65ddae3dd91e3ee568c1aa7afe9a77944d4048b6463a4923a52e`. No third-party asset.
- Output: ignored `output/` (`frames/`, `report.json`, `summary.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: 90 frames at 960x540; shuffled order (seed `0x5eed`) matches sequential by PNG hash; 90 distinct frames; frame 0 has a transparent corner (alpha min 0, max 1).
- Inspect a contact sheet at native scale. Stop if the splats are missing, blank or sorted visibly wrong (hash equality alone is not enough).
- Expected failure: Spark's per-view async sort. If a frame is drawn before it finishes, the shuffled check fails.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. The first run used the harness's seek-then-settle path unchanged: shuffled order did not match sequential, because the sort worker had not finished when pixels were read. The scene now exposes `whenSettled()`, which redraws until `spark.sorting` is false, `sortDirty` is false and `sortedCenter` equals the camera position, then draws once more. `capture.ts` awaits it after each seek (it reuses `openScenePage` from `@vcr/capture`, not `captureFrames`). With that, 90 frames were distinct and shuffled matched sequential; the recording and verifying runs passed. The contact sheet shows a soft-edged lime sphere with coral helix arcs at the poles and a white cube partly occluded by splats, the corners transparent. Splats look blurry at this count; that is the file, not a defect.

This establishes deterministic capture of one small `.splat` scene on one machine. It does not cover other formats, large scenes, LoD or real captures.

## Smoke test
```sh
cd examples/spark-splats-capture && ./run.sh
# expect: spark-splats-capture: OK (90 frames)
```
