import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { buildPlugin, listPillarReferences, PLUGIN_MAX_BYTES } from "./plugin.js";
import { resolveRoots } from "./roots.js";

describe("buildPlugin", () => {
  const roots = resolveRoots({ cwd: process.cwd(), env: {} });
  if (!roots.ok) throw new Error(roots.error.message);
  const harnessRoot = roots.value.harness;
  const outcome = buildPlugin(harnessRoot, mkdtempSync(join(tmpdir(), "vcr-plugin-test-")));
  if (!outcome.ok) throw new Error(outcome.error.message);
  const { directory, version, totalBytes } = outcome.value;
  const readJson = (path: string) => JSON.parse(readFileSync(join(directory, path), "utf8")) as { name: string; version: string; skills?: string };

  test("both host manifests carry the harness version and the same name", () => {
    expect(readJson(".claude-plugin/plugin.json")).toMatchObject({ name: "vcr", version });
    expect(readJson(".codex-plugin/plugin.json")).toMatchObject({ name: "vcr", version, skills: "./skills/" });
  });

  test("ships the bundled CLI, flat skills and the catalogue, under the size cap", () => {
    expect(existsSync(join(directory, "cli/vcr.mjs"))).toBe(true);
    expect(existsSync(join(directory, "skills/gsap/SKILL.md"))).toBe(true);
    expect(existsSync(join(directory, "skills/ingest/SKILL.md"))).toBe(true);
    expect(existsSync(join(directory, "agents/typographer.md"))).toBe(true);
    for (const reference of ["CANDIDATE-INGESTION.md", "ASSESSMENT-BRIEF.md", "FIXTURE-EVIDENCE-TEMPLATE.md"]) {
      expect(readFileSync(join(directory, "catalog", reference), "utf8")).toBe(readFileSync(join(harnessRoot, "catalog", reference), "utf8"));
    }
    expect(existsSync(join(directory, "catalog/INDEX.md"))).toBe(true);
    for (const pillar of listPillarReferences(harnessRoot)) expect(existsSync(join(directory, "references", pillar, "README.md"))).toBe(true);
    expect(listPillarReferences(harnessRoot)).toEqual(expect.arrayContaining(["typography", "motion-director", "delivery", "accessibility"]));
    expect(existsSync(join(directory, "references/README.md"))).toBe(true);
    expect(existsSync(join(directory, "references/INDEX.md"))).toBe(true);
    expect(existsSync(join(directory, "references/research-prompts"))).toBe(false);
    expect(totalBytes).toBeLessThan(PLUGIN_MAX_BYTES);
  });

  test("ships the exact distribution license and notice files", () => {
    for (const file of ["LICENSE", "NOTICE", "THIRD_PARTY_NOTICES"]) {
      expect(readFileSync(join(directory, file))).toEqual(readFileSync(join(harnessRoot, file)));
    }
  });

  test("leaves out node_modules, output and repo-only (scene.tsx) examples", () => {
    expect(existsSync(join(directory, "examples/three-capture/scene.html"))).toBe(true);
    expect(existsSync(join(directory, "examples/three-capture/node_modules"))).toBe(false);
    expect(existsSync(join(directory, "examples/three-capture/output"))).toBe(false);
    expect(existsSync(join(directory, "examples/react-capture"))).toBe(false);
  });
});
