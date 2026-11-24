---
name: claude-real-video
description: Pull one keyframe per detected shot from a local video with claude-real-video's scene gate, for compact visual evidence in a review packet. Load for shot-start stills from a local file; for cut frame numbers use PySceneDetect, for exact frame extraction use FFmpeg.
---

# claude-real-video

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use it to turn a local clip into a few shot-start stills (plus a transcript, untested) so a reviewer sees structure without watching. The stills feed a `pacing-editor` review of cut and beat lengths (`PACE-BEAT-01`, `PACE-BEAT-02`); judging them is that pillar's job, not this tool's. Rule thresholds live in the pacing reference, not here.
- VCR validates 0.10.7 on macOS arm64 (Python 3.12.2, ffmpeg 9.0.2) against a generated 144-frame, 24 fps, 320x240 clip of three hard-cut shots. The scene gate (ffmpeg `gt(scene,0.30)`) gave keyframes at frames 0, 48 and 96, 0 frames off the authored cuts; three 320x240 JPEGs, one per shot; reruns gave identical `frames.json`. The run also passed under a deny-network sandbox.
- Not established: the default output (the run used `--fps-floor 1000`, which disables the one-frame-per-second density floor, so the default adds frames and is untested), fades, dissolves, camera motion, real footage, other thresholds, dedup (nothing was deduped), transcripts, URL download, speaker labelling, memory or MCP use.
- Neighbours: PySceneDetect when the product is cut frame numbers or scene lists (`pyscenedetect`); FFmpeg when you need exact, controlled frame extraction (`ffmpeg`).
- Install pulls yt-dlp, deno and requests for URL ingestion. Those network paths are untested; do not point them at private material without review. Pass a local file only.

## Capability map
Discovery only; the [README](https://github.com/HUANGCHIHHUNGLeo/claude-real-video) is the reference.
- Tested: local file input, `--no-transcribe`, `--scene`, `--fps-floor`, `--frame-width`, `--overwrite`; output `frames.json` plus `frames/frame_*.jpg`.
- Documented, untested: URL input, transcription (whisper family), `--speakers` (downloads models), `--adaptive`, `--text-anchors`, `--export llc`, `--viewer`, `--grid` contact sheets, `--report`, analysis time windows, memory index and `crv-ask`, MCP server.

## Install and doctor
Venv under the example output, nothing global:
```text
python3 -m venv examples/claude-real-video-keyframes/output/venv
examples/claude-real-video-keyframes/output/venv/bin/python -m pip install claude-real-video==0.10.7
vcr doctor
```
Requires Python 3.10+ and ffmpeg/ffprobe on PATH. The fixture sets `CRV_NO_MEMORY=1 CRV_NO_HINT=1` to keep the local memory index and upgrade hint off.

## Smoke test
```text
vcr example create claude-real-video-keyframes
cd examples/claude-real-video-keyframes && ./run.sh
# expect: claude-real-video-keyframes: OK
```
The core call is `claude-real-video clip.mp4 -o out --no-transcribe --scene 0.30 --fps-floor 1000 --frame-width 320`. Keyframe frame index is `round(timestamp_sec * fps)` from `frames.json`; the check allows ±1 frame. Selection reasons recorded were `first`, `global`, `global`; `global` names the dedup channel, not the scene gate, so use timestamps as boundary evidence.

## Troubleshooting
- Clip generation fails with `d=2` on `mandelbrot`: give each lavfi input `-t 2` instead.
- More frames than shots: the default density floor adds periodic frames; this was not tested, so set `--fps-floor` high on purpose and record that you did.
- Keyframe size differs from the source: set `--frame-width` to the source width.
- Boundaries off: inspect the clip first; the scene threshold is the only tested knob, at one value.

## Official docs
- [claude-real-video repository](https://github.com/HUANGCHIHHUNGLeo/claude-real-video)
- [Releases](https://github.com/HUANGCHIHHUNGLeo/claude-real-video/releases)
