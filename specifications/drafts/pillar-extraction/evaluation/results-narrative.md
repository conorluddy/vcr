# Independent narrative trial results

## Final corrective evidence

A fresh Terra evaluator, withheld expectations and prior results, completed creation requests for brief and typography under `output/final-fresh-trials/`. The brief supplies a clearly unconfirmed proposition rather than leaving it empty. Typography's first fresh response remained generic about acquisition; a repeat against the current draft supplies an explicit candidate/version, acquisition route, licence inspection/retention and loading checks in `typography-rerun.md`. The candidate release and licence remain unverified, and no font was downloaded or rendered. This meets the acquisition-plan expectation, not actual provisioning or legibility verification. Earlier failures below are retained as historical observations.

The written workflows are candidates for a promotion decision within these scoped results. Actual playback, target-viewing-size performance, font provisioning and reviewer calibration remain outside the evidence obtained here.

Evaluated draft skill instructions against raw routing and task requests; expected files and author conclusions were not consulted. Trial deliverables are under `output/narrative-trial/`: `brief.md`, `story.md`, `pacing.md`, `typography.md`, and `motion.md`. No source skill was edited. Each file includes the creation and local-revision responses, assumptions and limitations.

## Routing observations

| Skill | Request | Classification and reason |
|---|---|---|
| Brief | Loose notes into decision-ready brief | Primary: identify decision fields and open choices. |
| Brief | Selected route into script and beats | Neighbouring handoff: story develops the selected route. |
| Brief | Inspect encoding defects | Unrelated: delivery inspects the finished file. |
| Story | Selected proposition into AV script and beats | Primary: develop visual and spoken narrative. |
| Story | Adjust a rushed beat's duration | Neighbouring handoff: pacing reallocates timing while preserving story. |
| Story | Check export encoding | Unrelated: delivery owns file conformance. |
| Pacing | Fit beat sequence to fixed duration | Primary: allocate beats and holds. |
| Pacing | Design easing and path within a beat | Neighbouring handoff: motion owns the movement. |
| Pacing | Select an image and document provenance | Unrelated: image direction owns image selection. |
| Typography | Improve hierarchy and line breaks | Primary: type hierarchy and layout. |
| Typography | Motion path for a settled heading | Neighbouring handoff: motion owns movement. |
| Typography | Select narration audio mix | Unrelated: sound owns the mix. |
| Motion | Entrance and arrival within timed beat | Primary: purposeful motion and poses. |
| Motion | Reallocate beat lengths for reading | Neighbouring handoff: pacing owns beat allocation, with typography for readable holds. |
| Motion | Palette and visual hierarchy | Neighbouring handoff: art direction owns the visual system. |

## Task observations and limits

- Brief: drafted supplied facts, bounded route options and decision questions; locally operationalised calm while preserving the objective, audience and mandatory. No project or video was supplied, so no workspace was initialised, schema brief files validated or confirmation recorded. Proposition, measure, claims and delivery settings remain open.
- Story: drafted a three-beat AV script and a sound-off revision with numbered stages retained in order. Stage names, runtime and visuals were unavailable. The proposition is supplied, not verified evidence; no actual beat sheet, board, timing check or human comprehension test was performed.
- Pacing: produced a 12-second allocation and a separate reallocation retaining every beat and the total. No copy, fps, narration, plan or render was available, so the proposed timing and cause of the reported rush remain untested; no markers were updated.
- Typography: proposed a relational hierarchy and local layout that retains the copy. With no frame, dimensions, font, licence or target size, no actual face comparison, rendered inspection, measurement or legibility finding is possible.
- Motion: proposed key poses and a settled arrival inside the 3-second beat, plus a bounded hypothesis for the floaty revision. No fps, asset coverage, original timing or footage was available; no motion inspection or verification occurred.

Relevant reference sections were read using `node --import tsx packages/cli/src/index.ts refs section`; this bypassed an earlier sandbox IPC failure in the pnpm/tsx launcher. The outputs are recommendations, not approvals or evidence of rendered performance.

## Supplemental synthetic fixture

