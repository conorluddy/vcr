# VCR

VCR is an agent-friendly studio for code-first motion graphics, images and video. It ships as a plugin for Claude Code and Codex. An agent can then pick the right native tool for a job, capture browser scenes frame by frame, plan a video before building it, and file review findings that only a person can close. It runs locally and has no editor: humans review renders, and agents do the building.

## What works today

| Area | What exists |
| --- | --- |
| **Tool catalogue** | 146 records (6 core, 88 catalogued, 52 candidates); 15 carry validation evidence from fixtures under `examples/`. Routed through `catalog/INDEX.md` and `vcr tools`; cross-catalogue progress and coverage are shown by `vcr tools status`. |
| **Creative pillars** | Knowledge bases and rule tables for typography, motion, pacing, story, sound, art, accessibility, delivery and more, under `references/`. Read with `vcr refs` and `vcr rules`, one section or rule at a time. |
| **Capture** | Deterministic browser frame capture (`vcr capture`, with `--verify` to recapture in shuffled order). `--video` records a render with a retained manifest. |
| **Briefs and plans** | A series brief (`brief.json`) and a video brief (`brief.md`), written with the `brief` skill. A beat sheet (`beats.json`) is checked before anything renders (`vcr plan check`) and gives scenes their markers (`vcr plan markers`). |
| **Inspiration library** | Reference material the person provides (saved images, clips, fonts, colour sets), taken in with `vcr inspiration add` and the `inspiration` skill. Each item keeps what the person said they like, what a tool measured and what an analyst agent observed in separate fields; files are copied to a git-ignored folder. Briefs cite items by id. |
| **Review contract** | Findings, render manifests and approvals per video. `vcr lint --video` files layout findings, and agents claim fixes. Only a person approves a render or closes a finding, at their own terminal. |
| **Plugin** | `plugin/` is a generated, committed bundle: a single-file CLI, the catalogue, 22 skills, the pillar references and a `typographer` reviewer agent. It works from any directory against a read-only harness. |

