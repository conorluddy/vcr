# TypeGPU in Node: TypeScript shader to WGSL, rendered and read back

Status: validated on macOS arm64 (Metal), 2026-11-27, for the scope below.

## Intent and scope

- Tool: `typegpu` 0.12.12 with build plugin `unplugin-typegpu` 0.12.9 (its Node module hook), on `webgpu` 0.6.2 (Dawn). Record: `catalog/tools/typegpu.json`.
- Claim: in Node, TypeScript functions marked `'use gpu'` and a typed uniform struct resolve to WGSL; the resulting render pipeline draws a fixed full-screen-triangle shader into an offscreen `rgba8unorm` texture and the readback matches an analytic reference; the generated WGSL is stable and reruns are byte-identical.
- Exclusions: browsers and canvas; compute pipelines; texture sampling; other backends and OSes; performance; the plugins for bundlers (Vite, Rollup); cross-machine determinism.
- Documentation: https://docs.swmansion.com/TypeGPU, the `skills/typegpu` notes shipped in the npm package (setup, debugging: Node preload route). Licence MIT.
- Input: constants in `render.ts`. Writes ignored `output/`.
- Dependencies: `typegpu`, `webgpu`, `unplugin-typegpu`, all by `pnpm install`; no system install.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`.
- Route: `node --import ./preload.mjs render.ts` with `NODE_ENV=development`, as the package's own notes describe for Node 22.15+. `tgpu.initFromDevice({ device })` on a Dawn device from `webgpu`. Shader: vertex and fragment functions as `'use gpu'` TypeScript, a `d.struct` uniform `{ time, size }`, output `(uv.x, uv.y, time, 1)`.
- Checks: 64x64; 3 frames (t 0, 0.25, 1); at least two distinct hashes; every pixel within 1 LSB of `round((x+.5)/64*255)`, `round((y+.5)/64*255)`, `round(t*255)`, 255; alpha 255 everywhere; shuffled order (2,0,1) hashes equal sequential; two runs identical (JSON and WGSL); generated WGSL contains the uniform struct, `@vertex` and `@fragment`; output equals `expected/` (including the WGSL text).
- Stop conditions: no adapter (blocked); plugin transform fails (fail); deviation above 1 (fail; tolerance unchanged).
- Inspection: contact sheet of the three frames from `output/frames/*.rgba` via ImageMagick.

## Observation

- 2026-11-27, Conors-MacBook-Pro-2.local, macOS 26.6 arm64, Node v22.19.0. Adapter `apple` / `metal-3`.
- First run passed every predeclared check. Max channel deviation 0; no non-opaque pixel; shuffled equals sequential; two runs identical.
- Frame hashes equal those of `dawn-node-webgpu-readback` (same shader maths, same device), which is independent confirmation that the generated WGSL does the same thing as the hand-written one.
- Generated WGSL (`expected/shader.wgsl`): a `Params` struct, `var<uniform> params`, `@vertex fn vertexMain` with the corner array inlined, `@fragment fn fragmentMain`. Readable and as written.
- Inspection: contact sheet at 400%: smooth red (left to right) and green (top to bottom) gradient in each frame, blue stepping up across frames. Correct; no clipping, seam or blank area.
- Result: pass, for this scope.
- Limitations: the plugin (0.12.9) lags the library (0.12.12) and they were used together without a visible problem; versions are pinned. Same-host reruns only. `pnpm` reports the `webgpu` build script as ignored; the prebuilt binary loads regardless. Running under tsx was not tried; the Node preload is the route documented by the package.
