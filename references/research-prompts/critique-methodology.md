# Research brief: Creative Critique Methodology and AI Reviewers

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/critique-methodology/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **creative critique methodology and ai reviewers**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`REVIEW-`**.

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
- **What exists already:** a typography knowledge base built from a research brief like this one. It defines rule IDs (`TYPO-*`), confidence tiers and a verification ledger. A canonical `rules.json` is generated from it. `vcr lint` measures safe zones and text overflow in the browser, and a `typographer` subagent critiques rendered frames. **Your document seeds the next pillar.**

Your report will become a reference that agents read one section at a time; it is too long to load whole. From it we will build:
1. a machine-readable rules data file;
2. automatic checks that measure scenes, frames or audio;
3. a workflow skill of about 1.5k tokens that guides creation;
4. a reviewer subagent that critiques renders the way the typographer does.

Write for those consumers. Be specific, measurable where honest, and explicit about uncertainty.

## Scope

Research **how creative work is critiqued well, and how AI models perform as creative reviewers**. This defines the shared method and findings format that all VCR reviewer agents (typography, motion, pacing, art, sound, accessibility) will use, and how their findings are combined and checked against human judgement.

Cover:
- **Human critique practice:**
  - design crits, art school critique formats, and the Pixar Braintrust;
  - "plussing", Liz Lerman's Critical Response Process, and the "I like / I wish / what if" format;
  - how agency creative directors give feedback.
  - Cover what makes feedback actionable, specific and kind, and the evidence on feedback that improves creative work (for example research on critique in design education and on crowd critique).
- **Severity and prioritisation:** severity scales used in usability heuristics (Nielsen's severity ratings), accessibility audits and design QA. Cover how to separate a blocker from a matter of taste.
- **Findings format:** what a good machine-readable finding looks like:
  - location (time, frame or region), issue, evidence, rule cited, severity, suggested fix, confidence;
  - how review tools (frame.io-style timecoded comments, design QA tools) structure feedback.
- **Combining several reviewers:**
  - aggregating and de-duplicating findings;
  - resolving conflicts between specialists;
  - when to escalate to a human;
  - how creative directors weigh competing concerns.
- **AI and LLM reviewers:**
  - the research on LLM-as-judge and VLM-as-judge reliability: position bias, verbosity bias, self-preference, sycophancy, sensitivity to the prompt, and agreement with human raters;
  - how well vision-language models judge aesthetics, layout and typography, and video and motion from sampled frames. Cover benchmarks and their findings;
  - the risk of homogenisation when AI feedback steers every output towards the same "safe" style.
  - Cite papers with dates. This is a fast-moving area, so flag findings older than 18 months.
- **Calibration:**
  - measuring agreement between an AI reviewer and a human director (inter-rater reliability: Cohen's κ, Krippendorff's α);
  - building a small gold set of judged renders;
  - tracking false positives and false negatives over time;
  - deciding when to trust a reviewer more.
- **Independence:** why the reviewer should not be the author. Cover research on self-evaluation bias, and how to give a reviewer enough context (the brief) without anchoring it on the author's intent.
- **Measurement vs judgement:** how to split work between deterministic checks and model judgement, and how to present both to a human so they can scan them quickly.
- **Output requirement, specific to this pillar:**
  - Include a **proposed shared findings schema** as a JSON Schema sketch.
  - Include a **reviewer prompt skeleton** that every pillar agent can follow.
  - Include a **calibration protocol** small enough for one person to run on 20–30 renders.

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
