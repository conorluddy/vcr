# fonttools pyftsubset title subset fixture

## Intent and scope

VCR job and claim: `pyftsubset` reduces an OFL font to a predeclared set of
codepoints (the glyphs for the title string `Type & Motion 2026`) and writes
both a TTF and a WOFF2 subset. The predeclared checks are:
- the subset's cmap covers exactly the predeclared codepoints;
- every other printable ASCII codepoint present in the source is absent from the subset;
- the WOFF2 file is a real WOFF2 whose cmap matches the TTF subset's cmap;
- file size drops: WOFF2 subset < TTF subset < source;
- two independent subset runs give byte-identical TTF and WOFF2 files.

Tool: fonttools (PyPI `fonttools`), pinned `4.68.0`. Brotli `1.2.1` is pinned
because WOFF2 output requires it. Catalogue record: `catalog/tools/fonttools.json`.

Explicit exclusions:
- `varLib.instancer` is NOT exercised. The repository has no OFL variable font:
  the only font files are static `JetBrainsMono-Bold.ttf` copies. No font was
  downloaded to fill the gap. The claim for instancing is not made here.
- No shaping, kerning or glyph-position claim (that is `harfbuzz`).
- No rendering claim: the specimen image in `output/` is inspection only and is
  not a gating check.
- No hinting, layout-feature or name-table claim beyond pyftsubset defaults.
- No TTC/OTF/WOFF (only TTF and WOFF2 flavours are produced).
- Determinism is observed on this machine with this pinned pair of versions only.
- No claim about browser font loading (`TYPO-FONT-READY` applies to browser scenes and
  is not exercised here).

Typography pillar: this fixture touches `TYPO-FONT-SHIP` (a font file and its licence
travel with the project; the OFL permits redistribution, so the font and `OFL.txt`
are committed under `fonts/`). It sets no thresholds from the pillar.

Licence and documentation sources, checked 2026-11-24:
- fonttools: https://github.com/fonttools/fonttools (MIT per the catalogue card; the
  licence file in the installed distribution is the verified source, see Observation).
- Brotli: https://github.com/google/brotli (MIT; pinned as a WOFF2 dependency).
- JetBrains Mono: https://github.com/JetBrains/JetBrainsMono, licence SIL Open Font
  License 1.1, Copyright 2020 The JetBrains Mono Project Authors. Local copy:
  `fonts/OFL.txt`, copied from `examples/canvas2d-capture/fonts/`, byte-identical
  to the copies in other examples.
- Model, asset and output terms: none; no generated content is redistributed.

Environment: macOS 26.6 (Darwin 25.6.0), arm64 (Apple M3), Python 3.12.2 from pyenv.
No GPU use. Node, Playwright and Chromium are not used.

Input: `fonts/JetBrainsMono-Bold.ttf`, sha256
`a2349098b9e45419e7bf0e2958d6c4937a049dded37387b08be725be4c7615f3`, 114828 bytes,
static (no `fvar`). Recipe for the title codepoints: the sorted unique codepoints of
the string `Type & Motion 2026` (14 codepoints including the space). The dropped set
is every codepoint from U+0021 to U+007E that is present in the source and not in
the title set. The pinned-version recipe is in `check.py`.

Dependencies, installation plan and side effects:
- Create `examples/fonttools-subset-instance/output/venv` (git-ignored) with the
  pyenv Python 3.12.2 and run `output/venv/bin/pip install -r requirements.txt`.
  Pip resolves only the two pins above and their transitive dependencies from PyPI.
- Nothing system-wide, no global package, no shell change, no `.venv` in the example.
- Network access to PyPI for installation only. Nothing is downloaded at run time.
- Cleanup: remove `examples/fonttools-subset-instance/output` (venv, subsets, logs).

Selected workspace and output: `examples/fonttools-subset-instance/output/`
(git-ignored). Committed: this README, `example.json`, `run.sh`, `check.py`,
`requirements.txt`, `fonts/` (font and licence), `expected/checks.json`.
No subset (TTF or WOFF2) is committed.

## Plan, before running

Commands (after the install above):
```
examples/fonttools-subset-instance/run.sh            # subsets twice, checks, diffs expected/
examples/fonttools-subset-instance/run.sh --record   # only after a deliberate change
```

`run.sh` runs `output/venv/bin/pyftsubset` with
`--unicodes=<title codepoints in hex>` and no other option, once to
`output/subset-a.ttf` and once to `output/subset-b.ttf`; then once more with
`--flavor=woff2` to `output/subset-a.woff2` and `output/subset-b.woff2`.
Then `check.py` reads the files and writes `output/checks.json`, which is diffed
against `expected/checks.json`.

Predeclared checks (all gating):
1. Precondition: the source cmap contains every title codepoint.
2. cmap of `subset-a.ttf` as a set equals the title codepoint set exactly.
3. cmap of `subset-a.ttf` contains none of the dropped codepoints (ASCII U+0021 to
   U+007E present in the source and not in the title). The dropped set is non-empty.
