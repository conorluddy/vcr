# Grapla

Product project for the Grapla iOS app. Brand tokens in `brand/brand.json`, owned assets in `assets/` (manifest in `assets/manifest.json`), one video so far.

```text
pnpm --filter @vcr/project-grapla render [scene]   # capture scenes to videos/<id>/output/frames
pnpm --filter @vcr/project-grapla assemble          # FFmpeg overlay chain to the MP4
```

Facts and copy come from `~/Development/Grapla` and `~/Development/GraplaWeb/docs/brand.md`; numbers in copy are a dated snapshot.

Capturing one named scene preserves the other scenes' manifest evidence, including their capture dates and environments. Unknown scene names fail before rendering or writing. Changes to dimensions, FPS or other scenes' timing require a full capture. Earlier manifests are archived under the video's ignored `output/manifests/` directory.

The capture manifest records PNG sequence outputs and a separate MP4 delivery target; it does not claim that assembly has run. `partial` means some scene evidence is missing, and `captured` means all four scenes have capture evidence. Run `assemble` after capture to produce the MP4.
