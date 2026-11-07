# VCR repository guide

Read `specifications/vcr-prd.md` for product intent and release gates. This repository implements the PRD in layers; catalogue inclusion does not imply installation, validation, or adapter support.

## Working rules

- Keep native toolkit source and commands accessible. Do not imply a shared timeline or renderer exists until implemented.
- Keep content, design, motion parameters, and production placement distinct.
- Keep the harness domain-agnostic: VCR serves any creative output. Never name a client, brand, product or subject in skills, references, examples, specs or code. Anything specific to a production belongs in that workspace's project or series brief, outside this repository.
- Keep craft separate from tools (ADR 0006): skills, agents and rules for a creative pillar never name a catalogue tool or restate a threshold. A toolkit guide cites the pillar rule ID it meets, and a check measures output, not the tool that made it.
- Record tool documentation, machine installation, validation evidence, and adapter maturity as separate facts.
- Treat the project selected by the user as the write boundary. Do not modify sibling projects or paths outside it.
- Generated media, caches, and temporary render artifacts belong in ignored output directories.
- Prefer official documentation links and preserve uncertainty where versions or support are unverified.
- Load only the relevant toolkit or workflow guidance for a task. Do not copy the entire catalogue into a prompt.
- Edit tool records, never the generated `catalog/tools.json`, `catalog/INDEX.md` or `catalog/CANDIDATES.md`; run `pnpm vcr catalog build` and commit the result.
- `pnpm validate` fails on a stale index, a dangling reference or a budget overrun.
- `plugin/` is generated and committed (bundled CLI, catalogue, skills, example sources, both host manifests). Never edit it; run `pnpm vcr plugin build` after changing the CLI, catalogue, skills or examples. `pnpm validate` fails when it is stale, over 5 MB or carries media. The `.githooks/pre-commit` hook (enabled by `pnpm install`) runs `catalog build` and `plugin build` and stages their output when sources are staged; sandboxes, `--no-verify` and hookless clones still need the manual step.
- Inside this repository the CLI is `pnpm vcr`; from an installed plugin it is `node <plugin-root>/cli/vcr.mjs`, the plugin root being two directories above the calling SKILL.md (spike S1). Skills say `vcr` and define it once; never hard-code a versioned plugin path.
- The harness is read-only outside this repository: user state goes to the workspace (`vcr.json`) or the machine root (`VCR_HOME`, default `~/.vcr`), never into the plugin.
- Decisions live in `specifications/decisions/` as numbered ADRs. Read 0001 (in-house engine), 0002 (headless, no editor), 0003 (plugin distribution, three roots), 0004 (progressive disclosure and feedback as first-class), 0006 (creative pillars independent of tools) and 0007 (draft pillar agents before rules data) before proposing architecture.
- Plugin distribution (Claude Code and Codex) and the human review layer are specified in `specifications/vcr-plugin-prd.md` and ADR 0003; read them before touching root resolution, packaging, review files or storage.
- When agents work in git worktrees, merge their branches into one integration branch, rebuild the index once, and never `git add -A` from the main checkout while worktrees exist under `.claude/worktrees/`.

## How to navigate the catalogue

Four tiers, each sized to one decision. Descend only as far as the task needs.

1. Route: read `catalog/INDEX.md` whole (under 16 KB). One line per routable tool; unassessed candidates are in `catalog/CANDIDATES.md`.
2. Shortlist: `pnpm vcr tools info <id>` for two or three tools. Summary, use when, avoid when, pairs with, evidence.
3. Commit: `pnpm vcr tools info <id> --full` loads the operating guide (`skills/<id>/SKILL.md`). One at a time.
4. Do: `pnpm vcr tools examples <id>`, then open one example directory (or `vcr example create <id>` to copy it into a workspace).

Never load more than one guide at a time unless comparing two tools. A card or guide never claims the tool is installed; `vcr doctor` does.

## Production feedback issues

Use `self-improvement` on every issue capturing a lesson from real VCR use; filter by it to find improvement leads. Add the relevant `loop:*` labels (they may overlap):

