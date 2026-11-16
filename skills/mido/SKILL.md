---
name: mido
description: Use Mido to read, inspect, create, and modify MIDI 1.0 messages and Standard MIDI Files in Python. VCR evidence covers a type-1 file round trip with Mido 1.3.2, not playback or synthesis.
---

# Mido

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Mido is a Python library for MIDI 1.0 messages, files, and optional ports. MIDI events describe symbolic timing and note/control data; they are not audio.
- VCR validates writing, parsing, and re-saving one generated type-1 Standard MIDI File with two tracks, tempo metadata, and two note events.
- Playback, live ports/backends, MIDI 2.0, synthesis, SysEx edge cases, and musical quality are untested. Use a synthesizer/host to render MIDI to sound.

## Capability map
- **Messages and event data:** see the [Mido API reference](https://mido.readthedocs.io/en/1.3.2/api.html) for message types and conversion helpers. The fixture checks note-on/note-off messages and one tempo meta-message.
- **Standard MIDI Files:** the [file guide](https://mido.readthedocs.io/en/1.3.2/files/midi.html) covers loading, tracks, delta times, tempo, and saving. The fixture exercises a type-1 read/write round trip and repeat-save byte equality.
- **Ports and playback:** described in the [ports guide](https://mido.readthedocs.io/en/1.3.2/ports/), but not tested; a backend and MIDI device are separate requirements.

## Install and doctor
Install Mido into a project virtual environment, not globally:

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install 'mido==1.3.2'
python -c 'import mido; print(mido.__version__)'
```

`vcr doctor` checks registered machine tools, not packages in a project virtual environment. Verify the active interpreter and pinned Mido version with the commands above.

## Smoke test
```sh
cd examples/mido-roundtrip && ./run.sh
# expect: OK mido-roundtrip
```
The example creates an isolated `output/venv`, installs Mido 1.3.2, and checks event semantics plus repeat-save byte equality.

## Troubleshooting
- The wrong package version is imported: activate the intended virtual environment and check `python -m pip show mido`.
- MIDI event times differ: Mido stores per-track delta times in ticks; the fixture uses 480 ticks per beat and a 500000 µs/beat tempo.
- A saved MIDI file is unchanged but sounds wrong: Mido only edits symbolic events; playback and synthesis are outside this guide's evidence.

## Official docs
- [Mido 1.3.2 Standard MIDI Files](https://mido.readthedocs.io/en/1.3.2/files/midi.html)
- [Mido 1.3.2 API reference](https://mido.readthedocs.io/en/1.3.2/api.html)
- [Mido 1.3.2 ports](https://mido.readthedocs.io/en/1.3.2/ports/)
- [Mido repository and MIT license](https://github.com/mido/mido/tree/1.3.2)
