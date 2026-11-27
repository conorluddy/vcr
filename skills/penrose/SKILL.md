---
name: penrose
description: Turn a Penrose Domain, Substance and Style trio into an optimised, self-contained SVG diagram in Node with @penrose/core, pinned by a variation string. Load once Penrose has been chosen for a mathematical or conceptual explainer still.
---

# Penrose

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Three programs in, one SVG out: Domain (types, predicates), Substance (the objects and facts), Style (shapes plus `ensure`/`encourage` rules). An optimiser solves positions; labels become MathJax path outlines.
- A fixed `variation` string gives the same SVG bytes (tested: two processes, same machine). A different string gives a different layout that still meets the constraints.
- Stills only. Interpolating layouts for motion is untested. For graphs and flows use `d2`, `graphviz` or `mermaid-cli`; for a lone equation use `mathjax`.
- VCR evidence covers one Venn-style trio, `@penrose/core` 3.3.1, macOS arm64, Node 22.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `compile`, `optimize`, `toSVG` in Node | [docs](https://penrose.cs.cmu.edu/docs/ref/) | tested |
| Domain and Substance languages | [domain](https://penrose.cs.cmu.edu/docs/ref/domain/usage), [substance](https://penrose.cs.cmu.edu/docs/ref/substance/usage) | small subset tested |
| Style: `Circle`, `Equation`, `ensure`, `encourage` | [style](https://penrose.cs.cmu.edu/docs/ref/style/usage) | tested; other shapes and functions untested |
| `Text` shapes | same | untested (measuring needs native `canvas`) |
| `@penrose/roger` CLI, `.trio.json`, registry imports | [repo](https://github.com/penrose/penrose) | untested |
| Stepping the optimiser, `resample` | [API](https://penrose.cs.cmu.edu/docs/ref/) | untested |

## Install and doctor
```sh
pnpm add @penrose/core@3.3.1 jsdom@22.1.0 global-jsdom@8.8.0
```
Project-local libraries; `vcr doctor` does not probe them. Pin the Penrose version with the variation: layouts are only repeatable for both together.

## Smoke test
```sh
cd examples/penrose-venn-svg && ./run.sh
# expect: OK: penrose-venn-svg
```

## Recipe: trio to SVG
```js
import 'global-jsdom/register';            // before importing core
import { compile, optimize, toSVG } from '@penrose/core';

const compiled = await compile({ domain, substance, style, variation: 'MyFixedVariation1' });
if (compiled.isErr()) throw new Error(JSON.stringify(compiled.error));
const optimised = optimize(compiled.value);
if (optimised.isErr()) throw new Error(JSON.stringify(optimised.error));
const svg = (await toSVG(optimised.value, async () => undefined, 'diagram')).outerHTML;
```
- Core needs a DOM for MathJax; without jsdom `compile` throws `window is not defined`.
- Leave `texLabels` false. `true` emits raw `$A$` text for external LaTeX, not paths.
- Style fields are newline-separated inside shape braces; one line of several fields is a parse error.
- `canvas` is not a Style object to `ensure contains(...)` against; use numeric rules on centres instead.
- Size is the Style `canvas { width height }` viewBox; give resvg an explicit `--width`.

```sh
resvg --width 800 --background white venn.svg venn.png
```

## Determinism
Same variation, same version, same machine: identical bytes across processes (tested). Other machines, Node versions and richer Styles untested; hash facts you need rather than bytes if you cross machines.

## Troubleshooting
- `window is not defined`: register `global-jsdom` first.
- `Syntax error ... Unexpected identifier token`: put each Style field on its own line.
- `PathToNamespaceError ... canvas`: see above.

## Official docs
- [Penrose reference](https://penrose.cs.cmu.edu/docs/ref/)
- [penrose/penrose](https://github.com/penrose/penrose)
- [@penrose/core on npm](https://www.npmjs.com/package/@penrose/core)
