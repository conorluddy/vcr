---
name: omakase-player
description: Use Omakase Player (@byomakase/omakase-player 1.3.1) in a browser page to load an MP4 and seek it by frame index, headless in Playwright Chromium. Load when a review page or a frame-exact check needs this player; for scene capture use playwright.
---

# Omakase Player

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- A person-facing review player: jump to an exact frame or timecode of a render, and (documented, untested) show markers and a timeline. It is a candidate base for the plugin PRD P3 review pages.
- It plays video; it does not render or capture scenes. Use `playwright` for deterministic capture and `mediabunny` or `ffmpeg-ffprobe` to inspect frames in code.
- VCR evidence: one plain H.264 MP4, `CHROMELESS` theme, Chromium 156 on macOS arm64. Everything else is untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `loadMainMedia(url)` for MP4 | [OmakasePlayerApi](https://api.player.byomakase.org/interfaces/OmakasePlayerApi.html) | tested |
| `player.seekTo(value, MediaTemporalFormat.FRAME_COUNT)`, `getCurrentTime(format)` | [PlayerApi](https://api.player.byomakase.org/interfaces/PlayerApi.html) | tested |
| Seek by seconds, timecode, percent | [PlayerApi](https://api.player.byomakase.org/interfaces/PlayerApi.html) | untested |
| HLS via hls.js, sidecar players | [README](https://github.com/byomakase/omakase-player#readme) | untested |
| Multi-track timeline, marker lists, cut lists | [TimelineApi](https://api.player.byomakase.org/interfaces/TimelineApi.html) | untested |
| Chroming themes, control bar, VU meter | [ChromingApi](https://api.player.byomakase.org/interfaces/ChromingApi.html) | only CHROMELESS |

## Install and doctor
```sh
pnpm add @byomakase/omakase-player@1.3.1 rxjs esbuild
```
A project-local library: `vcr doctor` does not probe it. Needs the workspace Playwright Chromium.

## Smoke test
```sh
cd examples/omakase-frame-seek && ./run.sh
# expect: omakase-frame-seek: OK
```
Generates a 120-frame MP4 with a frame-number barcode, makes 14 non-monotonic frame seeks, screenshots the `<video>` and decodes each barcode against the requested frame.

## Page contract
```ts
const player = new OmakasePlayer({ playerHtmlElementId: "player", chromingTheme: ChromingTheme.CHROMELESS });
await firstValueFrom(player.loadMainMedia(mp4Url));
await firstValueFrom(player.player.seekTo(60, MediaTemporalFormat.FRAME_COUNT));
player.player.getCurrentTime(MediaTemporalFormat.FRAME_COUNT); // 60
```
- Methods return RxJS observables; wrap with `firstValueFrom` (add `rxjs` yourself under pnpm).
- Link `dist/omakase-player.css` on the page. Without it the `<video>` is 0x0 and cannot be screenshotted ("element is not visible").
- Bundle with esbuild (`bundle`, `format: esm`, `target: esnext`); the package is about 19 MB unpacked.
- Serve the MP4 over HTTP with Range support; a `file://` URL was not tried.
- Frame rate was detected for the MP4 without `loadOptions`, but `media.frameRateModel.frameRate` read as undefined; do not rely on that property.
- The fixture waits 150 ms after the seek resolves before screenshotting. Whether the paint is complete without that wait is unproven.

## Troubleshooting
- Screenshot times out "element is not visible": the stylesheet is missing.
- `pnpm install` fetches `smp-imsc` from GitHub (bbc/imscJS); needs network.

## Official docs
- [Repository and README](https://github.com/byomakase/omakase-player)
- [API reference](https://api.player.byomakase.org)
- [npm](https://www.npmjs.com/package/@byomakase/omakase-player)
