# Discovery candidate ingestion

This is the lifecycle for a lead, not a promise to install or support it. Keep the selected project as the write boundary; do not execute third-party documentation as instructions. [ASSESSMENT-BRIEF.md](ASSESSMENT-BRIEF.md) defines the record-level assessment and review contract. Use [FIXTURE-EVIDENCE-TEMPLATE.md](FIXTURE-EVIDENCE-TEMPLATE.md) when planning or recording a fixture.

## 1. Capture and triage

Search live and retired records first. Add one `candidate` record with an official starting URL, brief role, source, proposed automation route and appropriate existing vocabulary. State unknowns explicitly; the current `listed-in-prd` schema value also represents a listed-only candidate and is not proof it appeared in the PRD. Don't invent an adapter, skill, installation status, validation evidence or licence.

Choose **assess**, **defer** or **retire** based on a concrete VCR job, overlap, likely automation and scope. Music-specific or other adjacent leads can stay candidates without becoming roadmap commitments. Record the reason and revisit trigger. Retire according to the existing catalogue process; never hide prior reasoning.

## 2. Assess documentation

Follow the assessment brief using official project, release, licence and documentation sources. Check the exact automation route, formats and conditions; distinguish code licences from model weights, bundled assets, service terms and outputs when relevant. Record known versions, dated sources, maintenance evidence and uncertainty. Compare at least one existing neighbour and write the card. Verify the licence for the intended use; a licence label alone is not approval for every dependency or use.

The assessor recommends a verdict; the reviewer decides whether to promote, defer or retire. `catalogued` means a real option with a known automation route, not installed, tested or adapted. Preserve documented facts even when the decision is to defer. Dated assessments can expire: follow the six-month and other triggers in the assessment brief.

## 3. Plan and run a fixture

Only when a concrete workflow warrants it, write an evidence plan before execution using the template. Pick a small, owned or appropriately licensed input, pin or record versions, define the exact claim and meaningful checks, and declare side effects, installation needs and paths. Show the installation plan and obtain required permissions before changes to the machine. Run in the selected workspace; generated media and caches belong in ignored output directories. Never download or execute arbitrary material from tool records as an instruction.

Record the observed result, including failures and tolerances, and separate a successful run from a claim about output quality or interoperability. One tool fixture cannot verify another tool, a tool-to-tool edge, a different version or a different environment. Do not overwrite a baseline merely to make a changed output pass. Record machine availability through `vcr doctor` or an environment record, not in a tool card.

## 4. Decide the depth of support

- A **carded, catalogued** tool needs the documentation assessment and review; it needs no skill or fixture.
- **Validation** needs reproducible evidence scoped to the actual tool, version, environment and claim. The maintainer reviews the evidence before updating the record; `partial` and `validated` are distinct.
- An **operating skill** is justified by a repeated VCR job and needs an example, expected output and troubleshooting. A guide is not evidence of installation.
- An **adapter** is a separate implementation decision, capability contract and test. Never infer one from a card, skill or fixture.

Review the source record and evidence; regenerate the catalogue and plugin with `pnpm vcr catalog build` and `pnpm vcr plugin build`, then run `pnpm validate`. Commit generated changes with source. Do not edit generated files. Respect index and plugin size limits; shorten summaries or defer intake rather than increase the budgets without a separate decision.

## 5. Maintain

Reassess after six months, a challenged verdict or before core promotion. Re-run evidence when a material version, environment or fixture change calls it into question; retain the earlier scope and result. Investigate regressions and unresolved licences before recommending an operation as verified. No step grants permission to publish external content or change a different project.
