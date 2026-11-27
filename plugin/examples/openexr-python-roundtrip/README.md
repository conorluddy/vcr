# OpenEXR Python float round trip and channel layout

## Intent and scope

- Tool/version: OpenEXR 3.5.5 Python wheel (PyPI, uploaded 2026-11-23), BSD-3-Clause, with numpy 2.5.5. Pinned in `requirements.txt`.
- Claim: from Python, OpenEXR writes multi-channel float32 and half EXR files and reads them back bit-exact (lossless compressions), with the compression, channel names and data window intact.
- Exclusions: the `exr*` command-line tools (the wheel has none; `exrcheck` is not installed here), tiled, deep and multipart files, lossy DWAA/B44, other readers (oiiotool, Blender), large images.
- Docs and licence: https://openexr.com, https://github.com/AcademySoftwareFoundation/openexr; BSD-3-Clause per the wheel metadata, checked 2026-11-27.
- Environment: macOS 26 arm64, Python 3.12.2. venv in `output/venv` (git-ignored), created by `run.sh` from `requirements.txt` when missing. No machine-wide install.
- Input: seeded random 32x24 data in `check.py`, values -2 to 38 (outside 0..1 on purpose), a Z-like depth channel and alpha.
- Cleanup: remove `output/`.

## Plan, before running

- Commands: `./run.sh --record`, then `./run.sh`. `check.py` runs twice in separate processes and the JSON must be identical.
- Checks (all gating): RGBA float32 round trip is bit-exact for ZIP, PIZ and NO compression; alpha and `depth.Z` are bit-exact; header compression equals the one written; max value stays above 1; ZIP file smaller than uncompressed; channels read back are `RGBA` and `depth.Z`; data window is 0,0 to 31,23; half RGBA equals a float16 cast; `isOpenExrFile` is true for an EXR and false for a text file; opening the text file raises.
- Stop conditions: version differs, or the two processes differ.
- Failure interpretation: any failed check is `fail`; nothing is claimed about other readers.

## Observation

Executed 2026-11-27 on `Conors-MacBook-Pro-2.local`. All 17 checks pass and both processes agree. API findings, fixed in `check.py` before the recorded run (not loosened checks): `File.channels()` groups R, G, B, A into one `RGBA` array, and raises if they differ in pixel type (a half RGB with float alpha); `File.header()` must be copied before the file closes. Random data barely compresses (ZIP 15776 bytes vs 16128 uncompressed), so the size check only shows ZIP is smaller, not how much compression helps real renders. This proves a lossless float round trip through the library itself, not that another reader agrees.
