---
name: caption-checker
description: Check SRT and WebVTT caption files against caption-checker's named limits with the `caption-check` CLI and read its JSON report. Use when caption cues already exist as a file and need a machine pass for line length, line count, duration and overlap; not for converting formats (ttconv) or burning captions in.
---

# caption-checker

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Tested: caption-checker 1.3.3 with the `netflix` profile on hand-written SRT and WebVTT files. Two clean files (5 cues each) exit 0 with zero issues. Two files with 6 cues each and four predeclared violations exit 1 and flag exactly four cues: cue 2 `cpl` (a 61-character line), cue 3 `lines` (3 lines), cue 4 `short` (0.40 s), cue 5 `overlap` (0.50 s). SRT and WebVTT agree, and each file's JSON is byte-identical across two runs. Node v22.19.0, macOS arm64.
- caption-checker checks captions; ttconv converts them. Run the check on the file you will deliver, after any conversion. It does not draw captions: libass or FFmpeg burn them in.
- The limits it applies belong to its profile, not to VCR. Read the numbers from its report (for example "limit 42") and do not quote them as VCR thresholds. VCR's pillar rules are `vcr rules info TYPO-CAPTION-CPS`, `TYPO-CAPTION-LINES` and `TYPO-CAPTION-DURATION`; for access needs use the accessibility skill. A passing file is not proof of a good caption file.
- Not tested: the `bbc`, `dcmp-*` and `netflix-kids` profiles; the gap and reading-speed rules; advisory messages; `--fix`, `--to`, `--shift`, `--rate`, `--sync`, `--vertical`, `--fps`; the MCP server; non-English text; other platforms.

## Capability map
Discovery only; documented does not mean validated. Entry points: [repository and README](https://github.com/markksantos/caption-checker), [homepage](https://www.markstudios.com/tools/caption-checker).
- `caption-check <file> --standard netflix --json`: check one SRT or WebVTT file; JSON report and exit code (tested).
- Other profiles via `--standard` (untested).
- Rule kinds `cpl`, `lines`, `short`, `overlap` (tested); gap and reading-speed rules, advisory notes (untested).
- Fix, convert and retime options, and the bundled MCP server (`mcp.js`) (untested).

## Install and doctor
Not published on npm (`E404`); install as a git dependency pinned to a commit:
```text
pnpm add github:markksantos/caption-checker#4a504ede1606fbefd7e7b658281b9b8f7a4ef9e2
pnpm -s exec caption-check --help
```
Validated: 1.3.3 at that commit (the `v1.3.3` tag), no runtime dependencies, no install scripts, MIT. Pin the commit; an unpinned name resolves to nothing. `vcr doctor` reports whether it is installed.

## Smoke test
```text
vcr example create caption-checker-limits   # then pnpm install at the workspace root
(cd examples/caption-checker-limits && ./run.sh)
# expect: caption-checker-limits: OK (caption-checker 1.3.3, node v22.19.0, 4 files x 2 runs identical, 4 summaries)
```
The node version printed is the one that ran. `run.sh` has no `--record`: `expected/checks.json` was written by hand before the first run.

## Recipe (the tested route)
```text
caption-check captions.srt --standard netflix --json > report.json; echo $?
jq '[.cues[] | select(.issues | length > 0) | {n, kinds: [.issues[].kind]}]' report.json
```
Exit 0 means no flagged cue; exit 1 means at least one issue. The report has `cues[]`, each with `n` (1-based block order), `issues[]` (`kind`, `severity`, `message`), and measured `duration`, `chars`, `cps`, `wpm`.

## Tested behaviour
- Violations land on the right cue numbers with the right kinds, identically for SRT and WebVTT.
- Message text, such as "Line 1 is 61 characters (limit 42)", was read but only kinds and cue numbers were compared.
- Rerun byte identity is observed on this machine only. The `file` field is the path as given.

## Troubleshooting
- `npm install caption-checker` fails with E404: use the pinned git dependency above.
- `caption-check` not found: run it through `pnpm -s exec` from the project that installed it.
- Non-zero exit is a finding, not a crash: capture JSON before testing the exit code (`set +e` under `set -e`).

## Official docs
- https://github.com/markksantos/caption-checker
