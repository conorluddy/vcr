# Web Audio OfflineAudioContext tone

## Intent and scope

- **Tool ID/build:** `web-audio`, native Web Audio API in Chrome for Testing 156.0.8078.4.
- **Claim:** `OfflineAudioContext` renders an owned oscillator tone and gain envelope at a fixed sample rate and duration; the output buffer and WAV are repeatable in the same browser.
- **Exclusions:** no live playback, AudioContext/autoplay, external audio, filters, analysis nodes, other browsers or rates, or musical quality claim.
- **Environment:** macOS 26.6 arm64; Node 25.6.1; VCR Playwright 1.64.1; Chrome for Testing 156.0.8078.4; no Web Audio dependency.
- **Input/rights:** generated 440 Hz sine oscillator, no external assets.
- **Dependencies and effects:** reuse `$HOME/.vcr/runtime/node_modules/playwright` and its installed Chromium; no package install or network download. Browser launch may require permission to execute outside the filesystem sandbox. WAV and temporary buffers go under ignored `output/`.
- **Documentation:** [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and [MDN OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext), checked 2026-11-16.

## Plan, before running

- **Command:** `./run.sh --record` runs the fixture and records `expected/result.json`; `./run.sh` repeats and compares it. The runner uses local Playwright Chromium, creates an `OfflineAudioContext(1, 48000, 48000)`, an oscillator at 440 Hz, and a gain envelope from 0 to 0.5 over 0.05 s, holds through 0.8 s, then reaches 0 at 1 s.
- **Expected checks:** Chrome exactly `156.0.8078.4`; one channel, 48,000 samples, 48,000 Hz, 1.0 s; positive-going zero-crossing estimate within 1 Hz of 440 Hz; attack-window RMS (0.005–0.04 s) in (0.10, 0.20), sustain (0.2–0.7 s) in (0.34, 0.36), release (0.85–0.95 s) in (0.17, 0.20), tail (0.98–0.999 s) below 0.025; exact repeat buffer and WAV hashes. Write 16-bit mono PCM WAV and verify its encoding/sample rate/duration with `ffprobe` if available.
- **Expected artifacts and inspection:** ignored WAV in `output/`; expected JSON has only measured numbers and hashes. Check WAV metadata; listen if an available local route supports it, otherwise state that it was not auditioned.
- **Stop conditions:** unavailable exact browser/runtime, missing OfflineAudioContext, metadata mismatch, failed numeric bounds, nondeterministic repeat, WAV encoding mismatch, or unexpected external/network use.
- **Reproduction:** from repository root run `examples/web-audio-offline/run.sh --record`, then run it again without arguments. Inspect generated WAV with `ffprobe` or an audio player if available.

## Observation, after running

- **Date/executor and actual environment:** 2026-11-16, `Conors-MacBook-Pro-2.local`; macOS 26.6 arm64 (Darwin 25.6.0); Node v25.6.1; Playwright 1.64.1; Chrome for Testing 156.0.8078.4.
- **Observed output and checks:** each of two independent offline renders had 48,000 mono samples at 48,000 Hz (1.0 s); measured tone 440 Hz. RMS attack 0.173235, sustain 0.353553, release 0.183994, tail 0.021141. Buffer SHA-256 `0a44b009977dca28c91606da66fedbb37f3a0e6d4da9fce7ba6aa7a340e68eb3`; repeat buffers matched. Encoded WAVs also matched (SHA-256 `e9971bd52252fc57655ddff3178222e040c75b6ca669ccaf56a31c84dda8e9a5`, 96,044 bytes). `ffprobe` reported pcm_s16le, mono, 48 kHz, 1.000000 s. Record and repeat commands exited 0.
- **Inspection:** WAV container metadata inspected with `ffprobe`; not auditioned because no listening route was available in this session.
- **Pass / limitations:** passed for this generated mono tone, gain envelope and local offline render route. No live playback, other browser versions, output rates, source audio or perceptual-quality claim.
- **Deviations / side effects:** initial record run reached output generation but exposed the missing `expected/` directory; runner now creates it. Local Chromium required execution outside the filesystem sandbox. No network access or dependency installation.
- **Review / revisit:** toolkit guide may now be justified; no guide was added. Revisit when browser or fixture version changes.
