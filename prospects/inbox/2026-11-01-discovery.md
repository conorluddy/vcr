---
type: discovery-digest
run_date: 2026-11-01
iso_week: 2026-W44
topics: [photosensitivity, c2pa, maplibre, pmtiles, fluid-simulation, gaussian-splatting, typesetting, pen-plotter, terminal-recording, device-frames]
seeds: [vpype, opentype-js]
searches_used: 34
---
# Discovery leads — 2026-11-01

Summary line: 6 leads (4 in new categories).

Metadata below comes from GitHub repository search results (stars, last push, licence field). Per-repo API calls (releases, READMEs) were blocked by session scope, so version/date, install commands and determinism caveats are "unverified" unless stated. This is a first inbox file: `prospects/inbox/README.md` does not exist on main, so the format follows the task brief.

## Leads

### splat-transform (`splat-transform`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/playcanvas/splat-transform
- Role: CLI and library for 3D Gaussian splat processing and conversion (ply, compressed ply, sog and similar).
- Category: 3d / asset-processing (existing); sits beside the Gaussian-splat pipeline.
- Gap vs neighbours: `colmap` and `nerfstudio` produce splats; `gltf-transform` and `meshoptimizer` cover meshes only. Nothing catalogued converts, filters or compresses splats.
- Route: native-cli-or-scripting (library also available; unverified)
- Licence: MIT
- Version/date: unverified
- Stars: 1407. Last push: 2026-10-29
- Install: unverified (expected npm / `npx`)
- Caveats: deterministic file transforms expected; unverified.
- Found via: GitHub topic search `gaussian-splatting`.

### SPlisHSPlasH + splashsurf (`splishsplash`) — 🆕 new category: fluid / particle simulation — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/InteractiveComputerGraphics/SPlisHSPlasH (companion: https://github.com/InteractiveComputerGraphics/splashsurf)
- Role: SPH fluid simulation library with a Python binding and CLI. splashsurf is a Rust CLI that reconstructs surface meshes from the particle output, so a bake becomes a mesh sequence.
- Category: new category: simulation (fluid, beyond rigid bodies)
- Gap vs neighbours: `rapier`, `matter-js`, `react-three-rapier` are rigid-body only. `blender` has fluid sims but not as a standalone bakeable solver.
- Route: native-cli-or-scripting (SPlisHSPlasH), library-or-runtime (Python bindings; unverified)
- Licence: MIT (both)
- Version/date: unverified
- Stars: 1940 (SPlisHSPlasH), 313 (splashsurf). Last push: 2026-10-28 and 2026-09-01
- Install: unverified (splashsurf likely `cargo install`; SPlisHSPlasH build from source or pip; arm64 unverified)
- Caveats: fixed-timestep, bakeable output. Float reproducibility across machines unverified.
- Found via: GitHub topic search `fluid-simulation`.

### c2pa-rs / c2patool (`c2pa`) — 🆕 new category: provenance and metadata — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/contentauth/c2pa-rs (CLI: https://github.com/contentauth/c2patool, 159 stars)
- Role: Rust SDK and CLI to read, sign and verify C2PA Content Credentials in images and video.
- Category: new category: provenance and metadata
- Gap vs neighbours: `mediainfo` and `ffmpeg-ffprobe` inspect technical metadata only. Nothing signs or verifies provenance on delivered renders.
- Route: native-cli-or-scripting
- Licence: search reports NOASSERTION; believed MIT/Apache-2.0 dual, unverified
- Version/date: unverified
- Stars: 438 (c2pa-rs). Last push: 2026-11-01
- Install: unverified (`brew`/`cargo` likely; c2patool may have been folded into c2pa-rs)
- Caveats: signing needs certificates; signed output embeds timestamps, so not byte-reproducible. Container support for the formats VCR emits unverified.
- Found via: GitHub topic search `c2pa`.

