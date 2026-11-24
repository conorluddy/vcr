---
name: bvh-mocap
description: Play BVH motion-capture files in a Three.js scene with BVHLoader and AnimationMixer.setTime(t), seek-driven for frame-by-frame capture. Load when a figure or skeleton must follow a BVH clip; the data and its licence are the person's to supply.
---

# bvh-mocap

`BVHLoader` (`three/addons/loaders/BVHLoader.js`) parses a BVH file into a skeleton and an `AnimationClip`. In VCR it is an add-on to [three-js](../three-js/SKILL.md): same scene contract, same clock rules (no render loop, no accumulated deltas). Motion judgement is the motion pillar's: see MOTION-PROC-001 (review in motion) and MOTION-FPS-003 (thin moving lines such as bone helpers), `references/motion-director/`.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Drive a skeleton or figure from BVH clips in a seek-driven Three.js scene.
- The loader supplies parsing, not motion. No real mocap data was used here: the only file is a hand-written 4-joint BVH. Licences of mocap libraries (CMU, for one, states research-only use) are the user's to check.
- Not for rigged or authored humans (use `mpfb`) or VRM avatars (use [three-vrm](../three-vrm/SKILL.md)). Retargeting, IK and blending are untested.
- Licence of Three.js: MIT.

## Capability map
Discovery, not coverage. Tested means the fixture exercised it.
- **BVHLoader** (`load`, `parse`, `loadAsync`; result `{ skeleton, clip }`) - [docs](https://threejs.org/docs/#examples/en/loaders/BVHLoader). Tested: `loadAsync` of one hand-written file, default `animateBonePositions` and `animateBoneRotations`. Untested: other channel orders, `Frame Time` variants, real clips.
- **AnimationClip and KeyframeTracks** - [docs](https://threejs.org/docs/#api/en/animation/AnimationClip). Tested: names, duration and the 8 tracks.
- **AnimationMixer and AnimationAction** - [docs](https://threejs.org/docs/#api/en/animation/AnimationMixer). Tested: `setTime(t)` under the default `LoopRepeat`. Untested: cross-fade, weights, time scale, other loop modes beyond the finding below.
- **SkeletonHelper, SkinnedMesh binding, retargeting** - documented, untested.

## Install and doctor
```text
cd examples/bvh-mocap-playback && pnpm add --save-exact three@0.186.1
node -e "console.log(require('three/package.json').version)"
```
`vcr doctor` reports capture readiness, not this loader. Validated with three 0.186.1, Playwright 1.64.1, Chromium 156 on macOS arm64 only.

## Smoke test
```text
examples/bvh-mocap-playback/run.sh
# expect: bvh-mocap-playback: OK (<fps> fps)   # fps varies per run (18.19 recorded)
```
It asserts: 30 frames at 1280x720, shuffled order equals sequential, frame 0015 corner alpha 0 with opaque pixels, distinct poses differ, probe output matches `expected/`.

## Scene contract
```js
import * as THREE from "three";
import { BVHLoader } from "three/addons/loaders/BVHLoader.js";
const bvh = await new BVHLoader().loadAsync("./fixture/chain.bvh");   // load before setting __scene
const hips = bvh.skeleton.bones[0];
scene.add(hips);                                    // bones must be in the scene to render or be helped
const mixer = new THREE.AnimationMixer(hips);
mixer.clipAction(bvh.clip).play();
const LAST = bvh.clip.duration - 1e-6;
const renderAt = (t) => { mixer.setTime(Math.min(t, LAST)); renderer.render(scene, camera); };
window.__scene = { duration: 1, seek: (t) => requestAnimationFrame(() => renderAt(t)) };
```
`setTime(t)` zeroes the mixer and action times, then updates by `t`, so every call is absolute. Never call `mixer.update(delta)` or use a `Clock`.

## What the fixture showed
- Skeleton bone names, in order: `Hips, Spine, Neck, Head, ENDSITE`. The loader adds the extra `ENDSITE` bone for the file's End Site node; it has no track. Expect one more bone than joints.
- Clip name `animation`; eight tracks, `<joint>.position` and `<joint>.quaternion` for each of the four joints.
- **Duration is (frames - 1) x frame time**, here 29 x 0.0333333333 = 0.966667 s, not frames x frame time. The last frame sits at `duration`.
- Sampling at five times (keyframes and mid-frame) matched the BVH interpolated by slerp and lerp: worst quaternion component difference 2.7e-8, worst position difference 1.6e-7 cm, against a 1e-6 limit. The gap is Float32 keyframe storage.
- Shuffled capture equalled sequential on this host; alpha held.

## Seeking at and past the end
- A time at or beyond `clip.duration` wraps under `LoopRepeat` and returns the rest pose. In the fixture, the frame time 29/30 s lies 9.7e-9 s past the end (29 x 0.0333333333), so the final frame showed the rest pose and its hash equalled frame 0000.
- `LoopOnce` with `clampWhenFinished` holds the last pose but kept paused and loop state that `setTime` does not reset, so output depended on seek order (shuffled did not equal sequential). Discarded.
- Fix used: keep `LoopRepeat` and clamp `t` to `duration - 1e-6` (at most about 2e-6 rad from the last keyframe). Sample earlier times unchanged.

## Comparing rotations
- `q` and `-q` are the same rotation. Align signs before comparing: flip one if the dot product is negative, then take the maximum component difference.
- `Quaternion.angleTo` (2 x acos of the dot) is ill-conditioned near identity: a 1e-8 component difference read as about 3e-4 rad. Compare components instead.

## Troubleshooting
- Last frame looks like the rest pose: the seek time reached `clip.duration`; clamp as above.
- Output differs by seek order: a loop mode other than `LoopRepeat`, or `mixer.update` somewhere; use `setTime` only.
- Probe fails near identity rotations: metric, not loader; see Comparing rotations.
- Module import blocked: opened with file://; serve over HTTP via the capture harness.

## Official docs
https://threejs.org/docs/#examples/en/loaders/BVHLoader · https://threejs.org/docs/#api/en/animation/AnimationMixer · https://threejs.org/manual/#en/animation-system
