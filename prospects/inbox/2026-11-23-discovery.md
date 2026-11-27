---
type: discovery-digest
run_date: 2026-11-23
iso_week: 2026-W48
topics: [wgsl, pen-plotter, optical-flow, video-matting, chroma-key, beat-detection, pseudo-localization, i18n, voxel, point-cloud, text-to-speech, audio-visualization, spectrogram, loudness, font, motion-blur, film-grain, watermark, geojson, mpm, fft, svg-animation, image-sequence, iiif, audio-reactive, lyrics, kinetic-typography, simulator, screenshot, xmp, procedural-animation]
seeds: []
searches_used: 38
---
# Discovery leads — 2026-11-23

Summary line: 7 leads (1 in a new category).

This is the first W48 run. The 19 earlier digests (2026-11-01 to 2026-11-22) already cover most of the core and gap topics, so this run tried topics they had not searched: optical flow, matting and keying, beat detection, pseudo-localization, spectrograms, film grain, IIIF and frame-accurate playback. It also tried keyword searches for SMAA, contact sheets and MapLibre video export. Most results were agent-skill repositories or GUI apps. The seven leads below are the ones that passed the filter.

## Leads

### shaders-smaa: glsl-smaa and wgsl-smaa (`shaders-smaa`) — strong candidate
- [x] triage: assess
- URL: https://github.com/dmnsgn/shaders-smaa
- Role: SMAA (Enhanced Subpixel Morphological Antialiasing) post-processing passes for raw WebGL and WebGPU. They ship as ES module strings and as plain shader files, with the reference area and search lookup textures. The passes are edges, weights and blend, plus a resolve pass for T2x.
- Category: A3. 3D, shaders and effects.
- Gap vs neighbours: `postprocessing` and `react-three-postprocessing` include SMAA, but only inside a Three.js composer. `regl`, `twgl`, `ogl`, `webgl` and `webgpu` scenes have no antialiasing pass in the catalogue. `wgsl-smaa` is the only WGSL port found. Same author as the catalogued `canvas-record`.
- Route: library-or-runtime
- Licence: MIT.
- Version: `glsl-smaa` 4.0.0 and `wgsl-smaa` 1.0.0, both published to npm on 2026-09-24. `wgsl-smaa` is new.
- Stars: 110. Last push: 2026-09-24.
- Install: `pnpm add glsl-smaa` or `pnpm add wgsl-smaa`.
- Caveats: 1x mode is spatial only, so each frame depends only on its own input and suits seek-driven capture. T2x mode blends with the previous frame and uses alternating sub-pixel jitter, so frames depend on render order. For seekable capture, use 1x or render T2x pairs explicitly. The README warns that WebGL T2x jitter has a flipped y sign, that edge and weight targets must be cleared every frame, and that alpha is overwritten when reprojection is on, which matters for alpha capture. The README describes no tests against the reference implementation.
- Found via: GitHub topic search `topic:wgsl`.

### libsonare (`libsonare`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/libraz/libsonare (docs: https://libsonare.libraz.net)
- Role: a dependency-free C++ audio engine with Python, WASM/npm and Node bindings. It does analysis (BPM, key, chords, beats, sections, EBU R128 loudness), mastering to a target LUFS with 95 DSP processors, mixing, stems, transcription to MIDI, time-stretch and pitch-shift, and built-in GM/GS instruments. It also has a headless DAW runtime with offline bounce. The Python package ships a `sonare` CLI.
- Category: A8. Physics, audio and 3D assets.
- Gap vs neighbours: `meyda` (catalogued) extracts low-level features only. Candidates `aubio`, `librosa` and `essentia` cover analysis but not mastering or rendering. `ffmpeg-normalize` covers loudness only. `fluidsynth` renders MIDI only. libsonare does beat and section analysis for cutting to music, mastering to a delivery target and MIDI-to-audio in one library that also runs in the browser. The README says its analysis defaults match librosa where they overlap, checked in CI.
- Route: library-or-runtime
- Licence: Apache-2.0. The README says no deep-learning models are bundled. The licence of any stem-separation model it loads is unverified.
- Version: 1.10.0 on both PyPI and npm (`@libraz/libsonare`), published 2026-10-27.
- Stars: 32. Last push: 2026-11-08. The repository was created on 2026-01-13, so the project is young.
- Install: `uv pip install libsonare` (WAV and MP3; other formats need an FFmpeg build) or `pnpm add @libraz/libsonare`. Whether a macOS arm64 wheel exists is unverified. The README lists Linux, macOS and WASM, and does not support Windows.
- Caveats: one maintainer and a broad scope. Offline bounce of a fixed project should be deterministic, but the README makes no such claim, so a fixture would need to check repeat renders byte for byte. The realtime engine is irrelevant for VCR.
- Found via: GitHub topic search `topic:beat-detection`, and again under `topic:loudness`.

