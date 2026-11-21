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
4. **Ask what they like, item by item.** After a bulk add, `vcr inspiration list --unannotated` shows what still has no note. For each, look at the file (`vcr inspiration show <id>` prints its absolute path; read the image, or a video's contact sheet), then ask the person what drew them to it and what to take from it. Most people would rather answer than run commands: give them the path to each file and a short question, a handful of items at a time, and accept a few words or "drop it". If an analyst has already looked, its questions make better prompts than a blank one. Record their answer in their words: `vcr inspiration annotate <id> --note "…" --aspect palette,composition`. The aspects are `palette`, `typography`, `composition`, `motion`, `texture`, `pacing` and `tone`.
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

## Analysis, on request

Intake measures; it does not look. When the person asks for their references to be analysed, or a look is about to be chosen and items have notes but no observations (`vcr inspiration list --unobserved`), give the items to the `inspiration-analyst` agent. It looks at each file and records what is there, per aspect, through `vcr inspiration observe`, which is the only thing it writes.

1. **Choose the model from the workspace.** `vcr status --json` reports `models`: the workspace's choice per agent, as one name or one per host. If `models["inspiration-analyst"]` is set, spawn the agent with that model (your host's entry when it is keyed by host); otherwise let the agent's own default apply. VCR never recommends or checks a model name, and neither should you: if the host rejects the name, tell the person, do not substitute another.
2. **Tell the agent which model it is running as**, in the prompt, so its observations are stamped correctly, along with the item ids, the decision the analysis is for, and the exact `vcr` invocation to use (with `--workspace <dir>` when it will not be started inside the workspace).
3. **Keep batches small**, a handful of items per agent, so each file is actually looked at.
4. **To compare two models**, run the same items under each, one after the other: observations carry their model and sit side by side in `show`. Two agents writing to the same item at once can lose an observation, so give concurrent agents different items.
5. **Relay, do not merge.** Where the agent's reading differs from the person's note, put it to the person as a question. Their note stands until they change it.

To set the model: add `"models": { "inspiration-analyst": "<model>" }` to `vcr.json`. This is the person's choice; ask before writing it.

## Citing items in a brief

A brief names the items it draws on, so a reviewer can hold the result to them. `vcr validate` rejects an id that is not in the library.

- Series brief (`projects/<project>/brief.json`): `"inspiration": [{ "id": "<id>", "takes": "<the principle taken>", "avoid": "<what must not carry over>" }]`.
- Video brief front matter: `inspiration: [<id>, <id>]`.

## Housekeeping

- A wrong or unwanted observation is removed only by the person, at their own terminal: `vcr inspiration retract <id> --observation <n>`, with the number `show` gives it. Never work around the refusal.
- `vcr inspiration remove <id>` shows what it would delete and which briefs cite the item; `--yes` applies. Removing is the only way a copied file is deleted: `vcr storage` reports the library's size and never clears it.
- A fresh clone has the records and none of the files. `show` says when a file is absent; ask the person for the original and add it again, which restores the same id.
- `vcr validate` fails on an asset with unknown rights and on a copied file that no longer matches its recorded hash.
