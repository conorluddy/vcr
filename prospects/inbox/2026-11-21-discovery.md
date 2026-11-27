---
type: discovery-digest
run_date: 2026-11-21
iso_week: 2026-W47
topics: [contact-sheet, thumbnail-generator, subtitle-editor, webvtt, ass-subtitles, provenance, plotter-art, isometric, svg-animation, vector-field, boids, loudness, spritesheet, color-palette, cartography, lattice-boltzmann, material-point-method, icons]
seeds: []
searches_used: 41
---
# Discovery leads — 2026-11-21

Summary line: 10 leads (2 in new categories).

This is the fourth W47 run. Earlier runs this week covered shaders, simulation, maps, provenance and device capture in depth, so this one aimed at areas the inbox had not yet covered: caption file tooling, openly licensed asset sources, static map rendering and icon or path assets.

## Leads

### pysubs2 (`pysubs2`) — strong candidate
- [x] triage: assess
- URL: https://github.com/tkarabela/pysubs2 (docs: https://pysubs2.readthedocs.io)
- Role: Python library and `pysubs2` CLI that load, edit, retime and convert subtitle files (SRT, ASS/SSA, WebVTT, MicroDVD, MPL2, TMP, JSON).
- Category: Caption compliance (or A5. Video and capture).
- Gap vs neighbours: `libass` renders ASS but does not edit it. `ttconv` converts TTML, SCC and SRT but does not handle ASS styling. `caption-checker` checks captions without changing them. Nothing catalogued writes ASS styles and events from code, which is the input `libass` and FFmpeg's `subtitles` filter need for burned-in kinetic captions.
- Route: library-or-runtime (also has a CLI: `--to`, `--shift`, `--transform-framerate`, `--clean`)
- Licence: MIT.
- Version: 1.9.1 on PyPI, uploaded 2026-10-30 (requires Python ≥ 3.12).
- Stars: 448. Last push: 2026-11-10.
- Install: `uv pip install pysubs2` (no Homebrew formula).
- Caveats: Pure text processing, so output should be deterministic. Times are stored in milliseconds, so frame-exact timing at 29.97 fps needs care when rounding. The CLI overwrites input files in place unless `-o` is given.
- Found via: GitHub topic search `webvtt`.

### Poly Haven API (`polyhaven-api`) — 🆕 new category: openly licensed asset sources — strong candidate
- [ ] triage: assess | defer | retire
- URL: https://polyhaven.com/our-api (base `https://api.polyhaven.com`)
- Role: a keyless JSON API that lists Poly Haven's CC0 HDRIs, PBR textures and models (`/assets`) and returns per-file download URLs, sizes and MD5 hashes (`/files/{id}`).
- Category: new category, openly licensed asset sources. A9 is the closest existing category.
- Gap vs neighbours: `blender`, `three-js` and the `lighting` and `materials` pillars need environment maps and textures, but no catalogued record is a source of assets with clear licences. Each file comes with an MD5 hash, so a render can pin and check the exact asset it used.
- Route: remote-api
- Licence: assets are CC0. The terms ask for a unique User-Agent on every request. Products that use the live API must show users that the assets came from Poly Haven. That condition applies to the service, not to the assets.
- Version: n/a (live service; both endpoints answered on 2026-11-21).
- Stars: n/a (web service). Last push: unverified.
- Install: none (HTTP). Fetch and cache the files locally before rendering.
- Caveats: Remote and mutable, so resolve assets at plan time and record the ID, resolution and MD5 in the render manifest. No rate limits are published (unverified). HDRI files are large; the 8k HDR in our test response was about 100 MB.
- Found via: gap search (openly licensed asset APIs); the inbox and catalogue had no asset-source leads.

### Openverse API (`openverse-api`) — 🆕 new category: openly licensed asset sources — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://api.openverse.org/v1/ (source: https://github.com/WordPress/openverse)
- Role: search API for openly licensed images and audio gathered from Flickr, Wikimedia, Freesound and others. Each result carries its licence, licence version, creator and source URL, and searches can filter by licence (for example `license=cc0`).
- Category: new category, openly licensed asset sources.
- Gap vs neighbours: as for `polyhaven-api`, it covers photos and sound effects rather than 3D assets. Each result already carries the licence and creator data that `exiftool`/`c2patool` or a credits slate would need.
- Route: remote-api
- Licence: the code is MIT. ⚠ Licences on individual results vary and include NC and SA terms (an unfiltered search returned `by-nc-sa`), so filter with `license=` or `license_type=commercial,modification` before any commercial use.
- Version: v1 API (live; responded 2026-11-21).
- Stars: 731. Last push: 2026-11-20.
- Install: none (HTTP). Registering a client raises the anonymous limits.
- Caveats: Anonymous limits read from the response headers were 20 requests per minute (burst) and 200 per day. The index changes over time, so record the result ID and source URL and keep a local copy. Openverse indexes media but does not host it, so downloads depend on the source site.
- Found via: gap search (openly licensed asset APIs).

