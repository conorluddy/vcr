# VCR development feedback: first Grapla pilot

Archive note (2026-11-09): this report preserves the original session account. Follow-up triage now lives in [#183](https://github.com/conorluddy/vcr/issues/183), with focused issues #184–#187 and additional evidence on #51/#63. Statements below about issues not yet being filed describe the time of writing. Local evidence links were adjusted for this archive location; they require the sibling production checkout and its local outputs.

Date: 2026-11-09  
Plugin version: 0.1.0  
Project: Grapla Learning Bites  
Video: `grapla-learning-bites/pilot`

## Summary

VCR successfully supported workspace setup, briefing, a timed teaching plan,
deterministic browser capture, retained renders and evidence-linked findings.
The strongest improvements suggested by this session are actionable asset
diagnostics, validated social safe zones and a faster visual iteration loop.

This report separates observed behaviour from proposed features and authoring
mistakes. It is based on one pilot on one machine, not a cross-platform test.
No changes were made to the installed plugin, and no upstream issues have been
filed. Production sources remain in the Grapla repository. This feedback document was moved into the VCR repository at the user’s request.

## Session and evidence

The pilot explains frames versus pushing to white-through-blue-belt TikTok
viewers. Its first deliverable is a silent visual study; voiceover is planned
but was not generated. It uses procedural Three.js figures, a paused GSAP
timeline, HTML teaching text and FFmpeg encoding.

| Item | Observed configuration |
| --- | --- |
| Environment | macOS 25.6.0, Apple Silicon; Codex workspace sandbox |
| Node | 22.19.0 |
| Capture setup | Playwright 1.64.1; installer advertised a roughly 150 MB Chromium download |
| Scene dependencies | Three.js 0.180.0; GSAP 3.13.0, installed inside the video directory |
| Delivery | 1080 × 1920, 30 fps, 27 seconds, 810 frames |
| Encoded preview | H.264, yuv420p, 30 fps; duration and frame count checked with ffprobe |
| Capture method | VCR screenshot mode |

Local evidence:

- [Pilot brief](../../../Grapla/projects/grapla-learning-bites/videos/pilot/brief.md), [beat plan](../../../Grapla/projects/grapla-learning-bites/videos/pilot/beats.json) and
  [source/reproduction notes](../../../Grapla/projects/grapla-learning-bites/videos/pilot/README.md).
- [Initial retained render](../../../Grapla/projects/grapla-learning-bites/videos/pilot/review/renders/r-20261109T073310-dedc085/manifest.json).
- [Verified cutaway revision](../../../Grapla/projects/grapla-learning-bites/videos/pilot/review/renders/r-20261109T073533-790002c/manifest.json).
- [Final visual-study render](../../../Grapla/projects/grapla-learning-bites/videos/pilot/review/renders/r-20261109T073917-19cc72f/manifest.json).
- [Generated review summary](../../../Grapla/projects/grapla-learning-bites/videos/pilot/review/REVIEW.md).
- [Final preview](../../../Grapla/output/grapla-learning-bites/pilot/frames-versus-pushing-preview.mp4).

Rendered images, capture reports and MP4s under `output/` are local and ignored
by Git. The retained manifests remain in the project; links to ignored media
will require the original local outputs or a separately shared evidence bundle.
Some diagnostic examples below come from session tool output, which was not
exported as a complete log file.

## Recommended priorities

These priorities reflect the impact on this production session, not an
assessment of VCR's full roadmap.

| Priority | Improvement | Reason |
| --- | --- | --- |
| High | Asset failures with actionable diagnostics | A missing font surfaced as a generic readiness timeout. |
| High | Validate and explain TikTok safe-zone geometry | The preset strongly shaped the composition despite being unverified. |
| High | Selected-frame previews and optional sampled verification | Full captures were repeatedly needed to inspect a few visual decisions. |
| Medium | Resolve dependencies in the selected video | Readiness reported a locally installed dependency as missing. |
| Medium | Refresh generated review state after capture | A successful new render left a stale-summary warning. |
| Medium | Clarify capture timing and verification reporting | The displayed throughput did not describe the complete verified command. |

## 1. Asset-serving boundaries and readiness errors

### Observation

The scene initially referenced fonts already present elsewhere in the
repository, using relative paths from the video directory. Capture served the
scene at a URL ending in `/scene.html`. The font requests returned 404s, followed
by a page network error. The eventual failure was:

```text
page.waitForFunction: Timeout 10000ms exceeded.
```

The scene deliberately waited for fonts before exposing `window.__scene`.
Consequently the asset failure prevented readiness, but the final error did not
identify the font or explain the serving boundary. Copying the permitted font
files into the video's own `fonts/` directory and using scene-local URLs fixed
the failure.

### Impact

A reasonable attempt to reuse repository assets looked like a generic scene
initialisation problem. Diagnosing it required connecting console errors with
the font-loading code and discovering what the local server exposed.

### Suggested improvement

- Print the effective asset-serving root when a scene opens.
- Retain failed request URLs, HTTP status codes and relevant page errors.
- On readiness timeout, distinguish failed assets, module exceptions and a
  missing or never-published scene contract where evidence permits.
- Explain the supported way to share assets across videos. A documented
  workspace asset route or explicit asset-root configuration would avoid
  copying common fonts into every episode.
- Preserve the serving boundary; do not solve this by exposing arbitrary
  filesystem paths.

### Reproduction and acceptance

Create a scene that loads a font outside the served scene directory and waits
for `document.fonts.load()` before setting `window.__scene`. Run lint or capture.
The failure should name the requested resource, show the serving root and
suggest a supported correction, without requiring the user to infer the cause
from a generic ten-second timeout.

## 2. TikTok safe-zone geometry needs validation and explanation

### Observation

The `tiktok` lint preset reported a top safe edge of 288 px and a bottom safe
edge of 1248 px on a 1080 × 1920 canvas. The output explicitly labelled the preset
unverified. This leaves 960 px, or half the canvas height, between those vertical
edges; it does not describe the full safe area because horizontal limits also
apply.

The first composition failed for its eyebrow text, title, legend, explanatory
copy and footer. Moving readable content into the permitted band produced a
passing layout, but also concentrated the composition near the upper-middle
of the frame and left substantial empty space below it.

### Interpretation and limits

This is evidence that the preset materially affected the design. It is not
proof that the preset is incorrect. We did not compare an uploaded video across
TikTok devices, UI states, caption lengths or app versions. The blank space was
also influenced by our decision to fit the teaching composition into that band.

### Suggested improvement

- Validate the preset against documented, dated viewing conditions and retain
  representative evidence.
- Explain each boundary and the interface element or uncertainty it covers.
- Distinguish a conservative essential-text region from the region available
  for supporting imagery, if that distinction is supported by the evidence.
- Provide a visible safe-zone overlay so authors can assess the tradeoff before
  repeatedly moving elements in response to lint failures.
- Keep unverified presets clearly labelled; communicate their advisory status
  alongside the command's exit behaviour.

### Acceptance

A user should be able to see the geometry, its evidence date, its limitations
and the reason for each inset before designing around it. A supported custom
profile would help when the intended placement differs from the preset.

## 3. Dependency readiness should follow the selected video

### Observation

We installed pinned scene dependencies under:

```text
projects/grapla-learning-bites/videos/pilot/node_modules/
```

After installation, `vcr tools info gsap` still reported:

```text
Readiness: this project: not installed (pnpm add gsap)
```

The scene subsequently imported GSAP successfully and captured successfully.
This supports a mismatch between the readiness report's scope and the working
video's dependency location. We did not inspect the discovery implementation,
so the exact resolution algorithm remains unconfirmed.

### Suggested improvement

Support explicit video context for readiness, for example a future `--video`
option. Resolve from the video's package location using the applicable module
resolution rules, and show which location was checked.

Report three separate concepts: catalogue validation evidence, machine binary
availability and dependency availability in the selected project/video. A tool
can be catalogued and validated without being installed locally, or installed
inside one video without being available at the workspace root.

### Reproduction and acceptance

Install GSAP only in a nested video package, with no root installation. Run the
readiness check in that video's context. It should report the installed version
and resolved path. A different video without that dependency should retain its
own missing-dependency result.

## 4. New captures should refresh generated review summaries

### Observation

After recording a finding and then creating a new retained render, validation
reported:

```text
WARNING .../review/REVIEW.md: REVIEW.md is stale or was hand-edited
```

The accompanying message said the next findings or review write would regenerate
the summary. A subsequent `findings address` write did so, and validation then
returned zero diagnostics. We had not hand-edited the summary.

### Impact and suggested improvement

A normal render operation could leave generated state that the validator
immediately criticised. Refresh the summary whenever a successful capture
changes the state represented by that summary. Alternatively, provide a
documented refresh operation that does not require an unrelated finding change.

Where possible, distinguish source-state drift from detected manual edits in
the diagnostic. Neither should be silently repaired by discarding a person's
edits without explanation.

### Reproduction and acceptance

Create a render, add a finding, capture a revision and run validation without
editing `REVIEW.md`. The generated summary should reflect the new render and
should not need a separate findings mutation merely to become current.

## 5. Make visual iteration cheaper than a full capture

### Observation

An 810-frame capture without verification took approximately one minute. A
verified capture repeated the scene in shuffled order and took approximately
two minutes end to end. Full-size, 1 fps captures were useful quick checks, but
sampled only integer seconds and needed their own output directories.

The defects we needed to inspect were highly local: a hidden arm around ten
seconds and a disconnected-looking waist around eighteen seconds. Capturing
every frame before examining those moments increased iteration cost.

### Suggested improvement

Add or clearly surface a selected-frame preview workflow that can:

- Capture explicit timestamps and named beat markers at delivery resolution.
- Include transition boundaries and nearby frames, rather than only settled
  holds or integer-second samples.
- Produce a contact sheet with beat IDs, timestamps and source identification.
- Compare the same moment across two retained revisions.
- Keep diagnostic previews distinct from complete delivery renders.

An explicitly sampled shuffled-order check could be useful during exploration.
It must record exactly what was sampled and must not be presented as equivalent
to full verification. Retain full verification for the stronger check.

### Acceptance

An author should be able to inspect the frame contact and hip movement quickly,
at intended resolution, before committing to another 810-frame render. A preview
must not be mistaken for a complete render or human approval.

## 6. Report complete capture and verification timing

### Evidence

The verified revision's local report recorded:

```json
{
  "frames": 810,
  "wall_ms": 55867,
  "frames_per_second": 14.5,
  "shuffled_matches_sequential": true
}
```

The corresponding command-finished event reported 111797 ms, including the
verified command's broader work. The final unverified revision recorded
59501 ms and 13.61 fps in its report; its command event reported 60881 ms.

The approximately doubled time for verification is expected. The issue is that
the report field named `wall_ms` can be read as the full operation's wall time.
These numbers come from this machine and scene; they are not VCR benchmarks.

### Suggested improvement

Expose separate setup, sequential capture, shuffled verification and total wall
times. Label throughput with the pass it measures. An estimated remaining time
would also help agents communicate progress without excessive polling.

## What worked and should be preserved

### Workspace isolation and setup visibility

Initialisation created `vcr.json` and ignore rules while keeping the plugin
read-only. Machine files fell back to the repository's ignored `.vcr/` directory
under Codex. The capture setup preview explained its planned installation and
download before it ran. These boundaries matched the user's request.

### Separate checks caught different classes of issue

Schema validation, plan checks, layout lint and visual inspection were useful
as separate operations. Plan checks caught unmapped mandatories, a lack of
voiceover breathing room and a one-second text hold. Later, entering the actual
opening headline plus supporting copy exposed a reading-time issue: 12 words
in three seconds, with a reported required hold of 4.10 seconds. Shortening the
supporting sentence allowed the plan to pass.

Preserve that separation and make each check's scope explicit. Schema validity
alone did not establish a buildable or readable plan.

### Determinism was measurable

Full shuffled-order verification passed on earlier revisions, including
`r-20261109T073533-790002c`. It provided evidence that those scene revisions were
repeatable across seek order. The final waist-corrected revision was captured
without `--verify`; it should not inherit the earlier revisions' verification
status. Keeping that distinction visible in reports is valuable.

### Findings linked implementation changes to evidence

F-0001 tracked the hidden frame; F-0002 tracked the disconnected-looking waist.
Both were marked addressed with retained render evidence. Human resolution
remained separate from the agent's claim that it had fixed a problem. This is a
useful distinction to retain.

## Authoring mistakes, not VCR defects

The initial cutaway did not visibly expose the bottom player's frame. Correcting
the scene's transparency configuration made that contact visible. The model
also lacked a connecting waist segment during hip movement; adding one fixed
the visual discontinuity. These were scene-authoring problems, not established
renderer defects.

They suggest a useful teaching example or checklist for procedural body models:
inspect connected segments, contact visibility, camera occlusion, transparency
and transition poses. Such guidance should remain a visual review aid rather
than a claim that VCR automatically validates anatomy or jiu jitsu mechanics.

The agent workflow also contributed to delay: full captures began before all
important poses were inspected, some tool calls polled too frequently, and a
few exploratory file reads returned excessive output. Faster previews would
help, but this session's entire iteration cost should not be attributed to VCR.

## Suggested next development pass

1. Improve missing-resource and readiness diagnostics.
2. Validate and visualise the social safe-zone presets.
3. Add or document a fast timestamp/marker preview path.
4. Scope dependency checks to the selected video.
5. Refresh generated review summaries after capture.
6. Clarify timing fields and optional verification coverage.

For a follow-up usability test, repeat the workflow in a fresh workspace with a
shared font, a nested video package and a short 3D scene. Measure time to the
first useful inspected frame, time to diagnose a deliberately missing asset,
and the number of full renders needed before visual review. Keep source quality,
technical checks and human creative judgement as separate outcomes.
