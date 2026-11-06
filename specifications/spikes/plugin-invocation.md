# Spike: plugin CLI invocation and the Codex sandbox (S1)

Date: 2026-10-28 · Machine: Conors-MacBook-Pro-2 (macOS 25.6 arm64) · Claude Code 2.1.312 · Codex CLI 0.164.0 · Node 22.19.0 · Playwright Chromium 156.0.8078.4 · Issue #26

## Question

How do plugin skills invoke a committed CLI bundle on both Claude Code and Codex, in a way that survives plugin updates? What does Codex's sandbox allow: writing `~/.vcr`, binding loopback, launching Chromium? How are plugin skills named, and do plugin hooks run? (`vcr-plugin-prd.md` §6.2, §9, §11.)

## Decision

**Go for P1, with invocation (b): resolve the plugin root relative to the skill file.** It is the only candidate that works on both hosts, and it survives updates, because each host hands the model the current SKILL.md path every session. MCP is not needed.

The Codex sandbox does block the defaults (`~/.vcr`, loopback and Chromium). Each has a measured workaround, below. Plugin hooks do not exist in Codex, so hooks are Claude-only conveniences.

## Method

A throwaway plugin `vcr-probe` (not committed):

- two skills, `init` and `hello`
- `cli/probe.mjs`, which reports its own root, the env, a `~/.vcr` write, a loopback bind and a Chromium launch through `VCR_HOME/runtime`
- a SessionStart hook that writes a `~/.vcr/bin` shim
- both manifests and both marketplaces

It was installed from a local marketplace into both hosts, then driven headless (`claude -p` with a tool allowlist; `codex exec`), then bumped from 0.1.0 to 0.2.0 and updated. The sandbox matrix was re-run deterministically with `codex sandbox` (the same seatbelt policy, no model in the loop). Everything was uninstalled afterwards.

## Numbers

Invocation, from an empty directory:

| Candidate | Claude Code | Codex |
| --- | --- | --- |
| (a) `${CLAUDE_PLUGIN_ROOT}` in skill text | ✓ substituted | ✗ not substituted (`Cannot find module '/cli/probe.mjs'`) |
| (b) plugin root = two levels above SKILL.md | ✓ | ✓ (the model reads the skill by absolute path) |
| (c) `~/.vcr/bin` shim from a SessionStart hook | ✓ | ✗ the hook never runs: `codex features list` shows `plugin_hooks  removed` |

Where the plugin lives, and what an update does:

| | Claude Code | Codex |
| --- | --- | --- |
| Local-directory marketplace | Runs from the **source directory** ("Read from: …") | Copies to `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/` |
| Update 0.1.0 → 0.2.0 | Adds a `cache/…/0.2.0` directory, **keeps** 0.1.0, "Restart to apply" | Replaces the cache: **0.1.0 is deleted** at once |
| Skill listing seen by the model | `plugin:skill` | `vcr-probe:init: <description> (file: <absolute SKILL.md path>)` |
| Env in hooks | `CLAUDE_PLUGIN_ROOT`, `CLAUDE_PLUGIN_DATA` | n/a (no plugin hooks) |
| Env in skill shell commands | Neither variable is set; substitution happens in the skill text only | `CODEX_SANDBOX=seatbelt`, `CODEX_PERMISSION_PROFILE`, `CODEX_SANDBOX_NETWORK_DISABLED=1` |

Codex sandbox matrix (`codex sandbox`, probe run under invocation (b)):

| Sandbox | Write `VCR_HOME` | Bind 127.0.0.1 | Chromium |
| --- | --- | --- | --- |
| `read-only` (the `codex exec` default) | ✗ EPERM | ✗ EPERM | ✗ EPERM on `mkdtemp` in `$TMPDIR` |
| `workspace-write`, `VCR_HOME=~/.vcr` | ✗ EPERM | ✗ EPERM | ✗ killed ("browser has been closed") |
| `workspace-write`, `VCR_HOME=<workspace>/.vcr` | ✓ | ✗ EPERM | ✗ killed |
| `workspace-write` + `network_access=true`, workspace-local `VCR_HOME` | ✓ | ✓ | ✗ killed |
| `workspace-write` + `writable_roots=["~/.vcr"]` + `network_access=true` | ✓ | ✓ | ✗ killed |
| `workspace-write`, Chromium with `--single-process`, `TMPDIR` inside the workspace | ✓ | — | ✓ WebGL 2.0 available |
| `danger-full-access` | ✓ | ✓ | ✓ |

