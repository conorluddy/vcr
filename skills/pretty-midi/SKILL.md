---
name: pretty-midi
description: Use pretty_midi to build, read and sample symbolic MIDI as instruments, notes in seconds, tempo changes, pitch bends and piano rolls in Python. VCR evidence covers a two-instrument file round trip with 0.2.11.post0, not synthesis.
---

# pretty_midi

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- pretty_midi works in seconds, notes and piano rolls: a `PrettyMIDI` holds `Instrument`s of `Note`s and `PitchBend`s with times in seconds. `mido` works at message and tick level; pretty_midi uses Mido as its file backend. Use `mido` for raw messages, `music21` for notation-level analysis.
- Useful for sound design (`SOUND-BEAT-ALIGN`, `SOUND-BPM-FRAME-GRID`): read note or tempo-change times in seconds, then convert to frames in the scene. Choosing the tolerance is the brief's job, not this guide's.
- VCR validates one generated type-1 file: two instruments, five notes, a 120 to 60 BPM tempo change at 1.0 s and two piano pitch bends. Tested on macOS arm64 only.
- Not tested: synthesis (`synthesize`, `fluidsynth`; the wheel ships `TimGM6mb.sf2`, unused here), audio output, other MIDI formats, control changes, drums, SysEx, piano rolls of pitch-bent instruments, other platforms, musical quality.
- **Fragile: no public tempo authoring in 0.2.11.post0.** The fixture sets the private `_tick_scales` and calls `_update_tick_to_time(maxTick)`. Private names may change in any release; pin the version, or author tempo with `mido` and load that file. Reading tempo (`get_tempo_changes()`) uses public API only.

## Capability map
Discoverability only; the [API documentation](https://craffel.github.io/pretty-midi/) is the authority.
- **Tested:** `PrettyMIDI(resolution, initial_tempo)`, `Instrument`, `Note`, `PitchBend`, `write`, reading a file back, `get_tempo_changes`, `get_end_time`, `get_piano_roll(fs=8)`.
- **Documented, untested:** `synthesize`/`fluidsynth` audio rendering, `get_chroma`, `get_pitch_class_histogram`, `adjust_times`, `remove_invalid_notes`, control changes, lyrics and key/time signatures, the `pretty_midi.utilities` helpers.

## Install and doctor
Use a project virtual environment, not global Python. The fixture uses Homebrew Python 3.12; pyenv 3.12.2 here lacks `_lzma`, so its `venv`/`pip` were not used.

```sh
/opt/homebrew/bin/python3.12 -m venv examples/pretty-midi-roundtrip/output/venv
examples/pretty-midi-roundtrip/output/venv/bin/python -m pip install -r examples/pretty-midi-roundtrip/requirements.txt
```
The pins are pretty_midi 0.2.11.post0 with mido 1.3.3, numpy 2.5.5, six, packaging, importlib_resources. Check with `python -c "import pretty_midi; print(pretty_midi.__version__)"`. `vcr doctor` does not check packages in a project virtual environment.

## Smoke test
```sh
cd examples/pretty-midi-roundtrip && ./run.sh
# expect: OK pretty-midi-roundtrip
```
`run.sh` requires the venv above (it does not install) and compares `pip freeze` with `requirements.txt`. It builds the file in two processes and diffs `expected/metrics.json`: note and bend read-back error 0.0 s (tolerance one 60 BPM tick, 0.00208 s), tempo times `[0.0, 1.0]`, end 2.5 s, 147 bytes, SHA-256 `65d76b26...fc967e` both times.

## Recipes
- Times are seconds; the file stores ticks (480 per beat in the fixture). Compare read-back within one tick at the slowest tempo.
- Piano roll: `get_piano_roll(fs=8)` gave shape 128 x 20 with 28 exact cells, velocities as values. Columns run `int(start*fs)` to `int(end*fs)` exclusive. The roll was taken on the model without pitch bends; with bends pretty_midi shifts rows, which is untested.
- Byte identity held across processes with the same pinned set; a mido or numpy change can alter bytes while read-back still passes.

## Troubleshooting
- `venv` or `pip` fails with a missing `_lzma`: the pyenv interpreter was built without it; use Homebrew `python3.12`.
- `run.sh` says installed packages differ: recreate the venv from `requirements.txt`.
- Tempo times read as one 120 BPM change: no tempo map was set; see the fragile note above.

## Official docs
- [pretty_midi documentation](https://craffel.github.io/pretty-midi/)
- [pretty_midi repository (MIT)](https://github.com/craffel/pretty-midi)
