# Research brief: Concept, Script and Storyboard

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/story/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **concept development, scriptwriting and storyboarding for motion graphics and short-form video**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`STORY-`**.

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
- **What exists already:** knowledge bases for typography (`TYPO-*`), art direction (`ART-*`), motion (`MOTION-*`), pacing (`PACE-*`), sound (`SOUND-*`), series briefs (`BRIEF-*`) and critique methodology (`REVIEW-*`), with accessibility (`A11Y-*`) in progress. Each defines rule IDs, confidence tiers and a verification ledger. Typography also has a canonical `rules.json`, `vcr lint` (safe zones and text overflow) and a `typographer` reviewer subagent. A series brief holds the values for one production (tokens, palette, durations); the pillars own the checks. Where your topic touches another pillar, cite its prefix and do not restate its numbers. **Your document seeds the next pillar.**

Your report will become a reference that agents read one section at a time; it is too long to load whole. From it we will build:
1. a machine-readable rules data file;
2. automatic checks that measure scenes, frames or audio;
3. a workflow skill of about 1.5k tokens that guides creation;
4. a reviewer subagent that critiques renders the way the typographer does.

Write for those consumers. Be specific, measurable where honest, and explicit about uncertainty.

## Scope

Research **how an expert gets from a brief to a buildable plan before any scene is made**: concepts, scripts, shot lists, storyboards and animatics. Every other pillar judges or shapes a piece once it exists. This one decides what is worth building, and so where an agent saves the most wasted renders. Cite `BRIEF-*` for what the brief holds, `PACE-*` for timing and structure, and `MOTION-*` for movement; do not restate their rules.

Cover:
- **Concept development:**
  - how agencies and studios generate and choose concepts: the number of routes, divergence before convergence, and the "one idea" test;
  - what makes a concept strong (a single-minded idea, a visual metaphor, a twist, a demonstration) or weak (a list of features, a mood with no idea);
  - how to present concept routes so a human can choose;
  - evidence on creativity and effectiveness, such as the IPA, System1 and Binet & Field work on creative quality and the effectiveness of distinctive assets, labelled by strength.
- **Visual metaphor and demonstration:**
  - how motion graphics explain abstract ideas (metaphor, transformation, comparison, build-up);
  - when literal beats metaphorical;
  - the failure of illustrating every word.
- **Scriptwriting:**
  - two-column AV scripts;
  - narration written for the ear, against on-screen copy written for the eye;
  - word counts by duration (cite `SOUND-NARRATION-WPM`);
  - script structures for explainers, ads, launches, title sequences and data stories;
  - drafts and table reads;
  - TTS-specific writing (pronunciation, SSML, numbers).
- **Shot lists and beat sheets:** how a script becomes a list of beats, with what each beat must show, its duration budget, its transition and its sound cue. Cover the minimum information a beat needs for a builder to work without asking.
- **Storyboards:**
  - what a storyboard frame must carry (composition, key text, motion arrows, timing, notes);
  - thumbnails against finished boards;
  - style frames;
  - boards for 9:16 against 16:9;
  - how studios hand boards to animators.
- **Animatics and previz:**
  - timing a board to scratch audio;
  - what an animatic proves and what it cannot;
  - when to skip it;
  - how cheap low-fidelity tests (greyboxes, blocking passes) catch structural problems before polish.
- **Review gates:** the checkpoints studios use (concept, script, board, animatic, first cut, final), what a human approves at each, and the cost of changes late. Say which gates an AI agent should never skip.
- **Series formats:** planning many episodes from one format, including episode templates, story banks and avoiding repetition. Cite `BRIEF-*` for the series bible.
- **Measurement:** what can be checked automatically in a plan before rendering. Examples:
  - script word count against duration;
  - beats per second of runtime;
  - every brief mandatory mapped to a beat;
  - every on-screen claim sourced;
  - board coverage of every beat;
  - animatic timing against the target.
  Include machine-readable formats for scripts, shot lists and boards (Fountain, the Final Draft XML schema, EDL and OTIO), and say which suit agents.
- **Critique practice:** how creative directors critique concepts and scripts ("no idea here", "it's a list", "tell, don't show", "where's the turn?", "too many messages"), and how each maps to a property of the plan.

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
