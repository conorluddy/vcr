# bvh-mocap-playback

Status: validated on macOS arm64 (Conors-MacBook-Pro-2.local), 2026-11-24, with three 0.186.1, Playwright 1.64.1, Chromium 156.0.8078.4, Node v22.19.0. Pass on the predeclared checks after three amendments made during the run (A1 to A3 below, reported in full). The sections below are the plan written before the first run, the amendments, then the observation.

## Intent and scope

- Tool: `bvh-mocap` (catalogue id), which is Three.js `BVHLoader` (`three/examples/jsm/loaders/BVHLoader.js`) playing its output through `AnimationMixer`. Pinned `three` 0.186.1 (the repo's pinned Three.js, same as `three-vrm-capture`), with `playwright` and `imagemagick` used by the capture route.
- VCR job and claim: `BVHLoader` parses a hand-written BVH file into a skeleton with predeclared joint names and an `AnimationClip` with a predeclared duration and track count; sampling the clip with `mixer.setTime(t)` at predeclared times gives each joint's rotation (and the hip position) equal to the BVH frame values, interpolated as the loader's keyframe tracks interpolate (slerp for rotations, lerp for positions), within 1e-6; the captured frames are deterministic (shuffled order equals sequential) and distinct poses differ.
- Explicit exclusions:
  - No CMU or any other mocap data. The only BVH is `fixture/chain.bvh`, written for this fixture, so no data licence applies. CMU motion data is not cleared by this run.
  - No check that the motion looks natural or that the rig is anatomically right. The check is numeric agreement with the file.
  - Only the channel orders in the fixture (`Xposition Yposition Zposition` and `Z/X/Y` or `X/Y/Z` rotation orders) are exercised. Other BVH variants, `EulerOrder` other than the file's channel order, `Frame Rate` headers and BVH export are not.
  - Only the loader's default `animateBonePositions` and `animateBoneRotations` (both true) are used.
  - No IK, retargeting, blending, cross-fade, or `AnimationMixer` looping beyond the clip duration.
  - Not a claim about other tools routed through the skeleton (`three-vrm`, `mpfb`), other browsers, GPUs or OSes.
- Tool documentation and licence sources, checked 2026-11-24:
  - Docs: https://threejs.org/docs/#examples/en/loaders/BVHLoader (from the tool card).
  - Three.js licence: MIT. Read at `node_modules/.pnpm/three@0.186.1/node_modules/three/LICENSE` ("The MIT License, Copyright 2010-2026 three.js authors").
  - Motion data: none used. The tool card's CMU terms are noted and not relied on.
- Environment: macOS (Darwin 25.6.0), Apple Silicon, Chromium and WebGL as provided by the capture route; no GPU driver details recorded beyond the browser.
- Input: `fixture/chain.bvh`, a 4-joint chain (Hips root, Spine, Neck, Head, with an End Site under Head), 30 frames at 30 fps (frame time 0.0333333333 s). Written for this fixture; the per-frame values are closed-form in the frame index `i` = 0..29:

  | Joint | Channels (file order) | Frame `i` values (degrees; positions in cm) |
  | --- | --- | --- |
  | Hips (ROOT) | Xposition Yposition Zposition Zrotation Xrotation Yrotation | 0, 90, 0.5·i, 0, 0, 6·i |
  | Spine | Zrotation Xrotation Yrotation | i, 2·i, −i |
  | Neck | Xrotation Yrotation Zrotation | −i, 3·i, 0 |
  | Head | Zrotation Xrotation Yrotation | 0, 4·i, 0 |

  The file is the source of truth; the probe reads it and does not use the formulas.
- Unseeded features: `grep -c "Math.random\|performance.now\|Date.now"` on `three/build/three.module.js`, `three/examples/jsm/loaders/BVHLoader.js` and `three/src/animation/AnimationMixer.js` (three 0.186.1) returned 0 for each. The scene uses no clock and no randomness.
- Seeking and state: `AnimationMixer.setTime(t)` zeroes the mixer and action times and then updates by `t`, so each call is absolute. The scene never accumulates deltas. The probe calls the same `setTime(t)` path.
- Workspace and output: `examples/bvh-mocap-playback/output/` (git-ignored). Committed: `fixture/chain.bvh`, `expected/summary.json`, `expected/probe.json`. No media is committed.

## Plan, before running

Commands:

```text
pnpm install                                                   # repo root, once; installs three 0.186.1 for this example
examples/bvh-mocap-playback/run.sh --record                    # probe, capture, hashes, record expected/
examples/bvh-mocap-playback/run.sh                             # must print bvh-mocap-playback: OK
```

Versions: `three` 0.186.1 (exact pin in `package.json`), `playwright` via `@vcr/capture`, Chromium from the capture report, Node 22.19.0 via tsx 4.23.15. `@vcr/capture` and `tsx` as in the template.

Scene: 1280x720, 30 fps, duration 1.0 s, so 30 frames at t = frame/30. The BVH is loaded with `BVHLoader.loadAsync` from `./fixture/chain.bvh`; the mixer is `new AnimationMixer(hips)`, with the clip played once (`play()`) and then driven only by `mixer.setTime(t)`. Joint origins are drawn as spheres attached to each bone, with `SkeletonHelper` lines, on a transparent background.

Probe (`probe.ts`, Node, uses the same page route as `three-vrm-capture`): reads the skeleton and clip facts from the page, samples each of the first four joints at predeclared times with `sample(t)` (which calls `mixer.setTime(t)`), and computes the expected values in Node by parsing the BVH text itself (its own channel composition in file order, and interpolation between the two neighbouring frames: slerp for rotation, lerp for position).

Predeclared checks. Any failure makes the probe throw and the result `fail` unless stated otherwise.

Probe checks:

- P1. Skeleton bone names, in order: `Hips, Spine, Neck, Head, ENDSITE`. The `ENDSITE` bone is what the loader's `toTHREEBone` creates for the End Site node; it has no track. Predicted from reading the loader source; if the names differ the check fails and the run is recorded as `fail`, not edited.
- P2. Clip: name `animation`; duration within 1e-6 s of 29/30 = 0.9666666667 (the last keyframe, frame 29).
- P3. Track count 8: `Hips.position`, `Hips.quaternion`, `Spine.position`, `Spine.quaternion`, `Neck.position`, `Neck.quaternion`, `Head.position`, `Head.quaternion`, in that order.
- P4. Sampling: at t = 0, 7/30, 7.5/30, 15/30 and 28.5/30 s, for each of the four joints, every component of `bone.quaternion` after `mixer.setTime(t)` is within 1e-6 of the BVH-derived value (sign-aligned), and the position difference is below 1e-6 (cm). The mid-frame time 7.5/30 and 28.5/30 check interpolation; the frame times check the keyframes.

Amendments made after the first probe run, before any recorded run (the first run is reported in "Observation, after running"):

- A1. The sample time 29/30 s was replaced by 28.5/30 s. 29/30 s lies 9.7e-9 s past the clip's last keyframe (29 × 0.0333333333 s = 0.9666666657 s), so `AnimationMixer` wrapped (`LoopRepeat`) and returned the rest pose. The predeclared fixture is unchanged; the sample is moved to an interior interval, still covering the final keyframe segment.
- A3. The first record pass's contact sheet showed frame 0029 as the rest pose (its hash equalled frame 0000's). This is the same wrap as A1: t = 29/30 s is past the clip end, so `LoopRepeat` returned the rest pose. A first fix, `LoopOnce` with `clampWhenFinished`, held the last pose but made the output depend on seek order (`shuffled_matches_sequential` false): `LoopOnce` keeps paused and loop state that `setTime` does not reset. That attempt was discarded, nothing was recorded from it. The final scene keeps `LoopRepeat` and clamps the sample time to `clip.duration - 1e-6` s, which is 1 µs inside the last keyframe. At the final frame this moves the pose by at most about 2e-6 rad from the last keyframe; the predeclared probe times (up to 28.5/30 s) are not affected.
- A2. The quaternion metric changed from `Quaternion.angleTo` (2·acos of the dot product) to the sign-aligned maximum component difference. The acos form is ill-conditioned near identity: a 1e-8 component difference reads as about 3e-4 rad. The threshold stays 1e-6.

