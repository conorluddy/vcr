---
name: mayo
description: "Unproven in VCR: Mayo, a Qt and OpenCascade CAD viewer with a batch conversion CLI; blocked because no macOS build is published, so every recipe is documentation-only."
---

# Mayo (unproven)

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Status

**Unproven and blocked.** No evidence of any conversion. The record has `validation.status: blocked` and stays `documentation_status: listed-in-prd`.

- Recorded block, `examples/mayo-cad-convert/` (2026-11-24, macOS arm64): `run.sh` exits 2. Mayo v0.10.0 (latest) ships only Linux AppImages (`Mayo-0.10.0-aarch64.AppImage`, `-x86_64.AppImage`, `MayoConv-*`) and Windows binaries and installer; earlier releases (v0.2.0 to v0.10.0) show no macOS asset. Nothing was downloaded, converted or measured.
- Cause: no macOS build. Upstream documents macOS as build-from-source only (a wiki page). `brew install --cask mayo` does not exist (checked).
- Next fixture to try: only if a macOS `.dmg` or `.app` appears in a release, or a person approves a source build (Qt and OpenCascade); a source build is not evidence for the release binary. Predeclared checks already in the example README: headless exit 0 for STEP to STL, OBJ and glTF; reloaded bounding box within 0.01 mm of the known part; non-zero triangles; identical counts on rerun.

## Use cases and limits
- Intended job: batch CAD interchange (STEP, IGES, BREP, STL, OBJ, glTF and others) without writing a script, plus viewing CAD before converting.
- Not for scene authoring or rendering (Blender). Not for a plain mesh format change when a lighter tool will do.
- Nothing about CLI behaviour, headless operation, accuracy or determinism is known in VCR.

## Capability map
From the [official README](https://github.com/fougue/mayo); documentation-only, nothing tested.
- **GUI viewer** and a **batch CLI**: conversion by passing input files and export targets (check `mayo --help` on a real build for exact flags).
- **Linux:** a `MayoConv` AppImage variant exists (per release asset names).
- **Formats:** per the README (STEP, IGES, OpenCascade BREP, STL, OBJ, glTF, PLY and others, depending on build).

## Install and doctor
No supported macOS install route. Do not run `brew install --cask mayo`. The record's check command `mayo --help` cannot pass here. `vcr doctor` does not probe candidates.

## Smoke test
```sh
vcr example create mayo-cad-convert
cd examples/mayo-cad-convert && ./run.sh
# expect: exit 2, the blocked message
```

## Validated neighbours to use today
- build123d: build parametric parts and export STEP, SVG and GLB (`skills/build123d/SKILL.md`). It authors geometry; it is not a general reader of arbitrary CAD files.
- trimesh: load and convert mesh formats, bounding-box checks (`skills/trimesh/SKILL.md`).
- openusd and gltf-transform: USD and glTF pipelines (`skills/openusd/SKILL.md`, `skills/gltf-transform/SKILL.md`).
- Reading a STEP file you did not make is the gap none of these closes today; say so rather than guess.

## Troubleshooting
- Looking for a macOS download: there is none in any release. Observed in the blocked fixture.
- Brew cask not found: it does not exist. Observed.

## Official docs
- [Mayo repository and README](https://github.com/fougue/mayo), [releases](https://github.com/fougue/mayo/releases)
- Licence: BSD-2-Clause (GitHub licence endpoint, as the record corrects; the older assessment said MIT). Licence text not read.
