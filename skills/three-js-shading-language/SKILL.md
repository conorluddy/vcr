---
name: three-js-shading-language
description: Build Three.js TSL node materials and effects in JavaScript. Load when shader logic should use Three.js nodes; VCR evidence covers one small WebGPU NodeMaterial path only.
---

# Three.js Shading Language

`vcr` means `pnpm vcr` inside the repository or `node <plugin-root>/cli/vcr.mjs` from the installed plugin.

## Use cases and limits
- Compose shader values from Three.js nodes and connect them to a `NodeMaterial`.
- VCR evidence covers Three.js 0.187.0, `uv()` plus a mutable `uniform()` in `MeshBasicNodeMaterial`, WebGPURenderer native WebGPU readback, and repeatable shuffled updates on Chromium 156/macOS arm64.
- The fixture does not validate WebGL fallback, lighting, postprocessing, other node/material features, other GPUs/browsers, or broad TSL support. For GLSL-only work use `ShaderMaterial`; for standalone WebGL use regl or OGL.

## Capability map
The [TSL wiki](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language) maps node categories, `NodeMaterial` integration, and renderer output. The [WebGPURenderer guide](https://threejs.org/manual/#en/webgpurenderer) and [API](https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer) describe setup and backend behavior. The [Three.js API](https://threejs.org/docs/) links node classes, render targets, and color management. VCR exercises `uv`, `uniform`, `vec4`, `MeshBasicNodeMaterial`, `WebGPURenderer`, a `RenderTarget`, and pixel readback; other nodes and materials are documented but untested.

## Install and doctor
```sh
npm install three@0.187.0
node -p "require('three/package.json').version"
# expect: 0.187.0
```
`vcr doctor` does not probe this project-local package. Pin the Three.js minor version because TSL APIs change between releases.

## Smoke test
```sh
vcr example create three-js-shading-language-node
cd examples/three-js-shading-language-node && ./run.sh
# expect: Three.js TSL fixture OK; recorded metrics match and both uniform outputs match across repeats and shuffled order
```
The fixture needs npm access for its pinned local dependencies and a browser with WebGPU. Its retained result identifies the active backend; the evidence currently passed on native WebGPU.

## NodeMaterial recipe
```js
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { uniform, uv, vec4 } from 'three/tsl';

const amount = uniform(0.25);
const material = new MeshBasicNodeMaterial();
material.colorNode = vec4(uv().x, uv().y, amount, 1.0);
// For a seek, set amount.value from the requested time before rendering.
```
Keep shader inputs derived from the requested frame/time; do not rely on an autonomous render loop for deterministic capture.

## Troubleshooting
- If WebGPU is unavailable, the fixture attempts an explicit WebGL 2 fallback and records it. That fallback is not part of the validated evidence; do not treat it as a pass equivalent.
- Pixel differences can come from backend, renderer version or color management. Compare the recorded backend and pinned Three.js version before updating expected samples.
- The example enables Chromium’s unsafe WebGPU flag and opens a localhost server; run it in an environment that permits those operations.

## Official docs
- [Three.js Shading Language](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)
- [WebGPURenderer guide](https://threejs.org/manual/#en/webgpurenderer)
- [WebGPURenderer API](https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer)
- Tested package: [Three.js 0.187.0](https://www.npmjs.com/package/three/v/0.187.0)
