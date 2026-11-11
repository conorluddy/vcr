---
type: discovery-digest
run_date: 2026-11-11
iso_week: 2026-W46
topics: [creative-coding, generative-art, typesetting, data-visualization, cad, parametric-design, gltf, map-animation, globe, screen-recording, app-preview, content-credentials]
seeds: [resvg]
searches_used: 46
---
# Discovery leads — 2026-11-11
Summary line: 10 leads (0 in new categories; 3 join categories proposed in earlier digests). First W46 run. The W45 digests already covered the gap areas closely, so the strongest finds here are in core areas: headless chart, typesetting and diagram rendering that needs no browser.

## Leads
### VlConvert (`vl-convert`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/vega/vl-convert
- Role: converts Vega-Lite and Vega chart specs to SVG, PNG, JPEG, PDF or HTML from a CLI, a Python package or a Rust crate, with no browser and no Node (Vega runs in an embedded V8). Also converts SVG to PNG/JPEG/PDF.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `d3` needs a browser capture (`playwright`) to produce a still; `mermaid-cli` and `graphviz` draw diagrams, not data charts. This gives a declarative JSON chart spec a direct route to SVG, which `resvg` or the browser can then take further. It is built on `resvg`.
- Route: native-cli-or-scripting.
- Licence: BSD-3-Clause.
- Version: 1.9.0 stable on crates.io (date unverified); 2.0.0-rc7 published 2026-09-14. PyPI `vl-convert-python` 1.9.0.post1, 2026-01-21, ships a macOS arm64 wheel.
- Stars: 172. Last push: 2026-11-01.
- Install: `uv add vl-convert-python` or `cargo install vl-convert --locked`. No Homebrew formula seen.
- Caveats: stills only, so animated charts would need one spec per frame. Specs can pull remote data, images and Google Fonts unless restricted; local files are blocked by default (`allowed_base_urls`). Pin fonts locally for reproducible output; font handling was not read in detail. 2.0 is still a release candidate.
- Found via: reverse dependencies of `resvg` on crates.io (`vl-convert-rs`).

### Typst (`typst`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/typst/typst
- Role: markup-based typesetting system with a single-binary CLI that compiles documents to PDF, PNG or SVG (output formats from prior knowledge of the project, not re-read this run).
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `satori` lays out simple cards from JSX and `opentype-js` works at glyph level; nothing catalogued does paragraph-quality text, maths and tables as scripted stills. `sile` (2026-11-01 digest) is the nearest inbox neighbour; Typst is far more widely used and compiles faster.
- Route: native-cli-or-scripting.
- Licence: Apache-2.0.
- Version: `typst-cli` 0.15.1, 2026-07-17 (crates.io).
- Stars: 57,119, well outside the 50–3000 band. Reported anyway because it is not catalogued and has never appeared in the inbox. Last push: 2026-11-06.
- Install: `cargo install typst-cli --locked`. `brew install typst` is unverified this run (formulae.brew.sh unreachable).
- Caveats: static output only; animation means compiling one page or one input value per frame. Reproducible output needs pinned fonts and a fixed creation date. Packages download from the Typst registry on first use.
- Found via: GitHub topic search (typesetting) surfaced Typst tooling; `typst-render` also depends on `resvg`.

### mermaid-rs-renderer (`mermaid-rs-renderer`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/1jehuang/mermaid-rs-renderer
- Role: native Rust renderer for Mermaid diagrams (23 diagram types) to SVG or PNG; CLI `mmdr`, no browser.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `mermaid-cli` launches headless Chromium for every render. This removes the browser from the diagram path, which matters for batch variants and sandboxed runs.
- Route: native-cli-or-scripting.
- Licence: MIT.
- Version: 0.3.1, 2026-07-06 (crates.io).
- Stars: 1,820. Last push: 2026-10-04.
- Install: `cargo install mermaid-rs-renderer`, or `brew tap 1jehuang/mmdr && brew install mmdr`.
- Caveats: the README says it is in early development and output "may not yet match mermaid-cli in all cases". Layout differs from upstream Mermaid, so a diagram should not move between the two renderers mid-project.
- Found via: reverse dependencies of `resvg` on crates.io.

### three-globe (`three-globe`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/vasturiano/three-globe
- Role: a globe as a Three.js object with data layers: points, arcs, polygons, paths, hex bins, heatmaps, tiles, rings, labels and custom objects.
- Category: maps and geo motion (proposed 2026-11-01 via `pmtiles`); otherwise A3. 3D, shaders and effects.
- Gap vs neighbours: `deck-gl` is the catalogued geo layer stack but is heavier and map-first; `three-js` alone has no geographic layers. This drops into an existing `three-js` scene and capture route. `maplibre-native` (inbox) covers flat vector maps, not a data globe.
- Route: library-or-runtime.
- Licence: MIT.
- Version: 2.45.6, 2026-10-14 (npm).
- Stars: 1,659. Last push: 2026-10-14.
- Install: `pnpm add three-globe three`.
- Caveats: arc and path dashes, layer transitions and rings run on wall-clock time. They can be switched off (`arcDashAnimateTime: 0`, `...TransitionDuration: 0`) or paused, but no documented way to step them from a supplied clock was found, so a seekable scene must drive its own animation. Globe textures, tiles and the default label typeface are fetched by URL and need vendoring.
- Found via: GitHub topic search (globe).

