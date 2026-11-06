# Pacing reference

This is the pacing, structure and short-form editing knowledge base (`PACE-*`), produced from [the research brief](../research-prompts/pacing-editor.md) on 2026-11-06. It is reference material, not an implemented check: there is no `PACE-*` rules data file, measurement tool, skill or agent yet. It is a condensed edition, about 12k tokens against the brief's 20–35k target, and keeps every load-bearing number in §22. Read only the section the task needs in [the knowledge base](pacing-editor-knowledge-base.md).

| Task | Read |
| --- | --- |
| Open a piece: the first 0–6 seconds | §1, then `PACE-HOOK-*` in §17 |
| Which platform claims are official, studied or folklore | §2 |
| Beats, shot length and cut rhythm | §3 |
| Information density, reading and narration load | §4–5, then `PACE-READ-*` and `PACE-NARR-*` |
| Pick a structure (narrative, explainer, ad, music-led, countdown, quiz, "what next") | §6 |
| Loops, CTAs and series continuity | §7–8 |
| Sound-off design and copy for the screen | §9–10 |
| Measure pacing | §11, §18 |
| Critique a render | §12, §14, §20 |
| Create a piece | §15, §20 |
| Check a claim | §21 (caveats), §22 (verification ledger) |

## Open decisions before building `rules.json`, a measurement tool or an agent

1. **Three rules for one reading hold.** Each gives a different minimum for how long static text stays on screen:
   - `PACE-READ-01`: ≥ max(0.3 s × words, characters / 20, 5/6 s).
   - `PACE-READ-04`: ≥ 2 × words / 3.97 + 0.5 s, for key text.
   - `TYPO-HOLD` in `references/typography/rules.json`: ≥ max(1.2 s, 0.3 s × words + 0.5 s).

   `MOTION-TIME-005` already defers to `TYPO-*`. Pick one owner for the base hold (most likely `TYPO-HOLD`). Then keep `PACE-READ-04` only as a named stricter profile for key text and `PACE-QUIZ-01` windows, defined in terms of the base rule.
2. **Caption rules are restated, not cross-referenced.** `PACE-READ-02` (cps) and `PACE-READ-03` (event duration) repeat the `netflix-en-us` caption profile, which `TYPO-CAPTION-CPS` and `TYPO-CAPTION-DURATION` already own, and label them `standard` where typography says `platform`. Drop them and cite the typography rules.
3. **Overlaps with motion.**
   - `PACE-LOOP-01` (loop seam) overlaps `MOTION-RHY-004`.
   - `PACE-BEAT-05` (at most 3 simultaneous animators) overlaps `MOTION-CHOR-003` (one lead mover).
   - `PACE-BEAT-06` (cuts on music markers) overlaps `MOTION-RHY-001` (arrivals on markers).

   Decide the split, for example: pacing owns cuts and beat lengths; motion owns movement within a beat.
4. **Author tags (`M*` rules).** About a third of the rules need tags or markers: `promise`, `payoff`, `hold`, `montage`, `cta`, key text, and `audioLed: true`. They belong in the one scene contract reference with the motion pillar's `data-vcr-role`, not in a pacing-only convention. `window.__scene.markers` already exists and could carry the beat-level ones.
5. **Brief settings versus rules.** Duration targets (`PACE-DUR-01` brief ±10%), the episode ID format (`PACE-SERIES-01`), segment slots and hook rotation (`PACE-SERIES-02/03`) are only checkable against a series brief. They depend on the `BRIEF-*` research, which has not arrived yet.
6. **Rule ID style.** `PACE-HOOK-01` is numbered, like `ART-*`, `MOTION-*` and `REVIEW-*`. Decide once for every pillar.
7. **Unverified and uncalibrated values.**
   - The BBC dwell values come from secondary copies (§17 footnote).
   - The TikTok 21–34 s In-Feed duration is unverified.
   - Most thresholds are heuristic starting points: the 3.0/8.0 s static gap, the beat CV of 0.15, 12 new words per beat, the 5-word hook, the SSIM 0.9 loop seam and the 1.5 s payoff hold. Tune them against human review before any of them gates anything.

## Editorial notes

- The second sources heading was folded into §23. Escaped `\[n\]` markers in the text point to that list.
- Rules in §17 and checklists in §20 drop the `PACE-` prefix in places (`READ-04`, `SOUND-01`). Those refer to `PACE-*` rules, not to the sound pillar.
