import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import type { EnvironmentRecord } from "./doctor.js";
import { assessReadiness, compareToEvidence, formatReadiness, loadMachineRecord, versionScope } from "./evidence.js";

const machine = (tools: EnvironmentRecord["tools"]): EnvironmentRecord => ({
  schema_version: "1.0.0",
  hostname: "test-host",
  os: { platform: "darwin", release: "25.0.0", arch: "arm64" },
  checked_at: "2026-11-04T10:00:00.000Z",
  tools,
});

describe("versionScope", () => {
  test.each([
    ["8.0.1", "exact"],
    ["7.1.2-15", "exact"],
    ["Chromium 156.0.8078.4", "exact"],
    ["3.x via pnpm", "inexact"],
    ["pnpm latest, Chromium 156", "inexact"],
    ["^0.186.1", "inexact"],
    ["~1.2.0", "inexact"],
    [">=4.0", "inexact"],
    [">4.0", "inexact"],
    ["4.0+", "inexact"],
    ["4.4.0 or later", "inexact"],
    ["1.2.x", "inexact"],
    ["N-112345-gabc123", "exact"],
    ["n7.1", "exact"],
    ["n/a (platform)", "not-applicable"],
    ["1", "unknown"],
    ["", "unknown"],
    [undefined, "unknown"],
  ])("%s is %s", (version, expected) => {
    expect(versionScope(version)).toBe(expected);
  });
});

describe("assessReadiness", () => {
  const record = machine([
    { tool_id: "ffmpeg-ffprobe", status: "installed", executable: "/usr/bin/ffmpeg", version: "8.0.1" },
    { tool_id: "gifski", status: "missing", executable: null, version: null },
    { tool_id: "inkscape", status: "error", executable: "/usr/bin/inkscape", version: null, detail: "could not parse" },
  ]);
  test("no machine record stays unknown rather than missing", () => {
    expect(assessReadiness("ffmpeg-ffprobe", undefined)).toEqual({ state: "no-machine-record" });
  });
  test("a tool doctor does not probe is not-probed, not missing", () => {
    expect(assessReadiness("gsap", record)).toMatchObject({ state: "not-probed" });
  });
  test.each([
    ["ffmpeg-ffprobe", "installed"],
    ["gifski", "missing"],
    ["inkscape", "probe-error"],
  ])("%s is %s", (toolId, state) => {
    expect(assessReadiness(toolId, record).state).toBe(state);
  });
});

describe("compareToEvidence", () => {
  test("the same exact version matches, including a version inside free text", () => {
    expect(compareToEvidence("8.0.1", { version: "8.0.1" })).toBe("same-version");
    expect(compareToEvidence("Chromium 156.0.8078.4", { version: "156.0.8078.4" })).toBe("same-version");
  });
  test("a different patch is different, never verified by range", () => {
    expect(compareToEvidence("8.0.1", { version: "8.0.2" })).toBe("different-version");
  });
  test("prefixed versions match themselves and their bare form", () => {
    expect(compareToEvidence("n7.1", { version: "n7.1" })).toBe("same-version");
    expect(compareToEvidence("v1.2.3", { version: "1.2.3" })).toBe("same-version");
  });
  test("inexact evidence or an unparsed probe cannot be compared", () => {
    expect(compareToEvidence("3.x via pnpm", { version: "3.12.5" })).toBe("unknown");
    expect(compareToEvidence("8.0.1", { version: null })).toBe("unknown");
    expect(compareToEvidence(undefined, { version: "8.0.1" })).toBe("unknown");
  });
});

describe("formatReadiness", () => {
  const installed = (version: string) => assessReadiness("ffmpeg-ffprobe", machine([{ tool_id: "ffmpeg-ffprobe", status: "installed", executable: "/x", version }]));
  test("a different version on this host is untested, never verified", () => {
    expect(formatReadiness(installed("8.0.2"), { version: "8.0.1", hostname: "test-host" })).toBe("this machine: has 8.0.2; evidence ran 8.0.1 here, so this version is untested (doctor 2026-11-04)");
  });
  test("names another host instead of implying the evidence ran here", () => {
    expect(formatReadiness(installed("8.0.2"), { version: "8.0.1", hostname: "elsewhere" })).toBe("this machine: has 8.0.2; evidence ran 8.0.1 on another host, so this version is untested (doctor 2026-11-04)");
    expect(formatReadiness(installed("8.0.1"), { version: "8.0.1", hostname: "elsewhere" })).toBe("this machine: has 8.0.1; evidence ran this version on another host (doctor 2026-11-04)");
  });
  test("says when the evidence version cannot be compared", () => {
    expect(formatReadiness(installed("3.12.5"), { version: "3.x via pnpm" })).toBe("this machine: has 3.12.5; evidence version not exact, cannot compare (doctor 2026-11-04)");
  });
  test("blames the local version when the evidence is exact but the probe cannot be compared", () => {
    expect(formatReadiness(installed("N-112345-gabc123"), { version: "8.0.1" })).toBe("this machine: has N-112345-gabc123; local version could not be compared with the evidence (doctor 2026-11-04)");
  });
  test("points at vcr doctor when there is no record", () => {
    expect(formatReadiness({ state: "no-machine-record" }, { version: "8.0.1" })).toBe("this machine: no vcr doctor record (run vcr doctor)");
  });
});

describe("loadMachineRecord", () => {
  test("reads <machine>/environment/<hostname>.json and ignores absent or malformed files", () => {
    const root = mkdtempSync(join(tmpdir(), "vcr-machine-"));
    expect(loadMachineRecord(root, "test-host")).toBeUndefined();
    mkdirSync(join(root, "environment"));
    writeFileSync(join(root, "environment/test-host.json"), "{not json");
    expect(loadMachineRecord(root, "test-host")).toBeUndefined();
    writeFileSync(join(root, "environment/test-host.json"), JSON.stringify({ tools: [{ tool_id: "ffmpeg-ffprobe", status: "installed", version: "8.0.1" }] }));
    expect(loadMachineRecord(root, "test-host")).toBeUndefined();
    writeFileSync(join(root, "environment/test-host.json"), JSON.stringify({ ...machine([]), tools: [null, { tool_id: "x" }, { tool_id: "ffmpeg-ffprobe", status: "installed", executable: "/x", version: "8.0.1" }] }));
    expect(loadMachineRecord(root, "test-host")?.tools.map((tool) => tool.tool_id)).toEqual(["ffmpeg-ffprobe"]);
    writeFileSync(join(root, "environment/test-host.json"), JSON.stringify(machine([])));
    expect(loadMachineRecord(root, "test-host")?.hostname).toBe("test-host");
  });
});
