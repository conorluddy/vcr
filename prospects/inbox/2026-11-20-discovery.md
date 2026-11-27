---
type: discovery-digest
run_date: 2026-11-20
iso_week: 2026-W47
topics: [shaders, glsl, creative-coding, ffmpeg, terminal-recording, animation-library, webgpu, lottie, dithering, halftone, glitch-art, lut, waveform, terrain, epilepsy, color-blindness, audio-description, exif, openstreetmap, map-animation, gpx, simctl, app-preview]
seeds: []
searches_used: 55
---
# Discovery leads — 2026-11-20

Summary line: 10 leads (0 in new categories).

## Leads

### librashader (`librashader`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/SnowflakePowered/librashader (CLI docs: `CLI.md` in the repo)
- Role: runs RetroArch `.slangp` shader presets (CRT, scanline, NTSC, handheld-LCD looks) outside an emulator; `librashader-cli render` applies a preset to an input image and writes the result for a chosen frame number.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `glslviewer` and `libplacebo` run single shaders or mpv-style hooks; `g-mic` and `frei0r` have their own filter sets. Nothing catalogued runs the large slang-shaders preset library headlessly, which is the standard source for accurate CRT and retro display looks.
- Route: native-cli-or-scripting
- Licence: MPL-2.0 (file-level copyleft; the shader presets themselves carry their own licences, unverified per preset).
- Version: `librashader-cli` 0.12.1 on crates.io, updated 2026-10-11.
- Stars: 202. Last push: 2026-11-19.
- Install: `cargo install librashader-cli`. No Homebrew formula found.
- Caveats: The CLI takes an explicit `--frame` number, so time-varying presets are addressable per frame, but a per-frame loop over an image sequence is the caller's job. Runtimes listed are opengl3, opengl4, vulkan, wgpu, metal and the Direct3D family; which ones a macOS arm64 build includes is unverified. Output differs between runtimes, so pin one. PNG output is documented for stdout; the file-path format is unverified.
- Found via: GitHub topic search `shaders`.

### LYGIA (`lygia`) — worth cataloguing
- [x] triage: retire
  Non-free: npm `lygia` 1.4.1 declares Prosperity License & Patron License (non-commercial; commercial needs sponsorship), which fails the free-software gate; no record written. Revisit only if the licence changes.
- URL: https://lygia.xyz (source: https://github.com/patriciogonzalezvivo/lygia)
- Role: a granular shader function library (noise, SDFs, colour, filters, lighting, easing) in GLSL, HLSL, Metal, WGSL and CUDA, pulled in with `#include`.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `glslify` is a module bundler and `glslviewer` a runner (by the same author, with LYGIA include support); `three-js-shading-language` covers TSL only. No catalogued record is a reusable shader function library spanning GLSL and WGSL.
- Route: library-or-runtime
- Licence: ⚠ dual Prosperity Public License and Patron License. Prosperity allows non-commercial use and a limited commercial trial; commercial use needs the Patron licence (sponsorship). Read the terms at https://lygia.xyz/license before any use in paid work.
- Version: npm `lygia` 1.4.1, published 2026-02-07. The repository is usually consumed at a pinned commit; no tagged-release date was verified beyond npm.
- Stars: 3504. Last push: 2026-10-24.
- Install: `pnpm add lygia`, or clone or submodule the repository and resolve `#include` paths with glslViewer, a bundler plugin or LYGIA's own resolver.
- Caveats: Pure functions, so determinism is the caller's. Pin a commit: functions are renamed and moved between versions. WGSL coverage is narrower than GLSL (extent unverified).
- Found via: GitHub topic search `webgpu`.

### TypeGPU (`typegpu`) — worth cataloguing
- [x] triage: assess
- URL: https://docs.swmansion.com/TypeGPU (source: https://github.com/software-mansion/TypeGPU)
- Role: a typed WebGPU toolkit: typed buffers, bind groups and pipelines, plus shader functions written in TypeScript (`'use gpu'`) that resolve to WGSL.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `webgpu` is the raw platform API and `three-js-shading-language` is tied to Three.js. `twgl` and `regl` play this helper role for WebGL only. Nothing catalogued gives typed, composable WGSL authoring for plain WebGPU.
- Route: library-or-runtime
- Licence: MIT.
- Version: 0.12.10, published to npm 2026-11-06.
- Stars: 3327. Last push: 2026-11-19.
- Install: `pnpm add typegpu` (the TypeScript-to-WGSL path also needs its build plugin; exact package name unverified).
- Caveats: Pre-1.0, so the API moves between minor versions. `tgpu.resolve` returns WGSL as a string, which can be snapshotted to pin shader output. Use outside a browser (Node or Deno with `dawn-node-webgpu`) is unverified.
- Found via: GitHub topic search `webgpu`.

