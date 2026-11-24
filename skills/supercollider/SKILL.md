---
name: supercollider
description: Render a scored SuperCollider sine sequence offline to a WAV headlessly with `sclang -D` and `Score.recordNRT` (scsynth -N). Load for scripted synthesis with exact note timing; use Csound for the same job in a single .csd, SoX for effects, Tone.js for browser synthesis.
---

# SuperCollider

A synthesis platform: the `sclang` language builds a score, the `scsynth` server renders it. In non-real-time (NRT) mode `Score.recordNRT` writes an OSC score file and runs `scsynth -N` on it, with no audio device.

`vcr` below means `pnpm vcr` inside the VCR repository.

## Use cases and limits
- Scored synthesis: notes with exact start, duration, frequency and amplitude, rendered to WAV from the score alone. Reruns are byte-identical on the tested host, which is what SOUND-SYNTH-DETERMINISM asks of generated audio.
- Neighbours: `csound` for the same scored-synthesis job in one self-contained `.csd` (its evidence is complete); `pure-data` for a patched dataflow render in batch mode; `sox` for effect chains and trims; `tone-js` for browser synthesis; `ffmpeg` for muxing and delivery.
- Rate, headroom and ceiling are policy, not this tool: `vcr rules info SOUND-SAMPLE-RATE`, `SOUND-CLIP`, `SOUND-TRUE-PEAK`. The fixture's 48 kHz and amplitudes 0.2 to 0.6 are parameters, not recommendations; its peak check is a sample-peak bound.
- Evidence is partial: SuperCollider 3.14.1 (Homebrew cask), macOS arm64, one SynthDef (`SinOsc` times `EnvGen` with `Env.linen`, two identical channels), five notes, 48 kHz stereo 16-bit WAV. No listening test, no spectral purity claim.
- Untested: the real-time server, UGens beyond `SinOsc` and `EnvGen`, sc3-plugins, MIDI, `Routine`/`Pbind`, other versions or platforms, dither.

## Capability map
Discovery only; none of this is VCR validation unless marked tested. Entry: [documentation](https://doc.sccode.org/), [Score help](https://doc.sccode.org/Classes/Score.html), [NRT guide](https://doc.sccode.org/Guides/Non-Realtime-Synthesis.html), [project site](https://supercollider.github.io/).
- Tested: `sclang -D file.scd` headless; `SynthDef`, `SinOsc.ar`, `EnvGen.ar` with `Env.linen` and `doneAction: 2`, `Out.ar`; OSC score messages `d_recv`, `g_new`, `s_new`; `Score(...).recordNRT` with WAV and int16; `Score.program` pointed at the bundled `scsynth`.
- Documented, untested: other UGens (filters, noise, buffers, `PlayBuf`), the real-time `Server`, patterns (`Pbind`, `Routine`), MIDI and OSC input, other header and sample formats, the IDE, sc3-plugins.

## Install and doctor
```text
brew install --cask supercollider
/Applications/SuperCollider.app/Contents/Resources/scsynth -v    # scsynth 3.14.1
vcr doctor
```
Never assume it is installed. Binaries live inside the app bundle: `sclang` in `Contents/MacOS`, `scsynth` in `Contents/Resources`. Never launch the GUI binary `Contents/MacOS/SuperCollider` in a script: it opens the IDE. Card licence: GPL-3.0 (not re-verified).

## Smoke test
```text
vcr example create supercollider-nrt-render && (cd examples/supercollider-nrt-render && ./run.sh)
# expect today: exit 1, "supercollider-nrt-render: predeclared check failed", only frames_192000 false (192064 frames)
```
Needs `python3` (standard library only). Run 2026-11-24. The failure is the recorded partial finding, not a broken install; `expected/` is not kept until the check is replanned.

## Recipe
```text
sclang -D render.scd        # headless; wrap in a timeout, macOS has no timeout(1)
```
```text
Score.program = Platform.resourceDir +/+ "scsynth";
score.add([0.0, [\d_recv, def.asBytes]]);
score.add([0.0, [\g_new, 1, 0, 0]]);
score.add([0.25, [\s_new, \vcrSineEnv, 1000, 0, 1, \freq, 440, \dur, 0.5, \amp, 0.5]]);
Score(score).recordNRT(oscPath, wavPath, nil, 48000, "WAV", "int16", options, "", durationS, doneFunc);
```
`options` is `ServerOptions.new.numOutputBusChannels_(2).numInputBusChannels_(0)`. Check `exitCode` and the file in `doneFunc` and call `1.exit` on failure; `0.exit` when done, or `sclang` never returns.

Shown by the fixture: onsets within 0.56 ms, durations within 0.85 ms, pitch within 0.006 cents, sustain peaks within 0.00004 of the scored amplitude, gaps silent (max 0.0), channels identical, two renders byte-identical on this host and build. Amplitudes are exact to the score; the envelope ramps keep note edges click-free by construction (SOUND-CLIP), unheard.

## Gotchas
- Length: output ran one 64-sample control block past the score end (192064 vs 192000 frames). Trim the WAV to the intended length, or end the score on a block boundary. The cause was not isolated.
- Do not assume the final frame count equals `durationS * sampleRate`; read it from the WAV (SOUND-TAIL-INTACT applies when trimming).
- The `Score.recordNRT` command line is not printed in the sclang log; it is in the class library source.
- Keep the score free of random UGens and clocks; the fixture has none, and byte identity is for this host and build only.

## Troubleshooting
- `sclang` or `scsynth` missing: install the cask; `run.sh` exits 1 naming them.
- IDE window or Qt helper processes appear: a script launched `Contents/MacOS/SuperCollider`; kill them and use `sclang -D`.
- No WAV: read `output/sclang-render.log`; `run.sh` reports the path and a 120 s timeout.
- Frame-count check fails: expected, see Gotchas.

## Official docs
- https://supercollider.github.io/
- https://doc.sccode.org/Classes/Score.html
- https://doc.sccode.org/Guides/Non-Realtime-Synthesis.html
