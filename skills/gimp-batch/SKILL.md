---
name: gimp-batch
description: Use GIMP's version-specific batch interface for image operations that depend on GIMP procedures, layers, or plug-ins. Load only when a GIMP operation is needed; for routine conversion or resizing prefer ImageMagick or Sharp.
---

# GIMP batch

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace holding `vcr.json`.

## Use cases and limits
- Run a GIMP-specific procedure without opening the editor, such as loading a source image and exporting through GIMP's procedure database (PDB).
- This guide is grounded in GIMP 3.2.8 Python batch on macOS arm64. The fixture covers PPM import and PNG export only; XCF editing, other procedures, GIMP 2, and other platforms are untested.
- Use ImageMagick for common conversions and Sharp for fast Node image pipelines.

## Capability map
GIMP's command line supports non-interactive batch execution with a selected interpreter and one or more batch expressions; see the [GIMP command-line manual](https://www.gimp.org/man/gimp.html). GIMP 3 exposes Python and the PDB for loading, processing, and exporting images; start from the [GIMP 3 API reference](https://developer.gimp.org/api/3.0/libgimp/). The fixture exercises `python-fu-eval`, `Gimp.file_load`, and the `file-png-export` PDB procedure. Other interpreters, procedures, plug-ins, and image-editing APIs are documented routes, not validated VCR support.

## Install and doctor
```text
brew install --cask gimp
gimp --version   # expect: GIMP 3.2.8
vcr doctor
```

The smoke fixture also uses ImageMagick's `magick` command to inspect pixels; install it separately if needed. `vcr doctor` reports machine availability and does not install either tool.

## Smoke test
```text
vcr example create gimp-batch-image-roundtrip
cd examples/gimp-batch-image-roundtrip && ./run.sh
# expect: "operation": "load PPM and export PNG", "exit_code": 0
```

The fixture checks a 16×12 PNG's exact red, blue, and background samples and decoded RGB hash. Its GIMP 3.2.8 Python-Fu procedure signatures are version-specific.

## Troubleshooting
- **Batch exits successfully but output is missing:** check the GIMP PDB procedure name and required config properties for the installed GIMP major version.
- **GIMP reports config-directory write errors:** the fixture may still complete; its observed sandbox run logged denied config writes. Give GIMP a writable user config directory when a clean run is required.
- **Version mismatch:** the fixture deliberately stops unless GIMP is 3.2.8; use the matching version or create separately reviewed evidence before updating its expected result.

## Official docs
- [GIMP command-line manual](https://www.gimp.org/man/gimp.html)
- [GIMP 3 libgimp API](https://developer.gimp.org/api/3.0/libgimp/)
- [Script-Fu tools and batch invocation](https://developer.gimp.org/resource/script-fu/scriptfu-tools/)
