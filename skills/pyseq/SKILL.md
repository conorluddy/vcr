---
name: pyseq
description: List numbered frame files as sequences with ranges and missing frames using pyseq (Python or the lss CLI) in a venv. Load once pyseq has been chosen to check a capture folder for gaps before encoding; it reads names, not pixels.
---

# pyseq

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this file; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Report which frames are missing from a folder such as `frame.0001.png`, before FFmpeg encodes it.
- Names only: it cannot tell a corrupt or blank frame from a good one. Encoding is FFmpeg; reading pixels is OpenImageIO. For one known range, a shell loop is enough.
- VCR evidence is partial: pyseq 0.9.3, Python 3.12, macOS arm64. Gaps and ranges are right. Two failures are recorded below.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| `pyseq.get_sequences(path)`, `Sequence.missing()`, `start()`, `end()`, `length()`, `format()` | [README](https://github.com/rsgalloway/pyseq) | tested |
| `lss` listing and `-f` format directives | `lss --help` | default line tested |
| `stree`, `sfind`, `sdiff`, `sstat`, `scopy`, `smv`, `srm` | README | untested |

## Install and doctor
```sh
python3.12 -m venv output/venv && output/venv/bin/pip install pyseq==0.9.3
```
Project-local venv; `vcr doctor` does not probe it. Never install it globally.

## Smoke test
```sh
cd examples/pyseq-frame-gaps && ./run.sh
# expect: KNOWN FAIL: predeclared check(s) failed, recorded in expected/metrics.json: two_sequences_split_and_text_ignored mixed_padding_reports_no_false_gaps
```
`run.sh` builds its own venv, runs `check.py` twice and diffs against `expected/metrics.json`. It exits 0.

## Recipe
```py
import pyseq
for s in pyseq.get_sequences("output/frames"):
    print(s.format("%h%p%t"), s.format("%R"), s.missing())
# frame.%04d.png [1-3, 6-7, 10] [4, 5, 8, 9]
```
A sequence name with no zero padding (1001 to 1005) is `shot.%d.exr`, not `shot.%04d.exr`.

## Troubleshooting
- A non-frame file such as `notes.txt` comes back as a one-item sequence with an empty name; keep only entries whose `missing()` and `length()` make sense, or filter by extension first.
- Mixed padding in one folder (`pad.001`, `pad.002`, `pad.0100`) merges into one sequence with 97 false missing frames. Normalise padding before checking.

## Official docs
- https://github.com/rsgalloway/pyseq
- https://pypi.org/project/pyseq/0.9.3/
