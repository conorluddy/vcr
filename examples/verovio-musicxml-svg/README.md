# Verovio MusicXML to SVG score

## Intent and scope

- Tool/version: Verovio 6.4.1 (`verovio` PyPI wheel, toolkit `6.4.1-fbe8f46`), LGPL-3.0-only, with its bundled Leipzig SMuFL font.
- Claim: a MusicXML melody becomes engraved SVG in-process with no browser, byte-identical across processes once `xmlIdSeed` is set, with note, measure and timemap counts a script can diff.
- Exclusions: MEI, Humdrum, ABC and `.mxl` input; other fonts; multi-page layout; MIDI export; CLI and WASM routes; recolouring or animating notes; Chromium rendering; other machines.
- Official documentation: https://book.verovio.org and https://github.com/rism-digital/verovio; checked 2026-11-27.
- Environment: macOS 26.6 arm64, Python 3.12.2, resvg 0.47.0, ImageMagick for the size check.
- Input: `score.musicxml`, the same 4-bar melody as `osmd-musicxml-svg`.
- Install (venv local to the example): `python3 -m venv output/venv && output/venv/bin/pip install -r requirements.txt`. Cleanup: remove `output/`.
- Output: ignored `output/` (`score.svg`, `score.png`, JSON).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`; `render.py` runs twice in separate processes.
- Assert: identical output JSON (including SVG SHA-256) across processes; 1 page, 4 `measure`, `note` and `notehead` counts and `<text>` count matching `expected/metrics.json`; resvg `--width 1800` PNG size matches `expected/png-size.txt`.
- Inspect the PNG at native size. Stop on missing glyphs or misplaced notes. Do not loosen the determinism check if it fails; report it.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`.

- The predeclared determinism check FAILED with default options: Verovio generates random element ids (`id="nqxdmia"` vs `id="g1i86k29"`), so every process produced a different SHA-256. The documented `xmlIdSeed` option fixes this; the check was kept as written and passes only with `xmlIdSeed: 1`.
- With the seed: 1 page, 4 measures, 10 notes and noteheads (a rest is not a `note`), 10 `<text>` elements (title, part name, lyrics), 10 timemap note-ons; PNG 1800x366. Notes, clef, 4/4, rest, final barline and lyrics (Do Re Mi Fa Sol La Ti Do) were correct.
- Visual finding: resvg drew the title "Rising Steps" clipped at the left edge ("ng Steps"). Verovio anchors it with `text-anchor="middle"` on a nested `<tspan>`; resvg mis-places that. A browser was not tried. Titles and lyrics are font-dependent `<text>`; notation glyphs are `<path>`/`<use>`.
- Not established: other platforms, fonts, input formats, Chromium rendering of the title.
