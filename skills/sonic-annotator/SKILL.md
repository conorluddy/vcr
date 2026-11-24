---
name: sonic-annotator
description: Run Vamp plugins over audio in batch with sonic-annotator to get onset times or pitch tracks as CSV or JAMS. VCR evidence covers 1.7.0 with the QM onset detector and aubiopitch, generated audio, macOS arm64).
---

# sonic-annotator

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- sonic-annotator hosts Vamp plugins: it reads an audio file, runs named transforms and writes timed features. It has no analyses of its own; what exists depends on the plugin libraries found on `VAMP_PATH`. Use aubio for a single quick onset or pitch pass, librosa for a Python API, FFmpeg for conversion.
- Tested only on generated audio: a 120 BPM click track (20 clicks, 44.1 kHz mono) and a 440 Hz sine, default transform parameters, sonic-annotator 1.7.0 (macOS universal, arm64 slice) with the arm64 `qm-vamp-plugins` and `vamp-aubio` libraries from Vamp Plugin Pack 2.0.
- Onsets (`qm-onsetdetector:onsets`): 20 of 20 clicks within 25 ms, 0 misses, 0 extras. Every error was early (13.9 to 24.7 ms), so the detector is systematically early on this input, and the worst case leaves only 0.26 ms of margin. A different click shape could exceed 25 ms. Real percussion is untested.
- Pitch (`aubiopitch:frequency`): median 440.8 Hz over 258 voiced frames in 0.5 to 3.5 s, 3.0 cents sharp (check was 10). Two start-up frames near t = 0 read about 449 Hz; ignore the first moments.
- CSV and JAMS output were written; reruns were byte-identical, including across separate processes.
- Untested: tempo and beat transforms (`qm-tempotracker`, `aubiotempo`, `qm-barbeattracker`), the `rdf` writer, other plugins and parameters, `-d`, summaries, Intel (x86_64 slice), other OS versions.
- Judging whether markers land on beats is a pillar matter: see `SOUND-BEAT-ALIGN` and `SOUND-BPM-FRAME-GRID` (sound design) and `PACE-BEAT-06` (cuts on markers); tolerances live there, not here.

## Capability map
Discoverability only; documented is not validated.
- **Transform listing** (`-l`): tested; lists both transform ids. [README](https://www.vamp-plugins.org/sonic-annotator/)
- **Transform skeletons** (`-s <id>`) and transform files (`-t`): tested for the two ids above.
- **Writers** (`-w`): 1.7 offers `audiodb, csv, default, jams, lab, midi, rdf`. Tested: `csv`, `jams`. Untested: the rest. There is no `json` or JSON-LD writer; the plan to use one was wrong.
- **Plugins**: [Vamp plugin directory](https://www.vamp-plugins.org/download.html) and [pack](https://www.vamp-plugins.org/pack.html). Tested: two plugins. Others untested.
- **Batch and summary options** (multiple files, `-S`, segmenters): untested.

## Install and doctor
No Homebrew formula was used. The fixture downloads two SHA-256-pinned artefacts into git-ignored `output/`:
```sh
examples/sonic-annotator-features/fetch-tools.sh
```
It unpacks the 1.7.0 release tarball binary to `output/bin/` and copies the arm64 plugin libraries and their `.n3` descriptions out of the Vamp Plugin Pack 2.0 installer image to `output/vamp/`. The pack is an installer; the fixture extracted the libraries without running it, so nothing is written to `~/Library`. `vcr doctor` runs the card's check `examples/sonic-annotator-features/output/bin/sonic-annotator -v` (prints `1.7`). Do not assume it is installed.

Licences: sonic-annotator is GPL-2.0; `vamp-aubio` declares GPL; the `qm-vamp-plugins` descriptions give only QMUL copyright, so its licence is unverified. Review before redistributing the libraries or anything built on them.

## Smoke test
```sh
examples/sonic-annotator-features/run.sh
# expect: sonic-annotator-features: OK
```
Needs `ffmpeg`, `ffprobe`, `jq` and the fetched tools. It diffs `output/summary.json` against `expected/summary.json` and exits non-zero on any difference.

## Recipes
```sh
export VAMP_PATH="$PWD/output/vamp"
sa=output/bin/sonic-annotator
$sa -l                                                   # list transform ids
$sa -s vamp:qm-vamp-plugins:qm-onsetdetector:onsets > onsets.n3   # generate a transform file
$sa -t onsets.n3 clicks.wav -w csv --csv-stdout --csv-omit-filename   # time (s) per row
$sa -t onsets.n3 clicks.wav -w jams --jams-basedir out/               # out/clicks.json
```
Pitch rows are `time,Hz`; 0 or less is unvoiced. `VAMP_PATH` must name the directory holding the dylibs.

## Troubleshooting
- `-w json` fails: 1.7 has no such writer. Use `jams` for JSON.
- `jams` fails or writes nothing: the plugins' `.n3` descriptions must sit beside the dylibs. The pack's dylibs carry none; the fixture copies them and restores the missing `vamp:` and `plugbase:` prefixes (`extract-vamp-plugins.py`).
- A transform file from `-s` defines no transforms: it was generated before the `.n3` files were present. Regenerate it.
- CSV first row has a filename column: add `--csv-omit-filename`.
- Onset times sit up to 25 ms early: expected from this detector on these clicks; check any tolerance with margin.

## Official docs
- [Sonic Annotator](https://www.vamp-plugins.org/sonic-annotator/) and its 1.7 README
- [Vamp Plugin Pack](https://www.vamp-plugins.org/pack.html)
- [Releases](https://github.com/sonic-visualiser/sonic-annotator/releases/tag/sonic-annotator-1.7)
