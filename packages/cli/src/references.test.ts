import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { filterPillarRules, findPillarRule, loadPillarRules, loadPillars, readKnowledgeBaseSection, REFERENCES_INDEX_PATH, referencesIndexDiagnostics, writeReferencesIndex } from "./references.js";
import { resolveRoots } from "./roots.js";

const roots = resolveRoots({ cwd: process.cwd(), env: {} });
if (!roots.ok) throw new Error(roots.error.message);
const harness = roots.value.harness;
const pillars = loadPillars(harness);
if (!pillars.ok) throw new Error(pillars.error.message);
const rules = loadPillarRules(harness, pillars.value);

describe("reference pillars", () => {
  test("pillars come from the status table with their prefix and knowledge base title", () => {
    const typography = pillars.value.find((pillar) => pillar.slug === "typography");
    expect(typography).toMatchObject({ prefix: "TYPO-", data: "`rules.json`" });
    expect(typography?.title).toMatch(/Typography/);
    expect(pillars.value.map((pillar) => pillar.slug)).toEqual(expect.arrayContaining(["motion-director", "delivery", "accessibility"]));
  });

  test("a pillar with rules.json is read from data; one without is read from its knowledge base table", () => {
    expect(findPillarRule(rules, "TYPO-HOLD")).toMatchObject({ ok: true, value: { origin: "rules.json", isDraftId: false, verified: true } });
    expect(findPillarRule(rules, "motion-ease-001")).toMatchObject({ ok: true, value: { origin: "knowledge-base", isDraftId: true, pillar: "motion-director" } });
  });

  test("rules tables whose scope column carries a measurability note still parse", () => {
    expect(findPillarRule(rules, "MAT-NORMAL-CONVENTION")).toMatchObject({ ok: true, value: { pillar: "materials", origin: "knowledge-base" } });
    expect(findPillarRule(rules, "LIGHT-KEY-FILL-RATIO")).toMatchObject({ ok: true, value: { pillar: "lighting" } });
  });

  test("an unknown rule names nearby IDs and how to browse", () => {
    const missing = findPillarRule(rules, "PACE-NOPE");
    expect(missing.ok ? null : missing.error.code).toBe("RULE_NOT_FOUND");
    expect(missing.ok ? "" : missing.error.message).toContain("PACE-HOOK");
  });

  test("rules filter by pillar slug or prefix, tier and scope", () => {
    const byPrefix = filterPillarRules(rules, { pillar: "PACE" });
    expect(byPrefix.length).toBeGreaterThan(20);
    expect(filterPillarRules(rules, { pillar: "pacing-editor" })).toEqual(byPrefix);
    expect(filterPillarRules(rules, { pillar: "delivery", tier: "platform" }).every((rule) => rule.tier.includes("platform"))).toBe(true);
    expect(filterPillarRules(rules, { appliesTo: "captions" }).length).toBeGreaterThan(0);
  });

  test("a section runs to the next heading at its level, and §2 never matches §20", () => {
    const easing = readKnowledgeBaseSection(harness, pillars.value, "motion", "2.4");
    expect(easing.ok ? easing.value.split("\n")[0] : "").toMatch(/^### 2\.4 /);
    expect(easing.ok ? easing.value : "").not.toMatch(/^##+ 3\./m);
    const two = readKnowledgeBaseSection(harness, pillars.value, "MOTION", "§2");
    expect(two.ok ? two.value.split("\n")[0] : "").toMatch(/^## 2\. /);
    expect(two.ok ? two.value : "").toContain("### 2.4");
    expect(two.ok ? two.value : "").not.toMatch(/^## 20\./m);
  });

  test("an unknown section lists the sections that exist", () => {
    const missing = readKnowledgeBaseSection(harness, pillars.value, "delivery", "99");
    expect(missing.ok ? "" : missing.error.message).toMatch(/Sections: 1, 2, 3/);
  });

  test("the real index is fresh, and editing the status table makes it stale", () => {
    expect(referencesIndexDiagnostics(harness)).toEqual([]);
    const fixture = mkdtempSync(join(tmpdir(), "vcr-references-"));
    cpSync(join(harness, "references"), join(fixture, "references"), { recursive: true });
    const readme = join(fixture, "references/README.md");
    writeFileSync(readme, readFileSync(readme, "utf8").replace("| Motion | `MOTION-` |", "| Motion direction | `MOTION-` |"));
    expect(referencesIndexDiagnostics(fixture).map((diagnostic) => diagnostic.message)).toEqual(["references index is stale"]);
    expect(writeReferencesIndex(fixture, false)).toEqual({ ok: true, value: { wasStale: true, staleFiles: [REFERENCES_INDEX_PATH] } });
    expect(readFileSync(join(fixture, REFERENCES_INDEX_PATH), "utf8")).toContain("**Motion direction** `MOTION-`");
  });
});
