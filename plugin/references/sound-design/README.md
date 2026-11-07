# Sound design reference

This is the sound design, music and mix knowledge base (`SOUND-*`), produced from [the research brief](../research-prompts/sound-design.md) on 2026-11-06. It is reference material, not an implemented check: there is no `SOUND-*` rules data file, measurement tool or skill yet; the draft `sound-designer` agent cites these rules and is advisory until calibrated. It is about 20k tokens, so read only the section the task needs in [the knowledge base](sound-design-knowledge-base.md). Its IDs are already named (`SOUND-TRUE-PEAK`), as [the shared conventions](../README.md) require.

| Task | Read |
| --- | --- |
| Research inputs and cross-pillar handoffs | §5, §15 |
| Loudness targets, platform normalisation, true peak | §1, then `SOUND-LOUDNESS-*` and `SOUND-TRUE-PEAK` in §17 |
| Voice against a music bed, ducking, phone speakers, mono | §2 |
| Sync tolerances, frame-accurate SFX, beats to frames | §3, §19 |
| SFX for motion graphics, and when it cheapens the motion | §4 |
| Music structure, loops, licensing | §5 |
| Deterministic synthesised audio | §6 |
| Narration pace, pauses, narration against on-screen text | §7 |
| Sound-off and sound-led placements, silence | §8–9 |
| Delivery (48 kHz, AAC, stems) | §10, §19 |
| Measure with ffmpeg and the stems | §11, §18 |
| Critique a mix | §12, §14, §20 |
| Create the audio for a piece | §15, §20 |
| Check a claim | §21 (caveats), §22 (verification ledger) |

## What VCR must change before sound is checkable

- **No audio comes from capture.** Capture seeks and screenshots, so audio playing in the page is not tied to `t` (`SOUND-NO-LIVE-CAPTURE`). Audio is rendered offline from a cue list and muxed at assembly with the `ffmpeg` skill.
- **Cues share the scene's clock.** Cue times reference the scene's own `markers` and timeline events, snapped to rendered frame times. The cue list format is not defined yet. It belongs beside the [scene contract](../../skills/start/references/scene-contract.md) when the first sound check needs it.
- **Checks need stems.** `SOUND-VOICE-BED-GAP` and `SOUND-DUCK-*` read separate voice and bed stems. Without stems they fall back to source separation, which is unreliable (§18).

## Open decisions before building `rules.json`, checks or an agent

1. **Settled: rule owners** ([shared conventions](../README.md)).
   - Sound owns sync of audio to visual events (`SOUND-SYNC-*`, `SOUND-SFX-PEAK-ALIGN`), which replaces `MOTION-RHY-002`.
   - Sound owns narration rate (`SOUND-NARRATION-WPM`), which replaces `PACE-NARR-01/02`.
   - Pacing owns how narration relates to visuals (`PACE-NARR-03/04`) and the mute test (`PACE-SOUND-01`). `SOUND-NARRATION-VISUAL-LEAD`, `SOUND-NARRATION-TEXT-REDUNDANCY` and `SOUND-MUTE-LEGIBLE` are dropped.
   - Sound owns the audio loop seam, and motion owns the visual one.
2. **One tolerance for accents on beats.** `SOUND-BEAT-ALIGN` asks for the exact rounded frame (±½ frame), while `MOTION-RHY-001` and `PACE-BEAT-06` allow ±1 frame. The owners stay as they are, but the tolerance should be one shared value. Exact frame as the pass, and ±1 frame as minor, fits all three.
3. **Narration rate disagrees with pacing.** `SOUND-NARRATION-WPM` gives 130–175 wpm and flags above 180; the dropped `PACE-NARR-01` gave 140–170 and warned above 190. Keep sound's band, which is anchored to Brysbaert and ACX.
4. **Accessibility overlap.** `SOUND-VOICE-BED-GAP` remains a heuristic video-mixing target. WCAG 1.4.7 is scoped to prerecorded audio-only speech; it does not prescribe VCR's LU measurement or video target. The [accessibility reference](../accessibility/README.md) keeps that distinction and delegates mixing here.
5. **Determinism is shared.** `SOUND-SYNTH-DETERMINISM` (two renders give identical audio) and `MOTION-SPR-001` (repeated seeks give identical values) are the same idea. One generic determinism check could cover picture and sound.
6. **Unverified and uncalibrated values.**
   - YouTube's −14 LUFS and its turn-down-only behaviour are inferred from small samples.
   - TikTok and Instagram normalisation is undocumented.
   - The BT.1359 sync figures come from secondary quotes.
   - Ducking, EQ, SFX density and mono thresholds are heuristics.

   Re-verify the platform figures at least yearly (§21).
