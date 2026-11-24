# sonic-annotator onsets and pitch on generated audio

## Intent and scope

- Tool ID and version/build: `sonic-annotator` 1.7.0 (official macOS universal binary, arm64 slice used; `sonic-annotator -v` prints `1.7`). Plugin host: Vamp plugin libraries `qm-vamp-plugins.dylib` (QM Vamp Plugins, arm64) and `vamp-aubio.dylib` (Aubio Vamp plugins, arm64), both from Vamp Plugin Pack installer 2.0 (installer bundle 2.0.0).
- VCR job and exact claim being tested: "sonic-annotator with the named Vamp onset transform `vamp:qm-vamp-plugins:qm-onsetdetector:onsets` finds the clicks of a generated 120 BPM click track within ±25 ms with no misses or extras; with the named pitch transform `vamp:vamp-aubio:aubiopitch:frequency` the median pitch of a 440 Hz sine is within 10 cents; `-l` lists both transform ids; `-w csv` and `-w json` (JAMS) write their output; reruns are byte-identical."
- Explicit exclusions:
  - Only synthetic input: one click track and one pure sine. No recorded or musical audio, no swing, no noise, no polyphony.
  - No other transforms: no tempo transform (`qm-tempotracker`, `aubiotempo`), no other onset transform (`aubioonset`, `qm-barbeattracker`), no notes, segmentation, key or similarity transforms.
  - No JSON-LD: sonic-annotator 1.7 has no JSON-LD writer. The `json` writer emits JAMS JSON, which is what is checked. The `rdf` writer (Turtle) is not run.
  - Default transform parameters from `-s` skeleton files; no parameter tuning. The `-d` shortcut is not used.
  - No summary (`-S`), segment or per-file batch options beyond one file per transform.
  - Only macOS arm64 under Rosetta-free native execution. The x86_64 slice is not exercised.
  - Vamp plugin libraries were taken from the pack installer's embedded images, not by running the installer GUI, so no installer side effects (no writes to `~/Library`).
  - No tool-to-tool edges: no FFmpeg mux or encode of the output, no librosa or aubio comparison.
  - Sound-design and pacing quality are not judged. Beat-to-frame alignment is not checked.
- Tool documentation and licence sources, checked 2026-11-24:
  - `https://www.vamp-plugins.org/sonic-annotator/` and the bundled `README.md` (1.7): sonic-annotator is GPL v2 (`COPYING` in the release tarball).
  - `https://www.vamp-plugins.org/pack.html`: the pack says its libraries are open source under BSD/MIT, GPL or AGPL, and the pack as a whole may be redistributed under AGPL v3. Per-library, from the embedded descriptions: `vamp-aubio.n3` declares `dc:rights "GPL"`. `qm-vamp-plugins.n3` declares only QMUL copyright and no licence, so its licence is not verified here and needs review before any redistribution.
  - No binaries or plugin libraries are committed. Everything lives under `output/` (git-ignored).
- Environment: macOS 26.6 (Darwin 25.6.0), arm64 (Apple M3, 18 GB), Node 22.19.0, FFmpeg 9.0.2 from Homebrew. No GPU use. Rosetta is installed but not used.
- Input: generated in `run.sh` by FFmpeg `aevalsrc` from constants written in the script. Origin: this repository. Rights: none. Hashes of the generated WAVs are not compared; reruns are compared byte for byte instead.
- Dependencies, installation plan, permissions, network and expected side effects:
  - Installed for this backfill, as approved: no Homebrew formula. `fetch-tools.sh` downloads two pinned artefacts into `output/` and verifies SHA-256 before use:
    - `https://github.com/sonic-visualiser/sonic-annotator/releases/download/sonic-annotator-1.7/sonic-annotator-1.7.0-macos.tar.gz`, SHA-256 `cb54f46af0f6c16b8274998d025019021b3b6c50410b8a8e2024d0aa7e65b040`, size 10638233 bytes, published 2025-05-28.
    - `https://github.com/vamp-plugins/vamp-plugin-pack/releases/download/v2.0/Vamp.Plugin.Pack.Installer-2.0.dmg`, SHA-256 `60e2569ab064dbaf9ca8a4c3cf8465298b91ea3be1b34c5395d45c1ca4c53f10`, size 48745081 bytes. The dmg is mounted read-only, the arm64 `qm-vamp-plugins` and `vamp-aubio` libraries and their `.n3` descriptions are copied out of the installer binary by `extract-vamp-plugins.py`, then it is detached. The installer is not run.
  - No `brew`, no `npm`, no `pnpm`, no system-wide install. `ffmpeg` and `ffprobe` are the existing Homebrew install.
  - Quarantine: the files come from `curl`, which does not set `com.apple.quarantine`, so no `xattr` change was needed. The tarball's binary carries `com.apple.provenance` only.
  - No network access during `run.sh`.
