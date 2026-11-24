# Examples

Tier 3 of the catalogue tree: runnable fixtures, loaded one at a time. Each directory has:

- `example.json` — manifest validated by `catalog/schemas/example.schema.json`: id, the tool ids it demonstrates, status, the run command, and for browser examples a `capture` block (scene, width, height, fps). Tool records link back through `examples`; `pnpm validate` checks the link both ways.
- `run.sh` — reproduces the fixture and diffs against `expected/`; `run.sh --record` re-records after a deliberate change or tool upgrade.
- `expected/` — hashes and probe metadata, not media.
- `output/` — generated, ignored.

| Example | Demonstrates | Evidence |
| --- | --- | --- |
| `native-svg` | svg, resvg, ffmpeg-ffprobe | PNG hash and ffprobe metadata |
| `ffmpeg-assembly` | imagemagick, ffmpeg-ffprobe | 48 frames at 24 fps mux to exactly 2.000000 s |
| `blender-smoke` | blender | one 320x240 RGBA frame from the app bundle |
| `browser-capture` | web-animations-api, playwright | shuffled-order capture matches sequential; spike report |
| `p5-capture` | p5-js, playwright | seeded sketch, deterministic in any order |
| `three-capture` | three-js, playwright | WebGL scene with alpha, deterministic in any order |
| `anime-capture` | anime-js, playwright | v4 timeline seeked per frame with alpha, deterministic in any order (2026-11-05) |
| `sharp-composite` | sharp | RGBA layers and a rasterised SVG composited with alpha kept; pixel probes and hashes (2026-11-05) |
| `waapi-capture` | web-animations-api, playwright | element.animate() paused and seeked via currentTime, with alpha, deterministic in any order (2026-11-05) |
| `canvas2d-capture` | canvas-2d, playwright | plain canvas redrawn from t with a loaded font and seeded PRNG, alpha, deterministic in any order (2026-11-05) |
| `pixijs-capture` | pixijs, playwright, imagemagick | manual WebGL geometry, alpha, 90 changing frames; shuffled order matches sequential (2026-11-05) |
| `konva-capture` | konva, playwright, imagemagick | explicit layered Canvas 2D drawing from t, alpha, shuffled equality (2026-11-05) |
| `react-capture` | react-three-fiber, three-js, playwright, imagemagick | React template: esbuild-bundled R3F scene seeked via flushSync + advance, alpha, shuffled equality (2026-11-12) |
| `drei-capture` | drei, react-three-fiber, three-js, playwright, imagemagick | RoundedBox, Center and Line in R3F seeked via flushSync + advance, alpha, shuffled equals sequential; no Float, Text or assets (2026-11-12) |
| `react-postprocessing-capture` | react-three-postprocessing, react-three-fiber, three-js, postprocessing, playwright, imagemagick | R3F EffectComposer with Bloom and ChromaticAberration, shuffled equals sequential; Bloom leaves a faint alpha haze, not a clean matte (2026-11-12) |
| `rapier-capture` | react-three-rapier, react-three-fiber, three-js, playwright, imagemagick | rigid bodies re-stepped at fixed 1/60 from a world snapshot each seek, alpha, shuffled equals sequential (2026-11-12) |
| `react-spring-capture` | react-spring, playwright, imagemagick | partial: animated.div set via SpringValue.set from closed-form t, alpha, shuffled equals sequential; spring solver not seeked (2026-11-12) |
| `motion-capture` | motion, playwright, imagemagick | motion.div via stopped animate() controls with .time = t, alpha, shuffled equals sequential, idle after seek (2026-11-12) |
| `motion-canvas-render` | motion-canvas | editor UI PNG sequence; repeated same-host hashes, 64x48 alpha bounds (2026-11-16) |
| `mediapipe-image-segmentation` | mediapipe | CPU Image Segmenter, generated silhouette, repeatable 256x256 mask (2026-11-16) |
| `twojs-capture` | two-js, playwright, imagemagick | SVG renderer geometry seeked from t, alpha, shuffled equals sequential (2026-11-05) |
| `lint-overflow` | playwright, `vcr lint` | 9:16 DOM frame: exactly one TYPO-SAFE crossing and one overflow, exit 1 (2026-11-06) |
| `roughjs-capture` | rough-js, playwright, imagemagick | seeded hand-drawn rectangle, ellipse and path redrawn from t (hachure fill only; other fills use unseeded Math.random), alpha, shuffled equals sequential (2026-11-11) |
| `d3-capture` | d3, playwright, imagemagick | SVG bar-and-line chart via d3-scale/shape/axis, values from d3.interpolate at t, no transitions or timers, alpha, shuffled equals sequential (2026-11-11) |
| `three-globe-capture` | three-globe, three-js, playwright, imagemagick | seeked rotating globe, 5 points and 1 arc on SwiftShader WebGL, alpha, shuffled equals sequential; mark-visibility check failed (marks about 2 to 5 px), partial (2026-11-24) |
| `paperjs-capture` | paper-js, playwright, imagemagick | smoothed path, boolean union and radial gradient set from t with explicit view.update(), alpha, shuffled equals sequential (2026-11-11) |
| `matterjs-capture` | matter-js, playwright, imagemagick | rigid bodies seeked by fixed-step re-simulation, drawn with Canvas 2D, alpha, shuffled equals sequential (2026-11-11) |
| `tweenjs-capture` | tween-js, playwright, imagemagick | chained, yoyo and eased tweens rebuilt and stepped by explicit time per seek, alpha, shuffled equals sequential (2026-11-11) |
| `fabricjs-capture` | fabric-js, playwright, imagemagick | StaticCanvas Rect, Circle, Path and Group set from t with explicit renderAll, no animate(), alpha, shuffled equals sequential (2026-11-11) |
| `svgjs-capture` | svg-js, playwright, imagemagick | rect, circle, path, group transform and gradient set from t, no animate runner, alpha, shuffled equals sequential (2026-11-11) |
| `regl-capture` | regl, playwright, imagemagick | gradient quad and triangles from a time uniform, no regl.frame(), premultiplied WebGL alpha, shuffled equals sequential (2026-11-11) |
| `twgl-capture` | twgl, playwright, imagemagick | shader from a time uniform via twgl core helpers, WebGL1 with preserveDrawingBuffer, alpha, shuffled equals sequential (2026-11-11) |
| `pts-capture` | pts, playwright, imagemagick | Pt, Group and polygon ops drawn by CanvasForm from t after the space's ready callback, no play(), alpha, shuffled equals sequential (2026-11-11) |
| `babylonjs-capture` | babylon-js, playwright, imagemagick | babylonjs UMD Scene, ArcRotate camera, lights and meshes set from t, one scene.render() per seek, no runRenderLoop, alpha, shuffled equals sequential (2026-11-11) |
| `ogl-capture` | ogl, playwright, imagemagick | Renderer, Camera, Transform, custom-shader Program with animated premultiplied alpha, one render per seek, shuffled equals sequential (2026-11-11) |
| `playcanvas-capture` | playcanvas-engine, playwright, imagemagick | WebGL2 Application driven by app.update(0) + app.render() per seek, never app.start(), alpha, shuffled equals sequential (2026-11-11) |
| `meshline-capture` | three-meshline, three-js, playwright, imagemagick | THREE.MeshLine width taper, dash offset, visibility and rebuilt points per seek, alpha, shuffled equals sequential (2026-11-11) |
| `postprocessing-capture` | postprocessing, three-js, playwright, imagemagick | EffectComposer with Bloom and ChromaticAberration via composer.render(0) per seek; vignette not visible on alpha; shuffled equals sequential (2026-11-11) |
| `rive-web-state-machine` | rive-web | MIT-licensed sample, nested boolean inputs drive visible state colors (2026-11-16) |
| `colmap-feature-extraction` | colmap | CPU SIFT database records for three generated 384x288 views; 853 keypoints each (2026-11-16) |
| `mlt-color-render` | mlt-melt | Built-in color to FFV1: five 64x48 frames, repeated decoded RGB hash (2026-11-16) |
| `synfig-static-render` | synfig | Static SIF rectangle to 160x120 PNG; pixel probes and repeated file hash (2026-11-16) |
| `inkscape-svg-export` | inkscape | SVG page to 128x96 PNG; pixel probes and repeated file hash (2026-11-16) |
| `hyperframes-static-square` | hyperframes | Static HTML composition to 12 PNG frames; exact square bounds and repeated pixel hashes (2026-11-16) |
| `canvas2d-count-up` | canvas-2d, playwright, imagemagick | canvas-text figure counts 0 to 1250 with a clamped ease-out: monotonic, lands exactly and holds, position stable, shuffled equals sequential (2026-11-20) |
| `svg-paper-collage` | svg, web-animations-api, playwright, imagemagick | six inline SVG paper pieces (embedded still, irregular mat, feDropShadow) animated via seeked element.animate; alpha, settles, shuffled equals sequential (2026-11-20) |
| `waapi-word-stagger` | web-animations-api, playwright, imagemagick | seven-word line split into spans, one paused animation per word, onsets exactly 3 frames apart, settles fully visible, shuffled equals sequential (2026-11-20) |
| `anime-diagram-build` | anime-js, playwright, imagemagick | paused v4 timeline: connectors draw before each node appears, earlier nodes recede, then an accent traces nodes 1-4 and holds; probe checks in both seek orders, shuffled equals sequential (2026-11-20) |

The original six were validated on the primary Mac on 2026-10-26; later rows give their own dates. Browser examples use `packages/capture`; their scenes expose `window.__scene = { duration, seek }` and schedule canvas renders on an animation frame.

## Outside this repository

`vcr example create <id>` copies an example into `<workspace>/examples/<id>` and prints the commands to run it. Browser examples arrive without `capture.ts`, `run.sh` and `expected/` (they depend on this pnpm workspace) and with a standalone `package.json`; render them with `vcr capture` using the `capture` block. Native examples (`native-svg`, `ffmpeg-assembly`, `blender-smoke`) keep their standalone `run.sh` and `expected/`. `*.test.ts`, `node_modules/` and `output/` never travel.
