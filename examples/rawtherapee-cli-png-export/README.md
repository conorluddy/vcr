# RawTherapee CLI PNG export

## Intent and scope

- **Tool/version:** RawTherapee CLI 5.13 on macOS 26.6 arm64.
- **Claim:** the native batch CLI accepts one generated RGB PNG and exports it as an 8-bit compressed PNG at the same dimensions. Two independent exports must match byte-for-byte.
- **Exclusions:** RAW decoding, camera profiles, PP3 edits, other formats, UI/editor interaction, other operating systems or versions, and general color accuracy.
- **Documentation and license:** [RawPedia command-line options](https://rawpedia.pixls.us/command-line_options/) and [project GPL-3.0 license](https://github.com/RawTherapee/RawTherapee/blob/dev/LICENSE.txt), checked 2026-11-16. The input is generated locally; no photographs or external assets are used.
- **Dependencies:** RawTherapee CLI 5.13, Python 3 standard library for a small owned PNG, and the already-installed ImageMagick `magick identify` for output dimensions and color count. `-q` bypasses the cache, `-n -b8` selects compressed 8-bit PNG output, and `-c` is the final CLI option as required by its help.
- **Output:** generated input, two converted PNGs, command logs and transient app cache stay under ignored `output/`. Only the runner and numeric expected record are committed.

## Plan, before running

- **Command:** `./run.sh --record`, then `./run.sh`. The runner reads the version line from `rawtherapee-cli -v` output (that help-style probe exits 255), processes the same generated file into two separate directories, and compares dimensions, distinct-color count and whole-file SHA-256.
- **Expected checks:** output remains 64×48, has more than 16 distinct colors, and both converted PNG files have identical bytes. This deliberately tests a narrow non-RAW conversion route.
- **Stop conditions:** wrong CLI version, startup or conversion failure, missing output, unexpected dimensions or color count, or nonrepeatable output.

## Observation, after running

- Result: pass. RawTherapee CLI 5.13 exported the generated 64×48 RGB PNG to 8-bit compressed PNG. Both independent outputs were 64×48 with 2,434 distinct colors and identical SHA-256 `579020089175ba9a0bf88e33ac49fa636c63d21656b862282e3297c7f2a3fb56`. The output was opened and visually checked at native size.
- Runtime: RawTherapee CLI 5.13, macOS 26.6 arm64. The command is the app bundle executable linked onto PATH by Homebrew; no RAW files or external assets were used.
- Limits: this is evidence for one local PNG batch export only. It does not validate RAW development, image quality or colorimetric accuracy.
