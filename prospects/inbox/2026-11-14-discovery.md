---
type: discovery-digest
run_date: 2026-11-14
iso_week: 2026-W46
topics: [pmtiles, openstreetmap, c2pa, ffmpeg, svg, sdf, audio-visualization, procedural-generation, pen-plotter, typesetting, particles, accessibility, frame-interpolation, contact-sheet, video-quality, hdr, localization, screenshot, ios-simulator, exif, physics-simulation, lottie, cad, color-science, sph, mpm, cartography, variable-fonts, sprite-sheet, waveform, subtitle, rust-svg]
seeds: []
searches_used: 56
---
# Discovery leads — 2026-11-14
Summary line: 9 leads (1 in a new category). This is the fourth W46 run. Earlier digests had already mined the core topics, so this run went after topic pairs not yet tried (physics-simulation, sph, color-science, screenshot, ios-simulator, contact-sheet, cartography) and lists only names that appear in no earlier digest.

Stars and last-push dates come from GitHub search metadata. Versions and dates come from PyPI, crates.io and the Homebrew formula API where those are named. Everything else comes from repo front pages. Direct GitHub API reads of non-attached repos were denied.

## Leads

### 🆕 new category: app-preview and device capture — baguette (`baguette`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/tddworks/baguette (docs: https://tddworks.github.io/baguette/)
- Role: headless control of Apple's iOS Simulators from a CLI: boot, tap, swipe, multi-finger gestures, accessibility-tree reads, `screenshot` and `record`, with an output-size option for App Store dimensions.
- Category: new category "app-preview and device capture". The category was proposed by `sim-use` (2026-11-02 digest) and is not yet in the catalogue.
- Gap vs neighbours: `sim-use` (inbox) and `playwright` (catalogued, browser only). baguette drives native simulator apps with scripted gestures on stdin (`baguette input`, JSON), so an app-preview capture can be repeated. It also has device-bezel and 3D device renders in its web UI.
- Route: native-cli-or-scripting.
- Licence: Apache-2.0.
- Version: 0.2.14 (Homebrew stable); release date unverified.
- Stars: 2,282. Last push: 2026-11-07.
- Install: `brew install baguette`. The formula requires arm64, macOS 26 and Xcode 26.
- Caveats: needs a very recent OS and Xcode, which narrows the machines it runs on. Simulator capture is real-time, not frame-seekable, so determinism depends on scripted input and app state. Whether bezel and 3D renders can be produced headlessly, rather than only in `baguette serve`, is unverified.
- Found via: GitHub topic search `simulator` + `ios` + `cli`.

### claude-real-video (`claude-real-video`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/HUANGCHIHHUNGLeo/claude-real-video
- Role: turns a video into keyframes chosen by scene change, with a density floor and dedupe, plus `frames.json` timestamps, a transcript and optional 3×3 contact-sheet grids (`--grid`). Has a CLI (`crv`), a Python API and an MCP server (`crv-mcp`).
- Category: A5. Video and capture. It fits the lower-priority gap "agent-facing visual review (contact sheets, frame sampling, MCP servers)".
- Gap vs neighbours: `pyscenedetect` (catalogued) finds cuts only. `ffmpeg-ffprobe` and `imagemagick` can build contact sheets by hand. crv packages frame selection, dedupe and grids as a single step whose output an agent can read, which is close to what reviewer agents need to sample a render.
- Route: native-cli-or-scripting.
- Licence: MIT. A separate paid add-on, "crv Pro", is not open source; only the MIT core is in scope.
- Version: 0.10.7 (PyPI, 2026-09-26).
- Stars: 2,313. Last push: 2026-10-23.
- Install: `uv tool install "claude-real-video[whisper]"` (or pip). Needs system `ffmpeg`/`ffprobe`; `[mlx]` extra for Apple Silicon transcription.
- Caveats: dedupe thresholds are heuristics, so check whether the same input always gives the same frame set (unverified). Whisper transcription is model-dependent. `yt-dlp` URL download is out of scope for VCR.
- Found via: GitHub topic search `ffmpeg` + `cli`.

### Pymunk (`pymunk`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://www.pymunk.org/ (repo: https://github.com/viblo/pymunk)
- Role: Python 2D rigid-body physics on Chipmunk2D, stepped manually with a fixed `dt`. Space state can be copied and pickled.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `matter-js` and `rapier` (catalogued) are JavaScript/WASM. Pymunk gives a Python-side bake for scenes that feed `vsketch`, `manim-community` or `blender`, and pickling Space state lets a simulation be cached mid-run.
- Route: library-or-runtime.
- Licence: MIT.
- Version: 7.3.1 (PyPI, 2026-10-11).
- Stars: 1,082. Last push: 2026-11-13.
- Install: `uv add pymunk` (wheels on PyPI; macOS arm64 wheel availability unverified).
- Caveats: the docs recommend a constant time step but make no determinism claim, so cross-machine reproducibility is unverified. Pickles only load in the same Pymunk version.
- Found via: GitHub topic search `physics-simulation` + `python`.

