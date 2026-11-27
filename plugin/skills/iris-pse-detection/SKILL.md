---
name: iris-pse-detection
description: Screen a decoded video for photosensitive-epilepsy flash risk with the IRIS Python port in a venv. Load when a render needs a machine flash screen before human review; advisory only, never a safety or WCAG certificate.
---

# iris-pse-detection

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Screens a video file for luminance and saturated-red flashes. Use it as one input to the `accessibility` skill (`A11Y-FLASH-GENERAL`, `A11Y-FLASH-RED`, `A11Y-PATTERN-STRIPES`) and to `accessibility-reviewer`.
- **Advisory, not certification.** The port is Beta, single-maintainer, and says results can differ from C++ IRIS at boundaries. A Pass is never "safe" or "WCAG 2.3.1 compliant"; a human or certified analyser decides. Screen the delivered encode, not a source.
- VCR evidence (IRIS 1.1.2, Python 3.12, macOS arm64): a generated full-frame 5 Hz black/white clip fails, a 1 Hz alternation and a static grey pass. Red flash, patterns, borderline content and real footage are untested.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `VideoAnalyser`, `Configuration`, `AnalysisResult` | [usage guide](https://github.com/tokoroten/iris-pse-detection/blob/main/docs/USAGE.md) | luminance path tested |
| `iris video.mp4 [--json]` CLI, CSV and JSON under `Results/` | [usage guide](https://github.com/tokoroten/iris-pse-detection/blob/main/docs/USAGE.md) | CSV written; CLI untested |
| Red flash, extended failure (4 s+), `--pattern-detection`, `--resize` | [README](https://github.com/tokoroten/iris-pse-detection) | untested |

## Install and doctor
```sh
python3.12 -m venv output/venv && output/venv/bin/pip install iris-pse-detection==1.1.2
```
Project-local venv; `vcr doctor` does not probe it. Pulls opencv-python, numpy and scipy. Never install globally. Licence: port MIT, upstream EA IRIS BSD-3-Clause (keep EA's notice if redistributing).

## Smoke test
```sh
cd examples/iris-pse-flash-detection && ./run.sh
# expect: iris-pse-flash-detection: OK
```
Builds the venv if absent, generates three clips with FFmpeg, runs `check.py` twice and diffs `expected/metrics.json`. A failed predeclared check prints `KNOWN FAIL` instead.

## Recipe
```py
from iris_pse_detection import VideoAnalyser, Configuration
result = VideoAnalyser(Configuration()).analyse_video("clips/render.mp4")
print(result.overall_result.name, result.total_luminance_incidents.flash_fail_frames)
```
Names include `Pass`, `PassWithWarning`, `Fail` and the `*FlashFailure` variants; treat any name containing `Fail` as a flag and report `PassWithWarning` to the reviewer.

## Troubleshooting
- `str(result.overall_result)` is a number; use `.name`.
- `analyse_video` prints timings to stdout; redirect it if you emit JSON. It writes `Results/*_FrameData.csv` in the current directory.
- Its elapsed-time output varies run to run; keep it out of expected files.

## Official docs
- [iris-pse-detection](https://github.com/tokoroten/iris-pse-detection), [PyPI](https://pypi.org/project/iris-pse-detection/)
- [Upstream EA IRIS](https://github.com/electronicarts/IRIS)
