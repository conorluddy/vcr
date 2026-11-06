# Research brief: Motion Design and Animation Direction

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/motion-director/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **motion design and animation direction**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`MOTION-`**.

## Context: what this is for

You are researching for **VCR**, an agent-driven studio for code-first motion graphics and video. AI coding agents write scenes as source code, and a human reviews the renders.

- **Authoring tools:**
  - Browser scenes in GSAP, Anime.js, the Web Animations API, CSS, SVG, canvas-2d, p5.js, PixiJS, Konva, Two.js and three.js.
  - Stills in resvg, ImageMagick and sharp.
  - 3D in Blender.
  - Assembly and encoding in FFmpeg: `yuv420p` H.264 for web delivery, ProRes 4444 for alpha masters.
- **Rendering:** deterministic and frame by frame. Every browser scene exposes `window.__scene = { duration, seek(t) }`. Headless Chromium (Playwright) seeks each frame at a fixed fps (24, 25, 30 or 60) and screenshots it. Because a scene can be seeked to any time, any property of any element can be sampled as a time series. Optional `markers` (beat times) and `textBounds()` (for canvas text) extend the contract.
- **Main output:** series of short vertical videos (1080 × 1920 for TikTok, Instagram Reels and YouTube Shorts), often faceless and educational, made in batches of up to 100 episodes. The first client is a martial-arts training app, with formats such as quizzes ("tap or wait"), scorecards, "read the position" and explainers. There are also 16:9 explainers and social stills.
- **Audio:** sparse text-to-speech narration, with procedural (synthesised) SFX and music beds. Most viewers watch with the sound off.
- **What exists already:** a typography knowledge base built from a research brief like this one. It defines rule IDs (`TYPO-*`), confidence tiers and a verification ledger. A canonical `rules.json` is generated from it. `vcr lint` measures safe zones and text overflow in the browser, and a `typographer` subagent critiques rendered frames. **Your document seeds the next pillar.**

Your report will become a reference that agents read one section at a time; it is too long to load whole. From it we will build:
1. a machine-readable rules data file;
2. automatic checks that measure scenes, frames or audio;
3. a workflow skill of about 1.5k tokens that guides creation;
4. a reviewer subagent that critiques renders the way the typographer does.

Write for those consumers. Be specific, measurable where honest, and explicit about uncertainty.

## Scope

Research the craft of **motion design for motion graphics and short-form video**: what makes animation feel intentional, readable and alive rather than mechanical or generic.

Cover:
- **Principles:** the Disney/Thomas & Johnston twelve principles as applied to motion graphics, UI and kinetic type (squash and stretch, anticipation, staging, follow-through, overlapping action, slow in and slow out, arcs, secondary action, timing, exaggeration, appeal). Say which translate to 2D vector and typographic motion, and how.
- **Easing:**
  - the families (sine, quad, cubic, expo, back, elastic, bounce) and cubic-bezier curves;
  - spring physics (mass, stiffness, damping; damping ratio; settle time; overshoot);
  - when each fits a voice or brand.
  - Include GSAP, CSS and WAAPI easing vocabulary, and Material, Apple HIG, IBM Carbon and Fluent motion guidance with their published duration and easing values.
- **Timing and duration:** durations by distance travelled, element size and importance. Cover entrance, exit and emphasis timing, and the readable range for each. Include the evidence for human perception of motion: thresholds for perceived smoothness and causality, and how fast an action can be before viewers stop following it.
- **Choreography:**
  - staggering, sequencing, offsetting overlapping actions, and motion hierarchy (what moves first, and leads the eye);
  - grouping and continuity across scene transitions (match cuts, shared-element transitions, morphs).
- **Rhythm:** syncing to music or beat grids, holds and rests, contrast between busy and calm passages, and loops (seamless, ping-pong, loop length on social platforms).
- **Camera language in 2D and 2.5D:** pushes, pans, parallax and depth cues, and how far they can go before viewers feel motion sickness.
- **Frame rate:**
  - 24/25/30/60 fps, judder on slow pans, motion blur and shutter angle;
  - temporal aliasing and strobing of thin or high-contrast elements;
  - what fixed-fps deterministic capture loses compared with real-time playback.
- **Accessibility of motion:** vestibular triggers, `prefers-reduced-motion`, and WCAG 2.2.2 and 2.3.3. Cross-reference this only; another pillar covers accessibility in depth.
- **Measurement:** how motion quality can be quantified from per-element time series of position, scale, rotation and opacity sampled every frame. Cover velocity, acceleration and jerk profiles; detecting the frame where motion settles; overshoot percentage; and how evenly a stagger is spaced. Include any published metrics or tools for evaluating animation quality.
- **Critique vocabulary:** how motion designers give feedback ("floaty", "snappy", "mushy", "stiff", "telegraphed") and what each maps to in curves and timing.
- **Avoiding sameness:** what distinguishes signature motion from template motion, and how studios write motion principles into brand guidelines (collect published examples).

## Deliverable

A single Markdown document of roughly 20–35k tokens, structured as follows:

1. **Status blockquote:** scope, and the confidence tiers used.
2. **TL;DR:** 5–8 bullets.
3. **Key findings:** the ten most important, each with a citation.
4. **Numbered sections:** the topics above, in a sensible order. Each one is dense and scannable, with concrete values, examples and failure modes.
5. **Medium-specific guidance:** 9:16 social first, then 16:9 explainer, social stills and loops.
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
