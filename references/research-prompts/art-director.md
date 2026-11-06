# Research brief: Art Direction: Colour, Composition and Visual Consistency

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/art-director/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **art direction: colour, composition and visual consistency**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`ART-`**.

## Context: what this is for

You are researching for **VCR**, an agent-driven studio for code-first motion graphics and video. AI coding agents write scenes as source code, and a human reviews the renders.

- **Authoring tools:**
  - Browser scenes in GSAP, Anime.js, the Web Animations API, CSS, SVG, canvas-2d, p5.js, PixiJS, Konva, Two.js and three.js.
  - Stills in resvg, ImageMagick and sharp.
  - 3D in Blender.
  - Assembly and encoding in FFmpeg: `yuv420p` H.264 for web delivery, ProRes 4444 for alpha masters.
- **Rendering:** deterministic and frame by frame. Every browser scene exposes `window.__scene = { duration, seek(t) }`. Headless Chromium (Playwright) seeks each frame at a fixed fps (24, 25, 30 or 60) and screenshots it. Because a scene can be seeked to any time, any property of any element can be sampled as a time series. Optional `markers` (beat times) and `textBounds()` (for canvas text) extend the contract.
- **Output:** VCR is domain-agnostic and serves any kind of creative work. Examples include product launches, explainers, ads, title sequences, data stories, music visuals, social shorts and stills. Common deliveries are vertical 9:16 (1080 × 1920 for TikTok, Instagram Reels and YouTube Shorts), 16:9 and square, either as one-off pieces or as series of many episodes built from a shared look. Guidance must be general; anything specific to one brand or subject belongs in that project's brief, not in this reference.
- **Audio:** sparse text-to-speech narration, with procedural (synthesised) SFX and music beds. Most viewers watch with the sound off.
- **What exists already:** a typography knowledge base built from a research brief like this one. It defines rule IDs (`TYPO-*`), confidence tiers and a verification ledger. A canonical `rules.json` is generated from it. `vcr lint` measures safe zones and text overflow in the browser, and a `typographer` subagent critiques rendered frames. **Your document seeds the next pillar.**

Your report will become a reference that agents read one section at a time; it is too long to load whole. From it we will build:
1. a machine-readable rules data file;
2. automatic checks that measure scenes, frames or audio;
3. a workflow skill of about 1.5k tokens that guides creation;
4. a reviewer subagent that critiques renders the way the typographer does.

Write for those consumers. Be specific, measurable where honest, and explicit about uncertainty.

## Scope

Research **art direction for motion graphics and social video**: colour, composition, focal point, visual style and keeping a look consistent across a long series.

Cover:
- **Colour systems:**
  - palette construction;
  - perceptually uniform spaces (OKLCH/OKLab, CIELAB) and why HSL misleads;
  - tints and shades, neutrals, accent ratios (for example 60-30-10, with its evidence and origin);
  - colour harmony theories, and what evidence exists for them.
- **Colour difference:** CIEDE2000 ΔE and the just-noticeable-difference thresholds for brand colour consistency. Cover the tolerances that brand and print industries use, with sources.
- **Colour management for video delivery:**
  - sRGB vs Display P3 vs Rec.709 (BT.709), and gamut mapping from P3 design tokens to sRGB/709;
  - full vs limited range;
  - what happens to saturated colours under `yuv420p` chroma subsampling and platform re-encodes;
  - how phone displays and dark mode change perception.
- **Contrast beyond text:** figure-ground separation, luminance hierarchy, and checking value structure (the greyscale test).
- **Composition:**
  - visual weight and balance;
  - the rule of thirds, and the actual evidence for it (it is often overstated);
  - leading lines, focal points and the hierarchy of attention;
  - negative space;
  - grids and safe composition for 9:16 with platform overlays;
  - framing in motion: compositions change over time, so how to keep a focal point across a move.
