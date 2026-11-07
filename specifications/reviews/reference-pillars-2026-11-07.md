# Review of the 19 reference pillars

Date: 2026-11-07. Scope: repository guidance, reference routing, candidate-rule tables, overlapping ownership, measurement methods, implementation claims and evidence caveats. This is a review and follow-up record, not an architecture decision or a new release gate.

The corpus has broad coverage and useful reciprocal handoffs. The next improvement is making a rule safe to use in isolation: its owner, scope, evidence limits and implementation status must survive retrieval. Adding more cross-links alone will not do that.

All 19 pillar READMEs were reviewed, alongside relevant knowledge-base sections and rule tables. Targeted primary-source checks covered accessibility distinctions, blend-specification scope and frame inspection. This was not a re-verification of every citation, platform specification, legal statement or empirical finding. Source ledgers retain their original uncertainty unless a correction below explicitly says otherwise.

## Closeout (2026-11-07)

The repository fixes from this review are implemented. The findings below are retained as the original assessment; this table records their current disposition.

| Item | Resolution |
| --- | --- |
| R1 | Single-rule output now retains extra source/measurement columns, candidate status, README/evidence routing and explicit replacement IDs. Superseded rows no longer publish their former numbers as active thresholds. Named A11Y IDs are no longer misclassified as numbered drafts. Current Story plan checks are identified separately. |
| R2 | Retired duplicated dwell/caption/rate rows route to owners. Key-text hold has a TYPO-HOLD floor. Beat alignment routes through Sound, colour conformance through Art, and the shared handoff defines metric scope and advisory treatment for uncalibrated conflicts. No unsupported numeric calibration is claimed. |
| R3 | Added a primary-source recheck addendum to Domain §14.3 and source-backed camera guidance. Shared evidence policy requires claim-specific read extent and rechecking consequential/current claims. Remaining partial sources are explicitly unresolved and cannot establish conformance or automatic gates. A full bibliography re-verification and human calibration remain empirical work, not completed evidence. |
| R4 | Both canonical brief consumer enums accept the four new pillar slugs, with acceptance/rejection tests and brief-workflow guidance. Lighting/material blocks remain explicitly untyped workspace notes. |
| R5 | Shared research-handoff document assigns source, observation, finding, audience reading, selection and asset metadata to one responsibility each. This is a convention, not an invented asset schema. |
| R6 | Camera direction now extends Image Direction, with viewpoint/lens, shot scale, focus, eyeline, continuity and cross-pillar ownership guidance. Primary-source passages were read; no twentieth pillar or new threshold is introduced. |
| R7 | Added a placeholder-only quick/deep worked handoff including a rejected candidate, an unresolved assumption and revised brief decision. Render evidence stays blank until an actual production exists. |
| R8 | Repository validation now checks exact IDs, replacement targets, duplicates, local file targets and table section routes. Tests mutate references to prove failures are caught. Section extraction now ignores headings inside fenced examples. |

Unresolved source passages, real-production trials and human calibration are preserved as evidence limits. They must not be represented as passed checks or completed research. The reference-only pillars remain usable as advisory guidance within those limits.

## Corrections made in this review