The fixture chooses 960×540, 30 fps and a 3-second beat solely to exercise the typography and motion directions; these values were not supplied in either original request. `output/narrative-trial/artifacts/scene.html` is a standalone browser scene with `window.seek(t)`: a circle moves left to centre during 1.2 seconds and holds, while the heading and supporting text stay visible. Arial is a local fallback, not a verified distributed font or licence decision. Browser frame inspection was attempted with the installed Playwright Chromium, but it exited at launch because the sandbox denied its Mach port registration. The scene is therefore source-only, not visually inspected or proven to render or seek correctly; no motion quality, accessibility or legibility result is claimed.

`output/narrative-trial/artifacts/beats.json` is a separate synthetic silent 12-second three-stage plan, using the proposed 2.5/6/3.5-second pacing and 30 fps. In an isolated `/tmp/vcr-narrative-trial` workspace with a matching synthetic brief, `vcr validate --json` checked four files with no diagnostics; `vcr plan check --json` returned no findings, and `vcr plan markers --json` returned B01 at 2.466667 s, B02 at 8.466667 s and B03 at 11.966667 s. These commands cover implemented schema and plan checks, not readability, visual comprehension, render behaviour or approval. The fixture does not resolve the original requests' missing runtime, fps, font, rendering or viewing context.

## Independent acceptance comparison

Desk comparison against the withheld routing and task expectations after the trial. “Met” describes only the written response; it is not a rendered or production pass. Readiness means ready for a further representative test, not promotion.

| Skill | Met | Unmet or unable to assess | Readiness and next evidence |
|---|---|---|---|
| Brief | Routing matches all three expectations. Creation separates known facts, route options and missing decisions; revision preserves the supplied mandatory and turns calm into scoped, actionable choices without claiming confirmation. | Creation leaves the proposition open rather than proposing the requested unconfirmed proposition. This avoids inventing process facts but does not meet that specific expected outcome. Actual schema files and human confirmation were not tested. | Ready for a further brief test with enough process content to propose and confirm a proposition, then validate the real workspace files. |
| Story | Routing matches. Creation supplies ordered picture, text and narration; revision adds numbered progressive reveal, explains the change and retains the proposition without claiming proof. | Actual stage names, timings and render are missing; silent comprehension cannot be assessed. | Ready for a further test with named stages and playback, including a sound-off comprehension review. |
| Pacing | Routing matches. Both allocations total 12 seconds with correct boundaries and a protected payoff; the revision explains the time tradeoff and treats the cause as a hypothesis. | Actual copy, playback and narration are unavailable. The synthetic plan check only covers the separate invented fixture, not reading speed or timing quality. | Ready for a further test with actual copy, markers and playback. |
| Typography | Routing matches. Both responses use the supplied copy, concrete hierarchy and alignment, preserve copy and avoid claiming an inspected edit or legibility pass. | The creation response calls for checking availability and licensing but does not give the expected reproducible font acquisition and licence plan. Font readiness, contrast and actual layout are unassessed. | Not ready for promotion; test a concrete acquisition, licence and loading handoff, then inspect the actual composition at intended size. |
| Motion | First two routes match; both task responses state purpose, poses and arrival or a bounded local hypothesis, with missing footage and safety evidence acknowledged. | Route 3 was classified as a neighbouring handoff; the expected category is unrelated as primary, although the response correctly assigns visual language to art direction. The source-only synthetic scene was not rendered, so motion quality, reduced-motion equivalence and temporal behaviour remain unassessed. | Ready for a further routing and real playback test; clarify the boundary between a neighbour and an unrelated primary request. |

The two material omissions are the unproposed brief proposition and the absent reproducible typography font plan. The motion routing category also differs from the expectation. None of the synthetic artifacts cures those omissions.

## Unblinded corrective rerun

After reading the expectations, the evaluator amended the draft reminders and wrote `output/corrective-trial/brief.md`, `typography.md` and `motion-routing.md`. This is one corrective cycle, not an independent first pass. The brief specimen now gives an explicitly unconfirmed proposition hypothesis and separates it from evidence. The typography specimen identifies a candidate and acquisition location, specifies version, styles, licence, permitted retention and loading checks, and records that none has been acquired or verified. Its external location was not checked in this trial, and actual font readiness and rendering remain unassessed. The motion rubric now accepts either category when it correctly identifies art direction as primary and explains motion's possible handoff; the corrective response does so. These changes address the textual gaps without establishing production performance or promotion readiness.
