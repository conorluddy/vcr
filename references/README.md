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
| Accessibility | `A11Y-` | [accessibility/](accessibility/README.md) | — | — (flash analyser first) | — | — |
| Series brief | `BRIEF-` | [series-brief/](series-brief/README.md) | — (schema planned for Layer 1) | — | — | (read by every reviewer) |
| Delivery | `DELIVERY-` | [delivery/](delivery/README.md) | — | — (`ffprobe` metadata gate first) | — | — |
| Concept, script and storyboard | `STORY-` | [story/](story/README.md) | — (beat sheet schema planned for Layer 1) | — | — | — |
| Data visualisation | `DATA-` | [data-visualisation/](data-visualisation/README.md) | — | — | — | — |
| Adaptation and versioning | `ADAPT-` | [adaptation/](adaptation/README.md) | — | — | — | — |
| Image treatment and compositing | `FX-` | research pending ([brief](research-prompts/fx.md)) | | | | |
| Lighting | `LIGHT-` | research pending ([brief](research-prompts/lighting.md)) | | | | |
| Materials | `MAT-` | research pending ([brief](research-prompts/materials.md)) | | | | |

`references/ideas/` holds exploratory material and `references/cli.md` the CLI reference; neither is a pillar.

## Shared conventions

- **Architecture.** [ADR 0006](../specifications/decisions/0006-creative-pillars-independent-of-tools.md) records the pipeline, the layers and the decisions below. [The roadmap](../specifications/roadmap.md) sequences the work (epic #152).
- **Independent of tools.** A pillar (its references, `rules.json`, skill and agent) never names a catalogue tool or holds a tool recipe. A toolkit guide cites the pillar's rule ID and shows how its tool meets it. A check measures the output and never depends on which tool made it. The tool recipes inside the knowledge bases, such as FFmpeg filters and GSAP eases, are worked examples. When a skill is distilled, they move to the matching toolkit guides.
- **Plan before render.** A plan check (`STORY-*`, on the beat sheet) cites the threshold owned by the check that runs on the render, so a number lives in one place.
- **Values in the brief, checks in the pillars.** A production's palette, tokens, durations, mandatories, market profiles and claim registry live in its brief in the workspace. Pillar checks read them.
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
| Base reading hold for static text | `TYPO-HOLD` | `MOTION-TIME-005` cites it. `PACE-READ-01`, `A11Y-MOTION-READING` and `A11Y-TEXT-DWELL` are dropped. `PACE-READ-01`'s characters ÷ 20 term is a candidate revision to `TYPO-HOLD`. |
| Stricter hold for key text and quiz windows | `PACE-READ-04`, `PACE-QUIZ-01` | Defined as at least `TYPO-HOLD`. |
| Caption speed, duration and lines | `TYPO-CAPTION-*`, `caption_profiles` | `PACE-READ-02/03` and `A11Y-CAPTION-RATE` are dropped. |
| Captions as access: presence, completeness, accuracy, sync, non-speech, speakers, lyrics, sidecars | `A11Y-CAPTION-*` | `PACE-SOUND-02` is dropped. `A11Y-CAPTION-PLACEMENT` cites `TYPO-SAFE` for platform UI. |
| Text contrast | `TYPO-CONTRAST` | `A11Y-CONTRAST-TEXT` is dropped. Its 5th-percentile-over-lifetime method is how `TYPO-CONTRAST` is measured on moving backgrounds. |
| Non-text contrast, CVD distinguishability, colour as the only carrier | `A11Y-CONTRAST-GRAPHIC`, `A11Y-CVD-DISTINCT`, `A11Y-COLOR-ALONE` | Art and data visualisation cite them. `DATA-COLOUR-NOT-SOLE` is dropped. |
| Number and date formatting by locale | `ADAPT-LOCALE-FORMAT` (`Intl`) | `DATA-THOUSANDS` is dropped. |
| Data integrity: baselines, scales, labels matching data, object constancy, source lines on charts | `DATA-*` | `STORY-CLAIM-SOURCE` owns "every claim has a source" at plan time. `DATA-NO-OVERSHOOT` overrides `MOTION-EASE-005` for data marks. |
| Delivery encode: range, chroma, bitrate, frame-rate contract, audio sample rate and bitrate, colour tags, stills format | `DELIVERY-*` | `TYPO-RANGE`, `TYPO-CHROMA`, `TYPO-BITRATE`, `TYPO-STILL-FORMAT`, `ART-DEL-*`, `SOUND-SAMPLE-RATE`, `SOUND-AAC-BITRATE` and `MOTION-FPS-001` move here. Each original pillar keeps the design consequence and cites the delivery number (see the delivery README). |
| Manifest, naming and checksums of delivered files | `DELIVERY-MANIFEST`, `-NAMING`, `-CHECKSUM`, extending the PRD §6.4 render manifest | `ADAPT-TRACE-MASTER` and `ADAPT-VERSION-ID` add version fields to the same manifest. |
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
| Vestibular triggers, reduced motion, pause controls | `A11Y-MOTION-*` | `MOTION-A11Y-001/002/003/004` and `MOTION-CAM-002/003` are dropped. `MOTION-CAM-004/005` (oscillation, spin) move to `A11Y-MOTION-*`. Motion keeps `MOTION-CAM-001` (judder) and `MOTION-CAM-006` (stable anchor). |
| Flashing and stripe patterns | `A11Y-FLASH-*`, `A11Y-PATTERN-STRIPES` | `MOTION-A11Y-005` is dropped. `TYPO-FLASH` cites them, and leaves the typography data once the `A11Y-*` data exists. The flash profile (WCAG, ITU/Ofcom or strict) is set in the brief. |
| Template sameness | Each pillar for its own medium: `MOTION-SIG-*` and art §11 | `REVIEW-HOM-*` governs reviewers: fixes stay inside the brief's look. |
| Duration targets, episode IDs, segment slots, series loudness | Values: `BRIEF-*`. Checks: `PACE-DUR-01`, `PACE-SERIES-*`, `SOUND-SERIES-CONSISTENCY`. | |
| Conformance to brief tokens and budgets (easing, durations, palette, expressive moments, segment ranges) | The pillar that owns the craft check (`MOTION-*`, `ART-*`, `PACE-*`, `SOUND-*`), reading its value from the brief | The duplicating `BRIEF-*` rules are dropped (see the series brief README). |
| Brief quality, brand assets (logos, sonic logo, third-party art), mandatories, deliverable spec, series identity, rule-breaks | `BRIEF-*` | |
| Conflict priority between pillars | A brief's declared order (`BRIEF-PRIORITY-APPLIED`), otherwise `REVIEW-AGG-03` | |
| Plan-stage checks (hook timing, reading time, word budget, mute test, CTA, mandatories mapped, loop seam, series slots) | The render-stage owner holds the threshold | `STORY-*` checks the beat sheet before rendering and cites that owner (see the story README). |
| Variety across series episodes: hook type, mechanism, opening line | `STORY-SERIES-REPEAT` | `PACE-SERIES-03` is dropped. `BRIEF-SERIES-DISTINCT` stays as the render-level near-duplicate check. |
| Single proposition | `BRIEF-PROPOSITION-SINGLE` | `STORY-SMP` is dropped. |
| Determinism (identical output for the same input) | One generic check across picture and sound | `MOTION-SPR-001`, `SOUND-SYNTH-DETERMINISM` and `ADAPT-DETERMINISM` describe it for their own medium. `ADAPT-DETERMINISM` adds the GPU tolerance and the Chromium pin for `Intl`. |
| Checks across a version set (safe zones, text fit, fonts, captions, mandatories, SFX, music, series tokens on every cell) | The owning pillar's check, run on every cell | `ADAPT-*` owns the matrix and running the checks across it, not a second threshold (see the adaptation README). |
| Market rules for UK TV supers (hold, height) | A `uk-clearcast` market profile on `TYPO-HOLD` and `TYPO-SIZE` | `ADAPT-SUPER-HOLD-UK` and `ADAPT-SUPER-HEIGHT-UK` become that profile. |
| Claim registry: sources, qualifiers, legal list per market | One registry in the brief | `STORY-CLAIM-SOURCE` reads it at plan time; `ADAPT-CLAIMS-MARKET` and `ADAPT-DISCLOSURE-*` read it across markets. |
