---
name: tone-js
description: Use Tone.js when a browser scene needs scheduled musical events or instrument abstractions. This guide covers the validated offline Transport and Synth route only.
---

# Tone.js

## Use cases and limits

Use Tone.js when scheduled notes need a musical Transport and Synth abstractions. The fixture proves a narrow offline path: three scheduled sine notes rendered to a repeatable mono buffer. It does not validate live playback, effects, samples, arbitrary scores, musical quality, other browsers, or video muxing. For a few oscillators and gain ramps, use the native Web Audio API; use FFmpeg to mix existing files.

## Capability map

| Area | Reference | VCR evidence |
| --- | --- | --- |
| Offline rendering | [Tone.Offline example](https://tonejs.github.io/examples/offline) | Exercised: `Tone.Offline`, its `Transport`, three `Synth` notes, 48 kHz mono output and repeatable samples. |
| Transport | [Tone.js 15.1.22 Transport docs](https://tonejs.github.io/docs/15.1.22/classes/Transport.html) | Exercised: BPM and scheduled note events. Other scheduling and sync behavior is untested. |
| Instruments and effects | [Tone.js 15.1.22 API index](https://tonejs.github.io/docs/15.1.22/) | Synth oscillator and envelope exercised; other instruments, effects and routing are documented but untested. |

## Install and doctor

Install in the project that owns the browser scene:

```sh
pnpm add tone
```

Tone.js is a project dependency, not a machine executable; `vcr doctor` does not probe it. Confirm the project's package resolution with `vcr tools info tone-js`.

## Smoke test

Run the validated fixture from its directory:

```sh
./run.sh
# expect: pass; 57,600 samples at 48 kHz, three notes near 261.626/329.628/391.995 Hz, repeat sample hash 9fc2439d7d01f1af2378feab87872c44d13a9de3d84ddfb41ee4763b53ab911c
```

Timing and RMS values are measured; exact samples and expected JSON are retained by the fixture. It uses Tone.js 15.1.22, Playwright 1.64.1 and Chromium 156.0.8078.4 on macOS arm64.

## Troubleshooting

- If the project cannot resolve `tone`, install it in that project and rerun the fixture's `npm ci` before its command.
- The fixture doesn't audition output. Its frequency, onset, RMS and repeatability checks do not establish perceptual quality.

## Official docs

- [Tone.js 15.1.22 API](https://tonejs.github.io/docs/15.1.22/)
- [Tone.Offline example](https://tonejs.github.io/examples/offline)
