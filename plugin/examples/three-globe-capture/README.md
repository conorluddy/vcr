# three-globe capture

Status: partial, run 2026-11-24 on the primary Mac. Checks 1 to 5 pass; check 6 (arc and points presence at the predeclared threshold) fails, so `run.sh` exits 1 and the record is `partial`.

## Intent and scope

- Tool: `three-globe` 2.45.6 (npm, MIT; `official_url` https://github.com/vasturiano/three-globe), with `three` 0.186.1 as its peer and the scene renderer. Playwright and ImageMagick are the capture and check tools.
- VCR job and exact claim: a three-globe scene with a predeclared set of five points and one arc, rotated as a pure function of seek time (`rotation.y = t * 0.25`), captures deterministically in Chromium. Seeked frames at predeclared times match across shuffled and sequential capture, and the arc and points are visible in a predeclared central region.
- Explicit exclusions:
  - No network textures, tiles, fonts or GeoJSON. The globe is one flat colour (`#1b2f4a`); points and arc data are inline in `scene.html`.
  - No polygons, heatmaps, hex bins, paths, labels, HTML layers or atmosphere. `Math.random` in the library's polygon id path (`three-globe.mjs`, polygon digest) is never reached because no polygon layer is set.
  - No `animateIn` build-in, no layer transitions (duration 0), no arc dash animation: those read `performance.now`, `Date.now` or the frame ticker's wall time, so they are off.
  - No WebGPU renderer, no postprocessing, no camera motion, no mouse or pointer interaction, no `pauseAnimation`/`resumeAnimation`.
  - No per-point pixel positions: visibility is a colour-family presence count in one central crop, not a projection check.
  - No semantic claim about geographic accuracy of the projection; the lat/lng values are placed on the globe and not checked against a map.
  - Not a claim about other platforms, GPUs or Chromium versions than the ones recorded below.
- Tool documentation and licence: `three-globe` README and package.json (MIT); `three` MIT. Checked 2026-11-24 via `npm view three-globe` (version 2.45.6, licence MIT, peer `three >=0.154`). No dependency, model or asset terms beyond MIT are relevant because no asset is loaded.
- Environment: macOS (Darwin 25.6.0) arm64 Apple Silicon, Chromium via Playwright (headless, GPU via ANGLE/Metal); Node 22.19.0 with `tsx`.
- Input: none. The scene generates everything from constants in `scene.html`.
- Dependencies and installation: `three-globe@2.45.6` and `three@0.186.1` exact in `examples/three-globe-capture/package.json`, installed by `pnpm install` at the repo root (lockfile is not committed here). No global installs. Browser build: `node_modules/three-globe/dist/three-globe.min.js` (UMD, `window.ThreeGlobe`) loaded with a relative `<script src>` after `window.THREE` is set from the module build of `three`. No bundler.
- Workspace: `examples/three-globe-capture/output/` (ignored) holds frames and reports; `expected/summary.json` is the only retained file.

## Plan, before running

- Commands: `examples/three-globe-capture/run.sh --record`, then `examples/three-globe-capture/run.sh`. `run.sh` calls `pnpm capture` (`tsx capture.ts`, `captureFrames` with `verifyDeterminism: true`, 1280x720, 30 fps, 3 s, so 90 frames), then `probe.ts` for the renderer string, then ImageMagick checks on frames.
- Scene parameters: camera at z=340, FOV 40; globe radius 100 (library default); `setPixelRatio(1)`; clear colour alpha 0; globe rotation `t * 0.25` rad; five points (London, New York, Rio de Janeiro, Sydney, Tokyo) at `pointAltitude 0.03`, `pointRadius 0.8`, colour `#ff3b30`; one arc London to Tokyo at `arcAltitude 0.3`, `arcStroke 0.6`, colour `#ff6a00`; `animateIn: false`, `waitForGlobeReady: false`, both transition durations 0.

Predeclared checks (all must hold for `OK`):

1. Frame count 90, dimensions 1280x720 (from `output/report.json`).
2. `shuffled_matches_sequential` is `true` (capture's own shuffled re-render versus sequential).
3. At least two distinct frame hashes across the 90 frames (`hashes` in the report).
4. Frame 0030 (t = 1.0 s) alpha range is exactly `0 1`: transparent background and opaque globe.
5. Frame 0030 corner boxes 200x200 at all four corners have alpha mean exactly 0.
6. Frames 0000, 0030 and 0060: the central crop 960x540 at offset +160+90 contains at least 150 pixels with `r>0.6, g<0.55, b<0.35` (the orange-red family of the arc and points). This is the predeclared "arc and points visible in a region" check; the threshold is a loose presence count, not a measured quality.

Expected and recorded: `expected/summary.json` holds frames, dimensions, `shuffled_matches_sequential`, and the booleans and strings for checks 3 to 6. Measured counts and the renderer string go to `output/measurements.txt` and are reported, not diffed.

Stop conditions: a three-globe load error in the page (the harness reports it), a `__scene` timeout, or any check failing in `run.sh`. A failing check is reported as `fail` or `partial` in the record; the scene is not edited to pass. If the globe is invisible at all three central frames, that is a fail for check 6 and the README will say so.

Failure modes expected: the UMD might read a `THREE` identity different from the module build (only if the module build is loaded twice); the arc might be hidden behind the globe at some rotations (affects check 6 only through the points, which are on the front hemisphere at some time in every sample).

Reproduction: `./run.sh --record` then `./run.sh`; inspect with `cd output/frames && magick \( frame-0000.png frame-0015.png frame-0030.png +append +repage \) \( frame-0045.png frame-0060.png frame-0075.png +append +repage \) -append +repage -background '#808080' -flatten -resize 50% ../contact.png`.

## Observation, after running

- Date and executor: 2026-11-24, Claude worker agent in a git worktree off `main`, on `Conors-MacBook-Pro-2.local` (macOS 25.6.0, arm64).
- Versions: `three-globe` 2.45.6 (`dist/three-globe.min.js`, UMD), `three` 0.186.1 (`three.module.js`), Playwright 1.64.1 (`packages/capture`), Chromium 156.0.8078.4 (from the page `navigator.userAgent`), Node v22.19.0, tsx 4.23.15, ImageMagick 7.1.2-35 Q16-HDRI.
- Renderer string observed (`probe.ts`, `WEBGL_debug_renderer_info`): `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver)`. This is the software rasteriser SwiftShader, not the Apple GPU, so every result here is a CPU-rasterised WebGL result. The run did not use hardware GL.
- Commands: `./run.sh --record` (first run), then `./run.sh` (second run, exit 1). The first run wrote `expected/summary.json` with `central_crop_arc_or_point_present: false`, which was not the predeclared outcome. The expected file was then set by hand to the predeclared value `true` and not re-recorded, so the second run compares against the predeclared expectation.
- Measured results (`output/measurements.txt`, `output/report.json`):
  - Frames 90, 1280x720, 30 fps requested; capture report `frames_per_second` 17.54 (includes the determinism re-render).
  - `shuffled_matches_sequential: true`, `mismatched_frames: []`.
  - Distinct hashes: 90 of 90.
  - Frame 0030 alpha min 0, max 1.
  - Corner 200x200 alpha means at frame 0030: 0, 0, 0, 0.
  - Central crop 960x540 arc-or-point pixel counts (`r>0.6, g<0.55, b<0.35`): frame 0000 = 32, frame 0030 = 32, frame 0060 = 38. Predeclared threshold 150. Check 6 fails at all three frames.
  - Second-run frame sizes match the first run (frame 0000 38055 bytes, frame 0030 37562, frame 0060 37518), so frame content is repeatable within this host.
- Inspection of the frames at 50% (`output/contact.png`, frames 0000 to 0075 at 15-frame steps): a dark slate globe, centred, with a transparent surround. Five small red points sit on the visible hemisphere, and one thin orange arc rises above the top limb between two of them. The globe turns over the 3 s: the points move across the disc and the arc's shape changes as it rotates. The library's work is visible. The arc is about 2 px wide and each point about 5 px at full size, which explains the low pixel counts.
- Defect in the check, not the render: the threshold of 150 pixels in check 6 was set before the run, without knowing the size of the points and arc at this scale. Under the predeclared rule the check fails. I did not lower the threshold, change the colour rule or enlarge the marks after seeing the counts, because that would weaken a predeclared check. A pass would need a new predeclared check in a later run, with the marks sized or the threshold justified before running.
- Result: partial. Checks 1 to 5 pass. Check 6 fails at the predeclared threshold. `run.sh` exits 1 with a diff on `central_crop_arc_or_point_present` only.
- Deviations and limits:
  - Software WebGL (SwiftShader), not hardware. Colour and antialiasing may differ on GPUs, so the checks say nothing about other renderers.
  - Only the orange-red colour family is counted. The check does not show which points or arc are visible, nor their positions.
  - Polygon ids use `Math.random`; no polygon layer is used, so this path is not reached. The arc dash animation, layer transitions and `animateIn` are off, so no wall-clock timing is read by the scene. `performance.now` and `Date.now` exist in the build but are only reached by tween or ticker paths that are off.
  - The globe is a single flat colour with no network texture.
- What this result does and does not establish: in this scene, three-globe renders a globe, five points and one arc, through the library's own API, from the seek time alone. Repeated and shuffled renders match, and the frames have the expected count, size and alpha. It does not establish that the arc and points are visible at the predeclared region (check 6 fails), nor any hardware-GPU behaviour, nor geographic accuracy, nor any polygon, transition or animation feature.
- Reviewer, decision, follow-up and invalidation triggers: a follow-up should predeclare a visibility check sized to the marks (bigger points or a wider arc, or a per-point projection check) before running. Re-run if three-globe, three, Chromium or the renderer backend changes.
