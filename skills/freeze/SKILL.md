---
name: freeze
description: Render a source file to a styled code still (SVG or PNG) with Charm freeze, with theme, padding, line numbers and optional window chrome. Use when a scripted, repeatable code screenshot is needed as a still or SVG layer.
---

# freeze

`vcr` below means `pnpm vcr` inside this repository, or `node <plugin-root>/cli/vcr.mjs` from an installed plugin; run commands from the workspace.

Evidence: freeze 0.2.2 (`v0.2.2 (80921ba)`) on macOS 26 arm64. The fixture renders one fixed seven-line Go file with the Dracula theme, padding 20 and line numbers, window chrome off and on, to SVG and PNG, and checks dimensions, tokens, background, line numbers, chrome colours, embedded font and byte-identical reruns. Other themes, languages, fonts, flags, versions and platforms are untested.

## Use cases and limits
- Use for a styled code still from a script: an SVG for a browser motion layer, or a PNG for a deck or compositor. For terminal output as motion use agg (asciinema recordings to GIF) or vhs (scripted terminal recordings); freeze makes stills only. For dynamic UI or web typography use browser capture; for exact typesetting control use a text rasteriser.
- Evidence covers `freeze source.go -l go -t dracula -p 20 --show-line-numbers [--window] -o out.{svg,png}`. The PNG background was opaque; alpha is not claimed.

## Capability map
Discovery only; the upstream [README](https://github.com/charmbracelet/freeze#readme) is the reference.
- Input: file, stdin, or `--execute` to capture command output; untested here except a file.
- Output by extension: `.svg` and `.png` tested; `.webp` documented, untested.
- Theme `-t`, language `-l`, `--font.*`, `--padding`, `--margin`, `--border.*`, `--shadow.*`, `--width/--height`, `--lines`, `--wrap`, `--config`: documented. Tested: `-t dracula`, `-l go`, `-p 20`. The rest is untested.
- `--show-line-numbers`, `--window`: tested on and off.
- Discoverability is not validation: nothing outside the list in Evidence has been run.

## Install and doctor
```sh
brew install charmbracelet/tap/freeze
vcr doctor
```
Plain `brew install freeze` is an unrelated Amazon Glacier client, not this tool. Confirm with `freeze --version`; the evidence run printed `v0.2.2`. VCR does not claim it is installed on another machine.

## Smoke test
```sh
cd examples/freeze-code-still && ./run.sh
# expect: freeze-code-still: OK
```
The run renders plain and window variants twice, `cmp`s the repeats (SVG and PNG), and diffs metrics against `expected/metrics.json`: SVG 357x184 (plain 368083 bytes, window 368282), PNG 1428x736 (4x the SVG), first rect fill `#282a36`, line numbers 1 to 7 in `#7f7f7f`.

## Recipes
```sh
freeze source.go -l go -t dracula -p 20 --show-line-numbers --window -o out.svg </dev/null
freeze source.go -l go -t dracula -p 20 --show-line-numbers --window -o out.png </dev/null
```
- Always redirect stdin from `/dev/null` in scripts. freeze hung once waiting on an inherited stdin while probing.
- `--window` adds three control dots (`#FF5A54`, `#E6BF29`, `#52C12B`); without it none are present. Size was identical (357x184) either way.
- Code is real `text`/`tspan` elements in the SVG, so tokens can be checked by parsing; line numbers are `tspan` fill `#7f7f7f`.
- Typography: the SVG embeds JetBrains Mono as a base64 woff2 `@font-face` (274744 bytes), which freeze supplies by default; no system font is involved. That matches TYPO-FONT-SHIP's rule against implicit system-font fallback, but a custom font was not tested, so record any other font in the manifest (TYPO-FONTS). Deliver the still as PNG, not JPEG (TYPO-STILL-FORMAT).
- The embedded font makes each SVG about 360 KB; plan for that if many are loaded in a scene.

## Troubleshooting
- Command hangs in a script: add `</dev/null`.
- `freeze: command not found` after `brew install freeze`: wrong formula; install `charmbracelet/tap/freeze`.
- Hash mismatch against `expected/metrics.json`: check `freeze --version` and `source.go` first; identity was seen on one host and one version only.

## Official docs
- [freeze repository and README](https://github.com/charmbracelet/freeze)
- [Releases](https://github.com/charmbracelet/freeze/releases)
