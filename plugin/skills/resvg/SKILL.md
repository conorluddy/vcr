---
name: resvg
description: Rasterise static SVG to PNG deterministically with resvg. Use for title cards, logos and any SVG source that must become a bitmap frame before FFmpeg.
---

# resvg


`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).
## Use cases and limits
- Static SVG to PNG at any size with correct anti-aliasing and alpha. Deterministic output for a given resvg version.
- No animation, no scripting, no CSS beyond presentation attributes and inline styles. Animated SVG goes through browser capture instead.
- Fonts resolve from the system; embed outlines or ship font files to make renders portable.

## Capability map
The documented command-line surface exposes input/output plus sizing (`--width`, `--height`, `--zoom`), background, font discovery/selection, and rendering controls such as `--dpi`, `--query-all`, and `--skip-system-fonts`; see the [resvg CLI documentation](https://github.com/linebender/resvg#command-line-interface) and the [versioned 0.47.0 release](https://github.com/linebender/resvg/tree/v0.47.0). The Rust `resvg`/`usvg` crates are a separate programmatic surface and are not covered by this CLI guide.

VCR evidence covers one static SVG rasterized to PNG at a requested width, with a retained hash and media metadata check. Other sizing, font, background and rendering options, SVG feature classes, and Rust APIs remain untested in VCR; documented availability does not mean validated VCR support.

## Install and doctor
```text
brew install resvg
resvg --version   # expect: 0.47.x
```
Validated: 0.47.0 on macOS arm64, see `examples/native-svg`.

## Smoke test
```text
vcr example create native-svg && (cd examples/native-svg && ./run.sh)
# expect: native-svg: OK  (PNG hash and ffprobe metadata match expected/)
```

## Recipes
```text
resvg --width 1080 title-card.svg title-card.png          # scale by width, keeps aspect
resvg --zoom 2 icon.svg icon@2x.png                        # scale factor
resvg --background '#111410' card.svg card-opaque.png      # flatten alpha
resvg --list-fonts                                         # what font names will resolve
```

## Troubleshooting
- Text renders in a fallback face: the `font-family` is not installed; use `--use-font-file` or convert text to paths in the source.
- Output hash changed after an upgrade: expected; re-record `expected/` and note the version in validation evidence.

## Official docs
https://github.com/linebender/resvg
