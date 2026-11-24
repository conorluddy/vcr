# ttconv caption conversion fixture

## Intent and scope

VCR job and claim: ttconv converts a hand-written SRT file of three cues (one
cue with two lines, one cue with italics) to WebVTT and to TTML (the IMSC-style
writer), and the converted files keep the predeclared cue count, begin and end
times to the millisecond, text, and line breaks. The TTML output is well-formed
XML in the TTML namespace. Converting the WebVTT back to SRT round-trips the
timings.

Tool: ttconv, PyPI package `ttconv`, pinned `1.2.3` in `requirements.txt`, which
provides the `tt` command. Its only documented role here is format conversion.

Explicit exclusions:
- Not tested: STL, SCC, and any other format ttconv reads or writes.
- Not tested: IMSC profile conformance. The TTML output is checked for well-formed
  XML in the TTML namespace only. No IMSC 1.1 profile schema or validator is run,
  and no `ttp:profile` declaration is asserted.
- Not tested: styling, regions, positioning, alignment tags, SRT `{\an}` tags,
  or the SRT `{b}`/`{i}` extended forms. The italic cue uses `<i>` with
  `extended_tags` enabled in the SRT reader.
- Not tested: visual rendering, burn-in, or player behaviour of any output.
- Not tested: caption quality. No reading-speed, line-length or line-count
  thresholds are checked, even though TYPO-CAPTION-CPS, TYPO-CAPTION-DURATION
  and TYPO-CAPTION-LINES exist in `references/typography/rules.json`. This fixture
  only records what the converter does with the cues it is given.
- Not tested: accessibility. No ACCESS-* rule exists in the references to cite.
- Determinism is observed on this machine only, as a second conversion whose
  WebVTT is byte-compared. It is not a cross-machine claim.

Licence and documentation sources, checked 2026-11-24:
- https://github.com/sandflow/ttconv (project home; the repository is the
  licence source).
- PyPI `ttconv` 1.2.3 metadata: classifier "OSI Approved :: BSD License" and
  a `LICENSE.txt` in the installed dist-info, copyright Sandflow Consulting LLC, 2020.
  The licence text is BSD (the BSD-3-Clause wording is the one to verify in
  the repository before redistribution; this fixture redistributes nothing).
