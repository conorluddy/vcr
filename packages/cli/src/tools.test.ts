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
    const card = formatToolCard(tool("ffmpeg", { tier: "core", summary: "Encodes things.", use_when: ["you need an mp4"], avoid_when: ["you need a timeline"], pairs_with: ["gifski"], skill: "skills/ffmpeg/SKILL.md" }), [example], "/nonexistent");
    expect(card).toContain("Encodes things.");
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
});
