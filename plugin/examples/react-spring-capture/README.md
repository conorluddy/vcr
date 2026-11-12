# React Spring capture

React Spring is not time-seekable: its spring solver advances on its own frame loop from real time. This example proves the part that can be seeked. Scene values are closed-form functions of `t`, set on `animated.div` elements with `SpringValue.set` inside a `flushSync` commit, and react-spring paints them on one harness-driven frame per seek. The spring solver itself is not in the claim.

`capture.ts` bundles `scene.tsx` into `output/bundle/scene.js` (git-ignored) with esbuild, then captures `scene.html` with `captureFrames`, as `examples/react-capture` does.

```text
./run.sh            # expect: react-spring-capture: OK
./run.sh --record
```

## Intent and scope

- Tool: `@react-spring/web` 10.1.2 (pinned exactly), with React 19.3.1, react-dom 19.3.1, built by esbuild 0.25.12.
- Licence: MIT, per the package's `package.json` and its bundled `LICENSE` file. Docs: https://www.react-spring.dev/ and https://github.com/pmndrs/react-spring. Checked 2026-11-12.
- Claim: `animated.div` elements from `useSpring`, whose `SpringValue`s are set from `t` (closed-form, not solved) inside a `flushSync` commit, then painted on one harness frame, render deterministically per seek with a transparent background: 90 frames at 1280x720 that match in shuffled and sequential order.
- Frame loop: react-spring's rafz loop is wired to the harness, not the browser. `Globals.assign({ requestAnimationFrame })` hands its frame callback to the scene, which runs it once per seek. `Globals.assign({ now })` replaces `performance.now` with scene time. No `start()` or `from`/`to` animation is ever called, so no spring is active and each seek's set must reach idle; the scene throws if any spring is not idle after its frame, and `run.sh` fails on any page error.
- Exclusions (not proved):
  - Spring physics: stiffness, damping, mass, velocity carry, interruption, `from`/`to` animation, `loop`, `delay`. No spring is started, so the solver is not seeked, sampled or checked. This is the card's "not time-seekable" claim, and it stays unproven.
  - `immediate: true` as an API path: only `SpringValue.set` is used.
  - `useTransition`, `useTrail`, `useChain`, `useSprings`, `useScroll`, `useInView`, `useResize`, pointer and gesture input, reduced-motion handling, and the `@react-spring/three`, `-native` and `-konva` targets.
  - Unseeded sources, audited in `node_modules/@react-spring/*/dist` (browser builds):
    - `Math.random` appears in `useForceUpdate`, which uses it only as a unique state value to force a re-render. It writes no style, so it cannot change pixels; it is not seeded.
    - `performance.now` appears as rafz's default clock. The scene overrides it with `Globals.assign({ now })`, so it is not reached.
    - `Date.now` is only a fallback when `performance` is undefined, which Chromium never hits.
  - Antialiasing, devicePixelRatio above 1, `vcr capture` outside the repo (a `.tsx` scene needs a build that `vcr capture` lacks).
- Environment: macOS Darwin 25.6.0 arm64, Node and Chromium versions recorded after the run.
- Input: original procedural DOM shapes only (a rounded square, a circle and a rounded rectangle), no external assets.
- Dependencies: exact pins in `package.json`, installed into this example by `pnpm install`. No network at capture time.
- Output: `output/` (bundle, frames, report, summary, contact sheet), git-ignored.

## Plan, before running

- Command: `./run.sh --record`, inspect the contact sheet, then `./run.sh`.
- Predeclared checks (any failure fails the run; checks are not weakened):
  1. 90 frames, 1280x720 (3 s at 30 fps).
  2. At least two distinct frame hashes.
  3. Shuffled capture order equals sequential capture order, hash for hash.
  4. Frame 45 alpha min 0 and max 1: transparent ground, opaque shapes.
  5. No `page.error` or `page.console.error` event in `output/capture.log` (this carries the per-seek idle check and any react-spring frame request that is not ours).
  6. Visual inspection of frames 0, 15, 30, 45, 60 and 75 on grey: the three shapes must be visible and move.
- Result rule: if checks 1 to 5 pass and the visual inspection shows the shapes, the result is `partial`, not `pass`. The set-driven DOM path is proven; the spring solver the card describes is not. Any failure of checks 1 to 6 is recorded as `fail` (or `blocked` if the toolchain cannot run).
- Failure modes and stop conditions:
  - react-spring keeps a spring active after its set: idle check throws, page error, run fails.
  - DOM writes miss the screenshot (frames identical, or blank): distinct-hash or visual check fails.
  - Shuffled order differs: determinism check fails.
  - The esbuild bundle needs a browser build that does not exist: not expected, since `@react-spring/web` ships ESM; if it fails, stop and report `blocked`.
- Reproduce: `./run.sh --record && ./run.sh`. Inspect with `cd output/frames && magick ...` (command in `agents/evidence-runner.md`, step 7).

## Observation, after running

- Date and executor: 2026-11-12, Claude agent (evidence-runner) on Conors-MacBook-Pro-2.local (macOS Darwin 25.6.0, arm64).
- Versions: `@react-spring/web` 10.1.2 (with `@react-spring/core`, `animated`, `shared`, `rafz` 10.1.2 transitively); React 19.3.1; react-dom 19.3.1; esbuild 0.25.12; Playwright 1.64.1; Chromium 156.0.8078.4 (`chromium.launch()` version, the same build the capture uses); Node 22.19.0; tsx 4.23.15.
- Commands and results: `./run.sh --record` passed (90 frames, 1280x720, 19.75 fps, shuffled matches sequential, distinct hashes, frame 45 alpha 0..1). Then `./run.sh` printed `react-spring-capture: OK (19.89 fps)`. `output/capture.log` had no `page.error` or `page.console.error` events.
- Frame loop: `Globals.assign` replaced rafz's scheduler and clock, so react-spring never calls the browser's `requestAnimationFrame` itself. The scene runs its one pending frame per seek, and each seek throws if any of the 15 springs is still active after that frame. No throw occurred, so no spring was ever active.
- Contact sheet (`output/contact.png`): three shapes on a transparent ground (shown here over grey). The green rounded square sways sideways and turns; the orange circle pulses in scale and bobs; the blue bar fades in and out and turns the other way. Positions match the closed-form values at each sampled time (frame 15 is at +286 px horizontally, frame 45 is centred horizontally with the circle at scale 1.1). Frame 0 has the square and circle nearly touching, which is by design. Nothing is clipped or blank.
- Pass / partial / fail: `partial`. The set-driven DOM path is proved. The spring solver the tool card describes is not: it was not started, seeked or sampled. The predeclared checks all pass, but the claim explicitly excludes the solver, so the result is recorded as partial, not pass. `validation.status` on the tool card is `partial`, and the example stays `not-validated`.
- Deviations and limitations: only `SpringValue.set` was used; `immediate: true` was not exercised. The idle guard was not negatively tested (no mutation run that starts a spring to confirm it throws); its registry is populated (15 springs), and `run.sh` gates on any page error. Frame 0 overlaps by design (cosmetic). Repo-only, like the template.
- What this establishes: react-spring 10.1.2 `animated.div` elements render deterministically per seek when their values are set from t with `SpringValue.set` inside `flushSync`, with a harness-driven frame, on macOS arm64 with Chromium 156. It does not establish seeking of spring physics, any other react-spring hook or target, or other platforms.
- Reviewer and revisit triggers: revisit if react-spring adds a seekable clock or a documented manual-advance API, if the physics path is in scope for a job, or if `@react-spring/web` moves off 10.1.2.
