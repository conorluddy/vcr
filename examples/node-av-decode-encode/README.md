# node-av decodes and re-encodes an ffmpeg-generated H.264 clip in Node

## Intent and scope

- Tool ID and version/build: `node-av` 7.1.0 (npm, exact pin in this example's `package.json`). Its bundled FFmpeg build is reported by `ffmpegVersion()` from `node-av/ffmpeg` and recorded at run time. The record's 7.0.3 was the latest stable at assessment; 7.1.0 is the latest stable on 2026-11-24.
- VCR job and exact claim being tested: "In Node, node-av decodes a short ffmpeg-generated test clip (testsrc2, 320x240, 24 frames, H.264 in MP4) frame by frame, reports the predeclared frame count, dimensions and pixel format, and re-encodes it to a file whose ffprobe fields match predeclared values."
- Explicit exclusions: pixel quality or PSNR; audio; codecs other than H.264 (input and output); hardware acceleration; other platforms; byte-identity of the re-encoded file across machines or FFmpeg builds (not claimed); the bundled FFmpeg build flags and codec licensing (recorded, not verified); the `ffmpeg-ffprobe` tool, which is used only to generate the input and read ffprobe fields.
- Predeclared checks that do not apply: alpha range and shuffled-order checks. The claim is about decode and encode facts, not seeked pixels or alpha. Two distinct frame hashes are kept, because they show that decoding produced changing pictures rather than blank frames.
- Tool documentation and licence sources, checked 2026-11-24: https://github.com/seydx/node-av (README examples of `Demuxer`, `Decoder`, `Encoder`, `Muxer`), https://github.com/seydx/node-av/releases, https://github.com/seydx/node-av/blob/main/LICENSE.md. Licence: MIT for the project; the bundled FFmpeg binary's licence depends on the platform package (see the record's notes).
- Environment: macOS arm64 (Darwin 25.6.0), Node.js v22.19.0, system FFmpeg 9.0.2 (Homebrew, used only to generate the input and probe output). No GPU use.
- Input: generated locally by system ffmpeg from the `testsrc2` lavfi source at 320x240, 24 fps, 24 frames, `libx264`, `yuv420p`, MP4. No external asset, so no rights question. The input file's hash is not a check; it may differ across ffmpeg builds.
- Dependencies, installation plan, permissions, network and side effects: `node-av@7.1.0` is the only new dependency, installed into this example's `node_modules` by `pnpm install` at the workspace root (the workspace includes `examples/*`). npm installs one platform package as an optional dependency (on this machine expected to be `@seydx/node-av-darwin-arm64@7.1.0`); its install script only checks that the prebuilt binary package exists and makes no network download. `tsx` is pinned as in the other examples. No global installs. No network at run time.
- Selected workspace, generated output and cleanup paths: `examples/node-av-decode-encode/output/` (ignored) holds the input, re-encoded file and logs. `expected/metrics.json` holds facts only, no media.

## Plan, before running

- Exact commands: `pnpm install`, then `examples/node-av-decode-encode/run.sh --record`, then `examples/node-av-decode-encode/run.sh` (must print OK).
- Input generation (system ffmpeg): `ffmpeg -f lavfi -i testsrc2=size=320x240:rate=24 -frames:v 24 -c:v libx264 -pix_fmt yuv420p -movflags +faststart output/input.mp4`.
- Decode (node-av `Demuxer` then `Decoder.frames`): open the file, take `input.video()`, iterate `decoder.frames(input.packets(index))` frame by frame, and for each frame read width, height, pixel format, pts and `toBuffer()` (hashed with SHA-256).
- Re-encode (node-av `Demuxer`, `Decoder`, then `Encoder.create(FF_ENCODER_LIBX264, { decoder })`, then `Muxer.open(output/reencoded.mp4)` with `addStream(encoder, { inputStream })`): write every encoded packet.
- Predeclared checks, hard-coded in `check.ts` as assertions (not only in the expected file):
  1. Input ffprobe (`-count_frames`): codec `h264`, width 320, height 240, pix_fmt `yuv420p`, nb_read_frames 24, r_frame_rate `24/1`, format_name `mov,mp4,m4a,3gp,3g2,mj2`.
  2. node-av decode of the input: 24 frames; width 320; height 240; format equals `AV_PIX_FMT_YUV420P`; pts strictly increasing; at least 2 distinct frame SHA-256 hashes.
  3. Re-encode: at least one packet written with `FF_ENCODER_LIBX264`.
  4. Output ffprobe: identical field set and values to check 1.
  5. node-av round-trip decode of the output: 24 frames, 320x240, `yuv420p`.
  6. The facts in `expected/metrics.json` match the run (deepEqual); two consecutive runs both pass.
- Expected artifacts: `expected/metrics.json` (ffprobe fields, decode facts, packet count). Versions (node-av, bundled FFmpeg, Node, system FFmpeg) are printed and stored under `output/`, not in `expected/`, so the expected file stays host-neutral.
- Expected failure modes and stop conditions: if the platform binary package fails to install, stop and report blocked. If the bundled FFmpeg lacks `libx264`, the re-encode step fails; the result is then partial at most (decode still passes), and the scope must say so. If the decoded frame count or dimensions differ from 24 and 320x240, stop and report fail; do not change the predeclared values to match.
- Reproduction and inspection: run from the workspace root. Inspect `output/contact.png`, a contact sheet of re-encoded frames 0, 8, 16 and 23 (extracted with system ffmpeg from `output/reencoded.mp4`, the file node-av wrote), and the ffprobe JSON in `output/run.log`.

## Observation, after running

- Date and executor: 2026-11-24, `Conors-MacBook-Pro-2.local`, executed by the evidence worker in its worktree.
- Versions: node-av 7.1.0 (exact pin); bundled FFmpeg reported by `ffmpegVersion()` 8.1.3 (this is what node-av decoded and encoded with, including libx264); system ffmpeg and ffprobe 9.0.2 (Homebrew; only input generation and probing); Node.js v22.19.0; macOS 26 / Darwin 25.6.0, arm64. Playwright and ImageMagick are not used by this fixture; ImageMagick `magick` was used only for the contact sheet.
- Platform packages: pnpm recorded all eight `@seydx/node-av-*@7.1.0` platform packages in the lockfile as optional dependencies, but only `@seydx/node-av-darwin-arm64@7.1.0` was fetched and loaded on this host. pnpm skipped node-av's install-time check script (reported as an ignored build script); the native binary still loaded, so this check did not affect the result.
- Commands: `pnpm install`; `examples/node-av-decode-encode/run.sh --record`; then two checked runs of `examples/node-av-decode-encode/run.sh`. The first checked run printed `node-av-decode-encode: OK`; the second exited 0.
- Measured results (from the record run; both checked runs reproduced them):
  - Input ffprobe: h264, 320x240, yuv420p, 24 frames, `24/1`, container `mov,mp4,m4a,3gp,3g2,mj2`.
  - node-av decode of the input: 24 frames, 320x240, format is `AV_PIX_FMT_YUV420P`, pts strictly increasing, 24 distinct frame SHA-256 hashes (every frame differs).
  - Re-encode: `FF_ENCODER_LIBX264` through node-av; output written to `output/reencoded.mp4`.
  - Output ffprobe: identical field set and values to the input (h264, 320x240, yuv420p, 24 frames, `24/1`, same container name).
  - node-av round-trip decode of the output: 24 frames, 320x240, yuv420p, pts strictly increasing, 24 distinct frame hashes.
- Visual inspection: `output/contact.png` (640x120 at 50%, four frames of the re-encoded file) shows the testsrc2 pattern from its own frames: colour bars, a moving diagonal gradient, grey and magenta blocks, and the on-screen timer reading 00:00:00.000, 00:00:00.333, 00:00:00.667 and 00:00:00.958. The picture is not blank, clipped or stuck, and the timer advances in step with the frame index, so the re-encode carries the content through.
- libx264 prints its encoder statistics to stderr; they are captured in `output/run.log` and are not errors.
- Pass / partial / fail / blocked: **pass** for the claim as predeclared. Every predeclared assertion held on the record run and both checked runs. No predeclared value was changed.
- Deviations and limitations: the alpha and shuffled-order checks were not applicable (see Intent and scope). The expected file holds facts only; the re-encoded file's bytes were not compared across runs, since they are not part of the claim. Each run regenerates the input and re-encodes from it, so the checked runs also exercise the generation path.
- What this result does establish: in Node on macOS arm64, node-av 7.1.0's bundled FFmpeg 8.1.3 decodes a 24-frame 320x240 H.264 yuv420p MP4 frame by frame, reports the predeclared frame count, dimensions and pixel format, and re-encodes it with libx264 to a file whose ffprobe fields match the predeclared values, which the decoder also reads back with the same facts.
- What it does not establish: pixel-level quality or fidelity against the input; audio; codecs other than H.264; hardware acceleration; other platforms or other node-av releases; the bundled build's licence and full codec list; byte-identical output across machines.
- Reviewer, decision, follow-up and revisit triggers: none yet. Revisit on any node-av release (the pin is exact, so a bump changes the fixture), on a change to the bundled FFmpeg build, or if the FFmpeg `ffmpeg-ffprobe` input generation changes.
