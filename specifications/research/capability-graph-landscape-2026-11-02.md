# Capability graph PRD: current landscape review

Date: 2026-11-02. Status: review and recommendations, not an accepted architecture decision or implementation spike.

Reviewed [PRD v0.1](../vcr-capability-graph-prd.md) against `main` at `fd7fd28`, merged into this branch at `d637d69`, and the primary sources linked below. External documentation was checked on this date; moving documentation URLs do not establish installed versions or tested VCR support. No external tool was installed or evaluated by this review.

## Assessment

The direction remains useful: explain creative-tool handoffs with explicit semantic requirements and scoped evidence. Typed nodes and workflow graphs already have substantial prior art. VCR's proposed value is connecting native creative tools through a small, explainable catalogue of operations, preservation claims, prerequisites and observed failures. This is an assessment of the sampled systems, not a claim that no competing system exists.

Keep G0, but make it compare curated routes with bounded route search before committing to a general planner. Use VCR's existing handoff evidence as the starting point. Keep the remaining phases provisional.

The owner confirmed a free/open-source focus during this review. Runnable recommendations should work locally without required paid licences, subscriptions or metered APIs. The PRD's v0.2 records that scope; other architecture recommendations below remain proposals.

## What changed inside VCR

| Area | Current evidence | Implication for the PRD |
| --- | --- | --- |
| Catalogue | 146 tool records: 6 core, 88 catalogued, 52 candidates; 10 records reference validation evidence | Work from assessed operations and existing vocabulary. Catalogue breadth does not establish operation coverage. |
| Handoff evidence | [build123d fixture](../../examples/build123d-product/evidence.md): build123d 0.13.0 → GLB → Blender 4.4.0, with dimensions, orientation, winding, tessellation and transparent PNG checks | This is a real seed for an edge contract. It does not establish animation, material fidelity, Three.js support or a reusable adapter. |
| Assessment lifecycle | [Candidate ingestion](../../catalog/CANDIDATE-INGESTION.md), [fixture template](../../catalog/FIXTURE-EVIDENCE-TEMPLATE.md), and native asset checks now exist | Extend these contracts with operation/connection IDs instead of introducing a competing review and evidence process. |
| Agent ergonomics | [ADR 0004](../decisions/0004-agent-ergonomics-disclosure-and-feedback.md) specifies `agent_fit`, command conformance, measured disclosure and one `vcr verify` feedback surface | Reference the ADR, reuse its findings contract, and resolve the proposed `graph verify` naming. These ADR requirements are not all implemented. |
| Shipped CLI | Tool filtering/cards, examples, workspace initialization, capture, doctor and generated plugin packaging | No graph planner, generic verification command, timeline resolver or human review layer exists. |
| Production feedback | [AGENTS.md](../../AGENTS.md) defines `self-improvement` and `loop:*` issues; discovery also has a prospects inbox | Link gap records to source field notes and focused, deduplicated issues. Reuse discovery/assessment for knowledge gaps. |

There is documentation drift to resolve separately: ADR 0004 describes the index cap as removed, while `validate.ts` still enforces 16 KiB; the current index is 16,142 bytes. At review time AGENTS.md said nine records carried evidence, while ten did; that count was corrected during the v0.3 PRD revision. A graph must measure additional disclosure and packaging cost rather than assume spare capacity.

## External approaches and implications

