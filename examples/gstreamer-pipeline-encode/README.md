# GStreamer pipeline encode

Status: partial on macOS arm64 with GStreamer 1.28.9, 2026-11-24. Every probe and frame check passes and the contact sheet shows the moving ball and the overlay. The rerun-byte-identity check fails: mp4mux writes a wall-clock `creation_time`, so the file hash changes each run, while the H.264 stream does not. See "Observation, after running".

## Intent and scope

- Tool: `gstreamer`, GStreamer 1.28.9 (Homebrew formula `gstreamer` 1.28.9, `gst-launch-1.0 --version`), with `gst-discoverer-1.0` from the same install. Card assessed 2026-10-26 at 1.28.8; installed build is 1.28.9.
- VCR job and exact claim: `gst-launch-1.0` runs a headless pipeline `videotestsrc num-buffers=48` with fixed caps 640x360 at 24/1, then `videoconvert`, `timeoverlay`, `x264enc`, `h264parse`, `mp4mux` and `filesink`, writing an MP4. `ffprobe` reports codec H.264, 640x360, 48 frames and a 2.000000 s duration; `gst-discoverer-1.0` reports the same container facts; a second run produces a byte-identical file.
- Elements, all present in the installed build (checked with `gst-inspect-1.0`): `videotestsrc`, `videoconvert`, `timeoverlay` (gst-plugins-base, `pango` plugin), `x264enc` (gst-plugins-ugly, `libgstx264.dylib`), `h264parse` and `mp4mux` (gst-plugins-good, `libgstisomp4.dylib`), `filesink` (core). `textoverlay` is also present but not used. `openh264enc` is absent, so the H.264 encoder is x264.
- Explicit exclusions: no alpha (yuv420p, no alpha route); no audio; no live, RTP, WebRTC or capture-device sources; no hardware encoders (VideoToolbox not tested); no VP8 or other container branch (`vp8enc`, `webmmux` present but unused); no playback or decode-compatibility claim beyond ffprobe and discoverer; no quality claim (no PSNR or VMAF); no timeoverlay font or layout claim beyond the frame inspection; no seeking or shuffled-order check, since this is one sequential encode and not a seeked scene; no GPL/LGPL compliance claim for x264 (the x264 plugin in gst-plugins-ugly is GPL-licensed, while the card records the framework as LGPL-2.1, so the licence question is recorded and not settled here).
- Documentation and licence sources: https://gstreamer.freedesktop.org/ (card's official URL), card licence LGPL-2.1. Checked 2026-11-24 from the card and the installed plugin metadata only, not re-fetched from the web.
- Environment: macOS 26 (Darwin 25.6.0), arm64, Homebrew. No GPU involved; x264 is CPU.
- Input: no committed media. The source is generated at run time by `videotestsrc pattern=ball` (a synthetic moving ball, no rights question).
- Dependencies: already installed, nothing installed by this run. `gst-launch-1.0`, `gst-discoverer-1.0`, `ffprobe`, `ffmpeg` (framemd5 only), `jq`, `shasum`, and ImageMagick `magick` (contact sheet, inspection only). No network access.
- Workspace and output: `examples/gstreamer-pipeline-encode/output/` (git-ignored). Retained facts only: `expected/ffprobe.json`, `expected/discoverer.json`, `expected/framemd5.json`, `expected/pipeline.sha256`.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. Pipeline: `gst-launch-1.0 -e videotestsrc num-buffers=48 pattern=ball ! video/x-raw,width=640,height=360,framerate=24/1 ! videoconvert ! video/x-raw,format=I420 ! timeoverlay ! x264enc threads=1 ! h264parse ! mp4mux ! filesink location=output/pipeline.mp4`. `-e` sends EOS so the muxer writes its index. `threads=1` pins the x264 threading so the bitstream does not depend on the core count.
- Amendment, 2026-11-24, before any expected/ was recorded: the first `--record` attempt had no format caps, and x264enc negotiated `yuv444p10le` (H.264 High 4:4:4 Predictive), which contradicts the yuv420p check below. The pipeline was missing the I420 caps the plan assumed, so `video/x-raw,format=I420` was added after `videoconvert`. The check stays as written. The unpinned negotiation is recorded in "Observation, after running".
- Probe: `ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_read_frames,duration -show_entries format=format_name,duration -of json`.
- Discoverer: `gst-discoverer-1.0 output/pipeline.mp4`, with container, video codec, width, height, frame rate and duration extracted to `expected/discoverer.json`.
- Decoded frames: `ffmpeg -v error -i output/pipeline.mp4 -f framemd5 output/framemd5.txt`, counting frame lines and distinct per-frame hashes.
- Predeclared checks:
  1. `gst-launch-1.0` exits 0 and its log has no `ERROR` line.
  2. ffprobe video stream: `codec_name` h264, `width` 640, `height` 360, `pix_fmt` yuv420p, `r_frame_rate` 24/1, `nb_read_frames` 48; container duration 2.000000 s. Diffed against `expected/ffprobe.json`.
  3. `gst-discoverer-1.0` agrees with ffprobe: container, H.264, 640x360, 24/1, duration 2.000 s within 1 ms. Diffed against `expected/discoverer.json`.
  4. Decoded frame count is 48, and there are at least 2 distinct frame hashes (floor, not target; the ball moves, so 48 is expected).
  5. Rerun byte identity: `sha256` of `pipeline.mp4` equals the hash recorded in `expected/pipeline.sha256`. Gated: a mismatch is a partial result, with the other checks still reported.
  6. Visual: a contact sheet of frames 0, 15, 30 and 45 shows the moving ball and the time overlay, not blank, clipped or static.
