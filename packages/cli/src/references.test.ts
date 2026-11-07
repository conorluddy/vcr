import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { formatPillarRule, referenceIntegrityDiagnostics, filterPillarRules, findPillarRule, loadPillarRules, loadPillars, readKnowledgeBaseSection, REFERENCES_INDEX_PATH, referencesIndexDiagnostics, writeReferencesIndex } from "./references.js";
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
    cpSync(join(harness, "skills"), join(fixture, "skills"), { recursive: true });
    cpSync(join(harness, "specifications"), join(fixture, "specifications"), { recursive: true });
    const readme = join(fixture, "references/README.md");
    writeFileSync(readme, readFileSync(readme, "utf8").replace("| Motion | `MOTION-` |", "| Motion direction | `MOTION-` |"));
    expect(referencesIndexDiagnostics(fixture).map((diagnostic) => diagnostic.message)).toEqual(["references index is stale"]);
    expect(writeReferencesIndex(fixture, false)).toEqual({ ok: true, value: { wasStale: true, staleFiles: [REFERENCES_INDEX_PATH] } });
    expect(readFileSync(join(fixture, REFERENCES_INDEX_PATH), "utf8")).toContain("**Motion direction** `MOTION-`");
  });
});


test("isolated candidate lookups retain ownership and evidence context", () => {
  const old = findPillarRule(rules, "PACE-READ-01");
  expect(old.ok && formatPillarRule(old.value)).toContain("replaced by TYPO-HOLD");
  expect(old.ok && old.value.threshold).not.toContain("chars/20");
  const named = findPillarRule(rules, "A11Y-AD-COVERAGE");
  expect(named.ok && named.value.isDraftId).toBe(false);
  const research = findPillarRule(rules, "VREF-OBSERVATION-LOCATOR");
  const output = research.ok ? formatPillarRule(research.value) : "";
  expect(output).toContain("reference-only candidate");
  expect(output).toContain("Media Fragments");
  expect(output).toContain("structural");
});

test("integrity catches dangling owners and links in a changed corpus", () => {
  const fixture = mkdtempSync(join(tmpdir(), "vcr-integrity-"));
  cpSync(join(harness, "references"), join(fixture, "references"), { recursive: true });
  const path = join(fixture, "references/pacing-editor/pacing-editor-knowledge-base.md");
  writeFileSync(path, readFileSync(path, "utf8").replace("Superseded: use `TYPO-HOLD`", "Superseded: use `TYPO-NONEXISTENT`") + "\n[missing](missing.md)\n");
  const messages = referenceIntegrityDiagnostics(fixture).map((d) => d.message);
  expect(messages).toContain("Unknown rule reference TYPO-NONEXISTENT");
  expect(messages).toContain("Invalid replacement PACE-READ-01 → TYPO-NONEXISTENT");
  expect(messages).toContain("Missing local reference missing.md");
});

test("agents cite rules that resolve, and name a dropped rule only to say it is dropped", () => {
  const fixture = mkdtempSync(join(tmpdir(), "vcr-agent-rules-"));
  cpSync(join(harness, "references"), join(fixture, "references"), { recursive: true });
  cpSync(join(harness, "agents"), join(fixture, "agents"), { recursive: true });
  expect(referenceIntegrityDiagnostics(fixture).filter((d) => d.file.startsWith("agents/"))).toEqual([]);
  writeFileSync(join(fixture, "agents/fixture-reviewer.md"), [
    "- `PACE-READ-01`: reading hold.",
    "- Dropped, never cite: `PACE-BEAT-05`.",
    "- `MOTION-NOPE-001`: invented.",
    "- Captions as access: `A11Y-CAPTION-*`.",
  ].join("\n"));
  const messages = referenceIntegrityDiagnostics(fixture).map((d) => d.message);
  expect(messages).toContain("Cites superseded rule PACE-READ-01; cite TYPO-HOLD instead");
  expect(messages).toContain("Unknown rule reference MOTION-NOPE-001");
  expect(messages.some((m) => m.includes("PACE-BEAT-05") || m.includes("A11Y-CAPTION"))).toBe(false);
});

test("section extraction ignores headings inside fenced examples", () => {
  const fixture = mkdtempSync(join(tmpdir(), "vcr-fenced-section-"));
  cpSync(join(harness, "references"), join(fixture, "references"), { recursive: true });
  writeFileSync(join(fixture, "references/story/story-knowledge-base.md"), "# Story\n## 1. Sample\n```markdown\n## 2. Not a section\n```\nretained\n## 2. Real section\n");
  const section = readKnowledgeBaseSection(fixture, pillars.value, "story", "1");
  expect(section.ok && section.value).toContain("retained");
  const second = readKnowledgeBaseSection(fixture, pillars.value, "story", "2");
  expect(second.ok && second.value).toBe("## 2. Real section");
});
