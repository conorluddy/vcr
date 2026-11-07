# VCR — Agent plugin and review layer

Version: 0.1 • Date: 28 October 2026 • Owner: Conor Luddy

Status: Active. P0 (three roots), S1 (spike) and P1 (installable plugin) are done; P2 is next. Child of `vcr-prd.md`; requirement IDs there (L0-03, L1-05, L6-01 and so on) are quoted, not restated. Architecture is recorded in ADR 0003 (`decisions/0003-plugin-distribution-and-three-roots.md`). Refines parent §7 (distribution) and §13 (skills), and pulls an early slice of Layer 6 forward.

## 1. Product definition

VCR ships as three layers that meet only at files.

| Layer | What it is | Used by | Writes |
| --- | --- | --- | --- |
| Harness core | Catalogue data, schemas, the `vcr` CLI, the capture runtime | Anyone with a terminal | Workspace and machine state, never itself |
| Agent layer | A plugin for Claude Code and Codex: router skill, toolkit skills, workflow skills, guardrail hooks. Thin; it teaches an agent to drive the core | Coding agents | Through the CLI and scene source |
| Review layer (human) | Generated local pages: watch a render, scrub frames, pin notes to frames, compare revisions, approve, see and reclaim storage | The human reviewer | Findings, approvals, and clearing regenerable output (§6.5) |

User data lives in two places that belong to no layer: the **workspace** (projects, videos, renders, findings, approvals) and **machine state** (environment record, installed runtimes).

Thesis: the plugin equips the editor and the review layer equips the reviewer. Files are the only channel between them, so each layer works without the one above it. This is ADR 0002 ("the agent is the editor; the human is the reviewer") given a product shape. Clearing regenerable output is housekeeping, not editing: it changes no source, finding or approval.

## 2. Problem and evidence

- P1. VCR is unusable outside its own repository. `findRepositoryRoot()` (`packages/cli/src/repository.ts`) walks up to `catalog/`; `vcr doctor` writes into the repository; skills are found only through the `.claude/skills` symlink; the first product repository's `render.ts` imports `@vcr/capture` through the pnpm workspace.
- P2. Codex sees none of it.
- P3. There is no human review surface. The proof of concept's `review/first-cut.md` (commit `6aa0f87`; removed in #23) ends "awaiting Conor's notes" and records that "no workflow skill for briefing or review existed".
- P4. Frame references are ambiguous. The brief's `product f0210` is scene-local (the product scene is 330 frames), but L6-01 requires composition frames. Notes travel through chat and lose their anchor.
- P5. Nothing stops self-approval. L6 acceptance says "self-review does not automatically mean approved"; nothing enforces it.
- P6. Videos eat disk fast. The proof of concept left 160 MB of ignored `output/` behind one 20-second, 30 fps video, and frame sequences, MP4s, proxies and Chromium are scattered across ignored directories that nothing reports or clears.

## 3. Users and jobs

The agent (Claude Code or Codex) discovers, selects, authors, renders, reads findings, revises and requests review. It never approves. The human briefs, watches, points and decides, and never has to read JSON to do so.

- J1. Install VCR into any directory with one command per host. The agent picks the right tool within the existing tier budgets.
- J2. Start a video inside a product repository (for example `~/Development/my-product`), not only inside the harness repository.
- J3. Watch the latest render and pin a note to frame 210 of the product scene in two clicks.
- J4. Next session, the agent picks up open notes without being told.
- J5. Compare revision N with N−1 at the same frames, including before/after evidence per note.
- J6. Approve a revision. The agent cannot approve, even by accident.
- J7. Review on a phone through an explicit, private share.
- J8. All of the above in Codex, except J7 (see §9).
- J9. See what VCR is using on disk, per root, video and render, and reclaim it in one action without losing anything that cannot be regenerated.

## 4. Goals and non-goals

Goals: one install per host; works from any directory; zero writes to the plugin directory; host parity by construction; a human never needs a terminal to review; storage is always visible and reclaimable; files are the contract; local-first.

Non-goals for v1:

- An editor, live preview or parameter editing (ADR 0002).
- An MCP server.
- Multi-user collaboration or hosting.
- Publishing to social platforms.
- A public marketplace listing. v1 must not block one.
- Moving the composition engine (ADR 0001 is unaffected).

