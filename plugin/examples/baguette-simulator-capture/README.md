# Baguette simulator capture evidence

## Intent and scope

- Tool ID and version/build: `baguette` 0.3.2 (`baguette --version`), Homebrew formula on this Mac. The tool card's assessment saw 0.2.14; this run uses the installed 0.3.2 and the record cites that version.
- VCR job and exact claim: baguette boots a named iOS Simulator by UDID (or attaches if already booted), captures one PNG screenshot and a short H.264 screen recording of the home screen, and the outputs have the device's predeclared pixel dimensions and a recording duration within a predeclared tolerance; the simulator is shut down afterwards.
- Explicit exclusions: no pixel hashes or repeatability gate (the status-bar clock and simulator rendering are not deterministic); no app install, no UI assertions, no physical devices, no Apple Watch/iPad/other devices, no `stream`, `render-3d`, `describe-ui`, `serve`, or multi-device orchestration; no visual-quality judgement beyond the contact sheet; no other macOS, Xcode or iOS versions; no claim about the Xcode 27 Device Hub `heal` path.
- Tool documentation and licence sources: `https://github.com/tddworks/baguette` (Apache-2.0, per the tool card); `baguette help <subcommand>` on this machine. Checked 2026-11-24. Simulator runtime and device types are Apple's, from Xcode 26.
- Environment: macOS 26.6, arm64 (Apple Silicon), MacBook Pro. Xcode simulators: `iPhone 17 Pro (EN)`, iOS 26.5, shut down before the run.
- Input: none. The fixture drives the simulator itself (a home-screen swipe during the recording). No media is committed.
- Dependencies and installation plan: no new installs. Uses the existing Homebrew `baguette`, the Xcode simulator runtime, `ffmpeg`/`ffprobe` (for the recording metadata and one extracted frame) and ImageMagick `magick` (for `identify` statistics). `node` (already installed) reads `baguette list --json`.
- Permissions and network: the run boots and shuts down one local simulator. Screen-recording and accessibility permissions may be needed by macOS for baguette's input and capture; if the run is blocked by one, it is reported as blocked. No network access is intended.
- Side effects: the chosen simulator is booted, used for about 6 seconds, and always shut down by a shell `trap`, including on failure. Simulator.app's `lifetime` setting is not changed.
- Selected workspace and cleanup paths: the simulator UDID is set in `run.sh`. Screenshot, recording and frame files live in the git-ignored `examples/baguette-simulator-capture/output/`. Only `expected/capture.json` (predeclared checks) and `expected/observed.json` (non-gating measurements) are committed.

## Plan, before running

- Exact commands, versions and parameters:
  - `baguette list --json`, parse the `available` entry whose `udid` is `FD84C3BC-FC27-4FEE-BBBD-9955FDA2F45C`; expect name `iPhone 17 Pro (EN)`, runtime `iOS 26.5`.
  - If its `state` is `Shutdown`: `baguette boot --udid <udid>`, then poll `baguette list --json` for up to 120 s until the state is no longer `Shutdown`.
  - `baguette press --udid <udid> --button home` to start from the home screen.
  - `baguette screenshot --udid <udid> --output output/home.png --metadata-output output/home-geometry.json` (native size, PNG).
  - `baguette record --udid <udid> --output output/home.mp4 --size native --fps 30 --duration 3`, started in the background; after 1.0 s, `baguette swipe --udid <udid> --start-x 330 --start-y 437 --end-x 70 --end-y 437 --width 402 --height 874 --duration 0.4` (a page swipe on the home screen), then `wait` for the recording.
  - `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,nb_frames,avg_frame_rate -show_entries format=duration -of json output/home.mp4`.
  - `ffmpeg -loglevel error -ss 0.5 -i output/home.mp4 -frames:v 1 output/frame-early.png` and the same at `-ss 2.5` for `output/frame-late.png`.
  - `magick identify -format '%[standard-deviation]' output/home.png` (and the same for the recorded frames), normalised by ImageMagick's quantum range.
  - Shutdown: `trap` runs `baguette shutdown --udid <udid>` on exit; afterwards `baguette list --json` must show the UDID as `Shutdown`.
- Predeclared checks and tolerances (values live in `expected/capture.json`):
  - C1 device found by UDID, name `iPhone 17 Pro (EN)`, runtime `iOS 26.5`; reaches a non-`Shutdown` state within 120 s, or was already booted.
  - C2 screenshot is a PNG with dimensions 1206 x 2622 px (iPhone 17 Pro native pixel size) and `output/home-geometry.json` is written.
  - C3 screenshot not blank: standard deviation of normalised pixel values greater than 0.02.
  - C4 recording is H.264 in an MP4 with width 1206 and height 2622, and a container duration between 2.7 s and 3.3 s (requested 3 s).
  - C5 recording not blank and changing: the normalised standard deviation of both extracted frames is greater than 0.02, and the two frames differ (a different SHA-256), showing the swipe was captured.
  - C6 after the run the UDID is `Shutdown` in `baguette list --json`.
  - No pixel hash is gated; determinism is not part of the claim.
