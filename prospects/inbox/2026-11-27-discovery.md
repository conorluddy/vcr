---
type: discovery-digest
run_date: 2026-11-27
iso_week: 2026-W48
topics: [hdr-delivery, gaussian-splatting, cad, sdf, gltf, physics-determinism, fluid-simulation, audio-denoise, math-typesetting, diagrams, media-packaging]
seeds: [gltf-transform, splat-transform, build123d]
searches_used: 32
---
# Discovery leads — 2026-11-27

Summary line: 11 leads (0 in new categories).

This is the fifth W48 run. The earlier W48 digests (2026-11-23 to 2026-11-26) are merged and no `discovery/` PR is open. Topic sweeps are saturated, so, like the 2026-11-26 run, this run started from a list of about 200 established tools in the seed areas, grepped each against every `catalog/tools` record, every `catalog/retired` file and every inbox digest, and kept only names that appear nowhere. The survivors were checked against GitHub search (stars, last push, licence, archived flag), Homebrew, PyPI and npm. Several leads are larger than long-tail size; each is listed because it fills a named gap that the catalogue does not cover.

## Leads

### libultrahdr (`libultrahdr`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/google/libultrahdr
- Role: the reference library and sample CLI (`ultrahdr_app`) for Ultra HDR JPEG: an SDR base JPEG plus a gain map in one file, readable as SDR everywhere and as HDR where supported. Encodes from an HDR raw (P010 or RGBA1010102) plus an optional SDR JPEG, and decodes back.
- Category: HDR delivery metadata (beside `dovi-tool`).
- Gap vs neighbours: `dovi-tool` covers video dynamic metadata only. `libavif` writes AVIF stills, and the catalogue has no route for HDR stills that degrade safely to SDR, which is the format Android and recent Chrome and Safari display as HDR.
- Route: native-cli-or-scripting
- Licence: Apache-2.0 (Homebrew; GitHub reports NOASSERTION).
- Version: Homebrew stable 2.0.2. Release date unverified.
- Stars: 359. Last push: 2026-11-20.
- Install: `brew install libultrahdr` (arm64 bottle present). Whether the formula ships `ultrahdr_app` is unverified.
- Caveats: the flag reference is the source (`examples/ultrahdr_app.cpp`), not a man page. Output depends on the libjpeg-turbo build, so pin the version. A forum user reports noisy images handle poorly with an RGB gain map.
- Found via: HDR delivery gap, neighbour of `dovi-tool` and `libavif`.

