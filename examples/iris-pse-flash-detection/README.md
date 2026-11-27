# IRIS flash-screening fixture

Advisory screening, not certification. IRIS output is not a WCAG 2.3.1, Harding, ITU-R BT.1702 or Ofcom conformance result and is not a safety claim; see the `accessibility` skill and `accessibility-reviewer`.

## Intent and scope

- **Tool/version:** iris-pse-detection 1.1.2 (PyPI, MIT), with numpy 2.5.5, opencv-python 5.1.0.95, scipy 1.18.1 pinned in `requirements.txt`. FFmpeg 9.0.2 generates the clips (not under test).
- **VCR job and claim:** from Python, IRIS flags a generated full-frame black/white flash above the general-flash limit (more than 3 flashes per second) and passes two safe clips.
- **Exclusions:** red flash and spatial patterns (no red or pattern clip), real footage, borderline sensitivity, agreement with C++ IRIS, Harding FPA or any certified analyser, other resolutions, `--resize`, loop seams, colour spaces beyond the generated yuv420p clips.
- **Licence:** the port is MIT (repo LICENSE and PyPI metadata, checked 2026-11-27). Upstream EA IRIS is BSD-3-Clause (GitHub API); the README acknowledges it. The port's LICENSE carries only the MIT line and does not reproduce EA's BSD notice. Both are permissive, so the free-software gate passes; redistribution should keep EA's notice.
- **Environment:** macOS arm64, Python 3.12 venv in `output/`, Homebrew FFmpeg on PATH. No GPU, no network at run time once the venv exists.
- **Input:** none external. `run.sh` makes the clips from `geq` luminance expressions: `flash-5hz` (3 frames at Y 235, 3 at Y 16: 5 cycles, 10 transitions per second), `slow-1hz` (15 and 15 frames), `static-grey` (Y 128). All 640x360, 30 fps, 4 s, 120 frames, H.264 crf 12.
- **Install and side effects:** `run.sh` builds `output/venv` with `python3.12 -m venv` and `pip install -r requirements.txt` when absent (network needed once). IRIS writes `output/Results/` CSVs. `output/` is ignored; cleanup is removing it.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. `check.py` runs in two processes and the JSON must be identical.
- **Predeclared checks:** (1) version is 1.1.2; (2) `flash-5hz` overall result contains "Fail"; (3) `slow-1hz` and `static-grey` do not; (4) repeat runs identical. Recorded in `expected/metrics.json` (result names, frame counts, luminance flash-fail frames, red failed frames; no timings).
- **Failure rule:** a failed check stays in `expected/`, `run.sh` prints KNOWN FAIL and exits 0, evidence is partial; checks are never loosened.

## Observation, after running

- 2026-11-27, Claude agent, `Conors-MacBook-Pro-2.local`, macOS arm64.
- The first recording failed check 2 through a harness bug, not the tool: `str()` of the result enum gives `"0"`, not its name. Corrected to `.name` before anything was committed; no threshold changed.
- Result: `flash-5hz` Fail with 99 of 120 frames luminance flash-fail (0 red); `slow-1hz` Pass, 0 fail frames; `static-grey` Pass. Repeat runs identical. All four checks pass.
- **Establishes:** on this machine IRIS 1.1.2 separates a clearly dangerous full-frame 5 Hz flash from a 1 Hz alternation and a static frame. **Does not establish:** sensitivity near the threshold, red or pattern detection, real content, conformance with any standard, or fitness as a safety gate. The library prints timings to stdout; `check.py` redirects them to stderr.