- Expected artefacts: `output/pipeline.mp4`, `output/gst-launch.log`, `output/ffprobe.json`, `output/discoverer.txt`, `output/framemd5.txt`, `output/frames/`.
- Stop conditions: a missing element (exit non-zero); ffprobe or discoverer disagreeing on codec, size or duration; a frame count other than 48; a blank or static contact sheet. A byte-identity mismatch alone gives partial. None of these is a reason to change the predeclared values.
- Reproduction: `examples/gstreamer-pipeline-encode/run.sh`, then inspect `output/pipeline.mp4` with `ffprobe` or `ffplay` (not part of the run).

## Observation, after running

- Date and executor: 2026-11-24, Conors-MacBook-Pro-2.local (arm64, macOS 26.6 per `sw_vers`, Darwin 25.6.0), run from the agent worktree.
- Versions: GStreamer `gst-launch-1.0` 1.28.9 (Homebrew formula `gstreamer` 1.28.9; x264 plugin from gst-plugins-ugly, mp4mux from gst-plugins-good); `gst-discoverer-1.0` from the same install; FFmpeg and ffprobe 9.0.2; jq 1.8.1; Node v22.19.0 (unused by the run). Playwright and Chromium not used.
- Commands: `examples/gstreamer-pipeline-encode/run.sh --record` (exit 0), then `run.sh` (exit 2, the gated byte-identity check; the probe and frame diffs were silent). The final check run is in `output/check-run.txt`.
- Pipeline as run: the amended one in the plan, with I420 caps after `videoconvert`. The first unamended `--record` attempt negotiated `yuv444p10le` (H.264 High 4:4:4 Predictive); that run was discarded before `expected/` was written.
- Measured:
  1. `gst-launch-1.0` exit 0, `-e` EOS received, pipeline "Execution ended after 0:00:00.258"; no `ERROR` line in `output/gst-launch.log`. Pass.
  2. ffprobe: `codec_name` h264, profile High, 640x360, `pix_fmt` yuv420p, `r_frame_rate` 24/1, `nb_read_frames` 48, stream and container duration 2.000000 s, container `mov,mp4,m4a,3gp,3g2,mj2`. Diff against `expected/ffprobe.json` silent. Pass.
  3. gst-discoverer-1.0: container Quicktime, H.264, 640x360, 24/1, duration `0:00:02.000000000`. Diff against `expected/discoverer.json` silent, and it agrees with ffprobe's 2.000000 s. The recorded check is exact string equality, which is stricter than the 1 ms tolerance written in the plan. Pass.
  4. Decoded frames (framemd5): 48 frames, 48 distinct frame hashes. Diff silent. Pass.
  5. Rerun byte identity: FAIL. The recorded file hash was `edfa7c71…3020438`; later runs gave `5d14ababdd…f9041`, and the other runs also differed. Two saved reruns differ in 12 bytes, all inside `moov` at the end of the 55,541-byte file (not faststart). Their `creation_time` tags are `2026-11-24T10:04:58.000000Z` and `…10:05:57.000000Z`. The H.264 elementary streams (`ffmpeg -c:v copy -f h264`) hash identically, `ff361ec6846aa818…`, so the encoder output is stable and the muxer header is not. `mp4mux` has no property to set `creation_time` in this build (its property list was checked). Gate fails, so the result is partial.
  6. Visual: `output/contact.png` (frames 0, 15, 30, 45 at 50%, built with `magick` after the run) shows a white ball at four different positions on black, and the overlay reads `0:00:00.000`, `0:00:00.625`, `0:00:01.250`, `0:00:01.875`. These match frames 0, 15, 30 and 45 at 24 fps. Not blank, not clipped, and the library's overlay is visible. Pass.
- Deviations and limits:
  - Stale output in the early check runs: ffmpeg's `framemd5` write prompts on an existing file and exits 0, so the first two check runs reused the record run's `framemd5.txt`. `-y` was added to the command and the later runs regenerated the file. The reported check 4 comes from the later runs.
  - The contact sheet is 640x360 because the montage was resized to 50%, so each frame is 320x180. It is an inspection artefact, not a check.
  - No alpha (yuv420p H.264 has none); no shuffled-order or seek check, since this is one sequential encode; no timeoverlay font claim; no textoverlay branch.
  - `threads=1` on x264enc was set to avoid thread-count dependence; not tested with other thread counts.
  - The x264 plugin in gst-plugins-ugly is GPL. The card records the framework as LGPL-2.1. Not resolved here.
- What this establishes: GStreamer 1.28.9 on macOS arm64 runs a headless `videotestsrc num-buffers=48` pipeline at fixed 640x360 24/1 through `videoconvert`, `timeoverlay`, `x264enc`, `h264parse`, `mp4mux` and `filesink` to a 48-frame H.264 MP4 (yuv420p, 2.000000 s). ffprobe and gst-discoverer-1.0 agree on codec, size, frame rate and duration. Decoded frames are 48 distinct images, and the contact sheet shows the ball and overlay.
- What it does not establish: byte-identical reruns of the file (it fails; the H.264 stream is identical); other OS or architecture; other encoders (openh264, VideoToolbox, vp8enc) or containers; live or RTP sources; quality beyond the visual check; alpha; audio; licence clearance for x264 (GPL plugin).
- Reviewer, decision and follow-up: none recorded. A byte-identical file would need the muxer's creation time pinned, which this build does not allow, or a different container (not tested). Revisit if the mp4mux build changes, or if a container with no wall-clock header is needed.
