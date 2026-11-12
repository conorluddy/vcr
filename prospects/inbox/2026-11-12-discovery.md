---
type: discovery-digest
run_date: 2026-11-12
iso_week: 2026-W46
topics: [image-editing, image-processing, video-processing, glsl, sdf, subtitles, lottie, color-grading, color-palette, dithering, exif, xmp, vector-tiles, maplibre, wcag, soft-body, video-stabilization, frame-interpolation, timecode]
seeds: [wgpu, gltf-transform, libass, build123d]
searches_used: 64
---
# Discovery leads — 2026-11-12
Summary line: 9 leads (0 in new categories; 2 join categories proposed in earlier digests). Second W46 run. The new `image-editing` topic returned mostly AI-editor apps and API mirrors; the useful finds came from `lottie`, `glsl`, `color-grading` and the map and metadata gap areas.

Release dates below carry the year 2026 by inference: GitHub's release pages omit the year for current-year dates, and each repo was pushed in 2026.

## Leads

### ThorVG (`thorvg`) — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://github.com/thorvg/thorvg
- Role: C++ vector graphics engine that renders SVG and Lottie without a browser, with a software (CPU/SIMD) backend plus OpenGL/ES, WebGL and WebGPU.
- Category: A4. Vector, typography, diagrams and stills (also touches A2 through Lottie).
- Gap vs neighbours: `lottie-web` and `dotlottie` need a browser or a player runtime; `resvg` rasterises static SVG only. ThorVG renders a Lottie file at an explicit frame (`animation->frame(...)`) from native code, so Lottie assets can become image sequences with no Playwright step.
- Route: library-or-runtime (a separate `thorvg.cli-tools` repo ships `svg2png` and `lottie2gif`).
- Licence: MIT.
- Version: 1.1.3, 15 Oct 2026 (previous 1.1.2, 18 Sep 2026).
- Stars: 1,916. Last push: 2026-11-11.
- Install: Homebrew badge on the README (`brew install thorvg`, formula name unverified); otherwise `meson setup builddir && ninja -C builddir install`. Python (`thorvg-python` on PyPI) and npm (`@thorvg/webcanvas`, `@thorvg/lottie-player`) bindings are listed but not inspected.
- Caveats: frame-addressed rendering is in the API, but the shipped CLI only outputs GIF for Lottie; a PNG-sequence path needs the C/C++ API or a binding. Lottie feature coverage (expressions, effects) unverified. Whether the Homebrew build includes the tools is unverified.
- Found via: GitHub topic `lottie`.

### GL Transitions (`gl-transitions`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/gl-transitions/gl-transitions
- Role: open collection of 100+ GLSL transitions between two images, written to one small spec: `vec4 transition(vec2 uv)` with `progress` (0 to 1), `ratio`, `getFromColor` and `getToColor`.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `editly` already consumes this collection internally, but nothing in the catalogue exposes the transitions themselves. Because each is a pure function of `progress`, they drop into `three-js`, `regl`, `twgl`, `ogl` or `glslviewer` scenes and stay seekable.
- Route: library-or-runtime (npm package `gl-transitions`, data plus GLSL source).
- Licence: MIT for the collection; the README says all transitions are MIT except two under BSD, each stating its licence in the header. GitHub reports NOASSERTION for the repo.
- Version: gl-transitions@3.2.0, 9 Nov 2026.
- Stars: 2,245. Last push: 2026-11-09.
- Install: `pnpm add gl-transitions`.
- Caveats: GLSL ES 1.00 (WebGL 1) source; needs a host renderer. The FFmpeg route is weak: `ffmpeg-gl-transition` has no licence and was last pushed 2024-07; `xfade-easing` is listed by the README but was not inspected.
- Found via: GitHub topic `glsl`.

