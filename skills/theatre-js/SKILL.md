---
name: theatre-js
description: Load saved Theatre.js keyframe state and seek its runtime sequence to exact times. Use when code needs deterministic access to authored property values; VCR evidence does not cover Studio or rendering.
---

# Theatre.js

`vcr` means `pnpm vcr` inside the repository or `node <plugin-root>/cli/vcr.mjs` from the installed plugin.

## Use cases and limits
- Load a committed project state, set `sheet.sequence.position`, and read keyed or interpolated values.
- VCR evidence covers `@theatre/core` 0.7.2 with one numeric property, exact keys, an interpolated midpoint, and shuffled seeks on macOS arm64. It does not validate Studio editing/export, browser rendering, UI integrations, adapters, playback timing, or other curve settings.
- For scripted DOM timelines, use Anime.js; for browser 3D, use Three.js.

## Capability map
The [core API](https://www.theatrejs.com/docs/latest/api/core) documents projects, sheets, objects, sequences and transactions. The [project-state manual](https://www.theatrejs.com/docs/latest/manual/projects) covers loading/saving state, and the [sequence manual](https://www.theatrejs.com/docs/latest/manual/sequences) covers position, playback and length. VCR tests loading saved state and seeking one numeric track only; Studio, adapters, edits, playback and other property types remain untested.

## Install and doctor
```sh
npm install @theatre/core@0.7.2
node -p "require('@theatre/core/package.json').version"
# expect: 0.7.2
```
`vcr doctor` does not probe this project-local package; run the version check above in the project that owns it.

## Smoke test
```sh
vcr example create theatre-js-seek
cd examples/theatre-js-seek && ./run.sh
# expect: OK Theatre.js 0.7.2: keyed x(0)=0, x(2)=10; interpolated x(1)=5; shuffled seeks match
```

## Seeking recipe
```js
sheet.sequence.position = seconds;
const valueAtTime = marker.value.x;
```
Assign the absolute requested position before reading values. The fixture returns to the midpoint after out-of-order seeks and confirms it remains 5; this is not evidence about browser frame rendering.

## Troubleshooting
- If loaded state does not match the object/sheet names in code, `marker.value` will not represent the intended track; keep the names aligned with the committed state file.
- If values differ, compare the pinned `@theatre/core` version and the state fixture before changing expected output.

## Official docs
- [Theatre.js core API](https://www.theatrejs.com/docs/latest/api/core)
- [Projects and state](https://www.theatrejs.com/docs/latest/manual/projects)
- [Sequences](https://www.theatrejs.com/docs/latest/manual/sequences)
- Tested package: [`@theatre/core` 0.7.2](https://www.npmjs.com/package/@theatre/core/v/0.7.2)
