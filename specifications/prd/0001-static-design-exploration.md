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

## Product scope and current state

The product is a single-person browser studio for static graphic design. Its deliverable is a finished image. The person can reach that image through one round or return days later to combine decisions from several design directions.

The [working prototype](../../apps/design-studio/index.html) runs locally. It accepts copy, an optional image and a brief, generates procedural layouts, displays a contact sheet, saves region marks with a trait and note, reuses marked traits in later rounds, compares a candidate with its references and exports PNG. Workspaces live in the browser. The following requirements describe the target product. Agent launch, AI generation, explicit branch history, independently rated judgments, editable categories and the workspace-wide details sheet are proposed capabilities.

## Requirements

### 1. Home, launch and resume

Home offers **New exploration** and recent workspaces with their names and last activity. Starting manually opens a brief. Opening a recent workspace restores the last visited round. Each workspace, round and variant has a restorable address. Opening a variant directly gives the person a route back to its contact sheet.

An agent can also launch the studio from an existing conversation. “Show me 20 directions for this brief” should use the supplied brief, copy and assets, start the requested batch and open its sheet. If required information is missing, open the prefilled brief with those fields identified. A request to inspect an existing exploration opens it without starting a batch. Retrying the same launch after a lost response must return the same round. The command spelling and host integration remain open.

### 2. Brief and first generation

The brief form collects a workspace name, design direction, required copy, canvas width and height, optional imagery and a batch size of 10, 20, 50 or 100. Show the supplied image and the intended canvas proportions before generation. Make fixed inputs visible, including exact copy and output dimensions. A person can distinguish a fixed asset from imagery offered as a reference.

Generate opens the contact sheet immediately. Reserve stable tile positions and fill them as candidates arrive. Show completed, pending and failed counts and allow inspection while work continues. A failed item can be retried independently. Returning after an interruption restores completed items and offers to resume the outstanding work. Visiting a sheet or saving a note never launches another batch.

For an open brief, vary composition, typography, image treatment and use of space. A batch of 100 should support scanning distinct directions even when variants within one direction explore smaller differences. Exact duplicates do not count toward the requested batch. A deliberately narrow brief can constrain variation to one aspect.

### 3. Workspace shell and contact sheet

The workspace header gives access to Home, the workspace name, round history and **Marked details**. The main view is the current round’s contact sheet. Its heading identifies the round, its optional name and generation progress. **New round** starts from the round on screen. Keep the brief and settings out of the way while reviewing.

Show uncropped thumbnails on opaque neutral backings, stable variant IDs and mark counts. Support All and Marked filters. Opening a tile enters Inspect. Returning restores the filter, scroll position and keyboard focus so a reviewer can continue through a hundred designs without finding their place again. Distinguish an empty filter result from a round still waiting for its first image.

### 4. Editor and canvas

Inspect centres one artboard with a margin on every side. Keep Previous, Next, Fit, 100%, Mark and export accessible around the canvas. Fit reveals the whole composition. At native size, pan to reach its edges. Show the variant ID and current zoom. Hide overlays for clean inspection.

In Mark mode, click a detectable element or draw a rectangle across any detail, including empty space between elements. Flat images always support a rectangular region. Provide a keyboard path to place, move and resize it. Use a two-tone outline visible on light and dark artwork. Keep the selection anchored to the source artwork as the canvas zooms or resizes. Escape cancels an unfinished selection. A saved region can be reopened from its crop, edited or removed with undo.

### 5. Region popover, ratings and notes

Selecting a region opens a compact popover beside it, or a bottom sheet on a phone. Show the crop, a short list of workspace categories with star controls, **Add note** and a way to finish. Keep the selected area visible when positioning the popover. The person can save a region for later without rating it.

