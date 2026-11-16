# music21 generated MusicXML round trip

## Intent and scope

- **Tool/version:** music21 10.5.2, pinned in `pyproject.toml` and `uv.lock`.
- **Runtime:** CPython 3.12.13 from `/opt/homebrew/bin/python3.12`; macOS 26.6 arm64.
- **Claim:** build an owned three-note score, export it to MusicXML, reopen it with music21, and preserve pitch names and quarter lengths.
- **Exclusions:** no bundled music21 corpus or external scores; no claim about playback, engraving appearance, arbitrary scores, or broad score fidelity.
- **Input/rights:** score generated directly by `make_and_check.py`; no third-party materials.
- **Dependencies/side effects:** isolated uv environment under ignored `.venv/` and cache/output under ignored `output/`; install plan is `uv sync --locked --python /opt/homebrew/bin/python3.12` for pinned music21 10.5.2.
- **Documentation:** official Music21 docs describe `Stream.write('musicxml', fp=...)` and `converter.parse(...)`; checked 2026-11-16: [file format guide](https://music21.org/music21docs/usersGuide/usersGuide_08_installingMusicXML.html), [converter reference](https://music21.org/music21docs/moduleReference/moduleConverter.html).

## Plan, before running

- **Command:** `./run.sh --record`, then `./run.sh`; each invocation creates a fresh generated score, writes MusicXML, and reparses it with `forceSource=True`.
- **Expected checks:** exact package/runtime version; pitches C4, D4, E-4; durations 1, 0.5 and 1.5 quarter lengths; total duration 3 quarter lengths; identical summary and normalized MusicXML hash across two processes (randomly generated part IDs are normalized).
- **Stop conditions:** version mismatch, parse/write failure, any pitch or duration mismatch, or repeat output mismatch.
- **Inspection:** inspect retained XML structure and the numeric round-trip report; no rendered notation is claimed.

## Observation, after running

- **Date/executor:** 2026-11-16; Codex on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64, CPython 3.12.13.
- **Observed:** `./run.sh --record` and `./run.sh` passed. Reopened score retained 1 measure, pitches C4/D4/E-4, quarter lengths 1.0/0.5/1.5 and total duration 3.0. Normalized MusicXML SHA-256: `8c2ceb4e18e03eeed3f1b8d5932253aba63ff1d40a406c560a10ca3ab475f8b8`.
- **Repeatability:** summary and normalized MusicXML hash matched across separate processes. music21 emits a random part ID despite setting `Part.id`; only that generated ID is normalized. The raw XML bytes therefore differ.
- **Outcome and limits:** pass for this generated score's MusicXML pitch/duration round trip only; no corpus, playback or engraving appearance is covered.
