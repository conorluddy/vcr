---
name: satori
description: Convert a React element tree and supplied font data into SVG with Satori. Load for data-driven static layouts when its supported CSS subset is sufficient and a browser is unnecessary.
---

# Satori

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Satori renders a React element tree into SVG; it is a still-image generator, not a browser or animation runtime.
- Its CSS support is a subset. Use Playwright for full browser layout, interaction or unsupported CSS; rasterise SVG with resvg.
- VCR evidence covers fontless flexbox rectangles and resvg output only. Text, font loading and broader CSS fidelity are untested.

## Capability map
The [official Satori documentation](https://github.com/vercel/satori) covers the React element input, CSS support, fonts, and SVG output. The fixture exercises React element input, a flex container with positioned colored rectangles, and SVG generation. Text/font handling and other CSS properties are documented but untested by this fixture.

## Install and doctor
```sh
pnpm add satori react
```
Satori is a project-local library, so `vcr doctor` does not probe it. Check the project dependency with `pnpm list satori` and use `vcr tools info satori` to inspect catalogue evidence.

## Smoke test
```sh
vcr example create satori-flex
cd examples/satori-flex && npm ci && ./run.sh
# expect: OK: satori-flex
```
Validated with Satori 0.63.2, React 19.2.0, and resvg 0.47.0 on macOS arm64. The fixture checks a 320×180 SVG layout, exact rectangle geometry, a stable SVG hash, and a same-size PNG.

## Recipes
```js
import { createElement as h } from "react";
import satori from "satori";

const svg = await satori(h("div", { style: { display: "flex", width: 320, height: 180 } }), {
  width: 320,
  height: 180,
  fonts: [],
});
```
Supply font data when rendering text; the fixture deliberately has no text or fonts. Keep the output as SVG or pass it to a separate rasterizer such as resvg.

## Troubleshooting
- Satori reports a missing font: provide the font data required by its docs for the text and weight being rendered.
- Layout differs from a browser: check the supported CSS subset; Satori is not a full CSS engine.

## Official docs
- [Satori documentation and CSS support](https://github.com/vercel/satori)
- [Satori v0.63.2 source](https://github.com/vercel/satori/tree/v0.63.2)
