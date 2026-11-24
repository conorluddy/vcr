# SuperCollider NRT render: five scored sine notes to a WAV, with onset, pitch and rerun checks

Status: partial on macOS arm64, 2026-11-24. The headless NRT route renders, and the onset, pitch, peak, silence and rerun checks pass. The predeclared frame-count check (192000) fails: the render has 192064 frames. See "Observation, after running". Checked 2026-11-24.

## Intent and scope

- Tool: SuperCollider 3.14.1, from the Homebrew cask `supercollider` (installed on this machine at `/Applications/SuperCollider.app`). Binaries used: `sclang` at `/Applications/SuperCollider.app/Contents/MacOS/sclang` and `scsynth` at `/Applications/SuperCollider.app/Contents/Resources/scsynth`. `scsynth -v` prints `scsynth 3.14.1`. The GUI binary `Contents/MacOS/SuperCollider` opens the IDE and is not used.
- Route: non-real-time (NRT). `sclang -D render.scd` builds a score (a SynthDef `vcrSineEnv`: sine oscillator times a linen envelope, two identical output channels; five predeclared notes). `Score.recordNRT` writes the OSC score file and runs `scsynth -N` to write the WAV. No audio device, no IDE, no realtime server boot.
- VCR job and claim: SuperCollider NRT renders a scored sine sequence (predeclared start times, frequencies, durations) to a WAV at the predeclared sample rate, channels and duration; FFT and onset analysis finds each note within predeclared cents and ms tolerances; reruns are byte-identical (recorded either way).
- Parameters are fixtures, not rules. Note timings, frequencies, amplitudes and tolerances are chosen to exercise the route. They are not a tuning, mix or loudness standard. Sound design is a pillar; no threshold here is VCR policy.
- Exclusions: no listening test or perceptual claim; no claim about SynthDef design beyond this one sine-with-envelope; no claim about the realtime server, `Routine`, `Pbind` or any other SC scheduling; no claim about other SuperCollider versions, other platforms, or the GUI IDE; no claim about sample-rate conversion or dither (the output is int16 and no dither is requested in the score, but none is measured); no claim about the spectral purity of the oscillator; no claim about tool-to-tool edges; no claim that the frequency tolerance holds for notes shorter than 0.4 s or for other frequency ranges.
- Mapping of the template's checks to an audio fixture: "frame count" is samples per channel; "dimensions" is rate, channels and sample width; "at least two distinct hashes" is the per-note segment hashes being distinct (weak, and stated as such); "shuffled order equals sequential" does not apply (no seeked frame sequence); the rerun byte-identity check stands in for determinism; the "alpha range" analogue is the per-note peak amplitude range.
- Unseeded randomness and clocks: none. The SynthDef and score contain no random source and no clock. Phase is zero. The output is written by scsynth from the score alone.
- Tool documentation and licence: https://supercollider.github.io/ and the NRT help in the SuperCollider help browser. Licence from the catalogue card: GPL-3.0 (repository label). Checked 2026-11-24 from the card and the local bundle; the licence was not re-read from the source tree in this run.
- Environment: macOS 26.x arm64 (Darwin 25.6.0), CPU only, no GPU, no network use.
- Input: none committed. The score is written in `render.scd`.
- Dependencies and installation: SuperCollider 3.14.1 is already installed by the Homebrew cask. Install recipe recorded in the catalogue card: `brew install --cask supercollider`. This example installs nothing. Analysis is Python 3 standard library only (`wave`, `struct`, `cmath`, `hashlib`); no packages, no venv. Inspection uses ImageMagick `magick` for a PNG of the spectrogram; that is an inspection step, not part of `run.sh`.
- Workspace and cleanup: writes only `output/` (git-ignored). Remove with `rm -rf examples/supercollider-nrt-render/output`.
- Catalogue tools used by the fixture: `supercollider` (the render) and `imagemagick` (inspection PNG only).

## Plan, before running

