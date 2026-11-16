# HyperFrames local GSAP square render

## Intent and scope

- **Tool/version:** HyperFrames CLI package `hyperframes@0.9.33`, exact pin from its latest official release on 2026-11-11. Local GSAP `3.15.1` is also pinned; this fixture exercises the CLI's local render route and GSAP timeline.
- **Claim:** the native `hyperframes render` CLI captures an owned one-second, 12 fps HTML/GSAP square translation into a PNG sequence with expected dimensions and frame geometry, repeatable across two local runs.
- **Exclusions:** video encoding/containers, audio, registry blocks, sub-compositions, hosted rendering, accounts/API keys, cloud services, live capture, text/fonts, other browsers or dimensions.
- **Documentation/licence:** official [HyperFrames CLI package README](https://github.com/heygen-com/hyperframes/blob/main/packages/cli/README.md), [CLI reference](https://github.com/heygen-com/hyperframes/blob/main/docs/packages/cli.mdx), [HTML composition schema](https://github.com/heygen-com/hyperframes/blob/main/docs/reference/html-schema.mdx), [release list](https://github.com/heygen-com/hyperframes/releases), and [project licence](https://github.com/heygen-com/hyperframes/blob/main/LICENSE), checked 2026-11-16. The CLI docs describe `render --format png-sequence`, `--fps`, and local project compositions.
- **Environment:** Node 25.6.1, npm 11.9.0, macOS 26.6 arm64, FFmpeg 9.0.2, system Chrome available. Actual HyperFrames/browser versions and runtime will be recorded after execution.
- **Input/rights:** hand-authored HTML composition with a solid red square translating 120 px across a white 192×108 canvas over 1 second at linear rate. GSAP is local fixture dependency; no external assets.
- **Install/side effects:** user-authorized exact fixture-local `hyperframes@0.9.33`, `gsap@3.15.1`, and `pngjs@7.0.0`, installed with npm into ignored `node_modules/`. Reuse the local Chrome found by `hyperframes browser path` and system FFmpeg; no browser download, cloud service, API/account, or global install. Render frames, logs and caches remain under ignored `output/`. Disable CLI update/telemetry/skill network behavior with documented environment variables.

## Plan, before running

- **Commands:** `npm ci --prefix examples/hyperframes-gsap-square`; `examples/hyperframes-gsap-square/run.sh --record`; then `examples/hyperframes-gsap-square/run.sh`. Each run invokes the pinned native CLI with `HYPERFRAMES_NO_UPDATE_CHECK=1`, `HYPERFRAMES_NO_TELEMETRY=1`, `HYPERFRAMES_SKIP_SKILLS=1`, `DO_NOT_TRACK=1`, and `hyperframes render --format png-sequence --fps 12 --output <ignored output dir>`; 180-second command timeout.
- **Expected checks:** exactly 12 RGBA PNG frames at 192×108, corresponding to 1 second × 12 fps. Read every PNG with pinned `pngjs`; assert a 24×24 red square is present, its centroid increases monotonically, its last-frame shift is 100–120 px, and repeat run pixel hashes match exactly.
- **Inspection:** open first, middle and last frames. No MP4/WebM is produced; no encode behavior is claimed.
- **Stop conditions:** no local CLI/browsing runtime, render requires account/cloud or paid service, unsupported local composition/PNG sequence route after bounded attempts, CLI timeout, or failed frame/geometry/repeat checks. Keep evidence not-validated if blocked.
- **Output:** all dependencies, render data, caches and logs under ignored `node_modules/` or `output/`; only HTML, runner, expected JSON, package manifest/lock and this README are tracked.

## Observation, after running

- Result: pass. Both independent HyperFrames renders produced 12 PNG frames at 192×108 and 12 fps. The opaque red square stayed 24×24, moved strictly rightward in 10 px steps, and shifted 110 px from first to last frame. All frame pixel hashes matched between runs; `expected/result.json` retains the measured hashes and runtime details.
- Runtime: HyperFrames CLI 0.9.33, GSAP 3.15.1, pngjs 7.0.0, Node v25.6.1, Google Chrome for Testing 152.0.7977.30, FFmpeg 9.0.2, macOS 26.6 arm64. HyperFrames downloaded its pinned headless Chrome during package setup; the render itself used the local CLI. No hosted service, account, API key or cloud render was used.
- Limits: validates one local HTML/GSAP composition to PNG sequence with same-host repeatability. It does not cover video encoding, audio, registry blocks, hosted rendering or other browsers/platforms.
