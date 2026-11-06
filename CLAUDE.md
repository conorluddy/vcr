# VCR

Agent-friendly studio for code-first motion graphics and video, shipped as a plugin for Claude Code and Codex. Read in this order:

1. `AGENTS.md` — working rules and write boundaries.
2. `specifications/vcr-prd.md` — product intent and release gates. `specifications/README.md` explains how it decomposes; `specifications/vcr-plugin-prd.md` covers the plugin and the review layer.
3. `catalog/INDEX.md` — one line per tool; the entry point for choosing a tool. Then `pnpm vcr tools info <id>`, then `--full` for the guide, then `pnpm vcr tools examples <id>`. One tier at a time.
4. `specifications/decisions/` — ADR 0001 (engine in-house), 0002 (headless, no editor), 0003 (plugin, three roots), 0004 (disclosure and feedback) and 0006 (creative pillars, independent of tools) before proposing architecture.
5. `specifications/roadmap.md` — what to build next, in order. `references/README.md` — the creative pillars (typography, motion, pacing, delivery and the rest), their shared conventions and rule owners; start at `references/INDEX.md`, then `vcr rules info <ID>` or `vcr refs section <pillar> <§>`; never load a whole knowledge base.

Layer 0 is complete, the plugin is installable (plugin PRD P0, P1) and the review contract is in (P2: findings, render manifests, approvals, briefs, storage). The review pages (P3 onward) and Layer 1 have not started. Nothing in `catalog/` is installed unless `vcr doctor` says so, and nothing is validated unless its record carries evidence. After changing the CLI, catalogue, skills or examples, run `pnpm vcr plugin build`. `pnpm validate && pnpm test` before any PR.
