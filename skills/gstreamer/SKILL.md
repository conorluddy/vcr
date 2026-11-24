---
name: gstreamer
description: Run a headless GStreamer gst-launch-1.0 pipeline that encodes a generated source to H.264 MP4, and verify it with ffprobe, gst-discoverer-1.0 and framemd5. Load when an element graph or live/streaming-style pipeline fits; for file transcodes use FFmpeg.
---

# GStreamer (gst-launch-1.0)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Pipeline-graph model: elements (sources, converters, overlays, encoders, muxers, sinks) linked with `!`. It fits element graphs and live or streaming-style pipelines (RTP, capture devices, appsrc/appsink hand-off). Those routes are documented, not tested here.
- Tested: one sequential, headless encode, `videotestsrc` to H.264 MP4. For offline file transcodes, trims, muxes and filtergraphs use `ffmpeg`; it is simpler and is the delivery path.
- Evidence is partial: macOS arm64, GStreamer 1.28.9 (Homebrew), 2026-11-24. No alpha, no audio, no hardware encoders, no quality measurement.
- Licence: framework LGPL-2.1, but `x264enc` lives in the GPL "ugly" plugin set. Licence clearance is not settled by the fixture. `openh264enc` is absent in this install, so x264 is the only tested H.264 encoder.

## Capability map
Discovery only; documented does not mean validated.
- Tools: `gst-launch-1.0` (build and run a pipeline from text), `gst-inspect-1.0` (list elements and properties), `gst-discoverer-1.0` (media facts) ([tools](https://gstreamer.freedesktop.org/documentation/tools/index.html)).
- Plugin sets: base, good, bad, ugly, libav ([plugin reference](https://gstreamer.freedesktop.org/documentation/plugins_doc.html)).
- APIs: C and bindings (Python, Rust) for building the same graphs in code ([application development](https://gstreamer.freedesktop.org/documentation/application-development/index.html)).
- Tested by the fixture: `videotestsrc`, caps filters, `videoconvert`, `timeoverlay`, `x264enc`, `h264parse`, `mp4mux`, `filesink`, `-e` EOS handling.
- Untested: RTP/WebRTC, capture devices, appsrc/appsink, hardware encoders (VideoToolbox), `vp8enc`/`webmmux`, audio, compositors, bindings.

## Install and doctor
```text
brew install gstreamer
gst-launch-1.0 --version     # validated 1.28.9
vcr doctor                   # records what is installed; never assume it
```
The pipeline needs the base, good and ugly plugins. Check with `gst-inspect-1.0 x264enc`.

## Smoke test
```text
vcr example create gstreamer-pipeline-encode && (cd examples/gstreamer-pipeline-encode && ./run.sh)
# expect: probe, discoverer and framemd5 diffs silent, then the byte-identity gate fails with
#   "gstreamer-pipeline-encode: rerun bytes differ from the recorded file" (exit 2)
```
Exit 2 is the known partial result (see Rerun comparison), not a broken pipeline. Probed facts: H.264 High, 640x360, yuv420p, 24/1, 48 frames, 2.000000 s; 48 distinct decoded frame hashes.

## Pipeline recipe
```text
gst-launch-1.0 -e videotestsrc num-buffers=48 pattern=ball \
  ! "video/x-raw,width=640,height=360,framerate=24/1" \
  ! videoconvert ! "video/x-raw,format=I420" ! timeoverlay \
  ! x264enc threads=1 ! h264parse ! mp4mux ! filesink location=out.mp4
```
- `-e` sends EOS on interrupt/finish so `mp4mux` writes its index; without a finished file the MP4 is unusable.
- `num-buffers` plus fixed caps pins frame count, size and rate.
- `threads=1` was set so the bitstream does not depend on core count; other thread counts are untested.
- Delivery: this tests an encode with yuv420p and no colour tagging claims. Colour tags and range belong to `TYPO-RANGE`; chroma smear on saturated text to `TYPO-CHROMA`. No thresholds are set here.

## Verify
```text
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_read_frames,duration -show_entries format=duration -of json out.mp4
gst-discoverer-1.0 out.mp4
ffmpeg -v error -y -i out.mp4 -f framemd5 frames.md5
```
ffprobe and gst-discoverer-1.0 agreed on codec, size, frame rate and duration. Pass `-y` to the framemd5 write: without it ffmpeg prompts on an existing file and exits 0, silently reusing the old one.

## Rerun comparison
- Whole-file MP4 bytes differ across reruns: `mp4mux` writes a wall-clock `creation_time` into `moov` (12 bytes differed in the saved reruns). This build's `mp4mux` has no property to pin it.
- The H.264 elementary stream is identical across reruns (`ffmpeg -i out.mp4 -c:v copy -f h264 -`), and decoded frames match. Compare stream or frame hashes, not file hashes.

## Troubleshooting
- Encoder negotiated `yuv444p10le` (High 4:4:4 Predictive): no format caps after `videoconvert`. Add `! "video/x-raw,format=I420"` before the encoder for yuv420p.
- Stale checks: see the framemd5 `-y` note above.
- Element missing (`no element "x264enc"`): install the ugly plugin set, then confirm with `gst-inspect-1.0`.

## Official docs
- https://gstreamer.freedesktop.org/documentation/ (1.28 series)
- https://gstreamer.freedesktop.org/documentation/tools/gst-launch.html
- Fixture: `examples/gstreamer-pipeline-encode`
