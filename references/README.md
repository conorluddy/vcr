# References

Each creative pillar follows the same path:
1. a knowledge base from deep research;
2. a `rules.json` data file;
3. automatic checks;
4. a workflow skill;
5. a reviewer agent.

This file holds the conventions every pillar shares and decides which pillar owns each rule that several of them touch. A pillar's own README covers routing inside its knowledge base and the decisions that are still open.

| Pillar | Prefix | Knowledge base | Data | Checks | Skill | Agent |
| --- | --- | --- | --- | --- | --- | --- |
| Typography | `TYPO-` | [typography/](typography/README.md) | `rules.json` | `vcr lint` | `typography` | `typographer` |
| Art direction | `ART-` | [art-director/](art-director/README.md) | — | — | — | — |
| Motion | `MOTION-` | [motion-director/](motion-director/README.md) | — | — | — | — |
| Pacing | `PACE-` | [pacing-editor/](pacing-editor/README.md) | — | — | — | — |
| Critique (shared) | `REVIEW-` | [critique-methodology/](critique-methodology/README.md) | — | — | — | (all reviewers) |
| Sound | `SOUND-` | [sound-design/](sound-design/README.md) | — | — | — | — |
| Accessibility | `A11Y-` | research pending ([brief](research-prompts/accessibility.md)) | | | | |
| Series brief | `BRIEF-` | [series-brief/](series-brief/README.md) | — (schema planned for Layer 1) | — | — | (read by every reviewer) |
| Delivery | `DELIVERY-` | research pending ([brief](research-prompts/delivery.md)) | | | | |
| Concept, script and storyboard | `STORY-` | research pending ([brief](research-prompts/story.md)) | | | | |
| Data visualisation | `DATA-` | research pending ([brief](research-prompts/data-visualisation.md)) | | | | |
| Adaptation and versioning | `ADAPT-` | research pending ([brief](research-prompts/adaptation.md)) | | | | |

`references/ideas/` holds exploratory material and `references/cli.md` the CLI reference; neither is a pillar.

## Shared conventions

- **Named rule IDs.** An ID is the pillar prefix plus uppercase words joined by hyphens, with no digits: `TYPO-SAFE`, `TYPO-CAPTION-CPS`. It names what the rule checks, so a finding reads on its own. The art, motion, pacing and critique knowledge bases arrived with numbered IDs such as `MOTION-EASE-001`. Treat those as drafts. They are renamed when the pillar gets its `rules.json`, and the knowledge base is updated in the same PR, so `pnpm validate` can hold the two in agreement as it does for typography.
- **Tiers.**
  - `standard`: a published standard, checked against the primary source.
  - `platform`: vendor or platform documentation, which may change without notice.
  - `heuristic`: a rule of thumb, research default, secondary source or VCR arithmetic.

  The tier says how strong the source is. `verified: false` is a separate flag: it says the figure itself was not confirmed at source.
- **One finding contract.** Every check and reviewer writes the finding in `specifications/vcr-plugin-prd.md` §6.4, including its optional reviewer fields and severity caps. [Critique methodology](critique-methodology/README.md) explains the method.
- **One scene contract.** Markers, tags and `textBounds()` are defined once, in [the scene contract](../skills/start/references/scene-contract.md), never per pillar.
- **Domain-agnostic.** Rules hold for any production. Values that depend on one production or series belong in its brief (`BRIEF-*`), outside this repository.
- **Advisory until calibrated.** A heuristic threshold, or a judged finding from a reviewer agent, informs the human but gates nothing until it has been checked against human review (`REVIEW-CAL-*`).

## Rule owners

Where two pillars cover the same thing, the owner keeps the rule and the threshold. The other pillar cites the owner's ID and does not restate the number. When a pillar's `rules.json` is built, rules marked *drop* below are left out of it.

