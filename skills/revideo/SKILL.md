---
name: revideo
description: Use Revideo (@revideo/* 0.11.0) to render a code-authored TypeScript scene headlessly to an H.264 MP4 with renderVideo, no editor. VCR evidence is partial and covers one small fixture on macOS arm64.
---

# Revideo

## Use cases and limits

- Revideo is a headless fork of Motion Canvas: same generator-based scene model, with `renderVideo()` in Node instead of the editor's Render button. Choose it when a scripted pipeline must turn a TypeScript scene into MP4 with no human in the loop. Choose `motion-canvas` when the editor and its PNG-sequence exporter are the workflow.
- Neighbours: native VCR capture for browser scenes; `ffmpeg-ffprobe` for probing and re-encoding. Per ADR 0001 Revideo is a reference, not the VCR engine.
- Motion is a pillar, not a tool property. The fixture tweens linearly to make position checkable; that is a test choice. Pick curves and timing from `references/motion-director/` (`MOTION-EASE-*`, `MOTION-TIME-*`) and record them in the motion spec.
- Evidence is partial: 0.11.0, macOS arm64, Node 22.19.0, Chrome 158, 320x180 H.264 yuv420p at 30 fps. Rect centre within 0.2 px of expected at 5 sampled frames; two renders on one host gave identical per-frame pixel hashes. The predeclared frame count (60) failed; see below. Nothing else is established.

## Capability map

Discovery only. Documented surface is at the [docs](https://docs.re.video/) and the [repository](https://github.com/midrender/revideo); the table says what the fixture touched.

| Area | Tested | Notes |
| --- | --- | --- |
| `renderVideo()` in `@revideo/renderer` | yes | Headless, offline, one project file, MP4 via `@revideo/core/ffmpeg` |
| Scenes (`makeScene2D`, `Rect`, `Txt`, tweens) in `@revideo/2d`, `@revideo/core` | yes, one scene | Position tween and a static text node |
| WebM, ProRes, wasm exporters | no | Documented, untested |
| `revideo render` CLI, HTTP render server | no | Untested |
| Editor / player (`@revideo/ui`), variables, audio, multi-worker | no | `@revideo/ui` is installed only because the renderer needs it; the output carries a silent AAC track |
| Other Chrome versions, hosts, OSes | no | |

## Install and doctor

The fixture is a workspace package: installs go through `pnpm install` at the repository root. There is no per-example `package-lock.json`. Direct dependencies, all exact 0.11.0: `@revideo/core`, `2d`, `renderer`, `vite-plugin`, `ui`.

- `@revideo/renderer` needs `@revideo/vite-plugin` and `@revideo/ui` at runtime but does not declare them; install both yourself.
- Renders use the installed Google Chrome through puppeteer (`CHROME_BIN`, default `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`). The fixture passes it as `puppeteer.executablePath`; no browser is downloaded.
- The bundled `@ffmpeg-installer` ffmpeg and `@ffprobe-installer` ffprobe can lose their execute bit when install scripts are skipped (`--ignore-scripts`, or pnpm's default); the bundled ffprobe failed with EACCES. Rebuild those packages or chmod the binaries; `run.sh` does the chmod.
- Set `DISABLE_TELEMETRY=true`; otherwise render events are sent to a third-party service.

`vcr doctor` checks only the catalogue's `npm ls @revideo/renderer --depth 0`; it proves nothing about rendering. Nothing is installed unless doctor says so.

## Smoke test

```bash
cd examples/revideo-headless-render && ./run.sh
```

```text
# expect: PASS codec h264, yuv420p, 320x180, 30/1; PASS rect x within 2 px at frames 0, 15, 30, 45, 59
# expect: FAIL frame count 60 (61 found), twice; PASS rerender 0 mismatched frames of 61; exit non-zero
```

The two failures are the recorded outcome: the predeclared count was wrong, and `expected/` is not written. The run starts a local Vite server (port 9000) and a headless Chrome.

## Scene and render contract

```ts
export default makeScene2D('main', function* (view) {   // name is required
  const rect = new Rect({width: 40, height: 40, fill: '#ff0000', x: -100});
  view.add(rect);
  yield* rect.position.x(100, 2, linear);
});
await renderVideo({
  projectFile: './src/project.ts',                         // leading ./ is required
  settings: {outDir, outFile: 'video.mp4',
    projectSettings: {exporter: {name: '@revideo/core/ffmpeg', options: {format: 'mp4'}}}},
});
```

- **Frame count is inclusive.** `range: [0, 2]` at 30 fps rendered 61 frames (0 to 60). Plan counts as duration x fps + 1.
- Write scene motion as a pure function of scene time (tweens, no wall clock or unseeded randomness); that is what made two renders hash-identical here. Determinism is shown for one host only.
- Keep durations in the motion spec and in the scene in step; the example's duration constants exist so the plan and the scene cannot drift.
- Check output by decoding frames and measuring, as the fixture does (ffprobe facts, RGB24 decode, colour-centroid of the mover), not by file hash alone.

## Troubleshooting

- Vite import-analysis error on the project file: use `./src/project.ts`, not `src/project.ts`.
- "Cannot read properties of undefined (reading 'name')": pass a name as the first argument of `makeScene2D`.
- Render fails to resolve `@revideo/vite-plugin` or `@revideo/ui`: add both at the same exact version.
- EACCES running ffprobe: restore execute permission on the bundled ffmpeg and ffprobe.
- "Input format lavfi is not available": do not point the renderer at a Homebrew ffmpeg 9; the bundled 4.4 build worked.
- Frame count one higher than planned: see the inclusive end frame above.

## Official docs

- [Revideo docs](https://docs.re.video/)
- [Repository and README](https://github.com/midrender/revideo)
