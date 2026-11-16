# OpenTimelineIO native JSON timeline round-trip

## Intent and scope

- Tool ID and version/build: `opentimelineio` 0.18.1.
- VCR job and exact claim being tested: create and reopen a minimal native `.otio` timeline containing one video track, one clip, and an external media reference; confirm duration and timing metadata survive serialization.
- Explicit exclusions: editorial interchange adapters such as AAF/EDL/XML, render/playback, media probing, and interoperability with other applications.
- Tool documentation and licence sources, checked date; dependency, model, asset and output terms as applicable: [OTIO Python quickstart](https://opentimelineio.readthedocs.io/en/latest/tutorials/quickstart.html), [Apache-2.0 licence](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/main/LICENSE.txt); checked 2026-11-15.
- Environment: macOS 26.6 arm64, Python 3.12.13; native OTIO adapter, no optional format adapters.
- Input: generated in the fixture by `run.py`; no media payload is included, only an external reference string.
- Dependencies, installation plan, permissions, network and expected side effects: pinned `opentimelineio==0.18.1` in ignored `output/venv`; installation requires package access; no repository dependency changes.
- Selected workspace, generated output and cleanup paths: `output/` only.

## Plan, before running

- Exact commands or reviewed recipe and versions, with parameters: `./run.sh --record`, then `./run.sh`; Python API `otio.adapters.write_to_file` and `read_from_file` using the native OTIO JSON adapter.
- Expected artifacts and predeclared checks: two independently serialized files are byte-identical; reopened timeline has one track, one clip, 48 frames at 24 fps, and external target `media/sample.mov`.
- Intended consumer and handoff settings: native OTIO JSON only; the media URL is a reference, not a packaged media asset.
- Delivery constraints and units: no rendered media.
- Expected failure modes and stop conditions: stop if the pinned package cannot be installed, if round-trip changes the structure or duration, or if repeated serialization differs.
- Reproduction instructions; how to inspect output: run `./run.sh`; inspect `output/timeline.otio` and `output/metrics.json`.

## Observation, after running

- Date and executor; actual environment and commands: 2026-11-15, OpenTimelineIO 0.18.1, macOS 26.6 arm64, Python 3.12.13; `./run.sh --record` and `./run.sh`.
- Observed output, checks, hashes or measurements and exit status: reopened as one video track with one clip of 48 frames at 24 fps and external target `media/sample.mov`; two native serializations matched, SHA-256 `a567ca427ce4edf2d249f78aacf90b508fb02d8d19fc04a3e0e32caebcd7df07`; both fixture runs exited 0.
- Inspection of the actual deliverable/variant at its intended scale (visual or listening); defects and corrections: inspected serialized native OTIO JSON and reopened schema structure; no visual media is rendered by this fixture.
- Pass / partial / fail / blocked, with reasons and evidence paths: pass; metrics retained in `expected/metrics.json`.
- Deviations, limitations, nondeterminism and unexpected side effects: native JSON round-trip only; no optional format adapter tested.
- What this result does and does not establish: proves native JSON round-trip for this minimal timeline on this host/version; does not prove external editorial adapter interoperability, media availability, timeline playback or rendering.
- Reviewer, decision, follow-up and invalidation/revisit triggers: none yet.