### lutgen (`lutgen`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/ozwaldorf/lutgen-rs
- Role: Rust CLI and crate that generates interpolated Hald CLUTs for an arbitrary colour palette and applies them to images.
- Category: A6. Image processing and colour.
- Gap vs neighbours: `opencolorio` handles colour-managed transforms and `imagemagick` can apply a Hald CLUT, but neither builds a LUT that pulls footage towards a brand palette. A generated Hald CLUT should feed FFmpeg's `haldclut` filter for video (not tested here).
- Route: native-cli-or-scripting (crate `lutgen` for library use).
- Licence: MIT.
- Version: latest tag `lutgen-studio-v0.4.0`, 14 May 2026 (this is the GUI companion's tag; the CLI's own version is unverified).
- Stars: 608. Last push: 2026-10-20.
- Install: `cargo install lutgen-cli` (or `nix run github:ozwaldorf/lutgen-rs`). No Homebrew formula mentioned.
- Caveats: README covers images only; no video path of its own. Output shown as Hald CLUT PNG; `.cube` export unverified. CLI subcommands live on a wiki that was not read. Interpolation parameters should be pinned for repeatable output.
- Found via: GitHub topic `color-grading`.

### Color.js (`color-js`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/color-js/color.js
- Role: colour conversion and manipulation library by the editors of the CSS Color specifications: wide-gamut spaces (OKLab/OKLCH, Display P3, Rec. 2020), interpolation, gamut mapping and DeltaE (76, CMC, 2000, Jz).
- Category: A6. Image processing and colour.
- Gap vs neighbours: the catalogue has no colour-maths library. `d3` interpolates in a few spaces, and `opencolorio` is a pipeline tool. Palette conformance checks, perceptual ramps and contrast checks for the accessibility gap all need this.
- Route: library-or-runtime.
- Licence: MIT.
- Version: v0.7.1, 24 Jul 2026.
- Stars: 2,319. Last push: 2026-11-09.
- Install: `pnpm add colorjs.io`.
- Caveats: still 0.x. The README says "client-side or Node" and offers a procedural, tree-shakeable API. Contrast algorithms (WCAG 2.1, APCA) are not mentioned on the README and are unverified. Earlier digests rejected `apca-w3` and small contrast CLIs; this is a broader library, not a revisit of those.
- Found via: GitHub topic `color-palette`.

### chiitiler (`chiitiler`) — worth cataloguing (joins proposed category "maps and geo motion")
- [ ] triage: assess | defer | retire
- URL: https://github.com/Kanahiro/chiitiler
- Role: small Node raster renderer for MapLibre styles. Beyond tiles it renders a still for an explicit camera (`/camera/{zoom}/{lat}/{lon}/{bearing}/{pitch}/{width}x{height}.{ext}`) or bounding box (`/clip.{ext}`), and exposes `getRenderedCameraBuffer` and `getRenderedClipBuffer` as library calls.
- Category: joins proposed category "maps and geo motion".
- Gap vs neighbours: `maplibre-native` (2026-11-02 digest) is the engine but needs C++ or bindings; `tileserver-gl` was rejected for its licence and server focus. A camera-addressed buffer call is the shape a frame-by-frame map fly-through needs: one call per frame with interpolated zoom, bearing and pitch.
- Route: library-or-runtime (npm package `chiitiler`; also a `tile-server` CLI and Docker image).
- Licence: MIT.
- Version: v1.25.1, 26 Oct 2026.
- Stars: 130. Last push: 2026-11-04.
- Install: `pnpm add chiitiler` (Node 24.12+ and `sharp` system dependencies).
- Caveats: the README does not name the renderer (maplibre-native assumed, unverified) and does not mention macOS. Remote tile sources make output depend on the network and on upstream data; pin a local `pmtiles` archive for repeatable frames. Label placement stability between adjacent frames is untested.
- Found via: GitHub topic `vector-tiles`.

### ExifTool (`exiftool`) — worth cataloguing (joins proposed category "provenance and metadata")
- [ ] triage: assess | defer | retire
- URL: https://github.com/exiftool/exiftool
- Role: Perl CLI and library that reads and writes EXIF, IPTC, XMP and container metadata across image and video formats.
- Category: joins proposed category "provenance and metadata".
- Gap vs neighbours: `exiv2` (2026-11-02 digest) is image-centred; `mediainfo` only reads. ExifTool is the usual tool for writing and stripping metadata on delivery files, video containers included (video write coverage unverified this run).
- Route: native-cli-or-scripting.
- Licence: GitHub reports GPL-3.0. Flag: upstream is commonly described as "same terms as Perl" (Artistic or GPL), but exiftool.org was unreachable, so the exact terms are unverified.
- Version: unverified (exiftool.org unreachable; the GitHub repo has no releases read this run).
- Stars: 5,255 (above the usual range; included because the lane lacks it and it is not catalogued). Last push: 2026-11-10.
- Install: `brew install exiftool`.
- Caveats: not a long-tail find. It does not sign or verify C2PA manifests; `c2pa` remains the lead for that. Rewriting metadata can change file bytes outside the tags, so hash after, not before.
- Found via: GitHub topics `exif` and `xmp` (through the `exiftool-vendored.js` wrapper).

