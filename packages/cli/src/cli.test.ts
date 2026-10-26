import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, test } from "vitest";
import { findRepositoryRoot } from "./repository.js";

const execFileAsync = promisify(execFile);
const root = findRepositoryRoot();
const runCli = (...args: string[]) => execFileAsync("npx", ["tsx", join(root, "packages/cli/src/index.ts"), ...args], { cwd: root });

describe("vcr CLI", () => {
  test("tools list --json returns an array of tool records", async () => {
    const { stdout } = await runCli("tools", "list", "--json", "--capability", "video-encoding");
    const tools = JSON.parse(stdout) as Array<{ id: string; capabilities: string[] }>;
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.every((tool) => tool.capabilities.includes("video-encoding"))).toBe(true);
  });

  test("tools info with an unknown id exits 1 with a structured error", async () => {
    await expect(runCli("tools", "info", "does-not-exist", "--json")).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining("TOOL_NOT_FOUND") });
  });

  test("an unknown command prints usage and exits 2", async () => {
    await expect(runCli("frobnicate")).rejects.toMatchObject({ code: 2 });
  });
});
