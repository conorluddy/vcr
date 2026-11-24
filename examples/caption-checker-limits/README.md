# caption-checker limits

Status: validated on macOS arm64, 2026-11-24 (caption-checker 1.3.3 at 4a504ede, Node v22.19.0). Plan written before the first run; see Observation below.

## Intent and scope

- Tool: caption-checker, npm/GitHub `caption-checker`, version 1.3.3, installed project-locally as a git dependency pinned to commit `4a504ede1606fbefd7e7b658281b9b8f7a4ef9e2` (the commit tagged `v1.3.3`). The npm registry has no package of this name (E404 on 2026-11-24), so the npm install in the record could not be used. Binary: `caption-check`.
- VCR job and claim: `caption-check` with the `netflix` profile reads hand-written SRT and WebVTT files. A clean file reports zero issues. A file with predeclared violations (a line over the profile's per-line limit, too many lines, a cue shorter than the profile's minimum duration, an overlap with the next cue) reports exactly those issues on the right cue numbers, and its JSON output is byte-identical across reruns.
- Pillars: `TYPO-CAPTION-CPS`, `TYPO-CAPTION-LINES` and `TYPO-CAPTION-DURATION` in `references/typography/rules.json`. The thresholds applied are the checker's own `netflix` profile (`index.js` in the pinned package), not restated here as pillar rules. This fixture tests that the tool applies its profile as documented, not that the profile is right for any delivery.
- Exclusions: the `bbc`, `dcmp-*` and `netflix-kids` profiles; the gap-between-cues rule and the reading-speed rule (no fixture violates them; they are not in the claim); advisory notes (the fixtures must produce none, and that is asserted, but advisory messages are not tested); `--fix`, `--to`, `--shift`, `--rate`, `--sync`, `--vertical`, `--fps`; the MCP server; non-English text; the message wording (only kinds and cue numbers are compared); other operating systems; whether a file that passes is a good caption file.
- Documentation and licence: https://github.com/markksantos/caption-checker (README at the pinned commit; homepage https://www.markstudios.com/tools/caption-checker). Licence MIT, read from the repository's GitHub API metadata and its `package.json` at the pinned commit, checked 2026-11-24.
- Environment: macOS arm64 (Darwin 25.6.0), Node v22.19.0, pnpm 10.29.2 in the VCR workspace. No GPU, no network during the run; the git dependency is fetched once by `pnpm install`.
- Input: four hand-written caption files in `input/` (`clean.srt`, `clean.vtt`, `violations.srt`, `violations.vtt`), written for this fixture. They have no media and no third-party text. Each has five (clean) or six (violations) cues. Cue numbers are block order, 1-based, which equals the SRT index in these files.
- Dependencies, installation and side effects: `caption-checker` is the only dependency added to `examples/caption-checker-limits/package.json`, pinned to the full SHA. The package has no runtime dependencies and no install scripts. `pnpm install` at the workspace root updates `pnpm-lock.yaml`; that file is not committed. The run writes only `output/` (ignored) and reads `input/` and `expected/`.
- Selected output paths: `output/` only. Clean up with `rm -rf examples/caption-checker-limits/output`.

## Plan, before running

- Commands: `pnpm install` at the workspace root, then `examples/caption-checker-limits/run.sh`. There is no `--record` mode: `expected/checks.json` is written by hand from the predeclared list below, so recording actual output would make the check circular.
- `run.sh` runs `pnpm exec caption-check input/<file> --standard netflix --json` twice per file and records the exit code of each run. It fails if the two JSON reports are not byte-identical (`cmp`). It then reduces each report to a summary (caption count, exit code, flagged cues with their issue kinds, advisory count) and compares the combined summary with `expected/checks.json`, both after `jq -S`.
- Predeclared checks:
  1. `clean.srt` and `clean.vtt`: 5 captions, exit code 0, zero flagged cues, zero advisory issues, no issue entries.
  2. `violations.srt` and `violations.vtt`: 6 captions, exit code 1, exactly 4 flagged cues, zero advisory issues, and exactly these issue kinds on these cues: cue 2 `cpl` (one line over the per-line limit), cue 3 `lines` (three lines, over the two-line limit), cue 4 `short` (about 0.4 s, under the minimum duration), cue 5 `overlap` (ends 0.5 s after cue 6 starts). Cues 1 and 6 have no issues.
  3. The SRT and WebVTT versions of each fixture give the same summary.
  4. Two runs of each file produce byte-identical JSON.
  5. Each clean cue is built to stay clear of the other limits (reading speed, gap of 0.6 s between cues so that no gap issue or gap advisory is raised, duration at least 2 s). Each violation file has no other issues by the same construction.
