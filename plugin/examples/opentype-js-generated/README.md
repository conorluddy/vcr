# OpenType.js generated-font fixture

## Intent and scope

- **Tool and version:** OpenType.js 2.0.0, pinned in `package.json` and `package-lock.json`.
- **Claim:** OpenType.js parses a generated TrueType font and returns the expected family name, units per em, glyph index, advance width, and outline path commands.
- **Input:** `build_font.py` creates an original one-glyph font with FontTools 4.68.0; no third-party font file is used.
- **Environment:** macOS 26.6 arm64, Node 25.6.1, Python 3.12.13 managed by uv.
- **Exclusions:** no shaping, variable fonts, WOFF, kerning, or complex scripts.

## Observation

- **Date:** 2026-11-16.
- **Result:** parsing `A` returned glyph index 1, advance width 1000, and the expected four line commands. Parsed results matched across repeated runs; see `expected/metrics.json`.
- **Reproduction:** `./run.sh` builds the owned font with locked FontTools, parses it with OpenType.js, and compares the exact parsed metrics/path.
