# heerich voxel scene to SVG

Status: validated on macOS arm64, 2026-11-24 (heerich 0.21.0, Node v22.19.0). Plan written before the first run; see the observation below.

## Intent and scope

- Tool: heerich (`heerich` npm package), pinned to 0.21.0 (npm `latest` on 2026-11-24, MIT; the package's `LICENSE` file is in `node_modules/heerich/`).
- VCR job and claim: in Node, heerich builds a small predeclared voxel scene (a 3x3x3 cube with one corner voxel removed by a boolean subtract) and renders it to SVG with an oblique camera. The SVG has the predeclared number of visible polygons, and a rerun is byte-identical.
- Exclusions: browsers and the UMD build; the `GPURenderer`; perspective and orthographic cameras; `occlusion` and `resolveOcclusion` (the default painter's-algorithm output is what is tested); `content`, decals, hatching, slopes, scaling and clipping; the interactive DOM (`updateSVG`); any claim that the rendering is visually correct for a particular design. Visual inspection is a sanity check only, not a pass criterion.
- Documentation: https://github.com/meodai/heerich (README and `dist/heerich.d.ts`, read from the installed 0.21.0 package on 2026-11-24); homepage https://meodai.github.io/heerich/.
- Environment: macOS arm64 (Darwin 25.6.0), Node v22.19.0, no GPU, no network use during the run.
- Input: no media. The scene is built in code in `render.ts`; no external assets, no rights issues.
- Dependencies and side effects: `heerich@0.21.0` (exact) and `tsx` in this example's `package.json`, installed by `pnpm install` at the workspace root. The package ships zero runtime dependencies. Writes only `output/` (ignored) and `expected/scene.json` on `--record`.
- Determinism audit: `grep` of `dist/heerich.js` and `dist/heerich.d.ts` for `Math.random`, `performance.now`, `Date.` and `crypto` found no matches on 2026-11-24. The scene uses no randomness and no clock.

## Plan, before running

- Commands: `pnpm install` at the workspace root, then `examples/heerich-voxel-svg/run.sh --record`, then `examples/heerich-voxel-svg/run.sh`.
- `run.sh` runs `render.ts` twice, writing `output/scene.svg` and `output/scene.json` each time, compares the two SVGs with `cmp`, and diffs `output/scene.json` against `expected/scene.json`.
- Scene: `new Heerich({ tile: 40, camera: { type: 'oblique', angle: 45, distance: 15 } })`; `addGeometry({ type: 'box', position: [0, 0, 0], size: 3 })` (union shortcut, 27 voxels, face styles per face name; `applyGeometry` is used by no line of the code because its d.ts omits the box parameters); then `removeGeometry({ type: 'box', position: [2, 2, 2], size: 1 })`, carving the corner voxel. Output via `toSVG({ padding: 20 })`, default options.
- Analytic reference (worked out before running, not from the library):
  - A 3x3x3 solid has 6 sides x 9 unit faces = 54 exterior unit faces. Carving a corner voxel removes its 3 exterior faces and exposes 3 faces of its neighbours inside the notch, so the exterior count stays at 54. Per direction it is 9 each.
  - An oblique camera shows three of the six face directions (those whose normals face the viewer), and the other three are culled. Each visible direction keeps 9 faces, so 27 visible polygons. Painter's-algorithm output draws all of them; occlusion culling is off by default.
- Predeclared checks:
  1. `getFaces({ raw: true })` (all neighbour-exposed 3D faces, no camera culling) has exactly 54 faces.
  2. `getFaces()` (projected, camera-culled) has exactly 27 faces, falling into exactly 3 distinct face names with exactly 9 faces each.
  3. The SVG has exactly 27 `<polygon` elements and no `<path` elements, and contains a `viewBox` attribute and no `NaN` or `undefined`.
  4. Two runs produce byte-identical SVG (`cmp`).
  5. `output/scene.json` equals `expected/scene.json`, which holds the library and Node versions, the four counts, the per-name histogram, SVG byte length and SHA-256.
- Expected failure modes: the camera-facing set may differ from the three-direction reasoning (for example if the oblique model shows a different set of faces than assumed); in that case the check fails and the predeclared number is not changed; the result is recorded as fail or partial with the observed numbers. An install problem or an API change in 0.21.0 is a stop condition.
- Inspection: a contact sheet is not applicable (the output is SVG). The SVG is rasterised to PNG with `magick` for a visual check that the notch is visible and the faces are not clipped or blank.

## Observation, after running

- 2026-11-24, Conors-MacBook-Pro-2.local, macOS arm64 (Darwin 25.6.0). Versions: heerich 0.21.0 (read from `node_modules/heerich/package.json` by `render.ts`), Node v22.19.0, tsx 4.23.15, ImageMagick 7.1.2-35 (only for the PNG view below). Playwright and Chromium are not used.
- Commands: `pnpm install`, then `run.sh --record`, then `run.sh`. Each invocation runs `render.ts` twice; all SVGs were byte-identical (`cmp`). The check run printed `heerich-voxel-svg: OK (heerich 0.21.0, node v22.19.0, 27 polygons, svg sha256 fe319f842ace64633998b7fecd80c3e15189d5fe3e255dad1e49d0ab26e2cf41)`.
- Measured: raw exposed faces 54 (predicted 54); projected faces 27 (predicted 27); SVG `<polygon>` elements 27 (predicted 27); `<path>` elements 0; visible face names `bottom` 9, `right` 9, `front` 9 (predicted: three names with 9 each; the names were not predicted). SVG 5875 bytes, sha256 `fe319f842ace64633998b7fecd80c3e15189d5fe3e255dad1e49d0ab26e2cf41`, equal to `expected/scene.json`.
- Inspection: `output/scene-view.png` (ImageMagick rasterising the SVG through its Inkscape delegate, 600 px wide; the delegate printed two `Unimplemented style property` warnings, which concern no shape). The picture shows a full 3x3 face with two 3-deep side strips, and a stepped notch at the receding corner where the strips meet, consistent with the voxel at [2,2,2] being removed. Visible colours are all the default beige: the red `top` style is never drawn because the top face is culled by the oblique camera, so it does not show in the output. No clipping or blank regions.
- Deviation from plan: the union uses the `addGeometry` shortcut rather than `applyGeometry`, because the 0.21.0 `applyGeometry` type omits the box parameters (`position`, `size`) and fails strict typecheck. The camera, scene, checks and tolerances are unchanged.
- No deviation in the predeclared checks. Nothing was nondeterministic across the four SVG renders.
- What this establishes: on this machine and with heerich 0.21.0 under Node 22, a 3x3x3 union minus one corner voxel renders to an oblique SVG with 27 polygons (54 exterior faces in raw form), and reruns are byte-identical.
- What it does not establish: occlusion culling, perspective or orthographic cameras, the GPU renderer, the browser or UMD builds, face styling (only the default fill is visible in this view), decals, slopes or clipping, other platforms, or the suitability of the drawing for any design. The polygon count is checked against counted faces, not against a reference renderer.
- Reviewer and follow-up: none recorded. Revisit after a heerich upgrade past 0.21.0, or if its oblique face culling changes, because the expected file would then need deliberate re-recording.
