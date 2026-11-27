---
type: discovery-digest
run_date: 2026-11-22
iso_week: 2026-W47
topics: [taichi, hillshade, terrain-rgb, dem, pen-plotter, hershey-fonts, single-line-font, l-system, procedural-textures, audio-reactive, svg-path, font-subsetting, position-based-dynamics, cloth, voronoi, sidecar, frame-cache, render-farm, image-sequence, alt-text, reduced-motion, perceptual-hash, invisible-watermark, contour-lines, hatching, sprite-sheet]
seeds: []
searches_used: 51
---
# Discovery leads — 2026-11-22

Summary line: 9 leads (0 in new categories).

This is the fifth W47 run. Earlier W47 runs covered shaders, maps, provenance, device capture, caption tooling and asset sources. This run looked for terrain and elevation tools for map motion, simulation beyond rigid bodies (cloth, soft bodies, rods), stroke and hatching looks, and tools for handling frame sequences.

## Leads

### GDAL (`gdal`) — strong candidate
- [x] triage: assess
- URL: https://gdal.org (source: https://github.com/OSGeo/gdal)
- Role: the standard geospatial raster and vector library and its CLI tools. `gdaldem hillshade`, `color-relief` and `slope` turn elevation data into shaded relief. `gdalwarp` reprojects and clips. `gdal_translate` converts to PNG, GeoTIFF or COG. `ogr2ogr` converts vector data to GeoJSON.
- Category: A4. Vector, typography, diagrams and stills (maps), or A6. Image processing and colour.
- Gap vs neighbours: `maplibre-native` and `chiitiler` render styled vector tiles. `three-globe` draws a globe. None of them can make a hillshade, a colour-relief raster or a reprojected base layer from raw DEM or satellite data. The earlier `mapnik` and `pmtiles` leads use GDAL data but do not replace it. Most terrain and elevation-based map motion starts with GDAL.
- Route: native-cli-or-scripting
- Licence: MIT (Homebrew formula metadata). Some optional drivers are under other licences. Check the build's driver list before relying on one.
- Version: 3.13.3, dated 2026-08-18 on gdal.org/download.
- Stars: unverified (the GitHub API was out of scope). Last push: unverified.
- Install: `brew install gdal` (an arm64 Sequoia bottle exists). Python bindings: `uv pip install gdal`, which must match the installed library version.
- Caveats: well known, but missing from the catalogue and from every earlier digest. Output is deterministic for fixed inputs and options. Resampling, compression and the `-z`/`-s` hillshade options all change pixels, so pin them in the fixture. The PROJ data version can shift reprojected coordinates slightly.
- Found via: gap analysis after the `hillshade` and `terrain-rgb` topic searches returned only thin GDAL wrappers (`dem2terrainrgb`, `massif`, `contour-tiles`).

### p5.brush (`p5-brush`) — strong candidate
- [x] triage: assess
- URL: https://github.com/acamposuribe/p5.brush
- Role: natural-media drawing for p5.js: pencils, charcoal, markers, watercolour-style fills, hatching and vector fields that bend strokes. It also has a standalone WebGL2 build that does not need p5.
- Category: A1. Creative coding and 2D.
- Gap vs neighbours: `rough-js` gives a sketchy, hand-drawn look to shapes but has no fills, hatching or flow fields. `p5-js` has no brush or fill model. `vsketch` and `vpype` are for plotter output, not raster stills. p5.brush fills the hand-drawn illustration and print look for generative stills and motion.
- Route: library-or-runtime
- Licence: MIT.
- Version: 3.0.0 on npm, published 2026-10-28. It needs `p5 ^2.2` as a peer dependency, except for the standalone build.
- Stars: 1,465. Last push: 2026-11-21.
- Install: `pnpm add p5.brush p5` (standalone: import `p5.brush/standalone`).
- Caveats: the p5 build needs a `WEBGL` canvas, so capture depends on the WebGL implementation (SwiftShader against a GPU). It is seeded through p5's `randomSeed()`/`noiseSeed()`, or `brush.seed()` in the standalone build. The README says to call `brush.seed()` with the same value every frame to keep animated fills stable. Brushes build up over frames, so a seekable scene must redraw from scratch at each time.
- Found via: GitHub topic search `hatching`.

