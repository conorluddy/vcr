# gopro-dashboard-overlay GPX-only widgets

## Intent and scope

- Tool/version: gopro-dashboard-overlay 0.134.0 (PyPI `gopro-overlay`), GPL-3.0-or-later, run as a separate process (never linked). Pinned in `requirements.txt` (its own dependencies are pinned by the package).
- Claim: from a GPX file alone (no GoPro video) with an XML layout, it renders an overlay movie with the expected widgets (speed, heart rate, altitude, bar gauge) at the telemetry values in the track, on a transparent background, and two renders give identical frames.
- Exclusions: GoPro GPMF input, FIT input, maps and moving-map widgets (tiles are fetched online), the bundled layouts, the `--generate overlay` mode (the tool rejects it with `--use-gpx-only`), compositing onto video, other sizes and frame rates.
- Docs and licence: https://github.com/time4tea/gopro-dashboard-overlay; `License-Expression: GPL-3.0-or-later` in the 0.134.0 metadata, LICENSE.md is GPLv3; the README says the bundled icons are not under the project's licence (this fixture uses none), checked 2026-11-27.
- Environment: macOS 26.6 arm64, Python 3.12.13, FFmpeg from Homebrew, tesseract 5.5.4 (reads the drawn digits; a checker, not an assessed tool), `/System/Library/Fonts/Supplemental/Arial.ttf` (the default Roboto is not installed here, so `--font Arial.ttf`).
- Input: `track.gpx`, hand-written: 11 points one second apart from 2026-01-01T10:00:00Z, due north at 10 m/s (36 km/h), altitude 100 to 120 m (+2 m/s), heart rate 120 to 140 bpm (+2 per s). `layout.xml` is original.
- Install (venv local to the example, built by `run.sh`): `python3.12 -m venv output/venv && output/venv/bin/pip install -r requirements.txt`. Network is used only for that install; rendering needs none. Config and caches go to `output/cfg` and `output/cache`, not `~/.gopro-graphics`. Cleanup: remove `output/`.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. `gopro-dashboard.py --use-gpx-only --gpx track.gpx --overlay-size 640x360 --layout xml --layout-xml layout.xml --font Arial.ttf --profile qtrle` twice; the `qtrle` profile (written to `output/cfg`) makes FFmpeg write ARGB QuickTime Animation so alpha survives, since the default H.264 route drops it.
- Predeclared checks: version 0.134.0; stream 640x360 `qtrle` `argb`; 303 frames (10 fps source over 10.1 s, output 30 fps); two renders have identical per-frame MD5; 101 distinct frames; top-left pixel transparent and opaque pixels exist; digits read back by OCR at t = 0, 5, 10 s equal speed 36, 36, 36, heart rate 120, 130, 140, altitude 100, 110, 120; the static "SPEED" label crop is identical across frames; the bar crop differs across the three frames.
- Stop conditions: version differs, or the two renders differ.
- Failure interpretation: a failed check stays in the fixture as `KNOWN FAIL`; the observed value is recorded in `expected/metrics.json` and the evidence is `partial`.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. Eight of ten checks pass, including identical frames across two renders and a transparent background. Two predeclared checks fail and stay:

- `numbers_match_gpx`: speed at t = 0 reads 33, not 36 (36 at 5 s and 10 s). The picture shows 33; the tool smooths speed derived from the first points of the track, so the opening value is not the true 10 m/s.
- `distinct_frames_101`: 100 distinct frames, not 101. Source frames at about 5.5 s (output frames 165 to 170, two source frames) are pixel-identical, so one frame repeats: a one-frame stall in the animation at the same place on both renders.

Frames at 0, 5 and 10 s were composited over grey and viewed at 640x360: labels, large numerals and the bar gauge are drawn cleanly with a dark outline; at 5 s the screen reads 36, 130 and 110. The bar fills white to its left of the marker and shows a green segment at the value, which is how the tool draws it, not a measure of 130 as a fraction (not asserted). `--generate overlay` is refused with `--use-gpx-only`, and the default output drops alpha. This proves a GPX-only overlay with correct numbers after the first second and deterministic frames on this machine; it does not show GoPro or FIT input, maps, or any other platform.
