---
name: materials
description: Design or revise surface appearance, shading, texture interpretation or material interchange for a scene. Use when surface response or export fidelity is the decision; illumination belongs to lighting.
---

# Materials

> Advisory and uncalibrated.

Before applying a limit, look up the applicable rule or its referenced section; do not copy thresholds into this workflow.

Start with objects, intended appearance, reference observations, lighting, motion and target interchange. Read [materials routing](../../references/materials/README.md): §1 and §3 for physical response and surface classes, §4 for texture interpretation, §5 for stylisation, §7–8 for imperfection and motion. For a local revision, retain settled surfaces and change only the affected response or interpretation. Distinguish visible evidence from inferred properties (`VREF-INFERENCE-LIMITS`).

List surfaces and their intended finish. Decide physical, stylised or unlit scope before applying plausibility assumptions (`MAT-PHYSICAL-SCOPE`); the settled glTF material scope lives in `extras.vcr.scope` where applicable. Specify texture colour spaces and normal convention (`MAT-TEXTURE-COLORSPACE`, `MAT-NORMAL-CONVENTION`), and select surface detail consistent with intent (`MAT-IMPERFECTION-BUDGET`). Agree the light and output pipeline with lighting (`LIGHT-TONEMAP-EXPLICIT`, `LIGHT-OUTPUT-COLORSPACE`). Retain source and rights uncertainty with the asset record.

Compare the intended finish with representative views under the stated light, then inspect consecutive frames for surface response and specular crawl (`MAT-SPECULAR-CRAWL`); inspect an export and reimport when interchange is required. Check moiré against `FX-MOIRE-RESAMPLE`. If an exported surface changes, compare source and reimport under the same light and output settings; inspect texture colour space, normal convention and supported surface features before attributing the change to lighting. Change the implicated interpretation and compare again. Record the surface list, scope, texture decisions, conditions, observations and untested cases in existing workspace notes or asset records. No automatic material pillar checks exist; a successful export alone does not prove appearance fidelity. Hand illumination to lighting and 2D treatment to image treatment.

In an interchange diagnosis, identify the target format and check whether it supports the affected surface feature as well as the texture interpretation; leave the cause open until the matched comparison is available.
