# pedalboard built-in effects chain on generated audio

## Intent and scope

VCR job and claim: Spotify's pedalboard, using only its built-in processors,
applies a chain `HighpassFilter -> Compressor -> Gain -> Limiter` to a generated
48 kHz mono test signal (two sine tones and a seeded noise burst) offline, and:

1. A 200 Hz tone, below the 1000 Hz highpass cutoff, is attenuated by at least
   12.0 dB relative to the same chain with the highpass removed.
2. A 5 kHz tone, above the cutoff, passes within 0.5 dB of that reference chain.
3. The Limiter keeps the sample peak at or below its threshold (-1.0 dBFS, with a
   0.1 dB tolerance) on a loud 5 kHz tone through the full chain.
4. Output length and sample rate match the input, and processing the same signal
   twice (same object, then a fresh chain) gives bit-identical arrays.
5. Writing the output with `pedalboard.io.AudioFile` as WAV and reading it back
   returns the samples within 2 LSB of 16-bit PCM.

Tool: `pedalboard` 0.9.26 (PyPI), installed into a venv under `output/` only.
Its pinned numpy 2.5.5 dependency is in `requirements.txt`.

Explicit exclusions:
- No third-party VST3 or Audio Unit plugins are loaded; the chain is built-in
  processors only. No `load_plugin`, no plugin hosting, no plugin permissions.
- Only four built-in processors are tested. Other processors (reverb, delay,
  EQ, distortion, codecs such as `MP3Compressor`) are not.
- The limiter claim is limited to the one loud-tone case above. It is not a
  general statement about the limiter, its release time or its makeup gain.
- The WAV round trip is 16-bit PCM because the `AudioFile` writer used here does
  not expose a float subtype. No float32 file round trip is claimed.
- No loudness (LUFS), true-peak (oversampled) or perceptual claim. Peaks are
  sample peaks at 48 kHz only.
- No cross-platform or cross-version determinism claim beyond this machine.
- No seek, frame or video output. Nothing is rendered or muxed.

Sound design pillar: the chain and the checks follow `SOUND-TRUE-PEAK` (peak
ceiling as a concept) and `SOUND-SYNTH-DETERMINISM` (two renders identical)
in `references/sound-design/`. Only these IDs are cited here. The dB values in
this README are fixture parameters, not pillar targets.

Licence and documentation sources, checked 2026-11-24:
- https://github.com/spotify/pedalboard (README; `LICENSE` is GNU GPL v3,
  fetched from the master branch on 2026-11-24).
- The record in `catalog/tools/pedalboard.json` gives GPL-3.0 for project code.
  Bundled libraries (the record notes JUCE-derived processors) keep their own
  terms; they were not separately checked in this run.
- Processor behaviour taken from the 0.9.26 docstrings: `HighpassFilter` is a
  first-order filter (6 dB/octave, -3 dB at cutoff); `Limiter` wraps JUCE
  `dsp::Limiter`, applies makeup gain and a hard clip at 0 dBFS, and "is designed
  to increase perceived loudness, not to enforce a specific peak ceiling".
  That docstring is the reason check 3 is a real test, not a formality.