Audience: Conor first, public later. Going public must be a packaging change, not a redesign.

## 5. Principles

1. **Files are the interface.** Every surface reads and writes schema-validated workspace files. No layer holds state another layer cannot read.
2. **The harness is read-only at runtime.** The plugin cache can be replaced at any moment.
3. **Thin agent layer.** Skills describe and route; the CLI acts. Logic lives in the CLI, which is why parity holds by construction.
4. **Generated, disposable surfaces.** The review pages can be rebuilt from files, as `catalog/INDEX.md` is.
5. **Human-only actions get human-only channels**: approval and resolving a finding.
6. **Graceful degradation.** The core works without the plugin, the plugin without the review layer, the review layer without an agent.
7. **Space is a first-class resource.** Every byte VCR writes belongs to a named storage class with a size report and a clear command. Clearing never touches source, findings, approvals or anything else that cannot be regenerated.
8. **Progressive disclosure carries over.** Tier budgets (16 KB index, 12 KB guide) apply to everything the plugin loads, including `vcr status`.
9. **Honest evidence.** A ✓ on a catalogue record means "validated in the author's recorded environment". The user's own `vcr doctor` is the only installation fact on their machine (L0-02).

## 6. Architecture

### 6.1 Three roots

Replaces `findRepositoryRoot()`.

| Root | Holds | Writable | Resolution order |
| --- | --- | --- | --- |
| Harness | `catalog/`, `skills/`, `examples/` (source only), schemas, CLI bundle | No | Location of the CLI bundle, or `VCR_HARNESS` |
| Workspace | `vcr.json` marker, projects, videos, `review/`, references; ignored `output/` and `.cache/` | Yes | `--workspace`, then `VCR_WORKSPACE`, then the nearest ancestor of cwd holding `vcr.json` |
| Machine | Environment record, installed capture runtime (Playwright and Chromium), share proxies | Yes | `VCR_HOME`, default `~/.vcr`. Host-independent, so Claude Code and Codex share one Chromium |

- In the harness repository, harness and workspace resolve to the same directory (dev mode). Maintainer commands (`catalog build`, `doctor --record` into `environment/`) exist only there.
- `vcr.json` is a minimal marker: `schema_version`, `projects[]`, `harness_version`. The L1 child specification owns any extension.

### 6.2 Agent layer: plugin contents

**Manifests.** A Claude Code manifest and a Codex manifest, both generated from one source by `vcr plugin build` (§6.7).

**Skills** (Agent Skills format; identical files for both hosts). No skill carries a `vcr-` prefix, because the host's plugin namespace already scopes it: `/vcr:start`, `/vcr:init`, `/vcr:gsap` in Claude Code. A skill's name is its directory name.

- `start` (router; `/vcr:start`): the four-tier navigation from `AGENTS.md` and a pointer to `INDEX.md`. Its description triggers on VCR context (a `vcr.json` workspace, or the user naming VCR), so it does not claim every "make a video" request from HyperFrames, which is installed on the same machine.
- Eight toolkit skills (`gsap`, `three-js` and the rest), unchanged apart from dropping the `vcr-` name prefix and path fixes. Repository-relative paths such as `examples/three-capture/run.sh` become `vcr tools examples <id>` calls.
- `init` (new; `/vcr:init` in Claude Code): set up a workspace. Reports and stops if one already exists (`vcr status --json`); otherwise picks the git root (asking only when ambiguous), runs `vcr workspace init` and `vcr doctor`, and offers `vcr setup capture` with the download size when the capture runtime is missing. Ends with the three roots and an offer to hand off to `brief`. Agent- and human-invocable: "start a video here" outside a workspace may trigger it.
- `brief` (new; `/vcr:brief`): interview the human, then write `brief.md` (objective, audience and placement, content, constraints, review notes), shaped on the proof-of-concept brief.
- `review` (new; `/vcr:review`): read open findings (summary first), fix the source, re-render the affected range, attach before/after evidence, mark the finding `addressed`, then open the review pages and request review.

