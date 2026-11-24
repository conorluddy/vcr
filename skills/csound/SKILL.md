---
name: csound
description: Render a hand-written Csound score offline to a WAV with `csound -W -o`, for scripted synthesis with exact note timing and pitch. Load for scored sine or tone generation; use SoX for effect chains and Tone.js for browser synthesis.
---

# Csound

A programmable synthesis system. A `.csd` file holds options, instruments (`<CsInstruments>`) and a score (`<CsScore>`); `csound -W -o out.wav file.csd` renders it offline, with no audio device opened.

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- Scored synthesis: notes with exact start, duration, frequency and amplitude, rendered to WAV as a pure function of the file. Output is reproducible, which is what SOUND-SYNTH-DETERMINISM asks of generated audio.
- Neighbours: `sox` for effect chains, trims, fades and resampling of existing WAV; `tone-js` for synthesis inside a browser scene; `ffmpeg` for muxing audio into video and delivery.
- Rate, headroom and ceiling are policy, not this tool: `vcr rules info SOUND-SAMPLE-RATE`, `SOUND-CLIP`, `SOUND-TRUE-PEAK`. The fixture's 48 kHz, amplitude 0.5 and 0dbfs 1 are parameters, not recommendations; its peak check is a sample-peak bound, not true peak or loudness.
- Evidence is narrow: Csound 7.0.0_1 (Homebrew, double samples), macOS arm64, one sine instrument, six notes, 16-bit mono 48 kHz WAV. No listening test, no spectral purity or aliasing claim, no random opcodes, real-time audio, MIDI or plugins, no other builds. Csound 7 is a major version; differences from 6.x syntax were not tested.

## Capability map
Official entry: [manual](https://csound.com/docs/manual/), [CSD file format](https://csound.com/docs/manual/CsoundSynthesizer.html), [command-line flags](https://csound.com/docs/manual/CommandFlags.html). Discovery only; `csound --help` lists this build's flags.
- Tested: `.csd` with empty `<CsOptions>`, header constants `sr`, `ksmps`, `nchnls`, `0dbfs`; opcodes `linseg`, `poscil`, `out`; score statements `f` (GEN10 sine table), `f 0 <seconds>` for fixed length, `i` notes; flags `-W` and `-o file`.
- Documented, untested: other oscillators and filters, `rand`/`random` and seeding, MIDI input, real-time output (`-o dac`), other sample formats and file types, orchestra/score separation (`-o`, `.orc`/`.sco`), the C/Python/JS embedding APIs, plugins.

## Install and doctor
```text
brew install csound
csound --version     # banner: Csound version 7.0 (double samples)
vcr doctor
```
Never assume it is installed. Card licence: LGPL-2.1-or-later for the core project (not re-verified).

## Smoke test
```text
vcr example create csound-offline-render && (cd examples/csound-offline-render && ./run.sh)
# expect: csound-offline-render: OK
```
Needs `python3` (standard library only); validated 2026-11-24.

## Recipe
```text
<CsInstruments>
sr = 48000
ksmps = 64
nchnls = 1
0dbfs = 1
instr 1
  aenv linseg 0, 0.005, p5, p3 - 0.015, p5, 0.01, 0   ; 5 ms attack, 10 ms release
  asig poscil aenv, p4, 1
  out asig
endin
</CsInstruments>
<CsScore>
f 1 0 16384 10 1        ; sine table
f 0 3                   ; keep the render exactly 3.0 s
i 1 0.0 0.4 220 0.5     ; start, duration, Hz, amplitude
</CsScore>
```
```text
csound -W -o out.wav fixture.csd > csound.log 2>&1
```
Shown by the fixture: 144000 frames, 48000 Hz, mono, 16-bit, 3.000 s; peak 0.5 as predicted; six notes (220 to 1100 Hz) measured within 0.01 cents of nominal; onsets 0.15 to 0.29 ms after the scored start; gaps silent (max |x| 0.0); two renders byte-identical with `cmp` on this host and build. Envelope ramps keep note edges free of clicks by construction (SOUND-CLIP); no listening test.

## Gotchas
- Always set `f 0 <seconds>`: without it the render ends when the last note's release ends, and a tail or trailing silence would be shortened (SOUND-TAIL-INTACT). Not tested without it.
- Sample width came out 16-bit with `-W` on this build; the fixture records it rather than asserting a default. Read the WAV header, do not assume.
- Reproducibility depends on avoiding random opcodes and devices; the fixture uses none. Byte identity is for this host and build only.
- Send Csound's chatter to a log file; the exit status, not stdout, tells you whether the render worked.

## Troubleshooting
- `csound` missing: `brew install csound`; `run.sh` exits 1 naming it.
- Render fails: read the log (`output/csound-a.log`); the script reports the path.
- Frequency or onset check fails: compare the `i` lines in the `.csd` with the predeclared table; the analysis parses them first.

## Official docs
- https://csound.com/
- https://csound.com/docs/manual/
- https://csound.com/docs/manual/CsoundSynthesizer.html
