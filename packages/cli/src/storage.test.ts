import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, test } from "vitest";
import { addFinding } from "./findings.js";
import { applyPlan, planClear, planPruneEvidence, storageReport, DEFAULT_BUDGETS } from "./storage.js";
import { writeApprovalDecision } from "./approvals.js";
import { createFixtureWorkspace, fixtureManifest, writeJson, writeRetainedManifest } from "./test-workspace.js";

const renderIds = ["r-20261101T120000-aaaaaaa", "r-20261102T120000-bbbbbbb", "r-20261103T120000-ccccccc"];
const now = new Date("2026-11-06T12:00:00.000Z");

/** A workspace holding every storage class plus source, findings, approvals, briefs and manifests. */
function fullWorkspace() {
  const { root, videoDirectory } = createFixtureWorkspace();
  const machine = mkdtempSync(join(tmpdir(), "vcr-machine-"));
  for (const renderId of renderIds) {
    writeRetainedManifest(videoDirectory, fixtureManifest({ render_id: renderId }));
    writeFileSync(join(videoDirectory, "review/renders", renderId, "evidence-0001.png"), "x".repeat(2000));
    mkdirSync(join(root, "output/demo/teaser", renderId, "frames"), { recursive: true });
    writeFileSync(join(root, "output/demo/teaser", renderId, "frames/frame-0001.png"), "x".repeat(10_000));
  }
  mkdirSync(join(root, ".cache/transcodes"), { recursive: true });
  writeFileSync(join(root, ".cache/transcodes/a.mp4"), "x".repeat(500));
  for (const directory of ["proxies", "runtime"]) {
    mkdirSync(join(machine, directory), { recursive: true });
    writeFileSync(join(machine, directory, "blob"), "x".repeat(300));
  }
  writeFileSync(join(videoDirectory, "scene.html"), "<html></html>");
  writeFileSync(join(videoDirectory, "brief.md"), "---\nvideo_id: demo/teaser\ndeliverables: [1080x1920@30]\n---\n");
  writeJson(join(root, "projects/demo/brief.json"), { id: "demo" });
  addFinding(videoDirectory, root, { frame: 1, severity: "note", text: "On the first render.", author: { kind: "human" }, source: "cli", render_id: renderIds[0] }, now);
  writeApprovalDecision(videoDirectory, root, "approved", renderIds[1], undefined, now);
  return { roots: { workspace: root, machine }, videoDirectory };
}

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { recursive: true }).map(String).filter((entry) => statSync(join(directory, entry)).isFile()).map((entry) => relative(directory, join(directory, entry))).sort();
}

describe("vcr storage", () => {
  test("reports every class, largest first", () => {
    const { roots } = fullWorkspace();
    const report = storageReport(roots, DEFAULT_BUDGETS);
    expect(report.totals).toMatchObject({ output: 30_000, cache: 500, proxies: 300, runtime: 300 });
    expect(report.entries[0]).toMatchObject({ storageClass: "output", videoId: "demo/teaser" });
    expect(report.warnings).toEqual([]);
  });

  test("warns over budget and never deletes", () => {
    const { roots } = fullWorkspace();
    const report = storageReport(roots, { outputWarnBytes: 100, evidenceWarnBytes: 100 });
    expect(report.warnings).toEqual([expect.stringContaining("output is"), expect.stringContaining("demo/teaser evidence")]);
    expect(existsSync(join(roots.workspace, "output/demo/teaser", renderIds[0]!))).toBe(true);
  });

  test("clear is a plan until applied, and keep-latest spares the newest render", () => {
    const { roots } = fullWorkspace();
    const plan = planClear(roots, "output", { keepLatest: 1, now });
    expect(plan.ok && plan.value.deletions.map((deletion) => relative(roots.workspace, deletion.path))).toEqual([`output/demo/teaser/${renderIds[0]}`, `output/demo/teaser/${renderIds[1]}`].sort());
    expect(existsSync(join(roots.workspace, "output/demo/teaser", renderIds[0]!))).toBe(true);
    if (plan.ok) applyPlan(plan.value);
    expect(readdirSync(join(roots.workspace, "output/demo/teaser"))).toEqual([renderIds[2]]);
    if (plan.ok) expect(applyPlan(plan.value).deletions).toEqual([]);
  });

  test("evidence is never cleared, only pruned", () => {
    const { roots } = fullWorkspace();
    expect(planClear(roots, "evidence", { now })).toMatchObject({ ok: false, error: { code: "INVALID_ARGUMENT" } });
  });

  test("ST-04: clearing every class leaves source, findings, approvals, briefs, manifests and evidence intact", () => {
    const { roots } = fullWorkspace();
    const projectsBefore = filesUnder(join(roots.workspace, "projects"));
    for (const storageClass of ["output", "cache", "proxies", "runtime"]) {
      const plan = planClear(roots, storageClass, { now });
      if (!plan.ok) throw new Error(plan.error.message);
      applyPlan(plan.value);
    }
    expect(filesUnder(join(roots.workspace, "projects"))).toEqual(projectsBefore);
    expect(projectsBefore).toEqual(expect.arrayContaining(["demo/brief.json", "demo/videos/teaser/brief.md", "demo/videos/teaser/scene.html", "demo/videos/teaser/review/findings/F-0001.json", `demo/videos/teaser/review/approvals/${renderIds[1]}.json`, `demo/videos/teaser/review/renders/${renderIds[0]}/manifest.json`, `demo/videos/teaser/review/renders/${renderIds[0]}/evidence-0001.png`]));
    expect(existsSync(join(roots.workspace, "vcr.json"))).toBe(true);
    expect(storageReport(roots, DEFAULT_BUDGETS).totals).toMatchObject({ output: 0, cache: 0, proxies: 0, runtime: 0 });
  });

  test("ST-05: pruning spares the latest, approved and finding-cited revisions, and every manifest", () => {
    const { roots, videoDirectory } = fullWorkspace();
    const keepNone = planPruneEvidence(roots, "demo/teaser", 0);
    // r1 is cited by an open finding, r2 is approved, r3 is the latest: nothing may be pruned.
    expect(keepNone.ok && keepNone.value.deletions).toEqual([]);
    // Once the human closes the finding, the first render is no longer cited.
    rmSync(join(videoDirectory, "review/findings/F-0001.json"));
    const afterFindingGone = planPruneEvidence(roots, "demo/teaser", 0);
    expect(afterFindingGone.ok && afterFindingGone.value.deletions.map((deletion) => relative(videoDirectory, deletion.path))).toEqual([`review/renders/${renderIds[0]}/evidence-0001.png`]);
  });
});
