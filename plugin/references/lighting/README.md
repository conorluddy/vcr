# Lighting reference

This is the lighting knowledge base (`LIGHT-*`), produced from [the research brief](../research-prompts/lighting.md) on 2026-11-06. It covers lighting as a craft:
- for code-first 3D (three.js and Blender): product shots, abstract 3D and logo stings;
- for 2D motion graphics that simulate light.

It is reference material, not an implemented check. It is about 19k tokens, so read one section (`vcr refs section lighting <§>`) or one rule (`vcr rules info LIGHT-…`). Its IDs are already named.

| Task | Read |
| --- | --- |
| Key, fill and rim, ratios, hard against soft, falloff, colour temperature | §1 |
| Standard setups: three-point, product and tabletop, silhouette, cyclorama | §2 |
| HDRIs and environments | §3 |
| Physically based light in three.js and Blender (units, light types, Eevee against Cycles) | §4 |
| Exposure and tone mapping, and keeping brand colours accurate | §5 |
| Shadows, occlusion and shadow catchers | §6 |
| Atmosphere, bloom, flares and emissives | §7 |
| Light in flat 2D motion graphics | §8 |
| Lighting in motion: sweeps, noise, denoiser flicker, seeds, loops | §9 |
| Lighting brands and products; avoiding "studio grey" | §10 |
| Render cost | §11 |
| Measure | §12, §19 |
| Critique or create | §13, §15–16, §21 |
| Check a claim | §22 (caveats), §23 (verification ledger) |

## Open decisions before building `rules.json`, checks or a skill

1. **Settled: rule owners** ([shared conventions](../README.md)).
   - `LIGHT-DETERMINISM` is dropped in favour of the shared determinism check (#146). `LIGHT-SEED-FIXED` stays as the authoring rule for Blender Cycles.
   - `LIGHT-LOOP-SEAM` is dropped in favour of `MOTION-RHY-004`.
   - `LIGHT-FLICKER-SAFETY` is dropped in favour of `A11Y-FLASH-*`.
   - `LIGHT-SWEEP-LEGIBILITY` is dropped in favour of `TYPO-CONTRAST`, measured over the text's lifetime, which includes the peak of a sweep.
   - **Lighting owns renderer output:** the tone mapper (`LIGHT-TONEMAP-EXPLICIT`, `-TONEMAP-ONCE`) and output colour space (`LIGHT-OUTPUT-COLORSPACE`). The texture half of that rule belongs to materials (`MAT-TEXTURE-COLORSPACE`), and `MAT-COLOR-MANAGEMENT-OUTPUT` and `MAT-TONEMAP-BRAND` are dropped in favour of it.
   - **Brand colour on rendered 3D:** `LIGHT-BRAND-DELTAE` owns it, measured after tone mapping, and `MAT-BRAND-DELTAE` is dropped. Its tolerance is the same value art uses for palette conformance, read from the brief.
   - **Clipping:** `LIGHT-CLIP-HIGHLIGHTS` owns it, including emissives, and `MAT-EMISSIVE-CLIP` is dropped.
2. **Values from the brief.** The key-to-fill ratio (`LIGHT-KEY-FILL-RATIO`), the series rig (`LIGHT-SERIES-RIG`) and the key direction across episodes (`LIGHT-DIRECTION-CONSISTENT`) check against values only a brief can hold. They join the brief schema (#141) as a lighting block.
3. **Asset provenance in one place.** `LIGHT-HDRI-LICENCE`, `MAT-LICENCE-PROVENANCE` and `SOUND-LICENSE-RECORD` are the same requirement for different assets. The PRD's asset manifest already carries provenance and rights (L1). One rule should check the manifest, and these three become pointers to it.
4. **Measuring from frames needs scene data.** Ratios, separation and clipping are measured on the subject, so the check needs the subject's region. That is a `subject` region from `regions(t)` or the reserved `data-vcr-id`, settled in [the scene contract](../../skills/start/references/scene-contract.md) (#143). For three.js, the projection comes through the scene hook.
5. **Uncalibrated heuristics.** These stay advisory until calibrated: the ratio bands, the separation edge contrast, the clipping and crush percentages, and the temporal noise limit. The ledger marks several three.js figures as secondary sources (for example A-Frame issue #5546).
