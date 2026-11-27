# Pikchr relative-placement flow to SVG

## Intent and scope

- Tool/version: Pikchr 1.0 (`pikchr 1.0 20260403102956`), built from Fossil check-in `a7f1c35bc0448daf15e2bafa36e510c1517534e620c452ecb314ed57d974f081` (2026-04-03). The check-in tarball is fetched from `https://pikchr.org/home/tarball/<check-in>/p.tar.gz`; `expected/pikchr.y.sha256` pins its `pikchr.y`.
- Claim: a Pikchr script places four boxes by direction and distance and becomes SVG with the system C compiler only, byte-identical on repeat, and editing the last label leaves the earlier shapes exactly where they were.
- Exclusions: other object types (circles, splines, sequence diagrams), fonts, `fit` behaviour at other sizes, the WASM build, Linux or Windows, and animation.
- Official documentation: https://pikchr.org/home/doc/trunk/doc/userman.md; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Apple clang via `cc`; Node 22.19.0; resvg 0.47.0; ImageMagick for the size check.
- Route note: the repository does not commit `pikchr.c`; the official `make pikchr` builds `lemon`, generates it and compiles with `-DPIKCHR_SHELL`, all inside ignored `output/src/`. No machine install.
- Input: `flow.pikchr`. Output: ignored `output/` (`flow.svg`, `flow-edited.svg`, `flow.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: two renders are byte-identical; 7 `<path>` elements (4 boxes, 3 arrow lines) and labels Script, Parse, Layout, SVG; no `font-family`; with `"SVG"` replaced by a longer label, the first five paths are identical and the viewBox widens; resvg at `--width 960` matches the PNG size derived from the viewBox; viewBox, version and hash match `expected/metrics.json`.
- Inspect the PNG at native size. Stop if text is missing or clipped, or if any check fails; do not loosen a check.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. Both runs passed on first try. The build produced `pikchr 1.0 20260403102956`. SVG viewBox `0 0 499.68 34.56`, 7 paths, hash `c616688c…9309`. Earlier shapes were unchanged after the label edit. The 960x68 PNG showed four boxes, three arrowheads and readable labels, in a serif fallback font. resvg warns `Invalid 'font-size' value: 'initial'` because Pikchr sets `font-size:initial` on the root and no `font-family`; the text was still sized sensibly, but this is the lead's font caveat confirmed, so pin fonts in the rasteriser. Not covered: other diagram types, fonts, platforms, the first-run download (requires network; later runs reuse `output/src`). Orchestrator correction, same day: the original run predicted the PNG size from the viewBox (960x66), but resvg 0.47.0 gives 960x68 deterministically, and `expected/metrics.json` had not been committed; the check now records the actual size in `expected/png-size.txt`.
