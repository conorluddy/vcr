# glTF Transform centering fixture

## Intent and scope

- Tool ID and version/build: `gltf-transform` CLI 4.5.1.
- VCR job and exact claim being tested: center a single static triangle scene at the origin in a GLB.
- Explicit exclusions: other asset shapes, transforms, hierarchy, animation, skinning, morph targets, extensions, textures, compression, renderer quality and other CLI commands.
- Tool documentation and licence sources, checked 2026-11-15: [glTF Transform CLI docs](https://gltf-transform.dev/cli), [center transform docs](https://gltf-transform.dev/modules/functions/functions/center); package card records MIT.
- Environment: macOS 26.6 arm64, Node.js 22.19.0, glTF Transform 4.5.1.
- Input: generated locally by `make-input.py`, one triangle with vertices (2,1,0), (4,1,0), (2,3,0); no external assets.
- Dependencies, installation plan, permissions, network and expected side effects: CLI is installed in pnpm's global package root. No extra binary, model, network access or installation is required. The fixture writes generated GLBs and metrics only under ignored `output/`.
- Selected workspace, generated output and cleanup paths: this example directory; generated files are under `output/`.

## Plan, before running

- Exact commands: `gltf-transform center output/input.glb output/centered.glb`; repeat with a second output, compare bytes, and run `gltf-transform validate output/centered.glb`.
- Expected artifacts and predeclared checks: valid GLB container and glTF validation; exactly one mesh and three position vertices; world-space bounds change from `[2,1,0]..[4,3,0]` to `[-1,-1,0]..[1,1,0]`; two centered outputs are byte-identical; record CLI version and output SHA-256.
- Intended consumer and handoff settings: a static glTF 2.0 GLB with one scene and no extensions or external buffers. The claim is numeric centering and valid GLB serialization only.
- Delivery constraints: one small owned GLB; no media retained in `expected/`.
- Expected failure modes and stop conditions: wrong CLI version, invalid glTF/GLB, wrong vertex count or bounds, non-deterministic repeated output, or unexpected extensions stops the fixture.
- Reproduction instructions: `./run.sh --record` records expected metrics after the first run; `./run.sh` checks them.

## Observation, after running

- Date and executor: 2026-11-15, validation lane agent. Environment: macOS 26.6 arm64, Node.js 22.19.0, glTF Transform CLI 4.5.1.
- Commands: `PATH=/Users/conor/Library/pnpm:$PATH ./examples/gltf-transform-center/run.sh --record`, followed by `PATH=/Users/conor/Library/pnpm:$PATH ./examples/gltf-transform-center/run.sh`. Both exited successfully; the second run matched recorded expectations.
- `center` produced a GLB with one scene, one node, one mesh and three vertices; world-space bounds are exactly `[-1,-1,0]..[1,1,0]`. `gltf-transform validate` reported no errors, warnings, infos or hints. Two independently generated centered GLBs compared byte-for-byte equal. Output is 564 bytes, SHA-256 `d985cb033fdab722adb62479eda32b4262e8156b3e47ec32795c6add1f471984`.
- Pass for the stated numeric centering and GLB serialization claim. Blender 4.4.0 consumer inspection was attempted but crashed before producing an image; visual quality is not assessed and no Blender compatibility claim is made.
- This result does not establish behavior for other assets, animation, skinning, morph targets, extensions, textures, compression, renderer quality or other CLI commands. Evidence: `expected/metrics.json`, `expected/validation.txt`.
