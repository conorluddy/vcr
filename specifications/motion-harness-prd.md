# Motion Harness — Product Requirements Document

Version: 0.1 • Date: 26 October 2026 • Owner: Conor Luddy

Status: Proposed specification. Captures the agreed product direction; implementation choices explicitly labelled provisional remain subject to technical spikes. No integrations are represented as installed or validated by this document.

## 1. Product definition

Motion Harness is a canonical, agent-friendly repository for creating, editing, reviewing and exporting motion graphics, images and videos using code-first libraries and command-line creative tools. It starts as a comprehensive toolkit and grows into a shared production system through independently useful layers.

The repository can hold many products, video series and individual productions. Completed work becomes a searchable reference collection, improving future creation without loading the entire collection into an agent's context. Standalone projects can use the same contracts and selected tools.

Core promise: choose an appropriate tool, create a reproducible production, inspect its output, make precise revisions and deliver the intended formats. Native toolkit capabilities remain accessible throughout.

## 2. Problem and opportunity

Agents can write graphics code, but reliable production requires more than code generation. Tools differ in installation, clocks, asset loading, seeking, compositing, export and execution environments. One-off projects repeatedly solve these problems and lose useful production knowledge.

The harness supplies operational knowledge, tested examples and increasingly consistent commands. It centralises production concerns without rebuilding every renderer or hiding useful native functionality. A growing corpus of approved work supplies concrete examples of composition, motion, scene structure and delivery.

## 3. Users and jobs

Primary user: a solo developer/designer working with coding agents to produce product videos, marketing series, explainers, procedural artwork and reusable motion assets.

Secondary user: a coding agent that must discover capabilities, follow a brief, select tools, execute renders, inspect results and revise the correct source.

Key jobs:

1. Start a video for a product or recurring series using existing brand assets and successful references.
2. Generate an isolated visual experiment using any catalogued toolkit.
3. Assemble native scenes, recorded footage, images and narration into one production.
4. Request precise edits by scene ID, marker, timecode or parameter.
5. Export a still, loop, transparent overlay, image sequence or complete video.
6. Produce platform-specific versions without rebuilding the content manually.
7. Revisit an old production and reproduce or deliberately migrate it.

## 4. Goals and constraints

### Goals

- Comprehensive discovery across JS/TS libraries and tools with useful CLI or scripting interfaces.
- Useful first release before a universal timeline exists.
- Progressive disclosure of skills, examples and reference projects.
- Explicit, repeatable time and rendering behaviour.
- Multi-project workspace with deliberate reuse and project isolation.
- Native source remains editable and inspectable.
- Consistent diagnostics and eventual preview/render/review interfaces.
- Local-first operation, with optional remote execution later.

### Non-goals for initial releases

- Replacing Blender, After Effects or other native authoring applications.
- A full graphical nonlinear editor.
- Universal translation between native scene formats.
- Shared 3D depth, lighting or geometry across unrelated renderers.
- Installing every catalogue entry automatically.
- Cloud rendering infrastructure, collaboration or SaaS billing.
- Automatically publishing videos to social platforms.
- Guaranteeing pixel-identical output across different GPUs, OSes and tool versions.

Catalogue breadth and adapter depth are independent. A resource may be catalogued without being installed, tested or exposed through a shared adapter.

## 5. Guiding principles

1. Each complexity layer delivers useful work independently.
2. The harness owns composition time, orchestration, asset identity and delivery; toolkits own native scene construction.
3. Prefer direct evaluation at a requested time; declare replay and caching requirements explicitly.
4. Keep content, design, motion parameters and production placement distinct.
5. Preserve approved productions when shared components evolve.
6. Retrieve a few relevant examples instead of loading the whole corpus.
7. Use native functionality through explicit escape hatches.
8. Treat rendering and review as a single iterative workflow.
9. Record uncertainties and environment constraints instead of implying universal support.

## 6. Layers and release gates

### Layer 0 — Tool suite

Scope: complete initial resource catalogue; capability-based discovery; toolkit skills; installation recipes; environment diagnostics; native scaffolds and smoke tests.

Requirements:

- L0-01: Every resource in Appendix A has a registry entry with category, role, official URL, automation route and validation status.
- L0-02: Separate documentation status, installation status, validation evidence and adapter maturity. Installation is machine-specific; validation is specific to tool version, OS and environment.
- L0-03: Tool setup is on demand, reports planned changes and is idempotent where feasible. Required permissions follow the execution environment.
- L0-04: Every operational toolkit skill includes an example, expected output and troubleshooting guidance.
- L0-05: Unvalidated tools remain discoverable but are clearly labelled.
- L0-06: Toolkit-specific rendering commands remain supported without the shared timeline.

