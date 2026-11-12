# Rapier capture

Status: validated on macOS arm64, 2026-11-12, with the deviations listed under "Deviations, found while running". React fixture for `react-three-rapier`, built on `examples/react-capture`: the scene is `scene.tsx`, bundled by the template's esbuild step in `capture.ts`, and seeked from `t`.

Tool id: `react-three-rapier`. The claim is about the React wrapper's stepping, not about Rapier's solver quality.

## Intent and scope

- Tool: `@react-three/rapier` 2.2.0 (exact), with `@dimforge/rapier3d-compat` 0.19.2 as its pinned dependency. Stacked on React Three Fiber 9.8.2, React 19.3.1, react-dom 19.3.1, three 0.186.1, esbuild 0.25.12.
- VCR job and claim: a few rigid bodies fall onto a fixed floor, and each frame is a deterministic function of `t`. A seek resets every body to its rest pose, steps the world at a fixed 1/60 s from 0 to `t`, then renders once. 90 frames at 1280x720 with a transparent background, and shuffled order matches sequential order.
- Explicit exclusions:
  - `updateLoop="independent"` is not exercised. Its `RafStepper` is the only code path that calls `performance.now`, so the claim covers the default `follow` loop only.
  - No joints, sensors, contact events, instanced bodies, `debug`, or `timeStep="vary"`. (`World.restoreSnapshot` is used, not excluded.)
  - Interpolation is off (`interpolate={false}`), so no interpolated poses are tested.
  - No asset loading and no suspense-loaded geometry.
  - Solver accuracy and energy behaviour are not judged. Only that repeated seeks reproduce.
  - The `vcr capture` route outside this repo.
- Sources and checked date (2026-11-12):
  - Licence of `@react-three/rapier`: MIT, taken from the upstream repository's `LICENSE` on `master` (https://github.com/pmndrs/react-three-rapier). The npm packument and the 2.2.0 tarball declare no licence field and ship no LICENSE file, so the licence was not verifiable from the pinned artifact. The orchestrator accepted the upstream MIT licence on 2026-11-12 (recorded here; not from the package itself).
  - Licence of `@dimforge/rapier3d-compat` 0.19.2, which the package pulls in: Apache-2.0, per its `package.json`.
  - Docs: https://github.com/pmndrs/react-three-rapier (readme), https://rapier.rs (engine).
- Environment: macOS Darwin 25.6.0 arm64, Node 22.19.0, Playwright 1.64.1, Chromium from the capture report, ImageMagick 7.
- Input: procedural shapes only (a fixed box floor, a sphere, a box, a cylinder). No external assets, no randomness: initial poses are constants in `scene.tsx`.
- Dependencies: exact pins in `package.json`; `pnpm install` in this example only. No network at capture time (the static loopback server serves `output/`). The WASM is copied from the installed rapier-compat package into `output/bundle/` by `capture.ts`.

### Findings that shape the scene

1. The WASM is not inlined. `rapier_wasm3d_bg.wasm` (1.57 MB) ships beside the compat package, and the default `init()` builds `new URL("rapier_wasm3d_bg.wasm", "<deleted>")`, which throws `Invalid URL` in any browser. `scene.tsx` therefore calls `init({ module_or_path })` before rendering, pointing at the copied WASM.
2. `init` is not exported by `@react-three/rapier`, so the scene imports it from `@dimforge/rapier3d-compat`. The compat package is a direct dependency pinned to 0.19.2, the version `@react-three/rapier` 2.2.0 resolves, so esbuild bundles one copy shared with the Physics component (orchestrator approval, 2026-11-12).
3. The stepper in `Physics` keeps an accumulator between calls. With `timeStep={1/60}` and `step(1/60)` each call steps exactly once, and the accumulator returns to exactly 0, so seeks do not inherit remainder time.
4. The browser build is the ESM file (`react-three-rapier.esm.js`) bundled by esbuild, which the coordinator counts as the browser build. The package's `exports` map only permits `.`, so the WASM cannot be reached by subpath.

## Plan, before running

- Commands: `./run.sh --record` (esbuild bundle, WASM copy, `captureFrames` with `verifyDeterminism`, then write `expected/summary.json`), then `./run.sh` (must print `rapier-capture: OK`).
- Predeclared checks, all in `run.sh` and diffed against `expected/`:
  - 90 frames, 1280x720.
  - At least two distinct frame hashes (rules out a frozen scene).
  - Shuffled-order capture equals sequential capture (the determinism check, the one most likely to fail through warm-started contacts after resets).
  - Frame 45 alpha min 0 and max 1 (transparent background, opaque shapes).
- Visual checks, predeclared, made by reading the contact sheet: the sphere, box and cylinder are visible above the floor at frame 0, and by frame 89 they rest on the floor (sphere and cylinder landed, box settled). A blank frame, bodies clipped out of frame, or floating bodies is a fail whatever the hashes say.
- Expected failure modes and stop conditions:
  - Default `init()` throws (expected, avoided by passing the URL).
  - WASM 404 or wrong MIME type (the server maps `.wasm` to `application/wasm`).
  - Shuffled mismatch from warm-started contact impulses surviving the reset. If it fails, record `fail` or `partial`, do not change the checks.
  - Scene exposes `__scene` before bodies are registered (guarded: `__scene` is set in an effect inside `Physics`).
