---
name: web-audio
description: Use the native Web Audio API for browser audio generation or analysis without a library. This guide covers OfflineAudioContext synthesis and repeatability only.
---

# Web Audio API

## Use cases and limits

Use `OfflineAudioContext` for sample-time audio generation that should not depend on playback or a wall clock. The VCR fixture renders one 440 Hz oscillator through a gain envelope and checks repeatable PCM/WAV output. It does not validate live playback, microphone input, effects, other sample rates or browsers, or perceptual quality. For musical scheduling and instruments, use Tone.js; use FFmpeg to mix existing files.

## Capability map

| Area | Reference | VCR evidence |
| --- | --- | --- |
| Offline rendering | [OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext) | Exercised: one mono 48 kHz oscillator buffer and `startRendering()`. |
| Sources, nodes and connections | [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | OscillatorNode and GainNode with a gain envelope exercised; other nodes and graph layouts untested. |
| Buffer output | [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) | Sample count, channel data and repeated sample equality exercised; streaming and real-time output untested. |

## Install and doctor

There is no package to install for the browser API. `vcr doctor` does not probe browser APIs; use the VCR capture runtime to launch the tested browser. The fixture uses Chrome for Testing 156.0.8078.4 on macOS arm64.

## Smoke test

```sh
./run.sh
# expect: pass; 48,000 mono samples at 48 kHz, estimated tone 440 Hz, identical repeated buffers and WAVs, ffprobe PCM s16le, 1.000000 s
```

The fixture retains numeric checks and a WAV hash. It does not audition the WAV.

## Troubleshooting

- `OfflineAudioContext is unavailable`: run in a supported browser page rather than Node; the fixture depends on browser globals.
- The fixture launches Playwright Chromium. It does not test autoplay policy or audio output devices because it renders offline.

## Official docs

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext)
- [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer)
