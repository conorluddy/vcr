# VCR

VCR is a local-first, agent-friendly workspace for creating and reviewing motion graphics, images, and video with native creative tools. This repository is being built in layers; the first foundation is tool discovery and a reusable project layout.

## Current status

- 119 resources from PRD Appendix A live as one file each under `catalog/tools/`, with a `tier` (`core`, `catalogued`, `candidate`), per-tool capabilities, licence as last understood and an install recipe where one exists. `catalog/tools.json` is a generated index; run `pnpm vcr catalog build` after editing a record.
- Registry entries are discovery metadata. Six records carry validation evidence from the examples; installation facts live in `environment/`; no shared adapters are implemented yet.
- The project and tool JSON Schemas are in `catalog/schemas/`.
- `examples/` holds four validated fixtures on the primary Mac: SVG via resvg and FFmpeg, FFmpeg sequence-plus-audio assembly, a Blender background render, and deterministic browser capture of a GSAP timeline (`specifications/spikes/browser-capture.md`). Each has a `run.sh` that diffs against `expected/`.
- `skills/toolkits/` has operating guides for FFmpeg, ImageMagick, resvg and Blender; `.claude/skills` links there so agents load them on demand.
- `packages/timeline/` holds the PRD §9 time types only; the resolver is Layer 2.
- The common timeline, compositor, renderer, and CLI described as later layers do not exist yet.

## Commands

Requires Node 22 and pnpm. `pnpm install`, then:

```text
pnpm validate                      # schemas, capability vocabulary, unknown-field diagnostics
pnpm vcr tools list --tier core    # filter by --capability, --tier, --category; add --json
pnpm vcr tools info ffmpeg-ffprobe [--full]
pnpm vcr tools examples ffmpeg-ffprobe
pnpm doctor                        # probes local tools, writes environment/<hostname>.json
pnpm vcr catalog build [--check]   # regenerate catalog/tools.json from catalog/tools/*.json
pnpm test && pnpm typecheck
```

Every command logs one JSON line to stderr with `command`, `duration_ms` and `exit_code`. Exit codes: 0 ok, 1 failed, 2 usage.

## Find a tool

The catalogue is a four-tier tree sized to the decisions an agent makes:

| Tier | Moment | Where | Budget |
| --- | --- | --- | --- |
| 0 | route a task | `catalog/INDEX.md`, `pnpm vcr tools list` | whole file under 12 KB |
| 1 | compare a shortlist | `pnpm vcr tools info <id>`, `catalog/tools/<id>.json` | about 200 tokens |
| 2 | commit to a tool | `pnpm vcr tools info <id> --full`, `skills/toolkits/<id>/SKILL.md` | under 12 KB |
| 3 | do the work | `pnpm vcr tools examples <id>`, `examples/<id>/` | one at a time |

Budgets and every cross-reference (pairs with, skill, examples, facet sections) are enforced by `pnpm validate`.

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
