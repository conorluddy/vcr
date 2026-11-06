# Story reference

This is the concept, script and storyboard knowledge base (`STORY-*`), produced from [the research brief](../research-prompts/story.md) on 2026-11-06. It covers everything between receiving a brief and building the first scene. It is reference material, not an implemented schema or check, and it is about 19k tokens, so read only the section the task needs in [the knowledge base](story-knowledge-base.md). Its IDs are already named.

It is the only pillar that judges a **plan** rather than a render, so it is where an agent saves the most wasted renders. Few of its rules are numeric thresholds. Most are structural: does the plan contain X? The creative-effectiveness evidence is mostly correlational (§1.4, §19).

| Task | Read |
| --- | --- |
| Develop concept routes; the one-idea test; present routes to a human | §1 |
| Choose a mechanism: metaphor, demonstration, transformation, comparison, build-up | §2 |
| Write the script: two-column AV, ear against eye, word counts, TTS | §3 |
| Turn the script into a beat sheet; the minimum beat record | §4 |
| Storyboards, style frames, boards for 9:16 against 16:9 | §5 |
| Animatics, greybox and blocking passes | §6 |
| Review gates, and which ones an agent never skips | §7 |
| Series formats | §8 |
| Check a plan before rendering; machine-readable formats | §9, §16 |
| Critique a concept or script | §10, §12, §18 |
| Create from a brief to a verified plan | §13, §18 |
| Check a claim | §19 (caveats), §20 (verification ledger) |

## The plan artefact

The KB recommends a **VCR beat sheet JSON** (§4.2) as the source of truth for a plan. Fountain, OTIO and EDL serve only as import and export formats (§9.2). Most `STORY-*` rules are checks on that file. Before anything is built:

- The beat sheet schema sits with the series brief schema in `catalog/schemas/`, in Layer 1. A video's plan lives beside its `brief.md` in the workspace project, never in the harness.
- Beats become the scene's `markers`. Each beat's `sound_cues` become the audio cue list that the sound pillar needs (see the [sound reference](../sound-design/README.md)). The beat `id` (`B03`) should also serve as the beat label when markers gain names (see the [scene contract](../../skills/start/references/scene-contract.md)).
- The review gates (`STORY-GATE-SEQUENCE`: concept → script → timed plan → final) need approvals on artefacts that are not renders. The plugin PRD's approvals (§6.4) are keyed by `render_id` and manifest hash. Extend them to a plan artefact and its hash rather than invent a second approval mechanism. `STORY-GATE-REGRESSION` is the same hash comparison.

## Open decisions before building the schema, checks or an agent

1. **Settled: plan-stage counterparts cite the render-stage owner** ([shared conventions](../README.md)). These rules check the plan before rendering, but the threshold belongs to the pillar that checks the render, and the plan check holds no number of its own:

   | Plan check | Owner of the threshold |
   | --- | --- |
   | `STORY-HOOK-WINDOW` | `PACE-HOOK-*` |
   | `STORY-TEXT-READTIME` | `TYPO-HOLD` |
   | `STORY-BEAT-DENSITY` | `PACE-BEAT-*` |
   | `STORY-WORD-BUDGET` | `SOUND-NARRATION-WPM` |
   | `STORY-MUTED-LEGIBLE` | `PACE-SOUND-01` |
   | `STORY-REDUNDANT-TEXT` | `PACE-NARR-04` |
   | `STORY-TEMPORAL-SYNC` | `PACE-NARR-03` |
   | `STORY-CTA` | `PACE-CTA-01` |
   | `STORY-BEAT-SUM` | the brief's duration and `PACE-DUR-01` |
   | `STORY-MANDATORY-MAP` | `BRIEF-MANDATORY-PASS` |
   | `STORY-LOOP-SEAM` | `MOTION-RHY-004` and `SOUND-LOOP-SEAM` |
   | `STORY-SERIES-TEMPLATE` | `BRIEF-FIXED-PRESENT` and `PACE-SERIES-02` |
2. **Settled: duplicates.**
   - `STORY-SMP` is dropped. `BRIEF-PROPOSITION-SINGLE` owns the single proposition, and the plan inherits it.
   - `STORY-MESSAGE-COUNT` stays: it checks that the plan does not add messages the brief did not ask for.
   - `STORY-SERIES-REPEAT` takes over `PACE-SERIES-03` (hook rotation). Variety of hook type, mechanism and opening line is a property of the plan. `BRIEF-SERIES-DISTINCT` stays as the render-level near-duplicate check.
3. **What `STORY-*` owns outright:**
   - the concept: `STORY-ONE-IDEA`, `-MECHANISM`, `-ROUTES-*`, `-ROUTE-CARD`, `-NOT-A-LIST`, `-TURN`, `-SHOW-NOT-TELL`, `-METAPHOR-LEGIBLE`, `-LITERAL-PRECISION` and `-NO-WORD-ILLUSTRATION`;
   - the script: `STORY-EAR-WRITING`, `-VO-AIR`, `-TABLE-READ` and `-TTS-*`;
   - the plan: `STORY-BEAT-FIELDS`, `-BOARD-*`, `-STYLE-FRAMES`, `-ANIMATIC-*`, `-BLOCKING-PASS`, `-GATE-*`, `-CLAIM-SOURCE` and `-FLUENT-DEVICE`;
   - the platform rules for ads: `STORY-BRAND-EARLY` (YouTube ABCD);
   - stills: `STORY-STILL-ONE-READ`.
4. **Claim sourcing overlaps data visualisation.** `STORY-CLAIM-SOURCE` needs a claim registry in the brief. The `DATA-*` research (pending) covers source lines and data provenance on screen. Settle the split when it lands: story owns "every claim has a source", and data owns "the chart matches its source".
5. **Unsourced cut-offs.** Several thresholds are VCR's own:
   - the number of routes (≥ 3 is folklore; the evidence says "multiple, in parallel");
   - the noun-per-beat ratio in `STORY-NO-WORD-ILLUSTRATION`;
   - the token-overlap cut-off in `STORY-REDUNDANT-TEXT`;
   - the count of style frames (practitioner ranges conflict).

   Treat them as prompts for the reviewer, never as gates.
6. **Judgement-heavy rules need the critique method.** `STORY-ONE-IDEA`, `-NOT-A-LIST`, `-METAPHOR-LEGIBLE` and `-TURN` are judged. A plan reviewer agent follows `REVIEW-*`: it compares routes rather than scoring them, it is blinded to authorship, and it stays advisory until calibrated.
