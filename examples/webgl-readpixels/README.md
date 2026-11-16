# Native WebGL readPixels fixture

## Intent and scope

- Tool ID and version/build: WebGL 1.0 exposed by Playwright-pinned Chromium; exact browser build, context attributes and renderer recorded after the run.
- VCR job and exact claim being tested: compile and draw a minimal time-uniform triangle through the browser's native WebGL API, then inspect pixels directly with `readPixels`.
- Explicit exclusions: WebGL 2, libraries such as Three.js/PixiJS/TWGL, textures, framebuffers, animation loops, cross-browser/GPU portability, and production graphics quality.
- Documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API and https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels (checked 2026-11-16).
- Environment: macOS arm64, Node.js v25.6.1, fixture-local Playwright 1.64.1. Browser runtime and renderer are recorded from the actual launch; expected backend is SwiftShader software GL.
- Input: original inline shader and triangle in `scene.html`; no external asset.
- Dependencies and install plan: fixture-local exact `playwright@1.64.1` via `npm install --prefix examples/webgl-readpixels --save-exact playwright@1.64.1`. Reuse the already-installed matching Playwright Chromium cache at `~/Library/Caches/ms-playwright`; install Chromium only if absent. No repository-root packages are changed.
- Output: ignored `output/triangle.png` screenshot and logs; compact `expected/metrics.json` is retained.

## Plan, before running

- Exact commands: `./examples/webgl-readpixels/run.sh --record` once, then `./examples/webgl-readpixels/run.sh` twice.
- Chromium launch flags: `--use-gl=angle --use-angle=swiftshader --enable-webgl --ignore-gpu-blocklist`, headless, 30-second launch/navigation cap.
- Scene: WebGL 1 canvas 96x72, constant opaque color triangle, opaque dark clear color, vertex offset set as an explicit uniform. Disable blend and dither; call `finish()` before `readPixels()`.
- Predeclared checks: shader compiles and links; `readPixels` returns 96x72 RGBA bytes; triangle colored-pixel count exceeds 500 and its bounds lie inside the frame; three uniform times produce distinct frame hashes; explicit sequential times `[0,0.5,1]` and shuffled times `[1,0,0.5]` produce identical corresponding hashes; renderer and Chromium version repeat exactly.
- Expected artifacts: `expected/metrics.json`, `output/triangle.png`. The screenshot is inspected at native scale.
- Stop conditions: stop or report partial if WebGL context is unavailable, browser cannot launch, renderer is not the recorded software route, shader errors occur, geometry checks fail, or shuffled outputs differ.
- Reproduction: run from the repository root. `run.sh --record` intentionally updates only the retained metrics.

## Observation, after running

- 2026-11-16, `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64, Node.js v25.6.1, Playwright 1.64.1, Chromium 156.0.8078.4. WebGL 1.0 / OpenGL ES 2.0 Chromium, ANGLE on Vulkan 1.3.0 SwiftShader (`LLVM 10.0.0`); software rendering, no physical GPU claim.
- `./examples/webgl-readpixels/run.sh --record` and two separate `./examples/webgl-readpixels/run.sh` launches passed. Every run reported the same version, renderer, context attributes, `readPixels` hashes and geometry. Three sequential hashes were `d475c5d5`, `12446f99`, `3de97401`; shuffled order exactly matched `[1,0,0.5]`. Mid-frame readback was 27,648 RGBA bytes with 1,442 triangle pixels in bottom-left bounds `[17,13,78,58]`.
- Inspected `output/triangle.png` at native scale: the centered green triangle is visible against the dark opaque canvas with no blank render.
- Pass for a native WebGL 1 triangle using a uniform to change horizontal position, exact `readPixels` inspection, and same-run-order independence under Chromium's SwiftShader software renderer. WebGL 2, physical GPU drivers, other browsers and platforms are not established.
- The sandboxed Chromium launch stopped before page load because macOS denied Chromium's Mach port rendezvous. Re-running the pinned fixture with the authorized browser execution path succeeded. Playwright 1.64.1 was installed fixture-locally; Chromium 156.0.8078.4 was already in the user's Playwright cache, so no browser download or repository-root install occurred.