### pygfx (`pygfx`) — worth cataloguing
- [x] triage: assess
- URL: https://pygfx.org (source: https://github.com/pygfx/pygfx)
- Role: a Python scene-graph render engine on wgpu-py (Metal on macOS), in the Three.js mould: meshes, lines, points, text, volumes, PBR materials.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `vedo` and `open3d` render through VTK or OpenGL-era stacks; `trimesh` is geometry without a modern renderer. Nothing catalogued is a Python-native, wgpu-backed renderer that pairs with `build123d`, `trimesh` or `colour-science` data in one process.
- Route: library-or-runtime
- Licence: BSD-2-Clause.
- Version: 0.18.0, published to PyPI 2026-11-17 (wgpu-py 0.33.0, 2026-11-06; rendercanvas 3.0.1, 2026-11-19).
- Stars: 880. Last push: 2026-11-19.
- Install: `uv pip install pygfx` (add `glfw` only for windows; the README says it can be omitted for offscreen-only use).
- Caveats: Pre-1.0 and the API changes between versions. The README confirms offscreen rendering exists but the route to a PNG (rendercanvas offscreen canvas) is unverified here. GPU output can differ between adapters and driver versions. glTF loading is unverified.
- Found via: GitHub topic search `webgpu` (through fastplotlib, which is built on it).

### ntsc-rs (`ntsc-rs`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://ntsc.rs (source: https://github.com/ntsc-rs/ntsc-rs)
- Role: an analogue-video artefact emulator (NTSC composite, VHS tracking noise, chroma bleed, head switching) for stills and video, shipped as a standalone app and as OpenFX and After Effects plugins.
- Category: A6. Image processing and colour.
- Gap vs neighbours: `g-mic` and `frei0r` have simple VHS-style filters; `libplacebo` and the `librashader` lead above model the display, not the tape or broadcast signal. Nothing catalogued simulates the analogue signal path.
- Route: native-cli-or-scripting (the documentation site lists a "Command-line interface" page; its binary name, flags and output formats are unverified).
- Licence: unverified. GitHub reports multiple licence files (Apache-2.0, ISC, MIT) without a single SPDX id.
- Version: unverified (release feed unreachable from this run).
- Stars: 2731. Last push: 2026-10-15.
- Install: macOS download from the project site; no Homebrew formula found. A `cargo` route is unverified.
- Caveats: Video I/O goes through GStreamer. The effect uses noise, so a fixed seed setting is needed for repeatable frames; whether the CLI exposes one is unverified. Confirm the CLI works without the GUI before promoting.
- Found via: GitHub topic search `glitch-art` (a Swift app in the results cites it), then a name search.

### gopro-dashboard-overlay (`gopro-overlay`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/time4tea/gopro-dashboard-overlay
- Role: renders telemetry dashboards (speed, elevation, heart rate, moving map, route trace) as video from GoPro metadata or from a plain GPX or FIT file, with layouts defined in XML.
- Category: A5. Video and capture (maps and geo motion gap).
- Gap vs neighbours: `maplibre-native` and `chiitiler` render static map images and `three-globe` draws globes. Nothing catalogued turns a timed GPS track into frame-by-frame motion (a moving map and gauges synced to timestamps).
- Route: native-cli-or-scripting
- Licence: GPL-3.0-or-later ⚠ (run as a separate process; do not link).
- Version: 0.134.0, published to PyPI 2026-05-16.
- Stars: 589. Last push: 2026-08-04.
- Install: `uv pip install gopro-overlay` in a venv; needs `ffmpeg`, `libraqm` and the Roboto font; `cairo` and `pycairo` are optional.
- Caveats: Map tiles are fetched from online providers (OpenStreetMap, Thunderforest and others), so a render depends on the network and on tile state at the time; some styles need an API key (unverified which). Pre-cache tiles for repeatable output. The "overlay only" mode exists; whether it writes alpha is unverified. Python version support is stated inconsistently in the README (3.10 versus 3.11+).
- Found via: GitHub topic search `gpx`.

