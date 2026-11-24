# generativepy frame sequence fixture

## Intent and scope

VCR job and claim: generativepy 50.0 renders a short frame sequence as a pure
function of frame number. A 48-frame, 320x240 RGBA sequence is drawn with
generativepy's `make_images` (sequential) and `make_image` (one frame at a time,
out of order), using its `Circle` and `Rectangle` shapes and one `LinearGradient`
fill, written as PNGs. Predeclared pixel probes at known frames match, frames
differ across time, out-of-order rendering equals in-order rendering, and reruns
are byte-identical.

Tool: generativepy, PyPI package `generativepy`, pinned `50.0`
(released 2026-08-16 per the catalogue card). Rendering backend: pycairo
`1.29.2` on Cairo `1.18.6` (system library, Homebrew, found by
`pkg-config --modversion cairo`).

Explicit exclusions:
- Only PNG output via cairo ARGB32 (`channels=4`). No GIF, movie (`movie.py`,
  which needs moviepy/ffmpeg), SVG, numpy-array frames (`make_image_frames`),
  matplotlib, bitmap or nparray paths.
- Only `Circle`, `Rectangle` and one `LinearGradient`. No `Text`, `Path`,
  `Polygon`, `Ellipse`, strokes, dashes, colour schemes, formulas or tweens.
- No claim on other Cairo versions, other operating systems or other CPUs.
  Byte identity is observed on this machine only.
- No claim about alpha compositing beyond the one alpha-range check on a middle
  frame and the gradient-end probes. No colour-management claim.
- The library's random generator is not used. The scene reads no clock and no
  random source; the only inputs are the frame number and the frame count.

Licence and documentation sources, checked 2026-11-24:
- https://github.com/martinmcbride/generativepy (MIT; installed `LICENSE` file
  reads MIT, per the package metadata).
- https://pypi.org/project/generativepy/ (50.0 is the latest version listed).
- Dependencies keep their own licences (numpy, pillow, moviepy, imageio,
  pycairo, and others in `requirements.txt`). This fixture does not redistribute
  them.

Environment: macOS 26.6 (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv.
No GPU use. Cairo is a software rasteriser.

Input: none. Every frame is drawn procedurally in `generate.py`.

Dependencies and installation plan (approved for this fixture, into the venv only):
- `python3 -m venv examples/generativepy-frames/output/venv` (git-ignored).
- `output/venv/bin/pip install -r requirements.txt`, where `requirements.txt` is a
  committed full pin of the resolved set (`generativepy==50.0`, `pycairo==1.29.2`,
  and transitive packages). Nothing outside the venv and `output/` is written.
- `pkg-config --modversion cairo` must print a version before pycairo is installed
  (it was `1.18.6`). No `brew install` was needed.
- Network: PyPI, for installation only. Rendering and checking are offline.
- Cleanup: remove `examples/generativepy-frames/output`.

Selected workspace and output: `examples/generativepy-frames/output/` (git-ignored):
`run-a/` and `run-b/` (each with `sequential/` and `shuffled/` PNGs), logs,
`dependencies.txt`, `checks.json`.
Committed: this README, `example.json`, `run.sh`, `generate.py`, `check.py`,
`requirements.txt`, `expected/checks.json`. No PNG is committed.

## Plan, before running

Commands (after the install above):
```
examples/generativepy-frames/run.sh            # generates twice, checks, diffs expected/
examples/generativepy-frames/run.sh --record   # only after a deliberate change
```

`generate.py OUTPUT_DIR` draws 48 frames at 320x240 with `channels=4`:
- Frame `n` is `draw_frame(ctx, 320, 240, n, 48)`, with `progress = n / 48`.
- Orbiting yellow circle, radius 18, centre `(160 + 80 cos(2 pi p), 100 + 50 sin(2 pi p))`.
- Opposite magenta circle, radius 10, centre `(160 - 80 cos, 100 - 50 sin)`.
- Green bar at the top, `Rectangle` at (0, 0), height 12, width `320 * (0.25 + 0.75 p)`.
- Gradient band, `Rectangle` at (0, 176), 320 x 64, `LinearGradient` left-to-right from
  opaque blue `(0.10, 0.45, 0.90)` to transparent orange `(0.95, 0.35, 0.15, 0)`.
- Background is not painted, so it is transparent.
- Sequential: `make_images(OUTPUT_DIR/run/sequential/frame, ...)` writes
  `frame00000000.png` to `frame00000047.png` in order.
- Shuffled: for position `k`, frame `(29 k) mod 48` (29 and 48 are coprime, so every frame
  appears once) is drawn by a separate `make_image` call with its own frame number, into
  `shuffled/`.

`check.py RUN_A RUN_B` prints JSON and exits 1 when any gating check fails.

Predeclared checks (all gating):
1. Frame count is 48 in `sequential/` and in `shuffled/`, for both runs.
2. Every PNG is 320 x 240 (read with `cairo.ImageSurface.create_from_png`).
3. At least two distinct SHA-256 hashes across the 48 sequential frames (expected: 48).
4. Shuffled equals sequential: SHA-256 of every `shuffled/frameN.png` equals that of
   `sequential/frameN.png`.
5. Rerun byte-identical: the SHA-256 of every frame in `run-b` equals `run-a`.
6. Alpha range on the middle frame 24: minimum alpha 0 and maximum alpha 255.
7. Analytic probes (tolerance 3 per colour channel, exact alpha where stated):
   - frame 0, (240, 100): yellow `(255, 204, 26)`, alpha 255 (orbit centre).
   - frame 24, (80, 100): yellow, alpha 255 (orbit centre, opposite phase).
   - frame 12, (160, 50): magenta `(230, 51, 179)`, alpha 255 (counter-orbit centre).
   - frame 0, (2, 208): alpha at least 247 (left end of the gradient, opaque).
   - frame 0, (318, 208): alpha at most 8 (right end of the gradient, transparent).
8. Recorded probes: the exact premultiplied BGRA bytes at the probe points above are in
   `measurements.probes` and must match `expected/checks.json` (the diff in `run.sh`).

Expected failure modes and stop conditions:
- Missing venv, import failure, or non-zero exit from a generate run: stop, keep logs.
- Any gating check failing: stop. The baseline is not rewritten to hide a failure.
  Report `fail`, or `partial` if only the byte-identity between runs fails while
  the rest pass.
- A differing hash between the two runs of this machine would mean the cairo PNG path
  is not byte-stable; that is recorded and the scope would not claim reproducibility.

Inspection: `output/run-a/sequential/` contact sheet (frames 0, 15, 30, 45 and so on),
made with ImageMagick `magick`, saved as `output/contact.png` and viewed with Read.
It is inspection, not a gating check.

Reproduction: run `run.sh`; inspect frames with
`magick output/run-a/sequential/frame00000024.png -background '#808080' -flatten out.png`.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS 26.6, Darwin 25.6.0, arm64),
from `examples/generativepy-frames`. Versions: generativepy 50.0 (PyPI, MIT);
pycairo 1.29.2 wheel on Cairo 1.18.6 (`pkg-config --modversion cairo`); numpy 2.5.5;
pillow 11.3.0; Python 3.12.2 (pyenv); ImageMagick 7.1.2-35 (contact sheet only).
Playwright, Chromium and Node are not used. The full freeze is `requirements.txt` (committed)
and `output/dependencies.txt` (ignored).