A judgment belongs to one region. It can contain a rating, a note, or both, with an optional category. Tapping a category’s stars saves a judgment in one action. A note added to that row qualifies that rating. **Add note** creates a separate judgment with its own optional category and rating. Multiple judgments can share a category on one region. Someone can like the headline’s letterforms, dislike its line breaks and separately dislike its colour. Editing one entry must preserve the others.

| Rating | Meaning when reviewed | Default use if selected for generation |
| --- | --- | --- |
| Unrated | Collected for later or described in words | Include the note or crop as context |
| 1–2 stars | Negative, with 1 the strongest dislike | Avoid the judged treatment |
| 3 stars | Explicitly neutral | Supply comparison context |
| 4–5 stars | Positive, with 5 the strongest preference | Draw on the judged treatment |

Show the number and meaning to keyboard and screen-reader users. Allow clearing a rating back to unrated, changing a category, and editing or deleting a single note. Saving feedback never automatically selects it for generation. The details sheet should reflect the saved judgment immediately.

### 6. Workspace category settings

Start with Typography, Colour, Spacing and Imagery. Each category has a display name and editable **What to look for** guidance. For Typography, an initial definition could be “Look at typeface, scale, weight, line breaks and hierarchy.” The popover offers quick access to frequently used categories and a path to the full list.

In workspace settings, create, rename, edit, reorder or archive a category. A person could define **Make it pop** as “Create one strong focal point through scale or contrast. Keep the rest quiet.” It then appears alongside the defaults. Archiving removes it from new-entry choices while keeping existing judgments findable. Renaming retains their association. If guidance changes, future batches use the current wording and past batches retain the wording actually supplied.

### 7. Marked details overview

**Marked details** opens a workspace-wide sheet of saved regions. Show one crop with its source variant, round and judgments underneath. Default to browsing by aspect. A multi-aspect crop can appear in each relevant group, with matching judgments in focus. Count unique regions separately from judgments. Include untagged notes and regions awaiting review.

Filter by category, rating or polarity, and round or branch. The filter for neutral excludes unrated items. Selecting a crop opens its location in the full design. Back returns to the same overview filters and scroll position. Let the person select individual judgments across filters and branches. A persistent selection tray shows exactly what will travel into the next round, including hidden-by-filter selections, and allows removal.

### 8. Round history, branching and comparison

Each initial round is a root. Each subsequent round records the one round the person started from. A new round from an older sheet creates a sibling direction. Keep the previous children and all their designs accessible. Show the lineage as an indented history with stable round IDs, optional human names and the current round indicated. From the overview, show the proposed starting round in the new-round form and let the person change it.

Reference links record influences independently of parentage. For example, start Round 4 from Round 2’s typography studies and select a crop from Round 3’s imagery studies. History places Round 4 under Round 2. Its input summary links to the particular crop in Round 3. Reopening Round 4 explains both decisions.

Pin two variants from any rounds to compare them at a readable size. When reviewing a generated candidate, comparison also offers each source crop in the context of its whole artboard. Switching references keeps the candidate in place. On narrow screens, labelled Candidate and Source controls switch between the two views. Returning from comparison restores the originating sheet or canvas.

### 9. Directing an AI-assisted round

**New round** previews the parent round, inherited brief and fixed inputs, selected crops with their individual judgments, an optional direction and the requested count. Starting from a parent alone is valid. A person can deselect a judgment without deleting it from the workspace. Show conflicting instructions on the same treatment together so the person can revise them or try separate branches.

**Generate** commits those choices. The generator receives the brief, exact copy, assets, dimensions, selected source images and crop locations, ratings, notes, category definitions and new direction. The category identifies what to examine. The rating and note express what the person thought of this instance. A two-star “Make it pop” judgment saying “three things compete for attention” supplies a concrete treatment to avoid.

Offer exact preservation only for properties the generator can reproduce, such as a known crop or type setting. A person must explicitly lock such a property. Five stars alone expresses enthusiasm. For a flattened reference whose typeface is unknown, offer it as visual guidance. Generate imagery and composition around fixed requirements, and render supplied copy exactly. Retain a reviewable snapshot of the inputs for each round. Later edits to a note, rating or category must leave that historical record interpretable.

