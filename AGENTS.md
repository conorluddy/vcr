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
- `plugin/` is generated and committed (bundled CLI, catalogue, skills, example sources, both host manifests). Never edit it; run `pnpm vcr plugin build` after changing the CLI, catalogue, skills or examples. `pnpm validate` fails when it is stale, over 5 MB or carries media. `pnpm validate` fails on a stale index, a dangling reference or a budget overrun.
- Decisions live in `specifications/decisions/` as numbered ADRs. Read 0001 (in-house engine) and 0002 (headless, no editor) before proposing architecture.
- Plugin distribution (Claude Code and Codex) and the human review layer are specified in `specifications/vcr-plugin-prd.md` and ADR 0003; read them before touching root resolution, packaging, review files or storage.
- When agents work in git worktrees, merge their branches into one integration branch, rebuild the index once, and never `git add -A` from the main checkout while worktrees exist under `.claude/worktrees/`.

## How to navigate the catalogue

Four tiers, each sized to one decision. Descend only as far as the task needs.

1. Route: read `catalog/INDEX.md` whole (under 16 KB). One line per tool.
2. Shortlist: `pnpm vcr tools info <id>` for two or three tools. Summary, use when, avoid when, pairs with, evidence.
3. Commit: `pnpm vcr tools info <id> --full` loads the operating guide (`skills/<id>/SKILL.md`). One at a time.
4. Do: `pnpm vcr tools examples <id>`, then open one example directory.

Never load more than one guide at a time unless comparing two tools. A card or guide never claims the tool is installed; `pnpm doctor` does.

## Repository map

- `catalog/`: one record per tool under `tools/`, retired records under `retired/`, generated `tools.json` and `INDEX.md`, vocabulary, schemas, `ASSESSMENT-BRIEF.md`.
- `environment/`: the maintainer's per-machine tool availability from `vcr doctor --record` (`pnpm doctor`). The only place installation is a fact for validation evidence; other machines record to `~/.vcr/environment/`.
- `vcr.json`: marks this repository as a VCR workspace, so harness and workspace resolve to the same root (dev mode). See `vcr status`.
- `packages/`: `cli` (the `vcr` command), `timeline` (time types), `capture` (browser frame capture).
- `skills/`: flat `skills/<name>/SKILL.md` operating guides, no `vcr-` prefix; `.claude/skills` links here.
- `plugin/`: generated Claude Code and Codex plugin; marketplaces at `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`.
- `examples/`: validated fixtures with `example.json`, `run.sh` and `expected/`.
- `projects/`: products and productions following the project schema.
- `shared/`, `references/`: reserved for Layer 1 and Layer 7; empty.
- `specifications/`: PRD, `decisions/` (ADRs), `spikes/` (reports).

## Current boundary

Layer 0 is complete: every live record is carded and assessed, eight carry validation evidence, and six fixtures reproduce. Layer 1 (project workspace) has not started. There is no timeline resolver, compositor, review surface or reference search; do not imply one. The TypeScript toolchain, pnpm workspace and JSON Schemas are decided, not provisional. Everything beyond Layer 0 is still provisional per the PRD.
