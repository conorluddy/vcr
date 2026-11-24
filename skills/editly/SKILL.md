---
name: editly
description: "Unproven in VCR: Editly is a demoted declarative FFmpeg editor with a native headless-gl dependency and a stale npm release, so prefer ffmpeg, mlt-melt or opentimelineio for VCR edits."
---

# Editly (unproven)

Documentation-only, untested in VCR. Written from official docs; nothing here has been run, including the native headless-gl build.

## Status
- Demoted. Assessed 2026-10-26 (assess-a5), npm stable 0.14.2 (2022-12-23), GitHub 0.15.0-rc.1 (2025-01-19), last release 2025-01-19 (rc). Rationale: "Single maintainer, native headless-gl dependency. Adds little over FFmpeg filtergraphs plus VCR's own timeline."
- Not tested: no fixture, no evidence.
- Worth it for a quick slideshow or montage with transitions and title cards from one JSON5 spec, outside VCR's reviewed pipeline.

## Use cases and limits
- Node CLI and API: a JSON5 spec of clips, images, audio and titles; frames rendered via headless-gl and canvas, piped to `ffmpeg`. Output mp4, mkv or gif.
- Limits: ESM only; needs `ffmpeg` and `ffprobe` on PATH; headless-gl may fail to build on current Node and needs extra system packages on Linux; no alpha-aware layering or exact timing control; transitions default to `random`.
- Use instead: `ffmpeg` filtergraphs for composition (the VCR delivery path), `mlt-melt` for maintained melt-based edits, `opentimelineio` for edit lists, `playwright` capture for browser scenes.

## Capability map (official README, untested)
- Top level: `outPath`, `width`, `height`, `fps`, `fast`, `customOutputArgs`, `audioFilePath`, `audioTracks[]`, `keepSourceAudio`, `audioNorm`.
- `defaults`: `duration` (4 s), `transition` (0.5 s, `null` disables), `layer`, `layerType`.
- `clips[]` with `duration`, `transition`, `layers[]` (last on top). Layer types: `video`, `audio`, `image`, `image-overlay`, `title`, `subtitle`, `news-title`, `slide-in-text`, `fill-color`, `radial-gradient`, `linear-gradient`, `rainbow-colors`, `canvas`, `fabric`, `gl`.
- `resizeMode`: `contain`, `contain-blur`, `cover`, `stretch`. Ken Burns via `zoomDirection`, `zoomAmount`.

## Install
```text
npm i -g editly
editly --help
```
`editly --help` is the catalogue check command; not run here.

## Recipe (documentation-only, untested in VCR)
```text
# spec.json5
{ outPath: "out.mp4", width: 1280, height: 720, fps: 30,
  defaults: { transition: { name: "fade", duration: 0.5 } },
  clips: [
    { duration: 3, layers: [{ type: "image", path: "a.png" }, { type: "title", text: "Hello" }] },
    { duration: 3, layers: [{ type: "image", path: "b.png" }] },
  ] }
editly spec.json5 --fast
```
`--fast` lowers quality for previews. API: `import editly from "editly"; await editly(editSpec);`.

## Determinism concerns for VCR
- `canvas`, `fabric` and `gl` layers run user code per frame; make output a pure function of the time argument, no `Date.now()` or unseeded randomness.
- Random transitions: name every `transition.name` explicitly.
- Without `--fast`, output size and fps follow the first video; set `width`, `height`, `fps` explicitly.
- Probe the result with ffprobe before delivery; nothing is verified here.

## Licence
MIT.

## Official links
- https://github.com/mifi/editly
- https://www.npmjs.com/package/editly
