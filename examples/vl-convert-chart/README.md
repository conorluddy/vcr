# vl-convert Vega-Lite bar chart fixture

## Intent and scope

VCR job and claim: vl-convert renders a hand-written Vega-Lite bar chart, with
inline data, a fixed width and height, an explicit y scale domain starting at zero,
and a title, to SVG and to PNG offline. The SVG contains the five bar marks and the
title text. The PNG dimensions equal width x height x scale. Bar heights in the SVG
are proportional to the data within a predeclared tolerance. Reruns are byte-identical.

Tool: vl-convert, the Rust converter that embeds Vega and runs it in V8, used through
its Python package `vl-convert-python`. The package embeds the Vega-Lite compiler; the
fixture requests Vega-Lite `5.21` explicitly.

Explicit exclusions:
- No browser, Node.js or network is used by the fixture. The spec has no `url` and
  no file reference. The run is not network-isolated, so "offline" is established by the
  spec's content and the library's documented behaviour, not by a sandbox test.
- Only SVG and PNG are tested. PDF, JPEG, HTML and scenegraph output are not.
- Only the PNG at scale 2 is measured. Other scales are not.
- The CLI (`vl-convert` binary) and the vl-convert server are not tested. Only the
  Python API is used.
- Vega-Lite features beyond one bar layer (themes, multiple views, selections, locales,
  time scales, other marks) are not tested.
- No claim about label legibility, colour choice or the visual quality of the chart.
- Text is rendered with whatever font the library resolves for `sans-serif` on this
  machine. Which face that is, and whether text is pixel-stable across machines, is not
  established. See the observation for what was seen.
- No claim about Vega-Lite or Vega spec validity beyond what this compile accepts.

