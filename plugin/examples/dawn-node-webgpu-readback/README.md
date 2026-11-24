# Dawn (webgpu) in Node: full-screen-triangle shader readback

Status: validated on macOS arm64 (Metal), 2026-11-24 (webgpu 0.6.2, Node v22.19.0), for the scope below. The intent and plan were written before the recorded run; the observation is added after it.

## Intent and scope

- Tool: Dawn Node WebGPU binding, npm `webgpu` pinned to 0.6.2 (the version on the catalogue card and the npm `latest` on 2026-11-24). Record: `catalog/tools/dawn-node-webgpu.json`.
- Claim: in Node on macOS arm64 (Metal), the `webgpu` package acquires an adapter and device, renders a fixed full-screen-triangle WGSL shader into an offscreen `rgba8unorm` texture, and buffer readback gives the predeclared pixel values at known positions; a rerun is byte-identical.
- Exclusions: browsers and any DOM, canvas or presentation (the binding has none, per its README); other operating systems, architectures and backends (Vulkan, D3D, OpenGL); hardware-performance claims; compute shaders and multi-pass rendering; depth and multisampling; any other tool or route; cross-machine determinism (the check is same-host reruns).
- Documentation and licence: https://github.com/dawn-gpu/node-webgpu (README read on 2026-11-24, which says the package is for offscreen render-to-texture and readback in Node), https://www.npmjs.com/package/webgpu. Licence MIT (package `license` field, checked 2026-11-24). The package's dependencies are `debug` and `@webgpu/types`; the `dawn.node` binary ships inside the npm tarball (`dist/darwin-universal/dawn.node`). No model, asset or media is used.
- Environment: macOS 26 arm64 (Apple M3 Pro), Node v22.19.0, Metal adapter as reported by the package. Not a hardware-performance claim.
- Input: none. The shader and pixel reference are constants in `render.ts`, written for this fixture.
- Dependencies and side effects: `webgpu@0.6.2` and `tsx` in this example's `package.json`, installed by `pnpm install` at the workspace root. The `webgpu` postinstall (quarantine-attribute removal) is not run by pnpm here; the prebuilt `dawn.node` loads without it. No network use during the run. Writes `output/` (ignored) and `expected/` on `--record`.
- Selected workspace, generated output and cleanup: `examples/dawn-node-webgpu-readback/output/` (ignored, safe to delete).

## Plan, before running

- Commands: `pnpm install` at the workspace root, then `examples/dawn-node-webgpu-readback/run.sh --record`, then `examples/dawn-node-webgpu-readback/run.sh`.
- Note on history: before this plan was written, one exploratory `pnpm -s render` run was made only to confirm the package loads and to read the adapter info. Its output was discarded and nothing from it is used as expected output or as a check threshold. The checks below were fixed before the recorded run.
- Route: `create([])` (default backend, no options), `requestAdapter()`, `requestDevice()`. One shader module with a vertex stage that emits the triangle (-1,-1), (3,-1), (-1,3) by `vertex_index`, and a fragment stage that outputs `(uv.x, uv.y, time, 1)` with `uv = fragment position / (width, height)`. A uniform buffer carries `time`, `width`, `height`.
- Frames: 64x64 `rgba8unorm` texture with RENDER_ATTACHMENT and COPY_SRC. Three frames at times 0, 0.25 and 1, rendered in sequential order (0, 1, 2) then shuffled order (2, 0, 1) on the same device. Readback via `copyTextureToBuffer` (bytesPerRow 256) and `mapAsync(READ)`.
- Analytic reference (no GPU): pixel (x, y) expects R = round((x + 0.5) / 64 * 255), G = round((y + 0.5) / 64 * 255), B = round(time * 255), A = 255.
- Predeclared checks (all in `run.sh` or `render.ts`):
  1. Dimensions are 64 x 64.
  2. Frame count is 3.
  3. At least two distinct SHA-256 hashes among the three frames.
  4. Every pixel of every frame is within 1 LSB per channel of the analytic reference (`maxChannelDeviation <= 1`); a larger deviation throws and exits non-zero. The tolerance is not widened.
  5. The middle frame (time 0.25) has no pixel with alpha other than 255 (`transparentPixelCount == 0`); a gap in triangle coverage would show here.
  6. Shuffled-order hashes equal the sequential hashes for the same times.
  7. The adapter architecture string is non-empty.
  8. Two runs produce byte-identical `output/render.json` (`cmp`).
  9. `output/render.json` equals `expected/render.json`, which holds the adapter info, the Node and webgpu versions, per-frame hashes, probe pixels, and the maximum deviation.
