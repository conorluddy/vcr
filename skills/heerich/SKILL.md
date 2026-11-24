---
name: heerich
description: Use heerich to build a small voxel scene in Node and render it to SVG with an oblique camera. Load when compact isometric-style vector illustrations from code are wanted; not for interactive 3D or occlusion-correct output.
---

# heerich

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- heerich defines voxels and boolean geometry in JavaScript and returns an SVG string. No browser is needed.
- Tested only: Node 22.19.0, macOS arm64, heerich 0.21.0, a 3x3x3 cube minus one corner voxel, oblique camera, default painter's-algorithm output (27 polygons, 0 paths), reruns byte-identical.
- Untested: occlusion (`occlusion`, `resolveOcclusion`), perspective and orthographic cameras, styling beyond defaults, decals, slopes, clipping, `GPURenderer`, browser/UMD builds, `updateSVG`, other platforms. Use Three.js for interactive or animated 3D, Blender for offline rendering; rasterise the SVG with resvg.

## Capability map
Discovery only, from the 0.21.0 `dist/heerich.d.ts`; documentation is not VCR validation.

| Area | Surface | Status here |
| --- | --- | --- |
| Construction | `new Heerich({ tile, camera })`, `setCamera`, `setView` | constructor with oblique camera tested |
| Geometry | `addGeometry`, `removeGeometry`, `applyGeometry`, `clear`, `getVoxel`, `hasVoxel` | box `addGeometry` and `removeGeometry` tested |
| Styling | `applyStyle`, per-face style maps (`default`, `top`, ...) | default style tested; per-face effect on culled faces observed |
| Inspection | `getFaces({ raw })`, `getBounds`, `getFitViewBox`, `getVoxelInfo`, `toJSON` | `getFaces` raw and projected tested |
| Output | `toSVG({ padding })`, `updateSVG` (DOM) | `toSVG` tested; `updateSVG` untested |

## Install and doctor
```sh
npm install heerich
```
The fixture pinned 0.21.0. Check availability with `vcr doctor`; the record's check is `node -e "require('heerich')"`.

## Smoke test
After `vcr example create heerich-voxel-svg`, change to the destination it prints, install its dependencies and run:
```sh
./run.sh
# expect: heerich-voxel-svg: OK (heerich 0.21.0, node v22.19.0, 27 polygons, svg sha256 fe319f842ace64633998b7fecd80c3e15189d5fe3e255dad1e49d0ab26e2cf41)
```
Validated 2026-11-24 on macOS arm64. Counts: 54 raw exposed faces, 27 projected faces (`bottom`, `right`, `front`, 9 each), 5875-byte SVG.

## Recipe
```ts
import { Heerich } from "heerich";
const scene = new Heerich({ tile: 40, camera: { type: "oblique", angle: 45, distance: 15 } });
scene.addGeometry({ type: "box", position: [0, 0, 0], size: 3,
  style: { default: { fill: "#e8d4b8", stroke: "#333", strokeWidth: 0.5 } } });
scene.removeGeometry({ type: "box", position: [2, 2, 2], size: 1 });
const svg = scene.toSVG({ padding: 20 });
```
- Use `addGeometry` for box unions. The 0.21.0 `applyGeometry` types omit the box parameters (`position`, `size`) and fail strict typecheck.
- The oblique camera culls three of six face directions. A style for a culled direction (the fixture's red `top`) never appears in the SVG; only visible faces get polygons.
- The source has no `Math.random`, clock or `crypto` use (grep of `dist/` on 2026-11-24), and output was byte-identical across four renders. Only this scene is evidenced.

## Troubleshooting
- Strict typecheck error on `applyGeometry` with box options: switch to `addGeometry`.
- A face style seems ignored: the face direction is probably culled by the camera; compare `getFaces()` names with `getFaces({ raw: true })`.
- Polygon count differs from expectation: the fixture exits non-zero on mismatch; inspect `output/scene.json`.

## Official docs
- [heerich repository and README](https://github.com/meodai/heerich)
- [Homepage](https://meodai.github.io/heerich/)
- `dist/heerich.d.ts` in the installed 0.21.0 package (types).
