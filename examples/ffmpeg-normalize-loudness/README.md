# ffmpeg-normalize EBU R128 loudness normalisation

Status: validated on macOS arm64, 2026-11-24, for the claim as scoped below (see "Observation, after running"). Checked 2026-11-24.

## Intent and scope

- Tool: `ffmpeg-normalize` 1.45.3 (PyPI, uploaded 2026-11-24; run as a CLI from an isolated venv). It wraps the system FFmpeg 9.0.2 (`/opt/homebrew/bin/ffmpeg`), which is not changed.
- VCR job and claim: ffmpeg-normalize's EBU R128 two-pass normalisation brings generated test audio (sine bursts at a quiet and a loud level, 10 s each) to a predeclared integrated loudness target and true-peak ceiling. FFmpeg's `ebur128` filter measures each output within a predeclared tolerance of the target, true peak at or below the ceiling, with duration and sample rate unchanged.
- Parameters are fixtures, not rules: target -16.0 LUFS, tolerance 0.5 LU, true-peak ceiling -1.5 dBTP. They are not VCR loudness policy.
- Exclusions: no delivery-spec claim (no broadcast or streaming platform is tested); no loudness range (LRA) target claim beyond checking that linear gain leaves the input LRA unchanged; no dynamic (one-pass) mode; no `--dual-mono`, no multichannel layouts; no claim about real music or speech; no claim that the true-peak ceiling is ever binding (for these bursts the peak sits well under the ceiling, so the check confirms no overshoot, not limiting); no claim about other FFmpeg builds or other ffmpeg-normalize versions.
- Measurement independence: the normalisation uses FFmpeg's `loudnorm` filter internally; verification uses a separate FFmpeg filter, `ebur128`, run on the output. Both are in the same FFmpeg build, so this is not an independent meter.
- Tool documentation: https://github.com/slhck/ffmpeg-normalize (README and usage docs). Catalogue card licence: MIT. The upstream LICENSE file could not be retrieved on 2026-11-24 (raw URL 404 on `main`; GitHub's licence API reports `NOASSERTION`), so the MIT licence is card-sourced and unconfirmed. The package metadata carries no licence field.
- Environment: macOS arm64 (Darwin 25.6.0), Python 3.12.13 via uv, FFmpeg 9.0.2 (Homebrew). CPU only.
- Input: none committed. `run.sh` generates two 48 kHz stereo WAVs with FFmpeg `aevalsrc` (deterministic, no randomness), each 10 s: `output/quiet.wav` (440 Hz sine gated 0.5 s on / 0.5 s off, amplitude alternating 0.03 and 0.06 each second) and `output/loud.wav` (same gating, amplitude 0.25 and 0.5). The alternation gives each file a small non-zero loudness range, so linear gain is a valid two-pass path (see Amendment 1).
- Dependencies, installation plan and side effects: one isolated venv at `examples/ffmpeg-normalize-loudness/output/venv` (git-ignored with `output/`), created with `uv venv --python 3.12` and populated only from `requirements.txt` (`ffmpeg-normalize==1.45.3` plus pinned transitive dependencies). No Homebrew, npm or pnpm install. `run.sh` uses no network.
- Workspace and cleanup: writes only `output/` (ignored). Remove with `rm -rf examples/ffmpeg-normalize-loudness/output`.
- Catalogue tools used by the fixture: `ffmpeg-normalize` and `ffmpeg-ffprobe` (FFmpeg for generation, normalisation and `ebur128`; ffprobe for duration and sample rate). The contact-sheet step uses ImageMagick as an inspection aid only; it is not in `run.sh` and is not claimed.

## Plan, before running

- Setup (once): `uv venv --python 3.12 examples/ffmpeg-normalize-loudness/output/venv`; `uv pip install --python examples/ffmpeg-normalize-loudness/output/venv/bin/python -r examples/ffmpeg-normalize-loudness/requirements.txt`. The transitive pins in `requirements.txt` came from `uv pip freeze` after that install.
- Generation (`run.sh`): `ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='0.03*(1+mod(floor(t),2))*sin(2*PI*440*t)*lt(mod(t,1),0.5)':s=48000:d=10:c=stereo" -c:a pcm_s16le output/quiet.wav`, and the same with `0.25` as the base amplitude for `output/loud.wav`.
- Normalisation (`run.sh`), per input:
  - Configuration A, default options (observation of default sample-rate behaviour): `ffmpeg-normalize <in> -nt ebu -t -16 -tp -1.5 -f -o output/norm-a/<name>.wav`.
  - Configuration B, the claim's configuration: the same plus `-ar 48000`, run twice into `output/norm-b/` and `output/norm-c/`.
  - Two-pass is the default EBU mode; `--dynamic` is one-pass and is not used.
