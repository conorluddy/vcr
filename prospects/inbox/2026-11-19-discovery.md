---
type: discovery-digest
run_date: 2026-11-19
iso_week: 2026-W47
topics: [parametric-design, cad, motion-graphics, procedural-generation, gaussian-splatting, content-credentials, c2pa, vector-tiles, maplibre, mockup, wcag, soft-body, cloth-simulation, svg, music-notation, data-visualization, typesetting, screen-recording, subtitles, audio-visualization, font, animation]
seeds: [resvg, wgpu, vpype, gltf-transform]
searches_used: 65
---
# Discovery leads — 2026-11-19

Summary line: 8 leads (2 in a new category: music notation engraving).

## Leads

### 🆕 new category: music notation engraving — Verovio (`verovio`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://www.verovio.org (source: https://github.com/rism-digital/verovio)
- Role: engraves MEI, MusicXML, Humdrum and ABC scores to SVG from a native CLI, a Python module or a JS/WASM toolkit.
- Category: new category: music notation engraving (could sit under A8 beside `music21` and `mido`).
- Gap vs neighbours: `music21` and `mido` read and write symbolic music but do not engrave it. Nothing catalogued turns a score into vector notation for on-screen music, education or lyric videos.
- Route: native-cli-or-scripting
- Licence: LGPL-3.0-only ⚠ (copyleft library; using the CLI as a separate process is the low-friction route).
- Version: 6.4.1 (npm 2026-11-03; same version on Homebrew and PyPI).
- Stars: 980. Last push: 2026-11-18.
- Install: `brew install verovio` (arm64 Sequoia/Tahoe bottles); `uv pip install verovio`; `pnpm add verovio`.
- Caveats: SVG output depends on the bundled SMuFL music font and option set. Pin both before comparing outputs. The SVG is static; timing for animated playback comes from its MIDI/timemap export, which is unverified here.
- Found via: GitHub topic search `music-notation`.

### Vello and vello_cpu (`vello`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/linebender/vello
- Role: Rust 2D vector renderer. `vello` runs on the GPU through wgpu compute shaders; `vello_cpu` is a CPU rasteriser with the same scene model; `vello_svg` renders SVG through either.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `resvg` (tiny-skia) is CPU-only SVG; `canvaskit-skia` and `thorvg` are other engines. Vello offers a GPU path for heavy vector scenes, and `vello_cpu` a headless CPU path, from the same Linebender stack that `resvg` already comes from.
- Route: library-or-runtime
- Licence: Apache-2.0 OR MIT.
- Version: vello 0.12.0 and vello_cpu 0.4.0 (both crates.io 2026-11-11).
- Stars: 4,515 (above the usual range; it came up through wgpu reverse dependencies). Last push: 2026-11-16.
- Install: `cargo add vello` or `cargo add vello_cpu` (Rust ≥ 1.89).
- Caveats: pre-1.0, with a breaking release about every six weeks. GPU output can differ across adapters, so use `vello_cpu` for golden-frame comparisons. Whether `vello_cpu` gives byte-identical output across machines is unverified.
- Found via: crates.io reverse dependencies of `wgpu` (seed).

### Ranim (`ranim`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/AzurIce/ranim (docs: https://azurice.github.io/ranim/)
- Role: Manim-style programmatic animation engine in Rust. Scenes are Rust functions; a CLI (`output`, `render`, `inspect`) renders them offline through wgpu and FFmpeg.
- Category: A2. Animation and authored assets.
- Gap vs neighbours: `manim-community` (Python, Cairo/OpenGL) and `motion-canvas` (TypeScript, editor-driven). Ranim is a compiled, GPU-rendered option with a WASM preview host. Examples can embed `typst` output.
- Route: library-or-runtime
- Licence: MIT.
- Version: 0.2.1 (crates.io 2026-05-28). The README targets an unreleased v0.3 App/Plugin API.
- Stars: 664. Last push: 2026-11-17.
- Install: `cargo add ranim` (FFmpeg on PATH).
- Caveats: the README marks it WIP with unstable APIs. If FFmpeg is not found it downloads an FFmpeg binary into the working directory; always provide `ffmpeg` on PATH. GPU rendering means output may vary by adapter (unverified).
- Found via: GitHub topic search `animation` + `rust`.

