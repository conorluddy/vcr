# Pillar extraction audit

Date: 2026-11-08. Status: discovery proposal, not approved architecture or an implementation plan.

## Outcome

The main gap is making workflows, not more reviewer agents. The bounded pillar layer deserves a deliberate extraction pass before further catalogue breadth becomes the main focus. This does not make provisional rules static or remove the need for measurements and calibration.

Nineteen pillar-specific subagents audited the pillars independently in batches: art, motion and pacing in the initial batch, then the remaining sixteen. Each read its routing README, selected knowledge-base sections and existing skills/agents; none edited files. This report consolidates those recommendations. It is a source audit, not an evaluation on productions, exhaustive rule coverage proof or calibration evidence.

Typography supplies a useful profile → make → check → report structure. Its current tool-specific passages and copied thresholds need cleanup before it becomes the extraction template.

## Artifact inventory and recommendations

Names below are proposals. Retain existing reviewers as advisory; no promotion or gate is implied.

| Pillar and source route | Making workflow recommendation | Agent recommendation |
| --- | --- | --- |
| [Typography](../../references/typography/README.md), KB §12; captions §9c–9d, §15.5 | Refine existing `typography`; conditional `captions` candidate, not another general skill | Retain `typographer` |
| [Art direction](../../references/art-director/README.md), §15; identity §7–8, §11 | New `art-direction` | Retain `art-director` |
| [Motion](../../references/motion-director/README.md), §14; identity §11, checklist §19 | New `motion` | Retain `motion-director` |
| [Pacing](../../references/pacing-editor/README.md), §15; rhythm/load §3–5, checklist §20 | New `pacing` | Retain `pacing-editor` |
| [Critique](../../references/critique-methodology/README.md), §4, §7–11 | One shared `review`, aligned with planned plugin P4 | No general critic/coordinator agent |
| [Sound](../../references/sound-design/README.md), §15; task routes §2–9, checklist §20 | New `sound-design` | Retain `sound-designer` |
| [Accessibility](../../references/accessibility/README.md), §13; review §11–12, checklist §19 | New `accessibility` | New draft `accessibility-reviewer`, with explicit measurement limits |
| [Series brief](../../references/series-brief/README.md), §5.2–6, §11, §16.2 | Extend existing `brief` with series invariants, variation and continuity | No new agent |
| [Delivery](../../references/delivery/README.md), §13.1–13.2; QC §8, checklist §15 | New `delivery` | Defer reviewer until #144; reassess whether one adds value |
| [Story](../../references/story/README.md), §13; script/plan/boards §3–7, checklist §18 | New `story` | Retain and extend `story-editor` coverage |
| [Data visualisation](../../references/data-visualisation/README.md), §11; encoding/integrity §1–7, checklist §16 | New `data-visualisation` | Retain `data-visualiser` |
| [Adaptation](../../references/adaptation/README.md), §13; transformations §1–5, matrix §7, checklist §17.2 | New `adaptation` | Retain `version-auditor` |
| [Image treatment](../../references/fx/README.md), §15; task routes §1–8, checklist §20 | New `image-treatment` | Retain `compositor` |
| [Lighting](../../references/lighting/README.md), §16; task routes §1–10, checklist §21 | New lighting workflow; packaging decision below | Retain shared `look-developer` |
| [Materials](../../references/materials/README.md), §14; task routes §1, §3–5, §7–8, checklist §17 | New materials workflow; packaging decision below | Retain shared `look-developer` |
| [Domain exploration](../../references/domain-exploration/README.md), §7; scope §1, opportunities §5 | No standalone skill now; improve research commissioning in `brief` | Retain `domain-researcher` |
| [Visual research](../../references/visual-research/README.md), §5–7 | No standalone skill now; improve research commissioning in `brief` | Retain `visual-researcher` |
| [Cultural context](../../references/cultural-context/README.md), §5–8 | No standalone skill now; improve research commissioning in `brief` | Retain `cultural-reader` |
| [Image direction](../../references/image-direction/README.md), §7–8, templates §10 | No standalone skill now; improve research commissioning in `brief` | Retain `image-director` |

This proposes thirteen new workflow skills if lighting and materials remain separate, two existing skill extensions, and one new advisory reviewer. Captions is conditional and excluded from that count. These are candidates, not a quota or a single implementation batch.

## Candidate triggers and handoffs

All production decisions and outputs belong in the selected workspace. Reuse existing briefs, `beats.json`, scene contracts, research notes and render/finding records. The following outputs do not introduce schemas or mandatory files.

