# Research brief: Data Visualisation in Motion

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/data-visualisation/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **data visualisation in motion: animated charts, data stories and numbers on screen**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`DATA-`**.

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

Research **how to show data truthfully and clearly in motion graphics and video**: animated charts, maps, counters, rankings and data-led stories. Motion and pacing cover how things move and how long they stay on screen. This pillar covers whether a chart in motion is accurate and readable. Cite `MOTION-*`, `PACE-*`, `ART-*` and `TYPO-*` rather than restating them.

Cover:
- **Static foundations that motion must not break:**
  - truthful scales and baselines (bar charts from zero, when a non-zero axis is honest);
  - aspect ratio and slope perception (banking to 45°);
  - area against length encodings, and the evidence on graphical perception (Cleveland & McGill, Heer & Bostock);
  - colour scales for data (sequential, diverging, categorical; cite `ART-*` for palettes and accessibility for CVD);
  - labelling over legends;
  - annotation.
- **Animated transitions:**
  - the research on animated transitions in statistical graphics (Heer & Robertson 2007 and successors);
  - staging;
  - object constancy;
  - when animation helps tracking and when it misleads;
  - the evidence on trend animation (Robertson et al. 2008, "Gapminder" studies);
  - staggered against simultaneous movement for many marks.
- **Building a chart on screen:**
  - the order of reveal (axes, then data, then annotation, or the reverse);
  - the time each element needs to be read (cite `PACE-*` and `TYPO-HOLD`);
  - how many data points a viewer can follow per beat;
  - emphasis by isolation.
- **Numbers on screen:**
  - count-ups (duration, easing, when they add drama and when they hide the value);
  - rounding and units;
  - large-number formats and locales;
  - comparison framing (relative against absolute, per-capita);
  - showing uncertainty (error bars, ranges, probability in motion).
- **Maps in motion:**
  - projections and their distortions;
  - choropleth pitfalls (area bias, normalisation);
  - camera moves on maps;
  - route and flow animation.
- **Integrity and misleading motion:**
  - truncated axes, cherry-picked windows, dual axes, scale changes mid-animation, 3D distortion and easing that implies false acceleration;
  - published guidance from newsrooms and statistical bodies (the ONS, the Financial Times Visual Vocabulary, Reuters and BBC graphics guides, the UK Government Analysis Function).
  Quote exactly.
- **Sourcing and provenance:** on-screen source lines, data dates, and how a reviewer verifies that the numbers in a scene match the data file.
- **Data-driven scenes in VCR:** separating data from scene code, deterministic layout from data, and re-rendering when the data changes. Cover the formats (CSV, JSON, Vega-Lite specs) and the tools that fit code-first, seekable rendering (D3, Vega, Observable Plot, hand-built SVG).
- **Measurement:** what an agent can check from a scene's data file and sampled DOM or SVG geometry. Examples:
  - bar lengths proportional to values within a tolerance;
  - the axis includes zero where the chart type requires it;
  - labels match data values after rounding;
  - every mark is visible long enough to read;
  - object constancy holds across a transition (the same datum keeps its identity);
  - the source line is present.
- **Critique practice:** how data journalists and graphics editors critique ("chart junk", "lie factor", "spaghetti", "the animation is doing the work the chart should"), and how each maps to a measurement. Include Tufte's lie factor and data-ink ideas, noting which are evidence-based and which are taste.

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