| Concern | Owner | Others |
| --- | --- | --- |
| Safe zones for platform UI | `TYPO-SAFE`; presets in `typography/rules.json` `safe_zones` | `ART-CMP-01` proposes a wider union box and an excluded lower-right corner. That becomes a change to the presets plus excluded-rectangle support in `vcr lint`, not a second set of numbers. |
| Base reading hold for static text | `TYPO-HOLD` | `MOTION-TIME-005` cites it. `PACE-READ-01` is dropped; its characters ÷ 20 term is a candidate revision to `TYPO-HOLD`. |
| Stricter hold for key text and quiz windows | `PACE-READ-04`, `PACE-QUIZ-01` | Defined as at least `TYPO-HOLD`. |
| Caption speed, duration and lines | `TYPO-CAPTION-*`, `caption_profiles` | `PACE-READ-02/03` are dropped. |
| Speech is captioned at all | `PACE-SOUND-02` until accessibility arrives, then `A11Y-*` | |
| Video range and chroma at delivery | `TYPO-RANGE`, `TYPO-CHROMA` | `ART-DEL-01/02/03` cite them. They move to `DELIVERY-*` when that research lands. |
| Minimum stroke width, static | `ART-*` (one value; the KB disagrees with itself, 4 vs 6 px) | |
| Shimmer and strobing of thin moving features | `MOTION-FPS-003` | `TYPO-RASTER-SCALE` keeps text scaled up or down. |
| Movement inside a beat: lead mover, number of simultaneous movers | `MOTION-CHOR-003` | `PACE-BEAT-05` is dropped; its limit of 3 movers is folded into the motion rule. |
| Cuts and beat lengths, static gaps, holds after a payoff | `PACE-BEAT-*`, `PACE-STRUCT-*` | |
| Alignment to music markers | Cuts: `PACE-BEAT-06`. Arrivals and impacts within a shot: `MOTION-RHY-001`. Markers matching the audio's detected beats, and the BPM grid: `SOUND-BEAT-ALIGN`, `SOUND-BPM-FRAME-GRID`. | All three share one frame tolerance (see the sound README). |
| Audio sync to visual events (SFX on contacts, lip sync) | `SOUND-SYNC-LEAD`, `SOUND-SYNC-LAG`, `SOUND-SFX-PEAK-ALIGN` | `MOTION-RHY-002` is dropped. |
| Narration rate and pauses | `SOUND-NARRATION-WPM` | `PACE-NARR-01/02` are dropped. |
| Narration against visuals and on-screen text | `PACE-NARR-03`, `PACE-NARR-04` | `SOUND-NARRATION-VISUAL-LEAD` and `SOUND-NARRATION-TEXT-REDUNDANCY` are dropped. The visual-lead rule's 0–300 ms window is a candidate tightening of `PACE-NARR-03`. |
| Mute test: the message survives sound off | `PACE-SOUND-01` | `SOUND-MUTE-LEGIBLE` is dropped. |
| Loop seam continuity | Picture: `MOTION-RHY-004`. Audio: `SOUND-LOOP-SEAM`. | `PACE-LOOP-01` is dropped. `PACE-LOOP-02` (no fade or end card on a loop) stays with pacing. |
| Vestibular triggers, reduced motion, pause controls | `MOTION-CAM-*`, `MOTION-A11Y-*` until accessibility arrives | |
| Flashing | Accessibility (`A11Y-*`) | `MOTION-A11Y-005` and `TYPO-FLASH` cite it. Until accessibility arrives, `TYPO-FLASH` holds the number. |
| Template sameness | Each pillar for its own medium: `MOTION-SIG-*` and art §11 | `REVIEW-HOM-*` governs reviewers: fixes stay inside the brief's look. |
| Duration targets, episode IDs, segment slots, series loudness | Values: `BRIEF-*`. Checks: `PACE-DUR-01`, `PACE-SERIES-*`, `SOUND-SERIES-CONSISTENCY`. | |
| Conformance to brief tokens and budgets (easing, durations, palette, expressive moments, segment ranges) | The pillar that owns the craft check (`MOTION-*`, `ART-*`, `PACE-*`, `SOUND-*`), reading its value from the brief | The duplicating `BRIEF-*` rules are dropped (see the series brief README). |
| Brief quality, brand assets (logos, sonic logo, third-party art), mandatories, deliverable spec, series identity, rule-breaks | `BRIEF-*` | |
| Conflict priority between pillars | A brief's declared order (`BRIEF-PRIORITY-APPLIED`), otherwise `REVIEW-AGG-03` | |
| Determinism (identical output for the same input) | One generic check across picture and sound | `MOTION-SPR-001` and `SOUND-SYNTH-DETERMINISM` describe it for their own medium. |
