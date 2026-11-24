---
name: mannequin-js
description: Pose a procedural mannequin-js human figure in a Three.js scene from joint angles set as pure functions of t, drawn with your own alpha renderer. Load for a lightweight stand-in figure in a seek-driven capture; the evidence is partial and the library is GPL-3.0.
---

# mannequin-js

`mannequin-js` builds an articulated human figure from primitives and exposes joint angles (`torso.bend`, `r_arm.raise`, `l_knee.bend`). In VCR it is an add-on to [three-js](../three-js/SKILL.md): same scene contract, same clock rules. Pose is rebuilt from t on every `seek`.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A simple posed human figure with no model file, joints driven by closed-form functions of t (MOTION-SPR-001: seek the same t twice, out of order, same result).
- Versus [three-vrm](../three-vrm/SKILL.md): pick mannequin-js for a generic, asset-free, unskinned stand-in; pick three-vrm for a real character model, expressions and a per-model licence. Neither authors models (Blender does).
- Tested (partial): male figure, height 1, three joints, 90 frames at 1280x720, macOS arm64, Chromium 156.0.8078.4, mannequin-js 5.2.3, three 0.186.1. Untested: IK, balance, collisions, `posture` strings and `blend()`, labels, female or child bodies, fingers and head, the posture editor, `createStage`, other browsers or GPUs.
- **Licence: the library is GPL-3.0** (three is MIT). The fixture loads it from `node_modules` and copies none of it. Flag for review before redistributing any code or bundle that includes it; rendered frames are a separate question the evidence does not answer.

## Capability map
Discovery only, not validation. Reference: [library site](https://boytchev.github.io/mannequin.js/), [repository](https://github.com/boytchev/mannequin.js).
- **Figure** (`bodies/Mannequin.js`): `new Mannequin(feminine, height)`. Tested: `(false, 1)`, `stepOnGround()` once at setup.
- **Joints**: `torso`, `r_arm`, `l_knee` and the rest of the body tree. Tested: `torso.bend`, `r_arm.raise`, `l_knee.bend`, `r_wrist` world position via `getWorldPosition`.
- **Scene module** (`scene.js`): shared `scene`, `camera`, `renderer`, own loop and clock. Tested: reused scene and camera, loop stopped, renderer discarded.
- **Posture, blend, labels, stage, controls**: documented, untested.

## Install and doctor
```text
pnpm add mannequin-js@5.2.3 three@0.186.1
vcr doctor
```
Doctor reports whether capture works; it does not say the packages are installed here.

## Smoke test
```text
examples/mannequin-js-pose-capture/run.sh
# expect: mannequin-js-pose-capture: OK (<fps> fps)   # fps varies; checks and hashes do not
```
Status today: the example is `partial`. Its wrist-displacement check failed (see Figure units), so `run.sh --record` stops there, `expected/` is empty and the plain run does not print OK until the threshold is replaced by a new predeclared check. The other nine checks passed: 90 frames, shuffled equals sequential, four predeclared frames distinct, knee-only change smaller than torso-and-arm change, corner alpha 0, reruns byte-identical.

## Scene contract
Import map to `src/`, no bundler (the package has no browser build and its `main` file is absent):
```html
<script type="importmap">{ "imports": {
  "three": "./node_modules/three/build/three.module.js",
  "mannequin-js/": "./node_modules/mannequin-js/src/" } }</script>
```
```js
import * as THREE from "three";
import { renderer as libraryRenderer, scene, camera } from "mannequin-js/scene.js";
import { Mannequin } from "mannequin-js/bodies/Mannequin.js";

libraryRenderer.setAnimationLoop(null);   // library starts its own loop and Clock
libraryRenderer.domElement.remove(); libraryRenderer.dispose();
scene.background = null;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 0);

const figure = new Mannequin(false, 1); figure.stepOnGround();
const applyPoseAt = (t) => {
  figure.torso.bend = 30 * smoothstep(t / 1.0);            // degrees, absolute
  figure.r_arm.raise = -5 + 90 * smoothstep(t / 1.5);
  figure.l_knee.bend = 50 * smoothstep((t - 1.5) / 1.0);
};
window.__scene = { duration: 3, seek: (t) => requestAnimationFrame(() => { applyPoseAt(t); renderer.render(scene, camera); }) };
```
- Stop the library loop and never read its clock; frames come only from `seek(t)`. Set every angle absolutely each call, never accumulate (MOTION-SPR-001). The library default posture (for example torso bend 2) is overwritten at t = 0.
- The library renderer is opaque. Draw its `scene` and `camera` with your own alpha `WebGLRenderer`, background null, clear alpha 0.
- Angles are degrees. Set `renderer.outputColorSpace = THREE.SRGBColorSpace`.

## Figure units
Library units are about 1 per figure height: the male height-1 figure measured 1.0101 tall. Scale every distance threshold to it: the right wrist moved 0.404 units (0.40 of figure height) from t = 0 to 1.5 s, which failed the fixture's predeclared 1.0, a figure-sized threshold the fixture mis-set, not a defect in the figure. State thresholds as fractions of figure height. A corrected threshold is untested until a new fixture predeclares it.

## Motion notes
- The knee change at t = 1.5 to 2.5 s measured about 1392 pixels against about 4708 for torso and arm: visible but small; judge at delivery size (MOTION-FPS-003 for thin moving features).
- Arm raise reads as sideways abduction, not a forward raise; the foot lifts with the knee. Check on the contact sheet.
- Keep one lead mover per beat (MOTION-CHOR-003).

## Troubleshooting
- No defect seen in the fixture: figure complete, unclipped, about 80 per cent of frame height with the fixture camera.
- Opaque background: you used the library renderer; use your own alpha renderer.
- Module not found for `mannequin-js`: map `mannequin-js/` to `src/` with a trailing slash; the bare package `main` is missing.
- Frames differing between orders: the library loop or clock is still running.
- Module errors: serve over HTTP (the capture harness does), not `file://`.

## Official docs
https://boytchev.github.io/mannequin.js/ · https://github.com/boytchev/mannequin.js · https://threejs.org/docs/
