---
type: discovery-digest
run_date: 2026-11-25
iso_week: 2026-W48
topics: [halftone, stippling, dithering, bezier, mockup, content-credentials, fluid-simulation, globe, ios-simulator, color-grading, motion-tracking, sdf, generative-art, subtitles, vector-tiles, exif, particles, typesetting, audio-analysis, gltf, pen-plotter, motion-design, frame-interpolation, maplibre, screen-recording, resvg, wgpu]
seeds: [resvg, wgpu]
searches_used: 38
---
# Discovery leads — 2026-11-25

Summary line: 9 leads (0 in new categories).

This is the third W48 run. The 2026-11-23 digest (PR #233) and the 2026-11-24 digest (PR #236) are merged. Gap-area topics are saturated: maps, simulation, provenance, device capture and EXIF searches turned up only repositories that earlier digests already list or reject. This run's finds come from the edges instead. There are four small JavaScript geometry and easing libraries that browser scenes would import, a versioned open-font source that answers the "reproducible environment pinning" lower-priority area, a CC0 materials API for the "openly-licensed asset APIs" area, and a headless MIDI-to-video renderer. Every lead fits an existing category.

## Leads

### Fontsource (`fontsource`) — strong candidate
- [x] triage: assess
- URL: https://fontsource.org (repository: https://github.com/fontsource/fontsource)
- Role: open-source fonts (Google Fonts and other OFL families) published as versioned npm packages, such as `@fontsource/inter` and `@fontsource-variable/inter`, with the font files, CSS and per-subset WOFF2 inside.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `fonttools` subsets a font you already have, and `opentype-js` and `harfbuzz` read and shape it. Nothing in the catalogue says where a scene's fonts come from or pins their version. A lockfile entry such as `@fontsource/inter@5.3.0` pins the exact font bytes a browser capture or `satori` and `resvg` render uses, which removes the "system font fallback changed" class of drift.
- Route: library-or-runtime
- Licence: MIT for the tooling. Each font keeps its own licence (`@fontsource/inter` declares OFL-1.1), so check per family.
- Version: `@fontsource/inter` 5.3.0, published 2026-07-19 (npm registry). The monorepo has no single version.
- Stars: 6,301. Last push: 2026-11-09.
- Install: `pnpm add @fontsource/inter` (or `@fontsource-variable/<family>`).
- Caveats: package versions follow Fontsource's own scheme, not the upstream foundry version, so record both. The weights and subsets you import decide which files load. Unicode-range CSS can make Chromium fetch a subset lazily, so wait on `document.fonts.ready` before capture. Not every Google Fonts family is mirrored the same day.
- Found via: keyword dedupe sweep for font sources while checking the `fonts` and `cli` topics. It is the lower-priority "reproducible environment pinning" area.

### Maker.js (`makerjs`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://maker.js.org (repository: https://github.com/microsoft/maker.js)
- Role: a JavaScript library for 2D vector "models" (paths, arcs, Béziers, fonts through opentype.js). It does unions, offsets (outline and expand), chain detection and layout, then exports SVG, DXF, PDF and OpenJSCAD.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `paper-js` does path booleans in a browser canvas model. `vpype` optimises plotter SVG after it exists. `build123d` is 3D B-rep. Maker.js is a headless Node library for parametric 2D line work with real outline and offset operations and DXF out, which suits laser and plotter stills and technical line-art layers with no browser.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: `makerjs` 0.19.2, published 2026-01-27 (npm registry).
- Stars: 2,050. Last push: 2026-10-29.
- Install: `pnpm add makerjs`
- Caveats: the release cadence is slow; the last npm release is ten months old although commits continue. Text needs a font loaded through opentype.js. It has no animation model, so per-frame geometry has to be a pure function of `t` in your own code. SVG output precision has to be set for byte-stable files.
- Found via: GitHub topic search `topic:bezier`.

### Neothesia CLI (`neothesia-cli`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/PolyMeilex/Neothesia
- Role: a MIDI visualiser in Rust and wgpu, with a separate `neothesia-cli` recorder. The recorder takes a MIDI file, an optional SoundFont, a width and a height, renders the falling-notes waterfall and keyboard offscreen, synthesises audio with oxisynth and encodes a video through an FFmpeg encoder crate.
- Category: Discovery: research candidates.
- Gap vs neighbours: `fluidsynth` renders MIDI to audio only. `mido`, `pretty-midi` and `music21` read and write MIDI but draw nothing. `tone-js` drives browser synthesis. This produces a synced piano-roll picture and audio track from one MIDI file in one headless command, a ready-made layer for music explainers.
- Route: native-cli-or-scripting
- Licence: GPL-3.0. Fine to run as a tool; do not vendor it into distributed code.
- Version: app release v0.5.1, dated 16 October (the year is not shown on the releases page; unverified, probably 2026). `neothesia-cli/Cargo.toml` says 0.5.0 on master.
- Stars: 1,618. Last push: 2026-11-15.
- Install: unverified for macOS. There is no Homebrew formula in evidence. Building from source with `cargo build --release -p neothesia-cli` and a system FFmpeg is likely; the `build-ffmpeg` feature downloads and compiles FFmpeg instead. Whether release assets include a macOS arm64 CLI binary is unverified.
- Caveats: the look is fixed (themeable through its config, not authored), so it is a layer, not a scene engine. It renders with wgpu, so pixels may differ across GPU backends. Whether frame timing is a pure function of MIDI time is likely (it steps a playback state) but unverified. The bundled synthesis needs a SoundFont whose licence you have to check.
- Found via: GitHub topic search `topic:wgpu` (the wgpu seed neighbourhood).

### svg-path-commander (`svg-path-commander`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/thednp/svg-path-commander
- Role: a TypeScript library for SVG path data. It parses, normalises to absolute cubic form, converts arcs, reverses, optimises and applies 2D or 3D matrix transforms to the path string, and reports length, bounding box and point-at-length.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `svgo` optimises whole files. `svg-js` and `paper-js` hold a scene model. Morphing two paths in a seekable scene needs both reduced to matching cubic segments first. This does that path-string step with no DOM, so it runs in Node before `resvg` rasterises.
- Route: library-or-runtime
- Licence: MIT.
- Version: 2.4.0, published 2026-11-24 (npm registry).
- Stars: 305. Last push: 2026-11-24.
- Install: `pnpm add svg-path-commander`
- Caveats: point-at-length on arcs is numerical, so pin the version if sampled points must be byte-stable. Matching segment counts for a morph is your code's job; the library normalises but does not pair segments. The 3D transform path is a perspective projection, not real 3D.
- Found via: dedupe sweep of SVG path tools after `topic:bezier`. Neighbouring `veltman/flubber` is rejected below.

### bezier-easing (`bezier-easing`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/gre/bezier-easing
- Role: a dependency-free JavaScript function that turns CSS `cubic-bezier(x1, y1, x2, y2)` control points into an easing function `f(t)`.
- Category: A2. Animation and authored assets.
- Gap vs neighbours: `motion`, `anime-js` and `tween-js` bundle their own easings inside a runtime. `canvas-2d`, `drawsvg` and other pure-function-of-time scenes need just the easing curve. This matches the browser's CSS curve, so an eased value in a seekable canvas or Node render can match a CSS transition in a DOM capture.
- Route: library-or-runtime
- Licence: MIT.
- Version: 3.2.0, published 2026-10-07 (npm registry).
- Stars: 1,781. Last push: 2026-11-24.
- Install: `pnpm add bezier-easing`
- Caveats: it solves numerically (Newton-Raphson with a subdivision fallback). It matches Chromium's curve closely but not necessarily bit for bit, which matters only if you diff against a CSS capture. A tiny scope, possibly better as a technique note than a tool record.
- Found via: GitHub topic search `topic:bezier`.

### ambientCG API (`ambientcg-api`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://ambientcg.com (API docs: https://docs.ambientcg.com/)
- Role: a JSON API over the ambientCG library of CC0 PBR materials, HDRIs and models. `/api/v2/full_json` returns asset ids, categories, tags, dimensions, map lists and download folders. ZIPs come from `https://ambientcg.com/get?file=<assetId>_<res>-<format>.zip` (1K to 8K, JPG or PNG).
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: the inbox has `polyhaven-api` (CC0 HDRIs, textures and models), `physically-based-api` (measured material values) and `openverse-api` (images and audio). ambientCG is a second, larger CC0 material source with a scriptable search, useful for `blender`, `three-js` and `pov-ray` scenes. Its asset ids are stable, so a production can pin an asset by id and resolution.
- Route: remote-api
- Licence: assets are CC0 1.0 ("All ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License", docs.ambientcg.com/license). The API payload itself carries no licence field. API terms and rate limits are unverified.
- Version: API v2 confirmed live this run. A v3 is linked in the docs navigation; its status is unverified.
- Stars: n/a (hosted service). Last update: unverified.
- Install: none. `curl` or `fetch`.
- Caveats: a remote service. Cache the downloaded ZIP and record its hash, because nothing promises that an asset's files never change. Map naming (`_Color`, `_NormalGL`, `_NormalDX`) needs the right normal-map convention per renderer.
- Found via: dedupe sweep for openly-licensed asset APIs, a lower-priority area.

### Clipper2 (`clipper2`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/AngusJohnson/Clipper2 (WASM port on npm: `clipper2-wasm`)
- Role: a polygon library for boolean operations (union, difference, intersection, XOR), offsetting (inflate and deflate with miter, round and square joins), Minkowski sums and, since 2.0, constrained Delaunay triangulation.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `paper-js` booleans work on Béziers inside a canvas model and are known to fail on hard cases. `trimesh` and `build123d` are 3D. Clipper2 is the robust integer-coordinate 2D polygon engine that many CAD and slicer tools use. Offsetting outlines for stroke effects, inset-and-hatch plotter fills and shape unions all need it.
- Route: library-or-runtime
- Licence: BSL-1.0 (Boost Software License, permissive; not Business Source).
- Version: 2.0.1 (tag `Clipper2_2.0.1`), dated 19 December; the year is not shown and is unverified. npm `clipper2-wasm` 0.4.0, published 2026-05-18. Who maintains the WASM port is unverified.
- Stars: 2,523. Last push: 2026-10-28.
- Install: `pnpm add clipper2-wasm` for Node and browser. The C++ library is header and source only; a Homebrew formula is unverified.
- Caveats: it works on polygons only, so curves must be flattened first, and flattening tolerance decides output. Coordinates are integer-scaled internally, so pick and record the scale. Results are deterministic for fixed inputs. The older `clipper2-js` port (1.2.4, 2024-01-01) is stale; prefer the WASM build.
- Found via: dedupe sweep of polygon tools after `topic:bezier`.

### halftone-converter (`halftone-converter`) — niche-keep-in-mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/curegit/halftone-converter (PyPI: `halftone-converter`)
- Role: a Python CLI and library that converts raster images into halftone screens per channel (CMYK and others), with screen angle, pitch and dot shape.
- Category: A6. Image processing and colour.
- Gap vs neighbours: `g-mic` and `imagemagick` can fake halftones with ordered dither or filters. This models print halftoning with set screen angles and colour separation, which suits print-process looks the compositor reviews.
- Route: native-cli-or-scripting
- Licence: AGPL-3.0. Fine as a CLI, but do not bundle it into distributed code.
- Version: 2.6.14, uploaded to PyPI 2026-11-10.
- Stars: 42. Last push: 2026-11-10.
- Install: `uv tool install halftone-converter`. The CLI entry-point name is unverified.
- Caveats: stills only, so per-frame use costs one process per frame. Whether it uses ICC profiles for separation, and whether output is byte-stable, is unverified. AGPL.
- Found via: GitHub topic search `topic:halftone`.

### Practical-RIFE (`practical-rife`) — niche-keep-in-mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/hzwer/Practical-RIFE
- Role: a Python frame-interpolation script (`inference_video.py`). It multiplies frame rate (`--multi=2`, `--exp`) for a video or a folder of numbered PNGs, with `--fps`, `--scale` and `--ext`.
- Category: A5. Video and capture.
- Gap vs neighbours: `ffmpeg`'s `minterpolate` is motion-compensated but tends to smear. `real-esrgan` upscales and does not retime. RIFE gives clean in-betweens for slow-motion holds or for converting a 24 fps capture to 60 fps.
- Route: native-cli-or-scripting
- Licence: MIT. The README says the weight links (Google Drive, Baidu Netdisk) carry the same MIT licence.
- Version: no tagged releases. The newest model listed is 4.26 (2024-09-21), plus 4.25.lite (2024-10-20).
- Stars: 1,050. Last push: 2026-08-27.
- Install: clone and `uv pip install -r requirements.txt`, then download the model by hand. CPU and Apple MPS support is unverified.
- Caveats: weights come from Google Drive, which is fragile for pinned installs. Neural interpolation output can differ by device and PyTorch version, so it is not a deterministic render step. Use it on captured footage, not on VCR scenes that can simply render more frames. The model line has not moved since 2024.
- Found via: GitHub topic search `topic:frame-interpolation`.

## Seen but rejected
- veltman/flubber — the classic shape-morphing library, but its last push was 2022-11.
- velipso/polybooljs — polygon booleans; last push 2024-03. Clipper2 covers this.
- nihui/rife-ncnn-vulkan — Vulkan RIFE CLI; last push 2024-01.
- wulkano/Aperture — macOS screen recording; last push 2024-11.
- Developing-Gamer/agent-sim, x86sim/x86sim — run Apple's iOS Simulator runtime on Linux; Apple licence terms make this unsafe to recommend.
- LucasJRamos/spritekiln — procedural pixel-art sprites from YAML 3D models; licence NOASSERTION.
- TypesettingTools/Aegisub-Motion — motion-tracking data to ASS subtitles, but it is an Aegisub GUI plugin.
- baseplate-admin/resvg-py — a thin Python wrapper over catalogued `resvg`.
- meshy-dev/ThreeRT — real-time hardware ray tracing behind a three.js-style API; early, and the retired `react-three-gpu-pathtracer` covered the same ground.
- itgalaxy/webfont — icon-font generation, outside video and stills production.
- manoelpiovesan/dither-guy, tfuxu/Halftone — GUI apps (GPL-3.0).
- mcychan/nQuantCpp — GPL-3.0 C++ colour quantiser for Visual C++; `pngquant` and `libvips` cover this.
- Remocn/remocn — component library for Remotion, which is retired.
- baku89/glisp — an interactive Lisp substrate for creative software, not a headless renderer.
- cobanov/pixelart-gaussiansplat, willwaltz/globes — browser demos with no capture route.
- oil-oil/oil-motion, Leonxlnx/cinetic, nexu-io/motion-anything and other `motion-design` topic repos — agent skill or wrapper repos, already a rejected class.

## Method notes
- GitHub repository search (`gh api search/repositories`) worked; stars, licences and push dates come from it. The per-repo releases API returned 403 for repositories outside `conorluddy/vcr`, so release dates for Neothesia and Clipper2 come from release pages that omit the year. They are marked unverified.
- npm and PyPI registry JSON gave the versions and publish dates.
- `hn.algolia.com` returned non-JSON again, so Show HN was not scanned. The Homebrew new-formula commit search for 2026-11-17 onward listed 9 new formulae, none relevant (for example, dezoomify-cli was already rejected).
- Stargazer overlap was not run. Reverse dependencies were approximated with `topic:resvg` and `topic:wgpu` searches.
- Gap areas (maps, simulation, provenance, device capture, EXIF) gave nothing new after three W48 runs. The next run should rotate to seed neighbours (`opentype-js`, `libass`, `gltf-transform`) and the stargazer pass, not topic searches.
