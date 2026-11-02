# VCR — Capability Graph & Gap Intelligence PRD

Version: 0.2 • Date: 2026-11-02 • Status: Proposal for review

Parent: [VCR PRD](vcr-prd.md) • Related: [Plugin and review PRD](vcr-plugin-prd.md), ADRs 0001–0004

Review note (2026-11-02): [current VCR and external landscape comparison](research/capability-graph-landscape-2026-11-02.md), including ADR 0004 alignment and recommended G0 changes. The owner confirmed the free/open-source focus; v0.2 clarifies that policy. The other review recommendations remain unaccepted.

## 0. Executive summary

VCR's original purpose is a progressively disclosed, open-source, agent-friendly catalogue of creative tools. A flat catalogue tells an agent *what exists*; a capability graph should answer *what is possible, what can connect, what will be lost, what is legally usable, what has been verified, and what is missing*. The graph is **not** the video compositor, DAW, orchestration runtime, or a mandate to expose everything through one wrapper. It is a reusable discovery/planning/evidence subsystem for images, motion, audio, 3D and emerging creative media.

**Thesis:** Keep native tools sovereign, represent their invocable operations as typed transformations, connect transformations through explicit port compatibility, plan potential paths under constraints, and validate actual edges using reproducible evidence. Repeated missing or poor paths become a researched backlog of adapters, tool contributions or new open-source utilities.

**Decision requested in this PR:** approve the *direction and contracts for a spike*, not an implementation commitment. This document is deliberately detailed enough to guide child plans and architecture decisions without changing VCR's currently shipped CLI, plugin or tool catalogue.

## 1. Product boundaries and relationship to VCR

- The existing four disclosure tiers (index → tool card → guide → example) remain. Graph navigation adds focused capabilities, format families, operation cards, path explanations and gap reports within those budgets.
- Agent plugins (Claude Code, Codex) call the same CLI. Headless operation is complete without an agent or GUI. A future optional Swift/macOS or web explorer reads generated graph JSON or CLI output, never owns graph truth. ADR 0002's current *read-only visualisers* boundary remains in force; an interactive editor requires a separate ADR.
- The harness and versioned graph definitions are read-only when installed. Workspace-specific adapters, constraints and execution evidence live in the workspace; local installation and runtime facts live in machine state. Do not write into installed plugin files (ADR 0003).
- Scope starts with **discovery, compatibility and path explanation**; no arbitrary workflow execution in v1. The existing native tools, direct CLI and scene examples continue to work.
- Explicit project policy: VCR's runnable *default recommendations* focus on free, open-source components usable locally without a required paid licence, subscription or metered API. Verify open-source licensing separately from price: a free hosted tier does not establish open-source eligibility, and an optional paid cloud offering does not disqualify an independently usable open-source local core. Proprietary tools and paid-only services may be recorded as **reference-only** for capability research/gap detection, but never silently introduced as runnable path steps. Treat a tool's source licence, bundled assets, plugins, model weights, services and generated-output terms separately. Local hardware and compute requirements remain explicit. All licence compliance checks are conservative signals, **not legal advice**.
- The parent PRD previously catalogued proprietary resources. Do not mass-delete them in this PR: migrate to a documented reference-only policy separately.

## 2. Users, jobs and examples

Primary user: creative developer working with a coding agent; future user: composer, animator, artist or researcher using the independent CLI/graph viewer.

1. “I have an SVG; how do I animate it and export transparent video?” Return *ranked, explainable* compatible paths with prerequisites, caveats and evidence.
2. “Which tools can ingest GLB while preserving animation?” Filter by actual port/feature preservation, not a loose `pairs_with` relationship.
3. “Can I generate audio-reactive typography from a WAV?” Find a multi-input path from audio to beat events and from typography/assets to rendered frames; identify synchronisation requirements.
4. “No working path to editable Blender scene from a procedural Three.js animation?” Show proven partial options and an explicit unknown/missing edge—never fabricate universal conversion.
5. “Why was this route rejected?” Identify incompatible alpha/colour/sample rate, environment, licence or unverified adapter.
6. “What should we build?” Rank recurring unsatisfied goals, expensive detours and lossy edges by measured demand, reuse, feasibility and confidence.
7. “What worked last month?” Retrieve environment/version-bounded evidence and runnable fixtures without feeding a giant catalogue into context.