### Pixelbolt (`pixelbolt`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/skulitom/Pixelbolt
- Role: renders pixel art and short pixel animations from editable JSON recipes to PNG sprite sheets, APNG, GIF, numbered frames and atlases, from a CLI or a local MCP server.
- Category: A1. Creative coding and 2D.
- Gap vs neighbours: `aseprite` is retired from the catalogue and `gifski` and `gifsicle` only encode. `canvas-2d` can draw pixel art but has no palette, sprite, autotile or atlas model. Nothing catalogued is a recipe-driven pixel-art renderer.
- Route: native-cli-or-scripting
- Licence: MIT.
- Version: 0.18.0, published to npm 2026-11-18.
- Stars: 125. Last push: 2026-11-20.
- Install: `npx -y pixelbolt@latest <command>` (Node 20+); no dependencies to install when run from a clone.
- Caveats: The README states rendering is deterministic (integer coordinates, seeded particle and fluid effects). It does not encode video; `sequence` writes numbered PNGs for `ffmpeg-ffprobe`. Young project with fast releases, so pin the version. Its skills installer reports telemetry unless `DISABLE_TELEMETRY=1` is set. No AI model or network service is required.
- Found via: GitHub topic search `sprite-sheet`.

### simvyn (`simvyn`) — niche-keep-in-mind
- [x] triage: defer
- Triage reason (2026-11-27): iOS simulator tooling, baguette already covers simulator capture. Revisit if baguette proves insufficient.
- URL: https://github.com/pranshuchittora/simvyn
- Role: one CLI (and local dashboard) over iOS Simulators, Android emulators and USB devices: list, boot, erase, screenshot and record.
- Category: A5. Video and capture (app-preview and device capture gap).
- Gap vs neighbours: `frames-cli` adds bezels to a capture that already exists. The `sim-use` lead (2026-11 inbox) covers iOS Simulator only. This one gives a single command surface for iOS and Android capture.
- Route: native-cli-or-scripting
- Licence: MIT.
- Version: 2.7.4, published to npm 2026-10-28.
- Stars: 450. Last push: 2026-10-28.
- Install: `pnpm add -g simvyn` or `npx simvyn` (Node 22.14+; Xcode for simulators, Android SDK for emulators).
- Caveats: The README says every feature works headlessly, but its CLI table lists no commands for status-bar override, appearance or locale, which are the settings that matter for clean app-preview captures; those may be dashboard-only (unverified). Recordings are real-time screen captures, not frame-seekable renders.
- Found via: GitHub topic search `simctl`.

### Gource (`gource`) — niche-keep-in-mind
- [ ] triage: assess | defer | retire
- URL: https://gource.io (source: https://github.com/acaudwell/Gource)
- Role: animates a repository's commit history as a growing tree and writes a PPM frame stream for FFmpeg.
- Category: A7. Native applications and procedural tools.
- Gap vs neighbours: `d3` and `graphviz` could draw a history graph by hand; nothing catalogued produces a ready-made code-history video, a common shot in developer-facing films.
- Route: native-cli-or-scripting
- Licence: GPL-3.0-or-later ⚠ (run as a separate process).
- Version: 0.56 on Homebrew (release date unverified).
- Stars: 13219. Last push: 2026-03-06.
- Install: `brew install gource`.
- Caveats: Needs an OpenGL window even when writing frames with `-o -`, so it is not truly headless on macOS. Layout is a force simulation; frame-for-frame repeatability across runs is unverified. Not seekable: frames come out in order only. Well known rather than long-tail; listed because it is absent from the catalogue.
- Found via: Homebrew formula index, checked after the `ffmpeg` topic search.

