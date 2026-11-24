# MPFB human figure (Blender background)

Status: validated on macOS arm64 with Blender 4.4.0 and MPFB 2.0.18, 2026-11-24 (pass; all predeclared checks met). Claim: Blender 4.4.0 in background mode loads MPFB 2.0.18 from an isolated extension repository, creates a default human through MPFB's Python API, and changes its height macro.

## Intent and scope

- Tool: `mpfb` (MPFB 2.0.18, GPL-3.0-or-later add-on, extensions.blender.org id `mpfb`), run inside `blender` (Blender 4.4.0, macOS app bundle), following the `blender-background` skill.
- VCR job and claim: a parametric human figure is created headlessly by MPFB's Python API inside background-mode Blender; its height macro is set to two values and the geometry changes in the predeclared direction; the default figure renders to a non-blank transparent PNG of predeclared size; reruns give identical geometry.
- Exclusions: no clothing, skins, hair, eyes, rigs, poses, expressions or MakeHuman asset packs (only the base mesh `data/3dobjs/base.obj` and its bundled macro targets are used); no animation; no Cycles or EEVEE; no MakeHuman desktop app; no export format; no anatomical accuracy claim; no other OS.
- Vertex counts are not predicted to differ. Macro targets move vertices and do not change topology, so C2 checks that vertex counts are equal while positions and bounding-box height differ.
- Licence and sources, checked 2026-11-24:
  - MPFB: https://extensions.blender.org/add-ons/mpfb/ (archive sha256 `c075b3e9b94b8e5556a5f03f4653602d02ea306de08126e8f55ed6dee28a2dad`, 45,956,992 bytes, `blender_version_min` 4.2.0). Upstream: https://github.com/makehumancommunity/mpfb2 (release v2.0.18, 2026-10-11). Add-on source GPL-3.0-or-later.
  - Base mesh: the header of `data/3dobjs/base.obj` states it "was explicitly released as CC0 in september 2020". Macro targets are under `data/targets/macrodetails/`. Third-party MakeHuman asset packs are not used and are not covered by this record.
  - Blender: GPL-3.0; the renders are the operator's own output.
- Environment: macOS 26.6 arm64, Blender 4.4.0 (build 2025-03-18) from `/Applications/Blender.app`, Workbench engine, CPU only.
- Input: none. The figure comes from MPFB's default macro dictionary (`TargetService.get_default_macro_info_dict()`). The only fetched input is the MPFB zip, verified by sha256 before install.
- Dependencies and installation: `run.sh` downloads the MPFB zip into `output/download/` and checks its sha256. It then installs it with `blender --command extension install-file -r user_default` into an isolated user directory.
- Isolation: Blender runs with `--factory-startup`, `HOME` set to `output/blender-home/`, and `BLENDER_USER_CONFIG`, `BLENDER_USER_SCRIPTS`, `BLENDER_USER_EXTENSIONS` and `BLENDER_USER_DATAFILES` pointing inside it. The user's own `~/Library/Application Support/Blender` is neither read nor written. The add-on's optional network feature is not used; the only network access is the one download.
- Workspace and cleanup: generated files live in `output/` (git-ignored). Only `expected/*.json` and `expected/identify.txt` are kept. Delete `output/` to clean.

## Plan, before running

- Versions: Blender 4.4.0 (`/Applications/Blender.app/Contents/MacOS/Blender`), MPFB 2.0.18, Blender's bundled Python.
- Commands: `./run.sh --record` (download, verify, install, two Blender processes, record), then `./run.sh` (must print `mpfb-human-figure: OK`).
- Scene (`build_figure.py`, run in two separate Blender processes writing `output/run-1/` and `output/run-2/`):
  1. Enable the MPFB add-on from the isolated repository (`bl_ext.user_default.mpfb`).
  2. For height macro values 0.0, 0.5 (MPFB default) and 1.0, with all other macros at defaults, call `HumanService.create_human(macro_detail_dict=...)`, measure the evaluated mesh, then delete it.
  3. Render the default figure (height 0.5): orthographic camera framing its bounding box, Workbench, single flat grey, transparent film, RGBA PNG, 480 x 720 pixels at 100%.
- Predeclared checks (any failure fails the run):
  - C1 isolation: the add-on module path and `bpy.utils.resource_path('USER')` both resolve under `output/blender-home/`; the script exits non-zero otherwise. MPFB's `logservice` reads `resource_path('USER')`, which ignores `BLENDER_USER_*` and would otherwise write logs into `~/Library/Application Support/Blender/4.4/mpfb`. `build_figure.py` redirects that one lookup, for its own process only, to `output/blender-home/resource-user`.
  - C2 macro effect: evaluated vertex count is equal for heights 0.0, 0.5 and 1.0; the coordinate hash differs between 0.0 and 1.0; bounding-box height at 1.0 exceeds that at 0.0 by at least 2%; the default lies between them.
  - C3 render: PNG is 480 x 720 with channels `srgba`; fraction of pixels with alpha at or above 50% lies in [0.05, 0.60]; at least 500 unique colours.
  - C4 rerun: `geometry.json` from run 1 and run 2 are byte-identical and equal `expected/geometry.json`.
  - C5 hashes and shuffled order: not applicable. This is one still, not a sequence. C2 supplies the distinct-hash evidence for geometry.