### Iconify (`iconify`) — worth cataloguing
- [x] triage: assess
- URL: https://iconify.design (source: https://github.com/iconify/iconify)
- Role: one data format and API for over 200 open icon sets. `@iconify/json` bundles every set as JSON, with licence and author metadata for each set. `@iconify/utils` builds SVG from icon data, and `api.iconify.design` serves single icons.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `svg`, `svgo` and `resvg` handle SVG once you have it, but nothing catalogued supplies icons with licence metadata. The `lucide` set query returned `license.spdx: ISC` and author fields, which a credits or licence check can read.
- Route: library-or-runtime
- Licence: MIT for the tooling. Each icon set keeps its own licence, given in its metadata; check for CC-BY or GPL sets before use.
- Version: `@iconify/json` 2.2.559 (2026-11-19); `@iconify/utils` 3.1.7 (2026-09-06); `@iconify/tools` 5.0.14 (2026-08-25).
- Stars: 6409. Last push: 2026-11-21.
- Install: `pnpm add @iconify/json @iconify/utils`.
- Caveats: Pin `@iconify/json`; it publishes almost daily and upstream sets change icons. Use the local JSON rather than the live API so renders can be reproduced offline.
- Found via: GitHub topic search `icons`, then picking the format layer rather than a single icon set.

### Mapnik (`mapnik`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://mapnik.org (source: https://github.com/mapnik/mapnik)
- Role: a long-established C++ map renderer with Python bindings. It draws vector and raster geodata, from PostGIS, shapefiles, GeoJSON or GDAL sources, to PNG, SVG or PDF through AGG and Cairo, using XML styles.
- Category: A4. Vector, typography, diagrams and stills (maps).
- Gap vs neighbours: `maplibre-native` and `chiitiler` render MapLibre-style vector tiles; `three-globe` renders globes in a browser. Mapnik renders straight from source geodata with CPU raster output and vector (SVG/PDF) output, so a map can be drawn frame by frame by changing the bbox for each frame without a GPU or tiles.
- Route: library-or-runtime
- Licence: ⚠ LGPL-2.1-or-later (Homebrew metadata).
- Version: Homebrew `mapnik` 4.3.2; PyPI `mapnik` 4.3.2, uploaded 2026-09-25, with macOS arm64 wheels.
- Stars: 3975. Last push: 2026-11-18.
- Install: `brew install mapnik` or `uv pip install mapnik`.
- Caveats: Font and label placement depend on the installed fonts and the Mapnik version, so pin both. Making animation means re-rendering a full map per frame, which can be slow for large datasets. Writing XML styles takes some learning; CartoCSS tooling for it is mostly unmaintained (unverified).
- Found via: GitHub topic search `cartography`.

### ffsubsync (`ffsubsync`) — worth cataloguing
- [ ] triage: assess | defer | retire
- URL: https://github.com/smacke/ffsubsync
- Role: a CLI that shifts a subtitle file to line up with a video's speech, by matching voice-activity detection against subtitle timing (or against a reference subtitle).
- Category: Speech and lyric alignment (or Caption compliance).
- Gap vs neighbours: `whisperx` and `syncalong` produce new timings by transcribing; `caption-checker` checks timing. ffsubsync fixes the offset and framerate drift of a caption file you already have, for example after a re-edit or a new voiceover take, without running ASR.
- Route: native-cli-or-scripting
- Licence: MIT.
- Version: 0.5.1 on PyPI, uploaded 2026-07-24.
- Stars: 7949. Last push: 2026-07-24.
- Install: `uv tool install ffsubsync` (needs `ffmpeg` on PATH; no Homebrew formula).
- Caveats: It applies one offset plus an optional framerate scale, so it cannot fix timing that drifts across a cut. Voice detection may treat music beds as speech. Determinism across VAD backends is unverified. Activity is slowing: the last push was four months ago.
- Found via: GitHub topic search `subtitle-editor` and the `webvtt` neighbour sweep.

### morphicons (`morphicons`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/guillermolg00/morphicons
- Role: morphs any icon into any other, stroked or filled (Lucide, Tabler, Heroicons, Material Symbols and Phosphor on a 24×24 grid), with React, Vue, Svelte and React Native bindings plus a `morphicons/dom` route.
- Category: A2. Animation and authored assets.
- Gap vs neighbours: `svg-js`, `anime-js` and `motion-js` tween SVG attributes, but none matches points between two unrelated icon paths. Components accept `from`, `to` and `progress` props, so the morph can be set by capture time.
- Route: library-or-runtime
- Licence: MIT; playground icons are under ISC (Lucide) and MIT (Feather, Tabler).
- Version: 2.0.2 on npm, published 2026-10-24.
- Stars: 3233. Last push: 2026-11-14.
- Install: `pnpm add morphicons`.
- Caveats: Its default motion is spring physics over real time; drive `progress` from the frame time instead. The root "pure core, no DOM" entry is not documented, so whether it returns a path string for a given progress value is unverified. Zero runtime dependencies.
- Found via: GitHub topic search `icons`.

