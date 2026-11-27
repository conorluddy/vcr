# MathJax TeX equation to path-only SVG

## Intent and scope

- Tool/version: MathJax `@mathjax/src` 4.1.3 with its pinned `@mathjax/mathjax-newcm-font` 4.1.3 (New Computer Modern).
- Claim: one TeX display equation becomes a self-contained SVG in Node (lite DOM adaptor, no browser, no LaTeX, no installed fonts), byte-identical across separate processes, and rasterises through resvg.
- Exclusions: other fonts, MathML and AsciiMath input, TeX packages beyond `base` and `ams`, inline maths, `fontCache: 'global'` or `'none'`, accessibility output (speech, assistive MathML), and animation of the result.
- Official documentation: https://docs.mathjax.org/en/latest/server/direct.html and https://github.com/mathjax/MathJax-src; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg 0.47.0; ImageMagick for the size check.
- Input: the equation string in `render.mjs`; no external assets.
- Output: ignored `output/` (`equation.svg`, `equation.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: the SVG hash is identical across two `node render.mjs` processes; no `<text>`, `font-family` or `@font-face` (glyphs are `<path>` outlines reused through `<use>`); the viewBox, size in `ex`, and path and use counts match `expected/metrics.json`; resvg at `--width 960` gives a 960×282 PNG.
- Inspect the PNG at native size. Stop if any glyph is missing or misplaced, or if the hash differs between runs (the lead's caveat about generated glyph ids).

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. Recording and verifying runs both passed. SVG SHA-256 `5c0adcbaccea701725ecd13035612d3746837c4eeb23f4ded7e4815a0b1e68a9`, 10 paths, 13 uses, no text or font references. Glyph ids (`MJX-1-NCM-…`) were stable across processes. The 960×282 PNG was inspected at native size: the integral limits, superscript, radical and spacing set correctly. This covers one equation, one font and one cache mode on one machine; it does not cover other inputs, fonts or many equations in one document, where the id counter would advance.
