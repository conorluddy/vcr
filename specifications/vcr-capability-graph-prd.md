# VCR — Capability Graph & Gap Intelligence PRD

Version: 0.3 • Date: 2026-11-02 • Status: Proposal for review

Parent: [VCR PRD](vcr-prd.md) • Related: [Plugin and review PRD](vcr-plugin-prd.md), ADRs 0001–0004

Review note (2026-11-02): [current VCR and external landscape comparison](research/capability-graph-landscape-2026-11-02.md). The owner confirmed the free/open-source focus in v0.2 and progressive refinement of port descriptions in v0.3: **media domain → format → semantic profile**, with evidence available at every level. This revision carries that model through discovery and compatibility, and aligns verification with ADR 0004. Broader planner, ranking and architecture choices remain subject to G0. [Epic #65](https://github.com/conorluddy/vcr/issues/65) tracks the phased implementation and decision gates; see §14.

## 0. Executive summary

VCR's original purpose is a progressively disclosed, open-source, agent-friendly catalogue of creative tools. A flat catalogue tells an agent *what exists*; a capability graph should answer *what is possible, what can connect, what will be lost, what is legally usable, what has been verified, and what is missing*. The graph is **not** the video compositor, DAW, orchestration runtime, or a mandate to expose everything through one wrapper. It is a reusable discovery/planning/evidence subsystem for images, motion, audio, 3D and emerging creative media.

**Thesis:** Keep native tools sovereign, represent their invocable operations as typed transformations, and progressively refine their ports from media domain to format to semantic profile. Broad discovery finds relevant operations; explicit compatibility contracts and reproducible evidence establish what can connect. Plan potential paths under constraints. Repeated missing or poor paths become a researched backlog of adapters, tool contributions or new open-source utilities.

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

Core job: **“Help me find a workable route from what I have to what I want, with clear limits and evidence.”** Users can begin with a broad media domain and progressively specify a format and preservation requirements, without knowing a tool or loading its full guide first.

1. “I have an SVG; how do I animate it and export transparent video?” Return *ranked, explainable* compatible paths with prerequisites, caveats and evidence.
2. “Which tools can ingest GLB while preserving animation?” Filter by actual port/feature preservation, not a loose `pairs_with` relationship.
3. “Can I generate audio-reactive typography from a WAV?” Find a multi-input path from audio to beat events and from typography/assets to rendered frames; identify synchronisation requirements.
4. “No working path to editable Blender scene from a procedural Three.js animation?” Show proven partial options and an explicit unknown/missing edge—never fabricate universal conversion.
5. “Why was this route rejected?” Identify incompatible alpha/colour/sample rate, environment, licence or unverified adapter.
6. “What should we build?” Rank recurring unsatisfied goals, expensive detours and lossy edges by measured demand, reuse, feasibility and confidence.
7. “What worked last month?” Retrieve environment/version-bounded evidence and runnable fixtures without feeding a giant catalogue into context.
8. “What can take 3D and produce images?” Browse by input/output domain, narrow to GLB and PNG frames, then inspect animation and transparency requirements. Each refinement reveals more detail without upgrading an untested candidate into a verified route.

## 3. Non-goals and success criteria

**Non-goals (first phases):** graph database, cloud catalogue, auto-install all tools, arbitrary graph execution, automatic code generation with silent side effects, universal media conversion, perfectly inferred semantics from file extension, semantic equivalence between shaders and native nodes, final legal clearance, full native studio/editor, or complete mathematical optimality in pathfinding.

**Success criteria:**
- Refine one discovery request from domain to format to semantic profile, with evidence links throughout and no full-guide load required for filtering.
- Keep an operation with known domain but unknown formats discoverable, explicitly labelled incomplete and excluded from assertions of compatible handoff.
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
| Media domain | Broad, potentially overlapping facet describing the media a port accepts or produces | `3d`, `image`, `audio` |
| Format | A specific representation with a stable registry ID and optional external media-type aliases | `glb`, `png-sequence`, `wav` |
| Semantic profile | Requirements or guarantees within a format, scoped to the operation and its parameters | animation tracks, units, alpha representation |
| Constraint | Qualifier restricting an operation or connection | alpha, colour transfer, timebase, GPU |
| Adapter | A concrete conversion/invocation route, possibly implemented as a tool | colour conversion / model import |
| Evidence | Reproducible test of an operation or pair | example, hash, environment, result |
| Policy | Project/run admissibility filters | open-source-only, offline, lossless |
| Gap | Unmet desired transformation or undesirable route | unverified GLB material conversion |

**Important:** A transformation is a hyperedge, not a simple arrow: it may require several inputs and produce several outputs simultaneously. A naive pairwise graph is derived *for navigation only*; it is not authoritative for execution. A tool can implement numerous operations. Shared media names do not establish compatibility without their detailed profiles and semantic guarantees.

**Relation examples:** `tool implements operation`, `operation requires/produces port`, `port has media domains`, `port accepts/produces format under profile`, `operation fulfils capability`, `operation depends on runtime`, `evidence supports claim about operation/connection`, `gap requests missing capability/path`. Treat `pairs_with` as a weak hint, never a validated edge.

### Progressive refinement of port descriptions

Use **media domain → format → semantic profile** as increasing precision for the same input or output port. Evidence is available at every level, rather than a final stage that makes earlier labels trustworthy by default.

| Level | Example | Decision supported |
| --- | --- | --- |
| Domain | 3D input → image output | Is this operation relevant to the job? |
| Format | GLB input → PNG sequence output | Does a candidate route handle my representations? |
| Semantic profile | Preserve animation; interpret units; render transparent frames | Does it meet my requirements, and what could be lost? |
| Evidence, across all levels | Documentation or a scoped fixture, versions, environment and limitations | What supports each claim, and what remains unknown? |

- These are facets, not a rigid folder tree. A format can belong to more than one domain; a port can expose several domain facets. A format containing embedded textures does not by itself prove that an operation accepts standalone images. Record the port's actual contract.
- Keep media domain separate from capability (what an operation does), tool `category` (catalogue organization), and port `kind` (file, stream, in-memory, parameter or event). A GLB file has a format; `file` describes how it is supplied.
- A domain match establishes relevance only. It neither creates a compatible edge nor implies that all formats in the domain are supported. A shared format also needs structure and semantic checks before compatibility can be asserted.
- Domain-only records are valid discovery leads. Missing format or required profile information means unknown; expose the missing detail and next assessment step. Do not treat omission as a wildcard or fabricate a recipe.
- Domain facets and format aliases have versioned definitions and provenance. If domains are derived from known formats, use explicit registry mappings. Do not infer an operation's inputs from a tool-wide tag or file extension.
- Input profiles express requirements; output profiles express guarantees. Parameter-dependent preservation, conversion and loss must be explicit. Unknown properties remain unknown unless the operation establishes an output guarantee; profile refinement must not invent guarantees.

G0 selects the smallest domain vocabulary needed by its fixtures. The examples here are proposed identifiers, not additions to the current capability vocabulary or proof of toolkit support.

## 5. Schema design and compatibility contracts

Keep current `catalog/tools/<id>.json` records as the Tier 0/1 tool registry. Introduce separate, versioned records—*proposed paths, not yet created*: `catalog/graph/domains/*.json`, `capabilities/*.json`, `formats/*.json`, `operations/*.json`, `policies/*.json`, and `catalog/graph/schemas/`. Their generated index must be built from sources and checked for staleness. Avoid embedding detailed operations in every tool card.

Operation schema, proposed fields:
- `id`, `tool_id`, `capability_ids[]`, `version_range`, `inputs[]`, `outputs[]`, `constraints`, `prerequisites`, `invocation`, `evidence_refs[]`, `maturity`, `source_urls[]`, `checked_at`.
- Every port: stable `id`, `direction`, `kind` (file/stream/in-memory/parameter/event), `domain_ids[]`, `format_id` when known, `profile`, `required`, `min/max` cardinality, `multiplicity`, `ordering`, `time_domain`; no hidden required side inputs. The contract permits incomplete discovery records; a compatible connection requires enough information for the requested checks.
- Domain definitions carry stable IDs, labels and descriptions. Format definitions carry stable IDs, domain mappings and documented aliases such as media types. Distinguish sequence/collection representations from single files. Multiple accepted formats are alternatives on one logical port, not extra required inputs; G0 settles the alternative-profile schema without implying every format/profile combination works.
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
    {"id":"scene","direction":"input","kind":"file","domain_ids":["3d"],"format_id":"blend","required":true,"min":1,"max":1}
  ],
  "outputs": [
    {"id":"frames","direction":"output","kind":"file","domain_ids":["image"],"format_id":"png-sequence","profile":{"alpha":"straight","timebase":"frames"},"required":true,"min":1,"max":1}
  ],
  "constraints": {"headless":"supported","determinism":"conditional"},
  "maturity": "proposed",
  "evidence_refs": []
}
```

This example deliberately does **not** assert that every Blender render uses straight alpha or yields identical bytes across machines. Such claims must be narrowed/tested in real records. A sequence is one logical collection port with a frame manifest, not a single PNG.

### Compatibility algorithm

Domain filtering is a discovery prefilter, not a compatibility gate. A candidate connection then passes successive gates:
1. **Format:** producer output matches a declared consumer format (resolving documented aliases), or an explicit conversion operation supplies it. Unknown format yields an unknown result, even when domains match.
2. **Structure:** required port cardinality, synchronised groupings, parameter dependencies, path/URI access and streaming vs materialisation are satisfiable.
3. **Semantics:** required feature profile is retained (geometry, keyframes, editability, alpha, channels, timing, units, etc.); an explicit conversion and quantified information loss may satisfy relaxed constraints.
4. **Environment:** producer/consumer support the target OS, runtime, memory, dependencies and known versions; on-machine installation is checked from `doctor`, not assumed from catalogue.
5. **Policy:** licences and distribution/output restrictions are admissible for the requested use.
6. **Evidence:** return a *confidence/provenance class*; it is not a substitute for the earlier gates.

Outcomes: `compatible-verified`, `compatible-conditional`, `plausible-unverified`, `incompatible`, `unknown`. Every outcome includes an explanatory reason code, relevant input/output fields, data sources and a suggested next test if appropriate. Technical compatibility, machine readiness, policy eligibility and evidence scope/freshness remain separate fields even when a summary label is returned. A missing field must never be treated as a positive assertion.

### Licensing & openness policy

Move beyond the existing free-text `license` property via a versioned **licence assessment record**, preserving current strings through migration. Record SPDX identifier/expression where appropriate; source URL and checked date; project and dependency attribution; licence of code, model weights, bundled media and codecs separately; commercial use; attribution, source-sharing, copyleft and redistribution obligations; whether a service requires proprietary backend; and whether rights on produced output differ. Distinguish: `osi-approved`, `source-available`, `proprietary`, `unknown` (classification must follow verified terms, not a self-asserted boolean). Version-scoped checks can expire and become unknown.

Policy defaults:
- **Runnable recommendation:** free local use of eligible OSI-approved open-source code with compatible dependency and distribution conditions, with no required paid service, subscription, API credit or software licence. Check the actual workflow, including models and custom nodes; require explicit review for conditional licence or output constraints. Record hardware and compute costs separately from software eligibility.
- **Reference-only discovery:** proprietary tools and paid-only services appear as examples of missing capability, clearly segregated from executable paths. Commercial availability alone does not exclude a free, independently usable open-source edition.
- **Composition:** evaluate entire dependency chain, not only the visible headline tool. A GPL executable used as a separate process is not automatically the same as linking a GPL library into a distributed proprietary binary; still review actual distribution architecture. Never promise compliance based on SPDX alone.
- Permission to **run**, **modify**, **redistribute**, **bundle**, **publish generated outputs**, **host models**, and **use commercially** are separately evaluated.
- Record OSI status, licence exceptions, and source evidence without claiming to provide legal advice.

[ADR 0005](decisions/0005-recommendation-policy-and-licence-migration.md) (accepted) sets out the five policy dimensions and the deferred migration of `license` strings, and relaxes the default below from OSI-approved to free for local and commercial use while VCR is the owner's own tool.

## 6. Search, planning and explanation

**Inputs:** desired capability, input/output domains, known formats and semantic requirements, known assets/ports, target environment, project policy, quality requirements (editability, transparency, fidelity), and user weights for latency/setup/loss. A domain-only query returns relevant operations and potential route families with missing details, not a claim of an executable or verified path. Adding a format or profile refines the request and returns retained/excluded/unknown candidates with reasons; it never silently relaxes an earlier requirement.

**Algorithm, first iteration:** reverse search from desired output through candidate operations; bounded search over port-typed operations and conversion steps with branching for multi-input requirements; early prune incompatible policy/environment; top-K (e.g. 3–5) candidates; cycle detection and maximum-depth/cost limits. Work with a deterministic indexed in-memory graph (JSON generated at build time); no Neo4j or external service. For larger graphs, benchmark and reconsider. Discovery never performs installation or execution.

**Cost vector**, kept explicit instead of one mysterious score: known setup effort, render/compute estimate, expected information loss, portability, operation count, licence risk, evidence strength, maintainability. Unknown values remain unknown. A path ranking is a recommendation, not a proof of aesthetic quality or optimality. Explanations show why alternatives lost.

**Examples and error behavior:**
- SVG → animated vector → RGBA frames → encoded video: identify alpha preservation and possible codec/profile limitations.
- WAV + text/SVG → beat/onset events + graphics animation → synchronised frames → MP4: a fork/join graph, not the false claim that WAV itself transforms directly into video.
- GLB → Blender/Three.js: distinguish import/render from *round-trip preserving editable animation/material nodes*.
- No eligible route within a fully explored declared search space: report `NO_PATH` with frontier/closest candidates, excluded reasons and proposed missing capabilities; never invent an executable command. Distinguish this from an underspecified request or exhausted depth/cost/time budget. Report limits and metadata coverage; none of these outcomes proves a capability is absent from the wider ecosystem.

## 7. CLI and progressive disclosure

Proposed commands; names are placeholders subject to CLI review:

```sh
vcr capabilities list --domain audio
vcr graph domains
vcr graph formats --domain 3d
vcr graph formats glb
vcr graph operations --input-domain 3d --output-domain image
vcr graph operations --capability 3d-rendering
vcr graph producers --format glb
vcr graph consumers --format svg
vcr graph paths --from svg --to mp4 --policy open-source
vcr graph paths --request path.json --json
vcr graph explain <path-id> --json
vcr graph gaps --workspace . --json
vcr verify --operation <id> --fixture <id>
```

Resolve the distinction between output targets and *desired semantic properties*: `--to mp4` alone cannot infer transparency or editability. A structured `--request path.json` form expresses multiple required inputs and per-port domain, format and profile requirements rather than fragile string flags. `vcr verify` is a separate explicit action using ADR 0004's single feedback surface and shared findings contract; graph target flags are provisional. Discovery is read-only. JSON output must be stable, versioned and consumed by both agents and any optional viewer.

**Filtering contract:** input-domain and output-domain filters apply to the corresponding ports of each operation, never merely its parent tool's tags. Across input and output filters, both conditions must match. Where multiple domain choices are supplied for one filter, match any choice by default and state that behavior in help/JSON. A domain match identifies relevant ports without asserting all required inputs have been supplied. A format filter requires a declared format or registry alias; domain-only records remain visible in broad discovery but are reported separately as unknown when narrowing to a specific format. An explicit profile conflict excludes a candidate from compatible recommendations; missing required detail leaves it unknown. Preserve reasons and source links at each refinement.

Four-tier disclosure adaptation:
- Tier 0: existing catalogue index plus a short domain/capability index; route by input/output domains with format counts and links where useful, without loading every format or profile.
- Tier 1: concise operation/edge cards, declared formats, relevant profile summaries, missing details and evidence summaries; top candidate paths with one-line reasons. Measure token/byte budgets in the spike.
- Tier 2: selected port contracts and semantic profiles, quality/compatibility caveats, licence assessment, versioned evidence and detailed path explanation.
- Tier 3: one selected tool's skill, runnable fixture and exact execution recipe; never require every skill in the path to be loaded upfront.

Search can expand *possibilities* by traversing capabilities, but it must not recursively inject all neighbouring docs. Tool selection and pipeline construction are separate decisions. Preserve links back to source records; avoid duplicated prose.

Domain, format and profile are data precision levels; the four tiers control how much detail is loaded. They are related but not interchangeable: a concise card can surface a critical profile restriction, and evidence/unknowns must be visible at every tier. Measure context size before adding budgets per ADR 0004; the existing validator's enforced limits continue to apply until explicitly changed.

## 8. Verification and learning loop

**Evidence states:** `documented`, `hypothesised`, `fixture-tested`, `environment-verified`, `regressed`, `blocked`, `stale`. Tool-level evidence does **not** automatically verify a specific edge, nor does one successful version/environment imply all versions/OSes work.

Each verification record should include:
- tool/operation IDs, input/output profiles and versions, harness/plugin version, OS/arch and relevant GPU/driver/runtime;
- fixture inputs with hashes and origin/licence, exact commands or reviewed recipe, side-effect permissions, outputs, checks/hashes, tolerances, errors, timing/resource consumption;
- authored expectation, machine-observed result, timestamp and verifier; redacted secrets and no private user media uploaded by default;
- test type: schema check, smoke, structural round-trip, semantic/information-preservation assertion, determinism and performance;
- explicit scope and expiry/invalidating changes.

Reuse the [fixture evidence template](../catalog/FIXTURE-EVIDENCE-TEMPLATE.md) and [candidate ingestion lifecycle](../catalog/CANDIDATE-INGESTION.md), adding operation/port/connection identifiers and claim scope. Link documentation to domain/format claims as appropriate; a domain classification alone never upgrades semantic preservation evidence. Verification emits ADR 0004's shared findings format rather than defining a separate graph-only feedback system.

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

Domain-only matches, missing format/profile metadata and exhausted search budgets are reasons for further assessment, not proof of a missing integration. Preserve the original request and refinements in gap evidence. Production-derived gaps link to source field notes and follow AGENTS.md's deduplicated `self-improvement` / `loop:*` issue workflow; the prospects inbox and ingestion lifecycle handle discovered tools. Epic/subissue creation records the delivery plan; it does not bypass the research and implementation gates.

Potential future feedback: approved productions could reference operations/edges that succeeded. Opt-in, local-only collection first; avoid telemetry and noisy popularity feedback loops.

## 10. Integration and backwards compatibility

- `pairs_with`: advisory/human-facing relationships, never executable compatibility assertions.
- Existing capability vocabulary: map old IDs to stable taxonomy terms; no wholesale migration required for the spike.
- Media domains and formats are additive port metadata, not replacements for tool categories or capabilities. Reuse existing identifiers where semantics match; document aliases explicitly. Do not infer port contracts or verified edges during migration.
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
| G0 — Research spike | 10–15 representative operations across SVG, 3D, browser render, FFmpeg, audio; domain/format/profile draft; licence audit sample; pathfinder feasibility and graph size | Explain 3 routes, 2 deliberate incompatibilities and one multi-input join; demonstrate progressive refinement and incomplete metadata without inventing edges |
| G1 — Schema & static index | Versioned domain/capability/format/operation/port/licence schemas, validation, generated index, migration rules | Deterministic build, stale-index checks, stable IDs and explicit mappings; existing catalogue unaffected |
| G2 — Discovery & explain CLI | Domain/format filters, operations/producers/consumers/paths/explain, JSON errors/reasons, bounded search, policy filter | Pass refinement, path-ranking/rejection and search-limit fixtures; no install or execution side effects |
| G3 — Evidence and verification | Operation/edge fixtures, verification records, stale/regressed transitions | Reproduce same claims within declared environment and invalidate version drift |
| G4 — Gap intelligence | No-path frontier, missing/poor edge records, research workflow, prioritised gaps | Two real reproducible gaps, one resolved by discovery and one judged worthwhile |
| G5 — Optional explorer | Static graph/path visualisation via exported schema; separate app/prototype | Works without agent and cannot mutate workspace inadvertently |

**G0 status (2026-11-04):** desk-research report drafted: [spikes/capability-graph-g0.md](spikes/capability-graph-g0.md). Its revised go/no-go was **accepted by the owner on 2026-11-04**: keep the current catalogue workflow with Step 1 applied; hold `operations[]`, a graph store and search behind the report's reopen conditions. Against the exit gate, the report covers:

- three explained routes: R1–R3, where R2 is spike-reported, not retained;
- two deliberate incompatibilities: R6 (alpha) and R7 (animated SVG into resvg);
- the fully bound FFmpeg join: R4, all eight bindings;
- progressive refinement: R8;
- incomplete metadata without invented edges: R5 onsets and the domain-only 3D records;
- an unknown property: GLB animation;
- stale evidence: Playwright beginFrame;
- a missing prerequisite: Blender GPU access outside the sandbox.

**Not demonstrated:** a deliberately exhausted search budget. No search was implemented, so this stays unknown and blocks G2's search-limit fixture rather than G1. G1+ stays on hold until the reopen conditions hold.

**Progressive-refinement acceptance scenarios (G0/G2):**

| Request or condition | Required behavior |
| --- | --- |
| Browse 3D input → image output | Return relevant operation summaries and matching ports, with coverage/unknowns and evidence links; require no tool guides. No compatible edge is implied. |
| Narrow to GLB → PNG sequence | Identify potential multi-step routes and their required inputs; distinguish declared format support, explicit exclusions and unknown formats. Never silently substitute a different format. |
| Require animation and transparent frames | Inspect per-step requirements and guarantees. Retain matching candidates, explain conflicts and leave unproved properties unknown; format equality alone cannot pass this check. |
| Domain is known; format is absent | Keep the operation in broad discovery, label it incomplete in format-specific results and suggest assessment. Do not count it as a compatible route or missing adapter. |
| A port has multiple facets or accepted formats | Find it through each declared facet without duplicates. Format/profile alternatives retain their conditions; neither domain overlap nor alternatives create extra required inputs. |
| Refine a request backed only by documentation | Keep that evidence class and its scope visible. Extra detail cannot promote it to fixture-tested or environment-verified. |
| Search reaches its configured limit | Report incomplete search with limits/frontier, separately from `NO_PATH` within a fully explored declared space. Do not turn the timeout into a capability-gap claim. |

**Suggested first fixtures:**
1. SVG → PNG (rasterisation) → video, alpha and colour requirements explicit.
2. GLB → Three.js → RGBA frames; model/animation preservation distinguished.
3. WAV → detected onset-event JSON + SVG/HTML → time-synchronised video; multi-input join.
4. Blender output → FFmpeg with transparent/opaque codec distinction.
5. A no-path editable-shader-roundtrip goal, showing a truthful knowledge gap.
6. Seed a 3D handoff description from the retained [build123d → GLB → Blender evidence](../examples/build123d-product/evidence.md), keeping its geometry checks and explicit animation/material exclusions. Reuse the scoped observation; no rerun or general adapter claim is implied.

## 13. Measurement, risks and open decisions

**Metrics:** domain-filter recall and format/profile refinement correctness in curated fixtures; false-positive compatibility rate (highest risk); path explanation correctness; context loaded per refinement versus the existing catalogue workflow; median index/search latency; token and plugin size budgets; number of reproducibly closed gaps; time to repair staleness; rate of rejected paths due to unknown licence. Avoid chasing catalogue size as a vanity metric.

**Risks/mitigations:**
- Explosion of nodes/ports → limit initial media profiles and operate per capability domain; avoid global enumeration in prompts.
- False interoperability → conditional/unknown typed semantics and fixtures, not file-extension matching.
- Broad-domain overclaiming → distinguish relevance from format support and compatibility; preserve incomplete records as explicit unknowns.
- Confusing graph intelligence with runtime execution → separate read-only planning from explicit verification and execution permissions.
- Licence complexity → provenance, version scoping, conservative rejection and human review.
- Stale tool ecosystem → dated sources, validation expiry, regression state and update cadence.
- Overengineering → use JSON and TypeScript indexes; defer database, GUI, distributed runner and cross-domain generality until fixtures require them.
- Graph gap self-fulfilling predictions → research-before-build and deduplicated real-world demand.

**Decisions to resolve in G0.** The G0 report's answers follow each item; the owner accepted the revised recommendation on 2026-11-04, so the *Revised* notes take precedence over the drafts.
1. **Operation schema and taxonomy ownership:** a separate graph folder versus an extension to existing tool records. This PRD (§5) proposes separate.
   - *Draft:* extend the tool records with `operations[]` (ports grouped per operation) and keep curated cross-tool routes as separate small records. On R1–R8, the separate folder gave the same verdicts at about 2.5× the plugin growth (estimated). It also added a second canonical store. *Revised after the observed B pilot:* hold `operations[]` too. The pilot tied the current catalogue on correctness and unknowns and repeated cross-scope evidence errors (see the report).
   - This would override §5, so it needs an owner decision via an ADR or a PRD revision.
2. **Minimal domain vocabulary,** explicit domain/format mappings, format alternatives and a compatibility profile baseline by media family; how much detail must be known to assert a verified edge.
   - *Draft:* `3d`, `image`, `video` and `audio`, with the formats and properties listed in the report. No domain or format is set for onset events.
   - Evidence is assigned per property, not per port.
3. **Path algorithm:** bounded hypergraph search versus explicit recipe templates for multi-input joins.
   - *Draft:* recipes first. No request needed search to find a verified route (estimated by reasoning, since no search ran).
4. **Licence assessment governance:** OSI policy and separate source/weights/assets/output checks.
   - *Draft:* owned by #75, including a reference-only label and an ADR for migrating legacy proprietary records.
5. **Evidence publication policy** and acceptable tolerances for nondeterministic renderers.
   - *Draft:* add a `fixture-reported` class for claims made only in prose, with no retained output. O8 and O13 fall into it.
6. **Index size and plugin distribution strategy** under current constraints.
   - *Draft:* INDEX.md does not grow. It has 242 B of headroom (observed 2026-11-04). Record bytes ship twice, once in `tools/` and once in `tools.json`.
7. **Workspace-local operation definitions:** whether they can shadow built-ins. Proposed: no; namespace and override explicitly. The spike did not exercise this.
8. **Review UI data contract,** strictly read-only until a separate ADR. The spike did not exercise this.

**Stable requirement identifiers.** Child issues quote these IDs. Each maps to parent requirements in [vcr-prd.md §6](vcr-prd.md).

| ID | Requirement | Parent | First issues |
| --- | --- | --- | --- |
| CG-01 | Each operation declares its own input and output ports with domain → format → profile. A record without ports is *incomplete*, never incompatible, and stays discoverable. | L0-01, L0-05 | #67, #69, #70 |
| CG-02 | Evidence class is recorded per claim or property: `retained-fixture`, `fixture-reported`, `documentation-only` or `unknown`. Each carries a date, scope, and the declared or observed version. Refinement never promotes a class. | L0-02 | #68, #74 |
| CG-03 | An absent field means `unknown`, never a wildcard. Supported, unsupported or excluded, conditional and unknown remain distinct values. | L0-05, L6-03 | #71 |
| CG-04 | A rejection names the conflicting property and lists alternatives with their own evidence classes. It never substitutes one silently. | L6-02 | #71, #73 |
| CG-05 | A join is shown as a route only when every required binding is bound. Otherwise the result is `INCOMPLETE_JOIN`. | L6-02 | #72, #78 |
| CG-06 | Technical compatibility, readiness (from doctor), policy and evidence scope are separate fields. | L0-02 | #75, #76 |
| CG-07 | Proprietary and paid-only tools are labelled reference-only and never appear as runnable steps. Legacy records migrate through an ADR. | L0-01, L0-05 | #75 |
| CG-08 | Route descriptions explain; they do not execute. Native toolkit commands stay usable without them. | L0-06 | #77 |
| CG-09 | A `retained-fixture` claim must cite retained outputs. Version and text drift is flagged without erasing earlier observations. | L0-02, L6-04 | #74, #79 |
| CG-10 | Disclosure stays bounded: INDEX.md does not grow, and per-request bytes are reported as observed or estimated (ADR 0004). | L0-05 | #69, #70 |

## 14. Delivery tracking: epic and atomic subissues

[Epic #65: Capability graph discovery, handoff evidence and route planning](https://github.com/conorluddy/vcr/issues/65) contains 20 native subissues with dependencies, definitions of done, verification and scope boundaries. CG0–CG7 are work-package phases refining §12's G0–G5, distinct from the plugin PRD's P0/P1 milestones.

| Phase | Independently useful deliverables | Issues |
| --- | --- | --- |
| CG0 — Prove the model | Representative handoffs, minimal contracts and a reviewed go/no-go ([report](spikes/capability-graph-g0.md), accepted 2026-11-04) | [#66](https://github.com/conorluddy/vcr/issues/66) |
| CG1 — Describe ports | One validated operation card; retained build123d/GLB/Blender handoff | [#67](https://github.com/conorluddy/vcr/issues/67), [#68](https://github.com/conorluddy/vcr/issues/68) |
| CG2 — Discover operations | Input/output domain filtering; format refinement and aliases | [#69](https://github.com/conorluddy/vcr/issues/69), [#70](https://github.com/conorluddy/vcr/issues/70) |
| CG3 — Assess a handoff | Format matching; required bindings/cardinality; one units rule; scoped evidence/freshness; free/open-source policy; doctor-based readiness | [#71](https://github.com/conorluddy/vcr/issues/71), [#72](https://github.com/conorluddy/vcr/issues/72), [#73](https://github.com/conorluddy/vcr/issues/73), [#74](https://github.com/conorluddy/vcr/issues/74), [#75](https://github.com/conorluddy/vcr/issues/75), [#76](https://github.com/conorluddy/vcr/issues/76) |
| CG4 — Explain known routes | One curated route; a fully bound fork/join; explicit verification of one reviewed fixture | [#77](https://github.com/conorluddy/vcr/issues/77), [#78](https://github.com/conorluddy/vcr/issues/78), [#79](https://github.com/conorluddy/vcr/issues/79) |
| CG5 — Discover alternatives | Bounded search; explicit ranking; incomplete-search/frontier diagnostics | [#80](https://github.com/conorluddy/vcr/issues/80), [#81](https://github.com/conorluddy/vcr/issues/81), [#82](https://github.com/conorluddy/vcr/issues/82) |
| CG6 — Learn from gaps | Retain/deduplicate requests; research two reproducible gaps to closure or justified proposal | [#83](https://github.com/conorluddy/vcr/issues/83), [#84](https://github.com/conorluddy/vcr/issues/84) |
| CG7 — Optional explorer | Generated read-only operation/route visualization | [#85](https://github.com/conorluddy/vcr/issues/85) |

Start with CG0. The release boundary follows the epic.

- **First release: #67–#77**, after the owner accepts the model decision. It covers CG1–CG3 and one curated route.
- **Follow-on: #78–#79.** These are the fork/join and the verification of one reviewed fixture.
- **Gated: CG5 and later.**
  - CG5 (#80–#82) needs a recipe/search comparison that justifies a planner. The G0 draft found none on R1–R8.
  - CG6 (#83–#84) follows usable route diagnostics.
  - CG7 (#85) requires a separate demand/go decision.

The G0 draft also suggests these changes:

- Fix the evidence labels before any schema work. Done in Step 1.
- After the observed B pilot, hold #67–#73 and #77 until a scope-match check exists, every evidence entry carries a version, date and scope, and an n>1 rerun favours operations data on correctness or unknowns. #74, #76 and the #75 ADR may proceed on existing tool records.
- When CG1 reopens, scope #67–#76 to the eight sampled records.
- Settle CLI naming in #67 together with #48 before implementation.

Evidence develops throughout, starting with retained observations rather than waiting for a new verification runner. No implementation has shipped merely because its issue exists.

Each implementation slice includes applicable index/plugin regeneration, deterministic builds, bounded output/help, three-root safety, validation and appropriate tests. Coordinate with existing [tool history #40](https://github.com/conorluddy/vcr/issues/40) and [command help #48](https://github.com/conorluddy/vcr/issues/48). Route descriptions do not implement the [cue/mux runtime #60](https://github.com/conorluddy/vcr/issues/60) or [batch renderer #62](https://github.com/conorluddy/vcr/issues/62).

## 15. Acceptance checklist for this PRD

- [ ] Confirms VCR remains an open-source-first tool suite, not a video-only framework.
- [ ] Respects ADR 0001 (in-house compositor), 0002 (headless/read-only UI), 0003 (plugin and three roots), 0004 (progressive disclosure and shared feedback).
- [ ] Distinguishes capabilities, tools, operations, media domains, formats, semantic profiles, ports, constraints, evidence and gaps.
- [ ] Defines progressive refinement of port descriptions, with evidence at every level and relevance separate from compatibility.
- [ ] Covers domain-only records, multiple facets, conditional format alternatives and per-port input/output filtering without inventing support.
- [ ] Explicitly handles multi-input operations, information loss, unknowns and provenance.
- [ ] Makes technical compatibility, installation readiness, licensing and verification independent.
- [ ] Keeps disclosure bounded and tool skills lazy-loaded.
- [ ] Distinguishes incomplete requests/search from no path within a declared search space.
- [ ] Outlines meaningful CLI, fixture, security, migration, measurement and release gates.
- [ ] Provides a research-before-build strategy for missing adapters/open-source tools.
- [ ] Does not claim the described graph or engine already exists.

**Open for review.** No production source, manifests, generated catalogue, CLI or plugin files are changed by this planning PR.
