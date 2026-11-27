---
name: mathjax
description: Typeset TeX equations to self-contained, path-only SVG in Node with MathJax 4 (no browser, LaTeX or installed fonts), then rasterise with resvg or place the SVG in a scene. Load once MathJax has been chosen for an equation layer.
---

# MathJax

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- One TeX equation in, one SVG out. Glyphs are `<path>` outlines reused through `<use>`, so the file carries its own font and rasterises anywhere.
- It makes a still. To move it, treat the SVG as an ordinary layer in a browser scene (`svg`, `anime-js`); for term-by-term equation transforms use `manim-community`; for pages of maths use `typst`.
- VCR evidence covers one display equation, the `base` and `ams` packages, the default New Computer Modern font and `fontCache: 'local'`, on macOS arm64 with Node 22. Everything else below is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Direct Node API (`mathjax.document`, `convert`) | [server/direct](https://docs.mathjax.org/en/latest/server/direct.html) | tested |
| lite DOM adaptor | [server/adaptor](https://docs.mathjax.org/en/latest/server/adaptor.html) | tested |
| TeX input and packages | [input/tex](https://docs.mathjax.org/en/latest/input/tex/index.html) | `base`, `ams` tested; other packages untested |
| SVG output, `fontCache` | [output/svg](https://docs.mathjax.org/en/latest/output/svg.html) | `local` tested; `global`, `none` untested |
| MathML, AsciiMath input; CHTML output; fonts other than NewCM | [docs index](https://docs.mathjax.org/en/latest/index.html) | untested |
| Accessibility (speech, assistive MathML) | [what's new in 4.0](https://docs.mathjax.org/en/latest/upgrading/whats-new-4.0.html) | untested |

## Install and doctor
```sh
pnpm add @mathjax/src@4.1.3
```
A project-local library: `vcr doctor` does not probe it. Pin the exact version, because it pins `@mathjax/mathjax-newcm-font` to the same version and the font sets the metrics.

## Smoke test
```sh
cd examples/mathjax-tex-svg && ./run.sh
# expect: OK: mathjax-tex-svg
```
Renders twice in separate processes and requires identical bytes, then checks path-only output against `expected/metrics.json` and a 960×282 resvg PNG.

## Recipe: TeX to SVG
```js
import { mathjax } from '@mathjax/src/mjs/mathjax.js';
import { TeX } from '@mathjax/src/mjs/input/tex.js';
import { SVG } from '@mathjax/src/mjs/output/svg.js';
import { liteAdaptor } from '@mathjax/src/mjs/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/mjs/handlers/html.js';
import '@mathjax/src/mjs/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/mjs/input/tex/ams/AmsConfiguration.js';

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const document = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams'] }),
  OutputJax: new SVG({ fontCache: 'local' }),
});
const svg = adaptor.innerHTML(document.convert(String.raw`e^{i\pi} + 1 = 0`, { display: true }));
```
- Import each TeX package's `…Configuration.js` before naming it in `packages`.
- Size is in `ex` (`width="18.108ex"`). Give resvg an explicit `--width`, or set width and height yourself when placing the SVG in a scene.
- Colour is `currentColor`: set `color` on the parent element, or replace it in the string, before rasterising on a dark background.

```sh
resvg --width 960 --background white equation.svg equation.png
```

## Determinism
Glyph ids look like `MJX-1-NCM-…`. The counter is per document, so one equation per fresh document gives the same bytes every run (tested). Several equations converted in one document get later ids; keep each one in its own document, or hash the facts you need, not the bytes (untested).

## Troubleshooting
- No failures were seen in the fixture.
- Untested: an unknown macro is expected to show as an error node in the output; check that its package is imported and listed in `packages`.

## Official docs
- [MathJax 4 documentation](https://docs.mathjax.org/en/latest/index.html)
- [MathJax-src repository](https://github.com/mathjax/MathJax-src)
- [@mathjax/src on npm](https://www.npmjs.com/package/@mathjax/src)
