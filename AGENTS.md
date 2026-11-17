# VCR repository guide

Read `specifications/vcr-prd.md` for product intent and release gates. This repository implements the PRD in layers; catalogue inclusion does not imply installation, validation, or adapter support.

## Working rules

- Keep native toolkit source and commands accessible. Do not imply a shared timeline or renderer exists until implemented.
- Keep the routable tool catalogue to free/libre software. A zero-cost tier or source-visible code is not enough: the licence must permit use, study, modification and redistribution for any purpose. Check code, models, assets, services and dependencies separately; keep non-free products only as historical or technique references, never as tools to install, run or recommend.
- Keep content, design, motion parameters, and production placement distinct.
- Keep the harness domain-agnostic: VCR serves any creative output. Never name a client, brand, product or subject in skills, references, examples, specs or code. Anything specific to a production belongs in that workspace's project or series brief, outside this repository.
- Keep craft separate from tools (ADR 0006): skills, agents and rules for a creative pillar never name a catalogue tool or restate a threshold. A toolkit guide cites the pillar rule ID it meets, and a check measures output, not the tool that made it.
- Record tool documentation, machine installation, validation evidence, and adapter maturity as separate facts.
- Treat the project selected by the user as the write boundary. Do not modify sibling projects or paths outside it.
- Generated media, caches, and temporary render artifacts belong in ignored output directories.
- Prefer official documentation links and preserve uncertainty where versions or support are unverified.
- Load only the relevant toolkit or workflow guidance for a task. Do not copy the entire catalogue into a prompt.
- Edit tool records, never the generated `catalog/tools.json`, `catalog/INDEX.md` or `catalog/CANDIDATES.md`; run `pnpm vcr catalog build` and commit the result.
- For questions about catalogue-wide tool progress, coverage, installation or readiness, run `pnpm vcr tools status` before answering; use its filters or `--json` when useful. Do not run it automatically at every session start.
- `pnpm validate` fails on a stale index, a dangling reference or a budget overrun.
- `plugin/` is generated and committed (bundled CLI, catalogue, skills, example sources, both host manifests). Never edit it; run `pnpm vcr plugin build` after changing the CLI, catalogue, skills or examples. `pnpm validate` fails when it is stale, over the interim 8 MiB cap or carries media; review that cap after initial catalogue validation coverage. The `.githooks/pre-commit` hook (enabled by `pnpm install`) runs `catalog build` and `plugin build` and stages their output when sources are staged; sandboxes, `--no-verify` and hookless clones still need the manual step.
- Inside this repository the CLI is `pnpm vcr`; from an installed plugin it is `node <plugin-root>/cli/vcr.mjs`, the plugin root being two directories above the calling SKILL.md (spike S1). Skills say `vcr` and define it once; never hard-code a versioned plugin path.
- The harness is read-only outside this repository: user state goes to the workspace (`vcr.json`) or the machine root (`VCR_HOME`, default `~/.vcr`), never into the plugin.
- Decisions live in `specifications/decisions/` as numbered ADRs. Read 0001 (in-house engine), 0002 (headless, no editor), 0003 (plugin distribution, three roots), 0004 (progressive disclosure and feedback as first-class), 0005 (recommendation and licensing policy; superseded by 0009 for catalogue scope), 0006 (creative pillars independent of tools), 0007 (draft pillar agents before rules data), and 0009 (free-software catalogue and legacy migration) before proposing architecture.
- Plugin distribution (Claude Code and Codex) and the human review layer are specified in `specifications/vcr-plugin-prd.md` and ADR 0003; read them before touching root resolution, packaging, review files or storage.
- When agents work in git worktrees, merge their branches into one integration branch, rebuild the index once, and never `git add -A` from the main checkout while worktrees exist under `.claude/worktrees/`.

## How to navigate the catalogue

Four tiers, each sized to one decision. Descend only as far as the task needs.

For cross-catalogue progress and coverage, use `pnpm vcr tools status`; it combines documentation, this machine's installation, validation evidence and adapter maturity. Tool records and machine environment records remain the sources of truth. Run the command when the user asks about catalogue-wide progress, not on every session.

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

Advisory craft-making workflows and a CLI-only review skill ship under ADR 0008, alongside the draft accessibility reviewer. They do not add checks, calibration or review pages.


Layer status follows the PRD release gates; early slices do not complete a parent layer. See `specifications/README.md` for gates and `specifications/roadmap.md` for sequencing.

| Layer | Current boundary |
| --- | --- |
| L0 — Tool suite | Initial catalogue complete; guides and scoped fixture evidence ship. Run `pnpm vcr tools status` for current documentation, machine readiness, validation and adapter coverage; never maintain counts here. New discovery candidates may be unassessed. |
| L1 — Project workspace | Early slices ship: workspace/video init, briefs, beat sheets, render manifests and storage. Full shared asset store, provenance, brand/component reuse and project scaffolding remain ahead. |
| L2 — Basic timeline | Time types, scene contract and browser-capture spike exist; no timeline resolver, clip placement or composition assembly. |
| L3 — Layered composition | Not started; native toolkit composition does not imply a VCR compositor or adapter. |
| L4 — Advanced motion | Not started; native toolkit motion does not imply shared time maps, masks or simulation contracts. |
| L5 — Production system | Guidance and native recipes exist; integrated audio/captions, variants, delivery presets and preflight remain ahead. |
| L6 — Review and iteration | Findings, retained revisions, human terminal approvals, generated summaries, typography lint, story plan checks and browser-scene previews with contact sheets ship. Retained evidence sheets, comparison, review pages, broader measurements and calibration remain ahead. |
| L7 — Reuse and orchestration | Not started; examples/templates exist, but no production reference search, resumable batch orchestration or dependency-aware cache. |

