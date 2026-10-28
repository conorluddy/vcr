---
name: init
description: Set up a VCR workspace in the current project so videos, examples and renders have a home, and check the machine can capture. Use when the user asks to set up or initialise VCR, or when a VCR task finds no workspace (`vcr status` shows workspace none). Safe to re-run; it changes nothing that already exists.
---

# init: set up a VCR workspace

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Steps

1. Run `vcr status --json`. If `workspace` is not null, report the three roots (`harness`, `workspace`, `machine`) and stop: the workspace already exists.
2. Choose the directory. Default to the git root (`git rev-parse --show-toplevel`); without git, the current directory. Ask the user only when that is ambiguous, for example a monorepo where a package directory may be the better home.
3. Run `vcr workspace init --workspace <dir>`. It writes `vcr.json` and adds `output/`, `.cache/` and `.vcr/` to `.gitignore`, nothing else, and reports what it changed.
4. Run `vcr doctor` to record which tools this machine has (written to the machine root, never the project).
5. Run `vcr setup capture`. If it lists planned steps, show them to the user, including the Chromium download (about 150 MB, shared across projects), and ask before running `vcr setup capture --yes`. If they decline, the workspace still works; the first capture will ask again.
6. Finish with the three roots from `vcr status`, and offer to start a first video or try an example (`vcr example create three-capture`).

## Rules

- Never overwrite an existing `vcr.json`; `vcr workspace init` refuses to anyway.
- Never download the capture runtime without showing its size and getting a yes.
- Inside the Codex sandbox, `vcr status` shows the machine root falling back to `<workspace>/.vcr`; that is expected.
