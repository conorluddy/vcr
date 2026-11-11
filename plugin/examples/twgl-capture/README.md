# TWGL WebGL shader capture

## Intent and scope

TWGL 7.0.0 (twgl.js, core browser build `dist/7.x/twgl.js`, global `twgl`): `getWebGLContext`, `createProgramInfo`, `createBufferInfoFromArrays`, `setBuffersAndAttributes`, `setUniforms` and `drawBufferInfo` drive one fullscreen-quad fragment shader with a `time` uniform set from `t`. Context uses `preserveDrawingBuffer: true` and a premultiplied transparent clear. 90 alpha PNG frames at 1280x720, 30 fps, shuffled capture equals sequential.

Claim: TWGL helpers render a time-driven shader scene per seek, with transparent background, and the shuffled order matches sequential.

Exclusions: `twgl-full` build (its `primitives` module calls `Math.random` for random colours, so it is not used); WebGL1 vs WebGL2 backend choice beyond what Chromium picks; texture, framebuffer and multi-pass helpers; GPU driver behaviour; other browsers; any export, codec or delivery claim. Procedural original shapes only; no media, fonts or fixtures. The scene has no render loop: seek schedules one `requestAnimationFrame` draw, as the template does.

Grep of the core build for `Math.random`, `performance.now` and `Date.now`: no matches. The full build contains `Math.random` only in `randInt`, used by primitives' random colours; excluded above.

Licence: MIT. Checked 2026-11-11 against the installed package header (`dist/7.x/twgl.js`) and https://raw.githubusercontent.com/greggman/twgl.js/master/LICENSE.md. Docs: https://twgljs.org/ (reachable 2026-11-11). No codec, model or asset dependency.

## Plan, before running

Install pinned `twgl.js@7.0.0` (pre-approved) in this example, with `playwright` 1.64.1 and `tsx` 4.23.15 as in the template. Run `pnpm install`, then `examples/twgl-capture/run.sh --record`, inspect frames at 1280x720, then `examples/twgl-capture/run.sh`. Record the Chromium version from the capture report separately.

Predeclared checks (asserted by `run.sh` before `expected/summary.json` is written):
- 90 frames at 30 fps, 1280x720.
- At least two distinct frame hashes (enforced in `capture.ts`).
- Every shuffled-order hash equals its sequential hash (`shuffled_matches_sequential == true`).
- Alpha range on frame 45: minimum 0 and maximum 1.

Stop conditions: missing browser build, blank or clipped frames on inspection, shader compile errors, any mismatch in the checks above. Intended consumer is the existing browser capture harness; units are seconds and pixels. Output is a transparent PNG sequence only; no byte-budget or compression claim. Outputs stay in ignored `output/`. Input is `scene.html` itself, which git records.

Expected failure mode to watch: a time-driven shader that depends on a clock or unseeded value would fail the shuffled check.

## Observation, after running

2026-11-11, evidence agent on Conors-MacBook-Pro-2.local (macOS, Darwin 25.6.0, arm64), Node 22.19.0, twgl.js 7.0.0 (core build `dist/7.x/twgl.js`), Playwright 1.64.1, Chromium 156.0.8078.4 (probed separately; the capture report does not carry the browser version), ImageMagick 7.1.2-15. Screenshot capture route.

Runs: `run.sh --record` exited 0 and recorded `expected/summary.json`; a second `run.sh` printed `twgl-capture: OK`. The first run exercised the copied template label and printed `konva-capture: OK`; the label was corrected to `twgl-capture` before the passing run. Measured: 90 frames, 1280x720, 90 distinct SHA hashes, shuffled order equals sequential, frame 45 alpha min 0 and max 1, about 19 fps.

Context probe: `getContextAttributes()` reports `preserveDrawingBuffer: true`, `alpha: true`, `premultipliedAlpha: true`. twgl's default context request gave WebGL 1.0 (`WebGL 1.0 (OpenGL ES 2.0 Chromium)`); WebGL2 is not claimed. Scene code has one `requestAnimationFrame` call (inside `seek`) and no timers.

Inspection: the contact sheet (`output/contact.png`, transparent frames composited on grey) shows one green rounded-square outline rotating through about 3.6 rad (time × 1.2 over three seconds) and an orange disc sweeping left to right across it, with no clipping, blank frames or seams. Frame 45 at full 1280x720 shows the complete outline and disc on a transparent field.

Result: pass for the stated claim only. Not covered: WebGL2, textures and framebuffers, other GPUs or drivers, other browsers, and cross-machine pixel equality. Agent self-review only; no artistic approval claimed. Rerun on twgl, Playwright or Chromium changes.
