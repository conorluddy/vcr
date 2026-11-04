---
type: discovery-digest
run_date: 2026-11-04
iso_week: 2026-W45
topics: [hdr-metadata, mcp-creative-apps, stabilisation, wcag-contrast, webgpu-simulation, particles, fluid-simulation]
seeds: []
searches_used: 12
---
# Discovery leads — 2026-11-04

Summary line: 5 leads (1 in a new category). Third W45 run; earlier digests already cover photosensitivity, c2pa, maps, device capture and captions, so this run went to uncovered lower-priority areas.

## Leads

### dovi_tool + hdr10plus_tool (`dovi-tool`) — 🆕 new category: HDR delivery metadata — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/quietvoid/dovi_tool (companion: https://github.com/quietvoid/hdr10plus_tool)
- Role: Rust CLIs that inspect, generate, convert, extract and inject Dolby Vision RPU and HDR10+ dynamic metadata in HEVC streams; both can plot metadata to PNG.
- Category: new category: HDR delivery metadata.
- Gap vs neighbours: `ffmpeg-ffprobe` and `mediainfo` can read HDR signalling but not write or edit Dolby Vision / HDR10+ metadata.
- Route: native-cli-or-scripting
- Licence: MIT (both)
- Version / date: unverified (releases not visible on the fetched page)
- Stars: about 1.0k (dovi_tool), 469 (hdr10plus_tool)
- Last push: unverified
- Install: no brew formula confirmed; README documents `cargo build --release` (Rust 1.88+ for dovi_tool, 1.85+ for hdr10plus_tool). `cargo install` route plausible but unverified.
- Caveats: operates on raw HEVC bitstreams or MKV, so it needs an FFmpeg demux/remux step; metadata only, not a renderer; Dolby Vision profile support varies.
- Found via: WebSearch (HDR metadata CLI)

### Kinocut, formerly mcp-video (`kinocut`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/KyaniteLabs/kinocut
- Role: guardrailed FFmpeg video-editing MCP server, Python library and `kino` CLI (trim, caption, resize, repurpose) with preflight checks, provenance receipts and quality gates before export.
- Category: existing (video-encoding / agent-facing review); agent-facing tooling.
- Gap vs neighbours: wraps `ffmpeg-ffprobe`; the distinct part is the receipts and quality gates. Mostly overlaps the core FFmpeg skill.
- Route: native-cli-or-scripting
- Licence: Apache-2.0
- Version / date: 1.16.5, 2026-10-27 (per repo page)
- Stars: 239
- Last push: unverified
- Install: `pip install kinocut` then `kino doctor`; `uvx --from kinocut kino doctor`; needs FFmpeg on PATH.
- Caveats: the repo was renamed (search results showed the old name `mcp-video`); a second unrelated project, pastorsimon1798/mcp-video, shares the old name. Determinism of its outputs is unverified.
- Found via: WebSearch (MCP servers for video editing)

### MCP for Blender (`blender-mcp`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/ahujasid/blender-mcp (page title reads "mcp-for-blender")
- Role: Blender addon with a socket server plus an MCP server so agents run Blender Python, inspect scenes, check viewport/render and import assets (Poly Haven, Sketchfab).
- Category: existing (3d-rendering / native-authoring); agent-facing tooling.
- Gap vs neighbours: `blender` core route is headless background rendering; this one drives a live, open Blender instance.
- Route: library-or-runtime
- Licence: MIT
- Version / date: unverified
- Stars: about 33.2k
- Last push: unverified
- Install: `uvx mcp-for-blender`, then `uvx mcp-for-blender install-addon`; needs Blender 3.0+, Python 3.10+, uv.
- Caveats: Blender GUI must be running with the addon enabled, so not headless; the socket server is unauthenticated and executes arbitrary Python (localhost only); not deterministic by design; third-party generative-model services optional.
- Found via: WebSearch (MCP servers for Blender)

### Gyroflow (`gyroflow`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/gyroflow/gyroflow
- Role: gyroscope-based video stabilisation with a CLI (`--preset`, `--export-metadata`, `--export-stmap`) and a watch-folder mode.
- Category: new category candidate: stabilisation / footage prep (single lead, so filed as existing video-processing for now).
- Gap vs neighbours: FFmpeg `vidstab` is content-based and GPL-built only; Gyroflow uses camera motion logs. Neither is catalogued.
- Route: native-cli-or-scripting
- Licence: GPL-3.0 (with App Store exception and mdk-sdk linking permission, closed-source dependency)
- Version / date: unverified
- Stars: about 9.7k
- Last push: unverified
- Install: `brew install gyroflow` (per README)
- Caveats: whether the CLI runs fully headless without a display is unverified; needs gyro data, so only relevant to real camera footage, not generated motion graphics; GPL.
- Found via: WebSearch (video stabilisation CLI)

### threejs-particle-fluids (`threejs-particle-fluids`) — joins proposed category "fluid / particle simulation" — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/dgreenheck/threejs-particle-fluids
- Role: WebGPU particle physics for three.js: liquids, soft bodies, cloth and smoke, with a `Simulation` class and renderer.
- Category: joins proposed "fluid / particle simulation" (see `splishsplash` in the 2026-11-01 digest).
- Gap vs neighbours: browser-side alternative to the offline `splishsplash`; sits beside `three-js` and `rapier` (rigid bodies only).
- Route: library-or-runtime
- Licence: MIT (bundled models CC0; Stanford bunny credited)
- Version / date: unverified; requires three.js r184
- Stars: 340
- Last push: unverified (only 22 commits)
- Install: npm (exact package name unverified)
- Caveats: WebGPU only, no WebGL fallback; headless capture and determinism not claimed (README says results depend on browser, adapter and driver); a `perf:fingerprint` script suggests a physics baseline check exists. Needs a fixed-timestep seek test before any claim.
- Found via: WebSearch (WebGPU particle fluid)

## Seen but rejected
- cazala/party — WebGPU/CPU particle engine, MIT, 71 stars; browser canvas only, no documented headless, seek or determinism (uses `Math.random()` in quick start).
- apca-w3 — licensed to W3/AGWG with limitations, not a plain open licence; beta.
- colour-contrast-cli, contrast-checker (Rust), apca-cli — tiny, last releases years old or 0.1.0 early stage; contrast maths is trivial to inline.
- LessUp/particle-fluid-sim, matsuoka-601/webgpu-ocean — demos rather than libraries; ocean last pushed Feb 2025.
- video-edit-mcp, video-creator ffmpeg-mcp — thin FFmpeg wrappers; no gain over the `ffmpeg` skill.
- HDR Multi Tool (jlw4049) — GUI-oriented wrapper around dovi_tool/hdr10plus_tool; the underlying tools are the leads.

## Method notes
- The GitHub API and `gh` returned 403 for repos outside `conorluddy/vcr`, so stars, licences and versions come from WebFetch of repo pages and WebSearch. Release tags and last-push dates were mostly not visible and are marked unverified.
- Stargazer overlap, reverse-dependency and feed (Homebrew, Show HN) steps were skipped; the budget went to topic searches. About 12 searches/fetches used.
- Not searched this run: openly-licensed asset APIs, localisation of on-screen text, frame caching, frame-accurate review players.