### heerich (`heerich`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/meodai/heerich
- Role: small JavaScript engine that builds voxel scenes with boolean operations and renders them to SVG under oblique, isometric, orthographic or perspective cameras.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `three-js` gives raster 3D; `rough-js`, `two-js` and `svg-js` are 2D. Nothing catalogued turns 3D geometry into editable vector output.
- Route: library-or-runtime.
- Licence: MIT.
- Version: 0.21.0, 2026-11-07 (npm).
- Stars: 633. Last push: 2026-11-07.
- Install: `pnpm add heerich`.
- Caveats: `toSVG()` returns a string and is the server-side route; `updateSVG()` needs a DOM. Node use is implied, not stated as tested. Pre-1.0 and created March 2026, so the API may move. Determinism is not stated; nothing random was seen in the API.
- Found via: GitHub topic search (generative-art).

### OSM2World (`osm2world`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/tordanik/OSM2World
- Role: converts OpenStreetMap data into 3D models of buildings, roads and terrain, exported as glTF/GLB, OBJ, POV-Ray or 3D Tiles.
- Category: maps and geo motion (proposed 2026-11-01); otherwise A8. Physics, audio and 3D assets.
- Gap vs neighbours: `planetiler` and `pmtiles` (inbox) make 2D tiles; `3d-tiles-renderer` (inbox) displays 3D tiles but does not make them. This produces real-place geometry that `blender`, `three-js` or `gltf-transform` can take as an asset.
- Route: native-cli-or-scripting.
- Licence: MIT. OpenStreetMap data is ODbL and needs attribution in the finished piece.
- Version: unverified (pre-built releases are on osm2world.org/download, not read this run).
- Stars: 795. Last push: 2026-11-04.
- Install: unverified; a Java application distributed as a pre-built archive. Required Java version unverified.
- Caveats: a command-line tool exists, but headless operation is not confirmed. Textures and models live in a separate default-style repo.
- Found via: GitHub topic search (gltf).

### cadmpeg (`cadmpeg`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/cadmpeg/cadmpeg
- Role: CLI that inspects, measures, diffs and converts native CAD files (Fusion 360, SolidWorks, Inventor, Rhino, FreeCAD, CATIA, IGES, OpenUSD and more) to STEP.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `build123d` and `mayo` (inbox) start from STEP; neither opens a vendor's native file. This is the step before them when a client supplies a `.f3d` or `.sldprt` for a product shot.
- Route: native-cli-or-scripting.
- Licence: Apache-2.0 (docs CC BY 4.0).
- Version: 0.6.11, 2026-11-09 (crates.io).
- Stars: 300. Last push: 2026-11-11.
- Install: `brew install cadmpeg/tap/cadmpeg`.
- Caveats: output is STEP only, so a mesh still needs `mayo` or `build123d`. Support is graded per format and several are at the lowest level (Siemens NX, Creo). Four months old. Whether it depends on Open Cascade is unverified.
- Found via: GitHub topic search (cad).

### agent-screenplay (`agent-screenplay`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/gmpetrov/agent-screenplay
- Role: plays a JSON scenario against a website (Playwright, headless Chromium) or a desktop app and edits the take into an MP4 with cursor smoothing, zooms, callouts and captions; also writes a storyboard PNG per take.
- Category: app-preview and device capture (proposed 2026-11-02 via `sim-use`); otherwise A5. Video and capture.
- Gap vs neighbours: `playwright` captures frames but has no cursor, zoom or callout treatment; `sim-use` (inbox) covers the iOS simulator; `vhs` (inbox) covers terminals. This covers scripted web product demos.
- Route: native-cli-or-scripting (also ships an MCP server).
- Licence: MIT. Bundles `ffmpeg-static`, which is GPL.
- Version: 0.1.7, 2026-11-03 (npm).
- Stars: 109. Last push: 2026-11-10.
- Install: `npx agent-screenplay init` (Node 20+; downloads Chromium).
- Caveats: nine days old with one author. Desktop-app mode needs a real screen and macOS Screen Recording and Accessibility permissions. Records in real time, so it is not frame-seekable. Voice-over is optional and uses paid remote APIs (Cartesia, ElevenLabs). `init` registers an MCP server with installed agents, so read it before running.
- Found via: GitHub topic search (screen-recording).

