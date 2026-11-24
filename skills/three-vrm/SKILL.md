---
name: three-vrm
description: Load VRM 1.0 avatars into a Three.js scene with @pixiv/three-vrm, read the model's own licence, and pose humanoid bones and expressions as pure functions of t. Load for character figures in a seek-driven capture; spring bones stay disabled.
---

# three-vrm

`@pixiv/three-vrm` loads a VRM avatar through Three.js `GLTFLoader` and exposes its meta, humanoid bones and expressions. In VCR it is an add-on to [three-js](../three-js/SKILL.md): same scene contract, same clock rules. Pose and expression are rebuilt from t on every `seek`.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A humanoid figure in a browser-rendered scene, with a bone or an expression driven by a closed-form function of t (MOTION-SPR-001: seek the same t twice, out of order, same result).
- Not for authoring or editing models (use Blender), nor for BVH clips (`bvh-mocap`).
- Tested: one VRM 1.0 sample, right arm and `blink`, spring bones disabled. Untested: VRM 0.x, VRMA animation, lookAt, lip-sync visemes, MToon tuning, other models, other GPUs.
- Licence of the library MIT. **Each model carries its own licence**, which the library licence does not cover.

## Licence check before use
Read the model's meta before it appears in any deliverable:
```js
const { name, authors, licenseUrl, allowRedistribution, commercialUsage, modification } = vrm.meta;   // VRM 1.0 field names
```
- Check `licenseUrl`, `allowRedistribution` and `commercialUsage`; follow the licence page. The fixture read name, `licenseUrl` and `allowRedistribution` and asserted them; the other fields were recorded by hand for the sample only.
- The sample (pixiv, commit `5a3242b66124386c32b085c6693d9059040e72e5`) is downloaded by `run.sh` at run time, sha256-checked and never committed. Do the same with any model: fetch, verify the hash, keep it out of git, record the licence in the render manifest.

## Capability map
- **Loading** — `VRMLoaderPlugin` registered on `GLTFLoader`; the result is `gltf.userData.vrm`. [README](https://github.com/pixiv/three-vrm#readme). Tested with a VRM 1.0 file.
- **Meta** — `vrm.meta` (VRM 1.0 and 0.x shapes differ). Tested: 1.0 read.
- **Humanoid** — `vrm.humanoid`, normalized and raw bone nodes. Tested: `rightUpperArm` (normalized), `rightHand` (raw, read only).
- **Expressions** — `vrm.expressionManager` (`blink`, visemes, emotions). Tested: `blink`; visemes untested.
- **Spring bones** — `vrm.springBoneManager`, hair and cloth physics. Present on the model; `update` never called in the fixture.
- **Node constraints** — `vrm.nodeConstraintManager`; updated in the fixture (the sample is a constraint sample).
- **lookAt, first-person, MToon materials, VRMA** — packages `@pixiv/three-vrm-*` and `three-vrm-animation`; documented, untested. Discovery only, not validated.
- Packages: [three-vrm repository](https://github.com/pixiv/three-vrm).

## Install and doctor
```text
pnpm add @pixiv/three-vrm@3.6.0 three@0.186.1
vcr doctor
```
Doctor reports whether capture works; it does not say the package is installed here. Validated on macOS arm64 with Chromium 156.0.8078.4, three 0.186.1.

## Smoke test
```text
examples/three-vrm-capture/run.sh
# expect: three-vrm-capture: OK (<fps> fps)   # recorded 11.91 fps; fps varies, checks and hashes do not
```
Needs network once (model download). It asserts 90 frames at 1280x720, shuffled equals sequential, transparent corner with opaque pixels, and diffs probe and hashes against `expected/`.

## Scene contract
Import map instead of a bundler; load before exposing `window.__scene`:
```js
loader.register((parser) => new VRMLoaderPlugin(parser));
const vrm = (await loader.loadAsync(MODEL_URL)).userData.vrm;
if (!vrm) throw new Error("not a VRM; check the file");
scene.add(vrm.scene);
const arm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
const applyPoseAt = (t) => {
  arm.quaternion.setFromAxisAngle(AXIS_Z, armAngleAt(t));          // closed-form in t
  vrm.expressionManager.setValue("blink", blinkWeightAt(t));       // closed-form in t
  vrm.humanoid.update(); vrm.expressionManager.update(); vrm.nodeConstraintManager?.update();
};
window.__scene = { duration: 3, seek: (t) => requestAnimationFrame(() => { applyPoseAt(t); renderer.render(scene, camera); }) };
```
- Set every driven value absolutely each call; never step or accumulate (MOTION-SPR-001). Smoothstep arm 0 to 1.0 rad over 1 s and a triangular blink were used.
- Call the updates in the order `VRM.update` uses, minus spring bones. Do not call `vrm.update(delta)`: it advances spring bones with a delta.
- Normalized bones are the posing surface; raw bones are for reading world positions.

## Spring bones
- Disabled in the fixture: hair and clothing keep the loaded pose.
- Enabling is untested. If needed, advance from t deterministically, for example replay fixed steps from 0 to t (MOTION-SPR-001), and verify with `--verify` before trusting it.

## Motion notes
- A blink changed about 82 pixels against about 5449 for the arm raise at this framing: it is visible but small, so judge it at delivery size and at the scene's rate (MOTION-FPS-003 for thin moving features).
- Keep one lead mover in a beat (MOTION-CHOR-003); a figure plus camera plus effects compete.

## Troubleshooting
- Feet clipped: the first camera (3.4 m) cut them off; the fixture uses `(0, 0.82, 3.92)` looking at `(0, 0.82, 0)` at fov 30 for a roughly 1.6 m figure.
- sha256 mismatch from `run.sh`: the file or commit changed; delete `output/vrm/` and re-check the pin.
- `vrm` undefined: the file is not VRM, or the plugin was not registered before `loadAsync`.
- Module errors: serve over HTTP (the capture harness does), not `file://`.
- Frames differing between orders: something advances over time (spring bones, mixer, clock).

## Official docs
https://github.com/pixiv/three-vrm · https://vrm.dev/en/ · https://vrm.dev/licenses/1.0/ · https://threejs.org/docs/