- Expected artifacts: `output/run-N/geometry.json`, `output/run-N/figure.png`, `output/blender.log`, `output/install.log`, `output/contact.png`.
- Consumer and handoff: none; this fixture is evidence for the `blender` and `mpfb` records.
- Delivery constraints: none.
- Stop conditions: MPFB fails to import or enable (record blocked); Blender version too old for the add-on (blocked); download hash differs from the recorded one (stop, do not install); anything written outside `output/` (fail); any predeclared check fails (fail, or partial with the scope naming the check).
- Reproduction and inspection: `./run.sh`; open `output/run-1/figure.png` and `output/contact.png`.

## Observation, after running

Executor and date: Conor's MacBook Pro (hostname `Conors-MacBook-Pro-2.local`), 2026-11-24, Claude agent in worktree `agent-a6af068337b7435f7`.

Versions:
- MPFB 2.0.18 (`blender_manifest.toml` version; log `Build info 20261010`), extension archive sha256 `c075b3e9b94b8e5556a5f03f4653602d02ea306de08126e8f55ed6dee28a2dad`, 45,956,992 bytes.
- Blender 4.4.0 (hash 05377985c527, built 2025-03-18), `/Applications/Blender.app`, Python 3.11 bundled, Workbench engine.
- Playwright: not used. Chromium: not used.
- Node v22.19.0, pnpm 10.29.2. ImageMagick 7.1.2-35 Q16-HDRI (`magick`). macOS 26.6 arm64.

Measured (`expected/geometry.json`, identical in two separate Blender processes):

| height macro | vertices | faces | bounding-box height (m) |
|---|---|---|---|
| 0.0 | 13380 | 13378 | 1.299869 |
| 0.5 (default) | 13380 | 13378 | 1.659431 |
| 1.0 | 13380 | 13378 | 2.367775 |

Coordinate hashes differ between 0.0, 0.5 and 1.0. Render: 480 x 720, `srgba`, alpha 0 to 1, opaque fraction (alpha at or above 50%) 0.188087, 4236 unique colours. The two runs' PNGs are pixel-identical (`magick compare` AE 0) but not byte-identical (metadata differs), so the byte-level claim is not made.

Predeclared checks: C1 pass (module and `resource_path('USER')` under `output/blender-home`); C2 pass (vertex counts equal, as predicted, since macro targets do not change topology; coordinates and height differ in the predicted direction); C3 pass; C4 pass (`cmp` of `geometry.json` between runs, and `diff` against `expected/`); C5 not applicable.

What I saw in `output/contact.png`: a single grey, untextured MPFB base-mesh figure in a neutral A-pose-like stance with arms out and feet on the ground, fully inside the frame over a grey backdrop, with a clean transparent background. It is the library's own mesh, not a placeholder. No clipping at the head or feet.

Deviations and incidents:
- The claim's wording said vertex counts would "differ in the predeclared direction". Macro targets move vertices without changing topology, so this was not predicted and the run shows equal counts. The fixture reports the counts and checks equality.
- First attempt (failed, before any result): MPFB was not enabled in preferences, so its `get_preference` lookups failed. Its `logservice` also wrote logs to `~/Library/Application Support/Blender/4.4/mpfb` because it reads `bpy.utils.resource_path('USER')`, which ignores `BLENDER_USER_*`. I deleted that `mpfb/` directory (it did not exist before the attempt; the user's `config`, `extensions` and `scripts` were untouched, and a find for files newer than a pre-run marker returned none). The fix is in `build_figure.py`: `default_set=True` and a process-local redirect of that one lookup. No predeclared check was changed.
- Blender's user config, prefs and add-ons under `~/Library/Application Support/Blender/4.4` were not read or written by the passing runs.
- MPFB's optional network features were not used. The only download is the MPFB zip.
- Licence: the base mesh header says CC0 (2020 release). The third-party MakeHuman asset packs are not used. MPFB itself is GPL-3.0-or-later.

What this establishes: on this Mac, with Blender 4.4.0 and MPFB 2.0.18 from the official extension archive, an isolated headless run creates a default MPFB base-mesh human, changes its height macro to three values with the predicted geometry change, renders a non-blank transparent 480 x 720 figure, and reproduces the geometry stats exactly across two processes.

What it does not establish: other Blender versions or OSes; other MPFB macros (gender, age, weight); clothing, skins, hair, rigs or pose; Cycles or EEVEE; byte-identical PNGs; anything about the Blender GUI or MakeHuman desktop app.

Reviewer and triggers: revisit if MPFB ships a new version, Blender changes extension loading, or MPFB stops reading `resource_path('USER')` (the redirect would then be unnecessary but harmless).
