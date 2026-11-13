---
type: discovery-digest
run_date: 2026-11-13
iso_week: 2026-W46
topics: [motion-graphics, wgsl, gltf, video-processing, generative-art, typesetting, parametric-design, procedural-generation, particles, gaussian-splatting, pen-plotter, device-frames, mockup, taichi, cloth-simulation, soft-body, fluid-simulation, maplibre, ios-simulator, screen-recording, content-credentials, wcag, photosensitivity, flash-detection, subtitles, terminal-recording, audio-analysis]
seeds: [resvg, build123d, vpype]
searches_used: 36
---
# Discovery leads — 2026-11-13
Summary line: 4 leads (0 in new categories). Fourth W46 run; the long tail is now heavily mined by earlier digests, so most hits were already reported and only genuinely new names are listed.

Facts below come from GitHub search metadata (stars, licence, last push) and the repo front pages. GitHub release pages were empty or undated on the fetched pages, so release dates are "unverified". Direct API reads of non-attached repos were denied.

## Leads

### raea — Render Anything Engine (`raea`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/shinyobjectz/raea
- Role: Rust/Bevy GPU engine that renders videos, motion graphics and 3D scenes authored as React/TypeScript, from the CLI to MP4 or a single PNG frame (`--frame N`).
- Category: A5. Video and capture (neighbours: `remotion`, `revideo`, `hyperframes`).
- Gap vs neighbours: a native GPU renderer with no browser step, which is the opposite trade-off to `remotion`/`hyperframes` (Chromium capture). The README reports 90 frames in about a second on Apple Silicon, but that is the project's own claim.
- Route: native-cli-or-scripting.
- Licence: FSL-1.1-ALv2 (source-available; no use in a competing product; each version converts to Apache-2.0 two years after release). Flag for licence review; not OSI open source.
- Version: v0.1.1 (first full release); date unverified.
- Stars: ~2.3k (search: 2,294). Last push: 2026-11-13.
- Install: `curl -fsSL https://raea.io/install | sh` (macOS/Linux); the pipe-to-shell installer needs inspection before use.
- Caveats: determinism and display-free rendering not stated (unverified). Windows build least tested. Early version, API likely to move.
- Found via: GitHub topic `motion-graphics`.

### kinetograph (`kinetograph`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/0xS4N4TG/kinetograph
- Role: programmatic video engine for agents; renders from TypeScript (Remotion-style API) or plain HTML without a browser, with a Rust GPU compositor driven from Node.
- Category: A5. Video and capture.
- Gap vs neighbours: same niche as `raea`, but npm-delivered with prebuilt macOS arm64 binaries, so it is the easier of the two to trial on the target platform. Overlaps `remotion`, `revideo`, `diffusion-studio-core`.
- Route: library-or-runtime.
- Licence: Apache-2.0.
- Version: 0.3.0 (beta); release date unverified (Releases section empty).
- Stars: ~512. Last push: 2026-11-13.
- Install: `npm install kinetograph && npx kinetograph doctor` (Node 22+; prebuilt for macOS Apple Silicon, Linux x64, Windows x64).
- Caveats: determinism not stated; "plain HTML without a browser" implies a partial CSS/HTML implementation whose coverage is unverified; Web Audio is rendered offline as a side input. APIs may change between versions.
- Found via: GitHub topic `motion-graphics`.

### SPZ (`spz`) — niche-keep-in-mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/nianticlabs/spz
- Role: compressed file format and C++ library for 3D Gaussian splats (`.spz`, about 10x smaller than PLY), with Python bindings, a WASM/TypeScript build and CLI tools.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: the splat-transform lead (`splat-transform`) converts and processes splats; SPZ is the interchange format those tools read and write, relevant if splats are stored or delivered compactly.
- Route: library-or-runtime.
- Licence: MIT.
- Version: no releases listed; format spec at version 4 (per README). Date unverified.
- Stars: ~943. Last push: 2026-11-13.
- Install: `pip install .` from a clone (PyPI/npm package unverified); CMake for C++.
- Caveats: format library, not a renderer. Worth cataloguing only if splat workflows are adopted.
- Found via: GitHub topic `gaussian-splatting`.

### dgenerate (`dgenerate`) — niche-keep-in-mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/Teriks/dgenerate
- Role: scriptable CLI and library for batch image and animation generation with diffusion models, including per-frame processing of existing animations.
- Category: A9. Adjacent resources mentioned during discovery (generative image/video; neighbours `comfyui`, `rembg`).
- Gap vs neighbours: `comfyui` is node-graph driven; dgenerate has a scripting language with explicit seeds, which suits batch variants. Seed determinism across hardware is unverified.
- Route: native-cli-or-scripting.
- Licence: BSD-3-Clause for the code. Model weights carry their own terms (unverified, per model).
- Version: 6.0.0 (branch/tag); release date unverified.
- Stars: ~44. Last push: 2026-11-13.
- Install: platform installers on the releases page; Python 3.11+ (not 3.14.1 or 3.15+); Apple Silicon listed.
- Caveats: generative models are non-deterministic across devices; heavy dependencies; low star count.
- Found via: GitHub topic `video-processing`.

## Seen but rejected
- fosfora — real-time audio visualiser/VJ engine; no seekable offline render path stated.
- ooosplat — desktop GUI app for splat training, not scriptable.
- spirula-studio — GPL-3.0 splat trainer needing Vulkan or CUDA; poor macOS fit.
- boxesandglue — Go PDF library with TeX algorithms; print typesetting, same ground as the reported `typst`/`sile`; not examined further.
- pdfje, aRtsy — PDF writer for Python and an R generative-art package; no motion or video relevance.
- party-js — browser confetti/particle library; not seekable (unverified) and minor.
- three-live, creator-generalist, nodetool — agent-facing workspaces/skills without a clear headless renderer; nodetool is AGPL-3.0.
- GRBL-Plotter, BambuScribe, axidraw-web — plotter hardware senders, not render tools.

## Method notes
- `hn.algolia.com` was unreachable from this session (host not in the allowed network list); the Show HN and Homebrew-new-formulae feeds were not scanned. Stargazer overlap and reverse-dependency passes were skipped for the same reason.
- The topics `photosensitivity`, `flash-detection`, `cloth-simulation` and `soft-body` returned no repos in range, and keyword searches for flash/photosensitivity, contact-sheet/frame-sampling, C2PA video signing and caption linting returned nothing new.
- Direct API reads of repos outside the attached one were denied, so details came from front-page fetches; release dates and last-commit dates marked "unverified" could not be read there.
- Deduped against `catalog/tools`, `catalog/retired`, `prospects/inbox` on main and every `discovery/*` branch.
