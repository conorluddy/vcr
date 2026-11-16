# POV-Ray sphere render

## Intent and scope

- Tool ID and version/build: POV-Ray 3.7.0.10 (Homebrew stable formula; checked 2026-11-16).
- VCR job and exact claim being tested: render one text-authored primitive scene to a PNG using the native POV-Ray CLI.
- Explicit exclusions: animation, CSG, procedural textures, alpha, high-quality antialiasing, and any other renderer or file format.
- Documentation: https://wiki.povray.org/content/Documentation%3ATutorial_Section_2.2 and https://formulae.brew.sh/formula/povray; checked 2026-11-16. Homebrew formula license is AGPL-3.0-or-later.
- Environment: macOS 26.6 arm64; exact Homebrew and POV-Ray versions recorded after run; CPU renderer, no GPU.
- Input: original, self-authored `scene.pov`; no external assets.
- Installation plan: if absent, `brew install povray`, using Homebrew's stable 3.7.0.10 arm64 bottle. This may install or upgrade formula dependencies but writes no repository files. Check for any concurrent formula lock and wait if necessary.
- Output: ignored `output/sphere.png`; compact metrics and image hash retained in `expected/`.

## Plan, before running

- Commands: `./run.sh --record` once, then `./run.sh` twice.
- Renderer flags: `+Iscene.pov +Ooutput/sphere.png +FN +W128 +H96 -A +WT1 -D`; single worker and antialiasing disabled to reduce nondeterminism.
- Predeclared checks: PNG is exactly 128x96 RGB; >1000 pixels differ from the top-left background by >8 in any channel; >1000 red sphere pixels satisfy the declared RGB threshold; both pixel bounds lie within the frame; RGB pixel-data SHA-256 repeats exactly.
- Expected artifacts: `expected/metrics.json`; generated PNG remains under ignored `output/`.
- Stop conditions: stop if CLI version differs from stable 3.7.0.10, command fails, dimensions differ, changed pixel count is not meaningful, or repeat hash differs.
- Inspection: open the retained rendered image at native scale and visually confirm a shaded sphere is visible against its background and floor.

## Observation, after running

- 2026-11-16, `Conors-MacBook-Pro-2.local`, macOS 26.6 arm64; POV-Ray 3.7.0.10.unofficial from Homebrew formula 3.7.0.10_17; Homebrew 7.0.14-6-g80123ad; Python 3.15.2; ImageMagick 7.1.2-15 Q16-HDRI. CPU render, one worker, no GPU.
- `./examples/pov-ray-sphere/run.sh --record`, followed by two separate runs, passed. All produced a 128x96 RGB image, 11,880 pixels differing from the top-left background, and 4,128 sphere-red pixels in bounds `[28,12,99,83]`. Decoded RGB SHA-256 repeated as `82608128b713798b4a9e4dba39791a6fe27c449cb163eaf43c4ec52b453f109e`.
- Inspected `output/sphere.png` at native scale: one shaded red sphere is visible against the blue-gray background, with floor and cast shadow; no visual defect was observed for this small fixture.
- Pass for a single text-authored sphere and plane rendered to PNG with repeatable RGB pixels on this macOS arm64 build. No animation, CSG, antialiasing, alpha, advanced materials, other platforms, or production-quality claim is established.
- Initial whole-PNG hashing failed repeat comparison because PNG container bytes changed; the retained check hashes decoded RGB pixels instead. The initial CLI call also logged that `/Users/conor/.povray/3.7/povray.conf` is absent; rendering succeeded with bundled/default settings. Homebrew installed POV-Ray 3.7.0.10_17 and upgraded Boost 1.90.0_1 to 1.92.0_1; no repository files were written by the install.
