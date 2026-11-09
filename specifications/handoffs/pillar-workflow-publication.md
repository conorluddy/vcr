# Pillar workflow publication handoff

Updated 2026-11-09.

## Resume here

The extraction, review, publication and cleanup are merged: [#179](https://github.com/conorluddy/vcr/pull/179) (`14539f7`) and [#180](https://github.com/conorluddy/vcr/pull/180) (`cc0ca7f`). Read current `AGENTS.md`, then the roadmap. Edit live skills and agents; the draft directory is historical evidence, not another maintained copy.

Thirteen making/review workflows were added, brief and typography revised, and an advisory accessibility reviewer added. Lighting and materials remain separate. The entry skill routes craft work through the pillar index. ADR 0008 allows advisory making workflows before checks; ADR 0006 still governs tool separation and rule ownership. The review skill uses the existing CLI only: plugin P3/P4, calibration and additional checks are not complete.

## Evidence and limits

The extraction audit is under `specifications/research/`; the draft index and `evaluation/` reports under `specifications/drafts/pillar-extraction/` distinguish independent trials, corrective reruns and synthetic media measurements. Generated trial artifacts are ignored local output and will not exist in every checkout. Requests, expectations and documented methods are tracked for reruns.

At publication: type checking and all 278 tests passed, repository validation checked 169 files with zero diagnostics, and the generated plugin was about 3.3 MB. The follow-up passed 15 focused reference/plugin tests and repository validation. These are historical results, not a substitute for checking a new change. The local sandbox initially blocked servers/browser launch; the full suite passed with appropriate permissions. Synthetic trials do not establish production usefulness, font provisioning, listening quality, flash safety or calibrated review.

## Next work

1. Select two or three real renders in an explicitly selected production workspace. Do not create production-specific material in this harness or touch sibling projects without authorisation.
2. Use the live workflows from brief and research handoffs through making, capture, relevant implemented checks and independent advisory review. Preserve the production's actual constraints rather than forcing every pillar into each task.
3. Record concrete friction, incorrect advice, missing evidence and owner conflicts. For GitHub follow-ups, check duplicates first; use `self-improvement` and relevant `loop:*` labels, link field notes, include evidence/workaround and a definition of done.
4. Make narrow live workflow corrections from those observations. Keep unsupported measurements explicit and human approval separate. Source-rule changes must update citations; do not copy thresholds into skills.
5. Continue engineering with #144 delivery gate, then #146 determinism findings and #145 flash analysis. #147 motion sampling, #148 rule data, #149 reviewer strengthening and #150 calibration remain separate tracks. #60 audio cues, #63 contact sheets and #173 plan approvals remain dependencies, not existing capabilities.

## Change checklist

For source changes, rebuild catalogue/plugin when applicable using `pnpm vcr catalog build` and `pnpm vcr plugin build`; never edit generated files directly. Run validation and checks appropriate to the change. In sandbox sessions where the pnpm/tsx launcher cannot create its IPC socket, `node --import tsx packages/cli/src/index.ts <command>` invokes the same CLI. Document any remaining evidence limitation accurately.

No shared timeline, compositor, review pages, reference retrieval or safety certification was introduced by the workflow publication.
