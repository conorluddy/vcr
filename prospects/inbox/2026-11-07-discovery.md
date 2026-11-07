---
type: discovery-digest
run_date: 2026-11-07
iso_week: 2026-W45
topics: [webgpu-simulation, wgsl, pen-plotter, gltf, audio-analysis, device-frames, motion-graphics, video-processing, svg, shaders, procedural-generation, data-visualization, terminal-recording]
seeds: []
searches_used: 20
---
# Discovery leads — 2026-11-07
Summary line: 5 leads (0 in new categories).

## Leads
### Mayo (`mayo`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/fougue/mayo
- Role: Qt + OpenCascade CAD viewer and converter with a batch command-line conversion mode (STEP, IGES, glTF, STL, OBJ, PLY).
- Category: existing 3D / CAD interchange (neighbours `build123d`, `gltf-transform`, `trimesh`)
- Gap vs neighbours: direct CAD-file (STEP/IGES) to glTF/mesh conversion without writing Python; `build123d` needs a script.
- Route: native-cli-or-scripting
- Licence: BSD-2-Clause
- Version/date: v0.10.0 (README badge; release date unverified)
- Stars: 2342; last push 2026-11-07
- Install: release packages Windows and Linux only; macOS is build-from-source (unverified on arm64)
- Caveats: "headless" not confirmed — the CLI may still need a Qt platform plugin. Tessellation determinism unverified.
- Found via: GitHub topic `gltf`

### 3DTilesRendererJS (`3d-tiles-renderer`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/NASA-AMMOS/3DTilesRendererJS
- Role: renders OGC 3D Tiles (photogrammetry, terrain, cities) in three.js, Babylon.js and r3f.
- Category: existing 3D scene libraries / maps and geo motion (proposed; neighbours `three-js`, `maplibre-native` in earlier digests)
- Gap: real-world 3D geospatial data in the three.js route. Nothing catalogued streams 3D Tiles.
- Route: library-or-runtime
- Licence: Apache-2.0
- Version/date: unverified
- Stars: 2522; last push 2026-11-07
- Install: `pnpm add 3d-tiles-renderer`
- Caveats: tiles load progressively over the network; frame determinism needs a "wait until loaded" step. Data licences (Google Photorealistic Tiles, Cesium ion) are separate and restrictive.
- Found via: GitHub topic `gltf`

### FastNoise2 (`fastnoise2`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/Auburn/FastNoise2
- Role: SIMD node-graph noise library (C++17) with C API and a NoiseTool node editor; seed-deterministic.
- Category: existing procedural / generative
- Gap: fast seeded noise fields to bake into textures or displacement; browser stacks use ad hoc noise.
- Route: library-or-runtime
- Licence: MIT per GitHub metadata
- Version/date: v1.1.1, February 2026 (year inferred from page footer)
- Stars: 1571; last push 2026-11-05
- Install: CMake build; no brew, pip or npm package found (unverified)
- Caveats: no documented Python or Node bindings; the integration cost is high for a VCR scene.
- Found via: GitHub topic `procedural-generation`

### libopenshot (`libopenshot`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/OpenShot/libopenshot
- Role: C++ video editing/compositing library with Python and Ruby bindings (the engine behind OpenShot).
- Category: existing editing/assembly (neighbours `mlt-melt`, `editly`, `opentimelineio`)
- Gap: Python-scriptable timeline composition with keyframes. Overlaps MLT heavily.
- Route: library-or-runtime
- Licence: LGPL-3.0 (commercial licence also offered)
- Version/date: no GitHub release listed; unverified
- Stars: 1582; last push 2026-11-07
- Install: macOS build from source via wiki instructions
- Caveats: headless rendering unverified; LGPL linking terms.
- Found via: GitHub topic `video-processing`

### VFX-JS (`vfx-js`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/fand/vfx-js
- Role: WebGL shader effects applied to DOM elements (images, video, text).
- Category: existing browser shader effects (neighbours `glfx-js` in retired, `pixijs-filters`, `ogl`)
- Gap: effects over live DOM text and images. Unclear whether the effects can be seeked to a time.
- Route: library-or-runtime
- Licence: MIT
- Version/date: unverified
- Stars: 1166; last push 2026-11-07
- Install: `pnpm add @vfx-js/core` (package name unverified)
- Caveats: likely driven by requestAnimationFrame; may need a time override to capture deterministically.
- Found via: GitHub topic `shaders`

## Seen but rejected
- OpenShadingLanguage — renderer-embedded shading language for production renderers (Arnold, Cycles), not a standalone tool
- tinygltf — C++ header-only glTF loader; `gltf-transform` and `meshoptimizer` cover this
- Chromaprint — NOASSERTION licence; audio fingerprinting is off-target
- unovis, semiotic — framework-bound chart libraries (React/Angular), no gain over `d3`
- Friture, openmeters — GPL-3.0 real-time GUI audio meters
- astrofox, vox-director, huashu-motion, video-talkcraft, herk-edit-kit, cth9191/animate, anidoodle, pixel2motion, motionmaxxing, NullMotion — agent skills or desktop apps; astrofox already rejected
- SnapOtter, edit-mind — AGPL-3.0 self-hosted apps
- ffmpeg-webCLI — GPL-3.0 browser editor
- NovaShader, hlslpp, DirectXTK12, Unity shader repos — engine-bound
- florilegium — LuaLaTeX floral margins, print-only
- CrossTL, SILE, vsketch, svg2gcode, GRBL-Plotter, t-rec-rs — already reported or rejected in earlier digests

## Method notes
- Direct GitHub repo and release APIs were unavailable for repos not attached to the session; only the search API worked. Stars, licence and push dates come from search metadata. Release versions and dates came from WebFetch on GitHub pages and are marked unverified where the page was silent.
- Topics `webgpu-simulation`, `device-frames` and `terminal-recording` returned almost nothing new. No stargazer-overlap, reverse-dependency or feed (Homebrew, HN) passes were run; the scan used about 20 calls of the 40 budget.
- Gap areas not yet re-covered this week: accessibility (covered 2026-11-01 and 2026-11-03), provenance (covered).
