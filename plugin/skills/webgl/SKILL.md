---
name: webgl
description: Use native WebGL when browser work needs direct GPU geometry, shaders, or pixel readback. This guide covers a WebGL 1 triangle with uniform-driven positioning and deterministic readPixels checks on Chromium SwiftShader.
---

# WebGL

## Use cases and limits

Use WebGL for direct browser GPU drawing when a rendering library adds unwanted abstraction. The VCR fixture compiles one WebGL 1 shader program, draws a triangle at three explicit uniform values, and checks pixels through Chromium's SwiftShader software renderer. It does not cover WebGL 2, textures, framebuffers, animation loops, hardware GPUs, other browsers, or production image quality. Prefer Three.js or PixiJS for a scene graph; use WebGPU for compute when its adapter is available.

## Capability map

| Area | Reference | VCR evidence |
| --- | --- | --- |
| Context and drawing | [WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) | WebGL 1 context, viewport, clear, triangle draw and fixed context attributes exercised. |
| Shaders and programs | [WebGLShader](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader), [WebGLProgram](https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram) | GLSL ES 1.0 compile/link, one position attribute and one float uniform exercised. Other shader features untested. |
| Buffers and attributes | [WebGLBuffer](https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer), [vertexAttribPointer](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer) | One static triangle vertex buffer exercised; dynamic buffers and index buffers untested. |
| Pixel readback | [readPixels](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels) | RGBA/UNSIGNED_BYTE readback, deterministic hashes and triangle bounds exercised. Textures, framebuffers and other formats untested. |
| WebGL 2 and extensions | [WebGL2RenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext), [WebGL extensions](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API#extensions) | Not exercised. |

## Install and doctor

WebGL is a native browser API; there is no package to install and `vcr doctor` does not probe it. The fixture uses Playwright 1.64.1 with Chromium 156.0.8078.4 on macOS arm64 and forces ANGLE SwiftShader. This is software rendering, not a hardware GPU check.

## Smoke test

```sh
./run.sh
# expect: pass; WebGL 1.0; 96x72 RGBA readback; 1,442 triangle pixels; sequential and shuffled hashes match
```

Run from the repository root with `vcr tools examples webgl` to locate the fixture. The retained exact metrics include renderer/version, context attributes, bounds `[17,13,78,58]` and three frame hashes. Other Chromium builds or renderers may produce different hashes.

## Scene contract

The fixture exposes `window.fixture.render(time)`. Supply an explicit time value, set the matching uniform, draw, call `finish()`, then read pixels. Do not use a wall clock or depend on the browser animation loop when frames must be reproducible. The fixture tests this tiny direct WebGL path only; it is not a shared VCR scene adapter.

## Troubleshooting

- `WebGL 1 context unavailable`: check that the browser launched with WebGL enabled and that the chosen backend is available.
- `unexpected WebGL renderer`: this fixture expects Chromium SwiftShader; a hardware or other software backend is outside its retained evidence.
- Different pixel hashes: compare browser version, renderer, context attributes and shader inputs before changing expected metrics.

## Official docs

- [WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
- [WebGL 1.0 specification](https://registry.khronos.org/webgl/specs/latest/1.0/)
