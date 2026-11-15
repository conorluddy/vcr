---
name: motion-js
description: Use Motion's React or JavaScript APIs for DOM animation in a browser scene. Load for imperative controls, motion values or component animation; the VCR recipe here covers stopped DOM controls seeked by explicit time.
---

# Motion for React and JavaScript

Motion is a JavaScript and React animation library (`motion`, imported as `motion/react` for React). Its documented surface includes React components, imperative `animate()` controls, motion values, keyframes and springs, layout transitions, scroll-linked animation, gestures, presence, and SVG animation. Use the API map below to find documentation; it describes upstream capabilities, not validated VCR support.

`vcr` means `pnpm vcr` in this repository and `node <plugin-root>/cli/vcr.mjs` in an installed plugin (the plugin root is two directories above this skill).

## Use cases and limits
- Use Motion for React DOM/SVG components, imperative animation controls and motion values.
- The VCR example uses stopped imperative controls for three DOM elements. For native SVG animation or low-level tweening, see GSAP or the Web Animations API guides.
- Motion remains the renderer's native API; VCR supplies capture, not a Motion adapter or shared timeline.

## Validated VCR route

Validated on macOS arm64 with Motion 14.12.0, React 19.3.1 and Playwright 1.64.1 (`examples/motion-capture`, 2026-11-12). The fixture renders three DOM `motion.div` elements whose styles use motion values. It seeks stopped `animate()` controls by assigning `.time = t`. `stop()` is necessary: a paused control otherwise keeps its frameloop active. This route produced 90 distinct transparent 1280×720 frames at 30 fps; shuffled seeks matched sequential hashes, frame 45 alpha ranged 0–1, and an idle probe saw zero rAF and `performance.now()` calls for 500 ms after seeks. Run `vcr example create motion-capture` and use the destination it prints; there run `./run.sh`. One run printed `motion-capture: OK (19.92 fps)`; measured fps varies by machine.

This evidence covers that DOM route only. Layout/layoutId, presence, gestures, scroll, springs and `useSpring`, WAAPI acceleration, SSR optimized appear, React `initial`/`animate` props, random stagger, `motion/mini`, Three.js and vgpu entry points, other browsers/OSes, and motion quality beyond the inspected contact sheet are untested. No adapter is implemented.

## API capability map

Upstream docs currently identify version 14.12.0. These links document Motion's API areas; they do not expand the VCR validation above.

| API area | Documented use | Official documentation |
| --- | --- | --- |
| React `motion` components | Animate React DOM/SVG components with target props and transitions | [Motion component](https://motion.dev/docs/react-motion-component), [React animation](https://motion.dev/docs/react) |
| Imperative animation | Animate DOM elements, SVG and values; playback controls | [animate](https://motion.dev/docs/animate) |
| Motion values | Track and compose animated values without React rerenders | [Motion values](https://motion.dev/docs/motion-value) |
| Transitions and easing | Configure tween, keyframe, spring timing and easing | [Transitions](https://motion.dev/docs/transitions), [Easing](https://motion.dev/docs/easing-functions) |
| Layout and presence | Layout measurement/transitions and enter/exit lifecycle | [Layout animation](https://motion.dev/docs/react-layout-animations), [AnimatePresence](https://motion.dev/docs/react-animate-presence) |
| Scroll and view | Link animation to scroll progress or viewport entry | [Scroll animations](https://motion.dev/docs/scroll), [whileInView](https://motion.dev/docs/react-while-in-view) |
| Gestures | Hover, tap, drag and focus interaction | [Gestures](https://motion.dev/docs/react-gestures) |
| SVG | Animate SVG attributes and paths | [SVG animation](https://motion.dev/docs/animate-svg) |

## Install and doctor
```text
pnpm add motion@14.12.0 react@19.3.1
vcr doctor
```
The example also pins its VCR capture dependencies. `vcr doctor` reports machine availability; it does not validate Motion's API or the package combination.

## Smoke test

```text
vcr example create motion-capture
# In the destination path printed by the command:
./run.sh
```

`# expect:` sample output: `motion-capture: OK (19.92 fps)`. The fixture diffs its frame count, dimensions, frame diversity, shuffled-vs-sequential hashes and alpha range against its committed summary; the reported fps varies by machine.


## Troubleshooting
- If capture hangs after a seek, stop the animation control after setting its time; the fixture found a paused control can keep its frame loop active.
- If the output differs by request order, check that the stopped control is assigned from `t` on every seek and that no other clock advances the scene.

## Official docs
- [Motion for React](https://motion.dev/docs/react)
- [Motion component](https://motion.dev/docs/react-motion-component)
- [Imperative `animate`](https://motion.dev/docs/animate)
- [Motion values](https://motion.dev/docs/motion-value)
