---
name: aubio
description: Use the aubio CLIs (aubioonset, aubiotrack, aubiopitch) to read onset times, tempo and pitch from an audio file. VCR evidence is partial and covers generated clicks and sine tones with Homebrew 0.4.9_4 on macOS arm64.
---

# aubio

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- aubio turns an audio file into text events on stdout, one line per event: onset times (`aubioonset`), beat times (`aubiotrack`) and time/frequency pairs (`aubiopitch`). It does not decode every format reliably, mix, or encode; use FFmpeg for that, and librosa for broader music analysis.
- Tested only on generated audio: a 120 BPM click track and five pure sine tones (44.1 kHz mono, 16-bit WAV), default options, macOS arm64, Homebrew `0.4.9_4`. Real music, noise, other sample rates, other `-O`/`-t`/`-M` values and the Python binding are untested.
- Onsets: 20 of 20 clicks found within 8.8 ms, no extras (pass). Output was byte-identical across reruns.
- Beats: BPM estimate 120.4 (within 0.4), but only 9 beats were emitted, from 1.76 s to 5.75 s, with none in the last 4 s of clicks. Treat the early seconds as warm-up and do not rely on beat times as complete (predeclared check failed).
- Pitch: 3 of 5 tones within 10 cents. The two lowest were sharp: 220 Hz by +15.6 cents, 261.63 Hz by +10.3. Output varies about 1e-4 Hz between processes, so it is not byte-stable (2 distinct hashes in 8 runs). Verify pitch against a known reference before relying on it.
- Guidance, not tested: prefer onsets for cut or beat alignment; set `-B` (buffer) and `-H` (hop) explicitly rather than trusting defaults. Whether any value of them fixes the beat or low-pitch results is not tested.
- Judging whether markers fall on beats is a pillar matter: see `SOUND-BEAT-ALIGN` and `SOUND-BPM-FRAME-GRID` (sound design) and `PACE-BEAT-06` (cuts on markers); tolerances live there, not here. VCR declares no onset-to-timeline contract yet.

## Capability map
- **Onset detection** (`aubioonset`): [manual](https://aubio.org/manpages/latest/aubioonset.1.html). Tested with the default method and threshold only; `-O`, `-t`, `-M` untested.
- **Beat tracking** (`aubiotrack`): [manual](https://aubio.org/manpages/latest/aubiotrack.1.html). Tested; incomplete beats observed.
- **Pitch detection** (`aubiopitch`): [manual](https://aubio.org/manpages/latest/aubiopitch.1.html). Tested with default `yinfft` and `-u freq` only.
- **Other CLIs** (`aubionotes`, `aubiomfcc`, `aubioquiet`, `aubiocut`) and the C library and Python module: listed in the [manual index](https://aubio.org/manual/latest/); untested.

## Install and doctor
```sh
brew install aubio
```
`vcr doctor` reports the tool; the card's check is `aubioonset -h`. The CLIs have no version flag, so the Homebrew bottle revision (`brew list --versions aubio`) identifies the build. Licence is GPL-3.0-or-later.

## Smoke test
```sh
examples/aubio-onsets-pitch/run.sh
# expect: onsets and pitch lines diff against expected/summary.json, then exit 1
```
The fixture needs `ffmpeg`, `ffprobe`, `jq` and the aubio CLIs. On the recorded run it exits 1 because the beat-count and two low-tone pitch checks fail; the summary diff is empty. `aubio-onsets-pitch: OK` is not expected. The `rerun_identical` line may print `true` or `false` because `aubiopitch` is not byte-stable.

## Recipes
Output is whitespace-separated text; no header.
```sh
aubioonset -i click.wav -B 1024 -H 256      # one onset time (s) per line
aubiotrack -i click.wav                     # one beat time (s) per line
aubiopitch -i tones.wav -u freq             # time(s) and Hz per line; 0 means unvoiced
```
The `-B 1024 -H 256` values illustrate setting both explicitly; the fixture ran defaults, so these were not tested.

## Troubleshooting
- Few or no beats early in a file: `aubiotrack` emitted nothing before 1.76 s. Drop or ignore early beats and check the count.
- Low tones read sharp: pitch was 10 to 16 cents high at 220 and 261.63 Hz. Compare with a reference tone; cause not investigated.
- Pitch values differ between runs by about 1e-4 Hz: round before comparing or hashing.
- awk scripts around the output: avoid `index` as a variable name; it is an awk builtin and broke the fixture's first run.

## Official docs
- [aubio](https://aubio.org/)
- [aubio manual](https://aubio.org/manual/latest/)
- [aubio source](https://github.com/aubio/aubio)
