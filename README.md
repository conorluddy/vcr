# VCR

VCR is a local-first, agent-friendly workspace for creating and reviewing motion graphics, images, and video with native creative tools. This repository is being built in layers; the first foundation is tool discovery and a reusable project layout.

## Current status

Layer 0 (tool suite) is complete and Layer 1 has not started. Concretely:

- **Catalogue**: 104 live records under `catalog/tools/`, one file each, every one carrying a tier 1 card (summary, use when, avoid when, pairs with) and, for the 98 non-core records, a dated assessment against its official source. 16 tools were retired to `catalog/retired/` with their reasoning. `catalog/tools.json` and `catalog/INDEX.md` are generated; run `pnpm vcr catalog build` after editing a record.
- **Evidence**: eight records carry validation evidence from the six fixtures under `examples/`, all reproducible on the primary Mac with `run.sh`. Installation facts live in `environment/`, never in the catalogue.
- **Skills**: operating guides for the six core tools (SVG, GSAP, p5.js, Three.js, FFmpeg, Blender) plus ImageMagick and resvg. `.claude/skills` links there.
- **Code**: `packages/cli` (the `vcr` command), `packages/timeline` (PRD §9 time types only), `packages/capture` (deterministic browser frame capture, see `specifications/spikes/browser-capture.md`).
- **Decided**: the composition engine is built in-house (ADR 0001) and the studio stays headless with read-only visualisers (ADR 0002). The timeline resolver, compositor and review surface described as later layers do not exist yet.

## Commands

Requires Node 22 and pnpm. `pnpm install`, then:

```text
pnpm validate                      # schemas, capability vocabulary, unknown-field diagnostics
pnpm vcr tools list --tier core    # filter by --capability, --tier, --category; add --json
pnpm vcr tools info ffmpeg-ffprobe [--full]
pnpm vcr tools examples ffmpeg-ffprobe
pnpm doctor                        # probes local tools, writes environment/<hostname>.json
pnpm vcr catalog build [--check]   # regenerate catalog/tools.json and catalog/INDEX.md from catalog/tools/*.json
pnpm test && pnpm typecheck
```

Every command logs one JSON line to stderr with `command`, `duration_ms` and `exit_code`. Exit codes: 0 ok, 1 failed, 2 usage.

## Find a tool

The catalogue is a four-tier tree sized to the decisions an agent makes:

| Tier | Moment | Where | Budget |
| --- | --- | --- | --- |
| 0 | route a task | `catalog/INDEX.md`, `pnpm vcr tools list` | whole file under 16 KB |
| 1 | compare a shortlist | `pnpm vcr tools info <id>`, `catalog/tools/<id>.json` | about 200 tokens |
| 2 | commit to a tool | `pnpm vcr tools info <id> --full`, `skills/toolkits/<id>/SKILL.md` | under 12 KB |
| 3 | do the work | `pnpm vcr tools examples <id>`, `examples/<id>/` | one at a time |

Budgets and every cross-reference (pairs with, skill, examples, facet sections) are enforced by `pnpm validate`.

## Start a project

Copy `projects/templates/product/` to `projects/<project-id>/`, then update `project.json`, brand tokens, asset manifest, and video records. Keep generated renders and caches under the configured output directories; `.gitignore` excludes those directories by default.

## Committed media policy

Media is ignored by directory, not by extension, so brand assets and fixtures can live in Git. Keep any committed image under 200 KB and any committed audio or video under 1 MB; anything larger belongs in an output directory or the asset store chosen in Layer 1. Prefer a content hash in `expected/` over a committed render where a hash is enough to verify.

## Repository map

- `catalog/` — one record per tool under `tools/`, retired records under `retired/`, generated `tools.json` and `INDEX.md`, the capability vocabulary, JSON Schemas, and the assessment brief.
- `environment/` — per-machine tool availability written by `vcr doctor`.
- `packages/cli/` — the `vcr` command. `packages/timeline/` — time types. `packages/capture/` — browser frame-capture harness.
- `skills/` — toolkit and workflow operating guides in Agent Skills format.
- `examples/` — validated fixtures, each with `example.json`, `run.sh` and `expected/`.
- `projects/` — in-repository productions and the project template.
- `shared/` — versioned shared components, transitions and presets (empty until Layer 1).
- `references/` — curated production metadata (empty until Layer 1).
- `specifications/` — the PRD, decision records and spike reports.

See [`AGENTS.md`](AGENTS.md) for repository working rules and [`specifications/vcr-prd.md`](specifications/vcr-prd.md) for the complete product direction.