### PMTiles / go-pmtiles (`pmtiles`) — 🆕 new category: maps and geo motion — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/protomaps/go-pmtiles (spec: https://github.com/protomaps/PMTiles, 3099 stars)
- Role: single-file executable to create, extract and serve PMTiles vector-tile archives. An offline basemap source for map-based motion graphics.
- Category: new category: maps and geo motion
- Gap vs neighbours: `deck-gl` and `d3` draw geo data but there is no basemap data tooling.
- Route: native-cli-or-scripting
- Licence: BSD-3-Clause (go-pmtiles); PMTiles spec repo reports NOASSERTION
- Version/date: unverified
- Stars: 621. Last push: 2026-07-22
- Install: unverified (`brew install pmtiles` likely)
- Caveats: data tooling only. Rendering needs MapLibre in a browser, so seekability depends on the camera clock and tile-load waits.
- Related: https://github.com/bjperson/maplibre-gl-video-export (42 stars, push 2026-07-22, licence NOASSERTION), a MapLibre video-export plugin; too small to lead on.
- Found via: GitHub search `pmtiles`, `maplibre video export`.

### video-safety-check (`video-safety-check`) — 🆕 new category: accessibility and compliance — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/CosLynxAI/video-safety-check
- Role: finds seizure-risk flashes (WCAG 2.3.1), unreadable captions and loudness jumps (EBU R128) in rendered video.
- Category: new category: accessibility and compliance
- Gap vs neighbours: nothing catalogued checks photosensitivity or caption legibility; `ffmpeg-ffprobe` has loudness filters only.
- Route: native-cli-or-scripting (unverified)
- Licence: MIT
- Version/date: unverified
- Stars: 0. Last push: 2026-10-24
- Install: unverified
- Caveats: brand new with no traction; method (Harding-style vs WCAG general-flash threshold) not checked. The Harding/PEAT space otherwise returned no open-source hits this week.
- Found via: GitHub search `WCAG video flashing`.

### SILE (`sile`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/sile-typesetter/sile
- Role: programmable typesetting engine producing PDF from Lua or XML-like input.
- Category: typesetting (check for existing category)
- Gap vs neighbours: `satori` and `opentype-js` do screen text; SILE does print-quality paragraph layout, which is mostly off-target for motion work.
- Route: native-cli-or-scripting
- Licence: MIT
- Version/date: unverified
- Stars: 1791. Last push: 2026-11-01
- Install: unverified (`brew install sile` believed available)
- Caveats: PDF output needs a rasteriser (`resvg` does not take PDF).
- Found via: GitHub topic search `typesetting`.

## Seen but rejected
- vivliostyle.js — AGPL-3.0, print-oriented, browser dependent
- pagedjs — print pagination, off-target
- t-rec-rs — GPL-3.0, GIF-only terminal recorder driven by live screen capture
- svg2gcode (sameer) — plotter G-code, not video; only `vpype` neighbours matter
- noai-watermark, gemini-watermark-and-synthid-remover, PyModel/watermark-remover, ComfyUI-remove-ai-watermarks — strip provenance and AI watermarks, the opposite of the provenance gap
- flux (sandydoo) — screensaver app, not scriptable
- triptrail — browser GUI app
- LeeHueeng/store-screenshots — an agent skill, not a tool
- FLIP Fluids — Blender add-on, GPL-3.0, needs the GUI app
- letsseal, react-native-image-marker — not video or motion relevant
- GRBL-Plotter, p5.plotSvg, Krbn — plotter-specific, low relevance

## Method notes
- Run was unattended. GitHub search worked; per-repo API (releases, READMEs) returned 403 because only conorluddy/vcr is in session scope. Release versions and dates, install commands and caveats are therefore unverified.
- Not done: reverse-dependency, stargazer-overlap and feed (Homebrew, Show HN) sweeps.
- Searches returning nothing: photosensitivity, flash detection, harding, map animation headless render, taichi, simctl / device capture, subtitles ass, MCP contact sheets, wgsl cli, sdf cli.
- Untouched: `prospects/inbox/README.md` is absent on main, and no `discovery/*` branches or open PRs were visible.
