---
name: framefields
description: Use framefields to render a TypeScript composition to frames and MP4 on native WebGPU in Node, with no browser. Load when a no-browser film or 3D/effects scene is wanted or framefields is being compared with VCR's capture route; the evidence covers one 2D scene on macOS arm64.
---

# framefields

## Use cases and limits

A `Composition` (size, fps, frame count) holds layers (boxes, text, video, 3D, effects) animated by GSAP-style easing. `renderFrame({ frame })` returns any frame by index as PNG or raw RGBA; `renderVideo` writes MP4. The fixture tests 3.0.2 on Node v22.19.0, macOS arm64 (Apple M3 Pro): a 320x180, 24-frame box-and-text scene. Five probe frames hashed identically in sequential and shuffled order and across two runs; the MP4 was h264 320x180 with 24 frames; about 114 fps.

Not tested: 3D, effects and shaders, audio content, vision and SAM models, the components registry, the preview server, other OSes and GPUs, byte equality of the MP4, 1080p. No DOM, CSS or web fonts exist, so VCR browser scenes do not move over: for those use browser capture. For an editor-driven 2D explainer use `motion-canvas`; for bare WebGPU readback use `dawn-node-webgpu`. It is a reference engine, not a VCR dependency: VCR keeps its own engine (ADR 0001).

Keep out of VCR routes: the hosted AI gateway (`FRAMEFIELDS_API_KEY`) and SAM 3 weights (Meta SAM License, accepted explicitly).

## Capability map

Discoverability only; the Tested column is the VCR evidence.

| Area | Reference | Tested |
| --- | --- | --- |
| `Composition`, `Layer.box`, `Layer.text`, `LayerAnimation` | [docs](https://framefields.dev/docs) | One box, one text layer, fade and slide. |
| `renderFrame`, `renderFrameGrid` | typings in `dist/index-*.d.mts` | `renderFrame` as `rgba` and `png`. Grid untested. |
| `renderVideo` (codec, quality, `qa`, chunks) | [README](https://github.com/gatewai-dev/framefields) | MP4 with `quality: "high"`. Others untested. |
| 3D scenes, 50+ shader effects, particles, physics | docs | Not exercised. |
| Audio, BeatGrids, procedural SFX | docs | Only the silent track the engine adds. |
| Vision (ONNX, SAM), AI gateway | docs | Not exercised, not recommended. |
| CLI `framefields init/list/add`, preview | README | Not used. |

## Install and doctor

```sh
pnpm add framefields@3.0.2
```

`vcr doctor` does not probe it. Two install traps on pnpm, both handled by the fixture's `run.sh` (see its comments): `@napi-rs/webcodecs-darwin-arm64` is skipped on Node below 22.20 unless pnpm is run with `--config.nodeVersion=22.20.0`, and pnpm ignores the install script of `skia-canvas` (run its `lib/prebuild.mjs download`). Without them the import fails with "Cannot find native binding" or "Cannot find module '../skia.node'".

## Smoke test

```sh
examples/framefields-render/run.sh
# expect: framefields-render: OK (framefields 3.0.2, node v22.19.0, 4 distinct frames, shuffled equals sequential, mp4 24 frames)
```

Locate the fixture with `vcr tools examples framefields`. Needs network on the first run.

## Render recipe

```ts
import { Composition, Layer, LayerAnimation } from "framefields";
const comp = new Composition({ width: 320, height: 180, fps: 12, durationFrames: 24,
  backgroundColor: "#101820", fonts: ["assets/fonts/JetBrainsMono-Bold.ttf"] });
comp.add(Layer.text("FRAME", { fontSize: 40, fill: "#fff", fontFamily: "JetBrainsMono-Bold" })
  .animate(LayerAnimation.create().fadeIn(0, 12, "power2.out")));
const raw = await comp.renderFrame({ frame: 6, format: "rgba" });
await comp.renderVideo({ outputPath: "output/film.mp4", quality: "high" });
process.exit(0); // the README ends scripts this way
```

- Frames are addressed by index and rendered in any order with equal hashes (tested: 18, 0, 23, 12, 6 equals sequential).
- Font family is the file stem, resolved as `assets/fonts/<family>.ttf` from the working directory. A wrong name only logs `error`: the text silently does not draw. Check the log and look at a frame.
- Always set `fontFamily` on text layers.

## Troubleshooting

- Text missing, log says "Could not resolve font file": see the font rule above.
- "Cannot find native binding" for `@napi-rs/webcodecs`: Node engine skip, see Install.
- "Cannot find module '../skia.node'": run skia-canvas's download script.
- `require("framefields/package.json")` is not exported: read the file from `node_modules/framefields/package.json`.

## Official docs

- [framefields repository and README](https://github.com/gatewai-dev/framefields)
- [framefields docs](https://framefields.dev/docs)
- [npm: framefields](https://www.npmjs.com/package/framefields)
