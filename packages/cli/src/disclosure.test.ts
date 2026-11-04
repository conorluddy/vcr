import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import type { CatalogIndex } from "./catalog.js";
import { disclosureReport, formatDisclosureReport } from "./disclosure.js";
import type { ToolSummary } from "./tools.js";

const tool = (id: string, extra: Partial<ToolSummary> = {}): ToolSummary => ({
  id, name: id, category: "A", tier: "catalogued", role: "role", official_url: "https://example.test", capabilities: ["capture"],
  installation_status: "unknown", validation: { status: "not-validated" }, adapter_maturity: "none", ...extra,
});

describe("disclosureReport", () => {
  test("measures tier 0 files, cards, guides and the startup load", () => {
    const root = mkdtempSync(join(tmpdir(), "vcr-disclosure-"));
    mkdirSync(join(root, "catalog"));
    mkdirSync(join(root, "skills/start"), { recursive: true });
    mkdirSync(join(root, "skills/big"), { recursive: true });
    writeFileSync(join(root, "catalog/INDEX.md"), "x".repeat(400));
    writeFileSync(join(root, "catalog/CANDIDATES.md"), "y".repeat(40));
    writeFileSync(join(root, "skills/start/SKILL.md"), "z".repeat(100));
    writeFileSync(join(root, "skills/big/SKILL.md"), "g".repeat(800));
    const index: CatalogIndex = { schema_version: "1.1.0", generated_from: "catalog/tools/*.json", resources: [tool("small"), tool("big", { skill: "skills/big/SKILL.md", summary: "s".repeat(500) })] };
    const report = disclosureReport(root, index, []);
    expect(report.tier0).toEqual({ indexBytes: 400, candidatesBytes: 40 });
    expect(report.startupBytes).toBe(500);
    expect(report.tier2Guides).toMatchObject({ count: 1, minBytes: 800, maxBytes: 800, maxId: "big" });
    expect(report.tier1Cards.count).toBe(2);
    expect(report.tier1Cards.maxId).toBe("big");
    expect(report.tier1Cards.maxBytes).toBeGreaterThan(report.tier1Cards.minBytes);
    expect(formatDisclosureReport(report)).toContain("tier 0: INDEX.md 400 B (~100 tok); CANDIDATES.md 40 B (~10 tok)");
  });
  test("missing files count as zero rather than failing the build", () => {
    const root = mkdtempSync(join(tmpdir(), "vcr-disclosure-empty-"));
    const report = disclosureReport(root, { schema_version: "1.1.0", generated_from: "catalog/tools/*.json", resources: [] }, []);
    expect(report.tier0).toEqual({ indexBytes: 0, candidatesBytes: 0 });
    expect(report.tier1Cards.count).toBe(0);
  });
});
