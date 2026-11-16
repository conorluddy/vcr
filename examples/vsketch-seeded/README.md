# Seeded vsketch SVG fixture

## Intent and scope

- **Tool and version:** vsketch 1.2.0, pinned in `pyproject.toml` and `uv.lock`.
- **Claim:** a fixed seed produces the declared two-line SVG geometry with the expected viewBox, and repeated exports preserve the same coordinates.
- **Input:** `sketch.py`, an owned sketch that draws two connected lines.
- **Environment:** macOS 26.6 arm64, Python 3.12.13 managed by uv.
- **Exclusions:** no claim about plotter hardware, HPGL, other sketches, or broader geometry fidelity.

## Observation

- **Date:** 2026-11-16.
- **Result:** vsketch exported two lines in a `377.9527559055118 × 302.3622047244095` viewBox. The checker verified exact SVG coordinates and a repeatable geometry hash in `expected/metrics.json`.
- **Reproduction:** `./run.sh` synchronizes the locked environment, exports twice with seed 1701, and checks the SVG geometry.
