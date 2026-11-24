# pretty_midi note-level MIDI build, round trip and piano roll

## Intent and scope

- Tool ID and version: `pretty_midi` 0.2.11.post0 (PyPI), run from a fixture-local venv. Its transitive dependencies are pinned in `requirements.txt` (mido 1.3.3, numpy 2.5.5, six, packaging, importlib_resources).
- VCR job and exact claim: pretty_midi builds a two-instrument Standard MIDI File from predeclared notes (start and end in seconds, velocities), a tempo change and a pitch bend; writes it; reads it back with note times equal within one tick; reports the predeclared tempo-change times and end time; `get_piano_roll` at a fixed `fs` returns the predeclared active cells; two writes from separate processes are byte-identical.
- Complement to `examples/mido-roundtrip`: that fixture tests Mido's low-level message and tick round trip with a 1.3.2 pin. This fixture tests pretty_midi's note-level model: seconds rather than ticks, instruments, tempo-change times, pitch-bend objects, end time and piano-roll sampling. Mido is used here only as pretty_midi's file backend, through pretty_midi's own calls; this fixture does not call `mido` directly.
- Explicit exclusions:
  - Synthesis: no `fluidsynth` or `pyfluidsynth`, no audio. Marked **untested**. The wheel ships a soundfont (`pretty_midi/TimGM6mb.sf2`); it is not used, not copied and not committed.
  - Other MIDI formats: type 0, MIDI 2.0, SysEx, lyrics, control changes (sustain pedal is not used), drum tracks.
  - Piano roll with pitch bends attached. pretty_midi's roll shifts and interpolates rows for bends, so the roll claim is made on the model before bends are attached (see the plan).
  - Tempo authoring through a public API: pretty_midi 0.2.11.post0 has none. The tempo map is set in the build through the private `_tick_scales` attribute and `_update_tick_to_time()`. Reading tempo uses only public methods. This is a documented limitation of the claim, not a substitute.
  - Musical quality, cross-platform byte identity, and other pretty_midi features (`adjust_times`, `remove_invalid_notes`, `get_pitch_class_histogram`, and the rest).
- Tool documentation and licence sources, checked 2026-11-24:
  - https://github.com/craffel/pretty-midi (repository and README; `official_url` on the card)
  - https://craffel.github.io/pretty-midi/ (API documentation)
  - Licence: MIT, read from the installed `pretty_midi-0.2.11.post0.dist-info/licenses/LICENSE.txt` (Copyright 2014 Colin Raffel).
  - Dependency licences (mido MIT, numpy BSD-3) are not redistributed. The bundled soundfont's terms are not reviewed here and are not used.
- Environment: macOS, Darwin 25.6.0, arm64. Python 3.12.13 from `/opt/homebrew/bin/python3.12`. The pyenv Python 3.12.2 has no `_lzma` module, so `venv` and `pip` from it are not used. No GPU. Single process per write; no threading involved.
- Input: none. All notes, tempo and bends are constants in `spec.py`. No external MIDI file.
- Dependencies and installation (done before this plan was run; no fixture code had executed):
  - `/opt/homebrew/bin/python3.12 -m venv examples/pretty-midi-roundtrip/output/venv`
  - `examples/pretty-midi-roundtrip/output/venv/bin/python -m pip install 'pretty_midi==0.2.11.post0'`
  - Then `pip freeze` was written into the committed `requirements.txt`, and `run.sh` checks that the installed set still matches it.
  - Network: PyPI, first install only. No global package, shell or system change.
- Selected workspace and output: `examples/pretty-midi-roundtrip/output/` (git-ignored). It holds the venv and the written MIDI files. Committed: `README.md`, `example.json`, `run.sh`, `requirements.txt`, `spec.py`, `build_midi.py`, `check.py`, `expected/metrics.json`. No `.mid` file is committed.
- Cleanup: remove `examples/pretty-midi-roundtrip/output`.

## Plan, before running