## 3. Non-goals and success criteria

**Non-goals (first phases):** graph database, cloud catalogue, auto-install all tools, arbitrary graph execution, automatic code generation with silent side effects, universal media conversion, perfectly inferred semantics from file extension, semantic equivalence between shaders and native nodes, final legal clearance, full native studio/editor, or complete mathematical optimality in pathfinding.

**Success criteria:**
- Explain a route spanning at least three distinct tool families using typed operation/format ports.
- Correctly reject incompatible or licensed-out paths with machine-readable reasons.
- Surface a route that is *technically plausible but unverified* without presenting it as tested.
- Demonstrate one multi-input operation and one fork/join pipeline.
- Demonstrate missing-edge and poor-path reports with no invented solutions.
- No regressions to existing CLI/tool cards, plugin packaging, validation and token budgets.
- Reproduce verification on a clean test environment with pinned versions and fixtures.
- Human can understand why each recommendation was selected without reading entire skill files.

## 4. Domain model: typed operations, not merely tool-to-tool links

**Entities and relations**

| Entity | Meaning | Example |
|---|---|---|
| Tool | Existing product/library/executable | Blender |
| Capability | Intent taxonomy, not implementation | `model.render`, `audio.beat-detect` |
| Operation | An invocable, version-bounded transformation implemented by a tool | `blender.render-rgba-sequence` |
| Port | Typed input/output of an operation, cardinality and constraints | required scene input, output RGBA frames |
| Media type | Structured format/semantic profile | `image/png-sequence`, `model/gltf-binary`, `audio/wav` |
| Constraint | Qualifier restricting an operation or connection | alpha, colour transfer, timebase, GPU |
| Adapter | A concrete conversion/invocation route, possibly implemented as a tool | colour conversion / model import |
| Evidence | Reproducible test of an operation or pair | example, hash, environment, result |
| Policy | Project/run admissibility filters | open-source-only, offline, lossless |
| Gap | Unmet desired transformation or undesirable route | unverified GLB material conversion |

**Important:** A transformation is a hyperedge, not a simple arrow: it may require several inputs and produce several outputs simultaneously. A naive pairwise graph is derived *for navigation only*; it is not authoritative for execution. A tool can implement numerous operations. Shared media names do not establish compatibility without their detailed profiles and semantic guarantees.

**Relation examples:** `tool implements operation`, `operation requires/produces port`, `port has media profile`, `operation fulfils capability`, `operation depends on runtime`, `evidence supports operation/connection`, `gap requests missing capability/path`. Treat `pairs_with` as a weak hint, never a validated edge.

## 5. Schema design and compatibility contracts

Keep current `catalog/tools/<id>.json` records as the Tier 0/1 tool registry. Introduce separate, versioned records—*proposed paths, not yet created*: `catalog/graph/capabilities/*.json`, `formats/*.json`, `operations/*.json`, `policies/*.json`, and `catalog/graph/schemas/`. Their generated index must be built from sources and checked for staleness. Avoid embedding detailed operations in every tool card.

Operation schema, proposed fields:
- `id`, `tool_id`, `capability_ids[]`, `version_range`, `inputs[]`, `outputs[]`, `constraints`, `prerequisites`, `invocation`, `evidence_refs[]`, `maturity`, `source_urls[]`, `checked_at`.
- Every port: stable `id`, `direction`, `kind` (file/stream/in-memory/parameter/event), `media_type`, `profile`, `required`, `min/max` cardinality, `multiplicity`, `ordering`, `time_domain`; no hidden required side inputs.
- Profile dimensions appropriate to media: alpha representation, bit depth, colour space/transfer/primaries, channel layout, sample rate, frame rate/timebase, coordinate system, handedness, units, scene scale, compression, animation tracks, embedded assets, transparency, metadata, editability and loss/preservation guarantees.
- `invocation` must be declarative and safe by default: no uncontrolled arbitrary shell string from the registry. An executable recipe references a reviewed skill/fixture or constrained argv template; later execution must require explicit workspace and side-effect permissions.
- Versioned media profiles should be flexible: schemas validate vocabularies, but unknown properties never silently imply compatibility.
- Unknown, supported, unsupported and conditional are distinct values. Optional field absence means *unknown*, not “works”.

