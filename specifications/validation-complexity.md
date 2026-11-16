# Validation complexity tiers

Status: historical batching plan, not live coverage or a release gate. Use `pnpm vcr tools status` for current progress. Updated 2026-11-16.

This groups the current validation queue by the expected effort to make and review one useful fixture. Complexity is an estimate from the catalogue route and documented dependencies; it is not a measure of tool quality, priority, installation, or readiness. Check actual machine availability with `vcr doctor` before planning a run.

## Baseline before batching

- **69 catalogued/core tools** had `not-validated` status and are grouped below.
- **3 partial records** have existing, narrowly scoped evidence; see the follow-up list.
- **105 candidates** are excluded from the validation queue. Review their assessment recommendations first. Of these, 2 are recommended for promotion, 97 to keep at candidate tier, and 6 for demotion. A recommendation does not change a record's tier.

The baseline catalogue had 212 records: 101 catalogued, 6 core and 105 candidate. Thirty-five are validated, three partial and 174 not validated; the 174 includes all 105 candidates.

## How to read the tiers

| Tier | Expected effort | Typical fixture |
| --- | --- | --- |
| **1 — direct** | Low | One local tool, a small owned input, an isolated transformation, and machine-checkable output such as dimensions, metadata, schema or hashes. |
| **2 — rendered or stateful** | Moderate | A library, browser or media pipeline needs a small authored scene/input, dependency coordination, output inspection, or tolerance-based comparison. |
| **3 — environment-heavy** | High or uncertain | A licensed desktop app, external service, GPU/model stack, native plugin host or platform-specific runtime needs preflight and a bounded claim. Split multi-stage workflows into separate fixtures. |

These tiers estimate the effort of the **first bounded fixture**, not the effort to validate every format, platform, backend or use case. A successful fixture proves only its recorded version, host and scope.

## Tier 1 — direct (16)

Start with these where a single operation and a precise output check are available:

`frames-cli`, `g-mic`, `gifski`, `gltf-transform`, `graphviz`, `jimp`, `mediainfo`, `meshoptimizer`, `msdfgen`, `mido`, `opentimelineio`, `opentype-js`, `potrace`, `svgo`, `vpype`, `vsketch`.

Keep each claim narrow: for example, a single metadata read, vector conversion, mesh transform, font parse or MIDI round-trip. Do not treat a successful conversion as proof of visual quality or format-wide fidelity.

## Tier 2 — rendered or stateful (37)

These need a controlled scene, media sample, browser capture, or a measured output with visual/listening inspection:

`canvas-record`, `canvas-sketch`, `canvaskit-skia`, `ccapture-js`, `deck-gl`, `dotlottie`, `ffmpeg-wasm`, `gimp-batch`, `gl-react`, `hyperframes`, `lottie-web`, `manim-community`, `mediabunny`, `mediabunny-server-extension`, `mermaid-cli`, `meyda`, `motion-canvas`, `music21`, `opencolorio`, `opencv-js`, `openimageio-oiiotool`, `pixijs-filters`, `pov-ray`, `pyscenedetect`, `rapier`, `rive-web`, `satori`, `ssam`, `theatre-js`, `three-js-shading-language`, `tone-js`, `troika-three-text`, `vedo`, `vtk-js`, `web-audio`, `webgl`.

Split capture, rendering and encoding into separate claims where possible. For browser/GPU outputs, include frame-order checks or an explicit tolerance and inspect the rendered artifact at its intended scale. For audio, inspect both stream metadata and the sound; a successful process exit is not enough.

## Tier 3 — environment-heavy (16)

Plan these separately after checking licenses, host requirements, hardware, model/assets and any network or account needs:

`c2patool`, `colmap`, `godot`, `inkscape`, `lv2`, `mediapipe`, `mlt-melt`, `nerfstudio`, `rawtherapee-cli`, `synfig`, `webcodecs`, `webgpu`.

For GPU/model tools, pin the model and record runtime, backend and device. For desktop tools, prove the documented headless or batch route before relying on GUI automation. A blocked environment check leaves the tool unvalidated; do not substitute a neighbour.

## Existing partial evidence to extend deliberately

- `build123d`: the existing fixture covers one filleted solid exported to STEP, SVG and GLB, with a Blender handoff. It does not establish broader CAD interoperability.
- `react-spring`: the fixture proves harness-driven frame capture, but the recorded scene did not start or seek a spring; spring-physics timing remains unproven.
- `svg`: the fixture covers static SVG rasterisation with resvg only; browser animation and other SVG behavior remain outside scope.

Each record stays `partial` until a specific remaining claim is planned and evidenced. Do not broaden these fixtures just to make status read `validated`.

## Parallel candidates

The first parallel wave can be four independent Tier 1 fixtures:

| Lane | Tool | Bounded claim | Why it can run independently |
| --- | --- | --- | --- |
| A | `graphviz` | Render a small owned DOT graph to SVG; check graph structure and repeat output for the pinned version. | Native CLI and vector output; no shared scene or runtime with the other lanes. |
| B | `svgo` | Optimise an authored SVG; assert valid output and preservation of a stable ID and `viewBox`. | Node CLI, separate input and output files; no dependency on the other tools' output. |
| C | `gifski` | Encode a tiny owned PNG sequence; check dimensions, frame count and duration. | Native encoder and its own image-sequence fixture. |
| D | `gltf-transform` | Apply one declared transform to a tiny owned GLB; check the expected structural properties after reopening it. | Node CLI and a separate 3D asset fixture. |