| Label | Use when |
| --- | --- |
| `loop:field-notes` | A running production-session log; keep observations and updates here, then link focused follow-up issues back to it. |
| `loop:friction` | VCR slowed, blocked or confused work on a real project. |
| `loop:core-candidate` | A pattern proved useful in a project and could be absorbed into the CLI, harness or a skill. This is a proposal, not approved architecture or shipped support. |
| `loop:docs-gap` | A skill, guide or catalogue card was wrong, missing or misleading in practice. |
| `loop:agent-ux` | An agent driving VCR unattended hit problems with help, errors, hangs, authentication or similar interactions. |

Before opening a follow-up, check existing issues for duplicates. Keep each actionable issue focused on one problem or proven pattern, link its source field notes and include reproduction steps or evidence, the workaround if any, and a definition of done. Apply ordinary type, priority, clarity and risk labels separately; loop labels describe the feedback source and kind, not implementation readiness. When resolving a follow-up, link the fix and verification evidence back to the source log.

## Repository map

- `catalog/`: one record per tool under `tools/`, retired records under `retired/`, generated `tools.json`, `INDEX.md` and `CANDIDATES.md`, vocabulary, `ASSESSMENT-BRIEF.md`, and every JSON Schema under `schemas/` (tools, briefs, beat sheet, findings, manifests, approvals).
- `environment/`: the maintainer's per-machine tool availability from `vcr doctor --record` (`pnpm doctor`). The only place installation is a fact for validation evidence; other machines record to `~/.vcr/environment/`.
- `vcr.json`: marks this repository as a VCR workspace, so harness and workspace resolve to the same root (dev mode). See `vcr status`.
- `packages/`: `cli` (the `vcr` command; bundled into `plugin/cli/vcr.mjs`), `timeline` (time types), `capture` (browser frame capture, driven by `vcr capture`; exports `openScenePage` and `settleFrame`), `lint` (layout checks on browser scenes, driven by `vcr lint`; reads safe zones from `references/typography/rules.json`).
- `skills/`: flat `skills/<name>/SKILL.md`, no `vcr-` prefix. Workflow: `start` (router), `init` (workspace setup), `brief` (interview, routes and the two brief files), `typography` (text setting and checks, routed into `references/typography/`), `ingest` (candidate assessment), `evidence` (fixture runs and validation evidence), `guide` (toolkit guides from evidence). Toolkits: one per tool with validation evidence (`vcr tools list --tier core`, then the card's `skill`). `.claude/skills` links here.
- `agents/`: creative expert subagents, shipped in the plugin; `.claude/agents` links here. Reviewers (`typographer`, plus draft reviewers for the other pillars) are read-only and follow `references/critique-methodology/reviewer-contract.md`. Research agents (`domain-researcher`, `visual-researcher`, `cultural-reader`, `image-director`) may write research records to the workspace when asked. Drafts are advisory until calibrated.
- `plugin/`: generated Claude Code and Codex plugin; marketplaces at `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`.
- `examples/`: validated fixtures with `example.json`, `run.sh` and `expected/`; browser examples also carry a `capture` block for `vcr capture`.
- `projects/`: local products and productions following the project schema; contents are ignored except tracked reusable `templates/`.
- `references/`: the creative pillars (typography, motion, pacing, story, sound, art, accessibility, delivery, adaptation, data, fx, lighting, materials, series brief, critique, domain exploration, visual research, cultural context, image direction). `README.md` holds the shared conventions (rule IDs, tiers, one finding and scene contract) and which pillar owns each overlapping rule; `vcr validate` checks exact rule links, replacement targets, local file links and README section routes; `INDEX.md` lists the pillars. Most pillars are reference only; typography (`vcr lint`) and story (`vcr plan check`) have checks. Read one section at a time (`vcr refs section`, `vcr rules info`), never a whole knowledge base. `ideas/` holds exploratory material and `research-prompts/` the briefs that seed new pillars. Production reference search is reserved for Layer 7.
- `specifications/`: PRD, plugin PRD, `roadmap.md`, `decisions/` (ADRs), `spikes/` (reports).

## Current boundary

Layer 0 is complete for the initial catalogue: those records are carded and assessed, and evidence counts are whatever `vcr catalog build` reports. New discovery candidates may be unassessed. The plugin is installable on Claude Code and Codex (plugin PRD P0 and P1): three roots, `vcr workspace init`, `vcr setup capture`, `vcr capture`, `vcr example create`, and the `start` and `init` skills. Plugin PRD P2, the review contract, is done: `vcr video init`, `vcr capture --video` (render manifests retained under each video's `review/renders/`), `vcr findings`, human-only `vcr review approve|request-changes|resolve` (interactive TTY), `vcr status --brief`, `vcr storage`, `vcr lint --video`, and the series and video briefs with the `brief` skill. The beat sheet (`beats.json`) and `vcr plan check|markers` check a plan before rendering; plan findings are printed, not filed, until plan approvals (#173). Schemas are in `catalog/schemas/`. The review pages (P3 onward) and Layer 1 have not started. There is no timeline resolver, compositor, review surface or reference search; do not imply one. The TypeScript toolchain, pnpm workspace and JSON Schemas are decided, not provisional. Everything beyond Layer 0 is still provisional per the PRD.


## Open work (living)

This section is meant to change in most PRs; the rest of this file should rarely change. It lists loose ends and deferred decisions, one line each. Planned work is in GitHub issues (epic #152 for the pillars; #65, the capability graph, is parked) and `specifications/roadmap.md` orders it; this list catches what falls between them.

- Add a line when you defer something, and link the issue if there is one.
- Delete the line in the PR that resolves it. Never mark items done.
- Keep it under about fifteen lines. When an item grows, open an issue or a roadmap entry and leave a one-line pointer.

- **Pillar data and checks:** `rules.json` per pillar (#148), then promote each draft agent (#149). Measurement the drafts lack: motion sampling (#147), flash (#145), delivery gate (#144), loudness and sync (after #60), sub-frame sampling for `DATA-NO-OVERSHOOT`, word-level narration timings for `PACE-NARR-03/04`.
- **Calibration** (#150): run the drafts on real renders first; a gold set before any reviewer gates (`REVIEW-CAL-*`); decide whether a different model counts as independent (`REVIEW-IND-01`).
- **Blind review packet:** a `vcr` command that assembles brief, measurements and contact sheet (#63) for a reviewer, with nothing about authorship (`REVIEW-IND-02`).
- **Audio cue list** (#60): sound checks, `SOUND-*` sync rules and sound determinism wait on it.
- **Rule IDs still missing:** a determinism rule (#146; FX, lighting and materials rows have no replacement); the asset-manifest rule for licences and provenance; `A11Y-MOTION-*` rules for `MOTION-CAM-004/005`; a named art rule for minimum stroke width.
- **Values to settle:** the `uk-clearcast` market profile in `references/typography/rules.json`; beat-alignment tolerance (`SOUND-BEAT-ALIGN` against `MOTION-RHY-001` and `PACE-BEAT-06`); which rule holds the brand ΔE tolerance (`ART-BRD-*` or `LIGHT-BRAND-DELTAE`).
- **Research records:** the field list in `references/domain-exploration/research-handoff.md` becomes a JSON Schema once real research packs exist; research-pack review has no finding contract yet (critique KB §10).
- **Version sets:** `vcr lint` and `vcr plan check` take one scene or video, so `version-auditor` loops per cell; a matrix input would help.
- **Unassigned or uncovered rules:** `PACE-READ-05/06` have no reviewer; `story-editor` does not cover `STORY-MUTED-LEGIBLE` or `STORY-LOOP-SEAM`; pattern periods for `MOTION-FPS-002` are not in the scene contract.
- **Tests:** `lint-scene.test.ts` cannot launch Chromium in cloud sessions (Playwright build mismatch); `typography-rules.test.ts` failed once in a full run and passed on rerun.

- - - - -  NEVER EDIT BELOW THIS LINE - - - - - -

Keep this document in sync, check it for anything obsolete or incorrect with every PR, and prevent it from getting bloated. It should be kept to things that would apply in the majority of work sessions. Nuanced or occasionally touched parts of the codebase can be documented elsewhere.
