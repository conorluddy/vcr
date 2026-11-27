---
name: hyphenopoly
description: Insert soft hyphens into German, English and other strings in Node with Hyphenopoly 6 (TeX patterns in WebAssembly, no browser) so text that breaks only at spaces can wrap long words. Load once Hyphenopoly has been chosen for hyphenation before layout.
---

# Hyphenopoly

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- String in, string out: Hyphenopoly puts a soft hyphen (U+00AD) at each allowed break point. It does no layout; the renderer (`satori`, `canvas-2d`, `troika-three-text`, your own wrapper) must honour soft hyphens and draw `-` where it breaks. Check that first; not every renderer does (untested for all three).
- It supplies the break points that the typography pillar expects with justified or narrow text (`TYPO-FEATURES`, "Rag, hyphenation and justification" in `references/typography`). Set the right language, and do not hyphenate brand names or short text.
- In a browser DOM, CSS `hyphens: auto` with `lang` may be enough; it varies by platform, which is the reason to use Hyphenopoly.
- VCR evidence covers the Node API with `de` and `en-us` on macOS arm64, Node 22. Everything else below is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| Node module `hyphenopoly.config().get(lang)` | [README](https://github.com/mnater/Hyphenopoly#node) | tested |
| Soft-hyphen output (`hyphen` option) | [docs](https://mnater.github.io/Hyphenopoly/) | tested with U+00AD; other characters untested |
| Languages (patterns directory, about 100 `.wasm` files) | [patterns](https://github.com/mnater/Hyphenopoly/tree/master/patterns) | `de`, `en-us` tested; each pattern has its own licence |
| `exceptions`, `leftmin`, `rightmin`, `minWordLength` | [docs](https://mnater.github.io/Hyphenopoly/) | untested |
| Browser polyfill (`Hyphenopoly_Loader.js`) | [README](https://github.com/mnater/Hyphenopoly#usage) | untested |

## Install and doctor
```sh
pnpm add hyphenopoly@6.1.0
```
A project-local library: `vcr doctor` does not probe it. Pin the exact version, because pattern updates change break points.

## Smoke test
```sh
cd examples/hyphenopoly-soft-hyphens && ./run.sh
# expect: OK: hyphenopoly-soft-hyphens
```
Runs twice in separate processes and requires identical bytes, checks that removing the soft hyphens restores each input and that a 14-column wrap no longer overflows, then diffs `expected/metrics.json`.

## Recipe: hyphenate a string
```js
import { readFile } from 'node:fs/promises';
import hyphenopoly from 'hyphenopoly';

const hyphenator = hyphenopoly.config({
  hyphen: '­',
  loader: (file, patternDirectory) => readFile(new URL(file, patternDirectory)),
  require: ['de', 'en-us'],
});
const hyphenateGerman = await hyphenator.get('de');
hyphenateGerman('Geschwindigkeitsbegrenzung'); // Ge·schwin·dig·keits·be·gren·zung (· is U+00AD)
```
- List every language in `require` up front; `get` returns a function for one language.
- Words under the minimum length (5 letters, `short words stay as they are`) are left alone.
- Output is deterministic for a pinned version and pattern set (tested twice, separate processes). A wrapper that treats U+00AD as a break and prints `-` on use is a few lines (see `render.mjs`).

## Troubleshooting
- No failures were seen in the fixture.
- Untested: an unsupported language code is expected to fail at `require`; check the `patterns` directory name.

## Official docs
- [Hyphenopoly repository and README](https://github.com/mnater/Hyphenopoly)
- [Documentation](https://mnater.github.io/Hyphenopoly/)
- [hyphenopoly on npm](https://www.npmjs.com/package/hyphenopoly)
