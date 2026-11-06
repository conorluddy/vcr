# Research prompts

These are briefs for a deep-research agent. Each one seeds a knowledge base the way the typography brief produced `references/typography/`, and the pipeline is the same each time:

**knowledge base → `rules.json` → automatic checks → workflow skill → reviewer agent.**

Each file stands alone, because each goes to a separate research run. That is why every file repeats the same context, deliverable and research rules sections. If you change one of those sections, change it in every file.

To run one, paste everything below the `---` line into the research agent. Save the report as `references/<slug>/<slug>-knowledge-base.md`, then run it through the typography workflow (rule IDs, verification ledger, `rules.json`).

| Prompt | Rule prefix | Feeds | Order |
| --- | --- | --- | --- |
| [series-brief](series-brief.md) | `BRIEF-` | the series brief schema that every reviewer reads | 1 |
| [critique-methodology](critique-methodology.md) | `REVIEW-` | shared findings schema, reviewer prompt skeleton, calibration | 1 |
| [motion-director](motion-director.md) | `MOTION-` | `vcr motion-trace`, the motion skill, the motion director agent | 2 |
| [pacing-editor](pacing-editor.md) | `PACE-` | the beat map, the pacing skill, the editor agent | 3 |
| [art-director](art-director.md) | `ART-` | frame colour and composition checks, the art director agent | 4 |
| [accessibility](accessibility.md) | `A11Y-` | flash, CVD and caption checks in `vcr lint` (checks, not an agent) | 4 |
| [sound-design](sound-design.md) | `SOUND-` | loudness and sync checks; waits for the audio cue schema (#60) | 5 |

The two prompts in row 1 can run in parallel; the series brief and the findings format shape every later pillar. Nothing in this directory ships in the plugin.
