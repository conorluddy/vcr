---
name: lighting
description: Design or revise illumination, exposure, shadow or simulated light in a 2D or 3D scene. Use for light direction and temporal behaviour; material surface response belongs to materials.
---

# Lighting

> Unpublished draft; advisory and uncalibrated. Links target the intended final location `skills/lighting/SKILL.md` and resolve after relocation.

Before applying a limit, look up the applicable rule or its referenced section; do not copy thresholds from this draft.

Start with the brief's focal intent, required views, geometry or 2D regions, surface response, and delivery context. Read [lighting routing](../../references/lighting/README.md): §1–3 for light and environment, §5–7 for exposure, shadows and atmosphere, §8 for simulated 2D light, §9 for movement. Reuse settled lighting for a local revision and change only what the evidence implicates. Reference images show observed light, not a known unseen rig (`VREF-INFERENCE-LIMITS`).

State the light's motivation and hierarchy; shape the focal form with key, fill and separation as appropriate. Specify direction, softness, exposure, environment and temporal behaviour so the look can be reproduced. Agree surface response with materials; declare output colour space and tone mapping once (`LIGHT-OUTPUT-COLORSPACE`, `LIGHT-TONEMAP-EXPLICIT`, `LIGHT-TONEMAP-ONCE`). For simulated 2D light, relate highlights and shadows to the chosen direction, and record deliberate exceptions. Preserve intended series direction where specified (`LIGHT-DIRECTION-CONSISTENT`).

Give an exposure approach even when an exact value cannot yet be measured: identify what should retain detail and what evidence will set the final exposure. For a joint light/surface defect, hold output and material settings fixed while comparing lighting, then hold lighting fixed while comparing surface response; change only the contribution supported by that comparison.

Compare representative frames and consecutive frames for clipping, loss of form and unwanted temporal variation (`LIGHT-CLIP-HIGHLIGHTS`). Check text over its full exposure to changing light (`TYPO-CONTRAST`); assess loop seams with `MOTION-RHY-004`. When form disappears or a sweep obscures text, compare affected and unaffected frames and isolate illumination, surface response or output changes before revising the responsible setting. Reinspect the affected interval. Record the lighting decisions, views, times and conditions in existing workspace notes; no automatic lighting checks exist, and visual inspection cannot establish flash safety (`A11Y-FLASH-*`). Hand surface changes to materials and treatment effects to image treatment.
