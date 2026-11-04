# Three capture

Status: validated on macOS arm64, Three.js via pnpm (range ^0.186.1; the version that ran was not recorded), Chromium 156, 2026-10-26. Alpha is configured in the scene, not measured in `expected/`.

A Three.js scene with no render loop. `seek(t)` sets rotation and position from `t` and schedules one `renderer.render` on the animation frame the harness drives. The module import needs HTTP, so the harness serves the example directory on loopback.

```text
./run.sh            # expect: three-capture: OK (~12 fps)
./run.sh --record
```
