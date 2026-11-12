import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { filterTools, findTool, formatExamplesForTool, formatToolCard, formatToolTable, type ExampleManifest, type ToolSummary } from "./tools.js";

const tool = (id: string, extra: Partial<ToolSummary> = {}): ToolSummary => ({
  id,
  name: id,
  category: "A5. Video and capture",
  tier: "catalogued",
  role: "",
  official_url: "https://example.test",
  capabilities: ["capture"],
  installation_status: "unknown",
  validation: { status: "not-validated" },
  adapter_maturity: "none",
  ...extra,
});

const tools = [tool("ffmpeg", { tier: "core", capabilities: ["video-encoding"] }), tool("gifski"), tool("p5", { category: "A1. Creative coding", tier: "core" })];

describe("filterTools", () => {
  test("filters by capability", () => {
    expect(filterTools(tools, { capability: "video-encoding" }).map((t) => t.id)).toEqual(["ffmpeg"]);
  });
  test("filters by tier and category together", () => {
    expect(filterTools(tools, { tier: "core", category: "a1" }).map((t) => t.id)).toEqual(["p5"]);
  });
  test("returns everything with an empty filter", () => {
    expect(filterTools(tools, {})).toHaveLength(3);
  });
});

describe("findTool", () => {
  test("returns a machine-readable error for an unknown id", () => {
    const result = findTool(tools, "nope");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("TOOL_NOT_FOUND");
  });
});

describe("formatToolTable", () => {
  test("renders a header and one aligned row per tool", () => {
    const lines = formatToolTable(tools).split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toMatch(/^id\s+tier\s+validated\s+role/);
    expect(lines[1]).toContain("core");
  });
});

describe("formatToolCard", () => {
  const example: ExampleManifest = { id: "demo", title: "Demo", status: "validated", tools: ["ffmpeg"], run: "./run.sh", directory: "examples/demo" };
  test("renders every tier 1 field and points at tiers 2 and 3 with their cost", () => {
    const card = formatToolCard(tool("ffmpeg", { tier: "core", summary: "Encodes things.", use_when: ["you need an mp4"], avoid_when: ["you need a timeline"], pairs_with: ["gifski"], skill: "skills/ffmpeg/SKILL.md", installation_status: "installed", adapter_maturity: "experimental" }), [example], "/nonexistent");
    expect(card).toContain("Encodes things.");
    const lines = card.split("\n");
    const evidenceIndex = lines.findIndex((line) => line.startsWith("Evidence: "));
    expect(lines[evidenceIndex + 1]).toBe("Readiness: this machine: no vcr doctor record (run vcr doctor) · VCR adapter experimental");
    expect(card).toContain("- you need an mp4");
    expect(card).toContain("Pairs with: gifski");
    expect(card).toContain("Guide: skills/ffmpeg/SKILL.md (? KB) — vcr tools info ffmpeg --full");
    expect(card).toContain("Examples: demo (validated) — vcr tools examples ffmpeg");
  });
  test("says what is missing instead of inventing it", () => {
    const card = formatToolCard(tool("gifski"), [], "/nonexistent");
    expect(card).toContain("Guide: none yet");
    expect(card).toContain("Examples: none yet");
    expect(card).not.toContain("Use when");
    expect(card).toContain("Readiness: this machine: no vcr doctor record (run vcr doctor) · VCR adapter none");
  });
  test("reports missing readiness fields as unknown", () => {
    const card = formatToolCard({ ...tool("gifski"), installation_status: undefined, adapter_maturity: "" } as unknown as ToolSummary, [], "/nonexistent");
    expect(card).toContain("Readiness: this machine: no vcr doctor record (run vcr doctor) · VCR adapter unknown");
  });
});

