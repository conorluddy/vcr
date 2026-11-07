# Research prompts

These are briefs for a deep-research agent. Each one seeds a knowledge base the way the typography brief produced `references/typography/`, and the pipeline is the same each time:

**knowledge base → `rules.json` → automatic checks → workflow skill → reviewer agent.**

Each file stands alone, because each goes to a separate research run. Shared conventions should stay consistent across briefs; context, evidence inputs and deliverables may differ where a topic needs a different research method.

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
| [delivery](delivery.md) | `DELIVERY-` | delivery QC on the encoded file (`ffprobe`, a simulated platform re-encode); takes over delivery rules that are scattered across other pillars today | 6 |
| [story](story.md) | `STORY-` | plan checks before rendering (script length, beat coverage, mandatories mapped); briefing and storyboard skills | 6 |
| [data-visualisation](data-visualisation.md) | `DATA-` | chart integrity checks from a scene's data and geometry; a data story skill | 7 |
| [adaptation](adaptation.md) | `ADAPT-` | checks across a set of versions (every aspect, locale and cutdown); version parameters in the scene contract | 7 |
| [fx](fx.md) | `FX-` | blend modes, masks, print-process looks, textures and stylised effects, with how each behaves in motion and survives delivery; a technique library for agents | 8 |
| [lighting](lighting.md) | `LIGHT-` | lighting for three.js and Blender scenes and for simulated light in 2D; checks on rendered frames such as ratios, clipping and separation | 8 |
| [materials](materials.md) | `MAT-` | PBR and stylised materials, textures and colour spaces; scene-data checks such as albedo ranges and texture colour spaces | 8 |
| [domain-exploration](domain-exploration.md) | `DOMAIN-` | subject research, annotated references and evidence-linked creative opportunities for the brief, story and art direction; reference knowledge base supplied | 9 |
| [visual-research](visual-research.md) | `VREF-` | annotated reference boards, visual analysis and transferable principles; reference knowledge base supplied | 9 |
| [image-direction](image-direction.md) | `IMAGE-` | image briefs, asset shortlists, selection criteria and preparation handoffs; reference knowledge base supplied | 9 |
| [cultural-context](cultural-context.md) | `CULTURE-` | audience associations, cultural interpretation and dated reference checks; reference knowledge base supplied | 9 |

The two prompts in row 1 can run in parallel; the series brief and the findings format shape every later pillar. Rows 1–5 have produced knowledge bases; rows 6 and 7 form the second round and have also produced knowledge bases. Row 8 is the third round (image treatment, lighting and materials), and has also produced knowledge bases. All four briefs in row 9 have supplied reference knowledge bases with routing READMEs. None of these four has rules data, checks, a skill or an agent. Nothing in this directory ships in the plugin.

The four briefs in row 9 stand alone and can be researched independently. Domain exploration learns the subject; visual research studies ways of representing it; image direction specifies and selects imagery; cultural context investigates audience meanings. The supplied reports remain separate references, with ownership recorded in their READMEs and the shared reference conventions. Reconcile duplicate candidate rules before distillation; revisit the visual research split against actual use. These references do not introduce reference retrieval, asset integrations or trend monitoring.
