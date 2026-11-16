---
name: mermaid-cli
description: Render Mermaid text diagrams to SVG, PNG, or PDF with the mmdc command. Load when a source-defined diagram is needed and a browser-backed CLI route is appropriate.
---

# Mermaid CLI

VCR evidence covers Mermaid CLI 12.0.0 rendering one small flowchart to repeatable SVG on macOS arm64 with Node 25.6.1 and Chromium 156.0.8078.4. Other diagram types and output formats remain untested.

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use text-authored Mermaid when a diagram should stay reviewable and easy to revise.
- Evidence covers only a four-node flowchart to SVG with deterministic IDs. It does not establish other Mermaid syntaxes, themes, Markdown fences, PNG/PDF output, or large-graph layout.
- For measured node and edge geometry, use D3 or Graphviz; for hand-composed vector artwork, use SVG.

## Capability map
- Diagram syntax documented by Mermaid includes flowcharts, sequence, class, state, ER, and Gantt diagrams; the VCR fixture exercises only a small flowchart ([syntax reference](https://mermaid.js.org/intro/syntax-reference.html)).
- `mmdc` accepts Mermaid input and SVG/PNG/PDF output, with Mermaid config and Puppeteer launch-config options. The fixture exercises `.mmd` to SVG, a fixed deterministic-ID seed, and an explicit Chromium executable path ([CLI repository and options](https://github.com/mermaid-js/mermaid-cli), [existing Chromium guide](https://github.com/mermaid-js/mermaid-cli/blob/master/docs/already-installed-chromium.md)). Other formats and options are documented but untested here.

## Install and doctor
```sh
pnpm add -g @mermaid-js/mermaid-cli@12.0.0
mmdc --version  # expect: 12.0.0
```
This is a Node CLI; `vcr doctor` does not record project-local npm packages. The fixture pins a local CLI and uses the browser installed by `vcr setup capture --yes`; it disables Puppeteer's browser download and passes the VCR Chromium path explicitly.

## Smoke test
```sh
./examples/mermaid-cli-svg/run.sh
# expect: OK: mermaid-cli-svg
```
The runner prints the detected Chromium version before the result. It renders twice and checks SVG structure and byte-for-byte repeatability.

## Troubleshooting
- If Puppeteer cannot start Chromium, verify the executable path in `--puppeteerConfigFile`; the fixture derives it from VCR's Playwright installation.
- If output bytes differ, retain the pinned Mermaid config and deterministic ID seed, then inspect `output/` against the recorded expected metrics.

## Official docs
- [Mermaid CLI 12.0.0](https://github.com/mermaid-js/mermaid-cli/tree/v12.0.0)
- [Mermaid syntax reference](https://mermaid.js.org/intro/syntax-reference.html)
- [Using an existing Chromium installation](https://github.com/mermaid-js/mermaid-cli/blob/master/docs/already-installed-chromium.md)
