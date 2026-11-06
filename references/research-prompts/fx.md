# Research brief: Image Treatment, Blending and Compositing Effects

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/fx/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **image treatment, blend modes, layer compositing and graphic effects for stills and motion**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`FX-`**.

## Context: what this is for

You are researching for **VCR**, an agent-driven studio for code-first motion graphics and video. AI coding agents write scenes as source code, and a human reviews the renders.

- **Authoring tools:**
  - Browser scenes in GSAP, Anime.js, the Web Animations API, CSS, SVG, canvas-2d, p5.js, PixiJS, Konva, Two.js and three.js.
  - Stills in resvg, ImageMagick and sharp.
  - 3D in Blender.
  - Assembly and encoding in FFmpeg: `yuv420p` H.264 for web delivery, ProRes 4444 for alpha masters.
- **Rendering:** deterministic and frame by frame. Every browser scene exposes `window.__scene = { duration, seek(t) }`. Headless Chromium (Playwright) seeks each frame at a fixed fps (24, 25, 30 or 60) and screenshots it. Because a scene can be seeked to any time, any property of any element can be sampled as a time series. Optional `markers` (beat times) and `textBounds()` (for canvas text) extend the contract.
- **Output:** VCR is domain-agnostic and serves any kind of creative work. Examples include product launches, explainers, ads, title sequences, data stories, music visuals, social shorts and stills. Common deliveries are vertical 9:16 (1080 × 1920 for TikTok, Instagram Reels and YouTube Shorts), 16:9 and square, either as one-off pieces or as series of many episodes built from a shared look. Guidance must be general; anything specific to one brand or subject belongs in that project's brief, not in this reference.
- **Audio:** anything from no audio to full mixes. That includes recorded or text-to-speech narration, licensed or original music, and recorded or procedurally synthesised SFX (synthesis must be deterministic). Some placements are mostly watched muted; others are sound-led.
- **What exists already:** knowledge bases for typography (`TYPO-*`), art direction (`ART-*`), motion (`MOTION-*`), pacing (`PACE-*`), sound (`SOUND-*`), accessibility (`A11Y-*`), series briefs (`BRIEF-*`), critique methodology (`REVIEW-*`), story (`STORY-*`), delivery (`DELIVERY-*`), adaptation (`ADAPT-*`) and data visualisation (`DATA-*`). Each defines rule IDs, confidence tiers and a verification ledger. Typography also has a canonical `rules.json`, `vcr lint` (safe zones and text overflow) and a `typographer` reviewer subagent. A series brief holds the values for one production (tokens, palette, durations); the pillars own the checks. Where your topic touches another pillar, cite its prefix and do not restate its numbers. **Your document seeds the next pillar.**

Your report will become a reference that agents read one section at a time; it is too long to load whole. From it we will build:
1. a machine-readable rules data file;
2. automatic checks that measure scenes, frames or audio;
3. a workflow skill of about 1.5k tokens that guides creation;
4. a reviewer subagent that critiques renders the way the typographer does.

Write for those consumers. Be specific, measurable where honest, and explicit about uncertainty.

## Scope

Research **the layer techniques that give stills and motion graphics a crafted, graphic look**: blend modes, masks, colour treatments, print-process effects, textures and stylised filters. Examples are a two-colour threshold multiplied onto paper, risograph misregistration, halftones and duotones. Art direction (`ART-*`) owns colour intent, palettes and composition; this pillar owns the techniques that produce a look. Cite `ART-*`, `TYPO-*`, `MOTION-*`, `DELIVERY-*` and `A11Y-*` rather than restating them.

**Tool independence.** VCR keeps craft separate from tools (ADR 0006): describe each technique by what it does and its maths, so any tool can implement it. Give recipes for open-source and web tools (CSS, SVG filters, canvas or WebGL shaders, ImageMagick, sharp, FFmpeg, Blender) as labelled worked examples, never as the rule itself. Commercial tools (Photoshop, After Effects, Cinema 4D, Octane, Redshift) may be named as the origin of a technique or its vocabulary, with the open equivalent beside it.