### Manifold (`manifold`) — strong candidate
- [x] triage: assess
- URL: https://github.com/elalish/manifold
- Role: a robust mesh Boolean and CSG library that guarantees manifold output, with Python (`manifold3d`) and JS/WASM (`manifold-3d`) bindings; exports through its own mesh API or glTF via the JS bindings.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `build123d` is B-rep CAD on Open Cascade and is slow for mesh-level Booleans; `trimesh` delegates Booleans to external engines; `fogleman-sdf` meshes implicit fields. Manifold gives fast, watertight mesh CSG on triangle meshes that already exist (glTF assets, scans), in Python or in the browser.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: 3.5.5 on PyPI and npm, 2026-11-13. Homebrew stable 3.5.5.
- Stars: 2,446. Last push: 2026-11-26.
- Install: `uv pip install manifold3d`, `pnpm add manifold-3d`, or `brew install manifold`.
- Caveats: floating-point, single-threaded results should be stable, but check that output vertex order is identical across runs when parallel (TBB) builds are used. Not a CAD kernel: no fillets or STEP.
- Found via: CAD gap, neighbour of the `build123d` seed (OpenSCAD's new backend).

### Spark (`spark-splats`) — strong candidate
- [x] triage: assess
- URL: https://github.com/sparkjsdev/spark
- Role: a three.js 3D Gaussian Splatting renderer from World Labs. `SplatMesh` is an `Object3D`, so splats sit in an ordinary three.js scene with meshes and a seek-driven camera. Reads PLY (and compressed PLY), SPZ, SPLAT, KSPLAT and SOG.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `splat-transform` converts and edits splat files but does not render them; `three-js` has no native splat support. Nothing in the catalogue renders splats inside a capturable three.js scene.
- Route: library-or-runtime
- Licence: MIT.
- Version: `@sparkjsdev/spark` 2.4.0, 2026-10-20.
- Stars: 3,980. Last push: 2026-11-19.
- Install: `pnpm add @sparkjsdev/spark three`
- Caveats: WebGL2. Splat sort order is computed per view and may be asynchronous; a frame-by-frame capture must wait until sorting for the current camera has finished. Spark 2's streaming and LoD paging would make frames depend on load timing, so use a fully loaded, non-streamed file.
- Found via: gaussian-splatting topic, neighbour of the `splat-transform` seed.

### KTX-Software (`ktx-software`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/KhronosGroup/KTX-Software
- Role: Khronos' reference KTX2 tools. The unified `ktx` front end (`ktx create`, `ktx encode`, `ktx info`, `ktx validate`) builds GPU-compressed textures with Basis Universal ETC1S or UASTC and zstd supercompression.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `gltf-transform`'s `etc1s` and `uastc` commands shell out to this binary, so the catalogue already depends on it without a record. `meshoptimizer` (`gltfpack`) compresses geometry, not textures in the KTX2 path that `gltf-transform` uses.
- Route: native-cli-or-scripting
- Licence: Apache-2.0 for most of the code, with some files under other licences (GitHub reports NOASSERTION). Check the per-file list before redistributing.
- Version: the docs show 5.0.0; release date unverified.
- Stars: 1,414. Last push: 2026-11-17.
- Install: no Homebrew formula or cask found. macOS installer packages on the GitHub releases page (unverified for arm64).
- Caveats: Basis encoding is multithreaded; check byte-identical output at a fixed thread count. `toktx` is deprecated in favour of `ktx create`, which needs an explicit `--format`.
- Found via: reverse dependency of the `gltf-transform` seed.

### Box2D v3 (`box2d`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/erincatto/box2d
- Role: a 2D rigid-body physics engine in C, rewritten for v3. Its author states cross-platform determinism since 3.1 (same results on x64 and ARM across MSVC, GCC and Clang, independent of worker count), and a June 2026 post adds a replay system built on that. WASM bindings exist on npm (`box2d3-wasm`).
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `matter-js` and `pymunk` make no cross-platform determinism claim; `rapier` offers it only with its `enhanced-determinism` feature. Box2D v3 is the one 2D engine with a stated bit-exact guarantee, which suits a baked, re-renderable simulation.
- Route: library-or-runtime
- Licence: MIT.
- Version: Homebrew stable 3.2.0; `box2d3-wasm` 6.0.0, 2026-10-26 (third-party binding, maintainer unverified).
- Stars: 10,524. Last push: 2026-11-26.
- Install: `brew install box2d` (C library) or `pnpm add box2d3-wasm`.
- Caveats: the determinism claim comes from the author and is not independently verified; contact and other callbacks can break it. Whether the WASM build keeps the guarantee is unverified. A C library needs a small host program or binding for scripting.
- Found via: simulation gap, neighbour of the `rapier`, `matter-js` and `pymunk` records.

### DeepFilterNet (`deepfilternet`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/Rikorose/DeepFilterNet
- Role: real-time speech enhancement (noise suppression) for 48 kHz audio, shipped as a prebuilt Rust CLI (`deep-filter in.wav`) with no Python dependency, plus a Python package.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `sox` and `pedalboard` offer classic filters and noise gates; `demucs` separates music stems. Nothing cleans a noisy voice-over or screen-recording narration before `ffmpeg-normalize`.
- Route: native-cli-or-scripting
- Licence: MIT or Apache-2.0 at the user's option (code). Model-weight terms are not stated separately in the sources checked; unverified.
- Version: PyPI `deepfilternet` 0.5.6, 2023-08-31. Repository pushed 2026-11-06; latest CLI release unverified.
- Stars: 5,116. Last push: 2026-11-06.
- Install: download the `deep-filter` binary from the GitHub releases page (macOS arm64 asset unverified), or `uv pip install deepfilternet` (needs torch).
- Caveats: 48 kHz WAV input only. Neural inference on CPU should be deterministic for a fixed binary, but check for byte identity. The PyPI release is old; activity rests on the repository.
- Found via: audio-for-video area, neighbour of `demucs` and `ffmpeg-normalize`.

### MathJax 4 (`mathjax`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/mathjax/MathJax-src
- Role: TeX, MathML or AsciiMath to self-contained SVG in Node, with the lite DOM adaptor and no browser. Output paths are glyph outlines, so they rasterise through `resvg` with no font installed.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `manim-community` needs a LaTeX install for equations; `typst` sets maths but in its own syntax; `satori` and `resvg` cannot lay out TeX. MathJax gives a TeX equation as an SVG layer from one `pnpm` dependency.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: `@mathjax/src` 4.1.3, 2026-07-03 (the old `mathjax-full` package stopped at 3.2.2 in 2022).
- Stars: 2,419. Last push: 2026-11-26.
- Install: `pnpm add @mathjax/src`
- Caveats: check that the SVG is byte-identical across runs (generated glyph ids). Font choice (MathJax TeX, STIX2 and others) changes metrics, so pin it.
- Found via: typesetting topic.

### GPAC / MP4Box (`gpac`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/gpac/gpac
- Role: a multimedia framework whose `MP4Box` and `gpac` CLIs package and inspect MP4, CMAF, DASH and HLS: fragmenting, segmenting, adding subtitle and chapter tracks, and dumping box structure.
- Category: A5. Video and capture.
- Gap vs neighbours: `ffmpeg-ffprobe` muxes and can segment, but its box-level control and inspection are limited; `mediainfo` reports but does not write. GPAC covers adaptive-streaming packaging and box-level inspection for delivery checks.
- Route: native-cli-or-scripting
- Licence: LGPL-2.1-or-later.
- Version: Homebrew stable 26.07.0. Release date unverified.
- Stars: 3,331. Last push: 2026-11-24.
- Install: `brew install gpac`
- Caveats: MP4 output carries creation timestamps and a tool-version string; check whether a flag zeroes them for byte-identical output.
- Found via: delivery area (packaging), neighbour of `ffmpeg-ffprobe` and `mediainfo`.

### Pikchr (`pikchr`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://pikchr.org (GitHub mirror https://github.com/drhsqlite/pikchr)
- Role: a PIC-like diagram language from the SQLite author, a single C file that turns a text script into SVG; built with `-DPIKCHR_SHELL` it reads files and writes SVG to stdout.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `d2`, `mermaid-cli` and `graphviz` lay diagrams out automatically. Pikchr places every element by relative direction and distance, so the layout is exactly what the script says and stable between edits, which suits a diagram that animates step by step.
- Route: native-cli-or-scripting
- Licence: 0BSD.
- Version: no tagged releases; mirror last pushed 2026-01-02.
- Stars: 158 (mirror). Last push: 2026-01-02.
- Install: no Homebrew formula found. Compile the single file (`cc -DPIKCHR_SHELL -o pikchr pikchr.c -lm`) or `cargo install pikchr-cli` (third-party, licence unverified).
- Caveats: output fonts are left to the SVG renderer, so pin the font in `resvg`. Development happens in Fossil; the GitHub mirror's push date may lag.
- Found via: diagrams area, neighbour of `d2` and `graphviz`.

### libfive (`libfive`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/libfive/libfive
- Role: a functional-representation (SDF) solid-modelling kernel with Python bindings and a standard library of shapes; meshes implicit models to STL with feature-preserving dual contouring and renders 2D slices.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `fogleman-sdf` meshes with marching cubes, which rounds sharp edges; libfive's meshing keeps hard edges and corners, so it suits mechanical SDF parts. `build123d` is B-rep, not implicit.
- Route: library-or-runtime
- Licence: MPL-2.0 for the kernel, standard library and Python bindings; GPL-2.0-or-later for Studio and the Guile bindings.
- Version: no recent tagged release found; the project calls itself alpha. Homebrew: none.
- Stars: 1,685. Last push: 2026-10-16.
- Install: build from source with CMake; MacPorts has a `libfive` port. The separate `libfive` PyPI package is described as a work in progress and may not match the in-repo bindings.
- Caveats: alpha status and a source build are the main risks. Multithreaded meshing; check that vertex order is stable.
- Found via: sdf topic.

### PhiFlow (`phiflow`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/tum-pbs/PhiFlow
- Role: a Python fluid-simulation toolkit (smoke, incompressible flow, grids and particles) on NumPy, PyTorch, JAX or TensorFlow, stepped explicitly in a loop, so fields can be saved per frame for later rendering.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `splishsplash` is SPH liquids from a scene file; nothing in the catalogue does grid-based smoke or 2D flow fields scriptably from Python, which is the usual source for smoke and ink motion graphics.
- Route: library-or-runtime
- Licence: MIT.
- Version: PyPI `phiflow` 3.4.0, 2025-08-02 (over 12 months old). Repository pushed 2026-07-16.
- Stars: 1,959. Last push: 2026-07-16.
- Install: `uv pip install phiflow` (NumPy backend needs no GPU).
- Caveats: the NumPy backend should be deterministic; the GPU backends may not be. The last release is 15 months old, so activity rests on 2026 commits, whose substance is unverified.
- Found via: simulation gap (fluid-simulation topic).

## Seen but rejected
- sfizz (`sfztools/sfizz`) — SFZ sampler with an offline render CLI, but the repository is archived.
- xatlas — UV atlas generator; no push since 2024-06-16.
- wavedrom-cli — timing-diagram CLI; no push since 2024-02-22.
- noisereduce — spectral-gating denoiser; last push 2025-08-19, and DeepFilterNet covers the need better.
- ChucK — strongly-timed audio language with offline rendering (Homebrew 1.5.5.9, GPL-2.0-or-later); overlaps `csound` and `supercollider` with no new capability.
- Faust — DSP language (Homebrew 2.88.0, GPL compiler); overlaps the existing audio synthesis records; revisit if compiled DSP plug-ins become a need.
- libjxl (JPEG XL, Homebrew 0.13.0) — well-made encoder, but delivery targets in the catalogue's scope still lack broad JXL support; revisit when a platform requires it.
- Turf.js — geospatial maths (useful for route-along-line animation), but a broad mainstream library; d3-geo already covers the projection side. Revisit with a concrete map-route scene.
- MuJoCo, Apache ECharts — relevant but mainstream (18k and 68k stars); not long-tail finds. ECharts' Node SVG server-side rendering is worth a look if the data-viz group needs a second charting library.
- OpenSplat — splat training CLI; AGPL-3.0, and training is upstream of the catalogue's rendering scope (not verified further).

## Method notes
- GitHub REST lookups of repositories outside `conorluddy/vcr` returned 403, and `releases.atom` feeds returned 403, so release dates come only from PyPI, npm and Homebrew; where none of those applies the date is marked unverified. Stars, last push, licence and archived flags come from one GitHub repository-search call.
- Homebrew versions come from the formulae.brew.sh JSON API; "arm64 bottle present" means an `arm64_sequoia` bottle is listed.
- Dedupe was a case-insensitive grep of each candidate name against the concatenated `catalog/tools/*.json`, `catalog/retired/*` and `prospects/inbox/*.md`; every lead above had zero hits.
- No reverse-dependency graph (deps.dev, libraries.io), stargazer-overlap or Show HN pass was run this time; the KTX lead comes from reading `gltf-transform`'s known external binaries, not a dependency graph.
