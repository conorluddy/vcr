---
name: ingest
description: Assess or ingest a creative-tool discovery candidate for VCR, including catalogue research and optional local inspection or fixture planning. Use when asked to evaluate, document or add a tool to VCR; not for ordinary tool selection or production work.
---

# Ingest a VCR tool candidate

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run `vcr status --json` to identify the harness, workspace and machine roots.

Read `<harness>/catalog/CANDIDATE-INGESTION.md` for the lifecycle and `<harness>/catalog/ASSESSMENT-BRIEF.md` for a documentation assessment. For a fixture, also read `<harness>/catalog/FIXTURE-EVIDENCE-TEMPLATE.md`. These files ship with the plugin; use the harness root reported by `vcr status`, not a hard-coded installation path.

1. Establish the requested tool and VCR job. Check live records and compare a relevant existing tool; check retired records in the repository when available. The installed plugin does not ship retired records, so disclose when that check was unavailable. Use the catalogue's progressive disclosure; do not load unrelated guides. Choose whether to assess, defer or recommend retirement, with a reason.
2. Assess the official project sources, automation route, licence, dependencies, maintenance and version evidence. Keep unknowns explicit and distinguish code, models, assets, services and outputs. A card describes a tool; it does not establish installation or a working integration.
3. If useful and within scope, check the local executable or library without installing it. For an installed CLI inspect its path, version and documented help command; for a library inspect the version and relevant API documentation. Treat local help as evidence of that interface and version, not proof a creative workflow works. Cross-check official sources and report discrepancies. Record machine facts via `vcr doctor` where supported, never as catalogue-wide installation claims.
4. If the user wants local inspection or a fixture but a dependency is missing, show an installation plan, including method, dependencies and destination; get the user's approval unless already given, then follow environment permissions. If declined or unavailable, continue the documentation assessment and report the gap. Do not install silently. Plan a fixture with predeclared checks before running it; fixture execution must be within the user's requested scope. Separate tool results from edge compatibility, output quality and support across environments.
5. Recommend the next step: retain, promote or retire the record; plan or run a scoped fixture; and identify the skill opportunity. Choose no skill yet, an existing skill, a VCR toolkit skill, a standalone skill useful without VCR, or further research first. Give the use case, evidence and gaps; check for existing skills and consider ownership and maintenance before recommending a separate repository. Do not create one without authorization. An adapter is optional and describes a specific shared job; native interfaces stay accessible. A reviewer decides catalogue promotion and validation based on evidence.

## Write boundaries

In the VCR repository, update only relevant source records and evidence; never edit generated `catalog/tools.json`, `catalog/INDEX.md`, `catalog/CANDIDATES.md` or `plugin/`. After source record changes run `pnpm vcr catalog build`, `pnpm vcr plugin build` and `pnpm validate`, and commit generated results with the source. In an installed plugin, the harness is read-only: report findings to the user, or write a requested report in the selected workspace. Do not create or modify catalogue records inside the plugin, and do not claim this updates the shared catalogue. Generated media and caches belong in ignored output directories.
