---
name: scrcpy
description: Record a connected Android device or emulator screen to H.264 MP4 headlessly with scrcpy over adb. Load when an Android app's screen must become a source clip; baguette is the iOS Simulator equivalent and frames-cli frames the result.
---

# scrcpy

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- scrcpy mirrors and records an Android screen over adb. In VCR it captures a real-time clip; it does not decorate (hand the MP4 to `frames-cli`) and it is not seekable or deterministic.
- Validated on one setup only: scrcpy 5.0.1 (Homebrew), macOS 26.6 arm64, one Android TV device (Android 11) over adb TCP at 1920x1080. A 3 s take came out as H.264 MP4 at the `adb shell wm size` size, 2.91 s long, with non-blank, different frames.
- Evidence is partial: `--no-window --no-playback` segfaulted at startup in roughly a third of runs on that setup (exit non-zero, no file). Retry; the fixture allows 3 attempts.
- Duration comes in under `--time-limit` (2.36 to 2.91 s for 3 s) because frames arrive only when the screen changes. Gate on a tolerance, not equality.
- Not tested: phones, emulators, USB, audio, camera mode, `--new-display`, bitrate and fps options, keypress effects (the TV home screen animates on its own, so changing frames prove a live screen, not the input).
- Neighbours: `baguette` for iOS Simulator; FFmpeg for re-encoding.

## Capability map
Official entry: the [README](https://github.com/Genymobile/scrcpy) and `scrcpy --help`.
- Tested: `--no-playback --no-window --no-audio --record=file.mp4 --time-limit=3`, with `adb shell input keyevent` and `adb shell wm size`.
- Documented, untested in VCR: `--video-codec`, `--video-bit-rate`, `--max-size`, `--max-fps`, `--record-format` (mkv, opus, flac, wav), audio capture, `--camera-*`, `--new-display`, `--tcpip`.

## Install and doctor
```text
brew install scrcpy android-platform-tools
scrcpy --version   # expect: scrcpy 5.0.1 for the tested setup
adb devices        # needs exactly one line ending in "device"
```
`vcr doctor` checks the configured command, not the device. Without a device or emulator there is nothing to record: connect one (USB debugging, or `adb connect <ip>:5555`) or start an AVD. Several devices: set `ANDROID_SERIAL`.

## Smoke test
The fixture never picks a device by itself: name it with `ANDROID_SERIAL`, and add `VCR_SCRCPY_ALLOW_INPUT=1` only if it may send two key presses (HOME, D-pad right) to that device. Use an emulator or a device set aside for testing, not a household TV or phone.

```text
vcr example create scrcpy-android-capture
cd examples/scrcpy-android-capture
ANDROID_SERIAL=<serial from adb devices> VCR_SCRCPY_ALLOW_INPUT=1 ./run.sh
# expect: scrcpy-android-capture: OK   (checks C1 to C4 PASS)
```
It exits 1 with a message when no device is connected. Sample run: 1920x1080, duration 2.91 s; duration and deviations vary slightly. A line `KNOWN FLAKE attempt N` means scrcpy segfaulted and the run retried.

## Capture recipe
```bash
scrcpy --no-playback --no-window --no-audio --record=take.mp4 --time-limit=3 &
sleep 1.5; adb shell input keyevent KEYCODE_DPAD_RIGHT   # scripted input mid-take
wait                                                      # non-zero exit: retry
ffprobe -v error -show_entries stream=width,height -show_entries format=duration take.mp4
```
- The recording size is the device's effective size (`wm size` Override if present), not its physical panel.
- Verify with `ffprobe` and extracted frames before using the clip.

## Troubleshooting
- `Segmentation fault: 11` right after "No video mirroring": seen here in about a third of runs; rerun.
- `adb devices` empty or `unauthorized`: connect or authorise the device; no emulator is bundled with the tool.
- Clip shorter than `--time-limit`: normal for a static screen.

## Official docs
- [scrcpy README](https://github.com/Genymobile/scrcpy) and [releases](https://github.com/Genymobile/scrcpy/releases) (tested 5.0.1); `scrcpy --help`.
