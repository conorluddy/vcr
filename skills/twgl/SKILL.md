---
name: twgl
description: Use small helpers for WebGL programs, buffers, attributes, uniforms, textures and framebuffers while keeping normal WebGL control. Load for low-level shader work; use regl for declarative commands or Three.js for a full scene system.
---

# TWGL

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- TWGL reduces WebGL boilerplate while leaving the draw sequence and GL state in your hands. Use regl for declarative draw commands or Three.js for a scene graph, models and lighting.
- Fixture validates the 7.0.0 core browser build, a shader program, buffer, uniforms and fullscreen draw on macOS arm64 Chromium 156 / WebGL 1. It does not cover WebGL2, textures, framebuffers, the `twgl-full` build, other browsers or GPU drivers.

## Capability map
- Program, shader and context helpers ([TWGL API docs](https://twgljs.org/docs/)). Fixture exercises `getWebGLContext` and `createProgramInfo`.
- Buffers, attributes and draw helpers ([API docs](https://twgljs.org/docs/)). Fixture exercises `createBufferInfoFromArrays`, `setBuffersAndAttributes`, `setUniforms`, and `drawBufferInfo`.
- Textures, framebuffers, resizing, primitives and WebGL2 helpers ([API docs](https://twgljs.org/docs/)). Documented but untested. The fixture intentionally uses the core build and no primitives.

## Install and doctor
```sh
pnpm add twgl.js
vcr doctor
```
Evidence used twgl.js 7.0.0, Playwright 1.64.1 and Chromium 156. `doctor` reports local availability; it does not install TWGL.

## Smoke test

```sh
vcr example create twgl-capture
```
Change to the destination printed by the command, install its example dependencies, and run:
```sh
pnpm install
./run.sh
# expect: twgl-capture: OK
```
## Scene contract
Expose `window.__scene = { duration, seek }`. Set shader uniforms from `t` and issue one explicit draw per seek; do not add an independent loop. The fixture requests `preserveDrawingBuffer` for capture and uses premultiplied alpha.

## Troubleshooting
- Blank frame: check shader compilation, buffer attribute names and `gl.getError()` after setup/draw.
- Shuffled mismatch: derive uniforms and other visible state from `t`, not elapsed time or mutation accumulated across draws.
- Transparent pixels look wrong: verify the WebGL context attributes and premultiplied RGB/alpha convention.

## Official docs
- [TWGL documentation and API](https://twgljs.org/docs/) (fixture used 7.0.0 core build)
- [TWGL project](https://twgljs.org/)