describe("formatToolCard evidence and readiness", () => {
  const evidence = (version: string) => ({ status: "validated", evidence: [{ date: "2026-10-26", version, example: "examples/demo" }] });
  const doctor = (version: string) => ({ schema_version: "1.0.0" as const, hostname: "h", os: { platform: "darwin", release: "1", arch: "arm64" }, checked_at: "2026-11-04T00:00:00Z", tools: [{ tool_id: "ffmpeg", status: "installed" as const, executable: "/x", version }] });
  test("shows the latest evidence scope under the Evidence line when recorded", () => {
    const validation = { status: "validated", evidence: [{ date: "2026-11-04", version: "1.64.1", example: "examples/demo", scope: "Linux container, Chromium 153 stand-in" }] };
    const lines = formatToolCard(tool("ffmpeg", { validation }), [], "/nonexistent").split("\n");
    const evidenceIndex = lines.findIndex((line) => line.startsWith("Evidence: "));
    expect(lines[evidenceIndex + 1]).toBe("Evidence scope: Linux container, Chromium 153 stand-in");
  });
  test("reads a library's readiness from the project, not the machine", () => {
    const root = mkdtempSync(join(tmpdir(), "vcr-card-project-"));
    mkdirSync(join(root, "node_modules", "gsap"), { recursive: true });
    writeFileSync(join(root, "node_modules", "gsap", "package.json"), JSON.stringify({ version: "3.15.0" }));
    const validation = { status: "validated", evidence: [{ date: "2026-11-04", version: "3.15.0" }] };
    const card = formatToolCard(tool("gsap", { install: { macos: "pnpm add gsap" }, validation }), [], "/nonexistent", undefined, { cwd: root, stopAt: root });
    expect(card).toContain("Readiness: this project: has gsap 3.15.0; same version as evidence · VCR adapter none");
  });
  test("omits the scope line for legacy entries without a scope", () => {
    const validation = { status: "validated", evidence: [{ date: "2026-10-26", version: "8.0.1" }] };
    expect(formatToolCard(tool("ffmpeg", { validation }), [], "/nonexistent")).not.toContain("Evidence scope:");
  });
  test("flags an inexact evidence version without changing the status", () => {
    const card = formatToolCard(tool("ffmpeg", { validation: evidence("3.x via pnpm") }), [], "/nonexistent");
    expect(card).toContain('Evidence: validated 2026-10-26 (examples/demo); version inexact: "3.x via pnpm"');
  });
  test("keeps readiness and evidence independent: an installed different version is untested here", () => {
    const record = tool("ffmpeg", { validation: evidence("8.0.1") });
    const card = formatToolCard(record, [], "/nonexistent", doctor("8.0.2"));
    expect(card).toContain("Evidence: validated 2026-10-26 (examples/demo)\n");
    expect(card).toContain("this machine: has 8.0.2; evidence ran 8.0.1 on another host, so this version is untested (doctor 2026-11-04) · VCR adapter none");
    expect(record.validation.status).toBe("validated");
    expect(record.adapter_maturity).toBe("none");
  });
  test("a platform tool says no install is needed", () => {
    expect(formatToolCard(tool("svg", { installation_status: "not-applicable" }), [], "/nonexistent")).toContain("Readiness: no install needed · VCR adapter none");
  });
});

describe("formatExamplesForTool", () => {
  test("lists only examples that name the tool, with how to run them", () => {
    const examples: ExampleManifest[] = [
      { id: "a", title: "A", status: "validated", tools: ["ffmpeg"], run: "./run.sh", directory: "examples/a" },
      { id: "b", title: "B", status: "not-validated", tools: ["gifski"], run: "./run.sh", directory: "examples/b" },
    ];
    const listing = formatExamplesForTool(tool("ffmpeg"), examples);
    expect(listing).toContain("a (validated) — A");
    expect(listing).toContain("run: cd examples/a && ./run.sh");
    expect(listing).not.toContain("b (");
  });

  test("names examples the tool record cites that this install does not ship", () => {
    const listing = formatExamplesForTool(tool("drei", { examples: ["drei-capture"] }), []);
    expect(listing).toContain("drei-capture (repo-only, not in this install) — https://github.com/conorluddy/vcr/tree/main/examples/drei-capture");
  });
});