Commands: `run.sh --record` (generates twice, checks, copies `expected/checks.json`), exit 0; then
`run.sh`, which printed `generativepy-frames: OK` and exit 0, with the diff clean.

Measured (`output/checks.json`, identical in the record and verify runs):
- All seven gating checks true: frame count 48 (sequential and shuffled, both runs);
  dimensions 320x240 on every frame; 48 distinct SHA-256 hashes; shuffled equals sequential
  for all 48 frames; rerun byte-identical; middle frame 24 alpha min 0 and max 255;
  analytic probes.
- Frame digest (SHA-256 of the concatenated per-frame hashes): 4408bd597363a19c1132b9dbc5e723f5516b8a9601a81fab7ac26ff57e7eb673, the same in both runs.
- Probes (premultiplied BGRA): (240,100) f0 = (25,204,255,255), yellow; (80,100) f24 = same
  yellow; (160,50) f12 = (179,51,230,255), magenta; (2,208) f0 = alpha 253; (318,208) f0 =
  (0,0,1,1), transparent. Stride 1280 bytes.

Inspection: `output/contact.png`, made with `magick` from frames 0, 15, 30 (top row) and 45, 47,
24 (bottom row) of `run-a/sequential/`. The frames show a grey-matte preview with a green top bar
that lengthens from frame 0 to 47, a yellow circle and a magenta circle moving on opposite
phases of an orbit, and a blue-to-transparent gradient band across the lower third that fades to
the matte at the right edge. Nothing is clipped or blank. The content matches the scene as written.
Defects: none seen at this scale.

Deviations and corrections before the record was kept:
- The first `generate.py` called its main block before the helper it needs was defined, so the
  shuffled pass raised `NameError`. The block was moved to the end of the file. The scene and
  checks were not changed.
- The first `run.sh --record` failed on a missing `expected/` directory, so it was created and the
  record was rerun. No check outcome changed between the attempts.

Pass, on the predeclared checks. The result proves only that this generativepy 50.0 scene, drawn
through pycairo's ARGB32 surface on this machine, writes a 48-frame 320x240 PNG sequence that is a
pure function of frame number, with stable bytes across reruns and out-of-order rendering. It does
not establish the movie, GIF, SVG or numpy paths, other shapes or text, other Cairo or OS versions,
or cross-machine byte identity (PNG bytes depend on the Cairo and libpng builds).

Limitations and nondeterminism: none observed in 48 frames x 2 runs. The Cairo rasteriser is
software; no clock, random source or network is read by the scene. The scene uses only the frame number and frame count.

Reviewer, follow-up and revisit triggers: revisit on any generativepy release, pycairo or Cairo
upgrade (PNG hashes may change while the probes still hold), a new platform, or any move to the
movie or matplotlib routes, which need their own fixtures.

Cleanup: remove `examples/generativepy-frames/output` (venv, PNGs, logs, contact sheet).