- Versions: SuperCollider 3.14.1 (`scsynth -v`, `sclang` banner `Welcome to SuperCollider 3.14.1`); Python 3 standard library (`python3 --version`); ImageMagick `magick` (for the inspection PNG only).
- Route and command: `run.sh` runs `sclang -D render.scd` from the example directory. `render.scd` sets `Score.program` to `Platform.resourceDir +/+ "scsynth"` and calls `Score.recordNRT` twice (`output/render-a.wav`, then `output/render-b.wav`), each with headerFormat `WAV`, sampleFormat `int16`, sampleRate 48000, two output channels, duration 4.0 s. Each call writes `output/score.osc` and runs `scsynth -N output/score.osc _ <out.wav> 48000 WAV int16`. Then `analyse.py` reads both WAVs and writes `output/summary.json`.
- Predeclared notes (start s, frequency Hz, duration s, amplitude). These are the `// note` lines in `render.scd`, and `analyse.py` parses them against the table below:

  | # | start s | frequency Hz | duration s | amplitude |
  |---|---------|--------------|------------|-----------|
  | 1 | 0.25    | 440          | 0.5        | 0.5       |
  | 2 | 1.00    | 330          | 0.5        | 0.3       |
  | 3 | 1.75    | 660          | 0.4        | 0.4       |
  | 4 | 2.50    | 880          | 0.4        | 0.2       |
  | 5 | 3.25    | 550          | 0.6        | 0.6       |

- Envelope per note: `Env.linen(0.01, duration - 0.06, 0.05, amplitude)`, so the note is silent before its start, ramps up over 10 ms, holds, releases over 50 ms, and ends at start + duration. `doneAction: 2` frees the node.
- Expected artifacts: `output/render-a.wav` and `output/render-b.wav`, WAV, 2 channels, int16, 48000 Hz, 192000 frames (4.0 s). `output/score.osc`, `output/sclang-a.log`, `output/sclang-b.log`, `output/spectrogram.ppm`, `output/summary.json`. The committed `expected/summary.json` is the only retained file.
- Predeclared checks (any false exits 1 and `summary.json` is printed for inspection):
  1. `format`: WAV, 2 channels, 2 bytes per sample, 48000 Hz.
  2. `frames_192000`: 192000 frames per channel (4.0 s at 48000 Hz). A header-only length change would not pass this.
  3. `score_matches_predeclared`: the five `// note` lines in `render.scd` equal the table above (start, frequency, duration, amplitude, to 1e-9).
  4. `onsets_within_5ms`: for each note, the first sample with |x| ≥ 0.002 in the search window [start - 0.05 s, start + 0.1 s] is within 5 ms of the predeclared start.
  5. `durations_within_10ms`: the span from first to last sample with |x| ≥ 0.002 in the note's window is within 10 ms of the predeclared duration.
  6. `frequencies_within_5_cents`: for each note, a Hann window of 8192 samples starting 0.05 s after the start, zero-padded to 32768, peak bin refined by parabolic interpolation on log magnitude, gives a frequency within 5 cents (1200 log2 ratio) of the predeclared frequency.
  7. `note_peaks_match_amplitude`: for each note, the peak |x| over [start + 0.05 s, start + duration - 0.05 s] is within 0.01 of its amplitude (the envelope level). This is the amplitude-range analogue.
  8. `channels_identical`: left and right channels are sample-identical (the score writes the same signal to both outputs).
  9. `peak_below_0dbfs`: overall peak below 1.0.
  10. `gaps_silent`: max |x| in the gaps between notes (predeclared note end + 10 ms to the next start − 10 ms; and before the first note and after the last) is at most 1e-4.
  11. `distinct_note_hashes`: the five per-note segment SHA-256 values are distinct. Weak: distinct frequencies make distinct bytes by construction.
  12. `rerun_byte_identical`: `render-a.wav` and `render-b.wav` are byte-identical (`cmp` and SHA-256). This is the determinism claim.
  13. `expected/summary.json` matches `output/summary.json` exactly.
- Predeclared observations, not checks: the SHA-256 of the score file and of each WAV; the `scsynth` command line from `sclang-a.log`; the wall time of the sclang run.
- Visual inspection after the run: `output/spectrogram.ppm` (written by `analyse.py`, a Hann-windowed STFT, 1024 samples, 512 hop, 0 to 2500 Hz) converted to `output/spectrogram.png` with `magick`, and read with the image viewer. Expected: five separate horizontal tones at 440, 330, 660, 880, 550 Hz in that time order, with gaps between them.
- Stop conditions: `sclang` or `scsynth` missing: blocked. `sclang` does not exit within 120 s, or `Score.recordNRT` does not produce a WAV: blocked for the headless route, with the log retained. Any predeclared check false: fail or partial, with the failing check named. Do not move a tolerance to make a check pass. Do not drive the GUI IDE to get a result.
- Reproduce: `examples/supercollider-nrt-render/run.sh --record`, then `examples/supercollider-nrt-render/run.sh` (expect `supercollider-nrt-render: OK`). Inspect `output/summary.json` and `output/spectrogram.png`.

## Observation, after running