Acceptance: search tools for SVG animation, 3D product shots or video assembly; inspect missing dependencies; scaffold and render verified examples from at least three distinct tool families. All Appendix A resources are catalogued; initial operational targets are SVG/GSAP, p5.js, Three.js and FFmpeg, with Blender as the first native application spike.

### Layer 1 — Project workspace

Scope: product/series/video hierarchy, briefs, asset manifests, stable IDs, source conventions, output locations and render manifests.

Requirements:

- L1-01: Create both an in-repo project and a standalone project from the same schema.
- L1-02: A product or series can share brand tokens, assets and components across videos.
- L1-03: Video records include brief, source, dependencies, parameters, review status and deliverables.
- L1-04: Generated media and local caches are excluded from ordinary Git by default.
- L1-05: Dependency pins and a render recipe can be retained for completed work.
- L1-06: Provide a basic preview or native-preview route from this layer; sophisticated review is deferred.

Acceptance: two videos share a product brand; a third project is isolated. A clean checkout can resolve declared dependencies/assets and reproduce a known fixture using documented commands. No source paths outside the selected project are modified inadvertently.

### Layer 2 — Basic timeline

Scope: rational composition FPS, dimensions, clip placement, sequential assembly, source trimming, constant playback rate, simple markers and a resolved schedule. Begin with one visual track and a simple soundtrack route.

Requirements:

- L2-01: Separate composition time, clip-local time and source time.
- L2-02: Sequential and explicit placements resolve into unambiguous frame intervals.
- L2-03: Clips support duration, source in/out and constant rate. Freeze/reverse/ramping are deferred.
- L2-04: Markers can be absolute or relative to named clip boundaries; unresolved and cyclic references fail validation.
- L2-05: Render a frame, range or full composition where the adapter supports it.
- L2-06: Gaps have an explicit background policy; overlaps on the single visual track are rejected until Layer 3.
- L2-07: Duration and rounding policies are documented and shared by preview and export.

Acceptance: assemble a title, procedural scene and prerecorded clip; trim footage; move a clip without altering its internal motion; render exact marker frames; verify adjacent clip boundaries have no accidental duplicate or missing frame.

### Layer 3 — Layered composition

Scope: overlapping tracks, groups, 2D transforms, opacity, nested compositions, crossfades and basic reusable transitions.

Requirements:

- L3-01: Deterministic z-order, group transforms and visibility.
- L3-02: Explicit alpha, coordinate and colour contracts at adapter boundaries.
- L3-03: Transitions declare overlap duration, required handles and duration policy.
- L3-04: Nested composition timing and inherited properties are explicit.
- L3-05: Unsupported native effects are pre-rendered or rejected with a useful diagnostic.

Acceptance: layer transparent typography over a Three.js shot and footage; crossfade two sources; nest a reusable end card; show a clear error for insufficient footage handles. A transparent-edge fixture composites without unexpected halos within the chosen tolerance.

### Layer 4 — Advanced motion

Scope: keyframes, easing, motion paths where supported, time remapping, speed ramps, reverse/freeze, masks, mattes, blend modes and programmable transitions.

Requirements:

- L4-01: Time maps define source position as a function of local time; speed curves integrate into that position.
- L4-02: Mask space, inversion, feathering, nesting and evaluation timing are defined.
- L4-03: Keyframe interpolation and extrapolation are versioned and inspectable.
- L4-04: Replay-only scenes expose cache/simulation requirements.
- L4-05: Motion blur and temporal sampling remain declared capabilities, rather than mandatory lowest-common-denominator behaviour.

Acceptance: render a speed ramp deterministically; freeze and reverse footage; animate a mask reveal; compare direct sequential rendering with shuffled frame requests for a seekable fixture. Unsupported reverse audio behaviour is rejected or handled under an explicit policy.

### Layer 5 — Production system

Scope: multitrack audio, gain envelopes, fades, ducking, voice-over cues, captions, aspect-ratio layouts, platform safe areas and export presets.

Requirements:

- L5-01: Audio timing uses sample-aware boundaries and explicit resampling/stretching rules.
- L5-02: Speech/beat analysis is stored as an input artifact; offline rendering does not depend on realtime analysis.
- L5-03: Portrait, landscape and square may use different layouts driven by shared content.
- L5-04: Caption source, styling, burn-in and sidecar delivery are separate options.
- L5-05: Preflight verifies format, codec, alpha, colour and audio expectations for each preset.

Acceptance: export portrait and landscape variants with correct layout, captions and narration alignment; detect text overflow; create separate preview and final profiles with identical editorial timing.

### Layer 6 — Review and iteration

Scope: contact sheets, marker captures, boundary frames, targeted previews, render reports, visual comparisons and stable review references.

Requirements:

