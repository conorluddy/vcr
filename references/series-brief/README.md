# Series brief reference

This is the series brief, brand system and series bible knowledge base (`BRIEF-*`), produced from [the research brief](../research-prompts/series-brief.md) on 2026-11-06. It defines what a brief must hold so that every other pillar can review against it: one objective, one proposition, evaluation criteria, and a typed split between hard mandatories, weighted preferences and declared rule-breaks. Motion, colour and sound are expressed as DTCG 2025.10 tokens with VCR extensions. Its knowledge base is reference material; the brief schemas, `brief` workflow and schema validation are implemented as described below, and it is about 20k tokens, so read only the section the task needs in [the knowledge base](series-brief-knowledge-base.md). Its IDs are already named.

| Task | Read |
| --- | --- |
| Research inputs and cross-pillar handoffs | §1, §11 |
| Write a brief: which fields change decisions | §1 |
| Learn from published brand motion guides | §2 |
| Express motion, colour and sound as tokens | §3, §12.3 |
| Turn tone adjectives into parameters | §4 |
| Plan a series: fixed recognisers, variable axes, avoiding monotony | §5–6 |
| Review against the brief; resolve conflicts between pillars | §7–8, §10 |
| Create from a brief | §11, §16.2 |
| The proposed brief schema and a worked fictional example | §12 |
| Measure conformance to tokens, logos, segments and series rules | §14 |
| Check a claim | §17 (caveats), §18 (verification ledger) |

## Where a brief lives

The harness stays domain-agnostic, so it holds only the brief's schema and method, never a real brief. The PRD already has the slots: a project carries `brand/` and series-level configuration, and each video carries `brief.md` (`specifications/vcr-prd.md` §7, L1-03). The proposal:

- Built (plugin P2): the schema is `catalog/schemas/series-brief.schema.json`, from the §12.1 sketch. Its fps accepts positive rates and it adds `accessibility.flashProfile`. Its `consumers` enums also accept `domain-exploration`, `visual-research`, `cultural-context` and `image-direction`. Research records remain workspace notes; consumer routing does not implement research checks.
- A project's brief is `projects/<project>/brief.json`, next to `brand/`, which holds the DTCG token files. A video's `brief.md` (front matter in `catalog/schemas/video-brief.schema.json`, plus five sections) narrows it and never contradicts it; `vcr validate` checks deliverables, the cited version and the flash profile.
- The fictional "Low Tide Lab" example (§12.2) is the schema's test fixture, read straight from this knowledge base, so the example must stay valid.
- The `brief` skill interviews for these fields and writes both files.

## Open decisions before extending the schema, checks or agents

1. **Settled: the brief holds values; the pillars own the checks** ([shared conventions](../README.md)). These `BRIEF-*` rules duplicate pillar checks and are dropped. Each pillar check reads its value from the brief when the brief declares one.
   - `BRIEF-EXIT-ACCEL`, `BRIEF-NO-LINEAR-SPATIAL` and `BRIEF-DURATION-DISTANCE` → `MOTION-EASE-*` and `MOTION-TIME-003`.
   - `BRIEF-TOKEN-ONLY-EASING` → `MOTION-EASE-008`, which uses the same 0.03 RMSE.
   - `BRIEF-DURATION-FRAMES` → motion. The brief supplies `minFramesPerTween`.
   - `BRIEF-EXPRESSIVE-BUDGET` → `MOTION-SIG-004`, with the brief supplying the budget.
   - `BRIEF-TOKEN-ONLY-COLOR` and `BRIEF-COLOR-ANCHOR-SHARE` → art, with the brief supplying the palette.
   - `BRIEF-PROPOSITION-ONSCREEN` and `BRIEF-HOOK-WINDOW` → `PACE-HOOK-*` and `PACE-SOUND-01`, with the brief supplying the proposition and hook window.
   - `BRIEF-SEGMENT-BUDGET` and `BRIEF-SERIES-ROTATION` → `PACE-SERIES-*`. The declared ranges replace pacing's ±10%-of-median default when present.
   - `BRIEF-SONIC-LOGO-SYNC` → `SOUND-SYNC-*`.
   - `BRIEF-LOOP-SEAM` → `MOTION-RHY-004` and `SOUND-LOOP-SEAM`.
   - `BRIEF-NO-DEFAULT-LEAK` → `MOTION-SIG-002`, `TYPO-FONTS` and art.
2. **What `BRIEF-*` keeps.**
   - The quality of the brief itself: `BRIEF-SCHEMA-VALID`, `-OBJECTIVE-*`, `-AUDIENCE-SPECIFIC`, `-PROPOSITION-SINGLE`, `-EVAL-CRITERIA`, `-ADJECTIVE-OPERATIONALISED`, `-MANDATORY-SOURCED`, `-NO-PRESCRIBE` and `-DTCG-*`.
   - Brand assets no other pillar covers: `BRIEF-LOGO-*`, `BRIEF-THIRD-PARTY-ART` and `BRIEF-SONIC-LOGO-PRESENT`.
   - Conformance across the whole brief: `BRIEF-MANDATORY-PASS`, `BRIEF-DELIVERABLE-SPEC`, `BRIEF-RULEBREAK-*` and `BRIEF-VERSION-STAMP`.
   - Series identity: `BRIEF-FIXED-PRESENT`, `BRIEF-VARIABLE-RANGE` and `BRIEF-SERIES-DISTINCT`.
3. **Finding basis and taste cap.** `BRIEF-TRACE-FINDING` now follows the finding contract (`specifications/vcr-plugin-prd.md` §6.4): taste is at most `note`. A brief-based finding cites `brief_ref`; a measured or sourced craft finding may cite its rule without a brief path. Absence of a brief path does not make a finding taste.
4. **Conflict priority.** `BRIEF-PRIORITY-APPLIED` lets a brief declare its own priority order between pillars. `REVIEW-AGG-03` gives the default order. Keep both: the brief overrides, and the default applies when the brief is silent.
5. **Colour tolerance disagreement.** This KB uses ΔE2000 ≤ 5 for palette conformance; the art KB uses 1.0 and 3.0. Art owns the check, so settle the value there.
6. **Unverified and uncalibrated values.**
   - The DTCG motion types come from a truncated fetch (§3.3, ledger).
   - The thresholds are heuristic: 0.03 RMSE, pHash ≤ 6 and ≥ 12 of 64 bits, sonic-logo correlation ≥ 0.9, and the 0.8 fuzzy match.
   - The evidence on sound logos is weak (§2.9).
