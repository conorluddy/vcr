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

## How to navigate the catalogue

Four tiers, each sized to one decision. Descend only as far as the task needs.

1. Route: read `catalog/INDEX.md` whole (under 12 KB). One line per tool.
2. Shortlist: `pnpm vcr tools info <id>` for two or three tools. Summary, use when, avoid when, pairs with, evidence.
3. Commit: `pnpm vcr tools info <id> --full` loads the operating guide (`skills/toolkits/<id>/SKILL.md`). One at a time.
4. Do: `pnpm vcr tools examples <id>`, then open one example directory.

Never load more than one guide at a time unless comparing two tools. A card or guide never claims the tool is installed; `pnpm doctor` does.

## Repository map

- `catalog/`: one record per tool under `tools/`, a generated `tools.json` index, capability vocabulary, and schemas. Edit records, never the index.
- `skills/`: toolkit and workflow operating guides, added as they become operational.
- `examples/`: small native examples with explicit status and reproduction notes.
- `projects/`: products and productions following the project schema.
- `shared/`: reusable components and presets with explicit versions.
- `references/`: curated production metadata; default status is not approved.
- `specifications/`: product requirements and decisions.

## Current boundary

The catalogue is discovery metadata. No tool is claimed as installed or validated by this repository yet. TypeScript orchestration, package management, schemas beyond the initial JSON contracts, and shared rendering APIs remain provisional per the PRD.
