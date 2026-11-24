# Rhubarb Lip Sync turns generated speech into mouth-shape cues

## Intent and scope

VCR job and claim: `rhubarb-lip-sync` reads a 16 kHz mono WAV of generated English speech and writes
JSON mouth cues that (1) cover the whole audio duration, in order, with no gaps or overlaps;
(2) use only the documented shape set A to H and X; (3) assign X (rest) during the predeclared
silent gaps, for at least 80% of each gap; (4) assign non-X shapes during the speech spans, for at
least 75% of each span; (5) accept `--dialogFile` with the same guarantees; and (6) give identical
JSON bytes on two reruns, with and without the dialog file.

Tool: Rhubarb Lip Sync 1.14.0 (GitHub release tag v1.14.0, published 2025-04-03; latest tag per the
catalogue card), native CLI, macOS x86_64 build run on arm64 under Rosetta 2. Recogniser:
`pocketSphinx` (English, the default). Extended shapes: `--extendedShapes GHX` (the default).

Explicit exclusions:
- No lip-sync quality claim. The claim is structural and deterministic: cues tile the timeline and
  respect the silence and speech boundaries. It says nothing about whether the shapes look right
  on a character, or whether a viseme sequence matches what a viewer perceives.
- Silence and speech boundaries come from how the clips were built (exact sample counts), not from
  a human-labelled reference. Speech spans are whole phrase clips, which include their own
  near-silent edges, which is why the speech threshold is 75% rather than 100%.
- English only (`pocketSphinx`). The `phonetic` recogniser and other languages are not tested.
- Single generated voice (macOS `say`, Samantha), one short fixed script, no real recordings,
  no noise, no music, no accents.
- Only the JSON export is tested. TSV, XML, `dat` (Moho/OpenToonz) and the After Effects, Vegas,
  Spine and other integrations are not tested. No output format conversion.
- Only the default extended shape set (`GHX`) and the default `pocketSphinx` path on this machine.
- The `--machineReadable` status stream and `--datUsePrestonBlair` are not tested.
- Animation quality, timing of a rig, and any pillar judgement are not claimed. Lip-sync pacing and
  sync rules are owned by the sound pillar (`SOUND-SYNC-LEAD`, `SOUND-SYNC-LAG`,
  `SOUND-SFX-PEAK-ALIGN`); this fixture cites them and does not test them.

Tool documentation and licence sources, checked 2026-11-24:
- https://github.com/DanielSWolf/rhubarb-lip-sync (README.adoc in the release archive: output
  formats, `--dialogFile`, `--extendedShapes`, mouth shape definitions).
- Licence: MIT for the project, per `LICENSE.md` in the release archive, with bundled third-party
  components under their own permissive licences (catalogue card). Dependency licences are not
  re-checked here; the fixture does not redistribute the binary.
- Generated audio: macOS `say` output, used locally only, not redistributed.

Environment: macOS 26 (Darwin 25.6.0), Apple M3 Pro (arm64), Rosetta 2 installed; the Rhubarb
binary is x86_64 and runs under Rosetta transparently. No GPU use.

Input: generated, not recorded. Three phrases from `phrases.txt` are spoken by macOS `say`
(voice Samantha), converted to 16 kHz mono PCM WAV by ffmpeg, then concatenated by `make_input.py`
with exact-sample silence: a 0.50 s lead-in, 1.00 s after phrase 1, 1.00 s after phrase 2 and a
1.00 s tail. The reference (silent gaps and speech spans, in seconds) is written from the sample
counts, not from an energy detector. The rights position is trivial: the text is written here and
the audio is synthesised locally.

Dependencies, installation plan, permissions, network and side effects:
- Rhubarb 1.14.0 macOS release archive, downloaded once from
  `https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.14.0/Rhubarb-Lip-Sync-1.14.0-macOS.zip`
  (size 86870942 bytes, matching the GitHub release listing). The archive sha256 is
  `f991deacac6c973a14a4431a16a58b842f436531e120cfaea142c87c0d3ab4c5` and the extracted binary
  `rhubarb` has sha256 `93fa4a16ae1cc88a89d59743057521407843fc7139e23808c9e6587c6cc946d3`. The
  archive and its extraction live in `output/bin/` (git-ignored). Gatekeeper did not quarantine
  the download (curl, no `com.apple.quarantine` attribute), so no `xattr` change was needed.
