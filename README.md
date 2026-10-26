# VCR

VCR is a local-first, agent-friendly workspace for creating and reviewing motion graphics, images, and video with native creative tools. This repository is being built in layers; the first foundation is tool discovery and a reusable project layout.

## Current status

- 113 resources from PRD Appendix A are listed in [`catalog/tools.json`](catalog/tools.json).
- Registry entries are discovery metadata. Installation is unknown, validation is not performed, and no shared adapters are implemented yet.
- The project and tool JSON Schemas are in `catalog/schemas/`.
- `examples/` and `projects/templates/` are starter source files, not validated render fixtures.
- The common timeline, compositor, renderer, and CLI described as later layers do not exist yet.

## Commands

Requires Node 22 and pnpm. `pnpm install`, then:

```text
pnpm validate                      # schemas, capability vocabulary, unknown-field diagnostics
pnpm vcr tools list --tier core    # filter by --capability, --tier, --category; add --json
pnpm vcr tools info ffmpeg-ffprobe
pnpm doctor                        # probes local tools, writes environment/<hostname>.json
pnpm test && pnpm typecheck
```

Every command logs one JSON line to stderr with `command`, `duration_ms` and `exit_code`. Exit codes: 0 ok, 1 failed, 2 usage.

## Find a tool

Run `pnpm vcr tools list` or open `catalog/tools.json` and filter by `category`, `role`, or `official_url`. Check the resource's official documentation before installing it. The catalogue records intent from the PRD and does not attest to current versions, licenses, platform support, or machine installation.

## Start a project

Copy `projects/templates/product/` to `projects/<project-id>/`, then update `project.json`, brand tokens, asset manifest, and video records. Keep generated renders and caches under the configured output directories; `.gitignore` excludes those directories by default.

## Committed media policy

Media is ignored by directory, not by extension, so brand assets and fixtures can live in Git. Keep any committed image under 200 KB and any committed audio or video under 1 MB; anything larger belongs in an output directory or the asset store chosen in Layer 1. Prefer a content hash in `expected/` over a committed render where a hash is enough to verify.

## Repository map

- `catalog/` — tool registry, capability vocabulary, and schemas.
- `environment/` — per-machine tool availability written by `vcr doctor`. Installation facts live here, never in the catalogue.
- `packages/cli/` — the `vcr` command.
- `skills/` — progressively loaded toolkit and production workflow guides.
- `examples/` — minimal native examples with status and reproduction notes.
- `projects/` — in-repository productions and reusable project templates.
- `shared/` — versioned shared components, transitions, and presets.
- `references/` — curated production metadata and lessons.
- `specifications/` — product requirements and decisions.

See [`AGENTS.md`](AGENTS.md) for repository working rules and [`specifications/vcr-prd.md`](specifications/vcr-prd.md) for the complete product direction.
