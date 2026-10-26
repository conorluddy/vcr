# Blender background smoke test

Status: validated on macOS arm64 with Blender 4.4.0 from the app bundle, Workbench engine, 2026-10-26.

`render.py` builds a cube, a sun and a camera from factory settings and renders frame 1 to a 320x240 RGBA PNG with a transparent film. `run.sh` checks dimensions and channels against `expected/`.

```text
./run.sh                       # expect: blender-smoke: OK (Blender 4.4.0)
BLENDER=/other/path ./run.sh   # another install
```

## Limitations recorded
- Blender is not on PATH on macOS; the script uses `/Applications/Blender.app/Contents/MacOS/Blender`.
- Workbench renders are byte-stable on one machine. Cycles output depends on the GPU backend and is a visually-equivalent fixture, not a byte-exact one.
- Factory settings include Blender's default OpenColorIO config; colour management for compositing is deferred to the compositor spike.
