# p5 capture

Status: validated on macOS arm64, p5 2.3.4, Chromium 156, 2026-10-26.

A p5.js sketch with its loop stopped. `seek(t)` schedules one `redraw` on the animation frame the harness drives, and `draw` resets `noiseSeed` and `randomSeed` before drawing from `t`, so any frame is identical whether reached in order or by jumping.

```text
./run.sh            # expect: p5-capture: OK (~12 fps)
./run.sh --record
```
