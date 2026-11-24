# gl-transitions Fade in raw WebGL, seeked by progress

Status: partial, 2026-11-24 (not-validated: the predeclared alpha check could not measure alpha; see Observation). Backfill.

## Intent and scope

- Tool: `gl-transitions` 3.3.0 (npm, exact pin in this example's `package.json`), transition `Fade` (author gre, licence MIT per the file header and the package's `gl-transitions.json`).
- Docs and licence, checked 2026-11-24: https://gl-transitions.com/ and https://github.com/gl-transitions/gl-transitions (README). The npm tarball ships `LICENSE` (MIT) and `gl-transitions.js`, a browser build that sets `window.GLTransitions`. Per-file licences vary across the collection (the catalogue card notes some BSD files); only `Fade` is used here.
- VCR job and exact claim: "One gl-transitions shader (Fade) run in raw WebGL between two generated solid-colour textures is a pure function of progress: seeked frames at progress 0, 0.5 and 1 give predeclared pixel colours, and shuffled-order capture equals sequential capture."
- Exclusions: no other transition (`wipeLeft` is not in the collection; `Fade` is the one used); no alpha claim (the output is opaque; the alpha check only confirms full coverage); no image or video inputs; no parameters (Fade has none); no SkSL, Metal, WGSL or GLSL 3 targets; no WebGL 2; no cross-GPU or cross-driver equality, only this host's renderer; no encode to a movie; no claim about other transitions' correctness.
- Environment: macOS (Darwin 25.6.0), Apple M3 host, Chromium via Playwright, WebGL 1. Renderer string recorded at run time from `WEBGL_debug_renderer_info`.
- Input: generated, no external assets. Two 2x2 opaque textures: from `rgb(200,40,0)`, to `rgb(0,120,255)`. Shader wrapper defines `getFromColor`, `getToColor`, `progress`, `ratio` and `main` around the library's `transition(vec2 uv)`.
- Dependencies and installation: `gl-transitions@3.3.0` in `examples/gl-transitions-seek/node_modules` only, installed with the workspace `pnpm install`. Playwright and `@vcr/capture` come from the existing workspace. No global installs. Network: registry access during `pnpm install` only; the run uses a loopback server.
- Workspace paths: `output/` (ignored), `expected/summary.json` (retained facts only, no media).

## Seek model

`progress = clamp(t / 2 s, 0, 1)`. Each seek sets progress from `t` and schedules a draw on `requestAnimationFrame`; no state is stepped between seeks, so order cannot matter. Fade is stateless, so this is a direct test of the seek path, not of state rebuild.

## Plan, before running

- Commands: `pnpm install` at the repository root, then `examples/gl-transitions-seek/run.sh --record`, then `examples/gl-transitions-seek/run.sh`. Versions: gl-transitions 3.3.0 (pinned), playwright and tsx as in the template (`^1.64.1`, `^4.23.15`; the exact resolved versions are recorded in Observation), Node per the repo engines (>=22), ImageMagick 7.1.2 for pixel probes.
- Capture: `captureFrames` in screenshot mode, 640x360, 30 fps, explicit frames 0..60 (t = 0..2 s, progress 0..1 in 1/60 steps). Frame 60 is outside the harness's default range on purpose, so progress 1 is captured. `verifyDeterminism: true` captures the same frames in the harness's seeded shuffled order (seed 0x5eed) and compares hashes.
- Predeclared checks (all must hold for pass):
  1. Frame count is 61 (frames 0000 to 0060 present).
  2. Dimensions are 640x360.
  3. At least 2 distinct frame hashes across the 61 frames.
  4. Shuffled-order hashes equal sequential hashes for all 61 frames.
  5. Centre pixel at progress 0 (frame 0000) is `rgb(200,40,0)` within 2 per channel. At progress 0.5 (frame 0030) it is `rgb(100,80,128)` within 2 (exact mix is 127.5 in blue). At progress 1 (frame 0060) it is `rgb(0,120,255)` within 2.
  6. Each of those three frames is one colour (ImageMagick unique-colour count 1), so the whole frame follows the shader.
  7. Frame 0030 alpha min 1 and max 1 (opaque, full coverage). Amended before the evidence was recorded: see Observation. The first record pass used `-alpha extract`, which read a default opaque value from a PNG with no alpha channel, so it measured nothing. The amended check records the channel state and whether the frame is opaque.
