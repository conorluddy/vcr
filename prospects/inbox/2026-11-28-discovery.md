---
type: discovery-digest
run_date: 2026-11-28
iso_week: 2026-W48
topics: [raymarching, path-tracing, ocr, timelapse, video-editing, midi, music-visualization, photogrammetry, mesh-processing, fractal, cellular-automata, msdf, code-screenshot, tikz, volume-rendering, depth-estimation, pose-estimation, gtfs, tessellation, color-quantization, edl, storyboard, pmtiles]
seeds: []
searches_used: 34
---
# Discovery leads — 2026-11-28

Summary line: 12 leads (0 in new categories).

This is the sixth W48 run. The earlier W48 digests (2026-11-23 to 2026-11-27) are merged and no `discovery/` PR is open. This run swept 23 GitHub topics that no earlier digest had used; they returned almost nothing new that fits, and only `ocrs` comes from them. The other leads come from the method of the last two runs: a list of about 250 established tools in the gap areas was grepped against every `catalog/tools` record, every `catalog/retired` file and every inbox digest, and only names with zero hits were kept. Several leads are larger than long-tail size; each is listed because it fills a named gap.

## Leads

### BudouX (`budoux`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/google/budoux
- Role: a small machine-learned line-break segmenter for Japanese, Simplified and Traditional Chinese and Thai. It splits a sentence into phrases so that on-screen text wraps between phrases and not inside a word. JS, Python and Java libraries plus a CLI.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `hyphenopoly` hyphenates Latin-script languages and `palt-typesetting` adjusts Japanese spacing; neither decides where a CJK or Thai title may break. `pseudo-localization` tests expansion, not wrapping. This is the missing step for localised titles and captions in those languages.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: 0.10.4 on npm and PyPI, 2026-11-16.
- Stars: 1,811. Last push: 2026-11-27.
- Install: `pnpm add budoux` or `uv pip install budoux`
- Caveats: the model ships inside the package, so output is fixed for a pinned version; a version bump can move breaks. It returns phrases only: the scene still measures and wraps. Korean is not listed among the supported languages (unverified).
- Found via: localisation of on-screen text (lower-priority gap), absence check.

### DrawBot (`drawbot`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/typemytype/drawbot (site https://www.drawbot.com)
- Role: a macOS Python drawing environment from the type-design community, usable as a plain module with no app (`import drawBot`). It draws with CoreText and CoreGraphics, so variable-font axes and OpenType features are set per text run, and it exports PDF, SVG, PNG, animated GIF and MP4 from a multi-page script.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `drawsvg` and `generativepy` draw from Python but leave text shaping to the rasteriser; `fonttools` and `harfbuzz` inspect and shape but do not draw. DrawBot is the one Python route where variable-font animation (one page per frame, axis value as a function of the frame) is a first-class job.
- Route: library-or-runtime
- Licence: unverified (GitHub reports NOASSERTION; no `LICENSE.txt` at the path checked).
- Version: Homebrew cask `drawbot` 3.132 (the app). The module has no PyPI release; it installs from the repository. Release date unverified.
- Stars: 456. Last push: 2026-07-24.
- Install: `uv pip install git+https://github.com/typemytype/drawbot` (Python 3.11+, per the README), or `brew install --cask drawbot` for the app.
- Caveats: macOS only. Text rendering comes from the system's CoreText, so glyph output can change between macOS versions; pin fonts by file with `installFont`. Its MP4 export uses its own encoder path; export PNG pages and encode with `ffmpeg` for a controlled result. Installing from a git URL needs a pinned commit.
- Found via: typography area, absence check.

### Leonardo (`leonardo-contrast-colors`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/adobe/leonardo
- Role: Adobe's library that generates colour scales from key colours and a list of target contrast ratios against a background, so each swatch in a palette meets a stated WCAG ratio by construction.
- Category: A6. Image processing and colour.
- Gap vs neighbours: `color-js` and `colour-science` convert colours and measure difference or contrast after the fact. Leonardo works the other way: give it the ratio a caption or label must reach and it returns the colour. That suits the accessibility gap (text contrast planned, not just checked).
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: `@adobe/leonardo-contrast-colors` 1.1.0, 2026-02-18.
- Stars: 2,201. Last push: 2026-07-08.
- Install: `pnpm add @adobe/leonardo-contrast-colors`
- Caveats: pure calculation, so deterministic. Targets WCAG 2 ratios by default; an APCA option exists in the docs (unverified here). A ratio on a flat background says nothing about text over moving imagery.
- Found via: accessibility gap (wcag contrast), absence check.

