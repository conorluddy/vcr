# Accessibility reference

This is the accessibility knowledge base (`A11Y-*`) for motion graphics and short-form video, produced from [the research brief](../research-prompts/accessibility.md) on 2026-11-06. It is reference material, not an implemented check: there is no `A11Y-*` rules data file, analyser or agent yet. It is about 20k tokens, so read only the section the task needs in [the knowledge base](accessibility-knowledge-base.md). Its IDs are already named.

Its headline: **flashing is the only failure in this work that can physically injure a viewer, and it is fully measurable from rendered frames.** `A11Y-FLASH-*` is the strongest candidate for VCR's first post-render check.

| Task | Read |
| --- | --- |
| Flashing, red flash and stripe patterns (WCAG 2.3.1, ITU-R BT.1702-3, Ofcom) | §1, §17.1–17.2 |
| Motion sensitivity, and what a reduced-motion video variant looks like | §2, §17.3 |
| Captions: presence, accuracy, sync, non-speech, speakers, lyrics, burned-in vs sidecar | §3, §17.6 |
| Audio description, and when VCR output needs it | §4, §17.7 |
| Contrast over moving and composited content | §5, §17.4 |
| Colour vision deficiency | §6, §17.5 |
| Cognitive accessibility and pacing | §7 |
| Platform accessibility features | §8 |
| Alt text for stills and carousels | §9 |
| What is law and what is good practice | §10 |
| Critique or create | §12–13, §19 |
| Check a claim | §20 (caveats), §21 (verification ledger) |

## Open decisions before building `rules.json`, analysers or an agent

1. **Settled: rule owners** ([shared conventions](../README.md)).
   - **Accessibility takes over flashing.** It owns flashing and patterns (`A11Y-FLASH-*`, `A11Y-PATTERN-STRIPES`). `TYPO-FLASH` cites them and leaves the typography data when the `A11Y-*` data exists, and `MOTION-A11Y-005` is dropped.
   - **Reduced-motion variants and pause controls:** `A11Y-MOTION-REDUCED-VARIANT` and `A11Y-MOTION-PAUSE`. `MOTION-A11Y-001/002/003` are dropped, and Apple's "spatial transitions become fades" guidance moves into the reduced-variant rule.
   - **Vestibular triggers:** `A11Y-MOTION-FULLFRAME` and `A11Y-MOTION-PARALLAX` take over `MOTION-CAM-002/003`. `MOTION-CAM-004` (0.2 Hz oscillation) and `MOTION-CAM-005` (spin) move here as new `A11Y-MOTION-*` rules when the data is built. Motion keeps pan judder (`MOTION-CAM-001`) and the stable anchor (`MOTION-CAM-006`), which are craft rules.
   - **Meaning not carried by one channel:** `A11Y-COLOR-ALONE` and `A11Y-AD-COVERAGE`. `MOTION-A11Y-004` is dropped.
   - **Captions as access:** presence, completeness, accuracy, sync, non-speech tags, speakers, lyrics, sidecars and the auto-caption review (`A11Y-CAPTION-*` apart from rate). These replace `PACE-SOUND-02`.
   - **Captions as text:** style, rate, lines and duration stay with `TYPO-CAPTION-*`. `A11Y-CAPTION-RATE` already defers to them and is dropped. `A11Y-CAPTION-PLACEMENT` stays, for not covering faces and featured text, and cites `TYPO-SAFE` for platform UI.
   - **Reading hold:** `A11Y-MOTION-READING` and `A11Y-TEXT-DWELL` are dropped in favour of `TYPO-HOLD`. That is now four pillars agreeing on one owner. Their "count from the end of the entrance animation" wording matches how `TYPO-HOLD` already measures.
   - **Text contrast:** `TYPO-CONTRAST` owns it. `A11Y-CONTRAST-TEXT` is dropped, and its 5th-percentile-over-lifetime method becomes how `TYPO-CONTRAST` is measured on moving backgrounds.
   - **Non-text contrast, CVD distinguishability and colour alone:** `A11Y-CONTRAST-GRAPHIC`, `A11Y-CVD-DISTINCT` and `A11Y-COLOR-ALONE`. The art and data visualisation pillars cite them.
   - **Plain language:** `A11Y-PLAIN-LANGUAGE` keeps literal wording for prices, steps and warnings. "One idea per beat" stays `PACE-STRUCT-03`.
2. **Voice over music.** `SOUND-VOICE-BED-GAP` reads WCAG 1.4.7 as 20 LU for video. This KB does not take that rule on. Keep it with sound and label it an interpretation of the standard, not the standard itself.
3. **Which flash profile is the default.** WCAG (`A11Y-FLASH-GENERAL`, `-RED`) is the universal floor, and the KB recommends the ITU/Ofcom rule (`A11Y-FLASH-BROADCAST`) as the default for social. `A11Y-FLASH-STRICT` is opt-in through the brief. Decide the default once. It belongs in the brief as `accessibility.flashProfile`, with the stricter profile winning when pillars disagree.
4. **The analyser needs every frame.** Flash detection runs on every rendered frame of the delivery file, and on at least three cycles across a loop seam (`A11Y-FLASH-LOOP-SEAM`). Sampled frames are not enough, so this is a post-render analyser over captured frames or the decoded video, not a `vcr lint` sampling check.
5. **Uncalibrated VCR defaults.** These are VCR proposals, not standards. Tune them before any of them gates:
   - the full-frame motion limits (> 5 s, or more than one per 5 s);
   - the parallax limit (≥ 2 layers over 25% of the frame);
   - the CVD ΔE floor;
   - the caption sync tolerance.

   The flash thresholds themselves are standards and can gate once the analyser is validated against a reference tool (§1.5).
