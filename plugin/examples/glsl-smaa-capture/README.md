# glsl-smaa SMAA 1x on raw WebGL

## Intent and scope

- Tool and version: `glsl-smaa` 4.0.0 (npm, MIT; lead `shaders-smaa`, https://github.com/dmnsgn/shaders-smaa). Shader strings and lookup textures only; the library has no runtime or pass manager.
- Claim: the edges, weights and blend passes antialias a raw WebGL1 frame with no Three.js composer, and the result is seek-driven and deterministic under the `packages/capture` route.
- Exclusions: `wgsl-smaa` (WebGPU); T2x and the resolve pass (frames depend on render order); depth and colour edge modes, predication, reprojection and velocity; WebGL2; alpha input (the fixture is opaque); other GPUs, browsers, OSes; any comparison of quality against `postprocessing`'s SMAA.
- Docs and licence: package README and `LICENSE.md` in 4.0.0, MIT, read 2026-11-27. No models or other assets; lookup textures ship inside the package.
- Environment: macOS arm64, Node 22.19.0, Playwright 1.64.1 with Chromium 156.0.8078.4 (screenshot capture route), ImageMagick for counting.
- Input: original procedural shader scene in `scene.html`, hard `step` edges (diagonal stripes, ring, two thin rotating bars, a polygon), opaque.
- Install: `pnpm add glsl-smaa@4.0.0` inside this example only.

## Plan, before running

- `pnpm install`, `examples/glsl-smaa-capture/run.sh --record`, inspect, then `run.sh`.
- One frame carries its own comparison: left half is the aliased scene texture copied to screen, right half is the SMAA blend output, drawn with a scissor.
- Predeclared checks: 90 frames at 1280x720; shuffled hashes equal sequential; frame 45 alpha minimum 1 (opaque); the right half has more than 4 times the unique colours of the left half.
- Stop conditions: shader compile or link error, blank frame, SMAA half identical to the aliased half, shuffled mismatch.
- Known README warnings handled: edges and weights targets cleared every frame; lookup textures uploaded unflipped with linear filtering (4.0.0 change); SMAA 1x only, `uSubsampleIndices` zero.

## Observation, after running

- 2026-11-27, Conors-MacBook-Pro-2.local. `run.sh --record` then `run.sh` printed `glsl-smaa-capture: OK`. 90 frames, shuffled equals sequential, about 8 fps (three full-screen passes at screenshot capture).
- Frame 45 colours per half: aliased 4, SMAA 455; alpha minimum 1.
- Inspected the frame and a 4x point-sampled crop of the stripe edges: the left half shows pixel staircases, the right half smooth edges with no halo or missing geometry. Thin bars and the ring are intact (no fill loss).
- Result: pass for SMAA 1x on an opaque WebGL1 scene, deterministic per seek. Not established: WebGPU, T2x, alpha, WebGL2, image quality against other SMAA ports, other hardware.