- **Saliency and attention:** computational saliency models (Itti-Koch, DeepGaze and others) and visual clutter metrics (for example Rosenholtz's feature congestion). Cover how well they predict where viewers look in graphics, as opposed to photographs.
- **Style and visual language:**
  - shape language, line weight, corner radius, illustration consistency, texture and grain, depth and lighting cues;
  - 3D look development basics (three-point lighting, materials) for simple product and object shots.
- **Series consistency vs variation:** how long-running shows and brand campaigns keep recognisable looks while avoiding monotony. Cover style frames, style guides and look books.
- **Cover frames and thumbnails:** what makes the first or cover frame work in a feed at thumbnail size.
- **Avoiding the generic look:** what makes motion graphics read as template-made or AI-generated, and how art directors push past it.
- **Measurement:** what an agent can compute from rendered frames. Examples are dominant colours (clustering), ΔE distance to a brand palette, luminance histograms and value structure, colourfulness metrics (Hasler & Süsstrunk), edge density and clutter, saliency maps, and checking whether the focal point sits where the brief intends. Give the reliability of each.
- **Critique practice:** the vocabulary art directors use ("muddy", "busy", "no focal point", "off-brand", "flat") and how each maps to measurable properties.

## Deliverable

A single Markdown document of roughly 20–35k tokens, structured as follows:

1. **Status blockquote:** scope, and the confidence tiers used.
2. **TL;DR:** 5–8 bullets.
3. **Key findings:** the ten most important, each with a citation.
4. **Numbered sections:** the topics above, in a sensible order. Each one is dense and scannable, with concrete values, examples and failure modes.
5. **Medium-specific guidance:** 9:16 social, 16:9, square, stills and loops.
6. **The analysis/critique process:** how an expert reviews work in this pillar. Give it as ordered steps, with severity guidance and the vocabulary to use in findings.
7. **The creation process:** how an expert approaches a new piece, from brief to verification.
8. **Authoritative sources and canon:** the books, standards, papers and practitioners that matter, and why.
9. **Encoding for an AI agent:**
   - A **rules table** with columns `ID | Check | Threshold | Tier | Applies to`. Use stable IDs with the prefix given above.
   - Each rule gets a **tier**: `standard` (a published standard or style guide, checked against the primary source), `platform` (published by a platform or vendor; may change without notice) or `heuristic` (practitioner rule of thumb, or a secondary source).
   - For each rule, say what it **applies to**, and whether it is **measurable** (and how) or **judgement only**.
10. **How to measure in VCR.** For each measurable rule:
    - the inputs (DOM and computed styles at time t; element transforms sampled across frames; rendered PNG frames; decoded delivery video; audio files and their cue times);
    - the calculation;
    - the sampling strategy;
    - the known failure modes of the measurement.
11. **VCR-specific rendering and delivery notes:** what changes because scenes are seeked frame by frame, captured at a fixed fps, encoded to `yuv420p`, and re-encoded by platforms.
12. **Master checklists:** one for analysis and one for creation, citing rule IDs.
13. **Caveats:** where sources disagree, where evidence is weak, and what is likely to go out of date.
14. **Verification ledger:** for every load-bearing number, the claim, the result (`confirmed`, `not found`, `contradicted` or `unverified`, with the reason) and the source it was checked against, dated.
15. **Sources:** numbered, with URLs. Cite inline as [n].

## Research rules

- **Sources:** prefer primary sources (standards, platform documentation, peer-reviewed research and practitioners' own writing) over aggregators and marketing blogs. When you must use a secondary source, label it as one.
- **Thresholds:** quote the exact wording for any threshold you take from a source. Never round, merge or invent numbers. If a figure is folklore with no traceable origin, say so and give it the `heuristic` tier.
- **Fetch failures:** if a page cannot be fetched, mark the claim `unverified`. Do not fill the gap from memory.
- **Scope of rules:** separate what applies universally from what applies to a medium, platform or culture. State the scope of every rule.
- **Evidence:** separate evidence about what audiences actually do (studies, platform data) from expert taste. Both matter, so label which is which.
- **Expressive work:** note where breaking a rule is a legitimate creative choice, and what makes that break succeed.
- **Agent behaviour:** call out where an AI agent would plausibly go wrong. Examples are generic, homogenised output; over-applying rules; and judging motion from still frames.
