import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { PLAYWRIGHT_VERSION } from "./capture.js";
import { createExample } from "./examples.js";
import { resolveRoots } from "./roots.js";

const roots = resolveRoots({ cwd: process.cwd(), env: {} });
if (!roots.ok) throw new Error(roots.error.message);
const harness = roots.value.harness;

describe("createExample", () => {
  test("copies scene sources with a standalone package.json and prints capture steps", () => {
    const workspace = mkdtempSync(join(tmpdir(), "vcr-example-"));
    const outcome = createExample(harness, workspace, "three-capture", "vcr");
    if (!outcome.ok) throw new Error(outcome.error.message);
    const directory = join(workspace, "examples/three-capture");
    expect(existsSync(join(directory, "scene.html"))).toBe(true);
    for (const harnessOnly of ["capture.ts", "run.sh", "expected", "node_modules"]) expect(existsSync(join(directory, harnessOnly))).toBe(false);
    expect(JSON.parse(readFileSync(join(directory, "package.json"), "utf8"))).toEqual({ name: "example-three-capture", private: true, type: "module", dependencies: { three: "^0.186.1" } });
    expect(outcome.value.nextSteps.at(-1)).toBe("vcr capture examples/three-capture/scene.html --width 1280 --height 720 --fps 30 --verify");
  });

  test("never overwrites an existing example", () => {
    const workspace = mkdtempSync(join(tmpdir(), "vcr-example-"));
    createExample(harness, workspace, "three-capture", "vcr");
    expect(createExample(harness, workspace, "three-capture", "vcr")).toMatchObject({ ok: true, value: { isCreated: false } });
  });

  test("an unknown example fails with EXAMPLE_NOT_FOUND", () => {
    expect(createExample(harness, mkdtempSync(join(tmpdir(), "vcr-example-")), "nope", "vcr")).toMatchObject({ ok: false, error: { code: "EXAMPLE_NOT_FOUND" } });
  });
});

test("the pinned capture runtime matches the Playwright the fixtures were validated with", () => {
  const capturePackage = createRequire(join(harness, "packages/capture/package.json"));
  expect((capturePackage("playwright/package.json") as { version: string }).version).toBe(PLAYWRIGHT_VERSION);
});
