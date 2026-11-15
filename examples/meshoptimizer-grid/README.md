# Meshoptimizer simplifies a welded triangle grid

## Intent and scope

- Tool/version: `meshoptimizer` npm package 1.3.0.
- Claim: its JavaScript simplifier reduces a generated welded 5×5 planar grid while returning valid indices, finite reported error and identical results on repeat execution.
- Exclusions: glTF/GLB import or export, attribute preservation, visual fidelity, compression formats, C++/CLI interfaces and other platforms.
- Environment: macOS 26.6 arm64, Node.js 22.19.0, WASM simplifier.
- Input: 25 generated positions and 32 triangles; no external assets.
- Install: fixture-local `meshoptimizer@1.3.0`; outputs under ignored `output/`.

## Plan, before running

- Run `pnpm install --frozen-lockfile` in this fixture, then `./run.sh --record` and `./run.sh`.
- Request 48 indices from 96; assert triangle reduction, index count divisible by three, all indices in range, finite error, repeat index/error equality and stable SHA-256.
- Stop if the simplifier fails to reduce, returns invalid indices or produces nondeterministic output.
- Reproduce with `./run.sh`; metrics are retained in `expected/metrics.json`.

## Observation, after running

- Date/executor: 2026-11-15, Codex validation lane.
- Observed: 25 vertices and 32 input triangles produced 45 indices (15 triangles) against a 48-index target; reported error 0.00007905693928478286. All indices were in range and repeat runs matched (SHA-256 `16b2e537842e0a98ad025d477c85c072a45a7a434908b9e173dba4641a240037`). The algorithm may stop above the target index count due to topology/error constraints.
- This is a passing structural simplification fixture only; it does not establish perceptual fidelity or compatibility with other meshoptimizer interfaces.