- Selected workspace, generated output and cleanup paths: `examples/sonic-annotator-features/output/` (ignored). `run.sh` clears `output/run-*`, `output/transforms`, `output/inputs` and `output/summary.json` on each run; it keeps `output/bin` and `output/vamp`. `expected/summary.json` is the only retained result.

## Plan, before running

- Exact commands and versions:
  - `./fetch-tools.sh` (verifies SHA-256 of both downloads before use).
  - `ffmpeg -f lavfi -i "aevalsrc='<click expr>':s=44100:d=10" -ac 1 -c:a pcm_s16le output/inputs/clicks.wav`: 20 clicks at 0.25 + 0.5k s, each a 50 ms 1 kHz sine with exponential decay.
  - `ffmpeg -f lavfi -i "aevalsrc='0.5*sin(2*PI*440*t)':s=44100:d=4" -ac 1 -c:a pcm_s16le output/inputs/sine440.wav`.
  - `output/bin/sonic-annotator -s vamp:qm-vamp-plugins:qm-onsetdetector:onsets > output/transforms/onsets.n3` and the same for `vamp:vamp-aubio:aubiopitch:frequency` into `output/transforms/pitch.n3`.
  - `VAMP_PATH=output/vamp output/bin/sonic-annotator -l`.
  - `VAMP_PATH=output/vamp output/bin/sonic-annotator -t output/transforms/onsets.n3 output/inputs/clicks.wav -w csv --csv-stdout` and `-w json --json-stdout` (same for pitch on `sine440.wav`), into `output/run-a/` and `output/run-b/`.
- Expected artifacts and predeclared checks (all must pass for `pass`):
  - C1 inputs: both WAVs are 44100 Hz mono; durations 10 s and 4 s within ±0.01 s.
  - C2 listing: `-l` exits 0 and its output contains both exact ids `vamp:qm-vamp-plugins:qm-onsetdetector:onsets` and `vamp:vamp-aubio:aubiopitch:frequency`.
  - C3 onsets: the truth is 20 onsets at 0.25 + 0.5k s (k = 0..19), read from the constants, not from the output. Greedy one-to-one match; every truth onset matched within ±25 ms; 0 misses; 0 extras. The first CSV field of each row is the time in seconds.
  - C4 pitch: over the window 0.5 s to 3.5 s, at least 5 frames with a positive value; median of those values within 10 cents of 440 Hz.
  - C5 writers: `csv` and `json` output exist and are non-empty for both transforms; the JSON parses (`jq`), and the onset JSON has at least one annotation with at least 20 data observations.
  - C6 reruns: `output/run-a` and `output/run-b` are byte-identical for every written file.
  - Stop conditions: any non-zero exit from `sonic-annotator`; any missing transform id in `-l`; a plugin library that fails to load; SHA-256 mismatch on a download.
  - Outcome rules: all checks pass = `pass`; some fail = `partial` (report which); the tool or plugin fails to run = `fail`.
  - `expected/summary.json` holds the stable observed values (counts, match error, pitch median in cents, check booleans), not media or hashes of binary output.
  - Shuffled-order and alpha/frame checks from the browser template do not apply: nothing is seeked and no frames are rendered.
- Intended consumer and handoff settings: none. This is an analysis tool; output is CSV and JAMS JSON for a downstream reader, and the handoff is not tested.
- Delivery constraints and units: not applicable. Times are in seconds; pitch in Hz and cents.
- Expected failure modes and stop conditions:
  - aubiopitch output is not byte-stable across processes. The aubio example (`examples/aubio-onsets-pitch`) saw this for `aubiopitch`; C6 may fail on the pitch files while C3 and C4 pass. That is reported as `partial`, not hidden.
  - QM onset detector may add extra onsets on the decay of each click; C3 then fails.
  - Gatekeeper or a missing `arm64` slice would stop the run.
- Reproduction instructions: `examples/sonic-annotator-features/fetch-tools.sh` then `examples/sonic-annotator-features/run.sh` (`--record` to rewrite `expected/summary.json`). Inspect with `cat output/summary.json` and the CSV/JSON files in `output/run-a/`.

## Observation, after running

- Date and executor: 2026-11-24, Claude agent in worktree `agent-a38d84256582ecacb`, on `Conors-MacBook-Pro-2.local`.
- Versions:
  - sonic-annotator 1.7.0 (macOS tarball; `sonic-annotator -v` prints `1.7`), universal binary, arm64 slice run natively. SHA-256 of the extracted binary `c34425592722fbe4727d3d79cd84272d5e398c418ccb46586cd8ef7780aaa4fb`.
  - Vamp Plugin Pack installer 2.0 (bundle 2.0.0). Extracted arm64 libraries: `qm-vamp-plugins.dylib` SHA-256 `ab72b941412d27ba0b9ec88d4b5cdd170dd621c1db45570b0038e3362a7b34bb`; `vamp-aubio.dylib` SHA-256 `448b70bdfcb895e2b73731beb81407f69ccf33109bbcaa1fca2199bb4934a86f`. No version string was found in the libraries, so the pack version is the identifier.
  - Plugin description files: `qm-vamp-plugins.n3` SHA-256 `0f06a5b73fd13188da17f0f34ed281dde974f0642053cf0dbfc81eea4a46c09f`; `vamp-aubio.n3` SHA-256 `84d74104702e989d3478e9a11505074c04f5b20ea179f1413f2c3fe52551fef6`.
  - Download hashes checked by `fetch-tools.sh`: tarball `cb54f46a…b040` (matches), dmg `60e2569a…f10` (matches).
  - FFmpeg and ffprobe 9.0.2 (Homebrew). Node v22.19.0 (not used by the fixture). Playwright and Chromium: not applicable (no browser). ImageMagick `magick` was used only to draw the inspection images, not by `run.sh`.
