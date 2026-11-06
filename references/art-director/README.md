# Art direction reference

This is the art direction knowledge base (`ART-*`), produced from [the research brief](../research-prompts/art-director.md) on 2026-11-06. It is reference material, not an implemented check: there is no `ART-*` rules data file, lint step, skill or agent yet. It is too large to load whole (about 14k tokens), so read only the section the task needs in [the knowledge base](art-director-knowledge-base.md).

| Task | Read |
| --- | --- |
| Build or check a palette | §1–2, then `ART-COL-*` and `ART-BRD-*` in §17 |
| Colour through delivery (P3, BT.709, `yuv420p`) | §3, §19 |
| Value structure and the greyscale test | §4 |
| Composition and focal point, 9:16 first | §5, §10, §13 |
| Saliency and clutter metrics | §6, §18 |
| Series consistency and cover frames | §8–9 |
| Avoiding the generic look | §11 |
| Critique a render | §12, §14 |
| Create a piece | §15 |
| Check a claim | §22 (verification ledger) |

## Open decisions before building `rules.json`, lint checks or an agent

1. **One owner for safe zones.** The `ART-CMP-01` union box (288 top, 672 bottom, 120 left, 192 right, plus the lower-right corner below y 840) disagrees with `composite-9x16` in `references/typography/rules.json`, which uses 65 left and no corner. Safe zones should live in one data file that both pillars reference, and `vcr lint` needs to learn excluded rectangles before it can express the corner.
2. **Overlap with typography delivery rules.** `ART-DEL-01/02` overlap `TYPO-RANGE`, and `ART-DEL-03` overlaps `TYPO-CHROMA`. Choose one owner per rule and have the other cite it.
3. **Rule ID style.** `ART-COL-01` is numbered, while `TYPO-SAFE` is named, and the rules schema pattern currently rejects digits. Named IDs read better in lint output, for example `ART-ACCENT-SCARCE` instead of `ART-COL-03`.
4. **Inconsistent and mislabelled values.**
   - The minimum stroke width differs between sections: §3 says 4 px and `ART-DEL-03` says 6 px.
   - `ART-CMP-01/07` say `platform (derived)`, but their numbers come from third-party measurements. They should be `heuristic` with `verified: false`.
   - `ART-DEL-02` mixes a standard (16–235) with a VCR tolerance (±2).
5. **Series-specific rules.** Advice for the quiz, scorecard and "read the position" formats (§13), such as belt colours and accent only on the correct answer, belongs in each series brief (`BRIEF-*`), not in general rules.
6. **Uncalibrated defaults.** The ΔL 0.15, occupancy 25–60%, ΔE00 1.0/3.0, accent ≤ 15%, 180 px thumbnail and 35% jump thresholds are uncalibrated starting points. Tune them against human review of the first reviewed episodes before any of them gates anything.
