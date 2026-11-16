# Mermaid CLI flowchart to SVG

## Intent and scope

- **Tool/version:** `@mermaid-js/mermaid-cli` 12.0.0, pinned in this example's npm manifest and lockfile.
- **Claim:** the actual `mmdc` CLI renders an owned four-node flowchart to SVG with expected labels, node/edge structure, dimensions, and repeatable output using deterministic IDs.
- **Exclusions:** no Markdown fences, themes, CSS, icons, PNG/PDF output, large diagrams, or broad Mermaid syntax coverage.
- **Environment:** macOS 26.6 arm64; Node 25.6.1; npm 11.9.0; VCR Playwright 1.64.1; Chrome for Testing 156.0.8078.4.
- **Input/rights:** `source.mmd` is authored here; no external source or diagram assets.
- **Dependencies/install effect:** `PUPPETEER_SKIP_DOWNLOAD=1 npm ci --prefix examples/mermaid-cli-svg --ignore-scripts` installs the pinned CLI and its fixture-local dependencies (npm lockfile 89,461 bytes); `node_modules` is ignored. Puppeteer browser download is disabled. The runner points Puppeteer to the already installed VCR Chromium executable through `--puppeteerConfigFile`. No global install. Generated browser config, SVG and checks live under ignored `output/`.
- **Documentation:** Mermaid CLI's [official existing-Chromium guide](https://github.com/mermaid-js/mermaid-cli/blob/master/docs/already-installed-chromium.md) documents the Puppeteer config flag and explicit `executablePath`; [official CLI README](https://github.com/mermaid-js/mermaid-cli) documents `.mmd` to SVG conversion. Checked 2026-11-16.

## Plan, before running

- **Command:** `./run.sh --record` runs local `mmdc --version`, discovers VCR Playwright's Chromium executable, writes a Puppeteer launch config under ignored `output/`, invokes `mmdc --input source.mmd --output <output> --configFile mermaid-config.json --puppeteerConfigFile <config> --quiet` twice, then records the checked summary in `expected/result.json`. `./run.sh` repeats the render and diffs against that JSON.
- **Expected checks:** CLI 12.0.0; Mermaid config enables `deterministicIds` with a fixed seed; SVG XML parses and contains labels Start/Review/Done/Draft/pass/revise, four node groups and four edge groups; exact output bytes match.
- **Stop conditions:** no exact CLI/browser version, Puppeteer failure, parse/label/node/edge/dimension mismatch, repeat mismatch, or unexpected download outside the example.
- **Inspection:** inspect SVG structure and rasterize the retained SVG to an ignored PNG for visual review.

## Observation, after running

- **Date/executor:** 2026-11-16, `Conors-MacBook-Pro-2.local`.
- **Observed versions, dimensions, counts, hashes, visual inspection and exit status:** Mermaid CLI 12.0.0; Node 25.6.1; npm 11.9.0; VCR Playwright 1.64.1; Chrome for Testing 156.0.8078.4; macOS 26.6 arm64. SVG viewBox `4 4 654.546875 187`, width `100%`, 4 node groups, 4 edge paths, all six labels found. Two CLI renders matched byte-for-byte (SHA-256 `7dbe8b1e325a1f682d25756549dbdd7f38aeeaea5348a849081dd8a6a45c1228`). Chromium screenshot visually showed the four nodes, decision diamond, arrows and labels. Exit status 0.
- **Outcome and limits:** Passed the actual local `mmdc` CLI twice using local Chromium via Puppeteer config; `PUPPETEER_SKIP_DOWNLOAD=1` avoided a Puppeteer browser download. This covers only the owned small flowchart, SVG output and deterministic IDs on this local environment. npm lockfile is 89,461 bytes; installed `node_modules` is local and ignored.
