# Spike: browser frame capture

Date: 2026-10-26 · Machine: Conors-MacBook-Pro-2 (macOS 25.6 arm64) · Playwright Chromium 156.0.8078.4 · GSAP 3 · Source: `examples/browser-capture`

## Question

Can a headless browser evaluate a paused GSAP timeline at any frame and capture it with alpha, deterministically and fast enough to be the browser adapter for the in-house engine (ADR 0001)?

## Decision

**Go.** Frame-by-frame capture is deterministic and fast once the harness drives Chromium's frame production explicitly. This opens the Layer 2 child plan.

## Numbers

| Run | Result |
| --- | --- |
| 1080p, 90 frames, sequential | 60 frames per second, 9.5 MB JS heap |
| 1080p, 90 frames, random order | identical hashes to sequential, 0 mismatches, 3 of 3 runs |
| 1080p, sequential twice | 0 of 90 frames differ |
| 4K, 30 frames, sequential | 20 frames per second |
| Alpha at frame 45 | min 0, max 1, mean 0.16; ProRes 4444 `yuva444p12le` preserves it |

Throughput is capture plus PNG encode in the browser; writing to disk and FFmpeg assembly are extra.

## What failed before it worked

| Symptom | Cause | Fix |
| --- | --- | --- |
| Hang on first frame, no error | `evaluate` returned `timeline.seek()`'s result, the timeline itself; Playwright tried to serialise a cyclic graph | Block body in `evaluate`, return nothing |
| 80 of 90 frames differ between orders | GSAP `force3D: "auto"` switches between `matrix3d` and 2D transforms depending on tween activity, changing edge anti-aliasing | `gsap.defaults({ force3D: false })` reduced it to 12 |
| 12 frames differ, mostly near-static edges; 3 frames differ even between two sequential runs | Capture race: `omitBackground` toggles the background override around every screenshot, and the screenshot sometimes lands before the new style is painted. Composited layers (`will-change`, `force3D: true`) made it worse (74 frames) because they update asynchronously | Permanent `Emulation.setDefaultBackgroundColorOverride` to transparent, and `HeadlessExperimental.beginFrame` with `--deterministic-mode` so each capture is the requested frame |

After the capture fix, plain `page.screenshot` also matched in every run, and the GSAP settings were no longer required for a match. They stay as recommendations because they remove path switching that the race was exposing.

Chromium flags `--disable-gpu`, `--disable-gpu-compositing` and a forced full repaint before each capture changed nothing and are not used.

## Contract for the browser adapter

1. Scenes expose one paused timeline and a pure `seek(time)`; nothing reads a wall clock.
2. The adapter owns frame production: `beginFrame` per request, transparent default background, viewport set once per run.
3. `evaluate` calls never return framework objects.
4. Determinism evidence is a shuffled-order run compared with a sequential run, kept as a test fixture.

## Limitations

- `HeadlessExperimental` is available in Playwright's headless shell; it is not available when running headed or in the full Chrome channel.
- 4K is three times slower than 1080p; large productions will want a frame cache keyed on scene source, parameters and Chromium version.
- Fonts resolve from the system in this spike; the Layer 1 workspace must ship fonts with the project for portable renders.
