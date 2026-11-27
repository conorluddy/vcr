---
name: imscjs
description: Draw IMSC/TTML captions at any time offset in a seek-driven browser scene with imscJS (imsc 2.0.0), then capture frames with alpha. Load once imscJS has been chosen for caption rendering from a TTML document.
---

# imscJS

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Renders an IMSC/TTML document the way an IMSC player lays it out (regions, styles, overlap), as HTML and CSS inside a browser scene. Because `generateISD` takes any offset, a scene seeks to a frame time with no playback clock.
- It draws only. Convert formats with `ttconv`; check line length, duration and overlap with `caption-checker`; burn SRT or ASS into video with `ffmpeg-ffprobe` or `libass`.
- VCR evidence covers one IMSC1 text document, no roll-up, in Playwright Chromium on macOS arm64. Everything else is marked untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `fromXML`, `getMediaTimeEvents` | [README API](https://github.com/sandflow/imscJS#api) | tested |
| `generateISD(tt, offset)` | [README API](https://github.com/sandflow/imscJS#api) | tested |
| `renderHTML` regions, colour, italic, line breaks, overlap | [README API](https://github.com/sandflow/imscJS#api) | tested |
| Roll-up (`enableRollUp`, `previousISDState`) | [README API](https://github.com/sandflow/imscJS#api) | untested |
| Forced display, image subtitles (`smpte:background`) | [README API](https://github.com/sandflow/imscJS#api) | untested |
| Node use with a supplied XML parser and DOM | [README](https://github.com/sandflow/imscJS#readme) | untested |

## Install and doctor
```sh
pnpm add imsc@2.0.0
```
A project-local library: `vcr doctor` does not probe it. Capture needs the workspace Playwright Chromium.

## Smoke test
```sh
cd examples/imscjs-seek-render && ./run.sh
# expect: imscjs-seek-render: OK
```
Captures 60 frames at 640x360 with alpha, then checks the ISD events, caption pixels present or absent at chosen frames and shuffled-equals-sequential against `expected/summary.json`.

## Scene contract
```html
<script src="node_modules/imsc/dist/imsc.all.min.js"></script>
<script>
  const parsed = imsc.fromXML(ttmlString, (message) => { throw new Error(message); });
  window.__scene = {
    duration: 6,
    seek(seconds) {
      stage.replaceChildren();
      const isd = imsc.generateISD(parsed, seconds, onError);
      imsc.renderHTML(isd, stage, null, 360, 640, false, onError, null, false);
    },
  };
</script>
```
- Use the UMD `dist/imsc.all.min.js` (global `imsc`).
- Clear the stage before each render: `renderHTML` appends a new `div`.
- Pass `previousISDState` as `null` and roll-up as `false`, so each seek depends only on `t`.
- Give `eheight` and `ewidth` explicitly so the layout does not depend on the page size.
- `fromXML(...).getMediaTimeEvents()` lists the times where the picture changes, useful for choosing check frames.
- Throw from the error callbacks so a bad document fails the capture.

## Fonts
Text uses `tts:fontFamily="sansSerif"`, which resolves through Chromium to a system font. Frames are identical across runs on one machine, but pixels are not portable; pin a font with a loaded `@font-face` when output must match elsewhere (untested).

## Troubleshooting
- No failures were seen in the fixture.

## Official docs
- [imscJS repository and API](https://github.com/sandflow/imscJS)
- [imsc on npm](https://www.npmjs.com/package/imsc)
