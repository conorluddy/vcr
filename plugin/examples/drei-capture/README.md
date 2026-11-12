# drei capture

Status: validated on macOS arm64, 2026-11-12. Evidence for `drei` through the React Three Fiber route, copied from `examples/react-capture`.

`capture.ts` bundles `scene.tsx` into `output/bundle/scene.js` (git-ignored) with esbuild, then captures `scene.html` with `captureFrames`. The scene is a React Three Fiber `<Canvas frameloop="never">` that uses three drei helpers. Every transform and every line vertex is a pure function of a `t` state value. `seek(t)` commits `t` with `flushSync`, then calls `advance(t * 1000)` once on the next animation frame.

```text
./run.sh            # expect: drei-capture: OK
./run.sh --record
```

## Intent and scope

- Tool: drei 10.7.9 (`@react-three/drei`, pinned exactly), on React Three Fiber 9.8.2, React and react-dom 19.3.1, three 0.186.1, bundled by esbuild 0.25.12.
- VCR job and claim: drei helpers render deterministically inside an R3F scene seeked via `flushSync` + `advance`. The helpers exercised are `RoundedBox` (geometry), `Line` (fat lines, LineMaterial) and `Center` (staging). Output: 90 transparent frames at 1280x720 that match in shuffled and sequential order.
- Exclusions: `Float` (reads a clock, so it is not used anywhere in the scene); `Text` and `Text3D` (fetch fonts); `Environment`, `Stage` and any HDRI or texture loader (fetch network assets); `Sparkles` (draws from `Math.random`); interaction controls (`OrbitControls` and friends); antialiasing; devicePixelRatio above 1; `vcr capture` outside the repo (follow-up issue, as for react-capture).
- Unseeded calls found in the drei build: `Line` constructs `Line2` or `LineSegments2` with no arguments, and three-stdlib's default material constructor calls `Math.random()` for an initial colour. drei's `Line` attaches its own `LineMaterial` (colour from its `color` prop, default `0xffffff`) over that default before anything is drawn, so the random value never reaches a pixel. This is named here rather than excluded; the shuffled-order check is the test of that claim. `RoundedBox`, `Center` and their three-stdlib dependencies (`toCreasedNormals`, `BufferGeometryUtils`) contain no `Math.random`, `performance.now` or `Date.now` in the browser build.
- Sources: https://github.com/pmndrs/drei (README and `LICENSE`), licence MIT per the npm registry (`license: MIT`) and the card, checked 2026-11-12.
- Environment: macOS Darwin 25.6.0 arm64 (`Conors-MacBook-Pro-2.local`), Node 22.19.0, Playwright 1.64.1, Chromium 156.0.8078.4 (Playwright's bundled build), ImageMagick 7.1.2-15.
- Input: procedural only. A rounded cube, a torus knot and a wave polyline computed from `t`. No external assets.
- Dependencies: exact pins in `package.json`, installed by `pnpm install` into this example; no network at capture time.
- Output: `output/` (bundle, frames, report, summary, contact sheet), git-ignored.

## Plan, before running

- Command: `./run.sh` (esbuild build, then `captureFrames` with `verifyDeterminism`).
- Predeclared checks: 90 frames, 1280x720, at least two distinct hashes, shuffled order equals sequential, frame 45 alpha min 0 and max 1.
- Failure modes: a drei helper that reads the clock or random state at render time (shuffled mismatch); `Center` centring on a frame that is not yet committed (blank or offset shapes in the contact sheet); `Line` failing to resize (thin or missing line); a second copy of React or three from a pnpm peer split (hooks error, blank canvas). Stop and report `fail` if the contact sheet shows no drei output, whatever the hashes say. No fallback route: this is drei or nothing.
- Inspect: contact sheet of frames 0, 15, 30, 45, 60, 75 over grey (command in `agents/evidence-runner.md` step 7).

## Observation, after running

- 2026-11-12, executed by the evidence-runner agent on Conors-MacBook-Pro-2.local. `./run.sh --record` recorded `expected/summary.json`; `./run.sh` then printed `drei-capture: OK (5.89 fps)`.
- Versions: drei 10.7.9, @react-three/fiber 9.8.2, react and react-dom 19.3.1, three 0.186.1, esbuild 0.25.12, Playwright 1.64.1, Chromium 156.0.8078.4 (read from `chromium.launch().version()`; the capture report does not record it), Node 22.19.0, ImageMagick 7.1.2-15.
- Predeclared checks, all pass: 90 frames, 1280x720, 90 hashes with distinct values, shuffled order equals sequential (`mismatched_frames` empty), frame 45 alpha min 0 and max 1.
- Contact sheet (`output/contact.png`, frames 0, 15, 30, 45, 60, 75): a green rounded cube rotating and bobbing on the left, an orange torus knot on the right that turns and changes scale, and a thin blue wave across the bottom whose phase shifts from frame to frame. Transparent background, shapes clear of the frame edges, nothing clipped. The knot sits at its group's origin, which is the `Center` effect, though that is not separately visible. The line is thin at 50% scale (lineWidth 3); visible, not a defect.
- Result: pass. Establishes seek-by-prop for RoundedBox, Center and Line under the React Three Fiber harness on macOS arm64. Does not establish `Float`, `Text`, `Environment` or any asset-loading helper, nor `Sparkles`, nor a different OS, and not quality beyond the contact sheet. Random values inside `Line2`'s constructor are discarded before rendering, not removed from the build.