### ocrs (`ocrs`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/robertknight/ocrs
- Role: a Rust OCR library and CLI that reads text from an image and writes plain text, JSON with layout information, or an annotated PNG showing detected words and lines.
- Category: A12. Captions, accessibility and provenance.
- Gap vs neighbours: `odiff` and `dssim` compare pixels; nothing in the catalogue reads the words back out of a rendered frame. That allows a machine check that a title, caption or legal line in the frame matches the script, and that text survived a small-size export.
- Route: native-cli-or-scripting
- Licence: Apache-2.0 and MIT (code). Model and training-data licence unverified; the README points to a separate `ocrs-models` repository.
- Version: `ocrs-cli` 0.14.0, 2026-11-08 (crates.io).
- Stars: 1,923. Last push: 2026-11-08.
- Install: `cargo install ocrs-cli --locked` (no Homebrew formula).
- Caveats: Latin alphabet only, per the README. Models download to `~/.cache/ocrs` on first run, so pin and cache them for an offline or repeatable check. Stylised display type and text over busy backgrounds will misread; treat a mismatch as a prompt to look, not a failure. Whether the JSON carries bounding boxes is unverified.
- Found via: `ocr` topic search (agent-facing visual review, lower-priority gap).

### Maestro (`maestro`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/mobile-dev-inc/Maestro
- Role: a UI automation tool for iOS simulators and Android devices that runs a YAML flow (launch, tap, type, scroll, assert) from the command line.
- Category: A5. Video, capture and delivery.
- Gap vs neighbours: `baguette` and `scrcpy` record the screen and `frames-cli` frames the result, but nothing in the catalogue drives the app. A scripted flow makes an app-preview take repeatable: the same taps at the same points on every run.
- Route: native-cli-or-scripting
- Licence: Apache-2.0.
- Version: unverified (no Homebrew core formula; GitHub release feeds were not reachable).
- Stars: 16,541. Last push: 2026-11-27.
- Install: unverified. The current install page documents only the Maestro Studio desktop app (`MaestroStudio.dmg`); the CLI install command was not confirmed from a primary source in this run.
- Caveats: mainstream, not a long-tail find; listed for the app-preview gap. Timing depends on the simulator, so two takes are not frame-identical. Needs Xcode and an installed iOS runtime. A Java runtime requirement and the `record` subcommand are from memory and unverified. Parts of the product (cloud, Studio) are commercial; the CLI is the open-source part.
- Found via: app-preview gap, absence check.

### Observable Plot (`observable-plot`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/observablehq/plot
- Role: a concise grammar-of-graphics charting library by the D3 team. One `Plot.plot({marks: [...]})` call returns an SVG element; with a DOM shim such as jsdom it runs in Node.
- Category: A1. Creative coding and 2D.
- Gap vs neighbours: `d3` gives full control but every axis, scale and legend is hand-built; `vizzu` animates its own chart types; `vl-convert` renders Vega-Lite specs to static files. Plot gives sensible defaults for a still chart or for a per-frame redraw inside a browser scene, with far less code than `d3`.
- Route: library-or-runtime
- Licence: ISC.
- Version: `@observablehq/plot` 0.6.19, 2026-11-05.
- Stars: 5,438. Last push: 2026-11-05.
- Install: `pnpm add @observablehq/plot`
- Caveats: no animation model of its own; transitions between states must be built by redrawing with interpolated data. Check that SVG output is byte-identical across runs (generated clip-path ids). Category is a judgement: the other charting records should be checked and this one filed beside them.
- Found via: data-visualization area, absence check.

### ModernGL (`moderngl`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/moderngl/moderngl
- Role: a Python wrapper over OpenGL core profile with a standalone (windowless) context, so a GLSL shader renders to a framebuffer and reads back to bytes or NumPy with a few lines.
- Category: A3. 3D rendering, shaders and effects.
- Gap vs neighbours: `glslviewer` runs a shader from the CLI and `pygfx` is a wgpu scene graph; `dawn-node-webgpu` covers offscreen WebGPU in Node. Nothing gives a Python script direct offscreen GLSL with uniforms set per frame, which is the short path for a shader pass inside a Python pipeline.
- Route: library-or-runtime
- Licence: MIT.
- Version: 5.13.0 on PyPI, 2026-10-07 (macOS arm64 wheels listed).
- Stars: 2,351. Last push: 2026-11-27.
- Install: `uv pip install moderngl`
- Caveats: macOS caps OpenGL at 4.1 and marks it deprecated, so compute shaders are unavailable there. GPU output is not guaranteed bit-identical across machines or drivers. Whether a standalone context works in a non-GUI session on macOS arm64 needs a fixture.
- Found via: shaders area, absence check.

