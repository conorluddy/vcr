# Other batch: raw trial observations

Executed against the draft workflows and raw requests on 2026-11-08. Expected files and evaluation README conclusions were not consulted. This is a single evaluator's recorded response, not a calibrated or independent model comparison. Output artifacts are in ignored `output/pillar-evaluation/other/`; retain them separately if needed. Inputs were text descriptions except for the supplied SVG. No production media was available, and no playback, encoding, measurement or VCR checks were performed.

## Routing responses

The classifications below follow each raw list's order: P = primary workflow, N = neighbouring handoff, U = unrelated primary task.

| Workflow | Responses | Reason |
| --- | --- | --- |
| Data visualisation | P, N, U | Chart encoding belongs to data; narrative to story; file QC to delivery. |
| Image treatment | P, N, U | Treatment owns the stack; image direction selects assets; story owns narration. |
| Lighting | P, N, U, P+N | Lighting owns illumination; materials owns surfaces; story owns script; joint diagnosis needs both owners. |
| Materials | P, N, U, P+N | Materials owns response; lighting owns illumination; delivery owns file QC; joint diagnosis needs both owners. |
| Accessibility | P, N, U | Access equivalents are primary; typography sets captions; delivery selects export. |
| Sound design | P, N, U | Sound owns cues and voice space; accessibility owns caption access; data owns chart axes. |
| Delivery | P, N, U | Delivery owns export/QC; adaptation owns matrix; story owns script. |
| Adaptation | P, N, U | Adaptation owns variants; delivery owns encoded QC; story owns argument. |
| Review | P, N, U | Review triages findings; sound owns mix revision; story owns script. |

## Task observations

| Workflow | Creation artifact | Revision artifact |
| --- | --- | --- |
| Data visualisation | `data-creation.md` and `.svg`: two zero-baseline bars with supplied labels; units, source and time relationship unknown. | `data-revision.md` and `.svg`: changed B label 16 to 18; other SVG attributes retained. Both SVGs parsed as XML, but were not visually rendered. |
| Image treatment | `image-treatment-creation.md`: proposed source-preserving monochrome/grain stack; source rights and moving output unresolved. | `image-treatment-revision.md`: alpha/mask investigation; cause and fix unverified without files. |
| Lighting | `lighting-creation.md`: provisional broad left key/fill specification; exact rig and output transform missing. | `lighting-revision.md`: targeted sweep comparison over label; no sequence to inspect. |
| Materials | `materials-creation.md`: stylised satin scope and texture interpretation; no assets or target. | `materials-revision.md`: compare normal conventions under matched conditions; no files to establish cause. |
| Accessibility | `accessibility-creation.md`: visible values/comparison and caption/description plan; no actual access verification. | `accessibility-revision.md`: stable comparison retaining labels; no video or safety measurement. |
| Sound | `sound-creation.md`: voice/cue plan and muted information; asset, sync and loudness unknown. | `sound-revision.md`: compare stems and test local music reduction; no audio or listening evidence. |
| Delivery | `delivery-creation.md`: destination-dependent export and QC checklist; no export. | `delivery-revision.md`: matched decode, metadata and conversion test plan; reported shift not observed. |
| Adaptation | `adaptation-creation.md`: four expected aspect/language cells; French and actual files absent. | `adaptation-revision.md`: preserve qualifier through recomposition and selective cutdown; no media to test. |
| Review | `review-creation.md`: request retained media and checks; no finding or approval. | `review-revision.md`: F1 evidence plan and candidate fix; no revised render and no resolution. |

## Reviewer and cross-pillar handoffs

`reviewer-captions.md` reports that matching plain speech text cannot establish meaningful-sound coverage or timing. `reviewer-motion.md` cannot assess flash safety from verbal still descriptions or check an absent reduced-motion variant. `reviewer-visual.md` identifies that the supplied description omits the supplied values but has no frame or time for a filed finding. Each is advisory, has an escalate verdict and an empty findings array rather than fabricated location or measurement.

`handoff-appearance.md` separates lighting, material and treatment diagnosis; `handoff-adaptation-delivery-review.md` identifies missing files, destination and retained renders; `handoff-narrative.md` records the story, data and sound decisions while flagging the unsourced claim. These are handoff notes only, with no implemented checks or completed production output implied.

## Comparison with withheld expectations

Compared after recording the responses. **Met** means the stated observable expectation appears in this trial; **unmet** identifies an omission in the response; **unable to assess** means the expected production evidence was unavailable. These labels do not establish general usefulness, safety, calibration or deployment readiness. The promotion-decision column indicates whether these narrow cases provide enough evidence to consider the draft, not whether promotion is approved.

