---
type: discovery-digest
run_date: 2026-11-02
iso_week: 2026-W45
topics: [sdf, wgsl, shaders, motion-graphics, ffmpeg, exif, xmp, openstreetmap, pmtiles, ios-simulator, device-frames, cloth-simulation, soft-body, taichi, subtitles, gltf, audio-analysis, terminal-recording, pen-plotter]
seeds: []
searches_used: 36
---
# Discovery leads — 2026-11-02

Summary line: 8 leads (1 in a new category; 2 more join categories proposed in the 2026-11-01 digest).

Stars, last push and licence come from GitHub repository search (unauthenticated API). Per-repo API calls (releases, READMEs) are blocked by session scope, so GitHub release dates, install commands and determinism caveats are "unverified". Where a package registry (PyPI / npm) answered, that version is given and labelled.

## Leads

### node-av (`node-av`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/seydx/node-av
- Role: FFmpeg bindings for Node.js with low-level and high-level APIs, including hardware acceleration; in-process decode/encode/filter without spawning `ffmpeg`.
- Category: media (existing); neighbours in the encode/mux path.
- Gap vs neighbours: `ffmpeg-ffprobe` is CLI-only, `ffmpeg-wasm` is slow and sandboxed, `mediabunny` is WebCodecs-based. Native in-process FFmpeg from a Node render loop is not catalogued.
- Route: library-or-runtime
- Licence: MIT (GitHub and npm agree)
- Version/date: npm 6.2.0 (release date unverified)
- Stars: 387. Last push: 2026-11-01
- Install: `pnpm add node-av` (prebuilt macOS arm64 binaries unverified)
- Caveats: FFmpeg build flags and bundled codecs (GPL parts?) unverified; encoder determinism follows FFmpeg.
- Found via: GitHub topic search `ffmpeg-wrapper`.

### typed-ffmpeg (`typed-ffmpeg`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/lucemia/typed-ffmpeg
- Role: type-safe Python and TypeScript builders for FFmpeg filtergraphs, with filter docs and typing; compiles to a plain `ffmpeg` command line.
- Category: media (existing)
- Gap vs neighbours: `ffmpeg-ffprobe` leaves filtergraph authoring to hand-written strings, which is the common agent failure. A typed builder narrows that.
- Route: library-or-runtime
- Licence: MIT (GitHub); PyPI licence field empty
- Version/date: PyPI 4.6.2 (date unverified)
- Stars: 1164. Last push: 2026-10-29
- Install: `uv add typed-ffmpeg` (expected)
- Caveats: needs a system FFmpeg; the TypeScript package's maturity is unverified.
- Found via: GitHub topic search `ffmpeg-wrapper`.

### sdf (`fogleman-sdf`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/fogleman/sdf
- Role: signed-distance-function mesh generation in Python; compose primitives and boolean ops, then mesh to STL.
- Category: 3d / procedural modelling (existing)
- Gap vs neighbours: `build123d` is B-rep CAD; `trimesh` handles meshes but doesn't generate organic implicit shapes. Not a replacement for either.
- Route: library-or-runtime
- Licence: MIT
- Version/date: unverified (a PyPI package named `sdf` shows 0.3.8; not confirmed to be this repo)
- Stars: 2019. Last push: 2026-09-30
- Install: unverified (`pip install` from git is the documented route, to be checked)
- Caveats: marching cubes on a regular grid, so deterministic given the same inputs; meshes can be heavy. STL only, no UVs or colour.
- Found via: GitHub topic search `sdf`.

### Shader Park (`shader-park-core`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/shader-park/shader-park-core
- Role: JavaScript-to-shader language for raymarched SDF scenes, with a three.js integration.
- Category: shaders (existing)
- Gap vs neighbours: `glslify` and `three-js-shading-language` need shader knowledge. Shader Park offers a higher-level JS surface for SDF art.
- Route: library-or-runtime
- Licence: MIT on GitHub, Apache-2.0 on npm — discrepancy to resolve
- Version/date: npm 0.2.8 (date unverified)
- Stars: 831. Last push: 2026-10-05
- Install: `pnpm add shader-park-core`
- Caveats: time uniform is driven by the page; seekability needs an explicit clock override. Unverified.
- Found via: GitHub topic search `sdf`.

### CrossTL (`crosstl`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/CrossGL/crosstl
- Role: translator for shaders and compute kernels between GLSL, HLSL, Metal, SPIR-V and Slang.
- Category: shaders (existing)
- Gap vs neighbours: `libplacebo` and `glslify` don't translate between shader languages. Helps port a WGSL/GLSL sketch to a target backend.
- Route: native-cli-or-scripting (Python CLI and library)
- Licence: Apache-2.0
- Version/date: PyPI 3.5.0 (date unverified)
- Stars: 1814. Last push: 2026-11-01
- Install: `uv add crosstl` (expected); output correctness across backends is unverified
- Caveats: young project; translation fidelity for non-trivial shaders unverified. WGSL is not confirmed as a target.
- Found via: GitHub topic search `wgsl`.

