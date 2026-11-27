---
name: shaders-smaa
description: Antialias a raw WebGL scene with glsl-smaa's SMAA 1x passes (edges, weights, blend) and capture it deterministically through VCR. Use when a regl, twgl, ogl or hand-written WebGL scene has aliased edges and no Three.js composer.
---

# shaders-smaa (glsl-smaa)

Shader strings and lookup textures; you write the three framebuffer passes. Evidence: glsl-smaa 4.0.0 on macOS arm64, Chromium 156.0.8078.4, WebGL1 (`examples/glsl-smaa-capture`, 2026-11-27). Anything beyond that fixture is marked untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Proven: SMAA 1x, HIGH preset, luma edges, opaque scene, drawn once per seek; shuffled-order capture equals sequential.
- Three.js scenes: use `postprocessing` (its SMAA is built in).
- Untested: `wgsl-smaa` for WebGPU, T2x and the resolve pass, depth or colour edges, predication, alpha output, WebGL2. T2x blends the previous frame, so it is not seek-safe; stay on 1x.

## Capability map
- `glsl-smaa` exports `SMAATextures` (area, search PNG data URIs), `PRESETS`, and `SMAA_{EDGES,WEIGHTS,BLEND,RESOLVE}_{VERT,FRAG}`; plain `.glsl`/`.frag` files ship too. Reference: https://github.com/dmnsgn/shaders-smaa/tree/main/packages/glsl-smaa
- `wgsl-smaa` is the WGSL port. Untested.
- Fixture covers edges, weights, blend only.

## Install and doctor
```text
pnpm add glsl-smaa@4.0.0
pnpm list glsl-smaa --depth 0
```
Browser scenes import `./node_modules/glsl-smaa/index.js` as a module; `captureFrames` with `sceneFile` serves it over loopback HTTP.

## Smoke test
```text
examples/glsl-smaa-capture/run.sh
# expect: glsl-smaa-capture: OK
```
Needs `pnpm install`, `magick` and `jq`. Capture runs at about 8 fps.

## Scene contract
Standard `window.__scene = { duration, seek }`; everything is a function of `t`, with no render loop.

Pass order per `renderAt(t)` (see `scene.html`):
1. Draw the scene into an RGBA8 texture, linear filter, clamp.
2. Edges pass to a second target, `uTexelSize = 1/size`, `uColorTexture`. Clear it to 0 first.
3. Weights pass to a third target: `uEdgesTexture`, `uAreaTexture`, `uSearchTexture`, `uViewportSize`, `uSubsampleIndices = [0,0,0,0]`. Clear first.
4. Blend pass to the screen: `uColorTexture` (the step 1 texture) and `uBlendTexture` (step 3).

Compile each fragment as `#define SMAA_PRESET_HIGH\n#define SMAA_EDGES_LUMA\n` + `PRESETS` + the shader; the vertex shaders take attribute `aPosition` (a fullscreen quad in clip space).

## Pitfalls
- Upload area and search textures as is: `UNPACK_FLIP_Y_WEBGL` false, premultiply false, colour-space conversion `NONE`, linear filter, no mipmaps. 4.0.0 removed the old search texture flip.
- Textures decode asynchronously: `await image.decode()` before defining `window.__scene`, so the harness only starts once ready.
- Clear edges and weights targets every frame, or old edges leak into new ones.
- The edges pass is luma-based on colour, so it never sees alpha. Alpha capture is untested.
- A split-screen (scissor) of the raw and filtered result makes a frame its own control and is easy to check with unique colour counts.

## Troubleshooting
- Not seen in the recorded run; the first things to check are the three bullets above.

## Official docs
- https://github.com/dmnsgn/shaders-smaa
- https://www.npmjs.com/package/glsl-smaa
