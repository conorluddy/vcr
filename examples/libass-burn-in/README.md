# libass burn-in (native C)

Status: validated on macOS arm64, 2026-11-24 (libass 0.17.5, Apple clang 21.0.0, Node v22.19.0). Intent and plan were written before the first run; the observation section records what happened, including a mid-run change of font provider.

## Intent and scope

- Tool: libass 0.17.5 (Homebrew, `pkg-config --modversion libass`), ASS/SSA subtitle renderer library. Card checked 2026-11-24 with `pnpm vcr tools info libass`.
- Route: FFmpeg on this machine (9.0.2) has no `ass` or `subtitles` filter (`ffmpeg -filters` lists neither, and `-buildconf` has no `--enable-libass`), so the claim is tested through a small C program that calls libass directly, as the brief allowed.
- VCR job and exact claim: libass renders a hand-written `.ass` file (one style with a bundled OFL font loaded via `ass_set_fonts_dir`, two timed events at different positions) over a generated solid background. At predeclared times only the expected event's text region is non-background, at a time between events nothing is drawn, and reruns are byte-identical.
- Exclusions: FFmpeg's `ass`/`subtitles` filters (not built); other ASS features (karaoke, animated tags, fades, `\clip`, drawing commands); other font providers (CoreText, DirectWrite) and system fonts; font fallback behaviour; the colour and quality of glyph antialiasing beyond the one coverage check; other platforms and libass versions; semantic correctness of text shaping; tool-to-tool edges (FFmpeg burn-in, playback).
- Documentation and licence: libass is ISC (`https://github.com/libass/libass`, card licence field, checked 2026-11-24). JetBrains Mono is SIL OFL 1.1 (`https://github.com/JetBrains/JetBrainsMono`); the licence text is in `fonts/OFL.txt`, copied unmodified from `examples/canvas2d-capture/fonts/`. The font file is `fonts/JetBrainsMono-Bold.ttf`, sha256 `a2349098b9e45419e7bf0e2958d6c4937a049dded37387b08be725be4c7615f3`.
- Environment: macOS (Darwin 25.6.0) arm64, Apple clang, Homebrew libass 0.17.5 and its fontconfig/FreeType dependencies. No GPU is involved.
- Input: `fixture.ass` in this directory, hand-written; no external media. The background is generated in C (solid RGB 24,28,36).
- Dependencies and side effects: no new installs. The only pre-existing system packages used are libass (already installed) and whatever it links. Font lookup is isolated by a generated `output/fonts.conf` that lists only `fonts/`, so no user font is used by name.
- Workspace and cleanup: everything generated goes under the git-ignored `output/`; `run.sh` deletes and recreates it. Only `expected/*.json` is committed.

## Plan, before running

- Commands: `examples/libass-burn-in/run.sh --record` then `examples/libass-burn-in/run.sh`. `run.sh` builds `render.c` with `clang $(pkg-config --cflags --libs libass)` into `output/render`, after checking `pkg-config --modversion libass` is `0.17.5`.
- Parameters: canvas 640x360 (matches `PlayResX`/`PlayResY`). 50 frames at t = 0, 100, ..., 4900 ms (10 fps, 5.0 s span).
- Event windows (ASS start inclusive, end exclusive):
  - `TOP LEFT`, `\an7\pos(40,60)`, 200 to 1800 ms, expected region x < 320 and y < 180.
  - `BOTTOM RIGHT`, `\an3\pos(600,320)`, 2200 to 3800 ms, expected region x >= 320 and y >= 180.
  - Gaps: 0 to 200 ms, 1800 to 2200 ms, 3800 to 5000 ms: nothing drawn.
- Predeclared checks (all must pass for `pass`):
  1. 50 frames in each run, each a P6 PPM of 640x360.
  2. Frames inside `TOP LEFT`: at least one non-background pixel, and every non-background pixel inside the top-left region; none in the bottom-right region. Frames inside `BOTTOM RIGHT`: the mirror. Frames in gaps: exactly zero non-background pixels. Named probes: 1000 ms non-empty top-left, 2000 ms empty, 3000 ms non-empty bottom-right.
  3. At least two distinct frame hashes across the sequence.
  4. Reruns: a second sequential process produces files byte-identical to the first (`diff -r`); a single process rendering the frames in a fixed shuffled order produces per-frame hashes identical to sequential order (checks libass state carried between seeks).
  5. Alpha on one middle frame (3000 ms, mid-event): libass coverage (alpha) minimum 0, maximum 255, and at least one partial value (1 to 254), i.e. antialiased edges exist.
  6. Recorded `expected/hashes.json` and `expected/measured.json` match the run (drift detection; the checks above are predeclared and not re-derived from the record).
  7. Font provenance: the libass log (stderr, saved to `output/libass.log`) names `JetBrainsMono-Bold.ttf`. If it does not, the font check is not proven and the result is at most `partial`.