### Exiv2 (`exiv2`) — 🆕 joins proposed category "provenance and metadata" — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/Exiv2/exiv2
- Role: C++ library and `exiv2` CLI to read and write EXIF, IPTC and XMP metadata in images (and some video containers).
- Category: provenance and metadata (new category first proposed 2026-11-01, via `c2pa`)
- Gap vs neighbours: `mediainfo` only reads. Nothing catalogued writes or strips XMP/EXIF on rendered stills. Companion to `c2pa` rather than a replacement.
- Route: native-cli-or-scripting
- Licence: search reports NOASSERTION; believed GPL-2.0-or-later, unverified. Flag before any bundling.
- Version/date: unverified
- Stars: 1170. Last push: 2026-11-01
- Install: `brew install exiv2` (believed available, unverified)
- Caveats: image-focused; video container support is partial. Alternative for read-only multi-format: `drewnoakes/metadata-extractor` (Apache-2.0, 2843 stars, Java).
- Found via: GitHub topic search `xmp`, `exif`.

### Planetiler (`planetiler`) — joins proposed category "maps and geo motion" — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/onthegomap/planetiler
- Role: builds vector tilesets (MBTiles / PMTiles) from OpenStreetMap data, fast, from a single Java jar.
- Category: maps and geo motion (proposed 2026-11-01 via `pmtiles`)
- Gap vs neighbours: produces the basemap data that `pmtiles` serves and MapLibre draws; for a regional extract it avoids hosted tile services and their terms.
- Route: native-cli-or-scripting
- Licence: Apache-2.0 (OSM data itself is ODbL; attribution needed in output)
- Version/date: unverified
- Stars: 2237. Last push: 2026-11-01
- Install: unverified (Java 21 jar or Docker; `brew` formula unverified)
- Caveats: data-prep only; heavy for planet-scale, fine for extracts. Related: `protomaps/basemaps` (768 stars, push 2026-09-11, licence NOASSERTION) supplies styles and a Planetiler-based build.
- Found via: GitHub topic search `openstreetmap`, `pmtiles`.

### sim-use (`sim-use`) — 🆕 new category: app-preview and device capture — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/lycorp-jp/sim-use
- Role: CLI to drive and observe iOS Simulator and Android emulators/devices (tap, type, screenshot), built for agents.
- Category: new category: app-preview and device capture
- Gap vs neighbours: `playwright` captures browsers only. Nothing catalogued records native app UI for app-preview footage.
- Route: native-cli-or-scripting
- Licence: Apache-2.0
- Version/date: unverified
- Stars: 1519. Last push: 2026-10-24
- Install: unverified (needs Xcode simulators, so macOS only)
- Caveats: live capture, not seekable or deterministic; real-time recording would need `xcrun simctl io recordVideo` underneath. Whether it records video, not just stills, is unverified.
- Found via: GitHub topic search `ios-simulator`.

## Seen but rejected
- tapflow, simutil, dsh-ios, device-hub-pro — simulator streaming or control apps, GUI/team-oriented, not capture tooling
- GeoTaichi, RayTracingPBR — GPL-3.0, off-target
- tsoding/markut — niche video-editing DSL, personal workflow tool
- astrofox — desktop GUI, not headless
- veedstudio/open-edit, JimLiu/baocut, anything2explainer, vox-director, huashu-motion, video-talkcraft, herk-edit-kit — agent skills or end-to-end apps rather than tools, several with unclear licences
- native-subtitle-quote-image — agent skill, not a tool
- sassman/t-rec-rs — rejected last week (GPL-3.0)
- MasterSelects — AGPL-3.0 browser editor
- openstreetmap-website, openrouteservice, Vela — apps or servers, GPL
- exifcleaner — GUI
- Blender-FLIP-Fluids, flux, sameer/svg2gcode, GRBL-Plotter, p5.plotSvg — already rejected last week
- SPlisHSPlasH, splashsurf, c2pa, vsketch, pmtiles — already reported or catalogued-adjacent; nothing materially changed
- letsseal — already rejected last week

## Method notes
- Unattended run. GitHub repo search worked; per-repo API (releases, READMEs) is blocked outside conorluddy/vcr, as last week, so release dates, install commands and caveats are mostly unverified. PyPI and npm registry lookups worked.
- Not done: reverse-dependency, stargazer-overlap and feed (Homebrew, Show HN) sweeps; WebSearch/WebFetch were not used.
- Searches returning nothing: cloth-simulation, soft-body, app-preview, flash-detection, content-credentials (beyond letsseal), headless-rendering.
- Seeds were not used this week; dedupe covered all 146 catalogue ids, the 2026-11-01 digest on main, and open PRs (only #37, not a discovery branch).
- The 2026-W44 digest dated 2026-11-01 was one day old; this run is the first of ISO week 2026-W45.
