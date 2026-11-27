# Fontsource pinned Inter in a Chromium page

## Intent and scope

- Tool/version: `@fontsource/inter` 5.3.0 (OFL-1.1), pinned exactly in `package.json`. Driven by Playwright (`^1.64.1`, Chromium 156.0.8078.4).
- Claim: a lockfile-pinned Fontsource package gives a browser scene its font bytes with no system font: the latin 400 and 700 WOFF2 files are the exact packaged bytes (SHA-256 diffed), Chromium loads only those two faces after `document.fonts.ready`, and the render is byte-identical across two pages and differs from a control page without the CSS.
- Exclusions: variable packages, non-latin subsets, other families, other Chromium versions (text widths and PNG bytes vary by browser build), satori or resvg consuming the files, and any network or CDN use.
- Official documentation: https://fontsource.org and https://github.com/fontsource/fontsource; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Node 22; headless Chromium via Playwright.
- Input: the strings in `render.mjs`; the font files come from the npm package, no other assets.
- Output: ignored `output/` (`inter.png`, `control.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: package name, version and licence; SHA-256 of the two woff2 files; with the CSS, loaded faces are exactly `Inter 400` and `Inter 700` out of 14 declared and only those two woff2 files are requested; the control declares and loads none; heading and text widths match; two renders have the same PNG hash; the control PNG hash differs.
- Inspect both PNGs. Stop if the Inter render is not visibly Inter or a lazy subset loads.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. Record and verify runs passed. The Inter PNG shows Inter's letterforms, visibly different from the control, which falls back to Helvetica and is narrower (heading 736 px against 744, text 743 against 786). Of 14 declared faces only latin 400 and 700 loaded, so Chromium fetched subsets lazily by unicode-range as the lead warned. This proves one family, one browser build and one machine; PNG and width facts are not expected to carry to another Chromium.
