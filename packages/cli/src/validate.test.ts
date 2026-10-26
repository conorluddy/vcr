import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { findRepositoryRoot } from "./repository.js";
import { hasErrors, validateRepository } from "./validate.js";

/** A throwaway repository with the real schemas and vocabulary but controlled data. */
function createFixtureRepository(registry: object, project?: object): string {
  const realRoot = findRepositoryRoot();
  const fixtureRoot = mkdtempSync(join(tmpdir(), "vcr-validate-"));
  mkdirSync(join(fixtureRoot, "catalog"), { recursive: true });
  cpSync(join(realRoot, "catalog/schemas"), join(fixtureRoot, "catalog/schemas"), { recursive: true });
  cpSync(join(realRoot, "catalog/capabilities"), join(fixtureRoot, "catalog/capabilities"), { recursive: true });
  writeFileSync(join(fixtureRoot, "catalog/tools.json"), JSON.stringify(registry));
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
  role: "encode",
  official_url: "https://ffmpeg.org/",
  automation_route: "native-cli-or-scripting",
  capabilities: ["video-encoding"],
  documentation_status: "listed-in-prd",
  installation_status: "unknown",
  validation: { status: "not-validated", evidence: [] },
  adapter_maturity: "none",
};

describe("validateRepository", () => {
  test("a valid registry produces no diagnostics", () => {
    const report = validateRepository(createFixtureRepository({ schema_version: "1.0.0", resources: [validTool] }));
    expect(report.filesChecked).toBe(1);
    expect(report.diagnostics).toEqual([]);
  });

  test("a capability outside the vocabulary is an error with a suggestion", () => {
    const report = validateRepository(createFixtureRepository({ schema_version: "1.0.0", resources: [{ ...validTool, capabilities: ["teleportation"] }] }));
    expect(hasErrors(report)).toBe(true);
    expect(report.diagnostics[0]).toMatchObject({ severity: "error", path: "/resources/ffmpeg/capabilities" });
    expect(report.diagnostics[0]?.suggestion).toContain("vocabulary");
  });

  test("an invalid enum value reports the allowed values", () => {
    const report = validateRepository(createFixtureRepository({ schema_version: "1.0.0", resources: [{ ...validTool, adapter_maturity: "perfect" }] }));
    expect(report.diagnostics[0]?.suggestion).toContain("experimental");
  });

  test("an unknown top-level field on a project is a warning, not an error", () => {
    const project = { schema_version: "1.0.0", id: "demo", title: "Demo", reuse_scope: "private", dependency_policy: "unpinned", assets_manifest: "assets/manifest.json", videos: [], mystery: true };
    const report = validateRepository(createFixtureRepository({ schema_version: "1.0.0", resources: [] }, project));
    expect(hasErrors(report)).toBe(false);
    expect(report.diagnostics).toEqual([expect.objectContaining({ severity: "warning", path: "/mystery" })]);
  });

  test("malformed JSON is reported with the file path", () => {
    const fixtureRoot = createFixtureRepository({});
    writeFileSync(join(fixtureRoot, "catalog/tools.json"), "{ not json");
    const report = validateRepository(fixtureRoot);
    expect(report.diagnostics[0]).toMatchObject({ severity: "error", file: "catalog/tools.json" });
  });
});
