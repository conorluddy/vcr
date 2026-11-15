---
type: discovery-digest
run_date: 2026-11-15
iso_week: 2026-W46
topics: [wgsl, gltf, audio-analysis, video-stabilization, image-processing, font, generative-art, subtitles, data-visualization, hdr, procedural-generation, vector-graphics, mesh, taichi, audio-reactive, device-frames, xmp, maplibre, wcag-contrast]
seeds: []
searches_used: 44
---
# Discovery leads — 2026-11-15
Summary line: 9 leads (1 in a new category). This is the fifth W46 run. Earlier digests had already mined the core and gap topics, so this run paired topics with `cli`, `python` or `rust` and searched descriptions by keyword. Every name below appears in no earlier digest and in no `catalog/tools` or `catalog/retired` record.

Stars, licences and last-push dates come from GitHub search metadata on the run date. Versions and dates come from npm, PyPI, crates.io and the Homebrew formula API where those are named, or from the repo's CHANGELOG.

## Leads

### 🆕 new category: app-preview and device capture — Frames CLI (`frames-cli`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/viticci/frames-cli
- Role: adds Apple device bezels to screenshots and screen recordings from the command line. It auto-detects the device from the pixel size and supports colours, merging several shots, batch runs, `--alpha` output and HEVC-with-alpha video.
- Category: new category "app-preview and device capture". `sim-use` (2026-11-02) and `baguette` (2026-11-14) proposed it; it is not yet in the catalogue.
- Gap vs neighbours: `baguette` and `sim-use` (inbox) capture from the simulator but do not frame the result. `imagemagick` and `ffmpeg-ffprobe` could composite a bezel by hand, but they do not know device masks, perspective poses or per-device sizes. Frames CLI is the step between a simulator capture and a finished app-preview shot. Per its changelog, a framed video frame matches the same frame framed as a screenshot.
- Route: native-cli-or-scripting.
- Licence: MIT for the code. The bezel assets (Apple Frames 4 pack, about 55 MB) are downloaded separately from cdn.macstories.net, and their licence terms are unverified. They depict Apple products, so check trademark and redistribution terms before relying on them in delivered work.
- Version: 1.7.3 (CHANGELOG, 2026-11-13).
- Stars: 455. Last push: 2026-11-13.
- Install: clone the repo or `curl` the single `frames` script, then `pip install Pillow`. Video framing needs ffmpeg/ffprobe 5.1+. No Homebrew or PyPI package was found (unverified).
- Caveats: `frames setup` downloads assets interactively. For unattended use, point the `FRAMES_ASSETS` environment variable at a pre-fetched pack. Some poses move the camera with screen content frame by frame, so check that the same input always gives byte-identical output (unverified).
- Found via: GitHub keyword search "device frame screenshot".

### dawn.node / `webgpu` on npm (`dawn-node-webgpu`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/dawn-gpu/node-webgpu (upstream: https://dawn.googlesource.com/dawn/+/refs/heads/main/src/dawn/node/)
- Role: Google Dawn's WebGPU implementation as a Node.js addon. It gives Node `navigator.gpu`, so you can render to textures and read them back, or run compute shaders, with no browser.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `webgpu` (catalogued) is the browser API, captured through `playwright`. With dawn.node, a WGSL scene or a simulation baked in compute shaders can render frames in a plain Node process, with no page, compositor or screenshot step, and the pixels can then go to `sharp` or `ffmpeg-ffprobe`. It also gives the simulation gap a bakeable compute runtime.
- Route: library-or-runtime.
- Licence: BSD-3-Clause (repo); npm lists MIT. The mismatch is unverified.
- Version: 0.6.2 (npm, 2026-10-02).
- Stars: 117. Last push: 2026-10-02.
- Install: `pnpm add webgpu`. The README says prebuilt binaries cover macOS arm64 and Intel. Building from source needs cmake, Go and Node 18+.
- Caveats: there is no canvas or `HTMLImageElement` integration, so text, images and video frames have to be uploaded as raw pixel buffers. The process stays alive while GPU work is pending. Whether output is identical across GPUs and drivers is unverified, so pin one machine for golden frames.
- Found via: GitHub topic search `wgsl`.

### TanStack Charts (`tanstack-charts`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/TanStack/charts
- Role: a TypeScript visualisation grammar. A chart definition compiles to a renderer-neutral, keyed scene, which renders as static SVG on the server, in the DOM or on Canvas. Animation and accessibility are built in.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `d3` (catalogued) is low-level, and `vl-convert` (inbox and catalogue) renders Vega-Lite specs to stills. A keyed scene is what keeps marks identifiable from one state to the next across chart transitions, which the data-visualiser reviewer checks. Static SVG SSR can then be rasterised with `resvg`.
- Route: library-or-runtime.
- Licence: MIT.
- Version: 1.5.0 (npm `@tanstack/charts`, 2026-11-07).
- Stars: 870. Last push: 2026-11-13. The repo was created 2026-07-28, so the project is young.
- Install: `pnpm add @tanstack/charts`.
- Caveats: it is built for responsive application charts. Whether its animation can be seeked to an explicit time, rather than played by a timeline running in real time, is unverified, and so is whether SSR output is stable byte for byte.
- Found via: GitHub topic search `data-visualization` + `svg`.