- Probe pixels recorded per frame: top-left (0,0), top-right (63,0), centre (32,32), bottom-left (0,63), bottom-right (63,63), mid-left (5,40), each with its actual and expected RGBA.
- Expected failure modes and stop conditions: `requestAdapter()` returns null (blocked, not a pass); the binary fails to load (for example a quarantine attribute, which would need the package's own postinstall step, to be reported, not silently worked around); a deviation above 1 LSB (fail or partial; the tolerance is not changed).
- Inspection: a contact sheet of the three sequential frames from `output/frames/*.rgba`, converted to PNG with ImageMagick (`magick -size 64x64 -depth 8 rgba:frame.rgba frame.png`), then viewed. A correct render shows a smooth red-green gradient across the frame, with blue stepping between the frames. A blank, clipped or uniform frame is a fail.
- Reproduction: `./run.sh` in this directory, or `pnpm -s render` for one run.

## Observation, after running

- Date and executor: 2026-11-24, Conors-MacBook-Pro-2.local, macOS 26.6 (25G5043d) arm64, Apple M3 Pro, 18 GB.
- Versions: webgpu 0.6.2 (its `package.json`, read by `render.ts`), Node v22.19.0, tsx 4.23.15. Dawn is the prebuilt `dawn.node` shipped in the npm tarball; its exact Dawn revision is not exposed by the package. Playwright and Chromium are not used by this example.
- Adapter as reported by `adapter.info`: vendor `apple`, architecture `metal-3`, device `apple-m3-pro`, description "Metal driver on macOS Version 26.6 (Build 25G5043d)". The default `create([])` selected Metal; no backend option was passed.
- Commands: `./run.sh --record` (two renders, then the recorded expected file), then `./run.sh` (two renders, `cmp`, then the check). The check printed `dawn-node-webgpu-readback: OK (webgpu 0.6.2, node v22.19.0, adapter apple metal-3, max channel deviation 0)`.
- Measured: all three frames (times 0, 0.25, 1) matched the analytic reference exactly on every pixel, so max channel deviation 0 against the tolerance of 1. Zero pixels had alpha other than 255 in any frame. Frame hashes (SHA-256 of the 16384-byte readback): t=0 `3fade605cdc8dec0b6e85c99c0a14b1461007009e7ed60faac841e190b0a49c6`; t=0.25 `eef40eaf74bc6a31554aa12c176056564ce4b7589f2a65afcbbe35f88d06e2b3`; t=1 `22380758caa5ebf9a7c577680a47c5d82adc3014de913dcd640182e2289ff397`. Three distinct hashes. Shuffled order (2, 0, 1) matched the sequential hashes. Probe pixels in `expected/render.json`, e.g. (0,0) = (2,2,0,255) at t=0.
- All predeclared checks passed on the first recorded run; no check was changed after seeing results. The tolerance was not widened.
- Inspection: `output/contact.png` (768x256, the three sequential frames side by side, scaled 400% with point filter; built from `output/frames/*.rgba` via `magick -size 64x64 -depth 8 rgba:... frame.png`). It shows a smooth gradient in each frame: red increasing left to right, green increasing top to bottom, and blue stepping up across the three frames (dark, purple-tinted, then full blue). The triangle covers the whole frame with no clipping, blank area or seam. The frame is a correct render of the shader; no defects found.
- Pass / partial / fail / blocked: pass, for the scope below.
- Deviations and limitations: the same binary and host were used for both runs, so the byte-identical result is a same-host, same-process-type rerun check, not a cross-machine determinism claim. The `webgpu` postinstall (removing a quarantine attribute) was not run; the prebuilt binary loaded without it. `pnpm install` reported `webgpu`'s build script as ignored; nothing was built from source. The catalogue card lists `https://github.com/dawnjs/node-webgpu` as the official URL, but the npm package's README and repository point to `https://github.com/dawn-gpu/node-webgpu`; the README here cites the latter. Not corrected in the card (out of scope for this record).
- What this establishes: on this Mac, `webgpu` 0.6.2 under Node 22 acquires a Metal adapter and device, compiles a WGSL vertex and fragment shader, renders a full-screen triangle into an rgba8unorm texture, reads it back through `mapAsync`, and the pixel values match the analytic reference exactly for three frames; the shuffled order matches the sequential order; reruns are byte-identical.
- What it does not establish: other macOS versions or Apple silicon models; Intel Macs; Linux or Windows; the Vulkan, D3D or OpenGL backends; compute pipelines; multi-pass rendering; depth or multisampling; performance; cross-machine byte equality; use with a WebGPU library's own renderer; any browser behaviour.
- Reviewer and follow-up: none recorded. Revisit on a `webgpu` upgrade past 0.6.2, a macOS or driver update, or if an Intel or Linux host is used.