### go-astisub (`go-astisub`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/asticode/go-astisub
- Role: Go library for parsing, editing and writing subtitles in SRT, SSA/ASS, EBU STL, TTML, WebVTT and teletext.
- Category: Caption compliance.
- Gap vs neighbours: it covers EBU STL and teletext, broadcast formats that `ttconv` and `pysubs2` do not list.
- Route: library-or-runtime
- Licence: MIT.
- Version: v0.45.0 (Go module proxy, 2026-09-17).
- Stars: 723. Last push: 2026-11-19.
- Install: `go install github.com/asticode/go-astisub/astisub@latest` (CLI path unverified) or use it as a Go module.
- Caveats: Go is not a toolchain VCR uses yet. The CLI's scope is unverified. Consider it only if broadcast STL delivery comes up.
- Found via: GitHub topic search `webvtt`.

### isometric (`isometric-js`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/elchininet/isometric (npm `@elchininet/isometric`)
- Role: TypeScript library that builds isometric scenes (planes, rectangles, circles, paths and text) and writes them as SVG.
- Category: A4. Vector, typography, diagrams and stills.
- Gap vs neighbours: `heerich` covers voxel solids with booleans under several projections; this library covers flat isometric diagrams and illustrations made from planes and paths.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: 4.0.0 on npm, published 2026-03-29.
- Stars: 247. Last push: 2026-11-15.
- Install: `pnpm add @elchininet/isometric`.
- Caveats: Its built-in animations use SVG animation elements, which are not seekable; render static SVG for each frame from scene time instead. Whether it runs in Node without a DOM is unverified.
- Found via: GitHub topic search `isometric`.

### maxrects-packer (`maxrects-packer`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/soimy/maxrects-packer
- Role: an npm module that packs rectangles (glyphs, sprites, frames) into one or more atlas bins with the MaxRects algorithm.
- Category: A2. Animation and authored assets.
- Gap vs neighbours: `msdfgen` produces single distance fields and its notes say atlas generation is a separate tool. `pixijs` and `three-js` consume atlases but do not build them.
- Route: library-or-runtime
- Licence: MIT.
- Version: 3.0.0 on npm, published 2026-10-15.
- Stars: 251. Last push: 2026-10-15.
- Install: `pnpm add maxrects-packer`.
- Caveats: Packing only; you composite the atlas yourself, for example with `sharp`. Packing order depends on input order and options, so sort the inputs to get stable output.
- Found via: GitHub topic search `spritesheet`.

## Seen but rejected
- alass — GPL-3.0 and last push 2023-12-28, outside the activity window; `ffsubsync` covers the same need.
- rsgain — ReplayGain tagging for music libraries; for video, loudness is already covered by `ffmpeg-normalize` and the earlier `ebur128` lead.
- vidstack/captions (`media-captions`) — the latest npm release is 0.0.18 from 2023-06-15, though the repository was pushed in 2026-09.
- subaligner — overlaps `ffsubsync` and `whisperx` with a heavier ML dependency stack.
- webvtt-py — WebVTT only; `pysubs2` covers it as a subset.
- Subtitle Edit, TeroSubtitler, SubtitleComposer — GUI editors; Subtitle Edit's command-line converter was not verified this run.
- capcut-cli — automates a proprietary editor's project files.
- SpookyGhost — GUI sprite-animation tool.
- dsh-video-storyboard, video-watch-plus — skills tied to one agent harness rather than general tools; contact sheets are already covered by `imagemagick` montage.
- fieldplay — interactive browser explorer with no headless or export route.
- mapnik neighbours (maputnik, umap, gridviz) — maputnik and umap are editors or hosted apps; gridviz is EUPL-1.2 and browser-interactive, worth a look only if gridded-data maps come up.
- lettuce, pylbm, apic2d, MPM codes (MPM3D-F90, matter, jax-mpm) — research CFD and geomechanics solvers with no production rendering route; AGPL and GPL terms on some.
- thesvg, lobe-icons, developer-icons — brand-logo sets; trademark terms make them risky as production assets.
- itshover — animated React icons driven by hover, with no seek route.
- Topic searches for `provenance`, `thumbnail-generator`, `text-to-speech` (Rust) and `color-palette` returned software supply-chain, desktop-app or palette-data repositories, nothing in scope.

## Method notes
- Repository metadata came from `gh api search/repositories` with `repo:` qualifiers, because direct `repos/{owner}/{name}` calls are blocked outside this session's scope. Versions came from the PyPI, npm, Homebrew and Go module proxy JSON APIs.
- hn.algolia.com returned HTML instead of JSON through the proxy, so the Show HN feed was skipped. Homebrew's weekly new formulae and stargazer overlap were not run this time; the three earlier W47 runs covered them.
- Openverse's anonymous rate limits were read from the `x-ratelimit-*` response headers. The Poly Haven terms were read from polyhaven.com/our-api.
- Unverified: morphicons' pure-core API, the go-astisub CLI path, whether isometric runs in Node without a DOM, Poly Haven rate limits, and whether Mapnik's CartoCSS tooling is maintained.