### Salva (`salva`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/dimforge/salva
- Role: 2D and 3D particle-based (SPH) fluid simulation library in Rust, from the same organisation as Rapier, with optional Rapier coupling.
- Category: A8. Physics, audio and 3D assets. It joins the proposed "fluid / particle simulation" grouping from `splishsplash` (inbox).
- Gap vs neighbours: `rapier` (catalogued) is rigid bodies only. `splishsplash` (inbox) is a C++ research code. Salva can be embedded as a crate next to Rapier to bake particle positions per fixed step.
- Route: library-or-runtime.
- Licence: Apache-2.0.
- Version: 0.11.0 (`salva2d`/`salva3d` on crates.io, 2026-11-01).
- Stars: 716. Last push: 2026-11-01.
- Install: `cargo add salva3d` (or `salva2d`).
- Caveats: library only, with no CLI, so VCR would need a small baking binary. Surface reconstruction for rendering is not included (`splashsurf` covers that). Determinism is unverified.
- Found via: GitHub topic search `sph`.

### colour-science (`colour-science`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://www.colour-science.org/ (repo: https://github.com/colour-science/colour)
- Role: Python library of colour-science algorithms covering colour-space conversions, colour-difference (ΔE) metrics, transfer functions and colour appearance models.
- Category: A6. Image processing and colour.
- Gap vs neighbours: `opencolorio` (catalogued) applies configured transforms but does not measure. colour-science gives scripted checks, such as ΔE between a render and the brief's palette tokens or out-of-gamut detection, that the art-director and look-developer reviewers could cite.
- Route: library-or-runtime.
- Licence: BSD-3-Clause.
- Version: 0.4.7 (PyPI, 2025-12-06).
- Stars: 2,694. Last push: 2026-11-13.
- Install: `uv add colour-science`.
- Caveats: pure computation, so it is deterministic up to NumPy floating point. It is large, and VCR would use only a handful of functions. The sibling `colour-hdri` and `colour-checker-detection` packages are separate.
- Found via: GitHub topic search `color-science`.

### drawsvg (`drawsvg`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/cduck/drawsvg
- Role: Python library that writes SVG programmatically. It supports SVG-native (SMIL-style) animation and frame-by-frame export to GIF, MP4 or a PNG spritesheet.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `svg-js` and `two-js` (catalogued) are JavaScript. `vsketch` (catalogued) targets plotters. drawsvg is a Python way to write SVG frames that `resvg` can then rasterise, which avoids its own Cairo rasteriser.
- Route: library-or-runtime.
- Licence: MIT.
- Version: 2.4.2 (PyPI, 2026-08-12).
- Stars: 697. Last push: 2026-10-29.
- Install: `uv add drawsvg`. Raster output (`drawsvg[all]`) needs Cairo from `brew install cairo`.
- Caveats: Cairo rasterisation ignores patterns and custom fonts, so VCR should rasterise through `resvg` instead. Its own MP4 path should be checked against VCR's FFmpeg delivery path.
- Found via: GitHub topic search `svg` + `animation`.

### termframe (`termframe`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/pamburus/termframe
- Role: non-interactive terminal emulator. It runs one command in a virtual session and writes the output as an SVG screenshot, with themes, ANSI and truecolour support, and optional font embedding.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `freeze` (candidate) and `vhs` (catalogued). termframe's output is SVG, so it can go into `resvg` or be animated with SVG/GSAP, and fonts can be embedded so that rendering does not depend on the host's fonts.
- Route: native-cli-or-scripting.
- Licence: MIT.
- Version: 0.10.0 (Homebrew stable); release date unverified.
- Stars: 146. Last push: 2026-11-13.
- Install: `brew install termframe`.
- Caveats: overlaps heavily with `freeze`. Determinism is not stated. Commands with time-varying output need pinning.
- Found via: GitHub topic search `screenshot` + `cli`.

