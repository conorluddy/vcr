---
type: discovery-digest
run_date: 2026-11-26
iso_week: 2026-W48
topics: [vector-tiles, cartography, soft-body, screen-recording, loudness, lottie, data-visualization, typesetting]
seeds: [canvaskit-skia, maplibre-native, rapier]
searches_used: 24
---
# Discovery leads — 2026-11-26

Summary line: 11 leads (0 in new categories).

This is the fourth W48 run. Earlier W48 digests (2026-11-23, 2026-11-24, 2026-11-25) are merged and no `discovery/` PR is open. GitHub topic sweeps are saturated: the loudness, soft-body, lottie and cartography topics returned only repositories already listed or rejected in earlier digests. This run therefore started from a list of well-established tools that no digest or record names yet, checked each against `catalog/tools`, `catalog/retired` and every inbox file, and verified the survivors from GitHub, npm, PyPI, crates.io and Homebrew. Several leads are larger than the usual long-tail size (scrcpy especially), but each fills a named gap that the catalogue does not cover.

## Leads

### tippecanoe (`tippecanoe`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/felt/tippecanoe
- Role: a CLI that builds vector tilesets from GeoJSON, FlatGeobuf or CSV points and writes `.mbtiles` or `.pmtiles` directly (`-o file.pmtiles`).
- Category: Discovery: research candidates (the maps group, beside `chiitiler` and `maplibre-native`).
- Gap vs neighbours: `chiitiler` and `maplibre-native` render tiles that already exist. The PMTiles lead (2026-11 digest) serves and reads archives. Planetiler builds OSM basemaps. Nothing turns a production's own GeoJSON (routes, regions, data points) into a local tileset with zoom-dependent simplification, which is the missing step for an offline, pinned map scene.
- Route: native-cli-or-scripting
- Licence: BSD-2-Clause.
- Version: Homebrew stable 2.79.0. GitHub release date unverified.
- Stars: 1,639. Last push: 2026-11-16.
- Install: `brew install tippecanoe`
- Caveats: feature dropping and simplification depend on flags such as `-zg`, `--drop-densest-as-needed` and `-r`, so pin them in the fixture. Check whether output bytes are reproducible across runs (multi-threaded tiling). This is the Felt fork; the original mapbox/tippecanoe stopped at 1.36.0.
- Found via: maps gap, a neighbour of the `maplibre-native` and `chiitiler` seeds.

### scrcpy (`scrcpy`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/Genymobile/scrcpy
- Role: mirrors and records an Android device or emulator over ADB. With `--no-playback --no-window --record=file.mp4` it records headlessly to MP4, MKV, Opus, FLAC or WAV, and `--time-limit` bounds the take.
- Category: A5. Video and capture.
- Gap vs neighbours: `baguette` and the simctl leads cover the iOS Simulator only. `frames-cli` frames a capture after it exists. Nothing in the catalogue captures an Android screen, so Android app previews have no capture route.
- Route: native-cli-or-scripting
- Licence: Apache-2.0.
- Version: Homebrew stable 5.0.1. GitHub release date unverified.
- Stars: 155,743. This is not a long-tail find; it is listed for the device-capture gap. Last push: 2026-11-24.
- Install: `brew install scrcpy` (needs `android-platform-tools` for `adb`, plus a device or an Android emulator).
- Caveats: capture is real-time screen recording, so frames are not seekable or deterministic. Encoder frame rate and bitrate vary by device. A repeatable take needs a scripted app state (adb input or UI automation). Recording stops on Ctrl+C or `--time-limit`.
- Found via: app-preview and device-capture gap, checking the Android side of the existing iOS leads.

