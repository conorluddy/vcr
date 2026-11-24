# sox synth, fade/trim/gain chain and 48→44.1 kHz resample

Status: validated on macOS arm64, 2026-11-24, for the claim as scoped below (see "Observation, after running"). Checked 2026-11-24.

## Intent and scope

- Tool: `sox` 14.4.2 (Homebrew bottle, `/opt/homebrew/bin/sox`, already installed on this machine; `brew info` gives licence `GPL-2.0-or-later AND LGPL-2.1-or-later`). `soxi` is the metadata reader shipped with it.
- VCR job and claim: sox generates a predeclared tone sequence with `synth`, applies a fade, trim and gain chain, and resamples 48 kHz to 44.1 kHz. `soxi` reports the predeclared duration (in samples), rate, channels and bit depth. `sox ... stat` shows the peak below a predeclared ceiling. Two reruns with dither disabled (`-D`) are byte-identical.
- Parameters are fixtures, not rules. The tone frequencies, the 6 dBFS ceiling, the fade lengths and the -3 dB gain are chosen to exercise each effect. They are not a mix, mastering or loudness standard. Sound design is a pillar: no thresholds here are VCR policy.
- Exclusions: no listening test or perceptual quality claim; no claim about the resampler's passband, aliasing or filter quality beyond the sample count and the tone check; no claim about dithered output (dither is disabled by design, and what `-D` changes is not measured); no other bit depths, formats or channel layouts; no other sox builds or versions; no claim about FFmpeg or any tool-to-tool edge; no claim that the ceiling is binding (it is a bound, not a limiter); no claim about `sox --i` beyond `soxi`, which reads the same header.
- Mapping of the template's frame checks: this is an audio fixture, so "frame count" is the output sample count, "dimensions" is rate, channels and bit depth, "at least two distinct hashes" is the source tones file differing from the chain output, and "shuffled order equals sequential" does not apply (there is no seeked frame sequence). The rerun byte-identity check stands in for determinism.
- Tool documentation: https://sox.sourceforge.net/ (manual pages for `synth`, `trim`, `fade`, `gain`, `rate`, `stat`, `soxi`, and the `-D` global option). Licence from `brew info`, checked 2026-11-24. The catalogue card carries no licence field.
- Environment: macOS arm64 (Darwin 25.6.0), Homebrew sox 14.4.2, no GPU. CPU only. No network use by `run.sh`.
- Input: none committed. `run.sh` generates the tones procedurally with sox `synth` (deterministic sine waves, no random or unseeded source).
- Dependencies, installation plan and side effects: `sox` is the only dependency and is already installed (Homebrew `sox 14.4.2_6`); no install is performed by this example. `soxi` ships with it. `jq` is used only to write the JSON summary; it is already installed.
- Workspace and cleanup: writes only `output/` (git-ignored). Remove with `rm -rf examples/sox-audio-chain/output`.
- Catalogue tools used by the fixture: `sox` only. No other catalogue tool runs in `run.sh`.

## Plan, before running

- Versions: sox 14.4.2 (`sox --version`), `soxi` from the same build, jq (any), shasum (macOS).
- Generation (`run.sh`), mono 48 kHz, 32-bit intermediate, four 0.5 s tones, each `synth 0.5 sine <F> vol 0.5`:
  - F = 440, 660, 880, 1100 Hz, written as separate files, then concatenated with `sox a.wav b.wav c.wav d.wav output/tones.wav` into a 2.0 s file. `output/tones.wav` is the source; its hash is recorded.
- Chain (`run.sh`), applied to `output/tones.wav`, written as 16-bit signed PCM:
  - `sox -D output/tones.wav -b 16 output/chain-a.wav trim 0 1.5 fade t 0.02 0 0.1 gain -3 channels 2 rate 44100`
  - `trim 0 1.5` keeps the first three tones (440, 660, 880). `fade t 0.02 0 0.1` is a linear 20 ms fade-in and a linear 100 ms fade-out to the end of the input. `gain -3` is -3 dB. `channels 2` duplicates the mono signal to stereo. `rate 44100` resamples.
  - The rerun is `output/chain-b.wav`, same command, and `-D` is in both. The two outputs must be byte-identical.
