---
name: review
description: Triage VCR findings, inspect revision evidence and prepare a human review decision. Use when reviewing a retained render or responding to review feedback.
---

# Review

Advisory and uncalibrated; this is a CLI-only workflow.

Consult each applicable rule in the referenced section before applying its limits; never use thresholds from memory. Read one section at a time and preserve provisional status.

Inside the repository `vcr` means `pnpm vcr`; from the installed plugin it means `node <plugin-root>/cli/vcr.mjs`, where the root is two directories above this skill. Read the [critique routes](../../references/critique-methodology/README.md) and [reviewer contract](../../references/critique-methodology/reviewer-contract.md); use relevant sections only. Scope the review to the requested render, issue or revision; establish the brief, retained render, existing measurements and open findings. Preserve the difference between measurement, judgement and unassessed concerns. Independent reviewers should first inspect the artefact without authorship, rationale or prior verdicts (`REVIEW-IND-02`); packet assembly is manual.

For a fresh review, identify the applicable pillars and run their implemented checks before requesting independent specialist review. Give each reviewer the brief, relevant media and measurements needed for its scope; do not imply that every pillar has a check. The author can self-check, but should not present that as an independent verdict.

Name the actual check and specialist for each concern: for example, supported browser text placement can use `vcr lint` and the typographer, while other typography concerns remain manual. If the scene or evidence is unavailable, identify the check as planned rather than run.

Triage findings against the current render: deduplicate overlapping issues without discarding distinct evidence, surface cross-pillar conflicts and propose a joint fix or question for the human (`REVIEW-AGG-03`). Use `vcr findings list` and `vcr findings show` to inspect records. When asked to revise, trace each issue to the affected source and change the parameter supported by the evidence, preserving unrelated decisions. Apply authorized source changes, render again using the actual production workflow, and compare affected evidence and relevant checks. Use `vcr findings address` only when a fix has supporting revision evidence; consult command help for arguments. State what remains unverified and which render the evidence describes.

The human alone resolves findings, requests changes or approves through the current interactive review commands. An agent's verdict or addressed finding is not approval. Reviewers remain advisory until calibrated (`REVIEW-CAL-*`); do not imply a review page, automated comparison or blind-packet command exists.
