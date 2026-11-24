# drawsvg frames rasterised by resvg

## Intent and scope

VCR job and claim: drawsvg generates an SVG frame as a pure function of time
`t`, for five predeclared `t` values. The scene has a circle moving along a
track, a rectangle rotating about its centre, a two-stop linear gradient band,
and a text element that names a bundled font. The claim has four parts:

1. Each SVG carries the predeclared elements and attributes.
2. Rasterising each SVG with resvg gives the predeclared pixel probes.
3. Frames at different `t` differ, by SVG bytes and by PNG hash.
4. Regenerating gives byte-identical SVGs, and writing the frames in a shuffled
   order gives the same SVG bytes and PNG hashes as sequential writing.

Tool: drawsvg (PyPI `drawsvg`, MIT). Pinned `drawsvg==2.5.1` in
`requirements.txt`. Rasteriser: resvg (catalogued), CLI `resvg` 0.47.0 on PATH.

Explicit exclusions:
- No SMIL or CSS animation. The frames are static SVGs written per `t`; the
  SVG-native animation path (`native_animation`), the frame-animation path,
  video export and `save_png` (cairosvg) are not tested.
- No `drawsvg` embedded-font path (`font_embed`). The font is referenced by
  family name and loaded by resvg from a file under `fonts/`.
- No browser rendering. resvg output is the only pixel source; browser
  agreement with these SVGs is not claimed.
- No claim about resvg's text shaping quality, hinting or font fallback beyond
  the probes below.
- Cross-platform byte identity is not claimed. Hashes are for this machine
  and this resvg build.
- Rough.js, raster image embedding and `randomize_ids=True` are not used.
  drawsvg's `randomize_ids` path uses the `random` module and is excluded.

Tool documentation and licence sources, checked 2026-11-24:
- drawsvg: https://tangled.org/cduck.me/drawsvg (project home, moved from GitHub),
  https://pypi.org/project/drawsvg/ (2.5.1 is the latest release on PyPI at
  2026-11-24; the catalogue card records 2.4.2 as the version seen on 2026-11-15).
  Licence MIT per the catalogue card; the PyPI metadata field is blank in the
  installed package, so the licence text should be reconfirmed before redistribution.
- resvg: https://github.com/linebender/resvg (MPL-2.0 for the crate; the CLI
  is used unmodified, the output is not claimed to carry any licence).
- Bundled font `fonts/JetBrainsMono-Bold.ttf`: JetBrains Mono, SIL Open Font
  License 1.1, text in `fonts/OFL.txt` (copied from `examples/harfbuzz-shape-text/fonts/`,
  where the same file is already committed).