- Expected failure modes and stop conditions: a changed pinned commit, a missing `caption-check` bin, or a JSON shape change stops the run with an error. A difference from `expected/checks.json` is a fail; the expectation is not edited to match the output. A mismatch between the SRT and WebVTT summaries is a partial at best.
- Reproduction: `pnpm install && examples/caption-checker-limits/run.sh`. Inspect with `pnpm exec caption-check input/violations.srt` (text) or add `--json`.
- Contact sheet: not applicable. The tool's output is text, and the fixture produces no frames, so there is no image to inspect.
- Pillar note on exploration: before writing this plan I read the checker's rule code and the README at the pinned commit, and I wrote the fixtures and ran the checker once in exploration (JSON shape and exit codes only). The predeclared expectations above were written from the rule code and the fixture construction, and the expected file was written before the first run of `run.sh`.

## Observation, after running

- Date and executor: 2026-11-24, Conors-MacBook-Pro-2.local, macOS arm64 (Darwin 25.6.0). Versions: caption-checker 1.3.3 (commit `4a504ede1606fbefd7e7b658281b9b8f7a4ef9e2`, `package.json` version read from `node_modules`), Node v22.19.0, pnpm 10.29.2. Playwright and Chromium are not used.
- Install: `pnpm install` at the workspace root resolved the git dependency and linked the `caption-check` bin into this example; the package has no runtime dependencies and no build step. Nothing was installed globally.
- Commands: `examples/caption-checker-limits/run.sh` twice, with no `--record` (see Plan). Both runs printed `caption-checker-limits: OK (caption-checker 1.3.3, node v22.19.0, 4 files x 2 runs identical, 4 summaries)` and exited 0.
- Observed output, per file (two runs each, byte-identical `cmp` each time):
  - `clean.srt`, `clean.vtt`: 5 captions, exit 0, 0 flagged, 0 advisory, no issue entries.
  - `violations.srt`, `violations.vtt`: 6 captions, exit 1, 4 flagged, 0 advisory. Cue 2 `cpl`: "Line 1 is 61 characters (limit 42)". Cue 3 `lines`: "3 lines (limit 2)". Cue 4 `short`: "On screen 0.40 s (minimum 5/6 of a second)". Cue 5 `overlap`: "Overlaps the next caption by 0.50 s". Cues 1 and 6 had no issues.
- Hash: `output/checks.json` (the combined summary) sha256 `b4242afc31b16f6fd546e90c7e02565995224434b61ee8b38410a654b581e86f`; it equals `expected/checks.json` after `jq -S`.
- Deviations from the plan: none to the predeclared checks, and the expected file was not edited. The only deviation is the one already stated in Plan: the exploratory single run before the plan was written, used to check the JSON shape and exit codes. It did not change any expectation.
- Inspection: no frames, so no contact sheet. The output is JSON and text; the messages above were read directly from `output/*.run-1.json`.
- Limitations and nondeterminism: none seen. The JSON `file` field is the relative path given on the command line, and the summary leaves it out.
- What this establishes: on this machine, with caption-checker 1.3.3 at the pinned commit, the netflix profile passes two hand-written clean captions files and reports exactly four predeclared issues, on the predeclared cues and of the predeclared kinds, for the same four violations in SRT and WebVTT, and its JSON is stable across reruns.
- What it does not establish: the BBC and DCMP profiles; the gap rule and the reading-speed rule (no fixture violates them); the advisory messages; `--fix`, `--to`, retime and MCP; the correctness of the profile's thresholds for any real delivery; other operating systems; the npm-registry route, which does not exist for this package.
- Reviewer and follow-up: none recorded. Revisit if the pinned commit changes, if the package is published to npm (then pin the registry version instead), or if the checker's JSON shape or exit codes change.

