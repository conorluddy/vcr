# VCR

Agent-friendly studio for code-first motion graphics and video. Read in this order:

1. `AGENTS.md` — working rules and write boundaries.
2. `specifications/vcr-prd.md` — product intent and release gates. `specifications/README.md` explains how it decomposes.
3. `catalog/INDEX.md` — one line per tool; the entry point for choosing a tool. Then `pnpm vcr tools info <id>`, then `--full` for the guide, then `pnpm vcr tools examples <id>`. One tier at a time.

4. `specifications/decisions/` — ADR 0001 (engine in-house) and 0002 (headless, no editor) before proposing architecture.

Layer 0 is complete; Layer 1 has not started. Nothing in `catalog/` is installed unless `environment/` says so, and nothing is validated unless its record carries evidence. `pnpm validate && pnpm test` before any PR.
