# Three.js TSL NodeMaterial render fixture

## Intent and scope

- **Tool/version:** Three.js `three` 0.187.0, exact version pinned in this fixture.
- **Claim:** build a TSL node graph (`uv()` and a mutable uniform) into `MeshBasicNodeMaterial`, render a generated full-frame gradient plane through `WebGPURenderer`, and verify sample pixels plus repeatability after uniform updates in sequential/shuffled order.
- **Exclusions:** no hand-written GLSL, external assets, lighting, postprocessing, broad material or shader-feature support, or claim for a different renderer class.
- **Documentation:** [official WebGPURenderer guide](https://threejs.org/manual/#en/webgpurenderer), [WebGPURenderer API](https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer), [TSL wiki](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language), and [npm package](https://www.npmjs.com/package/three), checked 2026-11-16.
- **Environment:** macOS 26.6 arm64; exact Node, Chromium and active renderer backend recorded after running. The fixture first requests WebGPU; if unavailable it recreates `WebGPURenderer` with `forceWebGL: true` and records the WebGL 2 fallback explicitly.
- **Dependencies and effects:** fixture-local pinned Three.js, esbuild, Playwright and pngjs; npm install access, no external assets; browser cache reused. Outputs and bundle stay under ignored `output/`.
- **Input:** fixture-owned 32×24 plane and shader nodes; no media assets.

## Plan, before running

- **Command:** `./run.sh --record`, then `./run.sh`. The page initializes `WebGPURenderer`, reports its actual backend, and renders to a 32×24 `RenderTarget` after setting the TSL `blue` uniform to 0.25/0.5. It reads the target through `readRenderTargetPixelsAsync`. Playwright samples `[0.25,0.5,0.25]` and `[0.5,0.25,0.25]` using fresh render contexts.
- **Expected checks:** exact canvas size 32×24; shader is `vec4(uv.x, uv.y, blue, 1)`, with UV-derived red/green and blue uniform values checked after sRGB encoding to ±2 byte values at pixels `(8,6)`, `(16,12)`, `(27,19)`; opaque alpha 255; frame PNG hashes for each blue value match across both orders; no browser errors or external requests.
- **Stop conditions:** pinned package fails to install, TSL/NodeMaterial path fails to compile, no backend initializes, renderer class/backend cannot be identified, sample pixels exceed tolerance, or shuffled render hashes differ.
- **Inspection:** inspect the retained gradient PNG at native and enlarged scales; `expected/metrics.json` stores only versions, pixel samples and hashes.

## Observation, after running

- **Date/executor:** 2026-11-16; Codex on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64; Node 25.6.1, Playwright 1.64.1, Chromium 156.0.8078.4.
- **Commands:** `./run.sh --record` and `./run.sh`; both passed with Three.js 0.187.0 and its native `WebGPURenderer` WebGPU backend (automatic selection, no fallback). No external requests or browser errors.
- **Observed:** a TSL `uv()` + mutable `uniform()` node graph in `MeshBasicNodeMaterial` rendered to a 32×24 `RenderTarget`; `readRenderTargetPixelsAsync` returned pixels matching sRGB-encoded expected samples within 2 bytes (all exact). With blue uniform 0.25 samples were `(8,6)=[141,222,137,255]`, `(16,12)=[190,184,137,255]`, `(27,19)=[239,120,137,255]`; with 0.5 blue became 188 at those points. For each uniform, all repeated and shuffled-order hashes matched: `66bfe4fdda4b1c2980c31902001492117ef262001e2c869b135d6e7cd1ae43fe` at 0.25 and `e50240db6a2e6608c6f154b46b56925a2942b824299de6beea4e9b49bd21fbb0` at 0.5. See `expected/metrics.json`.
- **Visual inspection:** the readback PNG showed the expected smooth two-axis gradient at native and 10× enlarged scales, without visible defects.
- **Deviations:** an initial browser-canvas screenshot appeared blank despite the render path; the fixture was changed to use Three.js' `RenderTarget` and `readRenderTargetPixelsAsync`, which directly captured and verified GPU output. Readback row order is normalized according to the actual backend.
- **Outcome and limits:** pass for this single TSL `MeshBasicNodeMaterial` graph and uniform sequence on Chromium's native WebGPU backend on macOS arm64. Does not establish WebGL fallback, other GPUs/browsers, lighting or broader TSL/material support.