| System | Documented capability | What VCR should take from it |
| --- | --- | --- |
| Common Workflow Language | CWL describes typed tools and workflows, required inputs, dependencies and requirements. Its abstract `Operation` has inputs and outputs without enough information to execute. | Compare the proposed operation model with CWL before creating another invocation language. Reuse concepts or preserve a future mapping; adopting its runner is a separate decision. [Workflow specification](https://www.commonwl.org/v1.2/Workflow.html), [abstract operations](https://www.commonwl.org/user_guide/topics/operations.html). |
| GStreamer | Pads advertise media capabilities, including fixed values, ranges and alternatives; negotiation distinguishes possible, allowed and negotiated formats. Pads can also be dynamic or requested. | Separate advertised profiles from concrete artifact profiles. Permit conditional ports and parameter-dependent transforms. A matching media label is insufficient. [Pads and capabilities](https://gstreamer.freedesktop.org/documentation/application-development/basics/pads.html). |
| ComfyUI, self-hosted core | The local core is free with a GPLv3 licence. Its typed connections include images, latents, masks, audio and custom types. Cloud and paid API nodes are separate offerings; the repository documents an offline mode disabling paid API nodes. | Compare the local core's contracts. Check model/custom-node terms and resources separately before proposing a runnable workflow. Model family and tensor shape need more than a shared port name. [Repository and offline behavior](https://github.com/Comfy-Org/ComfyUI), [licence](https://github.com/Comfy-Org/ComfyUI/blob/master/LICENSE), [datatypes](https://docs.comfy.org/custom-nodes/backend/datatypes), [cloud versus local](https://docs.comfy.org/get_started/cloud). |
| ComfyTy research | An October 2026 preprint proposes gradual refinement types for ComfyUI, constraining model families, geometry, modalities and quantization. | Directly relevant prior art for compatibility with unknowns. Study its constraints and diagnostics before designing inference. This review read the abstract; it did not reproduce the authors' results or assess implementation maturity. [Paper](https://arxiv.org/abs/2610.37673). |
| MCP | The current tools specification describes discovery, input schemas, optional output schemas, structured results and behavioral annotations. | These can supply interface metadata, but they do not themselves prove VCR media-preservation claims. A future metadata import should retain source/version/trust; it does not require an MCP server in VCR v1. [Tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools). |
| OpenTimelineIO / OpenUSD | OTIO supports adapter plugins with varying maintenance; USD supplies scene interchange, composition and extensible schemas. | Represent native interoperability routes and their limits. Do not rebuild timeline or scene interchange as graph infrastructure, or infer faithful round-tripping from format support. [OTIO adapters](https://opentimelineio.readthedocs.io/en/latest/tutorials/adapters.html), [USD introduction](https://openusd.org/release/intro.html). |
| Workflow Run RO-Crate | Profiles describe provenance of process and workflow runs, with implementations across workflow systems. | Compare evidence fields against established provenance models; a later export mapping may be sufficient. No need to add JSON-LD or another runtime for G0. [Project and profiles](https://www.researchobject.org/workflow-run-crate/). |

These sources support borrowing contracts, not claiming any of these tools is installed, validated or integrated into VCR.

## Changes recommended before approving G0

1. **Define the smallest useful result.** Given assets plus required semantic properties, explain a known route, its missing prerequisites, and exactly what evidence supports it. Benchmark that against the current index/card/guide workflow. A larger graph is not itself success.

2. **Return independent dimensions.** Technical compatibility, installation readiness, policy admissibility and evidence freshness should remain separate fields. A verified transformation may be unavailable on this machine; a technically compatible route may be excluded by policy. Derive summary labels without losing those reasons. Keep policy rejection separate from technical failure in gap reports.

3. **Specify profile propagation.** For G0, support only properties required by the fixtures. Express input requirements, output guarantees, preservation, loss and unknowns as parameter-dependent rules. Distinguish supported version ranges from versions actually tested. Do not carry a producer's guarantee across a transformation that has not declared it preserved.

4. **Distinguish search limits from missing capability.** Bounded search can fail because of depth, cost, time or incomplete metadata. Return a search status, limits and coverage; reserve claims about absent routes for the declared search space. A truncated search must not manufacture an engineering gap.

5. **Compare recipes with search.** Start with curated route templates, including a multi-input join, then test whether search discovers a useful alternative. Keep unknown costs explicit and use deterministic ranking/tie-breaking. A hypothetical route must never outrank a verified route merely because its setup or loss is unmeasured.

6. **Reuse evidence and feedback.** Extend the existing fixture template and ingestion lifecycle. Align verification findings with ADR 0004 and the review PRD. Separate immutable observations, current derived validity and human review decisions; `stale` and `regressed` need not erase an earlier successful observation.

7. **Apply the confirmed free/open-source scope.** Prefer locally usable open-source routes with no required paid service. Distinguish software licence, free local use, optional hosting and actual workflow dependencies. A free hosted tier alone does not qualify; an optional paid service does not exclude an independent open-source local core. Record requested use and unresolved conditions separately from technical compatibility; avoid making a complete dependency-rights audit a prerequisite for recording a plausible operation. Proprietary tools and paid-only services remain reference material.

8. **Reuse the production learning loop.** A gap should cite a concrete request, rejected constraints, workaround and source evidence. Search existing issues before proposing a follow-up. Route discovered tools through the prospects/ingestion process and production lessons through the existing feedback labels. Gap priority remains a proposal.

## Revised G0 recommendation

Time-box a comparison using 10–15 operations and three routes:

- build123d → GLB → Blender → PNG, based on retained evidence; explicitly leave untested materials/animation unknown.
- SVG/browser motion → captured frames → FFmpeg delivery, with alpha, dimensions and timebase requirements.
- WAV → analysis events, joined with graphics inputs → synchronized output; assess the analysis tool and event contract before claiming this route works.

Use owned synthetic inputs. Do not rerun tools or install dependencies merely to populate the graph. Existing evidence stays scoped to its original run; any new execution needs a fixture plan.

The exit report should show three explained routes, two deliberate incompatibilities, a join with every required input bound, an unknown property, stale evidence, a missing prerequisite and a deliberately exhausted search budget. Compare recipe and search results, report context/plugin size cost and authoring effort, and identify which useful answers the current catalogue could not provide. Stop before G1 if the extra contracts do not improve tool choice or handoff reliability.

## Branch verification

After merging `main`: `pnpm validate` passed (160 files, zero diagnostics); `pnpm test` passed (78 tests across 11 files); `pnpm typecheck` passed. This verifies the integrated repository baseline, not any proposed graph behavior or external system.
