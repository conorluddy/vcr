import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { harnessRoot } from "./test-workspace.js";
import { validateWorkspace } from "./validate.js";
import { ensureWorkspace, loadAgentModels } from "./workspace.js";

describe("ensureWorkspace", () => {
  test("writes vcr.json and ignore entries once, then changes nothing", () => {
    const directory = mkdtempSync(join(tmpdir(), "vcr-workspace-"));
    expect(ensureWorkspace(directory, "0.1.0").changes).toEqual(["vcr.json", ".gitignore"]);
    expect(ensureWorkspace(directory, "0.1.0").changes).toEqual([]);
    expect(JSON.parse(readFileSync(join(directory, "vcr.json"), "utf8"))).toEqual({ schema_version: "1.0.0", harness_version: "0.1.0", projects: [] });
  });

  test("appends only missing ignore entries and keeps existing lines", () => {
    const directory = mkdtempSync(join(tmpdir(), "vcr-workspace-"));
    writeFileSync(join(directory, ".gitignore"), "node_modules/\noutput/");
    ensureWorkspace(directory, "0.1.0");
    expect(readFileSync(join(directory, ".gitignore"), "utf8")).toBe("node_modules/\noutput/\n.cache/\n.vcr/\ninspiration/files/\n");
  });

  test("never overwrites an existing vcr.json", () => {
    const directory = mkdtempSync(join(tmpdir(), "vcr-workspace-"));
    writeFileSync(join(directory, "vcr.json"), '{"custom":true}');
    ensureWorkspace(directory, "0.1.0");
    expect(readFileSync(join(directory, "vcr.json"), "utf8")).toBe('{"custom":true}');
  });
});

describe("per-agent models in vcr.json (ADR 0013)", () => {
  const workspaceWith = (models: unknown): string => {
    const directory = mkdtempSync(join(tmpdir(), "vcr-workspace-"));
    writeFileSync(join(directory, "vcr.json"), JSON.stringify({ schema_version: "1.0.0", harness_version: "0.1.0", projects: [], ...(models === undefined ? {} : { models }) }));
    return directory;
  };

  test("the map is reported as written, with one name or one per host, and no name is checked", () => {
    const models = { "inspiration-analyst": "any-name-the-host-accepts", typographer: { "claude-code": "one", codex: "another" } };
    const directory = workspaceWith(models);
    expect(loadAgentModels(directory)).toEqual(models);
    expect(validateWorkspace(harnessRoot(), directory).diagnostics).toEqual([]);
  });

  test("no workspace, no map or a malformed map reports nothing", () => {
    expect(loadAgentModels(null)).toEqual({});
    expect(loadAgentModels(workspaceWith(undefined))).toEqual({});
    expect(loadAgentModels(workspaceWith(["not", "a", "map"]))).toEqual({});
  });

  test("a model that is not a name fails the workspace schema", () => {
    expect(validateWorkspace(harnessRoot(), workspaceWith({ "inspiration-analyst": 5 })).diagnostics).toContainEqual(expect.objectContaining({ severity: "error", file: "vcr.json" }));
  });
});
