---
name: playwright
description: Use when Playwright is the browser automation or frame-capture runtime for a VCR scene. Covers the documented library surface and the narrower behavior exercised by VCR capture fixtures.
---

# Playwright

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside this repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits

- Use Playwright to launch and control headless Chromium for VCR browser-scene capture. The shared capture harness opens a scene, seeks `window.__scene`, settles two animation frames, then saves PNGs with `page.screenshot`.
- Playwright also documents Firefox and WebKit, interactive browser automation, testing and API requests. Those capabilities are upstream product functions; VCR fixture evidence here is Chromium capture only.
- Prefer the shared `vcr capture` / `@vcr/capture` route for VCR output. The experimental CDP `HeadlessExperimental.beginFrame` mode is DOM-only and may hang; it is not the normal route.
- Use a native renderer such as Blender or FFmpeg for native sources. Use FFmpeg to encode captured frames into video.

## Capability map

| Documented area | Official reference | VCR fixture coverage |
| --- | --- | --- |
| Browser launch and library API | [Playwright Library](https://playwright.dev/docs/library), [Playwright API](https://playwright.dev/docs/api/class-playwright) | Chromium launched through shared capture harness. Firefox/WebKit and browser connection modes untested. |
| Pages, contexts, navigation, screenshots | [Page API](https://playwright.dev/docs/api/class-page), [BrowserContext API](https://playwright.dev/docs/api/class-browsercontext) | Scene loading, seeking and PNG screenshots exercised in `browser-capture`, `p5-capture`, and `three-capture`; other page/context APIs untested. |
| Locators and interaction | [Locators](https://playwright.dev/docs/locators), [Input](https://playwright.dev/docs/input) | Untested by the capture fixtures. |
| Network and API requests | [Network](https://playwright.dev/docs/network), [API testing](https://playwright.dev/docs/api-testing) | Untested. |
| Browser installation and configuration | [Browsers](https://playwright.dev/docs/browsers), [Configuration](https://playwright.dev/docs/test-configuration) | Chromium installation is exercised in VCR setup; multi-browser installation and Playwright Test configuration are untested. |
| Experimental frame-control CDP | [Chrome DevTools HeadlessExperimental](https://chromedevtools.github.io/devtools-protocol/tot/HeadlessExperimental/) | Historical/experimental route only; not validated as current default and known to hang in some fixture attempts. |

Fixture evidence: `browser-capture` on macOS arm64 with Playwright 1.64.1 / Chromium 156.0.8078.4 confirms 90 1080p alpha PNG frames, shuffled-order equality, and frame-45 alpha; a Linux Chromium 153 stand-in run also passed sequential/shuffled checks. `p5-capture` and `three-capture` validate the same screenshot capture route for canvas and WebGL scenes. This does not validate every Playwright API or browser engine.

## Install and doctor

VCR-managed capture setup installs the supported Chromium runtime for the machine:

```sh
pnpm vcr setup capture --yes
pnpm vcr doctor
```

For a project-local Playwright library install:

```sh
pnpm add -D playwright
npx playwright install chromium
npx playwright --version
```

The validated library version was 1.64.1 on macOS arm64. `doctor` reports machine availability; a guide does not mean Playwright is installed.

## Smoke test

Create the validated example with `vcr example create browser-capture`; change to its printed destination, install the example dependencies and capture runtime if needed, then run:

```sh
pnpm install
vcr setup capture --yes
./run.sh
# expect: browser-capture: OK (fps varies by machine)
```

The fixture asserts screenshot mode, 90 frames at 1920×1080, shuffled/sequential pixel equality, frame-45 alpha range 0–1, and a 90-frame ProRes file with an alpha-capable pixel format. It also captures a 30-frame 4K subset; hashes are produced but not checked. FPS is measured per run and is not a fixed expected value. Evidence covers macOS arm64 and a separate Linux browser-version stand-in; see the tool card for dates and exact environments.

## Scene contract

The harness expects a page to expose a duration and seek function once the scene is ready:

```js
window.__scene = {
  duration: 3,
  seek: (t) => timeline.seek(t, true),
};
```

Make rendered state a pure function of `t` and any fixed seed. The harness seeks, waits two animation frames, then captures. For the shared route, do not depend on wall-clock time, unseeded randomness, or animations that continue between requests. In scene readiness code, wait for required fonts/assets before publishing `window.__scene`.

VCR capture evidence uses `page.screenshot`; it does not imply that Playwright's other screenshot options or CDP frame-control paths have equivalent determinism.

## Troubleshooting

- A capture stalls when selecting `beginFrame`: use the default screenshot route. `HeadlessExperimental.beginFrame` is experimental and has hung on canvas/WebGL and in an audited DOM attempt.
- A page is blank or captures before it is ready: expose `window.__scene` only after scene initialization and wait for fonts/assets before readiness.
- Browser launch reports missing executables: run `pnpm vcr setup capture --yes`, then check `pnpm vcr doctor`. Playwright versions require their matching browser binaries; reinstall after a Playwright upgrade.
- Shuffled frames differ: remove wall-clock reads, active CSS/library clocks, and unseeded randomness; make `seek(t)` restore the complete visible state.

## Official docs

Validated capture stack: Playwright 1.64.1 and Chromium 156.0.8078.4 (macOS arm64). The official docs are rolling references; verify version-specific behavior when upgrading. Start with [Playwright introduction](https://playwright.dev/docs/intro), [library](https://playwright.dev/docs/library), [API reference](https://playwright.dev/docs/api/class-playwright), and [browser installation](https://playwright.dev/docs/browsers).
