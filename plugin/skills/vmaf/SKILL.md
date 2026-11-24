---
name: vmaf
description: Score an encode against its source with Netflix VMAF through FFmpeg's libvmaf filter, pooled and per frame as JSON. Load when a delivery or re-encode check needs a full-reference quality number; not for banding, stream metadata or aesthetic judgement.
---

# VMAF via FFmpeg libvmaf

Full-reference perceptual score of a distorted clip against its reference. The VCR evidence covers the FFmpeg `libvmaf` filter only (libvmaf 3.2.0, FFmpeg 9.0.2, model `vmaf_v0.6.1`, `pool=mean`, macOS arm64). The `vmaf` CLI and other models are untested.

## Use cases and limits
- Compare an encode to its master after a simulated re-encode, as supporting evidence for `DELIVERY-REENCODE-PREVIEW`; the score locates and ranks damage, a person still reviews it in motion.
- Compare encodes of the same piece with each other. A score is not an absolute pass mark and is not a subjective claim.
- Not a banding gate: see `DELIVERY-BANDING` (use CAMBI). Reliability on flat graphics, text and animation is unproven here; see `DELIVERY-SOFTNESS` for the softness check.
- Both clips must be frame-aligned and the same size and rate. Alignment, scaling, HDR, 10-bit and audio were not tested.
- Stream metadata without a reference: use `ffprobe` (the `ffmpeg` guide). Encoding: the `ffmpeg` guide.

## Capability map
Discovery only; documented does not mean validated.
- Filter route: FFmpeg `libvmaf` filter, needs a build with `--enable-libvmaf` ([FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html#libvmaf), [Netflix ffmpeg.md](https://github.com/Netflix/vmaf/blob/master/resource/doc/ffmpeg.md)). Tested: `model=version=vmaf_v0.6.1`, `pool=mean`, `log_fmt=json`, `log_path`.
- Untested filter options: other models, extra features (for example CAMBI), `n_threads`, `n_subsample`, other log formats.
- `vmaf` CLI ([tools README](https://github.com/Netflix/vmaf/blob/master/libvmaf/tools/README.md)): untested.
- C and Python libraries ([repository](https://github.com/Netflix/vmaf)): untested.

## Install and doctor
```text
ffmpeg -hide_banner -filters | grep libvmaf   # must list libvmaf
vcr doctor
```
Install route is unconfirmed: you need FFmpeg built with `--enable-libvmaf`. Validated with Homebrew FFmpeg 9.0.2 (2026-11-24); the JSON self-reports libvmaf 3.2.0.

## Smoke test
```text
vcr example create vmaf-ffmpeg-score && (cd examples/vmaf-ffmpeg-score && ./run.sh)
# expect: vmaf-ffmpeg-score: OK
```
Recorded sample (48-frame generated 320x180 clip): 99.946 against itself, 71.822 against a 60 kbit/s encode.

## Score two clips
```text
ffmpeg -hide_banner -loglevel error -i distorted.mp4 -i reference.mp4 \
  -lavfi "[0:v][1:v]libvmaf=model=version=vmaf_v0.6.1:pool=mean:log_fmt=json:log_path=score.json" -f null -
jq '.pooled_metrics.vmaf.mean' score.json
jq '.frames | length' score.json     # per-frame scores: .frames[].metrics.vmaf
```
- Input order matters: distorted first, reference second.
- Scoring a clip against itself gave a pooled 99.946, with frame 0 at 97.43 and the rest 100.0. Read the pooled mean, not frame 0.

## Determinism
- Scoring the same two files twice gave equal JSON except the `fps` field, which is wall-clock speed. Strip it before diffing: `jq -S 'del(.fps)'`.
- Gotcha the fixture found: a multi-threaded x264 encode is not deterministic at low bitrate. Three encodes of the same input decoded to three different streams, so the degraded score drifted between runs (67.697, then 65.778). Make the degraded encode single-threaded:
```text
ffmpeg -i reference.mp4 -threads 1 -c:v libx264 -b:v 60k -maxrate 60k -bufsize 60k -pix_fmt yuv420p \
  -x264-params threads=1:lookahead_threads=1:sliced_threads=0 degraded.mp4
```
- This was shown only for x264 with `-threads 1`; other encoders and settings are untested. Encode hashes are host-specific; compare scores to a tolerance across machines.

## Troubleshooting
- `No such filter: 'libvmaf'`: the FFmpeg build lacks `--enable-libvmaf`.
- Score differs between runs of the same command: the encode is multi-threaded; see Determinism.
- Rerun diff fails on `fps` only: expected; exclude that field.
- A low score on a clip you expect to match: check frame alignment, size and frame rate first.

## Official docs
https://github.com/Netflix/vmaf · https://github.com/Netflix/vmaf/blob/master/resource/doc/ffmpeg.md · https://ffmpeg.org/ffmpeg-filters.html#libvmaf
