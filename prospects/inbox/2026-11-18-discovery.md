---
type: discovery-digest
run_date: 2026-11-18
iso_week: 2026-W47
topics: [sdf, wgsl, subtitles, audio-analysis, gltf, typesetting, particles, globe, xmp, hdr, frame-interpolation, motion-blur, vector-field, kinetic-typography]
seeds: [opentype-js, libass]
searches_used: 58
---
# Discovery leads — 2026-11-18

Summary line: 8 leads (0 in new categories).

This is the second run in ISO week 2026-W47. The earlier W47 digest (2026-11-16) is already on main, so this run used the branch `discovery/2026-W47-20261118`. The gap areas are close to saturated after 14 digests. This run changed its rotation: it searched particles, HDR, XMP, frame interpolation, motion blur and kinetic typography instead of the gap topics that earlier runs repeated. None of the leads is a strong candidate. Three are worth cataloguing, and the rest are niche.

## Leads

### PureImage (`pureimage`) — worth cataloguing
- [x] triage: defer
  Overlaps skia-canvas (no-native edge not needed); lacks gradients and blend modes. Revisit if a no-native route is required.
- URL: https://github.com/joshmarinacci/node-pureimage
- Role: A pure-TypeScript implementation of the HTML Canvas 2D API for Node. It has no native dependencies and writes PNG and JPEG.
- Category: A1. Creative coding and 2D
- Gap vs neighbours: `canvaskit-skia` needs a Skia WASM build, and `canvas-2d` needs a browser through `playwright`. PureImage draws Canvas 2D stills or frames in plain Node with no browser and no native build. Its rasteriser is written in JS and does not depend on the platform, so output may match byte for byte across machines (unverified).
- Route: library-or-runtime
- Licence: MIT
- Version/date: 0.4.20, 2026-07-13 (npm)
- Stars: 844. Last push: 2026-11-18
- Install: `npm install pureimage`
- Caveats: The README lists these as missing: gradient fills, image fills, blend modes other than source-over, bold and italic fonts, and smooth image interpolation. It is slower than native canvases. The README says it runs the WPT OffscreenCanvas conformance suite and keeps a list of passing tests. Use it for simple deterministic frames, not rich scenes.
- Found via: Reverse-neighbour search for the seed `opentype-js` (PureImage parses fonts with opentype.js)

### three.quarks (`three-quarks`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/Alchemist0823/three.quarks
- Role: A particle system and VFX library for three.js, with batched rendering, emitters, behaviours, Unity Shuriken import and JSON effects exported from a visual editor.
- Category: A3. 3D, shaders and effects (gap area: simulation beyond rigid bodies, particles)
- Gap vs neighbours: `three-js` is core, but nothing catalogued supplies particle and VFX emitters for it. `splishsplash` is a physical fluid solver, not an art-directed VFX system. three-nebula was rejected earlier as engine-bound and less active. three.quarks is the maintained option and stays inside the core three.js route.
- Route: library-or-runtime
- Licence: MIT
- Version/date: 0.18.0, 2026-11-17 (npm)
- Stars: 1224. Last push: 2026-11-18
- Install: `npm install three.quarks`
- Caveats: Systems advance through `batchRenderer.update(delta)`. To seek, re-simulate from t=0 with a fixed step, as the `matter-js` route does. Seeded randomness is not documented (unverified), so frame-for-frame repeatability needs a fixture. The visual editor at quarks.art is a hosted GUI and is optional.
- Found via: GitHub topic search `particles` (gap area)

### occt-wasm (`occt-wasm`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/andymai/occt-wasm
- Role: The OpenCascade (OCCT) B-rep kernel compiled to WebAssembly, with a typed TypeScript API. It offers primitives, booleans, fillets, sweeps, STEP, STL, glTF and BREP I/O, tessellation and wireframe extraction, and runs in Node 18+ (22+ recommended), the browser or a Web Worker.
- Category: 3D CAD interchange (existing category)
- Gap vs neighbours: `build123d` is the Python CAD route, and `mayo` converts and views files. occt-wasm brings exact solid modelling and STEP I/O into the JS and Node side of VCR. A browser scene can tessellate a part straight into `three-js` or `babylon-js` with no Python step. The companion `brepjs` adds a parametric API on top.
- Route: library-or-runtime
- Licence: MIT OR Apache-2.0 for the tooling. ⚠️ The compiled WASM is LGPL-2.1-only, inherited from OCCT. The README says the end user must be able to replace the `.wasm` file, which `OcctKernel.init({ wasm })` supports.
- Version/date: 5.17.2, 2026-11-14 (npm)
- Stars: 75. Last push: 2026-11-14 (repository created 2026-03-26)
- Install: `npm install occt-wasm`
- Caveats: Needs WASM SIMD, tail calls and wasm exceptions. No IGES. No OCCT visualisation modules, so rendering is your own. Shapes are arena handles that must be released by hand. Tessellation is deterministic for fixed tolerances (unverified). The project is young but releases often.
- Found via: GitHub topic search `gltf`