- Verification (`run.sh`):
  - Integrated loudness, true peak and loudness range from `ffmpeg -nostats -i <file> -af ebur128=peak=true -f null -` (summary `I:`, `True peak: Peak:`, `LRA:`).
  - Duration and sample rate from `ffprobe` on input and output.
  - Decoded-PCM identity from `ffmpeg -i <file> -f md5 -`.
- Predeclared checks for configuration B (any failure exits 1 and writes `output/summary.json`):
  1. Input contrast: the loud and quiet inputs differ in integrated loudness by at least 15 LU.
  2. Input loudness range: each input's LRA is at least 1.0 LU (non-zero, so linear normalisation is a real path).
  3. Target: each output's integrated loudness is within 0.5 LU of -16.0 LUFS.
  4. Ceiling: each output's true peak is at or below -1.5 dBTP.
  5. Linear gain: each output's LRA equals its input's within 0.5 LU (a linear gain preserves LRA; a dynamic revert would change it).
  6. Duration: each output's duration equals its input's within 0.01 s.
  7. Sample rate: each output's sample rate is 48000 Hz, equal to its input's.
  8. Rerun identity: configuration B's two runs give the same decoded-PCM MD5 per file.
  9. `expected/summary.json` matches `output/summary.json` exactly.
- Predeclared observation (not a pass/fail check): the configuration A output sample rate and loudness, recorded so the default behaviour is on the record. If A's sample rate differs from 48000, the claim as worded ("sample rate unchanged") does not hold under default options; the record then states that and gives the claim's result with `-ar 48000` only.
- Visual inspection after the run: waveforms of the input and output files drawn with `ffmpeg showwavespic` and stacked with ImageMagick into `output/contact.png`, to confirm the bursts are present, the quiet file is raised, the loud file is lowered, and nothing is clipped or silent.
- Stop conditions: `ebur128` missing from `ffmpeg -filters`, or `ffmpeg-normalize --help` lacking `-nt`, `-t`, `-tp`, `-ar`: report blocked. Target or ceiling failure: report fail; do not move the target or ceiling. Rerun mismatch: report fail.
- Reproduce: `examples/ffmpeg-normalize-loudness/run.sh --record`, then `examples/ffmpeg-normalize-loudness/run.sh` (expect `ffmpeg-normalize-loudness: OK`). Inspect `output/summary.json` and `output/contact.png`.

## Amendment 1, 2026-11-24, after the first `--record` (discarded)

The first record used a constant-amplitude burst design and default options. Its run produced two findings, both kept on the record and neither used to change the verdict:

- Linear mode did not run. The `loudnorm` filter reported that the measured input loudness range is zero (a constant burst train has no LRA) and reverted to dynamic normalisation. The fixture therefore did not test two-pass linear normalisation. Fix: the alternating amplitude design above, with input LRA of 1.8 LU, and check 5 added. A probe in a scratch folder under `output/probe/` (not evidence) showed no warning and output LRA 1.8 LU with `-ar 48000`.
- Default options gave a 192000 Hz output, not the input's 48000 Hz, in that discarded run. The same run had the dynamic revert above, so the cause is not isolated: the rate change may come from dynamic mode, not from default options. The amended run (linear mode) gives 48000 Hz under default options too (configuration A). The 192 kHz result is therefore a dynamic-mode observation, not a default-options finding, and it is kept here as a correction to the first draft of this note.

The first record is discarded; `expected/` is re-recorded from the amended run. Thresholds, target, ceiling and tolerance are unchanged.

## Observation, after running

