---
name: raea
description: Use raea (React/TypeScript scenes rendered by a Rust/Bevy engine) built from source at one pinned commit to render a scene headlessly to H.264 MP4 or PNG stills. VCR evidence covers the bundled hello.tsx on macOS arm64; a young project, nothing else is established.
---

# raea

## Use cases and limits

- raea authors scenes in React/TypeScript and renders them on the GPU with a Rust/Bevy engine, `raea render <scene.tsx> -o out.mp4` or `--frame N -o out.png`. Choose it to try a GPU-rendered, React-authored scene route; the headless CLI path is what VCR tested.
- Neighbours: `revideo` when a code-authored 2D scene must render to MP4 from Node with a browser; `motion-canvas` when its editor and PNG-sequence export are the workflow. `ffmpeg-ffprobe` for probing and any re-encode.
- Maturity: a young project, pinned to one commit (`66eb15448f69ab29a801fe1bde75d3889d34d04e`, 2026-11-23 head of `main`). `raea --version` prints `0.1.0-checkout`, not a release number. No release binary, Homebrew or npm package was found; it is a source build. Licence FSL-1.1-ALv2 (not for a product that competes with raea); check it before shipping anything built on it.
- Motion and type are pillars, not tool properties. The bundled scene is a fade-in of two words; choose easing and timing from `references/motion-director/` (`MOTION-EASE-*`, `MOTION-TIME-*`) and type setting from `references/typography/` (`TYPO-FONT-READY`, `TYPO-RASTER-SCALE`), then check the render.
- Evidence: macOS 26 arm64 (Apple M3), one host, one scene. Headless render to 1080x1920, 30 fps, 90 frames, `yuv420p` H.264; PNG stills at frames 0, 30, 89. Not established: other scenes, audio, other resolutions, hosts or GPUs, alpha, MP4 seek, the editor or UI.

## Capability map

Discovery only; documented does not mean tested. Entry points are the [repository](https://github.com/shinyobjectz/raea) README and `docs/manual/` in the clone.

| Area | Tested | Notes |
| --- | --- | --- |
| `raea render <scene> -o file.mp4` (headless) | yes, hello.tsx only | `RAEA_OFFLINE=1`, no window needed |
| `raea render --frame N -o file.png` | yes | One process per still; shuffled order equals sequential |
| Export cache (`RAEA_EXPORT_CACHE`) | observed | See troubleshooting |
| `--alpha`, `--manifest`, `--quality` presets | no | Documented, untested |
| Audio, other resolutions, other scenes | no | Scene has no audio |
| `raea check`, `raea play`, desktop app, web export, R3F and game routes | no | Untested |
| Default-features build (hosted Content Credentials) | no | Fixture builds `--no-default-features` |
| Linux, Windows, other GPUs | no | |

## Install and doctor

Source build only, inside a disposable directory:

```bash
git clone --depth 1 https://github.com/shinyobjectz/raea src && git -C src fetch --depth 1 origin 66eb15448f69ab29a801fe1bde75d3889d34d04e && git -C src checkout 66eb15448f69ab29a801fe1bde75d3889d34d04e
brew install cmake                       # needed by opusic-sys (libopus); build fails without it
(cd src && CARGO_TARGET_DIR=/path/to/disposable/target cargo build --release -p raea-cli --no-default-features)
npm install --prefix ./bun-tool bun@1.4.2   # local, not global
for d in sdk/raea sdk/react/js sdk/react/tw; do (cd src/$d && ../../../bun-tool/node_modules/.bin/bun install --frozen-lockfile); done
(cd src/sdk/react/js && ../../../../bun-tool/node_modules/.bin/bun run build)
```

- Build took about 15 min (retry, incremental); rust 1.99.1 comes from the clone's `rust-toolchain.toml`.
- Put `CARGO_TARGET_DIR` under a disposable output directory: it reached about 19 GB with debuginfo.
- bun 1.2.18 cannot read the committed `bun.lock` v2 (`UnknownLockfileVersion`); upstream CI uses 1.4.2. Do not install bun globally for this.
- Run with `RAEA_HOME` at the clone. `raea --version` is the catalogue check; `vcr doctor` proves only that, not that rendering works. Nothing is installed unless doctor says so.

## Smoke test

```bash
cd examples/raea-render && ./run.sh --record && ./run.sh
```

```text
# expect: ./run.sh prints raea-render: OK
# expect: h264 yuv420p 1080x1920 30/1, 90 frames on both MP4s; 48 distinct frame hashes
# expect: render-b hashes equal render-a (RAEA_EXPORT_CACHE=0); shuffled stills equal sequential
```

First run clones, builds (about 15 min) and installs the SDK; later runs are quick. Hashes are ffmpeg `framemd5` on decoded RGB24 frames; the MP4 byte hash is not a claim.

## Render recipe

```bash
export RAEA_OFFLINE=1 RAEA_HOME=$PWD/src RAEA_EXPORT_CACHE=0
raea render src/docs/manual/examples/hello.tsx -o out/hello.mp4
raea render src/docs/manual/examples/hello.tsx --frame 30 -o out/frame-30.png
```

- The scene (unmodified upstream `hello.tsx`): composition `hello`, 1080x1920, 30 fps, `durationInFrames` 90, two text cards, black background. Only this scene was rendered; writing your own is untested.
- `RAEA_OFFLINE=1` makes the engine refuse network requests; set it for repeatable runs.
- Verify by decoding and measuring, not by hash alone: the fixture checks ffprobe facts, per-frame hashes and a white-pixel fraction (zero at frame 0, small and non-zero at 30 and 89). Matching hashes of a wrong picture still fail.
- Cross-machine hash equality is not claimed.

## Troubleshooting

- `cmake not installed` in `opusic-sys`: install cmake (Homebrew 4.5.1 worked), rerun; cargo resumes.
- `UnknownLockfileVersion` from bun: use bun 1.4.2.
- `ReferenceError: Can't find variable: bevy_react`: seen early, cleared after building the SDK (`bun run build` in `sdk/react/js`) and rebuilding raea-cli. The exact trigger was not isolated; a symlink of `node_modules` did not help.
- A "rerender" that finishes instantly: the log says it came "from the export cache" (`~/Library/Caches/raea/exports`). Set `RAEA_EXPORT_CACHE=0` to test determinism.
- Do not run `pnpm` inside the clone; the VCR root `pnpm-workspace.yaml` interferes.

## Official docs

- [raea repository](https://github.com/shinyobjectz/raea) at the pinned commit: README "Build from source", `docs/manual/concepts/rendering.md`, `docs/manual/start/install.md`, `docs/settings.md`.
