# csound offline render: one sine instrument, predeclared score, WAV analysis

Status: validated on macOS arm64, 2026-11-24, for the claim as scoped below (see "Observation, after running"). Checked 2026-11-24.

## Intent and scope

- Tool: `csound` (Homebrew `csound 7.0.0_1`, `/opt/homebrew/bin/csound`, already installed on this machine; the banner reads `Csound version 7.0 (double samples)`). The catalogue card (`catalog/tools/csound.json`, checked 2026-11-24) gives the licence as LGPL-2.1-or-later for the core project; not re-verified beyond the card. Docs: https://csound.com/ (manual and CsoundSynthesizer file format).
- VCR job and claim: csound renders a hand-written `.csd` (one sine instrument, `fixture.csd`, a score of six predeclared notes at known start times, durations and frequencies, fixed `sr`/`ksmps`/`0dbfs`) offline with `-W -o out.wav` to a WAV with the predeclared rate, channel count and duration. An FFT and onset analysis (`analyse.py`, Python standard library only) finds each note's frequency within a predeclared cents tolerance and its start within a predeclared millisecond tolerance. The peak stays below 0 dBFS. Two reruns are compared for byte identity.
- Parameters are fixtures, not rules. The frequencies, note timings, amplitude 0.5 and tolerances are chosen to exercise the instrument and the analysis. They are not a tuning, mix or loudness standard. Sound design is a pillar (`SOUND-*`): the ceiling here is a sample-peak bound, not the true-peak target in `SOUND-TRUE-PEAK`, and no loudness claim is made.
- Exclusions: no listening test or perceptual quality claim; no claim about the oscillator's spectral purity, aliasing or the sine table beyond the frequency and onset measurement; no claim about other sample rates, channel counts, bit depths, file formats or realtime (`-o dac`) output; no claim about Csound opcodes beyond the one used (`linseg`, `poscil`, `out`); no other Csound builds or versions; no claim about tool-to-tool edges (no FFmpeg, sox or other catalogue tool runs in `run.sh`).
- Mapping of the template's frame checks: this is an audio fixture, so "frame count" is the WAV frame count (samples per channel), "dimensions" is rate, channels and sample width as read from the WAV header, "at least two distinct hashes" is that the six per-note PCM segments hash to six different values, and "shuffled order equals sequential" does not apply (there is no seeked frame sequence). The rerun byte-identity check stands in for determinism.
- Tool documentation and licence: https://csound.com/ and the catalogue card, checked 2026-11-24. No dependency, model or asset is downloaded or committed.
- Environment: macOS arm64 (Darwin 25.6.0), CPU only, no GPU. `run.sh` uses no network.
- Input: none committed. `fixture.csd` is hand-written. It uses no random opcodes (no `rand`, `random`, `randi`, `seed` use) and no MIDI or realtime device.
- Dependencies, installation plan and side effects: `csound` is the only catalogue tool and is already installed. Its install recipe is recorded on the card (`brew install csound`, check `csound --version`); this example installs nothing. Python 3 is the system interpreter, used only for the standard library (`wave`, `hashlib`, `math`, `cmath`, `struct`); it is not a catalogue tool. No venv, no pip packages.
- Workspace and cleanup: writes only `output/` (git-ignored): the two WAV renders, Csound logs, `summary.json` and a spectrogram PPM for inspection. Remove with `rm -rf examples/csound-offline-render/output`.
- Catalogue tools used by the fixture: `csound` only.

## Plan, before running

- Versions: Csound 7.0.0_1 (Homebrew; `csound --version` prints the banner above), Python 3.12.2 standard library, shasum (macOS).
- Score, `fixture.csd`: `sr = 48000`, `ksmps = 64`, `nchnls = 1`, `0dbfs = 1`. One function table `f 1 0 16384 10 1` (sine). Instrument 1: `aenv linseg 0, 0.005, p5, p3 - 0.015, p5, 0.01, 0`, `asig poscil aenv, p4, 1`, `out asig`. Global `f 0 3` so the render is exactly 3.0 s. Six notes, amplitude 0.5:

  | note | start (s) | duration (s) | frequency (Hz) |
  |---|---|---|---|
  | 1 | 0.0 | 0.4 | 220 |
  | 2 | 0.5 | 0.4 | 330 |
  | 3 | 1.0 | 0.4 | 440 |
  | 4 | 1.5 | 0.4 | 660 |
  | 5 | 2.0 | 0.4 | 880 |
  | 6 | 2.5 | 0.4 | 1100 |

