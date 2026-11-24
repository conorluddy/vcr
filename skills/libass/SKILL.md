---
name: libass
description: Render a hand-written ASS/SSA subtitle track to bitmaps with libass from a C program and composite it over frames. Use when ASS styling and timed events must be burned in natively; the FFmpeg filter route is untested here.
---

# libass

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Tested: a C program linked to Homebrew libass 0.17.5 reads a hand-written ASS file (one style, two events at different `\pos` anchors), renders at 50 times over a solid 640x360 background and composites the bitmaps itself. Each event appears only in its predeclared region, gaps are empty, coverage has antialiased edges, reruns are byte-identical and shuffled order equals sequential order. macOS arm64, CPU only.
- Library only: libass produces coverage bitmaps (`ASS_Image`), not video. You write the compositing and the PPM or PNG output, then encode with FFmpeg.
- FFmpeg route untested: the Homebrew FFmpeg 9.0.2 here is built without libass (no `ass` or `subtitles` filter, no `--enable-libass`). Check `ffmpeg -filters` before relying on it; otherwise burn in through C as below.
- Use browser typography or SVG when captions are authored as scene graphics. Caption wording, line length and timing are pillar decisions (`vcr rules info TYPO-CAPTION-CPS`, `TYPO-CAPTION-DURATION`, `TYPO-CAPTION-LINES`); libass only draws what the track says. Whether burnt-in text meets access needs is `ACCESS-*` territory (`vcr rules info ACCESS-DATED`; use the accessibility skill); burnt-in captions cannot be switched off.
- Not tested: FFmpeg filters, karaoke, fades, animated tags, `\clip`, drawing commands, system fonts and fallback, other font providers, shaping correctness, other platforms or versions.

## Capability map
Discovery only; documented does not mean validated. Entry points: [repository](https://github.com/libass/libass), [`ass.h` API header](https://github.com/libass/libass/blob/master/libass/ass.h), [ASS format notes](https://github.com/libass/libass/wiki).
- Library and track: `ass_library_init`, `ass_read_file` (tested), `ass_read_memory` and styles overrides (untested).
- Renderer: `ass_renderer_init`, frame and storage size, `ass_render_frame` (tested), margins, aspect and hinting options (untested).
- Fonts: `ass_set_fonts_dir` with `ASS_FONTPROVIDER_NONE` (tested), fontconfig and CoreText providers (not tested; fontconfig was unavailable here), memory fonts (untested).
- ASS features: styles, `\an`, `\pos` (tested); karaoke, fades, `\move`, `\clip`, drawing (untested).

## Install and doctor
```text
brew install libass
pkg-config --modversion libass   # expect: 0.17.5
```
Validated: 0.17.5 on macOS arm64. `vcr doctor` reports whether it is installed.

## Smoke test
```text
vcr example create libass-burn-in && (cd examples/libass-burn-in && ./run.sh)
# expect: reruns byte-identical, then libass-burn-in: OK
```
`run.sh` stops on any libass version other than 0.17.5. `./run.sh --record` re-records `expected/`.

## Recipe (the tested route)
```c
#include <ass/ass.h>
ASS_Library *library = ass_library_init();
ass_set_fonts_dir(library, "fonts");                   // only font files in this directory
ASS_Track *track = ass_read_file(library, "fixture.ass", NULL);
ASS_Renderer *renderer = ass_renderer_init(library);
ass_set_frame_size(renderer, 640, 360);
ass_set_storage_size(renderer, 640, 360);              // match PlayResX/PlayResY
ass_set_fonts(renderer, NULL, "JetBrains Mono", ASS_FONTPROVIDER_NONE, NULL, 0);
int changed;
ASS_Image *image = ass_render_frame(renderer, track, timeMs, &changed);  // linked list
```
Each `ASS_Image` has an 8-bit coverage `bitmap`, `stride`, `dst_x`, `dst_y`, `w`, `h` and `color` as RRGGBBAA where AA is transparency (0 is opaque). Blend `color` over the frame by `bitmap * (255 - AA) / 255`. A null result means nothing to draw.

Build: `clang -std=c11 -O2 $(pkg-config --cflags libass) render.c $(pkg-config --libs libass) -o render`.

## Tested behaviour
- Event windows: start inclusive, end exclusive. Text drawn at 200 to 1700 ms and 2200 to 3700 ms samples; zero changed pixels at 0, 100, 1800 to 2100 and 3800 to 4900 ms.
- `\an7\pos(40,60)` put text at the top left, `\an3\pos(600,320)` right-aligned at the bottom right.
- Three distinct frame hashes (blank and two events); static text means no motion inside an event.
- Coverage at 3000 ms spans 0 to 255 with 797 partial pixels, so edges are antialiased.
- One process rendering times in shuffled order matched sequential hashes; a repeat run was byte-identical.
- Font provenance: the libass log named `JetBrainsMono-Bold` after loading the bundled file. With an empty fonts directory the text did not draw at all, so the font directory is load-bearing.
- Hashes depend on the libass, FreeType and HarfBuzz builds; re-record after any upgrade.

## Troubleshooting
- `can't find selected font provider` with `ASS_FONTPROVIDER_FONTCONFIG`: fontconfig was unavailable here. Use `ASS_FONTPROVIDER_NONE` plus `ass_set_fonts_dir`.
- `Error opening memory font` naming a non-font file: the fonts directory holds only font files; keep licences elsewhere (the example keeps `OFL.txt` at its root).
- Nothing drawn: the named font was not found in the fonts directory, the track failed to parse (`ass_read_file` returns null), or the time is outside every event window.
- No `ass` or `subtitles` filter in FFmpeg: that build lacks libass; use the C route or an FFmpeg built with `--enable-libass` (untested).

## Official docs
- https://github.com/libass/libass
- https://github.com/libass/libass/blob/master/libass/ass.h
