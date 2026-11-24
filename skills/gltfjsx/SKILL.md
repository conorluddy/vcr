---
name: gltfjsx
description: Convert a GLB into a typed React Three Fiber component with gltfjsx 6.5.3. Load when an R3F scene needs a model's meshes and materials as JSX; VCR evidence is partial and covers generation only.
---

# gltfjsx

`vcr` means `pnpm vcr` in this repository or `node <plugin-root>/cli/vcr.mjs` from an installed plugin. Run it from the workspace.

## Use cases and limits

Build-time CLI: reads a `.glb`/`.gltf` and writes a TSX component that references each mesh and material by name. The output is source code, not a render. The generated component uses drei's `useGLTF` and so belongs in an R3F scene; see `react-three-fiber` and `drei`.

Evidence is partial: one generated 2-mesh GLB, `--types --keepnames`, macOS arm64, gltfjsx 6.5.3. Use `three-js` for non-React scenes and `gltf-transform` for optimising or inspecting a GLB.

## Capability map

Documented in the [gltfjsx README](https://github.com/pmndrs/gltfjsx): TypeScript output, node naming and group handling, `--transform` (Draco, meshopt, texture resize via gltf-transform), instancing, animations. The fixture exercises only `--types`, `--keepnames` and `--output`. Everything else is untested; documentation is not VCR validation.

## Install and doctor

Project-local, exact pin; not `pnpm dlx`:

```sh
pnpm add -D gltfjsx@6.5.3
pnpm exec gltfjsx --version
vcr doctor
```

Installation is machine-specific; check `vcr doctor`. The generated TSX imports `@react-three/drei` and `three-stdlib`, which the fixture did not install.

## Smoke test

From the repository root:

```sh
pnpm install
examples/gltfjsx-r3f-component/run.sh
# expect: exit 1, check-output: FAIL ... does not reference predeclared names ['CrateGroup']
```

The failure is the recorded finding, not a broken install. Both conversions still ran and matched: TSX 921 bytes, SHA-256 `0f95f66b...da361`. Names `Body`, `Clasp`, `Wood`, `Metal` are referenced; `CrateGroup` is not.

## Recipe

```sh
pnpm exec gltfjsx model.glb --types --keepnames --output src/Model.tsx
```

- Group nodes are dropped unless `--keepgroups`. Seen only as a diagnostic with that flag; not part of the tested claim.
- Reruns are byte-identical only with identical arguments: the header embeds the command line, including the `--output` path.
- Check the generated names against the GLB before wiring JSX to them.

## Troubleshooting

- TS2304 `Cannot find name 'GLTFAction'`: with `--types` on a GLB with no animations the output references `GLTFAction` in `GLTFResult` but never declares it. A strict typecheck fails until you remove or patch that line. Read from a diagnostic `tsc` run, not a passing typecheck.
- Unresolved `react`, `three`, `@react-three/drei`, `three-stdlib`: install them in the consuming project.
- Missing group in the JSX: pass `--keepgroups`.

## Not tested

Strict typecheck of the output, rendering in the r3f capture route (needs drei and three-stdlib), `--transform`, instancing, animations, other GLBs.

## Official docs

- https://github.com/pmndrs/gltfjsx
- https://www.npmjs.com/package/gltfjsx
- [Example source](https://github.com/conorluddy/vcr/tree/main/examples/gltfjsx-r3f-component)