- Render (`run.sh`): `csound -W -o output/render-a.wav fixture.csd > output/csound-a.log 2>&1`, then the same command to `output/render-b.wav`. Expected file: 144000 frames, 48000 Hz, 1 channel, exactly 3.000 s.
- Analysis (`analyse.py`), on `render-a.wav`; the rerun is compared by `cmp`:
  1. Score: the `i 1` lines parsed from `fixture.csd` equal the six notes above (start, duration, frequency, amplitude). This guards the predeclared table against drift.
  2. Onset: first sample with |x| ≥ 0.01 (2% of the 0.5 amplitude) in [start − 0.05 s, start + 0.1 s]. The onset must be within 5 ms of the start.
  3. Frequency: a 8192-sample Hann-windowed block starting 0.05 s after each note's start (inside the sustain), zero-padded to 32768, magnitude spectrum searched between 50 Hz and 5 kHz for the peak bin, refined by parabolic interpolation on the log magnitude. The measured frequency must be within 5 cents (1200·log2 ratio) of the note's frequency.
  4. Silence: the maximum |x| in each gap [note end + 0.01 s, next start − 0.01 s] and in [2.91 s, 3.0 s] is at most 1e-4 (−80 dBFS).
- Predeclared checks (any failure exits 1 and writes `output/summary.json` with the failing check false; the `expected/summary.json` diff is the final gate):
  1. `csound_exit_zero`: both renders exit 0.
  2. `rate_48000_hz`: WAV header sample rate is 48000.
  3. `mono`: channels = 1.
  4. `sample_width_recorded`: observation only, not a check (Csound's default WAV sample width is read and written to the summary).
  5. `frames_144000`: WAV frame count is exactly 144000 (3.000 s).
  6. `peak_below_0dbfs`: maximum |x| over the file is < 1.0.
  7. `peak_matches_amplitude`: maximum |x| is within 0.01 of 0.5 (the predicted sustain amplitude).
  8. `score_matches_predeclared`: check 1 of the analysis.
  9. `onsets_within_5ms`: all six onsets within 5 ms of their predeclared start.
  10. `frequencies_within_5_cents`: all six measured frequencies within 5 cents of their predeclared values.
  11. `gaps_silent`: all silence windows have maximum |x| ≤ 1e-4.
  12. `distinct_note_hashes`: the six per-note PCM segments (the samples from start to start + duration, 16-bit little-endian as stored) hash to six distinct SHA-256 values.
  13. `rerun_byte_identical`: `render-a.wav` and `render-b.wav` are byte-identical (`cmp` and SHA-256).
  14. `expected/summary.json` matches `output/summary.json` exactly.
- Predeclared observation (not a check): the SHA-256 of each render, the sample width read from the header, and the spectrogram PPM (a visual aid, not in any check).
- Visual inspection after the run: a log-magnitude spectrogram (STFT, 1024-sample Hann, hop 512, 0 to 2.5 kHz) written by `analyse.py` as `output/spectrogram.ppm`. Expected picture: six horizontal bars at 220, 330, 440, 660, 880 and 1100 Hz, each 0.4 s long, starting at 0, 0.5, 1.0, 1.5, 2.0 and 2.5 s, with silent gaps between them. The PPM is converted to PNG for viewing with `magick` (ImageMagick) outside `run.sh`; that conversion is not part of the claim.
- Stop conditions: `csound` missing or failing to run: report blocked. Any predeclared check failing: report fail or partial with the failing check named. Do not move a tolerance to make a check pass. A rerun that is not byte-identical is a finding, not a reason to drop the check.
- Expected failure modes: Csound's WAV writer embedding a timestamp (would break byte identity); a sample width other than 16-bit (recorded, not checked); a tolerance being tighter than the measurement can resolve (the 5 cent bound is set well above the expected 32768-point interpolation error).
- Reproduce: `examples/csound-offline-render/run.sh --record` (writes `expected/summary.json`), then `examples/csound-offline-render/run.sh` (expect `csound-offline-render: OK`). Inspect `output/summary.json` and `output/spectrogram.ppm`.

## Observation, after running

- Executor and date: Conor's MacBook Pro (`Conors-MacBook-Pro-2.local`), macOS 26.6 arm64, 2026-11-24, from the `csound-offline-render` worktree.
- Versions: Csound 7.0.0_1 (Homebrew; banner `Csound version 7.0 (double samples) Oct 21 2026`, commit c58f4de6), Python 3.12.2 standard library, shasum and cmp from the system. No install was performed by this example; csound was already present.
- Commands: `run.sh --record` (wrote `expected/summary.json`), then `run.sh`, which printed `csound-offline-render: OK` and exited 0. A second `run.sh` exited 0 and `cmp` on the two renders from that run was byte-identical.
- Measured (`expected/summary.json`):
  - Render: WAV, 16-bit PCM, mono, 48000 Hz, 144000 frames (3.000 s). Header has no timestamp chunk. Peak amplitude 0.5 (predicted 0.5). SHA-256 `415fce93...`.
  - Onsets: 0.29, 0.23, 0.21, 0.17, 0.15 and 0.15 ms after each predeclared start (tolerance 5 ms).
  - Frequencies: measured 220.001, 330.001, 440.001, 659.999, 879.999 and 1099.9996 Hz; errors between -0.002 and +0.008 cents (tolerance 5 cents).
  - Silence in the gaps and after the last note: maximum |x| 0.0.
  - Six per-note PCM segments hash to six distinct SHA-256 values.
- Checks: all eleven predeclared checks true, plus the `expected/` diff.
- Inspection: `output/contact.png`, a `magick` PNG of the `analyse.py` spectrogram (1024-point Hann STFT, hop 512, 0 to 2.5 kHz, log scale). It shows six horizontal bars at rising pitch (220, 330, 440, 660, 880, 1100 Hz), each about 0.4 s long, starting at 0, 0.5, 1.0, 1.5, 2.0 and 2.5 s, with black gaps between them. Not blank, not clipped, and the pitch steps are as predeclared. The bars widen slightly at their ends and the 1100 Hz bar sits near the 2.5 kHz top edge, which is expected from the window.
- Deviations and limitations: the first record run passed every check without changes to the predeclared numbers. Frequency errors are far below the 5 cent bound, which is consistent with a noise-free render of a single sine quantised to 16 bits, but this was not cross-checked against an independent estimator. The spectrogram is a visual aid, not a check. The sample width is 16-bit only on this build; a different default would be recorded in the summary. Byte identity is on this host and this Csound build only.
- Result: pass for the claim as worded, on this host and this Csound build: one sine instrument, a six-note score with predeclared start, duration and frequency, `-W -o` offline render to a WAV at the predeclared 48 kHz, mono and 3.0 s; onset within 5 ms, frequency within 5 cents, peak below 0 dBFS, and two reruns byte-identical.
- What this establishes: Csound 7.0.0_1 renders the predeclared score offline to the predeclared WAV with the measured onsets, frequencies and levels, and its output is byte-identical across reruns on this host. It does not establish audio quality, listening results, spectral purity or aliasing of `poscil`, behaviour of other opcodes, realtime output, other sample rates or channel counts, other Csound builds, or any tool-to-tool edge.
- Reviewer, follow-up and revisit triggers: revisit if the Csound WAV writer changes its header (byte identity and the sample width check depend on it), if the Homebrew build changes, or if the 7.0 release-status question on the card is resolved differently. The sound design pillar is cited only here: the 0 dBFS bound is a sample-peak bound and does not implement the true-peak target in `SOUND-TRUE-PEAK`, so it is not evidence for any loudness or true-peak rule.
