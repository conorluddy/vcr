# VCR repository guide

Read `specifications/vcr-prd.md` for product intent and release gates. This repository implements the PRD in layers; catalogue inclusion does not imply installation, validation, or adapter support.

## Working rules

- Keep native toolkit source and commands accessible. Do not imply a shared timeline or renderer exists until implemented.
- Keep content, design, motion parameters, and production placement distinct.
- Record tool documentation, machine installation, validation evidence, and adapter maturity as separate facts.
- Treat the project selected by the user as the write boundary. Do not modify sibling projects or paths outside it.
- Generated media, caches, and temporary render artifacts belong in ignored output directories.
- Prefer official documentation links and preserve uncertainty where versions or support are unverified.
- Load only the relevant toolkit or workflow guidance for a task. Do not copy the entire catalogue into a prompt.
- Edit tool records, never the generated `catalog/tools.json` or `catalog/INDEX.md`; run `pnpm vcr catalog build` and commit the result.
- `pnpm validate` fails on a stale index, a dangling reference or a budget overrun.
- `plugin/` is generated and committed (bundled CLI, catalogue, skills, example sources, both host manifests). Never edit it; run `pnpm vcr plugin build` after changing the CLI, catalogue, skills or examples. `pnpm validate` fails when it is stale, over 5 MB or carries media.
- Inside this repository the CLI is `pnpm vcr`; from an installed plugin it is `node <plugin-root>/cli/vcr.mjs`, the plugin root being two directories above the calling SKILL.md (spike S1). Skills say `vcr` and define it once; never hard-code a versioned plugin path.
- The harness is read-only outside this repository: user state goes to the workspace (`vcr.json`) or the machine root (`VCR_HOME`, default `~/.vcr`), never into the plugin.
- Decisions live in `specifications/decisions/` as numbered ADRs. Read 0001 (in-house engine), 0002 (headless, no editor) and 0003 (plugin distribution, three roots) before proposing architecture.
- Plugin distribution (Claude Code and Codex) and the human review layer are specified in `specifications/vcr-plugin-prd.md` and ADR 0003; read them before touching root resolution, packaging, review files or storage.
- When agents work in git worktrees, merge their branches into one integration branch, rebuild the index once, and never `git add -A` from the main checkout while worktrees exist under `.claude/worktrees/`.

## How to navigate the catalogue

Four tiers, each sized to one decision. Descend only as far as the task needs.

1. Route: read `catalog/INDEX.md` whole (under 16 KB). One line per tool.
2. Shortlist: `pnpm vcr tools info <id>` for two or three tools. Summary, use when, avoid when, pairs with, evidence.
3. Commit: `pnpm vcr tools info <id> --full` loads the operating guide (`skills/<id>/SKILL.md`). One at a time.
4. Do: `pnpm vcr tools examples <id>`, then open one example directory (or `vcr example create <id>` to copy it into a workspace).

Never load more than one guide at a time unless comparing two tools. A card or guide never claims the tool is installed; `vcr doctor` does.

## Repository map

- `catalog/`: one record per tool under `tools/`, retired records under `retired/`, generated `tools.json` and `INDEX.md`, vocabulary, schemas, `ASSESSMENT-BRIEF.md`.
- `environment/`: the maintainer's per-machine tool availability from `vcr doctor --record` (`pnpm doctor`). The only place installation is a fact for validation evidence; other machines record to `~/.vcr/environment/`.
- `vcr.json`: marks this repository as a VCR workspace, so harness and workspace resolve to the same root (dev mode). See `vcr status`.
- `packages/`: `cli` (the `vcr` command; bundled into `plugin/cli/vcr.mjs`), `timeline` (time types), `capture` (browser frame capture, driven by `vcr capture`).
- `skills/`: flat `skills/<name>/SKILL.md`, no `vcr-` prefix. Workflow: `start` (router), `init` (workspace setup), `ingest` (candidate assessment). Toolkits: one per core tool plus ImageMagick and resvg. `.claude/skills` links here.
- `plugin/`: generated Claude Code and Codex plugin; marketplaces at `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`.
- `examples/`: validated fixtures with `example.json`, `run.sh` and `expected/`; browser examples also carry a `capture` block for `vcr capture`.
- `projects/`: local products and productions following the project schema; contents are ignored except tracked reusable `templates/`.
- `shared/`: reserved for Layer 1. `references/ideas/` holds exploratory material; production reference search is reserved for Layer 7.
- `specifications/`: PRD, `decisions/` (ADRs), `spikes/` (reports).

## Current boundary

Layer 0 is complete for the initial catalogue: those records are carded and assessed, nine carry validation evidence, and seven fixtures reproduce. New discovery candidates may be unassessed. The plugin is installable on Claude Code and Codex (plugin PRD P0 and P1): three roots, `vcr workspace init`, `vcr setup capture`, `vcr capture`, `vcr example create`, and the `start` and `init` skills. Layer 1 (project workspace) and the review layer (findings, approvals, review pages, `vcr storage`; plugin PRD P2 onward) have not started. There is no timeline resolver, compositor, review surface or reference search; do not imply one. The TypeScript toolchain, pnpm workspace and JSON Schemas are decided, not provisional. Everything beyond Layer 0 is still provisional per the PRD.


- - - - -  NEVER EDIT BELOW THIS LINE - - - - - -

Keep this document in sync, check it for anything obsolete or incorrect with every PR, and prevent it from getting bloated. It should be kept to things that would apply in the majority of work sessions. Nuanced or occasionally touched parts of the codebase can be documented elsewhere.