### 10. Export, persistence and recovery

Export any chosen variant as a PNG at its specified dimensions. Include only the composition. Exclude selection outlines, stars, notes and editor controls even if export occurs during inspection. Identify the variant and round in the download name.

After reopening, restore the brief, source assets, candidates, lineage, saved regions, judgments, categories and committed round inputs. Surface save failures and preserve unsaved input for retry. Existing prototype workspaces must open with their original designs and marks. Represent a legacy note as an unrated judgment; preserve uncertainty about a historical parent if it was never recorded.

### 11. Visual system and accessibility

Use the minimal studio vocabulary already established in the prototype. Charcoal and bone surfaces, hairline borders, compact glass panels and a neutral opaque artboard surround keep the work prominent. Use Geist for instructions and notes, Geist Mono for IDs, dimensions and zoom. Give each task one prominent action.

On desktop, open supporting controls in a side tray and resize a fitted canvas to keep the full design visible. On a phone, use a dismissible bottom sheet and keep the main action in reach. Put precision coordinates and optional settings behind disclosure. Restore focus to the opening control on dismissal. Support labelled controls, visible focus, keyboard navigation and zoomed text; distinguish selection, polarity and failures through shape or text as well as colour.

## Success criteria

These are proposed release tests.

- **First-use comprehension.** In a trial with five first-time users, at least four can start a 20-design batch, mark details on two different designs, generate a second round using both marks and export a choice without coaching or a command line. Observe where each person hesitates.
- **Useful variation.** For an open-ended brief, two reviewers can independently identify at least four materially different layouts or typographic hierarchies in a batch of 20 and point to what distinguishes them. All candidates retain the fixed copy and dimensions.
- **Feedback fidelity.** In the same trial, ask each user to point out where both of their selected details carried through. At least four can find a second-round candidate that reflects both to their satisfaction. A stored link to the source marks alone does not pass this test.
- **Scale and recovery.** Exercise all four batch sizes. In a 100-design session, mark the first and last variants, interrupt generation of a follow-up batch, reopen and retry. Verify the original marks still resolve to the same details and completed variants appear exactly once.
- **Canvas walkthrough.** At desktop and phone widths, inspect a portrait variant, switch from Fit to 100%, mark a detail near an edge, open its crop from the tray and return to its tile. Repeat by keyboard. Verify the outline stays on the same detail through zoom, resize and reopening, and that the exported PNG contains no editor overlays.

- **Branch and reuse.** Create two children of Round 1, start a fourth round from the first child and select a judgment from its sibling. Verify the history, recorded inputs and source links after reopening.
- **Independent feedback.** Give one region positive typography and negative colour ratings, add two separately rated typography notes, and leave another region unrated. Find these via the overview, clear one rating and send just one judgment into a round. Verify the generator receives the selected judgment with the correct polarity.
- **Category history.** Create a custom category, use it in a round, then rename it, edit its guidance and archive it. Verify the historical input summary, existing judgments and available new-entry choices.
- **Launch and exactness.** Launch a prefilled batch from a conversation, retry that launch and open an existing round for inspection. Verify that exactly one batch was created. Check the required copy, canvas size and any explicitly locked property in the resulting designs.

## Delivery and open decisions

1. **Review workflow.** Extend the local prototype with independent judgments, category settings, the details sheet, branching and cross-round comparison. Exercise the complete review loop with the procedural generator.
2. **Assisted generation.** Connect the conversation launcher and an image-generation path. Verify what the generator actually receives and measure whether users recognise their selected preferences in the results.
3. **Production trial.** Run the usability, variation, feedback and recovery tests above on real briefs before treating the product as ready for routine use.

Generator selection, host integration, workspace portability beyond one browser and the set of exactly reproducible properties remain open. Choose them against the behaviours and release tests above.
