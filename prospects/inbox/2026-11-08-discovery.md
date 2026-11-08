---
type: discovery-digest
run_date: 2026-11-08
iso_week: 2026-W45
topics: [accessibility-captions, cloth-simulation, soft-body, gaussian-splatting, wgsl, motion-graphics, svg-video, show-hn]
seeds: []
searches_used: 12
---
# Discovery leads — 2026-11-08
Summary line: 2 leads (0 in new categories). A thin run: the week's earlier digests already covered most of the gap areas, and GitHub API access to other repos was unavailable, so verification used WebFetch on repo pages only.

## Leads
### caption-checker (`caption-checker`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/markksantos/caption-checker
- Role: lints, fixes, converts and retimes SRT/WebVTT captions against Netflix English, BBC and DCMP Captioning Key rules (reading speed, line length, lines, duration, gaps, overlaps).
- Category: joins proposed category "accessibility and compliance" (first reported by `video-safety-check`).
- Gap vs neighbours: `video-safety-check` covers flashing; `ttconv` and `libass` convert/render captions but do not check them against a house standard. Reading-speed rules are already in the typography pillar; this would be a machine check.
- Route: native-cli-or-scripting (npx; also ships an MCP server and a Claude Code plugin).
- Licence: MIT.
- Version: v1.3.3 (1 Nov; year not shown on the page, assumed 2026 — unverified).
- Stars: 0 (very young; first release 15 Oct). Last push: unverified (28 commits on main).
- Install: `npx github:markksantos/caption-checker#v1.3.3 captions.srt`; Node 18+, no dependencies. macOS arm64 is not a concern (pure JS).
- Caveats: single author, zero community validation; frame-gap checks depend on the fps supplied (default 24); fix mode claims idempotence and byte-exact output for clean files, not independently tested. Treat as a rule source worth reading even if not adopted.
- Found via: WebSearch (caption standards gap area).

### Tissu / pytissu (`tissu`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/evanrock520-ciencias/Tissu (PyPI: pytissu) — per search result; unverified.
- Role: C++ cloth simulation SDK with a Python API; example script simulates and exports directly to Alembic (.abc).
- Category: joins proposed category "fluid / particle sim" (cloth and soft body; proposed earlier for `splishsplash`), so not counted as new.
- Gap vs neighbours: `rapier`/`matter-js` are rigid-body only; `blender` can do cloth but needs the full app.
- Route: library-or-runtime.
- Licence: unverified. Version/date: unverified. Stars: unverified. Last push: unverified.
- Install: `pip install pytissu` (unverified on macOS arm64; Windows listed as experimental).
- Caveats: multi-cloth support and USD export are listed as planned; project looks early-stage; determinism unverified.
- Found via: WebSearch (simulation beyond rigid bodies).

## Seen but rejected
- PBD_Taichi (yoharol) — no licence stated, no releases, windowed demos (glfw/PyOpenGL); headless export unconfirmed.
- cli-cinema (nativ3ai) — terminal-demo renderer via Playwright, MIT, but 0 stars, 4 commits, no releases; overlaps `vhs` (already reported).
- ContrastCheck (longway-code) — UI-screenshot OCR contrast checker, PaddleOCR dependency, 0 stars, no releases.
- drawvg — new FFmpeg filter (cairo-based vector drawing, upstream late 2025); not a separate tool, belongs in the `ffmpeg-ffprobe` notes (requires `--enable-cairo`, so check the Homebrew build).
- svgsequencevideo — Python SVG reveal-video CLI built on Inkscape + FFmpeg; no gain over `inkscape` + `ffmpeg-ffprobe`; `svg-to-video` already reported.
- Gaussian Splatting Toolkit (`gs-render`) — host not reachable from this session; video output, CUDA need and licence unverified, so not reported as a lead. Worth a manual look next run.
- OpenCut / HyperFrames mirrors — `hyperframes` already catalogued; OpenCut is a Remotion-based engine (Remotion's licence is source-available, not open).
- cetus (cenvero) — AGPL-3.0 HTML-to-video CLI, tiny.
- Video Commander — commercial desktop app.
- dr2d, frust-render, kiss3d, kael, proof-engine (Rust wgpu headless crates) — early-stage or engine/UI-bound, no video path.

## Method notes
- `gh api` was denied for repos other than `conorluddy/vcr`; no stargazer or reverse-dependency sampling was possible. Verification relied on WebFetch of repo pages, which do not show last-push dates or stars reliably.
- gaussian-splatting-toolkit.readthedocs.io did not resolve (outside the session's allowed network domains); pypi.org/pytissu returned an error page.
- No prior open `discovery/` PRs exist; stale `discovery/*` branches exist on origin but their inbox files are all already on main.
- Seven digests (2026-11-01 to 11-07) were already on main, so most gap topics are saturated; consider widening the rotation next run.
- Everything marked unverified above is unverified.