### NVIDIA Warp (`nvidia-warp`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/NVIDIA/warp (docs: https://nvidia.github.io/warp/)
- Role: a Python framework that JIT-compiles kernels for simulation and geometry. It comes with particle, DEM and SPH, FEM, grid fluid (Navier–Stokes, FDTD), marching-cubes, mesh raycast and NanoVDB examples.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `pymunk`, `rapier` and `matter-js` handle rigid bodies. `splishsplash` handles SPH fluids through its own app. Warp is a scriptable Python kernel layer that can bake particles, fields or isosurface meshes (marching cubes) at a fixed timestep for Blender or three.js.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: 1.19.0 on PyPI, uploaded 2026-11-02 (Python ≥ 3.10). A `macosx_11_0_arm64` wheel is published.
- Stars: about 7.3k (from the GitHub page). Last push: unverified.
- Install: `uv pip install warp-lang`.
- Caveats: on macOS it runs on the CPU only. The project says its macOS wheels do not use Metal, so large simulations will be slow. Whether `warp.sim` (cloth and soft bodies) is still in Warp or has moved to a separate physics package is unverified. Check this before claiming cloth support. CPU runs should be deterministic for fixed inputs, but atomics-based kernels may not be bit-exact across runs.
- Found via: gap search (simulation beyond rigid bodies) after the `taichi` and `position-based-dynamics` topics.

### PositionBasedDynamics / pyPBD (`position-based-dynamics`) — worth cataloguing
- [x] triage: defer
- Triage reason (2026-11-27): no macOS wheel (Linux/Windows only). Revisit if macOS wheels appear.
- URL: https://github.com/InteractiveComputerGraphics/PositionBasedDynamics
- Role: a C++ library with Python bindings (pyPBD) for position-based simulation. It covers deformable solids (distance, bending, volume, shape-matching, FEM and strain-based constraints, so cloth and soft bodies), Cosserat elastic rods, position-based fluids, and rigid bodies with joints.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: it comes from the same group as `splishsplash`, which is fluids only. `pymunk` and `rapier` cannot do cloth, ropes or hair-like rods. This covers the cloth, soft-body and rope part of the simulation gap. Results can be exported to OBJ or PLY for Blender.
- Route: library-or-runtime
- Licence: MIT.
- Version: pyPBD 2.2.2 on PyPI, uploaded 2025-09-04. The GitHub releases section is empty.
- Stars: 2,296. Last push: 2026-09-01.
- Install: no macOS wheel (PyPI has Linux and Windows only), so on macOS it must be built from source with CMake. Whether that build works on macOS arm64 is unverified. The changelog mentions Mac OS X support, but tested configurations are listed only for Windows and Debian.
- Caveats: fixed-timestep stepping from Python, so a re-simulated bake should be repeatable. Headless OBJ/PLY export without the GLFW demo GUI is unverified.
- Found via: GitHub topic search `position-based-dynamics`.

### PySeq (`pyseq`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/rsgalloway/pyseq
- Role: a Python library and CLI suite (`lss`, `stree`, `sfind`, `sdiff`, `sstat`, `scopy`, `srm`, `smv`) that detects, parses and formats numbered file sequences such as `frame.0001.png`, showing gaps as split ranges (`[1-3, 6]`).
- Category: A5. Video and capture.
- Gap vs neighbours: `ffmpeg` and `openimageio-oiiotool` read image sequences but do not report missing or duplicate frames, or which sequences sit in a render folder. `lss`-style listing is a cheap check before encoding that a capture produced every frame, which the render manifests could also use.
- Route: native-cli-or-scripting
- Licence: BSD-3-Clause (PyPI metadata).
- Version: 0.9.3 on PyPI, uploaded 2026-07-25 (Python ≥ 3.8).
- Stars: 127. Last push: 2026-08-24.
- Install: `uv tool install pyseq` (also packaged as `python3-pyseq` in Debian sid and Ubuntu 26.04).
- Caveats: it reads file names only, not pixels, so it is deterministic. Padding and frame-number position are inferred, so mixed padding in one folder can split a sequence.
- Found via: GitHub topic search `image-sequence` (lower-priority area: frame caching and batch rendering).

