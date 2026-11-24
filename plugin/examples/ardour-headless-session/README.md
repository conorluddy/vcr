# Ardour headless session and export fixture (blocked)

Status: **blocked, not run**. No free macOS Ardour build with a headless route was obtained, so the claim cannot be exercised on this machine under the approved install route (no payment, no sudo, nothing outside `output/`).

## Intent and scope

Claim under test (planned): Ardour's session utilities (`ardour8-lua` or the current equivalent, and `ardour8-export` or the current equivalent) create a session from the command line, import a generated WAV, and export it headlessly to WAV, with the exported duration, sample rate and peak matching predeclared values.

Tool: `ardour`. Latest numbered release seen on the upstream tag list: `9.10` (GitHub API, `Ardour/ardour` tags, checked 2026-11-24). No build of any version was downloaded or run.

Licence: the ardour.org footer says "Ardour is licensed under the GNU Public License v2" (checked 2026-11-24). Compiled macOS builds are not a free download (see below), so the licence of a binary obtained through the official route is not established by this fixture.

Sources checked 2026-11-24:
- https://ardour.org/ (home page; no free macOS download offered)
- https://ardour.org/download.html and https://community.ardour.org/download (ready-to-run vs source; the ready-to-run page is a payment flow with a suggested one-time amount and subscription plans in its page state, and a demo request form; the demo form was not submitted)
- https://manual.ardour.org/lua-scripting/ (scripting; its notice says the documented API "may be subject to change")
- `brew info --cask ardour` and `brew search ardour`: no cask or formula (`Error: Cask 'ardour' is unavailable`; search returns only `harbour`)
- https://api.github.com/repos/Ardour/ardour/releases/latest: 404, so no prebuilt release assets on GitHub
- https://api.github.com/repos/Ardour/ardour/tags: numeric tags up to `9.10`, source only

Exclusions: all of the claim. Nothing was created, imported, exported or measured. No headless behaviour, session format, export fidelity or determinism statement follows from this fixture. The source-build route was not attempted (out of scope; large waf build with many dependencies).

## Plan, before running

Approved route (for a future run): obtain an official macOS arm64 Ardour build with a free, legitimately downloadable installer, mount the DMG, copy the app into `output/app/` (git-ignored, not `/Applications`), record URL, sha256, version, architecture and terms, and clear quarantine only on that copy if needed. No route currently meets this.

Input (for a future run): a 2.0 s mono 48 kHz 16-bit sine WAV generated with Python's standard `wave` module (a system library, not a catalogue tool), so `tools` lists only `ardour`.

Predeclared checks for any future run (not executed):
- Session created from the CLI with no GUI; the session directory exists and contains a `.ardour` file.
- The generated WAV is imported into the session and appears as a region.
- Headless export exits 0 and writes a WAV.
- Exported WAV: duration 2.000 s within 0.01 s, sample rate 48000 Hz, channels 1, peak amplitude within 0.01 of the source peak.
- Two reruns produce the same exported sample count and peak; byte identity recorded either way.
- Frame-count, alpha and shuffled-order checks do not apply (audio fixture).

Stop conditions: no free macOS build or no headless route (this case, stop as blocked); a required Gatekeeper or quarantine refusal that cannot be cleared on the copied app alone; any install beyond `output/` or any use of sudo.

Reproduce: `examples/ardour-headless-session/run.sh` exits 2 with the blocked message and does nothing else.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local, macOS 26.6 (Darwin 25.6.0), arm64.

- Versions: none run. Latest numbered upstream tag seen: `9.10`. Node, Playwright, Chromium and Python fixture code not used.
- Downloaded: nothing. Only HTML and API metadata were read (ardour.org, community.ardour.org, manual.ardour.org, GitHub API). No DMG, tarball, installer or source archive was fetched, and `output/app/` was not created.
- Homebrew: `brew info --cask ardour` reports no such cask; `brew search ardour` returns only `harbour`. The catalogue card has no install recipe to correct, so none was added.
- Official route: ardour.org's ready-to-run page is a payment flow (suggested one-time amount and subscription plans appear in the page state; a demo request form exists). The demo terms were not read in full and the form was not submitted, so no demo claim is made here. Source is free to download but is a large build (waf, many dependencies), which was declined.
- Result: blocked. `run.sh` exits 2.
- Deviations: the catalogue lists `ardour` as `candidate` with no install key; this run adds only the blocked evidence entry. The licence line was updated to GPL v2 per the ardour.org footer.
- Not established: whether any Ardour build runs headless on macOS, session creation from the CLI, WAV import, export fidelity, determinism, or the scripting API's stability.
- Revisit when: a free, legitimately downloadable macOS build appears on ardour.org or GitHub, the maintainer approves a payment or a source build (a source build would need separate approval and would not be evidence for a release binary), or the demo terms are confirmed to allow headless use.
