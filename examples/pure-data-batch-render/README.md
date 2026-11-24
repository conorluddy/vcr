# Pure Data batch render: one hand-written patch, WAV rate, duration, envelope and tone checks

Status: validated on macOS arm64, 2026-11-24, for the claim as scoped below (see "Observation, after running"). Checked 2026-11-24.

## Intent and scope

- Tool: `pure-data` (Pure Data, `pd`), the Homebrew cask `pd` (`brew install --cask pd`), already installed on this machine as `/Applications/Pd-0.57-0.app/Contents/Resources/bin/pd` (the cask does not put `pd` on `PATH`). `pd -version` prints `Pd-0.57.0`. The catalogue card (`catalog/tools/pure-data.json`, checked 2026-11-24) gives the official site https://puredata.info/ and the source https://github.com/pure-data/pure-data, and no licence field. The licence file it cites (https://github.com/pure-data/pure-data/blob/master/LICENSE.txt) was not opened for this run, so no licence is stated here. Docs: https://puredata.info/docs.
- VCR job and claim: Pd in `-nogui -batch` mode renders a hand-written patch (`fixture.pd`: `osc~` at 440 Hz through a `vline~` envelope into `writesf~`) to a 16-bit mono WAV at the predeclared sample rate, channel count and duration within tolerance; the FFT peak of the sustain is 440 Hz within 5 cents; the envelope rises and falls at the predeclared times within 2 ms; two reruns are byte-identical.
- Exclusions: no realtime audio (`-batch` with no audio device; no `-audiodev`, no `dac~`); no listening or perceptual claim; no claim about `osc~` purity or aliasing; no claim about other Pd versions, other platforms, other sample rates or channel counts, other sample widths or file formats; no claim about Pd's GUI or plugin modes; no claim about patches beyond this one, or about Pd's `delay`/`vline~` accuracy beyond the measured tolerance; no tool-to-tool edge (no FFmpeg, sox or other catalogue tool runs in `run.sh`). `-send` is not used: the patch starts itself from `loadbang`.
- Mapping of the template's frame checks: this is an audio fixture, so "frame count" is the WAV sample-frame count; "dimensions" are sample rate, channels and sample width from the WAV header; "at least two distinct hashes" becomes "the attack, sustain and release segments hash to three distinct SHA-256 values"; "shuffled order equals sequential" does not apply (there is no seek); "alpha range on a middle frame" does not apply, and the sustain amplitude check plays its role.
- Tool documentation and licence: https://puredata.info/ and the catalogue card, checked 2026-11-24. No dependency, model or asset is downloaded or committed. No externals or abstractions are used; the patch uses only built-in objects (`loadbang`, `t`, `msg`, `delay`, `osc~`, `vline~`, `*~`, `writesf~`).
- Environment: macOS 26.6 arm64 (Darwin 25.6.0), CPU only, no GPU, no network. Pd 0.57.0 from the cask.
- Input: none committed. `fixture.pd` is hand-written source and is the only patch used.
- Dependencies and side effects: `pd` is the only catalogue tool and is already installed; this example installs nothing. Python 3.12.2 standard library is used by `analyse.py` (`wave`, `array`, `hashlib`, `json`, `math`); it is not a catalogue tool, needs no venv and no pip package.
- Workspace and cleanup: writes only `output/` (git-ignored): `output/run-a/` and `output/run-b/` (each holds a copy of `fixture.pd` and its `render.wav`), the two Pd logs and `summary.json`. Remove with `rm -rf examples/pure-data-batch-render/output`.
- Catalogue tools used by the fixture: `pure-data` only. `ImageMagick` (`magick`) is used afterwards for the contact sheet, outside `run.sh`, and is not part of the claim.

## Plan, before running

