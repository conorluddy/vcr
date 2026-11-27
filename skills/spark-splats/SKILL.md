---
name: spark-splats
description: Render 3D Gaussian splat files with Spark (@sparkjsdev/spark) inside a seek-driven three.js scene and capture frames deterministically through VCR. Load once Spark has been chosen to show a splat asset; the key trap is waiting for its async sort.
---

# Spark (Gaussian splats in three.js)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- `SplatMesh` is a three.js `Object3D`: splats share the scene, camera and depth buffer with meshes. Use it to show a splat asset as video frames on a camera path.
- It renders; it does not convert or edit files. Use `splat-transform` for format conversion and filtering, `three-js` for meshes alone.
- VCR evidence covers one synthetic 3000-splat `.splat` file, an orbit camera and one mesh, on macOS arm64 in headless Chromium 156 with three 0.186.1. Everything else below is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `SplatMesh` loading (`fileBytes`, `url`) | [sparkjs.dev](https://sparkjs.dev/) | `.splat` bytes tested |
| Formats: PLY, compressed PLY, SPZ, KSPLAT, SOG | [README](https://github.com/sparkjsdev/spark#features) | untested |
| `SparkRenderer` sort (`sortRadial`, `minSortIntervalMs`) | [sparkjs.dev](https://sparkjs.dev/) | defaults tested |
| Mixing splats and meshes in one scene | [examples](https://sparkjs.dev/examples/) | tested (cube) |
| LoD, streaming, paging (`enableLod`) | [sparkjs.dev](https://sparkjs.dev/) | untested; frames would depend on load timing |
| Dyno shader graph, splat editing, skeletal animation | [sparkjs.dev](https://sparkjs.dev/) | untested |

## Install and doctor
```sh
pnpm add @sparkjsdev/spark@2.4.0 three
```
A project-local library: `vcr doctor` does not probe it. Spark needs WebGL2 and `three >= 0.180`.

## Smoke test
```sh
cd examples/spark-splats-capture && ./run.sh
# expect: spark-splats-capture: OK (90 frames)
```
It writes a seeded `.splat`, captures 90 frames at 960x540 twice (sequential, then shuffled) and diffs `expected/summary.json`.

## Scene contract
Load the scene through `@vcr/capture` (`window.__scene = { duration, seek }`), with an import map because Spark imports bare `three`:
```html
<script type="importmap">{ "imports": {
  "three": "./node_modules/three/build/three.module.js",
  "three/addons/": "./node_modules/three/examples/jsm/",
  "@sparkjsdev/spark": "./node_modules/@sparkjsdev/spark/dist/spark.module.js" } }</script>
```
```js
const spark = new SparkRenderer({ renderer });          // renderer: antialias false
scene.add(spark);
const splats = new SplatMesh({ fileBytes, fileType: "splat" });
scene.add(splats);
await splats.initialized;                                // before exposing __scene
```
The camera and every mesh are pure functions of `t`; Spark's own timers are not used.

## Wait for the sort
Spark sorts splats on a worker for each view. The harness's `seek` then two-frame settle does not wait for it, and a first run failed the shuffled-order check. Redraw until the sort matches the view, and await that before the screenshot:
```js
const isSortedForView = !spark.sorting && !spark.sortDirty && spark.sortedCenter.distanceTo(camera.position) < 1e-3;
```
Expose `whenSettled()` on `__scene` and, in the capture script, call `openScenePage` from `@vcr/capture`, then per frame: `seek(t)`, `await whenSettled()`, two animation frames, `page.screenshot`. See `capture.ts` in the example. `captureFrames` alone is not enough for splats.

## Troubleshooting
- `Failed to resolve module specifier "three/addons/..."`: add the `three/addons/` import-map entry; Spark imports it.
- Shuffled order differs from sequential: the screenshot ran before the sort finished; use the wait above.
- Splats look soft: at a few thousand splats they are blobs; use more, smaller splats or a real capture.

## Official docs
- [Spark documentation](https://sparkjs.dev/)
- [sparkjsdev/spark on GitHub](https://github.com/sparkjsdev/spark)
- [@sparkjsdev/spark on npm](https://www.npmjs.com/package/@sparkjsdev/spark)
