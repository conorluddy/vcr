# Pillar workflow drafts — promoted snapshot

Historical drafts prepared by Terra subagents on 2026-11-08 from the [extraction audit](../../research/pillar-extraction-audit-2026-11-08.md). These files are proposals for review, not installed skills, plugin features, calibrated reviewers or accepted changes to ADR 0006.

## Draft set

| Draft | Scope |
| --- | --- |
| [Art direction](skills/art-direction/SKILL.md) | Visual language, palette and composition |
| [Motion](skills/motion/SKILL.md) | Motion voice and choreography |
| [Pacing](skills/pacing/SKILL.md) | Beat timing and editorial rhythm |
| [Story](skills/story/SKILL.md) | Script, boards and buildable plan |
| [Sound design](skills/sound-design/SKILL.md) | Audio direction, cues and mix decisions |
| [Accessibility](skills/accessibility/SKILL.md) | Access requirements and variants |
| [Delivery](skills/delivery/SKILL.md) | Target selection and encoded-file QC |
| [Adaptation](skills/adaptation/SKILL.md) | Version planning and transformations |
| [Data visualisation](skills/data-visualisation/SKILL.md) | Claims, encodings and truthful transitions |
| [Image treatment](skills/image-treatment/SKILL.md) | Treatment stacks and temporal behaviour |
| [Lighting](skills/lighting/SKILL.md) | Illumination, exposure and light continuity |
| [Materials](skills/materials/SKILL.md) | Surface response and texture interpretation |
| [Review](skills/review/SKILL.md) | Existing CLI review and revision workflow |
| [Typography revision](skills/typography/SKILL.md) | Proposed replacement of existing workflow |
| [Brief revision](skills/brief/SKILL.md) | Proposed replacement with research and series handoffs |
| [Accessibility reviewer](agents/accessibility-reviewer.md) | Proposed advisory independent reviewer |

[Lighting/materials routing notes](look-routing.md) compare packaging options; they are a desk review, not a behavioural evaluation.

## Reading and promotion

Skill links and invocation instructions are written for their eventual `skills/<name>/SKILL.md` location: `../../references/` means the repository's reference tree. Agent paths likewise assume eventual `agents/` placement. They intentionally do not resolve relative to this staging directory. Review against the repository root; do not invoke these drafts as installed plugin skills.

Before promotion, settle the early-skill sequencing decision, review source-rule ownership and manual-check limitations, evaluate triggers and representative tasks, then promote one workflow at a time. Lighting/materials packaging remains a proposal. The existing live skills, agents and generated plugin are unchanged.

Drafting and structural validation are not evidence of production usefulness, reviewer calibration or safety conformance.

## Checks performed

All fifteen skill drafts passed the skill-creator frontmatter/naming validator. All sixteen skill/agent drafts were checked against current rule IDs, superseded-rule replacements and local links interpreted at their intended deployment locations. Repository validation passed with 169 files and zero diagnostics via `node --import tsx packages/cli/src/index.ts validate`.

A Terra cross-review of the other draft batches found an audio-evidence limitation in the accessibility reviewer; the draft now distinguishes file access from hearing and requires suitable transcript or human listening evidence. This was a desk review, not a forward test on a production. Source-reference cleanup identified by the audit remains separate work.

## Draft review pass

Art direction and motion were reviewed individually and revised, followed by a Terra review-and-revision pass over the remaining drafts. Each workflow now scopes local changes, names actionable decisions and workspace handoffs, and distinguishes evidence from unavailable measurements.

- Pacing and story diagnose unclear or rushed passages while preserving brief, narrative and timing ownership.
- Typography restores reproducible font and readiness requirements; brief clarifies research commissioning and series continuity without obsolete rotation ownership.
- Sound, delivery and adaptation distinguish creative choices, diagnosis, file evidence and version-specific checks.
- Accessibility and its reviewer distinguish information equivalence, observed movement, audio evidence and unassessed safety.
- Data, treatment, lighting and materials locate defects before changing encodings, stacks or appearance settings.
- Review includes initial check/reviewer selection as well as finding triage and evidence-backed revision.

Lighting/materials packaging remains unresolved. This pass improves the written workflows; representative task evaluation and source-reference cleanup remain outstanding before promotion.

## Focused evaluation pass

The [evaluation cases and results](evaluation/README.md) supersede the earlier desk-review-only status above. They cover all fifteen skills, the accessibility reviewer and three cross-pillar handoffs. Raw requests and expected observations are separate. Generated artifacts remain in ignored output directories; reports retain their methods, observations and limitations.

This pass includes independent initial trials, corrective reruns and supplemental synthetic artifacts. These are distinguished in the reports; a rerun by an agent that has seen expectations is not another blind evaluation. Source contradictions directly affecting the drafts were corrected in accessibility, adaptation, delivery, image treatment, lighting and materials; their generated plugin copies were rebuilt without activating any draft.

The recommendation is to retain separate lighting and materials entries: focused routing selected the appropriate owners, and joint work needs both. This is a draft packaging recommendation, not a claim about production performance. Promotion still requires the early-skill policy decision and acceptance of the scoped evidence limitations. No workflow or reviewer has acquired approval powers or calibrated status.

## Publication

The reviewed workflows now ship under `skills/`, and the accessibility reviewer under `agents/`. This directory retains the drafting and evaluation history; use the live files for future edits. ADR 0008 authorises advisory workflow publication ahead of checks. The CLI-only review skill does not complete plugin P3/P4.
