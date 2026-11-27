---
name: palt-typesetting
description: Typeset Japanese and mixed Japanese-Latin text with palt-typesetting for a browser-captured scene: thin spaces between scripts and a palt stylesheet with a pinned Noto Sans JP. Load once it has been chosen for Japanese on-screen text; it does not narrow glyphs by itself.
---

# palt-typesetting

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- It is a markup generator. `new Typesetter().render(text)` returns HTML with a `.typesetting-wrapper`, word-break spans, a `.typesetting-latin` span around Latin runs and `.typesetting-thin-space` elements at script boundaries. It does not shape text. The proportional (`palt`) narrowing comes from CSS `font-feature-settings: 'palt'` on a font that has the feature.
- Browser only for the visible result: satori, resvg and canvas text ignore the spans and CSS. For palt advances without a browser use `harfbuzz` or `fonttools`.
- Evidence: one sentence, Noto Sans JP 400 (`@fontsource/noto-sans-jp` 5.3.1, OFL-1.1), Chromium via Playwright, macOS arm64. Everything else is untested. Two predeclared checks are KNOWN FAIL: palt widened 3 of 33 characters by up to 0.7 px, and 「 is already half-width in Chromium without palt (`text-spacing-trim`).

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `render(html)` in Node (jsdom) | [README](https://github.com/yamatoiizuka/palt-typesetting) | tested: identical across instances |
| `renderToSelector` / `renderToElements` (DOM) | README | untested |
| `insertThinSpaces`, `thinSpaceWidth` | README | tested: 6 spaces in the sample |
| `kerningRules`, `wrapChars`, `useWordBreak`, `wrapLatin` | README | untested |
| `typesetter.css` (word-break, thin-space font) | package `dist/` | tested, loaded in the page |

## Install and doctor
```sh
pnpm add palt-typesetting@0.9.5 @fontsource/noto-sans-jp@5.3.1
```
Project-local libraries: `vcr doctor` does not probe them. The README is in Japanese.

## Smoke test
```sh
cd examples/palt-typesetting-advances && ./run.sh
# expect: OK: palt-typesetting-advances (2 predeclared checks are KNOWN FAIL, see README)
```
It lists PASS and KNOWN FAIL lines; it exits 1 if a known fail starts passing or any other check fails.

## Recipe: Japanese line with palt
```js
import Typesetter from 'palt-typesetting';
const html = new Typesetter().render('ようこそ、VCRへ。');
// page: <link> noto-sans-jp/400.css and palt-typesetting/dist/typesetter.css, then
// .scene { font: 400 48px 'Noto Sans JP'; font-feature-settings: 'palt'; }
await page.evaluate((text) => document.fonts.load('400 48px "Noto Sans JP"', text), sourceText);
```
- Fontsource ships unicode-range slices: call `document.fonts.load` with the exact text, then `document.fonts.ready`, before measuring or capturing.
- To measure, compare per-character Range widths with and without the palt class (`render.mjs`): the sample line narrowed 10.9% (1326.3 to 1181.72 px).
- Thin spaces add width (1407.97 px typeset against 1326.3 px plain without palt), so set a scene's measure from the typeset HTML.

## Troubleshooting
- No visible tightening: the font lacks `palt` or the CSS is not on the wrapper; fallback fonts do not narrow.
- Half-width 「 with palt off in Chromium is the browser's default `text-spacing-trim`, not the library.

## Official docs
- [Repository and README](https://github.com/yamatoiizuka/palt-typesetting)
- [palt-typesetting on npm](https://www.npmjs.com/package/palt-typesetting)
- [@fontsource/noto-sans-jp](https://fontsource.org/fonts/noto-sans-jp)