- Existing tools: `ffmpeg` and `ffprobe` (Homebrew, `ffmpeg-ffprobe` in the catalogue), macOS `say`
  and Python 3 standard library (`/usr/bin/python3`, 3.9.6). No Python packages, no venv.
- Network: only the one release download. The run itself is offline.
- No sox use in this fixture.

Selected workspace, generated output and cleanup: `examples/rhubarb-lip-sync-cues/output/`
(git-ignored). `run.sh` clears only its own generated files there (`phrases/`, `*.wav`, `*.json`,
`*.log`, `*.txt`), never `output/bin/`. The binary is kept for reruns; delete `output/bin/` to remove it.

## Plan, before running

Commands (run from `examples/rhubarb-lip-sync-cues/`):
1. `say -v Samantha -o output/phrases/NN.aiff "<phrase>"` for each line of `phrases.txt`, then
   `ffmpeg -ar 16000 -ac 1 -c:a pcm_s16le` to `NN.wav`.
2. `python3 -I make_input.py phrases.txt output/phrases output/input.wav output/reference.json output/dialog.txt`.
3. `ffprobe -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration -of json output/input.wav`.
4. Rhubarb, two reruns in each mode, all with `-q -r pocketSphinx --extendedShapes GHX -f json`:
   - plain: `-o output/plain-run{1,2}.json output/input.wav`
   - dialog: `-d output/dialog.txt -o output/dialog-run{1,2}.json output/input.wav`
5. `python3 -I check.py output` evaluates every predeclared check below and writes `output/checks.json`.

Predeclared checks (any failure makes the run fail):
- C1 Exit status 0 for all four Rhubarb runs; each output parses as JSON with a `metadata.duration`
  and a non-empty `mouthCues` list.
- C2 Duration: `|metadata.duration - ffprobe duration| <= 0.011` s (Rhubarb truncates to 0.01 s).
  The ffprobe duration must also match the reference `durationS` within 0.001 s.
- C3 Coverage and order: the first cue starts at 0.00; every cue has `start < end`; starts are
  strictly increasing; each cue's `end` equals the next cue's `start` within 1e-6 (no gaps, no
  overlaps); the last cue's `end` equals `metadata.duration` within 1e-6.
- C4 Shape set: every `value` is one of `A B C D E F G H X`. No other value appears.
- C5 Silence: for each reference silent gap, the fraction of its length covered by X cues is at
  least 0.80. Gaps: lead-in [0.00, 0.50], [after phrase 1], [after phrase 2], tail. Applies to the
  plain run and the dialog run.
- C6 Speech: for each reference speech span (the three phrase clips), the fraction covered by
  non-X cues is at least 0.75. Applies to the plain run and the dialog run.
- C7 Determinism: the two plain runs are byte-identical (sha256), and the two dialog runs are
  byte-identical.
- C8 Dialog file: the dialog runs pass C1 to C6 as well. Exit status 0 with `-d` supplied.

Normalisation for `expected/`: `metadata.soundFile` is an absolute path on the machine and is
replaced by its basename in the recorded `expected/cues-*.json` copies. Nothing else is altered.

Expected artifacts: `expected/checks.json` (the measured numbers and the pass booleans, including
the sha256 of the two plain runs and the two dialog runs, which are deterministic on this
machine), `expected/cues-plain.json` and `expected/cues-dialog.json`. No media is committed.

Intended consumer and handoff: a 2D mouth-shape driver that reads `mouthCues` in JSON. Native
asset checks are not applicable; there is no rendered output.

Delivery constraints: none. Output is a small text file.

Expected failure modes and stop conditions:
- Rhubarb exits non-zero, or emits invalid JSON: fail (no retry with other options).
- Cues are not contiguous (gap or overlap) or do not reach the duration: fail.
- Any shape outside `A-H,X`: fail.
- Gap or speech fraction below its threshold: fail for that check. A failure in only the dialog
  runs makes the result `partial`.
- Reruns differ: fail the determinism claim. Rhubarb's PocketSphinx path is expected to be
  deterministic on a fixed binary and input.
- If `say`, `ffmpeg` or the Rhubarb binary are unavailable, the run is `blocked`, not `fail`.

Reproduction: `examples/rhubarb-lip-sync-cues/run.sh --record` then `examples/rhubarb-lip-sync-cues/run.sh`.
Inspect output with `cat output/plain-run1.json` and the timeline image described below.