- L6-01: Review comments resolve to video, scene/clip ID, composition frame and render revision.
- L6-02: Automatic checks cover missing assets, invalid metadata, overflow where measurable and unexpected blank frames against declared expectations.
- L6-03: Subjective issues are findings for review, not silently treated as objective failures.
- L6-04: Revisions can be compared and approved without changing earlier evidence.

Acceptance: an agent can receive a frame-specific finding, change the right parameter/source, render a local range and produce before/after evidence. Approval remains an explicit state; self-review does not automatically mean approved.

### Layer 7 — Reuse and orchestration

Scope: searchable completed-work corpus, reusable templates, dependency-aware caches, batch variants and optional execution backends.

Requirements:

- L7-01: Filter references by tool, technique, aspect ratio, project and review status.
- L7-02: Search results link a small summary to source, preview and lessons; full source loads on demand.
- L7-03: Shared-code upgrades are explicit and cannot silently alter a completed production.
- L7-04: Batch jobs support resumability, cancellation, concurrency limits and failure isolation.
- L7-05: Cache keys incorporate content and rendering dependencies; explain cache hits/misses.

Acceptance: find an approved portrait product reveal, adapt it into a new video, render multiple text variants and resume after an interrupted job without rerendering valid cached work.

## 7. Repository and distribution model

Default: one monorepo containing the harness and multiple projects. Optional: standalone projects depending on a versioned harness distribution. A cloned canonical repository must work without requiring package publication on day one; package boundaries should make later publishing possible.

```text
motion-harness/
  AGENTS.md
  catalog/tools/
  catalog/capabilities/
  skills/toolkits/
  skills/workflows/
  packages/cli/
  packages/core/
  packages/timeline/
  packages/compositor/
  packages/adapters/
  examples/
  shared/components/
  shared/transitions/
  shared/presets/
  projects/<project-id>/
    project.yaml
    brand/
    assets/manifest.yaml
    components/
    videos/<video-id>/
      brief.md
      video.yaml
      scenes/
      review/
      render-manifest.json
  references/index/
  references/curated/
```

Generated outputs and caches use configured external or ignored local directories. Lightweight approved contact sheets may be committed under an explicit size policy. Large footage, models and renders use an asset-store interface; choose the first backend during Layer 1. Git LFS is an option, not a prerequisite.

Project inheritance order: harness defaults → project/series configuration → video configuration → explicit render-job overrides. The resolved configuration is retained. Stable IDs survive renaming folders.

## 8. Domain model and schema requirements

| Entity | Required information |
| --- | --- |
| Tool definition | Stable ID, category, official URLs, automation route, install recipes, capabilities, constraints, license source, checked date |
| Environment record | Installed version, executable location, OS, GPU/backend, diagnostics, validation evidence |
| Project | ID, title, brand, dependency policy, assets, visibility/reuse scope |
| Video | ID, brief, content, scenes, composition, variants, approval state |
| Scene | ID, adapter, native entry point, parameter schema, asset dependencies, timing capabilities |
| Clip | Instance ID, scene/source reference, placement, trim, duration, time map, transform |
| Marker | ID, absolute or relative expression, scope, resolved position |
| Asset | ID, URI, content hash, metadata, provenance, rights, optional focal point |
| Render job | Composition revision, environment/profile, frame range, output targets, seed, status |
| Review record | Render ID, frame/range, severity, finding, evidence, resolution |
| Reference record | Source video, techniques, tools, preview, source paths, status, reuse constraints |

Schemas require versions and migration paths. Unknown fields should produce diagnostics rather than silently disappearing. Parameter schemas should express types, bounds, defaults and relevant constraints such as text length or supported aspect ratios.

Example conceptual scene parameters:

```yaml
content:
  headline: Train with intention
  screenshot: asset:training-log
design:
  theme: grapla-dark
  layout: portrait
motion:
  entrance: stagger
  intensity: 0.6
```

## 9. Timing specification

Use integer composition frames with rational FPS for editorial boundaries; use rational values or an explicitly bounded high-precision representation for intermediate time conversion. Audio samples retain their own sample-rate domain. Do not use unlabelled floating-point numbers as interchangeable frames/seconds.

- Intervals are start-inclusive and end-exclusive: [start, end).
- Composition time maps to clip-local time, then source time.
- Timeline placement does not modify scene-internal motion.
- Preview/export resolve timing through the same implementation.
- Rounding occurs only at documented boundaries; report the resolved duration.
- Native nondeterminism is declared; seed all controllable randomness.
- Side-effect callbacks must not determine visual state during random-access rendering.
- Simulation scenes use fixed steps, deterministic inputs where feasible and replay/checkpoint strategies.

For constant rate r and source offset s, source position is s + r × local time. For a speed ramp r(t), source position is s + the integral of r(t). A user-authored source-position curve is also valid; its derivative is playback speed. Do not confuse the two representations.

