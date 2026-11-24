---
name: dawn-node-webgpu
description: Use the npm `webgpu` package (Dawn) to run WebGPU render-to-texture work from a Node process with pixel readback and no browser. Load when a shader frame must be rendered offscreen in Node; the evidence covers one WGSL triangle on macOS arm64 Metal.
---

# Dawn Node WebGPU

## Use cases and limits

Use it to render a WGSL pipeline into an offscreen texture in plain Node and read the pixels back as bytes, ready for FFmpeg or an image tool. The fixture tests `webgpu` 0.6.2 on Node v22.19.0, macOS arm64 (Apple M3 Pro), default backend, which selected Metal: a full-screen-triangle shader into a 64x64 `rgba8unorm` texture, three frames, `copyTextureToBuffer` and `mapAsync` readback. Every pixel matched an analytic reference exactly; shuffled frame order matched sequential order; two runs were byte-identical on the same host.

Not tested: browsers, other OSes, architectures or backends (Vulkan, D3D, OpenGL), compute pipelines, multi-pass rendering, depth, multisampling, performance, cross-machine byte equality. The package has no canvas, DOM, video-frame or image-element integration. For browser WebGPU see the `webgpu` skill (the browser-side counterpart); for DOM or media-driven scenes use browser capture.

## Capability map

Discoverability only; the Tested column is the VCR evidence.

| Area | Reference | Tested |
| --- | --- | --- |
| Package entry points (`create`, `globals`) | [node-webgpu README](https://github.com/dawn-gpu/node-webgpu) | `create([])` with no options and `Object.assign(globalThis, globals)` used. Backend options untested. |
| Adapter and device | [GPU.requestAdapter](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter) | Metal adapter and device acquired; `adapter.info` read. Other adapters untested. |
| WGSL shader modules, render pipelines | [WGSL spec](https://www.w3.org/TR/WGSL/) | One vertex and one fragment stage, a uniform buffer, `layout: "auto"`. Other WGSL untested. |
| Textures, render passes, readback | [GPUCommandEncoder](https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder) | One `rgba8unorm` target, `copyTextureToBuffer`, `mapAsync(READ)`. Other formats untested. |
| Compute pipelines | [GPUComputePipeline](https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePipeline) | Not exercised. |
| Canvas, presentation | none in this package | Not available per its README. |

## Install and doctor

```sh
npm install webgpu@0.6.2
```

`vcr doctor` does not probe this tool, so do not assume it is installed. The prebuilt `dawn.node` ships in the npm tarball and loaded without the package's postinstall (which only removes a macOS quarantine attribute; pnpm ignored it here). Check adapter availability in code: `requestAdapter()` returns null when no adapter exists.

## Smoke test

```sh
examples/dawn-node-webgpu-readback/run.sh
# expect: dawn-node-webgpu-readback: OK (webgpu 0.6.2, node v22.19.0, adapter apple metal-3, max channel deviation 0)
```

Adapter, versions, per-frame SHA-256 hashes and probe pixels are in `expected/render.json`; they will differ on other hosts. Locate the fixture with `vcr tools examples dawn-node-webgpu`.

## Render and readback recipe

```ts
import { create, globals } from "webgpu";
Object.assign(globalThis, globals); // GPUBufferUsage, GPUTextureUsage, GPUMapMode

const adapter = await create([]).requestAdapter();
if (!adapter) throw new Error("no WebGPU adapter");
const device = await adapter.requestDevice();
// texture: RENDER_ATTACHMENT | COPY_SRC; buffer: COPY_DST | MAP_READ
// per frame: writeBuffer(uniform time) -> render pass draw(3) -> copyTextureToBuffer
//   -> submit -> await buffer.mapAsync(GPUMapMode.READ) -> slice(0) -> unmap()
```

- Full-screen triangle: emit (-1,-1), (3,-1), (-1,3) from `vertex_index`; coverage had no gaps.
- Drive each frame from a uniform `time`, so frames are a pure function of `t` and render in any order on one device (tested: 2, 0, 1 equals 0, 1, 2).
- `bytesPerRow` was 256 bytes (64 x 4); other widths must meet WebGPU's 256-byte row alignment (spec rule, untested here).
- Copy mapped bytes with `.slice(0)` before `unmap()`.

## Troubleshooting

- `requestAdapter()` returns null: no usable GPU or backend on this host; report blocked, not pass.
- Binary fails to load: a macOS quarantine attribute is the documented cause; run the package's own postinstall rather than working around it. Not seen in this run.
- Values off by one: compare with a 1 LSB tolerance against an analytic reference; the fixture measured 0 deviation on Metal.

## Official docs

- [node-webgpu repository and README](https://github.com/dawn-gpu/node-webgpu)
- [npm: webgpu](https://www.npmjs.com/package/webgpu)
- [WebGPU specification](https://www.w3.org/TR/webgpu/)
- [WGSL specification](https://www.w3.org/TR/WGSL/)