- Predeclared checks (any failure exits 1 and writes `output/summary.json`; the `expected/summary.json` diff is the final gate):
  1. Source tone sequence: in the mono `tones.wav`, `stat` "Rough frequency" of each 0.5 s segment (at 0, 0.5, 1.0, 1.5 s) is within 1% of 440, 660, 880, 1100 Hz. (Measured on the mono source only; `stat`'s rough frequency is unreliable on interleaved stereo.)
  2. Sample count: `soxi -s chain-a.wav` equals 66150 (1.5 s × 44100). A header-only rate change would give 72000.
  3. Format: `soxi` gives channels 2, rate 44100, bit depth 16 for `chain-a.wav`.
  4. Duration: `soxi -D` gives 1.500 s (within 0.001 s).
  5. Peak below ceiling: `stat` "Maximum amplitude" of `chain-a.wav` is at most 0.501187 (-6 dBFS; predeclared fixture ceiling).
  6. Gain applied: peak is within 0.005 of the predicted 0.353553 (0.5 × 10^(-3/20)), so the vol and gain chain is reflected in the output.
  7. Fade applied: maximum amplitude of the first 1 ms is at most 0.05, and of the last 5 ms is at most 0.02 (the unfaded signal reaches about 0.28 and 0.35 there).
  8. Distinct hashes: the SHA-256 of `tones.wav` differs from that of `chain-a.wav`.
  9. Rerun byte identity: `chain-a.wav` and `chain-b.wav` are byte-identical (`cmp` and SHA-256).
  10. `expected/summary.json` matches `output/summary.json` exactly.
- Predeclared observation (not a pass/fail check): the same chain without `-D` is run once and its SHA-256 is recorded, so the reader can see whether dither changes the bytes on this host. It is not part of the claim.
- Visual inspection after the run: a waveform image of `tones.wav` and `chain-a.wav` (`sox ... -n spectrogram` or `showwavespic` is not needed; a `sox` spectrogram PNG per file is written to `output/`, inspected with `Read`) to confirm the three/four tone blocks, the trim point, and the fade shapes.
- Stop conditions: `sox` or `soxi` missing: report blocked. Any predeclared check failing: report fail or partial with the failing check named. Do not move a bound to make a check pass.
- Reproduce: `examples/sox-audio-chain/run.sh --record`, then `examples/sox-audio-chain/run.sh` (expect `sox-audio-chain: OK`). Inspect `output/summary.json` and the spectrogram PNGs.

## Observation, after running

- Executor and date: Conor's MacBook Pro (`Conors-MacBook-Pro-2.local`), macOS 26.6 arm64, 2026-11-24, from the `sox-audio-chain` worktree.
- Versions: sox 14.4.2 and soxi from the same build (`brew list --versions sox` gives `sox 14.4.2_6`; `sox --version` prints a truncated banner on this build, so the Homebrew version is the record). jq and shasum from the system. ImageMagick 7.1.2-35 for the contact sheet only, not in `run.sh`. Node, Playwright and Chromium are not involved. No install was performed by this example: sox was already present, and no other package was installed.
- Commands: `run.sh --record` (wrote `expected/summary.json`), then `run.sh`, which printed `sox-audio-chain: OK` and exited 0.
- Measured (`expected/summary.json`):
  - Source: four mono 48 kHz tones of 0.5 s, rough frequencies 439, 659, 879 and 1099 Hz against nominal 440, 660, 880 and 1100 Hz (within 1%).
  - Chain output: 66150 samples, 44100 Hz, 2 channels, 16-bit, 1.500 s. Peak amplitude 0.354 (predicted 0.353553, within 0.005; ceiling 0.501187). Head peak over 1 ms 0.012 (bound 0.05). Tail peak over 5 ms 0.015 (bound 0.02).
  - Rerun identity: `chain-a.wav` and `chain-b.wav` are byte-identical with `-D`, SHA-256 `03061667080322762b6281f8049e56e177b035cecd06439fabab89aa7389ef24`. The source tones file has a different hash (`9f59ee1b...`).
  - Observation, not a check: the same chain without `-D` gave different bytes across two runs (SHA-256 `8318345a...` in the record run and `9ea8a9c5...` in the verify run). Dither is what breaks identity here, and `-D` restores it.
- Checks: all nine predeclared checks true (tone sequence, sample count, format, duration, peak below ceiling, gain applied, fade applied, distinct hashes, rerun identical), plus the `expected/` diff.
- Inspection: `output/contact.png` stacks two `sox ... spectrogram` images. Top: the chain output, drawn as two stacked channel panels with the same content in each. The 440, 660 and 880 Hz tones appear in turn over 0 to 0.5, 0.5 to 1.0 and 1.0 to 1.5 s; the 1100 Hz tone is absent (trimmed) and the output ends at 1.5 s. Bottom: the source, with the four tones through 2.0 s and a broadband click at each tone join (0.5, 1.0 and 1.5 s). The chain output keeps the joins at 0.5 and 1.0 s. Not blank, not clipped, and the frequency steps are as predeclared. The fades are small on the spectrogram and are confirmed by the head and tail measurements, not by the image.
- Defects found and corrected during the build: the first `stat` helper put effects before the `-n` output, which sox rejected; fixed by placing effects after `-n`. A stereo `stat` gave 311 Hz for a 440 Hz tone, so the frequency check runs on the mono source only. Two `synth` effects in one command produced only the first tone, so each tone is its own `synth` call.
- Deviations and limitations: the tone joins click (no crossfade). That is the source design, kept as is; no listening test was done. The ceiling is a bound, not a limiter, and was not binding (peak 0.354 against 0.501). The summary rounds amplitudes to 3 dp for the record; the checks use the 6 dp `stat` values. The rough frequency is a zero-crossing estimate. Byte identity is on this host and this sox build only. The resampler's quality, aliasing and passband were not measured.
- Result: pass for the claim as worded, on this host and this sox build, for these settings: synth tone sequence, trim, fade, gain, channels, 48 to 44.1 kHz resample, soxi header values and sample count, peak below the predeclared ceiling, and `-D` reruns byte-identical.
- What this establishes: sox 14.4.2 produces the predeclared 1.5 s 44.1 kHz, 16-bit stereo WAV from the tone sequence; its chain applies the stated gain and fades; with dither disabled, two reruns give the same bytes. It does not establish audio quality, listening results, dither behaviour beyond the observation above, other platforms or versions, other formats, or that the ceiling acts on loud material.
- Reviewer, follow-up and revisit triggers: revisit if sox changes its `synth`, `rate` or `stat` output format (the parsers read the `Maximum amplitude:` and `Rough frequency:` labels and `soxi` fields), if the Homebrew build changes, or if the dithered observation changes. A follow-up with a listening note, a crossfade at the tone joins, or a resampler quality measurement would test more.
