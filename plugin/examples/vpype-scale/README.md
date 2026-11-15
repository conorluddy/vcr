# vpype scales SVG line geometry

## Intent and scope

- Tool: vpype 1.15.0.
- Claim: the CLI reads a simple SVG path, scales its coordinates by two, and writes a valid SVG with the expected line geometry.
- Excludes: `linesort`, plotter output, complex paths, style preservation, arbitrary SVG semantics, other operating systems.
- Source: official [vpype CLI reference](https://vpype.readthedocs.io/en/stable/reference.html) and [project documentation](https://vpype.readthedocs.io/); MIT. Checked 2026-11-15. Installed with `uv tool install vpype==1.15.0` in uv's isolated tool directory; this also installed its Python dependencies, without changing repository dependencies.
- Environment: macOS 26.6 arm64, Python 3.12.2.
- Input: original two-segment path in `source.svg`, created for this fixture; no external assets.

## Plan, before running

- Run `vpype read source.svg scale 2 2 translate 10 10 write --dont-set-date output/scaled.svg` twice.
- Check XML parses, one polyline has the exact expected scaled and offset coordinates, the viewBox is retained, output hashes match, and the version is exact.
- Stop if the command fails, generated SVG is malformed, coordinates differ, or repeat runs vary. `run.sh --record` captures expected measurements; otherwise it compares them.
- Inspect the generated SVG by rasterising it with resvg at 400×320.

## Observation

- Ran on 2026-11-15 as `Conors-MacBook-Pro-2.local`. vpype 1.15.0 completed both runs.
- XML contained one polyline at `10,10 50,10 50,50` with viewBox `0 0 100 80`; repeat SHA-256 matched (`expected/metrics.json`).
- The output was rasterised and visually inspected at 400×320; the three-segment path was present and unclipped.
- Result: pass for this bounded scale-and-write operation. Does not establish fidelity for arbitrary SVG features or plotter formats.
