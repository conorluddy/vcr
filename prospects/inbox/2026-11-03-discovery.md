---
type: discovery-digest
run_date: 2026-11-03
iso_week: 2026-W45
topics: [vector-tiles, caption, subtitles, ios-simulator, particles, taichi, mockup, photosensitivity]
seeds: []
searches_used: 22
---
# Discovery leads — 2026-11-03

Summary line: 3 leads (0 in new categories; 1 joins "maps and geo motion", proposed 2026-11-01).

Second run this ISO week; the 2026-11-02 digest (#47) is already merged, so this one only adds items it did not list. Stars, push date and licence come from GitHub search; per-repo API (releases, READMEs) is blocked by session scope, so GitHub release dates, install commands and determinism caveats are "unverified" unless a registry answered.

## Leads

### MapLibre Native (`maplibre-native`) — joins proposed category "maps and geo motion" — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/maplibre/maplibre-native
- Role: C++ vector-map renderer with an offscreen render CLI/bindings; can draw a styled map frame without a browser (unverified exact CLI name, believed `mbgl-render`).
- Category: new category: maps and geo motion (proposed 2026-11-01)
- Gap vs neighbours: `deck-gl` and `d3` draw overlays only; the 2026-11-01 `pmtiles` lead is data, and browser MapLibre needs tile-load waits. A headless renderer takes style + camera + size and returns a PNG, so a camera path becomes a frame sequence.
- Route: native-cli-or-scripting (Node binding `@maplibre/maplibre-gl-native` on npm is 6.4.1, published 2026-03-29; whether it is maintained alongside the C++ core is unverified)
- Licence: BSD-2-Clause (GitHub and npm agree)
- Version/date: unverified for the core; npm binding 6.4.1 (2026-03-29), 6.5.0-pre.1 on `next`
- Stars: 2298. Last push: 2026-11-03
- Install: unverified (build from source or npm binding; macOS arm64 prebuilds unverified)
- Caveats: stateless per-frame render suits seeking, but tile/glyph/sprite fetching must be local (PMTiles/MBTiles or file URLs) to be deterministic. Node-binding currency unverified.
- Found via: GitHub topic search `vector-tiles`.

### ttconv (`ttconv`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/sandflow/ttconv
- Role: Python library and CLI converting between caption/subtitle formats (SRT, WebVTT, TTML/IMSC, SCC, EBU STL), with timing and style handling.
- Category: subtitles / captions (check for existing category)
- Gap vs neighbours: `whisper-cpp` produces timed text and `ffmpeg-ffprobe` burns SRT/ASS, but nothing catalogued converts to broadcast/delivery caption formats such as IMSC or SCC.
- Route: native-cli-or-scripting (also library)
- Licence: BSD-2-Clause
- Version/date: PyPI 1.2.3 (2026-08-30)
- Stars: 240. Last push: 2026-10-23
- Install: `uv add ttconv` (expected)
- Caveats: pure data conversion, deterministic expected; caption-standard conformance coverage unverified.
- Found via: GitHub topic search `caption`.

### libass (`libass`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/libass/libass
- Role: portable ASS/SSA subtitle renderer, the engine behind FFmpeg's `ass`/`subtitles` filters and mpv.
- Category: subtitles / text rendering (existing neighbours: `ffmpeg-ffprobe`, `opentype-js`)
- Gap vs neighbours: not catalogued as its own tool. Styled, animated (karaoke, `\t` transforms) subtitles are authored in ASS and burned via FFmpeg; a record would document the ASS authoring route and its limits.
- Route: library-or-runtime (reached in practice through `ffmpeg`)
- Licence: ISC
- Version/date: unverified
- Stars: 1191. Last push: 2026-10-30
- Install: `brew install libass` (believed available, unverified); usually already inside Homebrew FFmpeg
- Caveats: depends on how the FFmpeg build was compiled (`--enable-libass`); font resolution via fontconfig can vary across machines, which hurts determinism unless fonts are pinned.
- Found via: GitHub topic search `subtitles`.

## Seen but rejected
- AutoSubSync — GPL-3.0, GUI-oriented subtitle sync
- libaribcaption — ARIB (Japanese broadcast) captions only, too regional
- tileserver-gl — NOASSERTION licence, server rather than frame renderer; `maplibre-native` is the underlying engine
- tilemaker — NOASSERTION licence, same role as the already-listed `planetiler`
- bevy_hanabi, NovaShader, three-nebula — engine-bound particle systems (Bevy, Unity, three.js) with no standalone bake
- GeoTaichi, RayTracingPBR — GPL-3.0
- screenshot.rocks, open-screenshot-generator — browser mockup apps, not scriptable renderers
- tapflow, simutil, dsh-ios, device-hub-pro — simulator streaming/control UIs; `sim-use` (2026-11-02) already covers the lane

## Method notes
- GitHub search worked; per-repo API returned 403 (session scoped to conorluddy/vcr). `registry.npmjs.org` and `pypi.org` answered; `formulae.brew.sh` was refused by the proxy, so Homebrew availability is unverified.
- Searches returning nothing: `photosensitivity`, `flash-detection`, `app-preview` topics (consistent with 2026-11-01).
- Not done: reverse-dependency, stargazer-overlap and feed sweeps.