### Stabilo (`stabilo`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/rfonod/stabilo
- Role: Python library and CLI (`stabilo video`, `stabilo tracks`) that registers every frame of a video to one chosen reference frame, using homography or affine registration with exclusion masks for moving objects. It can also stabilise tracked object trajectories.
- Category: A5. Video and capture. It fills the lower-priority gap for stabilisation and proxies.
- Gap vs neighbours: `gyroflow` (inbox) needs gyro data. FFmpeg's `vidstab` (via `ffmpeg-ffprobe`) smooths motion between neighbouring frames. Stabilo locks every frame to a single reference frame, which suits locked-off plates for compositing or for tracking overlays onto drone or handheld footage.
- Route: native-cli-or-scripting.
- Licence: MIT. The optional learned matchers (LightGlue, DISK, LoFTR and others) carry their own model-weight terms (unverified).
- Version: 1.4.8 (PyPI, 2026-11-08).
- Stars: 41. Last push: 2026-11-08.
- Install: `uv tool install stabilo` (or `pip install stabilo`). Whether a macOS arm64 wheel exists for its OpenCV and PyTorch dependencies is unverified.
- Caveats: RANSAC is random, so pin seeds for repeatable output (whether a seed option exists is unverified). Learned detectors use a lot of memory at 4K. Upright models fail beyond about 30° of in-plane rotation.
- Found via: GitHub topic search `video-stabilization`.

### generativepy (`generativepy`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/martinmcbride/generativepy (docs: https://generativepy.com)
- Role: Python library for generative art, maths graphs and animations. It draws frames with Pycairo and writes video through moviepy, and includes graph axes, formula rendering and colour schemes.
- Category: A1. Creative coding and 2D.
- Gap vs neighbours: `manim-community` (catalogued) is heavier and organised around scenes. `vsketch` (catalogued) targets plotters. `drawsvg` (inbox) produces vector stills. generativepy sits between them: a plain function per frame for maths explainers and graph animations in Python.
- Route: library-or-runtime.
- Licence: MIT.
- Version: 50.0 (PyPI, 2026-08-16). Version 50 moved from date-based to semantic versioning and removed the 3D modules, which now live in a separate project, genpy3d.
- Stars: 111. Last push: 2026-09-25.
- Install: `uv add generativepy`. It needs Cairo (`brew install cairo`) for Pycairo.
- Caveats: it is maintained by one person. Frames are a function of the frame number, so seeking should work, but this is unverified. Formula rendering may depend on an external LaTeX install (unverified).
- Found via: GitHub topic search `generative-art` + `python`.

### vedo (`vedo`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/marcomusy/vedo
- Role: Python module on VTK and NumPy for building, analysing and rendering 3D meshes, volumes and point clouds, with offscreen screenshots and video export.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `trimesh` and `open3d` (catalogued) process geometry but are weak at styled offscreen renders. `vtk-js` (catalogued) runs in the browser. vedo gives a Python, scriptable route from scientific or CAD meshes (for example `build123d` output) to frames.
- Route: library-or-runtime.
- Licence: MIT.
- Version: 2026.6.3 (PyPI, 2026-10-25).
- Stars: 2,275. Last push: 2026-11-08.
- Install: `uv add vedo` (pulls in the VTK wheels; macOS arm64 VTK wheels exist upstream, vedo on arm64 unverified).
- Caveats: whether offscreen rendering works headless on macOS without a window is unverified. Determinism depends on VTK's OpenGL backend and the GPU.
- Found via: GitHub topic search `mesh` + `python`.

### HyperWeave (`hyperweave`) — niche-keep-in-mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/InnerAura/hyperweave
- Role: takes a structured spec (diagram topologies such as pipeline, DAG, state machine and sequence, plus charts and tables) and writes a self-contained SVG with optional SMIL motion, with the spec and a hash digest embedded. Has a CLI, an HTTP server and an MCP server.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `d2`, `mermaid-cli`, `graphviz` and `vl-convert` (catalogued) cover diagrams-as-code. HyperWeave adds edge motion and an embedded, machine-readable spec that a reviewer agent could check against the brief. Its "genome" theme tokens loosely match VCR brief tokens.
- Route: native-cli-or-scripting.
- Licence: Apache-2.0.
- Version: 0.4.7 (PyPI, 2026-09-15).
- Stars: 61. Last push: 2026-09-15.
- Install: `uv tool install hyperweave`.
- Caveats: aimed at READMEs and agent dashboards rather than video. Its SMIL motion would need `svg` browser capture to become frames. It is young and has few users.
- Found via: GitHub topic search `data-visualization` + `svg`.