- Executor and date: Conor's MacBook Pro (`Conors-MacBook-Pro-2.local`), macOS arm64 (Darwin 25.6.0), 2026-11-24, from the `supercollider-nrt-render` worktree.
- Versions: SuperCollider 3.14.1 (`scsynth -v` prints `scsynth 3.14.1 (Built from tag 'Version-3.14.1' [426edf6])`; the `sclang` banner reads `Welcome to SuperCollider 3.14.1`). Python 3.12.2 (standard library only). ImageMagick 7.1.2-35 Q16-HDRI (`magick`, inspection PNG only). No Node, Playwright or Chromium is involved.
- Route used: `sclang -D render.scd` (headless, no IDE). `Score.recordNRT` writes `output/score.osc` and runs `scsynth -N` (`Score.program` set to `Platform.resourceDir +/+ "scsynth"`) to write each WAV. The sclang log does not print the `unixCmd` line; the command shape comes from the `Score.recordNRT` source in the installed class library.
- Installation: none performed; the cask was already present. One incident: an early probe ran the GUI binary `Contents/MacOS/SuperCollider -v`, which started the IDE, `sclang -i scqt` and QtWebEngine helpers. Those three processes were killed. `run.sh` never uses the GUI binary.
- Commands: `run.sh --record` stopped on the failing frame-count check, so it wrote no `expected/`. A second `run.sh` gave the same result (`predeclared check failed`, exit 1). Both runs produced identical summaries and identical WAV hashes.
- Measured (`output/summary.json`, both runs):
  - Format: 2 channels, 16-bit, 48000 Hz, WAV (`format` true). File size 768300 bytes: 768000 data bytes (192064 frames × 2 channels × 2 bytes) plus a 300-byte header.
  - Frame count: 192064 per channel, not 192000 (`frames_192000` false). 192064 = 3001 blocks of 64 samples, so the render ran one 64-sample block past the 4.0 s score end. The cause was not isolated.
  - Onsets: errors −0.54, +0.19, −0.54, +0.15, −0.56 ms (limit 5 ms). Durations: errors −0.40, −0.60, −0.40, −0.85, −0.33 ms (limit 10 ms). These are the lag of the 0.002 threshold crossing, not drift.
  - Pitch: 440.0009, 330.0011, 659.9994, 879.9989, 550.0003 Hz; errors +0.004, +0.006, −0.002, −0.002, +0.001 cents (limit 5 cents).
  - Sustain peaks: 0.499969, 0.300018, 0.399994, 0.200012, 0.600006 against amplitudes 0.5, 0.3, 0.4, 0.2, 0.6 (limit 0.01). Channels identical. Gaps silent (max 0.0). Five distinct segment hashes. Score matches the predeclared table.
  - Rerun: `render-a.wav` and `render-b.wav` are byte-identical, SHA-256 `86d9431a87ea4f4d299792cf2eb5229908566aba2a981ded08f2c81e8e0773c4`. A second `run.sh` invocation gave the same SHA-256.
- Checks: 11 of 12 true. The failing check is `frames_192000`.
- Inspection: `output/contact.png`, the spectrogram PPM converted with `magick -background '#808080' -flatten` (1496 × 212). It shows five separate horizontal tone lines in the predeclared order (0.25, 1.0, 1.75, 2.5, 3.25 s), each followed by a silent gap. Relative heights match the frequencies: 330 Hz below 440 Hz, 550 Hz between 440 and 660 Hz, 880 Hz highest. The 0.6 s note is the longest. Not blank, not clipped.
- Result: partial. The headless NRT route works, and the onset, duration, pitch, amplitude, silence, channel and rerun checks pass. The frame count does not match the predeclared 192000. `expected/` is not kept.
- Deviations and limitations: the predicted frame count was wrong. The plan did not account for scsynth's 64-sample block size. The check was not weakened and the duration was not changed to fit the output. A corrected duration or a block-aware check needs a new predeclared plan, not an edit to this run. The 5-cent tolerance is loose against the measured errors (under 0.01 cents).
- What this establishes: SuperCollider 3.14.1 renders a five-note scored sine sequence headlessly, through `sclang -D` and `Score.recordNRT` (`scsynth -N`), to a 48 kHz, 2-channel, 16-bit WAV, with the predeclared note timings, pitches and amplitudes within the stated tolerances; reruns on this host are byte-identical. It does not establish that the output length equals the predeclared duration (it is one block longer), other platforms or versions, listening quality, or SynthDef behaviour beyond this sine-with-envelope.
- Reviewer, follow-up and revisit triggers: a follow-up could use a duration that ends on a block boundary as a new predeclared run, or isolate the extra block. Revisit if the cask version changes, if `Score.recordNRT` changes its command line, or if the frame count differs from 192064 on another host.
