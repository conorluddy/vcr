---
name: data-visualisation
description: Design or revise a chart, map, counter, or animated quantitative explanation from data and a claim. Use when choosing encodings or transitions; do not use for decorative graphics without quantitative meaning.
---

# Data visualisation

> Unpublished draft; advisory and uncalibrated. Links target the intended final location `skills/data-visualisation/SKILL.md` and resolve after relocation.

Before applying a limit, look up the applicable rule or its referenced section; do not copy thresholds from this draft.

Start with the claim, viewer task, source data, units, transformations, uncertainty, delivery context and available space. Identify missing provenance, transformations or unsupported claims before encoding them; resolve these with the source owner rather than inventing values. For a local revision, preserve settled encodings and revisit only affected states and transitions. Read [data visualisation routing](../../references/data-visualisation/README.md); use only the relevant section: §1 for scales and labels, §2–3 for transitions and reveals, §4 for numbers, §5 for maps, §6–7 for integrity and provenance.

Choose an encoding that supports the viewer task and preserves the data's relationships; choose the scale and baseline for what the marks mean, not just what fits the frame. If the comparison cannot be read reliably in motion, consider a held comparison or separate views with pacing. Design readable rest states before movement; label units, sources and uncertainty as needed (`DATA-ZERO-BASELINE`, `DATA-LABEL-MATCH`, `DATA-SOURCE-LINE`, `DATA-PROVENANCE`). Give marks stable identities across related states; cut between unrelated states when continuity would mislead. Avoid overshoot in data geometry and numerals (`DATA-OBJECT-CONSTANCY`, `DATA-NO-OVERSHOOT`). Make intermediate values clearly transitional, not observed facts. Use redundant distinctions (`A11Y-COLOR-ALONE`) and locale-appropriate formatting (`ADAPT-LOCALE-FORMAT`).

Compare rendered marks and labels with the source and transformations at representative rest states, then inspect transitions for changing scales, lost identity or implied observations; watch at delivery speed and inspect the delivered version. If a discrepancy appears, trace it to the data, mapping, labels or transition before changing the encoding. For maps, assess projection and aggregation against the claim. Record sample times, what was compared and uncertainty. No geometry/data check or sub-frame overshoot measurement is implemented: manual inspection is evidence, not proof of all frames. Where appropriate pass the existing optional scene `data` block and rest markers to production. Hand narrative claims to story, timing to pacing and legibility to typography; retain sources and decisions in the selected workspace.
