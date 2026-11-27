---
name: gource
description: Render a custom-format activity log to a code-history tree video with gource, piping its PPM stream to FFmpeg. VCR evidence is partial: it works in a desktop session on macOS arm64, but frame counts and frames are not repeatable.
---

# gource

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Turns a repository history, or a log you author, into an animated tree of files and contributors: the "code history" shot in developer films. No other catalogued tool makes this ready-made.
- Needs an OpenGL window. It is not headless on macOS: a window opens for the length of the render (about 15 s for the fixture). Tested only from a shell inside a logged-in desktop session.
- Not seekable and not repeatable. In the fixture, 4 renders with `--hash-seed 1` gave counts of 434 to 462 frames and 2 to 3 distinct results, and `-s 1` (one second per log day) did not give a video of about 2 s. Do not use it where a frame must match across runs or the duration must be exact; trim or retime the output with FFmpeg, or draw the graph with `d3` or `graphviz`.
- GPL-3.0-or-later: run it as a separate process, do not link it.

## Capability map
Documented surface (see `gource --help` and `gource --extended-help`): input from a VCS directory or a log (`--log-format git,svn,hg,bzr,cvs2cl,custom`), time control (`-s`, `--stop-at-end`, `--start-date`, `--stop-at-time`), camera (`--camera-mode`, `--padding`), appearance (`--hide`, `--key`, `--font-*`, `--background-colour`, `--bloom-*`, `--title`, `--logo`, avatars) and output (`-o`, `-r`).

Exercised by the fixture: custom log, `--hash-seed`, `--stop-at-end`, `--disable-auto-skip`, `-s`, `-r`, `-WxH`, `--hide`, and `-o -` into FFmpeg. Everything else, including real git logs, avatars, captions and fullscreen, is untested.

## Install and doctor
```sh
brew install gource
gource --help   # no --version flag; the first line of output says v0.56
```
Validated: Homebrew `0.56_1` on macOS arm64. `vcr doctor` reports the tool.

## Smoke test
```sh
examples/gource-custom-log/run.sh
# expect: diff against expected/summary.json is empty, two KNOWN FAIL lines, then "gource-custom-log: OK"
```
The expected output prints a window-open delay of about a minute for 4 renders, `KNOWN FAIL: frame_count_within_10pct_of_prediction` and, usually, `KNOWN FAIL: frames_identical_across_runs`. The frame count printed varies between 434 and 462. A missing gource fails with `brew install gource` in the message.

## Recipes
Custom log: one event per line, `unix-timestamp|user|A or M or D|path|optional hex colour`, sorted by time.
```sh
gource project.log --log-format custom -1280x720 --hash-seed 1 \
  --stop-at-end --disable-auto-skip -s 1 -r 30 --hide mouse,progress -o - </dev/null \
  | ffmpeg -f image2pipe -c:v ppm -framerate 30 -i - -c:v libx264 -pix_fmt yuv420p -crf 18 out.mp4
```
Give gource `</dev/null` so it does not read the terminal. The frame stream runs at the `-r` rate, so declare the same `-framerate` in FFmpeg. Look at the last frames: the scene sits still after the final event, so trim the tail (`ffmpeg -t`).

## Troubleshooting
- No video and no error: gource opens a window; without a display session it cannot render. Run it from a desktop session.
- Frame count far above `fps * days * seconds-per-day`: observed (458 vs 58); the tail after the last event is long. Cause not investigated; measure with `ffprobe -count_frames` and trim.
- Two runs differ: seen even with a fixed `--hash-seed`. Not investigated whether timing or load drives it.

## Official docs
- [Gource](https://gource.io)
- [Custom log format](https://github.com/acaudwell/Gource/wiki/Custom-Log-Format)
- [Source](https://github.com/acaudwell/Gource)
