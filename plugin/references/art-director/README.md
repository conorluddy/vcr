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

1. **Settled: safe zones** ([shared conventions](../README.md)). `typography/rules.json` keeps the only presets. The `ART-CMP-01` union box and lower-right corner become a proposed change to those presets, plus excluded-rectangle support in `vcr lint`.
2. **Settled: delivery rules** ([shared conventions](../README.md)). `TYPO-RANGE` and `TYPO-CHROMA` own them; `ART-DEL-01/02/03` cite them.
3. **Settled: named rule IDs** ([shared conventions](../README.md)). The numbered IDs here are drafts, renamed when `ART-*` gets its `rules.json`.
4. **Inconsistent and mislabelled values.**
   - The minimum stroke width differs between sections: §3 says 4 px and `ART-DEL-03` says 6 px.
   - `ART-CMP-01/07` say `platform (derived)`, but their numbers come from third-party measurements. They should be `heuristic` with `verified: false`.
   - `ART-DEL-02` mixes a standard (16–235) with a VCR tolerance (±2).
5. **General rules vs brief settings.** Format advice in §13, such as giving the accent only to the correct answer in a quiz, should become rules only where it holds for any production. Choices that depend on a particular production belong in that production's series brief (`BRIEF-*`). This harness stays domain-agnostic.
6. **Uncalibrated defaults.** The ΔL 0.15, occupancy 25–60%, ΔE00 1.0/3.0, accent ≤ 15%, 180 px thumbnail and 35% jump thresholds are uncalibrated starting points. Tune them against human review of the first reviewed episodes before any of them gates anything.
