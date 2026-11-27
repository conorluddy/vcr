---
name: typegpu
description: Write typed WebGPU shaders and buffers with TypeGPU, TypeScript 'use gpu' functions that resolve to WGSL, and render them offscreen in Node through dawn-node-webgpu. Load when a typed or composable shader is wanted over raw WebGPU; evidence covers one render pipeline on macOS arm64.
---

# TypeGPU

## Use cases and limits

TypeGPU gives WebGPU typed schemas (`d.struct`, `d.vec2f`) that are GPU type, CPU layout and TypeScript type at once, and compiles `'use gpu'` TypeScript functions to WGSL. The fixture ran `typegpu` 0.12.12 with `unplugin-typegpu` 0.12.9 on Node v22.19.0, macOS arm64 (Metal) over `webgpu` 0.6.2: vertex and fragment functions plus a typed uniform struct, three 64x64 `rgba8unorm` frames read back exactly (deviation 0), shuffled order equal to sequential, identical reruns, and the generated WGSL snapshotted.

Not tested: browsers and canvas, compute pipelines, texture sampling, vertex buffers, bundler plugins (Vite, Rollup), other OSes and backends, performance. Pre-1.0: pin versions; functions are renamed between releases. For raw WGSL and no types use `webgpu` or `dawn-node-webgpu`; for shaders inside Three.js use `three-js-shading-language`.

## Capability map

| Area | Reference | Tested |
| --- | --- | --- |
| Schemas (`d.*`), uniforms, buffers | [data schemas](https://docs.swmansion.com/TypeGPU/apis/data-schemas/) | `d.struct`, `root.createUniform`, `.write`. Mutable, storage and vertex buffers untested. |
| Shader functions (`'use gpu'`, `tgpu.fn`) | [functions](https://docs.swmansion.com/TypeGPU/apis/functions/) | `tgpu.vertexFn`, `tgpu.fragmentFn` with `'use gpu'` bodies. WGSL-string bodies untested. |
| Pipelines | [pipelines](https://docs.swmansion.com/TypeGPU/apis/pipelines/) | `createRenderPipeline`, `withColorAttachment`, `draw`. Compute untested. |
| `tgpu.resolve` | [resolve](https://docs.swmansion.com/TypeGPU/apis/resolve/) | Pipeline resolved to a WGSL string. |
| Textures, slots, accessors, bind-group layouts | [docs index](https://docs.swmansion.com/TypeGPU/) | Render target only. |
| `@typegpu/noise`, `sdf`, `color` | [docs index](https://docs.swmansion.com/TypeGPU/) | Not exercised. |

The installed package carries its own reference: `node_modules/typegpu/skills/typegpu/SKILL.md` and `references/`, matching the installed version. Read those before writing more than this recipe.

## Install and doctor

```sh
pnpm add typegpu@0.12.12 webgpu@0.6.2 && pnpm add -D unplugin-typegpu@0.12.9
```

`vcr doctor` does not probe it; do not assume it is installed. Without a GPU adapter `requestAdapter()` returns null.

## Smoke test

```sh
examples/typegpu-typed-wgsl/run.sh
# expect: typegpu-typed-wgsl: OK (typegpu 0.12.12, node v22.19.0, adapter apple metal-3, max channel deviation 0)
```

Hashes and adapter are in `expected/render.json`; they differ on other hosts. The generated WGSL is `expected/shader.wgsl`. Locate the fixture with `vcr tools examples typegpu`.

## Node recipe

`'use gpu' ` bodies only compile with the build plugin. In Node 22.15+ use its module hook, with `NODE_ENV=development` (unset counts as production and drops warnings):

```js
// preload.mjs
import install from "unplugin-typegpu/node";
install();
```

```sh
NODE_ENV=development node --import ./preload.mjs render.ts
```

```ts
import tgpu, { d } from "typegpu";
import { create, globals } from "webgpu";
Object.assign(globalThis, globals);

const device = await (await create([]).requestAdapter())!.requestDevice();
const root = tgpu.initFromDevice({ device });
const params = root.createUniform(d.struct({ time: d.f32, size: d.vec2f }));
// shells: tgpu.vertexFn / tgpu.fragmentFn({ in, out })(({ ... }) => { "use gpu"; ... })
const pipeline = root.createRenderPipeline({ vertex, fragment, targets: { format: "rgba8unorm" } });
const target = root.createTexture({ size: [64, 64], format: "rgba8unorm" }).$usage("render");
params.write({ time, size: d.vec2f(64, 64) });
pipeline.withColorAttachment({ view: target, clearValue: [0, 0, 0, 0] }).draw(3);
// readback: raw device.createCommandEncoder().copyTextureToBuffer({ texture: root.unwrap(target) }, ...)
const wgsl = tgpu.resolve([pipeline]); // snapshot this to pin shader output
```

- Drive each frame from a uniform `time`; frames are then a pure function of `t` and render in any order.
- Readback used raw WebGPU on `root.device`; a TypeGPU-native readback for textures was not tried.
- Frame hashes matched the hand-written WGSL in `dawn-node-webgpu-readback`, so the generated code was equivalent for this shader.

## Troubleshooting

- `'use gpu'` functions throw or do not compile: the plugin hook is not loaded; run through `--import ./preload.mjs`. Running under tsx was not tried.
- Plugin is 0.12.9 while the library is 0.12.12; they worked together here. Pin both and rerun the fixture on upgrade.
- pnpm reports the `webgpu` build script as ignored; the prebuilt binary still loads.

## Official docs

- [TypeGPU docs](https://docs.swmansion.com/TypeGPU/)
- [TypeGPU repository](https://github.com/software-mansion/TypeGPU)
- [npm: typegpu](https://www.npmjs.com/package/typegpu), [unplugin-typegpu](https://www.npmjs.com/package/unplugin-typegpu)
