---
name: gpac
description: Package an MP4 for adaptive streaming with GPAC's MP4Box (DASH segments and MPD, WebVTT track, chapters, box-level info). Load when an MP4 needs fragmenting or inspection beyond FFmpeg; use FFmpeg to encode and for the source media.
---

# gpac (MP4Box)

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- Tested: MP4Box 26.07-revrelease (Homebrew), macOS arm64. From a generated ffmpeg MP4 (10 s, 25 fps, keyframe every 25 frames, AAC), MP4Box adds a WebVTT track (`-add subs.vtt:lang=en`) and chapters (`-chap`), then `-dash 4000 -frag 4000 -rap -profile live` gives 3 segments per track: video 100/100/50 packets (4, 4, 2 s), MPD `maxSegmentDuration` PT4S.
- Not byte-reproducible: `base.mp4` and the init segments differ between runs because the tracks' modification time is the wall clock (`-time` and `-mtime` pin creation times only). `.m4s` segments and the MPD (apart from its generated-at comment) were identical. Hash the segments, not the container.
- `MP4Box -dash` with three `file#track` inputs aborted (exit 133/134) in about 1 run in 5. Retry from a clean output directory.
- FFmpeg encodes and makes the source; mediainfo reports. Use `ffmpeg-ffprobe` to check results.
- Not tested: HLS, CENC encryption, multi-bitrate sets, the `gpac` filter CLI, players, other OS or versions.

## Capability map
Entry points: [wiki](https://wiki.gpac.io), [MP4Box docs](https://wiki.gpac.io/MP4Box/MP4Box-doc/), [repository](https://github.com/gpac/gpac).
- `MP4Box -add / -new / -chap / -time`: build files, tracks, chapters (tested).
- `MP4Box -dash / -frag / -rap / -segment-name`: DASH and CMAF segmenting (tested).
- `MP4Box -info / -diso`: track and box dumps (`-info` tested).
- HLS output, encryption, `gpac` filter graphs (untested).

## Install and doctor
`brew install gpac` (provides `MP4Box` and `gpac`), then `MP4Box -version`. `vcr doctor` is not guaranteed to list it.

## Smoke test
```sh
examples/gpac-cmaf-dash/run.sh
# expect: KNOWN FAIL: not byte-identical across runs (MP4 timestamps); differing files: ["base.mp4","seg_a_.mp4","seg_t_.mp4","seg_v_.mp4"]
# expect: gpac-cmaf-dash: OK (MP4Box - GPAC version 26.07-revrelease)
```
It exits 1 with `brew install gpac` in the message if MP4Box is missing.

## Recipes
```sh
MP4Box -quiet -add src.mp4 -add subs.vtt:lang=en -chap chapters.txt -new base.mp4
MP4Box -quiet -dash 4000 -frag 4000 -rap -profile live -segment-name 'seg_$RepresentationID$_$Number$' \
  -out manifest.mpd base.mp4#video:id=v base.mp4#audio:id=a base.mp4#trackID=3:id=t
```
Without `#video` and `#audio` selectors the tracks end up in one muxed representation. Chapter files are `h:m:s.ms name`, one per line. `-quiet` still leaves progress noise; redirect output.

## Troubleshooting
- Aborts with no output: the intermittent `-dash` crash above; rerun.
- Rerun hashes differ: modification time in `moov`/`tkhd`; compare segments instead.

## Official docs
- https://wiki.gpac.io/MP4Box/MP4Box-doc/ and https://wiki.gpac.io/
