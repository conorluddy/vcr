# Specifications

`vcr-prd.md` is the parent specification. It is deliberately layered (L0 to L7) with release gates, and it is implemented as a sequence of child specifications rather than as one build.

## Layout

- `vcr-prd.md` — product requirements. Requirement IDs (`L2-01` and so on) are the stable vocabulary; child documents quote IDs instead of restating them.
- `decisions/` — architecture decision records, numbered. See `decisions/README.md`.
- `spikes/` — reports from time-boxed technical spikes: decision, numbers, limitations. A child specification cites the spike that opened it.
- `<layer>/` — a short child specification per layer, created when work on that layer starts and not before.

## Decomposition

| Child | PRD layer | Entry gate | Opening spike |
| --- | --- | --- | --- |
| tool suite | L0 / M1 | foundation merged | none |
| project workspace | L1 / M2 | M1 | asset-store backend |
| timeline resolver | L2 / M3 | browser-capture spike + M2 | rational-time representation |
| compositor | L3 / M4 | M3 | alpha and colour round-trip |
| advanced motion | L4 / M5 | M4 | deterministic simulation fixture |
| production delivery | L5 / M6 | M4 | FFmpeg intermediate and export strategy |
| review loop | L6 / M7 | M3 | none |
| reference corpus | L7 / M8 | M2 | none |

If a child gets heavy, split it along requirement IDs, not along files.
