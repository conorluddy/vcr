---
name: vl-convert
description: Render a hand-written Vega-Lite spec to static SVG or PNG from Python with vl-convert-python, no browser or Node. Load when a declarative chart still is wanted; animation needs another route.
---

# vl-convert

`vcr` below means `pnpm vcr` inside this repository.

## Use cases and limits
- Turns one Vega-Lite spec (a JSON dict) into an SVG string or PNG bytes through the Python API. The Rust package embeds Vega and runs it in V8.
- Prefer it over hand-built D3 (`skills/d3/SKILL.md`) when a standard chart type fits and the deliverable is a static, reproducible still: the spec is the data, the encodings and the audit trail in one object.
- Use D3 or another seekable scene when the look is custom or the chart must move. vl-convert makes stills only; for animation, render a scene per frame through a browser route and capture it.
- Evidence: vl-convert-python 1.9.0.post1, Vega-Lite 5.21 requested, Python 3.12.2, macOS arm64. One inline 5-bar chart to SVG 320x200 and PNG 640x400 at scale 2. Not covered: PDF, JPEG, HTML, scenegraph, the CLI, the server, other marks, themes, selections, time scales, cross-machine identity.
- Data pillar: bars must share a zero baseline (`DATA-ZERO-BASELINE`), labels must match the data (`DATA-LABEL-MATCH`), and a data frame shows its source (`DATA-SOURCE-LINE`; the fixture has no source line). Thresholds live in the pillar, not here.

## Capability map
Documented by the [vl-convert README](https://github.com/vega/vl-convert); discovery only.
- **Python API:** `vegalite_to_svg`, `vegalite_to_png`, plus Vega equivalents and other formats. Tested: the first two.
- **Other outputs:** PDF, JPEG, HTML, scenegraph. Untested.
- **CLI and server:** documented upstream. Untested.
- **Resource access:** local and remote file or URL access is configurable. Untested; the fixture uses inline data only.
- **Fonts:** font registration is documented. Untested.

## Install and doctor
```text
python3 -m venv examples/vl-convert-chart/output/venv
examples/vl-convert-chart/output/venv/bin/pip install -r examples/vl-convert-chart/requirements.txt
pnpm vcr doctor
```
`requirements.txt` pins `vl-convert-python==1.9.0.post1` (2.0.0-rc7 is a prerelease and was not used). Keep the venv under the example's `output/`. Doctor reports environment availability, not that the package is installed.

## Smoke test
```text
examples/vl-convert-chart/run.sh
# expect: vl-convert-chart: OK
```
It renders twice, checks twelve gates (five bar marks, labels equal data, title text, heights proportional, bottoms aligned, PNG 640x400, reruns byte-identical) and diffs `expected/checks.json`. Bar heights were 1.36 px per unit with 0 px baseline spread.

## Recipe: spec to SVG and PNG
```python
import vl_convert as vlc
spec = {
  "title": "Quarterly signups by channel",
  "width": 320, "height": 200,
  "autosize": {"type": "fit", "contains": "padding"},
  "data": {"values": [{"channel": "Email", "signups": 28}]},
  "mark": "bar",
  "encoding": {
    "x": {"field": "channel", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "signups", "type": "quantitative",
          "scale": {"domain": [0, 100], "zero": True}},
  },
}
svg = vlc.vegalite_to_svg(spec, vl_version="5.21")
png = vlc.vegalite_to_png(spec, vl_version="5.21", scale=2)
```
- Pin `vl_version` so the compiler does not change under you.
- Inline `data.values` only: no `url`, so nothing is fetched.
- `autosize` fit with padding keeps axes and title inside width x height; PNG size is width x height x scale.
- State the y domain and `zero: true` for bars (`DATA-ZERO-BASELINE`). Bars render as SVG paths with `aria-roledescription="bar"` and an `aria-label` carrying channel and value, which makes `DATA-LABEL-MATCH` checkable from the SVG.
- Reruns of the same spec were byte-identical here, for SVG and PNG.

## Findings
- **Fonts:** the SVG declares `font-family="sans-serif"` and the library does not report the resolved face. The PNG looked Helvetica-like. For reproducible typography register fonts explicitly and name them in the spec (untested); PNG bytes may differ on a machine with another default.
- **Order:** nominal x axes sort alphabetically (Direct, Email, Referral, Search, Social), not data order. Set `sort` on the x encoding explicitly (untested).

## Troubleshooting
- `run.sh` exits asking for the venv: create it as above; there is no automatic install.
- Hash or PNG diff against `expected/` after a library or font change: explain it, do not re-record silently.

## Official docs
- [vl-convert](https://github.com/vega/vl-convert)
- [Vega-Lite 5.21 documentation](https://vega.github.io/vega-lite/docs/)
- [vl-convert-python on PyPI](https://pypi.org/project/vl-convert-python/)