- Expected artifacts: `output/home.png`, `output/home-geometry.json`, `output/home.mp4`, `output/frame-early.png`, `output/frame-late.png`, `output/ffprobe.json`, `output/summary.json` (each check's measured value and pass/fail), and `expected/observed.json` after `--record`.
- Intended consumer and handoff: an internal native-app preview route. A VCR capture from a simulator would still need the frames or video to be composed elsewhere; this fixture does not prove that handoff.
- Delivery constraints and units: pixel dimensions and seconds only; no byte budget.
- Expected failure modes and stop conditions:
  - `baguette boot` fails or the device never leaves `Shutdown`: stop, record `blocked` (environment) with the message.
  - macOS denies screen recording or input permission: stop, record `blocked`.
  - Screenshot dimensions differ from 1206 x 2622: record `partial` at most, with the measured dimensions; do not change the expected values to pass.
  - Recording opens but is blank or duration outside 2.7 to 3.3 s: partial, with the probe output.
  - Shutdown fails: fail the run (the simulator must be left shut down).
- Reproduction and inspection: `examples/baguette-simulator-capture/run.sh --record`, then `examples/baguette-simulator-capture/run.sh`. Inspect `output/home.png` at fit-to-window size and the `output/frame-*.png` pair. Contact sheet: `magick output/home.png output/frame-early.png output/frame-late.png +append -resize 50% output/contact.png`.

## Observation, after running

- Result: pass. Final `run.sh --record` and `run.sh` both printed `baguette-simulator-capture: OK` on 2026-11-24 on `Conors-MacBook-Pro-2.local`, with checks C1 to C6 all PASS.
- Versions and runtime: baguette 0.3.2 (`baguette --version`; the card's assessment saw 0.2.14); ffmpeg and ffprobe 9.0.2; ImageMagick 7.1.2-35 Q16-HDRI; Node v22.19.0; macOS 26.6 arm64; simulator device `iPhone 17 Pro (EN)`, UDID `FD84C3BC-FC27-4FEE-BBBD-9955FDA2F45C`, runtime iOS 26.5. Playwright and Chromium are not used. The Xcode version was not read (an `xcodebuild -version` call was refused by the sandbox).
- Measured, final `run.sh` pass (the recorded run is in `expected/observed.json`, with the same checks):
  - C1 name `iPhone 17 Pro (EN)`, runtime `iOS 26.5`.
  - C2 screenshot PNG 1206 x 2622.
  - C3 screenshot normalised standard deviation 0.190 (threshold 0.02).
  - C4 recording H.264 in MP4, 1206 x 2622, duration 3.007 s (record pass 2.862 s; tolerance 2.7 to 3.3 s). Baguette reported 42 frames in 3.01 s (record pass: 54 frames in 2.86 s).
  - C5 frame at 0.5 s deviation 0.268, frame at 2.5 s deviation 0.254, both above 0.02, with different SHA-256 values.
  - C6 `baguette list --json` shows `Shutdown` after the run.
- Contact sheet: `examples/baguette-simulator-capture/output/contact.png` (ignored). Left to right: the screenshot, the frame at 0.5 s, the frame at 2.5 s. I inspected it at fit-to-window size. It shows the iOS 26.5 home screen with the Maps, Calendar, Photos, Reminders and News icons, Dock, search pill and clock 08:47, with real app icons and no blank or clipped frame. The 0.5 s frame is page 1 and the 2.5 s frame is the second home page (Fitness, Watch, Contacts, Files, Preview, Utilities, Grapla), so the swipe was captured. The status bar and wallpaper are the simulator's own.
- Deviations and limits, honestly reported:
  - The first `--record` attempt failed: `check.mjs` read only `baguette list --json`'s `available` array, but a booting or booted device is listed under `running`, so the boot wait timed out after 120 s and the trap shut the device down. The fix (read both arrays) changed no expected value and no predeclared check. The failed attempt's log was not kept.
  - The plan said C1 would wait for "non-Shutdown"; `run.sh` waits for `Booted`, which is stricter. The name and runtime part of C1 was added after the first recording pass and before the final runs; the final record and verify runs include it.
  - `baguette boot` printed `Booted` and returned, with the warning that closing the Simulator window or quitting Simulator.app shuts the device down. Whether a Simulator.app window was shown was not checked, so "headless" is not established here beyond the command returning.
  - SimulatorKit delivers frames only when the screen changes, so the recording's frame count varied between runs (29 to 54 across the five completed recordings). Only duration and dimensions are gated, not frame counts.
  - The home-screen content (Calendar, Maps region, app icons) is this Mac's simulator state. The outputs are not committed.
- What this establishes: on this Mac (macOS 26.6, Apple Silicon), baguette 0.3.2 can boot one named iOS 26.5 iPhone 17 Pro (EN) simulator by UDID, capture a native-size 1206 x 2622 PNG, make a 3 s H.264 MP4 of a home-screen swipe, and leave the device shut down.
- What this does not establish: pixel determinism or hashes; input timing or accuracy beyond the swipe; other devices, runtimes, Xcode versions, macOS versions or physical devices; `stream`, `describe-ui`, `render-3d`, multi-device sessions; quality of the frames beyond the contact-sheet check; behaviour without Screen Recording or input permissions.
- Reviewer and follow-up: none yet. Revisit if Xcode 27 Device Hub (`baguette heal`) changes the input surface, or when baguette's installed version changes from 0.3.2.
