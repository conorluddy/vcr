# Rive Web state machine fixture

## Intent and scope

- **Tool/version:** `@rive-app/canvas` 2.49.1, Vite 8.3.8, Playwright 1.64.1.
- **Claim:** load a Rive file in the Canvas runtime, run `MainStateMachine`, set two nested boolean inputs by path and observe the resulting inner-circle and outer-ring colors.
- **Exclusions:** authoring `.riv` files, arbitrary state machines, frame-exact seeking, deterministic animation capture, other Rive renderers, browsers and platforms.
- **Documentation and asset licence:** [Rive Web runtime docs](https://rive.app/docs/runtimes/web/web-js), [official Rive runtime repository](https://github.com/rive-app/rive-wasm), and the repository's MIT licence in `ASSET-LICENSE.txt`. The 829-byte sample asset comes from `js/examples/_frameworks/nested_inputs/assets/runtime_nested_inputs.riv` in that MIT-licensed repository. Checked 2026-11-16.
- **Environment:** macOS 26.6 arm64, Node 25.6.1, Chrome 157.0.8103.51. `CHROME_BIN` can select another Chrome executable.
- **Dependencies:** pinned npm packages and committed lockfile. `npm audit` reported no vulnerabilities after the Vite pin was updated to 8.3.8.
- **Side effects:** starts a local Vite server, launches headless Chrome and writes state screenshots under ignored root `output/rive-web-state-machine/`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`; each command performs a clean npm install, serves the sample locally and drives it in Chrome.
- **Checks:** Rive loads without a runtime error; setting `CircleOuterState` and `CircleInnerState` true produces a pink center and green ring at known pixels; setting both false restores the neutral center. `expected/state-machine.json` records the observed samples and claim.
- **Stop conditions:** missing Chrome, browser/runtime failure, canvas readback failure, or state colors outside the expected channel relationships.
- **Inspection:** visually inspect the active and neutral screenshots written to ignored output. Pixel checks support state response only; the animation remains clock-driven.

## Observation, after running

- **Result:** pass. The fixture loaded the licensed nested-input asset and the Canvas runtime accepted both path-scoped boolean inputs. Clean-install runs passed after the fixture was corrected to assert stable state colors instead of frame hashes.
- **Measurements:** at 256×256, initial and false-state center/ring samples were `[116,116,116]`; with both inputs true, center was `[253,27,108]` and ring `[31,253,46]`. The stateful animation changes over time, so full-frame hashes are not a repeatability guarantee.
- **Runtime:** Rive Canvas 2.49.1, Vite 8.3.8, Playwright 1.64.1, Chrome 157.0.8103.51, macOS 26.6 arm64 (Darwin 25.6.0), host `Conors-MacBook-Pro-2.local`.
- **Visual inspection:** inspected the neutral and active screenshots at 256×256; the active state has a bright green outer ring and pink inner circle on dark gray, while the neutral state has a gray circle.
- **Limits:** this validates one official sample asset and one nested-input state machine on one Mac and browser. It does not validate authoring, time seeking, deterministic frames, other runtimes or arbitrary `.riv` files.
