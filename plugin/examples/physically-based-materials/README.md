# Physically Based API materials fixture

## Intent and scope

- **Tool/version:** Physically Based API, `https://api.physicallybased.info/v2/materials`, schema 2.2, header `updated` 202611031901 (2026-11-03). No package; a remote JSON resource.
- **VCR job and claim:** reference values for a named material (IOR, linear sRGB base colour, metalness) can be read from the data, parse, and agree with known physical constants.
- **Exclusions:** the live endpoint after fetch, the other 113 materials, other endpoints (light sources, cameras), colour spaces other than srgb-linear, rendered appearance, and the shader-ball renders.
- **Documentation and licence:** CC0 1.0, stated in the response header (`license: "CC0 1.0 Universal"`) and the repository README ("free to use, modify, and distribute ... even for commercial purposes"), checked 2026-11-27. The README's shader ball is CC BY 4.0 and is not used. No API key or terms page found; anonymous GET.
- **Environment:** Node 22.19.0, macOS arm64. No GPU, no browser.
- **Input/rights:** `data/materials-subset.json`, 25 KB, verbatim entries for Water, Ice, Diamond, Gold, Copper, Silver, Aluminum, Iron (the lead's "Glass" does not exist) plus the response header. The full response is 341,944 bytes, over the 200 KB pin limit, so only this subset is committed. Fetched once with `curl -A vcr-fixture/1.0`, no personal data sent.
- **Dependencies, network, side effects:** none to install. No network at run time. Writes only `output/` and `expected/`.
- **Cleanup:** `output/` is ignored.

## Plan, before running

- **Command:** `examples/physically-based-materials/run.sh --record`, then `run.sh`; each runs `node run.mjs` twice and diffs.
- **Predeclared checks:**
  1. Header licence is `CC0 1.0 Universal`, schema 2.2.
  2. IOR: Water in [1.33, 1.34], Ice in [1.30, 1.32], Diamond in [2.41, 2.43]; metalness 0.
  3. srgb-linear colours of Gold, Copper, Silver, Aluminum, Iron are three finite numbers; metalness 1.
  4. Gold: R > G > B and R/B > 2.5. Copper: R > G > B. Silver and Aluminum: every channel > 0.85, spread < 0.1.
  5. Gold carries srgb-linear and acescg entries.
  6. Two processes give identical output.
- **Failure interpretation:** any failed check is `fail`; failures stay in the fixture and are not loosened.

## Observation, after running

- **Date and executor:** 2026-11-27, Claude agent, `Conors-MacBook-Pro-2.local`.
- **Result:** all checks passed first run. Water IOR 1.3325, Ice 1.3098, Diamond 2.4168. Gold [1.059, 0.773, 0.307] (R/B 3.45), Copper [0.932, 0.623, 0.522], Silver [0.991, 0.985, 0.974], Aluminum [0.916, 0.923, 0.924]. Outputs identical across processes.
- **Finding:** srgb-linear values can exceed 1 (Gold red 1.059). A consumer must clamp or gamut-map.
- **Inspection:** no media; the numbers in `expected/metrics.json` were read.
- **Limits:** subset only; values are the database's, whose sources vary in quality, and match textbook constants only to the tolerances above. Refresh by refetching and diffing the named entries by hand; nothing automates it.
