# VCR

VCR is a local-first, agent-friendly workspace for creating and reviewing motion graphics, images, and video with native creative tools. It ships as a plugin for Claude Code and Codex, so an agent can use it from any project. This repository is being built in layers; the first foundation is tool discovery, deterministic capture and a reusable project layout.

## Current status

Layer 0 (tool suite) is complete, the plugin is installable (plugin PRD phases P0 and P1), and Layer 1 has not started. Concretely:

- **Catalogue**: 146 live records under `catalog/tools/`, one file each. The original 104 and 41 additional conversation-sourced candidates have documentation assessments; candidate verdicts await review. build123d was subsequently assessed and promoted after its fixture review. 16 tools were retired to `catalog/retired/` with their reasoning. `catalog/tools.json` and `catalog/INDEX.md` are generated; run `pnpm vcr catalog build` after editing a record. See [candidate ingestion](catalog/CANDIDATE-INGESTION.md) for the assessment and evidence process.
- **Evidence**: nine records carry validation evidence from the seven fixtures under `examples/`, all reproducible on the primary Mac with `run.sh`. Installation facts live in `environment/`, never in the catalogue.
- **Skills**: operating guides for the six core tools (SVG, GSAP, p5.js, Three.js, FFmpeg, Blender) plus ImageMagick and resvg, and workflow skills `start` (router), `init` (workspace setup) and `ingest` (candidate assessment). `.claude/skills` links there.
- **Plugin**: `plugin/` is a generated, committed Claude Code and Codex plugin: a single-file bundled CLI, the catalogue, the skills and example sources. It works from any directory against a read-only harness; see "Install as a plugin" below and `specifications/spikes/plugin-invocation.md`.
- **Code**: `packages/cli` (the `vcr` command), `packages/timeline` (PRD §9 time types only), `packages/capture` (deterministic browser frame capture, see `specifications/spikes/browser-capture.md`).
- **First production**: a Grapla launch proof of concept (PRD §18) was rendered and assembled without a timeline engine, then removed. It is in git history at `a39043a`.
- **Decided**: the composition engine is built in-house (ADR 0001), the studio stays headless with read-only visualisers (ADR 0002), and VCR is distributed as a plugin with a bundled CLI and three roots (ADR 0003). The timeline resolver, compositor and review surface described as later layers do not exist yet.

## Commands

Requires Node 22 and pnpm. `pnpm install`, then:

```text
pnpm validate                      # schemas, capability vocabulary, unknown-field diagnostics
pnpm vcr tools list --tier core    # filter by --capability, --tier, --category; add --json
pnpm vcr tools info ffmpeg-ffprobe [--full]
pnpm vcr tools examples ffmpeg-ffprobe
pnpm doctor                        # probes local tools, writes ~/.vcr/environment/ and (here) environment/<hostname>.json
pnpm vcr status                    # harness, workspace and machine roots; dev mode inside this repository
pnpm vcr workspace init            # make a directory a VCR workspace (vcr.json); idempotent
pnpm vcr example create <id>       # copy an example's sources into <workspace>/examples/<id>; prints next steps
pnpm vcr setup capture [--yes]     # plan, then install, Playwright + Chromium into ~/.vcr/runtime
pnpm vcr capture <scene.html> --width 1280 --height 720 --fps 30 [--out dir] [--verify]
pnpm vcr catalog build [--check]   # regenerate catalog/tools.json, INDEX.md and CANDIDATES.md from catalog/tools/*.json
pnpm vcr plugin build              # regenerate plugin/ (bundled CLI, skills, catalogue, manifests); commit it
pnpm test && pnpm typecheck
```

Every command logs one JSON line to stderr with `command`, `duration_ms` and `exit_code`. Exit codes: 0 ok, 1 failed, 2 usage.

Roots (`specifications/vcr-plugin-prd.md` §6.1): the harness is this repository (or `VCR_HARNESS`) and is never written outside dev mode; the workspace is the nearest ancestor of cwd holding `vcr.json` (or `--workspace`, `VCR_WORKSPACE`); machine state lives in `VCR_HOME` (default `~/.vcr`). This repository has its own `vcr.json`, so here harness and workspace coincide and maintainer commands (`catalog build`, `doctor --record`) are allowed.

