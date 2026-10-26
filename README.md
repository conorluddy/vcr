# Motion Harness

Motion Harness is a local-first, agent-friendly workspace for creating and reviewing motion graphics, images, and video with native creative tools. This repository is being built in layers; the first foundation is tool discovery and a reusable project layout.

## Current status

- 113 resources from PRD Appendix A are listed in [`catalog/tools.json`](catalog/tools.json).
- Registry entries are discovery metadata. Installation is unknown, validation is not performed, and no shared adapters are implemented yet.
- The project and tool JSON Schemas are in `catalog/schemas/`.
- `examples/` and `projects/templates/` are starter source files, not validated render fixtures.
- The common timeline, compositor, renderer, and CLI described as later layers do not exist yet.

## Find a tool

Open `catalog/tools.json` and filter by `category`, `role`, or `official_url`. Check the resource's official documentation before installing it. The catalogue records intent from the PRD and does not attest to current versions, licenses, platform support, or machine installation.

## Start a project

Copy `projects/templates/product/` to `projects/<project-id>/`, then update `project.json`, brand tokens, asset manifest, and video records. Keep generated renders and caches under the configured output directories; `.gitignore` excludes them by default.

## Repository map

- `catalog/` — tool registry, capability vocabulary, and schemas.
- `skills/` — progressively loaded toolkit and production workflow guides.
- `examples/` — minimal native examples with status and reproduction notes.
- `projects/` — in-repository productions and reusable project templates.
- `shared/` — versioned shared components, transitions, and presets.
- `references/` — curated production metadata and lessons.
- `specifications/` — product requirements and decisions.

See [`AGENTS.md`](AGENTS.md) for repository working rules and [`specifications/motion-harness-prd.md`](specifications/motion-harness-prd.md) for the complete product direction.
