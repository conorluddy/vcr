---
name: baguette
description: Boot an iOS Simulator by UDID and capture a PNG screenshot or H.264 recording from the command line with Baguette. Load when a native iPhone app's screen must become a source still or clip; frames-cli frames the result.
---

# Baguette

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Baguette drives Apple Simulator without the GUI: it boots a device, sends input, and captures stills and recordings. In VCR it captures; it does not decorate. To put a device bezel around the capture, hand the PNG or MP4 to `frames-cli`.
- Validated on one setup only: baguette 0.3.2 (the card's assessment saw 0.2.14), macOS 26.6 arm64, one `iPhone 17 Pro (EN)` simulator on iOS 26.5 booted by UDID. It produced a 1206x2622 PNG and a 3 s H.264 MP4 (1206x2622, 2.86 to 3.01 s) of a home-screen swipe, both non-blank and different from each other, then shut the device down.
- No pixel determinism: the status-bar clock and live UI change every run, so do not gate on hashes. Recording frame count also varies (29 to 54 over five runs) because frames arrive only when the screen changes; gate on duration and dimensions.
- Not tested: app install, UI assertions, other devices, runtimes, Xcode or macOS versions, physical devices, behaviour without Screen Recording or input permission. Whether a Simulator window appears was not checked, so "headless" is unproven.
- For supported test assertions use XCUITest; for pure compositing use ImageMagick, for encoding FFmpeg.

## Capability map
Official entry: the [README](https://github.com/tddworks/baguette) and `baguette help <subcommand>`.
- Tested: `list --json`, `boot`, `press --button home`, `screenshot` (with `--metadata-output`), `record` (`--size native --fps --duration`), `swipe`, `shutdown`.
- Documented, untested in VCR: `stream`, `describe-ui`, `render-3d`, `serve`, multi-device sessions, taps and other gestures, `heal` for the Xcode 27 Device Hub path. Read the README before relying on any of them.

## Install and doctor
```text
brew install baguette
baguette --version   # expect: 0.3.2 for the tested setup
```
Needs Apple Silicon and Xcode 26 simulator frameworks. `vcr doctor` checks the configured command; it does not install baguette or confirm permissions. List devices with `baguette list --json` and take the UDID from there.

## Smoke test
```text
vcr example create baguette-simulator-capture
cd examples/baguette-simulator-capture
./run.sh
# expect: baguette-simulator-capture: OK   (checks C1 to C6 PASS)
```
Sample recorded run: PNG 1206x2622, MP4 duration 3.007 s, frame deviations 0.27 and 0.25 (threshold 0.02). The duration and deviations vary a little; the dimensions and PASS lines do not. The run uses the UDID set in `run.sh`; edit it to a device from your own `baguette list --json`.

## Capture recipe
Shown by the fixture (replace `$UDID`):
```bash
trap 'baguette shutdown --udid "$UDID" >/dev/null 2>&1 || true' EXIT
baguette boot --udid "$UDID"          # then poll `baguette list --json` until state is Booted
baguette press --udid "$UDID" --button home
baguette screenshot --udid "$UDID" --output home.png --metadata-output home-geometry.json
baguette record --udid "$UDID" --output home.mp4 --size native --fps 30 --duration 3 &
sleep 1
baguette swipe --udid "$UDID" --start-x 330 --start-y 437 --end-x 70 --end-y 437 --width 402 --height 874 --duration 0.4
wait
```
- Always shut down in a `trap` so a failed run does not leave the device booted.
- Wait for `Booted` before any capture; `boot` returning is not enough in the fixture's polling design. The fixture polled up to 120 s.
- Swipe coordinates are in points (402x874); the output is in pixels (1206x2622, 3x).
- Verify with `ffprobe` for codec, size and duration, and `magick ... -format '%[fx:standard_deviation]' info:` for non-blank.

## Troubleshooting
- Boot wait times out although the device is up: `baguette list --json` lists a booting or booted device under `running`, not `available`. Read both arrays. This caused the fixture's first failed run.
- Device left running after a failure: add the shutdown `trap`; check with `baguette list --json`.
- `boot` warns that closing the Simulator window or quitting Simulator.app shuts the device down; do not do either mid-run.
- Capture or input blocked: macOS may need Screen Recording or accessibility permission; the fixture treats this as blocked, not failed.
- Recording duration outside 2.7 to 3.3 s or blank frames: inspect `ffprobe` output and the extracted frames before changing tolerances.

## Official docs
- [Baguette README](https://github.com/tddworks/baguette) and [releases](https://github.com/tddworks/baguette/releases) (tested 0.3.2); `baguette help <subcommand>` on the installed version.