## Install as a plugin

Both hosts install straight from GitHub. The repository is private, so your git credentials need access to `conorluddy/vcr`.

```text
# Claude Code
claude plugin marketplace add conorluddy/vcr
claude plugin install vcr@vcr

# Codex
codex plugin marketplace add conorluddy/vcr
codex plugin add vcr@vcr
```

Update with `claude plugin marketplace update vcr && claude plugin update vcr@vcr` (then restart Claude Code), or `codex plugin marketplace upgrade vcr && codex plugin add vcr@vcr`. Remove with `claude plugin uninstall vcr@vcr` or `codex plugin remove vcr@vcr`. For local development, pass this checkout's path instead of `conorluddy/vcr`; Claude Code then runs the plugin straight from `plugin/`, so run `pnpm vcr plugin build` after changes.

The plugin is `plugin/` (built by `pnpm vcr plugin build`, committed so installs need no build step); the marketplaces that point at it are `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`. It adds 11 skills and no hooks, MCP servers or background processes.

Releasing: hosts only pick up a change when the version changes. Bump `version` in `packages/cli/package.json` (semver; it flows into both manifests), run `pnpm vcr plugin build`, and merge. Unbumped changes on `main` reach nobody who already has the plugin installed.

Then, in any project, ask the agent to set up VCR (the `init` skill, `/vcr:init` in Claude Code). It writes `vcr.json`, records the machine's tools in `~/.vcr`, and offers to install the capture runtime (Playwright and about 150 MB of Chromium, shared across projects). Requires Node 22 or newer; nothing else is installed until you agree.

Under Codex's sandbox, VCR keeps its machine files in `<workspace>/.vcr` and captures with `--single-process` (byte-identical output, measured in spike S1). The first Chromium download must happen once outside the sandbox (`vcr setup capture --yes` in your own terminal).

### Codex network access: scope it to VCR

Capture starts a loopback server for the scene, and installs reach npm, so inside Codex both need `sandbox_workspace_write.network_access = true`. **Do not put that in `~/.codex/config.toml`**: it would let every Codex session, in every project, reach the internet from its commands, which makes it easier for an instruction hidden in a web page or file to send data out. Scope it to VCR instead:

- A profile, used only when you ask for it. Create `~/.codex/vcr.config.toml`:

  ```toml
  [sandbox_workspace_write]
  network_access = true
  # Optional: share one capture runtime across projects instead of <workspace>/.vcr
  # writable_roots = ["/Users/<you>/.vcr"]
  ```

  then run `codex -p vcr` (or `codex exec -p vcr "…"`) for VCR work.
- Or per run: `codex exec -c sandbox_workspace_write.network_access=true "…"`.

Without either, everything except capture and installs still works.

## Find a tool

The catalogue is a four-tier tree sized to the decisions an agent makes:

| Tier | Moment | Where | Budget |
| --- | --- | --- | --- |
| 0 | route a task | `catalog/INDEX.md` (candidates in `catalog/CANDIDATES.md`), `pnpm vcr tools list` | whole file under 16 KB; `vcr catalog build` prints measured sizes per tier |
| 1 | compare a shortlist | `pnpm vcr tools info <id>`, `catalog/tools/<id>.json` | about 200 tokens |
| 2 | commit to a tool | `pnpm vcr tools info <id> --full`, `skills/<id>/SKILL.md` | under 12 KB |
| 3 | do the work | `pnpm vcr tools examples <id>`, `examples/<id>/` | one at a time |

Budgets and every cross-reference (pairs with, skill, examples, facet sections) are enforced by `pnpm validate`.

## Start a project

Copy `projects/templates/product/` to `projects/<project-id>/`, then update `project.json`, brand tokens, asset manifest, and video records. Local project contents are ignored except `projects/templates/`; keep generated renders and caches under the configured output directories. For asset production, handoff checks and delivery variants, see [Produce and verify a native asset](skills/start/references/native-assets.md).

## Committed media policy

