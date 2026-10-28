# 0003. Distribute as a plugin with a bundled CLI and three roots

Date: 2026-10-28
Status: proposed

## Context

VCR works only inside its own repository. `findRepositoryRoot()` walks up to `catalog/`, `vcr doctor` writes into the repository, skills are found through the `.claude/skills` symlink, and Grapla's `render.ts` imports `@vcr/capture` through the pnpm workspace. Codex sees none of it.

The PRD (§7) allows "standalone projects depending on a versioned harness distribution" and requires that a clone works without package publication on day one. The owner has decided on full Codex parity in v1, an audience of one owner now and the public later, and a human review layer that writes only findings and approvals (ADR 0002). The full rationale is in `specifications/vcr-plugin-prd.md`.

## Options considered

1. **Monorepo only, symlink skills.** No packaging work, but product repositories and Codex stay unsupported, and doctor still writes into the harness.
2. **Publish the CLI to npm and pin it through `npx`, as HyperFrames does.** A proven pattern, but it requires public publication, which comes later.
3. **Plugin with an MCP server.** Each host launches the server with a known root, which solves invocation. It costs a long-running process, tool schemas in context, and minute-long renders that do not fit synchronous tool calls.
4. **Plugin with a committed, bundled single-file CLI, three roots, no MCP.** Skills drive `vcr` through the shell on both hosts; the harness is read-only, the workspace is marked by `vcr.json`, and machine state lives in `VCR_HOME`.

## Decision

Option 4. Split `findRepositoryRoot()` into harness, workspace and machine roots, with dev mode when harness and workspace coincide. Ship a generated, committed `plugin/` directory containing skills, catalogue data, example sources, `cli/vcr.mjs` and both host manifests, with marketplaces for Claude Code and Codex at the repository root. No `bin/`, no MCP, commands or subagents in v1. How skills invoke the CLI on both hosts is settled by spike S1. Option 3 is the fallback if S1 fails; option 2 is revisited for a public release.

## Consequences

- `findRepositoryRoot()` splits into three resolvers. Doctor output moves to `VCR_HOME` for users; `environment/` stays the maintainer's record.
- `plugin/` is generated and committed like `catalog/INDEX.md`, and `vcr validate` fails when it is stale, oversized or carries media.
- Projects stop importing `@vcr/capture`; `vcr` owns capture invocation, and `vcr setup capture` installs Playwright and Chromium into `VCR_HOME`.
- Two manifests and two marketplaces must be kept in step, generated from one source.
- Examples run outside the repository through `vcr example create`, no longer in place against the pnpm workspace.

## Revisit when

A target host lacks a shell, spike S1 cannot make CLI invocation reliable on both hosts, or a public release makes npm publication worthwhile.
