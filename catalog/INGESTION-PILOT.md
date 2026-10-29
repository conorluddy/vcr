# Ingestion pilot: VTracer and librosa

Assessment date: 2026-10-29. These are documentation assessments and proposed fixtures, not fixture evidence. The reviewer has not promoted either candidate. No installation or execution was performed.

## VTracer

- Job: turn a small colour raster illustration into editable SVG paths; compare with the existing single-colour Potrace candidate.
- Sources: [project README and CLI](https://github.com/visioncortex/vtracer), [project licence](https://github.com/visioncortex/vtracer/blob/master/LICENSE). Project code is labelled MIT; dependency and downstream asset terms still need checking. The CLI describes raster input and SVG output.
- Triage: assess for a possible vector-asset workflow. Release and latest substantive commit dates were not available from the accessible source; maintenance is unknown. Whether SVG geometry is useful for a particular animation remains untested.
- Machine check: `command -v vtracer` found no command on PATH. This does not rule out another installation. No install attempted.
- Proposed fixture: make a small, owned PNG with three flat high-contrast colour regions; record its generation recipe and hash. Run a pinned version with explicit input and output inside an ignored output directory. Require a well-formed SVG, non-empty geometry and inspect a resvg-rendered comparison for correct regions with an agreed tolerance. Record holes, path complexity and visible differences. This does not establish general tracing quality, editable semantic layers or compatibility with all SVG consumers.
- Decision: keep candidate pending reviewer decision, maintenance check and an explicitly planned fixture; no evidence or skill yet.

## librosa

- Job: turn known audio events into approximate onset times for a future audio-reactive animation workflow; compare with VCR's existing Web Audio capability.
- Sources: [project repository and licence](https://github.com/librosa/librosa), [documentation](https://librosa.org/doc/latest/index.html). Project code is labelled ISC; dependencies and input asset terms need separate checks. Python is the documented interface.
- Triage: assess for offline analysis. The documentation displays version 1.0.0, but a release date and latest substantive commit were not accessible; maintenance is unknown. Beat/onset reliability varies with source material and parameters.
- Machine check: the active `python3` did not find `librosa` via `importlib.util.find_spec`. Other Python environments were not checked. No install attempted.
- Proposed fixture: generate a short, synthetic WAV with clicks at known sample positions; record the source recipe, sample rate, exact version and hash. Run a pinned librosa onset detector offline and assert at least one detection within a predeclared tolerance (for example 50 ms) of each isolated click, while limiting false detections. Store event times and configuration; inspect deviations. Do not claim musical beat tracking, universal accuracy or an animation integration from this synthetic fixture.
- Decision: keep candidate pending reviewer decision, maintenance check and an explicitly planned fixture; no evidence or skill yet.

## Process observations

A candidate can be assessed without running it; version and maintenance gaps remain explicit. Installation is environment-specific. Proposed tests need meaningful expectations and failure criteria, not just output existence. The present catalogue vocabulary has only the broad `audio` tag, and the documentation status enum lacks a neutral `listed` value; consider both separately rather than inventing schema values in this pilot.
