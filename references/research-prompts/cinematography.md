# Research brief: Camera, Lens and Spatial Staging for 3D and 2.5D Motion Graphics

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/cinematography/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **virtual cinematography for code-first motion graphics: camera, lens, framing in depth, camera movement and spatial staging in 3D and 2.5D scenes**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`CAMERA-`**.

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
- **What exists already:** knowledge bases for typography (`TYPO-*`), art direction (`ART-*`), motion (`MOTION-*`), pacing (`PACE-*`), sound (`SOUND-*`), accessibility (`A11Y-*`), series briefs (`BRIEF-*`), critique methodology (`REVIEW-*`), story (`STORY-*`), delivery (`DELIVERY-*`), adaptation (`ADAPT-*`), data visualisation (`DATA-*`), image treatment (`FX-*`), lighting (`LIGHT-*`), materials (`MAT-*`), domain exploration (`DOMAIN-*`), visual research (`VREF-*`), cultural context (`CULTURE-*`) and image direction (`IMAGE-*`). Each defines rule IDs, confidence tiers and a verification ledger. Typography also has a canonical `rules.json`, `vcr lint` (safe zones and text overflow) and a `typographer` reviewer subagent. A series brief holds the values for one production (tokens, palette, durations); the pillars own the checks. Where your topic touches another pillar, cite its prefix and do not restate its numbers. **Your document seeds the next pillar.**

Your report will become a reference that agents read one section at a time; it is too long to load whole. From it we will build:
1. a machine-readable rules data file;
2. automatic checks that measure scenes, frames or audio;
3. a workflow skill of about 1.5k tokens that guides creation;
4. a reviewer subagent that critiques renders the way the typographer does.

Write for those consumers. Be specific, measurable where honest, and explicit about uncertainty.

## Scope

Research **cinematography for virtual cameras**: choosing and moving a camera in three.js, Blender and 2.5D parallax scenes built from layered 2D. Typical uses are product reveals, logo stings, abstract 3D, isometric explainers, data landscapes and parallax photo animation. Motion (`MOTION-*`) owns easing, timing and the judder of camera moves; pacing (`PACE-*`) owns cuts and shot length; art direction (`ART-*`) owns composition in the flat frame; lighting (`LIGHT-*`) owns light. This pillar owns what the camera sees and how it travels through space. Cite the others rather than restating them, and state ownership explicitly where it overlaps `MOTION-*`.

**Tool independence.** VCR keeps craft separate from tools (ADR 0006): describe each technique by what it does and its maths, so any tool can implement it. Give recipes for open-source and web tools (three.js cameras, CSS 3D transforms and perspective, SVG or canvas parallax, Blender cameras) as labelled worked examples, never as the rule itself. Commercial tools (After Effects cameras, Cinema 4D, Unreal) may be named as the origin of a technique or its vocabulary, with the open equivalent beside it.

Cover:
- **Lens fundamentals:** focal length against field of view and sensor size; what wide and long lenses do to perspective, distance and the subject's shape; orthographic against perspective projection and when each fits (isometric, diagrams, products); how three.js `fov` (vertical) maps to film focal lengths; field of view across 9:16, 16:9 and square.
- **Shot vocabulary:** extreme wide to extreme close-up, eye level, high and low angle, Dutch angle, overhead and top-down; what each communicates, adapted to non-human subjects such as products, logos and data.
- **Framing in depth:** foreground, midground and background layering; leading lines in perspective; scale cues; negative space in depth; reframing for vertical delivery (cite `ADAPT-*` and `ART-*`).
- **Depth of field:** aperture and circle of confusion, focus distance, rack focus, bokeh shape; physically based against post-process depth of field; when blur hides detail an agent should resolve instead; legibility of out-of-focus text (cite `TYPO-*`).
- **Camera movement:** dolly, truck, pedestal, pan, tilt, roll, orbit, crane, push-in, pull-out, dolly zoom, handheld and camera shake; motivated movement against decorative movement; the speed and parallax a move produces; spline and look-at rigs; avoiding gimbal lock and up-vector flips; keeping a move continuous through a loop seam.
- **Staging and blocking:** placing subjects and the camera together; the 180-degree line and screen direction for subjects that move; reveal staging (occlusion, coming out of darkness, through-the-object moves); continuity across shots and episodes (cite `BRIEF-*`).
- **2.5D and parallax:** layered parallax from flat art, the camera-projection trick on photos (depth maps, displacement), how much parallax each layer gets, the stretch and tear artefacts at the edges of layers, and when 2.5D reads as cheap.
- **Comfort and safety:** motion sickness and vestibular triggers from camera moves, field of view and speed (cite `A11Y-*` for the thresholds and do not restate them); safe zones for UI overlays on vertical platforms (cite `TYPO-*`).
- **Delivery survival:** how fast camera moves and fine geometry behave at 24, 30 and 60 fps; strobing and judder from pans (cite `MOTION-*`); motion blur (shutter angle, sample counts, determinism); compression of large-area movement under platform re-encoding (cite `DELIVERY-*`).
- **Sameness and cliché:** the generic 3D look (slow orbit of a centred object, default 50 mm-equivalent framing, unmotivated shake, shallow depth of field everywhere), how to recognise it and how to avoid it. Note where AI agents plausibly default to it.
- **Measurement:** what an agent can check from scene data or rendered frames:
  - field of view and focal length from camera parameters;
  - subject size and position in frame over time (projected bounding boxes);
  - camera angular and linear speed per frame, and acceleration;
  - horizon tilt and up-vector stability;
  - parallax ratios between layers;
  - subject leaving the safe area or being occluded;
  - focus distance against subject distance.
- **Critique practice:** how cinematographers and 3D directors critique ("floaty camera", "no sense of scale", "lens is too wide", "camera is lost", "unmotivated move", "flat staging"), and how each maps to a parameter or measurement.
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