Markers form a dependency graph. Relative markers resolve before rendering; missing targets, cycles, negative positions where disallowed and out-of-range results generate errors. Voice-over and beat markers are added when analysis artifacts exist.

## 10. Adapter architecture

Adapters declare capabilities rather than pretending all tools share the same execution model.

```ts
type Seeking = 'direct' | 'replay' | 'cached' | 'none';

interface AdapterCapabilities {
  execution: 'browser' | 'native' | 'remote';
  seeking: Seeking;
  outputs: Array<'rgba-frame' | 'image-sequence' | 'video' | 'still'>;
  alpha: boolean;
  audio: boolean;
}

interface PreparedScene {
  metadata: ResolvedSceneMetadata;
  renderFrame?: (request: FrameRequest) => Promise<FrameArtifact>;
  renderRange?: (request: RangeRequest) => Promise<RenderArtifact>;
  dispose: () => Promise<void>;
}
```

Types above describe intent, not a frozen implementation API. Frame artifacts may be files or managed buffers with explicit dimensions, alpha and colour metadata. Native renderers can emit sequences or movies; the harness normalises these at composition boundaries.

Lifecycle: validate → resolve assets → prepare → render/capture → report → dispose. Preparation and native execution need cancellation, timeouts, logs and stable error codes. Temporary directories are job-scoped. Remote execution is a later extension.

A toolkit may provide native preview before implementing shared capture. Static SVG generation, simulation, asset playback and full video composition should be different declared roles.

## 11. Composition, masks and transitions

The initial compositor combines flat rendered layers. Each renderer may retain sophisticated internal 3D, particle or node structures. Cross-renderer depth sharing is outside the baseline contract.

Coordinate convention: propose top-left origin, x right/y down and composition pixels for 2D. Native adapters convert as needed. Establish working colour and alpha conventions through a compositor spike; record them in all frame metadata. A pragmatic first profile is SDR sRGB-oriented imagery, with explicitly managed conversions and a defined alpha policy. HDR and advanced colour management are extensions.

Transitions declare two inputs, required pre/post handles, overlap, output duration, parameters and supported formats. Default proposed policy: explicit overlap on the timeline; adding a transition does not silently move surrounding clips. An optional ripple edit can alter sequence duration as a separate operation. Missing handles require an error or an explicitly selected freeze/loop policy.

Masks define source, coordinate space, inversion, feathering, transform and timing. Blend modes list exact supported semantics and fallback limits. Nesting must have depth limits and cycle detection.

## 12. Assets, storage and reproducibility

Resolve asset IDs through manifests, not scattered network URLs. Support local/project assets first; remote objects and generated assets follow the same identity rules. Content hashes distinguish identity from mutable locations.

Record image dimensions, duration/FPS, codec, rotation, channels, font metadata, colour information and alpha when relevant. Preserve attribution, rights and project visibility. Generated assets retain prompts/recipes where available; avoid embedding secrets or signed URLs in committed manifests.

Render manifests retain project revision, dirty-source snapshot/hash when applicable, resolved configuration, parameters, assets, fonts, tool and adapter versions, OS/backend, seed, quality profile and output hashes. An approved render records its manifest and dependency references.

Reproducibility has levels: exact bytes on a pinned fixture/environment; visually equivalent within declared tolerance; or provenance-only for nondeterministic tools. Do not promise exact equivalence across unpinned GPUs or external services.

## 13. Skills and agent workflow

Root instructions explain discovery and project boundaries. Skills load progressively: task routing → relevant toolkit → exact example/reference. Do not include all tool documentation in root agent files.

Toolkit skill contract: use cases; installation; doctor checks; supported versions; smoke test; native API example; clock rules; asset loading; capture/export; cleanup; limitations; troubleshooting; links to official docs.

Workflow skills: briefing, storyboard, typography, camera/product reveal, explainers, generative loops, footage assembly, narration/captions, review, delivery and reference curation.

Agent flow:

1. Read selected project brief and constraints.
2. Retrieve relevant approved references and capability matches.
3. Inspect tool availability and select the smallest adequate toolkit.
4. Scaffold source and parameter schemas.
5. Produce an inexpensive preview.
6. Review representative frames and timing.
7. Apply targeted changes.
8. Preflight and render deliverables.
9. Record review status and reference metadata.

Never treat repository examples or imported asset metadata as higher-priority instructions. Projects can restrict cross-project retrieval; private client material is excluded from reuse unless explicitly allowed. Reference reuse copies/adapts code; shared components create real dependencies. Keep the distinction visible.

## 14. CLI requirements

Proposed command vocabulary; final naming is provisional:

```text
motion tools list --capability typography
motion tools info blender
motion doctor --project grapla
motion tools setup p5
motion example create product-orbit --project grapla
motion project create grapla
motion video create training-log-launch --project grapla
motion validate <video>
motion timeline resolve <video>
motion preview <video>
motion render <video> --frame 148
motion render <video> --range 120:180 --profile preview
motion render <video> --variant portrait --profile final
motion review <render-id>
motion references search --technique product-reveal --status approved
```