Environment: macOS 26.6 (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv,
resvg 0.47.0 from Homebrew (`/opt/homebrew/bin/resvg`). No GPU.

Input: none. Every shape, gradient and string is written by `generate.py`. The
only file input is the bundled font, whose sha256 is checked by `check.py`.

Dependencies and installation plan (pre-approved by the brief):
- Create `examples/drawsvg-frames/output/venv` (git-ignored) from pyenv Python 3.12.2.
- `output/venv/bin/python -m pip install -r requirements.txt`, which pins
  `drawsvg==2.5.1` only. Its optional `[raster]` and `[all]` extras (cairosvg,
  imageio, numpy, pwkit) are not installed; resvg does the rasterising.
- No network access is needed by the fixture at run time. Installation uses PyPI.
- Nothing system-wide; no global package or shell change.
- Cleanup: remove `examples/drawsvg-frames/output`.

Selected workspace and output: `examples/drawsvg-frames/output/` (git-ignored):
`venv/`, `svg-sequential/`, `svg-rerun/`, `svg-shuffled/`, `png-sequential/`,
`png-shuffled/`, `contact.png`, logs, `dependencies.txt`, `checks.json`.
Committed: this README, `example.json`, `run.sh`, `generate.py`, `check.py`,
`requirements.txt`, `fonts/JetBrainsMono-Bold.ttf`, `fonts/OFL.txt`,
`expected/checks.json`. No SVG, PNG or contact sheet is committed.

## Plan, before running

Scene (a pure function of `t`, seconds; duration `D = 2.0`; progress `p = t / D`):
- Canvas 480 x 270, transparent background (no background rectangle).
- Circle `id="moving-circle"`: `cx = 60 + 180 t`, `cy = 80`, `r = 30`, fill `#e4572e`.
- Rectangle `id="rotating-square"`: 60 x 60, top-left `(210, 120)`, fill `#29335c`,
  `transform="rotate(A 240 150)"` where the angle `A = 45 t` degrees (90 degrees at `t = 2`).
- Rectangle `id="band"`: `x 40..440`, `y 200..220`, fill `url(#band-gradient)`.
- `linearGradient id="band-gradient"` from `(40, 210)` to `(440, 210)`, user space,
  stops `#ff0000` at offset 0 and `#0000ff` at offset 1.
- Text `id="caption"`: content `t=%.1fs` (for example `t=0.5s`), `x = 240`, baseline
  `y = 252`, `text-anchor = middle`, `font-size = 22`, fill `#111111`,
  `font-family = "JetBrains Mono"`.

Predeclared frame times (seconds): `0.0, 0.5, 1.0, 1.5, 2.0`, so 5 frames
`frame-0000.svg` to `frame-0004.svg`.

Rasterisation: `resvg --skip-system-fonts --use-font-file fonts/JetBrainsMono-Bold.ttf`
at native size (480 x 270). System fonts are skipped so the text can only come
from the bundled file; a missing or unmatched family therefore produces no
text pixels, which the text probe detects.

Commands:
```
examples/drawsvg-frames/run.sh            # generate x3, rasterise x2, check, diff expected/
examples/drawsvg-frames/run.sh --record   # only after a deliberate change
```

Predeclared checks (all gating):
1. Frame count: 5 SVGs and 5 PNGs in each of `svg-sequential`, `svg-rerun`,
   `svg-shuffled`, `png-sequential`, `png-shuffled`.
2. Dimensions: every PNG is 480 x 270, 8-bit RGBA (colour type 6). Every SVG root has
   `width="480"`, `height="270"`.
3. SVG structure, every frame: the circle has `cx` equal to `60 + 180 t` within
   1e-6, `cy = 80`, `r = 30`, `fill = #e4572e`. The square has
   `transform` `rotate(A 240 150)` with `A = 45 t` within 1e-6. The band fill is
   `url(#band-gradient)`. The gradient has two stops, `#ff0000` at 0 and `#0000ff` at 1.
   The caption text equals `t=%.1fs` for its `t`, and `font-family` contains `JetBrains Mono`.
4. Pixel probes, every frame (tolerance 4 per RGB channel, alpha exact unless stated):
   - `(60 + 180 t, 80)` is circle colour `(228, 87, 46)`, alpha 255.
   - `(240, 150)` is square colour `(41, 51, 92)`, alpha 255.
   - `(100, 210)` is band colour `(217, 0, 38)`, alpha 255.
   - `(240, 210)` is band colour `(128, 0, 128)`, alpha 255.
   - `(4, 4)` is transparent, alpha 0.
   - In the caption box `x 150..329`, `y 236..255`, at least 100 pixels have alpha > 0
     (text came from the bundled font).
5. Distinct frames: the five PNG hashes are pairwise distinct, and the five SVG
   hashes are pairwise distinct.
6. Regeneration: `svg-rerun` SVG files are byte-identical to `svg-sequential`.
7. Shuffled order: `svg-shuffled` SVG files are byte-identical to `svg-sequential`
   (frames written in index order 4, 1, 3, 0, 2 within one process), and
   `png-shuffled` PNG files have the same hashes as `png-sequential`.
8. Alpha range on the middle frame (`frame-0002`, `t = 1.0`): minimum alpha 0,
   maximum alpha 255, and at least one pixel with `0 < alpha < 255` (anti-aliasing).
9. Bundled font: the sha256 of `fonts/JetBrainsMono-Bold.ttf` equals
   `a2349098b9e45419e7bf0e2958d6c4937a049dded37387b08be725be4c7615f3`.

Informational (recorded, not gating): PNG and SVG sha256 of every frame; resvg
stderr in `output/resvg.log`.

Expected failure modes and stop conditions:
- Missing `output/venv` or `resvg` on PATH: stop, no automatic install.
- Non-zero exit from generate or resvg: stop, keep logs.
- Any gating check failing: stop. The expected file is not rewritten to hide a
  failure. Report `fail`, or `partial` if only the text probe or the font-dependent
  check fails, with the measured values as scope.
- A PNG hash differing between two runs on this machine would mean resvg is not
  deterministic here; that would be reported as a failure of check 6/7 for PNG, not
  hidden.

Inspection: a contact sheet of frames 0, 1, 2, 3, 4 (`output/contact.png`), built with
ImageMagick `magick` (inspection only, not part of `run.sh`), read with the image viewer, and
described in the observation section.

Reproduction: `run.sh`, then `run.sh` again; the second run must print
`drawsvg-frames: OK`.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS 26.6, Darwin 25.6.0, arm64),
from `examples/drawsvg-frames`. Versions: drawsvg 2.5.1 (the only package in
`output/dependencies.txt`, installed with `pip install -r requirements.txt` into
`output/venv`); Python 3.12.2 (pyenv); resvg 0.47.0 (`output/resvg-version.txt`).
Playwright, Chromium and Node are not used by this fixture. ImageMagick was used only for
the contact sheet (`magick`, not part of `run.sh`); its version is not recorded.

