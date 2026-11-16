# OpenColorIO MatrixTransform CPU fixture

## Intent and scope

- Tool ID and version/build: OpenColorIO 2.6.0 Python bindings (`opencolorio==2.6.0`, module `PyOpenColorIO`).
- VCR job and exact claim being tested: apply a constructed OpenColorIO `MatrixTransform` through an OpenColorIO `Config` and CPU processor to four known float RGB pixels; assert the expected matrix-plus-offset results and repeatability.
- Explicit exclusions: ACES or production configs, file I/O, image formats, display transforms, GPU processor, cross-application matching, creative judgments, and arbitrary color-space correctness.
- Tool documentation and licence sources, checked 2026-11-16: official [OpenColorIO v2.6.0 MatrixTransform API](https://opencolorio.readthedocs.io/en/v2.6.0/api/transforms.html), [CPU processor API](https://opencolorio.readthedocs.io/en/v2.6.0/api/processors.html), and [PyPI package](https://pypi.org/project/opencolorio/2.6.0/) (BSD-3-Clause).
- Environment: macOS 26.6 arm64, `Conors-MacBook-Pro-2.local`, CPython 3.14.8, pip 26.2.1.
- Input: four hand-authored RGB float triplets in `run.py`; no files, external assets, or external config.
- Dependencies, installation plan, permissions and expected side effects: exact `opencolorio==2.6.0` in a fixture-local `.venv`, created with existing `python3.14` and pip-installed from `requirements.txt`; this release publishes a CPython 3.14 macOS arm64 wheel. No Homebrew/global/system changes planned.
- Selected workspace, generated output and cleanup paths: this repository worktree; `.venv/` is ignored fixture-local install state and no media is generated.

## Plan, before running

- Exact commands or reviewed recipe: `./run.sh --record`, then `./run.sh`. The wrapper creates `.venv` and installs the pinned wheel on first invocation. `run.py` creates `PyOpenColorIO.Config.CreateRaw()`, a `MatrixTransform` with the fixed 4×4 coefficients `[0.5,0.25,0,0, 0,1.5,0,0, 0.1,0,2,0, 0,0,0,1]` and RGB offsets `[0.05,-0.1,0.02,0]`, gets the Config processor and default CPU processor, and uses `CPUProcessor.applyRGB()` on the packed input list. It repeats with fresh OCIO objects.
- Predeclared input/output checks with tolerance 1e-6:

  | Input RGB | Expected output RGB |
  | --- | --- |
  | `[0.2, 0.4, 0.1]` | `[0.25, 0.5, 0.24]` |
  | `[0.8, 0.1, 0.2]` | `[0.475, 0.05, 0.5]` |
  | `[0.3, 0.6, 0.4]` | `[0.35, 0.8, 0.85]` |
  | `[0.1, 0.5, 0.2]` | `[0.225, 0.65, 0.43]` |

- Expected artifact and repeatability check: `expected/metrics.json` records package version, pixel outputs, maximum absolute error, packed float32 output SHA-256, and exact equality from an independent second processor.
- Intended consumer and handoff: CPU-transformed scene-linear RGB values for a downstream renderer; this fixture does not encode or write an image.
- Delivery constraints and units: four unclamped float RGB pixels; values are unitless normalized values and no bit-depth conversion is claimed.
- Expected failure modes and stop conditions: no compatible CPython 3.14 wheel, binding import failure, invalid Config processor, output deviation above 1e-6, or repeated output mismatch. Do not substitute handwritten transform math for the OCIO processor.
- Reproduction: `./run.sh --record` records the agreed checks; `./run.sh` verifies them. The measured output is in JSON and has no visual media to inspect.

## Observation

- Date/executor and commands: 2026-11-16 on `Conors-MacBook-Pro-2.local`; `./run.sh --record`, then `./run.sh`. The wrapper created `.venv` with CPython 3.14.8 and installed only `opencolorio==2.6.0`; pip 26.2.1.
- Observed transform: four RGB outputs were `[0.25,0.5,0.239999995]`, `[0.475000024,0.050000004,0.5]`, `[0.350000024,0.800000012,0.850000024]`, `[0.224999994,0.649999976,0.430000007]`; maximum absolute error from the declared results was `2.384185793236071e-08` (tolerance `1e-6`). Independent CPU processor runs matched exactly; packed float32 SHA-256 `039177e3093b05b2952de75faa5597182f459e4027ec812975edf3bf32f3bd12`. Record and verify exited 0.
- CLI check: the isolated wheel included `ociocheck`; `ociocheck --help` worked. A trial of the card's prior `ociocheck -h` spelling reported invalid option, so the check command is corrected to `ociocheck --help`. The CLI was not used to apply the pixel transform.
- Output inspection: there is no media artifact; I reviewed `expected/metrics.json` against the four declared input/output pixels and the reported error/hash.
- Result: pass for this explicit OCIO MatrixTransform and CPU processor path. No ACES or arbitrary pipeline config is established.
- Deviations and limitations: existing macOS Python 3.9.6 was incompatible with OCIO 2.6.0's published wheels; existing Python 3.14.8 was used instead. Only this Python binding and host were exercised, with no image file or GPU processing.
- Reviewer and invalidation: pending parent review; revisit on OCIO, Python, transform, or package changes.
