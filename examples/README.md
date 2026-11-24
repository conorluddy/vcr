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
| `gl-transitions-seek` | gl-transitions, webgl, playwright, imagemagick | gl-transitions Fade in raw WebGL1 between solid textures, seeked by progress; partial, alpha not measured, shuffled equals sequential (2026-11-24) |
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
| `node-av-decode-encode` | node-av, ffmpeg-ffprobe | node-av 7.1.0 decodes a 24-frame 320x240 H.264 MP4 frame by frame and re-encodes with libx264; ffprobe fields match, round-trip decode matches (2026-11-24) |
| `thorvg-svg-raster` | thorvg | C++ SwCanvas renders inline SVG and one Lottie frame at 120x80; probed pixels match, reruns byte-identical (2026-11-24) |
| `libass-burn-in` | libass | C program renders a two-event ASS track with a bundled OFL font over a solid 640x360 background; events land in their regions, gaps empty, alpha coverage, shuffled equals sequential, reruns byte-identical (2026-11-24) |
| `fogleman-sdf-mesh` | fogleman-sdf | classic CSG to binary STL: 291028 triangles, bounds +-0.75, watertight, byte-identical rerun (2026-11-24) |
| `gifsicle-optimise` | gifsicle, ffmpeg, imagemagick | 6-frame ffmpeg GIF: -O3 keeps frames, delays, loop and RGBA pixels, smaller; --colors=16 table <= 16 (2026-11-24) |
| `heerich-voxel-svg` | heerich | 3x3x3 voxel cube minus one corner rendered to oblique SVG in Node, 27 polygons, reruns byte-identical (2026-11-24) |
| `ab-av1-crf-search` | ab-av1 | crf-search to VMAF 95 on a 2 s generated clip (CRF 27.5 on 3 of 3 runs), encode scored by FFmpeg libvmaf 98.310 (2026-11-24) |
| `agg-asciicast-gif` | agg | hand-written asciicast v2 (4 events) renders to a 403x157 GIF at font-size 16 and exactly 2x at 32, 5 frames at the event times, 5.00 s, rerun byte-identical; size depends on the resolved font (2026-11-24) |
| `dovi-tool-metadata-roundtrip` | dovi-tool | synthetic Dolby Vision RPU and HDR10+ metadata injected into 48-frame x265 10-bit HEVC and read back: RPU byte-identical, pixels unchanged, HDR10+ matches; DV profile and L1 avg/min read back differently, partial (2026-11-24) |
| `exiv2-metadata-roundtrip` | exiv2, exiftool, ffmpeg-ffprobe | JPEG XMP-dc Title/Rights, EXIF Artist and IPTC Caption written via `-m`, `-pa` exact, `rm` strips, decoded RGBA unchanged, exiftool 13.50 reads same values (2026-11-24) |
| `f3d-headless-still` | f3d | PARTIAL: 320x240 RGBA stills of a generated GLB, byte-identical reruns, A-B-A order; view-A region and antialias checks failed, no-window unproven; no expected/ committed (2026-11-24) |
| `freeze-code-still` | freeze | fixed Go file to SVG and PNG, Dracula, window chrome off/on, line numbers, embedded JetBrains Mono; repeat byte-identical (2026-11-24) |
| `typst-title-card` | typst | Data-driven title card from .typ plus json() to SVG and PNG at 144 ppi with one pinned font; size, alpha, query and reruns pass, SVG glyphs are outlines so value is not text (partial, 2026-11-24) |
| `vhs-tape-recording` | vhs | partial: headless tape to MP4 h264 640x360 and a stable text golden; PNG frames cropped to 494x208 and frame counts vary run to run (2026-11-24) |
| `baguette-simulator-capture` | baguette, ffmpeg-ffprobe, imagemagick | one iPhone 17 Pro iOS 26.5 sim booted by UDID: 1206x2622 PNG and 3 s H.264 recording within tolerance, non-blank frames, shutdown; no pixel hashes (2026-11-24) |
| `dssim-still-compare` | dssim, imagemagick | dssim 3.4.0 scores a generated opaque 256x256 PNG: self 0, JPEG q90/q50/q10 strictly increasing, per-scale difference maps via -o, reruns identical; no alpha or thresholds (2026-11-24) |

The original six were validated on the primary Mac on 2026-10-26; later rows give their own dates. Browser examples use `packages/capture`; their scenes expose `window.__scene = { duration, seek }` and schedule canvas renders on an animation frame.

## Outside this repository

`vcr example create <id>` copies an example into `<workspace>/examples/<id>` and prints the commands to run it. Browser examples arrive without `capture.ts`, `run.sh` and `expected/` (they depend on this pnpm workspace) and with a standalone `package.json`; render them with `vcr capture` using the `capture` block. Native examples (`native-svg`, `ffmpeg-assembly`, `blender-smoke`) keep their standalone `run.sh` and `expected/`. `*.test.ts`, `node_modules/` and `output/` never travel.
