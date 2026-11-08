---
name: motion
description: Design or revise movement, choreography and transitions within planned beats. Use for motion intent and frame-level inspection, not for editing beat structure or independent motion review.
---

# Motion

Draft, advisory and uncalibrated. Links are deployment-relative: they target the final `skills/motion/SKILL.md` location.

Look up applicable rule definitions in the referenced section or canonical rules data before applying a limit; never use thresholds from memory. Read one section at a time and preserve provisional status.

Use the brief, existing beat timing and markers, delivery frame rate, key poses and available asset coverage. Scale the work to the request: reuse settled motion vocabulary for a local revision and update only the affected decisions. Establish what imagery can actually reveal before planning a camera move.

Give each move a purpose: direct attention, explain a relationship, show causality, preserve continuity or express character. If movement serves no useful purpose, consider a hold or cut with pacing. Translate the brief's intended voice into observable choices: curve roles, duration relationships, paths, direction and lead/follow logic. Record these in the existing workspace motion spec (`MOTION-SIG-001`), with intentional exceptions and a signature move only where one serves the brief. Adjectives or named curves alone do not explain the choices. Keep proposed choices distinct from selected brief values.

Block the key poses and readable holds first, then choreograph a lead mover and subordinate action, entrances, exits and transitions. Align meaningful arrivals to markers where appropriate; preserve continuity across persistent elements. Shape energy with pauses as well as movement. Specify reduced-motion needs with accessibility, and avoid implying a camera move can expose imagery that does not exist.

Read only the needed route in [motion direction](../../references/motion-director/README.md): §2–5 for curves, timing and choreography; §6–7 for camera movement and judder; §9 and §17 for measurement; §10 for translating critique into revisions; §11 and §14 for the motion spec and creation; §18 for seek-based rendering; §19 for inspection. `MOTION-CHOR-003`, `MOTION-RHY-001`, `MOTION-RHY-004` and `MOTION-FPS-003` cover hierarchy, arrivals, loop seams and shimmer. Pacing owns beat lengths, cuts and editorial holds; `TYPO-HOLD` owns minimum reading holds. `DATA-NO-OVERSHOOT` takes precedence on quantitative geometry even when expressive overshoot suits other elements. `A11Y-MOTION-*` and `A11Y-FLASH-*` own accessibility; sound owns audio sync.

Treat feedback such as “floaty”, “abrupt” or “too busy” as a hypothesis, not a prescribed fix. Inspect duration, arrival velocity, overlap and competing movers as relevant; change the parameter supported by the evidence and compare the affected move again. Preserve unrelated motion decisions.

Keep scene evaluation repeatable at a requested time, including springs and procedural variation; use §18 and `MOTION-SPR-001` for the applicable guidance. Inside this repository `vcr` means `pnpm vcr`; in an installed plugin it means `node <plugin-root>/cli/vcr.mjs`, with the plugin root two directories above this skill. For supported browser scenes, `vcr capture --verify` checks captured frames in shuffled seek order. Consult command help for scene and capture arguments. Its result is evidence for the tested frames and environment, not proof of motion quality or every authoring property.

Inspect the relevant consecutive frames at known fps and watch the result at delivery speed, including loop seams and thin moving details in the encoded output where available. No motion sampler or automated motion-quality check is implemented; frame inspection and judgement are manual and cannot establish unmeasured safety. Record frame ranges, assumptions and missing evidence. Hand off the spec, poses, marker relationships and inspection notes; request independent advisory review when useful.