- Versions: Pd 0.57.0 (`pd -version`), Python 3.12.2 standard library, `shasum` and `cmp` from macOS.
- Patch, `fixture.pd` (source): `loadbang` fires a trigger that, right to left: (1) `; pd dsp 1`; (2) `open -bytes 2 render.wav` to `writesf~ 1`; (3) `start` to `writesf~`; (4) `0.5 50 0` to `vline~` (ramp to 0.5 over 50 ms); (5) `0 300 1500` to `vline~` (ramp to 0 over 300 ms, starting 1500 ms later). `osc~ 440` times through `*~` with the `vline~` signal into `writesf~ 1`. A `delay 2000` from `loadbang` sends `stop` to `writesf~`, then `delay 100` sends `; pd quit`.
- Predeclared envelope: linear attack 0 → 0.5 over 0 to 50 ms; sustain 0.5 from 50 to 1500 ms; linear release 0.5 → 0 over 1500 to 1800 ms; silence from 1800 ms to the end.
- Command (`run.sh`), run twice in `output/run-a` and `output/run-b`: `pd -nogui -batch -r 48000 -open <abs path>/fixture.pd` with stdout and stderr to a log. `writesf~` writes `render.wav` beside the copied patch, so each run's directory is its output location. The sample rate is set with `-r 48000`; batch mode runs as fast as possible with no audio device.
- Expected artifacts: two WAV files, 16-bit mono 48000 Hz, 96000 sample frames (2.000 s) nominal; `expected/summary.json` from `--record`.
- Predeclared checks (`analyse.py`; any false check exits 1 and `run.sh` stops before recording or diffing):
  1. `rate_48000_hz`: WAV header sample rate is 48000.
  2. `mono`: channel count is 1.
  3. `sample_width_16_bit`: sample width is 2 bytes (the `-bytes 2` flag).
  4. `duration_2000ms_within_5ms`: frame count / rate is 2000 ms ± 5 ms (96000 ± 240 frames).
  5. `peak_below_full_scale`: maximum |x| < 1.0.
  6. `plateau_0_5_within_1_percent`: the maximum of the 5 ms trailing-peak envelope over 600–1400 ms is 0.5 ± 1% (0.495 to 0.505).
  7. `rise_10_within_2ms`: first time the envelope reaches 10% of the plateau is at 5.0 ms (ramp 50 ms × 0.1) ± 2 ms.
  8. `rise_90_within_2ms`: first time the envelope reaches 90% of the plateau is at 45.0 ms ± 2 ms.
  9. `fall_90_within_2ms`: first time the envelope drops below 90% of the plateau after 600 ms is at 1535.0 ms ± 2 ms. The predicted value is 1530 ms (the ramp reaches 90% at 1500 + 300 × 0.1) plus the 5 ms trailing-window lag, which is a property of the measurement and is stated here, not chosen after the run.
  10. `fall_10_within_2ms`: the same for 10% of the plateau: predicted 1500 + 270 + 5 = 1775.0 ms ± 2 ms.
  11. `tone_440_within_5_cents`: a 16384-point Hann-windowed FFT of the sustain starting at 300 ms; the peak bin is searched between 200 and 1000 Hz and refined by parabolic interpolation on log magnitude; the error from 440 Hz is within 5 cents.
  12. `tail_silent`: maximum |x| from 1850 ms to the end is ≤ 1e-4 (−80 dBFS).
  13. `segments_distinct`: the attack (0–50 ms), sustain (300–400 ms) and release (1500–1800 ms) PCM bytes hash to three distinct SHA-256 values.
  14. `rerun_byte_identical`: the two runs' `render.wav` files have identical SHA-256 digests.
  15. `expected/summary.json` matches `output/summary.json` exactly (includes the measured values and the render's SHA-256).
- Envelope method: a trailing-maximum of |x| over the previous 240 samples (5 ms, at least one period of 440 Hz, so the carrier peak is always inside the window; the envelope error from carrier phase is below 0.03%). On a rising ramp this is the true envelope; on a falling ramp it lags by the window length, which is why checks 9 and 10 include the 5 ms.
- Expected failure modes and stop conditions: `pd` missing, or not exiting after `; pd quit` (report blocked/fail; the run is not retried with a different invocation); `writesf~` failing to open the file in batch mode without an audio device; `-r 48000` not honoured (the rate check would fail, recorded, not patched around); the stop landing one block late (the duration tolerance is 5 ms, about 3.75 blocks of 64 samples, so one late block passes); a non-byte-identical rerun (a finding, not a reason to drop check 14). No tolerance is widened after the run.
- Inspection after running: `output/contact.png`, a `magick` contact sheet of the sustain spectrum and the envelope, made outside `run.sh`. Expected picture: a single tone bar at 440 Hz and an envelope that ramps up over the first 50 ms, holds to 1.5 s, falls to zero by 1.8 s and is silent after.
- Reproduce: `examples/pure-data-batch-render/run.sh --record` (writes `expected/summary.json`), then `examples/pure-data-batch-render/run.sh` (expect `pure-data-batch-render: OK`). Inspect `output/summary.json` and the logs `output/pd-a.log`, `output/pd-b.log`.

## Observation, after running

- Executor and date: Conor's MacBook Pro (`Conors-MacBook-Pro-2.local`), macOS 26.6 arm64 (Darwin 25.6.0), 2026-11-24, from the `pure-data-batch-render` worktree (branch `worktree-agent-a98084825514c4cda`).
- Versions: Pd 0.57.0 (`/Applications/Pd-0.57-0.app/Contents/Resources/bin/pd -version` prints `Pd-0.57.0 ("")`; installed by the Homebrew cask `pd`, already present, so nothing was installed for this run); Python 3.12.2 standard library; Node v22.19.0 and pnpm 10.29.2 (repository tooling only, not used by the fixture); `shasum`, `cmp` and `diff` from macOS. No Playwright or Chromium is involved. ImageMagick (`magick`) was used only to convert the inspection image.
- Commands: `run.sh --record` (wrote `expected/summary.json`, exit 0), then `run.sh` printed `pure-data-batch-render: OK` and exited 0. Both `pd` invocations exited 0 and wrote no log output (`output/pd-a.log`, `output/pd-b.log` are empty).
- Before the first run, one bug in `analyse.py` was found by reading it and fixed (a rerun helper returned a string that would have been counted as a failed check). No predeclared number was changed.
- Measured (`expected/summary.json`):
  - Render: WAV, 16-bit PCM, mono, 48000 Hz, 96000 frames (2000.0 ms). Peak amplitude 0.5 (plateau envelope 0.5 exactly). SHA-256 `456ffdaef2b3e60116de743e065732ecdf4128727b1fa2f24648a4b288a1aed0`, the same on the record run and the check run.
  - Rise: 10% at 5.52 ms (predicted 5.0 ms); 90% at 45.42 ms (predicted 45.0 ms). Both within the 2 ms bound. The 0.4 to 0.5 ms lateness is the envelope reading the nearest carrier peak, which can lie up to half a 440 Hz period (about 1.1 ms) before the sample it is attributed to.
  - Fall: 90% at 1534.56 ms (predicted 1535.0 ms); 10% at 1774.38 ms (predicted 1775.0 ms). Both within 2 ms.
  - Tone: sustain FFT peak 440.0388 Hz, error +0.15 cents (bound 5 cents).
  - Tail: maximum |x| from 1850 ms to the end is 0.0.
  - Segment hashes (attack, sustain, release): `1c275ec1...`, `727f72a7...`, `2a65da47...`, all distinct.
  - Rerun: `run-a/render.wav` and `run-b/render.wav` have identical SHA-256 digests.
- Checks: all fifteen predeclared checks true (the fourteen `analyse.py` checks plus the `expected/` diff).
- Inspection: `output/contact.png`, a waveform min/max plot made from `output/run-a/render.wav` by a scratch script and `magick`, not a frame contact sheet (the audio fixture has no frames). It shows a ramp up over the first 50 ms (about 25 px at 2 ms per px), a flat plateau at the 0.5 guide lines from 50 ms to about 1.5 s, a straight-line release to zero by about 1.8 s, then a flat line at zero to 2 s. Not blank, not clipped, and the envelope shapes are as predeclared. The image does not show the spectrum; the 440 Hz tone is established by the FFT check only.
- Deviations and limitations: the envelope is a trailing-maximum estimate, so its times carry a carrier-phase bias of up to about 1 ms, inside the 2 ms bound but not zero. Pd's `delay` and `vline~` are not measured independently. The stop time is not separately checked; the duration check covers it. Batch mode was run only on this host and this Pd build; the command requests no audio device (no `-audiodev`), but which device, if any, Pd opened was not inspected. Byte identity was observed on this host and this build only.
- Result: pass for the claim as worded, on this host and this Pd build: a hand-written `osc~` and `vline~` patch rendered by `pd -nogui -batch` to a 16-bit mono 48 kHz WAV of 2.000 s, with the predeclared envelope times within 2 ms, the tone at 440 Hz within 5 cents, a silent tail, and two reruns byte-identical.
- What this establishes: Pd 0.57.0 in batch mode, with no audio device, writes the predeclared patch's output to a WAV with the predeclared rate, channels, width and duration; the envelope and tone match the patch within the stated bounds; the output is byte-identical across the two runs and the record and check runs. It does not establish listening quality, `osc~` purity or aliasing, realtime audio output, other sample rates or channel counts, other Pd versions or platforms, the GUI, externals, or any tool-to-tool edge.
- Reviewer, follow-up and revisit triggers: revisit if the Pd cask version changes (the binary path and the batch behaviour depend on it), if `writesf~`'s WAV header starts carrying a timestamp (byte identity depends on it), or if batch mode starts opening an audio device by default.
