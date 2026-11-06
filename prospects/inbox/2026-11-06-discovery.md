---
type: discovery-digest
run_date: 2026-11-06
iso_week: 2026-W45
topics: [parametric-design, cad, svg, video-processing, subtitles, audio-analysis, shaders]
seeds: []
searches_used: 10
---
# Discovery leads — 2026-11-06

Summary line: 3 leads (1 in new categories). Yield is thin: the gap areas were mostly mined by the 2026-11-01..05 digests, and all three leads are very young, low-star projects. Verified from README/PyPI/crates.io pages only; commit dates were not visible.

## Leads
### syncalong (`syncalong`) — 🆕 new category: speech and lyric alignment — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/wickeddoc/syncalong
- Role: aligns known lyrics/transcript text to an audio file using Whisper word timestamps plus fuzzy matching, emits LRC to stdout; optional Demucs vocal separation.
- Category: new category: speech and lyric alignment (feeds captions/kinetic type timing). Nearest neighbours: `whisper-cpp`, `demucs`, `ttconv`.
- Gap vs neighbours: `whisper-cpp` transcribes; this treats supplied text as ground truth and only solves timing, which is what lyric/script-driven motion needs.
- Route: native-cli-or-scripting
- Licence: MIT
- Version: 2.0.1, 2026-07-24 (PyPI)
- Stars: 5 · Last push: unverified
- Install: `pip install "syncalong[whisper]"` (uv/pipx should also work; macOS arm64 untested). Needs ffmpeg.
- Caveats: Whisper inference is not guaranteed bit-reproducible across hardware; LRC is line-level, not word-level, in the documented output. Local model download required.
- Found via: WebSearch (forced alignment, captions)

### svg-to-video (`svg-to-video`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/xangelix/svg-to-video
- Role: Rust CLI that renders animated SVG (CSS/SMIL/JS) to video by pausing animations, stepping a virtual playhead per frame in headless Chrome, screenshotting PNGs, then encoding via FFmpeg (ProRes default).
- Category: existing (browser capture). Neighbours: `svg`, `web-animations-api`, `playwright`, `ffmpeg-ffprobe`.
- Gap vs neighbours: a packaged one-command seek-and-capture for SVG; largely reproduces what `svg` + `playwright` + `ffmpeg-ffprobe` already do in VCR, so mainly useful as a reference implementation.
- Route: native-cli-or-scripting
- Licence: MIT
- Version: 0.2.0, 2026-07-25 (crates.io; ~68 downloads)
- Stars: 2 · Last push: unverified
- Install: `cargo install svg-to-video`; needs Chrome/Chromium and FFmpeg on PATH.
- Caveats: determinism claims (document.getAnimations seek, forced sRGB) are the author's, no independent evidence; 4 commits, very early.
- Found via: WebSearch (SVG to video CLI)

### Video Flows (`video-flows`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/p-chops/video-flows
- Role: Python pipeline and `vf` CLI that generates or processes footage through GLSL shader stacks, temporal effects, compositing and transitions, headless on an OpenGL 3.3+ GPU, encoded with ffmpeg.
- Category: existing (shader/GL video). Neighbours: `webgl`, `libplacebo`, `frei0r`, `ffmpeg-ffprobe`.
- Gap vs neighbours: GLSL-recipe-driven generative reels with `--seed`; native GL rather than browser.
- Route: native-cli-or-scripting
- Licence: MIT
- Version: v1.5.0 (date unverified; search snippet said "08 Mar", year unknown)
- Stars: 2 · Last push: unverified
- Install: clone/release zip, `pip install .` in a venv; needs ffmpeg and an OpenGL 3.3+ GPU (macOS GL is deprecated, 4.1 core max — unverified fit).
- Caveats: README does not claim identical seeds give identical output; quality gate rerolls "dead" clips, which may break reproducibility.
- Found via: WebSearch (Show HN-style query)

## Seen but rejected
- FFCreator (tnfe) — 3.2k stars, MIT, but README is for Node 14 era, Travis badge, no release/commit date visible; unverified as active.
- gitcad — headless git-native B-rep CAD on PyPI (0.9.13, 2026-07-31) but could not verify licence, kernel or repo; overlaps `build123d`. Revisit if a primary source loads.
- pymadcad, CadQuery — pymadcad appears stale; CadQuery is `build123d`'s sibling, no new gap.
- rust-motion, termcinema-cli, asg — own composition format or SVG generators rather than renderers; unverified activity.
- lyricli, LattifAI, ForceAlign — alignment tools overlapping `syncalong`; lyricli not verified, LattifAI model-dependent and English-only alpha.

## Method notes
- 10 searches/fetches. GitHub API was scoped to conorluddy/vcr only, so stars, push dates and releases came from page scrapes and are often "unverified".
- hn.algolia.com, Homebrew feed, stargazer overlap and reverse-dependency passes were not run this week.
- No gap-area topic produced a strong new lead beyond what earlier digests already hold.
