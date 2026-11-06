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

1. **Settled: reading hold** ([shared conventions](../README.md)). `TYPO-HOLD` is the base rule and `MOTION-TIME-005` cites it. `PACE-READ-01` is dropped, and its characters ÷ 20 term is a candidate revision to `TYPO-HOLD`. `PACE-READ-04` and `PACE-QUIZ-01` stay as stricter profiles, defined as at least `TYPO-HOLD`.
2. **Settled: captions** ([shared conventions](../README.md)). `PACE-READ-02/03` are dropped in favour of `TYPO-CAPTION-*`.
3. **Settled: overlaps with motion** ([shared conventions](../README.md)). Pacing owns cuts, beat lengths and holds; motion owns movement inside a beat. `PACE-LOOP-01` and `PACE-BEAT-05` are dropped. Cuts on markers stay `PACE-BEAT-06`.
4. **Settled: author tags.** They are reserved in the [scene contract](../../skills/start/references/scene-contract.md) (`data-vcr-role` `key`, `cta`, `hold`, `montage`). Beat labels (`promise`, `payoff`) are the `role` of named markers (#143). `audioLed` waits for the series brief.
5. **Brief settings versus rules.** Duration targets (`PACE-DUR-01` brief ±10%), the episode ID format (`PACE-SERIES-01`), segment slots and hook rotation (`PACE-SERIES-02/03`) are only checkable against a series brief. The [series brief reference](../series-brief/README.md) now defines the values. The checks stay here, and wait for the brief schema in Layer 1.
6. **Settled: named rule IDs** ([shared conventions](../README.md)). The numbered IDs here are drafts, renamed when `PACE-*` gets its `rules.json`.
7. **Unverified and uncalibrated values.**
   - The BBC dwell values come from secondary copies (§17 footnote).
   - The TikTok 21–34 s In-Feed duration is unverified.
   - Most thresholds are heuristic starting points: the 3.0/8.0 s static gap, the beat CV of 0.15, 12 new words per beat, the 5-word hook and the 1.5 s payoff hold. Tune them against human review before any of them gates anything.

## Editorial notes

- The second sources heading was folded into §23. Escaped `\[n\]` markers in the text point to that list.
- Rules in §17 and checklists in §20 drop the `PACE-` prefix in places (`READ-04`, `SOUND-01`). Those refer to `PACE-*` rules, not to the sound pillar.
