---
name: pseudo-localization
description: Pseudo-localise titles and captions in Node with the pseudo-localization package to test text expansion, overflow and glyph coverage before translations exist. Load when a version set needs a cheap stress copy of on-screen text.
---

# pseudo-localization

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A stress copy of title, lower-third or kinetic-type strings: longer, accented, and flagged by eye when something clips. Feeds the `adaptation` skill's text-expansion and version-set checks.
- It is a string function, not a translator or an RTL layout engine. Real right-to-left copy must be rendered in a browser; voice-over fit needs real translations.
- VCR evidence covers three English titles, `accented` and `bidi`, one monospace font, resvg, macOS arm64, Node 22. Everything else is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `pseudoLocalizeString(text, options)`, strategies `accented` and `bidi` | [README](https://github.com/tryggvigy/pseudo-localization#readme) | tested |
| Delimiter and other string options | README | untested |
| `pseudo-localization/dom` live DOM rewriting (mutation observer) | README | untested; avoid during seeked capture |

## Install and doctor
```sh
pnpm add pseudo-localization@3.1.3
```
A project-local library: `vcr doctor` does not probe it.

## Smoke test
```sh
cd examples/pseudo-localization-expansion && ./run.sh
# expect: OK: pseudo-localization-expansion
```
Runs twice in separate processes (identical output), checks expansion, overflow of the longest title in a 760 px box and the missing-glyph report, against `expected/metrics.json`.

## Recipe: stress a title
```js
import { pseudoLocalizeString } from 'pseudo-localization';
const stress = pseudoLocalizeString('Summer Sale: 50% off'); // Şŭŭmmḗḗř Şȧȧŀḗḗ: 50% ǿǿƒƒ
```
- Accented text is about 25% longer here (vowels doubled), so size boxes for that, then draw and measure.
- `strategy: 'bidi'` returns the text wrapped in U+202E and U+202C with upside-down look-alikes. It does not mirror the layout.
- Call it once at build time and feed the result to the scene as data; never run it inside `seek(t)`.

## Glyph coverage
The accented set uses Latin Extended letters (for example U+181, U+19E, U+1E13). JetBrains Mono Bold lacks 19 code points across both strategies in the fixture and resvg draws tofu boxes and prints `No fonts with a ... character were found`. Treat that as the finding: pick a font that covers the range, or confirm the real locale needs only what the font has. Run resvg with `--skip-system-fonts` or a system font will silently hide the gap (untested).

## Troubleshooting
- Tofu boxes in output: the font lacks the glyph, see above.
- Bidi text looks reversed or odd in resvg: resvg did not apply browser RLO layout; check real RTL copy in a browser (untested here).

## Official docs
- [pseudo-localization on GitHub](https://github.com/tryggvigy/pseudo-localization)
- [pseudo-localization on npm](https://www.npmjs.com/package/pseudo-localization)
