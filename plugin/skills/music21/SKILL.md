---
name: music21
description: Create and inspect symbolic scores with music21. VCR evidence covers a generated three-note MusicXML write/reopen round trip, not corpus use, playback or engraving appearance.
---

# music21

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use music21 for symbolic score structures, notation formats and computational music analysis; use Mido for lower-level MIDI events and ports.
- VCR validates one owned three-note score exported to MusicXML and parsed back with pitches and quarter lengths preserved.
- No corpus, third-party score, audio playback, synthesis, engraving appearance or general score compatibility is tested. Corpus and score rights are separate from the library licence.

## Capability map
- **Streams and score objects:** the [User's Guide](https://music21.org/music21docs/usersGuide/index.html) introduces `Stream`, `Score`, `Part`, `Measure` and note objects. The fixture builds a one-measure `Score` with a `Part`, time signature and three notes.
- **Format conversion:** the [file formats guide](https://music21.org/music21docs/usersGuide/usersGuide_08_installingMusicXML.html) covers import/export; the [`Stream.write` reference](https://music21.org/music21docs/moduleReference/moduleStreamBase.html#music21.stream.base.Stream.write) writes a format, and [`converter.parse`](https://music21.org/music21docs/moduleReference/moduleConverter.html) reopens it. VCR tests only MusicXML round-trip semantics.
- **Analysis and corpus:** the [module reference](https://music21.org/music21docs/moduleReference/index.html) maps other APIs. Analysis methods, corpus access, MIDI, playback and engraving are documented but untested here.

## Install and doctor
The fixture pins music21 10.5.2 and CPython 3.12.13 in `uv.lock`:

```sh
cd examples/music21-musicxml
uv sync --locked --python /opt/homebrew/bin/python3.12
```

music21 is a project Python package, not a machine executable. `vcr doctor` does not establish the fixture's virtualenv import; check with `.venv/bin/python -c 'import music21; print(music21.__version__)'`.

## Smoke test
```sh
cd examples/music21-musicxml && ./run.sh
# expect: music21-musicxml: OK
```
The fixture generates the score twice in separate processes, exports MusicXML, reparses it, and compares pitches, durations and normalized XML hash. The random MusicXML part ID is normalized, so raw XML bytes are not expected to match.

## Troubleshooting
- If `uv sync` selects another interpreter, use the pinned Python 3.12 path from the fixture and preserve `uv.lock`.
- If MusicXML output differs, inspect pitch names, quarter lengths and the generated part ID before changing expected output.
- Do not load the optional music21 corpus as a smoke-test input; its rights are distinct and outside this fixture.

## Official docs
- [music21 10.5.2 User's Guide](https://music21.org/music21docs/usersGuide/index.html)
- [music21 converter reference](https://music21.org/music21docs/moduleReference/moduleConverter.html)
- [music21 MusicXML format guide](https://music21.org/music21docs/usersGuide/usersGuide_08_installingMusicXML.html)
