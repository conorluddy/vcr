---
name: regl
description: Declare functional WebGL draw commands whose props and uniforms describe each draw. Load for custom shader and particle work without a scene graph; use Three.js for models, loaders, lighting or PBR.
---

# regl

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- regl turns WebGL state and draw setup into reusable commands, making per-frame state explicit. It has no scene graph; use OGL for class-based scene structure or Three.js for a full renderer.
- Fixture validates regl 2.1.1 gradient and triangle commands driven from `t`, on macOS arm64 Chromium 156 with WebGL 1. Instancing, regl.frame loops, regl.now, profiling, WebGL2 and other browsers/GPUs are untested. Avoid clock or profile reads in pixel-producing code when seeking deterministically.

## Capability map
- Commands, props, uniforms, attributes, elements, framebuffer and context options ([regl README/API](https://github.com/regl-project/regl)). Fixture exercises command creation, prop-backed uniforms, attributes, clear and draw; framebuffer and context loss are untested.
- Lifecycle and timing: `regl.frame`, `regl.now`, cancel/destroy and profiling ([API reference](https://regl-project.github.io/regl/)). Documented, not exercised; `frame`, `now` and profiling are excluded from this validated claim.
- Examples and extensions ([project examples](https://github.com/regl-project/regl/tree/master/examples)). Unassessed by the fixture.

## Install and doctor
```sh
pnpm add regl
vcr doctor
```
Evidence used regl 2.1.1, Playwright 1.64.1 and Chromium 156. `doctor` reports local availability; it does not install regl.

## Smoke test

```sh
vcr example create regl-capture
```
Change to the destination printed by the command, install its example dependencies, and run:
```sh
pnpm install
./run.sh
# expect: regl-capture: OK
```
## Scene contract
Expose `window.__scene = { duration, seek }`. In each `seek(t)`, clear and call draw commands with time-derived props/uniforms. Do not use `regl.frame()` or `regl.now()` for scene state; the fixture calls neither.

## Troubleshooting
- Shuffled hashes differ: ensure every command input is set from `t`, with no accumulated state or clock reads.
- Expected geometry is missing: inspect depth/blend state and GL errors. In the fixture, the gradient wrote depth and the default depth test hid later triangles; disabling depth testing on both commands fixed it.
- Alpha output is incorrect: check context alpha/premultiplication and ensure shader RGB is premultiplied consistently.

## Official docs
- [regl project and API docs](https://regl-project.github.io/regl/) (fixture used 2.1.1)
- [Repository and examples](https://github.com/regl-project/regl)