Run checks (`run.sh`, diffed against `expected/` where applicable):

- R1. Capture: 30 frames, 1280x720.
- R2. `shuffled_matches_sequential` is true (the determinism check in `@vcr/capture`).
- R3. Frame hashes at frames 0000, 0007, 0015 and 0029: at least two distinct values.
- R4. Distinct poses differ: frame 0000 differs from frame 0015, and frame 0015 differs from frame 0029 (SHA-256 of the PNG).
- R5. Alpha, frame 0015: corner (0,0) alpha is 0 and the alpha maximum is 1 (some opaque pixels, not an empty frame).
- R6. Diff of `output/summary.json` and `output/probe.json` against `expected/` (after `--record`), which pins the probe readings and the hashes for this host.

Contact sheet: frames 0000, 0005, 0010, 0015, 0020 and 0029 at 50% scale, built by hand with the ImageMagick recipe in the evidence template. Inspect before recording: a blank frame, a clipped figure, or a figure that does not change across frames is `fail` whatever the hashes say.

Expected failure modes and stop conditions:

- `BVHLoader` logs a parse error (missing `HIERARCHY` or `MOTION`): `fail`; the fixture is re-checked, not the predictions.
- The page never reaches `window.__scene`: capture throws; `fail` with the error.
- A probe check fails (P1 to P4): `fail` if the predicted names or numbers are wrong; `partial` only if P1 to P3 hold and only P4 interpolation at mid-frame fails, with the scope saying so.
- Any run check fails: `partial` if the picture is right and only a hash expectation differs; otherwise `fail`.
- Expected `expected/` files not written before the first `--record`: nothing is recorded from a failing run except for the diagnostic `output/` files.

