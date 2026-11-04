import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { writeCatalogIndex } from "./catalog.js";
import { resolveRoots } from "./roots.js";
import { hasErrors, validateRepository } from "./validate.js";

/** A throwaway repository with the real schemas and vocabulary, controlled per-tool records and a fresh index. */
function createFixtureRepository(records: Array<{ id: string }>, project?: object): string {
  const realRoot = harnessRoot();
  const fixtureRoot = mkdtempSync(join(tmpdir(), "vcr-validate-"));
  mkdirSync(join(fixtureRoot, "catalog/tools"), { recursive: true });
  cpSync(join(realRoot, "catalog/schemas"), join(fixtureRoot, "catalog/schemas"), { recursive: true });
  cpSync(join(realRoot, "catalog/capabilities"), join(fixtureRoot, "catalog/capabilities"), { recursive: true });
  for (const record of records) writeFileSync(join(fixtureRoot, `catalog/tools/${record.id}.json`), JSON.stringify(record));
  writeCatalogIndex(fixtureRoot, false);
  if (project) {
    mkdirSync(join(fixtureRoot, "projects/demo"), { recursive: true });
    writeFileSync(join(fixtureRoot, "projects/demo/project.json"), JSON.stringify(project));
  }
  return fixtureRoot;
}

const validTool = {
  id: "ffmpeg",
  name: "FFmpeg",
  category: "A5",
  tier: "core",
  role: "encode",
  summary: "Encodes, muxes and probes media.",
  use_when: ["you need a video file"],
  avoid_when: ["you need a timeline"],
  official_url: "https://ffmpeg.org/",
  automation_route: "native-cli-or-scripting",
  capabilities: ["video-encoding"],
  documentation_status: "listed-in-prd",
  installation_status: "unknown",
  validation: { status: "not-validated", evidence: [] },
  adapter_maturity: "none",
  checked_at: null,
  source: "specifications/vcr-prd.md#appendix-a",
};