### elevation (`elevation-eio`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/bopen/elevation
- Role: the `eio` CLI and Python library that download, cache and clip global DEMs (Mapzen terrain tiles, Copernicus GLO-30/90, ALOS World 3D, GEDTM30, SRTM 30/90 m) to a GeoTIFF for given bounds.
- Category: A9. Adjacent resources mentioned during discovery (data source for maps).
- Gap vs neighbours: the catalogue has no source for elevation data. Paired with `gdal` (above), it gives a scripted bounds → DEM → hillshade path for terrain fly-overs and relief maps.
- Route: native-cli-or-scripting
- Licence: Apache-2.0 for the tool. Each dataset's provider terms and attribution requirements apply. GLO-30/90 need an Earth Data Hub key in `~/.netrc`.
- Version: 2.1.0 on PyPI, uploaded 2026-11-09 (Python ≥ 3.11).
- Stars: 356. Last push: 2026-11-15.
- Install: `brew install gdal && uv tool install elevation`.
- Caveats: it needs GDAL's command-line tools (GDAL ≥ 3.8 for some products). It downloads from the network, so a fixture should cache or pin tiles. It refuses requests over 25 tiles unless told otherwise. Upstream datasets can be revised, so record the product and date.
- Found via: GitHub topic search `dem`.

### Genesis (`genesis-world`) — niche-keep-in-mind
- [x] triage: defer
- Triage reason (2026-11-27): needs PyTorch and heavy setup; no concrete VCR job yet. Revisit when a physics-sim brief needs it.
- URL: https://github.com/Genesis-Embodied-AI/Genesis
- Role: a Python physics platform with rigid-body, MPM, SPH, FEM, PBD (cloth) and IPC solvers, plus its own renderers exposed as cameras.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: it could cover snow, sand, cloth and elastic solids in one API, where `pymunk`, `rapier` and `splishsplash` cover single domains.
- Route: library-or-runtime
- Licence: Apache-2.0 (the repository says so; the PyPI licence field is empty).
- Version: 1.4.7 on PyPI, uploaded 2026-11-17 (Python ≥ 3.12, < 3.15). The GitHub releases section is empty.
- Stars: about 30.3k. Last push: unverified.
- Install: `uv pip install genesis-world` plus PyTorch. The README has an Apple Silicon step using PyTorch MPS.
- Caveats: aimed at robotics, and a heavy dependency stack. Whether macOS arm64 runs every solver, whether headless rendering and frame or mesh export work, and whether results are deterministic are all unverified. Assess only if PBD and Warp fall short.
- Found via: gap search (simulation beyond rigid bodies).

### zpup (`zpup`) — niche-keep-in-mind
- [x] triage: defer
- Triage reason (2026-11-27): 11 days old, one author, API still moving, overlaps heerich. Revisit after stable releases.
- URL: https://github.com/rxolve/zpup
- Role: describe a small flat-shaded pseudo-3D scene as JSON, then `renderSvg(scene)` returns a static SVG from any angle without a DOM. `renderSpinSvg` makes a SMIL turntable. An MCP server ships as `@zpup/mcp`.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: it gives a Zdog-like look (Zdog itself has not been pushed since 2023) as JSON, so an agent can write a scene without code. It is much lighter than `three-js` for isometric icons. `heerich` and the earlier `isometric-js` lead are 2D-only.
- Route: library-or-runtime
- Licence: MIT.
- Version: unverified (`@zpup/core` on npm). The repository was created 2026-11-16.
- Stars: 25. Last push: 2026-11-20.
- Install: `pnpm add @zpup/core`.
- Caveats: a week old with one author, so let it mature before assessing. It returns pure SVG strings, so output should be deterministic. For general animation, render stills at different `rotate` values; the SMIL spin does not seek frame by frame without a browser.
- Found via: Show HN (past 7 days, hn.algolia.com).