### skia-canvas (`skia-canvas`) — strong candidate
- [x] triage: assess
- URL: https://github.com/samizdatco/skia-canvas
- Role: a Node implementation of the HTML Canvas API on Skia. It renders headlessly to PNG, JPEG, WEBP, raw pixels, SVG and multi-page PDF, supports variable fonts loaded from local files, and also has an on-screen `Window`.
- Category: A1. Creative coding and 2D.
- Gap vs neighbours: `canvaskit-skia` is the WASM Skia surface with a lower-level API. `canvas-2d` needs a browser capture. skia-canvas runs ordinary Canvas 2D scene code in Node and writes frame sequences, vector SVG and PDF from the same drawing calls with no browser. `@napi-rs/canvas` (MIT, 2,367 stars, 1.2.1 on 2026-11-25) is a similar alternative, already named as an install dependency in an earlier OpenSheetMusicDisplay lead.
- Route: library-or-runtime
- Licence: MIT.
- Version: 4.0.1, published 2026-11-14 (npm registry).
- Stars: 2,632. Last push: 2026-11-14.
- Install: `pnpm add skia-canvas`. The README does not say whether prebuilt darwin-arm64 binaries ship; benchmarks were run on darwin-arm64.
- Caveats: GPU rendering is optional; force CPU raster for reproducible pixels. Text needs fonts registered explicitly from files, not system fallback. Check whether PNG bytes match across macOS and Linux.
- Found via: neighbour of the `canvaskit-skia` seed.

### Jolt Physics (JoltPhysics.js) (`jolt-physics-js`) — strong candidate
- [x] triage: assess
- URL: https://github.com/jrouwe/JoltPhysics.js (engine: https://github.com/jrouwe/JoltPhysics)
- Role: WASM and JavaScript bindings for the Jolt rigid-body and soft-body physics engine. The engine lists "Soft body simulation (e.g. a soft ball or piece of cloth)" with edge, bend and tetrahedron-volume constraints.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `rapier`, `matter-js` and `pymunk` are rigid-body engines. `splishsplash` is SPH fluids. Jolt adds soft bodies and cloth in the browser, stepped at a fixed timestep, which fills the "simulation beyond rigid bodies" gap for Three.js scenes.
- Route: library-or-runtime
- Licence: MIT (bindings and engine).
- Version: `jolt-physics` 1.1.2, published 2026-11-21 (npm registry).
- Stars: 592 (bindings). Last push: 2026-11-21.
- Install: `pnpm add jolt-physics`
- Caveats: the engine README says "The simulation runs deterministically" and points to a section on its limits. Cross-platform determinism is a compile-time option in Jolt, and whether the published WASM build enables it is unverified. Bake the simulation (step every frame from t=0 and cache the transforms) rather than seeking.
- Found via: simulation gap, a neighbour of the `rapier` seed.

### mapshaper (`mapshaper`) — strong candidate
- [x] triage: assess
- URL: https://github.com/mbloch/mapshaper
- Role: a CLI (`mapshaper`, plus `mapshaper-xl` for large files) that edits Shapefile, GeoJSON, TopoJSON, CSV and other geodata. It simplifies, clips, dissolves, joins and reprojects, and can export SVG.
- Category: Discovery: research candidates (the maps group).
- Gap vs neighbours: `d3` projects geometry inside a scene. GDAL (an earlier lead) converts formats. mapshaper is the scriptable step that turns heavy boundary files into small, simplified GeoJSON, TopoJSON or a flat SVG map still, with no browser.
- Route: native-cli-or-scripting
- Licence: MPL-2.0 (README and npm both say so; GitHub shows NOASSERTION).
- Version: 0.8.10, published 2026-11-24 (npm registry).
- Stars: 4,212. Last push: 2026-11-24.
- Install: `pnpm add -g mapshaper` (no Homebrew formula found).
- Caveats: the GitHub README shown did not describe SVG export or projections, although both appear in the project's command reference. Verify `-proj` and `-o format=svg` in the fixture. Simplification percentages change geometry, so pin them.
- Found via: maps gap, cartography topic sweep, then a keyword dedupe.

