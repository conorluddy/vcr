# PlutoBook HTML and CSS title card to PNG frames

## Intent and scope

- Tool/version: plutoprint 0.24.0 (PyPI, wheel bundles PlutoBook 0.21.0; the wheel's licence file is MIT, the upstream library is MPL-2.0 per the lead). Pinned in `requirements.txt`.
- Claim: from Python, PlutoBook renders an HTML and CSS page (flexbox, wrapped text, absolutely positioned and rounded boxes, solid background) to a 1920x1080 PNG with no browser, and a page built as a pure function of `t` renders byte-identically in any order, so one PNG per frame is a usable route.
- Exclusions: PDF output, the `plutoprint` CLI (PDF only), web fonts and `@font-face`, images inside the page, paged media, alpha output, other platforms, and cross-machine determinism (`sans-serif` resolves through the machine's fonts).
- Docs and licence: https://github.com/plutoprint/plutobook, https://pypi.org/project/plutoprint/; checked 2026-11-27.
- Environment: macOS arm64, Python 3.12.2, venv in `output/venv` (git-ignored). ImageMagick `magick` reads pixels. No network at run time.
- Install (venv local to the example): `python3 -m venv output/venv && output/venv/bin/pip install -r requirements.txt`. Cleanup: remove `output/`.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. `card.py` runs twice in separate processes and the JSON (with PNG hashes) must be identical.
- Checks (gating): output is 1920x1080; five frames (t = 0 to 1) rendered in shuffled order hash equal to the sequential render; the five frames are pairwise different; the 100 px chip at the top left is `#FFCC00`, the bar at t=0 is `#FF3366` at (220, 920) and has left that pixel at t=1; a gradient background has different pixels at the top-right and bottom-right corners.
- Observations (recorded, not gating): whether inline `<script>` changes the output.
- Stop conditions: version differs, or the two processes differ.
- Failure interpretation: any failed check is `fail` or `partial` with the check named.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. First run: two checks failed. One was a mistake in my pixel reader (it returned RGBA hex, so exact comparisons could not match); that was fixed. The other was real: the gradient check failed because `linear-gradient` (every variant tried: angle, `to right`, stops, `rgb()` stops) and `radial-gradient` paint nothing on this build, and with nothing painted the PNG is transparent, so white text vanished on a white viewer. The gating check was therefore replaced with `background_painted` (solid `#0B1E3A` at a corner) and the gradient probe was kept as the observation `gradient_painted: false`. The original gradient claim is not proven.

After that, all 6 gating checks pass and the two processes agree. I viewed frames 0 and 4 at full size: the "Title Card" heading, a two-line wrapped paragraph, the yellow chip and the rounded pink bar are correct, and the bar moves between frames. The inline script (`textContent = 'JS RAN'`) did not run (`javascript_executes: false`). This proves HTML and CSS to PNG with solid-colour CSS, not gradients, scripts, web fonts or other machines.