Chromium flag bisect inside `workspace-write`: `--single-process` alone is enough. `chromiumSandbox: false`, `--no-zygote` and the `chromium-headless-shell` channel each still fail. On Claude Code (no sandbox), every check passes for all three candidates.

## Contract for P1

- **Invocation.** Every skill that calls the CLI states: "The VCR plugin root is two directories above this SKILL.md; run `node <root>/cli/vcr.mjs …`." No `${CLAUDE_PLUGIN_ROOT}` in skill text, no shim, no `bin/`.
- **Codex detection.** When `CODEX_SANDBOX` is set, the CLI:
  - defaults `VCR_HOME` to `<workspace>/.vcr` (ignored) unless `~/.vcr` is writable;
  - sets `TMPDIR` inside `VCR_HOME` for children;
  - launches Chromium with `--single-process`.
  - `vcr status` reports which of these applied.
- **Review server under Codex.** It needs `sandbox_workspace_write.network_access = true`, or an approved escalation. `vcr review open` prints that config line when binding fails with EPERM, rather than failing silently.
- **Recommended Codex setup** (amended 2026-10-28: scope it to a VCR profile, `~/.codex/vcr.config.toml` used via `codex -p vcr`, or a per-run `-c` flag, never the global config, because `network_access` there opens every Codex session to the network): add `~/.vcr` to `sandbox_workspace_write.writable_roots` and turn on `network_access`. That keeps one shared Chromium (PRD §6.1). The workspace-local `VCR_HOME` is the zero-config fallback, at the cost of one runtime per workspace.
- **Hooks.**
  - Claude only. User-scope plugin hooks fire in **every** Claude session on the machine: during this spike, a session in an unrelated product worktree ran the probe's hook.
  - So the session-start hook must be silent and fast outside a VCR workspace, and must never write outside `VCR_HOME`.
- **Smoke suite (PX-02).**
  - Drive Claude with `--allowedTools`, not `--dangerously-skip-permissions`. The skip-permissions form is refused by Claude Code's auto-mode classifier when run from inside another Claude session.
  - Drive Codex with `codex exec`; use `codex sandbox` for the deterministic matrix.

## Limitations

- ~~**Byte-identical capture under `--single-process` is unverified.**~~ Verified; see the addendum. The browser-capture spike's determinism results were measured in normal multi-process mode, so P1 must re-run the fixtures' `expected/` comparisons in Codex mode before claiming parity.
- **A Codex run hung.** One `codex exec` under `workspace-write`, with an env-prefixed command, hung for more than 8 minutes without running the probe, probably waiting on approval review (`approvals_reviewer = "auto_review"`). Unattended Codex runs need commands that are allowed without escalation.
- **Codex skill invocation was not tested by name.** The skill was loaded from a natural-language request. How a Codex user types a plugin skill name (the equivalent of `/vcr:init`) was not exercised.
- **Remote marketplaces were not tested.** Only local-directory marketplaces were installed. Git-sourced Claude installs run from the cache, so the version-directory behaviour above applies to them.
- **One machine, one version of each host.** Codex removed `plugin_hooks` at some point before 0.164.0; this may change again.

## Addendum, same day: capture determinism under `--single-process`

Each browser fixture was captured three ways:

- normal multi-process
- `VCR_CHROMIUM_EXTRA_ARGS=--single-process`
- `--single-process` inside `codex sandbox` (`workspace-write` + `network_access`, `TMPDIR` in the workspace)

Each run's 90 PNG frames were hashed, and the hashes compared.

| Fixture | Normal | `--single-process` | Codex sandbox | Shuffled order matches sequential |
| --- | --- | --- | --- | --- |
| browser-capture (DOM/GSAP) | `845d0a909b5a5a3c` | same | same | yes, all three |
| p5-capture (2D canvas) | `ccae37b821f28141` | same | same | yes, all three |
| three-capture (WebGL) | `fdd4714902223fd5` | same | same | yes, all three |

**Byte-identical in every mode.** `--single-process` is safe as the Codex capture mode, and the first limitation above is resolved. The scene server's loopback bind means capture under Codex needs `network_access`, the same as the review server.