**Not built yet:** the review pages (plugin PRD P3 onward), Layer 1 (timeline resolver, compositor), and approvals on plans ([#173](https://github.com/conorluddy/vcr/issues/173)). See [`specifications/roadmap.md`](specifications/roadmap.md) for the order.

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

Then, in any project, ask the agent to set up VCR (the `init` skill, or `/vcr:init` in Claude Code). It writes `vcr.json`, records the machine's tools in `~/.vcr`, and offers to install the capture runtime (Playwright and about 150 MB of Chromium, shared across projects). It needs Node 22 or newer, and installs nothing else until you agree.

- **Update:** `claude plugin marketplace update vcr && claude plugin update vcr@vcr`, then restart Claude Code. On Codex: `codex plugin marketplace upgrade vcr && codex plugin add vcr@vcr`.
- **Remove:** `claude plugin uninstall vcr@vcr` or `codex plugin remove vcr@vcr`.
- **Local development:** pass this checkout's path instead of `conorluddy/vcr`. The plugin then runs from `plugin/`, so run `pnpm vcr plugin build` after changes.

### Codex: scope network access to VCR

Capture starts a loopback server and installs reach npm, so inside Codex's sandbox both need `sandbox_workspace_write.network_access = true`. **Don't set it in `~/.codex/config.toml`.** That would give every Codex session in every project network access from its commands, which makes it easier for an instruction hidden in a web page or file to send data out. Scope it instead:

- **A profile:** create `~/.codex/vcr.config.toml` with

  ```toml
  [sandbox_workspace_write]
  network_access = true
  # Optional: share one capture runtime across projects instead of <workspace>/.vcr
  # writable_roots = ["/Users/<you>/.vcr"]
  ```

  and run `codex -p vcr` for VCR work.
- **Per run:** `codex exec -c sandbox_workspace_write.network_access=true "…"`.

Without either, everything except capture and installs still works. Under the sandbox, VCR keeps machine files in `<workspace>/.vcr` and captures with `--single-process`, which gives byte-identical output. Download Chromium once outside the sandbox with `vcr setup capture --yes`.

## How a video gets made

A video lives at `projects/<project>/videos/<video>/` in the user's workspace, never in the plugin.

1. **Register it** with `vcr video init demo/teaser`.
2. **Hand over references, if there are any:** `vcr inspiration add <file|dir>` takes local files in; the `inspiration` skill asks what the person likes in each and records their words.
3. **Brief it:** the `brief` skill interviews for the series brief and the video brief. The person confirms the brief before anything is built.
4. **Plan it:** write `beats.json`, then run `vcr plan check --video demo/teaser` until there are no blockers or majors. `vcr plan markers` gives the scene its `window.__scene.markers`.
5. **Choose tools:** `vcr tools list`, then `vcr tools info <id>`, then `--full` for the guide, then `vcr tools examples <id>`. Read one tier at a time.

6. **Build and capture:** Inspect key frames with `vcr preview scene.html --width 1080 --height 1920 --fps 30 --at 2.4 --neighbors 1`, then run `vcr capture scene.html --width 1080 --height 1920 --fps 30 --video demo/teaser` to retain a render.
7. **Review:** `vcr lint scene.html --safe-zone tiktok --markers --video demo/teaser` files findings. Agents fix them and run `vcr findings address`. A person approves or requests changes with `vcr review approve demo/teaser`.

Capture and lint readiness errors report the serving root, failed resource URLs/statuses and page errors. A retained video capture refreshes its generated `review/REVIEW.md`; existing manual edits or drift are preserved with a warning.

For catalogue-wide progress, run `vcr tools status`. It shows documentation status, this machine's installation/readiness, validation evidence and adapter maturity; filter with `--tier`, `--validation`, `--documentation` or `--adapter`, or use `--json` for structured output. Tool records and environment records are the sources of truth; agents run this view when answering progress or coverage questions.

`vcr status --brief` shows what is waiting at any point. [`references/cli.md`](references/cli.md) is the full command reference, generated from the CLI. Every command also answers `--help`, and `--json` turns errors into `{ code, message, retryable }`.

## Developing the harness

You need Node 22 and pnpm. Run `pnpm install`, then:

```text
pnpm vcr status                    # roots: harness, workspace, machine; "dev" mode inside this repository
pnpm vcr tools list --tier core    # or any command: pnpm vcr <command> --help
pnpm vcr tools status              # catalogue-wide progress and coverage
pnpm doctor                        # probe local tools; writes ~/.vcr/environment/ and environment/<hostname>.json
pnpm vcr catalog build             # regenerate tools.json, INDEX.md, CANDIDATES.md and generated tables
pnpm vcr plugin build              # regenerate plugin/ and references/cli.md; commit the result
pnpm validate && pnpm test && pnpm typecheck
```

- **Decisions and specs:** ADRs live in `specifications/decisions/` and feature PRDs in `specifications/prd/`, managed with `node scripts/whatwhy.mjs` (`status`, `new adr|prd`, `check`). A pull request names the PRD or ADR it implements, or says `no-spec: <reason>`. The process is in `AGENTS.md`.
- **Before a PR:** after changing the CLI, catalogue, skills or examples, run `pnpm vcr plugin build`. The pre-commit hook in `.githooks/` runs it as well. Always run `pnpm validate && pnpm test` before opening a PR.
- **Branches:** never push to `main`. Work on branches and merge through PRs.
- **Releasing:** hosts only pick up a change when the version changes. Bump `version` in `packages/cli/package.json` (it flows into both manifests), rebuild the plugin, and merge.
- **Roots** (plugin PRD §6.1, ADR 0003):
  - The harness is this repository or the installed plugin. It is read-only outside dev mode.
  - The workspace is the nearest ancestor holding `vcr.json`, or the one set by `--workspace` or `VCR_WORKSPACE`.
  - Machine state lives in `VCR_HOME` (default `~/.vcr`).
  - This repository has its own `vcr.json`, so here the harness and the workspace are the same directory, and maintainer commands are allowed.
- **Logging:** every command logs one JSON line to stderr. Exit codes are 0 for ok, 1 for failed and 2 for a usage error.
- **Committed media:**
  - Media is ignored by directory, not by extension.
  - Committed images stay under 200 KB, and audio or video under 1 MB.
  - Where a content hash in `expected/` is enough to verify a result, use it instead of a committed render.

## Repository map

- `catalog/`: tool records (`tools/`, `retired/`), the generated `tools.json`, `INDEX.md` and `CANDIDATES.md`, the capability vocabulary, and every JSON Schema (`schemas/`: briefs, beat sheet, findings, manifests, approvals and more).
- `references/`: the creative pillars. Start at `INDEX.md`; each pillar has a README, a knowledge base and rules. `cli.md` is generated.
- `skills/`: toolkit guides (`web-animations-api`, `three-js`, …) and workflow skills (`start`, `init`, `brief`, `inspiration`, `ingest`, `evidence`, `guide`, `typography` and the other pillar workflows). `agents/`: reviewer, research and analyst agents.
- `packages/`:
  - `cli`: the `vcr` command;
  - `capture`: browser frame capture;
  - `lint`: scene layout checks;
  - `timeline`: time types.
- `examples/`: fixtures with `example.json`, `run.sh` and `expected/`, which back the validation evidence and are copied out by `vcr example create`.
- `plugin/`: the generated Claude Code and Codex plugin. Never edit it by hand.
- `projects/`: local productions, ignored except `templates/`. `environment/`: the maintainer's machine records. `prospects/`: the inbox for weekly tool discovery.
- `specifications/`: the [PRD](specifications/vcr-prd.md), the [plugin PRD](specifications/vcr-plugin-prd.md), the [roadmap](specifications/roadmap.md), the decision records and the spike reports.

The decisions behind it:

- ADR 0001: the composition engine is built in-house.
- ADR 0002: the studio is headless, with no editor.
- ADR 0003: VCR ships as a plugin with three roots.
- ADR 0004: progressive disclosure and structured feedback for agents.
- ADR 0006: the creative pillars stay independent of tools.
- ADR 0011: inspiration is a workspace library, separate from assets.
- ADR 0012: what a person stated, a tool measured and a model judged are kept apart.
- ADR 0013: models are chosen per agent, in the workspace.

Working rules for agents are in [`AGENTS.md`](AGENTS.md).

<!-- vcr:catalog-toc:start -->
## Tool catalogue

Generated by `vcr catalog build` from `catalog/tools/`; do not edit between the markers. ✓ validated, ◐ partial evidence. Agents route through [`catalog/INDEX.md`](catalog/INDEX.md); `vcr tools info <id>` prints any card.

### Core (5)

- [Blender](catalog/tools/blender.json) ✓ — Headless 3D rendering, Python scene build and compositing from the macOS app bundle
- [FFmpeg / ffprobe](catalog/tools/ffmpeg-ffprobe.json) ✓ — Native encoding, muxing, filtergraphs, probing and sequence assembly; every renderer's delivery path
- [p5.js](catalog/tools/p5-js.json) ✓ — Generative 2D and WebGL sketches written as a pure function of time and seed
- [SVG](catalog/tools/svg.json) ◐ — Dependency-free vector source for cards, logos and diagrams; rasterised by resvg or a browser
- [Three.js](catalog/tools/three-js.json) ✓ — Browser 3D rendered once per seek with alpha: product shots, hero objects, camera moves

### Catalogued (98)

- **Creative coding and 2D**: [Canvas 2D](catalog/tools/canvas-2d.json) ✓, [canvas-sketch](catalog/tools/canvas-sketch.json) ✓, [CanvasKit / Skia](catalog/tools/canvaskit-skia.json) ✓, [Fabric.js](catalog/tools/fabric-js.json) ✓, [Konva](catalog/tools/konva.json) ✓, [Paper.js](catalog/tools/paper-js.json) ✓, [PixiJS](catalog/tools/pixijs.json) ✓, [Pts](catalog/tools/pts.json) ✓, [Rough.js](catalog/tools/rough-js.json) ✓, [Ssam](catalog/tools/ssam.json) ✓, [Two.js](catalog/tools/two-js.json) ✓
- **Animation and authored assets**: [Anime.js](catalog/tools/anime-js.json) ✓, [dotLottie](catalog/tools/dotlottie.json) ✓, [Lottie Web](catalog/tools/lottie-web.json) ✓, [Motion](catalog/tools/motion.json) ✓, [Motion Canvas](catalog/tools/motion-canvas.json) ✓, [Ranim](catalog/tools/ranim.json) ✓, [React Spring](catalog/tools/react-spring.json) ◐, [Rive Web](catalog/tools/rive-web.json) ✓, [Theatre.js](catalog/tools/theatre-js.json) ✓, [tween.js](catalog/tools/tween-js.json) ✓, [Web Animations API](catalog/tools/web-animations-api.json) ✓
- **3D rendering, shaders and effects**: [Babylon.js](catalog/tools/babylon-js.json) ✓, [Drei](catalog/tools/drei.json) ✓, [gl-react](catalog/tools/gl-react.json) ✓, [OGL](catalog/tools/ogl.json) ✓, [PixiJS Filters](catalog/tools/pixijs-filters.json) ✓, [PlayCanvas Engine](catalog/tools/playcanvas-engine.json) ✓, [postprocessing](catalog/tools/postprocessing.json) ✓, [React Three Fiber](catalog/tools/react-three-fiber.json) ✓, [react-three/postprocessing](catalog/tools/react-three-postprocessing.json) ✓, [regl](catalog/tools/regl.json) ✓, [Three.js Shading Language](catalog/tools/three-js-shading-language.json) ✓, [THREE.MeshLine](catalog/tools/three-meshline.json) ✓, [Troika Three Text](catalog/tools/troika-three-text.json) ✓, [TWGL](catalog/tools/twgl.json) ✓, [vedo](catalog/tools/vedo.json) ✓, [vtk.js](catalog/tools/vtk-js.json) ✓, [WebGL](catalog/tools/webgl.json) ✓, [WebGPU](catalog/tools/webgpu.json) ✓
- **Vector, typography, diagrams and stills**: [D3](catalog/tools/d3.json) ✓, [Graphviz](catalog/tools/graphviz.json) ✓, [Mermaid CLI](catalog/tools/mermaid-cli.json) ✓, [msdfgen](catalog/tools/msdfgen.json) ✓, [opentype.js](catalog/tools/opentype-js.json) ✓, [Potrace](catalog/tools/potrace.json) ✓, [resvg](catalog/tools/resvg.json) ✓, [Satori](catalog/tools/satori.json) ✓, [SVG.js](catalog/tools/svg-js.json) ✓, [SVGO](catalog/tools/svgo.json) ✓
- **Video, capture and delivery**: [canvas-record](catalog/tools/canvas-record.json) ✓, [CCapture.js](catalog/tools/ccapture-js.json) ✓, [ffmpeg.wasm](catalog/tools/ffmpeg-wasm.json) ✓, [Frames CLI](catalog/tools/frames-cli.json) ✓, [gifski](catalog/tools/gifski.json) ✓, [Hyperframes](catalog/tools/hyperframes.json) ✓, [Mediabunny](catalog/tools/mediabunny.json) ✓, [Mediabunny server extension](catalog/tools/mediabunny-server-extension.json) ✓, [MediaInfo](catalog/tools/mediainfo.json) ✓, [MLT / melt](catalog/tools/mlt-melt.json) ✓, [OpenTimelineIO](catalog/tools/opentimelineio.json) ✓, [Playwright](catalog/tools/playwright.json) ✓, [PySceneDetect](catalog/tools/pyscenedetect.json) ✓, [WebCodecs](catalog/tools/webcodecs.json) ✓
- **Image processing and colour**: [G'MIC](catalog/tools/g-mic.json) ✓, [GIMP batch](catalog/tools/gimp-batch.json) ✓, [ImageMagick](catalog/tools/imagemagick.json) ✓, [Jimp](catalog/tools/jimp.json) ✓, [MediaPipe](catalog/tools/mediapipe.json) ✓, [OpenColorIO](catalog/tools/opencolorio.json) ✓, [OpenCV.js](catalog/tools/opencv-js.json) ✓, [OpenImageIO / oiiotool](catalog/tools/openimageio-oiiotool.json) ✓, [RawTherapee CLI](catalog/tools/rawtherapee-cli.json) ✓, [Sharp](catalog/tools/sharp.json) ✓
- **Native applications and procedural tools**: [build123d](catalog/tools/build123d.json) ◐, [Godot](catalog/tools/godot.json) ✓, [Inkscape](catalog/tools/inkscape.json) ✓, [Manim Community](catalog/tools/manim-community.json) ✓, [POV-Ray](catalog/tools/pov-ray.json) ✓, [Synfig](catalog/tools/synfig.json) ✓, [vpype](catalog/tools/vpype.json) ✓, [vsketch](catalog/tools/vsketch.json) ✓
- **Physics and simulation**: [Matter.js](catalog/tools/matter-js.json) ✓, [Rapier](catalog/tools/rapier.json) ✓, [react-three/rapier](catalog/tools/react-three-rapier.json) ✓
- **Audio, music and speech**: [LV2](catalog/tools/lv2.json) ✓, [Meyda](catalog/tools/meyda.json) ✓, [Mido](catalog/tools/mido.json) ✓, [music21](catalog/tools/music21.json) ✓, [Tone.js](catalog/tools/tone-js.json) ✓, [Web Audio API](catalog/tools/web-audio.json) ✓
- **3D assets and interchange**: [COLMAP](catalog/tools/colmap.json) ✓, [glTF Transform](catalog/tools/gltf-transform.json) ✓, [KTX-Software](catalog/tools/ktx-software.json) ✓, [meshoptimizer](catalog/tools/meshoptimizer.json) ✓, [Nerfstudio](catalog/tools/nerfstudio.json) ◐
- **Maps and geodata**: [deck.gl](catalog/tools/deck-gl.json) ✓
- **Captions, accessibility and provenance**: [c2patool](catalog/tools/c2patool.json) ✓
<!-- vcr:catalog-toc:end -->

## Licence

VCR's original software and documentation are licensed under [Apache-2.0](LICENSE). When redistributing VCR or derivative works, preserve the applicable copyright and attribution notices, include the licence, and follow its modification-notice requirements; see [NOTICE](NOTICE). Simply using VCR to create an original video or image does not require a VCR credit. Incorporating existing licensed assets or code can carry their own obligations.

Third-party dependencies, fonts, excerpts and other attributed material retain their own rights and terms; see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES). Catalogue inclusion is documentation, not a grant of rights to the catalogued tool.
