# freeze code-still fixture

## Intent and scope

- Tool ID and version/build: `freeze` 0.2.2 (`freeze version v0.2.2 (80921ba)`), Homebrew formula from the `charmbracelet/tap` tap (`brew install charmbracelet/tap/freeze`), `/opt/homebrew/bin/freeze`, arm64. Plain `brew install freeze` resolves to an unrelated Amazon Glacier cask and is not this tool.
- VCR job and exact claim being tested: "freeze renders a fixed source file with a predeclared theme, window chrome off/on, padding and line numbers to SVG and PNG; the SVG contains the predeclared code tokens as text and the theme's background colour, the PNG has predeclared dimensions for a fixed width/scale, and reruns are byte-identical."
- Explicit exclusions: other themes, languages, fonts (beyond the default embedded font recorded below), `--execute` terminal capture, WebP output, custom borders, shadows, margins, `--width`/`--height` overrides, `--lines` ranges, `--wrap`, ligatures, and any other freeze flag. Not tested: whether the PNG is visually faithful beyond the observed inspection, colour management or how a downstream compositor treats the SVG, and cross-version or cross-machine byte identity. No frame sequence, so no shuffled-order or alpha-range check. The PNG background is opaque, so alpha is not claimed.
- Tool documentation and licence sources, checked 2026-11-24: [freeze repository](https://github.com/charmbracelet/freeze) and its releases page. The licence (MIT) is taken from the catalogue card `catalog/tools/freeze.json`; the upstream LICENSE file was not re-read in this run. Theme (Dracula) and default font (JetBrains Mono, embedded as woff2 in the SVG) come from freeze's bundled assets; no network is used.
- Environment: macOS 26 arm64 (Darwin 25.6.0), Conors-MacBook-Pro-2.local; freeze 0.2.2; Python 3 (system) for the checker. No GPU involved.
- Input: fixture-authored `source.go` (seven lines, a `fmt.Println` hello program). No external assets. Its SHA-256 is recorded in `expected/metrics.json`.
- Dependencies, installation plan, permissions, network and expected side effects: `freeze` was already installed before this run (no install performed). Output goes to the ignored `output/` directory only. No network.
- Selected workspace, generated output and cleanup paths: this example directory; `output/` (git-ignored). Delete `output/` to clean up.

## Plan, before running

- Exact commands (all in `run.sh`): `freeze --version > output/version.txt`; then, for each of `plain`, `window` (`--window`), `plain-repeat` and `window-repeat` (`--window`), `freeze source.go -l go -t dracula -p 20 --show-line-numbers [--window] -o output/<name>.svg` and the same with `.png`; each call with stdin from `/dev/null`. Then `cmp` plain vs plain-repeat and window vs window-repeat, for SVG and PNG; then `python3 check-output.py output output/metrics.json`. `./run.sh --record` copies metrics to `expected/metrics.json`; `./run.sh` repeats everything and diffs against it.
- Predeclared checks (all must hold):
  1. `freeze --version` reports `v0.2.2`.
  2. Each SVG parses as XML with root `svg`, and its `width`/`height` are exactly 357 and 184 for both the plain and window variants. These dimensions were observed in a scratch probe with the same source and flags, before this fixture existed; they are predeclared here and the probe is disclosed under Observation.
  3. Each PNG has a valid PNG signature and dimensions of exactly 1428x736 (4 times the SVG size), for both variants. Also from the scratch probe, disclosed.
  4. Theme background: the first `rect` in each SVG has `fill="#282a36"`, the Dracula background.
  5. Predeclared tokens `package`, `import`, `func`, `main`, `fmt`, `Println`, `hello`, `freeze` each appear in the concatenated text of the SVG's `text` elements.
  6. Line numbers: the `tspan` elements with fill `#7f7f7f` have trimmed text `1` through `7` in order, in both variants.
  7. Window chrome: the window SVG contains the three control fills `#FF5A54`, `#E6BF29`, `#52C12B`; the plain SVG contains none of them; the two SVGs differ.
  8. Embedded font: the SVG `@font-face` family is `JetBrains Mono`; its base64 woff2 payload byte length and SHA-256 are recorded.
  9. Determinism: `cmp` passes for the SVG and PNG repeat pairs, and metrics (including all SHA-256 values) equal `expected/metrics.json` on the fresh process run.
- Intended consumer and handoff settings: a still for a deck or motion layer. No downstream composition is run. A contact sheet of the two PNGs is made after the run and viewed by hand for clipping, legibility and whether the window chrome appears.
- Delivery constraints and units: SVG and PNG only, pixels and SVG user units as above; no media is retained in `expected/`, only `metrics.json`.
- Expected failure modes and stop conditions: freeze version other than 0.2.2; any freeze call exits non-zero or hangs; SVG not well-formed; any dimension, token, line-number, background or window-chrome check fails; repeated outputs differ; the contact sheet shows clipping, missing code or missing chrome. Any of these is reported as `fail` or `partial`, and the predeclared checks are not relaxed to make them pass.
- Reproduction instructions: `examples/freeze-code-still/run.sh --record` for the baseline, then `examples/freeze-code-still/run.sh`, which must print `freeze-code-still: OK`. Inspect with `magick output/plain.png output/window.png +append output/contact.png` and open it.

## Observation, after running

Pass, 2026-11-24, executed on Conors-MacBook-Pro-2.local (macOS 26 arm64, Darwin 25.6.0).

- Versions: freeze 0.2.2 (`freeze version v0.2.2 (80921ba)`); Python 3.12.2 (checker only). No Playwright, Chromium, ImageMagick (the contact sheet only), or Node is used by the claim.
- Commands: `./run.sh --record` (baseline), then `./run.sh` (verification), which printed `freeze-code-still: OK`. Both used `</dev/null`. One earlier probe in the scratch directory, not part of the fixture, hung once when stdin was inherited; the run script closes stdin for every call.
- Observed: plain SVG 368,083 bytes, 357x184; PNG 45,952 bytes, 1428x736. Window SVG 368,282 bytes, 357x184; PNG 48,637 bytes, 1428x736. Repeat SVG and PNG pairs are byte-identical (`cmp`) within each invocation; the fresh process reproduced every SHA-256 in `expected/metrics.json`.
- Font: the SVG embeds `JetBrains Mono` as a woff2 `@font-face` (274,744 bytes, SHA-256 `0ca830b4…d433`). The font is freeze's default, not a system font.
- Theme: Dracula background `#282a36` on the first full-size rect; the eight tokens appear in the text; line numbers 1 to 7 in grey `#7f7f7f`.
- Inspection: `output/contact.png` (2856x736, plain left, window right). The code is legible and unclipped in both. The window variant shows the three red, yellow and green control dots at the top centre; the plain variant has none. The code block sits inside the padding on both. Nothing is blank, clipped or missing.
- Predeclaration disclosure: the SVG and PNG dimensions, the 4x PNG scale and the window-control colours were read from a scratch probe with the same source and flags, before this fixture was written. They were then predeclared in the checker and README and not changed afterwards. The probe is not evidence and is not kept.
- Deviations: none in the checks. The `brew install freeze` in the catalogue record was wrong (Amazon Glacier cask) and is corrected to `brew install charmbracelet/tap/freeze`. Only one host, one freeze version and one source file were tested.
- What this establishes: on macOS arm64 with freeze 0.2.2, the Dracula theme, padding 20, line numbers and window chrome on or off render to SVG and PNG with the predeclared dimensions, tokens and background; the same invocation repeated gives identical bytes on this host.
- What it does not establish: other themes, languages or fonts; freeze flags beyond those listed; other freeze or platform versions; byte identity across time or machines; whether a downstream tool renders the SVG identically; PNG alpha (the background is opaque).
- Reviewer, decision and triggers: rerun on a freeze upgrade, a change to `source.go` or to the flags in `run.sh`, or a hash mismatch on this host.