### Framefields (`framefields`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://framefields.dev (source: https://github.com/gatewai-dev/framefields)
- Role: TypeScript code-first video, compositing, motion-graphics and 3D renderer. It renders through Dawn/WebGPU with no browser and writes hardware-encoded MP4.
- Category: A5. Video and capture.
- Gap vs neighbours: `hyperframes`, `revideo` and `diffusion-studio-core` render through a browser or the DOM; `dawn-node-webgpu` is the bare runtime. Framefields bundles the whole film pipeline on native WebGPU. It is the closest direct competitor to VCR's own approach, so it is worth studying even if it is not adopted.
- Route: library-or-runtime
- Licence: Apache-2.0 (code). ⚠ The optional SAM 3 tracking uses the Meta SAM License and must be accepted explicitly. The optional AI gateway is a hosted service that needs an `FRAMEFIELDS_API_KEY`.
- Version: 3.0.2 (npm 2026-11-13). The first npm release was 2.0.2 on 2026-10-05.
- Stars: 525. Last push: 2026-11-18. Repo created 2026-10-02.
- Install: `pnpm dlx framefields init my-film --install` (Node ≥ 22; Metal on macOS).
- Caveats: very young, with two major versions in six weeks. Hardware encoding and GPU rendering may not be byte-stable across machines (unverified). Keep the hosted gateway out of any VCR route.
- Found via: GitHub topic search `motion-graphics`.

### OpenSheetMusicDisplay (`opensheetmusicdisplay`) — worth cataloguing (joins proposed category "music notation engraving")
- [x] triage: assess
- URL: https://opensheetmusicdisplay.org (source: https://github.com/opensheetmusicdisplay/opensheetmusicdisplay)
- Role: renders MusicXML to SVG (VexFlow-based) in a browser, or headless in Node to SVG or PNG.
- Category: new category: music notation engraving.
- Gap vs neighbours: a permissive-licence alternative to `verovio` for MusicXML. Its SVG carries semantic classes (`vf-stavenote`, `osmd-lyrics`), so a seekable scene can recolour or animate individual notes, and a cursor API follows playback position.
- Route: library-or-runtime
- Licence: BSD-3-Clause.
- Version: 2.3.1 (npm 2026-11-12).
- Stars: 2,022. Last push: 2026-11-18.
- Install: `pnpm add opensheetmusicdisplay` (headless PNG also needs `jsdom` and `@napi-rs/canvas`).
- Caveats: the headless route is a repo test script (`test/Util/generateImages_browserless.mjs`) that simulates a DOM with jsdom, not a packaged CLI. Font metrics under jsdom may differ from Chromium.
- Found via: GitHub topic search `music-notation`.

### PlutoBook (`plutobook`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/plutoprint/plutobook
- Role: C/C++ paged HTML and CSS layout engine that renders to PDF or PNG without a browser. The `plutoprint` Python package wraps it.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `satori` handles a JSX/CSS subset to SVG; `playwright` needs Chromium; `typst` is its own markup. PlutoBook renders real HTML and CSS to bitmaps natively, which suits title cards, documents and text-heavy stills.
- Route: library-or-runtime
- Licence: MPL-2.0.
- Version: Homebrew 0.20.0; plutoprint 0.23.0 (PyPI 2026-10-20). The release date of the upstream library tag is unverified.
- Stars: 349. Last push: 2026-11-19.
- Install: `brew install plutobook` (arm64 bottles); `uv pip install plutoprint`.
- Caveats: aimed at static, print-style layout. JavaScript execution and CSS animation support are unverified (probably absent), so motion has to be driven by rendering one page per frame. Whether the `plutoprint` CLI can write PNG is unverified.
- Found via: GitHub topic search `svg`.

### reladraw (`reladraw`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/reladraw/reladraw (playground: https://reladraw.github.io/reladraw/)
- Role: text diagram language with relative placement ("below", "right of", explicit gaps). `reladraw render` writes SVG, and it ships its own agent skill.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `graphviz`, `d2` and `mermaid-cli` place nodes automatically. reladraw keeps layout in the author's hands while staying text-first, so positions stay stable between diagram versions, which helps diagram-build animations.
- Route: native-cli-or-scripting
- Licence: Apache-2.0.
- Version: 0.32.0 (npm 2026-11-19).
- Stars: 1,201. Last push: 2026-11-18. Repo created 2026-09-07.
- Install: `pnpm add -g reladraw`.
- Caveats: the README warns that the syntax changes frequently, so pin the version. It has zero runtime dependencies, which favours deterministic SVG (not verified).
- Found via: GitHub topic search `svg`.