| Workflow | Trigger and inputs | Useful output |
| --- | --- | --- |
| Art direction | Choose/revise visual language; brief, focal intent, research and series references | Palette roles, visual invariants, composition/style frames and cross-pillar handoffs |
| Motion | Design/revise movement; brief, key poses, markers, fps and asset coverage | Motion specification, choreography and inspected frame ranges; `MOTION-SIG-001` |
| Pacing | Fit content to duration or resolve rushed/dragging edits; approved content, beats and timing evidence | Revised beat durations, screen/narration allocation and justified holds |
| Review | Review, triage findings or compare revisions; brief, retained render, checks and open findings | Deduplicated findings, conflicts, revision evidence and questions for human decision |
| Sound design | Plan/revise narration, music, cues or mix; script, markers, provenance and stems | Sonic direction, cue notes, produced audio and measured/manual verification limitations |
| Accessibility | Plan access requirements or variants; brief, script, essential information and timing evidence | Caption/description requirements, redundant encodings, reduced-motion and alternative-text decisions |
| Delivery | Prepare final files or diagnose encoded defects; targets, masters, files and sidecars | Export decisions, supplied variants and QC evidence; no parallel manifest |
| Story | Develop selected route into a buildable plan; brief, research, claims and feasibility | Script, existing beat sheet, board requirements and blocking/animatic evidence |
| Data visualisation | Turn a quantitative claim into visuals; data, provenance, task and uncertainty | Encoding rationale, valid rest/transition states, annotations and optional scene `data` handoff |
| Adaptation | Plan or revise a version set; master, matrix, locales and mandatories | Per-version editorial/layout decisions and QC evidence keyed by version |
| Image treatment | Design/revise a treatment stack; art direction, selected assets and delivery context | Layer/temporal treatment decisions, derivatives and encoded-survival evidence; existing `fx` handoff |
| Lighting | Design/revise illumination, exposure or simulated light; art intent, geometry/regions and surface response | Lighting decisions, rig specification, representative frames and temporal tests |
| Materials | Design/revise surface appearance or interchange; references, scope, textures and lighting context | Material/texture interpretation, scope tags and appearance/export tests; `MAT-PHYSICAL-SCOPE` |

The `brief` extension should cover fixed recognisers versus permitted episode variation, continuity and affected-video handoffs. Its research branch should state the unresolved decision, commission the appropriate existing researcher, pass prior records and return selected decisions to the brief. The four research agents already contain substantive creation procedures; four more skills would largely duplicate them.

## Consolidation decisions

1. **Making and review remain distinct.** A skill guides the author; an independent specialist reviews evidence. Self-checking is useful but is not independent review or human approval.
2. **Brief → story → pacing is a handoff, not three competing planners.** Brief owns constraints and route selection; story develops meaning, script and narrative order; pacing allocates time and rhythm. All work on the existing plan rather than create parallel planning formats.
3. **Research presents options; craft chooses.** Domain owns subject synthesis, visual research formal precedents, culture audience readings, and image direction actual imagery selection. Art/story select the response; the brief records it.
4. **Image direction → art/FX/motion has explicit ownership.** Image direction establishes placement and motion feasibility; art sets treatment intent; FX executes treatment; motion choreographs. This does not imply a shared compositor.
5. **Adaptation owns transformations; delivery owns file compliance.** Owner pillars retain their rules for every version. Missing matrix-wide automation means checks remain per version.
6. **Accessibility fills an actual reviewer gap.** Its proposed reviewer covers access requirements and evidence completeness. It cannot certify flash safety, vestibular safety or conformance from visual judgement; unavailable or unvalidated measurement means unable to assess.
7. **Lighting/materials packaging is unresolved.** The lighting audit favours separate selectively loaded skills, including simulated 2D lighting. The materials audit favours one `look-development` entry with separate branches to coordinate iteration. Proposed next test: outline both branches and evaluate lighting-only, materials-only and combined requests for routing and context cost. Do not add a new agent either way.
8. **Keep specialists inside routed workflows initially.** Palette, springs, cameras, hooks, captions, grain, music and localisation do not each require a new skill. Captions has an existing documented candidate but needs distinct usage/trigger evidence.

## Prerequisites and concrete cleanup leads

These are audit observations, not fixes applied in this change. Resolve each against current owner rules and implemented contracts when touching that pillar.