Environment: macOS 26 (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv (the venv
module and stdlib `wave` were available, so the Homebrew Python was not needed).
CPU only.

Input: none from outside the repository. The signal is generated in `chain.py`
from a fixed numpy seed (`default_rng(20261124)`) for the noise burst. Tones are
analytic sines.

Dependencies and installation plan (approved for this fixture):
- `python3 -m venv examples/pedalboard-effects-chain/output/venv` (git-ignored).
- `output/venv/bin/pip install -r requirements.txt`, which pins
  `pedalboard==0.9.26` and `numpy==2.5.5`. No other package is installed.
- Nothing system-wide; no global package, shell or PATH change.
- Network access to PyPI for installation only. The run itself is offline.
- Cleanup: remove `examples/pedalboard-effects-chain/output`.

Selected workspace and output: `examples/pedalboard-effects-chain/output/`
(git-ignored): venv, `dependencies.txt`, `run-a/`, `run-b/` (WAV round trip),
`checks.json`, `checks-rerun.json`, and logs.
Committed: this README, `example.json`, `requirements.txt`, `run.sh`, `chain.py`,
`expected/checks.json`. No audio file is committed.

## Plan, before running

Commands (after the venv install above):
```
examples/pedalboard-effects-chain/run.sh            # runs chain.py twice, compares, diffs expected/
examples/pedalboard-effects-chain/run.sh --record   # first run only, after a deliberate change
```

Signal (48000 Hz, mono, float32, 2.0 s = 96000 frames):
- A `[0.0, 0.5) s`: 200 Hz sine, amplitude 0.1.
- B `[0.5, 1.0) s`: 5000 Hz sine, amplitude 0.1.
- C `[1.0, 1.5) s`: uniform noise in `[-0.1, 0.1]` from `default_rng(20261124)`.
- D `[1.5, 2.0) s`: silence.

Chain (parameters fixed in `chain.py`):
- `HighpassFilter(cutoff_frequency_hz=1000)` (omitted in the reference chain)
- `Compressor(threshold_db=-6, ratio=4, attack_ms=1, release_ms=100)`
- `Gain(gain_db=6)`
- `Limiter(threshold_db=-1, release_ms=100)`

Loud case: 5000 Hz sine, amplitude 0.8, 1.0 s, through the full chain.

Predeclared checks (all gating):
1. Length and rate: output frames = input frames (96000); returned sample rate
   = 48000; one channel.
2. Highpass, low tone: `ref_rms_db - hp_rms_db >= 12.0` over the window
   `[0.1, 0.4) s` (the 200 Hz tone; the first-order ideal is about 14 dB).
3. Highpass, high tone: `|hp_rms_db - ref_rms_db| <= 0.5` over `[0.6, 0.9) s`
   (the 5 kHz tone; ideal is about 0.17 dB below unity).
4. Limiter: `20*log10(max|y|) <= -1.0 + 0.1` for the loud case through the full chain.
5. Repeat processing: the full chain on the test signal gives `np.array_equal`
   output for (a) a second call on the same `Pedalboard` object and (b) a fresh
   chain built with the same parameters. Also, `run.sh` runs `chain.py` twice in
   separate processes, and the two `checks` JSON files must be byte-identical.
6. WAV round trip: the full-chain output is written with
   `AudioFile(path, "w", 48000, 1)` and read back. Read frames equal the output
   length, the read sample rate is 48000, and `max|read - out| <= 2/32768`.
7. Reproduction (gating for `run.sh`): `output/checks.json` equals `expected/checks.json`.

Measurements recorded but not gating: SHA-256 of the processed float32 bytes
(little-endian), the measured attenuation, the high-tone deviation, the loud peak
in dBFS and the round-trip maximum absolute difference.

Expected artifacts: `output/checks.json` (all measured values, check booleans and
`all_passed`), `output/run-a/roundtrip.wav` and `output/run-b/roundtrip.wav`
(ignored), and `output/dependencies.txt`.

Expected failure modes and stop conditions:
- Venv missing or pip install failure: stop, no fallback install.
- A non-zero exit from `chain.py` (exception, not a failed claim): stop, keep the log.
- A failed gating check (any of 1 to 6): the claim is not met. The baseline is not
  rewritten to hide it. Limiter failure alone would be `partial` (the other claims
  still hold), with the measured peak in the scope.
- Rerun JSON differing: not a pass; result recorded as a determinism failure.
- Wrong picture: not applicable (audio). The inspection step is the waveform
  summary in `checks.json` and a reading of the printed RMS values.

Inspection: `checks.json` lists every measured value. No audio is committed, so
the reviewer inspects it in the ignored `output/` folder.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS, Darwin 25.6.0, arm64),
from `examples/pedalboard-effects-chain`. Versions: pedalboard 0.9.26; numpy 2.5.5
(transitive, pinned in `requirements.txt`); Python 3.12.2 from pyenv (venv at
`output/venv`, created with the pyenv interpreter; the Homebrew 3.12 fallback was
not needed). Node v22.19.0 was present but not used. Playwright and Chromium are
not used. Full freeze in `output/dependencies.txt` (ignored).

