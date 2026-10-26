import { describe, expect, test } from "vitest";
import { filterTools, findTool, formatToolTable, type ToolSummary } from "./tools.js";

const tool = (id: string, extra: Partial<ToolSummary> = {}): ToolSummary => ({
  id,
  name: id,
  category: "A5. Video and capture",
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
    expect(lines[0]).toMatch(/^id\s+tier\s+installed/);
    expect(lines[1]).toContain("core");
  });
});
