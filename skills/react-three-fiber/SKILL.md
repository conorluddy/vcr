---
name: react-three-fiber
description: Use when a VCR browser scene should compose Three.js objects as React components with React Three Fiber. Includes the documented API map and the exact seek-driven behavior demonstrated by the VCR fixture.
---

# React Three Fiber

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside this repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits

- Use React Three Fiber (R3F) to express a Three.js scene as React components, with React props/state driving scene changes and access to Three.js through hooks.
- Pair R3F with Three.js for geometry/materials, and optionally with Drei or postprocessing for documented ecosystem components. Those integrations have separate fixtures and guides.
- R3F v9 pairs with React 19; v8 pairs with React 18. Choose matching majors. If React is not already useful to the project, plain Three.js gives more direct render control.
- The one R3F fixture proves a basic Canvas scene can be seeked and captured in the repository through `frameloop="never"`, synchronous state commit, and `advance`. Events, `useFrame` clocks, loaded assets, and operation through installed-plugin `vcr capture` are outside that evidence.

## Capability map

| Documented area | Official reference | VCR fixture coverage |
| --- | --- | --- |
| Canvas and renderer setup | [Canvas API](https://r3f.docs.pmnd.rs/api/canvas) | Transparent Canvas, camera, DPR and renderer options exercised by `react-capture`; other configuration untested. |
| Hooks and frame loop | [Hooks API](https://r3f.docs.pmnd.rs/api/hooks), [Scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) | `frameloop="never"` plus `advance()` after a flushed React state update is exercised. `useFrame`, deltas, clock, demand invalidation and performance scaling untested. |
| Events and raycasting | [Events API](https://r3f.docs.pmnd.rs/api/events) | Untested. |
| Reconciler, objects and JSX | [Introduction](https://r3f.docs.pmnd.rs/), [Objects and props](https://r3f.docs.pmnd.rs/api/objects) | JSX meshes, built-in geometries, lights and standard materials exercised. Custom Three.js classes, attach semantics and object disposal untested. |
| Performance and ecosystem | [Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Drei](https://drei.docs.pmnd.rs/) | Instancing, adaptive performance, Drei and postprocessing are not covered by the R3F fixture. |

Fixture evidence: `react-capture` used @react-three/fiber 9.8.2, React/react-dom 19.3.1, Three.js 0.186.1, esbuild 0.25.12 and Playwright 1.64.1 on macOS arm64. It captured 90 frames at 1280×720, with distinct hashes, shuffled/sequential equality and a frame-45 alpha range of 0–1. The scene had three procedural meshes and no external assets. This is partial API coverage, not validation of all R3F documented areas.

## Install and doctor

R3F v9 is the React 19 line; install it with Three.js in the project:

```sh
pnpm add react react-dom three @react-three/fiber
pnpm vcr doctor
```

For capture, use the repository fixture dependencies and capture setup described by the workspace. `doctor` reports machine availability; this guide does not claim the packages or browser are installed. The validated fixture uses R3F 9.8.2.

## Smoke test

Create the validated example with `vcr example create react-capture`; change to its printed destination, install the example dependencies, then run:

```sh
pnpm install
./run.sh
# expect: react-capture: OK (13.95 fps; sample, varies by machine)
```

The run builds TSX with esbuild, then asserts 90 frames at 1280×720, at least two distinct frame hashes, shuffled/sequential equality, and frame-45 alpha 0–1. The measured rate varies by machine. This fixture runs inside the repository; it does not demonstrate the plugin CLI building arbitrary TSX scenes.

## Scene contract

For order-independent capture, hold R3F's own loop and derive each frame from the requested time. The fixture's recipe is:

```tsx
<Canvas frameloop="never" dpr={1}>
  <SceneAtTime t={t} />
</Canvas>
```

Commit the requested time synchronously, then render once through `advance`:

```tsx
function seek(t: number) {
  flushSync(() => setTime(t));
  requestAnimationFrame(() => advance(t * 1000));
}
```

Publish `window.__scene = { duration, seek }` only after Canvas has created its renderer. The shared capture harness settles animation frames before screenshot. The fixture uses `useState` as an input value, but does not exercise `useFrame`; do not leave an independent clock, spring or tween controlling the captured state.

The React fixture needs an esbuild step for `.tsx`; its `capture.ts` bundles the scene before calling `@vcr/capture`. That bundling route is repository-only at present.

## Troubleshooting

- Blank canvas: wait until Canvas `onCreated` before publishing `window.__scene`, and schedule `advance` on the animation frame the harness settles.
- Different sequential and shuffled frames: update all visual state from `t`, synchronously commit React state before `advance`, and avoid independent `useFrame` deltas, clocks, springs or tweens.
- Missing JSX bundle: run the fixture's esbuild step. The plugin CLI currently does not bundle arbitrary `.tsx` scenes.
- Hooks fail outside Canvas: R3F hooks such as `useThree` and `useFrame` require a component rendered beneath `<Canvas>`.

## Official docs

Validated: @react-three/fiber 9.8.2 with React 19.3.1 (macOS arm64, 2026-11-12). The upstream docs are rolling; select the v9-compatible docs and confirm version compatibility before upgrading. Start with the [R3F docs](https://r3f.docs.pmnd.rs/), [Canvas](https://r3f.docs.pmnd.rs/api/canvas), [hooks](https://r3f.docs.pmnd.rs/api/hooks), [events](https://r3f.docs.pmnd.rs/api/events), and [performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
