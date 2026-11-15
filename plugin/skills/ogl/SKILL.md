---
name: ogl
description: Build compact custom WebGL scenes with OGL's geometry, shader, transform and camera classes. Load when a small scene graph helps; use Three.js for models, materials, loaders or broader rendering features.
---

# OGL

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use OGL for custom-shader meshes and compact WebGL scene graphs. It stays close to WebGL and does not provide a full asset pipeline; use Three.js for glTF, PBR, shadows or postprocessing.
- The 1.0.11 fixture validates a seek-driven Renderer, Camera, Transform, Program, Box and Sphere on macOS arm64 with Chromium 156. It does not validate other browsers/GPUs, WebGL fallback selection, exports or the other extras.

## Capability map
- Core rendering: `Renderer`, `Geometry`, `Program`, `Mesh`, `Transform`, `Camera`, `Texture`, and `RenderTarget` ([upstream README and API examples](https://github.com/oframe/ogl#structure)). Fixture exercises Renderer, Camera, Transform, Program, Mesh, Box and Sphere; custom Geometry, textures and render targets remain untested.
- Extras include loaders, post effects, paths, text, flow maps, GPGPU, shadows, orbit controls and raycasting ([OGL examples](https://oframe.github.io/ogl/examples/)). Documented upstream; untested here.
- Math classes are a separate component ([source/API](https://github.com/oframe/ogl/tree/master/src/math)). Untested.

## Install and doctor
```sh
pnpm add ogl
vcr doctor
```
The evidence used OGL 1.0.11, Playwright 1.64.1 and Chromium 156. `doctor` reports local availability; it does not install OGL.

## Smoke test

```sh
vcr example create ogl-capture
```
Change to the destination printed by the command, install its example dependencies, and run:
```sh
pnpm install
./run.sh
# expect: ogl-capture: OK
```
## Scene contract
The fixture exposes `window.__scene = { duration, seek }`. Set uniforms, transforms and render once from `seek(t)`; avoid a self-running animation loop or wall-clock reads. Keep geometry and shader state a pure function of `t` (and an explicit seed if needed).

## Troubleshooting
- Blank frames: check shader compilation and WebGL context availability, then confirm a `renderer.render({ scene, camera })` call occurs inside the seek path.
- Shuffled-frame mismatch: remove state accumulated across seeks; assign every animated transform and uniform from `t` on each seek.
- Transparent edges look wrong: keep fragment RGB premultiplied when using the fixture's `premultipliedAlpha` renderer configuration.

## Official docs
- [OGL README](https://github.com/oframe/ogl) (fixture used 1.0.11)
- [OGL examples](https://oframe.github.io/ogl/examples/)