- Expected artifacts: `output/sequential/`, `output/repeat/`, `output/shuffled/` (PPM frames, PGM coverage for 3000 ms, `measured.jsonl`), `output/libass.log`, `output/fonts.conf`, `output/render`.
- Intended consumer and handoff: none; this is a rendering and determinism check, not a delivery format.
- Delivery constraints: none.
- Expected failure modes and stop conditions: pkg-config version mismatch stops the run before compiling; a missing bundled font (libass falls back to a default face) fails check 7; any failure of checks 1 to 6 is `fail` and is reported rather than recorded. The `--record` step only writes `expected/` after a clean render; it never overwrites on a failed check.
- Reproduction and inspection: `run.sh`; then `cd output/sequential && magick 0000...` style contact sheets as described in step 7 of the brief, plus `magick` on individual frames.

## Observation, after running

- Date and executor: 2026-11-24, a Claude agent in its own worktree, host `Conors-MacBook-Pro-2.local`, macOS (Darwin 25.6.0) arm64.
- Versions: libass 0.17.5 (Homebrew, `pkg-config`); libass's own log reports FreeType 2.15.0, HarfBuzz-ng 15.1.0 and FriBidi 1.0.16 (pkg-config reports FriBidi 1.0.18; not investigated). Apple clang 21.0.0, Node v22.19.0. ImageMagick 7.1.2-35, used only for the contact sheet. FFmpeg 9.0.2 has no `ass` or `subtitles` filter, so FFmpeg is not in this chain. Chromium and Playwright are not used.
- Deviation 1, font provider: the first `--record` used `ASS_FONTPROVIDER_FONTCONFIG` with a generated `fonts.conf`. libass logged `can't find selected font provider`, so that config had no effect. The render still picked the bundled file, but the provider path was not clean. Those hashes were discarded. The code now uses `ASS_FONTPROVIDER_NONE` with `ass_set_fonts_dir` only; the Plan section above is left as originally written.
- Deviation 2, licence file: libass tried to open `fonts/OFL.txt` as a font (`Error opening memory font`). The licence moved to the example root; the font directory now holds only the TTF.
- Deviation 3, a bug in the first render attempt (wrong argument index for the output directory) wrote nothing. Fixed before any recorded result. `expected/` was written only from the final code, and the non-record run then printed `OK`.
- Results, all from the final code:
  - 50 frames per run, each P6 640x360. The sequential run, a repeat sequential run (`diff -r` clean, measured JSON included) and the shuffled single-process run all agree on frame hashes (check 4 passed).
  - Three distinct frame hashes: blank, `TOP LEFT` and `BOTTOM RIGHT`. The text is static, so every frame inside one event is identical; there is no motion in this fixture.
  - `TOP LEFT`: 16 frames (200 to 1700 ms), 866 non-background pixels each, box x 41..154, y 66..84, inside the top-left region.
  - `BOTTOM RIGHT`: 16 frames (2200 to 3700 ms), 1556 non-background pixels each, box x 427..598, y 294..312, inside the bottom-right region.
  - Gaps: 18 frames (0 and 100 ms; 1800 to 2100 ms; 3800 to 4900 ms), zero non-background pixels each.
  - Alpha at 3000 ms: coverage 0..255, 797 partial (antialiased) pixels.
  - Font: libass logged `fontselect: (JetBrains Mono, 700, 0) -> JetBrainsMono-Bold` after loading `fonts/JetBrainsMono-Bold.ttf`. The font file sha256 is `a2349098...` (see the header of this README).
  - Recorded `expected/hashes.json` (100 files) and `expected/measured.json` match on the non-record run.
- Control: rendering the same probes with an empty fonts directory drew nothing at 1000 ms and 3000 ms, so the named probes in check 2 would fail. The check can fail.
- Contact sheet: `examples/libass-burn-in/output/contact.png` (960x360). Six frames at 0, 1000, 2000, 3000, 3500 and 4500 ms. The 0, 2000 and 4500 ms tiles are blank background; the 1000 ms tile shows `TOP LEFT` in JetBrains Mono at the top left, and the 3000 and 3500 ms tiles show `BOTTOM RIGHT` at the bottom right, right-aligned to about x=600. The text is crisp and clipped nowhere, so the picture matches the claim. A zoomed crop of the top-left text is in `output/crop-top-left.png`.
- What this establishes: libass 0.17.5 on this Homebrew build, driven from C, renders a hand-written ASS track with one style and a bundled font loaded by `ass_set_fonts_dir`, two timed events at different `\pos` anchors, over a generated background. Event timing and placement, the gaps, the coverage alpha on one frame, and byte-identical reruns with shuffled-order agreement all hold on this machine.
- What it does not establish: the FFmpeg `ass`/`subtitles` filter (not built here); karaoke, fades, animated tags, clips, drawing commands; system font lookup or fallback; other font providers; other platforms, libass versions or FreeType/HarfBuzz builds; glyph antialiasing quality beyond the one coverage check; any visual judgement of typography beyond the contact sheet.
- Invalidation: any libass, FreeType or HarfBuzz upgrade (antialiasing and advances may change), a change to `fixture.ass`, or a change to the font file. Rerun with `--record` only after a deliberate change, and report it.
- Reviewer and follow-up: none recorded yet. A follow-up would be a version of this fixture through FFmpeg, once FFmpeg is built with libass, to compare the two routes.
