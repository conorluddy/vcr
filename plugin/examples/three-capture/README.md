# Three capture

Status: validated on macOS arm64, Three.js via pnpm, Chromium 156, 2026-10-26.

A Three.js scene with no render loop. `seek(t)` sets rotation and position from `t` and schedules one `renderer.render` on the animation frame the harness drives. The module import needs HTTP, so the harness serves the example directory on loopback.

```text
./run.sh            # expect: three-capture: OK (~12 fps)
./run.sh --record
```