describe("validateRepository", () => {
  test.each([
    { capabilities: {} }, { validation: null }, { pairs_with: 42 },
  ])("invalid tool shapes produce diagnostics rather than throwing: %j", (invalid) => {
    const root = createFixtureRepository([validTool]);
    writeFileSync(join(root, "catalog/tools/ffmpeg.json"), JSON.stringify({ ...validTool, ...invalid }));
    expect(hasErrors(validateRepository(root))).toBe(true);
  });

  test("invalid example shapes do not enter reference checks", () => {
    const root = createFixtureRepository([validTool]);
    mkdirSync(join(root, "examples/broken"), { recursive: true });
    writeFileSync(join(root, "examples/broken/example.json"), JSON.stringify({ id: "broken", tools: null, run: 42 }));
    expect(hasErrors(validateRepository(root))).toBe(true);
  });

  test.each(["validated", "partial"])("%s requires evidence", (status) => {
    const report = validateRepository(createFixtureRepository([{ ...validTool, validation: { status, evidence: [] } }]));
    expect(report.diagnostics).toContainEqual(expect.objectContaining({ path: "/validation/evidence", severity: "error" }));
  });

  test.each(["ghost", "examples/ghost"])("evidence example %s must resolve", (example) => {
    const evidence = [{ date: "2026-10-26", hostname: "test", version: "1", command: "./run.sh", result: "ok", example }];
    const report = validateRepository(createFixtureRepository([{ ...validTool, validation: { status: "validated", evidence } }]));
    expect(report.diagnostics).toContainEqual(expect.objectContaining({ path: "/validation/evidence/0/example", severity: "error" }));
  });
  test("an inexact evidence version is a warning that keeps the record valid", () => {
    const evidence = [{ date: "2026-10-26", hostname: "test", version: "3.x via pnpm", command: "./run.sh", result: "ok" }];
    const report = validateRepository(createFixtureRepository([{ ...validTool, validation: { status: "validated", evidence } }]));
    expect(report.diagnostics).toContainEqual(expect.objectContaining({ path: "/validation/evidence/0/version", severity: "warning" }));
    expect(hasErrors(report)).toBe(false);
  });
  test("a later exact entry clears the warning without editing the earlier one", () => {
    const evidence = [
      { date: "2026-10-26", hostname: "test", version: "3.x via pnpm", command: "./run.sh", result: "ok" },
      { date: "2026-11-04", hostname: "test", version: "3.15.1", command: "./run.sh", result: "ok" },
    ];
    const report = validateRepository(createFixtureRepository([{ ...validTool, validation: { status: "validated", evidence } }]));
    expect(report.diagnostics.filter((diagnostic) => diagnostic.path.endsWith("/version"))).toEqual([]);
  });
  test("an exact or not-applicable evidence version raises no version warning", () => {
    for (const version of ["8.0.1", "n/a (platform)"]) {
      const evidence = [{ date: "2026-10-26", hostname: "test", version, command: "./run.sh", result: "ok" }];
      const report = validateRepository(createFixtureRepository([{ ...validTool, validation: { status: "validated", evidence } }]));
      expect(report.diagnostics.filter((diagnostic) => diagnostic.path === "/validation/evidence/0/version")).toEqual([]);
    }
  });
  test("a valid registry produces no diagnostics", () => {
    const report = validateRepository(createFixtureRepository([validTool]));
    expect(report.filesChecked).toBe(2);
    expect(report.diagnostics).toEqual([]);
  });

  test("a capability outside the vocabulary is an error with a suggestion", () => {
    const report = validateRepository(createFixtureRepository([{ ...validTool, capabilities: ["teleportation"] }]));
    expect(hasErrors(report)).toBe(true);
    expect(report.diagnostics[0]).toMatchObject({ severity: "error", file: "catalog/tools/ffmpeg.json", path: "/capabilities" });
    expect(report.diagnostics[0]?.suggestion).toContain("vocabulary");
  });

  test("an invalid enum value reports the allowed values", () => {
    const report = validateRepository(createFixtureRepository([{ ...validTool, adapter_maturity: "perfect" }]));
    expect(report.diagnostics[0]?.suggestion).toContain("experimental");
  });

  test("an unknown top-level field on a project is a warning, not an error", () => {
    const project = { schema_version: "1.0.0", id: "demo", title: "Demo", reuse_scope: "private", dependency_policy: "unpinned", assets_manifest: "assets/manifest.json", videos: [], mystery: true };
    const report = validateRepository(createFixtureRepository([], project));
    expect(hasErrors(report)).toBe(false);
    expect(report.diagnostics).toEqual([expect.objectContaining({ severity: "warning", path: "/mystery" })]);
  });

  test("malformed JSON is reported with the file path", () => {
    const fixtureRoot = createFixtureRepository([validTool]);
    writeFileSync(join(fixtureRoot, "catalog/tools/ffmpeg.json"), "{ not json");
    const report = validateRepository(fixtureRoot);
    expect(report.diagnostics[0]).toMatchObject({ severity: "error", file: "catalog/tools/ffmpeg.json" });
  });

  test("a stale index is an error that names the fix", () => {
    const fixtureRoot = createFixtureRepository([validTool]);
    writeFileSync(join(fixtureRoot, "catalog/tools/gifski.json"), JSON.stringify({ ...validTool, id: "gifski", name: "gifski" }));
    const report = validateRepository(fixtureRoot);
    expect(report.diagnostics).toEqual([
      expect.objectContaining({ file: "catalog/tools.json", message: "index is stale", suggestion: expect.stringContaining("catalog build") }),
      expect.objectContaining({ file: "catalog/INDEX.md", message: "index is stale" }),
    ]);
  });

  test("a missing card on a catalogued record is reported with the fields to add", () => {
    const { summary, use_when, avoid_when, ...bare } = validTool;
    const report = validateRepository(createFixtureRepository([{ ...bare, tier: "catalogued" }]));
    expect(report.diagnostics).toEqual([expect.objectContaining({ path: "/", message: expect.stringContaining("missing summary, use_when, avoid_when") })]);
  });

  test("a summary over budget fails with the budget in the suggestion", () => {
    const report = validateRepository(createFixtureRepository([{ ...validTool, summary: "x".repeat(601) }]));
    expect(report.diagnostics).toEqual([expect.objectContaining({ severity: "error", path: "/summary", suggestion: expect.stringContaining("600") })]);
  });

  test("pairs_with, skill and examples must resolve", () => {
    const report = validateRepository(createFixtureRepository([{ ...validTool, pairs_with: ["ghost"], skill: "skills/ghost/SKILL.md", examples: ["ghost"] }]));
    expect(report.diagnostics.map((diagnostic) => diagnostic.path).sort()).toEqual(["/examples", "/pairs_with", "/skill"]);
    expect(hasErrors(report)).toBe(true);
  });

  test("an example and its tool must link both ways", () => {
    const fixtureRoot = createFixtureRepository([validTool]);
    mkdirSync(join(fixtureRoot, "examples/demo"), { recursive: true });
    writeFileSync(join(fixtureRoot, "examples/demo/run.sh"), "#!/bin/sh\n");
    writeFileSync(join(fixtureRoot, "examples/demo/example.json"), JSON.stringify({ id: "demo", title: "Demo", status: "validated", tools: ["ffmpeg"], run: "./run.sh" }));
    const report = validateRepository(fixtureRoot);
    expect(report.diagnostics).toEqual([expect.objectContaining({ file: "examples/demo/example.json", path: "/tools", suggestion: expect.stringContaining("catalog/tools/ffmpeg.json") })]);
  });

  test("a facet must point at a real heading in the skill", () => {
    const fixtureRoot = createFixtureRepository([{ ...validTool, skill: "skills/ffmpeg/SKILL.md", facets: [{ id: "mux", one_line: "Combine streams", skill_section: "Muxing" }] }]);
    mkdirSync(join(fixtureRoot, "skills/ffmpeg"), { recursive: true });
    writeFileSync(join(fixtureRoot, "skills/ffmpeg/SKILL.md"), "# FFmpeg\n\n## Encoding\n");
    writeCatalogIndex(fixtureRoot, false);
    expect(validateRepository(fixtureRoot).diagnostics).toEqual([expect.objectContaining({ path: "/facets/mux", message: expect.stringContaining('"Muxing"') })]);
    writeFileSync(join(fixtureRoot, "skills/ffmpeg/SKILL.md"), "# FFmpeg\n\n## Muxing\n");
    expect(validateRepository(fixtureRoot).diagnostics).toEqual([]);
  });
});

function harnessRoot(): string {
  const roots = resolveRoots({ cwd: process.cwd(), env: {} });
  if (!roots.ok) throw new Error(roots.error.message);
  return roots.value.harness;
}
