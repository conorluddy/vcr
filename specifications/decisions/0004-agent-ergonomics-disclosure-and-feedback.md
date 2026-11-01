# 0004. Agent ergonomics: progressive disclosure and feedback are first-class

Date: 2026-11-01
Status: accepted

## Context

VCR's primary operator is a coding agent that must "discover capabilities, follow a brief, select tools, execute renders, inspect results and revise the correct source" (PRD §2). Two properties decide whether that loop works:

- **Progressive disclosure.** Context is finite. The catalogue already has four tiers (index line, card, guide, example), but the only enforcement was a 16 KB cap on `INDEX.md`, removed on 2026-11-01 while the catalogue grows. Nothing measures what the plugin actually loads.
- **Feedback.** An agent can only revise what it can observe. PRD §9 asks VCR's own CLI for JSON output and stable exit codes, but nothing asks the same of the tools VCR wraps. Tool records describe how a tool is driven (`automation_route`), never what it returns. Facts such as odiff's exit codes, ab-av1's NDJSON or VHS being real-time are buried in free-text `notes`. The catalogue has no verification tools; odiff, dssim and VMAF arrived only as candidates on 2026-11-01.

Both are currently conventions. Conventions drift; the byte budget only held because `validate` enforced it.

## Options considered

1. **Leave them as conventions** in AGENTS.md and the assessment brief. No cost now; drifts with every new record, command and skill.
2. **Codify as checked contracts** across records, CLI, skills and a verify command, each enforced by `validate` or tests. Moderate cost, mostly incremental with assessment work.
3. **Build a full agent harness** (scoring, ranking, automatic tool selection) now. Speculative before Layer 1 exists.

## Decision

Option 2. Progressive disclosure and feedback are first-class factors in VCR, defined here and enforced by machine checks, not prose:

1. **Tool records carry an `agent_fit` block**, optional for candidates and required for catalogued and core tiers:
   - `disclosure`: does the tool offer short help versus full docs, list its options, and how large is its documentation.
   - `feedback`: meaningful exit codes; structured output (json, ndjson, text); errors that map to source locations; cheap single-frame preview; determinism (same input, same bytes); typical run time; configurable output format and verbosity.
   `ASSESSMENT-BRIEF.md` gains a 0–3 rubric per factor. The index line carries a compact feedback marker (e.g. `fb:json,exit,det`) so agents can filter at tier 0.
2. **VCR's own CLI meets a conformance contract**, checked by one test that enumerates every command: `--json` output, errors shaped `{ code, message, retryable }`, and two-level help (short and `--full`).
3. **Every toolkit skill has a `Feedback loop` section** stating how to verify that tool's output, pointing at its example's `expected/`. `validate` fails when the heading is missing.
4. **`vcr verify` becomes the single feedback surface**: it wraps pixel, perceptual and delivery checks (odiff, dssim, VMAF, ffprobe) behind one findings shape (severity, frame, region, metric), configured in `vcr.json` by tolerance, strictness preset (exact, perceptual, delivery) and verbosity. Its findings share a format with the review layer (plugin PRD).
5. **Disclosure is measured before it is capped.** `vcr catalog build` reports token estimates per tier and for the plugin's startup load. Budgets return only with numbers behind them.

## Consequences

- Easier: agents choose tools by loop quality, not just capability; reviews and verification share one findings format; regressions in context cost become visible.
- Harder: assessing a tool takes slightly longer; new CLI commands must pass conformance before merging; existing skills need a `Feedback loop` section.
- Must now do, in order: CLI conformance test (2); `agent_fit` schema and rubric (1), filled during assessment, core tools first; skill section check (3); tier size reporting (5); `vcr verify` (4), after odiff is assessed and likely alongside the review layer (plugin PRD P2).

## Revisit when

After the six core tools carry `agent_fit` scores, check whether agents actually route on them. If the markers never change a tool choice, simplify the block. If the startup context load measured under (5) exceeds what a session can spare, reintroduce budgets.