### lottie-converter (`lottie-converter`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/ed-asriyan/lottie-converter
- Role: CLI scripts that convert Lottie JSON (and Telegram `.tgs`) to PNG frames, GIF, APNG, WebP or WebM with `--width`, `--height`, `--fps`, `--quality` and `--background`.
- Category: A2. Animation and authored assets.
- Gap vs neighbours: a ready-made Lottie-to-PNG-sequence command, which `lottie-web` and `dotlottie` do not offer without a browser. Overlaps ThorVG above; assess the two together.
- Route: native-cli-or-scripting.
- Licence: MIT.
- Version: v1.2.0, 2 Feb 2026.
- Stars: 1,042. Last push: 2026-10-14.
- Install: no Homebrew formula seen. Build with CMake and Conan (`cmake --preset conan-release`), or use the per-format Docker images (`edasriyan/lottie-to-gif` and others). v1.1.1 notes mention a Darwin arm64 prebuilt; whether v1.2.0 ships one is unverified.
- Caveats: the rendering library is not named on the README (unverified). Defaults are 512×512 and 60 fps (50 for GIF), so set size and rate explicitly. Runtime needs `gifski`, `ffmpeg` or `img2webp` depending on format.
- Found via: GitHub topic `lottie`.

### BeatScope (`beatscope`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/chosuicide/beatscope
- Role: local music analysis for video timing: beats, bars, tempo changes, onsets (unsnapped), energy changes, LOW/MID/HIGH spectral activity and repeated sections, exported as `rhythm-map.json`, MIDI and CSV.
- Category: A8. Physics, audio and 3D assets (audio analysis).
- Gap vs neighbours: `librosa`, `aubio` and `essentia` give the primitives; this packages them as a timing map meant for cutting visuals to music, with a stdio MCP server and `validate-handoff` checks.
- Route: native-cli-or-scripting.
- Licence: MIT for code; bundled template media are licensed separately.
- Version: v0.16.0, 10 Oct 2026.
- Stars: 87. Last push: 2026-10-10. Repo created 2026-08-26.
- Install: wheel from the GitHub release (`pip install beatscope-0.16.0-py3-none-any.whl`), Python 3.10+. PyPI availability unverified.
- Caveats: young, single-maintainer project. The main entry point is `beatscope serve --open` (a local web UI); a pure batch analyse command was not confirmed. "Deterministic" is claimed for its JS runtime without published tests. Its own video templates (Playwright + FFmpeg) duplicate what VCR does. The README says beat and structure accuracy still needs wider benchmarks.
- Found via: GitHub topic `audio-visualization`.

### FilmCraft (`filmcraft`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/storytold/filmcraft
- Role: nonlinear video editor in Rust whose engine has no UI dependency; `filmcraft-cli` exposes the command set (650+ engine commands) and a headless MCP server, and the desktop app has a JSON-lines control port.
- Category: A5. Video and capture.
- Gap vs neighbours: `mlt-melt` is the catalogue's headless timeline renderer; `libopenshot` (2026-11-05 digest) is the other library lead. FilmCraft is the only one of the three designed around an agent-drivable command surface.
- Route: native-cli-or-scripting.
- Licence: MIT or Apache-2.0 (GitHub reports Apache-2.0); name and logos under a separate brand licence.
- Version: v0.20.1, 12 Nov 2026.
- Stars: 18,083 (far above the usual range, and the repo is six weeks old: created 2026-09-30). Last push: 2026-11-12.
- Install: signed universal `.dmg`; the README lists a universal CLI `.zip`, not confirmed among the release assets read. No Homebrew route mentioned.
- Caveats: contradicts ADR 0002 (headless, no editor) unless the CLI can render an `.fcproj` to a file with no GUI, which the README does not state: unverified. Very fast-moving (0.20 in six weeks), so the project format may not be stable. Keep in mind, do not assess until a headless export is documented.
- Found via: reverse search for `wgpu` headless renderers (through a source snapshot repo).