- Installed release is 1.2.3 (PyPI's latest on 2026-11-24). Its release date
  was not checked on this run.

Environment: macOS (Darwin 25.6.0), arm64, Python 3.12.2 from pyenv. No browser,
GPU, or network use at run time (network is needed only for the pip install).

Input: `input/captions.srt`, hand-written for this fixture (three cues, UTF-8, LF
line endings, no media). Its text is original and written for this fixture:

```
1  00:00:01,000 --> 00:00:02,500  Hello, world.
2  00:00:03,120 --> 00:00:05,040  First line of the caption / second line here
3  00:00:05,500 --> 00:00:07,250  This is <i>italic</i> text.
```

Dependencies and installation plan (approved for this run, into the venv only):
- `python3 -m venv examples/ttconv-caption-convert/output/venv`
- `output/venv/bin/pip install -r requirements.txt` (pins `ttconv==1.2.3`; the
  package has no runtime dependencies beyond the standard library).
- Nothing system-wide, no global package, no shell change. The venv lives under
  `output/` (git-ignored) and is not a `.venv` inside the example, so the
  repository scans do not read it.
- Cleanup: remove `examples/ttconv-caption-convert/output`.

Selected workspace and output: `examples/ttconv-caption-convert/output/`
(git-ignored): converted `captions.vtt`, `captions.ttml`, `roundtrip.srt`, a
rerun `rerun/captions.vtt`, logs, `checks.json`, `dependencies.txt`.
Committed: this README, `example.json`, `requirements.txt`, `run.sh`, `check.py`,
`input/captions.srt`, `expected/checks.json`. No media is committed.

## Plan, before running

Commands (after the venv install above):
```
examples/ttconv-caption-convert/run.sh            # convert, round-trip, check, diff expected/
examples/ttconv-caption-convert/run.sh --record   # only after a deliberate change
```

Conversions (the SRT reader needs `extended_tags` for `<i>`):
```
tt convert -i input/captions.srt -o output/captions.vtt   --config '{"srt_reader": {"extended_tags": true}}'
tt convert -i input/captions.srt -o output/captions.ttml  --config '{"srt_reader": {"extended_tags": true}}'
tt convert -i output/captions.vtt -o output/roundtrip.srt
tt convert -i input/captions.srt -o output/rerun/captions.vtt  --config '{"srt_reader": {"extended_tags": true}}'
```

Predeclared values (constants in `check.py`, not read back from the output):
- Cues `(begin ms, end ms)`: `(1000, 2500)`, `(3120, 5040)`, `(5500, 7250)`.
- Lines: `["Hello, world."]`, `["First line of the caption", "second line here"]`,
  `["This is <i>italic</i> text."]` in WebVTT; the same text without markup
  and italic span `italic` in TTML.

Predeclared gating checks:
1. `vtt_cue_count`: three cues.
2. `vtt_timings_ms`: each cue's begin and end, to the millisecond, as above.
3. `vtt_text_lines`: the lines of each cue as above.
4. `vtt_line_break_preserved`: cue 2 has two lines.
5. `vtt_italic_markup`: cue 3 contains `<i>italic</i>`.
6. `ttml_well_formed_xml`: `xml.etree` parses the file.
7. `ttml_namespace`: root element is `{http://www.w3.org/ns/ttml}tt`.
8. `ttml_cue_count`, `ttml_timings_ms`, `ttml_text_lines`: as for WebVTT, read from `p`
   `begin`/`end` attributes and text, with `<br/>` as a line break.
9. `ttml_line_break_preserved`: the second paragraph has two lines (one `br`).
10. `ttml_italic_span`: a span with `tts:fontStyle="italic"` whose text is `italic`
    in cue 3.
11. `roundtrip_srt_cue_count`, `roundtrip_srt_timings_ms`, `roundtrip_srt_text_lines`:
    WebVTT converted back to SRT keeps the same cues, to the millisecond.

12. `rerun_vtt_identical` (gating): a second conversion gives a byte-identical WebVTT.
    It is observed on this machine only.

Recorded but not gating: SHA-256 of each output file.

Expected failure modes and stop conditions:
- Install failure, or `tt` not found: stop, keep logs, report `blocked`.
- A non-zero exit from any conversion: stop; `fail`.
- Any gating check failing: stop; `fail`. A failure in only the TTML checks (for
  example the italic span) would be `partial`, with the exact check named in the scope.
  The baseline is not rewritten to hide a failure.
- Italic handling without `extended_tags` is not a claim; it is not tested.

Inspection: `output/captions.vtt`, `output/captions.ttml` and `output/roundtrip.srt`
are read by eye after the record run. There are no frames, so there is no contact sheet.

## Observation, after running

Executed 2026-11-24 on Conors-MacBook-Pro-2.local (macOS, Darwin 25.6.0, arm64),
from `examples/ttconv-caption-convert`. Versions: ttconv 1.2.3 (PyPI, pinned in
`requirements.txt`); Python 3.12.2 (pyenv) in `output/venv`. pip 24.0 in the venv.
Playwright, Chromium and Node are not used. Installed set (`output/dependencies.txt`):
`ttconv==1.2.3` only, no other packages.

Installed exactly: `output/venv` created with `python3 -m venv`, then
`pip install -r requirements.txt`. Nothing outside `output/venv` and the example's
`output/` directory was written. The licence file is at
`output/venv/lib/python3.12/site-packages/ttconv-1.2.3.dist-info/licenses/LICENSE.txt`.

Commands: `./run.sh --record` then `./run.sh`. The second run printed
`ttconv-caption-convert: OK`. The record run exited 0 after its gating checks passed.

Measured (`output/checks.json`, identical to `expected/checks.json`): all 16 gating
checks true. Output hashes (SHA-256):
- `captions.vtt` 5c2e980e29643128a5715efe1fb1990a7c29bc3d178422837ec420ea335ba6cf
- `captions.ttml` de2c591569c18191b1ca8aa185e742ccc258cd5954561e935b5904d8abfb7d65
- `roundtrip.srt` 69a3ec7b595552e652e8788dc818e2d2ffcfc5d119c7b81620fe14a058c42f84

Inspection (by reading the files, not a render; there are no frames, so no contact
sheet). WebVTT: `WEBVTT`, three cues at `00:00:01.000 --> 00:00:02.500`,
`00:00:03.120 --> 00:00:05.040`, `00:00:05.500 --> 00:00:07.250`; cue 2 is two lines;
cue 3 is `This is <i>italic</i> text.` TTML: `<tt xmlns="http://www.w3.org/ns/ttml">`,
three `p` with matching begin/end, one `br` in cue 2, and a `tts:fontStyle="italic"`
span around `italic`. Round-trip SRT: same three cues, same timings, same two-line
cue 2, same `<i>` in cue 3. The output reads correctly and nothing is clipped.

Deviations and limitations:
- The SRT reader needs `extended_tags` (config `srt_reader.extended_tags`) for `<i>`.
  The fixture passes it in `run.sh`. Without it the italic tag is not part of this claim.
- The TTML output carries `xml:lang=""` and no `ttp:profile`. This is recorded as
  observed. The claim is limited to well-formed XML in the TTML namespace, not IMSC
  profile conformance.
- The `tt` command logs a progress bar to stderr; it is captured in `output/*.log`.
- A first record run failed on my own checker bug: it compared TTML text (with `<i>`
  tags) against the markup-free text that TTML carries. The check was corrected to
  strip the italic markup from the expected lines for the TTML comparison. The
  predeclared values and the cue timings were not changed. No `expected/` file was
  written by the failing run, because `run.sh` only copies after the checks pass.
- Determinism (`rerun_vtt_identical`) is observed on this machine only.

What this result does and does not establish: ttconv 1.2.3 converts this three-cue
SRT to WebVTT and to TTML with the predeclared cue count, millisecond timings, text,
line breaks and italic span, produces well-formed TTML in the TTML namespace, and
round-trips the timings through WebVTT back to SRT, on this machine. It does not
establish IMSC profile conformance, other formats (STL, SCC), styling or regions,
rendering or player behaviour, caption quality, or cross-platform byte identity.

Reviewer, follow-up and revisit triggers: revisit on any ttconv release after 1.2.3
(the card's release recency was not established), any change to the SRT reader's
extended-tag handling, or a need for IMSC profile validation (which would be a new
fixture with its own validator).

Cleanup: remove `examples/ttconv-caption-convert/output` (venv, logs, converted files).