**Illustrative operation (proposed, not a verified claim):**

```json
{
  "schema_version": "0.1",
  "id": "blender.render-rgba-frames",
  "tool_id": "blender",
  "capability_ids": ["3d-rendering"],
  "version_range": ">=4 <5",
  "inputs": [
    {"id":"scene","direction":"input","kind":"file","media_type":"application/x-blend","required":true,"min":1,"max":1}
  ],
  "outputs": [
    {"id":"frames","direction":"output","kind":"file","media_type":"image/png-sequence","profile":{"alpha":"straight","timebase":"frames"},"required":true,"min":1,"max":1}
  ],
  "constraints": {"headless":"supported","determinism":"conditional"},
  "maturity": "proposed",
  "evidence_refs": []
}
```

This example deliberately does **not** assert that every Blender render uses straight alpha or yields identical bytes across machines. Such claims must be narrowed/tested in real records. A sequence is one logical collection port with a frame manifest, not a single PNG.

### Compatibility algorithm

A candidate connection passes successive gates:
1. **Type:** producer output matches consumer input by declared media type or an explicit conversion operation.
2. **Structure:** required port cardinality, synchronised groupings, parameter dependencies, path/URI access and streaming vs materialisation are satisfiable.
3. **Semantics:** required feature profile is retained (geometry, keyframes, editability, alpha, channels, timing, units, etc.); an explicit conversion and quantified information loss may satisfy relaxed constraints.
4. **Environment:** producer/consumer support the target OS, runtime, memory, dependencies and known versions; on-machine installation is checked from `doctor`, not assumed from catalogue.
5. **Policy:** licences and distribution/output restrictions are admissible for the requested use.
6. **Evidence:** return a *confidence/provenance class*; it is not a substitute for the earlier gates.

Outcomes: `compatible-verified`, `compatible-conditional`, `plausible-unverified`, `incompatible`, `unknown`. Every outcome includes an explanatory reason code, relevant input/output fields, data sources and a suggested next test if appropriate. A missing field must never be treated as a positive assertion.

### Licensing & openness policy

Move beyond the existing free-text `license` property via a versioned **licence assessment record**, preserving current strings through migration. Record SPDX identifier/expression where appropriate; source URL and checked date; project and dependency attribution; licence of code, model weights, bundled media and codecs separately; commercial use; attribution, source-sharing, copyleft and redistribution obligations; whether a service requires proprietary backend; and whether rights on produced output differ. Distinguish: `osi-approved`, `source-available`, `proprietary`, `unknown` (classification must follow verified terms, not a self-asserted boolean). Version-scoped checks can expire and become unknown.

Policy defaults:
- **Runnable recommendation:** free local use of eligible OSI-approved open-source code with compatible dependency and distribution conditions, with no required paid service, subscription, API credit or software licence. Check the actual workflow, including models and custom nodes; require explicit review for conditional licence or output constraints. Record hardware and compute costs separately from software eligibility.
- **Reference-only discovery:** commercial/proprietary products appear as examples of missing capability, clearly segregated from executable paths.
- **Composition:** evaluate entire dependency chain, not only the visible headline tool. A GPL executable used as a separate process is not automatically the same as linking a GPL library into a distributed proprietary binary; still review actual distribution architecture. Never promise compliance based on SPDX alone.
- Permission to **run**, **modify**, **redistribute**, **bundle**, **publish generated outputs**, **host models**, and **use commercially** are separately evaluated.
- Record OSI status, licence exceptions, and source evidence without claiming to provide legal advice.

## 6. Search, planning and explanation

**Inputs:** desired capability or output profile, known assets/ports, target environment, project policy, quality requirements (editability, transparency, fidelity), and user weights for latency/setup/loss.

**Algorithm, first iteration:** reverse search from desired output through candidate operations; bounded search over port-typed operations and conversion steps with branching for multi-input requirements; early prune incompatible policy/environment; top-K (e.g. 3–5) candidates; cycle detection and maximum-depth/cost limits. Work with a deterministic indexed in-memory graph (JSON generated at build time); no Neo4j or external service. For larger graphs, benchmark and reconsider. Discovery never performs installation or execution.