- Commands: `./fetch-tools.sh`, then `./run.sh --record` (printed "all predeclared checks pass: true"), then `./run.sh` (printed `sonic-annotator-features: OK`, exit 0). The second run is a separate process, so the stable values also matched `expected/summary.json` across processes.
- Observed results (`output/summary.json`):
  - C1 inputs: both WAVs 44100 Hz mono; durations 10.000 s and 4.000 s. Pass.
  - C2 listing: `-l` contains `vamp:qm-vamp-plugins:qm-onsetdetector:onsets` and `vamp:vamp-aubio:aubiopitch:frequency`. Pass.
  - C3 onsets: 20 detections for 20 clicks; 20 matched, 0 misses, 0 extras. Offsets from the truth run from −13.9 ms to −24.7 ms (all early; max error 24.739 ms against a 25 ms tolerance). Pass, with a margin of 0.26 ms.
  - C4 pitch: 258 voiced frames in the 0.5 s to 3.5 s window; median 440.8 Hz (unrounded about 440.79), centsError 3.0 against 440 Hz. Pass.
  - C5 writers: CSV for each transform non-empty (onsets 20 rows, pitch 344 rows); JAMS onset file has 20 observations; JAMS pitch file has 344 observations. Pass.
  - C6 reruns: `run-a` and `run-b` byte-identical for `onsets.csv`, `pitch.csv`, and both JAMS files. Pass.
  - Overall: all checks pass, `result` = pass.
- Inspection (done by reading the images, not by hash): `output/contact.png` stacks `inspect-click-wave-onsets.png` (the click waveform with the 20 detected onsets as red markers) above `inspect-sine-pitch.png` (every voiced frame plotted as a dot, with a red 440 Hz reference line). Seen: 20 red markers each sit on one click burst, with no extra markers and no missing bursts. The pitch dots form one flat track about 0.8 Hz (3 cents) above the reference line, plus two start-up outliers near t = 0 (449 Hz), which the window excludes. The picture is consistent with the numbers.
- Deviations from the plan, found during setup (all before the recorded run, none changes a predeclared tolerance):
  - No `json` writer exists in sonic-annotator 1.7. The writer list is `audiodb, csv, default, jams, lab, midi, rdf`, so C5 checks the `jams` writer (JAMS JSON, not JSON-LD). The plan's `-w json --json-stdout` was wrong and is not what `run.sh` runs.
  - CSV uses `--csv-omit-filename` (the plan's bare `--csv-stdout` keeps a filename column on the first row only).
  - The `jams` writer failed until the plugin description files were present. The pack's dylibs carry no RDF, so `fetch-tools.sh` also copies `qm-vamp-plugins.n3` and `vamp-aubio.n3` from the installer's embedded text. The Turtle blocks lack their `vamp:` and `plugbase:` prefix declarations, which the extractor restores (`extract-vamp-plugins.py`). This is a repair to the pack extraction, not a change to any plugin's output.
  - A transform file generated before the description was available defines no transforms. `run.sh` regenerates the `.n3` skeletons each run.
- What this result does and does not establish:
  - Establishes: on macOS arm64 with sonic-annotator 1.7.0 and the QM onset and aubio pitch transforms from the Vamp pack 2.0 libraries, the onset transform found the clicks of a generated 120 BPM track within the predeclared tolerance, the pitch transform reported 440 Hz within 10 cents, `-l` lists the two ids, CSV and JAMS are written, and both transforms rerun byte-identically in this environment.
  - Does not establish: JSON-LD or RDF output; any tempo transform; other onset transforms or parameter settings; sounds other than clean synthetic clicks and one sine; the x86_64 slice; other macOS versions; Linux or Windows; the onset margin on real percussion (the 24.7 ms worst case is close to the 25 ms tolerance, and the errors are systematic and early, so a different click shape could push them past it); quality of any musical analysis.
- Reviewer, decision, follow-up and invalidation triggers: revisit if the Vamp pack changes its plugin libraries or description files, if sonic-annotator is upgraded, if the QM onset detector's timing changes, or if the onset errors exceed 25 ms on the same input. Follow-up: a JSON-LD check would need a writer that sonic-annotator 1.7 does not have.