### OpenEXR tools (`openexr`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/AcademySoftwareFoundation/openexr
- Role: The reference EXR library and command-line tools: `exrheader`, `exrinfo`, `exrmetrics`, `exrcheck`, `exrmultipart` and others. They inspect and repair EXR headers, attributes, compression and multipart layout.
- Category: HDR delivery metadata (existing category), or A6. Image processing and colour
- Gap vs neighbours: `openimageio-oiiotool` reads and writes EXR but does not run the reference validation in `exrcheck` or the compression benchmarking in `exrmetrics`. Useful when Blender or POV-Ray hand linear EXR masters to the delivery step.
- Route: native-cli-or-scripting
- Licence: BSD-3-Clause
- Version/date: 3.5.4 (Homebrew stable). Release date unverified.
- Stars: 1889. Last push: 2026-11-17
- Install: `brew install openexr`
- Caveats: Probably already installed as an OIIO dependency. The tool set overlaps with OIIO, so it may belong in the `openimageio-oiiotool` notes rather than as its own record.
- Found via: GitHub topic search `hdr`

### gsdf (`gsdf`) — niche, keep in mind
- [x] triage: defer
- Triage reason (2026-11-27): Go library needing cgo for GPU; fogleman-sdf and manifold cover SDF/CSG meshes. Revisit with a Go toolchain plan.
- URL: https://github.com/soypat/gsdf
- Role: A Go SDF CAD library. Shapes evaluate on the CPU or on the GPU through WebGPU (Metal on macOS). It generates WGSL shaders from shape definitions and writes STL through an octree triangle renderer. Its `forge` packages cover text SDFs and screw threads.
- Category: A3. 3D, shaders and effects
- Gap vs neighbours: `fogleman-sdf` is the Python SDF mesher and `build123d` is B-rep. gsdf can emit a WGSL raymarch shader for the same part that it meshes. A scene could render one shape as an SDF shader and as a mesh.
- Route: library-or-runtime
- Licence: BSD-3-Clause
- Version/date: v0.1.0, 2026-11-13 (Go module proxy; first tagged release)
- Stars: 99. Last push: 2026-11-14
- Install: `go get github.com/soypat/gsdf` (Go 1.25+; GPU builds need cgo and download wgpu-native)
- Caveats: First release. The API may change. CPU and GPU output can differ in floating point (unverified).
- Found via: GitHub topic search `sdf`

### Polyform (`polyform`) — niche, keep in mind
- [x] triage: defer
- Triage reason (2026-11-27): prebuilt binary download or go run; overlaps fogleman-sdf/manifold. Revisit with an approved install window.
- URL: https://github.com/EliCDavis/polyform
- Role: A Go toolkit for loading, generating, editing and exporting 3D geometry: glTF, OBJ, PLY, STL, SPLAT, SPZ and Potree formats, marching cubes, extrusion, mesh operations and normal-map texturing. A `polyform edit` node editor ships with it.
- Category: A8. Physics, audio and 3D assets
- Gap vs neighbours: `trimesh`, `gltf-transform` and `meshoptimizer` already cover mesh processing. Polyform's extra value is procedural generation plus Gaussian splat formats (SPZ and SPLAT) in one library, next to `splat-transform`.
- Route: library-or-runtime
- Licence: MIT
- Version/date: v0.45.0, 2026-11-16 (Go module proxy)
- Stars: 240. Last push: 2026-11-17
- Install: Download a prebuilt binary from GitHub releases, or `go run ./cmd/polyform`. No Homebrew formula found (unverified).
- Caveats: The CLI centres on the editor GUI. Headless use means Go code against the library packages. Overlaps a lot with tools already catalogued.
- Found via: GitHub topic search `gltf`

### Palt Typesetting (`palt-typesetting`) — niche, keep in mind
- [ ] triage: assess | defer | retire
- URL: https://github.com/yamatoiizuka/palt-typesetting
- Role: A JavaScript library for Japanese and mixed Japanese-Latin text typesetting. It applies proportional spacing (`palt`), inserts quarter-em spacing between scripts, applies kerning rules and breaks lines at word boundaries.
- Category: A4. Vector, typography, diagrams and stills (lower-priority gap: localisation of on-screen text)
- Gap vs neighbours: `harfbuzz`, `opentype-js` and `troika-three-text` shape glyphs but do not apply Japanese composition rules. Useful when a browser-captured scene carries Japanese titles or captions.
- Route: library-or-runtime
- Licence: MIT
- Version/date: 0.9.5, 2026-10-25 (npm)
- Stars: 122. Last push: 2026-11-09
- Install: `npm install palt-typesetting`
- Caveats: It works on the DOM (`renderToSelector`) and wraps characters in spans, so it fits only the browser-capture route. Output depends on the loaded font's `palt` feature. The README is in Japanese.
- Found via: GitHub topic search `typesetting`

