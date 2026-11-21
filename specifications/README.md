# Specifications

`vcr-prd.md` is the parent specification. It is deliberately layered (L0 to L7) with release gates, and it is implemented as a sequence of child specifications rather than as one build.

## Layout

- `vcr-prd.md` — product requirements. Requirement IDs (`L2-01` and so on) are the stable vocabulary; child documents quote IDs instead of restating them.
- `vcr-plugin-prd.md` — child PRD for distribution as a Claude Code and Codex plugin, and the human review layer (review pages and storage controls). Requirement groups PL, RT, AG, RS, RV, ST, SH, PX.
- `roadmap.md` — what to build next, in order, and why. Start here when choosing work.
- `decisions/` — architecture decision records, numbered. See `decisions/README.md`.
- `prd/` — feature-sized PRDs managed with `whatwhy` (`node scripts/whatwhy.mjs new prd "<title>"`); `prd/INDEX.md` is generated. The two product-level PRDs above stay where they are, with their own requirement IDs.
- `handoffs/` — resumable multi-session workflows an agent can pick up from a single prompt, such as `catalogue-evidence-rollout.md`.
- `spikes/` — reports from time-boxed technical spikes: decision, numbers, limitations. A child specification cites the spike that opened it.
- `research/` — discovery reports and proposals, including the [pillar extraction audit](research/pillar-extraction-audit-2026-11-08.md); recommendations are not implemented capabilities or accepted decisions.
- `field-notes/` — dated source reports from production use, linked to feedback issues; evidence records rather than maintained instructions.
- `<layer>/` — a short child specification per layer, created when work on that layer starts and not before.

## Decisions and spikes so far

- ADR 0001: in-house composition engine. ADR 0002: headless first, no editor. ADR 0003: plugin distribution, bundled CLI, three roots. ADR 0004: progressive disclosure and feedback enforced by checks. ADR 0005: recommendation policy and licence migration. ADR 0006: creative pillars as rules data, independent of tools. ADR 0007: early advisory agents. ADR 0008: early advisory making workflows. ADR 0009: free software is the catalogue boundary. ADR 0010: technique records as a thin layer joining pillars to tools, with derived status. ADR 0011: inspiration as a workspace library, separate from assets. ADR 0012: stated, measured and judged kept apart. ADR 0013: models chosen per agent, in the workspace. Proposed, not yet accepted: ADR 0014 (a look approved in stills before motion).
- Spike: browser capture (go for Layer 2; settle-then-screenshot for canvases, `beginFrame` for DOM-only).
- Spike S1: plugin invocation (go for plugin P1. Skill-relative CLI path on both hosts; Codex needs a workspace-local `VCR_HOME` and `--single-process` Chromium, which captures byte-identically; no plugin hooks on Codex).

## Decomposition

| Child | PRD layer | Entry gate | Opening spike | Status |
| --- | --- | --- | --- | --- |
| foundation | L0 / M0 | — | — | done |
| tool suite | L0 / M1 | foundation merged | none | done: `vcr setup capture` and the `start`/`init` workflow skills landed with plugin P1 |
| project workspace | L1 / M2 | M1 | asset-store backend | not started |
| timeline resolver | L2 / M3 | browser-capture spike + M2 | rational-time representation | spike passed; waiting on M2 |
| compositor | L3 / M4 | M3 | alpha and colour round-trip | not started |
| advanced motion | L4 / M5 | M4 | deterministic simulation fixture | not started |
| production delivery | L5 / M6 | M4 | FFmpeg intermediate and export strategy | not started |
| plugin and review layer (`vcr-plugin-prd.md`) | L0 packaging, early L1 and L6 slices | — | S1 plugin invocation (passed) | P0, S1, P1 and P2 done (installable on both hosts; review contract in); P3 next |
| capability graph (`vcr-capability-graph-prd.md`, proposal) | L0 catalogue extension (L0-01, L0-02, L0-05, L0-06); L6 checks (L6-02 to L6-04) | CG0 reopen conditions (scope-match check, complete evidence entries, n>1 rerun) | CG0 G0 desk research (`spikes/capability-graph-g0.md`, accepted 2026-11-04) | CG0 done: current workflow kept; operations model on hold; #74/#76 proceed on tool records |
| technique mapping (`catalog/techniques/`, ADR 0010, #212) | L0 catalogue extension (L0-01, L0-02) | — | none (reconciled with CG0: no operations model) | foundation done: records, link checks, `vcr techniques`, generated index, twenty-four seeds, ten fixture-backed routes; production trial next |
| inspiration intake (`inspiration/` in the workspace, ADR 0011, 0012, 0013) | First slice of the L1 asset store; feeds look frames (ADR 0014, proposed) | — | none | records, brief citations, validation, `vcr inspiration` with measured facts, the `inspiration` skill, the draft `inspiration-analyst` agent and workspace `models` are in; one production trial run (#183) |
| creative pillars (`references/`, ADR 0006, epic #152) | L6 checks (L6-02), skills and review agents; brief and beat sheet are early L1 slices | — | none (deep-research knowledge bases) | 19 reference pillars; advisory making workflows and research/reviewer agents ship; typography has rules data and lint, story has six plan checks; remaining measurement and calibration work is separate |
| review loop | L6 / M7 | M3 | none | not started |
| reference corpus | L7 / M8 | M2 | none | not started |

If a child gets heavy, split it along requirement IDs, not along files.
