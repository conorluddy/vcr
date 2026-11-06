# Research brief: Delivery, Encoding and Platform Specifications

> Research prompt for a deep-research agent. Paste everything below the line. The output becomes `references/delivery/` in VCR, following the pattern of `references/typography/`.

---

You are an expert researcher. Produce a comprehensive, citation-backed knowledge base on **delivery, encoding and platform specifications for motion graphics and short-form video**, written for an AI creative agent that makes and reviews motion graphics and short-form video. Rule IDs use the prefix **`DELIVERY-`**.

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

Research **how a finished piece becomes a file that survives every platform it is published to**: masters, delivery encodes, platform upload specifications and what platforms do to uploads. This pillar takes over delivery rules that are scattered today (`TYPO-RANGE`, `TYPO-CHROMA`, `ART-DEL-*`, `SOUND-SAMPLE-RATE`, `SOUND-AAC-BITRATE`, `MOTION-FPS-001`). Say which of those it should own, and quote their numbers only to agree or disagree with them.

Cover:
- **Platform upload specifications:** TikTok, Instagram (Reels, feed, Stories), YouTube (Shorts and long-form), X, LinkedIn and Vimeo. For each, give container, codec, resolution, frame rate, bitrate, audio, maximum size and duration, aspect ratios and colour handling. Quote the platform's own help pages exactly and date each figure. Separate official specifications from figures measured by third parties.
- **What platforms do to uploads:**
  - re-encoding (codec, bitrate ladders, resolution caps);
  - frame-rate conversion;
  - colour-tag handling;
  - HDR handling;
  - audio normalisation (cite `SOUND-*` for loudness itself);
  - cover-frame selection.
  Say what survives and what degrades (gradients, fine type, saturated red, grain, fast motion), with any published measurements.
- **Codecs and containers:**
  - H.264 and H.265 profiles and levels, `yuv420p` vs `yuv444p`, CRF vs constrained bitrate, two-pass encoding, GOP and keyframe interval, B-frames, `faststart`;
  - VP9 and AV1 where platforms prefer them;
  - ProRes 422/4444 and other alpha masters (ProRes 4444, VP9 with alpha, PNG sequences).
- **Colour pipeline:**
  - sRGB authoring to BT.709 delivery;
  - limited vs full range;
  - colour primaries, transfer and matrix tags, and what happens when they are missing or wrong;
  - the "washed out" and "too dark" failures;
  - Display P3;
  - HDR (PQ, HLG) and when not to use it;
  - FFmpeg's `zscale` and `colorspace` filters.
- **Banding and dither:** gradient banding at 8-bit, dither strategies, and how much bitrate fixes it.
- **Frame rate and timing:**
  - integer vs NTSC rates (29.97, 59.94);
  - constant vs variable frame rate;
  - duration and timecode accuracy;
  - the audio-video start offset in containers (edit lists, encoder priming).
- **Masters and versions:**
  - what to archive (mezzanine master, stems, captions as sidecar files);
  - naming and versioning conventions;
  - checksums;
  - deliverable manifests.
- **Captions and metadata at delivery:** sidecar formats (SRT, WebVTT, TTML) against burned-in captions, platform caption upload, and the metadata fields that matter. Cite `TYPO-CAPTION-*` for caption styling.
- **Stills delivery:** PNG, JPEG and WebP/AVIF, colour profiles, thumbnail and cover sizes per platform, and file-size limits.
- **Measurement:** what an agent can verify from a delivered file with `ffprobe`, `ffmpeg` filters (`signalstats`, `ebur128`, `idet`, `blockdetect`, `blurdetect`), VMAF, SSIM and PSNR. Cover how to simulate a platform re-encode locally to preview the damage, and how reliable each metric is for motion graphics as opposed to camera footage.
- **Critique practice:** how delivery and QC engineers report problems ("crushed", "banded", "soft", "judder", "out of sync", "washed out"), and how each maps to a measurement.

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
