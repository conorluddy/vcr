import { execFile } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
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

  test("flushes a large JSON response before exiting with piped stdout", async () => {
    const { stdout } = await runCli("tools", "list", "--json");
    expect(Buffer.byteLength(stdout)).toBeGreaterThan(65_536);
    expect(JSON.parse(stdout)).toEqual(expect.arrayContaining([expect.objectContaining({ id: "ffmpeg-ffprobe" })]));
  });

  test.each([
    { name: "scene path", args: [`${"x".repeat(300)}.html`], exit: 1, code: "PREVIEW_FAILED" },
    { name: "serving root", args: [join("x".repeat(300), "scene.html"), "--serve-root", "x".repeat(300)], exit: 2, code: "INVALID_ARGUMENT" },
  ])("preview reports an unreadable $name as JSON", async ({ args, exit, code }) => {
    const result = await runCli("preview", ...args, "--width", "80", "--height", "80", "--fps", "30", "--at", "0", "--json")
      .then(() => undefined, (error: { code: number; stdout: string }) => error);
    expect(result?.code).toBe(exit);
    expect(JSON.parse(result!.stdout)).toMatchObject({ error: { code, message: expect.stringContaining("ENAMETOOLONG"), retryable: false } });
  });

  test("tools info with an unknown id exits 1 with a structured error", async () => {
    await expect(runCli("tools", "info", "does-not-exist", "--json")).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining("TOOL_NOT_FOUND") });
  });

  test("techniques list filters and paginates; info derives each route's evidence class", async () => {
    const listed = JSON.parse((await runCli("techniques", "list", "--tool", "postprocessing", "--limit", "1", "--json")).stdout);
    expect(listed).toMatchObject({ offset: 0, limit: 1, techniques: [{ id: "bloom-glow", pillars: expect.arrayContaining(["fx"]) }] });
    expect(listed.total).toBeGreaterThanOrEqual(1);
    const miss = JSON.parse((await runCli("techniques", "list", "--purpose", "calm", "--json")).stdout);
    expect(miss).toMatchObject({ total: 0, filter_terms: { purpose: expect.arrayContaining(["emphasis"]) } });
    expect(miss.filter_terms.pillar).toBeUndefined();
    const info = JSON.parse((await runCli("techniques", "info", "bloom-glow", "--json")).stdout);
    expect(info.routes.find((route: { id: string }) => route.id === "three-postprocessing").evidence).toMatchObject({ class: "retained-fixture", example: "postprocessing-capture" });
    const card = (await runCli("techniques", "info", "bloom-glow", "--full")).stdout;
    expect(card).toContain("vcr refs section fx 7");
    expect(card).toContain("Route pixi-filter [documented]");
  });

  test.each([["--help"], ["-h"]])("capture %s documents its flags and environment, exit 0", async (flag) => {
    const { stdout } = await runCli("capture", flag);
    for (const expected of ["--width n", "--height n", "--fps n", "--out dir", "--verify", "VCR_CAPTURE_MODE"]) expect(stdout).toContain(expected);
  });

  test("every command answers --help --json with its own spec", async () => {
    const { COMMANDS } = await import("./commands.js");
    // One CLI process per command; run them together so the test stays well inside its budget on a loaded CI runner.
    const results = await Promise.all(COMMANDS.map((command) => runCli(...command.name.split(" "), "--help", "--json")));
    results.forEach(({ stdout }, index) => expect(JSON.parse(stdout).name).toBe(COMMANDS[index]!.name));
  }, 30_000);

  test.each([
    [["tools", "info", "does-not-exist"]],
    [["tools", "list", "--unknown"]],
    [["techniques", "info", "does-not-exist"]],
    [["techniques", "list", "--limit", "0"]],
    [["capture", "scene.html"]],
    [["lint", "scene.html"]],
    [["findings", "list", "nope"]],
    [["inspiration", "show", "does-not-exist"]],
    [["inspiration", "list", "--kind", "audio"]],
    [["inspiration", "add"]],
    [["inspiration", "observe", "does-not-exist", "--aspect", "palette"]],
  ])("errors from %j carry { code, message, retryable } (ADR 0004)", async (args) => {
    const failure = await runCli(...args, "--json").then(() => undefined, (cause: { stdout: string }) => cause);
    expect(failure).toBeDefined();
    const { error } = JSON.parse(failure!.stdout) as { error: Record<string, unknown> };
    expect(error).toEqual({ code: expect.any(String), message: expect.any(String), retryable: expect.any(Boolean) });
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
    const { stdout } = await runFromScratch("tools", "info", "d3", "--json");
    expect(JSON.parse(stdout).id).toBe("d3");
  });

  test("techniques resolve from the plugin's own records, examples and retained outputs", async () => {
    const { stdout } = await runFromScratch("techniques", "info", "bloom-glow", "--json");
    expect(JSON.parse(stdout).routes[0]).toMatchObject({ id: "three-postprocessing", evidence: { class: "retained-fixture" } });
    const listed = await runFromScratch("techniques", "list", "--pillar", "fx", "--json");
    expect(JSON.parse(listed.stdout).total).toBeGreaterThan(0);
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

  test("video init registers a video that then validates", async () => {
    const { stdout } = await runFromScratch("video", "init", "demo/teaser", "--json");
    expect(JSON.parse(stdout).changes).toContain("projects/demo/project.json");
    const validation = await runFromScratch("validate", "--json");
    expect(JSON.parse(validation.stdout).diagnostics).toEqual([]);
  });

  test("an agent can list and add findings but cannot approve", async () => {
    const listed = await runFromScratch("findings", "list", "demo/teaser", "--json");
    expect(JSON.parse(listed.stdout)).toMatchObject({ total: 0, findings: [] });
    await expect(runFromScratch("findings", "add", "demo/teaser", "--frame", "0", "--severity", "note", "--text", "x", "--json")).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining("RENDER_NOT_FOUND") });
    await expect(runFromScratch("review", "approve", "demo/teaser", "--json")).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining("HUMAN_CHANNEL_REQUIRED") });
  });

  test("plan check and plan markers read a video's beat sheet, which then validates", async () => {
    const video = join(scratch, "projects/demo/videos/teaser");
    const sections = ["Objective", "Audience and placement", "Content", "Constraints", "Review notes"].map((section) => `## ${section}\nx\n`).join("\n");
    writeFileSync(join(video, "brief.md"), `---\nvideo_id: demo/teaser\ndeliverables: [1080x1920@30]\n---\n\n${sections}`);
    const beat = { purpose: "Land it.", must_show: ["a file"], on_screen_text: null, vo: null, transition_in: "cut", transition_out: "cut" };
    const sheet = { schema_version: "1.0.0", video_id: "demo/teaser", fps: 30, target_s: 4, beats: [{ ...beat, id: "B01", role: "hook", duration_s: 2 }, { ...beat, id: "B02", duration_s: 1.9 }] };
    writeFileSync(join(video, "beats.json"), JSON.stringify(sheet));
    const checked = await runFromScratch("plan", "check", "--video", "demo/teaser", "--json").then(() => undefined, (cause: { code: number; stdout: string }) => cause);
    expect(checked?.code).toBe(1);
    expect(JSON.parse(checked!.stdout)).toEqual([expect.objectContaining({ rule_id: "STORY-BEAT-SUM", severity: "major", plan_sha256: expect.stringMatching(/^[0-9a-f]{64}$/) })]);
    const markers = await runFromScratch("plan", "markers", "--video", "demo/teaser", "--json");
    expect(JSON.parse(markers.stdout)).toEqual([{ t: 1.966667, id: "B01", role: "hook" }, { t: 3.866667, id: "B02" }]);
    const validation = await runFromScratch("validate", "--json");
    expect(JSON.parse(validation.stdout).diagnostics).toEqual([]);
  });

  test("inspiration: a font and a colour set are added, listed and shown from the bundled CLI, and still validate", async () => {
    const added = JSON.parse((await runFromScratch("inspiration", "add", join(root, "examples/canvas2d-capture/fonts/JetBrainsMono-Bold.ttf"), "--note", "Wide, even mono.", "--aspect", "typography", "--json")).stdout);
    expect(added).toMatchObject({ data: [{ kind: "font", facts: { family: "JetBrains Mono", weight_class: 700 }, facts_by: { tool: "vcr" } }], warnings: [] });
    expect(added.changes).toEqual(expect.arrayContaining([`inspiration/items/${added.data[0].id}.json`]));
    await runFromScratch("inspiration", "add", "--colours", "#0B1F3A,#F2A33A", "--title", "Harbour night", "--note", "Navy with one warm accent.");
    const listed = JSON.parse((await runFromScratch("inspiration", "list", "--json")).stdout);
    expect(listed).toMatchObject({ total: 2, offset: 0, limit: 50, items: [{ id: "harbour-night" }, { id: added.data[0].id, observation_count: 0 }] });
    const shown = (await runFromScratch("inspiration", "show", added.data[0].id)).stdout;
    expect(shown).toContain("note (stated): Wide, even mono.");
    expect(shown).toContain(`file: ${join(realpathSync(scratch), "inspiration/files", added.data[0].id, "JetBrainsMono-Bold.ttf")}`);
    expect(readFileSync(join(scratch, ".gitignore"), "utf8")).toContain("inspiration/files/");
    const observed = JSON.parse((await runFromScratch("inspiration", "observe", added.data[0].id, "--aspect", "typography", "--observed", "Monospaced, heavy weight, wide apertures.", "--model", "model-a", "--json")).stdout);
    expect(observed.data).toMatchObject({ note: "Wide, even mono.", observations: [{ aspect: "typography", by: { agent: "inspiration-analyst", model: "model-a" } }] });
    expect((await runFromScratch("inspiration", "show", added.data[0].id)).stdout).toContain("1. judged by model-a");
    await expect(runFromScratch("inspiration", "retract", added.data[0].id, "--observation", "1", "--json")).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining("HUMAN_CHANNEL_REQUIRED") });
    const validation = await runFromScratch("validate", "--json");
    expect(JSON.parse(validation.stdout).diagnostics).toEqual([]);
  });

  test("status reports the workspace's per-agent models, and an empty map when none are set", async () => {
    expect(JSON.parse((await runFromScratch("status", "--json")).stdout).models).toEqual({});
    const markerPath = join(scratch, "vcr.json");
    const marker = JSON.parse(readFileSync(markerPath, "utf8"));
    writeFileSync(markerPath, JSON.stringify({ ...marker, models: { "inspiration-analyst": "model-a" } }, null, 2));
    expect(JSON.parse((await runFromScratch("status", "--json")).stdout).models).toEqual({ "inspiration-analyst": "model-a" });
    expect((await runFromScratch("status")).stdout).toContain("model      inspiration-analyst: model-a");
    writeFileSync(markerPath, JSON.stringify(marker, null, 2));
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