### OSMnx (`osmnx`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/gboeing/osmnx
- Role: a Python package that downloads street networks, building footprints and other OpenStreetMap features for a place name, point or polygon and returns them as graphs or GeoDataFrames, ready to save as GeoJSON or plot as a figure-ground map.
- Category: A11. Maps and geodata.
- Gap vs neighbours: `gdal`, `mapshaper` and `tippecanoe` convert geodata that already exists; `chiitiler`, `maplibre-native` and `mapnik` render it; `elevation-eio` fetches heights. Nothing fetches the vector features for a named place. OSMnx also computes routes along the network, which is the usual source for an animated route line.
- Route: library-or-runtime
- Licence: MIT (code). Data is OpenStreetMap, ODbL, with an attribution requirement on the finished video.
- Version: 2.2.0 on PyPI, 2026-11-18.
- Stars: 5,914. Last push: 2026-11-18.
- Install: `uv pip install osmnx`
- Caveats: it queries the public Overpass API, so results change as OSM is edited and the service rate-limits. Fetch once, save the GeoJSON with a hash, and render from the saved file. Mainstream in its field, not long-tail.
- Found via: maps gap (openstreetmap), absence check.

### PyAV (`pyav`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/PyAV-Org/PyAV
- Role: Python bindings to FFmpeg's libraries. Decodes and encodes in-process, giving frames as NumPy arrays or PIL images with exact timestamps, and ships wheels with FFmpeg built in.
- Category: A5. Video, capture and delivery.
- Gap vs neighbours: `typed-ffmpeg` builds FFmpeg command lines from Python; `node-av` is the in-process binding for Node. Python has no in-process route in the catalogue, so a Python tool that needs frame N of a clip, or that writes frames straight to an encoder, shells out and pipes.
- Route: library-or-runtime
- Licence: BSD-3-Clause (bindings). The bundled FFmpeg in the wheels carries its own licence terms (LGPL or GPL depending on build; unverified).
- Version: `av` 19.0.2 on PyPI, 2026-10-21 (macOS arm64 wheels listed).
- Stars: 3,351. Last push: 2026-11-27.
- Install: `uv pip install av`
- Caveats: the wheel's FFmpeg is not the Homebrew one, so encoder availability and output can differ from the `ffmpeg` record's results; pin the wheel version. Seeking lands on keyframes unless the code decodes forward to the target timestamp.
- Found via: video-processing area, neighbour of `node-av` and `typed-ffmpeg`.

### skia-python (`skia-python`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/skia-python/skia-python
- Role: Python bindings to Skia. A CPU raster surface draws paths, gradients, text and image filters and writes PNG, with no browser and no GPU.
- Category: A1. Creative coding and 2D.
- Gap vs neighbours: `canvaskit-skia` and `skia-canvas` give Skia to Node only. Python drawing in the catalogue goes through SVG (`drawsvg`) or Cairo (`generativepy`); Skia adds blend modes, image filters and runtime shaders to a Python frame loop.
- Route: library-or-runtime
- Licence: BSD-3-Clause.
- Version: 144.1 on PyPI, 2026-10-20 (macOS arm64 wheels listed).
- Stars: 333. Last push: 2026-11-21.
- Install: `uv pip install skia-python`
- Caveats: text uses fonts found through the platform font manager unless a typeface is loaded from a file, so load fonts explicitly. CPU raster should repeat exactly for a pinned wheel; check with a fixture. Version numbers follow Skia milestones and the API moves with them.
- Found via: 2D drawing area, neighbour of `canvaskit-skia` and `skia-canvas`.

### DiceBear (`dicebear`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/dicebear/dicebear
- Role: an avatar library that turns a seed string into an SVG avatar in one of about thirty styles, the same seed always giving the same picture. JS library, CLI and HTTP API.
- Category: A13. Reference data and asset sources.
- Gap vs neighbours: `iconify` supplies icons and `openverse-api` finds real photographs. Mock interfaces in explainer and app-preview scenes need placeholder people (chat rows, comment threads, team grids) without using a real person's face; nothing in the catalogue supplies them.
- Route: library-or-runtime
- Licence: MIT (code). Each avatar style has its own licence, several of them CC BY 4.0 with attribution; check the style before use.
- Version: `@dicebear/core` 11.0.0, 2026-11-25.
- Stars: 10,159. Last push: 2026-11-25.
- Install: `pnpm add @dicebear/core @dicebear/collection`
- Caveats: seed-to-image mapping is stable within a major version and may change across majors (11.0.0 is three days old), so pin it. Use the library, not the HTTP API, to keep renders offline.
- Found via: asset-source area, absence check.