**CLI.** A bundled single file, `cli/vcr.mjs`, committed inside the plugin. It runs on system Node 22 or newer with no install step.

- Committed because Claude Code installs plugins from git and runs no build scripts. `tokextract` broke for exactly this reason.
- The capture runtime is bundled with `playwright` left external, so it resolves from `VCR_HOME/runtime` after `vcr setup capture` (closes L0-03).
- No `bin/` directory: in Claude Code it blocks installs in claude.ai and Cowork, and Codex does not put it on PATH.
- Invocation (settled by spike S1, `specifications/spikes/plugin-invocation.md`): the plugin root is two directories above the calling SKILL.md, and skills run `node <root>/cli/vcr.mjs …`. Both hosts give the model the current SKILL.md path every session, so this survives updates. Codex deletes the old version directory on update. `${CLAUDE_PLUGIN_ROOT}` works only on Claude Code, and a hook-written shim never runs on Codex.
- Under Codex (`CODEX_SANDBOX` set), the CLI does three things, and `vcr status` reports them:
  - defaults `VCR_HOME` to `<workspace>/.vcr` unless `~/.vcr` is writable;
  - keeps temp files inside `VCR_HOME`;
  - launches Chromium with `--single-process`, the only mode S1 found that runs inside the seatbelt sandbox.

**Hooks.** Claude Code only: Codex 0.164 lists `plugin_hooks` as removed (S1). User-scope plugin hooks fire in every Claude session on the machine, so each hook must be silent and fast outside a VCR workspace.

- Session start: run `vcr status --brief` (≤ 1 KB: videos awaiting review, open-finding counts, and one storage line when over budget).
- Before a tool runs: deny edits under `review/approvals/` and under the harness root.
- Hooks only make things smoother. Every rule is also enforced in the CLI (§6.4).

**Not in v1: MCP server, plugin commands.** CLI `--json` output is the tool surface on both hosts.

**Subagents ship as advisory reviewers and researchers** (`agents/`, ADR 0007). They call the CLI like any agent and add no tool surface. Claude Code loads them as subagents; Codex support is partial, so there they are prompts a session can read. Nothing depends on them: every rule they apply is also a check or a rule ID a human can look up.

- Plugin commands port poorly between hosts.
- MCP is the fallback if S1 cannot make CLI invocation reliable, because each host launches the server with a known root. Its costs: a long-running process, tool schemas held in context, and minute-long renders that do not suit synchronous tool calls.
- Also revisit when a target host has no shell.

### 6.3 Review layer

Surfaces:

- **Videos** (`vcr review open`): every video in the workspace with its state (`draft`, `in_review`, `changes_requested`, `approved`), open-finding count, disk usage and latest thumbnail.
- **Render** (per video and render): a player (the MP4 when assembled, otherwise a frame-sequence player), a scene strip with boundaries, a contact sheet, and a scrubber showing composition frame and scene-local frame. Notes list alongside. Clicking a frame opens the note form with video, render, scene and frame pre-filled; the human adds severity, text and an optional region box.
- **Compare**: two renders at the same composition frame, side by side or as a wipe, plus each finding's before/after pair.
- **Decide**: approve or request changes, with an optional note.
- **Storage**: usage by root, storage class, video and render, largest first, against the workspace budgets. Each clear action shows what it will delete and how many bytes before it runs (§6.5).

Mechanics:

- `vcr review serve|open` starts a server bound to 127.0.0.1 on a random port, with a per-session token in the URL. It checks the Origin header on every POST, re-reads files on every request, and pushes a refresh when manifests change, so a new render appears on its own. It exits after 30 minutes idle. No daemon.
- `vcr review build` writes a self-contained static bundle: read-only, "copy note as text" in place of POST. It is the input to share.
- Static HTML and inline JS, no framework, so the bundle stays small. Visual design is a P3 task (frontend-design skill).

### 6.4 Review data contract

Workspace files, per video.

