# Delivery reference

The advisory `delivery` workflow now ships in `skills/delivery/SKILL.md`. The workflow is advisory; measurement and calibration status is described below.

This is the delivery, encoding and platform specifications knowledge base (`DELIVERY-*`), produced from [the research brief](../research-prompts/delivery.md) on 2026-11-06. It covers how a finished piece becomes files that survive every platform: masters, delivery encodes, upload specifications, what platforms do to uploads, colour signalling, banding, frame timing, A/V offset, captions as files and stills. It is reference material, not an implemented check. It is about 21k tokens, so read only the section the task needs in [the knowledge base](delivery-knowledge-base.md). Its IDs are already named.

For an SDR social-video delivery that accepts these settings, the proposed starting profile is below. Confirm the destination and upload route first; masters, HDR, alpha and stills need different profiles. Test video against a simulated platform re-encode:
- a progressive, constant-frame-rate MP4;
- H.264 High Profile;
- 4:2:0 limited-range BT.709, with all three colour tags set explicitly;
- a closed GOP and `faststart`;
- 48 kHz AAC.

| Task | Read |
| --- | --- |
| Research inputs and cross-pillar handoffs | §13 |
| The three files: master, mezzanine, delivery | §1 |
| Upload specs for YouTube, TikTok, Instagram, X, LinkedIn and Vimeo | §2 (dated; the §2.7 matrix holds official figures only) |
| What platforms do to uploads, and what survives | §3 |
| Colour: range, tags, P3, when not to use HDR | §4 |
| Banding and dither | §5 |
| Codec, container and encoder settings | §6 |
| Frame rate, duration accuracy, edit lists and encoder priming | §7 |
| Measure: the `ffprobe` gate, FFmpeg filters, VMAF, CAMBI, a simulated re-encode | §8, §13 |
| Masters, naming and manifests | §9 |
| Captions as files; stills and covers | §10–11 |
| QC a delivery, or create one | §13, §15 |
| Check a claim | §17 (caveats), §18 (verification ledger) |

## Open decisions before building `rules.json` or checks

1. **Settled: delivery takes over the scattered delivery rules** ([shared conventions](../README.md)). The KB proposes these owners itself (§1.3), and they match the shared table:
   - `TYPO-RANGE` → `DELIVERY-RANGE-LIMITED` and `DELIVERY-LEGAL-RANGE`.
   - `TYPO-CHROMA` → `DELIVERY-CHROMA-SUBSAMPLING` and `DELIVERY-RED-CHROMA`.
   - `TYPO-BITRATE` → `DELIVERY-BITRATE-*`.
   - `TYPO-STILL-FORMAT` → `DELIVERY-STILL-*`.
   - `ART-DEL-*` → delivery, except palette choices.
   - `SOUND-SAMPLE-RATE` → `DELIVERY-AUDIO-SAMPLE-RATE`.
   - `SOUND-AAC-BITRATE` → `DELIVERY-AUDIO-BITRATE`.
   - `MOTION-FPS-001` → `DELIVERY-FPS-NATIVE`, `-CONSTANT` and `-MAX`.

   Each original pillar keeps the design consequence, such as stroke weight for saturated text, colour intent, stem sample rates or the choice of fps for a look, and cites the delivery rule for the number. The `TYPO-*` entries leave the typography data once the delivery data exists, like `TYPO-FLASH`.
2. **Settled: boundaries with other pillars.**
   - Captions: accessibility owns presence, accuracy and the burned-in against sidecar choice (`A11Y-CAPTION-*`), and `DELIVERY-CAPTION-BURN` is dropped. `DELIVERY-CAPTION-SIDECAR` keeps the file format and its timing against the delivered file.
   - Covers: art owns the design of the cover frame. `DELIVERY-COVER-FRAME` owns the file and keeping the title inside the centre square.
   - Loops: `DELIVERY-LOOP-SEAM` checks the file (no duplicated frame or audio gap at the wrap). Motion and sound own continuity of the content.
   - `DELIVERY-FLASH-FRAME` (stray single frames) is a file defect, not photosensitivity, which stays `A11Y-FLASH-*`.
   - Durations: `DELIVERY-DURATION-PLATFORM` owns upload limits, and `PACE-DUR-01` keeps the brief target. The ad-format windows (bumper, non-skippable) are `ADAPT-DURATION-WINDOW`.
3. **Settled: one manifest.** `DELIVERY-MANIFEST`, `DELIVERY-NAMING` and `DELIVERY-CHECKSUM` extend the render manifest that `specifications/vcr-plugin-prd.md` §6.4 already defines (owned by L1-05), rather than adding a second file. `ADAPT-TRACE-MASTER` and `ADAPT-VERSION-ID` add the version fields to the same manifest.
4. **The audio bitrate floor disagrees.** `SOUND-AAC-BITRATE` said ≥ 384 kbps stereo. Delivery gives the platform floor, ≥ 128 kbps (X, Instagram), and YouTube's 384 kbps recommendation. Use 384 kbps as VCR's default and 128 kbps as the failure floor.
5. **Separate header checks from timing and signal checks.** Stream metadata can inspect declared tags, pixel format, profile, level, sample rate and dimensions. Container parsing checks `faststart`; CFR needs timestamp inspection, and GOP structure needs frame or bitstream inspection. Metadata cannot prove the pixels match their colour tags. These remain proposed delivery checks (§8.1), not implemented CLI commands.
6. **Unverified and heuristic values.**
   - Several platform pages could be read only as search snippets: Instagram's Help Center, YouTube's thumbnail and Shorts pages, LinkedIn and Apple TN2258.
   - The ITU, SMPTE and ISO texts were not opened.
   - The CAMBI threshold below 5, the blur delta and the simulated re-encode settings are heuristics.

   Re-check the platform figures before each campaign (§17).
