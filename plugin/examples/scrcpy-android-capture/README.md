# scrcpy Android capture evidence

## Intent and scope

- Tool and version: `scrcpy` 5.0.1 (Homebrew), with `adb` from android-platform-tools.
- Claim: scrcpy records a connected Android device headlessly (`--no-window --no-playback --no-audio --record --time-limit=3`) to an H.264 MP4 whose size equals `adb shell wm size`, with duration in tolerance and non-blank, different frames.
- Exclusions: determinism or hashes, audio, camera mode, USB, phones, emulators, bitrate/fps options, isolating the keypress effect, quality beyond a contact sheet.
- Sources: https://github.com/Genymobile/scrcpy (Apache-2.0); `scrcpy --help`, checked 2026-11-27.
- Environment: macOS 26.6 arm64; one Android TV device (Android 11) over adb TCP, effective size 1920x1080 (physical 3840x2160). No emulator or system image installed.
- Dependencies: none new. ffmpeg/ffprobe 9.0.2, ImageMagick, node.
- Side effects: sends HOME and one D-pad key to the device. Output in ignored `output/`.

## Plan, before running

- `./run.sh` fails with exit 1 when `adb devices` lists no device (or several without `ANDROID_SERIAL`).
- Record 3 s, press KEYCODE_DPAD_RIGHT at 1.5 s, up to 3 attempts if scrcpy exits non-zero.
- Checks (`expected/capture.json`): C1 H.264 in MP4; C2 size equals `wm size`; C3 duration 1.5 to 3.5 s; C4 frames at 0.2 s and end non-blank (deviation > 0.02) and different.
- Stop conditions: no device means blocked; three consecutive scrcpy failures means fail.

## Observation, after running

- Result: partial. Final `run.sh --record` and `run.sh` printed OK with C1 to C4 PASS (1920x1080, 2.91 s, deviations about 0.10).
- Contact sheet (inspected): both frames show the device's launcher dashboard (clock, app tiles, status bar) at full resolution; the animated dot field differs between frames. The keypress moved focus but the launcher animates on its own, so C4 shows a live screen, not the input.
- Flake: with `--no-window --no-playback`, scrcpy segfaulted at startup (exit 139, "No video mirroring" logged, no file) in roughly 2 of 10 early runs and 2 of 4 in later runs. The retry loop is part of the fixture and prints `KNOWN FLAKE`. Cause not investigated.
- Duration is under the 3 s limit (2.36 s and 2.91 s seen) because frames arrive only on change.
- Not established: other devices, USB, emulator, audio, determinism, and the cause of the segfault.
- Reproduce: `examples/scrcpy-android-capture/run.sh --record`, then `run.sh`.

## Device safety (orchestrator change, 2026-11-27)

The first run picked up a household Android TV that happened to be connected over adb and sent it key presses. `run.sh` now refuses to run unless `ANDROID_SERIAL` names the device, and sends key presses only with `VCR_SCRCPY_ALLOW_INPUT=1`. The device's network address and model were removed from the record.