| Area | Correction | Basis |
| --- | --- | --- |
| Accessibility / typography | Removed the shared claim that a 5th-percentile frame contrast method establishes the canonical contrast check. Marked glyph/ring medians and percentiles as experimental diagnostics; local failures must remain visible. | `TYPO-CONTRAST` in [canonical data](../../references/typography/rules.json); [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). |
| Accessibility | Distinguished Level A media alternatives from Level AA audio description and replaced the token-union coverage rule with a scoped semantic review. Removed the claim that only flashing can cause physical symptoms and clarified the unimplemented analyser boundary. | [W3C audio description](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html), [media alternatives](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html), [motion](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) and [flashing](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html). |
| Sound | Relabelled the video voice/bed LU target as heuristic in the rule itself; removed the stale instruction to wait for the accessibility pillar. | [W3C 1.4.7](https://www.w3.org/WAI/WCAG22/Understanding/low-or-no-background-audio.html); Sound §2.1 already distinguished the source's scope. |
| Series brief / critique | Capped taste at `note` in prose, rule and checklist. A finding without a brief path may still have a measured or sourced rule basis. | [Finding contract](../vcr-plugin-prd.md#64-review-data-contract) and [finding schema](../../catalog/schemas/finding.schema.json). |
| Art | Corrected unverified safe-area candidates labelled as platform requirements; pointed them to `TYPO-SAFE`. Exposed the unresolved stroke-width conflict in the rule row and separated range convention from tolerance. | [Owner table](../../references/README.md), [Art open decisions](../../references/art-director/README.md), canonical typography presets. No new threshold chosen. |
| Motion / pacing | Marked UI-to-video easing transfers heuristic, clarified applicability, repaired ambiguous motion accessibility IDs, and changed the pacing example and creation steps to cite the owning hold/rate rules. | Motion §20; [Pacing ownership](../../references/pacing-editor/README.md). |
| Delivery | Scoped the headline SDR profile to its destination; separated metadata, container, timing and decoded-frame checks. | Delivery §§2, 8; [FFmpeg frame-processing implementation](https://github.com/FFmpeg/FFmpeg/blob/master/fftools/ffprobe.c). The FFmpeg documentation site timed out during this check. |
| FX | Replaced “every blend mode” with the common set defined by the W3C draft; matching names do not establish equivalent output. | [Compositing and Blending Level 1](https://www.w3.org/TR/compositing-1/). |
| Adaptation / data | Allowed authored re-edits and sibling masters, consistent with Adaptation §1.1. Clarified that state-transition interpolation is not an observed data-time value, consistent with Data §6.2. | Internal contradictions between headlines and detailed guidance. |
| Research siblings | Corrected stale claims that sibling pillars do not exist. Distinguished generated imagery as an artefact that can be studied from evidence of the depicted subject. | Existing research ownership and read-status conventions. |
| Image direction / culture | Allowed purposeful ambiguity while retaining review of competing readings. Qualified the transfer of instructional decoration studies. Made full-motion coverage require more than start/middle/end samples. | Culture §§2, 5; Image §§1, 5, 15. |
| Brief / story maturity | Corrected the claim that the brief consumer enums cover all pillars; marked interchange adapters and plan approvals as unimplemented. | [Brief schema](../../catalog/schemas/series-brief.schema.json), [Story README](../../references/story/README.md), current CLI. |
| Shared routing | Added decision-based selection: productions need only the relevant pillars, and research can reopen an earlier decision. | Progressive disclosure and existing workspace/brief ownership. |

## Original findings, in priority order

### R1 — High: rule lookup loses ownership and evidence context

[`rulesFromTable` and `formatPillarRule`](../../packages/cli/src/references.ts) expose the first five table columns. They do not carry supersession, an implementation state, measurement limits, or the additional source/evaluation columns used by the new research pillars. Numbered IDs get a draft warning; named research IDs do not get equivalent maturity metadata.

For example, `vcr rules info PACE-READ-01` still returns the old dwell formula even though the owner table says to drop it in favour of `TYPO-HOLD`. A reader who follows progressive disclosure can therefore receive the wrong authority without seeing the README. Some high-risk rows were corrected directly in this review, but the general problem remains.

The draft-ID detector also treats any digit anywhere in an ID as a numbered draft. This incorrectly labels named `A11Y-*` rules as needing renaming because their prefix contains `11`. Inspect the suffix after the registered prefix instead.

**Next step:** make ownership and lifecycle explicit in rule data/disclosure, preserving aliases for retired draft IDs. A superseded lookup should identify its replacement and avoid presenting the old threshold as current. A reference-only rule should disclose that status and point to its evidence and measurement caveats. Do this before distilling more skills or reviewer agents.

### R2 — High: shared thresholds and measurement definitions still disagree

The owner table settles responsibility, but many legacy rows, prose examples and checklists still repeat different values:

- Art's fine-detail proposals use 4 versus 6 px; palette tolerances differ between Art and Brief. These need calibration and declared viewing/encoding conditions, not an arbitrary merge.
- Sound, Motion and Pacing use different beat-alignment tolerances. Sound's README proposes a shared pass/minor treatment, but that decision is not yet canonical data.
- Pacing's key-text hold needs an explicit lower bound of `TYPO-HOLD`; its current table still exposes its independent formula.
- [Plan checks](../../packages/cli/src/plan-check.ts) use a 175 wpm ceiling and whole beat duration. Sound's table uses a target band, a separate warning threshold, and a rendered measurement that excludes some pauses (§18). These can be different metrics, but they must be named and explained so a plan pass is not mistaken for a mix pass.
- Several tier strings mix standards, vendor profiles and heuristics. Typography even has style/process labels outside the three shared tiers. Normalise source basis separately from verification and judgement when rules data is revised.

**Done when:** each shared metric has an owner, units, scope, measurement interval and declared default; duplicates route to it; plan/render differences are explicit; uncalibrated defaults remain advisory.

### R3 — High: source support needs a claim-by-claim refresh

“Confirmed” currently includes full-page inspection, abstracts, snippets, secondary summaries and computed results. The four new reports disclose this, but their opening summaries sometimes sound stronger than the ledgers. Older pillars have the same problem.

Prioritise claims with consequences for implementation or delivery:

1. Accessibility's flash-area/display assumptions, broadcast profile differences and legal/service applicability (§§1, 10, 17, 21). This review did not validate a flash algorithm or refresh legal claims.
2. Typography safe zones and caption profiles; Delivery and Adaptation platform rules by upload route. Do not reconcile different surfaces into one universal profile.
3. Motion UI-token claims and Lighting/Materials version-dependent renderer facts. Keep recipes and version checks in toolkit guides during distillation.
4. Empirical claims used to justify creative restrictions: fixation, cultural recognition, decorative imagery, saliency and review-model agreement. Preserve population, task, outcome and limits of transfer.

**Next step:** split grouped ledger rows and retain the exact claim, source locator, read extent, verification basis, source/access dates and refresh trigger. Re-read consequential primary passages; mark inaccessible ones unresolved. Reading an abstract verifies only what that abstract supports. This is a sourcing task, not a request to add more prose.

### R4 — Medium: the brief cannot name the four new research consumers

Both `mandatories[].consumers` and `preferences[].consumers` in [the schema](../../catalog/schemas/series-brief.schema.json) enumerate the older craft/review consumers only. Naming Domain Exploration, Visual Research, Cultural Context or Image Direction fails schema validation. The README now states this limitation.

Lighting and Materials also describe future brief blocks as if adding them to the existing schema were settled work; those typed blocks are not present. Permissive extra properties should not be confused with validated support.

**Next step:** agree consumer names, extend the actual schema and its fixtures, and update the brief workflow. Keep research packs in workspace notes until their intended structure is decided. Do not expand the old schema sketch in the knowledge base as though it were canonical.

### R5 — Medium: provenance and research metadata remain duplicated proposals

Domain, Visual Research, Culture and Image Direction each propose source IDs, locators, dates and workspace paths. Sound, Lighting, Materials and Image Direction also propose asset rights records. The owner table reserves one shared manifest concern, but there is no implemented common asset-manifest rule.

**Next step:** make a deduplication map before rules data: generic source evaluation belongs to Domain; observed features and transfer belong to Visual Research; audience readings and recheck triggers belong to Culture; selection and derivative handoff belong to Image Direction. Rights/provenance attach to the shared asset record. A source record, an observation, an audience hypothesis and a selected asset are different things even when they point to the same file.

### R6 — Medium: camera and photographic direction is a substantive coverage gap

Image Direction asks for viewpoint, perspective, crop and motion coverage; Motion covers camera movement and judder; Lighting covers illumination; Story covers boards. There is little dedicated guidance on lens/viewpoint relationships, camera height, focus and depth of field, shot scale, screen direction, eyelines or continuity coverage. A targeted corpus search found depth of field only as a measurement caveat, not a creative method.

**Next step:** research camera/image-making direction and establish its boundary with Image Direction, Story and Motion. This may become an extension or a separate reference; this review does not decide the architecture. It is a more specific missing capability than adding another broad creativity pillar.

### R7 — Medium: the combined method needs a small worked example

The new pillars have useful isolated templates and abstract chains, but there is no compact worked handoff through the entire set: brief question → source observation → reference principle → audience hypothesis → image choice → concept/plan → rendered review. Four complete packs for every task would add unnecessary work.

**Next step:** write one domain-agnostic example with placeholders, a quick-pass route and a deeper route, one rejected alternative, one unresolved assumption and one revised decision. Show which records are reused and what triggers a specialist handoff. Evaluate it on real workspace production before promoting defaults into checks.

### R8 — Medium: reference integrity checks are not yet continuous

[Reference validation](../../packages/cli/src/references.ts) checks index freshness. Typography has additional canonical-data checks. Existing reference tests exercise lookup and section slicing, but they do not enforce every cross-pillar rule link, ownership change or README route across the corpus. The section reader also does not track Markdown fences; current templates were edited to avoid that limitation.

**Next step:** add focused validation for exact rule IDs, replacement targets, local links and section routes, with explicit treatment for wildcard prefixes, shorthand and template placeholders. Test that a retired rule resolves to its owner and that an isolated research rule retains its caveats. Preserve the distinction between structural validity and factual support.

## Coverage and next action by pillar

| Pillar | Most useful next improvement |
| --- | --- |
| [Typography](../../references/typography/README.md) | Re-verify safe-zone and caption-profile fields; preserve canonical data; reconcile source tiers. |
| [Art](../../references/art-director/README.md) | Calibrate stroke and palette tolerances; replace legacy safe-area rows with owner references throughout. |
| [Motion](../../references/motion-director/README.md) | Keep UI defaults scoped; define temporal sampling and shared beat tolerance before checks. |
| [Pacing](../../references/pacing-editor/README.md) | Remove duplicated dwell/caption/narration thresholds from active guidance; scope rates by language and medium. |
| [Critique](../../references/critique-methodology/README.md) | Use the implemented finding schema; treat gold-set size and trust cutoffs as proposals, with calibration by review task. |
| [Sound](../../references/sound-design/README.md) | Reconcile rate and beat metrics; distinguish cue plans, stems and delivered audio evidence. |
| [Accessibility](../../references/accessibility/README.md) | Validate full-sequence flash analysis and profile scope; audit description/contrast methods against actual requirements. |
| [Series brief](../../references/series-brief/README.md) | Update consumer enums through the schema; distinguish typed fields from future lighting/material research proposals. |
| [Delivery](../../references/delivery/README.md) | Refresh destination-specific profiles and separate metadata, timestamp, decoded-signal and human review evidence. |
| [Story](../../references/story/README.md) | Keep six current checks distinct from proposed gates; test research-to-concept handoffs and plan/render metric differences. |
| [Data](../../references/data-visualisation/README.md) | Specify observed data-time playback versus state transitions; split grouped ledger claims and add boundary examples. |
| [Adaptation](../../references/adaptation/README.md) | Keep authored variants available; refresh locale/market guidance and prove checks across a real version matrix. |
| [FX](../../references/fx/README.md) | Move tool mappings to toolkit guides during distillation; validate temporal effects and encoded survival. |
| [Lighting](../../references/lighting/README.md) | Pin source versions; calibrate region-dependent ratios/clipping; reconcile tone-map and palette ownership. |
| [Materials](../../references/materials/README.md) | Resolve albedo-source disagreements and versioned interchange limits; keep physical-scope exemptions explicit. |
| [Domain](../../references/domain-exploration/README.md) | Revisit the twelve incompletely verified ledger rows; deduplicate source records and test stopping/handoff decisions. |
| [Visual research](../../references/visual-research/README.md) | Re-read primary fixation/influence evidence; test whether annotated principles improve decisions without increasing fixation. |
| [Culture](../../references/cultural-context/README.md) | Keep recognition, interpretation and reception distinct; upgrade abstract/secondary-only support for consequential claims. |
| [Image direction](../../references/image-direction/README.md) | Test candidate comparison and full-motion coverage; add camera-direction research; preserve role-specific evidence requirements. |

## Verification

The structural pass used the actual CLI loader: 19 pillars, 714 lookup rules, no duplicate rule IDs. It exercised 810 numbered sections and checked extracted code-fence balance. Exact rule mentions were checked against the lookup set, allowing documented families and template placeholders; local Markdown file targets were checked separately. This is stronger than counting ID-shaped strings in prose, which also counts shorthand and examples.

The pass found and repaired the ambiguous `A11Y-001` shorthand in Motion. External PRD §6.4 mentions in READMEs were distinguished from local section routes. No missing local file targets or section-extraction failures remained. External links, anchor fragments and every citation's claim support were not exhaustively verified.

Validation completed:

- Catalogue/reference index build: current.
- Plugin rebuild: 341 files, 3185 KB, 19 pillar directories.
- Repository validation: 169 files, zero diagnostics.
- Reference and plugin tests: 11 passed across two test files.
- Smoke lookups: corrected `A11Y-AD-COVERAGE` and `BRIEF-TRACE-FINDING` rows returned as intended.
- `git diff --check`: passed.

Commands used the direct TypeScript entry point (`node --import tsx packages/cli/src/index.ts`) because the pnpm/tsx wrapper's IPC listener is restricted in this sandbox. No runtime checks, schemas, approval mechanisms or reviewer agents are added by this review.


## Closeout verification

TypeScript project checks passed. The focused references/brief/plugin/plan suite passed 39 tests. The full suite passed 273 tests in the sandbox; four browser lint tests required a separate run with localhost permission because sandbox listeners are denied. Generated catalogue and plugin were rebuilt and repository validation returned zero diagnostics. The build contains 19 pillar directories, including the shared handoff and camera extension. No production media or approvals were fabricated.