Media is ignored by directory, not by extension, so brand assets and fixtures can live in Git. Keep any committed image under 200 KB and any committed audio or video under 1 MB; anything larger belongs in an output directory or the asset store chosen in Layer 1. Prefer a content hash in `expected/` over a committed render where a hash is enough to verify.

## Repository map

- `catalog/` — one record per tool under `tools/`, retired records under `retired/`, generated `tools.json`, `INDEX.md` and `CANDIDATES.md`, the capability vocabulary, JSON Schemas, and the assessment brief.
- `environment/` — the maintainer's per-machine tool availability, written by `vcr doctor --record`. Users' records go to `~/.vcr/environment/`.
- `packages/cli/` — the `vcr` command. `packages/timeline/` — time types. `packages/capture/` — browser frame-capture harness.
- `skills/` — flat `skills/<name>/SKILL.md` toolkit and workflow guides in Agent Skills format.
- `plugin/` — generated Claude Code and Codex plugin (`pnpm vcr plugin build`); never edit by hand.
- `vcr.json` — marks this repository as a workspace too, so harness and workspace coincide here (dev mode).
- `examples/` — validated fixtures, each with `example.json`, `run.sh` and `expected/`; copied into other workspaces by `vcr example create`.
- `projects/` — ignored local productions and references; reusable `templates/` stay tracked.
- `shared/` — versioned shared components, transitions and presets (empty until Layer 1).
- `references/` — ideas and conversation references; curated production metadata is planned for later layers.
- `specifications/` — the PRD, the plugin PRD, decision records and spike reports.

See [`AGENTS.md`](AGENTS.md) for repository working rules and [`specifications/vcr-prd.md`](specifications/vcr-prd.md) for the complete product direction.

<!-- vcr:catalog-toc:start -->
## Tool catalogue

Generated by `vcr catalog build` from `catalog/tools/`; do not edit between the markers. ✓ validated, ◐ partial evidence. Agents route through [`catalog/INDEX.md`](catalog/INDEX.md); `vcr tools info <id>` prints any card.

### Core (6)

- [Blender](catalog/tools/blender.json) ✓ — Headless 3D rendering, Python scene build and compositing from the macOS app bundle
- [FFmpeg / ffprobe](catalog/tools/ffmpeg-ffprobe.json) ✓ — Native encoding, muxing, filtergraphs, probing and sequence assembly; every renderer's delivery path
- [GSAP](catalog/tools/gsap.json) ✓ — Paused, seekable timelines for DOM and SVG motion; the clock for every browser scene
- [p5.js](catalog/tools/p5-js.json) ✓ — Generative 2D and WebGL sketches written as a pure function of time and seed
- [SVG](catalog/tools/svg.json) ◐ — Dependency-free vector source for cards, logos and diagrams; rasterised by resvg or a browser
- [Three.js](catalog/tools/three-js.json) ✓ — Browser 3D rendered once per seek with alpha: product shots, hero objects, camera moves

### Catalogued (88)