Plugin P0–P2 are complete on Claude Code and Codex: three roots, setup/capture, example creation and the review contract. `vcr capture --video` retains manifests in each video's `review/renders/`; `vcr findings`, human-only `vcr review approve|request-changes|resolve` (interactive TTY), `vcr status --brief`, `vcr storage` and `vcr lint --video` operate on that contract. `vcr plan check|markers` reads `beats.json`; plan findings are printed, not filed, until #173. Schemas live in `catalog/schemas/`. P3 review pages, P4 the fuller review loop and P5 sharing remain ahead. The TypeScript toolchain, pnpm workspace and JSON Schemas are decided; future layers remain provisional except where ADRs or shipped slices settle them.


## Open work (living)

This section is meant to change in most PRs; the rest of this file should rarely change. It lists loose ends and deferred decisions, one line each. Planned work is in GitHub issues (epic #152 for the pillars; #65, the capability graph, is parked) and `specifications/roadmap.md` orders it; this list catches what falls between them.

- Add a line when you defer something, and link the issue if there is one.
- Delete the line in the PR that resolves it. Never mark items done.
- Keep it under about fifteen lines. When an item grows, open an issue or a roadmap entry and leave a one-line pointer.

- **Pillar data and checks:** `rules.json` per pillar (#148), then promote each draft agent (#149). Measurement the drafts lack: motion sampling (#147), flash (#145), delivery gate (#144), loudness and sync (after #60), sub-frame sampling for `DATA-NO-OVERSHOOT`, word-level narration timings for `PACE-NARR-03/04`.
- **Production workflow evidence:** use the published skills on real renders; resume from `specifications/handoffs/pillar-workflow-publication.md`. Synthetic evaluations do not establish production quality or calibration.
- **Calibration** (#150): run the advisory reviewers on real renders first; a gold set before any reviewer gates (`REVIEW-CAL-*`); decide whether a different model counts as independent (`REVIEW-IND-01`).
- **Blind review packet:** a `vcr` command that assembles brief, measurements and contact sheet (#63) for a reviewer, with nothing about authorship (`REVIEW-IND-02`).
- **Audio cue list** (#60): sound checks, `SOUND-*` sync rules and sound determinism wait on it.
- **Rule IDs still missing:** a determinism rule (#146; FX, lighting and materials rows have no replacement); the asset-manifest rule for licences and provenance; `A11Y-MOTION-*` rules for `MOTION-CAM-004/005`; a named art rule for minimum stroke width.
- **Values to settle:** the `uk-clearcast` market profile in `references/typography/rules.json`; beat-alignment tolerance (`SOUND-BEAT-ALIGN` against `MOTION-RHY-001` and `PACE-BEAT-06`); which rule holds the brand ΔE tolerance (`ART-BRD-*` or `LIGHT-BRAND-DELTAE`).
- **Technique-to-tool mapping:** bridge creative intent → techniques → capabilities → catalogue tools and evidence through a separate discovery layer; keep pillars tool-independent (ADR 0006). See [roadmap overview](specifications/roadmap.md#technique-to-tool-discovery-proposal); reconcile with parked #65 before choosing architecture.
- **Font discovery (typography):** add a curated font catalogue with style tags, official download sources and licences, plus workspace font sources; init should discover project fonts and offer selection or additional local paths. Keep discovery read-only, machine-specific paths local, and production font files, hashes and licences in the workspace; this supports typography, not a new pillar.
- **Plugin size:** the interim package cap is 8 MiB while initial catalogue validation coverage is completed; review packaged contributions and set the steady-state cap afterward.
- **Research records:** the field list in `references/domain-exploration/research-handoff.md` becomes a JSON Schema once real research packs exist; research-pack review has no finding contract yet (critique KB §10).
- **Public-release rights audit:** Apache-2.0 covers original VCR material; review third-party excerpts and copied reference material passage by passage before making the repository public. Bundled dependency notices and the example font licence are retained separately.
- **Version sets:** `vcr lint` and `vcr plan check` take one scene or video, so `version-auditor` loops per cell; a matrix input would help.
- **Unassigned or uncovered rules:** `PACE-READ-05/06` have no reviewer; `story-editor` does not cover `STORY-MUTED-LEGIBLE` or `STORY-LOOP-SEAM`; pattern periods for `MOTION-FPS-002` are not in the scene contract.
- **Tests:** browser tests need matching Playwright/Chromium and local socket permissions; install locked dependencies in worktrees. Local CLI tests have shown catalogue JSON truncated around 65 KB; hosted CI passed. `typography-rules.test.ts` failed once in a full run and passed on rerun.

## Active production feedback

- Current runway: [#183](https://github.com/conorluddy/vcr/issues/183). Browser-scene previews ship. #63 still covers MP4s and retained comparison. Next: #184 safe zones, #186 nested readiness and #187 timing. #51 shared-root configuration remains open. Delivery gate #144 continues alongside.
- Preserve dated observations and evidence in field-note issues; keep this section to the next work and blockers. Earlier entries: `specifications/reviews/production-feedback-2026-11-09.md`.

- - - - -  NEVER EDIT BELOW THIS LINE - - - - - -

Keep this document in sync, check it for anything obsolete or incorrect with every PR, and prevent it from getting bloated. It should be kept to things that would apply in the majority of work sessions. Nuanced or occasionally touched parts of the codebase can be documented elsewhere.