**Cost vector**, kept explicit instead of one mysterious score: known setup effort, render/compute estimate, expected information loss, portability, operation count, licence risk, evidence strength, maintainability. Unknown values remain unknown. A path ranking is a recommendation, not a proof of aesthetic quality or optimality. Explanations show why alternatives lost.

**Examples and error behavior:**
- SVG → animated vector → RGBA frames → encoded video: identify alpha preservation and possible codec/profile limitations.
- WAV + text/SVG → beat/onset events + graphics animation → synchronised frames → MP4: a fork/join graph, not the false claim that WAV itself transforms directly into video.
- GLB → Blender/Three.js: distinguish import/render from *round-trip preserving editable animation/material nodes*.
- No eligible route: report `NO_PATH` with frontier/closest candidates, excluded reasons and proposed missing capabilities; never invent an executable command.

## 7. CLI and progressive disclosure

Proposed commands; names are placeholders subject to CLI review:

```sh
vcr capabilities list --domain audio
vcr graph formats image/png-sequence
vcr graph operations --capability 3d-rendering
vcr graph producers --format model/gltf-binary
vcr graph consumers --format image/svg+xml
vcr graph paths --from image/svg+xml --to video/mp4 --policy open-source
vcr graph explain <path-id> --json
vcr graph gaps --workspace . --json
vcr graph verify <operation-or-edge-id> --fixture <id>
```

Resolve the distinction between output targets and *desired semantic properties*: `--to video/mp4` alone cannot infer transparency or editability. Where there are multiple required inputs, support a structured `--request path.json` form rather than fragile string flags. `verify` is a separate explicit action; discovery is read-only. JSON output must be stable, versioned and consumed by both agents and any optional viewer.

Four-tier disclosure adaptation:
- Tier 0: existing catalogue index plus a short capability/format index; keep each bounded, do not dump full graph into context.
- Tier 1: concise operation/edge cards, filters, top candidate paths with one-line reasons; bounded token/byte budgets to be measured in spike.
- Tier 2: explicit port/profiles, quality/compatibility caveats, licence assessment, versioned evidence and detailed path explanation.
- Tier 3: one selected tool's skill, runnable fixture and exact execution recipe; never require every skill in the path to be loaded upfront.

Search can expand *possibilities* by traversing capabilities, but it must not recursively inject all neighbouring docs. Tool selection and pipeline construction are separate decisions. Preserve links back to source records; avoid duplicated prose.

## 8. Verification and learning loop

**Evidence states:** `documented`, `hypothesised`, `fixture-tested`, `environment-verified`, `regressed`, `blocked`, `stale`. Tool-level evidence does **not** automatically verify a specific edge, nor does one successful version/environment imply all versions/OSes work.

Each verification record should include:
- tool/operation IDs, input/output profiles and versions, harness/plugin version, OS/arch and relevant GPU/driver/runtime;
- fixture inputs with hashes and origin/licence, exact commands or reviewed recipe, side-effect permissions, outputs, checks/hashes, tolerances, errors, timing/resource consumption;
- authored expectation, machine-observed result, timestamp and verifier; redacted secrets and no private user media uploaded by default;
- test type: schema check, smoke, structural round-trip, semantic/information-preservation assertion, determinism and performance;
- explicit scope and expiry/invalidating changes.

Distinguish a transformation working from preserving *desired semantics*. Pixel-equality is often inappropriate across GPUs; apply tolerant, meaningful assertions as specified per fixture. Re-run dependent evidence when tool version, schema, adapter or material runtime changes. Record regressions without silently discarding prior evidence.

Do **not** let an agent self-certify a new edge merely because it generated output. Promote only after a defined fixture and evidence gate. Consider a review step for publication of official verified records. User-local evidence may inform planning but cannot automatically rewrite the shared catalogue.

## 9. Capability Gap Intelligence

A gap is a *requested but missing or suboptimal transformation under a specified set of constraints*. Types:
- `missing-capability`: no known operation can fulfil an intent.
- `missing-edge`: compatible-looking ports have no proven adapter/integration.
- `format-bridge`: conversion absent, unsupported, or materially lossy.
- `quality-gap`: path exists but degrades fidelity, alpha, editability, sync, metadata or colour.
- `operational-gap`: excessive installation, cost, dependency, latency or platform restrictions.
- `licensing-gap`: only proprietary, source-available or otherwise policy-ineligible solution known.
- `evidence-gap`: plausible route lacks reproducible tests.
- `knowledge-gap`: catalogue may simply be incomplete; investigate before building.

