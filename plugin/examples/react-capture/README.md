# React capture

Status: validated on macOS arm64, 2026-11-12. The template for React libraries: copy this directory, keep its esbuild step, add no other bundler or config.

`capture.ts` bundles `scene.tsx` into `output/bundle/scene.js` (git-ignored) with esbuild, then captures `scene.html` with `captureFrames`. The scene is a React Three Fiber `<Canvas frameloop="never">`. Every transform is a pure function of a `t` state value. `seek(t)` commits `t` with `flushSync`, then calls `advance(t * 1000)` once on the next animation frame, which the harness settles before each screenshot.

Repo-only: outside the repo a `.tsx` scene needs a build that `vcr capture` lacks (follow-up issue).

```text
./run.sh            # expect: react-capture: OK (~14 fps)
./run.sh --record
```

## Template rule (what was needed)

`flushSync` + `advance` was enough; the fallback (R3F's own `createRoot(canvas)` without react-dom's `<Canvas>`) was not needed. Rules for React fixtures:

- Seek through props or state committed with `flushSync`. Never let a library run its own clock: no `useFrame` deltas, no `state.clock`, no springs or tweens left running.
- Render once per seek, on `requestAnimationFrame`, as the plain Three.js template does.
- Expose `window.__scene` only once the renderer exists (here, in `onCreated`).

## Intent and scope

- Tool: React Three Fiber 9.8.2 with React 19.3.1, react-dom 19.3.1, three 0.186.1, built by esbuild 0.25.12.
- Claim: an R3F scene, bundled from TSX, renders deterministically per seek with a transparent background: 90 frames at 1280x720 that match in shuffled and sequential order.
- Exclusions: R3F events, `useFrame`-driven animation, suspense-loaded assets (GLTF, textures, fonts), antialiasing, devicePixelRatio above 1, `vcr capture` outside the repo.
- Sources: https://r3f.docs.pmnd.rs/ (frameloop, advance), licence MIT per the npm registry and the package's LICENSE, checked 2026-11-12.
- Environment: macOS Darwin 25.6.0 arm64, Node 22.19.0, Playwright 1.64.1, Chromium 156.0.8078.4, ImageMagick 7.
- Input: three procedural meshes (torus knot, box, icosahedron), no external assets.
- Dependencies: exact pins in `package.json`, installed by `pnpm install` into this example; no network at capture time.
- Output: `output/` (bundle, frames, report, summary, contact sheet), git-ignored.

## Plan, before running

- Command: `./run.sh` (esbuild build, then `captureFrames` with `verifyDeterminism`).
- Predeclared checks: 90 frames, 1280x720, at least two distinct hashes, shuffled order equals sequential, frame 45 alpha min 0 and max 1.
- Failure modes: React scheduler or R3F rendering after the screenshot (shuffled mismatch); blank canvas from a render outside the settled frame. Fallback: drive R3F `createRoot(canvas)` directly.
- Inspect: contact sheet of frames 0, 15, 30, 45, 60, 75 over grey (command in `agents/evidence-runner.md` step 7).

## Observation, after running

- 2026-11-12, Opus orchestrator on Conors-MacBook-Pro-2.local. `./run.sh --record`, then `./run.sh` printed `react-capture: OK (13.95 fps)`. Deleting `output/` and running again rebuilt the bundle and passed.
- All predeclared checks pass: 90 frames, 1280x720, distinct hashes, shuffled equals sequential, frame 45 alpha 0..1.
- Contact sheet: a green torus knot, an orange box and a blue icosahedron on transparent ground; the knot and box rotate, the box scales, the outer shapes bob. Shapes sit in the upper half of the frame because the camera is raised without a `lookAt`; cosmetic.
- Result: pass. Establishes seek-by-prop for R3F under this harness; says nothing about other React libraries, which each need their own fixture.