### sand3d (`sand3d`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/Sandflow-ai/sand3d
- Role: Python library for writing 3D objects as short programs over Blender's `bpy` module, exporting GLB, USD, OBJ, STL, URDF and IFC.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `build123d` is exact B-rep CAD; `blender` is the full application driven by scripts. This is a smaller mesh-modelling API aimed at agent-written code. `mogen` (inbox) is the nearest procedural-asset neighbour.
- Route: library-or-runtime.
- Licence: Apache-2.0.
- Version: 1.6.3, 2026-11-06 (PyPI).
- Stars: 1,772. Last push: 2026-11-10.
- Install: `uv add sand3d` (Python 3.13 or 3.11; no `bpy` wheel for 3.12).
- Caveats: the repo was created on 2026-11-03, so 1,772 stars in eight days says nothing yet about staying power. Headless operation is likely through `bpy` but not confirmed. It pulls the Blender wheel, which is large.
- Found via: GitHub topic search (cad).

### Context Free (`context-free`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/MtnViewJohn/context-free
- Role: `cfdg` CLI that renders images from a context-free shape grammar.
- Category: A1. Creative coding and 2D.
- Gap vs neighbours: `p5-js` and `canvas-sketch` are imperative; this is a declarative grammar that produces recursive, organic forms in a few lines and renders with no browser.
- Route: native-cli-or-scripting.
- Licence: GPL-2.0-or-later (flag: copyleft).
- Version: 3.4.3 (date unverified).
- Stars: 555. Last push: 2026-11-09.
- Install: unverified. A Homebrew formula could not be checked; the README describes a `make` build and an Xcode project.
- Caveats: PNG output is confirmed; SVG and FFmpeg-backed video output are referenced but not verified. Seed control is not covered in the README, so determinism is unverified.
- Found via: GitHub topic search (generative-art).

## Seen but rejected
- Samila — Python generative stills; latest release 1.6 is from July 2025 and it overlaps `vsketch` and `p5-js`.
- noisemaker (noisefactorllc) — shader art engine; the npm package of that name is an unrelated 2020 project and no headless route was found.
- vmprint — deterministic layout engine, but output is paged documents; `typst` covers the need.
- globe.gl — DOM wrapper around `three-globe`; the Three.js object is the better fit for capture.
- openglobus, iTowns, navara — interactive 3D map engines; no bakeable or scripted-capture route seen.
- svg2pdf — archived upstream (July 2026).
- spreet — SVG spritesheets for map styles; too narrow.
- charming, charts-rs — Rust chart libraries; `vl-convert` covers headless charts with a portable spec.
- ztd-charts — six days old, React components first.
- polyfork-catalog — CC BY low-poly GLB index, an asset source and not a tool; one week old, repo licence unclear.
- map-motion (SpaceZephyr) — agent skill tied to a commercial map API; no licence stated.
- FluidCAD, agentcad, SimpleCADAPI, PartCAD, OpenGeometry — code-CAD overlapping `build123d`; none adds a render or export path it lacks.
- MeshLib — mesh processing SDK with a custom licence (terms not read); `trimesh` and `meshoptimizer` cover the need.
- genart-skill, claude-drawing-skill, motion-graphics-agent, drawn-by-code, tdmcp — agent skills or MCP wrappers, not tools.
- screencapturekit-rs — Rust bindings needing a custom app; no CLI.
- Capso, capcap, Shotnix, open-recorder, scrawl, shotcandy — GUI screen recorders and screenshot tools, not scriptable.
- generativeart (Go), gart (Kotlin), L5 (Lua), libprocessing (Rust), fragment — creative-coding frameworks overlapping `p5-js` and `canvas-sketch`.
- silkreel — KiCad board to launch film; single purpose.
- letsseal, florilegium, vivliostyle.js, pagedjs, SILE, vsketch, vpype, t-rec-rs, Mayo, 3DTilesRendererJS, tinygltf, VFX-JS, semiotic, unovis — already reported or catalogued.

## Method notes
- GitHub repository search worked this run; stars, licences and push dates come from it. Twelve topics were searched. `app-preview` and `content-credentials` returned nothing new, and `map-animation` returned one rejected repo.
- GitHub release pages and the releases API were blocked (403), so versions and dates come from npm, PyPI and crates.io. Where a tool is not on a registry (OSM2World, Context Free) the version or date is marked unverified.
- formulae.brew.sh and hn.algolia.com are outside the session's allowed network domains, so the Homebrew new-formulae and Show HN feeds were skipped and Homebrew formulae for Typst and Context Free are unverified. Allowing those two hosts would restore both feeds. Changelog Nightly was not tried.
- Stargazer overlap (step 2c) was not run: only GitHub search is available through the API in this session.
- Reverse dependencies were run for `resvg` only (crates.io, 843 dependants, top 70 by downloads read).
- Roughly 15 further calls failed against blocked hosts and are not counted in `searches_used`.