Commands:
```
examples/pretty-midi-roundtrip/run.sh --record   # only after the checks below pass by inspection
examples/pretty-midi-roundtrip/run.sh            # must print OK
```
`run.sh` does, in order:
1. Require `output/venv/bin/python` and diff `pip freeze` against `requirements.txt`.
2. Run `build_midi.py output/first.mid` and `build_midi.py output/second.mid` in two separate processes.
3. Run `check.py output/first.mid output/second.mid`, which writes `output/checks.json`.
4. With `--record`, copy `checks.json` to `expected/metrics.json`. Without it, diff against `expected/metrics.json` and print `OK pretty-midi-roundtrip`.

Predeclared constants (all in `spec.py`; the values below are the claim):
- Resolution 480 ticks per beat. Tempo 120 BPM from 0.0 s; tempo change to 60 BPM at 1.0 s (tick 960). Tempo-change times `[0.0, 1.0]`, tempi `[120.0, 60.0]`.
- Instrument "piano", program 0:
  - pitch 60, velocity 80, 0.0 s to 0.5 s
  - pitch 64, velocity 100, 0.5 s to 1.0 s
  - pitch 67, velocity 90, 1.0 s to 2.0 s
  - pitch bend at 0.25 s, pitch 4096; pitch bend at 1.5 s, pitch -2048
- Instrument "bass", program 33:
  - pitch 36, velocity 70, 0.25 s to 0.75 s
  - pitch 43, velocity 110, 1.5 s to 2.5 s
- Predeclared end time: 2.5 s.
- Time tolerance: one tick at the slower tempo, 60 / (60 × 480) = 0.0020833 s. Note and bend times must match within it.

Predeclared checks (all gating):
1. Two instruments; the read-back instrument count is 2, with programs 0 and 33 in that order.
2. Read-back note list for each instrument equals the predeclared list, with pitch and velocity exact and start and end within the tick tolerance.
3. Read-back pitch bends for the piano equal the predeclared `(time, pitch)` pairs, times within tolerance and pitches exact.
4. `get_tempo_changes()` on the read-back file returns times `[0.0, 1.0]` within tolerance and tempi `[120, 60]` within 1e-6.
5. `get_end_time()` on the read-back file is 2.5 s within tolerance.
6. Piano roll: on the model built with `with_pitch_bends=False`, `get_piano_roll(fs=8)` has shape `(128, 20)`. Its non-zero cells equal exactly the predeclared set, and each cell holds the predeclared velocity:
   - row 60, columns 0 to 3, value 80
   - row 64, columns 4 to 7, value 100
   - row 67, columns 8 to 15, value 90
   - row 36, columns 2 to 5, value 70
   - row 43, columns 12 to 19, value 110
   - 28 cells in total. The column rule is pretty_midi's own: `int(start*fs)` to `int(end*fs)` exclusive. Every boundary is a multiple of 1/8 s, so the rule has no floating-point ambiguity.
7. Byte identity: the two files written by separate processes have equal SHA-256. The SHA-256 is also recorded in `expected/metrics.json`, so a later run must reproduce it.
8. Not applicable: the frame count, dimensions, alpha range and shuffled-order checks belong to visual fixtures. This fixture has no frames, no seek and no alpha. The closest analogue is check 7 (two independent writes) with check 2 (the read-back content, which would differ if the bytes differed).

Expected artifacts: `output/first.mid`, `output/second.mid`, `output/checks.json`, `output/build-*.log`, `output/dependencies.txt`. Committed: `expected/metrics.json` only.

Expected failure modes and stop conditions:
- Venv missing or `pip freeze` differs from `requirements.txt`: stop, report `blocked`.
- Any gating check fails: stop. The expected file is not rewritten to hide a failure. Report `fail`, or `partial` if only the piano-roll check fails, with the exact cells that differ as scope.
- Read-back times off by more than one tick: stop; the tick arithmetic is then wrong and the claim fails as stated.
- A nondeterministic second write is a fail, not a recorded variance, because the claim is that reruns are byte-identical.