### auto-editor (`auto-editor`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/WyattBlue/auto-editor
- Role: a CLI that cuts silent or low-motion sections from video and audio (`--edit audio`, `--edit motion:threshold=0.02`, combinable). It renders the result or exports a timeline for Premiere, Resolve, Final Cut Pro, Shotcut or Kdenlive, a CMX 3600 EDL or a clip sequence.
- Category: A5. Video and capture.
- Gap vs neighbours: `pyscenedetect` finds cuts, and `opentimelineio` and `mlt-melt` edit timelines you write. auto-editor writes the rough cut of recorded narration or a screen-capture take, which is the step before pacing review. Its EDL and XML outputs can be checked against `opentimelineio`.
- Route: native-cli-or-scripting
- Licence: Unlicense.
- Version: Homebrew stable 31.10.0. Release date unverified; the PyPI package stopped at 29.3.1 (2025-11-04) after the move to Nim.
- Stars: 6,142. Last push: 2026-11-25.
- Install: `brew install auto-editor`
- Caveats: cuts depend on threshold and margin values, so pin them and the version. Major versions change the CLI often. Rendering re-encodes through its own pipeline, so prefer timeline export and assemble with FFmpeg.
- Found via: pacing-adjacent keyword dedupe sweep.

### Vizzu (`vizzu`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/vizzuhq/vizzu-lib (docs: https://lib.vizzuhq.com)
- Role: a browser library (C++ compiled to WASM, drawing to canvas) for animated charts that morph between chart types through `chart.animate()`.
- Category: A1. Creative coding and 2D.
- Gap vs neighbours: `d3` and `deck-gl` leave transitions to the scene author. `vl-convert` renders static Vega-Lite. Vizzu gives object-constant transitions between chart states (bar to scatter to pie, and so on), which is the core move in a data-story video. Its `AnimControl` has `seek(position)`, `playState = 'paused'` and a `position` setter (dist/animcontrol.d.ts in 0.18.0), so it can be driven frame by frame.
- Route: library-or-runtime
- Licence: Apache-2.0 (copyright Vizzu Inc.).
- Version: 0.18.0, published 2026-04-20 (npm registry).
- Stars: 2,051. Last push: 2026-04-20, so check activity at assessment.
- Install: `pnpm add vizzu`
- Caveats: a paused seek to the end does not resolve the completion promise. Canvas text uses browser fonts. Multi-step stories chain several `animate()` calls, so the capture must seek across that chain.
- Found via: data-visualization topic keyword dedupe.

### Penrose (`penrose`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/penrose/penrose
- Role: generates SVG diagrams from plain-text notation split into Domain, Substance and Style programs. Layout is solved by optimisation, and each result is named by a variation string (such as "MonsoonCaterpillar95943"). The `@penrose/roger` CLI runs `roger trio <file.trio.json>` and prints the SVG.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `d2`, `graphviz` and `mermaid-cli` lay out graphs and flows. Penrose does mathematical and conceptual diagrams (sets, geometry, vectors) where one style file restyles many diagrams, for explainer stills.
- Route: native-cli-or-scripting
- Licence: MIT.
- Version: `@penrose/core` and `@penrose/roger` 3.3.1, published 2026-08-30 (npm registry).
- Stars: 8,019. Last push: 2026-11-06.
- Install: `pnpm add -g @penrose/roger` (unverified on macOS arm64).
- Caveats: layout is deterministic only for a fixed variation string and version, so pin both. Whether layouts can be interpolated for motion is unverified; treat it as a stills tool.
- Found via: diagram keyword dedupe sweep.

### Mitsuba 3 (`mitsuba-3`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/mitsuba-renderer/mitsuba3
- Role: a research-oriented physically based renderer with a Python API. It has scalar and LLVM CPU variants, spectral and RGB modes, and differentiable rendering. Scenes come from XML or Python dicts.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `blender` and `pov-ray` are the offline renderers. Mitsuba adds a pip-installable, scriptable path tracer with fixed sample counts and seeds and spectral rendering for product shots and look-development references. Its inverse rendering could fit materials to a reference.
- Route: library-or-runtime
- Licence: BSD-3-Clause according to the repository's LICENSE (GitHub shows NOASSERTION; verify).
- Version: 3.9.1, published 2026-08-07 (PyPI; macOS arm64 wheels for cp310 to cp312+).
- Stars: 2,999. Last push: 2026-11-24.
- Install: `uv pip install mitsuba`
- Caveats: fix the sampler `seed` and `spp`. The LLVM variant uses multiple threads; check that pixels are reproducible across runs. No GPU variant on macOS (CUDA only). There is no animation system, so motion means re-rendering the scene per frame from Python.
- Found via: renderer keyword dedupe sweep (lower-priority "reproducible environment pinning" area, since it is a pinned wheel).