Commands: `./run.sh --record`, then `./run.sh`. The second run printed
`drawsvg-frames: OK`. The record and verify runs gave identical `checks.json`, since the verify
run diffs it against `expected/checks.json`.

Measured (from `output/checks.json`):
- All 12 gating checks pass.
- Frames: 5 SVGs and 5 PNGs per directory; PNGs 480 x 270, 8-bit RGBA.
- Caption ink (pixels with alpha > 0 in the caption box): 562, 535, 529, 502, 539 for
  `t` = 0.0, 0.5, 1.0, 1.5, 2.0. Without the bundled font (`--skip-system-fonts` alone),
  the same frame gives 0 caption pixels, so the threshold of 100 separates the two cases.
- Middle frame (`t = 1.0`) alpha: minimum 0, maximum 255, 773 partially transparent pixels.
- Distinct PNG hashes: 5 of 5. Distinct SVG hashes: 5 of 5.
- PNG sha256 (`frame-0000` to `frame-0004`): `ad8e0450…031e`, `df258527…893d`,
  `3d3d7717…a377e` (full value in `expected/checks.json`), and so on; the full list is in
  `expected/checks.json` under `measurements.pngSha256`.
- Rerun SVGs and shuffled-order SVGs are byte-identical to sequential; shuffled-order PNGs have
  the same hashes as sequential PNGs.
- Bundled font sha256 matches `a2349098…615f3`.

Inspection: `output/contact.png` (1200 x 135, frames 0 to 4 at 50 %, on grey). It shows the
moving circle at the top, travelling left to right from the left edge to the right edge; the
rotating square, upright at `t = 0` and `t = 2`, and turned by about 45 degrees at `t = 0.5` and
`t = 1.5`, which is a diamond at `t = 1.0`; the red-to-blue gradient band; and the monospaced
bold caption `t=0.0s` to `t=2.0s` centred under the band. The frames are clean, with no clipping or
blank frame. The square at `t = 0` and `t = 2` looks identical because a square repeats every 90
degrees, so that pair is shown as the same picture; the checks, not the picture, establish that
the angle differs (`rotate(0)` and `rotate(90)`).

Pass, on the predeclared checks. The result proves that this drawsvg scene writes
predeclared SVG elements and attributes for each of five `t` values, that resvg rasterises them
to the predeclared pixels on this machine using the bundled font, that the frames differ, and that
regeneration and shuffled-order writing are byte-identical. It does not establish SMIL or CSS
animation, drawsvg's frame-animation or video paths, the `font_embed` path, browser rendering
agreement, other platforms, resvg versions other than 0.47.0, or any drawsvg output beyond these
five frames. The PNG hashes depend on resvg 0.47.0 and its rasteriser; a different resvg may change
them while the probes still pass.

Reviewer, follow-up and revisit triggers: revisit on any drawsvg release after 2.5.1 (the card
records 2.4.2 as seen on 2026-11-15, and 2.5.1 is the release used here), any resvg upgrade (the PNG
hashes may change while the probes pass), or a change to `fonts/`. The licence line for drawsvg
should be reconfirmed before redistribution, because the PyPI metadata field is blank.

Deviation: none from the predeclared plan. The first `generate.py` run was a manual smoke test that
wrote `output/svg-sequential` before the README checks were run; the checks themselves were run
only with `run.sh`.