### html-to-video (`html-to-video`) — niche, keep in mind
- [x] triage: defer
- Triage reason (2026-11-27): clone-and-run project, no package; overlaps playwright + ffmpeg capture already in VCR. Revisit if packaged.
- URL: https://github.com/wx4766/html-to-video
- Role: A Node CLI with templates that renders a single HTML or Canvas file to MP4, GIF, a transparent layer or a poster. Each scene is a pure `frame(t)` function, and the CLI seeks headless Chromium to each frame and encodes with FFmpeg. It has four numeric QA gates (copy `check`, page `qa`, output `qc`, audio `master`), 12 named camera moves and SRT subtitle tracks.
- Category: A5. Video and capture
- Gap vs neighbours: It follows the same seek-and-capture pattern as VCR's own capture and `hyperframes`, so it does not add new rendering capability. The QA gates, which output JSON verdicts on copy, page and output, are worth a look as prior art for VCR's review layer.
- Route: native-cli-or-scripting
- Licence: MIT
- Version/date: unverified. No npm package found. The README refers to a "v2.0" feature set.
- Stars: 199. Last push: 2026-11-17 (repository created 2026-10-11)
- Install: `git clone` then `npm install` and `npx playwright install chromium`. VCR must not run `playwright install` (see the pre-installed browser note), so a fixture would point it at the existing Chromium.
- Caveats: Five weeks old, from a single author, and documented mainly in Chinese. It also ships as an agent skill. Treat it as a reference rather than a dependency.
- Found via: GitHub topic search `subtitles`

## Seen but rejected
- three-nebula, bevy_hanabi, bevy_enoki, party-js, NovaShader: rejected in earlier digests or engine-bound. Nothing material changed.
- anvaka/fieldplay: a browser vector-field explorer with no seek or headless export path.
- animafps/teres: GPL-3.0 motion blur through frame blending, last pushed 2026-07-21. Depends on VapourSynth like the rejected f0e/blur.
- colour-science/colour-hdri: BSD, but the last PyPI release was 0.2.6 on 2025-12-06. Belongs in the `colour-science` notes.
- wkjarosz/hdrview, tacentview, oculante: image viewers with GUIs.
- alecazam/kram: a KTX/KTX2 texture encoder for game pipelines. Too narrow for video.
- Geolm/onedraw: a Metal-only C++ SDF 2D renderer that needs a host app.
- LukyVj/GSS: a CSS-like language for 3D scenes, early stage and interactive.
- wader/static-ffmpeg: Docker images of static FFmpeg. Relevant to environment pinning, but Linux containers do not help macOS arm64 rendering.
- drewnoakes/metadata-extractor, bep/imagemeta, pyexiv2 (GPL-3.0), exiftool-rs (NOASSERTION licence): metadata readers. The `exiftool` and `exiv2` leads already cover this area.
- cubicibo/SUPer: GPL-3.0 PGS subtitle encoder for Blu-ray, not web delivery.
- danmolitor/forme, realtime-tex, boxesandglue, pagedjs, SILE, vmprint: paged-document typesetting, rejected or reported earlier.
- spnda/fastgltf, threepp, castle-engine: C++ libraries or engines with no gain over `gltf-transform` and `three-js`.
- Kinetic typography and motion "skills" repos (iart-ai/motion-skills, video-talkcraft, motion-graphics-skills and others): agent skills, not tools.
- Real-time frame interpolation apps (Framegen, smoovplay, FluidFrames, TheAnimeScripter, AGPL-3.0): real-time, GUI or GPU-vendor bound.
- Homebrew new formulae since 2026-11-10 (curl-impersonate, engram, globus-cli, goose-lang, mdspan, muvm, rea, ssh-tpm-agent, tidemail, ziggy): none relevant.

## Method notes
- Over budget: 58 calls against a budget of about 40. They were 18 GitHub repository searches, 1 homebrew-core commit search, 10 Show HN queries (all failed), 12 per-repo metadata searches, 6 npm or PyPI lookups, 7 README fetches, 2 Go module proxy lookups, 1 Homebrew formula lookup and 1 failed stargazer call.
- `hn.algolia.com` answered HTTP 200 but returned non-JSON bodies, so Show HN was not scanned. Changelog Nightly was not tried.
- Stargazer overlap could not run. The GitHub API returned 403 for repositories other than `conorluddy/vcr`, for example `gumyr/build123d` stargazers. The GitHub releases API was also blocked, so versions come from npm, the Go module proxy and Homebrew.
- Reverse neighbours for `opentype-js` and `libass` were approximated with README text search. The `libass` search found only media players and FFmpeg wrappers.
- Dedupe covered the 205 records in `catalog/tools` and `catalog/retired`, all 14 earlier digests (2026-11-01 to 2026-11-16), and every `discovery/*` branch on origin. No open discovery PR existed.
- Unverified: OpenEXR 3.5.4 release date; three.quarks seeded randomness; PureImage byte-identical output across machines; html-to-video version; Polyform Homebrew availability.
