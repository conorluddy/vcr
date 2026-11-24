---
name: ffmpeg-normalize
description: Normalise audio loudness to an EBU R128 integrated target with ffmpeg-normalize, a Python CLI over FFmpeg's loudnorm two-pass. Load when a mix or clip must hit a measured LUFS target; use FFmpeg directly to only measure or for custom filtergraphs.
---

# ffmpeg-normalize

A Python CLI that wraps FFmpeg's `loudnorm` filter: pass 1 measures, pass 2 applies the gain. It sits after the mix and before delivery; the `ffmpeg` guide still owns encode and mux.

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- Bring a finished audio file or the audio of a video to one integrated-loudness target, in batch, with presets.
- Which target and ceiling to use is policy, not this tool: take them from the sound and delivery pillars (`vcr rules info SOUND-LOUDNESS-INTEGRATED`, `SOUND-TRUE-PEAK`, `SOUND-LRA-SHORTFORM`) and the destination's spec. The fixture's -16 LUFS and -1.5 dBTP are parameters, not recommendations.
- Only measuring, or a custom filtergraph: use FFmpeg (`ebur128`, `loudnorm` directly). Manual mix decisions: a DAW.
- Evidence is narrow: EBU R128 linear two-pass on generated 440 Hz sine bursts, macOS arm64, ffmpeg-normalize 1.45.3 over FFmpeg 9.0.2, WAV output. No real speech or music, no other modes.
- The `ebur128` check uses the same FFmpeg build as `loudnorm`, so it is not an independent meter.

## Capability map
Official entry: [README](https://github.com/slhck/ffmpeg-normalize) and its docs (CLI options). Discovery only; run `ffmpeg-normalize --help` for the installed version.
- Tested: EBU R128 two-pass (`-nt ebu`), target `-t`, true-peak ceiling `-tp`, force overwrite `-f`, output `-o`, output sample rate `-ar`.
- Documented, untested: one-pass `--dynamic`; RMS and peak normalisation types; batch and album-style relative-level handling; video stream passthrough and per-stream selection; codec, container and metadata options; `--dual-mono`; multichannel; Python API.

## Install and doctor
```text
uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python ffmpeg-normalize==1.45.3
.venv/bin/ffmpeg-normalize --version     # needs FFmpeg on PATH
vcr doctor
```
Catalogue install line: `uv tool install ffmpeg-normalize`. The fixture installs into `examples/ffmpeg-normalize-loudness/output/venv` from the pinned `requirements.txt`. Never assume it is installed.

## Smoke test
```text
vcr example create ffmpeg-normalize-loudness   # then create the venv per README, from requirements.txt
(cd examples/ffmpeg-normalize-loudness && ./run.sh)
# expect: ffmpeg-normalize-loudness: OK
```
Needs `jq` and FFmpeg 9.0.2 (validated 2026-11-24).

## Recipe
```text
ffmpeg-normalize in.wav -nt ebu -t -16 -tp -1.5 -ar 48000 -f -o out.wav
ffmpeg -nostats -i out.wav -af ebur128=peak=true -f null - 2>&1 | tail -12   # I:, True peak, LRA:
```
Shown by the fixture: a -29.1 and a -10.7 LUFS input (LRA 1.8 LU each) both landed at -16.1 LUFS, within the 0.5 LU tolerance; true peak -11.4 dBTP, so the ceiling never acted as a limiter (untested whether it limits); LRA, 10.000 s duration and 48 kHz unchanged; reruns gave identical decoded PCM.

## Linear versus dynamic mode
Two-pass applies one linear gain only when `loudnorm` can. If the input's loudness range or true peak make linear impossible, it silently falls back to dynamic normalisation.
- Seen: a constant-level burst train (LRA 0) reverted to dynamic, and that output came back at 192000 Hz instead of 48000 Hz. The cause of the rate change was not isolated from the revert.
- Always pass `-ar` with the rate you deliver, and check the mode: a linear result leaves the output LRA equal to the input's (within 0.5 LU in the fixture); a changed LRA or a revert warning in the stats means dynamic mode ran.
- With a linear input (LRA 1.8 LU), default options also kept 48000 Hz; still set `-ar`.

## Troubleshooting
- Output at 192 kHz: dynamic mode ran. Set `-ar`, and fix the input or accept dynamic mode knowingly.
- Result misses the target: read the pass-1 stats for a revert; a constant-level input is the case seen.
- Loudness differs between tools: parser depends on FFmpeg's `ebur128` labels (`I:`, `True peak:`, `LRA:`); re-check after an FFmpeg upgrade.

## Official docs
- https://github.com/slhck/ffmpeg-normalize
- https://ffmpeg.org/ffmpeg-filters.html#loudnorm
- https://ffmpeg.org/ffmpeg-filters.html#ebur128-1