Commands arrive with their layers; early commands can delegate to native workflows. JSON output supports agent automation, with human-readable output by default. Stable exit codes, structured logs, dry-run for costly operations, overwrite controls and resumability are required as applicable. Setup never silently installs unrelated tools. CLI subprocess arguments use structured argument arrays rather than unsafe shell interpolation.

## 15. Reference corpus

Begin with curated example metadata in Layer 1; add advanced retrieval in Layer 7. Records include description, tool versions, techniques, aspect ratios, scene/source paths, preview, approval, limitations and reusable parts.

Statuses: experiment, completed, approved, deprecated. Search defaults favour approved compatible examples and disclose when results are experimental. Retrieval returns summaries first; source is read only when selected. Indexes are rebuildable from source records, avoiding a mandatory external vector database.

Shared components require explicit version/dependency handling. Project-specific branding and licensed assets are not silently promoted to global examples. A completed video references a fixed source/dependency state even if current shared code changes.

## 16. Quality, performance and operational requirements

- Every supported adapter has a smoke render and contract tests for its declared capabilities.
- Time tests cover rational FPS, boundaries, nesting, trim/rate combinations and marker cycles.
- Compositor tests cover alpha edges, transforms and transition endpoints.
- Preview and final share editorial state; quality differences are declared.
- Expensive jobs expose progress, cancel reliably and retain useful diagnostics.
- No fixed render-speed promise before representative benchmarks; report preparation time, frame throughput, memory and export time separately.
- Preflight catches known missing dependencies before full rendering.
- Cache invalidation is content-based and includes native source, assets, parameters, adapter/tool versions and profile. Environment-sensitive outputs include backend information.
- Validation errors identify entity ID, field and a repair suggestion.
- No automatic upload or publishing in baseline operation. External services are optional integrations with explicit configuration.

## 17. Milestones and implementation backlog

| Milestone | Deliverables | Exit evidence |
| --- | --- | --- |
| M0: Foundations | Registry schema, full catalogue, capability tags, root guidance | All Appendix A resources discoverable with honest status |
| M1: Useful tool suite | Doctor/setup, native examples, SVG/p5/Three/FFmpeg skills | Three tool families render fixtures on target machine |
| M2: Workspace | Project/video scaffold, assets, brand tokens, manifests | Two videos share a product; isolated project remains untouched |
| M3: Basic timeline | Time types, resolver, trims, markers, assembly | Exact boundary/seek fixtures and complete short video |
| M4: Compositing | Layers, alpha, transforms, nested compositions, crossfade | Mixed-renderer production and transparent-edge checks |
| M5: Advanced motion | Time maps, masks, ramps and plugin transitions | Reproducible ramp/mask demo |
| M6: Production | Audio, captions, responsive variants, delivery presets | Portrait/landscape outputs with aligned narration |
| M7: Review | Contact sheets, comparisons, findings and approval records | Targeted edit demonstrated with before/after evidence |
| M8: Corpus and scale | Retrieval, templates, caches and resumable batches | Adapt approved reference and resume a variant batch |

Recommended first engineering tasks: define tool and project schemas; create catalogue records; implement capability lookup and doctor; establish three minimal examples; capture validation evidence; implement project scaffold. Build the timeline only after native examples work.

## 18. End-to-end proving production

Create a 15–30 second product video containing an SVG title, p5.js procedural background, Three.js product shot, recorded footage and FFmpeg assembly. Add narration, a speed ramp and masked transition when those layers ship. Export portrait and landscape with separate layouts. Retain source, manifest, contact sheet, review findings and an approved reference record.

The same fixture evolves through layers instead of requiring the full architecture before producing a useful result.

## 19. Risks and decisions

| Risk | Response |
| --- | --- |
| Catalogue becomes a promise of universal support | Separate catalogue, operational validation and adapter status |
| Universal API erases toolkit strengths | Capability contracts plus native source/commands |
| Stateful scenes fail random seeking | Declare replay/cache semantics; fixed-step simulations |
| Repo becomes enormous | External media storage and rebuildable caches |
| Shared changes break old videos | Fixed production revisions and explicit migrations |
| Agent copies flawed examples | Approval states, compatibility tags and curation |
| Installation burden | On-demand setup and environment-specific evidence |
| Alpha/colour mismatch | Explicit metadata and compositing fixtures |
| Premature architecture | Release gates and native workflows before abstraction |
| Commercial tool/license constraints | Record requirements and validate per environment |

Decided: layered delivery; broad catalogue first; multi-project monorepo supported; optional standalone projects; shared timing contract; skills wrap toolkit knowledge; native source retained; completed-work corpus.

