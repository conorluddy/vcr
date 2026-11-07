# Data visualisation reference

This is the data visualisation in motion knowledge base (`DATA-*`), produced from [the research brief](../research-prompts/data-visualisation.md) on 2026-11-06. It covers whether a chart, map, counter or ranking is accurate and readable at rest and in motion. It is reference material, not an implemented check. It is a condensed edition of about 13k tokens: §§10–17 were shortened, but the rules table is complete. Read only the section the task needs in [the knowledge base](data-visualisation-knowledge-base.md). Its IDs are already named.

Its central idea: **resting frames carry the chart; transitions preserve identity and truthful encoding without presenting interpolation as observed data (§6.2).** The evidence splits two ways. Animated transitions between related charts improve graphical perception (Heer & Robertson 2007). Trend playback presents fastest, but viewers make more errors (Robertson et al. 2008).

| Task | Read |
| --- | --- |
| Research inputs and cross-pillar handoffs | §7, §11 |
| Truthful scales, baselines, encodings, labels | §1 |
| Animated transitions: staging, object constancy, rescaling, trend playback | §2 |
| Build a chart on screen: reveal order, holds, tracked marks | §3 |
| Numbers: count-ups, rounding, units, locales, uncertainty | §4 |
| Maps: projections, choropleths, camera moves | §5 |
| Misleading motion; integrity guidance from statistical bodies and newsrooms | §6 |
| Source lines and provenance | §7 |
| Data-driven scenes in VCR: data files, deterministic layout, tools | §8 |
| Critique or create | §10–11, §16 |
| Measure | §13–14 |
| Check a claim | §17 (caveats), §18 (verification ledger) |

## Open decisions before building `rules.json`, checks or an agent

1. **What a data scene must expose.** Most `DATA-*` checks compare rendered geometry with the data. A data scene therefore needs to give a check:
   - its data file;
   - a `meta` block (source, date, units, transform);
   - a stable datum key on every mark, so object constancy can be checked;
   - the scale domain at time `t`;
   - its rest intervals.

   The datum key fits the reserved `data-vcr-id`. The rest intervals fit named `markers` (see the adaptation README's contract proposal). **Settled (#143):** the rest is the optional `data` block in [the scene contract](../../skills/start/references/scene-contract.md), and rest intervals are named markers with `role: "rest"`.
2. **Settled: rule owners** ([shared conventions](../README.md)).
   - `DATA-COLOUR-NOT-SOLE` is dropped in favour of `A11Y-COLOR-ALONE`.
   - `DATA-THOUSANDS` is dropped in favour of `ADAPT-LOCALE-FORMAT`, which formats numbers through `Intl`.
   - Holds cite `TYPO-HOLD` (`DATA-LOG-LABEL`, `-TREND-SUMMARY`, `-COUNTUP-LAND`). `DATA-SOURCE-LINE` cites `TYPO-SAFE` and the `TYPO-*` minimum size.
   - **Claims:** `STORY-CLAIM-SOURCE` owns "every claim has a source" at plan time. `DATA-SOURCE-LINE`, `-PROVENANCE` and `-LABEL-MATCH` own "the chart shows its source and matches its data" on the render.
   - `DATA-NO-OVERSHOOT` is stricter than the overshoot budget in `MOTION-EASE-005`: zero overshoot on data geometry and numerals. Data wins for data marks, and motion cites it.
   - `DATA-LOOP-SEAM` (a visible reset, so a loop does not imply the data cycles) is about meaning. File-level and content continuity stay with `DELIVERY-LOOP-SEAM` and `MOTION-RHY-004`.
3. **Guidance written for the web, applied to video.** Most published guidance (ONS, GAF, FT, BBC) is for static or interactive charts, so every adaptation to linear video is labelled heuristic (§17). Calibrate these against review of real data renders before any of them gates:
   - the 1 s stage duration;
   - more than 2 stages;
   - more than 5 tracked marks;
   - more than 80 or more than 200 moving marks;
   - the 2% time-linearity tolerance.
4. **Source conflicts to keep visible.** ONS and FT disagree on dual axes (`DATA-DUAL-AXIS` warns at 2). Tufte's lie factor wording is unverified. Several ledger rows group claims together (§18).
5. **The checks are cheap once the contract exists.** `DATA-ZERO-BASELINE`, `-LIE-FACTOR`, `-LABEL-MATCH`, `-SCALE-STABLE` and `-OBJECT-CONSTANCY` are DOM or SVG geometry compared with the data at sampled times. They fit the `vcr lint` sampling model better than a frame analyser does.
