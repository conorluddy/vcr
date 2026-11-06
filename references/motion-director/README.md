# Motion direction reference

This is the motion design and animation direction knowledge base (`MOTION-*`), produced from [the research brief](../research-prompts/motion-director.md) on 2026-11-06. It is reference material, not an implemented check: there is no `MOTION-*` rules data file, measurement tool, skill or agent yet. It is too large to load whole (about 20k tokens), so read only the section the task needs in [the knowledge base](motion-director-knowledge-base.md).

| Task | Read |
| --- | --- |
| Pick curves and durations | §2–3, then `MOTION-EASE-*` and `MOTION-TIME-*` in §16 |
| Springs (closed-form, seek-safe) | §2.4, §18 |
| Stagger, hierarchy, continuity | §4 |
| Beat sync and loops | §5, §12 |
| Camera moves, pans and judder | §6–7 |
| Motion accessibility hooks | §8 (the accessibility pillar owns the detail) |
| Measure motion from a time series | §9, §17 |
| Translate critique words into curves | §10 |
| Avoid template motion; write a motion spec | §11 |
| Critique a render | §13, §19 |
| Create a piece | §14, §19 |
| Seek-based rendering pitfalls | §18 |
| Check a claim | §20 (caveats), §21 (verification ledger) |

## Open decisions before building `rules.json`, a measurement tool or an agent

1. **Settled: named rule IDs** ([shared conventions](../README.md)). The numbered IDs here are drafts, renamed when `MOTION-*` gets its `rules.json`.
2. **Settled: rule owners** ([shared conventions](../README.md)). `MOTION-TIME-005` cites `TYPO-HOLD`. `MOTION-FPS-003` owns shimmer on thin moving features. Accessibility owns reduced-motion variants, pause controls, flashing and the vestibular triggers: `MOTION-A11Y-*` and `MOTION-CAM-002/003` are dropped, and `MOTION-CAM-004/005` move to `A11Y-MOTION-*` (see the [accessibility reference](../accessibility/README.md)). Motion keeps pan judder (`MOTION-CAM-001`) and the stable anchor (`MOTION-CAM-006`). Motion owns loop seams (`MOTION-RHY-004`) and movers within a beat (`MOTION-CHOR-003`, which takes pacing's limit of 3 simultaneous movers).
3. **Settled: tags.** `data-vcr-id` and `data-vcr-role` are reserved in the [scene contract](../../skills/start/references/scene-contract.md). Pattern periods, signature moves and `ui`/`cinematic` tags are added there when a check needs them.
4. **A time-series sampler.** `vcr lint` samples a few times and measures text boxes. Motion rules need every transform and opacity sampled at fps or 4× fps, segmented into tweens (§9.2). That is a separate tool, for example `vcr motion sample`, with its own output format that later checks read.
5. **The cheapest first check is not motion-specific.** `MOTION-SPR-001` (seek the same *t* twice, out of order, and get identical values) tests determinism for every scene. It may belong in `vcr capture --verify` or `vcr lint` rather than in the motion pillar.
6. **UI numbers versus watched video.** `MOTION-TIME-002` and `MOTION-TIME-006` apply only to UI-like elements. Without a reliable tag they will flag legitimate cinematic moves (§20).
7. **Unverified and uncalibrated values.** Treat these as starting points, never gates, until they are checked against human review of real renders:
   - the M3 Expressive spring tokens, SwiftUI presets and Fluent web tokens (secondary sources only);
   - the 20–25 ms stagger figure (folklore, ledger #39);
   - `MOTION-CHOR-002` (2×), `MOTION-CAM-003` (1.5× in 1 s), `MOTION-RHY-003` (CV 0.3) and the `MOTION-SIG-002/003` 70% and 50% thresholds.

## Editorial notes

- Stale § cross-references from the research draft were corrected when the file was placed here.
- The second sources list was renamed §23 *Citation links*: escaped `\[n\]` markers point to it, and plain `[n]` markers point to §22.
