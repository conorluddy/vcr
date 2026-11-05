---
type: discovery-digest
run_date: 2026-11-05
iso_week: 2026-W45
topics: [terminal-recording, agent-facing-visual-review, procedural-generation, gltf, audio-analysis]
seeds: []
searches_used: 10
---
# Discovery leads — 2026-11-05

Summary line: 3 leads (1 in a new category). Fifth W45 run; earlier digests already cover the gap areas, so this run went to core topics not yet touched (terminal recording, procedural glTF, loudness). Verification is thin: the GitHub API was not reachable for these repos, so versions and dates come from repo pages and crates.io where possible.

## Leads
### VHS (`vhs`) — 🆕 new category: terminal capture — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/charmbracelet/vhs
- Role: scripts terminal sessions as declarative `.tape` files and renders them to GIF, MP4, WebM, a PNG frame directory, a PNG screenshot, or text for golden-file tests.
- Category: new category: terminal capture (no terminal recorder is catalogued; the A5 neighbour set is `ffmpeg-ffprobe`, `gifski`, `playwright`)
- Gap vs neighbours: the only terminal recorder previously seen, `t-rec-rs`, was rejected (GPL-3.0, live screen capture). VHS is script-driven rather than screen-captured.
- Route: native-cli-or-scripting
- Licence: MIT
- Version/date: unverified (the repo page showed no releases)
- Stars: 21.3k (above the usual 50..3000 band, but it fills a real gap). Last push: unverified
- Install: `brew install vhs`; also `go install`, Docker image `ghcr.io/charmbracelet/vhs`. Needs `ttyd` and `ffmpeg` on PATH.
- Caveats: `Sleep`, `Type@<time>` and `Wait` (regex poll, 15s default timeout) make timing depend on the program under test. Determinism across fonts, shell and terminal size is not documented. It drives a live headless browser via ttyd, so it is not seekable.
- Found via: WebSearch (terminal-recording topic).

### MoGen (`mogen`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/krazyjakee/MoGen
- Role: Rust CLI that compiles a compact declarative `.mog` DSL (primitives, CSG, arrays/mirrors, skeletons, skinning, animation, PBR, procedural generators) to `.glb` or FBX. Built to be the deterministic backend of an LLM pipeline.
- Category: A8. Physics, audio and 3D assets
- Gap vs neighbours: `build123d` and `trimesh` are Python-code CAD and mesh tools; MoGen is a text DSL with skeleton and animation export, which neither has.
- Route: native-cli-or-scripting
- Licence: MIT
- Version/date: unverified (no releases shown on the repo page)
- Stars: 38. Last push: unverified
- Install: `curl | bash` installer that fetches a GitHub Release and checks SHA-256 (macOS/Linux); or `./scripts/build-release.sh` with Rust. Install is not a plain brew/cargo route.
- Caveats: very young, 42 open issues. Byte-identical output for identical input is claimed in spirit ("deterministic backend") but not documented. The desktop Studio is GUI-only; the CLI is the relevant part. Texture packing is disabled in the browser build.
- Found via: WebSearch (Show HN style query, procedural glTF).

### ebur128 (`ebur128`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/sdroege/ebur128
- Role: Rust port of libebur128 for EBU R128 loudness (momentary, short-term, integrated, loudness range, true peak), with an optional C API.
- Category: A8. Physics, audio and 3D assets
- Gap vs neighbours: `ffmpeg-ffprobe` already measures loudness through `loudnorm` and `ebur128` filters, so this is only worth it as an embeddable measurement library. `essentia` and `librosa` do not target broadcast loudness compliance.
- Route: library-or-runtime
- Licence: MIT
- Version/date: crate 0.1.11, updated 2026-10-26 (crates.io)
- Stars: 134. Last push: unverified
- Install: `cargo add ebur128`; C API via `cargo-c`.
- Caveats: no CLI in the main crate. A separate crate `ebur128-stream` 0.2.0 (2026-05-09, MIT/Apache-2.0, about 2.5k downloads) ships an optional `lufs` CLI with JSON and SVG meter output, but is too new and small to lead on. Results match the C library; run-to-run reproducibility is not stated, though it is pure arithmetic.
- Found via: WebSearch (loudness topic).

## Seen but rejected
- agg (asciinema) — GIF-only renderer for asciinema casts; `gifski` and `ffmpeg-ffprobe` cover GIF output
- asciinema, scriptcast — text recorders; no video output without agg
- vcsi, vcsr, vimg — contact-sheet CLIs; `ffmpeg-ffprobe` tile filter and `imagemagick` montage already cover this
- FreeFrame, openrv-web — browser review apps, not scriptable
- sanchousf-ai-toolkit-cad, x3d-cpp — broad toolkits with no clear glTF-for-motion role
- audioscan 0.1.0 — brand-new wrapper around `ebur128`
- Blender bpy glTF pipelines — covered by `blender`

## Method notes
- GitHub API returned 403 for repos outside the session scope; used WebFetch on repo pages and the crates.io API instead. Homebrew API was also blocked.
- Release dates, last-push dates and stars are unverified where marked. No stargazer or reverse-dependency analysis this run. About 10 searches and fetches used of the 40 budget, because the W45 gap areas were already covered by four earlier digests.
- Open PR check: none open. Earlier branches `discovery/2026-W45`, `-b`, `-c` exist; this run uses `-d`.