Pacing and lip-sync pillar IDs cited, not tested: `SOUND-SYNC-LEAD`, `SOUND-SYNC-LAG`,
`SOUND-SFX-PEAK-ALIGN`.

## Observation, after running

Result: **fail**. Rhubarb segfaults on every run that reaches speech recognition, so no mouth cues
were produced and none of C2 to C8 could be evaluated. `expected/` is not kept, so this entry's
scope starts "Fixture-reported:" and the tool record stays `not-validated`.

Executor and date: Claude agent (claude-haiku-5-5), 2026-11-24, on hostname
`Conors-MacBook-Pro-2.local`.

Versions:
- Rhubarb Lip Sync 1.14.0 (`rhubarb --version`), x86_64 macOS build from the v1.14.0 release, binary sha256
  `93fa4a16ae1cc88a89d59743057521407843fc7139e23808c9e6587c6cc946d3`, run on Apple M3 Pro (arm64) under Rosetta 2.
- PocketSphinx and phonetic recognisers as bundled in the archive (no separate version reported).
- ffmpeg and ffprobe 9.0.2 (Homebrew). macOS `say` (Samantha).
- Node v22.19.0 (pnpm 10.29.2). Python 3.9.6 (`/usr/bin/python3`, stdlib only).
- Playwright and Chromium: not used.
- macOS Darwin 25.6.0.

Commands and exit status:
- `run.sh --record`: exit 139 (SIGSEGV) at the first Rhubarb run (`plain-run1`). Same for `run.sh`
  without `--record` (exit 139). The say, ffmpeg, make_input.py and ffprobe steps all succeeded.
- `rhubarb --version`: exit 0, prints `Rhubarb Lip Sync version 1.14.0`.
- Bundled sample `tests/resources/sine-triangle-int16-ffmpeg.wav` (sine tone): exit 0. It never reached
  speech recognition (no voice activity found), so it says nothing about the recogniser.
- Crash variants, all exit 139: default recogniser; `-r phonetic`; `--threads 1`; a 2 s excerpt of the
  generated speech; a 16 kHz re-encode of the generated WAV; the release directory as cwd; and an
  explicit `arch -x86_64` launch. Each one stops at `Speech recognition using 1 threads -- start` (trace
  log) or at the first progress tick.

Diagnosis (partial, not a root cause): the macOS crash report
(`~/Library/Logs/DiagnosticReports/rhubarb-2026-11-24-102535.ips`) faults in PocketSphinx `ps_init`
during `createDecoder`, inside PocketSphinx's log callback (`sphinxLogCallback` → `vsnprintf`) while it
formats an error message. The callback crashes before the message is printed, so the underlying
initialisation error is hidden. The model files under `res/sphinx/` are present and their sizes match
the archive listing. Whether the cause is the Rosetta-translated x86_64 build, macOS 26, or the
archive's model set is not established; no arm64 build exists to separate these.

Observed output, checks and measurements: none. No `plain-run*.json` or `dialog-run*.json` was written
(the runs crashed before writing). The reference timeline written by `make_input.py` is:
durationS 9.124875; silent gaps [0.000, 0.500], [2.024563, 3.024563], [5.962375, 6.962375],
[8.124875, 9.124875]; speech spans [0.500, 2.024563], [3.024563, 5.962375], [6.962375, 8.124875].
`input-ffprobe.json` agrees with it (format duration 9.12 s, 16000 Hz, 1 channel, pcm_s16le).

Inspection of the deliverable: nothing to inspect. There are no mouth cues and no timeline image.

Pass / partial / fail / blocked: fail. The tool runs and reports its version, but it cannot process
speech input on this machine, so the claim's central step (speech to cues) did not happen. The dialog
path (`--dialogFile`) was not reached, so C8 was not tested. Not `blocked`: the binary is present,
Rosetta is present, and the failure is inside the tool.

Deviations and limitations: the predeclared plan (exit non-zero means fail) was followed as written.
Nothing was edited to avoid the crash. No alternative recogniser or other tool was substituted.

What this result does and does not establish: on this machine, with this archive, Rhubarb 1.14.0 does
not produce mouth cues from generated English speech. It does not establish that the tool is broken
elsewhere (for example on an x86_64 Mac, Windows or Linux), nor anything about cue quality.

Reviewer, decision and follow-up: a reviewer should decide whether the crash is worth an upstream
report (upstream issues were not searched in this run). A rerun is worth doing on a different macOS
or with a native build if one appears. Revisit this record if a newer release or a corrected
recogniser is adopted.
