# SVT-AV1 encode

Status: validated on macOS arm64 with SvtAv1EncApp 4.3.0, FFmpeg 9.0.2, 2026-11-24. Fixture pass; see "Observation, after running".

## Intent and scope

- Tool: `svt-av1`, SvtAv1EncApp v4.3.0 (installed at `/opt/homebrew/bin/SvtAv1EncApp`; the card records 4.2.0 as seen at assessment).
- VCR job and exact claim: SvtAv1EncApp encodes a short ffmpeg-generated Y4M test clip (testsrc2, 1280x720, 48 frames) to AV1 IVF at a fixed preset (8) and CRF (35); ffprobe reports codec `av1`, the declared dimensions and frame count, and decoded output meets a predeclared PSNR floor against the source.
- Explicit exclusions: no alpha (the card says output has no alpha); no quality claim beyond the single PSNR floor; no 10-bit input; no 2-pass or rate-control modes; no speed or CPU claims; no tool-to-tool edge (FFmpeg `libsvtav1` is not exercised, only the standalone CLI); no playback compatibility claim; no claim about AOM patent terms.
- Documentation and licence sources (checked 2026-11-24 by the card's own references, not re-fetched here): https://gitlab.com/AOMediaCodec/SVT-AV1 (BSD-3-Clause-Clear code; AOM Patent License 1.0 applies, per the card). FFmpeg 9.0.2 is used only to generate the source clip and to decode the IVF; its `ffprobe` probes the output; the psnr filter is FFmpeg's own.
- Environment: macOS 26 (Darwin 25.6.0), arm64, Homebrew binaries; no GPU involved.
- Input: no committed media. Generated at run time by `ffmpeg -f lavfi -i testsrc2=size=1280x720:rate=24 -frames:v 48 -pix_fmt yuv420p`. testsrc2 is FFmpeg's synthetic test pattern; no rights question arises.
- Dependencies: already installed, not installed by this run. `SvtAv1EncApp`, `ffmpeg`, `ffprobe`, `jq`, `shasum`. Nothing is installed system-wide and no network access is used.
- Workspace and output paths: `examples/svt-av1-encode/output/` (ignored by git). Retained: `expected/ffprobe.json`, `expected/quality.json`, `expected/encoded.sha256`.

## Plan, before running

- Commands: `./run.sh --record` then `./run.sh`. Source: `ffmpeg -y -loglevel error -f lavfi -i testsrc2=size=1280x720:rate=24 -frames:v 48 -pix_fmt yuv420p output/source.y4m`. Encode: `SvtAv1EncApp -i output/source.y4m -b output/encoded.ivf --preset 8 --crf 35`. Probe: `ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,width,height,nb_read_frames,pix_fmt -of json`. Decode: `ffmpeg -i output/encoded.ivf -pix_fmt yuv420p output/decoded.y4m`. Quality: `ffmpeg -i output/decoded.y4m -i output/source.y4m -lavfi psnr -f null -`.
- Predeclared checks:
  1. ffprobe video stream `codec_name` is `av1`, `width` 1280, `height` 720, `nb_read_frames` 48, `pix_fmt` yuv420p (diffed against `expected/ffprobe.json`).
  2. Frame count: `nb_read_frames` equals 48 (part of check 1).
  3. PSNR: average whole-frame PSNR of decoded vs source is at least 30.0 dB (`expected/quality.json`). Floor chosen before the run.
  4. Reruns: byte identity of `encoded.ivf` against `expected/encoded.sha256` is recorded, not gated. Dimensions and the hashes of the source are not gated.
  5. Visual inspection: a contact sheet of frames 0, 15, 30, 45 of the decoded output must show the testsrc2 pattern, not blank or clipped frames.
- Expected artefacts: `output/encoded.ivf`, `output/ffprobe.json`, `output/psnr.log`, `output/svt-av1.log`.
- Stop conditions: SvtAv1EncApp exits non-zero; ffprobe does not report `av1`; PSNR below 30.0 dB; the contact sheet is blank or shows no pattern. Any of these is a fail or partial, not a reason to change the floor.
- Reproduction: `examples/svt-av1-encode/run.sh`, then inspect `output/decoded.y4m` with ffmpeg or `output/contact.png`.

## Observation, after running

- Date and executor: 2026-11-24, Conors-MacBook-Pro-2.local (arm64, macOS Darwin 25.6.0), run from the agent worktree.
- Versions: SVT-AV1 SvtAv1EncApp 4.3.0 (release; library build "SVT-AV1 Encoder Lib v4.3.0", Apple clang 21.0.0); FFmpeg and ffprobe 9.0.2; jq 1.8.1; Node v22.19.0. Playwright and Chromium not used.
- Commands: `examples/svt-av1-encode/run.sh --record` (exit 0), then `examples/svt-av1-encode/run.sh` (exit 0, printed `svt-av1-encode: OK`). Encode used `--preset 8 --crf 35`, Level of Parallelism 5, reported 247 fps average encode speed (not a claim).
- Predeclared checks, measured:
  1. ffprobe: `codec_name=av1`, `width=1280`, `height=720`, `pix_fmt=yuv420p`, `nb_read_frames=48`; `streams` diff against `expected/ffprobe.json` empty. Pass.
  2. Frame count: 48 packets (`nb_read_packets=48`) and 48 decoded frames. Pass.
  3. PSNR: average whole-frame PSNR of decoded versus source is 43.054947 dB, against a floor of 30.0 dB. Per-frame `psnr_avg` range 40.89 to 51.99 dB (psnr filter stats file). Pass.
  4. Reruns: the `--record` encode and the check encode produced byte-identical IVF files, SHA-256 `98a2dc2b6a1f37dfa9d0b004011f21259a659b87865893501c733ee14ac0a043`, 621,376 bytes. Identical on this machine, two encodes in one session; not tested across reboots or versions.
  5. Visual check: `output/contact.png` (frames 0, 15, 30, 45 at 50%) shows the testsrc2 pattern intact: six colour bars, a moving diagonal gradient, the moving dot trail, the checkerboard block, the grey bar and the running timecode (00:00:00.000 to 00:00:01.875). Not blank, not clipped.
- Result: pass. Exit status 0 on the check run.
- Deviations and limits: `run.sh` gates on video stream facts and the PSNR floor only; byte identity is recorded, not gated. The IVF `nb_frames` header field is not reported by ffprobe, so the frame count comes from packet and decoded-frame counts. Decoding for the PSNR check used FFmpeg's `libdav1d` (AV1 decoder present in this FFmpeg build); the floor compares decoded output with the source as a decoder-agnostic whole-frame metric, not a VMAF score.
- What this establishes: SvtAv1EncApp 4.3.0 on macOS arm64 encodes a 48-frame 1280x720 yuv420p Y4M clip to AV1 IVF at preset 8 and CRF 35; the output probes as AV1 at the declared size and frame count; decoded PSNR is 43.05 dB against the source, above the 30 dB floor; two encodes were byte-identical.
- What it does not establish: no alpha (the card says none); no 10-bit; no 2-pass, bitrate or real-time modes; no other presets or CRF values; no other OS or architecture; no FFmpeg `libsvtav1` route; no quality beyond one synthetic test pattern (testsrc2 is not natural video); no playback compatibility; no patent or licence clearance (AOM Patent License 1.0 applies per the card).
- Reviewer, decision, follow-up: none recorded. Revisit if SvtAv1EncApp or FFmpeg's AV1 decoder changes, or if the card's licence text changes.