### 🆕 new category: localisation of on-screen text — pseudo-localization (`pseudo-localization`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/tryggvigy/pseudo-localization
- Role: transforms strings into a pseudo-language. The `accented` strategy lengthens text and swaps Latin letters for accented look-alikes. The `bidi` strategy flips text right to left. `pseudoLocalizeString()` works on a single string in Node, and `pseudo-localization/dom` rewrites a live DOM.
- Category: new category, localisation of on-screen text (the routine's lower-priority gap). It could also go under A4 for typography checks.
- Gap vs neighbours: nothing in the catalogue tests whether titles, lower thirds or kinetic type survive translation before translations exist. A version-set fixture could render a scene with pseudo-localised copy and check for overflow, clipped diacritics and RTL layout. That fits the `adaptation` skill and the `version-auditor` agent's text-expansion check.
- Route: library-or-runtime
- Licence: MIT.
- Version: 3.1.3 on npm, published 2026-09-24.
- Stars: 141. Last push: 2026-09-24.
- Install: `pnpm add pseudo-localization`.
- Caveats: the string transform is deterministic, since it maps characters and does not randomise. The DOM mode watches mutations in real time, so call the string API before capture rather than letting the observer run during seeking. Glyph coverage depends on the scene's font: accented look-alikes can fall back to another font, which is useful as a test but changes the metrics. `Shopify/pseudolocalization` is a Ruby I18n hook and does not suit media text.
- Found via: GitHub topic search `topic:pseudo-localization`, then a keyword search.

### AVAL (`aval`) — niche, keep in mind
- [x] triage: assess
- URL: https://github.com/pixel-point/aval
- Role: a web format and runtime for short prerendered motion that has loops, named states, triggers, bounded transitions, reversals and packed alpha. The `avl` compiler (`@pixel-point/aval-compiler`) turns a `motion.json` project and source video into per-codec AV1, VP9, H.265 or H.264 `.avl` files. An `<aval-player>` element plays them through WebCodecs.
- Category: A5. Video and capture (web delivery).
- Gap vs neighbours: `lottie-web`, `dotlottie` and `rive-web` deliver interactive vector states. Nothing in the catalogue delivers a VCR-rendered raster master as a stateful web element with alpha. It sits downstream of `ffmpeg-ffprobe` and `webcodecs`.
- Route: native-cli-or-scripting (the compiler; the player is a browser runtime)
- Licence: MIT.
- Version: compiler 1.1.0 on npm, published 2026-09-05. The npm name of the player package is unverified.
- Stars: 1,408. Last push: 2026-09-25. The repository was created on 2026-07-13.
- Install: `pnpm dlx @pixel-point/aval-compiler compile motion.json --out dist/motion`.
- Caveats: the source must be progressive, square-pixel, constant-frame-rate video. Codec selection happens at runtime in the browser, so delivery verification needs every codec file checked. Applications must handle their own fallback, because the README says AVAL never shows fallback content.
- Found via: keyword search `frame-accurate in:description`.

### Omakase Player (`omakase-player`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/byomakase/omakase-player (API docs: https://api.player.byomakase.org)
- Role: a JavaScript framework for frame-accurate video review players. It has main and sidecar media players, a multi-track timeline, marker lists and cut lists, a VU meter, and a detached control bar. It plays HLS through hls.js.
- Category: A5. Video and capture (review). It matches the lower-priority gap "frame-accurate review players".
- Gap vs neighbours: no catalogued tool is a review player. It could be a building block for the plugin PRD's P3 review pages, with render-manifest markers on a timeline. Earlier digests rejected FreeFrame and openrv-web as non-scriptable apps. This is a library.
- Route: library-or-runtime
- Licence: Apache-2.0.
- Version: 1.3.1 on npm (`@byomakase/omakase-player`), published 2026-11-17.
- Stars: 59. Last push: 2026-11-17.
- Install: `pnpm add @byomakase/omakase-player hls.js`.
- Caveats: it is an interactive UI for people, not a capture or render tool. Its relevance depends on whether the review pages adopt a third-party player. Its frame-accuracy claim with non-HLS MP4 sources is unverified.
- Found via: keyword search `frame-accurate in:description`.

### MapStage (`mapstage`) — niche, keep in mind
- [x] triage: defer
- Triage reason (2026-11-27): an agent skill folder, not a tool with an automation route. Revisit only as skill inspiration.
- URL: https://github.com/hopechen067/MapStage
- Role: a narrative-map stage for historical explainer videos. A `story.json` file sets places, routes, labels, camera moves and cards over a MapLibre GL JS 5.6.0 map in an antique parchment style. It exposes a time-based `seek(t)` contract for frame-by-frame capture with Playwright, HyperFrames or Remotion, and ships a style tuner and a `verify.mjs` static check.
- Category: A4. Vector, typography, diagrams and stills (maps), under the proposed "maps and geo motion" grouping.
- Gap vs neighbours: `maplibre-native` and `chiitiler` (candidates) render static styled tiles. `deck-gl` draws data layers. None defines a seekable story format for camera moves and route reveals. `maplibre-gl-video-export` was noted earlier with a NOASSERTION licence.
- Route: library-or-runtime
- Licence: code and docs MIT. Showcase media "All Rights Reserved". OSM-derived shapes ODbL. Default imagery comes from the EOX Sentinel-2 cloudless demo service, whose terms are typically non-commercial with attribution, so replace it for production.
- Version: no tagged release (unverified). 43 commits.
- Stars: 532. Last push: 2026-10-25. The repository was created on 2026-08-11.
- Install: no package. Clone it and copy `mapstage/` into an agent skills folder, or serve it with `node mapstage/site/serve.mjs`.
- Caveats: it is distributed mainly as an agent skill, with China-specific output rules built in. Tiles are fetched live, so capture is not hermetic unless the tiles are cached or self-hosted. Whether `seek(t)` waits for tile loads is unverified. Its value for VCR may be as a reference design for a seekable map-story contract rather than as a dependency.
- Found via: keyword search `maplibre video export in:description,readme`.

### Alpha-Gated Edge Despill (`aged-despill`) — niche, keep in mind
- [x] triage: defer
- Triage reason (2026-11-27): from-source research code, no release. Revisit if packaged.
- URL: https://github.com/AdolphGong/aged-despill
- Role: a zero-parameter chroma-key spill suppressor that changes only edge pixels (0 < α < 1) where green or blue is the maximum channel. It ships a Python (NumPy/Cython) `aged.despill(rgb, alpha, screen_type=...)` and a GLSL shader.
- Category: A6. Image processing and colour.
- Gap vs neighbours: `imagemagick`, `g-mic` and `openimageio-oiiotool` can approximate despill with hand-built expressions. Candidates `rembg` and `segment-anything` produce mattes but leave fringes. This is a small, deterministic, documented edge-only step for compositing keyed footage over VCR scenes.
- Route: library-or-runtime
- Licence: MIT.
- Version: no PyPI package named `aged` was found, so install from source. Releases are unverified.
- Stars: 84. Last push: 2026-06-15. The repository was created on 2026-02-24.
- Install: from source (`uv pip install git+https://github.com/AdolphGong/aged-despill`). Whether it builds as a package is unverified.
- Caveats: it is a pure per-pixel function and so deterministic. It is small enough that a VCR recipe could reimplement it in a few lines. It is worth knowing as a technique more than as a dependency. Activity is near the edge of the window.
- Found via: GitHub topic search `topic:chroma-key`.

## Seen but rejected
- DJV (grizzlypeak3d) — BSD-3-Clause review player, but a GUI viewer with no headless route. H.264, HEVC and ProRes playback is in the paid "DJV Studio".
- dezoomify-rs — GPL-3.0, and the README marks it unmaintained in favour of dezoomify v3. Downloading tiles from museum viewers also raises reuse-rights questions.
- karaoke-gen (nomadkaraoke) — MIT, but transcription goes through the paid AudioShake API, and lyrics come from Genius, Spotify or Musixmatch.
- line-art-animation (JDhruv14) — a Claude skill with a copy-in library, not a published package. Interactive and pointer-driven.
- CorridorKey 2.0 and CorridorKey-Runtime — NOASSERTION licences. They are also OFX and Resolve plugins.
- LiveActionAOV — NOASSERTION licence and Nuke-oriented.
- fontdue, ab-glyph, wgpu-text — Rust glyph rasterisers for app UIs. `resvg`, `opentype-js` and the `harfbuzz` candidate already cover the VCR routes.
- wgsl_reflect, shaderkit, vite-plugin-glsl, webgpu_inspector — shader developer tooling, not render output.
- claude-code-video-toolkit, explainroo, video-podcast-maker, Full Production Studio, cth9191/animate, motion-skills and other skill repos — agent wrappers or skill bundles, as in earlier digests.
- ptlflow, UFM — optical-flow research toolkits whose model weights have varying terms. Out of scope for deterministic production.
- multi-delogo — GPL-3.0 and GUI-first.
- hinge, duoctl — control only the iPhone Duo simulator. Too narrow next to `baguette`.
- Shopify/pseudolocalization — a Ruby I18n hook, not usable on media text.
- AudioAuditor — a desktop audio-inspection app.
- Nuvo, Voxstead, Retriever (Show HN) — end-user apps.
- dezoomify-cli (Homebrew new formula this week) — the CLI front of dezoomify v3, so the same reuse-rights concern as dezoomify-rs. Its licence is unverified.

## Method notes
- GitHub repository search (`gh api search/repositories`) worked: about 26 queries. Per-repository APIs (stargazers, releases) returned 403 because the session is scoped to conorluddy/vcr. Stargazer overlap (step 2c) and reverse dependencies (step 2b) were not run, and `seeds` is empty.
- Versions and dates come from the npm registry and PyPI JSON APIs. Stars, licences and push dates come from search results. READMEs came from raw.githubusercontent.com, and MapStage's README through WebFetch.
- Show HN for the past 8 days came from hn.algolia.com (500 hits, keyword-filtered). Nothing qualified.
- Homebrew new formulae came from a commit search in Homebrew/homebrew-core for "new formula" since 2026-11-14. The only media-adjacent formula was dezoomify-cli (rejected). Changelog Nightly was not checked.
- Deduped against the 205 records in `catalog/tools`, the records in `catalog/retired`, and all 19 earlier digests. No open `discovery/*` PR existed. The last one, #232, was merged.
- Unverified: whether libsonare has a macOS arm64 wheel and whether its offline bounce is byte-identical; the licences of stem-separation models; the AVAL player package name; MapStage's release and whether `seek(t)` waits for tiles; aged-despill's packaging; Omakase's frame accuracy with non-HLS sources.