### bwip-js (`bwip-js`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/metafloor/bwip-js
- Role: a JavaScript barcode writer covering over 100 symbologies, QR Code included, that outputs SVG or PNG from Node, the browser or its CLI.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: no catalogue record generates a QR code. An end card with a scannable link is a common call to action, and an SVG code composes into any scene and rasterises through `resvg`.
- Route: library-or-runtime
- Licence: MIT.
- Version: 4.11.4 on npm, 2026-08-19.
- Stars: 2,431. Last push: 2026-08-19.
- Install: `pnpm add bwip-js`
- Caveats: deterministic for fixed input and options. A code in video must stay on screen long enough and large enough to scan, with a quiet zone, and must survive the platform's re-encode; that is a delivery check, not something this tool does.
- Found via: end-card need, absence check.

## Seen but rejected
- three-gpu-pathtracer — the R3F wrapper is already catalogued (`react-three-gpu-pathtracer`) and names this library as its engine; a separate record adds little.
- color-thief (3.5.0, 2026-08-02) and node-vibrant — palette extraction from an image; `imagemagick` colour quantisation already covers it. Revisit if the inspiration library needs a measured palette in Node.
- simplex-noise (npm) — seeded noise, but no release or push since 2024-07-26.
- pure-rand — seeded PRNG (8.4.2, 2026-07-10, MIT, 122 stars); small enough to be a dependency choice inside a scene, not a catalogue record.
- ssimulacra2 — `rust-av/ssimulacra2_bin` is archived and the `ssimulacra2_rs` crate dates from 2024-06-13; libjxl, which ships the reference tool, was rejected on 2026-11-27.
- Av1an — chunked AV1 encoding with a quality target (Homebrew 0.6.0, GPL-3.0-only); `ab-av1` and `svt-av1` cover the need.
- DawDreamer — Python offline DAW rendering (0.9.0, GPL-3.0); overlaps `pedalboard`.
- earcut — polygon triangulation; a low-level dependency that `three-js` already bundles.
- abcjs, LilyPond — notation rendering; `verovio` and `opensheetmusicdisplay` cover it.
- KaTeX, Temml — TeX maths; `mathjax` covers it.
- Planck.js, cannon-es, ammo.js — physics engines; `box2d`, `rapier`, `matter-js` and `jolt-physics-js` cover the need.
- shot-scraper, capture-website, pageres — web screenshot CLIs; `playwright` covers them.
- pa11y, axe-core — web-page accessibility audits, not video.
- py-staticmaps, folium, contextily — static or notebook maps; `osm-static-maps` and `chiitiler` cover rendering.
- pmp-library, geogram, MeshLib, trueform, pyacvd — mesh processing; `manifold`, `trimesh` and `meshoptimizer` cover the catalogue's needs.
- LuxCoreRender, c-ray, fresnel — offline path tracers; `mitsuba-3`, `pov-ray` and `blender-background` cover the need.
- cobanov/depth2normal — depth map to normal map CLI (116 stars); narrow, and `depth-anything-v2` plus an image tool does it.
- gtfs-to-geojson — transit routes to GeoJSON; useful only for a transit-map scene. Revisit with one.
- Homebrew new formulae, 2026-11-20 to 2026-11-28 (meow, apicula, dezoomify-cli, oscar64, jotter and others) — none relevant.
- The `video-editing` and `storyboard` topics returned mostly AI short-drama generators and agent skill packs; none is a deterministic, scriptable tool.

## Method notes
- GitHub repository search worked through `gh api search/repositories`; 23 topic queries (stars 50..3000, pushed after 2026-08-30, not archived) plus two batched `repo:` queries for stars, last push, licence and archived flags. Results were filtered by a case-insensitive grep of each repository name against the concatenated `catalog/tools/*.json`, `catalog/retired/*` and `prospects/inbox/*.md`.
- Release dates come from npm, PyPI, crates.io and the formulae.brew.sh JSON API. GitHub release feeds were not queried (403 in earlier runs), so Maestro's version is unverified.
- Show HN (hn.algolia.com, past 8 days, over 15 points) returned nothing relevant. Homebrew new formulae came from a commit search on `Homebrew/homebrew-core`.
- Not run: reverse-dependency graphs (deps.dev, libraries.io) and stargazer overlap, because REST calls to repositories outside `conorluddy/vcr` are denied in this environment. `seeds` is empty for that reason.
- Unverified items are marked in place: DrawBot's licence, Maestro's CLI install command, version, Java requirement and `record` subcommand, the ocrs model licence and JSON contents, BudouX Korean support, Leonardo's APCA option, and the FFmpeg licence inside PyAV wheels.
