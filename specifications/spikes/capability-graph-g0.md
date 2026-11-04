# Spike: capability graph G0 (CG0)

Date: 2026-11-04 · Status: **draft, pending owner review — not a recorded decision** · Issue: [#66](https://github.com/conorluddy/vcr/issues/66) (epic [#65](https://github.com/conorluddy/vcr/issues/65)) · PRD: [vcr-capability-graph-prd.md](../vcr-capability-graph-prd.md) v0.3 §12 G0 · Landscape: [capability-graph-landscape-2026-11-02.md](../research/capability-graph-landscape-2026-11-02.md)

Tags: **observed now** means measured on 2026-11-04. **retained-observed <date>** means measured when a fixture ran and copied here without a rerun. **fixture-reported** means a number that appears only in fixture prose (README, spike report, evidence.md), with no retained output behind it. **estimated** means a judgement. Versions are **declared** unless a retained file records them.

## Question

Does a typed model (operation → port → media domain → format → semantic profile, with evidence per claim) answer real handoff questions better than today's catalogue, and is it worth what it costs in authoring, maintenance and context? Which of three approaches should CG1 build?

- **A.** The current workflow: INDEX, then `vcr tools info`, then `--full`, then `tools examples`, then the fixture files.
- **B.** An optional `io` block (ports, rejects, prerequisites) and `recipes[]` on the existing tool records.
- **C.** Separate typed operation, format and route records under a proposed `catalog/graph/`.

## Time box and method

The box was 16 h of desk research (estimated), with a hard stop. Nothing was installed, rendered, rerun or published, and no validation claim is new. The baseline was frozen first: eight requests and fifteen operations. A was walked for real, and its bytes were measured with `wc -c` on stdout (observed now). B and C were **simulated against records that were never written**, so their grades are *projected*, not comparable on equal terms with A's observed walk. An evidence audit, a prior-art review, a simplicity challenge and an evidence-skeptic review followed, and every valid correction from them is applied below.

Measured now: `catalog/INDEX.md` 16,142 B against a 16,384 B budget (`packages/cli/src/validate.ts:34`), leaving 242 B of headroom. 146 tool records. 18 records tag `3d-rendering`. `plugin/` 1,254,364 B. `catalog/tools.json` 385,611 B. `catalog/tools/*.json` 350,820 B.

## Fixed request set

| ID | Kind | Handoff |
| --- | --- | --- |
| R1 | positive | build123d → GLB → Blender → RGBA PNG still (units) |
| R2 | positive | GSAP/SVG scene → Playwright RGBA PNGs → ProRes 4444 |
| R3 | positive | static SVG → resvg PNG → H.264 hold |
| R4 | join | ImageMagick PNG frames + FFmpeg tone → MP4 mux |
| R5 | gap/unknown | WAV → onsets + GSAP → Playwright → mux with the same WAV |
| R6 | incompatibility | RGBA sequence → libx264 yuv420p, alpha required |
| R7 | incompatibility | SMIL/CSS-animated SVG → resvg frame sequence |
| R8 | discovery | 3D → image, narrowed to GLB → PNG sequence with alpha and animation |

The fifteen operations are O1–O15 in the #66 baseline. The audit downgraded some tags. **O8** (Playwright capture) and **O13** (ProRes 4444) are fixture-reported only: `examples/browser-capture/` keeps no `expected/` directory. **O4**'s 800x600 size and 0–255 alpha appear only in evidence.md prose. **O9**'s alpha is configured but not measured, and the three.js version that ran is unknown. **O10** is evidenced only indirectly, through the O12 probe. For **O11**, yuv420p is retained but "no alpha" is documentation (`skills/ffmpeg/SKILL.md:74`) plus inference.

## Baseline comparison

Grades include the skeptic's corrections. FC = false compatibility or evidence-class overclaims.

| Req | A (observed walk) | B (projected) | C (projected) |
| --- | --- | --- | --- |
| R1 | yes; FC 2 (example says "validated" but record says partial; blender card reads as tool-wide validated) | yes; FC 0 | yes; FC 1 (it invents "straight" alpha and an animation "absent" guarantee) |
| R2 | partial; FC 2 (stale beginFrame, 12le vs 10le) | partial: the route is spike-reported, not tested | partial: it says "compatible-verified", which overclaims |
| R3 | yes; FC 0 | yes; FC 0 | yes; FC 0 (the version is declared, not observed) |
| R4 | yes; FC 0 | yes; bindings 5–7 are script-declared | yes; bindings 5–7 are script-declared |
| R5 | yes; an invented onset format is a *predicted* risk, not observed | yes | yes |
| R6 | partial: calls ProRes "fixture-backed" | partial: same | partial: same |
| R7 | yes | yes | yes |
| R8 | partial; FC 2 (Houdini unlabelled; card-level "validated") | partial: low recall | partial: states Houdini's policy as fact |

**Unknowns.** All three approaches keep every expected unknown. Under A, the GPU prerequisite, `adapter_maturity` and `installation_status` reach the agent only through `--json` or tier-3 prose. The cue/mux runtime (#60) is surfaced by no approach. Whether alpha survives the ProRes encode is unknown in all three, and all three originally presented it as known.

**Context bytes per request.** A is observed now and includes the 16,142 B INDEX read. B is estimated and also includes INDEX. C is estimated *after entry*: its entry path is unspecified, so C is not comparable with A until that cost is added.

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 36,402 (min 26,356) | 37,472 | 25,828 | 29,280 | 32,223 | 27,587 | 20,633 | 42,144 |
| B | ~21 K (~29 K with numbers) | ~22 K | ~21 K | ~21 K | ~23 K | ~18.5 K | ~19.5 K | ~24 K (~8 K via filter) |
| C | ~6–8 K | ~5–7 K | ~4–5 K | ~4–6 K | ~5–7 K | ~3–4 K | ~2–3 K | ~4–6 K, +3 K per step |

**Reading.** After correction, all three reach the same verdicts: five yes and three partial. Every partial comes from **evidence curation**, not missing structure. The beginFrame text is stale, the pix_fmt claims conflict, ProRes was never retained, and Houdini carries no policy label. Typing in B and C *encoded* the audit's mistakes with more apparent authority instead of catching them.

## Authoring, maintenance, INDEX and plugin size

| | A + text fixes | B (7 records + three-js) | C (G0 slice) |
| --- | --- | --- | --- |
| Authoring | ~1–2 h | ~9–12 h | ~13–17 h + new `vcr graph` CLI |
| Full catalogue | n/a | +25–50 h | several weeks |
| INDEX.md | +0 B | +0 B; per-line io tags (~2–4 KB) would break the budget | +0 B, or a pointer within 242 B |
| Plugin growth | ~0 | ~15–22 KB (records ship twice: `tools/` and `tools.json`); ~200–300 KB at full scale | ~40–55 KB; ~0.5–0.8 MB at full scale |
| Drift surfaces | 4 prose locations; 2 live contradictions found | record + port notes | tool record + operation + route + fixture; needs a canonical-source rule |

All figures are estimated except the INDEX headroom, which is observed now. The INDEX read dominates per-request cost in A and B, and none of the approaches reduces it except by bypassing it with filters.

## Domain → format → semantic profile for the sampled handoffs

These are proposed IDs, the minimum these eight requests need. They are not vocabulary additions. Media-type aliases come from general knowledge (documentation, unverified here).

**Capability IDs are reused, not extended.** Each operation keeps the existing `catalog/capabilities/vocabulary.json` IDs its tool already carries (observed now): build123d `3d-asset-processing`; blender `3d-rendering`, `model-loading`; ffmpeg-ffprobe `video-encoding`, `audio`, `image-sequence-processing`, `media-inspection`; resvg `svg-rasterisation`; playwright `capture`; svg `vector-authoring`, `svg-animation`; imagemagick `image-processing`, `image-sequence-processing`. Domains and formats are a separate axis on ports; no new capability ID is needed for R1–R8.

| Domain | Formats (aliases) | Profile properties these handoffs need |
| --- | --- | --- |
| `3d` | `step`, `glb` (`model/gltf-binary`) | `units`, `axes`, `winding`, `materials`, `animation`, `watertight` |
| `image` | `svg` (`image/svg+xml`), `png` (`image/png`), `png-sequence` (collection plus manifest), `html-scene` | `alpha` (present / none / unknown), `premultiplied`, `dimensions`, `clock` (none / seekable / own), `motion` (static / excluded) |
| `video` | `mp4` (`video/mp4`), `mov` (`video/quicktime`), `webm` (`video/webm`) | `codec`, `pix_fmt` (requested vs observed), `alpha`, `frame_rate`, `duration` |
| `audio` | `wav` (`audio/wav`), `lavfi-sine` (generated source) | `sample_rate`, `channels`, `duration` |
| *(none chosen)* | onset events: port `kind: event`, **no format** | undeclared; must not be invented |

**Units on the CAD path (R1).** The source part is in mm. `export_gltf(unit=Unit.MM)` writes metres (`generate.py:29`). Blender import preserved the size within 0.0001 m: 0.05999999866 x 0.04000000283 x 0.01200000755 m (retained-observed 2026-10-31). Materials, animation and watertightness stay `unknown`. Animation is unknown, not "absent", because the GLB was never inspected for it.

**Conditional alternatives** form one logical port with conditions. They are not extra inputs.
- **FFmpeg encode output.** The first alternative is h264/yuv420p, where yuv420p is retained (native-svg) and alpha-none is documentation. The second is prores_ks 4444 with alpha present, which is fixture-reported: 10le was requested and 12le claimed, and the observed value is unknown. The third is vp9/yuva420p with alpha, which is documentation-only (`SKILL.md:35`).
- **Blender output.** A single still is retained (O4). A frame range is documentation-only (O5).
- **FFmpeg audio input.** `lavfi-sine` is retained (O12). `wav` is documentation-only, and resampling is unknown.

## Deliberate incompatibilities

- **R6, `ALPHA_REQUIRED_NOT_GUARANTEED`.** The input requires alpha present, and h264/yuv420p guarantees none. The source is documentation (`SKILL.md:74`) plus a yuv420p probe that never checked alpha (retained-observed 2026-10-26). There are two alternatives, and neither is substituted silently. ProRes 4444 is fixture-reported, outputs are not retained, and pix_fmt is unresolved. VP9 yuva420p WebM is documentation-only.
- **R7, `INPUT_FEATURE_EXCLUDED`.** resvg ignores SMIL, CSS animation and script, so every frame would be identical. The sources are documentation: `resvg.json` avoid_when, and `svg.json` on SMIL not being seekable. The suggested move is to GSAP plus Playwright (R2). This is an explicit exclusion, not an unknown.

## The native FFmpeg join (R4): every required input

Probe values below are retained-observed 2026-10-26 (`examples/ffmpeg-assembly/`); script-declared values come from the fixture script, not a probe.

| # | Binding | Value | Evidence |
| --- | --- | --- | --- |
| 1 | video | contiguous `frame-%04d.png` from 0000, 320x180 | probed: 48 frames (retained-observed 2026-10-26); frames indirect (O10) |
| 2 | frame rate | 24 (a parameter; the sequence has no clock) | probed: 24/1 |
| 3 | audio | 440 Hz sine, 48,000 Hz, 2 s | probed: aac 48000 Hz, 1 ch, 95 frames |
| 4 | duration policy | `-shortest` | probed: 2.000000 s |
| 5 | video encode | libx264 yuv420p | h264 probed; pix_fmt script-declared (not probed) |
| 6 | audio encode | aac 96k | codec probed; bitrate script-declared |
| 7 | container | MP4 `+faststart` | script-declared |
| 8 | output path | parameter | script |

If any binding is missing, the result is `INCOMPLETE_JOIN` and no route is shown. Three things remain unknown: a user WAV at another rate or channel count, the outcome without `-shortest`, and A/V offset or priming.

## Incomplete records, with no invented guarantees

- **R5.** aubio and librosa have no evidence, `installation_status` unknown and `adapter_maturity` none. Their licences are GPL-3.0-or-later and ISC, with dependency terms unassessed. No onset-event format or event-to-timeline contract exists, and cue/mux (#60) is not implemented. The result is `unknown` / `INCOMPLETE_METADATA` with a suggested assessment, never `NO_PATH`.
- **R8.** 17 of the 18 `3d-rendering` records are domain-only (observed now): they are relevant but not compatible. three-js GLB ingest is documentation-only, because three-capture uses no GLTFLoader. GLB animation preservation is unknown for every candidate. Houdini is *probably* reference-only, derived from its free-text licence. No policy assessment exists, and PRD §5 warns that commercial availability alone is not the test.

## Three routes, with claim scope

| Route | Step | Evidence class |
| --- | --- | --- |
| R1 CAD → still | build123d `export_gltf(unit=Unit.MM)` | retained fixture, build123d 0.13.0 exact (2026-10-31) |
| | Blender `import_scene.gltf` | retained fixture, Blender 4.4.0 exact; prerequisite GPU access outside the sandbox (observed once, 2026-10-31) |
| | Workbench 800x600 RGBA PNG | fixture-reported (evidence.md prose); PNG hash retained, not a golden |
| R2 GSAP → ProRes | Playwright seek + screenshot RGBA PNGs | fixture-reported 2026-10-26; record text cites beginFrame (stale) |
| | prores_ks 4444, `-framerate 30`, size = capture size | fixture-reported; pix_fmt contradictory; alpha after encode not retained |
| R3 SVG → MP4 | resvg `--width 1080` | retained PNG hash; resvg 0.47.0 declared; 0.49.0 not revalidated |
| | `-loop 1 -framerate 30 -t 3` libx264 yuv420p | retained probe: 1080x1920, 30/1, 90 frames, 3.000000 s (2026-10-26) |

R1 is scoped to one part on macOS 26.6 arm64 with Workbench. It makes no general adapter claim, and build123d validation remains partial. R2 should be reported as "spike-reported route with alpha", not "tested".

## Curated recipes versus search

No search was implemented or run. This comparison is estimated by reasoning over eight requests.
- Curated recipes with explicit bindings answer R1–R4, R6 and R7 deterministically.
- Search adds value only for R8 (finding three-js + Playwright as a GLB alternative, which is still documentation-only) and for R5's frontier report.
- No request yields a verified route that only search finds.
- The landscape's "deliberately exhausted search budget" scenario is **not demonstrated** and is carried as unknown.

## Tool-record extension versus separate operation records

| | Extend tool records (B, with ports grouped as `operations[]`) | Separate `catalog/graph/` (C) |
| --- | --- | --- |
| Canonical store | one (record) | two (record prose and operation) |
| Schema | `tool-record.schema.json` (`additionalProperties: false`) must declare new properties | new schemas |
| Cross-tool routes | ownership on the terminal tool hides the route from upstream cards | natural home |
| Plugin cost | paid twice (`tools/` + `tools.json`) | separate, loadable per domain slice |
| Verdict gain on R1–R8 | same as C | same as B |

The one structural gain of C that survives is **input/output pairing per operation**. Flat B ports on Blender would sit "GLB in" next to "PNG/EXR sequence out", implying an untested GLB→sequence capability. Grouping ports under `operations[]` on the tool record recovers that pairing without a new store.

## Prior art: CWL and GStreamer

URLs marked † in the prior-art notes were not re-fetched, so their behaviour claims are documentation from memory.
- **Borrow from CWL.** Port naming close to CWL (`inputs`, `outputs`, `format`, `doc`) keeps a later export cheap. The `Operation` without a runner mirrors a discovery record. `requirements` versus `hints` maps to prerequisites versus conditional. `secondaryFiles` fits a sequence plus its manifest.
- **Avoid from CWL.** EDAM as the format authority, expressions, and the runner. CWL format checks match labels only, so they cannot reject R6 or R7.
- **Borrow from GStreamer.** Profile values as fixed, range or list. Separate advertised, parameter-applied and observed profiles (R2: 10le requested, 12le claimed, observed unknown). An empty intersection names the clashing field. Pad presence fits conditional ports and joins.
- **Avoid from GStreamer.** Runtime negotiation, and **absent field = ANY**: VCR must invert that, so an absent field means unknown.
- **Correction.** The prior-art note's "16-format G0 scope" has no source. The format count is not fixed.

## What simpler approaches cannot provide

1. Per-operation input/output pairing. A B pilot with `operations[]` can deliver it.
2. Mechanical `INCOMPLETE_JOIN` rejection for an **uncurated** join. This is real in principle, but the baseline exercises no uncurated join.
3. Requested-versus-observed profile values. This is weak: a B port can carry both.

Nothing else survives. The R1 units, R5, R6, R7 and R8 answers, the readiness and policy split, version ranges, and the context-byte claim can all be delivered by A's text fixes or B's fields.

## Draft recommendation — pending owner review, not a recorded decision

**Go on the model's contracts, and no-go on a separate graph store and search for now.**

1. **Evidence fixes first (~1–2 h, estimated).** These are the only changes that fix wrong answers today:
   - Correct the beginFrame text in `playwright.json` and `browser-capture/example.json`.
   - Resolve or mark the 10le/12le pix_fmt claim.
   - Narrow O4, O8, O9, O10, O11 and O13 as the audit says.
   - Fix the "validated" label on build123d-product.
   - Show `adapter_maturity` and `installation_status` on text cards.
   - Add a "no onset event format declared" note to aubio and librosa.
2. **CG1–CG3 as a tool-record extension (~9–12 h, estimated).** Add `operations[]` with ports (domain, format, profile) on the 7 in-scope records plus three-js.
   - Evidence is set **per property** (retained-fixture, fixture-reported, documentation-only or unknown), with date, scope, and declared versus observed version.
   - A missing block means incomplete, never incompatible.
   - Validator rule: a `retained-fixture` claim must cite an example with retained outputs. This rule would have caught O8 and O13.
   - INDEX.md is untouched.
3. **Curated routes (#77) as a small separate set of route records.** They are cross-tool, and each carries bindings and unknowns. The one join route is R4.
4. **Defer CG5–CG7** (#80–#85). Revisit only if one of these happens:
   - real requests need uncurated joins or forks;
   - curated cross-tool routes exceed ~15–20 (estimated);
   - a discovery request yields a verified route that only search finds.

This reverses PRD §5/§13's proposal of a separate graph folder for operations. That needs an owner decision.

## Remaining uncertainties and ADR ownership

The following remain uncertain:
- whether uncurated joins occur in practice;
- whether `operations[]` stays manageable past ~20 records (estimated);
- the plugin-size effect of B at full scale;
- EDAM coverage;
- whether ComfyTy can be implemented (only the abstract was read);
- the exhausted-search scenario;
- whether alpha survives the ProRes encode.

ADR ownership:
- **#75.** The free/open-source policy and the reference-only label (Houdini), plus an ADR for migrating legacy proprietary records.
- **#67 / #48.** CLI naming (`vcr tools …` filters versus `vcr graph …`) is decided before any implementation.
- **Store choice.** Extension versus a separate folder needs an ADR or a PRD revision, because it overrides PRD §5.

## Implications for #67–#85

These follow the PRD §14 grouping.
- **First release:**
  - **#67–#68**: the operation card as a tool-record extension, seeded from build123d-product.
  - **#69–#70**: domain and format filters on `tools list` instead of a new command family.
  - **#71–#76**: matching, bindings, the units rule, evidence/freshness, policy and doctor readiness. Each is scoped to the 8 records.
  - **#77**: one curated route.
- **Follow-on:** #78 (fork/join) and #79 (verify one reviewed fixture). R5 stays unknown until an onset-event contract is assessed, and that assessment must not be invented.
- **Defer:** #80–#82 (search, ranking, frontier) until the revisit conditions hold; #83–#84 until route diagnostics are in use; #85 (explorer) until there is separate demand.
