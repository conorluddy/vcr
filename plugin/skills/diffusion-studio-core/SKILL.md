---
name: diffusion-studio-core
description: "Unproven in VCR: Diffusion Studio Core is a demoted browser WebCodecs timeline engine with watermarked free output, so prefer mediabunny, webcodecs and ffmpeg for VCR work."
---

# Diffusion Studio Core (unproven)

Documentation-only, untested in VCR. Written from official docs; nothing here has been run. Do not treat any recipe as proven.

## Status
- Demoted. Assessed 2026-10-26 (assess-a5), npm 4.0.3, last release 2025-11-30, last push 2025-11-18. Rationale: "Browser-only ... nearly a year idle. Output watermarked without a paid key. Mediabunny covers I/O; FFmpeg covers composition."
- Not tested: no fixture, no evidence, `installation_status` unknown.
- Worth a look only for an in-browser editor UI that needs a ready timeline model and client-side export, or as a reference design for a WebCodecs layer compositor.
- Version numbering differs by source: GitHub latest release tag v1.1.1 (2024-10) versus npm 4.0.3. Check which one you install.

## Use cases and limits
- What it is: a TypeScript browser video composition engine (layers, clips, transitions, effects, keyframes, masks, captions), WebCodecs for decode and encode, Canvas 2D drawing, built on Mediabunny.
- Limits: browser only, needs COOP/COEP headers, free renders carry a "Made with Diffusion Studio" watermark.
- Use instead: `mediabunny` and `webcodecs` for browser media I/O; `ffmpeg` filtergraphs for composition and alpha; `canvas-2d` plus `playwright` capture for scenes.

## Capability map (official README, untested)
- `Composition` is the root; `Layer` (mode `SEQUENTIAL` plays clips in order) holds clips.
- Clips: `VideoClip`, `ImageClip`, `TextClip`, `RectangleClip`; sources via `Source.from()`.
- Per-clip: transitions (`{ duration, type: 'dissolve' }`), masks (`RectangleMask`), keyframe `animations`, effects.
- Encoder, seek and time APIs are not in the README; see https://docs.diffusion.studio (not read).

## Install
```text
pnpm add @diffusionstudio/core
```
No `vcr doctor` check exists for it. Serve pages with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless`.

## Recipe (documentation-only, untested in VCR)
```ts
import * as core from "@diffusionstudio/core";
const composition = new core.Composition();
const source = await core.Source.from<core.VideoSource>("/intro.webm");
const layer = await composition.add(new core.Layer({ mode: "SEQUENTIAL" }));
await layer.add(new core.VideoClip(source, { range: [2, 8], transition: { duration: 1, type: "dissolve" } }));
```

## Determinism and seek concerns for VCR capture
- It targets realtime playback and its own export. VCR needs `window.__scene = { duration, seek }` as a pure function of `t`; whether a composition can be seeked to an exact time and drawn synchronously is unconfirmed. Check the docs for a seek or frame-render method before trying.
- WebCodecs video decode is asynchronous and may differ across seeks; verify with `vcr capture --verify` (shuffled equals sequential) if ever tested.
- Do not capture its realtime playback; drive it from seek time or use its export instead.

## Licence
MPL-2.0 source. Free use requires the watermark to stay; a one-time paid licence key removes it (verified locally, no server). Keys cannot be shared across organisations.

## Official links
- https://github.com/diffusionstudio/core
- https://www.npmjs.com/package/@diffusionstudio/core
- https://docs.diffusion.studio
