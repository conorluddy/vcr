# VCR

VCR is a local-first, agent-friendly workspace for creating and reviewing motion graphics, images, and video with native creative tools. It ships as a plugin for Claude Code and Codex, so an agent can use it from any project. This repository is being built in layers; the first foundation is tool discovery, deterministic capture and a reusable project layout.

## Current status

Layer 0 (tool suite) is complete, the plugin is installable (plugin PRD phases P0 and P1), and Layer 1 has not started. Concretely:

- **Catalogue**: 104 live records under `catalog/tools/`, one file each, every one carrying a tier 1 card (summary, use when, avoid when, pairs with) and, for the 98 non-core records, a dated assessment against its official source. 16 tools were retired to `catalog/retired/` with their reasoning. `catalog/tools.json` and `catalog/INDEX.md` are generated; run `pnpm vcr catalog build` after editing a record.
- **Evidence**: eight records carry validation evidence from the six fixtures under `examples/`, all reproducible on the primary Mac with `run.sh`. Installation facts live in `environment/`, never in the catalogue.
- **Skills**: operating guides for the six core tools (SVG, GSAP, p5.js, Three.js, FFmpeg, Blender) plus ImageMagick and resvg, and two workflow skills: `start` (router) and `init` (workspace setup). `.claude/skills` links there.
- **Plugin**: `plugin/` is a generated, committed Claude Code and Codex plugin: a single-file bundled CLI, the catalogue, the skills and example sources. It works from any directory against a read-only harness; see "Install as a plugin" below and `specifications/spikes/plugin-invocation.md`.
- **Code**: `packages/cli` (the `vcr` command), `packages/timeline` (PRD §9 time types only), `packages/capture` (deterministic browser frame capture, see `specifications/spikes/browser-capture.md`).
- **First production**: a Grapla launch proof of concept (PRD §18) was rendered and assembled without a timeline engine, then removed. It is in git history at `a39043a`.
- **Decided**: the composition engine is built in-house (ADR 0001), the studio stays headless with read-only visualisers (ADR 0002), and VCR is distributed as a plugin with a bundled CLI and three roots (ADR 0003). The timeline resolver, compositor and review surface described as later layers do not exist yet.

## Commands

Requires Node 22 and pnpm. `pnpm install`, then:

```text
pnpm validate                      # schemas, capability vocabulary, unknown-field diagnostics
pnpm vcr tools list --tier core    # filter by --capability, --tier, --category; add --json
pnpm vcr tools info ffmpeg-ffprobe [--full]
pnpm vcr tools examples ffmpeg-ffprobe
pnpm doctor                        # probes local tools, writes ~/.vcr/environment/ and (here) environment/<hostname>.json
pnpm vcr status                    # harness, workspace and machine roots; dev mode inside this repository
pnpm vcr workspace init            # make a directory a VCR workspace (vcr.json); idempotent
pnpm vcr example create <id>       # copy an example's sources into <workspace>/examples/<id>; prints next steps
pnpm vcr setup capture [--yes]     # plan, then install, Playwright + Chromium into ~/.vcr/runtime
pnpm vcr capture <scene.html> --width 1280 --height 720 --fps 30 [--out dir] [--verify]
pnpm vcr catalog build [--check]   # regenerate catalog/tools.json and catalog/INDEX.md from catalog/tools/*.json
pnpm vcr plugin build              # regenerate plugin/ (bundled CLI, skills, catalogue, manifests); commit it
pnpm test && pnpm typecheck
```

Every command logs one JSON line to stderr with `command`, `duration_ms` and `exit_code`. Exit codes: 0 ok, 1 failed, 2 usage.

Roots (`specifications/vcr-plugin-prd.md` §6.1): the harness is this repository (or `VCR_HARNESS`) and is never written outside dev mode; the workspace is the nearest ancestor of cwd holding `vcr.json` (or `--workspace`, `VCR_WORKSPACE`); machine state lives in `VCR_HOME` (default `~/.vcr`). This repository has its own `vcr.json`, so here harness and workspace coincide and maintainer commands (`catalog build`, `doctor --record`) are allowed.

## Install as a plugin

From this repository's marketplace (private for now; the marketplaces live at `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`):

```text
claude plugin marketplace add <path-or-git-url-of-this-repo>
claude plugin install vcr@vcr

codex plugin marketplace add <path-or-git-url-of-this-repo>
codex plugin add vcr@vcr
```

Then, in any project, ask the agent to set up VCR (the `init` skill, `/vcr:init` in Claude Code). It writes `vcr.json`, records the machine's tools in `~/.vcr`, and offers to install the capture runtime (Playwright and about 150 MB of Chromium, shared across projects). Requires Node 22 or newer; nothing else is installed until you agree.

Under Codex's sandbox, VCR keeps its machine files in `<workspace>/.vcr` and captures with `--single-process` (byte-identical output, measured in spike S1). Capture needs `sandbox_workspace_write.network_access = true`, and the first Chromium download must happen once outside the sandbox.

## Find a tool

The catalogue is a four-tier tree sized to the decisions an agent makes:

| Tier | Moment | Where | Budget |
| --- | --- | --- | --- |
| 0 | route a task | `catalog/INDEX.md`, `pnpm vcr tools list` | whole file under 16 KB |
| 1 | compare a shortlist | `pnpm vcr tools info <id>`, `catalog/tools/<id>.json` | about 200 tokens |
| 2 | commit to a tool | `pnpm vcr tools info <id> --full`, `skills/<id>/SKILL.md` | under 12 KB |
| 3 | do the work | `pnpm vcr tools examples <id>`, `examples/<id>/` | one at a time |

Budgets and every cross-reference (pairs with, skill, examples, facet sections) are enforced by `pnpm validate`.

## Start a project

Copy `projects/templates/product/` to `projects/<project-id>/`, then update `project.json`, brand tokens, asset manifest, and video records. Keep generated renders and caches under the configured output directories; `.gitignore` excludes those directories by default.

## Committed media policy

Media is ignored by directory, not by extension, so brand assets and fixtures can live in Git. Keep any committed image under 200 KB and any committed audio or video under 1 MB; anything larger belongs in an output directory or the asset store chosen in Layer 1. Prefer a content hash in `expected/` over a committed render where a hash is enough to verify.

## Repository map

- `catalog/` — one record per tool under `tools/`, retired records under `retired/`, generated `tools.json` and `INDEX.md`, the capability vocabulary, JSON Schemas, and the assessment brief.
- `environment/` — the maintainer's per-machine tool availability, written by `vcr doctor --record`. Users' records go to `~/.vcr/environment/`.
- `packages/cli/` — the `vcr` command. `packages/timeline/` — time types. `packages/capture/` — browser frame-capture harness.
- `skills/` — flat `skills/<name>/SKILL.md` toolkit and workflow guides in Agent Skills format.
- `plugin/` — generated Claude Code and Codex plugin (`pnpm vcr plugin build`); never edit by hand.
- `vcr.json` — marks this repository as a workspace too, so harness and workspace coincide here (dev mode).
- `examples/` — validated fixtures, each with `example.json`, `run.sh` and `expected/`; copied into other workspaces by `vcr example create`.
- `projects/` — in-repository productions and the project template.
- `shared/` — versioned shared components, transitions and presets (empty until Layer 1).
- `references/` — curated production metadata (empty until Layer 1).
- `specifications/` — the PRD, the plugin PRD, decision records and spike reports.

See [`AGENTS.md`](AGENTS.md) for repository working rules and [`specifications/vcr-prd.md`](specifications/vcr-prd.md) for the complete product direction.
