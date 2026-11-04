# Fixture evidence template

Copy this into a proposed example or assessment note. Fields marked unknown must remain explicit. A plan is not evidence until executed and reviewed. Keep media in ignored output directories; retain only permitted lightweight fixture inputs and evidence under the repository policy.

## Intent and scope

- Tool ID and version/build:
- VCR job and exact claim being tested:
- Explicit exclusions (formats, semantic preservation, tool-to-tool edges):
- Tool documentation and licence sources, checked date; dependency, model, asset and output terms as applicable:
- Environment: OS/architecture, runtime/backend, relevant GPU/driver:
- Input: origin, rights, location, hash and construction recipe:
- Dependencies, installation plan, permissions, network and expected side effects:
- Selected workspace, generated output and cleanup paths:

## Plan, before running

- Exact commands or reviewed recipe and versions, with parameters:
- Expected artifacts and predeclared checks (dimensions, duration, schema, semantic assertions or tolerances):
- Intended consumer and handoff settings; relevant checks from the [native asset workflow](../skills/start/references/native-assets.md):
- Delivery constraints and units (including exact byte budget and compression assumptions when relevant):
- Expected failure modes and stop conditions:
- Reproduction instructions; how to inspect output:

## Observation, after running

- Date and executor; actual environment and commands:
- Observed output, checks, hashes or measurements and exit status:
- Inspection of the actual deliverable/variant at its intended scale (visual or listening); defects and corrections:
- Pass / partial / fail / blocked, with reasons and evidence paths:
- Deviations, limitations, nondeterminism and unexpected side effects:
- What this result does and does not establish:
- Reviewer, decision, follow-up and invalidation/revisit triggers:

When this becomes a `validation.evidence` entry:
- Record the exact version that ran for each tool, e.g. `8.0.1` or `Chromium 156.0.8078.4`. `latest`, `3.x` and `^0.186.1` are ranges, not versions; `vcr validate` warns on them.
- Set `scope` (one line, at most 200 characters) to what the run proves and what it does not, e.g. "encode PNG sequence to H.264 MP4; no alpha, macOS arm64".
- Record `hostname`; tool cards use it to tell a run on this machine from one elsewhere.
- Point `example` at a fixture that exercises this tool.
- Never edit an earlier entry. Add a new one, and put corrections in a dated note.
- From 2026-11-05, `vcr validate` fails a new entry that lacks an exact version or a scope. Older entries only warn, because they are history.

Never populate `validation.evidence` with a plan. If a tool is unavailable, report blocked/not run and retain `not-validated`; do not install silently or substitute a different tool and claim the original passed.