Provisional: TypeScript orchestration, package manager/workspace tooling, schema library, initial compositor, media-store backend and public package distribution.

Spikes required: browser capture with arbitrary frame evaluation; native Blender render lifecycle; alpha/colour round-trip; FFmpeg intermediate/export strategy; rational-time representation; deterministic simulation fixture.

## Appendix A. Resource catalogue

These are official project/documentation links or original repositories previously discussed. Capability summaries describe intended roles, not verified adapter support. Earlier research established relevance; versions, licenses, platform support and installation behaviour must be rechecked when implementing each integration. Do not infer maintenance status from inclusion.

### A1. Creative coding and 2D

| Resource | Role and planning note | Canonical starting point |
| --- | --- | --- |
| p5.js | Generative visuals; provide explicit time/seed conventions | https://p5js.org/ |
| PixiJS | GPU 2D rendering, sprites and effects | https://pixijs.com/ |
| Two.js | Flat geometry across SVG/Canvas/WebGL | https://two.js.org/ |
| Paper.js | Vector path geometry and Bézier operations | https://paperjs.org/ |
| Konva | Interactive Canvas scene graph; possible editor foundation | https://konvajs.org/ |
| Fabric.js | Editable canvas objects and SVG interchange | https://fabricjs.com/ |
| Pts | Geometry-centred creative coding | https://ptsjs.org/ |
| canvas-sketch | Generative artwork workflow | https://github.com/mattdesl/canvas-sketch |
| Ssam | Sketch loop, snapshots and export | https://github.com/cdaein/ssam |
| EaselJS | Canvas display list; evaluate compatibility before support | https://createjs.com/easeljs |
| Rough.js | Hand-drawn Canvas/SVG primitives | https://roughjs.com/ |

### A2. Animation and authored assets

| Resource | Role and planning note | Canonical starting point |
| --- | --- | --- |
| GSAP | Timelines and animation; external-clock integration | https://gsap.com/docs/v3/ |
| Anime.js | DOM/SVG/object animation; verify installed major API | https://animejs.com/documentation |
| Motion | React/JS motion and layout animation | https://motion.dev/docs |
| React Spring | Spring animation; evaluate offline sampling | https://www.react-spring.dev/ |
| tween.js | Numeric property interpolation | https://tweenjs.github.io/tween.js/ |
| mo.js | Bursts, shapes and graphic effects | https://mojs.github.io/ |
| Theatre.js | Visual sequence/curve editing linked to code | https://www.theatrejs.com/docs/latest |
| Motion Canvas | TS informative animation and narration workflows | https://motioncanvas.io/docs/ |
| Lottie Web | Lottie playback; validate generated/edited JSON | https://github.com/airbnb/lottie-web |
| Rive Web | Authored asset playback/control; runtime is not general authoring API | https://rive.app/docs/runtimes/web/web-js |

### A3. 3D, shaders and effects

| Resource | Role and planning note | Canonical starting point |
| --- | --- | --- |
| Three.js | Browser 3D scene rendering | https://threejs.org/ |
| React Three Fiber | Declarative Three.js; match React/package majors | https://r3f.docs.pmnd.rs/ |
| Drei | R3F helper components | https://github.com/pmndrs/drei |
| Babylon.js | 3D engine and authoring ecosystem | https://www.babylonjs.com/ |
| PlayCanvas Engine | Web 3D engine; use engine independently where suitable | https://playcanvas.com/products/engine |
| OGL | Minimal WebGL layer | https://github.com/oframe/ogl |
| regl | Functional WebGL abstraction | https://github.com/regl-project/regl |
| TWGL | WebGL boilerplate helpers | https://twgljs.org/ |
| Three.js Shading Language | JS shader construction; pin compatible Three version | https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language |
| postprocessing | Three.js effects pipeline | https://github.com/pmndrs/postprocessing |
| PixiJS Filters | 2D display effects | https://github.com/pixijs/filters |
| gl-react | Composable React/WebGL shaders | https://github.com/gre/gl-react |
| THREE.MeshLine | Thick stylised lines; evaluate maintained compatible implementation | https://github.com/spite/THREE.MeshLine |

### A4. Vector, typography, diagrams and stills

| Resource | Role and planning note | Canonical starting point |
| --- | --- | --- |
| SVG.js | SVG construction/manipulation | https://svgjs.dev/ |
| D3 | Data-driven geometry, layout and animation | https://d3js.org/ |
| opentype.js | Font outlines and glyph manipulation | https://opentype.js.org/ |
| Satori | HTML/CSS-like layout to SVG; not a full browser | https://github.com/vercel/satori |
| resvg | Static SVG rasterisation | https://github.com/linebender/resvg |
| SVGO | SVG optimisation; preserve IDs needed by animation | https://github.com/svg/svgo |
| Graphviz | CLI graph layout/rendering | https://www.graphviz.org/doc/info/command.html |
| Mermaid CLI | Text-defined diagrams to assets | https://github.com/mermaid-js/mermaid-cli |
| Potrace | Bitmap tracing to vectors | https://potrace.sourceforge.net/ |
| msdfgen | Signed distance-field generation | https://github.com/Chlumsky/msdfgen |

