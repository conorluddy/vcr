# Tone.js offline scheduled notes fixture

## Intent and scope

- Tool ID and version/build: Tone.js 15.1.22.
- VCR job and exact claim being tested: use `Tone.Offline()` with its offline Transport to render three scheduled, known-pitch Synth notes into a browser AudioBuffer; assert buffer duration/rate, note onset times, dominant note frequencies, envelope amplitude, and repeatability.
- Explicit exclusions: live playback, microphone/input, sample loading, effects, musical quality, arbitrary MIDI or scores, WAV encoding quality, and VCR video/audio muxing.
- Tool documentation and licence sources, checked 2026-11-16: official Tone.js Offline example https://tonejs.github.io/examples/offline and npm package https://www.npmjs.com/package/tone (MIT).
- Environment: macOS 26.6 arm64, `Conors-MacBook-Pro-2.local`, Node.js 25.6.1, npm 11.9.0, Playwright 1.64.1, Chromium for Testing 156.0.8078.4.
- Input: owned three-note schedule (C4, E4, G4 at 0.10, 0.45, 0.80 seconds) constructed in fixture source; no external audio, samples, or assets.
- Dependencies, installation plan, permissions and expected side effects: fixture-local `tone@15.1.22`, `playwright@1.64.1`, `esbuild@0.25.12` pinned in `package-lock.json`; installed only under this example using `npm ci --ignore-scripts --no-audit --no-fund`. Used the machine's cached Playwright Chromium. npm added 9 packages to fixture-local `node_modules`; no global/system install intended or made.
- Selected workspace, generated output and cleanup paths: this repository worktree; generated browser bundle, WAV and logs remain in ignored `output/`.

## Plan, before running

- Exact commands and reviewed recipe: `npm ci --ignore-scripts --no-audit --no-fund`; `./run.sh --record`; inspect the generated WAV if an audio inspection route is available; then `./run.sh`. Bundle a browser fixture with esbuild, use Playwright Chromium, and invoke actual `Tone.Offline(async ({ transport }) => { ... }, 1.2, 1, 48000)`. Set offline transport to 120 BPM; schedule sine `Tone.Synth` notes at seconds 0.10, 0.45, 0.80, each for `8n` with fixed velocity and declared 10 ms attack / 20 ms decay / 0.6 sustain / 50 ms release; call `transport.start(0)`.
- Predeclared checks: one-channel AudioBuffer exactly 57,600 samples at 48,000 Hz (1.2 seconds); first envelope crossing 0.02 amplitude within ±0.015 seconds of each declared onset; first-note dominant zero-crossing estimate within ±5 Hz of C4/E4/G4 (261.63/329.63/392.00 Hz) in windows at onset+0.06 seconds; each note window RMS above 0.05; inter-render Float32 sample SHA-256 identical.
- Intended consumer and handoff: offline mono PCM buffer for subsequent audio encoding/muxing; this fixture does not validate encoding or synchronization to video.
- Delivery constraints and units: 48 kHz, mono, 16-bit PCM WAV only as an ignored inspection artifact; expected evidence retains JSON metrics, not audio media.
- Expected failure modes and stop conditions: offline context unsupported, Tone import/render failure, duration/rate/channel mismatch, missed onset or pitch/RMS tolerance, non-repeatable samples, or inability to inspect audio if claiming perceptual quality. Do not use raw Web Audio instead of Tone.Offline.
- Reproduction and inspection: `npm ci --ignore-scripts --no-audit --no-fund && ./run.sh`; `./run.sh --record` updates `expected/metrics.json`. `output/tone-offline.wav` can be played at normal speed if an audio player is available.

## Observation

- Date/executor and commands: 2026-11-16 on local macOS arm64; `npm install --ignore-scripts --no-audit --no-fund`, `./run.sh --record`, then clean `npm ci --ignore-scripts --no-audit --no-fund && ./run.sh`.
- Observed checks: Tone.Offline produced one 48 kHz channel with 57,600 samples (1.200000 s), peak 0.799986; sample Float32 SHA-256 `9fc2439d7d01f1af2378feab87872c44d13a9de3d84ddfb41ee4763b53ab911c`, identical across independent renders. Measured onsets were 0.101458, 0.450417, 0.800354 s; measured frequencies were 261.626, 329.628, 391.995 Hz; RMS values were 0.339835, 0.339920, 0.339809. Every assertion passed on both record and verify runs.
- Output inspection: `afinfo` confirmed `output/tone-offline.wav` is mono 48 kHz 16-bit PCM, 1.2 seconds, 115,200 audio bytes. This environment exposes no listening path to me; I did not audition the file and make no perceptual claim.
- Result: pass for the narrowly defined Tone.Offline note timing/sample claim. Expected numeric evidence is in `expected/metrics.json`; generated WAV and browser bundle remain ignored in `output/`.
- Deviations and limitations: actual Tone.Offline + Tone.Transport and Tone.Synth were used; no substitute API. Does not establish live playback, other browsers/OSes, sample instruments, effects, encoding/muxing, or musical quality.
- Reviewer and invalidation: pending parent review; revisit on Tone.js, Playwright/Chromium, or schedule change.
