# Research brief: Adaptation, Versioning and Localisation

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/adaptation/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **adapting one master into many versions: reframing, cutdowns, localisation and variants**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`ADAPT-`**.

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

Research **how one master becomes many deliverables without breaking**: aspect-ratio reframes, duration cutdowns, language versions and other variants of a series at scale. Cite `TYPO-*`, `PACE-*`, `ART-*`, `SOUND-*` and `BRIEF-*` rather than restating them.

Cover:
- **Designing for adaptation from the start:** layout systems that survive 9:16, 1:1, 4:5 and 16:9 (safe cores, anchored regions, responsive type); cite `TYPO-SAFE` for safe zones. Compare "design once, adapt" with "design per format", and how studios and agencies plan a master plus versions.
- **Reframing:**
  - smart and manual reframing (focal points, saliency-driven crop paths);
  - when to recompose instead of crop;
  - text and logo repositioning;
  - what breaks (cut-off subjects, lost hierarchy, crowded type);
  - published tooling and research on automatic reframing (Google AutoFlip, Adobe Auto Reframe), and how reliable it is.
- **Cutdowns:**
  - making 60 s, 30 s, 15 s and 6 s versions from one piece;
  - what must survive every cut (proposition, brand, CTA);
  - the 6 s bumper as its own form;
  - re-timing beats rather than trimming them;
  - music edits and re-scoring for new lengths (cite `SOUND-*`).
  Quote platform guidance on duration formats exactly.
- **Localisation of on-screen text:**
  - text expansion by language (published expansion factors and their sources);
  - line breaking and hyphenation per language;
  - right-to-left and bidirectional text;
  - CJK and complex scripts;
  - font coverage and fallback (cite `TYPO-FONTS`);
  - numbers, dates and units by locale;
  - pseudo-localisation as a test.
- **Localisation of audio and timing:**
  - voice-over replacement and re-timing (languages run longer or shorter);
  - subtitles against dubbing against voice-over by market;
  - caption re-timing;
  - lip sync;
  - keeping SFX and music in sync after re-timing.
- **Cultural adaptation:** colour, gesture, imagery and humour that do not travel; legal and regulatory differences in claims and disclaimers by market. Labelled as guidance, not rules, and with its sources.
- **Variant systems at scale:**
  - parameterised templates and data-driven versions (dynamic creative);
  - version matrices (format × length × language × audience);
  - naming and tracking;
  - how to QC hundreds of variants by sampling;
  - keeping a series consistent across variants (cite `BRIEF-*`).
- **VCR specifics:** VCR renders from source code, so a version is new parameters, not a re-edit. Cover:
  - which parameters a scene should expose for adaptation (aspect, duration, locale, copy);
  - how a scene declares regions and anchors;
  - how to keep every version deterministic and traceable to its master.
- **Measurement:** what an agent can check across a version set. Examples:
  - text fits its box in every locale (overflow across pseudo-localised copy);
  - safe zones hold in every aspect;
  - mandatory elements are present in every cutdown;
  - each version's duration is within its target;
  - the focal subject stays in frame after a reframe;
  - captions and voice-over line up after re-timing;
  - the version matrix is complete.
- **Critique practice:** how versioning and localisation QC teams report problems ("truncated", "clipped in the vertical", "lost the end card in the 6 s", "VO overruns the picture"), and how each maps to a measurement.

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
