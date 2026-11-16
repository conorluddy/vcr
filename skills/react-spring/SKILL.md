---
name: react-spring
description: Use React Spring for interruptible, velocity-aware spring animation in React. The VCR fixture only validates deterministic painting when values are set from closed-form time; it does not validate seeking the spring solver.
---

# React Spring

## Use cases and limits

- Reach for it when React UI motion needs spring physics and interruption. For time-seekable browser choreography, use Anime.js or the Web Animations API.
- The 10.1.2 fixture drives `animated.div` via `SpringValue.set` inside `flushSync`, with a harness-controlled frame. It proves deterministic rendering of explicit values, not spring simulation, duration, velocity or interruption behavior.
- Supported evidence is macOS arm64, React 19.3.1 and Chromium 156. This repo-only fixture does not establish capture from a standalone VCR workspace.

## Capability map

- **Animated components and hooks** — [getting started](https://www.react-spring.dev/docs/getting-started) and [animated elements](https://www.react-spring.dev/docs/concepts/animated-elements). The fixture uses `useSpring`, `animated.div` and interpolated transforms; other hooks and targets are documented but untested.
- **Spring values and controls** — [SpringValue](https://www.react-spring.dev/docs/advanced/spring-value) documents `set`, `start`, `advance`, pause and related controls. The fixture exercises `set` only; it deliberately never starts a spring.
- **Physics configuration** — [spring configs](https://www.react-spring.dev/docs/advanced/config) documents mass, tension, friction and related behavior. Solver configuration and physics are not validated by this fixture.

## Install and doctor

In a React project install the web target:

```bash
pnpm add @react-spring/web
pnpm list @react-spring/web --depth 0
```

The fixture pins `@react-spring/web` 10.1.2. `vcr doctor` checks the record's package command; it does not certify frame-seeking behavior.

## Smoke test

From `examples/react-spring-capture`, run `./run.sh`. It captures 90 frames at 1280×720, compares shuffled and sequential frame hashes, checks alpha and fails on page errors.

```text
# expect: react-spring-capture: OK (19.89 fps)
```

Throughput varies by machine. The stable checks are 90 frames, distinct images, matching shuffled/sequential hashes and frame-45 alpha range 0–1.

## Scene contract

The fixture publishes `window.__scene = { duration, seek }`. Each seek sets closed-form pose values, flushes React synchronously and hands one frame to the harness. Keep values a pure function of requested time; do not infer from the browser clock. This arrangement bypasses the spring solver.

## Troubleshooting

- If capture reports active springs after a seek, the scene has started solver-driven animation; this fixture requires all `SpringValue`s to be idle after its direct sets.
- A `.tsx` scene needs the example's esbuild bundle; this repo-only setup is not a standalone VCR capture recipe.
- The fixture's 19.89 fps is an example measurement, not a performance target.

## Official docs

- [React Spring documentation](https://www.react-spring.dev/docs)
- [SpringValue](https://www.react-spring.dev/docs/advanced/spring-value)
- [Spring configuration](https://www.react-spring.dev/docs/advanced/config)
