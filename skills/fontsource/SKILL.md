---
name: fontsource
description: Pin an open font family's exact bytes through the lockfile with a Fontsource npm package (@fontsource/inter) and load it in a Chromium scene without system-font drift. Load once Fontsource has been chosen as the font source for a browser capture.
---

# Fontsource

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Gives a scene its fonts from `node_modules`: each family is an npm package, so the lockfile fixes the font bytes and the render no longer depends on what the machine has installed.
- It only supplies files and `@font-face` CSS. To trim a font or instance a variable one use `fonttools`; to read or shape glyphs use `opentype-js` or `harfbuzz`.
- VCR evidence covers `@fontsource/inter` 5.3.0, latin 400 and 700, linked as CSS in headless Chromium 156 on macOS arm64. Everything else is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Static packages `@fontsource/<family>` (CSS per weight, `files/*.woff2`) | [fontsource.org](https://fontsource.org) | `inter` 400/700 tested |
| Variable packages `@fontsource-variable/<family>` | [fontsource.org](https://fontsource.org) | untested |
| Unicode subsets (cyrillic, greek, vietnamese and others) | [GitHub](https://github.com/fontsource/fontsource) | lazy loading by unicode-range observed; non-latin untested |
| Fontsource CLI and the font-files API | [GitHub](https://github.com/fontsource/fontsource) | untested |

## Install and doctor
```sh
pnpm add @fontsource/inter@5.3.0
```
A project-local library: `vcr doctor` does not probe it. Pin the exact version. Its numbers follow Fontsource's scheme, not the foundry's release, so note the family's upstream version if it matters. The licence is per family (`@fontsource/inter` is OFL-1.1); check it in each package's `package.json`.

## Smoke test
```sh
cd examples/fontsource-pinned-inter && ./run.sh
# expect: OK: fontsource-pinned-inter
```
Diffs the package version, the SHA-256 of the two woff2 files, the loaded faces and text widths against `expected/metrics.json`, and requires two identical PNGs that differ from a control without the CSS.

## Recipe: load a pinned font in a scene
```js
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
const packageDirectory = dirname(createRequire(import.meta.url).resolve('@fontsource/inter/package.json'));
const cssUrl = (weight) => pathToFileURL(join(packageDirectory, `${weight}.css`)).href;
// <link rel="stylesheet" href="${cssUrl(400)}"> in the page, then before capture:
await page.evaluate(() => document.fonts.ready);
```
- Link one CSS file per weight (`400.css`, `700.css`); the woff2 URLs inside are relative to the package, so a `file://` page loads them with no server.
- Each CSS declares every subset (14 faces here); Chromium fetched only the latin 400 and 700 files for latin text, so subsets load lazily. Wait on `document.fonts.ready` after the text is in the DOM, then capture.
- The woff2 files are at `files/inter-latin-<weight>-normal.woff2` if another tool needs raw bytes (untested with satori, opentype-js or harfbuzz).

## Pitfalls
- Font metrics and PNG bytes vary by Chromium build; the fixture records widths for one build. Hash the font files, not screenshots, to prove pinning.
- Name the family in `font-family` with a fallback; without the CSS the page silently shows the fallback (the control render did, at a different width).

## Troubleshooting
- No failures were seen in the fixture.
- Untested: a family missing from the registry, or a name with different weights than requested, would leave no CSS file; list `node_modules/@fontsource/<family>/` first.

## Official docs
- [Fontsource](https://fontsource.org)
- [fontsource/fontsource repository](https://github.com/fontsource/fontsource)
- [@fontsource/inter on npm](https://www.npmjs.com/package/@fontsource/inter)
