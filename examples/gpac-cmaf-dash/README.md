# gpac MP4Box: CMAF/DASH packaging, WebVTT track, chapters

Status: partial on macOS arm64, 2026-11-27 (GPAC 26.07-revrelease via Homebrew, ffmpeg from Homebrew). The determinism check is a KNOWN FAIL.

## Intent and scope

- Tool: GPAC `MP4Box` 26.07-revrelease (LGPL-2.1+, https://github.com/gpac/gpac, https://wiki.gpac.io). `gpac` is installed alongside but not exercised directly.
- Claim: from a generated ffmpeg `testsrc`+`sine` MP4 (10 s, 25 fps, 320x180, keyframe every 25 frames), MP4Box adds a WebVTT subtitle track and two chapters, then fragments it with `-dash 4000 -frag 4000 -rap` into one DASH representation per track. `MP4Box -info` and ffprobe report the expected tracks; there are 3 media segments per representation, video segments of 4 s, 4 s and 2 s; repeat runs are byte-identical.
- Exclusions: HLS output, encryption, multi-bitrate sets, `gpac` filter graphs, playback in a real player, other OS.
- Input: `input/subs.vtt` and `input/chapters.txt` (hand-written, no third-party text); the media is made by ffmpeg in `run.sh` with `-bitexact` flags.
- Dependencies: `MP4Box`, `ffmpeg`, `ffprobe`, `jq` on PATH. `run.sh` exits 1 and names `brew install gpac` if one is missing. Nothing is installed by the run; it writes only `output/`.

## Plan, before running

- Commands: see `run.sh`. Creation times are pinned with `-time` (movie and each track) and `-mtime` (each track's media).
- Predeclared checks (hand-written in `expected/checks.json`): 3 tracks (`vide:avc1`, `soun:mp4a`, `text:wvtt`, language `eng`); ffprobe sees h264, aac and a data stream; chapters `Intro` at 0 s and `Middle` at 5 s; 9 media segment files (3 per track); `maxSegmentDuration` PT4S and presentation PT10S; video 100/100/50 packets per segment (4, 4, 2 s); audio segments ending near 4, 8, 10 s (AAC frame granularity gives 173/172/87 packets); text segments with cumulative ends 4, 8, 9 s.
- Determinism: two complete runs 2 s apart; every file byte-compared, apart from the MPD generation-time comment, which is stripped. Predeclared as identical.
- Stop conditions: any mismatch with `expected/checks.json` fails. A differing-file list that is not `expected/known-fail.json` fails.
- Honest note: the audio and text packet counts in `expected/checks.json` were copied from an exploratory run before the script was finished; the video counts and the 3-segment count were predeclared.

## Observation, after running

- Structure: all predeclared structure checks pass. Video segments 100/100/50 packets, audio 173/172/87, text 1/2/1, chapters and an `eng` text track present.
- Not byte-identical: `base.mp4` and the three init segments (`seg_v_.mp4`, `seg_a_.mp4`, `seg_t_.mp4`) differ in 3 and 8 bytes. The cause is the tracks' modification time, taken from the wall clock; `-time` and `-mtime` pin creation times only. Media segments (`*.m4s`) and the MPD (minus its generated-at comment) are byte-identical. If both runs fall in the same second everything is identical, so the check is flaky without the 2 s gap. The ffmpeg `-bitexact` source is identical across runs.
- Crash: `MP4Box -dash` with three `file#track` inputs aborted (SIGABRT or SIGTRAP, exit 133/134, no output) in roughly 1 run in 5, also with `-threads=0`. `run.sh` retries up to 8 times from a clean directory.
- Inspection: no frames; the output is containers and text. The MPD was read directly.
- Establishes: MP4Box 26.07 on macOS arm64 produces the expected tracks, chapters, segments and manifest from this input, and the media segments are reproducible.
- Does not establish: reproducible base MP4 or init segments, so a delivery pipeline cannot hash those; HLS; players; other versions or OS; the `gpac` binary.
