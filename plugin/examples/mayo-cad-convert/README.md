# Mayo CAD conversion fixture (blocked)

Status: **blocked, not run**. No macOS build of Mayo is published, so the claim cannot be exercised on this machine under the approved install route.

## Intent and scope

Claim under test: Mayo's batch CLI (`mayo-conv`, or `mayo --export` as documented) converts a STEP part headlessly to STL, OBJ or glTF; the output reloads with a bounding box matching the source part's known dimensions within tolerance and a non-zero triangle count; reruns give identical geometry counts.

Tool: `mayo`, latest release v0.10.0 (published 2026-07-03). Licence: BSD-2-Clause (GitHub licence API, checked 2026-11-24; the catalogue card previously said MIT).

Sources checked 2026-11-24:
- https://github.com/fougue/mayo (README: macOS build is documented only as a wiki build-from-source page)
- https://api.github.com/repos/fougue/mayo/releases (all releases v0.2.0 to v0.10.0; asset names listed)
- https://api.github.com/repos/fougue/mayo/license
- `brew info --cask mayo` and `brew info mayo`: neither exists

Exclusions: all of the claim. Nothing was converted, reloaded or measured. No geometry, tolerance or determinism statement follows from this fixture.

## Plan, before running

Approved route (pilot brief): install the official macOS `.dmg` from the Mayo releases into `output/app/` (git-ignored, not `/Applications`), record URL, sha256, version and architecture, clear quarantine only on that app if needed.

Finding: no release contains a macOS asset. v0.10.0 assets are `Mayo-0.10.0-aarch64.AppImage`, `Mayo-0.10.0-x86_64.AppImage`, `Mayo-0.10.0-win64-binaries.zip` and `Mayo-0.10.0-win64-installer.exe` (each with `.sha256`), plus `MayoConv-0.10.0-*.AppImage` (Linux). Earlier releases show Windows installers and Linux AppImages only. Building from source is out of scope, so the route stops here.

Predeclared checks for any future run (not executed):
- Conversion exits 0 headlessly, with no window, for STEP to STL, OBJ and glTF.
- Reloaded bounding box matches the source part's known dimensions within 0.01 mm.
- Triangle count is non-zero for each format.
- Two reruns produce identical triangle and vertex counts; byte identity is recorded either way.

Stop conditions: no macOS build (this case); quarantine or Gatekeeper refusal that cannot be cleared on the approved app alone.

Reproduce: `examples/mayo-cad-convert/run.sh` exits 2 with the blocked message. It does nothing else.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local, macOS 26.6 (Darwin 25.6.0), arm64.

- Versions: Mayo v0.10.0 (latest release examined); Playwright, Chromium, Node and Python not used.
- Downloaded: nothing. Only GitHub API metadata and the README were read. No `.dmg`, AppImage or installer was fetched, and `output/app/` was not created.
- Result: blocked. `run.sh` exits 2.
- Deviations: the catalogue's `brew install --cask mayo` is wrong; no such cask or formula exists. The `macos` install key was removed. The licence was corrected to BSD-2-Clause.
- Not established: whether Mayo's CLI works on macOS, headless behaviour, STEP conversion, reload accuracy, determinism.
- Revisit when: a macOS `.dmg` or `.app` appears in a Mayo release, or the maintainer approves a different route (a source build would need separate approval, and is not evidence for the release binary).