Inspection: `output/checks.json` lists every measured value. Because there are no pixels or audio, inspection is by reading the JSON and the piano-roll cell list it prints. No contact sheet.

Reproduction: install as above, then `./run.sh --record` and `./run.sh`.

## Observation, after running

- Executed 2026-11-24 on `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64, from `examples/pretty-midi-roundtrip`.
- Versions: pretty_midi 0.2.11.post0; mido 1.3.3 and numpy 2.5.5 (pulled in by pretty_midi, pinned in `requirements.txt`); Python 3.12.13 from `/opt/homebrew/bin/python3.12`. Playwright, Chromium and Node are not used.
- Install: `/opt/homebrew/bin/python3.12 -m venv output/venv`, then `output/venv/bin/python -m pip install 'pretty_midi==0.2.11.post0'`, then `pip freeze > requirements.txt`. Installed into `output/venv` only; nothing global. `output/` is git-ignored.
- Commands: `./run.sh --record` (recorded `expected/metrics.json`), then `./run.sh`, which printed `OK pretty-midi-roundtrip`.
- Measured (`expected/metrics.json`, identical in both runs):
  - Notes: 5 across 2 instruments (programs 0 and 33); pitch and velocity exact; max note-time error 0.0 s against a tolerance of 0.00208 s.
  - Pitch bends: 2 on the piano, exact values; max time error 0.0 s.
  - Tempo changes: times `[0.0, 1.0]` s, tempi `[120.0, 60.0]` BPM.
  - End time: 2.5 s.
  - Piano roll at fs=8: shape 128 × 20, 28 non-zero cells, exactly the predeclared set with the predeclared velocities.
  - Byte identity: two separate-process writes, 147 bytes, both SHA-256 `65d76b26f7ed080fac80e217a92c1acf8e834cc2ac397e3c682fd26cb1fc967e`; `cmp` equal.
- Inspection: no pixels or audio, so no contact sheet. `output/inspection.txt` dumps the written events with mido, the reader pretty_midi uses. Tempo is 500000 µs/beat at tick 0 and 1000000 at tick 960. Piano bends fall at ticks 240 and 1200. Note-ons and offs fall at the predeclared ticks (for example, the bass note at 1200 to 1680). The values match the spec.
- Record check: a first `--record` attempt failed on JSON serialisation of numpy scalars (`bool_`, `int64`), not on any measured value. The fix converts numpy scalars when printing, and the checks themselves were not changed. The fixture was then recorded from a clean run.
- Pass: all 12 gating checks true (`checks` in `expected/metrics.json`). The tempo-map limitation is the scope: the build sets pretty_midi's private `_tick_scales` and calls `_update_tick_to_time`, since 0.2.11.post0 offers no public tempo call. Reading tempo uses only public methods.
- What this result does and does not establish: pretty_midi 0.2.11.post0 on macOS arm64 writes a predeclared two-instrument, tempo-changing, pitch-bent type-1 file that reads back within one tick, reports the tempo-change times, end time and fs=8 piano-roll cells, and reproduces its bytes across processes. It does not establish synthesis (untested), other MIDI formats or control changes, piano rolls of pitch-bent instruments, public tempo authoring, other platforms, or musical quality. The soundfont shipped in the wheel is unused.
- Deviations and limitations: the pyenv Python lacks `_lzma`, so the venv uses Homebrew Python 3.12.13. The venv pulls mido 1.3.3, not the 1.3.2 pinned by `mido-roundtrip`; this fixture does not call mido directly, so the two results do not conflict. No frames, so the frame-count, dimension, alpha and shuffle checks do not apply.
- Reviewer and revisit: revisit on any pretty_midi release (the private `_tick_scales` path may change), on a mido or numpy change that alters the bytes (the SHA-256 would change while the read-back checks still pass), or if a public tempo API appears.