### c2pa-ts (`c2pa-ts`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/TrustNXT/c2pa-ts
- Role: pure TypeScript C2PA manifest reading, validation and creation.
- Category: A5. Video and capture (beside `c2patool`).
- Gap vs neighbours: `c2patool` is a native CLI. c2pa-ts would let a Node or browser pipeline read or attach Content Credentials in-process without shelling out.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: 0.14.1 (npm `@trustnxt/c2pa-ts`, 2026-10-08).
- Stars: 20 (small). Last push: 2026-10-16.
- Install: `pnpm add @trustnxt/c2pa-ts`.
- Caveats: pre-1.0, a small project; which media formats and signing support are covered is unverified. Prefer `c2patool` unless an in-process JS route is needed.
- Found via: GitHub topic search `c2pa`.

## Seen but rejected
- KhronosGroup/glTF-Validator — `gltf-transform validate` already wraps it; last npm release 2024-10-22.
- Gaussian-Splat-Lite (Three.js 3DGS renderer, Apache-2.0, 1.9.0) — viewer-first. Splat sort order makes frame stability a concern, and `splat-transform` covers asset preparation. Revisit if splat rendering is scoped.
- nannou — Rust creative-coding framework (MIT OR Apache-2.0, 0.20.0, 2026-06-22). Window-driven, with no documented headless offline export; overlaps `ranim` and `p5-js`.
- staryone/motlab — created 2026-11-16 (three days old), a VCR-like agent video pipeline.
- ZhouXiaolin/opencat — JSONL/XML to video for agents, but no licence.
- omacom/ttfx — terminal text effects (MIT), real-time only, not seekable; recording it through `vhs` would be the only route.
- lzpel/cadrum, timschmidt/csgrs, mitcad, shapecraft, sketchcraft, FluidCAD — CAD kernels or apps that `build123d` already covers, or GUI-first.
- MuTsunTsai/fontfreeze — mainly a web app; `fonttools` instancer covers freezing variable fonts.
- TrailReplay — GPX to 3D replay video, but NOASSERTION licence and browser-only.
- mermaidx — Python Mermaid renderer overlapping `mermaid-rs-renderer`.
- abcjs, alphaTab — NOASSERTION licences on GitHub; OSMD and Verovio cover notation.
- palantir/typesettable, andrewcourtice/ripl, floweaver — narrow or framework-bound.
- Motion-graphics "skills" and agent wrapper repos (motion-graphics-agent, givemotion, ghost-editor, motion-anything, design-agent, claude-animation-skills) — skills or wrappers, not tools.
- Map tile servers and app SDKs (tegola, mvt-rs, maplibre-compose, flutter-maplibre, terra-draw) — servers, mobile SDKs or interactive editors, not render tools.
- Accessibility results under `wcag` — web-UI auditing (alfa, a11y-checker, accessibility-agents), not video.
- `soft-body` and `cloth-simulation` — only robot-learning physics (alloy) and a GUI demo (esimov/cloth-physics).

## Method notes
- Over budget: about 65 calls against a budget of about 40. They were 30 GitHub searches (27 repository searches, 1 per-repo metadata batch, 1 homebrew-core commit search, 1 Vello/nannou metadata search), 7 raw README fetches, about 22 npm, crates.io, PyPI and Homebrew lookups, 5 Show HN queries, 1 stargazer call and 1 deps.dev call.
- `hn.algolia.com` returned non-JSON bodies again, so Show HN was not scanned. Changelog Nightly was not tried.
- Stargazer overlap (seed `vpype`) could not run: the GitHub API returned 403 for repositories outside `conorluddy/vcr`. deps.dev returned "package not found" for `resvg` dependents. crates.io reverse dependencies of `wgpu` worked and surfaced Vello. Neighbours for `vpype` and `gltf-transform` were approximated with README text search; they turned up only already-known or off-target projects.
- Homebrew new formulae since 2026-11-11 (curl-impersonate, globus-cli, goose-lang, ssh-tpm-agent, libpkl) — nothing relevant.
- Deduped against the 229 records in `catalog/tools` and `catalog/retired` and all 15 earlier digests (2026-11-01 to 2026-11-18). No open `discovery/` PR existed. `discovery/2026-W47` and `discovery/2026-W47-20261118` were already merged, so this run uses `discovery/2026-W47-20261119`.
- Unverified: Verovio timemap behaviour; vello_cpu byte-identical output across machines; Ranim and Framefields cross-GPU determinism; PlutoBook JS/CSS-animation support and plutoprint PNG CLI; the PlutoBook upstream release date; c2pa-ts format coverage.
