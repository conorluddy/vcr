---
id: ADR-0014
title: A look is approved in stills before motion
status: proposed
date: "2026-11-21"
---

# 0014. A look is approved in stills before motion

## Context

Most of what makes a piece look good is settled in one frame: palette, type, composition, texture. A frame takes seconds to render and review; a scene takes minutes. Both technique-layer builds (#183, 2026-11-20) went from a text brief straight to motion and came out competent and plain, with nothing approved to aim at and nothing to hold later scenes to. `vcr preview --at` and `vcr lint` already render and check single frames, and render approval is already a recorded human decision (plugin PRD, review contract). The roadmap (`specifications/roadmap.md`, "Next major: look frames") records the intent; this records the decision and its boundary so the design starts from a settled position.

## Options considered

1. **A separate still or image project type.** Gives stills their own home and would also serve posters and store screenshots, but the approved look then lives in a different project from the video that needs it, and the frame is redrawn instead of continued.
2. **No formal stage (the status quo).** Nothing to build. The look is decided implicitly by whichever scene is built first, and the first human opinion arrives after the expensive step.
3. **Storyboards as drawn boards.** The traditional answer, but a drawn board is a second artefact in a second medium; it does not prove the look can be produced by the route that will make the video.
4. **Look frames inside the video project: candidate stills, a recorded human choice, and the chosen frame carried into motion.**

## Decision

Option 4. A video's look is settled on look frames before full scenes are built. A look frame is a scene of the video captured at a single time, by the same route that will render the motion. Candidates are shown side by side, each naming the techniques it uses (ADR 0010) and the inspiration items it draws on (ADR 0011). A person chooses, and the choice is recorded with who made it and why; no agent approves a look. The approved frame is the starting point of the motion scene, not a discarded sketch. Stills are a stage of a video, not a project type: standalone still deliverables are out of scope until a production needs one.

This is proposed with three questions open, to be answered by the look-frames design before acceptance: where look frames and their sheet live in the video directory and which storage class they belong to; whether the choice reuses the approval contract or gets its own record; and how a look frame relates to `beats.json`.

## Consequences

- **Easier:** the first human judgement arrives at the cheapest point; later scenes and reviewers have an approved frame to be held to; variants make a contrasting shortlist visible instead of described.
- **Harder:** one more stage before anything moves, which a small or urgent piece will want to skip; a still cannot show motion, pacing or sound, so approval of a look must not be read as approval of the video.
- **Must now do:** answer the three open questions in the look-frames design; say what skipping the stage looks like and how it is recorded; keep the approved frame and the scene it came from linked so drift between them can be found.

## Revisit when

A production needs a standalone still deliverable, which reopens the project-type question; or approved look frames routinely fail to survive into motion, which would mean the still is the wrong unit; or the stage is skipped on most videos.
