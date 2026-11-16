---
name: rive-web
description: Use the MIT-licensed Rive Canvas runtime to play `.riv` assets and drive state-machine inputs in a browser. This guide covers one official nested-input sample; it does not cover Rive authoring or deterministic frame seeking.
---

# Rive Web

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use the Canvas runtime when an existing, licensed `.riv` asset needs playback or state-machine input in a browser.
- The fixture proves two nested booleans change the sample's center and ring colors. Playback is clock-driven; it does not prove frame-exact seeking or repeatable animation frames. It also does not validate authoring or other runtimes. Use Lottie Web for Lottie files or a code-first animation library for authored motion.
- The runtime is MIT licensed. Rive's editor is a separate product and is outside this free-software guide; use only assets whose terms permit the intended use.

## Capability map

The [Web JavaScript runtime guide](https://rive.app/docs/runtimes/web/web-js) documents the high-level canvas/WebGL APIs and lower-level WASM/render-loop route. **VCR exercised:** Canvas runtime loading, a named state machine, nested boolean inputs, and pixel inspection of active and neutral states. **Documented, not VCR-tested:** other renderers, event handling, layout/text/audio/scripting features, runtime wrappers, render-loop control, arbitrary assets and state machines.

| Area | Official reference | VCR evidence |
| --- | --- | --- |
| Runtime packages and initialization | [Web JS getting started](https://rive.app/docs/runtimes/web/web-js) | `@rive-app/canvas` 2.49.1 |
| Canvas vs WebGL renderer | [Choosing a renderer](https://rive.app/docs/runtimes/web/choosing-a-renderer) | Canvas only |
| State machine and inputs | [State machines](https://rive.app/docs/runtimes/web/state-machines) | Named machine and nested boolean paths |
| Events and lower-level rendering | [Runtime docs index](https://rive.app/docs) | Untested |

## Install and doctor

```sh
pnpm add @rive-app/canvas@2.49.1
pnpm list @rive-app/canvas --depth 0
vcr setup capture --yes
vcr doctor
```

Install the runtime in the selected project. The fixture uses pinned Canvas, Vite and Playwright packages plus a local Chrome executable. `CHROME_BIN` selects Chrome when the default macOS path is unavailable. `vcr doctor` checks supported machine tools, not runtime behavior or asset rights.

## Smoke test

```sh
vcr example create rive-web-state-machine
cd examples/rive-web-state-machine
./run.sh
# expect: JSON report with bothInputsTrueChangesInnerCircle, bothInputsTrueChangesOuterRing, and bothInputsFalseRestoresNeutralInnerCircle all true
```

Evidence: `@rive-app/canvas` 2.49.1, Playwright 1.64.1, Vite 8.3.8 and Chrome 157.0.8103.51 on macOS arm64. Pixel samples show the active state and restored neutral state. Whole-frame hashes are deliberately not used as a determinism claim.

## Scene contract

The fixture does not expose `window.__scene = { duration, seek }`. It changes nested inputs and samples the clock-driven runtime after a wait; do not use it as a `vcr capture` scene or infer a seek API.

## Troubleshooting
- The sample never becomes ready: check the local Vite server, asset URL and browser console for runtime load errors.
- Pixel colors differ: confirm the pinned asset/runtime and inspect the state machine and input paths; do not replace broad color relationships with an unsupported frame-hash assertion.
- Chrome does not launch: set `CHROME_BIN` to an installed executable.

## Official docs

[Rive Web runtime](https://rive.app/docs/runtimes/web/web-js) · [Choosing a renderer](https://rive.app/docs/runtimes/web/choosing-a-renderer) · [State machines](https://rive.app/docs/runtimes/web/state-machines)