- **Render manifest (review subset)**: `render_id`, `video_id`, `fps`, dimensions, `duration_frames`, `scenes[{id, start_frame, end_frame, frames_dir}]`, `outputs[{kind, path, sha256}]`, `created_at`, environment. `render_id` is `r-<UTC yyyymmddThhmmss>-<first 7 hex of the frame content hash>`; an optional `frame_sha256[]` carries per-frame hashes for determinism checks. This PRD needs only this subset; the L1 child specification owns the full schema (L1-05). The capture path owned by `vcr` emits it (ADR 0003).
- **Retained revision**: `review/renders/<render_id>/` holds the manifest, a contact sheet and evidence frames under the 200 KB-per-image preview policy, and is committed. It is the evidence storage class (§6.5). Full frames and the MP4 stay in ignored `output/` and may be deleted; Compare then falls back to the contact sheet and evidence frames and says so (L6-04).
- **Finding**: one file per note, `review/findings/F-0007.json`, so concurrent human and agent writes stay conflict-free and diffable. Fields: `id`, `render_id`, `scene_id`, `frame` (canonical composition frame), `scene_frame` (derived), optional `region {x, y, w, h}` in 0–1 units, `severity` (`blocker | major | minor | note`), `text`, `author {kind: human | agent}`, `source` (`review | cli | chat | share`), `status`, `created_at`, `resolution {render_id, note, evidence[]}` (the agent's claimed fix), `closure {channel, at, note}` (the human decision; required for `resolved` and `wontfix`).
- **Reviewer fields** (optional; written by `vcr lint`, other automatic checks and reviewer agents; `references/critique-methodology/` §2–3 is the method):
  - `frame_end` (inclusive) makes the finding a range.
  - `selector` locates it in the scene DOM.
  - `rule_id` is the pillar rule, such as `TYPO-SAFE`.
  - `kind` is `measured | judged | hybrid`.
  - `severity_basis` is `measured_rule | brief_clause | standard_rule | platform_rule | heuristic_rule | taste`.
  - `confidence {value 0–1, basis: deterministic | multi_sample_agreement | single_judgement | inferred_from_stills}`.
  - `evidence {metric, value, threshold, artifacts[]}`: what a human checks in about 10 seconds.
  - `reviewer {agent, model, rules_version}`.

  Severity caps follow the basis. `taste` is at most `note`. `heuristic_rule` alone is at most `major`, and `major` then needs an artifact. A judged `blocker` with confidence below 0.8 is escalated to the human, not filed as a blocker. Human notes need none of these fields.
- **Finding states**: `open` → `addressed` (the agent claims a fix and attaches evidence) → `resolved` (human only); or `wontfix` (human only). The agent may reopen only its own findings.
- **Approval**: `review/approvals/<render_id>.json` with `decision` (`approved | changes_requested`), `manifest_sha256`, `channel` (`review | tty`), `at`, `note`.
- **Human-only channels**: the token-gated review-page POST, or `vcr review approve|resolve`, which requires an interactive TTY and typing the video id. Agent hosts run commands without a TTY.
- **Schemas**: `catalog/schemas/render-manifest`, `finding` and `approval` (`.schema.json`); the severity caps are `if/then` rules in the finding schema.
- **Validation**: `vcr validate` rejects an approval whose manifest hash does not match a retained render, and a `resolved` finding without a human channel. This is a guardrail against accidental self-approval, not a security boundary.
- **Writes** are atomic (temp file, then rename) and idempotent: re-posting the same note does not duplicate it.
- `review/REVIEW.md` is a generated human-readable summary, keeping the git-diffable narrative that `first-cut.md` provides today.

### 6.5 Storage

Every byte VCR writes falls into one of five classes. Sizes are reported per class, root, video and render; budgets live in `vcr.json` under `storage`.

| Class | Where | Regenerable | Committed | Cleared by |
| --- | --- | --- | --- | --- |
| Output | Workspace `output/`: frame sequences, MP4s, ranges | Yes, by re-rendering | No | `vcr storage clear output`, Storage view |
| Cache | Workspace `.cache/`: intermediate captures, transcodes | Yes | No | `vcr storage clear cache`, Storage view |
| Evidence | Workspace `review/renders/`: manifests, contact sheets, evidence frames | No | Yes | `vcr storage prune evidence` only |
| Proxies | `VCR_HOME/proxies`: share transcodes | Yes | No | `vcr storage clear proxies`, Storage view |
| Runtime | `VCR_HOME/runtime`: Playwright and Chromium | Yes, by `vcr setup capture` | No | `vcr storage clear runtime` |

- `vcr storage [--video <id>] [--json] [--limit --offset]`: the size report, largest first.
- `vcr storage clear <class> [--video <id>] [--render <id>] [--older-than <days>] [--keep-latest <n>]` prints the planned deletions and byte total, and applies them only with `--yes`. It is idempotent and agent-safe, because everything it removes is regenerable.
- `vcr storage prune evidence --video <id> --keep <n>` reduces older retained revisions to manifest plus contact sheet. It never prunes the latest revision, an approved revision, or one cited by an open finding. Git history keeps what was pruned.
- Budgets: `storage.output_warn_bytes` (default 5 GB per workspace) and `storage.evidence_warn_bytes` (default 2 MB per video). Over budget is a warning in `vcr status`, `vcr validate` and the Storage view, never a failure and never an automatic deletion.
- Clearing output under a render keeps its retained revision; Render and Compare fall back to it and say so.
- The Storage view clears output, cache and proxies through the token-gated POST, with the same plan-then-apply step. Runtime and evidence are CLI-only.

### 6.6 The loop

1. The human asks for a video. `brief` interviews them and writes `brief.md`; the human confirms it.
2. The agent authors and renders. The render manifest and retained revision are written, the state becomes `in_review`, and `vcr review open` runs.
3. The human leaves notes and requests changes.
4. Next turn or session, the session-start hook (or the skill calling `vcr status`) surfaces open findings. `review` fixes them, re-renders the affected ranges, attaches before/after evidence and marks each `addressed`.
5. The human compares, resolves and approves. The approval names the manifest hash; a reference record may then move to `approved` (L7).

### 6.7 CLI additions

```text
vcr workspace init
vcr status [--brief] [--json]
vcr findings list|show|add|address           (agent-safe)
vcr review approve|request-changes|resolve   (TTY only; the rest of `vcr review` is agent-safe)
vcr review open|serve|build|share
vcr storage [--video <id>] [--json]
vcr storage clear <class> [...] [--yes]     (agent-safe; dry run without --yes)
vcr storage prune evidence --video <id> --keep <n>
vcr setup capture                            (reports planned changes, idempotent, installs into VCR_HOME)
vcr example create <id>
vcr plugin build                             (maintainer only)
```

Existing commands keep their behaviour. `catalog build` and `doctor --record` are maintainer-only. Every command gets `--json` and stable exit codes (parent §14); errors use `{code, message, retryable}`.

### 6.8 Assembly and release

- `vcr plugin build` assembles a generated, committed `plugin/` directory, the same convention as `catalog/INDEX.md`. Contents: skills; catalogue (`INDEX.md`, `tools.json`, cards, vocabulary); example sources without `node_modules`, `output/` or media; `cli/vcr.mjs`; review-page templates; `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`.
- `vcr validate` fails on a stale `plugin/`, as on a stale index. It also checks tier budgets, no media, total size under 5 MB, and manifest versions equal to the harness version.
- Examples become runnable outside the repository through `vcr example create <id>`, which scaffolds into the workspace (parent §14). They are no longer run in place against the pnpm workspace.
- Marketplaces: `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json` at the repository root, both with source `./plugin`. Precedent: `ios-simulator-skill`, installed from one repository into both hosts today.
- The repository stays private. "Public later" means a licence plus either flipping visibility or splitting `plugin/` into its own repository, since clones currently carry `projects/` media.
- One semver version for harness, catalogue and plugin. `vcr.json` pins `harness_version`; the CLI warns on a major mismatch (L1-05).

### 6.9 Prior art

- **HyperFrames**: same split, different human layer. Its agent layer is skills driving an npm CLI pinned to the plugin version through `npx`; runtime state lives outside the plugin in `~/.cache/hyperframes`. Its human layer is a desktop app where people also edit, and `history --who` reconciles agent and human edits. VCR deliberately differs: the human layer writes only findings and approvals (ADR 0002), so there is nothing to reconcile.
- **`ios-simulator-skill`**: dual manifests and dual marketplaces from one plugin directory.
- **`tokextract`**: broke because its built output was gitignored. Commit what runs.

## 7. Requirements

### Plugin and distribution (PL)

- PL-01: One install command per host (Claude Code, Codex) installs VCR from the repository marketplace into any directory.
- PL-02: Nothing writes to the plugin root at runtime. Tests run the CLI against a read-only copy.
- PL-03: `plugin/` is generated by `vcr plugin build`, committed, and reproducible: rebuilding an unchanged tree produces no diff. `vcr validate` fails when it is stale.
- PL-04: `plugin/` contains no media, `node_modules` or `output/`, totals under 5 MB, and every skill and index it ships respects the tier budgets.
- PL-05: The CLI is one committed file that runs on system Node 22 or newer with no install step. `playwright` is the only external import and resolves from `VCR_HOME`.
- PL-06: Harness, catalogue, plugin manifests and `vcr.json` share one semver version line; a major mismatch between plugin and workspace produces a warning, not a silent run.

### Roots (RT)

- RT-01: The CLI resolves harness, workspace and machine roots in the order given in §6.1 and reports them in `vcr status --json`.
- RT-02: `vcr doctor` writes its environment record to the machine root. `doctor --record` into `environment/` works only in dev mode.
- RT-03: In the harness repository every existing command behaves as before (dev mode); existing tests pass unchanged.
- RT-04: A command that needs a workspace and finds none fails with `{code: "WORKSPACE_NOT_FOUND"}` and names `vcr workspace init`.
- RT-05: `vcr workspace init` is idempotent and writes only `vcr.json` and ignore entries for `output/` and `.cache/`.

### Agent layer (AG)

- AG-01: The router skill triggers on VCR context only. A routing test confirms that a generic "make a video" prompt outside a VCR workspace does not select it.
- AG-02: Skills are host-neutral: identical files on both hosts, agentskills.io fields only, no host-specific paths in skill text beyond the single invocation settled by S1.
- AG-03: Toolkit skills reference examples through `vcr tools examples` and `vcr example create`, never through repository-relative paths.
- AG-04: `brief` produces a `brief.md` with the five sections in §6.2 and asks for the human's confirmation before rendering.
- AG-05: `review` loads findings summary first, addresses each with a re-render of the affected range and before/after evidence (L6 acceptance), and never resolves or approves.
- AG-06: Hooks are optional. Removing them loses convenience, never a guarantee.
- AG-07: `init` is idempotent, writes nothing beyond RT-05 and the machine-root doctor record, and never downloads the capture runtime without showing its size and asking (L0-03). Declining leaves a working workspace.

### Review layer (RS)

- RS-01: Videos lists every workspace video with state, open-finding count, disk usage and latest thumbnail.
- RS-02: Render shows player, scene strip, contact sheet and a scrubber with composition and scene-local frames. A note pinned from a frame records video, render, scene and composition frame without typing them (L6-01).
- RS-03: Compare shows two renders at the same composition frame and each finding's before/after pair, degrading to retained evidence when full frames are gone (L6-04).
- RS-04: Decide writes an approval or a change request through a human-only channel.
- RS-05: The server binds loopback only, requires the session token, checks Origin on writes, refreshes on manifest change and exits after 30 minutes idle.
- RS-06: `vcr review build` produces a self-contained read-only bundle. The review layer works with no agent running.

### Review contract (RV)

- RV-01: Render manifests (review subset) and findings are JSON Schema validated, versioned, and owned jointly with the L1 child specification.
- RV-02: Findings are one file each, carry a canonical composition frame, and derive `scene_frame` from the manifest.
- RV-03: Only human channels move a finding to `resolved` or `wontfix`, or write an approval. The CLI refuses those transitions without an interactive TTY.
- RV-04: An approval names `manifest_sha256`. `vcr validate` rejects one that matches no retained render, or a `resolved` finding without a human channel (L6 acceptance: self-review is not approval).
- RV-05: Writes are atomic and idempotent.
- RV-06: `review/REVIEW.md` is generated from findings and approvals and is never hand-edited.

### Storage (ST)

- ST-01: Every file VCR writes belongs to one of the five storage classes in §6.5. A test fails if a command writes outside them.
- ST-02: `vcr storage` reports usage by root, class, video and render, in `--json` and paginated, and finishes in under two seconds on a workspace of 50 renders.
- ST-03: Clearing is plan-then-apply: the planned deletions and byte total are shown before anything is removed, in the CLI and in the Storage view alike.
- ST-04: Clearing never removes source, findings, approvals, `brief.md`, manifests or committed evidence. Tests assert this against a fixture workspace.
- ST-05: Evidence pruning keeps the latest, approved and finding-cited revisions, and is CLI-only.
- ST-06: Budgets warn in `vcr status`, `vcr validate` and the Storage view; nothing is deleted automatically.

### Share (SH)

- SH-01: Sharing happens only through an explicit `vcr review share` command, never automatically.
- SH-02: Share publishes a transcoded review proxy and the static bundle, kept under the artifact media limit; full renders and source assets are never uploaded.
- SH-03: Comments from a share are imported as findings with `source: share`.
- SH-04: Approvals are never accepted through share.
- SH-05: Every share is recorded in `review/shares.json` with render, destination and time.

### Parity (PX)

- PX-01: Skills and CLI are byte-identical across hosts. Host-specific parts (manifests, marketplaces, hooks, invocation) are listed in §9 and nowhere else.
- PX-02: A smoke suite runs scripted prompts headless (`claude -p`, `codex exec`) for J1 and J4 and asserts CLI calls and file outcomes.
- PX-03: The smoke suite runs on every `plugin/` change that touches skills or the CLI.
- PX-04: Any capability one host lacks (J7 on Codex) is labelled in the skill text, with the fallback named.

## 8. Phases

| Phase | Scope | Complexity | Exit evidence |
| --- | --- | --- | --- |
| P0 Roots | Three-root resolution, doctor to `VCR_HOME`, tests | 2 | `vcr tools info gsap` and `vcr doctor` work from a scratch directory against a read-only harness copy |
| S1 Spike | Install a throwaway two-file plugin into both hosts. Measure: invocation candidates (a/b/c in §6.2), surviving an update, writing `~/.vcr` and binding loopback inside Codex's sandbox, launching Chromium from each host. Report in `specifications/spikes/` | 1 | A written decision on invocation and sandbox fallbacks; opens P1 |
| P1 Plugin | `vcr plugin build`, bundled CLI, router skill, `init` skill, renamed and path-fixed toolkit skills, both manifests and marketplaces, `vcr setup capture`, `vcr example create` | 3 | Fresh install on both hosts in an empty directory; `/vcr:init` sets up the workspace; `three-capture` scaffolds and renders from the installed plugin |
| P2 Contract | Render manifest subset, findings, approvals, `status`, `findings`, TTY approve, `brief`, `vcr storage` (report, clear, prune, budgets) | 2 | Done (#161, #163–#169): a fixture video has finding records; validate passes; the agent cannot approve; ST-04 tests pass |
| P3 Review pages | Videos, Render, note form, Decide, Storage, server, auto-refresh | 3 | J3, J6 and J9 end to end on a fixture video rendered through the installed plugin |
| P4 Loop | `review`, session-start hooks, evidence pairs, Compare | 2 | J4 and J5 on both hosts with no human restating context |
| P5 Share | Static bundle, review proxy, artifact publish through the skill, comment import | 2 | J7 from a phone; the proxy stays under the limit |

P0 and P1 are Layer 0 packaging and can start now. P2 pulls the render-manifest subset forward from L1, coordinated with the L1 child specification. P3 and P4 deliver an early slice of L6 ahead of M3, because the first production showed the need. The first production started in a product repository after P1 is the L1-01 standalone proof. The proof of concept was removed in #23 and does not migrate.

## 9. Host parity

Same skills, same CLI, same files. Only packaging differs.

| Component | Claude Code | Codex | VCR approach |
| --- | --- | --- | --- |
| Skills | `skills/` | `skills/` through the manifest's `"skills": "./skills/"` | Identical files; agentskills.io fields only (name ≤ 64 chars, description ≤ 1024) |
| Manifest | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` (root `plugin.json` under Agent Plugins 1.0, later) | Both generated from one source |
| Marketplace | `.claude-plugin/marketplace.json` | `.agents/plugins/marketplace.json` (Codex also reads Claude's) | Both at the repository root |
| CLI invocation | `${CLAUDE_PLUGIN_ROOT}` substituted in skill text | No substitution; the skill listing carries the SKILL.md path | Plugin root two levels above SKILL.md on both (S1); no `bin/` |
| Install location | Local marketplace: the source directory. Git: `cache/…/<version>`, old versions kept | `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>`, old version deleted on update | Never hard-code a version path |
| Sandbox | None by default | Seatbelt. `read-only` and `workspace-write` block `~/.vcr`, loopback and default Chromium | Workspace-local `VCR_HOME` fallback, `--single-process` Chromium, `network_access` for capture and the review server, scoped to a VCR profile (`codex -p vcr`) or a per-run flag, never the global config (S1) |
| Hooks | `hooks/hooks.json`; fire in every session | Not supported (`plugin_hooks` removed) | Claude-only conveniences; the CLI enforces the rules |
| Persistent data | `CLAUDE_PLUGIN_DATA` | `PLUGIN_DATA` | Neither: `VCR_HOME` is shared across hosts, so one Chromium |
| Node dependencies | Installed from the lockfile, no scripts | Undocumented | None needed: single-file bundle plus `vcr setup capture` |
| Commands, MCP | Supported | Partial | Not used in v1 |
| Subagents | Supported | Partial | Advisory reviewers and researchers (ADR 0007); the CLI enforces every rule |
| Share (J7) | Artifact tool | None | Claude-only, labelled as such. Codex gets the static bundle folder |

## 10. Success measures

- Disk usage for any video is visible in one view or one command, and can be reclaimed in one action.

- Install to first fixture render in 10 minutes or less on a clean machine, excluding the Chromium download.
- Tool choice plus operating instructions fit in about 6k tokens (index, one card, one guide).
- 100% of findings carry a scene and composition frame. No finding is re-explained in chat.
- Zero approvals through a non-human channel, checked by `validate`.
- Plugin under 5 MB. Zero writes into the plugin root.
- Parity smoke suite green on both hosts.

## 11. Risks

| Risk | Response |
| --- | --- |
| Codex sandbox blocks loopback binding, writes to `~/.vcr` or launching Chromium | Confirmed by S1. Workspace-local `VCR_HOME`, `--single-process` Chromium, and a documented `writable_roots` / `network_access` setup. Capture is byte-identical under `--single-process` on all three browser fixtures (S1 addendum); capture also needs `network_access` for its scene server |
| CLI invocation breaks on plugin update | Resolved by S1: invocation is relative to the skill file. MCP is no longer needed as a fallback |
| No plugin hooks on Codex | Hooks are Claude-only conveniences; every rule also lives in the CLI |
| CSRF against the local server | Per-session token, Origin check, loopback only, idle exit |
| Human and agent write at the same time | One file per record, atomic rename, idempotent posts |
| Trigger collision with HyperFrames and other video skills | Router scoped to VCR, skills namespaced by the plugin (`/vcr:brief`), a routing test (AG-01) |
| Plugin version drifts from the workspace | `harness_version` pin plus a CLI warning (PL-06) |
| Share leaks private assets (product screenshots) | Explicit per-share command, proxy only, recorded, never automatic (SH-01 to SH-05) |
| Clearing deletes something that cannot be regenerated | Five named classes; plan-then-apply; evidence prune is CLI-only and keeps latest, approved and cited revisions; ST-04 tests |
| Review layer creeps toward an editor | Writes limited to findings and approvals; ADR 0002's revisit triggers apply |
| Render manifest churns before L1 lands | Minimal, versioned subset, owned by the L1 child specification |

## 12. Decisions on open questions

Settled with the owner on 28 October 2026.

1. The proof of concept is deleted, not migrated. The L1-01 proof is the first new production in a product repository.
2. Region boxes on notes are optional in v1. The field is in the schema from day one.
3. Plain names: the review layer, with Videos, Render, Compare, Decide and Storage views. No "Dailies".
4. No fixed evidence cap. Storage is a first-class feature instead (§6.5, ST): sizes always visible, clearing in CLI and UI, budgets that warn.
