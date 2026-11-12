# Motion capture

Status: validated on macOS arm64, 2026-11-12 (pass, see Observation). The React-template fixture for `motion` (motion/react, DOM output), copied from `examples/react-capture` with the three.js and R3F dependencies removed.

`capture.ts` bundles `scene.tsx` into `output/bundle/scene.js` (git-ignored) with esbuild, then captures `scene.html` with `captureFrames`. The scene is three `motion.div` elements whose `style` is bound to module-level motion values. Each motion value is animated by one `animate()` control created with `autoplay: false`, stopped at build time, and seeked by setting `.time = t`.

```text
./run.sh            # expect: motion-capture: OK
./run.sh --record
```

## Template rule (what was needed)

- Seek is a pure function of `t`: `seek(t)` sets `.time = t` on every control. Each control applies `f(t)` synchronously when it has no running driver; nothing is stepped from the previous frame, so out-of-order seeks are not a hazard.
- The controls are stopped at build time. In motion 14.12.0, `animate(..., { autoplay: false })` still calls `play()` and then `pause()` in the `JSAnimation` constructor, and the frameloop driver it started is kept alive (`keepAlive`), so it re-runs every frame on `requestAnimationFrame` with `performance.now()` timestamps even while paused. `stop()` tears the driver down. A stopped control still accepts `.time` and applies it synchronously.
- DOM writes happen through motion's own render batch, scheduled on `requestAnimationFrame` during the seek. That batch is registered before the harness's settle frames, so it runs before the screenshot.
- The elements are mounted with `flushSync` before `window.__scene` is set, so the first seek already has nodes to write to.
- No React state, no `useFrame`-style clock, no `useMotionValue` ticks: nothing in the scene reads wall-clock time after build.

## Intent and scope

- Tool: Motion 14.12.0 (`motion` on npm, which re-exports `framer-motion` 14.12.0, `motion-dom` 14.12.0, `motion-utils` 14.7.0), used through `motion/react` with React 19.3.1 and react-dom 19.3.1, bundled by esbuild 0.25.12.
- Claim: `motion.div` elements driven by motion values, seeked from `t` through paused `animate()` controls (`.time = t`), render deterministically with a transparent background: 90 frames at 1280x720 that match in shuffled and sequential order, with motion's frameloop idle after the seek.
- Exclusions:
  - `stagger` with `from: "random"` or any random ordering: `motion-dom/dist/es/utils/stagger.mjs` calls `Math.random()` (line 36). Not used. This is the one `Math.random` in the browser path.
  - Layout animations, `layoutId`, shared-element transitions, scroll-linked motion, gestures (drag, hover, tap), `whileInView`, `AnimatePresence` and any `initial`/`animate` props on `motion.*` components.
  - Optimized appear (WAAPI handoff for SSR-hydrated `data-framer-appear-id` elements). Its `performance.now()` call (`framer-motion/dist/es/animation/optimized-appear/start.mjs` line 150) is reached only with that SSR attribute; not used here.
  - WAAPI-accelerated values (opacity via native animation, transform acceleration): the scene animates motion values through JSAnimation only.
  - Springs with wall-clock velocity sampling, `useSpring`, `useTransform` chains beyond identity, `inertia`.
  - Anything outside `motion/react`: no `motion/mini`, no `three` or `vgpu` entry points, no Motion+ paid features.
  - Antialiasing, devicePixelRatio above 1, `vcr capture` outside the repo.
- Sources: https://motion.dev/docs (`animate`, `motionValue`, playback controls), npm `motion` 14.12.0 licence MIT (npm registry, checked 2026-11-12). The exclusions above come from grepping the 14.12.0 `dist` of `motion`, `framer-motion`, `motion-dom` and `motion-utils`.
- Environment: macOS Darwin 25.6.0 arm64, Node 22.19.0, Playwright 1.64.1, Chromium from the capture report, ImageMagick 7.
- Input: three procedural DOM shapes (circle, rounded square, rounded dot) on a transparent background; no external assets.
- Dependencies: exact pins in `package.json`, installed by `pnpm install` into this example; no network at capture time.
- Output: `output/` (bundle, frames, report, summary, contact sheet), git-ignored; `expected/summary.json` is the only committed result.

## Plan, before running

