# 0005. Recommendation policy and licence migration

Date: 2026-11-04
Status: accepted

## Context

The capability graph PRD (§5, "Licensing & openness policy") asks for a versioned licence assessment in place of the free-text `license` property, and for runnable default recommendations limited to free, open-source components usable locally. Issue [#75](https://github.com/conorluddy/vcr/issues/75) (epic [#65](https://github.com/conorluddy/vcr/issues/65)) asks for that policy to be recorded before any filter is built.

Facts that force the decision:

- The catalogue holds 146 records. Each `license` is a free-text string; 11 records have no `license` key at all (8 web platform APIs, plus openusd, pure-data and sox).
- Several strings carry their own caveats ("recheck", "verify dependencies", "model weights not assessed"). None records a check date or source URL for the licence itself.
- The PRD (§1) says the parent PRD "previously catalogued proprietary resources". That reads as if the catalogue's scope changed. It has not. The catalogue records what exists, including proprietary tools; the open-source focus applies to what VCR recommends as a runnable step.
- The G0 spike (`specifications/spikes/capability-graph-g0.md`, "Recommendation", accepted 2026-11-04) put `operations[]`, graph storage and search on hold until its CG1 reopen conditions hold. #75 therefore proceeds as an ADR only.
- Licence research for this ADR on 2026-11-04 could not reach gsap.com, imagemagick.org, spdx.org, opensource.org, w3.org, license.whatwg.org, chromium.googlesource.com or playwright.dev; the session's network policy denies those hosts. The worked cases below rely on official copies that were reachable: the projects' own GitHub repositories, SPDX's `license-list-data` repository and the npm registry. Pages that were only reachable at the blocked hosts stay unknown.

## Options considered

1. **One `open_source: true` flag per record.** Cheap. It merges rights that differ (run, bundle, redistribute, outputs), invites self-assertion and cannot say "unknown".
2. **Remove or retier proprietary and unclear records now.** Simplifies the catalogue. It destroys discovery and gap research, conflates policy with tier and validation, and rewrites 146 records on unverified readings.
3. **Separate policy dimensions, conservative eligibility, migration deferred until a filter exists.** No catalogue rewrite now. Costs a review per record later, done only when something consumes it.

## Decision

Option 3. Five dimensions are recorded and evaluated separately; none implies another:

1. **Catalogue inclusion.** Any tool relevant to creative work may have a record, proprietary or not.
2. **Default runnable recommendation eligibility.** A record is eligible when verified terms allow free local use, **including commercial use**, with no required payment, subscription, licence key, API credit or watermark-removal fee. An OSI-approved licence is not required while VCR is the owner's own tool; the licence class (`osi-approved`, `source-available`, `proprietary`, `unknown`) is still recorded so a stricter rule can be applied later without new research. A free-below-a-threshold licence (for example a company-size limit) is eligible for the owner's current use, with the threshold recorded so it resurfaces if VCR is shared. Non-commercial-only tiers, outputs watermarked unless paid, and paid-only tools or services are not eligible. An independently usable free local core qualifies despite an optional paid hosted offering; a free tier of a hosted service whose local use is not free does not. Declared workflow dependencies, model weights, custom nodes, plugins and bundled media are assessed separately from the headline tool. Unknown or conditional rights are **not eligible** until reviewed.
3. **Reference-only discovery.** Proprietary, paid-only and not-yet-eligible records stay discoverable, segregated from executable path steps, with the reason shown.
4. **Native command access.** Policy never disables a native command or blocks a user from running an installed tool directly. Whether a tool's own terms permit a given use is not decided by this policy.
5. **Redistribution and bundling.** Whether VCR or a user may ship, bundle or publish a tool, its models or its outputs is a separate question, never answered by eligibility.

Policy eligibility is distinct from technical compatibility: a compatible handoff may be ineligible, and an eligible tool may be incompatible. Exclusion by the recommendation filter never deletes a catalogue entry, changes its tier, validation evidence or `adapter_maturity`, or disables native commands. A missing licence string is unknown, not proprietary. Assessments are version-scoped and expire to unknown. Nothing here is legal advice or a compliance guarantee; assessments are conservative signals (PRD §1).

**Migration.** Existing `license` strings are preserved verbatim. A versioned licence assessment (PRD §5 fields: SPDX expression where applicable, source URL and checked date, separate code, model, media and codec terms, obligations, required services, output rights, and class `osi-approved`, `source-available`, `proprietary` or `unknown`) is added per record only when the recommendation filter is implemented. That waits for the CG1 reopen conditions or a separately approved slice. No catalogue-wide rewrite happens now.

**Worked cases** (read 2026-11-04; catalogue strings are quoted from the records, licence facts from the sources named):

- **GSAP** (`gsap`, core). The npm registry entry for `gsap` 3.15.1 (https://registry.npmjs.org/gsap/latest) gives its licence as "Standard 'no charge' license: https://gsap.com/standard-license". The project README (https://github.com/greensock/GSAP, `master`) says GSAP "is now **100% FREE** including ALL of the bonus plugins ... even for commercial use". The licence text itself sits at gsap.com, which could not be read, so any restriction (for example on competing tools) is unknown. It is not an SPDX-listed or OSI-approved licence. **Outcome: eligible** (free including plugins and for commercial use, per README and npm; not OSI-approved, class `proprietary` no-charge). The full standard-licence text is unread, so the assessment notes it for re-reading at gsap.com. It stays in the catalogue at `core`, its native commands are unaffected, and an agent may still use it when a user's project already does. See "Owner decision" below.
- **ImageMagick** (`imagemagick`, catalogued). The official repository LICENSE (https://github.com/ImageMagick/ImageMagick/blob/main/LICENSE, read 2026-11-04) allows use "for personal, company internal, or commercial purposes" and in distributions, and requires attribution and a copy of the licence on redistribution. SPDX's licence list data (https://github.com/spdx/license-list-data, `json/licenses.json`) lists `ImageMagick` with `isOsiApproved: false`. Delegate libraries in a given build (for example Ghostscript) carry their own terms and are unknown here. **Outcome: eligible** (commercial use permitted with attribution; a permissive licence not on the OSI list). Delegates in the actual build are assessed separately. Record, tier and native commands are unchanged; see "Owner decision".
- **Native browser APIs** (`webcodecs`, `web-audio`, `webgl`, `webgpu`, `canvas-2d`, `web-animations-api`, `mediarecorder`, `svg`). A platform API is assessed separately from the runtime that implements it. WHATWG's specification repositories carry a LICENSE (for example https://github.com/whatwg/html/blob/main/LICENSE) stating the text is under CC BY 4.0, with portions incorporated into source code under BSD 3-Clause; that governs the specification text, not whether a runtime may be used. The runtime VCR selects is Playwright (repository LICENSE: Apache-2.0, https://github.com/microsoft/playwright/blob/main/LICENSE) driving Chromium, whose source LICENSE (official mirror https://github.com/chromium/chromium/blob/main/LICENSE) is BSD-style. Playwright's browser docs (`docs/src/browsers.md` in the same repository) say it uses Chromium headless shell for headless runs and that "Chromium does not have all the codecs that Google Chrome or Microsoft Edge are bundling due to various licensing considerations". The terms of the exact downloaded build were not checked. **Outcome: API records keep no licence string and are not classed proprietary; runnable eligibility follows the selected runtime, which is eligible (Playwright Apache-2.0, Chromium BSD-style), scoped to the Playwright release and its downloaded build.**

**Owner decision (2026-11-04).** GSAP and ImageMagick are free for commercial use but not OSI-approved. The owner chose to count anything free for commercial use as eligible while VCR is the owner's own tool, rather than keep a strict OSI rule or list named exceptions.

**Migration summary.** A draft classification of the free-text strings (2026-11-04, no record changed) found these draft labels: eligible-candidate 77, conditional-or-unknown 55, reference-only 3 (after-effects, houdini, shotstack), platform-standard 8, no-licence-string 3. "Eligible-candidate" means the string names a licence identifier (for example MIT or GPL-3.0) with no caveat; OSI status was not checked against opensource.org. The labels are not tiers, policy outcomes or eligibility decisions, and none is written to any record; eligibility needs a verified assessment.

The PRD's policy wording should read: the catalogue records tools regardless of licence; VCR's default runnable recommendations focus on eligible free, open-source local components; proprietary records remain in the catalogue and, once a recommendation filter exists, are shown as reference-only, with no mass deletion.

## Consequences

- Easier: one vocabulary for the filter, `vcr graph` explanations and ingestion; unknowns are visible instead of guessed; no record or tier churn.
- Harder: nothing is eligible until assessed, so a first filter will recommend little; each assessment needs readable official sources and expires; the looser rule must be tightened before VCR is shared, which the recorded licence class makes cheap.
- Must now do: correct the PRD parent/child wording in a follow-up edit; keep new records' `license` strings as today and record unknowns honestly; when the filter is approved, add the assessment schema and assess core tools first (gsap, three-js, p5-js, svg, blender, ffmpeg-ffprobe) plus the Playwright browser build, from official sources with dates.

## Revisit when

VCR is distributed to or used by others (the plugin is published or shared): eligibility then returns to a stricter rule, at least OSI-approved or explicitly named exceptions. Also when the CG1 reopen conditions in the G0 spike are all met, or a recommendation-filter slice is approved, whichever comes first. Re-read the GSAP standard licence once gsap.com is reachable, and re-check the worked cases when GSAP, ImageMagick or Playwright publish a new major version.