### FontCollector (`fontcollector`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/moi15moi/FontCollector
- Role: CLI that finds and collects the fonts an ASS subtitle file references, and can mux them as attachments, so styled subtitles render the same on another machine.
- Category: A5. Video and capture (subtitle delivery).
- Gap vs neighbours: `libass` (candidate) renders ASS but does not resolve or package fonts. `fonttools` (catalogued) works on font files, not subtitle scripts. FontCollector closes the "missing font" failure for styled subtitle deliverables.
- Route: native-cli-or-scripting.
- Licence: MIT.
- Version: 4.0.4 (PyPI, 2026-09-21).
- Stars: 59. Last push: 2026-10-31.
- Install: `uv tool install FontCollector`. Muxing needs `mkvmerge` (MKVToolNix), and the exact flags are unverified.
- Caveats: ASS only. Relevant only if VCR delivers MKV with burned or soft styled subtitles.
- Found via: GitHub topic search `variable-fonts`.

### GeoVista (`geovista`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/bjlittle/geovista
- Role: cartographic rendering and mesh analytics on PyVista/VTK. It renders globes, projections and geospatial meshes, with off-screen screenshots through PyVista.
- Category: joins proposed category "maps and geo motion" (`pmtiles`, `planetiler`, `maplibre-native` in the inbox).
- Gap vs neighbours: `three-globe` (inbox) and `deck-gl` (catalogued) need a browser. GeoVista renders globes and gridded data (for example climate fields) natively in Python.
- Route: library-or-runtime.
- Licence: BSD-3-Clause.
- Version: 0.5.3 (PyPI, 2024-10-21). That release is over 12 months old, but commits are active.
- Stars: 234. Last push: 2026-11-14.
- Install: `uv add geovista` (VTK wheels for macOS arm64 unverified).
- Caveats: its last PyPI release is stale, so check for a newer release before assessing. Off-screen VTK rendering on macOS without a display is unverified.
- Found via: GitHub topic search `cartography` + `python`.

## Seen but rejected
- video-compare (pixop) — GPL-2.0, a frame-stepping comparison player with the SDL window only and no headless output. Relevant to human review (P3 review pages) but fails the headless filter. `brew install video-compare` (version 20261004).
- termshot — overlaps `freeze` and `termframe` and outputs PNG only.
- easyVmaf — thin Python wrapper over `vmaf` (candidate) and FFmpeg.
- VideoMetricsLab — NVIDIA GPU-only metrics runner.
- itu-p1203 — streaming QoE model, out of scope.
- strypt — metadata stripping only; the `exiftool` and `exiv2` inbox leads cover it.
- caddiff — narrow STEP assembly diff; `build123d` neighbours already covered.
- sweetpad — Xcode build tooling, not capture.
- python-mss — live screen grabbing, not deterministic.
- optimo — thin preset wrapper over ImageMagick and FFmpeg.
- protomaps/basemaps — already referenced in the 2026-11-02 digest under `planetiler`.
- wavefont — a typeface, not a tool (OFL-1.1). It could be useful later as a waveform-glyph asset.
- lini — diagram DSL; `d2`, `mermaid-cli` and `graphviz` are catalogued.
- Orkas-VideoStudio, vibeframe — agent wrappers around paid generative-video APIs.
- instruktlabs/kiln — procedural 3D assets through MCP. Not inspected this run, so worth a look next run.
- SWIFT, sphexa, Shamrock, OpenSPH, spheral — HPC astrophysics codes, out of scope.
- squishy_volumes (MPM in Blender) — AGPL-3.0.
- Raw-Alchemy, NegPy — AGPL-3.0 and GPL-3.0 photo-grading apps.
- speedata Publisher, rinohtype — AGPL-3.0 typesetters.

## Method notes
- Branch `discovery/2026-W46` and two dated W46 branches were already merged and no discovery PR was open, so this run uses `discovery/2026-W46-20261114`.
- Deduped against all 182 `catalog/tools` ids, `catalog/retired`, and all 11 earlier digests on main (every earlier `discovery/*` branch is merged).
- GitHub repository and commit search worked. Per-repo API calls (releases, stargazers, dependents) returned 403 for repos outside `conorluddy/vcr`, so stargazer-overlap and reverse-dependency passes were not possible and `seeds` is empty.
- `formulae.brew.sh` and `hn.algolia.com` were reachable this run. Homebrew new formulae since 2026-11-06 (via `homebrew-core` commit search) had nothing relevant beyond `csound-plugins`, and `csound` is catalogued. Show HN for the week had nothing that qualified. Changelog Nightly was not tried.
- Searches with no repos in range: `topic:localization topic:video`, `topic:lottie topic:cli`, `topic:sprite-sheet topic:cli`, `topic:waveform topic:cli`, `topic:subtitle topic:rust`, `topic:sdf topic:cli`.
- Over budget: about 56 calls (33 GitHub searches, about 15 registry lookups, 6 page fetches, 2 HN calls) against a budget of 40.
- Release dates marked unverified could not be read: GitHub release sections were empty on the fetched pages.
