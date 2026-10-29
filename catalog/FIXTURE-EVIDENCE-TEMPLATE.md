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
- Expected failure modes and stop conditions:
- Reproduction instructions; how to inspect output:

## Observation, after running

- Date and executor; actual environment and commands:
- Observed output, checks, hashes or measurements and exit status:
- Pass / partial / fail / blocked, with reasons and evidence paths:
- Deviations, limitations, nondeterminism and unexpected side effects:
- What this result does and does not establish:
- Reviewer, decision, follow-up and invalidation/revisit triggers:

Never populate `validation.evidence` with a plan. If a tool is unavailable, report blocked/not run and retain `not-validated`; do not install silently or substitute a different tool and claim the original passed.
