---
id: PRD-0001
title: Static design exploration
status: draft
date: "2026-11-27"
---

# PRD-0001: Static design exploration

## Problem

A person commissioning a graphic may recognise a good design decision before they have the vocabulary to describe it. They might want the headline treatment from one poster, the image crop from another and the open space around the caption from a third. Picking a favourite discards two of those decisions. Writing “use the spacing from the third one” becomes fragile when the next batch arrives.

## Goals

Give a designer or art director a standalone visual workspace to explore dozens of distinct treatments of one brief, point to details worth pursuing, and judge the next round against those references. Someone using the tool for the first time should be able to complete that loop from the UI with their own copy and assets.

## Non-goals

Freehand layout editing, video timelines, print preflight and collaborative approval are outside the first release. This proposal concerns a standalone product. Any integration with VCR’s review UI would require a separate decision under [ADR-0002](../decisions/0002-headless-first-no-editor.md).

## Editor and canvas

**Where it lives.** Give the tool its own browser entry point. Home lists recent design workspaces and offers **New exploration**. Creating one opens a brief form. Generating the first round takes the user straight to its contact sheet. Each workspace, round and inspected variant has a restorable address. A person can open a bookmarked variant directly, refresh it, or use Back to return to the sheet. The standalone app owns these screens. Using it requires neither a video project nor a CLI session. Repository location, hosting and storage are implementation decisions.

**What stays on screen.** On desktop, a slim top bar holds the workspace name, round switcher and **Marks (n)**. Below it, the artwork occupies the available width and height. Open Marks to reveal a tray at the right edge. The canvas resizes so a fitted design stays fully visible. On a narrow screen the tray becomes a dismissible bottom sheet. Closing either returns focus to its trigger. Brief and generation controls appear when starting a round. The rest of the time that space belongs to the designs.

| View | What the person sees and does |
| --- | --- |
| Contact sheet | A scrolling grid shows uncropped thumbnails on neutral backings, with a stable variant ID and mark count beneath each. A compact All / Marked switch filters the grid. Reserve tile positions as results arrive so a design stays under the pointer. Opening a tile and returning restores its scroll position and keyboard focus. |
| Inspect | One artboard opens centred on a neutral surround, initially fitted with a margin on every side. A compact bar outside the artboard holds Previous, Next, Fit, 100% and Mark. At 100%, inspect the design at native size and pan to reach its edges. Fit restores the whole composition. Show the current variant ID and zoom. |
| Mark | Choose Mark, then click a detectable element or drag a rectangle across any detail. Offer a region even on a flattened image. A two-tone outline previews the target on light or dark artwork. **Keep** saves it and updates the tray count. Escape cancels. A keyboard user can create a region, move or resize it with labelled controls, then save. Hide marks to judge the clean design. Export includes only the artwork. |
| Next round | The tray shows each saved crop with its note, source ID and selection control. Opening a crop reveals the region in its original composition. **New round** shows the selected crops, optional direction and batch size together before Generate. |
| Compare | Place the new candidate and one source artboard side by side with the source mark outlined. Selecting another crop swaps the reference while keeping the candidate in place. On narrow screens a labelled Candidate / Source switch preserves both views. |

**Visual language.** Port the existing studio system’s reusable tokens and primitives into the standalone surface. Use charcoal and bone, 1 px hairlines, compact 3 px-radius glass panels and one prominent action per task. Set instructions and notes in Geist, IDs, counts and zoom values in Geist Mono. Start with the floating bar, segmented control, glass panel, button, progress indicator and bottom sheet. Use plain-language labels, visible focus and text or shape for selection. Keep the artboard backing opaque and neutral so translucent controls never tint the artwork being judged. Let labels scale and controls wrap at larger text sizes.

## Requirements

1. **Start a batch.** From an empty workspace, enter a brief, supply the required copy and optional imagery, choose canvas dimensions and request 10, 20, 50 or 100 variants. Make fixed requirements explicit and preserve them across rounds. Show completed designs as they arrive, report progress and allow retry of failed items while preserving completed work and marks.
2. **Generate distinct directions.** Explore composition, type hierarchy, imagery treatment and use of space within the brief. Each candidate needs a discernible design decision. Exact duplicates do not count toward the requested batch size. A colour-only exploration is valid when the brief calls for one.
3. **Scan, then inspect.** Give each variant a stable identifier. Show the batch as a contact sheet with an overview of its visual directions and a filter for marked designs. Open any design at readable size, step through adjacent designs and return to the same place in the sheet. Keep generation settings out of the way during inspection.
4. **Mark what works.** In the detail view, mark an element or draw a region, including the space between elements. Save the mark in one action after targeting it. A note such as “the space above the caption” is optional. Show immediate visual feedback, allow undo, and provide a keyboard path to place and adjust a mark. A saved mark keeps its source variant, position and surrounding context at any zoom level.
5. **Direct the next round.** Present the marks together as thumbnail crops with access to their full originals. Let the user choose which marks to carry forward, add an optional instruction, set the next batch size and generate. When two marks suggest incompatible treatments, let the user try them in separate rounds. Keep prior rounds intact.
6. **Judge and finish.** Show a new candidate beside the selected references so the user can judge whether the intended details survived. Record which marks guided the round. The person can mark again, revisit an earlier round or export a chosen design as a PNG at the specified dimensions. Reopening the workspace restores designs, marks, notes and round history.

## Success criteria

These are proposed release tests.

- **First-use comprehension.** In a trial with five first-time users, at least four can start a 20-design batch, mark details on two different designs, generate a second round using both marks and export a choice without coaching or a command line. Observe where each person hesitates.
- **Useful variation.** For an open-ended brief, two reviewers can independently identify at least four materially different layouts or typographic hierarchies in a batch of 20 and point to what distinguishes them. All candidates retain the fixed copy and dimensions.
- **Feedback fidelity.** In the same trial, ask each user to point out where both of their selected details carried through. At least four can find a second-round candidate that reflects both to their satisfaction. A stored link to the source marks alone does not pass this test.
- **Scale and recovery.** Exercise all four batch sizes. In a 100-design session, mark the first and last variants, interrupt generation of a follow-up batch, reopen and retry. Verify the original marks still resolve to the same details and completed variants appear exactly once.
- **Canvas walkthrough.** At desktop and phone widths, inspect a portrait variant, switch from Fit to 100%, mark a detail near an edge, open its crop from the tray and return to its tile. Repeat by keyboard. Verify the outline stays on the same detail through zoom, resize and reopening, and that the exported PNG contains no editor overlays.