4. `subset-a.woff2` begins with the magic `wOF2`, loads with fontTools, and its cmap
   equals the TTF subset's cmap.
5. Size drops: `bytes(woff2) < bytes(ttf subset) < bytes(source)`.
6. Determinism: `subset-a` and `subset-b` are byte-identical (sha256), for both TTF
   and WOFF2.
7. Frame count, dimensions, alpha range and shuffled-order checks from the template
   do not apply: the fixture produces no frames. The determinism check (6) is its
   analogue for the repeated-run claim.

Informational (not gating, recorded in `output/checks.json`): glyph counts of source
and subset, sizes and sha256 of each output, the pyftsubset and fonttools versions,
and the pyftsubset stderr log.

Expected failure modes and stop conditions:
- Install failure, or a non-zero exit from `pyftsubset`: stop and keep logs. Result `blocked`
  if installation fails, `fail` if a subset run fails.
- Any gating check failing: stop. The expected file is not rewritten to hide a failure.
- A check that passes only because the expected file was re-recorded is not a pass.

Inspection: `output/specimen.png` is a plain ImageMagick rendering of the title from
`subset-a.ttf` next to the source font, made outside the gating path, if `magick` is
present. It is for human inspection only.

Reproduction: `output/checks.json` lists every measured value; `output/logs/` holds the
pyftsubset output.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS 26.6, Darwin 25.6.0, arm64),
from `examples/fonttools-subset-instance`. Commands: `./run.sh --record`, then `./run.sh`,
which printed `fonttools-subset-instance: OK`.

Versions: fonttools 4.68.0 (`pyftsubset`, MIT per the installed `licenses/LICENSE`);
brotli 1.2.1 (MIT per its METADATA); Python 3.12.2 (pyenv); the venv's pip 24.0.
Installed under `output/venv` only. Full freeze in `output/dependencies.txt` (ignored).
Playwright, Chromium and Node are not used. ImageMagick 7.1.2-35 (`/opt/homebrew/bin/magick`)
was used only to draw the inspection specimen, outside `run.sh`.

Measured (`expected/checks.json`, identical in the record and verify runs):
- Gating checks: all nine true (precondition, TTF cmap equals the 14 title codepoints,
  no dropped codepoint, WOFF2 magic, WOFF2 cmap equals TTF cmap, size order, two
  byte-identical TTF runs, two byte-identical WOFF2 runs).
- Source TTF 114828 bytes, 976 cmap codepoints, 1168 glyphs. Subset TTF 3772 bytes,
  14 cmap codepoints, 21 glyphs. Subset WOFF2 1712 bytes (45% of the subset TTF).
- Dropped set: 81 printable ASCII codepoints present in the source and absent from the title.
- sha256: subset TTF `4fb70a38d879b74d7d55e8428f21336619c4d2013abbb8b5ebff349a36370dbd`;
  subset WOFF2 `629b3ef10452588357917afd6d4ba61de3c34fa166b97ea97f718cb8ac238fa9`.
  These are for the pinned pair fonttools 4.68.0 and brotli 1.2.1 on this machine.
- Negative control (not committed): the checker run on the unsubsetted source in place
  of the subsets fails the TTF cmap, dropped-codepoint, size-order and WOFF2-magic checks.
  The checks can fail.

Inspection: `output/specimen.png` has three rows. Row 1 is the title from the subset TTF;
row 2 is the same title from the source; row 3 is `Quick brown fox` from the subset. Rows 1
and 2 match in shape. In row 3 only `i`, `o`, `n` and `o` (the title letters) appear; the
other letters are blank. The subset does not draw a missing-glyph box, so an uncovered
codepoint fails silently as empty space. The check on absent codepoints catches this at
the cmap level; a visual check would not have.

Not exercised: `varLib.instancer`. The repository has no OFL variable font. A tracked-file
search for `.ttf`, `.otf` and `.woff2` under `examples/` and `packages/` found only static
`JetBrainsMono-Bold.ttf` copies, and the source table list has no `fvar`. No font was
downloaded. Instancing has no evidence from this run.

Pass, on the predeclared checks. The result proves that pyftsubset with pinned fonttools
4.68.0 and brotli 1.2.1 produces, on this machine, a TTF and WOFF2 subset of JetBrains Mono
Bold whose cmap is exactly the 14 title codepoints, that drops every other ASCII codepoint
of the source, that is smaller than the source, and that repeats byte-identically. It does
not establish instancing, shaping (`harfbuzz`), rendering in a browser (`TYPO-FONT-READY`),
other fonts or flavours, other platforms, or cross-version byte identity.

Pillar notes (no thresholds taken): `TYPO-FONT-SHIP` is met by committing the OFL font
and `OFL.txt`. The blank-glyph observation is relevant to font coverage, but no
coverage threshold from the pillar is tested here.

Reviewer, follow-up and revisit triggers: revisit on any fonttools or brotli bump (the
sha256 values will change while the cmap checks still pass), any variable-font asset
added to the repository (then add the `varLib.instancer` step), or a different platform.
