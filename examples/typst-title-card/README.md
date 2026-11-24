# Typst title card fixture

## Intent and scope

- Tool ID and version/build: `typst` 0.15.1 (Homebrew, `/opt/homebrew/bin/typst`, arm64). Installed beforehand; nothing installed by this fixture.
- VCR job and exact claim being tested: "typst compiles a small .typ title card (fixed page size in px-equivalent, one embedded OFL font passed with --font-path and --ignore-system-fonts, a heading and a data-driven value read from a JSON file via `json()`) to SVG and PNG (--ppi fixed); PNG dimensions match the predeclared page size × ppi, the SVG contains the JSON value as text, `typst query` returns the heading, and reruns are byte-identical."
- Explicit exclusions: PDF and HTML output; `--ignore-embedded-fonts` (typst's built-in fonts stay available, so the claim's flags are used exactly as stated); multi-page documents; Typst packages (none imported); the Typst `eval` replacement for the deprecated `query`; cross-version or cross-platform determinism; typographic quality beyond a visual check; the typst WASM/web build.
- Tool documentation and licence sources, checked 2026-11-24: [typst repository](https://github.com/typst/typst) and its README. Licence Apache-2.0 for the compiler, taken from the catalogue card `catalog/tools/typst.json`; the card's note that packages and fonts may carry separate licences applies. The font is JetBrains Mono Bold, SIL OFL 1.1, copied with its `OFL.txt` from `examples/canvas2d-capture/fonts/`.
- Environment: macOS 26.6 arm64 (Darwin 25.6.0), typst 0.15.1, Python 3.12.2 (checker only), ImageMagick 7.1.2 (contact sheet only, not in `run.sh`).
- Input: `title.typ` and `data.json`, both fixture-authored. The font is a repository asset. No network is used.
- Dependencies, installation plan, permissions, network and expected side effects: none installed. Writes only to `output/` (git-ignored) and `expected/metrics.json`.
- Selected workspace, generated output and cleanup paths: this example directory. `output/` holds SVG, PNG, query JSON, and a variant with different data; delete it to clean up.

## Plan, before running

- Exact commands (all from `run.sh`, with `--font-path "$PWD/fonts" --ignore-system-fonts` on every call):
  1. `typst --version` to `output/version.txt`; `typst fonts ...` to `output/fonts.txt`.
  2. `typst compile title.typ output/title.svg`, and a repeat to `output/title-repeat.svg`.
  3. `typst compile --ppi 144 title.typ output/title.png`, and a repeat to `output/title-repeat.png`.
  4. `typst query title.typ heading` to `output/query-heading.json`.
  5. A variant copy of `title.typ` in `output/variant/` with a different `data.json` (`KS-0001`), compiled to `output/variant/title.svg`.
  6. `python3 check-output.py output output/metrics.json`. `./run.sh --record` copies the observed metrics (including the `checks` block) to `expected/metrics.json`; `./run.sh` repeats everything, diffs against it, and exits non-zero if any check is false.
- Page size and px-equivalent: 640 × 360 pt, 48 pt margin, transparent page (`fill: none`). At `--ppi 144` (the claim's fixed value), one pt is 2 px, so the predeclared PNG size is 1280 × 720 px.
- Predeclared checks (all must hold; each is a named line in `metrics.json` `checks`):
  1. `typst_version_is_0_15_1`: `typst --version` starts with `typst 0.15.1`.
  2. `font_family_listed_with_flags`: `typst fonts --font-path ... --ignore-system-fonts` lists `JetBrains Mono`.
  3. `svg_root_is_svg`: the SVG root element is `svg`.
  4. `svg_viewbox_is_page_in_points`: the SVG `viewBox` is 640 × 360.
  5. `png_dimensions_match_page_times_ppi`: PNG is 1280 × 720.
  6. `png_is_rgba_8bit`: PNG bit depth 8, colour type 6 (RGBA). Required for the alpha check.
  7. `png_alpha_has_transparent_and_opaque`: over the whole PNG (the single still stands in for the middle frame), the alpha channel has minimum 0 and maximum 255. This checks the transparent background and opaque glyphs.
  8. `svg_contains_value_as_text`: the literal `KS-7342` from `data.json` appears in the SVG. Typst may emit glyph outlines rather than text; if so this check is false and the claim is not met. It is predeclared as written and will not be relaxed.
  9. `query_returns_one_heading`: `typst query ... heading` returns a JSON array of exactly one element, `func` = `heading`, whose body contains `Kestrel Survey Summary`.
  10. `svg_rerun_byte_identical` and 11. `png_rerun_byte_identical`: the two compiles of each format are byte-identical (`filecmp`, not hash-only).
  12. `json_variant_changes_svg`: changing only `data.json` changes the SVG hash, showing the value is read from the file.
  Plus: the SVG, PNG, query and variant SHA-256 values must equal those in `expected/metrics.json` on the verification run (`diff`).
- "At least two distinct hashes" is applied as check 12: the original and variant SVGs differ. Shuffled-order and frame-count checks do not apply: this is a single still with no seeking, so there is no frame sequence.
- Intended consumer and handoff settings: SVG for vector use; PNG at 144 ppi for a raster still. Both are inspected by eye: a contact sheet of the PNG, and an SVG rasterised to PNG with `rsvg-convert` if available, to check clipping and font use.
- Delivery constraints and units: none beyond the page size above. `expected/` keeps only `metrics.json`; no SVG or PNG is committed.
- Expected failure modes and stop conditions: typst version differs; `typst fonts` does not list JetBrains Mono (font not found); compile exits non-zero; PNG dimensions or alpha off; SVG viewBox off; two compiles of the same format differ; the variant SVG is identical to the original; a font fallback is visible in the inspection image. Any of these is reported as `fail` or `partial`; no check is relaxed to pass.
- Reproduction instructions: `examples/typst-title-card/run.sh --record`, then `examples/typst-title-card/run.sh`, which must print `typst-title-card: OK`. Inspect with `open output/title.png` and `output/title.svg`.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS 26.6 arm64). Result: **partial**. 11 of 12 predeclared checks pass; check 8 (`svg_contains_value_as_text`) fails.

- Versions: typst 0.15.1 (`typst --version` reports "unknown commit"); Python 3.12.2 (checker); ImageMagick 7.1.2 (contact image only, not in `run.sh`); Node v22.19.0 and pnpm 10.29.2 (repo tooling). Playwright and Chromium are not used.
- Commands: `./run.sh --record` (baseline, exit 1 because check 8 is false), then `./run.sh` in a fresh process, which printed the same 12 verdicts and an empty diff against `expected/metrics.json`, so every recorded hash reproduced. The verify run exits 1 and does not print `OK`.
- Observed:
  - SVG: viewBox `0 0 640 360`, `width="640pt" height="360pt"`, 19,796 bytes, SHA-256 `a858300549…4128c`.
  - PNG at `--ppi 144`: 1280 × 720, RGBA 8-bit, 30,376 bytes, SHA-256 `781aabe894…7f4677`. Alpha minimum 0, maximum 255.
  - `typst query … heading`: one element, `func` heading, body "Kestrel Survey Summary".
  - Two compiles of each format are byte-identical.
  - Variant `data.json` (`KS-0001`) gives a different SVG, SHA-256 `829c127…e7b91`.
- Inspection: `output/contact.png` is `title.png` composited on mid-grey at 50%. It shows the heading, the large value `KS-7342` and the label "signal baseline, dB" in JetBrains Mono Bold, in dark slate on a transparent background, with no clipping and no visible fallback face. The page is not blank.
- Check 8 failure, disclosed: typst 0.15.1 emits glyphs as `<use xlink:href="#g…">` outline references, with no `<text>` element. `KS-7342` does not occur anywhere in the SVG, and I found no CLI option that keeps text as text. The claim's "SVG contains the JSON value as text" is therefore not met. The check was not relaxed.
- Deviations and limitations:
  1. My first `--record` refused to write a baseline when check 8 failed. I changed `run.sh` so `--record` always writes the observed metrics, including the false check, and exits with the checker's status. This keeps the verdict reproducible; no predeclared check changed. The plan text above is updated to match.
  2. `typst query` is deprecated in 0.15.1 (hint: `typst eval 'query(heading)'`). The claim names `query`, so the deprecated command was used; the warning goes to stderr.
  3. `--font-path` with `--ignore-system-fonts` still lists typst's built-in faces (`DejaVu Sans Mono`, `Libertinus Serif`, `New Computer Modern`, `New Computer Modern Math`), because `--ignore-embedded-fonts` was not in the claim. The fixture's text uses only JetBrains Mono, which the contact image confirms, but "one embedded font" is true only for the text in this document.
  4. A mistyped inspection path briefly wrote a PNG to the shared checkout; I removed it. Nothing else outside the worktree was touched.
  5. Single host, single typst build; the SVG hash is not expected to be stable across typst versions.
- What this establishes: on this host, typst 0.15.1 compiles this title card to a 640 × 360 pt SVG and to a 1280 × 720 px RGBA PNG at 144 ppi, with the JSON-driven heading and value rendered in the bundled OFL font; `typst query` returns the heading; reruns are byte-identical; and changing the JSON changes the SVG.
- What it does not establish: that the SVG carries the JSON value as text (it does not; glyph outlines only); PDF or HTML output; the typst built-in fonts being excluded; cross-version or cross-platform determinism; typographic quality beyond this one still.
- Reviewer, decision, follow-up and invalidation triggers: a typst upgrade, a change to `title.typ` or `data.json`, or a hash mismatch on this host should prompt a rerun and a dated note. Follow-up if the text claim matters: check whether a future typst exposes text output in SVG, or add a separate text-extraction route (not tested here).
