---
name: three-globe
description: Geographic globe layers (points, arcs and more) as a Three.js object, rotated from seek time and captured frame by frame. Load when a globe is one component in a Three.js scene; read the visibility warning first.
---

# three-globe

A Three.js `Object3D` that draws geographic data layers on a sphere. It is a scene component, not a renderer: build the scene, camera and renderer as in the `three-js` guide and follow its clock rules (`seek(t)` sets every value from t and renders once, no render loop, screenshot capture). `vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- A rotating globe with points and arcs placed by latitude and longitude, inside a larger Three.js composition.
- Evidence is PARTIAL: one seeked globe, 5 points and 1 arc, 1280x720, Chromium 156 on SwiftShader (software WebGL, not the GPU), macOS arm64. Shuffled capture equals sequential; 90 of 90 frames distinct; background transparent (corner alpha 0, globe opaque).
- Failed check: the marks were barely visible. Arc about 2 px wide, points about 5 px, so the predeclared presence count (150 red/orange pixels in the central crop) saw 32 to 38. Rendering worked; the marks were too small for video.
- Not tested: network textures, tiles, polygons, heatmaps, paths, labels, atmosphere, `animateIn`, layer transitions, arc dash animation, camera moves, WebGPU, hardware GPU, geographic accuracy of positions.
- For 2D large-scale geospatial data use `deck-gl`; for tiled interactive basemaps use MapLibre (not catalogued).

## Data visualisation
A globe is a map: apply the data-visualisation pillar (`vcr rules info <ID>`, `vcr refs section data-visualisation 5`). Relevant: `DATA-PROJECTION-BOUNDARY`, `DATA-MAP-CAMERA` (rotation and camera moves), `DATA-NO-3D` (a globe distorts area and hides a hemisphere; say why a globe suits the claim), `DATA-AREA-SQRT`, `DATA-MARK-COUNT`, `DATA-DIRECT-LABEL`, `DATA-COLOUR-NOT-SOLE`, `DATA-SOURCE-LINE`, `DATA-PROVENANCE`. Following ADR 0006, no threshold is given here.

## Capability map
Discovery only; README: https://github.com/vasturiano/three-globe
- **Tested**: `pointsData` (lat, lng, altitude, radius, colour), `arcsData` (start/end, altitude, stroke, colour), `globeMaterial`, `showAtmosphere(false)`, `showGraticules(false)`, constructor options `animateIn: false`, `waitForGlobeReady: false`, transition durations 0.
- **Documented, untested**: `globeImageUrl` and bump/texture maps (network or local images), `polygonsData`, `hexBinPointsData`, `heatmapsData`, `pathsData`, `labelsData`, `tilesData`, `ringsData`, `htmlElementsData`, `objectsData`, custom layers, `pauseAnimation`/`resumeAnimation`.
- Map and texture discoverability is separate from tested behaviour: no network texture, tile or GeoJSON was loaded. Here the globe is one flat colour.

## Install and doctor
```text
npm install three-globe three
node -e "require('three-globe')"
```
Versions that ran: three-globe 2.45.6 (MIT), three 0.186.1 (peer `>=0.154`). `vcr doctor` reports capture readiness; never assume the package is installed.

## Smoke test
```text
vcr example create three-globe-capture
vcr setup capture --yes
examples/three-globe-capture/run.sh
# expect: 90 frames 1280x720, shuffled matches sequential true, 90 distinct hashes, frame 0030 alpha 0 1,
# then the mark-visibility check FAILS (sample: 32, 32, 38 pixels against 150) and run.sh exits 1.
```
The exit 1 is the recorded result. The rest of the checks pass.

## Scene contract
Same as `three-js`: everything a pure function of t.
```js
import * as THREE from "./node_modules/three/build/three.module.js";
window.THREE = THREE;                       // the UMD build reads the global THREE
// load ./node_modules/three-globe/dist/three-globe.min.js with a script tag and await it, before __scene
const globe = new window.ThreeGlobe({ animateIn: false, waitForGlobeReady: false })
  .showAtmosphere(false).globeMaterial(new THREE.MeshPhongMaterial({ color: 0x1b2f4a }))
  .pointsData(points).pointLat("lat").pointLng("lng").pointAltitude(0.03).pointRadius(0.8)
  .pointsTransitionDuration(0)
  .arcsData([arc]).arcAltitude(0.3).arcStroke(0.6).arcsTransitionDuration(0);
scene.add(globe);
window.__scene = { duration: 3, seek: (t) => requestAnimationFrame(() => { globe.rotation.y = t * 0.25; renderer.render(scene, camera); }) };
```
Renderer: `alpha: true`, `preserveDrawingBuffer: true`, `setPixelRatio(1)`, clear alpha 0 (see `three-js`). Camera at z=340, FOV 40, globe radius 100 (library default).

## Clock rules
- Turn off the library's own clocks: `animateIn: false`, transition durations 0, no arc dash animation. These read wall time (`performance.now`, `Date.now`, ticker); the fixture kept them off, so they are untested and unsafe by default.
- Rotate the globe object from t (`rotation.y`), not via the library's controls or auto-rotate.
- Polygon layers use `Math.random` for ids in 2.45.6; not reached here, so treat polygon scenes as nondeterministic until proven.

## Size marks for the video, then check
- The defaults and the values tried (`pointRadius 0.8`, `arcStroke 0.6` at radius 100, camera z=340, 1280x720) gave ~5 px points and ~2 px arc: too small to read after encode. Choose `pointRadius` and `arcStroke` for the delivered resolution and viewing size, in pixels, not in globe units.
- Do not tune after the fact to pass a check. Predeclare a visibility check sized to the marks (per-point projected position and pixel footprint, or a justified count), run it, and look at frames: render a contact sheet and open frames at several rotations.
- Points on the far hemisphere are hidden by design; make sure the data the claim rests on is on the visible side at its moment (`DATA-MAP-CAMERA`).
- Colour presence counts do not say which marks are visible or where; they are a weak check.

## Troubleshooting
- Marks barely visible, presence check fails: enlarge `pointRadius`/`arcStroke` or move the camera closer; re-predeclare the check.
- `ThreeGlobe is undefined` or a THREE mismatch: set `window.THREE` before loading the UMD, and load only one copy of three.
- Black or missing globe: add lights (the globe material is Phong), clear alpha 1, or the script has not loaded before `__scene` is set.
- Results differ on a GPU: this evidence is SwiftShader only; re-check colour and antialiasing on other renderers.

## Official docs
https://github.com/vasturiano/three-globe · https://github.com/vasturiano/three-globe/releases · https://threejs.org/docs/