Cover:
- **The compositing model:**
  - W3C *Compositing and Blending Level 1* (every blend mode's formula, quoted exactly; separable and non-separable modes);
  - Porter-Duff operators;
  - premultiplied and straight alpha;
  - isolation and knockout groups;
  - how CSS `mix-blend-mode`, `background-blend-mode`, SVG `feBlend` and `feComposite`, canvas `globalCompositeOperation`, ImageMagick `-compose`, FFmpeg `blend` and Blender's compositor map onto those definitions, and where they differ.
- **Colour space of blending:**
  - sRGB-encoded against linear-light blending and why the "same" multiply or screen differs between tools;
  - gamma-correct blending;
  - what each tool does by default.
- **Masks and mattes:** luminance against alpha masks, clipping, text as a mask (knockout type), track mattes, feathering and soft edges, and masks in motion.
- **Tonal and colour treatments:**
  - threshold and posterisation;
  - duotone, tritone and gradient maps;
  - curves and levels;
  - selective colour;
  - split toning;
  - colour lookup tables (3D LUTs: `.cube` format, how to apply and generate them).
- **Print-process looks:**
  - halftone (AM and FM screens, dot shape, screen angles, moiré);
  - risograph and screen print (limited inks, overprint, misregistration, ink spread);
  - letterpress, photocopy and newsprint;
  - dithering (ordered/Bayer, error diffusion such as Floyd–Steinberg and Atkinson, blue noise).
- **Textures and surfaces:** paper, grain, film grain (and how it differs from noise), dust and scratches, scan artefacts, applying textures with blend modes, and procedural textures (Perlin and simplex noise, `feTurbulence`) against photographic ones.
- **Stylised effects:**
  - glow and bloom;
  - chromatic aberration and RGB split;
  - displacement and distortion maps;
  - blur types (Gaussian, motion, radial, tilt-shift) and their cost;
  - scanlines and CRT looks;
  - glitch and datamosh;
  - double exposure;
  - collage, cut-out and torn paper;
  - drop shadows and long shadows;
  - outlines and strokes on raster.

  For each, give its intent, how it works, typical parameters and when it reads as cheap.
- **Effects in motion (the most important section):** stills tutorials ignore time, so cover each of these with its fix:
  - **Temporal stability:** thresholds, dithers and posterisation flicker and "boil" on moving input as values cross the cut-off. Cover smoothing, hysteresis, fixed screens, and deliberate boil at stepped rates such as animating on twos.
  - **Determinism:** seeded noise and textures; textures fixed to the frame, to the object, or animated on purpose.
  - **Screen and pattern behaviour:** halftone screens and dither patterns that crawl when the image moves under them; whether the screen moves with the object or the frame.
  - **Animating the effect's parameters:** threshold sweeps, grain intensity, misregistration drift.
  - **Flashing risk:** high-contrast treatments that flicker (cite `A11Y-FLASH-*`).
- **Delivery survival:** how grain, halftone, dither and fine texture behave under H.264 at platform bitrates and after re-encoding (banding, mush, moiré against the encoder's blocks). Cite `DELIVERY-*` for limits, and say what survives at social bitrates.
- **Legibility:** text over textured or treated imagery (cite `TYPO-CONTRAST`), and treatments that destroy readability or the focal point.
- **Cost in a seek-and-capture renderer:** the relative cost of SVG filters, CSS filters, backdrop filters, canvas and WebGL shaders in headless Chromium; caching static treatments as pre-rendered assets against computing them per frame.
- **Measurement:** what an agent can check:
  - temporal flicker (frame-to-frame luminance variance in treated regions);
  - determinism (the same frame twice);
  - texture survival after a simulated re-encode;
  - contrast of text over the treatment;
  - the blend colour space declared and consistent;
  - render cost per frame.
- **Critique practice:** how designers critique treatments ("muddy", "plasticky", "filter-y", "overcooked", "it's a preset"), and how each maps to a parameter or measurement. Cover what separates a crafted treatment from a one-click preset.

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
   - A **rules table** with columns `ID | Check | Threshold | Tier | Applies to`. Use stable named IDs with the prefix given above: uppercase words joined by hyphens, no digits, naming what the rule checks (for example `TYPO-SAFE` or `TYPO-CAPTION-CPS`, never `TYPO-01`).
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