- **Creative coding and 2D**: [canvas-sketch](catalog/tools/canvas-sketch.json), [Fabric.js](catalog/tools/fabric-js.json), [Konva](catalog/tools/konva.json) ✓, [Paper.js](catalog/tools/paper-js.json), [PixiJS](catalog/tools/pixijs.json), [Pts](catalog/tools/pts.json), [Rough.js](catalog/tools/rough-js.json), [Ssam](catalog/tools/ssam.json), [Two.js](catalog/tools/two-js.json)
- **Animation and authored assets**: [Anime.js](catalog/tools/anime-js.json) ✓, [Lottie Web](catalog/tools/lottie-web.json), [Motion](catalog/tools/motion.json), [Motion Canvas](catalog/tools/motion-canvas.json), [React Spring](catalog/tools/react-spring.json), [Rive Web](catalog/tools/rive-web.json), [Theatre.js](catalog/tools/theatre-js.json), [tween.js](catalog/tools/tween-js.json)
- **3D, shaders and effects**: [Babylon.js](catalog/tools/babylon-js.json), [Drei](catalog/tools/drei.json), [gl-react](catalog/tools/gl-react.json), [OGL](catalog/tools/ogl.json), [PixiJS Filters](catalog/tools/pixijs-filters.json), [PlayCanvas Engine](catalog/tools/playcanvas-engine.json), [postprocessing](catalog/tools/postprocessing.json), [React Three Fiber](catalog/tools/react-three-fiber.json), [regl](catalog/tools/regl.json), [Three.js Shading Language](catalog/tools/three-js-shading-language.json), [THREE.MeshLine](catalog/tools/three-meshline.json), [TWGL](catalog/tools/twgl.json)
- **Vector, typography, diagrams and stills**: [D3](catalog/tools/d3.json), [Graphviz](catalog/tools/graphviz.json), [Mermaid CLI](catalog/tools/mermaid-cli.json), [msdfgen](catalog/tools/msdfgen.json), [opentype.js](catalog/tools/opentype-js.json), [Potrace](catalog/tools/potrace.json), [resvg](catalog/tools/resvg.json) ✓, [Satori](catalog/tools/satori.json), [SVG.js](catalog/tools/svg-js.json), [SVGO](catalog/tools/svgo.json)
- **Video and capture**: [canvas-record](catalog/tools/canvas-record.json), [CCapture.js](catalog/tools/ccapture-js.json), [ffmpeg.wasm](catalog/tools/ffmpeg-wasm.json), [gifski](catalog/tools/gifski.json), [Hyperframes](catalog/tools/hyperframes.json), [Mediabunny](catalog/tools/mediabunny.json), [Mediabunny server extension](catalog/tools/mediabunny-server-extension.json), [MLT / melt](catalog/tools/mlt-melt.json), [Playwright](catalog/tools/playwright.json) ✓, [PySceneDetect](catalog/tools/pyscenedetect.json), [Remotion](catalog/tools/remotion.json)
- **Image processing and colour**: [G'MIC](catalog/tools/g-mic.json), [GIMP batch](catalog/tools/gimp-batch.json), [ImageMagick](catalog/tools/imagemagick.json) ✓, [Jimp](catalog/tools/jimp.json), [OpenColorIO](catalog/tools/opencolorio.json), [OpenImageIO / oiiotool](catalog/tools/openimageio-oiiotool.json), [RawTherapee CLI](catalog/tools/rawtherapee-cli.json), [Sharp](catalog/tools/sharp.json) ✓
- **Native applications and procedural tools**: [After Effects](catalog/tools/after-effects.json), [Aseprite](catalog/tools/aseprite.json), [Godot](catalog/tools/godot.json), [Houdini](catalog/tools/houdini.json), [Inkscape](catalog/tools/inkscape.json), [Manim Community](catalog/tools/manim-community.json), [POV-Ray](catalog/tools/pov-ray.json), [Synfig](catalog/tools/synfig.json), [vpype](catalog/tools/vpype.json), [vsketch](catalog/tools/vsketch.json)
- **Physics, audio and 3D assets**: [glTF Transform](catalog/tools/gltf-transform.json), [Matter.js](catalog/tools/matter-js.json), [Rapier](catalog/tools/rapier.json), [Tone.js](catalog/tools/tone-js.json)
- **Adjacent resources mentioned during discovery**: [CanvasKit / Skia](catalog/tools/canvaskit-skia.json), [deck.gl](catalog/tools/deck-gl.json), [dotLottie](catalog/tools/dotlottie.json), [OpenCV.js](catalog/tools/opencv-js.json), [react-three/postprocessing](catalog/tools/react-three-postprocessing.json), [react-three/rapier](catalog/tools/react-three-rapier.json), [Shotstack](catalog/tools/shotstack.json), [Troika Three Text](catalog/tools/troika-three-text.json), [vtk.js](catalog/tools/vtk-js.json)
- **Discovery: conversation candidates**: [build123d](catalog/tools/build123d.json) ◐
- **Native browser platform APIs**: [Canvas 2D](catalog/tools/canvas-2d.json) ✓, [Web Animations API](catalog/tools/web-animations-api.json) ✓, [Web Audio API](catalog/tools/web-audio.json), [WebCodecs](catalog/tools/webcodecs.json), [WebGL](catalog/tools/webgl.json), [WebGPU](catalog/tools/webgpu.json)
<!-- vcr:catalog-toc:end -->
