---
name: mediarecorder
description: "Unproven in VCR: MediaRecorder is demoted (real-time, not frame-accurate); prefer canvas-record, webcodecs or the Playwright capture route into ffmpeg for renders."
---

# MediaRecorder (unproven)

Written from official docs only. No VCR fixture has run it; every recipe below is documentation-only, untested in VCR.

## Status
Demoted. Assessment rationale: "Chrome 47+ and widely available per MDN, but real-time only. WebCodecs plus ffmpeg cover VCR's deterministic capture with more control, so incremental value is low." Not tested. Might still be worth it for a quick real-time preview of a canvas scene, or for microphone or tab audio that cannot be rendered offline.

## Use cases and limits
- Records a `MediaStream` (`canvas.captureStream()`, tab, microphone) into `Blob` chunks in a browser-chosen container and codec.
- Runs on the wall clock. Slow frames are dropped or duplicated, so output depends on real time, not on `t`. This is the opposite of VCR's seek-driven capture (`window.__scene.seek(t)`, frames in any order).
- Container and codec support in headless Chromium is unchecked; call `MediaRecorder.isTypeSupported(mime)` at runtime.

## Prefer instead
- `skills/canvas-record/SKILL.md` for frame-exact export of a canvas the scene redraws on demand.
- `skills/webcodecs/SKILL.md` for controlled codec, bitrate and keyframes.
- `skills/playwright/SKILL.md` plus `skills/ffmpeg/SKILL.md` for per-frame screenshots encoded offline (the standard VCR route).
- `skills/web-audio/SKILL.md` (OfflineAudioContext) for generated audio.

## Install route
Nothing to install; a browser platform API (`installation_status` is `not-applicable`). Capture-browser setup is `vcr setup capture --yes` and `vcr doctor`.

## Surface (from MDN, unverified in VCR)
- `new MediaRecorder(stream, { mimeType, videoBitsPerSecond, audioBitsPerSecond })`
- `start(timesliceMs?)`, `stop()`, `pause()`, `resume()`, `requestData()`, `state`
- Events: `dataavailable` (`event.data` is a Blob), `stop`, `error`
- `MediaRecorder.isTypeSupported(mimeType)`
- `canvas.captureStream(frameRate?)`; `CanvasCaptureMediaStreamTrack.requestFrame()` when `frameRate` is 0 pushes a frame on demand, but frame-exact timestamps in the recording are not promised (unverified).

## Recipe (documentation-only, untested in VCR)
```js
const stream = canvas.captureStream(30);
const mime = ["video/webm;codecs=vp9", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m));
if (!mime) throw new Error("No supported MediaRecorder mime type");
const chunks = [];
const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => { window.__blob = new Blob(chunks, { type: mime }); };
recorder.start();
```
Let the scene play in real time, then `recorder.stop()`. Expect timing jitter; do not rely on alpha in the output (unverified).

## Licence
Web platform API; no separate licence. Check codec patent terms for H.264 output.

## Official docs
- https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
- https://www.w3.org/TR/mediastream-recording/