### A5. Video and capture

| Resource | Role and planning note | Canonical starting point |
| --- | --- | --- |
| Remotion | React video composition/export; check applicable license | https://www.remotion.dev/docs |
| Diffusion Studio Core | Browser compositing engine | https://github.com/diffusionstudio/core |
| Editly | Declarative Node/CLI editing | https://github.com/mifi/editly |
| Mediabunny | TS media I/O and conversion | https://mediabunny.dev/guide/introduction |
| Mediabunny server extension | Optional server codecs/backend; evaluate separately | https://mediabunny.dev/guide/extensions/server |
| ffmpeg.wasm | Browser FFmpeg; assess overhead and browser prerequisites | https://ffmpegwasm.netlify.app/docs/overview/ |
| canvas-record | Canvas recording and sequence export | https://github.com/dmnsgn/canvas-record |
| CCapture.js | Fixed-framerate canvas capture; assess compatibility | https://github.com/spite/ccapture.js/ |
| FFmpeg / ffprobe | Native encoding, assembly, filters and media inspection | https://ffmpeg.org/documentation.html |
| FFmpeg filters | Detailed compositing/audio/filter reference | https://ffmpeg.org/ffmpeg-filters.html |
| MLT / melt | Multitrack CLI processing | https://mltframework.org/docs/melt/ |
| PySceneDetect | Shot detection and splitting | https://www.scenedetect.com/ |
| gifski | GIF delivery encoder | https://github.com/ImageOptim/gifski |

### A6. Image processing and colour

| Resource | Role and planning note | Canonical starting point |
| --- | --- | --- |
| Sharp | Node image processing and compositing | https://sharp.pixelplumbing.com/ |
| Jimp | JS image manipulation | https://github.com/jimp-dev/jimp |
| ImageMagick | CLI image operations, montage and comparison | https://imagemagick.org/script/command-line-tools.php/ |
| G'MIC | CLI filters and procedural image processing | https://gmic.eu/ |
| OpenImageIO / oiiotool | Production image/sequence processing | https://openimageio.readthedocs.io/en/latest/oiiotool.html |
| GIMP batch | Scripted image operations; version-specific procedures | https://www.gimp.org/man/gimp.html |
| RawTherapee CLI | Camera RAW preparation | https://rawtherapee.com/ |
| OpenColorIO | Colour-management integration | https://github.com/AcademySoftwareFoundation/OpenColorIO |

### A7. Native applications and procedural tools

| Resource | Automation route and planning note | Canonical starting point |
| --- | --- | --- |
| Blender | Background CLI + Python; 3D, animation and compositing | https://docs.blender.org/manual/en/latest/advanced/command_line/render.html |
| Blender CLI arguments | Execution and scripting options | https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html |
| Manim Community | Python scenes + CLI; educational animation | https://docs.manim.community/en/stable/ |
| Inkscape | CLI actions/export; vector source workflows | https://wiki.inkscape.org/wiki/Using_the_Command_Line |
| Synfig | Native animation project + CLI render | https://wiki.synfig.org/Render_options |
| Natron | Background renderer + Python; verify current build/API | https://natron.readthedocs.io/en/v2.3.15/devel/natronexecution.html |
| POV-Ray | Text scene/INI + CLI; procedural ray tracing | https://www.povray.org/documentation/ |
| Houdini | hython/hbatch; commercial procedural/simulation workflows | https://www.sidefx.com/docs/houdini/render/batch.html |
| After Effects | Application scripting + aerender; render existing projects/templates | https://helpx.adobe.com/after-effects/desktop/render-and-export/automate-rendering/automated-rendering-network-rendering.html |
| Godot | Scene scripts + movie CLI; visual rendering needs suitable backend | https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html |
| Aseprite | Batch CLI + scripts; pixel animation and sheets | https://www.aseprite.org/docs/cli/ |
| vsketch | Python + vsk CLI; plotter-oriented generative vectors | https://vsketch.readthedocs.io/ |
| vpype | CLI vector pipelines | https://vpype.readthedocs.io/ |

### A8. Physics, audio and 3D assets

| Resource | Role and planning note | Canonical starting point |
| --- | --- | --- |
| Matter.js | 2D physics; fixed-step replay/cache | https://brm.io/matter-js/ |
| Rapier | Web-capable 2D/3D physics | https://rapier.rs/ |
| Tone.js | Audio synthesis, scheduling and effects | https://tonejs.github.io/ |
| glTF Transform | JS/CLI model preparation and optimisation | https://gltf-transform.dev/cli |