Reproduction: `run.sh`; inspect `output/contact.png`, `output/probe.json` and `output/summary.json`.

Contact-sheet recipe (run by hand):

```text
cd output/frames && magick \( frame-0000.png frame-0005.png frame-0010.png +append +repage \) \( frame-0015.png frame-0020.png frame-0029.png +append +repage \) -append +repage -background '#808080' -flatten -resize 50% ../contact.png
```

## Observation, after running

Date and executor: 2026-11-24, Claude agent in worktree `agent-a8d5682fbabbc93ee`, branch `worktree-agent-a8d5682fbabbc93ee` off `main`.

Versions and environment:
- three 0.186.1 (exact pin in `package.json`, the repo's pinned Three.js; its BVHLoader and AnimationMixer carry no `Math.random`, `performance.now` or `Date.now`).
- Playwright 1.64.1 (via `@vcr/capture`); Chromium 156.0.8078.4 (the revision Playwright 1.64.1 pins in its `browsers.json`; the capture report does not record the binary version).
- Node v22.19.0, tsx 4.23.15. macOS Darwin 25.6.0, Apple Silicon. Hostname `Conors-MacBook-Pro-2.local`. WebGL backend not queried.
- Licence: three MIT (`node_modules/.pnpm/three@0.186.1/node_modules/three/LICENSE`, read 2026-11-24). No motion data was downloaded.

Commands and history:
1. First `run.sh --record`: the probe threw at the quaternion check. Two causes, both in my probe or scene and not in the loader: (a) `angleTo` (2·acos) reads float32 storage noise near identity as about 3e-4 rad, and (b) the predeclared sample 29/30 s lies 9.7e-9 s past the last keyframe, so the mixer wrapped to the rest pose. Amendments A1 and A2 were made before any recording.
2. Second `run.sh --record`: the probe passed, but the contact sheet showed frame 0029 as the rest pose, and its hash equalled frame 0000's. Amendment A3 tried `LoopOnce` with `clampWhenFinished`. That made `shuffled_matches_sequential` false, so it was discarded and nothing was recorded from it.
3. Final scene: `LoopRepeat` with the sample time clamped to `clip.duration - 1e-6`. `run.sh --record` passed all five run checks. `run.sh` then printed `bvh-mocap-playback: OK (18.19 fps)`.
4. Typecheck: the first version imported `three` in `probe.ts`, which has no declaration files (`TS7016`). The probe now uses its own vector and quaternion code, with no `@types/three` installed. `pnpm typecheck` passes.

Amendments (predeclared items changed after the first run, all recorded here):
- A1. Sample time 29/30 s replaced by 28.5/30 s (interior of the last keyframe segment). The clip end is 29 × 0.0333333333 s = 0.9666666657 s, so 29/30 s wraps.
- A2. Quaternion metric changed from `angleTo` to the sign-aligned maximum component difference. Threshold unchanged at 1e-6.
- A3. Scene wraps are avoided by clamping the sample time to `clip.duration - 1e-6` under `LoopRepeat`. The final frame moves at most about 2e-6 rad from the last keyframe. The frame-0029 hash changed; frames 0000, 0007 and 0015 hashes did not (checked against the earlier record).
- Probe-side expected values were rewritten from `three` maths to local code (point 4). This changes how the expected values are computed, not the predeclared numbers.

Measured results (final record, `expected/`):
- Skeleton bones, in order: `Hips, Spine, Neck, Head, ENDSITE` (predicted; `ENDSITE` is the bone `BVHLoader` builds for the End Site node and it has no track).
- Clip: name `animation`, duration 0.966667 s (29 × frame time). Eight tracks in the predicted order (`<joint>.position`, `<joint>.quaternion`).
- Samples at 0, 7/30, 7.5/30, 15/30 and 28.5/30 s, four joints each. Worst sign-aligned quaternion component difference from the BVH-interpolated value: 2.7e-8 (threshold 1e-6). Worst position difference: 1.6e-7 cm (threshold 1e-6). The gap is Float32 keyframe storage in the loader.
- Capture: 30 frames at 1280x720, `shuffled_matches_sequential` true, 18.19 fps on the final run.
- Frame SHA-256 (final): frame 0000 `05404ffc…`, 0007 `4515437d…`, 0015 `5550f113…`, 0029 `b0a403c4…`. Frame 0000 differs from 0015, and 0015 from 0029. At least two distinct hashes.
- Frame 0015 alpha: corner (0,0) alpha 0, alpha maximum 1.

Contact sheet (`output/contact.png`, built by hand with the recipe above; frames 0000, 0005, 0010 top row, 0015, 0020, 0029 bottom row): five green joint spheres form a chain on a transparent background. The chain is upright at frame 0000, then bends progressively: the spine and neck lean right, and the head tilts. Frame 0029 shows the final, more compact bend. The figure sits centred and is not clipped; it occupies roughly a third of the frame height. The 1 px bone lines drawn by `SkeletonHelper` are very faint at this scale, so the visible shapes are the spheres. Result: the frames show the library's chain playing through the mixer, not a blank or unposed figure.

Result: pass on the predeclared checks, with amendments A1 to A3 recorded above. The scope in `catalog/tools/bvh-mocap.json` is the evidence.

What this establishes:
- `BVHLoader` (three 0.186.1) parses the hand-written 4-joint, 30-frame BVH into the predeclared skeleton and an `AnimationClip` with the predeclared duration and eight tracks.
- Sampling `mixer.setTime(t)` at the predeclared times gives joint quaternions and positions matching the file's frame values, interpolated as the clip interpolates (slerp, lerp), to within 1e-6 in this environment.
- Captured frames are deterministic on this host (shuffled equals sequential), and distinct poses give distinct frames.

What this does not establish:
- Any real mocap data, CMU or otherwise, and any licence for it. The fixture is hand-written.
- Motion naturalness, rig correctness, IK, retargeting, blending, or BVH variants and channel orders beyond this file.
- The behaviour of `LoopRepeat` beyond the clip end: the scene avoids sampling past it, and the wrap to the rest pose is recorded as a finding (A1 and A3), not a claim.
- Other OS, GPUs, browsers, or any other tool routed through the skeleton (`three-vrm`, `mpfb`).
- Cross-host hash stability: hashes are recorded for this host only.

Reviewer, decision, follow-up and invalidation: recorded in the catalogue entry. Revisit if three changes `BVHLoader` (its keyframe build) or `AnimationAction` time handling, if the scene's sample clamp changes, or if the Chromium build changes the frame hashes.
