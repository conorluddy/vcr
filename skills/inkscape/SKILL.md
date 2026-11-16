---
name: inkscape
description: Use Inkscape's CLI to export or convert designer-authored vector documents when its SVG handling is needed. Load for page export, object export, or CLI actions; use resvg for straightforward SVG rasterization.
---

# Inkscape

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace holding `vcr.json`.

## Use cases and limits
- Export authored SVG pages through Inkscape's native renderer while preserving transparent areas.
- Evidence covers page-to-PNG export in Inkscape 1.4.4 on macOS arm64. Object export, actions, PDF/EPS conversion, text conversion, and other platforms are untested.
- Prefer resvg for plain SVG rasterization; Inkscape is useful when document-specific features must be interpreted by Inkscape.

## Capability map
The [Inkscape CLI reference](https://inkscape.org/doc/inkscape-man.html) documents export format, filename, area, sizing, and conversion options. The [command-line guide](https://wiki.inkscape.org/wiki/Using_the_Command_Line) maps export options to actions, plus shell mode for processing multiple documents in one process. The fixture exercises page export with `--export-area-page`, explicit dimensions, and `--export-filename`; object IDs, actions, shell mode, and other conversions are documented but not tested here.

## Install and doctor
```text
brew install --cask inkscape
/Applications/Inkscape.app/Contents/MacOS/inkscape --version   # expect: Inkscape 1.4.4
vcr doctor
```

The smoke fixture also needs ImageMagick's `magick` command for pixel checks. `vcr doctor` reports availability; it does not install tools.

## Smoke test
```text
vcr example create inkscape-svg-export
cd examples/inkscape-svg-export && ./run.sh
# expect: "version": "1.4.4", "repeat_equal": true
```

The fixture renders twice and checks 128×96 dimensions, two opaque color samples, a transparent corner, and identical PNG hashes.

## Recipes
```sh
# Export the page at a chosen size while preserving aspect ratio if one dimension is omitted.
inkscape input.svg --export-area-page --export-width=128 --export-filename=output.png

# Convert a document to PDF (documented CLI surface; not covered by the VCR fixture).
inkscape input.svg --export-filename=output.pdf
```

## Troubleshooting
- **Export created a different filename:** set `--export-filename` explicitly; Inkscape may otherwise derive an output name.
- **Pixel/hash checks differ:** confirm the Inkscape version and input SVG, then re-record only after reviewing the rendered image. The fixture intentionally stops on version mismatch.
- **Batch action is ignored or opens a GUI:** consult the version's action requirements; some actions require `--batch-process` or a GUI-enabled execution path.

## Official docs
- [Inkscape command-line manual](https://inkscape.org/doc/inkscape-man.html)
- [Using the command line](https://wiki.inkscape.org/wiki/Using_the_Command_Line)
- [Inkscape 1.4 release notes](https://wiki.inkscape.org/wiki/Release_notes/1.4)