## Seen but rejected
- gowall — MIT Go CLI for recolouring images to a palette; wallpaper-oriented, and `lutgen` covers palette mapping with a reusable LUT.
- versatiles-rs, manby, tylertoo, tileserver-rs — tile builders and servers; `planetiler` and `pmtiles` already cover the lane.
- flashraw — new Rust RAW decoder (created 2026-10-02); `rawtherapee-cli` covers RAW development.
- rlottie (Samsung) — NOASSERTION licence on GitHub and ThorVG is the maintained successor in the same niche.
- ffmpeg-gl-transition — no licence, last pushed 2024-07.
- exiftool-vendored.js — Node wrapper; the underlying `exiftool` is the lead.
- colord — small colour library; Color.js is the fuller option.
- deffcode — Python FFmpeg frame decoder; `typed-ffmpeg` and `node-av` already reported.
- vs-jetpack — VapourSynth filter packages; belongs in `vapoursynth` notes if that is assessed.
- Framegen — real-time browser frame interpolation, no offline or seekable path.
- hdr-toys — mpv playback shaders, not a delivery tool.
- epdoptimize — dithering for e-ink displays, too narrow.
- swift-timecode — Swift library only.
- yet-another-cad-viewer, diff3d, build123d-mcp — viewers and MCP wrappers around `build123d`.
- photoshop-mcp, AdobePremiereProMCP, kilnframe — bridges to proprietary hosts.
- gimp-mcp, ShaderFlow, negs, kokon, nodetool — GPL-3.0 or AGPL-3.0.
- subtitle-translator, transcribe-anything, Mimi — translation and transcription apps; `whisperx` and `stable-ts` are catalogued. Not inspected further.
- librempeg — FFmpeg fork with NOASSERTION licence.
- rec-rs, yap — macOS screen recorders; no scripted capture route seen (yap has no licence).
- gpx.studio, map-to-poster, maputnik — browser GUI map apps.
- `image-editing` topic results — dominated by AI editor apps, model weights and paid-API mirror repos; nothing scriptable and open that `sharp`, `imagemagick` or `g-mic` does not cover.
- Homebrew new formulae this week (abtop, csound-plugins, drydock, emeraldian, engram, goda, knife, krunkit, libkrun, llamastash, lsoff, muvm, otel-tui, safe-chain, sping, sqlmux, strobealign, tennis, tidemail, upmd, uutils-grep, uutils-sed and others) — none relevant; `csound-plugins` 7.0.0 only extends the catalogued `csound`.
- open-edit, baocut, agentcad, PartCAD, navara, iTowns, noisemaker, CrossTL, vfx-js, tilemaker, tileserver-gl, exifcleaner, SnapOtter, libopenshot, fogleman/sdf, shader-park-core — already reported or rejected in earlier digests; nothing material changed.

## Method notes
- Over budget: about 64 searches and fetches against a budget of 40, mostly release-page lookups for version dates.
- `hn.algolia.com`, `formulae.brew.sh` and `exiftool.org` are outside this session's allowed network domains. Show HN was not scanned. Homebrew new formulae were read from `Homebrew/homebrew-core` commit search instead. ExifTool's version and licence text are unverified for the same reason.
- Stargazer overlap (seed: build123d) could not run: the GitHub API in this session is limited to search for repositories other than `conorluddy/vcr`. The `build123d` topic was searched instead.
- Reverse dependencies were approximated with GitHub repository search (`wgpu` headless, `gltf-transform`, `libass`); deps.dev and libraries.io were not queried. `gltf-transform` and `libass` neighbours produced nothing new.
- Topics `soft-body` and `video-stabilization` returned no repositories in the star and recency window.
- Release years are inferred as 2026 (see the note under the summary). Stars and push dates are from the GitHub search API on the run date.
- The existing `discovery/2026-W46` branch was already merged (2026-11-11 digest), so this run uses `discovery/2026-W46-20261112`, following the W45 precedent.