- Expected artifacts: `output/frames/frame-NNNN.png` (61 files, ignored), `output/report.json`, `output/summary.json`, `output/capture.log`; retained `expected/summary.json` holds booleans and counts only.
- Stop conditions: no WebGL context, shader compile or link failure, or missing `window.GLTransitions` is `blocked` (the scene throws with the message). A failed predeclared check is `fail` for that check; a determinism failure is `fail`. Any pass-with-caveat is `partial` and says what failed.
- Expected failure modes: GPU or software rounding beyond 2 per channel at progress 0.5; a missing alpha channel in the PNG (then alpha min and max would read as opaque by default and must be inspected, not trusted).
- Reproduction: `examples/gl-transitions-seek/run.sh`. Inspect with the contact sheet command in step 7 of the evidence skill, and `magick identify -verbose output/frames/frame-0030.png` for channels.

## Observation, after running

Result: **partial**. Checks 1 to 6 pass. Check 7 as predeclared (alpha range) could not measure alpha, because the captured PNG has no alpha channel. The check was amended to record the channel state and opacity, so the claim's pass does not rest on alpha.

Versions and environment (2026-11-24, executor: Claude agent, `hostname` Conors-MacBook-Pro-2.local, macOS arm64):

- gl-transitions 3.3.0 (exact), transition `Fade`, MIT, library holds 227 transitions.
- Playwright 1.64.1; Chromium 156.0.8078.4 (the build Playwright launches, from a launch probe, since the capture report does not carry it); tsx 4.23.15.
- Node v22.19.0; ImageMagick 7.1.2-35 Q16-HDRI.
- Renderer (`WEBGL_debug_renderer_info`): `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver)`. This is software rendering, not Metal or a hardware GPU.

Commands and runs:

1. `pnpm install` at the root (adds this example's dependencies).
2. `examples/gl-transitions-seek/run.sh --record`: the first pass, with the vacuous alpha probe. Replaced before any evidence was recorded.
3. `examples/gl-transitions-seek/run.sh --record` again, after the amendment. Expected recorded.
4. `examples/gl-transitions-seek/run.sh`: prints `gl-transitions-seek: OK (61 frames, ...)`, exit 0.

Measured:

- Frames: 61 (0000 to 0060, t = 0 to 2 s, progress 0 to 1), 640x360.
- Distinct hashes: 61. Shuffled order (seed 0x5eed) equals sequential for every frame: `mismatched_frames` is empty.
- Centre pixel, tolerance 2 per channel: progress 0 `200,40,0` (expected 200,40,0); progress 0.5 `100,80,128` (expected 100,80,128, exact mix 127.5 in blue); progress 1 `0,120,255` (expected 0,120,255). All three within tolerance.
- Each of frames 0000, 0030, 0060 is a single colour (unique-colour count 1).
- Alpha: `%A` is `Undefined` (no alpha channel), `%[opaque]` is True.
- Timing (not retained): about 3.1 to 3.4 s wall for 61 frames, about 18 to 19 fps, SwiftShader.

Inspection (`output/contact.png`, six seeked frames 0, 12, 24, 36, 48, 60 at 50% scale, not retained): a smooth ramp from red-orange at progress 0, through a muted red and mauve, to a blue-purple, ending at solid bright blue at progress 1. Nothing is blank, clipped or banded. The picture is what a linear crossfade of two flat colours should look like, so the sheet shows the shader working, not a spatial effect.

Deviations and limitations:

- Check 7 was amended after the first record pass (see Plan). The original form could not measure alpha on this output. This is disclosed here and in the evidence result.
- The example lists only `gl-transitions` in `example.json` `tools`, following the batch rule that integration adds shared dependencies and back-links. `webgl`, `playwright` and `imagemagick` are used but not listed, so their records do not yet cite this example.
- `pnpm vcr catalog build` and `pnpm vcr plugin build` were not run, per the batch rule; `pnpm validate` reports only the two accepted stale-output diagnostics.
- Nondeterminism: none observed across two record passes and one verification pass; the shuffled check covers ordering, not repeated process launches on other hosts.

What this establishes: on this host, under Chromium's SwiftShader WebGL 1, the `Fade` GLSL from the gl-transitions browser build renders as a pure function of progress for the seek route, including shuffled order, with the predeclared colours at progress 0, 0.5 and 1.

What it does not establish: alpha; other transitions (including `wipeLeft`, which is not in the collection); transitions with parameters or textures; Metal or other GPUs; WebGL 2; the SkSL or other targets; real footage inputs; or quality of any transition beyond this flat-colour case.

Reviewer, decision, follow-up: a reviewer should decide whether `partial` is the right label given the amended alpha check. Revisit on a hardware-GPU host (Metal), if an alpha or textured-input claim is needed, or if the gl-transitions version changes.
