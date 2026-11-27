---
name: opensheetmusicdisplay
description: Engrave MusicXML to SVG sheet music in Node with OpenSheetMusicDisplay, jsdom and a canvas package, then rasterise with resvg or use the note classes in a scene. Load once OSMD has been chosen for a score layer.
---

# OpenSheetMusicDisplay

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- One MusicXML score in, one SVG out. Noteheads, stems, clefs and barlines are `<path>` or `<rect>`; titles, lyrics, part names and measure numbers are `<text font-family="Times New Roman">`, so they depend on installed fonts.
- It makes a still. To animate, treat the SVG as a layer in a browser scene (`svg`, `anime-js`) and target the note classes (untested).
- Reading or writing symbolic music without drawing: `music21`, `mido`. Simple bars or a piano roll: draw with `svg`.
- VCR evidence covers one 4-bar melody, the SVG backend under jsdom, macOS arm64, Node 22. The rest is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `OpenSheetMusicDisplay` class: `load`, `render`, options | [docs](https://opensheetmusicdisplay.org/) | tested (`backend: 'svg'`, `drawTitle`) |
| MusicXML input (plain `.xml`) | [repository](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay) | tested; compressed `.mxl` untested |
| Lyrics, title, part labels | [repository](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay) | tested |
| Canvas backend, headless PNG script | [repository test scripts](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/tree/develop/test) | untested |
| Cursor and playback following | [docs](https://opensheetmusicdisplay.org/) | untested |
| Chromium rendering, multi-page layout, zoom, colouring options | [docs](https://opensheetmusicdisplay.org/) | untested |

## Install and doctor
```sh
pnpm add opensheetmusicdisplay@3.0.0 jsdom@27.0.0 @napi-rs/canvas@1.2.1
```
A project-local library: `vcr doctor` does not probe it. `@napi-rs/canvas` ships prebuilt binaries; the plain `canvas` package was blocked by pnpm's ignored build scripts.

## Smoke test
```sh
cd examples/osmd-musicxml-svg && ./run.sh
# expect: OK: osmd-musicxml-svg
```
Renders twice in separate processes and requires identical bytes, then diffs structure counts against `expected/metrics.json` and checks an 1800x696 resvg PNG.

## Recipe: MusicXML to SVG in Node
```js
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { createCanvas } from '@napi-rs/canvas';

const dom = new JSDOM('<!DOCTYPE html><body><div id="score"></div></body>', { pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
Object.assign(globalThis, { Node: dom.window.Node, HTMLElement: dom.window.HTMLElement,
  DOMParser: dom.window.DOMParser, XMLSerializer: dom.window.XMLSerializer });
const measuring = createCanvas(1, 1);
dom.window.HTMLCanvasElement.prototype.getContext = (type) => measuring.getContext(type);

const container = document.getElementById('score');
Object.defineProperty(container, 'offsetWidth', { value: 900 });   // layout width
Object.defineProperty(container, 'clientWidth', { value: 900 });
const { default: { OpenSheetMusicDisplay } } = await import('opensheetmusicdisplay');
const osmd = new OpenSheetMusicDisplay(container, { backend: 'svg', autoResize: false, drawTitle: true });
await osmd.load(readFileSync('score.musicxml', 'utf8'));
osmd.render();
const svg = container.querySelector('svg');
svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');   // needed outside HTML
```
- Set the globals before the dynamic `import`; the bundle reads `window` at load.
- The package is CJS: ESM gets `default.OpenSheetMusicDisplay`, not a named export.
- jsdom has no canvas; without the `getContext` patch OSMD logs "Not implemented" and fails.
- The SVG width is the container width you faked; height follows the layout.

## Scene hooks (tested only as classes in the output)
Each note is `<g class="vf-stavenote">` with a `vf-notehead` inside; also `vf-measure`, `vf-stave`, `vf-clef`, `vf-timesignature`, `vf-stem`, `vf-ledgers`. A rest is a `vf-stavenote` too. Styling them in a scene is untested.

```sh
resvg --width 1800 --background white score.svg score.png
```

## Troubleshooting
- `OpenSheetMusicDisplay is not a constructor`: use the default-export destructure above.
- `Not implemented: HTMLCanvasElement's getContext()`: install `@napi-rs/canvas` and patch the prototype.
- Lyrics render in a fallback font in resvg: the SVG names Times New Roman. Install it or accept the fallback; text layout was measured with the canvas package's default font, so spacing can differ on another machine (byte identity was tested on one machine only).

## Official docs
- [OpenSheetMusicDisplay](https://opensheetmusicdisplay.org/)
- [Repository](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay)
- [npm package](https://www.npmjs.com/package/opensheetmusicdisplay)
