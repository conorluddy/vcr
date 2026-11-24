# HarfBuzz shaping and SVG fixture

## Intent and scope

- Tool ID and version/build: HarfBuzz utilities `hb-shape` and `hb-view`, both `15.1.0` (Homebrew, `/opt/homebrew/bin`).
- VCR job and exact claim being tested: `hb-shape` produces glyph IDs, clusters and advances for the fixed string `a -> b != c` and the bundled JetBrains Mono Bold font that match predeclared expected JSON, including the ligature glyphs for `->` and `!=`; `hb-view` renders the same string to SVG byte-identically across two runs.
- Explicit exclusions: other fonts, scripts, shaping features or variation axes; kerning (this monospaced face shapes every cell at 600 units, so kerning is not exercised); `hb-subset`; PNG/PDF/other `hb-view` formats; SVG visual quality beyond the inspection noted below; cross-version or cross-platform output stability; any tool-to-tool edge (for example, rendering the SVG in a browser or Graphviz); HarfBuzz's own correctness against the font's OpenType rules beyond the recorded output.
- Tool documentation and licence sources, checked 2026-11-24: [HarfBuzz repository](https://github.com/harfbuzz/harfbuzz) and the `COPYING` file shipped with the installed 15.1.0 source (`/opt/homebrew/Cellar/harfbuzz/15.1.0/COPYING`), which states the "Old MIT" licence with per-directory exceptions. The record's licence field is `Old MIT (MIT-like; verify exact notice)`; the notice is now verified against that file. Font: JetBrains Mono Bold, SIL Open Font License 1.1 (`fonts/OFL.txt`, copyright JetBrains Mono Project Authors, 2020). No model or downloaded asset is used.
- Environment: macOS arm64 (Darwin 25.6.0, Conors-MacBook-Pro-2.local); HarfBuzz 15.1.0; visual-inspection helper `rsvg-convert` 2.63.4 (librsvg, cairo 1.18.6, pango 1.58.2, harfbuzz 15.1.0). The helper is not part of the claim.
- Input: fixed text `a -> b != c` (11 Unicode characters, ASCII) and the font `fonts/JetBrainsMono-Bold.ttf`, copied byte-for-byte from `examples/canvas2d-capture/fonts/`. SHA-256 of the font: `a2349098b9e45419e7bf0e2958d6c4937a049dded37387b08be725be4c7615f3`. Default features, no variations, no explicit language or script.
- Dependencies, installation plan, permissions, network and expected side effects: HarfBuzz is already installed through Homebrew and no installation is needed. No network access, no system-wide change. Output is written only under the ignored `output/` directory.
- Selected workspace, generated output and cleanup paths: this example directory. Generated JSON, SVG and PNG go under `output/`, which is ignored; `expected/` holds only small JSON and text expectations.

## Plan, before running

- Exact commands, with parameters:
  - `hb-shape --version` and `hb-view --version` recorded to `output/versions.txt`; expected first line of each is `... 15.1.0`.
  - `hb-shape --output-format=json --no-glyph-names FONT TEXT` to `output/shape-ids.json` (glyph IDs as numbers), run twice; the runs must be byte-identical.
  - `hb-shape --output-format=json FONT TEXT` to `output/shape-names.json` (glyph names), run once more for names.
  - `hb-view --output-format=svg --font-size=96 FONT TEXT -o output/view.svg`, run twice to `output/view-repeat.svg`.
  - Visual inspection only: `rsvg-convert -w 960 output/view.svg -o output/view.png`, then a contact sheet flattened on grey with `magick`.
- Predeclared checks (all must hold):
  1. `shape-ids.json` equals `expected/shape-ids.json` exactly (glyph IDs, clusters, x/y advances and offsets).
  2. `shape-names.json` equals `expected/shape-names.json` exactly.
  3. Semantic assertions in `check-output.py`: exactly 11 glyph entries; clusters are `0..10` in order; the glyph IDs and the glyph names agree in cluster order and advance; the glyph at cluster 3 is named `hyphen_greater.liga` and the glyph at cluster 8 is named `exclam_equal.liga` (ligature visible); all advances are 600.
  4. The two `hb-shape` ID runs are byte-identical; the two `hb-view` SVG runs are byte-identical (SHA-256 equal).
  5. The SVG SHA-256 equals `expected/view.sha256` and the SVG parses as XML with a positive `width` and `height` and at least one `<use>` element.
  6. Versions equal `expected/versions.txt` (`hb-shape` and `hb-view` both `15.1.0`).
- Expected artifacts: `expected/shape-ids.json`, `expected/shape-names.json`, `expected/view.sha256`, `expected/versions.txt`. Nothing media-like is retained.
- Intended consumer and handoff settings: a shaping ground-truth check for text in later VCR scenes, and a standalone SVG still of shaped text. No handoff to another tool is claimed.
- Delivery constraints and units: advances in font units as emitted by HarfBuzz (`ax`, `ay`), SVG in user units; no byte budget.
- Expected failure modes and stop conditions: HarfBuzz version other than 15.1.0; a glyph count other than 11; a missing `.liga` glyph at clusters 3 or 8 (ligature not formed, which would mean the feature path changed); any byte mismatch between repeated runs; malformed SVG; zero-size SVG; visual clipping or blank rendering on inspection. Any of these stops the fixture and the result is not pass.
- Reproduction instructions: `./run.sh --record` after inspection writes `expected/`; `./run.sh` repeats every check and must print `harfbuzz-shape-text: OK`. Inspect the rendering at `output/contact.png`.

## Observation, after running

Pass on 2026-11-24, executed by Claude (agent worktree), host `Conors-MacBook-Pro-2.local`, macOS arm64.

- Disclosure: before the plan above was written, I ran exploratory `hb-shape` and `hb-view` commands on the font to find a ligature pair and to confirm that SVG output repeats. Those probes were not recorded as results, and the checks above were fixed from the probe's shape of output, not tuned to pass a result.
- Versions: HarfBuzz `hb-shape` 15.1.0 and `hb-view` 15.1.0 (Homebrew); `rsvg-convert` 2.63.4 (inspection only); ImageMagick 7.1.2-35 (inspection only); Python 3 (stdlib only, `check-output.py`); no Playwright, Node or Chromium is used.
- Commands: `./run.sh --record`, then `./run.sh`, which printed `semantic checks passed` and `harfbuzz-shape-text: OK` with exit 0.
- Observed `hb-shape` output: 11 glyph entries for `a -> b != c`, clusters `0..10` in order, all advances 600 font units. Clusters 3 and 8 are `hyphen_greater.liga` and `exclam_equal.liga`; clusters 2 and 7 are `SPC` glyphs emitted alongside each ligature, which is how the output keeps the monospaced cells aligned. Glyph IDs for the same run: `180 680 1167 621 680 205 680 1167 646 680 206`. The two ID runs and the two SVG runs were byte-identical.
- Observed SVG: `hb-view` 15.1.0 wrote a 6,286-byte SVG, 666 x 158.71875 user units, with 11 `<use>` elements; SHA-256 `ff74b1812e4c08b2db15fa0ef3b47d14107558acdb69b014c3e363931148470f`, identical on the repeat run and in `expected/view.sha256`.
- Inspection of `output/contact.png` (the SVG rasterised by `rsvg-convert` at 960 px and flattened on grey): it shows `a`, a single arrow glyph in place of `->`, `b`, a single not-equal sign in place of `!=`, and `c`, evenly spaced on one baseline. No glyph is clipped, blank or doubled. The ligature glyphs are visibly the ligatures, not two separate characters. The SVG itself has no background, so the grey flatten is only for viewing.
- Licence check: `Old MIT` confirmed against `COPYING` in the installed HarfBuzz 15.1.0 source tree (`/opt/homebrew/Cellar/harfbuzz/15.1.0/COPYING`).
- Deviations and limitations: none in the run. Kerning was not exercised (monospaced font, every advance 600). The SVG hash is valid only for this HarfBuzz build, this font file (SHA-256 above) and this host; the rendering by `rsvg-convert` is a human check, not a claim about HarfBuzz's SVG correctness.
- What this result does and does not establish: for one fixed string and one OFL font, HarfBuzz 15.1.0 on this Mac produces the predeclared glyph IDs, clusters, names and advances, forms the two ligatures, and writes the same SVG bytes on repeat. It does not establish other scripts, features, variations, fonts, `hb-subset`, other formats, other HarfBuzz versions or platforms, or any downstream renderer.
- Reviewer, decision, follow-up and invalidation triggers: revisit if HarfBuzz is upgraded (the version check will fail first), if the font file changes (checked by the recorded font SHA-256 above, not by `run.sh`), or if the SVG hash changes on a new build.
