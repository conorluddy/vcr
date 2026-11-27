# imscJS IMSC document seeked per frame

## Intent and scope

- Tool/version: `imsc` 2.0.0 (imscJS, BSD-2-Clause), UMD build `dist/imsc.all.min.js`, in Playwright Chromium via `packages/capture`.
- Claim: `generateISD(tt, t)` plus `renderHTML` draw an IMSC1 text-profile document at any frame time with no playback clock; the transparent capture shows caption pixels exactly when the document is active, and shuffled frame order equals sequential.
- Exclusions: roll-up (`enableRollUp`, `previousISDState`), forced display, image subtitles (`smpte:background`), embedded fonts, IMSC conformance of other documents, other browsers, Node without a DOM, and `ttconv` or `caption-checker` interplay.
- Official documentation: https://github.com/sandflow/imscJS (README, API); checked 2026-11-27.
- Environment: macOS 26.6 arm64; Chromium from the workspace Playwright; ImageMagick and jq for the checks.
- Input: inline TTML in `scene.html` (two regions, italic style, a line break, overlap 3 to 4 s, gaps 2 to 2.5 s and 5 to 6 s); no external assets.
- Output: ignored `output/` (frames, `report.json`, `summary.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: 60 frames at 640x360; `getMediaTimeEvents()` is `[0, 2, 2.5, 3, 4, 5]`; 5 distinct frame hashes (the two empty gaps are identical); alpha maximum is 1 at frames 5, 27 and 35 and 0 at frames 22 and 55; shuffled hashes equal sequential.
- Inspect frames 5, 22, 27, 35, 45, 55. Stop if text is missing, in the wrong region, or if any check differs between runs.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. All checks passed. The contact sheet showed "Hello from IMSC" in the bottom region at frame 5, nothing at 22, the italic yellow top caption at 27, top plus a two-line bottom caption at 35, bottom only at 45, nothing at 55. This proves one document on one machine with the system sans-serif fallback; pixels depend on Chromium's font fallback and are not portable across machines.
