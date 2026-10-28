---
name: three-js
description: Browser 3D scenes with Three.js rendered once per seek with alpha, for product shots, hero objects, camera moves and shader-driven visuals captured frame by frame. Covers scene and camera setup, loaders, materials and lights, postprocessing and TSL.
---

# Three.js

The browser 3D renderer for VCR. A scene is a pure function of time: `seek(t)` sets every animated value from t and renders once. No render loop.

## Use cases and limits
- Product reveals, floating objects, camera orbits, text in 3D, shader effects, particle systems that can be evaluated at any t.
- Over Blender when the look is real-time and the turnaround matters; over Babylon.js for the larger ecosystem and the pmndrs tooling.
- Not for path-traced quality, physics that must be simulated step by step (use fixed-step replay, PRD L4-04), or anything that needs the Blender compositor.
- Licence MIT.

## Install and doctor
```text
pnpm add three
node -e "console.log(require('three/package.json').version)"
```
Validated with Chromium 156 (ANGLE on Apple Silicon) via `examples/three-capture`.

## Smoke test
```text
examples/three-capture/run.sh
# expect: three-capture: OK, alpha min 0 max 1, shuffled_matches_sequential true
```

## Scene and camera
```js
import * as THREE from "./node_modules/three/build/three.module.js";   // served over HTTP by the harness; file:// blocks modules
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(w, h); renderer.setClearColor(0x000000, 0);
const renderAt = (t) => { mesh.rotation.y = t * 1.3; renderer.render(scene, camera); };
window.__scene = { duration: 3, seek: (t) => requestAnimationFrame(() => renderAt(t)) };
```
- `alpha: true` plus a zero-alpha clear colour gives transparent frames; `preserveDrawingBuffer` keeps them until the screenshot.
- `setPixelRatio(1)`: output pixels equal viewport pixels.
- Camera moves are functions of t too: `camera.position.setFromSphericalCoords(r, phi, theta(t)); camera.lookAt(target)`.
- Schedule the render from `seek` on `requestAnimationFrame`; a synchronous render inside the harness's evaluate blocks.

## Loaders
- `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader.js`; `DRACOLoader` needs the decoder path served too. Prepare assets with glTF Transform (catalogued) rather than at load time.
- Load everything before setting `window.__scene`; the harness waits for it, so loading time never leaks into frames.
- Textures: `texture.colorSpace = THREE.SRGBColorSpace` for colour maps; leave data maps linear. Record the choice in the render manifest.

## Materials and lights
- `MeshStandardMaterial` with one `DirectionalLight` plus `AmbientLight` is the dependable baseline; `MeshPhysicalMaterial` adds clearcoat and transmission at a cost.
- Environment lighting: `PMREMGenerator` from an equirect HDR gives product-shot reflections; generate once in setup.
- Shadows need `renderer.shadowMap.enabled`, `light.castShadow`, and `mesh.castShadow`/`receiveShadow`; they are deterministic per frame.

## Postprocessing
- The `postprocessing` package (catalogued) over Three's bundled EffectComposer: fewer passes, better bloom.
- The composer replaces `renderer.render`: call `composer.render()` inside `renderAt`. Effects with temporal accumulation (TAA, motion blur) are not seek-safe; declare them per PRD L4-05 or avoid them.

## TSL
- Three Shading Language builds node materials in JavaScript for the WebGPU renderer, with a WebGL fallback. Pin the Three version: the API moves between minors.
- Time inside a TSL material must come from a uniform you set from t, never from the built-in `time` node.

## Capture
`@vcr/capture` with `sceneFile`, screenshot mode. 1280x720 runs at roughly 12 frames per second including the determinism re-run; 4K will want a frame cache.

## Troubleshooting
- CORS error on the module import: the page was opened with file://; use `sceneFile` so the harness serves it.
- Black frames: clear colour alpha is 1, or the material needs a light.
- Frames differ between orders: an animation mixer or clock is advancing; drive `mixer.setTime(t)` from t.

## Official docs
https://threejs.org/docs/ · https://threejs.org/manual/ · https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language