### CDAF (`cdaf`) — niche-keep-in-mind
- [x] triage: defer
- Triage reason (2026-11-27): git-only install, early project, unclear VCR job. Revisit if it ships a release.
- URL: https://github.com/UditAkhourii/cdaf
- Role: an open plain-text sidecar format (`.cdaf` next to the video, keyed by SHA-256 and byte size), plus a CLI and agent skill. The file holds a summary, timestamped segments, a transcript, on-screen text and tags, so agents do not re-analyse the same footage.
- Category: Discovery: research candidates (agent-facing visual review).
- Gap vs neighbours: `pyscenedetect` and `whisperx` produce the raw cuts and transcript. CDAF is a format for keeping one description per media file and detecting when it is stale. The idea is relevant to VCR's render manifests and findings even if the tool is not adopted.
- Route: remote-api (generation uses the Gemini API by default. A `--local` mode is mentioned with few details. Read, validate and status need no API.)
- Licence: MIT.
- Version: spec v1.0. No tagged release and no PyPI package yet (install from git).
- Stars: 226. Last push: 2026-08-28.
- Install: `uv tool install "cdaf[generate] @ git+https://github.com/UditAkhourii/cdaf.git#subdirectory=cli"`.
- Caveats: model-generated descriptions are not deterministic. Gemini terms apply to generated content. The project has 15 commits and no activity since late August.
- Found via: GitHub topic search `sidecar`.

## Seen but rejected
- metafizzy/zdog — inactive; last push 2023-07-18 (zpup above is the active neighbour).
- golanlevin/p5-single-line-font-resources — useful archive of 150+ single-stroke fonts, but no repository licence and mixed per-font terms, including CC BY-NC-SA; Hershey text already comes through `vpype`/`vsketch`.
- crocone/motigen — two weeks old, no stars; a browser-frames-to-MP4 runner that overlaps `hyperframes` and the Playwright capture path.
- EdwardGlockner/rumblex — one day old, 5 stars; a word-timestamp and subtitle tool tied to one hosted ASR model; `whisperx` and `stable-ts` cover it.
- toddynho/chartkit — 13 stars, no description; JSON charts are already covered by `vl-convert`.
- jinleili/simuverse — a wgpu and egui GUI app, not a headless library.
- GlacioHack/xdem — DEM analysis (co-registration, uncertainty); `gdaldem` already covers hillshade for motion work.
- mapriot/massif, watergis/dem2terrainrgb, joe-akeem/contour-tiles — thin wrappers that build Terrain-RGB or contour tiles on top of GDAL; revisit only if `gdal` is catalogued and tile output is needed.
- fitodic/centerline — last release 2024-05-26; niche polygon centreline.
- Pantani/tdmcp — MCP server for TouchDesigner, which is proprietary.
- AcademySoftwareFoundation/OpenCue, aws-deadline — render-farm management, far beyond a single-machine VCR render.
- micr0-dev/Altbot — AGPL Fediverse bot; generating alt text is not a pipeline tool.
- Cloth topic results (Unity and GTA mod tools, Velvet CUDA cloth) — engine-bound or CUDA-only.
- Show HN this week: Drisp, Shotspa, Klistra, appeventor (hosted or proprietary app-preview and screenshot services); Curve (SVG editor PWA, not headless).

## Method notes
- Unattended run, the fifth in W47 (earlier W47 digests: 2026-11-18 to 11-21). No `discovery/` PR was open. The earlier W47 branches (`discovery/2026-W47` and dated `-2026111x` branches) already exist, so this run uses `discovery/2026-W47-20261122`.
- GitHub repository search (`gh api search/repositories`) worked: about 27 queries. Per-repository and release API calls returned 403 (outside the session's scope), so versions come from PyPI, npm, the Homebrew formula API and project pages, and some stars and push dates are marked unverified.
- Show HN (past 7 days) via hn.algolia.com worked after URL-encoding the numeric filter: 400 posts were scanned with a keyword filter.
- Not run this time: reverse dependencies, stargazer overlap, Homebrew new formulae and Changelog Nightly. Earlier W47 runs covered the Homebrew feed and stargazer passes.
- Topics with no repositories in range: `hillshade`, `l-system`, `frame-cache`, `reduced-motion`, `perceptual-hash`. The gap areas, accessibility (`alt-text`, `reduced-motion`) and provenance (`invisible-watermark`, `sidecar`), produced no strong new tool beyond CDAF.
- Over budget: about 51 calls against a budget of about 40.
- Deduped against the 205 `catalog/tools` records, 25 `catalog/retired` records and all 18 earlier digests on main.
- Unverified: GDAL stars and push date; whether `warp.sim` is still in Warp; whether pyPBD builds on macOS arm64; Genesis on macOS and headless; the zpup npm version.
