# D2 text-diagram-to-SVG fixture

## Intent and scope

- Tool ID and version/build: `d2` 0.7.1 (Homebrew, `/opt/homebrew/bin/d2`, arm64), default `dagre` layout, theme 0.
- VCR job and exact claim being tested: "d2 renders a fixed text diagram to SVG headlessly; the SVG contains the predeclared node and edge labels, and a rerun is byte-identical."
- Explicit exclusions: other layout engines (`elk`), `--sketch` mode, other themes, PNG/PDF/PPTX/GIF output, custom fonts, D2 language coverage beyond this four-node chain, diagram quality in general, cross-version or cross-platform determinism, and any D2-to-SVGO or D2-to-resvg edge. `rsvg-convert` is used only to make a temporary inspection PNG; it is not part of the claim.
- Tool documentation and licence sources, checked 2026-11-24: [D2 repository and docs](https://github.com/terrastruct/d2). The licence (MPL-2.0) is taken from the catalogue card `catalog/tools/d2.json` and was not re-read from the upstream LICENSE file in this run. No bundled models or third-party assets are used by the fixture; D2 embeds its default font in SVG output (`--bundle`, default on), which is part of the output being hashed.
- Environment: macOS 26.6 arm64 (Darwin 25.6.0); D2 0.7.1; Node v22.19.0 for the check script's host shell is not used by the claim (the check script is Python 3).
- Input: fixture-authored `source.d2` (four labelled nodes, three directed edges, `direction: right`). No external assets, no network.
- Dependencies, installation plan, permissions, network and expected side effects: `d2` is already on PATH; nothing is installed. Python 3 (system) parses the SVG. Output goes to ignored `output/`. No network is used.
- Selected workspace, generated output and cleanup paths: this example directory only; generated files in `output/` (ignored). Delete `output/` to clean up.

## Plan, before running

- Exact commands: `d2 --version > output/version.txt`; `d2 source.d2 output/diagram.svg`; `d2 source.d2 output/diagram-repeat.svg`; `cmp` the two SVGs; `python3 check-output.py source.d2 output/diagram.svg output/version.txt output/metrics.json`. `./run.sh --record` copies metrics to `expected/metrics.json`; `./run.sh` repeats everything and diffs against it.
- Predeclared checks (all must hold):
  1. `d2 --version` prints exactly `0.7.1` (matched by `^[0-9.]+$` and equal to the recorded version).
  2. The SVG parses as XML, its root is `svg`, `viewBox` is present, and `width` and `height` parse as positive numbers.
  3. Label presence: each of the four labels `Source`, `Layout`, `SVG`, `Inspect` is the full text content of at least one `text` element.
  4. Shape count: exactly 4 `g` elements carry the class token `shape`, one per declared node. Hypothesis about D2's SVG markup; confirmed or refuted by the first recording and disclosed under Observation if it changes.
  5. Edge count: exactly 3 `g` elements carry the class token `connection`, one per declared edge (`source->layout`, `layout->render`, `render->inspect`). Same hypothesis caveat as check 4.
  6. Determinism: the two runs in one invocation are byte-identical (`cmp`), and the SHA-256 of the SVG equals the SHA-256 recorded in `expected/metrics.json` from an earlier run.
  7. Byte count is recorded and diffed (`svg_bytes`).
- Intended consumer and handoff settings: SVG for downstream vector use. After the check, a temporary raster is made with `rsvg-convert -w 960` to `output/inspect.png` and viewed by hand for clipping, overlap and label legibility. That visual inspection is a human-in-the-loop check, not a scripted one.
- Delivery constraints and units: SVG only; no media is retained in `expected/`, only `metrics.json`.
- Expected failure modes and stop conditions: D2 version differs from 0.7.1; `d2` exits non-zero; SVG is not well-formed XML; any label missing; shape or connection count differs from 4 and 3; repeated runs differ; the inspection PNG shows clipping, overlap or illegible labels. Any of these is reported as `fail` or `partial`, with no change to the predeclared checks to make it pass.
- Reproduction instructions: `./run.sh --record` after inspection to record the baseline; `./run.sh` must print `d2-diagram-svg: OK`. Inspect with `rsvg-convert -w 960 output/diagram.svg -o output/inspect.png` and open the PNG.

## Observation, after running

Pass, 2026-11-24, executed on Conors-MacBook-Pro-2.local (macOS 26.6 arm64).

- Versions: D2 0.7.1 (`d2 --version`); Python 3.12.2 (parser only); rsvg-convert 2.63.4 (inspection raster only). No Playwright, Chromium, ImageMagick or Node is used by this fixture.
- Commands: `./run.sh --record` (baseline), then `./run.sh` (verification, prints `d2-diagram-svg: OK`).
- Observed: the SVG is 12,650 bytes with viewBox `0 0 859 268`; SVG SHA-256 `74bb8683…5c8b2`. The two runs inside one invocation were byte-identical (`cmp`), and the verification run in a fresh process reproduced the recorded SHA-256 and metrics. Labels `Source`, `Layout`, `SVG` and `Inspect` are present as text; 4 `g.shape` groups; 3 `path.connection` edge paths.
- Inspection: `output/inspect.png` (960 px, rasterised by rsvg-convert) shows four labelled boxes left to right, joined by three arrows, with no clipping or overlap. No contact sheet was made: this is a single still, not a frame sequence.
- Deviations, disclosed. (1) The first `--record` attempt failed in my check script on an XML namespace comparison; `cmp` had already passed on both SVGs, and the error was in the parser, not in D2 output. (2) The first parser assumed `width`/`height` on the root `svg` and edges as `g.connection` groups. The actual markup has only a `viewBox` on the root, shape groups as `g.shape`, and edges as three `path.connection stroke-*` elements. I changed the parser to match the observed markup and kept the predeclared counts of 4 shapes and 3 edges and the label list unchanged. Check 2 and checks 4–5 in the plan describe the earlier assumption; the counts and labels themselves were not relaxed.
- Nondeterminism: none observed across four SVG generations on this host (two per run, two runs). Only one host and one D2 version were tested.
- What this establishes: for this four-node LR chain, D2 0.7.1 on macOS arm64 renders to SVG headlessly with the predeclared labels and edge/shape counts, and its output is byte-identical across repeated runs. It does not establish: other graphs or layouts, sketch or themes, PNG/PDF export, font fidelity, other D2 or platform versions, or whether D2 remains byte-identical across time or hosts.
- Reviewer, decision, follow-up and invalidation triggers: a D2 upgrade, a change to the `source.d2` input, or a new hash mismatch on the same host should trigger a rerun and a dated note.