**Gap record:** stable ID, originating goal/ports/constraints, rejected paths and reason codes, attempted research, example fixture, observed frequency, affected workflows, possible solution classes (discover tool, existing feature, adapter, new standalone OSS tool), confidence, candidate owners, status (`observed → researched → validated-opportunity → planned → solved / not-worthwhile`), and links to verification or PRs.

**Prioritisation:** demand from *distinct real workflows* (deduplicate repeated retries), breadth of reuse, severity, known workaround burden, information lost, implementation/maintenance estimate, expected open-source distribution value, and confidence. Use weights with visible inputs; don't present speculative scores as empirical facts. The top-ranked issue is not automatically permission to build it.

**Research-before-build gate:** search the active and retired catalogues, official documentation and established open-source ecosystems; inspect licence and current health; prove inability to achieve the goal with an existing operation under exact requirements; prototype the smallest missing edge; require human prioritisation before opening implementation tickets. Track near-misses and “found existing tool” resolutions.

Potential future feedback: approved productions could reference operations/edges that succeeded. Opt-in, local-only collection first; avoid telemetry and noisy popularity feedback loops.

## 10. Integration and backwards compatibility

- `pairs_with`: advisory/human-facing relationships, never executable compatibility assertions.
- Existing capability vocabulary: map old IDs to stable taxonomy terms; no wholesale migration required for the spike.
- Existing `license`: preserve as legacy descriptive field; add assessments via additive schema/migration in a later implementation PR.
- Existing `validation`/`adapter_maturity`: continue to describe tool maturity; edge evidence is its own object.
- Existing generated `catalog/INDEX.md` and `tools.json`: remain generated; graph indexes are generated and reproducibly validated.
- Existing plugin: graph data/CLI must respect generated `plugin/` distribution size ceiling and read-only harness, and must preserve Claude Code/Codex parity. Decide whether graph cards are bundled, lazily retrieved, or compressed based on measured size.
- Environment and workspace: machine-specific installations stay in `VCR_HOME`; user-defined adapters and test media remain within selected workspace. Never scan or execute project files without explicit scope.
- Parent VCR Layers 2–4 (timeline/compositor) are **potential consumers**, not prerequisites for the graph. Do not put graph discovery on the compositor critical path.
- Optional SwiftUI/web viewer: consume exported JSON and explanation/graph projections; no editor-state duplication. A future writable studio requires explicit versioning, concurrent edit/conflict handling and a new ADR.

## 11. Security, licensing and failure handling

Untrusted tool documentation, code, model cards, fixture downloads and metadata are data, never instructions granting privilege. Discover without executing. Install only after an explicit plan/consent, pin/hash where possible; use allowlisted commands and sandboxed workspaces for verification. Validate paths against the selected workspace and avoid symlink escapes. Don't leak credentials or project media into public gap records. Scrub private media from example bundles. Record network requirements and remote API dependence. Strictly reject missing permissions, environment mismatch and unsupported formats; return actionable diagnostics.

A graph cycle is not a plan. A technically possible conversion may still be unacceptable when it destroys required semantics. Never rank an unknown licence as open-source eligible or treat a proprietary reference as runnable merely because a compatible API exists.

## 12. Delivery phases and gates

| Phase | Deliverable | Exit gate |
|---|---|---|
| G0 — Research spike | 10–15 representative operations across SVG, 3D, browser render, FFmpeg, audio; taxonomy/profile draft; licence audit sample; pathfinder feasibility and graph size | Explain 3 routes, 2 deliberate incompatibilities and one multi-input join without inventing edges |
| G1 — Schema & static index | Versioned capability/format/operation/port/licence schemas, validation, generated index, migration rules | Deterministic build, stale-index checks, stable IDs, existing catalogue unaffected |
| G2 — Discovery & explain CLI | Operations/producers/consumers/paths/explain, JSON errors/reasons, bounded search, policy filter | Pass path-ranking/rejection fixtures, no install or execution side effects |
| G3 — Evidence and verification | Operation/edge fixtures, verification records, stale/regressed transitions | Reproduce same claims within declared environment and invalidate version drift |
| G4 — Gap intelligence | No-path frontier, missing/poor edge records, research workflow, prioritised gaps | Two real reproducible gaps, one resolved by discovery and one judged worthwhile |
| G5 — Optional explorer | Static graph/path visualisation via exported schema; separate app/prototype | Works without agent and cannot mutate workspace inadvertently |