### CCExtractor (`ccextractor`) — niche-keep-in-mind
- [ ] triage: assess | defer | retire
- URL: https://www.ccextractor.org (repo: https://github.com/CCExtractor/ccextractor)
- Role: extracts embedded closed captions (CEA-608/708, DVB, teletext) from video files into SRT, WebVTT and other formats. Tesseract OCR handles bitmap subtitles.
- Category: A5. Video and capture. It fits the caption-standards gap.
- Gap vs neighbours: `ttconv` and `caption-checker` (inbox) convert and lint sidecar files. `mediainfo` (catalogued) reports that a caption track exists. CCExtractor reads back the captions actually embedded in a delivered file, so a delivery check can compare them with the source sidecar.
- Route: native-cli-or-scripting.
- Licence: GPL-2.0-only. Run it as an external CLI; do not link it.
- Version: 0.96.6 (Homebrew core); release date unverified.
- Stars: 919. Last push: 2026-11-13.
- Install: `brew install ccextractor`.
- Caveats: only matters if VCR ever embeds 608/708 captions. Most social-video delivery uses sidecar files or burned-in captions.
- Found via: GitHub topic search `subtitles`.

### wesl-rs (`wesl`) — niche-keep-in-mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/webgpu-tools/wesl-rs (spec: https://github.com/webgpu-tools/wesl-spec)
- Role: compiler for WESL, a superset of WGSL with imports, conditional compilation and modules. It turns shared shader modules into plain WGSL.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `glslify` (catalogued) does module composition for GLSL. WESL is the WGSL counterpart, for when `webgpu` or `dawn-node-webgpu` scenes start sharing noise, SDF and colour helpers.
- Route: library-or-runtime.
- Licence: Apache-2.0 (repo metadata).
- Version: 0.6.0 (crates.io `wesl`, 2026-10-04).
- Stars: 152. Last push: 2026-11-14.
- Install: `cargo install wesl-cli` (crate name unverified). A JavaScript linker, `wesl-js`, also exists (unverified).
- Caveats: the spec is pre-1.0 and still changing. It only matters once VCR has several WGSL scenes.
- Found via: GitHub topic search `wgsl`.

## Seen but rejected
- KhronosGroup/glTF-Metadata-CLI — no licence file, alpha only, no binaries; KHR_XMP for glTF is interesting for provenance but not usable yet.
- realtime-bpm-analyzer — browser and real-time oriented; offline BPM is already covered by `aubio`, `librosa` and `essentia`.
- ConservationMetrics/mapgl-tile-renderer — renders MBTiles tilesets, not frames or motion; 29 stars.
- truespar/siftx — licence NOASSERTION.
- TanStack-adjacent and diagram tools markvis, SeeCode, flitter, ripl, floweaver — Markdown, interactive or app-oriented, no offline frame route.
- noisefactorllc/noisemaker, CrossGL/crosstl, MasterSelects, Framegen, gowall, samila, astrofox, fosfora, tdmcp, friture, openmeters, chromaprint, ebur128, AutoSubSync, subtitle-translator, transcribe-anything, Mimi, open-edit, baocut, native-subtitle-quote-image, fogleman/sdf, MeshLib, pymadcad, geovista, GeoTaichi, RayTracingPBR, kiln, noai-watermark, gemini-watermark-and-synthid-remover — already in earlier digests or the catalogue.
- rimage, imagineer, imgp, tint, repalette — overlap with `oxipng`, `libavif`, `libwebp`, `sharp` and `imagemagick`, or are GPL/AGPL palette tools with no motion use.
- orb, RedGPU, spektral, beam, gpucanvas — interactive editors or libraries that render in real time, with no headless or seekable route.
- ec175/spectrometry_public — interesting fluid and particle engines for videos, but a personal project with no packaging or release.
- DracoPy — mesh compression is already reachable through `gltf-transform`.

## Method notes
- No open discovery PR existed. `discovery/2026-W46` and the dated 11-12, 11-13 and 11-14 branches are merged, so this run uses `discovery/2026-W46-20261115`, following the earlier precedent.
- GitHub repository search worked. Per-repo metadata came from `repo:` searches. READMEs and CHANGELOGs came from raw.githubusercontent.com. npm, PyPI, crates.io and the Homebrew formula API answered.
- `hn.algolia.com` did not return JSON (blocked), so Show HN was not scanned. Homebrew new formulae, stargazer overlap and reverse-dependency passes were not run, and `seeds` is empty.
- Gap-area keyword searches for WCAG contrast in video, photosensitivity and frame-accurate review players found nothing new; `topic:i18n` + `image` returned nothing.
- After five runs in one week, gap topics are saturated. The next run should start a new rotation, or try reverse dependencies via deps.dev if that host is reachable.
- Everything marked "unverified" above could not be confirmed from primary sources.
