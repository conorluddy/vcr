---
name: svg-js
description: Use SVG.js 3.2 to construct or manipulate SVG elements with its chainable JavaScript API. Load when a browser or svgdom workflow needs scripted vector creation; use a separate seekable animation system for VCR motion.
---

# SVG.js

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Build SVG shapes, paths, text, groups, gradients, transforms and attributes from JavaScript; output is an SVG DOM or serialized SVG, not a rendered video.
- In VCR browser scenes, set every visual attribute from the requested time in `window.__scene.seek(t)`. The built-in `.animate()` runner uses its own real-time clock and is not seekable. Use Anime.js for timeline-driven VCR animation; use D3 for data-driven scales and layouts.
- Node use requires an SVG DOM implementation such as svgdom; this combination was not validated here.

## Capability map

The official v3.2 docs describe the following surface. **VCR exercised:** browser construction and time-derived mutation of shapes, a path, a group transform and a linear gradient. **Documented, not VCR-tested:** the other areas below, including SVG.js animation.

| Area | Official reference | VCR evidence |
| --- | --- | --- |
| Installation and browser/Node setup | [Installation](https://svgjs.dev/docs/3.2/installation/) | Browser package in fixture; Node/svgdom untested |
| Shapes, paths, text and gradients | [Shape elements](https://svgjs.dev/docs/3.2/shape-elements/) | Rect, circle, path and linear gradient |
| Groups, defs, symbols and use | [Container elements](https://svgjs.dev/docs/3.2/container-elements/) | Group exercised; other containers untested |
| Attributes, styling, transforms and geometry | [Manipulating](https://svgjs.dev/docs/3.2/manipulating/) | Selected transforms and geometry setters |
| Events and coordinate conversion | [Events](https://svgjs.dev/docs/3.2/events/) | Untested |
| Built-in animation timeline and runner | [Animating](https://svgjs.dev/docs/3.2/animating/) | Untested and unsuitable for seek-driven VCR animation |
| Extensions | [Plugins](https://svgjs.dev/docs/3.2/plugins/) | Untested |

## Install and doctor

```sh
pnpm add @svgdotjs/svg.js
vcr doctor
```

Install the package in the selected workspace. `vcr doctor` reports machine tool availability where it has a check; it does not certify SVG.js behavior. The fixture pinned 3.2.8.

## Smoke test

Create the validated fixture with `vcr example create svgjs-capture`; change to the destination it prints, then run:

```sh
pnpm install
./run.sh
# expect: svgjs-capture: OK
```

Evidence: 90 distinct 1280×720 alpha frames at 30 fps; shuffled capture hashes matched sequential capture. Validated on macOS arm64 with SVG.js 3.2.8, Node 22.19.0, Playwright 1.64.1 and Chromium 156.0.8078.4. This covers one browser scene and selected SVG operations only, not output quality generally, other platforms, Node/svgdom, interaction, export, or the animation runner.

## Troubleshooting
- Capture reports mismatched shuffled frames: compute every visual attribute absolutely from `t` on every seek; do not rely on prior frame state or the `.animate()` runner.
- Node cannot create SVG elements: install and configure a DOM implementation such as svgdom. That route is documented as a possibility but unvalidated with SVG.js 3.2.8 in VCR.

## Official docs

[SVG.js v3.2 documentation](https://svgjs.dev/docs/3.2/) · [GitHub repository](https://github.com/svgdotjs/svg.js)
