# Handoff: gaps left after the 2026-11 backfill

The 2026-11-23/24 backfill (PRs #235–#250) took the catalogue from 100 to 186 of 205 tools with a toolkit guide. This file lists what it left open: tools with no guide, partial evidence worth a second fixture, facts nobody verified, and process gaps. Delete a line when its item is resolved. When the file is empty, delete it and its pointer in `AGENTS.md`.

Resume with the `backfill` skill for tool work, and with `evidence` or `guide` for one-off follow-ups. Always read the live catalogue first (`pnpm vcr tools status --json`). The counts here were true on 2026-11-24 only.

## 1. Tools still `listed-in-prd` (19)

**Skip unless the decision changes (8).** These are demoted (`diffusion-studio-core`, `easeljs`, `editly`, `mediarecorder`, `mo-js`, `natron`) or manual-only (`chainner`, `magenta-studio`). Next step: an `ingest` pass to *retire* the demoted ones. The backfill skips them, so they stay in the backlog for good.

**Blocked on install access (4):**
- `surge-xt` and `clap`: the Surge XT cask installs a `.pkg` that needs sudo. A person runs `brew install --cask surge-xt`, then a fixture can host the Surge XT CLAP plugin for `clap`. A CLAP host or validator is still to be chosen.
- `lmms`: Homebrew disabled the cask on 2026-09-01 because it fails Gatekeeper. The options are a signed upstream build or a retire decision.
- `ardour`: macOS builds sit behind a payment flow. The demo build's terms were not read. This needs a human decision (buy a licence, try the demo, or retire).

**Recorded fail or blocked; a better fixture could pass (7):**
- `pngquant`: the claim was too strict for a 64-colour gradient. Try more colours or a non-gradient source.
- `real-esrgan`: PSNR over bicubic is the wrong metric for a GAN upscaler. Use a perceptual metric (dssim, LPIPS) on photographic input.
- `rubber-band`: the R2 engine missed pitch by 11–14 cents on pure tones. Try the R3 engine (`-3`/`--fine`) and real material.
- `splat-transform`: `-t` translates in the tool's frame, with x and y flipped against the PLY. Predeclare bounds in that frame and test the compressed formats.
- `syncalong`: the default lyrics prompt looped Whisper. Without the prompt it was repeatable and within 0.5 s, apart from line 1. That needs a new predeclared run.
- `rhubarb-lip-sync`: the x86_64 build segfaults in PocketSphinx under Rosetta. Wait for a native arm64 build, or test the phonetic recogniser.
- `mayo`: there is no macOS build. It needs a source build (Qt and OpenCascade) or stays blocked.

## 2. Partial evidence worth a second fixture (26)

Each of these has a guide that states its limit. A new predeclared run, with a new evidence entry, could turn it into a pass:

- **Wrong expectation in the fixture, not the tool:** `audiowaveform` (DAT header v1), `mannequin-js` (figure ≈ 1 unit tall), `open3d` (voxel count follows sample density), `revideo` (end frame is inclusive, so 61 frames), `typst` (SVG glyphs are outlines), `gstreamer` (gates file bytes, not stream bytes), `supercollider` (one 64-sample block overrun).
- **Real tool limits, documented:** `pedalboard` (Limiter is not a peak ceiling), `odiff` (`--aa` leaves edge pixels), `kokoro-onnx` and `piper` (TTS output is not reproducible), `piper` (`--length-scale` is not linear), `librosa` and `essentia` (tempo scalar and beat-tick offset), `aubio` (low-pitch bias), `dovi-tool` (L1 read-back), `fluidsynth` (default reverb tail), `splishsplash` (needs `OMP_NUM_THREADS=1`), `three-globe` (mark size).
- **Untested parts of the claim:** `openusd` (no `usdchecker` in the wheel), `gltfjsx` (typecheck and render need drei), `nerfstudio` (COLMAP registered 2/20 synthetic views; use textured, non-planar input), `gl-transitions` (alpha), `libavif` (lossy alpha 254), `colour-science` (relabelled from fail at integration; rounded sRGB matrices), `vhs` (PNG crop, real-time capture).
- **Older partials, not from the backfill:** `build123d`, `react-spring`, `svg`. Check their records before you plan anything.

## 3. Facts written but not verified

- **Reference data:**
  - The Sharma CIEDE2000 rows in `colorjs-conversions` and `colour-science-conversions` come from the `delta-e` package's tests, not the paper. Check them against Table 1 of Sharma, Wu and Dalal (2005).
  - The BT.2087 coefficients in `colour-science-conversions` were typed in without a PDF check.
- **Doc links written from memory:** `skills/d2`, `skills/libplacebo`, and `skills/glslify` (the glsl-easings URL and `glslify --version`).
- **Licences:**
  - QM Vamp plugins (`sonic-annotator`): no licence is stated.
  - Demucs pretrained weights: unclear, probably CC-BY-NC.
  - The Kokoro voice bank: not separately verified.
  - `agg`: the GPL-3.0-or-later text was not read.
  - `oxipng`: the MIT text was not read.
- **`d2`, `dssim`, `mediainfo`:** licence and version fields come from the card, not the upstream text.

## 4. Process and harness gaps

- **Plugin size:** the interim cap went from 8 to 12 MiB (#243). About 1.1 MiB is one OFL font (JetBrains Mono Bold) copied into ten examples. Deduplicate shared example assets, then set the steady-state cap. This is also listed under Open work in `AGENTS.md`.
- **`main` has no required checks:** #249 merged with a red `pnpm validate`, fixed by #250. Either protect `main` or always wait for CI. The `backfill` skill now says to wait.
- **`vcr doctor` does not probe candidate tools:** every backlog record reported `not-probed`, so "installed first" ranking couldn't work. Probing `install.check_command` for candidates would fix this. Several check commands were also wrong: `pnpm dlx`, `pnpm list` and `piper --version` all succeed or fail misleadingly.
- **Example install convention:** some examples are pnpm workspace packages and about 30 ship their own `package-lock.json` and run `npm ci`. revideo needs npm, because pnpm's strict layout hides `puppeteer`. Write the rule down: when to stand alone, when to join the workspace.
- **Python on this machine:** the pyenv 3.12.2 build lacks `_lzma`, so venvs for librosa, rembg, torch and similar use Homebrew `python3.12`. Note this in `skills/evidence` or fix pyenv.
- **`examples/README.md` table:** parallel guide agents appending rows collided at merge, and once rows landed below the table. Generating the table from `example.json` files would end this.
- **Worker rules in `agents/evidence-runner.md`:** workers may not touch other records, so integration has to add the back-links (`ffmpeg-ffprobe`, `imagemagick`, `playwright`, `three-js`). Either let workers append to `examples` arrays or keep the integration step documented. The backfill used a union-merge for this.

## 5. Skill and doc gaps

- **Guides that point to `references/` with no rule ID:** lighting, materials and several FX topics. `references/lighting` and `references/materials` have no `rules.json` yet (#148).
- **`gstreamer`:** the guide cites `TYPO-RANGE` and `TYPO-CHROMA` for encode tagging. The `DELIVERY-*` rules are the better owners.
- **`agents/evidence-runner.md`:** the backfill learned several rules that only live in prompts. Fold them into the agent and `skills/evidence`:
  - Always append the evidence entry, even on fail or blocked, with a "Fixture-reported:" scope when no `expected/` is kept.
  - Put any venv, clone or model under the example's ignored `output/`, never `.venv` in the example.
  - Pass strict `pnpm typecheck` for example code.
  - Never gate on whole-file hashes of muxed media.
- **Grapla-style product video:** VCR has the tools (baguette, frames-cli, ffmpeg, typst, whisper-cpp) but no workflow guide that chains them into an app-promo pipeline. Write that recipe after the first real production, not before.
