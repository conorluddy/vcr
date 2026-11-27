---
name: iconify
description: Build SVG icons offline from the local @iconify/json data with @iconify/utils, and read each set's licence and author to decide credits or block a set. Load once Iconify has been chosen as the icon source for a scene or layer.
---

# Iconify

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- One icon (set and name) in, one SVG out, from local JSON with no network. Each set carries `license.spdx`, `license.url` and `author`, so licences can be checked by script.
- Sets keep their own licences: ISC, MIT and Apache need the notice kept; CC-BY and OFL need credit; CC-BY-SA and MPL need review; GPL and CC-BY-NC sets should not enter a commercial video. See the table below.
- It supplies icons only. Clean, recolour or rasterise with `svgo`, `svg`, `resvg`.
- Logo sets (`simple-icons`, `fa6-brands`) can be CC0 or CC-BY and still be trademarks; the licence label does not clear the mark.
- VCR evidence covers three icons, height and colour options and one data release (2.2.562) on macOS arm64 with Node 22. Everything else is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `@iconify/json` set files, `collections.json` | [icon data format](https://iconify.design/docs/icons/json.html) | tested |
| `@iconify/utils`: `getIconData`, `iconToSVG`, `iconToHTML`, `replaceIDs` | [utils](https://iconify.design/docs/libraries/utils/) | tested |
| `@iconify/tools` (import, clean, parse SVG) | [tools](https://iconify.design/docs/libraries/tools/) | untested |
| `api.iconify.design` live API | [api](https://iconify.design/docs/api/) | untested; use local JSON |
| Palette (multi-colour) icons, aliases, rotate and flip | [icon data format](https://iconify.design/docs/icons/json.html) | untested |

## Install and doctor
```sh
pnpm add @iconify/json@2.2.562 @iconify/utils@3.1.7
```
Project-local libraries; `vcr doctor` does not probe them. `@iconify/json` installs about 730 MB and publishes almost daily, so pin it exact and install it in the example or project that needs it only.

## Smoke test
```sh
cd examples/iconify-svg-licences && ./run.sh
# expect: OK: iconify-svg-licences
```
Renders twice in separate processes and requires identical bytes, checks the SVGs are shape-only, checks the licence classification against `expected/metrics.json`, and rasterises each icon to 192 px with resvg.

## Recipe: icon to SVG with credit
```js
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from '@iconify/utils';

const dir = createRequire(import.meta.url).resolve('@iconify/json/package.json').replace('package.json', '');
const read = (path) => JSON.parse(readFileSync(dir + path, 'utf8'));
const data = getIconData(read('json/lucide.json'), 'film');   // null if the name is missing
const { attributes, body } = iconToSVG(data, { height: 96 });
const svg = iconToHTML(replaceIDs(body), attributes).replace('<svg ', '<svg color="#111111" ');
const { license, author } = read('collections.json').lucide;  // spdx, url; name, url
```
- Icons use `currentColor`; set `color` on the root, as above, or the icon draws black.
- `iconToSVG` with only `height` keeps the aspect ratio (`fa6-brands:github` came out 93x96); give resvg `--height`, not `--width`, to get a fixed height.
- Fail fast when `getIconData` returns null.

## Licence handling
Classification used in the fixture (`render.mjs` `classifyLicence`; ours, not Iconify's), counts over 281 sets in 2.2.562:

| Handling | Spdx | Sets |
| --- | --- | --- |
| notice-retained | MIT, ISC, Apache-2.0, BSD-3-Clause | 184 |
| attribution-required | CC-BY-3.0/4.0, OFL-1.1 | 68 |
| free | CC0-1.0, Unlicense | 11 |
| share-alike-review | CC-BY-SA-3.0/4.0, MPL-2.0 | 10 |
| blocked-copyleft | GPL-2.0, GPL-3.0 (gridicons, wordpress, dashicons, gala, icomoon-free, et) | 6 |
| blocked-non-commercial | CC-BY-NC-4.0, CC-BY-NC-SA-4.0 (cbi, ps) | 2 |

Unrecognised spdx ids fall to `unknown`; treat them as blocked until read. Write `credits.json` beside the SVGs so a credits scene can read it.

## Determinism
Output depends on the pinned data release: upstream sets change icons between releases. Same version, same bytes, across processes (tested).

## Troubleshooting
- pnpm prints an ignored build-scripts notice on install; the packages need no build step.
- Untested: an icon in a newer release may be renamed or removed; the null check above surfaces it.

## Official docs
- [Iconify documentation](https://iconify.design/docs/)
- [iconify/iconify repository](https://github.com/iconify/iconify)
- [@iconify/json on npm](https://www.npmjs.com/package/@iconify/json)
