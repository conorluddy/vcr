import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { ensureWorkspace } from "./workspace.js";

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
    expect(readFileSync(join(directory, ".gitignore"), "utf8")).toBe("node_modules/\noutput/\n.cache/\n.vcr/\n");
  });

  test("never overwrites an existing vcr.json", () => {
    const directory = mkdtempSync(join(tmpdir(), "vcr-workspace-"));
    writeFileSync(join(directory, "vcr.json"), '{"custom":true}');
    ensureWorkspace(directory, "0.1.0");
    expect(readFileSync(join(directory, "vcr.json"), "utf8")).toBe('{"custom":true}');
  });
});