Commands: `./run.sh --record`, then `./run.sh`. Both runs ended with
`predeclared claim checks failed`, exit 1, so the second run did not print `OK`.
Each run calls `chain.py` twice in separate processes; the two reports were
byte-identical in both runs (`cmp` passed).

Before the record was kept, `run.sh` had a bug: it exited on the rerun's non-zero
status (the limiter check failed), so the first `--record` aborted before copying
`expected/`. The fix changed only how `run.sh` reads the verdict (from
`"all_passed"` in the report); no predeclared threshold was changed. The baseline
was then recorded by the second attempt.

Measured (from `output/checks.json`, identical across the record and verify runs):

| Check | Predeclared | Measured | Result |
|---|---|---|---|
| Length, rate, channels | 96000 frames, 48000 Hz, 1 channel | 96000, 48000, 1 | pass |
| Highpass, 200 Hz tone attenuated | >= 12.0 dB vs no-highpass chain | 14.16 dB | pass |
| Highpass, 5 kHz tone deviation | abs <= 0.5 dB | -0.16 dB | pass |
| Limiter, loud 5 kHz tone sample peak | <= -0.9 dBFS (threshold -1.0 + 0.1) | 0.00 dBFS (hard clip at 1.0) | **fail** |
| Repeat processing, same object and fresh chain | bit-identical | identical | pass |
| WAV round trip (16-bit PCM) | max abs diff <= 2/32768 (6.1e-5) | 4.4e-5 | pass |
| Reproduction vs `expected/` | identical | identical | pass |

Output SHA-256 (little-endian float32 bytes of the chain output):
`cf486b26d5f250aaf28f374eed420334a5f7e10f26e36ec872c046f923df7f6f`.

Diagnostic, outside the gating checks (a throwaway command, not kept in the
example): `Pedalboard([Limiter(threshold)])` on a 5 kHz sine of amplitude 0.8
gives output sample peak 1.0 (0.00 dBFS) for thresholds -1, -6 and -12 dB. At
amplitude 0.3 the output peak is 0.52 for -1 dB, 0.92 for -6 dB and 1.0 for -12 dB:
the limiter adds makeup gain and clips at 0 dBFS, so its threshold is not a peak
ceiling in this version. This matches the `Limiter` docstring ("designed to
increase perceived loudness, not to enforce a specific peak ceiling").

Inspection: there are no frames, so no contact sheet. I did not listen to the audio.
The inspection is the measured values above and the RMS windows in `checks.json`:
the 200 Hz tone is about 14 dB below its reference and the 5 kHz tone is within
0.16 dB, which is what a first-order 1 kHz highpass should do. The limiter result is
the clipped peak itself; the loud output is in the ignored `output/` folder only.

Pass or partial: partial. Five of six predeclared checks pass. The limiter claim
("keeps sample peak at or below its threshold") fails and is not weakened. The
evidence result is `partial`, with the limiter failure in the scope.

Deviations and limitations: the WAV round trip is 16-bit PCM, so the "float
tolerance" in the claim is the 2 LSB bound above, not a float32 file round trip.
Only the built-in processors ran; no plugin was loaded. Determinism is observed on
this machine only. The `Compressor` and `Gain` stages were not checked separately;
only the highpass attenuation is isolated (by comparison with the same chain
without the highpass), and the limiter is checked on one loud tone.

What this establishes: pedalboard 0.9.26 built-in `HighpassFilter` attenuates a
200 Hz tone by 14.2 dB and passes a 5 kHz tone within 0.16 dB in this chain; the
chain's output length and rate are unchanged; repeat processing is bit-identical
on this machine; and a 16-bit WAV written and read with `AudioFile` stays within
2 LSB. It does not establish that the limiter keeps the sample peak at or below its
threshold: on this evidence it does not.

Reviewer, decision, follow-up: any change to the limiter claim needs a new,
dated entry. Revisit if pedalboard changes the `Limiter` behaviour, if a true-peak or
oversampled check is wanted, or if a float32 writer becomes available.