### pixelsort (`pixelsort`) — niche-keep-in-mind
- [x] triage: assess
- URL: https://github.com/satyarth/pixelsort
- Role: pixel-sorting glitch effect for stills, as a Python module and CLI with interval functions, masks, angle and sort keys.
- Category: A6. Image processing and colour.
- Gap vs neighbours: `g-mic`, `imagemagick` and `libvips` have no pixel-sort operator. A small single-purpose effect, useful for glitch transitions on image sequences.
- Route: native-cli-or-scripting
- Licence: MIT.
- Version: 1.0.2, published to PyPI 2026-09-03.
- Stars: 875. Last push: 2026-09-03.
- Install: `uv pip install pixelsort`, then `python -m pixelsort in.png -o out.png`.
- Caveats: The `random` interval function is unseeded as far as verified (unverified whether a seed option exists); use `threshold`, `edges` or a mask for repeatable frames. Pure Python on Pillow, so slow at 4K across a sequence.
- Found via: GitHub topic search `glitch-art`.

## Seen but rejected
- didder (makew0rld) — good dithering CLI, but GPL-3.0 and the latest release is v1.3.0 from 2023-12-20; a 2026-02 push could not be confirmed as substantive.
- DaltonLens-Python — colour-vision-deficiency simulation would fill an accessibility gap, but the last push was 2021-12-17. The `color-blindness` topic returned nothing else usable.
- FURY (fury-gl) — Python scientific rendering on VTK; overlaps `vedo` and `vtk-js`.
- relottie (LottieFiles) — Lottie AST processor; CLI last published 2026-07-03, too narrow beside `dotlottie` and `lottie-web`.
- QuackOSM — OSM PBF to GeoParquet extraction; data preparation rather than rendering. Keep in mind if a map pipeline needs it beside the `planetiler` lead.
- OPENRNDR — Kotlin/JVM creative coding; a JVM toolchain with no gain over `p5-js` and `canvas-sketch` for headless capture.
- sjvisualizer — animated time-series charts, but it draws in a Tk window and records the screen.
- tslfx (verekia) — early-stage TSL effect collection; revisit when it has releases.
- glslang, shaderc, naga-cli, spirv-cross, shader-minifier — shader compilers and validators; build tooling, not production tools.
- node-simctl (appium) — a Node wrapper over `xcrun simctl` with no capture features beyond the binary it wraps.
- timg, tplay, aniso — terminal or browser ASCII viewers with no file output path that fits.
- gyng/ditherer, supermosh, glitcher-app — browser-only effect apps without a headless route.
- NTSCRT (finnmckenty) — GUI app; the `ntsc-rs` lead covers the same ground with a CLI.
- pymartini, pydelatin, quantized-mesh-encoder, THREE.Terrain — terrain meshing libraries; too narrow without a map pipeline in the catalogue.
- grafanimate — AGPL-3.0 and tied to a running Grafana instance.
- deew — wrapper around the proprietary Dolby Encoding Engine.
- FableCut, freecut, ai-video-editor, overlay-studio, OpenMontage, neonclipping, chopify and other `ffmpeg`-topic editors and clippers — GUI or agent-wrapper apps, not headless tools.
- Agent skill repositories (shader-skills, motion-design-skill, opus-video-skills, skill-video-studio, codixel, spritecast) — skills, not tools.
- Show HN, past week (springrep B-rep kernel, tamserve object tracking, Isometric SF, Umbrella audio capture) — none is a scriptable production tool that is installable today.
- Topics `epilepsy`, `audio-description`, `app-preview`, `map-animation`, `terminal-recording`, `l-system` — no new qualifying results.

## Method notes
- GitHub repository search worked (about 33 queries). The per-repository REST endpoints and `github.com` release feeds were not reachable from this session, so versions and dates come from PyPI, npm, crates.io and the Homebrew formula index, and stars and push dates from search results. Where a registry had no entry the field says unverified.
- No seeds this run: reverse-dependency and stargazer-overlap steps need the endpoints above and were skipped.
- Homebrew: the formula index was used to confirm formulae and versions only; a "new this week" list could not be derived from it.
- Changelog Nightly was not checked.
- Unverified items are marked inline: ntsc-rs (licence, version, CLI details), librashader runtimes on macOS, pygfx offscreen route, TypeGPU outside a browser, gopro-overlay alpha output and API keys, Gource release date.
- A remote branch `discovery/2026-W47` already exists from an earlier run with no open PR, so this run used `discovery/2026-W47-20261120`, matching the earlier same-week branches.