**Suggested first fixtures:**
1. SVG → PNG (rasterisation) → video, alpha and colour requirements explicit.
2. GLB → Three.js → RGBA frames; model/animation preservation distinguished.
3. WAV → detected onset-event JSON + SVG/HTML → time-synchronised video; multi-input join.
4. Blender output → FFmpeg with transparent/opaque codec distinction.
5. A no-path editable-shader-roundtrip goal, showing a truthful knowledge gap.

## 13. Measurement, risks and open decisions

**Metrics:** valid route recall in curated fixtures; false-positive compatibility rate (highest risk); path explanation correctness; median index/search latency; token and plugin size budgets; number of reproducibly closed gaps; time to repair staleness; rate of rejected paths due to unknown licence. Avoid chasing catalogue size as a vanity metric.

**Risks/mitigations:**
- Explosion of nodes/ports → limit initial media profiles and operate per capability domain; avoid global enumeration in prompts.
- False interoperability → conditional/unknown typed semantics and fixtures, not file-extension matching.
- Confusing graph intelligence with runtime execution → separate read-only planning from explicit verification and execution permissions.
- Licence complexity → provenance, version scoping, conservative rejection and human review.
- Stale tool ecosystem → dated sources, validation expiry, regression state and update cadence.
- Overengineering → use JSON and TypeScript indexes; defer database, GUI, distributed runner and cross-domain generality until fixtures require them.
- Graph gap self-fulfilling predictions → research-before-build and deduplicated real-world demand.

**Decisions to resolve in G0:**
1. Operation schema and taxonomy ownership: separate graph folder versus extension to existing tool records (this PRD proposes separate).
2. Compatibility profile baseline by media family and how much detail must be known to assert a verified edge.
3. Path algorithm: bounded hypergraph search vs explicit recipe templates for multi-input joins.
4. Licence assessment governance: OSI policy and separate source/weights/assets/output checks.
5. Evidence publication policy and acceptable tolerances for nondeterministic renderers.
6. Index size and plugin distribution strategy under current constraints.
7. Whether workspace-local operation definitions can shadow built-ins (proposed: no; namespace/override explicitly).
8. Review UI data contract, strictly read-only until separate ADR.

## 14. Proposed follow-up issues (not created by this PR)

- G0 spike: select canonical workflows and collect actual input/output contracts from official docs.
- Taxonomy and versioned operation schema, with media profiles for image, audio, video and 3D.
- Licence assessment schema and reference-only separation policy, including audit of existing records.
- Offline graph builder and validator, deterministic sorted index with size checks.
- Path search/explain command with reason codes and multi-input hyperedge fixture.
- Edge evidence schema, reproducible fixture runner and invalidation strategy.
- Gap registry, research-before-build procedure and scoring specification.
- Optional read-only graph/path viewer proof of concept.

## 15. Acceptance checklist for this PRD

- [ ] Confirms VCR remains an open-source-first tool suite, not a video-only framework.
- [ ] Respects ADR 0001 (in-house compositor), 0002 (headless/read-only UI), 0003 (plugin and three roots).
- [ ] Distinguishes capabilities, tools, operations, formats, ports, constraints, evidence and gaps.
- [ ] Explicitly handles multi-input operations, information loss, unknowns and provenance.
- [ ] Makes technical compatibility, installation readiness, licensing and verification independent.
- [ ] Keeps disclosure bounded and tool skills lazy-loaded.
- [ ] Outlines meaningful CLI, fixture, security, migration, measurement and release gates.
- [ ] Provides a research-before-build strategy for missing adapters/open-source tools.
- [ ] Does not claim the described graph or engine already exists.

**Open for review.** No production source, manifests, generated catalogue, CLI or plugin files are changed by this planning PR.