- Executor and date: Conor's MacBook Pro (`Conors-MacBook-Pro-2.local`), macOS 26.6 arm64, 2026-11-24, from the `ffmpeg-normalize-loudness` worktree.
- Versions: ffmpeg-normalize 1.45.3 (`--version`; installed from PyPI into `output/venv`, Python 3.12.13, uv 0.10.8); FFmpeg and ffprobe 9.0.2 (Homebrew, `/opt/homebrew/bin`); ImageMagick 7.1.2-35 (inspection only). No Playwright, Chromium or Node involved.
- Installed, and where: the venv `examples/ffmpeg-normalize-loudness/output/venv` (git-ignored) holds `ffmpeg-normalize==1.45.3` and these pinned transitive dependencies, now in `requirements.txt`: ffmpeg-progress-yield 1.1.4, markdown-it-py 4.3.0, mdurl 0.1.2, mutagen 1.48.1, pygments 2.21.0, rich 15.0.0, rich-argparse 1.8.0, tqdm 4.70.1. Nothing else was installed; no Homebrew or global Python package changed.
- Commands: `run.sh --record` once, then `run.sh`, which printed `ffmpeg-normalize-loudness: OK` and exited 0.
- Measured (`expected/summary.json`, all values by FFmpeg `ebur128` with `peak=true`, 1 dp):
  - Inputs: quiet -29.1 LUFS, loud -10.7 LUFS, contrast 18.4 LU (predeclared at least 15). Both have LRA 1.8 LU (at least 1.0).
  - Configuration B (`-ar 48000`), the claim's configuration: quiet -16.1 LUFS and loud -16.1 LUFS, both within 0.5 LU of -16.0. True peak -11.4 dBTP for both (ceiling -1.5). LRA 1.8 LU on both, equal to input. Duration 10.000 s in and out. Sample rate 48000 Hz in and out. Decoded-PCM MD5s: quiet `53e46407...`, loud `e3e32a1b...`; the second configuration B run gives the same MD5s.
  - Configuration A (default options): quiet and loud -16.1 LUFS, 48000 Hz.
  - Checks: all 8 predeclared checks true (input contrast, input LRA, target, ceiling, linear gain preserves LRA, duration, sample rate, rerun identity), plus the `expected/` diff.
- Visual inspection: `output/contact.png` (1800x320), waveforms of the inputs (top) and outputs (bottom) for the quiet file (left half) and the loud file (right half). Each panel shows ten bursts over 10 s, with the two-level alternation visible as a thinner and thicker pattern in the inputs. Outputs keep the same burst count and pattern, are not clipped, and are not silent. Limitation: each panel is scaled by `showwavespic` to its own peak, so the image does not show the level change; the level evidence is the measured numbers above.
- Defects found and corrected: the first record used constant bursts. `loudnorm` reverted from linear to dynamic (zero input LRA), so it did not test linear two-pass. Fixed by the alternating design and by check 5 (Amendment 1). The first draft's 192 kHz note is corrected above.
- Deviations and limitations: the ceiling was never binding. The bursts sit about 10 dB under the ceiling after normalisation (true peak -11.4 dBTP), so the true-peak check confirms no overshoot, not limiting. The LRA is small (1.8 LU) by design, so this does not test a wide-range programme. Only sine bursts at 440 Hz were used. The 0.5 LU tolerance is the predeclared one; the observed 0.1 LU offset is well inside it. The `ebur128` filter and `loudnorm` are in the same FFmpeg build (not an independent meter). Outputs are PCM WAV; no other container or codec was tested.
- Result: pass for the claim as worded, on this host and this version, for these inputs and options: the integrated loudness of both outputs is within 0.5 LU of -16.0, the true peak is below -1.5 dBTP, duration and sample rate are unchanged, and reruns are identical. Scope limits as stated above.
- What this establishes: ffmpeg-normalize 1.45.3's EBU R128 linear normalisation (`-nt ebu -t -16 -tp -1.5`) brings two generated sine-burst files of 18 LU apart to -16.1 LUFS with unchanged LRA, duration and sample rate (48 kHz, with default options as well), on macOS arm64 with FFmpeg 9.0.2. It does not establish quality, the ceiling acting as a limiter, real programme material, other versions, or other platforms.
- Reviewer, follow-up and revisit triggers: revisit if ffmpeg-normalize changes its default mode or sample-rate handling, if the `loudnorm` revert rule changes, or if FFmpeg changes its `ebur128` summary format (the parser depends on the `I:`, `True peak:` and `LRA:` labels). A follow-up with a programme-style input that makes the ceiling bind would test limiting.
