---
name: typography
description: Design or revise text, type systems, captions and their placement or timing for a specific medium. Use for type choice, hierarchy, legibility and text layout; use independent critique when a review is requested.
---

# Typography

Advisory and uncalibrated.

Look up applicable rule definitions in the referenced section or canonical rules data before applying a limit; never use thresholds from memory. Read one section at a time and preserve provisional status.

Scale the work to the request: inspect the affected text in its composition for a local revision; establish a broader system when the brief calls for one. Profile the real copy, audience, medium, viewing size, languages and scripts, text roles, duration and delivery requirements. Choose applicable rules and the relevant profile; do not treat every heuristic as a universal gate. Test candidate faces with actual text, including needed characters and numerals, and check licensing and available font features. Establish a hierarchy and type system suited to the content, then refine spacing, line breaks, placement and contrast at intended size.

For feedback such as “hard to read”, inspect the actual text at intended size and identify whether hierarchy, contrast, spacing, placement or dwell is implicated. Change the supported cause and compare again in context.

Keep the intended font reproducible: record the exact face and available licence, retain permitted font files or acquisition details, and verify the intended face is ready before measuring or rendering (`TYPO-FONT-SHIP`, `TYPO-FONT-READY`). When no face or file is supplied, give a concrete acquisition plan: identify a candidate and its authoritative distribution, record the exact family, style and version to obtain, inspect and record its licence and permitted use, and retain the permitted file or precise acquisition details. Mark all unverified until acquired and checked; verify loading and glyph coverage before measuring. Missing or substituted glyphs need investigation before layout changes.

For moving text, design readable settled holds and inspect entrances and exits at the delivery frame rate. For captions, coordinate wording, timing, placement and access requirements with the accessibility workflow. Record font choices, licences, roles, placement, timing and uncertainties in the existing workspace notes or spec.

Read only the needed route in [typography](../../references/typography/README.md): §3–6 for faces and layout, §8 for contrast, the relevant §9 medium section for captions or motion, §10 for scripts, §12 for creation and §15.5 for frame timing. [Rules data](../../references/typography/rules.json) is canonical for thresholds and presets: consult `TYPO-SIZE`, `TYPO-HOLD`, `TYPO-SAFE`, `TYPO-CONTRAST` and `TYPO-CAPTION-*` as applicable rather than copying values. Accessibility owns caption access and motion alternatives; motion owns choreography; delivery owns encoding requirements.

Inside this repository `vcr` means `pnpm vcr`; in an installed plugin it means `node <plugin-root>/cli/vcr.mjs`, with the plugin root two directories above this skill. For supported browser scenes, use `vcr lint` with the applicable safe-zone preset; it measures sampled placement and overflow, not every moment or typography rule. Treat an inability to assess as missing evidence. Inspect rendered text at intended viewing size, including holds, font rendering and encoded output when available; other typography checks remain manual. Report measurements, visual judgement and provisional assumptions separately, and hand off text roles, font and layout choices, timing and unresolved issues for independent review when useful.

## Evidence and scope

For a local request, preserve settled decisions and identify the specific proposed change and its downstream effects. Separate supplied facts from assumptions and recommendations; state what was actually inspected, what is missing and which decisions need a person. Do not treat a draft, a plan check or a static description as proof of rendered behaviour or approval.
