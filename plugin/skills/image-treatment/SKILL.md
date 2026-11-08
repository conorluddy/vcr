---
name: image-treatment
description: Design or revise an image treatment, composite, texture, mask, or stylised effects stack, including its behaviour in motion and delivery. Use after the visual intent and assets are established; image selection belongs to image direction.
---

# Image treatment

> Advisory and uncalibrated.

Before applying a limit, look up the applicable rule or its referenced section; do not copy thresholds into this workflow.

Start from the visual intent, image placement, source assets, motion and delivery context. For a local revision, preserve the settled stack and change only the affected layers. Preserve originals and connect derivatives to their sources (`IMAGE-ORIGINAL-PRESERVED`, `IMAGE-DERIVATIVE-LINKED`). Read [image treatment routing](../../references/fx/README.md); choose §1–4 for compositing, masks and colour, §5–7 for texture and effects, §8 for motion, or §9–10 for delivery and legibility.

Choose a treatment that supports the visual intent and remains legible at delivery size. Specify the stack and its purpose: layer order, grouping, blend space, masks, texture attachment to frame, object or time, and any intended temporal change (`FX-BLEND-SPACE-DECLARED`, `FX-SCREEN-SPACE-DECLARED`). Keep text legible throughout treatment (`TYPO-CONTRAST`). Choose repeatable sources of variation and declare seeds where relevant (`FX-SEED-DECLARED`, `FX-NO-WALLCLOCK`). Keep treatment decisions distinct from placement and animation; use the existing scene `fx` handoff where applicable.

Name the mask's purpose and coverage, or explicitly state that no mask is needed; keep text outside an image-only treatment when appropriate.

Compare the untreated asset, working composite and encoded result to locate a defect before changing the stack. Inspect representative consecutive frames for crawling, unintended boil and edge defects (`FX-MOIRE-RESAMPLE`, `FX-PREMULT-EDGES`); compare an encoded and decoded test against the intended texture (`FX-TEXTURE-SURVIVAL`). If texture disappears, compare its scale and contrast before and after encoding; if edges fail, inspect the mask and alpha interpretation. Adjust the implicated layer and compare again. Record source–derivative links, stack decisions, inspected frames and remaining uncertainty in existing workspace notes or the scene handoff. No general FX check suite is implemented; inspection is not a flash-safety assessment (`A11Y-FLASH-*`). Hand lighting and surface response to their owners, and delivery defects to delivery (`DELIVERY-BANDING`).
