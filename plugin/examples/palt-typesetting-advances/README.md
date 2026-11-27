# palt-typesetting and palt advances

## Intent and scope

- Tools: `palt-typesetting` 0.9.5 (MIT), `@fontsource/noto-sans-jp` 5.3.1 (OFL-1.1, redistributable), Playwright `^1.64.1` (Chromium). All installed with `pnpm add` inside this folder; no system install.
- Claim: given Japanese text, `Typesetter.render()` is deterministic and inserts quarter-em spacing between Japanese and Latin, and with the `palt` feature on (CSS `font-feature-settings: 'palt'`, which the library's docs have the page set) the same text has narrower advances than without it.
- Finding that shapes the claim: the library does not apply palt. It emits spans, classes and thin-space elements; the narrowing comes from the browser and the font's `palt` feature. `render()` runs in Node (jsdom), but measuring palt needs a shaper, here Chromium.
- Exclusions: other fonts or weights, the `kerningRules` and `wrapChars` options, line breaking (`useWordBreak`), other browsers, vertical text.
- Output: ignored `output/` (`palt.png`, `metrics.json`).

## Predeclared checks (`check.mjs`)

Licences OFL-1.1 and MIT; identical `render()` output across instances; identical PNG across two pages; font loaded; palt narrows the line by at least 5%; palt never widens a character; palt narrows 、 。 「; thin spaces inserted at script boundaries; palt narrows the typeset output too.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. The PNG shows four lines: plain, palt (visibly tighter kana), and the two typeset variants with the library's thin spaces around VCR and English.

- Pass: line width 1326.3 px to 1181.72 px (-10.9%); typeset 1407.97 to 1239.47; 6 thin spaces; render and PNG identical across runs.
- KNOWN FAIL, not loosened: `palt never widens a character` (3 of 33 characters widen, by up to 0.7 px, for example へ 48.02 to 48.73). `palt narrows 、 。 「` (「 is 24.02 px with and without palt: Chromium's default `text-spacing-trim` already halves it).
- `run.sh` exits 0 by diffing `expected/metrics.json` and by listing the two failures in `check.mjs` as known; it exits 1 if either starts passing or anything else fails.

## What this does and does not establish

One font, one sentence, one Chromium build, one machine. Pixel widths are not expected to carry to another browser build.
