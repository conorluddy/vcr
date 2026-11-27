---
type: discovery-digest
run_date: 2026-11-24
iso_week: 2026-W48
topics: [forced-alignment, wave-function-collapse, marching-cubes, embroidery, jpeg-xl, ktx2, timecode, texture-baking, openscad, implicit-modeling, text-shaping, hyphenation, vectorization, pixel-art, ascii-art, sonification, usd, point-cloud-rendering, ttml, cea-608, static-maps, map-rendering, sph, reaction-diffusion, metadata-removal, image-comparison]
seeds: []
searches_used: 44
---
# Discovery leads — 2026-11-24

Summary line: 10 leads (0 in new categories).

This is the second W48 run. The first W48 digest (2026-11-23, PR #233) is merged. This run searched topics no earlier digest lists. Two of them are gap areas: caption standards (TTML, CEA-608) and maps (static maps, map rendering). Three findings stand out. OpenSCAD has no catalogue record, inbox lead or rejection. The catalogue has no forced aligner that times a known script without speech recognition. It also has no hyphenation library. Every lead fits an existing category.

## Leads

### OpenSCAD (`openscad`) — strong candidate
- [x] triage: assess
- URL: https://openscad.org (repository: https://github.com/openscad/openscad)
- Role: a script-only solid modeller (CSG plus extrusion). It has a headless CLI that exports STL, 3MF, OFF, SVG, DXF, PDF and PNG renders with a set camera and image size. Animation runs through the `$t` variable and the `--animate` frame count.
- Category: Discovery: research candidates. This is the category that `build123d` uses.
- Gap vs neighbours: `build123d` (catalogued) is a Python B-rep kernel. OpenSCAD is the widely used text CAD language, and a large body of existing `.scad` models and libraries is written in it. A popular example is BOSL2 (https://github.com/BelfrySCAD/BOSL2, BSD-2-Clause, 2,473 stars, pushed 2026-11-17). Its PNG export renders a preview of a parametric part per frame with no Blender step, which fits exploded views and stepped assemblies. None of the catalogue, the inbox or past rejections mentions it.
- Route: native-cli-or-scripting
- Licence: GPL-2.0, with a linking exception in `COPYING`. GitHub's licence detection reports NOASSERTION.
- Version: the last stable release is 2021.01 (Homebrew cask `openscad`). The development snapshot cask `openscad@snapshot` is at 2026.10.11. Development mostly ships as snapshots, so an evidence record should pin a snapshot.
- Stars: 10,726. Last push: 2026-11-23.
- Install: `brew install --cask openscad@snapshot`. The stable cask is `brew install --cask openscad`.
- Caveats: geometry is a pure function of the script and `$t`, so frames can be sought. PNG preview colours and lighting depend on the version and colour scheme, so pin both. The CLI is inside an app bundle, not on PATH. GUI-free PNG rendering on macOS has not been checked here. The Manifold backend's output differs from CGAL's at edges. Its flags are unverified in this run.
- Found via: GitHub topic search `topic:openscad`, then dedupe against the catalogue and every inbox digest.

### Montreal Forced Aligner (`montreal-forced-aligner`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://montrealcorpustools.github.io/Montreal-Forced-Aligner/ (repository: https://github.com/MontrealCorpusTools/Montreal-Forced-Aligner)
- Role: a command-line tool, built on Kaldi, that aligns a known transcript to audio. It gives word-level and phone-level timings.
- Category: Speech and lyric alignment. This is the category `syncalong` uses.
- Gap vs neighbours: `whisperx` and `whisper-cpp` transcribe first and then time what they heard. When a narration script is final, MFA times the exact words of the script, with phone-level timings, which suits lip-flap or per-syllable kinetic type. `syncalong` targets lyrics. `ttconv` and `caption-checker` take timed text as input and do not create it.
- Route: native-cli-or-scripting
- Licence: MIT. The licences of the pretrained acoustic models and dictionaries it downloads are unverified, and each needs checking.
- Version: 3.4.4, on PyPI and conda-forge, released 2026-11-16.
- Stars: 1,919. Last push: 2026-11-16.
- Install: `conda install -c conda-forge montreal-forced-aligner`. conda-forge has an osx-arm64 build. On PyPI the package also needs Kaldi binaries.
- Caveats: it outputs Praat TextGrid by default; whether it also writes JSON is unverified. Caption files need a converter step. Results are deterministic for a fixed model and version. It depends on conda.
- Found via: GitHub topic search `topic:forced-alignment`.

### imscJS (`imscjs`) — strong candidate
- [x] triage: assess
- URL: https://github.com/sandflow/imscJS (npm: `imsc`)
- Role: a reference JavaScript renderer for IMSC (the TTML subtitle and caption profile). `fromXML` parses a document. `generateISD(tt, offset)` resolves it at any time offset. `renderHTML` draws that state into a DOM element.
- Category: Caption compliance. This is the category `caption-checker` uses.
- Gap vs neighbours: `ttconv` (catalogued, from the same Sandflow authors) converts caption formats but draws nothing. Nothing in the catalogue renders standards-conformant IMSC styling (regions, roll-up, forced display) inside a VCR browser scene. Because `generateISD` takes any offset, a capture can seek to a frame time with no playback clock. That is how a burnt-in caption preview or a delivery check would look exactly as an IMSC player draws it.
- Route: library-or-runtime
- Licence: BSD-2-Clause.
- Version: `imsc` 2.0.0, published to npm on 2026-10-21.
- Stars: 92. Last push: 2026-11-20.
- Install: `pnpm add imsc`
- Caveats: rendering is HTML and CSS, so final pixels depend on Chromium's font fallback, which needs pinned fonts. Roll-up mode keeps state from the previous ISD, so for seek-driven capture either render without roll-up or pass the previous state explicitly. Version 2.0.0 is new, and its migration notes are unverified.
- Found via: GitHub topic search `topic:ttml`, a caption standards gap area.

### ctc-forced-aligner (`ctc-forced-aligner`) — worth cataloguing
- [x] triage: defer
  Default weights are CC-BY-NC-4.0 and 1.26 GB; revisit with a free checkpoint under 1 GB.
- URL: https://github.com/MahmoudAshraf97/ctc-forced-aligner
- Role: a Python CLI and library that aligns known text to audio with a CTC model, at word, sentence or character level. It covers 1,130 languages, including English, Arabic, Russian and German, and writes JSON segments.
- Category: Speech and lyric alignment.
- Gap vs neighbours: compared with `montreal-forced-aligner`, it needs no pronunciation dictionaries and covers far more languages. That matters for localised versions in the adaptation pillar. `whisperx` uses a similar wav2vec2 alignment step, but only after its own ASR pass.
- Route: native-cli-or-scripting
- Licence: the code is BSD-2-Clause. **The default model (`MahmoudAshraf/mms-300m-1130-forced-aligner`) is CC-BY-NC 4.0.** The README itself says to use a different model for commercial use.
- Version: 1.0.2 on PyPI, dated 2025-02-09. The repository is newer than that release (last push 2026-11-17), and the README installs from git.
- Stars: 577. Last push: 2026-11-17.
- Install: `uv pip install git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git`. It needs FFmpeg. It runs on CPU with `--device cpu`.
- Caveats: the model licence blocks commercial use by default. Output is JSON only, so captions need a conversion step. PyTorch CPU inference should be deterministic but has not been checked.
- Found via: GitHub topic search `topic:forced-alignment`.

### Hyphenopoly (`hyphenopoly`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/mnater/Hyphenopoly (docs: http://mnater.github.io/Hyphenopoly/)
- Role: hyphenation for Node and the browser. It uses Liang/TeX hyphenation patterns compiled to WebAssembly, for many languages, and inserts soft hyphens into strings.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: no catalogued tool hyphenates (no catalogue or inbox hit). `satori`, `canvas-2d`, `opentype-js` and `troika-three-text` break lines only at spaces or not at all. Justified lower thirds and long localised strings, such as German, overflow or leave rivers. Hyphenopoly inserts the break points before layout and is the same in Node and in the browser.
- Route: library-or-runtime
- Licence: MIT. The pattern files carry their own licences, which are unverified per language.
- Version: 6.1.0, published to npm on 2026-01-01.
- Stars: 735. Last push: 2026-11-21.
- Install: `pnpm add hyphenopoly`
- Caveats: output is deterministic for a fixed pattern set. Pin the package version, because pattern updates change break points. Unlike a browser's CSS `hyphens: auto`, the result does not depend on the platform. Possible alternatives: `typst/hypher` (Rust, Apache-2.0) and `Pyphen` (Python).
- Found via: GitHub topic search `topic:hyphenation`.

### LightUSD (`lightusd`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/lighttransport/LightUSD (docs: https://lighttransport.github.io/LightUSD/). It was previously named TinyUSDZ.
- Role: a dependency-free C++17 library that reads and writes USDA, USDC and USDZ, with Python (`lightusd`) and WASM/npm bindings. It also supports MaterialX and USD Physics.
- Category: Discovery: research candidates. This is the category `openusd` uses.
- Gap vs neighbours: `openusd` (catalogued) is a heavy build. LightUSD installs as a pip wheel or an npm package, so a pipeline can inspect or write USDZ, for example for AR Quick Look deliverables, without Pixar's toolchain. `gltf-transform` covers glTF only.
- Route: library-or-runtime
- Licence: Apache-2.0, with some MIT helper code (see `LICENSE.3rdparty`). GitHub's licence detection reports NOASSERTION.
- Version: 1.0.0, the first stable release. It reached PyPI on 2026-11-09 with macOS arm64 wheels, and the npm package is also at 1.0.0.
- Stars: 737. Last push: 2026-11-22.
- Install: `uv pip install lightusd` or `pnpm add lightusd`.
- Caveats: this is a new 1.0. The pre-1.1 code in `src/legacy/` is described as untested. Whether it converts to glTF or OBJ is not documented. It has no renderer, so it handles data only. Conformance is documented against AOUSD Core v1.1.0.
- Found via: GitHub topic search `topic:usd`.

### autotrace (`autotrace`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/autotrace/autotrace
- Role: a CLI and library that converts bitmaps to vectors, with colour tracing and **centerline** tracing. Output formats include SVG, EPS, PDF and DXF.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `potrace` (catalogued) traces one-bit outlines only. `vtracer` (catalogued) does colour outlines. Neither traces centrelines, which is what turns a scanned line drawing or handwriting into single strokes for `vpype` plotting, or for stroke-draw-on animation with `svg` or `anime-js`. A centreline tool was rejected before (2026-11 digests) because it was stale and limited to polygons.
- Route: native-cli-or-scripting
- Licence: GPL-2.0-or-later AND LGPL-2.1-or-later (from Homebrew). This is copyleft.
- Version: 0.31.12 in Homebrew. The release date is unverified.
- Stars: 755. Last push: 2026-11-23.
- Install: `brew install autotrace`
- Caveats: output is deterministic for fixed input and options. The output on noisy scans needs to be checked before relying on it. It is an old codebase that is maintained again.
- Found via: GitHub topic search `topic:vectorization`.

### Physically Based API (`physically-based-api`) — worth cataloguing
- [x] triage: assess
- URL: https://api.physicallybased.info/v2 (repository: https://github.com/AntonPalmqvist/physically-based-api)
- Role: a CC0 JSON database of measured physically based values: material base colours in linear sRGB and other spaces, IOR, roughness, light-source colour temperatures and camera data. A JSON schema describes it.
- Category: A9. Adjacent resources mentioned during discovery. This is an openly licensed asset API, which is one of the lower-priority areas.
- Gap vs neighbours: the `materials` and `lighting` skills and the `look-developer` reviewer judge plausibility, but nothing in the catalogue gives citable reference values. Pinning a copy of this data gives `three-js`, `blender-background` and `pov-ray` scenes a sourced albedo or IOR and gives reviewers a number to check against.
- Route: remote-api
- Licence: CC0 1.0. The API header and the repository both say so.
- Version: schema 2.2. The materials endpoint header reports an update on 2026-11-03.
- Stars: 492. Last push: 2026-11-14.
- Install: no install. Fetch the data and pin a copy, for example with `curl https://api.physicallybased.info/v2/materials`.
- Caveats: the live endpoint changes, so pin a copy for reproducible renders. The sources for each value vary in quality.
- Found via: GitHub topic search `topic:usd`, where it appeared next to the USD results.

### osm-static-maps (`osm-static-maps`) — niche, keep in mind
- [x] triage: assess
- URL: https://github.com/jperelli/osm-static-maps
- Role: a Node library, CLI and server that renders a static map image from OpenStreetMap tiles, with GeoJSON overlays, markers and polylines. It renders with Leaflet in headless Chrome.
- Category: Discovery: research candidates. This is a maps gap area.
- Gap vs neighbours: `maplibre-native` (catalogued) renders vector styles. This tool gives a one-command raster map still with GeoJSON on top, as an establishing frame or a fallback plate, without a style build.
- Route: native-cli-or-scripting
- Licence: GPL-2.0-only.
- Version: 5.0.0, published to npm on 2026-06-25.
- Stars: 180. Last push: 2026-10-22.
- Install: `pnpm add osm-static-maps`. It needs a Chromium.
- Caveats: it pulls tiles live, so output changes as OSM data changes. Cache or mirror tiles for reproducibility, and follow the OSM tile usage policy and attribution rules. It makes stills only, with no camera motion.
- Found via: GitHub topic search `topic:static-maps`, a maps gap area.

### Echogarden (`echogarden`) — niche, keep in mind
- [x] triage: assess
- URL: https://github.com/echogarden-project/echogarden
- Role: a Node CLI and library for speech: forced alignment (DTW against synthesised speech, or Whisper-guided), text-to-speech, recognition and translation. It writes SRT, VTT and JSON timelines.
- Category: Speech and lyric alignment.
- Gap vs neighbours: it is the only aligner here that runs from Node and pnpm, with no Python environment, and it writes caption files directly. It overlaps `montreal-forced-aligner` and `ctc-forced-aligner` on alignment and `whisperx` on recognition.
- Route: native-cli-or-scripting
- Licence: npm declares `MIT AND GPL-3.0`. The engines and models it downloads carry their own licences, which are unverified.
- Version: 3.4.0, published to npm on 2026-09-08.
- Stars: 455. Last push: 2026-09-08.
- Install: `pnpm add echogarden`, or `npx echogarden align audio.wav transcript.txt out.srt`. This command is unverified in this run.
- Caveats: the licence is mixed. Many engines are fetched at run time, so pin the engine and model. Whether DTW alignment is deterministic has not been checked.
- Found via: GitHub topic search `topic:forced-alignment`.

## Seen but rejected
- aeneas (readbeyond/aeneas) — AGPL-3.0, and it overlaps the three aligners above.
- bournemouth-forced-aligner, nyra-forced-aligner, TIFA — GPL-3.0 or unclear licences, phoneme research tools, or young.
- StephanGeorg/staticmaps — a Node library using sharp, but last published 2024-02-06.
- dietrichmax/docker-staticmaps — AGPL-3.0, an HTTP service only, with no CLI or library.
- BOSL2 — an OpenSCAD library, folded into the `openscad` lead.
- ImplicitCAD, LuaCAD — AGPL-3.0; `build123d` and the `openscad` lead cover them.
- partcad, sand3d, gowall, kram, threepp, splashsurf, SPlisHSPlasH, salva, tplay, swift-timecode, subaligner — already in past digests.
- inkstitch, zigzag, libembroidery — machine embroidery; out of scope for video.
- j40, jixel, imagecodecs, ImageScript — JPEG XL and codec libraries; `sharp` and `imagemagick` already deliver images.
- PNGToSVG, Trazor — raster-to-SVG; overlap `vtracer`.
- Visual-Regression-Tracker, pixsame — server or GUI visual-regression apps, not a headless review step.
- CCExtractor — already in past digests.
- art, cfonts, durdraw, esimov/diagram — ASCII or terminal art with no fit to the render pipeline.
- Show HN, week from 2026-11-17 — nothing qualified. "motigen" (video as code) and "Happo Animation Testing" were too young or proprietary to verify.

## Method notes
- `gh api repos/<other>` and releases calls returned 403, because this session's GitHub scope covers only conorluddy/vcr. Search API results gave stars, push dates and licences. npm, PyPI, conda-forge and Homebrew JSON APIs gave versions and dates.
- Unverified: the OpenSCAD snapshot's CLI flags and headless PNG rendering on macOS, MFA's JSON output, the autotrace release date, Echogarden's CLI syntax, and the licences of the models used by MFA and Echogarden.
- Homebrew new formulae for the past week were not diffed this run. Changelog Nightly was not tried.
- No reverse-dependency or stargazer pass this run. The budget went to topic searches, because 20 earlier digests had already covered the core and gap topics.
