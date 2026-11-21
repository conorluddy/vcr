---
name: inspiration
description: Take in reference material the person provides (saved posters, screenshots, clips, fonts, colour sets) into the VCR workspace library, record what they like in each, and read the library before choosing a treatment. Use when the user hands over references, a folder of saved images, brand colours or a font, says "inspiration", "references" or "moodboard", or when a look is about to be chosen in a workspace that has a library. Not for finding references on the web (visual-researcher), preparing assets for a frame, or choosing the treatment itself.
---

# inspiration: what the person likes, before a look is chosen

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

A workspace has one inspiration library. Each item is a committed record at `inspiration/items/<id>.json`; its file is copied to `inspiration/files/<id>/`, which is git-ignored, so third-party media never enters git history. A record keeps three sources apart, and every reader should too:

| Source | Fields | Who writes it |
| --- | --- | --- |
| Stated | `note`, `aspects`, `use`, `rights`, `source` | The person. You pass their words through; you never compose them |
| Measured | `facts`, stamped with tool and version | `vcr inspiration add` |
| Judged | `observations`, stamped with agent, model and date | An analyst agent, on request |

## Taking material in

1. **Local files only.** `vcr inspiration add <file|dir>…` copies, hashes and measures each file; a directory is walked. Nothing is fetched: if the person gives a link, ask them to save the file, then add it with `--source <link>` so where it came from is on record. Re-adding the same file changes nothing, and restores a copy that has gone missing.
2. **Colours** the person gives as values go in as a named set: `vcr inspiration add --colours "#0B1F3A,#F2A33A" --title "Harbour night"`. Record them as given; do not tidy or extend the set.
3. **Read the warnings.** A missing measuring tool still adds the item and says which facts are absent; `vcr doctor` shows what is installed. Unsupported files in a directory are skipped and named.
4. **Ask what they like, item by item.** After a bulk add, `vcr inspiration list --unannotated` shows what still has no note. For each, look at the file (`vcr inspiration show <id>` prints its absolute path; read the image, or a video's contact sheet), then ask the person what drew them to it and what to take from it. Record their answer in their words: `vcr inspiration annotate <id> --note "…" --aspect palette,composition`. The aspects are `palette`, `typography`, `composition`, `motion`, `texture`, `pacing` and `tone`.
5. **Record source and creator** when the person knows them (`--source`, `--creator`, `--accessed`).

## Rules

- **Never write a note.** A note is the person's statement of taste. Do not draft one for approval, paraphrase an observation into one, or fill it from the file name. If they have not said, leave it empty and ask; a missing note is a warning in `vcr validate` that nothing but their words clears.
- **Inspiration is not permission.** Every item is `use: inspiration` unless the person says it is theirs to use. An inspiration item informs a treatment and never appears in a frame. Only `use: asset` may appear in output, and only with `--rights "<where permission comes from>"`; `--rights unknown` records the gap honestly and fails validation until settled. Never infer rights from an item being in the library, a font's embedded licence string, or a source address.
- **Take the principle, not the surface.** When an item informs a look, say what transfers independently of the source and what must not be carried over (`VREF-TRANSFER-EXPLAINED`, `VREF-EXCLUSION-STATED`; `vcr refs section visual-research 4`).
- **Keep production material in the workspace.** Never copy a reference, its name or its imagery into the plugin or the VCR repository.

## Reading the library before choosing a treatment

1. `vcr inspiration list`, or `--aspect <aspect>` for the decision at hand. One line per item, with the person's note.
2. `vcr inspiration show <id>` for the few that bear on the decision: the note first, then measured facts, then any judged observations, each labelled with its source.
3. Look at the file itself at the path `show` prints. Facts and observations support looking; they do not replace it.
4. Weigh the three sources differently. The note says what the person wants. Facts are reproducible. An observation is one model's reading on one day: use it to find things to look at, and never present it as the person's preference.
5. Then shortlist techniques (`vcr techniques list`, the `start` skill) against what the notes ask for, and say which items each candidate draws on.

## Citing items in a brief

A brief names the items it draws on, so a reviewer can hold the result to them. `vcr validate` rejects an id that is not in the library.

- Series brief (`projects/<project>/brief.json`): `"inspiration": [{ "id": "<id>", "takes": "<the principle taken>", "avoid": "<what must not carry over>" }]`.
- Video brief front matter: `inspiration: [<id>, <id>]`.

## Housekeeping

- `vcr inspiration remove <id>` shows what it would delete and which briefs cite the item; `--yes` applies. Removing is the only way a copied file is deleted: `vcr storage` reports the library's size and never clears it.
- A fresh clone has the records and none of the files. `show` says when a file is absent; ask the person for the original and add it again, which restores the same id.
- `vcr validate` fails on an asset with unknown rights and on a copied file that no longer matches its recorded hash.
