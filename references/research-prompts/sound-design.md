# Research brief: Sound Design, Music and Mix for Short-Form Video

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/sound-design/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **sound design, music and mix for short-form video**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`SOUND-`**.

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

Research **sound design, music and mixing for motion-graphics and video work of any length**, covering every audio source: recorded and text-to-speech narration, licensed and original music, and recorded and procedurally synthesised SFX.

Cover:
- **Loudness standards:**
  - EBU R 128 and ITU-R BS.1770 (LUFS, LRA, true peak), and ATSC A/85;
  - the playback normalisation targets published by YouTube, TikTok, Instagram and Spotify. Many of these figures circulate without sources, so verify each one or mark it unverified;
  - true-peak ceilings, and what happens when you exceed them after a lossy encode.
- **Mix balance:**
  - voice vs music bed level relationships;
  - ducking (depth, attack and release values practitioners use);
  - dialogue intelligibility;
  - frequency masking and EQ carving for voice;
  - mixing for phone speakers vs headphones.
- **Sync:**
  - the audio/video sync tolerances viewers can detect (ITU-R BT.1359 and EBU recommendations);
  - frame-accurate SFX placement;
  - syncing cuts and motion accents to musical beats (BPM to frames at 24/25/30/60 fps).
- **SFX for motion graphics:** whooshes, risers, hits, UI clicks and "sweeteners". Cover how sound shapes how motion is perceived, including research on audiovisual integration and the sound-induced flash illusion. Also cover when sound makes motion feel cheap.
- **Music:**
  - structure for short loops (intro, drop, loop points);
  - choosing tempo and mood for a voice or brand;
  - seamless loop design;
  - licensing hazards for platform audio versus original beds.
- **Procedural and synthesised audio:** synthesis basics for SFX (noise sweeps, FM, envelopes), what makes synthesised sound read as cheap, and generative music for beds. Cover determinism: the same seed must give the same audio.
- **Narration (recorded and text-to-speech):** prosody, pacing (wpm), pauses, how to place narration against on-screen text, and when sparse narration beats continuous narration.
- **Sound-off vs sound-led placements:** platform data on how many viewers watch muted, by placement, and what that means for how much the sound should carry.
- **Silence and dynamics:** using contrast, rests and impact.
- **Technical delivery:** sample rates, AAC bitrates that platforms re-encode to, mono compatibility, and clipping.
- **Measurement:** what an agent can compute:
  - with FFmpeg (`ebur128`, `loudnorm` analysis, `astats`, `silencedetect`);
  - from cue timings compared with visual event times from the scene timeline;
  - onset detection, and checking beat alignment;
  - spectral balance checks.
  - Give the reliability of each.
- **Critique practice:** how mixers and sound designers give feedback ("muddy", "harsh", "buried", "pumping") and how each maps to measurements.

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