| Workflow | Routing | Creation / revision | Readiness for promotion decision and required follow-up |
| --- | --- | --- | --- |
| Data visualisation | Met | Met for supplied values, zero baseline, label correction and provenance; units unable to assess because the input supplies none. | Consider with caveat: ask for units explicitly and add a fixture with source and units to test their accurate transfer. |
| Image treatment | Met | Creation **unmet**: layer order, blend space, attachment, repeatability and rights were covered, but mask choice was not specified. Revision met as a bounded diagnostic, with encoded result untested. | Address the mask omission and repeat a creation task with an actual asset before a promotion decision. |
| Lighting | Met for classification; joint diagnosis only partially evidenced in the routing response. | Creation **unmet**: direction, softness and fill were specified, but exposure was deferred without a working assumption. Revision met as a proposed comparison, not a verified fix. | Add an explicit exposure approach and test controlled lighting/material isolation against actual frames before a promotion decision. |
| Materials | Met for classification; joint diagnosis only partially evidenced in the routing response. | Creation met. Revision **unmet**: normal convention and matched-light comparison were covered, but interchange feature support was not explicitly checked. | Add interchange support to diagnosis and repeat against source/reimport files before a promotion decision. |
| Accessibility | Met | Met as plans for equivalent labels, sound treatment, description and reduced-motion information. Actual caption accuracy, playback and safety unable to assess. | Consider the draft with a real deliverable and human accessibility review still required. |
| Sound design | Met | Met as cue and mix plans; sync, listening and measured audio unable to assess. | Consider the draft after a trial with actual stems and listening evidence; this case establishes planning only. |
| Delivery | Met | Creation **unmet**: preserving native frame rate was not stated explicitly, although the master metadata was recorded. Revision met as an unverified diagnostic. | Explicitly preserve or justify changes to source timing, then test against a real target specification and files before a promotion decision. |
| Adaptation | Met | Creation met. Revision **unmet**: qualifier and selective retiming were covered, but per-cell checks were not explicit. | Add a per-version verification handoff and trial a real portrait/cutdown before a promotion decision. |
| Review | Met | Creation **unmet**: the human decision was named, but the applicable checks and specialist were not identified concretely. Revision met as a proposed evidence plan, without addressing or resolving F1. | Name applicable implemented check scope and reviewer in a repeat with an actual retained render and finding; no approval inference. |

The omitted details above are observations about these trial responses, not proof that the draft text lacks the instruction: for example, the materials and delivery drafts already mention interchange and native timing. The owning worker should inspect whether task wording, draft guidance or evaluator execution caused each omission before editing the drafts.

| Additional case | Outcome | Remaining evidence |
| --- | --- | --- |
| Accessibility reviewer: captions | Met for matching supplied speech and identifying missing sound evidence; human approval separation was implicit, not stated. | Audio or authoritative annotated transcript, timed captions and human decision. |
| Accessibility reviewer: motion | Met for inability to assess and missing sequence/variant; human approval separation was implicit. | Decoded temporal evidence, validated measurement and human decision. |
| Accessibility reviewer: visual | Met for omitted values and proposed equivalent description; human approval separation was implicit. | Video, timing and human decision. |
| Appearance handoff | **Unmet**: distinct responsibilities and isolation were proposed, but the treatment stack and controlled joint comparison were not sufficiently specified. | Repeat with a concrete stack, matched comparison conditions and actual frames. |
| Adaptation → delivery → review | Met for requested aspect cells, missing outputs, target-dependent checks and human decision. | Actual versions, target requirements and retained renders. |
| Narrative → data → sound | Met for claim, beats, encoding, cue intent and silent visual equivalent; source and audio gaps identified. | Source evidence, timing and audio assets. |

The reviewer cases are suitable for a promotion **decision** only as evidence of conservative handling of missing inputs; they do not test finding-field quality against actual media or reviewer calibration. Repeat with timed evidence and explicitly state human-only approval.

## Lighting and materials packaging recommendation

Keep separate draft entry points for lighting and materials for the next test: focused routing identified distinct owners, and the joint task preserved both responsibilities. The joint response did not spell out controlled comparisons well enough to validate the handoff in practice. Test a shared scene with matched light, surface and output settings before settling packaging or promotion; this small text-only routing exercise is not decisive production evidence.

## Targeted revision and fresh trial

After the first comparison, the six affected drafts received short reminders for mask coverage, exposure and controlled light/surface comparisons, interchange support, native timing, per-cell checks and concrete review selection. Fresh responses to both raw tasks for each workflow, plus the appearance handoff, are in ignored `output/pillar-evaluation/other-rerun/`. The same text-only inputs were used; no output was rendered or measured. One rerun was needed.

| Case | Comparison with expected observable outcomes | Remaining limitation |
| --- | --- | --- |
| Image treatment creation and revision | Met: mask and coverage, layer order, blend space, attachment, repeatability and rights are named; revision isolates mask/alpha and preserves other layers. | Actual source, composite and encoded frames unavailable. |
| Lighting creation and revision | Met: exposure approach, light direction, fill and output assumptions are stated; revision proposes a matched sweep comparison and typography handoff. | No sequence, numerical exposure or safety evidence. |
| Materials creation and revision | Met: stylised scope and texture interpretation are stated; revision checks target feature support and normal convention under matched conditions. | No target format, textures or source/reimport files. |
| Delivery creation and revision | Met: preserve native timing, obtain destination requirements and sidecar, separate metadata from decoded checks; revision tests conversion without asserting cause. | No destination or media; no export or QC performed. |
| Adaptation creation and revision | Met: four cells and qualifier are identified; revision explicitly plans checks per affected cell. | Translation and actual cells are unavailable; checks not performed. |
| Review creation and revision | Met: names supported browser `vcr lint` scope and typographer, and keeps revision evidence and human resolution separate. | R1 and revised render unavailable; check and review are planned only. |
| Appearance handoff | Met: describes a treatment stack and controlled light-versus-surface comparisons under fixed output conditions. | No scene or frames to demonstrate the comparison. |

These fresh responses close the observed text-case omissions. They remain a single evaluator's responses to small fixtures; they do not establish production performance or reviewer calibration. The separate lighting/materials recommendation remains provisional until a shared-scene test.