- Reproduction: `./run.sh --record && ./run.sh`. Inspect with the contact sheet command in `agents/evidence-runner.md` step 7.

## Deviations, found while running

These are changes from the plan above. The predeclared checks were not changed.

1. Reset method. The plan said to reset every body to rest and re-step. The first `--record` run did that and failed the determinism check: 53 of 90 frames mismatched (frames 0, 26, 31-37, 42-51, 53-80, 82-87). Diagnosis: a plain Node rapier run showed that one 120-step history followed by 60 steps differs from a fresh 60-step run for the box and cylinder (1e-5 to 4e-5 m; the sphere matched). The mechanism behind that residual was not isolated. The scene now restores the world from a snapshot taken at the first seek, before any step. That snapshot is the rest state of every body. `takeSnapshot` and `World.restoreSnapshot` are listed on the tool card. A snapshot restore reproduced a fresh run exactly in Node, and in the browser all three history comparisons matched (frame 30 after 60, frame 0 after 30, frame 30 twice).
2. Mesh sync. Physics copies rapier poses onto meshes only inside `step()`. After a restore, a zero-length `step(0)` is therefore needed before any stepping, otherwise a seek to `t=0` shows the previous seek's meshes. A probe confirmed the mesh and rapier heights agree after the change.
3. Framing. The first contact sheet showed the cylinder clipped at the top edge of frame 0. The camera moved from z=9 to z=11. Nothing else in the scene or checks changed, and `expected/` was recorded after this change.
4. Browser WASM. `init()` with no arguments throws in browsers (the `"<deleted>"` base, see Findings 1). The scene calls `init({ module_or_path })` before rendering. The WASM is not inlined in `scene.js`. `capture.ts` copies it into `output/bundle/`, and the scene fetches it from there. This WASM copy is the one addition to the template's `capture.ts`; the esbuild step itself is unchanged.
5. Direct dependency. The worker first used a deep import into pnpm's `.pnpm` layout; integration replaced it with a declared, exact `@dimforge/rapier3d-compat` 0.19.2 dependency.
6. `canSleep` was set to false while diagnosing and then reverted. Sleep is not part of the result.

## Reachability of unseeded calls

The bundle contains `Math.random` (23 occurrences), `performance.now` (8) and `Date.now` (3). They come from three.js (UUIDs and the `Clock`/`Timer` helpers), React internals (element keys and the scheduler), and rapier's `RafStepper`, which only the `updateLoop="independent"` mode uses. The compat package contains none of them. The `follow` loop passes a clock delta into `Physics`, but that step is a no-op while paused. None of these reaches a pixel in this scene, which the shuffled-order check confirms.

## Observation, after running

- Date and executor: 2026-11-12, evidence agent (claude-haiku-5-5), on Conors-MacBook-Pro-2.local (`hostname`).
- Versions: `@react-three/rapier` 2.2.0 (exact), `@dimforge/rapier3d-compat` 0.19.2 (pinned by it), `@react-three/fiber` 9.8.2, `three` 0.186.1, `react` and `react-dom` 19.3.1, `esbuild` 0.25.12, `playwright` 1.64.1, Chromium 156.0.8078.4, Node 22.19.0, pnpm 10.29.2, ImageMagick 7.1.2-15 Q16-HDRI. Darwin 25.6.0 arm64.
- Command and results: `./run.sh --record` recorded `expected/summary.json`. The second `./run.sh` printed `rapier-capture: OK (18.9 fps)`. Checks, all from `output/summary.json`: 90 frames; 1280x720; distinct hashes true; shuffled order equals sequential (`mismatched_frames` empty); frame 45 alpha min 0, max 1.
- WASM: `rapier_wasm3d_bg.wasm`, 1,569,397 bytes, copied to `output/bundle/`. `scene.js` contains no base64 WASM (0 `data:application/wasm` matches). `scene.js` is 5.1 MB, unminified.
- Contact sheet (`/Users/conor/Development/VCR/.claude/worktrees/agent-rapier/examples/rapier-capture/output/contact.png`, git-ignored), frames 0, 15, 30, 45, 60, 75 in two rows of three: at frame 0 the sphere, box and cylinder hang in the upper part of the frame, all in view after the camera change. Frame 15 shows them mid-fall. Frame 30 shows all three bodies already on the floor, the box and cylinder still tilted. Frames 45 to 75 show the bodies resting, with the cylinder still shifting slightly at 45. The floor is a dark slab on a transparent background. The picture shows the physics doing its work, not a blank or clipped frame.
- Result: pass for the claim as worded: deterministic per seek, with the reset method changed as described in Deviation 1.
- What this does not establish: other OS or GPU, other seek orders than the single shuffle, other rapier features (joints, sensors, events), the `independent` update loop, or any other React physics wrapper.
