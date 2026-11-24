---
name: glslviewer
description: Use glslViewer to export a PNG sequence from a hand-written u_time/u_resolution fragment shader with the native CLI, headless. Load when a shader sketch should render without a browser; evidence covers glslViewer 3.5.2 on macOS arm64 only.
---

# glslViewer

## Use cases and limits

glslViewer renders a fragment shader natively and writes PNGs. The VCR fixture exports 8 frames of one hand-written shader (`u_time`, `u_resolution`) headlessly with `sequence`. Browser shader capture is VCR's main route: use [webgl](../webgl/SKILL.md), [gl-transitions](../gl-transitions/SKILL.md) or Three.js when the shader belongs in a seekable browser scene, needs random-access frames, or must run on other machines. Pick glslViewer when a native, browser-free export of a standalone shader sketch is enough and a contiguous time range is what you want.

Tested: headless sequence export, frame `i` at `t = i/fps`, output size, pixel values, reruns, sub-range. Untested: `screenshot`, the `time` command, windowed mode, textures or other uniform inputs, 3D models, other platforms, other GPUs or drivers.

## Capability map

Discovery only. Top-level areas from the [README](https://github.com/patriciogonzalezvivo/glslViewer) and wiki; not VCR-validated unless marked.

| Area | Reference | VCR evidence |
| --- | --- | --- |
| Headless run (`--headless`, `-w`, `-h`, `--noncurses`) | README, `glslViewer --help` | Exercised. |
| Startup commands (`-e "cmd"`), including `sequence,<from>,<to>[,<fps>]` | README, wiki | `sequence` exercised. |
| `screenshot,<file>` and `time,<t>` commands | wiki | Not used as evidence; `time` did not pin `u_time` in probes. |
| Built-in uniforms (`u_time`, `u_resolution`) | README | Both exercised. Other uniforms untested. |
| Textures, 3D models, buffers, OSC, windowed UI | README, wiki | Untested. |

## Install and doctor

```sh
brew install glslviewer     # formula glslviewer 3.5.2_1, binary glslViewer
glslViewer --version
```

`vcr doctor` reports whether it is installed; do not assume it is. The fixture also needs ImageMagick (`magick`) and `jq`.

## Smoke test

```sh
examples/glslviewer-headless-frames/run.sh
# expect: glslviewer-headless-frames: OK (8 frames, 128x96, 16 probes)
```

Locate it with `vcr tools examples glslviewer`. The run also prints the renderer line (`Apple M3 Pro` here).

## Headless sequence recipe

```sh
cd out/ && glslViewer shader.frag --headless --noncurses --verbose -w 64 -h 48 \
  -e "sequence,0,1,8" </dev/null >glslviewer.log 2>&1 &
```

- Writes `00000.png`... into the working directory; frame `i` is at `t = i/fps` (here 8 frames, 0 to 1 s). Exports a contiguous range only; random access was not tested.
- glslViewer keeps running after its `-e` commands. Poll for the expected frame count, then stop it by PID. Do not kill by name pattern (it matched the shell).
- Size is 2x `-w`/`-h` on a Retina display: 128x96 for `-w 64 -h 48`. A non-Retina host would differ; predeclare the size you check.
- Measured: 16 pixel probes equalled the analytic shader values (tolerance 2 per channel); 8 distinct frames; a second launch gave identical pixel hashes; `sequence,0.5,1,8` matched frames 4 to 7 of the full run; alpha is 255 everywhere on this shader. Equality is on this host and GPU only.

## Troubleshooting

- Exit 139 (segfault) with no frames: in exploratory headless launches 6 of 9 crashed, while all 21 fixture launches did not; cause unknown. Wrap each run in a retry and verify the expected frames exist before using them.
- Wrong `u_time` after `time,<t>` plus `screenshot`: it did not pin the clock (blue 190, 162, 157 against 254 expected). Use `sequence` instead.
- Process never exits: expected; stop it by PID once frames exist.
- Frames not 64x48: Retina doubling, see above.

## Official docs

- [glslViewer repository and README](https://github.com/patriciogonzalezvivo/glslViewer) (3.5.2)
- [Releases](https://github.com/patriciogonzalezvivo/glslViewer/releases)
