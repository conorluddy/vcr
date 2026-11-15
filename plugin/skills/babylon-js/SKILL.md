---
name: babylon-js
description: Build browser 3D scenes with Babylon.js and capture them through VCR. Load for meshes, materials, camera work, asset loading or the broader Babylon engine surface; the tested VCR route is a small seek-driven WebGL scene.
---

# Babylon.js

Babylon.js is a browser 3D engine with scene, camera, mesh, material, lighting, animation, asset-loading, physics, shader and post-effect systems. Use its native APIs directly; VCR's capture harness can capture a browser scene but does not supply a Babylon adapter or shared timeline.

## Use cases and limits
- Use Babylon when its engine ecosystem, scene graph or WebGPU/WebGL backends suit the project.
- For the validated VCR route, assign scene state from `t` and render once per seek; the ordinary interactive render loop is not part of this fixture.
- The fixture validates the UMD `babylonjs` build only; the catalogue's `@babylonjs/core` package route remains untested.

## Choose the package and render route

The validated fixture uses the `babylonjs` 9.35.0 UMD build and global `BABYLON`. The catalogue install recipe names `@babylonjs/core`; that package route was not tested by this fixture. For an application, choose the package form deliberately: `@babylonjs/core` supports modular imports/tree shaking, while the UMD fixture is a single browser script.

For a normal interactive application, Babylon's engine render loop owns repeated drawing. For a VCR capture scene, expose a seek function that assigns all pixel-affecting state from absolute time `t`, then renders once. Avoid frame accumulation, clocks, and unseeded random paths in seek-driven scenes. See [official npm support](https://doc.babylonjs.com/setup/frameworkPackages/npmSupport/) and [Scene API](https://doc.babylonjs.com/typedoc/classes/BABYLON.Scene).

## API map (documented surface)

- **Engine and canvas:** `Engine` creates the rendering context; configure alpha, antialiasing, stencil, preserve-drawing-buffer, and hardware scaling for the target. `runRenderLoop` is the usual interactive driver. [Engine API](https://doc.babylonjs.com/typedoc/classes/BABYLON.Engine)
- **Scene graph and cameras:** `Scene` owns active camera, lights, meshes, materials and render settings. `ArcRotateCamera` orbits a target with alpha, beta and radius; `FreeCamera` supports free movement. [Scene API](https://doc.babylonjs.com/typedoc/classes/BABYLON.Scene) · [ArcRotateCamera](https://doc.babylonjs.com/typedoc/classes/BABYLON.ArcRotateCamera)
- **Geometry and materials:** `MeshBuilder` creates common primitives; meshes expose transform state and can share material instances. `StandardMaterial` is a basic material; PBR materials support physically based workflows. [MeshBuilder API](https://doc.babylonjs.com/typedoc/classes/BABYLON.MeshBuilder) · [Materials overview](https://doc.babylonjs.com/features/featuresDeepDive/materials/)
- **Lighting and image effects:** built-in lights include hemispheric and directional types. Post-processing and image-processing configuration are native features. [Lighting](https://doc.babylonjs.com/features/featuresDeepDive/lights/) · [Post-processes](https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/)
- **Assets and animation:** scene loaders support external scene/model formats; animation groups and observables provide engine-driven animation workflows. [Importing models](https://doc.babylonjs.com/features/featuresDeepDive/importers/) · [Animation](https://doc.babylonjs.com/features/featuresDeepDive/animation/)
- **Other documented subsystems:** physics engines/plugins, node materials, inspector/debug tools, WebGPU and WebGL backends have separate APIs and compatibility requirements. [Physics](https://doc.babylonjs.com/features/featuresDeepDive/physics/) · [Node Material](https://doc.babylonjs.com/features/featuresDeepDive/materials/nodeEditor/) · [WebGPU](https://doc.babylonjs.com/setup/support/webGPU/)

This map describes documented product surface, not VCR validation. Consult the docs for version-specific APIs and backend requirements.

## Install and doctor
```text
pnpm add babylonjs@9.35.0
vcr doctor
```
The fixture uses the UMD browser build and global `BABYLON`. `vcr doctor` reports machine availability; it does not verify a package import or rendering feature.

## VCR-tested workflow and evidence boundary

Validated: Babylon.js 9.35.0 UMD, `Scene`, `ArcRotateCamera`, hemispheric and directional lights, `MeshBuilder` box/sphere/torus, `StandardMaterial`, absolute-time transform/camera assignment and one explicit `scene.render()` per seek. On macOS arm64 with Playwright 1.64.1 / Chromium 156.0.8078.4, screenshot capture produced 90 distinct 1280×720 alpha frames at 30 fps; every shuffled frame hash matched sequential capture in two runs. Frame 45 alpha range was 0–1. Contact sheet inspected. Exact smoke output: `babylonjs-capture: OK`.

Not validated: `@babylonjs/core`, render loop, Babylon animation/observable systems, post-effects, PBR, particles, glTF, physics, interaction, WebGPU, other browsers or GPUs, cross-machine byte identity. The example specifically excludes APIs whose used paths depend on unseeded random values or clocks.

## Smoke test

Run `vcr example create babylonjs-capture`, change to its printed destination and run:
```text
./run.sh
# expect: babylonjs-capture: OK
```
Inspect `output/contact.png` and `output/frames/frame-0045.png`. Use `./run.sh --record` only when intentionally updating the expected summary.

## Troubleshooting
- If a shuffled capture differs, remove clock-based state and assign all changing transforms and camera values from `t` before the single render.
- If alpha is opaque, verify the engine/canvas alpha configuration and scene clear color; the fixture's alpha result is scoped to its tested scene.

## Official docs
- [Babylon.js documentation](https://doc.babylonjs.com/)
- [npm support and package forms](https://doc.babylonjs.com/setup/frameworkPackages/npmSupport/)
- [Scene API](https://doc.babylonjs.com/typedoc/classes/BABYLON.Scene)
- [Engine API](https://doc.babylonjs.com/typedoc/classes/BABYLON.Engine)
