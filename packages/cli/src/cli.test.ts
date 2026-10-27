import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, test } from "vitest";
import { findRepositoryRoot } from "./repository.js";

const execFileAsync = promisify(execFile);
const root = findRepositoryRoot();
const runCli = (...args: string[]) => execFileAsync(process.execPath, ["--import", "tsx", join(root, "packages/cli/src/index.ts"), ...args], { cwd: root });

describe("vcr CLI", () => {
  test.each([
    ["tools", "info", "--json", "ffmpeg-ffprobe"],
    ["--json", "tools", "info", "ffmpeg-ffprobe"],
    ["tools", "info", "ffmpeg-ffprobe", "--json"],
  ])("boolean flags do not consume positionals: %j", async (...args) => {
    const { stdout } = await runCli(...args);
    expect(JSON.parse(stdout).id).toBe("ffmpeg-ffprobe");
  });

  test("value flags are removed from positionals", async () => {
    const { stdout } = await runCli("--tier", "core", "tools", "list", "--json");
    expect(JSON.parse(stdout).every((tool: { tier: string }) => tool.tier === "core")).toBe(true);
  });

  test.each(["--tier", "--unknown"])("invalid option %s exits with usage status", async (flag) => {
    await expect(runCli("tools", "list", flag, "--json")).rejects.toMatchObject({ code: 2, stdout: expect.stringContaining("INVALID_ARGUMENT") });
  });
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