| Area | Cleanup or dependency |
| --- | --- |
| Shared sequencing | ADR 0006 puts data/checks before skills; ADR 0007 only exempts draft agents. Early advisory making skills require an explicit decision extending that exception. This report does not make it. |
| Shared extraction | Remove copied thresholds, catalogue-tool recipes, dropped rule IDs and obsolete blocker policies from extracted artifacts. Cite current owners; follow the shared reviewer contract. |
| Typography | Skill/agent contain tool-specific guidance and copied limits; contextualise the agent's blanket default-font criticism. `skills/README.md` contains obsolete TODOs. |
| Art | Minimum stroke width lacks a named rule; heuristics remain uncalibrated. Do not turn production-specific advice into general rules. |
| Motion | No motion measurement command exists; manual evidence must say what it measured. #147 and accessibility motion-rule gaps remain dependencies. |
| Pacing | KB §15 says no reviewer exists; §20 implies unavailable lint and retains dropped rules. `PACE-READ-05/06` lack reviewer coverage; narration alignment needs word timings. |
| Critique | KB §10's prompt/output sketch differs from the shared contract; aggregation fields and broader lint coverage are proposals. Research-pack review has no implemented finding contract. |
| Sound | #60 cue-list contract and sound checks are absent; resolve narration-rule inconsistencies and sync assumptions. Existing reviewer cannot hear; human listening remains needed. |
| Accessibility | KB §13 implies unavailable analysers; §12's blocker/severity policy is not the current contract. Flash analysis #145 must be validated before any safety gate. |
| Series brief | Clean obsolete severity/check claims and dropped IDs. Reconcile scene metadata assumptions. Remove the README's production-specific fictional example in a focused cleanup. |
| Delivery | #144 is not implemented. Metadata alone cannot establish decoded-signal correctness or quality. Remove dropped caption rule and universal rerender claims; verify current destination requirements when used. |
| Story | #173 plan approvals remain unavailable. `brief` cites dropped `STORY-SMP`; reconcile route scoring with current critique guidance. Reviewer omits `STORY-MUTED-LEGIBLE` and `STORY-LOOP-SEAM`. |
| Data | No geometry/data check exists; sub-frame overshoot measurement remains future work. Replace implied automatic checks with declared manual procedures. |
| Adaptation | Creation checklist still mentions obsolete `mandatory`/`manifest()` scene members. No matrix-wide command or pseudo-localisation automation exists. |
| FX | No general FX check suite; cost evidence depends on #58. Capture verification is evidence-specific, not proof of every determinism authoring rule. |
| Lighting/materials | No automatic pillar checks. Reconcile tone-map owner references, implied automation and old severity policies. Only settled scope metadata should be treated as schema-backed. |
| Domain | Reconcile older KB field sketches with shared `research-handoff.md`; distinguish existing advisory integration from absent automation. |
| Visual research | Reconcile agent's broad few/uncommon reference preference with purpose-dependent selection; align record fields with shared handoff. |
| Culture | Agent's bespoke JSON omits parts of the shared Reading C record; reconcile without creating a second contract. Research observations are not render findings. |
| Image direction | Clarify Selection I versus richer templates and illustrative manifest links. Structural image checks and an asset-manifest schema are not shipped. |
| Agent status | Several agents warn that already descriptive rule IDs will be renamed. Separate rule naming from provisional maturity instead of repeating a blanket warning. |

## Proposed small-step extraction order

This is a proposed knowledge-work track alongside the existing engineering roadmap, not a replacement of that roadmap.

1. Decide whether advisory making skills may precede checks. Define one compact extraction contract: trigger, profile, make, self-check, handoff, uncertainty and selective reference routes. Do not copy typography's implementation drift.
2. Clean typography as the reference implementation; extend `brief` with explicit research commissioning and series variation. Reconcile shared research-record handoffs without adding schemas prematurely.
3. Pilot **art direction only**. Review its trigger boundaries, context size and usefulness on an existing production before extracting the next skill.
4. Extract story, pacing and motion one at a time, checking their handoffs and reuse of `beats.json`. Do not wait for every pillar to be complete before exercising them.
5. Extract accessibility and draft its missing reviewer with explicit unavailable-measurement outcomes; then sound and delivery workflows, scoped around the current check/cue limitations.
6. Extract adaptation, data visualisation and image treatment; settle lighting/materials packaging through the routing test before extracting them.
7. Build the shared `review` workflow in coordination with plugin P4. A smaller CLI-only draft could come earlier only if its limited scope and sequencing are explicitly decided; do not imply review pages, Compare or blind-packet assembly exist.

For each implementation slice: fix relevant source drift, cite current rule owners without copying thresholds, keep production choices in the workspace, evaluate routing and a representative task, rebuild generated plugin output, run validation and document what remains manual. Reviewer promotion still depends on measurements and calibration (#148–#150), not completion of this extraction list.

No new skills, agents, rule data, checks, schemas or architectural decisions were created by this audit.