All four lanes completed independent fixtures in worktrees on 2026-11-15: SVGO 4.0.1, Graphviz 16.1.1, Gifski 1.34.0 and glTF Transform 4.5.1. The user authorized installing missing tools; Homebrew's Gifski installation upgraded FFmpeg to 9.0.2, now reflected in the machine environment record. Each fixture records its own bounded claim and evidence. The worktrees are integrated on one branch and the catalogue/plugin are rebuilt together. These results validate only the recorded versions, host and scopes.

Other Tier 1 tools can follow in similar disjoint lanes. Keep the partially validated browser and CAD records out of this first wave: their remaining claims need more coordination around capture or consumer checks.

## Second parallel wave

On 2026-11-15, three more Tier 1 fixtures completed in separate worktrees: MediaInfo 26.10 for a generated WAV metadata read, Jimp 1.6.1 for an RGBA invert with exact pixel and repeatability checks, and Mido 1.3.2 for a MIDI 1.0 file round-trip. OpenType.js was deferred because no redistributable font fixture was available and network access to install FontTools failed; its catalogue record remains unchanged. These fixtures are integrated together and do not broaden claims beyond their recorded operations.

## Third parallel wave

On 2026-11-15, Potrace 1.16 traced an owned PBM bitmap to repeatable SVG with checked path/contour structure and visual inspection; Meshoptimizer 1.3.0 simplified a generated grid from 32 to 15 triangles with structural and repeatability checks; vpype 1.15.0 scaled an owned SVG path with exact coordinate and repeat-output checks. All three fixtures passed in separate worktrees and are integrated together; their evidence remains limited to those operations.

## Fourth parallel wave

On 2026-11-16, G'MIC 4.0.7 negated an owned 2×2 grayscale PGM to exact sample values and repeatable bytes, and vsketch 1.2.0 exported a fixed-seed two-line SVG with exact geometry checks. Both fixtures passed in separate worktrees and are integrated together; these claims do not cover other filters, sketches, or output formats.

## Fifth parallel wave

On 2026-11-16, msdfgen 1.13.1 generated a nonconstant 64×64 MSDF and 256×256 test render from an owned SVG path, with repeatable output checks and visual inspection. Scope excludes font loading and atlas generation.

## Candidate gate and fixture contract

Candidate records need a review decision before they enter this queue. In particular, the two promotion recommendations should be reviewed as catalogue decisions first; only then choose a validation claim and effort tier. The other candidates can remain discoverable without implying operational support.

For every fixture, use the [evidence template](../catalog/FIXTURE-EVIDENCE-TEMPLATE.md): declare the exact tool/version and claim, owned or appropriately licensed input, install plan, expected artifacts, checks and stop conditions before running. Record exact version, hostname, command, result and scope. Keep installation, evidence and adapter support as separate facts. Toolkit guides follow evidence; they do not replace it.

## Sixth wave

OpenType.js 2.0.0 now parses an original FontTools-generated TrueType glyph with exact metadata and outline checks, resolving the earlier font-asset blocker. OpenTimelineIO 0.18.1 preserves a one-clip native JSON timeline and media reference across repeat serializations. Both fixtures are integrated on top of the merged discovery PR #204; their recorded claims exclude shaping, editorial adapters and rendering.

## Seventh wave

COLMAP 4.2.1_5 was installed from its prebuilt Homebrew bottle after checking the current formula plan (18 dependencies and 8 formula upgrades). CPU SIFT feature extraction stored 853 features for each of three generated views on repeat runs. The fixture validates extraction and database records only; it does not claim image matching or 3D reconstruction.

## Eighth wave

MLT 7.42.0_1 was installed from its prebuilt Homebrew bottle; after COLMAP's install, the remaining plan was 26 formulae and 4 upgrades. The built-in color producer rendered five 64×48 FFV1 frames, and decoded pixels matched across repeated renders. This is a producer/consumer smoke fixture, not validation of multitrack projects or filters.

## Ninth wave

Synfig 1.5.5_4 was installed from its prebuilt Homebrew bottle after MLT reduced the plan to six dependencies and two upgrades. The CLI rendered an authored static SIF rectangle to a 160×120 PNG with exact center and transparent-corner samples and repeated file hashes. The fixture does not validate animation or video output.

## Tenth wave

Inkscape 1.4.4's previously stalled version check now exits cleanly. Its CLI exported an authored SVG page twice to identical 128×96 PNGs with checked color and transparency samples. This covers basic page export only, not object actions or conversion workflows.

## Unattended validation notes — 2026-11-16


- **GIMP batch:** validated GIMP 3.2.8 Python batch on macOS arm64. The fixture imports an owned PPM, exports PNG through `file-png-export`, and checks exact samples. GIMP startup attempted to write its normal user configuration directory, which the sandbox denied; the image operation still completed. Scope is limited to this import/export path.
- **Nerfstudio:** this host is macOS arm64 with no `nvidia-smi`; the official installation guide documents Linux/Windows setup and a CUDA/Tiny-CUDA-NN training stack, with no macOS route documented. No training stack, model or dataset was installed; the tool remains unvalidated on this machine.
- **Free-software scope:** After Effects, Aseprite, GSAP, Houdini, Kinetograph, Remotion and Shotstack were retired under ADR 0009. Their validation status no longer counts toward current coverage.