Data-visualisation rules: the chart is checked against two rules from
`references/data-visualisation/data-visualisation-knowledge-base.md`, DATA-ZERO-BASELINE
(bars share a baseline at zero) and DATA-LABEL-MATCH (each bar's label matches its value).
The thresholds below are the fixture's, not the pillar's.

Licence and documentation sources, checked 2026-11-24:
- https://github.com/vega/vl-convert (README and releases). Licence BSD-3-Clause, per the tool card.
- vl-convert-python on PyPI, pinned below. Its metadata licence is not re-checked here.
- Vega and Vega-Lite are embedded by the library and keep their own licences (BSD-3-Clause).

Environment: macOS 26 (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv, CPU only.

Input: none. The data are five hand-written rows in `generate.py`:
Email 28, Search 55, Social 43, Referral 91, Direct 70. No external asset is used.

Dependencies and installation plan (approved):
- Create `examples/vl-convert-chart/output/venv` (git-ignored) with the pyenv Python 3.12.2.
- `output/venv/bin/pip install -r requirements.txt`, which pins
  `vl-convert-python==1.9.0.post1`, the newest non-prerelease on PyPI (the card's stable
  1.9.0, plus its post-release). The card's 2.0.0-rc7 is a prerelease and is not used.
- `run.sh` writes the resolved set to `output/dependencies.txt`.
- Nothing system-wide; no global package or shell change. PyPI access is needed for installation only.
- Cleanup: remove `examples/vl-convert-chart/output` (venv, SVG, PNG and logs).

Selected workspace and output: `examples/vl-convert-chart/output/` (git-ignored).
Committed: this README, `example.json`, `requirements.txt`, `run.sh`, `generate.py`,
`check.py` and `expected/checks.json`. No SVG or PNG is committed.

## Plan, before running

Commands (after the install above):
```
examples/vl-convert-chart/run.sh            # generates twice, checks, diffs expected/
examples/vl-convert-chart/run.sh --record   # only after a deliberate change
```

`generate.py output chart` builds this spec, then calls `vegalite_to_svg` and
`vegalite_to_png(scale=2)` with `vl_version="5.21"`:
- `title`: "Quarterly signups by channel"
- `width` 320, `height` 200; `autosize` `{"type": "fit", "contains": "padding"}`, so the
  axes and title sit inside the 320x200 frame rather than adding to it.
- `data.values`: the five rows above, inline.
- `mark`: `bar`; x nominal on `channel` with labels horizontal; y quantitative on
  `signups` with `scale: {domain: [0, 100], zero: true}`.

It is run twice (`chart`, `chart-rerun`). `check.py output chart` then reads both pairs.

Predeclared checks (all gating; the thresholds are fixed here, before the run):
1. `spec_inline_data_only`: the data has `values` and no `url`.
2. `spec_scale_domain_starts_at_zero`: the y domain's first value is 0 and `zero` is true.
3. `svg_size_matches_spec`: the root SVG has width 320 and height 200.
4. `svg_bar_mark_count_is_five`: exactly five SVG `path` elements carry `aria-roledescription="bar"`.
5. `svg_bar_labels_match_data`: the (channel, value) pairs in the bars' `aria-label`s, as a sorted
   multiset, equal the five rows in the spec.
6. `svg_title_text_present`: a `text` element's content equals the title.
7. `svg_bar_heights_proportional`: for each bar, height / value, the maximum relative deviation
   from the mean ratio is at most 1% (0.01).
8. `svg_bar_bottoms_aligned`: top y + height is the same for all bars, within 0.5 px.
9. `png_signature`: the PNG begins with the 8-byte PNG signature.
10. `png_dimensions_match_scale`: IHDR width and height equal 320 x 2 and 200 x 2.
11. `svg_rerun_byte_identical` and `png_rerun_byte_identical`: the rerun files are identical
    bytes to the primary files.

Informational (recorded, not gating): bar heights in px, the bar values, the measured
baseline spread and proportion deviation, and the SHA-256 of the SVG and PNG. Hashes can
change if the library or the resolved font changes; the diff against `expected/` will then
fail and must be explained, not re-recorded silently.

Expected artifacts: `output/chart.vl.json`, `chart.svg` (320x200), `chart.png` (640x400),
the `-rerun` twins, `output/checks.json`, `output/dependencies.txt`, and
`output/generate*.log`.

Intended consumer and handoff settings: none. This is a standalone chart export; no
video handoff or native-asset workflow is involved.

Delivery constraints: none. No byte budget applies.

Expected failure modes and stop conditions:
- The library's bar path format changes (the regex fails): stop, do not loosen the regex.
- The title or the bar labels differ from the data: stop, do not edit the expected values.
- A rerun differs in bytes: the claim fails; no retry-until-equal.
- PNG dimensions differ from 640x400: the `autosize` behaviour has changed; stop.
- Installation fails for any reason other than PyPI being unreachable: report blocked.

Reproduction and inspection: run the two commands above. To inspect, open
`output/chart.png` and `output/chart.svg` in a browser, or view the PNG with an image
viewer at 640x400.

## Observation, after running

Date and executor: 2026-11-24, Claude agent (evidence backfill) on `Conors-MacBook-Pro-2.local`.

Versions: vl-convert-python 1.9.0.post1 (pinned in `requirements.txt`), Vega-Lite 5.21
requested via `vl_version`, Python 3.12.2 in `output/venv`. The `pip freeze` output is in
`output/dependencies.txt`. Node.js and Playwright are not used, and no browser is involved,
so there is no Chromium version to report.

Commands run, in order: `run.sh --record`, which failed at `cp` because `expected/` did not
exist (no check had failed; I created the directory and repeated the record), then `run.sh`,
which printed `vl-convert-chart: OK`.

Measured results (`output/checks.json`, all twelve checks true):
- Five bar marks; labels match the data: Email 28, Search 55, Social 43, Referral 91, Direct 70.
- Bar heights 38.08, 74.8, 58.48, 123.76 and 95.2 px. Height per unit value is 1.36 for every
  bar (relative deviation 0). Bottoms align at 136.0 px (spread 0 px), so the baseline is zero.
- SVG root is 320 x 200. The title is a `text` element with the exact string.
- PNG is 640 x 400 (320 x 200 at scale 2) with a valid signature.
- Rerun SVG and PNG are byte-identical to the primary files, on the record run and on the check run.
- SVG SHA-256 `96f85d61...83de`; PNG SHA-256 `7dd276fe...3364`. The diff against `expected/`
  passed on the second run, so both hashes reproduced across runs.

Inspection of the PNG at its scale (`output/contact.png`, 640 x 400, made with ImageMagick
on a grey background): the title is centred at the top, the y axis runs 0 to 100 with
gridlines, the five blue bars sit on a shared zero baseline with Referral tallest and Email
shortest, and the x labels are readable. Nothing is clipped or blank. The x order is
alphabetical (Direct, Email, Referral, Search, Social), Vega-Lite's default sort for nominal
fields, not data order. The fixture makes no order claim, so this is recorded, not corrected.

Text font: the SVG declares `font-family="sans-serif"` on all 14 text elements. The PNG text
looks like a Helvetica-style sans face. The library does not report which family it resolved,
so the exact face is not established. Text pixels are only as stable as that machine's font
resolution.

Result: PASS on all predeclared checks, on this machine.

What this does and does not establish:
- It establishes that the Python API renders this one hand-written spec to SVG and PNG here,
  with bars, title and dimensions as predeclared, and that reruns are byte-identical here.
- It does not establish: PDF, JPEG, HTML or scenegraph export; the CLI or server; other
  Vega-Lite marks, themes or scales; cross-machine or cross-font byte identity; offline
  behaviour under network isolation; colour or label quality.
- DATA-ZERO-BASELINE is met (bars share a zero baseline). DATA-LABEL-MATCH is met (each bar's
  label matches its value). The fixture checks both with its own thresholds; no pillar
  threshold was taken from the rule.

Reviewer, decision and revisit triggers: revisit when vl-convert moves to 2.x (its API and
output may change), when the Vega-Lite version requested changes, or on a machine whose
`sans-serif` face differs (the PNG and its hash would change while the SVG checks still pass).
Cleanup: remove `examples/vl-convert-chart/output` (venv, SVG, PNG and logs).
