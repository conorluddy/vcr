# gource custom log to video

## Intent and scope

- Tool and version: `gource` 0.56 (Homebrew `0.56_1`), with FFmpeg from Homebrew.
- Claim: gource turns a self-authored custom-format log into a PPM stream (`-o -`) that FFmpeg encodes to a 640x360, 30 fps H.264 file; with `--hash-seed`, `--stop-at-end` and a pinned rate the frame count follows the log and reruns are frame-identical.
- Exclusions: real VCS history, avatars, logos, captions, other platforms, other OpenGL drivers, audio.
- Licence: GPL-3.0-or-later, run as a separate process; nothing of gource is redistributed. Checked 2026-11-27 via `gource --help` and the lead's source URL.
- Environment: macOS 26 arm64 (Apple M3), logged-in desktop session.
- Input: `project.log`, authored here (24 events, three users, 2026-01-01 to 2026-01-03 UTC), format `timestamp|user|A/M/D|path|colour`. No rights issues.
- Install: none (gource already installed with `brew install gource`).

## Plan, before running

- Command: `gource project.log --log-format custom -640x360 --hash-seed 1 --stop-at-end --disable-auto-skip -s 1 -r 30 --hide mouse,progress -o - | ffmpeg -f image2pipe -c:v ppm -framerate 30 -i - -c:v libx264 -pix_fmt yuv420p -crf 18`, rendered 4 times.
- Predeclared checks:
  1. 640x360, `30/1`.
  2. Frame count within 10% of `30 * log span in days * seconds per day` (58 frames).
  3. Decoded frames identical across all 4 renders.
  4. A frame mid-run is not blank.
- Headless: expected to need a window (the lead says so); record what happens.
- Stop conditions: gource exits non-zero or ffmpeg receives no frames.

## Observation, after running (2026-11-27, Conors-MacBook-Pro-2.local)

- Headless: no. gource opens an OpenGL window and a render takes about 15 s, close to the video length. It ran from a non-interactive shell inside an active desktop session; a session without a display was not tried.
- Check 1 pass. Check 4 pass.
- Check 2 FAIL (KNOWN FAIL): 434 to 462 frames (about 15 s) against 58 predicted. `-s 1` did not make the video about 2 s long; the log span is 1.97 days, and frames continue after the last event while the scene settles. Cause not investigated beyond that.
- Check 3 FAIL (KNOWN FAIL): in each invocation of 4 renders, 2 to 3 distinct results appeared, with counts 434, 451, 458 and 462; 458 was the most common, and renders with the same count shared a hash.
- Inspection: `output/inspect-sheet.png` (four frames). Dated header, users and file nodes form a tree, labelled, with bloom; the last frames are static. The picture is correct; the tail is dead air.
- Baseline `expected/summary.json` holds only stable fields; frame count, hash and the determinism verdict vary per invocation, so they are printed, not diffed. `run.sh` exits 0 while the stable fields reproduce and prints each KNOWN FAIL.
- Establishes: the custom-log to PPM to FFmpeg route works on this machine with a window. Does not establish: determinism, duration control, headless use, other machines.
