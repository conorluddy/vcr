import { execFile } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { resolveRoots } from "./roots.js";

const execFileAsync = promisify(execFile);
const root = harnessRoot();
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

  test.each([["--help"], ["-h"]])("capture %s documents its flags and environment, exit 0", async (flag) => {
    const { stdout } = await runCli("capture", flag);
    for (const expected of ["--width n", "--height n", "--fps n", "--out dir", "--verify", "VCR_CAPTURE_MODE"]) expect(stdout).toContain(expected);
  });

  test("every command answers --help --json with its own spec", async () => {
    const { COMMANDS } = await import("./commands.js");
    for (const command of COMMANDS) {
      const { stdout } = await runCli(...command.name.split(" "), "--help", "--json");
      expect(JSON.parse(stdout).name).toBe(command.name);
    }
  });

  test("bare --help prints global usage and exits 0", async () => {
    const { stdout } = await runCli("--help");
    expect(stdout).toContain("vcr <command>");
  });

  test("an unknown command prints usage and exits 2", async () => {
    await expect(runCli("frobnicate")).rejects.toMatchObject({ code: 2 });
  });
});

describe("the bundled plugin CLI outside the harness repository (P0/P1 exit evidence)", () => {
  let harnessCopy: string;
  let scratch: string;
  let machineHome: string;
  const runFromScratch = (...args: string[]) =>
    execFileAsync(process.execPath, [join(harnessCopy, "cli/vcr.mjs"), ...args], {
      cwd: scratch,
      env: { ...process.env, VCR_HARNESS: "", VCR_HOME: machineHome, VCR_WORKSPACE: "" },
    });

  beforeAll(() => {
    const base = mkdtempSync(join(tmpdir(), "vcr-scratch-"));
    harnessCopy = join(base, "harness");
    scratch = join(base, "product");
    machineHome = join(base, "home");
    cpSync(join(root, "plugin"), harnessCopy, { recursive: true });
    mkdirSync(scratch);
    setWritable(harnessCopy, false);
  });

  afterAll(() => setWritable(harnessCopy, true));

  test("tools info works against a read-only harness", async () => {
    const { stdout } = await runFromScratch("tools", "info", "gsap", "--json");
    expect(JSON.parse(stdout).id).toBe("gsap");
  });

  test("status reports user mode and no workspace before init", async () => {
    const { stdout } = await runFromScratch("status", "--json");
    expect(JSON.parse(stdout)).toMatchObject({ harness: realpathSync(harnessCopy), workspace: null, machine: machineHome, isDevMode: false });
  });

  test("validate without a workspace fails with WORKSPACE_NOT_FOUND", async () => {
    await expect(runFromScratch("validate", "--json")).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining("WORKSPACE_NOT_FOUND") });
  });

  test("workspace init then validate succeeds in the scratch directory", async () => {
    await runFromScratch("workspace", "init");
    const { stdout } = await runFromScratch("validate", "--json");
    expect(JSON.parse(stdout).diagnostics).toEqual([]);
  });

  test("doctor writes to the machine root, and --record is maintainer-only", async () => {
    await runFromScratch("doctor", "--json");
    expect(readdirSync(join(machineHome, "environment"))).toHaveLength(1);
    await expect(runFromScratch("doctor", "--record", "--json")).rejects.toMatchObject({ stdout: expect.stringContaining("MAINTAINER_ONLY") });
  }, 30_000);

  test("catalog build is maintainer-only", async () => {
    await expect(runFromScratch("catalog", "build", "--json")).rejects.toMatchObject({ stdout: expect.stringContaining("MAINTAINER_ONLY") });
  });
});

/** Recursively sets or clears write permission so the harness copy is genuinely read-only during the run. */
function setWritable(path: string, isWritable: boolean): void {
  if (!existsSync(path)) return;
  const isDirectory = statSync(path).isDirectory();
  if (isDirectory && isWritable) chmodSync(path, 0o755);
  if (isDirectory) for (const entry of readdirSync(path)) setWritable(join(path, entry), isWritable);
  chmodSync(path, isWritable ? (isDirectory ? 0o755 : 0o644) : (isDirectory ? 0o555 : 0o444));
}

function harnessRoot(): string {
  const roots = resolveRoots({ cwd: process.cwd(), env: {} });
  if (!roots.ok) throw new Error(roots.error.message);
  return roots.value.harness;
}
