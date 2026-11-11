# OGL capture

## Intent and scope

OGL 1.0.11 (npm `ogl`, ESM source at `node_modules/ogl/src/index.js`, no browser bundle used). Claim: `Renderer` (alpha, premultipliedAlpha, preserveDrawingBuffer), `Camera`, `Transform`, `Program` with custom shaders and `Mesh` with `Box` and `Sphere` geometry draw a scene whose transforms and a time uniform are set from `t`, one `renderer.render({scene, camera})` per seek, no render loop of its own; 90 alpha PNG frames at 1280x720, 30 fps, shuffled capture equals sequential.

Alpha is animated on purpose: the fragment shader sets alpha = 0.5 + 0.5*sin(uTime*2 + vPosition.y*3), so the meshes fade in bands by height and over t. This exercises OGL's transparent premultiplied blend (ONE, ONE_MINUS_SRC_ALPHA); it is not a rendering defect.

Exclusions: other OGL extras (Text, Tube, Path, Polyline, GLTF, Flowmap, GPGPU, RenderTarget, Post, Shadow, Texture loaders, Orbit and Raycast); WebGL1 fallback (the renderer requests WebGL2 first, and the claim does not depend on which context is granted, though the report should say which); GPU driver behaviour; other browsers; any export, codec or delivery claim.

Unseeded clocks: a grep of `node_modules/ogl/src` for `Math.random`, `performance.now` and `Date.now` returned no matches, so no feature in the claim is excluded for that reason.

Seek behaviour: OGL keeps no time-stepped state. `seek(t)` sets the time uniform, the orbit and mesh rotations, and the sphere offset from `t`, then renders once. A jump to any `t` therefore gives the same pixels as a sequential run.

Licence: Unlicense. Checked 2026-11-11 against the npm registry metadata for 1.0.11 (`"license": "Unlicense"`), the README's Unlicense section and https://registry.npmjs.org/ogl/1.0.11. The GitHub repository has no LICENSE file at `master` (raw URL returns 404), matching the card's note that the repository licence field is empty. Docs: https://github.com/oframe/ogl (reachable 2026-11-11). No codec, model or asset dependency. Procedural original shapes only.

## Plan, before running

On macOS arm64, install pinned `ogl@1.0.11` in this example (pre-approved), with `playwright` 1.64.1 and `tsx` 4.23.15 as in the template. Run `pnpm install`, then `examples/ogl-capture/run.sh --record`, inspect frames at 1280x720 with a contact sheet, then `examples/ogl-capture/run.sh`. Record the Chromium version from the capture report separately.

The scene requests `alpha: true`, `premultipliedAlpha: true` and `preserveDrawingBuffer: true`. `premultipliedAlpha` is chosen because OGL's `Program` with `transparent: true` picks blend `ONE, ONE_MINUS_SRC_ALPHA` when the renderer is premultiplied; the fragment shader writes premultiplied colour to match. The alternative (straight alpha) was not run.

Predeclared checks (asserted by `run.sh` before `expected/summary.json` is written):
- 90 frames at 30 fps, 1280x720.
- At least two distinct frame hashes (asserted in `capture.ts`).
- Every shuffled-order hash equal to its sequential hash (`shuffled_matches_sequential == true`).
- Frame 45 alpha minimum 0 and maximum 1.

Stop conditions: missing `ogl` browser-usable ESM, a blank or clipped frame on inspection, any mismatch, or a `renderer.render` call outside the seek path. Intended consumer is the existing browser capture harness; units are seconds and pixels. Outputs and reports stay in ignored `output/`; delete that directory to clean up. No cross-machine byte equality asserted.

## Observation, after running

2026-11-11, evidence agent on Conors-MacBook-Pro-2.local (hostname), macOS Darwin 25.6.0 arm64, Node v22.19.0, ogl 1.0.11, Playwright 1.64.1, Chromium 156.0.8078.4 (read from `chromium.launch().version()` in this example, since the capture report does not carry it), ImageMagick 7.1.2-15 Q16-HDRI. Screenshot capture mode (the default), WebGL context type and GPU not recorded.

Commands: `run.sh --record` exited 0; `run.sh` printed `ogl-capture: OK`. Measured: 90 frames, 1280x720, 3 s at 30 fps; 90 distinct SHA-256 frame hashes; shuffled order matched sequential for all 90 frames; frame 45 alpha minimum 0, maximum 1. Capture ran at about 14.7 fps wall-clock (the report's `frames_per_second`).

Inspection: `output/contact.png` (1920x720; frames 0, 15, 30 on the top row and 45, 60, 75 below, at 50%, flattened on mid grey). The first attempt at the suggested montage command produced a 640x360 image showing only one frame, because `-flatten` clamped to the first frame's page geometry; the sheet was rebuilt with `+repage` before `-flatten`. What the rebuilt sheet shows: a green box tumbling through the frames and an orange sphere bobbing and orbiting beside it, with the two overlapping at frames 45, 60 and 75. Both shapes shade from the upper left. Their edges and lower halves are semi-transparent in bands that change from frame to frame, which is the per-fragment alpha `0.5 + 0.5 sin(t*2 + y*3)` at work, and they show through each other where they overlap. Nothing is clipped at the frame edges and no frame is blank. This is an agent visual review only; no human approval is claimed.

Result: pass for the stated claim. Not established: WebGL1 fallback, straight-alpha output (not run), other OGL extras, other browsers or GPUs, any export or codec path.
