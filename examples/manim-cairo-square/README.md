# Manim Community Cairo square translation

## Intent and scope

- **Tool/version:** Manim Community `manim` Python package 0.22.1, exact pin; current official release observed 2026-11-16.
- **Claim:** the real Manim CLI with the Cairo renderer renders an owned 2D square translation to a PNG sequence; frame count, dimensions, movement geometry, held endpoint and repeat metrics match expectations.
- **Exclusions:** TeX, text/fonts, OpenGL, 3D, video encoding, alpha, sound, custom mobjects/updaters, other resolutions/frame rates and other hosts.
- **Documentation/licence:** official [Manim docs](https://docs.manim.community/en/stable/), [output settings](https://docs.manim.community/en/stable/tutorials/output_and_config.html), [CLI configuration/options](https://docs.manim.community/en/stable/guides/configuration.html), [v0.22.1 release](https://github.com/ManimCommunity/manim/releases), and [MIT licence](https://github.com/ManimCommunity/manim/blob/main/LICENSE), checked 2026-11-16. The 0.22 CLI explicitly supports `--format=png-sequence`, `--renderer=cairo`, custom resolution and frame rate.
- **Environment:** macOS 26.6 arm64, uv-selected CPython 3.12, native Cairo 1.18.6 and Pango 1.58.2 available through pkg-config, FFmpeg/ffprobe available. Exact installed dependency versions will be recorded after installation/run.
- **Input/rights:** generated scene source only: 1-unit red square, initially at x=-2, translated 4 units right over 0.75 seconds with linear rate, then held 0.25 seconds. No external image, font or other asset.
- **Install/side effects:** user-authorized isolated virtual environment under ignored `output/venv`; install exact `manim==0.22.1` from `requirements.txt` via uv. Reuse native Cairo/Pango and FFmpeg; no Homebrew install. Render files, caches and logs remain under ignored `output/`.

## Plan, before running

- **Commands:** `uv venv --python 3.12 examples/manim-cairo-square/output/venv`; `uv pip install --python examples/manim-cairo-square/output/venv/bin/python -r examples/manim-cairo-square/requirements.txt`; then `examples/manim-cairo-square/run.sh --record`, followed by `examples/manim-cairo-square/run.sh`. The runner invokes the pinned `manim render` CLI twice with `--renderer=cairo --format=png-sequence --resolution=192,108 --frame_rate=12 --disable_caching`, each under its own output folder and a 180-second process timeout.
- **Expected checks:** 0.75 s animation + 0.25 s hold at 12 fps yields 12 frames; all PNGs are 192×108. The wait sets `frozen_frame=False` so Cairo renders its frames into the sequence rather than collapsing the static hold. Read every frame with Pillow, threshold the red square, assert nonempty bounded geometry, monotonic rightward centroid through the animation, total centroid shift in [45,60] px, and exact pixel-identical final three hold frames. Compare per-frame pixel SHA-256 metrics across two independent CLI runs.
- **Inspection:** open first, middle, and last rendered frames for visual review. No video container is produced; duration is derived from frame count/rate (12/12 = 1 s).
- **Stop conditions:** unavailable pinned wheel, missing native dependencies requiring a long source build, CLI failure/timeout, incorrect output count/dimensions/geometry, failed hold or repeat metrics. Keep catalogue unvalidated if blocked.
- **Output:** all virtualenv, render frames, cache, logs and comparison scratch data under ignored `output/`; source scene, runner, expected metrics and manifest are retained.

## Observation, after running

- **Date/executor:** 2026-11-16, Codex. The pinned environment under ignored `output/venv` uses CPython 3.12.13 (the system Python 3.12.2 shim was not used). `uv pip install` installed 35 packages; it built `pycairo` 1.29.2 and `srt` 3.5.3 locally, with no Homebrew/system installs. Manim 0.22.1, Pillow 13.0.0, Cairo 1.18.6, Pango 1.58.2, native FFmpeg 9.0.2; macOS 26.6 arm64 (`Darwin 25.6.0`).
- **Commands/result:** `examples/manim-cairo-square/run.sh --record`, then `examples/manim-cairo-square/run.sh`; both passed. Actual Manim Cairo CLI produced 12 PNGs at 192×108 and 12 fps (1.0 s). The thresholded square centroids progressed right from x=68.5 px to x=122.5 px, a 54 px shift. All 12 image hashes matched across separate caching-disabled CLI runs; final three held frames were pixel-identical. Per-frame bbox, red pixel count, centroid and hash are retained in `expected/result.json`.
- **Plan adjustment:** an initial render emitted only 10 frames because Manim optimized the static 0.25 s wait into a single frame. Set `frozen_frame=False` on that wait; the resulting sequence contains the planned three identical hold frames. No other deviation.
- **Inspection/status:** visually inspected first, middle and last frames: the red square is clear on white and moves right as intended. Pillow readback verified geometry and dimensions. Pass for a small Cairo PNG sequence only; no video container was produced and no FFmpeg operation was exercised. Does not establish text/TeX, OpenGL, 3D, alpha, video encoding, or another host.
- **Reviewer/follow-up:** not independently reviewed; guide eligibility can be considered for this narrow route.
