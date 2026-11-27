# Pseudo-localised titles: expansion and overflow

## Intent and scope

- Tool/version: `pseudo-localization` 3.1.3 (MIT), `pseudoLocalizeString()` with the `accented` and `bidi` strategies.
- Claim: pseudo-localising a title in Node is repeatable, lengthens it by at least 25% in characters and in drawn ink width, and so exposes a title that overflows its box before translations exist; the same run surfaces glyphs the scene font cannot draw.
- Exclusions: the `pseudo-localization/dom` observer, strategy options such as delimiters, real right-to-left shaping (resvg does not reorder the `bidi` output as a browser would), other fonts, multi-line wrapping and real translations.
- Official documentation: https://github.com/tryggvigy/pseudo-localization (README); checked 2026-11-27.
- Environment: macOS arm64; Node 22.19.0; resvg 0.47.0 with `--skip-system-fonts` and the bundled JetBrains Mono Bold; ImageMagick for ink width.
- Input: three strings in `render.mjs`. Output: ignored `output/` (per-line SVG and PNG, `contact.png`, `lines.json`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert, per title: two separate processes give identical `lines.json`; accented text has at least 1.25 times the characters and 1.25 times the ink width of the original; the original fits a 760 px box; `bidi` is the original length plus the two Unicode controls (RLO, PDF).
- Assert overall: the shortest title still fits when accented, the longest overflows (detection works), and at least one uncovered glyph is reported (the lead's font-fallback caveat).
- Inspect `output/contact.png` at native size. Stop on any failed assertion; do not loosen a threshold.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`; every assertion passed on the first recorded run. Accented text grew 7 to 9, 20 to 25 and 28 to 35 characters; ink widths 164 to 212, 476 to 596 and 667 to 835 px, so the longest title overflows the 760 px box. `contact.png` shows what the numbers hide: the accented strategy doubles vowels and uses Latin Extended letters that JetBrains Mono Bold lacks, so 19 distinct code points (for example U+181, U+19E, U+1E13) render as tofu boxes. The `bidi` strategy swaps in upside-down look-alikes and wraps the string in RLO/PDF; resvg draws the upside-down letters but not a real RTL layout, and the same gaps appear as tofu. Those gaps are a result, not a failure: the tool exposed a font without coverage. Not proven: browser rendering of RLO, wrapping, fonts that cover the range.