### A9. Adjacent resources mentioned during discovery

These are discovery candidates or context tools, not baseline commitments. Some were surfaced during research rather than recommended as core integrations. Keep them in a candidate list until their exact automation route, maintenance and incremental value are assessed.

| Resource | Potential role | Starting point |
| --- | --- | --- |
| WebAV | Browser media toolkit candidate | https://github.com/bilibili/WebAV |
| glslCanvas | Lightweight fragment-shader canvas host | https://github.com/patriciogonzalezvivo/glslCanvas |
| glslify | GLSL module tooling | https://github.com/glslify/glslify |
| CanvasKit / Skia | WASM graphics rendering candidate | https://skia.org/docs/user/modules/canvaskit/ |
| libvips | Native image pipeline underlying Sharp | https://www.libvips.org/ |
| GraphicsMagick | Alternative native image CLI | http://www.graphicsmagick.org/ |
| GStreamer | Media pipeline CLI/framework candidate | https://gstreamer.freedesktop.org/ |
| OpenCV.js | Computer-vision/image-analysis candidate | https://docs.opencv.org/ |
| image-js | JS image-processing candidate | https://github.com/image-js/image-js |
| Photon | WASM image-processing candidate | https://github.com/silvia-odwyer/photon |
| glfx.js | WebGL image-effects candidate | https://github.com/evanw/glfx.js |
| dotLottie | Lottie packaging/runtime ecosystem | https://developers.lottiefiles.com/ |
| Popmotion | Animation primitive candidate; assess overlap | https://popmotion.io/ |
| CreateJS / TweenJS | EaselJS-adjacent tweening ecosystem | https://createjs.com/tweenjs |
| Phaser | Game-oriented animation/simulation scenes | https://phaser.io/ |
| luma.gl | GPU rendering building blocks | https://luma.gl/ |
| deck.gl | Geospatial/data visualisation scenes | https://deck.gl/ |
| vtk.js | Scientific visualisation scenes | https://kitware.github.io/vtk-js/ |
| glMatrix | Vector/matrix supporting utilities | https://glmatrix.net/ |
| Troika Three Text | Three.js text rendering candidate | https://github.com/protectwise/troika/tree/main/packages/troika-three-text |
| react-three/postprocessing | React wrapper for effects | https://github.com/pmndrs/react-postprocessing |
| react-three/rapier | R3F physics integration | https://github.com/pmndrs/react-three-rapier |
| gltfjsx | Model-to-JSX supporting workflow | https://github.com/pmndrs/gltfjsx |
| Leva | Parameter inspection/control panels | https://github.com/pmndrs/leva |
| maath | Graphics math helpers | https://github.com/pmndrs/maath |
| react-three/gpu-pathtracer | Path-traced output candidate | https://github.com/pmndrs/react-three-gpu-pathtracer |
| SVGator | Visual authoring reference; no CLI commitment | https://www.svgator.com/ |
| Shotstack | Remote rendering service candidate; optional API route | https://shotstack.io/ |
| VPython | Python educational 3D; assess export route | https://vpython.org/ |
| Hyperframes | Existing workflow/inspiration; assess interoperability separately | https://hyperframes.heygen.com/catalog |
| Dear ImGui | Native UI infrastructure; outside primary scope | https://github.com/ocornut/imgui |

Discovery indexes for future catalogue expansion: https://github.com/raphamorim/awesome-canvas and https://github.com/terkelg/awesome-creative-coding. These are leads, not authorities for current tool capabilities. Revalidate claims against the original project.

Native browser primitives also belong in capability guidance: Canvas 2D, SVG, Web Animations API, WebGL, WebGPU, WebCodecs, Web Audio and MediaRecorder. They are platform APIs rather than installable libraries; use official platform documentation and target-browser checks when integrating.

## Appendix B. First-release completion checklist

- [ ] Catalogue schemas and capability vocabulary are versioned.
- [ ] All Appendix A entries exist with role and honest validation status.
- [ ] Root instructions use progressive disclosure.
- [ ] Selected toolkit skills contain install, doctor, smoke test and recovery guidance.
- [ ] SVG/GSAP, p5.js and Three.js produce known outputs.
- [ ] FFmpeg assembles an example sequence and inspects the result.
- [ ] Blender automation spike records environment and limitations.
- [ ] In-repo and standalone project scaffolds use the same project schema.
- [ ] Brand, content and motion parameters are distinct.
- [ ] Assets and generated outputs follow an explicit storage policy.
- [ ] Render recipe and dependency versions are retained.
- [ ] Basic preview and review notes work before advanced timeline features.
- [ ] Reference metadata differentiates experiments from approved examples.
- [ ] Deferred features are not implied by catalogue inclusion.