### PyVista (`pyvista`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/pyvista/pyvista
- Role: a Pythonic VTK wrapper for meshes, volumes and scientific plots, with off-screen `Plotter(off_screen=True)` screenshots and movie writing.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `vedo` covers similar ground. `vtk-js` is the browser side. PyVista is the larger community route and is the base that the earlier GeoVista lead builds on. Assess it alongside `vedo` and keep only one.
- Route: library-or-runtime
- Licence: MIT.
- Version: 0.49.3, published 2026-11-24 (PyPI).
- Stars: 3,885. Last push: 2026-11-25.
- Install: `uv pip install pyvista`
- Caveats: off-screen rendering on macOS uses the VTK OpenGL context. Check headless behaviour without a display session. Fix the camera position, window size and anti-aliasing explicitly.
- Found via: named only inside the GeoVista lead (2026-11 digest) and never listed itself; neighbour of `vedo`.

### flowmap.gl (`flowmap-gl`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/visgl/flowmap.gl
- Role: a deck.gl layer that draws origin-destination flows as tapered arrows with clustering and animated flow lines.
- Category: A9. Adjacent resources mentioned during discovery (beside `deck-gl`).
- Gap vs neighbours: `deck-gl` has arc and line layers but no flow-map layer with aggregation. This fits migration and logistics map scenes.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: `@flowmap.gl/layers` 9.5.0, published 2026-11-14 (npm registry).
- Stars: 143. Last push: 2026-11-16.
- Install: `pnpm add @flowmap.gl/layers @flowmap.gl/data`
- Caveats: the animated mode is driven by deck.gl's clock; check whether it can be set from scene time for frame-stepped capture. Clustering depends on zoom.
- Found via: maps gap, a neighbour of `deck-gl`.

## Seen but rejected
- @napi-rs/canvas — a near-duplicate of the skia-canvas lead; noted there as the alternative.
- linebender/velato (0.12.0, crates.io 2026-09-10) — a Rust Lottie renderer on Vello. `thorvg`, `dotlottie` and `lottie-web` already cover Lottie, and the Vello lead covers the renderer; 164 stars.
- sammycage/lunasvg — a C++ SVG renderer that duplicates `resvg` and `thorvg`.
- csteinmetz1/pyloudnorm — BS.1770 loudness in Python; FFmpeg's `ebur128`, `ffmpeg-normalize` and the earlier ebur128 lead cover it.
- sergree/matchering — GPL-3.0 reference mastering; the last PyPI release is 2.0.6 from 2022.
- grame-cncm/faust — a DSP language (GPL compiler); too far from video production next to `supercollider`, `csound` and `pure-data`.
- vectorgraphics/asymptote — an LGPL/GPL vector language that overlaps `typst` and the diagram tools.
- googlefonts/nanoemoji — a colour-font build tool, too niche for VCR.
- Topic sweeps for `loudness`, `soft-body`, `lottie` and `cartography` (stars 30 to 3,000, pushed after 2026-08-28) — every relevant result was already listed or rejected in earlier digests (rsgain, ebur128, libsonare, AudioAuditor, maputnik, umap, protomaps/basemaps, gridviz, lottie-converter, dotlottie).

## Method notes
- Show HN through hn.algolia.com returned non-JSON responses (the proxy was probably blocking it), so the feed step was skipped. Homebrew's formulae API was reachable, but only for version lookups; this run did not scan new formulae.
- Skipped the stargazer-overlap step to stay within the search budget.
- GitHub reported NOASSERTION licences for mapshaper, mitsuba3 and Brooooooklyn/canvas. Licences above come from READMEs and package registries. Mitsuba's BSD-3-Clause comes from memory of its LICENSE file and is unverified.
- Release dates for tippecanoe, scrcpy and auto-editor are unverified; only Homebrew stable versions were checked.