- Command: `./run.sh --record` (esbuild build, then `captureFrames` with `verifyDeterminism`), then `./run.sh` (must print `motion-capture: OK`).
- Predeclared checks, enforced by `run.sh`:
  - 90 frames, 1280x720.
  - At least two distinct frame hashes.
  - Shuffled-order hashes equal sequential hashes.
  - Frame 45 (t = 1.5 s, the circle's yoyo turn) alpha min 0 and max 1.
- Additional probe, not in `run.sh`: after each seek, count `requestAnimationFrame` and `performance.now` calls over 500 ms with no input; both must be zero. Probe script lives outside the repo; numbers are in the observation.
- Failure modes and stop conditions:
  - Shuffled hashes differ: a control or motion value is not a pure function of `t`; stop, do not weaken the check.
  - Identical frames across t: the render batch did not run before the screenshot; report `fail`.
  - Blank or clipped frames at the contact sheet: `fail` whatever the hashes say.
  - Motion's `.time` setter does not apply on a stopped control: stop, report `partial` or `fail`, do not switch to `useMotionValue` and credit the original claim.
- Inspect: contact sheet of frames 0, 15, 30, 45, 60, 75 over grey (command in `agents/evidence-runner.md` step 7), written to `output/contact.png`.

## Observation, after running

- 2026-11-12, Claude agent (Haiku 5.5) in its own worktree on Conors-MacBook-Pro-2.local (macOS arm64, Darwin 25.6.0).
- Versions: motion 14.12.0 (framer-motion 14.12.0, motion-dom 14.12.0, motion-utils 14.7.0), react and react-dom 19.3.1, Playwright 1.64.1, Chromium 156.0.8078.4 (`browser.version()`), esbuild 0.25.12, tsx 4.23.15, Node 22.19.0, ImageMagick 7.1.2-15.
- Commands: `./run.sh --record` (19.29 fps for the sequential pass; the shuffled pass is not timed), then `./run.sh`, which printed `motion-capture: OK (19.92 fps)`.
- Checks, all as predeclared: 90 frames; 1280x720; distinct hashes true; shuffled order equals sequential (no mismatched frames); frame 45 alpha min 0, max 1.
- Idle probe (outside the repo): after each of five seeks (t = 0, 1.0, 1.5, 2.2, 0.3), 0 `requestAnimationFrame` calls and 0 `performance.now` calls in the following 500 ms. Control build with the `stop()` line removed: 30 rAF and 30 `performance.now` calls per 500 ms at every seek, with identical transforms. So `stop()` is what releases the loop; the seek values are the same either way.
- Inspection of `output/contact.png` (frames 0, 15, 30 top row; 45, 60, 75 bottom row, grey behind): a green circle sweeps horizontally from left of centre at frame 0 to its right-hand end at frame 45, then back toward centre by frame 75. A rounded orange square rotates and scales through the sequence (small and upright at frame 0, larger and tilted at frame 30, a diamond near frame 45). A blue rounded dot fades in from faint (frame 0) to solid, rises and falls. Background is transparent (corner pixel alpha 0 in frames 0 and 45). Nothing is blank or clipped; all three shapes are visible in every frame.
- Sampled transforms at t = 0.3 s (probe): circle translateX -251 px, consistent with easeInOut progress of about 0.08 across the 600 px sweep ((-251 + 300) / 600); dot translateY -13 px.
- Result: pass. The claim holds for motion 14.12.0 DOM `motion.div` elements bound to motion values, seeked through stopped `animate()` controls with `.time = t`, on this machine and Chromium 156. It establishes that the render is a pure function of t in this scene and that nothing runs on motion's frameloop after a seek.
- Not established: other motion APIs (layout, springs, `useSpring`, gestures, scroll, WAAPI-accelerated opacity, SSR optimized appear); `motion/react` components with `initial`/`animate` props; other OS or browsers; stagger with random ordering (excluded, uses `Math.random`); quality beyond the frames inspected. Frame 45 sits exactly on the yoyo turn, which the check covers but does not isolate.
- Deviation: the brief's `git merge --ff-only origin/feat/react-capture-template` failed because this worktree's `main` (13a707c) and the base branch diverge. The branch was created from `origin/feat/react-capture-template` instead, so the template was taken from that base.
