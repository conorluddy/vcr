# Iconify icons to SVG with a per-set licence manifest

## Intent and scope

- Tool/version: `@iconify/json` 2.2.562 (local icon data, 281 sets) and `@iconify/utils` 3.1.7, both pinned exact. `@iconify/tools` and `api.iconify.design` are not used.
- Claim: icons are built as SVG from the local JSON with no network, byte-identically across processes, and each set's licence metadata (`collections.json` `license.spdx`, `author`) is enough to compute the handling a credits step needs (notice, attribution, share-alike review, blocked).
- Exclusions: the live API, `@iconify/tools` (SVG cleanup and import), icon customisation beyond height and colour, colour (palette) icons, web components, whether a licence label is legally sufficient for a given use, and brand-trademark terms of logo sets (`simple-icons` is CC0 but its logos stay trademarks).
- Official documentation: https://iconify.design/docs/libraries/utils/ and https://iconify.design/docs/icons/json.html; checked 2026-11-27. Licences: MIT for the tooling; every set keeps its own licence in its metadata.
- Environment: macOS arm64; Node 22.19.0; resvg and ImageMagick for rasterising and the size check.
- Input: icons `lucide:film` (ISC), `fa6-brands:github` (CC-BY-4.0), `simple-icons:ffmpeg` (CC0-1.0), chosen to cover notice, attribution and free handling.
- Dependencies: `pnpm add @iconify/json @iconify/utils` inside this directory only; `@iconify/json` installs about 730 MB.
- Output: ignored `output/` (SVGs, PNGs, `credits.json`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: SVGs and `credits.json` hash identically across two `node render.mjs` processes; each SVG has no text, image, script or font reference; per-icon licence and handling match the intended mapping; no set in the collection has an unclassified licence; set counts, viewBoxes, sizes and hashes match `expected/metrics.json`; each resvg PNG is 192 px tall.
- Inspect a contact sheet at native size. Stop if an icon is missing, clipped or the wrong glyph, or if bytes differ between runs.

## Observation

Executed on 2026-11-27. Record and verify runs both passed. A contact sheet at 192 px showed a film strip, the GitHub octocat and the FFmpeg logo, all filled with the `color` set on the root (`currentColor` resolved). Stroke icons (lucide) and fill icons (fa6-brands, simple-icons) both rendered correctly. Licence handling over all 281 sets: 184 notice-retained, 68 attribution-required, 11 free, 10 share-alike-review, 6 blocked-copyleft (GPL), 2 blocked-non-commercial (CC-BY-NC), 0 unknown. This covers three icons and the metadata of one data release; it does not decide legal sufficiency, and the classification table in `render.mjs` is ours, not Iconify's.
